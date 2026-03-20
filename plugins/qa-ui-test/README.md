# QA UI Test Plugin v2.0.0 — คู่มือการใช้งาน

> AI-powered QA UI Testing — auto-scan codebase สร้าง scenarios ทีเดียว,
> multi-agent brainstorm, cascade testing, role-based permission testing,
> ทำทีละ module เหมือน long-running agent, Playwright MCP + CLI

---

## สารบัญ

1. [ภาพรวม](#1-ภาพรวม)
2. [การติดตั้ง](#2-การติดตั้ง)
3. [ต้องรันเว็บหรือไม่?](#3-ต้องรันเว็บหรือไม่)
4. [Quick Start — 3 ขั้นตอน](#4-quick-start--3-ขั้นตอน)
5. [คำสั่งทั้งหมด (7 คำสั่ง)](#5-คำสั่งทั้งหมด)
   - [/qa-create-scenario](#51-qa-create-scenario--สร้าง-scenarios)
   - [/qa-continue](#52-qa-continue--เลือก-module-สร้าง-scripts-รัน-test)
   - [/qa-run](#53-qa-run--รัน-tests)
   - [/qa-retest](#54-qa-retest--รีเทสและรายงานผล)
   - [/qa-edit-scenario](#55-qa-edit-scenario--แก้ไขเพิ่ม-scenarios)
   - [/qa-status](#56-qa-status--ดูสถานะ)
   - [/qa-explain](#57-qa-explain--อธิบาย-test-plan)
6. [Multi-Agent Brainstorm](#6-multi-agent-brainstorm)
7. [Role-based Permission Testing](#7-role-based-permission-testing)
8. [Cascade Testing](#8-cascade-testing)
9. [ประเภทหน้าที่รองรับ](#9-ประเภทหน้าที่รองรับ)
10. [Workflow ตัวอย่าง — E-Commerce 4 วัน](#10-workflow-ตัวอย่าง)
11. [qa-tracker.json — หัวใจของระบบ](#11-qa-trackerjson)
12. [FAQ — คำถามที่พบบ่อย](#12-faq)

---

## 1. ภาพรวม

```
/qa-create-scenario --auto          ← สแกน code สร้าง scenarios ทั้งหมด
         │                             (ไม่ต้องรันเว็บ)
         ▼
/qa-continue --module PRODUCT       ← เลือก module → สร้าง scripts → test
         │                             (ต้องรันเว็บ)
         ▼
/qa-retest --review                 ← แก้ bug → รีเทส → opus review
         │
         ▼
/qa-edit-scenario                   ← เพิ่ม scenarios ด้วย brainstorm (เมื่อต้องการ)
```

### ทำอะไรได้บ้าง

| ความสามารถ | คำอธิบาย |
|-----------|---------|
| Auto-scan codebase | Subagent อ่าน code → สร้าง scenarios ทุกหน้าทีเดียว |
| Multi-agent brainstorm | 5 agents สวมบทบาทต่างกันช่วยคิด scenarios |
| Continue ทีละ module | เลือก module → สร้าง Playwright scripts → test |
| Role-based testing | ทดสอบแต่ละ role เข้าถึงหน้า/actions ได้ต่างกัน |
| Cascade testing | แก้/ลบ master data → ตรวจหน้าที่ใช้ข้อมูลนั้น |
| Master-Detail Grid | Expand row, inline editing, sync verification |
| Opus Review | ตรวจ test quality + coverage gaps + แนะนำเคสเพิ่ม |
| Parallel execution | Subagent-driven parallel test runs |

---

## 2. การติดตั้ง

### Prerequisites

- Node.js 18+
- Claude Code CLI
- **Playwright MCP** (แนะนำ): `plugin:playwright:playwright`

### ติดตั้ง Playwright MCP (แนะนำ)

```
1. เปิด Claude Code
2. พิมพ์ /mcp
3. เลือก "Add MCP Server"
4. เลือก plugin:playwright:playwright
```

หรือ:
```bash
claude mcp add playwright -- npx @anthropic-ai/mcp-playwright
```

### ติดตั้ง Playwright CLI (สำหรับรัน tests)

```bash
npm install -D @playwright/test
npx playwright install chromium
```

---

## 3. ต้องรันเว็บหรือไม่?

**คำตอบสั้น: ขึ้นอยู่กับคำสั่ง**

| คำสั่ง | ต้องรันเว็บ? | เหตุผล |
|--------|:-----------:|--------|
| `/qa-create-scenario --auto` | **ไม่ต้อง** | อ่าน source code อย่างเดียว |
| `/qa-create-scenario --auto --brainstorm-agents` | **ไม่ต้อง** | agents อ่าน code อย่างเดียว |
| `/qa-create-scenario [URL]` | **ต้อง** | ใช้ MCP เปิดหน้าเว็บจริง |
| `/qa-continue` | **ต้อง** | สร้าง scripts + รัน Playwright test |
| `/qa-run` | **ต้อง** | รัน Playwright test |
| `/qa-retest` | **ต้อง** | รัน Playwright test ซ้ำ |
| `/qa-edit-scenario` | **ไม่ต้อง** | แก้ไข JSON + scripts |
| `/qa-status` | **ไม่ต้อง** | อ่าน qa-tracker.json |
| `/qa-explain` | **ไม่ต้อง** | สร้าง flowchart จาก JSON |

### สรุปง่ายๆ

```
สร้าง scenarios:  ไม่ต้องรันเว็บ  ← อ่าน code
รัน tests:        ต้องรันเว็บ     ← เปิด browser ทดสอบจริง
ดูสถานะ/แก้ไข:     ไม่ต้องรันเว็บ  ← อ่าน/เขียน JSON
```

### วิธีรันเว็บ (ตอนจะ test)

```bash
# Terminal 1: รัน dev server
dotnet run                    # .NET
npm run dev                   # Next.js / React
python manage.py runserver    # Django

# Terminal 2: ใช้ Claude Code
/qa-continue --module PRODUCT
```

---

## 4. Quick Start — 3 ขั้นตอน

### ขั้นตอนที่ 1: สร้าง Scenarios (ไม่ต้องรันเว็บ)

```bash
/qa-create-scenario --auto
```

Agent จะ:
1. สแกน codebase → หาทุกหน้า, roles, credentials, cascade relationships
2. สร้าง scenarios ทั้งหมดเป็น JSON ใน `qa-tracker.json`
3. **ไม่ถาม brainstorm** — สร้างอัตโนมัติจาก code

```
✅ Auto-generate สำเร็จ!

📋 Scenarios: 156 total
├── Functional: 98 (13 modules)
├── Role-based: 36 (3 roles)
└── Cascade: 22 (5 relationships)

🔐 Credentials (from seed data):
   admin: admin@test.com / Admin@123

🔜 Next: รันเว็บ แล้วสั่ง /qa-continue
```

### ขั้นตอนที่ 2: รันเว็บ + เลือก Module ทำ Test

```bash
# Terminal 1: รันเว็บก่อน
dotnet run

# Terminal 2: Claude Code
/qa-continue
```

Agent จะแสดง:
```
📋 เลือก module:
│ 1 │ LOGIN      │ form          │ 8 pending  │
│ 2 │ PRODUCT    │ master-data   │ 13 pending │
│ 3 │ ORDER      │ master-detail │ 15 pending │
│ ...

💡 แนะนำ: เริ่มจาก LOGIN (dependency ของหน้าอื่น)
```

เลือก: `1` (LOGIN)

Agent จะ:
1. ใช้ MCP เปิดหน้า Login → snapshot → ดู elements จริง
2. สร้าง Playwright scripts สำหรับ 8 scenarios
3. รัน tests → แสดงผล
4. อัพเดท qa-tracker.json

```
✅ Module LOGIN: 7/8 passed (88%)
🔜 Next: /qa-continue (ทำ module ถัดไป)
```

### ขั้นตอนที่ 3: ทำ Module ถัดไป ไปเรื่อยๆ

```bash
/qa-continue --module PRODUCT
/qa-continue --module ORDER
/qa-continue --cascade CATEGORY    # ทดสอบ cascade
/qa-retest                          # แก้ failed
/qa-retest --review                 # opus review
```

---

## 5. คำสั่งทั้งหมด

### 5.1 `/qa-create-scenario` — สร้าง Scenarios

สร้าง test scenarios ทั้งหมดจาก codebase

#### วิธีเรียก

```bash
# แบบ Auto — สแกน code สร้างทีเดียว (ไม่ต้องรันเว็บ)
/qa-create-scenario --auto

# Auto + Multi-agent brainstorm (ไม่ต้องรันเว็บ)
/qa-create-scenario --auto --brainstorm-agents

# Auto + ระบุ technology
/qa-create-scenario --auto --tech dotnet

# แบบ Manual — brainstorm ทีละหน้า (ต้องรันเว็บ)
/qa-create-scenario http://localhost:5000/admin/products
/qa-create-scenario --master-data --url /admin/products
/qa-create-scenario --master-detail --url /admin/orders
```

#### เปรียบเทียบ Auto vs Manual

| | `--auto` | `[URL]` manual |
|--|---------|---------------|
| **ต้องรันเว็บ?** | **ไม่** | ต้อง |
| **ถาม brainstorm?** | **ไม่** | ถาม 5 คำถาม |
| **จำนวนหน้า** | **ทุกหน้าทีเดียว** | ทีละหน้า |
| **หา credentials** | **จาก code อัตโนมัติ** | ถามผู้ใช้ |
| **สร้าง scripts** | **ไม่ (สร้างตอน /qa-continue)** | สร้างเลย |
| **เหมาะกับ** | **เริ่มต้นโปรเจค** | เพิ่มหน้าเฉพาะทีหลัง |

#### `--auto` ทำอะไร?

```
Subagent สแกน codebase:
├── หาทุก Controllers/Pages/Routes → จำแนก page type
├── หา [Authorize] attributes → map roles
├── หา SeedData / migrations → ได้ credentials
├── หา Entity relationships → ได้ cascade dependencies
├── หา [Required] / [MaxLength] → ได้ validation rules
└── สร้าง qa-tracker.json (scenarios สถานะ pending, ยังไม่มี scripts)
```

#### `--brainstorm-agents` ทำอะไรเพิ่ม?

Dispatch 5 subagents ที่สวมบทบาทต่างกัน (ดู Section 6)

---

### 5.2 `/qa-continue` — เลือก Module, สร้าง Scripts, รัน Test

**ต้องรันเว็บก่อน** — ทำทีละ module เหมือน long-running `/continue`

#### วิธีเรียก

```bash
/qa-continue                          # แสดง pending modules ให้เลือก
/qa-continue --module PRODUCT         # ทำ module PRODUCT
/qa-continue TS-PRODUCT-001           # ทำเคสเดียว
/qa-continue --cascade CATEGORY       # ทำ cascade tests ของ CATEGORY
```

#### สิ่งที่ Agent ทำ

```
1. อ่าน qa-tracker.json → แสดง pending modules
2. ผู้ใช้เลือก module
3. ใช้ Playwright MCP เปิดหน้าจริง → snapshot → ดู elements
4. สร้าง Playwright scripts (POM + spec files + test data)
5. รัน tests ด้วย npx playwright test
6. อัพเดท qa-tracker.json (status, runs, test_script)
7. Commit ต่อ module
```

#### Cascade mode

```bash
/qa-continue --cascade CATEGORY
```

ทดสอบ: แก้/ลบ Category → ไปตรวจหน้า Products, Orders ที่ใช้ Category

---

### 5.3 `/qa-run` — รัน Tests

**ต้องรันเว็บ** — รัน tests ที่สร้าง scripts ไว้แล้ว

```bash
/qa-run TS-PRODUCT-001             # เคสเดียว
/qa-run --module PRODUCT           # ทั้ง module
/qa-run --all                      # ทั้งหมด
/qa-run --parallel                 # parallel ด้วย subagents
/qa-run --failed                   # เฉพาะ failed
```

---

### 5.4 `/qa-retest` — รีเทสและรายงานผล

**ต้องรันเว็บ** — รันซ้ำจาก scripts เดิม + เปรียบเทียบผล

```bash
/qa-retest                         # failed ทั้งหมด
/qa-retest TS-PRODUCT-003          # เคสเฉพาะ
/qa-retest --review                # + opus review
/qa-retest --all                   # regression test ทุกเคส
```

---

### 5.5 `/qa-edit-scenario` — แก้ไข/เพิ่ม Scenarios

**ไม่ต้องรันเว็บ** — แก้ไข scenarios ใน qa-tracker.json

ใช้เมื่อ:
- Business logic เปลี่ยน → แก้เคสเดิม
- ต้องการ brainstorm เพิ่มเคสพิเศษ
- Opus review แนะนำให้เพิ่มเคส

```bash
/qa-edit-scenario TS-PRODUCT-002 "เพิ่ม discount field"
/qa-edit-scenario --module ORDER "เปลี่ยน flow การสั่งซื้อ"
```

---

### 5.6 `/qa-status` — ดูสถานะ

**ไม่ต้องรันเว็บ** — อ่าน qa-tracker.json แสดงสรุป

```bash
/qa-status                         # ภาพรวม
/qa-status --module PRODUCT        # เฉพาะ module
/qa-status --failed                # เฉพาะ failed
```

---

### 5.7 `/qa-explain` — อธิบาย Test Plan

**ไม่ต้องรันเว็บ** — สร้าง Mermaid flowchart + coverage matrix

```bash
/qa-explain                        # ทั้งหมด
/qa-explain --module ORDER         # เฉพาะ module
/qa-explain --save                 # บันทึกเป็น test-plan.md
```

---

## 6. Multi-Agent Brainstorm

ใช้ `--brainstorm-agents` เพื่อให้ 5 subagents ช่วยคิด scenarios:

```bash
/qa-create-scenario --auto --brainstorm-agents
```

| Agent | บทบาท | ตัวอย่างสิ่งที่คิด |
|-------|--------|------------------|
| 🧑‍💼 End User | ผู้ใช้จริง | "ถ้ากด back ตอน submit จะเกิดอะไร?" |
| 🔒 Security Tester | เจาะระบบ | "form นี้ไม่มี CSRF token" |
| 🐛 Bug Hunter | หา edge cases | "ใส่ภาษาไทย 1000 ตัวใน SKU field" |
| 👔 Business Analyst | วิเคราะห์ logic | "VAT คำนวณปัดเศษผิดตอน > 10 items" |
| ♿ Accessibility | ทดสอบ a11y | "form นี้ไม่มี label ใน 3 fields" |

**ทุก agent ทำงาน parallel** → ไม่ต้องรันเว็บ (อ่าน code) → รวมผล dedup → สร้าง scenarios

```
ตัวอย่างผลลัพธ์:

│ Agent              │ Scenarios │ Highlight                       │
│ 🧑‍💼 End User        │    24     │ UX confusion on checkout wizard │
│ 🔒 Security Tester │    18     │ Missing CSRF on 3 forms         │
│ 🐛 Bug Hunter      │    31     │ Thai text breaks SKU validation │
│ 👔 Business Analyst│    15     │ VAT rounding error              │
│ ♿ Accessibility   │    12     │ 5 forms missing labels          │

Total: 100 → Dedup: 82 unique scenarios
```

---

## 7. Role-based Permission Testing

ทดสอบว่าแต่ละ role เข้าหน้า/ทำ actions ได้ตามสิทธิ์

### Credentials หาจาก Code อัตโนมัติ

`--auto` จะค้น seed data, migrations, appsettings เพื่อหา:
- Roles ที่มีในระบบ
- Test credentials ของแต่ละ role
- Authorization rules (Authorize attributes)

### ตัวอย่าง scenarios ที่สร้าง

```
│ Role    │ Page     │ Test                              │
│ admin   │ Products │ ✅ เห็นทั้ง CRUD                    │
│ manager │ Products │ ✅ เห็น view/create/edit, ❌ ไม่เห็น delete │
│ viewer  │ Products │ ✅ เห็นเฉพาะ view                  │
│ viewer  │ Users    │ ❌ redirect ไป /login               │
```

---

## 8. Cascade Testing

ทดสอบผลกระทบเมื่อแก้/ลบ master data → หน้าที่ใช้ข้อมูลนั้นยังถูกต้อง

### ตัวอย่าง

```
แก้ Category "Electronics" → "Consumer Electronics"
    │
    ├── ไปหน้า Products → Category column แสดง "Consumer Electronics"?
    ├── ไปหน้า Products → Category dropdown อัพเดท?
    └── ไปหน้า Orders → Product detail ยังถูกต้อง?

ลบ Category ที่มี Products → error message "Cannot delete"?
ลบ Category ที่ว่าง → ลบสำเร็จ?
```

### วิธีใช้

```bash
# Cascade dependencies ถูกสร้างอัตโนมัติตอน --auto
# (จาก Entity Framework relationships / foreign keys)

# รัน cascade tests
/qa-continue --cascade CATEGORY
```

### ประเภท Cascade Tests

| Type | ทดสอบอะไร |
|------|-----------|
| CASCADE-UPDATE | แก้ master → dependent แสดงข้อมูลใหม่ |
| CASCADE-DELETE-RESTRICT | ลบ master ที่มี dependents → error |
| CASCADE-DELETE-EMPTY | ลบ master ที่ไม่มี dependents → สำเร็จ |
| CASCADE-DROPDOWN | เพิ่ม/แก้/ลบ master → dropdown อัพเดท |
| CASCADE-INDIRECT | A→B→C: แก้ A → C ยังถูกต้อง? |

---

## 9. ประเภทหน้าที่รองรับ

### 9.1 Master Data CRUD (13 scenarios)

หน้า List/Create/Edit/Delete — เช่น Products, Categories, Users

### 9.2 Master-Detail Grid (15 scenarios)

หน้าที่มี master row คลิกขยาย detail grid — เช่น Orders → OrderItems

```
┌──────────────────────────────────────────────────┐
│  Orders                                  [+ New]  │
├──────┬──────────┬────────┬───────────────────────┤
│ ▼ 02 │ Jane     │ 3,200  │ Active                │  ← ขยายแล้ว
│ ┌────────────────────────────────────────────┐   │
│ │ Detail: Order Items                 [+ Add]│   │
│ ├─────┬──────────┬─────┬───────┬────────────┤   │
│ │ 1   │ Widget A │ 2   │ 200   │ [✏️] [🗑️]  │   │  ← inline edit
│ └─────┴──────────┴─────┴───────┴────────────┘   │
└──────────────────────────────────────────────────┘
```

ทดสอบ: expand, inline editing, add/delete detail rows, master-detail sync

### 9.3 Form Page (8-10 scenarios)

Login, Register, Contact — happy path, negative, boundary

### 9.4 Multi-step Wizard

Checkout, Registration wizard — test per step + navigation

### 9.5 Dashboard

Charts, metrics, filters, date range

---

## 10. Workflow ตัวอย่าง

### E-Commerce — จากเริ่มต้นจนเสร็จ

```
วันที่ 1 — สร้าง Scenarios (ไม่ต้องรันเว็บ)
──────────────────────────────────────────────

/qa-create-scenario --auto --brainstorm-agents
→ สแกน codebase + 5 agents ช่วยคิด
→ สร้าง 156 scenarios (ทุกหน้า + roles + cascade)
→ หา credentials: admin/manager/viewer จาก seed data


วันที่ 2 — รัน Tests ทีละ Module (ต้องรันเว็บ)
──────────────────────────────────────────────

# Terminal 1: รันเว็บ
dotnet run

# Terminal 2: Claude Code
/qa-continue --module LOGIN       → 7/8 passed
/qa-continue --module CATEGORY    → 13/13 passed
/qa-continue --module PRODUCT     → 11/13 passed


วันที่ 3 — ทำต่อ + Cascade Tests (ต้องรันเว็บ)
──────────────────────────────────────────────

/qa-continue --module ORDER       → 12/15 passed
/qa-continue --cascade CATEGORY   → 4/5 passed

/qa-status
→ Overall: 47/54 modules done, 128/156 passed (82%)


วันที่ 4 — แก้ Bug + รีเทส + Review (ต้องรันเว็บ)
───────────────────────────────────────────────

# Developer แก้ bug ในแอพ...

/qa-retest
→ 6/8 fixed

/qa-retest --review
→ Opus score: 88/100
→ แนะนำเพิ่ม: accessibility tests

/qa-edit-scenario --module PRODUCT "เพิ่ม accessibility tests"
→ เพิ่ม 5 scenarios ด้วย brainstorm
→ /qa-continue --module PRODUCT  ← สร้าง scripts + test เคสใหม่
```

---

## 11. qa-tracker.json

### โครงสร้าง v1.3.0

```json
{
  "schema_version": "1.3.0",
  "project": "MyApp",
  "base_url": "http://localhost:5000",
  "technology": "ASP.NET Core MVC",
  "login_url": "/login",

  "roles": [
    { "name": "admin", "credentials": { "username": "admin@test.com", "password": "Admin@123" } },
    { "name": "viewer", "credentials": { "username": "viewer@test.com", "password": "Viewer@123" } }
  ],

  "role_page_access": {
    "/admin/products": {
      "admin": { "view": true, "create": true, "edit": true, "delete": true },
      "viewer": { "view": true, "create": false, "edit": false, "delete": false }
    }
  },

  "cascade_dependencies": [
    {
      "master_module": "CATEGORY",
      "dependent_modules": [
        { "module": "PRODUCT", "relationship": "Product.CategoryId → Category.Id", "on_delete": "Restrict" }
      ]
    }
  ],

  "summary": { "total_scenarios": 156, "passed": 128, "failed": 8, "pending": 20 },

  "scenarios": [
    {
      "id": "TS-PRODUCT-001",
      "title": "Product list view",
      "module": "PRODUCT",
      "page_type": "master-data",
      "status": "passed",
      "test_script": "tests/TS-PRODUCT-001.spec.ts",
      "runs": [{ "run_number": 1, "status": "passed", "duration_ms": 3200 }]
    }
  ]
}
```

### Status Flow

```
(สร้างตอน --auto)           (สร้างตอน /qa-continue)
     pending ──────────→ running → passed
                                 → failed → (แก้ bug) → /qa-retest → passed
```

---

## 12. FAQ

### Q: ต้องรันเว็บก่อนหรือไม่?

| คำสั่ง | ต้องรัน? | เหตุผล |
|--------|:-------:|--------|
| `/qa-create-scenario --auto` | ไม่ | อ่าน source code |
| `/qa-continue` | **ต้อง** | เปิด browser ทดสอบ |
| `/qa-run` / `/qa-retest` | **ต้อง** | เปิด browser ทดสอบ |
| `/qa-edit-scenario` / `/qa-status` / `/qa-explain` | ไม่ | อ่าน/เขียน JSON |

### Q: ต้องติดตั้ง Playwright MCP หรือไม่?

**แนะนำอย่างยิ่ง** — MCP ทำให้ `/qa-continue` วิเคราะห์หน้าจริงได้แม่นยำ (เห็น DOM, field names, selectors)
ถ้าไม่มี agent จะแจ้งให้ติดตั้ง

### Q: Credentials มาจากไหน?

`--auto` ค้นจาก codebase อัตโนมัติ:
- Seed data files (SeedData.cs, seed.sql)
- Migration files ที่มี INSERT users
- appsettings.json / .env

ถ้าหาไม่เจอ agent จะถามผู้ใช้

### Q: รองรับภาษาไทยหรือไม่?

รองรับทั้ง UI elements, test data, reports และ commands ตอบกลับเป็นภาษาไทย

### Q: Cascade testing คืออะไร?

ทดสอบว่าเมื่อแก้/ลบข้อมูล master → หน้าอื่นที่ใช้ข้อมูลนั้นยังถูกต้อง
เช่น แก้ชื่อ Category → หน้า Products แสดงชื่อใหม่หรือไม่

### Q: ต้อง brainstorm ทุกหน้าหรือไม่?

**ไม่ต้อง** — ใช้ `--auto` สร้างทีเดียว จะ brainstorm เฉพาะเมื่อเรียก `/qa-edit-scenario`

### Q: ถ้าต้องการเพิ่ม scenarios ทีหลัง?

```bash
# เพิ่มด้วย brainstorm
/qa-edit-scenario --module PRODUCT "เพิ่ม accessibility tests"

# หรือเพิ่มหน้าใหม่
/qa-create-scenario http://localhost:5000/admin/new-page
```

### Q: ใช้กับ CI/CD ได้หรือไม่?

ได้ — มี GitHub Actions template:
```bash
cp plugins/qa-ui-test/skills/qa-ui-test/templates/github-actions-ui-test.yml \
   .github/workflows/ui-test.yml
```

### Q: รองรับ technology อะไรบ้าง?

| Technology | Auto-scan |
|-----------|:---------:|
| ASP.NET Core MVC / Razor Pages | ✅ |
| Next.js / React | ✅ |
| Angular | ✅ |
| Vue.js / Nuxt | ✅ |
| Django / Flask | ✅ |
| Static HTML | ⚠️ (ต้องใช้ manual mode) |
