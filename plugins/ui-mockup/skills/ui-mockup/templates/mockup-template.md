# [Page Name] - UI Mockup

**Version**: 1.0.0
**Created**: [YYYY-MM-DD]
**Last Updated**: [YYYY-MM-DD]
**Status**: Draft | In Review | Approved

---

## Page Info

| Property | Value |
|----------|-------|
| Page ID | [NNN] |
| Page Name | [ชื่อหน้าภาษาไทย/อังกฤษ] |
| URL | /path/to/page |
| Access | [Public / User / Admin / etc.] |
| Parent Page | [หน้าแม่ถ้ามี] |
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

[อธิบายสั้นๆ 1-2 ประโยคว่าหน้านี้ทำอะไร ใครใช้ และ use case หลัก]

---

## Layout Grid

### Desktop (12 columns, min-width: 1024px)

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

### Tablet (8 columns, 768px - 1023px)

```
┌─────────────────────────────────────────────────┐
│                  HEADER (8 col)                 │
├─────────────────────────────────────────────────┤
│                                                 │
│               MAIN CONTENT                      │
│                 (8 col)                         │
│                                                 │
├─────────────────────────────────────────────────┤
│                  FOOTER (8 col)                 │
└─────────────────────────────────────────────────┘
```

### Mobile (4 columns, < 768px)

```
┌─────────────────────────┐
│      HEADER (4 col)     │
├─────────────────────────┤
│                         │
│      MAIN CONTENT       │
│        (4 col)          │
│                         │
├─────────────────────────┤
│      FOOTER (4 col)     │
└─────────────────────────┘
```

---

## Wireframe

### Desktop View

```
┌────────────────────────────────────────────────────────────────────┐
│  [Logo]              Search [________]           [User ▼] [Notif]  │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│                                                                    │
│                        MAIN CONTENT AREA                           │
│                                                                    │
│                    [Add your wireframe here]                       │
│                                                                    │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                     © 2025 Company Name                            │
└────────────────────────────────────────────────────────────────────┘
```

### Tablet View

```
┌─────────────────────────────────────────────────┐
│  [Logo]        [☰]                [User]        │
├─────────────────────────────────────────────────┤
│                                                 │
│              MAIN CONTENT AREA                  │
│           [Tablet wireframe here]               │
│                                                 │
├─────────────────────────────────────────────────┤
│                © 2025 Company                   │
└─────────────────────────────────────────────────┘
```

### Mobile View

```
┌─────────────────────────┐
│  [Logo]          [☰]    │
├─────────────────────────┤
│                         │
│    MAIN CONTENT AREA    │
│  [Mobile wireframe]     │
│                         │
├─────────────────────────┤
│    © 2025 Company       │
└─────────────────────────┘
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

| Icon | Action | Behavior (Simple Entity) | Behavior (Complex Entity) |
|------|--------|--------------------------|---------------------------|
| 👁 | View | Open View Modal | Navigate to Detail Page |
| ✏️ | Edit | Open Edit Modal | Navigate to Edit Page |
| 🗑 | Delete | SweetAlert2 Confirmation | SweetAlert2 Confirmation |

---

## Components Used

| Component | Location | Props/Variants | Notes |
|-----------|----------|----------------|-------|
| Navbar | Header | variant: "default" | Sticky on scroll |
| Button | Main content | variant: "primary", size: "md" | - |
| Input | Form section | type: "text", required: true | - |
| Table | Data section | sortable: true, selectable: true | Action column first |
| Pagination | Below table | totalPages: 10 | - |
| Modal | Overlay | size: "md" | For simple entities |
| SweetAlert2 | Overlay | icon: "warning" | For delete confirmation |

---

## Component Details

### [Component 1 Name]

**Type**: [Button / Input / Card / etc.]

**Location**: [Where in the wireframe]

**States**:
| State | Description | Visual |
|-------|-------------|--------|
| Default | Normal state | `[Button]` |
| Hover | Mouse over | `[Button]` + shadow |
| Active | Clicked | `[Button]` + darker |
| Disabled | Not clickable | `[Button]` grayed out |
| Loading | Processing | `[⟳ Loading...]` |

**Props**:
```yaml
label: "Button Text"
variant: "primary"  # primary, secondary, outline, ghost
size: "medium"      # small, medium, large
icon: "arrow-right" # optional
iconPosition: "right"
disabled: false
loading: false
```

### [Component 2 Name]

**Type**: [Form Input]

**Validation**:
| Rule | Value | Error Message |
|------|-------|---------------|
| required | true | "กรุณากรอกข้อมูล" |
| minLength | 3 | "ต้องมีอย่างน้อย 3 ตัวอักษร" |
| pattern | email | "รูปแบบอีเมลไม่ถูกต้อง" |

---

## Interactions

| ID | Trigger | Action | Result |
|----|---------|--------|--------|
| INT-001 | Click "Submit" button | Validate form → API POST | Success: SweetAlert2 success, redirect<br>Error: SweetAlert2 error |
| INT-002 | Click 👁 View icon | Open modal (simple) or navigate (complex) | Show record details |
| INT-003 | Click ✏️ Edit icon | Open modal (simple) or navigate (complex) | Show edit form |
| INT-004 | Click 🗑 Delete icon | SweetAlert2 confirmation | Confirm: Delete + refresh<br>Cancel: Close alert |
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

**Actions**:
- Save: Validate → API call → SweetAlert2 success → Close modal → Refresh table
- Cancel: Close modal
- Click outside: Close modal

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
```

### Success Alert

**Trigger**: After successful operation

```
┌─────────────────────────────────────────────────────────────────┐
│                         (overlay)                                │
│      ┌─────────────────────────────────────────────┐            │
│      │                                             │            │
│      │                    ✅                        │            │
│      │                                             │            │
│      │               Success!                      │            │
│      │                                             │            │
│      │   Your record has been saved.              │            │
│      │                                             │            │
│      │                  [OK]                       │            │
│      │                                             │            │
│      └─────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

**Config**:
```javascript
Swal.fire({
  icon: 'success',
  title: 'Success!',
  text: 'Your record has been saved.',
  confirmButtonText: 'OK'
})
```

### Error Alert

**Trigger**: After failed operation

```
┌─────────────────────────────────────────────────────────────────┐
│                         (overlay)                                │
│      ┌─────────────────────────────────────────────┐            │
│      │                                             │            │
│      │                    ❌                        │            │
│      │                                             │            │
│      │                Error!                       │            │
│      │                                             │            │
│      │   Something went wrong. Please try again.  │            │
│      │                                             │            │
│      │                  [OK]                       │            │
│      │                                             │            │
│      └─────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Design Tokens

### Colors Used

| Token | Value | Usage |
|-------|-------|-------|
| `primary-500` | #0ea5e9 | Primary buttons, links |
| `neutral-50` | #fafafa | Page background |
| `neutral-100` | #f5f5f5 | Card background |
| `neutral-200` | #e5e5e5 | Borders |
| `neutral-700` | #404040 | Body text |
| `neutral-900` | #171717 | Headings |
| `success-500` | #22c55e | Success states |
| `error-500` | #ef4444 | Error states, delete buttons |
| `warning-500` | #f59e0b | Warning states |

### Typography Used

| Element | Token | Value |
|---------|-------|-------|
| Page Title | `text-2xl font-bold` | 24px, Bold |
| Section Title | `text-xl font-semibold` | 20px, Semibold |
| Body Text | `text-base` | 16px, Regular |
| Small Text | `text-sm` | 14px, Regular |
| Labels | `text-sm font-medium` | 14px, Medium |

### Spacing Used

| Area | Token | Value |
|------|-------|-------|
| Page padding | `p-6` | 24px |
| Section gap | `space-y-8` | 32px |
| Component gap | `space-y-4` | 16px |
| Form field gap | `space-y-3` | 12px |

---

## Responsive Behavior

| Element | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Navbar | Full menu | Hamburger menu | Hamburger menu |
| Sidebar | Visible (fixed) | Overlay (toggle) | Overlay (toggle) |
| Grid columns | 3-4 columns | 2 columns | 1 column |
| Table | Full table | Horizontal scroll | Card list |
| Actions | Text buttons | Icon buttons | Bottom sheet |
| Modal | Center modal | Center modal | Full screen |

### Breakpoint Details

**Desktop (≥1024px)**:
- Full layout with sidebar
- Table with all columns
- Horizontal forms

**Tablet (768px - 1023px)**:
- Collapsible sidebar
- Reduced columns
- Stacked forms

**Mobile (<768px)**:
- Bottom navigation
- Single column
- Vertical forms
- Swipe actions
- Full screen modals

---

## Accessibility Notes

| Requirement | Implementation |
|-------------|----------------|
| Keyboard navigation | All interactive elements focusable |
| Screen reader | ARIA labels on icons, buttons |
| Color contrast | Min 4.5:1 for text |
| Focus indicator | Visible outline on focus |
| Error messages | Associated with form fields |
| Modal focus trap | Focus stays within modal when open |

---

## API Dependencies

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/[entity]` | GET | Load list data |
| `/api/[entity]` | POST | Create new record |
| `/api/[entity]/:id` | GET | Load single record |
| `/api/[entity]/:id` | PUT | Update record |
| `/api/[entity]/:id` | DELETE | Delete record |

---

## Notes & Decisions

- [Note 1: Design decision และเหตุผล]
- [Note 2: Known limitation]
- [Note 3: Future enhancement]

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | [DATE] | [NAME] | Initial mockup |

---

## Related Documents

### Source Documents

| Type | Document | Section/Link |
|------|----------|--------------|
| System Design | [path] | [section] |
| API Spec | [path] | [endpoint] |
| Requirements | [path] | [requirement-id] |
| ER Diagram | [path] | [entity] |

### Related Mockups

| Relation | Page | ID | Link |
|----------|------|----|------|
| CRUD: List | [Entity] List | [NNN] | [[NNN]-[entity]-list.mockup.md] |
| CRUD: Form | [Entity] Form | [NNN] | [[NNN]-[entity]-form.mockup.md] |
| CRUD: Detail | [Entity] Detail | [NNN] | [[NNN]-[entity]-detail.mockup.md] |
| Parent | [Parent Page] | [NNN] | [link] |

### External Links

- Figma Design: [link if available]
- Prototype: [link if available]
