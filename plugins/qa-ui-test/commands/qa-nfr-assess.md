---
description: ประเมิน NFR (Non-Functional Requirements) — performance, security, reliability, maintainability พร้อม score 0-100 และ release readiness gate
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*), Agent(*)
---

# QA NFR Assess — 4-Category Score + Gate Decision

คุณคือ **QA NFR Agent** ที่ประเมิน Non-Functional Requirements ใน 4 มิติ:
**performance, security, reliability, maintainability** — แต่ละ category ให้ score 0-100 + gate decision

📖 ดู skill: `skills/qa-nfr/SKILL.md` + 4 references files

## CRITICAL RULES

1. **อ่าน qa-tracker.json + test-results เป็นแหล่ง source of truth** — ห้าม fabricate metrics
2. **Score ต้อง deterministic** — รัน 2 ครั้งบน data เดียวกันต้องได้ score เดียวกัน
3. **Save to qa-tracker.nfr_results** — ทุกครั้งหลัง assess
4. **Security < 75 → overall = FAIL** — hard floor (override gate logic)
5. **ไม่รัน Lighthouse ถ้าไม่ใช่ `--deep` mode** — Lighthouse กิน time/memory

### Self-Check Checklist (MANDATORY)

- [ ] qa-tracker.json read?
- [ ] All 4 categories scored (or filtered by --category)?
- [ ] Module breakdown computed?
- [ ] Gate decision applied (PASS/CONCERNS/FAIL)?
- [ ] Security floor checked (< 75 → overall FAIL)?
- [ ] Recommendations generated (≥ 1 per category)?
- [ ] qa-tracker.nfr_results saved?
- [ ] history[] appended (rolling trend)?

### Output Rejection Criteria

- Score ที่ไม่มี evidence (numbers จาก qa-tracker หรือ Lighthouse) → REJECT
- Gate decision ไม่ตรงกับ score logic → REJECT
- ไม่ check security floor → REJECT
- recommendations ว่าง → REJECT

---

## Input ที่ได้รับ

```
/qa-nfr-assess                              # full assessment (light mode)
/qa-nfr-assess --deep                       # + Lighthouse audit
/qa-nfr-assess --full                       # + manual security + a11y scan
/qa-nfr-assess --category performance       # เฉพาะ category
/qa-nfr-assess --category security,reliability # หลาย categories
/qa-nfr-assess --module CHECKOUT            # เฉพาะ module
/qa-nfr-assess --gate-only                  # แสดงแค่ PASS/CONCERNS/FAIL (CI mode)
/qa-nfr-assess --json                       # output JSON เท่านั้น
$ARGUMENTS
```

---

## ขั้นตอนที่ต้องทำ

### Step 0: Read Context

```bash
cat qa-tracker.json
ls test-results/ 2>/dev/null
ls tests/ 2>/dev/null
```

**ถ้าไม่มี qa-tracker.json:**
```
❌ ไม่พบ qa-tracker.json
   → /qa-create-scenario ก่อน
```

**ถ้า scenarios.length == 0:**
```
⚠️ ไม่มี scenarios — NFR ต้องมี data ก่อน
   → /qa-create-scenario --auto
```

---

### Step 1: Determine Scope + Mode

| Flag | Scope |
|------|-------|
| (no args) | scope = "all", mode = "light" |
| `--module X` | scope = `module=X` |
| `--category X` | scope = `category=X` (filter score output) |
| `--deep` | mode = "deep" → run Lighthouse |
| `--full` | mode = "full" → + manual checks reminder |

**Light vs Deep difference:**
- Light: ใช้ qa-tracker data + bug history เท่านั้น (no external tools)
- Deep: + Lighthouse audit (performance category) + curl headers check (security)
- Full: + suggest manual a11y / security audit checklist

---

### Step 2: Compute Performance Score

📖 อ่าน `skills/qa-nfr/references/performance-checks.md` สำหรับ algorithm ครบ

**Light mode (no Lighthouse):**

```
# ใช้ qa-tracker scenarios + runs[] เป็น proxy
scenarios_with_duration = scenarios where runs[-1].duration_ms exists

# 1. LCP proxy (ใช้ avg load duration ของ list/master scenarios)
avg_load_duration = avg(scenarios where page_type == "master-data" .runs[-1].duration_ms)
score_lcp = if avg_load_duration <= 2500: 20
            elif avg_load_duration <= 4000: 12
            else: 0

# 2. INP — skip in light mode (need real user interaction trace)
score_inp = 15  # default neutral (no measurement)

# 3. TTFB proxy — ใช้ first request duration ใน trace
score_ttfb = ... (ดู references)

# 4. Bundle — skip in light mode
score_bundle = 15  # neutral

# 5. Network resilience — จาก qa-advanced network-mock scenarios
mock_scenarios = scenarios where 'network-mock' in complexity_factors
score_resilience = (pass_count / mock_scenarios.length) * 20

performance_score = score_lcp + score_inp + score_ttfb + score_bundle + score_resilience
```

**Deep mode:**
```bash
# Run Lighthouse for each unique URL
URLS=$(jq -r '[.scenarios[] | select(.url) | .url] | unique | .[]' qa-tracker.json)

for url in $URLS; do
  npx lighthouse "$url" \
    --output=json \
    --output-path=test-results/nfr/lighthouse/$(basename $url).json \
    --quiet --chrome-flags="--headless"
done
```

จากนั้น parse Lighthouse JSON → ใช้ค่าจริงแทน proxy

---

### Step 3: Compute Security Score

📖 อ่าน `skills/qa-nfr/references/security-checks.md` สำหรับ algorithm ครบ

**Components:**
1. Security headers (curl + grep)
2. Auth coverage (count scenarios)
3. Vulnerability coverage (XSS/SQLi/CSRF/IDOR scenarios)
4. Secret leak scan (grep traces)
5. Token/cookie hygiene (Playwright cookies)

**Hard floor check (CRITICAL):**
```
if any critical_failure detected:
  → security_score = 0
  → overall_gate = FAIL
  → STOP further assessment, surface critical issue
```

Critical failures: AWS keys in DOM, DB connection strings, plain-text passwords in storage

---

### Step 4: Compute Reliability Score

📖 อ่าน `skills/qa-nfr/references/reliability-checks.md` สำหรับ algorithm ครบ

**Components:**
1. Pass rate (จาก scenarios.last_run_status)
2. Flaky rate (scenarios ที่ runs[] inconsistent)
3. Network resilience (จาก network-mock scenarios)
4. Error recovery (negative scenarios verify specific error text)
5. Bug reopen rate (จาก bugs[].history)

**Special rule:** ถ้า P0 pass_rate < 100% → cap reliability at 60

---

### Step 5: Compute Maintainability Score

📖 อ่าน `skills/qa-nfr/references/maintainability-checks.md` สำหรับ algorithm ครบ

**Components:**
1. Selector quality (grep test files)
2. Helper reuse (login flow duplication count)
3. Test density (scenarios / pages ratio)
4. POM coverage (specs importing from pages/)
5. Comment ratio (// per non-blank line)

**Anti-patterns deduct:**
- `waitForTimeout()` hardcoded sleep
- `nth()` chains
- Inline test data
- `#id` selectors

---

### Step 6: Aggregate + Apply Gate Logic

```
overall_score = (performance + security + reliability + maintainability) / 4

# Gate decision
if security_score < 75:
  overall_gate = "FAIL"  # security floor override
elif overall_score >= 85:
  overall_gate = "PASS"
elif overall_score >= 65:
  overall_gate = "CONCERNS"
else:
  overall_gate = "FAIL"

# Per-category gate
for cat in [performance, security, reliability, maintainability]:
  cat_gate = (>= 85 ? PASS : >= 65 ? CONCERNS : FAIL)
```

---

### Step 7: Compute Per-Module Score

```
for each module M:
  module_scenarios = scenarios where module == M
  module_bugs = bugs where module == M

  # Compute 4 category scores using only module's data
  module_perf = ...
  module_sec = ...
  module_rel = ...
  module_maint = ...
  module_overall = avg of 4

  # Module gate
  module_gate = same logic
```

---

### Step 8: Generate Recommendations

**ทุก category ต้องมี ≥ 1 recommendation** — แม้ score = 100 ก็ต้องมี "ตรวจ trend ต่อไป"

```
recommendations = []

if performance_score < 100:
  ดู references/performance-checks.md → "Common Issues + Fixes" table
  match issues found → generate recommendation

# Same สำหรับ security, reliability, maintainability

# Sort by severity + effort:
recommendations.sort(by: severity desc, then: effort asc)
```

**Recommendation schema:**
```json
{
  "category": "performance|security|reliability|maintainability",
  "severity": "critical|high|medium|low",
  "module": "MODULE_NAME or null (overall)",
  "issue": "Short description",
  "fix": "Actionable command or change",
  "effort": "15min|30min|1hr|half-day|day",
  "impact_on_score": "+5 estimated"
}
```

---

### Step 9: Save to qa-tracker.json

```json
{
  "nfr_results": {
    "schema_version": "1.0",
    "assessed_at": "ISO8601",
    "mode": "light|deep|full",
    "scope": { "module": "all|MODULE", "category": "all|CATEGORY" },
    "overall": {
      "score": 82,
      "gate": "CONCERNS",
      "by_category": {
        "performance":     { "score": 88, "gate": "PASS" },
        "security":        { "score": 75, "gate": "CONCERNS" },
        "reliability":     { "score": 92, "gate": "PASS" },
        "maintainability": { "score": 73, "gate": "CONCERNS" }
      }
    },
    "by_module": {
      "LOGIN":    { "score": 85, "gate": "PASS",     "categories": { ... } },
      "CHECKOUT": { "score": 68, "gate": "CONCERNS", "categories": { ... } }
    },
    "recommendations": [...],
    "critical_failures": [],
    "history": [
      { "date": "2026-04-01", "overall_score": 78 },
      { "date": "2026-05-05", "overall_score": 82 }
    ]
  }
}
```

**Rolling smoothing (avoid score whiplash):**
```
if previous_assessment exists:
  smoothed_score = 0.7 × current + 0.3 × previous
else:
  smoothed_score = current
```

---

### Step 10: Update Progress Log

```markdown
## QA Session N - NFR ASSESS

### Mode: light|deep|full
### Scope: all (or specific module/category)

### Scores:
- Performance:     88/100 (PASS)
- Security:        75/100 (CONCERNS — close to floor)
- Reliability:     92/100 (PASS)
- Maintainability: 73/100 (CONCERNS)
- Overall:         82/100 (CONCERNS)

### Gate: CONCERNS
   Reasons:
   - Security 75 = boundary (almost FAIL)
   - Maintainability 73 < 85 PASS threshold

### Top recommendations:
1. [HIGH/security] Add CSP header on /checkout (30min)
2. [HIGH/maint] Replace waitForTimeout in 5 specs (1hr)
3. [MED/perf] Code-split /admin routes (half-day)

### Next:
- /qa-nfr-assess --module CHECKOUT     # drill-down
- Fix top 3 recommendations
- /qa-nfr-assess again to verify
```

---

### Step 11: Commit (optional)

```bash
git add qa-tracker.json .agent/qa-progress.md test-results/nfr/
git commit -m "qa-nfr: assess overall=82 PASS — 1 critical, 3 high recommendations"
```

---

## Output

### Default mode (full report)

```
🎯 QA NFR Assessment Complete!

📊 Overall Score: 82/100 — CONCERNS ⚠️
   Mode: light | Scope: all modules
   Assessed: 2026-05-05 14:30

╭───────────────────────────────────────────────────────────╮
│  Category          Score  Gate          Trend             │
├───────────────────────────────────────────────────────────┤
│  🚀 Performance     88   PASS  ✅       +3 vs last         │
│  🔒 Security        75   CONCERNS ⚠️     -5 vs last         │
│  🛡️ Reliability     92   PASS  ✅       +2 vs last         │
│  🔧 Maintainability 73   CONCERNS ⚠️     ±0                │
╰───────────────────────────────────────────────────────────╯

📋 Per-Module:
| Module     | Score | Gate     | Weakest        |
|------------|-------|----------|----------------|
| LOGIN      | 85    | PASS     | maintainability|
| PRODUCT    | 90    | PASS     | —              |
| ORDER      | 78    | CONCERNS | security       |
| CHECKOUT   | 68    | CONCERNS | security, perf |

🚨 Top Recommendations (5):

  1. 🔒 [HIGH] Add CSP header on /checkout
     Module: CHECKOUT | Effort: 30min | Impact: +5 score
     Fix: Add `Content-Security-Policy: default-src 'self'` to web.config

  2. 🔧 [HIGH] Replace waitForTimeout(...) in 5 specs
     Module: PRODUCT, CHECKOUT | Effort: 1hr | Impact: +6 score
     Files:
       - tests/TS-CHECKOUT-005.spec.ts:42
       - tests/TS-PRODUCT-009.spec.ts:18
     Fix: Use waitFor({ state: 'visible' }) instead

  3. 🚀 [MED] Code-split /admin/* routes
     Module: ADMIN | Effort: half-day | Impact: +4 score
     Current: bundle 520 KB > 300 KB target

  4. 🔒 [MED] Add IDOR scenario for /admin/users
     Module: AUTH | Effort: 30min | Impact: +3 score
     Add: TS-ADMIN-IDOR-001 (viewer accessing /admin/users → expect 403)

  5. 🛡️ [MED] Stabilize 4 flaky scenarios
     Module: CHECKOUT, PRODUCT | Effort: 1hr | Impact: +4 score
     Run: /qa-edit-scenario {flaky-id} "stabilize wait conditions"

🔜 Next:
   /qa-nfr-assess --deep              — รัน Lighthouse สำหรับ accurate perf
   /qa-nfr-assess --module CHECKOUT   — drill-down weakest module
   /qa-nfr-assess --category security — focus security
   Fix top 3 → /qa-nfr-assess again to track score change
```

### Gate-only mode (CI integration)

```
NFR_OVERALL_SCORE=82
NFR_OVERALL_GATE=CONCERNS
NFR_PERFORMANCE=88
NFR_SECURITY=75
NFR_RELIABILITY=92
NFR_MAINTAINABILITY=73
NFR_BLOCKING_RECOMMENDATIONS=2
```

ใช้ใน CI เพื่อ block merge ถ้า gate = FAIL

> This command responds in Thai (ภาษาไทย)
