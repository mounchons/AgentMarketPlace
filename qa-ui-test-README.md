# QA UI Test — Claude Code Skill

AI-powered QA UI testing skill using Playwright. Creates test scenarios following IEEE 829 / ISTQB standards, generates executable Playwright scripts, captures screenshots at every step, and stores structured results for re-running.

## Installation

### Option 1: Copy to Claude Code skills directory

```bash
# Extract the archive
tar -xzf qa-ui-test-skill.tar.gz

# Copy to Claude Code local skills
mkdir -p .claude/skills
cp -r qa-ui-test-skill .claude/skills/qa-ui-test
```

### Option 2: Use as global skill

```bash
mkdir -p ~/.claude/skills
cp -r qa-ui-test-skill ~/.claude/skills/qa-ui-test
```

## Usage

Once installed, Claude Code will automatically detect and use this skill when you mention UI testing. Examples:

```
# Create test scenarios for a page
> create test scenarios for the login page at http://localhost:3000/login

# Generate Playwright test from a scenario
> generate Playwright test for TS-LOGIN-001

# Run a specific test
> run test TS-LOGIN-001

# Run all tests and show results
> run all tests and generate summary report

# Create tests for a complex multi-step form
> create E2E test for the checkout flow: cart → shipping → payment
```

## What the skill does

1. **Analyzes** your web page (navigates, screenshots, identifies elements)
2. **Creates scenarios** with IEEE 829 structure (ID, steps, expected results, test data)
3. **Generates test data** JSON fixtures with valid/invalid/boundary values
4. **Writes Playwright tests** using Page Object Model pattern
5. **Captures screenshots** at every significant step with auto-numbering
6. **Stores results** in structured folders: `test-results/{scenario}/{run-NNN}/`
7. **Generates reports** — per-run markdown + JSON, and cross-scenario summary

## Directory structure created

```
your-project/
├── tests/
│   ├── pages/              # Page Object Models
│   ├── fixtures/            # Test data JSON
│   ├── helpers/
│   │   ├── screenshot.helper.ts
│   │   └── report.helper.ts
│   └── TS-LOGIN-001.spec.ts
├── test-data/
│   └── TS-LOGIN-001.json
├── test-scenarios/
│   └── TS-LOGIN-001.md
├── test-results/
│   └── TS-LOGIN-001/
│       ├── run-001/
│       │   ├── screenshots/
│       │   ├── test-report.json
│       │   └── test-report.md
│       └── run-002/
├── playwright.config.ts
└── .github/workflows/ui-test.yml
```

## Quick setup

```bash
# Initialize a new project with QA structure
node .claude/skills/qa-ui-test/scripts/setup.js --base-url http://localhost:3000
```

## Requirements

- Node.js 18+
- Playwright (`npm i -D @playwright/test`)
- Claude Code CLI
