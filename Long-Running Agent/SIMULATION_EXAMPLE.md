# 🎬 Simulation: ตัวอย่างการทำงานของ Coding Agent

## Session 2 - Coding Agent เริ่มทำงาน

### Step 1: ดู Working Directory

```bash
$ pwd
/home/claude/long-running-agent-demo
```

Agent: "OK อยู่ใน project directory แล้ว"

---

### Step 2: อ่าน Progress Log

```bash
$ cat claude-progress.txt

# Claude Progress Log
================================================================================
## Session 1 - [INITIALIZER AGENT]
Date: 2025-01-01 10:00 UTC
Agent Type: Initializer
--------------------------------------------------------------------------------

### สิ่งที่ทำ:
1. ✅ สร้าง project structure
2. ✅ สร้าง feature_list.json พร้อมรายการ features 10 รายการ
...

### สิ่งที่ต้องทำต่อ:
- เริ่มจาก Feature #1: สร้าง ASP.NET Core Web API project
```

Agent: "เข้าใจแล้ว! Session ก่อนสร้างแค่ structure ยังไม่มี code จริง ต้องเริ่มจาก Feature #1"

---

### Step 3: ดู Git Log

```bash
$ git log --oneline -5
a1b2c3d (HEAD -> main) Initial setup - project structure
```

Agent: "มี commit เดียว คือ initial setup"

---

### Step 4: รัน init.sh

```bash
$ bash init.sh

============================================
  🚀 Initializing Development Environment
============================================

📁 Working directory: /home/claude/long-running-agent-demo

🔍 Checking .NET SDK...
   ✅ .NET SDK version: 8.0.100

🔍 Checking project structure...
   ⚠️  TodoApp project not found
   📝 Run Feature #1 first to create the project

📋 Feature Progress:
   Total: 10 features
   Passed: 0
   Remaining: 10

============================================
  ✅ Environment Ready!
============================================
```

Agent: "Project ยังไม่ได้สร้าง ต้องทำ Feature #1 ก่อน"

---

### Step 5: ดู Feature List

```bash
$ cat feature_list.json | jq '.features[] | select(.passes == false) | {id, description, priority}' | head -20

{
  "id": 1,
  "description": "สร้าง ASP.NET Core Web API project พร้อม Entity Framework Core",
  "priority": "high"
}
```

Agent: "Feature #1 มี priority high และยังไม่ pass - จะทำอันนี้!"

---

### Step 6: Implement Feature #1

```
🎯 Working on Feature #1: สร้าง ASP.NET Core Web API project

Step 1: สร้าง project folder
$ mkdir -p src
$ cd src

Step 2: สร้าง Web API project
$ dotnet new webapi -n TodoApp
The template "ASP.NET Core Web API" was created successfully.

Step 3: เพิ่ม Entity Framework Core packages
$ cd TodoApp
$ dotnet add package Microsoft.EntityFrameworkCore.Sqlite
$ dotnet add package Microsoft.EntityFrameworkCore.Design

Step 4: Build และ test
$ dotnet build
Build succeeded.
0 Warning(s)
0 Error(s)

Step 5: Run project
$ dotnet run &
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000

Step 6: Test endpoint
$ curl http://localhost:5000/weatherforecast
[{"date":"2025-01-02","temperatureC":25,...}]
✅ API responding!
```

---

### Step 7: Mark Feature as Passed

```bash
# แก้ไข feature_list.json
# เปลี่ยน Feature #1: "passes": false -> "passes": true

$ cat feature_list.json | jq '.features[0]'
{
  "id": 1,
  "description": "สร้าง ASP.NET Core Web API project พร้อม Entity Framework Core",
  "passes": true,  # ✅ Changed!
  "notes": "Tested: dotnet build passed, API responds on port 5000"
}
```

---

### Step 8: Git Commit

```bash
$ git add .
$ git commit -m "feat: Feature #1 - Create ASP.NET Core Web API project with EF Core

- Created TodoApp Web API project
- Added EF Core SQLite packages
- Verified build and runtime
- API responds on http://localhost:5000"

[main d4e5f6g] feat: Feature #1 - Create ASP.NET Core Web API project with EF Core
 15 files changed, 423 insertions(+)
```

---

### Step 9: Update Progress Log

```bash
$ cat >> claude-progress.txt << 'EOF'

================================================================================
## Session 2 - [CODING AGENT]
Date: 2025-01-01 14:30 UTC
Agent Type: Coding
Duration: ~20 minutes
--------------------------------------------------------------------------------

### เริ่มต้น Session:
- [x] อ่าน progress log
- [x] ดู git log
- [x] รัน init.sh
- [x] ตรวจสอบว่า project ยังไม่ได้สร้าง

### สิ่งที่ทำ:
1. ✅ Feature #1: สร้าง ASP.NET Core Web API project
   - สร้าง TodoApp project ด้วย dotnet new webapi
   - เพิ่ม EF Core Sqlite packages
   - Build passed
   - API responds on http://localhost:5000/weatherforecast

### สถานะปัจจุบัน:
- Features passed: 1/10
- Project รัน: ✅
- Build: ✅

### สิ่งที่ต้องทำต่อ:
- Feature #2: สร้าง TodoItem entity และ DbContext

### หมายเหตุ:
- ใช้ SQLite สำหรับ development
- Default WeatherForecast controller ยังอยู่ (จะลบทีหลัง)

================================================================================
EOF
```

---

### Session Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    SESSION 2 COMPLETE                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ Feature #1 PASSED                                       │
│                                                             │
│  Git commit: d4e5f6g                                        │
│  Progress: 1/10 features (10%)                              │
│                                                             │
│  Next session should work on:                               │
│  └── Feature #2: สร้าง TodoItem entity และ DbContext        │
│                                                             │
│  Environment left in clean state:                           │
│  ├── Build: ✅ passing                                      │
│  ├── Server: ✅ running                                     │
│  └── Code: ✅ committed                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Session 3 - Coding Agent ต่อจาก Session 2

### Quick Start

```bash
# Agent ใหม่เริ่มต้น
$ cat claude-progress.txt | tail -30
# "Session 2 ทำ Feature #1 เสร็จแล้ว ต่อไปคือ Feature #2"

$ git log --oneline -3
d4e5f6g feat: Feature #1 - Create ASP.NET Core Web API project with EF Core
a1b2c3d Initial setup - project structure

$ bash init.sh
# ✅ Build passed
# ✅ Server running on http://localhost:5000

$ cat feature_list.json | jq '.features[1]'
# Feature #2: สร้าง TodoItem entity และ DbContext
# passes: false

# พร้อมทำงานต่อ!
```

Agent: "เข้าใจ context แล้ว! Session ก่อนทำ Feature #1 เสร็จ ต่อไปทำ Feature #2"

---

## Key Observations

```
┌─────────────────────────────────────────────────────────────┐
│              สิ่งที่ทำให้ระบบนี้ทำงานได้ดี                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 📖 Progress log ช่วยให้เข้าใจ context ได้เร็ว            │
│     └── ไม่ต้องเดาว่าคนก่อนทำอะไร                           │
│                                                             │
│  2. 📋 Feature list บอกชัดเจนว่าต้องทำอะไรต่อ                │
│     └── ไม่ประกาศเสร็จก่อนเวลา                              │
│                                                             │
│  3. 🧪 Test ก่อน mark pass                                 │
│     └── มั่นใจว่า feature ใช้งานได้จริง                      │
│                                                             │
│  4. 📝 Git commit แยกต่าง feature                          │
│     └── ย้อนกลับได้ง่ายถ้ามีปัญหา                           │
│                                                             │
│  5. ✅ ทิ้งงานในสถานะ clean                                 │
│     └── Session ถัดไปเริ่มได้เลย                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
