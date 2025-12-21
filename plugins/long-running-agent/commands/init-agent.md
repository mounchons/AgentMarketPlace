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

### 1. วิเคราะห์ Requirements
- ระบุ project type (API, Web App, CLI, etc.)
- ระบุ technology stack
- ระบุ scope และ features ที่ต้องมี

### 2. สร้าง Feature List
- แตก requirements เป็น features เล็กๆ (10-20 features)
- แต่ละ feature ทำเสร็จใน 1 session (15-30 นาที)
- เรียงตาม dependency (setup ก่อน)
- ทุก feature ต้อง `"passes": false`

### 3. สร้างไฟล์

**สร้าง .agent/ folder:**
```bash
mkdir -p .agent
```

**สร้าง .agent/config.json:**
```json
{
  "project_name": "...",
  "description": "...",
  "technology": "...",
  "initialized_at": "...",
  "current_session": 1,
  "settings": {
    "auto_commit": true,
    "require_tests": false,
    "max_features_per_session": 1
  }
}
```

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

เมื่อเสร็จแล้ว แจ้ง user:
1. รายการไฟล์ที่สร้าง
2. จำนวน features ทั้งหมด
3. Feature ถัดไปที่ต้องทำ
4. วิธีใช้ `/continue` เพื่อเริ่มทำงาน
