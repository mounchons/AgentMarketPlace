# รายงานข้อผิดพลาด: UI Mockup Skill

**วันที่ตรวจสอบ**: 2026-03-24
**ผู้ตรวจ**: Claude Opus 4.6 (Gap Audit)
**ไฟล์ที่ตรวจ**: `.mockups/` (77 mockup files + mockup_list.json)
**ผลสรุป**: ⚠️ พบ inconsistencies 7 ประเภท — Library ผิด, Route ไม่ตรง, Mockup ซ้ำ

---

## สารบัญ

1. [สรุปปัญหา](#1-สรุปปัญหา)
2. [Alert Library ผิด (SweetAlert2 vs Sonner)](#2-alert-library-ผิด-sweetalert2-vs-sonner)
3. [Route URL ไม่ตรง Frontend](#3-route-url-ไม่ตรง-frontend)
4. [Duplicate Mockup File](#4-duplicate-mockup-file)
5. [Phase 2 Mockups ไม่ Tracked](#5-phase-2-mockups-ไม่-tracked)
6. [Field Name Discrepancies](#6-field-name-discrepancies)
7. [Design Tokens ไม่ถูกใช้](#7-design-tokens-ไม่ถูกใช้)
8. [Route Parameter Syntax ไม่ Consistent](#8-route-parameter-syntax-ไม่-consistent)
9. [ข้อเสนอปรับปรุง Skill](#10-ข้อเสนอปรับปรุง-skill)

---

## 1. สรุปปัญหา

| ประเภท | ความรุนแรง | จำนวนไฟล์ที่กระทบ |
|--------|-----------|-----------------|
| SweetAlert2 vs Sonner | **Critical** | 77 files ทั้งหมด |
| Route URL prefixes ผิด | **Major** | ~19 files |
| Duplicate mockup (005) | **Major** | 2 files |
| Phase 2 untracked | **Medium** | 13 files |
| Field name mismatch | **Medium** | หลาย files |
| Design tokens unused | **Medium** | 1 file |
| Mixed URL syntax (:id vs [id]) | **Low** | 77 files |

---

## 2. Alert Library ผิด (SweetAlert2 vs Sonner)

### ปัญหา
**ทุก mockup file (77 ไฟล์)** ระบุ **SweetAlert2** เป็น alert library:
```
| Alert Library | SweetAlert2 |
```

แต่ frontend จริงใช้ **Sonner** (toast notifications):
```typescript
// login-form.tsx
import { toast } from "sonner";
toast.error("เข้าสู่ระบบไม่สำเร็จ");
```

### ขนาดปัญหา
- 752 occurrences ของ "SweetAlert2" ใน mockup files
- Mockups ระบุ `Swal.fire({icon: 'error', ...})` แต่ code ใช้ `toast.error()`
- Confirmation dialogs ใน mockups ใช้ SweetAlert2 แต่ code ใช้ Shadcn AlertDialog

### ที่มาของปัญหา
CLAUDE.md มี note: "Removed sweetalert2, replaced with Shadcn AlertDialog"
→ Mockups ถูกสร้าง **ก่อน** Frontend Reset (2026-03-12) และไม่ได้ update

### สาเหตุ (skill issue)
- ui-mockup skill ไม่มี **library sync validation** — เมื่อ CLAUDE.md เปลี่ยน library ไม่มีการ update mockups
- ไม่มี mechanism ให้ mockups track library changes

### ข้อเสนอแก้ไข
```
1. Mockup skill ต้องอ่าน CLAUDE.md "Key Frontend Libraries" ก่อนสร้าง mockup
2. เมื่อ library เปลี่ยน → flag all mockups ที่อ้าง library เก่า
3. เพิ่ม "library version check" ใน mockup generation template
```

---

## 3. Route URL ไม่ตรง Frontend

### ปัญหา
Mockups ใช้ nested URL prefixes (`/financial/`, `/jobs/`) แต่ CLAUDE.md ระบุ "Flat module URLs":

| Module | Mockup URL | Frontend จริง | ตรงกัน? |
|---|---|---|---|
| Bills | `/financial/bills` | `/bills` | ❌ |
| Receipts | `/financial/receipts` | `/receipts` | ❌ |
| Tickets | `/financial/tickets` | `/tickets` | ❌ |
| Credits | `/financial/credits` | `/credits` | ❌ |
| Revenues | `/financial/revenues` | `/revenues` | ❌ |
| Loans | `/financial/loans` | `/loans` | ❌ |
| Quotations | `/jobs/quotations` | `/quotations` | ❌ |
| Route Pricing | `/jobs/route-pricing` | `/route-pricing` | ❌ |
| Expenses | `/expenses` | `/expenses` | ✅ |
| Jobs | `/jobs` | `/jobs` | ✅ |
| Customers | `/customers` | `/customers` | ✅ |
| Trucks | `/trucks` | `/trucks` | ✅ |

### ไฟล์ที่กระทบ
Mockups 007-009, 012-027 (~19 files) มี URL ที่ไม่ตรงกับ frontend routes

### สาเหตุ (skill issue)
- Mockups ถูกสร้างก่อนที่จะ finalize URL convention
- ui-mockup skill ไม่อ่าน CLAUDE.md "Frontend Conventions" section
- ไม่มี route validation ระหว่าง mockup URLs กับ actual `app/` directory structure

### ข้อเสนอแก้ไข
```
1. Mockup skill ต้องอ่าน CLAUDE.md "Frontend Conventions" ก่อนกำหนด URLs
2. Validate mockup URLs vs actual app/(app)/ directory structure
3. เมื่อ convention เปลี่ยน → bulk update URLs ใน affected mockups
```

---

## 4. Duplicate Mockup File

### ปัญหา
Job Form mockup มี 2 versions:

| File | Size | Date | Status |
|---|---|---|---|
| `005-job-form.mockup.md` | 22 KB | 2026-03-09 | Original |
| `005-job-form_gemini.mockup.md` | 61 KB | 2026-03-13 | Untracked (`??` in git) |

### ความแตกต่าง
- Original ใช้ `:id` syntax → `/jobs/:id/edit`
- Gemini version ใช้ `[id]` syntax → `/jobs/[id]/edit`
- Gemini version มี layout specs ละเอียดกว่า
- Gemini version marked as "Draft"

### ผลกระทบ
- Ambiguity: ไม่รู้ว่า version ไหนเป็น source of truth
- Developer อาจใช้ผิด version

### สาเหตุ (skill issue)
- ui-mockup skill ไม่มี **versioning/conflict detection**
- เมื่อสร้าง mockup ใหม่ที่มี ID ซ้ำ ไม่มี warning

### ข้อเสนอแก้ไข
```
1. เพิ่ม unique constraint: 1 mockup ID = 1 file
2. ถ้าสร้างใหม่ด้วย ID เดิม → ต้อง replace หรือ increment version
3. ลบ _gemini suffix — ใช้ version field ใน frontmatter แทน
```

---

## 5. Phase 2 Mockups ไม่ Tracked

### ปัญหา
13 mockup files เป็น untracked (`??`) ใน git:

```
.mockups/055-product-list.mockup.md
.mockups/056-product-form.mockup.md
.mockups/057-product-detail.mockup.md
.mockups/058-inventory-list.mockup.md
.mockups/059-inventory-form.mockup.md
.mockups/060-stock-movement.mockup.md
.mockups/071-profit-loss-report.mockup.md
.mockups/072-job-reports.mockup.md
.mockups/073-expense-reports.mockup.md
.mockups/074-bill-reports.mockup.md
.mockups/075-truck-reports.mockup.md
.mockups/076-budget-cashflow-report.mockup.md
.mockups/077-dashboard-reports.mockup.md
```

### ผลกระทบ
- mockup_list.json อาจไม่ include ทั้ง 13 files
- Git history ไม่ track changes ของ Phase 2 mockups
- อาจสูญหายถ้า clean working directory

### สาเหตุ (skill issue)
- ui-mockup skill สร้าง files แต่ **ไม่ git add** อัตโนมัติ
- mockup_list.json อาจไม่ได้ update เมื่อสร้าง mockups ใหม่

### ข้อเสนอแก้ไข
```
1. หลังสร้าง mockup → auto-update mockup_list.json
2. แนะนำ git add ทันทีหลังสร้าง
3. เพิ่ม validation: ไฟล์ใน directory = entries ใน mockup_list.json
```

---

## 6. Field Name Discrepancies

### ปัญหา
Mockup form fields ใช้ชื่อ Thai แต่ไม่มี mapping กลับไปที่ entity property names

**ตัวอย่าง Customer:**
| Mockup Label (Thai) | Entity Property | ตรงกัน? |
|---|---|---|
| ชื่อบริษัท | CompanyName | ✅ (แต่ต้อง guess) |
| ชื่อ | Name | ❓ Name หรือ CompanyName? |
| เลขประจำตัวผู้เสียภาษี | TaxId | ✅ |
| ที่อยู่ | Address | ✅ |

### ผลกระทบ
- Developer ต้องเดา mapping ระหว่าง Thai label กับ English property
- อาจ map ผิด field ถ้าชื่อคล้ายกัน

### สาเหตุ (skill issue)
- ui-mockup skill ไม่สร้าง **field mapping table** ใน mockup
- ไม่ reference entity property names จาก Design Doc

### ข้อเสนอแก้ไข
```
เพิ่ม Field Mapping section ใน mockup template:

## Field Mapping
| UI Label | Entity Property | Type | Validation |
|---|---|---|---|
| ชื่อบริษัท | Customer.CompanyName | string | required, max 200 |
| เลขภาษี | Customer.TaxId | string | pattern: \d{13} |
```

---

## 7. Design Tokens ไม่ถูกใช้

### ปัญหา
`_design-tokens.json` ถูกสร้างด้วย color/typography/spacing tokens:
```json
{
  "colors": {
    "primary": { "50": "#eff6ff", ... "900": "#1e3a5f" },
    "success": { ... },
    "warning": { ... }
  },
  "typography": { ... },
  "spacing": { ... }
}
```

แต่ frontend ใช้ **Shadcn/ui defaults + Tailwind config** โดยตรง — ไม่มี reference ถึง `_design-tokens.json`

### ผลกระทบ
- Maintenance burden: tokens file ต้อง maintain แต่ไม่ได้ใช้
- Misleading: mockups อ้าง tokens ที่ frontend ไม่ได้ follow

### สาเหตุ (skill issue)
- ui-mockup skill สร้าง design tokens เป็น aspirational document
- ไม่มี mechanism ให้ tokens ถูก consume โดย frontend build

### ข้อเสนอแก้ไข
```
ทางเลือก:
A) ลบ _design-tokens.json — ใช้ Shadcn/Tailwind เป็น source of truth
B) Generate Tailwind config จาก _design-tokens.json → sync อัตโนมัติ
C) เปลี่ยน mockups ให้ reference Tailwind classes แทน custom tokens
```

---

## 8. Route Parameter Syntax ไม่ Consistent

### ปัญหา
Mockup files ใช้ 2 syntax สำหรับ dynamic routes:

| Syntax | Convention | Files ที่ใช้ |
|---|---|---|
| `:id` | REST/Express convention | 76 files (เกือบทั้งหมด) |
| `[id]` | Next.js App Router convention | 1 file (005-job-form_gemini) |

Frontend จริงใช้ Next.js `[id]` syntax

### ผลกระทบ
- `:id` ใน mockups ไม่ตรงกับ `[id]` ใน Next.js file structure
- Minor confusion สำหรับ developers

### สาเหตุ (skill issue)
- ui-mockup skill ไม่มี **framework-aware URL syntax**
- Default template ใช้ `:id` (generic) แทน `[id]` (Next.js specific)

### ข้อเสนอแก้ไข
```
1. อ่าน CLAUDE.md "Tech Stack" → ถ้า Next.js → ใช้ [id] syntax
2. Template variable: {{PARAM_SYNTAX}} → `:id` or `[id]` based on framework
3. Bulk update: sed -i 's/:id/[id]/g' .mockups/*.mockup.md
```

---

## 10. ข้อเสนอปรับปรุง Skill

### 10.1 Pre-Generation Validation

```
Before creating mockup:
1. Read CLAUDE.md → extract:
   - Frontend framework (Next.js → [id] syntax)
   - URL convention (flat vs nested)
   - UI libraries (Sonner, not SweetAlert2)
   - Component library (Shadcn/ui)
2. Read Design Doc → extract:
   - Entity properties for field mapping
   - Enums for select options
   - FK relationships for linked fields
3. Apply conventions to mockup template
```

### 10.2 Post-Generation Validation

```
After creating mockup:
1. Validate URLs match CLAUDE.md convention
2. Validate library references match CLAUDE.md
3. Validate field names map to entity properties
4. Update mockup_list.json
5. Suggest git add
```

### 10.3 Change Propagation

```
When CLAUDE.md changes (library, convention, URL):
1. Scan all mockups for affected references
2. Generate diff report: "N mockups reference old library"
3. Offer bulk update
```

### 10.4 Template Improvements

```
Add to mockup template:
- Field Mapping table (Thai label → Entity property)
- Framework-specific URL syntax
- Library reference from CLAUDE.md (not hardcoded)
- Version field in frontmatter
- "Last validated against code" timestamp
```

### 10.5 Mockup-Code Sync Check

```
Periodic validation:
1. Count mockup files vs app/(app)/ page directories
2. Check mockup URLs resolve to actual routes
3. Check mockup form fields match DTO properties
4. Report: "N mockups out of sync with code"
```

---

## Appendix: Affected Mockup Files by Issue

### SweetAlert2 References (ทุกไฟล์)
All 77 `.mockup.md` files contain `SweetAlert2` — needs bulk replace

### Wrong URL Prefix (19 files)
```
007-quotation-list.mockup.md      → /jobs/quotations → /quotations
008-quotation-form.mockup.md      → /jobs/quotations/new → /quotations/new
009-quotation-detail.mockup.md    → /jobs/quotations/:id → /quotations/[id]
012-route-pricing.mockup.md       → /jobs/route-pricing → /route-pricing
013-bill-list.mockup.md           → /financial/bills → /bills
014-bill-form.mockup.md           → /financial/bills/new → /bills/new
015-bill-detail.mockup.md         → /financial/bills/:id → /bills/[id]
016-receipt-list.mockup.md        → /financial/receipts → /receipts
017-receipt-form.mockup.md        → /financial/receipts/new → /receipts/new
018-receipt-detail.mockup.md      → /financial/receipts/:id → /receipts/[id]
019-ticket-list.mockup.md         → /financial/tickets → /tickets
020-ticket-form.mockup.md         → /financial/tickets/new → /tickets/new
021-ticket-detail.mockup.md       → /financial/tickets/:id → /tickets/[id]
022-credit-list.mockup.md         → /financial/credits → /credits
023-credit-form.mockup.md         → /financial/credits/new → /credits/new
024-revenue-list.mockup.md        → /financial/revenues → /revenues
025-revenue-form.mockup.md        → /financial/revenues/new → /revenues/new
026-loan-list.mockup.md           → /financial/loans → /loans
027-loan-form.mockup.md           → /financial/loans/new → /loans/new
```

### Untracked Phase 2 Files (13 files)
```
055-product-list.mockup.md
056-product-form.mockup.md
057-product-detail.mockup.md
058-inventory-list.mockup.md
059-inventory-form.mockup.md
060-stock-movement.mockup.md
071-profit-loss-report.mockup.md
072-job-reports.mockup.md
073-expense-reports.mockup.md
074-bill-reports.mockup.md
075-truck-reports.mockup.md
076-budget-cashflow-report.mockup.md
077-dashboard-reports.mockup.md
```
