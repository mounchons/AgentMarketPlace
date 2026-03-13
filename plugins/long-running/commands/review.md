---
description: Opus reviews work done by other models (correctness, pattern adherence, code quality) with auto-fix for Critical/High issues
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*)
---

# /review — Model Review System (Hybrid Auto-Fix)

Opus reviews work done by other models against the reference implementation.

## ⚠️ CRITICAL RULES (MUST FOLLOW)

1. **Read ALL source files** — read every file the feature modified before scoring
2. **Compare with reference implementation** — always find and read the reference feature's files
3. **Score honestly** — use the weighted formula, do not inflate scores
4. **Auto-fix Critical/High only** — never auto-fix Medium/Low issues, send them back
5. **Update feature_list.json** — review record must be saved with all fields (score, issues, result)

### 🔍 Self-Check Checklist (MANDATORY before submitting output)

Before completing the review, verify EVERY item:

- [ ] All modified files read?
- [ ] Reference implementation found and compared?
- [ ] Score calculated using weighted formula?
- [ ] Issues categorized by severity correctly?
- [ ] Critical/High auto-fixed (if any)?
- [ ] feature_list.json updated with review record?
- [ ] progress.md updated with review session?

If ANY checkbox is unchecked, DO NOT submit. Fix the issue first.

### ❌ Output Rejection Criteria

Your output will be REJECTED and you must REDO the entire review if:

- Files not actually read before scoring
- Score inflated without justification
- Review record not saved to feature_list.json
- Critical/High issues not auto-fixed

### ⚠️ Penalty

Violating these rules means your review output is INVALID. You must redo the ENTIRE review from scratch.

---

**Hybrid Strategy:**
- **Critical / High** issues → opus fixes immediately (auto-fix)
- **Medium / Low / Info** issues → sent back to original model to fix

## Usage

```
/review           # auto-select feature that needs review
/review #6        # review feature #6 specifically
```

---

## Steps

### Step 1: Read feature_list.json and Find Features That Need Review

```bash
cat feature_list.json
```

**Find features that need review:**
- `status == "passed"` — already completed
- `assigned_model != "opus"` — not done by opus itself
- `review == null` — not yet reviewed

**If argument provided (e.g., `#6`):** review that feature directly
**If no argument:** select first feature matching criteria (ordered by id)

**If no feature needs review:**
```
✅ ไม่มี feature ที่รอ review
   - Features ทั้งหมดที่ไม่ใช่ opus ได้รับการ review แล้ว
   - หรือยังไม่มี feature ที่ passed โดย model อื่น
```

### Step 2: Find Reference Implementation

Find opus feature with `is_reference_impl: true` in the same epic/category.

```bash
# View reference features
cat feature_list.json | jq '.features[] | select(.is_reference_impl == true) | {id, epic, category, description}'
```

**If no reference in same epic:**
- Use reference from closest epic
- Or use general best practices as criteria

### Step 3: Read Code from Feature Being Reviewed

**Read subtasks and files:**

```bash
# View files the feature modified
cat feature_list.json | jq '.features[] | select(.id == FEATURE_ID) | .subtasks[].files[]'

# View related git commits
cat feature_list.json | jq '.features[] | select(.id == FEATURE_ID) | .subtasks[].commits[]'
```

**Read every related file** — from both subtasks.files and git log

### Step 4: Read Reference Implementation (if exists)

```bash
# Read files from reference feature
cat feature_list.json | jq '.features[] | select(.id == REFERENCE_ID) | .subtasks[].files[]'
```

**Compare:**
- File structure
- Naming conventions
- Error handling patterns
- Code organization

### Step 5: Review Checklist

Review against 4 main criteria:

#### 5.1 Pattern Adherence (weight: 30%)
- [ ] File structure matches reference?
- [ ] Naming conventions match?
- [ ] Same error handling pattern?
- [ ] Same code organization?
- [ ] Design patterns used correctly?

#### 5.2 Acceptance Criteria (weight: 30%)
- [ ] All acceptance criteria met?
- [ ] Edge cases handled?
- [ ] Error responses correct?

#### 5.3 Code Correctness (weight: 25%)
- [ ] No security vulnerabilities?
- [ ] Logic correct?
- [ ] Edge cases handled?
- [ ] Resource cleanup correct?

#### 5.4 Coding Standards (weight: 15%)
- [ ] Follows project conventions?
- [ ] Consistent indentation & formatting?
- [ ] No dead code?
- [ ] Appropriate comments?

### Step 6: Calculate Score and Classify Issues

**Scoring:**
```
Score = (pattern_adherence * 0.3) + (acceptance_criteria * 0.3) + (code_correctness * 0.25) + (coding_standards * 0.15)
```

**Result mapping:**
| Score | Result | Action |
|-------|--------|--------|
| 80-100 | `pass` | Store review record |
| 60-79 | `pass_with_suggestions` | Store review record + suggestions |
| 0-59 | `fail` | See Step 7 for Hybrid Action |

**Pattern Adherence mapping:**
| Score | Level |
|-------|-------|
| 90-100 | `excellent` |
| 75-89 | `good` |
| 50-74 | `needs_improvement` |
| 0-49 | `poor` |

**Classify issues by severity:**
```
issues_critical_high = issues with severity == "Critical" or "High"
issues_medium_low    = issues with severity == "Medium", "Low" or "Info"
```

### Step 7: Hybrid Action — Fix Based on Severity

```
┌─────────────────────────────────────────────────────────────────┐
│                    HYBRID AUTO-FIX DECISION                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Has Critical/High issues?                                      │
│      │                                                          │
│      ├── YES → Opus AUTO-FIX immediately (Step 7A)              │
│      │         Fix code → commit → re-score                     │
│      │                                                          │
│      └── NO  → Has Medium/Low issues?                           │
│               │                                                 │
│               ├── YES + score < 60 → SEND BACK (Step 7B)        │
│               │   Send back to original model to fix            │
│               │                                                 │
│               ├── YES + score >= 60 → PASS WITH SUGGESTIONS     │
│               │   Store review record + suggestions             │
│               │                                                 │
│               └── NO → PASS ✅                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

#### Step 7A: Auto-Fix (Critical / High Issues)

**Opus fixes code immediately:**

1. **Display issues to fix:**
```
🔧 Auto-Fix: Found N Critical/High issues — opus will fix immediately

  ❌ [Critical] SQL Injection in UserController.cs:45
  ❌ [High] Missing null check in OrderService.cs:102
```

2. **Fix code** — read file → fix → verify build passes

3. **Commit fix:**
```bash
git add [fixed files]
git commit -m "review-fix(#FEATURE_ID): fix Critical/High issues from opus review

- [Critical] Fixed: SQL injection in UserController
- [High] Fixed: Missing null check in OrderService

Reviewed-By: opus
Original-Author: [assigned_model]"
```

4. **Re-score after fix** — calculate new score without counting fixed Critical/High issues

5. **Decide next:**
   - If still has Medium/Low issues + score < 60 → **send back** to original model (Step 7B)
   - If score >= 60 → **pass_with_suggestions** (remaining issues as suggestions)
   - If score >= 80 → **pass**

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
          "description": "SQL Injection in UserController.cs:45",
          "file": "Controllers/UserController.cs",
          "fix_description": "Used parameterized query instead of string concatenation"
        },
        {
          "severity": "High",
          "category": "code-correctness",
          "description": "Missing null check in OrderService.cs:102",
          "file": "Services/OrderService.cs",
          "fix_description": "Added null check + throw ArgumentNullException"
        }
      ]
    },
    "remaining_issues": [
      {
        "severity": "Medium",
        "category": "pattern-adherence",
        "description": "Naming doesn't match reference",
        "file": "path/to/file",
        "suggestion": "Change getData to GetData per .NET convention"
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

**Send back to original model to fix:**

1. **Update feature status:**
```json
{
  "status": "in_progress",
  "blocked_reason": "Review failed — [summary of main issues]. See review.remaining_issues for details"
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
    "notes": "Sent back to [model] for fixes: [issue summary]"
  }
}
```

3. **Display instructions for original model:**
```
📋 Instructions for [model] — Feature #X:

  Must fix:
  1. [Medium] pattern-adherence: [description] → [suggestion]
  2. [Medium] coding-standards: [description] → [suggestion]

  Reference: See Feature #Y (opus reference implementation)
  Files to compare:
  - reference: [file from opus feature]
  - yours: [file from this feature]

  After fixing: run /review #X again
```

---

#### Step 7C: Pass / Pass with Suggestions

**No Critical/High issues:**

**If score >= 80 → `pass`:**
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
    "notes": "Passed review — good code quality"
  }
}
```

**If score 60-79 → `pass_with_suggestions`:**
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
    "notes": "Passed with suggestions — can improve in next iteration"
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

Add entry:

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

### Current status:
- Reviewed: X features
- Pending Review: Y features

---
```

---

## Output Format

Display in this format:

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
│ No issues        │ ✅ pass — store review record                │
│                  │                                              │
│ Medium/Low only  │ score >= 80: ✅ pass                         │
│ (no Crit/High)   │ score 60-79: ⚠️ pass_with_suggestions       │
│                  │ score < 60:  ❌ fail — send back to model    │
│                  │                                              │
│ Has Crit/High    │ 🔧 opus auto-fix Crit/High immediately      │
│                  │ then re-score:                               │
│                  │   score >= 80: ✅ pass                        │
│                  │   score 60-79: ⚠️ pass_with_suggestions      │
│                  │   score < 60:  ❌ fail — send back Med/Low   │
└──────────────────┴──────────────────────────────────────────────┘
```

---

## Issue Severity Guide

| Severity | Description | Examples | Action |
|----------|-------------|---------|--------|
| **Critical** | Non-functional / Security vulnerability | SQL injection, crash | 🔧 Opus auto-fix |
| **High** | Logic error or missing critical feature | Missing validation, wrong calculation | 🔧 Opus auto-fix |
| **Medium** | Pattern mismatch / Missing edge case | Different naming, no error handling | 📋 Send back to original model |
| **Low** | Style / Minor improvements | Inconsistent formatting | 📋 Send back to original model |
| **Info** | Suggestion / Nice to have | Alternative approach suggestion | 📋 Send back to original model |

## Issue Categories

| Category | Description |
|----------|-------------|
| `pattern-adherence` | Doesn't match reference implementation |
| `acceptance-criteria` | Acceptance criteria not fully met |
| `code-correctness` | Logic errors, bugs |
| `security` | Security vulnerabilities |
| `performance` | Performance issues |
| `coding-standards` | Doesn't follow conventions |
| `error-handling` | Inappropriate error handling |

> 💬 **หมายเหตุ**: คำสั่งนี้จะตอบกลับเป็นภาษาไทย
