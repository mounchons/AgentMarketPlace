---
description: อธิบายวิธีใช้งาน ui-mockup plugin — แสดงคำสั่งทั้งหมด, workflow, integration กับ plugins อื่น
allowed-tools: Read(*), Bash(*)
---

# UI Mockup Help — คู่มือการใช้งาน

คุณคือ **UI Mockup Help Guide** — ผู้ช่วยอธิบายวิธีใช้งาน ui-mockup plugin (v1.6.0+)

## CRITICAL RULES

1. **Read-only** — คำสั่งนี้ไม่แก้ไขไฟล์ใดๆ
2. **ตอบตาม argument** — ไม่มี argument = แสดงทั้งหมด, มี argument = แสดงเฉพาะคำสั่ง/หัวข้อนั้น
3. **ตัวอย่างชัดเจน** — ทุกคำสั่งต้องมี usage + ตัวอย่าง
4. **บอก ASCII vs HTML mode** — แต่ละ command ใช้ mode ใด

### Self-Check (MANDATORY)

- [ ] ตรวจ argument ว่ามีหรือไม่?
- [ ] แสดงข้อมูลถูกต้องตาม argument?
- [ ] มีตัวอย่างทุกคำสั่ง?
- [ ] บอก mode (ASCII / HTML) ที่ command รองรับ?

---

## Input ที่ได้รับ

```
/help                          # แสดงทั้งหมด
/help [command-name]           # คำสั่งเฉพาะ เช่น /help create-mockup
/help --quick                  # Quick Start (3 ขั้นตอน)
/help --workflow               # Full workflow
/help --integration            # Integration กับ system-design-doc, long-running, frontend-design
/help --html                   # HTML mockup workflow (Web Component)
/help --ascii                  # ASCII wireframe workflow
/help --parallel               # Parallel mockup creation (sub-agents)
```

---

## ขั้นตอนที่ต้องทำ

### Mode 1: ไม่มี argument → แสดงทั้งหมด

```
📖 UI Mockup — คู่มือการใช้งาน v1.6.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

สร้างและแก้ไข UI Mockup/Wireframe จาก System Design Document
รองรับ ASCII wireframes + HTML mockups (Web Component master page)
Bridge ระหว่าง system-design-doc และ frontend-design + long-running

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏗️  SETUP (1 command)

  /init-mockup                 Initialize ui-mockup environment
                               (สร้าง .mockups/ + mockup_list.json)
                               ตัวอย่าง: /init-mockup
                               ⚠ แนะนำให้รันหลัง /system-design-doc

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎨 CREATION (3 commands)

  /create-mockup               สร้าง mockup เดี่ยว — ASCII wireframe
                               ตัวอย่าง: /create-mockup login
                               ตัวอย่าง: /create-mockup product-detail

  /create-mockups-parallel     สร้างหลาย mockups พร้อมกันด้วย sub-agents
                               ตัวอย่าง: /create-mockups-parallel
                               ⚠ ใช้ Claude Sub Agents — เร็ว แต่ใช้ token เยอะ

  /create-html-mockup          สร้าง HTML mockup ⭐ Web Component master page
                               ตัวอย่าง: /create-html-mockup login
                               ⚠ ใช้ frontend-design skill — production-grade

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✏️  EDITING (1 command)

  /edit-mockup                 แก้ไข mockup ที่มี (ASCII หรือ HTML)
                               ตัวอย่าง: /edit-mockup login
                               ตัวอย่าง: /edit-mockup login "เพิ่ม OAuth"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 INSPECTION (1 command)

  /list-mockups                แสดงรายการ mockups ทั้งหมดใน project
                               ตัวอย่าง: /list-mockups

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ VALIDATION (1 command)

  /validate-mockup             ตรวจ completeness + compliance
                               ตัวอย่าง: /validate-mockup
                               ตัวอย่าง: /validate-mockup login

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 แนะนำจุดเริ่มต้น

  เพิ่งเริ่มใหม่?         → /help --quick           (Quick Start 3 ขั้นตอน)
  อยาก HTML mockup?       → /help --html            (Web Component flow)
  อยาก ASCII wireframe?   → /help --ascii           (เร็ว, สำหรับ early stage)
  มี pages เยอะ?          → /help --parallel        (Sub-agent parallel)
  เชื่อม design doc?      → /help --integration
  ดูคำสั่งเฉพาะ?           → /help [command]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Workflow แนะนำ

🆕 Standard flow (ASCII first):
   /system-design-doc                # design doc ก่อน
   /init-mockup                      # init .mockups/
   /create-mockup login              # สร้าง ASCII ก่อน
   /create-mockup dashboard
   /validate-mockup                  # ตรวจ
   /sync-with-mockups                # (system-design-doc) sync กลับ

🚀 HTML production flow:
   /init-mockup
   /create-html-mockup login         # ⭐ HTML ตั้งแต่ต้น
   /create-html-mockup dashboard     # frontend-design quality
   → ส่ง mockup HTML ให้ stakeholder review

⚡ Bulk creation:
   /init-mockup
   /create-mockups-parallel          # สร้างหลายหน้าพร้อมกัน
   /list-mockups                     # ดูที่ได้
   /validate-mockup                  # ตรวจ

🔧 Maintenance:
   /list-mockups                     # ดูที่มี
   /edit-mockup [name] [change]      # แก้
   /validate-mockup                  # ตรวจ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 ASCII vs HTML — เมื่อใช้แต่ละแบบ?

   ASCII Wireframe        | HTML Mockup
   ─────────────────────── | ──────────────────────────
   Early stage             | Mid-late stage
   Stakeholder ที่ไม่ได้   | Demo ให้ stakeholder
   technical               | clickable (กึ่ง prototype)
   เร็วมาก (1-2 min/page)  | นานกว่า (5-15 min/page)
   text-only               | full styling, components
   /create-mockup          | /create-html-mockup
   /create-mockups-parallel| —

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 ดูเพิ่ม
   /help --quick           Quick Start
   /help --html            HTML mockup flow
   /help --parallel        Parallel creation
   /help --integration     Cross-plugin integration
```

---

### Mode 2: `--quick` → Quick Start

```
🚀 UI Mockup — Quick Start (3 ขั้นตอน)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ขั้นตอนที่ 1️⃣ — Setup
─────────────────────────────────────────────
$ /init-mockup

Agent จะ:
  • สแกน design doc / project requirements
  • สร้าง .mockups/ directory
  • สร้าง mockup_list.json (รายการ pages ที่ต้อง mockup)

ผลลัพธ์: planning data พร้อมสร้าง mockups


ขั้นตอนที่ 2️⃣ — Create Mockups
─────────────────────────────────────────────
เลือกตามความต้องการ:

  เร็ว / ASCII:
    $ /create-mockup login
    $ /create-mockup dashboard
    ...

  Production-grade / HTML:
    $ /create-html-mockup login
    $ /create-html-mockup dashboard
    ...

  Bulk (มี pages เยอะ):
    $ /create-mockups-parallel    # parallel sub-agents

ผลลัพธ์: .mockups/[page].mockup.md หรือ .html


ขั้นตอนที่ 3️⃣ — Validate + Sync
─────────────────────────────────────────────
$ /list-mockups                # ดูที่สร้าง
$ /validate-mockup             # completeness check
$ /sync-with-mockups           # (system-design-doc) sync กลับ

→ ส่งต่อ /generate-features-from-mockups (long-running)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Goal: complete mockups + cross-plugin sync
```

---

### Mode 3: `--workflow` → Full workflow

```
🔄 UI Mockup — Full Workflow
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 Day 0 — Prerequisites
─────────────────────────────────
แนะนำให้มีก่อน:

  $ /system-design-doc           # design doc มาก่อน
    → output: design_doc_list.json (มี sitemap, entities)

หรือ greenfield (ไม่มี design):
  รัน /init-mockup ตรงๆ ได้ — agent จะถาม requirements


📅 Day 1 — Setup + Plan
─────────────────────────────────
$ /init-mockup

Agent จะ:
  • อ่าน design_doc_list.json (ถ้ามี)
  • อ่าน CLAUDE.md (project conventions)
  • สแกน routes ใน source code (ถ้ามี)
  • สร้าง mockup_list.json:
      pages: [login, dashboard, ...] พร้อม priority

  Output: .mockups/mockup_list.json + .mockups/README.md


📅 Day 2 — Create Mockups (เลือก approach)
─────────────────────────────────

  Approach A: ASCII first → HTML later
  ──────────────────────────────────
  Pros: เร็ว, iterative ดี, ง่ายแก้
  Cons: ดูไม่สวย, stakeholder ไม่ technical อาจไม่เข้าใจ

  $ /create-mockup login
  $ /create-mockup register
  $ /create-mockup dashboard
  ...
  (review with team)
  $ /edit-mockup login "เปลี่ยน layout"
  ...
  (เมื่อ design lock)
  $ /create-html-mockup login   # convert ASCII → HTML

  Approach B: HTML directly
  ─────────────────────────
  Pros: production-grade ตั้งแต่ต้น, demo ได้
  Cons: นานกว่า, แก้ยากกว่า ASCII

  $ /create-html-mockup login   # ใช้ frontend-design skill
  $ /create-html-mockup dashboard
  ...

  Approach C: Bulk parallel
  ─────────────────────────
  Pros: เร็วถ้า pages เยอะ
  Cons: ใช้ token เยอะ, ต้อง review ทีละ page

  $ /create-mockups-parallel    # spawn sub-agents


📅 Day 2-3 — Validate + Sync
─────────────────────────────────
$ /list-mockups                # ดูสรุป
$ /validate-mockup             # check ครบ
   ตรวจ:
   • field mapping (mockup → entity)
   • alert library (SweetAlert2 default)
   • framework-aware URL
   • required components

$ /sync-with-mockups           # (system-design-doc) update sitemap


📅 Day 3+ — Implementation Handoff
─────────────────────────────────
ส่งต่อ:
  $ /generate-features-from-mockups   # (long-running)
  $ /continue                          # (long-running) implement

  ใน /continue agent จะ:
    • อ่าน mockup ที่ผูกกับ feature
    • implement ตาม mockup spec
    • mark passes=true

📅 Maintenance — เมื่อ requirement เปลี่ยน
─────────────────────────────────
$ /edit-mockup [name] [change]
$ /validate-mockup
$ /sync-with-mockups
$ /sync-mockups (long-running)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Tips
  • commit ทุกครั้งหลัง /create-mockup (rollback ง่าย)
  • ASCII first สำหรับ project ที่ requirement ยังไม่ stable
  • HTML directly สำหรับ project ที่ stakeholder ต้อง demo
```

---

### Mode 4: `--integration` → Cross-plugin integration

```
🔗 Integration: ui-mockup ↔ plugins อื่น
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 ui-mockup เป็น "bridge" ระหว่าง design ↔ implementation


📊 Data Flow:

   ┌─────────────────────────────┐
   │ system-design-doc           │
   │ design_doc_list.json        │
   │  • diagrams.sitemap         │
   │  • entities[]               │
   └────────────┬────────────────┘
                │ /init-mockup reads
                │ /sync-with-mockups
                ▼
   ┌─────────────────────────────┐         ┌─────────────────────────┐
   │ ui-mockup (THIS PLUGIN)     │ ◄─────► │ frontend-design skill   │
   │ .mockups/mockup_list.json   │ uses    │ (HTML quality, design   │
   │  • pages[]                  │         │  tokens, components)    │
   │  • components[]             │         │                         │
   │  • design_tokens            │         │                         │
   └────────────┬────────────────┘         └─────────────────────────┘
                │ /generate-features-from-mockups
                │ /sync-mockups (long-running)
                ▼
   ┌─────────────────────────────┐
   │ long-running                │
   │ feature_list.json           │
   │  • features[]               │
   │  • references: [.mockups/...]│
   └─────────────────────────────┘


🔌 Connection Points:

   1. ← system-design-doc (upstream)
      ──────────────────────────────
      • /init-mockup อ่าน design_doc_list.json:
        - diagrams.sitemap → page list
        - entities[] → field mapping
      • /sync-with-mockups (system-design-doc) sync 2 ทาง

      Schema:
      mockup.entity_ref = "ENT-001"        ← ผูกกับ entity ใน design
      mockup.api_refs = ["API-001", ...]   ← ผูกกับ API

   2. → long-running (downstream)
      ─────────────────────────
      • /generate-features-from-mockups (long-running):
        สร้าง feature ต่อ mockup page
      • /sync-mockups (long-running):
        validate references + orphan check
      • feature.references = [".mockups/login.mockup.md"]

   3. ↔ frontend-design (skill)
      ──────────────────────
      • /create-html-mockup ใช้ frontend-design skill
        - design tokens (color, spacing, typography)
        - production-grade component patterns
        - Web Component master page

   4. ← brain (knowledge, optional)
      ──────────────────────────
      • /init-mockup อ่าน CLAUDE.md → conventions
      • /create-mockup อ่าน reference_nav_example (ถ้ามีใน brain)


🔄 Common Cross-Plugin Workflows:

   Standard:
   ────────
   1. /system-design-doc                     (system-design-doc)
   2. /create-diagram sitemap                (system-design-doc)
   3. /init-mockup                           (THIS) อ่าน sitemap
   4. /create-mockup [page]                  (THIS) ทีละหน้า
      หรือ
      /create-html-mockup [page]             (THIS) HTML
      หรือ
      /create-mockups-parallel               (THIS) bulk
   5. /validate-mockup                       (THIS)
   6. /sync-with-mockups                     (system-design-doc)
   7. /generate-features-from-mockups        (long-running)
   8. /continue                              (long-running) implement


💡 Setup Requirements:
  • system-design-doc plugin (upstream — recommended)
  • long-running plugin (downstream — สำหรับ implement)
  • frontend-design skill (สำหรับ /create-html-mockup)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔜 ดูเพิ่ม:
   /help --html            HTML mockup workflow
   /help create-html-mockup → command details
```

---

### Mode 5: `--html` → HTML mockup workflow

```
🎨 HTML Mockup Workflow (Web Component master page)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ใช้เมื่อ: ต้อง demo ให้ stakeholder, production-grade quality

📋 Features:

   ✅ Web Component master page (header + sidebar + nav)
   ✅ frontend-design skill quality
   ✅ design tokens (color, spacing, typography)
   ✅ alert library (SweetAlert2 default จาก CLAUDE.md)
   ✅ framework-aware URL syntax
   ✅ field mapping (form ↔ entity)
   ✅ responsive layouts


📋 Steps:

   1. /init-mockup
      ──────────────
      Output: .mockups/mockup_list.json + master page setup

   2. /create-html-mockup [page-name]
      ──────────────────────────────
      Agent จะ:
      • อ่าน mockup_list.json (page spec)
      • อ่าน design_doc_list.json (entity, API refs)
      • อ่าน CLAUDE.md (alert library, framework)
      • ใช้ frontend-design skill สร้าง HTML
      • link master page (header/sidebar)

      Output: .mockups/[page].html

   3. Browser preview
      ───────────────
      $ start .mockups/[page].html  (Windows)
      $ open .mockups/[page].html   (Mac)

   4. /edit-mockup [page] [change]
      ────────────────────────────
      Iterative refinement

   5. /validate-mockup
      ────────────────
      ตรวจ:
      • design tokens ใช้ตาม spec?
      • alert library ตรงกับ CLAUDE.md?
      • field mapping ถูก?
      • framework URL syntax ถูก (Razor, JSX, etc.)?


🎯 Best Practices:
  • ใช้ master page เพื่อ consistency ทุกหน้า
  • อย่า inline CSS — ใช้ design tokens
  • test browser preview ทุก iteration
  • commit ทุก /create-html-mockup เพื่อ rollback ง่าย


🔜 ดูเพิ่ม:
   /help create-html-mockup
   /help validate-mockup
```

---

### Mode 6: `--ascii` → ASCII wireframe workflow

```
✏️ ASCII Wireframe Workflow
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ใช้เมื่อ: early stage, iterative design, technical team

📋 Format:

   .mockups/[page].mockup.md ประกอบด้วย:

   ## Page: Login
   ## Layout: ASCII art

   ┌─────────────────────────────────┐
   │  [Logo]      Welcome             │
   ├─────────────────────────────────┤
   │                                 │
   │   Email:    [____________]      │
   │   Password: [____________]      │
   │                                 │
   │   [Sign In]   [Forgot password] │
   │                                 │
   └─────────────────────────────────┘

   ## Components: ...
   ## Field Mapping: ... (→ entity)
   ## API Refs: ...
   ## Interactions: ...


📋 Steps:

   1. /init-mockup
   2. /create-mockup [page-name]
   3. /list-mockups (ดูสรุป)
   4. /edit-mockup [page] [change]
   5. /validate-mockup


🎯 Best Practices:
  • เริ่มจาก ASCII ก่อนเสมอถ้าไม่แน่ใจ requirement
  • แสดง field mapping (form input → entity attribute)
  • commit หลังทุก /create-mockup


🔜 ดูเพิ่ม:
   /help create-mockup
   /help --html      (เมื่อพร้อมยกระดับเป็น HTML)
```

---

### Mode 7: `--parallel` → Parallel mockup creation

```
⚡ Parallel Mockup Creation (Sub-Agents)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ใช้เมื่อ: มี pages เยอะ (>5), ต้อง bulk สร้างเร็ว

📋 Architecture:

   Main agent
       │
       ├─► sub-agent 1: create-mockup login
       ├─► sub-agent 2: create-mockup dashboard
       ├─► sub-agent 3: create-mockup product-list
       ├─► sub-agent 4: create-mockup product-detail
       └─► sub-agent N: create-mockup ...

   ทำพร้อมกัน — แต่ละ sub-agent มี context ของตัวเอง


📋 Steps:

   1. /init-mockup
      ──────────────
      ให้ sure mockup_list.json มี pages list ครบ

   2. /create-mockups-parallel
      ─────────────────────────
      Agent จะ:
      • อ่าน mockup_list.json
      • spawn sub-agents (1 per page)
      • รวม output → .mockups/[page].mockup.md ทุกหน้า

   3. /validate-mockup
      ────────────────
      Bulk validate ทุก mockup


⚠ Trade-offs:

   Pros:
   ✅ เร็ว — สร้างหลายหน้าใน ~15-20 min (vs 1-2 hr serial)
   ✅ context isolation — sub-agent ไม่กระทบกัน

   Cons:
   ❌ ใช้ token เยอะ (10x ของ serial)
   ❌ consistency อาจต่ำ (ต่าง sub-agent อาจตีความต่างกัน)
   ❌ ต้อง review ทีละหน้า


🎯 เมื่อใช้:
  ✅ มี pages 5+ ที่ design pattern เหมือนกัน
  ✅ time-pressured
  ❌ project ที่ design ซับซ้อน + ต้อง consistent
  ❌ project ที่ token-budget จำกัด


🔜 ดูเพิ่ม:
   /help create-mockups-parallel
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

🎨 Mode:
   ASCII / HTML / both

🔜 Next Action:
   [suggested commands หลังจากนี้]

⏱️ เวลาโดยประมาณ:
   [estimated time]
```

---

### รายละเอียดแต่ละคำสั่ง (สำหรับ Mode 8)

**init-mockup:**
- Prerequisites: ไม่มี (optional: design_doc_list.json)
- Output: .mockups/ directory + mockup_list.json
- Mode: setup
- Time: 2-5 min
- Next: /create-mockup, /create-html-mockup, /create-mockups-parallel

**create-mockup:**
- Prerequisites: .mockups/mockup_list.json (จาก /init-mockup)
- Output: .mockups/[page].mockup.md (ASCII wireframe)
- Mode: ASCII
- Time: 1-3 min ต่อ page
- Next: /edit-mockup, /validate-mockup, /create-html-mockup (upgrade)

**create-html-mockup:**
- Prerequisites: .mockups/mockup_list.json + frontend-design skill
- Output: .mockups/[page].html (HTML + Web Component)
- Mode: HTML
- Special: ⭐ ใช้ frontend-design skill, อ่าน CLAUDE.md (alert library)
- Time: 5-15 min ต่อ page
- Next: /edit-mockup, /validate-mockup

**create-mockups-parallel:**
- Prerequisites: .mockups/mockup_list.json มี pages list
- Output: .mockups/*.mockup.md (multiple) — spawn sub-agents
- Mode: ASCII (default), อาจ extend HTML
- Special: ⭐ ใช้ Claude Sub Agents — token-heavy แต่เร็ว
- Time: 15-20 min สำหรับ 5-10 pages
- Next: /list-mockups, /validate-mockup

**edit-mockup:**
- Prerequisites: .mockups/[page].mockup.md หรือ .html
- Output: อัปเดต file
- Mode: ตามไฟล์เดิม (ASCII หรือ HTML)
- Time: 2-5 min
- Next: /validate-mockup, /sync-with-mockups

**list-mockups:**
- Prerequisites: .mockups/mockup_list.json
- Output: display only — รายการ pages + status
- Time: < 1 min
- Next: /create-mockup (ที่ยังไม่มี), /edit-mockup, /validate-mockup

**validate-mockup:**
- Prerequisites: .mockups/ ที่มี mockups อย่างน้อย 1 ไฟล์
- Output: validation report
  - field mapping completeness
  - alert library compliance
  - framework URL syntax
  - required components
- Time: 1-3 min
- Next: /edit-mockup ตามรายงาน

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
   /init-mockup                    — Setup .mockups/
   /create-mockup [page]           — ASCII wireframe (เร็ว)
   /create-html-mockup [page]      — HTML mockup (production-grade)
   /help --quick                   — Quick start guide
   /help --html                    — HTML workflow
   /help --integration             — เชื่อม plugins อื่น
```

> 💬 **หมายเหตุ:** คำสั่งนี้ตอบเป็นภาษาไทย (ศัพท์เทคนิคใช้ภาษาอังกฤษ)
