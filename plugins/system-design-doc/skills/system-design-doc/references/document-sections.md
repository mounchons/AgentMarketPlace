# Document Sections Detail

Detailed content specifications for each section of the system design document.

## 1. Introduction & Overview

### Required Content
```markdown
## 1. Introduction & Overview

### 1.1 Project Information
| Item | Details |
|------|---------|
| Project Name | [Name] |
| Project Code | [Code] |
| Version | [x.x.x] |
| Date Created | [dd/mm/yyyy] |
| Author | [Full Name] |

### 1.2 Objectives
- [Primary objective]
- [Secondary objective]

### 1.3 System Scope

#### In Scope
- [Items in scope]

#### Out of Scope
- [Items out of scope]

### 1.4 Stakeholders
| Stakeholder | Role | Responsibility |
|-------------|------|----------------|
| [Name/Group] | [Role] | [Responsibility] |

### 1.5 High-Level Architecture
[Mermaid diagram showing architecture overview]
```

## 2. System Requirements

### Functional Requirements Format
```markdown
## 2. System Requirements

### 2.1 Functional Requirements

| ID | Requirement | Priority | Module |
|----|-------------|----------|--------|
| FR-001 | The system must be able to... | High | [module] |
| FR-002 | Users can... | Medium | [module] |

#### FR-001: [Requirement Name]
- **Description**: [Details]
- **Input**: [Input data]
- **Process**: [Processing steps]
- **Output**: [Result]
- **Business Rules**: [Related business rules]

### 2.2 Non-Functional Requirements

| ID | Type | Requirement |
|----|------|-------------|
| NFR-001 | Performance | Response time < 3 seconds |
| NFR-002 | Security | HTTPS, JWT authentication |
| NFR-003 | Availability | 99.9% uptime |
| NFR-004 | Scalability | Support 1,000 concurrent users |
```

## 3. Module Overview

### Module Structure
```markdown
## 3. Module Overview

### 3.1 Module List

| Module | Description | Dependencies |
|--------|-------------|--------------|
| AUTH | Authentication and authorization | - |
| USER | User management | AUTH |
| ORDER | Order management | USER, PRODUCT |
| PRODUCT | Product management | - |

### 3.2 Module Dependency Diagram
[Mermaid flowchart showing relationships]

### 3.3 Module Details

#### 3.3.1 AUTH Module
- **Responsibility**: Handle login/logout, token management
- **APIs**:
  - POST /api/auth/login
  - POST /api/auth/logout
  - POST /api/auth/refresh
```

## 4. Data Model

### Entity Definition Format
```markdown
## 4. Data Model

### 4.1 Entity Overview
[Mermaid class diagram]

### 4.2 Entity Details

#### 4.2.1 User Entity
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | int | PK, Auto Increment | User ID |
| username | varchar(50) | UK, NOT NULL | Username |
| email | varchar(100) | UK, NOT NULL | Email |
| password_hash | varchar(255) | NOT NULL | Password (hashed) |
| created_at | datetime | NOT NULL, DEFAULT NOW() | Created date |
| is_active | boolean | DEFAULT true | Active status |
```

## 5. Data Flow Diagram

### DFD Levels
```markdown
## 5. Data Flow Diagram

### 5.1 Context Diagram (Level 0)
[Mermaid diagram]

**External Entities**:
- [Entity 1]: [Description]
- [Entity 2]: [Description]

### 5.2 Level 1 DFD
[Mermaid diagram]

**Processes**:
| Process | Input | Output | Data Store |
|---------|-------|--------|------------|
| 1.0 Receive Order | Order data | Order record | D1: Orders |

### 5.3 Level 2 DFD - Process [X]
[Mermaid diagram for drill-down]
```

## 6. Flow Diagrams

### Process Flow Format
```markdown
## 6. Flow Diagrams

### 6.1 [Process Name]

**Objective**: [Brief description]

**Actors**: [Involved parties]

**Preconditions**:
- [Conditions before start]

**Postconditions**:
- [Results after completion]

[Mermaid flowchart]

**Steps**:
1. [Step 1]
2. [Step 2]
...
```

## 7. ER Diagram

### Format
```markdown
## 7. ER Diagram

### 7.1 Complete ER Diagram
[Mermaid erDiagram]

### 7.2 Relationship Summary
| Entity 1 | Relationship | Entity 2 | Description |
|----------|--------------|----------|-------------|
| User | 1:N | Order | One user can have many orders |
| Order | 1:N | OrderItem | One order can have many items |

### 7.3 Cardinality Notation
- ||--|| : One to One
- ||--o{ : One to Many
- }o--o{ : Many to Many
```

## 8. Data Dictionary

### Complete Format
```markdown
## 8. Data Dictionary

### 8.1 Table: users

| Column | Data Type | Constraints | Default | Description |
|--------|-----------|-------------|---------|-------------|
| id | INT | PK, AUTO_INCREMENT | - | User ID |
| username | VARCHAR(50) | UK, NOT NULL | - | Username |
| email | VARCHAR(100) | UK, NOT NULL | - | Email |
| password_hash | VARCHAR(255) | NOT NULL | - | Password (hashed) |
| role_id | INT | FK→roles.id | NULL | Role ID |
| status | ENUM | NOT NULL | 'active' | Status: active, inactive, suspended |
| created_at | DATETIME | NOT NULL | CURRENT_TIMESTAMP | Created date |
| updated_at | DATETIME | | NULL | Last modified date |

**Indexes**:
- PRIMARY KEY (id)
- UNIQUE INDEX idx_username (username)
- UNIQUE INDEX idx_email (email)
- INDEX idx_role (role_id)

**Foreign Keys**:
- FK_users_role: role_id → roles(id)
```

## 9. Sitemap

### Format
```markdown
## 9. Sitemap

### 9.1 Visual Sitemap
[Mermaid flowchart]

### 9.2 Page Inventory

| Page ID | Page Name | URL | Access | Description |
|---------|-----------|-----|--------|-------------|
| P001 | Home | / | Public | Landing page |
| P002 | Login | /auth/login | Public | Login page |
| P003 | Dashboard | /dashboard | User | Main user page |

### 9.3 Navigation Structure
- Primary Navigation: [Main menu items]
- Secondary Navigation: [Secondary menu items]
- Footer Links: [Footer links]
```

## 10. User Roles & Permissions

### Permission Matrix Format
```markdown
## 10. User Roles & Permissions

### 10.1 Roles Definition

| Role | Description | Level |
|------|-------------|-------|
| Super Admin | Highest system administrator | 1 |
| Admin | System administrator | 2 |
| Manager | Manager | 3 |
| User | General user | 4 |
| Guest | Visitor | 5 |

### 10.2 Permission Matrix

| Permission | Super Admin | Admin | Manager | User | Guest |
|------------|-------------|-------|---------|------|-------|
| View Dashboard | ✅ | ✅ | ✅ | ✅ | ❌ |
| Manage Users | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Reports | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit Settings | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create Order | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete Order | ✅ | ✅ | ✅ | ❌ | ❌ |

### 10.3 Access Control Rules

#### Rule 1: Data Ownership
- Users can only view and edit their own data
- Manager and above can view team data

#### Rule 2: Hierarchical Access
- Higher role levels can do everything that lower levels can do
```

## Screen Specification (Appendix)

### Screen Spec Format
```markdown
## Appendix A: Screen Specifications

### A.1 Page: [Page Name]

**Screen ID**: SCR-001
**URL**: /path/to/page
**Access**: [Roles that can access]

#### Layout
[Wireframe or description]

#### Elements

| Element ID | Type | Label | Validation | Action |
|------------|------|-------|------------|--------|
| txt_username | TextBox | Username | Required, 3-50 chars | - |
| txt_password | Password | Password | Required, min 8 chars | - |
| btn_login | Button | Login | - | Submit form |

#### Business Logic
1. Validate username and password
2. Create JWT token on successful login
3. Redirect to Dashboard page

#### Error Messages
| Condition | Message |
|-----------|---------|
| Username not found | ไม่พบชื่อผู้ใช้นี้ในระบบ |
| Incorrect password | รหัสผ่านไม่ถูกต้อง |
```
