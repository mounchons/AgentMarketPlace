# Monitor Plugin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a monitor plugin that deploys an interactive dashboard to any project, with a local Node.js server for two-way data sync (REST API + SSE file watching) and Claude Code task integration.

**Architecture:** Plugin templates are copied to `.monitor/` in the project via `/monitor-init`. A Node.js server (`monitor-server.js`) serves the GUI, provides REST API for reading/writing *list.json files, watches files via chokidar, and pushes changes to the browser via SSE. The GUI (adapted from .tracker-gui) auto-detects API mode when served from localhost.

**Tech Stack:** Node.js (built-in http), chokidar (file watcher), Cytoscape.js + Tailwind CDN (GUI), SSE (live updates)

**Spec:** `docs/superpowers/specs/2026-04-14-monitor-plugin-design.md`

**Existing code to reuse:**
- `.tracker-gui/index.html` — GUI shell
- `.tracker-gui/tracker-app.js` — data model, graph builder, file loader
- `.tracker-gui/tracker-views.js` — graph, tree, board, table views
- `.tracker-gui/tracker-editor.js` — detail panel, edit forms, save manager
- `.tracker-gui/tracker-style.css` — all styles

---

## File Map

### New files (plugin structure)
| File | Responsibility |
|------|---------------|
| `plugins/monitor/.claude-plugin/plugin.json` | Plugin metadata |
| `plugins/monitor/commands/monitor-init.md` | Deploy to project command |
| `plugins/monitor/commands/monitor.md` | Start server command |
| `plugins/monitor/commands/monitor-task.md` | Read task queue command |
| `plugins/monitor/hooks/hooks.json` | SessionStart hook |
| `plugins/monitor/skills/monitor/SKILL.md` | Main skill definition |
| `plugins/monitor/README.md` | Plugin documentation |

### New files (templates — deployed to project)
| File | Responsibility |
|------|---------------|
| `plugins/monitor/skills/monitor/templates/monitor-server.js` | Node.js API server + file watcher + SSE |
| `plugins/monitor/skills/monitor/templates/package.json` | chokidar dependency |

### Existing files to copy + modify into templates
| Source | Destination | Changes |
|--------|------------|---------|
| `.tracker-gui/index.html` | `templates/index.html` | Add SSE status indicator, activity timeline placeholder |
| `.tracker-gui/tracker-app.js` | `templates/tracker-app.js` | Add Mode D (API client), SSE listener, activity log parser |
| `.tracker-gui/tracker-views.js` | `templates/tracker-views.js` | No changes |
| `.tracker-gui/tracker-editor.js` | `templates/tracker-editor.js` | Add "Send to Claude" button, task queue POST |
| `.tracker-gui/tracker-style.css` | `templates/tracker-style.css` | Add activity timeline + SSE indicator styles |

---

## Task 1: Plugin Scaffold

**Files:**
- Create: `plugins/monitor/.claude-plugin/plugin.json`
- Create: `plugins/monitor/README.md`

- [ ] **Step 1: Create plugin.json**

```json
{
  "name": "monitor",
  "description": "Interactive dashboard for cross-plugin workflow visualization with live refresh, editing, and Claude Code task integration",
  "version": "1.0.0",
  "author": {
    "name": "Mounchons"
  }
}
```

- [ ] **Step 2: Create README.md**

Write a concise README with: overview, commands list (`/monitor-init`, `/monitor`, `/monitor-task`), requirements (Node.js), and quick start.

- [ ] **Step 3: Create directory structure**

```bash
mkdir -p plugins/monitor/.claude-plugin
mkdir -p plugins/monitor/commands
mkdir -p plugins/monitor/hooks
mkdir -p plugins/monitor/skills/monitor/templates
```

- [ ] **Step 4: Commit**

```bash
git add plugins/monitor/.claude-plugin/plugin.json plugins/monitor/README.md
git commit -m "feat(monitor): scaffold plugin structure"
```

---

## Task 2: monitor-server.js

**Files:**
- Create: `plugins/monitor/skills/monitor/templates/monitor-server.js`
- Create: `plugins/monitor/skills/monitor/templates/package.json`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "monitor-server",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "node monitor-server.js"
  },
  "dependencies": {
    "chokidar": "^3.6.0"
  }
}
```

- [ ] **Step 2: Write monitor-server.js — config loader + static file server**

The server reads `config.json` from its own directory, then serves static files (index.html, *.js, *.css) for any GET request that doesn't start with `/api/`.

MIME types to handle: `.html` → `text/html`, `.js` → `text/javascript`, `.css` → `text/css`, `.json` → `application/json`.

```javascript
const http = require('http');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

const DIR = __dirname;
const configPath = path.join(DIR, 'config.json');
let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const PORT = config.port || 3400;

const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json' };

function serveStatic(req, res) {
  const filePath = path.join(DIR, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  if (!fs.existsSync(filePath)) { res.writeHead(404); res.end('Not found'); return; }
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
  fs.createReadStream(filePath).pipe(res);
}
```

- [ ] **Step 3: Write API endpoints — GET /api/data and GET /api/data/:source**

Read each *list.json path from config.paths. Return `{ design: {...}, mockup: {...}, feature: {...}, qa: {...}, activity: [...] }`. For activity logs, parse each file in config.activity_logs (JSON array or markdown text). Missing files return null.

```javascript
function resolvePath(rel) { return path.resolve(DIR, rel); }

function readJSON(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch { return null; }
}

function readActivityLogs() {
  const logs = [];
  for (const logPath of config.activity_logs || []) {
    const abs = resolvePath(logPath);
    if (!fs.existsSync(abs)) continue;
    const content = fs.readFileSync(abs, 'utf8');
    if (logPath.endsWith('.json')) {
      try { logs.push(...JSON.parse(content)); } catch {}
    } else {
      logs.push({ type: 'markdown', file: logPath, content: content.slice(0, 2000) });
    }
  }
  return logs.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
}

function handleGetData(req, res, source) {
  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  if (source) {
    const p = config.paths[source];
    res.end(JSON.stringify(p ? readJSON(resolvePath(p)) : null));
  } else {
    const data = {};
    for (const [key, rel] of Object.entries(config.paths || {})) {
      data[key] = readJSON(resolvePath(rel));
    }
    data.activity = readActivityLogs();
    res.end(JSON.stringify(data));
  }
}
```

- [ ] **Step 4: Write API endpoint — PUT /api/data/:source**

Read request body, parse as JSON, write to the corresponding file path. Return `{ok: true}`.

```javascript
function handlePutData(req, res, source) {
  const rel = config.paths[source];
  if (!rel) { res.writeHead(404); res.end('Unknown source'); return; }
  let body = '';
  req.on('data', c => body += c);
  req.on('end', () => {
    try {
      JSON.parse(body); // validate JSON
      fs.writeFileSync(resolvePath(rel), body, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
  });
}
```

- [ ] **Step 5: Write API endpoints — POST /api/task and GET /api/tasks**

Task queue file: `task-queue.json` in the server directory.

```javascript
const taskQueuePath = path.join(DIR, 'task-queue.json');

function readTaskQueue() {
  try { return JSON.parse(fs.readFileSync(taskQueuePath, 'utf8')); }
  catch { return { tasks: [] }; }
}

function handleGetTasks(req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(readTaskQueue()));
}

function handlePostTask(req, res) {
  let body = '';
  req.on('data', c => body += c);
  req.on('end', () => {
    try {
      const task = JSON.parse(body);
      const queue = readTaskQueue();
      const id = 'task-' + String(queue.tasks.length + 1).padStart(3, '0');
      queue.tasks.push({ id, created_at: new Date().toISOString(), status: 'pending', completed_at: null, ...task });
      fs.writeFileSync(taskQueuePath, JSON.stringify(queue, null, 2), 'utf8');
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, id }));
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
  });
}
```

- [ ] **Step 6: Write SSE endpoint — GET /api/events**

Keep connections open. Push `data: {...}\n\n` on file changes. Heartbeat every 30s.

```javascript
const sseClients = new Set();

function handleSSE(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive', 'Access-Control-Allow-Origin': '*' });
  res.write('data: {"type":"connected"}\n\n');
  sseClients.add(res);
  req.on('close', () => sseClients.delete(res));
}

function broadcast(event) {
  const msg = `data: ${JSON.stringify(event)}\n\n`;
  for (const client of sseClients) { try { client.write(msg); } catch {} }
}

setInterval(() => broadcast({ type: 'heartbeat', timestamp: new Date().toISOString() }), 30000);
```

- [ ] **Step 7: Write file watcher + HTTP router + server start**

Watch all paths from config. Debounce 500ms. Route requests to handlers.

```javascript
// File watcher
const watchPaths = [];
for (const rel of Object.values(config.paths || {})) { watchPaths.push(resolvePath(rel)); }
for (const rel of config.activity_logs || []) { watchPaths.push(resolvePath(rel)); }
watchPaths.push(taskQueuePath);

const validPaths = watchPaths.filter(p => fs.existsSync(p) || fs.existsSync(path.dirname(p)));

let debounceTimer = null;
const watcher = chokidar.watch(validPaths, { ignoreInitial: true, awaitWriteFinish: { stabilityThreshold: 300 } });
watcher.on('change', (filePath) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const source = Object.entries(config.paths || {}).find(([k, v]) => resolvePath(v) === filePath);
    broadcast({ type: 'file-changed', source: source ? source[0] : 'other', file: path.basename(filePath), timestamp: new Date().toISOString() });
  }, 500);
});

// HTTP router
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // CORS preflight
  if (req.method === 'OPTIONS') { res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,PUT,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }); res.end(); return; }

  if (pathname === '/api/events') return handleSSE(req, res);
  if (pathname === '/api/data' && req.method === 'GET') return handleGetData(req, res);
  if (pathname.startsWith('/api/data/') && req.method === 'GET') return handleGetData(req, res, pathname.split('/')[3]);
  if (pathname.startsWith('/api/data/') && req.method === 'PUT') return handlePutData(req, res, pathname.split('/')[3]);
  if (pathname === '/api/tasks' && req.method === 'GET') return handleGetTasks(req, res);
  if (pathname === '/api/task' && req.method === 'POST') return handlePostTask(req, res);
  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Monitor server running at http://localhost:${PORT}`);
  console.log(`Watching ${validPaths.length} files for changes`);
});
```

- [ ] **Step 8: Verify server runs standalone**

```bash
cd plugins/monitor/skills/monitor/templates
npm install
echo '{"port":3400,"paths":{},"activity_logs":[]}' > config.json
echo '{"tasks":[]}' > task-queue.json
node monitor-server.js
# Expected: "Monitor server running at http://localhost:3400"
# Ctrl+C to stop
rm config.json task-queue.json
```

- [ ] **Step 9: Commit**

```bash
git add plugins/monitor/skills/monitor/templates/monitor-server.js plugins/monitor/skills/monitor/templates/package.json
git commit -m "feat(monitor): add Node.js API server with file watcher + SSE"
```

---

## Task 3: Copy + Adapt GUI Templates

**Files:**
- Copy: `.tracker-gui/index.html` → `plugins/monitor/skills/monitor/templates/index.html`
- Copy: `.tracker-gui/tracker-views.js` → `plugins/monitor/skills/monitor/templates/tracker-views.js`
- Copy: `.tracker-gui/tracker-style.css` → `plugins/monitor/skills/monitor/templates/tracker-style.css`

These 3 files need minimal or no changes. Copy them as-is.

- [ ] **Step 1: Copy unchanged files**

```bash
cp .tracker-gui/tracker-views.js plugins/monitor/skills/monitor/templates/
cp .tracker-gui/tracker-style.css plugins/monitor/skills/monitor/templates/
cp .tracker-gui/index.html plugins/monitor/skills/monitor/templates/
```

- [ ] **Step 2: Modify templates/index.html — add SSE indicator + activity section**

In the sidebar, after the stats section and before the legend section, add an activity timeline placeholder:

```html
<!-- Activity Timeline -->
<div class="sidebar-section">
  <div class="sidebar-label">Activity</div>
  <div id="activity-timeline" class="activity-timeline"></div>
</div>
```

In the topbar-right, add an SSE connection indicator before the layout toggle button:

```html
<span id="sse-indicator" class="sse-dot disconnected" title="Server connection"></span>
```

- [ ] **Step 3: Modify templates/tracker-style.css — add activity + SSE styles**

Append to the CSS file:

```css
/* Activity Timeline */
.activity-timeline { display: flex; flex-direction: column; gap: 4px; max-height: 200px; overflow-y: auto; }
.activity-item { display: flex; gap: 6px; font-size: 11px; color: #a5b4fc; padding: 3px 0; }
.activity-time { color: rgba(165,155,255,0.5); white-space: nowrap; min-width: 40px; }
.activity-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* SSE indicator */
.sse-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.sse-dot.connected { background: #10b981; }
.sse-dot.disconnected { background: #ef4444; }

/* Send to Claude dropdown */
.claude-dropdown { position: relative; }
.claude-menu { position: absolute; top: 100%; right: 0; background: white; border: 1px solid var(--mp-border); border-radius: 6px; box-shadow: var(--mp-shadow-lg); z-index: 10; min-width: 200px; display: none; }
.claude-menu.open { display: block; }
.claude-menu-item { padding: 8px 12px; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 8px; }
.claude-menu-item:hover { background: #f1f5f9; }
.claude-menu-item:first-child { border-radius: 6px 6px 0 0; }
.claude-menu-item:last-child { border-radius: 0 0 6px 6px; }

/* Toast */
.toast { position: fixed; bottom: 16px; right: 16px; background: #1e293b; color: white; padding: 8px 16px; border-radius: 8px; font-size: 13px; z-index: 200; animation: toast-in 0.3s; }
@keyframes toast-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
```

- [ ] **Step 4: Commit**

```bash
git add plugins/monitor/skills/monitor/templates/index.html plugins/monitor/skills/monitor/templates/tracker-views.js plugins/monitor/skills/monitor/templates/tracker-style.css
git commit -m "feat(monitor): copy + adapt GUI templates with SSE indicator + activity timeline"
```

---

## Task 4: Adapt tracker-app.js — Mode D (API Client)

**Files:**
- Copy + Modify: `.tracker-gui/tracker-app.js` → `plugins/monitor/skills/monitor/templates/tracker-app.js`

- [ ] **Step 1: Copy base file**

```bash
cp .tracker-gui/tracker-app.js plugins/monitor/skills/monitor/templates/
```

- [ ] **Step 2: Add Mode D to FileLoader class**

Add method `loadFromAPI()` that fetches `GET /api/data`, parses the response, and stores each source. Also add `saveToAPI(sourceType)` that does `PUT /api/data/:source`.

After the `loadDemoData()` method in FileLoader, add:

```javascript
async loadFromAPI() {
  try {
    const res = await fetch('/api/data');
    const data = await res.json();
    for (const type of ['design', 'mockup', 'feature', 'qa']) {
      if (data[type]) {
        this.rawSources[type] = data[type];
        this.originalClones[type] = JSON.parse(JSON.stringify(data[type]));
        this.bus.emit('file-loaded', { type, fileName: `${type} (server)`, data: data[type] });
      }
    }
    if (data.activity) {
      this.activityLogs = data.activity;
      this.bus.emit('activity-loaded', data.activity);
    }
    return true;
  } catch (e) {
    console.error('API load failed:', e);
    return false;
  }
}

async saveToAPI(sourceType) {
  const json = JSON.stringify(this.rawSources[sourceType], null, 2);
  try {
    const res = await fetch(`/api/data/${sourceType}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: json });
    const result = await res.json();
    if (result.ok) this.bus.emit('save-success', sourceType);
    return result.ok;
  } catch (e) {
    console.error('API save failed:', e);
    return false;
  }
}

async postTask(task) {
  try {
    const res = await fetch('/api/task', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(task) });
    return await res.json();
  } catch (e) {
    console.error('Task post failed:', e);
    return null;
  }
}
```

- [ ] **Step 3: Add SSE listener to TrackerApp class**

After the `_updateStats()` method, add `connectSSE()`:

```javascript
connectSSE() {
  if (typeof EventSource === 'undefined') return;
  const es = new EventSource('/api/events');
  const indicator = document.getElementById('sse-indicator');

  es.onopen = () => { if (indicator) { indicator.classList.remove('disconnected'); indicator.classList.add('connected'); indicator.title = 'Connected to server'; } };

  es.onmessage = (evt) => {
    try {
      const event = JSON.parse(evt.data);
      if (event.type === 'file-changed') {
        this.loader.loadFromAPI().then(() => {
          const graphData = this.buildGraph();
          this.bus.emit('graph-rebuilt', graphData);
        });
      }
    } catch {}
  };

  es.onerror = () => { if (indicator) { indicator.classList.remove('connected'); indicator.classList.add('disconnected'); indicator.title = 'Disconnected from server'; } };
}
```

- [ ] **Step 4: Add API mode detection to TrackerApp**

Add a method `isAPIMode()` and modify the initialization:

```javascript
isAPIMode() {
  return window.location.hostname === 'localhost' && !window.location.protocol.startsWith('file');
}
```

- [ ] **Step 5: Commit**

```bash
git add plugins/monitor/skills/monitor/templates/tracker-app.js
git commit -m "feat(monitor): add Mode D API client + SSE listener to tracker-app"
```

---

## Task 5: Adapt tracker-editor.js — Send to Claude + API Save

**Files:**
- Copy + Modify: `.tracker-gui/tracker-editor.js` → `plugins/monitor/skills/monitor/templates/tracker-editor.js`

- [ ] **Step 1: Copy base file**

```bash
cp .tracker-gui/tracker-editor.js plugins/monitor/skills/monitor/templates/
```

- [ ] **Step 2: Add "Send to Claude" button to DetailPanel._renderDetail()**

After the connected nodes section at the end of `_renderDetail()`, before the closing of the method, add a "Send to Claude" section:

```javascript
// Send to Claude section
if (['feature', 'page', 'scenario', 'entity'].includes(node.nodeType)) {
  const claudeSection = this._createSection('Send to Claude');
  const dropdown = document.createElement('div');
  dropdown.className = 'claude-dropdown';

  const btn = document.createElement('button');
  btn.className = 'edit-btn edit-btn-save';
  btn.style.width = '100%';
  btn.textContent = 'Send to Claude \u25BE';
  btn.addEventListener('click', () => menu.classList.toggle('open'));

  const menu = document.createElement('div');
  menu.className = 'claude-menu';

  const commands = this._getCommandsForNode(node);
  for (const cmd of commands) {
    const item = document.createElement('div');
    item.className = 'claude-menu-item';
    item.textContent = cmd.label;
    item.addEventListener('click', () => {
      menu.classList.remove('open');
      if (cmd.action === 'copy') {
        navigator.clipboard.writeText(cmd.command).then(() => showToast('Copied: ' + cmd.command));
      } else if (cmd.action === 'queue') {
        app.loader.postTask({ type: cmd.type, target: node.uid, label: node.label, source_node: node.uid, command_hint: cmd.command }).then(r => {
          if (r && r.ok) showToast('Task queued: ' + cmd.command);
        });
      }
    });
    menu.appendChild(item);
  }

  dropdown.appendChild(btn);
  dropdown.appendChild(menu);
  claudeSection.appendChild(dropdown);
  this.bodyEl.appendChild(claudeSection);

  // Close menu on outside click
  document.addEventListener('click', (e) => { if (!dropdown.contains(e.target)) menu.classList.remove('open'); });
}
```

- [ ] **Step 3: Add _getCommandsForNode() helper**

```javascript
_getCommandsForNode(node) {
  const commands = [];
  if (node.nodeType === 'feature') {
    const fid = node.metadata.id;
    commands.push({ label: '\uD83D\uDCCB Copy: /continue #' + fid, action: 'copy', command: '/continue #' + fid });
    commands.push({ label: '\uD83D\uDCE4 Queue: implement', action: 'queue', type: 'implement', command: '/continue #' + fid });
    commands.push({ label: '\uD83D\uDD0D Queue: review', action: 'queue', type: 'review', command: '/review #' + fid });
  } else if (node.nodeType === 'page') {
    commands.push({ label: '\uD83D\uDCCB Copy: /create-mockup ' + node.name, action: 'copy', command: '/create-mockup ' + node.name });
    commands.push({ label: '\uD83D\uDCE4 Queue: create mockup', action: 'queue', type: 'create-mockup', command: '/create-mockup ' + node.name });
  } else if (node.nodeType === 'scenario') {
    commands.push({ label: '\uD83D\uDCCB Copy: /qa-run ' + node.id, action: 'copy', command: '/qa-run ' + node.id });
    commands.push({ label: '\uD83D\uDCE4 Queue: run test', action: 'queue', type: 'run-test', command: '/qa-run ' + node.id });
  } else if (node.nodeType === 'entity') {
    commands.push({ label: '\uD83D\uDCCB Copy: /create-design-doc', action: 'copy', command: '/edit-section er_diagram' });
  }
  return commands;
}
```

- [ ] **Step 4: Add showToast() helper function**

Add as standalone function before the DOMContentLoaded block:

```javascript
function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
```

- [ ] **Step 5: Modify SaveManager.saveAll() for API mode**

Replace the `saveAll()` method body to check for API mode:

```javascript
async saveAll() {
  const dirty = this.app.state.dirty;
  if (dirty.size === 0) { showToast('No unsaved changes'); return; }
  if (this.app.isAPIMode()) {
    for (const source of dirty) {
      const ok = await this.app.loader.saveToAPI(source);
      if (ok) this.app.state.clearDirty(source);
    }
    showToast('Saved to server');
  } else {
    for (const source of dirty) {
      this.app.loader.downloadJSON(source);
    }
    dirty.clear();
    this.app.bus.emit('dirty-changed', dirty);
    showToast('Files downloaded');
  }
}
```

- [ ] **Step 6: Modify DOMContentLoaded to auto-detect API mode**

In the DOMContentLoaded block, after `saveManager = new SaveManager(app)`, add API mode auto-init:

```javascript
// Auto-detect API mode
if (app.isAPIMode()) {
  app.loader.loadFromAPI().then(ok => {
    if (ok) {
      launchApp();
      app.connectSSE();
      // Render activity timeline
      app.bus.on('activity-loaded', renderActivityTimeline);
      app.bus.on('graph-rebuilt', (graphData) => viewManager.refresh(graphData));
    }
  });
} 
// else: landing screen handles file loading (existing behavior)
```

- [ ] **Step 7: Add renderActivityTimeline() function**

```javascript
function renderActivityTimeline(logs) {
  const container = document.getElementById('activity-timeline');
  if (!container) return;
  container.textContent = '';
  const items = (logs || []).slice(0, 10);
  if (items.length === 0) {
    container.textContent = 'No activity yet';
    container.style.color = 'rgba(165,155,255,0.3)';
    container.style.fontSize = '11px';
    return;
  }
  for (const log of items) {
    const item = document.createElement('div');
    item.className = 'activity-item';
    const time = document.createElement('span');
    time.className = 'activity-time';
    if (log.timestamp) {
      const d = new Date(log.timestamp);
      time.textContent = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    }
    const text = document.createElement('span');
    text.className = 'activity-text';
    text.textContent = log.command ? `${log.command} ${log.details ? JSON.stringify(log.details).slice(0, 50) : ''}` : (log.content ? log.content.slice(0, 60) : '...');
    item.appendChild(time);
    item.appendChild(text);
    container.appendChild(item);
  }
}
```

- [ ] **Step 8: Commit**

```bash
git add plugins/monitor/skills/monitor/templates/tracker-editor.js
git commit -m "feat(monitor): add Send to Claude dropdown + API save + activity timeline"
```

---

## Task 6: Commands — monitor-init, monitor, monitor-task

**Files:**
- Create: `plugins/monitor/commands/monitor-init.md`
- Create: `plugins/monitor/commands/monitor.md`
- Create: `plugins/monitor/commands/monitor-task.md`

- [ ] **Step 1: Write monitor-init.md**

```markdown
---
description: Deploy monitor dashboard to current project
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*)
---
# /monitor-init — Deploy Monitor Dashboard

## Steps

1. **Scan project** for tracking files:
   - Check existence of: `design_doc_list.json`, `.mockups/mockup_list.json`, `feature_list.json`, `qa-tracker.json`
   - Check existence of: `.brain/activity-log.json`, `.bigbrain/activity-log.json`, `.agent/progress.md`

2. **Create `.monitor/` directory** at project root

3. **Copy template files** from `${CLAUDE_PLUGIN_ROOT}/skills/monitor/templates/` to `.monitor/`:
   - `index.html`, `tracker-app.js`, `tracker-views.js`, `tracker-editor.js`, `tracker-style.css`
   - `monitor-server.js`, `package.json`

4. **Generate `config.json`** with paths to files that exist:
   ```json
   {
     "port": 3400,
     "paths": { only include keys where file exists },
     "activity_logs": [ only include paths where file exists ],
     "auto_open": true
   }
   ```
   Use relative paths from `.monitor/` (prefix with `../`)

5. **Create empty `task-queue.json`**: `{"tasks":[]}`

6. **Run `npm install`** in `.monitor/`

7. **Add `.monitor/` to `.gitignore`** if not already present

8. **Display summary**:
   ```
   Monitor deployed to .monitor/

   Sources found:
     design_doc_list.json    ✓ (or ✗)
     mockup_list.json        ✓ (or ✗)
     feature_list.json       ✓ (or ✗)
     qa-tracker.json         ✓ (or ✗)

   Activity logs:
     .brain/activity-log     ✓ (or ✗)
     .agent/progress.md      ✓ (or ✗)

   Run /monitor to start the dashboard.
   ```
```

- [ ] **Step 2: Write monitor.md**

```markdown
---
description: Start monitor dashboard server and open browser
allowed-tools: Bash(*)
---
# /monitor — Start Monitor Dashboard

## Input
$ARGUMENTS (optional: --port=XXXX)

## Steps

1. Check `.monitor/` directory exists. If not: display "Run /monitor-init first" and stop.

2. Check `.monitor/node_modules/` exists. If not: run `cd .monitor && npm install`

3. Parse port from $ARGUMENTS if provided (default 3400)

4. Start server in background:
   ```bash
   cd .monitor && node monitor-server.js &
   ```

5. Wait 1 second for server to start

6. Auto-open browser:
   - Windows: `start http://localhost:PORT`
   - Mac: `open http://localhost:PORT`
   - Linux: `xdg-open http://localhost:PORT`

7. Display:
   ```
   Monitor running at http://localhost:PORT
   Press Ctrl+C or close terminal to stop.
   ```
```

- [ ] **Step 3: Write monitor-task.md**

```markdown
---
description: Read and execute tasks from monitor task queue
allowed-tools: Bash(*), Read(*), Write(*), Edit(*)
---
# /monitor-task — Execute Queued Tasks

## Steps

1. Read `.monitor/task-queue.json`

2. Filter tasks with `status: "pending"`

3. If no pending tasks: display "No pending tasks in queue" and stop

4. Display pending tasks:
   ```
   Pending tasks from Monitor:
   1. [task-001] implement: /continue #5 — "GET /api/users - List all"
   2. [task-002] review: /review #3 — "Create User entity"
   
   Which task to execute? (number or 'all')
   ```

5. Execute chosen task based on type:
   - `implement` → follow the /continue workflow for the referenced feature
   - `review` → follow the /review workflow for the referenced feature
   - `create-scenario` → run /qa-create-scenario --auto
   - `create-mockup` → run /create-mockup with the page name
   - `edit-section` → run /edit-section with the section name

6. After execution, update task in `.monitor/task-queue.json`:
   - Set `status: "completed"`
   - Set `completed_at` to current ISO timestamp

7. Display: "Task [ID] completed. Monitor will auto-refresh."
```

- [ ] **Step 4: Commit**

```bash
git add plugins/monitor/commands/
git commit -m "feat(monitor): add monitor-init, monitor, monitor-task commands"
```

---

## Task 7: Hook + SKILL.md

**Files:**
- Create: `plugins/monitor/hooks/hooks.json`
- Create: `plugins/monitor/skills/monitor/SKILL.md`

- [ ] **Step 1: Write hooks.json**

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume",
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Monitor plugin is active. On session start:\n\n1. Check if `.monitor/task-queue.json` exists at project root\n2. If it exists: read it and count tasks with status 'pending'\n3. If pending tasks > 0: display 'Monitor: N pending task(s) — run /monitor-task to execute'\n4. If no pending tasks or file missing: do nothing (silent)\n5. NEVER auto-start the monitor server. User must run /monitor manually.\n\nALL responses must be in Thai language."
          }
        ]
      }
    ]
  }
}
```

- [ ] **Step 2: Write SKILL.md**

```markdown
---
name: monitor
description: "Interactive dashboard for cross-plugin workflow visualization with live refresh, editing, and Claude Code task integration. Serves a web GUI that shows design docs, mockups, features, and QA tests as an interconnected graph."
version: 1.0.0
user_invocable: true
---
# Monitor — Cross-Plugin Workflow Dashboard

## Commands

- `/monitor-init` — Deploy dashboard to current project (.monitor/ directory)
- `/monitor` — Start the dashboard server and open browser
- `/monitor-task` — Execute pending tasks from the dashboard queue

## How It Works

1. User runs `/monitor-init` to deploy the dashboard files to `.monitor/`
2. User runs `/monitor` to start the Node.js server (port 3400)
3. Browser opens with interactive graph showing all *list.json data
4. User can view, edit, and add nodes from the browser
5. Changes save back to actual JSON files via REST API
6. When Claude Code modifies JSON files, browser auto-refreshes via SSE
7. User can send tasks to Claude Code from the browser (clipboard or queue)
8. User runs `/monitor-task` to pick up queued tasks
```

- [ ] **Step 3: Commit**

```bash
git add plugins/monitor/hooks/ plugins/monitor/skills/
git commit -m "feat(monitor): add SessionStart hook + SKILL.md"
```

---

## Task 8: Register Plugin + Verification

**Files:**
- Modify: `.claude-plugin/marketplace.json` (add monitor plugin entry)

- [ ] **Step 1: Add monitor to marketplace.json**

Add entry to the plugins array in `.claude-plugin/marketplace.json`:
```json
{
  "name": "monitor",
  "description": "Interactive dashboard for cross-plugin workflow visualization with live refresh and Claude Code task integration",
  "path": "plugins/monitor"
}
```

- [ ] **Step 2: Verify plugin structure is complete**

```bash
find plugins/monitor -type f | sort
```

Expected output:
```
plugins/monitor/.claude-plugin/plugin.json
plugins/monitor/README.md
plugins/monitor/commands/monitor-init.md
plugins/monitor/commands/monitor.md
plugins/monitor/commands/monitor-task.md
plugins/monitor/hooks/hooks.json
plugins/monitor/skills/monitor/SKILL.md
plugins/monitor/skills/monitor/templates/index.html
plugins/monitor/skills/monitor/templates/monitor-server.js
plugins/monitor/skills/monitor/templates/package.json
plugins/monitor/skills/monitor/templates/tracker-app.js
plugins/monitor/skills/monitor/templates/tracker-editor.js
plugins/monitor/skills/monitor/templates/tracker-style.css
plugins/monitor/skills/monitor/templates/tracker-views.js
```

- [ ] **Step 3: End-to-end test**

1. Run `/monitor-init` — verify `.monitor/` created with all files + config.json
2. Run `/monitor` — verify server starts + browser opens
3. In browser: verify graph loads with data from project's *list.json files
4. Edit a node → click Save → verify JSON file updated on disk
5. In Claude Code: edit a *list.json manually → verify browser auto-refreshes
6. Click "Send to Claude" → Copy → verify clipboard has command
7. Click "Send to Claude" → Queue → verify task-queue.json updated
8. Run `/monitor-task` → verify pending task shows up

- [ ] **Step 4: Final commit**

```bash
git add .claude-plugin/marketplace.json
git commit -m "feat(monitor): register plugin in marketplace + complete v1.0.0"
```
