'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const chokidar = require('chokidar');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const CONFIG_PATH = path.resolve(__dirname, 'config.json');

let config = {
  port: 3400,
  paths: {
    design: '../design_doc_list.json',
    mockup: '../.mockups/mockup_list.json',
    feature: '../feature_list.json',
    qa: '../qa-tracker.json'
  },
  activity_logs: [
    '../.brain/activity-log.json',
    '../.agent/progress.md'
  ],
  auto_open: true
};

if (fs.existsSync(CONFIG_PATH)) {
  try {
    config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch (e) {
    console.error('Warning: Failed to parse config.json, using defaults:', e.message);
  }
}

const PORT = config.port || 3400;

// ---------------------------------------------------------------------------
// MIME types
// ---------------------------------------------------------------------------
const MIME = {
  '.html': 'text/html',
  '.js':   'text/javascript',
  '.css':  'text/css',
  '.json': 'application/json'
};

// ---------------------------------------------------------------------------
// SSE clients
// ---------------------------------------------------------------------------
const sseClients = new Set();

function broadcastSSE(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(payload);
    } catch (_) {
      sseClients.delete(res);
    }
  }
}

// Heartbeat every 30s
setInterval(() => {
  broadcastSSE({ type: 'heartbeat', timestamp: new Date().toISOString() });
}, 30_000);

// ---------------------------------------------------------------------------
// File helpers
// ---------------------------------------------------------------------------
function resolvePath(rel) {
  return path.resolve(__dirname, rel);
}

function readJsonSafe(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (_) {
    return null;
  }
}

function readActivityLog(rel) {
  const filePath = resolvePath(rel);
  if (!fs.existsSync(filePath)) return null;

  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.md') {
    try {
      const content = fs.readFileSync(filePath, 'utf8').slice(0, 2000);
      return { type: 'markdown', file: path.basename(filePath), content };
    } catch (_) {
      return null;
    }
  }

  // JSON — expect an array of entries with optional timestamp field
  const data = readJsonSafe(filePath);
  if (!Array.isArray(data)) return data;
  return data;
}

function getAllData() {
  const result = {};

  // Source files
  for (const [key, rel] of Object.entries(config.paths || {})) {
    result[key] = readJsonSafe(resolvePath(rel));
  }

  // Activity logs — flatten + sort by timestamp desc
  const logs = [];
  for (const rel of config.activity_logs || []) {
    const entry = readActivityLog(rel);
    if (entry === null) continue;
    if (Array.isArray(entry)) {
      logs.push(...entry);
    } else {
      logs.push(entry);
    }
  }
  logs.sort((a, b) => {
    const ta = a && a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const tb = b && b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return tb - ta;
  });
  result.activity = logs;

  return result;
}

// ---------------------------------------------------------------------------
// Task queue helpers
// ---------------------------------------------------------------------------
const TASK_QUEUE_PATH = path.resolve(__dirname, 'task-queue.json');

function readTaskQueue() {
  if (!fs.existsSync(TASK_QUEUE_PATH)) return [];
  return readJsonSafe(TASK_QUEUE_PATH) || [];
}

function addTask(taskBody) {
  const tasks = readTaskQueue();
  const nextNum = tasks.length + 1;
  const id = `task-${String(nextNum).padStart(3, '0')}`;
  const task = { id, ...taskBody, createdAt: new Date().toISOString() };
  tasks.push(task);
  fs.writeFileSync(TASK_QUEUE_PATH, JSON.stringify(tasks, null, 2), 'utf8');
  return task;
}

// ---------------------------------------------------------------------------
// Static file server
// ---------------------------------------------------------------------------
function serveStatic(res, filePath) {
  if (!fs.existsSync(filePath)) {
    send(res, 404, { error: 'Not found' });
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': mime, 'Access-Control-Allow-Origin': '*' });
  fs.createReadStream(filePath).pipe(res);
}

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------
function send(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(raw)); } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

// ---------------------------------------------------------------------------
// HTTP server
// ---------------------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;
  const method = req.method.toUpperCase();

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // --- GET / → index.html
  if (method === 'GET' && pathname === '/') {
    return serveStatic(res, path.resolve(__dirname, 'index.html'));
  }

  // --- GET /*.js | *.css | *.html (static files from __dirname)
  if (method === 'GET' && /\.(js|css|html)$/.test(pathname)) {
    return serveStatic(res, path.resolve(__dirname, pathname.slice(1)));
  }

  // --- SSE endpoint
  if (method === 'GET' && pathname === '/api/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return;
  }

  // --- GET /api/data → all sources
  if (method === 'GET' && pathname === '/api/data') {
    return send(res, 200, getAllData());
  }

  // --- GET /api/data/:source → single source
  if (method === 'GET' && pathname.startsWith('/api/data/')) {
    const source = pathname.slice('/api/data/'.length);
    const rel = (config.paths || {})[source];
    if (!rel) return send(res, 404, { error: `Unknown source: ${source}` });
    return send(res, 200, readJsonSafe(resolvePath(rel)));
  }

  // --- PUT /api/data/:source → write file
  if (method === 'PUT' && pathname.startsWith('/api/data/')) {
    const source = pathname.slice('/api/data/'.length);
    const rel = (config.paths || {})[source];
    if (!rel) return send(res, 404, { error: `Unknown source: ${source}` });
    try {
      const body = await readBody(req);
      fs.writeFileSync(resolvePath(rel), JSON.stringify(body, null, 2), 'utf8');
      return send(res, 200, { ok: true });
    } catch (e) {
      return send(res, 400, { error: e.message });
    }
  }

  // --- POST /api/task → add task
  if (method === 'POST' && pathname === '/api/task') {
    try {
      const body = await readBody(req);
      const task = addTask(body);
      return send(res, 201, task);
    } catch (e) {
      return send(res, 400, { error: e.message });
    }
  }

  // --- GET /api/tasks → list tasks
  if (method === 'GET' && pathname === '/api/tasks') {
    return send(res, 200, readTaskQueue());
  }

  // 404 fallback
  send(res, 404, { error: 'Not found' });
});

// ---------------------------------------------------------------------------
// File watcher (chokidar)
// ---------------------------------------------------------------------------
const watchPaths = [
  ...Object.entries(config.paths || {}).map(([, rel]) => resolvePath(rel)),
  ...(config.activity_logs || []).map(rel => resolvePath(rel)),
  TASK_QUEUE_PATH
];

// Map absolute path → source name for SSE events
const pathToSource = {};
for (const [key, rel] of Object.entries(config.paths || {})) {
  pathToSource[resolvePath(rel)] = key;
}

const debounceTimers = new Map();

const watcher = chokidar.watch(watchPaths, {
  ignoreInitial: true,
  persistent: true,
  awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 }
});

function onFileChanged(filePath) {
  if (debounceTimers.has(filePath)) {
    clearTimeout(debounceTimers.get(filePath));
  }
  debounceTimers.set(filePath, setTimeout(() => {
    debounceTimers.delete(filePath);
    broadcastSSE({
      type: 'file-changed',
      source: pathToSource[filePath] || null,
      file: path.basename(filePath),
      timestamp: new Date().toISOString()
    });
  }, 500));
}

watcher.on('change', onFileChanged);
watcher.on('add', onFileChanged);

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
server.listen(PORT, () => {
  console.log(`Monitor server running at http://localhost:${PORT}`);
  console.log(`Watching ${watchPaths.length} files for changes`);

  if (config.auto_open) {
    const url = `http://localhost:${PORT}`;
    if (process.platform === 'win32') {
      execFile('cmd.exe', ['/c', 'start', '', url]);
    } else if (process.platform === 'darwin') {
      execFile('open', [url]);
    } else {
      execFile('xdg-open', [url]);
    }
  }
});
