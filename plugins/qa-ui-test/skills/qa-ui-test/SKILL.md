---
name: qa-ui-test
version: 1.2.0
description: |
  QA UI Testing plugin ด้วย Playwright — long-running agent style tracking, brainstorming,
  model assignment, parallel subagents, master data CRUD testing, master-detail grid testing, opus review

  รองรับ: สร้าง test scenarios (IEEE 829), รัน tests ทีละเคสหรือ parallel,
  รีเทสจาก scripts เดิม, เปรียบเทียบผลกับครั้งก่อน, opus review quality,
  แก้ไข scenarios เมื่อ logic เปลี่ยน, ดูสถานะภาพรวม, อธิบาย test plan ด้วย flowchart

  USE THIS SKILL when the user mentions: UI testing, web testing, E2E testing, form testing,
  test case creation, test scenario, regression test, QA automation, Playwright test,
  screenshot test, visual testing, test result report, reusable test, multi-step form test,
  complex page testing, master data testing, CRUD testing, page-by-page testing,
  master-detail grid, inline editing, expandable row, detail grid, edit scenario, test status

  Thai triggers: "สร้าง test", "ทดสอบหน้าเว็บ", "ทดสอบ form", "เทส UI", "สร้าง scenario",
  "รัน test", "รีเทส", "ทดสอบหน้า master data", "ทดสอบ CRUD", "ทดสอบเป็นหน้าๆ",
  "แก้ไขเคส", "สถานะ test", "อธิบาย test plan", "master detail"
---

# QA UI Test Skill (Plugin Edition)

AI-powered QA testing skill ที่สร้าง, รัน, และจัดการ web UI tests ด้วย Playwright
พร้อม long-running agent style tracking, brainstorming, และ opus review

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     QA UI TEST PLUGIN                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Commands:                                                       │
│  ┌──────────────────┐ ┌────────────┐ ┌──────────────┐           │
│  │ /qa-create-      │ │ /qa-run    │ │ /qa-retest   │           │
│  │  scenario        │ │            │ │              │           │
│  │ Brainstorm +     │ │ Sequential │ │ Re-execute + │           │
│  │ Generate         │ │ or Parallel│ │ Compare +    │           │
│  │ IEEE 829         │ │ Subagents  │ │ Opus Review  │           │
│  └────────┬─────────┘ └─────┬──────┘ └──────┬───────┘           │
│           │                 │                │                   │
│           ▼                 ▼                ▼                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   qa-tracker.json                        │    │
│  │  • Scenario list + status tracking                       │    │
│  │  • Run history per scenario                              │    │
│  │  • Model assignment (sonnet/opus)                        │    │
│  │  • Review results                                        │    │
│  │  • Summary statistics                                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Outputs:                                                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│  │test-scenarios│ │  test-data   │ │ test-results │             │
│  │  *.md (IEEE) │ │  *.json      │ │  run-NNN/    │             │
│  └──────────────┘ └──────────────┘ └──────────────┘             │
│                                                                  │
│  Session Tracking:                                               │
│  ┌─────────────────────────────────────────────┐                │
│  │  .agent/qa-progress.md                       │                │
│  │  • Per-session log (like long-running)        │                │
│  └─────────────────────────────────────────────┘                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Available Commands

| Command | Description | When to use |
|---------|-------------|-------------|
| `/qa-create-scenario` | ระดมสมอง + สร้าง scenarios | เมื่อต้องการสร้าง test cases ใหม่สำหรับหน้าเว็บ |
| `/qa-run` | รัน tests (single/module/all/parallel) | เมื่อต้องการรัน tests ที่สร้างไว้ |
| `/qa-retest` | รีเทส + เปรียบเทียบผล + review | เมื่อแก้ bug แล้วต้องการรีเทส |
| `/qa-edit-scenario` | แก้ไข scenarios เมื่อ logic เปลี่ยน | เมื่อ business logic เปลี่ยนแล้วกระทบเคสเดิม |
| `/qa-status` | ดูสถานะภาพรวม | เมื่อต้องการเช็คสถานะ scenarios ทั้งหมด |
| `/qa-explain` | อธิบาย test plan + flowchart | เมื่อต้องการเข้าใจว่าจะทดสอบอะไรบ้าง |

## Quick Reference

- **Test scenario template**: Read `references/scenario-template.md`
- **Playwright helpers**: Read `references/playwright-guide.md`
- **Result structure**: Read `references/result-structure.md`
- **Tracker schema**: Read `templates/qa-tracker.json`
- **Scripts**: Execute scripts in `scripts/` directory

## Page Types Supported

### Master Data CRUD Pages

ทดสอบเป็นหน้าๆ สำหรับ:
- **List**: ตาราง, pagination, search, filter, sort, empty state
- **Create**: form, validation, submit, verify in list
- **Edit**: load existing, modify, save, verify changes
- **Delete**: confirm dialog, cancel dialog, verify removed/still exists

Standard template: 13 scenarios ต่อ 1 module (CRUD + search + pagination + sort + boundary + duplicate)

### Form Pages

- Happy path, required fields, each field invalid, boundary, special chars, duplicate submit

### Master-Detail Grid Pages (NEW)

ทดสอบหน้าที่มี master grid + expandable detail grid (เช่น Order → OrderItems):
- **Master Grid**: List, search, filter, pagination
- **Expand/Collapse**: Click row → detail grid expands
- **Detail CRUD**: Add/Edit/Delete rows ใน detail grid (inline editing)
- **Sync Verification**: Master totals อัพเดทตาม detail changes
- **Validation**: Detail row validation (required fields, data types)
- **Cancel**: Cancel edit → revert to original values

Standard template: 15 scenarios ต่อ 1 master-detail module

```
TS-{MODULE}-001: Master list view
TS-{MODULE}-002: Master search/filter
TS-{MODULE}-003: Master pagination
TS-{MODULE}-004: Create new master record
TS-{MODULE}-005: Expand detail grid (click row)
TS-{MODULE}-006: View detail rows
TS-{MODULE}-007: Add detail row (inline)
TS-{MODULE}-008: Add detail row — negative (validation)
TS-{MODULE}-009: Edit detail row (inline editing)
TS-{MODULE}-010: Edit detail row — negative
TS-{MODULE}-011: Delete detail row (confirm)
TS-{MODULE}-012: Delete detail row (cancel)
TS-{MODULE}-013: Master-detail sync (totals, counts)
TS-{MODULE}-014: Collapse detail grid
TS-{MODULE}-015: Multiple master rows expand/collapse
```

Playwright pattern for inline editing:
```typescript
// Click row to expand
await page.locator('tr', { hasText: 'ORD-001' }).click();
await page.waitForSelector('.detail-grid');

// Edit inline
const detailRow = page.locator('.detail-grid tr').nth(0);
await detailRow.locator('td.editable').dblclick();
await detailRow.locator('input[name="quantity"]').fill('10');
await detailRow.locator('button.save').click();

// Verify master total updated
await expect(page.locator('.master-total')).toHaveText('1,000');
```

### Multi-step Wizards

- Each step as sub-scenario, chain dependencies, forward/backward, cancel

### Dashboards

- Data loading, empty state, filter, date range, export

## Playwright MCP Integration (v1.2.0)

Plugin รองรับ `plugin:playwright:playwright` MCP server สำหรับวิเคราะห์หน้าเว็บแบบ real-time

### ตรวจสอบก่อนใช้งาน

ก่อนวิเคราะห์หน้าเว็บ ต้องตรวจสอบว่า Playwright MCP พร้อมใช้งาน:
- ลองเรียก `mcp__plugin_playwright_playwright__browser_snapshot`
- **ถ้าใช้งานได้** → ใช้ MCP tools (แม่นยำกว่า)
- **ถ้าไม่พบ** → แจ้งผู้ใช้ให้ติดตั้งก่อน

### เมื่อไม่พบ Playwright MCP ต้องแจ้ง:

```
⚠️ ไม่พบ Playwright MCP Plugin (plugin:playwright:playwright)
กรุณาติดตั้ง:
  1. พิมพ์ /mcp → Add MCP Server → plugin:playwright:playwright
  2. หรือ: claude mcp add playwright -- npx @anthropic-ai/mcp-playwright
```

### MCP Tools ที่ใช้

| Tool | ใช้ตอนไหน |
|------|----------|
| `browser_navigate` | เปิดหน้าเว็บเป้าหมาย |
| `browser_snapshot` | ดู DOM tree + accessibility tree + element refs |
| `browser_take_screenshot` | จับภาพหน้าเว็บ |
| `browser_click` | คลิกปุ่ม Add/Edit/Expand เพื่อสำรวจ |
| `browser_fill_form` | ทดสอบกรอก form |
| `browser_press_key` | กด Escape/Enter |
| `browser_console_messages` | ตรวจ console errors |
| `browser_run_code` | รัน custom Playwright code |

### ข้อดีของ MCP vs CLI

```
MCP (แนะนำ):
  ✅ เห็น DOM tree + element refs ทันที
  ✅ คลิกสำรวจ form/dialog ได้ real-time
  ✅ รู้ field names, types, labels แม่นยำ
  ✅ ตรวจ detail grid ได้โดย expand row

CLI (fallback):
  ⚠️ ได้แค่ screenshot
  ⚠️ ต้องเขียน script ชั่วคราว
  ⚠️ ไม่เห็น DOM structure
```

## Core Workflow

1. **ตรวจ MCP** → ตรวจสอบ Playwright MCP พร้อมใช้งาน (แจ้งถ้าไม่พบ)
2. **Brainstorm** → ถามผู้ใช้เกี่ยวกับ business rules, edge cases, user roles
3. **Analyze (MCP)** → Navigate, snapshot, click สำรวจ, detect page type
4. **Create Scenarios** → IEEE 829 format, test data, Playwright scripts
5. **Run Tests** → Sequential or parallel with subagents
6. **Report** → Per-run report, comparison report, summary
7. **Review** → Opus reviews test quality and coverage

## Long-running Agent Features

- **qa-tracker.json** — Tracks all scenarios across sessions (like feature_list.json)
- **Model assignment** — Critical scenarios → opus, standard → sonnet
- **Session progress** — .agent/qa-progress.md logs each session
- **Parallel execution** — Subagent-driven parallel test runs
- **Opus review** — Quality review of test results and coverage

## Integration with Other Plugins

| Plugin | Integration |
|--------|------------|
| **long-running** | Link scenarios to features via feature_id |
| **system-design-doc** | Read pages from design doc to generate scenarios |
| **ui-mockup** | Detect mockup pages for scenario generation |
| **ai-ui-test** | Complementary: chrome for ad-hoc, Playwright for structured |
| **test-runner** | test-runner for unit/integration, qa-ui-test for E2E UI |

## Important Notes

- Always initialize Playwright: `npm init playwright@latest`
- Install browsers: `npx playwright install chromium`
- Default to Chromium, support cross-browser when requested
- Test data must never contain real credentials
- Screenshot filenames: zero-padded, descriptive
- Selector priority: data-testid > role > label > CSS
- Thai language UI supported: include Thai text in selectors
