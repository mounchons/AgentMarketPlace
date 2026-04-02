# QA Advanced Plugin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add advanced testing patterns (state-machine, data-driven, network-mock, serial-group) as a separate skill + commands under the qa-ui-test plugin, backward compatible with existing qa-tracker.json.

**Architecture:** New `qa-advanced` skill with 4 reference guides + 3 new commands (`qa-create-advanced`, `qa-continue-advanced`, `qa-advanced-howto`). All test execution uses Playwright CLI only (`npx playwright test`). Schema extends qa-tracker.json with optional `advanced` field (1.3.0 → 1.4.0).

**Tech Stack:** Playwright, TypeScript, JSON schema, Claude Code plugin system (skills, commands, references)

**Spec:** `docs/superpowers/specs/2026-04-02-qa-advanced-plugin-design.md`

---

## File Structure

### Files to Create (8)

| File | Responsibility |
|------|---------------|
| `plugins/qa-ui-test/skills/qa-advanced/SKILL.md` | Skill metadata, description, trigger words, available commands overview |
| `plugins/qa-ui-test/skills/qa-advanced/references/advanced-patterns.md` | Decision guide: when to use which pattern, pattern comparison table |
| `plugins/qa-ui-test/skills/qa-advanced/references/state-machine-guide.md` | State machine notation, transition format, code generation template |
| `plugins/qa-ui-test/skills/qa-advanced/references/data-driven-guide.md` | Variants JSON format, loop generation, assertion modes |
| `plugins/qa-ui-test/skills/qa-advanced/references/network-mock-guide.md` | page.route() patterns, sequence mocking, request validation |
| `plugins/qa-ui-test/commands/qa-create-advanced.md` | Command: create advanced scenarios (--enhance / --auto modes) |
| `plugins/qa-ui-test/commands/qa-continue-advanced.md` | Command: generate scripts + run tests from advanced scenarios |
| `plugins/qa-ui-test/commands/qa-advanced-howto.md` | Command: interactive tutorial + command reference |

### Files to Modify (1)

| File | Change |
|------|--------|
| `plugins/qa-ui-test/skills/qa-ui-test/templates/qa-tracker.json` | Add `page_types` for advanced flows, bump schema_version |

---

## Task 1: SKILL.md — Skill Metadata

**Files:**
- Create: `plugins/qa-ui-test/skills/qa-advanced/SKILL.md`

- [ ] **Step 1: Create SKILL.md**

```markdown
---
name: qa-advanced
version: 1.0.0
description: |
  Advanced QA UI Testing patterns — state-machine flows, data-driven testing,
  network mocking, serial test orchestration ต่อยอดจาก qa-ui-test plugin

  รองรับ: state machine testing (status flow transitions), data-driven testing
  (parameterized variants), network mocking (API error simulation, retry sequences,
  request validation), serial group orchestration (ordered test execution, shared data)

  USE THIS SKILL when the user mentions: state machine test, flow testing,
  status transition test, data-driven test, parameterized test, test variants,
  network mock, API mock, mock error, mock timeout, serial test, test order,
  test dependency, advanced test, complex page test, conditional flow test

  Thai triggers: "ทดสอบ flow", "ทดสอบ state machine", "ทดสอบ status",
  "test หลาย data", "data-driven", "mock API", "จำลอง error", "จำลอง timeout",
  "เทสตามลำดับ", "serial test", "ทดสอบขั้นสูง", "ทดสอบ complex"
---

# QA Advanced Skill

Advanced testing patterns ที่ต่อยอดจาก qa-ui-test — รองรับหน้าที่มี logic ซับซ้อน

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     QA ADVANCED PLUGIN                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Commands:                                                       │
│  ┌──────────────────┐ ┌────────────────┐ ┌────────────────┐     │
│  │ /qa-create-      │ │ /qa-continue-  │ │ /qa-advanced-  │     │
│  │  advanced        │ │  advanced      │ │  howto         │     │
│  │ --enhance: ต่อยอด│ │ Generate +     │ │ วิธีใช้ +       │     │
│  │ --auto: สร้างใหม่ │ │ Run CLI only   │ │ command ref    │     │
│  └────────┬─────────┘ └──────┬─────────┘ └────────────────┘     │
│           │                  │                                   │
│           ▼                  ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   qa-tracker.json                        │    │
│  │  • schema 1.4.0 (backward compatible)                    │    │
│  │  • optional "advanced" field per scenario                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  4 Advanced Patterns:                                            │
│  ┌──────────────┐ ┌──────────────┐                              │
│  │ State Machine│ │ Data-Driven  │                              │
│  │ flow_type:   │ │ variants[]   │                              │
│  │ transitions[]│ │ test.each    │                              │
│  └──────────────┘ └──────────────┘                              │
│  ┌──────────────┐ ┌──────────────┐                              │
│  │ Network Mock │ │ Serial Group │                              │
│  │ page.route() │ │ describe.    │                              │
│  │ sequence[]   │ │ serial()     │                              │
│  └──────────────┘ └──────────────┘                              │
│                                                                  │
│  CRITICAL RULE:                                                  │
│  ✅ ใช้ Playwright CLI: npx playwright test                      │
│  ❌ ห้ามใช้ Playwright MCP สำหรับรัน test                         │
│  💡 MCP ใช้ได้เฉพาะ: สำรวจหน้าจริงหา selectors                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Available Commands

| Command | Description | When to use |
|---------|-------------|-------------|
| `/qa-create-advanced --enhance` | ต่อยอด scenarios เดิมด้วย advanced patterns | มี qa-tracker.json แล้ว ต้องการเพิ่ม complexity |
| `/qa-create-advanced --auto` | scan codebase สร้าง advanced scenarios ใหม่ | เริ่มต้นใหม่ หรือยังไม่มี qa-tracker.json |
| `/qa-continue-advanced` | generate scripts + run tests | หลัง create → ทำทีละ module |
| `/qa-advanced-howto` | วิธีใช้ + ตัวอย่าง + command reference | เรียนรู้วิธีใช้งาน |

## 4 Advanced Patterns

| Pattern | ใช้เมื่อ | Playwright Feature |
|---------|---------|-------------------|
| State Machine | หน้ามี status flow (order, task) | `test.describe.serial()` |
| Data-Driven | test ซ้ำๆ ต่าง input | `for...of` variants loop |
| Network Mock | ทดสอบ API error/timeout | `page.route()` |
| Serial Group | test ต้องรันตามลำดับ | `test.describe.serial()` + shared JSON |

## Quick Reference

- **Pattern decision guide**: Read `references/advanced-patterns.md`
- **State machine notation**: Read `references/state-machine-guide.md`
- **Data-driven format**: Read `references/data-driven-guide.md`
- **Network mock patterns**: Read `references/network-mock-guide.md`

## Relationship with qa-ui-test

- qa-ui-test = basic CRUD testing (ไม่แตะ)
- qa-advanced = complex flows, data-driven, mocking (ต่อยอด)
- ใช้ qa-tracker.json ร่วมกัน (backward compatible)
- commands แยกกัน: `/qa-create-scenario` vs `/qa-create-advanced`
```

- [ ] **Step 2: Verify file created**

```bash
cat plugins/qa-ui-test/skills/qa-advanced/SKILL.md | head -5
```

Expected: Shows frontmatter starting with `---`

- [ ] **Step 3: Commit**

```bash
git add plugins/qa-ui-test/skills/qa-advanced/SKILL.md
git commit -m "feat(qa-advanced): add SKILL.md metadata for advanced testing skill"
```

---

## Task 2: advanced-patterns.md — Decision Guide

**Files:**
- Create: `plugins/qa-ui-test/skills/qa-advanced/references/advanced-patterns.md`

- [ ] **Step 1: Create advanced-patterns.md**

```markdown
# Advanced Test Patterns — Decision Guide

เมื่อไหร่ควรใช้ pattern ไหน + วิธีเลือก

## Pattern Decision Matrix

```
┌──────────────────────────────────────────────────────────────┐
│  หน้าของคุณมีลักษณะแบบไหน?                                    │
│                                                               │
│  มี status/state flow?          → State Machine Pattern       │
│  (draft→pending→approved)        references/state-machine-guide│
│                                                               │
│  มี test ซ้ำๆ ต่างแค่ input?     → Data-Driven Pattern         │
│  (valid, invalid, boundary)      references/data-driven-guide  │
│                                                               │
│  มี API call ที่อาจ fail?        → Network Mock Pattern        │
│  (payment, external service)     references/network-mock-guide │
│                                                               │
│  มี test ที่ต้องรันตามลำดับ?     → Serial Group Pattern        │
│  (create→edit→delete)            references/state-machine-guide│
│                                                               │
│  ใช้หลาย pattern ร่วมกันได้!     → ดูตัวอย่างด้านล่าง           │
└──────────────────────────────────────────────────────────────┘
```

## Pattern Comparison

| Feature | State Machine | Data-Driven | Network Mock | Serial Group |
|---------|:------------:|:-----------:|:------------:|:------------:|
| Playwright feature | `describe.serial()` | `for...of` loop | `page.route()` | `describe.serial()` + shared JSON |
| qa-tracker field | `flow_type: "state-machine"` | `data_driven: true` | `mocks[]` | `serial_group` |
| Test count | 1 per transition | 1 per variant | 1 per mock scenario | 1 per step in group |
| Shared state | Within serial describe | None (independent) | None (independent) | Via shared JSON file |
| Use together | + Serial Group | + Network Mock | + Data-Driven | + State Machine |

## Combining Patterns

### State Machine + Network Mock

Order flow ที่ submit ผ่าน API:
```json
{
  "advanced": {
    "flow_type": "state-machine",
    "transitions": [
      { "from": "draft", "action": "submit", "to": "pending" }
    ],
    "mocks": [
      { "url": "**/api/orders/submit", "scenarios": [
        { "name": "success", "status": 200 },
        { "name": "validation-error", "status": 400 }
      ]}
    ]
  }
}
```

### Data-Driven + Network Mock

Form submission ที่ต้องทดสอบทั้ง input variants + API responses:
```json
{
  "advanced": {
    "data_driven": true,
    "variants_file": "test-data/TS-PRODUCT-DDT.json",
    "mocks": [
      { "url": "**/api/products", "scenarios": [
        { "name": "server-error", "status": 500 }
      ]}
    ]
  }
}
```

### Serial Group + State Machine

Order lifecycle ที่ต้อง create ก่อน แล้ว transition ตาม states:
```json
[
  { "id": "TS-ORDER-001", "advanced": {
    "serial_group": "ORDER-LIFECYCLE", "serial_order": 1
  }},
  { "id": "TS-ORDER-FLOW-001", "advanced": {
    "flow_type": "state-machine",
    "serial_group": "ORDER-LIFECYCLE", "serial_order": 2,
    "depends_on_data": { "from": "TS-ORDER-001", "field": "created_order_id" }
  }}
]
```

## When NOT to Use Advanced Patterns

- Simple CRUD pages with no state → ใช้ qa-ui-test เดิม
- Static pages (about, FAQ) → ไม่ต้อง advanced
- Pages with < 3 test scenarios → overkill
- First-time setup → ใช้ `/qa-create-scenario --auto` ก่อน แล้ว `/qa-create-advanced --enhance`
```

- [ ] **Step 2: Commit**

```bash
git add plugins/qa-ui-test/skills/qa-advanced/references/advanced-patterns.md
git commit -m "feat(qa-advanced): add advanced-patterns decision guide"
```

---

## Task 3: state-machine-guide.md — State Machine Reference

**Files:**
- Create: `plugins/qa-ui-test/skills/qa-advanced/references/state-machine-guide.md`

- [ ] **Step 1: Create state-machine-guide.md**

```markdown
# State Machine Testing Guide

วิธีสร้างและ generate test scripts สำหรับ state machine flows

## State Machine Notation

### qa-tracker.json format

```json
{
  "id": "TS-ORDER-FLOW-001",
  "title": "Order lifecycle: draft → shipped",
  "module": "ORDER",
  "priority": "critical",
  "type": "state-machine",
  "page_type": "master-data",
  "status": "pending",
  "advanced": {
    "flow_type": "state-machine",
    "states": ["draft", "pending", "approved", "shipped", "cancelled"],
    "initial_state": "draft",
    "transitions": [
      {
        "from": "draft",
        "action": "submit",
        "to": "pending",
        "trigger": "click submit button",
        "guard": "order.Items.Count > 0",
        "assertions": [
          "status badge = 'Pending'",
          "submit button hidden",
          "approve button visible"
        ]
      },
      {
        "from": "pending",
        "action": "approve",
        "to": "approved",
        "trigger": "click approve button",
        "guard": "currentUser.Role == 'Admin'",
        "assertions": [
          "status badge = 'Approved'",
          "ship button visible"
        ]
      },
      {
        "from": "approved",
        "action": "ship",
        "to": "shipped",
        "trigger": "click ship button + fill tracking number",
        "assertions": [
          "status badge = 'Shipped'",
          "tracking number visible"
        ]
      },
      {
        "from": "pending",
        "action": "cancel",
        "to": "cancelled",
        "trigger": "click cancel button + confirm dialog",
        "assertions": [
          "status badge = 'Cancelled'",
          "all action buttons hidden"
        ]
      }
    ],
    "invalid_transitions": [
      {
        "from": "shipped",
        "action": "revert to draft",
        "expected_error": "Cannot revert shipped order"
      },
      {
        "from": "cancelled",
        "action": "approve",
        "expected_error": "Cannot approve cancelled order"
      }
    ]
  }
}
```

### Fields Reference

| Field | Required | Description |
|-------|----------|-------------|
| `flow_type` | yes | Must be `"state-machine"` |
| `states` | yes | All possible states |
| `initial_state` | no | Starting state (default: first in array) |
| `transitions` | yes | Valid state transitions |
| `transitions[].from` | yes | Source state |
| `transitions[].action` | yes | Action name (for test title) |
| `transitions[].to` | yes | Target state |
| `transitions[].trigger` | yes | How to trigger in UI (human-readable) |
| `transitions[].guard` | no | Condition that must be true |
| `transitions[].assertions` | yes | What to verify after transition |
| `invalid_transitions` | no | Transitions that should fail |

## Code Generation Template

### Happy Path Flow → `test.describe.serial()`

Agent generates this pattern from transitions:

```typescript
import { test, expect } from '@playwright/test';
import { OrderPage } from './pages/order.page';
import { ScreenshotHelper } from './helpers/screenshot.helper';
import { ReportHelper } from './helpers/report.helper';
import testData from '../test-data/TS-ORDER-FLOW-001.json';

const SCENARIO_ID = 'TS-ORDER-FLOW-001';

test.describe.serial(`${SCENARIO_ID}: Order lifecycle draft → shipped`, () => {
  let orderPage: OrderPage;
  let screenshots: ScreenshotHelper;
  let report: ReportHelper;
  let orderId: string;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    orderPage = new OrderPage(page);
    screenshots = new ScreenshotHelper(page, SCENARIO_ID);
    report = new ReportHelper(SCENARIO_ID, screenshots.getRunNumber(), 'chromium', testData.environment.baseUrl);

    // Setup: create order in initial state
    await orderPage.navigate();
    await orderPage.createDraftOrder(testData.fixtures.order);
    orderId = await orderPage.getCreatedId();
    await screenshots.capture('00-setup-draft-created');
  });

  // Generate 1 test per transition:

  test('transition: draft → pending (submit)', async () => {
    const t0 = Date.now();
    await orderPage.navigateToOrder(orderId);
    await screenshots.capture('01-before-submit');
    await expect(orderPage.statusBadge).toHaveText(/draft/i);

    // Trigger: click submit button
    await orderPage.clickSubmit();
    await screenshots.capture('02-after-submit');

    // Assertions from transitions[0].assertions:
    await expect(orderPage.statusBadge).toHaveText(/pending/i);
    await expect(orderPage.submitButton).toBeHidden();
    await expect(orderPage.approveButton).toBeVisible();

    report.addStep(1, 'draft → pending (submit)', 'pass', undefined, undefined, Date.now() - t0);
  });

  test('transition: pending → approved (approve)', async () => {
    const t0 = Date.now();
    await orderPage.navigateToOrder(orderId);
    await screenshots.capture('03-before-approve');

    await orderPage.clickApprove();
    await screenshots.capture('04-after-approve');

    await expect(orderPage.statusBadge).toHaveText(/approved/i);
    await expect(orderPage.shipButton).toBeVisible();

    report.addStep(2, 'pending → approved (approve)', 'pass', undefined, undefined, Date.now() - t0);
  });

  test('transition: approved → shipped (ship)', async () => {
    const t0 = Date.now();
    await orderPage.navigateToOrder(orderId);
    await screenshots.capture('05-before-ship');

    await orderPage.clickShip();
    await orderPage.fillTrackingNumber('TRK-001');
    await screenshots.capture('06-after-ship');

    await expect(orderPage.statusBadge).toHaveText(/shipped/i);
    await expect(orderPage.trackingNumber).toBeVisible();

    report.addStep(3, 'approved → shipped (ship)', 'pass', undefined, undefined, Date.now() - t0);
  });

  test.afterAll(async () => {
    report.save(screenshots.getRunDir());
  });
});
```

### Invalid Transitions → separate describe

```typescript
test.describe(`${SCENARIO_ID}: Invalid transitions`, () => {
  test('invalid: shipped → draft (should fail)', async ({ page }) => {
    const orderPage = new OrderPage(page);
    // Navigate to a shipped order
    await orderPage.navigateToOrder(shippedOrderId);

    // Attempt invalid action
    // Expected: button not visible OR error message
    await expect(orderPage.revertButton).toBeHidden();
    // OR if button exists:
    // await orderPage.clickRevert();
    // await expect(orderPage.errorMessage).toContainText('Cannot revert shipped order');
  });
});
```

### Guard Conditions → test with/without guard met

```typescript
test('guard: submit requires items > 0', async ({ page }) => {
  // Create empty order (no items)
  const orderPage = new OrderPage(page);
  await orderPage.createDraftOrder({ ...testData.fixtures.order, items: [] });

  // Attempt submit → should fail
  await orderPage.clickSubmit();
  await expect(orderPage.errorMessage).toContainText(/items|สินค้า/i);
  await expect(orderPage.statusBadge).toHaveText(/draft/i); // still draft
});
```

## Detection Patterns

Agent 1 (State Machine Detector) looks for these patterns in code:

### C# / .NET
```
// Enum detection
public enum OrderStatus { Draft, Pending, Approved, Shipped, Cancelled }
enum TaskState { Todo, InProgress, Review, Done }

// Status field
public OrderStatus Status { get; set; }

// Transition logic
if (order.Status == OrderStatus.Draft) { order.Status = OrderStatus.Pending; }
switch (order.Status) { case OrderStatus.Draft: ... }

// Guard
if (order.Items.Count == 0) throw new ValidationException("Must have items");
```

### TypeScript / JavaScript
```
// Type union
type OrderStatus = 'draft' | 'pending' | 'approved' | 'shipped';

// Status field
status: OrderStatus;

// Transition
if (order.status === 'draft') { order.status = 'pending'; }

// Guard
if (!order.items.length) throw new Error('Must have items');
```

## CLI Execution

```bash
# Run state machine tests
npx playwright test tests/TS-ORDER-FLOW --reporter=json,list

# Run specific flow
npx playwright test tests/TS-ORDER-FLOW-001.spec.ts --reporter=json,list
```
```

- [ ] **Step 2: Commit**

```bash
git add plugins/qa-ui-test/skills/qa-advanced/references/state-machine-guide.md
git commit -m "feat(qa-advanced): add state-machine-guide reference"
```

---

## Task 4: data-driven-guide.md — Data-Driven Reference

**Files:**
- Create: `plugins/qa-ui-test/skills/qa-advanced/references/data-driven-guide.md`

- [ ] **Step 1: Create data-driven-guide.md**

```markdown
# Data-Driven Testing Guide

วิธีสร้าง parameterized tests จาก variants ใน test-data JSON

## Variants JSON Format

ใช้ `variants[]` array ใน test-data JSON file เดิม (backward compatible):

```json
{
  "fixtures": {
    "validUser": { "email": "admin@test.com", "password": "Admin@123" }
  },
  "environment": {
    "baseUrl": "http://localhost:3000"
  },
  "variants": [
    {
      "name": "valid-all-fields",
      "description": "All fields filled correctly",
      "input": {
        "name": "สินค้าทดสอบ",
        "sku": "SKU-001",
        "price": "100",
        "category": "Electronics"
      },
      "expected": {
        "result": "success",
        "message": "สร้างสำเร็จ"
      }
    },
    {
      "name": "empty-required-name",
      "description": "Name field empty (required)",
      "input": {
        "name": "",
        "sku": "SKU-002",
        "price": "100",
        "category": "Electronics"
      },
      "expected": {
        "result": "error",
        "field": "name",
        "message": "Name is required"
      }
    },
    {
      "name": "max-length-name",
      "description": "Name exceeds 200 chars",
      "input": {
        "name": "XXXXXXXXXX... (201 chars)",
        "sku": "SKU-003",
        "price": "100",
        "category": "Electronics"
      },
      "expected": {
        "result": "error",
        "field": "name",
        "message": "Maximum 200 characters"
      }
    },
    {
      "name": "negative-price",
      "description": "Price is negative",
      "input": {
        "name": "Test Product",
        "sku": "SKU-004",
        "price": "-1",
        "category": "Electronics"
      },
      "expected": {
        "result": "error",
        "field": "price",
        "message": "Price must be positive"
      }
    },
    {
      "name": "xss-in-name",
      "description": "XSS attempt in name field",
      "input": {
        "name": "<script>alert('xss')</script>",
        "sku": "SKU-005",
        "price": "100",
        "category": "Electronics"
      },
      "expected": {
        "result": "success_or_error",
        "must_not": "script executed"
      }
    },
    {
      "name": "thai-with-emoji",
      "description": "Thai text with emoji",
      "input": {
        "name": "สินค้าภาษาไทย 🎉",
        "sku": "SKU-006",
        "price": "999.50",
        "category": "Electronics"
      },
      "expected": {
        "result": "success"
      }
    },
    {
      "name": "duplicate-sku",
      "description": "SKU already exists",
      "input": {
        "name": "Another Product",
        "sku": "EXISTING-SKU",
        "price": "100",
        "category": "Electronics"
      },
      "expected": {
        "result": "error",
        "message": "SKU already exists"
      }
    },
    {
      "name": "calculation-vat",
      "description": "Price with VAT calculation",
      "input": {
        "name": "VAT Product",
        "sku": "SKU-007",
        "price": "100",
        "category": "Electronics"
      },
      "expected": {
        "result": "success",
        "computed": {
          "price_with_vat": 107,
          "vat_amount": 7
        }
      }
    }
  ]
}
```

### Variant Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | yes | Unique identifier (used in test title + screenshot folder) |
| `description` | no | Human-readable description |
| `input` | yes | Key-value pairs matching form field names |
| `expected.result` | yes | `"success"` \| `"error"` \| `"success_or_error"` |
| `expected.message` | no | Error message to check (for `"error"` result) |
| `expected.field` | no | Which field shows the error |
| `expected.must_not` | no | Content that must NOT appear (for security tests) |
| `expected.computed` | no | Computed values to verify (calculations) |

### Assertion Modes

| Mode | Meaning | Use case |
|------|---------|----------|
| `success` | Form submits, success message shown | Happy path, valid data |
| `error` | Validation error shown for specific field | Negative testing, boundary |
| `success_or_error` | Either is acceptable, but dangerous behavior must NOT happen | Security (XSS, SQLi) |

## qa-tracker.json Format

```json
{
  "id": "TS-PRODUCT-DDT-001",
  "title": "Product create — data-driven validation",
  "module": "PRODUCT",
  "priority": "high",
  "type": "data-driven",
  "status": "pending",
  "advanced": {
    "data_driven": true,
    "variants_file": "test-data/TS-PRODUCT-DDT-001.json"
  }
}
```

## Code Generation Template

Agent generates this pattern from data-driven scenarios:

```typescript
import { test, expect } from '@playwright/test';
import { ProductPage } from './pages/product.page';
import { ScreenshotHelper } from './helpers/screenshot.helper';
import { ReportHelper } from './helpers/report.helper';
import testData from '../test-data/TS-PRODUCT-DDT-001.json';

const SCENARIO_ID = 'TS-PRODUCT-DDT-001';

test.describe(`${SCENARIO_ID}: Product create — data-driven`, () => {
  const variants = testData.variants;

  for (const variant of variants) {
    test(`variant: ${variant.name} — ${variant.description || ''}`, async ({ page }) => {
      const productPage = new ProductPage(page);
      const screenshots = new ScreenshotHelper(page, `${SCENARIO_ID}-${variant.name}`);
      const report = new ReportHelper(
        `${SCENARIO_ID}-${variant.name}`,
        screenshots.getRunNumber(),
        'chromium',
        testData.environment.baseUrl
      );

      // Step 1: Navigate + open create form
      await productPage.navigate();
      await productPage.clickCreate();
      await screenshots.capture('01-form-empty');
      report.addStep(1, 'Open create form', 'pass');

      // Step 2: Fill form with variant input
      for (const [field, value] of Object.entries(variant.input)) {
        await productPage.fillField(field, String(value));
      }
      await screenshots.capture('02-form-filled');
      report.addStep(2, `Fill form: ${variant.name}`, 'pass');

      // Step 3: Submit
      await productPage.submit();
      await screenshots.capture('03-after-submit');

      // Step 4: Assert based on expected result
      const t0 = Date.now();
      try {
        if (variant.expected.result === 'success') {
          await expect(productPage.successMessage).toBeVisible();
          if (variant.expected.message) {
            await expect(productPage.successMessage).toContainText(variant.expected.message);
          }
          // Check computed values if any
          if (variant.expected.computed) {
            for (const [field, value] of Object.entries(variant.expected.computed)) {
              await expect(productPage.getComputedField(field)).toHaveText(String(value));
            }
          }
        } else if (variant.expected.result === 'error') {
          if (variant.expected.field) {
            await expect(productPage.getFieldError(variant.expected.field)).toContainText(variant.expected.message);
          } else {
            await expect(productPage.errorMessage).toContainText(variant.expected.message);
          }
        } else if (variant.expected.result === 'success_or_error') {
          // Security test: just verify no dangerous behavior
          const content = await page.content();
          if (variant.expected.must_not) {
            expect(content).not.toContain(variant.expected.must_not);
          }
        }
        report.addStep(3, `Assert: ${variant.expected.result}`, 'pass', undefined, undefined, Date.now() - t0);
      } catch (error) {
        await screenshots.capture('04-assertion-failed');
        report.addStep(3, `Assert: ${variant.expected.result}`, 'fail', undefined, String(error), Date.now() - t0);
        throw error;
      }

      await screenshots.capture('04-result');
      report.save(screenshots.getRunDir());
    });
  }
});
```

## Detection Patterns

Agent 3 (Validation & Business Logic Detector) converts detected rules to variants:

| Detected Rule | Generated Variant |
|---------------|-------------------|
| `[Required]` on field | `{ name: "empty-{field}", input: { field: "" }, expected: { result: "error" } }` |
| `[MaxLength(N)]` | `{ name: "max-{field}", input: { field: "X".repeat(N+1) }, expected: { result: "error" } }` |
| `[Range(min, max)]` | 2 variants: below min + above max |
| Unique constraint | `{ name: "duplicate-{field}", expected: { result: "error" } }` |
| Calculation rule | `{ name: "calc-{name}", expected: { computed: { field: value } } }` |

## CLI Execution

```bash
# Run data-driven tests
npx playwright test tests/TS-PRODUCT-DDT --reporter=json,list

# Run specific variant (by grep)
npx playwright test tests/TS-PRODUCT-DDT-001.spec.ts --grep "variant: xss" --reporter=json,list
```
```

- [ ] **Step 2: Commit**

```bash
git add plugins/qa-ui-test/skills/qa-advanced/references/data-driven-guide.md
git commit -m "feat(qa-advanced): add data-driven-guide reference"
```

---

## Task 5: network-mock-guide.md — Network Mock Reference

**Files:**
- Create: `plugins/qa-ui-test/skills/qa-advanced/references/network-mock-guide.md`

- [ ] **Step 1: Create network-mock-guide.md**

```markdown
# Network Mock Testing Guide

วิธีใช้ `page.route()` จำลอง API responses, error scenarios, timeouts, retry sequences

## Mock Definition Format

### qa-tracker.json format

```json
{
  "id": "TS-CART-MOCK-001",
  "title": "Payment API — error handling",
  "module": "CART",
  "priority": "critical",
  "type": "network-mock",
  "status": "pending",
  "advanced": {
    "mocks": [
      {
        "url": "**/api/payment",
        "method": "POST",
        "scenarios": [
          {
            "name": "success",
            "status": 200,
            "body": { "txn_id": "TXN-001", "status": "completed" }
          },
          {
            "name": "card-declined",
            "status": 400,
            "body": { "error": "Card declined", "code": "CARD_DECLINED" }
          },
          {
            "name": "insufficient-funds",
            "status": 402,
            "body": { "error": "Insufficient funds", "code": "INSUFFICIENT_FUNDS" }
          },
          {
            "name": "server-error",
            "status": 500,
            "body": { "error": "Internal server error" }
          },
          {
            "name": "timeout",
            "delay_ms": 31000
          },
          {
            "name": "slow-response",
            "delay_ms": 5000,
            "status": 200,
            "body": { "txn_id": "TXN-002" }
          },
          {
            "name": "retry-then-success",
            "sequence": [
              { "status": 500, "body": { "error": "Temporary failure" } },
              { "status": 200, "body": { "txn_id": "TXN-003" } }
            ]
          },
          {
            "name": "network-error",
            "abort": true
          }
        ],
        "validate_request": {
          "required_fields": ["card_number", "amount", "currency"],
          "body_schema": {
            "card_number": "string",
            "amount": "number",
            "currency": "string"
          }
        }
      }
    ]
  }
}
```

### Mock Scenario Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | yes | Unique name (used in test title) |
| `status` | no | HTTP status code |
| `body` | no | Response body (JSON) |
| `delay_ms` | no | Delay before responding (simulate slow/timeout) |
| `sequence` | no | Array of responses (for retry testing) |
| `abort` | no | Abort request (simulate network error) |
| `headers` | no | Custom response headers |

### Request Validation Fields

| Field | Required | Description |
|-------|----------|-------------|
| `required_fields` | no | Fields that must exist in request body |
| `body_schema` | no | Type checking for request body fields |

## Code Generation Templates

### Basic Mock — success/error

```typescript
test('mock: card-declined — shows error', async ({ page }) => {
  const cartPage = new CartPage(page);
  const screenshots = new ScreenshotHelper(page, `${SCENARIO_ID}-declined`);

  // Setup mock BEFORE navigation
  await page.route('**/api/payment', async (route) => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Card declined', code: 'CARD_DECLINED' }),
    });
  });

  await cartPage.navigate();
  await cartPage.fillPayment(testData.fixtures.validCard);
  await cartPage.submitPayment();
  await screenshots.capture('01-card-declined');

  // UI shows user-friendly error
  await expect(cartPage.errorMessage).toContainText(/declined|ปฏิเสธ/i);
  // Must NOT show raw error code
  await expect(cartPage.errorMessage).not.toContainText('CARD_DECLINED');
});
```

### Request Validation Mock

```typescript
test('mock: success — validates request body', async ({ page }) => {
  const cartPage = new CartPage(page);
  const screenshots = new ScreenshotHelper(page, `${SCENARIO_ID}-success`);
  let capturedRequest: any = null;

  await page.route('**/api/payment', async (route, request) => {
    // Capture and validate request
    capturedRequest = request.postDataJSON();

    // Validate required fields
    expect(capturedRequest).toHaveProperty('card_number');
    expect(capturedRequest).toHaveProperty('amount');
    expect(capturedRequest).toHaveProperty('currency');

    // Validate types
    expect(typeof capturedRequest.card_number).toBe('string');
    expect(typeof capturedRequest.amount).toBe('number');
    expect(typeof capturedRequest.currency).toBe('string');

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ txn_id: 'TXN-001', status: 'completed' }),
    });
  });

  await cartPage.navigate();
  await cartPage.fillPayment(testData.fixtures.validCard);
  await cartPage.submitPayment();
  await screenshots.capture('01-payment-success');

  await expect(cartPage.successMessage).toBeVisible();
  // Verify request was actually sent
  expect(capturedRequest).not.toBeNull();
});
```

### Timeout Mock

```typescript
test('mock: timeout — shows timeout message', async ({ page }) => {
  const screenshots = new ScreenshotHelper(page, `${SCENARIO_ID}-timeout`);

  await page.route('**/api/payment', async (route) => {
    // Delay longer than page timeout → triggers timeout handling
    await new Promise(resolve => setTimeout(resolve, 31000));
    await route.fulfill({ status: 200 });
  });

  const cartPage = new CartPage(page);
  await cartPage.navigate();
  await cartPage.fillPayment(testData.fixtures.validCard);
  await cartPage.submitPayment();
  await screenshots.capture('01-timeout');

  await expect(cartPage.errorMessage).toContainText(/timeout|หมดเวลา|ลองอีกครั้ง/i);
});
```

### Slow Response Mock

```typescript
test('mock: slow-response — shows loading state', async ({ page }) => {
  const screenshots = new ScreenshotHelper(page, `${SCENARIO_ID}-slow`);

  await page.route('**/api/payment', async (route) => {
    await new Promise(resolve => setTimeout(resolve, 5000));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ txn_id: 'TXN-002' }),
    });
  });

  const cartPage = new CartPage(page);
  await cartPage.navigate();
  await cartPage.fillPayment(testData.fixtures.validCard);
  await cartPage.submitPayment();

  // Loading indicator should appear during delay
  await expect(cartPage.loadingSpinner).toBeVisible();
  await screenshots.capture('01-loading');

  // Wait for response
  await expect(cartPage.successMessage).toBeVisible({ timeout: 10000 });
  await screenshots.capture('02-success-after-delay');
});
```

### Retry Sequence Mock

```typescript
test('mock: retry-then-success — recovers after failure', async ({ page }) => {
  const screenshots = new ScreenshotHelper(page, `${SCENARIO_ID}-retry`);
  let callCount = 0;

  await page.route('**/api/payment', async (route, request) => {
    callCount++;

    if (callCount === 1) {
      // First call: fail
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Temporary failure' }),
      });
    } else {
      // Validate request is still correct on retry
      const body = request.postDataJSON();
      expect(body).toHaveProperty('card_number');
      expect(body).toHaveProperty('amount');

      // Second call: success
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ txn_id: 'TXN-003' }),
      });
    }
  });

  const cartPage = new CartPage(page);
  await cartPage.navigate();
  await cartPage.fillPayment(testData.fixtures.validCard);
  await cartPage.submitPayment();
  await screenshots.capture('01-first-attempt-fail');

  // Wait for auto-retry or click retry button
  if (await cartPage.retryButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await cartPage.retryButton.click();
  }
  await screenshots.capture('02-retry-success');

  await expect(cartPage.successMessage).toBeVisible({ timeout: 10000 });
  expect(callCount).toBe(2);
});
```

### Network Error (Abort) Mock

```typescript
test('mock: network-error — shows offline message', async ({ page }) => {
  const screenshots = new ScreenshotHelper(page, `${SCENARIO_ID}-abort`);

  await page.route('**/api/payment', async (route) => {
    await route.abort('connectionrefused');
  });

  const cartPage = new CartPage(page);
  await cartPage.navigate();
  await cartPage.fillPayment(testData.fixtures.validCard);
  await cartPage.submitPayment();
  await screenshots.capture('01-network-error');

  await expect(cartPage.errorMessage).toContainText(/network|เครือข่าย|offline/i);
});
```

## Detection Patterns

Agent 2 (API Endpoint Detector) looks for:

| Pattern | Generate |
|---------|----------|
| `[HttpPost]` / `router.post()` | Mock for POST endpoint |
| `return BadRequest()` / `res.status(400)` | 400 mock scenario |
| `return NotFound()` / `res.status(404)` | 404 mock scenario |
| `catch (Exception)` / `catch(error)` | 500 mock scenario |
| `fetch(...).then(...)` without timeout | timeout mock scenario |
| `retry` / `retryCount` in frontend | retry sequence mock |
| `AbortController` / signal handling | abort mock scenario |

## Assertions Checklist

For every mock scenario, verify:
- [ ] UI shows user-friendly message (not raw error)
- [ ] No raw status codes visible to user
- [ ] No stack traces visible
- [ ] Loading state appears/disappears correctly
- [ ] Form data is NOT lost after error
- [ ] Retry button works (if applicable)
- [ ] Request body is correct (validate_request)

## CLI Execution

```bash
# Run mock tests
npx playwright test tests/TS-CART-MOCK --reporter=json,list

# Run specific mock scenario
npx playwright test tests/TS-CART-MOCK-001.spec.ts --grep "timeout" --reporter=json,list
```
```

- [ ] **Step 2: Commit**

```bash
git add plugins/qa-ui-test/skills/qa-advanced/references/network-mock-guide.md
git commit -m "feat(qa-advanced): add network-mock-guide reference"
```

---

## Task 6: qa-tracker.json Template Update

**Files:**
- Modify: `plugins/qa-ui-test/skills/qa-ui-test/templates/qa-tracker.json`

- [ ] **Step 1: Update qa-tracker.json template**

```json
{
  "schema_version": "1.4.0",
  "project": "",
  "base_url": "http://localhost:3000",
  "technology": "",
  "login_url": "/login",
  "model_config": {
    "scenario_creator": "sonnet",
    "test_runner": "sonnet",
    "reviewer": "opus",
    "assignment_strategy": {
      "auto_assign_rules": [
        { "condition": "priority == 'critical'", "assign": "opus" },
        { "condition": "type == 'cross-browser'", "assign": "opus" },
        { "condition": "type == 'role-access'", "assign": "opus" },
        { "condition": "page_type == 'wizard' && priority == 'high'", "assign": "opus" },
        { "condition": "page_type == 'master-detail' && priority == 'critical'", "assign": "opus" },
        { "condition": "type == 'state-machine'", "assign": "opus" },
        { "condition": "type == 'network-mock' && priority == 'critical'", "assign": "opus" },
        { "condition": "default", "assign": "sonnet" }
      ]
    }
  },
  "roles": [],
  "role_page_access": {},
  "summary": {
    "total_scenarios": 0,
    "passed": 0,
    "failed": 0,
    "pending": 0,
    "running": 0,
    "deprecated": 0,
    "last_run": null,
    "pass_rate": "0%"
  },
  "modules": [],
  "page_types": ["form", "master-data", "master-detail", "wizard", "dashboard", "search", "state-machine", "data-driven", "network-mock"],
  "scenarios": []
}
```

- [ ] **Step 2: Verify diff — only additive changes**

```bash
git diff plugins/qa-ui-test/skills/qa-ui-test/templates/qa-tracker.json
```

Expected changes:
- `schema_version`: `"1.3.0"` → `"1.4.0"`
- `auto_assign_rules`: +2 rules for state-machine and network-mock
- `page_types`: +3 entries (state-machine, data-driven, network-mock)

- [ ] **Step 3: Commit**

```bash
git add plugins/qa-ui-test/skills/qa-ui-test/templates/qa-tracker.json
git commit -m "feat(qa-advanced): bump qa-tracker schema to 1.4.0, add advanced page types"
```

---

## Task 7: qa-create-advanced.md — Command

**Files:**
- Create: `plugins/qa-ui-test/commands/qa-create-advanced.md`

- [ ] **Step 1: Create qa-create-advanced.md**

Full command file — this is the largest file. It defines two modes (--enhance and --auto), 3 detection agents, and the pattern matching logic.

```markdown
---
description: สร้าง advanced test scenarios — ต่อยอดจาก qa-ui-test หรือ scan codebase สร้างใหม่
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*), Agent(*)
---

# QA Create Advanced — Advanced Scenario Generation

คุณคือ **QA Advanced Scenario Agent** ที่สร้าง advanced test scenarios
รองรับ 4 patterns: state-machine, data-driven, network-mock, serial-group

## CRITICAL RULES

1. **Read qa-tracker.json ก่อนเสมอ** — ดู scenarios ที่มีอยู่
2. **ใช้ Playwright CLI เท่านั้น** — ห้ามใช้ MCP tools สำหรับรัน test
3. **MCP ใช้ได้เฉพาะสำรวจหน้าจริง** — หา selectors ก่อนสร้าง script
4. **Backward compatible** — scenarios เดิมต้องไม่เสีย
5. **Output เป็น qa-tracker.json** — เพิ่ม scenarios พร้อม `advanced` field
6. **Commit เมื่อเสร็จ** — `advanced-scenario: create/enhance {MODULE}`

### Self-Check Checklist (MANDATORY)

- [ ] qa-tracker.json read?
- [ ] Advanced scenarios added with `advanced` field?
- [ ] Backward compatible (existing scenarios unchanged)?
- [ ] Variants files created in test-data/?
- [ ] qa-tracker.json committed?

### Output Rejection Criteria

- Existing scenarios modified → REJECT
- Advanced field missing in new scenarios → REJECT
- MCP used for running tests → REJECT

---

## Input

```
/qa-create-advanced --enhance                         # ต่อยอดจาก qa-tracker.json เดิม
/qa-create-advanced --enhance --module ORDER           # ต่อยอดเฉพาะ module
/qa-create-advanced --enhance --flow-only              # เฉพาะ state-machine
/qa-create-advanced --enhance --mock-only              # เฉพาะ network mock
/qa-create-advanced --enhance --data-driven-only       # เฉพาะ data-driven
/qa-create-advanced --auto                             # scan codebase สร้างใหม่
/qa-create-advanced --auto --module ORDER              # scan เฉพาะ module
/qa-create-advanced --auto --brainstorm-agents         # ใช้ multi-agent brainstorm
$ARGUMENTS
```

---

## Mode A: --enhance (ต่อยอดจากเดิม)

### Enhance Step 1: Read Existing State

```bash
cat qa-tracker.json
cat .agent/qa-progress.md 2>/dev/null
```

**ถ้าไม่มี qa-tracker.json:**
```
❌ ไม่พบ qa-tracker.json
   → รัน /qa-create-scenario --auto ก่อน
   → หรือใช้ /qa-create-advanced --auto เพื่อสร้างใหม่
```

### Enhance Step 2: Analyze Existing Scenarios

วิเคราะห์ scenarios เดิมแล้วแนะนำ:

| ถ้าพบ | แนะนำ |
|-------|-------|
| Negative cases ซ้ำๆ หลาย scenarios (เช่น TS-PRODUCT-003,004,005 ต่าง input) | รวมเป็น data-driven (1 scenario + variants file) |
| CRUD scenarios ของ entity เดียวกัน (create→edit→delete) | จัดเป็น serial group |
| Entity มี status field แต่ไม่มี flow test | เพิ่ม state-machine scenarios |
| หน้ามี API call แต่ไม่มี error test | เพิ่ม network mock scenarios |

### Enhance Step 3: Dispatch Detection Agents (ถ้า --module ระบุ)

Dispatch 3 Explore agents parallel เพื่อวิเคราะห์ module ที่เลือก:

#### Agent 1: State Machine Detector

```
Dispatch Agent (subagent_type: "Explore", run_in_background: true):

"วิเคราะห์ codebase หา state machine patterns สำหรับ module {MODULE}:

1. หา enum/type ที่เป็น status:
   - C#: public enum {Entity}Status { ... }
   - TS: type {Entity}Status = '...' | '...'

2. หา status field ใน Entity:
   - public {Entity}Status Status { get; set; }

3. หา transition logic:
   - if (entity.Status == X) { entity.Status = Y; }
   - switch (entity.Status) { case X: ... }

4. หา guard conditions:
   - if (condition) throw new Exception("cannot transition");

5. หา UI status indicators:
   - <span class='badge'>@Model.Status</span>
   - StatusBadge component

Return JSON format:
{
  'state_machines': [{
    'entity': 'Order',
    'states': ['Draft', 'Pending', ...],
    'transitions_found': [{ 'from': '...', 'to': '...', 'trigger': '...', 'source': 'file:line' }],
    'invalid_transitions_found': [{ 'from': '...', 'to': '...', 'error': '...' }],
    'guard_conditions': [{ 'transition': '...', 'condition': '...', 'source': 'file:line' }]
  }]
}"
```

#### Agent 2: API Endpoint Detector

```
Dispatch Agent (subagent_type: "Explore", run_in_background: true):

"วิเคราะห์ codebase หา API endpoints สำหรับ module {MODULE}:

1. Backend API endpoints:
   - C#: [HttpPost('api/...')] / [HttpPut] / [HttpDelete]
   - Express: router.post('/api/...', ...)
   - Next.js: app/api/.../route.ts

2. Frontend API calls:
   - fetch('/api/...', { method: 'POST' })
   - axios.post('/api/...', data)

3. Response patterns:
   - return Ok(result)     → 200
   - return BadRequest()   → 400
   - return NotFound()     → 404
   - StatusCode(500)       → 500

4. Error handling ใน frontend:
   - try/catch patterns
   - .catch(error => ...)
   - interceptors

5. Request/Response types:
   - DTO classes, interfaces

Return JSON format:
{
  'api_endpoints': [{
    'url': '/api/orders',
    'method': 'POST',
    'backend_source': 'file:line',
    'frontend_callers': ['file:line'],
    'request_fields': [{ 'name': '...', 'type': '...', 'required': true }],
    'response_codes': [200, 400, 500],
    'has_retry_logic': false,
    'has_timeout_handling': false
  }]
}"
```

#### Agent 3: Validation & Business Logic Detector

```
Dispatch Agent (subagent_type: "Explore", run_in_background: true):

"วิเคราะห์ codebase หา validation + business logic สำหรับ module {MODULE}:

1. Validation rules:
   - [Required], [MaxLength], [Range] attributes
   - FluentValidation rules
   - Service-level validation (throw if invalid)
   - Frontend validation (required, pattern, maxlength)

2. Computed fields:
   - Total = sum(items) * (1 + vat)
   - Discount calculations

3. Business branching:
   - if (total > 10000) { requireApproval(); }
   - if (user.level === 'gold') { applyDiscount(); }

4. Cross-field validation:
   - if (startDate > endDate) throw ...
   - if (discountPercent > 0 && discountAmount > 0) ...

5. Unique constraints:
   - .HasIndex(x => x.SKU).IsUnique()

Return JSON format:
{
  'business_logic': [{
    'entity': 'Product',
    'rules': [{
      'type': 'validation|calculation|conditional|cross-field|unique',
      'description': '...',
      'source': 'file:line',
      'testable_variants': [{ 'name': '...', 'input': {...}, 'expected': {...} }]
    }]
  }]
}"
```

### Enhance Step 4: Pattern Matching → Build Recommendations

```
รวมผล 3 agents → สร้าง recommendations:

state_machines found?
  → สร้าง State Machine scenarios:
    - 1 scenario per happy path (all transitions)
    - 1 scenario per invalid transition
    - 1 scenario per guard condition

api_endpoints found with multiple response_codes?
  → สร้าง Network Mock scenarios:
    - 1 test per response code
    - 1 test for timeout (ถ้า has_timeout_handling == false)
    - 1 test for retry (ถ้า has_retry_logic == true)
    - request validation ทุก endpoint

business_logic.testable_variants found?
  → สร้าง Data-Driven scenarios:
    - 1 scenario per entity with variants from detected rules

CRUD scenarios ของ entity เดียวกัน?
  → สร้าง Serial Group:
    - serial_group = "{ENTITY}-LIFECYCLE"
    - serial_order = create(1) → edit(2) → delete(3)
```

### Enhance Step 5: Show Recommendations

```
📋 Enhance Recommendations:

│ # │ Pattern        │ Module  │ Description                      │ Scenarios │
│ 1 │ 🔄 State Machine│ ORDER  │ Order lifecycle: draft→shipped   │ +4 new    │
│ 2 │ 📊 Data-Driven │ PRODUCT │ Validation 8 variants            │ +2 (merge 6)│
│ 3 │ 🌐 Network Mock│ CART   │ Payment API: 200,400,500,timeout │ +3 new    │
│ 4 │ 🔗 Serial Group│ ORDER  │ Create→Edit→Delete lifecycle     │ regroup 3 │

เลือกทำข้อไหน? (all / เลขข้อ / skip)
```

### Enhance Step 6: Create Scenarios + Variants Files

สำหรับแต่ละ recommendation ที่เลือก:

1. **State Machine** → เพิ่ม scenario ใน qa-tracker.json พร้อม `advanced.flow_type: "state-machine"`
2. **Data-Driven** → เพิ่ม scenario + สร้าง `test-data/TS-{MODULE}-DDT-{NNN}.json` พร้อม variants
3. **Network Mock** → เพิ่ม scenario พร้อม `advanced.mocks[]`
4. **Serial Group** → แก้ existing scenarios เพิ่ม `advanced.serial_group` + `serial_order`
5. **Merged scenarios** → เดิมตั้ง `status: "deprecated"`, สร้างใหม่แทน

### Enhance Step 7: Show Summary + Commit

```
✅ Advanced Enhance สำเร็จ!

📊 Module: {MODULE}
   State Machine: +4 scenarios
   Data-Driven: +2 scenarios (merged 6 → 2)
   Network Mock: +3 scenarios
   Serial Group: regrouped 3 scenarios

📁 Files:
   qa-tracker.json (updated)
   test-data/TS-ORDER-FLOW-001.json (new)
   test-data/TS-PRODUCT-DDT-001.json (new)

🔜 Next:
   /qa-continue-advanced --module ORDER  — generate scripts + run
```

```bash
git add qa-tracker.json test-data/
git commit -m "advanced-scenario: enhance ORDER with state-machine, data-driven, mock"
```

---

## Mode B: --auto (Scan Codebase)

### Auto Step 1: Dispatch Detection Agents

เหมือน Enhance Step 3 แต่ scan ทั้ง codebase (ไม่จำกัด module)

### Auto Step 2: Pattern Matching

เหมือน Enhance Step 4

### Auto Step 3: Build qa-tracker.json

ถ้ามี qa-tracker.json อยู่แล้ว → เพิ่ม advanced scenarios (ไม่แก้เดิม)
ถ้าไม่มี → สร้างใหม่พร้อม advanced scenarios

### Auto Step 4: Show Summary + Confirm

```
✅ Auto-generate สำเร็จ!

📊 สแกนพบ:
   State Machines: 3 (Order, Task, Invoice)
   API Endpoints: 12 (with mock-able responses)
   Business Rules: 8 (with testable variants)

📋 Advanced Scenarios: 45 total
   ├── State Machine: 12 scenarios
   ├── Data-Driven: 15 scenarios
   ├── Network Mock: 10 scenarios
   └── Serial Group: 8 scenarios (4 groups)

🔜 Next:
   /qa-continue-advanced — generate scripts + run
```

### Auto Step 5: Commit

```bash
git add qa-tracker.json test-data/ .agent/qa-progress.md
git commit -m "advanced-scenario: auto-generate N advanced scenarios from codebase"
```

---

## Output

ทุก mode ต้อง output:
1. Updated qa-tracker.json
2. Variants files ใน test-data/ (ถ้ามี data-driven)
3. Progress log ใน .agent/qa-progress.md
4. Git commit

> This command responds in Thai (ภาษาไทย)
```

- [ ] **Step 2: Commit**

```bash
git add plugins/qa-ui-test/commands/qa-create-advanced.md
git commit -m "feat(qa-advanced): add qa-create-advanced command"
```

---

## Task 8: qa-continue-advanced.md — Command

**Files:**
- Create: `plugins/qa-ui-test/commands/qa-continue-advanced.md`

- [ ] **Step 1: Create qa-continue-advanced.md**

```markdown
---
description: generate Playwright scripts จาก advanced scenarios + run ด้วย CLI
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*), Agent(*)
---

# QA Continue Advanced — Generate Scripts + Run Tests

คุณคือ **QA Advanced Runner Agent** ที่หยิบ advanced scenarios จาก qa-tracker.json
แล้วสร้าง Playwright scripts + รัน test ด้วย CLI

## CRITICAL RULES

1. **Read qa-tracker.json ก่อนเสมอ** — ดู scenarios ที่มี `advanced` field
2. **ทำทีละ module** — เหมือน long-running: 1 module per session
3. **ใช้ Playwright CLI เท่านั้น** — `npx playwright test` สำหรับรัน
4. **ห้ามใช้ MCP สำหรับรัน test** — MCP ใช้ได้เฉพาะสำรวจหน้าจริงหา selectors
5. **Update qa-tracker.json** — ทุกครั้งหลังรัน
6. **Commit per module** — `qa-advanced(TS-{MODULE}): generate scripts + test`

### Self-Check Checklist (MANDATORY)

- [ ] qa-tracker.json read?
- [ ] Only advanced scenarios (with `advanced` field) selected?
- [ ] Playwright scripts generated per pattern?
- [ ] Tests run with `npx playwright test` (CLI)?
- [ ] qa-tracker.json updated (status, runs)?
- [ ] .agent/qa-progress.md updated?
- [ ] Committed?

### Output Rejection Criteria

- MCP used for running tests → REJECT
- Multiple modules in 1 session → REJECT
- Scripts created without running → REJECT
- Status updated without test evidence → REJECT

---

## Input

```
/qa-continue-advanced                                    # แสดง pending modules ให้เลือก
/qa-continue-advanced --module ORDER                     # ทำ module ORDER
/qa-continue-advanced TS-ORDER-FLOW-001                  # ทำเคสเดียว
/qa-continue-advanced --flow state-machine               # ทำทุก state-machine scenarios
/qa-continue-advanced --serial-group ORDER-LIFECYCLE      # ทำเฉพาะ serial group
/qa-continue-advanced --dry-run --module ORDER           # สร้าง scripts ดูก่อน ไม่รัน
/qa-continue-advanced --parallel                          # รัน parallel ด้วย subagents
$ARGUMENTS
```

---

## ขั้นตอนที่ต้องทำ

### Step 0: Read Context

```bash
cat qa-tracker.json
cat .agent/qa-progress.md 2>/dev/null
npx playwright --version 2>/dev/null
```

**ถ้าไม่มี qa-tracker.json:**
```
❌ ไม่พบ qa-tracker.json
   → รัน /qa-create-advanced --auto หรือ --enhance ก่อน
```

**ถ้าไม่มี advanced scenarios:**
```
❌ ไม่พบ scenarios ที่มี advanced field
   → รัน /qa-create-advanced --enhance เพื่อเพิ่ม advanced patterns
```

---

### Step 1: Show Pending Advanced Scenarios

```
📋 QA Continue Advanced — เลือก module:

│ # │ Module  │ Pattern         │ Pending │ Done │
│ 1 │ ORDER   │ state-machine   │   4     │  0   │
│ 2 │ PRODUCT │ data-driven     │   2     │  0   │
│ 3 │ CART    │ network-mock    │   3     │  0   │
│ 4 │ ORDER   │ serial-group    │   3     │  0   │

💡 แนะนำ: เริ่มจาก serial-group (create→edit→delete) ก่อน

❓ เลือก module:
```

---

### Step 2: Read Pattern Reference

อ่าน reference guide ตาม pattern ของ scenarios ที่เลือก:

```
ถ้า flow_type == "state-machine":
  → Read references/state-machine-guide.md

ถ้า data_driven == true:
  → Read references/data-driven-guide.md

ถ้า mocks[] exists:
  → Read references/network-mock-guide.md

ถ้า serial_group exists:
  → Read references/state-machine-guide.md (serial section)
```

---

### Step 3: Analyze Page (MCP สำหรับหา selectors เท่านั้น)

**ใช้ MCP สำรวจหน้าจริงเพื่อหา selectors:**

```
① Login (ถ้าต้อง auth)
② Navigate ไปหน้า module
③ Snapshot เพื่อดู elements จริง
④ จับ actual selectors, field names, button labels
```

**สิ่งที่ต้องได้จาก MCP:**
- Status badge selectors
- Action button selectors (submit, approve, ship, cancel)
- Form field selectors
- Error message selectors
- Success message selectors

---

### Step 4: Generate Playwright Scripts

**สำหรับแต่ละ pattern:**

#### State Machine Scenarios

1. **spec file** → `tests/TS-{MODULE}-FLOW-{NNN}.spec.ts`
   - `test.describe.serial()` wrapping all transitions
   - `test.beforeAll()` → setup initial state
   - 1 `test()` per transition
   - Invalid transitions → separate `test.describe()`

2. **POM** → `tests/pages/{module}.page.ts` (เพิ่ม status-related methods)

3. **test data** → `test-data/TS-{MODULE}-FLOW-{NNN}.json`

#### Data-Driven Scenarios

1. **spec file** → `tests/TS-{MODULE}-DDT-{NNN}.spec.ts`
   - `for (const variant of variants)` loop
   - Each variant = 1 `test()`
   - 3 assertion modes (success/error/success_or_error)

2. **variants file** → already exists from qa-create-advanced

#### Network Mock Scenarios

1. **spec file** → `tests/TS-{MODULE}-MOCK-{NNN}.spec.ts`
   - 1 `test()` per mock scenario
   - `page.route()` setup before navigation
   - Request validation in route handler
   - Sequence mock with callCount

2. **POM** → reuse or extend existing

#### Serial Group Scenarios

1. **spec file** → `tests/SERIAL-{GROUP}.spec.ts`
   - `test.describe.serial()` wrapping all tests
   - `saveSharedData()` / `loadSharedData()` helpers
   - Tests ordered by `serial_order`

---

### Step 5: Run Tests — CLI Only

```bash
# State machine
npx playwright test tests/TS-ORDER-FLOW --reporter=json,list

# Data-driven
npx playwright test tests/TS-PRODUCT-DDT --reporter=json,list

# Network mock
npx playwright test tests/TS-CART-MOCK --reporter=json,list

# Serial group
npx playwright test tests/SERIAL-ORDER-LIFECYCLE --reporter=json,list

# Dry run (--list only)
npx playwright test tests/TS-ORDER --list
```

---

### Step 6: Parse Results + Update Tracker

```json
{
  "id": "TS-ORDER-FLOW-001",
  "status": "passed",
  "test_script": "tests/TS-ORDER-FLOW-001.spec.ts",
  "last_run_status": "passed",
  "runs": [{
    "run_number": 1,
    "status": "passed",
    "duration_ms": 12500,
    "steps_passed": 3,
    "steps_total": 3,
    "timestamp": "2026-04-02T10:30:00Z"
  }]
}
```

---

### Step 7: Update Progress Log

```markdown
---

## QA Advanced Session N
**Date**: TIMESTAMP
**Type**: Advanced Script Generation + Test
**Module**: {MODULE}
**Patterns**: state-machine, data-driven, network-mock, serial-group

### สิ่งที่ทำ:
- ✅ State Machine: TS-ORDER-FLOW-001 (3 transitions, all passed)
- ✅ Data-Driven: TS-PRODUCT-DDT-001 (8 variants, 7 passed)
- ❌ Network Mock: TS-CART-MOCK-001 (timeout test failed)
- ✅ Serial Group: SERIAL-ORDER-LIFECYCLE (3 tests, all passed)

### Failed:
- TS-CART-MOCK-001 variant 'timeout': UI doesn't show timeout message

### Next:
- /qa-continue-advanced → next module
- Fix timeout handling → /qa-retest

---
```

---

### Step 8: Commit

```bash
git add tests/ test-data/ qa-tracker.json .agent/qa-progress.md
git commit -m "qa-advanced(TS-{MODULE}): generate scripts + test — X/N passed"
```

---

## Output

```
✅ QA Continue Advanced — Module {MODULE} Complete!

📋 Module: {MODULE}
🧪 Scripts Generated: N

📊 Results by Pattern:
│ Pattern        │ Scenarios │ Passed │ Failed │
│ State Machine  │     4     │   4    │   0    │
│ Data-Driven    │     2     │   2    │   0    │
│ Network Mock   │     3     │   2    │   1    │
│ Serial Group   │     3     │   3    │   0    │

❌ Failed:
└── TS-CART-MOCK-001 variant 'timeout': Expected timeout message

🔜 Next:
   /qa-continue-advanced              — next module
   /qa-retest TS-CART-MOCK-001        — fix + retest
```

> This command responds in Thai (ภาษาไทย)
```

- [ ] **Step 2: Commit**

```bash
git add plugins/qa-ui-test/commands/qa-continue-advanced.md
git commit -m "feat(qa-advanced): add qa-continue-advanced command"
```

---

## Task 9: qa-advanced-howto.md — Command

**Files:**
- Create: `plugins/qa-ui-test/commands/qa-advanced-howto.md`

- [ ] **Step 1: Create qa-advanced-howto.md**

```markdown
---
description: อธิบายวิธีใช้ qa-advanced — command reference ครบทุก flags + ตัวอย่างทุก pattern
allowed-tools: Read(*)
---

# QA Advanced Howto — วิธีใช้งาน + Command Reference

คุณคือ **QA Advanced Tutor** ที่สอนวิธีใช้งาน qa-advanced plugin

## Input

```
/qa-advanced-howto                    # overview + command reference ทั้งหมด
/qa-advanced-howto state-machine      # สอน state machine pattern
/qa-advanced-howto data-driven        # สอน data-driven testing
/qa-advanced-howto mock               # สอน network mocking
/qa-advanced-howto serial             # สอน test orchestration
/qa-advanced-howto enhance            # สอนวิธีต่อยอดจาก qa-ui-test
/qa-advanced-howto examples           # ตัวอย่างจริงทุก pattern
$ARGUMENTS
```

---

## Topic: (ไม่ระบุ) — Overview + Command Reference

แสดงเมื่อไม่ระบุ topic:

```
📚 QA Advanced — วิธีใช้งาน

┌─────────────────────────────────────────────────────┐
│  คุณมี qa-tracker.json อยู่แล้วหรือยัง?              │
│                                                      │
│  ✅ มีแล้ว (ใช้ /qa-create-scenario มาก่อน)          │
│  → /qa-create-advanced --enhance                     │
│    ต่อยอด scenarios เดิม เพิ่ม advanced patterns      │
│                                                      │
│  ❌ ยังไม่มี / อยากเริ่มใหม่                          │
│  → /qa-create-advanced --auto                        │
│    scan codebase สร้าง advanced scenarios ทีเดียว     │
└─────────────────────────────────────────────────────┘

🧩 4 Advanced Patterns:

│ # │ Pattern        │ ใช้เมื่อ                          │ เรียนรู้                       │
│ 1 │ State Machine  │ หน้ามี status flow (order, task)   │ /qa-advanced-howto state-machine│
│ 2 │ Data-Driven    │ test ซ้ำๆ ต่าง input              │ /qa-advanced-howto data-driven  │
│ 3 │ Network Mock   │ ทดสอบ API error / slow response   │ /qa-advanced-howto mock         │
│ 4 │ Serial Group   │ test ต้องรันตามลำดับ               │ /qa-advanced-howto serial       │

═══════════════════════════════════════════════════
📖 Command Reference — ทุกคำสั่ง + ทุก flags
═══════════════════════════════════════════════════

┌──────────────────────────────────────────────────┐
│  /qa-create-advanced — สร้าง advanced scenarios  │
└──────────────────────────────────────────────────┘

  Usage:
    /qa-create-advanced [flags]

  Flags:
  │ Flag                    │ คำอธิบาย                                    │
  │ --enhance               │ ต่อยอดจาก qa-tracker.json เดิม               │
  │ --auto                  │ scan codebase สร้างใหม่ทั้งหมด               │
  │ --module <MODULE>       │ ระบุ module (เช่น ORDER, PRODUCT)            │
  │ --flow-only             │ สร้างเฉพาะ state-machine scenarios          │
  │ --mock-only             │ สร้างเฉพาะ network mock scenarios           │
  │ --data-driven-only      │ สร้างเฉพาะ data-driven scenarios            │
  │ --brainstorm-agents     │ ใช้ multi-agent brainstorm (ครบถ้วนกว่า)     │

  ตัวอย่าง:
    /qa-create-advanced --enhance
    /qa-create-advanced --auto --module ORDER
    /qa-create-advanced --enhance --module PRODUCT --flow-only
    /qa-create-advanced --auto --brainstorm-agents

  Combinations:
    --enhance + --module     → ต่อยอดเฉพาะ module นั้น
    --auto + --module        → scan เฉพาะ module นั้น
    --enhance + --flow-only  → แนะนำเฉพาะ state-machine patterns
    --auto + --brainstorm-agents → scan + ใช้ agents ช่วยคิด


┌──────────────────────────────────────────────────┐
│  /qa-continue-advanced — generate scripts + run  │
└──────────────────────────────────────────────────┘

  Usage:
    /qa-continue-advanced [flags | scenario-id]

  Flags:
  │ Flag                    │ คำอธิบาย                                    │
  │ --module <MODULE>       │ ทำเฉพาะ module                              │
  │ --flow <FLOW_TYPE>      │ ทำเฉพาะ flow type (state-machine/data-driven/mock) │
  │ --serial-group <GROUP>  │ ทำเฉพาะ serial group                        │
  │ --dry-run               │ generate scripts อย่างเดียว ไม่รัน test       │
  │ --parallel              │ รันด้วย subagents (เร็วกว่า)                 │

  ตัวอย่าง:
    /qa-continue-advanced                          # แสดง pending ให้เลือก
    /qa-continue-advanced --module ORDER           # ทำ ORDER module
    /qa-continue-advanced TS-ORDER-FLOW-001        # ทำเคสเดียว
    /qa-continue-advanced --flow state-machine     # ทำทุก state-machine scenarios
    /qa-continue-advanced --serial-group ORDER-LIFECYCLE
    /qa-continue-advanced --dry-run --module ORDER # สร้าง scripts ดูก่อน
    /qa-continue-advanced --parallel               # รัน parallel ด้วย subagents

  Execution:
    ✅ ใช้: npx playwright test <spec-file> --reporter=json,list
    ❌ ห้าม: Playwright MCP tools สำหรับรัน test


┌──────────────────────────────────────────────────┐
│  /qa-advanced-howto — วิธีใช้งาน + ตัวอย่าง       │
└──────────────────────────────────────────────────┘

  Usage:
    /qa-advanced-howto [topic]

  Topics:
  │ Topic          │ คำอธิบาย                                       │
  │ (ไม่ระบุ)      │ แสดง overview + command reference ทั้งหมด        │
  │ state-machine  │ สอน state machine pattern ทีละขั้น              │
  │ data-driven    │ สอน data-driven testing + variants              │
  │ mock           │ สอน network mocking + sequence + validation     │
  │ serial         │ สอน test orchestration + serial groups          │
  │ enhance        │ สอนวิธีต่อยอดจาก qa-ui-test                     │
  │ examples       │ แสดงตัวอย่างจริงทุก pattern                      │

  ตัวอย่าง:
    /qa-advanced-howto
    /qa-advanced-howto state-machine
    /qa-advanced-howto mock
    /qa-advanced-howto examples

💡 เริ่มต้นแนะนำ:
   1. /qa-advanced-howto state-machine  — เข้าใจ pattern หลัก
   2. /qa-create-advanced --enhance     — ลองต่อยอด scenarios เดิม
   3. /qa-continue-advanced             — generate scripts + test
```

---

## Topic: state-machine — State Machine Pattern

แสดงเมื่อ: `/qa-advanced-howto state-machine`

อ่าน `skills/qa-advanced/references/state-machine-guide.md` แล้วแสดงเนื้อหาเป็น tutorial:

```
🔄 State Machine Pattern — สอนทีละขั้น

═══ State Machine คืออะไร? ═══

ใช้กับหน้าที่มี "สถานะ" เปลี่ยนไปเรื่อยๆ เช่น:
  Order:   draft → pending → approved → shipped → delivered
  Task:    todo → in-progress → review → done
  Invoice: draft → sent → paid → overdue

═══ ขั้นที่ 1: กำหนด States ═══

ดูจาก code → หา enum หรือ status field:
  C#:   public enum OrderStatus { Draft, Pending, Approved, Shipped }
  TS:   type OrderStatus = 'draft' | 'pending' | 'approved' | 'shipped'

═══ ขั้นที่ 2: กำหนด Transitions ═══

แต่ละ transition = "จาก state A ทำ action X ไป state B"

  ┌───────┐  submit   ┌─────────┐  approve  ┌──────────┐
  │ Draft │─────────→│ Pending │────────→│ Approved │
  └───────┘          └─────────┘         └──────────┘
                          │                     │
                     reject│                ship │
                          ▼                     ▼
                     ┌──────────┐         ┌─────────┐
                     │ Rejected │         │ Shipped │
                     └──────────┘         └─────────┘

═══ ขั้นที่ 3: เขียนใน qa-tracker.json ═══

  {
    "id": "TS-ORDER-FLOW-001",
    "title": "Order lifecycle: draft → shipped",
    "advanced": {
      "flow_type": "state-machine",
      "states": ["draft", "pending", "approved", "shipped"],
      "transitions": [
        { "from": "draft", "action": "submit", "to": "pending",
          "assertions": ["status badge = 'Pending'"] }
      ]
    }
  }

═══ ขั้นที่ 4: Generate + Run ═══

  /qa-continue-advanced --module ORDER

  → สร้าง tests/TS-ORDER-FLOW-001.spec.ts
  → ใช้ test.describe.serial() เรียงตาม transitions
  → รันด้วย: npx playwright test tests/TS-ORDER-FLOW-001.spec.ts

═══ ลองเลย! ═══

  /qa-create-advanced --enhance --module ORDER
```

---

## Topic: data-driven — Data-Driven Testing

แสดงเมื่อ: `/qa-advanced-howto data-driven`

อ่าน `skills/qa-advanced/references/data-driven-guide.md` แล้วแสดง:

```
📊 Data-Driven Pattern — สอนทีละขั้น

═══ Data-Driven คืออะไร? ═══

แทนที่จะสร้าง 8 scenarios ซ้ำๆ ที่ต่างแค่ input:
  TS-PRODUCT-002: Create valid         ← ซ้ำ
  TS-PRODUCT-003: Create empty name    ← ซ้ำ
  TS-PRODUCT-004: Create max length    ← ซ้ำ
  ...

รวมเป็น 1 scenario + variants file:
  TS-PRODUCT-DDT-001: Create data-driven (8 variants)

═══ ขั้นที่ 1: สร้าง Variants File ═══

  test-data/TS-PRODUCT-DDT-001.json:
  {
    "fixtures": { "validUser": { ... } },
    "variants": [
      { "name": "valid", "input": { "name": "Test" }, "expected": { "result": "success" } },
      { "name": "empty-name", "input": { "name": "" }, "expected": { "result": "error", "message": "Required" } },
      { "name": "xss", "input": { "name": "<script>" }, "expected": { "result": "success_or_error", "must_not": "script executed" } }
    ]
  }

═══ ขั้นที่ 2: เพิ่มใน qa-tracker.json ═══

  {
    "id": "TS-PRODUCT-DDT-001",
    "advanced": {
      "data_driven": true,
      "variants_file": "test-data/TS-PRODUCT-DDT-001.json"
    }
  }

═══ ขั้นที่ 3: Generate + Run ═══

  /qa-continue-advanced --module PRODUCT
  → สร้าง for...of loop ใน spec file
  → แต่ละ variant = 1 test ใน report
  → รันด้วย: npx playwright test tests/TS-PRODUCT-DDT-001.spec.ts

═══ 3 Assertion Modes ═══

  success:          form submits OK, success message
  error:            validation error on specific field
  success_or_error: either OK, but dangerous thing must NOT happen (security)

═══ ลองเลย! ═══

  /qa-create-advanced --enhance --module PRODUCT --data-driven-only
```

---

## Topic: mock — Network Mocking

แสดงเมื่อ: `/qa-advanced-howto mock`

อ่าน `skills/qa-advanced/references/network-mock-guide.md` แล้วแสดง:

```
🌐 Network Mock Pattern — สอนทีละขั้น

═══ Network Mock คืออะไร? ═══

จำลอง API response โดยไม่ต้องพึ่ง backend จริง:
  - API return 500 → UI แสดง error message ดีไหม?
  - API timeout → UI แสดง loading/retry ไหม?
  - API return ข้อมูลผิด → UI crash ไหม?

═══ ขั้นที่ 1: กำหนด Mock Scenarios ═══

  {
    "advanced": {
      "mocks": [{
        "url": "**/api/payment",
        "method": "POST",
        "scenarios": [
          { "name": "success", "status": 200, "body": { "txn_id": "TXN-001" } },
          { "name": "server-error", "status": 500, "body": { "error": "Internal" } },
          { "name": "timeout", "delay_ms": 31000 },
          { "name": "retry-then-success", "sequence": [
            { "status": 500 },
            { "status": 200, "body": { "txn_id": "TXN-002" } }
          ]}
        ],
        "validate_request": {
          "required_fields": ["card_number", "amount"]
        }
      }]
    }
  }

═══ ขั้นที่ 2: Generate + Run ═══

  /qa-continue-advanced --module CART
  → สร้าง page.route() per scenario
  → request validation ใน route handler
  → retry sequence ใช้ callCount
  → รันด้วย: npx playwright test tests/TS-CART-MOCK-001.spec.ts

═══ Mock Types ═══

  status + body:    จำลอง HTTP response (200, 400, 500)
  delay_ms:         จำลอง slow response หรือ timeout
  sequence[]:       จำลอง fail→retry→success
  abort:            จำลอง network error (connection refused)
  validate_request: ตรวจว่า frontend ส่ง request ถูก

═══ สิ่งที่ต้องตรวจทุก mock ═══

  ✅ UI แสดง user-friendly message (ไม่ใช่ raw error)
  ✅ ไม่มี status code / stack trace โชว์ให้ user
  ✅ Form data ไม่หาย หลัง error
  ✅ Loading state ปรากฏ/หายไปถูกต้อง
  ✅ Retry button ทำงาน (ถ้ามี)

═══ ลองเลย! ═══

  /qa-create-advanced --enhance --module CART --mock-only
```

---

## Topic: serial — Test Orchestration

แสดงเมื่อ: `/qa-advanced-howto serial`

```
🔗 Serial Group Pattern — สอนทีละขั้น

═══ Serial Group คืออะไร? ═══

test ที่ต้องรันตามลำดับ เช่น:
  1. สร้าง order   → ได้ order_id
  2. แก้ไข order   → ใช้ order_id จากข้อ 1
  3. ลบ order      → ใช้ order_id จากข้อ 1

═══ ขั้นที่ 1: กำหนด Serial Group ═══

  [
    { "id": "TS-ORDER-001", "title": "Create order",
      "advanced": { "serial_group": "ORDER-LIFECYCLE", "serial_order": 1 } },
    { "id": "TS-ORDER-002", "title": "Edit order",
      "advanced": { "serial_group": "ORDER-LIFECYCLE", "serial_order": 2,
        "depends_on_data": { "from": "TS-ORDER-001", "field": "created_order_id" } } },
    { "id": "TS-ORDER-003", "title": "Delete order",
      "advanced": { "serial_group": "ORDER-LIFECYCLE", "serial_order": 3,
        "depends_on_data": { "from": "TS-ORDER-001", "field": "created_order_id" } } }
  ]

═══ ขั้นที่ 2: Generate + Run ═══

  /qa-continue-advanced --serial-group ORDER-LIFECYCLE
  → สร้าง tests/SERIAL-ORDER-LIFECYCLE.spec.ts
  → test.describe.serial() บังคับลำดับ
  → shared data ผ่าน JSON file
  → รันด้วย: npx playwright test tests/SERIAL-ORDER-LIFECYCLE.spec.ts

═══ Data Sharing ═══

  test 1 → saveSharedData({ created_order_id: 'ORD-001' })
  test 2 → const { created_order_id } = loadSharedData()
  test 3 → const { created_order_id } = loadSharedData()

═══ ลองเลย! ═══

  /qa-create-advanced --enhance --module ORDER
```

---

## Topic: enhance — ต่อยอดจาก qa-ui-test

แสดงเมื่อ: `/qa-advanced-howto enhance`

```
🔄 Enhance — ต่อยอดจาก qa-ui-test

═══ มี qa-tracker.json อยู่แล้ว? ═══

  /qa-create-advanced --enhance

  → อ่าน scenarios เดิม
  → วิเคราะห์จุดที่ควรเพิ่ม:
     - negative cases ซ้ำๆ → รวมเป็น data-driven
     - CRUD ของ entity เดียว → จัด serial group
     - entity มี status → เพิ่ม state-machine
     - หน้ามี API → เพิ่ม mock scenarios
  → แสดง recommendations ให้เลือก
  → เพิ่ม advanced scenarios (ไม่แก้เดิม)

═══ Workflow แนะนำ ═══

  1. /qa-create-scenario --auto       ← สร้าง basic scenarios ก่อน
  2. /qa-continue                     ← รัน basic tests จนครบ
  3. /qa-create-advanced --enhance    ← ต่อยอดด้วย advanced patterns
  4. /qa-continue-advanced            ← รัน advanced tests

═══ ตัวเลือก --enhance ═══

  /qa-create-advanced --enhance                        # ทุก module
  /qa-create-advanced --enhance --module ORDER         # เฉพาะ ORDER
  /qa-create-advanced --enhance --flow-only            # เฉพาะ state-machine
  /qa-create-advanced --enhance --mock-only            # เฉพาะ network mock
  /qa-create-advanced --enhance --data-driven-only     # เฉพาะ data-driven
```

---

## Topic: examples — ตัวอย่างจริง

แสดงเมื่อ: `/qa-advanced-howto examples`

อ่าน reference guides ทั้ง 4 ไฟล์ แล้วแสดงตัวอย่าง code จริงสำหรับแต่ละ pattern:

```
📝 ตัวอย่างจริง — ทุก Pattern

═══ 1. State Machine: Order Flow ═══
  [แสดง code จาก state-machine-guide.md — happy path section]

═══ 2. Data-Driven: Product Validation ═══
  [แสดง code จาก data-driven-guide.md — variants loop section]

═══ 3. Network Mock: Payment API ═══
  [แสดง code จาก network-mock-guide.md — retry sequence section]

═══ 4. Serial Group: Order Lifecycle ═══
  [แสดง code จาก state-machine-guide.md — serial section]
```

> This command responds in Thai (ภาษาไทย)
```

- [ ] **Step 2: Commit**

```bash
git add plugins/qa-ui-test/commands/qa-advanced-howto.md
git commit -m "feat(qa-advanced): add qa-advanced-howto command with full reference"
```

---

## Task 10: Final Verification

- [ ] **Step 1: Verify all files exist**

```bash
ls -la plugins/qa-ui-test/skills/qa-advanced/SKILL.md
ls -la plugins/qa-ui-test/skills/qa-advanced/references/advanced-patterns.md
ls -la plugins/qa-ui-test/skills/qa-advanced/references/state-machine-guide.md
ls -la plugins/qa-ui-test/skills/qa-advanced/references/data-driven-guide.md
ls -la plugins/qa-ui-test/skills/qa-advanced/references/network-mock-guide.md
ls -la plugins/qa-ui-test/commands/qa-create-advanced.md
ls -la plugins/qa-ui-test/commands/qa-continue-advanced.md
ls -la plugins/qa-ui-test/commands/qa-advanced-howto.md
```

Expected: All 8 files exist.

- [ ] **Step 2: Verify qa-tracker.json updated**

```bash
grep "schema_version" plugins/qa-ui-test/skills/qa-ui-test/templates/qa-tracker.json
grep "state-machine" plugins/qa-ui-test/skills/qa-ui-test/templates/qa-tracker.json
```

Expected: version `"1.4.0"`, `"state-machine"` in page_types.

- [ ] **Step 3: Verify existing files NOT modified**

```bash
git diff plugins/qa-ui-test/skills/qa-ui-test/SKILL.md
git diff plugins/qa-ui-test/commands/qa-create-scenario.md
git diff plugins/qa-ui-test/commands/qa-continue.md
git diff plugins/qa-ui-test/skills/qa-ui-test/references/scenario-template.md
git diff plugins/qa-ui-test/skills/qa-ui-test/references/playwright-guide.md
```

Expected: No changes (empty diff) for all existing files.

- [ ] **Step 4: Test command discovery**

```bash
grep -r "qa-create-advanced\|qa-continue-advanced\|qa-advanced-howto" plugins/qa-ui-test/commands/ --include="*.md" -l
```

Expected: 3 new command files listed.

- [ ] **Step 5: Final commit (if not already committed)**

```bash
git status
git log --oneline -10
```

Expected: All files committed, clean working tree.
