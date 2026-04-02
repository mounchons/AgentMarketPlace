# QA Advanced Plugin — Design Spec

**Date**: 2026-04-02
**Status**: Approved
**Plugin**: `plugins/qa-ui-test/skills/qa-advanced`
**Scope**: เพิ่ม advanced testing patterns (state-machine, data-driven, network-mock, serial-group) เป็น skill + commands แยกจาก qa-ui-test เดิม

---

## 1. Goals

- รองรับหน้าที่มี complex logic (conditional flows, state transitions, branching)
- รองรับ data-driven testing (parameterized tests จาก variants)
- รองรับ network mocking (API error simulation, request validation, retry sequences)
- รองรับ test orchestration (serial groups, shared data across tests)
- Backward compatible กับ qa-tracker.json เดิม
- ใช้ Playwright CLI (`npx playwright test`) เท่านั้น — ห้ามใช้ MCP tools สำหรับรัน test

---

## 2. Plugin Structure

```
plugins/qa-ui-test/
├── skills/
│   ├── qa-ui-test/              ← เดิม ไม่แตะ
│   │   ├── references/
│   │   │   ├── scenario-template.md
│   │   │   └── playwright-guide.md
│   │   ├── templates/
│   │   │   └── qa-tracker.json
│   │   └── scripts/
│   │       ├── setup.js
│   │       └── generate-summary.js
│   │
│   └── qa-advanced/             ← NEW skill
│       ├── SKILL.md
│       └── references/
│           ├── advanced-patterns.md       ← overview + decision guide
│           ├── state-machine-guide.md     ← flow notation, transitions, generation
│           ├── data-driven-guide.md       ← variants, parameterized tests
│           └── network-mock-guide.md      ← page.route(), sequence, validation
│
├── commands/
│   ├── qa-create-scenario.md     ← เดิม ไม่แตะ
│   ├── qa-continue.md            ← เดิม ไม่แตะ
│   ├── qa-create-advanced.md     ← NEW: สร้าง advanced scenarios
│   ├── qa-continue-advanced.md   ← NEW: generate + run advanced scripts
│   └── qa-advanced-howto.md      ← NEW: วิธีใช้ + command reference
│
└── templates/
    └── qa-tracker.json           ← แก้: เพิ่ม optional fields (backward compatible)
```

**Design principle**: qa-ui-test เดิมไม่แตะเลย — qa-advanced เป็น skill + commands แยกที่ต่อยอดได้

---

## 3. qa-tracker.json Schema Extension

**Schema version**: 1.3.0 → 1.4.0 (backward compatible)

เพิ่ม optional `advanced` field ใน scenario entry:

```json
{
  "schema_version": "1.4.0",

  "scenarios": [
    {
      "id": "TS-PRODUCT-001",
      "title": "Product list view",
      "module": "PRODUCT",
      "priority": "high",
      "type": "happy-path",
      "page_type": "master-data",
      "status": "pending",
      "test_script": null,
      "runs": [],

      "advanced": {
        "flow_type": "state-machine | conditional | linear",

        "states": ["draft", "pending", "approved", "shipped"],
        "transitions": [
          {
            "from": "draft",
            "action": "submit",
            "to": "pending",
            "assertions": ["status badge = 'Pending'", "submit button hidden"],
            "trigger": "click submit button"
          }
        ],

        "data_driven": true,
        "variants_file": "test-data/TS-ORDER-FLOW.json",

        "mocks": [
          {
            "url": "**/api/orders",
            "method": "POST",
            "scenarios": [
              { "name": "success", "status": 200, "body": {"id": 1} },
              { "name": "server-error", "status": 500, "body": {"error": "Internal"} },
              { "name": "timeout", "delay_ms": 30000 },
              { "name": "retry-then-success", "sequence": [
                { "status": 500, "body": {"error": "Temporary"} },
                { "status": 200, "body": {"id": 2} }
              ]}
            ],
            "validate_request": {
              "required_fields": ["productId", "quantity"],
              "body_schema": "json-schema-ref"
            }
          }
        ],

        "serial_group": "ORDER-LIFECYCLE",
        "serial_order": 1,
        "depends_on_data": { "from": "TS-ORDER-001", "field": "created_order_id" }
      }
    }
  ]
}
```

**Key fields:**
- `advanced` — ทั้งก้อนเป็น optional (scenarios เดิมไม่มีก็ไม่เสีย)
- `flow_type` — `state-machine` | `conditional` | `linear` (default)
- `states` + `transitions` — state machine notation (from→action→to)
- `data_driven` + `variants_file` — ชี้ไปที่ test-data JSON ที่มี `variants[]`
- `mocks` — network mock definitions พร้อม sequence + request validation
- `serial_group` + `serial_order` — จัดลำดับ test execution
- `depends_on_data` — รับ data จาก test อื่นผ่าน shared JSON

---

## 4. Commands

### 4.1 `/qa-create-advanced`

สร้าง advanced scenarios — 2 โหมด:

**Mode 1: `--enhance`** — ต่อยอดจาก qa-tracker.json เดิม
- อ่าน scenarios เดิม → วิเคราะห์จุดที่ควรเพิ่ม
- แสดง recommendations ให้เลือก
- เพิ่ม advanced scenarios ใน qa-tracker.json (ไม่แก้เดิม)

**Mode 2: `--auto`** — scan codebase สร้างใหม่ตั้งแต่ต้น
- Dispatch 3 Explore agents (parallel) วิเคราะห์ codebase
- สร้าง scenarios พร้อม advanced fields ตั้งแต่แรก

**Flags:**

| Flag | คำอธิบาย |
|------|---------|
| `--enhance` | ต่อยอดจาก qa-tracker.json เดิม |
| `--auto` | scan codebase สร้างใหม่ทั้งหมด |
| `--module <MODULE>` | ระบุ module (เช่น ORDER, PRODUCT) |
| `--flow-only` | สร้างเฉพาะ state-machine scenarios |
| `--mock-only` | สร้างเฉพาะ network mock scenarios |
| `--data-driven-only` | สร้างเฉพาะ data-driven scenarios |
| `--brainstorm-agents` | ใช้ multi-agent brainstorm (ครบถ้วนกว่า) |

**Combinations:**
- `--enhance + --module` → ต่อยอดเฉพาะ module นั้น
- `--auto + --module` → scan เฉพาะ module นั้น
- `--enhance + --flow-only` → แนะนำเฉพาะ state-machine patterns
- `--auto + --brainstorm-agents` → scan + ใช้ 5 agents ช่วยคิด

### 4.2 `/qa-continue-advanced`

Generate Playwright scripts จาก advanced scenarios + run ด้วย CLI

**Flags:**

| Flag | คำอธิบาย |
|------|---------|
| `--module <MODULE>` | ทำเฉพาะ module |
| `--flow <FLOW_TYPE>` | ทำเฉพาะ flow type (state-machine/data-driven/mock) |
| `--serial-group <GROUP>` | ทำเฉพาะ serial group |
| `--dry-run` | generate scripts อย่างเดียว ไม่รัน test |
| `--parallel` | รันด้วย subagents (เร็วกว่า) |

**Execution rule:**
- ใช้ `npx playwright test <spec-file> --reporter=json,list` เท่านั้น
- ห้ามใช้ Playwright MCP tools สำหรับรัน test
- MCP ใช้ได้เฉพาะ: สำรวจหน้าจริงเพื่อหา selectors ก่อนสร้าง script (ใน qa-create-advanced เท่านั้น)

### 4.3 `/qa-advanced-howto`

สอนวิธีใช้งาน qa-advanced แบบ interactive

**Topics:**

| Topic | คำอธิบาย |
|-------|---------|
| (ไม่ระบุ) | แสดง overview + command reference ทั้งหมดครบทุก flags |
| `state-machine` | สอน state machine pattern ทีละขั้น |
| `data-driven` | สอน data-driven testing + variants |
| `mock` | สอน network mocking + sequence + validation |
| `serial` | สอน test orchestration + serial groups |
| `enhance` | สอนวิธีต่อยอดจาก qa-ui-test |
| `examples` | แสดงตัวอย่างจริงทุก pattern |

**Content of `/qa-advanced-howto` (no topic):**
1. Decision tree: มี qa-tracker.json แล้วหรือยัง → แนะนำ command
2. Overview 4 patterns พร้อมลิงก์ไป topic
3. Command reference ครบทุกคำสั่ง ทุก flags ทุก combinations พร้อมตัวอย่าง

---

## 5. Script Generation Patterns

### 5.1 State Machine → `test.describe.serial()`

- scenarios ที่มี `flow_type: "state-machine"` → generate spec ที่ใช้ `test.describe.serial()`
- `test.beforeAll()` — setup initial state + save shared data
- แต่ละ test = 1 transition (from→action→to)
- assertions มาจาก `transitions[].assertions`
- screenshots ทุก before/after transition
- `test.afterAll()` — cleanup
- invalid transitions → generate test ที่ expect error/rejection

### 5.2 Data-Driven → `for...of` loop variants

- scenarios ที่มี `data_driven: true` → อ่าน `variants_file`
- `variants[]` ใน test-data JSON → generate `for (const variant of variants)` loop
- แต่ละ variant = 1 test ใน report
- screenshot แยกโฟลเดอร์ per variant
- 3 assertion modes: `success`, `error`, `success_or_error` (security tests)

**test-data JSON format with variants:**
```json
{
  "fixtures": { "validUser": { "email": "admin@test.com", "password": "Admin@123" } },
  "variants": [
    { "name": "valid-name", "input": { "name": "Test", "price": "100" },
      "expected": { "result": "success" } },
    { "name": "empty-name", "input": { "name": "", "price": "100" },
      "expected": { "result": "error", "message": "Name is required" } },
    { "name": "xss-name", "input": { "name": "<script>alert('xss')</script>", "price": "100" },
      "expected": { "result": "success_or_error", "must_not": "script executed" } }
  ]
}
```

### 5.3 Network Mock → `page.route()`

- scenarios ที่มี `mocks[]` → generate test per mock scenario
- `validate_request` → `expect(body).toHaveProperty()` ใน route handler
- `sequence[]` → ใช้ `callCount` variable track จำนวนเรียก
- `delay_ms` → `setTimeout` ใน route handler
- ตรวจว่า UI ไม่โชว์ raw error message ให้ user เห็น

### 5.4 Serial Group → shared data via JSON file

- scenarios ที่มี `serial_group` เดียวกัน → รวมเป็น 1 spec file: `tests/SERIAL-{GROUP}.spec.ts`
- ใช้ `test.describe.serial()` บังคับลำดับ
- `depends_on_data` → ใช้ shared JSON file (`test-results/{GROUP}/shared-data.json`) ส่งข้อมูลระหว่าง tests
- เรียงตาม `serial_order`
- `saveSharedData()` / `loadSharedData()` helper functions ใน generated code

### Execution — Playwright CLI

```bash
# รันทั้ง module
npx playwright test tests/TS-ORDER --reporter=json,list

# รันเฉพาะ state-machine
npx playwright test tests/TS-ORDER-FLOW --reporter=json,list

# รันเฉพาะ serial group
npx playwright test tests/SERIAL-ORDER-LIFECYCLE --reporter=json,list

# รันเฉพาะ mock scenarios
npx playwright test tests/TS-CART-MOCK --reporter=json,list

# Dry run: ดู test list ก่อนรัน
npx playwright test tests/TS-ORDER --list
```

---

## 6. Agent Detection Logic

### `/qa-create-advanced --auto` dispatches 3 Explore agents (parallel):

### Agent 1: State Machine Detector

หา:
- Enum ที่เป็น status/state (C#, TS, Java)
- Status field ใน Entity/Model
- Transition logic ใน Service/Controller (if/switch)
- Guard conditions (เงื่อนไขที่ต้องผ่านก่อน transition)
- UI status indicators (badge, status column)

Output: `state_machines[]` พร้อม states, transitions_found, invalid_transitions_found, ui_indicators

### Agent 2: API Endpoint Detector

หา:
- Backend API endpoints (HttpPost/Put/Delete, router, route.ts)
- Frontend API calls (fetch, axios, $.ajax)
- Response patterns (Ok, BadRequest, NotFound, 500)
- Error handling ใน frontend (try/catch, interceptors)
- Request/Response types (DTO classes, interfaces)

Output: `api_endpoints[]` พร้อม url, method, request_type, response_codes, error_handling_in_frontend

### Agent 3: Validation & Business Logic Detector

หา:
- Validation rules ทุกชั้น (model attributes, FluentValidation, service-level, frontend)
- Computed fields / calculations (totals, discounts, VAT)
- Business branching (if/else ที่มีผลต่อ UI/flow)
- Cross-field validation
- Unique constraints

Output: `business_logic[]` พร้อม rules, testable_variants, conditions, branches

### Main Agent: Pattern Matching

| ถ้าพบ | สร้าง |
|-------|-------|
| state_machines[].entity | State Machine scenarios (happy path + invalid + guard) |
| api_endpoints[] + response_codes > 1 | Network Mock scenarios (per response code + timeout + retry) |
| business_logic[].testable_variants | Data-Driven scenarios (variants จาก detected rules) |
| business_logic[].type == "conditional" | Conditional scenarios (per branch) |
| CRUD scenarios ของ entity เดียวกัน | Serial Group (create→edit→delete) |

### `--enhance` mode

- อ่าน qa-tracker.json เดิม → วิเคราะห์:
  - negative cases ซ้ำๆ → แนะนำรวมเป็น data-driven
  - CRUD ของ entity เดียว → แนะนำจัด serial group
  - entity มี status field แต่ไม่มี flow test → แนะนำ state-machine
  - หน้ามี API call แต่ไม่มี error test → แนะนำ mock
- แสดง recommendations ให้ผู้ใช้เลือก
- scenarios ที่ merge → เดิมตั้ง `status: "deprecated"`, สร้างใหม่แทน

---

## 7. Files to Create

| # | File | Type | Description |
|---|------|------|-------------|
| 1 | `skills/qa-advanced/SKILL.md` | skill | Skill metadata + description |
| 2 | `skills/qa-advanced/references/advanced-patterns.md` | reference | Overview + decision guide (เมื่อไหร่ใช้ pattern ไหน) |
| 3 | `skills/qa-advanced/references/state-machine-guide.md` | reference | State machine notation + generation patterns |
| 4 | `skills/qa-advanced/references/data-driven-guide.md` | reference | Variants format + test.each/loop generation |
| 5 | `skills/qa-advanced/references/network-mock-guide.md` | reference | page.route() patterns + sequence + request validation |
| 6 | `commands/qa-create-advanced.md` | command | สร้าง advanced scenarios (--enhance / --auto) |
| 7 | `commands/qa-continue-advanced.md` | command | Generate scripts + run tests |
| 8 | `commands/qa-advanced-howto.md` | command | วิธีใช้ + command reference ครบทุก flags |

## 8. Files to Modify

| # | File | Change |
|---|------|--------|
| 1 | `templates/qa-tracker.json` | เพิ่ม `page_types` entry + comments for advanced fields |

## 9. Constraints

- **Backward compatible**: qa-tracker.json schema 1.3.0 scenarios ยังทำงานปกติ
- **Playwright CLI only**: ใช้ `npx playwright test` สำหรับรัน — ห้ามใช้ MCP tools
- **MCP for exploration only**: MCP ใช้ได้เฉพาะสำรวจหน้าจริงหา selectors ใน qa-create-advanced
- **ไม่แตะ qa-ui-test เดิม**: skill, commands, references เดิมไม่เปลี่ยน
- **Thai language**: commands output เป็นภาษาไทย, code identifiers เป็น English
