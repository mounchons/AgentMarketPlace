# Test scenario template

Based on IEEE 829-2008 Test Case Specification, adapted for AI-driven Playwright testing.

## Scenario document structure

When creating a scenario, produce a markdown file with this exact structure:

```markdown
# {Scenario ID}: {Title}

| Field | Value |
|---|---|
| **ID** | TS-{MODULE}-{NNN} |
| **Title** | {Clear one-line description} |
| **Module** | {Feature area: LOGIN, REGISTER, CHECKOUT, PROFILE, etc.} |
| **Priority** | {Critical / High / Medium / Low} |
| **Type** | {Happy Path / Negative / Boundary / Security / Accessibility} |
| **Preconditions** | {What must be true before test runs} |
| **Test data file** | `test-data/{scenario-id}.json` |
| **Created** | {YYYY-MM-DD} |
| **Last run** | {YYYY-MM-DD or "Never"} |
| **Status** | {Draft / Ready / Passing / Failing / Skipped} |

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

- Depends on: {other scenario IDs, e.g., "TS-REGISTER-001 must pass first"}
- Blocks: {scenarios that depend on this one}
```

## Priority classification (ISTQB-based)

- **Critical**: Core business flow, blocks all other testing (login, checkout payment)
- **High**: Major feature, significant user impact (form submission, search)
- **Medium**: Supporting feature, workarounds exist (profile edit, filters)
- **Low**: Cosmetic, nice-to-have (tooltip text, animation timing)

## Scenario ID naming convention

Format: `TS-{MODULE}-{NNN}`

Common module codes:
- `LOGIN` — Authentication, login forms
- `REG` — Registration, signup
- `PROF` — User profile, settings
- `CART` — Shopping cart
- `CHKOUT` — Checkout flow
- `SEARCH` — Search functionality
- `FORM` — Generic form pages
- `NAV` — Navigation, menu
- `DASH` — Dashboard
- `ADMIN` — Admin panels
- `REPORT` — Report pages
- `UPLOAD` — File upload features

## Test type matrix

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

## How to decide what to screenshot

Capture a screenshot whenever:
1. A page first loads (initial state)
2. A form field is filled (shows the data was entered)
3. A button is clicked (before the result loads)
4. A result appears (success message, error message, redirect)
5. An error state occurs (validation errors visible)
6. A modal or dialog opens
7. The test completes (final state)

Name screenshots with zero-padded step numbers: `01-description.png`, `02-description.png`
