---
name: flow-monitor
description: "Interactive dashboard for cross-plugin workflow visualization with live refresh, editing, and Claude Code task integration. Deploys a web GUI showing design docs, mockups, features, and QA tests as interconnected graph with real-time sync."
version: 1.0.0
user_invocable: true
---
# Monitor — Cross-Plugin Workflow Dashboard

## Commands

- `/monitor-init` — Deploy dashboard to current project (.monitor/ directory)
- `/monitor` — Start the Node.js dashboard server and auto-open browser
- `/monitor-task` — View and execute pending tasks from the dashboard queue

## How It Works

1. Run `/monitor-init` to deploy dashboard files to `.monitor/`
2. Run `/monitor` to start the Node.js server (default port 3400)
3. Browser opens with interactive graph showing all *list.json data
4. View, edit, and add nodes from the browser — changes save back to JSON files
5. When Claude Code modifies JSON files, browser auto-refreshes via Server-Sent Events
6. Send tasks to Claude Code from browser (clipboard copy or task queue)
7. Run `/monitor-task` in Claude Code to pick up and execute queued tasks

## Requirements

- Node.js (for the dashboard server)
- At least one of: design_doc_list.json, mockup_list.json, feature_list.json, qa-tracker.json

## Architecture

Browser ←→ monitor-server.js (REST API + SSE) ←→ *list.json files ←→ Claude Code plugins
