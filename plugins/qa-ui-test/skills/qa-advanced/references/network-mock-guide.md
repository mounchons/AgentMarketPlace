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
