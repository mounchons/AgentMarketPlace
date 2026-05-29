<!-- sdd-section: dfd | doc: __PROJECT_SLUG__ | schema: 2.3.0 -->
# Section 5 — Data Flow Diagram

> [← Back to Index](00-index.md) · __PROJECT_NAME__ System Design Document

## 5. Data Flow Diagram

### 5.1 Context Diagram (Level 0)

```mermaid
flowchart LR
    E1((User)) -->|Request/Data| S[System]
    S -->|Result/Report| E1

    E2((Administrator)) -->|Configuration| S
    S -->|Report/Logs| E2

    E3((External System)) <-->|Data| S
```

### 5.2 Level 1 DFD

```mermaid
flowchart TB
    E1((User)) -->|1. Registration data| P1[1.0 Manage Users]
    P1 -->|2. User data| D1[(Users)]

    E1 -->|3. Order data| P2[2.0 Manage Orders]
    P2 <-->|4. Order data| D2[(Orders)]
    P2 <-->|5. Check stock| D3[(Products)]
    P2 -->|6. Confirm order| E1

    E2((Admin)) -->|7. View report| P3[3.0 Generate Reports]
    P3 <-->|8. Fetch data| D2
    P3 -->|9. Report| E2
```

### 5.3 Data Flow Description

| Flow ID | From | To | Data Description |
|---------|------|-----|------------------|
| 1 | User | Process 1.0 | Registration data |
| 2 | Process 1.0 | D1: Users | User data |
