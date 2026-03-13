# Feature Patterns & Templates

Collection of patterns and templates for breaking down features by project type

## 🌐 Web API Project

### .NET Core Web API

```json
{
  "features": [
    // === SETUP (1-3) ===
    {
      "id": 1,
      "category": "setup",
      "description": "Create ASP.NET Core Web API project structure",
      "priority": "high",
      "steps": [
        "Create solution and project",
        "Configure Program.cs",
        "Test run the project"
      ]
    },
    {
      "id": 2,
      "category": "setup",
      "description": "Add packages and configure database",
      "priority": "high",
      "steps": [
        "Add EF Core packages",
        "Configure connection string",
        "Test connection"
      ]
    },

    // === DOMAIN (3-5) ===
    {
      "id": 3,
      "category": "domain",
      "description": "Create [Entity] entity",
      "priority": "high",
      "steps": [
        "Create BaseEntity class",
        "Create [Entity] class",
        "Add required properties"
      ]
    },

    // === DATA ACCESS (5-7) ===
    {
      "id": 5,
      "category": "data",
      "description": "Create DbContext and Migration",
      "priority": "high",
      "steps": [
        "Create AppDbContext",
        "Configure entities",
        "Run migration",
        "Test database"
      ]
    },

    // === API ENDPOINTS (7-15) ===
    {
      "id": 7,
      "category": "api",
      "description": "GET /api/[resource] - List all",
      "priority": "high",
      "steps": [
        "Create Controller",
        "Implement endpoint",
        "Test"
      ]
    },
    {
      "id": 8,
      "category": "api",
      "description": "GET /api/[resource]/{id} - Get by ID",
      "priority": "high",
      "steps": [
        "Implement endpoint",
        "Handle 404",
        "Test"
      ]
    },
    {
      "id": 9,
      "category": "api",
      "description": "POST /api/[resource] - Create",
      "priority": "high",
      "steps": [
        "Create DTO",
        "Implement endpoint",
        "Return 201 Created",
        "Test"
      ]
    },
    {
      "id": 10,
      "category": "api",
      "description": "PUT /api/[resource]/{id} - Update",
      "priority": "medium",
      "steps": [
        "Create Update DTO",
        "Implement endpoint",
        "Test"
      ]
    },
    {
      "id": 11,
      "category": "api",
      "description": "DELETE /api/[resource]/{id} - Delete",
      "priority": "medium",
      "steps": [
        "Implement endpoint",
        "Return 204",
        "Test"
      ]
    },

    // === QUALITY (15+) ===
    {
      "id": 15,
      "category": "quality",
      "description": "Input validation",
      "priority": "medium",
      "steps": [
        "Add FluentValidation",
        "Create validators",
        "Test validation"
      ]
    },
    {
      "id": 16,
      "category": "quality",
      "description": "Global error handling",
      "priority": "medium",
      "steps": [
        "Create exception handler middleware",
        "Implement ProblemDetails",
        "Test error responses"
      ]
    },
    {
      "id": 17,
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
      "description": "Create ASP.NET MVC project",
      "steps": ["Create project", "Configure layout", "Test run"]
    },
    {
      "id": 2,
      "category": "setup",
      "description": "Configure Authentication",
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
      "description": "Setup project and dependencies",
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
- Do first, serves as foundation
- If not done, other features cannot proceed
- Core functionality

### Priority: Medium
- Do after high priority is complete
- Nice to have but not urgent
- Enhancement features

### Priority: Low
- Do when there is time
- Polish and documentation
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

Features can have references to other documents so that the Coding Agent can use them as reference during development.

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
  "description": "Create Login page",
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
  "description": "Create User table and migration",
  "references": [
    "sql/create_users_table.sql",
    "docs/system-design.md#er-diagram"
  ],
  "passes": false
}
```

### Using References in Development

When the Coding Agent works on a feature that has references:

1. **Must** read references before starting work
2. **Must** use mockup as design reference for UI
3. **Must** use SQL/design doc as schema reference
4. **Must** use logic doc as business rules reference
5. **Must not** create UI that differs from the mockup
6. **Must not** create schema that differs from the design doc

---

## 🔄 Feature Versioning (Edit Feature)

When you need to modify a feature that has already passed, create a new feature instead of editing in-place.

### Related Fields

| Field | Type | Description |
|-------|------|-------------|
| `related_features` | `number[]` | Related Feature IDs |
| `supersedes` | `number` | Feature ID that is being replaced |

### Example: Feature Evolution

```json
// Feature #5 (original, passed)
{
  "id": 5,
  "category": "feature",
  "description": "Create Login page with username/password",
  "passes": true,
  "tested_at": "2025-01-10T10:00:00Z"
}

// Feature #13 (new version, supersedes #5)
{
  "id": 13,
  "category": "enhancement",
  "description": "Improve Login page - add OAuth login",
  "related_features": [5],
  "supersedes": 5,
  "passes": false,
  "notes": "Updated from Feature #5 - added OAuth support"
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

1. **Do not modify a feature that has already passed directly**
2. **Always create a new feature**
3. **The original feature remains for history tracking**
4. **The new feature must reference the original feature**
5. **Use the `/edit-feature` command**

### When to Use Edit Feature

| Scenario | Use /edit-feature? |
|----------|-------------------|
| Feature already passed, want to expand scope | Yes |
| Feature already passed, found a bug | Yes (category: bugfix) |
| Feature not yet passed | No, use /continue instead |
| Want to add a new feature | No, use /add-feature instead |

---

## 💡 Tips for Feature Breakdown

### 1. Use User Story Format
```
"As a [user], I want to [action], so that [benefit]"
→ Break down into features by action
```

### 2. Use CRUD Pattern (according to specified crud_operations)
```
For every entity — check crud_operations from design_doc_list.json:
- Create (1 feature)     ← only if create.enabled == true
- Read List (1 feature)  ← only if list.enabled == true
- Read Detail (1 feature)← only if read.enabled == true
- Update (1 feature)     ← only if update.enabled == true
- Delete (1 feature)     ← only if delete.enabled == true
  → if delete.strategy == "soft": set is_active = false (default)
  → if delete.strategy == "hard": actually delete (special case)

Note: not every entity needs full CRUD
e.g. audit_logs = read-only (list + read only)
```

### 3. Separate Backend/Frontend
```
Feature X:
- Feature X.1: Backend API
- Feature X.2: Frontend UI
```

### 4. Separate Happy Path / Error Handling
```
Feature Y:
- Feature Y.1: Basic implementation
- Feature Y.2: Error handling
- Feature Y.3: Edge cases
```

---

## Flow Patterns (v2.0.0)

### Wizard Flow Pattern

For multi-step forms that must be completed in order:

```
Flow: Checkout
├── Step 1: Cart Review → produces CartState
├── Step 2: Shipping Info → consumes CartState, produces ShippingState
├── Step 3: Payment → consumes CartState + ShippingState, produces PaymentResult
└── Step 4: Confirmation → consumes PaymentResult, produces OrderState
```

**Features created:**
- 1 feature per step + shared component features (StepIndicator, PriceDisplay)
- Each feature has `flow_id`, `state_produces`, `state_consumes`
- Features for shared components must be done first (as dependencies)

### CRUD-Group Flow Pattern

For entity management with List + Form + Detail:

```
Flow: User Management
├── User List → consumes AuthState
├── User Form (Create/Edit) → consumes AuthState
└── User Detail → consumes AuthState
```

**Features created:**
- List, Form, Detail features all belong to the same flow
- No specific order required (type: crud-group)
- Share AuthState and shared components (DataTable, FormModal)

### Parallel Flow Pattern

For dashboards or pages with multiple independent widgets:

```
Flow: Dashboard
├── Stats Widget → consumes AuthState
├── Chart Widget → consumes AuthState
└── Recent Activity → consumes AuthState
```

**Features created:**
- Each widget is an independent feature
- Any page can be done first
- Share Layout component
