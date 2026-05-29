<!-- sdd-section: requirements | doc: __PROJECT_SLUG__ | schema: 2.3.0 -->
# Section 2 — System Requirements

> [← Back to Index](00-index.md) · __PROJECT_NAME__ System Design Document

## 2. System Requirements

### 2.1 Functional Requirements

| ID | Requirement | Priority | Module |
|----|-------------|----------|--------|
| FR-001 | [Details] | High | [module] |
| FR-002 | [Details] | Medium | [module] |
| FR-003 | [Details] | Low | [module] |

#### FR-001: [Requirement Name]

**Description**: [Details]

**Input**:
- [Input data 1]
- [Input data 2]

**Process**:
1. [Step 1]
2. [Step 2]

**Output**:
- [Result]

**Business Rules**:
- [Rule 1]
- [Rule 2]

### 2.2 Non-Functional Requirements

| ID | Type | Requirement | Metric |
|----|------|-------------|--------|
| NFR-001 | Performance | Response time | < 3 seconds |
| NFR-002 | Availability | Uptime | 99.9% |
| NFR-003 | Security | Authentication | JWT, HTTPS |
| NFR-004 | Scalability | Concurrent users | 1,000+ |

### 2.3 Business Rules

| ID | Business Rule | Module |
|----|---------------|--------|
| BR-001 | [Rule] | [module] |
| BR-002 | [Rule] | [module] |

### 2.4 Acceptance Criteria

> **Purpose**: Machine-readable acceptance criteria — referenced by `qa-ui-test` traceability matrix (`/qa-trace`) and `long-running` release-gate coverage check.
>
> **ID Format**: `AC-NNN` (flat, 3-digit zero-padded). System-design-doc is the **source of truth** — other plugins reference these IDs.
>
> **Detection Pattern**: `qa-trace` greps `^AC-\d+(\.\d+)?:` so each AC must appear on its own line in the form `AC-001: <criterion>` somewhere in the document (table row, bullet, or heading all work).

| AC ID | Criterion | Module | FR Ref | UC Ref | Type |
|-------|-----------|--------|--------|--------|------|
| AC-001 | [Specific, testable criterion] | [MODULE] | FR-001 | UC-001 | functional |
| AC-002 | [Specific, testable criterion] | [MODULE] | FR-001 | UC-001 | functional |
| AC-003 | [Specific, testable criterion] | [MODULE] | BR-001 | - | business-rule |
| AC-004 | Response time < 3s for list endpoints | [MODULE] | NFR-001 | - | non-functional |

**Type values**: `functional` | `non-functional` | `business-rule`

**Authoring rules**:
- Each AC must be **independently testable** (one assertion = one AC; avoid "AND" / "OR" combiners)
- Reference at least one of: FR, BR, or NFR (preferably FR)
- If derived from a Use Case step → set UC Ref to `UC-NNN`
- Keep titles ≤ 100 chars; details belong in the linked FR/UC

**Inline AC line example** (alternative form for narrative sections):

```
AC-005: Cancel button on order detail must show confirmation dialog before issuing DELETE.
```

### 2.5 Use Cases

> **Purpose**: Structured use cases — used by `qa-create-scenario` to seed multi-step / state-machine scenarios.
>
> **ID Format**: `UC-NNN` (flat, 3-digit zero-padded).
>
> **Heading Pattern**: each UC must use the heading `### Use Case (UC-NNN): <Title>` — `qa-trace` regex: `^### Use Case \(UC-\d+\):.*$`.

#### 2.5.1 Use Case Inventory

| UC ID | Title | Module | Primary Actor | FR Refs | AC Refs |
|-------|-------|--------|---------------|---------|---------|
| UC-001 | Place Order | CHECKOUT | Customer | FR-001 | AC-001, AC-002 |
| UC-002 | Cancel Order | CHECKOUT | Customer | FR-002 | AC-005 |

#### 2.5.2 Use Case Details

### Use Case (UC-001): Place Order

| Field | Value |
|-------|-------|
| **Module** | CHECKOUT |
| **Primary Actor** | Customer |
| **Secondary Actors** | Payment Gateway |
| **Preconditions** | User is authenticated; cart has at least 1 item |
| **Postconditions** | Order created with status `confirmed`; inventory decremented |
| **FR Refs** | FR-001 |
| **AC Refs** | AC-001, AC-002 |

**Main Flow**:
1. Customer reviews cart on `/checkout`
2. Customer selects payment method
3. System validates payment input → `AC-001`
4. System reserves stock and creates order → `AC-002`
5. System redirects to `/order/{id}/confirmation`

**Alternative Flows**:

- **A1: Payment declined** — at step 3, gateway returns `declined` → show error banner, allow retry, do not deduct stock
- **A2: Stock unavailable** — at step 4, item out of stock → show "out of stock" message, remove item from cart

**Exception Flows**:

- **E1: Network timeout to gateway** — auto-retry once after 5s; if still fails, show recoverable error

### Use Case (UC-002): [Title]

| Field | Value |
|-------|-------|
| **Module** | [MODULE] |
| **Primary Actor** | [Actor] |
| **Preconditions** | [...] |
| **Postconditions** | [...] |
| **FR Refs** | FR-NNN |
| **AC Refs** | AC-NNN |

**Main Flow**:
1. [Step 1]
