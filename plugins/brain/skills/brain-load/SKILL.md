---
name: brain-load
description: "Load project knowledge from Graph Brain at session start. Auto-runs via hook, but can be called manually."
user_invocable: true
args: "[project-name or keyword] — default: current working directory name"
---

# Brain Load

ALL responses MUST be in Thai language.

## Steps

1. **Check connection**
   - Call `mcp__graph-brain__brain-stats`
   - If failed, ask user (in Thai):
     - [1] Retry connection
     - [2] Skip — work from codebase directly

2. **Search for project knowledge**
   - query = argument or basename of current working directory
   - Call `mcp__graph-brain__search-knowledge` query="{project}" limit=10
   - Call `mcp__graph-brain__search-by-tags` tags=["{project-name-lowercase}"]

3. **Load top notes**
   - Call `mcp__graph-brain__get-knowledge` for top 5 results
   - Priority order: architecture → workflow → data model → integrations → config

4. **Report to user (Thai)**
   - If found: list loaded notes with descriptions
   - If empty: suggest `/brain-scan` to populate

5. **Keep in context**
   - Retain loaded knowledge for use throughout the session
