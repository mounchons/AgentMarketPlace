---
description: ดูสถานะภาพรวม QA UI tests — scenarios, pass rate, module breakdown, pending, failed, review status
allowed-tools: Bash(*), Read(*), Glob(*), Grep(*)
---

# QA Status — ดูสถานะภาพรวม

คุณคือ **QA Status Agent** ที่แสดงสถานะภาพรวมของ QA UI tests จาก qa-tracker.json

## CRITICAL RULES

1. **Read-only** — ห้ามแก้ไขไฟล์ใดๆ
2. **แสดงข้อมูลครบ** — summary, modules, failed details, review status, recent sessions

---

## Input ที่ได้รับ

```
/qa-status                          # ภาพรวมทั้งหมด (รวม bugs)
/qa-status --module LOGIN           # เฉพาะ module
/qa-status --failed                 # เฉพาะ failed
/qa-status --review                 # สถานะ review
/qa-status --bugs                   # focus bug management view

# Risk-based filters (v2.3 / schema 1.6)
/qa-status --priority P0            # เฉพาะ P0 — release-blocker view
/qa-status --priority P0,P1         # P0 + P1 (must-pass + should-pass)
/qa-status --priority critical      # legacy alias = P0
/qa-status --model opus             # เฉพาะที่ assigned opus (เคสยาก)
/qa-status --model haiku            # เฉพาะ haiku (P3 trivial)
/qa-status --factor state-machine   # เฉพาะที่มี complexity factor นี้
/qa-status --factor cascade-deep,security-flow  # หลาย factors (OR)
$ARGUMENTS
```

---

## ขั้นตอนที่ต้องทำ

### Step 1: Read Data

```bash
# Read qa-tracker.json
cat qa-tracker.json

# Read recent progress
tail -50 .agent/qa-progress.md 2>/dev/null

# Count test files
ls tests/TS-*.spec.ts 2>/dev/null | wc -l
ls test-scenarios/TS-*.md 2>/dev/null | wc -l
```

**ถ้าไม่มี qa-tracker.json:**
```
❌ ไม่พบ qa-tracker.json
   → รัน /qa-create-scenario ก่อนเพื่อเริ่มต้น
```

---

### Step 1b: Parse Filter Arguments (v2.3)

**ก่อนแสดง overview ให้ apply filters ก่อน:**

| Argument | Field ใน scenario | Match |
|---|---|---|
| `--module XXX` | `scenario.module` | exact (case-insensitive) |
| `--failed` | `scenario.last_run_status` | == "failed" |
| `--priority P0,P1` | `scenario.risk.priority` | IN list |
| `--priority critical` | (legacy alias) | map: critical→P0, high→P1, medium→P2, low→P3 |
| `--model opus,sonnet,haiku` | `scenario.assigned_model` | IN list |
| `--factor state-machine,...` | `scenario.complexity_factors` | array intersect (OR) |

**Filter combination rules:**
- ระหว่าง flag = AND (`--priority P0 --model opus` → P0 AND opus)
- ภายใน flag = OR (`--priority P0,P1` → P0 OR P1)
- ถ้า scenario ไม่มี `risk` field (legacy data) → derive จาก `priority` field:
  ```
  critical → P0  |  high → P1  |  medium → P2  |  low → P3
  ```

**ถ้า filter เหลือ 0 scenarios:**
```
🔍 Filter: --priority P0 --model opus
ไม่พบ scenarios ที่ตรง — ลอง:
  /qa-status --priority P0           (ไม่ filter model)
  /qa-status --model opus            (ไม่ filter priority)
```

**ตัวอย่าง output เมื่อใช้ `--priority P0`:**

```
📊 QA UI Test Status — P0 Release-Blocker View

🎯 Filter: priority IN [P0]  (must-pass before release)
🔢 Matched: 18 of 156 scenarios

┌─────────────────────────────────────────────────────┐
│              P0 SUMMARY                              │
├─────────────────────────────────────────────────────┤
│  Total P0:       18                                  │
│  ✅ Passed:      14   ████████████████░░░░  78%     │
│  ❌ Failed:       3   ███░░░░░░░░░░░░░░░░░  17%     │
│  ⏳ Pending:      1   █░░░░░░░░░░░░░░░░░░░   5%     │
│                                                      │
│  🚨 Release Status: ⚠️ NOT READY — 4 P0 ยังไม่ pass  │
└─────────────────────────────────────────────────────┘

P0 Scenarios:
| ID            | Title                  | Risk | Factors           | Model | Status |
|---------------|------------------------|------|-------------------|-------|--------|
| TS-LOGIN-001  | Login + CSRF           | P0/9 | security-flow     | opus  | ✅     |
| TS-CHECKOUT-1 | Checkout 5 steps       | P0/9 | multi-step,m-d    | opus  | ❌     |
| TS-PAYMENT-1  | Stripe webhook retry   | P0/9 | network-mock      | opus  | ✅     |
| TS-ORDER-007  | Status state machine   | P0/7 | state-machine     | opus  | ❌     |
| ...

🚨 P0 Failures (release blockers):
   1. TS-CHECKOUT-1: Step 4 — Stripe redirect timeout
   2. TS-ORDER-007: Step 3 — PAID→SHIPPED transition stuck
   3. TS-PAYMENT-2: Step 5 — Refund amount mismatch
```

---

### Step 2: Display Overview

```
📊 QA UI Test Status — [Project Name]
   Base URL: [base_url]
   Last Run: [timestamp]

┌─────────────────────────────────────────────────────┐
│              OVERALL SUMMARY                         │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Total Scenarios: NN                                 │
│                                                      │
│  ✅ Passed:    XX  ██████████████████░░░  XX%        │
│  ❌ Failed:    YY  ████░░░░░░░░░░░░░░░░  YY%        │
│  ⏳ Pending:   ZZ  ██░░░░░░░░░░░░░░░░░░  ZZ%        │
│  🔄 Running:   WW                                    │
│  📦 Deprecated: DD                                   │
│                                                      │
│  Pass Rate: XX% ████████████████████░░░░             │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

### Step 3: Module Breakdown

```
📋 Breakdown by Module (with risk distribution):

| Module   | Total | ✅ | ❌ | ⏳ | Rate | Page Type     | P0 | P1 | P2 | P3 |
|----------|-------|----|----|----|------|---------------|----|----|----|----|
| LOGIN    |   8   |  6 |  1 |  1 |  75% | form          |  3 |  3 |  2 |  0 |
| PRODUCT  |  13   | 10 |  2 |  1 |  77% | master-data   |  2 |  4 |  5 |  2 |
| CATEGORY |  13   | 13 |  0 |  0 | 100% | master-data   |  1 |  3 |  6 |  3 |
| CHECKOUT |   6   |  3 |  2 |  1 |  50% | wizard        |  4 |  2 |  0 |  0 |
| ORDER    |  15   |  8 |  3 |  4 |  53% | master-detail |  3 |  6 |  4 |  2 |

🚨 P0 Status (release blockers):
   LOGIN: 3 P0 → 3 ✅ 0 ❌ 0 ⏳   READY
   CHECKOUT: 4 P0 → 2 ✅ 2 ❌ 0 ⏳  ⚠️ NOT READY (2 P0 failing)
   ORDER: 3 P0 → 2 ✅ 1 ❌ 0 ⏳   ⚠️ NOT READY
```

---

### Step 4: Failed Scenarios Detail

```
❌ Failed Scenarios (Y total) — sorted by risk.priority:

1. TS-CHECKOUT-001: Checkout 5 steps
   Module: CHECKOUT | Risk: P0/9 | Factors: [multi-step, master-detail-sync] | Model: opus | Runs: 2
   Last Error: Step 4 — Stripe redirect timeout
   Last Run: 2026-03-20 14:30
   🚨 RELEASE BLOCKER (P0)
   📷 Screenshot: test-results/TS-CHECKOUT-001/run-002/screenshots/04-error.png

2. TS-ORDER-007: Status state machine
   Module: ORDER | Risk: P0/7 | Factors: [state-machine] | Model: opus | Runs: 1
   Last Error: Step 3 — PAID→SHIPPED transition stuck
   Last Run: 2026-03-20 11:00
   🚨 RELEASE BLOCKER (P0)

3. TS-LOGIN-003: Login with empty fields
   Module: LOGIN | Risk: P1/6 | Factors: — | Model: sonnet | Runs: 2
   Last Error: Step 4 — Timeout waiting for validation error
   Last Run: 2026-03-20 14:30
   📷 Screenshot: test-results/TS-LOGIN-003/run-002/screenshots/04-error.png

4. TS-PRODUCT-003: Create product — negative
   Module: PRODUCT | Risk: P1/6 | Factors: — | Model: sonnet | Runs: 1
   Last Error: Step 3 — Expected "Name is required" — got nothing
   Last Run: 2026-03-20 10:00
```

---

### Step 5: Model Assignment & Review Status

```
🤖 Model Assignment (3-tier risk-based — schema 1.6):
   opus:   X scenarios (P0 + complexity factors / state-machine / cascade-deep / etc.)
   sonnet: Y scenarios (P1-P2 standard CRUD / mid-complexity)
   haiku:  Z scenarios (P3 trivial — pattern-based)

   Top reasons (group by assigned_model_reason):
   • opus  ← state-machine factor present       → 5 scenarios
   • opus  ← multiple complexity factors        → 4 scenarios
   • opus  ← cascade-deep                       → 3 scenarios
   • sonnet ← default mid-complexity            → 89 scenarios
   • haiku ← P3 trivial pattern-based           → 22 scenarios

   💰 Est. cost ratio:  opus ~15x  |  sonnet ~3x  |  haiku ~1x
   → ใช้ /qa-status --model opus เพื่อดูเฉพาะเคสยาก

🔍 Review Status:
   ✅ Reviewed: N scenarios
   ⏳ Awaiting review: M scenarios
   ❌ Review failed: K scenarios
      └── TS-LOGIN-001: Coverage gaps — missing boundary test
```

---

### Step 6: Recent Sessions

```
📝 Recent QA Sessions:

| # | Date | Type | Module | Result |
|---|------|------|--------|--------|
| 5 | 2026-03-20 14:30 | Retest | LOGIN | 1/2 fixed |
| 4 | 2026-03-20 12:00 | Run | PRODUCT | 10/13 passed |
| 3 | 2026-03-20 11:00 | Run | ORDER | 8/15 passed |
| 2 | 2026-03-20 10:00 | Create | PRODUCT | 13 scenarios |
| 1 | 2026-03-20 09:00 | Create | LOGIN | 8 scenarios |
```

---

### Step 6b: Bug Management Summary (NEW)

```
🐛 Bug Management:
┌─────────────────────────────────────────────────────┐
│  Total: T | Open: O | Verified: V | Closed: C       │
│                                                      │
│  By Severity:                                        │
│  🔴 Critical: 2  🟠 High: 5  🟡 Medium: 8  ⚪ Low: 3  │
│                                                      │
│  By Status:                                          │
│  🆕 New: 1  📋 Triaged: 3  🚀 Exported: 6           │
│  🔧 In progress: 4  ✅ Fixed: 2  ✓ Verified: 15     │
│                                                      │
│  By Type:                                            │
│  🐞 App defect: 14  🧪 Test issue: 2                 │
│  🌀 Flaky: 1  🔧 Environment: 1                      │
│                                                      │
│  ⏰ Aging: oldest open bug = 12 days                  │
│  🔗 Exported to long-running: 6 bugs (3 features,    │
│     3 subtasks)                                      │
│  🔄 Regressions: 2 (BUG-001, BUG-007)                │
│  ⚡ Avg time-to-fix: 2.1 hours                        │
└─────────────────────────────────────────────────────┘

🚨 Action needed:
   - 2 critical bugs ยังไม่ export → /qa-bug-export --severity critical
   - 1 bug ค้าง > 7 วัน → /qa-bug-list --aging 7
   - 4 bugs status=fixed รอ verify → /qa-bug-verify --status fixed
```

---

### Step 6c: Bug Detail View (เมื่อ --bugs)

```
🐛 Bug Management — Detailed View

📊 Pipeline (visual):

  failed test     bugs[]        long-running
   scenarios  →   triaged   →   exported     →   verified
                                                      │
                                                      ↓
                                               regression watch

  [40 failed] → [25 triaged] → [12 exported] → [15 verified]
                  ↓ 2 closed       ↓ 4 in_progress
                  ↓ 1 wont_fix     ↓ 2 fixed (รอ verify)

📈 Trends (7 days):
   New bugs:      ████████░░░░  8
   Verified:      ██████████░░  10
   Reopened:      ██░░░░░░░░░░  2
   Net open:      -2 (improving 📉)

🔝 Top modules by bug count:
   1. PRODUCT  — 8 bugs (3 critical)
   2. ORDER    — 6 bugs (1 critical)
   3. CHECKOUT — 4 bugs

🔝 Recurring failures:
   1. TS-CHECKOUT-002 — failed 4 times (regression hotspot)
   2. TS-PRODUCT-009  — flaky (3/5 pass rate)

📦 Export status:
   Method            | Count | Avg time-to-fix
   new-feature       |   8   | 3.2 hours
   subtask           |   4   | 1.8 hours
   not-yet-exported  |   3   | (open avg: 2 days)

🔜 Suggestions:
   /qa-bug-export --severity critical    # 2 critical ยังไม่ส่ง dev
   /qa-bug-verify --status fixed          # 2 bugs รอ verify
   /qa-bug-list --aging 7                 # 1 bug ค้างนาน
```

---

### Step 7: Recommendations

```
💡 Recommended Next Actions:

1. 🔄 /qa-retest --failed          — รีเทส Y failed scenarios
2. 🐛 /qa-bug-triage               — แปลง failed → bugs (X failed ยังไม่ triage)
3. 🚀 /qa-bug-export --severity critical  — ส่ง dev: 2 critical bugs
4. ✓ /qa-bug-verify --status fixed — verify: 2 bugs ที่ dev mark fixed
5. 📝 /qa-create-scenario --module PAYMENT  — ยังไม่มี scenarios
6. ✏️ /qa-edit-scenario TS-ORDER-005 — แก้ไขเคสที่ logic เปลี่ยน
7. 📊 /qa-explain --module ORDER    — ดู test plan flowchart
```

---

### Step 7b: Module-specific Status (ถ้า --module)

```
📊 Module: LOGIN — Detailed Status

| ID            | Title                  | Risk | Factors        | Model  | Status     | Runs | Last Run |
|---------------|------------------------|------|----------------|--------|------------|------|----------|
| TS-LOGIN-001  | Login valid + CSRF     | P0/9 | security-flow  | opus   | ✅ passed  |   2  | 14:30    |
| TS-LOGIN-002  | Login invalid email    | P1/6 | —              | sonnet | ✅ passed  |   1  | 10:00    |
| TS-LOGIN-003  | Login empty fields     | P1/6 | —              | sonnet | ❌ failed  |   2  | 14:30    |
| TS-LOGIN-004  | Login boundary         | P2/4 | —              | sonnet | ✅ passed  |   1  | 10:00    |
| TS-LOGIN-005  | Login SQL injection    | P0/9 | security-flow  | opus   | ✅ passed  |   1  | 10:00    |
| TS-LOGIN-006  | Login XSS attempt      | P0/9 | security-flow  | opus   | ✅ passed  |   1  | 10:00    |
| TS-LOGIN-007  | Login duplicate submit | P2/4 | —              | sonnet | ✅ passed  |   1  | 10:00    |
| TS-LOGIN-008  | Login back navigation  | P3/2 | —              | haiku  | ⏳ pending |   0  | —        |

Run History (recent 5):
├── Run #2 (14:30): 6/8 passed — retest
├── Run #1 (10:00): 5/8 passed — initial
```

---

## Output

แสดง status report ตาม format ด้านบน

> This command responds in Thai (ภาษาไทย)
