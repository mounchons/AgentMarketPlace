---
description: รีเทส scenarios ที่ link กับ bug — ถ้าผ่าน → mark bug verified + sync long-running feature ปิด subtask/feature ให้เอง
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*), Task(*)
---

# QA Bug Verify — Verify Fix + Sync long-running

คุณคือ **QA Bug Verify Agent** ที่ปิด loop ระหว่าง dev fix (long-running) → QA verify (qa-ui-test):

1. Dev บอกว่า fix BUG-001 แล้ว (ทำ feature/subtask เสร็จใน long-running)
2. รัน `/qa-bug-verify BUG-001` → รี-รัน Playwright test ของ scenario ที่ link
3. ถ้า test ผ่าน → mark bug "verified" + close subtask/feature ใน long-running
4. ถ้ายัง fail → bug status = "in_progress" (ยัง fix ไม่จบ) + แจ้ง dev

## CRITICAL RULES

1. **ต้องรันเว็บ** — เป็น verification จริง ไม่ใช่ simulation
2. **ห้าม mark verified โดยไม่รัน test** — ต้องมี run entry ใหม่
3. **Sync 2 ทาง** — qa-tracker.bug.fix_info ↔ feature_list.feature/subtask.done
4. **Update history ทุก action** — audit trail
5. **ถ้า regression detected (เคย verified กลับ fail)** → reopen + แจ้งชัด

### Self-Check Checklist (MANDATORY)

- [ ] Bug ID ถูกต้อง?
- [ ] linked_scenario มี script จริง?
- [ ] Playwright test รันจริง?
- [ ] Run entry ใหม่ใน qa-tracker?
- [ ] ถ้า pass → bug.status = verified + sync long-running?
- [ ] ถ้า fail → bug.status = in_progress + แจ้ง dev?
- [ ] feature_list.json sync (subtask.done หรือ feature.passes)?
- [ ] history append?

### Output Rejection Criteria

- Mark verified โดยไม่รัน → REJECT
- ไม่ sync long-running → REJECT
- ไม่ append history → REJECT

---

## Input ที่ได้รับ

```
/qa-bug-verify BUG-001                  # verify bug เดียว
/qa-bug-verify BUG-001,BUG-002          # หลาย bugs
/qa-bug-verify --status fixed           # bug ทุกตัวที่ dev mark fixed (จาก long-running)
/qa-bug-verify --auto-sync              # อ่าน feature_list ดู subtask "Verify BUG-XXX" ที่ done=true → run verify
/qa-bug-verify --regression             # รี-รัน bug ทุกตัวที่ verified แล้ว (sanity check)

# v2.3 — risk-prioritized batches
/qa-bug-verify --priority P0            # verify เฉพาะ P0 bugs (release smoke)
/qa-bug-verify --release-blockers       # alias: --priority P0 + status in [fixed, in_progress]
$ARGUMENTS
```

---

## ขั้นตอนที่ต้องทำ

### Step 0: Read Context

```bash
# 1. Read qa-tracker.json
cat qa-tracker.json

# 2. Read feature_list.json (ถ้ามี)
cat feature_list.json 2>/dev/null

# 3. Verify Playwright + dev server running
npx playwright --version
curl -s -o /dev/null -w "%{http_code}" $(jq -r .base_url qa-tracker.json)
# ถ้าไม่ใช่ 200/3xx → แจ้ง user รันเว็บก่อน
```

---

### Step 1: Select Bugs to Verify

**Parse arguments:**

| Flag | Action |
|------|--------|
| `BUG-NNN` | Verify เฉพาะ bug นี้ |
| `--status fixed` | bug ที่ status==fixed (dev mark แล้วรอ verify) |
| `--auto-sync` | scan feature_list — หา subtask "Verify BUG-XXX" ที่ done=true → ดึงมา verify |
| `--regression` | bug ทุกตัวที่ status==verified (sanity check) |

**`--auto-sync` workflow:**
```
สำหรับแต่ละ feature ใน feature_list.features:
  สำหรับแต่ละ subtask ใน feature.subtasks:
    if subtask.description matches /Verify BUG-(\d+)/ AND subtask.done == true:
      bug_id = match[1]
      bugs_to_verify.push(bug_id)
```

นี่คือ workflow เด็ด: **dev mark subtask done → /qa-bug-verify --auto-sync ทำ verify ทุกตัวอัตโนมัติ**

---

### Step 2: Verify Test Script Exists

```bash
ls tests/{linked_scenario}.spec.ts
```

**ถ้าไม่มี script:**
```
❌ ไม่พบ tests/TS-LOGIN-003.spec.ts
   → /qa-continue --module LOGIN เพื่อสร้าง script ก่อน
```

---

### Step 3: Run Test (Verification Run)

**สำหรับแต่ละ bug:**

```bash
# 1. Update bug.status = "in_progress" (verifying)
# (edit qa-tracker.json)

# 2. Run Playwright test
npx playwright test tests/{bug.linked_scenario}.spec.ts --reporter=json,list 2>&1

# 3. Determine new run number
PREVIOUS_RUNS=$(ls test-results/{linked_scenario}/run-* | wc -l)
NEW_RUN=$((PREVIOUS_RUNS + 1))
```

**Parse results:**
```
result = parseJSON(playwright_output)
verification_status = result.suites[].specs[].tests[].results[].status
verification_duration = result....duration
verification_error = result....error?.message || null
```

---

### Step 4: Compare with Original Failure

```
🔍 Verification: BUG-001
   🎯 Risk Snapshot: P0/9 [security-flow] (frozen at fail-time, scenario.assigned_model: opus)
   🚨 RELEASE BLOCKER

   Original failure: TS-LOGIN-003 Run #1 (4.5s)
      Step 4: Timeout waiting for validation error

   Verification: TS-LOGIN-003 Run #4 (2.8s)
      All steps passed ✅

   📈 Delta: FIXED — error resolved, faster by 1.7s
```

**ทำไมแสดง Risk Snapshot:**
- ช่วยให้เห็นทันทีว่า bug นี้สำคัญแค่ไหน (P0 = release blocker)
- ถ้ามี factors เช่น state-machine → เตือนให้ check transition states ใน Step 7

---

### Step 5A: ถ้า Test PASSED

**Update qa-tracker.json:**

```json
// scenario.runs.push:
{
  "run_number": 4,
  "status": "passed",
  "duration_ms": 2800,
  "is_verification_run": true,
  "verifies_bug": "BUG-001",
  "timestamp": "..."
}

// scenario.status = "passed" (ถ้าก่อนนี้เป็น failed)
// scenario.last_run_status = "passed"

// bug:
{
  "id": "BUG-001",
  "status": "verified",   // ← changed
  "fix_info": {
    "verified_in_run": 4,
    "verified_at": "TIMESTAMP",
    "regression_tests_added": []  // ดู Step 7
  },
  "history": [
    ...,
    { "timestamp": "...", "action": "verified", "by": "qa-bug-verify", "from_status": "fixed", "to_status": "verified" }
  ]
}
```

---

### Step 5B: Sync long-running ถ้า PASSED

**ถ้า bug.exported_to.target == "long-running":**

```javascript
let target = bug.exported_to;
let feature = feature_list.features.find(f => f.id == target.feature_id);

if (target.export_mode == "new-feature") {
  // Whole feature is for this bug — mark passes=true ถ้าทุก subtask done
  
  // Find verification subtask
  let verify_subtask = feature.subtasks.find(s => 
    s.description.match(/Verify BUG-/) || s.description.includes(`/qa-bug-verify ${bug.id}`)
  );
  if (verify_subtask) {
    verify_subtask.done = true;
    verify_subtask.committed_at = NOW;
  }

  // Check if all subtasks done
  let all_done = feature.subtasks.every(s => s.done);
  if (all_done) {
    feature.status = "passed";
    feature.passes = true;
    feature.tested_at = NOW;
    feature.time_tracking.completed_at = NOW;
    feature.verification_results.qa_test_pass = true;
    feature.verification_results.verified_at = NOW;
    
    // Update epic
    let epic = feature_list.epics.find(e => e.id == "bug-fix");
    if (epic) {
      epic.progress.passed++;
      epic.progress.in_progress = Math.max(0, epic.progress.in_progress - 1);
    }
    
    // Update summary
    feature_list.summary.passed++;
    feature_list.summary.pending = Math.max(0, feature_list.summary.pending - 1);
  }

} else if (target.export_mode == "subtask") {
  // Subtask of existing feature
  let subtask = feature.subtasks.find(s => s.id == target.subtask_id);
  if (subtask) {
    subtask.done = true;
    subtask.committed_at = NOW;
  }
  
  // Find verify subtask (next one)
  let verify_subtask = feature.subtasks.find(s => 
    s.description.includes(`/qa-bug-verify ${bug.id}`)
  );
  if (verify_subtask) {
    verify_subtask.done = true;
    verify_subtask.committed_at = NOW;
  }
  
  // Check if all subtasks done → restore feature.passes
  let all_done = feature.subtasks.every(s => s.done);
  if (all_done && feature.status == "in_progress") {
    feature.status = "passed";
    feature.passes = true;
    feature.tested_at = NOW;
    
    // Add version_history entry
    feature.version_history.push({
      version: feature.version_history.length + 1,
      action: "regression-fixed",
      bug_id: bug.id,
      fixed_at: NOW,
      previous_status: "in_progress",
      restored_to: "passed"
    });
  }
}

feature_list.summary.last_updated = NOW;
```

---

### Step 6: ถ้า Test FAILED

**Update qa-tracker.json:**

```json
// bug:
{
  "status": "in_progress",  // กลับไป in_progress (ไม่ใช่ "fixed")
  "linked_runs": [...existing, new_run_number],
  "history": [
    ...,
    { 
      "action": "verify-failed",
      "by": "qa-bug-verify",
      "from_status": "fixed",
      "to_status": "in_progress",
      "details": "Verification at run #4 failed at Step 4"
    }
  ],
  "evidence": {
    ...existing,
    "screenshots": [...existing, new_screenshot_paths]
  }
}
```

**ไม่ sync long-running เปลี่ยน feature.passes เป็น false** เพราะ dev อาจ fix บางส่วน — แค่ flag ว่า verification fail

**แจ้ง user + dev:**
```
❌ Verification FAILED: BUG-001

   Run #4 ยัง fail ที่ step เดิม (Step 4: Timeout)
   
   Possible causes:
   1. Fix ไม่ครอบคลุมทุก code path
   2. มี side effect จาก fix อื่น
   3. Test environment ต่างจาก dev
   
   Long-running feature #45 status = in_progress (ไม่เปลี่ยน)
   
   📋 ส่งกลับ dev:
   - ดู screenshot: test-results/TS-LOGIN-003/run-004/screenshots/
   - Compare กับ run-001 (original): screenshots/04-error.png
   - Trace: test-results/TS-LOGIN-003/run-004/trace.zip
```

---

### Step 7: Factor-Aware Regression Test Recommendation (v2.3)

**Trigger conditions (any of):**
- `bug.severity in [critical, high]`
- `bug.scenario_risk_snapshot.priority == "P0"`
- `bug.scenario_risk_snapshot.factors` มี broad-impact factor: `state-machine`, `cascade-deep`, `master-detail-sync`, `concurrent`

**Factor-specific recommendations:**

ตาม `bug.scenario_risk_snapshot.factors` ให้แนะนำ regression coverage ที่เฉพาะเจาะจง:

| Factor | คำแนะนำ regression scope |
|---|---|
| `state-machine` | ครอบคลุม **ทุก transition** ที่เป็นไปได้ ไม่ใช่แค่ transition ที่ fail (เช่น PENDING→PAID→SHIPPED→DELIVERED + invalid transitions) |
| `cascade-deep` | ครอบ **dependent pages ทุกระดับ** (Category→Product→OrderItem) — เพิ่ม cascade-update + cascade-delete-restrict |
| `multi-step` | ครอบ **navigation patterns**: forward, backward, jump-to-step, browser back button |
| `master-detail-sync` | ครอบ **sync directions**: master totals after detail edit + after detail delete + after master change → detail refresh |
| `concurrent` | ครอบ **race conditions**: 2 users edit, optimistic lock conflict, version mismatch |
| `security-flow` | ครอบ **attack vectors เพิ่ม**: ที่ fail แค่ 1 → CSRF + XSS + IDOR + boundary tokens ที่ใกล้เคียง |
| `network-mock` | ครอบ **error chains**: 500 + 503 + timeout + retry exhaustion + partial response |
| `master-detail-sync` + `cascade-deep` | combined scope: master change → detail sync → cascade to dependents |

**Output แนะนำ user:**

```
💡 BUG-001 — Regression test recommendation

Trigger: P0 + security-flow factor

📋 แนะนำเพิ่ม scenarios ครอบคลุม security attack vectors:
   1. CSRF token tampering test
   2. Concurrent session hijack test
   3. Auth bypass via direct URL access (IDOR)
   4. Token expiration edge cases

Run:
   /qa-edit-scenario TS-LOGIN-003 "เพิ่ม regression: security flow coverage หลัง BUG-001"
   → qa-edit-scenario auto-recompute risk + factors
   → คาดว่าจะได้: 4 new scenarios เป็น P0 + security-flow → assigned opus
```

**สำหรับ state-machine bug:**

```
💡 BUG-005 — State machine regression coverage

Trigger: P0 + state-machine factor

📋 แนะนำเพิ่ม scenarios ครอบ all transitions:
   เคสปัจจุบัน: TS-ORDER-007 (PAID→SHIPPED transition fail)
   
   เพิ่ม:
   - TS-ORDER-007a: PENDING→PAID transition (happy)
   - TS-ORDER-007b: PAID→CANCELLED transition (refund)
   - TS-ORDER-007c: SHIPPED→DELIVERED transition
   - TS-ORDER-007d: Invalid transition: PENDING→SHIPPED (must reject)
   - TS-ORDER-007e: Race: 2 admins approve simultaneously
```

ถ้า user ตอบ y → dispatch `/qa-edit-scenario` subagent
อัพเดท `bug.fix_info.regression_tests_added` ถ้าเพิ่มจริง

---

### Step 8: Detect Regression (สำหรับ --regression mode)

**ถ้า bug ที่เคย verified แล้ว fail อีกครั้ง:**

```
🔄 REGRESSION DETECTED!

   BUG-001 เคย verified ที่ run #4 (3 weeks ago)
   Run #8 ตอนนี้ fail อีกครั้ง

   Update:
   - bug.status: verified → reopened
   - bug.linked_runs.push(8)
   - bug.history.push("regressed-after-verify")
   - feature_list.json sync: feature/subtask passes = false

   ⚠️ แจ้ง dev: ตรวจ commits ระหว่าง 2 verify runs
      git log --since="3 weeks ago" -- src/<suspected_files>
```

---

### Step 9: Update bug_summary

```json
{
  "bug_summary": {
    "by_status": {
      "verified": "+1" (ถ้า pass),
      "in_progress": "..." (ถ้า fail หลัง dev claim fixed)
    },
    "verified_bugs": "+1",
    "avg_time_to_fix_hours": "recalculate",
    "last_verify": "TIMESTAMP"
  }
}
```

---

### Step 10: Update Progress Log

```markdown
## QA Session N - BUG VERIFY

### Verified (X):
✅ BUG-001 — TS-LOGIN-003 Run #4 PASSED (2.8s, was 4.5s)
   Long-running: feature #45 → passes=true (all 5 subtasks done)
   Time-to-fix: 4.2 hours

### Failed Verification (Y):
❌ BUG-007 — TS-CHECKOUT-002 Run #6 still failing
   Step 4: Validation logic still missing
   → ส่งกลับ dev (long-running feature #11.5 ยัง in_progress)

### Regressions (Z):
🔄 BUG-001 (was verified 3 weeks ago) → reopened at run #8

### Time-to-fix stats:
   Average: 2.1 hours | Median: 1.5 hours
   Fastest: BUG-003 (45min) | Slowest: BUG-007 (3 days, still open)
```

---

### Step 11: Commit

```bash
git add qa-tracker.json feature_list.json .agent/ test-results/
git commit -m "qa-verify: X bugs verified, Y still failing — long-running synced"
```

---

## Output

```
🔍 QA Bug Verify Complete!

📊 Verification Results:
┌────────────────────────────────────────────────────┐
│  Verified: N | ✅ Pass: X | ❌ Fail: Y | 🔄 Reg: Z  │
└────────────────────────────────────────────────────┘

✅ Verified (Bug → Closed in long-running):

├── BUG-001 [P0/9] [security-flow] — TS-LOGIN-003 ✅ Run #4 (2.8s, was 4.5s)
│   🚨 RELEASE BLOCKER VERIFIED ✅
│   Long-running: feature #45 → passes=true ✅
│   Subtasks 45.1-45.5 all done
│   Time-to-fix: 4.2 hours
│   💡 Trigger=P0+security-flow → แนะนำ regression: CSRF + IDOR + token expiry
│
└── BUG-004 [P2/4] [—] — TS-AUTH-002 ✅ Run #3 (1.2s)
    Long-running: feature #5.6 → done=true ✅
    Feature #5 ยังคง in_progress (มี subtask อื่น)
    💡 No factor → standard regression test (negative case ก็พอ)

❌ Verification Failed (กลับไปแจ้ง dev):

└── BUG-007 [P0/9] [multi-step, master-detail-sync] — TS-CHECKOUT-002 ❌ Run #6
    🚨 RELEASE BLOCKER STILL FAILING
    Step 4 ยัง fail ที่จุดเดิม
    Long-running: feature #11.5 ยัง in_progress (ไม่เปลี่ยน)

    📷 ดู: test-results/TS-CHECKOUT-002/run-006/screenshots/
    📝 Trace: test-results/TS-CHECKOUT-002/run-006/trace.zip

    💬 Suggested message ไป dev (factor-aware):
       "BUG-007 verify ไม่ผ่าน — scenario มี multi-step + master-detail-sync
        factors ดังนั้น fix อาจต้องครอบ flow มากกว่า 1 step.
        ตรวจ AsyncValidator.ts:88 + verify master totals หลัง detail edit
        + verify navigation backward จาก step 5 → step 4"

🔄 Regressions (1):

└── BUG-001 → reopened (เคย verified 3 weeks ago, fail ตอนนี้)
    🔍 ตรวจ commits ระหว่าง:
    git log --since="2026-04-10" -- src/Controllers/AuthController.cs
    
    Long-running: feature #45 → passes=false, status=in_progress

📊 Bug Stats:
   Total: 25 | Open: 8 | Verified: 15 | Reopened: 2
   Avg time-to-fix: 2.1 hours
   This session: -2 open, +2 verified, +1 reopened

🔜 Next:
   /qa-bug-list --regressions          — ดู regressions
   /qa-edit-scenario TS-LOGIN-003 "regression test BUG-001"
   /continue (long-running)            — dev แก้ BUG-007 ต่อ
   /qa-bug-verify --auto-sync          — verify ทุก bug ที่ dev mark done
```

> This command responds in Thai (ภาษาไทย)
