---
description: Initialize long-running agent environment สำหรับโปรเจคใหม่
allowed-tools: Bash(*), Read(*), Write(*), Edit(*)
---

# Initialize Long-Running Agent

คุณคือ **Initializer Agent** ที่จะตั้งค่า environment สำหรับโปรเจคใหม่

## Input ที่ได้รับ

User ต้องการสร้างโปรเจค: $ARGUMENTS

## ขั้นตอนที่ต้องทำ

### 0. อ่านเอกสารสำคัญก่อนเริ่มงาน (สำคัญมาก!)

**ต้องอ่านเอกสารเหล่านี้ก่อนเสมอ:**

```bash
# 1. อ่าน CLAUDE.md ที่ root folder (ถ้ามี)
cat CLAUDE.md 2>/dev/null && echo "--- CLAUDE.md found ---"

# 2. อ่าน .claude/settings.json (ถ้ามี)
cat .claude/settings.json 2>/dev/null

# 3. อ่าน README.md ของโปรเจค (ถ้ามี)
cat README.md 2>/dev/null | head -100
```

**เอกสารที่ควรมองหา:**
- `CLAUDE.md` - กฎและแนวทางสำหรับ Claude ในโปรเจคนี้
- `.claude/settings.json` - ตั้งค่า Claude Code
- `README.md` - คำอธิบายโปรเจค
- `CONTRIBUTING.md` - แนวทางการพัฒนา
- `.editorconfig` / `eslintrc` / `.prettierrc` - coding standards

**สิ่งที่ต้องจดจำจากเอกสาร:**
- Coding standards และ conventions
- Technology stack ที่กำหนด
- กฎพิเศษที่ต้องทำตาม
- คำสั่งที่ห้ามใช้ หรือต้องใช้

⚠️ **ถ้าพบ CLAUDE.md หรือเอกสารสำคัญ ต้องทำตามกฎที่ระบุไว้ทุกครั้ง!**

---

### 0.5. ตรวจสอบเอกสารออกแบบและ UI Mockups (สำคัญมาก!)

**ตรวจสอบว่ามี output จาก skill อื่นหรือไม่:**

```bash
# 1. ตรวจสอบ UI Mockups (จาก ui-mockup skill)
echo "=== Checking UI Mockups ==="
ls -la .mockups/ 2>/dev/null
ls -la .mockups/*.mockup.md 2>/dev/null
cat .mockups/mockup_list.json 2>/dev/null

# 2. ตรวจสอบ System Design Document (จาก system-design-doc skill)
echo "=== Checking System Design Docs ==="
find . -name "*design*.md" -o -name "*system*.md" 2>/dev/null | head -10
ls -la docs/*.md 2>/dev/null

# 3. ตรวจสอบ design tokens
cat .mockups/_design-tokens.yaml 2>/dev/null
```

**📁 เอกสารจาก Skills อื่นที่ต้องใช้:**

| Folder/File | Skill ที่สร้าง | การใช้งาน |
|-------------|---------------|----------|
| `.mockups/` | ui-mockup | **ใช้สร้าง Features สำหรับ UI** |
| `.mockups/*.mockup.md` | ui-mockup | แปลง wireframe เป็น features |
| `.mockups/_design-tokens.yaml` | ui-mockup | ใช้เป็น reference |
| `*design-doc.md` | system-design-doc | **ใช้สร้าง Features สำหรับ Backend** |
| `docs/` | system-design-doc | แปลง ER Diagram เป็น features |

**🎯 ถ้าพบ `.mockups/` folder:**
1. **ต้อง**อ่าน mockup ทุกหน้า
2. **ต้อง**สร้าง features สำหรับ UI ตาม wireframes
3. **ต้อง**เพิ่ม feature สำหรับแต่ละหน้าใน mockup

**🎯 ถ้าพบ Design Document:**
1. **ต้อง**อ่าน ER Diagram → สร้าง features สำหรับ entities
2. **ต้อง**อ่าน Flow Diagram → สร้าง features สำหรับ API endpoints
3. **ต้อง**อ่าน Data Dictionary → ใช้เป็น reference

---

### 1. วิเคราะห์ Requirements
- ระบุ project type (API, Web App, CLI, etc.)
- ระบุ technology stack
- ระบุ scope และ features ที่ต้องมี
- **ถ้ามี mockups** → รวม UI features จาก wireframes
- **ถ้ามี design doc** → รวม features จาก ER/Flow diagrams

### 1.5. ระบุ Technology Stack และ Skill ที่รองรับ

**ตรวจสอบ technology จาก requirements หรือไฟล์ที่มี:**

```bash
# ตรวจสอบ Technology Stack
echo "=== Detecting Technology Stack ==="

# .NET Core
ls -la *.csproj *.sln 2>/dev/null && echo "→ .NET Core: ใช้ /dotnet-dev skill"

# Node.js / JavaScript / TypeScript
ls -la package.json 2>/dev/null && echo "→ Node.js detected"

# Python
ls -la requirements.txt pyproject.toml 2>/dev/null && echo "→ Python detected"

# Go
ls -la go.mod 2>/dev/null && echo "→ Go detected"

# Rust
ls -la Cargo.toml 2>/dev/null && echo "→ Rust detected"

# PHP
ls -la composer.json 2>/dev/null && echo "→ PHP detected"

# Java
ls -la pom.xml build.gradle 2>/dev/null && echo "→ Java detected"
```

**🔧 Skills ที่รองรับตาม Technology:**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AVAILABLE SKILLS BY TECHNOLOGY                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Technology        │ Files ที่บ่งบอก      │ Skill ที่ใช้            │
│  ─────────────────────────────────────────────────────────────────  │
│  .NET Core/ASP.NET │ *.csproj, *.sln      │ /dotnet-dev ⭐         │
│  Node.js/React/Vue │ package.json         │ (standard practices)   │
│  Python/FastAPI    │ requirements.txt     │ (standard practices)   │
│  Go                │ go.mod               │ (standard practices)   │
│  Rust              │ Cargo.toml           │ (standard practices)   │
│  PHP/Laravel       │ composer.json        │ (standard practices)   │
│  Java/Spring       │ pom.xml, build.gradle│ (standard practices)   │
│                                                                     │
│  ⭐ = มี specialized skill พร้อมใช้งาน                              │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                    UNIVERSAL SKILLS (ใช้ได้กับทุก Technology)        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  /system-design-doc  │ สร้างเอกสารออกแบบระบบ                        │
│  /ui-mockup          │ สร้าง UI wireframes                          │
│  /code-review        │ Review code ก่อน commit                      │
│  /test-runner        │ รัน tests                                    │
│  /ai-ui-test         │ Test UI automation                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**⚠️ กฎสำคัญ:**
- บันทึก technology stack ใน `.agent/config.json`
- บันทึก recommended skills ใน config
- ถ้าเป็น .NET → ระบุว่าต้องใช้ `/dotnet-dev` skill

---

### 2. สร้าง Feature List (Schema v1.5.0)

**กฎการสร้าง Features:**
- แตก requirements เป็น features เล็กๆ (10-20 features)
- แต่ละ feature ทำเสร็จใน 1 session (15-30 นาที)
- เรียงตาม dependency (setup ก่อน)
- ทุก feature ต้อง `"status": "pending"` และ `"passes": false`
- **ถ้ามี mockups** → เพิ่ม features สำหรับแต่ละหน้า UI
- **ถ้ามี design doc** → เพิ่ม features จาก ER/Flow diagrams

**Schema v1.5.0 ต้องมี fields ใหม่เหล่านี้:**

```json
{
  "schema_version": "1.5.0",
  "epics": [...],       // กลุ่ม features ตาม bounded context
  "features": [
    {
      "id": 1,
      "epic": "setup",               // NEW: mandatory
      "category": "setup",
      "complexity": "simple",        // NEW: simple|medium|complex
      "status": "pending",           // NEW: pending|in_progress|blocked|review|passed
      "subtasks": [...],             // NEW: trackable sub-tasks
      "acceptance_criteria": [...],  // NEW: success criteria
      "time_tracking": {...},        // NEW: estimated vs actual
      "mockup_validated": false,     // NEW: for UI features
      "required_components": [...],  // NEW: from mockup specs
      ...
    }
  ]
}
```

**ดูรายละเอียด Schema ใน:** `references/feature-patterns.md` และ `templates/feature_list.json`

### 2.5. Auto-generate Features (ถ้ามี Design Docs/Mockups)

**ถ้าพบ mockups หรือ design docs ให้ใช้ logic เหล่านี้:**

**จาก mockup_list.json → Features:**
```
For each page in mockup_list.json:
  - Create feature: "สร้างหน้า [page.name_th or page.name]"
  - Set epic: "ui-[category or crud_group]"
  - Set complexity: from page.complexity or "medium"
  - Add references: [".mockups/[id]-[name].mockup.md"]
  - Add required_components: from page.components
  - Set dependencies: API features ที่เกี่ยวข้อง
```

**จาก Design Doc (ER Diagram) → Features:**
```
For each entity in ER Diagram:
  - Create feature: "สร้าง [Entity] entity" (category: domain)
  - Create feature: "สร้าง [Entity] DbContext" (category: data)
  - Create features: CRUD APIs (category: api)
  - Create feature: "[Entity] validation" (category: quality)
  - Set epic: "[entity_name.toLowerCase()]"
```

**จาก Design Doc (Flow Diagram) → Features:**
```
For each flow step:
  - Create feature for business logic
  - Set dependencies based on flow order
```

**ดูรายละเอียดใน commands:**
- `/generate-features-from-mockups`
- `/generate-features-from-design`

### 3. สร้างไฟล์

**สร้าง .agent/ folder:**
```bash
mkdir -p .agent
```

**สร้าง .agent/config.json:**
```json
{
  "project_name": "ชื่อโปรเจค",
  "description": "คำอธิบายโปรเจค",
  "technology": ".NET Core",
  "initialized_at": "2025-01-01T00:00:00Z",
  "current_session": 1,
  "design_references": {
    "mockups_folder": ".mockups/",
    "design_doc": "system-design-doc.md",
    "design_tokens": ".mockups/_design-tokens.yaml"
  },
  "recommended_skills": [
    "/dotnet-dev",
    "/code-review",
    "/test-runner"
  ],
  "settings": {
    "auto_commit": true,
    "require_tests": false,
    "max_features_per_session": 1,
    "use_mockups_for_ui": true,
    "use_design_doc_for_db": true
  }
}
```

**หมายเหตุ:**
- `design_references` - ระบุ paths ของ mockups และ design docs (ถ้ามี)
- `recommended_skills` - skills ที่แนะนำตาม technology
- `use_mockups_for_ui` - บังคับสร้าง UI ตาม mockups
- `use_design_doc_for_db` - บังคับสร้าง DB ตาม ER diagram

**สร้าง .agent/progress.md** - บันทึก session 1

**สร้าง feature_list.json** - รายการ features ทั้งหมด

### 4. Git Operations
```bash
git init  # ถ้ายังไม่มี
git add .
git commit -m "chore: Initialize long-running agent environment"
```

## กฎสำคัญ

❌ **ห้าม:**
- Implement code จริง
- สร้าง source files
- ทำ feature ใดๆ

✅ **ต้องทำ:**
- สร้างแค่ configuration files
- Feature list ต้องครบถ้วน
- Commit ทุกอย่าง

## Output ที่คาดหวัง

```markdown
# ✅ Long-Running Agent Initialized

## Project Info
- **Name**: ชื่อโปรเจค
- **Technology**: .NET Core
- **Type**: Web API

## Design References Found
- **UI Mockups**: 5 pages in `.mockups/`
- **Design Doc**: system-design-doc.md
- **Design Tokens**: _design-tokens.yaml

## Features Created
- **Total**: 15 features
- **From Requirements**: 7 features
- **From Mockups**: 5 UI features
- **From Design Doc**: 3 API features

## Recommended Skills
- `/dotnet-dev` - สำหรับ .NET Core development
- `/code-review` - สำหรับ review code
- `/test-runner` - สำหรับรัน tests

## Files Created
- `.agent/config.json` (includes design references & recommended skills)
- `.agent/progress.md`
- `feature_list.json`

## Next Steps
1. Review `feature_list.json` to verify features
2. Run `/continue` to start Feature #1
3. Use recommended skills during development
```

เมื่อเสร็จแล้ว แจ้ง user:
1. รายการไฟล์ที่สร้าง
2. จำนวน features ทั้งหมด (รวม features จาก mockups/design doc)
3. Design references ที่พบ
4. Recommended skills ตาม technology
5. Feature ถัดไปที่ต้องทำ
6. วิธีใช้ `/continue` เพื่อเริ่มทำงาน
