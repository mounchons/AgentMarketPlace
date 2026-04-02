# Brain Plugin v3.0.0 — Graph-First Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign brain plugin from document-based to graph-first (Relationship-centric + Traversal-first) while preserving all existing skill rules/flows, adding versioning protocol, and 3 new skills.

**Architecture:** Skill-by-Skill Redesign with a shared Graph Protocol document. Each skill keeps its existing foundation and gains graph capabilities as an add-on layer. New Versioning Protocol creates changelog notes linked to originals via `[[wiki links]]`.

**Tech Stack:** Claude Code Plugin (SKILL.md prompt files), Graph Brain MCP Server (12 tools), JSON activity logging

**Spec:** `docs/superpowers/specs/2026-04-02-brain-plugin-graph-first-redesign.md`

---

## Phase 1: Foundation

### Task 1: Create GRAPH_PROTOCOL.md

**Files:**
- Create: `plugins/brain/GRAPH_PROTOCOL.md`

- [ ] **Step 1: Create the Graph Protocol file**

```markdown
---
name: Graph Protocol
description: Shared rules for all brain skills — Save Rules, Versioning Protocol, Search Rules, Relationship Rules
---

# Graph Protocol — กฎกลางสำหรับทุก Brain Skill

ทุก brain skill ที่ save, update, หรือ search knowledge ต้องทำตามกฎเหล่านี้

## 1. Save Rules

เมื่อ **SAVE note ใหม่** ต้องทำทุกข้อ:

1. **projectName** — ใช้จาก basename ของ current working directory หรือ user ระบุ
2. **tags** — อย่างน้อย 2 ตัว: `[{project-name-lowercase}, {domain-tag}]`
   - domain tags: architecture, workflow, database, integration, frontend, permission, dependency, document
3. **folderPath** — ตาม convention: `/projects/{project-name}/{category}/`
   - categories: core, workflow, database, dependencies, permissions, integration, frontend, documents, changelog
4. **Duplicate check** — เรียก `mcp__graph-brain__search-knowledge` query="{title}" limit=3 ก่อน save เสมอ
5. **Wiki links** — search related notes แล้วเพิ่ม `[[Related Note Title]]` ใน content
6. **type** — เลือกให้ถูก:
   - `permanent`: refined knowledge, architecture, patterns
   - `fleeting`: quick thought, temporary note
   - `literature`: from external source, documentation, article

เมื่อ **UPDATE note เดิม**:
- ห้าม overwrite โดยไม่สร้าง changelog → ทำตาม Versioning Protocol

## 2. Versioning Protocol

เมื่อ update note เดิม (ใช้ใน brain-save, brain-update, brain-scan):

### Step 1: Snapshot
- เรียก `mcp__graph-brain__get-knowledge` noteId="{id}" เก็บ content ปัจจุบัน

### Step 2: Create Changelog Note
- เรียก `mcp__graph-brain__save-knowledge` ด้วย:
  - title: `"{Original Title} — Changelog #{N} ({YYYY-MM-DD})"`
  - content:
    ```markdown
    # Changelog #{N} — {YYYY-MM-DD}

    **Original Note:** [[{Original Title}]]
    **Change Type:** added | modified | removed | restructured

    ## Changes
    - {สิ่งที่เพิ่ม/ลบ/เปลี่ยน}
    - {เหตุผลที่เปลี่ยน}

    ## Previous Content Summary
    {สรุป content ก่อนเปลี่ยนแบบสั้นๆ}
    ```
  - tags: `[changelog, {project-name}, ...{original-note-tags}]`
  - folderPath: `/projects/{project-name}/changelog/`
  - projectName: same as original
  - type: `permanent`

### Step 3: Update Original Note
- เรียก `mcp__graph-brain__save-knowledge` ด้วย content ใหม่ที่:
  - เพิ่ม `[[{Changelog Title}]]` link ใน content
  - เพิ่ม/อัพเดท Version History section ท้าย note:
    ```markdown
    ## Version History
    - v{N} ({YYYY-MM-DD}): {summary} → [[{Original Title} — Changelog #{N} ({YYYY-MM-DD})]]
    - v{N-1} ({date}): {summary} → [[{Original Title} — Changelog #{N-1} ({date})]]
    ```

### Step 4: Determine Changelog Number
- Search existing changelogs: `mcp__graph-brain__search-knowledge` query="{Original Title} — Changelog" limit=20
- Count existing changelogs → N = count + 1
- If no changelogs exist → N = 1 (this is the first update, original is v1)

## 3. Search Rules

Search Strategy (4 ขั้น — เรียงจากเร็วไปลึก):

1. **Text Search**: `mcp__graph-brain__search-knowledge` query="{keyword}" limit=10
   - ถ้าพบ >= 3 results ที่ตรงกับ query → หยุด ใช้ผลลัพธ์นี้
2. **Tag Search**: `mcp__graph-brain__search-by-tags` tags=["{extracted-keywords}"]
   - ถ้าพบ results → หยุด
3. **Graph Traversal**: `mcp__graph-brain__explore-graph` nodeId="{best-result-id}" depth=2
   - traverse จาก node ที่ใกล้เคียงที่สุด → ค้นหา connected nodes ผ่าน relationships
4. **Similar Search**: `mcp__graph-brain__find-similar` noteId="{best-result-id}" limit=5
   - last resort — ค้นหาจาก shared tags/connections

### Cross-Project Search
- ถ้า query มีชื่อ project อื่น → ใช้ `search-by-tags` tags=["{other-project-name}"]
- ถ้าไม่ระบุ project → search ทุก project แล้วจัดกลุ่มผลลัพธ์ตาม projectName

## 4. Relationship Rules

### เมื่อสร้าง/แก้ note:
- **Auto-link**: search related notes → เพิ่ม `[[wiki links]]` ใน content (สร้าง LINKS_TO)
- **Auto-tag**: ใส่ tags ที่ตรงกับ domain (สร้าง TAGGED relationships)
- **Project association**: ระบุ projectName เสมอ (สร้าง association กับ Project node)

### เมื่อ read note:
- Follow `[[wiki links]]` อย่างน้อย 1 hop เพื่อแสดง context
- ใช้ `mcp__graph-brain__explore-graph` เมื่อต้องการ deep context (2-3 hops)

### Relationship Display Format:
เมื่อแสดง relationships ให้ใช้ format:
```
→[LINKS_TO]→ {Note Title}
→[TAGGED]→ #{tag-name}
→[IN_FOLDER]→ /{folder-path}/
```
```

- [ ] **Step 2: Verify the file is complete and readable**

Run: read the file back to verify no formatting issues.

- [ ] **Step 3: Commit**

```bash
git add plugins/brain/GRAPH_PROTOCOL.md
git commit -m "docs(brain): add Graph Protocol — shared rules for graph-first redesign

Defines Save Rules, Versioning Protocol, Search Rules, and Relationship Rules
that all brain skills must follow in v3.0.0.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

### Task 2: Update plugin.json to v3.0.0

**Files:**
- Modify: `plugins/brain/.claude-plugin/plugin.json`

- [ ] **Step 1: Update version and description**

Change `plugin.json` content to:
```json
{
  "name": "brain",
  "description": "Graph-First knowledge management — Relationship-centric search, traversal-first navigation, knowledge versioning, cross-project intelligence, Brain First strategy",
  "version": "3.0.0",
  "author": {
    "name": "Mounchons"
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add plugins/brain/.claude-plugin/plugin.json
git commit -m "chore(brain): bump version to 3.0.0 for graph-first redesign

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Phase 2: Core Write Skills

### Task 3: Enhance brain-save with Versioning + Relationship Auto-detect

**Files:**
- Modify: `plugins/brain/skills/brain-save/SKILL.md`

- [ ] **Step 1: Read the current SKILL.md**

Read `plugins/brain/skills/brain-save/SKILL.md` to confirm current content matches what we analyzed.

- [ ] **Step 2: Update the SKILL.md**

Replace the entire content with the enhanced version below. Key changes:
- Step 2 enhanced: duplicate check now offers Update with versioning
- Step 3 enhanced: auto-search related notes for wiki links
- Step 3.5 added: URL detection for bookmarks
- Step 4 enhanced: versioning protocol when updating
- All original rules, flow, and Thai enforcement preserved

```markdown
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
```

- [ ] **Step 3: Verify the updated file**

Read `plugins/brain/skills/brain-save/SKILL.md` back to verify content is correct and formatting is clean.

- [ ] **Step 4: Commit**

```bash
git add plugins/brain/skills/brain-save/SKILL.md
git commit -m "feat(brain): enhance brain-save with versioning + relationship auto-detect

- Add Versioning Protocol: creates changelog notes when updating existing
- Auto-search and link related notes via [[wiki links]]
- URL detection with save-bookmark option
- Follow Graph Protocol Save Rules
- Activity log tracks changelog_created, relationships_added, bookmark_saved

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

### Task 4: Enhance brain-update with Versioning + Relationship Verification

**Files:**
- Modify: `plugins/brain/skills/brain-update/SKILL.md`

- [ ] **Step 1: Read the current SKILL.md**

Read `plugins/brain/skills/brain-update/SKILL.md` to confirm current content.

- [ ] **Step 2: Update the SKILL.md**

Replace the entire content with:

```markdown
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
```

- [ ] **Step 3: Verify the updated file**

Read `plugins/brain/skills/brain-update/SKILL.md` back to verify.

- [ ] **Step 4: Commit**

```bash
git add plugins/brain/skills/brain-update/SKILL.md
git commit -m "feat(brain): enhance brain-update with versioning + relationship verification

- Versioning Protocol: snapshot before update, create changelog note
- Relationship verification via explore-graph after update
- Activity log tracks changelog_number, relationships_verified/added

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Phase 3: Scan + History

### Task 5: Enhance brain-scan with Phase 0 + Phase 10 + Graph Protocol

**Files:**
- Modify: `plugins/brain/skills/brain-scan/SKILL.md`

- [ ] **Step 1: Read the current SKILL.md**

Read `plugins/brain/skills/brain-scan/SKILL.md` to confirm current content.

- [ ] **Step 2: Add Phase 0 — Project Check**

Insert after the `## Activity Logging` section and before `## Execution Phases`, add a note about Graph Protocol:

```markdown
**Graph Protocol:** Follow rules in `GRAPH_PROTOCOL.md` for all save operations.
```

Then insert Phase 0 before Phase 1 in `## Execution Phases`:

```markdown
### Phase 0: Project Awareness (NEW)
- Call `mcp__graph-brain__get-project` name="{project-name}"
- If project exists → display: "🏗️ Project {name} พบใน Brain — tech: [{tech stack}], notes: {N}"
- If project not found → note: "🆕 Project ใหม่ — จะสร้างเมื่อ save notes"
- This informs subsequent phases about existing project context
```

- [ ] **Step 3: Enhance Phase 9 — Add explore-graph verification**

In the existing Phase 9 section, append after "Add `[[wiki links]]` between related notes":

```markdown
- Verify links with `mcp__graph-brain__explore-graph`:
  - For each saved note, call `explore-graph` nodeId="{note-id}" depth=1
  - Check that `[[wiki links]]` point to existing notes
  - Remove broken links, add missing links to newly created notes
```

- [ ] **Step 4: Add Phase 10.5 — Versioning (NEW)**

Insert a new phase between Phase 10 (Report) and the end. Renumber: existing Phase 10 stays, add Phase 10.5:

```markdown
### Phase 10.5: Versioning (NEW — runs before Report)

For each note that was **updated** (not created new):
1. Follow Versioning Protocol from `GRAPH_PROTOCOL.md`:
   - Snapshot was already taken in Phase 3d (update existing notes)
   - Determine changelog number for each updated note
   - Create changelog note with diff summary
   - Update original note with Version History section
2. Track: `changelogs_created` count for report
```

- [ ] **Step 5: Update Phase 10 Report — add versioning stats**

In the Phase 10 report template, add after `อัพเดท:    {M} ชิ้น`:

```markdown
   Changelogs: {C} ชิ้น
```

And add to the folder tree display:

```markdown
├── 📝 changelog/ — Version changelogs
```

- [ ] **Step 6: Update Save Rules Reference**

In the `## Deduplicate Strategy` section, append:

```markdown
- All saves must follow Graph Protocol Save Rules:
  - projectName, tags (min 2), folderPath per convention
  - Add [[wiki links]] to related notes found during scan
```

- [ ] **Step 7: Update Activity Log — add changelog tracking**

In the "On scan COMPLETE" log entry details, add:

```json
    "changelogs_created": "<C>"
```

- [ ] **Step 8: Verify the updated file**

Read `plugins/brain/skills/brain-scan/SKILL.md` back to verify all phases are intact and new phases are correctly placed.

- [ ] **Step 9: Commit**

```bash
git add plugins/brain/skills/brain-scan/SKILL.md
git commit -m "feat(brain): enhance brain-scan with Phase 0 project check + versioning

- Phase 0: get-project for project awareness before scanning
- Phase 9: explore-graph verification for wiki links
- Phase 10.5: Versioning Protocol for updated notes
- All saves follow Graph Protocol Save Rules
- Activity log tracks changelogs_created

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

### Task 6: Create brain-history skill (NEW)

**Files:**
- Create: `plugins/brain/skills/brain-history/SKILL.md`

- [ ] **Step 1: Create the skill directory**

```bash
mkdir -p "D:/GitHub/AgentMarketPlace/plugins/brain/skills/brain-history"
```

- [ ] **Step 2: Create SKILL.md**

```markdown
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
```

- [ ] **Step 3: Verify the file**

Read `plugins/brain/skills/brain-history/SKILL.md` to verify.

- [ ] **Step 4: Commit**

```bash
git add plugins/brain/skills/brain-history/SKILL.md
git commit -m "feat(brain): add brain-history skill for knowledge version tracking

- View version timeline with changelog summaries
- Compare 2 versions side-by-side
- Restore old versions (creates new changelog)
- Activity logging for history operations

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Phase 4: Query + Navigation Skills

### Task 7: Enhance brain-search with explore-graph step

**Files:**
- Modify: `plugins/brain/skills/brain-search/SKILL.md`

- [ ] **Step 1: Read the current SKILL.md**

Read `plugins/brain/skills/brain-search/SKILL.md` to confirm current content.

- [ ] **Step 2: Update the SKILL.md**

Replace the entire content with:

```markdown
---
name: brain-search
description: "Search Graph Brain by keyword or tags with multi-strategy fallback and graph traversal"
user_invocable: true
args: "<keyword or question>"
---

# Brain Search

ALL responses MUST be in Thai language.

**Graph Protocol:** Follow Search Rules in `GRAPH_PROTOCOL.md`.

## Steps

1. **Check connection** — if failed, inform user

2. **Multi-strategy search** (4 ขั้น ตาม Graph Protocol)
   - Step 1 — Text: `mcp__graph-brain__search-knowledge` query="{keyword}" limit=10
   - Step 2 — Tags: `mcp__graph-brain__search-by-tags` with extracted tags (if Step 1 < 3 results)
   - Step 3 — Graph Traversal (NEW): `mcp__graph-brain__explore-graph` nodeId="{best-result-id}" depth=2
     - Traverse from the most relevant result found so far
     - Collect connected nodes that match the search context
     - This finds knowledge linked by relationships, not just text match
   - Step 4 — Similar: `mcp__graph-brain__find-similar` from closest match (last resort)

3. **Load top results**
   - Call `mcp__graph-brain__get-knowledge` for top 3-5 matches
   - For each result, note its relationships (from explore-graph data if available)

4. **Display results (Thai)**
   - Numbered list with:
     - Title, description, tags
     - Project name
     - Relationships: "→ เชื่อมกับ {N} notes, {M} tags"
     - Version info: "v{N} (อัพเดทล่าสุด {date})" if Version History section exists
   - Brief summary of what was found
   - If nothing found → suggest `/brain-scan` or try different keywords

5. **Offer next actions**
   - "พิมพ์เลขเพื่อดูรายละเอียด หรือ:"
   - `/brain-explore {title}` — เดินตาม graph ดู connections
   - `/brain-history {title}` — ดูประวัติเปลี่ยนแปลง
   - `/brain-explain {title}` — อธิบายแบบละเอียด
```

- [ ] **Step 3: Verify the updated file**

Read `plugins/brain/skills/brain-search/SKILL.md` back to verify.

- [ ] **Step 4: Commit**

```bash
git add plugins/brain/skills/brain-search/SKILL.md
git commit -m "feat(brain): enhance brain-search with graph traversal step + relationship display

- 4-step search: text → tags → explore-graph → find-similar
- Results show relationships count, project, version info
- Suggest brain-explore, brain-history as next actions

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

### Task 8: Create brain-explore skill (NEW)

**Files:**
- Create: `plugins/brain/skills/brain-explore/SKILL.md`

- [ ] **Step 1: Create the skill directory**

```bash
mkdir -p "D:/GitHub/AgentMarketPlace/plugins/brain/skills/brain-explore"
```

- [ ] **Step 2: Create SKILL.md**

```markdown
---
name: brain-explore
description: "Interactive graph traversal — navigate knowledge by walking through relationships node by node"
user_invocable: true
args: "<keyword, note title, or tag> — starting point for exploration"
---

# Brain Explore — Interactive Graph Traversal

ALL responses MUST be in Thai language.

## Purpose

เดินตาม graph จาก node หนึ่งไปอีก node ผ่าน relationships — ค้นหาแบบ "ตามเส้น" ไม่ใช่แบบ keyword

## Steps

1. **Find starting node**
   - Call `mcp__graph-brain__search-knowledge` query="{argument}" limit=5
   - If multiple matches → show numbered list, let user pick
   - If exact match → auto-select

2. **Load starting node**
   - Call `mcp__graph-brain__get-knowledge` noteId="{id}"
   - Display brief summary of node content (max 5 lines)

3. **Explore connections**
   - Call `mcp__graph-brain__explore-graph` nodeId="{id}" depth=1
   - Parse response to extract connected nodes and relationship types

4. **Display interactive map (Thai)**
   ```
   🧭 Exploring: [{Note Title}]
   📍 Path: {breadcrumb if not first hop}
   ─────────────────────────────────────
   {Brief content summary — max 5 lines}
   ─────────────────────────────────────

   🔗 Connections ({N} total):

   📄 Notes (LINKS_TO):
     [1] → {Connected Note Title 1}
     [2] → {Connected Note Title 2}

   🏷️ Tags (TAGGED):
     [3] → #{tag-1}
     [4] → #{tag-2}

   📁 Folder:
     [5] → /{folder-path}/

   🏗️ Project:
     [6] → {Project Name}

   ─────────────────────────────────────
   เลือก:
   [เลข] → explore node นั้นต่อ
   [B]   ← กลับ node ก่อนหน้า
   [S]   🔍 search ใหม่
   [Q]   หยุด explore
   ```

5. **Handle navigation**
   - **Number selected** → load that node (Step 2), explore connections (Step 3), display (Step 4)
   - **[B] Back** → return to previous node in breadcrumb stack
   - **[S] Search** → ask for new keyword, go to Step 1
   - **[Q] Quit** → end exploration, show summary

6. **Maintain breadcrumb**
   - Track path: `Node A → Node B → Node C`
   - Display breadcrumb at top of each hop
   - Max depth: 10 hops (warn user if approaching limit)

7. **End exploration summary**
   ```
   🧭 Exploration Summary
   ═══════════════════════════════════════
   📍 Path taken: {A} → {B} → {C} → {D}
   📊 Nodes visited: {N}
   🔗 Unique relationships seen: {M}

   💡 ลองต่อ:
     /brain-explain {most interesting node} — อธิบายแบบละเอียด
     /brain-history {node with versions} — ดูประวัติเปลี่ยนแปลง
   ```

8. **Write activity log**
   - Append entry to `.brain/activity-log.json`
   ```json
   {
     "timestamp": "<ISO 8601 UTC>",
     "session_id": "<$CLAUDE_SESSION_ID or date-based>",
     "command": "brain-explore",
     "args": "<starting keyword>",
     "project": "<project-name from cwd>",
     "status": "completed",
     "details": {
       "start_node": "<starting note title>",
       "nodes_visited": N,
       "path": ["<node titles in order>"],
       "hops": N
     }
   }
   ```

## Options (via argument flags)

| Flag | Effect |
|------|--------|
| `--depth N` | Show connections up to N hops at once (default: 1) |
| `--links` | Filter: show only LINKS_TO connections |
| `--tags` | Filter: show only TAGGED connections |
| `--project {name}` | Filter: show only nodes in specified project |
```

- [ ] **Step 3: Verify the file**

Read `plugins/brain/skills/brain-explore/SKILL.md` to verify.

- [ ] **Step 4: Commit**

```bash
git add plugins/brain/skills/brain-explore/SKILL.md
git commit -m "feat(brain): add brain-explore skill for interactive graph traversal

- Walk through knowledge graph node by node
- Breadcrumb navigation with back support
- Filter by relationship type and project
- Exploration summary with path taken

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

### Task 9: Enhance brain-explain with relationship depth + version history

**Files:**
- Modify: `plugins/brain/skills/brain-explain/SKILL.md`

- [ ] **Step 1: Read the current SKILL.md**

Read `plugins/brain/skills/brain-explain/SKILL.md` to confirm current content.

- [ ] **Step 2: Update the SKILL.md**

Replace the entire content with:

```markdown
---
name: brain-explain
description: "Deep explanation of a system, feature, or workflow from brain knowledge + codebase if needed"
user_invocable: true
args: "<topic> — e.g., 'checker workflow', 'billing system', 'data import'"
---

# Brain Explain

ALL responses MUST be in Thai language.

**Graph Protocol:** Follow Search Rules in `GRAPH_PROTOCOL.md`.

## Difference from `/brain`
- `/brain` = quick answer, concise
- `/brain-explain` = deep analysis with diagrams, tables, code references, full context

## Steps

1. **Search brain extensively**
   - `mcp__graph-brain__search-knowledge` query="{topic}" limit=10
   - Load top 5 results with `get-knowledge`
   - Follow ALL `[[wiki links]]` to load connected notes (max 3 hops)
   - Use `mcp__graph-brain__explore-graph` for relationship discovery

2. **Build relationship map** (NEW)
   - For each loaded note, call `mcp__graph-brain__explore-graph` nodeId="{id}" depth=1
   - Build a visual relationship map:
     ```
     🗺️ Relationship Map:
     [{Main Topic}]
       →[LINKS_TO]→ [{Related Note 1}]
       →[LINKS_TO]→ [{Related Note 2}]
         →[LINKS_TO]→ [{Sub-Related Note}]
       →[TAGGED]→ #{tag-1}, #{tag-2}
     ```
   - Identify cross-project connections if notes link to other projects

3. **Check version history** (NEW)
   - For each key note, check if Version History section exists
   - If found, display brief version summary:
     ```
     📜 Version History:
       v3 (current) — เพิ่ม MFA
       v2 — เพิ่ม OAuth2
       → /brain-history {topic} เพื่อดูรายละเอียด
     ```

4. **Evaluate completeness**
   - Complete → synthesize from brain only
   - Partial → supplement from codebase
   - Empty → full codebase analysis

5. **Read codebase if needed**
   - Use Explore agent for thorough investigation
   - Focus on gaps not covered by brain

6. **Present deep explanation (Thai)**
   Include ALL of these where relevant:
   - Overview summary
   - Relationship map (from Step 2)
   - Version history summary (from Step 3)
   - Flow diagram (text-based)
   - Role/page/action table
   - State machine / workflow transitions
   - Database tables involved
   - Code snippets for key logic
   - Cross-project context (if notes link to other projects)
   - Source labels: `[Brain]` vs `[Code]`
   - Related topics to explore further

7. **Offer to save new findings**
   If codebase was read → offer `/brain-save`
```

- [ ] **Step 3: Verify the updated file**

Read `plugins/brain/skills/brain-explain/SKILL.md` back to verify.

- [ ] **Step 4: Commit**

```bash
git add plugins/brain/skills/brain-explain/SKILL.md
git commit -m "feat(brain): enhance brain-explain with relationship maps + version history

- Build visual relationship map from explore-graph
- Show version history summary from changelogs
- Cross-project context when notes link to other projects

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

### Task 10: Enhance brain (primary query) with explore-graph fallback

**Files:**
- Modify: `plugins/brain/skills/brain/SKILL.md`

- [ ] **Step 1: Read the current SKILL.md**

Read `plugins/brain/skills/brain/SKILL.md` to confirm current content.

- [ ] **Step 2: Update Step 1 — add explore-graph fallback**

After the existing Step 1 content (search-knowledge, search-by-tags, get-knowledge, follow wiki links), add:

```markdown
- If results < 3 and at least 1 result exists → use `mcp__graph-brain__explore-graph` nodeId="{best-result-id}" depth=2 to find connected knowledge through relationships
```

- [ ] **Step 3: Update Step 4 — add relationship display**

In the existing Step 4 "Respond in Thai", add to the "Present the answer with:" list:

```markdown
- Relationship context: if explore-graph was used, show key connections found (e.g., "เชื่อมกับ: [[Note A]], [[Note B]]")
```

- [ ] **Step 4: Verify the updated file**

Read `plugins/brain/skills/brain/SKILL.md` back to verify all original content is preserved.

- [ ] **Step 5: Commit**

```bash
git add plugins/brain/skills/brain/SKILL.md
git commit -m "feat(brain): add explore-graph fallback + relationship display to primary query

- explore-graph as fallback when text/tag search has few results
- Show relationship context in answers

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Phase 5: Session + Overview + Docs

### Task 11: Enhance brain-status with graph overview

**Files:**
- Modify: `plugins/brain/skills/brain-status/SKILL.md`

- [ ] **Step 1: Read the current SKILL.md**

Read `plugins/brain/skills/brain-status/SKILL.md` to confirm current content.

- [ ] **Step 2: Update the SKILL.md**

Replace the entire content with:

```markdown
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
```

- [ ] **Step 3: Verify the updated file**

Read `plugins/brain/skills/brain-status/SKILL.md` back to verify.

- [ ] **Step 4: Commit**

```bash
git add plugins/brain/skills/brain-status/SKILL.md
git commit -m "feat(brain): enhance brain-status with project overview + tag domains

- get-project for current project tech stack and stats
- list-projects for all projects summary
- list-tags grouped by domain
- Cross-project connection detection

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

### Task 12: Enhance brain-load with project entry point

**Files:**
- Modify: `plugins/brain/skills/brain-load/SKILL.md`

- [ ] **Step 1: Read the current SKILL.md**

Read `plugins/brain/skills/brain-load/SKILL.md` to confirm current content.

- [ ] **Step 2: Insert Step 1.5 — get-project**

After Step 1 (Check connection) and before Step 2 (Search for project knowledge), insert:

```markdown
1.5. **Get project context** (NEW)
   - Call `mcp__graph-brain__get-project` name="{project-name}"
   - If project found → store: tech stack, note count, related projects
   - If not found → continue (project may not exist in brain yet)
```

- [ ] **Step 3: Update Step 4 — enhanced report**

In Step 4 "Report to user (Thai)", after "If found: list loaded notes with descriptions", add:

```markdown
   - If project context available (from Step 1.5):
     - Show: "🏗️ Tech Stack: [{technologies}]"
     - Show: "🔗 Connected Projects: [{related project names}]"
```

- [ ] **Step 4: Update activity log details**

In the log entry format, add to details:

```json
       "project_found_in_brain": true/false,
       "tech_stack": ["<technologies>"]
```

- [ ] **Step 5: Verify the updated file**

Read `plugins/brain/skills/brain-load/SKILL.md` back to verify all original steps are intact.

- [ ] **Step 6: Commit**

```bash
git add plugins/brain/skills/brain-load/SKILL.md
git commit -m "feat(brain): enhance brain-load with project entry point via get-project

- Step 1.5: get-project for tech stack and connected projects
- Enhanced report with project context
- Activity log tracks project_found_in_brain

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

### Task 13: Create brain-projects skill (NEW)

**Files:**
- Create: `plugins/brain/skills/brain-projects/SKILL.md`

- [ ] **Step 1: Create the skill directory**

```bash
mkdir -p "D:/GitHub/AgentMarketPlace/plugins/brain/skills/brain-projects"
```

- [ ] **Step 2: Create SKILL.md**

```markdown
---
name: brain-projects
description: "View all projects in Brain — tech stacks, cross-project connections, and technology overview"
user_invocable: true
args: "[project-name | --tech | --compare] — view specific project, tech overview, or compare projects"
---

# Brain Projects — Project Management & Cross-Project View

ALL responses MUST be in Thai language.

## Steps

1. **List all projects**
   - Call `mcp__graph-brain__list-projects`
   - If no projects found → suggest `/brain-scan` to populate

2. **Display projects table**
   ```
   🏗️ Projects ทั้งหมดใน Brain ({N} projects)
   ═══════════════════════════════════════

   | # | Project | Notes | Tasks | Tech Stack |
   |---|---------|-------|-------|------------|
   | 1 | {name}  | {N}   | {T}   | {techs}    |
   | 2 | {name}  | {N}   | {T}   | {techs}    |

   ═══════════════════════════════════════
   เลือก:
   [เลข]    ดูรายละเอียด project
   [A]      tech-overview — ดู technologies ทั้งหมด
   [B]      compare — เปรียบเทียบ 2 projects
   ```

3. **View specific project** (number selected or argument provided)
   - Call `mcp__graph-brain__get-project` name="{project-name}"
   - Display:
     ```
     🏗️ {Project Name}
     ─────────────────────────────────────
     🔧 Tech Stack: {technologies}
     📄 Notes: {N} ชิ้น
     ✅ Tasks: {T} รายการ

     📂 Notes จัดกลุ่มตาม folder:
     ├── core/ ({N} notes)
     ├── database/ ({N} notes)
     ├── workflow/ ({N} notes)
     └── ...

     🔗 Cross-Project Links:
     → Notes ที่ link ไป project อื่น:
       [{Note Title}] →[LINKS_TO]→ [{Other Project Note}]
     ```

4. **Tech overview** ([A] selected or `--tech` argument)
   - Call `mcp__graph-brain__tech-overview`
   - Display:
     ```
     🔧 Technology Overview
     ═══════════════════════════════════════

     | Technology | Projects ที่ใช้ |
     |------------|----------------|
     | react      | MyWebApp, AdminPanel |
     | dotnet     | MyWebApp, ApiService |
     | claude-code | AgentMarketPlace |

     📊 สรุป: {N} technologies, {M} projects
     ```

   - With filter: `mcp__graph-brain__tech-overview` filterTech="{tech-name}"
     ```
     🔧 Projects ที่ใช้ {tech-name}:
     - {Project 1} — {description}
     - {Project 2} — {description}
     ```

5. **Compare projects** ([B] selected or `--compare` argument)
   - Ask user to select 2 projects (by number)
   - Call `mcp__graph-brain__get-project` for both
   - Display:
     ```
     🔄 เปรียบเทียบ: {Project A} ↔ {Project B}
     ═══════════════════════════════════════

     Shared Tech: {common technologies}
     Only in {A}: {unique to A}
     Only in {B}: {unique to B}

     Shared Tags: {common tags}

     Cross-linked Notes:
       [{A Note}] →→ [{B Note}]

     💡 Knowledge ที่ reuse ได้:
       {suggestions based on shared tech/tags}
     ```

6. **Write activity log**
   - Append entry to `.brain/activity-log.json`
   ```json
   {
     "timestamp": "<ISO 8601 UTC>",
     "session_id": "<$CLAUDE_SESSION_ID or date-based>",
     "command": "brain-projects",
     "args": "<project-name or flag>",
     "project": "<project-name from cwd>",
     "status": "completed",
     "details": {
       "total_projects": N,
       "action": "listed|viewed|tech-overview|compared",
       "projects_viewed": ["<project names>"]
     }
   }
   ```
```

- [ ] **Step 3: Verify the file**

Read `plugins/brain/skills/brain-projects/SKILL.md` to verify.

- [ ] **Step 4: Commit**

```bash
git add plugins/brain/skills/brain-projects/SKILL.md
git commit -m "feat(brain): add brain-projects skill for cross-project management

- List all projects with tech stacks and note counts
- View specific project details with folder grouping
- Tech overview with project-technology matrix
- Compare 2 projects: shared tech, tags, cross-linked notes

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

### Task 14: Enhance brain-log with changelog events

**Files:**
- Modify: `plugins/brain/skills/brain-log/SKILL.md`

- [ ] **Step 1: Read the current SKILL.md**

Read `plugins/brain/skills/brain-log/SKILL.md` to confirm current content.

- [ ] **Step 2: Add changelog command filter**

In the filter table (Step 2), add a new row:

```markdown
   | `--command history` | Only brain-history entries |
```

- [ ] **Step 3: Update display format — add changelog indicators**

In the display format example (Step 3), add an example entry for changelog:

```markdown
   🕐 2026-04-02 10:00 UTC │ Session: ghi789
      📝 brain-update "Auth Flow" │ ✅ completed
      └─ Changelog #3 created │ relationships verified: 5, added: 1
```

- [ ] **Step 4: Verify the updated file**

Read `plugins/brain/skills/brain-log/SKILL.md` back to verify.

- [ ] **Step 5: Commit**

```bash
git add plugins/brain/skills/brain-log/SKILL.md
git commit -m "feat(brain): enhance brain-log with changelog and history event tracking

- Add --command history filter
- Display format shows changelog creation events

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

### Task 15: Update brain-help with new commands + Graph Protocol

**Files:**
- Modify: `plugins/brain/skills/brain-help/SKILL.md`

- [ ] **Step 1: Read the current SKILL.md**

Read `plugins/brain/skills/brain-help/SKILL.md` to confirm current content.

- [ ] **Step 2: Add new commands to the command reference**

In the `━━━ ใช้บ่อย ━━━` section, add after `/brain-explain`:

```
/brain-explore <หัวข้อ>   เดินตาม graph — ดู connections ทีละ node
                        ตัวอย่าง: /brain-explore authentication
                        ตัวอย่าง: /brain-explore --links UserService
```

In the `━━━ จัดการความรู้ ━━━` section, add after `/brain-update`:

```
/brain-history <หัวข้อ>   ดูประวัติเปลี่ยนแปลงของ note (changelogs)
                        ตัวอย่าง: /brain-history Auth Flow
                        ตัวอย่าง: /brain-history entity models
```

In the `━━━ ระบบ ━━━` section, add after `/brain-status`:

```
/brain-projects [name]  ดู projects ทั้งหมด, tech stacks, เปรียบเทียบ
                        ตัวอย่าง: /brain-projects
                        ตัวอย่าง: /brain-projects --tech
                        ตัวอย่าง: /brain-projects --compare
```

- [ ] **Step 3: Add Graph Protocol summary**

After the Brain First data flow section, add:

```
📐 Graph Protocol (v3.0.0):
   Save    → ต้องมี projectName, tags ≥2, folderPath, wiki links
   Update  → สร้าง changelog อัตโนมัติ (Versioning Protocol)
   Search  → 4 ขั้น: text → tags → graph traversal → similar
   Links   → [[wiki links]] สร้าง relationships อัตโนมัติ
```

- [ ] **Step 4: Update brain-log usage reference**

In the `ตัวกรองคำสั่ง:` section, add:

```
  /brain-log --command history  เฉพาะ brain-history
  /brain-log --command explore  เฉพาะ brain-explore
  /brain-log --command projects เฉพาะ brain-projects
```

- [ ] **Step 5: Verify the updated file**

Read `plugins/brain/skills/brain-help/SKILL.md` back to verify all original content is preserved and new commands are correctly placed.

- [ ] **Step 6: Commit**

```bash
git add plugins/brain/skills/brain-help/SKILL.md
git commit -m "feat(brain): update brain-help with new commands + Graph Protocol summary

- Add brain-explore, brain-history, brain-projects to command reference
- Add Graph Protocol summary section
- Update brain-log filter reference

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

### Task 16: Update brain-howto with new features tutorial

**Files:**
- Modify: `plugins/brain/skills/brain-howto/SKILL.md`

- [ ] **Step 1: Read the current SKILL.md**

Read `plugins/brain/skills/brain-howto/SKILL.md` to confirm current content.

- [ ] **Step 2: Add Section 7 — Graph Features**

After Section 6 (Troubleshooting), add:

```markdown
### Section 7: Graph Features (v3.0.0)
Step-by-step Thai guide:

**Exploring the Knowledge Graph:**
1. `/brain-explore authentication` — เริ่มจาก node authentication
2. เลือกเลขเพื่อเดินตาม connection → ดู related knowledge
3. กด [B] กลับ, [S] search ใหม่, [Q] หยุด

**Version History:**
1. Update note ด้วย `/brain-update auth flow`
2. ระบบสร้าง changelog อัตโนมัติ
3. ดูประวัติ: `/brain-history auth flow`
4. เปรียบเทียบ versions หรือ restore version เก่าได้

**Cross-Project Intelligence:**
1. `/brain-projects` — ดู projects ทั้งหมด
2. เลือก project ดู tech stack, notes, connections
3. `/brain-projects --compare` — เปรียบเทียบ 2 projects
4. `/brain-projects --tech` — ดู technologies ทั้งหมด
```

- [ ] **Step 3: Update Section 4 — add new commands**

In Section 4 "Command-by-Command Examples", add to the commands list:

```markdown
- `/brain-explore <topic>` — navigate graph interactively
- `/brain-history <topic>` — view version history
- `/brain-projects [name]` — cross-project management
```

- [ ] **Step 4: Verify the updated file**

Read `plugins/brain/skills/brain-howto/SKILL.md` back to verify.

- [ ] **Step 5: Commit**

```bash
git add plugins/brain/skills/brain-howto/SKILL.md
git commit -m "feat(brain): update brain-howto with graph features tutorial

- Section 7: Graph exploration, versioning, cross-project
- Updated command list in Section 4

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

### Task 17: Final — Verify all files + Integration test

- [ ] **Step 1: Verify all 17 files exist and are properly formatted**

```bash
# List all skill directories
ls -la "D:/GitHub/AgentMarketPlace/plugins/brain/skills/"

# Verify new files exist
ls "D:/GitHub/AgentMarketPlace/plugins/brain/GRAPH_PROTOCOL.md"
ls "D:/GitHub/AgentMarketPlace/plugins/brain/skills/brain-explore/SKILL.md"
ls "D:/GitHub/AgentMarketPlace/plugins/brain/skills/brain-projects/SKILL.md"
ls "D:/GitHub/AgentMarketPlace/plugins/brain/skills/brain-history/SKILL.md"

# Verify plugin version
cat "D:/GitHub/AgentMarketPlace/plugins/brain/.claude-plugin/plugin.json"
```

Expected: 14 skill directories, GRAPH_PROTOCOL.md exists, plugin.json shows version 3.0.0

- [ ] **Step 2: Verify Graph Protocol references**

Search all SKILL.md files for "GRAPH_PROTOCOL.md" or "Graph Protocol" reference:

```bash
grep -r "Graph Protocol\|GRAPH_PROTOCOL" "D:/GitHub/AgentMarketPlace/plugins/brain/skills/" --include="*.md"
```

Expected: References in brain-save, brain-update, brain-scan, brain-search, brain-explain (the skills that do save/search operations)

- [ ] **Step 3: Verify MCP tool coverage — all 12 tools referenced**

```bash
grep -r "mcp__graph-brain__" "D:/GitHub/AgentMarketPlace/plugins/brain/" --include="*.md" --include="*.json" -h | sort -u
```

Expected output should include all 12 tools:
- brain-stats, search-knowledge, search-by-tags, get-knowledge, find-similar, explore-graph, save-knowledge, list-tags, list-projects, get-project, save-bookmark, tech-overview

- [ ] **Step 4: Verify versioning protocol references**

```bash
grep -r "Versioning Protocol\|changelog" "D:/GitHub/AgentMarketPlace/plugins/brain/skills/" --include="*.md"
```

Expected: References in brain-save, brain-update, brain-scan, brain-history, brain-explain, brain-log

- [ ] **Step 5: Verify all original skills still have Thai enforcement**

```bash
grep -r "ALL responses MUST be in Thai" "D:/GitHub/AgentMarketPlace/plugins/brain/skills/" --include="*.md" -l | wc -l
```

Expected: 14 (all skill files)

- [ ] **Step 6: Final commit with verification results**

```bash
git add -A plugins/brain/
git status
git log --oneline -20 -- plugins/brain/
```

Verify all commits are present and no files are missing.
