# [Page Name] - UI Mockup

**Version**: 1.0.0
**Created**: [YYYY-MM-DD]
**Last Updated**: [YYYY-MM-DD]
**Status**: Draft | In Review | Approved

---

## Page Info

| Property | Value |
|----------|-------|
| Page ID | SCR-XXX |
| Page Name | [ชื่อหน้าภาษาไทย/อังกฤษ] |
| URL | /path/to/page |
| Access | [Public / User / Admin / etc.] |
| Parent Page | [หน้าแม่ถ้ามี] |

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

## Components Used

| Component | Location | Props/Variants | Notes |
|-----------|----------|----------------|-------|
| Navbar | Header | variant: "default" | Sticky on scroll |
| Button | Main content | variant: "primary", size: "md" | - |
| Input | Form section | type: "text", required: true | - |
| Table | Data section | sortable: true, selectable: true | - |
| Pagination | Below table | totalPages: 10 | - |

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
| INT-001 | Click "Submit" button | Validate form → API POST | Success: Show toast, redirect<br>Error: Show error message |
| INT-002 | Click row in table | Navigate to detail page | Load detail page |
| INT-003 | Click "Delete" button | Show confirmation modal | Confirm: Delete + refresh<br>Cancel: Close modal |

---

## Modals & Dialogs

### [Modal Name]

**Trigger**: [What triggers this modal]

```
┌────────────────────────────────────────────────────────────────────┐
│                          (overlay)                                 │
│      ┌────────────────────────────────────────────────────┐       │
│      │ [Modal Title]                                 [×] │       │
│      ├────────────────────────────────────────────────────┤       │
│      │                                                    │       │
│      │ [Modal content here]                               │       │
│      │                                                    │       │
│      ├────────────────────────────────────────────────────┤       │
│      │                      [Cancel]  [Confirm]          │       │
│      └────────────────────────────────────────────────────┘       │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Actions**:
- Confirm: [What happens]
- Cancel: [What happens]
- Click outside: [Close / Nothing]

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
| `error-500` | #ef4444 | Error states |

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

---

## Accessibility Notes

| Requirement | Implementation |
|-------------|----------------|
| Keyboard navigation | All interactive elements focusable |
| Screen reader | ARIA labels on icons, buttons |
| Color contrast | Min 4.5:1 for text |
| Focus indicator | Visible outline on focus |
| Error messages | Associated with form fields |

---

## API Dependencies

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/xxx` | GET | Load initial data |
| `/api/xxx` | POST | Submit form |
| `/api/xxx/:id` | DELETE | Delete item |

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

- System Design Doc: [link]
- API Specification: [link]
- Figma Design: [link if available]
