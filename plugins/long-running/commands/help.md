---
description: อธิบายวิธีใช้งาน long-running plugin — แสดงคำสั่งทั้งหมด, workflow, integration กับ plugins อื่น
allowed-tools: Read(*), Bash(*)
---

# Long-Running Help — คู่มือการใช้งาน

คุณคือ **Long-Running Help Guide** — ผู้ช่วยอธิบายวิธีใช้งาน long-running plugin (v2.6.0+)

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
/help --qa                     # ⭐ qa-ui-test release gates (NFR + AC + bug verify) — v2.6.0
/help --gates                  # ⭐ /continue Step 5.6 gate enforcement details
/help --new                    # What's new in v2.6.0
```

---

## ขั้นตอนที่ต้องทำ

### Mode 1: ไม่มี argument → แสดงทั้งหมด

```
📖 Long-Running — คู่มือการใช้งาน v2.7.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Harness สำหรับ AI Agent ทำงานข้าม context windows
Multi-session continuity, feature tracking, design doc integration,
verification pipeline, model assignment
⭐ v2.6.0: qa-ui-test release gates (Gate 1 AC + Gate 2 NFR + Gate 3 Bug verify)
⭐ v2.7.0: /scan-changes — upstream traceability enforcer (orphan detection)

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

📋 FEATURE MANAGEMENT (3 commands) ⭐ v2.7.0 +scan-changes

  /add-feature                 เพิ่ม feature ใหม่ + design doc impact check
                               ตัวอย่าง: /add-feature เพิ่ม login page
                               ตัวอย่าง: /add-feature POST /api/users

  /edit-feature                แก้ feature ที่ผ่านแล้ว (สร้าง feature ใหม่อ้างอิง)
                               ตัวอย่าง: /edit-feature 5 - add OAuth
                               ตัวอย่าง: /edit-feature 7 - add pagination

  /scan-changes ⭐ NEW          สแกน orphan code changes/commits → suggest action
                               ตัวอย่าง: /scan-changes
                               ตัวอย่าง: /scan-changes --uncommitted-only
                               ตัวอย่าง: /scan-changes --since=HEAD~10
                               ตัวอย่าง: /scan-changes --feature 5

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

🧪 QA RELEASE GATES (2 commands) ⭐ v2.6.0 — qa-ui-test integration

  /nfr-check                   Read qa-tracker.nfr_results → feature.nfr_compliance
                               Flag features ที่ blocks_release && score < required
                               ตัวอย่าง: /nfr-check
                               ตัวอย่าง: /nfr-check --module CHECKOUT
                               ตัวอย่าง: /nfr-check --feature 5
                               ตัวอย่าง: /nfr-check --strict

  /qa-coverage-check           Read qa-tracker.traceability → feature.qa_trace_coverage
                               Classify ACs as covered/gap/fail/pending
                               ตัวอย่าง: /qa-coverage-check
                               ตัวอย่าง: /qa-coverage-check --gaps-only
                               ตัวอย่าง: /qa-coverage-check --feature 7
                               ⚠ ต้องรัน /qa-ui-test:qa-trace ก่อน

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 แนะนำจุดเริ่มต้น

  เพิ่งเริ่มใหม่?         → /help --quick      (Quick Start 3 ขั้นตอน)
  อยากเชื่อม design doc? → /help --integration
  ⭐ qa-ui-test gates?    → /help --qa         (v2.6.0)
  ⭐ /continue gate detail?→ /help --gates     (Step 5.6 deep-dive)
  ⭐ traceability gap?    → /help scan-changes (v2.7.0 — ใหม่)
  ดูคำสั่งเฉพาะ?           → /help [command]   เช่น /help add-feature
  อยากรู้ว่ามีอะไรใหม่?    → /help --new       (v2.7.0 changes)

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

🔎 When code changes outside workflow (v2.7.0):
   /scan-changes                      # ⭐ ตรวจ orphan changes/commits
   /scan-changes --uncommitted-only   # ก่อน /continue ใหม่
   /scan-changes --since=HEAD~10      # หลัง git pull / hot-fix
   → suggests /add-feature, /edit-feature, /edit-section ตามผล

🎯 Before release:
   /validate-coverage                 # ครอบคลุมหมดไหม?
   /dependencies                      # มี blocker ไหม?
   /sync-mockups                      # mockup ตรง feature?
   /nfr-check                         # ⭐ NFR compliance check
   /qa-coverage-check                 # ⭐ AC coverage check
   /status                            # ดู release-blocked features

🧪 QA-aware development (v2.6.0):
   /qa-ui-test:qa-create-scenario     # สร้าง scenarios ก่อน
   /qa-ui-test:qa-run                 # รัน tests
   /qa-ui-test:qa-trace               # build traceability
   /qa-ui-test:qa-nfr-assess          # NFR scoring
   /qa-coverage-check                 # pull AC coverage → feature_list
   /nfr-check                         # pull NFR → feature_list
   /continue                          # ⭐ Step 5.6 enforce 3 gates ก่อน passes=true

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 ดูเพิ่ม
   /help --quick           Quick Start 3 ขั้นตอน
   /help --workflow        Full workflow walkthrough
   /help --integration     Integration กับ plugins อื่น
   /help --qa              ⭐ qa-ui-test integration (v2.6.0)
   /help --gates           ⭐ /continue Step 5.6 gate details
   /help --new             v2.6.0 changes
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

   3. qa-ui-test ↔ long-running ⭐ v2.6.0
      ──────────────────────────────────
      Two-way data flow:

      qa-ui-test → long-running:
      • /qa-bug-export                  → bug → feature ใหม่ (epic="bug-fix")
      • /qa-bug-export-subtask          → bug → subtask ใน feature เดิม
      • /qa-bug-verify --auto-sync      → ปิด feature เมื่อ verify ผ่าน

      qa-tracker.json → feature_list.json (read-only via 2 commands):
      • /nfr-check                      → qa-tracker.nfr_results
                                           → feature.nfr_compliance
      • /qa-coverage-check              → qa-tracker.traceability
                                           → feature.qa_trace_coverage

      /continue (Step 5.6) → reads bugs[].status:
      • bug.status == "verified" → mark "Verify BUG-XXX" subtask done
      • else → BLOCK passes=true (override: --force-bug-verify)

      Schema additions (v2.4):
      feature.epic = "bug-fix"
      feature.linked_bug = {
        qa_bug_id: "BUG-001",
        scenario_risk: { priority, score, factors[], scenario_assigned_model },
        linked_scenario: "TS-MODULE-NNN"
      }
      feature.acceptance_criteria_id = ["AC-001", "AC-002"]
      feature.complexity_tags = ["state-machine", "cascade-deep"]
      feature.nfr_compliance = {
        performance: { score, required: 85, blocks_release: false },
        security:    { score, required: 75, blocks_release: TRUE },
        reliability: { score, required: 85, blocks_release: false },
        maintainability: { score, required: 70, blocks_release: false }
      }
      feature.qa_trace_coverage = {
        covered_acs: [...], gap_acs: [...], fail_acs: [...],
        pending_acs: [...], last_checked_at
      }

      ⭐ ID propagation = ONE-WAY (qa-ui-test → long-running)
        BUG IDs from qa-ui-test, AC IDs from system-design-doc
        long-running mirrors only — never creates these IDs

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
   5. /continue Step 5.6 Gate 3 → "Verify BUG-XXX" done=true ✅

   QA-aware development flow ⭐ v2.6.0:
   ─────────────────────────────────────
   1. /qa-ui-test:qa-create-scenario  → seed scenarios with AC IDs
   2. /qa-ui-test:qa-run              → execute tests
   3. /qa-ui-test:qa-trace            → build traceability matrix
   4. /qa-ui-test:qa-nfr-assess       → score NFR
   5. /qa-coverage-check              → pull AC coverage
   6. /nfr-check                      → pull NFR compliance
   7. /continue (Step 5.6 enforces 3 gates) → mark passes=true only when all green


💡 Setup Requirements:
  • system-design-doc plugin installed (recommended for AC IDs)
  • ui-mockup plugin installed (optional)
  • qa-ui-test plugin installed (recommended ⭐ v2.6.0 for release gates)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔜 ดูเพิ่ม:
   /help add-feature       → design doc impact check details
   /help edit-feature      → inherit + impact check details
   /help --qa              → qa-ui-test integration deep-dive ⭐
   /help --gates           → Step 5.6 enforcement details
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

/scan-changes [flags]            ⭐ v2.7.0: สแกน orphan changes
                                  → suggest /add-feature, /edit-feature
                                  Flags: --uncommitted-only, --since=,
                                         --feature, --report-only

/continue [id?]                   หยิบ feature → implement
/review [id?]                     opus review งานที่ผ่าน
/status                           ดู progress + workload

/dependencies                     graph + critical path
/validate-coverage                ครอบคลุม mockup/design ไหม? (top-down)

🔜 ดูตัวอย่าง:
   /help add-feature
   /help edit-feature
   /help scan-changes
```

---

### Mode 7: `--qa` → QA Integration (v2.6.0) ⭐

```
🧪 qa-ui-test Integration — long-running v2.6.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 long-running consumes qa-tracker.json (read-only) เป็น release-gate enforcer
   feature.passes=true ต้องผ่าน 3 gates ก่อน


📊 Data Flow

  qa-tracker.json (qa-ui-test) ──read-only──▶ feature_list.json (long-running)
  source of truth                              consumer + gate enforcer

  Inputs from qa-tracker:
   ├── nfr_results       → /nfr-check         → feature.nfr_compliance
   ├── traceability      → /qa-coverage-check → feature.qa_trace_coverage
   └── bugs[].status     → /continue Gate 3   → bug-fix subtask done


🔒 3 Release Gates (enforced ใน /continue Step 5.6)

  Gate 1 — AC Coverage:
    qa_trace_coverage.gap_acs == [] AND
    qa_trace_coverage.fail_acs == []

  Gate 2 — NFR Compliance:
    For each type in {performance, security, reliability, maintainability}:
      IF blocks_release && score < required → FAIL
    Default: security blocks (≥75); others advisory

  Gate 3 — Bug Verification:
    For each subtask "Verify BUG-XXX":
      Check qa-tracker.bugs[BUG-XXX].status == "verified"


🆕 New Commands (v2.6.0)

  /nfr-check
  ──────────
  Read qa-tracker.nfr_results → feature.nfr_compliance

  Default thresholds:
    performance     = 85  (advisory)
    security        = 75  ⚠ BLOCKS RELEASE
    reliability     = 85  (advisory)
    maintainability = 70  (advisory)

  Override per-feature: edit feature.nfr_compliance.<type>.required / blocks_release
  Override globally: --strict (ทำให้ทุก type blocks_release=true)
  Override threshold: --threshold security=80

  Flags:
    /nfr-check                       # all features
    /nfr-check --module CHECKOUT     # module-scoped
    /nfr-check --feature 5           # single feature
    /nfr-check --report-only         # show report ไม่เขียน

  Critical failures (security floor):
    AWS keys ใน DOM, plain-text password, DB conn string
    → ALL gates BLOCKED จนกว่าจะ remediate


  /qa-coverage-check
  ──────────────────
  Read qa-tracker.traceability → feature.qa_trace_coverage

  Per-AC classification:
    PASS    — linked scenarios + all passed
    FAIL    — linked scenarios but failed (release blocker)
    GAP     — zero linked scenarios (release blocker)
    PENDING — linked but not run yet (CONCERNS, warning only)

  Flags:
    /qa-coverage-check                       # all features with ACs
    /qa-coverage-check --feature 5           # single
    /qa-coverage-check --gaps-only           # only blockers
    /qa-coverage-check --strict-orphans      # fail if any feature lacks ACs


🔧 Schema additions (feature_list.json 2.3.0 → 2.4.0)

  features[].acceptance_criteria_id[]   # AC-NNN refs to design-doc
  features[].complexity_tags[]          # qa's 8 factors
  features[].linked_bug{}               # for bug-fix features
  features[].nfr_compliance{}           # per-type score/required/blocks
  features[].qa_trace_coverage{}        # covered/gap/fail/pending ACs

  integration.qa_tracker_path
  integration.last_nfr_check
  integration.last_qa_coverage_check

  sync_status.qa_tracker {
    total_features_with_acs,
    features_with_gap_acs,
    features_failing_nfr,
    release_blocked_features
  }


🔄 Bug-fix workflow (qa-ui-test → long-running → qa-ui-test)

  qa-bug-list                       (qa-ui-test)
       ↓
  qa-bug-export                     (qa-ui-test creates bug-fix feature)
       ↓
  feature.linked_bug = {            (auto-populated frozen snapshot)
    qa_bug_id: "BUG-001",
    scenario_risk: { priority: "P0", factors: [...] },
    linked_scenario: "TS-XXX-001"
  }
       ↓
  /continue                          (long-running implements fix)
       ↓
  qa-bug-verify                      (qa-ui-test re-runs scenario)
       ↓
  bug.status == "verified"
       ↓
  /continue Step 5.6 Gate 3 PASS    (subtask "Verify BUG-001" → done=true)
       ↓
  feature.passes = true              ✅


🔙 Backward compat

  Features without acceptance_criteria_id[]  → skip Gate 1
  Features without nfr_compliance            → skip Gate 2
  Features not epic="bug-fix"                → skip Gate 3
  pre-v2.4 feature_list.json                 → /continue uses old behavior
                                                (Verification Pipeline only)


🚪 Override flags (logged in audit trail)

  /continue --force-coverage    # bypass Gate 1 (AC)
  /continue --force-nfr         # bypass Gate 2 (NFR)
  /continue --force-bug-verify  # bypass Gate 3 (Bug)
  /continue --force-all         # bypass all 3

  Override logged ใน feature.notes พร้อม timestamp + reason

  When acceptable:
   ✅ Pre-launch + stakeholder sign-off (defer ACs to next sprint)
   ✅ Production hotfix (verify มาทีหลัง)

  When NOT acceptable:
   ❌ ทำให้ CI green เฉยๆ
   ❌ "ไว้ทำทีหลัง" โดยไม่มีแผน

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔜 ดูเพิ่ม:
   /help --gates                  → Step 5.6 deep-dive
   /help nfr-check                → command details
   /help qa-coverage-check        → command details
   /qa-help --integration         → qa-ui-test side
```

---

### Mode 7.5: `--gates` → /continue Step 5.6 Deep-Dive ⭐

```
🚪 /continue Step 5.6 — QA + NFR Release Gates
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Step 5.6 รันหลัง Step 5.5 (Verification Pipeline)
   ก่อน Step 6 (Mark as Passed)

   Order:
     5.0 — Implement
     5.5 — Verification Pipeline (build, design-doc, CRUD, etc.)
     5.6 — ⭐ QA + NFR Gates (NEW v2.6.0)
     6.0 — Mark passes=true (only if 5.5 + 5.6 ALL GREEN)


🔍 Pre-conditions ก่อนเข้า Step 5.6

  Step 5.6 รันต่อเมื่อ:
   • feature.acceptance_criteria_id[] non-empty (มี AC links)
     OR
   • qa-tracker.json มีอยู่ (มี NFR / bugs ให้ตรวจ)

  ถ้าไม่ตรงเงื่อนไข → skip step (backward compat)


🔄 Refresh data ก่อนตัดสิน

  /qa-coverage-check --feature <ID> --report-only
  /nfr-check --feature <ID> --report-only

  → ดึงข้อมูลล่าสุดจาก qa-tracker (ไม่เขียน feature_list)


✅ Gate 1 — AC Coverage

  Read feature.qa_trace_coverage:
   PASS  if  gap_acs == [] AND fail_acs == []
   FAIL  if  gap_acs non-empty   → BLOCK
   FAIL  if  fail_acs non-empty  → BLOCK
   WARN  if  pending_acs non-empty (CONCERNS gate) → ALLOW + warn


✅ Gate 2 — NFR Compliance

  Read feature.nfr_compliance:
   For each type in {performance, security, reliability, maintainability}:
     IF blocks_release == true AND score < required:
       → BLOCK


✅ Gate 3 — Bug Verification (epic="bug-fix" only)

  For each subtask labeled "Verify BUG-XXX":
   Read qa-tracker.bugs[BUG-XXX].status:
     "verified"           → mark subtask done=true
     "new"/"triaged"/...  → BLOCK subtask done=true
     "closed"/"wont_fix"  → mark done=true (closed without verify)


❌ ถ้า gate FAIL (ไม่ใช้ --force)

  feature ถูก mark เป็น "blocked" (ไม่ใช่ "passed"):
    {
      "status": "blocked",
      "blocked_reason": "qa_trace_coverage.gap_acs=[AC-007] — run /qa-create-scenario",
      "passes": false,
      "qa_trace_coverage": { "gap_acs": ["AC-007"], ... }
    }

  → สร้าง follow-up subtask แก้ gap
  → update progress.md ระบุ gate ที่ block


🚪 Override flags

  --force-coverage      bypass Gate 1
  --force-nfr           bypass Gate 2
  --force-bug-verify    bypass Gate 3
  --force-all           bypass ทั้ง 3 gates

  ⚠ Override จะถูก log ใน feature.notes พร้อม timestamp + reason


🛑 Output Rejection (ถ้า mark passes=true ผิด)

  REJECT ถ้า:
   • qa_trace_coverage.gap_acs non-empty (ไม่ใช้ --force-coverage)
   • qa_trace_coverage.fail_acs non-empty (ไม่ใช้ --force-coverage)
   • nfr_compliance.[*].blocks_release && score < required (ไม่ใช้ --force-nfr)
   • bug-fix subtask "Verify BUG-XXX" done=true while bug.status != "verified"
     (ไม่ใช้ --force-bug-verify)


💡 ตัวอย่างการใช้งาน

  Normal flow:
    /qa-coverage-check --feature 5
    /nfr-check --feature 5
    /continue 5
    → Step 5.5 GREEN → Step 5.6 GREEN → mark passes=true ✅

  Gap detected:
    /qa-coverage-check --feature 7
    → AC-007, AC-008 GAP
    /continue 7
    → Step 5.6 Gate 1 FAIL → feature blocked
    /qa-ui-test:qa-create-scenario --module AUTH
    → create scenarios → /qa-run → /qa-trace → /qa-coverage-check
    /continue 7
    → Gate 1 PASS → mark passes=true ✅

  Override (production hotfix):
    /continue 12 --force-bug-verify
    → mark passes=true (Gate 3 bypassed)
    → feature.notes: "[OVERRIDE] --force-bug-verify @ 2026-05-05T10:00 reason: production hotfix, verify deferred"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔜 ดูเพิ่ม:
   /help --qa                   → integration overview
   /help continue               → /continue command details
```

---

### Mode 8: `--new` → What's new in v2.7.0

```
✨ What's new in v2.7.0 (2026-05-10)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⭐ /scan-changes — Upstream traceability enforcer

Long-running v2.6.0 มี enforcement ทาง downstream แล้ว (Verification Pipeline + 3 Release Gates)
แต่ขาด upstream check — ถ้า user แก้ code นอก /continue (manual edit, hot-fix, UI tweak)
feature_list.json จะ out-of-sync กับ codebase

/scan-changes ปิด gap นี้:
  • สแกน git status (uncommitted) + git log (orphan commits ไม่มี marker prefix)
  • Reverse-map ไฟล์ที่เปลี่ยน → feature เดิม (ผ่าน subtasks[].files[])
  • ตรวจ feature.design_doc_refs.pending_updates[]
  • Classify ทุก change → suggest action (/add-feature, /edit-feature, /edit-section)
  • คำนวณ traceability score (% ของ changes ที่ tracked)

🔎 Use cases:
  ก่อน start session ใหม่             — ตรวจว่า last session ทิ้ง orphan ไหม
  หลัง git pull จาก teammate          — ดูว่ามี changes ที่ยังไม่ map
  ก่อน /review                         — verify traceability ก่อน review
  ก่อน release / merge to main         — ตรวจ release blocker
  Hot-fix retroactive map              — link production fix กับ feature

🔄 Complement กับ /validate-coverage:
  /validate-coverage = top-down  (mockup/design ถูก feature ครอบคลุมไหม?)
  /scan-changes      = bottom-up (code change ผูกกับ feature ไหม?)

📌 ตอบคำถาม "แก้ UI ใช้ command อะไร?":
  1. แก้ code ตรงๆ (เร็ว)
  2. รัน /scan-changes
  3. มันจะ map ให้ + suggest /edit-feature หรือ /add-feature
  4. รันตาม suggestion → traceability ครบ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📜 Previous: v2.6.0 (2026-05-05)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⭐ qa-ui-test v2.5 Release Gates

long-running consume qa-tracker.json เป็น release-gate enforcer
feature.passes=true ต้องผ่าน 3 gates ก่อน (Step 5.6 ใน /continue)


🆕 New Commands

  /nfr-check                Read qa-tracker.nfr_results → feature.nfr_compliance
                            Default thresholds: perf 85, security 75 [BLOCKS],
                                                reliability 85, maint 70

  /qa-coverage-check        Read qa-tracker.traceability → feature.qa_trace_coverage
                            Classify ACs: PASS/CONCERNS/FAIL/GAP


🔄 /continue (Step 5.6 — NEW)

  Insert ระหว่าง Step 5.5 (Verification Pipeline) และ Step 6 (Mark Passed)

  Gate 1 — AC Coverage:    gap_acs == [] AND fail_acs == []
  Gate 2 — NFR Compliance: blocks_release types ทุกตัว score >= required
  Gate 3 — Bug Verify:     bug-fix subtask done only when bug verified


🚪 Override flags (logged in audit trail)

  --force-coverage / --force-nfr / --force-bug-verify / --force-all
  Logged ใน feature.notes พร้อม reason


🔧 Schema additions (feature_list.json 2.3.0 → 2.4.0)

  features[].acceptance_criteria_id[]   # AC-NNN refs to design-doc
  features[].complexity_tags[]          # qa's 8 factors
  features[].linked_bug{}               # frozen snapshot for bug-fix features
  features[].nfr_compliance{}           # per-type compliance
  features[].qa_trace_coverage{}        # covered/gap/fail/pending


🔙 Backward compat

  Features without new fields skip the corresponding gate
  Pre-v2.4 feature_list.json → /continue uses old behavior (Pipeline only)
  ไม่ต้อง /migrate — fields เป็น optional


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📜 Previous version (v2.4.0 design doc impact check)

⭐ Design Doc Impact Check (proactive sync)

/add-feature และ /edit-feature ตรวจ design_doc_list.json ก่อนสร้าง feature

  flow:
    user รัน /add-feature
       ▼
    Step 4: ตรวจหา design_doc_list.json
       ▼
    ถ้ามี → วิเคราะห์ impact: API/Entity/Diagram
       ▼
    ถ้าพบ impact → ถาม 3 ทาง:
       [1] อัปเดต design doc ก่อน
       [2] Skip + บันทึก pending_updates[]
       [3] ยกเลิก

Schema additions:
   feature.design_doc_refs = { api_ref, entity_ref, diagram_refs, pending_updates }


📚 ดูเพิ่ม:
   /help --qa                   → qa-ui-test integration deep-dive
   /help --gates                → Step 5.6 enforcement details
   /help --integration          → cross-plugin overview
   /help scan-changes           → ⭐ v2.7.0 detail
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
- Output: implement → Step 5.5 Verification Pipeline → ⭐ Step 5.6 QA+NFR Gates → mark passes=true
- Special: ⭐ v2.6.0 Step 5.6 enforces 3 gates (AC coverage, NFR, bug verify)
- Override flags: --force-coverage / --force-nfr / --force-bug-verify / --force-all
- Time: 10-60 min ต่อ feature (ขึ้นกับ complexity)
- Next: /continue (next), /review, /qa-create-scenario, /qa-coverage-check

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

**scan-changes:** ⭐ v2.7.0
- Prerequisites: feature_list.json + git repo
- Output: รายงาน 4 หมวด (Tracked/Mapped/Orphan/Pending design) + suggested commands
- Special: ⭐ Bottom-up traceability scan — ตรวจว่า code change ทุกอันผูกกับ feature ไหม
- Flags: --uncommitted-only / --since=<ref> / --feature <id> / --report-only / --auto-suggest
- Time: 1-3 min
- Next: รัน suggested /add-feature, /edit-feature, /edit-section ตามผล
- Use cases: ก่อน start session, หลัง git pull, ก่อน /review, ก่อน release, hot-fix retroactive map

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

**nfr-check:** ⭐ v2.6.0
- Prerequisites: feature_list.json (schema ≥ 2.4.0) + qa-tracker.json (schema ≥ 1.7.0, nfr_results not null)
- Output: update features[].nfr_compliance + integration.last_nfr_check + sync_status.qa_tracker
- Special: ⭐ Read-only on qa-tracker; default thresholds (perf 85, security 75 [BLOCKS], reliability 85, maint 70)
- Flags: --module / --feature / --strict / --report-only / --threshold X=N
- Time: 1-3 min
- Next: /continue (Gate 2 will use these results), fix security issues if blocked

**qa-coverage-check:** ⭐ v2.6.0
- Prerequisites: feature_list.json (schema ≥ 2.4.0) + qa-tracker.json with traceability not null
- Output: update features[].qa_trace_coverage + integration.last_qa_coverage_check + sync_status.qa_tracker
- Special: ⭐ Read-only on qa-tracker; classifies ACs as PASS/CONCERNS/FAIL/GAP
- Flags: --module / --feature / --gaps-only / --report-only / --strict-orphans
- Time: 1-3 min
- Next: /continue (Gate 1 will use these results), /qa-create-scenario for GAP ACs

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
   /help --qa                      — ⭐ qa-ui-test release gates (v2.6.0)
   /help --gates                   — ⭐ Step 5.6 deep-dive
   /help --new                     — ดูที่เพิ่มใน v2.6.0
```

> 💬 **หมายเหตุ:** คำสั่งนี้ตอบเป็นภาษาไทย (ศัพท์เทคนิคใช้ภาษาอังกฤษ)
