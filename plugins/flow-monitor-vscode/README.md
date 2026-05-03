# Flow Monitor (VSCode Extension)

Cross-plugin workflow visualizer for AgentMarketPlace projects.
Shows the live connection between **Design Doc ⇄ UI Mockup ⇄ Long-Running Feature ⇄ QA** as an interactive graph, and lets you trigger Claude Code AI agent commands directly from any node.

## Features

- **Activity Bar sidebar** — instant tree view of `design_doc_list.json`, `mockup_list.json`, `feature_list.json`, `qa-tracker.json` with counts and statuses
- **Interactive Flow Graph** (Webview) — Cytoscape graph with cross-source links (entity ↔ page ↔ feature ↔ scenario)
- **Right-click any node → AI Quick Actions** — sends slash-command prompts to your Claude Code terminal
  - `Implement this feature` → `/continue feature N`
  - `Generate QA scenarios` → `/qa-create-scenario page X`
  - `Run QA test` → `/qa-run scenario Y`
  - `Export bug → feature` → `/qa-bug-export ...`
  - `Create UI mockup` → `/create-html-mockup ...`
  - `Edit design section` → `/system-design-doc:edit-section ...`
  - `Custom prompt…` (free-form)
- **Inline node editor** — change feature description, status, priority, complexity etc. → saves back to the JSON file
- **Live file watcher** — graph updates whenever Claude Code rewrites the JSON files
- **Multi-view** — Graph, Tree, Board, Table

## How AI Agent Integration Works

1. You select a node (e.g. feature #5)
2. Click a quick action (e.g. "Implement this feature")
3. The extension finds your terminal (whose name contains "Claude Code", configurable) and sends:
   ```
   [implement] #5 Create User entity
   /continue feature 5
   ```
4. Claude Code picks it up and runs the corresponding plugin command

If no Claude terminal is open, the extension creates one and runs `claude`.

## Settings

| Setting | Default | Purpose |
|---------|---------|---------|
| `flowMonitor.paths.design` | `design_doc_list.json` | Path to design doc list |
| `flowMonitor.paths.mockup` | `.mockups/mockup_list.json` | Path to mockup list |
| `flowMonitor.paths.feature` | `feature_list.json` | Path to long-running feature list |
| `flowMonitor.paths.qa` | `qa-tracker.json` | Path to QA tracker |
| `flowMonitor.activityLogs` | brain + bigbrain + agent logs | Activity timeline sources |
| `flowMonitor.terminal.name` | `Claude Code` | Substring to match the terminal |
| `flowMonitor.terminal.spawnIfMissing` | `true` | Auto-create + run `claude` if no terminal found |

## Build

```sh
npm install
npm run compile
npm run package    # produces flow-monitor-vscode-0.1.0.vsix
```

Then install the `.vsix` via VSCode: `Extensions → ... → Install from VSIX...`

## Development

- `F5` from VSCode opens an Extension Development Host with the extension loaded
- TypeScript watch: `npm run watch`
- Bridge protocol: see `src/flowMonitorPanel.ts` (`onDidReceiveMessage`) and `media/vscode-bridge.js`

## Architecture

```
┌──────────── Activity Bar ────────────┐
│  Sources tree  │  Recent Activity     │  ← TreeDataProviders (treeProvider.ts)
└──────────┬───────────────────────────┘
           │ click "Open Flow Graph"
           ▼
┌──────────── Webview Panel ───────────┐
│  Cytoscape graph + tree + board      │  ← media/index.html + tracker-*.js
│  Right-click node → AI quick menu    │
└──────────┬───────────────────────────┘
           │ postMessage protocol
           ▼
┌──────────── Extension Host ──────────┐
│  DataProvider  ← workspace.fs        │
│  FileWatcher   ← FileSystemWatcher   │
│  TaskBridge    → terminal.sendText   │
└──────────────────────────────────────┘
```

## Differences from `flow-monitor` Claude Code plugin

| | flow-monitor (web) | flow-monitor-vscode |
|---|---|---|
| Server | Node.js HTTP on :3400 | None — extension host |
| File watcher | chokidar | vscode FileSystemWatcher |
| UI | Browser tab | VSCode Webview + Activity Bar |
| Real-time sync | SSE | webview.postMessage |
| Task queue | `task-queue.json` + `/monitor-task` | Direct `terminal.sendText()` |
| Setup | `/monitor-init` + `/monitor` | Install VSIX, open project |

You can use **both** in the same project — they read the same JSON files.
