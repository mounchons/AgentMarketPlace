# Integration Test — long-running ↔ system-design-doc

> **Purpose:** ยืนยันว่า `/add-feature` และ `/edit-feature` (v2.4.0+) ตรวจ design doc impact ถูกต้อง และ schema `design_doc_refs.pending_updates[]` ทำงานร่วมกับ `/sync-with-features` ได้จริง
>
> **เมื่อต้องรัน:**
> - หลังแก้ `add-feature.md` หรือ `edit-feature.md`
> - ก่อน bump version
> - หลังแก้ `design_doc_list.json` schema
>
> **เวลาประมาณ:** 15-25 นาที สำหรับ scenarios 1-6 (Cross-plugin scenario เพิ่มอีก 5 นาที)

---

## Setup ครั้งแรก (One-time)

สร้าง sandbox project นอก marketplace repo เพื่อทดสอบ:

```powershell
# สร้างโฟลเดอร์ test
mkdir D:\test-long-running ; cd D:\test-long-running
git init

# สร้าง feature_list.json ขั้นต่ำ (รัน /init ของ long-running)
# หรือก๊อปจาก template:
copy D:\GitHub\AgentMarketPlace\plugins\long-running\skills\long-running\templates\feature_list.json .
```

---

## Test Fixtures (เก็บไว้ในใจ — copy-paste เมื่อใช้)

### Fixture A: `design_doc_list.json` ขั้นต่ำที่มี entity + API

```json
{
  "schema_version": "2.1.0",
  "project_name": "test-project",
  "entities": [
    {
      "id": "ENT-001",
      "name": "User",
      "table_name": "users",
      "attributes": [
        { "name": "id", "type": "int" },
        { "name": "email", "type": "string" }
      ]
    }
  ],
  "api_endpoints": [
    {
      "id": "API-001",
      "method": "GET",
      "path": "/api/users",
      "feature_id": null
    }
  ],
  "diagrams": {
    "sequence_diagrams": [
      { "id": "SEQ-001", "name": "User login flow", "related_features": [] }
    ]
  }
}
```

### Fixture B: `feature_list.json` ที่มี feature ผูก design ไว้

```json
{
  "features": [
    {
      "id": 5,
      "category": "feature",
      "description": "Create Login page",
      "design_doc_refs": {
        "api_ref": "API-001",
        "entity_ref": "ENT-001",
        "diagram_refs": ["SEQ-001"],
        "pending_updates": []
      },
      "passes": true,
      "tested_at": "2025-01-10T10:00:00Z"
    }
  ],
  "summary": { "total": 1, "passed": 1, "failed": 0 }
}
```

---

## Scenarios

### Scenario 1: Happy path — add feature with API impact (skip option)

**Setup:**
- [ ] วาง Fixture A เป็น `design_doc_list.json`
- [ ] feature_list.json ว่าง (มีแต่ summary)

**Run:**
```
/add-feature เพิ่ม endpoint POST /api/users สำหรับสร้าง user ใหม่
```

**Expected behavior:**
- [ ] Step 4 ตรวจพบ `design_doc_list.json`
- [ ] รายงาน Impact: "POST /api/users — ยังไม่มีใน api_endpoints[] (มีแต่ GET)"
- [ ] รายงาน Entity: "User (ENT-001) — feature นี้น่าจะใช้"
- [ ] ถาม user 3 ทางเลือก
- [ ] เลือก **[2] skip + บันทึก pending**

**Verify output:**
- [ ] feature ใหม่มี `design_doc_refs.entity_ref: "ENT-001"`
- [ ] `pending_updates[]` มี 1 entry: `{"type": "add-api", "spec": "POST /api/users", ...}`
- [ ] `references[]` มี `"design_doc_list.json#api_endpoints"` หรือคล้ายกัน
- [ ] `notes` mention "Pending design doc sync"

**Fail if:** ข้าม Step 4, ไม่ถามคำถาม, หรือ pending_updates ว่าง

---

### Scenario 2: ไม่มี design_doc_list.json — graceful skip

**Setup:**
- [ ] ลบหรือย้าย `design_doc_list.json` ออก
- [ ] feature_list.json มีอยู่

**Run:**
```
/add-feature เพิ่ม dark mode toggle
```

**Expected:**
- [ ] Step 4 ตรวจไม่พบ → ข้ามไป Step 5
- [ ] ไม่ error
- [ ] feature สร้างปกติพร้อม `design_doc_refs.pending_updates: []`

**Fail if:** error / crash / hang / ถามคำถามที่ไม่ควรถาม

---

### Scenario 3: ไม่พบ impact — feature ไม่กระทบ design doc

**Setup:**
- [ ] วาง Fixture A
- [ ] feature_list.json ว่าง

**Run:**
```
/add-feature แก้ typo ใน error message ของ login
```

**Expected:**
- [ ] Step 4 ตรวจพบ design doc
- [ ] วิเคราะห์ keyword ไม่พบ pattern (ไม่มี HTTP/entity/page/flow keyword ที่ตรง)
- [ ] แสดง "✅ ไม่พบ impact ที่ชัดเจน" → ไป Step 5 อัตโนมัติ
- [ ] ไม่ถามคำถาม

**Verify output:**
- [ ] feature ใหม่มี `design_doc_refs.pending_updates: []`

**Fail if:** ถามทั้งที่ไม่มี impact → false positive แย่

---

### Scenario 4: Edit feature ที่ผูก design — inherit + impact ใหม่

**Setup:**
- [ ] วาง Fixture A
- [ ] วาง Fixture B (มี feature #5 ผูก API-001 + ENT-001 + SEQ-001)

**Run:**
```
/edit-feature 5 - add OAuth login
```

**Expected:**
- [ ] Step 5 อ่าน original.design_doc_refs ได้ (api_ref="API-001", ...)
- [ ] รายงาน "Original feature ผูกกับ: API-001, ENT-001, SEQ-001"
- [ ] รายงาน OAuth impact: ต้องเพิ่ม callback API + permission + sequence update
- [ ] ถาม user 3 ทาง → เลือก [2]

**Verify output:**
- [ ] new feature inherit `api_ref: "API-001"`, `entity_ref: "ENT-001"`, `diagram_refs: ["SEQ-001"]`
- [ ] `pending_updates[]` มี ≥2 entries (callback API + sequence update)
- [ ] `supersedes: 5`, `related_features: [5]` ครบ
- [ ] feature #5 เดิม **ไม่ถูกแก้** (passes ยัง true)

**Fail if:** original.design_doc_refs หาย, หรือ feature #5 ถูกแก้

---

### Scenario 5: User เลือก [1] update first — flow หยุด

**Setup:** เหมือน Scenario 1

**Run:**
```
/add-feature เพิ่ม endpoint POST /api/users
```

**ตอน Step 4 ถาม → เลือก [1]**

**Expected:**
- [ ] command **ไม่สร้าง feature** ในขั้นนี้
- [ ] แสดงคำสั่งที่ต้องรันก่อน เช่น `/edit-section api-endpoints`
- [ ] บอก user ให้รัน `/add-feature` ใหม่หลังอัปเดต design doc

**Verify:**
- [ ] feature_list.json **ไม่ถูกแก้**
- [ ] ไม่มี feature ใหม่

**Fail if:** สร้าง feature ทั้งที่ user บอกหยุด

---

### Scenario 6: User เลือก [3] cancel

**Setup:** เหมือน Scenario 1

**Run:** `/add-feature ...` → ตอน Step 4 → เลือก [3]

**Expected:**
- [ ] command หยุดทันที
- [ ] feature_list.json ไม่ถูกแก้
- [ ] ไม่มี progress.md update

**Fail if:** มีไฟล์ใดถูกแก้

---

### Scenario 7 (Cross-plugin): pending_updates ใช้กับ /sync-with-features ได้

**Setup:**
- [ ] เริ่มจาก Scenario 1 ที่จบแล้ว (มี feature ใหม่ + pending_updates 1 entry)
- [ ] ติดตั้ง system-design-doc plugin

**Run:**
```
/sync-with-features
```

**Expected:**
- [ ] command อ่าน `feature.design_doc_refs.pending_updates[]` ได้
- [ ] รายงาน "Pending sync actions detected" หรือคล้ายกัน
- [ ] (optional) แนะนำคำสั่ง `/edit-section` ที่ต้องรันต่อ

**Verify schema compat:**
- [ ] design_doc_refs structure ที่ /add-feature สร้าง อ่านได้ใน sync-with-features
- [ ] field `type`, `spec`, `rationale` ใน pending_updates entry ถูก parse ถูกต้อง

**Fail if:** sync-with-features ไม่รู้จัก format → ต้องอัปเดต system-design-doc plugin ด้วย

> ⚠ **หมายเหตุ:** Scenario นี้คือ **integration จริง** ระหว่าง 2 plugins — ถ้า fail แสดงว่า contract ระหว่าง plugin ไม่ตรงกัน (อาจต้องอัปเดตทั้งสอง package ในรอบเดียว)

---

## Quick Run (สำหรับ regression check ก่อน bump version)

ถ้าไม่มีเวลารันครบ ให้รัน 3 scenario นี้พอ:
- Scenario 1 (happy path) — confirm ฟีเจอร์ใหม่ทำงาน
- Scenario 2 (no design doc) — confirm graceful fallback
- Scenario 4 (edit + inherit) — confirm history ไม่หาย

---

## Test Result Log Template

ก๊อปท้ายไฟล์นี้ใส่ผลทุกครั้งที่รัน:

```markdown
### Run 2026-05-03 (long-running v2.4.0)
- Scenario 1: ✅ pass
- Scenario 2: ✅ pass
- Scenario 3: ✅ pass
- Scenario 4: ⚠ failed — pending_updates schema incomplete
  → Action: เพิ่ม "rationale" field ใน Step 5 docs
- Scenario 5: ✅ pass
- Scenario 6: ✅ pass
- Scenario 7: ⏭ skipped — yet to update sync-with-features
```

---

## Known Limitations

- ❌ ไม่ใช่ automated test — Claude ตีความ markdown ทุกครั้ง ทำให้ผลอาจ vary ตาม context
- ❌ ต้องการ user มือสำหรับ AskUserQuestion choice (ทำเป็น CI ไม่ได้)
- ✅ จับ contract drift ระหว่าง plugins ได้
- ✅ จับ regression ตอนแก้ Step numbering / schema fields

## Run History

(เพิ่ม log เมื่อรันแต่ละครั้ง)

---

> 💬 **หมายเหตุ:** ไฟล์นี้เป็น **manual test checklist** สำหรับ Claude-driven plugin commands ไม่ใช่ pytest/jest
