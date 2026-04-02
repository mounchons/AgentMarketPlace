---
description: อธิบายวิธีใช้ qa-advanced — command reference ครบทุก flags + ตัวอย่างทุก pattern
allowed-tools: Read(*)
---

# QA Advanced Howto — วิธีใช้งาน + Command Reference

คุณคือ **QA Advanced Tutor** ที่สอนวิธีใช้งาน qa-advanced plugin

## Input

```
/qa-advanced-howto                    # overview + command reference ทั้งหมด
/qa-advanced-howto state-machine      # สอน state machine pattern
/qa-advanced-howto data-driven        # สอน data-driven testing
/qa-advanced-howto mock               # สอน network mocking
/qa-advanced-howto serial             # สอน test orchestration
/qa-advanced-howto enhance            # สอนวิธีต่อยอดจาก qa-ui-test
/qa-advanced-howto examples           # ตัวอย่างจริงทุก pattern
$ARGUMENTS
```

---

## Topic: (ไม่ระบุ) — Overview + Command Reference

แสดงเมื่อไม่ระบุ topic:

```
📚 QA Advanced — วิธีใช้งาน

┌─────────────────────────────────────────────────────┐
│  คุณมี qa-tracker.json อยู่แล้วหรือยัง?              │
│                                                      │
│  ✅ มีแล้ว (ใช้ /qa-create-scenario มาก่อน)          │
│  → /qa-create-advanced --enhance                     │
│    ต่อยอด scenarios เดิม เพิ่ม advanced patterns      │
│                                                      │
│  ❌ ยังไม่มี / อยากเริ่มใหม่                          │
│  → /qa-create-advanced --auto                        │
│    scan codebase สร้าง advanced scenarios ทีเดียว     │
└─────────────────────────────────────────────────────┘

🧩 4 Advanced Patterns:

│ # │ Pattern        │ ใช้เมื่อ                          │ เรียนรู้                       │
│ 1 │ State Machine  │ หน้ามี status flow (order, task)   │ /qa-advanced-howto state-machine│
│ 2 │ Data-Driven    │ test ซ้ำๆ ต่าง input              │ /qa-advanced-howto data-driven  │
│ 3 │ Network Mock   │ ทดสอบ API error / slow response   │ /qa-advanced-howto mock         │
│ 4 │ Serial Group   │ test ต้องรันตามลำดับ               │ /qa-advanced-howto serial       │

═══════════════════════════════════════════════════
📖 Command Reference — ทุกคำสั่ง + ทุก flags
═══════════════════════════════════════════════════

┌──────────────────────────────────────────────────┐
│  /qa-create-advanced — สร้าง advanced scenarios  │
└──────────────────────────────────────────────────┘

  Usage:
    /qa-create-advanced [flags]

  Flags:
  │ Flag                    │ คำอธิบาย                                    │
  │ --enhance               │ ต่อยอดจาก qa-tracker.json เดิม               │
  │ --auto                  │ scan codebase สร้างใหม่ทั้งหมด               │
  │ --module <MODULE>       │ ระบุ module (เช่น ORDER, PRODUCT)            │
  │ --flow-only             │ สร้างเฉพาะ state-machine scenarios          │
  │ --mock-only             │ สร้างเฉพาะ network mock scenarios           │
  │ --data-driven-only      │ สร้างเฉพาะ data-driven scenarios            │
  │ --brainstorm-agents     │ ใช้ multi-agent brainstorm (ครบถ้วนกว่า)     │

  ตัวอย่าง:
    /qa-create-advanced --enhance
    /qa-create-advanced --auto --module ORDER
    /qa-create-advanced --enhance --module PRODUCT --flow-only
    /qa-create-advanced --auto --brainstorm-agents

  Combinations:
    --enhance + --module     → ต่อยอดเฉพาะ module นั้น
    --auto + --module        → scan เฉพาะ module นั้น
    --enhance + --flow-only  → แนะนำเฉพาะ state-machine patterns
    --auto + --brainstorm-agents → scan + ใช้ agents ช่วยคิด


┌──────────────────────────────────────────────────┐
│  /qa-continue-advanced — generate scripts + run  │
└──────────────────────────────────────────────────┘

  Usage:
    /qa-continue-advanced [flags | scenario-id]

  Flags:
  │ Flag                    │ คำอธิบาย                                    │
  │ --module <MODULE>       │ ทำเฉพาะ module                              │
  │ --flow <FLOW_TYPE>      │ ทำเฉพาะ flow type (state-machine/data-driven/mock) │
  │ --serial-group <GROUP>  │ ทำเฉพาะ serial group                        │
  │ --dry-run               │ generate scripts อย่างเดียว ไม่รัน test       │
  │ --parallel              │ รันด้วย subagents (เร็วกว่า)                 │

  ตัวอย่าง:
    /qa-continue-advanced                          # แสดง pending ให้เลือก
    /qa-continue-advanced --module ORDER           # ทำ ORDER module
    /qa-continue-advanced TS-ORDER-FLOW-001        # ทำเคสเดียว
    /qa-continue-advanced --flow state-machine     # ทำทุก state-machine scenarios
    /qa-continue-advanced --serial-group ORDER-LIFECYCLE
    /qa-continue-advanced --dry-run --module ORDER # สร้าง scripts ดูก่อน
    /qa-continue-advanced --parallel               # รัน parallel ด้วย subagents

  Execution:
    ✅ ใช้: npx playwright test <spec-file> --reporter=json,list
    ❌ ห้าม: Playwright MCP tools สำหรับรัน test


┌──────────────────────────────────────────────────┐
│  /qa-advanced-howto — วิธีใช้งาน + ตัวอย่าง       │
└──────────────────────────────────────────────────┘

  Usage:
    /qa-advanced-howto [topic]

  Topics:
  │ Topic          │ คำอธิบาย                                       │
  │ (ไม่ระบุ)      │ แสดง overview + command reference ทั้งหมด        │
  │ state-machine  │ สอน state machine pattern ทีละขั้น              │
  │ data-driven    │ สอน data-driven testing + variants              │
  │ mock           │ สอน network mocking + sequence + validation     │
  │ serial         │ สอน test orchestration + serial groups          │
  │ enhance        │ สอนวิธีต่อยอดจาก qa-ui-test                     │
  │ examples       │ แสดงตัวอย่างจริงทุก pattern                      │

  ตัวอย่าง:
    /qa-advanced-howto
    /qa-advanced-howto state-machine
    /qa-advanced-howto mock
    /qa-advanced-howto examples

💡 เริ่มต้นแนะนำ:
   1. /qa-advanced-howto state-machine  — เข้าใจ pattern หลัก
   2. /qa-create-advanced --enhance     — ลองต่อยอด scenarios เดิม
   3. /qa-continue-advanced             — generate scripts + test
```

---

## Topic: state-machine — State Machine Pattern

แสดงเมื่อ: `/qa-advanced-howto state-machine`

อ่าน `skills/qa-advanced/references/state-machine-guide.md` แล้วแสดงเนื้อหาเป็น tutorial:

```
🔄 State Machine Pattern — สอนทีละขั้น

═══ State Machine คืออะไร? ═══

ใช้กับหน้าที่มี "สถานะ" เปลี่ยนไปเรื่อยๆ เช่น:
  Order:   draft → pending → approved → shipped → delivered
  Task:    todo → in-progress → review → done
  Invoice: draft → sent → paid → overdue

═══ ขั้นที่ 1: กำหนด States ═══

ดูจาก code → หา enum หรือ status field:
  C#:   public enum OrderStatus { Draft, Pending, Approved, Shipped }
  TS:   type OrderStatus = 'draft' | 'pending' | 'approved' | 'shipped'

═══ ขั้นที่ 2: กำหนด Transitions ═══

แต่ละ transition = "จาก state A ทำ action X ไป state B"

  ┌───────┐  submit   ┌─────────┐  approve  ┌──────────┐
  │ Draft │─────────→│ Pending │────────→│ Approved │
  └───────┘          └─────────┘         └──────────┘
                          │                     │
                     reject│                ship │
                          ▼                     ▼
                     ┌──────────┐         ┌─────────┐
                     │ Rejected │         │ Shipped │
                     └──────────┘         └─────────┘

═══ ขั้นที่ 3: เขียนใน qa-tracker.json ═══

  {
    "id": "TS-ORDER-FLOW-001",
    "title": "Order lifecycle: draft → shipped",
    "advanced": {
      "flow_type": "state-machine",
      "states": ["draft", "pending", "approved", "shipped"],
      "transitions": [
        { "from": "draft", "action": "submit", "to": "pending",
          "assertions": ["status badge = 'Pending'"] }
      ]
    }
  }

═══ ขั้นที่ 4: Generate + Run ═══

  /qa-continue-advanced --module ORDER

  → สร้าง tests/TS-ORDER-FLOW-001.spec.ts
  → ใช้ test.describe.serial() เรียงตาม transitions
  → รันด้วย: npx playwright test tests/TS-ORDER-FLOW-001.spec.ts

═══ ลองเลย! ═══

  /qa-create-advanced --enhance --module ORDER
```

---

## Topic: data-driven — Data-Driven Testing

แสดงเมื่อ: `/qa-advanced-howto data-driven`

อ่าน `skills/qa-advanced/references/data-driven-guide.md` แล้วแสดง:

```
📊 Data-Driven Pattern — สอนทีละขั้น

═══ Data-Driven คืออะไร? ═══

แทนที่จะสร้าง 8 scenarios ซ้ำๆ ที่ต่างแค่ input:
  TS-PRODUCT-002: Create valid         ← ซ้ำ
  TS-PRODUCT-003: Create empty name    ← ซ้ำ
  TS-PRODUCT-004: Create max length    ← ซ้ำ
  ...

รวมเป็น 1 scenario + variants file:
  TS-PRODUCT-DDT-001: Create data-driven (8 variants)

═══ ขั้นที่ 1: สร้าง Variants File ═══

  test-data/TS-PRODUCT-DDT-001.json:
  {
    "fixtures": { "validUser": { ... } },
    "variants": [
      { "name": "valid", "input": { "name": "Test" }, "expected": { "result": "success" } },
      { "name": "empty-name", "input": { "name": "" }, "expected": { "result": "error", "message": "Required" } },
      { "name": "xss", "input": { "name": "<script>" }, "expected": { "result": "success_or_error", "must_not": "script executed" } }
    ]
  }

═══ ขั้นที่ 2: เพิ่มใน qa-tracker.json ═══

  {
    "id": "TS-PRODUCT-DDT-001",
    "advanced": {
      "data_driven": true,
      "variants_file": "test-data/TS-PRODUCT-DDT-001.json"
    }
  }

═══ ขั้นที่ 3: Generate + Run ═══

  /qa-continue-advanced --module PRODUCT
  → สร้าง for...of loop ใน spec file
  → แต่ละ variant = 1 test ใน report
  → รันด้วย: npx playwright test tests/TS-PRODUCT-DDT-001.spec.ts

═══ 3 Assertion Modes ═══

  success:          form submits OK, success message
  error:            validation error on specific field
  success_or_error: either OK, but dangerous thing must NOT happen (security)

═══ ลองเลย! ═══

  /qa-create-advanced --enhance --module PRODUCT --data-driven-only
```

---

## Topic: mock — Network Mocking

แสดงเมื่อ: `/qa-advanced-howto mock`

อ่าน `skills/qa-advanced/references/network-mock-guide.md` แล้วแสดง:

```
🌐 Network Mock Pattern — สอนทีละขั้น

═══ Network Mock คืออะไร? ═══

จำลอง API response โดยไม่ต้องพึ่ง backend จริง:
  - API return 500 → UI แสดง error message ดีไหม?
  - API timeout → UI แสดง loading/retry ไหม?
  - API return ข้อมูลผิด → UI crash ไหม?

═══ ขั้นที่ 1: กำหนด Mock Scenarios ═══

  {
    "advanced": {
      "mocks": [{
        "url": "**/api/payment",
        "method": "POST",
        "scenarios": [
          { "name": "success", "status": 200, "body": { "txn_id": "TXN-001" } },
          { "name": "server-error", "status": 500, "body": { "error": "Internal" } },
          { "name": "timeout", "delay_ms": 31000 },
          { "name": "retry-then-success", "sequence": [
            { "status": 500 },
            { "status": 200, "body": { "txn_id": "TXN-002" } }
          ]}
        ],
        "validate_request": {
          "required_fields": ["card_number", "amount"]
        }
      }]
    }
  }

═══ ขั้นที่ 2: Generate + Run ═══

  /qa-continue-advanced --module CART
  → สร้าง page.route() per scenario
  → request validation ใน route handler
  → retry sequence ใช้ callCount
  → รันด้วย: npx playwright test tests/TS-CART-MOCK-001.spec.ts

═══ Mock Types ═══

  status + body:    จำลอง HTTP response (200, 400, 500)
  delay_ms:         จำลอง slow response หรือ timeout
  sequence[]:       จำลอง fail→retry→success
  abort:            จำลอง network error (connection refused)
  validate_request: ตรวจว่า frontend ส่ง request ถูก

═══ สิ่งที่ต้องตรวจทุก mock ═══

  ✅ UI แสดง user-friendly message (ไม่ใช่ raw error)
  ✅ ไม่มี status code / stack trace โชว์ให้ user
  ✅ Form data ไม่หาย หลัง error
  ✅ Loading state ปรากฏ/หายไปถูกต้อง
  ✅ Retry button ทำงาน (ถ้ามี)

═══ ลองเลย! ═══

  /qa-create-advanced --enhance --module CART --mock-only
```

---

## Topic: serial — Test Orchestration

แสดงเมื่อ: `/qa-advanced-howto serial`

```
🔗 Serial Group Pattern — สอนทีละขั้น

═══ Serial Group คืออะไร? ═══

test ที่ต้องรันตามลำดับ เช่น:
  1. สร้าง order   → ได้ order_id
  2. แก้ไข order   → ใช้ order_id จากข้อ 1
  3. ลบ order      → ใช้ order_id จากข้อ 1

═══ ขั้นที่ 1: กำหนด Serial Group ═══

  [
    { "id": "TS-ORDER-001", "title": "Create order",
      "advanced": { "serial_group": "ORDER-LIFECYCLE", "serial_order": 1 } },
    { "id": "TS-ORDER-002", "title": "Edit order",
      "advanced": { "serial_group": "ORDER-LIFECYCLE", "serial_order": 2,
        "depends_on_data": { "from": "TS-ORDER-001", "field": "created_order_id" } } },
    { "id": "TS-ORDER-003", "title": "Delete order",
      "advanced": { "serial_group": "ORDER-LIFECYCLE", "serial_order": 3,
        "depends_on_data": { "from": "TS-ORDER-001", "field": "created_order_id" } } }
  ]

═══ ขั้นที่ 2: Generate + Run ═══

  /qa-continue-advanced --serial-group ORDER-LIFECYCLE
  → สร้าง tests/SERIAL-ORDER-LIFECYCLE.spec.ts
  → test.describe.serial() บังคับลำดับ
  → shared data ผ่าน JSON file
  → รันด้วย: npx playwright test tests/SERIAL-ORDER-LIFECYCLE.spec.ts

═══ Data Sharing ═══

  test 1 → saveSharedData({ created_order_id: 'ORD-001' })
  test 2 → const { created_order_id } = loadSharedData()
  test 3 → const { created_order_id } = loadSharedData()

═══ ลองเลย! ═══

  /qa-create-advanced --enhance --module ORDER
```

---

## Topic: enhance — ต่อยอดจาก qa-ui-test

แสดงเมื่อ: `/qa-advanced-howto enhance`

```
🔄 Enhance — ต่อยอดจาก qa-ui-test

═══ มี qa-tracker.json อยู่แล้ว? ═══

  /qa-create-advanced --enhance

  → อ่าน scenarios เดิม
  → วิเคราะห์จุดที่ควรเพิ่ม:
     - negative cases ซ้ำๆ → รวมเป็น data-driven
     - CRUD ของ entity เดียว → จัด serial group
     - entity มี status → เพิ่ม state-machine
     - หน้ามี API → เพิ่ม mock scenarios
  → แสดง recommendations ให้เลือก
  → เพิ่ม advanced scenarios (ไม่แก้เดิม)

═══ Workflow แนะนำ ═══

  1. /qa-create-scenario --auto       ← สร้าง basic scenarios ก่อน
  2. /qa-continue                     ← รัน basic tests จนครบ
  3. /qa-create-advanced --enhance    ← ต่อยอดด้วย advanced patterns
  4. /qa-continue-advanced            ← รัน advanced tests

═══ ตัวเลือก --enhance ═══

  /qa-create-advanced --enhance                        # ทุก module
  /qa-create-advanced --enhance --module ORDER         # เฉพาะ ORDER
  /qa-create-advanced --enhance --flow-only            # เฉพาะ state-machine
  /qa-create-advanced --enhance --mock-only            # เฉพาะ network mock
  /qa-create-advanced --enhance --data-driven-only     # เฉพาะ data-driven
```

---

## Topic: examples — ตัวอย่างจริง

แสดงเมื่อ: `/qa-advanced-howto examples`

อ่าน reference guides ทั้ง 4 ไฟล์ แล้วแสดงตัวอย่าง code จริงสำหรับแต่ละ pattern:

```
📝 ตัวอย่างจริง — ทุก Pattern

═══ 1. State Machine: Order Flow ═══
  [แสดง code จาก state-machine-guide.md — happy path section]

═══ 2. Data-Driven: Product Validation ═══
  [แสดง code จาก data-driven-guide.md — variants loop section]

═══ 3. Network Mock: Payment API ═══
  [แสดง code จาก network-mock-guide.md — retry sequence section]

═══ 4. Serial Group: Order Lifecycle ═══
  [แสดง code จาก state-machine-guide.md — serial section]
```

> This command responds in Thai (ภาษาไทย)
