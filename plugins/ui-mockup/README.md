# UI Mockup Plugin

สร้างและแก้ไข UI Mockup/Wireframe จาก System Design Document

## 🎯 วัตถุประสงค์

Plugin นี้เป็น bridge ระหว่าง:
- **Input**: `system-design-doc` (Sitemap, Screen Specs, User Flows)
- **Output**: UI Mockups พร้อมส่งต่อไปยัง `frontend-design`

```
system-design-doc → ui-mockup → frontend-design
     (เอกสาร)        (wireframe)     (code)
```

## 📦 Features

- สร้าง ASCII Wireframes
- Component Specifications
- Design Tokens (colors, typography, spacing)
- Responsive Breakpoints
- Interaction Definitions
- Version Control

## 🚀 Commands

| Command | Description |
|---------|-------------|
| `/create-mockup [page]` | สร้าง mockup หน้าใหม่ |
| `/edit-mockup [page] - [changes]` | แก้ไข mockup ที่มีอยู่ |
| `/list-mockups` | ดูรายการ mockups ทั้งหมด |

## 💡 ตัวอย่างการใช้งาน

### สร้าง Mockup ใหม่

```bash
/create-mockup หน้า Login
/create-mockup Dashboard พร้อม sidebar และ charts
/create-mockup จาก system-design-doc.md
```

### แก้ไข Mockup

```bash
/edit-mockup login - เพิ่มปุ่ม Social Login
/edit-mockup dashboard - ปรับเป็น 3 columns
/edit-mockup user-list - เพิ่ม pagination และ search
/edit-mockup form - เปลี่ยน layout เป็น 2 columns
```

## 📁 Output Structure

```
project-root/
└── .mockups/
    ├── _design-tokens.yaml       # Shared design tokens
    ├── login.mockup.md           # Login page mockup
    ├── dashboard.mockup.md       # Dashboard mockup
    ├── user-list.mockup.md       # User list mockup
    └── ...
```

## 📋 Mockup File Structure

```markdown
# [Page Name] - UI Mockup

## Page Info
- Page ID, URL, Access Level

## Layout Grid
- Desktop (12 col), Tablet (8 col), Mobile (4 col)

## Wireframe
- ASCII wireframe for each breakpoint

## Components Used
- Component list with props and variants

## Interactions
- User interactions and their results

## Design Tokens
- Colors, typography, spacing used

## Responsive Behavior
- How elements adapt to different screens

## Version History
- Change log
```

## 🔗 Integration

### กับ system-design-doc

```
1. รัน /system-design-doc สร้างเอกสาร
2. รัน /create-mockup จาก system-design-doc.md
3. Mockup จะถูกสร้างจาก Sitemap และ Screen Specs อัตโนมัติ
```

### กับ frontend-design

```
1. สร้าง mockup ด้วย /create-mockup หรือ /edit-mockup
2. รัน /frontend-design [page]
3. frontend-design จะอ่าน mockup และ generate HTML/CSS/React
```

## 📚 References

- `skills/ui-mockup/SKILL.md` - Main skill documentation
- `skills/ui-mockup/references/ascii-patterns.md` - ASCII wireframe patterns
- `skills/ui-mockup/templates/mockup-template.md` - Mockup file template

## 🏗️ Plugin Structure

```
plugins/ui-mockup/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   ├── create-mockup.md
│   ├── edit-mockup.md
│   └── list-mockups.md
├── skills/
│   └── ui-mockup/
│       ├── SKILL.md
│       ├── references/
│       │   └── ascii-patterns.md
│       └── templates/
│           └── mockup-template.md
└── README.md
```
