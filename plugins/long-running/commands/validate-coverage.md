# /validate-coverage

Validate feature coverage to ensure completeness against mockups, design docs, and requirements.

---

## Usage

```
/validate-coverage
```

---

## Purpose

1. **Mockup Coverage** — does every mockup page have a feature implementing it?
2. **Design Coverage** — does every entity/flow in design doc have a feature?
3. **Component Coverage** — are required_components complete?
4. **Acceptance Criteria** — does every feature have criteria?
5. **Reference Coverage** — do UI features have mockup references?

---

## Process

### Step 1: Gather Sources

```bash
# Design docs
ls -la *system-design*.md docs/*system-design*.md 2>/dev/null

# Mockups
ls -la .mockups/mockup_list.json .mockups/*.mockup.md 2>/dev/null

# Feature list
cat feature_list.json
```

### Step 2: Mockup Coverage Check

```
For each page in mockup_list.json:
  - Find features with reference to this page's mockup
  - If found → covered
  - If not found → gap

Coverage = (covered pages / total pages) * 100%
```

### Step 3: Design Doc Coverage Check

```
For each entity in ER Diagram:
  - Check: entity feature exists?
  - Check: CRUD API features exist?
  - Check: validation feature exists?

For each flow in Flow Diagram:
  - Check: flow features exist?
  - Check: all steps covered?

Coverage = (covered items / total items) * 100%
```

### Step 4: Component Coverage Check

```
For each feature with required_components:
  - Verify components are standard/available
  - Flag unknown components
  - Check design tokens usage

Coverage = (features with components / UI features) * 100%
```

### Step 5: Acceptance Criteria Check

```
For each feature:
  - Check acceptance_criteria array not empty
  - Check criteria are testable
  - Check criteria match feature description

Coverage = (features with criteria / total features) * 100%
```

### Flow Coverage Validation (v2.0.0)

**Validate flow completeness:**

1. **Orphan features**: features with `flow_id` but not in `flows[].steps`
2. **Missing steps**: flows with `steps[].feature_id` referencing non-existent features
3. **State contract integrity**:
   - State consumed but no feature produces it → ❌ Error
   - State produced but no feature consumes it → ⚠️ Warning (unused state)
   - `produced_by` / `consumed_by` match features that declare `state_produces` / `state_consumes`
4. **Component requirements**:
   - Features with `requires_components` → verify component has a feature that creates it
   - Components in `shared_components` not used by any feature → ⚠️ Warning
5. **Flow completeness**:
   - Wizard flows must have entry_conditions (at least description)
   - Wizard flows with > 2 steps should have error_paths
   - Crud-group flows should have both list + form features

**Output format:**

```
🔍 Flow & State Validation:

  Flows: 3 total
  ├── ✅ checkout (wizard) — 4 steps, entry/exit defined
  ├── ✅ user-management (crud-group) — 3 steps
  └── ⚠️ dashboard (parallel) — no entry_conditions defined

  State Contracts: 4 total
  ├── ✅ AuthState — produced by #1, consumed by #3,#4,#5,#6
  ├── ✅ CartState — produced by #3, consumed by #4,#5
  ├── ❌ ShippingState — consumed by #5 but no producer!
  └── ⚠️ TempState — produced by #7 but never consumed

  Component Requirements: 5 components
  ├── ✅ AuthGuard — Feature #2 (passed)
  ├── ✅ DataTable — Feature #3 (passed)
  └── ❌ StepIndicator — no feature creates this component
```

---

## Output Format

### Coverage Report

```
╔════════════════════════════════════════════════════════════╗
║                   COVERAGE REPORT                           ║
╠════════════════════════════════════════════════════════════╣
║ Generated: 2025-01-04T10:00:00Z                            ║
╠════════════════════════════════════════════════════════════╣

1. MOCKUP COVERAGE                                    [85%]
   ─────────────────────────────────────────────────────────
   Total mockup pages: 20
   Covered by features: 17
   Missing: 3

   ❌ Missing mockup coverage:
   - 003-dashboard.mockup.md (Dashboard)
   - 007-department-list.mockup.md (Department List)
   - 010-settings.mockup.md (Settings)

   → Run /generate-features-from-mockups

2. DESIGN DOC COVERAGE                                [100%]
   ─────────────────────────────────────────────────────────
   Entities: 5/5 (100%)
   - ✅ User: entity, CRUD, validation
   - ✅ Product: entity, CRUD, validation
   - ✅ Category: entity, CRUD
   - ✅ Order: entity, CRUD, validation
   - ✅ OrderItem: entity (child)

   Flows: 3/3 (100%)
   - ✅ User Registration: 5/5 steps
   - ✅ Order Checkout: 7/7 steps
   - ✅ Product Search: 3/3 steps

3. COMPONENT COVERAGE                                 [94%]
   ─────────────────────────────────────────────────────────
   UI features with components: 16/17

   ⚠️ Features missing component specs:
   - Feature #25 "Settings page" - no required_components

   Unknown components found: 0

4. ACCEPTANCE CRITERIA                                [88%]
   ─────────────────────────────────────────────────────────
   Features with criteria: 22/25

   ⚠️ Features missing acceptance criteria:
   - Feature #10 "User validation"
   - Feature #18 "Category CRUD"
   - Feature #24 "Error handling"

5. REFERENCE COVERAGE                                 [90%]
   ─────────────────────────────────────────────────────────
   UI features with mockup refs: 15/17
   Design features with doc refs: 20/20

   ⚠️ Features missing references:
   - Feature #25 "Settings page" - no mockup
   - Feature #26 "Profile page" - no mockup

╠════════════════════════════════════════════════════════════╣
║ OVERALL COVERAGE: 91%                                       ║
╠════════════════════════════════════════════════════════════╣
║                                                              ║
║ RECOMMENDATIONS:                                             ║
║ 1. Create mockups for: Dashboard, Department List, Settings ║
║ 2. Add acceptance criteria to: #10, #18, #24                ║
║ 3. Add mockup refs to: #25, #26                             ║
║                                                              ║
╚════════════════════════════════════════════════════════════╝
```

---

## Coverage Thresholds

| Level | Coverage | Status |
|-------|----------|--------|
| Excellent | 95-100% | Ready for development |
| Good | 80-94% | Minor gaps, proceed with caution |
| Fair | 60-79% | Significant gaps, review needed |
| Poor | <60% | Major gaps, not ready |

---

## Detailed Gap Analysis

### Mockup Gaps

```json
{
  "missing_features_for_mockups": [
    {
      "mockup_id": "003",
      "mockup_name": "Dashboard",
      "mockup_file": ".mockups/003-dashboard.mockup.md",
      "components": ["Chart", "StatCard", "Table"],
      "suggested_epic": "ui-main",
      "suggested_priority": "high"
    }
  ]
}
```

### Design Doc Gaps

```json
{
  "missing_features_for_entities": [
    {
      "entity": "AuditLog",
      "missing": ["entity", "crud-list", "crud-get"],
      "found_in": "system-design.md#er-diagram"
    }
  ]
}
```

### Acceptance Criteria Gaps

```json
{
  "features_without_criteria": [
    {
      "id": 10,
      "description": "User validation",
      "category": "quality",
      "suggested_criteria": [
        "validation rules work correctly",
        "error messages are clear",
        "invalid input is rejected"
      ]
    }
  ]
}
```

---

## Integration with Other Commands

| Command | When to Use |
|---------|-------------|
| `/generate-features-from-mockups` | When mockup coverage < 100% |
| `/generate-features-from-design` | When design coverage < 100% |
| `/sync-mockups` | After fixing mockup references |
| `/continue` | When coverage is acceptable |

---

## 6. Implementation Quality Audit (v2.3.0 — from audit findings)

> **Background**: Audit found 59 features marked "passed" with build-only verification.
> This section validates that completed features are ACTUALLY complete.

### Step 6.1: Entity Count vs Design Document

```
IF Design Document exists:
  Count entities in code: find src/ -name "*.cs" -path "*/Entities/*" | wc -l
  Count tables in DD: grep "### 8\." .design-docs/*.md | wc -l

  Entity Count:
  ├── Code entities: 48
  ├── DD tables: 55
  └── ❌ Missing 7 entities: [list]
```

### Step 6.2: API Endpoint Completeness

```
For each entity with CRUD features:
  Check: POST, GET, PUT/PATCH, DELETE endpoints exist?

  CRUD Completeness:
  ├── ✅ Customers: C+R+U+D all present
  ├── ❌ Jobs: C+R+D present, missing UPDATE (PUT)
  ├── ❌ Credits: C+R present, missing U+D
  └── Coverage: 8/12 entities fully CRUD
```

### Step 6.3: Mock Data Detection

```
For each UI feature marked "passed":
  Check: uses real API hooks or hardcoded data?

  Mock Data Detection:
  ├── ✅ /customers — uses useCustomers() hook
  ├── ❌ /reports/dashboard — hardcoded mock KPIs
  ├── ❌ /reports/profit-loss — hardcoded mock data
  └── Real API: 15/22 pages, Mock: 7/22 pages
```

### Step 6.4: Test Count per Module

```
For each module:
  Count: unit tests, integration tests, E2E tests

  Test Coverage by Module:
  ├── Auth: 12 unit, 3 integration ✅
  ├── Customers: 8 unit, 2 integration ✅
  ├── Bills: 0 unit, 0 integration ❌
  ├── Receipts: 0 unit, 0 integration ❌
  ├── Inventory: 0 unit, 0 integration ❌
  └── Financial modules: 0 tests total ❌ CRITICAL
```

### Step 6.5: Library Audit (CLAUDE.md vs Actual)

```
IF CLAUDE.md lists "Key Libraries":
  For each library:
    Check: actually imported/used in code?

  Library Audit:
  ├── ✅ MediatR: used (123 references)
  ├── ✅ FluentValidation: used (45 references)
  ├── ❌ QuestPDF: listed but NOT installed/used
  ├── ❌ ClosedXML: listed but NOT installed/used
  └── Used: 8/10 libraries
```

### Step 6.6: Config Flag Compliance

```
Read .agent/config.json:
  max_features_per_session: 1 → Check: any sessions violated?
  require_tests: true → Check: all passed features have tests?
  tdd_approach: true → Check: test commits before code commits?

  Config Compliance:
  ├── max_features_per_session: ❌ Sessions 62-70 did 2-3 features/session
  ├── require_tests: ❌ 34 features have build-only verification
  └── tdd_approach: ❌ No TDD detected — code-first in all sessions
```

### Output for Implementation Quality Audit

```
6. IMPLEMENTATION QUALITY AUDIT                  [62%]
   ─────────────────────────────────────────────────────────
   Entity Coverage: 48/55 (87%) — 7 missing from DD
   CRUD Completeness: 8/12 entities (67%) — 4 incomplete
   Real API Usage: 15/22 pages (68%) — 7 use mock data
   Test Coverage: 253 tests but 8 modules have 0 tests
   Library Usage: 8/10 libraries (80%) — 2 missing
   Config Compliance: 1/3 flags (33%) — 2 ignored

   ❌ CRITICAL: Financial modules have 0 tests
   ❌ CRITICAL: 7 report pages use mock data
   ❌ HIGH: 4 entities missing CRUD operations
   ⚠️ MEDIUM: 2 CLAUDE.md libraries not implemented

   → Create features for: missing entities, CRUD gaps, API integration, tests
```

---

## Workflow

```
1. /init
   ↓
2. /validate-coverage (first check)
   ↓
3. Fix gaps:
   - /generate-features-from-mockups
   - /generate-features-from-design
   - Manual additions
   ↓
4. /validate-coverage (re-check — includes Implementation Quality Audit)
   ↓
5. /sync-mockups
   ↓
6. /continue (start development)
   ↓
7. /validate-coverage (periodic — check for mock data, test gaps, CRUD gaps)
```

---

## Notes

- Read-only command — does not modify any files
- Displays recommendations for improvements
- Should be run periodically during development (not just at start)
- Implementation Quality Audit (v2.3.0) should be run after every phase completion
- Score 91%+ is considered ready

> 💬 **หมายเหตุ**: คำสั่งนี้จะตอบกลับเป็นภาษาไทย
