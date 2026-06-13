# Brain — Graph-First Knowledge Management

**Version: 3.1.0**

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

## 🧠 Commands (14 skills)

| Command | หน้าที่ |
|---------|---------|
| `/brain <คำถาม>` | **คำสั่งหลัก** — ถามอะไรก็ได้เกี่ยวกับโปรเจกต์ (search → codebase fallback → เสนอ save) |
| `/brain-search <keyword>` | ค้นหาแบบ 4-step escalation (text → tags → graph traversal → similar) |
| `/brain-explain <topic>` | อธิบายระบบ/feature/workflow เชิงลึก |
| `/brain-explore <จุดเริ่ม>` | เดิน graph ทีละ node ตาม relationships |
| `/brain-scan [path\|--docs\|--deps\|--full]` | สแกน codebase/เอกสารเข้า brain พร้อม dependency tracing (Smart Scan แบบ incremental จาก git diff) |
| `/brain-save [topic]` | บันทึกความรู้ใหม่จากบทสนทนา |
| `/brain-update <note>` | อัปเดต note เดิมให้ตรงกับโค้ดปัจจุบัน (ผ่าน Versioning Protocol) |
| `/brain-history <note>` | ดู version history + changelogs ของ note |
| `/brain-load [project]` | preload ความรู้ตอนเริ่ม session (hook ทำให้อัตโนมัติ) |
| `/brain-status` | เช็คการเชื่อมต่อ + สถิติความรู้ |
| `/brain-projects [--tech\|--compare]` | ดูทุกโปรเจกต์ใน brain + cross-project intelligence |
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
