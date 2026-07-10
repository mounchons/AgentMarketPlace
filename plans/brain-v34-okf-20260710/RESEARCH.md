---
title: "Open Knowledge Format (OKF) → brain v3.4 Design Mapping"
date: 2026-07-10
status: research-complete, ready for feature breakdown
based_on:
  - plans/brain-v33-llmwiki-20260710/RESEARCH.md (llm-wiki research — อ่านก่อน ห้ามค้นคว้าซ้ำ)
  - plans/brain-v33-llmwiki-20260710/SERVER_ANALYSIS.md (SecondBrain architecture)
sources:
  - https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing (Google, OKF v0.1 announcement)
---

# Open Knowledge Format (OKF) → brain v3.4 Design Mapping

> ผลวิเคราะห์บทความ OKF ของ Google เทียบกับ brain v3.3
> **ข้อสรุปหลัก: รับ OKF เป็น "ชั้น export/interchange" — ไม่แทน Neo4j backend**
> **อ่านไฟล์นี้ก่อนเริ่มทุก feature ใน epic brain-v34-okf — ห้ามค้นคว้าซ้ำ**

---

## 1. OKF คืออะไร (สรุปจากบทความ)

**Open Knowledge Format v0.1** = สเปกกลาง vendor-neutral ที่ formalize llm-wiki pattern
(pattern เดียวกับที่ brain v3.3 implement ไปแล้ว: taxonomy/lint/MOC) ให้เป็น
รูปแบบไฟล์ portable สำหรับแลกเปลี่ยน metadata + context + curated knowledge ระหว่างระบบ

### 1.1 โครงสร้าง

- **Bundle = directory ของไฟล์ markdown** — 1 concept = 1 ไฟล์, file path = identity
  ```
  sales/
  ├── index.md
  ├── tables/
  │   ├── index.md
  │   ├── orders.md
  │   └── customers.md
  └── metrics/
      └── weekly_active_users.md
  ```
- **YAML frontmatter**: `type` (บังคับตัวเดียว), `title`, `description`,
  `resource` (URL กลับระบบต้นทาง), `tags`, `timestamp`
- **Body = markdown ธรรมดา** — schema tables, join paths, runbooks
- **Relationships = markdown links** ปกติ: `[customers](/tables/customers.md)`
- `index.md` (optional) = progressive disclosure; `log.md` (optional) = change history

### 1.2 หลักการออกแบบ

1. **Minimally opinionated** — บังคับแค่ `type`
2. **Producer/consumer independence** — format คือ contract; ใครเขียน (คน/agent/vendor
   export) กับใครอ่าน (agent/visualizer/LLM อื่น) สลับได้อิสระ
3. **Format, not platform** — ไม่มี SDK บังคับ, ไม่มี cloud lock-in; ship เป็น
   tarball / git repo / filesystem mount ได้

### 1.3 Reference implementations ที่ Google เผยแพร่

- **Enrichment Agent** — เดิน BigQuery dataset → draft OKF docs (citations/schemas/join paths)
- **Static HTML Visualizer** — แปลง bundle → interactive graph, self-contained ไม่มี backend
- **Sample bundles** — GA4 e-commerce, Stack Overflow, Bitcoin datasets

---

## 2. Scorecard: OKF vs brain v3.3

| แนวคิด OKF | brain v3.3 | สถานะ |
|---|---|---|
| `index.md` progressive disclosure | `/brain-moc` (MOC per project) | ✅ มีแล้ว |
| Controlled `type`/tags | tag-taxonomy.json + namespace enum + `/brain-lint` | ✅ มีแล้ว |
| Markdown links เป็น graph | Neo4j LINKS_TO + explore-graph | ✅ brain เหนือกว่า (traversal จริง) |
| `timestamp` staleness | Freshness Protocol (commit-hash based) | ✅ brain เหนือกว่า |
| `log.md` change history | NoteHistory + activity log | ✅ brain เหนือกว่า |
| `resource` field (URL กลับต้นทาง) | ไม่มี structured convention — ฝังในเนื้อหา | 🟡 gap → **F3** |
| **Portable bundle (git/tarball) แลกเปลี่ยนข้ามระบบ** | ❌ ความรู้อยู่ใน Neo4j เข้าถึงได้ทาง MCP เท่านั้น | 🔴 gap ตัวจริง → **F1, F2** |
| Static HTML visualizer | ❌ ไม่มี | 🟡 ได้ฟรีเมื่อ export ได้ → F1 |

**การ map graph → OKF แทบ 1:1:**
Note node → `.md` + frontmatter · LINKS_TO → markdown link · MOC → `index.md` ·
folderPath → directory path · tags → `tags` · namespace tag (`content/…`) → `type`

**จุดที่ OKF ด้อยกว่า brain (เหตุผลที่ไม่ย้าย backend):** ไม่มี graph traversal,
ไม่มี versioning (พึ่ง git อย่างเดียว), ไม่มี typed relationships, ไม่มี cross-project
connection, staleness เป็นแค่ timestamp ไม่ผูก source commit

---

## 3. ทิศทาง v3.4: OKF เป็น pg_dump ของ brain

หลักคิด: ระบบเก็บข้อมูลแบบ rich (Neo4j graph) + interchange format แบบ
dumb-but-portable (OKF files) — เสริมกัน ไม่แข่งกัน (pattern เดียวกับ database + `pg_dump`)

ประโยชน์ที่ได้ทันที:
1. ความรู้ per-project เก็บลง git ได้ (review/diff/backup)
2. แชร์ให้คน/agent/ทีมอื่นที่ไม่มี graph-brain MCP ได้
3. ใช้ Static HTML Visualizer ของ Google ดู knowledge graph ได้ฟรี
4. รับ bundle จากภายนอก (เช่น enrichment agent อื่น) เข้า graph โดยผ่าน
   write gate ที่มีอยู่แล้ว (taxonomy + lint)

---

## 4. Proposed Epic: `brain-v34-okf`

| # | Feature | สาระ | Effort | Files (คาดการณ์) |
|---|---|---|---|---|
| 1 | `/brain-export` → OKF bundle | dump per-project จาก graph เป็น OKF directory: note→`.md`+frontmatter (type/title/description/resource/tags/timestamp), LINKS_TO→relative markdown links, MOC→`index.md`, folder convention→directory tree; option `--all-projects`; output default `.brain-export/{project}/` | กลาง | skills/brain-export/SKILL.md (ใหม่), GRAPH_PROTOCOL.md (§ใหม่ OKF mapping), README |
| 2 | `/brain-import` จาก OKF bundle | ingest bundle ภายนอก → graph: parse frontmatter+links, resolve tags ผ่าน taxonomy (alias→canonical, reject blocklist), เสนอ merge เมื่อ title ชน (upsert by title), dry-run ก่อนเขียนจริง + propose-don't-execute ตาม lint principle | กลาง | skills/brain-import/SKILL.md (ใหม่), README |
| 3 | `resource` field convention + release v3.4.0 | GRAPH_PROTOCOL §1 Save Rules: note ที่ derive จาก external source (URL/doc/dashboard) ต้องมี `resource` pointer เป็น structured field (metadata หรือบรรทัดแรกตาม convention ที่เลือก); ต่อยอด Freshness Protocol ให้ครอบ external source; bump plugin.json + marketplace.json + README changelog | ต่ำ | GRAPH_PROTOCOL.md §1 §5, brain-save/brain-scan SKILL.md, plugin.json, marketplace.json, README |

ลำดับ: **1 → 2 → 3** (export ก่อนเพื่อ validate mapping กับข้อมูลจริง 600+ notes;
import ใช้ mapping เดียวกันย้อนทาง; resource field + release ปิดท้าย)

ทุก feature: `assigned_model: opus` + adversarial verification (force_opus_all=true ตาม model_config)

---

## 5. Open Decisions (ตัดสินก่อน/ระหว่าง implement)

1. **Export ทำที่ plugin หรือ server?** — **ตัดสินแล้ว (2026-07-10, #16):** v3.4 ทำ
   **plugin-side** (catalog → get-knowledge วนทีละ note + เตือน token cost เมื่อ > 100
   notes ตาม SKILL step 2) — server ที่ต่ออยู่ยังไม่มี endpoint และไม่ block feature;
   server endpoint `GET /api/export/okf/{project}` + MCP tool `export-okf` จดเป็น
   **candidate ฝั่ง SecondBrain** (ดู §5.1 ข้อ 1-3 ที่ต้องแก้ฝั่ง server อยู่แล้ว —
   ทำพร้อมกันได้) — SKILL ออกแบบให้สลับไปเรียก server tool ได้โดยไม่แก้ mapping (§8 คือ contract กลาง)
2. **`type` mapping** — OKF บังคับ `type`; brain ไม่มี field ตรง → derive จาก
   namespace tag `content/…` (เช่น `content/pattern` → `type: Pattern`) fallback =
   `Note`; ต้องกำหนดตาราง map ใน GRAPH_PROTOCOL
3. **Wikilink `[[Title]]` → OKF link** — brain ใช้ `[[Title]]` ใน body; OKF ใช้
   `[text](/path.md)` → ตอน export แปลง wikilink ที่ resolve ได้เป็น relative link,
   ที่ resolve ไม่ได้คงไว้ + รายงาน (โยง broken-link check ของ lint)
4. **Import conflict policy** — title ชนกับ note เดิม: upsert (ทับ + NoteHistory เก็บ
   version เดิม) หรือสร้างใหม่ห้อย suffix? → เสนอ upsert เป็น default (สอดคล้อง
   versioning ที่มี) + `--no-overwrite` option
5. **`resource` เก็บที่ไหน** — **ตรวจแล้ว (2026-07-11, #17):** `save-knowledge` มี
   param `source` จริง ("Where this knowledge came from — URL, bookmark id, ... Enables
   provenance queries") + มี `reason` สำหรับ upsert version history → #17 import ส่ง
   `resource` เข้า `source` param + คงบรรทัด `Source: <URL>` ใน content (กันซ้ำเมื่อมีอยู่แล้ว)
   **ตัดสินแล้ว (2026-07-11, #18) — convention = dual-write:**
   - **เขียน:** ทุก save ที่ derive จาก external source → ส่ง param `source` (structured,
     provenance query ได้) **และ**บรรทัด `Source: <pointer>` เป็นบรรทัดแรกของ content
   - **อ่าน:** จากบรรทัด `Source:` ใน content — เพราะ `get-knowledge` ยังไม่ expose field
     `source` (ตรวจจริง #16.3) → บรรทัดใน content เป็นช่องทางเดียวที่ reader/exporter เห็น
   - **งานฝั่ง SecondBrain (ไม่ block release):** expose `source` ใน get-knowledge/catalog
     → เมื่อทำแล้ว export เปลี่ยนมาอ่านจาก field ก่อน fallback ไปบรรทัด `Source:` ได้เลย
     (กติกาเต็มใน GRAPH_PROTOCOL §1 ข้อ 7)

---

## 5.1 Smoke-test findings (2026-07-10 — export จริง AgentMarketplace 11 notes)

ผลทดสอบ #16.3: bundle 12 ไฟล์ validate ผ่านครบ (frontmatter/links/index/count), secret 0 hits,
unresolved wikilink 1 (broken link ใน graph เอง: `[[AgentMarketPlace - Integration Workflows]]`)

**แก้ใน spec แล้ว (GRAPH_PROTOCOL §8):** folder fallback chain (catalog → explore-graph → tag
inference + precedence), slug rules ครอบ `—`/`()`/`+`/`&`, strip MCP display metadata,
MOC-candidate ต้องถาม user, timestamp remark

**งานฝั่ง SecondBrain (จดไว้ — ไม่ block v3.4):**
1. `get-knowledge` ไม่ expose `updatedAt` (มีแค่ `Created:`) → note ที่ update แล้วได้
   timestamp เก่ากว่าจริงใน OKF frontmatter
2. `get-knowledge` ไม่คืน `folderPath` → export ต้องพึ่ง catalog/explore-graph/เดาจาก tag
3. `explore-graph` ไม่แสดง relationship type labels (ขัด display format §4) และ Folder node
   โผล่แค่บาง note (5/11 ไม่มี — อาจไม่มี IN_FOLDER relationship จริงใน graph → ควรมี
   backfill migration)
4. `list-projects` note count ไม่ตรงจำนวนจริง (บอก 4 แต่ search-by-tags เจอ 11)

## 5.2 Round-trip findings (2026-07-11 — import bundle 11 notes กลับ AgentMarketplace จริง)

ผลทดสอบ #17.3: 11/11 upsert สำเร็จ id เดิมทุกใบ, note count คงที่ 11, folder ไม่ขยับ, tags ตรงเดิม 100%,
NoteHistory เก็บ v1 snapshot + reason, `--no-overwrite` dry-run → skip 11/11, minimal-OKF (type อย่างเดียว) parse ผ่าน

**แก้ใน spec แล้ว (GRAPH_PROTOCOL §8 + SKILL):** upsert คง folderPath เดิมจาก catalog (graph จริงมี
casing ปน `/projects/AgentMarketPlace/` vs `/projects/agentmarketplace/`), OKF `type` ↔ `category`
field (export derive จาก category ก่อน content/* tag; import ส่ง category param เมื่อตรง enum),
lossless-first tag augmentation, `Source:` line กันซ้ำ, foreign index.md → note ปกติ, bulk upsert
ไม่สร้าง changelog note ต่อใบ

**ข้อสังเกตฝั่ง server (เพิ่มจาก §5.1):**
5. `save-knowledge` response รายงาน**ทุก** tag เป็น `is a NEW tag` แม้ tag มีอยู่ก่อน (เช่น `agentmarketplace`
   รายงาน NEW ซ้ำทุก call; แต่ `permissions` ไม่ถูกรายงาน) → บรรทัด NEW ใช้ตัดสินอะไรไม่ได้ ให้ดูเฉพาะ
   normalize/drop lines
6. **upsert preserve field ที่ omit** — `category` (pattern/overview) รอดหลัง upsert ที่ไม่ส่ง param ✅
7. server **re-parse wikilinks ตอน save** — Data Templates note เดิมมี LINKS_TO 1 edge ทั้งที่ content มี
   2 wikilinks; หลัง re-save ได้ 2 edges (import ช่วยซ่อม link edge ที่หายเป็น side effect เชิงบวก) —
   นัยกลับด้าน: server **ไม่ backfill edge** ให้ note ที่ link ไป title ซึ่งเพิ่งถูกสร้างทีหลัง → create-heavy
   bundle ต้อง re-save รอบสอง (ดู §8.3)
8. ⚠️ **upsert-by-title เป็น GLOBAL scope (พิสูจน์ 2026-07-11 ด้วย probe ใน project ทิ้ง OkfTest):**
   save title เดิมด้วย projectName=OkfTest2 → **Updated (v2) id เดิม** ไม่ create ใหม่ — projectName ไม่ scope
   การ match → import ต้องเช็ค title ชนข้าม project ก่อน create เสมอ (ไม่งั้นทับ note ของ project อื่นเงียบๆ);
   จดเป็นงานฝั่ง SecondBrain: ระบุ scope ใน tool description หรือทำ per-project upsert
9. **tags เป็น union ตอน upsert** — tag เดิมไม่ถูกลบ (probe เดียวกัน: tags รวมเป็น okftest2+content/runbook+okftest);
   การ "ลบ tag" ผ่าน save-knowledge ทำไม่ได้
10. AC1 create path ทดสอบจริงแล้ว (2026-07-11): minimal-OKF (type อย่างเดียว, title จาก H1 fallback) →
   "Created" ใน project OkfTest, tag `content/runbook` ผ่าน taxonomy, type default literature ✅
   (หมายเหตุ audit: reason ใน NoteHistory ของ round-trip ใช้ UTC date `2026-07-10` — เวลาไทย 06:14 ของ 07-11
   เป็น run เดียวกัน)

## 6. สิ่งที่ *ไม่ทำ* ใน v3.4

- **ย้าย backend เป็นไฟล์ OKF** — เสีย graph traversal/versioning/freshness/cross-project (ดู §2)
- **Sync สองทางอัตโนมัติ (bi-directional live sync)** — เกิน scope; export/import แบบ
  explicit command พอ ความขัดแย้งจัดการผ่าน dry-run + upsert
- **เขียน visualizer เอง** — ใช้ static HTML visualizer ของ Google กับ bundle ที่ export
- **Typed relationships** (`supersedes`, `contradicts`) — ยังเป็น candidate แยกจาก
  v3.3 research; OKF v0.1 เองก็ยังไม่มี — รอสเปก OKF โต
- **ตาม OKF spec เคร่งครัดทุก field ล่วงหน้า** — v0.1 ยังเปลี่ยนได้; ยึด core 6 fields พอ
