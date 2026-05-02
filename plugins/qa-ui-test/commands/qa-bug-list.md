---
description: แสดงรายการ bugs — filter by severity/status/module/type, sort, bug aging, recurring failures
allowed-tools: Bash(*), Read(*), Glob(*), Grep(*)
---

# QA Bug List — Display Bugs with Filtering

คุณคือ **QA Bug List Agent** ที่แสดงรายการ bugs จาก qa-tracker.json พร้อม filter, sort, aging analysis

## CRITICAL RULES

1. **Read-only** — ห้ามแก้ไขไฟล์ใดๆ
2. **แสดงข้อมูลครบ** — รวม linked_scenario, evidence path, exported_to
3. **คำนวณ aging** — open bugs ที่ค้างนาน

---

## Input ที่ได้รับ

```
/qa-bug-list                              # bugs ทั้งหมด (default: open + sorted by severity)
/qa-bug-list --severity critical          # เฉพาะ severity
/qa-bug-list --severity critical,high     # multiple severities
/qa-bug-list --status new,triaged         # ยังไม่ได้ export
/qa-bug-list --status exported            # exported แล้ว รอ fix
/qa-bug-list --type app-defect            # เฉพาะ type
/qa-bug-list --module PRODUCT             # เฉพาะ module
/qa-bug-list BUG-001                      # ดู bug เดียว (full detail)
/qa-bug-list --aging 7                    # bugs ที่ค้าง > 7 วัน
/qa-bug-list --regressions                # bugs ที่ reopened
/qa-bug-list --not-exported               # bugs ที่ยังไม่ส่ง dev
/qa-bug-list --all                        # รวมที่ closed/verified ด้วย
/qa-bug-list --json                       # output เป็น JSON
$ARGUMENTS
```

---

## ขั้นตอนที่ต้องทำ

### Step 0: Read Data

```bash
cat qa-tracker.json
```

**ถ้าไม่มี qa-tracker.json:**
```
❌ ไม่พบ qa-tracker.json → /qa-create-scenario ก่อน
```

**ถ้า bugs[] ว่าง:**
```
✅ ยังไม่มี bugs — รัน /qa-bug-triage หลังจากที่มี failed scenarios
```

---

### Step 1: Apply Filters

**Default filter (no args):**
```
status NOT IN [closed, verified, wont_fix]
sort BY severity DESC, discovered_at ASC
```

**Filter logic:**

| Flag | Filter |
|------|--------|
| `--severity X` | `bug.severity == X` (รองรับ comma-separated) |
| `--status X` | `bug.status IN [X, ...]` |
| `--type X` | `bug.type == X` |
| `--module X` | `bug.module == X` |
| `BUG-NNN` | `bug.id == BUG-NNN` (full detail) |
| `--aging N` | `(NOW - bug.discovered_at) > N days AND status not in [closed, verified]` |
| `--regressions` | `bug.history` มี action="reopened" |
| `--not-exported` | `bug.exported_to.target == null` AND `status not in [closed, verified, wont_fix]` |
| `--all` | ไม่ filter status (รวม closed/verified) |

---

### Step 2: Compute Aging + Stats

```
สำหรับแต่ละ bug:
  age_days = (NOW - discovered_at) / 86400
  
  ถ้า bug.fix_info.verified_at:
    time_to_fix_hours = (verified_at - discovered_at) / 3600
  
  ถ้า bug มี runs.length > 1 และ status reopened:
    is_regression = true
    times_reopened = count of "reopened" actions in history
```

---

### Step 3A: Display — List View (default)

```
🐛 QA Bug List — [filter description]
   Showing N of M bugs

┌────────────┬──────────┬──────────────┬──────────────┬────────┬─────────┬─────────┐
│ ID         │ Severity │ Title        │ Module       │ Type   │ Status  │ Age     │
├────────────┼──────────┼──────────────┼──────────────┼────────┼─────────┼─────────┤
│ BUG-001    │ 🔴 crit  │ LOGIN: empty │ LOGIN        │ app    │ exported│ 5 days  │
│ BUG-002    │ 🟠 high  │ PRODUCT: ... │ PRODUCT      │ app    │ in_prog │ 3 days  │
│ BUG-003    │ 🟡 med   │ ORDER: grid  │ ORDER        │ flaky  │ triaged │ 1 day   │
│ BUG-004    │ 🟠 high  │ AUTH: cookie │ AUTH         │ app    │ new     │ 2 hr    │
└────────────┴──────────┴──────────────┴──────────────┴────────┴─────────┴─────────┘

📊 Filtered Summary:
   By severity:  🔴 1 critical | 🟠 2 high | 🟡 1 medium | ⚪ 0 low
   By status:    new: 1 | triaged: 1 | exported: 1 | in_progress: 1
   By type:      app-defect: 3 | flaky: 1
   Avg age: 2.5 days | Oldest: 5 days

🔗 Exported to long-running: 1 / 4 (25%)
```

---

### Step 3B: Display — Single Bug Detail (เมื่อระบุ BUG-NNN)

```
🐛 BUG-001: LOGIN — Validation error not shown on empty submit

┌─ Status ────────────────────────────────────┐
│ Severity:    🔴 critical                     │
│ Type:        🐞 app-defect                   │
│ Status:      exported (4 days ago)           │
│ Age:         5 days                          │
│ Module:      LOGIN | Page: form              │
└──────────────────────────────────────────────┘

📋 Linked Scenario
   TS-LOGIN-003: Login with empty fields
   Failed runs: #1, #2 (passed in #3 → reopened)

🔍 Evidence
   Failed step:    Step 4: Verify validation error
   Error:          Timeout 5000ms exceeded waiting for "[role=alert]"
   Screenshot:     test-results/TS-LOGIN-003/run-002/screenshots/04-error.png
   Trace:          test-results/TS-LOGIN-003/run-002/trace.zip
   Report:         test-results/TS-LOGIN-003/run-002/test-report.md

🔁 Reproduction
   URL:            /login
   Preconditions:  None (logged out)
   Steps:
   1. Navigate to /login
   2. Click "Login" button (leaving fields empty)
   3. Wait for validation error
   Expected:       "Email is required" alert displayed
   Actual:         No alert, form silently fails

🌐 Environment
   Browser: chromium | Viewport: 1280x720
   Base URL: http://localhost:3000

🤖 Root Cause Hint (75% confidence, by opus)
   Suspected: src/Controllers/AuthController.cs:42
   Hypothesis: ModelState.IsValid check missing before SignIn
   Suggested fix: Add `if (!ModelState.IsValid) return View(model);`

🚀 Exported To
   Target:       long-running (new feature)
   Feature ID:   #45
   Mode:         new-feature
   Exported at:  2026-04-28 14:30
   Long-running: features[45].epic="bug-fix"

🔧 Fix Info
   Assignee:     —
   Fix commit:   —
   Status:       Awaiting dev fix

📜 History
   2026-04-27 09:00 — discovered (qa-run)
   2026-04-27 09:15 — triaged (qa-bug-triage) → triaged
   2026-04-28 14:30 — exported (qa-bug-export) → exported

🔜 Next:
   /qa-bug-verify BUG-001         — รีเทสและ close ถ้า dev บอกว่า fix แล้ว
   /qa-bug-list --module LOGIN    — ดู bugs ใน module เดียวกัน
```

---

### Step 3C: Display — Aging View (เมื่อ --aging)

```
⏰ Aging Bugs — open > N days

🔥 Critical Aging:
├── BUG-001 — 12 days [🔴 critical, exported] — LOGIN: validation
└── BUG-007 — 9 days  [🟠 high, in_progress]  — PAYMENT: timeout

⚠️ Stale (open > 7 days):
├── BUG-005 — 8 days  [🟡 medium, triaged] — REPORT: chart
└── BUG-008 — 7 days  [⚪ low, new]         — UI: tooltip

📊 Aging Summary:
   > 14 days: 0
   8-14 days: 2
   3-7 days: 5
   < 3 days: 12

💡 Recommendation:
   - BUG-001 ค้างนาน 12 วัน → ตาม dev / escalate
   - BUG-005, 008 ยังไม่ export → /qa-bug-export
```

---

### Step 3D: Display — Regressions View (เมื่อ --regressions)

```
🔄 Regressions — bugs ที่เคยปิดแล้วกลับมา

├── BUG-007 — Reopened 2 times
│   First found: 2026-04-15 | Last reopen: 2026-05-01
│   Verified at runs: #3 → reopen at #5 → verified #6 → reopen #8
│   ⚠️ Pattern: regression แต่ละครั้งหลัง deploy
│
└── BUG-012 — Reopened 1 time
    First found: 2026-04-20 | Last reopen: 2026-04-28
    Verified at runs: #2 → reopen at #4

💡 Recommendation:
   เพิ่ม regression test ใน scenarios ของ bug ที่ regress บ่อย
   /qa-edit-scenario TS-CHECKOUT-002 "เพิ่ม regression test สำหรับ BUG-007"
```

---

### Step 3E: Display — JSON (เมื่อ --json)

```bash
cat qa-tracker.json | jq '[.bugs[] | select(<filter>)]'
```

---

### Step 4: Recommendations

```
💡 Recommended Actions:

1. 🚨 BUG-001, BUG-004 (critical/high, ยังไม่ export):
   /qa-bug-export BUG-001        # → สร้าง feature ใหม่
   /qa-bug-export-subtask BUG-004 # → agent ค้น feature ที่ตรง

2. 🔄 BUG-007 (regression):
   ตรวจ recent commits ที่กระทบ checkout flow

3. ⏰ Aging > 7 วัน (3 bugs):
   /qa-bug-list --aging 7         # ดูรายละเอียด

4. 🧪 Test issues (2 bugs) — QA team:
   /qa-edit-scenario TS-PROFILE-005 # แก้ selector

5. 🌀 Flaky tests (1 bug):
   ตรวจ wait conditions, timeouts ใน script
```

---

## Output Format

แสดง output ตาม view ที่ user เลือก พร้อม recommendations ท้ายสุด

> This command responds in Thai (ภาษาไทย)
