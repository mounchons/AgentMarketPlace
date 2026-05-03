---
description: Edit a passed feature (create a new feature referencing the original)
allowed-tools: Bash(*), Read(*), Write(*), Edit(*)
---

# Edit Feature - Edit a Passed Feature

You will help the user edit a passed feature by creating a new feature referencing the original.

> **Key principle:** A passed feature will not be modified directly. Instead, a new feature will be created to preserve development history.

## Input Received

Feature ID and changes: $ARGUMENTS

**Input formats:**
- `/edit-feature 5 - add OAuth login`
- `/edit-feature 7 - update endpoint to support pagination`
- `/edit-feature 3 - add new fields per design doc`

## Steps to Follow

### Step 1: Check Environment

```bash
# Check if feature_list.json exists
cat feature_list.json
```

**If feature_list.json not found:** Inform user they need to run `/init` first.

### Step 2: Parse Input and Verify Feature

From user input:
1. Extract the Feature ID to edit
2. Extract change details

```bash
# Read feature_list.json and find the specified feature
cat feature_list.json | jq '.features[] | select(.id == [FEATURE_ID])'
```

**Verify:**
- Feature ID actually exists
- Feature has `passes: true` (already completed)

**If feature not yet passed:** Inform user:
> "Feature #X is not yet complete (passes: false). Use `/continue` to complete it first, or edit the feature directly."

### Step 3: Analyze Changes

From details provided by user:
- Define a clear new description
- Determine category (may be `enhancement` or keep original)
- Determine priority (high, medium, low)
- Break into steps (3-5 steps)
- Specify references if any (mockup, design doc, SQL)

### Step 4: Find Next ID

Read feature_list.json and find the highest existing id, then +1.

### Step 5: Check Design Doc Impact ⭐ NEW

ตรวจสอบว่าการแก้ feature นี้กระทบ design document ที่ออกแบบไว้หรือไม่

```bash
# ตรวจหา design_doc_list.json
test -f design_doc_list.json && echo "FOUND" || echo "NOT_FOUND"
```

**Case A: ไม่พบ design_doc_list.json** → ข้ามขั้นตอนนี้ ไป Step 6

**Case B: พบ design_doc_list.json** → วิเคราะห์ impact

#### ⭐ Important: ตรวจ original feature.design_doc_refs ก่อน

Edit feature สำคัญมาก เพราะ original feature **อาจมี design_doc_refs ผูกอยู่แล้ว** (ถ้าสร้างผ่าน /add-feature เวอร์ชันใหม่)

```bash
# ดูว่า original feature เคยผูกกับ design doc อะไรบ้าง
cat feature_list.json | jq ".features[] | select(.id == [OLD_ID]) | .design_doc_refs"
```

**ถ้ามี:**
- `api_ref`: API ID ที่ผูกอยู่ (เช่น "API-005")
- `entity_ref`: Entity ID ที่ผูกอยู่ (เช่น "ENT-001")
- `diagram_refs`: Diagram IDs ที่ผูกอยู่

#### Detection: เปรียบเทียบ "การเปลี่ยนแปลง" กับ design doc

| Change Pattern (จาก user input) | กระทบ Design Section | Action |
|--------------------------------|---------------------|--------|
| "เพิ่ม endpoint", "add new API" | `api_endpoints[]` | ต้องเพิ่ม API entry ใหม่ |
| "เพิ่ม pagination", "add filter" | `api_endpoints[]` (request_body, response_schema) | ต้องอัปเดต API spec |
| "เพิ่ม field/column/attribute" | `entities[].attributes` | ต้องอัปเดต entity attributes |
| "เปลี่ยน relation", "เพิ่ม FK" | `entities[].relationships`, `er_diagram` | ต้องอัปเดต ER diagram |
| "เพิ่ม role/permission", "OAuth" | `cross-cutting` (security), `api_endpoints[].permissions` | ต้องอัปเดต permission |
| "เพิ่มหน้า/page" | `sitemap`, `ui_mockups` | ต้องเพิ่ม page |
| "เปลี่ยน flow", "add step" | `flow_diagrams[]`, `sequence_diagrams[]` | ต้องอัปเดต diagram |
| ลบ feature/endpoint | ทุก section ที่อ้างถึง | ต้อง mark deprecated หรือลบ |

**ดึงข้อมูลจาก design doc:**

```bash
# ถ้า original feature มี api_ref → ดู API spec
cat design_doc_list.json | jq '.api_endpoints[] | select(.id == "[API_REF]")'

# ถ้ามี entity_ref → ดู entity spec
cat design_doc_list.json | jq '.entities[] | select(.id == "[ENTITY_REF]")'
```

#### ถ้าไม่พบ impact → แจ้ง user แล้วไป Step 6

```
✅ Design Doc Impact Check
   Original feature ไม่ผูกกับ design doc / การเปลี่ยนแปลงไม่กระทบ design
   ดำเนินการสร้าง edit feature ต่อได้
```

#### ถ้าพบ impact → แสดงรายงาน + ถาม user

```
🔍 Design Doc Impact Detected (Edit Feature)

📋 Feature ที่จะแก้:
   #[OLD_ID]: "[ORIGINAL_DESCRIPTION]"
   → "[NEW_DESCRIPTION]"

🔗 Original feature ผูกกับ:
   - API: API-005 (POST /api/users)
   - Entity: ENT-001 (User)
   - Diagrams: SEQ-001

📌 พบ Impact จากการแก้ไข:

   1. ⚠ API-005 (POST /api/users)
      → user เพิ่ม "pagination support"
      → ต้องอัปเดต api_endpoints[].request_body / response_schema
      → version จะต้อง bump (breaking change?)

   2. ⚠ Entity ENT-001 (User)
      → user เพิ่ม "phone" field
      → entity.attributes ยังไม่มี — ต้องเพิ่ม
      → er_diagram อาจต้องแก้

   3. ⚠ SEQ-001 (User registration)
      → flow เปลี่ยน เพราะ pagination ไม่กระทบ — แต่ phone เพิ่มขั้น validation
      → ควรอัปเดต sequence diagram

❓ คุณต้องการดำเนินการอย่างไร?
   [1] อัปเดต design doc ก่อนสร้าง edit feature (แนะนำสำหรับ breaking change)
       → จะแนะนำคำสั่ง /edit-section ที่ต้องรัน
   [2] สร้าง edit feature ก่อน — บันทึก pending sync action
       → feature.design_doc_refs.pending_updates[] จะระบุ
       → รัน /sync-with-features ทีหลังเพื่อ sync
   [3] ยกเลิก — ไม่สร้าง edit feature
```

**ใช้ AskUserQuestion tool ถาม user**

#### Action ตามคำตอบ

**ถ้า [1]:** แนะนำ `/edit-section api-endpoints`, `/edit-section entities`, `/create-diagram sequence` ตาม impact → user รันก่อน → กลับมารัน `/edit-feature` อีกครั้ง

**ถ้า [2]:** ดำเนินการ Step 6 + กรอก `design_doc_refs.pending_updates[]` พร้อม inherit `api_ref`/`entity_ref`/`diagram_refs` จาก original feature

**ถ้า [3]:** หยุด — ออกจาก command

### Step 6: Create New Feature

```json
{
  "id": [NEXT_ID],
  "category": "[CATEGORY]",
  "description": "[NEW_DESCRIPTION]",
  "priority": "[PRIORITY]",
  "steps": [
    "step 1",
    "step 2",
    "step 3"
  ],
  "dependencies": [ORIGINAL_FEATURE_DEPENDENCIES],
  "references": [],
  "related_features": [ORIGINAL_FEATURE_ID],
  "supersedes": [ORIGINAL_FEATURE_ID],
  "design_doc_refs": {
    "api_ref": "[INHERITED_OR_NEW]",
    "entity_ref": "[INHERITED_OR_NEW]",
    "diagram_refs": ["[INHERITED_OR_NEW]"],
    "pending_updates": []
  },
  "estimated_time": "[ESTIMATED_TIME]",
  "passes": false,
  "tested_at": null,
  "notes": "Updated from Feature #[ORIGINAL_ID] - [short reason]",
  "created_at": "[TIMESTAMP]"
}
```

**Important fields:**
- `related_features`: Array of related feature IDs
- `supersedes`: Feature ID being replaced/improved
- `notes`: Explain which feature this improves
- `design_doc_refs`: **inherit** จาก original feature ก่อน แล้วค่อย override ตาม impact ที่ตรวจพบ
- `design_doc_refs.pending_updates[]`: ถ้า user เลือก [2] ใน Step 5 → กรอกรายการ action ที่ค้าง

### Step 7: Add to feature_list.json

- Add new feature to `features` array
- Update `summary.total` (+1)
- Update `summary.failed` (+1)
- Update `summary.last_updated`

**Note:** The original feature remains unchanged.

### Step 8: Update Progress Log

Add to .agent/progress.md:
```markdown
### Feature Edit
- Created Feature #[NEW_ID] from Feature #[OLD_ID]
- Original: [original description]
- Changes: [what changed]
- Design doc impact: [none | resolved | pending]
- Pending sync actions: [count, ถ้ามี]
- Old feature preserved (passes: true)
- New feature created (passes: false)
- Created at: [timestamp]
```

### Step 9: Git Commit

```bash
git add feature_list.json .agent/progress.md
git commit -m "feat: Edit Feature #[OLD_ID] → Create Feature #[NEW_ID] - [short description]"
```

## Important Rules

❌ **Forbidden:**
- Modify a passed feature directly (must preserve history)
- Modify a feature that hasn't passed (use `/continue` instead)
- Delete old feature
- Change ID of old feature
- Mark new feature as passes: true
- Implement feature immediately (only add to list)

✅ **Must do:**
- Always create a new feature (no in-place editing)
- Include `related_features` and `supersedes` to track history
- Include `notes` explaining what was improved
- Copy dependencies from original feature (if appropriate)
- Ask user if input is unclear
- Split large features into multiple small features

## Expected Output

When complete, inform user:

```
✅ สร้าง Feature ใหม่สำเร็จ

📋 Feature Details:
- New Feature: #[NEW_ID] - [description]
- Based on: Feature #[OLD_ID]
- Category: [category]
- Priority: [priority]
- Status: passes: false

📊 Summary:
- Total features: X (+1)
- Passed: Y
- Pending: Z (+1)

🔗 Relationship:
- Feature #[NEW_ID] supersedes Feature #[OLD_ID]
- Feature #[OLD_ID] preserved for history

💡 Next Step:
- ใช้ /continue เพื่อเริ่มทำ Feature #[NEW_ID]
```

## Examples

### Example 1: Add OAuth (with design doc impact)

**Input:** `/edit-feature 5 - add OAuth login`

**Original feature (ID: 5):**
```json
{
  "id": 5,
  "category": "feature",
  "description": "Create Login page with username/password",
  "design_doc_refs": {
    "api_ref": "API-001",
    "entity_ref": "ENT-001",
    "diagram_refs": ["SEQ-001"],
    "pending_updates": []
  },
  "passes": true,
  "tested_at": "2025-01-10T10:00:00Z"
}
```

**Step 5 Impact Detected:**
- "OAuth" keyword → กระทบ `cross-cutting.security` + ต้องเพิ่ม API endpoints (callback URLs)
- ต้องเพิ่ม OAuth provider config ใน `infrastructure`
- SEQ-001 (login sequence) ต้องเพิ่ม OAuth path

**User เลือก [2]: สร้าง edit feature ก่อน — บันทึก pending sync**

**New feature created (ID: 13):**
```json
{
  "id": 13,
  "category": "enhancement",
  "description": "Improve Login page - add OAuth login (Google, Facebook)",
  "priority": "high",
  "steps": [
    "Install OAuth packages",
    "Add OAuth providers configuration",
    "Create OAuth callback endpoints",
    "Update UI to add Sign in with Google/Facebook buttons",
    "Test OAuth flow"
  ],
  "dependencies": [1, 2],
  "references": [
    ".mockups/login.mockup.md",
    "design_doc_list.json#api_endpoints.API-001"
  ],
  "related_features": [5],
  "supersedes": 5,
  "design_doc_refs": {
    "api_ref": "API-001",
    "entity_ref": "ENT-001",
    "diagram_refs": ["SEQ-001"],
    "pending_updates": [
      {
        "type": "add-api",
        "spec": "GET /api/auth/oauth/callback/{provider}",
        "rationale": "OAuth callback endpoints ยังไม่มีใน design"
      },
      {
        "type": "update-security-section",
        "spec": "OAuth providers (Google, Facebook)",
        "rationale": "ต้องระบุ provider list + permission scopes"
      },
      {
        "type": "update-sequence-diagram",
        "spec": "SEQ-001",
        "rationale": "เพิ่ม OAuth path ใน login sequence"
      }
    ]
  },
  "estimated_time": "30min",
  "passes": false,
  "tested_at": null,
  "notes": "Updated from Feature #5 - add OAuth login support. Pending design doc sync (3 actions)",
  "created_at": "2025-01-15T14:00:00Z"
}
```

### Example 2: Update API endpoint

**Input:** `/edit-feature 7 - add pagination and filtering`

**Original feature (ID: 7):**
```json
{
  "id": 7,
  "category": "api",
  "description": "GET /api/products - List all products",
  "passes": true
}
```

**New feature created (ID: 14):**
```json
{
  "id": 14,
  "category": "enhancement",
  "description": "GET /api/products - add pagination and filtering",
  "priority": "medium",
  "steps": [
    "Add query parameters: page, pageSize, sortBy",
    "Add filter parameters: category, minPrice, maxPrice",
    "Implement pagination logic",
    "Return total count in response header",
    "Test pagination and filtering"
  ],
  "dependencies": [4],
  "references": ["docs/api-spec.md"],
  "related_features": [7],
  "supersedes": 7,
  "estimated_time": "25min",
  "passes": false,
  "tested_at": null,
  "notes": "Updated from Feature #7 - add pagination and filtering support",
  "created_at": "2025-01-15T14:30:00Z"
}
```

## Feature Relationship Diagram

```
Feature #5 (Login - Basic)          Feature #7 (Products - Basic)
    │ passes: true                      │ passes: true
    │                                   │
    └──── superseded by ────┐           └──── superseded by ────┐
                            │                                   │
                            ▼                                   ▼
                    Feature #13                         Feature #14
                    (Login - OAuth)                     (Products - Pagination)
                    passes: false                       passes: false
                    related_features: [5]               related_features: [7]
                    supersedes: 5                       supersedes: 7
```

## When to Use /edit-feature

| Scenario | Use /edit-feature? | Alternative |
|----------|-------------------|-------------|
| Feature passed, want to expand scope | ✅ Yes | - |
| Feature passed, found a bug | ✅ Yes (category: bugfix) | - |
| Feature not yet passed, want to edit | ❌ No | Use /continue |
| Want to add a new feature | ❌ No | Use /add-feature |
| Want to refactor code | ✅ Yes (category: refactor) | - |

> 💬 **หมายเหตุ**: คำสั่งนี้จะตอบกลับเป็นภาษาไทย
