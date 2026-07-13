# Quotation `.md` template

Copy this verbatim and fill the `{{...}}` placeholders. Keep the frontmatter keys and the two table
headers exactly as written (they are the exporter contract — see `format-spec.md`). Leave every `Price`
cell and the Manday rate **blank** — the user fills those.

The body (between the frontmatter and `## ขอบเขตงานและราคา`) is a human-readable mirror; regenerate it
from the frontmatter whenever the header facts change.

````markdown
---
doc_type: quotation
title: {{ขอบเขตการพัฒนาระบบ ...}}
client: {{ชื่อลูกค้า หรือเว้นว่าง}}
quote_no: {{เลขที่ใบเสนอราคา หรือเว้นว่าง}}
date: {{วันที่ หรือเว้นว่าง}}
tech_stack:
  - "{{Front End : ASP.NET Core}}"
  - "{{Back End : .NET Core}}"
  - "{{Database : SQL Server}}"
duration: {{ระยะเวลาพัฒนา เช่น 4 เดือน}}
warranty: {{รับประกันผลงาน เช่น 3 เดือน หลังจากส่งมอบ}}
currency: THB
manday_rate: 8000
notes:
  - "ไม่รวม Hardware และค่าเช่า Service ต่างๆ"
  - "{{หมายเหตุอื่น ๆ ถ้ามี}}"
---

# {{title}}

## ความต้องการของระบบ (System Requirements)

- {{Front End : ASP.NET Core}}
- {{Back End : .NET Core}}
- {{Database : SQL Server}}

**ระยะเวลาพัฒนา:** {{4 เดือน}}
**รับประกันผลงาน:** {{3 เดือน หลังจากส่งมอบ}}

> หมายเหตุ: ไม่รวม Hardware และค่าเช่า Service ต่างๆ

## ขอบเขตงานและราคา (Scope & Price)

| No | Module | Description | Comment | Price |
|----|--------|-------------|---------|-------|
| 1 | **{{ชื่อ Module 1}}** | | | |
|  |  | {{รายละเอียด/ฟังก์ชัน}} | {{หมายเหตุขอบเขต ถ้ามี}} | |
|  |  | {{รายละเอียด/ฟังก์ชัน}} | | |
| 2 | **{{ชื่อ Module 2}}** | | | |
|  |  | {{รายละเอียด/ฟังก์ชัน}} | | |
|  | **รวมทั้งหมด (Total)** | | | |

## งานนอกขอบเขต (Out of Scope / Optional)

รายการต่อไปนี้ **ไม่รวม** ในราคาข้างต้น — บางรายการลูกค้าจัดหาเอง บางรายการคิดเพิ่มตาม Manday
(ค่า Manday เป็นค่า default มาตรฐาน ปรับได้ตามงานจริง — ดู `references/defaults.md`)

| No | รายการ | หมายเหตุ | Manday |
|----|--------|----------|--------|
| 1 | ค่า Hardware / Server | ลูกค้าจัดหาเอง | - |
| 2 | ค่า License (OS, Database, Software เชิงพาณิชย์, SSL) | ลูกค้าจัดหาเอง | - |
| 3 | ค่าเช่า Cloud / Service รายเดือน (AWS/Azure ฯลฯ) | คิดตามการใช้งานจริง | - |
| 4 | Penetration Testing | ทดสอบเจาะระบบก่อน go-live | 5 |
| 5 | ย้าย Cloud — เจ้าเดิม เปลี่ยน Account | ค่าติดตั้งใหม่ ไม่รวม Pentest ที่ใหม่ | 3 |
| 6 | ย้าย Cloud — เจ้าใหม่ (ใช้ OAuth เดิม) | ค่าย้าย+ติดตั้ง ไม่รวม Pentest | 10 |
| 7 | ย้าย Cloud — เจ้าใหม่ (เปลี่ยน OAuth) | ค่าย้าย+ติดตั้ง ไม่รวม Pentest | 20 |

**อัตราค่าบริการ:** 1 Manday = 8,000 บาท
````

## Notes for the author (Claude)

- **Number the modules** 1..N in the `No` column of each module row.
- **One feature per line-item row.** Do not cram a bullet list into a single cell — mirror the real
  quotes where each function is its own row.
- **Bold** every module name (`**...**`) and the total row label. The exporter uses that as the signal
  for "this is a module row / the total row".
- Trim the out-of-scope table to what's relevant, but **always keep rows 1–3** (Hardware, License,
  Cloud/Service) — the user wants those exclusions on every quote. Rows 4–7 (Pentest, cloud migration)
  ship by default with their standard Manday values (see `references/defaults.md`); drop one only if it's
  clearly irrelevant to the project.
- **Never fill the module `Price` column or the grand total** — those are per-project and stay blank
  until the user fills them. (If the user dictates a price in the request, put it in.)
- **Do** ship the defaults from `references/defaults.md`: `manday_rate: 8000` in the frontmatter and the
  standard out-of-scope Manday numbers. The user can override any of these per quote.
