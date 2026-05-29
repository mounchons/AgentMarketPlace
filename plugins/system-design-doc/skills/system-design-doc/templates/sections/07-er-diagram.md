<!-- sdd-section: er-diagram | doc: __PROJECT_SLUG__ | schema: 2.3.0 -->
# Section 7 — ER Diagram

> [← Back to Index](00-index.md) · __PROJECT_NAME__ System Design Document

## 7. ER Diagram

### 7.1 Complete ER Diagram

```mermaid
erDiagram
    USERS ||--o{ ORDERS : places
    ORDERS ||--|{ ORDER_ITEMS : contains
    PRODUCTS ||--o{ ORDER_ITEMS : "ordered in"
    USERS }|--|| ROLES : "has"
    
    USERS {
        int id PK
        string username UK
        string email UK
        string password_hash
        int role_id FK
        boolean is_active
        datetime created_at
    }
    
    ROLES {
        int id PK
        string name UK
        string permissions
    }
    
    ORDERS {
        int id PK
        string order_no UK
        int user_id FK
        datetime order_date
        decimal total_amount
        string status
    }
    
    ORDER_ITEMS {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal unit_price
    }
    
    PRODUCTS {
        int id PK
        string name
        string description
        decimal price
        int stock_quantity
        boolean is_active
    }
```

### 7.2 Relationship Summary

| Entity 1 | Cardinality | Entity 2 | Relationship Description |
|----------|-------------|----------|-------------------------|
| USERS | 1:N | ORDERS | One user can create many orders |
| ORDERS | 1:N | ORDER_ITEMS | One order can have many items |
| PRODUCTS | 1:N | ORDER_ITEMS | One product can be ordered many times |
| USERS | N:1 | ROLES | A user has one role |
