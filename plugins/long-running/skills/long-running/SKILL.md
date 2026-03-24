---
name: long-running
version: 2.3.0
description: Harness for AI Agents working across context windows — supports multi-session, feature tracking, progress logging, incremental development, epic grouping, subtask tracking, acceptance criteria, model assignment, review system, flows, state contracts, component requirements, CRITICAL RULES enforcement, Verification Pipeline, and integration with ui-mockup, system-design-doc, dotnet-dev skills
---

# Long-Running Agent Skill

> **Version 2.3.0** - Added Verification Pipeline (6 checks beyond build success), Design Doc compliance, CRUD completeness, mock data detection, test coverage minimum, tech stack audit, config flag enforcement

> **Response Language**: Always respond to users in Thai (ภาษาไทย)

Skill for managing AI Agents that work effectively across context windows.
Based on [Anthropic Engineering Blog](https://www.anthropic.com/engineering/effective-harnesses-for-long-runnings)

## 🎯 Problems Solved

```
┌─────────────────────────────────────────────────────────────┐
│  ❌ Common AI Agent Problems                                │
├─────────────────────────────────────────────────────────────┤
│  1. Attempts to do everything at once (One-shot)            │
│  2. Declares "done" when it's not actually finished         │
│  3. Abandons work without any record                        │
│  4. Marks feature pass without actually testing             │
│  5. New session has no idea what was done before            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  ✅ Solution with Long-Running Agent Harness                │
├─────────────────────────────────────────────────────────────┤
│  1. Enforces one feature at a time (Incremental)            │
│  2. Has a clear feature_list.json                           │
│  3. Records progress every session                          │
│  4. Always test before marking pass                         │
│  5. New session can read context immediately                │
└─────────────────────────────────────────────────────────────┘
```

## 💡 Available Commands

| What you need | Example command |
|---------------|----------------|
| **Start a new project** | `/init สร้าง Todo API ด้วย .NET Core` |
| **Continue working** | `/continue` or "continue from previous session" |
| **View status** | `/status` or "view project progress" |
| **Review another model's work** | `/review` or `/review #6` |
| **Generate features from mockups** | `/generate-features-from-mockups` |
| **Generate features from design** | `/generate-features-from-design` |
| **Validate coverage** | `/validate-coverage` |
| **Sync mockups** | `/sync-mockups` |
| **View dependencies** | `/dependencies` |
| **Migrate schema** | `/migrate` |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 LONG-RUNNING AGENT SYSTEM                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────┐         ┌─────────────────────────┐   │
│   │  INITIALIZER    │         │     CODING AGENT        │   │
│   │     AGENT       │────────▶│   (runs multiple times) │   │
│   │  (first time    │         │                         │   │
│   │   only)         │         │                         │   │
│   └─────────────────┘         └─────────────────────────┘   │
│          │                              │                   │
│          ▼                              ▼                   │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              SHARED ARTIFACTS                       │   │
│   │  • feature_list.json  (list of features)            │   │
│   │  • .agent/progress.md (progress log)                │   │
│   │  • .agent/config.json (agent configuration)         │   │
│   │  • Git History        (change history)              │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Files That Will Be Created

When using `/init`, these files will be created:

```
project-root/
├── .agent/                      # Agent configuration folder
│   ├── config.json              # Agent settings
│   ├── progress.md              # Session logs
│   └── prompts/                 # Custom prompts (optional)
├── feature_list.json            # List of features and their status
├── init.sh                      # Setup script (optional)
└── ... (project files)
```

---

## 🚀 Quick Start

### Mode 1: Start a New Project

```bash
# In Claude Code CLI
/init สร้าง Todo API ด้วย ASP.NET Core Web API, EF Core, PostgreSQL
```

Or type manually:
```
Initialize long-running agent environment for [describe project]
Create feature_list.json and .agent/ folder
```

### Mode 2: Continue from Previous Session

```bash
/continue
```

Or type manually:
```
Act as Coding Agent — read progress, work on next feature
```

### Mode 3: Use with an Existing Project

```bash
/init-existing
```

Or type manually:
```
Analyze this project and create long-running agent environment
Create feature_list.json from existing TODO/issues
```

---

## 📋 Workflow Details

### Workflow 1: Initialize (First Time)

```
1. Analyze Requirements
   └── Receive input from user about what to build

2. Create Feature List
   └── Break requirements into small features
   └── Each feature completable in 1 session
   └── Order by dependency

3. Create Agent Config
   └── .agent/config.json - project settings
   └── .agent/progress.md - first session log

4. Create Feature List File
   └── feature_list.json with passes: false for all features

5. Git Init (if not already initialized)
   └── Initial commit

❌ Do NOT implement code in init phase!
```

### Workflow 2: Coding Session (Every Time After Init)

```
1. Get Context (must do first!)
   ├── Read .agent/progress.md
   ├── Check git log --oneline -10
   └── Check feature_list.json

2. Verify Environment
   └── Verify that project builds/runs

3. Select Feature
   ├── Find feature with passes=false
   ├── Select highest priority
   └── Work on only 1 feature at a time!

4. Implement Feature
   ├── Write code
   ├── Write tests (if applicable)
   └── Complete it fully

5. Test Feature
   ├── Run tests
   ├── Manual test (if necessary)
   └── Must actually pass before marking!

6. Mark as Passed
   └── Edit feature_list.json: passes: true

7. Commit Changes
   └── git commit -m "feat: Feature #X - description"

8. Update Progress
   └── Add session log to .agent/progress.md
```

---

## 📝 File Formats

### feature_list.json

```json
{
  "project": "Project Name",
  "description": "Project description",
  "created_at": "2025-01-01T00:00:00Z",
  "features": [
    {
      "id": 1,
      "category": "setup",
      "description": "Create project structure",
      "priority": "high",
      "steps": [
        "Step 1",
        "Step 2"
      ],
      "passes": false,
      "tested_at": null,
      "notes": ""
    }
  ],
  "summary": {
    "total": 10,
    "passed": 0,
    "failed": 10,
    "last_updated": "2025-01-01T00:00:00Z"
  }
}
```

### .agent/config.json

```json
{
  "project_name": "Project Name",
  "technology": ".NET Core",
  "initialized_at": "2025-01-01T00:00:00Z",
  "current_session": 1,
  "settings": {
    "auto_commit": true,
    "require_tests": true,
    "max_features_per_session": 1
  }
}
```

### .agent/progress.md

```markdown
# Project Progress Log

## Project Info
- **Name**: Project Name
- **Technology**: .NET Core
- **Started**: 2025-01-01

---

## Session 1 - INITIALIZER
**Date**: 2025-01-01 10:00 UTC
**Type**: Initializer

### What was done:
- ✅ Created feature_list.json
- ✅ Created .agent/ config
- ✅ Initial commit

### Status:
- Features: 0/10 passed

### Next:
- Feature #1: Create project structure

---

## Session 2 - CODING
**Date**: 2025-01-01 14:00 UTC
**Type**: Coding

### What was done:
- ✅ Feature #1: Create project structure

### Status:
- Features: 1/10 passed
- Build: ✅
- Tests: N/A

### Next:
- Feature #2: ...

---
```

---

## 🤖 Model Assignment & Review (v2.1.0)

### Model Roles
| Model | Role | Handles | Can Review |
|-------|------|---------|------------|
| opus | architect | complex, prototype, reference | ✅ |
| sonnet | implementer | medium, simple | ❌ |
| minimax | implementer | medium, simple | ❌ |
| glm | implementer | medium, simple | ❌ |

### Auto-Assignment Rules
1. `complexity == 'complex'` → opus
2. First feature in category → opus (becomes reference implementation)
3. Has mockup refs + medium complexity → opus
4. `complexity == 'medium'` → sonnet
5. `complexity == 'simple'` → sonnet

### Review System (Hybrid Auto-Fix)
- opus reviews work from other models against the reference implementation
- **Hybrid strategy**: Critical/High issues → opus fixes immediately, Medium/Low → sent back to original model
- Review result: `pass` (80-100), `pass_with_suggestions` (60-79), `fail` (0-59)
- Failed features revert to `in_progress` with `blocked_reason`
- Auto-fixed issues have a trackable commit hash
- `/review` command — auto-select or specify feature ID

### Review Fix Flow (When a model is sent back)
```
/continue → finds feature that failed review → reads issues → reads reference →
fixes → commit review-fix(#X) → mark passed → inform user to run /review again
```
- `/continue` automatically detects features with `status == "in_progress"` + `review.result == "fail"`
- Review fixes have higher priority than new features — must fix first
- After fixing → clear `review: null` → wait for new `/review` round

### New Feature Fields (v2.1.0)
| Field | Type | Description |
|-------|------|-------------|
| `assigned_model` | string \| null | model responsible for the feature |
| `is_reference_impl` | boolean | true = reference that other models must follow |
| `review` | object \| null | review result by opus |

### New Summary Fields
| Field | Description |
|-------|-------------|
| `summary.model_workload` | workload count per model |
| `summary.review_status` | review results summary |

---

## 🔄 Flows & State Contracts (v2.0.0)

### Flows
Group features into user journeys — wizard, crud-group, or parallel

```json
{
  "flows": [{
    "id": "checkout",
    "type": "wizard",
    "steps": [{ "order": 1, "feature_id": 3, "label": "Cart" }],
    "entry_conditions": { "required_state": ["AuthState"] },
    "exit_conditions": { "produced_state": ["OrderState"] },
    "error_paths": [{ "from_step": 3, "condition": "payment_failed", "action": "retry_or_back" }],
    "cancel_path": { "action": "back_to_cart" }
  }]
}
```

### State Contracts
Define shared state between pages — agent can create interfaces directly

```json
{
  "state_contracts": {
    "CartState": {
      "fields": { "items": { "type": "CartItem[]" }, "total": { "type": "number" } },
      "persistence": "session",
      "produced_by": [3],
      "consumed_by": [4, 5, 6]
    }
  }
}
```

### New Feature Fields
| Field | Type | Description |
|-------|------|-------------|
| `flow_id` | string \| null | flow the feature belongs to |
| `state_produces` | string[] | state the feature creates |
| `state_consumes` | string[] | state the feature requires |
| `requires_components` | string[] | components that must exist first (enforcement) |

---

## ✅ Verification Pipeline (v2.3.0 — MANDATORY before mark passed)

> **Background**: Audit of 78 sessions found that "build success = passed" missed 7 categories of defects.
> Build success only proves code compiles — it does NOT prove correctness.

### Pipeline Steps

Every feature MUST pass ALL applicable steps before being marked `passed`:

```
Feature Implementation
    → Step 1: Build Check (existing — 0 errors)
    → Step 2: Design Doc Compliance Check (NEW)
    → Step 3: CRUD Completeness Check (NEW)
    → Step 4: API Integration Check — no mock data (NEW)
    → Step 5: Test Coverage Check (NEW)
    → Step 6: Tech Stack Audit (NEW, per phase)
    → Step 7: Config Flags Enforcement (NEW)
    → ALL GREEN → Mark Passed
    → ANY FAILED → Mark "partial" or "incomplete"
```

### Step 1: Build Check
```
□ Backend build: 0 errors
□ Frontend build: 0 errors (if applicable)
```

### Step 2: Design Doc Compliance Check
```
IF Design Document exists (.design-docs/):
  □ Entity count in code matches Data Dictionary table count
  □ New entities created in this feature exist in DD
  □ Field types/names match DD specifications
  □ FK relationships match ER Diagram

  HOW TO CHECK:
  1. Count entities: find src/ -name "*.cs" -path "*/Entities/*" | wc -l (or equivalent)
  2. Count DD tables: grep "### 8\." .design-docs/*.md | wc -l
  3. If mismatch → list missing entities → create backlog features
  4. DO NOT mark passed if entities are missing from DD
```

### Step 3: CRUD Completeness Check
```
IF feature implements CRUD for an entity:
  □ Create: POST endpoint + frontend form/hook exists
  □ Read: GET endpoint + frontend list/detail exists
  □ Update: PUT/PATCH endpoint + frontend edit form exists
  □ Delete: DELETE endpoint + frontend action exists

  HOW TO CHECK:
  1. Verify backend: CreateCommand ✓, GetQuery ✓, UpdateCommand ✓, DeleteCommand ✓
  2. Verify frontend: useCreate ✓, useGet ✓, useUpdate ✓, useDelete ✓
  3. If intentionally missing (immutable records) → document reason in notes
  4. If unintentionally missing → mark feature as INCOMPLETE, not passed
```

### Step 4: API Integration Check (No Mock Data)
```
IF feature has frontend pages that display data:
  □ Frontend calls real API endpoints (not hardcoded/mock data)
  □ API hooks exist and are connected (useQuery, useMutation, etc.)
  □ Loading states implemented for async data
  □ Error states implemented for API failures

  RULE: Frontend feature with API dependency CANNOT be marked passed if:
  - Still uses mock/hardcoded data
  - No API hook that calls backend
  - No loading/error states for async data

  ACTION: If mock data only → mark status as "partial" + create follow-up feature
```

### Step 5: Test Coverage Check
```
Per feature category, MINIMUM test requirements:
  □ Domain entities: ≥ 3 unit tests (validation, relationships, business rules)
  □ API endpoints: ≥ 1 integration test per CRUD operation
  □ Financial/critical modules: ≥ 5 integration tests (CRUD + workflow)
  □ Frontend pages: ≥ 1 E2E test per module (if E2E framework available)

  RULE: Feature CANNOT pass without meeting minimum test count
  "Build passes" or "manual curl test" alone is NOT sufficient test evidence

  ACCEPTABLE test evidence:
  - Automated test output (dotnet test, npm test, pytest)
  - curl/Postman results with response body shown
  - Screenshot of working UI with data from real API
  - E2E test report (Playwright, Cypress)

  NOT acceptable:
  - "Build: ✅ 0 errors" alone
  - "Manual test: looks good"
```

### Step 6: Tech Stack Audit (per phase)
```
IF CLAUDE.md specifies "Key Libraries" or tech requirements:
  □ Every listed library is actually imported/used in code
  □ No library listed but missing from package/NuGet references

  HOW TO CHECK:
  1. Parse CLAUDE.md "Key Backend Libraries" / "Key Frontend Libraries"
  2. For each library: grep for import/using in source code
  3. If library listed but not used → create feature task to implement
  4. Run this check before marking a phase as "complete"
```

### Step 7: Config Flags Enforcement
```
Read .agent/config.json and ENFORCE these flags:
  □ max_features_per_session: REJECT if attempting more than N features
  □ require_tests: REJECT if no actual test count (build-only ≠ test)
  □ tdd_approach: If true, tests must exist BEFORE implementation code
  □ use_design_doc_for_db: MUST cross-reference entity count vs DD
  □ use_mockups_for_ui: MUST read mockup before building UI
```

### Feature Status Values (v2.3.0)

| Status | Meaning | When to Use |
|--------|---------|-------------|
| `passed` | All verification checks GREEN | Feature fully complete |
| `partial` | Build passes but uses mock data or missing tests | Frontend with mock data, API not connected |
| `incomplete` | CRUD not complete or entities missing | Missing PUT endpoint, missing entities |
| `in_progress` | Currently being worked on | During session |
| `pending` | Not started | Waiting in queue |

---

## ⚠️ CRITICAL RULES (MUST FOLLOW)

### Coding Agent Rules

1. **Read CLAUDE.md + .agent/progress.md FIRST** — before any other action in every session
2. **ONE feature per session** — never implement multiple features in a single session
3. **Run Verification Pipeline before marking pass** — ALL 7 steps must be checked (not just build success)
4. **Commit per feature** — each feature gets its own commit with proper prefix
5. **Update progress.md** — before ending every session, log what was done and what's next
6. **Leave code in buildable state** — project must compile/build successfully when session ends

### Initializer Agent Rules

7. **No code implementation** — only create configuration files, feature_list.json, and .agent/ folder
8. **Features must be small** — each feature completable in 1 session (15-30 minutes)
9. **Dependency ordering** — setup features first, then functional features, respecting dependency chains

### Forbidden Actions

10. **NEVER delete features** from feature_list.json
11. **NEVER modify descriptions** of existing features
12. **NEVER mark pass without testing** — passing without test evidence is strictly forbidden
13. **NEVER work on multiple features** in a single session
14. **NEVER declare "project complete"** if any features remain with passes: false

### 🔍 Self-Check Checklist (MANDATORY before submitting output)

Before completing your task, verify EVERY item:

- [ ] CLAUDE.md read? (if exists)
- [ ] .agent/progress.md read?
- [ ] Only 1 feature worked on this session?
- [ ] **Verification Pipeline completed?** (v2.3.0)
  - [ ] Build: 0 errors?
  - [ ] Design Doc compliance: entity count matches DD? (if DD exists)
  - [ ] CRUD completeness: all operations implemented? (if CRUD feature)
  - [ ] API integration: no mock/hardcoded data in frontend? (if UI feature)
  - [ ] Test coverage: minimum tests met? (not just "build passes")
  - [ ] Tech stack: CLAUDE.md libraries actually used? (per phase)
  - [ ] Config flags: .agent/config.json rules enforced?
- [ ] progress.md updated with session log?
- [ ] feature_list.json status updated correctly? (passed/partial/incomplete)
- [ ] Git commit created with proper prefix?

If ANY checkbox is unchecked, DO NOT submit. Fix the issue first.

### ❌ Output Rejection Criteria

Your output will be REJECTED and you must REDO the entire task if:

- Multiple features were implemented in a single session
- A feature was marked as `passed` without running the Verification Pipeline
- A feature was marked as `passed` with only "build success" as evidence (no real tests)
- A feature was marked as `passed` while using mock/hardcoded data in frontend
- A feature was marked as `passed` with incomplete CRUD (missing endpoints)
- Entities implemented don't match Design Document (if DD exists)
- progress.md was not updated before session end
- CLAUDE.md or progress.md was not read at session start
- Code left in non-buildable state
- Features were deleted or descriptions modified
- Config flags (max_features_per_session, require_tests, tdd_approach) were ignored

### ⚠️ Penalty

Violating these rules means your session output is INVALID. The feature will be RESET to pending status and you must redo the ENTIRE session from scratch. There are no partial passes — either ALL rules are followed or the output is REJECTED.

---

## 📚 Reference Files

| File | Description |
|------|-------------|
| `references/initializer-guide.md` | Initializer Agent Guide |
| `references/coding-agent-guide.md` | Coding Agent Guide |
| `references/feature-patterns.md` | Patterns for feature breakdown |
| `references/troubleshooting.md` | Troubleshooting common issues |
| `templates/feature_list.json` | Template for feature list |
| `templates/progress.md` | Template for progress log |

---

## 🔗 Integration with Other Skills

### 📐 With ui-mockup skill

**When starting development, check the `.mockups/` folder:**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    UI MOCKUP INTEGRATION                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Check .mockups/ folder                                         │
│     ls -la .mockups/                                               │
│     ls -la .mockups/*.mockup.md                                    │
│                                                                     │
│  2. Read mockup for the page being developed                       │
│     cat .mockups/[page-name].mockup.md                             │
│                                                                     │
│  3. Use data from mockup:                                          │
│     ├── ASCII Wireframe → Layout structure                         │
│     ├── Component Specs → Required UI components                   │
│     ├── Design Tokens → Colors, spacing, typography                │
│     └── Responsive Specs → Mobile/Tablet/Desktop                   │
│                                                                     │
│  4. Build Frontend following wireframe design!                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Files to check:
├── .mockups/
│   ├── mockup_list.json        # List of all mockups
│   ├── _design-tokens.yaml     # Shared design tokens
│   ├── login.mockup.md         # Login page mockup
│   ├── dashboard.mockup.md     # Dashboard page mockup
│   └── [page].mockup.md        # Other page mockups
```

**⚠️ Important rules:**
- If `.mockups/` folder found → **must** build UI following wireframe
- **Do not** create UI that differs from mockup without approval
- **Must** use specified design tokens (colors, spacing, fonts)

---

### 📄 With system-design-doc skill

**When starting development, check the Design Document:**

```
┌─────────────────────────────────────────────────────────────────────┐
│                SYSTEM DESIGN DOC INTEGRATION                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Find Design Document                                           │
│     find . -name "*design*.md" -o -name "*system*.md"              │
│                                                                     │
│  2. Read important sections:                                       │
│     ├── ER Diagram      → Create Database Schema                   │
│     ├── Data Dictionary → Field types & constraints                │
│     ├── Flow Diagram    → Business Logic implementation           │
│     ├── DFD             → Data Flow between modules               │
│     ├── Sitemap         → Route/Page structure                    │
│     └── Sequence Diagram→ API call sequences                      │
│                                                                     │
│  3. Use data from Design Doc:                                      │
│     ├── Create Entity/Model from ER Diagram                       │
│     ├── Define field types from Data Dictionary                    │
│     └── Implement logic from Flow Diagram                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Recommended workflow:
1. Use /system-design-doc to create design documents first
2. Use /ui-mockup to create UI wireframes
3. Use /init to create feature_list.json from design docs
4. Use /continue to develop following mockups and design docs
```

**⚠️ Important rules:**
- If Design Doc found → **must** use ER Diagram for database
- **Do not** create schema that differs from design without approval
- **Must** use Data Dictionary for field specifications

---

### 🔧 With dotnet-dev skill

**For .NET Core Projects:**

```
┌─────────────────────────────────────────────────────────────────────┐
│                   DOTNET-DEV INTEGRATION                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Check if it's a .NET project                                   │
│     ls -la *.csproj *.sln 2>/dev/null                              │
│                                                                     │
│  2. If .csproj or .sln found → use /dotnet-dev skill               │
│                                                                     │
│  3. dotnet-dev skill helps with:                                   │
│     ├── .NET best practices                                        │
│     ├── EF Core patterns (DbContext, Migrations)                   │
│     ├── Dependency Injection setup                                 │
│     ├── ASP.NET Core conventions                                   │
│     └── Testing patterns (xUnit, NUnit)                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Recommended workflow:
1. /init to create ASP.NET Core API
2. Initializer uses dotnet-dev patterns for feature breakdown
3. Coding Agent uses /dotnet-dev for implementation
```

**⚠️ Important rules:**
- If .NET project → **must** use `/dotnet-dev` skill
- **Must** use .NET conventions and best practices
- **Must** use correct EF Core patterns

---

### 🔄 Complete Workflow with All Skills

```
┌─────────────────────────────────────────────────────────────────────┐
│                    COMPLETE DEVELOPMENT WORKFLOW                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Phase 1: Design (before development)                              │
│  ┌─────────────────┐      ┌─────────────────┐                      │
│  │ /system-design  │ ───▶ │   /ui-mockup    │                      │
│  │      -doc       │      │                 │                      │
│  │                 │      │                 │                      │
│  │ Output:         │      │ Output:         │                      │
│  │ • ER Diagram    │      │ • Wireframes    │                      │
│  │ • Flow Diagram  │      │ • Design Tokens │                      │
│  │ • Data Dict     │      │ • Component Specs│                     │
│  └─────────────────┘      └─────────────────┘                      │
│           │                        │                               │
│           └───────────┬────────────┘                               │
│                       ▼                                            │
│  Phase 2: Initialize                                               │
│  ┌─────────────────────────────────────────┐                       │
│  │            /init                   │                       │
│  │                                          │                       │
│  │ • Read design docs and mockups          │                       │
│  │ • Create feature_list.json              │                       │
│  │ • Create .agent/ folder                 │                       │
│  └─────────────────────────────────────────┘                       │
│                       │                                            │
│                       ▼                                            │
│  Phase 3: Development (repeated multiple times)                    │
│  ┌─────────────────────────────────────────┐                       │
│  │            /continue                     │                       │
│  │                                          │                       │
│  │ 1. Read .mockups/ → build UI per design │                       │
│  │ 2. Read design doc → create DB, API     │                       │
│  │ 3. Use /dotnet-dev → .NET implementation│                       │
│  │ 4. Test → Mark pass → Commit            │                       │
│  └─────────────────────────────────────────┘                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 💡 Tips

1. **How small should features be?**
   - Completable in 15-30 minutes
   - Has a clear deliverable
   - Easy to test

2. **When should you split a feature?**
   - If steps exceed 5 items
   - If multiple files need modification
   - If testing is complex

3. **How to know a feature is truly done?**
   - ALL Verification Pipeline steps pass (not just build)
   - Entities match Design Document (if exists)
   - CRUD operations complete (if CRUD feature)
   - Frontend calls real API (no mock data)
   - Minimum tests met per category
   - Can be demoed with real data

4. **If a feature can't be completed in 1 session?**
   - Record progress in notes
   - Commit what's been done
   - Let the next session continue

---

## 📝 Changelog

| Version | Date | Changes |
|---------|------|---------|
| 2.3.0 | 2026-03-24 | Added Verification Pipeline (7 steps beyond build success): Design Doc compliance, CRUD completeness, mock data detection, test coverage minimum, tech stack audit, config flag enforcement. Added `partial`/`incomplete` status values. Fixed audit issues: build-only=passed, mock data=done, CRUD gaps, missing entities, ignored config flags |
| 2.2.0 | 2026-03-13 | Added CRITICAL RULES with self-check checklist, output rejection criteria, and penalty enforcement to SKILL.md, /continue, /init, /review commands |
| 2.1.0 | 2026-03-11 | Added model_config{}, assigned_model/is_reference_impl/review feature fields, /review command with hybrid auto-fix (Critical/High → opus fix, Medium/Low → send back), model workload & review status in /status, auto-assign in /continue, v2.0.0→v2.1.0 migration |
| 2.0.0 | 2026-03-08 | Added flows[], state_contracts{}, flow_id/state_produces/state_consumes feature fields, requires_components enforcement, flow-aware /continue + /init + /status + /validate-coverage |
