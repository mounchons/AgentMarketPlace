/**
 * vscode-bridge.js — replaces fetch('/api/...') and EventSource with vscode webview postMessage.
 *
 * Loaded BEFORE tracker-app.js so we can monkey-patch FileLoader.loadFromAPI / saveToAPI / postTask
 * once tracker-app.js executes (the prototype patches apply lazily after class definition).
 */

(function () {
  // eslint-disable-next-line no-undef
  const vscode = acquireVsCodeApi();

  // pending request resolvers, keyed by message type + nonce
  const pending = new Map();
  let nonceCounter = 0;
  const nextNonce = () => `n${++nonceCounter}`;

  function send(type, payload = {}) {
    vscode.postMessage({ type, ...payload });
  }

  function request(sendType, payload, expectType) {
    return new Promise((resolve) => {
      const nonce = nextNonce();
      pending.set(`${expectType}:${nonce}`, resolve);
      vscode.postMessage({ type: sendType, nonce, ...payload });
      // Snapshot/actions/save responses are 1:1 — extension echoes the latest snapshot or save-result.
      // For simplicity, fall back to "next message of expectType" if extension doesn't echo nonce.
      pending.set(`${expectType}:any`, (data) => {
        const r = pending.get(`${expectType}:${nonce}`);
        if (r) {
          pending.delete(`${expectType}:${nonce}`);
          r(data);
        }
      });
    });
  }

  // === Cached snapshot ===
  window.__flowMonitor = {
    snapshot: null,
    quickActions: [],
    actionsByUid: new Map(),
    listeners: { snapshot: [], fileChanged: [], saveResult: [], actions: [] },
    on(event, fn) { this.listeners[event].push(fn); },
    emit(event, data) { for (const fn of this.listeners[event]) fn(data); },
  };

  window.addEventListener('message', (event) => {
    const msg = event.data;
    if (!msg || typeof msg.type !== 'string') return;

    if (msg.type === 'snapshot') {
      window.__flowMonitor.snapshot = msg.snapshot;
      if (Array.isArray(msg.quickActions)) {
        window.__flowMonitor.quickActions = msg.quickActions;
      }
      window.__flowMonitor.emit('snapshot', msg.snapshot);
      const handler = pending.get('snapshot:any');
      if (handler) handler(msg.snapshot);
    } else if (msg.type === 'file-changed') {
      window.__flowMonitor.emit('fileChanged', msg);
    } else if (msg.type === 'save-result') {
      window.__flowMonitor.emit('saveResult', msg);
      const handler = pending.get('save-result:any');
      if (handler) handler(msg);
    } else if (msg.type === 'actions-for-node') {
      window.__flowMonitor.actionsByUid.set(msg.uid, msg.actions);
      window.__flowMonitor.emit('actions', msg);
    }
  });

  // Public API for flow-monitor-vscode.js
  window.flowMonitorAPI = {
    requestSnapshot() { send('request-snapshot'); },
    saveSource(source, data) { send('save-source', { source, data }); },
    sendAgentAction(actionId, node, prompt) {
      send('agent-action', { actionId, node, prompt });
    },
    sendAgentActionToClipboard(actionId, node, prompt) {
      send('agent-action-clipboard', { actionId, node, prompt });
    },
    requestActionsForNode(node) { send('request-actions', { node }); },
    openFile(relPath) { send('open-file', { path: relPath }); },
    log(...args) { send('log', { args }); },
    ready() { send('ready'); },
  };

  // Signal "ready" once DOM is parsed
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.flowMonitorAPI.ready());
  } else {
    window.flowMonitorAPI.ready();
  }
})();
