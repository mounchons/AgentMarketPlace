# Quotation Builder — คู่มือการใช้งาน

Plugin สำหรับเขียน **ใบเสนอราคา / ขอบเขตงาน (quotation)** ตามรูปแบบ Excel ที่คุณใช้นำเสนอลูกค้าจริง
โดยทำงานแบบ **Markdown ก่อน** เพื่อให้ review/แก้ไข/กรอกราคาได้ง่าย แล้วค่อย export เป็น `.xlsx`

> **หลักการสำคัญ:** ระบบ **ไม่กรอกราคาให้เอง** — ช่อง `Price` และอัตรา `1 Manday = ___` จะเว้นว่างไว้เสมอ
> ให้คุณกรอกเอง ระบบทำหน้าที่วางโครง Module / รายละเอียด / หมายเหตุ และรายการนอกขอบเขตให้

---

## Flow การทำงาน (3 ขั้น)

```
1. /quotation-builder:quote  →  สร้าง quotation.md (ราคาเว้นว่าง)  →  review
2. กรอกราคาในคอลัมน์ Price (และ Manday rate) ใน quotation.md
3. /quotation-builder:export →  ได้ quotation.xlsx ตามฟอร์แมต Excel เดิม
```

### ขั้นที่ 1 — ร่างใบเสนอราคา (`.md`)

พิมพ์ `/quotation-builder:quote` แล้วตามด้วยขอบเขตงาน เช่น:

```
/quotation-builder:quote ระบบ Supplier Portal: มี Login OTP, ลงทะเบียน supplier, admin อนุมัติ, รายงาน export excel  ระยะเวลา 4 เดือน  .NET Core + SQL Server
```

ระบบจะ:
- จัดกลุ่มเป็น **Module** และ **รายการย่อย (line item)** ทีละบรรทัด
- ใส่ tech stack / ระยะเวลาพัฒนา / รับประกันผลงาน
- ใส่ส่วน **งานนอกขอบเขต** ให้อัตโนมัติ (ค่า Hardware, ค่า License, ค่าเช่า Cloud/Service + งาน optional เช่น Penetration Testing, ย้าย Cloud คิดเป็น Manday)
- **เว้นช่องราคาทั้งหมดไว้ว่าง** แล้วบันทึกเป็น `quotation.md`

ถ้าโปรเจกต์มี `scenarios.json` / `features.json` (ScenarioForge) อยู่แล้ว ระบบจะเสนอดึง Module มาจากไฟล์นั้นให้

### ขั้นที่ 2 — กรอกราคา

เปิด `quotation.md` แล้วเติมตัวเลขในคอลัมน์ `Price` (บนแถว Module หรือเฉพาะแถว **รวมทั้งหมด** ก็ได้)
และถ้าจะคิดงานนอกขอบเขต ให้แก้ `manday_rate:` ใน frontmatter ด้านบน เช่น `manday_rate: 8000`

ราคาใส่ได้หลายรูปแบบ: `250000`, `250,000`, `฿250,000` — ระบบอ่านเป็นตัวเลขให้เอง เว้นว่าง = ยังไม่กรอก

### ขั้นที่ 3 — Export เป็น Excel

พิมพ์ `/quotation-builder:export` (หรือระบุไฟล์ `/quotation-builder:export quotation.md`) จะได้ `quotation.xlsx`
หน้าตาตามฟอร์แมตเดิม: หัวเอกสาร merge, ตารางมีเส้นขอบ, แถว Module ตัวหนา, ราคามีคอมมา, แถวรวม, และบล็อกงานนอกขอบเขต

รันเองก็ได้:
```bash
python "<plugin>/scripts/export_xlsx.py" quotation.md quotation.xlsx
```

---

## โครงสร้างไฟล์ `.md` (contract)

ไฟล์ quotation มี 3 ส่วน (รายละเอียดเต็มใน `skills/quotation-builder/references/format-spec.md`):

1. **Frontmatter (YAML)** — `title`, `client`, `quote_no`, `date`, `tech_stack[]`, `duration`, `warranty`,
   `currency` (ค่าเริ่มต้น THB), `manday_rate` (เว้นว่าง), `notes[]`
2. **เนื้อหา (body)** — ส่วนอ่านสำหรับมนุษย์ (exporter ไม่อ่านส่วนนี้ — แก้ข้อมูลหัวที่ frontmatter)
3. **ตาราง 2 อัน**
   - **Scope:** `| No | Module | Description | Comment | Price |` — แถว Module ตัวหนา + ราคา, รายการย่อยใส่คอลัมน์ Description/Comment, ปิดด้วยแถว `**รวมทั้งหมด (Total)**`
   - **นอกขอบเขต:** `| No | รายการ | หมายเหตุ | Manday |` — `-` = ลูกค้าจัดหาเอง, เว้นว่าง = งาน optional รอกรอก Manday

> อย่าเปลี่ยนชื่อ key ใน frontmatter หรือหัวคอลัมน์ของตาราง — เป็นสัญญากับตัว exporter

---

## Requirements

- Python 3 + `openpyxl` + `PyYAML` (`pip install openpyxl pyyaml`)

## ขอบเขตของ build นี้

- **Quotation อย่างเดียว** — ยังไม่รวม Invoice (ใบวางบิล) และ Timeline (Gantt)
- อ้างอิงรูปแบบจากไฟล์จริงใน `docs/quatation-example/` (CMI, Expend, TBSC Supplier Portal V2 & Phase 2)
