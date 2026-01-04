---
description: ดูรายการ UI Mockups ทั้งหมดในโปรเจค
allowed-tools: Bash(*), Read(*), Glob(*)
---

# List Mockups Command

แสดงรายการ UI Mockups ทั้งหมดที่มีในโปรเจค

## ขั้นตอนที่ต้องทำ

### Step 1: อ่าน mockup_list.json (ถ้ามี)

```bash
# ตรวจสอบ mockup_list.json
cat .mockups/mockup_list.json 2>/dev/null
```

**ถ้ามี mockup_list.json:** ใช้ข้อมูลจาก json เพื่อแสดงสถานะครบถ้วน

**ถ้าไม่มี mockup_list.json:** ค้นหาไฟล์โดยตรง

### Step 2: ค้นหา Mockup Files

```bash
# ค้นหาไฟล์ mockup ทั้งหมด (format ใหม่: [NNN]-[name].mockup.md)
ls -la .mockups/[0-9][0-9][0-9]-*.mockup.md 2>/dev/null
```

### Step 3: อ่าน Page Info จากแต่ละไฟล์

สำหรับแต่ละไฟล์ ให้อ่านข้อมูล:
- Page ID (NNN)
- Page Name
- URL
- CRUD Group
- Complexity
- UI Pattern
- Status
- Last Updated

### Step 4: แสดงผล

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
   • /create-mockup [page]               → สร้าง mockup ใหม่
   • /create-mockups-parallel --entity X → สร้าง CRUD pages
   • /edit-mockup [page] - [changes]     → แก้ไข mockup
   • cat .mockups/[NNN]-[page].mockup.md → ดูรายละเอียด
```

---

## ถ้าไม่มี Mockups

```
📁 UI Mockups in Project

⚠️ ยังไม่มี mockup ในโปรเจคนี้

💡 เริ่มต้นด้วย:
   • /create-mockup [page-name]
   • /create-mockup จาก system-design-doc

📚 ถ้ามี system-design-doc ให้ใช้:
   • /create-mockup จาก system-design.md

   จะอ่าน Sitemap และ Screen Specs แล้วสร้าง mockups ให้อัตโนมัติ
```

---

## Output with Details

ถ้าต้องการดูรายละเอียดเพิ่มเติม:

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
