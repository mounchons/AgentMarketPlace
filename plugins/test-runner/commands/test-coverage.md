---
description: แสดง test coverage report
allowed-tools: Bash(*), Read(*)
---

# Test Coverage Command

แสดง test coverage และวิเคราะห์ gaps

## Input ที่ได้รับ

```
/test-coverage
/test-coverage --threshold [number]
/test-coverage --project [name]
$ARGUMENTS
```

## ขั้นตอนที่ต้องทำ

### Step 1: รัน Tests with Coverage

**.NET:**
```bash
dotnet test --collect:"XPlat Code Coverage"

# หรือใช้ coverlet
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=lcov
```

**Node.js:**
```bash
npm test -- --coverage

# หรือ
npx jest --coverage
npx vitest --coverage
```

**Python:**
```bash
pytest --cov=. --cov-report=term-missing
```

### Step 2: วิเคราะห์ Coverage

1. คำนวณ overall coverage
2. แยกตาม project/folder
3. หา files ที่ต่ำกว่า threshold

### Step 3: แสดงผล

```markdown
📊 Coverage Report

## Overall Coverage: XX%

## By Project/Folder:
| Project | Coverage |
|---------|----------|
| Domain | XX% |
| Application | XX% |

## Files Below Threshold:
| File | Coverage | Missing Lines |
|------|----------|---------------|
| [file] | XX% | [lines] |

## Recommendations:
1. Add tests for [...]
```

## Output

แสดง coverage report พร้อม recommendations
