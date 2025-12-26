---
description: รัน tests และแสดงผลลัพธ์
allowed-tools: Bash(*), Read(*)
---

# Test Command

รัน tests และแสดงผลลัพธ์

## Input ที่ได้รับ

```
/test
/test [name]
/test --failed
/test --filter [expression]
$ARGUMENTS
```

## ขั้นตอนที่ต้องทำ

### Step 1: ระบุ Test Framework

```bash
# ตรวจสอบ technology
ls *.csproj 2>/dev/null && echo ".NET"
ls package.json 2>/dev/null && echo "Node.js"
ls requirements.txt 2>/dev/null && echo "Python"
```

### Step 2: รัน Tests

**.NET:**
```bash
dotnet test --logger "console;verbosity=detailed"

# เฉพาะ project
dotnet test [project] --logger "console;verbosity=detailed"

# เฉพาะ filter
dotnet test --filter "FullyQualifiedName~[name]"
```

**Node.js:**
```bash
npm test

# หรือ
npx jest [name]
npx vitest [name]
```

**Python:**
```bash
pytest -v

# เฉพาะ
pytest -v -k "[name]"
```

### Step 3: วิเคราะห์ผลลัพธ์

1. นับ passed/failed/skipped
2. ระบุ failing tests
3. วิเคราะห์ error messages

### Step 4: แสดงผล

```markdown
🧪 Running Tests...

## Test Results

- Total Tests: X
- ✅ Passed: X
- ❌ Failed: X
- ⏭️ Skipped: X

Duration: Xs

## Failed Tests (if any)

1. [TestName]
   File: [file:line]
   Error: [error message]

   💡 Suggested Fix:
   [suggestions]
```

## Output

แสดงผล tests พร้อม suggestions สำหรับ failing tests
