---
name: qa-advanced
version: 1.0.0
description: |
  Advanced QA UI Testing patterns — state-machine flows, data-driven testing,
  network mocking, serial test orchestration ต่อยอดจาก qa-ui-test plugin

  รองรับ: state machine testing (status flow transitions), data-driven testing
  (parameterized variants), network mocking (API error simulation, retry sequences,
  request validation), serial group orchestration (ordered test execution, shared data)

  USE THIS SKILL when the user mentions: state machine test, flow testing,
  status transition test, data-driven test, parameterized test, test variants,
  network mock, API mock, mock error, mock timeout, serial test, test order,
  test dependency, advanced test, complex page test, conditional flow test

  Thai triggers: "ทดสอบ flow", "ทดสอบ state machine", "ทดสอบ status",
  "test หลาย data", "data-driven", "mock API", "จำลอง error", "จำลอง timeout",
  "เทสตามลำดับ", "serial test", "ทดสอบขั้นสูง", "ทดสอบ complex"
---

# QA Advanced Skill

Advanced testing patterns ที่ต่อยอดจาก qa-ui-test — รองรับหน้าที่มี logic ซับซ้อน

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     QA ADVANCED PLUGIN                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Commands:                                                       │
│  ┌──────────────────┐ ┌────────────────┐ ┌────────────────┐     │
│  │ /qa-create-      │ │ /qa-continue-  │ │ /qa-advanced-  │     │
│  │  advanced        │ │  advanced      │ │  howto         │     │
│  │ --enhance: ต่อยอด│ │ Generate +     │ │ วิธีใช้ +       │     │
│  │ --auto: สร้างใหม่ │ │ Run CLI only   │ │ command ref    │     │
│  └────────┬─────────┘ └──────┬─────────┘ └────────────────┘     │
│           │                  │                                   │
│           ▼                  ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                   qa-tracker.json                        │    │
│  │  • schema 1.4.0 (backward compatible)                    │    │
│  │  • optional "advanced" field per scenario                │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                  │
│  4 Advanced Patterns:                                            │
│  ┌──────────────┐ ┌──────────────┐                              │
│  │ State Machine│ │ Data-Driven  │                              │
│  │ flow_type:   │ │ variants[]   │                              │
│  │ transitions[]│ │ test.each    │                              │
│  └──────────────┘ └──────────────┘                              │
│  ┌──────────────┐ ┌──────────────┐                              │
│  │ Network Mock │ │ Serial Group │                              │
│  │ page.route() │ │ describe.    │                              │
│  │ sequence[]   │ │ serial()     │                              │
│  └──────────────┘ └──────────────┘                              │
│                                                                  │
│  CRITICAL RULES:                                                 │
│  ✅ ใช้ Playwright CLI: npx playwright test                      │
│  ❌ ห้ามใช้ Chrome MCP / browser automation tools ทุกขั้นตอน      │
│  💡 หา selectors จาก code (e2e/, components/, POM files)         │
│  💡 ถ้าหาไม่ได้ → แนะนำ user: npx playwright codegen             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Available Commands

| Command | Description | When to use |
|---------|-------------|-------------|
| `/qa-create-advanced --enhance` | ต่อยอด scenarios เดิมด้วย advanced patterns | มี qa-tracker.json แล้ว ต้องการเพิ่ม complexity |
| `/qa-create-advanced --auto` | scan codebase สร้าง advanced scenarios ใหม่ | เริ่มต้นใหม่ หรือยังไม่มี qa-tracker.json |
| `/qa-continue-advanced` | generate scripts + run tests | หลัง create → ทำทีละ module |
| `/qa-advanced-howto` | วิธีใช้ + ตัวอย่าง + command reference | เรียนรู้วิธีใช้งาน |

## 4 Advanced Patterns

| Pattern | ใช้เมื่อ | Playwright Feature |
|---------|---------|-------------------|
| State Machine | หน้ามี status flow (order, task) | `test.describe.serial()` |
| Data-Driven | test ซ้ำๆ ต่าง input | `for...of` variants loop |
| Network Mock | ทดสอบ API error/timeout | `page.route()` |
| Serial Group | test ต้องรันตามลำดับ | `test.describe.serial()` + shared JSON |

## Selector Discovery Priority (ไม่ต้องใช้ browser)

1. **อ่าน existing tests** → e2e/*.spec.ts
   - คัดลอก login helper, API setup patterns
   - ดู selector conventions: getByRole, getByText, locator("#id")

2. **อ่าน frontend components** → src/app/(app)/{module}/
   - หา id, data-testid, aria-label, role ใน JSX
   - ดู button labels, form field names, table structure

3. **อ่าน Zod schemas** → form validation schemas
   - ชื่อ fields ใน schema = ชื่อ fields ใน form

4. **อ่าน API hooks** → src/hooks/use-{module}.ts
   - ดู endpoint URLs, payload structure
   - ใช้สำหรับ API-first test setup

5. **ถ้ายังหาไม่ได้** → แนะนำ user:
   ```
   npx playwright codegen http://localhost:3000/{page}
   ```
   แล้ว paste selectors กลับมา

## Helper Reuse

ก่อนสร้าง script ใหม่ ต้อง:
1. อ่าน existing specs → หา shared helpers (login, API setup, etc.)
2. ถ้ามี helpers ที่ใช้ซ้ำได้ → import หรือ copy pattern
3. ห้ามเขียน login flow ใหม่ทุกไฟล์ → extract เป็น shared fixture

Pattern ที่ดี:
```typescript
// e2e/helpers/auth.ts
export async function loginAsAdmin(page: Page) { ... }
export async function getToken(request: APIRequestContext) { ... }

// e2e/helpers/api-setup.ts
export async function apiCreateJob(request, customerId) { ... }
export async function apiTransitionJob(request, jobId, step, data) { ... }
```

## Module Scope Rules

- `--module {MODULE}`: ทำเฉพาะ module เดียว (1 module per session)
- `--flow {TYPE}`: ทำทุก module ที่มี flow type นั้น (ข้ามได้)
  → จัดกลุ่มเป็น batch per module, commit per module
  → ถ้ามากกว่า 3 modules → แนะนำ user ใช้ --parallel
- `--serial-group {GROUP}`: ทำเฉพาะ group (อาจข้าม module ได้)

## State Machine Test Approach

### ตรวจสอบก่อนว่า UI มี transition controls ไหม:

1. อ่าน component code ของ detail page
2. หา transition buttons, status change dropdowns, workflow actions

### ถ้า UI มี transition controls:
→ UI-first: click button → wait for response → verify badge

### ถ้า UI ยังไม่มี (API-only transitions):
→ API-first: setup via API → navigate to page → verify display

Pattern:
```typescript
test("should show LOAD status after transition", async ({ page, request }) => {
  // Setup: create job via API
  const jobId = await apiCreateJob(request);
  // Transition: via API
  await apiTransitionJob(request, jobId, "LOAD", { weightStart: 20000 });
  // Verify: navigate to UI
  await page.goto(`/jobs/${jobId}`);
  await expect(page.getByText("LOAD")).toBeVisible();
});
```

## Parallel Mode (--parallel)

Dispatch 1 subagent per module:

```
Agent 1: generate + run JOB state-machine tests
Agent 2: generate + run BILL state-machine tests
Agent 3: generate + run QUOTATION state-machine tests
```

Rules:
- แต่ละ agent ทำงานใน worktree แยก (isolation)
- แต่ละ agent commit เอง
- Main agent รวม results + update qa-tracker.json
- ถ้า module มี serial-group → ห้ามแยก parallel (ต้องรัน sequential)

## Quick Reference

- **Pattern decision guide**: Read `references/advanced-patterns.md`
- **State machine notation**: Read `references/state-machine-guide.md`
- **Data-driven format**: Read `references/data-driven-guide.md`
- **Variants JSON schema**: Read `references/qa-variants-schema.json`
- **Network mock patterns**: Read `references/network-mock-guide.md`

## Relationship with qa-ui-test

- qa-ui-test = basic CRUD testing (ไม่แตะ)
- qa-advanced = complex flows, data-driven, mocking (ต่อยอด)
- ใช้ qa-tracker.json ร่วมกัน (backward compatible)
- commands แยกกัน: `/qa-create-scenario` vs `/qa-create-advanced`
