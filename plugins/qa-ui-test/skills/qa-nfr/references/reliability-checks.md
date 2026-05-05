# Reliability Checks

ประเมิน reliability — pass rate + flakiness + error recovery + retry behavior

## Inputs

- **qa-tracker scenarios.runs[]** — run history per scenario
- **qa-tracker bugs[]** — bug type==flaky, app-defect counts
- **Playwright traces** — error patterns, retry counts
- **qa-advanced network-mock scenarios** (ต่อยอด): retry-then-success, slow-response, timeout

## 5 Reliability Metrics (each 20 points → 100 total)

### 1. Overall Pass Rate — 20 points

วัด pass rate ของ scenarios ที่รันครั้งล่าสุด:

```
last_runs = [scenario.runs[-1] for scenario in scenarios where runs.length > 0]
pass_rate = pass_count / total

20: pass_rate >= 95%
15: pass_rate 90-94%
10: pass_rate 80-89%
5:  pass_rate 70-79%
0:  pass_rate < 70%
```

**Note:** ต้อง normalize per priority:
- P0 + P1 ต้อง >= 98% (P0 fail = release blocker)
- ถ้า P0 pass_rate < 100% → cap reliability score at 60

### 2. Flaky Rate — 20 points

วัดจำนวน scenarios ที่มี runs[] inconsistent (pass บางครั้ง fail บางครั้ง):

```
flaky_scenarios = [s for s in scenarios where:
  s.runs.length >= 3 AND
  s.runs has at least one passed AND at least one failed]

flaky_rate = len(flaky_scenarios) / scenarios_with_3plus_runs.length

20: flaky_rate <= 2%
15: flaky_rate 2-5%
10: flaky_rate 5-10%
5:  flaky_rate 10-20%
0:  flaky_rate > 20%
```

**Why it matters:** flaky tests ทำลายความเชื่อมั่นในผลลัพธ์ — fix flakiness ก่อน fix bug

### 3. Network Resilience (ต่อยอดจาก qa-advanced) — 20 points

วัดจาก scenarios ที่มี `complexity_factors` รวม `network-mock`:

```
mock_scenarios = scenarios where 'network-mock' in complexity_factors

# Categories ตาม mock scenario types (จาก network-mock-guide):
required_coverage = {
  "error-status": (status 4xx/5xx handled),
  "timeout": (delay > timeout threshold),
  "retry-then-success": (retry sequence works),
  "network-error": (connection abort handled),
  "slow-response": (UI shows loading state)
}

covered = count(required_coverage where at least 1 mock_scenario covers it)
score = (covered / 5) * 20
```

### 4. Error Recovery — 20 points

วัดว่า app ฟื้นจาก error ได้ดีแค่ไหน:

| Pattern checked | Points |
|---|---|
| Error message ชัดเจน (ไม่ใช่ "An error occurred") | 5 |
| Retry button หรือ auto-retry mechanism | 5 |
| ข้อมูลผู้ใช้ไม่หาย (form data preserved on error) | 5 |
| Graceful degradation (เช่น offline mode) | 5 |

**Auto-detect:**
- มี scenarios negative ที่ verify error message specific text
- มี scenarios ที่ verify retry behavior
- มี scenarios ที่ verify form repopulate after submit error

```
จาก qa-tracker:
clear_error_msgs = scenarios where (
  type == "negative" AND
  expected contains specific error text (e.g., "Email is required")
)
```

### 5. Bug Reopen Rate — 20 points

จาก bugs[] history — ดูว่า bug ที่ verified แล้วกลับมา reopen บ่อยแค่ไหน:

```
verified_bugs = bugs where ever_verified (status reached 'verified' at least once)
reopen_count = sum(bug.history.filter(h => h.action == 'reopened'))
reopen_rate = reopen_count / verified_bugs.length

20: reopen_rate <= 5%   (regression rare)
15: reopen_rate 5-10%
10: reopen_rate 10-20%
5:  reopen_rate 20-40%
0:  reopen_rate > 40%   (regression rampant)
```

**Why:** Reopen rate สูง = fix ไม่ครอบ root cause → reliability ต่ำ

## Aggregation

```
total_reliability_score = pass_rate + flaky + network + recovery + reopen
```

## Common Issues + Fixes

| Issue | Fix recommendation |
|---|---|
| Pass rate < 80% | Run /qa-bug-triage → /qa-bug-export — focus fix backlog |
| Flaky rate > 10% | /qa-edit-scenario {flaky-scenario} "stabilize wait conditions, remove sleep" |
| No network-mock coverage | /qa-create-advanced --auto สำหรับ critical APIs |
| Error messages generic | Add scenarios with `expected: "Specific error text"` ไม่ใช่แค่ visible |
| Reopen rate > 20% | Review fix patterns — มัก fix แค่ symptom ไม่ใช่ root cause |

## Module-Specific Reliability Targets

| Module type | Pass rate target | Flaky target |
|---|---|---|
| Critical (auth, payment) | >= 99% | <= 1% |
| High (orders, products) | >= 95% | <= 3% |
| Standard (reports, settings) | >= 90% | <= 5% |
| Static (about, footer) | >= 95% | <= 2% |

## Special: Reliability Trends

เก็บ rolling history เพื่อดู trend:

```json
{
  "nfr_results": {
    "history": [
      { "date": "2026-04-01", "reliability": 85 },
      { "date": "2026-04-15", "reliability": 88 },
      { "date": "2026-05-01", "reliability": 82 }
    ]
  }
}

→ ถ้า trend ลดลง 3 ครั้งติด → flag "Reliability degrading" + investigate
```

## Output Example

```
🛡️ Reliability Score: 86/100 (PASS)

  Pass rate:        18/20 (94% — good)
  Flaky rate:       16/20 (4% — needs improvement)            ⚠️
  Network resil.:   12/20 (3/5 mock categories covered)        ⚠️
  Error recovery:   20/20 (clear msgs + retry + form preserve)
  Reopen rate:      20/20 (3% reopen — solid fixes)

  ⚠️ Issues:
    1. 4 flaky scenarios — TS-CHECKOUT-005, TS-PRODUCT-009, ...
       → /qa-edit-scenario เพิ่ม explicit waits
    2. Missing mock coverage:
       - retry-then-success (no scenario tests retry chain)
       - slow-response (no loading-state verification)
       → /qa-create-advanced --pattern network-mock
```
