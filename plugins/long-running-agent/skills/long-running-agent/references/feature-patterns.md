# Feature Patterns & Templates

รวม patterns และ templates สำหรับการแตก features ตามประเภทโปรเจค

## 🌐 Web API Project

### .NET Core Web API

```json
{
  "features": [
    // === SETUP (1-3) ===
    {
      "id": 1,
      "category": "setup",
      "description": "สร้าง ASP.NET Core Web API project structure",
      "priority": "high",
      "steps": [
        "สร้าง solution และ project",
        "ตั้งค่า Program.cs",
        "ทดสอบ run project"
      ]
    },
    {
      "id": 2,
      "category": "setup",
      "description": "เพิ่ม packages และตั้งค่า database",
      "priority": "high",
      "steps": [
        "เพิ่ม EF Core packages",
        "ตั้งค่า connection string",
        "ทดสอบ connection"
      ]
    },
    
    // === DOMAIN (3-5) ===
    {
      "id": 3,
      "category": "domain",
      "description": "สร้าง [Entity] entity",
      "priority": "high",
      "steps": [
        "สร้าง BaseEntity class",
        "สร้าง [Entity] class",
        "เพิ่ม properties ที่จำเป็น"
      ]
    },
    
    // === DATA ACCESS (5-7) ===
    {
      "id": 5,
      "category": "data",
      "description": "สร้าง DbContext และ Migration",
      "priority": "high",
      "steps": [
        "สร้าง AppDbContext",
        "Configure entities",
        "รัน migration",
        "ทดสอบ database"
      ]
    },
    
    // === API ENDPOINTS (7-15) ===
    {
      "id": 7,
      "category": "api",
      "description": "GET /api/[resource] - List all",
      "priority": "high",
      "steps": [
        "สร้าง Controller",
        "implement endpoint",
        "ทดสอบ"
      ]
    },
    {
      "id": 8,
      "category": "api",
      "description": "GET /api/[resource]/{id} - Get by ID",
      "priority": "high",
      "steps": [
        "implement endpoint",
        "handle 404",
        "ทดสอบ"
      ]
    },
    {
      "id": 9,
      "category": "api",
      "description": "POST /api/[resource] - Create",
      "priority": "high",
      "steps": [
        "สร้าง DTO",
        "implement endpoint",
        "return 201 Created",
        "ทดสอบ"
      ]
    },
    {
      "id": 10,
      "category": "api",
      "description": "PUT /api/[resource]/{id} - Update",
      "priority": "medium",
      "steps": [
        "สร้าง Update DTO",
        "implement endpoint",
        "ทดสอบ"
      ]
    },
    {
      "id": 11,
      "category": "api",
      "description": "DELETE /api/[resource]/{id} - Delete",
      "priority": "medium",
      "steps": [
        "implement endpoint",
        "return 204",
        "ทดสอบ"
      ]
    },
    
    // === QUALITY (15+) ===
    {
      "id": 15,
      "category": "quality",
      "description": "Input validation",
      "priority": "medium",
      "steps": [
        "เพิ่ม FluentValidation",
        "สร้าง validators",
        "ทดสอบ validation"
      ]
    },
    {
      "id": 16,
      "category": "quality",
      "description": "Global error handling",
      "priority": "medium",
      "steps": [
        "สร้าง exception handler middleware",
        "implement ProblemDetails",
        "ทดสอบ error responses"
      ]
    },
    {
      "id": 17,
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

### Node.js/Express API

```json
{
  "features": [
    {
      "id": 1,
      "category": "setup",
      "description": "Initialize Node.js project",
      "steps": ["npm init", "install express", "setup folder structure"]
    },
    {
      "id": 2,
      "category": "setup",
      "description": "Setup database connection",
      "steps": ["install sequelize/prisma", "configure connection", "test connection"]
    },
    {
      "id": 3,
      "category": "domain",
      "description": "Create [Model] model",
      "steps": ["create model file", "define schema", "add validations"]
    }
  ]
}
```

---

## 🖥️ Web Application (MVC/Blazor)

### ASP.NET MVC

```json
{
  "features": [
    // === SETUP ===
    {
      "id": 1,
      "category": "setup",
      "description": "สร้าง ASP.NET MVC project",
      "steps": ["สร้าง project", "ตั้งค่า layout", "ทดสอบ run"]
    },
    {
      "id": 2,
      "category": "setup",
      "description": "ตั้งค่า Authentication",
      "steps": ["install Identity", "configure services", "add login/register views"]
    },
    
    // === FEATURES (per module) ===
    {
      "id": 5,
      "category": "feature",
      "description": "[Module] - Index page (List)",
      "steps": ["create controller", "create view", "implement listing"]
    },
    {
      "id": 6,
      "category": "feature",
      "description": "[Module] - Details page",
      "steps": ["add action", "create view", "handle not found"]
    },
    {
      "id": 7,
      "category": "feature",
      "description": "[Module] - Create form",
      "steps": ["add GET/POST actions", "create form view", "validation"]
    },
    {
      "id": 8,
      "category": "feature",
      "description": "[Module] - Edit form",
      "steps": ["add GET/POST actions", "create form view", "validation"]
    },
    {
      "id": 9,
      "category": "feature",
      "description": "[Module] - Delete functionality",
      "steps": ["add action", "confirm dialog", "soft delete"]
    }
  ]
}
```

---

## 📱 Full-Stack Application

### Pattern: Feature Slices

```json
{
  "features": [
    // === Feature: User Registration ===
    {
      "id": 1,
      "category": "feature-backend",
      "description": "User Registration - API endpoint",
      "steps": ["create DTO", "create endpoint", "validation", "test"]
    },
    {
      "id": 2,
      "category": "feature-frontend",
      "description": "User Registration - UI form",
      "steps": ["create form component", "connect to API", "error handling"]
    },
    
    // === Feature: User Login ===
    {
      "id": 3,
      "category": "feature-backend",
      "description": "User Login - API endpoint",
      "steps": ["create endpoint", "JWT token", "test"]
    },
    {
      "id": 4,
      "category": "feature-frontend",
      "description": "User Login - UI form",
      "steps": ["create form", "store token", "redirect"]
    }
  ]
}
```

---

## 🔄 Microservices

### Pattern: Service by Service

```json
{
  "features": [
    // === Service: User Service ===
    {
      "id": 1,
      "category": "service-setup",
      "description": "User Service - Project setup",
      "steps": ["create project", "configure docker", "setup database"]
    },
    {
      "id": 2,
      "category": "service-api",
      "description": "User Service - CRUD endpoints",
      "steps": ["create endpoints", "add DTOs", "test"]
    },
    
    // === Service: Order Service ===
    {
      "id": 5,
      "category": "service-setup",
      "description": "Order Service - Project setup",
      "steps": ["create project", "configure docker", "setup database"]
    },
    
    // === Integration ===
    {
      "id": 10,
      "category": "integration",
      "description": "API Gateway setup",
      "steps": ["create gateway project", "configure routing", "test"]
    }
  ]
}
```

---

## 📊 Data Processing / ETL

```json
{
  "features": [
    {
      "id": 1,
      "category": "setup",
      "description": "Setup project และ dependencies",
      "steps": ["create project", "install packages", "configure logging"]
    },
    {
      "id": 2,
      "category": "extract",
      "description": "Extract - Read from [source]",
      "steps": ["create reader class", "handle errors", "test with sample data"]
    },
    {
      "id": 3,
      "category": "transform",
      "description": "Transform - Data cleaning",
      "steps": ["create transformer", "handle nulls", "validate data"]
    },
    {
      "id": 4,
      "category": "transform",
      "description": "Transform - Data mapping",
      "steps": ["create mapper", "handle type conversion", "test"]
    },
    {
      "id": 5,
      "category": "load",
      "description": "Load - Write to [destination]",
      "steps": ["create writer", "batch processing", "handle failures"]
    }
  ]
}
```

---

## 🎮 Priority Guidelines

### Priority: High
- ทำก่อน, เป็น foundation
- ถ้าไม่ทำ feature อื่นทำไม่ได้
- Core functionality

### Priority: Medium
- ทำหลัง high priority เสร็จ
- Nice to have แต่ไม่ urgent
- Enhancement features

### Priority: Low
- ทำเมื่อมีเวลา
- Polish และ documentation
- Optional features

---

## 🔢 Feature Numbering Convention

```
001-099: Setup & Infrastructure
100-199: Domain/Models
200-299: Data Access
300-399: Core Features (CRUD)
400-499: Advanced Features
500-599: Integration
600-699: Testing
700-799: Documentation
800-899: DevOps
900-999: Polish & Optimization
```

---

## 📋 Feature Template

```json
{
  "id": 0,
  "category": "category",
  "description": "Short description of what this feature does",
  "priority": "high|medium|low",
  "steps": [
    "Step 1: What to do first",
    "Step 2: What to do next",
    "Step 3: How to verify it works"
  ],
  "dependencies": [1, 2],
  "estimated_time": "30min",
  "passes": false,
  "tested_at": null,
  "notes": ""
}
```

---

## 💡 Tips for Feature Breakdown

### 1. ใช้ User Story Format
```
"As a [user], I want to [action], so that [benefit]"
→ แตกเป็น features ตาม action
```

### 2. ใช้ CRUD Pattern
```
สำหรับทุก entity:
- Create (1 feature)
- Read List (1 feature)
- Read Detail (1 feature)
- Update (1 feature)
- Delete (1 feature)
```

### 3. แยก Backend/Frontend
```
Feature X:
- Feature X.1: Backend API
- Feature X.2: Frontend UI
```

### 4. แยก Happy Path / Error Handling
```
Feature Y:
- Feature Y.1: Basic implementation
- Feature Y.2: Error handling
- Feature Y.3: Edge cases
```
