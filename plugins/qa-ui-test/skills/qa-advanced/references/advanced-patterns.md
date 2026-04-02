# Advanced Test Patterns — Decision Guide

เมื่อไหร่ควรใช้ pattern ไหน + วิธีเลือก

## Pattern Decision Matrix

```
┌──────────────────────────────────────────────────────────────┐
│  หน้าของคุณมีลักษณะแบบไหน?                                    │
│                                                               │
│  มี status/state flow?          → State Machine Pattern       │
│  (draft→pending→approved)        references/state-machine-guide│
│                                                               │
│  มี test ซ้ำๆ ต่างแค่ input?     → Data-Driven Pattern         │
│  (valid, invalid, boundary)      references/data-driven-guide  │
│                                                               │
│  มี API call ที่อาจ fail?        → Network Mock Pattern        │
│  (payment, external service)     references/network-mock-guide │
│                                                               │
│  มี test ที่ต้องรันตามลำดับ?     → Serial Group Pattern        │
│  (create→edit→delete)            references/state-machine-guide│
│                                                               │
│  ใช้หลาย pattern ร่วมกันได้!     → ดูตัวอย่างด้านล่าง           │
└──────────────────────────────────────────────────────────────┘
```

## Pattern Comparison

| Feature | State Machine | Data-Driven | Network Mock | Serial Group |
|---------|:------------:|:-----------:|:------------:|:------------:|
| Playwright feature | `describe.serial()` | `for...of` loop | `page.route()` | `describe.serial()` + shared JSON |
| qa-tracker field | `flow_type: "state-machine"` | `data_driven: true` | `mocks[]` | `serial_group` |
| Test count | 1 per transition | 1 per variant | 1 per mock scenario | 1 per step in group |
| Shared state | Within serial describe | None (independent) | None (independent) | Via shared JSON file |
| Use together | + Serial Group | + Network Mock | + Data-Driven | + State Machine |

## Combining Patterns

### State Machine + Network Mock

Order flow ที่ submit ผ่าน API:
```json
{
  "advanced": {
    "flow_type": "state-machine",
    "transitions": [
      { "from": "draft", "action": "submit", "to": "pending" }
    ],
    "mocks": [
      { "url": "**/api/orders/submit", "scenarios": [
        { "name": "success", "status": 200 },
        { "name": "validation-error", "status": 400 }
      ]}
    ]
  }
}
```

### Data-Driven + Network Mock

Form submission ที่ต้องทดสอบทั้ง input variants + API responses:
```json
{
  "advanced": {
    "data_driven": true,
    "variants_file": "test-data/TS-PRODUCT-DDT.json",
    "mocks": [
      { "url": "**/api/products", "scenarios": [
        { "name": "server-error", "status": 500 }
      ]}
    ]
  }
}
```

### Serial Group + State Machine

Order lifecycle ที่ต้อง create ก่อน แล้ว transition ตาม states:
```json
[
  { "id": "TS-ORDER-001", "advanced": {
    "serial_group": "ORDER-LIFECYCLE", "serial_order": 1
  }},
  { "id": "TS-ORDER-FLOW-001", "advanced": {
    "flow_type": "state-machine",
    "serial_group": "ORDER-LIFECYCLE", "serial_order": 2,
    "depends_on_data": { "from": "TS-ORDER-001", "field": "created_order_id" }
  }}
]
```

## When NOT to Use Advanced Patterns

- Simple CRUD pages with no state → ใช้ qa-ui-test เดิม
- Static pages (about, FAQ) → ไม่ต้อง advanced
- Pages with < 3 test scenarios → overkill
- First-time setup → ใช้ `/qa-create-scenario --auto` ก่อน แล้ว `/qa-create-advanced --enhance`
