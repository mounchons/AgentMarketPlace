# Brain — Graph-First Knowledge Management

**Version: 3.3.0**

Plugin จัดการความรู้แบบ Graph-First บน Graph Brain (Neo4j-backed Second Brain) — ใช้ยุทธศาสตร์ **Brain First**: ถามความรู้จาก brain ก่อนเสมอ แล้วค่อยอ่าน codebase เมื่อความรู้ไม่พอ จากนั้นเสนอบันทึกสิ่งที่ค้นพบกลับเข้า brain

## ⚠️ Prerequisites (สำคัญ — plugin นี้ใช้ไม่ได้ถ้าไม่มี MCP server)

ทุก skill และ SessionStart hook เรียก `mcp__graph-brain__*` tools จาก **graph-brain MCP server ภายนอก**
(จาก [SecondBrain project](https://github.com/mounchons/SecondBrain) — ไม่ได้ bundle มากับ plugin)

ตรวจสอบว่ามี server แล้ว:

```bash
claude mcp list   # ต้องเห็น graph-brain
```

ถ้ายังไม่มี ให้ add (ปรับ path/endpoint ตามเครื่อง):

```bash
claude mcp add graph-brain --scope user \
  --env GRAPH_BRAIN_API=http://<your-api-host>:7100 \
  -- node D:/GitHub/SecondBrain/mcp-server/index.js
```

ถ้า server ไม่ตอบ: ทุก skill จะ degrade อย่างปลอดภัย (แจ้งเตือน + ทำงานจาก codebase ต่อได้ ไม่ block session)

## 📦 Installation

```bash
/plugin marketplace add mounchons/AgentMarketPlace
/plugin install brain@agent-marketplace
```

## 🧠 Commands (16 skills)

| Command | หน้าที่ |
|---------|---------|
| `/brain <คำถาม>` | **คำสั่งหลัก** — ถามอะไรก็ได้เกี่ยวกับโปรเจกต์ (search → codebase fallback → เสนอ save) |
| `/brain-search <keyword>` | ค้นหาแบบ 4-step escalation (text → tags → graph traversal → similar) |
| `/brain-explain <topic>` | อธิบายระบบ/feature/workflow เชิงลึก |
| `/brain-explore <จุดเริ่ม>` | เดิน graph ทีละ node ตาม relationships |
| `/brain-scan [path\|--docs\|--deps\|--full]` | สแกน codebase/เอกสารเข้า brain พร้อม dependency tracing (Smart Scan แบบ incremental จาก git diff). v3.2: Mermaid ER/sequence diagrams, Phase 7.5 Release/Deployment, Dev Setup, design-doc integration, Scan Metadata footer (freshness) |
| `/brain-save [topic]` | บันทึกความรู้ใหม่จากบทสนทนา |
| `/brain-update <note>` | อัปเดต note เดิมให้ตรงกับโค้ดปัจจุบัน (ผ่าน Versioning Protocol) |
| `/brain-history <note>` | ดู version history + changelogs ของ note |
| `/brain-load [project]` | preload ความรู้ตอนเริ่ม session (hook ทำให้อัตโนมัติ) |
| `/brain-status` | เช็คการเชื่อมต่อ + สถิติความรู้ |
| `/brain-projects [--tech\|--compare]` | ดูทุกโปรเจกต์ใน brain + cross-project intelligence |
| `/brain-lint [project]` | v3.3: ตรวจสุขภาพ graph — tag ซ้ำ, metadata ปน tag, โน้ตกำพร้า, link น้อย, mirror note, wikilink เสีย — เสนอ fix แล้วให้ user ยืนยันก่อนเสมอ |
| `/brain-moc [project]` | v3.3: สร้าง/refresh Map of Content ต่อโปรเจกต์ — โน้ตเดียว link ครบทุกใบ (index-first retrieval, token saver) |
| `/brain-log [filter]` | ดู activity log ข้าม sessions (`.brain/activity-log.json`) |
| `/brain-help` | รายการคำสั่งทั้งหมด |
| `/brain-howto [topic]` | สอนใช้งานทีละขั้นเป็นภาษาไทย |

## 🔄 Brain First Flow

```
User ถามเกี่ยวกับโปรเจกต์
  → 1) search brain (4-step escalation)
  → 2) ครบ → ตอบจาก brain (อ้าง note + relationships)
  → 3) ไม่ครบ → อ่าน codebase เฉพาะส่วนที่ขาด
  → 4) เสนอ save ความรู้ใหม่กลับเข้า brain (ตาม GRAPH_PROTOCOL.md)
```

กฎกลางทั้งหมด (Save Rules, Versioning Protocol, Search Rules, Relationship Rules) อยู่ที่
[`GRAPH_PROTOCOL.md`](GRAPH_PROTOCOL.md) — skills อ้างผ่าน `${CLAUDE_PLUGIN_ROOT}/GRAPH_PROTOCOL.md`

> **Upsert semantics:** `save-knowledge` ด้วย title เดิม = update note เดิม (server เก็บ version snapshot ให้)
> — ไม่สร้าง note ซ้ำ

## 🔌 Integration กับ plugins อื่น

| Plugin | การใช้งาน |
|--------|----------|
| **ทุก plugin** | SessionStart hook preload ความรู้ของ project ปัจจุบัน (ไม่ block ถ้า server ล่ม) |
| **ui-mockup** | `/create-html-mockup` query nav structure, design tokens จาก brain ก่อนสร้าง mockup |
| **long-running** | `/init` + `/continue` query brain ก่อน implement nav components + เขียนความรู้กลับ |
| **flow-discovery** | `/flow-research` ใช้ brain เป็น research cache (30 วัน) + save ผล research |
| **system-design-doc** | optional upstream — query ความรู้เดิมก่อน brainstorm design |

## 📝 Changelog

### v3.3.0 (2026-07-10) — Knowledge Hygiene (llm-wiki patterns)
เป้าหมาย (จาก improvement directive): **หาได้ตรง + เชื่อมโยงครบ + token น้อยลง** — เอา discipline ของ llm-wiki (Karpathy) มาลง graph; ต้องใช้กับ graph-brain server v3.3 ขึ้นไป (SecondBrain)
- 🏷️ **Tag Taxonomy** (GRAPH_PROTOCOL §1) — server normalize alias → canonical (`efcore`→`ef-core`, `k8s`→`kubernetes`) + drop tag ต้องห้าม (date/version/status-flag) ทุก save path; canonical list ฝังใน description ของ `save-knowledge`; search-by-tags expand alias อัตโนมัติ (ค้น `efcore` เจอโน้ต `ef-core` ได้)
- 🧹 **`/brain-lint`** (GRAPH_PROTOCOL §7 ใหม่) — 8 deterministic checks: duplicate-tags, metadata-tags, orphan-notes, low-link-density (permanent ≥ 3 links), mirror-notes, broken-wikilinks, link-suggestions, stale-notes — กฎเหล็ก **propose-don't-auto-execute**; fix ผ่าน `merge-tags` / `update-knowledge` หลัง user ยืนยันเท่านั้น
- 🗺️ **`/brain-moc`** — Map of Content ต่อโปรเจกต์จาก tool `get-project-catalog` (title + AI summary + folder ครบในการเรียกเดียว); Search Rules เพิ่ม **Step 0: Catalog First** — คำถามใน project เดียวอ่าน catalog ก่อนแล้ว fetch เฉพาะโน้ตที่เกี่ยว แทน search วนหลายรอบ; MOC เป็น hub แก้ orphan ไปในตัว
- 🔧 MCP tools ใหม่ที่ต้องมี: `brain-lint`, `merge-tags`, `get-project-catalog`; save response รายงาน `Tag normalization:` ให้ agent เรียนรู้ vocabulary

### v3.2.0 (2026-07-04) — Support-Ready Knowledge
เป้าหมาย: กลับมา support งานลูกค้าเก่าโดยไม่ต้องอ่านโค้ดใหม่ทุกรอบ — brain ตอบครบทุกมิติและ**บอกได้ว่าความรู้ยังตรงกับโค้ดไหม**
- 🔖 **Freshness Protocol** (GRAPH_PROTOCOL §5) — ทุก note จาก brain-scan มี `## Scan Metadata` footer ผูก commit hash; `/brain` + `/brain-load` เทียบกับ HEAD → ถ้าเก่ากว่าโค้ดเตือน "เก่ากว่า N commits" + ถามก่อนตอบ ([1] incremental scan [2] ตอบจากข้อมูลเดิม); Smart Scan ใช้ commit จาก note เป็น primary source แทน `.brain/activity-log.json` (ที่หายเมื่อย้ายเครื่อง)
- 📊 **Mermaid diagrams** — Phase 3 สร้าง ER Diagram (split >20 entities per-module); Phase 4 แนบ sequence diagram ใน**ทุก** dependency map
- 🚀 **Phase 7.5 Release & Deployment** — Release History (git tags/CHANGELOG/version + current@HEAD) + Deployment Topology (Dockerfile/CI-CD/pubxml/appsettings ต่อ env)
- 🛠️ **Dev Setup & Run Guide** (Phase 2) — build/run/test/debug + prerequisites
- 📋 **Design-doc integration** (Phase 8) — อ่าน `.design-docs/design_doc_list.json` first-class: requirements/AC/UC + ดึง Mermaid สำเร็จรูป (ไม่ generate ซ้ำ, label `[Design-doc]` vs `[Code-derived]`)
- 🔒 **Secret Masking Protocol** (GRAPH_PROTOCOL §6) — กฎกลางกัน credential หลุดเข้า brain: connection string เก็บแค่ Server+DB, endpoint strip credential, literal-vs-reference, pre-save sanity check, irreversibility warning
- 📁 folder categories ใหม่: `/releases/`, `/deployment/`, `/requirements/`

### v3.1.0 (2026-06-12)
- 📄 เพิ่ม README นี้ (เดิมเป็น plugin เดียวที่ไม่มี — รวม prerequisites ของ MCP server ที่ขาดหาย)
- 🔧 แก้ 6 skills ที่อ้าง `GRAPH_PROTOCOL.md` แบบ bare filename → `${CLAUDE_PLUGIN_ROOT}/GRAPH_PROTOCOL.md` (เดิม resolve ไม่ได้จาก project อื่น)
- 📝 Document upsert-by-title semantics ใน GRAPH_PROTOCOL.md + ชี้ทางเลือก `update-knowledge`/`get-note-history`/`restore-note-version`
- ✨ เพิ่ม trigger phrases (EN+TH) ใน 4 skills หลัก (brain, brain-save, brain-scan, brain-update) — ช่วย auto-invocation ตามยุทธศาสตร์ Brain First
- 🔧 เปลี่ยน frontmatter `args:` → `argument-hint:` (field มาตรฐาน) ทั้ง 12 skills

### v3.0.0
- Graph-First redesign: relationship-centric search, traversal-first navigation, knowledge versioning, cross-project intelligence, promote จาก brain-dev

### v2.0.0
- 10 skills แรก + SessionStart hook + activity logging

## 📄 License

MIT
