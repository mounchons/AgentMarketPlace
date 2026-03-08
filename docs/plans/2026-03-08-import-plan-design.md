# `/import-plan` Command — Design Document

> **Date**: 2026-03-08
> **Status**: Approved
> **Plugin**: system-design-doc
> **Purpose**: Import free-form implementation plans and design docs into standardized 10-section design documents

---

## 1. Problem Statement

`long-running-agent` ต้องการ structured design doc (10 sections + `design_doc_list.json`) เพื่อ auto-generate `feature_list.json` แต่ developer มักเขียนเอกสารแบบ free-form เช่น:

- **Implementation Plan** — Task-based with bash commands, code snippets, dependencies
- **Free-form Design Doc** — มี ER Diagram, architecture, user flows แต่ไม่ตรงรูปแบบ 10 sections

`/import-plan` ทำหน้าที่เป็น **adapter** ที่แปลง free-form docs → standardized format ที่ downstream plugins (long-running-agent, ui-mockup) อ่านได้

---

## 2. Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Plugin location | system-design-doc | Single Responsibility — system-design-doc owns document transformation |
| Input types | 2 (implementation plan + free-form design doc) | ครอบคลุม format ที่ใช้จริงใน project |
| Existing doc handling | เสริม sections ที่ขาด, ถ้ายังไม่มีสร้างใหม่ | ยืดหยุ่น ไม่ทำลาย work ที่มีอยู่ |
| Implementation plan tasks | แปลงเป็น design doc sections เท่านั้น | Separation of concerns — long-running-agent สร้าง features เอง |
| Section reformat | สร้างทุก section ใหม่เป็น format มาตรฐาน | ให้ parser ทำงานได้ 100%, consistency |
| Approach | Analyze-then-Generate | User เห็น gap report ก่อน generate |

---

## 3. Command Interface

```
/import-plan <path-to-file>
```

**Examples:**
```
/import-plan docs/example/2026-03-08-phase-a-implementation-plan.md
/import-plan docs/example/2026-03-08-thai-esg-hub-design.md
```

---

## 4. Input Detection

### Type 1: Implementation Plan

**Detection patterns:**
- `Task \d+:` or `## Task \d+`
- Dependency chains (`Task 1 → Task 2 → Task 3`)
- Multiple fenced code blocks with bash/shell commands
- `**Goal:**`, `**Architecture:**`, `**Tech Stack:**` metadata

**Data extracted:**

| Data | Source Pattern | Target Section |
|------|--------------|----------------|
| Project name, goal | Header metadata | 1. Introduction |
| Tech stack | `**Tech Stack:**` line | 1. Introduction (Technology Stack) |
| Architecture style | `**Architecture:**` line | 1. High-Level Architecture |
| Task groupings | Task names → module grouping | 3. Module Overview |
| File paths | `- Create: path/to/file` | 3. Module Overview (project structure) |
| NuGet/npm packages | `dotnet add package`, `npm install` | 1. Technology Stack table |
| Task dependencies | Dependency chain | 6. Flow Diagrams (build order) |

**Not extracted** (discarded):
- Bash commands / code snippets (implementation detail, not design)
- Step-by-step instructions (belongs in implementation plan, not design doc)

### Type 2: Free-form Design Doc

**Detection patterns:**
- Mermaid `erDiagram` block
- `## Database`, `## Architecture`, `## System` headings
- Entity/table definitions
- ASCII architecture diagrams

**Data extracted:**

| Data | Source Pattern | Target Section |
|------|--------------|----------------|
| Entities + fields | Mermaid erDiagram block | 4. Data Model, 7. ER Diagram, 8. Data Dictionary |
| Relationships | `\|\|--o{` patterns | 7. ER Diagram |
| User flows | Numbered lists in flow sections | 6. Flow Diagrams |
| Page breakdown | Tables with page/หน้า columns | 9. Sitemap |
| Roles | role/admin/manager context | 10. User Roles & Permissions |
| Architecture | ASCII art / text diagrams | 1. High-Level Architecture |
| API patterns | REST endpoint patterns | Sequence Diagrams |
| Security strategy | auth/RLS/tenant sections | 2. Requirements (NFR) |
| Phase roadmap | Phase A/B/C sections | 2. Requirements (Scope) |

### Fallback

ถ้า detect type ไม่ได้ → ถาม user:
```
ไม่สามารถระบุประเภทไฟล์ได้อัตโนมัติ — ไฟล์นี้เป็น:
(A) Implementation Plan (Task-based)
(B) Design Document (free-form)
```

---

## 5. Analyze Phase — Gap Report

หลัง extract ข้อมูลแล้ว แสดง gap report:

```
📊 Analysis Report: [filename]
──────────────────────────────────────────

Type detected: [Implementation Plan | Free-form Design Document]

✅ Found (จะ reformat เป็นมาตรฐาน):
   • [list of found items with counts]

⚠️ Inferred (จะสร้างจาก context):
   • [list of sections that can be generated from available data]

❌ Missing (ต้องการข้อมูลเพิ่ม หรือจะ generate แบบ minimal):
   • [list of sections with insufficient data]

ต้องการเสริมข้อมูลก่อน generate หรือไม่?
```

User can:
1. Proceed as-is → generate with inferred/minimal sections
2. Provide additional info → re-analyze with enriched data

---

## 6. Generate Phase

### Output Artifacts

**Artifact 1: `.design-docs/system-design-[project-name].md`**

Generate/reformat ครบ 10 sections ตาม `templates/design-doc-template.md`:

```
Section 1:  Introduction & Overview        ← header metadata, tech stack, architecture
Section 2:  System Requirements            ← scope, phase strategy → FR/NFR
Section 3:  Module Overview                ← project structure, task grouping
Section 4:  Data Model                     ← erDiagram → classDiagram
Section 5:  Data Flow Diagram              ← architecture + modules → DFD Level 0, 1
Section 6:  Flow Diagrams                  ← user flow steps → Mermaid flowchart
Section 7:  ER Diagram                     ← erDiagram → reformat per mermaid-patterns.md
Section 8:  Data Dictionary                ← entity fields → tables (type, constraints, description)
Section 9:  Sitemap                        ← page breakdown → Mermaid flowchart TD
Section 10: User Roles & Permissions       ← roles → role table + permission matrix
```

**Reformat logic:**
```
For each of 10 sections:
  → Always generate fresh from extracted data using template format
  → Even if source has good ER Diagram, reformat to match mermaid-patterns.md
```

**Artifact 2: `.design-docs/design_doc_list.json`**

Schema v2.1.0 with:
- `source: "imported"` — distinguishes from `create-design-doc` or `reverse-engineer`
- `source_file` — path to original input file
- `entities[]` — with ENT-xxx IDs, CRUD ops (enabled/disabled + delete strategy), relationships
- `entities[].crud_operations[].enabled` — boolean ระบุว่า operation นี้รองรับหรือไม่
- `entities[].crud_operations.delete.strategy` — `"soft"` (default) or `"hard"`
- `api_endpoints[]` — with API-xxx IDs, method, path, entity refs (สร้างเฉพาะ enabled operations)

**Merge behavior (if design_doc_list.json already exists):**
- Add new document entry, don't overwrite existing entries
- Merge entities (avoid duplicates by name matching)

---

## 7. Edge Cases

| Case | Behavior |
|------|----------|
| File not found | Error: `❌ File not found: [path]` |
| Cannot detect type | Ask user: "plan or design doc?" |
| Existing `.design-docs/system-design-xxx.md` | Ask user: "Reformat over existing or create new?" |
| Entities without fields | Generate minimal Data Dictionary (id PK + name), mark ⚠️ |
| Multiple phases (A, B, C) | Import all phases into design doc (full scope) |
| `design_doc_list.json` exists | Merge — add new entries, keep existing |
| Empty or unparseable file | Error: `❌ Cannot extract any structured data from file` |

---

## 8. Command Flow

```
Step 0: Validate     → File exists? Readable?
Step 1: Detect       → Implementation Plan or Free-form Design Doc?
Step 2: Extract      → entities, flows, pages, roles, tech stack
Step 3: Check        → .design-docs/ existing doc?
Step 4: Gap Report   → Show findings + ask user to confirm
Step 5: Generate     → design doc .md + design_doc_list.json
Step 6: Validate     → Auto-run consistency checks (ER ↔ Data Dictionary)
Step 7: Output       → Summary + next steps
```

---

## 9. Success Output

```
✅ Import Plan สำเร็จ!

📥 Source: [source_file_path]
   Type: [detected_type]

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
```

---

## 10. Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `plugins/system-design-doc/commands/import-plan.md` | **Create** | Command definition |
| `plugins/system-design-doc/.claude-plugin/plugin.json` | **Edit** | Bump version for new command |
| `plugins/system-design-doc/skills/.../templates/design_doc_list.json` | **Edit** | Add `enabled` + `strategy` to crud_operations (schema v2.1.0) |
| `plugins/system-design-doc/commands/validate-integration.md` | **Edit** | Change `crud_completeness` → `crud_must_be_defined` |
| `plugins/long-running-agent/commands/generate-features-from-design.md` | **Edit** | Read crud_operations, skip disabled, soft delete |
| `plugins/ui-mockup/skills/.../templates/mockup_list.json` | **Edit** | Add `delete_strategy` to crud_actions |

**CRUD changes span all 3 plugins** — system-design-doc defines, long-running-agent reads, ui-mockup displays.
