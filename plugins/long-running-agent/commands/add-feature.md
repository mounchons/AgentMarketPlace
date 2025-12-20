---
description: เพิ่ม feature ใหม่เข้าไปใน feature_list.json
allowed-tools: Bash(*), Read(*), Write(*), Edit(*)
---

# Add Feature - เพิ่ม Feature ใหม่

คุณจะช่วย user เพิ่ม feature ใหม่เข้าไปในโปรเจค

## Input ที่ได้รับ

Feature ที่ต้องการเพิ่ม: $ARGUMENTS

## ขั้นตอนที่ต้องทำ

### Step 1: ตรวจสอบ Environment

```bash
# ตรวจสอบว่ามี feature_list.json อยู่
cat feature_list.json
```

**ถ้าไม่พบ feature_list.json:** แจ้ง user ว่าต้องรัน `/init-agent` ก่อน

### Step 2: วิเคราะห์ Feature ใหม่

จาก input ที่ user ให้มา:
- ระบุ description ที่ชัดเจน
- กำหนด category (setup, domain, functional, quality, enhancement, etc.)
- กำหนด priority (high, medium, low)
- แตก steps ที่ต้องทำ (3-5 steps)

### Step 3: หา ID ถัดไป

อ่าน feature_list.json และหา id สูงสุดที่มีอยู่ แล้ว +1

### Step 4: สร้าง Feature Entry ใหม่

```json
{
  "id": [NEXT_ID],
  "category": "[CATEGORY]",
  "description": "[DESCRIPTION]",
  "priority": "[PRIORITY]",
  "steps": [
    "step 1",
    "step 2",
    "step 3"
  ],
  "passes": false,
  "notes": "",
  "added_at": "[TIMESTAMP]"
}
```

### Step 5: เพิ่มเข้า feature_list.json

- เพิ่ม feature ใหม่เข้าไปใน array `features`
- อัพเดท `summary.total` (+1)
- อัพเดท `summary.failed` (+1)
- อัพเดท `summary.last_updated`

### Step 6: Update Progress Log

เพิ่มใน .agent/progress.md:
```markdown
### Feature Added
- Feature #[ID]: [description]
- Category: [category]
- Priority: [priority]
- Added at: [timestamp]
```

### Step 7: Git Commit (ถ้า user ต้องการ)

```bash
git add feature_list.json .agent/progress.md
git commit -m "feat: Add feature #[ID] - [short description]"
```

## กฎสำคัญ

❌ **ห้าม:**
- เปลี่ยน features ที่มีอยู่แล้ว
- Mark feature ใหม่เป็น passes: true
- Implement feature ทันที (แค่เพิ่มใน list เท่านั้น)
- สร้าง feature ที่ใหญ่เกินไป (ควรทำเสร็จใน 1 session)

✅ **ต้องทำ:**
- ถาม user ถ้า input ไม่ชัดเจน
- แตก feature ใหญ่เป็นหลายๆ features เล็ก
- ระบุ steps ที่ชัดเจน
- เก็บ timestamp ว่าเพิ่มเมื่อไหร่

## Output ที่คาดหวัง

เมื่อเสร็จแล้ว แจ้ง user:
1. Feature ID ที่สร้างใหม่
2. รายละเอียด feature
3. จำนวน features ทั้งหมดหลังเพิ่ม (X total, Y passed, Z pending)
4. แนะนำให้ใช้ `/continue` เพื่อเริ่มทำ feature ใหม่

## ตัวอย่าง

**Input:** เพิ่ม feature สำหรับ search todos by title

**Output ที่ควรสร้าง:**
```json
{
  "id": 11,
  "category": "functional",
  "description": "GET /api/todos/search - ค้นหา todos ตาม title",
  "priority": "medium",
  "steps": [
    "เพิ่ม endpoint ใหม่ใน TodosController",
    "รับ query parameter 'q' หรือ 'title'",
    "ใช้ LIKE query กับ SQLite",
    "return empty array ถ้าไม่พบ",
    "ทดสอบ search ด้วย keyword ต่างๆ"
  ],
  "passes": false,
  "notes": "",
  "added_at": "2025-01-15T10:30:00Z"
}
```
