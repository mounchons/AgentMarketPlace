---
description: Read and execute tasks from monitor task queue
allowed-tools: Bash(*), Read(*), Write(*), Edit(*)
---
# /monitor-task — Execute Queued Tasks

## Steps

1. Read `.monitor/task-queue.json`

2. Filter tasks with `status: "pending"`

3. If no pending tasks: display "No pending tasks in monitor queue." and stop.

4. Display pending tasks:
   ```
   Pending tasks from Monitor:
   1. [task-001] implement: /continue #5 — "GET /api/users - List all"
   2. [task-002] review: /review #3 — "Create User entity"
   
   Which task to execute? (enter number)
   ```

5. Execute chosen task based on its `type` field:
   - `implement` → follow the /continue workflow for the feature ID in command_hint
   - `review` → follow the /review workflow
   - `create-scenario` → run /qa-create-scenario --auto
   - `create-mockup` → run /create-mockup with the page name from label
   - `edit-section` → run /edit-section with the section from command_hint
   - `run-test` → run /qa-run with the scenario ID

6. After execution, update the task in `.monitor/task-queue.json`:
   - Set `status: "completed"`
   - Set `completed_at` to current ISO timestamp

7. Display: "Task [ID] completed. Monitor dashboard will auto-refresh."
