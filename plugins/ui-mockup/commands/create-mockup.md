---
description: สร้าง UI Mockup/Wireframe หน้าใหม่
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*)
---

# Create Mockup Command

สร้าง UI Mockup/Wireframe สำหรับหน้าที่ระบุ

## Input ที่ได้รับ

User ต้องการสร้าง mockup: $ARGUMENTS

## ขั้นตอนที่ต้องทำ

### Step 0: ตรวจสอบ mockup_list.json (สำคัญ!)

```bash
# ตรวจสอบว่ามี mockup_list.json หรือไม่
cat .mockups/mockup_list.json 2>/dev/null
```

**ถ้ามี mockup_list.json:**
1. อ่าน pages ที่ status = "pending"
2. แสดงรายการให้ user เลือก (ถ้าไม่ได้ระบุชื่อหน้า)
3. ใช้ข้อมูลจาก json (url, access, components, crud_group, complexity, ui_pattern, etc.)

**ถ้าไม่มี mockup_list.json และไม่ได้ระบุหน้า:**
```
⚠️ ยังไม่มี mockup_list.json

💡 แนะนำ:
   /init-mockup → สร้าง mockup list จากเอกสารในโปรเจค
   /create-mockup [page-name] → สร้าง mockup โดยระบุชื่อหน้าเอง
```

**ถ้ามี mockup_list.json และไม่ได้ระบุหน้า:**
```
📋 Pending pages (from mockup_list.json):

   ┌─────┬────────────────────┬─────────────────┬──────────┬──────────────┬────────────┐
   │  #  │ Page Name          │ URL             │ Priority │ CRUD Group   │ UI Pattern │
   ├─────┼────────────────────┼─────────────────┼──────────┼──────────────┼────────────┤
   │  1  │ Login              │ /auth/login     │ high     │ -            │ -          │
   │  2  │ Dashboard          │ /dashboard      │ high     │ -            │ -          │
   │  3  │ User List          │ /admin/users    │ medium   │ User (list)  │ page       │
   │  4  │ User Form          │ /admin/users/new│ medium   │ User (form)  │ page       │
   │  5  │ Department List    │ /admin/depts    │ low      │ Department   │ modal      │
   └─────┴────────────────────┴─────────────────┴──────────┴──────────────┴────────────┘

   เลือกหมายเลข (1-5) หรือพิมพ์ชื่อหน้า:
```

### Step 1: ตรวจสอบ Input

**วิเคราะห์ว่า user ต้องการอะไร:**

1. **ชื่อหน้า** - หน้าอะไรที่ต้องสร้าง (Login, Dashboard, List, Form, etc.)
2. **Source** - มี mockup_list.json หรือ system-design-doc ให้อ้างอิงหรือไม่
3. **Requirements** - มี requirements พิเศษหรือไม่ (responsive, specific components)

### Step 2: ค้นหา Source Documents (ถ้ามี)

```bash
# ค้นหา system-design-doc
ls -la *.md 2>/dev/null | grep -i "design\|system\|spec"

# ค้นหา Sitemap section
grep -l "Sitemap\|sitemap" *.md 2>/dev/null

# ค้นหา Screen Specifications
grep -l "Screen Spec\|SCR-" *.md 2>/dev/null
```

**ถ้าพบ system-design-doc:**
- อ่าน Sitemap section
- อ่าน Screen Specifications
- อ่าน User Roles & Permissions

### Step 2.5: ดึง Related Documents

**ตรวจสอบ related_documents จาก mockup_list.json:**

```bash
# อ่าน related_documents ของ page ที่จะสร้าง
cat .mockups/mockup_list.json | jq '.pages[] | select(.id == "[PAGE_ID]") | .related_documents'
```

**สำหรับแต่ละ document:**
1. ถ้า type = "system-design" → อ่าน section ที่เกี่ยวข้อง
2. ถ้า type = "api" → อ่าน API specification
3. ถ้า type = "requirements" → อ่าน requirements

**ใช้ข้อมูลจาก documents เพื่อ:**
- กำหนด fields ใน form
- กำหนด columns ใน table
- กำหนด data ที่แสดงใน detail page
- กำหนด validation rules

### Step 2.6: ตรวจสอบ CRUD Group และ UI Pattern

**ถ้าหน้านี้เป็นส่วนของ CRUD group:**

```bash
# หา pages อื่นใน CRUD group เดียวกัน
cat .mockups/mockup_list.json | jq '.pages[] | select(.crud_group == "[ENTITY_NAME]")'
```

**ตรวจสอบ complexity และ ui_pattern:**

| Complexity | UI Pattern | Behavior |
|------------|------------|----------|
| simple | modal | View/Create/Edit ผ่าน Modal, Delete ผ่าน SweetAlert2 |
| complex | page | View/Create/Edit ผ่านหน้าแยก, Delete ผ่าน SweetAlert2 |

**เพิ่มข้อมูลใน Related Documents section:**
- List page → Link ไปยัง Form และ Detail (ถ้า complex)
- Form page → Link ไปยัง List และ Detail
- Detail page → Link ไปยัง List และ Form

**Consistency Check:**
- ใช้ components เดียวกันกับหน้าอื่นใน group (เช่น Navbar, Sidebar)
- ใช้ color scheme เดียวกัน
- Navigation ต้องสอดคล้องกัน

### Step 3: สร้างโฟลเดอร์ .mockups (ถ้ายังไม่มี)

```bash
mkdir -p .mockups
```

### Step 4: สร้าง Mockup File

**File Naming Convention:** `[NNN]-[page-name].mockup.md`

- NNN = 3 หลักตัวเลขจาก page ID (e.g., 001, 002, 015)
- page-name = ชื่อหน้าแบบ kebab-case (e.g., login, user-list, user-form)

**ตัวอย่าง:**
| ID | Name | Filename |
|----|------|----------|
| 001 | Login | 001-login.mockup.md |
| 004 | User List | 004-user-list.mockup.md |
| 005 | User Form | 005-user-form.mockup.md |
| 010 | Department List | 010-department-list.mockup.md |

สร้างไฟล์ `.mockups/[NNN]-[page-name].mockup.md` ตาม template:

```markdown
# [Page Name] - UI Mockup

**Version**: 1.0.0
**Created**: [DATE]
**Last Updated**: [DATE]
**Status**: Draft

---

## Page Info

| Property | Value |
|----------|-------|
| Page ID | [NNN] |
| Page Name | [ชื่อหน้า] |
| URL | /path/to/page |
| Access | [Roles ที่เข้าถึงได้] |
| Parent Page | [หน้าแม่] |
| CRUD Group | [Entity name หรือ N/A] |
| CRUD Type | [list / form / detail / N/A] |
| Complexity | [simple / complex / N/A] |
| UI Pattern | [modal / page / N/A] |
| Action Column | [first / last / N/A] |
| Alert Library | SweetAlert2 |

---

## CRUD Group Navigation

<!-- แสดงเมื่อหน้านี้เป็นส่วนของ CRUD group -->

| Type | Page | ID | Status | Link |
|------|------|----|--------|------|
| List | [Entity] List | [NNN] | [status] | [[NNN]-[entity]-list.mockup.md] |
| Form | [Entity] Form | [NNN] | [status] | [[NNN]-[entity]-form.mockup.md] |
| Detail | [Entity] Detail | [NNN] | [status] | [[NNN]-[entity]-detail.mockup.md] |

**Entity**: [Entity Name]
**Complexity**: [simple / complex]
**UI Pattern**: [modal / page]

---

## Description

[อธิบายสั้นๆ ว่าหน้านี้ทำอะไร]

---

## Layout Grid

### Desktop (12 columns)

```
┌────────────────────────────────────────────────────────────────────┐
│                           HEADER (12 col)                          │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│                          MAIN CONTENT                              │
│                           (12 col)                                 │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                           FOOTER (12 col)                          │
└────────────────────────────────────────────────────────────────────┘
```

### Tablet (8 columns)

```
[Tablet layout here]
```

### Mobile (4 columns)

```
[Mobile layout here]
```

---

## Wireframe

### Desktop View

```
[ASCII wireframe here]
```

### Mobile View

```
[ASCII wireframe here]
```

---

## Data Table

<!-- สำหรับหน้า List - Action column อยู่ด้านหน้า (ซ้ายสุด) -->

### Table Structure

| Column | Position | Width | Sortable | Description |
|--------|----------|-------|----------|-------------|
| Action | 1 (first) | 100px | No | View, Edit, Delete buttons |
| ID | 2 | 60px | Yes | Record ID |
| Name | 3 | auto | Yes | Primary display field |
| Status | 4 | 100px | Yes | Active/Inactive |
| Created | 5 | 120px | Yes | Created date |

### Table Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Entity] List                                              [+ Add New]     │
├─────────────────────────────────────────────────────────────────────────────┤
│  Search: [________________________]  Filter: [All ▼]  [Export] [Refresh]   │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌────────┬─────┬────────────────────┬─────────────────┬──────────┬────────┐ │
│ │ Action │ ID  │ Name               │ Email           │ Status   │ Date   │ │
│ ├────────┼─────┼────────────────────┼─────────────────┼──────────┼────────┤ │
│ │ 👁 ✏️ 🗑 │ 001 │ John Doe           │ john@email.com  │ Active   │ 01 Jan │ │
│ │ 👁 ✏️ 🗑 │ 002 │ Jane Smith         │ jane@email.com  │ Active   │ 02 Jan │ │
│ │ 👁 ✏️ 🗑 │ 003 │ Bob Wilson         │ bob@email.com   │ Inactive │ 03 Jan │ │
│ └────────┴─────┴────────────────────┴─────────────────┴──────────┴────────┘ │
│                                                                             │
│  Showing 1-10 of 50 records                    [<] [1] [2] [3] [4] [5] [>]  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Action Icons

**⚠️ แสดงเฉพาะ icons ของ operations ที่ `enabled: true` ใน `crud_actions` เท่านั้น**

| Icon | Action | Condition | Behavior (Simple Entity) | Behavior (Complex Entity) |
|------|--------|-----------|--------------------------|---------------------------|
| 👁 | View | `view.enabled == true` | Open View Modal | Navigate to Detail Page |
| ✏️ | Edit | `edit.enabled == true` | Open Edit Modal | Navigate to Edit Page |
| 🗑 | Delete | `delete.enabled == true` | SweetAlert2 Confirmation | SweetAlert2 Confirmation |

**Delete Strategy:**
- `delete.strategy == "soft"` → SweetAlert2 text: "This item will be deactivated."
- `delete.strategy == "hard"` → SweetAlert2 text: "This action cannot be undone."

**ตัวอย่าง entity ที่เป็น read-only (เช่น AuditLog):**
- action column จะมีแค่ 👁 (ไม่มี ✏️ และ 🗑)

---

## Components Used

| Component | Location | Props/Variants | Notes |
|-----------|----------|----------------|-------|
| [Component] | [Section] | [Props] | [Notes] |

### Component Details

#### [Component 1]

**Type**: [Button/Input/Card/etc.]
**States**:
- Default: [description]
- Hover: [description]
- Active: [description]
- Disabled: [description]

**Props**:
```yaml
label: "Button Text"
variant: "primary"
size: "medium"
icon: "arrow-right"
```

---

## Interactions

| ID | Trigger | Action | Result |
|----|---------|--------|--------|
| INT-001 | Click "Submit" button | Validate form → API POST | Success: SweetAlert2 success, redirect<br>Error: SweetAlert2 error |
| INT-002 | Click 👁 View icon | Open modal (simple) or navigate (complex) | Show record details (ถ้า view.enabled) |
| INT-003 | Click ✏️ Edit icon | Open modal (simple) or navigate (complex) | Show edit form (ถ้า edit.enabled) |
| INT-004 | Click 🗑 Delete icon | SweetAlert2 confirmation | Soft delete (default): deactivate + refresh<br>Hard delete: remove + refresh<br>(ถ้า delete.enabled) |
| INT-005 | Click "+ Add New" button | Open modal (simple) or navigate (complex) | Show create form |

---

## Modal Dialogs

<!-- สำหรับ Simple Entities - ใช้ Modal สำหรับ View/Create/Edit -->

### View Modal

**Trigger**: Click 👁 View icon in table

```
┌─────────────────────────────────────────────────────────────────┐
│                         (overlay)                                │
│      ┌────────────────────────────────────────────────────┐     │
│      │ View [Entity]                                 [×]  │     │
│      ├────────────────────────────────────────────────────┤     │
│      │                                                    │     │
│      │  ID: 001                                           │     │
│      │  Name: [Value]                                     │     │
│      │  Status: Active                                    │     │
│      │  Created: 2025-01-01                               │     │
│      │                                                    │     │
│      ├────────────────────────────────────────────────────┤     │
│      │                              [Edit]  [Close]       │     │
│      └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

### Create/Edit Modal

**Trigger**: Click "+ Add New" or ✏️ Edit icon

```
┌─────────────────────────────────────────────────────────────────┐
│                         (overlay)                                │
│      ┌────────────────────────────────────────────────────┐     │
│      │ Create/Edit [Entity]                          [×]  │     │
│      ├────────────────────────────────────────────────────┤     │
│      │                                                    │     │
│      │  Name *                                            │     │
│      │  ┌─────────────────────────────────────────────┐  │     │
│      │  │                                             │  │     │
│      │  └─────────────────────────────────────────────┘  │     │
│      │                                                    │     │
│      │  Code *                                            │     │
│      │  ┌─────────────────────────────────────────────┐  │     │
│      │  └─────────────────────────────────────────────┘  │     │
│      │                                                    │     │
│      │  Status                                            │     │
│      │  ○ Active  ○ Inactive                              │     │
│      │                                                    │     │
│      ├────────────────────────────────────────────────────┤     │
│      │                      [Cancel]  [Save]              │     │
│      └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

---

## SweetAlert2 Dialogs

### Delete Confirmation

**Trigger**: Click 🗑 Delete icon

```
┌─────────────────────────────────────────────────────────────────┐
│                         (overlay)                                │
│      ┌─────────────────────────────────────────────┐            │
│      │                                             │            │
│      │                    ⚠️                        │            │
│      │                                             │            │
│      │             Are you sure?                   │            │
│      │                                             │            │
│      │   This item will be deactivated.             │            │
│      │                                             │            │
│      │        [Cancel]  [Yes, deactivate it!]      │            │
│      │                                             │            │
│      └─────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

**Config**:
```javascript
Swal.fire({
  icon: 'warning',
  title: 'Are you sure?',
  text: "This item will be deactivated.",
  showCancelButton: true,
  confirmButtonColor: '#d33',
  cancelButtonColor: '#3085d6',
  confirmButtonText: 'Yes, deactivate it!',
  cancelButtonText: 'Cancel'
})
// Note: For hard delete, use text: "This action cannot be undone." and confirmButtonText: "Yes, delete it!"
```

### Success Alert

**Trigger**: After successful operation

```javascript
Swal.fire({
  icon: 'success',
  title: 'Success!',
  text: 'Your record has been saved.',
  confirmButtonText: 'OK'
})
```

---

## Validation Rules

| Field | Rules | Error Message |
|-------|-------|---------------|
| [field_name] | required, email | "กรุณากรอกอีเมลที่ถูกต้อง" |

---

## Design Tokens Used

### Colors
- Primary: `primary-500`
- Background: `neutral-50`
- Text: `neutral-900`
- Error: `error-500` (for delete buttons)
- Warning: `warning-500` (for SweetAlert2)

### Typography
- Page Title: `text-2xl font-bold`
- Body: `text-base`

### Spacing
- Section gap: `space-8`
- Component gap: `space-4`

---

## Responsive Behavior

| Element | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| [Element] | [Behavior] | [Behavior] | [Behavior] |

---

## Related Documents

### Source Documents

| Type | Document | Section/Link |
|------|----------|--------------|
| System Design | [path] | [section] |
| API Spec | [path] | [endpoint] |
| Requirements | [path] | [requirement-id] |

### Related Mockups

| Relation | Page | ID | Link |
|----------|------|----|------|
| CRUD: List | [Entity] List | [NNN] | [[NNN]-[entity]-list.mockup.md] |
| CRUD: Form | [Entity] Form | [NNN] | [[NNN]-[entity]-form.mockup.md] |
| CRUD: Detail | [Entity] Detail | [NNN] | [[NNN]-[entity]-detail.mockup.md] |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | [DATE] | Claude | Initial mockup |
```

### Step 5: เลือก Layout Pattern ที่เหมาะสม

**ตาม Page Type:**

| Page Type | Layout Pattern |
|-----------|----------------|
| Login/Register | Centered card |
| Dashboard | Sidebar + Main + Cards |
| List/Table | Header + Filters + Table (Action column first) + Pagination |
| Form | Centered card with sections |
| Detail View | Header + Content sections |
| Settings | Tabs + Form sections |

### Step 6: สร้าง ASCII Wireframe

**ใช้ symbols มาตรฐาน:**

```
┌─┬─┐  Box corners
├─┼─┤  Box intersections
└─┴─┘  Box bottom
│ ─    Lines
▼ ▸ ▾ ▹  Arrows/Dropdowns
☐ ☑    Checkboxes
○ ●    Radio buttons
[xxx]  Buttons
👁 ✏️ 🗑  Action icons (View, Edit, Delete)
⚠️ ✅ ❌  Alert icons (Warning, Success, Error)
```

### Step 7: ระบุ Components และ Interactions

**ต้องมี:**
1. Component ที่ใช้และ location
2. States ของแต่ละ component
3. User interactions (click, submit, etc.)
4. Validation rules (ถ้าเป็น form)
5. SweetAlert2 configurations (for delete, success, error)

**สำหรับ List pages:**
- Action column อยู่ด้านหน้า (first/leftmost)
- Action icons: 👁 View, ✏️ Edit, 🗑 Delete
- Delete ใช้ SweetAlert2 confirmation

### Step 8: กำหนด Responsive Behavior

**ระบุสำหรับ:**
- Desktop (>= 1024px)
- Tablet (768px - 1023px)
- Mobile (< 768px)

**Modal behavior on mobile:**
- Center modal → Full screen modal

## Output

**แจ้ง user:**
1. ไฟล์ที่สร้าง (.mockups/[NNN]-[page-name].mockup.md)
2. แสดง wireframe preview
3. แสดง CRUD info (ถ้ามี)
4. แนะนำ commands ที่เกี่ยวข้อง

---

## Example Output

### Complex Entity (Page Pattern)

```
✅ สร้าง Mockup สำเร็จ!

📁 File: .mockups/004-user-list.mockup.md

📊 CRUD Info:
   Entity: User (complex)
   UI Pattern: page
   Related pages: 005-user-form, 006-user-detail

📐 Preview:
┌─────────────────────────────────────────────────────────────────────────────┐
│  User List                                                  [+ Add New]     │
├─────────────────────────────────────────────────────────────────────────────┤
│  Search: [________________________]  Filter: [All ▼]  [Export] [Refresh]   │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌────────┬─────┬────────────────────┬─────────────────┬──────────┬────────┐ │
│ │ Action │ ID  │ Name               │ Email           │ Status   │ Date   │ │
│ ├────────┼─────┼────────────────────┼─────────────────┼──────────┼────────┤ │
│ │ 👁 ✏️ 🗑 │ 001 │ John Doe           │ john@email.com  │ Active   │ 01 Jan │ │
│ │ 👁 ✏️ 🗑 │ 002 │ Jane Smith         │ jane@email.com  │ Active   │ 02 Jan │ │
│ └────────┴─────┴────────────────────┴─────────────────┴──────────┴────────┘ │
│                                                                             │
│  Showing 1-10 of 50 records                    [<] [1] [2] [3] [4] [5] [>]  │
└─────────────────────────────────────────────────────────────────────────────┘

📋 Components: 8 (Navbar, Sidebar, SearchBar, Table, Pagination, ActionButtons)
🔗 Interactions:
   • 👁 View → Navigate to detail page
   • ✏️ Edit → Navigate to edit page
   • 🗑 Delete → SweetAlert2 confirmation
   • + Add New → Navigate to create page

💡 Next steps:
   • /edit-mockup 004-user-list - [changes]  → แก้ไข mockup
   • /create-mockup user-form               → สร้าง form page
   • /frontend-design 004-user-list         → Generate HTML/CSS
```

### Simple Entity (Modal Pattern)

```
✅ สร้าง Mockup สำเร็จ!

📁 File: .mockups/010-department-list.mockup.md

📊 CRUD Info:
   Entity: Department (simple)
   UI Pattern: modal
   CRUD actions: View/Create/Edit via Modal, Delete via SweetAlert2

📐 Preview:
┌─────────────────────────────────────────────────────────────────┐
│  Department List                              [+ Add New]       │
├─────────────────────────────────────────────────────────────────┤
│ ┌────────┬───────────────────────┬────────────┬───────────────┐ │
│ │ Action │ Department Name       │ Code       │ Status        │ │
│ ├────────┼───────────────────────┼────────────┼───────────────┤ │
│ │ 👁 ✏️ 🗑 │ Human Resources       │ HR         │ Active        │ │
│ │ 👁 ✏️ 🗑 │ Information Technology│ IT         │ Active        │ │
│ └────────┴───────────────────────┴────────────┴───────────────┘ │
└─────────────────────────────────────────────────────────────────┘

📋 Components: 6 (Table, Modal, Form, SweetAlert2)
🔗 Interactions:
   • 👁 View → Open View Modal
   • ✏️ Edit → Open Edit Modal
   • 🗑 Delete → SweetAlert2 confirmation
   • + Add New → Open Create Modal

💡 Next steps:
   • /edit-mockup 010-department-list - [changes]  → แก้ไข mockup
   • /frontend-design 010-department-list          → Generate HTML/CSS
```

---

## Step 9: อัพเดท mockup_list.json (ถ้ามี)

**หลังสร้าง mockup เสร็จ ต้องอัพเดท mockup_list.json:**

```json
// ก่อน
{
  "id": "004",
  "name": "User List",
  "status": "pending",
  "mockup_file": null,
  "created_at": null
}

// หลัง
{
  "id": "004",
  "name": "User List",
  "status": "completed",
  "mockup_file": "004-user-list.mockup.md",
  "created_at": "2025-01-20T14:30:00Z",
  "notes": "Created with 8 components, action column first, SweetAlert2 for delete"
}
```

**อัพเดท summary:**
```json
{
  "summary": {
    "total": 10,
    "pending": 9,      // -1
    "in_progress": 0,
    "completed": 1,    // +1
    "approved": 0
  }
}
```

**ใช้ Edit tool อัพเดท:**
```bash
# อ่าน mockup_list.json
cat .mockups/mockup_list.json

# ใช้ Edit tool อัพเดท status ของ page ที่สร้างเสร็จ
```
