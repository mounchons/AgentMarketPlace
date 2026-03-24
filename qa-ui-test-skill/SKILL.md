---
name: qa-ui-test
description: >
  AI-powered QA UI testing skill using Playwright. Creates test scenarios, generates executable
  test scripts, fills forms, captures screenshots, validates errors, and stores structured results.
  Follows IEEE 829 / ISTQB standards adapted for modern agile CI/CD.

  USE THIS SKILL when the user mentions: UI testing, web testing, E2E testing, form testing,
  test case creation, test scenario, regression test, QA automation, Playwright test, screenshot test,
  visual testing, test result report, reusable test, multi-step form test, complex page testing,
  or any request to test a web application's user interface. Also trigger when user says
  "สร้าง test", "ทดสอบหน้าเว็บ", "ทดสอบ form", "เทส UI", "สร้าง scenario", or similar Thai phrases.
---

# QA UI Test Skill

An AI-powered QA testing skill that creates, executes, and manages web UI tests using Playwright.
Follows IEEE 829 documentation standards adapted for modern agile workflows.

## Quick reference

- **Test scenario template**: Read `references/scenario-template.md`
- **Playwright helpers**: Read `references/playwright-guide.md`
- **Result structure**: Read `references/result-structure.md`
- **Scripts**: Execute scripts in `scripts/` directory

## Core workflow

When the user requests UI testing, follow this sequence:

### Step 1: Analyze the target

Before writing any test, understand what you're testing:

1. Ask for or detect the target URL and technology (ASP.NET MVC / Next.js / Angular / other)
2. If the user provides a URL, use Playwright to navigate and capture a screenshot for analysis
3. Identify all interactive elements: forms, buttons, links, dropdowns, modals
4. Map the page flow: what steps does a user take from start to finish?

### Step 2: Create test scenarios (IEEE 829 adapted)

Generate test scenarios following the structure in `references/scenario-template.md`.

Each scenario MUST include:
- **Scenario ID**: Format `TS-{module}-{number}` (e.g., `TS-LOGIN-001`)
- **Title**: Clear one-line description
- **Priority**: Critical / High / Medium / Low
- **Preconditions**: What must be true before the test runs
- **Test data**: Concrete values to use (prepared in a JSON fixture file)
- **Steps**: Numbered actions with expected results per step
- **Expected result**: Final outcome
- **Screenshots to capture**: Which steps need visual evidence

Categorize scenarios by type:
- **Happy path**: Normal successful flow
- **Negative**: Invalid inputs, error messages
- **Boundary**: Min/max values, empty fields, special characters
- **Cross-browser**: If requested

### Step 3: Generate test data

Create a `test-data/{scenario-id}.json` file for each scenario containing:

```json
{
  "scenarioId": "TS-LOGIN-001",
  "description": "Login with valid credentials",
  "fixtures": {
    "validUser": {
      "email": "test@example.com",
      "password": "P@ssw0rd123"
    },
    "invalidUser": {
      "email": "wrong@example.com",
      "password": "wrongpass"
    }
  },
  "environment": {
    "baseUrl": "http://localhost:3000",
    "browser": "chromium"
  }
}
```

### Step 4: Generate Playwright test scripts

Write Playwright tests following the patterns in `references/playwright-guide.md`.

Key rules:
- Use Page Object Model (POM) for complex pages
- One test file per scenario
- Capture screenshots at every significant step
- Use meaningful selector strategies (prefer `data-testid`, then `role`, then CSS)
- Include explicit waits and assertions
- Store results in the structured output directory

### Step 5: Execute and capture results

Run tests and store results following `references/result-structure.md`.

Output directory structure:
```
test-results/
├── {scenario-id}/
│   ├── run-{N}/                    # Run number (auto-incremented)
│   │   ├── screenshots/
│   │   │   ├── 01-navigate.png
│   │   │   ├── 02-fill-email.png
│   │   │   ├── 03-fill-password.png
│   │   │   ├── 04-submit.png
│   │   │   └── 05-result.png
│   │   ├── test-report.json        # Machine-readable result
│   │   ├── test-report.md          # Human-readable report
│   │   ├── trace.zip               # Playwright trace (if enabled)
│   │   └── video/                  # Video recording (if enabled)
│   ├── test-data.json              # Fixture data used
│   └── scenario.md                 # Scenario documentation
├── summary-report.md               # Cross-scenario summary
└── test-plan.md                    # Overall test plan
```

### Step 6: Generate reports

After execution, create:
1. **Per-run report** (`test-report.md`): Pass/fail per step, screenshots, timing
2. **Scenario summary**: All runs for a scenario with trend
3. **Overall summary** (`summary-report.md`): All scenarios, pass rates, recommendations

## Commands

The user can invoke specific sub-commands:

- **"create scenario for {page/feature}"** → Steps 1-2
- **"generate test for {scenario}"** → Steps 3-4
- **"run test {scenario}"** → Step 5
- **"run all tests"** → Execute all scenarios
- **"show results"** → Step 6
- **"rerun failed"** → Re-execute only failed scenarios

## Multi-step complex page handling

For complex pages (multi-step forms, wizards, checkout flows):

1. **Decompose into stages**: Each stage becomes a sub-scenario
2. **Chain dependencies**: Stage N+1 depends on Stage N passing
3. **Checkpoint screenshots**: Capture state between stages
4. **Data carry-over**: Pass data from one stage to the next via test context
5. **Rollback handling**: Define cleanup actions if a stage fails mid-way

Example for a 3-step checkout:
```
TS-CHECKOUT-001  → Stage 1: Cart review
TS-CHECKOUT-002  → Stage 2: Shipping form (depends on 001)
TS-CHECKOUT-003  → Stage 3: Payment (depends on 002)
```

## CI/CD integration

When the user wants CI/CD integration, generate:
- GitHub Actions workflow (`.github/workflows/ui-test.yml`)
- Azure DevOps pipeline (`azure-pipelines-test.yml`)
- Docker-based test runner configuration

## Important notes

- Always initialize Playwright project if not already set up: `npm init playwright@latest`
- Install browsers: `npx playwright install`
- Default to Chromium but support cross-browser when requested
- Use `test.describe` blocks that match scenario IDs for traceability
- All screenshot filenames must be zero-padded and descriptive
- Test data files must never contain real credentials — use clearly fake data
- When running in CI, use `--reporter=html,json` for both human and machine output
