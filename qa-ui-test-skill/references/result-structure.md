# Test result structure

How test outputs are organized, versioned, and reported.

## Directory layout

```
project-root/
├── tests/                          # Test source code
│   ├── pages/                      # Page Object Models
│   ├── fixtures/                   # Test data JSON files
│   ├── helpers/                    # Screenshot + report helpers
│   └── TS-{MODULE}-{NNN}.spec.ts  # Test scripts
├── test-data/                      # Prepared test data per scenario
│   ├── TS-LOGIN-001.json
│   └── TS-CHECKOUT-001.json
├── test-results/                   # Execution outputs (gitignored)
│   ├── TS-LOGIN-001/
│   │   ├── scenario.md             # Scenario documentation (copied)
│   │   ├── test-data.json          # Data used (snapshot)
│   │   ├── run-001/
│   │   │   ├── screenshots/
│   │   │   │   ├── 01-navigate-to-login.png
│   │   │   │   ├── 02-fill-email.png
│   │   │   │   ├── 03-fill-password.png
│   │   │   │   ├── 04-before-submit.png
│   │   │   │   ├── 05-after-submit.png
│   │   │   │   └── 06-result.png
│   │   │   ├── test-report.json
│   │   │   ├── test-report.md
│   │   │   └── trace.zip
│   │   ├── run-002/
│   │   │   └── ...
│   │   └── run-003/
│   │       └── ...
│   ├── TS-LOGIN-002/
│   │   └── ...
│   └── summary-report.md
├── test-scenarios/                 # Scenario documentation
│   ├── TS-LOGIN-001.md
│   ├── TS-LOGIN-002.md
│   └── TS-CHECKOUT-001.md
├── test-plan.md                    # Master test plan
├── playwright.config.ts
└── package.json
```

## Run numbering

Runs are automatically numbered with zero-padded 3-digit format:
`run-001`, `run-002`, `run-003`, etc.

The ScreenshotHelper determines the next run number by scanning existing directories.

## Test report JSON schema

```json
{
  "scenarioId": "TS-LOGIN-001",
  "runNumber": 1,
  "startedAt": "2026-03-20T10:30:00.000Z",
  "completedAt": "2026-03-20T10:30:05.234Z",
  "status": "pass",
  "totalSteps": 5,
  "passedSteps": 5,
  "failedSteps": 0,
  "duration_ms": 5234,
  "steps": [
    {
      "step": 1,
      "action": "Navigate to login page",
      "status": "pass",
      "screenshot": "screenshots/01-navigate-to-login.png",
      "duration_ms": 1200
    },
    {
      "step": 2,
      "action": "Fill email: test@example.com",
      "status": "pass",
      "screenshot": "screenshots/02-fill-email.png",
      "duration_ms": 300
    }
  ],
  "environment": {
    "browser": "chromium",
    "baseUrl": "http://localhost:3000",
    "viewport": "1280x720"
  }
}
```

## Summary report format

After running all scenarios, generate `test-results/summary-report.md`:

```markdown
# QA UI Test Summary Report

| Field | Value |
|---|---|
| **Generated** | 2026-03-20 17:30 ICT |
| **Total scenarios** | 12 |
| **Passed** | 10 |
| **Failed** | 2 |
| **Pass rate** | 83.3% |
| **Total duration** | 45.2s |

## Results by module

| Module | Total | Passed | Failed | Rate |
|---|---|---|---|---|
| LOGIN | 3 | 3 | 0 | 100% |
| REGISTER | 2 | 1 | 1 | 50% |
| CHECKOUT | 4 | 3 | 1 | 75% |
| PROFILE | 3 | 3 | 0 | 100% |

## Failed scenarios

### TS-REGISTER-002: Register with duplicate email
- **Run**: #3
- **Failed at step**: 4 — Submit registration
- **Error**: Expected error message "Email already exists" but got timeout
- **Screenshot**: [05-after-submit.png]

### TS-CHECKOUT-003: Payment with expired card
- **Run**: #1
- **Failed at step**: 6 — Verify error message
- **Error**: Error message element not found
- **Screenshot**: [07-payment-error.png]

## Recommendations

1. REGISTER module: Check if duplicate email validation is implemented
2. CHECKOUT module: Verify payment error handling UI exists
3. Consider adding retry logic for flaky network-dependent tests
```

## .gitignore additions

```
# Test results (regenerated on each run)
test-results/
playwright-report/

# But keep scenario docs and test data
!test-scenarios/
!test-data/
```

## CI/CD artifact collection

### GitHub Actions

```yaml
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: test-results-${{ github.sha }}
    path: |
      test-results/
      playwright-report/
    retention-days: 30
```

### Azure DevOps

```yaml
- task: PublishTestResults@2
  condition: always()
  inputs:
    testResultsFormat: 'JUnit'
    testResultsFiles: 'test-results/results.xml'
- task: PublishPipelineArtifact@1
  condition: always()
  inputs:
    targetPath: 'test-results'
    artifact: 'qa-test-results'
```
