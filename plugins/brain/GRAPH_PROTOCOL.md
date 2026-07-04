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
   - domain tags: architecture, workflow, database, integration, frontend, permission, dependency, document, diagram, release, deployment
3. **folderPath** — ตาม convention: `/projects/{project-name}/{category}/`
   - categories: core, workflow, database, dependencies, permissions, integration, frontend, releases, deployment, documents, changelog
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
- เรียก `mcp__graph-brain__save-knowledge` ด้วย **title เดิม** + content ใหม่ที่:
  - เพิ่ม `[[{Changelog Title}]]` link ใน content
  - เพิ่ม/อัพเดท Version History section ท้าย note (ถ้า note มี `## Scan Metadata` → Version History อยู่**ก่อน** Scan Metadata เสมอ — Scan Metadata ต้องเป็น section สุดท้าย ดู §5.1):
    ```markdown
    ## Version History
    - v{N} ({YYYY-MM-DD}): {summary} → [[{Original Title} — Changelog #{N} ({YYYY-MM-DD})]]
    - v{N-1} ({date}): {summary} → [[{Original Title} — Changelog #{N-1} ({date})]]
    ```

> **Upsert semantics (สำคัญ):** `save-knowledge` ด้วย **title เดิม** = update note เดิม (server upsert by title
> และเก็บ content เก่าเป็น version snapshot อัตโนมัติ) — **ไม่สร้าง note ซ้ำ** ห้ามเปลี่ยน title ตอน update
> ทางเลือกที่ตรงกว่า: `mcp__graph-brain__update-knowledge` (ระบุ noteId) ให้ผลเดียวกันแบบ explicit
> ฝั่ง history: server มี `get-note-history` / `restore-note-version` ใช้ดู/ย้อน version ได้โดยตรง —
> changelog notes ในโปรโตคอลนี้เป็น layer เสริมที่ search ได้และ link ใน graph (ตั้งใจให้มีทั้งสองชั้น)

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

## 5. Freshness Protocol

ตรวจว่า knowledge ใน brain ยังตรงกับโค้ดปัจจุบันหรือไม่ — ใช้กับ **code-derived notes** (จาก brain-scan) เท่านั้น

### 5.1 Scan Metadata Footer

ทุก note ที่ **brain-scan สร้างหรืออัปเดต** ต้องลงท้ายด้วย section นี้ — **`## Scan Metadata` ต้องเป็น section สุดท้ายของ note เสมอ** (ถ้ามี `## Version History` ให้อยู่ก่อน Scan Metadata):

```markdown
## Scan Metadata
- Scanned-At-Commit: `<git short hash>`
- Scanned-At: <YYYY-MM-DD>
- Source-Files: `<path1>`, `<path2>`, ...
```

กฎ:
- hash จาก `git rev-parse --short HEAD` — เรียก**ครั้งเดียวต่อ scan run** ทุก note ใน run เดียวกันใช้ hash เดียวกัน
- **Scope:** เฉพาะ note ที่ derive จากโค้ด (brain-scan ทุก phase)
  - `brain-save` (conversation knowledge) — **ไม่บังคับ** footer
  - `brain-update` — ถ้า note เดิมมี footer → refresh footer เป็น HEAD ปัจจุบัน
- Non-git project: ละบรรทัด `Scanned-At-Commit` — เหลือ `Scanned-At` + `Source-Files`
- `Source-Files`: ไฟล์หลักที่ note สรุปมา (ไม่ต้องครบทุกไฟล์ถ้าเยอะ — เอาระดับ folder ได้ เช่น `Controllers/`)

### 5.2 Freshness Check (ฝั่ง query — ใช้ใน brain, brain-load)

หลังโหลด notes จาก brain ก่อนใช้ตอบ:

1. **Scope:** เช็คเฉพาะ notes ของ project ปัจจุบัน (projectName ตรงกับ basename ของ cwd) — notes ข้าม project ให้ข้าม check (hash จาก repo อื่นเทียบกับ repo นี้ไม่ได้)
2. Parse `Scanned-At-Commit` จาก notes ที่โหลด — "ใหม่ที่สุด" = อันที่ `Scanned-At` ล่าสุด; ถ้าอันใด hash ตรง HEAD → ถือว่าสดทันที; วันเดียวกันหลาย hash → ใช้อันใดก็ได้ (worst case คือเตือนเกินจริงแล้วถาม — ยอมรับได้)
3. Note ไม่มี footer (pre-v3.2 หรือมาจาก brain-save) → **ข้าม check เงียบๆ** (backward compatible — ห้าม error)
4. **ตรวจ hash ก่อนคำนวณ:** `git cat-file -e "<hash>^{commit}"` — **ต้อง quote argument เสมอ** (PowerShell แตก `^{commit}` เป็น token ถ้าไม่ quote → คำสั่งพังทุกครั้งแม้ hash ถูก) — fail → ไปข้อ 7
5. `git rev-parse --short HEAD` ตรงกับ hash → สด — ใช้ตอบได้เลย ไม่ต้องแสดงอะไร
6. ไม่ตรง → `git rev-list "<hash>..HEAD" --count` = N — **N > 0** → เตือน + **ถามก่อน**:
   ```
   ⚠️ ความรู้ใน Brain เก่ากว่าโค้ด {N} commits (scan ล่าสุด: {date} @ {hash})
   [1] Incremental scan ก่อนตอบ (แนะนำ — สแกนเฉพาะไฟล์ที่เปลี่ยน)
   [2] ตอบจากข้อมูลเดิม (อาจไม่ตรงโค้ดปัจจุบัน)
   ```
   **N = 0 ทั้งที่ hash ≠ HEAD** (checkout tag/branch เก่า — ความรู้**ใหม่กว่า**โค้ดที่เปิดอยู่) → เตือน "ความรู้ใน Brain มาจาก commit {hash} ที่ไม่ตรงกับ HEAD ปัจจุบัน (checkout เก่าหรือคนละ branch)" + ถามชุดเดียวกัน — ห้ามใช้ข้อความ "เก่ากว่า 0 commits"
7. hash ไม่อยู่ใน history (ข้อ 4 fail — คนละเครื่อง/force push) → เตือน "ไม่สามารถระบุความสดได้ (commit {hash} ไม่อยู่ใน history)" + ถามชุดเดียวกัน
8. **จำคำตอบต่อ session** — user เลือก [1] หรือ [2] จาก skill ใดก็ตาม (brain-load ตอน session start หรือ brain query) แล้ว ไม่ถามซ้ำอีกตลอด session นั้น (ทุก query ถัดไปใช้คำตอบเดิม)
9. Non-git project: เทียบ `Scanned-At` กับ modification time ของ `Source-Files` — ถ้ามีไฟล์ใหม่กว่า → เตือน date-based แล้วถามชุดเดียวกัน
10. git/MCP error อื่นใดนอกเหนือจากข้อ 4 (เช่น rev-list/rev-parse fail ทั้งที่ hash มีจริง) → **ข้าม check** ทำงานแบบเดิม (never block)

### 5.3 ฝั่ง scan — commit เป็น primary source ของ "last scan"

brain-scan Smart Scan หา last scan state ตามลำดับ:

1. **Primary:** `Scanned-At-Commit` จาก note ล่าสุดของโปรเจกต์ (นิยาม "ล่าสุด" เดียวกับ §5.2 ข้อ 2 — ต้อง `get-knowledge` โหลด full content จึงเห็น footer) → `git diff --name-only "<hash>..HEAD"` หาไฟล์ที่เปลี่ยน (แม่นสุด — ติดไปกับ brain server ใช้ได้ทุกเครื่อง)
2. Fallback: `.brain/activity-log.json` (local เท่านั้น — ถูก gitignore หายเมื่อย้ายเครื่อง)
3. Fallback สุดท้าย: latest note date + `git log --since="{date}"`
