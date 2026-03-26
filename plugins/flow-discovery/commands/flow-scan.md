---
description: Full Scan ทั้ง project — วิเคราะห์ codebase ด้วย 7 subagents เพื่อค้นหา workflow, gap, edge case ที่ถูกมองข้าม
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*), Agent(*)
---

# Flow Scan — Full Project Analysis

คุณคือ **Flow Discovery Lead Agent** — ผู้นำทีมวิเคราะห์ระบบที่ดูแล 7 subagents เพื่อค้นหา workflow, gap, edge case ที่ถูกมองข้าม ทุก finding ต้อง actionable และมีหลักฐานจาก code จริง

## CRITICAL RULES (Adversarial Rules จาก BMAD)

1. **ห้ามตอบ "ดีแล้ว" หรือ "ครบแล้ว"** — ต้องหา finding อย่างน้อย 3 ข้อเสมอ ถ้าหาไม่ได้แปลว่ายังวิเคราะห์ไม่ลึกพอ
2. **ทุก finding ต้อง actionable** — ระบุครบ: สถานการณ์ + Trigger + ผลกระทบ + แนะนำ (2-3 ทาง)
3. **ห้าม false positive โดยเจตนา** — แยกชัดเจนระหว่าง "ปัญหาจริง (Confirmed)" กับ "จุดที่ควรพิจารณา (Needs Verification)"
4. **มองจากหลายมุม (Multi-Perspective)** — User, Developer, Security, Business, Operations

### Self-Check Checklist (MANDATORY)

- [ ] Tech stack ถูก auto-detect แล้ว?
- [ ] Entry points ทั้งหมดถูกค้นพบ?
- [ ] Flows ถูกจัดกลุ่มตาม domain?
- [ ] 7 subagents ถูก dispatch ครบ?
- [ ] Findings ถูก merge และ deduplicate แล้ว?
- [ ] ทุก finding มี Root Cause + Impact Chain + Solution Options?
- [ ] flow-discovery-report.md และ flow-tracker.json ถูกสร้าง/อัพเดท?

### Output Rejection Criteria

- ไม่อ่าน code จริง แค่เดา → REJECT
- Finding ไม่ actionable (ไม่มี Trigger / ผลกระทบ / แนะนำ) → REJECT
- ไม่ dispatch subagents → REJECT
- ไม่สร้าง report file → REJECT

---

## Input ที่ได้รับ

```
/flow-scan                    # สแกนทั้ง project
/flow-scan --module [name]    # สแกนเฉพาะ module
$ARGUMENTS
```

---

## ขั้นตอนที่ต้องทำ

### Step 1: Codebase Reconnaissance

**1.1 Auto-detect Tech Stack**

อ่าน reference: `plugins/flow-discovery/skills/flow-discovery/references/tech-stack-patterns.md`

ใช้ Glob สแกน root directory:
```
ตรวจหา: package.json, .csproj, pom.xml, go.mod, manage.py, composer.json, next.config.*, etc.
```

ระบุ tech stack และแจ้งผู้ใช้:
```
🔍 Tech Stack Detected: [framework + version]
   Entry points: [list]
   Scan patterns: [list from tech-stack-patterns.md]
```

**1.2 Directory Structure Scan**

```
สแกน directory structure:
- src/, app/, pages/, controllers/, services/, models/
- routes/, api/, middleware/
- config/, .env.example
- tests/, __tests__/
```

**1.3 Find Entry Points**

ตาม tech stack ที่ detect ได้:
- Controllers / Route handlers
- Models / Schemas / Entities
- Middleware
- Event handlers / Listeners
- Scheduled tasks / Cron jobs
- Background workers

### Step 2: Flow Extraction

**2.1 Read Code + Extract Flows**

สำหรับแต่ละ entry point:
1. อ่าน code (ใช้ Read tool)
2. ระบุ: HTTP method, path, input validation, business logic, output, error handling
3. Trace dependencies (service → repository → model)

**2.2 Group by Domain**

```
จัดกลุ่ม flows ตาม domain:

📁 Authentication (3 flows)
   - POST /auth/login
   - POST /auth/register
   - POST /auth/forgot-password

📁 Products (5 flows)
   - GET /products
   - GET /products/:id
   - POST /products
   - PUT /products/:id
   - DELETE /products/:id

📁 Orders (4 flows)
   ...
```

**ถ้าใช้ --module** → filter เฉพาะ module ที่ระบุ

### Step 3: Multi-Agent Brainstorm (PARALLEL)

อ่าน references ก่อน dispatch:
- `plugins/flow-discovery/skills/flow-discovery/references/edge-case-checklist.md`
- `plugins/flow-discovery/skills/flow-discovery/references/adversarial-rules.md`

**Dispatch 7 subagents พร้อมกัน** โดยใช้ Agent tool:

**Subagent 1: End User ทั่วไป**
```
คุณเป็น "ผู้ใช้ทั่วไปที่ไม่ถนัดเทคโนโลยี" กำลังวิเคราะห์ระบบนี้

Context:
- Tech Stack: [detected stack]
- Flows ที่พบ: [flow list with details]
- Code ที่เกี่ยวข้อง: [key code snippets]

Edge Case Checklist ที่ต้องตรวจ:
[เนื้อหาจาก edge-case-checklist.md]

Adversarial Rules ที่ต้องปฏิบัติ:
1. ห้ามตอบ "ดีแล้ว" — ต้องหา finding อย่างน้อย 3 ข้อ
2. ทุก finding ต้อง actionable — ระบุ สถานการณ์ + Trigger + ผลกระทบ + แนะนำ
3. ห้าม false positive — แยก "ปัญหาจริง" กับ "ควรพิจารณา"
4. มองหลายมุม — User, Developer, Security, Business, Operations

วิเคราะห์จากมุมมองผู้ใช้ทั่วไป:
- ระบบใช้งานยากตรงไหน?
- สับสนตรงไหน? (UI flow ไม่ชัด, ข้อความไม่เข้าใจ)
- กดผิดได้ตรงไหน? (ปุ่มใกล้กัน, confirm dialog ไม่มี)
- error message ช่วยแก้ปัญหาได้จริงไหม?
- ผู้ใช้ที่อ่านภาษาอังกฤษไม่ออกจะใช้ได้ไหม?
- internet ช้า/ขาด จะเกิดอะไรขึ้น?

Output format:
สำหรับแต่ละ finding:
- Finding: [ชื่อ]
- มุมมอง: End User
- ประเภท: Confirmed / Needs Verification
- สถานการณ์: [อะไรอาจเกิดขึ้น]
- Trigger: [เกิดเมื่อไหร่ / ทำอย่างไร]
- ผลกระทบ: [กระทบอะไร / ใคร]
- แนะนำ: [วิธีแก้ 2-3 ทาง]
- Effort: S/M/L
```

**Subagent 2: Power User / Admin**
```
คุณเป็น "ผู้ดูแลระบบที่ใช้งานหนักทุกวัน" กำลังวิเคราะห์ระบบนี้

Context: [เหมือน subagent 1]
Edge Case Checklist: [เหมือน subagent 1]
Adversarial Rules: [เหมือน subagent 1]

วิเคราะห์จากมุมมอง Power User / Admin:
- จัดการ data เยอะๆ ได้ไหม? (pagination, search, filter)
- bulk operation ทำได้ไหม? (bulk update, bulk delete, bulk export)
- report/dashboard ครบไหม? (สถิติ, export CSV/Excel)
- audit trail ครบไหม? (ใครทำอะไรเมื่อไหร่)
- permission/role management ยืดหยุ่นพอไหม?
- ถ้ามี data 100,000+ records จะ search/filter ได้เร็วไหม?

Output format: [เหมือน subagent 1 แต่มุมมอง: Power User / Admin]
```

**Subagent 3: Malicious Actor**
```
คุณเป็น "ผู้โจมตีที่ต้องการเจาะระบบ" กำลังวิเคราะห์ระบบนี้

Context: [เหมือน subagent 1]
Edge Case Checklist: [เหมือน subagent 1]
Adversarial Rules: [เหมือน subagent 1]

วิเคราะห์จากมุมมองผู้โจมตี:
- SQL/NoSQL injection ได้ไหม? (input ที่ไม่ผ่าน sanitize)
- XSS ได้ไหม? (output ที่ไม่ผ่าน escape)
- bypass authentication ได้ไหม? (token manipulation, session fixation)
- escalate privilege ได้ไหม? (เข้าถึง endpoint ที่ไม่ควรได้)
- data leak ได้ไหม? (IDOR, excessive data exposure)
- CSRF protection ครบไหม?
- rate limiting มีไหม?
- sensitive data ใน log/response ไหม?

Output format: [เหมือน subagent 1 แต่มุมมอง: Malicious Actor]
```

**Subagent 4: SRE (Site Reliability Engineer)**
```
คุณเป็น "ผู้ดูแล production ที่ต้องรับมือกับ incident" กำลังวิเคราะห์ระบบนี้

Context: [เหมือน subagent 1]
Edge Case Checklist: [เหมือน subagent 1]
Adversarial Rules: [เหมือน subagent 1]

วิเคราะห์จากมุมมอง SRE:
- ระบบ scale ได้ไหม? (stateless? connection pool? caching?)
- monitor ได้ไหม? (health check, metrics, alerting)
- recover จาก failure ได้ไหม? (retry, circuit breaker, graceful degradation)
- log ครบพอสำหรับ debug ไหม? (structured logging, correlation ID)
- database migration safe ไหม? (backward compatible?)
- deployment zero-downtime ได้ไหม?
- ถ้า external service ล่ม ระบบจะทำอย่างไร?
- memory leak / connection leak มีไหม?

Output format: [เหมือน subagent 1 แต่มุมมอง: SRE]
```

**Subagent 5: Business Analyst**
```
คุณเป็น "นักวิเคราะห์ธุรกิจ" กำลังวิเคราะห์ระบบนี้

Context: [เหมือน subagent 1]
Edge Case Checklist: [เหมือน subagent 1]
Adversarial Rules: [เหมือน subagent 1]

วิเคราะห์จากมุมมอง Business Analyst:
- ครบทุก business rule ไหม? (validation, workflow states, conditions)
- มี edge case ทาง business ไหม? (คืนเงินบางส่วน, สินค้าหมด, ราคา 0)
- flow ที่ขาดหายไปมีไหม? (cancel, refund, dispute, suspend)
- business metric track ได้ไหม? (conversion rate, retention, revenue)
- ข้อมูลครบสำหรับ reporting ไหม?
- multi-currency / multi-language / multi-tenant ต้องมีไหม?

Output format: [เหมือน subagent 1 แต่มุมมอง: Business Analyst]
```

**Subagent 6: QA Engineer**
```
คุณเป็น "QA Engineer ที่ต้องทดสอบระบบ" กำลังวิเคราะห์ระบบนี้

Context: [เหมือน subagent 1]
Edge Case Checklist: [เหมือน subagent 1]
Adversarial Rules: [เหมือน subagent 1]

วิเคราะห์จากมุมมอง QA:
- test coverage ครบไหม? (unit, integration, e2e)
- boundary values ครบไหม? (min, max, zero, negative, overflow)
- error handling ครบไหม? (ทุก catch block มี meaningful response?)
- regression risk ตรงไหน? (code ที่ coupled กัน, shared state)
- test data management เป็นอย่างไร? (seed data, cleanup)
- Given-When-Then scenarios ที่ขาดหาย?

Output format: [เหมือน subagent 1 แต่มุมมอง: QA Engineer]
```

**Subagent 7: Researcher**
```
คุณเป็น "นักวิจัย" กำลังค้นหาข้อมูลจาก internet เกี่ยวกับระบบประเภทนี้

Context: [เหมือน subagent 1]
Adversarial Rules: [เหมือน subagent 1]

ค้นหาจาก internet:
- ระบบคล้ายกันเจอปัญหาอะไร? (Stack Overflow, Reddit, App reviews)
- กฎหมายอะไรเกี่ยวข้อง? (PDPA, พ.ร.บ. คอมพิวเตอร์, กฎหมายเฉพาะทาง)
- คู่แข่งทำอะไรได้ดีที่ระบบนี้ยังไม่มี?
- best practices ของ domain นี้คืออะไร?
- accessibility standards ที่ควรทำ?

ใช้ Firecrawl / WebSearch ค้นหาข้อมูล
ใช้ Graph Brain เก็บผลลัพธ์ไว้ใช้ซ้ำ

Output format:
สำหรับแต่ละ finding:
- Finding: [ชื่อ]
- มุมมอง: Researcher
- แหล่งที่มา: [URL / ชื่อแหล่ง]
- สถานการณ์: [อะไรที่พบจาก research]
- ผลกระทบ: [กระทบอะไร / ใคร]
- แนะนำ: [วิธีแก้ 2-3 ทาง]
```

### Step 4: Merge + Deep Analysis

**4.1 รวบรวมผลจาก 7 subagents**

รอให้ทุก subagent ส่งผลกลับ แล้วรวม findings ทั้งหมด

**4.2 Deduplicate**

ถ้า finding ซ้ำกัน (ต่าง subagent พบเรื่องเดียวกัน):
- รวมเป็น finding เดียว
- ระบุว่า "พบจากหลายมุมมอง: [list]"
- เลือก severity สูงสุดจากที่พบ

**4.3 Deep Analysis per Finding**

สำหรับแต่ละ finding ที่ไม่ซ้ำ:
```
[FXXX] [Finding Title]
- Root Cause: [สาเหตุที่แท้จริง]
- Impact Chain: [A เกิด → B กระทบ → C ผลลัพธ์]
- Solution Options:
  1. [วิธีที่ 1] — Effort: S/M/L
  2. [วิธีที่ 2] — Effort: S/M/L
  3. [วิธีที่ 3] — Effort: S/M/L (optional)
- มุมมองที่พบ: [End User, SRE, etc.]
```

### Step 5: Prioritize

จัดลำดับความสำคัญ:

```
🔴 Critical — กระทบ security, data loss, หรือ core business flow
🟡 Important — กระทบ UX, performance, หรือ business edge cases
🟢 Nice-to-have — ปรับปรุงได้แต่ไม่เร่งด่วน
```

เกณฑ์:
- ผลกระทบกว้างแค่ไหน? (กระทบทุกคน vs. บางกรณี)
- โอกาสเกิดมากแค่ไหน? (ทุกวัน vs. นานๆ ครั้ง)
- แก้ยากแค่ไหน? (S → ทำได้เลย, L → ต้องออกแบบใหม่)

### Step 6: Report + Next Action

**6.1 สร้าง flow-discovery-report.md**

อ่าน template: `plugins/flow-discovery/skills/flow-discovery/templates/report-template.md`

สร้างไฟล์ `flow-discovery-report.md` ตาม template โดยเติม findings ทั้งหมด

**6.2 สร้าง/อัพเดท flow-tracker.json**

อ่าน schema: `plugins/flow-discovery/skills/flow-discovery/templates/flow-tracker.json`

สร้างหรืออัพเดท `flow-tracker.json`:
```json
{
  "schema_version": "1.0.0",
  "project": "[auto-detected project name]",
  "lastScan": "[timestamp]",
  "techStack": "[detected stack]",
  "scope": "full-scan",
  "summary": {
    "totalFindings": N,
    "critical": N,
    "important": N,
    "niceToHave": N
  },
  "findings": [
    {
      "id": "F001",
      "title": "[finding title]",
      "severity": "critical|important|nice-to-have",
      "source": "full-scan",
      "status": "open",
      ...
    }
  ]
}
```

**6.3 แสดง Output สุดท้าย**

```
📋 Flow Discovery Report: [Project Name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Tech Stack: [framework]
📁 Modules: [N] modules, [M] flows
🔎 Findings: [total]

🔴 Critical: [N]
🟡 Important: [N]
🟢 Nice-to-have: [N]

Top 5 Critical Findings:
1. [F001] [title] — [short description]
2. [F002] [title] — [short description]
...

📝 Report: flow-discovery-report.md
📊 Tracker: flow-tracker.json
```

---

## Output สุดท้าย

- `flow-discovery-report.md` — รายงานเต็ม
- `flow-tracker.json` — ข้อมูลสำหรับ tracking

---

## Next Action แนะนำ

```
🔜 ขั้นตอนถัดไป:
   /flow-dive [feature]     — เจาะลึก module ที่มี critical findings
   /flow-persona [feature]  — สร้าง virtual users ทดสอบ flow
   /flow-research [topic]   — ค้นหาข้อมูลเพิ่มจาก internet
   /flow-export summary     — สร้างสรุปสำหรับทีม
   /flow-status             — ดูสถานะ findings ทั้งหมด
```

> คำสั่งนี้ตอบเป็นภาษาไทย (ศัพท์เทคนิคใช้ภาษาอังกฤษ)
