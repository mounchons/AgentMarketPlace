<!-- sdd-section: data-model | doc: __PROJECT_SLUG__ | schema: 2.3.0 -->
# Section 4 — Data Model

> [← Back to Index](00-index.md) · __PROJECT_NAME__ System Design Document

## 4. Data Model

### 4.1 Entity Overview

```mermaid
classDiagram
    class User {
        +int id
        +string username
        +string email
        +string password_hash
        +datetime created_at
    }
    
    class Order {
        +int id
        +int user_id
        +datetime order_date
        +decimal total_amount
        +string status
    }
    
    class OrderItem {
        +int id
        +int order_id
        +int product_id
        +int quantity
        +decimal unit_price
    }
    
    class Product {
        +int id
        +string name
        +decimal price
        +int stock
    }
    
    User "1" --> "*" Order
    Order "1" --> "*" OrderItem
    Product "1" --> "*" OrderItem
```

### 4.2 Entity Relationships

| Entity 1 | Relationship | Entity 2 | Description |
|----------|--------------|----------|-------------|
| User | 1:N | Order | One user can have many orders |
| Order | 1:N | OrderItem | One order can have many items |
| Product | 1:N | OrderItem | One product can be in many order items |
