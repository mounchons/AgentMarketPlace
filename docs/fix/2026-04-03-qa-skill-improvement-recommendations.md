# QA UI Test Skill — ปัญหาที่พบ + แนะนำแก้ไข

**Date:** 2026-04-03
**Context:** ใช้ qa-ui-test plugin (qa-create-advanced, qa-continue-advanced) กับ BunTrukHub project
**Skills ที่เกี่ยวข้อง:** qa-create-advanced, qa-continue-advanced, qa-advanced-howto

---

## 1. Chrome MCP ไม่ควรอยู่ใน Test Generation Workflow

### ปัญหา

`qa-continue-advanced` Step 3 สั่งให้ใช้ Chrome MCP สำรวจหน้าจริง:

```
Step 3: Analyze Page (MCP สำหรับหา selectors เท่านั้น)
  ① Login (ถ้าต้อง auth)
  ② Navigate ไปหน้า module
  ③ Snapshot เพื่อดู elements จริง
  ④ จับ actual selectors, field names, button labels
```

ปัญหาที่เกิดขึ้นจริง:

| ปัญหา | รายละเอียด |
|--------|-----------|
| **เสียเวลามาก** | ต้อง login ผ่าน Chrome MCP, navigate ทีละหน้า, หา ref_id ทีละ element — ใช้เวลา 5-10 นาทีแค่เพื่อดู selectors |
| **Selector ไม่ตรงกัน** | Chrome MCP ใช้ accessibility tree / ref_id (`ref_20`, `ref_27`) ซึ่ง Playwright ใช้ไม่ได้ ต้องแปลงเป็น `getByRole()`, `getByText()`, `locator()` อยู่ดี |
| **ซ้ำซ้อนกับ code** | Existing test files มี selectors อยู่แล้ว + frontend components มี structure ที่อ่านได้จาก code |
| **ต้องมี server running** | Agent ต้องถามว่า server เปิดไหม กลายเป็น blocking dependency ที่ไม่จำเป็น |
| **ไม่ reliable** | หน้าเว็บอาจแสดงผลต่างกันตาม state, data, auth — selectors ที่ได้อาจไม่ครอบคลุม |

### แนะนำ

**ลบ Step 3 (MCP scan) ออกทั้งหมด** แล้วเปลี่ยนเป็น:

```markdown
### Step 3: Analyze Selectors (Code-Based)

1. อ่าน existing spec files ใน e2e/ → ดู selector patterns ที่ project ใช้
2. อ่าน frontend components → ดู data-testid, role, aria-label, className
3. ดู POM (Page Object Model) files ถ้ามี → reuse selectors
4. ถ้าต้องการ selectors ใหม่ที่หาจาก code ไม่ได้ → แนะนำ user รัน:
   npx playwright codegen http://localhost:3000
   แล้วส่ง selectors กลับมาให้ agent
```

**เหตุผล:** Playwright มี selector engine ของตัวเอง (`getByRole`, `getByText`, `getByTestId`, `locator`) ที่ออกแบบมาสำหรับ test scripts โดยเฉพาะ ไม่จำเป็นต้องใช้ Chrome accessibility tree

---

## 2. CRITICAL RULES ควรเพิ่มข้อ "No Chrome MCP for test execution"

### ปัญหา

Rule ปัจจุบัน:
```
3. MCP ใช้ได้เฉพาะสำรวจหน้าจริง — หา selectors ก่อนสร้าง script
```

ทำให้ agent เข้าใจว่า "ต้องใช้ MCP ก่อน" เสมอ — กลายเป็น mandatory step

### แนะนำ

เปลี่ยนเป็น:
```
3. ห้ามใช้ Chrome MCP / browser automation tools ในทุกขั้นตอน
   — หา selectors จาก existing code (e2e/, components/, POM files)
   — ถ้าหา selector ไม่ได้ → แนะนำ user ใช้ npx playwright codegen
   — Playwright CLI เท่านั้นสำหรับทั้ง generate + run
```

---

## 3. Selector Discovery Strategy ควรมีลำดับชัด

### ปัญหา

ไม่มี strategy ชัดเจนว่าจะหา selectors จากไหน ทำให้ agent ไปพึ่ง Chrome MCP

### แนะนำ

เพิ่ม section ใหม่ใน skill:

```markdown
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
   npx playwright codegen http://localhost:3000/{page}
   แล้ว paste selectors กลับมา
```

---

## 4. "ทำทีละ module" Rule ไม่เหมาะกับ --flow flag

### ปัญหา

Rule: "ทำทีละ module — เหมือน long-running: 1 module per session"

แต่ `--flow state-machine` ข้ามหลาย modules (JOB, BILL, QUOTATION, EXPENSE, SALARY, TICKET = 6 modules, 12 scenarios)

ทำให้ agent สับสน — ต้องเลือก 1 module แต่ flag บอกให้ทำทุก module

### แนะนำ

ปรับ rule:
```markdown
## Module Scope Rules

- --module {MODULE}: ทำเฉพาะ module เดียว (1 module per session)
- --flow {TYPE}: ทำทุก module ที่มี flow type นั้น (ข้ามได้)
  → จัดกลุ่มเป็น batch per module, commit per module
  → ถ้ามากกว่า 3 modules → แนะนำ user ใช้ --parallel
- --serial-group {GROUP}: ทำเฉพาะ group (อาจข้าม module ได้)
```

---

## 5. API-First vs UI-First Approach ไม่ชัดเจน

### ปัญหา

State machine tests ต้องเปลี่ยน status — แต่บาง UI อาจยังไม่มี transition buttons (เช่น Job workflow ใน BunTrukHub ยังไม่มี UI สำหรับ transition ทุก step)

Agent ไม่รู้ว่าควรใช้ approach ไหน:
- **UI-first:** click transition button บน UI → verify status change
- **API-first:** เรียก transition API ตรง → navigate to UI → verify status badge

### แนะนำ

เพิ่ม section:
```markdown
## State Machine Test Approach

### ตรวจสอบก่อนว่า UI มี transition controls ไหม:

1. อ่าน component code ของ detail page
2. หา transition buttons, status change dropdowns, workflow actions

### ถ้า UI มี transition controls:
→ UI-first: click button → wait for response → verify badge

### ถ้า UI ยังไม่มี (API-only transitions):
→ API-first: setup via API → navigate to page → verify display

Pattern:
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

---

## 6. Variants Files ควรมี Schema Validation

### ปัญหา

Data-driven variants files (`test-data/*.json`) ไม่มี schema — agent สร้าง structure ต่างกันแต่ละครั้ง

### แนะนำ

กำหนด standard schema:

```json
{
  "$schema": "qa-variants-v1",
  "description": "...",
  "setup": {
    "login": true,
    "navigateTo": "/customers/new",
    "apiSetup": []
  },
  "variants": [
    {
      "name": "unique-slug",
      "description": "human readable",
      "input": { "field": "value" },
      "expected": {
        "result": "success | error | success_or_error",
        "errorField": "field name (if error)",
        "errorMessage": "partial match (if error)",
        "mustNotContain": "XSS string (if success_or_error)",
        "verifyValues": { "field": "expected value (if success)" }
      }
    }
  ]
}
```

---

## 7. Self-Check Checklist ขาด "Server Not Required" Check

### ปัญหา

Checklist ไม่มีข้อที่บอกว่า "ไม่ต้องใช้ browser/MCP" ทำให้ agent เริ่มต้นด้วยการหา Chrome MCP เสมอ

### แนะนำ

เพิ่มใน checklist:
```markdown
### Self-Check Checklist (MANDATORY)

- [ ] qa-tracker.json read?
- [ ] **Selectors found from CODE (not browser)?**        ← NEW
- [ ] **No Chrome MCP / browser tools used?**              ← NEW
- [ ] Advanced scenarios selected with `advanced` field?
- [ ] Playwright scripts generated per pattern?
- [ ] Tests run with `npx playwright test` (CLI)?
- [ ] qa-tracker.json updated (status, runs)?
- [ ] Committed?
```

---

## 8. Reference Guide Files ไม่ถูก Read

### ปัญหา

Step 2 สั่งให้ "Read references/state-machine-guide.md" แต่:
- Agent อาจหา path ไม่เจอ (relative path ไม่ชัด)
- ไม่มี fallback ถ้าไฟล์ไม่มี

### แนะนำ

ใช้ absolute path หรือ variable:
```markdown
Step 2: Read Pattern Reference

  State Machine → Read ${SKILL_ROOT}/references/state-machine-guide.md
  Data-Driven   → Read ${SKILL_ROOT}/references/data-driven-guide.md
  Network Mock  → Read ${SKILL_ROOT}/references/network-mock-guide.md

  ถ้าไม่เจอ → ใช้ pattern examples ที่อยู่ใน skill file เอง
```

---

## 9. Parallel Mode (--parallel) ไม่มี Implementation Detail

### ปัญหา

Flag `--parallel` ถูกกล่าวถึงแต่ไม่มีรายละเอียดว่า dispatch subagents อย่างไร

### แนะนำ

เพิ่ม section:
```markdown
## Parallel Mode (--parallel)

Dispatch 1 subagent per module:

  Agent 1: generate + run JOB state-machine tests
  Agent 2: generate + run BILL state-machine tests
  Agent 3: generate + run QUOTATION state-machine tests
  ...

Rules:
- แต่ละ agent ทำงานใน worktree แยก (isolation)
- แต่ละ agent commit เอง
- Main agent รวม results + update qa-tracker.json
- ถ้า module มี serial-group → ห้ามแยก parallel (ต้องรัน sequential)
```

---

## 10. Missing: "Reuse Existing Helpers" Instruction

### ปัญหา

ทุก existing test file มี shared helpers (loginAsAdmin, apiCreateCustomer, getToken) แต่ skill ไม่ได้บอกให้ reuse

### แนะนำ

เพิ่ม:
```markdown
## Helper Reuse

ก่อนสร้าง script ใหม่ ต้อง:
1. อ่าน existing specs → หา shared helpers (login, API setup, etc.)
2. ถ้ามี helpers ที่ใช้ซ้ำได้ → import หรือ copy pattern
3. ห้ามเขียน login flow ใหม่ทุกไฟล์ → extract เป็น shared fixture

Pattern ที่ดี:
  // e2e/helpers/auth.ts
  export async function loginAsAdmin(page: Page) { ... }
  export async function getToken(request: APIRequestContext) { ... }

  // e2e/helpers/api-setup.ts
  export async function apiCreateJob(request, customerId) { ... }
  export async function apiTransitionJob(request, jobId, step, data) { ... }
```

---

## สรุป Priority

| # | ปัญหา | Impact | ความยากในการแก้ |
|---|--------|--------|----------------|
| 1 | Chrome MCP ใน workflow | **Critical** — เสียเวลา + ไม่จำเป็น | ง่าย (ลบ Step 3) |
| 2 | CRITICAL RULES ไม่ชัด | **High** — agent สับสน | ง่าย (แก้ wording) |
| 3 | ไม่มี selector strategy | **High** — agent ไม่รู้จะหาจากไหน | ปานกลาง (เพิ่ม section) |
| 5 | API-first vs UI-first | **High** — state machine tests ล้มเหลว | ปานกลาง (เพิ่ม guidance) |
| 4 | --flow ข้าม module rule | **Medium** — agent สับสน | ง่าย (ปรับ rule) |
| 10 | ไม่ reuse helpers | **Medium** — code ซ้ำ | ง่าย (เพิ่ม instruction) |
| 7 | Checklist ขาดข้อ | **Medium** — ไม่มี guard | ง่าย (เพิ่ม 2 ข้อ) |
| 6 | Variants ไม่มี schema | **Low** — inconsistent แต่ยังทำงานได้ | ปานกลาง |
| 8 | Reference path ไม่ชัด | **Low** — fallback ได้ | ง่าย |
| 9 | --parallel ไม่มี detail | **Low** — ยังไม่ใช้บ่อย | ปานกลาง |
