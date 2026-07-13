---
doc_type: quotation
title: ขอบเขตการพัฒนาระบบ Demo Supplier Portal
client: บริษัท ตัวอย่าง จำกัด
quote_no: Q-2026-001
date: 13 ก.ค. 2026
tech_stack:
  - "Front End : ASP.NET Core"
  - "Back End : .NET Core"
  - "Database : SQL Server"
duration: 4 เดือน
warranty: 3 เดือน หลังจากส่งมอบ
currency: THB
manday_rate: 8000
notes:
  - "ไม่รวม Hardware และค่าเช่า Service ต่างๆ"
  - "ไม่รวม License ซอฟต์แวร์เชิงพาณิชย์"
---

# ขอบเขตการพัฒนาระบบ Demo Supplier Portal

## ความต้องการของระบบ (System Requirements)

- Front End : ASP.NET Core
- Back End : .NET Core
- Database : SQL Server

**ระยะเวลาพัฒนา:** 4 เดือน
**รับประกันผลงาน:** 3 เดือน หลังจากส่งมอบ

> หมายเหตุ: ไม่รวม Hardware และค่าเช่า Service ต่างๆ

## ขอบเขตงานและราคา (Scope & Price)

| No | Module | Description | Comment | Price |
|----|--------|-------------|---------|-------|
| 1 | **Supplier** | | | |
|  |  | Login | ส่ง OTP ทาง Email ให้ Supplier | |
|  |  | Forgot / Reset Password | ส่ง Email ให้ Supplier | |
|  |  | Register Create (Select by GC or All GC) | General info; Address (no limit); Accept Agreement; Attach (no limit) | |
|  |  | Check Progress | ดูสถานะการลงทะเบียน | |
| 2 | **Business User (Admin)** | | | |
|  |  | Role & Menu Setup | | |
|  |  | Maintain Supplier | Approve/Reject, Send Email alert, Generate ID/Password | |
| 3 | **Report** | | | |
|  |  | Export Excel | | |
|  | **รวมทั้งหมด (Total)** | | | |

## งานนอกขอบเขต (Out of Scope / Optional)

รายการต่อไปนี้ **ไม่รวม** ในราคาข้างต้น

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
