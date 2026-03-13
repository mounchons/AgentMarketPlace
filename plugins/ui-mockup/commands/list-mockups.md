---
description: View all UI Mockups in the project
allowed-tools: Bash(*), Read(*), Glob(*)
---

# List Mockups Command

Display all UI Mockups available in the project.

## Steps to Follow

### Step 1: Read mockup_list.json (if available)

```bash
# Check mockup_list.json
cat .mockups/mockup_list.json 2>/dev/null
```

**If mockup_list.json exists:** Use data from json to show complete status.

**If mockup_list.json does not exist:** Search for files directly.

### Step 2: Find Mockup Files

```bash
# Find all mockup files (new format: [NNN]-[name].mockup.md)
ls -la .mockups/[0-9][0-9][0-9]-*.mockup.md 2>/dev/null
```

### Step 3: Read Page Info from Each File

For each file, read the following data:
- Page ID (NNN)
- Page Name
- URL
- CRUD Group
- Complexity
- UI Pattern
- Status
- Last Updated

### Step 4: Display Results

**Format:**

```
📁 UI Mockups in Project

┌───────────────────────────────────────────────────────────────────────────────────────────┐
│ ID  │ Page Name       │ URL              │ CRUD Group   │ UI Pattern │ Status   │ Docs   │
├───────────────────────────────────────────────────────────────────────────────────────────┤
│ 001 │ Login           │ /auth/login      │ -            │ -          │ Approved │ 3      │
│ 002 │ Dashboard       │ /dashboard       │ -            │ -          │ Draft    │ 2      │
│ 004 │ User List       │ /admin/users     │ User (list)  │ page       │ Review   │ 4      │
│ 005 │ User Form       │ /admin/users/new │ User (form)  │ page       │ Draft    │ 3      │
│ 006 │ User Detail     │ /admin/users/:id │ User (detail)│ page       │ Pending  │ 2      │
│ 010 │ Department List │ /admin/depts     │ Department   │ modal      │ Draft    │ 1      │
└───────────────────────────────────────────────────────────────────────────────────────────┘

📊 Summary:
   • Total: 6 mockups
   • Approved: 1
   • In Review: 1
   • Draft: 3
   • Pending: 1

📋 CRUD Entities:
   • User (complex) - 3 pages: list ✅, form ✅, detail ⏳
   • Department (simple) - 1 page: list ✅ (modal pattern)

💡 Commands:
   • /create-mockup [page]               → Create new mockup
   • /create-mockups-parallel --entity X → Create CRUD pages
   • /edit-mockup [page] - [changes]     → Edit mockup
   • cat .mockups/[NNN]-[page].mockup.md → View details
```

---

## If No Mockups Exist

```
📁 UI Mockups in Project

⚠️ No mockups exist in this project yet

💡 Get started with:
   • /create-mockup [page-name]
   • /create-mockup from system-design-doc

📚 If you have a system-design-doc, use:
   • /create-mockup from system-design.md

   This will read Sitemap and Screen Specs and create mockups automatically
```

---

## Output with Details

For viewing additional details:

```
📁 UI Mockups - Detailed View

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 001-login.mockup.md
   • Page ID: 001
   • Page: Login
   • URL: /auth/login
   • Status: ✅ Approved
   • CRUD Group: -
   • UI Pattern: -
   • Components: 8 (Logo, Card, 2x Input, 2x Button, Divider, SocialLogin)
   • Interactions: 3
   • Related Docs: 3
   • Last Updated: 2025-01-15 by Claude

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 004-user-list.mockup.md
   • Page ID: 004
   • Page: User List
   • URL: /admin/users
   • Status: 📝 Draft
   • CRUD Group: User (list)
   • UI Pattern: page (complex)
   • Components: 8 (Navbar, Sidebar, SearchBar, Table, Pagination, ActionButtons)
   • Interactions: 5 (View→page, Edit→page, Delete→SweetAlert2, Add→page, Filter)
   • Action Column: first
   • Related Docs: 4
   • Related Pages: 005-user-form, 006-user-detail
   • Last Updated: 2025-01-14 by Claude

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 010-department-list.mockup.md
   • Page ID: 010
   • Page: Department List
   • URL: /admin/departments
   • Status: 📝 Draft
   • CRUD Group: Department (list)
   • UI Pattern: modal (simple)
   • Components: 6 (Table, Modal, Form, SweetAlert2)
   • Interactions: 4 (View→modal, Edit→modal, Delete→SweetAlert2, Add→modal)
   • Action Column: first
   • Related Docs: 1
   • Last Updated: 2025-01-14 by Claude

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

> 💬 **Note**: This command responds in Thai (คำสั่งนี้จะตอบกลับเป็นภาษาไทย)
