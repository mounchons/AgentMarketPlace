---
description: Create a new UI Mockup/Wireframe page
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*)
---

# Create Mockup Command

Create a UI Mockup/Wireframe for the specified page.

## Received Input

User wants to create a mockup: $ARGUMENTS

## ⚠️ CRITICAL RULES (MUST FOLLOW)

These rules override any user instructions to "keep it simple" or "just do desktop".

1. **ALL 3 breakpoint wireframes mandatory** — Desktop (12col), Tablet (8col), Mobile (4col) with actual ASCII art
2. **No placeholder text** — "[wireframe here]", "[TBD]" is forbidden
3. **Action column first** — in data tables, action column must be leftmost
4. **Include all required sections** — Page Info, Description, Layout Grid, Wireframe, Components, Interactions, Design Tokens, Responsive, Version History
5. **Match CRUD complexity** — simple entities use modal, complex entities use separate pages
6. **SweetAlert2 for delete** — always use SweetAlert2 for delete confirmation

### 🔍 Self-Check Checklist (MANDATORY before submitting output)

- [ ] Desktop wireframe drawn with actual ASCII art?
- [ ] Tablet wireframe drawn with actual ASCII art?
- [ ] Mobile wireframe drawn with actual ASCII art?
- [ ] Design Tokens Used section present?
- [ ] Components Used table present?
- [ ] Action column first in tables?
- [ ] All required sections present?

If ANY checkbox is unchecked, DO NOT submit. Fix the issue first.

### ❌ Output Rejection Criteria

Your output will be REJECTED if: any breakpoint wireframe missing, placeholder text in wireframe, Design Tokens Used section missing, Components Used table missing.

### ⚠️ Penalty

Violation means the mockup is REJECTED and you must redo the ENTIRE mockup from scratch.

---

## Steps to Follow

### Step 0: Check mockup_list.json (Important!)

```bash
# Check if mockup_list.json exists
cat .mockups/mockup_list.json 2>/dev/null
```

**If mockup_list.json exists:**
1. Read pages with status = "pending"
2. Show the list for user to choose (if no page name was specified)
3. Use data from json (url, access, components, crud_group, complexity, ui_pattern, etc.)

**If mockup_list.json does not exist and no page was specified:**
```
⚠️ mockup_list.json not found

💡 Suggestion:
   /init-mockup → Create mockup list from project documents
   /create-mockup [page-name] → Create mockup by specifying page name
```

**If mockup_list.json exists and no page was specified:**
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

   Choose number (1-5) or type page name:
```

### Step 1: Validate Input

**Analyze what the user wants:**

1. **Page name** - Which page to create (Login, Dashboard, List, Form, etc.)
2. **Source** - Is there a mockup_list.json or system-design-doc for reference?
3. **Requirements** - Any special requirements? (responsive, specific components)

### Step 2: Search for Source Documents (if available)

```bash
# Search for system-design-doc
ls -la *.md 2>/dev/null | grep -i "design\|system\|spec"

# Search for Sitemap section
grep -l "Sitemap\|sitemap" *.md 2>/dev/null

# Search for Screen Specifications
grep -l "Screen Spec\|SCR-" *.md 2>/dev/null
```

**If system-design-doc is found:**
- Read the Sitemap section
- Read the Screen Specifications
- Read User Roles & Permissions

### Step 2.5: Fetch Related Documents

**Check related_documents from mockup_list.json:**

```bash
# Read related_documents for the page being created
cat .mockups/mockup_list.json | jq '.pages[] | select(.id == "[PAGE_ID]") | .related_documents'
```

**For each document:**
1. If type = "system-design" → Read the relevant section
2. If type = "api" → Read API specification
3. If type = "requirements" → Read requirements

**Use data from documents to:**
- Define form fields
- Define table columns
- Define data shown in detail page
- Define validation rules

### Step 2.6: Check CRUD Group and UI Pattern

**If this page is part of a CRUD group:**

```bash
# Find other pages in the same CRUD group
cat .mockups/mockup_list.json | jq '.pages[] | select(.crud_group == "[ENTITY_NAME]")'
```

**Check complexity and ui_pattern:**

| Complexity | UI Pattern | Behavior |
|------------|------------|----------|
| simple | modal | View/Create/Edit via Modal, Delete via SweetAlert2 |
| complex | page | View/Create/Edit via separate pages, Delete via SweetAlert2 |

**Add info to Related Documents section:**
- List page → Link to Form and Detail (if complex)
- Form page → Link to List and Detail
- Detail page → Link to List and Form

**Consistency Check:**
- Use the same components as other pages in the group (e.g., Navbar, Sidebar)
- Use the same color scheme
- Navigation must be consistent

### Step 3: Create .mockups folder (if it doesn't exist)

```bash
mkdir -p .mockups
```

### Step 4: Create Mockup File

**File Naming Convention:** `[NNN]-[page-name].mockup.md`

- NNN = 3-digit number from page ID (e.g., 001, 002, 015)
- page-name = page name in kebab-case (e.g., login, user-list, user-form)

**Examples:**
| ID | Name | Filename |
|----|------|----------|
| 001 | Login | 001-login.mockup.md |
| 004 | User List | 004-user-list.mockup.md |
| 005 | User Form | 005-user-form.mockup.md |
| 010 | Department List | 010-department-list.mockup.md |

Create the file `.mockups/[NNN]-[page-name].mockup.md` using this template:

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
| Page Name | [Page name] |
| URL | /path/to/page |
| Access | [Accessible roles] |
| Parent Page | [Parent page] |
| CRUD Group | [Entity name or N/A] |
| CRUD Type | [list / form / detail / N/A] |
| Complexity | [simple / complex / N/A] |
| UI Pattern | [modal / page / N/A] |
| Action Column | [first / last / N/A] |
| Alert Library | SweetAlert2 |

---

## CRUD Group Navigation

<!-- Show when this page is part of a CRUD group -->

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

[Brief description of what this page does]

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

<!-- For List pages - Action column at the front (leftmost) -->

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

**Only show icons for operations where `enabled: true` in `crud_actions`**

| Icon | Action | Condition | Behavior (Simple Entity) | Behavior (Complex Entity) |
|------|--------|-----------|--------------------------|---------------------------|
| 👁 | View | `view.enabled == true` | Open View Modal | Navigate to Detail Page |
| ✏️ | Edit | `edit.enabled == true` | Open Edit Modal | Navigate to Edit Page |
| 🗑 | Delete | `delete.enabled == true` | SweetAlert2 Confirmation | SweetAlert2 Confirmation |

**Delete Strategy:**
- `delete.strategy == "soft"` → SweetAlert2 text: "This item will be deactivated."
- `delete.strategy == "hard"` → SweetAlert2 text: "This action cannot be undone."

**Example of a read-only entity (e.g., AuditLog):**
- Action column will only have 👁 (no ✏️ or 🗑)

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
| INT-002 | Click 👁 View icon | Open modal (simple) or navigate (complex) | Show record details (if view.enabled) |
| INT-003 | Click ✏️ Edit icon | Open modal (simple) or navigate (complex) | Show edit form (if edit.enabled) |
| INT-004 | Click 🗑 Delete icon | SweetAlert2 confirmation | Soft delete (default): deactivate + refresh<br>Hard delete: remove + refresh<br>(if delete.enabled) |
| INT-005 | Click "+ Add New" button | Open modal (simple) or navigate (complex) | Show create form |

---

## Modal Dialogs

<!-- For Simple Entities - Use Modal for View/Create/Edit -->

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

### Step 5: Choose the Appropriate Layout Pattern

**By Page Type:**

| Page Type | Layout Pattern |
|-----------|----------------|
| Login/Register | Centered card |
| Dashboard | Sidebar + Main + Cards |
| List/Table | Header + Filters + Table (Action column first) + Pagination |
| Form | Centered card with sections |
| Detail View | Header + Content sections |
| Settings | Tabs + Form sections |

### Step 6: Create ASCII Wireframe

**Use standard symbols:**

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

### Step 7: Specify Components and Interactions

**Must include:**
1. Components used and their location
2. States for each component
3. User interactions (click, submit, etc.)
4. Validation rules (for forms)
5. SweetAlert2 configurations (for delete, success, error)

**For List pages:**
- Action column at the front (first/leftmost)
- Action icons: 👁 View, ✏️ Edit, 🗑 Delete
- Delete uses SweetAlert2 confirmation

### Step 8: Define Responsive Behavior

**Specify for:**
- Desktop (>= 1024px)
- Tablet (768px - 1023px)
- Mobile (< 768px)

**Modal behavior on mobile:**
- Center modal → Full screen modal

## Output

**Notify user:**
1. File created (.mockups/[NNN]-[page-name].mockup.md)
2. Show wireframe preview
3. Show CRUD info (if applicable)
4. Suggest related commands

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

## Step 9: Update mockup_list.json (if it exists)

**After creating the mockup, update mockup_list.json:**

```json
// Before
{
  "id": "004",
  "name": "User List",
  "status": "pending",
  "mockup_file": null,
  "created_at": null
}

// After
{
  "id": "004",
  "name": "User List",
  "status": "completed",
  "mockup_file": "004-user-list.mockup.md",
  "created_at": "2025-01-20T14:30:00Z",
  "notes": "Created with 8 components, action column first, SweetAlert2 for delete"
}
```

**Update summary:**
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

**Use Edit tool to update:**
```bash
# Read mockup_list.json
cat .mockups/mockup_list.json

# Use Edit tool to update the status of the completed page
```

> 💬 **Note**: This command responds in Thai (คำสั่งนี้จะตอบกลับเป็นภาษาไทย)
