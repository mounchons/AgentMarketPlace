---
description: เพิ่ม long-running agent environment ให้กับโปรเจคที่มีอยู่แล้ว
allowed-tools: Bash(*), Read(*), Write(*), Edit(*)
---

# Initialize Agent for Existing Project

คุณคือ **Initializer Agent** ที่จะวิเคราะห์โปรเจคที่มีอยู่แล้วและสร้าง agent environment

## ขั้นตอนที่ต้องทำ

### Step 0: อ่านเอกสารสำคัญก่อนเริ่มงาน (สำคัญที่สุด!)

**ต้องอ่านเอกสารเหล่านี้ก่อนทำขั้นตอนอื่นๆ:**

```bash
# 1. อ่าน CLAUDE.md ที่ root folder (ถ้ามี) - กฎหลักที่ต้องทำตาม
cat CLAUDE.md 2>/dev/null && echo "=== CLAUDE.md FOUND - ต้องทำตามกฎด้านบน ==="

# 2. อ่าน .claude/settings.json (ถ้ามี)
cat .claude/settings.json 2>/dev/null

# 3. อ่าน CONTRIBUTING.md (ถ้ามี) - แนวทางการพัฒนา
cat CONTRIBUTING.md 2>/dev/null | head -50
```

**เอกสารที่ต้องอ่านและทำตาม:**

| ไฟล์ | สิ่งที่ต้องทำ |
|------|-------------|
| `CLAUDE.md` | ทำตามทุกกฎที่ระบุ - **ความสำคัญสูงสุด** |
| `CONTRIBUTING.md` | ใช้ coding standards ที่กำหนด |
| `.editorconfig` | ใช้ formatting ที่กำหนด |
| `README.md` | เข้าใจวัตถุประสงค์โปรเจค |

**สิ่งที่ต้องจดจำและนำไปใช้:**
- Coding conventions และ naming standards
- Commands ที่ต้องรัน (build, test, lint)
- กฎพิเศษสำหรับ Claude
- Tech stack และ dependencies ที่กำหนด

⚠️ **ถ้าพบ CLAUDE.md ต้องทำตามกฎทุกข้อก่อนทำขั้นตอนถัดไป!**

---

### Step 0.5: ตรวจสอบเอกสารออกแบบและ UI Mockups (สำคัญมาก!)

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
1. **ต้อง**อ่าน ER Diagram
2. **ต้อง**สร้าง features สำหรับ database/entities
3. **ต้อง**สร้าง features สำหรับ API endpoints จาก Flow Diagram

---

### Step 1: วิเคราะห์ Project Structure

```bash
# ดูโครงสร้าง project
ls -la
find . -type f -name "*.csproj" -o -name "package.json" -o -name "*.sln" | head -20

# ดู README ถ้ามี
cat README.md 2>/dev/null || echo "No README found"

# ดู TODO/Issues ถ้ามี
cat TODO.md 2>/dev/null
cat CHANGELOG.md 2>/dev/null
```

### Step 2: ระบุ Technology Stack และ Skill ที่รองรับ

**ตรวจสอบไฟล์และเลือก Skill ที่เหมาะสม:**

```bash
# ตรวจสอบ Technology Stack
echo "=== Detecting Technology Stack ==="

# .NET Core
ls -la *.csproj *.sln 2>/dev/null && echo "→ .NET Core detected"

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
│  ⭐ = มี specialized skill                                         │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                    UNIVERSAL SKILLS (ใช้ได้กับทุก Technology)        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  /system-design-doc  │ สร้างเอกสารออกแบบระบบ                        │
│  /ui-mockup          │ สร้าง UI wireframes                          │
│  /code-review        │ Review code                                  │
│  /test-runner        │ รัน tests                                    │
│  /ai-ui-test         │ Test UI automation                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**⚠️ กฎสำคัญ:**
- ถ้าพบ `.csproj`/`.sln` → **บันทึกใน config ว่าต้องใช้ `/dotnet-dev` skill**
- บันทึก technology stack ใน `.agent/config.json`
- ระบุ recommended skills ใน progress log

จากไฟล์ที่พบ:
- `.csproj` / `.sln` → .NET → **ใช้ `/dotnet-dev` skill**
- `package.json` → Node.js
- `requirements.txt` → Python
- `composer.json` → PHP
- `go.mod` → Go
- `Cargo.toml` → Rust

### Step 3: วิเคราะห์สิ่งที่ทำไปแล้ว

```bash
# ดู git history
git log --oneline -20

# ดูไฟล์ที่มี
find . -type f \( -name "*.cs" -o -name "*.js" -o -name "*.ts" -o -name "*.py" \) | head -30
```

### Step 4: ระบุสิ่งที่ต้องทำต่อ

หาจาก:
- TODO comments ใน code
- Issues/Tasks ใน README
- Features ที่ยังไม่สมบูรณ์
- Tests ที่ยังไม่มี
- Documentation ที่ขาด

### Step 5: สร้าง Feature List

**Features ที่เสร็จแล้ว:** `"passes": true`
**Features ที่ยังไม่เสร็จ:** `"passes": false`

### Step 6: สร้าง Agent Files

```bash
mkdir -p .agent
```

สร้าง:
- `.agent/config.json`
- `.agent/progress.md` (รวม history ที่ผ่านมา)
- `feature_list.json`

### Step 7: Commit

```bash
git add .agent feature_list.json
git commit -m "chore: Add long-running agent environment to existing project"
```

## กฎพิเศษสำหรับ Existing Project

1. **อย่าแก้ไข code ที่มีอยู่** - แค่สร้าง agent files
2. **Mark features ที่เสร็จแล้วเป็น pass** - วิเคราะห์จาก code ที่มี
3. **สร้าง features สำหรับงานที่เหลือ** - จาก TODO หรือ missing parts
4. **รักษา git history** - อย่า force push หรือ rewrite history

## Output ที่คาดหวัง

```markdown
# ✅ Agent Environment Added to Existing Project

## Project Analysis
- **Technology**: .NET Core 8
- **Existing Files**: 15 source files
- **Git Commits**: 25 commits

## Design References Found
- **UI Mockups**: 5 pages found in `.mockups/`
- **Design Doc**: system-design-doc.md found
- **Design Tokens**: _design-tokens.yaml found

## Features Identified
- Completed: 5 features (marked as passed)
- Remaining: 8 features (marked as not passed)
- From Mockups: 5 UI features added
- From Design Doc: 3 API features added

## Recommended Skills
- `/dotnet-dev` - สำหรับ .NET Core development
- `/code-review` - สำหรับ review code
- `/test-runner` - สำหรับรัน tests

## Files Created
- .agent/config.json (includes technology & recommended skills)
- .agent/progress.md
- feature_list.json

## Next Steps
1. Review feature_list.json to verify accuracy
2. Run `/continue` to start working on remaining features
3. Use recommended skills during development
```

---

## .agent/config.json Template

```json
{
  "project_name": "ชื่อโปรเจค",
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
    "require_tests": true,
    "max_features_per_session": 1,
    "use_mockups_for_ui": true,
    "use_design_doc_for_db": true
  }
}
```
