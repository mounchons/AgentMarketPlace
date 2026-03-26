# 📋 Flow Discovery Report: [Project Name]
**วันที่**: [date]
**Scope**: [Full Scan / Deep Dive: feature / Ideate: idea]
**Tech Stack**: [detected stack]

---

## สรุปภาพรวม
- Flow ที่พบในระบบ: X flows
- Gap ที่ค้นพบ: Y gaps
- Edge Case ที่ค้นพบ: Z cases

## 🔴 Critical Findings

### [F001] [Finding Title]
- **สถานการณ์**: [เกิดอะไรขึ้น]
- **Trigger**: [อะไรทำให้เกิด]
- **ผลกระทบ**: [กระทบอะไร]
- **Code ที่เกี่ยวข้อง**: [file:line] (ถ้ามี)
- **Root Cause**: [สาเหตุ]
- **แนะนำ**: [วิธีแก้/ป้องกัน 2-3 ทาง]
- **ระดับความยาก**: [S/M/L]

## 🟡 Important Findings

### [F002] [Finding Title]
- **สถานการณ์**: [เกิดอะไรขึ้น]
- **Trigger**: [อะไรทำให้เกิด]
- **ผลกระทบ**: [กระทบอะไร]
- **Code ที่เกี่ยวข้อง**: [file:line] (ถ้ามี)
- **Root Cause**: [สาเหตุ]
- **แนะนำ**: [วิธีแก้/ป้องกัน]
- **ระดับความยาก**: [S/M/L]

## 🟢 Nice-to-have

### [F003] [Finding Title]
- **สถานการณ์**: [เกิดอะไรขึ้น]
- **แนะนำ**: [วิธีแก้/ป้องกัน]
- **ระดับความยาก**: [S/M/L]

## Flow ที่ยังไม่มีแต่ควรพิจารณา

| Flow | เหตุผลที่ควรมี | Priority |
|------|---------------|----------|
| [flow name] | [reason] | 🔴/🟡/🟢 |

## Scenarios สำหรับ QA

| ID | Scenario (Given-When-Then) | Type | Priority |
|----|---------------------------|------|----------|
| S001 | Given [context] When [action] Then [expected] | Edge Case | 🔴 |

---

## 📋 แนะนำขั้นตอนถัดไป

1. สร้าง test scenarios จาก findings → `/qa-create-scenario`
2. อัพเดทเอกสารออกแบบ → `/edit-section` หรือ `/brainstorm-design`
3. ปรับปรุง UI/UX → เปิด ui-mockup
4. เพิ่ม feature ที่ขาดหาย → `/add-feature`
5. ค้นหาข้อมูลเพิ่ม → `/flow-research [topic]`
6. สร้างเอกสารสำหรับแชร์ → `/flow-export [format]`
