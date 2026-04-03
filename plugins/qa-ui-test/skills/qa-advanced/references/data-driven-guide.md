# Data-Driven Testing Guide

วิธีสร้าง parameterized tests จาก variants ใน test-data JSON

## Standard Schema

ทุก variants file ต้องใช้ schema `qa-variants-v1`:
- Schema definition: `references/qa-variants-schema.json`
- เพิ่ม `"$schema": "qa-variants-v1"` ที่ต้น JSON file เสมอ

### Schema Validation Rules

| Field | Required | Format | Description |
|-------|----------|--------|-------------|
| `$schema` | yes | `"qa-variants-v1"` | Schema reference |
| `description` | yes | string | อธิบายว่า file นี้ test อะไร |
| `setup.login` | no | boolean | ต้อง login ก่อนไหม |
| `setup.navigateTo` | no | URL path | หน้าที่จะไป |
| `setup.apiSetup[]` | no | array | API calls สำหรับ seed data |
| `variants[].name` | yes | kebab-case | unique slug (ใช้ใน test title + screenshot) |
| `variants[].input` | yes | object | key-value ตรง form fields |
| `variants[].expected.result` | yes | `success` \| `error` \| `success_or_error` | ผลที่คาดหวัง |
| `variants[].expected.errorField` | no | string | field ที่แสดง error (ถ้า result=error) |
| `variants[].expected.errorMessage` | no | string | error message (partial match) |
| `variants[].expected.mustNotContain` | no | string | ห้ามมีใน page (security) |
| `variants[].expected.verifyValues` | no | object | ค่าที่ต้อง verify หลัง submit สำเร็จ |

## Variants JSON Format

ใช้ `variants[]` array ใน test-data JSON file เดิม (backward compatible):

```json
{
  "$schema": "qa-variants-v1",
  "description": "Product create form — validation testing (required, boundary, security)",
  "fixtures": {
    "validUser": { "email": "admin@test.com", "password": "Admin@123" }
  },
  "environment": {
    "baseUrl": "http://localhost:3000"
  },
  "setup": {
    "login": true,
    "navigateTo": "/admin/products/new",
    "apiSetup": []
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
| `expected.field` | no | Which field shows the error (alias for `errorField`) |
| `expected.errorField` | no | Which field shows the error |
| `expected.errorMessage` | no | Error message on specific field (partial match) |
| `expected.must_not` | no | Content that must NOT appear (alias for `mustNotContain`) |
| `expected.mustNotContain` | no | Content that must NOT appear (for security tests) |
| `expected.verifyValues` | no | Field-value pairs to verify after success |
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
