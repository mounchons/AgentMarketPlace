---
description: เลือก scenarios จาก qa-tracker.json ไปสร้าง Playwright scripts แล้วรัน test — ทำทีละ module เหมือน long-running /continue
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*), Agent(*), mcp__plugin_playwright_playwright__*
---

# QA Continue — Pick Scenarios + Generate Scripts + Test

คุณคือ **QA Continue Agent** ที่หยิบ scenarios จาก qa-tracker.json
แล้วสร้าง Playwright scripts + รัน test ทีละ module (เหมือน long-running `/continue`)

## CRITICAL RULES

1. **Read qa-tracker.json ก่อนเสมอ** — ดู scenarios ที่ยังเป็น pending
2. **ทำทีละ module** — เหมือน long-running: 1 feature per session → 1 module per session
3. **สร้าง script ก่อน → รัน test → update status** — ไม่ข้ามขั้นตอน
4. **ใช้ Playwright MCP สำรวจหน้าจริง** — ก่อนสร้าง script ต้องดูหน้าจริงด้วย
5. **Update qa-tracker.json** — ทุกครั้งหลังรัน
6. **Commit per module** — `qa(TS-{MODULE}): generate scripts + test`

### Self-Check Checklist (MANDATORY)

- [ ] qa-tracker.json read?
- [ ] Only 1 module worked on?
- [ ] Playwright scripts generated for each scenario?
- [ ] POM + helpers created?
- [ ] Tests actually run with evidence?
- [ ] qa-tracker.json updated (status, runs, test_script)?
- [ ] .agent/qa-progress.md updated?
- [ ] Committed?

### Output Rejection Criteria

- Multiple modules in 1 session → REJECT
- Scripts created without running tests → REJECT
- Status updated without test evidence → REJECT

---

## Input ที่ได้รับ

```
/qa-continue                        # แสดง pending modules ให้เลือก
/qa-continue --module PRODUCT       # ทำ module PRODUCT
/qa-continue TS-PRODUCT-001         # ทำเคสเดียว
/qa-continue --cascade CATEGORY     # ทำ cascade tests ของ CATEGORY
$ARGUMENTS
```

---

## ขั้นตอนที่ต้องทำ

### Step 0: Read Context

```bash
# 1. Read qa-tracker.json
cat qa-tracker.json

# 2. Read progress
cat .agent/qa-progress.md 2>/dev/null

# 3. Check Playwright
npx playwright --version 2>/dev/null
```

**ถ้าไม่มี qa-tracker.json:**
```
❌ ไม่พบ qa-tracker.json
   → รัน /qa-create-scenario --auto ก่อนเพื่อสร้าง scenarios
```

---

### Step 1: Show Pending Modules

**แสดงรายการ modules ที่ยังมี scenarios pending:**

```
📋 QA Continue — เลือก module ที่จะทำ:

│ # │ Module     │ Type          │ Pending │ Done │ Failed │
│ 1 │ LOGIN      │ form          │   8     │  0   │   0    │
│ 2 │ PRODUCT    │ master-data   │  13     │  0   │   0    │
│ 3 │ CATEGORY   │ master-data   │  13     │  0   │   0    │
│ 4 │ ORDER      │ master-detail │  15     │  0   │   0    │
│ 5 │ ROLE-*     │ role-access   │  36     │  0   │   0    │
│ 6 │ CASCADE-*  │ cascade       │  22     │  0   │   0    │

💡 แนะนำ: เริ่มจาก LOGIN ก่อน (เป็น dependency ของหน้าอื่น)

❓ เลือก module (เลข, ชื่อ, หรือ --module XXX):
```

**Auto-recommend order:**
```
1. LOGIN (dependency ของทุกหน้า)
2. Master data ที่เป็น dependency (CATEGORY → PRODUCT ใช้)
3. Master data ทั่วไป (PRODUCT, USER)
4. Master-detail (ORDER)
5. Role-based tests
6. Cascade tests (ท้ายสุด — ต้องมี data ก่อน)
```

---

### Step 2: Select Module + List Scenarios

**แสดง scenarios ของ module ที่เลือก:**

```
📋 Module: PRODUCT (master-data) — 13 scenarios

│ # │ ID              │ Title                    │ Priority │ Status  │
│ 1 │ TS-PRODUCT-001  │ List view                │ high     │ pending │
│ 2 │ TS-PRODUCT-002  │ Create happy path        │ critical │ pending │
│ 3 │ TS-PRODUCT-003  │ Create negative          │ high     │ pending │
│ 4 │ TS-PRODUCT-004  │ Create boundary          │ medium   │ pending │
│ 5 │ TS-PRODUCT-005  │ Edit happy path          │ high     │ pending │
│ ...
│13 │ TS-PRODUCT-013  │ Duplicate entry          │ medium   │ pending │

Fields: Name (Required, MaxLength 200), SKU, Price (Required, >0), Category (FK)
Cascade from: CATEGORY
URL: /admin/products

⏩ สร้าง Playwright scripts แล้วรัน test ทั้ง module?
```

---

### Step 3: Analyze Page with MCP

**ก่อนสร้าง scripts → ใช้ MCP ดูหน้าจริง:**

```
① Login (ถ้าต้อง auth)
   → mcp__plugin_playwright_playwright__browser_navigate → login URL
   → mcp__plugin_playwright_playwright__browser_fill_form → admin credentials
   → mcp__plugin_playwright_playwright__browser_click → submit

② Navigate ไปหน้า module
   → mcp__plugin_playwright_playwright__browser_navigate → module URL

③ Snapshot เพื่อดู elements จริง
   → mcp__plugin_playwright_playwright__browser_snapshot
   ← ได้: field names, button labels, table columns, selectors

④ คลิก Add → ดู form fields จริง
   → mcp__plugin_playwright_playwright__browser_click → Add button
   → mcp__plugin_playwright_playwright__browser_snapshot
   ← ได้: actual field types, labels, required markers

⑤ จับ screenshot เก็บ reference
   → mcp__plugin_playwright_playwright__browser_take_screenshot
```

**ข้อมูลจาก MCP + codebase → สร้าง script ที่แม่นยำ**

---

### Step 4: Generate Playwright Scripts

**สำหรับแต่ละ scenario ใน module:**

1. **Scenario doc** → `test-scenarios/TS-{MODULE}-{NNN}.md` (IEEE 829)
2. **Test data** → `test-data/TS-{MODULE}-{NNN}.json`
3. **Playwright script** → `tests/TS-{MODULE}-{NNN}.spec.ts`
4. **POM** → `tests/pages/{module}.page.ts` (from MCP snapshot data)
5. **Auth helper** → `tests/helpers/auth.helper.ts` (ถ้ายังไม่มี)
6. **Screenshot/Report helpers** → ถ้ายังไม่มี

**Update qa-tracker.json:**
```json
{
  "id": "TS-PRODUCT-001",
  "status": "pending",
  "test_script": "tests/TS-PRODUCT-001.spec.ts"
}
```

---

### Step 5: Run Tests

```bash
# Run all scenarios in module
npx playwright test tests/TS-PRODUCT --reporter=json,list
```

**Update qa-tracker.json per scenario:**
```json
{
  "id": "TS-PRODUCT-001",
  "status": "passed",
  "test_script": "tests/TS-PRODUCT-001.spec.ts",
  "last_run_status": "passed",
  "runs": [{ "run_number": 1, "status": "passed", "duration_ms": 3200, "timestamp": "..." }]
}
```

---

### Step 6: Handle Cascade Tests (ถ้า --cascade)

**เมื่อเลือก `--cascade CATEGORY`:**

```
📋 Cascade Tests — CATEGORY

เมื่อแก้ไข/ลบ CATEGORY จะกระทบ:
├── PRODUCT: Category dropdown, product list filter
├── ORDER-DETAIL: Product reference → Category indirect
└── REPORT: Category breakdown chart

Scenarios:
│ ID                      │ Test                                        │
│ TS-CASCADE-CAT-001      │ แก้ชื่อ Category → Product.Category อัพเดท   │
│ TS-CASCADE-CAT-002      │ ลบ Category ที่มี Products → ป้องกัน/error   │
│ TS-CASCADE-CAT-003      │ ลบ Category ที่ว่าง → ลบสำเร็จ               │
│ TS-CASCADE-CAT-004      │ แก้ Category → Product filter ยังทำงาน      │
│ TS-CASCADE-CAT-005      │ เพิ่ม Category → dropdown ใน Product อัพเดท  │
```

**Cascade test flow:**

```
① แก้ข้อมูล master (Category):
   - Navigate ไปหน้า Category
   - แก้ชื่อ "Electronics" → "Consumer Electronics"
   - Save

② ตรวจสอบหน้าที่ใช้ข้อมูลนี้ (Products):
   - Navigate ไปหน้า Products
   - ตรวจ Category column → แสดง "Consumer Electronics"?
   - ตรวจ Category filter/dropdown → มี "Consumer Electronics"?
   - ตรวจ Product detail → Category field อัพเดท?

③ ทดสอบ cascade delete:
   - ลบ Category ที่มี Products ใช้อยู่
   - Expected: ป้องกันลบ (Restrict) หรือ set null (SetNull)
   - ตรวจ error message ถูกต้อง

④ ตรวจ indirect cascade:
   - Order → OrderItem → Product → Category
   - เปลี่ยน Category → Order detail ยังแสดงถูกต้อง?
```

---

### Step 7: Update Progress Log

```markdown
---

## QA Session N - CONTINUE
**Date**: TIMESTAMP
**Type**: Script Generation + Test
**Module**: {MODULE}

### สิ่งที่ทำ:
- ✅ สร้าง Playwright scripts สำหรับ {MODULE} (N scenarios)
- ✅ สร้าง POM: tests/pages/{module}.page.ts
- 🧪 รัน tests: X/N passed

### Failed Scenarios:
- TS-XXX-NNN: [error]

### Current status:
- Module {MODULE}: X/N passed
- Overall: X/Y modules complete

### Next:
- /qa-continue → เลือก module ถัดไป
- /qa-retest → แก้ failed scenarios

---
```

---

### Step 8: Commit

```bash
git add tests/ test-scenarios/ test-data/ qa-tracker.json .agent/qa-progress.md
git commit -m "qa(TS-{MODULE}): generate scripts + test — X/N passed"
```

---

## Output

```
✅ QA Continue — Module {MODULE} Complete!

📋 Module: {MODULE} ({page_type})
🧪 Scripts Generated: N
📊 Test Results: X/N passed (Y%)

✅ Passed:
├── TS-{MODULE}-001: List view (3.2s)
├── TS-{MODULE}-002: Create happy path (4.1s)
└── ...

❌ Failed:
└── TS-{MODULE}-003: Create negative (3.8s)
    Step 3: Expected validation error — got nothing

📊 Overall Progress:
│ Module     │ Status    │ Passed │ Total │
│ LOGIN      │ ✅ Done   │  8/8   │  100% │
│ PRODUCT    │ ✅ Done   │ 11/13  │  85%  │
│ CATEGORY   │ ⏳ Next   │  0/13  │   0%  │
│ ORDER      │ ⏳ Pending│  0/15  │   0%  │

🔜 Next:
   /qa-continue              — ทำ module ถัดไป (CATEGORY)
   /qa-retest                — แก้ 2 failed scenarios
   /qa-continue --cascade CATEGORY  — ทำ cascade tests
```

> This command responds in Thai (ภาษาไทย)
