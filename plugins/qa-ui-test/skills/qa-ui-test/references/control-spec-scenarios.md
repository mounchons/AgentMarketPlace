# Control Spec → Scenarios Derivation Guide

> **Source**: `.agent/ui-controls/feature-<id>.json` (emitted by long-running `/continue` Step 5.4 หรือ `/emit-control-spec`)
>
> **Output**: ทุก control_id จะได้ scenarios อย่างน้อย 1 ตัวต่อ mandatory category — total ราว 3-7 scenarios per control

📖 Manifest schema reference: `plugins/long-running/skills/long-running/references/ui-control-manifest.md`

---

## 1. Mandatory Categories per Control

| Category | Trigger condition | Always required? |
|---|---|---|
| `render-binding` | (every control) | ✅ Always |
| `api-binding` | `binding.source == "api"` | conditional |
| `permission` | `permission != null` | conditional |
| `validation` | `validation` has any rule | conditional |
| `cascade-loading-error` | `depends_on != null` OR `test_directives.must_test_loading` | conditional |

**Algorithm:**

```python
def get_required_categories(control, test_directives):
    cats = ["render-binding"]  # always
    if control["binding"]["source"] == "api":
        cats.append("api-binding")
    if control.get("permission") is not None:
        cats.append("permission")
    if control.get("validation") and any_rule_set(control["validation"]):
        cats.append("validation")
    if control.get("depends_on") or test_directives.get("must_test_loading"):
        cats.append("cascade-loading-error")
    return cats
```

---

## 2. Category 1 — `render-binding`

**Goal**: control แสดงและ bind state field/prop ที่ถูกต้อง

**Test pattern (Playwright):**

```typescript
test('TS-PROD-EDIT-001: <control-id> renders and binds state', async ({ page }) => {
  await page.goto('/admin/products/edit/123');

  const control = page.locator(`[data-testid='${SELECTOR}']`);
  await expect(control).toBeVisible();

  // Verify initial value bound from state/server
  await expect(control).toHaveValue(EXPECTED_INITIAL);

  // Verify two-way binding (if applicable)
  await control.fill('new value');
  // Submit + assert payload includes 'new value' on the bound field
});
```

**Generation rules:**

| Manifest field | Test assertion |
|---|---|
| `selector` | `page.locator(...)` query target |
| `binding.source: state` + `binding.field` | After fill → submit → assert payload[field] |
| `binding.source: api` + `initial_load_endpoint` | Mock GET → assert control gets value |
| `type: radio` + `options` | Each option selectable; only 1 active at a time |
| `type: checkbox-group` | Multiple selectable; aggregated array submitted |

**1 scenario per control id** (default) — ระบุ control_refs[] = [<control-id>], control_test_category = "render-binding"

---

## 3. Category 2 — `api-binding`

**Goal**: control โหลด options/value จาก API ถูกต้อง

**Test pattern:**

```typescript
test('TS-PROD-EDIT-002: <control-id> loads options from <endpoint>', async ({ page }) => {
  // Mock API endpoint
  await page.route(ENDPOINT, route => route.fulfill({
    status: 200,
    body: JSON.stringify(MOCK_OPTIONS),
  }));

  await page.goto(URL);

  const combo = page.locator(SELECTOR);
  await combo.click();

  for (const opt of MOCK_OPTIONS) {
    await expect(page.getByRole('option', { name: opt[DISPLAY_FIELD] })).toBeVisible();
  }
});
```

**Generation rules:**

| Manifest field | Test variant |
|---|---|
| `binding.options_endpoint` | mock endpoint, assert options render |
| `binding.value_field` + `display_field` | assert option labels (display) and values (id) |
| `binding.search_param` | type query → assert filter call with `?<search_param>=<query>` |
| `binding.cache_strategy: session` | second visit doesn't re-fetch (assert request count) |

**Scenarios per control:**
- 1× happy-path (options load)
- 1× search filter (if `search_param` set)
- 1× empty options (graceful "No data" message)

---

## 4. Category 3 — `permission`

**Goal**: control visibility + data scope ตรงตาม role

**Test pattern (multi-role):**

```typescript
for (const role of MUST_TEST_ROLES) {
  test(`TS-PROD-EDIT-perm-${role}: <control-id> permission for ${role}`, async ({ page }) => {
    await loginAs(page, role);
    await page.goto(URL);

    const control = page.locator(SELECTOR);

    if (VISIBLE_ROLES.includes(role)) {
      await expect(control).toBeVisible();

      // For api-bound: assert data scope
      if (DATA_SCOPE) {
        const requests = await captureNetwork(page, ENDPOINT);
        for (const req of requests) {
          expect(req.url).toMatch(SCOPE_PATTERN); // e.g. tenantId=<user.tenantId>
        }
      }
    } else {
      // fallback_when_unauthorized
      if (FALLBACK == "hide")     await expect(control).toBeHidden();
      if (FALLBACK == "disable")  await expect(control).toBeDisabled();
      if (FALLBACK == "redirect") await expect(page).toHaveURL(/login|forbidden/);
    }
  });
}
```

**Generation rules:**

| Manifest field | Generates |
|---|---|
| `permission.visible_to_roles` | 1 test per role in `test_directives.must_test_roles` |
| `permission.data_scope` | network assertion (querystring includes scope) |
| `permission.fallback_when_unauthorized` | assertion type for unauthorized roles |

**Scenarios per control:** N = `len(test_directives.must_test_roles)`

---

## 5. Category 4 — `validation`

**Goal**: validation rules บังคับ + แสดง error UX ถูกต้อง

**Test pattern:**

```typescript
// Required
test('TS-PROD-EDIT-val-required: <control-id> required', async ({ page }) => {
  await page.goto(URL);
  await page.locator(SUBMIT_BTN).click();

  await expect(page.getByText(REQUIRED_MSG_PATTERN)).toBeVisible();
  await expect(page.locator(SELECTOR)).toHaveAttribute('aria-invalid', 'true');
});

// Max length
test('TS-PROD-EDIT-val-maxlen: <control-id> max length', async ({ page }) => {
  await page.goto(URL);
  await page.locator(SELECTOR).fill('a'.repeat(MAX_LENGTH + 1));
  await page.locator(SUBMIT_BTN).click();

  await expect(page.getByText(MAXLEN_MSG_PATTERN)).toBeVisible();
});

// Pattern
test('TS-PROD-EDIT-val-pattern: <control-id> pattern', async ({ page }) => {
  await page.goto(URL);
  await page.locator(SELECTOR).fill(INVALID_INPUT);
  await page.locator(SELECTOR).blur();

  await expect(page.getByText(PATTERN_MSG_PATTERN)).toBeVisible();
});
```

**Generation matrix:**

| validation rule | Generates |
|---|---|
| `required: true` | 1× empty submit → error visible |
| `min_length` | 1× shorter than min → error |
| `max_length` | 1× longer than max → error |
| `min` / `max` (numeric) | 2× boundary cases (under min, over max) |
| `pattern` | 2× (1 valid, 1 invalid) |
| `min_selected` / `max_selected` | (checkbox-group) bounds |
| `server_side: true` | 1× client passes but server returns 422 → error displayed |

**Scenarios per control:** ~2-5 depending on rule count

---

## 6. Category 5 — `cascade-loading-error`

**Goal**: dependency, loading skeleton, error states ทำงานถูก

### 5.1 Cascade (`depends_on`)

```typescript
test('TS-PROD-EDIT-cascade: <child> reloads when <parent> changes', async ({ page }) => {
  await page.goto(URL);

  // Initial state — parent empty, child empty/disabled
  await expect(page.locator(CHILD_SELECTOR)).toBeDisabled();

  // Pick parent value
  await page.locator(PARENT_SELECTOR).click();
  await page.getByRole('option', { name: PARENT_VAL }).click();

  // Child should re-fetch with parent value in querystring
  const req = await page.waitForRequest(req =>
    req.url().includes(CHILD_ENDPOINT) && req.url().includes(`${INTERPOLATED_PARAM}=${PARENT_VAL}`)
  );
  expect(req).toBeTruthy();

  // Reset behavior (depends_behavior: "reset-on-parent-change")
  await page.locator(PARENT_SELECTOR).click();
  await page.getByRole('option', { name: OTHER_PARENT }).click();
  await expect(page.locator(CHILD_SELECTOR)).toHaveValue(''); // reset
});
```

### 5.2 Loading state

```typescript
test('TS-PROD-EDIT-loading: <control-id> shows loading skeleton', async ({ page }) => {
  // Delay API response
  await page.route(ENDPOINT, async route => {
    await new Promise(r => setTimeout(r, 1500));
    await route.fulfill({ status: 200, body: '...' });
  });

  await page.goto(URL);

  await expect(page.locator(LOADING_SELECTOR)).toBeVisible();
  await expect(page.locator(LOADING_SELECTOR)).toBeHidden({ timeout: 3000 });
});
```

### 5.3 Error state (per error code in `test_directives.must_test_errors`)

```typescript
for (const code of MUST_TEST_ERRORS) {
  test(`TS-PROD-EDIT-error-${code}: <control-id> handles ${code}`, async ({ page }) => {
    await page.route(ENDPOINT, route => route.fulfill({
      status: parseInt(code) || 500,
      body: JSON.stringify({ error: `mock ${code}` }),
    }));

    await page.goto(URL);

    await expect(page.locator(ERROR_TOAST_SELECTOR)).toContainText(/error|fail|unable/i);
  });
}
```

**Scenarios per control:** ~2-6 (cascade + loading + N×errors)

---

## 7. Total scenario count formula

```
per control:
  1 (render-binding)
  + (1-3 if api-binding)
  + (N if permission, N=must_test_roles count)
  + (~2-5 if validation)
  + (~2-6 if cascade-loading-error)

avg ≈ 3-7 scenarios per control
```

**For a typical 5-control form:** ~15-35 scenarios auto-generated

> นี่คือเหตุผลที่ `--from-control-spec` ต้องเสมอ `dry-run` ก่อน — user เห็นจำนวนคาดการณ์ก่อน apply

---

## 8. Scenario ID Convention

```
TS-<MODULE>-<PAGE>-<CATEGORY>-<INDEX>

Categories:
  RENDER  = render-binding
  API     = api-binding
  PERM    = permission (suffix with role)
  VAL     = validation (suffix with rule)
  CASCADE = cascade
  LOAD    = loading
  ERR     = error (suffix with code)

Examples:
  TS-PRODUCT-EDIT-RENDER-001
  TS-PRODUCT-EDIT-API-001
  TS-PRODUCT-EDIT-PERM-admin-001
  TS-PRODUCT-EDIT-PERM-guest-001
  TS-PRODUCT-EDIT-VAL-required-001
  TS-PRODUCT-EDIT-VAL-maxlen-001
  TS-PRODUCT-EDIT-CASCADE-001
  TS-PRODUCT-EDIT-LOAD-001
  TS-PRODUCT-EDIT-ERR-401-001
  TS-PRODUCT-EDIT-ERR-500-001
```

---

## 9. Linking back to manifest

Every generated scenario MUST include:

```json
{
  "id": "TS-PRODUCT-EDIT-RENDER-001",
  "title": "Product name input renders and binds state",
  "feature_id": 7,
  "control_refs": ["product-name-input"],
  "control_test_category": "render-binding",
  "manifest_path": ".agent/ui-controls/feature-7.json",
  "manifest_emitted_at": "2026-05-10T...",
  "..."
}
```

→ `/long-running:qa-coverage-check --include-controls` ใช้ `control_refs[]` + `control_test_category` มา map กับ manifest

---

## 10. Drift handling

ถ้า manifest update (controls add/remove/change) → scenarios เก่าอาจล้าสมัย

**Action by `/qa-edit-scenario --from-control-spec <feature-id>`:**

| Manifest change | Scenario action |
|---|---|
| Control added | Generate new scenarios (5 categories) |
| Control removed | Mark linked scenarios as `deprecated` |
| Control type changed | Mark scenarios as needs-rewrite, generate new |
| Permission roles changed | Update permission scenarios (add/remove role variants) |
| Validation rule added | Add validation scenario |
| Validation rule removed | Mark validation scenario `deprecated` |
| Cascade `depends_on` added | Add cascade scenario |
| Endpoint changed | Update mocked endpoint in scenario but keep ID |

**Rule:** ห้ามลบ scenarios เก่า — mark deprecated + reference new ID (เหมือน `/qa-edit-scenario` ปกติ)

---

## 11. Confidence-based filtering

Manifest มี `controls[].confidence` (high/medium/low). Generation policy:

| Confidence | Action |
|---|---|
| `high` | Generate all mandatory categories |
| `medium` | Generate, but add note: "Detection medium confidence — verify selector" |
| `low` | Skip auto-generation, output as `[manual-review-required]` (user must edit) |

> ถ้า manifest มี `needs_review: true` → emit warning + ask user to confirm before generation

---

## 12. Mode flags

```
/qa-create-scenario --from-control-spec 7              # all controls, all mandatory categories
/qa-create-scenario --from-control-spec 7 --dry-run    # preview, no write
/qa-create-scenario --from-control-spec 7 --controls product-name-input,category-combo
/qa-create-scenario --from-control-spec 7 --categories render-binding,validation
/qa-create-scenario --from-control-spec 7 --skip-low-confidence
```
