---
name: brain-update
description: "Update existing Graph Brain knowledge to match current codebase state"
user_invocable: true
args: "<note-title or keyword>"
---

# Brain Update

ALL responses MUST be in Thai language.

## Steps

1. **Find note to update**
   - Search with argument keyword
   - Show matches, let user pick (or auto-select if exact match)

2. **Load existing note**
   - `mcp__graph-brain__get-knowledge` noteId="{id}"

3. **Compare with current code**
   - Read related files mentioned in note content
   - Identify: changed parts, outdated info, missing new info

4. **Update**
   - `mcp__graph-brain__save-knowledge` with same title (overwrites)
   - Update content, tags, description as needed

5. **Report changes (Thai)**
   - List what changed, what was added, what was removed

6. **Write activity log**
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
       "changes": "added|removed|modified sections summary"
     }
   }
   ```
   - If update failed, log with `"status": "failed"`
   - NEVER skip this step
