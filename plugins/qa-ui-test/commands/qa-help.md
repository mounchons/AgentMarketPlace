---
description: อธิบายวิธีใช้งาน qa-ui-test plugin — แสดงคำสั่งทั้งหมด, workflow แนะนำ, ตัวอย่าง พร้อม bug management workflow
allowed-tools: Read(*)
---

# QA Help — อธิบายวิธีใช้งาน qa-ui-test

คุณคือ **QA Help Guide** — ผู้ช่วยอธิบายวิธีใช้งาน qa-ui-test plugin (**v2.7.0**) ครอบคลุม:
- Test workflow (สร้าง scenario, รัน, retest)
- Bug management (triage, export, verify) — v2.2
- **Risk-based priority + 3-tier model assignment (P0-P3 + opus/sonnet/haiku)** — v2.3
- **NFR Assessment** (performance/security/reliability/maintainability) — v2.4
- **Traceability** (AC ↔ scenarios) + **Numeric Review Score 0-100** — v2.5
- **Manifest-driven generation** (`--from-control-spec` for UI Control Manifest from long-running) — ⭐ **v2.6**
- **Troubleshoot mode** — ถ้าติดอะไร เรียก command ไหนต่อ

## CRITICAL RULES

1. **Read-only** — คำสั่งนี้ไม่แก้ไขไฟล์ใดๆ
2. **ตอบตาม argument** — ไม่มี argument = แสดงทั้งหมด, มี argument = แสดงเฉพาะคำสั่ง/หัวข้อนั้น
3. **ตัวอย่างชัดเจน** — ทุกคำสั่งต้องมีตัวอย่างพร้อมระบุว่าต้องรันเว็บหรือไม่
4. **Workflow ครบวงจร** — แสดงทั้ง test และ bug management workflow

### Self-Check Checklist (MANDATORY)

- [ ] ตรวจ argument ว่ามีหรือไม่?
- [ ] แสดงข้อมูลถูกต้องตาม argument?
- [ ] มีตัวอย่างทุกคำสั่ง?
- [ ] ระบุว่า command ใดต้องรันเว็บ?
- [ ] มี workflow recommendation?

### Output Rejection Criteria

- ข้อมูลไม่ถูกต้อง / ไม่ตรงกับ command จริง → REJECT
- ไม่มีตัวอย่าง → REJECT
- ไม่ระบุ "ต้องรันเว็บ" สำหรับ command ที่ต้องรัน → REJECT

---

## Input ที่ได้รับ

```
/qa-help                          # แสดงทั้งหมด
/qa-help [command-name]           # คำสั่งเฉพาะ เช่น /qa-help bug-export
/qa-help --bugs                   # bug management workflow
/qa-help --workflow               # workflow แนะนำ (E2E)
/qa-help --integration            # integration กับ long-running
/qa-help --quick                  # quick start (3 ขั้นตอน)
/qa-help --playwright             # Playwright CLI cheat sheet (debug, --ui, list tests)

# v2.3-2.5 modes:
/qa-help --troubleshoot           # ⭐ ถ้าติดอะไร → คำสั่งต่อไหน (decision tree)
/qa-help --risk                   # Risk-based priority + complexity factors + model assignment
/qa-help --nfr                    # NFR assessment (4 categories + gate)
/qa-help --trace                  # Traceability matrix (AC ↔ scenarios)
/qa-help --review                 # Numeric review score 0-100 (4 dimensions)

# v2.6 modes:
/qa-help --control-spec           # ⭐ v2.6 --from-control-spec mode (UI Control Manifest)
$ARGUMENTS
```

---

## ขั้นตอนที่ต้องทำ

### Mode 1: ไม่มี argument → แสดงทั้งหมด

```
📖 QA UI Test — คู่มือการใช้งาน v2.7.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AI-powered QA UI Testing + Bug Management + NFR + Traceability + Manifest-driven

   v2.0 Foundation:    Auto-scan, multi-agent brainstorm, role-based, cascade
   v2.2 Bug Mgmt:      Triage → Export → Verify (link long-running)
   v2.3 Risk-based:    P0-P3 priority + 8 complexity factors + 3-tier model
                       (opus / sonnet / haiku)
   v2.4 NFR Assess:    Performance / Security / Reliability / Maintainability
                       Each 0-100 + Gate (PASS/CONCERNS/FAIL)
   v2.5 Trace+Review:  Traceability matrix (AC↔tests) + Numeric review 0-100
   v2.6 Control Spec:  ⭐ /qa-create-scenario --from-control-spec
                          gen 5 mandatory categories per control
                          (render-binding, api-binding, permission,
                           validation, cascade-loading-error)
                       Reads .agent/ui-controls/feature-N.json from long-running
                       qa-tracker.scenarios gain control_refs[] + control_test_category

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧪 TEST WORKFLOW (7 commands)

  /qa-create-scenario          สร้าง test scenarios จาก codebase (รันซ้ำได้ ⭐)
  🌐 ไม่ต้องรันเว็บ              ตัวอย่าง: /qa-create-scenario --auto
                               ตัวอย่าง: /qa-create-scenario --auto --brainstorm-agents
                               ตัวอย่าง: /qa-create-scenario --auto --pass-mode opus-deep
                               ตัวอย่าง: /qa-create-scenario --auto --modules PRODUCT,ORDER
                               ตัวอย่าง: /qa-create-scenario --auto --dry-run
                               ตัวอย่าง: /qa-create-scenario --from-control-spec 7  ⭐ v2.6
                               💡 v2.6 Mode C: อ่าน manifest จาก long-running →
                                  gen 5 หมวด/control (render-binding, api-binding,
                                  permission, validation, cascade-loading-error)

  /qa-continue                 เลือก module → สร้าง scripts → รัน test
  🌐 ต้องรันเว็บ                 ตัวอย่าง: /qa-continue
                               ตัวอย่าง: /qa-continue --module PRODUCT
                               ตัวอย่าง: /qa-continue --cascade CATEGORY

  /qa-run                      รัน Playwright tests (+ risk filters v2.3)
  🌐 ต้องรันเว็บ                 ตัวอย่าง: /qa-run TS-LOGIN-001
                               ตัวอย่าง: /qa-run --module LOGIN
                               ตัวอย่าง: /qa-run --priority P0 ⭐ (smoke release)
                               ตัวอย่าง: /qa-run --model opus
                               ตัวอย่าง: /qa-run --factor state-machine
                               ตัวอย่าง: /qa-run --parallel

  /qa-retest                   รี-รัน failed + comparison + numeric review (v2.5)
  🌐 ต้องรันเว็บ                 ตัวอย่าง: /qa-retest
                               ตัวอย่าง: /qa-retest --review ⭐ score 0-100, 4 dimensions
                               ตัวอย่าง: /qa-retest --priority P0
                               ตัวอย่าง: /qa-retest --factor cascade-deep

  /qa-edit-scenario            แก้ไข + auto-recompute risk/factors/model (v2.3)
  🌐 ไม่ต้องรันเว็บ              ตัวอย่าง: /qa-edit-scenario TS-PRODUCT-002 "เพิ่ม discount"
                               ตัวอย่าง: /qa-edit-scenario --from-control-spec 7  ⭐ v2.6
                               ⭐ Auto: ถ้า logic เปลี่ยน → recompute risk score + factors
                                   + assigned_model + แสดง diff before/after
                               ⭐ v2.6 Mode B: detect manifest delta →
                                   add new / update endpoint / deprecate scenarios

  /qa-status                   ภาพรวม + bug summary + risk filter (v2.3)
  🌐 ไม่ต้องรันเว็บ              ตัวอย่าง: /qa-status
                               ตัวอย่าง: /qa-status --priority P0 ⭐ release-blocker view
                               ตัวอย่าง: /qa-status --model opus
                               ตัวอย่าง: /qa-status --factor security-flow
                               ตัวอย่าง: /qa-status --bugs
                               ตัวอย่าง: /qa-status --module ORDER

  /qa-explain                  Mermaid flowchart + 4 coverage tables (v2.3)
  🌐 ไม่ต้องรันเว็บ              ตัวอย่าง: /qa-explain
                               ตัวอย่าง: /qa-explain --module CHECKOUT --save
                               ⭐ Color-coded by P0(🔴)/P1(🟠)/P2(🟡)/P3(🟢)
                                   + risk distribution + factor coverage tables

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🐛 BUG MANAGEMENT (5 commands — NEW v2.2)

  /qa-bug-triage               แปลง failed → bug entries
  🌐 ไม่ต้องรันเว็บ              (auto-classify type/severity, root cause hint)
                               ตัวอย่าง: /qa-bug-triage
                               ตัวอย่าง: /qa-bug-triage --module PRODUCT
                               ตัวอย่าง: /qa-bug-triage --auto-export

  /qa-bug-list                 ดูรายการ bugs พร้อม filter
  🌐 ไม่ต้องรันเว็บ              ตัวอย่าง: /qa-bug-list
                               ตัวอย่าง: /qa-bug-list --severity critical,high
                               ตัวอย่าง: /qa-bug-list BUG-001 (full detail)
                               ตัวอย่าง: /qa-bug-list --aging 7

  /qa-bug-export               Bug → feature ใหม่ใน long-running
  🌐 ไม่ต้องรันเว็บ              (epic="bug-fix", subtasks ครบ, รัน /continue ได้เลย)
                               ตัวอย่าง: /qa-bug-export BUG-001
                               ตัวอย่าง: /qa-bug-export --severity critical
                               ตัวอย่าง: /qa-bug-export --not-exported

  /qa-bug-export-subtask       Bug → subtask ของ feature เดิม
  🌐 ไม่ต้องรันเว็บ              (agent ค้น feature ที่ตรงให้เอง — ไม่ต้องระบุ id)
                               ตัวอย่าง: /qa-bug-export-subtask BUG-001
                               ตัวอย่าง: /qa-bug-export-subtask --module PRODUCT

  /qa-bug-verify               ยืนยัน fix + sync long-running ปิด bug
  🌐 ต้องรันเว็บ                 ตัวอย่าง: /qa-bug-verify BUG-001
                               ตัวอย่าง: /qa-bug-verify --auto-sync
                               ตัวอย่าง: /qa-bug-verify --regression
                               ตัวอย่าง: /qa-bug-verify --priority P0 ⭐ (release smoke)
                               ตัวอย่าง: /qa-bug-verify --release-blockers

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 NFR ASSESSMENT (1 command — NEW v2.4)

  /qa-nfr-assess               ประเมิน 4 มิติ (perf/security/reliability/maint.)
  🌐 ไม่ต้องรันเว็บ (light)       ตัวอย่าง: /qa-nfr-assess
  🌐 ต้องรันเว็บ (--deep)        ตัวอย่าง: /qa-nfr-assess --deep ⭐ + Lighthouse
                               ตัวอย่าง: /qa-nfr-assess --module CHECKOUT
                               ตัวอย่าง: /qa-nfr-assess --category security
                               ตัวอย่าง: /qa-nfr-assess --gate-only ⭐ CI integration
                               ⭐ Output: score 0-100 + gate (PASS/CONCERNS/FAIL)
                                   + recommendations actionable
                               ⚠️ Security < 75 → overall FAIL (hard floor)

🔗 TRACEABILITY (1 command — NEW v2.5)

  /qa-trace                    Matrix: Acceptance Criteria ↔ Test scenarios
  🌐 ไม่ต้องรันเว็บ              ตัวอย่าง: /qa-trace
                               ตัวอย่าง: /qa-trace --gaps-only ⭐ release blockers
                               ตัวอย่าง: /qa-trace --auto-link
                               ตัวอย่าง: /qa-trace --module CHECKOUT
                               ตัวอย่าง: /qa-trace --save (→ traceability-matrix.md)
                               ⭐ Output: per-AC gate (PASS/CONCERNS/FAIL/GAP)
                                   + GAP detection (AC ไม่มี scenario covered)

🎛️ MANIFEST-DRIVEN (NEW v2.6 — UI Control Manifest from long-running)

  /qa-create-scenario --from-control-spec <feature-id>     [Mode C]
  🌐 ไม่ต้องรันเว็บ
       Read .agent/ui-controls/feature-N.json (emitted by long-running /continue)
       Generate ~3-7 scenarios per control across 5 mandatory categories:
         render-binding | api-binding | permission |
         validation     | cascade-loading-error
       Scenario มี control_refs[] + control_test_category สำหรับ Gate 4 tracking
       
       ตัวอย่าง: /qa-create-scenario --from-control-spec 7
       ตัวอย่าง: /qa-create-scenario --from-control-spec 7 --dry-run
       ตัวอย่าง: /qa-create-scenario --from-control-spec 7 --controls product-name,category-combo
       ตัวอย่าง: /qa-create-scenario --from-control-spec 7 --categories permission,validation
       ตัวอย่าง: /qa-create-scenario --from-control-spec 7 --skip-low-confidence
       ตัวอย่าง: /qa-create-scenario --from-control-spec --all-features

  /qa-edit-scenario --from-control-spec <feature-id>       [Mode B]
  🌐 ไม่ต้องรันเว็บ
       Detect manifest delta vs existing scenarios → suggest action per delta:
         control-added           → generate new scenarios
         control-removed         → deprecate linked scenarios
         type-change             → deprecate old + generate new
         binding endpoint change → update mock URL, keep ID
         permission role added   → add role variant
         permission role removed → deprecate role scenario
         validation rule add/rm  → add/deprecate validation scenario
         cascade depends_on change → add/deprecate cascade scenario
       
       ตัวอย่าง: /qa-edit-scenario --from-control-spec 7
       ตัวอย่าง: /qa-edit-scenario --from-control-spec 7 --dry-run
       ตัวอย่าง: /qa-edit-scenario --from-control-spec --all-features

  💡 ก่อนรัน 2 commands นี้ — manifest ต้องมีก่อน (จาก long-running):
     /long-running:emit-control-spec <id>    หรือ
     /long-running:continue        (auto Step 5.4)
  
  📖 Reference rules:
     ${CLAUDE_PLUGIN_ROOT}/skills/qa-ui-test/references/control-spec-scenarios.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 แนะนำจุดเริ่มต้น (เลือกตามสถานการณ์)

  ✨ เพิ่งเริ่มใหม่?               → /qa-help --quick         (Quick Start 3 ขั้นตอน)
  🆘 ติดอะไร? ไม่รู้จะทำต่อยังไง?  → /qa-help --troubleshoot ⭐ (decision tree)
  🐛 เพิ่งทำ test fail?           → /qa-help --bugs          (Bug workflow)
  🎯 อยากเข้าใจ P0-P3 + factors?  → /qa-help --risk          (v2.3 risk-based)
  📊 ก่อน release ตรวจอะไรบ้าง?    → /qa-help --nfr           (v2.4 NFR assessment)
  🔗 Requirement → test ครอบไหม?  → /qa-help --trace         (v2.5 traceability)
  ⭐ Test quality score?          → /qa-help --review        (v2.5 numeric score)
  🎛️ Form/data-bound page?       → /qa-help --control-spec  (v2.6 manifest-driven) ⭐
  👁️ อยากเห็นหน้าจอ/debug?       → /qa-help --playwright    (Playwright CLI)
  🔗 อยากเชื่อม long-running?     → /qa-help --integration
  📋 Workflow ครบวงจร?            → /qa-help --workflow      (E2E example)
  📖 ดูคำสั่งเฉพาะ?                → /qa-help [command]      เช่น /qa-help nfr-assess

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Workflow แนะนำ (มาตรฐาน — Day 1-3 + release-readiness)

🧪 Day 1 — Test:
   /qa-create-scenario --auto              # สแกน code → 156 scenarios + risk + factors
   /qa-continue --module LOGIN              # ทำทีละ module
   /qa-status --priority P0                 # ⭐ check P0 release blockers

🐛 Day 1-2 — Bugs:
   /qa-bug-triage                           # failed → bugs (severity ใช้ risk + factors)
   /qa-bug-list --release-blockers          # ⭐ P0 + open
   /qa-bug-export --severity critical       # ส่ง dev

🔧 Day 2-3 — Dev fix (ใน long-running):
   /continue                                # หยิบ feature → fix → mark done

✓ Day 3 — Verify:
   /qa-bug-verify --auto-sync               # ยืนยัน fix → ปิด bug + sync

🎯 Pre-release — Quality Gate (v2.4-2.5):
   /qa-trace --gaps-only                    # ⭐ AC ใดไม่มี scenario covered?
   /qa-nfr-assess                           # ⭐ overall NFR score + gate
   /qa-retest --review                      # ⭐ test quality score 0-100

🎛️ Manifest-driven QA (v2.6 — UI form/data-bound features):
   (long-running emit manifest ก่อน via /continue Step 5.4 หรือ /emit-control-spec)
   /qa-create-scenario --from-control-spec 7  # gen 5 categories per control
   /qa-continue --feature 7                   # build Playwright scripts + run
   (เมื่อ manifest update)
   /qa-edit-scenario --from-control-spec 7    # detect delta → add/update/deprecate

🔄 Weekly — Regression watch:
   /qa-bug-verify --regression              # รี-รัน verified bugs
   /qa-bug-list --regressions               # ดู bugs ที่ regress

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 ดูเพิ่ม
   /qa-help --troubleshoot    ⭐ ถ้าติด → คำสั่งต่อไหน
   /qa-help --risk            v2.3 risk + factors + model
   /qa-help --nfr             v2.4 NFR assessment
   /qa-help --trace           v2.5 traceability
   /qa-help --review          v2.5 numeric review score
   /qa-help --control-spec    ⭐ v2.6 manifest-driven (5 categories per control)
   /qa-help --quick           Quick Start 3 ขั้นตอน
   /qa-help --bugs            Bug Management ละเอียด
   /qa-help --workflow        Workflow ครบวงจร
   /qa-help --integration     Integration กับ long-running
   /qa-help --playwright      Playwright CLI cheat sheet

📖 เอกสารเต็ม:
   docs/playwright-cli-guide.md   คู่มือผสม Playwright CLI + qa command
```

---

### Mode 2: `--quick` → Quick Start 3 ขั้นตอน

```
🚀 QA UI Test — Quick Start (3 ขั้นตอน)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ขั้นตอนที่ 1️⃣ — สร้าง Scenarios (ไม่ต้องรันเว็บ)
─────────────────────────────────────────────
$ /qa-create-scenario --auto

Agent จะ:
  • สแกน codebase → ทุก Controllers/Pages/Routes
  • หา [Authorize] → roles
  • หา SeedData → credentials
  • สร้าง qa-tracker.json

ผลลัพธ์: 156 scenarios (functional + role-based + cascade)


ขั้นตอนที่ 2️⃣ — รันเว็บ + ทำทีละ Module
─────────────────────────────────────────────
Terminal 1:  $ dotnet run    (หรือ npm run dev)
Terminal 2:  $ /qa-continue --module LOGIN

Agent จะ:
  • วิเคราะห์ selectors จาก code
  • สร้าง Playwright scripts
  • รัน tests
  • อัพเดท qa-tracker.json

ผลลัพธ์: 7/8 passed (88%) — 1 failed


ขั้นตอนที่ 3️⃣ — จัดการ Bug ที่เจอ (NEW v2.2)
─────────────────────────────────────────────
$ /qa-bug-triage              # failed → bug entry
$ /qa-bug-list                # ดู bugs
$ /qa-bug-export BUG-001      # ส่งให้ dev fix

ผลลัพธ์: BUG-001 → feature_list.json#15
        Dev รัน /continue (long-running) → fix
        $ /qa-bug-verify --auto-sync  ← ปิด loop

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Goal: ทำ 100% pass rate + ทุก bug verified
```

---

### Mode 3: `--bugs` → Bug Management ละเอียด

```
🐛 Bug Management Workflow
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Lifecycle:
  failed test
       │
       │ /qa-bug-triage
       ▼
  [new] ──► [triaged]
              │
              │ /qa-bug-export หรือ /qa-bug-export-subtask
              ▼
          [exported] ────► dev (long-running /continue)
                              │
                              │ subtask "Verify BUG-XXX" done=true
                              ▼
                          [in_progress]
                              │
                              │ /qa-bug-verify
                              ▼
                        ┌─────┴─────┐
                        ▼           ▼
                   [verified]  [in_progress]  ← ส่งกลับ dev
                        │
                  (regress?) │
                        ▼
                    [reopened]


🏷️  Bug States:
   new          เพิ่ง fail ยังไม่ triage         (auto)
   triaged      classified แล้ว                 QA
   exported     ส่ง long-running แล้ว            QA
   in_progress  dev กำลังแก้                     Dev
   fixed        dev บอก fix แล้ว                 Dev
   verified     QA รี-รันผ่าน                    QA
   closed       ปิดถาวร                         QA
   reopened     verified แล้วกลับ fail (regression) auto
   wont_fix     ตัดสินใจไม่ fix                  Tech lead


🎯 Bug Types:
   app-defect       → /qa-bug-export (ส่ง dev)
   test-issue       → /qa-edit-scenario (QA team แก้ test)
   flaky            → /qa-edit-scenario (เพิ่ม wait)
   environment      → infra/devops (manual)


📊 Severity → Long-running mapping:
   🔴 critical  → priority=high, complexity=complex, model=opus,   60min
   🟠 high      → priority=high, complexity=medium,  model=opus,   45min
   🟡 medium    → priority=medium, complexity=medium, model=sonnet, 30min
   ⚪ low       → priority=low, complexity=simple,   model=sonnet, 20min


💡 Common Tasks:

  ดู critical bugs ที่ยังไม่ส่ง dev:
  /qa-bug-list --severity critical --not-exported

  Export ทุก critical+high:
  /qa-bug-export --severity critical,high

  ดู bug ค้างนาน:
  /qa-bug-list --aging 7

  ตรวจ regressions:
  /qa-bug-list --regressions
  /qa-bug-verify --regression

  Bug ใน module เดียว:
  /qa-bug-list --module PRODUCT

  Verify ทุก bug ที่ dev บอก fix แล้ว:
  /qa-bug-verify --auto-sync

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔜 ดูคำสั่งเฉพาะ:
   /qa-help bug-triage         /qa-help bug-list
   /qa-help bug-export         /qa-help bug-export-subtask
   /qa-help bug-verify
```

---

### Mode 4: `--integration` → Integration กับ long-running

```
🔗 Integration: qa-ui-test ↔ long-running (Bidirectional in v2.6)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Goal: bugs ที่เจอใน QA → flow เข้า dev workflow โดยอัตโนมัติ (v2.2)
       UI control intent → flow เข้า test scenarios โดยอัตโนมัติ (v2.6 ⭐ NEW)


📦 Data Flow (v2.6 — 3 directions):

  ① REVERSE (qa → long-running) — Bug flow (v2.2):
     qa-tracker.bugs[] ──export──▶ feature_list.features[] (epic="bug-fix")
     qa-tracker.bugs[].status=verified ◄──auto-sync── feature subtask done

  ② FORWARD (long-running → qa) — Manifest flow ⭐ v2.6 NEW:
     .agent/ui-controls/feature-N.json ──read──▶ qa-tracker.scenarios
     emitted by long-running /continue   consumed by --from-control-spec

  ③ LOOP (qa-tracker → long-running gate):
     qa-tracker.scenarios.control_refs[] ──read──▶ feature.qa_trace_coverage.control_coverage
     /long-running:qa-coverage-check --include-controls  → Gate 4 enforcement


📦 Data Flow Diagram:
                            ┌───────────────────┐
   qa-tracker.json          │ feature_list.json │
   ┌──────────────┐         │ (long-running)    │
   │ scenarios[]  │◄────────┤ features[]        │
   │  control_refs│ Manifest│   - epic="bug-fix"│
   │  ⭐ v2.6     │ flow    │   - subtasks[]    │
   │              │ (Forward│   - linked_bug    │
   │              │  v2.6)  │                   │
   │              │ ────────┤  (verified flow)  │
   │ bugs[]       │         │                   │
   │  ↓           │  export │                   │
   │ exported_to ─┼────────►│                   │
   │              │ ◄───────┤  (verified flow)  │
   │ status=verified ◄──────┼─ subtask done=true│
   └──────────────┘         └───────────────────┘
        ▲                            │     ▲
        │                            │     │
        │   /qa-bug-verify           │     │ Gate 4 enforcement
        │   --auto-sync              │     │ /long-running:qa-coverage-check
        └────────────────────────────┘     │ --include-controls
                                           │
   .agent/ui-controls/                     │
   feature-7.json ─emitted by─►/continue   │
                  Step 5.4                 │
   ◄─consumed by─ /qa-create-scenario      │
                  --from-control-spec ─────┘


📤 Export Modes (เลือกใช้ตาม context):

   Option 1: /qa-bug-export
   ───────────────────────
   ✓ สร้าง feature ใหม่ใน feature_list (epic="bug-fix")
   ✓ Generate subtasks: Reproduce → Investigate → Fix → Verify → Regression
   ✓ Bug = feature 1 ใบ → /continue หยิบทำได้แยก
   ✗ feature_list อาจบวมถ้ามี bug เยอะ
   
   เหมาะกับ: bug ที่ scope ใหญ่ / ไม่ตรงกับ feature ใด


   Option 2: /qa-bug-export-subtask
   ───────────────────────
   ✓ Agent ค้น feature ที่ตรงด้วย 8 heuristics:
     +50 module match
     +30 description keyword match
     +15 category alignment
     +10 layer alignment
     +15 URL reference match
     +10 recently in_progress / completed
     +5  has prior bug-fix subtasks
     -30 feature เป็น bug-fix อยู่แล้ว (penalty)
   ✓ แสดง top 3 candidates ให้ confirm
   ✓ ถ้า feature.passes=true → reopen + version_history
   
   เหมาะกับ: regression ของ feature ที่เพิ่งเสร็จ


🔄 Verify Loop (สวยที่สุด):

   Step 1 (qa-ui-test): /qa-bug-export BUG-001
   ─────────────────────────
   Output: feature_list.json#15 (epic="bug-fix", 5 subtasks)
       15.1 Reproduce BUG-001
       15.2 Investigate root cause (ที่ ProductController.cs:42)
       15.3 Implement fix
       15.4 Run /qa-bug-verify BUG-001       ← จุด sync
       15.5 เพิ่ม regression test


   Step 2 (long-running): /continue
   ─────────────────────────
   dev ทำ subtask 15.1 → 15.3 ตามลำดับ
   dev mark subtask 15.4 done=true (เชื่อว่า fix แล้ว)


   Step 3 (qa-ui-test): /qa-bug-verify --auto-sync
   ─────────────────────────
   Agent:
     1. scan feature_list.json → หา subtask "Verify BUG-XXX" ที่ done=true
     2. ดึง bug IDs: [BUG-001]
     3. รัน Playwright test ของ TS-PRODUCT-003 (linked scenario)
     4. ถ้า pass:
        ✓ bug.status = verified
        ✓ feature.subtasks ทั้งหมด done=true → feature.passes=true
        ✓ epic "bug-fix" progress.passed++
     5. ถ้า fail:
        ✗ bug.status = in_progress (กลับ)
        ✗ feature ยัง in_progress
        ✗ ส่ง screenshot + trace กลับให้ dev


🎁 ผลลัพธ์ที่ได้:

  ✓ Dev ไม่ต้องเปิด qa-tracker.json อ่านเอง — รัน /continue ปกติ
  ✓ QA ไม่ต้องบอก dev ว่า bug ไหนถูก fix — auto-sync ทำให้
  ✓ Regression detection อัตโนมัติ
  ✓ Time-to-fix tracking
  ✓ Feature/bug history เป็น single source of truth


🎛️ Manifest-driven Flow (v2.6 ⭐ NEW — Forward direction)

   Step A (long-running): /continue picks UI feature
   ─────────────────────────────────────
   dev implement form/data-bound page
   → Step 5.4 auto-emit .agent/ui-controls/feature-N.json
   → manifest มี: controls[] (id, type, binding, validation, permission, depends_on)
                  test_directives (must_test_roles, must_test_loading, must_test_errors)
                  unit_test_status (ของ Step 5.5.1)


   Step B (qa-ui-test): /qa-create-scenario --from-control-spec N
   ─────────────────────────────────────
   Agent อ่าน manifest → derive 5 mandatory categories per control:
     1. render-binding (always)
     2. api-binding (if binding.source == "api")
     3. permission (if permission != null) — N tests per role
     4. validation (if rules) — required/min/max/pattern variants
     5. cascade-loading-error (if depends_on OR must_test_loading)

   Generate ~3-7 scenarios per control with:
     control_refs[] = [<control-id>]
     control_test_category = "permission" | "render-binding" | ...

   Risk + model assignment per category:
     - permission scenarios → opus (security-critical)
     - cascade scenarios → opus (cross-control reasoning)
     - validation/api-binding → sonnet
     - render-binding → haiku


   Step C (qa-ui-test): /qa-continue --feature N
   ─────────────────────────────────────
   Build Playwright scripts + run


   Step D (long-running): /qa-coverage-check --feature N --include-controls
   ─────────────────────────────────────
   For each control_id in manifest:
     check qa-tracker.scenarios where control_refs[] contains control_id
     verify ทุก mandatory category มี scenario passed
     update feature.qa_trace_coverage.control_coverage


   Step E (long-running): /continue N → Step 5.6 Gate 4
   ─────────────────────────────────────
   gap_control_ids == [] AND fail_control_ids == [] → PASS → mark passes=true ✅


   Manifest Update Loop:
   ─────────────────────────────────────
   When manifest changes (control add/remove/permission/binding/validation):
     /qa-edit-scenario --from-control-spec N
       detects delta → add new / update endpoint / deprecate scenarios
       (ห้ามลบ — mark deprecated + supersedes pattern)


💡 Setup Requirements:
  1. long-running plugin ต้อง init แล้ว (มี feature_list.json)
  2. modules.json (optional) — ช่วย match module ดีขึ้น
  3. v2.6: long-running v2.8.0+ สำหรับ manifest emission

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔜 เริ่มเลย:
   Bug flow:
   /qa-bug-triage              → แปลง failed → bugs
   /qa-bug-export BUG-001      → ลอง export ตัวแรก
   /qa-bug-verify --auto-sync  → ปิด loop

   Manifest flow (v2.6):
   /long-running:emit-control-spec 7              → emit manifest (manual)
   /qa-create-scenario --from-control-spec 7      → gen scenarios
   /long-running:qa-coverage-check --feature 7 --include-controls
                                                  → check Gate 4
```

---

### Mode 5: `--workflow` → แสดง workflow ครบวงจร

```
🔄 QA UI Test — Workflow ครบวงจร (E2E)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 Day 1 — Setup + Test
─────────────────────────────────────
$ /qa-create-scenario --auto              # ไม่ต้องรันเว็บ
  → 156 scenarios (LOGIN, PRODUCT, ORDER, ...)

$ dotnet run                              # Terminal 1
$ /qa-continue --module LOGIN             # Terminal 2 — ต้องรันเว็บ
  → 7/8 passed
$ /qa-continue --module PRODUCT
  → 11/13 passed
$ /qa-continue --module ORDER
  → 12/15 passed

$ /qa-status
  → Total: 47/54 modules done (87%)
  → Failed: 8 scenarios


📅 Day 1 (ต่อ) — Triage + Export
─────────────────────────────────────
$ /qa-bug-triage
  → 8 failed → 6 bugs (2 ซ้ำ + 1 flaky)
  → BUG-001..BUG-006 created

$ /qa-bug-list
  → critical: 2, high: 3, medium: 1

$ /qa-bug-export --severity critical,high
  → BUG-001 → feature_list#15 (auth-module, opus)
  → BUG-002 → feature_list#16 (api-module, opus)
  → BUG-005 → feature_list#17 (api-module, opus)

$ /qa-bug-export-subtask BUG-003
  → Match: feature #7 (POST /api/products) score 72
  → BUG-003 → feature_list#7.4

$ /qa-bug-export-subtask BUG-004
  → Match: feature #11 (Error handling) score 65
  → BUG-004 → feature_list#11.5


📅 Day 2 — Dev Fix (ใน long-running)
─────────────────────────────────────
$ /continue
  → หยิบ feature #15 (BUG-001 fix)
  → ทำ 15.1 Reproduce → 15.2 Investigate → 15.3 Fix
  → mark 15.4 (Verify BUG-001) done=true


📅 Day 2 (ต่อ) — Verify
─────────────────────────────────────
$ /qa-bug-verify --auto-sync              # ต้องรันเว็บ
  → BUG-001: ✅ Run #4 PASSED → feature #15.passes=true
  → BUG-002: ❌ Run #4 FAILED → feature #16 ยัง in_progress
              ส่ง screenshot กลับ dev

$ /qa-status --bugs
  → Verified: 1 | In progress: 1 | Exported: 4


📅 Day 3 — แก้ที่เหลือ + Regression
─────────────────────────────────────
$ /qa-bug-verify --auto-sync              # หลัง dev fix BUG-002
  → BUG-002: ✅ Run #5 PASSED

$ /qa-edit-scenario TS-LOGIN-003 "regression test BUG-001"
  → เพิ่มเคส boundary

$ /qa-bug-verify --regression             # weekly check
  → ทุกตัวยัง pass ✅


📊 Final State:
   Tests: 54/54 modules done (100%)
   Bugs: 6 verified, 0 reopen
   Features (long-running): +5 bug-fix completed
   Avg time-to-fix: 2.1 hours


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎛️ Manifest-driven Workflow (v2.6 ⭐ — UI form/data-bound features)

📅 Day 1 — long-running emits manifest
─────────────────────────────────────
$ /long-running:continue 7              # implements ProductEditPage.tsx
  → Step 5.4 auto-emits .agent/ui-controls/feature-7.json
      controls: [product-name-input, category-combo, supplier-select,
                 active-radio, tags-checkbox-group]
  → Step 5.4.5 cross-validates with mockup → 1 warn drift
  → Step 5.5.1 unit test check → BLOCK passes=true (missing test)
  → write SupplierSelect.test.tsx → unit_test_status updated
  → Step 5.6 Gate 4 → BLOCK (gap_control_ids = ทุกอัน, no E2E yet)

📅 Day 1 (ต่อ) — qa-ui-test consumes manifest
─────────────────────────────────────
$ /qa-create-scenario --from-control-spec 7
  → reads .agent/ui-controls/feature-7.json
  → derives 5 mandatory categories per control
  → preview:
      Estimated scenarios: ~22-28 (avg 4-5 per control)
        - render-binding:        5
        - api-binding:           ~9 (3 controls × ~3 each)
        - permission:            4 (1 × 4 roles)
        - validation:            ~6
        - cascade-loading-error: ~4
  → confirm → generates 22 scenarios
  → qa-tracker.json:
      scenarios[] new with control_refs[] + control_test_category
      passes_history[] += { source: "control-spec", scenarios_added: 22 }

$ /qa-continue --feature 7              # build Playwright scripts + run
  → 22/22 pass

📅 Day 2 — close the loop
─────────────────────────────────────
$ /long-running:qa-coverage-check --feature 7 --include-controls
  → control_coverage.gap_control_ids == [] ✅
  → updates feature.qa_trace_coverage.control_coverage

$ /long-running:continue 7              # Gate 4 PASS → passes=true ✅


📅 Week 2 — manifest changes (cascade reqs)
─────────────────────────────────────
dev เพิ่ม discount-amount-input + เปลี่ยน category-combo permission
→ /long-running:continue 7 → re-emits manifest

$ /qa-edit-scenario --from-control-spec 7
  → detects deltas:
      + control-added: discount-amount-input → +5 scenarios
      ~ permission-change: category-combo (manager added) → +1 role variant
  → confirm → applies changes
  → ห้ามลบ existing scenarios (deprecated only)


📊 Final State:
   Manifest: 6 controls, 28 scenarios
   Coverage: 100% across 5 categories
   Drift: 1 warn (acknowledged), 0 errors

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Tips:
  • commit per module — easy rollback
  • รัน /qa-status ทุก session
  • /qa-retest --review (opus review) สำหรับ critical scenarios
  • /qa-bug-verify --auto-sync แทนที่จะ verify ทีละตัว
  • v2.6: ก่อน /qa-create-scenario --from-control-spec ทุกครั้ง — ดู manifest
    ที่ .agent/ui-controls/feature-N.json ว่า dev intent ครบไหม
```

---

### Mode 7: `--playwright` → Playwright CLI Cheat Sheet

```
🎭 Playwright CLI — Cheat Sheet สำหรับ qa-ui-test
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 ทำไมต้องใช้ Playwright CLI ตรงๆ?

   qa-ui-test plugin ใช้ Playwright อยู่แล้ว — แต่บางสถานการณ์
   ต้อง control เอง (debug ด้วยตา, watch mode, codegen)

   กฎง่ายๆ:
   • คิด/แก้เคส        → ใช้ qa command
   • เห็นหน้าจอ/debug   → ใช้ Playwright CLI
   • รัน + track สถานะ  → ใช้ qa command


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👁️  เห็นหน้าจอระหว่างรัน (4 วิธี)

  Option 1: --headed (เห็น browser จริง)
  ───────────────────────────────────
  $ npx playwright test --headed
  $ npx playwright test --headed --slow-mo=1000
  
  ✅ เหมาะกับ: demo, สาธิตให้ stakeholder
  ❌ ช้ากว่า headless 3-5 เท่า


  Option 2: --ui Mode ⭐ (แนะนำที่สุด)
  ───────────────────────────────────
  $ npx playwright test --ui
  
  ✅ Time-travel: เห็น DOM ก่อน/หลังทุก step
  ✅ Watch mode: แก้โค้ด → auto re-run
  ✅ Network/Console/Errors panels
  ✅ Pick locator แบบสด


  Option 3: --debug (Inspector)
  ───────────────────────────────────
  $ npx playwright test --debug
  $ npx playwright test --debug --grep TS-LOGIN-001
  
  ✅ Step-through manual ทีละ action
  ✅ Pick locator → copy ใส่โค้ด


  Option 4: Video (record ดูภายหลัง)
  ───────────────────────────────────
  แก้ playwright.config.ts:
    use: { video: 'on' }   # หรือ 'retain-on-failure'
  
  เปิดดูจาก HTML report → mp4

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 ดู List ทดสอบ

  CLI text:        $ npx playwright test --list
  Filter:          $ npx playwright test --list --grep LOGIN
  UI Mode:         $ npx playwright test --ui (sidebar)
  HTML Report:     $ npx playwright show-report
  qa-tracker ⭐:    /qa-status --module LOGIN
  Flowchart:       /qa-explain --module CHECKOUT

  💡 /qa-status เห็นเคสที่ยังไม่ได้สร้าง script ด้วย
     (Playwright list เห็นแค่ที่มี script แล้ว)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Filter (รันเฉพาะที่ต้องการ)

  ตามไฟล์:         $ npx playwright test tests/TS-LOGIN-001.spec.ts
  ตามชื่อ:          $ npx playwright test --grep TS-LOGIN-001
  ยกเว้น tag:       $ npx playwright test --grep-invert "@slow"
  ตาม browser:      $ npx playwright test --project=chromium
  Workers:          $ npx playwright test --workers=4
  ซ้ำ (หา flaky):    $ npx playwright test --repeat-each=10
  เฉพาะที่ fail:     $ npx playwright test --last-failed

  💡 หรือผ่าน qa: /qa-run --failed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎬 Codegen — บันทึก action → generate code

  $ npx playwright codegen http://localhost:3000
  $ npx playwright codegen --target=javascript [URL]
  $ npx playwright codegen --load-storage=auth.json [URL]

  หลังบันทึกเสร็จ → copy code → ใส่ไฟล์ใหม่
  แล้ว /qa-edit-scenario TS-NEW-XXX "describe scenario"
  เพื่อให้ qa-tracker.json รู้จัก

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 ดูผล + Trace

  HTML report:     $ npx playwright show-report
  Trace viewer:    $ npx playwright show-trace path/to/trace.zip
  Force trace:     $ npx playwright test --trace on

  💡 trace.zip อยู่ใน test-results/<test-name>/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔄 Workflow ผสม (qa + Playwright CLI)

  1. /qa-create-scenario --auto         # qa สร้างเคส
  2. /qa-continue --module LOGIN         # qa generate + รัน
  3. # ถ้ามี fail → debug ด้วย UI Mode
     $ npx playwright test --ui --grep TS-LOGIN-003
  4. /qa-edit-scenario TS-LOGIN-003 "..."  # qa แก้เคส
  5. /qa-run TS-LOGIN-003                # qa รันใหม่ + track

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📖 เอกสารเต็ม:
   ${CLAUDE_PLUGIN_ROOT}/docs/playwright-cli-guide.md
   
   ครอบคลุม:
   • Cheat sheet ทุกหมวด
   • Persona guide (Manual QA / Dev / Reviewer)
   • FAQ + Troubleshooting

🔜 ลองเลย:
   $ npx playwright test --ui              ← ดูทันที
   /qa-status                              ← ดู list ทั้งหมด
```

---

### Mode 8: `--troubleshoot` → ถ้าติดอะไร ให้ทำอะไรต่อ ⭐

```
🆘 QA Troubleshoot — Decision Tree
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QA workflow ซับซ้อน — ใช้ตารางนี้ map "อาการ → คำสั่งถัดไป"

┌─────────────────────────────────────────────────────────────────┐
│ STAGE 1: เริ่มต้น / ตั้งค่า                                      │
└─────────────────────────────────────────────────────────────────┘

❓ อาการ                              ✅ Recovery / Next
─────────────────────────────────────────────────────────────────
ไม่มี qa-tracker.json              → /qa-create-scenario --auto
ไม่รู้จะเริ่มจากไหน                  → /qa-help --quick
qa-create-scenario error           → /qa-help create-scenario
                                     ตรวจ: codebase มี Controllers/Pages?
ไม่เจอ credentials                  → manual mode: /qa-create-scenario [URL]
                                     หรือเพิ่ม seed data
ไม่มี Playwright                   → npm i -D @playwright/test
                                     npx playwright install chromium

┌─────────────────────────────────────────────────────────────────┐
│ STAGE 2: รัน Tests                                              │
└─────────────────────────────────────────────────────────────────┘

❓ อาการ                              ✅ Recovery / Next
─────────────────────────────────────────────────────────────────
"ไม่พบ tests/TS-XXX.spec.ts"        → /qa-continue --module XXX
                                     (สร้าง script ก่อน)
Test ทุกตัว fail step 1 (login)    → ตรวจ web running ที่ base_url?
                                     → /qa-edit-scenario แก้ login flow
Test fail บางตัว                   → /qa-bug-triage (failed → bugs)
ไม่รู้รัน module ไหนก่อน            → /qa-status (เห็น recommended order)
ทำมานานยังไม่จบ                    → /qa-status --priority P0
                                     (focus release blockers ก่อน)
รัน tests ช้ามาก                   → /qa-run --parallel
                                     หรือ --priority P0 (รันที่จำเป็น)
Test เห็นแต่ผ่าน — ไม่มั่นใจครอบจริง → /qa-retest --review (score 0-100)
                                     /qa-explain (coverage matrix)

┌─────────────────────────────────────────────────────────────────┐
│ STAGE 3: Bug Management                                         │
└─────────────────────────────────────────────────────────────────┘

❓ อาการ                              ✅ Recovery / Next
─────────────────────────────────────────────────────────────────
ไม่รู้ bug ไหนสำคัญที่สุด             → /qa-bug-list --release-blockers ⭐
                                     /qa-bug-list --severity critical
Bug เยอะ — ส่ง dev ทีเดียวได้ไหม    → /qa-bug-export --severity critical,high
                                     /qa-bug-triage --auto-export
Bug ตรงกับ feature ที่กำลังทำ        → /qa-bug-export-subtask BUG-XXX
                                     (agent ค้น feature ให้)
ไม่รู้ว่าควรสร้าง feature ใหม่หรือ    → score ≥ 70 → use --subtask
subtask                            → score < 40 → use /qa-bug-export
                                     (agent บอกใน /qa-bug-export-subtask)
Test fail หลายครั้ง — flaky หรือ?  → /qa-bug-triage --reclassify
                                     (3+ runs จะ classify เป็น flaky)
Bug เก่าค้างนาน                    → /qa-bug-list --aging 7
Bug ที่ verify แล้วกลับ fail        → /qa-bug-verify --regression ⭐
                                     /qa-bug-list --regressions

┌─────────────────────────────────────────────────────────────────┐
│ STAGE 4: Logic เปลี่ยน / แก้เคส                                 │
└─────────────────────────────────────────────────────────────────┘

❓ อาการ                              ✅ Recovery / Next
─────────────────────────────────────────────────────────────────
Business logic เปลี่ยน              → /qa-edit-scenario [TS-ID] "อะไรเปลี่ยน"
                                     ⭐ Auto: recompute risk + factors + model
                                     แสดง diff ก่อน apply
เคสเดิมยังต้องเก็บไว้                → /qa-edit-scenario สร้างเคสใหม่
                                     supersedes เคสเก่า (ไม่ลบ)
หลังแก้ logic — model ขึ้นเป็น opus → ดูที่ risk_recompute_history
                                     เห็น before/after diff ทันที
เพิ่ม security flow ใน scenario    → factor "security-flow" ขึ้นอัตโนมัติ
                                     model อาจเปลี่ยนเป็น opus

┌─────────────────────────────────────────────────────────────────┐
│ STAGE 5: Risk + Model (v2.3)                                    │
└─────────────────────────────────────────────────────────────────┘

❓ อาการ                              ✅ Recovery / Next
─────────────────────────────────────────────────────────────────
ไม่รู้เคสไหน priority สูง            → /qa-status --priority P0
                                     /qa-explain (color-coded flowchart)
ไม่เข้าใจว่าทำไม model เป็น opus    → ดู scenario.assigned_model_reason
                                     /qa-help --risk (อธิบายเต็ม)
อยากดูเฉพาะเคส cascade-deep         → /qa-status --factor cascade-deep
                                     /qa-run --factor cascade-deep
P0 fail = release blocker?          → ใช่ — fix ก่อน release
                                     /qa-bug-verify --priority P0

┌─────────────────────────────────────────────────────────────────┐
│ STAGE 6: NFR Assessment (v2.4)                                  │
└─────────────────────────────────────────────────────────────────┘

❓ อาการ                              ✅ Recovery / Next
─────────────────────────────────────────────────────────────────
ไม่รู้ว่า release ได้หรือยัง         → /qa-nfr-assess (overall score + gate)
                                     /qa-trace --gaps-only (release blockers)
NFR overall = FAIL                  → ดู by_category — มิติไหนแย่ที่สุด?
                                     /qa-nfr-assess --category [name]
                                     ทำตาม top recommendations
Security score ต่ำกว่า 75            → 🚨 hard floor → overall = FAIL
                                     fix critical first (CSP, secrets,
                                     cookies HttpOnly)
Performance ต่ำ                     → /qa-nfr-assess --deep (รัน Lighthouse)
                                     ใช้ค่าจริงแทน proxy
Maintainability ต่ำ                 → ตรวจ waitForTimeout, CSS selectors
                                     refactor ใช้ data-testid + helpers

┌─────────────────────────────────────────────────────────────────┐
│ STAGE 7: Traceability (v2.5)                                    │
└─────────────────────────────────────────────────────────────────┘

❓ อาการ                              ✅ Recovery / Next
─────────────────────────────────────────────────────────────────
ไม่รู้ AC ครอบโดน scenario ไหน       → /qa-trace
                                     (matrix AC ↔ TS-ID)
มี AC ที่ไม่มี scenario covered     → /qa-trace --gaps-only
                                     /qa-edit-scenario เพิ่มเคสครอบ
                                     หรือ /qa-create-scenario
Design doc ใช้ pattern ของตัวเอง    → /qa-trace --source path/to/design/
                                     (custom AC source)
AC ↔ scenarios ไม่ link manual      → /qa-trace --auto-link
                                     (keyword + module match)

┌─────────────────────────────────────────────────────────────────┐
│ STAGE 8: Test Quality Review (v2.5)                             │
└─────────────────────────────────────────────────────────────────┘

❓ อาการ                              ✅ Recovery / Next
─────────────────────────────────────────────────────────────────
ไม่รู้ test quality ดีพอไหม          → /qa-retest --review ⭐
                                     score 0-100, 4 dimensions
Score < 65 (FAIL)                  → ดูแต่ละ dimension
                                     - Coverage ต่ำ → /qa-create-scenario
                                     - Determinism → fix flaky
                                     - Assertion → verify text content
                                     - Maintainability → refactor selectors
Score 65-79 (CONCERNS)             → ทำ recommendations จาก review
Trend score ลดลง                   → ดู review.history เห็น delta
                                     อะไรเปลี่ยนช่วงนี้?

┌─────────────────────────────────────────────────────────────────┐
│ STAGE 9: Release Sign-off                                       │
└─────────────────────────────────────────────────────────────────┘

❓ ก่อน release ตรวจอะไรบ้าง?
   1. /qa-status --priority P0           ← P0 ทุกตัว pass?
   2. /qa-trace --gaps-only              ← AC ครบหรือไม่?
   3. /qa-nfr-assess                     ← NFR gate = PASS?
   4. /qa-retest --review                ← Quality score ≥ 80?
   5. /qa-bug-list --release-blockers    ← P0 bugs = 0?

✅ ทุกข้อผ่าน → release-ready
⚠️ มีข้อใดไม่ผ่าน → ดู recommendations + fix ก่อน

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Quick recovery cheat sheet:

   ดูภาพรวม:                /qa-status
   ดูที่สำคัญที่สุด:          /qa-status --priority P0
   หา bug:                  /qa-bug-list --release-blockers
   ก่อน release:             /qa-trace + /qa-nfr-assess + /qa-retest --review
   debug script:            npx playwright test --ui --grep TS-XXX
   ดู doc command:          /qa-help [command-name]
```

---

### Mode 9: `--risk` → Risk-Based Priority + Model (v2.3)

```
🎯 Risk-Based Priority + 3-Tier Model Assignment (v2.3)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 2 มิติ (แยกกัน):

   มิติ 1 — RISK (เลือก scope: รันเคสไหนก่อน)
   ──────────────────────────────────────────
   risk.score = probability (1-3) × impact (1-3)

   probability:  1=rare       2=occasional   3=likely
   impact:       1=cosmetic   2=functional   3=critical
                                                 (money/data/security/blocker)

   risk.priority:
     🔴 P0 = score 7-9   must-pass (release blocker)
     🟠 P1 = score 5-6   should-pass
     🟡 P2 = score 3-4   nice-to-have
     🟢 P3 = score 1-2   regression watch


   มิติ 2 — COMPLEXITY FACTORS (ตัวจริงเลือก model)
   ──────────────────────────────────────────────
   8 factors:
   ├─ state-machine        flow มี status transitions
   ├─ cascade-deep         cascade depth ≥ 2
   ├─ multi-step           wizard ≥ 3 steps
   ├─ concurrent           race / optimistic lock
   ├─ security-flow        auth, CSRF, XSS, money
   ├─ network-mock         API mock + retry
   ├─ master-detail-sync   inline edit + master total
   └─ cross-browser        engine diff testing


🤖 3-Tier Model Assignment (top-down, first match wins):

   TIER 1 — opus (เคสยาก, reasoning ลึก) — 10 rules
     ✓ มี factor ≥ 2
     ✓ state-machine
     ✓ cascade-deep
     ✓ concurrent
     ✓ cross-browser
     ✓ security-flow + P0
     ✓ master-detail-sync
     ✓ network-mock + P0
     ✓ multi-step + P0/P1
     ✓ P0 + factor ≥ 1

   TIER 3 — haiku (P3 trivial — pattern-based) — 1 rule
     ✓ P3 + factor == 0  (ตัวอย่าง: about page, footer link, pagination)

   TIER 2 — sonnet (default — mid-complexity / standard CRUD)
     ✓ ทุกเคสที่ไม่ตรง Tier 1/3


💰 Cost ratio:  haiku ~1x  |  sonnet ~3x  |  opus ~15x


🔧 Filter commands ที่ใช้ risk:

   /qa-status --priority P0              # release-blocker view
   /qa-status --model opus               # focus เคสยาก
   /qa-status --factor state-machine     # ทุกเคสที่มี factor นี้
   /qa-run --priority P0                 # release smoke
   /qa-retest --priority P0
   /qa-bug-list --priority P0            # bugs จาก P0 scenarios
   /qa-bug-list --release-blockers       # alias = --priority P0 + open


✏️ /qa-edit-scenario auto-recompute:

   เมื่อ logic เปลี่ยน → agent infer factor changes:
     "OTP", "MFA"           → +security-flow
     "wizard", "step 1,2,3" → +multi-step
     "cascade", "dependent" → +cascade-deep
     "transition", "status" → +state-machine
     ฯลฯ

   แสดง before/after diff:
     TS-LOGIN-001:
       risk:  P1/6 → P0/9 ⬆️
       factors: [] → [security-flow, multi-step]
       model: sonnet → opus ⬆️
       reason: multiple complexity factors

   user confirm ก่อน apply → เก็บ risk_recompute_history


💡 ใช้เมื่อ:
   - ก่อนรัน tests: /qa-status --priority P0 → focus ทำ P0 ก่อน
   - หลัง logic เปลี่ยน: /qa-edit-scenario auto-recompute model
   - audit cost: group by assigned_model_reason → ดู opus ใช้กับอะไร

🔜 ดู:
   /qa-help create-scenario    — รายละเอียด auto-assign rules
   /qa-help edit-scenario      — auto-recompute logic
```

---

### Mode 10: `--nfr` → NFR Assessment (v2.4)

```
🎯 NFR (Non-Functional Requirements) Assessment — v2.4
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 4 Categories (each 0-100):

   🚀 Performance
   ──────────────────────────
   • LCP             20 pts   (Largest Contentful Paint)
   • INP             20 pts   (Interaction to Next Paint)
   • TTFB            20 pts   (Time to First Byte)
   • Bundle size     20 pts
   • Network resil.  20 pts   (จาก network-mock scenarios)

   🔒 Security
   ──────────────────────────
   • Headers         20 pts   (CSP, X-Frame, HSTS, ฯลฯ)
   • Auth coverage   20 pts   (login, MFA, rate limit, CSRF)
   • Vulns coverage  20 pts   (XSS, SQLi, CSRF, IDOR scenarios)
   • Secret scan     20 pts   (DOM/trace ไม่มี keys/passwords)
   • Token hygiene   20 pts   (HttpOnly, Secure, SameSite)

   ⚠️ Hard floor: security < 75 → overall = FAIL

   🛡️ Reliability
   ──────────────────────────
   • Pass rate       20 pts
   • Flaky rate      20 pts
   • Network resil.  20 pts
   • Error recovery  20 pts   (specific error msg + retry)
   • Bug reopen rate 20 pts   (regression frequency)

   🔧 Maintainability
   ──────────────────────────
   • Selector qual.  20 pts   (data-testid > CSS)
   • Helper reuse    20 pts   (login + API helpers)
   • Test density    20 pts   (scenarios / pages)
   • POM coverage    20 pts   (specs ที่ import pages/)
   • Comments+docs   20 pts


🚦 Gate Decision:

   score >= 85    → PASS         (release-ready)
   score 65-84    → CONCERNS     (fix recommendations)
   score < 65     → FAIL         (block release)

   Special: security < 75 → overall = FAIL (security floor)


🎚️ 3 Modes (cost vs depth):

   Light (default)   — qa-tracker data + bugs[] เท่านั้น (no Lighthouse)
   /qa-nfr-assess

   Deep              — + Lighthouse audit ทุก URL + curl headers
   /qa-nfr-assess --deep

   Full              — + manual security audit + a11y scan
   /qa-nfr-assess --full


📋 ตัวอย่าง output:

   🎯 NFR Assessment — Overall: 82/100 CONCERNS

   Performance:     88   PASS  ✅
   Security:        75   CONCERNS ⚠️  (close to floor!)
   Reliability:     92   PASS  ✅
   Maintainability: 73   CONCERNS ⚠️

   🚨 Top recommendations:
     1. [HIGH/security] Add CSP header on /checkout (30min)
     2. [HIGH/maint] Replace waitForTimeout in 5 specs (1hr)
     3. [MED/perf] Code-split /admin routes (half-day)


💡 ใช้เมื่อ:
   - ก่อน PR merge: /qa-nfr-assess --module {MODULE}
   - ก่อน release: /qa-nfr-assess --deep (full coverage)
   - CI gate: /qa-nfr-assess --gate-only (env var output)
   - หลัง production incident: /qa-nfr-assess --full

🔜 ดู:
   /qa-help nfr-assess         — รายละเอียดคำสั่ง
   skills/qa-nfr/SKILL.md      — skill documentation
   skills/qa-nfr/references/   — algorithm details ทั้ง 4 categories
```

---

### Mode 11: `--trace` → Traceability Matrix (v2.5)

```
🔗 Traceability Matrix — AC ↔ Test Scenarios — v2.5
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Goal: ตอบคำถาม "Acceptance Criteria ทุกตัวมี scenario ครอบไหม?"
        เห็น GAPs ที่ block release


📚 3 AC Sources (ตามลำดับ priority):

   1. Inline ใน scenario:
      scenario.acceptance_criteria_id = ["AC-001", "AC-002"]

   2. Auto-discover จาก design docs (registry-first):
      อ่าน .design-docs/design_doc_list.json → resolve sections[key=requirements].file
      grep -E "^(AC-|UC-)[0-9]+:" <resolved-file>   (fallback: docs/)

      Patterns ที่ scan (flat AC-NNN / UC-NNN — มาตรฐาน registry):
      • AC-001: User can place order
      • UC-003: Cancel order workflow
      • ## Acceptance Criteria
      • - AC-005: System logs all actions

   3. Section-based (fallback):
      ถ้าไม่มี AC pattern → extract จาก ## Use case headers


🚦 Per-AC Gate Decision:

   ✅ PASS       — มี scenario covered AND ทุก scenario passed
   ⚠️ CONCERNS  — pass rate 80-99% (มี fail บ้าง)
   ❌ FAIL      — มี scenario AND fail rate > 20% หรือ P0 fail
   🚨 GAP       — ไม่มี scenario ครอบเลย (release blocker)


📋 ตัวอย่าง output:

   🔗 Traceability Matrix — 24 ACs total

   | AC ID  | Title                    | Tests          | Gate    |
   |--------|--------------------------|----------------|---------|
   | AC-001 | Place order valid pay    | TS-CO-001,002  | ✅ PASS |
   | AC-002 | Cancel within 10 min     | TS-CO-008      | ✅ PASS |
   | AC-003 | VAT calculation correct  | (no test)      | 🚨 GAP  |
   | AC-004 | Payment retry timeout    | TS-CO-MOCK-3   | ❌ FAIL |
   | AC-006 | MFA suspicious activity  | (no test)      | 🚨 GAP  |

   🚨 Release Status: NOT READY
      • 2 ACs without coverage (GAP)
      • 1 AC failing (FAIL)


🔧 Common workflows:

   /qa-trace                       # full matrix
   /qa-trace --gaps-only           # ⭐ release blockers ก่อน
   /qa-trace --auto-link           # ดึง ACs จาก design + auto-link scenarios
   /qa-trace --module CHECKOUT     # drill-down
   /qa-trace --save                # → traceability-matrix.md (sharable)


💡 ใช้เมื่อ:
   - ก่อน release: ตรวจ AC coverage + GAPs
   - หลัง design doc update: /qa-trace --auto-link หา ACs ใหม่
   - PR review: /qa-trace --module {MODULE} เห็น coverage ของ feature


🔜 ดู:
   /qa-help trace             — รายละเอียดคำสั่ง
   /qa-trace --save           — ลองสร้าง matrix เอกสาร
```

---

### Mode 12: `--review` → Numeric Review Score 0-100 (v2.5)

```
⭐ /qa-retest --review — Numeric Quality Score 0-100 (v2.5)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Goal: วัด test quality เป็น number — track trend ตามเวลา


📊 4 Dimensions (each 25 pts → 100 total):

   📦 1. Coverage (25 pts)
   ────────────────────────
   • Happy path scenarios            5 pts
   • Negative scenarios              7 pts
   • Edge cases (boundary, special)  5 pts
   • Role coverage                   4 pts
   • Risk priority distribution      4 pts

   Bonus: -3 ถ้า P0 < 10%
   Bonus: +2 ถ้ามี factors ≥ 4 different


   ⚖️ 2. Determinism (25 pts)
   ────────────────────────
   • Pass rate (last run)            12 pts (≥95%=12, 90-94=8, <80=0)
   • Flaky rate                      8 pts  (<2%=8, 2-5%=5, >10%=0)
   • No waitForTimeout               5 pts  (count=0=5, 1-3=3, >3=0)


   🎯 3. Assertion Quality (25 pts)
   ────────────────────────
   • Specific text assertions        10 pts (ratio ≥0.7=10)
   • Error messages verified         8 pts
   • API response shape verified     4 pts
   • State after action verified     3 pts

   Penalty: -3 ถ้ามีเคสแค่ click button


   🔧 4. Maintainability (25 pts)
   ────────────────────────
   • Selector quality                10 pts (data-testid + getByRole)
   • Helper reuse                    8 pts
   • POM coverage                    4 pts
   • Comments referencing scenario   3 pts


🚦 Quality Gate:

   score >= 80    → PASS       (release-ready)
   score 65-79    → CONCERNS   (acceptable, fix before next release)
   score < 65     → FAIL       (block — significant test debt)


📋 ตัวอย่าง output:

   🔍 Opus Review Score: 84/100 ✅ PASS

   Coverage:           22/25  ████████████████████████░░  (88%)
   Determinism:        20/25  ████████████████████░░░░░░  (80%)
   Assertion quality:  18/25  ██████████████████░░░░░░░░  (72%) ⚠️
   Maintainability:    24/25  ████████████████████████░░  (96%)

   Trend: +6 vs last review (78 → 84, 3 weeks ago)

   💡 Top 3 fixes:
     1. [HIGH] Replace toBeVisible-only assertions in 3 scenarios
     2. [MED] Add concurrent edit scenario for ORDER
     3. [LOW] Replace waitForTimeout in TS-CHECKOUT-005


🔧 ใช้คำสั่ง:

   /qa-retest --review                  # all failed scenarios + review
   /qa-retest --review --priority P0    # focus P0 only
   /qa-retest --review --module ORDER   # per-module score


💡 ใช้เมื่อ:
   - หลังรัน batch tests — ดู quality
   - ก่อน release — ต้อง score ≥ 80
   - หลังเพิ่ม scenarios — ดูว่า score ขึ้นจริงไหม
   - Trend tracking — เห็น quality เปลี่ยนตามเวลา


🔜 ดู:
   /qa-help retest            — รายละเอียดคำสั่ง /qa-retest
   /qa-help nfr               — NFR ก็มี maintainability — แยกกันคนละ scope:
                                  review = test code quality
                                  NFR maintainability = test ecosystem health
```

---

### Mode 13: `--control-spec` → Manifest-driven Generation (v2.6) ⭐

```
🎛️ UI Control Manifest — qa-ui-test v2.6
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 ปัญหาที่แก้:
   Auto-scan (Mode A) อ่าน code ได้ แต่ "เดา" intent
   - dropdown filter ตาม tenant หรือเปล่า?
   - field required ที่ server หรือแค่ client?
   - cascade ควร reset child เมื่อ parent change?

   Manifest pin dev intent ลงไฟล์ → qa อ่านตรง ๆ ไม่ต้องเดา


📦 Where manifest comes from?

  Source: long-running plugin (.agent/ui-controls/feature-N.json)

  Created by:
    /long-running:continue           Step 5.4 auto-emit
    /long-running:emit-control-spec  manual emit (กรณี manifest หาย)


📐 Manifest schema (สิ่งที่ qa สนใจ)

  controls[]:
    id, type, selector, label
    binding {
      source: "state" | "api" | "derived" | "static"
      options_endpoint, value_field, display_field
      search_param, cache_strategy
    }
    validation { required, min_length, max_length, pattern, ... }
    permission {
      visible_to_roles: ["admin", "manager"]
      data_scope: "tenant_id == user.tenant_id"
      fallback_when_unauthorized: "hide" | "disable" | "redirect"
    }
    depends_on, depends_behavior

  test_directives:
    must_test_roles: ["admin", "manager", "user", "guest"]
    must_test_loading: true
    must_test_errors: ["401", "403", "500", "network"]


🎯 5 Mandatory Test Categories (auto-derived per control)

  ทุก control trigger category ตาม manifest:

  1. render-binding (ALWAYS)
     - Test: control แสดง + bind state field/prop ถูก
     - Assertion: locator visible, initial value correct, two-way binding

  2. api-binding (if binding.source == "api")
     - Test: options/value โหลดจาก API ถูก
     - Variants: happy-path / search filter / empty options
     - Mock route, assert request count for cache_strategy

  3. permission (if permission != null)
     - Test: 1 scenario per role ใน must_test_roles
     - Assertion: visibility ถูก / data_scope ใน querystring /
                  fallback (hide/disable/redirect)
     - Always P0 → opus model (security-critical)

  4. validation (if validation มี rule)
     - Variants: required (empty submit) / max_length (boundary) /
                 pattern (invalid input) / server_side (422 handling)

  5. cascade-loading-error (if depends_on OR must_test_loading)
     - Cascade: parent change → child reload + reset behavior
     - Loading: skeleton/spinner during fetch
     - Errors: 401, 403, 500, network — per must_test_errors


🚀 Generation flow

  /qa-create-scenario --from-control-spec <id>

  Step 0: Read .agent/ui-controls/feature-<id>.json (validate schema)
  Step 1: Validate manifest (warn on low confidence / drift errors)
  Step 2: Compute required categories per control
          → preview จำนวน scenarios estimated
  Step 3: Generate scenarios per category (5 patterns from reference doc)
  Step 4: Risk + model assignment
          - permission/cascade → opus
          - api-binding/validation → sonnet
          - render-binding → haiku
  Step 5: Diff vs existing scenarios (preserve old)
  Step 6: Write to qa-tracker.json (passes_history += control-spec-N)
  Step 7: Hint follow-up commands


🆔 Scenario ID Convention

  TS-<MODULE>-<PAGE>-<CATEGORY>-<INDEX>
  TS-<MODULE>-<PAGE>-<CATEGORY>-<role-or-rule>-<INDEX>

  Examples:
    TS-PRODUCT-EDIT-RENDER-001
    TS-PRODUCT-EDIT-API-001
    TS-PRODUCT-EDIT-PERM-admin-001
    TS-PRODUCT-EDIT-PERM-guest-001
    TS-PRODUCT-EDIT-VAL-required-001
    TS-PRODUCT-EDIT-VAL-maxlen-001
    TS-PRODUCT-EDIT-CASCADE-001
    TS-PRODUCT-EDIT-LOAD-001
    TS-PRODUCT-EDIT-ERR-401-001


🔗 Linking back to manifest

  Every generated scenario in qa-tracker.json:
    {
      "id": "TS-PRODUCT-EDIT-PERM-admin-001",
      "feature_id": 7,
      "control_refs": ["category-combo"],          ← v2.6 NEW
      "control_test_category": "permission",       ← v2.6 NEW
      "manifest_path": ".agent/ui-controls/feature-7.json",
      "manifest_emitted_at": "...",
      ...
    }

  → /long-running:qa-coverage-check --include-controls
    ใช้ control_refs[] + control_test_category map กับ manifest
    → enforce Gate 4 ใน /continue Step 5.6


🔄 Manifest Update → Scenario Update

  /qa-edit-scenario --from-control-spec <id>  (Mode B)

  Detects deltas vs qa-tracker:

  | Manifest delta             | Scenario action                            |
  |----------------------------|--------------------------------------------|
  | control-added              | Generate new scenarios (5 categories)      |
  | control-removed            | Mark linked scenarios deprecated           |
  | type-change                | Deprecate old + generate new               |
  | binding endpoint change    | Update mocked URL, keep ID                 |
  | permission role added      | Add new role variant scenario              |
  | permission role removed    | Mark role scenario deprecated              |
  | validation rule add/remove | Add/deprecate validation scenario          |
  | cascade depends_on change  | Add/deprecate cascade scenario             |

  Rule: ห้ามลบ scenarios — mark deprecated + reference new (supersedes pattern)


💡 Filter flags (precision control)

  --controls <id1,id2>       Generate เฉพาะ control_id ที่ระบุ
  --categories <c1,c2>       Generate เฉพาะ category ที่ระบุ
  --skip-low-confidence      ข้าม controls confidence: low (default)
  --include-low-confidence   รวม low confidence
  --dry-run                  preview ไม่เขียน
  --all-features             iterate ทุก manifest ใน .agent/ui-controls/


📋 ตัวอย่างเต็ม

  Setup:
    long-running v2.8.0+ ติดตั้งแล้ว
    /long-running:continue 7 → manifest emitted

  Run:
    $ /qa-create-scenario --from-control-spec 7 --dry-run
      → Preview: 22 scenarios across 5 categories
      → Approve

    $ /qa-create-scenario --from-control-spec 7
      → 22 scenarios generated
      → qa-tracker.scenarios with control_refs[] + control_test_category

    $ /qa-continue --feature 7
      → Build Playwright scripts + run

    $ /long-running:qa-coverage-check --feature 7 --include-controls
      → control_coverage.gap_control_ids == [] ✅

    $ /long-running:continue 7
      → Step 5.6 Gate 4 PASS → mark passes=true ✅

  Manifest changes (Week 2):
    dev เพิ่ม discount field + เปลี่ยน category permission
    → /long-running:continue 7 → re-emits manifest

    $ /qa-edit-scenario --from-control-spec 7 --dry-run
      → Detected: + 5 new (discount), + 1 role variant (manager)
      → Confirm

    $ /qa-edit-scenario --from-control-spec 7
      → Applied changes


🚪 Confidence-based filtering

  Manifest มี controls[].confidence (high/medium/low):

  | Confidence | Action                                                 |
  |------------|--------------------------------------------------------|
  | high       | Generate ทุก mandatory category                        |
  | medium     | Generate + add note "verify selector" comment          |
  | low        | Skip auto-generation, output [manual-review-required]  |

  ถ้า manifest มี needs_review: true → emit warning + ask confirmation


📚 Reference

  Schema:     plugins/long-running/skills/long-running/references/ui-control-manifest.md
  Derivation: ${CLAUDE_PLUGIN_ROOT}/skills/qa-ui-test/references/control-spec-scenarios.md
  Long-running side: /long-running:help --controls (v2.8.0)


🔜 ดูเพิ่ม
   /qa-help qa-create-scenario        → command details (Mode A/B/C)
   /qa-help qa-edit-scenario          → command details (Mode A/B)
   /qa-help --integration             → cross-plugin data flow
```

---

### Mode 6: คำสั่งเฉพาะ (เมื่อมี argument)

**รองรับ format:** `qa-create-scenario`, `create-scenario`, `/qa-create-scenario`, `bug-export`, `bugexport`

**สำหรับแต่ละคำสั่ง แสดง:**

```
📖 [Command Name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 คำอธิบาย:
   [description in Thai]

🌐 Web requirement:
   ต้อง / ไม่ต้องรันเว็บ + เหตุผล

📋 Options/Flags:
   [list ครบทุก flag จาก command file]

💡 ตัวอย่าง:
   [3-5 examples]

📁 Output:
   [files / state changes]

🔜 Next Action:
   [suggested commands หลังจากนี้]

⏱️ เวลาโดยประมาณ:
   [estimated time]
```

---

### รายละเอียดแต่ละคำสั่ง (สำหรับ Mode 6)

**qa-create-scenario:** ⭐ v2.6 — adds Mode C (--from-control-spec)
- Web: ❌ ไม่ต้อง (--auto/--from-control-spec), ✅ ต้อง ([URL])
- Modes:
  - Mode A: --auto (codebase scan)
  - Mode B: [URL] (manual brainstorm per page)
  - Mode C: --from-control-spec <feature-id> ⭐ v2.6 (manifest-driven, 5 categories per control)
- Flags (Mode A): --auto, --brainstorm-agents, --tech [name], --pass-mode, --modules, --dry-run, --reset
- Flags (Mode B): [URL], --module, --master-data, --master-detail, --from-design-doc
- Flags (Mode C): --from-control-spec <id>, --controls <id1,id2>, --categories <c1,c2>, --skip-low-confidence, --include-low-confidence, --dry-run, --all-features
- Output: qa-tracker.json (scenarios, roles, cascade_dependencies)
  v2.6: + scenarios[].control_refs[] + scenarios[].control_test_category + passes_history pass=control-spec-N
- Prerequisites (Mode C): .agent/ui-controls/feature-<id>.json (จาก long-running /continue Step 5.4 หรือ /emit-control-spec)
- Time: 5-15 min (depends on codebase size); Mode C ~2-5 min per feature
- Next: /qa-continue, /qa-status, /long-running:qa-coverage-check --include-controls (Mode C)

**qa-continue:**
- Web: ✅ ต้องรัน
- Flags: (empty for menu), --module [name], [TS-ID], --cascade [module]
- Output: tests/*.spec.ts, test-scenarios/*.md, test-data/*.json, test-results/, qa-tracker.json
- Time: 10-30 min per module
- Next: /qa-continue (next module), /qa-retest, /qa-bug-triage

**qa-run:**
- Web: ✅ ต้องรัน
- Flags: [TS-ID], --module, --all, --parallel, --failed
- Output: test-results/*/run-*/, qa-tracker.json (runs[], status)
- Time: 1-5 min per scenario
- Next: /qa-retest, /qa-bug-triage, /qa-status

**qa-retest:**
- Web: ✅ ต้องรัน
- Flags: (empty for failed), [TS-ID], --module, --all, --review, --parallel
- Output: new run entries, retest-comparison.md, review (if --review)
- Time: 1-5 min per retest
- Next: /qa-bug-triage, /qa-bug-list

**qa-edit-scenario:** ⭐ v2.6 — adds Mode B (--from-control-spec)
- Web: ❌ ไม่ต้อง
- Modes:
  - Mode A: [TS-ID] [description] หรือ --module/--impact (logic-change-driven)
  - Mode B: --from-control-spec <feature-id> ⭐ v2.6 (manifest-delta-driven)
- Flags (Mode A): [TS-ID] [description], --module [name] [description], --impact
- Flags (Mode B): --from-control-spec <id>, --dry-run, --all-features
- Output: qa-tracker.json (updated scenarios + passes_history)
  Mode B: detect deltas → add new / update endpoint / deprecate scenarios (ห้ามลบ)
- Special: ⭐ Auto-recompute risk + factors + assigned_model on logic change (Mode A)
  ⭐ Mode B preserves IDs for endpoint-only change; deprecates+supersedes for type/role change
- Time: 2-5 min (Mode A); 1-3 min per feature (Mode B)
- Next: /qa-continue, /qa-run, /long-running:qa-coverage-check --include-controls (Mode B)

**qa-status:**
- Web: ❌ ไม่ต้อง
- Flags: --module, --failed, --review, --bugs
- Output: display only
- Time: < 1 min
- Next: depends on findings

**qa-explain:**
- Web: ❌ ไม่ต้อง
- Flags: --module [name], --save
- Output: display หรือ test-plan.md (ถ้า --save)
- Time: < 1 min
- Next: /qa-edit-scenario, /qa-create-scenario

**qa-bug-triage:** ⭐ NEW
- Web: ❌ ไม่ต้อง
- Flags: [BUG-ID|TS-ID], --module, --reclassify, --auto-export
- Output: qa-tracker.json (bugs[], bug_summary), root_cause_hint (subagent)
- Time: 1-3 min per bug + opus subagent if severity≥high
- Next: /qa-bug-list, /qa-bug-export, /qa-bug-export-subtask

**qa-bug-list:** ⭐ NEW
- Web: ❌ ไม่ต้อง
- Flags: [BUG-ID], --severity, --status, --type, --module, --aging [N], --regressions, --not-exported, --all, --json
- Output: display only
- Time: < 1 min
- Next: /qa-bug-export, /qa-bug-verify, /qa-edit-scenario (test issues)

**qa-bug-export:** ⭐ NEW
- Web: ❌ ไม่ต้อง
- Flags: [BUG-ID(s)], --severity, --module, --not-exported, --all, --force, --dry-run
- Output: feature_list.json (new feature, epic="bug-fix"), qa-tracker.json (bug.exported_to)
- Prerequisites: long-running plugin init แล้ว (มี feature_list.json)
- Time: 1-2 min per bug
- Next: /continue (long-running), /qa-bug-verify

**qa-bug-export-subtask:** ⭐ NEW
- Web: ❌ ไม่ต้อง
- Flags: [BUG-ID(s)], --severity, --module, --dry-run
- Output: feature_list.json (subtask appended, possibly reopen feature), qa-tracker.json
- Special: agent matches feature ด้วย 8 heuristics, แสดง top 3 candidates, threshold 40
- Time: 2-3 min per bug (รวม matching)
- Next: /continue (long-running), /qa-bug-verify

**qa-bug-verify:** ⭐ NEW
- Web: ✅ ต้องรัน
- Flags: [BUG-ID(s)], --status fixed, --auto-sync, --regression
- Output: new run entries, qa-tracker.json (bug.status, fix_info), feature_list.json (subtask.done, feature.passes)
- Special: --auto-sync ปิด loop dev/qa อัตโนมัติ
- Time: 1-3 min per verify
- Next: /qa-bug-list (check remaining), /qa-edit-scenario (regression test)

**qa-nfr-assess:** ⭐ NEW v2.4
- Web: ❌ ไม่ต้อง (light), ✅ ต้อง (--deep — Lighthouse)
- Flags: --deep, --full, --category [name], --module [name], --gate-only, --json
- Output: qa-tracker.nfr_results, recommendations[], history[]
- Special: 4 categories × 100 pts; security < 75 → overall FAIL; rolling smoothing 0.7×current + 0.3×prev
- Time: 1-2 min (light), 5-10 min (--deep with Lighthouse)
- Next: ทำ top recommendations → /qa-nfr-assess again เพื่อ track score change

**qa-trace:** ⭐ NEW v2.5
- Web: ❌ ไม่ต้อง
- Flags: --module, --gaps-only, --auto-link, --source [path], --save
- Output: traceability matrix display + traceability-matrix.md (--save), qa-tracker.traceability
- Special: AC sources priority — inline > auto-discover > section-based; per-AC gate (PASS/CONCERNS/FAIL/GAP)
- Prerequisites: design docs ใน docs/ (or --source path)
- Time: 1-3 min
- Next: /qa-edit-scenario เพิ่ม scenarios สำหรับ GAPs, /qa-bug-triage สำหรับ FAILs

**qa-help:**
- Web: ❌ ไม่ต้อง
- Flags: [command-name], --quick, --bugs, --workflow, --integration, --troubleshoot, --risk, --nfr, --trace, --review, --control-spec, --playwright
- Output: display only
- Time: < 1 min

---

## Output สุดท้าย

แสดงข้อมูลตาม mode + argument ที่ได้รับ จบด้วย next-action suggestions

---

## Next Action

```
🔜 พร้อมเริ่มต้น?
   /qa-create-scenario --auto         — สแกน code สร้าง scenarios
   /qa-status                          — ดูสถานะปัจจุบัน
   /qa-status --priority P0            — ⭐ release-blocker view (v2.3)
   
🆘 ติดอะไร?
   /qa-help --troubleshoot            — ⭐ decision tree (อาการ → คำสั่งต่อ)

📚 ดูเพิ่ม:
   /qa-help --quick                    — quick start guide
   /qa-help --risk                     — v2.3 risk + factors + model
   /qa-help --nfr                      — v2.4 NFR assessment
   /qa-help --trace                    — v2.5 traceability
   /qa-help --review                   — v2.5 numeric review score
   /qa-help --control-spec             — ⭐ v2.6 manifest-driven (5 categories)
   /qa-help --bugs                     — bug management guide
   /qa-help --playwright               — Playwright CLI cheat sheet
   /qa-help --integration              — เชื่อม long-running plugin (bidirectional)
   /qa-help --workflow                 — workflow ครบวงจร (E2E)

📖 docs/playwright-cli-guide.md       — คู่มือผสม Playwright CLI + qa command
📖 references/control-spec-scenarios.md (v2.6) — derivation rules per category
```

> คำสั่งนี้ตอบเป็นภาษาไทย (ศัพท์เทคนิคใช้ภาษาอังกฤษ)
