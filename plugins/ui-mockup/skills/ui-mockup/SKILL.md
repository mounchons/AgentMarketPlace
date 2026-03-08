---
name: ui-mockup
description: สร้างและแก้ไข UI Mockup/Wireframe จาก System Design Document รองรับ ASCII wireframes, component specifications, design tokens และ responsive design specs
---

# UI Mockup Skill

Skill สำหรับสร้างและแก้ไข UI Mockup/Wireframe โดยใช้ ASCII art และ structured specifications
ออกแบบมาเพื่อเชื่อมต่อกับ system-design-doc และส่งต่อไปยัง frontend-design skill

## 🎯 วัตถุประสงค์

```
┌─────────────────────────────────────────────────────────────────────┐
│                    UI MOCKUP WORKFLOW                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐      ┌─────────────────┐      ┌─────────────┐ │
│  │ system-design   │      │   ui-mockup     │      │ frontend-   │ │
│  │    -doc         │  →   │     skill       │  →   │   design    │ │
│  │                 │      │   (THIS SKILL)  │      │             │ │
│  └─────────────────┘      └─────────────────┘      └─────────────┘ │
│                                                                     │
│  Input:                   Output:                  Final Output:   │
│  • Sitemap               • ASCII Wireframes       • HTML/CSS      │
│  • Screen Specs          • Component Specs        • React/Vue     │
│  • User Flows            • Design Tokens          • Tailwind      │
│  • ER Diagram            • Responsive Specs       • Production    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 💡 ตัวอย่างคำสั่งที่ใช้ได้

| สิ่งที่ต้องการ | ตัวอย่างคำสั่ง |
|---------------|---------------|
| **สร้าง Mockup ใหม่** | `/create-mockup หน้า Login` |
| **สร้างจาก Design Doc** | `/create-mockup จาก system-design-doc.md` |
| **แก้ไข Mockup** | `/edit-mockup หน้า Login - เพิ่มปุ่ม Social Login` |
| **เปลี่ยน Layout** | `/edit-mockup หน้า Dashboard - ปรับเป็น 3 columns` |
| **เพิ่ม Component** | `/edit-mockup หน้า List - เพิ่ม pagination` |
| **Responsive Design** | `/create-mockup หน้า Home - mobile first` |

---

## 🏗️ โครงสร้าง Output

### 1. Mockup Document Structure

```markdown
# [Page Name] - UI Mockup

## Page Info
- Page ID: [SCR-XXX]
- URL: [/path]
- Access: [roles]

## Layout Grid
[ASCII layout grid]

## Wireframe
[ASCII wireframe]

## Components
[Component specifications]

## Design Tokens
[Colors, spacing, typography]

## Responsive Breakpoints
[Mobile, Tablet, Desktop specs]

## Interactions
[Hover, click, animations]
```

---

## 📐 ASCII Wireframe Patterns

### Layout Grid System (12 columns)

```
┌────────────────────────────────────────────────────────────────────┐
│                           HEADER                                    │
├────────────────────────────────────────────────────────────────────┤
│         │                                                          │
│   NAV   │                    MAIN CONTENT                          │
│  (3col) │                      (9col)                              │
│         │                                                          │
├────────────────────────────────────────────────────────────────────┤
│                           FOOTER                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Common Page Layouts

#### 1. Dashboard Layout
```
┌────────────────────────────────────────────────────────────────────┐
│  [Logo]              Search [________]           [User ▼] [Notif]  │
├────────┬───────────────────────────────────────────────────────────┤
│        │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│  Menu  │  │  Card 1 │ │  Card 2 │ │  Card 3 │ │  Card 4 │         │
│        │  │   KPI   │ │   KPI   │ │   KPI   │ │   KPI   │         │
│  ────  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘         │
│  Item1 │                                                           │
│  Item2 │  ┌─────────────────────────────────────────────────────┐  │
│  Item3 │  │                                                     │  │
│  ────  │  │                     CHART                           │  │
│  Item4 │  │                                                     │  │
│  Item5 │  └─────────────────────────────────────────────────────┘  │
│        │                                                           │
│        │  ┌─────────────────────────────────────────────────────┐  │
│        │  │  Table Header                              [Actions]│  │
│        │  ├─────────────────────────────────────────────────────┤  │
│        │  │  Row 1                                              │  │
│        │  │  Row 2                                              │  │
│        │  │  Row 3                                              │  │
│        │  └─────────────────────────────────────────────────────┘  │
└────────┴───────────────────────────────────────────────────────────┘
```

#### 2. Form Layout
```
┌────────────────────────────────────────────────────────────────────┐
│                         [Page Title]                               │
│                    [Subtitle / Description]                        │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│   ┌────────────────────────────────────────────────────────────┐   │
│   │                        FORM CARD                           │   │
│   │                                                            │   │
│   │   Label 1                                                  │   │
│   │   ┌────────────────────────────────────────────────────┐   │   │
│   │   │ Input field                                        │   │   │
│   │   └────────────────────────────────────────────────────┘   │   │
│   │   [Helper text / Error message]                            │   │
│   │                                                            │   │
│   │   Label 2                                                  │   │
│   │   ┌────────────────────────────────────────────────────┐   │   │
│   │   │ Input field                                        │   │   │
│   │   └────────────────────────────────────────────────────┘   │   │
│   │                                                            │   │
│   │   Label 3                       Label 4                    │   │
│   │   ┌──────────────────┐         ┌──────────────────┐       │   │
│   │   │ Input (half)     │         │ Input (half)     │       │   │
│   │   └──────────────────┘         └──────────────────┘       │   │
│   │                                                            │   │
│   │   ┌────────────────────┐  ┌────────────────────────────┐   │   │
│   │   │     [Cancel]       │  │      [Submit Button]       │   │   │
│   │   └────────────────────┘  └────────────────────────────┘   │   │
│   │                                                            │   │
│   └────────────────────────────────────────────────────────────┘   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

#### 3. List/Table Layout
```
┌────────────────────────────────────────────────────────────────────┐
│  [Page Title]                           [+ Add New] [Filter ▼]     │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Search: [________________________] [🔍]    Showing 1-10 of 100   │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ ☐ │ Column 1    │ Column 2     │ Column 3   │ Actions     │   │
│  ├────────────────────────────────────────────────────────────┤   │
│  │ ☐ │ Data 1      │ Data 2       │ Status ●   │ [✏️] [🗑️]  │   │
│  │ ☐ │ Data 1      │ Data 2       │ Status ●   │ [✏️] [🗑️]  │   │
│  │ ☐ │ Data 1      │ Data 2       │ Status ○   │ [✏️] [🗑️]  │   │
│  │ ☐ │ Data 1      │ Data 2       │ Status ●   │ [✏️] [🗑️]  │   │
│  │ ☐ │ Data 1      │ Data 2       │ Status ●   │ [✏️] [🗑️]  │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  [◀ Prev]  [1] [2] [3] ... [10]  [Next ▶]                        │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

#### 4. Login/Auth Layout
```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
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
│                    │   │                 │   │                     │
│                    │   └─────────────────┘   │                     │
│                    │   [Forgot Password?]    │                     │
│                    │                         │                     │
│                    │   ┌─────────────────┐   │                     │
│                    │   │    [LOGIN]      │   │                     │
│                    │   └─────────────────┘   │                     │
│                    │                         │                     │
│                    │   ─────── OR ───────    │                     │
│                    │                         │                     │
│                    │   [G] [f] [in]          │                     │
│                    │                         │                     │
│                    │   Don't have account?   │                     │
│                    │   [Sign up here]        │                     │
│                    │                         │                     │
│                    └─────────────────────────┘                     │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Component Library

### Form Components

```
Text Input:
┌────────────────────────────────────┐
│ Placeholder text                   │
└────────────────────────────────────┘

Text Input with Icon:
┌────────────────────────────────────┐
│ 🔍 Search...                       │
└────────────────────────────────────┘

Password Input:
┌────────────────────────────────────┐
│ ●●●●●●●●                       👁 │
└────────────────────────────────────┘

Textarea:
┌────────────────────────────────────┐
│                                    │
│                                    │
│                                    │
└────────────────────────────────────┘

Select/Dropdown:
┌────────────────────────────────────┐
│ Select option                    ▼ │
└────────────────────────────────────┘

Checkbox:
☐ Unchecked option
☑ Checked option

Radio:
○ Unselected option
● Selected option

Toggle:
[○────] Off
[────●] On
```

### Button Components

```
Primary Button:
┌────────────────────────────────────┐
│           Primary Action           │
└────────────────────────────────────┘

Secondary Button:
┌────────────────────────────────────┐
│          Secondary Action          │
└────────────────────────────────────┘

Icon Button:
┌──────┐
│  +   │
└──────┘

Button Group:
┌──────────┐┌──────────┐┌──────────┐
│  Opt 1   ││  Opt 2   ││  Opt 3   │
└──────────┘└──────────┘└──────────┘
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
│   └ Sub2 │
│ ▸ Menu 3 │
│ ▸ Menu 4 │
├──────────┤
│ [Logout] │
└──────────┘

Breadcrumb:
Home > Category > Subcategory > Current Page

Tabs:
┌──────────┬──────────┬──────────┐
│  Tab 1   │ [Tab 2]  │  Tab 3   │
└──────────┴──────────┴──────────┘

Pagination:
[◀ Prev]  [1] [2] [3] ... [10]  [Next ▶]
```

### Data Display Components

```
Card:
┌────────────────────────────────────┐
│ Card Title              [Actions] │
├────────────────────────────────────┤
│                                    │
│ Card content goes here             │
│                                    │
└────────────────────────────────────┘

Table:
┌──────────┬──────────┬──────────┐
│ Header 1 │ Header 2 │ Header 3 │
├──────────┼──────────┼──────────┤
│ Cell 1   │ Cell 2   │ Cell 3   │
│ Cell 1   │ Cell 2   │ Cell 3   │
└──────────┴──────────┴──────────┘

Badge/Tag:
[Active]  [Pending]  [Inactive]

Status Indicator:
● Active (green)
○ Inactive (gray)
◐ Pending (yellow)
✕ Error (red)

Avatar:
┌───┐
│ U │  User Name
└───┘

Progress Bar:
[████████░░░░░░░░] 50%

Stats Card:
┌────────────────┐
│     1,234      │
│    Revenue     │
│    ↑ 12.5%     │
└────────────────┘
```

### Feedback Components

```
Alert - Success:
┌────────────────────────────────────────────────────────────────────┐
│ ✓  Success! Your changes have been saved.                    [×] │
└────────────────────────────────────────────────────────────────────┘

Alert - Error:
┌────────────────────────────────────────────────────────────────────┐
│ ✕  Error! Something went wrong. Please try again.            [×] │
└────────────────────────────────────────────────────────────────────┘

Alert - Warning:
┌────────────────────────────────────────────────────────────────────┐
│ ⚠  Warning! This action cannot be undone.                    [×] │
└────────────────────────────────────────────────────────────────────┘

Toast Notification:
                              ┌─────────────────────────────┐
                              │ ✓ Changes saved       [×]  │
                              └─────────────────────────────┘

Modal:
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│      ┌────────────────────────────────────────────────────┐       │
│      │ Modal Title                                   [×] │       │
│      ├────────────────────────────────────────────────────┤       │
│      │                                                    │       │
│      │ Modal content goes here...                         │       │
│      │                                                    │       │
│      ├────────────────────────────────────────────────────┤       │
│      │                      [Cancel]  [Confirm]          │       │
│      └────────────────────────────────────────────────────┘       │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Design Tokens

### Colors

```yaml
colors:
  primary:
    50: "#f0f9ff"
    100: "#e0f2fe"
    500: "#0ea5e9"   # Main
    600: "#0284c7"   # Hover
    700: "#0369a1"   # Active

  secondary:
    500: "#6366f1"
    600: "#4f46e5"

  success:
    500: "#22c55e"

  warning:
    500: "#f59e0b"

  error:
    500: "#ef4444"

  neutral:
    50: "#fafafa"    # Background
    100: "#f5f5f5"   # Card bg
    200: "#e5e5e5"   # Border
    500: "#737373"   # Placeholder
    700: "#404040"   # Body text
    900: "#171717"   # Headings
```

### Typography

```yaml
typography:
  fontFamily:
    sans: "'Inter', -apple-system, sans-serif"
    mono: "'JetBrains Mono', monospace"

  fontSize:
    xs: "0.75rem"    # 12px
    sm: "0.875rem"   # 14px
    base: "1rem"     # 16px
    lg: "1.125rem"   # 18px
    xl: "1.25rem"    # 20px
    2xl: "1.5rem"    # 24px
    3xl: "1.875rem"  # 30px
    4xl: "2.25rem"   # 36px

  fontWeight:
    normal: 400
    medium: 500
    semibold: 600
    bold: 700
```

### Spacing

```yaml
spacing:
  0: "0"
  1: "0.25rem"   # 4px
  2: "0.5rem"    # 8px
  3: "0.75rem"   # 12px
  4: "1rem"      # 16px
  5: "1.25rem"   # 20px
  6: "1.5rem"    # 24px
  8: "2rem"      # 32px
  10: "2.5rem"   # 40px
  12: "3rem"     # 48px
  16: "4rem"     # 64px
```

### Border Radius

```yaml
borderRadius:
  none: "0"
  sm: "0.125rem"   # 2px
  default: "0.25rem"  # 4px
  md: "0.375rem"   # 6px
  lg: "0.5rem"     # 8px
  xl: "0.75rem"    # 12px
  2xl: "1rem"      # 16px
  full: "9999px"   # Pill
```

### Shadows

```yaml
shadows:
  sm: "0 1px 2px rgba(0,0,0,0.05)"
  default: "0 1px 3px rgba(0,0,0,0.1)"
  md: "0 4px 6px rgba(0,0,0,0.1)"
  lg: "0 10px 15px rgba(0,0,0,0.1)"
  xl: "0 20px 25px rgba(0,0,0,0.1)"
```

---

## 📱 Responsive Breakpoints

```yaml
breakpoints:
  sm: "640px"    # Mobile landscape
  md: "768px"    # Tablet
  lg: "1024px"   # Desktop
  xl: "1280px"   # Large desktop
  2xl: "1536px"  # Extra large

layouts:
  mobile:
    columns: 4
    gutter: "16px"
    margin: "16px"

  tablet:
    columns: 8
    gutter: "24px"
    margin: "32px"

  desktop:
    columns: 12
    gutter: "24px"
    margin: "auto"
    maxWidth: "1280px"
```

---

## 🔄 Workflow

### สร้าง Mockup ใหม่

```
1. รับ Input
   ├── จาก system-design-doc (Sitemap, Screen Specs)
   └── หรือจาก user requirements

2. กำหนด Layout
   ├── เลือก layout pattern ที่เหมาะสม
   ├── กำหนด grid system
   └── ระบุ responsive behavior

3. สร้าง Wireframe
   ├── วาด ASCII wireframe
   ├── ระบุ component ที่ใช้
   └── กำหนด spacing

4. สร้าง Component Specs
   ├── List components ที่ใช้
   ├── ระบุ states (default, hover, active, disabled)
   └── กำหนด interactions

5. กำหนด Design Tokens
   ├── Colors
   ├── Typography
   └── Spacing

6. บันทึก Mockup
   └── สร้างไฟล์ .mockup.md ในโฟลเดอร์ .mockups/
```

### แก้ไข Mockup

```
1. อ่าน Mockup ที่มีอยู่
   └── จาก .mockups/[page-name].mockup.md

2. รับ Change Request
   ├── เพิ่ม/ลบ component
   ├── เปลี่ยน layout
   ├── ปรับ design tokens
   └── เพิ่ม responsive breakpoint

3. แก้ไข Mockup
   ├── อัพเดท ASCII wireframe
   ├── อัพเดท component specs
   └── อัพเดท design tokens

4. บันทึก Version
   └── อัพเดทไฟล์ + version history
```

---

## 📁 Output Files

เมื่อสร้าง mockup จะบันทึกไฟล์ที่:

```
project-root/
└── .mockups/
    ├── _design-tokens.yaml       # Shared design tokens
    ├── _component-library.md     # Project component library
    ├── login.mockup.md           # Login page mockup
    ├── dashboard.mockup.md       # Dashboard mockup
    ├── user-list.mockup.md       # User list mockup
    └── ...
```

---

## ⚙️ Commands

| Command | Description |
|---------|-------------|
| `/create-mockup [page]` | สร้าง mockup หน้าใหม่ |
| `/edit-mockup [page] - [changes]` | แก้ไข mockup ที่มีอยู่ |
| `/list-mockups` | ดูรายการ mockups ทั้งหมด |
| `/export-mockups` | Export mockups เป็น summary |

---

## 📚 References

| File | Description |
|------|-------------|
| `references/ascii-patterns.md` | ASCII wireframe patterns เพิ่มเติม |
| `references/component-library.md` | Full component library |
| `references/responsive-patterns.md` | Responsive design patterns |
| `templates/mockup-template.md` | Template สำหรับ mockup file |
| `templates/mockup_list.json` | Template สำหรับ mockup tracking |

---

## 🎯 Entity Complexity Classification

### Simple vs Complex Entities

| Complexity | ลักษณะข้อมูล | UI Pattern | ตัวอย่าง |
|------------|-------------|------------|---------|
| **simple** | Master data, fields < 10, ไม่มี relations ซับซ้อน | Modal popup | Department, Status, Category, Position |
| **complex** | Fields >= 10, มี relations ซับซ้อน, ต้องการ wizard | Separate page | User, Order, Product, Employee |

### UI Pattern Decision

```
Entity Analysis
      │
      ├── Fields < 10 && No complex relations
      │   └── complexity: "simple"
      │       └── UI Pattern: Modal
      │           • View → Modal
      │           • Create → Modal
      │           • Edit → Modal
      │           • Delete → SweetAlert2
      │
      └── Fields >= 10 || Complex relations
          └── complexity: "complex"
              └── UI Pattern: Page
                  • View → Detail Page
                  • Create → Form Page
                  • Edit → Form Page
                  • Delete → SweetAlert2
```

---

## 📊 CRUD Page Patterns

### Complex Entity (3 pages)

สำหรับ entity ที่ซับซ้อน จะสร้าง 3 pages:

| Page Type | Filename | Description |
|-----------|----------|-------------|
| List | `[NNN]-[entity]-list.mockup.md` | ตารางแสดงรายการ |
| Form | `[NNN]-[entity]-form.mockup.md` | ฟอร์มสร้าง/แก้ไข |
| Detail | `[NNN]-[entity]-detail.mockup.md` | แสดงรายละเอียด |

### Simple Entity (1 page with modals)

สำหรับ entity ง่ายๆ (Master Data) จะสร้าง 1 page:

| Page Type | Filename | Description |
|-----------|----------|-------------|
| List | `[NNN]-[entity]-list.mockup.md` | ตาราง + Modal สำหรับ View/Create/Edit |

---

## 📁 File Naming Convention

**Format:** `[NNN]-[page-name].mockup.md`

| Component | Description | Example |
|-----------|-------------|---------|
| NNN | 3 หลักตัวเลขจาก page ID | 001, 004, 015 |
| page-name | ชื่อหน้าแบบ kebab-case | login, user-list, department-list |

**ตัวอย่าง:**
```
.mockups/
├── mockup_list.json
├── 001-login.mockup.md
├── 002-register.mockup.md
├── 003-dashboard.mockup.md
├── 004-user-list.mockup.md
├── 005-user-form.mockup.md
├── 006-user-detail.mockup.md
├── 010-department-list.mockup.md    # simple entity (modal pattern)
└── _design-tokens.json
```

---

## 📋 Action Column Position

**Action column ต้องอยู่ด้านหน้า (ซ้ายสุด) ของตาราง:**

```
┌────────┬─────┬────────────────────┬─────────────────┬──────────┐
│ Action │ ID  │ Name               │ Email           │ Status   │
├────────┼─────┼────────────────────┼─────────────────┼──────────┤
│ 👁 ✏️ 🗑 │ 001 │ John Doe           │ john@email.com  │ Active   │
│ 👁 ✏️ 🗑 │ 002 │ Jane Smith         │ jane@email.com  │ Active   │
└────────┴─────┴────────────────────┴─────────────────┴──────────┘
```

### Action Icons

| Icon | Action | Simple Entity | Complex Entity |
|------|--------|---------------|----------------|
| 👁 | View | Open View Modal | Navigate to Detail Page |
| ✏️ | Edit | Open Edit Modal | Navigate to Edit Page |
| 🗑 | Delete | SweetAlert2 | SweetAlert2 |

---

## 🔔 SweetAlert2 Usage

**Delete confirmation ใช้ SweetAlert2 เสมอ (ทั้ง simple และ complex entities):**

```javascript
// Delete Confirmation (default: soft delete)
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
// For hard delete: text: "This action cannot be undone.", confirmButtonText: "Yes, delete it!"

// Success
Swal.fire({
  icon: 'success',
  title: 'Success!',
  text: 'Your record has been saved.',
  confirmButtonText: 'OK'
})

// Error
Swal.fire({
  icon: 'error',
  title: 'Error!',
  text: 'Something went wrong.',
  confirmButtonText: 'OK'
})
```

---

## 🔗 Related Documents

ทุก page ใน mockup_list.json สามารถมี related_documents:

```json
{
  "related_documents": [
    {"type": "system-design", "path": "system-design.md#user-management"},
    {"type": "api", "path": "docs/api/users.md"},
    {"type": "requirements", "path": "requirements.md#FR-001"}
  ]
}
```

**Document Types ที่รองรับ:**
- `system-design` - System Design Document
- `api` - API Specification
- `requirements` - Requirements Document
- `figma` - Figma Design
- `erd` - ER Diagram
- `flow` - Flow Diagram
- `data-dict` - Data Dictionary
