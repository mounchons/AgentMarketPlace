---
description: Validate completeness and consistency of the system design document
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*)
---

# Validate Design Document Command

Validate the completeness, correctness, and consistency of the system design document.

## Input Received

```
/validate-design-doc
/validate-design-doc system-design-hr.md
/validate-design-doc --strict
/validate-design-doc $ARGUMENTS
```

## Steps to Follow

### Step 1: Identify the Document to Validate

**If no file is specified:**

```bash
# Search for system design documents
ls -la .design-docs/*.md 2>/dev/null
```

**Display a list for selection:**
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

### Step 2: Read the Document

```bash
# Layout-aware — check doc_layout in design_doc_list.json first
cat .design-docs/design_doc_list.json 2>/dev/null
# doc_layout:"split"  → read <doc_dir>/00-index.md + the section files you need (via sections[])
# doc_layout:"single" / absent → cat the single file:
cat .design-docs/system-design-[name].md 2>/dev/null
```

### Step 3: Validation Checks

---

## Validation Categories

### 1. Section Completeness Check

**Verify that all 10 sections are present:**

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

**Validate Mermaid syntax:**

| Diagram Type | Common Errors |
|--------------|---------------|
| ER Diagram | Missing PK/FK markers, invalid relationship syntax |
| Flow Diagram | Unclosed subgraphs, missing node definitions |
| Sequence Diagram | Invalid participant names, missing arrows |
| State Diagram | Missing transitions, invalid state names |

**Mermaid Syntax Checks:**
- Every `erDiagram` block has entity definitions
- Every `flowchart` block has valid node connections
- Every `sequenceDiagram` block has participant definitions
- No unclosed brackets or quotes

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

**Verify:**
- [ ] Every entity in ER Diagram exists in Data Dictionary
- [ ] Every table in Data Dictionary exists in ER Diagram
- [ ] Columns match
- [ ] FK relationships match

**Result:**
```
🔄 ER ↔ Data Dictionary Consistency:

   ✅ All 8 entities have corresponding tables
   ✅ All relationships match FK definitions

   ⚠️ Warnings:
      • Entity 'AuditLog' has 5 columns in ER, 7 in DD (extra: created_by, ip_address)
```

#### 3.2 Sitemap ↔ User Roles

**Verify:**
- [ ] Every page in Sitemap has an access rule
- [ ] No pages exist without a role that can access them

**Result:**
```
🔐 Sitemap ↔ Roles Consistency:

   ✅ All 15 pages have access rules defined
   ✅ No orphan pages found
```

#### 3.3 DFD Level 0 ↔ Level 1

**Verify:**
- [ ] System in Level 0 has processes in Level 1
- [ ] External entities match
- [ ] Data flows are consistent

**Result:**
```
📈 DFD Level Consistency:

   ✅ All Level 0 flows expanded in Level 1
   ✅ External entities match (Customer, Admin, Payment Gateway)
```

#### 3.4 Modules ↔ Other Sections

**Verify:**
- [ ] Modules in Overview appear in Flow Diagrams
- [ ] Modules have associated entities

**Result:**
```
📦 Module Consistency:

   ✅ All 5 modules have corresponding entities
   ✅ All modules appear in at least one flow diagram
```

#### 3.5 Section Numbering Validation (v1.5.0)

**Verify DD section numbers are sequential:**
- [ ] Section numbers (e.g., 8.1, 8.2, 8.3, ...) have no gaps
- [ ] No duplicate section numbers

```bash
# Extract DD section numbers (layout-aware)
# split  → resolve DD file via registry: <doc_dir>/08-data-dictionary.md
grep "^### 8\." .design-docs/<doc_dir>/08-data-dictionary.md | sed 's/.*### \(8\.[0-9]*\).*/\1/' | sort -t. -k2 -n
# single / no registry:
grep "^### 8\." .design-docs/system-design-*.md | sed 's/.*### \(8\.[0-9]*\).*/\1/' | sort -t. -k2 -n
```

**Result:**
```
🔢 Section Numbering:

   ✅ DD sections 8.1-8.56 are sequential, no gaps
   ❌ Gap found: 8.31 → 8.33 (section 8.32 missing)
```

#### 3.6 Table Count Validation (v1.5.0)

**Verify declared count matches actual:**
- [ ] Summary/intro claims correct number of tables
- [ ] Actual DD section count matches

```
📊 Table Count:

   Declared in summary: 57 tables
   Actual DD sections: 55
   ❌ Mismatch: declared 57 but only 55 sections found
```

#### 3.7 ER ↔ DD Bidirectional Check (v1.5.0)

**Verify BOTH directions:**
- [ ] Every entity in ER has a DD section (ER → DD)
- [ ] Every DD section appears in ER (DD → ER)

```
🔄 ER ↔ DD Bidirectional:

   ER → DD: 8 entities missing DD sections
     ❌ LEDGER_CATEGORY (ER 7.7) — no DD section
     ❌ LEDGER_ENTRY (ER 7.7) — no DD section
     ❌ BUDGET (ER 7.7) — no DD section
     ...

   DD → ER: 3 tables not in any ER diagram
     ❌ truck_equipments (DD 8.44) — not in ER
     ❌ truck_tires (DD 8.46) — not in ER
     ...
```

#### 3.8 DD ↔ DDL Sync (v1.5.0)

**If DDL files exist, verify sync:**
- [ ] Every CREATE TABLE has a DD section
- [ ] Every DD section has a CREATE TABLE

```bash
# Extract DDL tables
grep "CREATE TABLE" docs/*/ddl/*.sql | sed 's/.*CREATE TABLE \([a-z_]*\).*/\1/'
```

```
🔄 DD ↔ DDL Sync:

   DDL → DD: 5 tables in DDL without DD sections
     ❌ password_reset_tokens — DDL only
     ❌ refresh_tokens — DDL only
     ...

   DD → DDL: 7 tables in DD without DDL
     ❌ truck_equipments — DD only
     ...
```

#### 3.9 FK Column Type Consistency (v1.5.0)

**Verify FK types match PK types:**
- [ ] If ER shows `entity_id FK → other_table`, DD column type matches PK type
- [ ] If DD shows `VARCHAR` but ER shows FK, flag inconsistency

```
🔗 FK Type Consistency:

   ✅ 115/120 FKs have matching types
   ❌ products.unit_id: ER shows FK → UNIT table, but DD shows VARCHAR (redesigned)
   ❌ ...
```

#### 3.10 API ↔ DD Cross-Reference (v1.5.0)

**Verify API-referenced entities exist:**
- [ ] Every entity in API docs has a DD section
- [ ] Entity hierarchy diagrams match DD

```
📡 API ↔ DD:

   ✅ 12/12 API entities have DD sections
   ❌ amphurs: referenced in API (GET /api/v1/amphurs) but no DD section
```

---

### 4. Quality Checks

#### 4.1 Requirements Quality

**Verify FR/NFR:**
- [ ] Every FR has a unique ID (FR-001, FR-002, ...)
- [ ] Every FR has a priority (High, Medium, Low)
- [ ] NFR covers: Performance, Security, Availability

**Result:**
```
📝 Requirements Quality:

   ✅ 15 Functional Requirements with valid IDs
   ✅ All FRs have priority assigned
   ✅ NFR coverage: Performance ✅, Security ✅, Availability ✅, Scalability ✅
```

#### 4.2 Data Dictionary Quality

**Verify:**
- [ ] Every table has a PK
- [ ] Every FK has a reference
- [ ] Data types follow convention
- [ ] Indexes exist for FK and search columns

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

**Verify:**
- [ ] ER Diagram does not exceed 20 entities (recommend splitting by domain)
- [ ] Each Flow Diagram does not exceed 15 nodes
- [ ] Sequence Diagram does not exceed 10 participants

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

Validates basic completeness and consistency.

### Strict Mode (`--strict`)

Additional validations:
- Every entity must have audit columns (created_at, updated_at)
- Every table must have appropriate indexes
- Every API endpoint must have a Sequence Diagram
- Every business rule must appear in a Flow Diagram

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
   │ Consistency Checks      │ 10/10  │ ✅ Pass  │
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
   │ Consistency Checks      │ 8/10   │ ⚠️ Warn  │
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
   │ Consistency Checks      │ 4/10   │ ❌ Fail  │
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
| `references/document-sections.md` | Details of required sections |
| `references/troubleshooting.md` | Common problem solutions |
| `references/mermaid-patterns.md` | Correct Mermaid syntax |

---

## Sitemap Validation (R31-R35)

If `.design-docs/sitemap.json` exists, also run:

```bash
/sitemap-validate
```

Append result to combined report:

```
─────────────────────────────────────
sitemap.json (R31-R35):
  R31 (DS membership):       ✓ pass
  R32 (API mirror):          ✓ pass
  R33 (source_file):         ⚠ N stale
  R34 (orphan edge):         ✓ pass
  R35 (cross-doc artifact):  ✓ pass
─────────────────────────────────────
```

If sitemap.json is absent → skip with note `sitemap.json not present (run /sitemap-init to enable R31-R35)`.

---

## Split-Layout Validation (doc_layout:"split")

Determine layout from `design_doc_list.json` `documents[].doc_layout`. If `split`, additionally verify:

- **R36 — Naming & marker contract**: every file in `<doc_dir>/` matches `NN-<section-key>.md` (or `00-index.md`); line 1 marker `<!-- sdd-section: <key> | doc: <slug> | schema: 2.3.0 -->` agrees with the filename's key and the doc's slug.
- **R37 — Registry ↔ disk (bidirectional)**: every `sections[].file` exists on disk; every `NN-*.md` on disk appears in `sections[]`. Report orphans on either side.
- **R38 — Index completeness**: `00-index.md` links every section file (one Markdown link per `sections[]` entry).
- **ER ↔ DD across files**: read `07-er-diagram.md` + `08-data-dictionary.md`; every ER entity has a DD table and vice versa (bidirectional, as before — just across two files now).
- **Numbering continuity within a file**: in `08-data-dictionary.md`, the `### 8.x` headings are sequential with no gaps; same idea per numbered section.

```
Split Validation Report
───────────────────────────────────
doc_layout: split   doc_dir: <slug>
Section files on disk: N / 10
Registry entries: N   orphans(disk): […]  orphans(registry): […]
Index links: N / N
Marker mismatches: […]
ER↔DD: ok | mismatches […]
───────────────────────────────────
```

For `doc_layout:"single"` (or absent), run the existing whole-file validation unchanged.

> 💬 **Note**: This command responds in Thai (คำสั่งนี้จะตอบกลับเป็นภาษาไทย)
