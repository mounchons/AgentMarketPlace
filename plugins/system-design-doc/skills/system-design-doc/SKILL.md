---
name: system-design-doc
description: |
  สร้างเอกสารออกแบบระบบมาตรฐานครบวงจร รองรับทั้งภาษาไทยและอังกฤษ ใช้ Mermaid diagrams
  
  ใช้เมื่อ: (1) สร้าง System Design Document (2) วิเคราะห์ codebase เก่าแล้วสร้างเอกสาร (3) สร้าง ER Diagram (4) เขียน Flow Diagram (5) สร้าง Data Dictionary (6) ทำ DFD (7) ออกแบบ Sitemap (8) เขียน Sequence Diagram (9) Reverse engineer จาก code
  
  ตัวอย่างคำสั่ง: "สร้าง System Design Document สำหรับระบบ HR", "อ่าน codebase แล้วสร้างเอกสาร", "สร้าง ER Diagram จาก Entity classes", "เขียน Flow Diagram สำหรับกระบวนการอนุมัติ", "ทำ Data Dictionary จาก database schema", "วิเคราะห์ code แล้วสร้าง Sequence Diagram"
---

# System Design Document Skill

Skill สำหรับสร้างเอกสารออกแบบระบบมาตรฐาน พร้อม Mermaid diagrams รองรับทั้งการสร้างใหม่และ reverse engineering จาก codebase

## 💡 ตัวอย่างคำสั่งที่ใช้ได้

| สิ่งที่ต้องการ | ตัวอย่างคำสั่ง |
|---------------|---------------|
| **เอกสารฉบับเต็ม** | "สร้าง System Design Document สำหรับระบบ HR" |
| **จาก Codebase** | "อ่าน codebase นี้แล้วสร้างเอกสารออกแบบระบบ" |
| **ER Diagram** | "สร้าง ER Diagram สำหรับระบบจองห้องประชุม" |
| **ER จาก Code** | "วิเคราะห์ Entity classes แล้วสร้าง ER Diagram" |
| **Flow Diagram** | "เขียน Flow Diagram สำหรับกระบวนการอนุมัติลา" |
| **Flow จาก Code** | "อ่าน code แล้วสร้าง Flow Diagram ของ process นี้" |
| **Data Dictionary** | "ทำ Data Dictionary สำหรับตาราง employees" |
| **DD จาก Schema** | "สร้าง Data Dictionary จาก database schema" |
| **DFD** | "สร้าง Data Flow Diagram Level 1 สำหรับระบบสั่งซื้อ" |
| **Sitemap** | "ออกแบบ Sitemap สำหรับเว็บ E-commerce" |
| **Sitemap จาก Code** | "วิเคราะห์ routes/controllers แล้วสร้าง Sitemap" |
| **Sequence Diagram** | "เขียน Sequence Diagram สำหรับ Login process" |
| **Sequence จาก Code** | "อ่าน API code แล้วสร้าง Sequence Diagram" |

## Quick Start

### Mode 1: สร้างเอกสารใหม่จาก Requirements
1. รวบรวม requirements จากผู้ใช้
2. สร้างไฟล์ markdown ตาม template ใน `templates/design-doc-template.md`
3. เติม Mermaid diagrams ตาม patterns ใน `references/mermaid-patterns.md`
4. สร้าง Data Dictionary ตาม `references/data-dictionary-template.md`

### Mode 2: Reverse Engineering จาก Codebase
1. สแกนโครงสร้าง codebase (ดู `references/codebase-analysis.md`)
2. วิเคราะห์ไฟล์ตาม framework/technology
3. สกัดข้อมูลและสร้างเอกสารตาม template

### Mode 3: สร้าง Diagram เฉพาะส่วน
ดู patterns ใน `references/mermaid-patterns.md` สำหรับ:
- Flow Diagram
- Data Flow Diagram (DFD)
- ER Diagram
- Sequence Diagram
- Sitemap
- State Diagram
- Class Diagram

## Document Structure

เอกสารออกแบบระบบประกอบด้วยส่วนหลัก 10 ส่วน:

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

## Workflows

### Workflow 1: สร้างเอกสารใหม่จาก Requirements
```
1. Gather → รวบรวม requirements และ scope
2. Structure → กำหนดโครงสร้างเอกสารตาม template
3. Design → ออกแบบ Data Model และ Diagrams
4. Document → เขียนรายละเอียดแต่ละส่วน
5. Review → ตรวจสอบความครบถ้วนและถูกต้อง
```

### Workflow 2: Reverse Engineering จาก Codebase
```
1. Scan → สแกนโครงสร้าง project (view directory tree)
2. Identify → ระบุ framework และ technology stack
3. Analyze → วิเคราะห์ไฟล์สำคัญตาม references/codebase-analysis.md
   - Models/Entities → ER Diagram, Data Dictionary
   - Controllers/Services → Flow Diagram, Sequence Diagram
   - Routes/Pages → Sitemap
   - Config → Technology Stack, Architecture
4. Extract → สกัดข้อมูลจาก code
5. Generate → สร้างเอกสารตาม template
6. Validate → ตรวจสอบความถูกต้องกับ code
```

### Workflow 3: แก้ไขเอกสารที่มีอยู่
```
1. Analyze → วิเคราะห์เอกสารที่มีอยู่
2. Identify → ระบุส่วนที่ต้องแก้ไข
3. Update → อัพเดท content และ diagrams
4. Validate → ตรวจสอบความสอดคล้องทั้งเอกสาร
```

## Section Guidelines

### 1. บทนำและภาพรวมระบบ
ประกอบด้วย:
- ชื่อโครงการ/ระบบ
- วัตถุประสงค์
- ขอบเขต (Scope)
- ผู้มีส่วนได้ส่วนเสีย (Stakeholders)
- สถาปัตยกรรมภาพรวม (High-level Architecture)

### 2. ความต้องการระบบ (System Requirements)
แบ่งเป็น:
- Functional Requirements (FR)
- Non-Functional Requirements (NFR)
- Business Rules
- Constraints

### 3. โมดูลที่เกี่ยวข้อง (Module Overview)
- รายการ modules ทั้งหมด
- ความสัมพันธ์ระหว่าง modules
- หน้าที่หลักของแต่ละ module

### 4-9. Diagrams
ดูรายละเอียดใน `references/mermaid-patterns.md`

### 10. User Roles & Permissions
- รายการ roles ทั้งหมด
- Permission matrix
- Access control rules

## Output Format

สร้างเอกสารเป็นไฟล์ Markdown (.md) พร้อม:
- Mermaid code blocks สำหรับ diagrams
- ตาราง markdown สำหรับ Data Dictionary
- Headings ที่ชัดเจนสำหรับแต่ละส่วน

## Resources

- **Codebase Analysis Guide**: `references/codebase-analysis.md` - วิธีวิเคราะห์ code เพื่อสร้างเอกสาร
- **Mermaid Patterns**: `references/mermaid-patterns.md` - รูปแบบ diagrams ทั้งหมด
- **Document Sections Detail**: `references/document-sections.md` - รายละเอียดแต่ละส่วน
- **Data Dictionary Template**: `references/data-dictionary-template.md` - รูปแบบ Data Dictionary
- **Full Template**: `templates/design-doc-template.md` - Template เอกสารฉบับเต็ม
