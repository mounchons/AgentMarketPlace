---
description: Create CLAUDE.md and initial project configuration
allowed-tools: Bash(*), Read(*), Write(*), Edit(*)
---

# Init Project Command

Create CLAUDE.md and initial configuration for the project.

## Purpose

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INIT PROJECT WORKFLOW                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  /init-project                                                              │
│       │                                                                      │
│       ├── Create CLAUDE.md (Project Rules)                                  │
│       ├── Create .claude/settings.json (Optional)                           │
│       └── Git init (if not already initialized)                             │
│                                                                              │
│  Output:                                                                     │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │ CLAUDE.md                                                          │     │
│  │ ├── Project Description                                            │     │
│  │ ├── Technology Stack                                               │     │
│  │ ├── Coding Conventions                                             │     │
│  │ └── Rules for Claude                                               │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Input Received

```
/init-project
/init-project Create HR system with .NET Core
$ARGUMENTS
```

## Steps to Follow

### Step 1: Gather Project Information

Ask user about:
1. **Project name** — name to use
2. **Description** — what this project does
3. **Technology Stack** — what technology is used
4. **Coding Conventions** — any special conventions

Or analyze from $ARGUMENTS if provided.

### Step 2: Check Existing Project

```bash
# Check what files exist
ls -la

# Check git
git status 2>/dev/null || echo "Not a git repo"

# Check technology
ls *.csproj 2>/dev/null && echo "=== .NET Project ==="
ls package.json 2>/dev/null && echo "=== Node.js Project ==="
ls requirements.txt 2>/dev/null && echo "=== Python Project ==="
```

### Step 3: Create CLAUDE.md

**Template:**

```markdown
# [Project Name]

> [Short description]

## Project Overview

[Detailed description of the project]

## Technology Stack

- **Framework**: [e.g., .NET Core 8, React 18]
- **Database**: [e.g., PostgreSQL, SQL Server]
- **ORM**: [e.g., Entity Framework Core]
- **Authentication**: [e.g., JWT, Identity]
- **Other**: [Additional technologies]

## Project Structure

```
[Project structure here]
```

## Coding Conventions

### Naming Conventions
- **Classes**: PascalCase (e.g., `UserService`)
- **Methods**: PascalCase (e.g., `GetUserById`)
- **Variables**: camelCase (e.g., `userName`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- **Interfaces**: IPascalCase (e.g., `IUserRepository`)

### File Organization
- One class per file
- File name matches class name
- Group related files in folders

### Code Style
- Use `var` for obvious types
- Prefer async/await over Task.Result
- Use dependency injection
- Write unit tests for business logic

## Commands

| Command | Description |
|---------|-------------|
| `dotnet build` | Build the project |
| `dotnet test` | Run tests |
| `dotnet run --project WebApi` | Run the API |
| `dotnet ef migrations add [Name]` | Add migration |
| `dotnet ef database update` | Apply migrations |

## Rules for Claude

### Do
- Follow the coding conventions above
- Write clean, readable code
- Add appropriate error handling
- Use dependency injection
- Write unit tests for new features

### Don't
- Don't use deprecated APIs
- Don't hardcode secrets or connection strings
- Don't skip error handling
- Don't commit directly to main branch
- Don't ignore existing patterns in the codebase

### Before Starting Work
1. Read this CLAUDE.md file
2. Check .agent/progress.md for context
3. Run `dotnet build` to verify the project works
4. Review recent git commits

### After Completing Work
1. Run tests: `dotnet test`
2. Update .agent/progress.md
3. Commit with descriptive message
4. Update feature_list.json if applicable

## Related Documents

- [System Design Document](./system-design-[name].md)
- [Feature List](./feature_list.json)
- [Progress Log](./.agent/progress.md)
```

### Step 4: Create .claude Folder (Optional)

```bash
mkdir -p .claude
```

**Create .claude/settings.json:**

```json
{
  "projectType": "development",
  "preferredLanguage": "th",
  "autoCommit": false,
  "requireTests": true
}
```

### Step 5: Git Init (if not already initialized)

```bash
git init 2>/dev/null || echo "Git already initialized"
```

### Step 6: Initial Commit

```bash
git add CLAUDE.md
git commit -m "chore: Add CLAUDE.md project configuration"
```

## Output

```
✅ Init Project สำเร็จ!

📁 Files created:
   • CLAUDE.md

📋 CLAUDE.md contains:
   • Project description
   • Technology stack
   • Coding conventions
   • Commands reference
   • Rules for Claude

💡 Next steps:
   1. Review and customize CLAUDE.md
   2. Run /system-design-doc to create design documents
   3. Run /init-mockup to create UI mockups
   4. Run /init to start development
```

## CLAUDE.md Purpose

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         WHY CLAUDE.md?                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  CLAUDE.md is a file that Claude Code reads automatically at session start  │
│                                                                              │
│  Benefits:                                                                   │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │ 1. Context - Claude knows what this project is about              │     │
│  │ 2. Conventions - Claude uses the correct coding style             │     │
│  │ 3. Commands - Claude knows what commands to use                   │     │
│  │ 4. Rules - Claude follows the specified rules                     │     │
│  │ 5. Consistency - every session uses the same rules                │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                              │
│  Claude reads CLAUDE.md:                                                     │
│  • When starting a new session                                               │
│  • When using /init or /init-existing                                        │
│  • When using /continue                                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

> 💬 **หมายเหตุ**: คำสั่งนี้จะตอบกลับเป็นภาษาไทย
