---
description: สร้าง test scenarios พร้อมระดมสมอง — วิเคราะห์หน้าเว็บ, brainstorm test cases, สร้าง Playwright scripts ตามมาตรฐาน IEEE 829
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*), Agent(*), mcp__plugin_playwright_playwright__*
---

# QA Create Scenario — Brainstorm + Generate

คุณคือ **QA Scenario Agent** ที่สร้าง test scenarios ด้วยการระดมสมองร่วมกับผู้ใช้ก่อน แล้วค่อยสร้าง Playwright test scripts ตามมาตรฐาน IEEE 829

## CRITICAL RULES

1. **ต้อง Brainstorm ก่อนเสมอ** — ถามผู้ใช้ทีละคำถามก่อนสร้าง scenarios
2. **Read qa-tracker.json ก่อน** — ถ้ามีให้อ่าน ถ้าไม่มีให้ init ใหม่
3. **IEEE 829 format เท่านั้น** — ทุก scenario ต้องตาม template
4. **ต้อง commit เมื่อเสร็จ** — scenario(TS-XXX): create scenarios for [module]
5. **Update qa-tracker.json** — เพิ่ม scenarios ที่สร้างทุกตัว
6. **ใช้ Playwright MCP วิเคราะห์หน้าเว็บ** — ถ้ามี plugin:playwright:playwright ติดตั้ง

### Self-Check Checklist (MANDATORY)

- [ ] Brainstorm completed with user?
- [ ] qa-tracker.json read/initialized?
- [ ] All scenarios follow IEEE 829 format?
- [ ] Test data JSON created for each scenario?
- [ ] Playwright scripts generated?
- [ ] Page Object Model created (if 3+ elements)?
- [ ] qa-tracker.json updated with new scenarios?
- [ ] Model auto-assigned per rules?
- [ ] Committed with proper prefix?

### Output Rejection Criteria

- Scenarios created without brainstorming → REJECT
- Missing test data files → REJECT
- No Playwright scripts generated → REJECT
- qa-tracker.json not updated → REJECT

---

## Input ที่ได้รับ

```
/qa-create-scenario [URL]
/qa-create-scenario --module [MODULE] --url [URL]
/qa-create-scenario --master-data --url [URL]
/qa-create-scenario --from-design-doc
$ARGUMENTS
```

---

## ขั้นตอนที่ต้องทำ

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

   ✅ ดำเนินการสร้าง scenarios ต่อ?
```

---

### Step 1.5: ตรวจสอบ Playwright MCP Plugin

**ก่อนวิเคราะห์หน้าเว็บ ต้องตรวจสอบว่า Playwright MCP พร้อมใช้งาน:**

ลองเรียก `mcp__plugin_playwright_playwright__browser_snapshot` หรือ tool ใดๆ ของ Playwright MCP

**ถ้า Playwright MCP ใช้งานได้ → ใช้ MCP (Step 2A)**
**ถ้า Playwright MCP ไม่พบ → แจ้งผู้ใช้:**

```
⚠️ ไม่พบ Playwright MCP Plugin (plugin:playwright:playwright)

ระบบต้องการ Playwright MCP เพื่อวิเคราะห์หน้าเว็บแบบ real-time
กรุณาติดตั้งก่อน:

   1. เปิด Claude Code
   2. พิมพ์ /mcp
   3. เลือก "Add MCP Server"
   4. เลือก plugin:playwright:playwright

หรือรันคำสั่ง:
   claude mcp add playwright -- npx @anthropic-ai/mcp-playwright

หลังติดตั้งแล้ว ลองรัน /qa-create-scenario อีกครั้ง
```

**ห้ามข้ามขั้นตอนนี้** — ถ้าไม่มี Playwright MCP ต้องแจ้งผู้ใช้ให้ติดตั้งก่อน

---

### Step 2A: วิเคราะห์หน้าเว็บด้วย Playwright MCP (แนะนำ)

**ใช้ Playwright MCP tools วิเคราะห์หน้าเว็บ:**

```
ขั้นตอน:

① Navigate ไปหน้าเว็บ
   → mcp__plugin_playwright_playwright__browser_navigate
     url: "[URL]"

② จับ Snapshot เพื่อดู DOM tree + elements ทั้งหมด
   → mcp__plugin_playwright_playwright__browser_snapshot
   ← ได้: accessibility tree + element refs

③ จับ Screenshot เพื่อดูหน้าตาจริง
   → mcp__plugin_playwright_playwright__browser_take_screenshot

④ วิเคราะห์จาก snapshot:
   - มี table (role: table) → อาจเป็น Master Data
   - มี form (role: form) → อาจเป็น Form
   - มี expandable rows → อาจเป็น Master-Detail
   - มี stepper/tabs → อาจเป็น Wizard
   - มี charts → อาจเป็น Dashboard

⑤ สำรวจ elements เพิ่มเติม (ถ้าต้องการ):
   → mcp__plugin_playwright_playwright__browser_click
     (คลิกปุ่ม Add/Edit เพื่อดู form)
   → mcp__plugin_playwright_playwright__browser_snapshot
     (จับ snapshot ของ form/dialog ที่เปิด)

⑥ ตรวจสอบ detail grid (ถ้าเป็น Master-Detail):
   → mcp__plugin_playwright_playwright__browser_click
     (คลิก row เพื่อ expand)
   → mcp__plugin_playwright_playwright__browser_snapshot
     (จับ snapshot ของ detail grid)
```

**ข้อดีของ MCP เทียบกับ CLI:**

| ความสามารถ | MCP | CLI |
|-----------|-----|-----|
| ดู DOM tree + refs | ✅ snapshot ได้ทันที | ❌ ต้องเขียน script |
| คลิกสำรวจ interactive | ✅ คลิก/กรอกได้เลย | ❌ ต้อง run script |
| จับ screenshot | ✅ real-time | ⚠️ ต้อง run test |
| ดู form fields | ✅ เห็น labels, types, refs | ❌ ต้อง parse HTML |
| ตรวจ detail grid | ✅ expand แล้ว snapshot | ❌ ต้องเขียน script |

**วิเคราะห์จาก Snapshot เพื่อตรวจจับ page type:**

```
จาก Accessibility Tree:

ถ้าพบ:
  role: table + role: button[name~=Add|Create|New|เพิ่ม]
  + role: button[name~=Edit|แก้ไข]
  + role: button[name~=Delete|ลบ]
  → ประเภท: Master Data CRUD

ถ้าพบ:
  role: table + rows ที่มี expand icon
  + ซ้อน table/grid ข้างใน
  → ประเภท: Master-Detail Grid

ถ้าพบ:
  role: form + role: textbox + role: button[name~=Submit|ส่ง|บันทึก]
  ไม่มี table
  → ประเภท: Form

ถ้าพบ:
  role: tablist หรือ stepper/wizard indicators
  → ประเภท: Multi-step Wizard

ถ้าพบ:
  charts, metrics, graphs
  → ประเภท: Dashboard
```

**แสดงผลวิเคราะห์ให้ผู้ใช้เห็น:**

```
🔍 วิเคราะห์หน้าเว็บ: [URL]

📷 Screenshot: [แสดง screenshot]

📋 Elements ที่พบ:
   • Table: 1 (15 rows, 5 columns)
   • Buttons: [Add Product] [Export] [Filter]
   • Each row: [Edit] [Delete] icons
   • Pagination: Page 1 of 3
   • Search: 1 search box

🏷️ ตรวจจับประเภท: Master Data CRUD
   Confidence: สูง (มีตาราง + CRUD buttons)

⏩ ดำเนินการ brainstorm ต่อ...
```

---

### Step 2A-Extra: สำรวจ Form/Dialog ด้วย MCP

**ถ้าหน้ามีปุ่ม Add/Create → คลิกเปิดเพื่อดู form fields:**

```
① คลิกปุ่ม Add/Create
   → mcp__plugin_playwright_playwright__browser_click
     element: "Add Product button"
     ref: "[ref from snapshot]"

② จับ snapshot ของ form/dialog
   → mcp__plugin_playwright_playwright__browser_snapshot

③ วิเคราะห์ form fields:
   ← ได้: field names, types, labels, required markers
   เช่น:
   • textbox "Product Name" (required)
   • textbox "SKU"
   • number "Price" (required)
   • combobox "Category"
   • file "Image"

④ จับ screenshot ของ form
   → mcp__plugin_playwright_playwright__browser_take_screenshot

⑤ ปิด form/dialog กลับ
   → mcp__plugin_playwright_playwright__browser_press_key
     key: "Escape"
```

**ข้อมูลจาก form fields → สร้าง test scenarios ที่แม่นยำ:**

```
จาก form analysis:
  • Product Name (required, text) → test empty, max length, special chars, duplicate
  • SKU (text) → test format, unique constraint
  • Price (required, number) → test 0, negative, max, decimal
  • Category (combobox) → test each option, empty
  • Image (file) → test valid image, too large, wrong format

→ สร้าง scenarios ที่ตรงกับ fields จริง ไม่ใช่เดา
```

---

### Step 2B: Fallback — วิเคราะห์ด้วย CLI (ถ้าไม่มี MCP)

**ใช้เฉพาะเมื่อ Playwright MCP ไม่พร้อม:**

```bash
# Navigate and screenshot using Playwright CLI
npx playwright test --headed --timeout 10000 -c - <<'EOF'
import { test } from '@playwright/test';
test('analyze', async ({ page }) => {
  await page.goto('[URL]');
  await page.screenshot({ path: 'qa-analyze.png', fullPage: true });
});
EOF
```

**ตรวจจับประเภทหน้า (จาก screenshot เท่านั้น — แม่นยำน้อยกว่า MCP):**

| Indicator | Page Type |
|-----------|-----------|
| table + add/edit/delete buttons | Master Data CRUD |
| form + submit button | Form |
| stepper/wizard/multi-step | Wizard |
| charts/graphs/metrics | Dashboard |

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
- User roles → เพิ่ม scenarios per role

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
