---
description: Create multiple UI Mockups simultaneously using Sub Agents
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Task(*)
---

# Create Mockups Parallel Command

Create multiple UI Mockups simultaneously using Sub Agents.

## Received Input

User wants to create mockups: $ARGUMENTS

**Input formats:**
```
/create-mockups-parallel [page1], [page2], [page3], ...
/create-mockups-parallel --all                    # Create all pending pages
/create-mockups-parallel --priority high          # Only high priority
/create-mockups-parallel --category auth          # Only specific category
/create-mockups-parallel --entity User            # Create CRUD pages for entity
/create-mockups-parallel --entities User,Product  # Create CRUD pages for multiple entities
/create-mockups-parallel from system-design-doc.md
```

**Examples:**
```
/create-mockups-parallel Login, Dashboard, User List, User Form
/create-mockups-parallel --all
/create-mockups-parallel --priority high
/create-mockups-parallel --entity User
/create-mockups-parallel from system-design.md
```

## Steps to Follow

### Step 0: Check and Read mockup_list.json (Very Important!)

```bash
# Check if mockup_list.json exists
cat .mockups/mockup_list.json 2>/dev/null
```

**If mockup_list.json exists:**

1. **--all flag**: Create all pages with status = "pending"
   ```json
   // filter pages where status == "pending"
   ```

2. **--priority [level] flag**: Create only the specified priority
   ```json
   // filter pages where priority == "high" AND status == "pending"
   ```

3. **--category [cat] flag**: Create only the specified category
   ```json
   // filter pages where category == "auth" AND status == "pending"
   ```

4. **--entity [name] flag**: Create CRUD pages for the entity
   ```json
   // find entity in entities array, get all page IDs
   // For complex entity: List + Form + Detail (3 pages)
   // For simple entity: List only (1 page with modals)
   ```

5. **Specified page names**: Use data from json
   ```json
   // find page by name, use url, access, components, crud_group, complexity, ui_pattern, etc.
   ```

**If mockup_list.json does not exist:**
```
⚠️ mockup_list.json not found

💡 Suggestion:
   /init-mockup → Create mockup list from project documents

   Or specify pages directly:
   /create-mockups-parallel Login, Dashboard, User List
```

**Example output when mockup_list.json exists:**
```
📋 Pages to create (from mockup_list.json):

   ┌─────┬────────────────────┬─────────────────┬──────────┬──────────────┬────────────┐
   │  #  │ Page Name          │ URL             │ Priority │ CRUD Group   │ UI Pattern │
   ├─────┼────────────────────┼─────────────────┼──────────┼──────────────┼────────────┤
   │  1  │ Login              │ /auth/login     │ high     │ -            │ -          │
   │  2  │ User List          │ /admin/users    │ medium   │ User (list)  │ page       │
   │  3  │ User Form          │ /admin/users/new│ medium   │ User (form)  │ page       │
   │  4  │ Department List    │ /admin/depts    │ low      │ Department   │ modal      │
   └─────┴────────────────────┴─────────────────┴──────────┴──────────────┴────────────┘

   🚀 Spawning 4 sub-agents in parallel...
```

**Example output when using --entity:**
```
📋 Creating CRUD pages for entity: User

   Entity: User
   Complexity: complex
   UI Pattern: page

   ┌─────┬────────────────────┬─────────────────┬────────────┐
   │ ID  │ Page Name          │ URL             │ CRUD Type  │
   ├─────┼────────────────────┼─────────────────┼────────────┤
   │ 004 │ User List          │ /admin/users    │ list       │
   │ 005 │ User Form          │ /admin/users/new│ form       │
   │ 006 │ User Detail        │ /admin/users/:id│ detail     │
   └─────┴────────────────────┴─────────────────┴────────────┘

   🚀 Spawning 3 sub-agents in parallel...
```

### Step 1: Read UI Mockup Knowledge Base

**Must read these files before spawning sub agents:**

```bash
# 1. Read SKILL.md
cat ${CLAUDE_PLUGIN_ROOT}/skills/ui-mockup/SKILL.md

# 2. Read template
cat ${CLAUDE_PLUGIN_ROOT}/skills/ui-mockup/templates/mockup-template.md

# 3. Read ASCII patterns
cat ${CLAUDE_PLUGIN_ROOT}/skills/ui-mockup/references/ascii-patterns.md
```

### Step 2: Prepare Mockup Knowledge for Sub Agents

**Create a knowledge block to send to all sub agents:**

```markdown
## UI Mockup Knowledge

### Layout Patterns

Dashboard Layout:
┌────────────────────────────────────────────────────────────────────┐
│  [Logo]              Search [________]           [User ▼] [Notif]  │
├────────┬───────────────────────────────────────────────────────────┤
│        │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│  Menu  │  │  Card 1 │ │  Card 2 │ │  Card 3 │ │  Card 4 │         │
│        │  └─────────┘ └─────────┘ └─────────┘ └─────────┘         │
│  ────  │  ┌─────────────────────────────────────────────────────┐  │
│  Item1 │  │                     CHART                           │  │
│  Item2 │  └─────────────────────────────────────────────────────┘  │
│  Item3 │  ┌─────────────────────────────────────────────────────┐  │
│        │  │  Table                                              │  │
│        │  └─────────────────────────────────────────────────────┘  │
└────────┴───────────────────────────────────────────────────────────┘

Login Layout:
┌────────────────────────────────────────────────────────────────────┐
│                    ┌─────────────────────────┐                     │
│                    │    [LOGO]               │                     │
│                    │   ┌─────────────────┐   │                     │
│                    │   │ Email           │   │                     │
│                    │   └─────────────────┘   │                     │
│                    │   ┌─────────────────┐   │                     │
│                    │   │ Password        │   │                     │
│                    │   └─────────────────┘   │                     │
│                    │   ┌─────────────────┐   │                     │
│                    │   │    [LOGIN]      │   │                     │
│                    │   └─────────────────┘   │                     │
│                    └─────────────────────────┘                     │
└────────────────────────────────────────────────────────────────────┘

Form Layout:
┌────────────────────────────────────────────────────────────────────┐
│   ┌────────────────────────────────────────────────────────────┐   │
│   │                        FORM CARD                           │   │
│   │   Label 1                                                  │   │
│   │   ┌────────────────────────────────────────────────────┐   │   │
│   │   │ Input field                                        │   │   │
│   │   └────────────────────────────────────────────────────┘   │   │
│   │   Label 2                                                  │   │
│   │   ┌────────────────────────────────────────────────────┐   │   │
│   │   │ Input field                                        │   │   │
│   │   └────────────────────────────────────────────────────┘   │   │
│   │   ┌────────────────────┐  ┌────────────────────────────┐   │   │
│   │   │     [Cancel]       │  │      [Submit]              │   │   │
│   │   └────────────────────┘  └────────────────────────────┘   │   │
│   └────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘

List/Table Layout:
┌────────────────────────────────────────────────────────────────────┐
│  [Page Title]                           [+ Add New] [Filter ▼]     │
│  Search: [________________________] [🔍]                           │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ ☐ │ Column 1    │ Column 2     │ Column 3   │ Actions     │   │
│  ├────────────────────────────────────────────────────────────┤   │
│  │ ☐ │ Data 1      │ Data 2       │ Status ●   │ [✏️] [🗑️]  │   │
│  │ ☐ │ Data 1      │ Data 2       │ Status ●   │ [✏️] [🗑️]  │   │
│  └────────────────────────────────────────────────────────────┘   │
│  [◀ Prev]  [1] [2] [3] ... [10]  [Next ▶]                        │
└────────────────────────────────────────────────────────────────────┘

### Component Symbols
- Input: ┌────────────┐ │ text │ └────────────┘
- Button: [Button Text]
- Checkbox: ☐ unchecked, ☑ checked
- Radio: ○ unselected, ● selected
- Dropdown: [Select ▼]
- Status: ● active, ○ inactive

### Design Tokens
- Primary: #0ea5e9
- Background: #fafafa
- Border: #e5e5e5
- Text: #171717
- Spacing: 4px, 8px, 16px, 24px, 32px
```

### Step 3: Create .mockups folder

```bash
mkdir -p .mockups
```

### Step 4: Parse Page List

**Extract pages from input:**
- If a list: `Login, Dashboard, User List` → `["Login", "Dashboard", "User List"]`
- If from design doc: Read the Sitemap section and extract pages

> **Split layout:** if `.design-docs/design_doc_list.json` has `documents[].doc_layout:"split"`, resolve sections via `documents[].sections[]` (sitemap → `<doc_dir>/09-sitemap.md`, entities → `entities[]` / `07-er-diagram.md`) instead of a top-level `system-design.md`. Prefer `entities[]` from the registry for CRUD page generation.

### Step 4.5: Resolve design doc sources to absolute paths (orchestrator — resolve-then-inject)

> Follow `skills/ui-mockup/references/reading-design-docs.md` (registry-first, split-aware).

The orchestrator (this main session) resolves design-doc sources **once** and injects pre-resolved
**absolute paths** into each sub-agent prompt. Sub-agents MUST NOT re-resolve the registry themselves.

```bash
REG=.design-docs/design_doc_list.json
DOC_DIR=$(jq -r '.documents[0].doc_dir // empty' "$REG" 2>/dev/null)
SITEMAP=$(jq -r '.documents[0].sections[]|select(.key=="sitemap")|.file' "$REG" 2>/dev/null)
ER=$(jq -r '.documents[0].sections[]|select(.key=="er-diagram")|.file' "$REG" 2>/dev/null)
DATADICT=$(jq -r '.documents[0].sections[]|select(.key=="data-dictionary")|.file' "$REG" 2>/dev/null)
# Resolve each non-empty result to an absolute path (prefix the repo's .design-docs/ root) for injection.
```

For each page, build the design-sources block shown in the prompt templates below (see
`## Design Doc Sources` heading) with the absolute paths + the relevant `entities[]` JSON slice for that page/entity.
If no registry exists, set every value to `n/a` and omit the entities slice.

### Step 5: Spawn Sub Agents in Parallel

**Use the Task tool multiple times in the same message:**

For each page, spawn a sub agent with this prompt:

```
You are a UI Mockup Designer

## Task
Create a UI Mockup for the page: [PAGE_NAME]

## Page Requirements
[Insert requirements for this page]

## UI Mockup Knowledge
[Insert knowledge block from Step 2]

## Design Doc Sources (pre-resolved — DO NOT re-resolve)
- sitemap:         [ABS_SITEMAP or n/a]
- er-diagram:      [ABS_ER or n/a]
- data-dictionary: [ABS_DATADICT or n/a]
- entities:        [inline JSON slice from registry entities[] for this page/entity, or n/a]

## Output Format
Create file .mockups/[page-name].mockup.md using this format:

# [Page Name] - UI Mockup

**Version**: 1.0.0
**Created**: [DATE]
**Status**: Draft

## Page Info
| Property | Value |
|----------|-------|
| Page ID | SCR-XXX |
| Page Name | [Page name] |
| URL | /path |
| Access | [Roles] |

## Wireframe

### Desktop View
```
[ASCII wireframe]
```

### Mobile View
```
[ASCII wireframe]
```

## Components Used
| Component | Location | Props |
|-----------|----------|-------|

## Interactions
| Trigger | Action | Result |
|---------|--------|--------|

## Important Rules
1. Use ASCII art for wireframes
2. Specify all components and interactions
3. Must include both Desktop and Mobile views
4. Save file at .mockups/[page-name].mockup.md
```

### Step 6: Wait for Results and Aggregate

**Wait for sub agents to finish, then show summary:**

```
✅ สร้าง Mockups สำเร็จ! (4 หน้า)

📁 Files created:
   • .mockups/login.mockup.md          ✅
   • .mockups/dashboard.mockup.md      ✅
   • .mockups/user-list.mockup.md      ✅
   • .mockups/user-form.mockup.md      ✅

📊 Summary:
   • Total pages: 4
   • Components used: 32
   • Interactions defined: 15

💡 Next steps:
   • /edit-mockup [page] - [changes]  → แก้ไข mockup
   • /list-mockups                    → ดูรายการทั้งหมด
   • /frontend-design [page]          → Generate code
```

---

## Example: Spawn 4 Sub Agents

When user runs:
```
/create-mockups-parallel Login, Dashboard, User List, User Form
```

**Main session must:**

1. Read SKILL.md and templates
2. Create .mockups folder
3. Spawn 4 sub agents simultaneously in a single message:

```
Task tool call 1:
  subagent_type: "general-purpose"
  prompt: "Create mockup for Login page... [knowledge block]"
  run_in_background: true

Task tool call 2:
  subagent_type: "general-purpose"
  prompt: "Create mockup for Dashboard page... [knowledge block]"
  run_in_background: true

Task tool call 3:
  subagent_type: "general-purpose"
  prompt: "Create mockup for User List page... [knowledge block]"
  run_in_background: true

Task tool call 4:
  subagent_type: "general-purpose"
  prompt: "Create mockup for User Form page... [knowledge block]"
  run_in_background: true
```

4. Wait for results with TaskOutput
5. Aggregate and show summary

---

## Sub Agent Prompt Template

```markdown
# UI Mockup Designer Agent

You are a UI Mockup Designer specializing in creating ASCII wireframes.

## ⚠️ CRITICAL RULES (MUST FOLLOW)

1. **ALL 3 breakpoint wireframes mandatory** — Desktop (12col), Tablet (8col), Mobile (4col) with actual ASCII art
2. **No placeholder text** — "[wireframe here]", "[TBD]", "to be added" is FORBIDDEN
3. **Action column first** — in data tables, action column (👁 ✏️ 🗑) must be the leftmost column
4. **Include Design Tokens Used section** — must list colors, typography, spacing tokens
5. **Include Components Used table** — must list all components with location and props
6. **Match CRUD complexity** — simple entities use modal, complex entities use separate pages
7. **SweetAlert2 for delete** — use SweetAlert2 for all delete confirmations (default). Override only if CLAUDE.md specifies a different library. Never use browser native popups.

### 🔍 Self-Check (MANDATORY before finishing)

- [ ] Desktop wireframe has actual ASCII art (not placeholder)?
- [ ] Tablet wireframe has actual ASCII art (not placeholder)?
- [ ] Mobile wireframe has actual ASCII art (not placeholder)?
- [ ] Design Tokens Used section present?
- [ ] Components Used table present?
- [ ] Action column is first in data tables?

If ANY breakpoint wireframe is missing, your output will be REJECTED.

### ⚠️ Penalty

Violating these rules means your output is INVALID and will be REJECTED entirely. You must redo from scratch.

---

## Design Doc Sources (pre-resolved — DO NOT re-resolve)
- sitemap:         {{ABS_SITEMAP|n/a}}
- er-diagram:      {{ABS_ER|n/a}}
- data-dictionary: {{ABS_DATADICT|n/a}}
- entities:        {{ENTITIES_JSON|n/a}}

These paths are already resolved by the orchestrator. Read them directly if you need design content.
Do NOT open design_doc_list.json yourself.

## Task
Create a UI Mockup for the page: **{{PAGE_NAME}}**

## Page Description
{{PAGE_DESCRIPTION}}

## Requirements
{{PAGE_REQUIREMENTS}}

---

## UI Mockup Knowledge Base

### ASCII Wireframe Symbols

```
Box:         ┌───────┐ │ content │ └───────┘
Input:       ┌────────────────────┐ │ placeholder │ └────────────────────┘
Button:      [Button Text]
Checkbox:    ☐ unchecked  ☑ checked
Radio:       ○ unselected  ● selected
Dropdown:    [Select option ▼]
Toggle:      [○────] off  [────●] on
Status:      ● active  ○ inactive  ◐ pending
Icons:       🔍 ✏️ 🗑️ + ×
Arrows:      ← → ↑ ↓ ▼ ▸
```

### Common Layouts

**Login/Auth Layout:**
```
┌────────────────────────────────────────────────────────────────────┐
│                         ┌──────────────┐                           │
│                         │    [LOGO]    │                           │
│                         └──────────────┘                           │
│                    ┌─────────────────────────┐                     │
│                    │      Form Title         │                     │
│                    │   ┌─────────────────┐   │                     │
│                    │   │ Input           │   │                     │
│                    │   └─────────────────┘   │                     │
│                    │   ┌─────────────────┐   │                     │
│                    │   │    [Button]     │   │                     │
│                    │   └─────────────────┘   │                     │
│                    └─────────────────────────┘                     │
└────────────────────────────────────────────────────────────────────┘
```

**Dashboard Layout:**
```
┌────────────────────────────────────────────────────────────────────┐
│  [Logo]              Search [________]           [User ▼] [🔔]    │
├────────┬───────────────────────────────────────────────────────────┤
│  Menu  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│        │  │  Card   │ │  Card   │ │  Card   │ │  Card   │         │
│  ────  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘         │
│  Item1 │  ┌─────────────────────────────────────────────────────┐  │
│  Item2 │  │                     CHART                           │  │
│  Item3 │  └─────────────────────────────────────────────────────┘  │
│        │  ┌─────────────────────────────────────────────────────┐  │
│        │  │  Table with data                                    │  │
│        │  └─────────────────────────────────────────────────────┘  │
└────────┴───────────────────────────────────────────────────────────┘
```

**List/Table Layout:**
```
┌────────────────────────────────────────────────────────────────────┐
│  [Page Title]                           [+ Add New] [Filter ▼]     │
├────────────────────────────────────────────────────────────────────┤
│  Search: [________________________] [🔍]    Showing 1-10 of 100   │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ ☐ │ Column 1    │ Column 2     │ Status     │ Actions     │   │
│  ├────────────────────────────────────────────────────────────┤   │
│  │ ☐ │ Data        │ Data         │ ● Active   │ [✏️] [🗑️]  │   │
│  │ ☐ │ Data        │ Data         │ ○ Draft    │ [✏️] [🗑️]  │   │
│  └────────────────────────────────────────────────────────────┘   │
│  [◀ Prev]  [1] [2] [3] ... [10]  [Next ▶]                        │
└────────────────────────────────────────────────────────────────────┘
```

**Form Layout:**
```
┌────────────────────────────────────────────────────────────────────┐
│                         [Page Title]                               │
├────────────────────────────────────────────────────────────────────┤
│   ┌────────────────────────────────────────────────────────────┐   │
│   │   Label                                                    │   │
│   │   ┌────────────────────────────────────────────────────┐   │   │
│   │   │ Input                                              │   │   │
│   │   └────────────────────────────────────────────────────┘   │   │
│   │                                                            │   │
│   │   Label                                                    │   │
│   │   ┌────────────────────────────────────────────────────┐   │   │
│   │   │ Input                                              │   │   │
│   │   └────────────────────────────────────────────────────┘   │   │
│   │                                                            │   │
│   │   ┌────────────────────┐  ┌────────────────────────────┐   │   │
│   │   │     [Cancel]       │  │      [Submit]              │   │   │
│   │   └────────────────────┘  └────────────────────────────┘   │   │
│   └────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘
```

---

## Output Instructions

1. Create .mockups folder (if it doesn't exist)
2. Create file .mockups/[NNN]-{{PAGE_SLUG}}.mockup.md (NNN = 3 digits from page ID)
3. Use the template below
4. For List pages: Action column must be at the front (leftmost)
5. Use SweetAlert2 for delete confirmation (default)

### File Content Template

```markdown
# {{PAGE_NAME}} - UI Mockup

**Version**: 1.0.0
**Created**: {{DATE}}
**Status**: Draft

---

## Page Info

| Property | Value |
|----------|-------|
| Page ID | [NNN] |
| Page Name | {{PAGE_NAME}} |
| URL | {{URL}} |
| Access | {{ACCESS_ROLES}} |
| CRUD Group | [Entity or N/A] |
| CRUD Type | [list / form / detail / N/A] |
| Complexity | [simple / complex / N/A] |
| UI Pattern | [modal / page / N/A] |
| Action Column | [first / last / N/A] |
| Alert Library | SweetAlert2 |

---

## Description

{{BRIEF_DESCRIPTION}}

---

## Wireframe

### Desktop View

```
{{DESKTOP_WIREFRAME}}
```

### Mobile View

```
{{MOBILE_WIREFRAME}}
```

---

## Components Used

| Component | Location | Props/Variants |
|-----------|----------|----------------|
{{COMPONENT_LIST}}

---

## Interactions

| Trigger | Action | Result |
|---------|--------|--------|
{{INTERACTION_LIST}}

---

## Design Tokens Used

- Primary Color: primary-500
- Background: neutral-50
- Text: neutral-900
- Spacing: 16px, 24px

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | {{DATE}} | Claude | Initial mockup |
```

## Important
- Must create the actual file at .mockups/[NNN]-{{PAGE_SLUG}}.mockup.md (NNN = 3 digits from page ID)
- Use Write tool to create the file
- ASCII wireframe must include both Desktop and Mobile
- Specify all components and interactions completely
- **For List pages**: Action column (👁 ✏️ 🗑) must be at the front (leftmost)
- **For Simple entities**: View/Create/Edit use Modal, Delete uses SweetAlert2
- **For Complex entities**: View/Create/Edit use separate pages, Delete uses SweetAlert2
```

---

## Error Handling

**If a sub agent fails:**
```
⚠️ Some mockups failed to create

✅ Succeeded:
   • login.mockup.md
   • dashboard.mockup.md

❌ Failed:
   • user-list.mockup.md - [error message]
   • user-form.mockup.md - [error message]

💡 Retry with:
   /create-mockup user-list
   /create-mockup user-form
```

---

## Step 7: Update mockup_list.json (after sub agents complete)

**After sub agents finish, update mockup_list.json:**

```bash
# Read mockup_list.json
cat .mockups/mockup_list.json
```

**Update status for all successfully created pages:**

```json
// For each successfully created page
{
  "id": "001",
  "name": "Login",
  "status": "completed",           // changed from pending
  "mockup_file": "001-login.mockup.md",
  "created_at": "2025-01-20T14:30:00Z",
  "notes": "Created by parallel agent"
}

// For List page of a simple entity
{
  "id": "010",
  "name": "Department List",
  "status": "completed",
  "mockup_file": "010-department-list.mockup.md",
  "created_at": "2025-01-20T14:30:00Z",
  "notes": "Created with modal pattern, action column first, SweetAlert2 for delete"
}
```

**Update summary:**
```json
{
  "summary": {
    "total": 10,
    "pending": 6,       // decreased by number of successfully created
    "in_progress": 0,
    "completed": 4,     // increased by number of successfully created
    "approved": 0
  },
  "last_updated": "2025-01-20T14:35:00Z"
}
```

**Example Final Output:**
```
✅ สร้าง Mockups สำเร็จ! (4/4 หน้า)

📁 Files created:
   • .mockups/login.mockup.md          ✅
   • .mockups/dashboard.mockup.md      ✅
   • .mockups/user-list.mockup.md      ✅
   • .mockups/user-form.mockup.md      ✅

📊 mockup_list.json updated:
   • Pending: 10 → 6
   • Completed: 0 → 4

📈 Progress: ████████░░░░░░░░░░░░ 40%

💡 Next steps:
   • /create-mockups-parallel --all  → สร้างที่เหลือ
   • /edit-mockup [page] - [changes] → แก้ไข
   • /list-mockups                   → ดูสถานะทั้งหมด
```

> 💬 **Note**: This command responds in Thai (คำสั่งนี้จะตอบกลับเป็นภาษาไทย)
