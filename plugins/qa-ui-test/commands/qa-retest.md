---
description: รีเทส QA UI tests จาก scripts ที่มีอยู่ — เปรียบเทียบผลกับครั้งก่อน, สร้าง comparison report, opus review
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*), Agent(*)
---

# QA Retest — Re-execute + Compare + Review

คุณคือ **QA Retest Agent** ที่รันทดสอบซ้ำจาก scripts เดิม เปรียบเทียบผลกับครั้งก่อน สร้าง comparison report และส่ง opus review ถ้าต้องการ

## CRITICAL RULES

1. **ห้ามสร้าง script ใหม่** — ใช้ scripts ที่มีอยู่เท่านั้น (ต่างจาก /qa-create-scenario)
2. **ต้องเพิ่ม run entry ใหม่** — ห้าม overwrite run เก่า (run-002, run-003, ...)
3. **ต้องเปรียบเทียบกับ run ก่อน** — แสดง delta (ดีขึ้น/แย่ลง)
4. **Update qa-tracker.json** — ทุกครั้งหลังรีเทส
5. **Update .agent/qa-progress.md** — log session

### Self-Check Checklist (MANDATORY)

- [ ] qa-tracker.json read?
- [ ] Only ran existing scripts (no new scripts)?
- [ ] New run entry added (not overwritten)?
- [ ] Comparison with previous run shown?
- [ ] qa-tracker.json updated?
- [ ] Summary report generated?
- [ ] .agent/qa-progress.md updated?
- [ ] If --review: opus review dispatched and results saved?

### Output Rejection Criteria

- Created new test scripts → REJECT (use /qa-create-scenario instead)
- Overwrote previous run data → REJECT
- No comparison with previous run → REJECT
- qa-tracker.json not updated → REJECT

---

## Input ที่ได้รับ

```
/qa-retest                         # รีเทส failed ทั้งหมด (default)
/qa-retest TS-LOGIN-003            # รีเทสเคสเฉพาะ
/qa-retest --module LOGIN          # รีเทสทั้ง module
/qa-retest --all                   # รีเทสทุกเคส (regression test)
/qa-retest --review                # รีเทส + opus review
/qa-retest --parallel              # รีเทส parallel
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

# 3. Verify test scripts exist
ls tests/TS-*.spec.ts 2>/dev/null
```

**ถ้าไม่มี qa-tracker.json → แจ้งผู้ใช้:**
```
❌ ไม่พบ qa-tracker.json
   → รัน /qa-create-scenario ก่อนเพื่อสร้าง test scenarios
```

---

### Step 1: Select Scenarios to Retest

**Default (no args) → failed scenarios เท่านั้น:**

```bash
# Filter failed scenarios from qa-tracker.json
cat qa-tracker.json | jq '[.scenarios[] | select(.last_run_status == "failed")] | map(.id)'
```

**แสดงรายการ:**

```
🔄 Scenarios ที่จะรีเทส:

| # | ID | Title | Last Status | Last Run | Error |
|---|-----|-------|-------------|----------|-------|
| 1 | TS-LOGIN-003 | Login empty | ❌ FAILED | Run #1 | Timeout |
| 2 | TS-PRODUCT-003 | Create neg | ❌ FAILED | Run #1 | Missing error |

❓ รีเทสทั้งหมด? (y/n หรือเลือกเฉพาะ)
```

---

### Step 2: Verify Scripts Exist

**สำหรับแต่ละ scenario:**

```bash
# Check test script exists
ls tests/{ID}.spec.ts 2>/dev/null

# ถ้าไม่พบ → error
# ❌ ไม่พบ script: tests/TS-LOGIN-003.spec.ts
#    → รัน /qa-create-scenario เพื่อสร้าง script ก่อน
```

---

### Step 3: Execute Retests

**สำหรับแต่ละ scenario:**

```bash
# 1. Update status to "running"
# (edit qa-tracker.json)

# 2. Run existing test
npx playwright test tests/{ID}.spec.ts --reporter=json,list 2>&1

# 3. Parse results
echo "Exit code: $?"
```

**Determine new run number:**

```
Previous runs: [run-001, run-002]
Next run: run-003
```

---

### Step 4: Compare with Previous Run

**สร้าง comparison สำหรับแต่ละ scenario:**

```
🔄 TS-LOGIN-003: Login with empty fields
   Run #1 (2026-03-20 10:00): ❌ FAILED — 3/5 steps (4.5s)
      Step 4: Timeout waiting for validation error
   Run #2 (2026-03-20 14:30): ✅ PASSED — 5/5 steps (2.8s)
      All steps passed
   📈 Delta: FIXED! ❌→✅ | -1.7s faster
```

หรือ

```
🔄 TS-PRODUCT-003: Create negative
   Run #1 (2026-03-20 10:00): ❌ FAILED — 2/4 steps (3.8s)
      Step 3: Expected "Name is required" — got nothing
   Run #2 (2026-03-20 14:30): ❌ STILL FAILING — 2/4 steps (3.5s)
      Step 3: Expected "Name is required" — got nothing
   📉 Delta: Still failing at same step | -0.3s faster
```

---

### Step 5: Update qa-tracker.json

**เพิ่ม run entry ใหม่ (ห้าม overwrite):**

```json
{
  "id": "TS-LOGIN-003",
  "status": "passed",
  "last_run_status": "passed",
  "runs": [
    {
      "run_number": 1,
      "status": "failed",
      "duration_ms": 4500,
      "steps_passed": 3,
      "steps_total": 5,
      "failed_step": "Step 4: Timeout",
      "timestamp": "2026-03-20T10:00:00Z",
      "report_path": "test-results/TS-LOGIN-003/run-001/"
    },
    {
      "run_number": 2,
      "status": "passed",
      "duration_ms": 2800,
      "steps_passed": 5,
      "steps_total": 5,
      "failed_step": null,
      "error": null,
      "timestamp": "2026-03-20T14:30:00Z",
      "report_path": "test-results/TS-LOGIN-003/run-002/"
    }
  ]
}
```

**Update summary:**

```json
{
  "summary": {
    "passed": "+1",
    "failed": "-1",
    "pass_rate": "recalculate"
  }
}
```

---

### Step 6: Opus Review (ถ้า --review)

**Dispatch opus review subagent:**

```
Subagent prompt:

You are an **Opus QA Reviewer**. Review the QA test results and provide feedback.

## Input
- qa-tracker.json: [content]
- Test results: [summary of all passed/failed]
- Test scripts: [list of spec files]

## Review Criteria

1. **Test Quality** (0-100)
   - Are assertions sufficient? (not just checking page loads)
   - Are error messages verified?
   - Are edge cases covered?

2. **Coverage Gaps**
   - Missing test types (no boundary tests?)
   - Missing negative cases?
   - Missing user roles?

3. **Test Script Quality**
   - POM used correctly?
   - Selectors robust? (data-testid > CSS)
   - Waits explicit? (no hardcoded sleeps)

4. **Recommendations**
   - New scenarios to add
   - Existing scenarios to improve
   - Priority adjustments

## Output Format
{
  "result": "pass|fail",
  "score": 85,
  "test_quality": { "score": 90, "notes": "..." },
  "coverage_gaps": ["...", "..."],
  "script_quality": { "score": 80, "issues": ["..."] },
  "recommendations": [
    { "type": "add_scenario", "id": "TS-XXX-NNN", "title": "...", "priority": "..." },
    { "type": "improve", "id": "TS-XXX-NNN", "suggestion": "..." }
  ]
}
```

**Save review to qa-tracker.json:**

```json
{
  "review": {
    "reviewer": "opus",
    "result": "pass|fail",
    "score": 85,
    "timestamp": "TIMESTAMP",
    "coverage_gaps": ["..."],
    "recommendations": ["..."],
    "remaining_issues": []
  }
}
```

**ถ้า review result == "fail":**
- เพิ่ม recommended scenarios เป็น pending
- แจ้งผู้ใช้ให้รัน /qa-create-scenario เพิ่ม

---

### Step 7: Generate Reports

**1. Comparison Report:**

```markdown
# QA Retest Comparison Report

| Field | Value |
|---|---|
| **Date** | TIMESTAMP |
| **Scenarios retested** | N |
| **Fixed** | X (❌→✅) |
| **Still failing** | Y |
| **Regressed** | Z (✅→❌) |

## Detailed Comparison

### ✅ Fixed
| Scenario | Previous | Current | Delta |
|----------|----------|---------|-------|
| TS-LOGIN-003 | ❌ Run#1 | ✅ Run#2 | Fixed! -1.7s |

### ❌ Still Failing
| Scenario | Run# | Error |
|----------|------|-------|
| TS-PRODUCT-003 | #2 | Step 3: Missing error message |

### 📉 Regressed (if any)
| Scenario | Previous | Current |
|----------|----------|---------|
| (none) | | |
```

**2. Summary Report (update):**

```bash
node skills/qa-ui-test/scripts/generate-summary.js --output test-results/summary-report.md
```

---

### Step 8: Update Progress Log

เพิ่มใน `.agent/qa-progress.md`:

```markdown
---

## QA Session N - RETEST
**Date**: TIMESTAMP
**Type**: Retest (+ Review if --review)

### สิ่งที่ทำ:
- 🔄 รีเทส N scenarios
- ✅ Fixed: X scenarios
- ❌ Still failing: Y scenarios
- 📉 Regressed: Z scenarios

### Review (if --review):
- Score: 85/100
- Result: pass/fail
- Gaps: [list]
- Recommendations: [list]

### Current status:
- Scenarios: X/N passed (Y%)

### Next:
- [recommended action based on results]

---
```

---

### Step 9: Commit

```bash
git add qa-tracker.json .agent/qa-progress.md test-results/
git commit -m "qa-retest: X/N fixed — [scenario list]"
```

---

## Output สุดท้าย

```
🔄 QA Retest Complete!

📊 Retest Results:
┌─────────────────────────────────────────────────────┐
│  Retested: N | ✅ Fixed: X | ❌ Still Failing: Y    │
│  📈 Regressed: Z | Duration: Ns                     │
└─────────────────────────────────────────────────────┘

✅ Fixed (❌→✅):
├── TS-LOGIN-003: Run#1 ❌ → Run#2 ✅ (2.8s)
└── TS-LOGIN-005: Run#1 ❌ → Run#2 ✅ (3.1s)

❌ Still Failing:
└── TS-PRODUCT-003: Run#2 ❌ (3.5s)
    Step 3: Expected "Name is required" — got nothing

🔍 Opus Review (if --review):
   Score: 85/100 | Result: ✅ Pass
   Coverage gaps: Missing boundary test for price field
   Recommendation: Add TS-PRODUCT-014 (price boundary)

📝 Reports:
├── test-results/retest-comparison.md
└── test-results/summary-report.md

📊 Overall: X/N passed (Y%)

🔜 Next:
   /qa-retest TS-PRODUCT-003  — รีเทสเคสที่ยัง fail
   /qa-create-scenario        — สร้าง scenarios ที่ opus แนะนำ
   /qa-run --all               — regression test ทั้งหมด
```

> This command responds in Thai (ภาษาไทย)
