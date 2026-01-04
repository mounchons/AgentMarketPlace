---
description: แก้ไข feature ที่ผ่านแล้ว (สร้าง feature ใหม่อ้างอิง feature เดิม)
allowed-tools: Bash(*), Read(*), Write(*), Edit(*)
---

# Edit Feature - แก้ไข Feature ที่ Pass แล้ว

คุณจะช่วย user แก้ไข feature ที่ผ่านแล้ว โดยสร้าง feature ใหม่อ้างอิง feature เดิม

> **หลักการสำคัญ:** Feature ที่ pass แล้วจะไม่ถูกแก้ไขโดยตรง แต่จะสร้าง feature ใหม่แทน เพื่อเก็บประวัติการพัฒนา

## Input ที่ได้รับ

Feature ID และการเปลี่ยนแปลง: $ARGUMENTS

**รูปแบบ Input:**
- `/edit-feature 5 - เพิ่ม OAuth login`
- `/edit-feature 7 - ปรับ endpoint ให้รองรับ pagination`
- `/edit-feature 3 - เพิ่ม field ใหม่ตาม design doc`

## ขั้นตอนที่ต้องทำ

### Step 1: ตรวจสอบ Environment

```bash
# ตรวจสอบว่ามี feature_list.json อยู่
cat feature_list.json
```

**ถ้าไม่พบ feature_list.json:** แจ้ง user ว่าต้องรัน `/init-agent` ก่อน

### Step 2: Parse Input และตรวจสอบ Feature

จาก input ที่ user ให้มา:
1. แยก Feature ID ที่ต้องการแก้ไข
2. แยกรายละเอียดการเปลี่ยนแปลง

```bash
# อ่าน feature_list.json และหา feature ที่ระบุ
cat feature_list.json | jq '.features[] | select(.id == [FEATURE_ID])'
```

**ตรวจสอบ:**
- Feature ID มีอยู่จริง
- Feature มี `passes: true` (เสร็จแล้ว)

**ถ้า feature ยังไม่ pass:** แจ้ง user ว่า:
> "Feature #X ยังไม่เสร็จ (passes: false) ใช้ `/continue` เพื่อทำให้เสร็จก่อน หรือแก้ไข feature โดยตรงได้เลย"

### Step 3: วิเคราะห์การเปลี่ยนแปลง

จากรายละเอียดที่ user ให้มา:
- ระบุ description ใหม่ที่ชัดเจน
- กำหนด category (อาจเป็น `enhancement` หรือคงเดิม)
- กำหนด priority (high, medium, low)
- แตก steps ที่ต้องทำ (3-5 steps)
- ระบุ references ถ้ามี (mockup, design doc, SQL)

### Step 4: หา ID ถัดไป

อ่าน feature_list.json และหา id สูงสุดที่มีอยู่ แล้ว +1

### Step 5: สร้าง Feature ใหม่

```json
{
  "id": [NEXT_ID],
  "category": "[CATEGORY]",
  "description": "[NEW_DESCRIPTION]",
  "priority": "[PRIORITY]",
  "steps": [
    "step 1",
    "step 2",
    "step 3"
  ],
  "dependencies": [ORIGINAL_FEATURE_DEPENDENCIES],
  "references": [],
  "related_features": [ORIGINAL_FEATURE_ID],
  "supersedes": [ORIGINAL_FEATURE_ID],
  "estimated_time": "[ESTIMATED_TIME]",
  "passes": false,
  "tested_at": null,
  "notes": "Updated from Feature #[ORIGINAL_ID] - [short reason]",
  "created_at": "[TIMESTAMP]"
}
```

**Fields สำคัญ:**
- `related_features`: Array ของ feature IDs ที่เกี่ยวข้อง
- `supersedes`: Feature ID ที่ถูกแทนที่/ปรับปรุง
- `notes`: อธิบายว่าปรับปรุงจาก feature ไหน

### Step 6: เพิ่มเข้า feature_list.json

- เพิ่ม feature ใหม่เข้าไปใน array `features`
- อัพเดท `summary.total` (+1)
- อัพเดท `summary.failed` (+1)
- อัพเดท `summary.last_updated`

**หมายเหตุ:** Feature เดิมยังคงอยู่ ไม่ต้องแก้ไขอะไร

### Step 7: Update Progress Log

เพิ่มใน .agent/progress.md:
```markdown
### Feature Edit
- Created Feature #[NEW_ID] from Feature #[OLD_ID]
- Original: [original description]
- Changes: [what changed]
- Old feature preserved (passes: true)
- New feature created (passes: false)
- Created at: [timestamp]
```

### Step 8: Git Commit

```bash
git add feature_list.json .agent/progress.md
git commit -m "feat: Edit Feature #[OLD_ID] → Create Feature #[NEW_ID] - [short description]"
```

## กฎสำคัญ

❌ **ห้าม:**
- แก้ไข feature เดิมที่ pass แล้ว (ต้องเก็บ history)
- แก้ไข feature ที่ยังไม่ pass (ใช้ `/continue` แทน)
- ลบ feature เก่า
- เปลี่ยน ID ของ feature เก่า
- Mark feature ใหม่เป็น passes: true
- Implement feature ทันที (แค่เพิ่มใน list เท่านั้น)

✅ **ต้องทำ:**
- สร้าง feature ใหม่เสมอ (ไม่ edit in-place)
- ใส่ `related_features` และ `supersedes` เพื่อ track history
- ใส่ `notes` อธิบายว่าปรับปรุงจากอะไร
- Copy dependencies จาก feature เดิม (ถ้าเหมาะสม)
- ถาม user ถ้า input ไม่ชัดเจน
- แตก feature ใหญ่เป็นหลายๆ features เล็ก

## Output ที่คาดหวัง

เมื่อเสร็จแล้ว แจ้ง user:

```
✅ สร้าง Feature ใหม่สำเร็จ

📋 Feature Details:
- New Feature: #[NEW_ID] - [description]
- Based on: Feature #[OLD_ID]
- Category: [category]
- Priority: [priority]
- Status: passes: false

📊 Summary:
- Total features: X (+1)
- Passed: Y
- Pending: Z (+1)

🔗 Relationship:
- Feature #[NEW_ID] supersedes Feature #[OLD_ID]
- Feature #[OLD_ID] preserved for history

💡 Next Step:
- ใช้ /continue เพื่อเริ่มทำ Feature #[NEW_ID]
```

## ตัวอย่าง

### ตัวอย่าง 1: เพิ่ม OAuth

**Input:** `/edit-feature 5 - เพิ่ม OAuth login`

**Feature เดิม (ID: 5):**
```json
{
  "id": 5,
  "category": "feature",
  "description": "สร้างหน้า Login ด้วย username/password",
  "passes": true,
  "tested_at": "2025-01-10T10:00:00Z"
}
```

**Feature ใหม่ที่สร้าง (ID: 13):**
```json
{
  "id": 13,
  "category": "enhancement",
  "description": "ปรับปรุงหน้า Login - เพิ่ม OAuth login (Google, Facebook)",
  "priority": "high",
  "steps": [
    "ติดตั้ง OAuth packages",
    "เพิ่ม OAuth providers configuration",
    "สร้าง OAuth callback endpoints",
    "ปรับ UI เพิ่มปุ่ม Sign in with Google/Facebook",
    "ทดสอบ OAuth flow"
  ],
  "dependencies": [1, 2],
  "references": [".mockups/login.mockup.md"],
  "related_features": [5],
  "supersedes": 5,
  "estimated_time": "30min",
  "passes": false,
  "tested_at": null,
  "notes": "Updated from Feature #5 - เพิ่ม OAuth login support",
  "created_at": "2025-01-15T14:00:00Z"
}
```

### ตัวอย่าง 2: ปรับ API endpoint

**Input:** `/edit-feature 7 - เพิ่ม pagination และ filtering`

**Feature เดิม (ID: 7):**
```json
{
  "id": 7,
  "category": "api",
  "description": "GET /api/products - List all products",
  "passes": true
}
```

**Feature ใหม่ที่สร้าง (ID: 14):**
```json
{
  "id": 14,
  "category": "enhancement",
  "description": "GET /api/products - เพิ่ม pagination และ filtering",
  "priority": "medium",
  "steps": [
    "เพิ่ม query parameters: page, pageSize, sortBy",
    "เพิ่ม filter parameters: category, minPrice, maxPrice",
    "implement pagination logic",
    "return total count ใน response header",
    "ทดสอบ pagination และ filtering"
  ],
  "dependencies": [4],
  "references": ["docs/api-spec.md"],
  "related_features": [7],
  "supersedes": 7,
  "estimated_time": "25min",
  "passes": false,
  "tested_at": null,
  "notes": "Updated from Feature #7 - เพิ่ม pagination และ filtering support",
  "created_at": "2025-01-15T14:30:00Z"
}
```

## Feature Relationship Diagram

```
Feature #5 (Login - Basic)          Feature #7 (Products - Basic)
    │ passes: true                      │ passes: true
    │                                   │
    └──── superseded by ────┐           └──── superseded by ────┐
                            │                                   │
                            ▼                                   ▼
                    Feature #13                         Feature #14
                    (Login - OAuth)                     (Products - Pagination)
                    passes: false                       passes: false
                    related_features: [5]               related_features: [7]
                    supersedes: 5                       supersedes: 7
```

## เมื่อไหร่ควรใช้ /edit-feature

| Scenario | Use /edit-feature? | Alternative |
|----------|-------------------|-------------|
| Feature pass แล้ว ต้องการเพิ่ม scope | ✅ ใช่ | - |
| Feature pass แล้ว พบ bug | ✅ ใช่ (category: bugfix) | - |
| Feature ยังไม่ pass ต้องการแก้ | ❌ ไม่ | ใช้ /continue |
| ต้องการเพิ่ม feature ใหม่ | ❌ ไม่ | ใช้ /add-feature |
| ต้องการ refactor code | ✅ ใช่ (category: refactor) | - |
