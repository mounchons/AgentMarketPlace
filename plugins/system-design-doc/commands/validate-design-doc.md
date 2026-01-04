---
description: ตรวจสอบความครบถ้วนและความสอดคล้องของเอกสารออกแบบระบบ
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*)
---

# Validate Design Document Command

ตรวจสอบความครบถ้วน ความถูกต้อง และความสอดคล้องของเอกสารออกแบบระบบ

## Input ที่ได้รับ

```
/validate-design-doc
/validate-design-doc system-design-hr.md
/validate-design-doc --strict
/validate-design-doc $ARGUMENTS
```

## ขั้นตอนที่ต้องทำ

### Step 1: ระบุเอกสารที่ต้องตรวจสอบ

**ถ้าไม่ได้ระบุไฟล์:**

```bash
# ค้นหาเอกสารออกแบบระบบ
ls -la .design-docs/*.md 2>/dev/null
```

**แสดงรายการให้เลือก:**
```
📋 Available Design Documents:

   ┌────┬─────────────────────────────────┬────────────┐
   │ #  │ Document                        │ Status     │
   ├────┼─────────────────────────────────┼────────────┤
   │ 1  │ system-design-hr-management.md  │ completed  │
   │ 2  │ system-design-inventory.md      │ draft      │
   └────┴─────────────────────────────────┴────────────┘

   เลือกหมายเลข หรือ 'all' เพื่อตรวจทั้งหมด:
```

### Step 2: อ่านเอกสาร

```bash
cat .design-docs/system-design-[name].md
```

### Step 3: Validation Checks

---

## Validation Categories

### 1. Section Completeness Check

**ตรวจสอบว่ามีครบ 10 sections:**

| # | Section | Required? | Check |
|---|---------|-----------|-------|
| 1 | Introduction & Overview | Yes | Header, objectives, scope |
| 2 | System Requirements | Yes | FR, NFR tables |
| 3 | Module Overview | Yes | Module list, dependencies |
| 4 | Data Model | Yes | Entity overview |
| 5 | Data Flow Diagram | Yes | DFD Level 0, Level 1 |
| 6 | Flow Diagrams | Yes | At least 1 process flow |
| 7 | ER Diagram | Yes | Entities with relationships |
| 8 | Data Dictionary | Yes | At least 1 table definition |
| 9 | Sitemap | Yes | Page hierarchy |
| 10 | User Roles & Permissions | Yes | Roles, permission matrix |

**Result:**
```
📋 Section Completeness: 10/10 ✅

   ✅ 1. Introduction & Overview
   ✅ 2. System Requirements
   ✅ 3. Module Overview
   ✅ 4. Data Model
   ✅ 5. Data Flow Diagram
   ✅ 6. Flow Diagrams
   ✅ 7. ER Diagram
   ✅ 8. Data Dictionary
   ✅ 9. Sitemap
   ✅ 10. User Roles & Permissions
```

---

### 2. Diagram Syntax Validation

**ตรวจสอบ Mermaid syntax:**

| Diagram Type | Common Errors |
|--------------|---------------|
| ER Diagram | Missing PK/FK markers, invalid relationship syntax |
| Flow Diagram | Unclosed subgraphs, missing node definitions |
| Sequence Diagram | Invalid participant names, missing arrows |
| State Diagram | Missing transitions, invalid state names |

**Mermaid Syntax Checks:**
- ทุก `erDiagram` block มี entity definitions
- ทุก `flowchart` block มี valid node connections
- ทุก `sequenceDiagram` block มี participant definitions
- ไม่มี unclosed brackets หรือ quotes

**Result:**
```
📊 Diagram Syntax: 5/5 valid ✅

   ✅ ER Diagram (8 entities, 12 relationships)
   ✅ DFD Level 0 (Context)
   ✅ DFD Level 1 (5 processes)
   ✅ Flow Diagram: Approval Process
   ✅ Sequence Diagram: Login Flow
```

---

### 3. Consistency Checks

#### 3.1 ER Diagram ↔ Data Dictionary

**ตรวจสอบ:**
- [ ] ทุก entity ใน ER Diagram มีใน Data Dictionary
- [ ] ทุก table ใน Data Dictionary มีใน ER Diagram
- [ ] Columns ตรงกัน
- [ ] FK relationships ตรงกัน

**Result:**
```
🔄 ER ↔ Data Dictionary Consistency:

   ✅ All 8 entities have corresponding tables
   ✅ All relationships match FK definitions

   ⚠️ Warnings:
      • Entity 'AuditLog' has 5 columns in ER, 7 in DD (extra: created_by, ip_address)
```

#### 3.2 Sitemap ↔ User Roles

**ตรวจสอบ:**
- [ ] ทุกหน้าใน Sitemap มี access rule
- [ ] ไม่มีหน้าที่ไม่มี role เข้าถึง

**Result:**
```
🔐 Sitemap ↔ Roles Consistency:

   ✅ All 15 pages have access rules defined
   ✅ No orphan pages found
```

#### 3.3 DFD Level 0 ↔ Level 1

**ตรวจสอบ:**
- [ ] System ใน Level 0 มี processes ใน Level 1
- [ ] External entities ตรงกัน
- [ ] Data flows สอดคล้องกัน

**Result:**
```
📈 DFD Level Consistency:

   ✅ All Level 0 flows expanded in Level 1
   ✅ External entities match (Customer, Admin, Payment Gateway)
```

#### 3.4 Modules ↔ Other Sections

**ตรวจสอบ:**
- [ ] Modules ใน Overview ปรากฏใน Flow Diagrams
- [ ] Modules มี entities ที่เกี่ยวข้อง

**Result:**
```
📦 Module Consistency:

   ✅ All 5 modules have corresponding entities
   ✅ All modules appear in at least one flow diagram
```

---

### 4. Quality Checks

#### 4.1 Requirements Quality

**ตรวจสอบ FR/NFR:**
- [ ] ทุก FR มี unique ID (FR-001, FR-002, ...)
- [ ] ทุก FR มี priority (High, Medium, Low)
- [ ] NFR ครอบคลุม: Performance, Security, Availability

**Result:**
```
📝 Requirements Quality:

   ✅ 15 Functional Requirements with valid IDs
   ✅ All FRs have priority assigned
   ✅ NFR coverage: Performance ✅, Security ✅, Availability ✅, Scalability ✅
```

#### 4.2 Data Dictionary Quality

**ตรวจสอบ:**
- [ ] ทุก table มี PK
- [ ] ทุก FK มี reference
- [ ] Data types ถูกต้องตาม convention
- [ ] มี indexes สำหรับ FK และ search columns

**Result:**
```
📊 Data Dictionary Quality:

   ✅ All 12 tables have Primary Keys
   ✅ All 18 Foreign Keys have valid references
   ✅ Data types follow convention

   ⚠️ Warnings:
      • Table 'orders': Consider adding index on 'created_at' for date range queries
```

#### 4.3 Diagram Complexity

**ตรวจสอบ:**
- [ ] ER Diagram ไม่มี entity เกิน 20 (แนะนำแยก domain)
- [ ] Flow Diagram แต่ละอันไม่มีเกิน 15 nodes
- [ ] Sequence Diagram ไม่มีเกิน 10 participants

**Result:**
```
📏 Diagram Complexity:

   ✅ ER Diagram: 8 entities (acceptable)
   ✅ Flow Diagrams: avg 7 nodes (good)
   ⚠️ Sequence "Checkout": 8 participants (consider simplifying)
```

---

## Validation Modes

### Standard Mode (Default)

ตรวจสอบความครบถ้วนและความสอดคล้องพื้นฐาน

### Strict Mode (`--strict`)

ตรวจสอบเพิ่มเติม:
- ทุก entity ต้องมี audit columns (created_at, updated_at)
- ทุก table ต้องมี indexes ที่เหมาะสม
- ทุก API endpoint ต้องมี Sequence Diagram
- ทุก business rule ต้องปรากฏใน Flow Diagram

---

## Output

### All Pass

```
✅ Validation Passed!

📁 File: .design-docs/system-design-hr-management.md

📊 Validation Summary:
   ┌─────────────────────────┬────────┬──────────┐
   │ Category                │ Score  │ Status   │
   ├─────────────────────────┼────────┼──────────┤
   │ Section Completeness    │ 10/10  │ ✅ Pass  │
   │ Diagram Syntax          │ 5/5    │ ✅ Pass  │
   │ Consistency Checks      │ 4/4    │ ✅ Pass  │
   │ Quality Checks          │ 4/4    │ ✅ Pass  │
   └─────────────────────────┴────────┴──────────┘

   Overall: ✅ VALID

📈 Statistics:
   • Entities: 8
   • Tables: 12
   • Relationships: 18
   • Diagrams: 7
   • Requirements: 15 FR, 6 NFR
   • User Roles: 4

💡 Next steps:
   • /ui-mockup → สร้าง UI Mockups
   • Export เอกสารเพื่อ review
```

### With Warnings

```
⚠️ Validation Passed with Warnings

📁 File: .design-docs/system-design-inventory.md

📊 Validation Summary:
   ┌─────────────────────────┬────────┬──────────┐
   │ Category                │ Score  │ Status   │
   ├─────────────────────────┼────────┼──────────┤
   │ Section Completeness    │ 10/10  │ ✅ Pass  │
   │ Diagram Syntax          │ 5/5    │ ✅ Pass  │
   │ Consistency Checks      │ 3/4    │ ⚠️ Warn  │
   │ Quality Checks          │ 3/4    │ ⚠️ Warn  │
   └─────────────────────────┴────────┴──────────┘

   Overall: ⚠️ VALID with warnings

⚠️ Warnings (2):
   1. ER↔DD: Entity 'Report' not in Data Dictionary
   2. Quality: Table 'products' missing index on 'category_id'

💡 Recommended Actions:
   • /edit-section Data Dictionary - เพิ่มตาราง reports
   • Review indexes for frequently queried columns
```

### Failed

```
❌ Validation Failed

📁 File: .design-docs/system-design-legacy.md

📊 Validation Summary:
   ┌─────────────────────────┬────────┬──────────┐
   │ Category                │ Score  │ Status   │
   ├─────────────────────────┼────────┼──────────┤
   │ Section Completeness    │ 7/10   │ ❌ Fail  │
   │ Diagram Syntax          │ 3/5    │ ❌ Fail  │
   │ Consistency Checks      │ 2/4    │ ❌ Fail  │
   │ Quality Checks          │ 2/4    │ ⚠️ Warn  │
   └─────────────────────────┴────────┴──────────┘

   Overall: ❌ INVALID

❌ Critical Issues (3):
   1. Missing sections: DFD, Sitemap, User Roles
   2. ER Diagram syntax error at line 45: unclosed entity
   3. 5 entities in ER without corresponding tables

⚠️ Warnings (2):
   1. No NFR defined for Security
   2. Flow Diagram "Order Process" has 18 nodes (consider splitting)

💡 Required Actions:
   1. /edit-section DFD - เพิ่ม Data Flow Diagrams
   2. /edit-section Sitemap - เพิ่ม Navigation structure
   3. /edit-section ER Diagram - แก้ไข syntax error
   4. /edit-section Data Dictionary - เพิ่มตารางที่ขาด
```

---

## Resources

| Resource | Description |
|----------|-------------|
| `references/document-sections.md` | รายละเอียด sections ที่ต้องมี |
| `references/troubleshooting.md` | วิธีแก้ไขปัญหาที่พบบ่อย |
| `references/mermaid-patterns.md` | Mermaid syntax ที่ถูกต้อง |
