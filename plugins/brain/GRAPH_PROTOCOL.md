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
   - domain tags: architecture, workflow, database, integration, frontend, permission, dependency, document, diagram, release, deployment, requirement
   - **Tag Taxonomy (v3.3):** server normalize tag อัตโนมัติ (alias → canonical เช่น `efcore`→`ef-core`, `k8s`→`kubernetes`) และ **drop tag ต้องห้าม**: date-string (`2026-06-03`), version tag (`net9`), status flag (`pending`, `auto-generated`) — ห้ามใช้เป็น tag ตั้งแต่ต้น (date → ใส่ใน content/source, status → content หรือ folder)
   - **เลือก tag จาก canonical list ใน description ของ tool `save-knowledge` ก่อนประดิษฐ์ใหม่เสมอ**; tech/project tag ใช้ namespace ได้: `tech/`, `project/`, `domain/`, `audience/`, `solution/`, `pattern/`, `content/`, `problem/`, `source/`
   - หลัง save: อ่าน `Tag normalization:` ใน response — ถ้ามี tag ถูก normalize/drop ให้รายงาน user สั้นๆ; ถ้า tag ใหม่มี suggestion (`similar existing: ...`) ให้พิจารณาใช้ tag เดิมแทนแล้ว save ซ้ำ
3. **folderPath** — ตาม convention: `/projects/{project-name}/{category}/`
   - categories: core, workflow, database, dependencies, permissions, integration, frontend, releases, deployment, requirements, documents, changelog
4. **Duplicate check** — เรียก `mcp__graph-brain__search-knowledge` query="{title}" limit=3 ก่อน save เสมอ
5. **Wiki links** — search related notes แล้วเพิ่ม `[[Related Note Title]]` ใน content
6. **type** — เลือกให้ถูก (enum ฝั่ง server มี 4 ค่า):
   - `permanent`: refined knowledge, architecture, patterns
   - `fleeting`: quick thought, temporary note
   - `literature`: from external source, documentation, article
   - `note`: general (ค่า default ของ server เมื่อไม่ระบุ)
7. **Resource pointer (v3.4)** — note ที่ derive จาก **external source** (URL/บทความ, เอกสารภายนอก, dashboard, ticket, บทสนทนา) ต้องมี pointer กลับต้นทางแบบ **dual-write**:
   - ส่ง param `source` ของ `save-knowledge` (structured — provenance query ฝั่ง server)
   - **และ**บรรทัด `Source: <pointer>` เป็นบรรทัดแรกของ content — จำเป็นเพราะ `get-knowledge` ยังไม่ expose field `source` (ตรวจ 2026-07-11) บรรทัดใน content คือช่องทางเดียวที่ผู้อ่าน/`brain-export` (§8.2) เห็น
   - รูปแบบ pointer: URL เต็ม / path ไฟล์ / `conversation YYYY-MM-DD` / ticket id — แหล่งหลัก 1 บรรทัด แหล่งเสริมเขียนในเนื้อหาปกติ; pointer ที่เป็น URL ต้องผ่าน §6.2 ข้อ 2 ก่อน (strip credential)
   - **ขอบเขต:** ใช้กับ external source เท่านั้น — note ที่ derive จาก**โค้ด/ไฟล์ใน repo** ใช้ `Source-Files` ใน Scan Metadata footer (§5.1) อยู่แล้ว ห้ามใส่ซ้ำสองที่ (สอง mechanism นี้แยกกัน: `Source:` = ของนอก repo + freshness ตาม §5.4, `Source-Files` = ของใน repo + freshness ตาม commit §5.2)

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
> ⚠️ **Scope = GLOBAL by title (พิสูจน์ 2026-07-11):** การ match ไม่ scope ต่อ project — save ด้วย title ที่มีอยู่ใน
> project อื่น จะ **update note ของ project อื่นนั้น** แม้ส่ง projectName ต่างกัน; และ **tags เป็น union**
> (tag เดิมไม่ถูกลบด้วย upsert) — ทุก skill ที่ save ด้วย title ใหม่ต้องเช็คก่อนว่า title ไม่ชนข้าม project
> ทางเลือกที่ตรงกว่า: `mcp__graph-brain__update-knowledge` (ระบุ noteId) ให้ผลเดียวกันแบบ explicit
> ฝั่ง history: server มี `get-note-history` / `restore-note-version` ใช้ดู/ย้อน version ได้โดยตรง —
> changelog notes ในโปรโตคอลนี้เป็น layer เสริมที่ search ได้และ link ใน graph (ตั้งใจให้มีทั้งสองชั้น)

### Step 4: Determine Changelog Number
- Search existing changelogs: `mcp__graph-brain__search-knowledge` query="{Original Title} — Changelog" limit=20
- Count existing changelogs → N = count + 1
- If no changelogs exist → N = 1 (this is the first update, original is v1)

## 3. Search Rules

Search Strategy (เรียงจากเร็วไปลึก):

0. **Catalog First (v3.3 — token saver):** ถ้าคำถามอยู่ในขอบเขต **project เดียวที่รู้ชื่อ** → เรียก `mcp__graph-brain__get-project-catalog` project="{name}" ก่อน — ได้ index ทุกโน้ต (title + summary 1 บรรทัด + folder) ในการเรียกเดียว → เลือกเฉพาะโน้ตที่เกี่ยวแล้ว `get-knowledge` ทีละใบ **แทนการ search วนหลายรอบ**; คำถามข้ามโปรเจกต์/ไม่รู้ขอบเขต → ข้ามไปขั้น 1
1. **Text Search**: `mcp__graph-brain__search-knowledge` query="{keyword}" limit=10
   - ถ้าพบ >= 3 results ที่ตรงกับ query → หยุด ใช้ผลลัพธ์นี้
2. **Tag Search**: `mcp__graph-brain__search-by-tags` tags=["{extracted-keywords}"]
   - ถ้าพบ results → หยุด
   - server expand alias ให้อัตโนมัติ (ค้น `efcore` ครอบโน้ตที่ติด `ef-core`/`entity-framework` ด้วย) — ใช้ canonical tag เป็นหลักแต่ไม่ต้องกังวลข้อมูลเก่า
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
3. Note ไม่มี footer (pre-v3.2 หรือมาจาก brain-save) → **ข้าม check เงียบๆ** (backward compatible — ห้าม error) — **ยกเว้น** note มีบรรทัด `Source:` pointer (external-derived ตาม §1 ข้อ 7) → เช็คแบบ external ตาม §5.4 แทน
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

> **Tag detection (v3.2):** `git diff` จับได้แค่ไฟล์ — **tag เป็น ref ไม่ใช่ไฟล์** จึงไม่ surface ใน diff. Smart Scan ต้องเช็ค tag ใหม่แยก: `git tag --contains "{last_scan_commit}"` (tag ที่ชี้ commit หลัง scan ล่าสุด) หรือเทียบ latest tag creatordate กับ note. **Phase 7.5 Release re-run ทุก incremental scan เสมอ** (`git tag -l` ต้นทุนต่ำมาก) เพื่อกัน Release History ค้าง stale เมื่อ tag ทับ commit ที่ scan ไปแล้ว (เคสปกติของการ cut release)

### 5.4 External Source Freshness (v3.4)

ครอบ note ที่ derive จาก **external source** (มีบรรทัด `Source:` ตาม §1 ข้อ 7 แต่**ไม่มี** Scan Metadata footer — ถ้ามี footer ให้ใช้ §5.2 ตาม commit ซึ่งแม่นกว่า):

1. **ไม่มี commit ให้เทียบ — ใช้เกณฑ์อายุ:** "อายุ" นับจาก**วันล่าสุด**ระหว่าง (ก) บรรทัด `Source-Checked: YYYY-MM-DD` ใต้ `Source:` ถ้ามี (ข) entry ล่าสุดใน `## Version History` (ค) `Created:` ที่ server แสดง — ห้ามใช้ `Created:` อย่างเดียว (note ที่เพิ่ง refresh จะโดนเตือนซ้ำตลอดกาลเพราะ `get-knowledge` ไม่ expose `updatedAt`); อายุ**เกิน 90 วัน** และ note ถูกใช้เป็นแหล่งหลักของคำตอบ → เตือน + ถามก่อน:
   ```
   ⚠️ ความรู้นี้มาจาก external source บันทึก/ตรวจล่าสุดเมื่อ {date} ({N} วันก่อน) — ต้นทางอาจเปลี่ยนแล้ว
   Source: {pointer}
   [1] เปิด/fetch source ซ้ำแล้ว update note ก่อนตอบ (แนะนำเมื่อ pointer เป็น URL/ไฟล์ที่เข้าถึงได้)
   [2] ตอบจากข้อมูลเดิม (ระบุวันที่บันทึกในคำตอบ)
   ```
   **จุดเช็ค:** `/brain` (query) เช็คเฉพาะ note ที่ใช้เป็นแหล่งหลักของคำตอบนั้น; `/brain-load` (session start) **ไม่ถาม** — แค่นับ external note ที่อายุเกินแล้วรายงานบรรทัดเดียวใน load summary (คำถามเกิดครั้งแรกที่ note ถูกใช้ตอบจริง)
2. **Tie-break ด้วยรูปแบบ pointer:** pointer ที่เป็น **URL หรือ path ไฟล์** → ใช้ข้อ 1 เสมอ (รวม ticket ที่เป็น URL — fetch ไม่ได้ก็ตกข้อ 4 อยู่แล้ว); pointer ที่**ไม่ใช่** URL/path (`conversation YYYY-MM-DD`, meeting, ticket id เปล่าๆ) → fetch ซ้ำไม่ได้ → ข้าม check เงียบๆ — เตือนได้อย่างเดียวว่าข้อมูลเป็น snapshot ณ วันนั้นเมื่อ user ถามเจาะจง
3. **จำคำตอบต่อ session** — กลไกเดียวกับ §5.2 ข้อ 8 แต่**คนละคำถาม คนละ memory** (commit-staleness กับ external-staleness ความหมาย [1] ต่างกัน) — แต่ละแบบถามได้อย่างมาก 1 ครั้งต่อ session
4. **Never block** — fetch fail / URL ตาย → แจ้งสั้นๆ ว่า source ไม่ available แล้วตอบจากข้อมูลเดิม (พร้อมระบุวันที่บันทึก); ระบุอายุไม่ได้ (ไม่มี `Created:` / parse date ไม่ได้) → **ข้าม check** (catch-all เดียวกับ §5.2 ข้อ 10); ห้าม error ห้ามวน retry
5. user เลือก [1] → fetch แล้วต่างจาก note → update ผ่าน Versioning Protocol §2 (reason ระบุ "refresh from source") **+ เขียน/อัปเดตบรรทัด `Source-Checked: {YYYY-MM-DD}` ใต้บรรทัด `Source:`** (ให้ข้อ 1 เห็นว่าเพิ่งตรวจ — แม้เนื้อหาไม่ต่างก็เขียนบรรทัดนี้ได้โดยไม่ต้องทำ §2 เต็มรูป)
6. **Scope:** ตาม §5.2 ข้อ 1 (เฉพาะ project ปัจจุบัน) โดยเจตนา — age check ไม่พึ่ง git ก็จริง แต่ notes ข้าม project มักถูกโหลดเป็น context เสริม การเตือนทุก project ที่แตะจะ noisy เกิน; ถ้า note ข้าม project ถูกใช้เป็นแหล่งหลักจริง agent เตือนแบบ informational ได้โดยไม่ถาม

## 6. Secret Masking Protocol

**กฎกลาง — ทุก skill/phase ที่อ่าน config, deployment, connection, CI/CD, หรือ credential file ต้องปฏิบัติ ก่อน save เข้า brain**

> ⚠️ **ทำไมสำคัญ:** notes ไป external Neo4j ที่ share ทุกเครื่อง search/traverse ได้ + upsert เก็บ version snapshot อัตโนมัติ + `get-note-history`/`restore-note-version` + changelog "Previous Content Summary" → **secret ที่หลุดเข้าไปแล้วลบด้วยการ edit note ไม่ได้ ค้างถาวรใน version history** ถ้าพลาด save secret ให้แจ้ง user ทันทีเพื่อ purge/rotate credential

### 6.1 นิยาม "secret" (ครอบคลุม — ไม่ใช่ enumeration ปิด)

ค่าลับใดๆ ที่ถ้าหลุดแล้วเข้าถึงระบบได้:
- `password`, `pwd`, `Password=`
- `*Key`, `AccountKey=`, `SecretAccessKey`, `aws_secret_access_key`, `private_key`, `-----BEGIN ... KEY-----`
- `*Secret`, `ClientSecret`, `client_secret`
- `token`, `SAS sig=`, bearer token, JWT, `AKIA...` (AWS access key id)
- **username/User Id/Uid/AccountName** — เป็นครึ่งหนึ่งของ credential ต้อง mask ด้วย

### 6.2 กฎ extract (mask ก่อน save — ไม่ใช่ mask ทีหลัง)

1. **Connection string:** extract **เฉพาะ Server + Database name เป็น field แยก** (เช่น `DB: Orders @ prod-sql.internal`) — **ห้ามเก็บ connection string เป็นสตริงเดียวแม้ mask password แล้ว** (จะเหลือ username/security posture หลุด)
2. **Endpoint/URL:** strip credential ที่ฝังใน URL ก่อนเก็บ — ตัด userinfo (`user:pass@`), SAS query signature (`sig=`/`se=`/`sp=`), pre-signed token; เก็บเฉพาะ `scheme+host+path`
3. **Literal vs reference:** `${{ secrets.X }}`, `${VAR}`, vault ref, `appsettings` key ที่ชี้ env var = เก็บ**ชื่อ ref** ได้ (ปลอดภัย); ค่า **literal** ใน `environment:`/`ENV`/`ARG`/`<appSettings>` = **mask**
4. **Config diff ต่อ env:** เก็บ **ชื่อ key/setting ที่ต่าง** ไม่ใช่ค่า — ถ้า delta เป็น secret เก็บแค่ `"key X ต่างต่อ env"` ห้ามค่าจริง
5. แทนค่า secret ที่ต้องแสดงตำแหน่งด้วย `***` หรือ `<masked>` (แต่ข้อ 1-2 คือ "ไม่เก็บทั้งเส้น" ไม่ใช่ "เก็บแล้ว mask")

### 6.3 Pre-save sanity check

ก่อน save note ที่ derive จาก config/deployment → scan content หา pattern ทั้งชุด — ถ้าเจอ = ยังไม่ได้ mask → แก้ก่อน save:

- **key=value / key:value** (ครอบทั้ง `.env`/connection-string form และ JSON/YAML form): `Password\s*[:=]`, `Pwd\s*[:=]`, `passwd\s*[:=]`, `AccountKey\s*[:=]`, `client_secret\s*[:=]`, `ClientSecret\s*[:=]`, `SecretAccessKey\s*[:=]`, `aws_secret_access_key\s*[:=]`, `ApiKey\s*[:=]`, `private_key\s*[:=]`, `User Id=`, `Uid=` (ชุดนี้ต้อง sync กับ §6.1 — เจอรูปใหม่ใน §6.1 ที่ scan ไม่จับ ให้เพิ่ม pattern ทันที)
- **URL/signature:** `sig=`, `://[^/]*:[^/]*@` (userinfo ใน URL — **ฝั่ง user ว่างได้** เช่น `redis://:pass@host` ต้องจับ)
- **Masked value ไม่ใช่ hit:** ค่าเป็น `***` หรือ `<masked>` หลัง key = mask แล้วตาม §6.2 ข้อ 5 → รายงานเป็น info ได้ แต่**ไม่ถือเป็น secret hit** (ไม่งั้นเอกสารที่ mask ถูกต้อง — รวมโน้ตที่อธิบาย §6 เอง — จะ export/import ไม่ได้เลย); นโยบาย block-no-override ใช้กับค่า literal เท่านั้น
- **Scan ที่ payload สุดท้าย:** ต้อง scan สิ่งที่จะเขียนจริงหลังประกอบเสร็จ (content หลังแปลง link/เติมบรรทัด `Source:` + ค่า field ทุกตัวรวม `source`/`resource`/title/description) — ห้าม scan input กลางทางแล้วเติมข้อมูลทีหลัง
- **Token literals** (จับตัว token เองไม่ว่าอยู่ใน key อะไร): `AKIA`/`ASIA` + 16 ตัวอักษร (AWS), `ghp_`/`github_pat_` (GitHub), `xox[baprs]-` (Slack), `sk-` (API key ทั่วไป/Anthropic/OpenAI), `eyJ` ต่อด้วย base64 ยาว (JWT), `Bearer ` + token ยาว, `-----BEGIN` (PEM key)

> ชุด pattern นี้ใช้ทั้งขา save เข้า brain และขา export ลง bundle (§8.5) — ขา export สำคัญกว่าเพราะไฟล์ไป git/แชร์ต่อ และครอบ notes เก่าที่ save ก่อนมี masking rules

## 7. Lint Protocol (v3.3)

ใช้กับ skill `brain-lint` และทุกครั้งที่เรียก tool `mcp__graph-brain__brain-lint`

### 7.1 กฎเหล็ก: Propose, Don't Auto-Execute

- lint **รายงานอย่างเดียว** — ห้ามแก้/ลบ/merge อะไรโดยไม่ถาม user ก่อน **ทุกกรณี**
- duplicate-tags มี false positive โดยธรรมชาติ (edit distance วัด "สะกดคล้าย" ไม่ใช่ "ความหมายเดียวกัน" เช่น `sonnet`↔`dotnet`) → ต้องให้คนตัดสินทีละคู่ ห้าม merge ทั้ง batch โดยไม่ไล่ดู
- fix ที่ deterministic (คู่ที่ user ยืนยันแล้ว) เสนอเป็นชุดแล้วขอ confirm ครั้งเดียวได้

### 7.2 เครื่องมือ fix ต่อ finding

| Finding | วิธี fix หลัง user ยืนยัน |
|---|---|
| duplicate-tags | `mcp__graph-brain__merge-tags` from={alias} to={canonical} ทีละคู่ |
| metadata-tags | แจ้ง user ให้รัน `POST /api/tags/migrate` (จัดการทั้ง registry รอบเดียว + เก็บค่าลง note ก่อนลบ) |
| orphan-notes / low-link-density | เสนอ `[[wikilink]]` จาก link-suggestions → `update-knowledge` เพิ่ม link ใน content (ทำตาม Versioning Protocol §2) |
| broken-wikilinks | แก้ typo หรือสร้างโน้ตเป้าหมาย — ถาม user ว่าเจตนาไหน |
| mirror-notes | เสนอ merge เนื้อหาเข้าโน้ต synthesis ที่ใกล้เคียง → update โน้ตปลายทาง + archive ต้นทาง |
| stale-notes | เช็คกับ Freshness Protocol §5 — code-derived → เสนอ incremental scan; อื่นๆ → ถาม user |

### 7.3 Cadence

- รัน lint เต็มชุดเป็นรอบ (แนะนำสัปดาห์ละครั้ง หรือหลัง brain-scan ใหญ่)
- ทุกรอบ lint ลง activity log (`.brain/activity-log.json`) command="brain-lint" พร้อม findings count ต่อ check

## 8. OKF Interchange Mapping (v3.4)

Used by the skills `brain-export` (graph → bundle) and `brain-import` (bundle → graph)

**Principle:** [Open Knowledge Format v0.1](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing) is an **interchange format, not a backend** — the graph (Neo4j) is still the source of truth; an OKF bundle = a portable snapshot (like a database `pg_dump`) that you can commit to git / share across teams / open with the OKF visualizer without an MCP server

### 8.1 Bundle Layout

1 project = 1 bundle directory (default: `.brain-export/{project}/`):

```
.brain-export/{project}/
├── index.md              ← from the MOC note (§8.4)
├── core/
│   ├── index.md          ← from a sub-MOC (if there is a hub-of-hubs)
│   └── {slug}.md         ← 1 note = 1 file
├── workflow/
├── database/
└── changelog/            ← changelog notes are exported too (lossless round-trip)
```

- directory = category from `folderPath` (`/projects/{project}/{category}/` → `{category}/`); a note at the project root (e.g. the MOC) → the bundle root
- **Folder determination fallback chain** (smoke-tested 2026-07-10 — `get-knowledge` does not return folderPath and `explore-graph` shows the Folder node for only some notes):
  1. `get-project-catalog` (has the folder for every note) — the main path
  2. no catalog tool → `explore-graph` depth=1 to find the Folder node
  3. still nothing → **infer from tags**: tag `changelog` → always `changelog/`; otherwise a tag matching a category name in §1 — **match both singular and plural forms** (a §1 domain tag is singular `dependency`/`permission`/`document`/`release`/`requirement` but the category is plural → always map the singular into the plural category); if several match, pick the one whose word appears in the title first, none in the title → the first in §1 order; no match at all → `core/`
  4. whenever rule 3 is used → report to the user that the folder is a guess (may not match the real graph)
- **filename slug** from the title: lowercase (ASCII only), whitespace and em-dash `—`/en-dash `–` → `-`, **drop**: filesystem-forbidden characters (`\ / : * ? " < > |`), `#`, backtick, brackets `( ) [ ]`, `+`, `&`, `,`, `%`, `'`, `@`, `;`, `=` (avoid URL-hostile filenames), collapse repeated `-`, trim leading/trailing `-`; non-ASCII characters (Thai etc.) are kept as-is; slug empty after all dropping → use `untitled`; a resulting slug equal to `log` or `index` → always append `-2` (reserved by OKF meaning: `log.md` = change history, `index.md` = MOC/index — §8.4); name collision → append `-2`, `-3`
- **Path safety:** the `{project}` and `{category}` segments in the output path must pass the same character-dropping rules as the slug (must not contain `/ \ :` or a `..` segment) — these two values come from the graph/external argument, must not be used verbatim
- ⚠️ **a note's identity = frontmatter `title`, not the filename** — the slug only keeps files from colliding; import must always match a note by title (upsert by title per §2)

### 8.2 Frontmatter Mapping (graph → YAML)

| OKF field | from graph | notes |
|---|---|---|
| `type` (required) | **source order:** (1) the note's `category` (the catalog shows it as `{note_type}/{category}`, e.g. `permanent/pattern`) → TitleCase; (2) no category → namespace tag `content/{x}` → TitleCase (hyphenated value: drop `-` then capitalize every word, e.g. `content/how-to` → `HowTo`); (3) neither → `Note` | multiple `content/*` tags → the first in alphabetical order (must not rely on the order the server returns — not stable, makes git diff noisy) — found via the round-trip test (2026-07-11): the graph has a real category field (`pattern`/`overview`) the old mapping overlooked |
| `title` | note title verbatim | must not transform — it is the identity |
| `description` | 1-line summary (from the catalog or the first sentence of content) | |
| `resource` | pointer back to the source, from the `Source: <pointer>` line in content (convention §1 item 7 — dual-write; read from the line because the server does not yet expose the `source` field through get-knowledge) | no `Source:` line → omit the field; once the server exposes the field → read from the field first, fall back to this line |
| `tags` | all tags per canonical (including namespace tags — **do not drop `content/*`**) | lossless: type is a re-derivable value |
| `timestamp` | the note's `updatedAt` (fallback: `createdAt`) ISO8601 | ⚠️ the current server `get-knowledge` exposes only `Created:` → a note that has been updated gets an older-than-real timestamp — noted as SecondBrain-side work; use createdAt meanwhile |
| `note_type` (extension) | brain note type: `permanent` / `fleeting` / `literature` / `note` (the server's full enum — `note` = general default) | OKF allows extra keys — other importers can skip them |
| `project` (extension) | projectName | makes the bundle self-describing |

Body = the note's content verbatim (including `## Version History`, `## Scan Metadata` — these are content) **except**:
- wikilinks are converted per §8.3
- **strip MCP display metadata** — `get-knowledge` adds things that are not content: a header block at the top of the file (`# {title}` + a `**Type:** ... | **Tags:** ...` line + `**Created:** ...`) and a `**Links to:** ...` trailer at the end (with a raw noteId) — both must be stripped before writing, otherwise the title is doubled + the noteId leaks into the bundle

**Reverse mapping (import — used in brain-import):**
- `type` → if kebab-case(type) matches the `category` enum of `save-knowledge` (concept/entity/pattern/decision/howto/overview/synthesis) → **always** send as param `category` (category is a first-class field); not in the enum → tag `content/{kebab-case(type)}` (e.g. `Runbook` → `content/runbook`); `type: Note`/`Index` → add nothing; the clause "if the frontmatter tags already have `content/*` → do not derive again" applies **only to the derive-tag branch** — it does not suppress sending the category param
- **folderPath on upsert:** a note whose title collides with an existing one → **keep the original folderPath from the catalog** (must not move the folder as a side effect of import — the real graph has mixed casing, e.g. `/projects/AgentMarketPlace/` and `/projects/agentmarketplace/`; sending a re-derived path would create a third casing); bundle dir differs from the original folder → report in the dry-run, do not move it — only new notes use the folderPath from the directory tree
- `note_type` present and in the enum (`note`/`fleeting`/`literature`/`permanent`) → use as-is; missing or out-of-enum (bundle from another system) → default `literature` (knowledge from an external source per the §1 definition) + note in the report
- `resource` → dual-write per §1 item 7: send as the `source` param of `save-knowledge` + a `Source: <pointer>` line in content only when not already present (avoid duplicating a bundle whose body already has `Source:`)
- `timestamp` → does not round-trip — the server sets createdAt/updatedAt itself on save; `description` → not sent (the server derives the summary itself)
- every tag passes the Tag Taxonomy write gate (§1) always — **lossless-first**: use the set from frontmatter as-is, add only when below the minimum (project tag / reaching 2 tags — the import side uses the count criterion only, it does not enforce the domain-tag composition of §1 which applies to the normal save path) and must report every added tag

### 8.3 Link Conversion

- **Export:** `[[Title]]` that resolves to a note in the same project → a relative markdown link computed **always from the source file's directory**: source at the bundle root (e.g. `index.md`) → `{category}/{slug}.md`; source in a category → same dir = `{slug}.md`, across categories = `../{category}/{slug}.md`; unresolvable (cross-project note / broken link) → **keep `[[Title]]` as-is** + report in the export report (must not vanish silently — ties into the broken-wikilinks check of §7)
- **The link table must include MOCs:** a title matching the MOC pattern (§8.4) maps to `index.md` (root) / `{category}/index.md` — **not** the normal slug (otherwise the wikilink `[[{Project} — MOC: Database]]` in the main MOC would point to a nonexistent file)
- **Import:** `.md` links, both **relative** and **root-absolute** (`[x](/tables/customers.md)` — counted from the bundle root, the format used in Google's OKF examples) → resolve into the title table (title per the importer's identity fallback — not limited to frontmatter) → `[[Title]]`; `[[...]]` already present in a file → keep as-is
- **The server creates LINKS_TO only at save time and does not backfill retroactively** (proven 2026-07-11: a note whose wikilink points to a title that does not yet exist gets no edge even if the target note is created later) → a bundle with several **create** notes linking to each other: after writing all of them, **re-save a second pass** for just the notes whose wikilinks point to notes created later, to complete the edges

### 8.4 MOC ↔ index.md (v3.4.1: index.md is frontmatter-free per SPEC.md §6)

**OKF rule (SPEC.md §6/§11 — verbatim):** "Index files contain no frontmatter." The only exception is `okf_version` at the **root `index.md` only** ("the only place frontmatter is permitted in an `index.md`" — see §8.6) → brain keeps an index's marker/identity in an **HTML comment on the first line of the body** (`<!-- okf:moc -->` / `<!-- okf:generated-index -->`), not frontmatter — an OKF consumer can ignore the comment, brain-import uses it to classify; a MOC title can already be reconstructed from project+position (§8.1) so there is no need to rely on frontmatter `title`

**Export (graph → index.md) — always body-only:**
- MOC note (`"{Project} — MOC (Map of Content)"`) → `index.md` at the bundle root (do not export it again as a normal file); sub-MOC (`"{Project} — MOC: {Category}"`) → `{category}/index.md` — write **only the MOC content** (drop the MOC note's frontmatter) + first line `<!-- okf:moc -->`
- no MOC → generate `index.md` from the catalog (1 line/note: `[Title](path) — summary`) + first line `<!-- okf:generated-index -->` (**replacing** the old frontmatter `type: Index`) — **suggest running `/brain-moc` before export** for a curated index
- **a MOC candidate not matching the pattern** (a note tagged `moc`/`index` or a title with "Knowledge Map"/"Index" that already acts as a catalog) → **ask the user** whether to use it as `index.md` or export it as a normal file + generate a separate index (do not guess — avoid a double-nested index in the bundle)
- **order in the body:** the `<!-- okf:… -->` comment always precedes the `> Exported: …` blockquote header (§8.5); both live in the body — an index.md's frontmatter is empty, except the root which has `okf_version` (§8.6)

**Import (index.md → graph) — classify in order (a reserved filename does not go through the "must have `type`" rule):**
1. **root `index.md`:** read `okf_version` (frontmatter — the only place allowed) → validate per §8.6 (warn on major mismatch in the dry-run) before classifying further
2. body first line `<!-- okf:moc -->` **or** (legacy v3.4.0) frontmatter `title` matching the MOC pattern → create/update a **MOC note**: title = (a) frontmatter `title` if present, otherwise (b) reconstruct from target project + position (root → `"{target} — MOC (Map of Content)"`; `{category}/` → `"{target} — MOC: {TitleCase(category)}"`); **content = the body after stripping the `<!-- okf:… -->` comment first line + the `> Exported:` blockquote header (added by export, not MOC content — not stripping it bloats every round-trip into version churn) then trim whitespace (§8.2)**; per upsert §2 + the bulk rule §8.5 (**no changelog note**); source ≠ target (the project in title/reconstruct does not match) → **ask the user** ([1] rename to target [2] original name [3] skip); **do not import as a normal note**
3. body first line `<!-- okf:generated-index -->` **or** (legacy v3.4.0) frontmatter `type: Index` → **skip** — do not fabricate a MOC note that never existed in the source graph (suggest the user run `/brain-moc` instead)
4. any other index.md (bundle from another system — frontmatter-free, no okf marker) = OKF navigation per §6 (not a concept) → **skip** as a concept + report it as a `/brain-moc` candidate; **except** if it has frontmatter `type` other than `Index`/MOC (some producers put real content there) → import as a normal note

### 8.5 Safety + Freshness Rules

- **Pre-write secret check:** before writing the bundle to disk → scan every file with the pattern set §6.3 — found = stop, report to the user (a bundle goes to git / is shared onward, even more dangerous than a note in the server)
- A bundle has staleness from the second it is exported — put a header in `index.md`: `> Exported: {YYYY-MM-DD} @ commit {hash} — snapshot; source of truth is the graph`
- Export **does not modify the graph** (read-only); Import **routes every write through the write gate**: tags pass the Tag Taxonomy (§1), title collision → upsert, always dry-run first (propose-don't-execute per §7.1)
- **Bulk import upsert** uses the upsert semantics of §2 (save-knowledge with an existing title → the server keeps the old version in NoteHistory automatically) + sends `reason="brain-import: ..."` — **no changelog note per note** (the changelog-note layer of §2 is meant for interactive edits; a bulk import of N notes would flood the graph with N changelogs) — the audit trail lives in NoteHistory + the activity log
- **Secret check on import (§6.3):** a note that scans as containing a secret → always dropped from the write, no override (a secret that has entered the graph cannot be permanently deleted — §6); the user must fix the file in the bundle and rerun

### 8.6 OKF Version Declaration (v3.4.1)

brain supports **OKF v0.1** (the whole §8 mapping) — a bundle declares the spec version it targets per SPEC.md §11

- **Export:** the bundle's root `index.md` gets frontmatter **`okf_version: "0.1"`** — SPEC.md §11: *"Bundles MAY declare the OKF version … in a bundle-root `index.md` frontmatter block (the only place frontmatter is permitted in an `index.md`)"* → this is the **only place in the bundle** where an index has frontmatter; concept files still have full frontmatter per §8.2 as usual (a concept is not a reserved file)
- **Import:** read `okf_version` from the root `index.md` **before classifying the index** (§8.4 item 1):
  - no field → pre-declaration bundle (e.g. a v3.4.0 bundle or another system) → import may continue (the field is optional) + note in the report
  - major = `0` (e.g. `0.1`, `0.2`) → brain understands the mapping → import as usual
  - major ≠ `0` (e.g. `1.x`) → **warn in the dry-run**: the bundle targets a spec newer than brain v3.4.1 understands (new fields/formats may be dropped from the §8 mapping) → user confirms before writing
- **Validation (export step 7 / import parse):** check that every `index.md` is frontmatter-free **except** the root, which may have only `okf_version` — any other key in an index.md's frontmatter → export fixes it before reporting success; import classifies per §8.4 (legacy frontmatter is still accepted for backward-compat)

### 8.7 log.md — Change History (v3.4.2)

OKF `log.md` (SPEC.md §7) = a change-history file: date-grouped (newest first), `YYYY-MM-DD` headings, prose entries prefixed with bold action keywords (`**Creation**`, `**Update**`). Like `index.md` it is a **reserved, frontmatter-free** file (SPEC.md forbids frontmatter in `log.md`).

**Export (graph → log.md) — one root `log.md` per bundle, body-only:**
- First line marker `<!-- okf:changelog -->`, then `# Changelog`, then date sections newest-first.
- **Default source = the timestamps already fetched in the per-note pass (§8.2) — no extra MCP calls:** each note contributes `- **Creation** [Title](relative-path)` dated by `createdAt`; if `updatedAt` is available and later than `createdAt`, add `- **Update** [Title](relative-path)` on the `updatedAt` date. ⚠️ the current server `get-knowledge` exposes only `Created:` (§8.2), so in practice most entries are `**Creation**`; richer `**Update**` history needs `--history-detail`.
- Group entries by `YYYY-MM-DD`, **newest date first**; within a date sort by title. Links are relative to the bundle root (`{category}/{slug}.md`, same table as §8.3).
- **`--history-detail` (opt-in — costs N extra calls):** for each note also call `mcp__graph-brain__get-note-history` → emit one `**Update**` entry per version with its changelog reason; **warn about the extra call/token cost first** (same threshold as the >100 notes warning). Not default because it doubles the call count.
- `log.md` is **derived and export-only** (like a generated `index.md`) — it does not round-trip and is not a concept; a note whose slug would be `log` is renamed to `log-2` (§8.1) so it never collides with the change-history file.

**Import (log.md → graph):** a frontmatter-free `log.md` (OKF change history) is **skipped** — brain's NoteHistory (§2/§6) is the internal source of truth and the server sets its own timestamps (§8.2: `timestamp` does not round-trip), so re-ingesting a derived log would be redundant and lossy. Handled by §8.4 reserved-file routing + the `log.md` rule in brain-import step 2 (a `log.md` that *does* carry a frontmatter `title` = a real note from an older export → imported normally).
