---
name: brain-history
description: "View version history and changelogs of a knowledge note — track what changed, when, and why"
user_invocable: true
args: "<note-title or keyword> — search for a note to view its history"
---

# Brain History — Knowledge Version History

ALL responses MUST be in Thai language.

## Purpose

ดูประวัติการเปลี่ยนแปลงของ note — changelogs ทั้งหมดที่สร้างโดย Versioning Protocol

## Steps

1. **Find the note**
   - Call `mcp__graph-brain__search-knowledge` query="{argument}" limit=5
   - If multiple matches → show numbered list, let user pick
   - If exact match → auto-select

2. **Load the note**
   - Call `mcp__graph-brain__get-knowledge` noteId="{id}"
   - Extract Version History section if present

3. **Find changelogs**
   - Strategy 1: Follow `[[wiki links]]` from Version History section → load each changelog
   - Strategy 2: `mcp__graph-brain__search-knowledge` query="{Note Title} — Changelog" limit=20
   - Strategy 3: `mcp__graph-brain__search-by-tags` tags=["changelog", "{project-name}"] → filter by title match
   - Sort changelogs by number (ascending)

4. **Display timeline (Thai)**
   ```
   📜 {Note Title} — Version History
   ═══════════════════════════════════════

   📌 v{N} ({YYYY-MM-DD}) — current
      {summary of latest changes}
      → [[{Note Title} — Changelog #{N} ({date})]]

   📝 v{N-1} ({YYYY-MM-DD})
      {summary of changes}
      → [[{Note Title} — Changelog #{N-1} ({date})]]

   📝 v1 ({YYYY-MM-DD}) — initial
      {summary: first version}

   ═══════════════════════════════════════
   📊 รวม: {N} versions | อัพเดทล่าสุด: {latest date}

   เลือก:
   [1] ดู changelog เฉพาะ version (ระบุเลข)
   [2] เปรียบเทียบ 2 versions
   [3] restore version เก่า
   ```

5. **Handle user selection**

   **[1] View specific changelog:**
   - Call `mcp__graph-brain__get-knowledge` for the selected changelog note
   - Display full changelog content

   **[2] Compare 2 versions:**
   - Ask user to specify 2 version numbers
   - Load both changelog notes
   - Display side-by-side diff summary:
     ```
     🔄 เปรียบเทียบ v{A} ↔ v{B}

     v{A} ({date}):
       {changes in version A}

     v{B} ({date}):
       {changes in version B}

     ⚡ ความแตกต่างหลัก:
       - {key differences}
     ```

   **[3] Restore old version:**
   - Ask user which version to restore
   - Load the original note + target changelog
   - Create a NEW changelog (N+1) with content: "Restored from v{target}"
   - Update original note with restored content + new Version History entry
   - Follow Versioning Protocol from `GRAPH_PROTOCOL.md`
   - Report in Thai

6. **No history found**
   - If no changelogs exist:
     ```
     📜 {Note Title} — ยังไม่มีประวัติเปลี่ยนแปลง
     Note นี้ยังไม่เคยถูก update ผ่าน Versioning Protocol
     ลอง /brain-update {topic} เพื่อ update พร้อมสร้าง changelog
     ```

7. **Write activity log**
   - Append entry to `.brain/activity-log.json`
   - Log entry format:
   ```json
   {
     "timestamp": "<ISO 8601 UTC>",
     "session_id": "<$CLAUDE_SESSION_ID or date-based>",
     "command": "brain-history",
     "args": "<note-title or keyword>",
     "project": "<project-name from cwd>",
     "status": "completed",
     "details": {
       "note_title": "<note title>",
       "versions_found": N,
       "action": "viewed|compared|restored"
     }
   }
   ```
