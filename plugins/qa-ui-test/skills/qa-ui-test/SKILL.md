---
name: qa-ui-test
version: 2.0.0
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
| `/qa-create-scenario --auto` | สแกน codebase → สร้าง scenarios ทั้งหมดเป็น JSON | **เริ่มต้นใช้คำสั่งนี้** |
| `/qa-create-scenario [URL]` | brainstorm + สร้างทีละหน้า | ต้องการ brainstorm หน้าเฉพาะ |
| `/qa-continue` | เลือก module → สร้าง scripts → รัน test | **ใช้หลัง create — ทำทีละ module** |
| `/qa-run` | รัน tests (single/module/all/parallel) | รัน tests ที่สร้างไว้แล้ว |
| `/qa-retest` | รีเทส + เปรียบเทียบผล + review | แก้ bug แล้วรีเทส |
| `/qa-edit-scenario` | แก้ไข scenarios เมื่อ logic เปลี่ยน | เมื่อ business logic เปลี่ยนแล้วกระทบเคสเดิม |
| `/qa-status` | ดูสถานะภาพรวม | เมื่อต้องการเช็คสถานะ scenarios ทั้งหมด |
| `/qa-explain` | อธิบาย test plan + flowchart | เมื่อต้องการเข้าใจว่าจะทดสอบอะไรบ้าง |

## Multi-Agent Brainstorm (v2.0.0)

ใช้ `--auto --brainstorm-agents` เพื่อ dispatch 5 subagents ช่วยคิด scenarios:

| Agent | บทบาท | มุมมอง |
|-------|--------|--------|
| End User | ผู้ใช้งานจริง | UX, user journey, error recovery |
| Security Tester | ผู้ทดสอบความปลอดภัย | SQLi, XSS, CSRF, IDOR, auth bypass |
| Bug Hunter | นักล่า edge cases | boundary, null, unicode, concurrency |
| Business Analyst | วิเคราะห์ business logic | hidden rules, calculations, workflows |
| Accessibility | ทดสอบ a11y | keyboard, screen reader, WCAG |

ทุก agent ทำงาน **parallel** → รวมผล → deduplicate → สร้าง scenarios

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

## Role-based Testing (v1.3.0)

รองรับทดสอบแต่ละ user role — แต่ละ role เข้าถึงหน้าจอและ actions ได้ไม่เหมือนกัน

### แนวคิด

```
┌─────────────────────────────────────────────────────────────────┐
│                    ROLE-BASED TESTING                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  qa-tracker.json เก็บ:                                           │
│                                                                  │
│  roles[] — รายชื่อ roles + credentials สำหรับ login              │
│  role_page_access{} — แต่ละ role เข้าหน้าไหนได้ + ทำอะไรได้      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  Role: admin                                        │        │
│  │  Pages: /products ✅ /orders ✅ /users ✅ /settings ✅│        │
│  │  Actions: view ✅ create ✅ edit ✅ delete ✅          │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  Role: manager                                      │        │
│  │  Pages: /products ✅ /orders ✅ /users ❌ /settings ❌│        │
│  │  Actions: view ✅ create ✅ edit ✅ delete ❌          │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  Role: viewer                                       │        │
│  │  Pages: /products ✅ /orders ✅ /users ❌ /settings ❌│        │
│  │  Actions: view ✅ create ❌ edit ❌ delete ❌          │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
│  Scenarios ที่สร้างอัตโนมัติ:                                     │
│                                                                  │
│  TS-ROLE-001: admin เข้า /products → ✅ เห็นทั้ง CRUD             │
│  TS-ROLE-002: manager เข้า /products → ✅ เห็น view/create/edit   │
│  TS-ROLE-003: viewer เข้า /products → ✅ เห็นเฉพาะ view           │
│  TS-ROLE-004: viewer เข้า /products กด Add → ❌ ไม่เห็นปุ่ม/denied│
│  TS-ROLE-005: manager เข้า /users → ❌ redirect/403               │
│  TS-ROLE-006: viewer เข้า /settings → ❌ redirect/403             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### qa-tracker.json — roles config

```json
{
  "roles": [
    {
      "name": "admin",
      "display_name": "ผู้ดูแลระบบ",
      "credentials": {
        "username": "admin@test.com",
        "password": "TestAdmin@123"
      },
      "description": "เข้าถึงได้ทุกหน้า ทำได้ทุก action"
    },
    {
      "name": "manager",
      "display_name": "ผู้จัดการ",
      "credentials": {
        "username": "manager@test.com",
        "password": "TestManager@123"
      },
      "description": "เข้าถึง products, orders ได้ แต่ไม่สามารถลบได้"
    },
    {
      "name": "viewer",
      "display_name": "ผู้ดูข้อมูล",
      "credentials": {
        "username": "viewer@test.com",
        "password": "TestViewer@123"
      },
      "description": "ดูข้อมูลได้อย่างเดียว ไม่สามารถแก้ไข"
    }
  ],
  "role_page_access": {
    "/admin/products": {
      "admin":   { "view": true, "create": true, "edit": true, "delete": true },
      "manager": { "view": true, "create": true, "edit": true, "delete": false },
      "viewer":  { "view": true, "create": false, "edit": false, "delete": false }
    },
    "/admin/orders": {
      "admin":   { "view": true, "create": true, "edit": true, "delete": true },
      "manager": { "view": true, "create": true, "edit": true, "delete": false },
      "viewer":  { "view": true, "create": false, "edit": false, "delete": false }
    },
    "/admin/users": {
      "admin":   { "view": true, "create": true, "edit": true, "delete": true },
      "manager": { "view": false, "create": false, "edit": false, "delete": false },
      "viewer":  { "view": false, "create": false, "edit": false, "delete": false }
    },
    "/admin/settings": {
      "admin":   { "view": true, "create": true, "edit": true, "delete": true },
      "manager": { "view": false, "create": false, "edit": false, "delete": false },
      "viewer":  { "view": false, "create": false, "edit": false, "delete": false }
    }
  }
}
```

### Scenario types ที่สร้าง

| Type | ID Pattern | ทดสอบอะไร |
|------|-----------|-----------|
| role-access-granted | TS-ROLE-{MODULE}-{ROLE}-ACCESS | role นี้เข้าหน้านี้ได้ |
| role-access-denied | TS-ROLE-{MODULE}-{ROLE}-DENIED | role นี้เข้าหน้านี้ไม่ได้ (redirect/403) |
| role-action-allowed | TS-ROLE-{MODULE}-{ROLE}-{ACTION} | role นี้ทำ action นี้ได้ |
| role-action-hidden | TS-ROLE-{MODULE}-{ROLE}-NO{ACTION} | role นี้ไม่เห็นปุ่ม/menu ของ action นี้ |
| role-action-denied | TS-ROLE-{MODULE}-{ROLE}-DENY{ACTION} | role นี้กดปุ่มได้แต่ server reject |

### Login flow per role

```
ก่อนรัน scenario ที่ต้อง login:

1. Navigate ไป login_url
2. กรอก credentials ของ role นั้น
3. Submit login
4. Verify login สำเร็จ
5. Navigate ไปหน้าเป้าหมาย
6. ทดสอบ scenario
7. Logout (cleanup)
```

### Playwright POM สำหรับ login

```typescript
// tests/helpers/auth.helper.ts
export async function loginAs(page: Page, role: Role) {
  await page.goto(loginUrl);
  await page.getByRole('textbox', { name: /email|username/i }).fill(role.credentials.username);
  await page.getByRole('textbox', { name: /password/i }).fill(role.credentials.password);
  await page.getByRole('button', { name: /login|เข้าสู่ระบบ/i }).click();
  await page.waitForURL('**/dashboard**');
}

export async function logout(page: Page) {
  await page.getByRole('button', { name: /logout|ออกจากระบบ/i }).click();
  await page.waitForURL('**/login**');
}
```

### วิเคราะห์ role permissions จาก code

```
ตรวจสอบว่า role เห็นอะไรบ้าง (จาก code analysis):

① อ่าน authorization config:
   - [Authorize(Roles = "admin,manager")] attributes
   - middleware / route guards / useAuth hook

② อ่าน frontend component ที่ตรวจ role:
   - {user.role === 'admin' && <DeleteButton />}
   - v-if="hasPermission('delete')"

③ Map role → permissions:
   admin: เห็น [Add] [Edit] [Delete]
   viewer: เห็นเฉพาะ table ไม่มีปุ่ม

④ สร้าง scenarios จากผลวิเคราะห์
```

## Cascade Testing (v1.3.0)

ทดสอบผลกระทบเมื่อแก้ไข/ลบ master data → หน้าที่ใช้ข้อมูลนั้นยังทำงานถูกต้อง

### แนวคิด

```
┌─────────────────────────────────────────────────────────────────┐
│                    CASCADE TESTING                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ① แก้ข้อมูล Master:                                             │
│     Category "Electronics" → "Consumer Electronics"              │
│                                                                  │
│  ② ตรวจหน้าที่ใช้ข้อมูลนี้:                                       │
│     ├── Products: Category column อัพเดท?                        │
│     ├── Products: Category dropdown อัพเดท?                      │
│     ├── Orders: Product.Category อัพเดท?                         │
│     └── Reports: Category breakdown ถูกต้อง?                     │
│                                                                  │
│  ③ ทดสอบ Cascade Delete:                                         │
│     ├── ลบ Category ที่มี Products → Restrict: error msg         │
│     ├── ลบ Category ที่ว่าง → ลบสำเร็จ                            │
│     └── ลบ Product ที่มี OrderItems → Restrict/SetNull           │
│                                                                  │
│  ④ ทดสอบ Cascade Update:                                         │
│     ├── แก้ Category.Name → Products แสดงชื่อใหม่                 │
│     ├── แก้ Product.Price → OrderItem.UnitPrice ไม่เปลี่ยน?       │
│     └── Disable Category → Products ใน Category นี้ยังแสดง?       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### qa-tracker.json — cascade_dependencies

```json
{
  "cascade_dependencies": [
    {
      "master_module": "CATEGORY",
      "master_page": "/admin/categories",
      "dependent_modules": [
        {
          "module": "PRODUCT",
          "page": "/admin/products",
          "relationship": "Product.CategoryId → Category.Id",
          "on_delete": "Restrict",
          "affected_elements": [
            "Category column ใน Product list",
            "Category dropdown ใน Product form",
            "Category filter ใน Product list"
          ]
        }
      ]
    },
    {
      "master_module": "PRODUCT",
      "master_page": "/admin/products",
      "dependent_modules": [
        {
          "module": "ORDER",
          "page": "/admin/orders",
          "relationship": "OrderItem.ProductId → Product.Id",
          "on_delete": "Restrict",
          "affected_elements": [
            "Product name ใน order detail",
            "Product dropdown ใน add order item",
            "Product price reference"
          ]
        }
      ]
    }
  ]
}
```

### Cascade scenario types

| Type | ทดสอบอะไร |
|------|-----------|
| CASCADE-UPDATE | แก้ master → dependent แสดงข้อมูลใหม่ |
| CASCADE-DELETE-RESTRICT | ลบ master ที่มี dependents → error |
| CASCADE-DELETE-EMPTY | ลบ master ที่ไม่มี dependents → สำเร็จ |
| CASCADE-DELETE-SETNULL | ลบ master → dependent field เป็น null |
| CASCADE-DISABLE | disable/inactive master → dependent ยังทำงาน? |
| CASCADE-DROPDOWN | เพิ่ม/แก้/ลบ master → dropdown ใน dependent อัพเดท |
| CASCADE-INDIRECT | A → B → C: แก้ A → C ยังถูกต้อง? |

### Workflow: `/qa-continue --cascade CATEGORY`

```
1. Navigate ไปหน้า CATEGORY
2. แก้ชื่อ category "Electronics" → "Consumer Electronics"
3. Save → verify สำเร็จ
4. Navigate ไปหน้า PRODUCT
5. ตรวจ:
   - Category column แสดง "Consumer Electronics"
   - Category dropdown มี "Consumer Electronics"
   - Product filter ทำงานกับชื่อใหม่
6. Navigate ไปหน้า ORDER
7. ตรวจ:
   - Order detail ที่มี product ใน category นี้ แสดงถูกต้อง
8. กลับไปหน้า CATEGORY
9. ลบ category ที่มี products → ตรวจ error message
10. ลบ category ที่ว่าง → ตรวจลบสำเร็จ
```

## Recommended Workflow

```
/qa-create-scenario --auto     ← สร้าง scenarios ทั้งหมดจาก code (ครั้งเดียว)
       │
       ▼
/qa-continue                   ← เลือก module → สร้าง scripts → test (ทีละ module)
/qa-continue --module LOGIN
/qa-continue --module PRODUCT
/qa-continue --module ORDER
       │
       ▼
/qa-continue --cascade CATEGORY ← ทดสอบ cascade (หลังทำ modules เสร็จ)
       │
       ▼
/qa-retest                     ← แก้ bug → รีเทส failed
/qa-retest --review            ← opus review
       │
       ▼
/qa-edit-scenario              ← เพิ่ม/แก้ scenarios ด้วย brainstorm (เมื่อต้องการ)
/qa-status                     ← ดูภาพรวม
/qa-explain                    ← ดู flowchart
```

---

## Selector Discovery (Code-Based — ไม่ใช้ browser)

Plugin หา selectors จาก code analysis เท่านั้น เพื่อลด token usage และเพิ่มความแม่นยำ

### ลำดับการหา Selectors

1. **อ่าน existing tests** → e2e/*.spec.ts
   - คัดลอก login helper, API setup patterns
   - ดู selector conventions: getByRole, getByText, locator("#id")

2. **อ่าน frontend components** → src/app/(app)/{module}/
   - หา data-testid, role, aria-label, className ใน JSX
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

### Helper Reuse

ก่อนสร้าง script ใหม่ ต้อง:
1. อ่าน existing specs → หา shared helpers (login, API setup, etc.)
2. ถ้ามี helpers ที่ใช้ซ้ำได้ → import หรือ copy pattern
3. ห้ามเขียน login flow ใหม่ทุกไฟล์ → extract เป็น shared fixture

### CRITICAL RULES

1. **ห้ามใช้ Chrome MCP / browser automation tools ในทุกขั้นตอน**
2. **หา selectors จาก code เท่านั้น** (e2e/, components/, POM files)
3. **ถ้าหาไม่ได้ → แนะนำ user ใช้ `npx playwright codegen`**
4. **Playwright CLI เท่านั้นสำหรับทั้ง generate + run**

## Core Workflow

1. **Brainstorm** → ถามผู้ใช้เกี่ยวกับ business rules, edge cases, user roles
2. **Analyze (Code)** → อ่าน components, schemas, existing tests หา selectors + page type
3. **Create Scenarios** → IEEE 829 format, test data, Playwright scripts
4. **Run Tests** → Sequential or parallel with subagents (`npx playwright test`)
5. **Report** → Per-run report, comparison report, summary
6. **Review** → Opus reviews test quality and coverage

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
| **ai-ui-test** | Complementary: ai-ui-test for ad-hoc, qa-ui-test for structured |
| **test-runner** | test-runner for unit/integration, qa-ui-test for E2E UI |

## Important Notes

- Always initialize Playwright: `npm init playwright@latest`
- Install browsers: `npx playwright install chromium`
- Default to Chromium, support cross-browser when requested
- Test data must never contain real credentials
- Screenshot filenames: zero-padded, descriptive
- Selector priority: data-testid > role > label > CSS
- Thai language UI supported: include Thai text in selectors
