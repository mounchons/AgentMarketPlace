---
description: สร้างเอกสารออกแบบระบบใหม่จาก requirements
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*)
---

# Create Design Document Command

สร้างเอกสารออกแบบระบบใหม่จาก requirements ที่ได้รับจาก user

## Input ที่ได้รับ

```
/create-design-doc สร้างเอกสารสำหรับระบบ HR
/create-design-doc ระบบจัดการสต็อกสินค้า
/create-design-doc $ARGUMENTS
```

## ขั้นตอนที่ต้องทำ

### Step 0: ตรวจสอบ design_doc_list.json (สำคัญ!)

```bash
# ตรวจสอบว่ามี design_doc_list.json หรือไม่
cat .design-docs/design_doc_list.json 2>/dev/null
```

**ถ้ามี design_doc_list.json:**
- ตรวจสอบว่ามีเอกสารที่ชื่อเดียวกันอยู่แล้วหรือไม่
- ใช้ข้อมูล project_name, technology_stack ที่มีอยู่

**ถ้ายังไม่มี:**
- สร้างโฟลเดอร์ `.design-docs/` และไฟล์ `design_doc_list.json`

### Step 1: รวบรวม Requirements

**ถาม user เกี่ยวกับ:**

```
📋 Requirements Gathering

กรุณาให้ข้อมูลเพิ่มเติม:

1. ชื่อระบบ: [ระบุชื่อ]
2. วัตถุประสงค์: [อธิบายสั้นๆ ว่าระบบทำอะไร]
3. Scope: [ขอบเขตของระบบ - อะไรอยู่ใน/นอกขอบเขต]
4. กลุ่มผู้ใช้: [User roles ที่จะใช้ระบบ]
5. Features หลัก: [รายการ features ที่ต้องมี]
6. Technology Stack: [ถ้ามี - เช่น .NET, Node.js, React]

หรือต้องการให้เริ่มจากข้อมูลเบื้องต้นแล้วค่อยเพิ่มทีหลัง?
```

### Step 2: กำหนดโครงสร้างเอกสาร

**อ่าน templates:**
- `templates/design-doc-template.md` - Template หลัก
- `references/document-sections.md` - รายละเอียดแต่ละ section

**Document Structure (10 Sections):**

```
1. บทนำและภาพรวมระบบ (Introduction & Overview)
2. ความต้องการระบบ (System Requirements)
3. โมดูลที่เกี่ยวข้อง (Module Overview)
4. Data Model
5. Data Flow Diagram
6. Flow Diagrams
7. ER Diagram
8. Data Dictionary
9. Sitemap
10. User Roles & Permissions
```

### Step 3: ออกแบบ Data Model

**สร้าง entities จาก requirements:**
1. ระบุ entities หลัก (User, Order, Product, etc.)
2. กำหนด attributes ของแต่ละ entity
3. ระบุ relationships (1:1, 1:N, M:N)
4. กำหนด Primary Keys และ Foreign Keys

### Step 4: สร้าง Diagrams

**ใช้ patterns จาก:**
- `references/mermaid-patterns.md` - รูปแบบ diagrams
- `references/architecture-patterns.md` - Architecture patterns (Microservices, Clean Architecture, DDD)

**Diagrams ที่ต้องสร้าง:**

| Diagram | Description |
|---------|-------------|
| High-Level Architecture | ภาพรวม architecture ของระบบ |
| ER Diagram | Entity Relationships |
| Flow Diagram | Business process flows |
| DFD Level 0, 1 | Data Flow Diagrams |
| Sequence Diagram | API/Integration flows |
| Sitemap | Page/Navigation structure |

### Step 5: สร้าง Data Dictionary

**ใช้ template จาก:**
- `references/data-dictionary-template.md`

**สำหรับแต่ละ table:**
- Column definitions
- Data types
- Constraints (PK, FK, UK, NN)
- Indexes
- Business rules

### Step 6: สร้างไฟล์เอกสาร

**File Naming:**
```
.design-docs/system-design-[project-name].md
```

**ตัวอย่าง:**
- `system-design-hr-management.md`
- `system-design-inventory-system.md`
- `system-design-ecommerce.md`

### Step 7: อัพเดท design_doc_list.json

```json
{
  "documents": [
    {
      "id": "DOC-001",
      "name": "HR Management System",
      "file_path": "system-design-hr-management.md",
      "status": "draft",
      "sections_completed": [
        "introduction",
        "requirements",
        "modules",
        "data_model",
        "er_diagram",
        "dfd",
        "flow_diagrams",
        "data_dictionary",
        "sitemap",
        "permissions"
      ],
      "diagrams": {
        "er_diagram": true,
        "flow_diagrams": 3,
        "dfd_levels": [0, 1],
        "sequence_diagrams": 2,
        "sitemap": true
      },
      "entities_count": 8,
      "tables_count": 12,
      "related_mockups": [],
      "related_features": [],
      "created_at": "2025-01-20T10:00:00Z",
      "updated_at": "2025-01-20T10:00:00Z"
    }
  ]
}
```

---

## Validation Checklist

ก่อนถือว่าเสร็จ ต้องตรวจสอบ:

- [ ] ครบทั้ง 10 sections
- [ ] ER Diagram มี entities และ relationships ครบ
- [ ] DFD Level 0 (Context) และ Level 1 สอดคล้องกัน
- [ ] Flow Diagrams ครอบคลุม business processes หลัก
- [ ] Data Dictionary ครบทุก table
- [ ] User Roles มี permission matrix
- [ ] Mermaid syntax ถูกต้อง (ไม่มี error)

---

## Output

### Success

```
✅ สร้าง System Design Document สำเร็จ!

📁 File: .design-docs/system-design-hr-management.md

📊 Document Summary:
   • 10 sections completed
   • 5 diagrams (ER, 3 Flow, 2 DFD levels, Sitemap, 2 Sequence)
   • 12 tables in Data Dictionary
   • 4 User Roles defined

📈 Entities & Relationships:
   • Entities: 8 (Employee, Department, Position, Leave, etc.)
   • Relationships: 12

🔐 User Roles:
   • Super Admin, HR Manager, Manager, Employee

💡 Next steps:
   • /ui-mockup → สร้าง UI Mockups จากเอกสาร
   • /validate-design-doc → ตรวจสอบความครบถ้วน
   • Review และปรับปรุงเอกสาร
```

---

## Resources

| Resource | Description |
|----------|-------------|
| `references/document-sections.md` | รายละเอียดแต่ละ section |
| `references/mermaid-patterns.md` | รูปแบบ diagrams ทั้งหมด |
| `references/architecture-patterns.md` | Microservices, Clean Architecture, DDD patterns |
| `references/data-dictionary-template.md` | รูปแบบ Data Dictionary |
| `templates/design-doc-template.md` | Template เอกสารฉบับเต็ม |
