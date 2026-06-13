# Test scenario template

Based on IEEE 829-2008 Test Case Specification, adapted for AI-driven Playwright testing
and aligned with **qa-tracker.json schema 1.7.0**.

Every scenario lives in two places that MUST stay in sync:

1. **The structured entry** in `qa-tracker.json → scenarios[]` (authoritative — drives risk
   prioritization, model assignment, traceability, NFR and Gate 4 control coverage).
2. **The human-readable doc** `test-scenarios/{scenario-id}.md` (referenced by the entry's
   `scenario_doc` field) — steps, negative/boundary cases, screenshots.

---

## 1. Structured scenario entry (qa-tracker.json `scenarios[]`)

Each scenario object MUST carry `risk{}` + `complexity_factors[]` (used for v1.6+ model
assignment) and SHOULD carry `acceptance_criteria_id[]` / `use_case_id` for traceability.

```jsonc
{
  "id": "TS-MODULE-001",
  "title": "Short, intent-revealing scenario title",
  "module": "MODULE_NAME",
  "page_type": "form|master-data|master-detail|wizard|dashboard|...",
  "type": "happy-path|negative|boundary|security|role-access|state-machine|...",

  // priority is LEGACY — derived from risk.priority, kept for backward-compat only
  "priority": "critical|high|medium|low",

  // risk-based prioritization — score = probability × impact
  "risk": {
    "probability": 3,          // 1=rare | 2=occasional | 3=likely
    "impact": 3,               // 1=cosmetic | 2=functional | 3=critical (money/data/security/blocker)
    "score": 9,                // 1-9 (probability × impact)
    "priority": "P0",          // P0(7-9) | P1(5-6) | P2(3-4) | P3(1-2)
    "rationale": "money-flow + cascade depth 3"
  },

  // flow-difficulty factors — drive opus/sonnet/haiku assignment (see §2)
  "complexity_factors": ["state-machine", "cascade-deep"],

  // traceability → system-design-doc (flat AC-NNN / UC-NNN per design_doc_list.json registry)
  "acceptance_criteria_id": ["AC-001", "AC-002"],   // [] = unlinked → appears as GAP candidate
  "use_case_id": "UC-007",                          // or null — written by /sync-with-qa-tracker

  "status": "pending|running|passed|failed|deprecated",

  // model assignment (computed top-down, first match wins — see §2)
  "assigned_model": "opus",                         // sonnet|opus|haiku
  "assigned_model_reason": "state-machine factor present",

  "url": "/admin/products",
  "depends_on": [],
  "test_script": "tests/TS-MODULE-001.spec.ts",
  "test_data": "test-data/TS-MODULE-001.json",
  "scenario_doc": "test-scenarios/TS-MODULE-001.md",

  // Gate 4 control coverage (set when authored via --from-control-spec, Mode C)
  "control_refs": ["ctrl-product-grid", "ctrl-save-btn"],
  "control_test_category": "render-binding|api-binding|permission|validation|cascade-loading-error"
}
```

> **Rule:** `acceptance_criteria_id` uses **flat `AC-NNN`** (never `AC-X.Y`) to match the
> `design_doc_list.json` registry. Link manually or via `/qa-trace --auto-link`.

---

## 2. Risk & model assignment

### Risk priority (probability × impact → score → P-level)

| Priority | Score | Meaning | Example |
|---|:---:|---|---|
| **P0** | 7–9 | Money / data / security / blocker | Checkout payment, login, delete account |
| **P1** | 5–6 | Major feature, significant user impact | Form submission, search, master-detail save |
| **P2** | 3–4 | Supporting feature, workarounds exist | Profile edit, filters, sorting |
| **P3** | 1–2 | Cosmetic / nice-to-have | Tooltip text, animation timing |

### complexity_factors catalog

`state-machine`, `cascade-deep`, `multi-step`, `concurrent`, `security-flow`,
`network-mock`, `master-detail-sync`, `cross-browser`.

### 3-tier model assignment (first matching rule wins)

| → Model | When |
|---|---|
| **opus** | `complexity_factors.length >= 2`, OR contains `state-machine` / `cascade-deep` / `concurrent` / `cross-browser` / `master-detail-sync`, OR `P0` + any factor, OR `security-flow`+P0, OR `network-mock`+P0, OR `multi-step` + P0/P1 |
| **haiku** | `P3` AND `complexity_factors.length == 0` (trivial CRUD — pattern-based) |
| **sonnet** | everything else (standard CRUD / single-factor mid-risk) |

Always record `assigned_model_reason` with the rule that matched.

---

## 3. Scenario doc structure (`test-scenarios/{id}.md`)

```markdown
# {Scenario ID}: {Title}

| Field | Value |
|---|---|
| **ID** | TS-{MODULE}-{NNN} |
| **Title** | {Clear one-line description} |
| **Module** | {Feature area — project-specific, e.g. CHECKOUT, AUTH, PRODUCT} |
| **Page type** | {form / master-data / master-detail / wizard / dashboard} |
| **Type** | {happy-path / negative / boundary / security / role-access / state-machine} |
| **Risk** | P{0-3} (score {1-9} = prob {1-3} × impact {1-3}) — {rationale} |
| **Complexity factors** | {e.g. state-machine, cascade-deep — or "none"} |
| **Assigned model** | {opus / sonnet / haiku} ({reason}) |
| **AC linked** | {AC-001, AC-002 — or "unlinked (GAP candidate)"} |
| **UC linked** | {UC-007 — or "none"} |
| **Control refs** | {ctrl-ids + category — only if from-control-spec} |
| **Preconditions** | {What must be true before test runs} |
| **Test data file** | `test-data/{scenario-id}.json` |
| **Created** | {YYYY-MM-DD} |
| **Last run** | {YYYY-MM-DD or "Never"} |
| **Status** | {pending / running / passed / failed / deprecated} |

## Steps

| # | Action | Input data | Expected result | Screenshot |
|---|---|---|---|---|
| 1 | Navigate to {URL} | — | Page loads, title is "{title}" | `01-navigate.png` |
| 2 | Fill email field | `{{fixtures.validUser.email}}` | Field shows value | `02-fill-email.png` |
| 3 | Fill password field | `{{fixtures.validUser.password}}` | Field shows masked dots | `03-fill-password.png` |
| 4 | Click submit button | — | Form submits | `04-submit.png` |
| 5 | Verify result | — | Redirected to /dashboard, welcome text visible | `05-result.png` |

## Negative cases

| # | Variation | Input | Expected error |
|---|---|---|---|
| N1 | Empty email | `""` | "Email is required" |
| N2 | Invalid email format | `"notanemail"` | "Please enter a valid email" |
| N3 | Wrong password | `{{fixtures.invalidUser.password}}` | "Invalid credentials" |
| N4 | SQL injection attempt | `"' OR 1=1 --"` | "Invalid email format" or sanitized |

## Boundary cases

| # | Variation | Input | Expected behavior |
|---|---|---|---|
| B1 | Max length email | 255-char email | Accepted or truncated gracefully |
| B2 | Unicode characters | Thai/emoji in name fields | Handled without crash |
| B3 | Special characters | `<script>alert('xss')</script>` | Escaped, no XSS |

## Post-conditions

- {What should be true after test completes}
- {Cleanup needed: logout, delete test data, etc.}

## Dependencies

- Depends on: {other scenario IDs, e.g., "TS-AUTH-001 must pass first"}
- Blocks: {scenarios that depend on this one}
```

---

## 4. Scenario ID naming convention

Format: `TS-{MODULE}-{NNN}` (zero-padded number, e.g. `TS-CHECKOUT-001`).

`MODULE` is **project-specific** — derive it from the feature area / route, not a fixed
codebook. Keep it short, UPPER-CASE, and consistent across a feature (e.g. `AUTH`,
`PRODUCT`, `CHECKOUT`, `PROFILE`, `ADMIN`, `DASHBOARD`, `SEARCH`, `UPLOAD`). Reuse the
same module string in `qa-tracker.json → scenarios[].module` so `/qa-trace` and
`/qa-status --module` group correctly.

---

## 5. Test type matrix

For every form page, generate AT MINIMUM these scenario types:

| Type | Description | Example |
|---|---|---|
| Happy path | All valid data | Fill form correctly, submit succeeds |
| Required fields empty | Submit with nothing filled | All validation errors show |
| Each field invalid | One field wrong at a time | Specific error per field |
| All fields invalid | Everything wrong | Multiple errors show correctly |
| Boundary min | Minimum valid values | Single character, zero amount |
| Boundary max | Maximum valid values | Max length strings, max amounts |
| Special characters | Unicode, HTML, SQL | Thai text, `<script>`, `' OR 1=1` |
| Duplicate submission | Double-click submit | Only one submission processed |
| Back/forward navigation | Use browser back during flow | State preserved or handled |

When a scenario is authored `--from-control-spec`, also cover the 5 mandatory control
categories per control: **render-binding, api-binding, permission, validation,
cascade-loading-error** (see `control-spec-scenarios.md`).

---

## 6. How to decide what to screenshot

Capture a screenshot whenever:
1. A page first loads (initial state)
2. A form field is filled (shows the data was entered)
3. A button is clicked (before the result loads)
4. A result appears (success message, error message, redirect)
5. An error state occurs (validation errors visible)
6. A modal or dialog opens
7. The test completes (final state)

Name screenshots with zero-padded step numbers: `01-description.png`, `02-description.png`
