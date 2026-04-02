---
name: brain-status
description: "Check Graph Brain connection status, show knowledge statistics, project overview, and tag domains"
user_invocable: true
---

# Brain Status

ALL responses MUST be in Thai language.

## Steps

1. **Test connection**
   - Call `mcp__graph-brain__brain-stats`

2. **If connected** — show:

   **Basic stats (existing):**
   - Connection status: Connected
   - Total notes count
   - Total relationships count

   **Project overview (NEW):**
   - Call `mcp__graph-brain__get-project` name="{current-project-name}"
   - Display: tech stack, linked notes count, tasks count
   - Call `mcp__graph-brain__list-projects`
   - Display: all projects summary table
     ```
     🏗️ Projects ใน Brain:
     | # | Project | Notes | Tech Stack |
     |---|---------|-------|------------|
     | 1 | {name}  | {N}   | {techs}    |
     ```

   **Tag domains (NEW):**
   - Call `mcp__graph-brain__list-tags`
   - Group top 20 tags by domain:
     ```
     🏷️ Top Tags:
     ├── Architecture: solution-structure(5), architecture(3)
     ├── Database: entity(8), database(4), connection(2)
     ├── Workflow: workflow(6), state-machine(3)
     └── Integration: api(4), notification(2)
     ```

   **Cross-project connections (NEW):**
   - From list-projects data, identify projects that share tags or tech
   - Display: "🔗 Cross-project: {Project A} ↔ {Project B} (shared: react, dotnet)"

   **Available commands reminder (existing)**

3. **If failed** — show:
   - Connection status: Failed
   - Possible causes (MCP server not running, network, config)
   - Options: [1] Retry  [2] Skip and work from codebase
   - Hint: `claude mcp list` to check active MCP servers
