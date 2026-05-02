#!/usr/bin/env bash

cat << 'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "Monitor plugin is active. On session start:\n\n1. Check if `.monitor/task-queue.json` exists at project root\n2. If it exists: read it and count tasks with status 'pending'\n3. If pending tasks > 0: display 'Monitor: N pending task(s) in queue — run /monitor-task to execute'\n4. If no pending tasks or file does not exist: do nothing (remain silent)\n5. NEVER auto-start the monitor server. User must run /monitor manually.\n\nALL responses must be in Thai language."
  }
}
EOF

exit 0
