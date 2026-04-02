---
name: brain-save
description: "Save new knowledge to Graph Brain from current conversation analysis or specified topic"
user_invocable: true
args: "[topic] — if omitted, auto-detect from recent conversation"
---

# Brain Save

ALL responses MUST be in Thai language.

**Graph Protocol:** Follow rules in `GRAPH_PROTOCOL.md` for all save operations.

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
     - [1] อัพเดท note เดิม (สร้าง changelog อัตโนมัติ)
     - [2] สร้าง note ใหม่แยก (พร้อม link ไปหา note ที่เกี่ยวข้อง)
     - [3] ยกเลิก
   - If user chooses [1] → go to Step 4a (Update with Versioning)
   - If user chooses [2] → go to Step 3 (Create New)

3. **Format knowledge** (for new notes)
   - title: "{ProjectName} - {Topic}" (short, descriptive)
   - content: Markdown with headers, tables, code blocks
   - type: "permanent" (default)
   - tags: [project-name, topic-keywords...] (lowercase, minimum 2 tags per Graph Protocol)
   - folderPath: `/projects/{project-name}/{category}/` (per Graph Protocol)
   - projectName: from working directory

   **Auto-link related notes:**
   - Call `mcp__graph-brain__search-knowledge` query="{topic keywords}" limit=5
   - For each related note found, add `[[{Related Note Title}]]` in content
   - This automatically creates LINKS_TO relationships in the graph

3.5. **URL detection**
   - If content contains URLs (http/https) → ask user (Thai):
     - "พบ URL ในข้อมูล — ต้องการบันทึกเป็น Bookmark ด้วยไหม?"
     - [1] บันทึกทั้ง note + bookmark
     - [2] บันทึกเฉพาะ note
   - If [1] → call `mcp__graph-brain__save-bookmark` url="{url}" title="{title}" tags=[{tags}]

4. **Save** (for new notes)
   - Call `mcp__graph-brain__save-knowledge`
   - Report result in Thai with title, tags, links, relationships created

4a. **Update with Versioning** (when updating existing note)
   Follow Versioning Protocol from `GRAPH_PROTOCOL.md`:
   1. Call `mcp__graph-brain__get-knowledge` noteId="{existing-note-id}" → snapshot current content
   2. Determine changelog number: search existing changelogs for this note
   3. Create changelog note with diff summary
   4. Update original note with new content + Version History section + link to changelog
   5. Call `mcp__graph-brain__explore-graph` nodeId="{note-id}" depth=1 → verify relationships still valid
   6. Report in Thai: what changed, changelog created, relationships updated

5. **Write activity log**
   - Append entry to `.brain/activity-log.json` at project root
   - Create `.brain/` directory and file if they don't exist (start with `[]`)
   - Add `.brain/` to `.gitignore` if not already there
   - Log entry format:
   ```json
   {
     "timestamp": "<ISO 8601 UTC>",
     "session_id": "<$CLAUDE_SESSION_ID or date-based>",
     "command": "brain-save",
     "args": "<topic argument or 'auto-detect'>",
     "project": "<project-name from cwd>",
     "status": "completed",
     "details": {
       "note_title": "<saved note title>",
       "folder_path": "<folderPath used>",
       "tags": ["<tags used>"],
       "action": "created|updated",
       "duplicate_found": true/false,
       "changelog_created": true/false,
       "changelog_number": null|N,
       "relationships_added": N,
       "bookmark_saved": true/false
     }
   }
   ```
   - If save failed, log with `"status": "failed"` and `"details": {"reason": "<error>"}`
   - NEVER skip this step — this is how users track saves across sessions

## Folder Categories
- `/projects/{name}/core/` — architecture, solution, infrastructure
- `/projects/{name}/workflow/` — business workflow, roles, states
- `/projects/{name}/database/` — connections, models, data access
- `/projects/{name}/integration/` — external APIs, notifications
- `/projects/{name}/frontend/` — UI, pages, components
- `/projects/{name}/changelog/` — version changelogs (auto-generated)
