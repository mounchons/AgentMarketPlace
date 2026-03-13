# /migrate

Migrate existing feature_list.json and mockup_list.json from old schema to schema v1.5.0.

---

## Usage

```
/migrate
```

---

## Purpose

Support backward compatibility by migrating existing files to the new schema:
1. **No data deletion** — preserved in legacy fields
2. **Add new fields** — with default values
3. **Create backup** — before migration

---

## When to Use

The `/continue` command automatically checks `schema_version` and recommends running migrate:

```
⚠️ Detected old schema (no version)
   Current schema: v1.5.0

   Run /migrate to update:
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
  "description": "Create project structure",
  "priority": "high",
  "steps": [
    "Create new project",
    "Setup configuration",
    "Test run project"
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
  "description": "Create project structure",
  "priority": "high",
  "complexity": "medium",                  // NEW - default
  "status": "passed",                      // NEW - from passes
  "blocked_reason": null,                  // NEW
  "subtasks": [                            // NEW - from steps
    { "id": "1.1", "description": "Create new project", "done": true },
    { "id": "1.2", "description": "Setup configuration", "done": true },
    { "id": "1.3", "description": "Test run project", "done": true }
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
    "Create new project",
    "Setup configuration",
    "Test run project"
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

### Migration: v1.10.0 → v2.0.0

**Add new fields (backward compatible):**

```javascript
// 1. Add state_contracts (root level)
if (!data.state_contracts) {
  data.state_contracts = {};
}

// 2. Add flows (root level, after epics)
if (!data.flows) {
  data.flows = [];
}

// 3. Add new fields to every feature
for (const feature of data.features) {
  if (feature.flow_id === undefined) feature.flow_id = null;
  if (!feature.state_produces) feature.state_produces = [];
  if (!feature.state_consumes) feature.state_consumes = [];
  // requires_components already exists — no need to add
}

// 4. Bump versions
data.schema_version = "2.0.0";
data.metadata.schema_version = "2.0.0";
data.metadata.plugin_version = "2.0.0";
data.metadata.compatible_with.design_doc_list_schema = ">=2.1.0";
data.metadata.compatible_with.mockup_list_schema = ">=1.7.0";
```

**Note:** This migration is additive — does not delete or change existing fields. Projects that don't use flows work normally.

---

### Migration: v2.0.0 → v2.1.0

**Add Model Assignment & Review System (backward compatible):**

```javascript
// 1. Add model_config (root level, after integration)
if (!data.model_config) {
  data.model_config = {
    available_models: {
      opus: {
        role: "architect",
        description: "Complex tasks, prototype, reference implementation, UI mockup-based",
        handles: ["complex", "prototype", "reference"],
        can_review: true
      },
      sonnet: {
        role: "implementer",
        description: "Follow patterns created by opus",
        handles: ["medium", "simple"],
        can_review: false
      },
      minimax: {
        role: "implementer",
        description: "Follow patterns created by opus",
        handles: ["medium", "simple"],
        can_review: false
      },
      glm: {
        role: "implementer",
        description: "Follow patterns created by opus",
        handles: ["medium", "simple"],
        can_review: false
      }
    },
    assignment_strategy: {
      auto_assign_rules: [
        { condition: "complexity == 'complex'", assign_to: "opus" },
        { condition: "is_first_in_category", assign_to: "opus" },
        { condition: "has_mockup_refs && complexity == 'medium'", assign_to: "opus" },
        { condition: "complexity == 'medium'", assign_to: "sonnet" },
        { condition: "complexity == 'simple'", assign_to: "sonnet" }
      ],
      review_policy: "required_for_non_opus"
    }
  };
}

// 2. Add new fields to every feature
for (const feature of data.features) {
  if (feature.assigned_model === undefined) feature.assigned_model = null;
  if (feature.is_reference_impl === undefined) feature.is_reference_impl = false;
  if (feature.review === undefined) feature.review = null;
}

// 3. Add model_workload & review_status to summary
if (!data.summary.model_workload) {
  data.summary.model_workload = {
    opus: { assigned: 0, completed: 0, in_progress: 0 },
    sonnet: { assigned: 0, completed: 0, in_progress: 0 },
    minimax: { assigned: 0, completed: 0, in_progress: 0 },
    glm: { assigned: 0, completed: 0, in_progress: 0 },
    unassigned: 0
  };
  // Count from features that already have assigned_model
  for (const feature of data.features) {
    if (feature.assigned_model) {
      const model = feature.assigned_model;
      data.summary.model_workload[model].assigned++;
      if (feature.status === "passed") data.summary.model_workload[model].completed++;
      if (feature.status === "in_progress") data.summary.model_workload[model].in_progress++;
    } else {
      data.summary.model_workload.unassigned++;
    }
  }
}
if (!data.summary.review_status) {
  data.summary.review_status = {
    reviewed: 0,
    pending_review: 0,
    passed: 0,
    failed: 0
  };
  // Count from features that already have review
  for (const feature of data.features) {
    if (feature.review) {
      data.summary.review_status.reviewed++;
      if (feature.review.result === "pass" || feature.review.result === "pass_with_suggestions") {
        data.summary.review_status.passed++;
      } else if (feature.review.result === "fail") {
        data.summary.review_status.failed++;
      }
    } else if (feature.status === "passed" && feature.assigned_model && feature.assigned_model !== "opus") {
      data.summary.review_status.pending_review++;
    }
  }
}

// 4. Bump versions
data.schema_version = "2.1.0";
data.metadata.schema_version = "2.1.0";
data.metadata.plugin_version = "2.1.0";
```

**Note:** This migration is additive — does not delete or change existing fields. Projects that don't use model assignment work normally (assigned_model will be null).

---

## Rollback

If you need to revert:

```bash
# Restore from backup
cp feature_list.json.backup.[TIMESTAMP] feature_list.json
cp .mockups/mockup_list.json.backup.[TIMESTAMP] .mockups/mockup_list.json
```

---

## Notes

- Migration is a one-time operation
- Safe to run multiple times (checks schema_version first)
- Does not delete existing data — preserved in legacy fields
- Backup created automatically before migration
- After migration, should run `/sync-mockups` and `/validate-coverage`

> 💬 **หมายเหตุ**: คำสั่งนี้จะตอบกลับเป็นภาษาไทย
