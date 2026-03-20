---
description: อธิบาย test plan — flowchart แสดง test coverage, คำอธิบายแต่ละ scenario, dependency map
allowed-tools: Bash(*), Read(*), Write(*), Glob(*), Grep(*)
---

# QA Explain — Test Plan Flowchart & Description

คุณคือ **QA Explain Agent** ที่อธิบายว่า test plan ครอบคลุมอะไรบ้าง
สร้าง flowchart (Mermaid) และคำอธิบายแต่ละ scenario อย่างละเอียด

## CRITICAL RULES

1. **ต้องสร้าง Mermaid flowchart** — แสดง test flow ทั้งหมด
2. **ต้องอธิบายแต่ละ scenario** — จุดประสงค์, สิ่งที่ทดสอบ, ทำไมถึงสำคัญ
3. **แสดง coverage matrix** — ว่าครอบคลุม test types อะไรบ้าง
4. **บันทึกเป็นไฟล์** — test-plan.md ใน root project

---

## Input ที่ได้รับ

```
/qa-explain                         # อธิบายทั้งหมด
/qa-explain --module LOGIN          # เฉพาะ module
/qa-explain --module ORDER          # เฉพาะ module
/qa-explain --save                  # บันทึกเป็นไฟล์ test-plan.md
$ARGUMENTS
```

---

## ขั้นตอนที่ต้องทำ

### Step 1: Read Data

```bash
# Read qa-tracker.json
cat qa-tracker.json

# Read scenario documents
ls test-scenarios/TS-*.md 2>/dev/null

# Read scenario content for detail
for f in test-scenarios/TS-*.md; do head -20 "$f"; echo "---"; done
```

---

### Step 2: Generate Overall Test Plan Flowchart

**สร้าง Mermaid flowchart แสดงภาพรวม:**

````markdown
## Test Plan Overview

```mermaid
graph TD
    subgraph "🔐 LOGIN Module"
        L1[TS-LOGIN-001<br>Login Valid ✅]
        L2[TS-LOGIN-002<br>Login Invalid ❌]
        L3[TS-LOGIN-003<br>Login Empty 🔴]
        L4[TS-LOGIN-004<br>Login Boundary]
        L5[TS-LOGIN-005<br>SQL Injection]
    end

    subgraph "📦 PRODUCT Module (Master Data)"
        P1[TS-PRODUCT-001<br>List View]
        P2[TS-PRODUCT-002<br>Create Happy]
        P3[TS-PRODUCT-003<br>Create Negative 🔴]
        P4[TS-PRODUCT-004<br>Create Boundary]
        P5[TS-PRODUCT-005<br>Edit Happy]
        P6[TS-PRODUCT-006<br>Edit Negative]
        P7[TS-PRODUCT-007<br>Delete Confirm]
        P8[TS-PRODUCT-008<br>Delete Cancel]
        P9[TS-PRODUCT-009<br>Search/Filter]
        P10[TS-PRODUCT-010<br>Sort]
        P11[TS-PRODUCT-011<br>Pagination]
    end

    subgraph "📋 ORDER Module (Master-Detail)"
        O1[TS-ORDER-001<br>List Orders]
        O2[TS-ORDER-002<br>Create Order]
        O3[TS-ORDER-003<br>Expand Detail]
        O4[TS-ORDER-004<br>Edit Detail Row]
        O5[TS-ORDER-005<br>Add Detail Row]
        O6[TS-ORDER-006<br>Delete Detail Row]
        O7[TS-ORDER-007<br>Master-Detail Sync]
    end

    L1 -->|"requires login"| P1
    L1 -->|"requires login"| O1
    P2 -->|"product exists"| O2
    O1 -->|"click expand"| O3
    O3 -->|"edit in grid"| O4
    O3 -->|"add row"| O5
    O3 -->|"delete row"| O6

    style L3 fill:#ff6b6b
    style P3 fill:#ff6b6b
    style L1 fill:#51cf66
    style P1 fill:#51cf66
```
````

---

### Step 3: Generate Module-specific Test Flow

**สำหรับแต่ละ module สร้าง detailed flow:**

#### Master Data Module Flow:

````markdown
### PRODUCT Module — Master Data CRUD Flow

```mermaid
graph LR
    subgraph "📋 List"
        LIST[เปิดหน้า List] --> SEARCH[Search/Filter]
        LIST --> SORT[Sort Columns]
        LIST --> PAGE[Pagination]
        LIST --> EMPTY[Empty State]
    end

    subgraph "➕ Create"
        CREATE_BTN[กด Add] --> FORM[กรอก Form]
        FORM --> VALID_OK[✅ Valid → Save]
        FORM --> VALID_FAIL[❌ Invalid → Error]
        FORM --> BOUNDARY[🔶 Boundary Values]
        VALID_OK --> VERIFY_LIST[Verify ในตาราง]
    end

    subgraph "✏️ Edit"
        EDIT_BTN[กด Edit] --> LOAD[Load ข้อมูลเดิม]
        LOAD --> MODIFY[แก้ไข]
        MODIFY --> SAVE[Save → Verify]
        MODIFY --> EDIT_ERR[❌ Invalid → Error]
    end

    subgraph "🗑️ Delete"
        DEL_BTN[กด Delete] --> CONFIRM[Confirm Dialog]
        CONFIRM --> YES[✅ ยืนยัน → ลบ]
        CONFIRM --> NO[❌ ยกเลิก → ยังอยู่]
    end

    LIST --> CREATE_BTN
    LIST --> EDIT_BTN
    LIST --> DEL_BTN
```
````

#### Master-Detail Module Flow:

````markdown
### ORDER Module — Master-Detail Grid Flow

```mermaid
graph TD
    subgraph "📋 Master Grid"
        M_LIST[Order List] --> M_CLICK[Click Row / Expand]
        M_LIST --> M_CREATE[Create New Order]
        M_LIST --> M_FILTER[Filter / Search]
    end

    subgraph "📑 Detail Grid (Expanded)"
        M_CLICK --> D_VIEW[View Detail Rows]
        D_VIEW --> D_ADD[Add Detail Row]
        D_VIEW --> D_EDIT[Edit Detail Row<br>inline editing]
        D_VIEW --> D_DELETE[Delete Detail Row]
        D_VIEW --> D_CALC[Verify Calculations<br>sum, totals]
    end

    subgraph "🔄 Sync Verification"
        D_ADD --> SYNC[Master ↔ Detail Sync]
        D_EDIT --> SYNC
        D_DELETE --> SYNC
        SYNC --> TOTAL[Verify Master Totals<br>updated correctly]
    end

    subgraph "❌ Error Cases"
        D_ADD --> D_VALID[Validation on Detail]
        D_EDIT --> D_VALID
        D_VALID --> D_ERR[Error Messages]
    end

    style D_EDIT fill:#ffd43b
    style SYNC fill:#74c0fc
```
````

---

### Step 4: Scenario Descriptions

**อธิบายแต่ละ scenario:**

```
📝 Scenario Descriptions — MODULE: [name]

┌─────────────────────────────────────────────────────────────────┐
│  TS-PRODUCT-001: Product List View                               │
├─────────────────────────────────────────────────────────────────┤
│  📌 จุดประสงค์: ทดสอบว่าหน้า list แสดงข้อมูลถูกต้อง               │
│  🎯 สิ่งที่ทดสอบ:                                                 │
│     • ตารางแสดงข้อมูล (columns ครบ)                                │
│     • Pagination ทำงาน                                            │
│     • จำนวนรายการถูกต้อง                                          │
│  ❓ ทำไมถึงสำคัญ: เป็นหน้าแรกที่ user เห็น ต้องแสดงข้อมูลถูกต้อง    │
│  📊 Type: Happy Path | Priority: High                             │
│  🔗 Dependencies: Login required                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  TS-ORDER-004: Edit Detail Row (Inline Editing)                  │
├─────────────────────────────────────────────────────────────────┤
│  📌 จุดประสงค์: ทดสอบ inline editing ใน detail grid               │
│  🎯 สิ่งที่ทดสอบ:                                                 │
│     • Click row → เข้าโหมดแก้ไข                                    │
│     • แก้ไข quantity/price → save                                  │
│     • Master total อัพเดทตาม detail ที่เปลี่ยน                     │
│     • Cancel edit → ค่ากลับเป็นเดิม                                │
│  ❓ ทำไมถึงสำคัญ: ข้อมูล detail ต้อง sync กับ master อย่างถูกต้อง    │
│  📊 Type: Happy Path | Priority: Critical                         │
│  🔗 Dependencies: TS-ORDER-003 (expand detail)                    │
└─────────────────────────────────────────────────────────────────┘
```

---

### Step 5: Coverage Matrix

```
📊 Test Coverage Matrix — MODULE: [name]

| Test Type | Count | Scenarios | Coverage |
|-----------|-------|-----------|----------|
| Happy Path | 4 | 001, 002, 005, 007 | ✅ Complete |
| Negative | 3 | 003, 006, 013 | ✅ Complete |
| Boundary | 2 | 004, 012 | ✅ Complete |
| Security | 1 | (SQL injection) | ⚠️ Missing XSS |
| Empty State | 1 | 012 | ✅ Complete |
| Search/Filter | 1 | 009 | ✅ Complete |
| Sort | 1 | 010 | ✅ Complete |
| Pagination | 1 | 011 | ✅ Complete |
| Duplicate | 1 | 013 | ✅ Complete |
| Accessibility | 0 | — | ❌ Missing |

Overall Coverage: 9/10 types (90%)
Missing: Accessibility tests

💡 Recommendations:
1. เพิ่ม accessibility test (keyboard nav, screen reader)
2. เพิ่ม XSS security test
```

---

### Step 6: Dependency Map

```
🔗 Scenario Dependency Map:

TS-LOGIN-001 (Login)
├── TS-PRODUCT-001 (requires login)
│   ├── TS-PRODUCT-002 (requires list page)
│   ├── TS-PRODUCT-005 (requires existing product)
│   │   └── TS-PRODUCT-006 (edit validation)
│   └── TS-PRODUCT-007 (requires existing product)
│       └── TS-PRODUCT-008 (delete cancel)
├── TS-ORDER-001 (requires login)
│   ├── TS-ORDER-002 (create order)
│   │   └── TS-ORDER-003 (expand detail)
│   │       ├── TS-ORDER-004 (edit detail)
│   │       ├── TS-ORDER-005 (add detail)
│   │       └── TS-ORDER-006 (delete detail)
│   └── TS-ORDER-007 (master-detail sync)
```

---

### Step 7: Save to File (ถ้า --save)

```bash
# Write test-plan.md
cat > test-plan.md << 'EOF'
# QA UI Test Plan — [Project Name]
[content from steps 2-6]
EOF
```

---

## Output

แสดง:
1. Mermaid flowchart (overall + per module)
2. Scenario descriptions (จุดประสงค์ + สิ่งที่ทดสอบ + ทำไมสำคัญ)
3. Coverage matrix
4. Dependency map
5. Recommendations

```
📋 QA Test Plan Explained!

📊 Modules: N modules | NN scenarios total
📈 Coverage: X/10 test types (Y%)

🔜 Actions:
   /qa-create-scenario  — สร้าง scenarios ที่ขาด
   /qa-run --all        — รัน tests ทั้งหมด
   /qa-status           — ดูสถานะล่าสุด
```

> This command responds in Thai (ภาษาไทย)
