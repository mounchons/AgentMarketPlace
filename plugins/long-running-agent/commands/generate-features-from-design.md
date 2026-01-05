# /generate-features-from-design

สร้าง features อัตโนมัติจาก System Design Document และ UI Mockups รวมกัน เพื่อให้ครอบคลุมทุก layer ของระบบ

---

## Usage

```
/generate-features-from-design
```

---

## Prerequisites

- ควรมี System Design Document (`*-system-design.md`)
- ควรมี `.mockups/mockup_list.json` (optional)
- ควรรัน `/system-design-doc` ก่อน

---

## Process

### Step 1: ค้นหา Design Documents

```bash
# หา system design docs
ls -la *system-design*.md docs/*system-design*.md 2>/dev/null

# หา mockup list
ls -la .mockups/mockup_list.json 2>/dev/null
```

### Step 2: Parse ER Diagram → Entity Features

สำหรับแต่ละ Entity ใน ER Diagram:

```
Entity: User
├── Feature: สร้าง User entity (domain)
├── Feature: สร้าง User DbContext configuration (data)
├── Feature: GET /api/users - List (api)
├── Feature: GET /api/users/{id} - Get by ID (api)
├── Feature: POST /api/users - Create (api)
├── Feature: PUT /api/users/{id} - Update (api)
├── Feature: DELETE /api/users/{id} - Delete (api)
└── Feature: User validation (quality)
```

**Feature Template for Entity:**
```json
{
  "id": [next_id],
  "epic": "[entity_name.toLowerCase()]",
  "category": "domain",
  "description": "สร้าง [Entity] entity",
  "priority": "high",
  "complexity": "medium",
  "subtasks": [
    { "id": "[id].1", "description": "สร้าง model class", "done": false },
    { "id": "[id].2", "description": "เพิ่ม properties ตาม Data Dictionary", "done": false },
    { "id": "[id].3", "description": "เพิ่ม validations", "done": false }
  ],
  "acceptance_criteria": [
    "entity class สร้างถูกต้องตาม ER Diagram",
    "properties ครบตาม Data Dictionary",
    "relationships ถูกต้อง"
  ],
  "references": [
    "[design_doc_path]#er-diagram",
    "[design_doc_path]#data-dictionary"
  ]
}
```

### Step 3: Parse Flow Diagram → Logic Features

สำหรับแต่ละ Flow ใน Flow Diagram:

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

(ใช้ logic เดียวกับ `/generate-features-from-mockups`)

### Step 5: Create Epics by Bounded Context

```json
{
  "epics": [
    {
      "id": "user",
      "name": "User Management",
      "description": "จัดการผู้ใช้งาน",
      "bounded_context": "Identity",
      "features": [entity_features + api_features + ui_features]
    },
    {
      "id": "product",
      "name": "Product Catalog",
      "description": "จัดการสินค้า",
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

| # | Category | Description | Dependencies |
|---|----------|-------------|--------------|
| 1 | domain | สร้าง [Entity] entity | setup |
| 2 | data | สร้าง [Entity] configuration | entity |
| 3 | api | GET /api/[entities] - List | data |
| 4 | api | GET /api/[entities]/{id} - Get | list_api |
| 5 | api | POST /api/[entities] - Create | list_api |
| 6 | api | PUT /api/[entities]/{id} - Update | get_api |
| 7 | api | DELETE /api/[entities]/{id} - Delete | get_api |

### From Flow Diagram:

| # | Category | Description | Dependencies |
|---|----------|-------------|--------------|
| 1 | feature | [Flow] - Step 1 | related_api |
| 2 | feature | [Flow] - Step 2 | step_1 |
| 3 | feature | [Flow] - Decision handling | step_2 |

### From Mockups:

| # | Category | Description | Dependencies |
|---|----------|-------------|--------------|
| 1 | feature-frontend | สร้างหน้า [Page] | related_api |

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
    { "id": 1, "category": "setup", "description": "สร้าง project structure" },
    { "id": 2, "category": "setup", "description": "ตั้งค่า database และ ORM" },

    // User Entity
    { "id": 3, "epic": "user", "category": "domain", "description": "สร้าง User entity" },
    { "id": 4, "epic": "user", "category": "data", "description": "สร้าง User DbContext configuration" },
    { "id": 5, "epic": "user", "category": "api", "description": "GET /api/users - List" },
    { "id": 6, "epic": "user", "category": "api", "description": "GET /api/users/{id}" },
    { "id": 7, "epic": "user", "category": "api", "description": "POST /api/users" },
    { "id": 8, "epic": "user", "category": "api", "description": "PUT /api/users/{id}" },
    { "id": 9, "epic": "user", "category": "api", "description": "DELETE /api/users/{id}" },

    // User Registration Flow
    { "id": 10, "epic": "user", "category": "feature", "description": "User Registration flow" },

    // UI from Mockups
    { "id": 20, "epic": "ui-auth", "category": "feature-frontend", "description": "สร้างหน้า Login" },
    { "id": 21, "epic": "ui-user", "category": "feature-frontend", "description": "สร้างหน้า User List" }
  ]
}
```

---

## Summary Report

หลังจากสร้าง features จะแสดง summary:

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

- รันได้ครั้งเดียวต่อโปรเจค (หรือใช้ flag `--force` เพื่อ regenerate)
- Features ที่สร้างจะมี `notes: "Auto-generated from design docs"`
- ควรตรวจสอบและปรับ dependencies หลังจากสร้าง
- ใช้ร่วมกับ `/validate-coverage` เพื่อตรวจสอบความครบถ้วน
