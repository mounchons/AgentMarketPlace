---
description: อธิบายวิธีใช้งาน long-running plugin — แสดงคำสั่งทั้งหมด, workflow, integration กับ plugins อื่น
allowed-tools: Read(*), Bash(*)
---

# Long-Running Help — คู่มือการใช้งาน

คุณคือ **Long-Running Help Guide** — ผู้ช่วยอธิบายวิธีใช้งาน long-running plugin (v2.4.0+)

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
/help [command-name]           # คำสั่งเฉพาะ เช่น /help add-feature
/help --quick                  # Quick Start (3 ขั้นตอน)
/help --workflow               # Full workflow walkthrough
/help --integration            # Integration กับ plugins อื่น (system-design-doc, ui-mockup, qa-ui-test)
/help --setup                  # Setup commands เท่านั้น
/help --features               # Feature management commands
/help --new                    # What's new in v2.4.0
```

---

## ขั้นตอนที่ต้องทำ

### Mode 1: ไม่มี argument → แสดงทั้งหมด

```
📖 Long-Running — คู่มือการใช้งาน v2.4.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Harness สำหรับ AI Agent ทำงานข้าม context windows
Multi-session continuity, feature tracking, design doc integration,
verification pipeline, model assignment

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏗️  SETUP (4 commands)

  /init                        Initialize project ใหม่
                               ตัวอย่าง: /init

  /init-existing               เพิ่ม long-running ใน project ที่มีอยู่
                               ตัวอย่าง: /init-existing

  /init-project                สร้าง CLAUDE.md + initial config
                               ตัวอย่าง: /init-project

  /migrate                     Migrate schema เก่า → v1.5.0
                               ตัวอย่าง: /migrate

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔄 WORKFLOW (3 commands)

  /continue                    Coding Agent mode — หยิบ feature ทำต่อ
                               ตัวอย่าง: /continue
                               ตัวอย่าง: /continue 5      (ทำ feature #5)

  /status                      ดูสถานะ project + feature progress
                               ตัวอย่าง: /status

  /review                      Opus review งานที่ models อื่นทำ
                               ตัวอย่าง: /review
                               ตัวอย่าง: /review 5

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 FEATURE MANAGEMENT (2 commands) ⭐ v2.4.0 design doc check

  /add-feature                 เพิ่ม feature ใหม่ + design doc impact check
                               ตัวอย่าง: /add-feature เพิ่ม login page
                               ตัวอย่าง: /add-feature POST /api/users

  /edit-feature                แก้ feature ที่ผ่านแล้ว (สร้าง feature ใหม่อ้างอิง)
                               ตัวอย่าง: /edit-feature 5 - add OAuth
                               ตัวอย่าง: /edit-feature 7 - add pagination

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🪄 FEATURE GENERATION (2 commands)

  /generate-features-from-design     Auto-generate จาก system-design-doc
                                     ตัวอย่าง: /generate-features-from-design
                                     ⚠ ต้องมี design_doc_list.json

  /generate-features-from-mockups    Auto-generate จาก ui-mockup
                                     ตัวอย่าง: /generate-features-from-mockups
                                     ⚠ ต้องมี .mockups/mockup_list.json

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ VALIDATION & SYNC (3 commands)

  /dependencies                แสดง dependency graph + critical path
                               ตัวอย่าง: /dependencies

  /sync-mockups                Sync feature_list ↔ mockup_list
                               ตัวอย่าง: /sync-mockups

  /validate-coverage           Validate coverage ของ mockup/design/criteria
                               ตัวอย่าง: /validate-coverage

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 แนะนำจุดเริ่มต้น

  เพิ่งเริ่มใหม่?         → /help --quick      (Quick Start 3 ขั้นตอน)
  อยากเชื่อม design doc? → /help --integration
  ดูคำสั่งเฉพาะ?           → /help [command]   เช่น /help add-feature
  อยากรู้ว่ามีอะไรใหม่?    → /help --new       (v2.4.0 changes)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Workflow แนะนำ

🆕 First-time setup (Day 0):
   /init                              # สร้าง .agent/ + feature_list.json
   /init-project                      # สร้าง CLAUDE.md
   (optional) /system-design-doc      # design doc ก่อน
   (optional) /ui-mockup              # mockups
   /generate-features-from-design     # auto-generate features

🔨 Daily development (Day 1-N):
   /status                            # ดูภาพรวม
   /continue                          # ทำ feature ต่อไป
   /add-feature ...                   # เพิ่ม feature ใหม่ (ถามถ้ากระทบ design)
   /review                            # opus review งาน sonnet

🔧 When design changes:
   /edit-section [section]            # (system-design-doc) แก้ design
   /sync-with-features                # sync กลับ feature_list.json

🎯 Before release:
   /validate-coverage                 # ครอบคลุมหมดไหม?
   /dependencies                      # มี blocker ไหม?
   /sync-mockups                      # mockup ตรง feature?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 ดูเพิ่ม
   /help --quick           Quick Start 3 ขั้นตอน
   /help --workflow        Full workflow walkthrough
   /help --integration     Integration กับ plugins อื่น
   /help --new             v2.4.0 changes
```

---

### Mode 2: `--quick` → Quick Start 3 ขั้นตอน

```
🚀 Long-Running — Quick Start (3 ขั้นตอน)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ขั้นตอนที่ 1️⃣ — Setup
─────────────────────────────────────────────
$ /init
  → สร้าง .agent/ directory
  → สร้าง feature_list.json จาก template
  → สร้าง CLAUDE.md (ถ้ายังไม่มี)

ผลลัพธ์: project พร้อมรับ features


ขั้นตอนที่ 2️⃣ — เพิ่ม Features
─────────────────────────────────────────────
มี 3 ทางเลือก:

  ทางที่ 1 (manual):
    $ /add-feature สร้างหน้า login
    $ /add-feature เพิ่ม API GET /api/users
    ...

  ทางที่ 2 (auto จาก design doc):
    $ /system-design-doc                  # สร้าง design ก่อน
    $ /generate-features-from-design

  ทางที่ 3 (auto จาก mockups):
    $ /ui-mockup                          # สร้าง mockups ก่อน
    $ /generate-features-from-mockups

ผลลัพธ์: features ใน feature_list.json


ขั้นตอนที่ 3️⃣ — รัน + Review
─────────────────────────────────────────────
$ /status                       # ดูภาพรวม
$ /continue                     # หยิบ feature → implement → test → mark passes
$ /review                       # opus review งาน sonnet

วน loop step 3 จนหมด features

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Goal: passes 100% + verified ทุก feature
```

---

### Mode 3: `--workflow` → Full workflow walkthrough

```
🔄 Long-Running — Workflow ครบวงจร
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 Day 0 — Setup
─────────────────────────────────
$ /init-project                   # CLAUDE.md + project config
$ /init                           # .agent/ + feature_list.json

(optional แต่แนะนำ)
$ /system-design-doc              # ออกแบบ system
$ /ui-mockup                      # ออกแบบ mockups


📅 Day 0 (ต่อ) — Generate Features
─────────────────────────────────
$ /generate-features-from-design  # ครอบคลุมทุก layer
  หรือ
$ /generate-features-from-mockups # ครอบคลุมทุก UI page

ตรวจ:
$ /dependencies                   # graph + critical path
$ /validate-coverage              # ครอบคลุมหมดไหม?


📅 Day 1 — เริ่ม Implement
─────────────────────────────────
$ /status                         # ดูภาพรวม + workload
$ /continue                       # หยิบ feature ตาม priority

  ใน /continue:
    1. อ่าน feature → implement → test
    2. ถ้า passes → mark passes=true, tested_at=now
    3. ถ้า fail → log ใน notes, retry

$ /review                         # opus review (ถ้า assigned ให้ sonnet/glm)


📅 Day 2-N — เพิ่ม/แก้ feature ระหว่างทาง
─────────────────────────────────
มีของใหม่:
$ /add-feature ...                # ⭐ ตรวจ design doc impact ให้
                                   ถ้ากระทบ → ถาม 3 ทาง

แก้ของเก่า (ที่ pass แล้ว):
$ /edit-feature [id] - [change]   # ⭐ inherit design_doc_refs + impact check
                                   feature เก่ายังเก็บ history

design เปลี่ยน:
$ /edit-section [section]         # (system-design-doc) แก้ design
$ /sync-with-features             # sync กลับ


📅 Before Release — Validate
─────────────────────────────────
$ /validate-coverage              # ครอบคลุม mockup/design/criteria?
$ /dependencies                   # มี circular ไหม?
$ /sync-mockups                   # orphan mockup?
$ /status                         # 100% pass?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Tips
  • commit per feature — easy rollback
  • /status ทุก session
  • ใช้ /review สำหรับ feature สำคัญ
  • design_doc_refs ใน feature ช่วย trace การเปลี่ยนแปลง
```

---

### Mode 4: `--integration` → Integration กับ plugins อื่น

```
🔗 Integration: long-running ↔ plugins อื่น
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 long-running เป็น hub กลาง — feature_list.json คือ source of truth


📊 Data Flow:

   ┌─────────────────────┐
   │ system-design-doc   │
   │ design_doc_list.json│
   │  • entities[]       │
   │  • api_endpoints[]  │
   │  • diagrams.*       │
   └──────────┬──────────┘
              │ /generate-features-from-design
              │ /sync-with-features
              ▼
   ┌─────────────────────┐         ┌─────────────────────┐
   │ long-running        │ ◄─────► │ ui-mockup           │
   │ feature_list.json   │ /sync-  │ mockup_list.json    │
   │  • features[]       │ mockups │  • pages[]          │
   │  • design_doc_refs  │         │  • components[]     │
   └──────────┬──────────┘         └─────────────────────┘
              │
              │ /qa-bug-export (qa-ui-test)
              │ epic="bug-fix"
              ▼
   ┌─────────────────────┐
   │ qa-ui-test          │
   │ qa-tracker.json     │
   │  • bugs[]           │
   │  • exported_to ─────┘ → feature.linked_bug
   └─────────────────────┘


🔌 Connection Points:

   1. system-design-doc → long-running
      ─────────────────────────────────
      • /generate-features-from-design  → สร้าง features จาก design
      • /add-feature, /edit-feature     → ⭐ ตรวจ design doc impact
      • /sync-with-features             → sync 2 ทาง

      Schema:
      feature.design_doc_refs = {
        api_ref: "API-005",
        entity_ref: "ENT-001",
        diagram_refs: ["SEQ-001"],
        pending_updates: []
      }

   2. ui-mockup → long-running
      ─────────────────────────
      • /generate-features-from-mockups → features per mockup page
      • /sync-mockups                   → orphan check
      • /validate-coverage              → coverage check

      Schema:
      feature.references = [".mockups/login.mockup.md"]
      mockup.feature_id = 5

   3. qa-ui-test → long-running
      ─────────────────────────
      • /qa-bug-export                  → bug → feature ใหม่ (epic="bug-fix")
      • /qa-bug-export-subtask          → bug → subtask ใน feature เดิม
      • /qa-bug-verify --auto-sync      → ปิด feature เมื่อ verify ผ่าน

      Schema:
      feature.epic = "bug-fix"
      feature.linked_bug = "BUG-001"
      feature.subtasks = [
        { id: "15.1", description: "Reproduce", done: false },
        { id: "15.4", description: "Verify BUG-001", done: false }
      ]

   4. brain / bigbrain → long-running
      ──────────────────────────────
      • /brain-save / /bigbrain-save    → save feature context
      • /brain หรือ /bigbrain ใน /continue → query knowledge ก่อน implement


🔄 Common Cross-Plugin Workflows:

   Design-driven development:
   ─────────────────────────
   1. /system-design-doc                       → design doc
   2. /ui-mockup                                → mockups
   3. /generate-features-from-design           → features
   4. /continue                                 → implement
   5. /qa-create-scenario --auto                → test scenarios
   6. /qa-continue --module XXX                 → run tests
   7. /qa-bug-export → /continue → /qa-bug-verify  (verify loop)

   Bug fix flow:
   ─────────────
   1. /qa-bug-triage           (qa-ui-test)
   2. /qa-bug-export           (creates bug-fix feature in long-running)
   3. /continue                (long-running picks bug-fix feature)
   4. /qa-bug-verify --auto-sync  (closes loop)


💡 Setup Requirements:
  • system-design-doc plugin installed
  • ui-mockup plugin installed (optional)
  • qa-ui-test plugin installed (optional)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔜 ดูเพิ่ม:
   /help add-feature       → design doc impact check details
   /help edit-feature      → inherit + impact check details
   /qa-help --integration  → qa-ui-test side
```

---

### Mode 5: `--setup` → Setup commands เท่านั้น

```
🏗️  Setup Commands
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/init                  Project ใหม่ — สร้าง .agent/ + feature_list.json
/init-existing         Project ที่มีอยู่ — เพิ่ม long-running เข้าไป
/init-project          สร้าง CLAUDE.md + initial config
/migrate               Migrate schema เก่า → v1.5.0+ (สำคัญถ้า upgrade)

🔜 หลัง setup:
   /generate-features-from-design (ถ้ามี design doc)
   /add-feature (ถ้าจะ manual)
```

---

### Mode 6: `--features` → Feature management

```
📋 Feature Management Commands
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/add-feature [desc]              เพิ่ม feature ใหม่
                                  ⭐ v2.4.0: ตรวจ design doc impact

/edit-feature [id] - [change]    แก้ feature ที่ passed
                                  ⭐ v2.4.0: inherit design_doc_refs

/continue [id?]                   หยิบ feature → implement
/review [id?]                     opus review งานที่ผ่าน
/status                           ดู progress + workload

/dependencies                     graph + critical path
/validate-coverage                ครอบคลุม mockup/design ไหม?

🔜 ดูตัวอย่าง:
   /help add-feature
   /help edit-feature
```

---

### Mode 7: `--new` → What's new in v2.4.0

```
✨ What's new in v2.4.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⭐ Design Doc Impact Check (proactive sync)

/add-feature และ /edit-feature ตอนนี้ตรวจ design_doc_list.json ก่อนสร้าง feature

  flow:
    user รัน /add-feature
       ▼
    Step 4: ตรวจหา design_doc_list.json
       ▼
    ถ้ามี → วิเคราะห์ impact:
       • API endpoints (HTTP method+path)
       • Entities (table/attributes)
       • Diagrams (flow/sequence/ER)
       ▼
    ถ้าพบ impact → ถาม 3 ทาง:
       [1] อัปเดต design doc ก่อน
       [2] Skip + บันทึก pending_updates[]
       [3] ยกเลิก


🔧 Schema additions:
   feature.design_doc_refs = {
     api_ref: "API-005" | null,
     entity_ref: "ENT-001" | null,
     diagram_refs: [],
     pending_updates: []        ← deferred sync queue
   }


🔄 Edit feature inheritance:
   เมื่อ /edit-feature → new feature inherit design_doc_refs จาก original
   + เพิ่ม pending_updates ตาม impact ใหม่
   → history ของ design linkage ไม่หาย


📌 Migration:
   features เก่าที่ไม่มี design_doc_refs → field เป็น optional
   ไม่ต้องรัน /migrate (backward compatible)


📚 ดูเพิ่ม:
   plugins/long-running/tests/INTEGRATION_TEST.md  (regression checklist)
   /help --integration                              (cross-plugin flow)
```

---

### Mode 8: คำสั่งเฉพาะ (เมื่อมี argument)

**รองรับ format:** `add-feature`, `addfeature`, `/add-feature`, `init`, etc.

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

**init:**
- Prerequisites: ไม่มี (project ใหม่)
- Output: .agent/, feature_list.json, CLAUDE.md (optional)
- Time: < 1 min
- Next: /add-feature, /generate-features-from-design

**init-existing:**
- Prerequisites: project ที่มีอยู่
- Output: เพิ่ม .agent/ + feature_list.json โดยไม่กระทบของเดิม
- Time: 1-2 min
- Next: /status, /add-feature

**init-project:**
- Prerequisites: ไม่มี
- Output: CLAUDE.md + initial config
- Time: < 1 min
- Next: /init

**migrate:**
- Prerequisites: มี feature_list.json schema เก่า
- Output: backup + อัพเกรดเป็น v1.5.0+ schema
- Time: < 1 min
- Next: /status (verify)

**continue:**
- Prerequisites: feature_list.json มี features ที่ passes=false
- Output: implement → mark passes=true
- Time: 10-60 min ต่อ feature (ขึ้นกับ complexity)
- Next: /continue (next), /review, /qa-create-scenario

**status:**
- Prerequisites: .agent/config.json
- Output: display summary
- Time: < 1 min
- Next: /continue, /dependencies

**review:**
- Prerequisites: feature passes=true (ที่ทำโดย sonnet/glm/minimax)
- Output: opus critique + auto-fix critical/high issues
- Time: 5-15 min
- Next: /continue (next), /qa-create-scenario

**add-feature:** ⭐ v2.4.0
- Prerequisites: feature_list.json
- Optional: design_doc_list.json (เพื่อใช้ impact check)
- Output: เพิ่ม feature ใน feature_list.json + (optional) pending_updates[]
- Special: ⭐ ตรวจ design doc impact + ถาม user ถ้ากระทบ
- Time: 2-5 min (รวม impact check)
- Next: /continue, /sync-with-features (ถ้ามี pending)

**edit-feature:** ⭐ v2.4.0
- Prerequisites: feature ที่ passes=true ใน feature_list.json
- Optional: design_doc_list.json
- Output: feature ใหม่ที่ supersedes ของเก่า + inherit design_doc_refs
- Special: ⭐ ตรวจ impact + inherit linkage + ถาม user
- Time: 3-5 min
- Next: /continue (ทำ feature ใหม่), /sync-with-features

**generate-features-from-design:**
- Prerequisites: design_doc_list.json (จาก /system-design-doc)
- Output: features สร้าง auto จาก design (ครอบคลุม layers)
- Time: 5-10 min
- Next: /validate-coverage, /continue

**generate-features-from-mockups:**
- Prerequisites: .mockups/mockup_list.json (จาก /ui-mockup)
- Output: features per mockup page
- Time: 5-10 min
- Next: /sync-mockups, /continue

**dependencies:**
- Prerequisites: feature_list.json (มี features.dependencies[])
- Output: Mermaid graph + critical path + blocked features
- Time: 1-2 min
- Next: /continue (เริ่มจาก critical path)

**sync-mockups:**
- Prerequisites: feature_list.json + mockup_list.json
- Output: validate references + report orphan/missing
- Time: 1-2 min
- Next: /add-feature (สำหรับ orphan), /edit-section (sync mockup)

**validate-coverage:**
- Prerequisites: feature_list.json + (mockup_list.json หรือ design_doc_list.json)
- Output: coverage report (mockup/design/criteria)
- Time: 2-3 min
- Next: /add-feature (เพิ่ม coverage gap)

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
   /init                          — Setup project ใหม่
   /status                         — ดูสถานะปัจจุบัน
   /help --quick                   — Quick start guide
   /help --integration             — เชื่อม plugins อื่น
   /help --new                     — ดูที่เพิ่มใน v2.4.0
```

> 💬 **หมายเหตุ:** คำสั่งนี้ตอบเป็นภาษาไทย (ศัพท์เทคนิคใช้ภาษาอังกฤษ)
