# `/import-plan` Command — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a `/import-plan` command in the system-design-doc plugin that imports free-form implementation plans and design docs into standardized 10-section design documents with `design_doc_list.json`.

**Architecture:** Single command file (`commands/import-plan.md`) that instructs Claude to analyze input, show gap report, then generate structured output. No code — the command is a prompt template that guides Claude's behavior (same pattern as existing commands like `create-design-doc.md` and `reverse-engineer.md`).

**Tech Stack:** Markdown command definition + JSON schema (design_doc_list.json template)

**Design Doc:** `docs/plans/2026-03-08-import-plan-design.md`

---

## Task Overview (Build Order)

```
Task 1: Register command in plugin.json
Task 2: Create import-plan.md command file
Task 3: Verify with dry-run test
```

**Dependencies:**
```
Task 1 → Task 2 → Task 3
```

---

## Task 1: Register command in plugin.json

**Goal:** Add the `/import-plan` command entry to the system-design-doc plugin manifest.

**Files:**
- Modify: `plugins/system-design-doc/.claude-plugin/plugin.json`

**Step 1: Read current plugin.json**

Verify current structure:

```json
{
  "name": "system-design-doc",
  "version": "1.2.0",
  "description": "สร้างเอกสารออกแบบระบบมาตรฐาน ...",
  "author": {
    "name": "Mounchons"
  }
}
```

**Step 2: Add commands array and bump version**

Update `plugins/system-design-doc/.claude-plugin/plugin.json` to:

```json
{
  "name": "system-design-doc",
  "version": "1.3.0",
  "description": "สร้างเอกสารออกแบบระบบมาตรฐาน รองรับ Reverse Engineering จาก codebase, Import จาก implementation plan พร้อม Mermaid diagrams, Architecture patterns (Microservices, Event-driven, Clean Architecture, DDD)",
  "author": {
    "name": "Mounchons"
  }
}
```

Note: Commands are auto-discovered from the `commands/` folder by Claude Code plugin system — no explicit registration needed in plugin.json. The version bump and description update signal that the plugin has new functionality.

**Step 3: Commit**

```bash
git add plugins/system-design-doc/.claude-plugin/plugin.json
git commit -m "chore(system-design-doc): bump version to 1.3.0 for /import-plan command"
```

---

## Task 2: Create import-plan.md command file

**Goal:** Create the command definition file that instructs Claude how to handle `/import-plan` invocations.

**Files:**
- Create: `plugins/system-design-doc/commands/import-plan.md`

**Step 1: Create the command file**

Create `plugins/system-design-doc/commands/import-plan.md` with the following content.

The file follows the same pattern as existing commands (`create-design-doc.md`, `reverse-engineer.md`):
- YAML frontmatter with `description` and `allowed-tools`
- Step-by-step instructions for Claude
- Input/output specifications
- Reference to templates and patterns

```markdown
---
description: Import implementation plan หรือ free-form design doc เข้าเป็นเอกสารออกแบบระบบมาตรฐาน
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*)
---

# Import Plan Command

แปลง implementation plan หรือ free-form design doc เข้าเป็นเอกสารออกแบบระบบมาตรฐาน 10 sections + design_doc_list.json

## Input ที่ได้รับ

``
/import-plan docs/example/2026-03-08-thai-esg-hub-design.md
/import-plan docs/plans/my-project-plan.md
/import-plan $ARGUMENTS
``

## ขั้นตอนที่ต้องทำ

### Step 0: Validate Input

``bash
# ตรวจสอบว่าไฟล์มีอยู่จริง
FILE_PATH="$ARGUMENTS"
cat "$FILE_PATH" > /dev/null 2>&1 || echo "ERROR: File not found"
``

**ถ้าไม่พบไฟล์:**
``
❌ File not found: [path]

กรุณาระบุ path ที่ถูกต้อง เช่น:
  /import-plan docs/plans/my-plan.md
``

### Step 1: Detect Input Type

**อ่านไฟล์ทั้งหมดแล้ววิเคราะห์:**

``bash
cat "$FILE_PATH"
``

**Detection Rules:**

| Pattern ที่พบ | Type |
|---------------|------|
| `Task \d+:` หรือ `## Task \d+` + dependency chains + bash code blocks | **Implementation Plan** |
| `erDiagram` block, `## Database`, `## Architecture`, entity definitions | **Free-form Design Doc** |
| ทั้งสอง pattern | **Mixed** — ใช้ Free-form Design Doc mode |
| ไม่พบ pattern ใดเลย | **ถาม user** |

**ถ้า detect ไม่ได้:**
``
ไม่สามารถระบุประเภทไฟล์ได้อัตโนมัติ — ไฟล์นี้เป็น:
(A) Implementation Plan (Task-based — มี Task list, bash commands, dependency chain)
(B) Design Document (free-form — มี ER Diagram, architecture, user flows)
``

### Step 2: Extract Data

**อ่าน templates ที่ต้องใช้:**

``bash
# อ่าน template design doc
cat "$(dirname "$0")/../skills/system-design-doc/templates/design-doc-template.md" 2>/dev/null

# อ่าน mermaid patterns
cat "$(dirname "$0")/../skills/system-design-doc/references/mermaid-patterns.md" 2>/dev/null

# อ่าน document sections reference
cat "$(dirname "$0")/../skills/system-design-doc/references/document-sections.md" 2>/dev/null
``

**สกัดข้อมูลจาก input ตาม type:**

#### จาก Implementation Plan (Task-based):

| สิ่งที่ Extract | Source Pattern | Target Section |
|----------------|---------------|----------------|
| Project name, goal, architecture | `**Goal:**`, `**Architecture:**` | 1. Introduction |
| Tech stack | `**Tech Stack:**` line | 1. Technology Stack table |
| Architecture style | `**Architecture:**` line | 1. High-Level Architecture |
| Task groupings by module | Task names ที่มี module ซ้ำกัน | 3. Module Overview |
| File paths | `- Create: path/to/file` | 3. Module Overview (project structure) |
| NuGet/npm packages | `dotnet add package`, `npm install` | 1. Technology Stack |
| Task dependencies | Dependency chain (`Task 1 → Task 2`) | 6. Flow Diagrams (build order) |
| Referenced design docs | `**Design Doc:**` line | อ่านเพิ่มเติมจาก referenced file |

**สำคัญ:** ถ้า implementation plan มี `**Design Doc:**` ที่ชี้ไปยังไฟล์อื่น → อ่านไฟล์นั้นด้วยเพื่อดึง entities, flows, pages

**ไม่ extract:** bash commands, code snippets, step-by-step instructions (เป็น implementation detail)

#### จาก Free-form Design Doc:

| สิ่งที่ Extract | Source Pattern | Target Section |
|----------------|---------------|----------------|
| Entities + fields | Mermaid `erDiagram` block | 4. Data Model, 7. ER Diagram, 8. Data Dictionary |
| Relationships | `\|\|--o{` patterns ใน erDiagram | 7. ER Diagram |
| User flows | Numbered step lists (1. xxx 2. xxx) | 6. Flow Diagrams |
| Page breakdown | Tables ที่มี column "หน้า"/"Page" | 9. Sitemap |
| Roles | คำว่า role, admin, manager, user ใน context | 10. User Roles & Permissions |
| Architecture | ASCII art diagrams, module structure | 1. High-Level Architecture |
| API patterns | `GET /api/...`, `POST /api/...` | Sequence Diagrams |
| Security/auth strategy | JWT, RLS, tenant, auth sections | 2. Requirements (NFR) |
| Phase roadmap | Phase A/B/C sections | 2. Requirements (Scope) |
| Index/query patterns | SQL statements, index definitions | 8. Data Dictionary |

### Step 3: Check Existing Design Docs

``bash
# ตรวจสอบว่ามี .design-docs/ folder หรือไม่
ls -la .design-docs/ 2>/dev/null
cat .design-docs/design_doc_list.json 2>/dev/null
``

**ถ้ามี design doc อยู่แล้ว:**
``
พบเอกสารที่มีอยู่แล้ว:
  📁 .design-docs/system-design-[name].md

ต้องการ:
(A) Reformat ทับเอกสารที่มีอยู่ (สร้างทุก section ใหม่)
(B) สร้างเป็นเอกสารใหม่แยก
``

**ถ้ายังไม่มี:**
- สร้าง `.design-docs/` folder

### Step 4: Show Gap Report

**แสดง gap report ให้ user ดูก่อน generate:**

``
📊 Analysis Report: [filename]
──────────────────────────────────────────

Type detected: [Implementation Plan | Free-form Design Document]

✅ Found (จะ reformat เป็นมาตรฐาน):
   • Entities: [n] ([entity names...])
   • Relationships: [n]
   • User Flows: [n] ([flow names...])
   • Pages: [n] (from Page Breakdown)
   • Tech Stack: [technologies]
   • Architecture: [pattern]
   • Roles: [role names]

⚠️ Inferred (จะสร้างจาก context):
   • [sections ที่สร้างได้จาก data ที่มี เช่น:]
   • Data Dictionary — จะ generate จาก ER Diagram fields
   • DFD — จะ generate จาก architecture + modules
   • Sequence Diagrams — จะ generate จาก API patterns
   • Permission Matrix — จะ infer จาก roles + pages

❌ Missing (จะ generate แบบ minimal):
   • [sections ที่ data ไม่เพียงพอ เช่น:]
   • Non-functional requirements
   • Business rules

ต้องการเสริมข้อมูลก่อน generate หรือ proceed เลย?
``

**User สามารถ:**
1. Proceed → generate ด้วยข้อมูลที่มี
2. เสริมข้อมูล → user พิมพ์ข้อมูลเพิ่ม แล้ว re-analyze

### Step 5: Generate Design Document

**สร้าง `.design-docs/system-design-[project-name].md`**

**ใช้ template จาก:**
- `templates/design-doc-template.md` — โครงสร้าง 10 sections
- `references/mermaid-patterns.md` — Mermaid diagram syntax
- `references/document-sections.md` — เนื้อหาที่ต้องมีในแต่ละ section
- `references/architecture-patterns.md` — Architecture diagram patterns

**กฎการสร้าง:**

1. **สร้างทุก section ใหม่** — แม้ source มี ER Diagram ดีอยู่แล้ว ก็ reformat ใหม่ให้ตรง template
2. ใช้ Mermaid syntax ตาม `references/mermaid-patterns.md` เท่านั้น
3. Data Dictionary สร้างจาก entity fields — ระบุ Data Type, Constraints, Default, Description
4. Sitemap สร้างเป็น Mermaid `flowchart TD`
5. Permission Matrix สร้างเป็นตาราง role × permission
6. DFD สร้าง Level 0 (Context) และ Level 1

**Section Mapping:**

| Section | Source Data | Generation Strategy |
|---------|-----------|---------------------|
| 1. Introduction & Overview | project name, goal, tech stack, architecture | Reformat metadata เป็น tables + Mermaid architecture diagram |
| 2. System Requirements | scope, phases, security strategy | สร้าง FR/NFR tables จาก features + constraints |
| 3. Module Overview | task groupings, file structure | สร้าง module table + dependency diagram |
| 4. Data Model | erDiagram entities | สร้าง Mermaid classDiagram |
| 5. Data Flow Diagram | architecture + modules | สร้าง DFD Level 0, Level 1 |
| 6. Flow Diagrams | user flows, task dependencies | สร้าง Mermaid flowchart จากแต่ละ flow |
| 7. ER Diagram | erDiagram entities + relationships | Reformat เป็น Mermaid erDiagram ตาม patterns |
| 8. Data Dictionary | entity fields + types | สร้างตาราง per-entity (Column, Type, Constraints, Default, Description) |
| 9. Sitemap | page breakdown | สร้าง Mermaid flowchart TD |
| 10. User Roles & Permissions | roles, pages | สร้าง role table + permission matrix |

### Step 6: Generate design_doc_list.json

**ใช้ schema จาก `templates/design_doc_list.json` (v2.0.0)**

**สร้าง/merge `.design-docs/design_doc_list.json`:**

``json
{
  "schema_version": "2.0.0",
  "project_name": "[extracted project name]",
  "description": "[extracted description/goal]",
  "technology_stack": {
    "backend": "[extracted]",
    "frontend": "[extracted]",
    "database": "[extracted]",
    "cache": "[extracted]"
  },
  "created_at": "[ISO timestamp]",
  "updated_at": "[ISO timestamp]",

  "integration": {
    "mockup_list_path": ".mockups/mockup_list.json",
    "feature_list_path": "feature_list.json",
    "last_synced_with_mockups": null,
    "last_synced_with_features": null,
    "auto_sync_enabled": false
  },

  "entities": [
    {
      "id": "ENT-001",
      "name": "[entity_name]",
      "name_th": "[Thai name if available]",
      "table_name": "[table_name from ER]",
      "description": "[extracted description]",
      "crud_operations": {
        "create": { "api": "API-xxx", "feature_id": null, "page": null },
        "read": { "api": "API-xxx", "feature_id": null, "page": null },
        "update": { "api": "API-xxx", "feature_id": null, "page": null },
        "delete": { "api": "API-xxx", "feature_id": null, "page": null },
        "list": { "api": "API-xxx", "feature_id": null, "page": null }
      },
      "relationships": [
        { "target": "ENT-xxx", "type": "1:N", "description": "" }
      ],
      "attributes": ["field1", "field2"],
      "status": "draft"
    }
  ],

  "api_endpoints": [
    {
      "id": "API-001",
      "method": "GET",
      "path": "/api/[resource]",
      "description": "List [entities]",
      "entity_ref": "ENT-001",
      "auth_required": true,
      "status": "draft"
    }
  ],

  "documents": [
    {
      "id": "DOC-001",
      "name": "[Project Name] System Design",
      "file_path": "system-design-[project-name].md",
      "source": "imported",
      "source_file": "[original input file path]",
      "status": "draft",
      "sections_completed": [
        "introduction", "requirements", "modules",
        "data_model", "dfd", "flow_diagrams",
        "er_diagram", "data_dictionary", "sitemap", "permissions"
      ],
      "statistics": {
        "entities_count": 0,
        "tables_count": 0,
        "relationships_count": 0,
        "api_endpoints_count": 0,
        "pages_count": 0,
        "user_roles_count": 0
      },
      "created_at": "[ISO timestamp]",
      "updated_at": "[ISO timestamp]"
    }
  ],

  "user_roles": [
    {
      "id": "ROLE-001",
      "name": "[role_name]",
      "description": "[role description]",
      "permissions": [],
      "accessible_pages": [],
      "accessible_apis": []
    }
  ],

  "summary": {
    "total_documents": 1,
    "draft": 1,
    "total_entities": 0,
    "total_api_endpoints": 0,
    "total_diagrams": 0
  }
}
``

**Fields ใหม่ที่เพิ่มเฉพาะ imported documents:**
- `documents[].source: "imported"` — ระบุว่าสร้างจาก import (ไม่ใช่ create หรือ reverse-engineer)
- `documents[].source_file` — path ของ original file ที่ import มา

**Merge logic (ถ้ามี design_doc_list.json อยู่แล้ว):**
- เพิ่ม document entry ใหม่ (ไม่ทับ entries เดิม)
- Merge entities (ตรวจ duplicate โดยชื่อ)
- Merge api_endpoints (ตรวจ duplicate โดย method+path)
- Merge user_roles (ตรวจ duplicate โดย name)
- Update summary counts

### Step 7: Validate & Output

**ตรวจสอบ consistency:**
- [ ] ER Diagram entities ตรงกับ Data Dictionary tables
- [ ] Sitemap pages ครบตาม page breakdown
- [ ] Permission Matrix มี role ครบ
- [ ] Mermaid syntax ถูกต้อง

**แสดงผล:**

``
✅ Import Plan สำเร็จ!

📥 Source: [source_file_path]
   Type: [Implementation Plan | Free-form Design Document]

📁 Output:
   • .design-docs/system-design-[name].md (10 sections)
   • .design-docs/design_doc_list.json ([n] entities, [n] APIs)

📊 Sections Generated:
   • [n] sections reformat จาก source
   • [n] sections generated ใหม่

⚠️ Review Recommended:
   • [sections with inferred data]

💡 Next steps:
   • /validate-design-doc → ตรวจสอบความครบถ้วน
   • /edit-section [section] → แก้ไขส่วนที่ต้องปรับ
   • /init-agent → สร้าง feature_list.json จาก design doc
``

---

## กฎสำคัญ

❌ **ห้าม:**
- สร้าง code จริง (source files, tests)
- สร้าง feature_list.json (เป็นหน้าที่ของ long-running-agent)
- แก้ไขไฟล์ original input (อ่านอย่างเดียว)
- เปลี่ยน format ของ implementation plan

✅ **ต้องทำ:**
- สร้าง/เสริมครบ 10 sections
- Reformat ทุก section ใหม่ตาม template (ไม่ copy ตรงๆ)
- สร้าง/merge design_doc_list.json
- แสดง gap report ก่อน generate
- Git commit output files

---

## Resources

| Resource | Description |
|----------|-------------|
| `references/document-sections.md` | รายละเอียดแต่ละ section |
| `references/mermaid-patterns.md` | รูปแบบ diagrams ทั้งหมด |
| `references/architecture-patterns.md` | Architecture patterns |
| `templates/design-doc-template.md` | Template เอกสารฉบับเต็ม |
| `templates/design_doc_list.json` | Schema v2.0.0 |
```

Note: In the actual file, all triple-backtick code fences must use proper triple backticks. The double-backticks shown above are for escaping within this plan document only.

**Step 2: Commit**

```bash
git add plugins/system-design-doc/commands/import-plan.md
git commit -m "feat(system-design-doc): add /import-plan command"
```

---

## Task 3: Verify with dry-run test

**Goal:** Verify the command is discoverable and the file structure is correct.

**Step 1: Verify file exists and frontmatter is valid**

```bash
# Check file exists
ls -la plugins/system-design-doc/commands/import-plan.md

# Check frontmatter
head -5 plugins/system-design-doc/commands/import-plan.md
```

Expected output:
```
---
description: Import implementation plan หรือ free-form design doc เข้าเป็นเอกสารออกแบบระบบมาตรฐาน
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*)
---
```

**Step 2: Verify all commands are present**

```bash
ls plugins/system-design-doc/commands/
```

Expected output should include:
```
create-design-doc.md
create-diagram.md
edit-section.md
import-plan.md          ← NEW
reverse-engineer.md
sync-with-features.md
sync-with-mockups.md
system-design-doc.md
validate-design-doc.md
validate-integration.md
```

**Step 3: Verify plugin.json version bump**

```bash
cat plugins/system-design-doc/.claude-plugin/plugin.json
```

Expected: version `"1.3.0"`, description mentions "Import"

**Step 4: Final commit (if any fixes needed)**

```bash
# Only if fixes were needed
git add -A
git commit -m "fix(system-design-doc): fix /import-plan command issues"
```

---

## Summary

| Task | Files | Action |
|------|-------|--------|
| Task 1 | `plugins/system-design-doc/.claude-plugin/plugin.json` | Edit: bump version + update description |
| Task 2 | `plugins/system-design-doc/commands/import-plan.md` | Create: full command definition |
| Task 3 | (verification only) | Verify file structure and discoverability |

**Total: 2 files changed, 0 new dependencies, no changes to long-running-agent**
