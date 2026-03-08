# UI Mockup Plugin

> **Version 1.6.0** - เพิ่ม Cross-Plugin Integration กับ system-design-doc และ long-running

สร้างและแก้ไข UI Mockup/Wireframe จาก System Design Document รองรับ ASCII wireframes, component specifications และ design tokens

## Overview

Plugin สำหรับสร้าง UI Mockup/Wireframe โดยใช้ ASCII art และ structured specifications ออกแบบมาเพื่อเป็น bridge ระหว่าง `system-design-doc` และ `frontend-design`

### 🆕 New in v1.6.0

- **Cross-Plugin Integration** - เชื่อมต่อกับ system-design-doc และ long-running
- **Design Doc References** - `design_doc_section`, `design_doc_api_refs` ใน pages
- **Entity Mapping** - `design_doc_entity_ref` ใน entities
- **Sync Status Tracking** - `sync_status` สำหรับ track การ sync
- **Integration Section** - `integration.design_doc_path` ชี้ไปยัง design_doc_list.json
- **Compatibility Metadata** - `metadata.compatible_with` ระบุ version ที่ต้องการ

### v1.5.0 Features

- **Feature Integration** - เชื่อมต่อกับ long-running features
- **Reverse Links** - `implemented_by_features[]` ใน mockup_list.json
- **Version Sync** - `mockup_version` และ `feature_status` tracking
- **Auto-generation** - รองรับ `/generate-features-from-mockups`

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│ system-design   │      │   ui-mockup     │      │ frontend-       │
│    -doc         │  →   │    (THIS)       │  →   │   design        │
│                 │      │                 │      │                 │
│  • Sitemap      │      │  • Wireframes   │      │  • HTML/CSS     │
│  • Screen Specs │      │  • Components   │      │  • React/Vue    │
│  • User Flows   │      │  • Tokens       │      │  • Production   │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

### Features

- **ASCII Wireframes** - สร้าง wireframe ด้วย ASCII art
- **Component Specifications** - ระบุ components และ props
- **Design Tokens** - Colors, typography, spacing
- **Responsive Design** - Desktop, Tablet, Mobile specs
- **Mockup Tracking** - ติดตามสถานะการสร้าง mockup ทุกหน้า
- **Parallel Creation** - สร้างหลาย mockups พร้อมกัน

---

## Quick Start

### Commands

| Command | Description |
|---------|-------------|
| `/init-mockup` | Initialize และสร้าง mockup_list.json |
| `/create-mockup [page]` | สร้าง mockup หน้าใหม่ |
| `/create-mockups-parallel` | สร้างหลาย mockups พร้อมกัน |
| `/edit-mockup [page] - [changes]` | แก้ไข mockup ที่มีอยู่ |
| `/list-mockups` | ดูรายการ mockups ทั้งหมด |

### Basic Usage

```bash
# Step 1: Initialize mockup environment
/init-mockup

# Step 2: Create mockups
/create-mockup Login
/create-mockup Dashboard

# Step 3: Edit mockups
/edit-mockup login - เพิ่มปุ่ม Social Login
```

---

## Workflow

### Complete Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         UI MOCKUP WORKFLOW                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Step 1: /init-mockup                                                        │
│       │   └── วิเคราะห์เอกสาร → สร้าง mockup_list.json                       │
│       ↓                                                                      │
│  Step 2: /create-mockup หรือ /create-mockups-parallel                       │
│       │   └── สร้าง ASCII wireframes + component specs                      │
│       ↓                                                                      │
│  Step 3: /edit-mockup (ถ้าต้องการแก้ไข)                                      │
│       │   └── ปรับปรุง layout, เพิ่ม components                              │
│       ↓                                                                      │
│  Step 4: /frontend-design (skill อื่น)                                       │
│          └── Generate HTML/CSS/React จาก mockup                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Examples

### Example 1: Initialize Mockup Environment

```bash
/init-mockup
```

**Output:**
```
✅ Initialize Mockup Environment สำเร็จ!

📁 Files created:
   • .mockups/mockup_list.json
   • .mockups/_design-tokens.json

📊 Summary:
   • Total pages: 12
   • Categories: 5 (auth, main, list, form, admin)
   • Priority: 3 high, 6 medium, 3 low

📋 Pages found:
   ┌─────┬────────────────────┬─────────────────┬──────────┬──────────┐
   │ ID  │ Page Name          │ URL             │ Priority │ Status   │
   ├─────┼────────────────────┼─────────────────┼──────────┼──────────┤
   │ P01 │ Login              │ /auth/login     │ high     │ pending  │
   │ P02 │ Register           │ /auth/register  │ high     │ pending  │
   │ P03 │ Dashboard          │ /dashboard      │ high     │ pending  │
   │ P04 │ User List          │ /admin/users    │ medium   │ pending  │
   │ P05 │ User Form          │ /admin/users/new│ medium   │ pending  │
   └─────┴────────────────────┴─────────────────┴──────────┴──────────┘

💡 Next steps:
   • /create-mockup                    → สร้าง mockup ทีละหน้า
   • /create-mockups-parallel          → สร้างหลายหน้าพร้อมกัน
   • /create-mockups-parallel --all    → สร้างทุกหน้าที่ pending
```

---

### Example 2: Create Login Mockup

```bash
/create-mockup Login
```

**Output:**
```
✅ สร้าง Mockup สำเร็จ!

📁 File: .mockups/login.mockup.md

📐 Preview:
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│                         ┌──────────────┐                           │
│                         │    [LOGO]    │                           │
│                         └──────────────┘                           │
│                                                                    │
│                    ┌─────────────────────────┐                     │
│                    │                         │                     │
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
│                    │   [Forgot Password?]    │                     │
│                    │                         │                     │
│                    │   ┌─────────────────┐   │                     │
│                    │   │    [LOGIN]      │   │                     │
│                    │   └─────────────────┘   │                     │
│                    │                         │                     │
│                    │   Don't have account?   │                     │
│                    │   [Sign up here]        │                     │
│                    │                         │                     │
│                    └─────────────────────────┘                     │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

📋 Components: 5 (Logo, Card, 2x Input, Button)
🔗 Interactions: 3 (Submit form, Forgot password, Sign up link)

💡 Next steps:
   • /edit-mockup login - [changes]  → แก้ไข mockup
   • /frontend-design login          → Generate HTML/CSS
```

---

### Example 3: Create Dashboard Mockup

```bash
/create-mockup Dashboard พร้อม sidebar และ charts
```

**Output:**
```
✅ สร้าง Mockup สำเร็จ!

📁 File: .mockups/dashboard.mockup.md

📐 Preview:
┌────────────────────────────────────────────────────────────────────┐
│  [Logo]              Search [________]           [User ▼] [🔔]    │
├────────┬───────────────────────────────────────────────────────────┤
│        │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│  Menu  │  │ Revenue │ │  Users  │ │ Orders  │ │  Sales  │         │
│        │  │ $12,345 │ │  1,234  │ │   567   │ │   89%   │         │
│  ────  │  │  ↑12%   │ │  ↑5%    │ │  ↓2%    │ │  ↑8%    │         │
│  Home  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘         │
│ Users  │                                                           │
│ Orders │  ┌─────────────────────────────────────────────────────┐  │
│Reports │  │                                                     │  │
│  ────  │  │                     CHART                           │  │
│Settings│  │            (Line/Bar/Pie Chart)                     │  │
│        │  │                                                     │  │
│        │  └─────────────────────────────────────────────────────┘  │
│        │                                                           │
│        │  ┌─────────────────────────────────────────────────────┐  │
│        │  │  Recent Orders                         [View All]  │  │
│        │  ├─────────────────────────────────────────────────────┤  │
│        │  │  #001  │ John Doe  │ $123.00  │ Pending     │ [→]  │  │
│        │  │  #002  │ Jane Doe  │ $456.00  │ Completed   │ [→]  │  │
│        │  │  #003  │ Bob Smith │ $789.00  │ Processing  │ [→]  │  │
│        │  └─────────────────────────────────────────────────────┘  │
└────────┴───────────────────────────────────────────────────────────┘

📋 Components: 12 (Navbar, Sidebar, 4x StatCards, Chart, Table)
🔗 Interactions: 5 (Menu navigation, View all, Row click, etc.)
```

---

### Example 4: Create List Page with Table

```bash
/create-mockup User List
```

**Output:**
```
✅ สร้าง Mockup สำเร็จ!

📐 Preview:
┌────────────────────────────────────────────────────────────────────┐
│  [Page Title: User Management]           [+ Add User] [Export ▼]  │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Search: [________________________] [🔍]    Showing 1-10 of 100   │
│                                                                    │
│  Filters: [Status ▼] [Role ▼] [Date ▼]              [Clear All]  │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ ☐ │ Name         │ Email           │ Role    │ Status │ Act│   │
│  ├────────────────────────────────────────────────────────────┤   │
│  │ ☐ │ John Doe     │ john@email.com  │ Admin   │ ● Active│✏️🗑️│   │
│  │ ☐ │ Jane Smith   │ jane@email.com  │ User    │ ● Active│✏️🗑️│   │
│  │ ☐ │ Bob Wilson   │ bob@email.com   │ User    │ ○ Inact │✏️🗑️│   │
│  │ ☐ │ Alice Brown  │ alice@email.com │ Manager │ ● Active│✏️🗑️│   │
│  │ ☐ │ Charlie Lee  │ charlie@em.com  │ User    │ ◐ Pend  │✏️🗑️│   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  [◀ Prev]  [1] [2] [3] ... [10]  [Next ▶]                        │
│                                                                    │
│  With selected: [Delete] [Export] [Change Status ▼]               │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

📋 Components: 8 (Header, Search, Filters, Table, Pagination, Actions)
```

---

### Example 5: Create Form Page

```bash
/create-mockup User Form - สร้างฟอร์มสำหรับเพิ่ม/แก้ไข user
```

**Output:**
```
✅ สร้าง Mockup สำเร็จ!

📐 Preview:
┌────────────────────────────────────────────────────────────────────┐
│  ← Back to List                                                    │
│                                                                    │
│                         Create New User                            │
│                    Fill in the user details                        │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│   ┌────────────────────────────────────────────────────────────┐   │
│   │                      Basic Information                     │   │
│   │                                                            │   │
│   │   First Name *              Last Name *                    │   │
│   │   ┌──────────────────┐     ┌──────────────────┐           │   │
│   │   │                  │     │                  │           │   │
│   │   └──────────────────┘     └──────────────────┘           │   │
│   │                                                            │   │
│   │   Email *                                                  │   │
│   │   ┌────────────────────────────────────────────────────┐   │   │
│   │   │                                                    │   │   │
│   │   └────────────────────────────────────────────────────┘   │   │
│   │   [Helper: Enter a valid email address]                    │   │
│   │                                                            │   │
│   │   Phone                      Role *                        │   │
│   │   ┌──────────────────┐     ┌──────────────────┐           │   │
│   │   │                  │     │ Select role    ▼ │           │   │
│   │   └──────────────────┘     └──────────────────┘           │   │
│   │                                                            │   │
│   │   ☐ Send welcome email                                     │   │
│   │   ☐ Require password change on first login                 │   │
│   │                                                            │   │
│   └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│   ┌────────────────────┐  ┌────────────────────────────────────┐   │
│   │     [Cancel]       │  │         [Create User]              │   │
│   └────────────────────┘  └────────────────────────────────────┘   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

### Example 6: Edit Mockup - Add Social Login

```bash
/edit-mockup login - เพิ่มปุ่ม Social Login (Google, Facebook)
```

**Output:**
```
✅ แก้ไข Mockup สำเร็จ!

📁 File: .mockups/login.mockup.md
📝 Version: 1.0.0 → 1.1.0

📋 Changes:
   ✓ เพิ่ม Social Login buttons (Google, Facebook)
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
│                    │   [G Google  ] [f FB ]  │  ← NEW              │
│                    │                         │                     │
│                    └─────────────────────────┘                     │
└────────────────────────────────────────────────────────────────────┘

💡 Next steps:
   • /edit-mockup login - [more changes]  → แก้ไขเพิ่มเติม
   • /frontend-design login               → Generate HTML/CSS
```

---

### Example 7: Edit Mockup - Add Pagination & Filters

```bash
/edit-mockup user-list - เพิ่ม pagination และ search filters
```

**Output:**
```
✅ แก้ไข Mockup สำเร็จ!

📋 Changes:
   ✓ เพิ่ม Search bar
   ✓ เพิ่ม Filter dropdowns (Status, Role, Date)
   ✓ เพิ่ม Pagination controls
   ✓ เพิ่ม Bulk actions

📐 Updated Section:
┌────────────────────────────────────────────────────────────────────┐
│  Search: [________________________] [🔍]    Showing 1-10 of 100   │
│                                                                    │
│  Filters: [Status ▼] [Role ▼] [Date ▼]              [Clear All]  │
│                                                                    │
│  ... (existing table) ...                                          │
│                                                                    │
│  [◀ Prev]  [1] [2] [3] ... [10]  [Next ▶]                        │
│                                                                    │
│  With selected: [Delete] [Export] [Change Status ▼]               │
└────────────────────────────────────────────────────────────────────┘
```

---

### Example 8: Create Mockups in Parallel

```bash
/create-mockups-parallel --priority high
```

**Output:**
```
📋 Creating mockups for high priority pages (3 pages)...
   Spawning 3 sub-agents in parallel...

   ┌─────────────────────────────────────────────────────────────────┐
   │  Agent 1: Login           [████████████████████] ✅ Complete   │
   │  Agent 2: Register        [████████████████████] ✅ Complete   │
   │  Agent 3: Dashboard       [████████████████░░░░] ⏳ In Progress│
   └─────────────────────────────────────────────────────────────────┘

✅ สร้าง Mockups สำเร็จ!

📁 Files created:
   • .mockups/login.mockup.md
   • .mockups/register.mockup.md
   • .mockups/dashboard.mockup.md

📊 Updated Summary:
   • Total: 12
   • Pending: 9 (was 12)
   • Completed: 3 (was 0)
```

---

## Mockup File Structure

เมื่อสร้าง mockup จะได้ไฟล์ `.mockups/[page-name].mockup.md`:

```markdown
# [Page Name] - UI Mockup

**Version**: 1.0.0
**Created**: 2025-01-20
**Status**: Draft

---

## Page Info

| Property | Value |
|----------|-------|
| Page ID | SCR-001 |
| URL | /auth/login |
| Access | Public |

---

## Layout Grid

### Desktop (12 columns)
[Layout diagram]

### Mobile (4 columns)
[Layout diagram]

---

## Wireframe

### Desktop View
[ASCII wireframe]

### Mobile View
[ASCII wireframe]

---

## Components Used

| Component | Location | Props | Notes |
|-----------|----------|-------|-------|
| Button | Form | variant: primary | Submit |
| Input | Form | type: email | Required |

---

## Interactions

| Trigger | Action | Result |
|---------|--------|--------|
| Click Login | Validate + API | Redirect to Dashboard |

---

## Design Tokens Used

### Colors
- Primary: `primary-500`
- Background: `neutral-50`

### Typography
- Title: `text-2xl font-bold`

---

## Responsive Behavior

| Element | Desktop | Mobile |
|---------|---------|--------|
| Sidebar | Visible | Hidden |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-20 | Initial |
```

---

## Output Structure

```
project-root/
└── .mockups/
    ├── mockup_list.json          # Tracking file
    ├── _design-tokens.json       # Shared design tokens
    ├── login.mockup.md           # Login page mockup
    ├── register.mockup.md        # Register page mockup
    ├── dashboard.mockup.md       # Dashboard mockup
    ├── user-list.mockup.md       # User list mockup
    ├── user-form.mockup.md       # User form mockup
    └── ...
```

---

## mockup_list.json Schema

```json
{
  "project": "HR System",
  "description": "Human Resource Management System",
  "source_documents": ["system-design-hr.md"],
  "initialized_at": "2025-01-20T10:00:00Z",
  "last_updated": "2025-01-20T14:30:00Z",

  "pages": [
    {
      "id": "P001",
      "name": "Login",
      "name_th": "เข้าสู่ระบบ",
      "url": "/auth/login",
      "access": "Public",
      "category": "auth",
      "priority": "high",
      "description": "หน้า login สำหรับเข้าสู่ระบบ",
      "components": ["Input", "Button", "Card"],
      "status": "completed",
      "mockup_file": "login.mockup.md",
      "created_at": "2025-01-20T14:30:00Z",
      "notes": "Created with 5 components"
    }
  ],

  "categories": {
    "auth": "Authentication pages",
    "main": "Main application pages",
    "admin": "Admin pages"
  },

  "summary": {
    "total": 12,
    "pending": 9,
    "in_progress": 0,
    "completed": 3,
    "approved": 0
  }
}
```

---

## Component Library

### Form Components

```
Text Input:
┌────────────────────────────────────┐
│ Placeholder text                   │
└────────────────────────────────────┘

Password Input:
┌────────────────────────────────────┐
│ ●●●●●●●●                       👁 │
└────────────────────────────────────┘

Select/Dropdown:
┌────────────────────────────────────┐
│ Select option                    ▼ │
└────────────────────────────────────┘

Checkbox:  ☐ Unchecked  ☑ Checked
Radio:     ○ Unselected ● Selected
Toggle:    [○────] Off  [────●] On
```

### Button Components

```
Primary:   ┌──────────────────┐
           │  Primary Action  │
           └──────────────────┘

Secondary: ┌──────────────────┐
           │ Secondary Action │
           └──────────────────┘

Icon:      ┌────┐
           │ + │
           └────┘
```

### Navigation Components

```
Navbar:
┌────────────────────────────────────────────────────────────────────┐
│  [Logo]    Menu1   Menu2   Menu3           [Search] [User ▼]      │
└────────────────────────────────────────────────────────────────────┘

Sidebar:
┌──────────┐
│  [Logo]  │
├──────────┤
│ ▸ Menu 1 │
│ ▾ Menu 2 │
│   └ Sub1 │
│ ▸ Menu 3 │
├──────────┤
│ [Logout] │
└──────────┘

Tabs:
┌──────────┬──────────┬──────────┐
│  Tab 1   │ [Tab 2]  │  Tab 3   │
└──────────┴──────────┴──────────┘

Pagination:
[◀ Prev]  [1] [2] [3] ... [10]  [Next ▶]
```

### Feedback Components

```
Alert - Success:
┌────────────────────────────────────────────────────────────────────┐
│ ✓  Success! Your changes have been saved.                    [×] │
└────────────────────────────────────────────────────────────────────┘

Modal:
┌────────────────────────────────────────────────────────────────────┐
│      ┌────────────────────────────────────────────────────┐       │
│      │ Modal Title                                   [×] │       │
│      ├────────────────────────────────────────────────────┤       │
│      │ Modal content...                                   │       │
│      ├────────────────────────────────────────────────────┤       │
│      │                      [Cancel]  [Confirm]          │       │
│      └────────────────────────────────────────────────────┘       │
└────────────────────────────────────────────────────────────────────┘
```

---

## Design Tokens

```yaml
colors:
  primary:
    500: "#0ea5e9"   # Main
    600: "#0284c7"   # Hover
  success: "#22c55e"
  warning: "#f59e0b"
  error: "#ef4444"
  neutral:
    50: "#fafafa"    # Background
    900: "#171717"   # Text

typography:
  fontFamily: "'Inter', sans-serif"
  fontSize:
    sm: "14px"
    base: "16px"
    lg: "18px"
    2xl: "24px"

spacing:
  2: "8px"
  4: "16px"
  6: "24px"
  8: "32px"

borderRadius:
  sm: "4px"
  md: "8px"
  lg: "12px"
```

---

## Responsive Breakpoints

```yaml
breakpoints:
  sm: "640px"    # Mobile landscape
  md: "768px"    # Tablet
  lg: "1024px"   # Desktop
  xl: "1280px"   # Large desktop

layouts:
  mobile:
    columns: 4
    gutter: "16px"
  tablet:
    columns: 8
    gutter: "24px"
  desktop:
    columns: 12
    gutter: "24px"
    maxWidth: "1280px"
```

---

## Best Practices

### 1. ก่อนใช้งาน
- ใช้ `/system-design-doc` สร้างเอกสารก่อน
- รัน `/init-mockup` เพื่อสร้าง mockup_list.json

### 2. การสร้าง Mockup
- เริ่มจาก high priority pages ก่อน (Login, Dashboard)
- ใช้ `/create-mockups-parallel` สำหรับหลายหน้า
- ใช้ layout patterns ที่เหมาะกับ page type

### 3. การแก้ไข
- ระบุการเปลี่ยนแปลงให้ชัดเจน
- อัพเดท version history เสมอ

### 4. หลังสร้างเสร็จ
- Review mockups ก่อน approve
- ใช้ `/frontend-design` generate code

---

## Workflow Integration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMPLETE WORKFLOW                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Step 0: Plan Mode                                                           │
│       ↓                                                                      │
│  Step 1: /init-project                                                       │
│       ↓                                                                      │
│  Step 2: /system-design-doc                                                  │
│       ↓                                                                      │
│  Step 3: /init-mockup → /create-mockup  ◄── คุณอยู่ที่นี่                    │
│       ↓                                                                      │
│  Step 4: /init                                                         │
│       ↓                                                                      │
│  Step 5: /continue (Development)                                             │
│       ↓                                                                      │
│  Step 6: /test, /ui-test                                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Plugin Structure

```
plugins/ui-mockup/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   ├── init-mockup.md
│   ├── create-mockup.md
│   ├── create-mockups-parallel.md
│   ├── edit-mockup.md
│   └── list-mockups.md
├── skills/
│   └── ui-mockup/
│       ├── SKILL.md
│       ├── references/
│       │   └── ascii-patterns.md
│       └── templates/
│           ├── mockup-template.md
│           └── mockup_list.json
└── README.md
```

---

## Troubleshooting

### Q: /create-mockup ไม่พบ mockup_list.json
**A:** รัน `/init-mockup` ก่อน หรือระบุชื่อหน้าโดยตรง:
```bash
/create-mockup Login
```

### Q: Wireframe ไม่ตรงกับความต้องการ
**A:** ใช้ `/edit-mockup` เพื่อแก้ไข:
```bash
/edit-mockup login - เปลี่ยน layout เป็น centered, เพิ่ม social login
```

### Q: ต้องการสร้างหลาย mockups พร้อมกัน
**A:** ใช้ `/create-mockups-parallel`:
```bash
/create-mockups-parallel --priority high
/create-mockups-parallel --all
```

---

## Version

- **Version:** 1.0.0
- **Author:** Mounchons
- **Last Updated:** 2025-12

---

## Related Skills

- **[system-design-doc](../system-design-doc/)** - สร้างเอกสารออกแบบระบบ
- **[long-running](../long-running/)** - Development workflow
- **[frontend-design](../../)** - Generate HTML/CSS/React จาก mockup
