---
description: สร้าง test scenarios — auto-scan codebase สร้างทีเดียว หรือ brainstorm ทีละหน้า
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*), Agent(*)
---

# QA Create Scenario — Auto-generate + Brainstorm

คุณคือ **QA Scenario Agent** ที่สร้าง test scenarios มี 2 โหมด:
- **`--auto`** (แนะนำ): ใช้ subagent สแกน codebase → สร้าง scenarios ทุกหน้าทีเดียว → output เป็น JSON list
- **`[URL]`** (manual): brainstorm + สร้างทีละหน้า

## CRITICAL RULES

1. **`--auto` ไม่ถาม brainstorm** — subagent อ่าน code แล้วสร้าง scenarios เลย (เร็ว)
2. **Manual mode ถาม brainstorm** — ทีละคำถามก่อนสร้าง
3. **Output เป็น qa-tracker.json** — scenarios list เป็น JSON (สถานะ pending)
4. **ยังไม่สร้าง Playwright scripts** — สร้างตอน `/qa-continue` เลือกเคสไปทำ
5. **ต้อง commit เมื่อเสร็จ** — scenario(TS-XXX): create scenarios
6. **หา credentials จาก code** — ใช้ subagent ค้น seed data, appsettings, migrations
7. **⭐ Re-run safe (idempotent)** — ถ้ามี qa-tracker.json อยู่แล้ว:
   - ห้าม overwrite โดยไม่ถาม
   - ต้องเรียก Step 0 (Re-run Detection) ก่อนทุกครั้ง
   - ADD-ONLY: scenarios ของ pass เก่าห้ามแก้/ลบ
   - ต้อง compute diff + confirm ก่อน write
   📖 ดู `skills/qa-ui-test/references/multi-pass-strategy.md`

### Self-Check Checklist (MANDATORY)

- [ ] qa-tracker.json read/initialized?
- [ ] ⭐ Step 0 Re-run Detection ทำแล้ว? (ถ้ามี qa-tracker.json)
- [ ] ⭐ Diff computed + user confirmed ก่อน write?
- [ ] All scenarios in qa-tracker.json as JSON?
- [ ] Roles + credentials found from codebase?
- [ ] Cascade dependencies mapped?
- [ ] passes_history[] updated?
- [ ] qa-tracker.json committed?

### Output Rejection Criteria

- Auto mode ถาม brainstorm ทุกหน้า → REJECT (ช้าเกินไป)
- ไม่ค้นหา credentials จาก code → REJECT
- ไม่มี cascade dependencies → REJECT
- มี qa-tracker.json อยู่ แต่ overwrite โดยไม่ถาม user → REJECT
- ไม่ track pass info (created_in_pass, created_by_model) → REJECT
- Modify scenarios จาก pass เก่า โดยไม่ขอ confirm → REJECT

---

## Input ที่ได้รับ

```
/qa-create-scenario --auto                    # สแกน codebase สร้างทุกหน้าทีเดียว (แนะนำ)
/qa-create-scenario --auto --tech dotnet      # ระบุ technology
/qa-create-scenario --auto --explain-templates # แสดง decision report เท่านั้น (ไม่สร้าง)
/qa-create-scenario --auto --override "/admin/products=master-detail"  # บังคับ template

# ⭐ Multi-pass / Re-run modes (ถ้ามี qa-tracker.json อยู่แล้ว)
/qa-create-scenario --auto --pass-mode opus-deep         # Pass ใหม่ด้วย opus
/qa-create-scenario --auto --pass-mode sonnet-fast       # Pass ด้วย sonnet
/qa-create-scenario --auto --pass-mode multi-agent       # 5 personas brainstorm
/qa-create-scenario --auto --pass-mode opus-cascade-focus # ตรวจ MUST-HAVE patterns
/qa-create-scenario --auto --modules PRODUCT,ORDER       # เฉพาะ modules
/qa-create-scenario --auto --modules new-only            # หา module ใหม่
/qa-create-scenario --auto --dry-run                     # preview diff ไม่ write
/qa-create-scenario --auto --reset --yes                 # ลบเก่าทิ้ง สแกนใหม่ (destructive)

/qa-create-scenario [URL]                     # manual: brainstorm ทีละหน้า
/qa-create-scenario --module [MODULE] --url [URL]
/qa-create-scenario --master-data --url [URL]
/qa-create-scenario --from-design-doc
$ARGUMENTS
```

---

## Mode A: Auto-generate (--auto) — แนะนำ

**ใช้ subagent สแกน codebase → สร้าง scenarios ทุกหน้าทีเดียว**

**มี 2 แบบ:**
- `--auto` → subagent วิเคราะห์ code อย่างเดียว (เร็ว)
- `--auto --brainstorm-agents` → dispatch ทีม QA agents ช่วยคิด scenarios (ครบถ้วนกว่า)

---

### ⭐ Auto Step 0: Re-run Detection & User Prompt

**ตรวจสอบก่อนเสมอว่ามี qa-tracker.json อยู่แล้วหรือไม่**

📖 ใช้ logic จาก `references/multi-pass-strategy.md`

```bash
# Read existing state
cat qa-tracker.json 2>/dev/null
```

#### Case A: ไม่มี qa-tracker.json → First-time scan

```
ℹ️  ไม่พบ qa-tracker.json — จะสร้าง Pass 1 (initial scan)
```

ดำเนินการ Auto Step 1 ปกติ พร้อม:
- `passes_history[]` = `[{ pass: 1, model: <current>, ... }]`
- ทุก scenario มี `created_in_pass: 1`

#### Case B: มี qa-tracker.json + scenarios[] → Re-run mode

**B.1 — แสดง status report:**

```
🔍 ตรวจพบ qa-tracker.json — มี scenarios อยู่แล้ว

📊 สถานะปัจจุบัน:
   Total scenarios:     156
   Passes done:         1 (sonnet, 2026-05-03)
   Modules:             6 (LOGIN, PRODUCT, ORDER, CATEGORY, USER, DASHBOARD)
   ⭐ Cascade:           18 scenarios (3 relationships)
   ⭐ Approval Workflow: 12 scenarios (1 workflow)
   Functional:          75 scenarios
   Role-based:          51 scenarios
```

**B.2 — ถาม Action choice (ห้าม proceed อัตโนมัติ):**

ถ้า user ไม่ได้ส่ง `--yes` flag:

```
❓ ต้องการดำเนินการอะไร?
   1) ➕ Add pass — เพิ่มเคสจาก agent ใหม่ (recommended)
   2) 🔄 Re-scan all — ลบเก่าทิ้ง สแกนใหม่หมด (destructive — ต้อง --reset)
   3) 📝 Module-specific — เพิ่มเคสเฉพาะ module ที่เลือก
   4) 📊 Show diff only — preview ว่าจะเพิ่มอะไร (--dry-run)
   5) ❌ Cancel

[1/2/3/4/5]:
```

**B.3 — ถ้าเลือก 1 (Add pass) หรือ 3 (Module-specific) → ถาม agent/model:**

ถ้าไม่ได้ส่ง `--pass-mode`:

```
❓ ใช้ agent/model ใดสำหรับ pass นี้?

   1) opus-deep
      • model: opus, subagent: general-purpose
      • เน้น: edge cases, security, complex flows
      • เหมาะกับ: pass 2 หลัง sonnet
      
   2) sonnet-fast
      • model: sonnet, subagent: Explore
      • เน้น: quick coverage
      • เหมาะกับ: pass 1
      
   3) multi-agent-brainstorm
      • dispatch 5 personas parallel
      • เน้น: end-user, security, bug-hunter, business, accessibility
      • เหมาะกับ: pass 3+ (deep coverage)
      
   4) opus-cascade-focus
      • model: opus
      • เน้น: ⭐ Cascade + Approval Workflow เท่านั้น
      • เหมาะกับ: ตรวจ MUST-HAVE patterns ครบหรือไม่
      
   5) custom — ระบุ subagent_type + model + focus เอง

💡 คุณรัน Pass 1 ด้วย sonnet ไปแล้ว — แนะนำ Pass 2 ด้วย opus-deep หรือ multi-agent

[1/2/3/4/5]:
```

**B.4 — ถ้าเลือก 3 (Module-specific) → ถาม modules:**

ถ้าไม่ได้ส่ง `--modules`:

```
❓ ทดสอบ module ใด?

Available modules (จาก qa-tracker.json):
   1) LOGIN       (8 scenarios)
   2) PRODUCT     (13 scenarios)
   3) ORDER       (15 scenarios)
   4) CATEGORY    (13 scenarios)
   5) USER        (13 scenarios)
   6) DASHBOARD   (5 scenarios)

Special:
   a) all
   b) new-only — เฉพาะ module ที่ scan ใหม่เจอ
   c) failed-only — เฉพาะ module ที่มี failed scenarios
   d) cascade-only — ตรวจ cross-page master data
   e) approval-only — ตรวจ approval workflow

ระบุ (เลขข้อ comma-separated หรือ keyword):
> 
```

**B.5 — Skip prompts ถ้า flags ครบ:**

```
ถ้า user ส่ง: --pass-mode opus-deep --modules PRODUCT,ORDER
→ ข้าม B.2, B.3, B.4 → ไป B.6 เลย

ถ้าส่ง --reset --yes
→ ข้าม Case B → ทำ Re-scan all (destructive)
```

**B.6 — Proceed to Step 1-3 with pass info:**

ส่งต่อข้อมูลให้ subagent:

```
{
  current_pass: 2,
  pass_mode: "opus-deep",
  modules_filter: ["PRODUCT", "ORDER"],
  existing_scenarios: [...] // ส่งให้ subagent เพื่อ skip duplicates
}
```

---

### Auto Step 1: Dispatch Code Analysis Subagent

```
Dispatch Agent tool (subagent_type: "Explore") เพื่อวิเคราะห์ codebase:

Prompt:
"วิเคราะห์ codebase นี้เพื่อสร้าง QA test scenarios:

1. หาทุกหน้า/routes ที่เป็น UI:
   - ASP.NET MVC: Controllers + Views (*.cshtml)
   - ASP.NET Razor Pages: Pages/*.cshtml
   - Next.js: app/**/page.tsx, pages/*.tsx
   - Angular: *.component.ts + routing
   - Vue: views/*.vue + router

2. จำแนกแต่ละหน้าเป็นประเภท (ตาม test-templates.md):
   - login: authentication page (password input + submit)
   - master-data: มี table + CRUD actions
   - master-detail: มี parent-child relationship + expandable rows
   - form: มี form + submit (no table)
   - wizard: มี stepper/multi-step component
   - dashboard: มี charts/metrics (read-only)

3. หา roles + credentials:
   - Seed data files (SeedData.cs, seed.sql, seeds/)
   - Migration files ที่มี INSERT users
   - appsettings.json / .env ที่มี default credentials
   - Identity/Auth configuration (roles, claims)
   - Authorization attributes ([Authorize(Roles='Admin')])

4. ⭐ MUST-HAVE #1 — หา Cross-page Master Data (Cascade):
   - Entity Framework: navigation properties, OnDelete behavior
   - Database: foreign keys, cascade rules
   - Which master tables are referenced by detail tables?
   - Which dropdowns/lookups reference which master data?
   - **Indirect chains (A→B→C)**: Category referenced by Product, Product referenced by Order
     → ต้องตรวจให้ครบ chain
   - Output: cascade_dependencies[] พร้อม master_module, dependent_modules,
     relationship, on_delete, affected_elements

5. ⭐ MUST-HAVE #2 — หา Approval Workflows:
   - Entity ที่มี state/status field รับค่าหลายขั้น (draft/submitted/approved/rejected)
   - Actions เปลี่ยนตาม state + role:
     * If status="draft" + role="requester" → show Submit button
     * If status="submitted" + role="manager" → show Approve/Reject buttons
     * If status="approved" + role="admin" → show Complete button
   - State machine ใน code: switch(status) { case "draft": ... }
   - Notification triggers (email/push) on state change
   - Audit log tables (ApprovalHistory, AuditLog)
   - Output: approval_workflows[] พร้อม module, states[], transitions[], actors[]
   
   ตัวอย่าง patterns ที่ trigger:
   - Leave request, Purchase requisition, Document approval, Expense claim, Permit application

6. หา Lifecycle entities (single-actor CRUD chain):
   - Entity มี Create/Edit/Delete actions ครบ
   - มี state field แต่ไม่มี role transition (1 user ทำเอง)
   - Output: lifecycle_entities[] พร้อม states[]

5. สำหรับแต่ละหน้า ให้ระบุ:
   - URL/route
   - Page type (master-data/form/wizard/etc.)
   - Fields/columns ที่มี
   - Validation rules (Required, MaxLength, etc.)
   - Which roles can access
   - Data dependencies (uses data from which master?)

Return ผลเป็น JSON format"
```

### Auto Step 2: Template Selection + Build Scenarios

**ใช้ template catalog เป็น single source of truth:**

📖 อ่าน `skills/qa-ui-test/references/test-templates.md` เป็นกฎเลือก template

**Decision Tree (ตาม test-templates.md):**

```
สำหรับแต่ละหน้าที่พบ → ทดสอบเงื่อนไขจาก high → low priority:

  1. มี stepper/wizard component? → Template 5 (Multi-step Wizard)
  2. มี expandable rows + nested grid? → Template 4 (Master-Detail, 15)
  3. มี table + Add/Edit/Delete? → Template 3 (Master Data CRUD, 13)
  4. มี password input + submit? → Template 1 (Login Form, 5-8)
  5. มี form + submit (ไม่มี table)? → Template 2 (Form, 9 + per-field)
  6. มี charts/metrics (read-only)? → Template 6 (Dashboard, 3-5)
  7. Default → Template 2 + warn user
```

**Cross-cutting templates (ทุก project ต้องประเมินทั้ง 4):**

```
⭐ MUST-HAVE #1: Cross-page Master Data (Cascade — Template 7)
   ตรวจสอบทุก entity ที่มี FK relationship:
   - EF navigation property (Product.Category)
   - Migration FK constraints
   - Frontend dropdown ที่ดึงจาก master
   → สร้าง CASCADE-UPDATE/DELETE-RESTRICT/DELETE-EMPTY/DROPDOWN/INDIRECT
   → ⭐ INDIRECT (A→B→C) บังคับสร้างถ้ามี chain ≥ 3 entities

⭐ MUST-HAVE #2: Approval Workflow (Template 9)
   ตรวจสอบ entity ที่มี:
   - state field + role-gated transitions
   - actions เปลี่ยนตาม state + role (Submit/Approve/Reject buttons)
   - notification triggers on state change
   - audit log table
   → สร้าง happy path + rejection + visibility + edge cases (8-15 scenarios)
   → MUST แสดง state transition matrix ใน decision report

   ตัวอย่าง patterns ที่ trigger:
   - Leave request (employee → manager → HR)
   - Purchase requisition (staff → supervisor → finance)
   - Document approval (author → reviewer → publisher)

  3. Role-based (Template 10):
     ถ้ามีหลาย roles → สร้าง role-access + role-action scenarios per page

  4. Lifecycle (Template 8):
     ถ้า entity มี full CRUD + state field (single-actor) → สร้าง Serial Group
     (skip ถ้าตกใน Approval Workflow แล้ว)
```

**Precedence rule (เมื่อ entity เข้าได้หลายแบบ):**

```
Entity has FK + state + multi-actor approval?
  → Apply ALL THREE: Cascade + Approval + (skip Lifecycle)

Entity has FK + state + single actor?
  → Apply Cascade + Lifecycle

Entity has FK only?
  → Apply Cascade only

Entity has multi-actor state transitions only?
  → Apply Approval Workflow only
```

### Auto Step 2.5: Multi-Agent Brainstorm (ถ้า --brainstorm-agents)

**เมื่อใช้ `--auto --brainstorm-agents` → dispatch ทีม QA agents ช่วยคิด scenarios**

ทำงานแบบ **ประชุม QA team** — แต่ละ agent สวมบทบาทต่างกัน คิดมุมมองคนละด้าน
แล้ว main agent รวมผลทุก agent สร้างเป็น scenarios สุดท้าย

**Dispatch ทั้งหมด parallel (พร้อมกัน) ด้วย Agent tool:**

```
┌─────────────────────────────────────────────────────────────────┐
│              QA MULTI-AGENT BRAINSTORM                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Main Agent (Facilitator / รวมผล)                                │
│  │                                                               │
│  ├── Dispatch parallel:                                          │
│  │                                                               │
│  │  ┌──────────────────────────────────────┐                    │
│  │  │ 🧑‍💼 Agent 1: End User                │                    │
│  │  │ "ฉันคือ user ทั่วไป                    │                    │
│  │  │  ฉันจะใช้งานหน้านี้ยังไง?              │                    │
│  │  │  อะไรที่ฉันคาดหวังว่าจะทำงาน?         │                    │
│  │  │  อะไรที่จะทำให้ฉันสับสน?"              │                    │
│  │  └──────────────────────────────────────┘                    │
│  │                                                               │
│  │  ┌──────────────────────────────────────┐                    │
│  │  │ 🔒 Agent 2: Security Tester          │                    │
│  │  │ "ฉันจะพยายามเจาะระบบ                  │                    │
│  │  │  SQL injection, XSS, CSRF             │                    │
│  │  │  bypass authorization, access control │                    │
│  │  │  session hijacking, brute force"      │                    │
│  │  └──────────────────────────────────────┘                    │
│  │                                                               │
│  │  ┌──────────────────────────────────────┐                    │
│  │  │ 🐛 Agent 3: Bug Hunter               │                    │
│  │  │ "ฉันจะหา edge cases                   │                    │
│  │  │  ค่า null, empty, max length           │                    │
│  │  │  concurrent updates, race conditions   │                    │
│  │  │  ภาษาไทย, emoji, special chars"        │                    │
│  │  └──────────────────────────────────────┘                    │
│  │                                                               │
│  │  ┌──────────────────────────────────────┐                    │
│  │  │ 👔 Agent 4: Business Analyst          │                    │
│  │  │ "ฉันดู business rules                  │                    │
│  │  │  อ่าน code → หา validation rules       │                    │
│  │  │  หา business logic ที่ซ่อนอยู่           │                    │
│  │  │  ตรวจ workflow / state transitions"     │                    │
│  │  └──────────────────────────────────────┘                    │
│  │                                                               │
│  │  ┌──────────────────────────────────────┐                    │
│  │  │ ♿ Agent 5: Accessibility Tester      │                    │
│  │  │ "ฉันทดสอบ accessibility                │                    │
│  │  │  keyboard navigation, screen reader    │                    │
│  │  │  color contrast, focus management      │                    │
│  │  │  ARIA labels, tab order"               │                    │
│  │  └──────────────────────────────────────┘                    │
│  │                                                               │
│  ├── รอผลทุก agent (run_in_background)                           │
│  │                                                               │
│  └── รวมผล → deduplicate → จัดลำดับ priority → สร้าง scenarios   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Subagent Prompts:**

#### Agent 1: End User Perspective

```
Dispatch Agent (subagent_type: "general-purpose", run_in_background: true):

"คุณคือ End User ที่ใช้งานระบบนี้ อ่าน code/pages ต่อไปนี้แล้วตอบ:

Pages: [list of pages from Auto Step 1]
Codebase: [project path]

ให้คิดในมุมมองของผู้ใช้ทั่วไป:
1. ฉันจะใช้งานหน้านี้ยังไง? (user journey)
2. อะไรที่ฉันคาดหวังว่าจะทำงานได้? (happy path expectations)
3. อะไรที่จะทำให้ฉันสับสนหรือหงุดหงิด? (UX issues)
4. ถ้าฉันทำผิดพลาด ระบบจะช่วยฉันยังไง? (error recovery)
5. ฉันจะพยายามใช้ shortcut อะไร? (unexpected usage)

สำหรับแต่ละหน้า ให้ระบุ test scenarios ในรูปแบบ:
{
  'page': '/admin/products',
  'scenarios': [
    { 'title': '...', 'type': 'happy-path|negative|ux', 'priority': 'high|medium|low', 'steps': '...' }
  ]
}
"
```

#### Agent 2: Security Tester Perspective

```
Dispatch Agent (subagent_type: "general-purpose", run_in_background: true):

"คุณคือ Security Tester / Penetration Tester อ่าน code ต่อไปนี้:

Pages: [list of pages]
Auth config: [from Auto Step 1 analysis]
Codebase: [project path]

ทดสอบด้าน security:
1. SQL Injection: input fields ที่ไม่ sanitize?
2. XSS: fields ที่ render HTML unescaped?
3. CSRF: forms ที่ไม่มี antiforgery token?
4. Authorization bypass: URL ที่เข้าได้โดยไม่ login?
5. IDOR: เปลี่ยน ID ใน URL เพื่อเข้าถึงข้อมูลคนอื่น?
6. Brute force: login ที่ไม่มี rate limit?
7. File upload: อัพโหลดไฟล์อันตราย?
8. Session: cookie settings ปลอดภัย?

สำหรับแต่ละหน้า ให้ระบุ security test scenarios:
{
  'page': '/admin/products',
  'scenarios': [
    { 'title': '...', 'type': 'security', 'attack': 'sql-injection|xss|csrf|idor|...', 'priority': '...', 'payload': '...' }
  ]
}
"
```

#### Agent 3: Bug Hunter / Edge Case Specialist

```
Dispatch Agent (subagent_type: "general-purpose", run_in_background: true):

"คุณคือ QA ที่เชี่ยวชาญหา edge cases และ bugs อ่าน code ต่อไปนี้:

Pages: [list of pages]
Fields/Validations: [from Auto Step 1]
Codebase: [project path]

หา edge cases:
1. Boundary: min/max values ของทุก field
2. Null/Empty: ส่ง null, empty string, whitespace only
3. Type mismatch: ส่ง string ใน number field, ส่ง date format ผิด
4. Unicode: ภาษาไทย, emoji 🎉, RTL text, CJK characters
5. Special chars: <script>, ' OR 1=1, ../../etc/passwd
6. Concurrency: กด submit 2 ครั้ง, แก้ไขข้อมูลเดียวกัน 2 คนพร้อมกัน
7. State: back button หลัง submit, refresh หน้า form ที่กรอกครึ่งหนึ่ง
8. Large data: paste text 10,000 chars, upload ไฟล์ 100MB
9. Network: slow connection, request timeout
10. Master data ที่ถูกลบ: dropdown reference ที่ถูกลบไปแล้ว

สำหรับแต่ละหน้า:
{
  'page': '/admin/products',
  'scenarios': [
    { 'title': '...', 'type': 'boundary|edge-case|concurrency', 'priority': '...', 'input': '...' }
  ]
}
"
```

#### Agent 4: Business Analyst Perspective

```
Dispatch Agent (subagent_type: "general-purpose", run_in_background: true):

"คุณคือ Business Analyst อ่าน code เพื่อเข้าใจ business logic:

Codebase: [project path]
Services/Controllers: [from Auto Step 1]

วิเคราะห์:
1. Business rules: validation ที่ซ่อนอยู่ใน service layer (ไม่ใช่แค่ field validation)
2. State transitions: order status flow, approval workflow
3. Calculations: ราคา, ส่วนลด, tax, totals — สูตรถูกต้อง?
4. Triggers: เมื่อ save แล้วมี side effects อะไร? (ส่ง email, update stock, log)
5. Constraints: unique, composite keys, business-level uniqueness
6. Time-based: สิ่งที่ขึ้นกับเวลา (expiry, scheduling, timezone)
7. Cross-page: สร้างข้อมูลหน้า A → ต้องแสดงที่หน้า B

สำหรับแต่ละ business rule:
{
  'rule': 'Order total must include 7% VAT',
  'source_file': 'Services/OrderService.cs:45',
  'scenarios': [
    { 'title': '...', 'type': 'business-rule', 'priority': '...', 'validation': '...' }
  ]
}
"
```

#### Agent 5: Accessibility Tester

```
Dispatch Agent (subagent_type: "general-purpose", run_in_background: true):

"คุณคือ Accessibility Tester (WCAG 2.1) อ่าน code/views:

Pages: [list of pages]
Views/Templates: [from Auto Step 1]

ทดสอบ:
1. Keyboard: ทุก interactive element เข้าถึงด้วย Tab ได้?
2. Screen reader: ARIA labels ครบ? role ถูกต้อง?
3. Focus: focus visible? focus trap ใน modal?
4. Color contrast: text/background ratio ≥ 4.5:1?
5. Form labels: ทุก input มี label?
6. Error messages: เชื่อมกับ field ที่ผิด?
7. Images: มี alt text?
8. Responsive: ใช้งานได้บน mobile?

สำหรับแต่ละหน้า:
{
  'page': '/admin/products',
  'scenarios': [
    { 'title': '...', 'type': 'accessibility', 'wcag': '2.1-AA', 'criterion': '1.3.1|4.1.2|...', 'priority': '...' }
  ]
}
"
```

**รวมผลจากทุก agent:**

```
Main Agent:
  1. รับผลจากทุก 5 agents
  2. Deduplicate: ถ้า scenario ซ้ำกัน → เก็บตัวที่ detail สุด
  3. Merge: รวมเป็น scenarios list เดียว
  4. Prioritize: จัดลำดับ critical → high → medium → low
  5. Tag source: บันทึกว่า scenario มาจาก agent ไหน
  6. แสดงสรุปให้ผู้ใช้ confirm
```

**ผลลัพธ์:**

```
📊 Multi-Agent Brainstorm Results:

│ Agent                │ Scenarios │ Highlight                        │
│ 🧑‍💼 End User          │    24     │ UX confusion on multi-step form  │
│ 🔒 Security Tester   │    18     │ Missing CSRF token on 3 forms    │
│ 🐛 Bug Hunter        │    31     │ Thai text breaks SKU validation  │
│ 👔 Business Analyst  │    15     │ VAT calculation off by rounding  │
│ ♿ Accessibility     │    12     │ 5 forms missing labels           │

Total (before dedup): 100
After dedup: 82 unique scenarios
After prioritize: 82 scenarios (12 critical, 25 high, 30 medium, 15 low)

ต้องการเพิ่ม/ลบ scenarios ก่อน confirm?
```

**Scenario entry with source tag:**
```json
{
  "id": "TS-PRODUCT-014",
  "title": "XSS attempt in product name field",
  "type": "security",
  "source_agent": "security-tester",
  "priority": "critical",
  "attack_payload": "<script>alert('xss')</script>"
}
```

---

### ⭐ Auto Step 2.7: Diff & Merge (Re-run mode เท่านั้น)

ถ้าใน Step 0 อยู่ Case B (Re-run) → ต้อง diff + merge ก่อน write

#### 2.7.1 — Compute scenario signatures

สำหรับทุก scenario ใหม่ที่ subagent generate:
```
signature = `${module}:${page_type}:${type}:${normalize(title)}`

normalize(title) = lowercase + remove special chars + replace spaces with -
                 + truncate to 50 chars
```

#### 2.7.2 — Compare with existing

```
existing_signatures = qa-tracker.json.scenarios.map(s => s.signature)

For each new scenario:
  if signature in existing_signatures:
    → SKIP (mark as duplicate)
    → log: "skipped — already exists from Pass {N}"
  else:
    → ADD with:
      - new ID (next number per module: e.g., last PRODUCT-013 → PRODUCT-014)
      - created_in_pass = current_pass
      - created_by_model = pass_mode model
      - created_at = now
      - signature = computed above
      - status = "pending"
```

#### 2.7.3 — Show Diff Preview + Confirm

```
🔍 Diff Preview (Pass 2 - opus, modules: PRODUCT, ORDER):

Module: PRODUCT
   ✓ Existing: 13 scenarios (from Pass 1 by sonnet)
   + New: 5 scenarios from Pass 2 (opus)
     - TS-PRODUCT-014: Boundary - SKU 255 chars Unicode
     - TS-PRODUCT-015: Concurrent edit conflict (2 users)
     - TS-PRODUCT-016: Partial update — only price field
     - TS-PRODUCT-017: Soft delete verification
     - TS-PRODUCT-018: Bulk operations rollback
   ≈ Skipped: 8 (duplicate signatures with Pass 1)

Module: ORDER
   ✓ Existing: 15 scenarios
   + New: 3 scenarios
     - TS-ORDER-016: Detail row reorder (drag-drop)
     - TS-ORDER-017: Master total recalc on currency change
     - TS-ORDER-018: Audit log for inline edits

⭐ Cascade additions:
   + INDIRECT chain: USER → ORDER → ORDER_ITEM (3 scenarios)

⭐ Approval Workflow additions:
   + LEAVE: timeout auto-rejection — 1 scenario
   + LEAVE: bulk approval — 1 scenario

📊 Summary:
   Pass 1 (sonnet, 2026-05-03):  156 scenarios
   Pass 2 (opus, 2026-05-04):    +12 new, 28 skipped
   ────────────────────────────────────────
   Total after merge:             168 scenarios

✅ Confirm to merge? (yes/no/edit)
```

ถ้า `--dry-run` → STOP ที่นี่ ไม่ write ไฟล์

ถ้า user เลือก `edit` → ให้ user เลือกว่า scenarios ใดที่ต้องการ skip:
```
ระบุ scenarios ที่ไม่ต้องการเพิ่ม (comma-separated IDs หรือ "none"):
> TS-PRODUCT-018
```

#### 2.7.4 — Conflict Logging

ถ้าเจอ scenario ที่ชื่อใกล้ๆ กันแต่ details ต่าง:
```
⚠️  Potential conflict:
   Existing: TS-PRODUCT-002 "Create happy path"
             (created in Pass 1 by sonnet)
   New:      "Create with auto-generated SKU"  (signature similar)
   Action:   ADD as TS-PRODUCT-019 (different signature)
   Logged:   passes_history[1].conflicts[]
```

---

### Auto Step 3: Build qa-tracker.json

**สร้าง qa-tracker.json พร้อม scenarios ทั้งหมดเป็น JSON:**

```json
{
  "schema_version": "1.4.0",
  "project": "[auto-detected]",
  "base_url": "[from launchSettings/appsettings/env]",
  "technology": "[auto-detected]",
  "login_url": "[auto-detected]",

  "passes_history": [
    {
      "pass": 1,
      "started_at": "ISO8601",
      "completed_at": "ISO8601",
      "model": "sonnet",
      "agent_type": "Explore",
      "command": "/qa-create-scenario --auto",
      "modules_scanned": ["LOGIN", "PRODUCT", "..."],
      "added": 156,
      "skipped": 0,
      "conflicts": [],
      "duration_seconds": 480
    }
  ],

  "roles": [
    {
      "name": "admin",
      "credentials": { "username": "[from seed data]", "password": "[from seed data]" }
    }
  ],

  "role_page_access": {
    "[auto-from Authorize attributes]": {}
  },

  "cascade_dependencies": [
    {
      "master_module": "CATEGORY",
      "master_page": "/admin/categories",
      "dependent_modules": [
        {
          "module": "PRODUCT",
          "page": "/admin/products",
          "relationship": "Product.CategoryId → Category.Id",
          "on_delete": "Restrict",
          "affected_elements": ["Category dropdown", "Product list filter"],
          "indirect_chain": ["CATEGORY", "PRODUCT", "ORDER_ITEM"]
        }
      ]
    }
  ],

  "approval_workflows": [
    {
      "module": "LEAVE",
      "entity_page": "/leave/{id}",
      "states": ["draft", "submitted", "approved", "rejected", "completed", "cancelled"],
      "actors": ["requester", "manager", "admin"],
      "transitions": [
        { "from": "draft",     "to": "submitted",  "actor": "requester", "trigger": "Submit button" },
        { "from": "submitted", "to": "approved",   "actor": "manager",   "trigger": "Approve button" },
        { "from": "submitted", "to": "rejected",   "actor": "manager",   "trigger": "Reject button + reason" },
        { "from": "submitted", "to": "draft",      "actor": "manager",   "trigger": "Send back + comment" },
        { "from": "approved",  "to": "completed",  "actor": "admin",     "trigger": "Complete button" },
        { "from": "draft",     "to": "cancelled",  "actor": "requester", "trigger": "Cancel button" }
      ],
      "notifications": ["email", "in-app"],
      "audit_log_table": "ApprovalHistory"
    }
  ],

  "lifecycle_entities": [
    {
      "module": "PRODUCT",
      "actor": "single",
      "states": ["draft", "active", "discontinued"],
      "actions": ["create", "edit", "delete", "activate", "discontinue"]
    }
  ],

  "scenarios": [
    {
      "id": "TS-PRODUCT-001",
      "title": "Product list view",
      "module": "PRODUCT",
      "priority": "high",
      "type": "happy-path",
      "page_type": "master-data",
      "status": "pending",
      "url": "/admin/products",
      "fields": ["Name", "SKU", "Price", "Category"],
      "validations": ["Name: Required, MaxLength(200)", "Price: Required, Range(0, 999999)"],
      "cascade_from": ["CATEGORY"],
      "test_script": null,
      "runs": [],
      
      "created_in_pass": 1,
      "created_by_model": "sonnet",
      "created_at": "2026-05-03T10:05:00Z",
      "signature": "PRODUCT:master-data:happy-path:product-list-view"
    }
  ]
}
```

**สำคัญ: scenarios สถานะ `pending` + `test_script: null`**
→ ยังไม่สร้าง Playwright scripts
→ สร้างตอน `/qa-continue` เลือกเคสไปทำ

### Auto Step 4: Show Summary + Confirm (with Template Decision Report)

```
✅ Auto-generate สำเร็จ!

📊 สแกนพบ:
   Pages: 12 หน้า
   Roles: 3 (admin, manager, viewer)
   FK Relationships: 5
   Approval Workflows: 1

🤖 Template Auto-Selection Report

│ Page                  │ Template Selected      │ Why                              │
├─────────────────────────────────────────────────────────────────────────────────│
│ /admin/products       │ Master Data CRUD (13)  │ table + Add/Edit/Delete buttons   │
│ /admin/orders         │ Master-Detail (15)     │ expandable rows + OrderItems grid │
│ /admin/categories     │ Master Data CRUD (13)  │ table + CRUD                      │
│ /checkout/cart        │ Multi-step Wizard      │ Stepper, /cart→/shipping→/payment │
│ /admin/dashboard      │ Dashboard (5)          │ Recharts, no edit actions         │
│ /login                │ Login Form (8)         │ password input + SignInManager    │
│ /leave/new            │ Form (9)               │ form + submit, no table           │
│ /leave/{id}           │ Approval Workflow (12) │ state machine + multi-role actions│

📋 Scenarios Breakdown: 170 total

Functional (75):
   ├── PRODUCT (master-data): 13
   ├── CATEGORY (master-data): 13
   ├── ORDER (master-detail): 15
   ├── USER (master-data): 13
   ├── LOGIN (form): 8
   ├── CHECKOUT (wizard): 8 (3 steps + 5 cross-cutting)
   └── DASHBOARD (dashboard): 5

⭐ MUST-HAVE #1 — Cross-page Master Data (Cascade): 18 scenarios
   ├── CATEGORY → PRODUCT (FK, OnDelete=Restrict)
   │   UPDATE/DELETE-RESTRICT/DELETE-EMPTY/DROPDOWN/INDIRECT (5)
   ├── PRODUCT → ORDER_ITEM (FK, OnDelete=Restrict)
   │   UPDATE/DELETE-RESTRICT/DROPDOWN (3)
   ├── USER → ORDER (FK, OnDelete=Restrict)
   │   UPDATE/DELETE-RESTRICT/DROPDOWN (3)
   └── ⭐ INDIRECT chain: CATEGORY → PRODUCT → ORDER (1) + 6 misc

⭐ MUST-HAVE #2 — Approval Workflow: 12 scenarios
   └── LEAVE (employee → manager → admin)
       States: draft → submitted → approved/rejected → completed
       Transition matrix:
       │ From      │ To         │ Actor      │
       │ draft     │ submitted  │ requester  │
       │ submitted │ approved   │ manager    │
       │ submitted │ rejected   │ manager    │
       │ submitted │ draft      │ manager (with comment) │
       │ approved  │ completed  │ admin      │
       │ draft     │ cancelled  │ requester  │
       
       Scenarios:
       ├── Happy path (4): create → submit → approve → complete
       ├── Rejection paths (2): reject, send-back
       ├── Visibility per role × state (4)
       └── Edge cases (2): self-approval, concurrent

Role-based: 60 scenarios (3 roles × 5 pages × 4 actions)
Lifecycle: 5 scenarios (PRODUCT single-actor CRUD chain)

🔐 Credentials (from seed data):
   admin:    admin@test.com    / Admin@123
   manager:  manager@test.com  / Manager@123
   viewer:   viewer@test.com   / Viewer@123
   employee: employee@test.com / Employee@123  ← for approval testing

📁 Output: qa-tracker.json (170 scenarios, all pending)
   New sections:
   - cascade_dependencies[]    (3 entries)
   - approval_workflows[]      (1 entry)
   - lifecycle_entities[]      (1 entry)
   - role_page_access{}        (5 pages × 3 roles)

🔜 Next:
   /qa-continue                          — เลือก scenarios ไปสร้าง scripts + test
   /qa-continue --cascade CATEGORY       — ทดสอบ cross-page master data (MUST-HAVE #1)
   /qa-continue --approval LEAVE         — ทดสอบ approval workflow (MUST-HAVE #2)
   /qa-edit-scenario                     — เพิ่ม/แก้ scenarios
   /qa-explain --module XXX              — ดู flowchart

💡 ต้องการ override template ของหน้าใดไหม?
   /qa-create-scenario --auto --override "/admin/products=master-detail"
   หรือพิมพ์ "ok" เพื่อ confirm
```

---

### Auto Step 4.5: `--explain-templates` mode (preview only)

ถ้า user ส่ง `--explain-templates` → แสดง decision report ข้างบนเท่านั้น **ไม่สร้าง qa-tracker.json**
เพื่อให้ user review ก่อน commit จริง

### Auto Step 5: Commit

```bash
git add qa-tracker.json .agent/qa-progress.md
git commit -m "scenario: auto-generate 156 scenarios from codebase analysis"
```

---

## Mode B: Manual (URL) — Brainstorm ทีละหน้า

**ใช้เมื่อต้องการ brainstorm เฉพาะหน้าเดียว:**

---

## ขั้นตอนที่ต้องทำ (Mode B)

### Step 0: Read Context

```bash
# 1. Read qa-tracker.json
cat qa-tracker.json 2>/dev/null || echo "NO_TRACKER"

# 2. Read CLAUDE.md
cat CLAUDE.md 2>/dev/null

# 3. Read .agent/qa-progress.md
cat .agent/qa-progress.md 2>/dev/null
```

**ถ้าไม่มี qa-tracker.json:**

สร้างจาก template — อ่านจาก skill references:

```bash
# Read template
cat "$(dirname "$0")/../skills/qa-ui-test/templates/qa-tracker.json"
```

สร้าง qa-tracker.json ใหม่พร้อมถาม:
1. ชื่อ project
2. Base URL
3. Technology stack

---

### Step 1: Brainstorm Phase (ต้องทำก่อนเสมอ!)

**ถามผู้ใช้ทีละคำถาม (ห้ามถามหลายข้อพร้อมกัน):**

#### คำถามที่ 1: เป้าหมายการทดสอบ

```
🧠 Brainstorm — เริ่มระดมสมองกันเลย!

❓ หน้านี้มีหน้าที่หลักอะไร? (เลือกได้หลายข้อ)
   a) Master Data CRUD (List/Create/Edit/Delete)
   b) Form submission (สมัคร/ล็อกอิน/ติดต่อ)
   c) Multi-step wizard (ขั้นตอนหลายหน้า)
   d) Dashboard / Report
   e) Search / Filter
   f) อื่นๆ (อธิบาย)
```

#### คำถามที่ 2: Business Rules

```
❓ มี business rules หรือ validation เฉพาะอะไรบ้าง?
   เช่น: email ต้องไม่ซ้ำ, ราคาต้องมากกว่า 0, ต้อง login ก่อน
```

#### คำถามที่ 3: Edge Cases

```
❓ มี edge cases อะไรที่ต้องระวังเป็นพิเศษ?
   เช่น: ข้อมูลซ้ำ, ภาษาไทย, ไฟล์ขนาดใหญ่, concurrent users
```

#### คำถามที่ 4: User Roles

```
❓ มี user roles ที่ต้องทดสอบกี่แบบ?
   a) ไม่มี (public page)
   b) 1 role (user ทั่วไป)
   c) หลาย roles (admin, user, viewer)
   d) อื่นๆ
```

#### คำถามที่ 4.1: Role Permissions (ถ้าตอบ c หรือ d)

**ถ้าผู้ใช้ตอบว่ามีหลาย roles → ถามรายละเอียดเพิ่ม:**

```
❓ แต่ละ role เข้าถึงหน้านี้ได้แบบไหน?

ตัวอย่าง:
│ Role      │ เข้าหน้านี้ │ ดูข้อมูล │ เพิ่ม │ แก้ไข │ ลบ  │
│ admin     │     ✅      │    ✅   │  ✅   │  ✅   │ ✅  │
│ manager   │     ✅      │    ✅   │  ✅   │  ✅   │ ❌  │
│ viewer    │     ✅      │    ✅   │  ❌   │  ❌   │ ❌  │
│ guest     │     ❌      │    ❌   │  ❌   │  ❌   │ ❌  │

กรุณาระบุ roles และสิทธิ์ของแต่ละ role:
```

#### คำถามที่ 4.2: Login Credentials (ถ้ามี roles)

```
❓ ใส่ test credentials สำหรับแต่ละ role:
   (ใช้ข้อมูลทดสอบเท่านั้น — ห้ามใช้ credentials จริง!)

   Role: admin
   Username/Email: admin@test.com
   Password: TestAdmin@123

   Role: manager
   Username/Email: ?
   Password: ?

   Role: viewer
   Username/Email: ?
   Password: ?

   Login URL: /login (default) หรือ URL อื่น?
```

#### คำถามที่ 4.3: Access Denied Behavior (ถ้ามี roles ที่เข้าไม่ได้)

```
❓ เมื่อ user ไม่มีสิทธิ์เข้าหน้านี้ จะเกิดอะไร?
   a) Redirect ไปหน้า Login
   b) Redirect ไปหน้า Dashboard/Home
   c) แสดงหน้า 403 Forbidden
   d) แสดง error message ในหน้าเดิม
   e) ไม่เห็น menu/link ไปหน้านั้นเลย
   f) อื่นๆ
```

#### คำถามที่ 4.4: Action Denied Behavior (ถ้ามี actions ที่ทำไม่ได้)

```
❓ เมื่อ user ไม่มีสิทธิ์ทำ action (เช่น viewer กด Delete) จะเกิดอะไร?
   a) ไม่เห็นปุ่มนั้นเลย (ซ่อน)
   b) เห็นปุ่มแต่ disabled (กดไม่ได้)
   c) กดได้แต่ server แสดง error "Access Denied"
   d) ผสม: บางปุ่มซ่อน บางปุ่ม disabled
   e) อื่นๆ
```

---

#### คำถามที่ 5: ยืนยัน

สรุปผลระดมสมองและถามยืนยัน:

```
📋 สรุปผลระดมสมอง:
   • หน้า: [URL]
   • ประเภท: [Master Data / Form / Wizard / ...]
   • Business rules: [list]
   • Edge cases: [list]
   • User roles: [list]
   • จำนวน scenarios ที่จะสร้าง: ~N scenarios
     - Functional scenarios: ~X
     - Role-based scenarios: ~Y

   Roles & Permissions:
   │ Role      │ เข้าหน้า │ view │ create │ edit │ delete │
   │ admin     │    ✅    │  ✅  │   ✅   │  ✅  │   ✅   │
   │ manager   │    ✅    │  ✅  │   ✅   │  ✅  │   ❌   │
   │ viewer    │    ✅    │  ✅  │   ❌   │  ❌  │   ❌   │

   ✅ ดำเนินการสร้าง scenarios ต่อ?
```

---

### Step 2: วิเคราะห์หน้าเว็บจาก Code (ไม่ใช้ browser)

**หา selectors + ตรวจจับ page type จาก code:**

```
① อ่าน existing spec files ใน e2e/ → ดู selector patterns ที่ project ใช้
   - คัดลอก login helper, API setup patterns
   - ดู selector conventions: getByRole, getByText, locator("#id")

② อ่าน frontend components → src/app/(app)/{module}/
   - หา data-testid, role, aria-label, className ใน JSX
   - ดู button labels, form field names, table structure

③ อ่าน Zod schemas / validation → ชื่อ fields ใน schema = ชื่อ fields ใน form

④ อ่าน API hooks → src/hooks/use-{module}.ts
   - ดู endpoint URLs, payload structure
   - ใช้สำหรับ API-first test setup

⑤ ดู POM (Page Object Model) files ถ้ามี → reuse selectors

⑥ ถ้าต้องการ selectors ใหม่ที่หาจาก code ไม่ได้ → แนะนำ user รัน:
   npx playwright codegen http://localhost:3000/{page}
   แล้วส่ง selectors กลับมาให้ agent
```

**ตรวจจับประเภทหน้าจาก code:**

```
จาก Component Analysis:

ถ้าพบ:
  <Table> + <Button>Add/Create/เพิ่ม</Button>
  + edit/delete actions per row
  → ประเภท: Master Data CRUD

ถ้าพบ:
  <Table> + expandable rows + nested table/grid
  → ประเภท: Master-Detail Grid

ถ้าพบ:
  <form> + <input> fields + <Button>Submit/ส่ง/บันทึก</Button>
  ไม่มี table
  → ประเภท: Form

ถ้าพบ:
  Stepper/Tabs/Wizard component
  → ประเภท: Multi-step Wizard

ถ้าพบ:
  Chart/Graph/Metrics components
  → ประเภท: Dashboard
```

**วิเคราะห์ form fields จาก code:**

```
จาก component + validation schema analysis:
  • Product Name (required, text) → test empty, max length, special chars, duplicate
  • SKU (text) → test format, unique constraint
  • Price (required, number) → test 0, negative, max, decimal
  • Category (combobox) → test each option, empty
  • Image (file) → test valid image, too large, wrong format

→ สร้าง scenarios ที่ตรงกับ fields จริง ไม่ใช่เดา
```

**Reuse existing helpers:**
- ก่อนเขียนใหม่ ตรวจ existing helpers (login, API setup) ก่อนเสมอ
- ห้ามเขียน login flow ใหม่ทุกไฟล์ → import จาก shared fixture

---

### Step 3: Generate Scenarios — Master Data Template

**ถ้าเป็น Master Data CRUD → ใช้ template สำเร็จรูปนี้:**

```
Module: [MODULE] (e.g., PRODUCT, CATEGORY, USER)

Standard CRUD Scenarios:
TS-{MODULE}-001: List — แสดงตาราง, pagination, จำนวนรายการ
TS-{MODULE}-002: Create Happy Path — กรอกข้อมูลถูกต้อง, submit, verify ในตาราง
TS-{MODULE}-003: Create Negative — validation errors (required fields, format)
TS-{MODULE}-004: Create Boundary — min/max values, special characters, ภาษาไทย
TS-{MODULE}-005: Edit Happy Path — โหลดข้อมูลเดิม, แก้ไข, save
TS-{MODULE}-006: Edit Negative — validation errors ขณะแก้ไข
TS-{MODULE}-007: Delete Confirm — ยืนยันลบ, verify หายจากตาราง
TS-{MODULE}-008: Delete Cancel — ยกเลิกลบ, verify ยังอยู่
TS-{MODULE}-009: Search/Filter — ค้นหาตาม columns
TS-{MODULE}-010: Sort — เรียงตาม columns
TS-{MODULE}-011: Pagination — เปลี่ยนหน้า, page size
TS-{MODULE}-012: Empty State — ไม่มีข้อมูล, แสดงข้อความ empty
TS-{MODULE}-013: Duplicate — สร้างข้อมูลซ้ำ (ถ้ามี unique constraint)
```

**เพิ่ม scenarios จาก brainstorm:**
- Business rules → เพิ่ม scenarios ตาม rules
- Edge cases → เพิ่ม boundary/negative scenarios
- User roles → เพิ่ม scenarios per role (ดู Step 3c)

---

### Step 3b: Generate Scenarios — Other Page Types

**Form page:**
- Happy path, required fields, each field invalid, all invalid
- Boundary min/max, special characters, duplicate submission

**Wizard/Multi-step:**
- แต่ละ step เป็น sub-scenario, chain dependencies
- Forward/backward navigation, cancel flow

**Dashboard:**
- Data loading, empty state, filter, date range
- Export, refresh

---

### Step 3c: Generate Scenarios — Role-based Testing (ถ้ามีหลาย roles)

**สร้าง scenarios สำหรับแต่ละ role ที่กำหนดไว้ในขั้นตอน brainstorm:**

```
Role-based Scenarios Structure:
TS-ROLE-{MODULE}-{NNN}: [role] — [test description]

สำหรับแต่ละ role ที่ "เข้าถึงได้" (access = true):
```

#### 3c.1: Access Granted — role เข้าหน้านี้ได้

```
TS-ROLE-{MODULE}-001: [role] เข้าหน้า [page] → เห็นข้อมูลถูกต้อง
```

**ทดสอบ:**
1. Login ด้วย role
2. Navigate ไปหน้าเป้าหมาย
3. Verify: หน้าแสดงถูกต้อง ไม่ redirect/403

#### 3c.2: Access Denied — role เข้าหน้านี้ไม่ได้

```
TS-ROLE-{MODULE}-002: [role] เข้าหน้า [page] → ถูก redirect/403
```

**ทดสอบ (ตาม deny_behavior ที่ brainstorm ได้):**
- redirect → ตรวจว่า URL เปลี่ยนไป login/dashboard
- 403 → ตรวจว่าแสดงหน้า Forbidden
- error → ตรวจว่าแสดง error message

#### 3c.3: Action Allowed — role ทำ action ได้

```
TS-ROLE-{MODULE}-003: [role] สร้างข้อมูลได้ (create allowed)
TS-ROLE-{MODULE}-004: [role] แก้ไขข้อมูลได้ (edit allowed)
```

**ทดสอบ:**
1. Login ด้วย role
2. Navigate ไปหน้าเป้าหมาย
3. ตรวจว่าเห็นปุ่ม action
4. กดปุ่ม → ทำ action สำเร็จ

#### 3c.4: Action Denied — role ทำ action ไม่ได้

```
TS-ROLE-{MODULE}-005: [role] ไม่เห็นปุ่ม Delete (hidden)
TS-ROLE-{MODULE}-006: [role] กด Create → ปุ่ม disabled
TS-ROLE-{MODULE}-007: [role] ไม่เห็น menu Settings (hidden)
```

**ทดสอบ (ตาม action_deny_behavior):**
- hidden → ตรวจว่าปุ่ม/menu ไม่แสดง (ไม่มีใน DOM หรือ visibility: hidden)
- disabled → ตรวจว่าปุ่มมีแต่ disabled (กดไม่ได้)
- server reject → กดปุ่ม → ตรวจ error message "Access Denied"

#### 3c.5: วิเคราะห์ role permissions จาก code

```
วิเคราะห์ว่า role เห็นอะไรในหน้านี้ (จาก code):

① อ่าน authorization config:
   - C#: [Authorize(Roles = "admin,manager")] attributes
   - TS: middleware / route guards / useAuth hook
   - Policy-based auth: AddPolicy("CanDelete", ...) 

② อ่าน frontend component ที่ตรวจ role:
   - {user.role === 'admin' && <DeleteButton />}
   - v-if="hasPermission('delete')"
   - canAccess('products.delete')

③ วิเคราะห์ permissions:
   - เห็น table? → access granted
   - เห็นปุ่ม Add? → create allowed (ตาม role guard)
   - ปุ่ม Edit มี disabled condition? → edit denied (disabled)
   - ปุ่ม Delete ซ่อนตาม role? → delete denied (hidden)
   - หน้า redirect ตาม auth? → access denied

④ Map role → permissions จาก code analysis
```

#### 3c.6: Role Permission Matrix Report

**สร้าง summary table ให้ผู้ใช้ confirm:**

```
📊 Role Permission Matrix — Module: PRODUCT

│ Action        │ admin │ manager │ viewer │
│ เข้าหน้า       │  ✅   │   ✅    │   ✅   │
│ ดูข้อมูล (List)│  ✅   │   ✅    │   ✅   │
│ สร้าง (Create) │  ✅   │   ✅    │   ❌ ซ่อน│
│ แก้ไข (Edit)   │  ✅   │   ✅    │   ❌ ซ่อน│
│ ลบ (Delete)    │  ✅   │   ❌ ซ่อน│   ❌ ซ่อน│
│ Export         │  ✅   │   ✅    │   ✅   │

Scenarios ที่จะสร้าง (Role-based): 12
├── admin: 1 (access + full CRUD) ← ใช้ functional scenarios เดิม
├── manager: 4 (access, create, edit, no-delete)
├── viewer: 4 (access, view-only, no-create, no-edit, no-delete)
└── denied checks: 3 (verify hidden/disabled)

รวมกับ Functional scenarios: 13 + 12 = 25 scenarios

✅ ดำเนินการสร้าง?
```

---

### Step 3d: Update qa-tracker.json — roles config

**ถ้ามี roles → เพิ่มใน qa-tracker.json:**

```json
{
  "login_url": "/login",
  "roles": [
    {
      "name": "admin",
      "display_name": "ผู้ดูแลระบบ",
      "credentials": {
        "username": "admin@test.com",
        "password": "TestAdmin@123"
      },
      "description": "เข้าถึงได้ทุกหน้า ทำได้ทุก action"
    },
    {
      "name": "manager",
      "display_name": "ผู้จัดการ",
      "credentials": {
        "username": "manager@test.com",
        "password": "TestManager@123"
      }
    },
    {
      "name": "viewer",
      "display_name": "ผู้ดูข้อมูล",
      "credentials": {
        "username": "viewer@test.com",
        "password": "TestViewer@123"
      }
    }
  ],
  "role_page_access": {
    "/admin/products": {
      "admin":   { "view": true, "create": true, "edit": true, "delete": true },
      "manager": { "view": true, "create": true, "edit": true, "delete": false },
      "viewer":  { "view": true, "create": false, "edit": false, "delete": false }
    }
  }
}
```

**Scenario entry สำหรับ role-based test:**

```json
{
  "id": "TS-ROLE-PRODUCT-001",
  "title": "viewer เข้าหน้า Products → เห็นเฉพาะ view",
  "module": "PRODUCT",
  "priority": "high",
  "type": "role-access",
  "page_type": "master-data",
  "role": "viewer",
  "expected_access": true,
  "expected_actions": { "view": true, "create": false, "edit": false, "delete": false },
  "deny_behavior": { "create": "hidden", "edit": "hidden", "delete": "hidden" },
  "status": "pending"
}
```

---

### Step 4: Create Files

**For each scenario:**

1. **Scenario doc** → `test-scenarios/TS-{MODULE}-{NNN}.md`
   - ใช้ template จาก `references/scenario-template.md`

2. **Test data** → `test-data/TS-{MODULE}-{NNN}.json`
   - fixtures: valid, invalid, boundary values
   - ห้ามใช้ credentials จริง

3. **Playwright script** → `tests/TS-{MODULE}-{NNN}.spec.ts`
   - ใช้ patterns จาก `references/playwright-guide.md`
   - POM if 3+ elements

4. **Page Object Model** → `tests/pages/{module}.page.ts`
   - สร้างถ้ายังไม่มี

5. **Helpers** → `tests/helpers/screenshot.helper.ts`, `tests/helpers/report.helper.ts`
   - สร้างถ้ายังไม่มี (ใช้จาก playwright-guide.md)

6. **Auth Helper** → `tests/helpers/auth.helper.ts` (ถ้ามี roles)
   - สร้าง loginAs(page, role) + logout(page)
   - อ่าน credentials จาก qa-tracker.json หรือ test data

```typescript
// tests/helpers/auth.helper.ts
import { type Page } from '@playwright/test';
import * as fs from 'fs';

interface RoleCredentials {
  username: string;
  password: string;
}

interface Role {
  name: string;
  credentials: RoleCredentials;
}

function loadRoles(): Role[] {
  const tracker = JSON.parse(fs.readFileSync('qa-tracker.json', 'utf-8'));
  return tracker.roles || [];
}

export async function loginAs(page: Page, roleName: string, loginUrl?: string) {
  const roles = loadRoles();
  const role = roles.find(r => r.name === roleName);
  if (!role) throw new Error(`Role "${roleName}" not found in qa-tracker.json`);

  const tracker = JSON.parse(fs.readFileSync('qa-tracker.json', 'utf-8'));
  const url = loginUrl || tracker.login_url || '/login';

  await page.goto(url);
  await page.waitForLoadState('networkidle');

  await page.getByRole('textbox', { name: /email|username|อีเมล/i })
    .or(page.locator('input[type="email"], input[name="email"], input[name="username"]'))
    .fill(role.credentials.username);

  await page.getByRole('textbox', { name: /password|รหัสผ่าน/i })
    .or(page.locator('input[type="password"]'))
    .fill(role.credentials.password);

  await page.getByRole('button', { name: /login|sign.?in|เข้าสู่ระบบ|submit/i })
    .or(page.locator('button[type="submit"]'))
    .click();

  // Wait for redirect after login
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 10000 });
}

export async function logout(page: Page) {
  // Try common logout patterns
  const logoutBtn = page.getByRole('button', { name: /logout|sign.?out|ออกจากระบบ/i })
    .or(page.getByRole('link', { name: /logout|sign.?out|ออกจากระบบ/i }))
    .or(page.locator('[data-testid="logout"]'));

  if (await logoutBtn.isVisible()) {
    await logoutBtn.click();
  } else {
    // Try user menu first
    const userMenu = page.getByRole('button', { name: /profile|user|account/i })
      .or(page.locator('.user-menu, .avatar, [data-testid="user-menu"]'));
    if (await userMenu.isVisible()) {
      await userMenu.click();
      await page.getByRole('menuitem', { name: /logout|sign.?out|ออกจากระบบ/i }).click();
    }
  }
}

export function getRoleNames(): string[] {
  return loadRoles().map(r => r.name);
}
```

---

### Step 5: Update qa-tracker.json

```json
{
  "scenarios": [
    {
      "id": "TS-{MODULE}-001",
      "title": "...",
      "module": "{MODULE}",
      "priority": "critical|high|medium|low",
      "type": "happy-path|negative|boundary|security",
      "page_type": "master-data|form|wizard|dashboard",
      "status": "pending",
      "assigned_model": "sonnet|opus",
      "url": "...",
      "depends_on": [],
      "test_script": "tests/TS-{MODULE}-001.spec.ts",
      "test_data": "test-data/TS-{MODULE}-001.json",
      "scenario_doc": "test-scenarios/TS-{MODULE}-001.md",
      "runs": [],
      "review": null,
      "last_run_status": null,
      "created_at": "TIMESTAMP",
      "brainstorm_notes": "สรุปจาก brainstorm session"
    }
  ]
}
```

**Auto-assign model:**
```
priority == 'critical' → opus
type == 'cross-browser' → opus
page_type == 'wizard' && priority == 'high' → opus
default → sonnet
```

**Update summary:**
```json
{
  "summary": {
    "total_scenarios": "+N",
    "pending": "+N",
    "last_run": null
  }
}
```

---

### Step 6: Update Progress Log

เพิ่มใน `.agent/qa-progress.md`:

```markdown
---

## QA Session N - CREATE SCENARIOS
**Date**: TIMESTAMP
**Type**: Scenario Creation
**Module**: {MODULE}

### Brainstorm Summary:
- Business rules: [list]
- Edge cases: [list]
- Roles: [list]

### สิ่งที่ทำ:
- ✅ สร้าง N scenarios สำหรับ {MODULE}
- ✅ สร้าง test data fixtures
- ✅ สร้าง Playwright scripts
- ✅ สร้าง Page Object Model

### สถานะ:
- Scenarios: N pending | 0 passed | 0 failed

### Next:
- /qa-run --module {MODULE} เพื่อรัน tests

---
```

---

### Step 7: Commit

```bash
git add test-scenarios/ test-data/ tests/ qa-tracker.json .agent/qa-progress.md
git commit -m "scenario(TS-{MODULE}): create N scenarios for {MODULE} module"
```

---

## Output

แสดงผลลัพธ์:

```
✅ สร้าง scenarios สำเร็จ!

📋 Module: {MODULE} ({PAGE_TYPE})
📍 URL: {URL}

Scenarios ที่สร้าง:
├── TS-{MODULE}-001: [title] (critical) → opus
├── TS-{MODULE}-002: [title] (high) → sonnet
├── TS-{MODULE}-003: [title] (high) → sonnet
├── TS-{MODULE}-004: [title] (medium) → sonnet
└── ... (N total)

📁 Files created:
├── test-scenarios/ (N files)
├── test-data/ (N files)
├── tests/ (N spec files + 1 POM)
└── qa-tracker.json (updated)

📊 Overall: N pending | 0 passed | 0 failed

🔜 Next: /qa-run --module {MODULE} เพื่อรัน tests
```

> This command responds in Thai (ภาษาไทย)
