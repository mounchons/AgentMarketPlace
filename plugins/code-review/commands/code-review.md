---
description: ตรวจสอบคุณภาพ code อัตโนมัติ รองรับ security, best practices, code smells
allowed-tools: Bash(*), Read(*), Glob(*), Grep(*)
---

# Code Review Command

ตรวจสอบคุณภาพ code ที่ระบุ

## Input ที่ได้รับ

```
/code-review [path]
/code-review --security [path]
/code-review --performance [path]
$ARGUMENTS
```

## ขั้นตอนที่ต้องทำ

### Step 1: วิเคราะห์ Input

- ระบุ path ที่ต้อง review (ไฟล์หรือโฟลเดอร์)
- ระบุ mode (full, security, performance)
- ระบุ technology stack

### Step 2: อ่าน Code

```bash
# ถ้าเป็นไฟล์เดียว
cat [file]

# ถ้าเป็นโฟลเดอร์
find [path] -type f \( -name "*.cs" -o -name "*.ts" -o -name "*.js" \) | head -50
```

### Step 3: ตรวจสอบตาม Categories

**Security Check:**
- SQL Injection
- XSS
- Hardcoded secrets
- Input validation
- Authentication/Authorization

**Code Smells:**
- Long methods (> 30 lines)
- Large classes (> 300 lines)
- Duplicate code
- Deep nesting (> 3 levels)
- Magic numbers

**Best Practices:**
- Naming conventions
- Error handling
- Null safety
- Async patterns
- SOLID principles

**Performance:**
- N+1 queries
- Memory leaks
- Blocking calls
- Large collections

### Step 4: สร้าง Report

จัดทำ report ตาม format:

```markdown
# Code Review Report

## Overview
- Files Reviewed: X
- Total Issues: X
- Critical: X
- High: X
- Medium: X
- Low: X
- Overall Score: XX/100

## Critical Issues
[รายละเอียด issues พร้อม code examples และ fixes]

## High Priority Issues
...

## Recommendations
[คำแนะนำการปรับปรุง]
```

## Output

แสดง report พร้อม:
1. Summary ของ issues ที่พบ
2. รายละเอียดแต่ละ issue พร้อม code examples
3. แนะนำวิธีแก้ไข
4. Overall score
