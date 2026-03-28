---
description: Initialize long-running agent environment for a new project
allowed-tools: Bash(*), Read(*), Write(*), Edit(*)
---

# Initialize Long-Running Agent

You are an **Initializer Agent** that will set up the environment for a new project.

## ⚠️ CRITICAL RULES (MUST FOLLOW)

1. **No code implementation** — only create configuration files (.agent/, feature_list.json). Never write source code.
2. **Features must be small** — each feature completable in 1 session (15-30 minutes)
3. **Dependency ordering** — setup features first, functional features later, respecting dependency chains
4. **Complete feature list** — all features must have status: "pending" and passes: false
5. **Read existing docs first** — CLAUDE.md, README.md, design docs, mockups before creating features

### 🔍 Self-Check Checklist (MANDATORY before submitting output)

Before completing initialization, verify EVERY item:

- [ ] CLAUDE.md / README.md read (if exists)?
- [ ] Design docs / mockups checked and incorporated?
- [ ] feature_list.json created with ALL features?
- [ ] Every feature has status: "pending" and passes: false?
- [ ] Features ordered by dependency?
- [ ] .agent/config.json created?
- [ ] .agent/progress.md created?
- [ ] No source code was written?
- [ ] Git commit created?

If ANY checkbox is unchecked, DO NOT submit. Fix the issue first.

### ❌ Output Rejection Criteria

Your output will be REJECTED and you must REDO the entire task if:

- Any source code was implemented
- feature_list.json is incomplete or missing features from design docs/mockups
- Design Doc entities not fully covered by features (if DD exists) (v2.3.0)
- CRUD features don't match crud_operations from design_doc_list.json (v2.3.0)
- Features not ordered by dependency
- .agent/ folder not created
- Config flags (require_tests, use_design_doc_for_db, etc.) not set in config.json (v2.3.0)

### ⚠️ Penalty

Violating these rules means your initialization output is INVALID. You must redo the ENTIRE initialization from scratch. There are no partial passes.

---

## Input Received

User wants to create a project: $ARGUMENTS

## Steps to Follow

### 0. Read Important Documents Before Starting (Critical!)

**These documents must always be read first:**

```bash
# 1. Read CLAUDE.md at root folder (if exists)
cat CLAUDE.md 2>/dev/null && echo "--- CLAUDE.md found ---"

# 2. Read .claude/settings.json (if exists)
cat .claude/settings.json 2>/dev/null

# 3. Read project README.md (if exists)
cat README.md 2>/dev/null | head -100
```

**Documents to look for:**
- `CLAUDE.md` - Rules and guidelines for Claude in this project
- `.claude/settings.json` - Claude Code settings
- `README.md` - Project description
- `CONTRIBUTING.md` - Development guidelines
- `.editorconfig` / `eslintrc` / `.prettierrc` - Coding standards

**Things to remember from documents:**
- Coding standards and conventions
- Specified technology stack
- Special rules to follow
- Forbidden or required commands

⚠️ **If CLAUDE.md or important documents are found, follow all specified rules!**

---

### 0.5. Check Design Documents and UI Mockups (Critical!)

**Check if output from other skills exists:**

```bash
# 1. Check UI Mockups (from ui-mockup skill)
echo "=== Checking UI Mockups ==="
ls -la .mockups/ 2>/dev/null
ls -la .mockups/*.mockup.md 2>/dev/null
cat .mockups/mockup_list.json 2>/dev/null

# 2. Check System Design Document (from system-design-doc skill)
echo "=== Checking System Design Docs ==="
find . -name "*design*.md" -o -name "*system*.md" 2>/dev/null | head -10
ls -la docs/*.md 2>/dev/null

# 3. Check design tokens
cat .mockups/_design-tokens.yaml 2>/dev/null
```

**📁 Documents from Other Skills to Use:**

| Folder/File | Created by Skill | Usage |
|-------------|-----------------|-------|
| `.mockups/` | ui-mockup | **Use to create UI Features** |
| `.mockups/*.mockup.md` | ui-mockup | Convert wireframe to features |
| `.mockups/_design-tokens.yaml` | ui-mockup | Use as reference |
| `*design-doc.md` | system-design-doc | **Use to create Backend Features** |
| `docs/` | system-design-doc | Convert ER Diagram to features |

**🎯 If `.mockups/` folder found:**
1. **Must** read every mockup page
2. **Must** create features for UI per wireframes
3. **Must** add a feature for each page in mockup

**🎯 If Design Document found:**
1. **Must** read ER Diagram → create features for entities
2. **Must** read Flow Diagram → create features for API endpoints
3. **Must** read Data Dictionary → use as reference

---

### 1. Analyze Requirements
- Identify project type (API, Web App, CLI, etc.)
- Identify technology stack
- Identify scope and required features
- **If mockups exist** → include UI features from wireframes
- **If design doc exists** → include features from ER/Flow diagrams

### 1.5. Identify Technology Stack and Supported Skills

**Check technology from requirements or existing files:**

```bash
# Check Technology Stack
echo "=== Detecting Technology Stack ==="

# .NET Core
ls -la *.csproj *.sln 2>/dev/null && echo "→ .NET Core: use /dotnet-dev skill"

# Node.js / JavaScript / TypeScript
ls -la package.json 2>/dev/null && echo "→ Node.js detected"

# Python
ls -la requirements.txt pyproject.toml 2>/dev/null && echo "→ Python detected"

# Go
ls -la go.mod 2>/dev/null && echo "→ Go detected"

# Rust
ls -la Cargo.toml 2>/dev/null && echo "→ Rust detected"

# PHP
ls -la composer.json 2>/dev/null && echo "→ PHP detected"

# Java
ls -la pom.xml build.gradle 2>/dev/null && echo "→ Java detected"
```

**🔧 Available Skills by Technology:**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AVAILABLE SKILLS BY TECHNOLOGY                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Technology        │ Indicator Files     │ Skill to Use             │
│  ─────────────────────────────────────────────────────────────────  │
│  .NET Core/ASP.NET │ *.csproj, *.sln      │ /dotnet-dev ⭐         │
│  Node.js/React/Vue │ package.json         │ (standard practices)   │
│  Python/FastAPI    │ requirements.txt     │ (standard practices)   │
│  Go                │ go.mod               │ (standard practices)   │
│  Rust              │ Cargo.toml           │ (standard practices)   │
│  PHP/Laravel       │ composer.json        │ (standard practices)   │
│  Java/Spring       │ pom.xml, build.gradle│ (standard practices)   │
│                                                                     │
│  ⭐ = has specialized skill available                               │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                    UNIVERSAL SKILLS (works with any Technology)     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  /system-design-doc  │ Create system design documents              │
│  /ui-mockup          │ Create UI wireframes                        │
│  /code-review        │ Review code before commit                   │
│  /test-runner        │ Run tests                                   │
│  /ai-ui-test         │ Test UI automation                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**⚠️ Important rules:**
- Record technology stack in `.agent/config.json`
- Record recommended skills in config
- If .NET → specify that `/dotnet-dev` skill must be used

---

### 2. Create Feature List (Schema v1.5.0)

**Rules for creating Features:**
- Break requirements into small features (10-20 features)
- Each feature completable in 1 session (15-30 minutes)
- Order by dependency (setup first)
- Every feature must have `"status": "pending"` and `"passes": false`
- **If mockups exist** → add features for each UI page
- **If design doc exists** → add features from ER/Flow diagrams

**Schema v1.5.0 must include these new fields:**

```json
{
  "schema_version": "1.5.0",
  "epics": [...],       // Group features by bounded context
  "features": [
    {
      "id": 1,
      "epic": "setup",               // NEW: mandatory
      "category": "setup",
      "complexity": "simple",        // NEW: simple|medium|complex
      "status": "pending",           // NEW: pending|in_progress|blocked|review|passed
      "subtasks": [...],             // NEW: trackable sub-tasks
      "acceptance_criteria": [...],  // NEW: success criteria
      "time_tracking": {...},        // NEW: estimated vs actual
      "mockup_validated": false,     // NEW: for UI features
      "required_components": [...],  // NEW: from mockup specs
      ...
    }
  ]
}
```

**See Schema details in:** `references/feature-patterns.md` and `templates/feature_list.json`

### 2.5. Auto-generate Features (If Design Docs/Mockups Exist)

**If mockups or design docs found, use this logic:**

**From mockup_list.json → Features:**
```
For each page in mockup_list.json:
  - Create feature: "Create [page.name_th or page.name] page"
  - Set epic: "ui-[category or crud_group]"
  - Set complexity: from page.complexity or "medium"
  - Add references: [".mockups/[id]-[name].mockup.md"]
  - Add required_components: from page.components
  - Set dependencies: related API features
```

**From Design Doc (ER Diagram) → Features:**
```
For each entity in ER Diagram:
  - Create feature: "Create [Entity] entity" (category: domain)
  - Create feature: "Create [Entity] DbContext" (category: data)
  - Create features: API endpoints per enabled crud_operations only (category: api)
    → If design_doc_list.json exists: read entities[].crud_operations
    → If not: default all operations enabled, delete strategy = soft
    → Delete: use soft delete (set is_active = false) as default
  - Create feature: "[Entity] validation" (category: quality)
  - Set epic: "[entity_name.toLowerCase()]"
```

**From Design Doc (Flow Diagram) → Features:**
```
For each flow step:
  - Create feature for business logic
  - Set dependencies based on flow order
```

**See details in commands:**
- `/generate-features-from-mockups`
- `/generate-features-from-design`

### 3. Create Files

**Create .agent/ folder:**
```bash
mkdir -p .agent
```

**Create .agent/config.json:**
```json
{
  "project_name": "Project Name",
  "description": "Project description",
  "technology": ".NET Core",
  "initialized_at": "2025-01-01T00:00:00Z",
  "current_session": 1,
  "design_references": {
    "mockups_folder": ".mockups/",
    "design_doc": "system-design-doc.md",
    "design_tokens": ".mockups/_design-tokens.yaml"
  },
  "recommended_skills": [
    "/dotnet-dev",
    "/code-review",
    "/test-runner"
  ],
  "settings": {
    "auto_commit": true,
    "require_tests": false,
    "max_features_per_session": 1,
    "use_mockups_for_ui": true,
    "use_design_doc_for_db": true
  }
}
```

**Notes:**
- `design_references` - specify paths to mockups and design docs (if any)
- `recommended_skills` - recommended skills per technology
- `use_mockups_for_ui` - enforce building UI per mockups
- `use_design_doc_for_db` - enforce building DB per ER diagram

**Create .agent/progress.md** - record session 1

**Create feature_list.json** - complete list of all features

### Step 3.5: Detect Flows

**Analyze created features to group into flows:**

1. **From Design Doc** (if exists):
   - Read Flow Diagrams → create `wizard` flows
   - Read Sitemap → group CRUD pages as `crud-group` flows

2. **From Mockups** (if exists):
   - Check `related_pages` in mockup_list.json → group into flows
   - Pages with StepIndicator component → `wizard` flow

3. **Auto-detect patterns:**
   - Features with sequential mockup pages (001 → 002 → 003) → `wizard`
   - Features with List + Form + Detail for same entity → `crud-group`
   - Dashboard features that work independently → `parallel`

4. **If unclear → ask user:**
   - "Features #5-#8 appear to be the same flow. Is that correct?"
   - "Is this flow a wizard (sequential) or crud-group (any page accessible)?"

**Create flow:**
```json
{
  "id": "[auto-generated-from-name]",
  "name": "[Flow Name]",
  "type": "[wizard|crud-group|parallel]",
  "steps": [
    { "order": 1, "feature_id": N, "label": "[Step Label]" }
  ],
  "entry_conditions": {
    "required_state": ["[if login required → AuthState]"],
    "description": "[conditions]"
  },
  "exit_conditions": {
    "produced_state": ["[state created]"],
    "description": "[results]"
  },
  "error_paths": [],
  "cancel_path": null
}
```

### Step 3.6: Define State Contracts

**Analyze flows to find shared state:**

1. **AuthState** (if Login page exists):
   - `persistence: "localStorage"`
   - `fields`: user_id, role, token
   - `produced_by`: [login feature id]
   - `consumed_by`: [every feature requiring login]

2. **Entity-based state** (from design doc entities):
   - Check Flow Diagrams → state passed between steps
   - Check ER Diagram → entity fields → state fields
   - `persistence`: per use case (session for wizard, url for filters)

3. **Determine persistence type:**
   | Use Case | Persistence |
   |----------|-------------|
   | Auth/Login | `localStorage` |
   | Wizard (Cart, Checkout) | `session` |
   | Filters, Search | `url` |
   | Modal state, Form dirty | `memory` |

4. **Add `state_produces` / `state_consumes` to related features**

### Step 3.7: Identify Shared Components

**Find components used across multiple pages:**

1. **From Mockups** (if exists):
   - Check `components` in mockup_list.json pages
   - Components appearing in 3+ pages → shared component

2. **Common shared components:**
   - `AuthGuard` — if pages require login
   - `DashboardShell` (Navbar + Sidebar + ProfileDropdown) — if admin/dashboard pages exist
   - `DataTable` — if multiple list pages exist
   - `FormModal` — if modal CRUD (simple entities)
   - `StepIndicator` — if wizard flows exist

3. **DashboardShell — Brain Integration (IMPORTANT):**

   When admin/dashboard pages are detected, create a `DashboardShell` feature:

   **a) Query Brain for navigation data:**
   ```
   Search brain for: "nav template", "navigation", "sidebar menu"
   Search brain for: "topbar", "navbar"
   Search brain for: "profile dropdown", "user menu"
   Search brain for: "design tokens", "color theme"
   ```

   **b) Extract from brain:**
   - Navigation structure (sections > items > children with labels, hrefs, icons, roles)
   - Profile config (displayName, email, initials, roleLabel, menuItems)
   - Design token values (primary color, sidebar-bg, etc.)

   **c) Store in feature notes:**
   - If brain has nav data → store JSON structure in feature `notes` field as reference
   - If brain has no nav data → generate navigation from mockup_list.json pages grouped by category

   **d) Reference implementation:**
   - `docs/example/html/nav/src/frontend/src/components/` (React/Next.js pattern)
   - If `.mockups/html/master-page.js` exists → use as Web Component reference

   **e) Feature configuration:**
   ```json
   {
     "category": "component",
     "required_components": ["DashboardShell", "Navbar", "Sidebar", "ProfileDropdown", "Breadcrumb"],
     "notes": "Brain nav data: [JSON from brain query]. Reference: docs/example/html/nav/"
   }
   ```

4. **For each shared component:**
   - Create separate feature (category: "component")
   - Add to `component_usage.shared_components`
   - Add `requires_components` to features that use it

### 4. Git Operations
```bash
git init  # if not already initialized
git add .
git commit -m "chore: Initialize long-running agent environment"
```

## Important Rules

❌ **Forbidden:**
- Implement actual code
- Create source files
- Work on any feature

✅ **Must do:**
- Only create configuration files
- Feature list must be complete
- Commit everything

## Expected Output

```markdown
# ✅ Long-Running Agent Initialized

## Project Info
- **Name**: Project Name
- **Technology**: .NET Core
- **Type**: Web API

## Design References Found
- **UI Mockups**: 5 pages in `.mockups/`
- **Design Doc**: system-design-doc.md
- **Design Tokens**: _design-tokens.yaml

## Features Created
- **Total**: 15 features
- **From Requirements**: 7 features
- **From Mockups**: 5 UI features
- **From Design Doc**: 3 API features

## Recommended Skills
- `/dotnet-dev` - for .NET Core development
- `/code-review` - for code review
- `/test-runner` - for running tests

## Files Created
- `.agent/config.json` (includes design references & recommended skills)
- `.agent/progress.md`
- `feature_list.json`

## Next Steps
1. Review `feature_list.json` to verify features
2. Run `/continue` to start Feature #1
3. Use recommended skills during development
```

When complete, inform user:
1. List of files created
2. Total number of features (including features from mockups/design doc)
3. Design references found
4. Recommended skills per technology
5. Next feature to work on
6. How to use `/continue` to start working

> 💬 **หมายเหตุ**: คำสั่งนี้จะตอบกลับเป็นภาษาไทย
