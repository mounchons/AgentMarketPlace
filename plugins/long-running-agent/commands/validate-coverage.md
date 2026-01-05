# /validate-coverage

ตรวจสอบความครอบคลุมของ features ว่าครบถ้วนตาม mockups, design docs และ requirements หรือไม่

---

## Usage

```
/validate-coverage
```

---

## Purpose

1. **Mockup Coverage** - ทุก mockup page มี feature implement หรือไม่
2. **Design Coverage** - ทุก entity/flow ใน design doc มี feature หรือไม่
3. **Component Coverage** - required_components ครบหรือไม่
4. **Acceptance Criteria** - ทุก feature มี criteria หรือไม่
5. **Reference Coverage** - UI features มี mockup reference หรือไม่

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
        "validation rules ทำงานถูกต้อง",
        "error messages ชัดเจน",
        "invalid input ถูก reject"
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

## Workflow

```
1. /init-agent
   ↓
2. /validate-coverage (first check)
   ↓
3. Fix gaps:
   - /generate-features-from-mockups
   - /generate-features-from-design
   - Manual additions
   ↓
4. /validate-coverage (re-check)
   ↓
5. /sync-mockups
   ↓
6. /continue (start development)
```

---

## Notes

- Read-only command - ไม่แก้ไขไฟล์ใดๆ
- แสดง recommendations สำหรับการปรับปรุง
- ควรรัน periodically ระหว่าง development
- Score 91%+ ถือว่าพร้อม
