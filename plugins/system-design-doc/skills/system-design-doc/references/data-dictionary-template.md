# Data Dictionary Template

Template สำหรับสร้าง Data Dictionary ที่ครบถ้วน

## Standard Table Template

```markdown
### Table: [table_name]

**Description**: [คำอธิบายตาราง]

**Module**: [module ที่เกี่ยวข้อง]

| Column | Data Type | Constraints | Default | Description |
|--------|-----------|-------------|---------|-------------|
| id | INT | PK, AUTO_INCREMENT | - | Primary key |
| [column_name] | [type] | [constraints] | [default] | [description] |

**Indexes**:
- PRIMARY KEY (id)
- UNIQUE INDEX idx_[name] ([columns])
- INDEX idx_[name] ([columns])

**Foreign Keys**:
- FK_[table]_[ref]: [column] → [ref_table]([ref_column])

**Triggers** (if any):
- [trigger_name]: [description]
```

## Data Type Reference

### String Types
| Type | Description | Use Case |
|------|-------------|----------|
| VARCHAR(n) | Variable-length string | ชื่อ, email, descriptions |
| CHAR(n) | Fixed-length string | รหัสประจำตัว, status codes |
| TEXT | Long text | เนื้อหา, descriptions ยาว |
| ENUM('a','b') | Enumerated values | Status, type fields |

### Numeric Types
| Type | Range | Use Case |
|------|-------|----------|
| INT | -2.1B to 2.1B | ID, counts |
| BIGINT | Larger range | Large IDs, timestamps |
| DECIMAL(p,s) | Exact decimal | เงิน, ราคา |
| FLOAT/DOUBLE | Approximate | คำนวณทั่วไป |
| BOOLEAN | true/false | Flags, toggles |

### Date/Time Types
| Type | Format | Use Case |
|------|--------|----------|
| DATE | YYYY-MM-DD | วันเกิด, วันที่ |
| TIME | HH:MM:SS | เวลา |
| DATETIME | YYYY-MM-DD HH:MM:SS | Timestamps |
| TIMESTAMP | Auto-update | created_at, updated_at |

## Constraint Abbreviations

| Abbreviation | Meaning | Description |
|--------------|---------|-------------|
| PK | Primary Key | คีย์หลัก |
| FK | Foreign Key | คีย์นอก |
| UK | Unique Key | ค่าไม่ซ้ำ |
| NN | Not Null | ห้ามว่าง |
| AI | Auto Increment | เพิ่มอัตโนมัติ |
| CK | Check Constraint | ตรวจสอบเงื่อนไข |

## Common Patterns

### Audit Columns
```markdown
| created_at | DATETIME | NN | CURRENT_TIMESTAMP | วันที่สร้าง |
| created_by | INT | FK→users.id | NULL | ผู้สร้าง |
| updated_at | DATETIME | | NULL | วันที่แก้ไข |
| updated_by | INT | FK→users.id | NULL | ผู้แก้ไข |
```

### Soft Delete Pattern
```markdown
| is_deleted | BOOLEAN | NN | false | สถานะการลบ |
| deleted_at | DATETIME | | NULL | วันที่ลบ |
| deleted_by | INT | FK→users.id | NULL | ผู้ลบ |
```

### Status Pattern
```markdown
| status | ENUM('draft','active','inactive','archived') | NN | 'draft' | สถานะ |
```

### Address Pattern
```markdown
| address_line1 | VARCHAR(255) | NN | - | ที่อยู่บรรทัด 1 |
| address_line2 | VARCHAR(255) | | NULL | ที่อยู่บรรทัด 2 |
| subdistrict | VARCHAR(100) | | NULL | ตำบล/แขวง |
| district | VARCHAR(100) | NN | - | อำเภอ/เขต |
| province | VARCHAR(100) | NN | - | จังหวัด |
| postal_code | CHAR(5) | NN | - | รหัสไปรษณีย์ |
```

## Example: Complete Data Dictionary

### Table: users

**Description**: เก็บข้อมูลผู้ใช้งานระบบ

**Module**: USER

| Column | Data Type | Constraints | Default | Description |
|--------|-----------|-------------|---------|-------------|
| id | INT | PK, AI | - | รหัสผู้ใช้ |
| username | VARCHAR(50) | UK, NN | - | ชื่อผู้ใช้สำหรับ login |
| email | VARCHAR(100) | UK, NN | - | อีเมล |
| password_hash | VARCHAR(255) | NN | - | รหัสผ่าน (bcrypt hash) |
| first_name | VARCHAR(100) | NN | - | ชื่อ |
| last_name | VARCHAR(100) | NN | - | นามสกุล |
| phone | VARCHAR(20) | | NULL | เบอร์โทรศัพท์ |
| role_id | INT | FK→roles.id, NN | - | รหัสบทบาท |
| department_id | INT | FK→departments.id | NULL | รหัสแผนก |
| avatar_url | VARCHAR(500) | | NULL | URL รูปโปรไฟล์ |
| is_active | BOOLEAN | NN | true | สถานะใช้งาน |
| last_login_at | DATETIME | | NULL | เข้าสู่ระบบล่าสุด |
| created_at | DATETIME | NN | CURRENT_TIMESTAMP | วันที่สร้าง |
| updated_at | DATETIME | | NULL | วันที่แก้ไข |

**Indexes**:
- PRIMARY KEY (id)
- UNIQUE INDEX idx_username (username)
- UNIQUE INDEX idx_email (email)
- INDEX idx_role (role_id)
- INDEX idx_department (department_id)

**Foreign Keys**:
- FK_users_role: role_id → roles(id)
- FK_users_dept: department_id → departments(id)

---

### Table: orders

**Description**: เก็บข้อมูลคำสั่งซื้อ

**Module**: ORDER

| Column | Data Type | Constraints | Default | Description |
|--------|-----------|-------------|---------|-------------|
| id | INT | PK, AI | - | รหัสคำสั่งซื้อ |
| order_no | VARCHAR(20) | UK, NN | - | เลขที่คำสั่งซื้อ (format: ORD-YYYYMMDD-XXXX) |
| user_id | INT | FK→users.id, NN | - | รหัสผู้สั่งซื้อ |
| order_date | DATETIME | NN | CURRENT_TIMESTAMP | วันที่สั่งซื้อ |
| subtotal | DECIMAL(12,2) | NN | 0 | ยอดรวมก่อน VAT |
| vat_amount | DECIMAL(12,2) | NN | 0 | จำนวน VAT |
| discount_amount | DECIMAL(12,2) | NN | 0 | ส่วนลด |
| total_amount | DECIMAL(12,2) | NN | 0 | ยอดรวมสุทธิ |
| status | ENUM('pending','confirmed','processing','shipped','delivered','cancelled') | NN | 'pending' | สถานะ |
| shipping_address | TEXT | | NULL | ที่อยู่จัดส่ง |
| note | TEXT | | NULL | หมายเหตุ |
| created_at | DATETIME | NN | CURRENT_TIMESTAMP | วันที่สร้าง |
| updated_at | DATETIME | | NULL | วันที่แก้ไข |

**Indexes**:
- PRIMARY KEY (id)
- UNIQUE INDEX idx_order_no (order_no)
- INDEX idx_user (user_id)
- INDEX idx_status (status)
- INDEX idx_order_date (order_date)

**Foreign Keys**:
- FK_orders_user: user_id → users(id)

**Business Rules**:
- order_no format: ORD-YYYYMMDD-XXXX (auto-generated)
- total_amount = subtotal + vat_amount - discount_amount
- vat_amount = subtotal * 0.07 (VAT 7%)
