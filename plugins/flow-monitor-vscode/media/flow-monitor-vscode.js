/**
 * flow-monitor-vscode.js — bootstrap & VSCode-specific UI behavior
 *
 * - Subscribes to snapshot pushes from extension
 * - Wires Cytoscape `cxttap` → context menu with AI quick actions
 * - Wires "Send to Agent" button bar in detail panel
 * - Replaces HTTP/SSE methods on the existing TrackerApp instance
 *
 * NOTE: All DOM construction uses createElement + textContent (no innerHTML)
 * to satisfy webview CSP and avoid XSS even though all data is extension-controlled.
 */

(function () {
  const api = window.flowMonitorAPI;
  const bus = window.__flowMonitor;

  function el(tag, opts = {}, children = []) {
    const node = document.createElement(tag);
    if (opts.className) node.className = opts.className;
    if (opts.text != null) node.textContent = String(opts.text);
    if (opts.title) node.title = opts.title;
    if (opts.type) node.type = opts.type;
    if (opts.name) node.name = opts.name;
    if (opts.value != null) node.value = opts.value;
    if (opts.rows) node.rows = opts.rows;
    if (opts.attrs) {
      for (const [k, v] of Object.entries(opts.attrs)) node.setAttribute(k, v);
    }
    if (opts.onClick) node.addEventListener('click', opts.onClick);
    if (opts.onSubmit) node.addEventListener('submit', opts.onSubmit);
    for (const c of children) {
      if (c) node.appendChild(c);
    }
    return node;
  }

  // ── 1. Patch tracker-app SYNCHRONOUSLY (before DOMContentLoaded fires).
  //       window.app already exists because tracker-app.js executed before us.
  function patchTrackerApp() {
    if (!window.app) {
      console.error('[FlowMonitor] window.app missing — script load order broken');
      return;
    }
    const a = window.app;
    const loader = a.loader;

    // Pretend we're in API mode so tracker-editor's DOMContentLoaded handler
    // calls loadFromAPI() automatically (which we redirect to postMessage).
    a.isAPIMode = () => true;

    // Disable SSE — VSCode webview can't reach /api/events.
    a.connectSSE = () => {
      const indicator = document.getElementById('sse-indicator');
      if (indicator) {
        indicator.classList.remove('disconnected');
        indicator.classList.add('connected');
        indicator.title = 'Live workspace sync (postMessage)';
      }
    };

    // loadFromAPI: pull from cached snapshot, await it if not yet arrived.
    loader.loadFromAPI = async function () {
      const snap = bus.snapshot ?? (await waitForSnapshot());
      if (!snap) return false;
      for (const type of ['design', 'mockup', 'feature', 'qa']) {
        if (snap.sources[type]) {
          this.rawSources[type] = snap.sources[type];
          this.originalClones[type] = JSON.parse(JSON.stringify(snap.sources[type]));
          this.bus.emit('file-loaded', {
            type,
            fileName: snap.paths[type] || `${type} (workspace)`,
            data: snap.sources[type],
          });
        }
      }
      if (snap.activity) {
        this.activityLogs = snap.activity;
        this.bus.emit('activity-loaded', snap.activity);
      }
      return true;
    };

    loader.saveToAPI = async function (sourceType) {
      const self = this;
      api.saveSource(sourceType, this.rawSources[sourceType]);
      return new Promise((resolve) => {
        const handler = (msg) => {
          if (msg.source === sourceType) {
            self.bus.emit('save-success', sourceType);
            bus.listeners.saveResult = bus.listeners.saveResult.filter((f) => f !== handler);
            resolve(true);
          }
        };
        bus.on('saveResult', handler);
        setTimeout(() => resolve(true), 3000);
      });
    };

    loader.postTask = async function (task) {
      api.sendAgentAction('free-prompt', null, task?.body || JSON.stringify(task));
      return { ok: true };
    };

    loader.getProjectName = function () {
      return bus.snapshot?.workspaceName || 'Workspace';
    };
  }

  function waitForSnapshot(timeoutMs = 5000) {
    return new Promise((resolve) => {
      if (bus.snapshot) {
        resolve(bus.snapshot);
        return;
      }
      const handler = (snap) => {
        bus.listeners.snapshot = bus.listeners.snapshot.filter((f) => f !== handler);
        resolve(snap);
      };
      bus.on('snapshot', handler);
      setTimeout(() => {
        bus.listeners.snapshot = bus.listeners.snapshot.filter((f) => f !== handler);
        resolve(null);
      }, timeoutMs);
    });
  }

  // Subsequent snapshots (after first launchApp): rebuild + emit graph-rebuilt
  // so tracker-editor's viewManager.refresh listener picks it up.
  bus.on('snapshot', () => {
    if (!window.app) return;
    window.app.loader.loadFromAPI().then(() => {
      const graphData = window.app.buildGraph();
      window.app.bus.emit('graph-rebuilt', graphData);
    });
  });

  bus.on('fileChanged', (evt) => {
    api.log('file-changed', evt.source, evt.file);
    api.requestSnapshot();
  });

  // Apply patches NOW (synchronously, before DOMContentLoaded fires).
  patchTrackerApp();

  // ── 3. Render quick action items (DOM-safe) ──
  function buildActionItem(node, action) {
    const icon = el('span', { className: 'qa-icon', text: action.icon });
    const titleEl = el('div', { className: 'qa-title', text: action.label });
    const descEl = el('div', { className: 'qa-desc', text: action.description });
    const text = el('div', { className: 'qa-text' }, [titleEl, descEl]);

    const sendBtn = el('button', {
      className: 'qa-btn qa-btn-primary',
      text: '→ Send',
      title: 'Send to Claude Code terminal',
      onClick: () => api.sendAgentAction(action.id, node, action.prompt),
    });
    const copyBtn = el('button', {
      className: 'qa-btn',
      text: '⧉',
      title: 'Copy prompt to clipboard',
      onClick: () => api.sendAgentActionToClipboard(action.id, node, action.prompt),
    });
    const buttons = el('div', { className: 'qa-buttons' }, [sendBtn, copyBtn]);

    return el('div', { className: 'qa-item' }, [icon, text, buttons]);
  }

  function renderQuickActions(node) {
    const list = document.getElementById('quick-action-list');
    const bar = document.getElementById('quick-action-bar');
    if (!list || !bar) return;

    list.replaceChildren(el('div', { className: 'qa-loading', text: 'Loading actions…' }));
    bar.classList.remove('hidden');

    api.requestActionsForNode(node);

    const handler = (msg) => {
      if (msg.uid !== node.uid) return;
      list.replaceChildren();
      if (!msg.actions.length) {
        list.appendChild(
          el('div', { className: 'qa-empty', text: 'No actions available for this node type' })
        );
      } else {
        for (const a of msg.actions) {
          list.appendChild(buildActionItem(node, a));
        }
      }
      bus.listeners.actions = bus.listeners.actions.filter((f) => f !== handler);
    };
    bus.on('actions', handler);
  }

  // ── 4. Right-click context menu ──
  function attachContextMenu() {
    if (!window.cy) return;

    window.cy.on('cxttap', 'node', (evt) => {
      const data = evt.target.data();
      const node = window.app.graph.getNode(data.id);
      if (!node) return;
      showContextMenu(evt.originalEvent.clientX, evt.originalEvent.clientY, node);
    });

    window.cy.on('tap', 'node', (evt) => {
      const data = evt.target.data();
      const node = window.app.graph.getNode(data.id);
      if (!node) return;
      window.app.state.select(data.id);
      renderQuickActions(node);
    });

    document.addEventListener('click', () => hideContextMenu());
  }

  function showContextMenu(x, y, node) {
    const menu = document.getElementById('ctx-menu');
    const items = document.getElementById('ctx-menu-items');
    if (!menu || !items) return;

    items.replaceChildren(el('div', { className: 'ctx-loading', text: 'Loading…' }));
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    menu.classList.remove('hidden');

    api.requestActionsForNode(node);

    const handler = (msg) => {
      if (msg.uid !== node.uid) return;
      items.replaceChildren();
      if (!msg.actions.length) {
        items.appendChild(el('div', { className: 'ctx-empty', text: 'No actions for this node' }));
      } else {
        for (const a of msg.actions) {
          const icon = el('span', { className: 'ctx-icon', text: a.icon });
          const label = document.createTextNode(' ' + a.label);
          const btn = el('button', {
            className: 'ctx-item',
            onClick: (ev) => {
              ev.stopPropagation();
              api.sendAgentAction(a.id, node, a.prompt);
              hideContextMenu();
            },
          });
          btn.appendChild(icon);
          btn.appendChild(label);
          items.appendChild(btn);
        }
      }
      // Edit option always available
      const editBtn = el('button', {
        className: 'ctx-item ctx-item-edit',
        text: '✎ Edit node…',
        onClick: (ev) => {
          ev.stopPropagation();
          openInlineEditor(node);
          hideContextMenu();
        },
      });
      items.appendChild(editBtn);
      bus.listeners.actions = bus.listeners.actions.filter((f) => f !== handler);
    };
    bus.on('actions', handler);
  }

  function hideContextMenu() {
    const menu = document.getElementById('ctx-menu');
    if (menu) menu.classList.add('hidden');
  }

  // ── 5. Inline editor for any node ──
  function openInlineEditor(node) {
    const panel = document.getElementById('detail-panel');
    const body = document.getElementById('detail-body');
    const title = document.getElementById('detail-title');
    if (!panel || !body || !title) return;

    panel.classList.remove('hidden');
    title.textContent = `Edit: ${node.label}`;

    const meta = node.metadata || {};
    const editable = pickEditableFields(node);

    body.replaceChildren();
    const form = el('form', { className: 'inline-edit-form' });

    for (const f of editable) {
      const labelText = el('span', { className: 'inline-edit-label', text: f.label });
      let input;
      if (f.type === 'select') {
        input = el('select', { name: f.key });
        for (const opt of f.options || []) {
          const o = el('option', { value: opt, text: opt });
          if (meta[f.key] === opt) o.selected = true;
          input.appendChild(o);
        }
      } else if (f.type === 'textarea') {
        input = el('textarea', { name: f.key, rows: 3 });
        input.value = String(meta[f.key] ?? '');
      } else {
        input = el('input', { type: f.type, name: f.key });
        input.value = String(meta[f.key] ?? '');
      }
      const field = el('label', { className: 'inline-edit-field' }, [labelText, input]);
      form.appendChild(field);
    }

    const submitBtn = el('button', {
      className: 'qa-btn qa-btn-primary',
      type: 'submit',
      text: 'Save',
    });
    const cancelBtn = el('button', {
      className: 'qa-btn',
      type: 'button',
      text: 'Cancel',
      onClick: () => window.app.bus.emit('selection-changed', { selected: node.uid }),
    });
    const buttons = el('div', { className: 'inline-edit-buttons' }, [submitBtn, cancelBtn]);
    form.appendChild(buttons);

    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const fd = new FormData(form);
      const updates = {};
      for (const f of editable) {
        let v = fd.get(f.key);
        if (f.type === 'number') v = Number(v);
        updates[f.key] = v;
      }
      window.app.updateNodeInSource(node.uid, updates);
      window.app.loader.saveToAPI(node.source).then(() => {
        api.requestSnapshot();
      });
    });

    body.appendChild(form);
  }

  function pickEditableFields(node) {
    if (node.source === 'feature' && node.nodeType === 'feature') {
      return [
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'critical'] },
        { key: 'complexity', label: 'Complexity', type: 'select', options: ['simple', 'medium', 'complex'] },
        { key: 'status', label: 'Status', type: 'select', options: ['pending', 'in_progress', 'passed', 'failed'] },
        { key: 'epic', label: 'Epic', type: 'text' },
        { key: 'layer', label: 'Layer', type: 'text' },
      ];
    }
    if (node.source === 'mockup' && node.nodeType === 'page') {
      return [
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'name_th', label: 'Name (TH)', type: 'text' },
        { key: 'url', label: 'URL', type: 'text' },
        { key: 'category', label: 'Category', type: 'text' },
        { key: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high'] },
        { key: 'status', label: 'Status', type: 'select', options: ['pending', 'in_progress', 'completed'] },
      ];
    }
    if (node.source === 'design' && node.nodeType === 'entity') {
      return [
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'name_th', label: 'Name (TH)', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'status', label: 'Status', type: 'select', options: ['draft', 'defined', 'completed'] },
      ];
    }
    if (node.source === 'qa' && node.nodeType === 'scenario') {
      return [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'module', label: 'Module', type: 'text' },
        { key: 'url', label: 'URL', type: 'text' },
        { key: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'critical'] },
        { key: 'status', label: 'Status', type: 'select', options: ['pending', 'in_progress', 'passed', 'failed'] },
      ];
    }
    return [{ key: 'label', label: 'Label', type: 'text' }];
  }

  // ── 6. Attach context menu once Cytoscape is ready (after first launchApp) ──
  function bootContextMenu() {
    const tryAttach = setInterval(() => {
      if (window.cy) {
        attachContextMenu();
        clearInterval(tryAttach);
      }
    }, 100);
    // Stop polling after 30s regardless
    setTimeout(() => clearInterval(tryAttach), 30000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootContextMenu);
  } else {
    bootContextMenu();
  }
})();
