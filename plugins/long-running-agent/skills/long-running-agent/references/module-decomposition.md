# Module Decomposition Guide

คู่มือการแบ่ง Module และออกแบบระบบย่อยเพื่อให้ง่ายต่อการพัฒนา

---

## 1. Domain-Driven Design (DDD) Patterns

### 1.1 Bounded Context Identification

Bounded Context คือขอบเขตของ domain ที่มี ubiquitous language เป็นของตัวเอง

```
┌─────────────────────────────────────────────────────────────┐
│  ตัวอย่าง E-Commerce System                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Identity   │  │   Catalog    │  │   Orders     │      │
│  │              │  │              │  │              │      │
│  │  - User      │  │  - Product   │  │  - Order     │      │
│  │  - Role      │  │  - Category  │  │  - OrderItem │      │
│  │  - Session   │  │  - Variant   │  │  - Payment   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Inventory   │  │   Shipping   │  │  Notification│      │
│  │              │  │              │  │              │      │
│  │  - Stock     │  │  - Shipment  │  │  - Email     │      │
│  │  - Warehouse │  │  - Tracking  │  │  - SMS       │      │
│  │  - Movement  │  │  - Carrier   │  │  - Push      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Epic = Bounded Context

ใน feature_list.json แต่ละ epic ควร map กับ bounded context:

```json
{
  "epics": [
    {
      "id": "identity",
      "name": "Identity & Access",
      "bounded_context": "Identity",
      "features": [1, 2, 3, 4, 5]
    },
    {
      "id": "catalog",
      "name": "Product Catalog",
      "bounded_context": "Catalog",
      "features": [6, 7, 8, 9]
    }
  ]
}
```

### 1.3 Aggregate Mapping

Aggregate คือกลุ่มของ entities ที่มี Aggregate Root เป็นตัวควบคุม:

```
Epic: Catalog
├── Product (Aggregate Root)
│   ├── ProductVariant (Entity)
│   ├── ProductImage (Value Object)
│   └── ProductPrice (Value Object)
├── Category (Aggregate Root)
│   └── CategoryTranslation (Entity)
└── Brand (Aggregate Root)

Epic: Orders
├── Order (Aggregate Root)
│   ├── OrderItem (Entity)
│   ├── ShippingAddress (Value Object)
│   └── OrderStatus (Value Object)
└── Payment (Aggregate Root)
    └── PaymentTransaction (Entity)
```

### 1.4 Feature Mapping จาก Aggregate

สำหรับแต่ละ Aggregate ควรมี features:

| Feature Type | Description | Example |
|-------------|-------------|---------|
| Entity Creation | สร้าง entity class | "สร้าง Product entity" |
| CRUD - List | GET all with pagination | "GET /api/products" |
| CRUD - Get | GET by ID | "GET /api/products/{id}" |
| CRUD - Create | POST create | "POST /api/products" |
| CRUD - Update | PUT update | "PUT /api/products/{id}" |
| CRUD - Delete | DELETE | "DELETE /api/products/{id}" |
| Validation | Input validation | "Product validation" |
| Business Logic | Domain logic | "Calculate product price" |

---

## 2. Layer Decomposition

### 2.1 Clean Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  Controllers, ViewModels, API Endpoints, Blazor Components  │
├─────────────────────────────────────────────────────────────┤
│                    Application Layer                         │
│  Use Cases, DTOs, Validators, Mappers, Services             │
├─────────────────────────────────────────────────────────────┤
│                      Domain Layer                            │
│  Entities, Value Objects, Domain Events, Interfaces         │
├─────────────────────────────────────────────────────────────┤
│                   Infrastructure Layer                       │
│  DbContext, Repositories, External APIs, File Storage       │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Vertical Slice Architecture

แทนที่จะแบ่งตาม layer แนวนอน ให้แบ่งตาม feature แนวตั้ง:

```
┌─────────────────────────────────────────────────────────────┐
│                    Vertical Slices                           │
├──────────────┬──────────────┬──────────────┬───────────────┤
│  CreateUser  │  GetProduct  │  PlaceOrder  │  SendEmail    │
├──────────────┼──────────────┼──────────────┼───────────────┤
│  Controller  │  Controller  │  Controller  │  Background   │
│  Handler     │  Handler     │  Handler     │  Handler      │
│  Validator   │  Query       │  Command     │  Service      │
│  Repository  │  Repository  │  Repository  │  EmailClient  │
└──────────────┴──────────────┴──────────────┴───────────────┘
```

**ข้อดี:**
- Deploy ได้ทีละ feature
- ลด coupling ระหว่าง features
- ง่ายต่อการทำ microservices ในอนาคต

### 2.3 Layer-by-Layer (Traditional)

```
Phase 1: Domain Layer (ทุก entities พร้อมกัน)
├── Feature: Create User entity
├── Feature: Create Product entity
├── Feature: Create Order entity
└── Feature: Create Category entity

Phase 2: Infrastructure Layer (ทุก repos พร้อมกัน)
├── Feature: Create DbContext
├── Feature: Create UserRepository
├── Feature: Create ProductRepository
└── Feature: Create OrderRepository

Phase 3: Application Layer (ทุก services พร้อมกัน)
├── Feature: Create UserService
├── Feature: Create ProductService
└── Feature: Create OrderService

Phase 4: Presentation Layer (ทุก endpoints พร้อมกัน)
├── Feature: User API endpoints
├── Feature: Product API endpoints
└── Feature: Order API endpoints
```

---

## 3. Feature-by-Feature vs Layer-by-Layer

### 3.1 Comparison Table

| Aspect | Vertical Slice | Layer-by-Layer |
|--------|----------------|----------------|
| **Deployability** | ทีละ feature | ต้องรอครบ layer |
| **Coupling** | ต่ำ (isolated features) | สูง (shared layers) |
| **Testing** | ง่าย (test per slice) | ซับซ้อน (mock layers) |
| **Onboarding** | เข้าใจง่าย | ต้องเข้าใจทุก layer |
| **Reusability** | ต่ำ (duplicate code) | สูง (shared components) |
| **Consistency** | ต้องดูแล | มี patterns ชัด |

### 3.2 When to Use

**Vertical Slice เหมาะกับ:**
- Microservices architecture
- Agile/Scrum teams
- Features ที่ต้อง deploy บ่อย
- Teams ที่มีประสบการณ์

**Layer-by-Layer เหมาะกับ:**
- Monolith applications
- Waterfall/Traditional teams
- Features ที่มี shared logic เยอะ
- Enterprise applications

### 3.3 Hybrid Approach (แนะนำ)

```
Epic Level: Vertical Slice
├── Epic: Authentication (isolated)
│   ├── Login feature (all layers)
│   └── Register feature (all layers)
│
├── Epic: Catalog (isolated)
│   ├── Product CRUD (all layers)
│   └── Category CRUD (all layers)
│
└── Shared (Layer-by-Layer)
    ├── Common Infrastructure
    ├── Shared Domain
    └── Cross-cutting concerns
```

---

## 4. Design Doc → Features Mapping

### 4.1 ER Diagram → Features

สำหรับแต่ละ Entity ใน ER Diagram:

```
Entity: User
├── Feature: สร้าง User entity (domain)
├── Feature: สร้าง UserConfiguration (data)
├── Feature: GET /api/users (api)
├── Feature: GET /api/users/{id} (api)
├── Feature: POST /api/users (api)
├── Feature: PUT /api/users/{id} (api)
├── Feature: DELETE /api/users/{id} (api)
└── Feature: User validation (quality)

Total: 8 features per entity
```

### 4.2 Flow Diagram → Features

สำหรับแต่ละ Step ใน Flow:

```
Flow: User Registration
├── Step 1: Open registration form → Feature: Registration Page UI
├── Step 2: Input validation → Feature: Registration Validation
├── Step 3: Check email exists → Feature: Email Uniqueness Check
├── Step 4: Create user → Feature: Create User API
├── Step 5: Send welcome email → Feature: Welcome Email Service
└── Step 6: Redirect to dashboard → Feature: Post-registration Redirect

Decision Points:
├── Email exists? → Feature: Duplicate Email Handling
└── Validation failed? → Feature: Validation Error Display
```

### 4.3 UI Mockup → Features

สำหรับแต่ละ Page ใน mockup_list.json:

```
mockup_list.json:
├── 001-login.mockup.md → Feature: สร้างหน้า Login
├── 002-register.mockup.md → Feature: สร้างหน้า Register
├── 003-dashboard.mockup.md → Feature: สร้างหน้า Dashboard
├── 004-user-list.mockup.md → Feature: สร้างหน้า User List
├── 005-user-form.mockup.md → Feature: สร้างหน้า User Form
└── 006-user-detail.mockup.md → Feature: สร้างหน้า User Detail
```

---

## 5. Dependency Order

### 5.1 Standard Dependency Chain

```
┌─────────────────────────────────────────────────────────────┐
│                    Dependency Order                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Setup (project structure, packages)                     │
│            ↓                                                │
│  2. Domain (entities, value objects)                        │
│            ↓                                                │
│  3. Infrastructure (DbContext, repositories)                │
│            ↓                                                │
│  4. Application (services, handlers)                        │
│            ↓                                                │
│  5. API (controllers, endpoints)                            │
│            ↓                                                │
│  6. UI (pages, components)                                  │
│            ↓                                                │
│  7. Quality (validation, error handling)                    │
│            ↓                                                │
│  8. Documentation (API docs, README)                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Feature Dependencies Example

```json
{
  "features": [
    { "id": 1, "description": "Project setup", "dependencies": [] },
    { "id": 2, "description": "Database setup", "dependencies": [1] },
    { "id": 3, "description": "User entity", "dependencies": [1] },
    { "id": 4, "description": "DbContext", "dependencies": [2, 3] },
    { "id": 5, "description": "GET /api/users", "dependencies": [4] },
    { "id": 6, "description": "GET /api/users/{id}", "dependencies": [5] },
    { "id": 7, "description": "POST /api/users", "dependencies": [5] },
    { "id": 8, "description": "User List page", "dependencies": [5], "references": [".mockups/user-list.mockup.md"] },
    { "id": 9, "description": "User Form page", "dependencies": [7], "references": [".mockups/user-form.mockup.md"] }
  ]
}
```

---

## 6. Complexity Estimation

### 6.1 Complexity Levels

| Level | Time | Lines of Code | Dependencies |
|-------|------|---------------|--------------|
| simple | 15min | < 100 | 0-1 |
| medium | 30min | 100-300 | 2-3 |
| complex | 60min | > 300 | 4+ |

### 6.2 Complexity by Category

| Category | Typical Complexity | Notes |
|----------|-------------------|-------|
| setup | simple | One-time tasks |
| domain | medium | Depends on entity complexity |
| data | medium | Configuration heavy |
| api | simple-medium | GET = simple, POST/PUT = medium |
| feature | medium-complex | UI features tend to be complex |
| quality | medium | Cross-cutting concerns |
| test | medium | Depends on coverage requirement |
| docs | simple | Documentation only |

### 6.3 Splitting Complex Features

ถ้า feature มี complexity = complex ควรพิจารณาแยก:

```
Before (too complex):
{
  "id": 1,
  "description": "User authentication system",
  "complexity": "complex",
  "estimated_time": "2 hours"
}

After (split):
{
  "id": 1,
  "description": "Login API endpoint",
  "complexity": "medium",
  "estimated_time": "30min"
},
{
  "id": 2,
  "description": "Login page UI",
  "complexity": "medium",
  "estimated_time": "30min"
},
{
  "id": 3,
  "description": "Session management",
  "complexity": "medium",
  "estimated_time": "30min"
},
{
  "id": 4,
  "description": "Logout functionality",
  "complexity": "simple",
  "estimated_time": "15min"
}
```

---

## 7. Best Practices

### 7.1 Feature Sizing

- **3-5 subtasks** ต่อ feature
- **15-45 minutes** estimated time
- **Clear deliverable** ที่ทดสอบได้

### 7.2 Acceptance Criteria

ทุก feature ควรมี acceptance criteria ที่:
- **Specific**: ชัดเจนว่าต้องทำอะไร
- **Measurable**: วัดได้ว่าผ่านหรือไม่
- **Achievable**: ทำได้จริง
- **Relevant**: เกี่ยวข้องกับ feature
- **Testable**: ทดสอบได้

### 7.3 References

ทุก UI feature ควรมี:
- Mockup reference
- Design tokens reference
- Component specs reference

```json
{
  "references": [
    ".mockups/login.mockup.md",
    ".mockups/_design-tokens.yaml"
  ],
  "required_components": [
    "LoginForm",
    "PasswordInput",
    "SubmitButton",
    "ErrorAlert"
  ]
}
```

---

## 8. Quick Reference Card

### การแบ่ง Epic

```
1 Epic = 1 Bounded Context = 5-10 Features
```

### การแบ่ง Feature

```
1 Entity = 8 Features (entity + CRUD + validation + test)
1 UI Page = 1-2 Features (page + API integration)
1 Business Logic = 1-3 Features (core + edge cases)
```

### Dependency Priority

```
High: Setup → Domain → Data
Medium: API → UI
Low: Quality → Docs
```
