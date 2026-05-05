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

# Risk-based filters (v2.3 — ใช้ bug.scenario_risk_snapshot)
/qa-bug-list --priority P0                # bugs จาก P0 scenarios (release blockers)
/qa-bug-list --priority P0,P1             # P0 + P1 (must-fix-first)
/qa-bug-list --factor state-machine       # bugs ที่ scenario มี factor นี้
/qa-bug-list --factor cascade-deep,security-flow  # หลาย factors (OR)
/qa-bug-list --release-blockers           # alias = --priority P0 + status open
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
| `--priority P0[,P1...]` | `bug.scenario_risk_snapshot.priority IN [...]` — fallback to legacy `priority` ถ้าไม่มี snapshot |
| `--factor NAME[,NAME]` | `bug.scenario_risk_snapshot.factors` intersects [...] (OR) |
| `--release-blockers` | shorthand: `--priority P0` AND `status NOT IN [closed, verified, wont_fix]` |

**Combination:** flags AND together; comma-values within flag OR.

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

┌──────────┬──────────┬───────────────┬─────────┬──────┬──────────────────┬────────┬─────────┬───────┐
│ ID       │ Severity │ Title         │ Module  │ Risk │ Factors          │ Type   │ Status  │ Age   │
├──────────┼──────────┼───────────────┼─────────┼──────┼──────────────────┼────────┼─────────┼───────┤
│ BUG-001  │ 🔴 crit  │ LOGIN: empty  │ LOGIN   │ P0/9 │ security-flow    │ app    │ exported│ 5 d   │
│ BUG-005  │ 🔴 crit  │ ORDER: state  │ ORDER   │ P0/7 │ state-machine    │ app    │ in_prog │ 3 d   │
│ BUG-002  │ 🟠 high  │ PRODUCT: req  │ PRODUCT │ P1/6 │ —                │ app    │ in_prog │ 3 d   │
│ BUG-003  │ 🟡 med   │ ORDER: grid   │ ORDER   │ P1/6 │ master-detail-s. │ flaky  │ triaged │ 1 d   │
│ BUG-004  │ 🟠 high  │ AUTH: cookie  │ AUTH    │ P0/9 │ security-flow    │ app    │ new     │ 2 hr  │
│ BUG-008  │ ⚪ low   │ FOOTER: link  │ DASH    │ P3/2 │ —                │ app    │ new     │ 1 d   │
└──────────┴──────────┴───────────────┴─────────┴──────┴──────────────────┴────────┴─────────┴───────┘

📊 Filtered Summary:
   By severity:    🔴 2 critical | 🟠 2 high | 🟡 1 medium | ⚪ 1 low
   By risk:        🔴 P0: 3  |  🟠 P1: 2  |  🟡 P2: 0  |  🟢 P3: 1
   By factor:      security-flow: 2 | state-machine: 1 | master-detail-sync: 1 | (no factor): 2
   By status:      new: 2 | triaged: 1 | exported: 1 | in_progress: 2
   By type:        app-defect: 5 | flaky: 1
   Avg age: 2.2 days | Oldest: 5 days

🚨 Release Blockers (P0 + open): 3 bugs (BUG-001, BUG-004, BUG-005) — must fix before release
🔗 Exported to long-running: 2 / 6 (33%)
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

🎯 Scenario Risk Snapshot (frozen at fail-time)
┌───────────────────────────────────────────────────┐
│ Priority:           P0 (score 9 = likely × crit)  │
│ Complexity factors: [security-flow]               │
│ Scenario model:     opus                          │
│ Severity rationale: P0 base + security-flow bump  │
│                     + LOGIN blocker module        │
│ 🚨 RELEASE BLOCKER                                 │
└───────────────────────────────────────────────────┘

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

🔥 Critical Aging (P0 release-blockers):
├── BUG-001 — 12 days [🔴 crit, P0/9, security-flow, exported] — LOGIN: validation
└── BUG-007 — 9 days  [🟠 high, P0/9, multi-step, in_progress]  — PAYMENT: timeout

⚠️ Stale (open > 7 days):
├── BUG-005 — 8 days  [🟡 med,  P1/6, —, triaged] — REPORT: chart
└── BUG-008 — 7 days  [⚪ low,  P3/2, —, new]     — UI: tooltip

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

1. 🚨 Release blockers (3 P0 bugs ยังไม่ปิด):
   /qa-bug-list --release-blockers     # ดูทั้งหมด
   /qa-bug-export --priority P0        # ส่งไป long-running ทั้งหมด

2. 🔴 Critical/High ยังไม่ export (BUG-001, BUG-004):
   /qa-bug-export BUG-001              # → สร้าง feature ใหม่
   /qa-bug-export-subtask BUG-004      # → agent ค้น feature ที่ตรง

3. 🧩 Bugs ที่ scenario มี state-machine factor (1 bug):
   /qa-bug-list --factor state-machine # ดูรายละเอียด — ต้อง regression test ครอบ all states

4. 🔄 BUG-007 (regression):
   ตรวจ recent commits ที่กระทบ checkout flow

5. ⏰ Aging > 7 วัน (3 bugs):
   /qa-bug-list --aging 7              # ดูรายละเอียด

6. 🧪 Test issues (2 bugs) — QA team:
   /qa-edit-scenario TS-PROFILE-005    # แก้ selector

7. 🌀 Flaky tests (1 bug):
   ตรวจ wait conditions, timeouts ใน script
```

---

## Output Format

แสดง output ตาม view ที่ user เลือก พร้อม recommendations ท้ายสุด

> This command responds in Thai (ภาษาไทย)
