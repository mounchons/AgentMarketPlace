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
  "references": [],
  "estimated_time": "30min",
  "passes": false,
  "tested_at": null,
  "notes": ""
}
```

---

## 📎 References Field

Feature สามารถมี references ไปยังเอกสารอื่นๆ ได้ เพื่อให้ Coding Agent ใช้เป็น reference ในการพัฒนา

### Reference Types

| Type | Example Path | Usage |
|------|-------------|-------|
| Mockup | `.mockups/login.mockup.md` | UI design reference |
| Design Doc | `docs/system-design.md` | Architecture reference |
| SQL | `sql/create_table.sql` | Database schema |
| Logic Doc | `docs/business-logic.md` | Business rules |
| API Spec | `docs/api-spec.md` | API documentation |
| Wireframe | `.mockups/wireframe.md` | Basic layout reference |

### Example Usage

```json
{
  "id": 5,
  "category": "feature",
  "description": "สร้างหน้า Login",
  "references": [
    ".mockups/login.mockup.md",
    "docs/auth-flow.md"
  ],
  "passes": false
}
```

```json
{
  "id": 10,
  "category": "data",
  "description": "สร้าง User table และ migration",
  "references": [
    "sql/create_users_table.sql",
    "docs/system-design.md#er-diagram"
  ],
  "passes": false
}
```

### Using References in Development

เมื่อ Coding Agent ทำ feature ที่มี references:

1. **ต้อง** อ่าน references ก่อนเริ่มงาน
2. **ต้อง** ใช้ mockup เป็น design reference สำหรับ UI
3. **ต้อง** ใช้ SQL/design doc เป็น schema reference
4. **ต้อง** ใช้ logic doc เป็น business rules reference
5. **ห้าม** สร้าง UI ที่แตกต่างจาก mockup
6. **ห้าม** สร้าง schema ที่แตกต่างจาก design doc

---

## 🔄 Feature Versioning (Edit Feature)

เมื่อต้องการแก้ไข feature ที่ pass แล้ว ให้สร้าง feature ใหม่แทนการแก้ไข in-place

### Related Fields

| Field | Type | Description |
|-------|------|-------------|
| `related_features` | `number[]` | Feature IDs ที่เกี่ยวข้อง |
| `supersedes` | `number` | Feature ID ที่ถูกแทนที่ |

### Example: Feature Evolution

```json
// Feature #5 (original, passed)
{
  "id": 5,
  "category": "feature",
  "description": "สร้างหน้า Login ด้วย username/password",
  "passes": true,
  "tested_at": "2025-01-10T10:00:00Z"
}

// Feature #13 (new version, supersedes #5)
{
  "id": 13,
  "category": "enhancement",
  "description": "ปรับปรุงหน้า Login - เพิ่ม OAuth login",
  "related_features": [5],
  "supersedes": 5,
  "passes": false,
  "notes": "Updated from Feature #5 - เพิ่ม OAuth support"
}
```

### Feature Relationship Diagram

```
Feature #5 (Login - Basic)
    │ passes: true
    │
    └──── superseded by ────┐
                            │
                            ▼
                    Feature #13
                    (Login - OAuth)
                    passes: false
                    related_features: [5]
                    supersedes: 5
```

### Rules for Edit Feature

1. **ห้ามแก้ไข feature ที่ pass แล้วโดยตรง**
2. **ต้องสร้าง feature ใหม่เสมอ**
3. **Feature เดิมยังคงอยู่เพื่อเก็บ history**
4. **Feature ใหม่ต้อง reference feature เดิม**
5. **ใช้ `/edit-feature` command**

### When to Use Edit Feature

| Scenario | Use /edit-feature? |
|----------|-------------------|
| Feature pass แล้ว ต้องการเพิ่ม scope | ✅ ใช่ |
| Feature pass แล้ว พบ bug | ✅ ใช่ (category: bugfix) |
| Feature ยังไม่ pass | ❌ ใช้ /continue แทน |
| ต้องการเพิ่ม feature ใหม่ | ❌ ใช้ /add-feature แทน |

---

## 💡 Tips for Feature Breakdown

### 1. ใช้ User Story Format
```
"As a [user], I want to [action], so that [benefit]"
→ แตกเป็น features ตาม action
```

### 2. ใช้ CRUD Pattern (ตาม crud_operations ที่กำหนด)
```
สำหรับทุก entity — ตรวจสอบ crud_operations จาก design_doc_list.json:
- Create (1 feature)     ← เฉพาะ create.enabled == true
- Read List (1 feature)  ← เฉพาะ list.enabled == true
- Read Detail (1 feature)← เฉพาะ read.enabled == true
- Update (1 feature)     ← เฉพาะ update.enabled == true
- Delete (1 feature)     ← เฉพาะ delete.enabled == true
  → ถ้า delete.strategy == "soft": set is_active = false (default)
  → ถ้า delete.strategy == "hard": ลบจริง (กรณีพิเศษ)

หมายเหตุ: ไม่ใช่ทุก entity ต้องมี CRUD ครบ
เช่น audit_logs = read-only (list + read เท่านั้น)
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
