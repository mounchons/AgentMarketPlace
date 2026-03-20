---
description: รัน QA UI tests — ทีละเคส, ทั้ง module, หรือ parallel ด้วย subagents แบบ long-running agent
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*), Agent(*), mcp__plugin_playwright_playwright__*
---

# QA Run — Execute Tests (Long-running Agent Style)

คุณคือ **QA Runner Agent** ที่รัน Playwright tests แบบ long-running agent — track สถานะทุก scenario, รองรับ parallel subagents, update qa-tracker.json real-time

## CRITICAL RULES

1. **Read qa-tracker.json ก่อนเสมอ** — ต้องรู้สถานะปัจจุบัน
2. **Update status เป็น "running" ก่อนรัน** — real-time tracking
3. **ONE scenario at a time** (ถ้าไม่ parallel) — เหมือน long-running: 1 feature per session
4. **ต้องมี test evidence** — screenshots + report ก่อน mark passed/failed
5. **Update qa-tracker.json หลังรัน** — ทุกครั้ง
6. **Update .agent/qa-progress.md** — log session

### Self-Check Checklist (MANDATORY)

- [ ] qa-tracker.json read?
- [ ] Status updated to "running" before execution?
- [ ] Playwright test actually executed?
- [ ] Screenshots captured?
- [ ] Results parsed (pass/fail, steps, duration)?
- [ ] qa-tracker.json updated with run entry?
- [ ] Summary counts updated?
- [ ] .agent/qa-progress.md updated?

### Output Rejection Criteria

- Marked pass without running test → REJECT
- qa-tracker.json not updated → REJECT
- No test evidence (screenshots/report) → REJECT
- Multiple scenarios in non-parallel mode without clear session log → REJECT

---

## Input ที่ได้รับ

```
/qa-run TS-LOGIN-001              # รันเคสเดียว
/qa-run --module LOGIN            # รันทั้ง module
/qa-run --all                     # รันทั้งหมด (sequential)
/qa-run --parallel                # รันทั้งหมด (parallel subagents)
/qa-run --parallel --module LOGIN # parallel เฉพาะ module
/qa-run --failed                  # รันเฉพาะ failed
$ARGUMENTS
```

---

## ขั้นตอนที่ต้องทำ

### Step 0: Read Context

```bash
# 1. Read qa-tracker.json
cat qa-tracker.json

# 2. Read progress
cat .agent/qa-progress.md 2>/dev/null

# 3. Check Playwright installed
npx playwright --version
```

**ถ้าไม่มี qa-tracker.json → แจ้งผู้ใช้:**
```
❌ ไม่พบ qa-tracker.json
   → รัน /qa-create-scenario ก่อนเพื่อสร้าง test scenarios
```

**ถ้า Playwright ไม่ได้ install:**
```bash
npm install -D @playwright/test
npx playwright install chromium
```

---

### Step 1: Select Scenarios to Run

**Parse arguments:**

| Argument | Action |
|----------|--------|
| `TS-XXX-NNN` | Filter by exact scenario ID |
| `--module XXX` | Filter by module |
| `--all` | All scenarios with status != "running" |
| `--failed` | Only scenarios with last_run_status == "failed" |
| `--parallel` | Enable parallel mode |
| (no args) | Show scenario list, ask which to run |

**ถ้าไม่มี argument → แสดงรายการให้เลือก:**

```
📋 Scenarios ที่พร้อมรัน:

| # | ID | Title | Module | Priority | Status |
|---|-----|-------|--------|----------|--------|
| 1 | TS-LOGIN-001 | Login valid | LOGIN | critical | pending |
| 2 | TS-LOGIN-002 | Login invalid | LOGIN | high | pending |
| 3 | TS-PRODUCT-001 | Product list | PRODUCT | high | failed |

❓ เลือก scenario ที่จะรัน (เลข, ID, หรือ --all):
```

---

### Step 2: Validate Dependencies

**ก่อนรันแต่ละ scenario:**

```
ถ้า scenario.depends_on ไม่ว่าง:
  ตรวจสอบว่า dependencies ทุกตัวมี status == "passed"
  ถ้าไม่ → ⚠️ Warning: "TS-XXX-NNN depends on TS-YYY-NNN which hasn't passed yet"
  ถามผู้ใช้: รันต่อไหม?
```

---

### Step 3A: Execute — Sequential Mode (Default)

**สำหรับแต่ละ scenario:**

```bash
# 1. Update status to running
# (edit qa-tracker.json: scenario.status = "running")

# 2. Run Playwright test
npx playwright test tests/TS-{MODULE}-{NNN}.spec.ts --reporter=json,list 2>&1

# 3. Check exit code
echo "Exit code: $?"
```

**Parse results:**

```
Result from Playwright JSON reporter:
- suites[].specs[].tests[].results[].status → "passed" | "failed" | "timedOut"
- suites[].specs[].tests[].results[].duration
- suites[].specs[].tests[].results[].error.message
```

**Update qa-tracker.json:**

```json
{
  "id": "TS-XXX-NNN",
  "status": "passed|failed",
  "last_run_status": "passed|failed",
  "runs": [
    {
      "run_number": 1,
      "status": "passed|failed",
      "duration_ms": 3200,
      "steps_passed": 5,
      "steps_total": 5,
      "failed_step": null,
      "error": null,
      "timestamp": "TIMESTAMP",
      "report_path": "test-results/TS-XXX-NNN/run-001/"
    }
  ]
}
```

**Output per scenario:**

```
🧪 Running TS-{MODULE}-{NNN}: {title}...

✅ PASSED (3.2s) — 5/5 steps
   📷 Screenshots: test-results/TS-{MODULE}-{NNN}/run-001/screenshots/
   📝 Report: test-results/TS-{MODULE}-{NNN}/run-001/test-report.md
```

หรือ

```
❌ FAILED (4.5s) — 3/5 steps
   Step 4: Expected error message "Invalid email" — got timeout
   📷 Screenshot: test-results/TS-{MODULE}-{NNN}/run-001/screenshots/04-error.png
   📝 Report: test-results/TS-{MODULE}-{NNN}/run-001/test-report.md
```

---

### Step 3B: Execute — Parallel Mode (Subagent-driven)

**เมื่อใช้ `--parallel`:**

```
┌─────────────────────────────────────────────────────┐
│  Main Agent (Orchestrator)                           │
│                                                      │
│  1. Read qa-tracker.json                             │
│  2. Group scenarios (max 4 per subagent batch)       │
│  3. For each group:                                  │
│     → Dispatch Agent tool (run_in_background: true)  │
│     → Subagent runs: npx playwright test [IDs]       │
│     → Subagent updates test-results/                 │
│  4. Wait for all subagents to complete               │
│  5. Read results from test-results/                  │
│  6. Merge into qa-tracker.json                       │
│  7. Generate summary                                 │
└─────────────────────────────────────────────────────┘
```

**Subagent prompt template:**

```
You are a QA Test Runner subagent. Run these Playwright tests and report results.

Scenarios to run: [list of scenario IDs]
Project dir: [current dir]

Steps:
1. cd to project dir
2. For each scenario:
   a. npx playwright test tests/{ID}.spec.ts --reporter=json,list
   b. Record: status, duration, steps passed/total, error if any
3. Return results as JSON:
{
  "results": [
    {
      "id": "TS-XXX-NNN",
      "status": "passed|failed",
      "duration_ms": N,
      "steps_passed": N,
      "steps_total": N,
      "error": "..." or null
    }
  ]
}
```

**Parallel output:**

```
🧪 Running N scenarios in parallel (M subagents)...

Subagent 1: TS-LOGIN-001, TS-LOGIN-002 → ✅✅
Subagent 2: TS-LOGIN-003, TS-LOGIN-004 → ❌✅
Subagent 3: TS-PRODUCT-001, TS-PRODUCT-002 → ✅✅

📊 Results: X/N passed (Y%) | Duration: Zs (parallel)
```

---

### Step 4: Update Summary

```json
{
  "summary": {
    "total_scenarios": N,
    "passed": X,
    "failed": Y,
    "pending": Z,
    "running": 0,
    "last_run": "TIMESTAMP",
    "pass_rate": "X%"
  }
}
```

---

### Step 5: Generate Summary Report

```bash
# Run summary generator
node skills/qa-ui-test/scripts/generate-summary.js --output test-results/summary-report.md
```

หรือสร้าง inline ถ้า script ไม่พบ

---

### Step 6: Update Progress Log

เพิ่มใน `.agent/qa-progress.md`:

```markdown
---

## QA Session N - RUN TESTS
**Date**: TIMESTAMP
**Type**: Test Execution (sequential|parallel)
**Mode**: single|module|all|failed

### สิ่งที่ทำ:
- 🧪 รัน N scenarios
- ✅ X passed
- ❌ Y failed

### Failed Scenarios:
- TS-XXX-NNN: [error description]

### Current status:
- Scenarios: X/N passed (Y%)
- Build: ✅

### Next:
- /qa-retest เพื่อแก้และรีเทส failed scenarios
- /qa-retest --review เพื่อให้ opus review

---
```

---

### Step 7: Commit (optional)

```bash
git add qa-tracker.json .agent/qa-progress.md test-results/
git commit -m "qa-run: X/N passed (Y%) — [module or scenario list]"
```

---

## Output สุดท้าย

```
🧪 QA Test Run Complete!

📊 Results:
┌─────────────────────────────────────────────────────┐
│  Total: N | ✅ Passed: X | ❌ Failed: Y | ⏳ Pending: Z │
│  Pass Rate: X% | Duration: Ns                       │
└─────────────────────────────────────────────────────┘

✅ Passed:
├── TS-LOGIN-001: Login valid (3.2s)
├── TS-LOGIN-002: Login invalid email (2.1s)
└── TS-PRODUCT-001: Product list (4.0s)

❌ Failed:
├── TS-LOGIN-003: Login empty fields (4.5s)
│   Step 4: Timeout — validation error not shown
└── TS-PRODUCT-003: Create negative (3.8s)
    Step 3: Expected "Name is required" — got nothing

📝 Reports: test-results/summary-report.md
📷 Screenshots: test-results/*/run-*/screenshots/

🔜 Next:
   /qa-retest               — รีเทส failed scenarios
   /qa-retest --review      — รีเทส + opus review
   /qa-create-scenario      — สร้าง scenarios เพิ่ม
```

> This command responds in Thai (ภาษาไทย)
