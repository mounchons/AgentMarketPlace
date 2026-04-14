# Monitor Plugin

Interactive dashboard for cross-plugin workflow visualization with live refresh, editing, and Claude Code task integration.

## Overview

The Monitor plugin provides a two-way interactive dashboard that visualizes and manages *list.json files across all plugins in the AgentMarketPlace. Track active workflows, queue tasks, and monitor plugin execution in real-time with a responsive web interface.

## Commands

- **`/monitor-init`** — Deploy monitor dashboard to project root
- **`/monitor`** — Start the monitor server
- **`/monitor-task`** — Execute queued tasks from the dashboard

## Requirements

- Node.js (v16+)

## Quick Start

1. Deploy the dashboard to your project:
   ```
   /monitor-init
   ```

2. Start the monitor server:
   ```
   /monitor
   ```

The dashboard will open in your browser, displaying real-time workflow status across all plugins.

## Features

- Real-time *list.json visualization
- Live workflow refresh
- Interactive task editing
- Claude Code task integration
- Cross-plugin monitoring
