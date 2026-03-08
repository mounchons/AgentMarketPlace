---
description: แก้ไข UI Mockup/Wireframe ที่มีอยู่
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*)
---

# Edit Mockup Command

แก้ไข UI Mockup/Wireframe ที่มีอยู่แล้ว

## Input ที่ได้รับ

User ต้องการแก้ไข: $ARGUMENTS

**รูปแบบ Input:**
```
/edit-mockup [page-name] - [changes]
```

**ตัวอย่าง:**
- `/edit-mockup login - เพิ่มปุ่ม Social Login`
- `/edit-mockup dashboard - ปรับเป็น 3 columns`
- `/edit-mockup user-list - เพิ่ม pagination และ filters`
- `/edit-mockup form - เปลี่ยน layout เป็น 2 columns`

## ขั้นตอนที่ต้องทำ

### Step 1: Parse Input

แยกส่วนของ input:
1. **Page Name** - ชื่อหน้าที่ต้องแก้ไข
2. **Changes** - สิ่งที่ต้องการเปลี่ยนแปลง

### Step 2: ค้นหา Mockup File

```bash
# ค้นหา mockup file (format ใหม่: [NNN]-[page-name].mockup.md)
ls .mockups/[0-9][0-9][0-9]-*.mockup.md 2>/dev/null

# หรือค้นหาด้วยชื่อ
ls .mockups/*[page-name]*.mockup.md 2>/dev/null

# หรือค้นหาจาก mockup_list.json
cat .mockups/mockup_list.json | jq '.pages[] | select(.name | contains("[page-name]"))'
```

**ถ้าไม่พบ mockup file:**
```
❌ ไม่พบ mockup สำหรับหน้า "[page-name]"

📁 Mockups ที่มีอยู่:
   • 001-login.mockup.md
   • 003-dashboard.mockup.md
   • 004-user-list.mockup.md

💡 ต้องการสร้างใหม่หรือไม่?
   → /create-mockup [page-name]
```

### Step 3: อ่าน Mockup ปัจจุบัน

```bash
cat .mockups/[NNN]-[page-name].mockup.md
```

**วิเคราะห์:**
- Layout ปัจจุบัน
- Components ที่มีอยู่
- Wireframe structure
- CRUD Group และ UI Pattern (ถ้ามี)
- Action column position (ถ้าเป็น List page)

### Step 4: วิเคราะห์ Change Request

**ประเภทการแก้ไข:**

| Type | Examples | Action |
|------|----------|--------|
| **Add Component** | "เพิ่มปุ่ม", "เพิ่ม filter" | เพิ่ม component ใน wireframe + component list |
| **Remove Component** | "ลบ sidebar", "เอา footer ออก" | ลบออกจาก wireframe + component list |
| **Change Layout** | "ปรับเป็น 3 columns", "เปลี่ยนเป็น tabs" | วาด wireframe ใหม่ |
| **Modify Component** | "เปลี่ยนปุ่มเป็นสีแดง", "ทำให้ input ใหญ่ขึ้น" | อัพเดท component specs |
| **Add Interaction** | "เพิ่ม modal เมื่อกด delete" | เพิ่มใน interactions section |
| **Change Responsive** | "ซ่อน sidebar บน mobile" | อัพเดท responsive behavior |
| **Move Component** | "ย้าย search ไปขวา", "สลับ column" | ปรับ wireframe |
| **Change to Modal** | "เปลี่ยนเป็น modal pattern" | อัพเดท UI pattern และเพิ่ม Modal sections |
| **Add SweetAlert2** | "เพิ่ม confirm dialog" | เพิ่ม SweetAlert2 section |

### Step 5: ดำเนินการแก้ไข

#### 5.1 สำหรับ Add Component

```markdown
## Before:
┌────────────────────────────────────┐
│   ┌─────────────────┐              │
│   │    [LOGIN]      │              │
│   └─────────────────┘              │
└────────────────────────────────────┘

## After (เพิ่ม Social Login):
┌────────────────────────────────────┐
│   ┌─────────────────┐              │
│   │    [LOGIN]      │              │
│   └─────────────────┘              │
│                                    │
│   ─────── OR ───────               │
│                                    │
│   [G] [f] [in]                     │
└────────────────────────────────────┘
```

**อัพเดท Components Used:**
```markdown
| Component | Location | Props/Variants | Notes |
|-----------|----------|----------------|-------|
| SocialLoginButtons | Below login button | providers: ['google', 'facebook', 'linkedin'] | New |
| Divider | Between login and social | text: "OR" | New |
```

#### 5.2 สำหรับ Change Layout

```markdown
## Before (2 columns):
┌──────────────────────────────────────────┐
│  ┌─────────────┐  ┌─────────────┐        │
│  │   Card 1    │  │   Card 2    │        │
│  └─────────────┘  └─────────────┘        │
└──────────────────────────────────────────┘

## After (3 columns):
┌──────────────────────────────────────────────────┐
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Card 1  │  │  Card 2  │  │  Card 3  │        │
│  └──────────┘  └──────────┘  └──────────┘        │
└──────────────────────────────────────────────────┘
```

**อัพเดท Layout Grid:**
```markdown
### Desktop (12 columns)
- Card 1: 4 columns
- Card 2: 4 columns
- Card 3: 4 columns
```

#### 5.3 สำหรับ Add Interaction

**เพิ่มใน Interactions section:**
```markdown
## Interactions

| Trigger | Action | Result |
|---------|--------|--------|
| Click delete button | Show confirmation modal | - |
| Confirm delete | API DELETE call | Remove row, show success toast |
| Cancel delete | Close modal | - |
```

**เพิ่ม Modal wireframe:**
```markdown
### Delete Confirmation Modal

```
┌────────────────────────────────────────────────────┐
│                                                    │
│      ┌────────────────────────────────────┐       │
│      │ Delete Item                   [×] │       │
│      ├────────────────────────────────────┤       │
│      │                                    │       │
│      │ Are you sure you want to delete    │       │
│      │ this item? This action cannot be   │       │
│      │ undone.                            │       │
│      │                                    │       │
│      ├────────────────────────────────────┤       │
│      │         [Cancel]  [Delete]        │       │
│      └────────────────────────────────────┘       │
│                                                    │
└────────────────────────────────────────────────────┘
```
```

### Step 6: อัพเดท Version History

```markdown
## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-15 | Claude | Initial mockup |
| 1.1.0 | 2025-01-20 | Claude | เพิ่ม Social Login buttons |
```

### Step 7: บันทึกไฟล์

ใช้ Edit tool เพื่ออัพเดทไฟล์ `.mockups/[page-name].mockup.md`

---

## Output Format

**Success:**
```
✅ แก้ไข Mockup สำเร็จ!

📁 File: .mockups/login.mockup.md
📝 Version: 1.0.0 → 1.1.0

📋 Changes:
   ✓ เพิ่ม Social Login buttons (Google, Facebook, LinkedIn)
   ✓ เพิ่ม Divider "OR"
   ✓ อัพเดท Components Used section
   ✓ อัพเดท Interactions section

📐 Updated Wireframe:
┌────────────────────────────────────────────────────────────────────┐
│                    ┌─────────────────────────┐                     │
│                    │      Welcome Back       │                     │
│                    │                         │                     │
│                    │   Email                 │                     │
│                    │   ┌─────────────────┐   │                     │
│                    │   │                 │   │                     │
│                    │   └─────────────────┘   │                     │
│                    │                         │                     │
│                    │   Password              │                     │
│                    │   ┌─────────────────┐   │                     │
│                    │   │ ●●●●●●●●    👁 │   │                     │
│                    │   └─────────────────┘   │                     │
│                    │                         │                     │
│                    │   ┌─────────────────┐   │                     │
│                    │   │    [LOGIN]      │   │                     │
│                    │   └─────────────────┘   │                     │
│                    │                         │                     │
│                    │   ─────── OR ───────    │  ← NEW              │
│                    │                         │                     │
│                    │   [G] [f] [in]          │  ← NEW              │
│                    │                         │                     │
│                    └─────────────────────────┘                     │
└────────────────────────────────────────────────────────────────────┘

💡 Next steps:
   • /edit-mockup login - [more changes]  → แก้ไขเพิ่มเติม
   • /frontend-design login               → Generate HTML/CSS
```

---

## Common Edit Patterns

### Pattern 1: เพิ่ม Pagination

```
Before: Simple list
After:
┌────────────────────────────────────────────────────────────────────┐
│  ... (existing content) ...                                        │
│                                                                    │
│  [◀ Prev]  [1] [2] [3] ... [10]  [Next ▶]    Showing 1-10 of 100 │
└────────────────────────────────────────────────────────────────────┘
```

### Pattern 2: เพิ่ม Search & Filters

```
Before: Table only
After:
┌────────────────────────────────────────────────────────────────────┐
│  Search: [________________________] [🔍]                           │
│                                                                    │
│  Filters: [Status ▼] [Date Range ▼] [Category ▼]  [Clear All]     │
│                                                                    │
│  ... (existing table) ...                                          │
└────────────────────────────────────────────────────────────────────┘
```

### Pattern 3: เพิ่ม Tabs

```
Before: Single content area
After:
┌────────────────────────────────────────────────────────────────────┐
│  ┌──────────┬──────────┬──────────┐                               │
│  │  Tab 1   │ [Tab 2]  │  Tab 3   │                               │
│  └──────────┴──────────┴──────────┘                               │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                                                            │   │
│  │  Tab 2 Content                                             │   │
│  │                                                            │   │
│  └────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘
```

### Pattern 4: เพิ่ม Sidebar

```
Before: Full width content
After:
┌────────────────────────────────────────────────────────────────────┐
│         │                                                          │
│   NAV   │                    MAIN CONTENT                          │
│  (3col) │                      (9col)                              │
│         │                                                          │
└────────────────────────────────────────────────────────────────────┘
```

### Pattern 5: เพิ่ม Modal (สำหรับ Simple Entity)

```
View/Create/Edit Modal:
┌────────────────────────────────────────────────────────────────────┐
│                          (overlay)                                 │
│      ┌────────────────────────────────────────────────────┐       │
│      │ Create/Edit [Entity]                          [×] │       │
│      ├────────────────────────────────────────────────────┤       │
│      │                                                    │       │
│      │  Name *                                            │       │
│      │  ┌─────────────────────────────────────────────┐  │       │
│      │  │                                             │  │       │
│      │  └─────────────────────────────────────────────┘  │       │
│      │                                                    │       │
│      ├────────────────────────────────────────────────────┤       │
│      │                      [Cancel]  [Save]             │       │
│      └────────────────────────────────────────────────────┘       │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Pattern 6: เพิ่ม SweetAlert2 Delete Confirmation

```
Trigger: Click 🗑 Delete button

SweetAlert2:
┌────────────────────────────────────────────────────────────────────┐
│                          (overlay)                                 │
│      ┌─────────────────────────────────────────────┐              │
│      │                                             │              │
│      │                    ⚠️                        │              │
│      │                                             │              │
│      │             Are you sure?                   │              │
│      │                                             │              │
│      │   This item will be deactivated.             │              │
│      │                                             │              │
│      │        [Cancel]  [Yes, deactivate it!]      │              │
│      │                                             │              │
│      └─────────────────────────────────────────────┘              │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

Config:
Swal.fire({
  icon: 'warning',
  title: 'Are you sure?',
  text: "This item will be deactivated.",
  showCancelButton: true,
  confirmButtonColor: '#d33',
  confirmButtonText: 'Yes, deactivate it!'
  // Note: For hard delete, use text: "This action cannot be undone." and confirmButtonText: "Yes, delete it!"
})
```

### Pattern 7: ย้าย Action Column ไปด้านหน้า

```
Before (Action column ด้านหลัง):
┌──────────┬──────────┬──────────┬──────────┐
│ Column 1 │ Column 2 │ Column 3 │ Actions  │
└──────────┴──────────┴──────────┴──────────┘

After (Action column ด้านหน้า):
┌────────┬──────────┬──────────┬──────────┐
│ Action │ Column 1 │ Column 2 │ Column 3 │
├────────┼──────────┼──────────┼──────────┤
│ 👁 ✏️ 🗑 │ Data     │ Data     │ Data     │
└────────┴──────────┴──────────┴──────────┘
```

---

## Error Handling

**Mockup not found:**
```
❌ ไม่พบ mockup สำหรับหน้า "xxx"

📁 Mockups ที่มีอยู่:
   • login.mockup.md
   • dashboard.mockup.md
   • user-list.mockup.md

💡 ต้องการ:
   • สร้างใหม่? → /create-mockup xxx
   • ดูรายการทั้งหมด? → /list-mockups
```

**Unclear change request:**
```
⚠️ ไม่แน่ใจว่าต้องการแก้ไขอะไร

📝 ช่วยระบุเพิ่มเติม:
   1. ต้องการเพิ่ม/ลบ/แก้ไข component อะไร?
   2. ต้องการเปลี่ยน layout อย่างไร?
   3. ต้องการเพิ่ม interaction อะไร?

💡 ตัวอย่าง:
   • /edit-mockup login - เพิ่มปุ่ม Google Login
   • /edit-mockup dashboard - ปรับเป็น 3 columns
   • /edit-mockup form - เพิ่ม validation messages
```
