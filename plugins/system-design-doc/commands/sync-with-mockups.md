# /sync-with-mockups

ตรวจสอบและ synchronize ข้อมูลระหว่าง `design_doc_list.json` และ `.mockups/mockup_list.json`

---

## Usage

```
/sync-with-mockups
```

---

## Purpose

1. **Sync Entities** - เชื่อมโยง design doc entities กับ mockup entities
2. **Sync Pages** - map pages กับ design sections
3. **Validate References** - ตรวจสอบ cross-references
4. **Update Timestamps** - update sync timestamps

---

## Process

### Step 1: Read Files

```bash
# Read design_doc_list.json
cat design_doc_list.json

# Read mockup_list.json
cat .mockups/mockup_list.json
```

### Step 2: Sync Entities

Map entities ระหว่าง design doc และ mockups:

```
For each entity in design_doc_list:
  1. Find matching entity in mockup_list (by name)
  2. If found:
     - Update design_doc entity.mockup_entity_ref
     - Update mockup entity.design_doc_entity_ref
     - Sync pages array
  3. If not found → add to unmapped list
```

**Output:**
```
Syncing entities...

✅ ENT-001 "User" ↔ mockup entity "User"
   Pages: 004, 005, 006

✅ ENT-002 "Department" ↔ mockup entity "Department"
   Pages: 007

❌ ENT-003 "Product" → No matching mockup entity

Summary: 2/3 entities mapped
```

### Step 3: Sync Pages with Design Sections

Update mockup pages with design_doc_section:

```json
{
  "pages": [
    {
      "id": "001",
      "name": "Login",
      "design_doc_section": "authentication",  // ← from design_doc
      "design_doc_api_refs": ["API-001"]        // ← from design_doc
    }
  ]
}
```

### Step 4: Update related_mockups in Design Doc

```json
{
  "documents": [
    {
      "related_mockups": [
        {
          "page_id": "001",
          "page_name": "Login",
          "mockup_file": "001-login.mockup.md",
          "mockup_version": "1.0",
          "design_section": "authentication",
          "sync_status": "synced"
        }
      ]
    }
  ]
}
```

### Step 5: Update Sync Status

```json
{
  "integration": {
    "last_synced_with_mockups": "2025-01-05T10:00:00Z"
  },
  "sync_status": {
    "mockups": {
      "total_pages": 7,
      "mapped_pages": 7,
      "unmapped_pages": 0,
      "last_sync": "2025-01-05T10:00:00Z"
    }
  }
}
```

---

## Output Format

```
╔════════════════════════════════════════════════════════════╗
║              DESIGN DOC ↔ MOCKUPS SYNC REPORT              ║
╠════════════════════════════════════════════════════════════╣
║ Generated: 2025-01-05T10:00:00Z                            ║
╠════════════════════════════════════════════════════════════╣

1. ENTITY MAPPING
   ───────────────
   Total design doc entities: 3
   Mapped to mockups: 2 (67%)
   Unmapped: 1

   Unmapped:
   - ENT-003 "Product" → Create mockup entity?

2. PAGE ↔ SECTION MAPPING
   ────────────────────────
   Pages with design section: 7/7
   - 001 Login → authentication
   - 002 Register → authentication
   - 003 Dashboard → dashboard
   - 004 User List → user-management
   - 005 User Form → user-management
   - 006 User Detail → user-management
   - 007 Department List → master-data

3. API REFERENCE MAPPING
   ──────────────────────
   Pages with API refs: 4/7
   - 004 → [API-001]
   - 005 → [API-002, API-003]
   - 006 → [API-004]
   - 007 → []

4. RELATED MOCKUPS UPDATED
   ────────────────────────
   Documents updated: 1
   - DOC-001: 7 mockups linked

╠════════════════════════════════════════════════════════════╣
║ ACTIONS TAKEN:                                              ║
║ ✅ Updated design_doc_list.json                             ║
║ ✅ Updated mockup_list.json                                 ║
║ ✅ Synced 7 pages with design sections                      ║
║ ✅ Updated last_synced_with_mockups timestamp               ║
╚════════════════════════════════════════════════════════════╝
```

---

## Files Modified

1. **design_doc_list.json**
   - Update `entities[].mockup_entity_ref`
   - Update `documents[].related_mockups`
   - Update `sync_status.mockups`
   - Update `integration.last_synced_with_mockups`

2. **.mockups/mockup_list.json**
   - Update `entities[].design_doc_entity_ref`
   - Update `pages[].design_doc_section`
   - Update `pages[].design_doc_api_refs`
   - Update `integration.last_synced_with_design_doc`

---

## When to Run

- หลังจากสร้างหรือ update design document
- หลังจาก /init-mockup หรือ /create-mockup
- ก่อน /generate-features-from-design
- เมื่อ design document มีการเปลี่ยนแปลง

---

## Notes

- Safe to run multiple times
- ไม่ลบข้อมูลที่มีอยู่ - เพียงแค่ update
- ใช้ entity name matching (case-insensitive)
- Supports partial sync (unmapped items won't block sync)
