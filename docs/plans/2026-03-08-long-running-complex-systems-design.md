# Long-Running v2.0.0 — Complex Systems Support Design

> **Date**: 2026-03-08
> **Status**: Approved
> **Plugin**: long-running
> **Schema**: feature_list.json v1.10.0 → v2.0.0

## Problem Statement

long-running plugin ปัจจุบัน (v1.10.0) รองรับ feature tracking แบบ flat list — แต่ละ feature เป็นอิสระ เชื่อมกันแค่ `dependencies: [id]` ทำให้:

1. **ไม่มี Flow/User Journey grouping** — features ที่อยู่ใน checkout flow เดียวกัน (Cart → Shipping → Payment → Confirm) ไม่รู้จักกัน
2. **ไม่มี State Contract** — ไม่รู้ว่า feature ไหน produce/consume shared state อะไร agent ไม่รู้ว่าต้อง implement state management แบบไหน
3. **ไม่มี Component Requirements enforcement** — `component_usage` เป็นแค่ tracking ไม่บังคับว่า feature ต้องมี component ไหนก่อน
4. **Agent ขาด big picture** — เมื่อ `/continue` agent รู้แค่ "Feature #5 ถัดไป" ไม่รู้ว่า Feature #5 อยู่ใน flow ไหน ต้อง handle error อะไร ต้องใช้ state จากไหน

## Design Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Architecture | Flows as First-Class Entity | Flow ข้าม epics ได้, agent อ่าน flows[] ได้ทันที |
| State detail level | Fields-level contracts | Agent สร้าง interface/type definition ได้เลย |
| Component handling | requires_components + features แยก | ทั้ง validation และ traceability |
| Flow metadata | Entry/exit conditions + error paths | Agent handle edge cases ได้ครบ |
| Schema version | v2.0.0 (major bump) | เปลี่ยนวิธีคิดของ schema |
| Scope | E-commerce wizard + Back-office CRUD | ทั้ง sequential flows และ interconnected pages |

---

## 1. State Contracts

State contracts เป็นที่เดียวที่กำหนด "รูปร่าง" ของ shared state — features แค่อ้างอิงด้วยชื่อ

### Schema

```json
{
  "state_contracts": {
    "CartState": {
      "description": "สถานะตะกร้าสินค้า ใช้ตลอด checkout flow",
      "fields": {
        "items": { "type": "CartItem[]", "description": "รายการสินค้า" },
        "total": { "type": "number", "description": "ยอดรวม" },
        "coupon": { "type": "string?", "description": "รหัสคูปอง (optional)" }
      },
      "persistence": "session",
      "produced_by": [3],
      "consumed_by": [4, 5, 6]
    },
    "AuthState": {
      "description": "สถานะ authentication ใช้ทุกหน้าที่ต้อง login",
      "fields": {
        "user_id": { "type": "number", "description": "ID ผู้ใช้" },
        "role": { "type": "string", "description": "สิทธิ์ผู้ใช้" },
        "token": { "type": "string", "description": "JWT token" }
      },
      "persistence": "localStorage",
      "produced_by": [1],
      "consumed_by": [3, 4, 5, 6, 7, 8]
    }
  }
}
```

### Field Definitions

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | อธิบายว่า state นี้คืออะไร |
| `fields` | object | key-value ของ field name → `{ type, description }` |
| `fields[].type` | string | TypeScript-style type (e.g., `string`, `number`, `CartItem[]`, `string?`) |
| `persistence` | enum | `session` \| `localStorage` \| `url` \| `memory` |
| `produced_by` | number[] | Feature IDs ที่สร้าง state นี้ (auto-sync จาก features) |
| `consumed_by` | number[] | Feature IDs ที่ใช้ state นี้ (auto-sync จาก features) |

### Persistence Types

| Type | ใช้เมื่อ | ตัวอย่าง |
|------|---------|---------|
| `session` | หายเมื่อปิด browser | CartState, CheckoutState |
| `localStorage` | ถาวรจนกว่า logout | AuthState, UserPreferences |
| `url` | อยู่ใน query params | FilterState, SearchState |
| `memory` | in-memory only (component state) | FormDirtyState, ModalState |

---

## 2. Flows — User Journey Grouping

### Schema

```json
{
  "flows": [
    {
      "id": "checkout",
      "name": "Checkout Flow",
      "description": "กระบวนการสั่งซื้อตั้งแต่ตะกร้าถึงยืนยัน",
      "type": "wizard",
      "steps": [
        { "order": 1, "feature_id": 3, "label": "Cart Review" },
        { "order": 2, "feature_id": 4, "label": "Shipping Info" },
        { "order": 3, "feature_id": 5, "label": "Payment" },
        { "order": 4, "feature_id": 6, "label": "Confirmation" }
      ],
      "entry_conditions": {
        "required_state": ["CartState"],
        "description": "ต้องมีสินค้าในตะกร้าอย่างน้อย 1 ชิ้น"
      },
      "exit_conditions": {
        "produced_state": ["OrderState"],
        "description": "สร้าง Order สำเร็จ พร้อม order_id"
      },
      "error_paths": [
        {
          "from_step": 3,
          "condition": "payment_failed",
          "action": "retry_or_back",
          "description": "ชำระเงินไม่สำเร็จ → กลับหน้า Payment หรือเปลี่ยนวิธีชำระ"
        },
        {
          "from_step": 2,
          "condition": "address_invalid",
          "action": "stay",
          "description": "ที่อยู่ไม่ถูกต้อง → แสดง validation error อยู่หน้าเดิม"
        }
      ],
      "cancel_path": {
        "action": "back_to_cart",
        "description": "ยกเลิก → กลับไปหน้า Cart"
      }
    }
  ]
}
```

### Flow Types

| Type | Description | ตัวอย่าง |
|------|-------------|---------|
| `wizard` | Sequential steps ต้องทำตามลำดับ | Checkout, Registration, Onboarding |
| `crud-group` | CRUD pages ที่แชร์ context | User Management, Product Management |
| `parallel` | หลายหน้าทำงานพร้อมกัน | Dashboard widgets, Multi-tab editor |

### Flow Field Definitions

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `name` | string | ชื่อ flow |
| `description` | string | อธิบาย flow |
| `type` | enum | `wizard` \| `crud-group` \| `parallel` |
| `steps[]` | array | ลำดับ features ใน flow |
| `steps[].order` | number | ลำดับ step |
| `steps[].feature_id` | number | อ้างอิง feature |
| `steps[].label` | string | ชื่อ step (แสดงใน progress) |
| `entry_conditions` | object | เงื่อนไขก่อนเข้า flow |
| `entry_conditions.required_state` | string[] | ชื่อ state_contracts ที่ต้องมี |
| `exit_conditions` | object | ผลลัพธ์เมื่อจบ flow |
| `exit_conditions.produced_state` | string[] | ชื่อ state_contracts ที่สร้าง |
| `error_paths[]` | array | error handling per step |
| `error_paths[].from_step` | number | step order ที่เกิด error |
| `error_paths[].condition` | string | ชื่อเงื่อนไข error |
| `error_paths[].action` | enum | `retry_or_back` \| `stay` \| `redirect` \| `abort` |
| `cancel_path` | object \| null | cancel behavior (null = ไม่มี cancel) |

---

## 3. Feature Schema Changes

เพิ่ม 4 fields ใหม่ใน feature:

```json
{
  "id": 5,
  "epic": "checkout",
  "flow_id": "checkout",
  "description": "Payment Page - ชำระเงิน",

  "state_produces": ["PaymentResult"],
  "state_consumes": ["CartState", "ShippingState", "AuthState"],
  "requires_components": ["AuthGuard", "StepIndicator", "PriceDisplay"],

  "dependencies": [4],
  "...": "(...fields เดิมทั้งหมดคงเดิม)"
}
```

### New Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `flow_id` | string \| null | `null` | Primary flow ที่ feature อยู่ (อ้าง `flows[].id`) |
| `state_produces` | string[] | `[]` | ชื่อ state_contracts ที่ feature นี้สร้าง |
| `state_consumes` | string[] | `[]` | ชื่อ state_contracts ที่ feature นี้ต้องใช้ |
| `requires_components` | string[] | `[]` | มีอยู่แล้ว — ใช้เป็น enforcement (ไม่ใช่แค่ tracking) |

### Validation Rules

```
1. state_consumes check:
   ถ้า feature มี state_consumes: ["CartState"]
   → ตรวจว่า features ที่ produce "CartState" มี passes: true แล้ว
   → ถ้ายังไม่ pass → warning: "CartState ยังไม่ถูกสร้าง"

2. requires_components check:
   ถ้า feature มี requires_components: ["AuthGuard"]
   → ตรวจว่า "AuthGuard" อยู่ใน component_usage.shared_components
   → หรือมี feature ที่สร้าง AuthGuard และ passes: true แล้ว
   → ถ้ายังไม่มี → warn: "AuthGuard ยังไม่ถูกสร้าง — ทำ component ก่อน"

3. flow_id check:
   ถ้า feature มี flow_id: "checkout"
   → ตรวจว่า "checkout" อยู่ใน flows[]
   → อ่าน flow.entry_conditions, error_paths ก่อนเริ่ม implement
```

---

## 4. Agent Behavior Changes

### `/continue` — Enhanced Workflow

```
Step 0: ตรวจสอบ Design References (เดิม)
Step 0.5: Read Flow Context (NEW)
  ├── อ่าน flows[] ทั้งหมด → เข้าใจ user journeys
  ├── อ่าน state_contracts → รู้ว่ามี shared state อะไรบ้าง
  ├── ตรวจสอบ flow progress → flow ไหนเสร็จกี่ %
  └── แสดง Flow Summary ก่อนเลือก feature
Step 1: Get Context (เดิม)
Step 2: Verify Environment (เดิม)
Step 3: Select Feature (enhanced)
  ├── ตรวจ state_consumes → state ที่ต้องใช้ produce แล้วหรือยัง
  ├── ตรวจ requires_components → components สร้างแล้วหรือยัง
  └── ถ้า blocked → เลือก feature อื่น หรือสร้าง component ก่อน
Step 4: Implement (enhanced)
  ├── ถ้ามี flow_id → อ่าน entry/exit conditions
  ├── ถ้ามี state_consumes → import/read state ก่อนใช้
  ├── ถ้ามี state_produces → implement state creation + persistence
  └── ถ้ามี error_paths ใน flow → implement error handling ตาม spec
Step 5-8: (เดิม)
```

### `/init` — Enhanced Workflow

```
Step 3.5: Detect Flows (NEW)
  ├── ถ้ามี design doc → อ่าน Flow Diagrams → สร้าง flows[]
  ├── ถ้ามี mockups → ดู related_pages → จัดกลุ่มเป็น flows
  ├── ตรวจจับ wizard patterns (sequential pages)
  ├── ตรวจจับ crud-group patterns (list + form + detail)
  └── ถ้าไม่ชัด → ถาม user

Step 3.6: Define State Contracts (NEW)
  ├── วิเคราะห์ flows → หา shared state ระหว่าง steps
  ├── สร้าง state_contracts จาก entity fields ใน design doc
  └── กำหนด persistence type ตาม use case

Step 3.7: Identify Shared Components (NEW)
  ├── ดู mockups → หา components ที่ใช้ซ้ำหลายหน้า
  ├── สร้าง features แยกสำหรับ shared components
  └── เพิ่ม requires_components ใน features ที่ต้องใช้
```

### `/status` — Flow Progress Output

```
📊 Flow Progress:
  🛒 Checkout Flow (wizard): 1/4 steps ✅
     ├── ✅ Cart Review (Feature #3)
     ├── 🔲 Shipping Info (Feature #4) ← NEXT
     ├── 🔲 Payment (Feature #5)
     └── 🔲 Confirmation (Feature #6)
     State: CartState ✅ → ShippingState ❌ → PaymentResult ❌

  👤 User Management (crud-group): 0/3 steps
     ├── 🔲 User List (Feature #10)
     ├── 🔲 User Form (Feature #11)
     └── 🔲 User Detail (Feature #12)
     Requires: AuthState ✅
```

---

## 5. Files to Modify

| File | Change |
|------|--------|
| `templates/feature_list.json` | เพิ่ม `flows[]`, `state_contracts{}`, feature fields ใหม่, schema v2.0.0 |
| `commands/continue.md` | เพิ่ม Step 0.5, enhance Step 3+4, Flow Summary output |
| `commands/init.md` | เพิ่ม Step 3.5-3.7 |
| `commands/status.md` | เพิ่ม Flow Progress section |
| `commands/validate-coverage.md` | เพิ่ม flow coverage + state contract validation |
| `commands/generate-features-from-design.md` | เพิ่ม flow detection จาก Flow Diagrams |
| `commands/migrate.md` | เพิ่ม migration path v1.10.0 → v2.0.0 |
| `references/feature-patterns.md` | เพิ่ม Flow Patterns |
| `references/coding-agent-guide.md` | เพิ่มกฎ: อ่าน flow context ก่อนเริ่มงาน |
| `SKILL.md` | เพิ่ม flows/state docs, bump version |
| `README.md` | เพิ่ม changelog v2.0.0 |
| `plugin.json` | bump version to 2.0.0 |

### Out of Scope

- `system-design-doc` plugin — ไม่แก้ (ใช้ Flow Diagrams ที่มีอยู่แล้ว)
- `ui-mockup` plugin — ไม่แก้ (mockup_list.json มี `related_pages` อยู่แล้ว)

---

## 6. Schema Migration (v1.10.0 → v2.0.0)

```
1. เพิ่ม flows: []
2. เพิ่ม state_contracts: {}
3. เพิ่ม flow_id: null ให้ทุก feature
4. เพิ่ม state_produces: [] ให้ทุก feature
5. เพิ่ม state_consumes: [] ให้ทุก feature
6. requires_components: [] มีอยู่แล้ว — ไม่ต้องเพิ่ม
7. bump schema_version: "2.0.0"
8. metadata.compatible_with.design_doc_list_schema: ">=2.1.0"
9. metadata.compatible_with.mockup_list_schema: ">=1.7.0"
```

Backward compatible — projects เก่าที่ไม่ใช้ flows ทำงานได้ปกติ (flows เป็น empty array, state_contracts เป็น empty object)
