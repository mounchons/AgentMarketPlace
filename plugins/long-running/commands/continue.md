---
description: Continue from previous session - Coding Agent mode
allowed-tools: Bash(*), Read(*), Write(*), Edit(*)
---

# Continue - Coding Agent Mode

You are a **Coding Agent** that will continue from the previous session.

## ⚠️ CRITICAL RULES (MUST FOLLOW)

1. **Read CLAUDE.md + .agent/progress.md FIRST** — before any other action
2. **ONE feature per session** — never implement multiple features
3. **Run Verification Pipeline before marking pass** — ALL steps, not just "build success"
4. **Commit per feature** — use proper commit prefix (feat:, task:, review-fix:)
5. **Update progress.md before session end** — log what was done, verification results, next feature
6. **Leave code buildable** — project must compile/build when you finish

### 🔍 Self-Check Checklist (MANDATORY before submitting output)

Before completing your session, verify EVERY item:

- [ ] CLAUDE.md read at start?
- [ ] progress.md read at start?
- [ ] Only 1 feature implemented?
- [ ] **Verification Pipeline completed?** (v2.3.0)
  - [ ] Build: 0 errors?
  - [ ] Design Doc compliance: entities match DD? (if DD exists)
  - [ ] CRUD completeness: all C/R/U/D operations? (if CRUD feature)
  - [ ] API integration: no mock/hardcoded data? (if frontend feature)
  - [ ] Test coverage: minimum tests met? (not just build passes)
  - [ ] Tech stack: CLAUDE.md libraries used? (per phase)
  - [ ] Config flags enforced?
- [ ] progress.md updated with verification results?
- [ ] Code builds successfully?

If ANY checkbox is unchecked, DO NOT submit. Fix the issue first.

### ❌ Output Rejection Criteria

Your output will be REJECTED and you must REDO from scratch if:

- Multiple features implemented in one session
- Feature marked `passed` with only "build success" (no Verification Pipeline)
- Feature marked `passed` while using mock/hardcoded data
- Feature marked `passed` with incomplete CRUD
- Entities don't match Design Document (if DD exists)
- progress.md not updated
- Code left in non-buildable state
- Config flags (max_features_per_session, require_tests) ignored

### ⚠️ Penalty

Violation means your session output will be REJECTED and you must REDO from scratch.

---

## Steps to Follow (in order)

### Step 0: Read Important Documents Before Starting (Critical!)

**Every time a new session starts, these documents must be read:**

```bash
# 1. Read CLAUDE.md at root folder (if exists)
cat CLAUDE.md 2>/dev/null && echo "--- CLAUDE.md found, follow the rules specified ---"

# 2. Read .agent/project-rules.md (if exists - project-specific rules)
cat .agent/project-rules.md 2>/dev/null

# 3. Read README.md to understand the project
cat README.md 2>/dev/null | head -50
```

**Documents to look for and follow:**

| File | Meaning |
|------|---------|
| `CLAUDE.md` | Main rules for Claude - **must follow every rule** |
| `.agent/project-rules.md` | Project-specific rules |
| `CONTRIBUTING.md` | Development guidelines |
| `.editorconfig` | Coding style |

**Things to remember from documents:**
- ✅ Coding standards and naming conventions
- ✅ Commands that must be run before starting work
- ✅ Special rules to follow
- ✅ Things that are forbidden

⚠️ **Rules from CLAUDE.md have the highest priority — follow them before any other rules!**

---

### Step 0.5: Check Design Documents and UI Mockups (Critical!)

**Before starting feature development, check reference documents from other skills:**

```bash
# 1. Check System Design Document (from system-design-doc skill)
ls -la *.design-doc.md 2>/dev/null || ls -la docs/*.md 2>/dev/null
# Or search for design document
find . -name "*design*.md" -o -name "*system*.md" 2>/dev/null | head -10

# 2. Check UI Mockups (from ui-mockup skill)
ls -la .mockups/ 2>/dev/null
# List all mockups
ls -la .mockups/*.mockup.md 2>/dev/null

# 3. Check mockup_list.json (if exists)
cat .mockups/mockup_list.json 2>/dev/null
```

**📁 Reference Documents from Other Skills:**

| Folder/File | Created by Skill | Purpose |
|-------------|-----------------|---------|
| `.mockups/` | ui-mockup | **UI Structural Spec** — describes components, data flow, layout structure (not a visual blueprint) |
| `.mockups/*.mockup.md` | ui-mockup | Component specs + data requirements (ASCII wireframe is only a structural reference) |
| `.mockups/_design-tokens.yaml` | ui-mockup | Design tokens (colors, spacing, typography) |
| `*design-doc.md` | system-design-doc | **System Architecture** — ER Diagram, Flow, DFD |
| `docs/` | system-design-doc | System design documents |

**🎯 How to Use Reference Documents:**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    REFERENCE DOCUMENT USAGE                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  📐 UI Mockup (.mockups/) — Structural Reference only              │
│  ├── Read component specs → know what components are needed        │
│  ├── Read data requirements → know what data to display/receive    │
│  ├── Use design tokens for styling                                 │
│  └── **frontend-design has freedom in visual design!**             │
│                                                                     │
│  📄 System Design Doc                                               │
│  ├── See ER Diagram for database schema                            │
│  ├── Read Data Dictionary for field specifications                 │
│  ├── See Flow Diagram for business logic                           │
│  └── See API specs for endpoint implementation                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**⚠️ If `.mockups/` folder found:**
1. **Must** read mockup for the page being developed — to understand structural requirements
2. **Must** implement all components specified in component specs
3. **Must** display/receive all data per data requirements
4. **Must** use specified design tokens (colors, spacing, fonts)
5. **Free** to design visual, layout, animation, UX — does not need to match ASCII wireframe
6. If using `/frontend-design` skill → let the skill design visuals freely

**⚠️ If feature is DashboardShell / Navbar / Sidebar / Layout / ProfileDropdown:**

> These navigation/layout components MUST query brain for real project data before implementation.

1. **MUST** query brain BEFORE implementation:
   ```
   Search brain: "nav template", "navigation data", "sidebar menu"
   Search brain: "topbar", "navbar"
   Search brain: "profile dropdown", "user menu"
   Search brain: "design tokens", "color theme"
   ```

2. **Extract from brain:**
   - Navigation structure (sections > items > children with labels, hrefs, icons, roles)
   - Profile config (displayName, email, initials, roleLabel, menuItems, logoutLabel)
   - Icon set (SVG icons used in menu items)
   - Design token values (primary color, sidebar-bg, sidebar-active, etc.)

3. **Reference implementations:**
   - `docs/example/html/nav/src/frontend/src/components/` — React/Next.js components (sidebar.tsx, navbar.tsx, dashboard-shell.tsx, navigation-data.ts)
   - `.mockups/html/master-page.js` — Web Component pattern (if exists, from ui-mockup plugin)

4. **If brain has no nav data:**
   - Generate navigation from mockup_list.json pages grouped by category
   - Use default design tokens from component_library.json
   - Store generated nav structure in brain for future use

5. **Component hierarchy:**
   ```
   DashboardShell
   ├── Sidebar (navigationData, collapsed, mobileOpen, userRole, projectName)
   ├── Navbar (onToggleSidebar, breadcrumb, projectName, user, profileMenuItems)
   │   ├── Breadcrumb (items from pathname + navigationData)
   │   └── ProfileDropdown (displayName, initials, roleLabel, menuItems)
   └── Content (children)
   ```

6. **Nav Template Verification Checklist (from Brain):**

   > Source: Brain "Nav Template — Common Issues, Fixes & Verification Checklist"
   > These bugs occur EVERY TIME. Must verify after implementation.

   **Known Issues to Prevent:**
   - **Submenu indent**: submenu items MUST have more left offset than parent. Add `pl-4` to submenu `<ul>` wrapper
   - **Dots in collapsed mode**: `<li>` outside `<ul>` shows bullets. Use `list-none` on `<li>` or use `<div>` in flyout
   - **Active state overlap**: Do NOT use simple prefix match. Must check for "better match" (longer href) when nested routes exist

   **Must-Pass Checks:**
   - [ ] Submenu indent > parent indent
   - [ ] Collapsed sidebar: no dots/bullets next to icons
   - [ ] Active state: `/parent/child` highlights only child, not parent
   - [ ] Flyout position correct, no overflow
   - [ ] Mobile overlay closes on backdrop click
   - [ ] `<li>` only inside `<ul>`, flyout uses `<div>`
   - [ ] Section labels hidden when collapsed

**⚠️ If Design Document found:**
1. **Must** read ER Diagram before creating database
2. **Must** use Data Dictionary for field types
3. **Must** follow Flow Diagram for business logic

---

### Step 0.5.1: Read Flow Context (v2.0.0)

**If feature_list.json has `flows` or `state_contracts`:**

```bash
# Read flows
cat feature_list.json | jq '.flows[] | {id, name, type, steps: [.steps[].label]}'

# Read state contracts
cat feature_list.json | jq '.state_contracts | keys'

# View flow progress
cat feature_list.json | jq '.flows[] | {
  name,
  progress: ([.steps[] | select(.feature_id as $fid | $fid)] | length),
  total: (.steps | length)
}'
```

**Display Flow Summary:**

```
📊 Flow Progress:
  🛒 [Flow Name] ([type]): X/Y steps ✅
     ├── ✅ [Step 1] (Feature #N)
     ├── 🔲 [Step 2] (Feature #N) ← NEXT
     └── 🔲 [Step 3] (Feature #N)
     State: [StateA] ✅ → [StateB] ❌

  (display all flows)
```

**⚠️ Rules:**
- Must read flows before selecting a feature — understand the big picture
- If feature is in a flow → read entry/exit conditions and error_paths
- If feature has state_consumes → verify state has been produced

---

### Step 0.6: Check Technology Stack and Call Appropriate Skill

**Check what technology the project uses:**

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

# Check recommended skills from config
cat .agent/config.json 2>/dev/null | grep -A 5 "recommended_skills"
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

**⚠️ For .NET Core Projects:**

If `.csproj` or `.sln` files found → **must use `/dotnet-dev` skill** to:
- Use .NET best practices
- Create code following correct conventions
- Use appropriate EF Core patterns
- Handle dependency injection properly
- Use Microsoft Learn MCP for documentation

**⚠️ For other languages:**

If no specialized skill available → use best practices for that language and:
- Use `/code-review` for code review
- Use `/test-runner` for running tests
- Use `/ai-ui-test` for UI testing

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SKILL INTEGRATION FLOW                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Check Technology Stack                                            │
│      │                                                              │
│      ├── Found .csproj/.sln?                                       │
│      │       │                                                      │
│      │       ▼                                                      │
│      │   ┌─────────────────┐                                       │
│      │   │  /dotnet-dev    │ ← use .NET best practices             │
│      │   └─────────────────┘                                       │
│      │                                                              │
│      ├── Found package.json/go.mod/Cargo.toml/...?                 │
│      │       │                                                      │
│      │       ▼                                                      │
│      │   ┌─────────────────┐                                       │
│      │   │ Standard        │ ← use best practices for that lang    │
│      │   │ Practices       │                                       │
│      │   └─────────────────┘                                       │
│      │                                                              │
│      └── Universal Skills (always available)                       │
│              │                                                      │
│              ▼                                                      │
│          ┌─────────────────┐                                       │
│          │ /code-review    │ ← review before commit                │
│          │ /test-runner    │ ← run tests                           │
│          │ /ai-ui-test     │ ← test UI                             │
│          └─────────────────┘                                       │
│                                                                     │
│  Found .mockups/ folder?                                           │
│      │                                                              │
│      ▼                                                              │
│  ┌─────────────────┐                                               │
│  │ Read mockup.md  │ ← read structural spec (components, data)    │
│  │ frontend-design │ ← free to design visual                      │
│  │ free to design  │                                               │
│  └─────────────────┘                                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Step 0.7: Check Schema Version and Migration (NEW v1.5.0)

```bash
# Check schema version
cat feature_list.json | grep "schema_version"
```

**If `schema_version` not found or is an old version:**

```
⚠️ Detected old schema (no version or < 1.5.0)
   Current schema: v1.5.0

   Recommend running /migrate to:
   - Add epics grouping
   - Add subtasks tracking
   - Add acceptance criteria
   - Add time tracking
   - Add mockup sync fields

   Existing data will be preserved.
```

---

### Step 1: Get Context (Must do first!)

```bash
# 1. Verify correct directory
pwd
ls -la

# 2. Read progress log
cat .agent/progress.md

# 3. View git history
git log --oneline -10

# 4. View feature list summary
cat feature_list.json
```

**If these files are not found:** Inform user they need to run `/init` first.

### Step 2: Verify Environment

```bash
# Verify project works
# For .NET:
dotnet build

# For Node.js:
npm install && npm run build

# If build fails: fix before working on new feature
```

### Step 2.5: Check Review Reminder (v2.1.0)

**If `model_config` exists in feature_list.json:**

```bash
# Count features awaiting review
cat feature_list.json | jq '[.features[] | select(.status == "passed" and .assigned_model != "opus" and .assigned_model != null and .review == null)] | length'
```

**If there are features awaiting review:**
```
⏳ N features awaiting opus review. Run /review to review them.
   Pending: #6, #9, #12
```

---

### Step 2.6: Check Review Fix — Features Sent Back from /review (v2.1.0)

**Find features that failed review and were sent back:**

```bash
# Find features sent back from review
cat feature_list.json | jq '[.features[] | select(.status == "in_progress" and .review != null and .review.result == "fail")] | map({id, description, assigned_model, blocked_reason, issues: .review.remaining_issues})'
```

**If features sent back are found → must fix before working on new features!**

```
🔴 Review Fix Required!
   Feature #X: [description]
   Sent back from opus review — must fix before working on new features

   📋 Issues to fix (N items):
   1. [Medium] pattern-adherence: [description]
      📁 File: [path]
      💡 Suggestion: [suggestion]
   2. [Low] coding-standards: [description]
      📁 File: [path]
      💡 Suggestion: [suggestion]

   📐 Reference Implementation: Feature #Y (opus)
      See reference files at: [reference files]
```

**Flow for Review Fix:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    REVIEW FIX FLOW                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Read all review.remaining_issues                            │
│                                                                 │
│  2. Read reference implementation (review.reference_feature_id) │
│     → compare code with reference                               │
│                                                                 │
│  3. Fix each issue:                                             │
│     ├── Read the problematic file                               │
│     ├── Read the same file from reference (if exists)           │
│     ├── Fix according to suggestion                             │
│     └── Commit: review-fix(#X): fix [issue description]         │
│                                                                 │
│  4. Verify build passes                                         │
│                                                                 │
│  5. Re-check acceptance criteria                                │
│                                                                 │
│  6. Update feature_list.json:                                   │
│     ├── status: "passed"                                        │
│     ├── blocked_reason: null                                    │
│     ├── review: null  ← clear review for new review round       │
│     └── passes: true                                            │
│                                                                 │
│  7. Commit: feat: Feature #X - [description] (review-fixed)     │
│                                                                 │
│  8. Inform user:                                                │
│     "✅ Feature #X แก้ไขตาม review feedback แล้ว                  │
│      → รัน /review #X เพื่อ review อีกครั้ง"                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Commit prefix for Review Fix:**
| Prefix | Usage |
|--------|-------|
| `review-fix(#X):` | Fix issue from review |
| `review-fix(#X.Y):` | Fix issue for specific subtask |

**Examples:**
```bash
# Fix naming issue
git commit -m "review-fix(#6): fix naming convention to match reference pattern"

# Fix error handling
git commit -m "review-fix(#6): add error handling matching opus reference"

# Feature fixed
git commit -m "feat: Feature #6 - GET by ID (review-fixed)"
```

**⚠️ Rules:**
- **Review fix has higher priority than new features** — must fix first
- **Must read reference implementation** before fixing — to match patterns
- **Clear review field to null** after fixing — to wait for new review round
- **Do not delete review history** — if you need to keep it, move to `version_history[]`
- After fixing → inform user to run `/review` again

**Update feature_list.json after fixing:**
```json
{
  "id": 6,
  "status": "passed",
  "blocked_reason": null,
  "review": null,
  "passes": true,
  "notes": "Review-fixed: fixed N issues per opus feedback. Awaiting review round 2."
}
```

**Update progress log:**
```markdown
---

## Session N - REVIEW FIX
**Date**: TIMESTAMP
**Type**: Review Fix

### What was done:
- 🔧 Feature #X: Fixed per opus review feedback
  - Fixed: [issue 1 description]
  - Fixed: [issue 2 description]
  - Reference: Feature #Y (opus)

### Current status:
- Features passed: X/Y
- Build: ✅
- ⏳ Feature #X awaiting review round 2

---
```

---

### Step 3: Select Feature (Schema v1.5.0)

From feature_list.json:
- Find feature with `"status": "pending"` (or `"passes": false` for old schema)
- Select `"priority": "high"` first
- Verify all dependencies have passed
- **Work on only 1 feature at a time!**

**Before starting a feature:**
```json
// Update status to in_progress
{
  "status": "in_progress",
  "time_tracking": {
    "started_at": "TIMESTAMP"
  }
}
```

**v2.1.0 Auto-Assign Model:**

If `assigned_model == null` → assign per `model_config.assignment_strategy.auto_assign_rules`:

```
Auto-assign logic:
1. complexity == 'complex' → opus
2. is_first_in_category (no other feature in same category passed) → opus
3. has_mockup_refs && complexity == 'medium' (has mockup_page_refs) → opus
4. complexity == 'medium' → sonnet
5. complexity == 'simple' → sonnet
```

**If assigned to opus and is first-in-category → set `is_reference_impl: true`**

```json
// Update feature on auto-assign
{
  "assigned_model": "opus",
  "is_reference_impl": true
}
```

**Update summary.model_workload:**
```json
{
  "model_workload": {
    "opus": { "in_progress": "+1" }
  }
}
```

**v2.0.0 Validation before selecting feature:**

1. **State check**: If feature has `state_consumes` → verify features that produce that state have `passes: true`
   - If not passed → ⚠️ Warning: "[StateName] not yet created — complete Feature #N first"

2. **Component check**: If feature has `requires_components` → verify those components have been created
   - Check from `component_usage.shared_components` or feature that creates the component has passes: true
   - If not yet → ⚠️ Warning: "[ComponentName] not yet created — create component first"

3. **Flow order check**: If feature is in a wizard flow → verify previous step is complete
   - If not complete → ⚠️ Warning: "Flow [name] step [N-1] not yet complete"

### Step 3.5: Validate Mockup References (NEW v1.5.0)

**If feature has mockup references:**

```bash
# Verify mockup files exist
for ref in $(cat feature_list.json | jq -r '.features[] | select(.id == X) | .references[]' | grep "mockups"); do
  ls -la "$ref" 2>/dev/null || echo "⚠️ Missing: $ref"
done
```

**If references found:**
1. **Must** read mockup file before starting development — to understand structural requirements
2. **Must** check required_components — implement every one
3. **Must** use design tokens
4. **Free** to design visual — wireframe is only a structural spec, not a visual blueprint

### Step 4: Implement Feature with Subtask Commits (v1.6.0 - Default Behavior)

**🆕 v1.6.0: Commit every subtask by default**

After completing each subtask:
1. Update `done: true` and `committed_at`
2. **Commit immediately** with `task:` prefix

```bash
git add .
git commit -m "task(#X.Y): [subtask description]"
```

**Commit Prefixes:**
| Prefix | Usage |
|--------|-------|
| `task:` | Subtask commit (default) |
| `feat:` | Feature complete (final commit) |
| `wip:` | Work in progress (optional) |

**Example:**
```bash
# Subtask 1.1 done
git commit -m "task(#1.1): create project structure"

# Subtask 1.2 done
git commit -m "task(#1.2): setup configuration"

# Feature complete
git commit -m "feat: Feature #1 - create project structure"
```

**Update feature_list.json after each subtask:**

```json
{
  "subtasks": [
    { "id": "1.1", "description": "create component", "done": true, "committed_at": "2025-01-05T10:00:00Z" },
    { "id": "1.2", "description": "add styling", "done": false, "committed_at": null }
  ],
  "last_committed_subtask": "1.1"
}
```

**v2.0.0 Flow-Aware Implementation:**

- If has `flow_id` → read `flows[flow_id]` for:
  - `entry_conditions` → implement guard/redirect if state is incomplete
  - `error_paths` where `from_step` matches this feature → implement error handling
  - `cancel_path` → implement cancel button/action
- If has `state_consumes` → import/read state before using (per `persistence` type)
- If has `state_produces` → implement state creation + save (per `persistence` type)
- If has `requires_components` → import and use specified components

**Implementation checklist:**
- [ ] Follow subtasks in order
- [ ] Update subtask.done and committed_at when each subtask completes
- [ ] **Commit each subtask with `task(#X.Y):`** ← NEW
- [ ] Update last_committed_subtask
- [ ] Check required_components (if any)
- [ ] Write clean, readable code
- [ ] Handle errors appropriately

### Step 5: Verify Acceptance Criteria (NEW v1.5.0)

**Before marking pass, verify acceptance_criteria:**

```json
// Example acceptance criteria
{
  "acceptance_criteria": [
    "endpoint responds 200 OK with array",
    "supports pagination",
    "response format is correct"
  ]
}
```

**Verification checklist:**
- [ ] All acceptance criteria pass
- [ ] Build passes
- [ ] Manual test passes (curl, Postman, browser)
- [ ] Edge cases handled
- [ ] UI implements all components and data requirements from mockup (visual does not need to match wireframe)

### Step 5.5: Run Verification Pipeline (NEW v2.3.0 — MANDATORY)

**After acceptance criteria, run the full Verification Pipeline before marking passed.**

```
Verification Pipeline Results:
─────────────────────────────────────────────────
□ Step 1 — Build Check
  Backend: dotnet build → ✅ 0 errors
  Frontend: npm run build → ✅ 0 errors

□ Step 2 — Design Doc Compliance (if .design-docs/ exists)
  Entity count in code: N
  Entity count in DD: M
  Match: ✅ / ❌ Missing: [list]

□ Step 3 — CRUD Completeness (if CRUD feature)
  Create: ✅ POST endpoint + frontend hook
  Read:   ✅ GET endpoint + frontend hook
  Update: ✅ / ❌ PUT endpoint + frontend hook
  Delete: ✅ / ❌ DELETE endpoint + frontend hook
  Note: [if intentionally missing, explain why]

□ Step 4 — API Integration (if frontend feature)
  Uses real API: ✅ / ❌ (still mock data)
  Loading states: ✅ / ❌
  Error states: ✅ / ❌

□ Step 5 — Test Coverage
  Tests found: N (type: unit/integration/e2e)
  Minimum required: M
  Met: ✅ / ❌

□ Step 6 — Tech Stack Audit (per phase)
  Libraries from CLAUDE.md: [list]
  Actually used: [list]
  Missing: [list or "none"]

□ Step 7 — Config Flags
  max_features_per_session: enforced ✅
  require_tests: enforced ✅
  tdd_approach: N/A / enforced ✅
─────────────────────────────────────────────────
Pipeline Result: ALL GREEN → proceed to mark passed
                 ANY RED → mark "partial" or "incomplete"
```

**⚠️ CRITICAL**: Do NOT skip this step. "Build: ✅ 0 errors" alone is NOT sufficient.

**If pipeline has failures:**
- Mark feature as `"partial"` (mock data) or `"incomplete"` (missing CRUD/entities)
- Create follow-up features for missing items
- Document what's missing in feature notes

### Step 6: Mark as Passed (Schema v1.5.0)

Edit feature_list.json:
```json
{
  "id": X,
  "status": "passed",                    // NEW v1.5.0
  "subtasks": [
    { "id": "X.1", "done": true },
    { "id": "X.2", "done": true },
    { "id": "X.3", "done": true }
  ],
  "time_tracking": {
    "started_at": "START_TIMESTAMP",
    "completed_at": "END_TIMESTAMP",      // NEW v1.5.0
    "actual_time": "25min"                // NEW v1.5.0 - calculated from started - completed
  },
  "mockup_validated": true,               // NEW v1.5.0 - if has mockup ref
  "passes": true,                         // KEEP for backward compat
  "tested_at": "TIMESTAMP",
  "notes": "Test results..."
}
```

Update epic progress:
```json
{
  "epics": [
    {
      "id": "setup",
      "progress": { "total": 2, "passed": 1, "in_progress": 0 }  // ← Updated
    }
  ]
}
```

Update summary:
```json
{
  "summary": {
    "total": 12,
    "passed": N+1,
    "in_progress": 0,
    "blocked": 0,
    "pending": M-1,
    "last_updated": "TIMESTAMP"
  }
}
```

### Step 7: Commit Changes

```bash
git add .
git commit -m "feat: Feature #X - description"
```

### Step 8: Update Progress Log

Add new session to .agent/progress.md:
```markdown
---

## Session N - CODING
**Date**: TIMESTAMP
**Type**: Coding

### What was done:
- ✅ Feature #X: description

### Verification Pipeline Results (v2.3.0):
- Build: ✅ 0 errors
- Design Doc Compliance: ✅ N/N entities match (or N/A)
- CRUD Completeness: ✅ C+R+U+D all present (or N/A)
- API Integration: ✅ real API, no mock data (or N/A)
- Test Coverage: ✅ N tests (unit: X, integration: Y)
- Tech Stack: ✅ all libraries used (or N/A)
- Config Flags: ✅ enforced
- **Pipeline Result: PASSED** (or PARTIAL/INCOMPLETE + reason)

### Current status:
- Features passed: X/Y
- Build: ✅

### Next feature:
- Feature #Z: description

---
```

## Important Rules

❌ **Forbidden:**
- Working on multiple features in 1 session
- Marking pass without testing
- Deleting or modifying feature descriptions
- Declaring done when features still have passes: false

✅ **Must do:**
- Always read context before starting work
- Test before marking pass
- Commit separately per feature
- Update progress before ending session
- Leave code in buildable state

## Expected Output

When 1 feature is completed, inform user:
1. Feature that was completed
2. Test results
3. Progress (X/Y features passed)
4. Next feature
5. Git commit hash

> 💬 **หมายเหตุ**: คำสั่งนี้จะตอบกลับเป็นภาษาไทย
