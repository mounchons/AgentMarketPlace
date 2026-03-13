# Data Dictionary Template

Template for creating a comprehensive Data Dictionary

## Standard Table Template

```markdown
### Table: [table_name]

**Description**: [Table description]

**Module**: [Related module]

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
| VARCHAR(n) | Variable-length string | Names, email, descriptions |
| CHAR(n) | Fixed-length string | Identification codes, status codes |
| TEXT | Long text | Content, long descriptions |
| ENUM('a','b') | Enumerated values | Status, type fields |

### Numeric Types
| Type | Range | Use Case |
|------|-------|----------|
| INT | -2.1B to 2.1B | ID, counts |
| BIGINT | Larger range | Large IDs, timestamps |
| DECIMAL(p,s) | Exact decimal | Money, prices |
| FLOAT/DOUBLE | Approximate | General calculations |
| BOOLEAN | true/false | Flags, toggles |

### Date/Time Types
| Type | Format | Use Case |
|------|--------|----------|
| DATE | YYYY-MM-DD | Birthdate, dates |
| TIME | HH:MM:SS | Time |
| DATETIME | YYYY-MM-DD HH:MM:SS | Timestamps |
| TIMESTAMP | Auto-update | created_at, updated_at |

## Constraint Abbreviations

| Abbreviation | Meaning | Description |
|--------------|---------|-------------|
| PK | Primary Key | Primary key |
| FK | Foreign Key | Foreign key |
| UK | Unique Key | Unique value |
| NN | Not Null | Cannot be empty |
| AI | Auto Increment | Auto increment |
| CK | Check Constraint | Condition validation |

## Common Patterns

### Audit Columns
```markdown
| created_at | DATETIME | NN | CURRENT_TIMESTAMP | Created date |
| created_by | INT | FK→users.id | NULL | Created by |
| updated_at | DATETIME | | NULL | Updated date |
| updated_by | INT | FK→users.id | NULL | Updated by |
```

### Soft Delete Pattern
```markdown
| is_deleted | BOOLEAN | NN | false | Deletion status |
| deleted_at | DATETIME | | NULL | Deleted date |
| deleted_by | INT | FK→users.id | NULL | Deleted by |
```

### Status Pattern
```markdown
| status | ENUM('draft','active','inactive','archived') | NN | 'draft' | Status |
```

### Address Pattern
```markdown
| address_line1 | VARCHAR(255) | NN | - | Address line 1 |
| address_line2 | VARCHAR(255) | | NULL | Address line 2 |
| subdistrict | VARCHAR(100) | | NULL | Sub-district |
| district | VARCHAR(100) | NN | - | District |
| province | VARCHAR(100) | NN | - | Province |
| postal_code | CHAR(5) | NN | - | Postal code |
```

## Example: Complete Data Dictionary

### Table: users

**Description**: Stores system user information

**Module**: USER

| Column | Data Type | Constraints | Default | Description |
|--------|-----------|-------------|---------|-------------|
| id | INT | PK, AI | - | User ID |
| username | VARCHAR(50) | UK, NN | - | Username for login |
| email | VARCHAR(100) | UK, NN | - | Email |
| password_hash | VARCHAR(255) | NN | - | Password (bcrypt hash) |
| first_name | VARCHAR(100) | NN | - | First name |
| last_name | VARCHAR(100) | NN | - | Last name |
| phone | VARCHAR(20) | | NULL | Phone number |
| role_id | INT | FK→roles.id, NN | - | Role ID |
| department_id | INT | FK→departments.id | NULL | Department ID |
| avatar_url | VARCHAR(500) | | NULL | Profile image URL |
| is_active | BOOLEAN | NN | true | Active status |
| last_login_at | DATETIME | | NULL | Last login |
| created_at | DATETIME | NN | CURRENT_TIMESTAMP | Created date |
| updated_at | DATETIME | | NULL | Updated date |

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

**Description**: Stores order information

**Module**: ORDER

| Column | Data Type | Constraints | Default | Description |
|--------|-----------|-------------|---------|-------------|
| id | INT | PK, AI | - | Order ID |
| order_no | VARCHAR(20) | UK, NN | - | Order number (format: ORD-YYYYMMDD-XXXX) |
| user_id | INT | FK→users.id, NN | - | Orderer's user ID |
| order_date | DATETIME | NN | CURRENT_TIMESTAMP | Order date |
| subtotal | DECIMAL(12,2) | NN | 0 | Subtotal before VAT |
| vat_amount | DECIMAL(12,2) | NN | 0 | VAT amount |
| discount_amount | DECIMAL(12,2) | NN | 0 | Discount |
| total_amount | DECIMAL(12,2) | NN | 0 | Net total |
| status | ENUM('pending','confirmed','processing','shipped','delivered','cancelled') | NN | 'pending' | Status |
| shipping_address | TEXT | | NULL | Shipping address |
| note | TEXT | | NULL | Remarks |
| created_at | DATETIME | NN | CURRENT_TIMESTAMP | Created date |
| updated_at | DATETIME | | NULL | Updated date |

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
