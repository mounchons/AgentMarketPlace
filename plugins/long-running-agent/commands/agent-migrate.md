# /agent-migrate

Migrate existing feature_list.json และ mockup_list.json จาก schema เก่าเป็น schema v1.5.0

---

## Usage

```
/agent-migrate
```

---

## Purpose

รองรับ backward compatibility โดยการ migrate ไฟล์ที่มีอยู่ให้เป็น schema ใหม่ โดย:
1. **ไม่ลบข้อมูลเดิม** - เก็บไว้ใน legacy fields
2. **เพิ่ม fields ใหม่** - พร้อม default values
3. **สร้าง backup** - ก่อน migrate

---

## When to Use

Command `/continue` จะตรวจสอบ `schema_version` อัตโนมัติและแนะนำให้รัน migrate:

```
⚠️ Detected old schema (no version)
   Current schema: v1.5.0

   Run /agent-migrate to update:
   - Add epics grouping
   - Add subtasks tracking
   - Add acceptance criteria
   - Add time tracking
   - Add mockup sync fields

   Your data will be preserved.
```

---

## Migration Process

### Step 1: Create Backup

```bash
# Backup feature_list.json
cp feature_list.json feature_list.json.backup.$(date +%Y%m%d_%H%M%S)

# Backup mockup_list.json (if exists)
cp .mockups/mockup_list.json .mockups/mockup_list.json.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null
```

### Step 2: Migrate feature_list.json

#### Add Root Fields
```json
{
  "schema_version": "1.5.0",  // NEW
  // existing fields...
}
```

#### Create Epics from Categories
```
Conversion:
- category: "setup" → epic: "setup"
- category: "domain" → epic: "domain"
- category: "data" → epic: "domain"
- category: "api" → epic: "api"
- category: "feature" → epic: "features"
- category: "feature-frontend" → epic: "ui"
- category: "quality" → epic: "quality"
- no category → epic: "general"
```

```json
{
  "epics": [
    {
      "id": "setup",
      "name": "Project Setup",
      "description": "Auto-generated from migration",
      "bounded_context": "Infrastructure",
      "features": [1, 2],
      "progress": { "total": 2, "passed": 0, "in_progress": 0 }
    }
    // ... generated from unique categories
  ]
}
```

#### Migrate Each Feature

**From:**
```json
{
  "id": 1,
  "category": "setup",
  "description": "สร้าง project structure",
  "priority": "high",
  "steps": [
    "สร้าง project ใหม่",
    "ตั้งค่า configuration",
    "ทดสอบ run project"
  ],
  "dependencies": [],
  "estimated_time": "15min",
  "passes": true,
  "tested_at": "2025-01-01T10:00:00Z",
  "notes": ""
}
```

**To:**
```json
{
  "id": 1,
  "epic": "setup",                         // NEW - from category
  "category": "setup",
  "description": "สร้าง project structure",
  "priority": "high",
  "complexity": "medium",                  // NEW - default
  "status": "passed",                      // NEW - from passes
  "blocked_reason": null,                  // NEW
  "subtasks": [                            // NEW - from steps
    { "id": "1.1", "description": "สร้าง project ใหม่", "done": true },
    { "id": "1.2", "description": "ตั้งค่า configuration", "done": true },
    { "id": "1.3", "description": "ทดสอบ run project", "done": true }
  ],
  "acceptance_criteria": [],               // NEW - empty
  "time_tracking": {                       // NEW
    "estimated_time": "15min",
    "actual_time": null,
    "started_at": null,
    "completed_at": "2025-01-01T10:00:00Z"
  },
  "dependencies": [],
  "references": [],
  "mockup_validated": false,               // NEW
  "required_components": [],               // NEW
  "passes": true,                          // KEPT for backward compat
  "steps_legacy": [                        // NEW - preserve original
    "สร้าง project ใหม่",
    "ตั้งค่า configuration",
    "ทดสอบ run project"
  ],
  "tested_at": "2025-01-01T10:00:00Z",
  "notes": ""
}
```

#### Update Summary
```json
{
  "summary": {
    "total": 12,
    "passed": 5,
    "in_progress": 1,      // NEW
    "blocked": 0,          // NEW
    "pending": 6,
    "last_updated": "TIMESTAMP"
  }
}
```

### Step 3: Migrate mockup_list.json

#### Add Root Fields
```json
{
  "schema_version": "1.5.0",           // NEW
  "feature_list_path": "feature_list.json",  // NEW
  "last_synced_with_features": null,   // NEW
  // existing fields...
}
```

#### Migrate Each Page
```json
{
  "pages": [
    {
      // existing fields...
      "mockup_version": "1.0",           // NEW
      "implemented_by_features": [],      // NEW
      "feature_status": null             // NEW
    }
  ]
}
```

---

## Conversion Rules

### Status Conversion

| Old (passes) | New (status) |
|--------------|--------------|
| `true` | `"passed"` |
| `false` + in progress.md | `"in_progress"` |
| `false` | `"pending"` |

### Subtasks from Steps

```javascript
// Convert steps array to subtasks
if (typeof steps[0] === 'string') {
  subtasks = steps.map((step, index) => ({
    id: `${feature.id}.${index + 1}`,
    description: step,
    done: feature.passes === true  // all done if passed
  }));
  steps_legacy = steps;
}
```

### Complexity Estimation

```javascript
// Estimate complexity from steps count
if (steps.length <= 2) complexity = 'simple';
else if (steps.length <= 4) complexity = 'medium';
else complexity = 'complex';
```

---

## Migration Report

```
╔════════════════════════════════════════════════════════════╗
║                   MIGRATION REPORT                          ║
╠════════════════════════════════════════════════════════════╣
║ Migration Date: 2025-01-04T10:00:00Z                       ║
╠════════════════════════════════════════════════════════════╣

1. BACKUP CREATED
   ─────────────────
   ✅ feature_list.json.backup.20250104_100000
   ✅ mockup_list.json.backup.20250104_100000

2. FEATURE_LIST.JSON MIGRATION
   ────────────────────────────
   Schema: (none) → v1.5.0

   Features migrated: 25
   - Added epic field: 25
   - Converted steps → subtasks: 25
   - Added acceptance_criteria: 25 (empty)
   - Added time_tracking: 25
   - Status conversion:
     - passes:true → status:passed: 5
     - passes:false → status:pending: 20

   Epics created: 5
   - setup (2 features)
   - domain (4 features)
   - api (12 features)
   - ui (5 features)
   - quality (2 features)

3. MOCKUP_LIST.JSON MIGRATION
   ───────────────────────────
   Schema: (none) → v1.5.0

   Pages migrated: 7
   - Added mockup_version: 7
   - Added implemented_by_features: 7
   - Added feature_status: 7

4. VALIDATION
   ───────────
   ✅ JSON syntax valid
   ✅ All feature IDs unique
   ✅ All epic IDs unique
   ✅ All dependencies valid
   ✅ No circular dependencies

╠════════════════════════════════════════════════════════════╣
║ MIGRATION COMPLETE                                          ║
║                                                              ║
║ Next steps:                                                  ║
║ 1. Review migrated files                                     ║
║ 2. Add acceptance_criteria to features                       ║
║ 3. Run /sync-mockups to link features ↔ mockups             ║
║ 4. Run /validate-coverage to check completeness              ║
╚════════════════════════════════════════════════════════════╝
```

---

## Rollback

หากต้องการย้อนกลับ:

```bash
# Restore from backup
cp feature_list.json.backup.[TIMESTAMP] feature_list.json
cp .mockups/mockup_list.json.backup.[TIMESTAMP] .mockups/mockup_list.json
```

---

## Notes

- Migration เป็น one-time operation
- Safe to run multiple times (จะตรวจสอบ schema_version ก่อน)
- ไม่ลบข้อมูลเดิม - เก็บใน legacy fields
- Backup สร้างอัตโนมัติก่อน migrate
- หลัง migrate ควรรัน `/sync-mockups` และ `/validate-coverage`
