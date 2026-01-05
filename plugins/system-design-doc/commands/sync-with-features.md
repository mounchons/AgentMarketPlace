# /sync-with-features

ตรวจสอบและ synchronize ข้อมูลระหว่าง `design_doc_list.json` และ `feature_list.json`

---

## Usage

```
/sync-with-features
```

---

## Purpose

1. **Sync API Endpoints** - เชื่อมโยง design doc APIs กับ features
2. **Sync Entities** - map entities กับ domain features
3. **Sync Diagrams** - link diagrams กับ related features
4. **Update Cross-References** - bidirectional references

---

## Process

### Step 1: Read Files

```bash
# Read design_doc_list.json
cat design_doc_list.json

# Read feature_list.json
cat feature_list.json
```

### Step 2: Sync API Endpoints with Features

Map API endpoints กับ features ที่ implement:

```
For each api_endpoint in design_doc_list:
  1. Find feature with matching API path/method
  2. If found:
     - Update api_endpoint.feature_id
     - Update feature.design_doc_refs.api_ref
  3. If not found → add to unmapped list
```

**Output:**
```
Syncing API endpoints...

✅ API-001 "GET /api/users" ↔ Feature #5
✅ API-002 "GET /api/users/{id}" ↔ Feature #6
✅ API-003 "POST /api/users" ↔ Feature #7
✅ API-004 "PUT /api/users/{id}" ↔ Feature #8
✅ API-005 "DELETE /api/users/{id}" ↔ Feature #9

Summary: 5/5 APIs mapped to features
```

### Step 3: Sync Entities with Domain Features

Map entities กับ features ใน domain epic:

```
For each entity in design_doc_list:
  1. Find features in domain epic referencing this entity
  2. Update entity.feature_ids[]
  3. Update feature.design_doc_refs.entity_ref
```

**Output:**
```
Syncing entities with domain features...

✅ ENT-001 "User" ↔ Features [3, 4, 5, 6, 7, 8, 9]
   - Feature #3: สร้าง User entity
   - Feature #4: สร้าง DbContext
   - Features #5-9: API endpoints

Summary: 1/1 entities mapped
```

### Step 4: Sync Diagrams with Features

Link diagrams กับ related features:

```json
{
  "diagrams": {
    "er_diagram": {
      "exists": true,
      "entities_mapped": ["ENT-001"],
      "related_features": [3, 4]  // ← Updated
    },
    "sequence_diagrams": [
      {
        "id": "SEQ-001",
        "related_features": [5, 6, 7],  // ← Updated
        "related_apis": ["API-001", "API-002", "API-003"]
      }
    ]
  }
}
```

### Step 5: Update related_features in Design Doc

```json
{
  "documents": [
    {
      "related_features": [
        {
          "feature_id": 5,
          "description": "GET /api/users - List all",
          "epic": "api",
          "layer": "presentation",
          "design_section": "api-endpoints",
          "sync_status": "synced"
        }
      ]
    }
  ]
}
```

### Step 6: Update Sync Status

```json
{
  "integration": {
    "last_synced_with_features": "2025-01-05T10:00:00Z"
  },
  "sync_status": {
    "features": {
      "total_features": 12,
      "mapped_features": 9,
      "unmapped_features": 3,
      "last_sync": "2025-01-05T10:00:00Z"
    }
  }
}
```

---

## Output Format

```
╔════════════════════════════════════════════════════════════╗
║              DESIGN DOC ↔ FEATURES SYNC REPORT             ║
╠════════════════════════════════════════════════════════════╣
║ Generated: 2025-01-05T10:00:00Z                            ║
╠════════════════════════════════════════════════════════════╣

1. API ENDPOINT MAPPING
   ─────────────────────
   Total API endpoints: 5
   Mapped to features: 5 (100%)

   Mapping:
   - API-001 GET /api/users → Feature #5
   - API-002 GET /api/users/{id} → Feature #6
   - API-003 POST /api/users → Feature #7
   - API-004 PUT /api/users/{id} → Feature #8
   - API-005 DELETE /api/users/{id} → Feature #9

2. ENTITY ↔ FEATURE MAPPING
   ──────────────────────────
   Total entities: 1
   Mapped to features: 1 (100%)

   - ENT-001 "User" → [3, 4, 5, 6, 7, 8, 9]

3. DIAGRAM REFERENCES
   ───────────────────
   ER Diagram → Features [3, 4]
   Sequence Diagrams:
   - SEQ-001 → Features [5, 6, 7]

4. LAYER DISTRIBUTION
   ───────────────────
   Features by layer (from design doc):
   - presentation: 5 (APIs)
   - domain: 2 (Entity, DbContext)
   - infrastructure: 2 (Setup, DB)
   - cross-cutting: 3 (Quality)

5. RELATED FEATURES UPDATED
   ─────────────────────────
   Documents updated: 1
   - DOC-001: 9 features linked

╠════════════════════════════════════════════════════════════╣
║ ACTIONS TAKEN:                                              ║
║ ✅ Updated design_doc_list.json                             ║
║ ✅ Updated feature_list.json                                ║
║ ✅ Mapped 5 APIs to features                                ║
║ ✅ Linked diagrams to features                              ║
║ ✅ Updated last_synced_with_features timestamp              ║
╚════════════════════════════════════════════════════════════╝
```

---

## Files Modified

1. **design_doc_list.json**
   - Update `api_endpoints[].feature_id`
   - Update `entities[].feature_ids`
   - Update `diagrams.*.related_features`
   - Update `documents[].related_features`
   - Update `sync_status.features`
   - Update `integration.last_synced_with_features`

2. **feature_list.json**
   - Update `features[].design_doc_refs.api_ref`
   - Update `features[].design_doc_refs.entity_ref`
   - Update `features[].design_doc_refs.diagram_refs`
   - Update `integration.last_synced_with_design_doc`

---

## Matching Logic

### API Matching
```
Match by:
1. HTTP Method (GET, POST, PUT, DELETE)
2. Path pattern (/api/resource, /api/resource/{id})
3. Description keywords
```

### Entity Matching
```
Match by:
1. Entity name in feature description
2. Feature category: "domain" or "data"
3. Epic: "domain"
```

### Diagram Matching
```
Match by:
1. ER Diagram → features with entity references
2. Sequence Diagram → features with API references
3. Flow Diagram → features with workflow keywords
```

---

## When to Run

- หลังจากสร้างหรือ update design document
- หลังจาก /init-agent หรือ /add-feature
- ก่อน /continue เพื่อ validate references
- เมื่อ design document มีการเปลี่ยนแปลง

---

## Notes

- Safe to run multiple times
- ใช้ fuzzy matching สำหรับ API paths
- รองรับ partial sync
- ไม่สร้าง features ใหม่ - ใช้ /generate-features-from-design แทน
