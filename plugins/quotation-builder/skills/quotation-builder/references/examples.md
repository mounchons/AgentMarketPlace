# Real quotation examples (condensed few-shot)

Distilled from the user's own Excel quotations in `docs/quatation-example/`. Use these to match tone,
granularity, and structure. **Prices shown are the user's historical numbers — for reference only; a new
draft leaves Price blank.**

---

## Example A — TBSC Supplier Portal (clean 5-column style, single grand total)

Header:
- Web Client — Front End: ASP.NET Core, Back End: .NET Core
- ระยะเวลาพัฒนา 4 เดือน · รับประกันผลงาน 3 เดือน หลังจากส่งมอบ
- หมายเหตุ: ไม่รวม Hardware และค่าเช่า Service ต่างๆ

Scope (abridged):

| No | Module | Description | Comment | Price |
|----|--------|-------------|---------|-------|
| 1 | **Supplier** | | | |
|  |  | Login | send OTP with Email to Supplier | |
|  |  | Forgot Password | send Email to Supplier | |
|  |  | Register Create (Select by GC or All GC) | General info; Address (no limit); Accept Agreement; Print/Download form; Attach (no limit) | |
|  |  | Check Progress | View register status or pending work | |
| 2 | **Business User Login (Admin)** | | | |
|  |  | Role & Menu Setup | | |
|  |  | Maintain Supplier | Approve/Reject, Send Email alert, Generate ID/Password | |
|  | **รวมทั้งหมด (Total)** | | | 420,000 |

Out of scope (this quote used Manday framing):

| No | รายการ | หมายเหตุ | Manday |
|----|--------|----------|--------|
| 1 | Penetration Testing | | 5 |
| 2 | ย้าย Cloud เจ้าเดิม เปลี่ยน Account | ค่าติดตั้งใหม่ | 3 |
| 3 | ย้าย Cloud เจ้าใหม่ (OAuth เดิม) | ไม่รวม Pentest ที่ใหม่ | 10 |
| 4 | ย้าย Cloud เจ้าใหม่ (เปลี่ยน OAuth) | ไม่รวม Pentest ที่ใหม่ | 20 |

`1 Manday = 8,000`

---

## Example B — Expend System (per-module prices + grand total)

Header:
- ASP.NET MVC (.NET 6 / .NET Framework 4.7.2+), SQL Server, Web Hosting รองรับ .NET Framework
- ระยะเวลาพัฒนา 4 เดือน · รับประกันผลงาน 12 เดือน หลังจากส่งมอบ

Scope (abridged — note prices sit on the module row):

| No | Module | Description | Comment | Price |
|----|--------|-------------|---------|-------|
| 1 | **BackOffice Web — ระบบจัดการสิทธิ์** | | | 550,000 |
|  |  | Login AD | | |
|  |  | จัดการระดับผู้ใช้งาน (Role) ผูกสิทธิ์ระดับเมนู | | |
|  |  | เก็บ Log Login + หน้าจอดู Log | | |
| 2 | **ค่าใช้จ่าย** | | | |
|  |  | จัดการประเภทค่าใช้จ่าย | Gen Text File รหัสบัญชี เพื่อ Interface เข้า SAP | |
|  |  | บันทึก / อนุมัติ / ยกเลิก / ออกเอกสาร / ออกรายงาน | | |
| 3 | **Console App** | Generate Textfile ส่งข้อมูลให้ SAP | ใช้ Windows Task Scheduler ทุก 1 วัน | 50,000 |
|  | **รวมทั้งหมด (Total)** | | | 600,000 |

---

## Example C — TBSC Supplier Portal Phase 2 (auction, per-module prices)

Header:
- Web Client — Front End: ASP.NET Core, Back End: .NET Core
- ระยะเวลาพัฒนา 8 เดือน · รับประกันผลงาน 3 เดือน หลังจากส่งมอบ

Scope (abridged):

| No | Module | Description | Comment | Price |
|----|--------|-------------|---------|-------|
| 1 | **Auction Management** | | | 300,000 |
|  |  | Create Auction | สร้างจากข้อมูลต้นทาง | |
|  |  | Edit / Publish / Close Auction | ระบบแสดงผลอย่างเดียว ไม่รองรับ payment ในระบบ | |
| 2 | **Bid Management** | | | 450,000 |
|  |  | Join / Place Bid / Bid History / Validation | reverse auction, ซ่อนชื่อผู้เสนอราคา | |
| 3 | **Master & Service Management** | | | 200,000 |
| 4 | **User Management** | register/login/reset เชื่อมกับ Portal Web | | 150,000 |
| 5 | **Report & Analytics** | | | 200,000 |
|  | **รวมทั้งหมด (Total)** | | | 1,300,000 |

This quote also had a **Timeline** sheet (Gantt by week/month). This build is scope-and-price only —
if the user wants a timeline, note it as a follow-up (not covered by the exporter).

---

## What to carry across

- Module names mix Thai + English freely; keep the user's phrasing.
- One function per line-item row; caveats (`*** ...`) go in the Comment column.
- Warranty and duration vary per project — always ask / carry from the source, never hardcode.
- Price placement is flexible: per-module, or only a grand total. Support both; leave blank in a draft.
