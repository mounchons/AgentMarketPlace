---
description: สร้าง diagram เฉพาะประเภท (ER, Flow, DFD, Sequence, Sitemap, State, Class)
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*)
---

# Create Diagram Command

สร้าง diagram เฉพาะประเภทที่ต้องการ โดยไม่ต้องสร้างเอกสารทั้งฉบับ

## Input ที่ได้รับ

```
/create-diagram ER Diagram สำหรับระบบจองห้องประชุม
/create-diagram Flow Diagram กระบวนการอนุมัติลา
/create-diagram DFD Level 1 ระบบสั่งซื้อสินค้า
/create-diagram Sequence Diagram สำหรับ Login process
/create-diagram Sitemap เว็บ E-commerce
/create-diagram State Diagram สำหรับ Order status
/create-diagram $ARGUMENTS
```

## วิเคราะห์ประเภท Diagram

| Keyword | Diagram Type |
|---------|--------------|
| `ER`, `ERD`, `Entity Relationship` | ER Diagram |
| `Flow`, `Flowchart`, `Process` | Flow Diagram |
| `DFD`, `Data Flow` | Data Flow Diagram |
| `Sequence`, `API Flow` | Sequence Diagram |
| `Sitemap`, `Navigation` | Sitemap |
| `State`, `Status`, `Lifecycle` | State Diagram |
| `Class`, `Data Model` | Class Diagram |
| `Architecture`, `System` | Architecture Diagram |

---

## ER Diagram

### Input Required
- ชื่อระบบหรือ domain
- Entities หลัก (ถ้าทราบ)
- Relationships ที่สำคัญ

### Pattern

```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : "ordered in"

    CUSTOMER {
        int id PK
        string name
        string email UK
        datetime created_at
    }
    ORDER {
        int id PK
        int customer_id FK
        decimal total
        string status
    }
    ORDER_ITEM {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal unit_price
    }
    PRODUCT {
        int id PK
        string name
        decimal price
        int stock
    }
```

### Relationship Notation

| Notation | Meaning |
|----------|---------|
| `\|\|` | One (mandatory) |
| `o\|` | Zero or One |
| `\|{` | One or Many |
| `o{` | Zero or Many |

---

## Flow Diagram

### Input Required
- ชื่อ process
- Steps หลัก
- Decision points
- Actors (ถ้ามี)

### Patterns

#### Basic Process Flow
```mermaid
flowchart TD
    A[เริ่มต้น] --> B{ตรวจสอบเงื่อนไข}
    B -->|ใช่| C[ดำเนินการ A]
    B -->|ไม่| D[ดำเนินการ B]
    C --> E[บันทึกข้อมูล]
    D --> E
    E --> F[จบ]
```

#### Approval Workflow
```mermaid
flowchart TD
    A[ส่งคำขอ] --> B{ผู้จัดการอนุมัติ?}
    B -->|อนุมัติ| C{ผู้อำนวยการอนุมัติ?}
    B -->|ปฏิเสธ| D[ส่งกลับแก้ไข]
    C -->|อนุมัติ| E[ดำเนินการ]
    C -->|ปฏิเสธ| D
    D --> A
```

#### Business Process with Swimlanes
```mermaid
flowchart LR
    subgraph Customer
        A[สั่งซื้อ]
    end
    subgraph System
        B[ตรวจสอบสต็อก]
        C[สร้าง Order]
    end
    subgraph Warehouse
        D[จัดส่งสินค้า]
    end
    A --> B
    B --> C
    C --> D
```

---

## Data Flow Diagram (DFD)

### Input Required
- ชื่อระบบ
- External entities
- Processes หลัก
- Data stores

### Patterns

#### Level 0 (Context Diagram)
```mermaid
flowchart LR
    E1((ผู้ใช้งาน)) -->|คำขอ| S[ระบบหลัก]
    S -->|ผลลัพธ์| E1
    E2((ผู้ดูแลระบบ)) -->|การตั้งค่า| S
    S -->|รายงาน| E2
    S <-->|ข้อมูล| D1[(ฐานข้อมูล)]
```

#### Level 1 DFD
```mermaid
flowchart TB
    E1((ลูกค้า)) -->|1. ข้อมูลสั่งซื้อ| P1[1.0 รับคำสั่งซื้อ]
    P1 -->|2. คำสั่งซื้อ| D1[(Orders)]
    P1 -->|3. รายการสินค้า| P2[2.0 ตรวจสอบสต็อก]
    P2 <-->|4. ข้อมูลสต็อก| D2[(Inventory)]
    P2 -->|5. ยืนยันสต็อก| P3[3.0 ประมวลผลการชำระ]
    P3 -->|6. ใบเสร็จ| E1
    P3 -->|7. ข้อมูลชำระ| D3[(Payments)]
```

---

## Sequence Diagram

### Input Required
- ชื่อ process/API
- Participants (User, Frontend, API, Database, etc.)
- Request/Response flow

### Patterns

#### Basic API Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API Gateway
    participant S as Service
    participant D as Database

    U->>F: กรอกข้อมูล Login
    F->>A: POST /api/auth/login
    A->>S: validateCredentials()
    S->>D: SELECT user WHERE email=?
    D-->>S: User data
    S-->>A: JWT Token
    A-->>F: 200 OK + Token
    F-->>U: แสดงหน้า Dashboard
```

#### With Error Handling
```mermaid
sequenceDiagram
    participant C as Client
    participant A as API
    participant V as Validator
    participant DB as Database

    C->>A: POST /orders
    A->>V: validate(orderData)
    alt ข้อมูลถูกต้อง
        V-->>A: valid
        A->>DB: INSERT order
        DB-->>A: order_id
        A-->>C: 201 Created
    else ข้อมูลไม่ถูกต้อง
        V-->>A: errors[]
        A-->>C: 400 Bad Request
    end
```

#### Async Processing
```mermaid
sequenceDiagram
    participant U as User
    participant API as API Server
    participant Q as Message Queue
    participant W as Worker
    participant N as Notification

    U->>API: Submit Report Request
    API->>Q: Queue job
    API-->>U: 202 Accepted (job_id)

    Q->>W: Process job
    activate W
    W->>W: Generate Report
    W->>N: Send notification
    deactivate W
    N-->>U: Report Ready Email
```

---

## Sitemap

### Input Required
- ชื่อเว็บไซต์/แอพ
- หน้าหลัก
- User roles และ access levels

### Patterns

#### Hierarchical Sitemap
```mermaid
flowchart TD
    HOME[หน้าแรก]

    HOME --> AUTH[Authentication]
    HOME --> DASH[Dashboard]
    HOME --> ADMIN[Admin]

    AUTH --> LOGIN[Login]
    AUTH --> REGISTER[Register]
    AUTH --> FORGOT[Forgot Password]

    DASH --> OVERVIEW[Overview]
    DASH --> PROFILE[Profile]

    ADMIN --> USERS[User Management]
    ADMIN --> SETTINGS[Settings]
```

#### With Role-Based Access
```mermaid
flowchart LR
    subgraph Public
        P1[หน้าแรก]
        P2[เกี่ยวกับเรา]
        P3[ติดต่อเรา]
    end

    subgraph User["User Area"]
        U1[Dashboard]
        U2[Profile]
        U3[Orders]
    end

    subgraph Admin["Admin Area"]
        A1[User Management]
        A2[System Config]
        A3[Audit Logs]
    end
```

---

## State Diagram

### Input Required
- Entity ที่มี state
- States ทั้งหมด
- Transitions และ triggers

### Pattern

```mermaid
stateDiagram-v2
    [*] --> Draft: สร้างใหม่
    Draft --> PendingReview: ส่งตรวจสอบ
    PendingReview --> Approved: อนุมัติ
    PendingReview --> Rejected: ปฏิเสธ
    Rejected --> Draft: แก้ไข
    Approved --> Published: เผยแพร่
    Published --> Archived: เก็บเข้าคลัง
    Archived --> [*]

    note right of PendingReview: รอผู้มีอำนาจตรวจสอบ
```

---

## Class Diagram

### Input Required
- Domain/System
- Classes หลัก
- Properties และ Methods
- Relationships

### Pattern

```mermaid
classDiagram
    class User {
        +int Id
        +string Username
        +string Email
        +Login()
        +UpdateProfile()
    }

    class Order {
        +int Id
        +int UserId
        +DateTime OrderDate
        +decimal TotalAmount
        +AddItem()
        +CalculateTotal()
    }

    class OrderItem {
        +int Id
        +int OrderId
        +int ProductId
        +int Quantity
        +GetSubtotal()
    }

    User "1" --> "*" Order : places
    Order "1" --> "*" OrderItem : contains
```

---

## Output

### Success

```
✅ สร้าง [Diagram Type] สำเร็จ!

📊 Diagram Summary:
   • Type: ER Diagram
   • Entities: 8
   • Relationships: 12

```mermaid
[Generated Diagram Here]
```

💡 Next steps:
   • Copy diagram ไปใช้ในเอกสาร
   • /create-design-doc → สร้างเอกสารฉบับเต็ม
   • /create-diagram [other-type] → สร้าง diagram อื่น
```

---

## Resources

| Resource | Description |
|----------|-------------|
| `references/mermaid-patterns.md` | รูปแบบ diagrams ทั้งหมด |
| `references/architecture-patterns.md` | Architecture patterns |
| `references/troubleshooting.md` | แก้ไข Mermaid syntax errors |
