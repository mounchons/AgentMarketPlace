# Flow Discovery Plugin — Design Specification

**วันที่**: 26 มีนาคม 2569
**Version**: 1.0.0
**Category**: analysis
**สถานะ**: Approved

---

## 1. ภาพรวม

### ปัญหาที่แก้

เวลาพัฒนาระบบเสร็จ มักมี workflow/scenario ที่คิดไม่ถึง — ระบบทำงานได้ตาม happy path แต่ edge case, error flow, concurrent scenario, หรือ business rule ที่ซับซ้อนอาจถูกมองข้าม

### จุดยืนของ Plugin

**"คิด"** — เป็นตัวเชื่อมระหว่าง code ที่มี กับ scenarios/gaps ที่ยังไม่ถูกค้นพบ

- **flow-discovery** → คิด (วิเคราะห์ หา gap)
- **qa-ui-test** → ทดสอบ (รัน test จาก scenarios)
- **system-design-doc** → ออกแบบ (บันทึก/ปรับปรุงเอกสาร)
- **ui-mockup** → ออกแบบ UI (ปรับปรุง UX จาก findings)
- **long-running** → พัฒนา (เพิ่ม feature ที่ขาดหาย)

### แนวคิดหลัก (ดัดแปลงจาก BMAD Method + เพิ่มเติม)

| เทคนิค | ต้นทาง | ปรับใช้อย่างไร |
|--------|--------|---------------|
| **Codebase Scanning** | BMAD `bmad-document-project` (brownfield) | สแกน code แล้วสรุป flow ที่มีอยู่ |
| **Adversarial Review** | BMAD `bmad-check-implementation-readiness` | บังคับหาปัญหา ห้ามตอบ "ดีแล้ว" |
| **Edge Case Hunter** | BMAD v6.2 edge-case-hunter review task | ไล่ trace ทุก branch/condition หา gap |
| **Multi-Perspective** | BMAD `bmad-party-mode` (multi-agent) | 7 subagents คิดจากหลายมุม |
| **Virtual User Personas** | UX Research + เพิ่มใหม่ | สร้าง personas สมจริง + จำลอง journey |
| **Internet Research** | เพิ่มใหม่ | ค้นหาปัญหาจริง, กฎหมาย, คู่แข่ง |

---

## 2. Commands (10 คำสั่ง)

### 2.1 `/flow-discovery` — เลือก mode + แนะนำการใช้งาน

**Trigger**: "flow discovery", "หา flow ที่ขาด", "คิด scenario", "edge case hunt", "วิเคราะห์ระบบเดิม"

แสดง menu ให้เลือก mode พร้อมคำอธิบายแต่ละคำสั่ง

### 2.2 `/flow-scan` — Full Scan ทั้ง project (Mode 1)

**Trigger**: "อ่าน code แล้วหา flow ที่ขาด", "full scan", "วิเคราะห์ระบบเดิม"
**Options**: `--module [name]` สแกนเฉพาะ module

**ขั้นตอน**:

```
Step 1: Codebase Reconnaissance (สำรวจภูมิประเทศ)
├── Auto-detect tech stack (framework, DB, messaging, etc.)
├── สแกน directory structure
├── หา entry points: Controllers, API endpoints, Event handlers, Scheduled jobs
├── หา Models/Entities → สรุป domain objects
└── Output: project-scan-summary (ส่วนหนึ่งของ report)

Step 2: Flow Extraction (สกัด flow ที่มีอยู่)
├── อ่าน Controllers/Services → สร้าง flow list
├── อ่าน Middleware/Filters → หา cross-cutting concerns
├── อ่าน Event handlers/Message consumers → หา async flows
├── อ่าน Scheduled tasks/Background jobs → หา batch flows
├── จัดกลุ่มตาม domain/module
└── Output: existing-flows (ส่วนหนึ่งของ report)

Step 3: Multi-Agent Brainstorm (7 subagents คิดพร้อมกัน)
├── ทุก subagent ใช้ Edge Case Checklist
├── ทุก subagent ใช้ Adversarial Rules
└── Output: raw findings จาก 7 มุมมอง

Step 4: Deep Analysis (วิเคราะห์เชิงลึกทุก finding)
├── Root Cause Analysis
├── Impact Chain (กระทบอะไรต่อ)
├── Solution Options (2-3 ทาง)
└── Effort Estimation (S/M/L)

Step 5: Prioritize (จัดลำดับ)
├── 🔴 Critical — เกิดขึ้นง่ายและกระทบรุนแรง
├── 🟡 Important — กระทบปานกลางหรือเกิดไม่บ่อย
└── 🟢 Nice-to-have — edge case ไกลตัว

Step 6: Report + Next Action แนะนำ
```

**Output**: `flow-discovery-report.md`, อัพเดท `flow-tracker.json`

**Next Action แนะนำ**:
1. สร้าง test scenarios → `/qa-create-scenario`
2. อัพเดทเอกสารออกแบบ → `/edit-section` หรือ `/brainstorm-design`
3. ปรับปรุง UI/UX → เปิด ui-mockup
4. เพิ่ม feature ที่ขาดหาย → `/add-feature`
5. ค้นหาข้อมูลเพิ่ม → `/flow-research [topic]`
6. สร้างเอกสารสำหรับแชร์ → `/flow-export [format]`

### 2.3 `/flow-dive [feature]` — Deep Dive เจาะลึก module/feature (Mode 2)

**Trigger**: "deep dive [feature]", "เจาะลึก [module]", "วิเคราะห์ [flow] ให้ละเอียด"

**ขั้นตอน**:

```
Step 1: Scope Lock
├── ระบุ module/feature ที่จะ deep dive
├── หาไฟล์ที่เกี่ยวข้องทั้งหมด
└── สรุป boundary ของ scope

Step 2: Trace Every Path
├── อ่าน code ทีละ method/function
├── วาด decision tree จาก if/else, switch, try/catch
├── สำหรับทุก branch ถาม:
│   ├── มี test cover หรือไม่?
│   ├── error message ชัดเจนหรือไม่?
│   ├── log/audit ครบหรือไม่?
│   └── จะเกิดอะไรถ้า branch นี้ fail?
└── Output: path-trace (ส่วนหนึ่งของ report)

Step 3: Scenario Generation
├── สร้าง scenario แบบ Given-When-Then
├── แบ่งเป็น:
│   ├── ✅ Happy Path ที่มีอยู่ (ยืนยันว่าครบ)
│   ├── ❌ Alternative Path ที่ขาด
│   ├── ❌ Error/Exception Path ที่ขาด
│   ├── ❌ Edge Case ที่ขาด
│   └── ❌ Security Scenario ที่ขาด
└── Output: scenarios-[feature].md

Step 4: Multi-Agent Adversarial Deep Dive
├── 7 subagents วิเคราะห์เฉพาะ feature นี้
└── Output: adversarial findings (ส่วนหนึ่งของ report)

Step 5: Deep Analysis + Prioritize + Report
```

**Output**: `flow-dive-[feature].md`, `scenarios-[feature].md`, อัพเดท `flow-tracker.json`

**Next Action แนะนำ**:
1. สร้าง test scenarios จาก findings → `/qa-create-scenario`
2. อัพเดทเอกสารออกแบบ → `/edit-section`
3. สร้าง virtual user personas → `/flow-persona [feature]`
4. สร้างเอกสารสำหรับแชร์ → `/flow-export scenarios`

### 2.4 `/flow-think [topic]` — Quick Think (Mode 3)

**Trigger**: "คิด scenario สำหรับ [feature]", "brainstorm edge case [topic]"

ไม่ต้องอ่าน code — คิดจากคำอธิบายอย่างเดียว

**ขั้นตอน**:

```
Step 1: รับ context จากผู้ใช้ (ถามสั้นๆ 3-5 คำถาม)
├── ระบบนี้ทำอะไร?
├── ใครใช้บ้าง?
├── มี external dependency อะไร?
├── มี business rule สำคัญอะไร?
└── มีข้อจำกัดอะไร? (time, resource, regulation)

Step 2: Multi-Agent Brainstorm + SCAMPER + Reverse Brainstorming
├── 7 subagents คิดจากมุมของตัวเอง
├── SCAMPER: Substitute, Combine, Adapt, Modify, Put to other use, Eliminate, Reverse
├── Reverse Brainstorming: "ทำอย่างไรถึงจะทำให้ระบบพัง?"
└── Output: brainstorm results

Step 3: Deep Analysis + Prioritize + Report
```

**Output**: `flow-think-[topic].md`, อัพเดท `flow-tracker.json`

**Next Action แนะนำ**:
1. Deep dive ลงรายละเอียด → `/flow-dive [feature]`
2. เพิ่ม feature ที่ขาดหาย → `/add-feature`
3. สร้างเอกสารออกแบบ → `/create-design-doc`
4. สร้างเอกสารสำหรับแชร์ → `/flow-export summary`

### 2.5 `/flow-ideate [idea]` — คิด workflow จากไอเดีย (Mode 4)

**Trigger**: "คิด workflow จากไอเดีย", "ออกแบบ flow ระบบใหม่", "วาง workflow", "ideate"

ยังไม่มี code — เริ่มจากไอเดีย/ความต้องการอย่างเดียว

**ขั้นตอน**:

```
Step 1: รับ context จากผู้ใช้ (ถามทีละคำถาม)
├── ไอเดีย/ระบบนี้คืออะไร?
├── แก้ปัญหาอะไรให้ใคร?
├── ใครใช้บ้าง? (user roles)
├── มี business rule สำคัญอะไร?
├── มี external dependency อะไร? (payment, API, etc.)
└── มีข้อจำกัด? (งบ, เวลา, กฎหมาย)

Step 2: Internet Research — หาข้อมูลระบบคล้ายกัน
├── ปัญหาที่ระบบคล้ายกันเจอ (Layer 1: Problem Research)
├── กฎหมาย/มาตรฐานที่เกี่ยวข้อง (Layer 2: Compliance)
├── คู่แข่ง/ระบบอ้างอิง (Layer 3: Competitive Analysis)
└── Output: research findings เป็น input ให้ step ถัดไป

Step 3: Workflow Design — ออกแบบ flow ทั้งหมด
├── ระบุ user roles + permissions
├── สร้าง workflow หลัก (happy path) ของแต่ละ role
├── สร้าง flow diagram (text-based)
├── ระบุ data entities ที่ต้องมี
├── ระบุ integration points (external APIs, services)
└── Output: workflow design

Step 4: สร้าง Virtual User Personas
├── สร้าง 3-5 personas ตาม user roles
├── จำลอง journey ของแต่ละ persona บน workflow ที่ออกแบบ
├── ระบุ ❌ จุดที่อาจมีปัญหา
└── Output: personas + journeys

Step 5: Multi-Agent Adversarial Review บน workflow
├── 7 subagents วิเคราะห์ workflow ที่ออกแบบ
├── หา: flow ที่ขาด, edge case, security gap, business rule ที่พลาด
├── ใช้ Adversarial Rules + Edge Case Checklist
└── Output: findings + missing flows

Step 6: Prioritize + Report + Next Action
```

**Output**: `flow-ideate-[idea].md`, `flow-personas-[idea].md`, `flow-research-[idea].md`, อัพเดท `flow-tracker.json`

**Next Action แนะนำ**:
1. สร้างเอกสารออกแบบระบบเต็มรูปแบบ → `/create-design-doc`
2. สร้าง UI mockup จาก workflow → เปิด ui-mockup
3. วาง feature list สำหรับพัฒนา → `/add-feature`
4. Deep dive เฉพาะ flow ที่ซับซ้อน → `/flow-think [flow-name]`
5. สร้างเอกสารสำหรับแชร์ → `/flow-export summary`

### 2.6 `/flow-persona [feature]` — Virtual User Personas + Journey Simulation

**Trigger**: "สร้าง persona", "จำลองผู้ใช้", "user journey", "simulate user"

**ขั้นตอน**:

```
Step 1: Internet Research สำหรับ Persona
├── Firecrawl: "common user complaints [domain]"
├── Firecrawl: "accessibility issues [platform type]"
├── Firecrawl: "[domain] user demographics"
└── ข้อมูลประชากร/พฤติกรรมจริง → ทำให้ personas สมจริง

Step 2: สร้าง Persona Profiles (3-5 คน)
├── สำหรับแต่ละ persona:
│   ├── ชื่อ, อายุ, อาชีพ (ภาษาไทย, สมจริง)
│   ├── อุปกรณ์ที่ใช้ (มือถือ/PC, รุ่น, ขนาดจอ, ความเร็วเน็ต)
│   ├── ทักษะ IT (ต่ำ/กลาง/สูง)
│   ├── เป้าหมายการใช้งาน
│   ├── Pain Points (จาก internet research)
│   └── พฤติกรรมการใช้งาน
└── Output: flow-personas-[feature].md

Step 3: Journey Simulation — จำลอง flow ทั้งเส้นของแต่ละ persona
├── สำหรับแต่ละ persona:
│   ├── เดิน step-by-step ตาม flow หลัก
│   ├── ทุก step ถาม: persona นี้จะเจอปัญหาอะไร?
│   ├── ระบุ ❌ GAP ที่พบ พร้อมคำอธิบาย
│   └── ระบุ decision points ที่ persona อาจเลือกต่างจาก happy path
└── Output: journeys-[feature].md

Step 4: Gap Summary per Persona + Prioritize
```

**Output**: `flow-personas-[feature].md`, `journeys-[feature].md`, อัพเดท `flow-tracker.json`

**Next Action แนะนำ**:
1. สร้าง test scenarios จาก journey gaps → `/qa-create-scenario`
2. ปรับปรุง UI/UX ตาม persona findings → เปิด ui-mockup
3. ค้นหาข้อมูลเพิ่มเติม → `/flow-research [topic]`
4. สร้างเอกสารสำหรับ UX team → `/flow-export personas`

### 2.7 `/flow-research [topic]` — Internet Research

**Trigger**: "ค้นหาปัญหา", "หา compliance", "วิเคราะห์คู่แข่ง", "research [topic]"

**ขั้นตอน**:

```
Layer 1: Problem Research
├── Firecrawl: "common issues in [domain] systems"
├── Firecrawl: "[domain] user complaints" (Reddit, forums, reviews)
├── Firecrawl: "UX problems [platform type]"
├── Firecrawl: Stack Overflow — error patterns ที่เจอบ่อย
└── Output: รายการปัญหาจริง + frequency

Layer 2: Compliance & Regulation
├── Firecrawl: กฎหมายที่เกี่ยวข้อง (PDPA, HIPAA, PCI-DSS, ธปท.)
├── Firecrawl: มาตรฐาน (WCAG, ISO 27001)
├── Firecrawl: "common compliance violations [domain]"
└── Output: checklist กฎหมาย/มาตรฐาน + gap ที่พบ

Layer 3: Competitive Analysis
├── Firecrawl: ระบบคู่แข่ง/ระบบคล้ายกัน
├── Firecrawl: "best practices [domain] workflow"
├── Firecrawl: "[competitor] feature comparison"
└── Output: features/flows ที่คู่แข่งมี แต่ระบบเรายังไม่มี
```

**เครื่องมือ**:
- **Firecrawl** (หลัก) — scrape/search เว็บ, อ่าน documentation
- **Graph Brain** (เสริม) — save research results ไว้ใช้ซ้ำ ไม่ต้องค้นใหม่ทุกครั้ง

**Output**: `flow-research-[topic].md`, อัพเดท `flow-tracker.json`

**Next Action แนะนำ**:
1. นำผลวิจัยไปเสริม findings → `/flow-scan` หรือ `/flow-dive`
2. สร้าง personas จากข้อมูลจริง → `/flow-persona [feature]`
3. อัพเดทเอกสารออกแบบ → `/edit-section`
4. สร้างเอกสาร compliance สำหรับทีม → `/flow-export compliance`

### 2.8 `/flow-export [format]` — สร้างเอกสารสำหรับคนอ่าน

**Trigger**: "สร้างเอกสาร", "export report", "แชร์ให้ทีม"

**Format Options**:

| Format | คำอธิบาย | เหมาะกับใคร |
|--------|---------|------------|
| `summary` (default) | สรุปภาพรวม 1-2 หน้า | ผู้บริหาร, Product Owner, ทีม |
| `full` | รายงานเต็ม ทุก finding พร้อม root cause | Tech Lead, Architect |
| `scenarios` | เฉพาะ scenarios (Given-When-Then) | QA Team, Tester |
| `personas` | เฉพาะ persona profiles + journey maps | UX Designer, Product |
| `compliance` | เฉพาะ กฎหมาย/มาตรฐานที่เกี่ยวข้อง | Legal, Compliance Officer |

**คุณสมบัติ**:
- ภาษาไทยทั้งหมด — ศัพท์เทคนิคใช้ภาษาอังกฤษ
- ไม่มีศัพท์เฉพาะทาง AI/Agent — คนทั่วไปอ่านเข้าใจ
- มีหมายเลขอ้างอิง (F001, F002) — ใช้สื่อสารในทีมได้ง่าย

**Output**: `flow-export-[format]-[project]-[date].md`

**Next Action แนะนำ**:
1. ส่งเอกสารให้ทีมทบทวน
2. ประชุมจัด priority ร่วมกัน
3. เมื่อตกลง priority แล้ว → `/add-feature` เพิ่มงาน
4. ต้องการเอกสาร format อื่น → `/flow-export [format]`

### 2.9 `/flow-status` — ดูสถานะ findings ทั้งหมด

**Trigger**: "สถานะ flow", "flow status", "สรุป findings"

แสดงภาพรวมจาก `flow-tracker.json`:
- จำนวน findings ทั้งหมด แบ่งตาม severity
- findings ที่ยังไม่ได้ส่งต่อ (handoff pending)
- findings ที่ส่งต่อแล้ว (handoff complete)
- research results ที่มี
- personas ที่สร้างแล้ว

**Next Action แนะนำ**: แนะนำตาม findings ที่ยังค้างอยู่

### 2.10 `/flow-help [command]` — อธิบายวิธีใช้งาน

**Trigger**: "วิธีใช้ flow", "flow help", "อธิบายคำสั่ง"

- ไม่ระบุ command → แสดงรายการคำสั่งทั้งหมดพร้อมคำอธิบายสั้น + ตัวอย่างการใช้งาน
- ระบุ command → แสดงรายละเอียดคำสั่งนั้น พร้อม options, ตัวอย่าง, output ที่ได้

---

## 3. Multi-Agent Brainstorming Engine

### 7 Agent Personas

| # | Persona | บทบาท | มุมมองหลัก |
|---|---------|--------|-----------|
| 1 | 👤 **End User ทั่วไป** | ผู้ใช้ที่ไม่ถนัดเทคโนโลยี | ใช้งานยากตรงไหน? สับสนตรงไหน? กดผิดได้ตรงไหน? |
| 2 | 👨‍💼 **Power User / Admin** | ผู้ดูแลระบบ, ใช้งานหนัก | จัดการ data เยอะๆ ได้ไหม? bulk operation? report? |
| 3 | 🏴‍☠️ **Malicious Actor** | ผู้โจมตี/ใช้ช่องโหว่ | injection? bypass auth? escalate privilege? data leak? |
| 4 | 🔧 **Site Reliability Engineer** | ดูแล production | ระบบ scale ได้ไหม? monitor ได้ไหม? recover ได้ไหม? |
| 5 | 📊 **Business Analyst** | ตรวจ business rules | ครบทุก rule ไหม? มี edge case ทาง business ไหม? |
| 6 | 🧪 **QA Engineer** | หา bug/gap ใน flow | test coverage? boundary values? regression risk? |
| 7 | 🌐 **Real-World Researcher** | ค้นหาปัญหาจาก internet | ระบบคล้ายกันเจอปัญหาอะไร? กฎหมาย? คู่แข่ง? |

### Brainstorm Flow

```
Input: flow list + code context
         │
    ┌────┴────┐
    │ Dispatch │──→ 7 subagents ทำงานพร้อมกัน (parallel)
    └────┬────┘
         │
    แต่ละ subagent:
    ├── รับ code context + flow list
    ├── วิเคราะห์จากมุมมองของตัวเอง
    ├── ใช้ Edge Case Checklist ตรวจ
    ├── ใช้ Adversarial Rules บังคับหา findings
    └── ส่ง raw findings กลับ
         │
    ┌────┴────┐
    │  Merge  │──→ รวม findings จาก 7 subagents
    └────┬────┘    ├── ลบ duplicate
         │         ├── จัดกลุ่มตาม theme
         │         └── เพิ่ม cross-reference
         │
    ┌────┴─────┐
    │Deep Anal.│──→ ทุก finding ผ่าน:
    └────┬─────┘    ├── Root Cause Analysis
         │          ├── Impact Chain
         │          ├── Solution Options (2-3 ทาง)
         │          └── Effort Estimation (S/M/L)
         │
    ┌────┴────┐
    │Priority │──→ 🔴 Critical / 🟡 Important / 🟢 Nice-to-have
    └─────────┘
```

### Adversarial Rules (จาก BMAD)

```
RULE 1: ห้ามตอบ "ดีแล้ว" หรือ "ครบแล้ว"
  → ต้องหา finding อย่างน้อย 3 ข้อเสมอ
  → ถ้าหาไม่ได้ ให้กลับไป analyze ใหม่

RULE 2: ทุก finding ต้อง actionable
  → ระบุ: สถานการณ์ + trigger + ผลกระทบ + แนะนำวิธีแก้

RULE 3: ห้ามรายงาน false positive โดยเจตนา
  → ถ้าไม่แน่ใจ ให้ระบุว่า "ต้องตรวจสอบเพิ่ม"
  → แยกชัดเจนระหว่าง "ปัญหาจริง" กับ "จุดที่ควรพิจารณา"

RULE 4: มองจากหลายมุม (Multi-Perspective)
  → User perspective: ใช้งานง่ายไหม? สับสนตรงไหน?
  → Developer perspective: maintain ง่ายไหม? มี tech debt ตรงไหน?
  → Security perspective: มีช่องโหว่ตรงไหน?
  → Business perspective: ตรง business rule ครบไหม?
  → Operations perspective: monitor/debug ได้ไหม? log ครบไหม?
```

---

## 4. Virtual User Personas + Journey Simulation

### Persona Generation Process

**Step 1: Internet Research** — ค้นหาข้อมูลจริงจากภายนอก
- ปัญหาที่ users จริงเจอในระบบประเภทเดียวกัน
- ข้อมูลประชากร/พฤติกรรมผู้ใช้
- accessibility issues ที่พบบ่อย

**Step 2: สร้าง Persona Profiles (3-5 คน)**

แต่ละ persona ประกอบด้วย:
```
├── ชื่อ, อายุ, อาชีพ (ภาษาไทย, สมจริง)
├── อุปกรณ์ที่ใช้ (มือถือ/PC, รุ่น, ขนาดจอ, ความเร็วเน็ต)
├── ทักษะ IT (ต่ำ/กลาง/สูง)
├── เป้าหมายการใช้งาน
├── Pain Points (จาก internet research)
└── พฤติกรรมการใช้งาน
```

ตัวอย่าง:
```
Persona 1: "ป้าสมศรี"
├── อายุ: 58, อาชีพ: แม่ค้าตลาด
├── อุปกรณ์: มือถือ Android เก่า, จอเล็ก, เน็ตช้า
├── ทักษะ IT: ต่ำ — ใช้แค่ LINE กับ Facebook
├── เป้าหมาย: สั่งของมาขายต่อ สั่งทีละเยอะ
├── Pain Points: อ่านตัวเล็กไม่ชัด, กลัวกดผิดแล้วเสียเงิน
└── พฤติกรรม: ถามลูกช่วยกด, screenshot ทุกขั้นตอน

Persona 2: "บอส ธนพล"
├── อายุ: 32, อาชีพ: เจ้าของ SME
├── อุปกรณ์: iPhone 16, MacBook, เน็ตไว
├── ทักษะ IT: สูง — ใช้หลายแพลตฟอร์ม
├── เป้าหมาย: สั่งซื้อ bulk, ต้องการ invoice/ใบกำกับภาษี
├── Pain Points: ไม่มีเวลา ต้องเร็ว, ต้อง track หลาย orders
└── พฤติกรรม: เปิดหลาย tab, ทำหลายอย่างพร้อมกัน
```

**Step 3: Journey Simulation**

จำลอง flow ทั้งเส้นของแต่ละ persona:
```
ป้าสมศรี — "สั่งซื้อสินค้า"
─────────────────────────────────
1. 📱 เปิดเว็บจาก link ใน LINE → หน้า homepage โหลดช้า (เน็ต 3G)
2. 🔍 พิมพ์ค้นหาสินค้า → สะกดผิด → ❌ GAP: ระบบไม่มี fuzzy search
3. 🛒 กดเพิ่มสินค้า → กดซ้ำ 2 ครั้ง → ❌ GAP: ไม่มี double-click prevention
4. 💳 หน้าชำระเงิน → ❌ GAP: QR code เล็กมากบนจอเล็ก
5. ⏰ scan QR ไม่ทัน → session หมดอายุ → ❌ GAP: ไม่มี session extend
6. 😰 กลับมาหน้าแรก → ของในตะกร้าหาย → ❌ GAP: cart ไม่ persist
7. 📞 โทรหา support → ❌ GAP: ไม่มีเบอร์โทรบนหน้าเว็บ
```

**Step 4: Gap Summary per Persona** — สรุปจำนวน gap + priority

### Internet-Enhanced Personas

Personas จะถูกเสริมด้วยข้อมูลจาก internet:
- ปัญหาจริงจาก user reviews → เพิ่มเป็น pain points
- ข้อมูลประชากร → ทำให้ demographic สมจริง
- accessibility data → เพิ่มข้อจำกัดด้าน device/ability

---

## 5. Internet Research Engine

### 3 Layers

**Layer 1: Problem Research**
- ค้นหา: ปัญหาที่ users จริงเจอในระบบประเภทเดียวกัน
- แหล่ง: Stack Overflow, Reddit, UX case studies, product reviews
- Output: รายการปัญหาจริง + ความถี่ + เกี่ยวข้องกับระบบเราไหม

**Layer 2: Compliance & Regulation**
- ค้นหา: กฎหมาย/มาตรฐานที่เกี่ยวข้อง
- ตัวอย่าง: PDPA, HIPAA, PCI-DSS, ธปท., WCAG, ISO 27001
- Output: checklist + ระบบเรา comply หรือยัง

**Layer 3: Competitive Analysis**
- ค้นหา: ระบบคู่แข่ง/ระบบคล้ายกัน ทำอะไรได้ดี/ไม่ดี
- ตัวอย่าง: features ที่คู่แข่งมี, best practices ใน domain
- Output: features/flows ที่คู่แข่งมี แต่ระบบเรายังไม่มี

### Research Report Format

```markdown
# 🌐 Internet Research Report: [topic]

## Layer 1: ปัญหาจริงที่ users เจอ
| # | ปัญหา | แหล่งที่มา | ความถี่ | เกี่ยวข้องกับระบบเราไหม |
|---|--------|-----------|---------|----------------------|

## Layer 2: กฎหมาย/มาตรฐานที่เกี่ยวข้อง
| # | กฎหมาย/มาตรฐาน | ข้อกำหนดสำคัญ | ระบบเรา comply หรือยัง |
|---|----------------|-------------|---------------------|

## Layer 3: คู่แข่ง/ระบบคล้ายกัน
| # | ระบบ | Feature ที่น่าสนใจ | ระบบเรามีหรือยัง |
|---|------|------------------|----------------|
```

### เครื่องมือ
- **Firecrawl** (หลัก) — scrape/search เว็บ, อ่าน documentation
- **Graph Brain** (เสริม) — save research results ไว้ใช้ซ้ำ

---

## 6. Edge Case Checklist

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

## 7. Tech Stack Auto-Detection

### รองรับ Tech Stacks

| Tech Stack | วิธี Detect | จุดที่สแกน |
|-----------|------------|-----------|
| **.NET Core / ASP.NET** | `.csproj`, `Program.cs`, `Startup.cs` | Controllers, DbContext, Middleware, SignalR, Background Services |
| **Node.js / Express** | `package.json` (express) | Routes, Middleware, Event handlers |
| **Next.js** | `next.config.*`, `app/` dir | Pages, API routes, Server Actions, Middleware |
| **Python / Django** | `manage.py`, `settings.py` | Views, Models, URLs, Signals |
| **Python / FastAPI** | `main.py` (FastAPI) | Routers, Dependencies, Background tasks |
| **Java / Spring** | `pom.xml`, `build.gradle` | Controllers, Services, Repositories, Event listeners |
| **Go** | `go.mod` | Handlers, Middleware, Routes |
| **PHP / Laravel** | `composer.json` (laravel) | Controllers, Models, Middleware, Jobs, Events |
| **Generic** | fallback | Entry points, Models, Config files |

### Detection Flow

```
Step 1: สแกน root directory หาไฟล์ระบุ framework
Step 2: ตรวจ dependencies (package.json, .csproj, pom.xml, etc.)
Step 3: ระบุ patterns เฉพาะ framework
Step 4: ใช้ patterns นั้นในการ scan flows
Step 5: ถ้าไม่รู้จัก → ใช้ generic analysis
```

---

## 8. Output Files & Tracking

### Output Files

| ไฟล์ | สร้างจาก command | Compatible กับ skill |
|------|-----------------|---------------------|
| `flow-discovery-report.md` | `/flow-scan` | ทุก skill |
| `flow-dive-[feature].md` | `/flow-dive` | system-design-doc, long-running |
| `scenarios-[feature].md` | `/flow-dive` | qa-ui-test |
| `flow-think-[topic].md` | `/flow-think` | long-running, system-design-doc |
| `flow-ideate-[idea].md` | `/flow-ideate` | system-design-doc, long-running, ui-mockup |
| `flow-personas-[feature].md` | `/flow-persona`, `/flow-ideate` | ui-mockup |
| `journeys-[feature].md` | `/flow-persona`, `/flow-ideate` | qa-ui-test, ui-mockup |
| `flow-research-[topic].md` | `/flow-research`, `/flow-ideate` | ทุก skill |
| `flow-export-[format]-[project]-[date].md` | `/flow-export` | มนุษย์อ่าน (ไม่ใช่ skill) |
| `flow-tracker.json` | ทุก command | `/flow-status` |

### flow-tracker.json Schema

```json
{
  "project": "project-name",
  "lastScan": "2026-03-26",
  "techStack": "dotnet-core",
  "summary": {
    "totalFindings": 12,
    "critical": 3,
    "important": 5,
    "niceToHave": 4
  },
  "findings": [
    {
      "id": "F001",
      "title": "ไม่มี double-click prevention",
      "description": "ผู้ใช้กดปุ่มซ้ำ 2 ครั้ง ทำให้สร้าง record ซ้ำ",
      "severity": "critical",
      "source": "persona-simulation",
      "persona": "ป้าสมศรี",
      "module": "checkout",
      "codeRef": "Controllers/CheckoutController.cs:45",
      "rootCause": "ไม่มี idempotency check",
      "impact": "สร้าง order ซ้ำ → charge เงินซ้ำ",
      "solutions": [
        "เพิ่ม disable button หลังกด",
        "เพิ่ม idempotency key",
        "เพิ่ม server-side duplicate check"
      ],
      "effort": "S",
      "status": "open",
      "handoffTo": null,
      "handoffCommand": "/qa-create-scenario"
    }
  ],
  "researchResults": [
    {
      "topic": "e-commerce checkout",
      "date": "2026-03-26",
      "file": "flow-research-e-commerce-checkout.md"
    }
  ],
  "personas": [
    {
      "name": "ป้าสมศรี",
      "feature": "checkout",
      "file": "flow-personas-checkout.md"
    }
  ]
}
```

---

## 9. Integration กับ Skills อื่น (Manual Handoff)

### Pipeline

```
flow-discovery (คิด)
    │
    ├──→ qa-ui-test (ทดสอบ)
    │    ├── ใช้ scenarios-[feature].md เป็น input
    │    ├── format: Given-When-Then (compatible กับ qa-tracker.json)
    │    └── คำสั่ง: /qa-create-scenario
    │
    ├──→ system-design-doc (ออกแบบ)
    │    ├── ใช้ flow-discovery-report.md เป็น input
    │    ├── อัพเดทเอกสารออกแบบระบบจาก findings
    │    └── คำสั่ง: /edit-section หรือ /brainstorm-design
    │
    ├──→ ui-mockup (ออกแบบ UI)
    │    ├── ใช้ journeys-[feature].md + flow-personas-[feature].md เป็น input
    │    ├── ปรับปรุง UI/UX จาก persona findings
    │    └── เปิด ui-mockup ปรับตาม findings
    │
    └──→ long-running (พัฒนา)
         ├── ใช้ section "Flow ที่ยังไม่มีแต่ควรพิจารณา" เป็น input
         ├── เพิ่ม feature ที่ขาดหาย
         └── คำสั่ง: /add-feature
```

---

## 10. BMAD Reference

เทคนิคใน plugin นี้ดัดแปลงจาก BMAD Method:

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
