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

> **Tag detection (v3.2):** `git diff` จับได้แค่ไฟล์ — **tag เป็น ref ไม่ใช่ไฟล์** จึงไม่ surface ใน diff. Smart Scan ต้องเช็ค tag ใหม่แยก: `git tag --contains "{last_scan_commit}"` (tag ที่ชี้ commit หลัง scan ล่าสุด) หรือเทียบ latest tag creatordate กับ note. **Phase 7.5 Release re-run ทุก incremental scan เสมอ** (`git tag -l` ต้นทุนต่ำมาก) เพื่อกัน Release History ค้าง stale เมื่อ tag ทับ commit ที่ scan ไปแล้ว (เคสปกติของการ cut release)

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

- **key=value / key:value** (ครอบทั้ง `.env`/connection-string form และ JSON/YAML form): `Password\s*[:=]`, `Pwd\s*[:=]`, `passwd\s*[:=]`, `AccountKey\s*[:=]`, `client_secret\s*[:=]`, `User Id=`, `Uid=`
- **URL/signature:** `sig=`, `://[^/]*:[^/]*@` (userinfo ใน URL)
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

ใช้กับ skill `brain-export` (graph → bundle) และ `brain-import` (bundle → graph)

**หลักการ:** [Open Knowledge Format v0.1](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing) เป็น **interchange format ไม่ใช่ backend** — graph (Neo4j) ยังเป็น source of truth; OKF bundle = snapshot แบบ portable (เทียบ `pg_dump` ของ database) เอาไปลง git / แชร์ข้ามทีม / เปิดด้วย OKF visualizer ได้โดยไม่ต้องมี MCP server

### 8.1 Bundle Layout

1 project = 1 bundle directory (default: `.brain-export/{project}/`):

```
.brain-export/{project}/
├── index.md              ← จาก MOC note (§8.4)
├── core/
│   ├── index.md          ← จาก sub-MOC (ถ้ามี hub-of-hubs)
│   └── {slug}.md         ← 1 note = 1 ไฟล์
├── workflow/
├── database/
└── changelog/            ← changelog notes export ด้วย (lossless round-trip)
```

- directory = category จาก `folderPath` (`/projects/{project}/{category}/` → `{category}/`); note ที่อยู่ root ของ project (เช่น MOC) → root ของ bundle
- **Folder determination fallback chain** (smoke-tested 2026-07-10 — `get-knowledge` ไม่คืน folderPath และ `explore-graph` แสดง Folder node ไม่ครบทุก note):
  1. `get-project-catalog` (มี folder ต่อ note ครบ) — ทางหลัก
  2. ไม่มี catalog tool → `explore-graph` depth=1 หา Folder node
  3. ยังไม่ได้ → **infer จาก tags**: tag `changelog` → `changelog/` เสมอ; ไม่งั้น tag ที่ตรงชื่อ category ใน §1 — **match ทั้งรูปเอกพจน์และพหูพจน์** (domain tag §1 เป็นเอกพจน์ `dependency`/`permission`/`document`/`release`/`requirement` แต่ category เป็นพหูพจน์ → map เอกพจน์เข้า category พหูพจน์ให้เสมอ); ถ้า match หลายตัว เลือกตัวที่คำนั้นปรากฏใน title ก่อน, ไม่มีในไทเทิลเลย → ตัวแรกตามลำดับ §1; ไม่ match เลย → `core/`
  4. ทุกครั้งที่ใช้ข้อ 3 → รายงาน user ว่า folder เป็นการเดา (อาจไม่ตรง graph จริง)
- **filename slug** จาก title: lowercase (เฉพาะ ASCII), whitespace และ em-dash `—`/en-dash `–` → `-`, **ตัดทิ้ง**: อักขระต้องห้ามของ filesystem (`\ / : * ? " < > |`), `#`, backtick, วงเล็บ `( ) [ ]`, `+`, `&`, `,`, `%`, `'`, `@`, `;`, `=` (กัน URL-hostile filename), ยุบ `-` ซ้ำ, ตัด `-` หัวท้าย; อักษร non-ASCII (ไทย ฯลฯ) คงไว้ตามเดิม; slug ว่างหลังตัดทั้งหมด → ใช้ `untitled`; ชื่อชน → ต่อท้าย `-2`, `-3`
- **Path safety:** segment `{project}` และ `{category}` ใน output path ต้องผ่านกฎตัดอักขระชุดเดียวกับ slug (ห้ามมี `/ \ :` หรือ segment `..`) — ค่าสองตัวนี้มาจาก graph/argument ภายนอก ห้ามใช้ verbatim
- ⚠️ **identity ของ note = frontmatter `title` ไม่ใช่ filename** — slug ใช้แค่ให้ไฟล์ไม่ชนกัน; import ต้อง match note ด้วย title เสมอ (upsert by title ตาม §2)

### 8.2 Frontmatter Mapping (graph → YAML)

| OKF field | จาก graph | หมายเหตุ |
|---|---|---|
| `type` (บังคับ) | **ลำดับแหล่ง:** (1) `category` ของ note (catalog แสดงเป็น `{note_type}/{category}` เช่น `permanent/pattern`) → TitleCase; (2) ไม่มี category → namespace tag `content/{x}` → TitleCase (ค่า hyphenated: ตัด `-` แล้ว capitalize ทุกคำ เช่น `content/how-to` → `HowTo`); (3) ไม่มีทั้งคู่ → `Note` | tag `content/*` หลายตัว → ตัวแรกตามลำดับ alphabetical (ห้ามพึ่งลำดับที่ server คืน — ไม่ stable, ทำ git diff เพี้ยน) — พบจาก round-trip test (2026-07-11): graph มี category field จริง (`pattern`/`overview`) ที่ mapping เดิมมองข้าม |
| `title` | note title ตรงตัว | ห้ามแปลง — คือ identity |
| `description` | summary 1 บรรทัด (จาก catalog หรือประโยคแรกของ content) | |
| `resource` | pointer กลับต้นทาง ถ้า note มีบรรทัด `Source: <URL>` | convention เต็มจะกำหนดใน Feature #18 (resource field) — ระหว่างนี้ใช้บรรทัด `Source: <URL>` ใน content; ไม่มี → ละ field |
| `tags` | tags ทั้งหมดตาม canonical (รวม namespace tags — **ไม่ตัด `content/*` ออก**) | lossless: type เป็นค่า derive ซ้ำได้ |
| `timestamp` | `updatedAt` ของ note (fallback: `createdAt`) ISO8601 | ⚠️ server ปัจจุบัน `get-knowledge` expose แค่ `Created:` → note ที่ update แล้วได้ timestamp เก่ากว่าจริง — จดเป็นงานฝั่ง SecondBrain; ระหว่างนี้ใช้ createdAt |
| `note_type` (extension) | brain note type: `permanent` / `fleeting` / `literature` | OKF อนุญาต key เพิ่ม — importer อื่นข้ามได้ |
| `project` (extension) | projectName | ให้ bundle self-describing |

Body = content ของ note ตรงตัว (รวม `## Version History`, `## Scan Metadata` — เป็นเนื้อหา) **ยกเว้น**:
- wikilinks ถูกแปลงตาม §8.3
- **strip MCP display metadata** — `get-knowledge` แถมของที่ไม่ใช่ content: header block ต้นไฟล์ (`# {title}` + บรรทัด `**Type:** ... | **Tags:** ...` + `**Created:** ...`) และ trailer `**Links to:** ...` ท้ายไฟล์ (มี noteId ดิบ) — ต้องตัดทั้งสองส่วนก่อนเขียน ไม่งั้น title ซ้ำสองชั้น + noteId หลุดเข้า bundle

**Reverse mapping (import — ใช้ใน brain-import):**
- `type` → ถ้า kebab-case(type) ตรง enum `category` ของ `save-knowledge` (concept/entity/pattern/decision/howto/overview/synthesis) → ส่งเป็น param `category` (ไม่ต้องเพิ่ม tag `content/*` ซ้ำ — category เป็น first-class field); ไม่ตรง enum → tag `content/{kebab-case(type)}` (เช่น `Runbook` → `content/runbook`); `type: Note`/`Index` → ไม่เพิ่มอะไร; ถ้า tags ใน frontmatter มี `content/*` อยู่แล้ว → ใช้ของ tags ไม่ derive ซ้ำ
- **folderPath ขา upsert:** note ที่ title ชนของเดิม → **คง folderPath เดิมจาก catalog** (ห้ามย้าย folder เป็น side effect ของ import — graph จริงมี casing ปน เช่น `/projects/AgentMarketPlace/` กับ `/projects/agentmarketplace/`; ส่ง path ที่ derive ใหม่จะสร้าง casing ที่สาม); bundle dir ต่างจาก folder เดิม → รายงานใน dry-run ไม่ย้ายเอง — note ใหม่เท่านั้นที่ใช้ folderPath จาก directory tree
- `note_type` มี → ใช้ตรงตัว; ไม่มี (bundle จากระบบอื่น) → default `literature` (ความรู้จาก external source ตามนิยาม §1)
- `resource` → ส่งเป็น param `source` ของ `save-knowledge` (ตรวจแล้ว 2026-07-11: tool มี field นี้จริง — provenance queries) + บรรทัด `Source: <URL>` ใน content เฉพาะเมื่อยังไม่มี (กันซ้ำกับ bundle ที่ body มี `Source:` อยู่แล้ว); convention เต็มกำหนดใน #18
- `timestamp` → ไม่ round-trip — server กำหนด createdAt/updatedAt เองตอน save; `description` → ไม่ส่ง (server derive summary เอง)
- tags ทุกตัวผ่าน Tag Taxonomy write gate (§1) เสมอ — **lossless-first**: ใช้ชุดจาก frontmatter ตามเดิม เติมได้เฉพาะเมื่อขาด minimum §1 (project tag / ครบ 2 ตัว) และต้องรายงานทุก tag ที่เติม

### 8.3 Link Conversion

- **Export:** `[[Title]]` ที่ resolve เป็น note ใน project เดียวกัน → relative markdown link คำนวณ**จาก directory ของไฟล์ต้นทางเสมอ**: ต้นทางอยู่ root ของ bundle (เช่น `index.md`) → `{category}/{slug}.md`; ต้นทางอยู่ category → same dir = `{slug}.md`, ข้าม category = `../{category}/{slug}.md`; resolve ไม่ได้ (โน้ตข้าม project / broken link) → **คง `[[Title]]` ตามเดิม** + รายงานใน export report (ห้ามเงียบหาย — โยง broken-wikilinks check ของ §7)
- **Link table ต้องรวม MOC:** title ที่ตรง MOC pattern (§8.4) map ไปที่ `index.md` (root) / `{category}/index.md` — **ไม่ใช่** slug ปกติ (ไม่งั้น wikilink `[[{Project} — MOC: Database]]` ใน MOC หลักจะชี้ไฟล์ที่ไม่มีจริง)
- **Import:** relative `.md` link → อ่าน frontmatter title ของไฟล์เป้าหมาย → `[[Title]]`; `[[...]]` ที่คงอยู่ในไฟล์ → เก็บตามเดิม (server สร้าง LINKS_TO อัตโนมัติเมื่อ title มีจริง)

### 8.4 MOC ↔ index.md

- MOC note (`"{Project} — MOC (Map of Content)"`) → `index.md` ที่ root ของ bundle (ไม่ export ซ้ำเป็นไฟล์ปกติ); sub-MOC (`"{Project} — MOC: {Category}"`) → `{category}/index.md`
- **MOC candidate ที่ไม่ตรง pattern** (note ติด tag `moc`/`index` หรือ title มี "Knowledge Map"/"Index" ที่ทำหน้าที่ catalog อยู่แล้ว) → **ถาม user** ว่าใช้เป็น `index.md` หรือ export เป็นไฟล์ปกติ + generate index แยก (ห้ามเดาเอง — กัน index ซ้อนสองชั้นใน bundle)
- ไม่มี MOC → generate `index.md` จาก catalog (1 บรรทัด/note: `[Title](path) — summary`) + ระบุใน frontmatter `type: Index` ว่า generated — **แนะนำรัน `/brain-moc` ก่อน export** เพื่อได้ index ที่ curate แล้ว
- Import: `index.md` ที่ derive จาก MOC (title ตรง MOC pattern) → สร้าง/อัปเดต MOC note ตาม §2 (ไม่ import เป็น note ธรรมดา); `index.md` ที่เป็น **generated index** (frontmatter `type: Index`) → **ข้าม** — ไม่ fabricate MOC note ที่ไม่เคยมีใน graph ต้นทาง (แนะนำ user รัน `/brain-moc` แทนถ้าต้องการ); `index.md` ที่ไม่เข้าทั้งสองเงื่อนไข (bundle จากระบบอื่น — เป็นเนื้อหาจริงตาม OKF progressive disclosure) → import เป็น note ปกติ

### 8.5 กติกาความปลอดภัย + ความสด

- **Pre-write secret check:** ก่อนเขียน bundle ลง disk → scan ทุกไฟล์ด้วย pattern §6.3 — เจอ = หยุด รายงาน user (bundle ไป git/แชร์ต่อ ยิ่งอันตรายกว่า note ใน server)
- Bundle มี staleness ตั้งแต่วินาทีที่ export — ใส่ header ใน `index.md`: `> Exported: {YYYY-MM-DD} @ commit {hash} — snapshot; source of truth คือ graph`
- Export **ไม่แก้ graph** (read-only); Import **ทุก write ผ่าน write gate**: tags ผ่าน Tag Taxonomy (§1), title ชน → upsert, dry-run ก่อนเสมอ (propose-don't-execute ตาม §7.1)
- **Bulk import upsert** ใช้ upsert semantics ของ §2 (save-knowledge title เดิม → server เก็บ version เดิมใน NoteHistory อัตโนมัติ) + ส่ง `reason="brain-import: ..."` — **ไม่สร้าง changelog note ต่อใบ** (changelog-note layer ของ §2 มีไว้สำหรับ interactive edit; bulk import N ใบจะ flood graph ด้วย changelog N ใบ) — audit trail อยู่ที่ NoteHistory + activity log
- **Secret check ขา import (§6.3):** note ที่ scan เจอ secret → ตัดออกจาก write เสมอ ห้าม override (secret เข้า graph แล้วลบถาวรไม่ได้ — §6); user ต้องแก้ไฟล์ใน bundle แล้วรันใหม่
