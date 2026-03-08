---
name: long-running
version: 1.10.0
description: Harness สำหรับ AI Agent ทำงานข้าม context windows รองรับ multi-session, feature tracking, progress logging, incremental development, epic grouping, subtask tracking, acceptance criteria, CRUD enabled/disabled, soft delete strategy และ integration กับ ui-mockup, system-design-doc, dotnet-dev skills
---

# Long-Running Agent Skill

> **Version 1.10.0** - เพิ่ม Cross-Plugin Integration, CRUD enabled/disabled, soft delete strategy, Module Decomposition, Component Library

Skill สำหรับจัดการ AI Agent ที่ทำงานข้าม context windows ได้อย่างมีประสิทธิภาพ
อ้างอิงจาก [Anthropic Engineering Blog](https://www.anthropic.com/engineering/effective-harnesses-for-long-runnings)

## 🎯 ปัญหาที่แก้ได้

```
┌─────────────────────────────────────────────────────────────┐
│  ❌ ปัญหาของ AI Agent ทั่วไป                                │
├─────────────────────────────────────────────────────────────┤
│  1. พยายามทำทุกอย่างในครั้งเดียว (One-shot)                 │
│  2. ประกาศว่า "เสร็จแล้ว" ทั้งที่ยังไม่เสร็จ                │
│  3. ทิ้งงานค้างแบบไม่มีบันทึก                              │
│  4. Mark feature pass โดยไม่ได้ test จริง                  │
│  5. Session ใหม่ไม่รู้ว่าทำอะไรไปแล้วบ้าง                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  ✅ วิธีแก้ด้วย Long-Running Agent Harness                 │
├─────────────────────────────────────────────────────────────┤
│  1. บังคับทำทีละ feature (Incremental)                     │
│  2. มี feature_list.json ที่ชัดเจน                         │
│  3. บันทึก progress ทุก session                            │
│  4. Test ก่อน mark pass เสมอ                              │
│  5. Session ใหม่อ่าน context ได้ทันที                       │
└─────────────────────────────────────────────────────────────┘
```

## 💡 ตัวอย่างคำสั่งที่ใช้ได้

| สิ่งที่ต้องการ | ตัวอย่างคำสั่ง |
|---------------|---------------|
| **เริ่มโปรเจคใหม่** | `/init สร้าง Todo API ด้วย .NET Core` |
| **ทำงานต่อ** | `/continue` หรือ "ทำต่อจาก session ก่อน" |
| **ดูสถานะ** | `/status` หรือ "ดูความคืบหน้าโปรเจค" |
| **สร้าง feature จาก mockups** | `/generate-features-from-mockups` |
| **สร้าง feature จาก design** | `/generate-features-from-design` |
| **ตรวจสอบ coverage** | `/validate-coverage` |
| **Sync mockups** | `/sync-mockups` |
| **ดู dependencies** | `/dependencies` |
| **Migrate schema** | `/migrate` |

## 🏗️ สถาปัตยกรรม

```
┌─────────────────────────────────────────────────────────────┐
│                 LONG-RUNNING AGENT SYSTEM                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────┐         ┌─────────────────────────┐   │
│   │  INITIALIZER    │         │     CODING AGENT        │   │
│   │     AGENT       │────────▶│   (ทำงานซ้ำหลายรอบ)      │   │
│   │  (ครั้งแรกเท่านั้น) │         │                         │   │
│   └─────────────────┘         └─────────────────────────┘   │
│          │                              │                   │
│          ▼                              ▼                   │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              SHARED ARTIFACTS                       │   │
│   │  • feature_list.json  (รายการ features)             │   │
│   │  • .agent/progress.md (บันทึกความคืบหน้า)           │   │
│   │  • .agent/config.json (ตั้งค่า agent)               │   │
│   │  • Git History        (ประวัติการเปลี่ยนแปลง)        │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📁 ไฟล์ที่จะถูกสร้าง

เมื่อใช้ `/init` จะสร้างไฟล์เหล่านี้:

```
project-root/
├── .agent/                      # Agent configuration folder
│   ├── config.json              # Agent settings
│   ├── progress.md              # Session logs
│   └── prompts/                 # Custom prompts (optional)
├── feature_list.json            # รายการ features และสถานะ
├── init.sh                      # Setup script (optional)
└── ... (project files)
```

---

## 🚀 Quick Start

### Mode 1: เริ่มโปรเจคใหม่

```bash
# ใน Claude Code CLI
/init สร้าง Todo API ด้วย ASP.NET Core Web API, EF Core, PostgreSQL
```

หรือพิมพ์เอง:
```
Initialize long-running agent environment สำหรับ [อธิบาย project]
สร้าง feature_list.json และ .agent/ folder
```

### Mode 2: ทำงานต่อจาก session ก่อน

```bash
/continue
```

หรือพิมพ์เอง:
```
ทำหน้าที่ Coding Agent - อ่าน progress, ทำ feature ถัดไป
```

### Mode 3: ใช้กับโปรเจคที่มีอยู่แล้ว

```bash
/init-existing
```

หรือพิมพ์เอง:
```
วิเคราะห์โปรเจคนี้และสร้าง long-running agent environment
สร้าง feature_list.json จาก TODO/issues ที่มีอยู่
```

---

## 📋 Workflow Details

### Workflow 1: Initialize (ครั้งแรก)

```
1. วิเคราะห์ Requirements
   └── รับ input จากผู้ใช้ว่าต้องการสร้างอะไร

2. สร้าง Feature List
   └── แตก requirements เป็น features เล็กๆ
   └── แต่ละ feature ทำเสร็จใน 1 session
   └── เรียงตาม dependency

3. สร้าง Agent Config
   └── .agent/config.json - ตั้งค่า project
   └── .agent/progress.md - บันทึก session แรก

4. สร้าง Feature List File
   └── feature_list.json พร้อม passes: false ทุก feature

5. Git Init (ถ้ายังไม่มี)
   └── Initial commit

❌ ห้าม implement code ใน init phase!
```

### Workflow 2: Coding Session (ทุกครั้งหลัง init)

```
1. Get Context (ต้องทำก่อนเสมอ!)
   ├── อ่าน .agent/progress.md
   ├── ดู git log --oneline -10
   └── ดู feature_list.json

2. Verify Environment
   └── ตรวจสอบว่า project build/run ได้

3. Select Feature
   ├── หา feature ที่ passes=false
   ├── เลือก priority สูงสุด
   └── ทำทีละ 1 feature เท่านั้น!

4. Implement Feature
   ├── เขียน code
   ├── เขียน tests (ถ้ามี)
   └── ทำให้เสร็จสมบูรณ์

5. Test Feature
   ├── รัน tests
   ├── ทดสอบ manual (ถ้าจำเป็น)
   └── ต้องผ่านจริงก่อน mark pass!

6. Mark as Passed
   └── แก้ feature_list.json: passes: true

7. Commit Changes
   └── git commit -m "feat: Feature #X - description"

8. Update Progress
   └── เพิ่ม session log ใน .agent/progress.md
```

---

## 📝 File Formats

### feature_list.json

```json
{
  "project": "ชื่อโปรเจค",
  "description": "คำอธิบายโปรเจค",
  "created_at": "2025-01-01T00:00:00Z",
  "features": [
    {
      "id": 1,
      "category": "setup",
      "description": "สร้าง project structure",
      "priority": "high",
      "steps": [
        "ขั้นตอนที่ 1",
        "ขั้นตอนที่ 2"
      ],
      "passes": false,
      "tested_at": null,
      "notes": ""
    }
  ],
  "summary": {
    "total": 10,
    "passed": 0,
    "failed": 10,
    "last_updated": "2025-01-01T00:00:00Z"
  }
}
```

### .agent/config.json

```json
{
  "project_name": "ชื่อโปรเจค",
  "technology": ".NET Core",
  "initialized_at": "2025-01-01T00:00:00Z",
  "current_session": 1,
  "settings": {
    "auto_commit": true,
    "require_tests": true,
    "max_features_per_session": 1
  }
}
```

### .agent/progress.md

```markdown
# Project Progress Log

## Project Info
- **Name**: ชื่อโปรเจค
- **Technology**: .NET Core
- **Started**: 2025-01-01

---

## Session 1 - INITIALIZER
**Date**: 2025-01-01 10:00 UTC
**Type**: Initializer

### สิ่งที่ทำ:
- ✅ สร้าง feature_list.json
- ✅ สร้าง .agent/ config
- ✅ Initial commit

### สถานะ:
- Features: 0/10 passed

### ถัดไป:
- Feature #1: สร้าง project structure

---

## Session 2 - CODING
**Date**: 2025-01-01 14:00 UTC
**Type**: Coding

### สิ่งที่ทำ:
- ✅ Feature #1: สร้าง project structure

### สถานะ:
- Features: 1/10 passed
- Build: ✅
- Tests: N/A

### ถัดไป:
- Feature #2: ...

---
```

---

## ⚠️ กฎสำคัญ

### สำหรับ Initializer Agent

1. **อย่า implement code** - แค่วาง structure และ feature list
2. **Features ต้องเล็กพอ** - ทำเสร็จใน 1 session
3. **เรียงตาม dependency** - setup ก่อน, functional ทีหลัง
4. **ใช้ JSON format** - ป้องกันการแก้ไขผิดพลาด

### สำหรับ Coding Agent

1. **อ่าน context ก่อนเสมอ** - progress.md และ git log
2. **ทำทีละ 1 feature** - ห้าม one-shot!
3. **Test ก่อน mark pass** - ต้องผ่านจริง
4. **Commit ทุก feature** - แยก commit ชัดเจน
5. **Update progress** - ก่อนจบ session
6. **ทิ้งงานในสถานะ clean** - build ผ่าน, ไม่มี bug ค้าง

### กฎทั่วไป

```
┌─────────────────────────────────────────────────────────────┐
│                    CRITICAL RULES                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ❌ ห้ามทำ                                                  │
│  ├── ลบ features จาก feature_list.json                     │
│  ├── แก้ไข description ของ features                        │
│  ├── Mark pass โดยไม่ได้ test                              │
│  ├── ทำหลาย features ใน 1 session                          │
│  └── ประกาศว่าเสร็จถ้ายังมี feature ไม่ pass                │
│                                                             │
│  ✅ ต้องทำ                                                  │
│  ├── อ่าน progress ก่อนเริ่มงานเสมอ                         │
│  ├── Test ก่อน mark pass                                   │
│  ├── Commit แยกต่าง feature                                │
│  ├── Update progress ก่อนจบ session                        │
│  └── ทิ้ง code ในสถานะพร้อมใช้                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 Reference Files

| File | Description |
|------|-------------|
| `references/initializer-guide.md` | คู่มือ Initializer Agent |
| `references/coding-agent-guide.md` | คู่มือ Coding Agent |
| `references/feature-patterns.md` | Patterns สำหรับ feature breakdown |
| `references/troubleshooting.md` | แก้ไขปัญหาที่พบบ่อย |
| `templates/feature_list.json` | Template สำหรับ feature list |
| `templates/progress.md` | Template สำหรับ progress log |

---

## 🔗 Integration with Other Skills

### 📐 กับ ui-mockup skill

**เมื่อเริ่มพัฒนา ต้องตรวจสอบ `.mockups/` folder:**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    UI MOCKUP INTEGRATION                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. ตรวจสอบ .mockups/ folder                                       │
│     ls -la .mockups/                                               │
│     ls -la .mockups/*.mockup.md                                    │
│                                                                     │
│  2. อ่าน mockup ของหน้าที่กำลังพัฒนา                                │
│     cat .mockups/[page-name].mockup.md                             │
│                                                                     │
│  3. ใช้ข้อมูลจาก mockup:                                            │
│     ├── ASCII Wireframe → Layout structure                         │
│     ├── Component Specs → UI components ที่ต้องใช้                  │
│     ├── Design Tokens → Colors, spacing, typography                │
│     └── Responsive Specs → Mobile/Tablet/Desktop                   │
│                                                                     │
│  4. สร้าง Frontend ตาม wireframe design!                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

ไฟล์ที่ต้องตรวจสอบ:
├── .mockups/
│   ├── mockup_list.json        # รายการ mockups ทั้งหมด
│   ├── _design-tokens.yaml     # Shared design tokens
│   ├── login.mockup.md         # Mockup หน้า Login
│   ├── dashboard.mockup.md     # Mockup หน้า Dashboard
│   └── [page].mockup.md        # Mockup หน้าอื่นๆ
```

**⚠️ กฎสำคัญ:**
- ถ้าพบ `.mockups/` folder → **ต้อง**สร้าง UI ตาม wireframe
- **ห้าม**สร้าง UI ที่แตกต่างจาก mockup โดยไม่ได้รับอนุมัติ
- **ต้อง**ใช้ design tokens ที่กำหนด (colors, spacing, fonts)

---

### 📄 กับ system-design-doc skill

**เมื่อเริ่มพัฒนา ต้องตรวจสอบ Design Document:**

```
┌─────────────────────────────────────────────────────────────────────┐
│                SYSTEM DESIGN DOC INTEGRATION                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. ค้นหา Design Document                                          │
│     find . -name "*design*.md" -o -name "*system*.md"              │
│                                                                     │
│  2. อ่านส่วนสำคัญ:                                                  │
│     ├── ER Diagram      → สร้าง Database Schema                    │
│     ├── Data Dictionary → Field types & constraints                │
│     ├── Flow Diagram    → Business Logic implementation           │
│     ├── DFD             → Data Flow ระหว่าง modules               │
│     ├── Sitemap         → Route/Page structure                    │
│     └── Sequence Diagram→ API call sequences                      │
│                                                                     │
│  3. ใช้ข้อมูลจาก Design Doc:                                        │
│     ├── สร้าง Entity/Model ตาม ER Diagram                          │
│     ├── กำหนด field types ตาม Data Dictionary                      │
│     └── implement logic ตาม Flow Diagram                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Workflow ที่แนะนำ:
1. ใช้ /system-design-doc สร้างเอกสารออกแบบก่อน
2. ใช้ /ui-mockup สร้าง UI wireframes
3. ใช้ /init สร้าง feature_list.json จาก design docs
4. ใช้ /continue พัฒนาตาม mockups และ design docs
```

**⚠️ กฎสำคัญ:**
- ถ้าพบ Design Doc → **ต้อง**ใช้ ER Diagram สำหรับ database
- **ห้าม**สร้าง schema ที่แตกต่างจาก design โดยไม่ได้รับอนุมัติ
- **ต้อง**ใช้ Data Dictionary สำหรับ field specifications

---

### 🔧 กับ dotnet-dev skill

**สำหรับ .NET Core Projects:**

```
┌─────────────────────────────────────────────────────────────────────┐
│                   DOTNET-DEV INTEGRATION                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. ตรวจสอบว่าเป็น .NET project                                    │
│     ls -la *.csproj *.sln 2>/dev/null                              │
│                                                                     │
│  2. ถ้าพบ .csproj หรือ .sln → ใช้ /dotnet-dev skill                │
│                                                                     │
│  3. dotnet-dev skill จะช่วย:                                       │
│     ├── .NET best practices                                        │
│     ├── EF Core patterns (DbContext, Migrations)                   │
│     ├── Dependency Injection setup                                 │
│     ├── ASP.NET Core conventions                                   │
│     └── Testing patterns (xUnit, NUnit)                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Workflow ที่แนะนำ:
1. /init สร้าง ASP.NET Core API
2. Initializer ใช้ dotnet-dev patterns สำหรับ feature breakdown
3. Coding Agent ใช้ /dotnet-dev สำหรับ implementation
```

**⚠️ กฎสำคัญ:**
- ถ้าเป็น .NET project → **ต้อง**ใช้ `/dotnet-dev` skill
- **ต้อง**ใช้ .NET conventions และ best practices
- **ต้อง**ใช้ EF Core patterns ที่ถูกต้อง

---

### 🔄 Complete Workflow with All Skills

```
┌─────────────────────────────────────────────────────────────────────┐
│                    COMPLETE DEVELOPMENT WORKFLOW                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Phase 1: Design (ก่อนพัฒนา)                                        │
│  ┌─────────────────┐      ┌─────────────────┐                      │
│  │ /system-design  │ ───▶ │   /ui-mockup    │                      │
│  │      -doc       │      │                 │                      │
│  │                 │      │                 │                      │
│  │ Output:         │      │ Output:         │                      │
│  │ • ER Diagram    │      │ • Wireframes    │                      │
│  │ • Flow Diagram  │      │ • Design Tokens │                      │
│  │ • Data Dict     │      │ • Component Specs│                     │
│  └─────────────────┘      └─────────────────┘                      │
│           │                        │                               │
│           └───────────┬────────────┘                               │
│                       ▼                                            │
│  Phase 2: Initialize                                               │
│  ┌─────────────────────────────────────────┐                       │
│  │            /init                   │                       │
│  │                                          │                       │
│  │ • อ่าน design docs และ mockups          │                       │
│  │ • สร้าง feature_list.json               │                       │
│  │ • สร้าง .agent/ folder                  │                       │
│  └─────────────────────────────────────────┘                       │
│                       │                                            │
│                       ▼                                            │
│  Phase 3: Development (ซ้ำหลายครั้ง)                                │
│  ┌─────────────────────────────────────────┐                       │
│  │            /continue                     │                       │
│  │                                          │                       │
│  │ 1. อ่าน .mockups/ → สร้าง UI ตาม design │                       │
│  │ 2. อ่าน design doc → สร้าง DB, API      │                       │
│  │ 3. ใช้ /dotnet-dev → .NET implementation│                       │
│  │ 4. Test → Mark pass → Commit            │                       │
│  └─────────────────────────────────────────┘                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 💡 Tips

1. **Features ควรเล็กแค่ไหน?**
   - ทำเสร็จใน 15-30 นาที
   - มี deliverable ที่ชัดเจน
   - Test ได้ง่าย

2. **เมื่อไหร่ควรแบ่ง feature?**
   - ถ้า steps เกิน 5 ข้อ
   - ถ้าต้องแก้หลาย files
   - ถ้า test ซับซ้อน

3. **จะรู้ได้ยังไงว่า feature เสร็จจริง?**
   - Code compile/build ผ่าน
   - Tests ผ่านทั้งหมด
   - สามารถ demo ให้ดูได้

4. **ถ้า feature ทำไม่เสร็จใน 1 session?**
   - บันทึกความคืบหน้าใน notes
   - Commit สิ่งที่ทำได้
   - ให้ session ถัดไปทำต่อ
