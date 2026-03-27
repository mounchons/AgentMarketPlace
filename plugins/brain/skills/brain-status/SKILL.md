---
name: brain-status
description: "Check Graph Brain connection status and show knowledge statistics"
user_invocable: true
---

# Brain Status

ALL responses MUST be in Thai language.

## Steps

1. **Test connection**
   - Call `mcp__graph-brain__brain-stats`

2. **If connected** — show:
   - Connection status: Connected
   - Total notes count
   - Top tags
   - Notes matching current project
   - Available commands reminder

3. **If failed** — show:
   - Connection status: Failed
   - Possible causes (MCP server not running, network, config)
   - Options: [1] Retry  [2] Skip and work from codebase
   - Hint: `claude mcp list` to check active MCP servers
