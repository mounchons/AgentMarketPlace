#!/usr/bin/env bash

cat << 'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "BigBrain Graphiti plugin is active. On session start:\n\n1. Call mcp__big-brain__search_memory_nodes query=\"test\" group_ids=[\"bigbrain\"] max_nodes=1 to check connection\n2. If connected: call mcp__big-brain__get_episodes group_id=\"bigbrain\" last_n=3 to preload recent context. Keep results in conversation context.\n3. If NOT connected: display '⚠️ BigBrain ไม่สามารถเชื่อมต่อได้ — พิมพ์ /bigbrain-status เพื่อตรวจสอบ หรือทำงานต่อได้เลย' and continue normally.\n4. NEVER block the session. If connection fails, allow user to work from codebase directly.\n5. **Activity Log**: Write a session-start entry to `.bigbrain/activity-log.json` at project root. Create `.bigbrain/` dir and file (with `[]`) if missing. Entry format:\n   ```json\n   {\"timestamp\":\"<ISO 8601 UTC>\",\"session_id\":\"<$CLAUDE_SESSION_ID or date-based>\",\"command\":\"session-start\",\"project\":\"<cwd basename>\",\"status\":\"connected|disconnected\",\"details\":{\"bigbrain_connected\":true/false,\"episodes_preloaded\":<N or 0>}}\n   ```\n   Add `.bigbrain/` to `.gitignore` if not present. Never block session for logging failures.\n\nALL responses from bigbrain skills MUST be in Thai language.\n\n**Graphiti Protocol:** Always use group_id=\"bigbrain\" for all operations. See GRAPHITI_PROTOCOL.md for full rules."
  }
}
EOF

exit 0
