 Plugin qa-ui-test v1.1.0 — 6 Commands

  ┌─────────────────────┬─────────────────────────────────────────────┬──────┐
  │       Command       │                    หน้าที่                     │ ใหม่? │
  ├─────────────────────┼─────────────────────────────────────────────┼──────┤
  │ /qa-create-scenario │ ระดมสมอง + สร้าง scenarios (IEEE 829)        │ เดิม  │
  ├─────────────────────┼─────────────────────────────────────────────┼──────┤
  │ /qa-run             │ รัน tests (single/module/parallel subagents) │ เดิม  │
  ├─────────────────────┼─────────────────────────────────────────────┼──────┤
  │ /qa-retest          │ รีเทส + comparison report + opus review      │ เดิม  │
  ├─────────────────────┼─────────────────────────────────────────────┼──────┤
  │ /qa-edit-scenario   │ แก้ไขเคสเมื่อ logic เปลี่ยน (impact analysis)    │ ใหม่  │
  ├─────────────────────┼─────────────────────────────────────────────┼──────┤
  │ /qa-status          │ ดูสถานะภาพรวม (progress, modules, failed)    │ ใหม่  │
  ├─────────────────────┼─────────────────────────────────────────────┼──────┤
  │ /qa-explain         │ อธิบาย test plan ด้วย Mermaid flowchart       │ ใหม่  │
  └─────────────────────┴─────────────────────────────────────────────┴──────┘

  Master-Detail Grid Support

  - page_type: master-detail — ใหม่ใน qa-tracker schema
  - 15 standard scenarios: master list, expand detail, inline edit, add/delete detail rows, sync verification
  - Playwright patterns: locator.nth(), .dblclick() for inline editing, nested grid selectors

  Edit Scenario Flow

  Logic เปลี่ยน → Impact Analysis (🔴🟡🟢)
    → 🔴 HIGH: เคสเดิม deprecated + สร้างเคสใหม่ (supersedes)
    → 🟡 MEDIUM: Update version + change_log
    → 🟢 LOW: ไม่เปลี่ยน

  ต้องการ commit หรือปรับอะไรเพิ่มไหมครับ?

✻ Brewed for 4m 24s

❯ ช่วยอธิบายการทำงาน ต้องเรียกอย่างไร ต้องระบุหน้าหรือไม่  หรือ ai agent จะตรวจสอบโค้ด และสร้างเองก่อน และหลังจากสร้างแล้วต้องเรียกอะไรต่อ

● วิธีใช้งาน QA UI Test Plugin — Flow ทั้งหมด

  ┌─────────────────────────────────────────────────────────────────────┐
  │                    QA UI TEST — WORKFLOW                              │
  ├─────────────────────────────────────────────────────────────────────┤
  │                                                                      │
  │  Step 1: สร้าง Scenarios                                             │
  │  ┌─────────────────────────────────────────────────┐                │
  │  │  /qa-create-scenario http://localhost:5000/products              │
  │  │                                                  │                │
  │  │  ต้องระบุ URL ของหน้าที่จะทดสอบ                    │                │
  │  │  Agent จะ:                                       │                │
  │  │  1. ถาม brainstorm 5 คำถาม                        │                │
  │  │  2. เปิดหน้าเว็บ → screenshot → วิเคราะห์          │                │
  │  │  3. ตรวจจับ page type อัตโนมัติ                    │                │
  │  │  4. สร้าง scenarios + scripts + test data          │                │
  │  └─────────────────────────────────────────────────┘                │
  │          │                                                           │
  │          ▼                                                           │
  │  Step 2: ดูว่าจะทดสอบอะไรบ้าง (optional)                              │
  │  ┌─────────────────────────────────────────────────┐                │
  │  │  /qa-explain                                     │                │
  │  │  /qa-explain --module PRODUCT                    │                │
  │  └─────────────────────────────────────────────────┘                │
  │          │                                                           │
  │          ▼                                                           │
  │  Step 3: รัน Tests                                                    │
  │  ┌─────────────────────────────────────────────────┐                │
  │  │  /qa-run TS-PRODUCT-001        (ทีละเคส)         │                │
  │  │  /qa-run --module PRODUCT      (ทั้ง module)      │                │
  │  │  /qa-run --all                 (ทั้งหมด)          │                │
  │  │  /qa-run --parallel            (parallel)        │                │
  │  └─────────────────────────────────────────────────┘                │
  │          │                                                           │
  │          ▼                                                           │
  │  Step 4: ดูสถานะ                                                      │
  │  ┌─────────────────────────────────────────────────┐                │
  │  │  /qa-status                                      │                │
  │  └─────────────────────────────────────────────────┘                │
  │          │                                                           │
  │          ▼                                                           │
  │  Step 5: รีเทส (ถ้ามี failed)                                         │
  │  ┌─────────────────────────────────────────────────┐                │
  │  │  /qa-retest                    (failed ทั้งหมด)   │                │
  │  │  /qa-retest TS-PRODUCT-003     (เคสเฉพาะ)        │                │
  │  │  /qa-retest --review           (+ opus review)   │                │
  │  └─────────────────────────────────────────────────┘                │
  │          │                                                           │
  │          ▼                                                           │
  │  Step 6: แก้ไขเคส (ถ้า logic เปลี่ยน)                                  │
  │  ┌─────────────────────────────────────────────────┐                │
  │  │  /qa-edit-scenario TS-PRODUCT-002 "เพิ่ม field"   │                │
  │  └─────────────────────────────────────────────────┘                │
  │                                                                      │
  └─────────────────────────────────────────────────────────────────────┘

  ---
  ตอบคำถามทีละข้อ

  1. ต้องระบุหน้าหรือไม่?

  ต้องระบุ URL ตอน /qa-create-scenario:

  # ระบุ URL ตรงๆ
  /qa-create-scenario http://localhost:5000/admin/products

  # ระบุ module + URL
  /qa-create-scenario --module PRODUCT --url /admin/products

  # ระบุว่าเป็น master data
  /qa-create-scenario --master-data --url /admin/categories

  # ระบุว่าเป็น master-detail grid
  /qa-create-scenario --master-detail --url /admin/orders

  ไม่ต้องระบุ URL ตอนคำสั่งอื่น — เพราะมี qa-tracker.json track ไว้แล้ว:

  /qa-run --all           # รู้จาก qa-tracker.json ว่ามีเคสอะไร
  /qa-status              # อ่านจาก qa-tracker.json
  /qa-retest              # รู้ว่าเคสไหน failed
  /qa-explain             # อ่านจาก qa-tracker.json + test-scenarios/

  ---
  2. AI Agent ทำอะไรอัตโนมัติ?

  ┌─────────────────────────────────────────────────────────┐
  │  เมื่อคุณสั่ง /qa-create-scenario [URL]                    │
  │                                                          │
  │  Agent ทำอัตโนมัติ:                                       │
  │                                                          │
  │  ① เปิดหน้าเว็บ → screenshot                              │
  │       ↓                                                   │
  │  ② วิเคราะห์ elements (ตาราง? ฟอร์ม? wizard?)             │
  │       ↓                                                   │
  │  ③ ตรวจจับ page type อัตโนมัติ                             │
  │     ┌─────────────────────────────────────┐               │
  │     │ มีตาราง + ปุ่ม Add/Edit/Delete       │               │
  │     │  → Master Data (13 scenarios)       │               │
  │     │                                     │               │
  │     │ มีตาราง + แถวขยายได้ + detail grid    │               │
  │     │  → Master-Detail (15 scenarios)     │               │
  │     │                                     │               │
  │     │ มี form + submit                    │               │
  │     │  → Form page (8-10 scenarios)       │               │
  │     │                                     │               │
  │     │ มี stepper/wizard                   │               │
  │     │  → Multi-step (scenarios per step)  │               │
  │     └─────────────────────────────────────┘               │
  │       ↓                                                   │
  │  ④ ถาม brainstorm (business rules, edge cases)            │
  │       ↓                                                   │
  │  ⑤ สร้างไฟล์อัตโนมัติ:                                     │
  │     • test-scenarios/TS-XXX-NNN.md    (เอกสาร IEEE 829)   │
  │     • test-data/TS-XXX-NNN.json       (test data)         │
  │     • tests/TS-XXX-NNN.spec.ts        (Playwright script) │
  │     • tests/pages/xxx.page.ts         (Page Object Model) │
  │     • qa-tracker.json                 (tracking)          │
  │                                                          │
  │  ⑥ Agent จะไม่รัน test ให้อัตโนมัติ                         │
  │     → ต้องสั่ง /qa-run เอง                                 │
  └─────────────────────────────────────────────────────────┘

  สรุป: Agent วิเคราะห์หน้าเว็บเอง + สร้าง scripts เอง แต่จะถาม brainstorm ก่อน

  ---
  3. หลังสร้างแล้วต้องเรียกอะไรต่อ?

  สร้างเสร็จแล้ว → เลือกทำตามลำดับนี้:

   ┌──────────────────────────────────────────────────────┐
   │ /qa-create-scenario [URL]     ← ทำแล้ว               │
   └──────────────┬───────────────────────────────────────┘
                  │
         ┌────────┼────────┐
         ▼        ▼        ▼
    (optional) (แนะนำ)  (optional)
    ┌────────┐ ┌────────┐ ┌──────────┐
    │/qa-    │ │/qa-run │ │/qa-      │
    │explain │ │--module│ │status    │
    │        │ │ XXX    │ │          │
    │ดูว่าจะ │ │        │ │ดูภาพรวม  │
    │ทดสอบ   │ │รัน!    │ │          │
    │อะไรบ้าง │ │        │ │          │
    └────────┘ └───┬────┘ └──────────┘
                   │
            ┌──────┴──────┐
            ▼             ▼
       มี failed?    ทุกเคส passed?
            │             │
            ▼             ▼
       ┌─────────┐   ┌──────────┐
       │/qa-     │   │ เสร็จ!    │
       │retest   │   │ หรือสร้าง  │
       │         │   │ module    │
       │แก้แล้ว   │   │ ถัดไป     │
       │รีเทส    │   └──────────┘
       └────┬────┘
            │
       ยัง fail?
            │
            ▼
       ┌─────────┐
       │แก้ code │ ← developer แก้ bug ในแอพ
       │แล้ว      │
       │/qa-retest│ ← รีเทสอีกครั้ง
       └─────────┘

  ---
  ตัวอย่างการใช้งานจริง — ทดสอบ 3 หน้า

  # === วันที่ 1: สร้าง scenarios ===

  # หน้าที่ 1: หน้า Product (Master Data)
  /qa-create-scenario --master-data --url http://localhost:5000/admin/products
  # → Agent สร้าง 13 scenarios อัตโนมัติ

  # หน้าที่ 2: หน้า Order (Master-Detail Grid)
  /qa-create-scenario --master-detail --url http://localhost:5000/admin/orders
  # → Agent สร้าง 15 scenarios อัตโนมัติ

  # หน้าที่ 3: หน้า Login (Form)
  /qa-create-scenario http://localhost:5000/login
  # → Agent ตรวจจับว่าเป็น form → สร้าง 8 scenarios

  # ดูภาพรวม
  /qa-explain
  # → แสดง Mermaid flowchart + dependency map

  # === วันที่ 2: รัน tests ===

  /qa-run --all --parallel
  # → รัน 36 scenarios พร้อมกัน

  /qa-status
  # → ดูผล: 30/36 passed (83%)

  # === วันที่ 3: แก้ bug แล้วรีเทส ===

  /qa-retest
  # → รีเทส 6 failed scenarios

  /qa-retest --review
  # → opus review + แนะนำเคสเพิ่ม

  # === เมื่อ logic เปลี่ยน ===

  /qa-edit-scenario --module ORDER "เพิ่ม discount field ใน detail"
  # → impact analysis → สร้าง/ปรับเคสที่กระทบ
