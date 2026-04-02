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
