---
description: แก้ไข test scenarios เมื่อ business logic เปลี่ยน — สร้างเคสใหม่อ้างอิงเคสเดิม, ปรับ scripts, update qa-tracker
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*), Agent(*)
---

# QA Edit Scenario — Logic Changed, Update Tests

คุณคือ **QA Editor Agent** ที่ปรับปรุง test scenarios เมื่อ business logic เปลี่ยนแปลง
ต้องสร้างเคสใหม่ที่อ้างอิงเคสเดิม (ไม่ลบเคสเก่า) พร้อมปรับ Playwright scripts

## CRITICAL RULES

1. **ห้ามลบเคสเดิม** — สร้างเคสใหม่ที่ reference เคสเก่า (เพื่อเก็บ history)
2. **ต้องวิเคราะห์ impact ก่อน** — หา scenarios ที่ได้รับผลกระทบทั้งหมด
3. **ต้อง update Playwright scripts** — ทั้ง spec file และ POM
4. **ต้อง update qa-tracker.json** — เคสเก่า mark deprecated, เคสใหม่ pending
5. **Commit ทุกครั้ง** — `qa-edit(TS-XXX): [description of change]`

### Self-Check Checklist (MANDATORY)

- [ ] Impact analysis completed?
- [ ] All affected scenarios identified?
- [ ] New scenarios reference old ones (supersedes field)?
- [ ] Old scenarios marked "deprecated"?
- [ ] Playwright scripts updated?
- [ ] Test data updated?
- [ ] qa-tracker.json updated?
- [ ] .agent/qa-progress.md updated?

### Output Rejection Criteria

- Deleted old scenarios without creating new ones → REJECT
- Edited scripts without updating qa-tracker.json → REJECT
- No impact analysis shown → REJECT

---

## Input ที่ได้รับ

```
/qa-edit-scenario TS-LOGIN-001 "เพิ่ม OTP verification หลัง login"
/qa-edit-scenario --module LOGIN "เปลี่ยน validation rules ของ email"
/qa-edit-scenario --impact "เพิ่ม field ใหม่ในฟอร์ม product"
$ARGUMENTS
```

---

## ขั้นตอนที่ต้องทำ

### Step 0: Read Context

```bash
# 1. Read qa-tracker.json
cat qa-tracker.json

# 2. Read current scenarios
ls test-scenarios/TS-*.md

# 3. Read progress
cat .agent/qa-progress.md 2>/dev/null
```

---

### Step 1: Impact Analysis

**วิเคราะห์ว่า logic change กระทบ scenarios ไหนบ้าง:**

```
🔍 Impact Analysis

Logic Change: [user's description]

Affected Scenarios:
┌─────────────────────────────────────────────────────────────┐
│  ID              │ Title                │ Impact Level       │
├──────────────────┼──────────────────────┼────────────────────┤
│  TS-LOGIN-001    │ Login valid          │ 🔴 HIGH — flow     │
│                  │                      │    changed entirely │
│  TS-LOGIN-002    │ Login invalid        │ 🟡 MEDIUM — new    │
│                  │                      │    step added       │
│  TS-LOGIN-003    │ Login empty          │ 🟢 LOW — no change │
└──────────────────┴──────────────────────┴────────────────────┘

Impact Types:
  🔴 HIGH   — Test flow changes, must rewrite scenario + script
  🟡 MEDIUM — Test steps added/modified, update script
  🟢 LOW    — No impact, keep as-is

❓ ดำเนินการปรับเคสที่ได้รับผลกระทบ?
```

---

### Step 2: Handle Each Affected Scenario

**สำหรับแต่ละ scenario ที่ได้รับผลกระทบ (🔴 HIGH, 🟡 MEDIUM):**

#### Strategy A: 🔴 HIGH Impact — สร้างเคสใหม่แทน

```json
// เคสเดิม: mark deprecated
{
  "id": "TS-LOGIN-001",
  "status": "deprecated",
  "deprecated_reason": "Logic changed: added OTP verification",
  "superseded_by": "TS-LOGIN-014"
}

// เคสใหม่: reference เคสเก่า
{
  "id": "TS-LOGIN-014",
  "title": "Login with OTP verification",
  "supersedes": "TS-LOGIN-001",
  "change_reason": "Added OTP step after password",
  "status": "pending",
  "created_at": "TIMESTAMP"
}
```

**Files to create/update:**
1. `test-scenarios/TS-LOGIN-014.md` — scenario ใหม่ (ref เคสเดิม)
2. `test-data/TS-LOGIN-014.json` — test data ใหม่
3. `tests/TS-LOGIN-014.spec.ts` — script ใหม่
4. `tests/pages/login.page.ts` — update POM ถ้า elements เปลี่ยน

#### Strategy B: 🟡 MEDIUM Impact — ปรับ script เดิม

```json
// เคสเดิม: update version
{
  "id": "TS-LOGIN-002",
  "status": "pending",
  "version": 2,
  "change_log": [
    {
      "version": 2,
      "date": "TIMESTAMP",
      "change": "Added OTP input step after password",
      "previous_steps": 5,
      "new_steps": 7
    }
  ]
}
```

**Files to update:**
1. `test-scenarios/TS-LOGIN-002.md` — เพิ่ม/แก้ steps
2. `test-data/TS-LOGIN-002.json` — เพิ่ม OTP fixtures
3. `tests/TS-LOGIN-002.spec.ts` — เพิ่ม steps ใน script

---

### Step 3: Update Scenario Documents

**เคสใหม่ (supersedes):**

```markdown
# TS-LOGIN-014: Login with OTP verification

| Field | Value |
|---|---|
| **ID** | TS-LOGIN-014 |
| **Supersedes** | TS-LOGIN-001 |
| **Change reason** | Added OTP verification step |
| **Priority** | Critical |
| **Status** | Draft |

## Change from TS-LOGIN-001
- เดิม: email → password → submit → dashboard
- ใหม่: email → password → submit → OTP → verify → dashboard

## Steps
| # | Action | Expected result |
|---|--------|----------------|
| 1 | Navigate to /login | Login page loads |
| 2 | Fill email | Field shows value |
| 3 | Fill password | Field shows masked |
| 4 | Click submit | OTP page appears |
| 5 | Fill OTP code | Field shows value |
| 6 | Click verify | Redirected to dashboard |
```

---

### Step 4: Update Playwright Scripts

**สำหรับ HIGH impact — สร้าง spec ใหม่:**

```typescript
// tests/TS-LOGIN-014.spec.ts
// Supersedes: TS-LOGIN-001 (added OTP verification)
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { ScreenshotHelper } from './helpers/screenshot.helper';
import { ReportHelper } from './helpers/report.helper';

const SCENARIO_ID = 'TS-LOGIN-014';
// ...
```

**สำหรับ MEDIUM impact — แก้ spec เดิม:**

```typescript
// ใช้ Edit tool แก้ไข tests/TS-LOGIN-002.spec.ts
// เพิ่ม step ใหม่ตรงจุดที่เปลี่ยน
```

**Update POM ถ้า elements ใหม่:**

```typescript
// tests/pages/login.page.ts
// เพิ่ม OTP-related elements
export class LoginPage {
  // ... existing elements ...
  readonly otpInput: Locator;      // NEW
  readonly verifyButton: Locator;  // NEW

  constructor(page: Page) {
    // ... existing ...
    this.otpInput = page.getByTestId('otp')
      .or(page.getByRole('textbox', { name: /otp|รหัส/i }));
    this.verifyButton = page.getByRole('button', { name: /verify|ยืนยัน/i });
  }

  async fillOtp(code: string) { // NEW
    await this.otpInput.fill(code);
  }

  async verify() { // NEW
    await this.verifyButton.click();
  }
}
```

---

### Step 5: Update qa-tracker.json

```json
{
  "scenarios": [
    {
      "id": "TS-LOGIN-001",
      "status": "deprecated",
      "deprecated_reason": "Logic changed: added OTP verification",
      "superseded_by": "TS-LOGIN-014"
    },
    {
      "id": "TS-LOGIN-014",
      "title": "Login with OTP verification",
      "supersedes": "TS-LOGIN-001",
      "change_reason": "Added OTP step after password",
      "status": "pending",
      "assigned_model": "opus",
      "created_at": "TIMESTAMP"
    },
    {
      "id": "TS-LOGIN-002",
      "version": 2,
      "status": "pending",
      "change_log": [
        { "version": 2, "date": "TIMESTAMP", "change": "Added OTP step" }
      ]
    }
  ]
}
```

**Update summary:**
```json
{
  "summary": {
    "total_scenarios": "recalculate (exclude deprecated)",
    "pending": "+N"
  }
}
```

---

### Step 6: Update Progress Log

```markdown
---

## QA Session N - EDIT SCENARIOS
**Date**: TIMESTAMP
**Type**: Scenario Edit (Logic Change)

### Logic Change:
- [description of change]

### Impact Analysis:
- 🔴 HIGH: N scenarios (recreated)
- 🟡 MEDIUM: N scenarios (updated)
- 🟢 LOW: N scenarios (no change)

### สิ่งที่ทำ:
- 🔄 TS-LOGIN-001 → deprecated, replaced by TS-LOGIN-014
- ✏️ TS-LOGIN-002 → updated to v2 (added OTP step)
- ✅ POM updated with OTP elements

### Current status:
- Scenarios: X active | Y deprecated

### Next:
- /qa-run --module LOGIN เพื่อรันเคสที่ปรับปรุง

---
```

---

### Step 7: Commit

```bash
git add test-scenarios/ test-data/ tests/ qa-tracker.json .agent/qa-progress.md
git commit -m "qa-edit(TS-LOGIN): update scenarios for OTP verification logic change"
```

---

## Output

```
✏️ QA Edit Scenario Complete!

🔍 Logic Change: [description]

Impact Summary:
├── 🔴 HIGH (recreated): 1 scenario
│   └── TS-LOGIN-001 → deprecated → TS-LOGIN-014 (new)
├── 🟡 MEDIUM (updated): 2 scenarios
│   ├── TS-LOGIN-002 → v2 (added OTP step)
│   └── TS-LOGIN-004 → v2 (updated flow)
└── 🟢 LOW (no change): 3 scenarios

📁 Files changed:
├── test-scenarios/ (1 new, 2 modified)
├── test-data/ (1 new, 2 modified)
├── tests/ (1 new spec, 2 modified specs, POM updated)
└── qa-tracker.json (updated)

📊 Scenarios: X active | Y deprecated | Z pending retest

🔜 Next: /qa-run --module LOGIN เพื่อรันเคสที่ปรับปรุง
```

> This command responds in Thai (ภาษาไทย)
