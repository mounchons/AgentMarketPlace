# Coding Agent Guide

Guide for Coding Agent - use every time after Initialize is complete

## 🎯 Coding Agent Responsibilities

```
┌─────────────────────────────────────────────────────────────┐
│                      CODING AGENT                           │
│                    (called multiple times)                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Every session must:                                        │
│                                                             │
│  1. 📖 Read Context      ─── progress.md, git log          │
│  2. ✅ Verify Env         ─── project works                │
│  3. 📋 Select Feature     ─── pick 1 feature               │
│  4. 💻 Implement          ─── write code                   │
│  5. 🧪 Test               ─── test for real                │
│  6. ✔️  Mark Pass          ─── update feature_list          │
│  7. 📝 Commit             ─── git commit                   │
│  8. 📊 Update Progress    ─── write session log            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Step-by-Step Workflow

### Step 0: Check Design References (Very Important!)

**Before starting any feature development, check the reference documents:**

```bash
# 1. Check UI Mockups (from ui-mockup skill)
ls -la .mockups/ 2>/dev/null
ls -la .mockups/*.mockup.md 2>/dev/null

# 2. Check System Design Document (from system-design-doc skill)
find . -name "*design*.md" -o -name "*system*.md" 2>/dev/null | head -5

# 3. Check Technology Stack
ls -la *.csproj *.sln 2>/dev/null  # .NET Core
ls -la package.json 2>/dev/null    # Node.js
```

**📁 Main Reference Sources:**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DESIGN REFERENCES                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  📐 UI Mockup (.mockups/)                                          │
│  ├── *.mockup.md   → ASCII Wireframe + Component Specs            │
│  ├── _design-tokens.yaml → Colors, Spacing, Typography            │
│  └── mockup_list.json → List of all mockups                       │
│                                                                     │
│  📄 System Design Doc                                               │
│  ├── ER Diagram    → Database Schema                               │
│  ├── Data Dictionary → Field Specifications                        │
│  ├── Flow Diagram  → Business Logic                                │
│  └── API Specs     → Endpoint Definitions                          │
│                                                                     │
│  🔧 Technology Skills                                               │
│  └── /dotnet-dev   → Use for .NET Core projects                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**🎯 How to Use References:**

| Feature Type | Must Read | Purpose |
|--------------|---------|----------|
| **UI/Frontend** | `.mockups/[page].mockup.md` | Read component specs, data requirements (wireframe = structural ref, not visual blueprint) |
| **Database** | Design Doc - ER Diagram | View schema, relationships |
| **API** | Design Doc - Flow Diagram | View business logic, endpoints |
| **.NET Code** | `/dotnet-dev` skill | Use .NET best practices |

**⚠️ Important Rules:**
- If `.mockups/` folder exists → **must** read structural spec (components, data) but **free** to design visual
- If Design Doc exists → **must** use ER Diagram for database
- If .NET project → **must** use `/dotnet-dev` skill
- If `design_doc_list.json` exists → **must** check `crud_operations` for the entity before implementing CRUD features

**🔍 CRUD Operations Check (before implementing CRUD):**
```bash
# Check which operations are enabled for the entity
cat design_doc_list.json | jq '.entities[] | select(.name == "EntityName") | .crud_operations'
```
- Only create APIs for operations where `enabled: true`
- Delete must use the `strategy` as specified (default: `"soft"` = set is_active = false)
- Do not create all CRUD operations without checking — some entities may be read-only

- If `flows[]` exists in feature_list.json → **must** read flow context before starting work

**🔍 Flow Context Check (v2.0.0):**
```bash
# Check which flow the feature belongs to
cat feature_list.json | jq --arg fid "FEATURE_ID" '.flows[] | select(.steps[].feature_id == ($fid | tonumber))'
```
- If a feature has `flow_id` → read entry/exit conditions, error_paths before implementing
- If a feature has `state_consumes` → verify the state has already been produced
- If a feature has `state_produces` → implement state creation according to `persistence` type in state_contracts
- If a feature has `requires_components` → verify the components are ready to use

---

### Step 1: Get Context (Very Important!)

**Must do every time before starting work:**

```bash
# 1. Check current directory
pwd

# 2. Read progress log
cat .agent/progress.md

# 3. View git history
git log --oneline -10

# 4. View feature list
cat feature_list.json | jq '.features[] | select(.passes == false) | {id, description, priority}'
```

**Expected results:**
```
From progress.md:
- Previous session completed Feature #3
- Next feature is #4

From git log:
- abc1234 feat: Feature #3 - Add TodoItem entity
- def5678 feat: Feature #2 - Setup EF Core
- ...

From feature_list.json:
- Feature #4: GET /api/todos (passes: false, priority: high)
- Feature #5: GET /api/todos/{id} (passes: false, priority: high)
- ...
```

### Step 2: Verify Environment

**Verify the project builds and runs:**

```bash
# For .NET
dotnet build
dotnet run &  # Run in background

# Test basic endpoint (if available)
curl http://localhost:5000/health
```

**If build fails:**
1. Read the error message
2. Fix the code
3. Do not start a new feature until the build passes

### Step 3: Select Feature

**Select the feature to work on:**

```json
{
  "id": 4,
  "category": "api",
  "description": "GET /api/todos - Retrieve all todos",
  "priority": "high",
  "steps": [
    "Create TodosController",
    "implement GetAll endpoint",
    "Test with Swagger"
  ],
  "passes": false
}
```

**Selection rules:**
1. Choose `passes: false`
2. Choose `priority: high` first
3. Check dependencies (if any)
4. **Work on only 1 feature at a time!**

### Step 4: Implement Feature

**Follow the specified steps:**

```
🎯 Working on Feature #4: GET /api/todos

Step 1: Create TodosController
─────────────────────────────
[Create file Controllers/TodosController.cs]

Step 2: implement GetAll endpoint
─────────────────────────────────
[Write code for GET endpoint]

Step 3: Test with Swagger
─────────────────────────
[Run project and test]
```

**Best Practices:**
- Write clean and readable code
- Follow the project's coding standards
- Write comments if necessary
- Do not forget error handling

### Step 5: Test Feature

**⚠️ Do not mark pass without testing!**

**How to test:**

```bash
# 1. Unit tests (if available)
dotnet test

# 2. Manual test with curl/Postman
curl http://localhost:5000/api/todos
# Expected: [] or list of todos

# 3. Test edge cases
curl http://localhost:5000/api/todos/999
# Expected: 404 Not Found

# 4. Test with Swagger UI
# http://localhost:5000/swagger
```

**Test Checklist:**
- [ ] Happy path passes
- [ ] Error cases handled correctly
- [ ] Response format is correct
- [ ] Build passes
- [ ] No warnings/errors in console

### Step 5.5: Run Verification Pipeline (v2.3.0 — MANDATORY)

**Before marking passed, run the full Verification Pipeline from SKILL.md:**

```
□ Step 1 — Build: 0 errors
□ Step 2 — Design Doc: entities match DD? (if DD exists)
□ Step 3 — CRUD: C+R+U+D all present? (if CRUD feature)
□ Step 4 — API: frontend uses real API, not mock data? (if UI feature)
□ Step 5 — Tests: minimum tests met? (not just "build passes")
□ Step 6 — Tech Stack: CLAUDE.md libraries used? (per phase)
□ Step 7 — Config Flags: .agent/config.json rules enforced?
```

**⚠️ "Build: ✅ 0 errors" alone is NOT sufficient to mark passed.**
**⚠️ Mock data in frontend → mark "partial", not "passed".**
**⚠️ Missing CRUD operations → mark "incomplete", not "passed".**

See SKILL.md "Verification Pipeline" section for full details.

### Step 6: Mark as Passed

**Edit feature_list.json:**

```json
{
  "id": 4,
  "description": "GET /api/todos - Retrieve all todos",
  "passes": true,  // ← changed from false
  "tested_at": "2025-01-01T14:30:00Z",
  "notes": "Tested with curl and Swagger, returns empty array initially"
}
```

**Update summary:**
```json
{
  "summary": {
    "total": 11,
    "passed": 4,  // ← increment
    "failed": 7,  // ← decrement
    "last_updated": "2025-01-01T14:30:00Z"
  }
}
```

### Step 7: Commit Changes

**Commit format:**
```bash
git add .
git commit -m "feat: Feature #4 - GET /api/todos endpoint

- Created TodosController
- Implemented GetAll endpoint returning list of todos
- Tested with curl and Swagger UI"
```

**Commit message guidelines:**
- Use format: `feat: Feature #X - description`
- Describe what was done in the body
- Describe how it was tested (if applicable)

### Step 8: Update Progress Log

**Add to .agent/progress.md:**

```markdown
---

## Session 4 - CODING
**Date**: 2025-01-01 14:30 UTC
**Type**: Coding
**Duration**: ~25 minutes

### What was done:
- ✅ Feature #4: GET /api/todos endpoint
  - Created TodosController
  - Implement GetAll endpoint
  - Tested with curl and Swagger

### Test Results:
- curl http://localhost:5000/api/todos → ✅ 200 OK, []
- Swagger UI → ✅ Working

### Current status:
- Features passed: 4/11 (36%)
- Build: ✅ Passing
- Tests: N/A

### Next Feature:
- **Feature #5**: GET /api/todos/{id} - Retrieve todo by id
  - Priority: High
  - Category: API

### Git:
- Commit: `feat: Feature #4 - GET /api/todos endpoint`

### Notes:
- API returns empty array initially (no data seeded)
- Ready for Feature #5

---
```

---

## 📊 Session Summary Template

When finishing a session, notify the user:

```markdown
✅ Session Complete!

📋 Feature Completed:
- Feature #4: GET /api/todos endpoint

🧪 Test Results:
- curl test: ✅ Passed
- Swagger: ✅ Working

📊 Progress:
- Before: 3/11 (27%)
- After: 4/11 (36%)

📝 Git Commit:
- feat: Feature #4 - GET /api/todos endpoint

🚀 Next Feature:
- Feature #5: GET /api/todos/{id}

💡 To continue:
- Run `/continue` in the next session

> 💬 **Note**: This command responds in Thai (คำสั่งนี้จะตอบกลับเป็นภาษาไทย)
```

---

## ⚠️ Common Mistakes & Solutions

### ❌ Forgetting to read context before starting work

```
Wrong: Starting to write code without checking progress
Correct: Always read progress.md and git log first
```

### ❌ Working on multiple features in 1 session

```
Wrong: "OK, let's do Feature #4, #5, #6 all at once"
Correct: Work on 1 feature at a time, commit, then continue
```

### ❌ Marking pass without testing

```
Wrong: Finish writing code → mark pass immediately
Correct: Write code → test for real → pass → mark pass
```

### ❌ Forgetting to commit

```
Wrong: Finish feature then end session
Correct: Finish feature → commit → update progress → end session
```

### ❌ Leaving work in a broken state

```
Wrong: Build fails but end session anyway
Correct: Fix the build first, or revert if unable to fix
```

---

## 🔄 Recovery Scenarios

### Scenario 1: Build Fail

```bash
# 1. View the error
dotnet build 2>&1 | head -50

# 2. Fix the error

# 3. Rebuild
dotnet build

# 4. If unable to fix in this session
git stash  # or
git checkout .  # revert changes
```

### Scenario 2: Feature more complex than expected

```markdown
## Session Notes

### What was done:
- 🔄 Feature #7: Partially completed
  - ✅ Created validator class
  - ❌ Integration with controller (not done)

### Status:
- Feature #7: NOT PASSED (incomplete)
- Code committed but feature not working end-to-end

### For the next session:
- Continue Feature #7
- Still missing: integrate validator with controller
```

### Scenario 3: Found a bug in a previous feature

```markdown
## Session Notes

### What was done:
- 🐛 Found bug in Feature #4 (GET /api/todos)
  - Bug: Not filtering soft-deleted items (is_active = false)
  - Fix: Added .Where(x => x.IsActive) (soft delete = filter by is_active)
- ✅ Feature #5: GET /api/todos/{id}

### Git:
1. `fix: Feature #4 - Filter soft-deleted items`
2. `feat: Feature #5 - GET /api/todos/{id}`
```

---

## 💡 Pro Tips

### 1. Use a Checklist

```markdown
## Feature #4 Checklist
- [ ] Read progress.md
- [ ] View git log
- [ ] Build project
- [ ] Implement feature
- [ ] Test
- [ ] Mark pass
- [ ] Commit
- [ ] Update progress
```

### 2. Write Test Cases Before Implementing

```markdown
## Test Plan for Feature #5

1. GET /api/todos/1 (exists) → 200 OK + todo object
2. GET /api/todos/999 (not exists) → 404 Not Found
3. GET /api/todos/abc (invalid id) → 400 Bad Request
```

### 3. Use Time Boxing

```
- Target: 30 minutes per feature
- If exceeded: save state, let the next session continue
```

### 4. Commit Often

```bash
# Commit when there is meaningful progress
git commit -m "wip: Feature #5 - Add controller skeleton"
git commit -m "wip: Feature #5 - Implement GetById logic"
git commit -m "feat: Feature #5 - Complete GET /api/todos/{id}"
```

---

## 📝 Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│                 CODING AGENT QUICK REF                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔰 Start Session:                                          │
│     cat .agent/progress.md                                  │
│     git log --oneline -5                                    │
│     cat feature_list.json | jq '.summary'                   │
│                                                             │
│  🎯 Select Feature:                                         │
│     passes: false + highest priority                        │
│     Only 1 at a time!                                       │
│                                                             │
│  🧪 Test Before Mark Pass:                                  │
│     - Build passes                                          │
│     - Manual test passes                                    │
│     - Edge cases pass                                       │
│                                                             │
│  📝 End Session:                                            │
│     git commit -m "feat: Feature #X - ..."                  │
│     Update .agent/progress.md                               │
│     Update feature_list.json summary                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
