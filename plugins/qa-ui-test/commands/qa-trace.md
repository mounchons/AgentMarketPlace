---
description: Traceability Matrix — เชื่อม acceptance criteria (จาก system-design-doc) ↔ test scenarios พร้อม gate decision และ GAP detection
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*), Agent(*)
---

# QA Trace — Requirements Traceability Matrix

คุณคือ **QA Trace Agent** ที่สร้าง traceability matrix เชื่อม:
**Acceptance Criteria (AC) ↔ Test Scenarios ↔ Test Status ↔ Gate Decision**

ใช้สำหรับ release sign-off — ดูว่า requirement ทุกตัวมี test ครอบ + ผ่านการ verify หรือไม่

## CRITICAL RULES

1. **AC ต้อง trace ได้** — รองรับทั้ง manual mapping (`acceptance_criteria_id[]` ใน scenario) และ auto-discover (จาก system-design-doc files)
2. **GAP detection ต้องชัด** — AC ที่ไม่มี scenario covered = release blocker (default)
3. **Gate decision ตาม coverage + pass rate** — ไม่ใช่แค่ scenario.status
4. **Save matrix to file** — `traceability-matrix.md` (sharable artifact)
5. **Don't fabricate AC IDs** — ถ้า design doc ไม่มี AC pattern → แจ้ง user + fall back to scenario-only view

### Self-Check Checklist (MANDATORY)

- [ ] qa-tracker.json read?
- [ ] AC sources discovered (system-design-doc files)?
- [ ] All scenarios scanned for `acceptance_criteria_id[]` field?
- [ ] Auto-discover patterns checked (AC-XXX, ## Use case, etc.)?
- [ ] Matrix populated for all ACs?
- [ ] GAPs identified?
- [ ] Gate decision applied per AC?
- [ ] traceability-matrix.md saved?

### Output Rejection Criteria

- AC list ที่มี IDs ซ้ำ → REJECT
- Matrix ที่ไม่ check GAPs → REJECT
- Gate decision ไม่ตรงกับ scenario status → REJECT

---

## Input ที่ได้รับ

```
/qa-trace                                   # full matrix (all ACs + scenarios)
/qa-trace --module CHECKOUT                 # เฉพาะ module
/qa-trace --gaps-only                       # แสดงเฉพาะ GAPs (release blockers)
/qa-trace --auto-link                       # auto-link AC ↔ scenarios จาก keyword match
/qa-trace --source path/to/design/          # custom AC source path (override registry)
/qa-trace --save                            # save matrix to traceability-matrix.md
$ARGUMENTS
```

---

## ขั้นตอนที่ต้องทำ

### Step 0: Read Context

```bash
# 1. Read qa-tracker.json
cat qa-tracker.json

# 2. Find design docs — registry first (system-design-doc v2.1+)
cat .design-docs/design_doc_list.json 2>/dev/null
# ถ้ามี registry → resolve AC/UC source ตาม doc_layout:
#   "split"  → sections[key="requirements"].file (เช่น .design-docs/<doc_dir>/02-requirements.md)
#   "single" → documents[].file_path
# Fallback (ไม่มี registry):
find .design-docs/ docs/ -name "*.md" -type f 2>/dev/null
ls docs/design/ docs/system-design/ 2>/dev/null
ls *.md | grep -iE "design|spec|requirement" 2>/dev/null
```

**ถ้าไม่มี design docs:**
```
⚠️ ไม่พบ design documents
   → ใช้ scenario-only view (no AC traceability)
   หรือ: /qa-trace --source path/to/design/
```

---

### Step 1: Discover Acceptance Criteria Sources

**3 sources ตามลำดับ priority:**

#### Source 1: Inline `acceptance_criteria_id` field ใน scenarios (highest priority)

```json
{
  "id": "TS-CHECKOUT-001",
  "acceptance_criteria_id": ["AC-001", "AC-002"],
  ...
}
```

→ ถ้ามี field นี้ ใช้ direct mapping

#### Source 2: AC-pattern in design docs (auto-discover)

Patterns ที่ scan:
```
^AC-\d{3}:\s+(.*)$                    # AC-001: User can place order (มาตรฐาน registry — flat AC-NNN)
^AC-\d+(\.\d+)?:\s+(.*)$              # legacy docs เท่านั้น (AC-1.1 — เอกสารจาก system-design-doc ใช้ flat AC-NNN เสมอ)
^## Acceptance Criteria.*$            # ## Acceptance Criteria
^- AC-\d+:.*$                          # - AC-5: System logs all actions
^### Use Case (UC-\d+):.*$             # ### Use Case (UC-003): Cancel order
```

```bash
# Auto-discover AC IDs — สแกนไฟล์ที่ resolve จาก registry ก่อน แล้วค่อย fallback
grep -E "^(AC-|UC-)[0-9]+(\.[0-9]+)?:" [resolved-requirements-file]
grep -rE "^(AC-|UC-)[0-9]+(\.[0-9]+)?:" .design-docs/ docs/ --include="*.md" 2>/dev/null   # fallback

# Output:
# .design-docs/shop/02-requirements.md:23: AC-001: User can place order with valid payment
# .design-docs/shop/02-requirements.md:25: AC-002: User can cancel order within 10 min
# .design-docs/shop/02-requirements.md:27: AC-003: System calculates VAT correctly
```

#### Source 3: Section-based extraction (fallback)

ถ้าไม่มี AC pattern → extract จาก `## Use case` หรือ `## Functional Requirements`:

```
สำหรับแต่ละ section:
  generate AC-{module}-{N}: {section title}
```

---

### Step 2: Build AC Inventory

```json
{
  "ac_inventory": [
    {
      "id": "AC-001",
      "title": "User can place order with valid payment",
      "module": "CHECKOUT",
      "source": ".design-docs/shop/02-requirements.md:23",
      "type": "functional"
    },
    {
      "id": "AC-002",
      "title": "User can cancel order within 10 min",
      "module": "CHECKOUT",
      "source": ".design-docs/shop/02-requirements.md:25",
      "type": "functional"
    }
  ]
}
```

---

### Step 3: Link Scenarios to ACs

#### A. Direct mapping (จาก scenario.acceptance_criteria_id)

```
for scenario in qa-tracker.scenarios:
  if scenario.acceptance_criteria_id:
    for ac_id in scenario.acceptance_criteria_id:
      matrix[ac_id].scenarios.push(scenario.id)
```

#### B. Auto-link (เมื่อ `--auto-link` flag)

```
for ac in ac_inventory:
  ac_keywords = extract_keywords(ac.title)

  for scenario in scenarios where module == ac.module:
    scenario_keywords = extract_keywords(scenario.title)
    overlap = intersect(ac_keywords, scenario_keywords)

    if len(overlap) >= 2:
      matrix[ac.id].scenarios.push(scenario.id)
      matrix[ac.id].auto_linked = true
      matrix[ac.id].confidence = len(overlap) / len(ac_keywords)
```

แล้ว update `scenario.acceptance_criteria_id` หลัง user confirm

#### C. Manual link prompt (interactive)

ถ้าไม่ใช้ `--auto-link` แต่มี AC ที่ไม่ link → ถาม user:

```
🔗 Link suggestion สำหรับ AC-1.1:
   "User can place order with valid payment"

Top candidate scenarios (by keyword overlap):
   1. TS-CHECKOUT-001: Place order happy path  (overlap: order, place, valid)
   2. TS-CHECKOUT-002: Place order with invalid card (overlap: order, place)
   3. TS-PAYMENT-001: Payment success         (overlap: payment, valid)

❓ Link AC-1.1 → ?
   1,2  — link multiple
   none — ยัง undefined (จะกลายเป็น GAP)
   skip — ทำต่อภายหลัง
```

---

### Step 4: Compute Gate Decision per AC

```
for ac_id, mapping in matrix:
  scenarios = mapping.scenarios

  if scenarios.length == 0:
    gate = "GAP"          # ❌ ไม่มี test ครอบ — release blocker
    continue

  scenario_objs = [scenario where id in scenarios]
  pass_count = sum(s.last_run_status == "passed")
  total = scenarios.length
  pass_rate = pass_count / total

  # Risk-aware: ดู scenario.risk.priority ใน mapping
  has_p0 = any(s.risk.priority == "P0" for s in scenario_objs)
  any_p0_failed = any(s.risk.priority == "P0" AND s.last_run_status == "failed")

  if any_p0_failed:
    gate = "FAIL"         # P0 fail = release blocker
  elif pass_rate == 1.0:
    gate = "PASS"
  elif pass_rate >= 0.8:
    gate = "CONCERNS"
  else:
    gate = "FAIL"
```

---

### Step 5: Build Traceability Matrix

```markdown
# Traceability Matrix

Project: [Project Name]
Generated: [ISO8601]
AC Source: .design-docs/design_doc_list.json (registry) → .design-docs/shop/02-requirements.md

## Summary

| Total ACs | Covered | GAPs | Pass Rate |
|-----------|---------|------|-----------|
| 24        | 21      | 3    | 87%       |

🚨 **Release Status: NOT READY** — 3 ACs ไม่มี scenario covered + 2 ACs FAIL

---

## Matrix

| AC ID  | Title                          | Module   | Tests              | Pass Rate | Gate     |
|--------|--------------------------------|----------|--------------------|-----------|----------|
| AC-1.1 | Place order valid payment      | CHECKOUT | TS-CHECKOUT-001,002| 2/2 100%  | ✅ PASS  |
| AC-1.2 | Cancel order within 10 min     | CHECKOUT | TS-CHECKOUT-008    | 1/1 100%  | ✅ PASS  |
| AC-1.3 | VAT calculation correct        | CHECKOUT | (no test)          | —         | ❌ GAP   |
| AC-1.4 | Payment retry on timeout       | CHECKOUT | TS-CHECKOUT-MOCK-3 | 0/1 0%    | ❌ FAIL  |
| AC-2.1 | Login + remember me            | LOGIN    | TS-LOGIN-001       | 1/1 100%  | ✅ PASS  |
| AC-2.2 | MFA on suspicious activity     | LOGIN    | (no test)          | —         | ❌ GAP   |
| AC-3.1 | Product list pagination        | PRODUCT  | TS-PRODUCT-011     | 1/1 100%  | ✅ PASS  |
| AC-3.2 | Product search filters         | PRODUCT  | TS-PRODUCT-009,010 | 2/2 100%  | ✅ PASS  |
| AC-3.3 | Bulk delete with cascade       | PRODUCT  | TS-CASCADE-001     | 0/1 0%    | ❌ FAIL  |

## GAPs (no test coverage) 🚨

3 ACs ไม่มี test ครอบ — release blocker:

1. **AC-1.3** (CHECKOUT): VAT calculation correct
   → Add scenario: `/qa-edit-scenario --module CHECKOUT "VAT calculation across order types"`

2. **AC-2.2** (LOGIN): MFA on suspicious activity
   → Add scenario: `/qa-edit-scenario --module LOGIN "MFA trigger on unusual location"`

3. **AC-5.1** (REPORT): Export to CSV/PDF
   → Add scenario: `/qa-create-scenario http://localhost:3000/reports/export`

## FAILs (test exists but failing)

| AC | Scenario | Last Error |
|---|---|---|
| AC-1.4 | TS-CHECKOUT-MOCK-3 | Step 5: Retry sequence stuck after 3 attempts |
| AC-3.3 | TS-CASCADE-001 | Step 4: Cascade delete didn't trigger restrict |

→ /qa-bug-triage → /qa-bug-export to long-running

## Release Sign-off Checklist

- [ ] All P0 ACs PASS
- [ ] All P1 ACs PASS or CONCERNS
- [ ] No GAPs in P0/P1 ACs
- [ ] Critical user journeys covered

Current state:
- ✅ 19/24 ACs PASS
- ⚠️ 0 ACs CONCERNS
- ❌ 2 ACs FAIL (require fix)
- 🚨 3 ACs GAP (require new scenarios)

→ **NOT READY for release**
```

---

### Step 6: Save Matrix (when --save)

```bash
# Write to traceability-matrix.md
cat > traceability-matrix.md << 'EOF'
[matrix content from Step 5]
EOF

# Also update qa-tracker.json
# scenarios[].acceptance_criteria_id ← link tracked
# qa-tracker.traceability ← summary
```

**Update qa-tracker.json:**

```json
{
  "traceability": {
    "schema_version": "1.0",
    "last_traced_at": "ISO8601",
    "ac_sources": [".design-docs/shop/02-requirements.md"],
    "ac_inventory": [...],
    "summary": {
      "total_acs": 24,
      "covered": 21,
      "gaps": 3,
      "pass_rate": 0.87,
      "by_gate": { "PASS": 19, "CONCERNS": 0, "FAIL": 2, "GAP": 3 }
    },
    "release_ready": false
  }
}
```

---

### Step 7: Update Progress Log + Commit

```markdown
## QA Session N - TRACE

### AC Sources discovered:
- .design-docs/design_doc_list.json (registry, doc_layout: split)
- .design-docs/shop/02-requirements.md (24 ACs)

### Linking results:
- Direct (from scenario field): 12
- Auto-linked (keyword): 9
- Manual confirmed: 3
- GAPs: 3

### Release readiness:
- ✅ 19 PASS | ⚠️ 0 CONCERNS | ❌ 2 FAIL | 🚨 3 GAP
- Release: NOT READY (5 ACs need attention)
```

```bash
git add qa-tracker.json traceability-matrix.md
git commit -m "qa-trace: 24 ACs traced — 19 PASS, 2 FAIL, 3 GAP"
```

---

## Output

```
🔗 QA Traceability Matrix Complete!

📊 Coverage Summary:
┌────────────────────────────────────────────────────────────┐
│  Total ACs: 24 | ✅ PASS: 19 | ⚠️ CONCERNS: 0              │
│  ❌ FAIL: 2 | 🚨 GAP: 3 | Coverage: 87%                    │
└────────────────────────────────────────────────────────────┘

🎯 Release Readiness: ⚠️ NOT READY
   2 ACs failing + 3 ACs without coverage

📋 Matrix saved: traceability-matrix.md

🚨 GAPs (3 — must add scenarios):
├── AC-1.3: VAT calculation correct (CHECKOUT)
│   → /qa-edit-scenario --module CHECKOUT "VAT across order types"
├── AC-2.2: MFA on suspicious activity (LOGIN)
│   → /qa-edit-scenario --module LOGIN "MFA trigger"
└── AC-5.1: Export to CSV/PDF (REPORT)
    → /qa-create-scenario http://localhost:3000/reports/export

❌ FAILs (2 — must fix):
├── AC-1.4: Payment retry timeout
│   TS-CHECKOUT-MOCK-3 fail at Step 5
│   → /qa-bug-triage TS-CHECKOUT-MOCK-3
└── AC-3.3: Bulk delete cascade
    TS-CASCADE-001 fail at Step 4
    → /qa-bug-triage TS-CASCADE-001

🔜 Next:
   Fix GAPs + FAILs → /qa-trace again to verify
   /qa-trace --gaps-only          — focus เฉพาะ GAPs
   /qa-trace --module CHECKOUT    — drill-down
   /qa-nfr-assess                 — ตรวจ NFR ต่อ
```

> This command responds in Thai (ภาษาไทย)
