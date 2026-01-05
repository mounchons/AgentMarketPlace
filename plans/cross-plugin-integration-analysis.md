# Cross-Plugin Integration Analysis

## วัตถุประสงค์
วิเคราะห์และปรับปรุง `design_doc_list.json` ให้ทำงานเชื่อมโยงกับ `mockup_list.json` และ `feature_list.json`

## สถานะปัจจุบัน

### 1. design_doc_list.json (system-design-doc) v1.0.0
```
Fields ที่มีอยู่:
├── related_mockups: []        ← มีแล้ว แต่ยังไม่มี structure ชัดเจน
├── related_features: []       ← มีแล้ว แต่ยังไม่มี structure ชัดเจน
├── diagrams: {}               ← tracking diagram types
└── statistics: {}             ← counts (entities, tables, endpoints, pages)
```

### 2. mockup_list.json (ui-mockup) v1.5.0
```
Fields ที่เชื่อมโยง:
├── feature_list_path: "feature_list.json"
├── last_synced_with_features: null
├── entities[].related_documents: [
│     {"type": "system-design", "path": "system-design.md#user-management"}
│   ]
├── pages[].related_documents: [...]
├── pages[].implemented_by_features: []
└── document_types: {
      "system-design": "System Design Document",
      "api": "API Specification", ...
    }
```

### 3. feature_list.json (long-running-agent) v1.9.0
```
Fields ที่เชื่อมโยง:
├── layers: [...]                    ← Clean Architecture layers
├── modules: []                      ← Module decomposition
├── features[].references: []        ← มีแล้ว แต่ว่างเปล่า
├── features[].mockup_validated: false
├── features[].mockup_version: null
├── features[].required_components: []
├── features[].design_tokens_used: []
└── component_usage: {}              ← Component reuse tracking
```

---

## Gap Analysis

### A. design_doc_list.json ขาด:

| Gap | ปัญหา | ผลกระทบ |
|-----|-------|---------|
| 1. Path references | ไม่มี path ชี้ไปยัง mockup_list, feature_list | ไม่สามารถ auto-sync ได้ |
| 2. Entity mapping | ไม่มี entities section | ไม่เชื่อมกับ mockup entities |
| 3. API endpoints | ไม่มี api_endpoints section | ไม่เชื่อมกับ feature APIs |
| 4. Diagram references | diagrams เป็น boolean/count | ไม่ระบุ path ของ diagram files |
| 5. Layer mapping | ไม่มี layers | ไม่ align กับ feature layers |
| 6. Version sync | ไม่มี sync timestamps | ไม่รู้ว่า sync แล้วหรือยัง |
| 7. Cross-validation | ไม่มี validation rules | ไม่ validate consistency |

### B. การเชื่อมโยงที่ต้องการ:

```
┌─────────────────────┐
│  system-design-doc  │
│  design_doc_list    │
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    ▼             ▼
┌─────────┐  ┌──────────────┐
│ ui-mockup│  │long-running  │
│mockup_list│  │feature_list │
└─────────┘  └──────────────┘

เชื่อมโยง:
1. Entity → Pages (mockup) → Features (implementation)
2. API Spec → Features (backend) → Pages (frontend)
3. ER Diagram → Entities → Domain Features
4. Flow Diagram → Features (workflow)
5. Sitemap → Pages → Navigation Features
```

---

## Proposed Schema Update for design_doc_list.json v2.0.0

### New Root Fields:
```json
{
  "schema_version": "2.0.0",
  "project_name": "",

  "integration": {
    "mockup_list_path": ".mockups/mockup_list.json",
    "feature_list_path": "feature_list.json",
    "last_synced_with_mockups": null,
    "last_synced_with_features": null
  },

  "layers": [
    { "id": "presentation", "design_sections": ["sitemap", "flow_diagrams"] },
    { "id": "application", "design_sections": ["dfd", "sequence_diagrams"] },
    { "id": "domain", "design_sections": ["er_diagram", "data_dictionary"] },
    { "id": "infrastructure", "design_sections": ["data_model", "modules"] }
  ],

  "entities": [
    {
      "id": "ENT-001",
      "name": "User",
      "table_name": "Users",
      "mockup_entity_ref": "User",
      "feature_ids": [3, 5, 6, 7, 8, 9],
      "pages": ["004", "005", "006"],
      "crud_operations": {
        "create": { "api": "POST /api/users", "feature_id": 7, "page": "005" },
        "read": { "api": "GET /api/users/{id}", "feature_id": 6, "page": "006" },
        "update": { "api": "PUT /api/users/{id}", "feature_id": 8, "page": "005" },
        "delete": { "api": "DELETE /api/users/{id}", "feature_id": 9, "page": null }
      }
    }
  ],

  "api_endpoints": [
    {
      "id": "API-001",
      "method": "GET",
      "path": "/api/users",
      "description": "List all users",
      "entity_ref": "ENT-001",
      "feature_id": 5,
      "page_refs": ["004"],
      "documented_in": "system-design.md#api-users"
    }
  ],

  "diagrams": {
    "high_level_architecture": {
      "exists": false,
      "file_path": null,
      "version": null,
      "last_updated": null
    },
    "er_diagram": {
      "exists": false,
      "file_path": null,
      "entities_mapped": [],
      "version": null
    },
    "flow_diagrams": [],
    "dfd": {
      "level_0": { "exists": false, "file_path": null },
      "level_1": [],
      "level_2": []
    },
    "sequence_diagrams": [],
    "sitemap": {
      "exists": false,
      "file_path": null,
      "pages_mapped": []
    }
  }
}
```

### Enhanced documents[].related_mockups:
```json
"related_mockups": [
  {
    "page_id": "001",
    "page_name": "Login",
    "mockup_file": "001-login.html",
    "mockup_version": "1.0",
    "design_section": "authentication",
    "sync_status": "synced"
  }
]
```

### Enhanced documents[].related_features:
```json
"related_features": [
  {
    "feature_id": 5,
    "description": "GET /api/users - List all",
    "epic": "api",
    "layer": "presentation",
    "design_section": "api-users",
    "sync_status": "synced"
  }
]
```

---

## Implementation Recommendations

### Priority 1: Core Integration (design_doc_list.json)
| # | Task | Impact |
|---|------|--------|
| 1 | Add `integration` section with paths | Enable auto-discovery |
| 2 | Add `layers` aligned with feature_list | Consistent architecture mapping |
| 3 | Add `entities` section | Bridge mockup entities to features |
| 4 | Add `api_endpoints` section | Map API specs to features |
| 5 | Enhance `diagrams` with file paths | Direct access to diagrams |
| 6 | Enhance `related_mockups` structure | Detailed page mapping |
| 7 | Enhance `related_features` structure | Detailed feature mapping |

### Priority 2: Sync Commands
| # | Command | Purpose |
|---|---------|---------|
| 1 | /sync-design-to-mockups | Sync entities, pages from design to mockups |
| 2 | /sync-design-to-features | Sync APIs, entities to features |
| 3 | /validate-cross-references | Validate all cross-references |

### Priority 3: Bi-directional Updates
- When mockup page status changes → update design_doc related_mockups
- When feature status changes → update design_doc related_features
- When design entity changes → notify mockup and feature lists

---

## Cross-Reference Validation Rules

```json
"validation_rules": {
  "entity_must_have_mockup_pages": true,
  "api_must_have_feature": true,
  "page_must_have_feature": true,
  "diagram_file_must_exist": true,
  "layer_consistency": true
}
```

---

## Summary

| Plugin | Current Version | Proposed Version | Changes |
|--------|----------------|------------------|---------|
| design_doc_list.json | 1.0.0 | 2.0.0 | +7 major enhancements |
| mockup_list.json | 1.5.0 | 1.6.0 | +design_doc_path, sync fields |
| feature_list.json | 1.9.0 | 1.10.0 | +design_doc_ref in features |

## Implementation Status

1. ✅ Analysis complete
2. ✅ Update design_doc_list.json to v2.0.0
3. ✅ Update mockup_list.json to v1.6.0
4. ✅ Update feature_list.json to v1.10.0
5. ✅ Create sync commands (sync-with-mockups, sync-with-features, validate-integration)
6. ✅ Update READMEs

---

*Created: 2026-01-05*
*Status: ✅ Implementation Complete*
*Completed: 2026-01-05*
