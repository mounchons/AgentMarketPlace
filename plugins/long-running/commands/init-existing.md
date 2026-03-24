---
description: Add long-running agent environment to an existing project
allowed-tools: Bash(*), Read(*), Write(*), Edit(*)
---

# Initialize Agent for Existing Project

You are an **Initializer Agent** that will analyze an existing project and create the agent environment.

## Steps to Follow

### Step 0: Read Important Documents Before Starting (Most Important!)

**These documents must be read before doing anything else:**

```bash
# 1. Read CLAUDE.md at root folder (if exists) - main rules to follow
cat CLAUDE.md 2>/dev/null && echo "=== CLAUDE.md FOUND - must follow rules above ==="

# 2. Read .claude/settings.json (if exists)
cat .claude/settings.json 2>/dev/null

# 3. Read CONTRIBUTING.md (if exists) - development guidelines
cat CONTRIBUTING.md 2>/dev/null | head -50
```

**Documents to read and follow:**

| File | What to do |
|------|-----------|
| `CLAUDE.md` | Follow every rule specified — **highest priority** |
| `CONTRIBUTING.md` | Use specified coding standards |
| `.editorconfig` | Use specified formatting |
| `README.md` | Understand project purpose |

**Things to remember and apply:**
- Coding conventions and naming standards
- Commands that must be run (build, test, lint)
- Special rules for Claude
- Specified tech stack and dependencies

⚠️ **If CLAUDE.md is found, follow every rule before proceeding to next steps!**

---

### Step 0.5: Check Design Documents and UI Mockups (Critical!)

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
1. **Must** read ER Diagram
2. **Must** create features for database/entities
3. **Must** create features for API endpoints from Flow Diagram

---

### Step 1: Analyze Project Structure

```bash
# View project structure
ls -la
find . -type f -name "*.csproj" -o -name "package.json" -o -name "*.sln" | head -20

# View README if exists
cat README.md 2>/dev/null || echo "No README found"

# View TODO/Issues if exists
cat TODO.md 2>/dev/null
cat CHANGELOG.md 2>/dev/null
```

### Step 2: Identify Technology Stack and Supported Skills

**Check files and select appropriate Skill:**

```bash
# Check Technology Stack
echo "=== Detecting Technology Stack ==="

# .NET Core
ls -la *.csproj *.sln 2>/dev/null && echo "→ .NET Core detected"

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
│  ⭐ = has specialized skill                                        │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                    UNIVERSAL SKILLS (works with any Technology)     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  /system-design-doc  │ Create system design documents              │
│  /ui-mockup          │ Create UI wireframes                        │
│  /code-review        │ Review code                                 │
│  /test-runner        │ Run tests                                   │
│  /ai-ui-test         │ Test UI automation                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**⚠️ Important rules:**
- If `.csproj`/`.sln` found → **record in config that `/dotnet-dev` skill must be used**
- Record technology stack in `.agent/config.json`
- Specify recommended skills in progress log

Based on files found:
- `.csproj` / `.sln` → .NET → **use `/dotnet-dev` skill**
- `package.json` → Node.js
- `requirements.txt` → Python
- `composer.json` → PHP
- `go.mod` → Go
- `Cargo.toml` → Rust

### Step 3: Analyze What Has Already Been Done

```bash
# View git history
git log --oneline -20

# View existing files
find . -type f \( -name "*.cs" -o -name "*.js" -o -name "*.ts" -o -name "*.py" \) | head -30
```

### Step 4: Identify Remaining Work

Find from:
- TODO comments in code
- Issues/Tasks in README
- Incomplete features
- Missing tests
- Missing documentation

### Step 4.5: Audit Existing Features (v2.3.0 — MANDATORY)

**Before marking any existing feature as "passed", run a mini Verification Pipeline:**

```
For each feature that appears complete:
  □ Build: does the project build? (basic check)
  □ Design Doc: if DD exists, do entities match?
  □ CRUD: are all C/R/U/D operations present? (or intentionally missing?)
  □ Mock Data: does frontend call real API? (not hardcoded data)
  □ Tests: are there actual tests for this feature?

Status assignment:
  ALL checks pass → "passed"
  Uses mock data  → "partial" (create follow-up feature for API integration)
  Missing CRUD    → "incomplete" (create follow-up feature for missing operations)
  No tests        → "passed" with note: "needs tests" (create test feature)
```

**⚠️ Do NOT mark features as "passed" just because they exist in code.**
Features with mock data, incomplete CRUD, or missing entities should be marked appropriately.

### Step 5: Create Feature List

**Completed features (all checks pass):** `"status": "passed", "passes": true`
**Partial features (mock data/no API):** `"status": "partial", "passes": false`
**Incomplete features (missing CRUD):** `"status": "incomplete", "passes": false`
**Not started:** `"status": "pending", "passes": false`

### Step 6: Create Agent Files

```bash
mkdir -p .agent
```

Create:
- `.agent/config.json`
- `.agent/progress.md` (including past history)
- `feature_list.json`

### Step 7: Commit

```bash
git add .agent feature_list.json
git commit -m "chore: Add long-running agent environment to existing project"
```

## Special Rules for Existing Projects

1. **Do not modify existing code** — only create agent files
2. **Mark completed features as pass** — analyze from existing code
3. **Create features for remaining work** — from TODO or missing parts
4. **Preserve git history** — do not force push or rewrite history

## Expected Output

```markdown
# ✅ Agent Environment Added to Existing Project

## Project Analysis
- **Technology**: .NET Core 8
- **Existing Files**: 15 source files
- **Git Commits**: 25 commits

## Design References Found
- **UI Mockups**: 5 pages found in `.mockups/`
- **Design Doc**: system-design-doc.md found
- **Design Tokens**: _design-tokens.yaml found

## Features Identified
- Completed: 5 features (marked as passed)
- Remaining: 8 features (marked as not passed)
- From Mockups: 5 UI features added
- From Design Doc: 3 API features added

## Recommended Skills
- `/dotnet-dev` - for .NET Core development
- `/code-review` - for code review
- `/test-runner` - for running tests

## Files Created
- .agent/config.json (includes technology & recommended skills)
- .agent/progress.md
- feature_list.json

## Next Steps
1. Review feature_list.json to verify accuracy
2. Run `/continue` to start working on remaining features
3. Use recommended skills during development
```

---

## .agent/config.json Template

```json
{
  "project_name": "Project Name",
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
    "require_tests": true,
    "max_features_per_session": 1,
    "use_mockups_for_ui": true,
    "use_design_doc_for_db": true
  }
}
```

> 💬 **หมายเหตุ**: คำสั่งนี้จะตอบกลับเป็นภาษาไทย
