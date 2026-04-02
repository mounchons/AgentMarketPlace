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
│  CRITICAL RULE:                                                  │
│  ✅ ใช้ Playwright CLI: npx playwright test                      │
│  ❌ ห้ามใช้ Playwright MCP สำหรับรัน test                         │
│  💡 MCP ใช้ได้เฉพาะ: สำรวจหน้าจริงหา selectors                   │
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

## Quick Reference

- **Pattern decision guide**: Read `references/advanced-patterns.md`
- **State machine notation**: Read `references/state-machine-guide.md`
- **Data-driven format**: Read `references/data-driven-guide.md`
- **Network mock patterns**: Read `references/network-mock-guide.md`

## Relationship with qa-ui-test

- qa-ui-test = basic CRUD testing (ไม่แตะ)
- qa-advanced = complex flows, data-driven, mocking (ต่อยอด)
- ใช้ qa-tracker.json ร่วมกัน (backward compatible)
- commands แยกกัน: `/qa-create-scenario` vs `/qa-create-advanced`
