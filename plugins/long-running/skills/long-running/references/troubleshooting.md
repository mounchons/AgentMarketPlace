# Troubleshooting Guide

แก้ไขปัญหาที่พบบ่อยเมื่อใช้ Long-Running Agent

## 🔴 Common Problems & Solutions

### Problem 1: Context Lost - Agent ไม่รู้ว่าทำอะไรไปแล้ว

**อาการ:**
```
Agent: "ผมไม่เห็นไฟล์ที่คุณพูดถึงครับ"
Agent: "โปรเจคนี้ต้องทำอะไรบ้างครับ?"
```

**สาเหตุ:**
- ไม่ได้อ่าน progress.md ก่อนเริ่มงาน
- Session ใหม่ไม่มี context

**วิธีแก้:**
```bash
# 1. ให้ agent อ่าน progress ก่อน
cat .agent/progress.md

# 2. ให้ดู git log
git log --oneline -10

# 3. ให้ดู feature list
cat feature_list.json
```

**Prevention:**
- ใช้ `/continue` command ที่บังคับอ่าน context

---

### Problem 2: Agent ทำหลาย Features ใน 1 Session

**อาการ:**
```
Agent: "เสร็จแล้วครับ! ผมทำ Feature #1, #2, #3, #4 ให้เลย"
```

**สาเหตุ:**
- Prompt ไม่ชัดเจนพอ
- Agent พยายาม one-shot

**วิธีแก้:**
```
บอก agent ว่า:
"ทำทีละ 1 feature เท่านั้น
หลังจากทำเสร็จ ให้ commit และ update progress
แล้วหยุดรอคำสั่งถัดไป"
```

**Prevention:**
- ใช้ `/continue` command ที่มีกฎชัดเจน
- ตั้ง config: `"max_features_per_session": 1`

---

### Problem 3: Feature Mark Pass โดยไม่ได้ Test

**อาการ:**
```json
{
  "id": 5,
  "passes": true,
  "notes": ""  // ไม่มี test notes
}
```

**วิธีตรวจสอบ:**
```bash
# 1. ดู feature ที่ pass แต่ไม่มี notes
cat feature_list.json | jq '.features[] | select(.passes == true and .notes == "")'

# 2. ทดสอบ feature นั้นด้วยตัวเอง
curl http://localhost:5000/api/todos
```

**วิธีแก้:**
```
บอก agent ว่า:
"ก่อน mark pass ต้อง:
1. Test จริง (curl, Postman, หรือ run tests)
2. เขียน test result ใน notes
3. ใส่ tested_at timestamp"
```

**Prevention:**
- เพิ่ม validation ใน feature_list.json schema
- ตั้ง config: `"require_tests": true`

---

### Problem 4: Build Fail หลังจาก Session ก่อน

**อาการ:**
```bash
$ dotnet build
error CS1002: ; expected
Build FAILED.
```

**สาเหตุ:**
- Session ก่อนทิ้งงานในสถานะ incomplete
- Merge conflict
- Missing dependencies

**วิธีแก้:**
```bash
# 1. ดู error
dotnet build 2>&1

# 2. ถ้าแก้ไขได้
# แก้ code → build → commit fix

# 3. ถ้าแก้ไม่ได้
git log --oneline -5  # ดู commit ก่อนหน้า
git checkout HEAD~1   # กลับไป commit ก่อน

# 4. หรือ revert เฉพาะ commit ที่มีปัญหา
git revert abc1234
```

---

### Problem 5: feature_list.json ถูกแก้ไขผิดพลาด

**อาการ:**
```json
// Features หายไป
// หรือ description ถูกแก้
// หรือ format ผิด
```

**วิธีแก้:**
```bash
# 1. ดู history ของไฟล์
git log --oneline feature_list.json

# 2. ดูว่าเปลี่ยนอะไร
git diff HEAD~1 feature_list.json

# 3. Restore จาก commit ก่อน
git checkout HEAD~1 -- feature_list.json

# 4. แก้ไข passes status ใหม่
```

**Prevention:**
- เน้นย้ำกับ agent ว่าแก้ได้แค่ `passes` และ `notes`
- ใช้ JSON schema validation

---

### Problem 6: Progress Log ไม่ถูก Update

**อาการ:**
```markdown
# .agent/progress.md
## Session 1 - INITIALIZER
...
(ไม่มี session 2, 3, 4 ทั้งที่ทำไปแล้ว)
```

**วิธีแก้:**
```bash
# 1. ดู git log เพื่อ reconstruct history
git log --oneline

# 2. สร้าง progress entries ที่หายไป
# ดูจาก commit messages และ feature_list.json changes
```

**Prevention:**
- ใส่ใน checklist ว่าต้อง update progress ก่อนจบ session
- ตรวจสอบว่า progress ถูก update ก่อน commit

---

### Problem 7: Agent ประกาศว่า "เสร็จแล้ว" ทั้งที่ยังไม่เสร็จ

**อาการ:**
```
Agent: "โปรเจคเสร็จสมบูรณ์แล้วครับ!"

แต่ feature_list.json:
- passed: 5/15
```

**วิธีแก้:**
```
บอก agent ว่า:
"ตรวจสอบ feature_list.json ก่อนประกาศว่าเสร็จ
ต้อง passes == true ทุก feature
ถ้ายังไม่ครบ ให้บอกว่ายังเหลืออีกกี่ feature"
```

---

### Problem 8: Duplicate Features

**อาการ:**
```json
{
  "features": [
    { "id": 5, "description": "GET /api/todos" },
    { "id": 6, "description": "GET /api/todos" }  // ซ้ำ!
  ]
}
```

**วิธีแก้:**
```bash
# 1. ลบ feature ที่ซ้ำ
# 2. Re-number features ถ้าจำเป็น
# 3. Update references
```

**Prevention:**
- ตรวจสอบ uniqueness ตอน initialize
- ใช้ description ที่ชัดเจนต่างกัน

---

## 🛠️ Recovery Commands

### Reset to Clean State

```bash
# Option 1: Soft reset (keep changes as unstaged)
git reset HEAD~1

# Option 2: Hard reset (discard changes)
git reset --hard HEAD~1

# Option 3: Revert specific commit
git revert <commit-hash>
```

### Recreate Progress from Git

```bash
# สร้าง progress log ใหม่จาก git history
git log --format="## Session
**Date**: %ci
**Commit**: %h

### Message:
%s

%b
---" > .agent/progress-reconstructed.md
```

### Validate feature_list.json

```bash
# Check JSON syntax
python -c "import json; json.load(open('feature_list.json'))"

# Check structure with jq
cat feature_list.json | jq '.features | length'
cat feature_list.json | jq '.features[] | select(.passes == true) | .id'
```

---

## 📋 Diagnostic Checklist

เมื่อพบปัญหา ให้ตรวจสอบ:

### Environment
- [ ] `pwd` - อยู่ใน project directory ถูกต้อง?
- [ ] `git status` - มี uncommitted changes?
- [ ] `dotnet build` (หรือ equivalent) - build ผ่าน?

### Files
- [ ] `cat .agent/config.json` - config ถูกต้อง?
- [ ] `cat .agent/progress.md` - progress updated?
- [ ] `cat feature_list.json | jq '.summary'` - summary ถูกต้อง?

### Git
- [ ] `git log --oneline -5` - commits ตรงกับ progress?
- [ ] `git diff` - มี changes ที่ยังไม่ commit?

### Agent State
- [ ] Agent รู้ว่าทำ feature ไหนอยู่?
- [ ] Agent รู้ว่า feature ไหน pass แล้ว?
- [ ] Agent รู้ว่าต้องทำอะไรต่อ?

---

## 💡 Best Practices to Avoid Problems

### 1. Always Use Commands

```bash
# ใช้ /init แทนการ initialize เอง
# ใช้ /continue แทนการบอกให้ทำต่อ
# ใช้ /status เพื่อตรวจสอบสถานะ
```

### 2. Commit Often

```bash
# Commit ทุกครั้งที่ feature เสร็จ
# อย่ารอ commit หลาย features พร้อมกัน
```

### 3. Update Progress Before End

```markdown
ก่อนจบ session ทุกครั้ง:
1. ✅ Feature completed
2. ✅ Tests passed
3. ✅ Changes committed
4. ✅ Progress updated  <-- อย่าลืม!
```

### 4. Verify Build Before End

```bash
# ก่อนจบ session
dotnet build  # ต้องผ่าน
dotnet run    # ต้องทำงานได้ (ถ้า applicable)
```

### 5. Review Before Marking Pass

```
ก่อน mark feature เป็น pass:
- ✅ Code compiles
- ✅ Tests pass
- ✅ Manual test works
- ✅ Edge cases handled
```
