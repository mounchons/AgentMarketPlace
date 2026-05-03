---
description: Add a new feature to feature_list.json
allowed-tools: Bash(*), Read(*), Write(*), Edit(*)
---

# Add Feature - Add a New Feature

You will help the user add a new feature to the project.

## Input Received

Feature to add: $ARGUMENTS

## Steps to Follow

### Step 1: Check Environment

```bash
# Check if feature_list.json exists
cat feature_list.json
```

**If feature_list.json not found:** Inform user they need to run `/init` first.

### Step 2: Analyze New Feature

From user input:
- Define a clear description
- Determine category (setup, domain, functional, quality, enhancement, etc.)
- Determine priority (high, medium, low)
- Break into steps (3-5 steps)

### Step 3: Find Next ID

Read feature_list.json and find the highest existing id, then +1.

### Step 4: Check Design Doc Impact ⭐ NEW

ตรวจสอบว่า feature ใหม่กระทบกับ design document ที่ออกแบบไว้หรือไม่

```bash
# ตรวจหา design_doc_list.json (output ของ system-design-doc plugin)
test -f design_doc_list.json && echo "FOUND" || echo "NOT_FOUND"
```

**Case A: ไม่พบ design_doc_list.json**

ข้ามขั้นตอนนี้ — ไปต่อ Step 5

**Case B: พบ design_doc_list.json**

วิเคราะห์ feature description + steps เทียบกับ design doc โดยใช้ heuristics:

| Detection Pattern | กระทบ Design Section | Action |
|-------------------|---------------------|--------|
| `(GET\|POST\|PUT\|DELETE\|PATCH) /api/...` | `api_endpoints[]` | ค้นว่ามี API นี้ใน design doc แล้วหรือยัง |
| ชื่อตรงกับ `entities[].name` หรือ `table_name` | `entities[]` | flag ว่ากระทบ entity เดิม |
| keyword: `เพิ่ม field`, `เพิ่ม attribute`, `add column`, `add property` | `entities[].attributes` | flag ว่าต้องเพิ่ม attribute |
| keyword: `Page`, `หน้า`, `screen`, `view`, `mockup` | `diagrams.sitemap`, `ui_mockups` | flag ว่ากระทบ UI design |
| keyword: `flow`, `workflow`, `process`, `business flow` | `diagrams.flow_diagrams[]` | flag ว่าต้องสร้าง/แก้ flow |
| keyword: `sequence`, `interaction`, `request flow` | `diagrams.sequence_diagrams[]` | flag ว่าต้องสร้าง/แก้ sequence |
| ไม่ตรงกับ pattern ใด | — | no impact, ไปต่อได้ |

**ดึงข้อมูลจาก design_doc_list.json:**

```bash
# entities ที่มีอยู่
cat design_doc_list.json | jq '.entities[] | {id, name, table_name, attributes: [.attributes[]?.name]}'

# api_endpoints ที่มีอยู่
cat design_doc_list.json | jq '.api_endpoints[] | {id, method, path, feature_id}'

# diagrams ที่มี
cat design_doc_list.json | jq '.diagrams | keys'
```

#### ถ้าตรวจไม่พบ impact → แจ้ง user แล้วไปต่อ Step 5

```
✅ Design Doc Impact Check
   ตรวจสอบ design_doc_list.json — ไม่พบ impact ที่ชัดเจน
   ดำเนินการสร้าง feature ต่อได้
```

#### ถ้าตรวจพบ impact → แสดงรายงาน + ถาม user

```
🔍 Design Doc Impact Detected

📋 Feature ที่จะสร้าง:
   "[FEATURE_DESCRIPTION]"

📌 พบ Impact ต่อ design_doc_list.json:

   1. API Endpoints
      ❓ feature นี้สร้าง POST /api/users
      → ยังไม่มีใน api_endpoints[] (จะต้องเพิ่ม API-XXX)
      → หรือถ้ามีอยู่แล้ว → ผูก feature_id

   2. Entity "User" (ENT-001)
      ⚠ feature mention "phone field"
      → entity.attributes ยังไม่มี phone
      → ควรเพิ่ม attribute

   3. Sequence Diagram
      ⚠ feature mention "user registration sequence"
      → ยังไม่มี SEQ ที่เกี่ยวข้อง
      → แนะนำสร้าง

❓ คุณต้องการดำเนินการอย่างไร?
   [1] อัปเดต design doc ก่อนสร้าง feature (แนะนำ)
       → จะรัน /edit-section / /create-diagram ทีละตัว
   [2] สร้าง feature ก่อน — บันทึก pending sync action
       → feature.design_doc_refs.pending_updates[] จะระบุสิ่งที่ค้าง
       → รัน /sync-with-features ทีหลังเพื่อ sync
   [3] ยกเลิก — ไม่สร้าง feature
```

**ใช้ AskUserQuestion tool ถาม user**

#### Action ตามคำตอบของ user

**ถ้า [1] อัปเดต design doc ก่อน:**

แนะนำคำสั่งที่ user ต้องรันก่อน (ไม่ทำเอง — ให้ user ตัดสินใจ):
- `/edit-section api-endpoints` — เพิ่ม/แก้ API
- `/edit-section entities` — เพิ่ม attribute หรือ entity ใหม่
- `/create-diagram sequence` — สร้าง sequence diagram
- `/create-diagram flow` — สร้าง flow diagram

หลังจาก user รันเสร็จ → ให้ user รัน `/add-feature` ใหม่อีกครั้ง

**ถ้า [2] สร้าง feature ก่อน:**

- เพิ่ม `design_doc_refs.pending_updates[]` ใน feature ใหม่ (ดู Step 5)
- เพิ่ม references ที่ design_doc_list.json
- ดำเนินการ Step 5 ต่อ

**ถ้า [3] ยกเลิก:**

หยุดการสร้าง feature — ออกจาก command

### Step 5: Create New Feature Entry

```json
{
  "id": [NEXT_ID],
  "category": "[CATEGORY]",
  "description": "[DESCRIPTION]",
  "priority": "[PRIORITY]",
  "steps": [
    "step 1",
    "step 2",
    "step 3"
  ],
  "dependencies": [],
  "references": [],
  "design_doc_refs": {
    "api_ref": null,
    "entity_ref": null,
    "diagram_refs": [],
    "pending_updates": []
  },
  "estimated_time": "[ESTIMATED_TIME]",
  "passes": false,
  "tested_at": null,
  "notes": "",
  "added_at": "[TIMESTAMP]"
}
```

**Note:**
- `references`: array of paths to related documents, e.g., `.mockups/page.mockup.md`, `docs/logic.md`, `sql/create_table.sql`
- `design_doc_refs.api_ref`: API ID จาก design_doc_list.json (เช่น "API-005") — null ถ้าไม่กระทบ
- `design_doc_refs.entity_ref`: Entity ID (เช่น "ENT-001") — null ถ้าไม่กระทบ
- `design_doc_refs.diagram_refs`: array ของ diagram IDs (เช่น `["SEQ-001", "FLOW-002"]`)
- `design_doc_refs.pending_updates`: array ของ action ที่ user เลือก [2] (skip ก่อน)
  ตัวอย่าง: `[{"type": "add-api", "spec": "POST /api/users", "rationale": "feature ใหม่ต้องการ API"}]`

**ถ้า user เลือก [1] หรือไม่มี impact:** เก็บ `pending_updates: []`

**ถ้า user เลือก [2]:** กรอก `pending_updates[]` ตาม impact ที่ตรวจพบ

### Step 6: Add to feature_list.json

- Add new feature to `features` array
- Update `summary.total` (+1)
- Update `summary.failed` (+1)
- Update `summary.last_updated`

### Step 7: Update Progress Log

Add to .agent/progress.md:
```markdown
### Feature Added
- Feature #[ID]: [description]
- Category: [category]
- Priority: [priority]
- Design doc impact: [none | resolved | pending]
- Pending sync actions: [count, ถ้ามี — ระบุ /sync-with-features]
- Added at: [timestamp]
```

### Step 8: Git Commit (if user wants)

```bash
git add feature_list.json .agent/progress.md
git commit -m "feat: Add feature #[ID] - [short description]"
```

## Important Rules

❌ **Forbidden:**
- Modify existing features
- Mark new feature as passes: true
- Implement feature immediately (only add to list)
- Create features that are too large (should be completable in 1 session)

✅ **Must do:**
- Ask user if input is unclear
- Split large features into multiple small features
- Specify clear steps
- Record timestamp of when it was added

## Expected Output

When complete, inform user:
1. Newly created Feature ID
2. Feature details
3. Total features after adding (X total, Y passed, Z pending)
4. Recommend using `/continue` to start working on new feature

## Examples

**Input:** Add a feature for searching todos by title

**Output that should be created:**
```json
{
  "id": 11,
  "category": "functional",
  "description": "GET /api/todos/search - search todos by title",
  "priority": "medium",
  "steps": [
    "Add new endpoint in TodosController",
    "Accept query parameter 'q' or 'title'",
    "Use LIKE query with SQLite",
    "Return empty array if not found",
    "Test search with various keywords"
  ],
  "dependencies": [5],
  "references": ["docs/api-spec.md"],
  "estimated_time": "20min",
  "passes": false,
  "tested_at": null,
  "notes": "",
  "added_at": "2025-01-15T10:30:00Z"
}
```

### Example 2: Feature with references + design doc impact

**Input:** Add a feature for User Profile page (with design_doc_list.json present)

**Step 4 Impact Detected:**
- Page keyword detected → กระทบ `diagrams.sitemap` + `ui_mockups`
- Entity "User" mentioned → ENT-001 อยู่แล้ว, ไม่ต้องเพิ่ม
- ไม่มี API ใหม่

**User เลือก [2]: สร้าง feature ก่อน — บันทึก pending sync**

**Output that should be created:**
```json
{
  "id": 12,
  "category": "feature",
  "description": "Create User Profile page",
  "priority": "medium",
  "steps": [
    "Create ProfileController",
    "Create Profile view per mockup",
    "Display user data from database",
    "Test UI and data binding"
  ],
  "dependencies": [3, 5],
  "references": [
    ".mockups/profile.mockup.md",
    "docs/user-entity.md",
    "design_doc_list.json#entities.ENT-001"
  ],
  "design_doc_refs": {
    "api_ref": null,
    "entity_ref": "ENT-001",
    "diagram_refs": [],
    "pending_updates": [
      {
        "type": "add-page-to-sitemap",
        "spec": "/profile",
        "rationale": "Profile page ยังไม่มีใน sitemap — ต้องเพิ่ม"
      },
      {
        "type": "add-ui-mockup",
        "spec": "profile.mockup.md",
        "rationale": "ต้อง mockup ก่อน implement"
      }
    ]
  },
  "estimated_time": "25min",
  "passes": false,
  "tested_at": null,
  "notes": "Pending design doc sync — รัน /sync-with-features หลัง mockup เสร็จ",
  "added_at": "2025-01-15T11:00:00Z"
}
```

### Example 3: Feature ที่ไม่กระทบ design doc

**Input:** Add a feature for fixing typo in error message

**Step 4 Impact Detected:** ไม่พบ pattern ที่กระทบ design doc

**Output:**
```json
{
  "id": 13,
  "category": "bugfix",
  "description": "Fix typo in login error message",
  "priority": "low",
  "steps": [
    "หา error message ที่พิมพ์ผิดใน LoginController",
    "แก้ตัวสะกด",
    "ทดสอบ"
  ],
  "dependencies": [],
  "references": [],
  "design_doc_refs": {
    "api_ref": null,
    "entity_ref": null,
    "diagram_refs": [],
    "pending_updates": []
  },
  "estimated_time": "5min",
  "passes": false,
  "tested_at": null,
  "notes": "",
  "added_at": "2025-01-15T11:30:00Z"
}
```

> 💬 **หมายเหตุ**: คำสั่งนี้จะตอบกลับเป็นภาษาไทย
