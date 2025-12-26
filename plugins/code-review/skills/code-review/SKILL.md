---
name: code-review
description: |
  ตรวจสอบคุณภาพ code อัตโนมัติ รองรับ security vulnerabilities, best practices,
  code smell detection และ PR review พร้อมให้คำแนะนำการปรับปรุง

  ใช้เมื่อ: (1) ต้องการ review code ก่อน commit/merge (2) ตรวจสอบ security issues
  (3) หา code smells (4) ตรวจสอบ coding standards (5) review Pull Request

  Triggers: "review code", "code review", "ตรวจสอบ code", "check security",
  "code quality", "PR review", "pull request", "best practices"
---

# Code Review Skill

Skill สำหรับตรวจสอบคุณภาพ code อัตโนมัติ พร้อมให้คำแนะนำการปรับปรุง

## วัตถุประสงค์

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CODE REVIEW WORKFLOW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐                                                        │
│  │   Source Code   │                                                        │
│  │   หรือ PR       │                                                        │
│  └────────┬────────┘                                                        │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │                      CODE REVIEW SKILL                          │        │
│  │                                                                  │        │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │        │
│  │  │   Security   │ │    Code      │ │    Best      │             │        │
│  │  │    Check     │ │   Smells     │ │  Practices   │             │        │
│  │  └──────────────┘ └──────────────┘ └──────────────┘             │        │
│  │                                                                  │        │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │        │
│  │  │  Standards   │ │ Performance  │ │  Complexity  │             │        │
│  │  │   Check      │ │    Check     │ │   Analysis   │             │        │
│  │  └──────────────┘ └──────────────┘ └──────────────┘             │        │
│  │                                                                  │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │                       REVIEW REPORT                              │        │
│  │                                                                  │        │
│  │  • Issues found (Critical/Warning/Info)                         │        │
│  │  • Recommendations                                               │        │
│  │  • Code examples                                                 │        │
│  │  • Overall score                                                 │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## ตัวอย่างคำสั่งที่ใช้ได้

| สิ่งที่ต้องการ | ตัวอย่างคำสั่ง |
|---------------|---------------|
| **Review ไฟล์เดียว** | `/code-review src/controllers/UserController.cs` |
| **Review ทั้งโฟลเดอร์** | `/code-review src/` |
| **Review PR** | `/review-pr 123` หรือ `/review-pr` (current branch) |
| **เฉพาะ Security** | `/code-review --security src/` |
| **เฉพาะ Performance** | `/code-review --performance src/` |

---

## Review Categories

### 1. Security Check

ตรวจสอบช่องโหว่ด้านความปลอดภัย:

| Issue Type | Description | Severity |
|------------|-------------|----------|
| **SQL Injection** | String concatenation in queries | Critical |
| **XSS** | Unescaped user input in HTML | Critical |
| **CSRF** | Missing anti-forgery tokens | High |
| **Sensitive Data** | Hardcoded secrets/passwords | Critical |
| **Auth Issues** | Weak authentication/authorization | High |
| **Input Validation** | Missing or weak validation | Medium |
| **Insecure Dependencies** | Known vulnerable packages | High |

### 2. Code Smells

ตรวจสอบ patterns ที่ไม่ดี:

| Smell | Description | Impact |
|-------|-------------|--------|
| **Long Method** | Method > 30 lines | Maintainability |
| **Large Class** | Class > 300 lines | Maintainability |
| **Duplicate Code** | Copy-paste code | DRY violation |
| **Dead Code** | Unused code | Clutter |
| **Magic Numbers** | Hardcoded values | Readability |
| **Deep Nesting** | > 3 levels of nesting | Complexity |
| **God Class** | Class doing too much | SRP violation |

### 3. Best Practices

ตรวจสอบ coding standards:

| Practice | Description |
|----------|-------------|
| **Naming Conventions** | PascalCase, camelCase ตาม standards |
| **Error Handling** | Try-catch, proper exceptions |
| **Null Safety** | Null checks, nullable types |
| **Async/Await** | Proper async patterns |
| **SOLID Principles** | Single Responsibility, etc. |
| **Documentation** | XML comments, README |

### 4. Performance

ตรวจสอบ performance issues:

| Issue | Description |
|-------|-------------|
| **N+1 Queries** | Multiple DB calls in loops |
| **Memory Leaks** | Undisposed resources |
| **Blocking Calls** | Sync calls in async context |
| **Large Collections** | Loading entire tables |
| **String Concatenation** | In loops without StringBuilder |

---

## Review Output Format

### Summary Report

```markdown
# Code Review Report

## Overview
- **Files Reviewed**: 15
- **Total Issues**: 23
- **Critical**: 2
- **High**: 5
- **Medium**: 10
- **Low**: 6
- **Overall Score**: 72/100

## Critical Issues

### 1. SQL Injection in UserRepository.cs:45

**Issue**: User input directly concatenated in SQL query
**Severity**: Critical
**File**: src/Repositories/UserRepository.cs
**Line**: 45

```csharp
// BAD
var query = $"SELECT * FROM Users WHERE Email = '{email}'";

// GOOD
var query = "SELECT * FROM Users WHERE Email = @Email";
cmd.Parameters.AddWithValue("@Email", email);
```

**Fix**: Use parameterized queries

---

### 2. Hardcoded Secret in AppSettings.cs:12

**Issue**: API key hardcoded in source code
**Severity**: Critical
**File**: src/Config/AppSettings.cs
**Line**: 12

```csharp
// BAD
private const string ApiKey = "sk-abc123...";

// GOOD
var apiKey = Environment.GetEnvironmentVariable("API_KEY");
```

**Fix**: Use environment variables or secrets manager

---

## High Priority Issues

### 3. Missing Input Validation in CreateUser endpoint
...

## Medium Priority Issues
...

## Recommendations

1. **Enable nullable reference types** - ป้องกัน NullReferenceException
2. **Add integration tests** - ไม่มี tests สำหรับ API endpoints
3. **Implement logging** - ไม่มี structured logging
4. **Add API versioning** - เตรียมสำหรับ breaking changes

## Files with Most Issues

| File | Critical | High | Medium | Low |
|------|----------|------|--------|-----|
| UserRepository.cs | 1 | 2 | 3 | 1 |
| AuthController.cs | 1 | 1 | 2 | 0 |
| OrderService.cs | 0 | 2 | 2 | 2 |
```

---

## Integration with long-running-agent

เมื่อ review เสร็จ สามารถเพิ่ม issues เข้า feature_list.json:

```bash
# หลังจาก review เสร็จ
"เพิ่ม issues ที่พบเข้า feature_list.json"

# Claude จะ:
# 1. อ่าน feature_list.json
# 2. เพิ่ม features สำหรับแก้ไขแต่ละ issue
# 3. Update summary
```

---

## PR Review Mode

สำหรับ review Pull Request:

```bash
/review-pr 123
# หรือ
/review-pr  # review current branch vs main
```

**Output:**

```markdown
# Pull Request Review: #123

## Summary
- **Title**: Add user authentication
- **Author**: developer
- **Files Changed**: 8
- **Additions**: +245
- **Deletions**: -12

## Review Status: ⚠️ Changes Requested

### Critical Issues (Must Fix)
1. SQL Injection vulnerability in UserRepository.cs

### Suggestions (Should Consider)
1. Add unit tests for AuthService
2. Consider using dependency injection

### Comments
- Good separation of concerns
- Clean implementation of JWT

## Recommendation
❌ **Request Changes** - มี critical issues ที่ต้องแก้ไขก่อน merge
```

---

## Commands

| Command | Description |
|---------|-------------|
| `/code-review [path]` | Review code ที่ path ระบุ |
| `/code-review --security` | เฉพาะ security issues |
| `/code-review --performance` | เฉพาะ performance issues |
| `/code-review --full` | Full review ทุก category |
| `/review-pr [number]` | Review Pull Request |

---

## Severity Levels

| Level | Icon | Action Required |
|-------|------|-----------------|
| **Critical** | 🔴 | ต้องแก้ไขทันที ก่อน merge |
| **High** | 🟠 | ควรแก้ไขก่อน merge |
| **Medium** | 🟡 | ควรแก้ไขเมื่อมีเวลา |
| **Low** | 🔵 | Nice to have |
| **Info** | ⚪ | ข้อแนะนำ |

---

## References

| File | Description |
|------|-------------|
| `references/security-checklist.md` | OWASP Top 10 checklist |
| `references/code-smells.md` | รายการ code smells ทั้งหมด |
| `references/best-practices.md` | Coding best practices |
| `references/performance-tips.md` | Performance optimization tips |
