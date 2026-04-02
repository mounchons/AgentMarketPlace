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
