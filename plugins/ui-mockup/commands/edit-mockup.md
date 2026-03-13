---
description: Edit an existing UI Mockup/Wireframe
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*)
---

# Edit Mockup Command

Edit an existing UI Mockup/Wireframe.

## Received Input

User wants to edit: $ARGUMENTS

**Input format:**
```
/edit-mockup [page-name] - [changes]
```

**Examples:**
- `/edit-mockup login - add Social Login button`
- `/edit-mockup dashboard - change to 3 columns`
- `/edit-mockup user-list - add pagination and filters`
- `/edit-mockup form - change layout to 2 columns`

## Steps to Follow

### Step 1: Parse Input

Separate the input parts:
1. **Page Name** - Which page to edit
2. **Changes** - What needs to be changed

### Step 2: Find Mockup File

```bash
# Find mockup file (new format: [NNN]-[page-name].mockup.md)
ls .mockups/[0-9][0-9][0-9]-*.mockup.md 2>/dev/null

# Or search by name
ls .mockups/*[page-name]*.mockup.md 2>/dev/null

# Or search from mockup_list.json
cat .mockups/mockup_list.json | jq '.pages[] | select(.name | contains("[page-name]"))'
```

**If mockup file not found:**
```
❌ Mockup not found for page "[page-name]"

📁 Available mockups:
   • 001-login.mockup.md
   • 003-dashboard.mockup.md
   • 004-user-list.mockup.md

💡 Want to create a new one?
   → /create-mockup [page-name]
```

### Step 3: Read Current Mockup

```bash
cat .mockups/[NNN]-[page-name].mockup.md
```

**Analyze:**
- Current layout
- Existing components
- Wireframe structure
- CRUD Group and UI Pattern (if applicable)
- Action column position (if List page)

### Step 4: Analyze Change Request

**Edit types:**

| Type | Examples | Action |
|------|----------|--------|
| **Add Component** | "add button", "add filter" | Add component to wireframe + component list |
| **Remove Component** | "remove sidebar", "remove footer" | Remove from wireframe + component list |
| **Change Layout** | "change to 3 columns", "switch to tabs" | Redraw wireframe |
| **Modify Component** | "change button to red", "make input larger" | Update component specs |
| **Add Interaction** | "add modal when clicking delete" | Add to interactions section |
| **Change Responsive** | "hide sidebar on mobile" | Update responsive behavior |
| **Move Component** | "move search to the right", "swap columns" | Adjust wireframe |
| **Change to Modal** | "switch to modal pattern" | Update UI pattern and add Modal sections |
| **Add SweetAlert2** | "add confirm dialog" | Add SweetAlert2 section |

### Step 5: Execute the Edit

#### 5.1 For Add Component

```markdown
## Before:
┌────────────────────────────────────┐
│   ┌─────────────────┐              │
│   │    [LOGIN]      │              │
│   └─────────────────┘              │
└────────────────────────────────────┘

## After (add Social Login):
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

**Update Components Used:**
```markdown
| Component | Location | Props/Variants | Notes |
|-----------|----------|----------------|-------|
| SocialLoginButtons | Below login button | providers: ['google', 'facebook', 'linkedin'] | New |
| Divider | Between login and social | text: "OR" | New |
```

#### 5.2 For Change Layout

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

**Update Layout Grid:**
```markdown
### Desktop (12 columns)
- Card 1: 4 columns
- Card 2: 4 columns
- Card 3: 4 columns
```

#### 5.3 For Add Interaction

**Add to Interactions section:**
```markdown
## Interactions

| Trigger | Action | Result |
|---------|--------|--------|
| Click delete button | Show confirmation modal | - |
| Confirm delete | API DELETE call | Remove row, show success toast |
| Cancel delete | Close modal | - |
```

**Add Modal wireframe:**
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

### Step 6: Update Version History

```markdown
## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-15 | Claude | Initial mockup |
| 1.1.0 | 2025-01-20 | Claude | Added Social Login buttons |
```

### Step 7: Save File

Use Edit tool to update the file `.mockups/[page-name].mockup.md`

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

### Pattern 1: Add Pagination

```
Before: Simple list
After:
┌────────────────────────────────────────────────────────────────────┐
│  ... (existing content) ...                                        │
│                                                                    │
│  [◀ Prev]  [1] [2] [3] ... [10]  [Next ▶]    Showing 1-10 of 100 │
└────────────────────────────────────────────────────────────────────┘
```

### Pattern 2: Add Search & Filters

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

### Pattern 3: Add Tabs

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

### Pattern 4: Add Sidebar

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

### Pattern 5: Add Modal (for Simple Entity)

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

### Pattern 6: Add SweetAlert2 Delete Confirmation

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

### Pattern 7: Move Action Column to Front

```
Before (Action column at back):
┌──────────┬──────────┬──────────┬──────────┐
│ Column 1 │ Column 2 │ Column 3 │ Actions  │
└──────────┴──────────┴──────────┴──────────┘

After (Action column at front):
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
❌ Mockup not found for page "xxx"

📁 Available mockups:
   • login.mockup.md
   • dashboard.mockup.md
   • user-list.mockup.md

💡 Options:
   • Create new? → /create-mockup xxx
   • View all? → /list-mockups
```

**Unclear change request:**
```
⚠️ Unclear what changes are needed

📝 Please specify more details:
   1. Which component to add/remove/edit?
   2. How should the layout change?
   3. What interaction to add?

💡 Examples:
   • /edit-mockup login - add Google Login button
   • /edit-mockup dashboard - change to 3 columns
   • /edit-mockup form - add validation messages
```

> 💬 **Note**: This command responds in Thai (คำสั่งนี้จะตอบกลับเป็นภาษาไทย)
