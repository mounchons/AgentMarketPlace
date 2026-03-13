# /generate-features-from-design

Automatically generate features from System Design Document and UI Mockups combined, to cover all layers of the system.

---

## Usage

```
/generate-features-from-design
```

---

## Prerequisites

- Should have System Design Document (`*-system-design.md`)
- Should have `.mockups/mockup_list.json` (optional)
- Should run `/system-design-doc` first

---

## Process

### Step 1: Find Design Documents

```bash
# Find system design docs
ls -la *system-design*.md docs/*system-design*.md 2>/dev/null

# Find mockup list
ls -la .mockups/mockup_list.json 2>/dev/null
```

### Step 1.5: Read design_doc_list.json (if exists)

```bash
# Read design_doc_list.json to see defined crud_operations
cat .design-docs/design_doc_list.json 2>/dev/null
cat design_doc_list.json 2>/dev/null
```

**If design_doc_list.json exists:**
- Use `entities[].crud_operations` to determine which features to create
- Check `enabled` field of each operation
- Check `delete.strategy` (soft/hard)

**If design_doc_list.json does not exist:**
- Use default: create all CRUD, delete strategy = soft

### Step 2: Parse ER Diagram → Entity Features

For each Entity in ER Diagram:

**⚠️ Important: Check crud_operations from design_doc_list.json before creating features**

```
If design_doc_list.json exists → read entities[].crud_operations
If not → default all operations enabled, delete strategy = soft
```

**Entity with full CRUD (e.g., User):**
```
Entity: User (crud: C✅ R✅ U✅ D✅soft L✅)
├── Feature: Create User entity (domain)
├── Feature: Create User DbContext configuration (data)
├── Feature: GET /api/users - List (api)
├── Feature: GET /api/users/{id} - Get by ID (api)
├── Feature: POST /api/users - Create (api)
├── Feature: PUT /api/users/{id} - Update (api)
├── Feature: Soft delete User - set is_active = false (api)
└── Feature: User validation (quality)
```

**Read-only entity (e.g., AuditLog):**
```
Entity: AuditLog (crud: C❌ R✅ U❌ D❌ L✅)
├── Feature: Create AuditLog entity (domain)
├── Feature: Create AuditLog DbContext configuration (data)
├── Feature: GET /api/audit-logs - List (api)
├── Feature: GET /api/audit-logs/{id} - Get by ID (api)
└── (no POST, PUT, DELETE — disabled in crud_operations)
```

**Delete Strategy:**
- `"strategy": "soft"` → Feature: "Soft delete [Entity] (set is_active = false)"
  - Subtask: add `is_active` field (if not already present)
  - Subtask: add global query filter `HasQueryFilter(e => e.IsActive)`
  - Subtask: endpoint returns 204 No Content
- `"strategy": "hard"` → Feature: "DELETE /api/[entities]/{id} - Hard delete"
  - Use only in special cases (e.g., draft data, temp records)

**Feature Template for Entity:**
```json
{
  "id": [next_id],
  "epic": "[entity_name.toLowerCase()]",
  "category": "domain",
  "description": "Create [Entity] entity",
  "priority": "high",
  "complexity": "medium",
  "subtasks": [
    { "id": "[id].1", "description": "Create model class", "done": false },
    { "id": "[id].2", "description": "Add properties per Data Dictionary", "done": false },
    { "id": "[id].3", "description": "Add validations", "done": false }
  ],
  "acceptance_criteria": [
    "entity class created correctly per ER Diagram",
    "properties complete per Data Dictionary",
    "relationships are correct"
  ],
  "references": [
    "[design_doc_path]#er-diagram",
    "[design_doc_path]#data-dictionary"
  ]
}
```

### Step 2.5: Detect Flows from Design Doc (v2.0.0)

**Read Flow Diagrams from design doc:**

1. **Flow Diagram → wizard flow:**
   - Each flowchart with sequential steps → create flow type `wizard`
   - Decision points → create `error_paths`
   - End states → create `exit_conditions`

2. **Sitemap → crud-group flow:**
   - Pages under the same parent that are the same entity → `crud-group`
   - E.g., `/admin/users`, `/admin/users/new`, `/admin/users/:id` → "User Management" flow

3. **Create state_contracts from entities:**
   - Entity passed between steps in flow → state contract
   - Use Data Dictionary fields → state contract fields
   - Determine persistence per context:
     - Form wizard → `session`
     - Filter/Search → `url`
     - Auth → `localStorage`

4. **Add flow_id, state_produces, state_consumes to created features**

5. **Create features for shared components:**
   - Components used in 3+ pages → create separate feature
   - Add `requires_components` to features that use them

### Step 3: Parse Flow Diagram → Logic Features

For each Flow in Flow Diagram:

```
Flow: User Registration
├── Feature: Registration input validation
├── Feature: Email uniqueness check
├── Feature: Create user service
├── Feature: Welcome email notification
└── Feature: Post-registration redirect
```

**Feature Template for Flow Step:**
```json
{
  "id": [next_id],
  "epic": "[flow_name.toLowerCase()]",
  "category": "feature",
  "description": "[Flow Step Description]",
  "priority": "medium",
  "complexity": "[based on decision points]",
  "references": [
    "[design_doc_path]#[flow-anchor]"
  ]
}
```

### Step 4: Parse Mockups → UI Features

(Uses same logic as `/generate-features-from-mockups`)

### Step 5: Create Epics by Bounded Context

```json
{
  "epics": [
    {
      "id": "user",
      "name": "User Management",
      "description": "User management",
      "bounded_context": "Identity",
      "features": [entity_features + api_features + ui_features]
    },
    {
      "id": "product",
      "name": "Product Catalog",
      "description": "Product management",
      "bounded_context": "Catalog",
      "features": [...]
    }
  ]
}
```

### Step 6: Set Dependencies

```
Dependency Order:
1. Setup features (project, database)
2. Domain features (entities)
3. Data features (DbContext, migrations)
4. API features (CRUD endpoints)
5. UI features (pages from mockups)
6. Quality features (validation, error handling)
```

**Auto-dependency Rules:**
```json
{
  "domain": { "depends_on": ["setup"] },
  "data": { "depends_on": ["setup", "domain"] },
  "api": { "depends_on": ["data"] },
  "feature-frontend": { "depends_on": ["api"] },
  "quality": { "depends_on": ["api"] }
}
```

---

## Complete Feature Generation

### From ER Diagram (per Entity):

**⚠️ Create API features only for operations with `enabled: true` in crud_operations**

| # | Category | Description | Dependencies | Condition |
|---|----------|-------------|--------------|-----------|
| 1 | domain | Create [Entity] entity | setup | Always |
| 2 | data | Create [Entity] configuration | entity | Always |
| 3 | api | GET /api/[entities] - List | data | `list.enabled == true` |
| 4 | api | GET /api/[entities]/{id} - Get | list_api | `read.enabled == true` |
| 5 | api | POST /api/[entities] - Create | list_api | `create.enabled == true` |
| 6 | api | PUT /api/[entities]/{id} - Update | get_api | `update.enabled == true` |
| 7 | api | Soft delete [Entity] (set is_active=false) | get_api | `delete.enabled == true && delete.strategy == "soft"` |
| 7 | api | DELETE /api/[entities]/{id} - Hard delete | get_api | `delete.enabled == true && delete.strategy == "hard"` |

### From Flow Diagram:

| # | Category | Description | Dependencies |
|---|----------|-------------|--------------|
| 1 | feature | [Flow] - Step 1 | related_api |
| 2 | feature | [Flow] - Step 2 | step_1 |
| 3 | feature | [Flow] - Decision handling | step_2 |

### From Mockups:

| # | Category | Description | Dependencies |
|---|----------|-------------|--------------|
| 1 | feature-frontend | Create [Page] page | related_api |

---

## Example

### Input: system-design.md

```markdown
## ER Diagram
- User (id, email, name, role)
- Product (id, name, price, category_id)
- Category (id, name)

## Flow Diagram
### User Registration
1. Open form
2. Validate input
3. Check email exists
4. Create user
5. Send email
```

### Input: mockup_list.json
```json
{
  "pages": [
    { "id": "001", "name": "Login", "category": "auth" },
    { "id": "004", "name": "User List", "crud_group": "User" }
  ]
}
```

### Output: feature_list.json

```json
{
  "epics": [
    {
      "id": "setup",
      "name": "Project Setup",
      "features": [1, 2]
    },
    {
      "id": "user",
      "name": "User Management",
      "bounded_context": "Identity",
      "features": [3, 4, 5, 6, 7, 8, 9, 10, 20, 21]
    },
    {
      "id": "product",
      "name": "Product Catalog",
      "bounded_context": "Catalog",
      "features": [11, 12, 13, 14, 15, 16, 17]
    },
    {
      "id": "category",
      "name": "Category (Master Data)",
      "bounded_context": "Catalog",
      "features": [18, 19]
    }
  ],
  "features": [
    // Setup
    { "id": 1, "category": "setup", "description": "Create project structure" },
    { "id": 2, "category": "setup", "description": "Setup database and ORM" },

    // User Entity
    { "id": 3, "epic": "user", "category": "domain", "description": "Create User entity" },
    { "id": 4, "epic": "user", "category": "data", "description": "Create User DbContext configuration" },
    { "id": 5, "epic": "user", "category": "api", "description": "GET /api/users - List" },
    { "id": 6, "epic": "user", "category": "api", "description": "GET /api/users/{id}" },
    { "id": 7, "epic": "user", "category": "api", "description": "POST /api/users" },
    { "id": 8, "epic": "user", "category": "api", "description": "PUT /api/users/{id}" },
    { "id": 9, "epic": "user", "category": "api", "description": "Soft delete User (set is_active = false)" },

    // User Registration Flow
    { "id": 10, "epic": "user", "category": "feature", "description": "User Registration flow" },

    // UI from Mockups
    { "id": 20, "epic": "ui-auth", "category": "feature-frontend", "description": "Create Login page" },
    { "id": 21, "epic": "ui-user", "category": "feature-frontend", "description": "Create User List page" }
  ]
}
```

---

## Summary Report

After creating features, display summary:

```
=== Feature Generation Summary ===

Source Documents:
- System Design: docs/system-design.md
- Mockups: .mockups/mockup_list.json

Generated:
- Epics: 5
- Features: 25
  - Setup: 2
  - Domain: 4
  - Data: 4
  - API: 12
  - UI: 3

Dependencies:
- Total links: 45
- No circular dependencies found

Next Steps:
1. Review generated features
2. Adjust priorities and complexities
3. Run /validate-coverage
4. Start development with /continue
```

---

## Notes

- Can be run once per project (or use flag `--force` to regenerate)
- Created features will have `notes: "Auto-generated from design docs"`
- Should review and adjust dependencies after creation
- Use with `/validate-coverage` to check completeness

> 💬 **หมายเหตุ**: คำสั่งนี้จะตอบกลับเป็นภาษาไทย
