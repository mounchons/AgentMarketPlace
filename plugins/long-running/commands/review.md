---
description: Opus review งานที่ model อื่นทำ (ตรวจความถูกต้อง, pattern adherence, code quality) พร้อม auto-fix สำหรับ Critical/High issues
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*)
---

# /review — Model Review System (Hybrid Auto-Fix)

Opus ตรวจสอบงานที่ model อื่นทำ เทียบกับ reference implementation

**Hybrid Strategy:**
- **Critical / High** issues → opus แก้ไขเองทันที (auto-fix)
- **Medium / Low / Info** issues → ส่งกลับ model เดิมแก้ไข

## Usage

```
/review           # auto-select feature ที่ต้อง review
/review #6        # review feature #6 โดยเฉพาะ
```

---

## ขั้นตอน

### Step 1: อ่าน feature_list.json และหา features ที่ต้อง review

```bash
cat feature_list.json
```

**หา features ที่ต้อง review:**
- `status == "passed"` — ทำเสร็จแล้ว
- `assigned_model != "opus"` — ไม่ใช่ opus ทำเอง
- `review == null` — ยังไม่ถูก review

**ถ้ามี argument (เช่น `#6`):** review feature นั้นโดยตรง
**ถ้าไม่มี argument:** เลือก feature แรกที่ตรงเงื่อนไข (เรียงตาม id)

**ถ้าไม่มี feature ที่ต้อง review:**
```
✅ ไม่มี feature ที่รอ review
   - Features ทั้งหมดที่ไม่ใช่ opus ได้รับการ review แล้ว
   - หรือยังไม่มี feature ที่ passed โดย model อื่น
```

### Step 2: หา Reference Implementation

หา opus feature ที่ `is_reference_impl: true` ใน epic/category เดียวกัน

```bash
# ดู reference features
cat feature_list.json | jq '.features[] | select(.is_reference_impl == true) | {id, epic, category, description}'
```

**ถ้าไม่มี reference ใน epic เดียวกัน:**
- ใช้ reference จาก epic ที่ใกล้เคียงที่สุด
- หรือใช้ best practices ทั่วไปเป็นเกณฑ์

### Step 3: อ่านโค้ดจาก feature ที่จะ review

**อ่าน subtasks และ files:**

```bash
# ดู files ที่ feature แก้ไข
cat feature_list.json | jq '.features[] | select(.id == FEATURE_ID) | .subtasks[].files[]'

# ดู git commits ที่เกี่ยวข้อง
cat feature_list.json | jq '.features[] | select(.id == FEATURE_ID) | .subtasks[].commits[]'
```

**อ่านทุกไฟล์ที่เกี่ยวข้อง** — ทั้งจาก subtasks.files และ git log

### Step 4: อ่าน Reference Implementation (ถ้ามี)

```bash
# อ่าน files จาก reference feature
cat feature_list.json | jq '.features[] | select(.id == REFERENCE_ID) | .subtasks[].files[]'
```

**เปรียบเทียบ:**
- โครงสร้างไฟล์
- Naming conventions
- Error handling patterns
- Code organization

### Step 5: Review Checklist

ตรวจสอบตาม 4 เกณฑ์หลัก:

#### 5.1 Pattern Adherence (น้ำหนัก: 30%)
- [ ] โครงสร้างไฟล์เหมือน reference?
- [ ] Naming conventions ตรงกัน?
- [ ] Error handling pattern เดียวกัน?
- [ ] Code organization เหมือนกัน?
- [ ] Design patterns ที่ใช้ถูกต้อง?

#### 5.2 Acceptance Criteria (น้ำหนัก: 30%)
- [ ] ครบทุก acceptance criteria?
- [ ] Edge cases handled?
- [ ] Error responses ถูกต้อง?

#### 5.3 Code Correctness (น้ำหนัก: 25%)
- [ ] ไม่มี security vulnerabilities?
- [ ] Logic ถูกต้อง?
- [ ] Edge cases handled?
- [ ] Resource cleanup ถูกต้อง?

#### 5.4 Coding Standards (น้ำหนัก: 15%)
- [ ] ตาม project conventions?
- [ ] Consistent indentation & formatting?
- [ ] ไม่มี dead code?
- [ ] Comments เหมาะสม?

### Step 6: คำนวณ Score และจำแนก Issues

**Scoring:**
```
Score = (pattern_adherence * 0.3) + (acceptance_criteria * 0.3) + (code_correctness * 0.25) + (coding_standards * 0.15)
```

**Result mapping:**
| Score | Result | Action |
|-------|--------|--------|
| 80-100 | `pass` | เก็บ review record |
| 60-79 | `pass_with_suggestions` | เก็บ review record + suggestions |
| 0-59 | `fail` | ดู Step 7 สำหรับ Hybrid Action |

**Pattern Adherence mapping:**
| Score | Level |
|-------|-------|
| 90-100 | `excellent` |
| 75-89 | `good` |
| 50-74 | `needs_improvement` |
| 0-49 | `poor` |

**จำแนก issues ตาม severity:**
```
issues_critical_high = issues ที่ severity == "Critical" หรือ "High"
issues_medium_low    = issues ที่ severity == "Medium", "Low" หรือ "Info"
```

### Step 7: Hybrid Action — แก้ไขตาม Severity

```
┌─────────────────────────────────────────────────────────────────┐
│                    HYBRID AUTO-FIX DECISION                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  มี Critical/High issues?                                       │
│      │                                                          │
│      ├── YES → Opus AUTO-FIX ทันที (Step 7A)                   │
│      │         แก้โค้ดเอง → commit → re-score                   │
│      │                                                          │
│      └── NO  → มี Medium/Low issues?                            │
│               │                                                 │
│               ├── YES + score < 60 → SEND BACK (Step 7B)       │
│               │   ส่งกลับ model เดิมแก้ไข                       │
│               │                                                 │
│               ├── YES + score >= 60 → PASS WITH SUGGESTIONS     │
│               │   เก็บ review record + suggestions              │
│               │                                                 │
│               └── NO → PASS ✅                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

#### Step 7A: Auto-Fix (Critical / High Issues)

**Opus แก้ไขโค้ดเองทันที:**

1. **แสดง issues ที่จะแก้:**
```
🔧 Auto-Fix: พบ N Critical/High issues — opus จะแก้ไขทันที

  ❌ [Critical] SQL Injection ใน UserController.cs:45
  ❌ [High] Missing null check ใน OrderService.cs:102
```

2. **แก้ไขโค้ด** — อ่านไฟล์ → แก้ไข → ตรวจสอบว่า build ผ่าน

3. **Commit การแก้ไข:**
```bash
git add [fixed files]
git commit -m "review-fix(#FEATURE_ID): fix Critical/High issues from opus review

- [Critical] Fixed: SQL injection in UserController
- [High] Fixed: Missing null check in OrderService

Reviewed-By: opus
Original-Author: [assigned_model]"
```

4. **Re-score หลังแก้ไข** — คำนวณ score ใหม่โดยไม่นับ Critical/High issues ที่แก้แล้ว

5. **ตัดสินใจต่อ:**
   - ถ้ายังมี Medium/Low issues + score < 60 → **ส่งกลับ** model เดิม (Step 7B)
   - ถ้า score >= 60 → **pass_with_suggestions** (มี issues เหลือเป็น suggestions)
   - ถ้า score >= 80 → **pass**

6. **Update review record:**
```json
{
  "review": {
    "reviewed_by": "opus",
    "reviewed_at": "TIMESTAMP",
    "result": "pass_with_suggestions",
    "score": 75,
    "auto_fixed": {
      "count": 2,
      "commit": "abc1234",
      "issues_fixed": [
        {
          "severity": "Critical",
          "category": "security",
          "description": "SQL Injection ใน UserController.cs:45",
          "file": "Controllers/UserController.cs",
          "fix_description": "ใช้ parameterized query แทน string concatenation"
        },
        {
          "severity": "High",
          "category": "code-correctness",
          "description": "Missing null check ใน OrderService.cs:102",
          "file": "Services/OrderService.cs",
          "fix_description": "เพิ่ม null check + throw ArgumentNullException"
        }
      ]
    },
    "remaining_issues": [
      {
        "severity": "Medium",
        "category": "pattern-adherence",
        "description": "Naming ไม่ตรงกับ reference",
        "file": "path/to/file",
        "suggestion": "เปลี่ยนจาก getData เป็น GetData ตาม .NET convention"
      }
    ],
    "reference_feature_id": 5,
    "pattern_adherence": "good",
    "notes": "Auto-fixed 2 Critical/High issues. 1 Medium issue remaining as suggestion."
  }
}
```

---

#### Step 7B: Send Back (Medium/Low Issues Only, Score < 60)

**ส่งกลับ model เดิมแก้ไข:**

1. **Update feature status:**
```json
{
  "status": "in_progress",
  "blocked_reason": "Review failed — [สรุปปัญหาหลัก]. ดู review.remaining_issues สำหรับรายละเอียด"
}
```

2. **Update review record:**
```json
{
  "review": {
    "reviewed_by": "opus",
    "reviewed_at": "TIMESTAMP",
    "result": "fail",
    "score": 45,
    "auto_fixed": null,
    "remaining_issues": [
      {
        "severity": "Medium",
        "category": "pattern-adherence",
        "description": "...",
        "file": "path/to/file",
        "suggestion": "..."
      }
    ],
    "reference_feature_id": 5,
    "pattern_adherence": "needs_improvement",
    "notes": "ส่งกลับ [model] แก้ไข: [สรุป issues]"
  }
}
```

3. **แสดง instructions สำหรับ model เดิม:**
```
📋 Instructions for [model] — Feature #X:

  ต้องแก้ไข:
  1. [Medium] pattern-adherence: [description] → [suggestion]
  2. [Medium] coding-standards: [description] → [suggestion]

  Reference: ดู Feature #Y (opus reference implementation)
  Files to compare:
  - reference: [file from opus feature]
  - yours: [file from this feature]

  หลังแก้ไข: run /review #X อีกครั้ง
```

---

#### Step 7C: Pass / Pass with Suggestions

**ไม่มี Critical/High issues:**

**ถ้า score >= 80 → `pass`:**
```json
{
  "review": {
    "reviewed_by": "opus",
    "reviewed_at": "TIMESTAMP",
    "result": "pass",
    "score": 85,
    "auto_fixed": null,
    "remaining_issues": [],
    "reference_feature_id": 5,
    "pattern_adherence": "good",
    "notes": "ผ่านการ review — code quality ดี"
  }
}
```

**ถ้า score 60-79 → `pass_with_suggestions`:**
```json
{
  "review": {
    "reviewed_by": "opus",
    "reviewed_at": "TIMESTAMP",
    "result": "pass_with_suggestions",
    "score": 72,
    "auto_fixed": null,
    "remaining_issues": [
      {
        "severity": "Medium",
        "category": "pattern-adherence",
        "description": "...",
        "file": "path/to/file",
        "suggestion": "..."
      }
    ],
    "reference_feature_id": 5,
    "pattern_adherence": "good",
    "notes": "ผ่านพร้อม suggestions — ปรับปรุงได้ใน iteration ถัดไป"
  }
}
```

---

### Step 8: Update Summary Counts

```json
{
  "summary": {
    "review_status": {
      "reviewed": "+1",
      "pending_review": "-1",
      "passed": "+1 (if pass/pass_with_suggestions)",
      "failed": "+1 (if fail — sent back)"
    }
  }
}
```

### Step 9: Update .agent/progress.md

เพิ่ม entry:

```markdown
---

## Session N - REVIEW
**Date**: TIMESTAMP
**Type**: Review

### Review Results:
- 📝 Feature #X: [description]
  - Assigned Model: [model]
  - Reference: Feature #Y
  - Score: XX/100
  - Result: [pass/fail/pass_with_suggestions]
  - Pattern Adherence: [excellent/good/needs_improvement/poor]
  - Issues: N total (C critical, H high, M medium, L low)
  - Auto-Fixed: N issues by opus (commit: abc1234)
  - Sent Back: N issues to [model]

### Auto-Fixed Issues (by opus):
- 🔧 [Critical] [category]: [description] — [file] → FIXED
- 🔧 [High] [category]: [description] — [file] → FIXED

### Remaining Issues (for [model]):
- 📋 [Medium] [category]: [description] — [file]

### สถานะปัจจุบัน:
- Reviewed: X features
- Pending Review: Y features

---
```

---

## Output Format

แสดงผลในรูปแบบ:

```markdown
# 📝 Review Report: Feature #X

## Feature Info
- **Description**: [description]
- **Assigned Model**: [model]
- **Epic**: [epic]

## Reference Implementation
- **Feature #Y**: [description] (opus)

## Review Results

### Score: XX/100 — [PASS ✅ / FAIL ❌ / PASS WITH SUGGESTIONS ⚠️]

### Pattern Adherence: [excellent/good/needs_improvement/poor]

### Issues Found: N total
| # | Severity | Category | Description | File | Action |
|---|----------|----------|-------------|------|--------|
| 1 | Critical | security | SQL Injection | Controller.cs | 🔧 Auto-Fixed |
| 2 | High | code-correctness | Null check missing | Service.cs | 🔧 Auto-Fixed |
| 3 | Medium | pattern-adherence | Naming mismatch | Model.cs | 📋 Sent Back |

### 🔧 Auto-Fixed by Opus: N issues
- Commit: `abc1234`
- Files changed: [list]

### 📋 Sent Back to [model]: N issues
1. [suggestion 1]
2. [suggestion 2]

## Action Taken
- [Auto-fixed N Critical/High issues]
- [Sent back N Medium/Low issues to model]
- [Updated review record]
```

---

## Hybrid Decision Summary

```
┌─────────────────────────────────────────────────────────────────┐
│              REVIEW ACTION MATRIX                               │
├──────────────────┬──────────────────────────────────────────────┤
│ Scenario         │ Action                                       │
├──────────────────┼──────────────────────────────────────────────┤
│ No issues        │ ✅ pass — เก็บ review record                 │
│                  │                                              │
│ Medium/Low only  │ score >= 80: ✅ pass                         │
│ (no Crit/High)   │ score 60-79: ⚠️ pass_with_suggestions       │
│                  │ score < 60:  ❌ fail — ส่งกลับ model เดิม    │
│                  │                                              │
│ Has Crit/High    │ 🔧 opus auto-fix Crit/High ทันที            │
│                  │ แล้ว re-score:                                │
│                  │   score >= 80: ✅ pass                        │
│                  │   score 60-79: ⚠️ pass_with_suggestions      │
│                  │   score < 60:  ❌ fail — ส่งกลับ Medium/Low  │
└──────────────────┴──────────────────────────────────────────────┘
```

---

## Issue Severity Guide

| Severity | Description | ตัวอย่าง | Action |
|----------|-------------|---------|--------|
| **Critical** | ใช้งานไม่ได้ / Security vulnerability | SQL injection, crash | 🔧 Opus auto-fix |
| **High** | Logic ผิดหรือขาด feature สำคัญ | Missing validation, wrong calculation | 🔧 Opus auto-fix |
| **Medium** | Pattern ไม่ตรง / Missing edge case | Different naming, no error handling | 📋 ส่งกลับ model เดิม |
| **Low** | Style / Minor improvements | Inconsistent formatting | 📋 ส่งกลับ model เดิม |
| **Info** | Suggestion / Nice to have | Alternative approach suggestion | 📋 ส่งกลับ model เดิม |

## Issue Categories

| Category | Description |
|----------|-------------|
| `pattern-adherence` | ไม่ตรงตาม reference implementation |
| `acceptance-criteria` | Acceptance criteria ไม่ครบ |
| `code-correctness` | Logic ผิด, bugs |
| `security` | Security vulnerabilities |
| `performance` | Performance issues |
| `coding-standards` | ไม่ตาม conventions |
| `error-handling` | Error handling ไม่เหมาะสม |
