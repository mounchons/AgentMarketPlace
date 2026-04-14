---
description: Deploy monitor dashboard to current project
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*)
---
# /monitor-init — Deploy Monitor Dashboard

## Steps

1. **Scan project** for tracking files. Check existence of each:
   - `design_doc_list.json`
   - `.mockups/mockup_list.json`
   - `feature_list.json`
   - `qa-tracker.json`
   - `.brain/activity-log.json`
   - `.bigbrain/activity-log.json`
   - `.agent/progress.md`

2. **Create `.monitor/` directory** at project root

3. **Copy template files** from `${CLAUDE_PLUGIN_ROOT}/skills/monitor/templates/` to `.monitor/`:
   - `index.html`
   - `tracker-app.js`
   - `tracker-views.js`
   - `tracker-editor.js`
   - `tracker-style.css`
   - `monitor-server.js`
   - `package.json`

4. **Generate `.monitor/config.json`** — only include paths where files actually exist:
   ```json
   {
     "port": 3400,
     "paths": {},
     "activity_logs": [],
     "auto_open": true
   }
   ```
   For each file found in step 1, add to `paths` or `activity_logs` with relative path from `.monitor/` (prefix `../`).

5. **Create `.monitor/task-queue.json`**: `{"tasks":[]}`

6. **Run `npm install`** in `.monitor/` directory

7. **Add `.monitor/` to `.gitignore`** — append if not already present

8. **Display summary**:
   ```
   Monitor deployed to .monitor/
   
   Sources found:
     design_doc_list.json    [checkmark or x]
     mockup_list.json        [checkmark or x]
     feature_list.json       [checkmark or x]
     qa-tracker.json         [checkmark or x]
   
   Activity logs:
     .brain/activity-log     [checkmark or x]
     .agent/progress.md      [checkmark or x]
   
   Run /monitor to start the dashboard.
   ```
