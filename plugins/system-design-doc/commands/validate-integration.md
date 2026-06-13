---
description: Validate cross-references across all 4 plugins (system-design-doc, ui-mockup, long-running, qa-ui-test) — read-only report
allowed-tools: Bash(*), Read(*), Glob(*), Grep(*)
---

# /validate-integration

Validate cross-references and consistency across 4 plugins: system-design-doc, ui-mockup, long-running, **qa-ui-test**

---

## Usage

```
/validate-integration
```

---

## Purpose

1. **Validate Cross-References** - Verify that references are correct and exist
2. **Check Consistency** - Verify data consistency
3. **Detect Orphans** - Find orphan items without references
4. **Generate Report** - Create a comprehensive integration report

---

## Process

### Step 1: Read All Files

```bash
# Read design_doc_list.json
cat design_doc_list.json

# Read mockup_list.json
cat .mockups/mockup_list.json

# Read feature_list.json
cat feature_list.json

# Read qa-tracker.json (path from design_doc_list.integration.qa_tracker_path)
cat qa-tracker.json
```

> **Note**: qa-tracker.json is **optional** — if missing, skip qa-related checks and emit a warning (do not fail validation).

### Step 2: Validate Schema Compatibility

```
Check schema versions:
- design_doc_list.json: 2.3.0 (accept >= 2.2.0)
- mockup_list.json:     1.7.0  (or 1.8.0 with QA factor inference)
- feature_list.json:    1.10.0 (or 2.4.0 with NFR + coverage gates)
- qa-tracker.json:      1.7.0  (optional)

Verify compatibility:
- design_doc requires mockup     >= 1.6.0  ✅
- design_doc requires feature    >= 1.10.0 ✅
- design_doc requires qa-tracker >= 1.7.0  ✅ (or warn if missing)
- mockup     requires design_doc >= 2.0.0  ✅
- feature    requires design_doc >= 2.0.0  ✅
- qa-tracker requires design_doc >= 2.2.0  ⚠️ (warn-only when older)
```

### Step 3: Validate Entity References

```
Design Doc Entities ↔ Mockup Entities ↔ Feature Entities

For each entity in design_doc:
  1. Check mockup_entity_ref exists in mockup_list
  2. Check feature_ids exist in feature_list
  3. Verify CRUD operations are defined (enabled/disabled)
  4. Check delete strategy (soft/hard)

Report:
✅ ENT-001 "User"
   - mockup_entity_ref: User ✅
   - feature_ids: [3, 5, 6, 7, 8, 9] ✅
   - CRUD: C✅ R✅ U✅ D✅(soft) L✅
   - Delete strategy: soft ✅

⚠️ ENT-002 "Department"
   - mockup_entity_ref: Department ✅
   - feature_ids: [] ❌ No features reference this entity
   - CRUD: C✅ R✅ U✅ D✅(soft) L✅  (defined but no features yet)

ℹ️ ENT-011 "AuditLog"
   - mockup_entity_ref: AuditLog ✅
   - feature_ids: [30] ✅
   - CRUD: C❌(disabled) R✅ U❌(disabled) D❌(disabled) L✅
   - Note: Read-only entity — C/U/D intentionally disabled
```

### Step 4: Validate API References

```
Design Doc APIs ↔ Feature APIs ↔ Mockup Pages

For each api_endpoint in design_doc:
  1. Check feature_id exists in feature_list
  2. Check page_refs exist in mockup_list
  3. Verify bidirectional references

Report:
✅ API-001 "GET /api/users"
   - feature_id: 5 ✅
   - page_refs: [004] ✅
   - Feature #5 has design_doc_refs.api_ref: API-001 ✅

❌ API-006 "GET /api/products"
   - feature_id: null ❌ No feature implements this API
   - page_refs: [] ❌ No mockup pages
```

### Step 5: Validate Mockup References

```
Mockup Pages ↔ Design Sections ↔ Features

For each page in mockup_list:
  1. Check design_doc_section is valid
  2. Check design_doc_api_refs exist
  3. Check implemented_by_features exist

Report:
✅ Page 001 "Login"
   - design_doc_section: authentication ✅
   - implemented_by_features: [20] ✅
   - Feature #20 has mockup_page_refs: [001] ✅

⚠️ Page 003 "Dashboard"
   - design_doc_section: dashboard ✅
   - implemented_by_features: [] ⚠️ No features yet
```

### Step 5b: Validate Acceptance Criteria Coverage (qa-ui-test integration)

> **Backward-compat**: If `documents[].acceptance_criteria[]` is empty AND no AC pattern found in markdown → emit **WARN** only (do not fail). Score this section as `n/a` instead of `0%`.

```
For each AC in design_doc.documents[].acceptance_criteria:
  1. Check linked_scenarios[] is non-empty
  2. For each linked scenario_id:
     - Verify scenario exists in qa-tracker.scenarios[]
     - Check scenario.acceptance_criteria_id[] includes this AC ID (bidirectional)
  3. Compute AC gate:
     - PASS    — at least 1 linked scenario AND latest run = passed
     - FAIL    — all linked scenarios failed
     - GAP     — zero linked scenarios (release blocker)
     - PENDING — scenarios linked but not run yet

Report:
✅ AC-001 "User can place order with valid payment"
   - Module: CHECKOUT
   - Linked: TS-CHECKOUT-001 ✅, TS-CHECKOUT-002 ✅
   - Bidirectional: ✅
   - Gate: PASS

⚠️ AC-003 "VAT calculation correct"
   - Linked: TS-CHECKOUT-005 ❌ (FAIL — bug BUG-001)
   - Gate: FAIL

❌ AC-004 "User can cancel order within 10min"
   - Linked: [] ❌
   - Gate: GAP — release blocker
```

### Step 5c: Validate Use Case Coverage

```
For each UC in design_doc.documents[].use_cases:
  1. Check linked_scenarios[] is non-empty
  2. Check ac_refs[] all exist in acceptance_criteria[]
  3. Verify each ac_ref AC has at least 1 scenario

Report:
✅ UC-001 "Place Order"
   - AC Refs: AC-001, AC-002 (both PASS)
   - Linked scenarios: 5
   - Coverage: complete

⚠️ UC-003 "Refund"
   - AC Refs: AC-007 (GAP)
   - Linked scenarios: 0
   - Coverage: incomplete
```

### Step 5d: Validate Long-Running Release Gates (if feature_list >= 2.4.0)

```
For each feature in feature_list.features[]:
  1. Check feature.acceptance_criteria_id[] (if present in schema)
     - Verify all AC IDs exist in design_doc
  2. Check feature.qa_trace_coverage.gap_acs[] (if present)
     - Should be empty for "passed" features
  3. Check feature.nfr_compliance (if present)
     - All required NFRs must have score >= required when blocks_release=true

Report:
✅ Feature #5 "Place Order API"
   - AC: AC-001, AC-002 → both PASS
   - Coverage gaps: 0
   - NFR: security 75/75 PASS, performance 88/85 PASS
   - Release-ready: YES

⚠️ Feature #7 "Cancel Order"
   - AC: AC-005 → GAP
   - Coverage gaps: 1 (AC-005)
   - Release-ready: NO
```

### Step 6: Detect Orphans

```
ORPHAN DETECTION:

Design Doc:
- Entities without mockup refs: 0
- APIs without feature refs: 1
- Diagrams without refs: 0
- ACs without scenarios (GAP): 3
- UCs without scenarios: 1

Mockups:
- Pages without features: 2
- Entities without design_doc refs: 0
- Pages without AC refs: 4 (warn-only)

Features:
- Features without design_doc refs: 3
- Features without mockup refs: 5
- Features without AC refs: 2 (warn-only when feature_list < 2.4.0)

QA Tracker:
- Scenarios without acceptance_criteria_id[]: 6
- ACs missing in design_doc but referenced by scenarios: 0
```

### Step 7: Check Layer Consistency

```
LAYER CONSISTENCY:

Design Doc Layers:
- presentation: sitemap, flow_diagrams, ui_mockups
- application: dfd, sequence_diagrams
- domain: er_diagram, data_dictionary
- infrastructure: data_model, modules

Feature Layers:
- presentation: 5 features
- domain: 2 features
- infrastructure: 2 features
- cross-cutting: 3 features

Mockup Categories:
- auth: 2 pages
- main: 1 page
- list: 2 pages
- form: 1 page
- detail: 1 page

✅ All layers are consistent
```

---

## Output Format

```
╔════════════════════════════════════════════════════════════════════╗
║                 CROSS-PLUGIN INTEGRATION REPORT                     ║
╠════════════════════════════════════════════════════════════════════╣
║ Generated: 2026-05-05T10:00:00Z                                     ║
║ Plugins: system-design-doc, ui-mockup, long-running, qa-ui-test     ║
╠════════════════════════════════════════════════════════════════════╣

1. SCHEMA COMPATIBILITY
   ─────────────────────
   design_doc_list.json: v2.3.0 ✅
   mockup_list.json:     v1.7.0 ✅
   feature_list.json:    v2.4.0 ✅
   qa-tracker.json:      v1.7.0 ✅ (or "missing — qa checks skipped")

   All schemas are compatible ✅

2. ENTITY COVERAGE
   ────────────────
   ┌──────────┬────────────┬──────────┬─────────────┐
   │ Entity   │ Design Doc │ Mockup   │ Features    │
   ├──────────┼────────────┼──────────┼─────────────┤
   │ User     │ ENT-001 ✅ │ User ✅  │ [3-9] ✅    │
   │ Dept     │ ENT-002 ✅ │ Dept ✅  │ [] ❌       │
   └──────────┴────────────┴──────────┴─────────────┘

   Coverage: 1/2 entities fully integrated (50%)

3. API COVERAGE
   ─────────────
   ┌─────────────────────────┬─────────┬──────────┐
   │ API Endpoint            │ Feature │ Page     │
   ├─────────────────────────┼─────────┼──────────┤
   │ GET /api/users          │ #5 ✅   │ 004 ✅   │
   │ GET /api/users/{id}     │ #6 ✅   │ 006 ✅   │
   │ POST /api/users         │ #7 ✅   │ 005 ✅   │
   │ PUT /api/users/{id}     │ #8 ✅   │ 005 ✅   │
   │ DELETE /api/users/{id}  │ #9 ✅   │ - ✅     │
   └─────────────────────────┴─────────┴──────────┘

   Coverage: 5/5 APIs fully integrated (100%)

4. PAGE ↔ FEATURE COVERAGE
   ─────────────────────────
   ┌──────────────┬─────────────┬───────────────┐
   │ Page         │ Features    │ Design Section│
   ├──────────────┼─────────────┼───────────────┤
   │ 001 Login    │ [20] ✅     │ auth ✅       │
   │ 002 Register │ [] ⚠️      │ auth ✅       │
   │ 003 Dashboard│ [] ⚠️      │ dashboard ✅  │
   │ 004 User List│ [5] ✅      │ user-mgmt ✅  │
   │ 005 User Form│ [7,8] ✅    │ user-mgmt ✅  │
   │ 006 User Det │ [6] ✅      │ user-mgmt ✅  │
   │ 007 Dept List│ [] ⚠️      │ master ✅     │
   └──────────────┴─────────────┴───────────────┘

   Coverage: 4/7 pages have features (57%)

5. ORPHAN SUMMARY
   ───────────────
   ⚠️ Orphan Items Detected:

   Design Doc:
   - 0 orphan entities
   - 0 orphan APIs

   Mockups:
   - 3 pages without features (002, 003, 007)

   Features:
   - 3 features without design_doc refs (#1, #2, #10)
   - 5 features without mockup refs (#1-4, #10-12)

6. ACCEPTANCE CRITERIA COVERAGE (qa-ui-test)
   ──────────────────────────────────────────
   ┌────────┬────────────────────┬──────────┬──────┐
   │ AC ID  │ Title              │ Scenarios│ Gate │
   ├────────┼────────────────────┼──────────┼──────┤
   │ AC-001 │ Place order valid  │ 2 ✅     │ PASS │
   │ AC-002 │ Cart >= 1 item     │ 1 ✅     │ PASS │
   │ AC-003 │ VAT correct        │ 1 ❌     │ FAIL │
   │ AC-004 │ Cancel within 10m  │ 0        │ GAP  │
   │ AC-005 │ Refund flow        │ 0        │ GAP  │
   └────────┴────────────────────┴──────────┴──────┘

   Coverage: 3/5 ACs covered (60%) — 2 GAPs, 1 FAIL
   Release Ready: NO (2 GAPs are release blockers)

7. USE CASE COVERAGE
   ──────────────────
   - UC-001 "Place Order" → 5 scenarios ✅
   - UC-002 "Cancel Order" → 2 scenarios ✅
   - UC-003 "Refund" → 0 scenarios ❌

8. SYNC STATUS
   ────────────
   ┌─────────────────────┬──────────────────────────┐
   │ Integration         │ Last Synced              │
   ├─────────────────────┼──────────────────────────┤
   │ Design ↔ Mockup     │ 2026-05-05T10:00:00Z ✅  │
   │ Design ↔ Feature    │ 2026-05-05T10:00:00Z ✅  │
   │ Design ↔ QA Tracker │ 2026-05-05T10:00:00Z ✅  │
   │ Mockup ↔ Feature    │ 2026-05-05T09:30:00Z ⚠️  │
   └─────────────────────┴──────────────────────────┘

9. RECOMMENDATIONS
   ────────────────
   HIGH Priority (release blockers):
   - [ ] AC-004, AC-005 → run /qa-ui-test:qa-create-scenario
   - [ ] Fix AC-003 FAIL → /qa-ui-test:qa-bug-list
   - [ ] Create features for Department entity

   MEDIUM Priority:
   - [ ] Add design_doc_refs to features #1, #2, #10
   - [ ] Run /sync-with-qa-tracker to refresh AC coverage

   LOW Priority:
   - [ ] Run /sync-with-mockups to update Feature ↔ Mockup sync

╠════════════════════════════════════════════════════════════════════╣
║ OVERALL INTEGRATION SCORE: 68% (Needs Improvement)                  ║
║                                                                      ║
║ Breakdown:                                                           ║
║ - Entity Integration: 50%                                            ║
║ - API Integration:    100%                                           ║
║ - Page Integration:   57%                                            ║
║ - AC Coverage:        60%                                            ║
║ - UC Coverage:        67%                                            ║
║ - Sync Freshness:     95%                                            ║
║                                                                      ║
║ Release Ready: NO — 2 GAP ACs are release blockers                   ║
╚════════════════════════════════════════════════════════════════════╝
```

---

## Validation Rules Applied

```json
{
  "validation_rules": {
    "entity_must_have_mockup_pages": true,
    "api_must_have_feature": true,
    "page_must_have_feature": true,
    "diagram_file_must_exist": false,
    "layer_consistency": true,
    "crud_must_be_defined": true,
    "crud_default_delete_strategy": "soft",
    "bidirectional_refs": true
  }
}
```

---

## Integration Score Calculation

```
Score = weighted average of:
- Entity Integration (15%): entities with all 3 references
- API Integration    (15%): APIs with feature + page references
- Page Integration   (15%): pages with feature references
- AC Coverage        (25%): % of ACs with passing scenarios (qa-ui-test)
- UC Coverage        (15%): % of UCs with at least 1 scenario
- Sync Freshness     (15%): how recent sync timestamps are

If qa-tracker.json is missing:
- AC + UC weights collapse to 0; redistribute proportionally to other dims
- Report: "qa-tracker.json not found — AC/UC coverage skipped"

Rating:
- 90-100%: Excellent
- 75-89%:  Good
- 50-74%:  Needs Improvement
- <50%:    Critical

Release-Ready Override:
- ANY AC with gate=GAP    → release blocker (regardless of total score)
- ANY AC with gate=FAIL   → release blocker
- ANY feature.nfr_compliance.[*].blocks_release=true && score<required → blocker
```

---

## When to Run

- Before sprint planning
- After sync commands
- When you need an overview of integration status
- Before release to validate completeness

---

## Notes

- Read-only command — does not modify files
- Takes longer than sync commands (comprehensive check)
- Generates recommendations automatically
- Supports partial integration (incomplete projects)

> 💬 **Note**: This command responds in Thai (คำสั่งนี้จะตอบกลับเป็นภาษาไทย)
