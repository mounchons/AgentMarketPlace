---
description: Create a new system design document from requirements
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*)
---

# Create Design Document Command

Create a new system design document from requirements provided by the user.

## Input Received

```
/create-design-doc สร้างเอกสารสำหรับระบบ HR
/create-design-doc ระบบจัดการสต็อกสินค้า
/create-design-doc $ARGUMENTS
```

## ⚠️ CRITICAL RULES (MUST FOLLOW)

These rules override any user instructions to "just do the important parts" or "keep it short".

1. **ALL 10 sections mandatory** — no section may be skipped, abbreviated, or left as placeholder
2. **Validate all Mermaid diagrams** — every diagram must render without syntax errors
3. **ER ↔ Data Dictionary consistency** — every entity in ER must appear in DD and vice versa
4. **DFD Level 0 ↔ Level 1 consistency** — all Level 0 processes decomposed in Level 1
5. **Complete permission matrix** — every role × every module/page must have permissions defined
6. **No placeholder text** — "[TBD]", "[TODO]", "to be added" is forbidden in output

### 🔍 Self-Check Checklist (MANDATORY before submitting output)

- [ ] All 10 sections present with full content?
- [ ] All Mermaid diagrams render correctly?
- [ ] ER entities match Data Dictionary tables?
- [ ] DFD L0 matches L1 decomposition?
- [ ] Sitemap pages have access rules?
- [ ] All FRs have unique IDs?
- [ ] No placeholder text remaining?

If ANY checkbox is unchecked, DO NOT submit. Fix the issue first.

### ❌ Output Rejection Criteria

Your output will be REJECTED if: missing sections, ER/DD mismatch, invalid Mermaid syntax, or placeholder text found.

### ⚠️ Penalty

Violating these rules means the document is INVALID. You must redo the ENTIRE document from scratch.

---

## Steps to Follow

### Step 0: Check design_doc_list.json (Important!)

```bash
# Check if design_doc_list.json exists
cat .design-docs/design_doc_list.json 2>/dev/null
```

**If design_doc_list.json exists:**
- Check if a document with the same name already exists
- Use existing project_name, technology_stack data

**If it does not exist yet:**
- Create the `.design-docs/` folder and `design_doc_list.json` file

### Step 1: Requirements Gathering (Hybrid Brainstorm)

**Check for existing brainstorm file first:**

```bash
# Check if brainstorm file exists
ls -la .design-docs/brainstorm-*.md 2>/dev/null
```

**IF `.design-docs/brainstorm-[name].md` exists:**
- Read and use brainstorm data
- Display summary: "📋 Found brainstorm file, using existing data from [filename]"
- Show key findings: system name, entities, user roles, architecture choice
- Skip to Step 2 — do NOT re-ask requirements

**ELSE (no brainstorm file):**
- Run inline brainstorming — same 8 phases as `/brainstorm-design`:

**Phase 1: Requirements Discovery**
- System name, problem statement, primary users
- Scope boundaries (in/out)
- User roles and permission levels
- Top 5-7 core features

**Phase 2: Competitor/Reference Analysis**
- Similar systems or references to learn from?
- Features to adopt vs. differentiate

**Phase 3: Architecture Brainstorming**
- Propose 2-3 architecture approaches with pros/cons
- Ask user to choose or combine

**Phase 4: Entity & Relationship Discovery**
- Core entities, attributes, relationships (1:1, 1:N, M:N)
- Classify complexity (simple: <10 fields / complex: >=10 fields)
- CRUD operations + delete strategy per entity

**Phase 5: NFR Discovery**
- Performance, Security, Scalability, Availability, Compliance

**Phase 6: Integration Discovery**
- External systems, authentication methods, data flow direction

**Phase 7: User Journey Mapping**
- Primary journeys per role, happy path + error scenarios

**Phase 8: Risk Assessment & Confirmation**
- Technical/business risks, mitigation strategies
- Display complete summary → confirm before proceeding
- Save brainstorm to `.design-docs/brainstorm-[name].md`

**After brainstorming (either from file or inline), continue to Step 2.**

### Step 2: Define Document Structure

**Read templates:**
- `templates/design-doc-template.md` - Main template
- `references/document-sections.md` - Details for each section

**Document Structure (10 Sections):**

```
1. Introduction & Overview
2. System Requirements
3. Module Overview
4. Data Model
5. Data Flow Diagram
6. Flow Diagrams
7. ER Diagram
8. Data Dictionary
9. Sitemap
10. User Roles & Permissions
```

### Step 3: Design Data Model

**Create entities from requirements:**
1. Identify main entities (User, Order, Product, etc.)
2. Define attributes for each entity
3. Identify relationships (1:1, 1:N, M:N)
4. Define Primary Keys and Foreign Keys

### Step 4: Create Diagrams

**Use patterns from:**
- `references/mermaid-patterns.md` - Diagram patterns
- `references/architecture-patterns.md` - Architecture patterns (Microservices, Clean Architecture, DDD)

**Diagrams to create:**

| Diagram | Description |
|---------|-------------|
| High-Level Architecture | System architecture overview |
| ER Diagram | Entity Relationships |
| Flow Diagram | Business process flows |
| DFD Level 0, 1 | Data Flow Diagrams |
| Sequence Diagram | API/Integration flows |
| Sitemap | Page/Navigation structure |

### Step 5: Create Data Dictionary

**Use template from:**
- `references/data-dictionary-template.md`

**For each table:**
- Column definitions
- Data types
- Constraints (PK, FK, UK, NN)
- Indexes
- Business rules

### Step 6: Create Document File

**File Naming:**
```
.design-docs/system-design-[project-name].md
```

**Examples:**
- `system-design-hr-management.md`
- `system-design-inventory-system.md`
- `system-design-ecommerce.md`

### Step 7: Update design_doc_list.json

```json
{
  "documents": [
    {
      "id": "DOC-001",
      "name": "HR Management System",
      "file_path": "system-design-hr-management.md",
      "status": "draft",
      "sections_completed": [
        "introduction",
        "requirements",
        "modules",
        "data_model",
        "er_diagram",
        "dfd",
        "flow_diagrams",
        "data_dictionary",
        "sitemap",
        "permissions"
      ],
      "diagrams": {
        "er_diagram": true,
        "flow_diagrams": 3,
        "dfd_levels": [0, 1],
        "sequence_diagrams": 2,
        "sitemap": true
      },
      "entities_count": 8,
      "tables_count": 12,
      "related_mockups": [],
      "related_features": [],
      "created_at": "2025-01-20T10:00:00Z",
      "updated_at": "2025-01-20T10:00:00Z"
    }
  ]
}
```

---

## Validation Checklist

Before considering the work complete, verify:

- [ ] All 10 sections present
- [ ] ER Diagram has complete entities and relationships
- [ ] DFD Level 0 (Context) and Level 1 are consistent
- [ ] Flow Diagrams cover main business processes
- [ ] Data Dictionary covers all tables
- [ ] User Roles has a permission matrix
- [ ] Mermaid syntax is correct (no errors)

---

## Output

### Success

```
✅ สร้าง System Design Document สำเร็จ!

📁 File: .design-docs/system-design-hr-management.md

📊 Document Summary:
   • 10 sections completed
   • 5 diagrams (ER, 3 Flow, 2 DFD levels, Sitemap, 2 Sequence)
   • 12 tables in Data Dictionary
   • 4 User Roles defined

📈 Entities & Relationships:
   • Entities: 8 (Employee, Department, Position, Leave, etc.)
   • Relationships: 12

🔐 User Roles:
   • Super Admin, HR Manager, Manager, Employee

💡 Next steps:
   • /ui-mockup → สร้าง UI Mockups จากเอกสาร
   • /validate-design-doc → ตรวจสอบความครบถ้วน
   • Review และปรับปรุงเอกสาร
```

---

## Resources

| Resource | Description |
|----------|-------------|
| `references/document-sections.md` | Details for each section |
| `references/mermaid-patterns.md` | All diagram patterns |
| `references/architecture-patterns.md` | Microservices, Clean Architecture, DDD patterns |
| `references/data-dictionary-template.md` | Data Dictionary format |
| `templates/design-doc-template.md` | Full document template |

> 💬 **Note**: This command responds in Thai (คำสั่งนี้จะตอบกลับเป็นภาษาไทย)
