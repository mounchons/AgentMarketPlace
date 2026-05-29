<!-- sdd-section: data-dictionary | doc: __PROJECT_SLUG__ | schema: 2.3.0 -->
# Section 8 — Data Dictionary

> [← Back to Index](00-index.md) · __PROJECT_NAME__ System Design Document

## 8. Data Dictionary

### 8.1 Table: users

**Description**: Stores system user information

| Column | Data Type | Constraints | Default | Description |
|--------|-----------|-------------|---------|-------------|
| id | INT | PK, AI | - | User ID |
| username | VARCHAR(50) | UK, NN | - | Username |
| email | VARCHAR(100) | UK, NN | - | Email |
| password_hash | VARCHAR(255) | NN | - | Password (hashed) |
| role_id | INT | FK, NN | - | Role ID |
| is_active | BOOLEAN | NN | true | Active status |
| created_at | DATETIME | NN | NOW() | Created date |
| updated_at | DATETIME | | NULL | Updated date |

**Indexes**:
- PRIMARY KEY (id)
- UNIQUE INDEX idx_username (username)
- UNIQUE INDEX idx_email (email)

**Foreign Keys**:
- FK_users_role: role_id → roles(id)

---

### 8.2 Table: orders

**Description**: Stores order information

| Column | Data Type | Constraints | Default | Description |
|--------|-----------|-------------|---------|-------------|
| id | INT | PK, AI | - | Order ID |
| order_no | VARCHAR(20) | UK, NN | - | Order number |
| user_id | INT | FK, NN | - | Orderer's user ID |
| order_date | DATETIME | NN | NOW() | Order date |
| subtotal | DECIMAL(12,2) | NN | 0 | Subtotal before VAT |
| vat_amount | DECIMAL(12,2) | NN | 0 | VAT |
| total_amount | DECIMAL(12,2) | NN | 0 | Net total |
| status | ENUM | NN | 'pending' | Status |
| created_at | DATETIME | NN | NOW() | Created date |

**Status Values**: pending, confirmed, processing, shipped, delivered, cancelled

---

### 8.3 Table: [table_name]

**Description**: [Description]

| Column | Data Type | Constraints | Default | Description |
|--------|-----------|-------------|---------|-------------|
| [column] | [type] | [constraints] | [default] | [description] |
