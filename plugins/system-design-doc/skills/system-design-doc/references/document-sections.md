# Document Sections Detail

รายละเอียดเนื้อหาสำหรับแต่ละส่วนของเอกสารออกแบบระบบ

## 1. บทนำและภาพรวมระบบ (Introduction & Overview)

### เนื้อหาที่ต้องมี
```markdown
## 1. บทนำและภาพรวมระบบ

### 1.1 ข้อมูลโครงการ
| รายการ | รายละเอียด |
|--------|-----------|
| ชื่อโครงการ | [ชื่อ] |
| รหัสโครงการ | [รหัส] |
| เวอร์ชัน | [x.x.x] |
| วันที่จัดทำ | [dd/mm/yyyy] |
| ผู้จัดทำ | [ชื่อ-สกุล] |

### 1.2 วัตถุประสงค์
- [วัตถุประสงค์หลัก]
- [วัตถุประสงค์รอง]

### 1.3 ขอบเขตระบบ (Scope)

#### In Scope
- [รายการที่อยู่ในขอบเขต]

#### Out of Scope
- [รายการที่ไม่อยู่ในขอบเขต]

### 1.4 Stakeholders
| ผู้มีส่วนได้ส่วนเสีย | บทบาท | ความรับผิดชอบ |
|---------------------|-------|--------------|
| [ชื่อ/กลุ่ม] | [บทบาท] | [ความรับผิดชอบ] |

### 1.5 High-Level Architecture
[Mermaid diagram แสดงภาพรวมสถาปัตยกรรม]
```

## 2. ความต้องการระบบ (System Requirements)

### Functional Requirements Format
```markdown
## 2. ความต้องการระบบ

### 2.1 Functional Requirements

| รหัส | ความต้องการ | Priority | Module |
|------|-------------|----------|--------|
| FR-001 | ระบบต้องสามารถ... | High | [module] |
| FR-002 | ผู้ใช้สามารถ... | Medium | [module] |

#### FR-001: [ชื่อ Requirement]
- **คำอธิบาย**: [รายละเอียด]
- **Input**: [ข้อมูลนำเข้า]
- **Process**: [ขั้นตอนการทำงาน]
- **Output**: [ผลลัพธ์]
- **Business Rules**: [กฎทางธุรกิจที่เกี่ยวข้อง]

### 2.2 Non-Functional Requirements

| รหัส | ประเภท | ความต้องการ |
|------|--------|-------------|
| NFR-001 | Performance | Response time < 3 seconds |
| NFR-002 | Security | HTTPS, JWT authentication |
| NFR-003 | Availability | 99.9% uptime |
| NFR-004 | Scalability | รองรับ concurrent users 1,000 คน |
```

## 3. โมดูลที่เกี่ยวข้อง (Module Overview)

### Module Structure
```markdown
## 3. โมดูลที่เกี่ยวข้อง

### 3.1 รายการโมดูล

| Module | คำอธิบาย | Dependencies |
|--------|---------|--------------|
| AUTH | การยืนยันตัวตน | - |
| USER | จัดการผู้ใช้ | AUTH |
| ORDER | จัดการคำสั่งซื้อ | USER, PRODUCT |
| PRODUCT | จัดการสินค้า | - |

### 3.2 Module Dependency Diagram
[Mermaid flowchart แสดงความสัมพันธ์]

### 3.3 รายละเอียดแต่ละโมดูล

#### 3.3.1 AUTH Module
- **หน้าที่**: จัดการการ login/logout, token management
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
| id | int | PK, Auto Increment | รหัสผู้ใช้ |
| username | varchar(50) | UK, NOT NULL | ชื่อผู้ใช้ |
| email | varchar(100) | UK, NOT NULL | อีเมล |
| password_hash | varchar(255) | NOT NULL | รหัสผ่าน (hashed) |
| created_at | datetime | NOT NULL, DEFAULT NOW() | วันที่สร้าง |
| is_active | boolean | DEFAULT true | สถานะใช้งาน |
```

## 5. Data Flow Diagram

### DFD Levels
```markdown
## 5. Data Flow Diagram

### 5.1 Context Diagram (Level 0)
[Mermaid diagram]

**External Entities**:
- [Entity 1]: [คำอธิบาย]
- [Entity 2]: [คำอธิบาย]

### 5.2 Level 1 DFD
[Mermaid diagram]

**Processes**:
| Process | Input | Output | Data Store |
|---------|-------|--------|------------|
| 1.0 รับคำสั่งซื้อ | ข้อมูลสั่งซื้อ | คำสั่งซื้อ | D1: Orders |

### 5.3 Level 2 DFD - Process [X]
[Mermaid diagram สำหรับ drill-down]
```

## 6. Flow Diagrams

### Process Flow Format
```markdown
## 6. Flow Diagrams

### 6.1 [ชื่อ Process]

**วัตถุประสงค์**: [อธิบายสั้นๆ]

**Actors**: [ผู้เกี่ยวข้อง]

**Preconditions**:
- [เงื่อนไขก่อนเริ่ม]

**Postconditions**:
- [ผลลัพธ์หลังจบ]

[Mermaid flowchart]

**Steps**:
1. [ขั้นตอนที่ 1]
2. [ขั้นตอนที่ 2]
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
| User | 1:N | Order | ผู้ใช้หนึ่งคนมีได้หลายคำสั่งซื้อ |
| Order | 1:N | OrderItem | คำสั่งซื้อมีได้หลายรายการ |

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
| id | INT | PK, AUTO_INCREMENT | - | รหัสผู้ใช้ |
| username | VARCHAR(50) | UK, NOT NULL | - | ชื่อผู้ใช้ |
| email | VARCHAR(100) | UK, NOT NULL | - | อีเมล |
| password_hash | VARCHAR(255) | NOT NULL | - | รหัสผ่าน (hashed) |
| role_id | INT | FK→roles.id | NULL | รหัสบทบาท |
| status | ENUM | NOT NULL | 'active' | สถานะ: active, inactive, suspended |
| created_at | DATETIME | NOT NULL | CURRENT_TIMESTAMP | วันที่สร้าง |
| updated_at | DATETIME | | NULL | วันที่แก้ไขล่าสุด |

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

| Page ID | ชื่อหน้า | URL | Access | Description |
|---------|---------|-----|--------|-------------|
| P001 | หน้าแรก | / | Public | Landing page |
| P002 | Login | /auth/login | Public | หน้า login |
| P003 | Dashboard | /dashboard | User | หน้าหลักผู้ใช้ |

### 9.3 Navigation Structure
- Primary Navigation: [รายการเมนูหลัก]
- Secondary Navigation: [รายการเมนูรอง]
- Footer Links: [ลิงก์ footer]
```

## 10. User Roles & Permissions

### Permission Matrix Format
```markdown
## 10. User Roles & Permissions

### 10.1 Roles Definition

| Role | คำอธิบาย | Level |
|------|---------|-------|
| Super Admin | ผู้ดูแลระบบสูงสุด | 1 |
| Admin | ผู้ดูแลระบบ | 2 |
| Manager | ผู้จัดการ | 3 |
| User | ผู้ใช้งานทั่วไป | 4 |
| Guest | ผู้เยี่ยมชม | 5 |

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
- ผู้ใช้สามารถดูและแก้ไขข้อมูลของตัวเองเท่านั้น
- Manager ขึ้นไปสามารถดูข้อมูลของทีมได้

#### Rule 2: Hierarchical Access
- Role level สูงกว่าสามารถทำทุกอย่างที่ level ต่ำกว่าทำได้
```

## Screen Specification (Appendix)

### Screen Spec Format
```markdown
## Appendix A: Screen Specifications

### A.1 หน้า [ชื่อหน้า]

**Screen ID**: SCR-001
**URL**: /path/to/page
**Access**: [Role ที่เข้าถึงได้]

#### Layout
[Wireframe หรือ description]

#### Elements

| Element ID | Type | Label | Validation | Action |
|------------|------|-------|------------|--------|
| txt_username | TextBox | ชื่อผู้ใช้ | Required, 3-50 chars | - |
| txt_password | Password | รหัสผ่าน | Required, min 8 chars | - |
| btn_login | Button | เข้าสู่ระบบ | - | Submit form |

#### Business Logic
1. ตรวจสอบ username และ password
2. สร้าง JWT token เมื่อ login สำเร็จ
3. Redirect ไปหน้า Dashboard

#### Error Messages
| Condition | Message |
|-----------|---------|
| Username ไม่มีในระบบ | ไม่พบชื่อผู้ใช้นี้ในระบบ |
| Password ไม่ถูกต้อง | รหัสผ่านไม่ถูกต้อง |
```
