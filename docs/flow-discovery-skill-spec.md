# Flow Discovery Skill — Specification สำหรับสร้าง Claude Code Skill

## วัตถุประสงค์ของเอกสารนี้

เอกสารนี้เป็น **spec สำหรับส่งให้ Claude Code สร้าง skill** ที่ช่วย:
1. อ่าน codebase ที่พัฒนาเสร็จแล้ว
2. คิด workflow/scenario/edge case ที่อาจพลาดไป
3. Deep dive ลงไปในแต่ละ scenario เพื่อหา gap

**หมายเหตุ**: ผู้ใช้มี `qa-web-ui` skill อยู่แล้ว — skill นี้เน้น **คิด** ไม่ใช่ **ทดสอบ**

---

## Skill Metadata

```yaml
---
name: flow-discovery
description: |
  วิเคราะห์ codebase ที่พัฒนาเสร็จแล้วเพื่อค้นหา workflow, scenario, edge case 
  ที่อาจถูกมองข้าม ใช้เทคนิค adversarial review และ multi-perspective analysis

  ใช้เมื่อ: (1) ต้องการค้นหา flow ที่ขาดหายจากระบบเดิม (2) ต้องการคิด edge case 
  จาก code ที่มี (3) ต้องการ deep dive scenario เฉพาะจุด (4) ต้องการ adversarial 
  review ระบบที่ deploy แล้ว (5) พิมพ์ "flow discovery" หรือ "หา flow ที่ขาด" 
  หรือ "คิด scenario" หรือ "edge case hunt" หรือ "วิเคราะห์ระบบเดิม"

  ตัวอย่างคำสั่ง: "อ่าน code แล้วหา flow ที่ขาด", "คิด edge case ของ module นี้",
  "deep dive เรื่อง payment flow", "adversarial review ระบบ login",
  "วิเคราะห์ระบบเดิมแล้วหา scenario ที่พลาด"
---
```

---

## 1. Skill Overview

### ปัญหาที่แก้
เวลาพัฒนาระบบเสร็จ มักมี workflow/scenario ที่คิดไม่ถึง — 
ระบบทำงานได้ตาม happy path แต่ edge case, error flow, concurrent scenario, 
หรือ business rule ที่ซับซ้อนอาจถูกมองข้าม

### แนวคิดหลัก (ดัดแปลงจาก BMAD Method)
Skill นี้ดึงเทคนิค 4 อย่างจาก BMAD Method มาใช้:

| เทคนิค | ต้นทางจาก BMAD | ปรับใช้อย่างไร |
|--------|---------------|---------------|
| **Codebase Scanning** | `bmad-document-project` (brownfield workflow) | สแกน code แล้วสรุป flow ที่มีอยู่ |
| **Adversarial Review** | `bmad-check-implementation-readiness` | บังคับหาปัญหา ห้ามตอบ "ดีแล้ว" |
| **Edge Case Hunter** | BMAD v6.2 edge-case-hunter review task | ไล่ trace ทุก branch/condition หา gap |
| **Multi-Perspective** | `bmad-party-mode` (multi-agent discussion) | มองจากหลายมุม: user, hacker, QA, business |

---

## 2. Workflow Modes

### Mode 1: Full Scan — สแกนทั้ง project หา flow ที่ขาด
```
Trigger: "อ่าน code แล้วหา flow ที่ขาด", "full scan", "วิเคราะห์ระบบเดิม"
```

**ขั้นตอน:**

```
Step 1: Codebase Reconnaissance (สำรวจภูมิประเทศ)
├── สแกน directory structure
├── ระบุ tech stack (framework, DB, messaging, etc.)
├── หา entry points: Controllers, API endpoints, Event handlers, Scheduled jobs
├── หา Models/Entities → สรุป domain objects
└── Output: project-scan-summary.md

Step 2: Flow Extraction (สกัด flow ที่มีอยู่)
├── อ่าน Controllers/Services → สร้าง flow list
├── อ่าน Middleware/Filters → หา cross-cutting concerns
├── อ่าน Event handlers/Message consumers → หา async flows
├── อ่าน Scheduled tasks/Background jobs → หา batch flows
├── จัดกลุ่มตาม domain/module
└── Output: existing-flows.md

Step 3: Gap Analysis — Adversarial Mode (หา flow ที่ขาด)
├── ใช้ Adversarial Thinking: "ต้องหาให้ได้ ห้ามบอกว่าครบแล้ว"
├── สำหรับแต่ละ flow ที่พบ ถาม:
│   ├── ถ้า input ผิดปกติจะเกิดอะไร?
│   ├── ถ้าทำพร้อมกัน 2 คนจะเกิดอะไร? (concurrency)
│   ├── ถ้า external service ล่มจะเกิดอะไร? (failure handling)
│   ├── ถ้า data ไม่สมบูรณ์จะเกิดอะไร? (data integrity)
│   ├── ถ้า user ทำขั้นตอนกลับลำดับจะเกิดอะไร? (out-of-order)
│   ├── ถ้า session/token หมดอายุระหว่างทำจะเกิดอะไร?
│   └── ถ้า permission เปลี่ยนระหว่างทำจะเกิดอะไร?
├── หา flow ที่ "ไม่มีอยู่แต่ควรมี":
│   ├── Rollback/Undo flow
│   ├── Retry/Recovery flow
│   ├── Notification/Alert flow
│   ├── Audit/Logging flow
│   ├── Data migration/Cleanup flow
│   └── Admin override flow
└── Output: gap-analysis.md

Step 4: Prioritize & Report (จัดลำดับและสรุป)
├── จัดลำดับตาม: Impact × Likelihood
│   ├── 🔴 Critical — เกิดขึ้นง่ายและกระทบรุนแรง
│   ├── 🟡 Important — กระทบปานกลางหรือเกิดไม่บ่อย
│   └── 🟢 Nice-to-have — edge case ไกลตัว
└── Output: flow-discovery-report.md
```

### Mode 2: Deep Dive — เจาะลึกเฉพาะ module/feature
```
Trigger: "deep dive [feature name]", "เจาะลึก [module]", "วิเคราะห์ [flow] ให้ละเอียด"
```

**ขั้นตอน:**

```
Step 1: Scope Lock
├── ระบุ module/feature ที่จะ deep dive
├── หาไฟล์ที่เกี่ยวข้องทั้งหมด (grep, find)
└── สรุป boundary ของ scope

Step 2: Trace Every Path
├── อ่าน code ทีละ method/function
├── วาด decision tree จาก if/else, switch, try/catch
├── สำหรับทุก branch ถาม:
│   ├── มี test cover หรือไม่?
│   ├── error message ชัดเจนหรือไม่?
│   ├── log/audit ครบหรือไม่?
│   └── จะเกิดอะไรถ้า branch นี้ fail?
└── Output: path-trace-[feature].md

Step 3: Scenario Generation
├── สร้าง scenario แบบ Given-When-Then
├── แบ่งเป็น:
│   ├── Happy Path ที่มีอยู่ (ยืนยันว่าครบ)
│   ├── Alternative Path ที่ขาด
│   ├── Error/Exception Path ที่ขาด
│   ├── Edge Case ที่ขาด
│   └── Security Scenario ที่ขาด
└── Output: scenarios-[feature].md

Step 4: Adversarial Deep Dive
├── สมมติตัวเองเป็น 4 บทบาท:
│   ├── 👤 Confused User — ใช้งานผิดวิธีทุกทาง
│   ├── 🏴‍☠️ Malicious Actor — พยายามโจมตี/ใช้ช่องโหว่
│   ├── 🔧 Overloaded System — ระบบรับ load สูง/resource หมด
│   └── 📊 Business Auditor — ตรวจว่าตรง business rule ครบไหม
└── Output: adversarial-findings-[feature].md
```

### Mode 3: Quick Think — คิดเร็วจากคำอธิบาย (ไม่ต้องอ่าน code)
```
Trigger: "คิด scenario สำหรับ [feature]", "brainstorm edge case [topic]"
```

**ขั้นตอน:**

```
Step 1: รับ context จากผู้ใช้ (ถามสั้นๆ 3-5 คำถาม)
├── ระบบนี้ทำอะไร?
├── ใครใช้บ้าง?
├── มี external dependency อะไร?
├── มี business rule สำคัญอะไร?
└── มีข้อจำกัดอะไร? (time, resource, regulation)

Step 2: ใช้ SCAMPER + Reverse Brainstorming
├── SCAMPER: Substitute, Combine, Adapt, Modify, Put to other use, Eliminate, Reverse
├── Reverse Brainstorming: "ทำอย่างไรถึงจะทำให้ระบบพัง?"
└── Output: brainstorm-[topic].md

Step 3: จัดกลุ่มและ prioritize
└── Output: quick-think-[topic].md
```

---

## 3. Adversarial Review Rules

กฎหลักที่ทุก mode ต้องปฏิบัติตาม (ดัดแปลงจาก BMAD Adversarial Review):

```
RULE 1: ห้ามตอบ "ดีแล้ว" หรือ "ครบแล้ว"
  → ต้องหา finding อย่างน้อย 3 ข้อเสมอ
  → ถ้าหาไม่ได้ ให้กลับไป analyze ใหม่

RULE 2: ทุก finding ต้อง actionable
  → ระบุ: อะไรอาจเกิด + เกิดเมื่อไหร่ + กระทบอะไร + แนะนำวิธีแก้

RULE 3: ห้ามรายงาน false positive โดยเจตนา
  → ถ้าไม่แน่ใจ ให้ระบุว่า "ต้องตรวจสอบเพิ่ม" แทน
  → แยกชัดเจนระหว่าง "ปัญหาจริง" กับ "จุดที่ควรพิจารณา"

RULE 4: มองจากหลายมุม (Multi-Perspective)
  → User perspective: ใช้งานง่ายไหม? สับสนตรงไหน?
  → Developer perspective: maintain ง่ายไหม? มี tech debt ตรงไหน?
  → Security perspective: มีช่องโหว่ตรงไหน?
  → Business perspective: ตรง business rule ครบไหม?
  → Operations perspective: monitor/debug ได้ไหม? log ครบไหม?
```

---

## 4. Output Format

ทุก output เป็น Markdown file สร้างไว้ที่ working directory:

### flow-discovery-report.md (Main Report)
```markdown
# Flow Discovery Report: [Project Name]
**วันที่**: [date]
**Scope**: [Full Scan / Deep Dive: feature name]

## สรุปภาพรวม
- Flow ที่พบในระบบ: X flows
- Gap ที่ค้นพบ: Y gaps
- Edge Case ที่ค้นพบ: Z cases

## 🔴 Critical Findings
### 1. [Finding Title]
- **สถานการณ์**: [เกิดอะไรขึ้น]
- **Trigger**: [อะไรทำให้เกิด]
- **ผลกระทบ**: [กระทบอะไร]
- **Code ที่เกี่ยวข้อง**: [file:line]
- **แนะนำ**: [วิธีแก้/ป้องกัน]

## 🟡 Important Findings
...

## 🟢 Nice-to-have
...

## Flow ที่ยังไม่มีแต่ควรพิจารณา
| Flow | เหตุผลที่ควรมี | Priority |
|------|---------------|----------|
| ... | ... | ... |

## Scenarios สำหรับ QA
| ID | Scenario (Given-When-Then) | Type | Priority |
|----|---------------------------|------|----------|
| S001 | Given... When... Then... | Edge Case | 🔴 |
| ... | ... | ... | ... |
```

### scenarios-[feature].md (สำหรับ Deep Dive)
```markdown
# Scenarios: [Feature Name]

## Happy Path (ที่มีอยู่แล้ว)
- ✅ [scenario description]

## Alternative Path (ที่ขาดหาย)
- ❌ [scenario] → แนะนำ: [action]

## Error/Exception Path (ที่ขาดหาย)
- ❌ [scenario] → แนะนำ: [action]

## Edge Cases
- ❌ [scenario] → แนะนำ: [action]

## Security Scenarios
- ❌ [scenario] → แนะนำ: [action]
```

---

## 5. Edge Case Checklist

Checklist มาตรฐานที่ใช้ในทุก mode (ดัดแปลงจาก BMAD Edge Case Hunter):

### Data Edge Cases
- [ ] ค่า null/undefined/empty ในทุก field
- [ ] ค่าที่ยาวเกิน limit
- [ ] ตัวอักษรพิเศษ / Unicode / emoji
- [ ] ตัวเลขติดลบ / ศูนย์ / max value
- [ ] วันที่ในอดีต / อนาคตไกล / leap year / timezone
- [ ] ไฟล์ขนาด 0 / ขนาดใหญ่เกิน
- [ ] Duplicate data / ข้อมูลซ้ำ

### State Edge Cases
- [ ] กดซ้ำ (double submit)
- [ ] กด back แล้ว submit ใหม่
- [ ] เปิดหลาย tab ทำพร้อมกัน
- [ ] Session หมดอายุระหว่างทำ
- [ ] Network ขาดแล้วกลับมา
- [ ] Browser refresh ระหว่างทำ

### Concurrency Edge Cases
- [ ] 2 คนแก้ข้อมูลเดียวกันพร้อมกัน
- [ ] Race condition ระหว่าง read/write
- [ ] Deadlock ระหว่าง transactions
- [ ] Message queue retry ทำให้ process ซ้ำ

### Business Logic Edge Cases
- [ ] ข้ามขั้นตอนที่ควรต้องทำ
- [ ] ทำย้อนลำดับ
- [ ] สิทธิ์เปลี่ยนระหว่างทำ
- [ ] Business rule ขัดแย้งกัน
- [ ] ข้อมูลอ้างอิงถูกลบระหว่างทำ (orphan reference)

### Integration Edge Cases
- [ ] External API timeout
- [ ] External API return unexpected format
- [ ] Database connection pool exhausted
- [ ] Disk full / memory full
- [ ] Queue/Kafka broker down

---

## 6. Tech Stack Awareness

Skill ต้องปรับการวิเคราะห์ตาม tech stack ที่พบ:

### .NET Core / ASP.NET MVC (Primary)
- อ่าน Controllers → สรุป API endpoints และ flow
- อ่าน Entity Framework DbContext/Migrations → สรุป data model
- อ่าน Middleware → หา cross-cutting concerns
- อ่าน Background Services/Hosted Services → หา async flow
- อ่าน SignalR Hubs → หา real-time flow
- ดู appsettings.json → หา configuration-dependent flow

### Kafka
- อ่าน Producers → หา event ที่ส่งออก
- อ่าน Consumers → หา event ที่รับเข้า
- ตรวจ: retry policy, dead letter queue, idempotency

### Frontend (jQuery/Bootstrap)
- อ่าน JavaScript event handlers → หา UI flow
- อ่าน AJAX calls → map กับ backend endpoints
- ตรวจ: client-side validation vs server-side validation

### LINE Bot/LIFF
- อ่าน webhook handlers → หา conversation flow
- ตรวจ: flex message edge cases, rich menu states

---

## 7. Integration กับ Skills อื่น

```
flow-discovery (skill นี้)
    │
    ├── ส่งต่อ scenarios → qa-web-ui (skill ที่มีอยู่แล้ว)
    │   สำหรับ automate testing
    │
    ├── ส่งต่อ findings → system-design-doc (skill ที่มีอยู่แล้ว)
    │   สำหรับ update เอกสารออกแบบระบบ
    │
    └── ส่งต่อ gaps → Claude Code
        สำหรับ implement missing flows
```

---

## 8. BMAD Reference

เทคนิคใน skill นี้ดัดแปลงจาก BMAD Method สามารถศึกษาเพิ่มเติมได้ที่:

| เทคนิค | แหล่งข้อมูล |
|--------|------------|
| Brownfield Scanning | https://docs.bmad-method.org/how-to/established-projects/ |
| Adversarial Review | https://docs.bmad-method.org/explanation/adversarial-review/ |
| Brainstorming Techniques | https://docs.bmad-method.org/explanation/brainstorming/ |
| Party Mode (Multi-Perspective) | https://docs.bmad-method.org/explanation/party-mode/ |
| Edge Case Hunter | BMAD CHANGELOG v6.2 — `edge-case-hunter` review task |
| Project Context | https://docs.bmad-method.org/explanation/project-context/ |
| Full BMAD Install | `npx bmad-method install` |
| BMAD GitHub | https://github.com/bmad-code-org/BMAD-METHOD |
| BMAD Docs (AI-optimized) | https://docs.bmad-method.org/llms-full.txt |

**หมายเหตุ**: ถ้าต้องการใช้ BMAD เต็มรูปแบบ (PRD, Architecture, Sprint Planning, etc.) 
ให้ติดตั้ง BMAD ตรง: `npx bmad-method install`

---

## 9. คำสั่งสำหรับ Claude Code

ใช้เอกสารนี้สร้าง skill โดยรันใน Claude Code:

```
สร้าง Claude Code Skill จาก spec ในไฟล์ flow-discovery-skill-spec.md
- สร้างเป็น SKILL.md format พร้อม frontmatter
- วาง skill ไว้ที่ ~/.claude/skills/flow-discovery/SKILL.md
- ใช้ภาษาไทยเป็นหลัก ศัพท์เทคนิคใช้ภาษาอังกฤษ
- ถ้ามี reference files ให้สร้างไว้ใน folder เดียวกัน
```
