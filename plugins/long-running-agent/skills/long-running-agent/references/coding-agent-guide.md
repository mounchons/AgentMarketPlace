# Coding Agent Guide

คู่มือสำหรับ Coding Agent - ใช้ทุกครั้งหลังจาก Initialize แล้ว

## 🎯 หน้าที่ของ Coding Agent

```
┌─────────────────────────────────────────────────────────────┐
│                      CODING AGENT                           │
│                    (เรียกซ้ำหลายครั้ง)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ทุก Session ต้องทำ:                                        │
│                                                             │
│  1. 📖 อ่าน Context     ─── progress.md, git log            │
│  2. ✅ Verify Env       ─── project ทำงานได้                │
│  3. 📋 Select Feature   ─── เลือก 1 feature                 │
│  4. 💻 Implement        ─── เขียน code                     │
│  5. 🧪 Test             ─── ทดสอบจริง                      │
│  6. ✔️  Mark Pass        ─── อัพเดท feature_list            │
│  7. 📝 Commit           ─── git commit                     │
│  8. 📊 Update Progress  ─── เขียน session log              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Step-by-Step Workflow

### Step 1: Get Context (สำคัญมาก!)

**ต้องทำทุกครั้งก่อนเริ่มงาน:**

```bash
# 1. ดูว่าอยู่ directory ไหน
pwd

# 2. อ่าน progress log
cat .agent/progress.md

# 3. ดู git history
git log --oneline -10

# 4. ดู feature list
cat feature_list.json | jq '.features[] | select(.passes == false) | {id, description, priority}'
```

**ผลลัพธ์ที่ควรได้:**
```
จาก progress.md:
- Session ก่อนทำ Feature #3 เสร็จ
- Feature ถัดไปคือ #4

จาก git log:
- abc1234 feat: Feature #3 - Add TodoItem entity
- def5678 feat: Feature #2 - Setup EF Core
- ...

จาก feature_list.json:
- Feature #4: GET /api/todos (passes: false, priority: high)
- Feature #5: GET /api/todos/{id} (passes: false, priority: high)
- ...
```

### Step 2: Verify Environment

**ตรวจสอบว่า project ทำงานได้:**

```bash
# สำหรับ .NET
dotnet build
dotnet run &  # รัน background

# ทดสอบ basic endpoint (ถ้ามี)
curl http://localhost:5000/health
```

**ถ้า build fail:**
1. ดู error message
2. แก้ไข code
3. อย่าทำ feature ใหม่จนกว่า build จะผ่าน

### Step 3: Select Feature

**เลือก feature ที่จะทำ:**

```json
{
  "id": 4,
  "category": "api",
  "description": "GET /api/todos - ดึงรายการ todos ทั้งหมด",
  "priority": "high",
  "steps": [
    "สร้าง TodosController",
    "implement GetAll endpoint",
    "ทดสอบด้วย Swagger"
  ],
  "passes": false
}
```

**กฎการเลือก:**
1. เลือก `passes: false`
2. เลือก `priority: high` ก่อน
3. ตรวจสอบ dependency (ถ้ามี)
4. **ทำทีละ 1 feature เท่านั้น!**

### Step 4: Implement Feature

**ทำตาม steps ที่ระบุไว้:**

```
🎯 Working on Feature #4: GET /api/todos

Step 1: สร้าง TodosController
─────────────────────────────
[สร้างไฟล์ Controllers/TodosController.cs]

Step 2: implement GetAll endpoint
─────────────────────────────────
[เขียน code สำหรับ GET endpoint]

Step 3: ทดสอบด้วย Swagger
─────────────────────────
[รัน project และทดสอบ]
```

**Best Practices:**
- เขียน code ที่ clean และ readable
- Follow coding standards ของ project
- เขียน comments ถ้าจำเป็น
- อย่าลืม error handling

### Step 5: Test Feature

**⚠️ ห้าม mark pass โดยไม่ test!**

**วิธีทดสอบ:**

```bash
# 1. Unit tests (ถ้ามี)
dotnet test

# 2. Manual test ด้วย curl/Postman
curl http://localhost:5000/api/todos
# Expected: [] หรือ list ของ todos

# 3. Test edge cases
curl http://localhost:5000/api/todos/999
# Expected: 404 Not Found

# 4. Test ด้วย Swagger UI
# http://localhost:5000/swagger
```

**Test Checklist:**
- [ ] Happy path ผ่าน
- [ ] Error cases handle ถูกต้อง
- [ ] Response format ถูกต้อง
- [ ] Build ผ่าน
- [ ] ไม่มี warnings/errors ใน console

### Step 6: Mark as Passed

**แก้ไข feature_list.json:**

```json
{
  "id": 4,
  "description": "GET /api/todos - ดึงรายการ todos ทั้งหมด",
  "passes": true,  // ← เปลี่ยนจาก false
  "tested_at": "2025-01-01T14:30:00Z",
  "notes": "Tested with curl and Swagger, returns empty array initially"
}
```

**อัพเดท summary:**
```json
{
  "summary": {
    "total": 11,
    "passed": 4,  // ← เพิ่ม
    "failed": 7,  // ← ลด
    "last_updated": "2025-01-01T14:30:00Z"
  }
}
```

### Step 7: Commit Changes

**Commit format:**
```bash
git add .
git commit -m "feat: Feature #4 - GET /api/todos endpoint

- Created TodosController
- Implemented GetAll endpoint returning list of todos
- Tested with curl and Swagger UI"
```

**Commit message guidelines:**
- ใช้ format: `feat: Feature #X - description`
- บอกสิ่งที่ทำใน body
- บอกวิธี test (ถ้ามี)

### Step 8: Update Progress Log

**เพิ่มใน .agent/progress.md:**

```markdown
---

## Session 4 - CODING
**Date**: 2025-01-01 14:30 UTC
**Type**: Coding
**Duration**: ~25 minutes

### สิ่งที่ทำ:
- ✅ Feature #4: GET /api/todos endpoint
  - สร้าง TodosController
  - Implement GetAll endpoint
  - Tested with curl and Swagger

### Test Results:
- curl http://localhost:5000/api/todos → ✅ 200 OK, []
- Swagger UI → ✅ Working

### สถานะปัจจุบัน:
- Features passed: 4/11 (36%)
- Build: ✅ Passing
- Tests: N/A

### Feature ถัดไป:
- **Feature #5**: GET /api/todos/{id} - ดึง todo ตาม id
  - Priority: High
  - Category: API

### Git:
- Commit: `feat: Feature #4 - GET /api/todos endpoint`

### หมายเหตุ:
- API returns empty array initially (no data seeded)
- Ready for Feature #5

---
```

---

## 📊 Session Summary Template

เมื่อจบ session ควรแจ้ง user:

```markdown
✅ Session Complete!

📋 Feature Completed:
- Feature #4: GET /api/todos endpoint

🧪 Test Results:
- curl test: ✅ Passed
- Swagger: ✅ Working

📊 Progress:
- Before: 3/11 (27%)
- After: 4/11 (36%)

📝 Git Commit:
- feat: Feature #4 - GET /api/todos endpoint

🚀 Next Feature:
- Feature #5: GET /api/todos/{id}

💡 To continue:
- รัน `/continue` ใน session ถัดไป
```

---

## ⚠️ Common Mistakes & Solutions

### ❌ ลืมอ่าน context ก่อนเริ่มงาน

```
ผิด: เริ่มเขียน code เลยโดยไม่ดู progress
ถูก: อ่าน progress.md และ git log ก่อนเสมอ
```

### ❌ ทำหลาย features ใน 1 session

```
ผิด: "เอาล่ะ ทำ Feature #4, #5, #6 เลย"
ถูก: ทำทีละ 1 feature, commit, แล้วค่อยทำต่อ
```

### ❌ Mark pass โดยไม่ test

```
ผิด: เขียน code เสร็จ → mark pass ทันที
ถูก: เขียน code → test จริง → ผ่าน → mark pass
```

### ❌ ลืม commit

```
ผิด: ทำ feature เสร็จ แล้วจบ session เลย
ถูก: ทำ feature เสร็จ → commit → update progress → จบ session
```

### ❌ ทิ้งงานในสถานะ broken

```
ผิด: build fail แต่จบ session ไปเลย
ถูก: แก้ให้ build ผ่านก่อน หรือ revert ถ้าแก้ไม่ได้
```

---

## 🔄 Recovery Scenarios

### Scenario 1: Build Fail

```bash
# 1. ดู error
dotnet build 2>&1 | head -50

# 2. แก้ไข error

# 3. Build ใหม่
dotnet build

# 4. ถ้าแก้ไม่ได้ใน session นี้
git stash  # หรือ
git checkout .  # revert changes
```

### Scenario 2: Feature ซับซ้อนกว่าที่คิด

```markdown
## Session Notes

### สิ่งที่ทำ:
- 🔄 Feature #7: Partially completed
  - ✅ Created validator class
  - ❌ Integration with controller (not done)

### สถานะ:
- Feature #7: NOT PASSED (incomplete)
- Code committed but feature not working end-to-end

### ให้ Session ถัดไป:
- ทำ Feature #7 ต่อ
- ยังขาด: integrate validator กับ controller
```

### Scenario 3: พบ Bug ใน Feature ก่อนหน้า

```markdown
## Session Notes

### สิ่งที่ทำ:
- 🐛 พบ bug ใน Feature #4 (GET /api/todos)
  - Bug: ไม่ filter soft-deleted items
  - Fix: เพิ่ม .Where(x => !x.IsDeleted)
- ✅ Feature #5: GET /api/todos/{id}

### Git:
1. `fix: Feature #4 - Filter soft-deleted items`
2. `feat: Feature #5 - GET /api/todos/{id}`
```

---

## 💡 Pro Tips

### 1. ใช้ Checklist

```markdown
## Feature #4 Checklist
- [ ] อ่าน progress.md
- [ ] ดู git log
- [ ] Build project
- [ ] Implement feature
- [ ] Test
- [ ] Mark pass
- [ ] Commit
- [ ] Update progress
```

### 2. เขียน Test Cases ก่อน Implement

```markdown
## Test Plan for Feature #5

1. GET /api/todos/1 (exists) → 200 OK + todo object
2. GET /api/todos/999 (not exists) → 404 Not Found
3. GET /api/todos/abc (invalid id) → 400 Bad Request
```

### 3. ใช้ Time Boxing

```
- ตั้งเป้า: 30 นาทีต่อ feature
- ถ้าเกิน: บันทึกสถานะ, ให้ session ถัดไปทำต่อ
```

### 4. Commit บ่อย

```bash
# Commit เมื่อมี progress ที่ meaningful
git commit -m "wip: Feature #5 - Add controller skeleton"
git commit -m "wip: Feature #5 - Implement GetById logic"
git commit -m "feat: Feature #5 - Complete GET /api/todos/{id}"
```

---

## 📝 Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│                 CODING AGENT QUICK REF                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔰 Start Session:                                          │
│     cat .agent/progress.md                                  │
│     git log --oneline -5                                    │
│     cat feature_list.json | jq '.summary'                   │
│                                                             │
│  🎯 Select Feature:                                         │
│     passes: false + highest priority                        │
│     ทำทีละ 1 เท่านั้น!                                       │
│                                                             │
│  🧪 Test Before Mark Pass:                                  │
│     - Build ผ่าน                                           │
│     - Manual test ผ่าน                                     │
│     - Edge cases ผ่าน                                      │
│                                                             │
│  📝 End Session:                                            │
│     git commit -m "feat: Feature #X - ..."                  │
│     Update .agent/progress.md                               │
│     Update feature_list.json summary                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
