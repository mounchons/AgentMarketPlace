# รายงานข้อผิดพลาด: System Design Doc Skill

**วันที่ตรวจสอบ**: 2026-03-24
**ผู้ตรวจ**: Claude Opus 4.6 (Gap Audit)
**ไฟล์ที่ตรวจ**: `.design-docs/system-design-transport.md`
**ผลสรุป**: ⚠️ พบ inconsistencies 8 ประเภท — ER Diagrams ไม่ตรง DD, ตารางหาย, FK ผิด

---

## สารบัญ

1. [สรุปปัญหา](#1-สรุปปัญหา)
2. [Section Numbering Gap](#2-section-numbering-gap)
3. [ER Diagram vs Data Dictionary Mismatches](#3-er-diagram-vs-data-dictionary-mismatches)
4. [Tables in ER แต่ไม่มีใน DD](#4-tables-in-er-แต่ไม่มีใน-dd)
5. [Tables in DDL แต่ไม่มีใน DD](#5-tables-in-ddl-แต่ไม่มีใน-dd)
6. [FK Reference ผิดพลาด](#6-fk-reference-ผิดพลาด)
7. [Table Count ไม่ตรง](#7-table-count-ไม่ตรง)
8. [Amphur Table หายไป](#8-amphur-table-หายไป)
9. [Expense Module Consolidation ไม่ Update ER](#9-expense-module-consolidation-ไม่-update-er)
10. [ข้อเสนอปรับปรุง Skill](#10-ข้อเสนอปรับปรุง-skill)

---

## 1. สรุปปัญหา

| ประเภท | ความรุนแรง | รายละเอียด |
|--------|-----------|-----------|
| ER vs DD mismatch | **Critical** | DIESEL, LEDGER, UNIT tables ใน ER ไม่ตรง DD |
| Missing DD sections | **Critical** | Ledger/Budget 4 tables ไม่มี DD section |
| Section numbering gap | **High** | Section 8.32 หายไป |
| DDL-only tables | **High** | 5 tables ใน DDL ไม่มีใน DD |
| FK ผิด | **Medium** | products.unit_id ใน ER vs products.unit VARCHAR ใน DD |
| Table count | **Medium** | อ้าง 57 tables แต่มีจริง 55 sections |
| Amphur missing | **Medium** | อ้างใน API docs แต่ไม่มี DD section |
| ER not updated | **Medium** | Expense consolidation ไม่ update ER diagram |

---

## 2. Section Numbering Gap

### ปัญหา
Data Dictionary sections กระโดดจาก **8.31 (subscription_plans)** ไปที่ **8.33 (ticket_details)**

**Section 8.32 หายไป** — ไม่มี table ใน section นี้

### ผลกระทบ
- MEMORY.md อ้างว่ามี "57 tables" แต่จริงมี 55 sections (8.1-8.56 ลบ 8.32)
- Section 8.57 เป็น Enums ไม่ใช่ table

### สาเหตุ (skill issue)
- system-design-doc skill ไม่มี **section numbering validation** — ไม่ตรวจว่า section numbers ต่อเนื่องกัน
- ไม่มี auto-count ของ tables vs declared count

---

## 3. ER Diagram vs Data Dictionary Mismatches

### 3.1 DIESEL Table (ER 7.3)

**ER Diagram แสดง:**
```
DIESEL {
    uuid id PK
    uuid tenant_id FK
    date diesel_date
    decimal qty_liters
    decimal unit_price
    decimal amount
}
```

**DD แสดง:** เฉพาะ lookup tables — `diesel_rates` (8.49), `diesel_rate_details` (8.50)

**ความจริง:** Diesel transactions เก็บใน `expenses` table (8.21) ด้วย `fuel_liters`, `fuel_price_per_liter`

**ปัญหา:** ER diagram แสดง transactional table ที่ไม่มีจริง — misleading สำหรับ developer

### 3.2 LEDGER/BUDGET Tables (ER 7.7)

**ER Diagram แสดง 4 tables:**
- `LEDGER_CATEGORY`
- `LEDGER_ENTRY`
- `BUDGET`
- `CASHFLOW_DAILY`

**DD แสดง:** ❌ ไม่มี section 8.x สำหรับตารางเหล่านี้เลย

**ปัญหา:** ER diagram มี 4 tables ที่ไม่มี DD documentation — developer ต้องเดา schema

### 3.3 UNIT Table (ER 7.6)

**ER Diagram แสดง:**
```
PRODUCT }o--|| UNIT : uses
PRODUCT {
    uuid unit_id FK
}
```

**DD แสดง (8.51):** `products.unit` เป็น **VARCHAR** ไม่ใช่ FK

**ปัญหา:** Schema ถูก redesign (จาก FK → VARCHAR) แต่ ER diagram ไม่ได้ update

---

## 4. Tables in ER แต่ไม่มีใน DD

Entities ที่ปรากฏใน ER Diagrams แต่ **ไม่มี section 8.x** ใน Data Dictionary:

| Entity ใน ER | ER Section | DD Section | สถานะ |
|---|---|---|---|
| LEDGER_CATEGORY | 7.7 | ❌ ไม่มี | **Critical** |
| LEDGER_ENTRY | 7.7 | ❌ ไม่มี | **Critical** |
| BUDGET | 7.7 | ❌ ไม่มี | **Critical** |
| CASHFLOW_DAILY | 7.7 | ❌ ไม่มี | **Critical** |
| UNIT | 7.6 | ❌ ไม่มี | **High** |
| AGENT_EXPENSE_DETAIL | 7.4 | ❌ ไม่มี | Medium (consolidated) |
| CUSTOMER_EXPENSE_DETAIL | 7.4 | ❌ ไม่มี | Medium (consolidated) |
| DIESEL (transactional) | 7.3 | ❌ ไม่มี | Medium (in expenses) |

---

## 5. Tables in DDL แต่ไม่มีใน DD

DDL files ใน `docs/buntruk/02-database/` มี tables ที่ไม่มีใน DD:

| Table ใน DDL | DDL File | DD Section | สถานะ |
|---|---|---|---|
| password_reset_tokens | 04-ddl-tenant.sql | ❌ ไม่มี | Auth tables ไม่มีใน DD |
| refresh_tokens | 04-ddl-tenant.sql | ❌ ไม่มี | Auth tables ไม่มีใน DD |
| user_activity_logs | 04-ddl-tenant.sql | ❌ ไม่มี | Audit tables ไม่มีใน DD |
| workflow_steps | 02-ddl-core.sql | ❌ ไม่มี | Possibly renamed |
| expense_budgets | 03-ddl-financial.sql | ❌ ไม่มี | ไม่ตรงกับ BUDGET ใน ER |

### สาเหตุ (skill issue)
- system-design-doc skill ไม่มี **DDL-DD cross-validation** step
- DDL files ถูกเขียนแยกจาก DD — ไม่มีการ sync

---

## 6. FK Reference ผิดพลาด

### products.unit_id vs products.unit

| Source | Column | Type |
|---|---|---|
| ER Diagram 7.6 | `unit_id` | FK → UNIT table |
| DD Section 8.51 | `unit` | VARCHAR |
| Code (Product.cs) | `Unit` | string property |

**ผลกระทบ:** ER diagram บอกว่ามี UNIT lookup table แต่จริงเก็บเป็น free-text string

### สาเหตุ (skill issue)
- skill ไม่มี **ER-DD consistency validation**
- เมื่อ schema เปลี่ยน (FK → VARCHAR) ER diagram ไม่ได้ update ตาม

---

## 7. Table Count ไม่ตรง

| แหล่งอ้างอิง | จำนวน |
|---|---|
| MEMORY.md | 57 tables |
| DD sections (8.1-8.56 ลบ 8.32) | **55 sections** |
| ER Diagrams (unique tables) | ~63 tables (รวม duplicates) |
| DDL files (CREATE TABLE) | ~60 tables |
| Code entities | 56 classes |

**ปัญหา:** ไม่มี single source of truth สำหรับจำนวน tables

### สาเหตุ (skill issue)
- skill ไม่มี **auto-count validation** ระหว่าง sections
- เมื่อ add/remove table ไม่มีการ update count ใน summary

---

## 8. Amphur Table หายไป

### ปัญหา
- **API docs (section 3.3.3):** ระบุ `GET /api/v1/provinces, amphurs, districts`
- **Base Entity Hierarchy (line 496):** ระบุ `Province, Amphur, District (int PK)`
- **DD sections:** ❌ ไม่มี section สำหรับ `amphurs` table
- **DDL files:** ❌ ไม่มี CREATE TABLE amphurs
- **Code:** ❌ ไม่มี Amphur entity

### ผลกระทบ
Location hierarchy ไม่ครบ: Province → ~~Amphur~~ → District

### สาเหตุ (skill issue)
- Cross-reference ระหว่าง API docs section และ DD section ไม่ถูกตรวจ
- Entity hierarchy diagram ไม่ sync กับ DD

---

## 9. Expense Module Consolidation ไม่ Update ER

### ปัญหา
**ER 7.4 แสดง 4 separate tables:**
- AGENT_EXPENSE
- AGENT_EXPENSE_DETAIL
- CUSTOMER_EXPENSE
- CUSTOMER_EXPENSE_DETAIL

**DD แสดง:** Consolidated เป็น 2 tables:
- `expenses` (8.21) — unified expense table
- `expense_agents` (8.55) — agent-specific data

**ER diagram ไม่ได้ update** เมื่อ design เปลี่ยนจาก 4 tables → 2 tables

### สาเหตุ (skill issue)
- skill ไม่มี **ER update trigger** เมื่อ DD เปลี่ยน
- ER diagrams ถูก treat เป็น "one-time creation" ไม่ใช่ living document

---

## 10. ข้อเสนอปรับปรุง Skill

### 10.1 เพิ่ม Validation Steps

```
After generating/editing design doc:
1. Section Numbering: ตรวจ 8.x ต่อเนื่อง ไม่กระโดด
2. Table Count: นับ sections vs declared count
3. ER-DD Sync: ทุก table ใน ER ต้องมี DD section
4. DD-DDL Sync: ทุก table ใน DD ต้องมี DDL
5. FK Validation: ทุก FK ใน DD ต้อง point to existing table
6. Cross-section References: API docs, Hierarchy, ER ต้องสอดคล้องกัน
```

### 10.2 เพิ่ม Consistency Report

สร้าง report อัตโนมัติหลังแก้ไข design doc:
```
Tables Summary:
- DD sections: 55
- ER unique tables: 63
- DDL CREATE TABLE: 60
- MISMATCHES: [list]

FK Validation:
- Total FKs: 120
- Valid: 115
- Broken: 5 [list]

Section Gaps:
- Expected: 8.1-8.57
- Missing: 8.32
```

### 10.3 ER Diagram Auto-Update Rule

```
RULE: เมื่อแก้ไข DD section (add/remove/rename table):
1. ตรวจว่า ER diagram ที่เกี่ยวข้องถูก update
2. ถ้า ER ยังแสดง old schema → flag as warning
3. Generate diff report: "ER shows X, DD shows Y"
```

### 10.4 Living Document Enforcement

```
RULE: Design doc ต้อง sync กับ code:
1. หลัง implement entity → verify DD section exists
2. หลัง create migration → verify DDL matches DD
3. หลัง add API endpoint → verify API docs section exists
4. Run sync check at end of each coding session
```

---

## Appendix: Full Mismatch Matrix

| # | Table Name | ER | DD | DDL | Code | Status |
|---|---|---|---|---|---|---|
| 1 | LEDGER_CATEGORY | ✅ 7.7 | ❌ | ❌ | ✅ | DD missing |
| 2 | LEDGER_ENTRY | ✅ 7.7 | ❌ | ❌ | ✅ | DD missing |
| 3 | BUDGET | ✅ 7.7 | ❌ | ❌ | ✅ | DD missing |
| 4 | CASHFLOW_DAILY | ✅ 7.7 | ❌ | ❌ | ❌ | Not implemented |
| 5 | UNIT | ✅ 7.6 | ❌ | ❌ | ❌ | Redesigned to VARCHAR |
| 6 | DIESEL (txn) | ✅ 7.3 | ❌ | ❌ | ❌ | Merged into expenses |
| 7 | AGENT_EXPENSE_DETAIL | ✅ 7.4 | ❌ | ❌ | ❌ | Consolidated |
| 8 | CUSTOMER_EXPENSE_DETAIL | ✅ 7.4 | ❌ | ❌ | ❌ | Consolidated |
| 9 | password_reset_tokens | ❌ | ❌ | ✅ | ❌ | DDL only |
| 10 | refresh_tokens | ❌ | ❌ | ✅ | ❌ | DDL only |
| 11 | user_activity_logs | ❌ | ❌ | ✅ | ❌ | DDL only |
| 12 | expense_budgets | ❌ | ❌ | ✅ | ❌ | DDL only |
| 13 | truck_equipments | ❌ | ✅ 8.44 | ❌ | ❌ | Code missing |
| 14 | truck_files | ❌ | ✅ 8.45 | ❌ | ❌ | Code missing |
| 15 | truck_tires | ❌ | ✅ 8.46 | ❌ | ❌ | Code missing |
| 16 | truck_tire_logs | ❌ | ✅ 8.47 | ❌ | ❌ | Code missing |
| 17 | diesel_rates | ❌ | ✅ 8.49 | ❌ | ❌ | Code missing |
| 18 | diesel_rate_details | ❌ | ✅ 8.50 | ❌ | ❌ | Code missing |
| 19 | expense_agents | ❌ | ✅ 8.55 | ❌ | ❌ | Code missing |
| 20 | amphurs | ❌ | ❌ | ❌ | ❌ | Referenced but missing everywhere |
