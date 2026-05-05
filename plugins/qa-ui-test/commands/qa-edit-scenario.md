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
5. **⭐ ต้อง recompute risk + factors + model (v2.3)** — ทุกเคสที่แก้ logic ต้อง recompute และแสดง diff ก่อน apply
6. **Commit ทุกครั้ง** — `qa-edit(TS-XXX): [description of change]`

### Self-Check Checklist (MANDATORY)

- [ ] Impact analysis completed?
- [ ] All affected scenarios identified?
- [ ] ⭐ Risk + factors recomputed for affected scenarios?
- [ ] ⭐ Risk diff shown to user before apply?
- [ ] ⭐ assigned_model updated if factors changed?
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
- ⭐ Logic changed but risk/factors NOT recomputed → REJECT
- ⭐ Model assignment ไม่ตรงกับ factors ใหม่ → REJECT

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

### Step 1.5: Recompute Risk + Complexity Factors (⭐ v2.3 — MANDATORY)

**ก่อน apply changes ใดๆ ต้อง recompute risk + factors ของเคสที่ได้รับผลกระทบ HIGH/MEDIUM**

เพราะ logic change มักทำให้ scenario "ง่ายขึ้น" หรือ "ยากขึ้น" — model assignment ต้อง follow

#### A. Auto-Detect Factor Changes จาก change_reason

อ่าน user description (เช่น "เพิ่ม OTP verification หลัง login") และ logic delta จาก code → infer factor changes:

| Keyword/Pattern ใน change_reason | Add factor |
|---|---|
| "OTP", "MFA", "2FA", "captcha" | `security-flow` (P0 bump) |
| "wizard", "step 1, 2, 3", ">= 3 steps", "multi-page form" | `multi-step` |
| "status", "transition", "approval flow", "state machine" | `state-machine` |
| "cascade", "delete dependent", "foreign key" | `cascade-deep` |
| "concurrent", "race", "optimistic lock", "concurrent edit" | `concurrent` |
| "inline edit", "master-detail", "expand row", "detail grid" | `master-detail-sync` |
| "API mock", "retry sequence", "error injection" | `network-mock` |
| "Firefox", "Safari", "WebKit", "cross browser" | `cross-browser` |
| "auth", "login", "permission", "role", "CSRF", "XSS" | `security-flow` |
| "money", "payment", "checkout", "Stripe", "refund" | `security-flow` (money flow) |
| "remove [feature]", "simplify", "split flow" | **REMOVE** factor (เคสง่ายลง) |

#### B. Recompute risk.score

อ่าน new_steps, new_dependencies, new_validations → re-evaluate:

```
probability:  เปลี่ยนถ้า frequency of use เปลี่ยน
              (เช่น เพิ่ม MFA → ทุกคน login ทุกครั้ง → likely=3)

impact:       เปลี่ยนถ้า business value เปลี่ยน
              (เช่น เพิ่ม payment step → critical=3)

new_score = new_probability × new_impact
new_priority = derive(new_score)  [P0(7-9) | P1(5-6) | P2(3-4) | P3(1-2)]
```

#### C. Re-apply assignment_strategy.auto_assign_rules

ใช้ new factors + new risk.priority รัน rules ใน qa-tracker.json (top-down first match) → ได้ new model

#### D. Show Diff to User

```
🔄 Risk + Model Diff (logic change: "เพิ่ม OTP verification หลัง login")

┌─────────────────────────────────────────────────────────────────────┐
│ TS-LOGIN-001 (HIGH impact — recreated as TS-LOGIN-014)              │
├─────────────────────────────────────────────────────────────────────┤
│              │ Before                  │ After                       │
├──────────────┼─────────────────────────┼─────────────────────────────┤
│ risk.prob    │ 3 (likely)              │ 3 (likely)                  │
│ risk.impact  │ 2 (functional)          │ 3 (critical/security)  ⬆️   │
│ risk.score   │ 6                       │ 9  ⬆️                       │
│ risk.priority│ P1                      │ P0  ⬆️ (release blocker)    │
│ factors      │ —                       │ [security-flow, multi-step] │
│ model        │ sonnet                  │ opus  ⬆️                    │
│ reason       │ default mid-complexity  │ multiple complexity factors │
└──────────────┴─────────────────────────┴─────────────────────────────┘

📌 Why: เพิ่ม OTP step → security-flow factor + step ที่ 5-6 → multi-step factor (≥3 steps)
        impact ขึ้นเป็น critical เพราะ MFA ป้องกัน account takeover

┌─────────────────────────────────────────────────────────────────────┐
│ TS-LOGIN-002 (MEDIUM impact — updated to v2)                        │
├─────────────────────────────────────────────────────────────────────┤
│              │ Before                  │ After                       │
├──────────────┼─────────────────────────┼─────────────────────────────┤
│ risk.score   │ 6 (P1)                  │ 6 (P1)  (unchanged)         │
│ factors      │ —                       │ [security-flow]  ⬆️         │
│ model        │ sonnet                  │ sonnet (unchanged — P1 +    │
│              │                         │   security-flow ไม่ trigger │
│              │                         │   opus rule เพราะ rule      │
│              │                         │   ต้อง P0)                  │
└──────────────┴─────────────────────────┴─────────────────────────────┘

❓ Apply? (y/n หรือเลือกเฉพาะ)
   y          — apply ทั้งหมด
   skip-X     — skip recompute ของเคส X (เก็บค่าเก่า — ไม่แนะนำ)
   manual     — เปิด editor ให้แก้เอง
```

#### E. Apply Recompute Logic

ทุก scenario ที่ user confirm → update fields:

```json
{
  "id": "TS-LOGIN-014",
  "risk": {
    "probability": 3,
    "impact": 3,
    "score": 9,
    "priority": "P0",
    "rationale": "MFA prevents account takeover; every user logs in (likely × critical)"
  },
  "complexity_factors": ["security-flow", "multi-step"],
  "assigned_model": "opus",
  "assigned_model_reason": "multiple complexity factors require deep reasoning",
  "risk_recompute_history": [
    {
      "timestamp": "TIMESTAMP",
      "trigger": "qa-edit-scenario",
      "change_reason": "Added OTP verification",
      "before": { "score": 6, "priority": "P1", "factors": [], "model": "sonnet" },
      "after":  { "score": 9, "priority": "P0", "factors": ["security-flow","multi-step"], "model": "opus" }
    }
  ]
}
```

**ทำไมต้องเก็บ `risk_recompute_history`:** ใช้ audit ว่าเคสนี้ขึ้นเป็น P0 ตอนไหน — ถ้า bug ที่เคยเกิดตอนเป็น P1 ยัง relevant ไหม

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

// เคสใหม่: reference เคสเก่า + risk + factors recomputed
{
  "id": "TS-LOGIN-014",
  "title": "Login with OTP verification",
  "supersedes": "TS-LOGIN-001",
  "change_reason": "Added OTP step after password",
  "status": "pending",
  "risk": {
    "probability": 3,
    "impact": 3,
    "score": 9,
    "priority": "P0",
    "rationale": "MFA prevents account takeover (security-critical)"
  },
  "complexity_factors": ["security-flow", "multi-step"],
  "assigned_model": "opus",
  "assigned_model_reason": "multiple complexity factors require deep reasoning",
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
// เคสเดิม: update version + recompute risk/factors
{
  "id": "TS-LOGIN-002",
  "status": "pending",
  "version": 2,
  "complexity_factors": ["security-flow"],          // ⭐ added
  "assigned_model": "sonnet",                       // ⭐ unchanged (P1 + security-flow ไม่ trigger opus rule)
  "assigned_model_reason": "default mid-complexity (security-flow only triggers opus when P0)",
  "risk_recompute_history": [
    {
      "timestamp": "TIMESTAMP",
      "trigger": "qa-edit-scenario",
      "change_reason": "Added OTP input step",
      "before": { "score": 6, "priority": "P1", "factors": [], "model": "sonnet" },
      "after":  { "score": 6, "priority": "P1", "factors": ["security-flow"], "model": "sonnet" }
    }
  ],
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

### Risk Recompute Summary (⭐ v2.3):
- TS-LOGIN-014 (new):    P1/6 → **P0/9** | factors: [] → [security-flow, multi-step] | sonnet → **opus**
- TS-LOGIN-002 (v2):     P1/6 → P1/6     | factors: [] → [security-flow]            | sonnet → sonnet (unchanged)

### Current status:
- Scenarios: X active | Y deprecated
- ⚠️ New release blockers: 1 (TS-LOGIN-014 became P0)

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

🎯 Risk + Model Diff Applied:
├── TS-LOGIN-014: P1/6 → P0/9 ⬆️ | [] → [security-flow, multi-step] | sonnet → opus
└── TS-LOGIN-002: factors: [] → [security-flow] (model unchanged: sonnet)

📊 Scenarios: X active | Y deprecated | Z pending retest
⚠️ Release blockers added: 1 (TS-LOGIN-014 became P0)

🔜 Next:
   /qa-run --priority P0          — รัน P0 ก่อน (รวมเคสใหม่ที่ขึ้นเป็น P0)
   /qa-run --module LOGIN         — รันทั้ง module
   /qa-status --priority P0       — ดู release-blocker view
```

> This command responds in Thai (ภาษาไทย)
