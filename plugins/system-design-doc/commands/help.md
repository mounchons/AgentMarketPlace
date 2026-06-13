---
description: อธิบายวิธีใช้งาน system-design-doc plugin — แสดงคำสั่งทั้งหมด, workflow, integration กับ plugins อื่น
allowed-tools: Read(*), Bash(*)
---

# System Design Doc Help — คู่มือการใช้งาน

คุณคือ **System Design Doc Help Guide** — ผู้ช่วยอธิบายวิธีใช้งาน system-design-doc plugin (v2.2.0)

## CRITICAL RULES

1. **Read-only** — คำสั่งนี้ไม่แก้ไขไฟล์ใดๆ
2. **ตอบตาม argument** — ไม่มี argument = แสดงทั้งหมด, มี argument = แสดงเฉพาะคำสั่ง/หัวข้อนั้น
3. **ตัวอย่างชัดเจน** — ทุกคำสั่งต้องมี usage + ตัวอย่าง
4. **Prerequisites ครบ** — บอกว่าต้องรัน command ใดก่อน

### Self-Check (MANDATORY)

- [ ] ตรวจ argument ว่ามีหรือไม่?
- [ ] แสดงข้อมูลถูกต้องตาม argument?
- [ ] มีตัวอย่างทุกคำสั่ง?
- [ ] บอก prerequisites ที่จำเป็น?

---

## Input ที่ได้รับ

```
/help                          # แสดงทั้งหมด
/help [command-name]           # คำสั่งเฉพาะ เช่น /help create-design-doc
/help --quick                  # Quick Start (3 ขั้นตอน)
/help --workflow               # Full workflow walkthrough
/help --integration            # Integration กับ ui-mockup, long-running, qa-ui-test
/help --diagrams               # ทุกประเภท diagram + เมื่อใช้
/help --reverse                # Reverse Engineering workflow
/help --validation             # Validation/sync commands
/help --qa                     # qa-ui-test integration (AC + UC + traceability)
/help --new                    # What's new in v2.2.0
```

---

## ขั้นตอนที่ต้องทำ

### Mode 1: ไม่มี argument → แสดงทั้งหมด

```
📖 System Design Doc — คู่มือการใช้งาน v2.2.0 (22 commands)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

สร้างเอกสารออกแบบระบบมาตรฐาน (Standardized System Design Doc)
รองรับ Reverse Engineering, Import Plan, Brainstorming
มี Mermaid diagrams ครบ 8 ประเภท + integration กับ ui-mockup, long-running, qa-ui-test
⭐ v2.1: split per-section layout (default) — .design-docs/<slug>/00-index.md + NN-<key>.md + registry schema 2.3.0
⭐ v2.0: sitemap.json machine-readable graph + 8 commands /sitemap-*
⭐ v1.7: AC + UC source-of-truth สำหรับ qa-ui-test traceability

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏗️  GENERATION (5 commands)

  /system-design-doc           Main entry — เลือก mode (new, reverse, import)
                               ตัวอย่าง: /system-design-doc

  /create-design-doc           สร้าง doc ใหม่จาก requirements
                               ตัวอย่าง: /create-design-doc

  /reverse-engineer            สร้าง doc จาก codebase ที่มีอยู่
                               ตัวอย่าง: /reverse-engineer
                               ⚠ ต้องมี source code project

  /import-plan                 Import จาก implementation plan / free-form doc
                               ตัวอย่าง: /import-plan

  /brainstorm-design           Interactive Q&A เพื่อออกแบบ system
                               ตัวอย่าง: /brainstorm-design

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📐 DIAGRAMS & EDITING (3 commands)

  /create-diagram              สร้าง diagram เฉพาะประเภท
                               รองรับ: ER, Flow, DFD, Sequence, Sitemap, State, Class, Architecture
                               ตัวอย่าง: /create-diagram er
                               ตัวอย่าง: /create-diagram sequence

  /edit-section                แก้ section ใน design doc (split-aware)
                               ตัวอย่าง: /edit-section api-endpoints
                               ตัวอย่าง: /edit-section entities

  /split-design-doc            ⭐ v2.1: migrate เอกสาร single-file → split per-section layout
                               ตัวอย่าง: /split-design-doc
                               ตัวอย่าง: /split-design-doc .design-docs/system-design-shop.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ VALIDATION (3 commands)

  /validate-design-doc         ตรวจ completeness + consistency (layout-aware)
                               ตัวอย่าง: /validate-design-doc

  /validate-integration        ตรวจ cross-reference 4 plugins (+qa-ui-test)
                               + AC coverage + release-ready flag
                               ตัวอย่าง: /validate-integration

  /sitemap-validate            ⭐ v2.0: ตรวจ sitemap.json (ajv schema + กฎ R31-R35)
                               ตัวอย่าง: /sitemap-validate
                               ตัวอย่าง: /sitemap-validate --strict

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔄 SYNC (4 commands)

  /sync-with-features          Sync design_doc_list ↔ feature_list (long-running)
                               ตัวอย่าง: /sync-with-features

  /sync-with-mockups           Sync design_doc_list ↔ mockup_list (ui-mockup)
                               ตัวอย่าง: /sync-with-mockups

  /sync-with-qa-tracker        Sync AC + UC ↔ qa-tracker (qa-ui-test)
                               bidirectional, auto-discovery, GAP detection
                               ตัวอย่าง: /sync-with-qa-tracker
                               ตัวอย่าง: /sync-with-qa-tracker --gaps-only
                               ตัวอย่าง: /sync-with-qa-tracker --auto-link

  /sync-sitemap                ⭐ v2.0: Sync Section 9 ↔ sitemap.json + pull downstream stats
                               ตัวอย่าง: /sync-sitemap
                               ตัวอย่าง: /sync-sitemap --pull-downstream

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🗺️  SITEMAP GRAPH (6 commands) — ⭐ v2.0

  /sitemap-init                สร้าง .design-docs/sitemap.json จาก template
                               ตัวอย่าง: /sitemap-init --project-name shop

  /sitemap-add-node            เพิ่ม node 8 ประเภท (page/api/middleware/external/
                               master/template/nav/component) + auto-assign ID
                               ตัวอย่าง: /sitemap-add-node page name="Checkout" url=/checkout

  /sitemap-link                เพิ่ม edge ระหว่าง nodes + validate type/prefix
                               ตัวอย่าง: /sitemap-link from=P-003 to=API-007 type=calls

  /sitemap-scan                Auto-scan codebase populate nodes + infer edges
                               ตัวอย่าง: /sitemap-scan --dry-run

  /sitemap-graph               Render Mermaid graph จาก edges → Section 9.8
                               ตัวอย่าง: /sitemap-graph --types page,api

  /sitemap-export              Export เป็น Cytoscape JSON / GraphML / DOT
                               ตัวอย่าง: /sitemap-export cytoscape

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛠️  UTILITY (1 command)

  /help                        คู่มือใช้งาน plugin (read-only)
                               ตัวอย่าง: /help
                               ตัวอย่าง: /help --new
                               ตัวอย่าง: /help create-diagram

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 แนะนำจุดเริ่มต้น

  เพิ่งเริ่มใหม่?         → /help --quick           (Quick Start 3 ขั้นตอน)
  มี code อยู่แล้ว?        → /help --reverse         (Reverse Engineering)
  อยากดู diagrams?         → /help --diagrams        (ทุกประเภท + เมื่อใช้)
  เชื่อม long-running?     → /help --integration
  qa-ui-test (AC/UC)?      → /help --qa
  v2.2 มีอะไรใหม่?         → /help --new             (changelog)
  ดูคำสั่งเฉพาะ?           → /help [command]         เช่น /help create-diagram

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Workflow แนะนำ

🆕 Greenfield (ออกแบบก่อน code):
   /brainstorm-design                # interactive Q&A
   /create-design-doc                # สร้าง design_doc_list.json
   /create-diagram er                # ER diagram
   /create-diagram sequence          # sequence diagrams
   /validate-design-doc              # ตรวจครบไหม
   → ส่งต่อ ui-mockup + long-running

📦 Brownfield (มี code อยู่แล้ว):
   /reverse-engineer                 # สแกน code → design doc
   /validate-design-doc              # ตรวจ
   → ปรับ /edit-section ตามต้องการ

📝 Import (มี doc อยู่แต่ไม่มาตรฐาน):
   /import-plan                      # import + standardize
   /validate-design-doc

🔧 Maintenance:
   /edit-section [name]              # แก้ section
   /create-diagram [type]            # เพิ่ม diagram
   /split-design-doc                 # ⭐ v2.1: migrate single-file → split layout
   /sync-with-features               # sync long-running
   /sync-with-mockups                # sync ui-mockup
   /sync-with-qa-tracker             # ⭐ sync qa-ui-test (AC/UC coverage)
   /validate-integration             # cross-plugin check (4 plugins)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 ดูเพิ่ม
   /help --quick           Quick Start 3 ขั้นตอน
   /help --workflow        Full workflow walkthrough
   /help --diagrams        Diagram types reference
   /help --reverse         Reverse Engineering
   /help --integration     Cross-plugin integration (4 plugins)
   /help --validation      Validation guide
   /help --qa              qa-ui-test integration (AC/UC traceability)
   /help --new             What's new in v2.2.0
```

---

### Mode 2: `--quick` → Quick Start

```
🚀 System Design Doc — Quick Start (3 ขั้นตอน)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ขั้นตอนที่ 1️⃣ — เลือก Entry Point
─────────────────────────────────────────────
ตามสถานะ project:

  🆕 Project ใหม่:
    $ /brainstorm-design   (Q&A เพื่อ clarify requirements)
    $ /create-design-doc   (สร้าง doc ใหม่)

  📦 มี code แล้ว:
    $ /reverse-engineer    (สแกน → doc)

  📝 มี plan/doc อยู่:
    $ /import-plan         (standardize)

ผลลัพธ์: design_doc_list.json + Mermaid diagrams


ขั้นตอนที่ 2️⃣ — เพิ่ม Diagrams
─────────────────────────────────────────────
$ /create-diagram er         # ER diagram (entities)
$ /create-diagram sequence   # sequence diagrams (flow)
$ /create-diagram flow       # business flow
$ /create-diagram sitemap    # site structure
$ /create-diagram dfd        # data flow
$ /create-diagram state      # state machine
$ /create-diagram class      # class diagram

ผลลัพธ์: diagram files ที่ link จาก design_doc_list.json


ขั้นตอนที่ 3️⃣ — Validate + Sync
─────────────────────────────────────────────
$ /validate-design-doc       # ครบไหม + consistency?
$ /sync-with-mockups         # → ui-mockup
$ /sync-with-features        # → long-running
$ /validate-integration      # cross-plugin check

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Goal: complete design doc + cross-plugin sync
```

---

### Mode 3: `--workflow` → Full workflow

```
🔄 System Design Doc — Full Workflow
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 Day 0 — Discovery
─────────────────────────────────
$ /brainstorm-design           # interactive Q&A
  → output: requirements.md, key questions answered

(optional ถ้า unclear)
$ /flow-discovery              # (flow-discovery plugin)


📅 Day 1 — Initial Design
─────────────────────────────────
เลือก 1 ใน 3:

  $ /create-design-doc         # ออกแบบใหม่
  $ /reverse-engineer          # มี code แล้ว
  $ /import-plan               # มี plan แล้ว

ผลลัพธ์: design_doc_list.json พร้อม:
  • entities[]
  • api_endpoints[]
  • diagrams.{er, flow, sequence, ...}
  • layers[] (presentation, application, domain, infrastructure, cross-cutting)


📅 Day 2 — เติม Diagrams
─────────────────────────────────
$ /create-diagram er           # ถ้ามี entities → จำเป็น
$ /create-diagram sequence     # ทุก critical flow (login, checkout, etc.)
$ /create-diagram flow         # business processes
$ /create-diagram sitemap      # ถ้ามี UI

(optional)
$ /create-diagram dfd          # data flow (สำคัญสำหรับ ETL)
$ /create-diagram state        # state machine (สำคัญสำหรับ workflow approval)
$ /create-diagram class        # class diagram (DDD/OOP design)


📅 Day 2-3 — Validate + Sync
─────────────────────────────────
$ /validate-design-doc         # ตรวจครบ + consistency
  ถ้าไม่ครบ → /edit-section ตามรายงาน

$ /sync-with-mockups           # ↔ .mockups/mockup_list.json
$ /sync-with-features          # ↔ feature_list.json


📅 Day 3+ — Implementation Handoff
─────────────────────────────────
ส่งต่อ:
  $ /generate-features-from-design  # (long-running) auto-generate features
  $ /ui-mockup                      # (ui-mockup) สร้าง mockups

  เมื่อ developer เริ่ม:
  $ /add-feature                    # ⭐ ตรวจ design doc impact
  $ /continue                       # implement


📅 Maintenance — เมื่อ design เปลี่ยน
─────────────────────────────────
$ /edit-section [name]         # แก้ section ใน design
$ /sync-with-features          # อัปเดต feature_list
$ /sync-with-mockups           # อัปเดต mockup_list
$ /validate-integration        # ตรวจ cross-plugin

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Tips
  • commit design doc ทุกครั้งหลัง /edit-section
  • รัน /validate-integration ก่อน release
  • อย่าลืม diagrams — code-only design ทำให้ onboarding ช้า
```

---

### Mode 4: `--integration` → Cross-plugin integration

```
🔗 Integration: system-design-doc ↔ plugins อื่น
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 system-design-doc คือ source of truth ของ system architecture
   plugins อื่น consume design นี้


📊 Data Flow:

   ┌─────────────────────────────────────┐
   │ system-design-doc                   │
   │ design_doc_list.json (THIS PLUGIN)  │
   │  • entities[]                       │
   │  • api_endpoints[]                  │
   │  • diagrams.{er, flow, sequence,...}│
   │  • layers[]                         │
   └────┬────────────────────────────┬───┘
        │                            │
        │ /sync-with-features        │ /sync-with-mockups
        │ /generate-features-from-   │
        │   design                   │
        ▼                            ▼
   ┌──────────────────┐         ┌──────────────────┐
   │ long-running     │         │ ui-mockup        │
   │ feature_list.json│         │ mockup_list.json │
   │  • features[]    │         │  • pages[]       │
   │  • design_doc_   │         │  • components[]  │
   │    refs ─────────┼─────────┤                  │
   │     api_ref      │         │                  │
   │     entity_ref   │         │                  │
   │     diagram_refs │         │                  │
   └──────────────────┘         └──────────────────┘


🔌 Connection Points:

   1. → long-running (downstream)
      ───────────────────────────
      • /generate-features-from-design  → auto-generate features
      • /sync-with-features             → bidirectional sync
      • feature.design_doc_refs         → trace feature → design

      ⭐ long-running v2.4.0 ทำ design doc impact check ตอน
        /add-feature และ /edit-feature แล้วถ้ากระทบ design จะ
        ขอให้ user รัน /edit-section ก่อน

   2. → ui-mockup (downstream)
      ──────────────────────
      • /sync-with-mockups          → sitemap ↔ mockup pages
      • design.diagrams.sitemap     → ui-mockup uses เป็น guide
      • mockup.entity_ref           → mockup → entity

   3. → qa-ui-test (downstream) ⭐ v1.7.0
      ──────────────────────────────────
      • /sync-with-qa-tracker          → push AC/UC IDs ↔ pull coverage
      • design.documents[].acceptance_criteria[] → qa-tracker.scenarios[].acceptance_criteria_id[]
      • design.documents[].use_cases[]           → qa-tracker.scenarios[].use_case_id
      • qa-trace greps `^AC-NNN:` และ `### Use Case (UC-NNN):`
        → ใช้ pattern เดียวกัน ทำให้ qa-trace auto-link ได้

      Schema:
      ac = {
        id: "AC-001" (flat, 3-digit zero-padded),
        title, module, fr_ref, br_ref, uc_ref,
        type: "functional|non-functional|business-rule",
        linked_scenarios: ["TS-XXX-001"],
        sync_status: "pending|synced|partially-covered|gap"
      }
      uc = {
        id: "UC-001" (heading: "### Use Case (UC-001): Title"),
        actors, preconditions, main_flow, alternative_flows,
        fr_refs, ac_refs, linked_scenarios
      }

      ⭐ AC ID propagation = ONE-WAY (design-doc → consumers)
        ที่อื่น mirror อย่างเดียว, ไม่สร้าง AC IDs เอง

   4. ← flow-discovery (upstream, optional)
      ──────────────────────────────────
      • /flow-discovery findings    → input ให้ /brainstorm-design
      • adversarial review          → ปิด gap ก่อน design

   5. ← brain / bigbrain (upstream, optional)
      ─────────────────────────────────────
      • /brain หรือ /bigbrain       → query existing knowledge
      • /brain-save                 → save design decisions


🔄 Common Cross-Plugin Workflows:

   Greenfield:
   ──────────
   1. /flow-discovery                 (optional)
   2. /brainstorm-design               (system-design-doc)
   3. /create-design-doc               (system-design-doc)
   4. /create-diagram er, sequence,... (system-design-doc)
   5. /ui-mockup                       (ui-mockup) สร้าง mockups
   6. /sync-with-mockups               (system-design-doc)
   7. /generate-features-from-design   (long-running) auto features
   8. /continue                        (long-running) implement
   9. /validate-integration            (system-design-doc) cross-plugin check

   Brownfield:
   ──────────
   1. /reverse-engineer                (system-design-doc) จาก codebase
   2. /validate-design-doc             ตรวจ
   3. /create-diagram er, sequence     เติม
   4. /sync-with-features              (ดึง features จาก feature_list ที่มี)
   5. /validate-integration

   Maintenance:
   ───────────
   1. /edit-section [name]
   2. /sync-with-features
   3. /sync-with-mockups
   4. /validate-integration


💡 Setup Requirements:
  • long-running plugin (downstream consumer)
  • ui-mockup plugin (downstream consumer, optional)
  • qa-ui-test plugin (downstream consumer, optional — v1.7.0)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔜 ดูเพิ่ม:
   /help validate-integration   → cross-plugin validation details
   /help edit-section           → impact on consumers
   /help --qa                   → qa-ui-test integration deep-dive ⭐
```

---

### Mode 5: `--diagrams` → Diagram types reference

```
📐 Diagram Types Reference
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

8 ประเภท diagram ที่ /create-diagram รองรับ:

┌────────────┬────────────────────────────────────────────────────┐
│ Type       │ เมื่อใช้                                            │
├────────────┼────────────────────────────────────────────────────┤
│ er         │ Entity-Relationship — ทุก project ที่มี database   │
│            │ /create-diagram er                                  │
├────────────┼────────────────────────────────────────────────────┤
│ flow       │ Business process flow — login flow, checkout flow  │
│            │ /create-diagram flow                                │
├────────────┼────────────────────────────────────────────────────┤
│ sequence   │ Component interaction — API call sequences         │
│            │ /create-diagram sequence                            │
├────────────┼────────────────────────────────────────────────────┤
│ dfd        │ Data Flow Diagram — ETL, data pipelines            │
│            │ /create-diagram dfd                                 │
├────────────┼────────────────────────────────────────────────────┤
│ sitemap    │ Page structure — UI navigation hierarchy            │
│            │ /create-diagram sitemap                             │
├────────────┼────────────────────────────────────────────────────┤
│ state      │ State machine — workflow status (approval, order)  │
│            │ /create-diagram state                               │
├────────────┼────────────────────────────────────────────────────┤
│ class      │ Class diagram — DDD/OOP design                      │
│            │ /create-diagram class                               │
├────────────┼────────────────────────────────────────────────────┤
│ architecture│ System architecture — layers, microservices, DDD  │
│            │ /create-diagram architecture                        │
└────────────┴────────────────────────────────────────────────────┘

🎯 Recommended Combinations:

   API project:           er + sequence + sitemap
   Workflow system:       er + state + sequence
   Data pipeline:         er + dfd
   E-commerce:            er + flow + sequence + sitemap + state
   Microservices:         er + sequence + dfd

📌 Format:
   ทุก diagram เป็น Mermaid → render ได้ใน GitHub, Notion, etc.

🔜 ดูเพิ่ม:
   /help create-diagram   → details ของ command
```

---

### Mode 6: `--reverse` → Reverse Engineering

```
🔍 Reverse Engineering Workflow
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ใช้เมื่อ: มี code อยู่แล้ว ต้องการสร้าง design doc

📋 Steps:

   1. /reverse-engineer
      ─────────────────
      Agent จะสแกน:
      • Models / Entities (database schema)
      • Controllers / Routes (API endpoints)
      • Services / Domain logic
      • Configuration files

      Output:
      • design_doc_list.json (entities, api_endpoints)
      • diagrams/er.mmd (auto-generated)
      • partial diagrams (sequence จาก code paths)

   2. /validate-design-doc
      ────────────────────
      ตรวจสิ่งที่ขาด:
      • entities ที่ไม่มี attributes
      • API ที่ไม่มี request/response schema
      • ไม่มี diagram

   3. /create-diagram [type]
      ───────────────────────
      เติม diagrams ที่ขาด

   4. /edit-section [name]
      ────────────────────
      เติม description, business rules ที่ code ไม่มี

   5. /sync-with-features
      ───────────────────
      ผูก existing features ใน feature_list.json กับ design

⚠ ข้อควรระวัง:
  • Reverse จะได้ structural design (what) ไม่ได้ business intent (why)
  • ต้อง /edit-section เพิ่ม context ทุกครั้ง
  • diagrams ที่ generate auto อาจไม่ลึกพอ — ต้อง review

🔜 ดูเพิ่ม:
   /help reverse-engineer   → command details
   /help --workflow         → maintenance flow หลัง reverse
```

---

### Mode 6.5: `--qa` → QA Integration (v1.7.0) ⭐

```
🧪 qa-ui-test Integration — system-design-doc (ตั้งแต่ v1.7.0)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 system-design-doc เป็น source of truth ของ AC + UC IDs
   qa-ui-test consume IDs เหล่านี้สำหรับ traceability matrix

ID propagation: ONE-WAY (design-doc → ที่อื่น)


📋 Section 2.4 — Acceptance Criteria

ใน design-doc-template.md เพิ่ม Section 2.4 เป็น table:

| AC ID  | Criterion                          | Module   | FR Ref  | UC Ref  | Type           |
|--------|------------------------------------|----------|---------|---------|----------------|
| AC-001 | User can place order with valid pay| CHECKOUT | FR-001  | UC-001  | functional     |
| AC-002 | Cart must have ≥ 1 item            | CHECKOUT | FR-001  | UC-001  | functional     |
| AC-003 | VAT calculation correct            | CHECKOUT | BR-005  | -       | business-rule  |
| AC-004 | Response time < 3s for list        | API      | NFR-001 | -       | non-functional |

Format rules:
  • AC ID = AC-NNN (flat, 3-digit zero-padded — ไม่ใช่ AC-X.Y)
  • each AC = independently testable (1 assertion per AC)
  • must reference at least one of FR/BR/NFR
  • inline AC ใน narrative ใช้ format: `AC-NNN: <criterion>` (colon + space)


📋 Section 2.5 — Use Cases

```
### Use Case (UC-001): Place Order

| Field           | Value                       |
|-----------------|-----------------------------|
| Module          | CHECKOUT                    |
| Primary Actor   | Customer                    |
| Preconditions   | User authenticated, ≥1 item |
| Postconditions  | Order created, stock dec    |
| FR Refs         | FR-001                      |
| AC Refs         | AC-001, AC-002              |

Main Flow:
1. Customer reviews cart
2. Customer selects payment
3. System validates → AC-001
4. System reserves stock → AC-002
5. System redirects to confirmation

Alternative Flows:
- A1: Payment declined → ...
- A2: Stock unavailable → ...

Exception Flows:
- E1: Network timeout → ...
```

⚠ heading pattern ต้องเป็น `### Use Case (UC-NNN): Title` exactly
   qa-trace regex: `^### Use Case \(UC-\d+\):.*$`
   ถ้าใช้ `### UC-001:` หรือ `## UC-001:` จะไม่ถูก detect


🔄 /sync-with-qa-tracker (NEW v1.7.0)

bidirectional sync ระหว่าง design_doc_list ↔ qa-tracker:

  Push (design → qa-tracker):
    AC-NNN → scenario.acceptance_criteria_id[]
    UC-NNN → scenario.use_case_id (optional)

  Pull (qa-tracker → design):
    scenario.linked_scenarios[] → ac.linked_scenarios[]
    coverage gates (PASS/CONCERNS/FAIL/GAP) → ac.sync_status

Auto-discovery:
  ถ้า design doc markdown มี `^AC-NNN:` patterns
  แต่ documents[].acceptance_criteria[] ว่าง → ดึง auto

Auto-link:
  scenario.title + module → match กับ ac.module + keywords
  Score ≥ 70 (with --auto-link flag) → apply
  Score 50-70 → report เป็น candidate (ไม่ apply)

Flags:
  /sync-with-qa-tracker                # ทุก ACs
  /sync-with-qa-tracker --gaps-only    # เฉพาะ ACs ที่ไม่มี scenario
  /sync-with-qa-tracker --auto-link    # apply auto-link suggestions
  /sync-with-qa-tracker --dry-run      # show diff โดยไม่เขียน


📊 /validate-integration (expanded v1.7.0)

ขยายจาก 3 plugins → 4 plugins (เพิ่ม qa-ui-test)

Steps ใหม่:
  Step 5b — AC Coverage Check
    For each AC:
      gate = PASS    if linked_scenarios all passed
      gate = FAIL    if any linked scenario failed
      gate = GAP     if zero linked scenarios (release blocker)
      gate = PENDING if scenarios linked but not run

  Step 5c — UC Coverage Check
    Each UC must have at least 1 scenario covering ac_refs

  Step 5d — Long-Running Release Gates (if feature_list ≥ 2.4.0)
    feature.acceptance_criteria_id all in design_doc?
    feature.qa_trace_coverage.gap_acs == [] ?
    feature.nfr_compliance.[*].blocks_release && score < required ?

Score formula reweighted:
  Entity Integration  15%
  API Integration     15%
  Page Integration    15%
  AC Coverage         25%  ← new
  UC Coverage         15%  ← new
  Sync Freshness      15%

Release-Ready override:
  ANY GAP / FAIL AC → blocked (regardless of total score)


🔄 Workflow QA-aware

  1. /create-design-doc                    # Section 2.4 + 2.5
  2. /create-diagram er, sequence...
  3. /validate-design-doc                  # check AC format
  4. /sync-with-qa-tracker                 # push AC IDs
  5. (qa-ui-test side) /qa-create-scenario --auto-link
  6. (qa-ui-test side) /qa-run
  7. /sync-with-qa-tracker                 # pull coverage
  8. /validate-integration                 # release-ready check


🔙 Backward compat

  ❌ ไม่มี Section 2.4 (ACs)?           → /validate-integration WARN-only
  ❌ ไม่มี qa-tracker.json?              → AC checks skipped (score reweighted)
  ❌ AC format ผิด (AC-X.Y)?              → /validate-design-doc FAIL


💡 ตัวอย่าง: เพิ่ม AC ลง design doc ที่มีอยู่แล้ว

  1. /edit-section requirements         # เพิ่ม Section 2.4
  2. ใส่ AC table (AC-001 ... AC-NNN)
  3. /validate-design-doc               # check format
  4. /sync-with-qa-tracker              # push to qa-tracker

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔜 ดูเพิ่ม:
   /help sync-with-qa-tracker     → command details
   /help validate-integration     → 4-plugin validation
   /qa-help --trace               → qa-ui-test side
```

---

### Mode 6.6: `--new` → What's new in v2.2.0

```
✨ What's new in v2.2.0 (2026-06-13)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 Documentation sync ครั้งใหญ่
  • README + /help ตรงกับความสามารถจริงครบ 22 commands
  • /system-design-doc (main entry) สร้าง split layout (default) เหมือน /create-design-doc, /import-plan
  • frontmatter ครบทุก command (เพิ่มให้ sync-with-features, sync-with-mockups, validate-integration)
  • แก้ allowed-tools ขัดแย้ง (brainstorm-design ได้ Write/Bash, sitemap-scan Agent→Task)
  • ${CLAUDE_PLUGIN_ROOT} สำหรับ intra-plugin template/reference paths

🧪 qa-ui-test contract fix สองฝั่ง (qa-ui-test v2.6.1)
  • /qa-trace resolve AC/UC ผ่าน .design-docs/design_doc_list.json registry (split-aware)
  • ตัวอย่าง acceptance_criteria_id เป็น flat AC-NNN ตาม CRITICAL RULE 24
  • เพิ่ม scenario.use_case_id ใน qa-tracker template (รับค่าจาก /sync-with-qa-tracker)


✨ v2.1.0 (2026-05-29) — Split per-section layout (default)

  • เอกสารแยกไฟล์: .design-docs/<slug>/00-index.md + 01..10-<key>.md
  • registry schema 2.3.0: doc_layout, doc_dir, sections[] (machine map สำหรับ consumers)
  • /split-design-doc — migrate เอกสาร single-file เดิม (เก็บ original เป็น .bak)
  • /edit-section, /create-diagram, /validate-design-doc เป็น split-aware
  • CRITICAL RULES 36-38


✨ v2.0.0 (2026-05-07) — sitemap.json machine-readable graph

  • 8 node types 2 layers (Design System + Application)
  • 8 commands ใหม่: /sitemap-init /sitemap-add-node /sitemap-link /sitemap-scan
    /sync-sitemap /sitemap-validate /sitemap-graph /sitemap-export
  • Section 9.4-9.9 + validation rules R31-R35 + JSON Schema draft-07 (ajv-cli)


✨ v1.7.0 (2026-05-05) — qa-ui-test v2.5 Integration

system-design-doc กลายเป็น source of truth สำหรับ AC + UC IDs ที่ qa-ui-test consume


📋 Schema additions (design_doc_list.json 2.1.0 → 2.2.0):

  documents[].acceptance_criteria[]
    • id: "AC-NNN" (flat 3-digit zero-padded)
    • title, module, fr_ref, br_ref, uc_ref, type
    • linked_scenarios[], sync_status

  documents[].use_cases[]
    • id: "UC-NNN"
    • actors, preconditions, main_flow, alternative_flows
    • fr_refs[], ac_refs[]

  integration.qa_tracker_path
  integration.last_synced_with_qa_tracker
  sync_status.qa_tracker { covered_acs, gap_acs, ... }


📝 Template additions (design-doc-template.md):

  Section 2.4 Acceptance Criteria — table format
  Section 2.5 Use Cases — UC inventory + per-UC details


🆕 New command:

  /sync-with-qa-tracker — bidirectional AC/UC sync
    --gaps-only / --auto-link / --dry-run flags


🔄 Expanded command:

  /validate-integration — 3 → 4 plugins
    + Step 5b (AC coverage)
    + Step 5c (UC coverage)
    + Step 5d (long-running release gates)
    + Release-Ready override (GAP/FAIL = blocker)


📋 7 new CRITICAL RULES (24-30):

  24. AC ID format = AC-NNN (flat, 3-digit zero-padded)
  25. UC heading = `### Use Case (UC-NNN): Title` exactly
  26. Each AC must be independently testable
  27. AC must reference ≥ 1 FR/BR/NFR
  28. UC ↔ AC bidirectional refs
  29. Backward-compat: pre-v1.7 docs → warn-only
  30. Inline AC line format: `AC-NNN: <criterion>`


🔙 Migration path:

  เอกสารเก่าไม่มี Section 2.4/2.5?
  → ใช้งานได้ปกติ (warn-only)
  → optional: /edit-section requirements → เพิ่ม AC table


📚 ดูเพิ่ม:
   /help --qa                    → AC/UC integration deep-dive
   /help sync-with-qa-tracker    → sync command details
```

---

### Mode 7: `--validation` → Validation guide

```
✅ Validation Commands
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

มี 2 ระดับ validation:

   Level 1 — Internal (ภายใน plugin เดียว)
   ─────────────────────────────────────
   $ /validate-design-doc

   ตรวจ:
   • entities มี attributes ครบไหม?
   • api_endpoints มี method + path + response schema?
   • diagrams ที่ระบุใน config มีไฟล์จริงไหม?
   • layers/sections ครบทุกอันที่ template กำหนด?
   • orphan references (diagram ที่ไม่มี entity จริง)?


   Level 2 — Cross-plugin (4 plugins ⭐ v1.7.0)
   ─────────────────────────────────────
   $ /validate-integration

   ตรวจ:
   • feature.design_doc_refs.api_ref → API จริงไหม?
   • feature.design_doc_refs.entity_ref → entity จริงไหม?
   • mockup.entity_ref → entity ใน design ไหม?
   • design.api_endpoints.feature_id → feature จริงไหม?
   • ⭐ AC coverage: ทุก AC มี scenario (qa-tracker) ไหม?
   • ⭐ UC coverage: ทุก UC มี scenario ครอบคลุมไหม?
   • ⭐ feature.qa_trace_coverage.gap_acs == [] ?
   • ⭐ feature.nfr_compliance.[*].blocks_release && score<required?
   • orphan resources ทุก plugin

   Release-Ready Override:
   • ANY AC gate=GAP   → blocked
   • ANY AC gate=FAIL  → blocked
   • blocking NFR fail → blocked
   (regardless of overall integration score)

🎯 เมื่อใช้:
   /validate-design-doc       → หลัง /create-design-doc, /edit-section
   /validate-integration      → ก่อน release, หลัง major refactor

🔜 ดูเพิ่ม:
   /help validate-design-doc
   /help validate-integration
   /help --qa                 → AC/UC ใน design doc
```

---

### Mode 8: คำสั่งเฉพาะ (เมื่อมี argument)

**สำหรับแต่ละคำสั่ง แสดง:**

```
📖 [Command Name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 คำอธิบาย:
   [description in Thai]

📋 Usage:
   /[command] [args]

📌 Prerequisites:
   - [files/commands ที่ต้องมีก่อน]

💡 ตัวอย่าง:
   [3-5 examples]

📁 Output:
   [files/state changes]

🔜 Next Action:
   [suggested commands หลังจากนี้]

⏱️ เวลาโดยประมาณ:
   [estimated time]
```

---

### รายละเอียดแต่ละคำสั่ง (สำหรับ Mode 8)

**system-design-doc:**
- Prerequisites: ไม่มี
- Output: เมนู เลือก mode → เรียก subcommand
- Time: < 1 min (เมนู), 5-30 min (รวม subcommand)
- Next: /create-design-doc, /reverse-engineer, /import-plan

**create-design-doc:**
- Prerequisites: ไม่มี (อาจ optional มี requirements)
- Output: design_doc_list.json (initial)
- Time: 10-20 min (ขึ้นกับขนาด project)
- Next: /create-diagram er, /validate-design-doc

**reverse-engineer:**
- Prerequisites: source code project
- Output: design_doc_list.json + ER diagram + partial sequence
- Time: 5-15 min
- Next: /validate-design-doc, /edit-section (เติม context)

**import-plan:**
- Prerequisites: implementation plan / free-form doc (.md, .docx)
- Output: design_doc_list.json (standardized จาก plan)
- Time: 5-10 min
- Next: /validate-design-doc, /create-diagram

**brainstorm-design:**
- Prerequisites: ไม่มี
- Output: requirements clarification (ไม่ได้สร้าง design doc โดยตรง)
- Time: 15-30 min (interactive)
- Next: /create-design-doc

**create-diagram:**
- Prerequisites: design_doc_list.json
- Output: diagram file (Mermaid format) + อัปเดต design_doc_list.json
- รองรับ: er, flow, dfd, sequence, sitemap, state, class, architecture
- Time: 2-5 min ต่อ diagram
- Next: /create-diagram (next type), /validate-design-doc

**edit-section:**
- Prerequisites: design_doc_list.json
- Output: อัปเดต section ที่ระบุ
- Sections: entities, api_endpoints, layers, diagrams, security, deployment, ...
- Time: 2-10 min
- Next: /validate-design-doc, /sync-with-features (ถ้ากระทบ feature)

**validate-design-doc:**
- Prerequisites: design_doc_list.json
- Output: validation report (gaps, orphan refs, missing fields)
- Time: 1-2 min
- Next: /edit-section ตามรายงาน

**validate-integration:**
- Prerequisites: design_doc_list.json + feature_list.json + (mockup_list.json optional)
- Output: cross-plugin validation report
- Time: 2-3 min
- Next: /sync-with-features, /sync-with-mockups, /edit-section

**sync-with-features:**
- Prerequisites: design_doc_list.json + feature_list.json
- Output: bidirectional update — feature.design_doc_refs + design.feature_id
- Special: ⭐ อ่าน feature.design_doc_refs.pending_updates (จาก long-running v2.4.0)
- Time: 2-3 min
- Next: /validate-integration

**sync-with-mockups:**
- Prerequisites: design_doc_list.json + .mockups/mockup_list.json
- Output: bidirectional update — mockup.entity_ref + sitemap consistency
- Time: 2-3 min
- Next: /validate-integration

**sync-with-qa-tracker:** ⭐ v1.7.0
- Prerequisites: design_doc_list.json (schema ≥ 2.2.0) + qa-tracker.json (schema ≥ 1.7.0)
- Output: bidirectional update — push AC/UC IDs to scenarios + pull coverage
- Special: ⭐ auto-discovery จาก markdown grep, score-based auto-link, GAP detection
- Flags: --gaps-only / --auto-link / --dry-run
- Time: 2-5 min (ขึ้นกับจำนวน ACs/scenarios)
- Next: /validate-integration, /qa-trace (qa-ui-test side)

**split-design-doc:** ⭐ v2.1
- Prerequisites: เอกสาร single-file (doc_layout:"single") + design_doc_list.json
- Output: .design-docs/<slug>/00-index.md + 01..10-<key>.md (original เก็บเป็น .bak) + registry → 2.3.0
- Time: 2-5 min
- Next: /validate-design-doc

**sitemap-init:** ⭐ v2.0
- Prerequisites: ไม่มี (--force ถ้ามีไฟล์เดิม)
- Output: .design-docs/sitemap.json จาก template + ajv validation
- Time: < 1 min
- Next: /sitemap-scan หรือ /sitemap-add-node

**sitemap-add-node:** ⭐ v2.0
- Prerequisites: sitemap.json (/sitemap-init ก่อน)
- Output: node ใหม่ (8 ประเภท) + auto-assign ID (P-/API-/MW-/EXT-/MP-/TPL-/NAV-/CMP-)
- Time: < 1 min ต่อ node
- Next: /sitemap-link, /sitemap-validate

**sitemap-link:** ⭐ v2.0
- Prerequisites: sitemap.json + nodes ที่จะเชื่อม
- Output: edge ใหม่ใน edges[] + validate type/prefix + sync cross-ref fields
- Types: calls, guarded-by, calls-external, uses-master, uses-template, uses-component, has-nav, links-to
- Time: < 1 min ต่อ edge
- Next: /sitemap-graph, /sitemap-validate

**sitemap-scan:** ⭐ v2.0
- Prerequisites: sitemap.json + source code project
- Output: auto-discover Pages/APIs/Middlewares/External/Components + infer edges (แสดง plan ก่อน write)
- Flags: --types <list> / --dry-run / --update
- Time: 3-10 min (ขึ้นกับขนาด codebase)
- Next: /sitemap-validate, /sitemap-graph

**sync-sitemap:** ⭐ v2.0
- Prerequisites: sitemap.json + design doc Section 9
- Output: sync 2 phase — Section 9 tables ↔ sitemap.json (ตาม mtime) + pull downstream stats
- Flags: --to-md / --from-md / --pull-downstream
- Time: 2-3 min
- Next: /sitemap-validate

**sitemap-validate:** ⭐ v2.0
- Prerequisites: sitemap.json
- Output: ajv schema validation + กฎ R31-R35 report
- Flags: --strict (R33 warn→error)
- Time: 1-2 min
- Next: แก้ตาม report → /sitemap-validate ซ้ำ

**sitemap-graph:** ⭐ v2.0
- Prerequisites: sitemap.json ที่มี edges
- Output: Mermaid flowchart → embed Section 9.8 (หรือ --to-stdout)
- Flags: --types <list> / --to-stdout
- Time: 1-2 min
- Next: /sync-sitemap

**sitemap-export:** ⭐ v2.0
- Prerequisites: sitemap.json
- Output: Cytoscape JSON / GraphML / Graphviz DOT
- Time: < 1 min
- Next: ใช้ไฟล์กับ external tool

**help:**
- Prerequisites: ไม่มี
- Output: display only
- Time: < 1 min

---

## Output สุดท้าย

แสดงข้อมูลตาม mode + argument ที่ได้รับ จบด้วย next-action suggestions

---

## Next Action

```
🔜 พร้อมเริ่มต้น?
   /system-design-doc              — Main entry (เลือก mode)
   /reverse-engineer               — มี code แล้ว
   /help --quick                   — Quick start guide
   /help --diagrams                — Diagram types reference
   /help --integration             — เชื่อม plugins อื่น (4 plugins)
   /help --qa                      — qa-ui-test integration (AC/UC traceability)
   /help --new                     — What's new in v2.2.0
```

> 💬 **หมายเหตุ:** คำสั่งนี้ตอบเป็นภาษาไทย (ศัพท์เทคนิคใช้ภาษาอังกฤษ)
