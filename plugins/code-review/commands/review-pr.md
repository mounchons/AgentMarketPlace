---
description: Review Pull Request พร้อมให้คำแนะนำ
allowed-tools: Bash(*), Read(*), Glob(*), Grep(*)
---

# Review PR Command

Review Pull Request และให้ feedback

## Input ที่ได้รับ

```
/review-pr [number]
/review-pr  (review current branch vs main)
$ARGUMENTS
```

## ขั้นตอนที่ต้องทำ

### Step 1: ดู PR Information

```bash
# ถ้ามี PR number
gh pr view [number]
gh pr diff [number]

# ถ้าไม่มี (review current branch)
git diff main...HEAD
git log main..HEAD --oneline
```

### Step 2: วิเคราะห์ Changes

1. ดู files ที่เปลี่ยน
2. ดู additions/deletions
3. ระบุ scope ของ changes

### Step 3: Review Code

ใช้ code-review skill ตรวจสอบ:
- Security issues
- Code quality
- Best practices
- Test coverage

### Step 4: สร้าง Review Summary

```markdown
# Pull Request Review: #[number]

## Summary
- Title: [title]
- Author: [author]
- Files Changed: X
- Additions: +X
- Deletions: -X

## Review Status: [Approve/Request Changes/Comment]

### Critical Issues (Must Fix)
[issues ที่ต้องแก้ก่อน merge]

### Suggestions (Should Consider)
[suggestions ที่ควรพิจารณา]

### Comments
[comments ทั่วไป]

## Recommendation
[สรุปว่าควร approve หรือ request changes]
```

## Output

แสดง review พร้อม recommendation
