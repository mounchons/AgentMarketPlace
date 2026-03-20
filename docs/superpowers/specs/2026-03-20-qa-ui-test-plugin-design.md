# QA UI Test Plugin — Design Spec

## Overview

Migrate standalone `qa-ui-test-skill/` into a Claude Code plugin with 3 slash commands, long-running-agent-style tracking via `qa-tracker.json`, model assignment (opus review), parallel subagent execution, brainstorming phase, and master data CRUD page testing support.

## Plugin Structure

```
plugins/qa-ui-test/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   ├── qa-create-scenario.md      # Brainstorm + create scenarios
│   ├── qa-run.md                  # Run tests (single/batch/parallel)
│   └── qa-retest.md               # Re-test + report + optional opus review
├── skills/
│   └── qa-ui-test/
│       ├── SKILL.md               # Main skill (migrated + enhanced)
│       ├── references/
│       │   ├── scenario-template.md
│       │   ├── playwright-guide.md
│       │   └── result-structure.md
│       ├── scripts/
│       │   ├── setup.js
│       │   └── generate-summary.js
│       └── templates/
│           ├── qa-tracker.json
│           └── github-actions-ui-test.yml
```

## qa-tracker.json Schema (v1.0.0)

```json
{
  "schema_version": "1.0.0",
  "project": "",
  "base_url": "http://localhost:3000",
  "model_config": {
    "scenario_creator": "sonnet",
    "test_runner": "sonnet",
    "reviewer": "opus",
    "assignment_strategy": {
      "auto_assign_rules": [
        { "condition": "priority == 'critical'", "assign": "opus" },
        { "condition": "type == 'cross-browser'", "assign": "opus" },
        { "condition": "default", "assign": "sonnet" }
      ]
    }
  },
  "summary": {
    "total_scenarios": 0,
    "passed": 0,
    "failed": 0,
    "pending": 0,
    "running": 0,
    "last_run": null,
    "pass_rate": "0%"
  },
  "modules": [],
  "scenarios": []
}
```

### Scenario entry:

```json
{
  "id": "TS-LOGIN-001",
  "title": "Login with valid credentials",
  "module": "LOGIN",
  "priority": "critical",
  "type": "happy-path",
  "page_type": "form",
  "status": "pending",
  "assigned_model": "sonnet",
  "url": "/auth/login",
  "depends_on": [],
  "test_script": "tests/TS-LOGIN-001.spec.ts",
  "test_data": "test-data/TS-LOGIN-001.json",
  "scenario_doc": "test-scenarios/TS-LOGIN-001.md",
  "runs": [],
  "review": null,
  "last_run_status": null,
  "created_at": "",
  "brainstorm_notes": ""
}
```

## Command 1: `/qa-create-scenario`

### Brainstorming Phase (NEW)

Before creating scenarios, the command enters a brainstorming dialogue:

1. Ask: "หน้านี้มี business rules อะไรบ้าง?"
2. Ask: "มี edge cases อะไรที่ต้องระวัง?"
3. Ask: "มี user roles ที่ต้องทดสอบกี่แบบ?"
4. Ask: "มี validation rules อะไรเฉพาะของหน้านี้?"
5. Summarize brainstorm results → confirm with user → proceed

### Master Data Page Detection (NEW)

If page is detected as master data CRUD (list/create/edit/delete):
- Auto-generate standard CRUD scenarios:
  - `TS-{MODULE}-001`: List — view data table, pagination, search/filter
  - `TS-{MODULE}-002`: Create — fill form, submit, verify in list
  - `TS-{MODULE}-003`: Create negative — validation errors
  - `TS-{MODULE}-004`: Edit — load existing, modify, save
  - `TS-{MODULE}-005`: Delete — confirm dialog, verify removed
  - `TS-{MODULE}-006`: Delete cancel — cancel dialog, verify still exists
  - `TS-{MODULE}-007`: Search/filter — filter by columns
  - `TS-{MODULE}-008`: Pagination — navigate pages
  - `TS-{MODULE}-009`: Sort — sort by columns
  - `TS-{MODULE}-010`: Boundary — max records, empty state

### Flow

1. Read qa-tracker.json (or init new)
2. **Brainstorm** with user (ask questions one at a time)
3. Navigate to URL → screenshot → analyze elements
4. Detect page type (master-data/form/wizard/dashboard)
5. Generate scenarios (IEEE 829) → test-scenarios/*.md
6. Generate test data → test-data/*.json
7. Generate Playwright scripts → tests/*.spec.ts + POM
8. Add scenarios to qa-tracker.json (status: pending)
9. Auto-assign model per rules
10. Commit: `scenario(TS-XXX): create scenarios for [module]`

### Input

```
/qa-create-scenario http://localhost:5000/admin/products
/qa-create-scenario --module PRODUCT --url /admin/products
/qa-create-scenario --master-data --url /admin/categories
/qa-create-scenario --from-design-doc
```

## Command 2: `/qa-run`

### Modes

- **Single**: `/qa-run TS-LOGIN-001`
- **Module**: `/qa-run --module LOGIN`
- **All**: `/qa-run --all`
- **Failed only**: `/qa-run --failed`
- **Parallel**: `/qa-run --parallel` (subagent per scenario)

### Parallel Execution (Subagent-driven)

```
Main Agent (Orchestrator):
  1. Read qa-tracker.json
  2. Filter scenarios to run
  3. Group by module or split evenly
  4. Dispatch subagents (Agent tool, run_in_background):
     - Each subagent: npx playwright test [scenario]
     - Each subagent: update run results
  5. Collect results from all subagents
  6. Merge into qa-tracker.json
  7. Generate summary report
  8. Update .agent/qa-progress.md
```

### Flow (single/sequential)

1. Read qa-tracker.json
2. Update scenario status → "running"
3. `npx playwright test tests/TS-XXX-NNN.spec.ts`
4. Parse results + screenshots
5. Add run entry to scenario.runs[]
6. Update status (passed/failed)
7. Update summary counts
8. Generate per-run report
9. Commit: `qa-run(TS-XXX): [passed/failed]`

### Self-Check

- [ ] qa-tracker.json read?
- [ ] Status updated to running before execution?
- [ ] Results captured with screenshots?
- [ ] qa-tracker.json updated with run results?
- [ ] Summary counts updated?
- [ ] .agent/qa-progress.md updated?

## Command 3: `/qa-retest`

### Modes

- **Failed**: `/qa-retest` (default: re-run all failed)
- **Specific**: `/qa-retest TS-LOGIN-003`
- **All (regression)**: `/qa-retest --all`
- **With review**: `/qa-retest --review` (opus reviews after)

### Opus Review Flow

When `--review` is used:
1. Run tests
2. Opus reviews:
   - Test quality (assertions sufficient?)
   - Coverage gaps (missing edge cases?)
   - Recommended new scenarios
   - Score: pass/fail
3. Review saved to qa-tracker.json scenario.review
4. If fail → add recommended scenarios as pending

### Comparison Report

Generate run-over-run comparison:
```
TS-LOGIN-003:
  Run 1: FAILED (step 4: Invalid email error not shown)
  Run 2: PASSED (fixed!)
  Delta: -1 failure
```

### Flow

1. Read qa-tracker.json
2. Filter: failed scenarios (default) or specified
3. Run from existing scripts (no regeneration)
4. Add new run entry (run-002, run-003, ...)
5. Update status
6. Generate comparison report (new vs previous run)
7. If --review → dispatch opus review subagent
8. Update .agent/qa-progress.md
9. Commit: `qa-retest(TS-XXX): [status change]`

## Session Tracking

Progress logged to `.agent/qa-progress.md` (same pattern as long-running):

```markdown
## QA Session N - [TYPE]
**Date**: TIMESTAMP
**Type**: Scenario Creation | Test Execution | Retest | Review

### What was done:
- Summary of actions

### Results:
- Pass/fail counts

### Current status:
- Overall progress

### Next:
- Recommended next action
```

## Integration Points

- **long-running**: Can link test scenarios to features via `feature_id` field
- **system-design-doc**: `/qa-create-scenario --from-design-doc` reads pages from design doc
- **ui-mockup**: Can detect mockup pages to generate scenarios for
- **ai-ui-test (chrome)**: Complementary — chrome for ad-hoc, Playwright for structured

## Master Data Module Codes (NEW)

Extended module codes for CRUD pages:
- `PRODUCT`, `CATEGORY`, `USER`, `ROLE`, `CUSTOMER`, `ORDER`, `INVOICE`
- `EMPLOYEE`, `DEPARTMENT`, `SUPPLIER`, `WAREHOUSE`, `REPORT`
- Custom: user-defined module from brainstorming
