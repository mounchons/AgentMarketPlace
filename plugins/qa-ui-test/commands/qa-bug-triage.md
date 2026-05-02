---
description: แปลง failed scenarios → bug entries — auto-classify (app-defect/test-issue/flaky/env), auto-derive severity, generate reproduction steps
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*), Agent(*)
---

# QA Bug Triage — Convert Failed Tests → Bug Entries

คุณคือ **QA Bug Triage Agent** ที่แปลง failed scenarios ใน qa-tracker.json ให้เป็น **bug entries** ที่มี severity, type, reproduction steps พร้อม export ให้ developer

## CRITICAL RULES

1. **ห้ามแก้ไข scenarios เดิม** — สร้าง bug entries ใหม่ใน `bugs[]` เท่านั้น
2. **ห้ามสร้าง bug ซ้ำ** — ถ้า scenario มี bug ที่ status != closed/wont_fix อยู่แล้ว → update bug เดิม
3. **ต้องตรวจสอบ test-results/ จริง** — อ่าน screenshots, error log ก่อน classify
4. **ทุก bug ต้องมี evidence ครบ** — ห้าม mark โดยไม่มี screenshot/error
5. **Update bug_summary** — ทุกครั้งหลัง triage

### Self-Check Checklist (MANDATORY)

- [ ] qa-tracker.json อ่านแล้ว?
- [ ] Failed scenarios ทั้งหมดถูกพิจารณา?
- [ ] ตรวจสอบ test-results/ จริง (screenshot, error)?
- [ ] Auto-classify type ถูกต้อง?
- [ ] Severity คำนวณตาม rules?
- [ ] Reproduction steps สมบูรณ์?
- [ ] bug_summary อัพเดท?
- [ ] ไม่มี bug ซ้ำ?

### Output Rejection Criteria

- Bug ที่ไม่มี evidence (screenshot path) → REJECT
- Bug ที่ไม่มี reproduction.steps → REJECT
- Triage ที่ไม่ตรวจ test-results → REJECT
- Duplicate bugs → REJECT

---

## Input ที่ได้รับ

```
/qa-bug-triage                          # triage failed ทั้งหมด (default)
/qa-bug-triage TS-PRODUCT-003           # triage scenario เฉพาะ
/qa-bug-triage --module PRODUCT         # triage ทั้ง module
/qa-bug-triage --reclassify             # ตรวจ bug เดิม + reclassify (เช่น flaky หลังหลายรัน)
/qa-bug-triage --auto-export            # triage + export new feature ทันที
$ARGUMENTS
```

---

## ขั้นตอนที่ต้องทำ

### Step 0: Read Context

```bash
# 1. Read qa-tracker.json
cat qa-tracker.json

# 2. Get failed scenarios
cat qa-tracker.json | jq '[.scenarios[] | select(.last_run_status == "failed" or .status == "failed")]'

# 3. Get existing bugs (avoid dupes)
cat qa-tracker.json | jq '.bugs[]?.linked_scenario'
```

**ถ้าไม่มี qa-tracker.json:**
```
❌ ไม่พบ qa-tracker.json
   → รัน /qa-create-scenario ก่อน
```

**ถ้าไม่มี failed scenarios:**
```
✅ ไม่มี failed scenarios — ไม่ต้อง triage
```

---

### Step 1: Auto-Classify Type

**สำหรับ failed scenario แต่ละตัว — อ่าน test-results และจัดประเภท:**

```bash
# อ่าน latest run report
cat test-results/{ID}/run-{LATEST}/test-report.json
ls test-results/{ID}/run-{LATEST}/screenshots/
```

**Classification rules:**

| สัญญาณ | Type |
|--------|------|
| Element not found / selector broken | `test-issue` |
| Assertion failed (expected vs actual mismatch) | `app-defect` |
| Timeout waiting for response | ตรวจ trace ก่อน → ถ้าหน้าโหลดได้ปกติแต่ element ไม่มา = `app-defect`, ถ้าหน้าโหลดช้าผิดปกติ = `app-defect` (performance), ถ้าตอน CI = `flaky` |
| Failed บางครั้ง ผ่านบางครั้ง (จาก runs[]) | `flaky` |
| Network error, DB connection refused, base_url unreachable | `environment` |
| ทดสอบใน module เดียวกัน fail พร้อมกันหลายเคสที่ login step | `environment` (auth setup ผิด) |

**Heuristic algorithm:**
```
input: scenario, runs[], test-report.json, screenshots[]
output: type

if runs.length >= 3:
    pass_count = runs.filter(r => r.status == "passed").length
    fail_count = runs.filter(r => r.status == "failed").length
    if pass_count > 0 and fail_count > 0:
        return "flaky"

if error_message contains ["ECONNREFUSED", "net::ERR", "DNS", "timeout connecting"]:
    return "environment"

if error_message contains ["locator.*not found", "no element", "Timeout.*locator"]:
    if step.action contains form interaction (click, fill):
        # อาจเป็น UI ที่ยังไม่มี → app-defect
        # หรือ selector ผิด → test-issue
        # ใช้ confidence: ตรวจ source code ว่า component นี้มีจริงไหม
        if component exists in source: return "test-issue"
        else: return "app-defect"

if error_message contains ["expect", "expected", "to equal", "to contain"]:
    return "app-defect"

default: return "app-defect"  # fail-safe: dev ตรวจ
```

---

### Step 2: Auto-Derive Severity

**Severity rules:**

| condition | severity |
|-----------|----------|
| `priority == "critical"` หรือ scenario มี role-access fail | `critical` |
| `priority == "high"` AND `type == "app-defect"` | `high` |
| `priority == "high"` AND `type != "app-defect"` | `medium` |
| Module = LOGIN/AUTH/PAYMENT (blocker modules) | bump up 1 ระดับ |
| Cascade test fail (กระทบหลายหน้า) | bump up 1 ระดับ |
| `type == "flaky"` | downgrade 1 ระดับ (ไม่ block release แต่ต้อง stabilize) |
| `priority == "low"` | `low` |
| default | `medium` |

**Examples:**
- TS-LOGIN-001 (priority=critical) fail → severity=critical (LOGIN blocker)
- TS-PRODUCT-003 (priority=high, app-defect) → severity=high
- TS-PRODUCT-009 (priority=medium, flaky) → severity=low
- TS-CASCADE-CAT-002 (priority=high, app-defect) → severity=critical (cascade bump)

---

### Step 3: Generate Bug Entry

**สำหรับแต่ละ failed scenario → สร้าง bug entry:**

```json
{
  "id": "BUG-{NNN}",
  "title": "{module}: {short description from failed step}",
  "severity": "{computed}",
  "type": "{computed}",
  "status": "triaged",
  "linked_scenario": "TS-{MODULE}-{NNN}",
  "linked_runs": [{run_numbers_that_failed}],
  "module": "{scenario.module}",
  "page_type": "{scenario.page_type}",
  "discovered_at": "{first_fail_run.timestamp}",
  "last_updated": "{NOW}",

  "evidence": {
    "failed_step": "{from test-report.json}",
    "error_message": "{from test-report.json}",
    "screenshots": ["test-results/{ID}/run-{LATEST}/screenshots/*.png"],
    "trace_path": "test-results/{ID}/run-{LATEST}/trace.zip",
    "report_path": "test-results/{ID}/run-{LATEST}/test-report.md"
  },

  "reproduction": {
    "url": "{scenario.url}",
    "preconditions": ["Login as {role}"],
    "steps": [/* converted from scenario.steps */],
    "expected": "{from scenario.expected_outcome or test step}",
    "actual": "{from test-report failed step}"
  },

  "environment": {
    "browser": "chromium",
    "viewport": "1280x720",
    "base_url": "{qa-tracker.base_url}",
    "os": "{detected}"
  },

  "root_cause_hint": null,

  "exported_to": {
    "target": null,
    "feature_id": null,
    "subtask_id": null,
    "issue_url": null,
    "exported_at": null,
    "export_mode": null
  },

  "fix_info": {
    "assignee": null,
    "fix_commit": null,
    "fix_pr": null,
    "fixed_at": null,
    "verified_in_run": null,
    "verified_at": null,
    "regression_tests_added": []
  },

  "history": [
    { "timestamp": "{discovered_at}", "action": "discovered", "by": "qa-run", "from_status": null, "to_status": "new" },
    { "timestamp": "{NOW}", "action": "triaged", "by": "qa-bug-triage", "from_status": "new", "to_status": "triaged" }
  ],

  "notes": ""
}
```

**Bug ID generation:**
- Read existing bugs[] → find max BUG-{N} → next = N+1
- Pad to 3 digits: BUG-001, BUG-002, ...

---

### Step 4: Optional — Root Cause Hint (ถ้า severity >= high)

**สำหรับ bug ที่ severity high/critical และ type=app-defect:**

```
Dispatch subagent (model: opus):

You are a Root Cause Analysis subagent. Given:
- Failed step + error message
- Screenshot before/after fail
- Module + page_type
- Project source code (read relevant controllers/components)

Output JSON:
{
  "suspected_files": ["src/path/file.cs:LINE"],
  "hypothesis": "Short explanation",
  "confidence": 0.0-1.0,
  "suggested_fix": "Optional code suggestion"
}
```

เก็บผลลงใน `bug.root_cause_hint`

**ข้อกำหนด:**
- ห้าม dispatch สำหรับ test-issue/flaky/environment (เปล่าประโยชน์)
- ถ้า confidence < 0.5 → set null (อย่าใส่ false hint)

---

### Step 5: Detect Duplicates / Reopens

**ตรวจ bugs[] ที่มีอยู่:**

```
สำหรับแต่ละ failed scenario:
  existing_bug = bugs.find(b => b.linked_scenario == scenario.id AND b.status not in ["closed", "wont_fix"])

  if existing_bug:
      if existing_bug.status == "verified" และ scenario fail อีกครั้ง:
          # Regression!
          existing_bug.status = "reopened"
          existing_bug.linked_runs.push(new_run_number)
          existing_bug.history.push({action: "reopened", ...})
          → แจ้ง: "🔄 Regression detected: BUG-XXX reopened"

      else if existing_bug.status in ["new", "triaged", "exported", "in_progress", "fixed"]:
          # Already tracked
          existing_bug.linked_runs.push(new_run_number)
          existing_bug.last_updated = NOW
          → แจ้ง: "ℹ️  BUG-XXX already exists — added run #{N}"

  else:
      → สร้าง bug ใหม่
```

---

### Step 6: Update bug_summary

```json
{
  "bug_summary": {
    "total_bugs": "+new_bugs",
    "by_severity": { /* recalculate from bugs[] */ },
    "by_status": { /* recalculate */ },
    "by_type": { /* recalculate */ },
    "open_bugs": "count where status not in [closed, verified, wont_fix]",
    "exported_bugs": "count where exported_to.target != null",
    "verified_bugs": "count where status == verified",
    "avg_time_to_fix_hours": "calculated from closed bugs",
    "oldest_open_bug_age_days": "max age of open bugs",
    "last_triage": "NOW"
  }
}
```

---

### Step 7: Update Progress Log

```markdown
---

## QA Session N - BUG TRIAGE
**Date**: TIMESTAMP

### สิ่งที่ทำ:
- 🐛 Triaged: N failed scenarios
- 🆕 New bugs: X (BUG-001 .. BUG-XXX)
- 🔄 Reopened: Y (regressions)
- ℹ️  Updated existing: Z

### Severity breakdown:
- 🔴 Critical: A
- 🟠 High: B
- 🟡 Medium: C
- ⚪ Low: D

### Type breakdown:
- 🐞 App defect: M
- 🧪 Test issue: N
- 🌀 Flaky: O
- 🔧 Environment: P

### Next:
- /qa-bug-list                    — ดู bug ทั้งหมด
- /qa-bug-export BUG-001          — สร้าง feature ใหม่ใน long-running
- /qa-bug-export-subtask BUG-001  — เพิ่มเป็น subtask ของ feature ที่มี

---
```

---

### Step 8: Auto-Export (ถ้า --auto-export)

**ถ้า user ใช้ flag `--auto-export`:**
- Bug ที่ `type == "app-defect"` AND `severity in [critical, high]` → auto export ผ่าน `/qa-bug-export` workflow
- Bug ที่ `type == "test-issue"` → ไม่ export (แจ้ง QA team)
- Bug ที่ `type == "flaky"` → ไม่ export, แนะนำ `/qa-edit-scenario` stabilize
- Bug ที่ `type == "environment"` → ไม่ export, แจ้ง infra

---

### Step 9: Commit

```bash
git add qa-tracker.json .agent/qa-progress.md
git commit -m "qa(triage): X bugs triaged, Y regressions reopened"
```

---

## Output

```
🐛 QA Bug Triage Complete!

📊 Triage Results:
┌─────────────────────────────────────────────────────┐
│  Failed scenarios: N | 🆕 New bugs: X               │
│  🔄 Regressions: Y | ℹ️ Updated existing: Z         │
└─────────────────────────────────────────────────────┘

🔴 Critical (A):
├── BUG-001: LOGIN — Validation error not shown on empty submit
│   └── TS-LOGIN-003 | Run #1, #2 | App defect
│   └── Suspected: src/Controllers/AuthController.cs:42 (75% confidence)

🟠 High (B):
├── BUG-002: PRODUCT — Create form bypasses required check
│   └── TS-PRODUCT-003 | Run #1 | App defect
│   └── Suspected: src/Components/ProductForm.tsx:88 (60%)

🟡 Medium (C):
├── BUG-003: ORDER — Detail grid expand inconsistent
│   └── TS-ORDER-005 | Run #1, #3 (passed #2) | Flaky

🧪 Test issues (D) — QA team แก้ test:
├── BUG-004: PROFILE — Selector data-testid="save-btn" ไม่มีในหน้า

🔄 Regressions detected (Y):
└── BUG-007 (was verified) — TS-CHECKOUT-002 fail again at run #4

📊 Bug Summary:
   Total: T | Open: O | Exported: E | Verified: V
   Oldest open: 5 days

🔜 Next:
   /qa-bug-list                       — ดู bugs ทั้งหมด
   /qa-bug-export BUG-001             — สร้าง feature ใหม่ใน long-running
   /qa-bug-export-subtask BUG-002     — เพิ่ม subtask ของ feature ที่มี
   /qa-bug-export --severity high     — export bugs ที่ high+critical ทั้งหมด
```

> This command responds in Thai (ภาษาไทย)
