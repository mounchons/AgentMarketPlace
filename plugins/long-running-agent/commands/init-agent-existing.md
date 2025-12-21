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

### Step 2: ระบุ Technology Stack

จากไฟล์ที่พบ:
- `.csproj` / `.sln` → .NET
- `package.json` → Node.js
- `requirements.txt` → Python
- `composer.json` → PHP

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

## Features Identified
- Completed: 5 features (marked as passed)
- Remaining: 8 features (marked as not passed)

## Files Created
- .agent/config.json
- .agent/progress.md
- feature_list.json

## Next Steps
1. Review feature_list.json to verify accuracy
2. Run `/continue` to start working on remaining features
```
