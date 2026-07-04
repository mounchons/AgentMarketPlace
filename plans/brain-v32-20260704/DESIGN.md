# Design: brain v3.2 — Support-Ready Knowledge (2026-07-04)

**Epic:** `brain-v32` | **Features:** #12–#15 | **Model:** opus + adversarial verification (force_opus_all)

## Problem

ผู้ใช้รับพัฒนาระบบให้ลูกค้าหลายราย เมื่อกลับมา support งานเก่าต้องอ่านโค้ดใหม่ทุกรอบ เพราะ:
1. brain-scan v3.1 ไม่เก็บ: sequence/ER diagram, version ของระบบ (release), deployment topology จากโค้ด, dev setup
2. requirement เก็บได้เฉพาะจากไฟล์เอกสารที่มีอยู่ (Phase 8) — ไม่ integrate กับ system-design-doc plugin
3. **ไม่มี freshness guarantee** — `/brain` ตอบโดยไม่รู้ว่า note เก่ากว่าโค้ดไหม ผู้ใช้จึงไม่กล้าเชื่อ ต้องกลับไปอ่านโค้ดยืนยัน (pain point หลัก)
4. `last_scan_date` ของ Smart Scan อ่านจาก `.brain/activity-log.json` ซึ่ง gitignore — ย้ายเครื่องแล้วประวัติหาย

## Decisions (confirmed by user 2026-07-04)

| Decision | Choice |
|---|---|
| ทิศทาง | ขยาย brain-scan เป็น v3.2 (ไม่สร้าง command ใหม่) |
| กระบวนการ | Long-running pipeline — features เข้า feature_list.json ให้ /continue ทำ |
| Sequence diagram scope | **ทุก dependency map** (ยอม scan ช้าขึ้นเพื่อความครบ) |
| Stale policy | **ถามก่อน scan** — เตือน + ถาม [1] incremental scan [2] ตอบจากข้อมูลเดิม, จำคำตอบต่อ session |

## Files to Modify

| File | Change |
|---|---|
| `plugins/brain/GRAPH_PROTOCOL.md` | เพิ่ม §5 Freshness Protocol + folder categories ใหม่ (`/requirements/`, `/releases/`, `/deployment/`) + domain tags ใหม่ (requirement, release, deployment, diagram) |
| `plugins/brain/skills/brain-scan/SKILL.md` | Phase 2 ขยาย (Dev Setup), Phase 3 ขยาย (ER diagram), Phase 4 ขยาย (sequence ทุก map), Phase 7.5 ใหม่ (Release & Deployment), Phase 8 ขยาย (design-doc first-class), Scan Metadata footer, Smart Scan mapping ใหม่ |
| `plugins/brain/skills/brain/SKILL.md` | Step 1.5: freshness check + ask-before-scan |
| `plugins/brain/skills/brain-load/SKILL.md` | Step 2.5: freshness check ตอน session start |
| `plugins/brain/.claude-plugin/plugin.json` | 3.1.0 → 3.2.0 |
| `.claude-plugin/marketplace.json` | sync version 3.2.0 + description (brain entry ~line 310) |
| `plugins/brain/README.md` | changelog v3.2.0 + ตาราง commands (ถ้า flag ใหม่) |

## F12 — Freshness Protocol (หัวใจ)

### Scan Metadata footer (exact format)

ทุก note ที่ **brain-scan** สร้าง/อัปเดต ต้องลงท้ายด้วย:

```markdown
## Scan Metadata
- Scanned-At-Commit: `<git short hash>`
- Scanned-At: <YYYY-MM-DD>
- Source-Files: `<path1>`, `<path2>`, ...
```

- hash จาก `git rev-parse --short HEAD` ครั้งเดียวต่อ scan run (ทุก note ใน run เดียวกันใช้ hash เดียวกัน)
- **Scope:** เฉพาะ note ที่ derive จากโค้ด (brain-scan ทุก phase) — `brain-save` (conversation knowledge) ไม่บังคับ; `brain-update` ถ้า note เดิมมี footer → refresh footer
- non-git project: ละ `Scanned-At-Commit` เหลือ `Scanned-At` + `Source-Files`

### Freshness check (brain Step 1.5 / brain-load Step 2.5)

1. หลังโหลด notes → parse `Scanned-At-Commit` จาก notes ที่โหลด (ใช้ค่าที่ใหม่สุด)
2. Note ไม่มี footer (pre-v3.2 หรือจาก brain-save) → ข้าม check เงียบๆ (backward compatible)
3. `git rev-parse --short HEAD` == hash → สด ใช้ได้เลย ไม่แสดงอะไร
4. ต่างกัน → `git rev-list <hash>..HEAD --count` = N commits:
   ```
   ⚠️ ความรู้ใน Brain เก่ากว่าโค้ด {N} commits (scan ล่าสุด: {date} @ {hash})
   [1] Incremental scan ก่อนตอบ (แนะนำ — สแกนเฉพาะไฟล์ที่เปลี่ยน)
   [2] ตอบจากข้อมูลเดิม (อาจไม่ตรงโค้ดปัจจุบัน)
   ```
5. hash ไม่อยู่ใน history (`git cat-file -e <hash>` fail — คนละ repo/force push) → เตือนแบบ "ไม่สามารถระบุความสดได้" + ถามเหมือนกัน
6. **จำคำตอบต่อ session** — ผู้ใช้เลือกแล้วไม่ถามซ้ำใน session เดียวกัน (ทั้ง [1] และ [2])
7. non-git: เทียบ `Scanned-At` กับ mtime ของ `Source-Files` — ถ้ามีไฟล์ใหม่กว่า → เตือนแบบ date-based
8. MCP/git error ใดๆ → ข้าม check ทำงานแบบเดิม (never block)

### Smart Scan ใช้ commit แทน activity log

brain-scan Smart Scan (Step 3a) เปลี่ยนลำดับแหล่ง `last_scan_date`:
1. `Scanned-At-Commit` จาก note ล่าสุดของโปรเจกต์ → `git diff --name-only <hash>..HEAD` (แม่นสุด, ติดไปกับ brain server)
2. fallback: `.brain/activity-log.json` (พฤติกรรมเดิม)
3. fallback สุดท้าย: latest note date + `git log --since`

## F13 — Diagrams

### ER Diagram (Phase 3 ขยาย)

- Output note ใหม่: `{Project} - ER Diagram` ใน `/projects/{name}/database/`
- Mermaid `erDiagram` จาก entities ที่สแกน: entity names, PK/FK, relationships + cardinality
- **Split rule:** ≤20 entities → note เดียว; >20 → แยก per-module (`{Project} - ER Diagram: {Module}`) + overview note รวม module-level relationships
- Link `[[{Project} - Entity Models]]` ↔ ER notes

### Sequence Diagram (Phase 4 ขยาย — ทุก dependency map)

- **ทุก** dependency map note (`{Project} - Dependency Map: {Feature}`) แนบ Mermaid `sequenceDiagram` ของ call chain: participants = Page/Endpoint → Function → Service/Manager → Repository → Entity/Table → DB
- แสดง parameters/return หลักเมื่อระบุได้จากโค้ด (ไม่บังคับทุก arrow)
- Smart Scan mapping เพิ่ม: entity/model files เปลี่ยน → regen ER ที่กระทบ; page/controller/service เปลี่ยน → regen sequence ใน map ที่กระทบ (รวมใน Phase 3/4 re-run เดิม)
- Phase 9 เพิ่ม links: ER note ↔ dependency maps ↔ entity models

## F14 — Release, Deployment, Dev Setup

### Phase 7.5 ใหม่: Release & Deployment Scan

**Release History** — output: `{Project} - Release History` ใน `/projects/{name}/releases/`
- Scan: `git tag -l --sort=-creatordate` + dates, `CHANGELOG.md`/`CHANGELOG*`, version fields (`*.csproj` `<Version>`, `package.json` version, `plugin.json`)
- เนื้อหา: ตาราง version | date | highlights + current version ณ HEAD

**Deployment Topology** — output: `{Project} - Deployment Topology` ใน `/projects/{name}/deployment/`
- Scan patterns: `Dockerfile*`, `docker-compose*.yml`, `.github/workflows/*`, `azure-pipelines*.yml`, `Jenkinsfile`, `*.pubxml` (publish profiles), `appsettings.{env}.json` (เทียบ diff ระหว่าง env), `web.config` transforms, `Procfile`, `netlify.toml`, `vercel.json`
- เนื้อหา: deploy ไปไหน (server/cloud/registry), environments อะไรบ้าง + config ต่างกันตรงไหน, pipeline steps สรุป, connection strings ชี้ DB ไหนต่อ env (mask secrets — เก็บชื่อ server/DB ไม่เก็บ password)
- ไม่พบ config เลย → สร้าง note ระบุ "ไม่พบ deployment config ในโค้ด — บันทึกเพิ่มด้วย /brain-save" (ไม่เงียบหาย)

### Phase 2 ขยาย: Dev Setup

- Output note ใหม่: `{Project} - Dev Setup & Run Guide` ใน `/projects/{name}/core/`
- Scan: README (setup sections), `package.json` scripts, `launchSettings.json`, Makefile/`*.ps1`/`*.sh` build scripts, prerequisites (SDK versions จาก `global.json`/`.nvmrc`/`*.csproj` TargetFramework)
- เนื้อหา: how to build / run / test / debug + required tools + local config ที่ต้องตั้ง

### Smart Scan mapping เพิ่ม (F14)

| Changed File Pattern | Re-run Phase |
|---|---|
| Dockerfile*, docker-compose*, .github/workflows/*, azure-pipelines*, Jenkinsfile, *.pubxml | Phase 7.5 |
| CHANGELOG*, git tag ใหม่ (`git tag --contains <last-hash>` มีผล) | Phase 7.5 |
| README*, launchSettings.json, Makefile, global.json | Phase 2 (Dev Setup) |

Phase 10 report tree เพิ่มบรรทัด: `releases/`, `deployment/` + diagram counts

## F15 — Design-doc Integration + Release งาน

### Phase 8 ขยาย: design_doc_list.json first-class

- ก่อน generic .md scan: เช็ค `.design-docs/design_doc_list.json` (schema 2.3.0 ของ system-design-doc plugin)
- ถ้าพบ: อ่าน registry → ต่อ design doc:
  - requirement/AC sections → `{Project} - Requirements: {doc-title}` ใน `/projects/{name}/requirements/`
  - diagrams ที่มี `file_path` (Mermaid สำเร็จรูป: ER, Sequence, Flow, DFD) → embed เข้า note ที่เกี่ยว หรือสร้าง `{Project} - Design Diagrams: {doc-title}` — **ไม่ generate ซ้ำ** ถ้า design doc มีอยู่แล้ว ให้ ER/sequence จาก F13 ระบุที่มา `[Code-derived]` vs `[Design-doc]` และ link ถึงกัน
  - design docs ที่ดึงแล้ว ไม่ต้องเข้า generic scan ซ้ำ
- ไม่พบ → Phase 8 ทำงานแบบเดิมทุกประการ

### GRAPH_PROTOCOL.md updates (แต่ละ feature เพิ่มส่วนของตัวเอง — ไม่มี cross-dependency ย้อนหลัง)

- **F12:** §5 Freshness Protocol ใหม่ (spec ตาม F12)
- **F13:** domain tag `diagram`
- **F14:** categories `releases`, `deployment` + domain tags `release`, `deployment`
- **F15:** category `requirements` + domain tag `requirement`
- Folder Categories list ใน brain-scan + brain-save SKILL.md อัปเดตตาม feature ที่เพิ่ม category นั้น

### Release งาน

- `plugin.json` 3.1.0 → 3.2.0; `marketplace.json` brain entry sync version + description; README changelog
- Validate: `claude plugin validate` ผ่าน + version sync check (node one-liner เทียบ plugin.json vs marketplace.json)

## No-Regression Rules

1. ห้ามแตะ degrade behavior — MCP ล่ม = เตือน + ทำงานต่อ never block
2. ALL responses in Thai — คงทุก skill
3. Path อ้าง protocol ต้องเป็น `${CLAUDE_PLUGIN_ROOT}/GRAPH_PROTOCOL.md` (บทเรียน v3.1.0)
4. Upsert-by-title semantics คงเดิม — diagram notes ใช้ title คงที่เพื่อ update ไม่ duplicate
5. Backward compatible: notes เก่าไม่มี Scan Metadata ต้องไม่ทำให้ query พัง

## Feature Breakdown (feature_list.json)

| # | Feature | Depends | Files หลัก |
|---|---|---|---|
| 12 | Freshness Protocol | — | GRAPH_PROTOCOL.md, brain-scan, brain, brain-load |
| 13 | Diagrams (ER + sequence ทุก map) | 12 | brain-scan |
| 14 | Phase 7.5 Release/Deploy + Dev Setup | 12 | brain-scan, GRAPH_PROTOCOL.md |
| 15 | Design-doc integration + v3.2.0 release | 12, 13, 14 | brain-scan, GRAPH_PROTOCOL.md, plugin.json, marketplace.json, README |

ทุก feature: assigned_model=opus + adversarial verification ตาม force_opus_all
