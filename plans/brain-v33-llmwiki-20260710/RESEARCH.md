---
title: "llm-wiki Research → brain v3.3 Design Mapping"
date: 2026-07-10
status: research-complete, ready for feature breakdown
based_on:
  - docs/brain-plugin-improvement-directive.md (พี่ปู, 2026-07-07)
  - Karpathy llm-wiki gist (April 2026)
sources:
  - https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f (ต้นฉบับ pattern)
  - https://gist.github.com/rohitg00/2067ab416f7bbe447c1977edaaa681e2 (LLM Wiki v2 — agent memory lessons)
  - https://github.com/Astro-Han/karpathy-llm-wiki (Agent Skills implementation: ingest/query/lint)
  - https://github.com/lucasastorian/llmwiki (MCP implementation)
  - https://aaif.io/blog/karpathys-llm-wiki-as-agent-memory/
---

# llm-wiki Research → brain v3.3 Design Mapping

> ผลค้นคว้า llm-wiki pattern ของ Karpathy เพื่อใช้ปรับปรุง brain plugin ตาม
> `docs/brain-plugin-improvement-directive.md` (D1–D6)
> **อ่านไฟล์นี้ก่อนเริ่มทุก feature ใน epic brain-v33 — ห้ามค้นคว้าซ้ำ**

---

## 1. llm-wiki Pattern — สรุปจากต้นฉบับ (Karpathy gist, April 2026)

### 1.1 สถาปัตยกรรม 3 ชั้น

| ชั้น | หน้าที่ | เทียบกับ brain |
|---|---|---|
| **raw/** | source ต้นทาง immutable — LLM อ่านได้ ห้ามแก้ | = โค้ดใน repo + design docs (brain-scan อ่าน) |
| **wiki/** | markdown ที่ LLM สร้างและดูแลทั้งหมด (entity/concept/summary pages) | = Note nodes ใน Neo4j |
| **schema** (`CLAUDE.md`/`AGENTS.md`) | กติกาการดูแล wiki: page types, naming, ingest/query/lint workflow | = `GRAPH_PROTOCOL.md` ✅ brain มีแล้ว |

คำพูดสำคัญจากผู้ใช้จริง: *"The schema file is everything… it co-evolved into the single most important file in the repo."* — ตรงกับที่ brain ลงทุนใน GRAPH_PROTOCOL.md ถูกทางแล้ว

### 1.2 กลไกหลักที่ llm-wiki บังคับ (และ brain ยังไม่มี)

1. **`index.md` — content catalog**: ทุก page มี 1 บรรทัดใน index (`[[page]]: one-line summary`)
   → agent อ่าน index ก่อน (ไม่กี่พัน token) แล้วค่อย drill ลง page ที่เกี่ยว
   → **นี่คือ token-saver ตัวจริง** ใช้แทน RAG ได้ถึงหลักหลายร้อย pages
2. **Minimum outbound links**: ทุก page ต้องมี `[[wikilink]]` ออก **อย่างน้อย 2** — บังคับที่ schema
3. **`log.md` — append-only operation log**: ทุก ingest/query/lint ลง log ในรูปแบบ parse ได้ (`## [date] ingest | title`)
4. **Lint เป็นรอบ (periodic)**: 6 checks มาตรฐาน (ดู §1.3)
5. **Synthesis ไม่ใช่ mirror**: LLM ต้อง *integrate* ความรู้ใหม่เข้า page เดิม (แตะ 10–15 pages ต่อ 1 source) ไม่ใช่ copy source มาเก็บ — mirror note ไม่ช่วยประหยัด token
6. **Propose, don't auto-execute**: linter ห้ามลบ/แก้ content เอง — flag แล้วให้ user อนุมัติ; ซ่อมได้เฉพาะ frontmatter ที่ค่าถูกต้องแน่นอน

### 1.3 Lint checks มาตรฐาน 6 ข้อ (จาก gist + comments)

| # | Check | คำอธิบาย | ใช้กับ brain (graph) ได้เป็น |
|---|---|---|---|
| 1 | **Schema integrity** | page ขาด frontmatter field ที่บังคับ | note ขาด tags ขั้นต่ำ / folderPath ผิด convention / ไม่มี projectName |
| 2 | **Staleness** | เรียง timestamp เก่าสุด 5–10 อัน เช็คว่า page ใหม่ contradict หรือ supersede | brain มีดีกว่าอยู่แล้ว — Freshness Protocol §5 (commit-hash based) แต่ใช้เฉพาะ code-derived notes → lint ขยายไปถึง conversation notes ด้วย date-based |
| 3 | **Coverage gaps** | concept ถูกอ้างถึงแต่ไม่มี page | `[[wikilink]]` ที่ชี้ไป title ที่ไม่มี note จริง (broken link) |
| 4 | **Overview drift** | `overview.md` ตามหลัง page ใหม่เกิน 1 ingest cycle | MOC note ของ project ตามหลัง note ล่าสุด (ผูกกับ D5) |
| 5 | **Orphan check** | page ที่ inbound link = 0 → เสนอว่า page ไหนควรลิงก์มาหา | note ที่ LINKS_TO = 0 (ทั้งเข้าและออก) → เสนอ link จาก shared tags/project |
| 6 | **Duplicate detection** | ไฟล์ชื่อเหมือน/เกือบเหมือน — flag ห้ามลบเอง | duplicate-candidate tags (edit distance ≤ 2) + note title ใกล้เคียง |

### 1.4 Retrieval strategy ตาม scale

- **≤ ~200–300 pages**: index-first (อ่าน catalog → เลือก page) — ไม่ต้องมี embedding เลย
- **เกินนั้น**: hybrid — BM25 + vector + **graph traversal** ผสมด้วย reciprocal rank fusion
- brain (611 notes) อยู่จุดที่ **graph traversal + tag เป็น retrieval หลักอยู่แล้ว** — จุดที่ขาดคือชั้น index-first ราคาถูก (MOC) ก่อนลง traversal

### 1.5 LLM Wiki v2 — บทเรียนเพิ่มจาก agentmemory (rohitg00 gist)

- **Typed relationships > flat wikilinks**: `supersedes`, `contradicts`, `depends-on` มีความหมายมากกว่า LINKS_TO เปล่าๆ — map ตรงกับ property graph ของ brain (อนาคต ไม่บังคับใน v3.3)
- **Confidence / supersession lifecycle**: ความรู้เก่าไม่ลบแต่ถูก deprioritize — brain มี NoteHistory + changelog รองรับแล้ว
- **"Human-in-the-loop as a write gate is quality control when the writer is a stochastic process"** — ยืนยันหลัก propose-don't-execute ของ lint
- **Taxonomy ไม่ต้อง design หมดล่วงหน้า** — เริ่มจาก enum ตั้งต้น (Appendix A/B ของ directive) แล้วโตแบบ controlled

---

## 2. Scorecard: brain vs llm-wiki — ใครมีอะไร

| กลไก | llm-wiki | brain ปัจจุบัน (v3.2) | สรุป |
|---|---|---|---|
| Schema กลาง | CLAUDE.md | GRAPH_PROTOCOL.md | ✅ เท่ากัน |
| Versioning | ไม่มี (git เท่านั้น) | NoteHistory + changelog notes | ✅ brain เหนือกว่า |
| Staleness ผูก source | timestamp เทียบกันเอง | Freshness Protocol ผูก commit hash | ✅ brain เหนือกว่า |
| Graph traversal | ไม่มี (markdown links) | explore-graph, find-similar | ✅ brain เหนือกว่า |
| Cross-project | ไม่มี | 21 projects + tech-overview | ✅ brain เหนือกว่า |
| **Index-first retrieval (MOC)** | ✅ index.md บังคับ | ❌ ไม่มี — ค้นทีละ query | 🔴 gap → **D5** |
| **Min outbound links บังคับ** | ✅ ≥ 2/page ที่ schema | ⚠️ Save Rule ข้อ 5 บอกให้ทำแต่ไม่มีเป้า/ไม่วัด (จริง ~1.17) | 🔴 gap → **D3** |
| **Periodic lint** | ✅ 6 checks | ❌ ไม่มี | 🔴 gap → **D3, D6** |
| **Controlled vocabulary** | ✅ schema กำหนด page types/naming | ❌ tag เกิดอิสระ → 1,533 unique | 🔴 gap → **D1, D2, D4** |
| Operation log | log.md ใน wiki (ติดไปกับ wiki) | .brain/activity-log.json (local, gitignored) | ⚠️ พอใช้ — ไม่ต้องแก้ใน v3.3 |
| Synthesis > mirror | ✅ กติกาชัด | ⚠️ ไม่มีตัวตรวจ mirror note | 🟡 → **D6** (ผ่าน lint) |

**ข้อสรุปหลัก:** จุดแข็ง llm-wiki 2 จุดที่ brain ขาด = **discipline ของ link density + lint** และ **ชั้น index ราคาถูก** — ตรงกับที่ directive วินิจฉัยไว้เป๊ะ (wikilink เกรด C, tag hygiene เกรด D)

---

## 3. Mapping → Directive D1–D6: การแก้ระดับไฟล์

### ขอบเขตสำคัญ (constraint)

brain plugin = **prompt layer** (skills + GRAPH_PROTOCOL.md) — MCP server `graph-brain` เป็น external ไม่อยู่ใน repo นี้
- ✅ ทำได้ที่ plugin: normalize ตอน save, expand alias ตอน search, lint ผ่าน MCP tools ที่มีอยู่, สร้าง MOC note
- ⚠️ ทำไม่ได้ที่ plugin: Cypher MERGE tag nodes ตรงๆ (ไม่มี tool query อิสระใน graph-brain MCP) — ดู Open Decisions

### D1 + D2 + D4 — Tag Taxonomy + Normalization *(feature เดียวกัน — เป็นเรื่อง vocabulary ทั้งหมด)*

ไฟล์ที่แตะ:
1. **สร้าง `plugins/brain/TAG_TAXONOMY.md`** (ไฟล์ใหม่ — single source of truth):
   - Canonical registry: ตาราง alias → canonical จาก Appendix A ของ directive
   - Namespace enum จาก Appendix B: `tech/`, `project/`, `domain/`, `audience/`, `solution/`, `pattern/`, `content/`, `problem/`, `source/`
   - Blocklist: date-string pattern (`^\d{4}(-\d{2}){0,2}$`), status flags (`gold-news-seen`, `auto-generated`, `pending`, `pending-confirm`)
2. **`GRAPH_PROTOCOL.md` §1 Save Rules** — เพิ่มขั้น tag resolution:
   - ก่อน save: resolve ทุก tag ผ่าน TAG_TAXONOMY (alias → canonical)
   - tag ที่ไม่อยู่ใน registry → เตือน + เสนอ tag ใกล้เคียง (edit distance ≤ 2) ก่อนยอมสร้างใหม่
   - **reject** date-string / status flag ใน tags → redirect: date → เนื้อหา note (มี created_at ที่ server อยู่แล้ว), status → หัวข้อใน content หรือ folderPath
3. **`GRAPH_PROTOCOL.md` §3 Search Rules** — Tag Search expand alias: ค้น `ef-core` → ค้น `efcore`, `entity-framework`, `entity-framework-core` ด้วย (จนกว่า migration จะเสร็จ)
4. Skills ที่อ้าง protocol อยู่แล้วได้ผลอัตโนมัติ: brain-save, brain-scan, brain-update, brain-search — เพิ่มบรรทัดอ้าง TAG_TAXONOMY.md ใน SKILL.md แต่ละตัว

Acceptance (จาก directive): unique tags 1,533 → < 500 หลัง migration; ไม่เหลือคู่ edit distance ≤ 1

### D3 + D6 — สร้าง skill ใหม่ `brain-lint`

ไฟล์ใหม่: `plugins/brain/skills/brain-lint/SKILL.md`

Checks (ปรับ 6 ข้อของ llm-wiki เข้า graph + ข้อจาก directive):

| Check | วิธีทำด้วย MCP tools ที่มี | มาจาก |
|---|---|---|
| Orphan notes (LINKS_TO = 0) | explore-graph ต่อ note / search แล้วเช็ค relationships | llm-wiki #5, D3.1 |
| Link suggestions | find-similar + search-by-tags (shared tags แต่ยังไม่ link) → เสนอ `[[...]]` | D3.2 |
| Link density ต่ำ | permanent/pattern notes ที่ outbound < 3 → รายงาน | D3.5 (เป้า ≥ 3) |
| Stale notes | Freshness §5 สำหรับ code-derived; date-based สำหรับ notes อื่น | llm-wiki #2, D3.3 |
| Duplicate-candidate tags | list-tags → คู่ edit distance ≤ 2 → เสนอ merge | llm-wiki #6, D3.4 |
| Metadata-in-tags | list-tags → จับ date pattern / status flag | D2 (ตรวจ regress) |
| Mirror notes | note สั้น (< เกณฑ์) + outbound link = 0 → เสนอ merge เข้า synthesis note | llm-wiki §1.2.5, D6 |
| Broken wikilinks | `[[title]]` ที่ search ไม่เจอ note จริง | llm-wiki #3 |
| MOC drift | MOC ของ project ไม่มี link ไป notes ที่ใหม่กว่า MOC | llm-wiki #4 (หลัง D5 เสร็จ) |

กติกาจาก llm-wiki ที่ต้องคงไว้: **propose-don't-auto-execute** — lint รายงาน + ถาม user ก่อนแก้ทุกกรณี ยกเว้น fix ที่ deterministic (เช่น alias → canonical ตาม registry) ให้เสนอเป็น batch แล้วขอ confirm ครั้งเดียว; ลง activity log ทุกรอบ lint

Acceptance: `/brain-lint` เรียกได้; orphan < 5%; permanent notes เฉลี่ย ≥ 3 wikilinks

### D5 — สร้าง skill ใหม่ `brain-moc` (Map of Content)

ไฟล์ใหม่: `plugins/brain/skills/brain-moc/SKILL.md` + แก้ `GRAPH_PROTOCOL.md` §3 + `brain-load`/`brain` SKILL.md

1. ต่อ project: สร้าง/อัปเดต note ชื่อ `"{Project} — MOC (Map of Content)"` ใน `/projects/{name}/core/`
   - จัดกลุ่มตาม category (ตาม folder convention ที่มีอยู่) — แต่ละ note = 1 บรรทัด: `[[Note Title]] — one-line summary` (ตาม format index.md ของ llm-wiki)
   - MOC เป็น hub → แก้ orphan + link density ไปในตัว (ทุก note ได้ inbound link จาก MOC ขั้นต่ำ 1)
2. **Index-first retrieval**: GRAPH_PROTOCOL §3 เพิ่ม Step 0 — ถ้า query อยู่ในขอบเขต project เดียว ให้ get MOC ก่อน → เลือก note จาก catalog → get-knowledge เฉพาะที่เกี่ยว (ประหยัด token กว่า search วนหลายรอบ)
3. brain-scan Phase สุดท้าย: refresh MOC อัตโนมัติหลัง scan เสร็จ (กัน overview drift)

Acceptance: ทุก project ที่ active มี MOC ครบ; งานข้ามโดเมนอ่าน MOC 1 ใบแทน search หลายรอบ

### Migration + Measurement — feature ปิดท้าย

1. Snapshot ก่อน (มี NoteHistory + upsert versioning อยู่แล้ว — ตาม directive หมายเหตุ)
2. Baseline: `brain-stats` + `list-tags` → บันทึก unique tag count, avg LINKS_TO/note, orphan ratio
3. Migrate ผ่าน plugin: ต่อ alias tag → search-by-tags → re-save notes ด้วย canonical tags (upsert by title)
4. วัดหลัง migration เทียบ acceptance ทุกข้อ
5. Bump brain → **v3.3.0** (plugin.json + marketplace.json + README changelog)

---

## 4. Proposed Epic: `brain-v33-llmwiki`

| # | Feature | ครอบ Directive | Effort | Files |
|---|---|---|---|---|
| 1 | Tag Taxonomy + Normalization Layer | D1, D2, D4 | ต่ำ | TAG_TAXONOMY.md (ใหม่), GRAPH_PROTOCOL.md §1 §3, brain-save/scan/update/search SKILL.md |
| 2 | `brain-lint` skill | D3, D6 | กลาง | skills/brain-lint/SKILL.md (ใหม่), README |
| 3 | `brain-moc` skill + index-first retrieval | D5 | กลาง | skills/brain-moc/SKILL.md (ใหม่), GRAPH_PROTOCOL.md §3, brain-load/brain/brain-scan SKILL.md |
| 4 | Tag migration + วัดผล + release v3.3.0 | D1 acceptance | ต่ำ | plugin.json, marketplace.json, README (+ รัน migration จริงบน brain) |

ลำดับตาม directive rollout: **1 → 2 → 3 → 4** (D2→D1→D4 รวมใน F1; lint ค้ำก่อน MOC ตาม effort; migration ปิดท้ายเพื่อวัดผลครั้งเดียว)

ทุก feature: `assigned_model: opus` + adversarial verification (force_opus_all=true ตาม model_config)

---

## 5. Open Decisions (ต้องตัดสินใจก่อน/ระหว่าง implement)

> ⚠️ **UPDATE 2026-07-10:** user ยืนยันว่าแก้ฝั่ง server ได้ → ข้อ 1 ด้านล่างถูก supersede แล้ว
> อ่าน **`SERVER_ANALYSIS.md`** (ไฟล์ข้างกัน) — แบ่งงาน D1–D6 ใหม่เป็น server-side (SecondBrain) + plugin-side
> และ epic ปรับเป็น cross-repo 4 features (server ก่อน plugin) — ตาราง §4 ในไฟล์นี้ใช้เฉพาะส่วน plugin

1. ~~**Tag merge ระดับ server**~~ **SUPERSEDED** → ทำที่ server ได้แล้ว: `POST /api/tags/merge` + `/api/admin/migrate-tags` (ดู SERVER_ANALYSIS.md §4.2) — วัด acceptance ที่ raw unique tag count ตรงตาม directive
   - หมายเหตุเดิม (ก่อนรู้ว่าแก้ server ได้): plugin-side re-save จะเหลือ alias Tag nodes ว่างค้าง — ไม่ต้องใช้แล้ว
2. **`k8s` vs `kubernetes`**: directive ให้เลือกอันเดียว — เสนอ `kubernetes` (ตรง canonical ชื่อเต็ม, `k8s` เป็น alias)
3. **เอกพจน์/พหูพจน์**: Appendix A เลือกปนกัน (`roles`, `permissions`, `controllers` = พหูพจน์ แต่ `pattern` = เอกพจน์) — implement ตาม Appendix A ตรงตัว (ไม่ generalize เป็นกฎเดียว เพราะเจ้าของเลือกตามความถี่ใช้จริง)
4. **MOC scale**: project ใหญ่ (notes > ~80) MOC ใบเดียวจะบวม → แตกเป็น MOC ต่อ category แล้วให้ MOC หลัก link ลง MOC ย่อย (ตาม pattern hub-of-hubs ของ Obsidian/llm-wiki)

---

## 6. สิ่งที่ *ไม่ทำ* ใน v3.3 (จาก research แต่เกิน scope directive)

- **Typed relationships** (`supersedes`, `contradicts`) — ต้องแก้ MCP server schema; จดไว้เป็น candidate v3.4
- **Hybrid retrieval (BM25 + vector + RRF)** — brain scale ปัจจุบัน (611 notes) index-first + graph traversal พอ ตาม guidance ของ llm-wiki เอง
- **ย้าย activity log เข้า brain** (log.md pattern) — local log ใช้งานได้อยู่ ไม่ขยับแกน ความถูกต้อง/token/connection
- **Confidence scoring on ingestion** — Freshness Protocol ครอบ use case หลักแล้ว
