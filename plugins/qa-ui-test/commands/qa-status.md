---
description: ดูสถานะภาพรวม QA UI tests — scenarios, pass rate, module breakdown, pending, failed, review status
allowed-tools: Bash(*), Read(*), Glob(*), Grep(*)
---

# QA Status — ดูสถานะภาพรวม

คุณคือ **QA Status Agent** ที่แสดงสถานะภาพรวมของ QA UI tests จาก qa-tracker.json

## CRITICAL RULES

1. **Read-only** — ห้ามแก้ไขไฟล์ใดๆ
2. **แสดงข้อมูลครบ** — summary, modules, failed details, review status, recent sessions

---

## Input ที่ได้รับ

```
/qa-status                          # ภาพรวมทั้งหมด
/qa-status --module LOGIN           # เฉพาะ module
/qa-status --failed                 # เฉพาะ failed
/qa-status --review                 # สถานะ review
$ARGUMENTS
```

---

## ขั้นตอนที่ต้องทำ

### Step 1: Read Data

```bash
# Read qa-tracker.json
cat qa-tracker.json

# Read recent progress
tail -50 .agent/qa-progress.md 2>/dev/null

# Count test files
ls tests/TS-*.spec.ts 2>/dev/null | wc -l
ls test-scenarios/TS-*.md 2>/dev/null | wc -l
```

**ถ้าไม่มี qa-tracker.json:**
```
❌ ไม่พบ qa-tracker.json
   → รัน /qa-create-scenario ก่อนเพื่อเริ่มต้น
```

---

### Step 2: Display Overview

```
📊 QA UI Test Status — [Project Name]
   Base URL: [base_url]
   Last Run: [timestamp]

┌─────────────────────────────────────────────────────┐
│              OVERALL SUMMARY                         │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Total Scenarios: NN                                 │
│                                                      │
│  ✅ Passed:    XX  ██████████████████░░░  XX%        │
│  ❌ Failed:    YY  ████░░░░░░░░░░░░░░░░  YY%        │
│  ⏳ Pending:   ZZ  ██░░░░░░░░░░░░░░░░░░  ZZ%        │
│  🔄 Running:   WW                                    │
│  📦 Deprecated: DD                                   │
│                                                      │
│  Pass Rate: XX% ████████████████████░░░░             │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

### Step 3: Module Breakdown

```
📋 Breakdown by Module:

| Module | Total | ✅ | ❌ | ⏳ | Rate | Page Type |
|--------|-------|----|----|----|------|-----------|
| LOGIN | 8 | 6 | 1 | 1 | 75% | form |
| PRODUCT | 13 | 10 | 2 | 1 | 77% | master-data |
| CATEGORY | 13 | 13 | 0 | 0 | 100% | master-data |
| CHECKOUT | 6 | 3 | 2 | 1 | 50% | wizard |
| ORDER | 15 | 8 | 3 | 4 | 53% | master-detail |
```

---

### Step 4: Failed Scenarios Detail

```
❌ Failed Scenarios (Y total):

1. TS-LOGIN-003: Login with empty fields
   Module: LOGIN | Priority: high | Runs: 2
   Last Error: Step 4 — Timeout waiting for validation error
   Last Run: 2026-03-20 14:30
   📷 Screenshot: test-results/TS-LOGIN-003/run-002/screenshots/04-error.png

2. TS-PRODUCT-003: Create product — negative
   Module: PRODUCT | Priority: high | Runs: 1
   Last Error: Step 3 — Expected "Name is required" — got nothing
   Last Run: 2026-03-20 10:00

3. TS-ORDER-005: Edit detail row
   Module: ORDER | Priority: critical | Runs: 1
   Last Error: Step 6 — Detail grid did not expand
   Last Run: 2026-03-20 11:00
```

---

### Step 5: Model Assignment & Review Status

```
🤖 Model Assignment:
   opus:   X scenarios (critical + first-in-module)
   sonnet: Y scenarios (standard)

🔍 Review Status:
   ✅ Reviewed: N scenarios
   ⏳ Awaiting review: M scenarios
   ❌ Review failed: K scenarios
      └── TS-LOGIN-001: Coverage gaps — missing boundary test
```

---

### Step 6: Recent Sessions

```
📝 Recent QA Sessions:

| # | Date | Type | Module | Result |
|---|------|------|--------|--------|
| 5 | 2026-03-20 14:30 | Retest | LOGIN | 1/2 fixed |
| 4 | 2026-03-20 12:00 | Run | PRODUCT | 10/13 passed |
| 3 | 2026-03-20 11:00 | Run | ORDER | 8/15 passed |
| 2 | 2026-03-20 10:00 | Create | PRODUCT | 13 scenarios |
| 1 | 2026-03-20 09:00 | Create | LOGIN | 8 scenarios |
```

---

### Step 7: Recommendations

```
💡 Recommended Next Actions:

1. 🔄 /qa-retest --failed          — รีเทส Y failed scenarios
2. 📝 /qa-create-scenario --module PAYMENT  — ยังไม่มี scenarios สำหรับ module นี้
3. 🔍 /qa-retest --review          — ส่ง opus review X scenarios
4. ✏️ /qa-edit-scenario TS-ORDER-005 — แก้ไขเคสที่ logic เปลี่ยน
5. 📊 /qa-explain --module ORDER    — ดู test plan flowchart
```

---

### Step 7b: Module-specific Status (ถ้า --module)

```
📊 Module: LOGIN — Detailed Status

| ID | Title | Priority | Status | Runs | Last Run |
|----|-------|----------|--------|------|----------|
| TS-LOGIN-001 | Login valid | critical | ✅ passed | 2 | 14:30 |
| TS-LOGIN-002 | Login invalid email | high | ✅ passed | 1 | 10:00 |
| TS-LOGIN-003 | Login empty fields | high | ❌ failed | 2 | 14:30 |
| TS-LOGIN-004 | Login boundary | medium | ✅ passed | 1 | 10:00 |
| TS-LOGIN-005 | Login SQL injection | high | ✅ passed | 1 | 10:00 |
| TS-LOGIN-006 | Login XSS attempt | high | ✅ passed | 1 | 10:00 |
| TS-LOGIN-007 | Login duplicate submit | medium | ✅ passed | 1 | 10:00 |
| TS-LOGIN-008 | Login back navigation | low | ⏳ pending | 0 | — |

Run History (recent 5):
├── Run #2 (14:30): 6/8 passed — retest
├── Run #1 (10:00): 5/8 passed — initial
```

---

## Output

แสดง status report ตาม format ด้านบน

> This command responds in Thai (ภาษาไทย)
