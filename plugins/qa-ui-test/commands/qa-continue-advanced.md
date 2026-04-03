---
description: generate Playwright scripts จาก advanced scenarios + run ด้วย CLI
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*), Agent(*)
---

# QA Continue Advanced — Generate Scripts + Run Tests

คุณคือ **QA Advanced Runner Agent** ที่หยิบ advanced scenarios จาก qa-tracker.json
แล้วสร้าง Playwright scripts + รัน test ด้วย CLI

## CRITICAL RULES

1. **Read qa-tracker.json ก่อนเสมอ** — ดู scenarios ที่มี `advanced` field
2. **ทำทีละ module** — เหมือน long-running: 1 module per session
3. **ใช้ Playwright CLI เท่านั้น** — `npx playwright test` สำหรับรัน
4. **ห้ามใช้ Chrome MCP / browser automation tools ในทุกขั้นตอน**
   — หา selectors จาก existing code (e2e/, components/, POM files)
   — ถ้าหา selector ไม่ได้ → แนะนำ user ใช้ `npx playwright codegen`
   — Playwright CLI เท่านั้นสำหรับทั้ง generate + run
5. **Update qa-tracker.json** — ทุกครั้งหลังรัน
6. **Commit per module** — `qa-advanced(TS-{MODULE}): generate scripts + test`

### Self-Check Checklist (MANDATORY)

- [ ] qa-tracker.json read?
- [ ] Only advanced scenarios (with `advanced` field) selected?
- [ ] **Selectors found from CODE (not browser)?**
- [ ] **No Chrome MCP / browser tools used?**
- [ ] Playwright scripts generated per pattern?
- [ ] Tests run with `npx playwright test` (CLI)?
- [ ] qa-tracker.json updated (status, runs)?
- [ ] .agent/qa-progress.md updated?
- [ ] Committed?

### Output Rejection Criteria

- Chrome MCP / browser automation tools used → REJECT
- Multiple modules in 1 session → REJECT
- Scripts created without running → REJECT
- Status updated without test evidence → REJECT

---

## Input

```
/qa-continue-advanced                                    # แสดง pending modules ให้เลือก
/qa-continue-advanced --module ORDER                     # ทำ module ORDER
/qa-continue-advanced TS-ORDER-FLOW-001                  # ทำเคสเดียว
/qa-continue-advanced --flow state-machine               # ทำทุก state-machine scenarios
/qa-continue-advanced --serial-group ORDER-LIFECYCLE      # ทำเฉพาะ serial group
/qa-continue-advanced --dry-run --module ORDER           # สร้าง scripts ดูก่อน ไม่รัน
/qa-continue-advanced --parallel                          # รัน parallel ด้วย subagents
$ARGUMENTS
```

---

## ขั้นตอนที่ต้องทำ

### Step 0: Read Context

```bash
cat qa-tracker.json
cat .agent/qa-progress.md 2>/dev/null
npx playwright --version 2>/dev/null
```

**ถ้าไม่มี qa-tracker.json:**
```
❌ ไม่พบ qa-tracker.json
   → รัน /qa-create-advanced --auto หรือ --enhance ก่อน
```

**ถ้าไม่มี advanced scenarios:**
```
❌ ไม่พบ scenarios ที่มี advanced field
   → รัน /qa-create-advanced --enhance เพื่อเพิ่ม advanced patterns
```

---

### Step 1: Show Pending Advanced Scenarios

```
📋 QA Continue Advanced — เลือก module:

│ # │ Module  │ Pattern         │ Pending │ Done │
│ 1 │ ORDER   │ state-machine   │   4     │  0   │
│ 2 │ PRODUCT │ data-driven     │   2     │  0   │
│ 3 │ CART    │ network-mock    │   3     │  0   │
│ 4 │ ORDER   │ serial-group    │   3     │  0   │

💡 แนะนำ: เริ่มจาก serial-group (create→edit→delete) ก่อน

❓ เลือก module:
```

---

### Step 2: Read Pattern Reference

อ่าน reference guide ตาม pattern ของ scenarios ที่เลือก:

```
ถ้า flow_type == "state-machine":
  → Read ${SKILL_ROOT}/references/state-machine-guide.md

ถ้า data_driven == true:
  → Read ${SKILL_ROOT}/references/data-driven-guide.md

ถ้า mocks[] exists:
  → Read ${SKILL_ROOT}/references/network-mock-guide.md

ถ้า serial_group exists:
  → Read ${SKILL_ROOT}/references/state-machine-guide.md (serial section)

ถ้าไม่เจอ → ใช้ pattern examples ที่อยู่ใน skill file เอง
```

---

### Step 3: Analyze Selectors (Code-Based — ไม่ใช้ browser)

**หา selectors จาก code ตามลำดับ priority:**

```
① อ่าน existing spec files ใน e2e/ → ดู selector patterns ที่ project ใช้
   - คัดลอก login helper, API setup patterns
   - ดู selector conventions: getByRole, getByText, locator("#id")

② อ่าน frontend components → src/app/(app)/{module}/
   - หา data-testid, role, aria-label, className ใน JSX
   - ดู button labels, form field names, table structure

③ อ่าน Zod schemas / validation → ชื่อ fields ใน schema = ชื่อ fields ใน form

④ อ่าน API hooks → src/hooks/use-{module}.ts
   - ดู endpoint URLs, payload structure
   - ใช้สำหรับ API-first test setup

⑤ ดู POM (Page Object Model) files ถ้ามี → reuse selectors

⑥ ถ้าต้องการ selectors ใหม่ที่หาจาก code ไม่ได้ → แนะนำ user รัน:
   npx playwright codegen http://localhost:3000/{page}
   แล้วส่ง selectors กลับมาให้ agent
```

**สิ่งที่ต้องได้จาก code analysis:**
- Status badge selectors
- Action button selectors (submit, approve, ship, cancel)
- Form field selectors
- Error message selectors
- Success message selectors

**Reuse existing helpers:**
- ก่อนเขียนใหม่ ตรวจ existing helpers (login, API setup) ก่อนเสมอ
- ห้ามเขียน login flow ใหม่ทุกไฟล์ → import จาก shared fixture

---

### Step 4: Generate Playwright Scripts

**สำหรับแต่ละ pattern:**

#### State Machine Scenarios

1. **spec file** → `tests/TS-{MODULE}-FLOW-{NNN}.spec.ts`
   - `test.describe.serial()` wrapping all transitions
   - `test.beforeAll()` → setup initial state
   - 1 `test()` per transition
   - Invalid transitions → separate `test.describe()`

2. **POM** → `tests/pages/{module}.page.ts` (เพิ่ม status-related methods)

3. **test data** → `test-data/TS-{MODULE}-FLOW-{NNN}.json`

#### Data-Driven Scenarios

1. **spec file** → `tests/TS-{MODULE}-DDT-{NNN}.spec.ts`
   - `for (const variant of variants)` loop
   - Each variant = 1 `test()`
   - 3 assertion modes (success/error/success_or_error)

2. **variants file** → already exists from qa-create-advanced
   - ต้องมี `"$schema": "qa-variants-v1"` ที่ต้น file
   - ทุก variant ต้องมี `name` (kebab-case), `input`, `expected.result`
   - ดู schema: `references/qa-variants-schema.json`

#### Network Mock Scenarios

1. **spec file** → `tests/TS-{MODULE}-MOCK-{NNN}.spec.ts`
   - 1 `test()` per mock scenario
   - `page.route()` setup before navigation
   - Request validation in route handler
   - Sequence mock with callCount

2. **POM** → reuse or extend existing

#### Serial Group Scenarios

1. **spec file** → `tests/SERIAL-{GROUP}.spec.ts`
   - `test.describe.serial()` wrapping all tests
   - `saveSharedData()` / `loadSharedData()` helpers
   - Tests ordered by `serial_order`

---

### Step 5: Run Tests — CLI Only

```bash
# State machine
npx playwright test tests/TS-ORDER-FLOW --reporter=json,list

# Data-driven
npx playwright test tests/TS-PRODUCT-DDT --reporter=json,list

# Network mock
npx playwright test tests/TS-CART-MOCK --reporter=json,list

# Serial group
npx playwright test tests/SERIAL-ORDER-LIFECYCLE --reporter=json,list

# Dry run (--list only)
npx playwright test tests/TS-ORDER --list
```

---

### Step 6: Parse Results + Update Tracker

```json
{
  "id": "TS-ORDER-FLOW-001",
  "status": "passed",
  "test_script": "tests/TS-ORDER-FLOW-001.spec.ts",
  "last_run_status": "passed",
  "runs": [{
    "run_number": 1,
    "status": "passed",
    "duration_ms": 12500,
    "steps_passed": 3,
    "steps_total": 3,
    "timestamp": "2026-04-02T10:30:00Z"
  }]
}
```

---

### Step 7: Update Progress Log

```markdown
---

## QA Advanced Session N
**Date**: TIMESTAMP
**Type**: Advanced Script Generation + Test
**Module**: {MODULE}
**Patterns**: state-machine, data-driven, network-mock, serial-group

### สิ่งที่ทำ:
- ✅ State Machine: TS-ORDER-FLOW-001 (3 transitions, all passed)
- ✅ Data-Driven: TS-PRODUCT-DDT-001 (8 variants, 7 passed)
- ❌ Network Mock: TS-CART-MOCK-001 (timeout test failed)
- ✅ Serial Group: SERIAL-ORDER-LIFECYCLE (3 tests, all passed)

### Failed:
- TS-CART-MOCK-001 variant 'timeout': UI doesn't show timeout message

### Next:
- /qa-continue-advanced → next module
- Fix timeout handling → /qa-retest

---
```

---

### Step 8: Commit

```bash
git add tests/ test-data/ qa-tracker.json .agent/qa-progress.md
git commit -m "qa-advanced(TS-{MODULE}): generate scripts + test — X/N passed"
```

---

## Output

```
✅ QA Continue Advanced — Module {MODULE} Complete!

📋 Module: {MODULE}
🧪 Scripts Generated: N

📊 Results by Pattern:
│ Pattern        │ Scenarios │ Passed │ Failed │
│ State Machine  │     4     │   4    │   0    │
│ Data-Driven    │     2     │   2    │   0    │
│ Network Mock   │     3     │   2    │   1    │
│ Serial Group   │     3     │   3    │   0    │

❌ Failed:
└── TS-CART-MOCK-001 variant 'timeout': Expected timeout message

🔜 Next:
   /qa-continue-advanced              — next module
   /qa-retest TS-CART-MOCK-001        — fix + retest
```

> This command responds in Thai (ภาษาไทย)
