# /validate-integration

ตรวจสอบ cross-references และ consistency ระหว่าง 3 plugins: system-design-doc, ui-mockup, long-running-agent

---

## Usage

```
/validate-integration
```

---

## Purpose

1. **Validate Cross-References** - ตรวจสอบว่า references ถูกต้องและมีอยู่จริง
2. **Check Consistency** - ตรวจสอบความสอดคล้องของข้อมูล
3. **Detect Orphans** - ค้นหา orphan items ที่ไม่มี references
4. **Generate Report** - สร้าง comprehensive integration report

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
```

### Step 2: Validate Schema Compatibility

```
Check schema versions:
- design_doc_list.json: 2.0.0
- mockup_list.json: 1.6.0
- feature_list.json: 1.10.0

Verify compatibility:
- design_doc requires mockup >= 1.6.0 ✅
- design_doc requires feature >= 1.10.0 ✅
- mockup requires design_doc >= 2.0.0 ✅
- feature requires design_doc >= 2.0.0 ✅
```

### Step 3: Validate Entity References

```
Design Doc Entities ↔ Mockup Entities ↔ Feature Entities

For each entity in design_doc:
  1. Check mockup_entity_ref exists in mockup_list
  2. Check feature_ids exist in feature_list
  3. Verify CRUD operations are complete

Report:
✅ ENT-001 "User"
   - mockup_entity_ref: User ✅
   - feature_ids: [3, 5, 6, 7, 8, 9] ✅
   - CRUD: C✅ R✅ U✅ D✅ L✅

⚠️ ENT-002 "Department"
   - mockup_entity_ref: Department ✅
   - feature_ids: [] ❌ No features reference this entity
   - CRUD: C❌ R❌ U❌ D❌ L❌
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

### Step 6: Detect Orphans

```
ORPHAN DETECTION:

Design Doc:
- Entities without mockup refs: 0
- APIs without feature refs: 1
- Diagrams without refs: 0

Mockups:
- Pages without features: 2
- Entities without design_doc refs: 0

Features:
- Features without design_doc refs: 3
- Features without mockup refs: 5
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
║ Generated: 2025-01-05T10:00:00Z                                     ║
║ Plugins: system-design-doc, ui-mockup, long-running-agent          ║
╠════════════════════════════════════════════════════════════════════╣

1. SCHEMA COMPATIBILITY
   ─────────────────────
   design_doc_list.json: v2.0.0 ✅
   mockup_list.json: v1.6.0 ✅
   feature_list.json: v1.10.0 ✅

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

6. SYNC STATUS
   ────────────
   ┌─────────────────┬──────────────────────────┐
   │ Integration     │ Last Synced              │
   ├─────────────────┼──────────────────────────┤
   │ Design ↔ Mockup │ 2025-01-05T10:00:00Z ✅  │
   │ Design ↔ Feature│ 2025-01-05T10:00:00Z ✅  │
   │ Mockup ↔ Feature│ 2025-01-05T09:30:00Z ⚠️  │
   └─────────────────┴──────────────────────────┘

7. RECOMMENDATIONS
   ────────────────
   HIGH Priority:
   - [ ] Create features for Department entity
   - [ ] Create features for pages 002, 003, 007

   MEDIUM Priority:
   - [ ] Add design_doc_refs to features #1, #2, #10

   LOW Priority:
   - [ ] Run /sync-mockups to update Feature ↔ Mockup sync

╠════════════════════════════════════════════════════════════════════╣
║ OVERALL INTEGRATION SCORE: 75% (Good)                               ║
║                                                                      ║
║ Breakdown:                                                           ║
║ - Entity Integration: 50%                                            ║
║ - API Integration: 100%                                              ║
║ - Page Integration: 57%                                              ║
║ - Sync Freshness: 95%                                                ║
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
    "crud_completeness": true,
    "bidirectional_refs": true
  }
}
```

---

## Integration Score Calculation

```
Score = weighted average of:
- Entity Integration (25%): entities with all 3 references
- API Integration (25%): APIs with feature + page references
- Page Integration (25%): pages with feature references
- Sync Freshness (25%): how recent the sync timestamps are

Rating:
- 90-100%: Excellent
- 75-89%: Good
- 50-74%: Needs Improvement
- <50%: Critical
```

---

## When to Run

- ก่อน sprint planning
- หลังจาก sync commands
- เมื่อต้องการ overview ของ integration status
- ก่อน release เพื่อ validate completeness

---

## Notes

- Read-only command - ไม่แก้ไขไฟล์
- ใช้เวลานานกว่า sync commands (comprehensive check)
- สร้าง recommendations โดยอัตโนมัติ
- รองรับ partial integration (incomplete projects)
