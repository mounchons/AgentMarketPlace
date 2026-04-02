---
name: brain-update
description: "Update existing Graph Brain knowledge to match current codebase state"
user_invocable: true
args: "<note-title or keyword>"
---

# Brain Update

ALL responses MUST be in Thai language.

**Graph Protocol:** Follow rules in `GRAPH_PROTOCOL.md` — especially Versioning Protocol for all updates.

## Steps

1. **Find note to update**
   - Search with argument keyword using `mcp__graph-brain__search-knowledge` query="{keyword}" limit=5
   - Show matches, let user pick (or auto-select if exact match)

2. **Load existing note**
   - `mcp__graph-brain__get-knowledge` noteId="{id}"
   - **Snapshot**: store current content for changelog diff

3. **Compare with current code**
   - Read related files mentioned in note content
   - Identify: changed parts, outdated info, missing new info

4. **Create changelog** (Versioning Protocol)
   Follow Versioning Protocol from `GRAPH_PROTOCOL.md`:
   1. Determine changelog number: `mcp__graph-brain__search-knowledge` query="{note-title} — Changelog" limit=20 → count + 1
   2. Create changelog note:
      - title: `"{Original Title} — Changelog #{N} ({YYYY-MM-DD})"`
      - content: diff summary with changes, reasons, previous content summary
      - tags: `[changelog, {project-name}, ...{original-tags}]`
      - folderPath: `/projects/{project-name}/changelog/`
      - Add `[[{Original Title}]]` wiki link back to original

5. **Update original note**
   - `mcp__graph-brain__save-knowledge` with:
     - Updated content reflecting current code state
     - Add `[[{Changelog Title}]]` wiki link to changelog
     - Update Version History section at end of note
     - Ensure tags and folderPath follow Graph Protocol Save Rules

6. **Verify relationships**
   - `mcp__graph-brain__explore-graph` nodeId="{note-id}" depth=1
   - Check: are existing `[[wiki links]]` still valid? (do linked notes still exist?)
   - Check: are there new related notes that should be linked?
   - If new links needed → update note content with additional `[[wiki links]]`

7. **Report changes (Thai)**
   - List what changed, what was added, what was removed
   - Show changelog note created: title, number
   - Show relationships: existing, added, removed

8. **Write activity log**
   - Append entry to `.brain/activity-log.json` at project root
   - Create `.brain/` directory and file if they don't exist (start with `[]`)
   - Log entry format:
   ```json
   {
     "timestamp": "<ISO 8601 UTC>",
     "session_id": "<$CLAUDE_SESSION_ID or date-based>",
     "command": "brain-update",
     "args": "<note-title or keyword>",
     "project": "<project-name from cwd>",
     "status": "completed",
     "details": {
       "note_title": "<updated note title>",
       "note_id": "<noteId>",
       "changes": "added|removed|modified sections summary",
       "changelog_number": N,
       "changelog_title": "<changelog note title>",
       "relationships_verified": N,
       "relationships_added": N
     }
   }
   ```
   - If update failed, log with `"status": "failed"`
   - NEVER skip this step
