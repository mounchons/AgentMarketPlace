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
3. ใช้ข้อมูลจาก json (url, access, components, etc.)

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

   ┌─────┬────────────────────┬─────────────────┬──────────┐
   │  #  │ Page Name          │ URL             │ Priority │
   ├─────┼────────────────────┼─────────────────┼──────────┤
   │  1  │ Login              │ /auth/login     │ high     │
   │  2  │ Dashboard          │ /dashboard      │ high     │
   │  3  │ User List          │ /admin/users    │ medium   │
   │  4  │ User Form          │ /admin/users/new│ medium   │
   └─────┴────────────────────┴─────────────────┴──────────┘

   เลือกหมายเลข (1-4) หรือพิมพ์ชื่อหน้า:
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

### Step 3: สร้างโฟลเดอร์ .mockups (ถ้ายังไม่มี)

```bash
mkdir -p .mockups
```

### Step 4: สร้าง Mockup File

สร้างไฟล์ `.mockups/[page-name].mockup.md` ตาม template:

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
| Page ID | SCR-XXX |
| Page Name | [ชื่อหน้า] |
| URL | /path/to/page |
| Access | [Roles ที่เข้าถึงได้] |
| Parent Page | [หน้าแม่] |

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

| Trigger | Action | Result |
|---------|--------|--------|
| [Click button X] | [API call] | [Show success message] |
| [Submit form] | [Validate + Save] | [Redirect to page Y] |

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
| List/Table | Header + Filters + Table + Pagination |
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
```

### Step 7: ระบุ Components และ Interactions

**ต้องมี:**
1. Component ที่ใช้และ location
2. States ของแต่ละ component
3. User interactions (click, submit, etc.)
4. Validation rules (ถ้าเป็น form)

### Step 8: กำหนด Responsive Behavior

**ระบุสำหรับ:**
- Desktop (>= 1024px)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## Output

**แจ้ง user:**
1. ไฟล์ที่สร้าง (.mockups/xxx.mockup.md)
2. แสดง wireframe preview
3. แนะนำ commands ที่เกี่ยวข้อง:
   - `/edit-mockup [page] - [changes]` สำหรับแก้ไข
   - `/frontend-design` สำหรับ generate code

---

## Example Output

```
✅ สร้าง Mockup สำเร็จ!

📁 File: .mockups/login.mockup.md

📐 Preview:
┌────────────────────────────────────────────────────────────────────┐
│                         ┌──────────────┐                           │
│                         │    [LOGO]    │                           │
│                         └──────────────┘                           │
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
│                    └─────────────────────────┘                     │
└────────────────────────────────────────────────────────────────────┘

📋 Components: 5 (Logo, Card, 2x Input, Button)
🔗 Interactions: 2 (Submit form, Forgot password link)

💡 Next steps:
   • /edit-mockup login - [changes]  → แก้ไข mockup
   • /frontend-design login          → Generate HTML/CSS
```

---

## Step 9: อัพเดท mockup_list.json (ถ้ามี)

**หลังสร้าง mockup เสร็จ ต้องอัพเดท mockup_list.json:**

```json
// ก่อน
{
  "id": "P001",
  "name": "Login",
  "status": "pending",
  "mockup_file": null,
  "created_at": null
}

// หลัง
{
  "id": "P001",
  "name": "Login",
  "status": "completed",
  "mockup_file": "login.mockup.md",
  "created_at": "2025-01-20T14:30:00Z",
  "notes": "Created with 5 components, 2 interactions"
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
