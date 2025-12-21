---
description: ทำงานต่อจาก session ก่อน - Coding Agent mode
allowed-tools: Bash(*), Read(*), Write(*), Edit(*)
---

# Continue - Coding Agent Mode

คุณคือ **Coding Agent** ที่จะทำงานต่อจาก session ก่อนหน้า

## ขั้นตอนที่ต้องทำ (เรียงตามลำดับ)

### Step 0: อ่านเอกสารสำคัญก่อนเริ่มงาน (สำคัญมาก!)

**ทุกครั้งที่เริ่ม session ใหม่ ต้องอ่านเอกสารเหล่านี้:**

```bash
# 1. อ่าน CLAUDE.md ที่ root folder (ถ้ามี)
cat CLAUDE.md 2>/dev/null && echo "--- CLAUDE.md found, ทำตามกฎที่ระบุ ---"

# 2. อ่าน .agent/project-rules.md (ถ้ามี - กฎเฉพาะโปรเจค)
cat .agent/project-rules.md 2>/dev/null

# 3. อ่าน README.md เพื่อเข้าใจโปรเจค
cat README.md 2>/dev/null | head -50
```

**เอกสารที่ต้องมองหาและทำตาม:**

| ไฟล์ | ความหมาย |
|------|----------|
| `CLAUDE.md` | กฎหลักสำหรับ Claude - **ต้องทำตามทุกข้อ** |
| `.agent/project-rules.md` | กฎเฉพาะโปรเจค |
| `CONTRIBUTING.md` | แนวทางการพัฒนา |
| `.editorconfig` | coding style |

**สิ่งที่ต้องจดจำจากเอกสาร:**
- ✅ Coding standards และ naming conventions
- ✅ คำสั่งที่ต้องรันก่อนเริ่มงาน
- ✅ กฎพิเศษที่ต้องทำตาม
- ✅ สิ่งที่ห้ามทำ

⚠️ **กฎจาก CLAUDE.md มีความสำคัญสูงสุด ต้องทำตามก่อนกฎอื่นๆ!**

---

### Step 1: Get Context (ต้องทำก่อนเสมอ!)

```bash
# 1. ตรวจสอบว่าอยู่ directory ถูกต้อง
pwd
ls -la

# 2. อ่าน progress log
cat .agent/progress.md

# 3. ดู git history
git log --oneline -10

# 4. ดู feature list summary
cat feature_list.json
```

**ถ้าไม่พบไฟล์เหล่านี้:** แจ้ง user ว่าต้องรัน `/init-agent` ก่อน

### Step 2: Verify Environment

```bash
# ตรวจสอบว่า project ทำงานได้
# สำหรับ .NET:
dotnet build

# สำหรับ Node.js:
npm install && npm run build

# ถ้า build fail: แก้ไขก่อนทำ feature ใหม่
```

### Step 3: Select Feature

จาก feature_list.json:
- หา feature ที่ `"passes": false`
- เลือก `"priority": "high"` ก่อน
- **ทำทีละ 1 feature เท่านั้น!**

### Step 4: Implement Feature

- ทำตาม steps ที่ระบุไว้ใน feature
- เขียน code ที่ clean และ readable
- Handle errors appropriately

### Step 5: Test Feature (สำคัญมาก!)

**ก่อน mark pass ต้อง test จริง:**
- Build ผ่าน
- Manual test ผ่าน (curl, Postman, browser)
- Edge cases handled

### Step 6: Mark as Passed

แก้ไข feature_list.json:
```json
{
  "id": X,
  "passes": true,
  "tested_at": "TIMESTAMP",
  "notes": "Test results..."
}
```

อัพเดท summary:
```json
{
  "summary": {
    "passed": N+1,
    "failed": M-1,
    "last_updated": "TIMESTAMP"
  }
}
```

### Step 7: Commit Changes

```bash
git add .
git commit -m "feat: Feature #X - description"
```

### Step 8: Update Progress Log

เพิ่ม session ใหม่ใน .agent/progress.md:
```markdown
---

## Session N - CODING
**Date**: TIMESTAMP
**Type**: Coding

### สิ่งที่ทำ:
- ✅ Feature #X: description

### Test Results:
- Test: ✅ Result

### สถานะปัจจุบัน:
- Features passed: X/Y
- Build: ✅

### Feature ถัดไป:
- Feature #Z: description

---
```

## กฎสำคัญ

❌ **ห้าม:**
- ทำหลาย features ใน 1 session
- Mark pass โดยไม่ test
- ลบหรือแก้ไข feature descriptions
- ประกาศว่าเสร็จถ้ายังมี feature ไม่ pass

✅ **ต้องทำ:**
- อ่าน context ก่อนเริ่มงานเสมอ
- Test ก่อน mark pass
- Commit แยกต่าง feature
- Update progress ก่อนจบ session
- ทิ้ง code ในสถานะ build ผ่าน

## Output ที่คาดหวัง

เมื่อเสร็จ 1 feature แจ้ง user:
1. Feature ที่ทำเสร็จ
2. Test results
3. Progress (X/Y features passed)
4. Feature ถัดไป
5. Git commit hash
