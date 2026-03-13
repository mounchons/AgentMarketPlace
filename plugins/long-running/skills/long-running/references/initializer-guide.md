# Initializer Agent Guide

Guide for Initializer Agent - use the first time when starting a new project

## 🎯 Initializer Agent Responsibilities

```
┌─────────────────────────────────────────────────────────────┐
│                    INITIALIZER AGENT                        │
│                    (called once at the start)               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Input:  "Create Todo API with .NET Core"                    │
│                                                             │
│  Output:                                                    │
│  ├── feature_list.json    (feature list, 10-20 items)      │
│  ├── .agent/config.json   (project configuration)          │
│  ├── .agent/progress.md   (first session log)              │
│  └── Git initial commit                                    │
│                                                             │
│  ❌ Do NOT implement code!                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Checklist for Initializer

- [ ] Analyze requirements from user input
- [ ] Define technology stack
- [ ] Break requirements into small features (10-20 features)
- [ ] Order by dependency
- [ ] Create feature_list.json
- [ ] Create .agent/ folder and config
- [ ] Write progress log for session 1
- [ ] Git init and initial commit (if not already done)

---

## 🔨 Work Steps

### Step 1: Analyze Requirements

**Receive input from user:**
```
"Create Todo API with ASP.NET Core Web API, EF Core, PostgreSQL"
```

**Extract information:**
- Project type: Web API
- Framework: ASP.NET Core
- ORM: Entity Framework Core
- Database: PostgreSQL
- Features implied: CRUD operations, authentication (maybe)

### Step 2: Define Technology Stack

```json
{
  "technology": {
    "framework": "ASP.NET Core 8",
    "language": "C#",
    "orm": "Entity Framework Core",
    "database": "PostgreSQL",
    "architecture": "Clean Architecture"
  }
}
```

### Step 3: Break Down Features

**Principles for breaking down features:**

1. **Setup features first**
   - Project structure
   - Database setup
   - Basic configuration

2. **Domain features**
   - Entities
   - Value Objects
   - Enums

3. **Data access features**
   - DbContext
   - Repositories
   - Migrations

4. **API features**
   - Controllers
   - Endpoints
   - DTOs

5. **Cross-cutting features**
   - Validation
   - Error handling
   - Logging

6. **Quality features**
   - Tests
   - Documentation

**Example breakdown for Todo API:**

```json
{
  "features": [
    {
      "id": 1,
      "category": "setup",
      "description": "Create ASP.NET Core Web API project structure",
      "priority": "high",
      "steps": [
        "Create solution",
        "Create WebApi project",
        "Configure Program.cs",
        "Test run the project"
      ]
    },
    {
      "id": 2,
      "category": "setup",
      "description": "Add EF Core and PostgreSQL packages",
      "priority": "high",
      "steps": [
        "Add Npgsql.EntityFrameworkCore.PostgreSQL",
        "Add Microsoft.EntityFrameworkCore.Design",
        "Configure connection string",
        "Test connection"
      ]
    },
    {
      "id": 3,
      "category": "domain",
      "description": "Create TodoItem entity",
      "priority": "high",
      "steps": [
        "Create BaseEntity class",
        "Create TodoItem class",
        "Add properties: Title, Description, IsComplete, DueDate"
      ]
    },
    {
      "id": 4,
      "category": "data",
      "description": "Create AppDbContext and Migration",
      "priority": "high",
      "steps": [
        "Create AppDbContext",
        "Configure TodoItem entity",
        "Run initial migration",
        "Update database"
      ]
    },
    {
      "id": 5,
      "category": "api",
      "description": "GET /api/todos - Retrieve all todos",
      "priority": "high",
      "steps": [
        "Create TodosController",
        "Implement GetAll endpoint",
        "Test with Swagger"
      ]
    },
    {
      "id": 6,
      "category": "api",
      "description": "GET /api/todos/{id} - Retrieve todo by id",
      "priority": "high",
      "steps": [
        "Implement GetById endpoint",
        "Handle 404 Not Found",
        "Test both success and not found"
      ]
    },
    {
      "id": 7,
      "category": "api",
      "description": "POST /api/todos - Create a new todo",
      "priority": "high",
      "steps": [
        "Create CreateTodoDto",
        "Implement Create endpoint",
        "Return 201 Created",
        "Test creation"
      ]
    },
    {
      "id": 8,
      "category": "api",
      "description": "PUT /api/todos/{id} - Update todo",
      "priority": "medium",
      "steps": [
        "Create UpdateTodoDto",
        "Implement Update endpoint",
        "Handle 404 Not Found",
        "Test update"
      ]
    },
    {
      "id": 9,
      "category": "api",
      "description": "Soft delete Todo (set is_active = false)",
      "priority": "medium",
      "steps": [
        "Implement Soft Delete endpoint (set is_active = false)",
        "Return 204 No Content",
        "Test deletion (verify is_active = false, not hard deleted)"
      ]
    },
    {
      "id": 10,
      "category": "quality",
      "description": "Input validation and error handling",
      "priority": "medium",
      "steps": [
        "Add FluentValidation",
        "Create validators",
        "Implement global exception handler"
      ]
    },
    {
      "id": 11,
      "category": "quality",
      "description": "Swagger documentation",
      "priority": "low",
      "steps": [
        "Configure Swashbuckle",
        "Add XML comments",
        "Test Swagger UI"
      ]
    }
  ]
}
```

### Step 4: Create Files

**4.1 Create .agent/ folder:**
```bash
mkdir -p .agent
```

**4.2 Create .agent/config.json:**
```json
{
  "project_name": "TodoApi",
  "description": "Todo API with ASP.NET Core",
  "technology": ".NET Core 8",
  "database": "PostgreSQL",
  "architecture": "Simple API",
  "initialized_at": "2025-01-01T10:00:00Z",
  "current_session": 1,
  "settings": {
    "auto_commit": true,
    "require_tests": false,
    "max_features_per_session": 1
  }
}
```

**4.3 Create .agent/progress.md:**
```markdown
# TodoApi - Progress Log

## Project Info
- **Name**: TodoApi
- **Technology**: ASP.NET Core 8, EF Core, PostgreSQL
- **Started**: 2025-01-01
- **Repository**: [local]

---

## Session 1 - INITIALIZER
**Date**: 2025-01-01 10:00 UTC
**Type**: Initializer
**Duration**: ~10 minutes

### What was done:
- ✅ Analyzed requirements
- ✅ Created feature_list.json (11 features)
- ✅ Created .agent/ configuration
- ✅ Initial git commit

### Current status:
- Features passed: 0/11
- Project not yet created

### Next Feature:
- **Feature #1**: Create ASP.NET Core Web API project structure
  - Priority: High
  - Category: Setup

### Notes:
- Using .NET 8 LTS
- PostgreSQL must be set up before running

---
```

**4.4 Create feature_list.json:** (as broken down in Step 3)

### Step 5: Git Operations

```bash
# If no git repo yet
git init

# Create .gitignore (if not already present)
# Add entries for the .NET project

# Commit
git add .
git commit -m "chore: Initialize long-running agent environment

- Add feature_list.json (11 features)
- Add .agent/ configuration
- Project: TodoApi with ASP.NET Core"
```

---

## 📐 Feature Sizing Guidelines

### Good feature (right size)

```json
{
  "id": 5,
  "description": "GET /api/todos - Retrieve all todos",
  "steps": [
    "Create TodosController",
    "Implement GetAll endpoint",
    "Test with Swagger"
  ]
}
```
- 3 steps
- Completable in 15-20 minutes
- Easy to test

### Feature that is too large (should be split)

```json
{
  "description": "Create entire CRUD API",
  "steps": [
    "GET all",
    "GET by id",
    "POST",
    "PUT",
    "DELETE"
  ]
}
```
→ Should be split into separate features (only for operations where `enabled: true` in design_doc_list.json)

### ⚠️ CRUD Feature Generation Rules

**Before creating CRUD features, check `design_doc_list.json`:**

```json
// If the entity has crud_operations like this:
"crud_operations": {
  "create": { "enabled": true },
  "read":   { "enabled": true },
  "update": { "enabled": false },  // ← do not create this feature
  "delete": { "enabled": true, "strategy": "soft" },
  "list":   { "enabled": true }
}
```

**Rules:**
- Only create features for operations where `enabled: true`
- Delete must use the `strategy` from the design doc (default: `"soft"`)
  - **soft**: Set `is_active = false` (do not actually delete)
  - **hard**: Actually delete from database
- Some entities may be read-only (e.g. AuditLog: read + list only)

### Feature that is too small (should be merged)

```json
{
  "description": "Add Id property to TodoItem"
}
```
→ Should be merged as part of "Create TodoItem entity"

---

## 🎨 Feature Categories

| Category | Description | Example |
|----------|-------------|----------|
| `setup` | Initial project configuration | Project structure, packages |
| `domain` | Business entities and logic | Entities, Value Objects |
| `data` | Data access layer | DbContext, Repositories |
| `api` | API endpoints | Controllers, DTOs |
| `auth` | Authentication/Authorization | JWT, Identity |
| `integration` | External services | Email, Payment |
| `quality` | Testing and documentation | Unit tests, Swagger |
| `devops` | Deployment and CI/CD | Docker, pipelines |

---

## ⚠️ Common Mistakes

### ❌ Creating an incomplete feature list

```json
// Bad - forgot setup features
{
  "features": [
    { "description": "GET /api/todos" },
    { "description": "POST /api/todos" }
  ]
}
```

### ❌ Features without clear steps

```json
// Bad
{ "description": "Create API", "steps": [] }

// Good
{
  "description": "GET /api/todos",
  "steps": [
    "Create Controller",
    "Implement endpoint",
    "Test"
  ]
}
```

### ❌ Starting to implement code in the init phase

```
❌ Wrong: Initializer creates Controller.cs
✅ Correct: Initializer only creates feature_list.json
```

### ❌ Forgetting to commit

```
❌ Wrong: Create files but don't commit
✅ Correct: git commit -m "chore: Initialize agent environment"
```

---

## 📝 Output Template

When the Initializer finishes, notify the user:

```markdown
✅ Long-Running Agent Environment Initialized!

📁 Files created:
├── feature_list.json (11 features)
├── .agent/config.json
└── .agent/progress.md

📊 Feature Summary:
- Total: 11 features
- Setup: 2
- Domain: 1
- Data: 1
- API: 5
- Quality: 2

🚀 Next Steps:
1. Run `/continue` to start working on Feature #1
2. Or view feature list with `/status`

📝 Feature #1 (next):
Create ASP.NET Core Web API project structure

> 💬 **Note**: This command responds in Thai (คำสั่งนี้จะตอบกลับเป็นภาษาไทย)
```
