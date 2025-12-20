# Initializer Agent Guide

คู่มือสำหรับ Initializer Agent - ใช้ครั้งแรกเมื่อเริ่มโปรเจคใหม่

## 🎯 หน้าที่ของ Initializer Agent

```
┌─────────────────────────────────────────────────────────────┐
│                    INITIALIZER AGENT                        │
│                    (เรียกครั้งเดียวตอนเริ่มต้น)               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Input:  "สร้าง Todo API ด้วย .NET Core"                    │
│                                                             │
│  Output:                                                    │
│  ├── feature_list.json    (รายการ features 10-20 รายการ)   │
│  ├── .agent/config.json   (ตั้งค่า project)                │
│  ├── .agent/progress.md   (บันทึก session แรก)             │
│  └── Git initial commit                                    │
│                                                             │
│  ❌ ไม่ implement code!                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Checklist สำหรับ Initializer

- [ ] วิเคราะห์ requirements จาก user input
- [ ] กำหนด technology stack
- [ ] แตก requirements เป็น features เล็กๆ (10-20 features)
- [ ] เรียงลำดับตาม dependency
- [ ] สร้าง feature_list.json
- [ ] สร้าง .agent/ folder และ config
- [ ] เขียน progress log สำหรับ session 1
- [ ] Git init และ initial commit (ถ้ายังไม่มี)

---

## 🔨 ขั้นตอนการทำงาน

### Step 1: วิเคราะห์ Requirements

**รับ input จาก user:**
```
"สร้าง Todo API ด้วย ASP.NET Core Web API, EF Core, PostgreSQL"
```

**สกัดข้อมูล:**
- Project type: Web API
- Framework: ASP.NET Core
- ORM: Entity Framework Core
- Database: PostgreSQL
- Features implied: CRUD operations, authentication (maybe)

### Step 2: กำหนด Technology Stack

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

### Step 3: แตก Features

**หลักการแตก Features:**

1. **Setup features ก่อน**
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

**ตัวอย่างการแตก Todo API:**

```json
{
  "features": [
    {
      "id": 1,
      "category": "setup",
      "description": "สร้าง ASP.NET Core Web API project structure",
      "priority": "high",
      "steps": [
        "สร้าง solution",
        "สร้าง WebApi project",
        "ตั้งค่า Program.cs",
        "ทดสอบ run project"
      ]
    },
    {
      "id": 2,
      "category": "setup",
      "description": "เพิ่ม EF Core และ PostgreSQL packages",
      "priority": "high",
      "steps": [
        "เพิ่ม Npgsql.EntityFrameworkCore.PostgreSQL",
        "เพิ่ม Microsoft.EntityFrameworkCore.Design",
        "ตั้งค่า connection string",
        "ทดสอบ connection"
      ]
    },
    {
      "id": 3,
      "category": "domain",
      "description": "สร้าง TodoItem entity",
      "priority": "high",
      "steps": [
        "สร้าง BaseEntity class",
        "สร้าง TodoItem class",
        "เพิ่ม properties: Title, Description, IsComplete, DueDate"
      ]
    },
    {
      "id": 4,
      "category": "data",
      "description": "สร้าง AppDbContext และ Migration",
      "priority": "high",
      "steps": [
        "สร้าง AppDbContext",
        "Configure TodoItem entity",
        "รัน initial migration",
        "Update database"
      ]
    },
    {
      "id": 5,
      "category": "api",
      "description": "GET /api/todos - ดึงรายการ todos ทั้งหมด",
      "priority": "high",
      "steps": [
        "สร้าง TodosController",
        "implement GetAll endpoint",
        "ทดสอบด้วย Swagger"
      ]
    },
    {
      "id": 6,
      "category": "api",
      "description": "GET /api/todos/{id} - ดึง todo ตาม id",
      "priority": "high",
      "steps": [
        "implement GetById endpoint",
        "handle 404 Not Found",
        "ทดสอบทั้ง success และ not found"
      ]
    },
    {
      "id": 7,
      "category": "api",
      "description": "POST /api/todos - สร้าง todo ใหม่",
      "priority": "high",
      "steps": [
        "สร้าง CreateTodoDto",
        "implement Create endpoint",
        "return 201 Created",
        "ทดสอบการสร้าง"
      ]
    },
    {
      "id": 8,
      "category": "api",
      "description": "PUT /api/todos/{id} - แก้ไข todo",
      "priority": "medium",
      "steps": [
        "สร้าง UpdateTodoDto",
        "implement Update endpoint",
        "handle 404 Not Found",
        "ทดสอบการแก้ไข"
      ]
    },
    {
      "id": 9,
      "category": "api",
      "description": "DELETE /api/todos/{id} - ลบ todo",
      "priority": "medium",
      "steps": [
        "implement Delete endpoint",
        "return 204 No Content",
        "ทดสอบการลบ"
      ]
    },
    {
      "id": 10,
      "category": "quality",
      "description": "Input validation และ error handling",
      "priority": "medium",
      "steps": [
        "เพิ่ม FluentValidation",
        "สร้าง validators",
        "implement global exception handler"
      ]
    },
    {
      "id": 11,
      "category": "quality",
      "description": "Swagger documentation",
      "priority": "low",
      "steps": [
        "ตั้งค่า Swashbuckle",
        "เพิ่ม XML comments",
        "ทดสอบ Swagger UI"
      ]
    }
  ]
}
```

### Step 4: สร้างไฟล์

**4.1 สร้าง .agent/ folder:**
```bash
mkdir -p .agent
```

**4.2 สร้าง .agent/config.json:**
```json
{
  "project_name": "TodoApi",
  "description": "Todo API ด้วย ASP.NET Core",
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

**4.3 สร้าง .agent/progress.md:**
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

### สิ่งที่ทำ:
- ✅ วิเคราะห์ requirements
- ✅ สร้าง feature_list.json (11 features)
- ✅ สร้าง .agent/ configuration
- ✅ Initial git commit

### สถานะปัจจุบัน:
- Features passed: 0/11
- Project ยังไม่ได้สร้าง

### Feature ถัดไป:
- **Feature #1**: สร้าง ASP.NET Core Web API project structure
  - Priority: High
  - Category: Setup

### หมายเหตุ:
- ใช้ .NET 8 LTS
- PostgreSQL ต้อง setup ก่อน run

---
```

**4.4 สร้าง feature_list.json:** (ตามที่แตกไว้ใน Step 3)

### Step 5: Git Operations

```bash
# ถ้ายังไม่มี git repo
git init

# สร้าง .gitignore (ถ้ายังไม่มี)
# เพิ่ม entries สำหรับ .NET project

# Commit
git add .
git commit -m "chore: Initialize long-running agent environment

- Add feature_list.json (11 features)
- Add .agent/ configuration
- Project: TodoApi with ASP.NET Core"
```

---

## 📐 Feature Sizing Guidelines

### Feature ที่ดี (ขนาดพอดี)

```json
{
  "id": 5,
  "description": "GET /api/todos - ดึงรายการ todos ทั้งหมด",
  "steps": [
    "สร้าง TodosController",
    "implement GetAll endpoint",
    "ทดสอบด้วย Swagger"
  ]
}
```
- 3 steps
- ทำเสร็จใน 15-20 นาที
- Test ได้ง่าย

### Feature ที่ใหญ่เกินไป (ควรแบ่ง)

```json
{
  "description": "สร้าง CRUD API ทั้งหมด",
  "steps": [
    "GET all",
    "GET by id",
    "POST",
    "PUT",
    "DELETE"
  ]
}
```
→ ควรแบ่งเป็น 5 features แยกกัน

### Feature ที่เล็กเกินไป (ควรรวม)

```json
{
  "description": "เพิ่ม Id property ใน TodoItem"
}
```
→ ควรรวมเป็นส่วนหนึ่งของ "สร้าง TodoItem entity"

---

## 🎨 Feature Categories

| Category | Description | ตัวอย่าง |
|----------|-------------|----------|
| `setup` | การตั้งค่า project เบื้องต้น | Project structure, packages |
| `domain` | Business entities และ logic | Entities, Value Objects |
| `data` | Data access layer | DbContext, Repositories |
| `api` | API endpoints | Controllers, DTOs |
| `auth` | Authentication/Authorization | JWT, Identity |
| `integration` | External services | Email, Payment |
| `quality` | Testing และ documentation | Unit tests, Swagger |
| `devops` | Deployment และ CI/CD | Docker, pipelines |

---

## ⚠️ Common Mistakes

### ❌ สร้าง feature list ที่ไม่ครบ

```json
// ไม่ดี - ลืม setup features
{
  "features": [
    { "description": "GET /api/todos" },
    { "description": "POST /api/todos" }
  ]
}
```

### ❌ Features ไม่มี steps ที่ชัดเจน

```json
// ไม่ดี
{ "description": "สร้าง API", "steps": [] }

// ดี
{
  "description": "GET /api/todos",
  "steps": [
    "สร้าง Controller",
    "implement endpoint",
    "ทดสอบ"
  ]
}
```

### ❌ เริ่ม implement code ใน init phase

```
❌ ผิด: Initializer สร้าง Controller.cs
✅ ถูก: Initializer สร้างแค่ feature_list.json
```

### ❌ ลืม commit

```
❌ ผิด: สร้างไฟล์แล้วไม่ commit
✅ ถูก: git commit -m "chore: Initialize agent environment"
```

---

## 📝 Output Template

เมื่อ Initializer ทำเสร็จ ควรแจ้ง user:

```markdown
✅ Long-Running Agent Environment Initialized!

📁 ไฟล์ที่สร้าง:
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
1. รัน `/continue` เพื่อเริ่มทำ Feature #1
2. หรือดู feature list ด้วย `/agent-status`

📝 Feature #1 (ถัดไป):
สร้าง ASP.NET Core Web API project structure
```
