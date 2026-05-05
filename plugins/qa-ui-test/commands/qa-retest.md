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
/qa-retest --priority P0           # รีเทสเฉพาะ P0 (release smoke)
/qa-retest --model opus            # รีเทสเฉพาะที่ assigned เป็น opus
/qa-retest --factor cascade-deep   # รีเทสเฉพาะที่มี factor นี้
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

| # | ID            | Title         | Risk  | Factors        | Model  | Last Status | Last Run | Error         |
|---|---------------|---------------|-------|----------------|--------|-------------|----------|---------------|
| 1 | TS-LOGIN-003  | Login empty   | P1/6  | —              | sonnet | ❌ FAILED   | Run #1   | Timeout       |
| 2 | TS-PRODUCT-003| Create neg    | P1/6  | —              | sonnet | ❌ FAILED   | Run #1   | Missing error |
| 3 | TS-ORDER-007  | Status flow   | P0/9  | state-machine  | opus   | ❌ FAILED   | Run #2   | State stuck   |

❓ รีเทสทั้งหมด? (y/n หรือเลือกเฉพาะ)
   เพิ่ม filter ได้: --priority P0  | --model opus  | --factor state-machine
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

### Step 6: Opus Review with Numeric Score 0-100 (v2.5)

**Dispatch opus review subagent:**

```
Subagent prompt:

You are an **Opus QA Reviewer**. Score test quality across 4 orthogonal dimensions
(each 25 points → total 100). Use ONLY observable evidence from test files,
qa-tracker.json, and test-results — no fabricated metrics.

## Input
- qa-tracker.json: [content]
- Test results: [summary of all passed/failed]
- Test scripts: [list of spec files]

## 4 Scoring Dimensions (25 points each)

### 1. Coverage (25 points)

วัดว่า scenarios ครอบ test types แค่ไหน:
- Happy path scenarios: existence + count vs page count                    (5 pts)
- Negative scenarios: count + variety (validation, boundary, error)        (7 pts)
- Edge cases: boundary values, special chars, concurrent edit              (5 pts)
- Role coverage: each role tested for module                               (4 pts)
- Risk priority distribution: P0/P1/P2/P3 balance not skewed              (4 pts)

Bonus: -3 ถ้า P0 scenarios < 10% (under-tested critical paths)
Bonus: +2 ถ้ามี complexity_factors coverage ≥ 4 different factors

### 2. Determinism (25 points)

วัดว่า tests stable + reliable แค่ไหน:
- Pass rate of last run: ≥95%=12 / 90-94%=8 / 80-89%=4 / <80%=0           (12 pts)
- Flaky rate (pass+fail in runs[]): <2%=8 / 2-5%=5 / 5-10%=2 / >10%=0     (8 pts)
- No `waitForTimeout()` hardcoded sleep: count=0=5 / 1-3=3 / >3=0          (5 pts)

### 3. Assertion Quality (25 points)

วัดว่า assertions ตรวจสิ่งที่ต้อง verify จริง:
- Specific text assertions (not just toBeVisible): ratio 0.7+=10 / 0.4-0.7=6 / <0.4=0  (10 pts)
- Error messages verified by content (not just "error appears"): 8 pts ถ้าทุก negative scenario verify text
- API response shape verified (when applicable): 4 pts
- State after action verified (not just action success): 3 pts

Penalty: -3 ถ้ามี scenario แค่ click button without verifying result

### 4. Maintainability (25 points)

วัดว่า test code maintain ง่ายแค่ไหน:
- Selector quality (data-testid + getByRole ratio): ≥85%=10 / 70-84%=7 / 55-69%=4 / <55%=0  (10 pts)
- Helper reuse (login + API setup helpers used): ratio ≥0.8=8 / 0.6-0.79=5 / <0.6=2  (8 pts)
- POM coverage (specs importing pages/): ≥0.8=4 / 0.5-0.79=2 / <0.5=0  (4 pts)
- Comments referencing scenario doc: ratio ≥0.7=3 / <0.7=1  (3 pts)

## Output Format

{
  "score": 84,
  "result": "pass" if score >= 80 else "concerns" if score >= 65 else "fail",
  "dimensions": {
    "coverage":         { "score": 22, "notes": "Strong happy+negative; missing concurrent edit edge cases" },
    "determinism":      { "score": 20, "notes": "94% pass rate; 1 flaky scenario; 2 waitForTimeout occurrences" },
    "assertion_quality":{ "score": 18, "notes": "3 scenarios use only toBeVisible — verify text instead" },
    "maintainability":  { "score": 24, "notes": "98% data-testid; helpers reused; 1 spec without POM import" }
  },
  "recommendations": [
    { "type": "improve_assertion", "id": "TS-PRODUCT-007", "fix": "Verify error text content not just visibility" },
    { "type": "add_scenario", "module": "ORDER", "title": "Concurrent edit conflict", "priority": "P0", "factors": ["concurrent"] },
    { "type": "remove_anti_pattern", "id": "TS-CHECKOUT-005", "fix": "Replace waitForTimeout(2000) with waitFor({state:'visible'})" }
  ],
  "trend": {
    "previous_score": 78,
    "delta": "+6"
  }
}
```

**Score thresholds (Quality Gate):**

```
score >= 80  → PASS       (release-ready quality)
score 65-79  → CONCERNS   (acceptable, fix recommendations before next release)
score < 65   → FAIL       (block — significant test debt)
```

**Save review to qa-tracker.json:**

```json
{
  "review": {
    "reviewer": "opus",
    "score": 84,
    "result": "pass|concerns|fail",
    "timestamp": "TIMESTAMP",
    "dimensions": {
      "coverage":         { "score": 22, "max": 25, "notes": "..." },
      "determinism":      { "score": 20, "max": 25, "notes": "..." },
      "assertion_quality":{ "score": 18, "max": 25, "notes": "..." },
      "maintainability":  { "score": 24, "max": 25, "notes": "..." }
    },
    "recommendations": [...],
    "history": [
      { "date": "2026-04-15", "score": 78 },
      { "date": "2026-05-05", "score": 84 }
    ]
  }
}
```

**Output to user:**

```
🔍 Opus Review Score: 84/100 ✅ PASS

  Coverage:           22/25 ████████████████████████░░  (88%)
  Determinism:        20/25 ████████████████████░░░░░░  (80%)
  Assertion quality:  18/25 ██████████████████░░░░░░░░  (72%)  ⚠️
  Maintainability:    24/25 ████████████████████████░░  (96%)

  Trend: +6 vs last review (was 78, 3 weeks ago)

  💡 Top recommendations (3):
    1. [HIGH] Replace toBeVisible-only assertions in 3 scenarios
       TS-PRODUCT-007, TS-ORDER-005, TS-LOGIN-008
       → Verify error text content explicitly
    2. [MED] Add concurrent edit scenario for ORDER
       Factor: concurrent → opus | P0
    3. [LOW] Replace waitForTimeout in TS-CHECKOUT-005
       → waitFor({ state: 'visible' })
```

**ถ้า score < 80 (CONCERNS/FAIL):**
- เพิ่ม recommendations เป็น tracker.review.recommendations
- แจ้งผู้ใช้ commands ที่ต้อง run เพื่อ fix

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
├── TS-LOGIN-003 [P1/6] [—] [sonnet]: Run#1 ❌ → Run#2 ✅ (2.8s)
└── TS-LOGIN-005 [P0/9] [security-flow] [opus]: Run#1 ❌ → Run#2 ✅ (3.1s)

❌ Still Failing:
└── TS-PRODUCT-003 [P1/6] [—] [sonnet]: Run#2 ❌ (3.5s)
    Step 3: Expected "Name is required" — got nothing

🔍 Opus Review (if --review): 84/100 ✅ PASS  (was 78, +6)
   Coverage:           22/25 (88%)
   Determinism:        20/25 (80%)
   Assertion quality:  18/25 (72%) ⚠️
   Maintainability:    24/25 (96%)
   Top fix: Replace toBeVisible-only in 3 scenarios → verify error text

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
