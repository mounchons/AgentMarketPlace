# /generate-features-from-mockups

สร้าง features อัตโนมัติจาก mockup_list.json เพื่อให้ครอบคลุมทุก UI page ที่ออกแบบไว้

---

## Usage

```
/generate-features-from-mockups
```

---

## Prerequisites

- ต้องมี `.mockups/mockup_list.json` อยู่ในโปรเจค
- ควรรัน `/init-mockup` หรือ `/ui-mockup` ก่อน

---

## Process

### Step 1: อ่าน mockup_list.json

```bash
# ตรวจสอบว่ามี mockup_list.json
ls -la .mockups/mockup_list.json

# อ่านเนื้อหา
cat .mockups/mockup_list.json
```

### Step 2: Parse pages และสร้าง features

สำหรับแต่ละ page ใน `mockup_list.json`:

| Page Category | Feature Template | Epic |
|---------------|------------------|------|
| `auth` | "สร้างหน้า [name]" | ui-auth |
| `main` | "สร้างหน้า [name]" | ui-main |
| `list` | "สร้างหน้า [name] List" | ui-[crud_group] |
| `form` | "สร้างหน้า [name] Form" | ui-[crud_group] |
| `detail` | "สร้างหน้า [name] Detail" | ui-[crud_group] |

### Step 3: สร้าง Feature Structure

```json
{
  "id": [next_id],
  "epic": "ui-[category_or_crud_group]",
  "category": "feature-frontend",
  "description": "สร้างหน้า [page.name_th or page.name]",
  "priority": "[page.priority]",
  "complexity": "[page.complexity or 'medium']",
  "status": "pending",
  "blocked_reason": null,
  "subtasks": [
    { "id": "[id].1", "description": "สร้าง layout ตาม mockup", "done": false },
    { "id": "[id].2", "description": "สร้าง components ตาม specs", "done": false },
    { "id": "[id].3", "description": "เชื่อมต่อ API", "done": false },
    { "id": "[id].4", "description": "ทดสอบ UI", "done": false }
  ],
  "acceptance_criteria": [
    "UI ตรงกับ wireframe ใน mockup",
    "Components ครบตาม specs",
    "Responsive design ทำงานถูกต้อง",
    "API integration สมบูรณ์"
  ],
  "time_tracking": {
    "estimated_time": "[based on complexity]",
    "actual_time": null,
    "started_at": null,
    "completed_at": null
  },
  "dependencies": [api_feature_ids],
  "references": [
    ".mockups/[page.id]-[page.name.toLowerCase()].mockup.md",
    ".mockups/_design-tokens.yaml"
  ],
  "mockup_validated": false,
  "required_components": "[page.components]",
  "passes": false,
  "steps_legacy": [],
  "tested_at": null,
  "notes": "Auto-generated from mockup_list.json"
}
```

### Step 4: สร้าง Epic สำหรับ UI

```json
{
  "id": "ui-pages",
  "name": "UI Pages",
  "description": "หน้า UI ทั้งหมดจาก mockups",
  "bounded_context": "Presentation",
  "features": [generated_feature_ids],
  "progress": { "total": X, "passed": 0, "in_progress": 0 }
}
```

### Step 5: Update mockup_list.json

เพิ่ม reverse link:

```json
{
  "pages": [
    {
      "id": "001",
      "implemented_by_features": [generated_feature_id],
      "feature_status": "pending"
    }
  ],
  "last_synced_with_features": "[ISO_DATE]"
}
```

---

## Complexity to Time Mapping

| Complexity | Estimated Time |
|------------|----------------|
| simple | 20min |
| medium | 35min |
| complex | 60min |
| null (default) | 30min |

---

## Dependency Rules

1. **List page** ขึ้นกับ **GET list API**
2. **Form page** ขึ้นกับ **POST/PUT API**
3. **Detail page** ขึ้นกับ **GET by ID API**
4. **Auth pages** ไม่มี dependencies (ทำก่อน)
5. **Dashboard** ขึ้นกับ **all entities** (ทำหลัง)

---

## Example Output

### Input: mockup_list.json
```json
{
  "pages": [
    { "id": "001", "name": "Login", "category": "auth", "priority": "high", "complexity": "medium", "components": ["Card", "Input", "Button"] },
    { "id": "004", "name": "User List", "category": "list", "crud_group": "User", "priority": "medium", "complexity": "complex", "components": ["Table", "Pagination"] }
  ]
}
```

### Output: Features Added
```json
{
  "features": [
    {
      "id": 20,
      "epic": "ui-auth",
      "description": "สร้างหน้า Login",
      "priority": "high",
      "complexity": "medium",
      "references": [".mockups/001-login.mockup.md"],
      "required_components": ["Card", "Input", "Button"]
    },
    {
      "id": 21,
      "epic": "ui-user",
      "description": "สร้างหน้า User List",
      "priority": "medium",
      "complexity": "complex",
      "dependencies": [5],
      "references": [".mockups/004-user-list.mockup.md"],
      "required_components": ["Table", "Pagination"]
    }
  ]
}
```

---

## Post-Generation Actions

1. **Review generated features** - ตรวจสอบว่า features ถูกต้อง
2. **Adjust dependencies** - เพิ่ม dependencies ที่ขาดหายไป
3. **Run /validate-coverage** - ตรวจสอบ coverage
4. **Run /sync-mockups** - sync status ระหว่าง files

---

## Notes

- Features ที่สร้างจะมี `notes: "Auto-generated from mockup_list.json"`
- ไม่สร้าง feature ซ้ำถ้ามี feature ที่ reference ไปยัง mockup เดียวกันแล้ว
- ควรรันหลังจาก `/init-agent` เสร็จ
