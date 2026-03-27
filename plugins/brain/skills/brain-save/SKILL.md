---
name: brain-save
description: "Save new knowledge to Graph Brain from current conversation analysis or specified topic"
user_invocable: true
args: "[topic] — if omitted, auto-detect from recent conversation"
---

# Brain Save

ALL responses MUST be in Thai language.

## Steps

1. **Determine what to save**
   - If argument provided → use as topic, analyze conversation for relevant info
   - If no argument → scan recent conversation for:
     - Code analysis results
     - Architecture discoveries
     - Workflow/business logic findings
     - Integration patterns
     - Database structures

2. **Check for duplicates**
   - Call `mcp__graph-brain__search-knowledge` query="{topic}" limit=3
   - If similar note exists, ask user (Thai):
     - [1] Update existing note
     - [2] Create new separate note
     - [3] Cancel

3. **Format knowledge**
   - title: "{ProjectName} - {Topic}" (short, descriptive)
   - content: Markdown with headers, tables, code blocks
   - Add `[[wiki links]]` to related existing notes
   - type: "permanent" (default)
   - tags: [project-name, topic-keywords...] (lowercase)
   - folderPath: `/projects/{project-name}/{category}/`
   - projectName: from working directory

4. **Save**
   - Call `mcp__graph-brain__save-knowledge`
   - Report result in Thai with title, tags, links

## Folder Categories
- `/projects/{name}/core/` — architecture, solution, infrastructure
- `/projects/{name}/workflow/` — business workflow, roles, states
- `/projects/{name}/database/` — connections, models, data access
- `/projects/{name}/integration/` — external APIs, notifications
- `/projects/{name}/frontend/` — UI, pages, components
