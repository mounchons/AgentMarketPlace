---
description: Start monitor dashboard server and open browser
allowed-tools: Bash(*)
---
# /monitor — Start Monitor Dashboard

## Input
$ARGUMENTS (optional: --port=XXXX)

## Steps

1. Check `.monitor/` directory exists at project root. If not: display "Run /monitor-init first to deploy the dashboard." and stop.

2. Check `.monitor/node_modules/` exists. If not: run `cd .monitor && npm install`

3. Parse port from $ARGUMENTS if `--port=` is provided (default: read from .monitor/config.json or 3400)

4. Start server in background:
   ```bash
   cd .monitor && node monitor-server.js &
   ```

5. Wait 1 second for server to start

6. Auto-open browser:
   - Windows: `start http://localhost:PORT`
   - macOS: `open http://localhost:PORT`
   - Linux: `xdg-open http://localhost:PORT`

7. Display:
   ```
   Monitor running at http://localhost:PORT
   Server PID: [PID]
   
   To stop: kill the server process or close terminal.
   ```
