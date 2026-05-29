# System Design Doc — Split Into Per-Section Files Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert `system-design-doc` output from one monolithic `.md` into per-section files indexed by a section registry in `design_doc_list.json`, and teach `long-running` to read only the section file it needs.

**Architecture:** New docs use `doc_layout:"split"` — a per-project subfolder `<slug>/` with `00-index.md` + `01..10-<key>.md`. `design_doc_list.json` (schema 2.3.0) gains `documents[].sections[]` mapping each section key → file + status; consumers resolve files through it. Legacy single-file docs keep working (`doc_layout:"single"` / field absent / no JSON → fallback). Section numbering is preserved *inside* each file so every existing regex still matches once the right file is opened.

**Tech Stack:** Markdown + JSON (Claude Code plugin skills/commands). No build/runtime — "tests" are `Grep`/`Read` acceptance checks and JSON-structure checks. Frequent commits.

**Spec:** `docs/superpowers/specs/2026-05-29-system-design-doc-split-files-design.md`

---

## Shared Contracts (referenced by every task — do not change once set)

**Section keys + numbers (FIXED enum):**
`introduction(01) · requirements(02) · modules(03) · data-model(04) · dfd(05) · flow-diagrams(06) · er-diagram(07) · data-dictionary(08) · sitemap(09) · permissions(10)`; index file is `00-index.md` (key `index`).

**File pattern:** `NN-<section-key>.md` inside `.design-docs/<project-slug>/`.

**Section file marker (line 1):** `<!-- sdd-section: <key> | doc: <project-slug> | schema: 2.3.0 -->`

**Section file wrapper (template tokens `__PROJECT_NAME__` / `__PROJECT_SLUG__` replaced by the generator — these are the ONLY allowed tokens):**
```markdown
<!-- sdd-section: <key> | doc: __PROJECT_SLUG__ | schema: 2.3.0 -->
# Section <N> — <Title>

> [← Back to Index](00-index.md) · __PROJECT_NAME__ System Design Document

<carried section content — headings like "## 8." and "### 8.1" preserved verbatim>
```

**Registry entry shape (one per section in `documents[].sections[]`):**
```json
{ "key": "data-dictionary", "number": 8, "title": "Data Dictionary",
  "file": "<slug>/08-data-dictionary.md", "status": "draft",
  "anchors": ["### 8."], "updated_at": "<ISO8601>" }
```
`status` ∈ `draft | in-progress | completed`.

---

## Task 1: Schema 2.3.0 — section registry in `design_doc_list.json` template

**Files:**
- Modify: `plugins/system-design-doc/skills/system-design-doc/templates/design_doc_list.json`

- [ ] **Step 1: Define the acceptance check**

Grep the template for the new contract keys. Expected AFTER the change:
- `"schema_version": "2.3.0"` present (2 occurrences: top-level + metadata)
- `"doc_layout"` present
- `"sections"` array present in `documents[0]`
- `"doc_layout_default"` present

- [ ] **Step 2: Run the check now → expect FAIL**

Grep `"doc_layout"` in the file. Expected: **0 matches** (not yet added).

- [ ] **Step 3: Bump schema version (top-level + metadata)**

Replace top-level line 3 `"schema_version": "2.2.0",` → `"schema_version": "2.3.0",`
Replace in `metadata` block: `"schema_version": "2.2.0",` → `"schema_version": "2.3.0",` and `"plugin_version": "1.7.0",` → `"plugin_version": "2.1.0",`

- [ ] **Step 4: Add registry fields to `documents[0]`**

In the `documents[0]` object, replace the line:
```json
      "file_path": "system-design-[project-name].md",
```
with:
```json
      "doc_layout": "split",
      "doc_dir": "[project-slug]",
      "file_path": "[project-slug]/00-index.md",
      "_layout_comment": "doc_layout: 'split' (default) writes per-section files under doc_dir; 'single' = legacy one-file at file_path. sections[] is the machine map consumers MUST use to locate a section.",
      "sections": [
        { "key": "introduction",    "number": 1,  "title": "Introduction & Overview",   "file": "[project-slug]/01-introduction.md",   "status": "draft", "anchors": ["## 1."],   "updated_at": null },
        { "key": "requirements",     "number": 2,  "title": "System Requirements",       "file": "[project-slug]/02-requirements.md",   "status": "draft", "anchors": ["### 2.", "^AC-\\d+:", "^### Use Case \\(UC-\\d+\\):"], "updated_at": null },
        { "key": "modules",          "number": 3,  "title": "Related Modules",           "file": "[project-slug]/03-modules.md",        "status": "draft", "anchors": ["### 3."],   "updated_at": null },
        { "key": "data-model",       "number": 4,  "title": "Data Model",                "file": "[project-slug]/04-data-model.md",     "status": "draft", "anchors": ["### 4."],   "updated_at": null },
        { "key": "dfd",              "number": 5,  "title": "Data Flow Diagram",         "file": "[project-slug]/05-dfd.md",            "status": "draft", "anchors": ["### 5."],   "updated_at": null },
        { "key": "flow-diagrams",    "number": 6,  "title": "Flow Diagrams",             "file": "[project-slug]/06-flow-diagrams.md",  "status": "draft", "anchors": ["### 6."],   "updated_at": null },
        { "key": "er-diagram",       "number": 7,  "title": "ER Diagram",                "file": "[project-slug]/07-er-diagram.md",     "status": "draft", "anchors": ["### 7."],   "updated_at": null },
        { "key": "data-dictionary",  "number": 8,  "title": "Data Dictionary",           "file": "[project-slug]/08-data-dictionary.md","status": "draft", "anchors": ["### 8."],   "updated_at": null },
        { "key": "sitemap",          "number": 9,  "title": "Sitemap",                   "file": "[project-slug]/09-sitemap.md",        "status": "draft", "anchors": ["### 9."],   "updated_at": null },
        { "key": "permissions",      "number": 10, "title": "User Roles & Permissions",  "file": "[project-slug]/10-permissions.md",    "status": "draft", "anchors": ["### 10."],  "updated_at": null }
      ],
```
(Leave the existing `sections_completed` / `sections_pending` arrays as-is below this — they remain, derived from `sections[].status`.)

- [ ] **Step 5: Point diagram file_paths into section files**

In the `diagrams` block set these `file_path` values (replace each `null`):
- `high_level_architecture.file_path` → `"[project-slug]/01-introduction.md"`
- `er_diagram.file_path` → `"[project-slug]/07-er-diagram.md"`
- `dfd.level_0.file_path` → `"[project-slug]/05-dfd.md"`
- `sitemap.file_path` → `"[project-slug]/09-sitemap.md"`
- in the `flow_diagrams[0]` and `sequence_diagrams[0]` sample objects, set `file_path` → `"[project-slug]/06-flow-diagrams.md"`

- [ ] **Step 6: Add metadata + validation_rules flags**

In `metadata`, after `"uc_header_pattern": ...` add:
```json
    "doc_layout_default": "split",
    "section_keys": ["introduction","requirements","modules","data-model","dfd","flow-diagrams","er-diagram","data-dictionary","sitemap","permissions"],
    "section_file_pattern": "NN-<section-key>.md (NN = zero-padded number; index is 00-index.md)"
```
In `validation_rules`, add `"sections_must_match_disk": true,` (after `"diagram_file_must_exist": false,`).

- [ ] **Step 7: Run the acceptance check → expect PASS**

Grep `"2.3.0"` → expect ≥ 2 matches. Grep `"doc_layout"` → expect ≥ 1. Grep `"key": "data-dictionary"` → expect 1. Read the file and confirm it is valid JSON (balanced braces; no trailing commas). If `node` is available: `node -e "JSON.parse(require('fs').readFileSync('plugins/system-design-doc/skills/system-design-doc/templates/design_doc_list.json','utf8')); console.log('valid')"` → expect `valid`.

- [ ] **Step 8: Commit**

```bash
git add plugins/system-design-doc/skills/system-design-doc/templates/design_doc_list.json
git commit -m "feat(system-design-doc): schema 2.3.0 — add section registry (doc_layout, sections[])"
```

---

## Task 2: Per-section + index templates; mark monolith legacy

**Files:**
- Create: `plugins/system-design-doc/skills/system-design-doc/templates/sections/01-introduction.md` … `10-permissions.md` (10 files)
- Create: `plugins/system-design-doc/skills/system-design-doc/templates/index-template.md`
- Modify: `plugins/system-design-doc/skills/system-design-doc/templates/design-doc-template.md` (add legacy header)
- Source to carve from: existing `templates/design-doc-template.md` (read it first)

- [ ] **Step 1: Define the acceptance check**

After this task: `Glob templates/sections/*.md` → 10 files; each begins with `<!-- sdd-section:`; `index-template.md` contains a `## Sections` table linking all 10 files.

- [ ] **Step 2: Run the check now → expect FAIL**

`Glob plugins/system-design-doc/skills/system-design-doc/templates/sections/*.md` → expect **0 files**.

- [ ] **Step 3: Read the source template**

Read `templates/design-doc-template.md` fully. Section line ranges to carve (verbatim, headings preserved):
| Key | File | Source lines |
|-----|------|--------------|
| introduction | `01-introduction.md` | 33–107 |
| requirements | `02-requirements.md` | 110–242 (incl. 2.1 FR, 2.2 NFR, 2.3 BR, 2.4 AC, 2.5 UC) |
| modules | `03-modules.md` | 245–293 |
| data-model | `04-data-model.md` | 296–345 |
| dfd | `05-dfd.md` | 348–386 |
| flow-diagrams | `06-flow-diagrams.md` | 389–419 |
| er-diagram | `07-er-diagram.md` | 422–484 |
| data-dictionary | `08-data-dictionary.md` | 487–542 |
| sitemap | `09-sitemap.md` | 544–726 (incl. 9.1–9.9) |
| permissions | `10-permissions.md` | 728–779 |

The header (lines 1–31) and Appendix (lines 782–800) go into `index-template.md` (Step 5), not into a section file.

- [ ] **Step 4: Write each section file (×10)**

For each row above, create the file with this exact wrapper, then the carved lines:
```markdown
<!-- sdd-section: <key> | doc: __PROJECT_SLUG__ | schema: 2.3.0 -->
# Section <N> — <Title>

> [← Back to Index](00-index.md) · __PROJECT_NAME__ System Design Document

<carved source lines for this section, verbatim>
```
Use the title from the registry (Task 1 Shared Contracts). Example — `08-data-dictionary.md`:
```markdown
<!-- sdd-section: data-dictionary | doc: __PROJECT_SLUG__ | schema: 2.3.0 -->
# Section 8 — Data Dictionary

> [← Back to Index](00-index.md) · __PROJECT_NAME__ System Design Document

## 8. Data Dictionary

### 8.1 Table: users
... (lines 487–542 of design-doc-template.md, verbatim)
```

- [ ] **Step 5: Write `index-template.md`**

```markdown
<!-- sdd-section: index | doc: __PROJECT_SLUG__ | schema: 2.3.0 -->
# __PROJECT_NAME__ — System Design Document

**Version**: __VERSION__ · **Date**: __DATE__ · **Status**: Draft | Review | Approved · **Layout**: split

> **Reading protocol (AI agents):** open only the section file you need. The machine-readable map is `../design_doc_list.json` → the matching `documents[].sections[]`. Do not load every file.

## Document Metadata

| Item | Details |
|------|---------|
| Project Name | __PROJECT_NAME__ |
| Project Code | __CODE__ |
| Version | __VERSION__ |
| Author | __AUTHOR__ |

## Sections

| # | Section | File | Status | Key Counts |
|---|---------|------|--------|------------|
| 1 | Introduction & Overview | [01-introduction.md](01-introduction.md) | 🔲 | — |
| 2 | System Requirements | [02-requirements.md](02-requirements.md) | 🔲 | FR/NFR/BR/AC/UC |
| 3 | Related Modules | [03-modules.md](03-modules.md) | 🔲 | — |
| 4 | Data Model | [04-data-model.md](04-data-model.md) | 🔲 | — |
| 5 | Data Flow Diagram | [05-dfd.md](05-dfd.md) | 🔲 | — |
| 6 | Flow Diagrams | [06-flow-diagrams.md](06-flow-diagrams.md) | 🔲 | — |
| 7 | ER Diagram | [07-er-diagram.md](07-er-diagram.md) | 🔲 | __ENTITIES__ entities |
| 8 | Data Dictionary | [08-data-dictionary.md](08-data-dictionary.md) | 🔲 | __TABLES__ tables |
| 9 | Sitemap | [09-sitemap.md](09-sitemap.md) | 🔲 | __PAGES__ pages |
| 10 | User Roles & Permissions | [10-permissions.md](10-permissions.md) | 🔲 | __ROLES__ roles |

Status legend: 🔲 pending · 🔄 in-progress · ✅ completed (mirror of `sections[].status`).

## Appendix

### A. Glossary

| Term | Definition |
|------|------------|
| __TERM__ | __DEFINITION__ |

### B. Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| __DATE__ | __VERSION__ | Initial version | __AUTHOR__ |
```

- [ ] **Step 6: Mark the monolith template legacy**

In `templates/design-doc-template.md`, insert at the very top (before line 1):
```markdown
<!-- LEGACY single-file template. Used ONLY when doc_layout:"single". New docs default to doc_layout:"split" — see templates/sections/ + templates/index-template.md and the spec 2026-05-29-system-design-doc-split-files-design.md. -->

```

- [ ] **Step 7: Run the acceptance check → expect PASS**

`Glob .../templates/sections/*.md` → 10 files. `Grep "^<!-- sdd-section:" .../templates/sections` → 10 matches. `Grep "01-introduction.md" .../templates/index-template.md` → ≥1. `Grep "LEGACY single-file" .../templates/design-doc-template.md` → 1.

- [ ] **Step 8: Commit**

```bash
git add plugins/system-design-doc/skills/system-design-doc/templates/
git commit -m "feat(system-design-doc): add per-section + index templates; mark monolith legacy"
```

---

## Task 3: Rewrite `create-design-doc.md` for split output

**Files:**
- Modify: `plugins/system-design-doc/commands/create-design-doc.md` (Step 2, Step 6, Step 7)

- [ ] **Step 1: Define the acceptance check**

After: the command instructs writing per-section files + `00-index.md` under `<slug>/`, populating `sections[]`. Grep finds `00-index.md`, `doc_layout`, `templates/sections/`; the stale flat-`diagrams` JSON example is gone.

- [ ] **Step 2: Run the check now → expect FAIL**

`Grep "00-index" create-design-doc.md` → 0. `Grep "doc_layout" create-design-doc.md` → 0.

- [ ] **Step 3: Update Step 2 (template references)**

Replace the "Read templates" block (around lines 122–125) with:
```markdown
**Read templates (split layout — default):**
- `templates/index-template.md` — index/TOC file (`00-index.md`)
- `templates/sections/NN-<key>.md` — one template per section
- `references/document-sections.md` — content spec per section
- `templates/design-doc-template.md` — LEGACY single-file template (only if user asks for `doc_layout:"single"`)
```

- [ ] **Step 4: Replace Step 6 (Create Document File)**

Replace the entire "### Step 6: Create Document File" block (lines ~178–188) with:
````markdown
### Step 6: Create Document Files (split layout)

1. Compute `<project-slug>` = kebab-case of the project name (e.g. "HR Management" → `hr-management`). If `.design-docs/<slug>/` already exists for a different doc, append `-2`, `-3`, … to keep it unique.
2. Create folder `.design-docs/<project-slug>/`.
3. For each section, copy `templates/sections/NN-<key>.md`, replace `__PROJECT_SLUG__`/`__PROJECT_NAME__` (and any `__…__` tokens), fill real content, and write to `.design-docs/<project-slug>/NN-<key>.md`. Keep the `<!-- sdd-section: … -->` marker on line 1 and the `## N.` / `### N.x` headings intact.
4. Create `.design-docs/<project-slug>/00-index.md` from `templates/index-template.md` with the Sections table linking all 10 files and statuses set to ✅ for completed sections.

**Legacy single-file mode** (only when explicitly requested): write `.design-docs/system-design-<slug>.md` from `design-doc-template.md` and set `doc_layout:"single"` in Step 7.
````

- [ ] **Step 5: Replace Step 7 (the stale JSON example)**

Replace the entire "### Step 7: Update design_doc_list.json" block (lines ~190–228, including the outdated `diagrams:{er_diagram:true,...}` / `entities_count` example) with:
````markdown
### Step 7: Update design_doc_list.json (schema 2.3.0)

Set the `documents[]` entry to the **registry** shape (see `templates/design_doc_list.json`):
```json
{
  "id": "DOC-001",
  "name": "HR Management System",
  "doc_layout": "split",
  "doc_dir": "hr-management",
  "file_path": "hr-management/00-index.md",
  "sections": [
    { "key": "introduction", "number": 1, "title": "Introduction & Overview", "file": "hr-management/01-introduction.md", "status": "completed", "anchors": ["## 1."], "updated_at": "<ISO8601>" }
    // … all 10 sections; status "completed" for written sections, "draft" otherwise
  ],
  "sections_completed": ["introduction", "..."],
  "sections_pending": [],
  "statistics": { "entities_count": 8, "tables_count": 12, "...": "..." },
  "created_at": "<ISO8601>",
  "updated_at": "<ISO8601>"
}
```
Also set `diagrams.er_diagram.file_path` = `hr-management/07-er-diagram.md`, `diagrams.sitemap.file_path` = `hr-management/09-sitemap.md`, `diagrams.dfd.level_0.file_path` = `hr-management/05-dfd.md`, `diagrams.high_level_architecture.file_path` = `hr-management/01-introduction.md`. Keep `sections_completed/pending` in sync with `sections[].status`.
````

- [ ] **Step 6: Update the success Output block**

In the "### Success" block (lines ~250–272), replace the `📁 File: .design-docs/system-design-hr-management.md` line with:
```markdown
📁 Folder: .design-docs/hr-management/  (00-index.md + 10 section files)
```

- [ ] **Step 7: Run the acceptance check → expect PASS**

`Grep "00-index" create-design-doc.md` → ≥2. `Grep "doc_layout" create-design-doc.md` → ≥1. `Grep "templates/sections" create-design-doc.md` → ≥1. `Grep "er_diagram.: true" create-design-doc.md` → 0 (stale example removed).

- [ ] **Step 8: Commit**

```bash
git add plugins/system-design-doc/commands/create-design-doc.md
git commit -m "feat(system-design-doc): create-design-doc emits split layout + 2.3.0 registry"
```

---

## Task 4: `reverse-engineer.md` + `import-plan.md` → split output

**Files:**
- Modify: `plugins/system-design-doc/commands/reverse-engineer.md`
- Modify: `plugins/system-design-doc/commands/import-plan.md`

- [ ] **Step 1: Define the acceptance check**

Both commands instruct split output (`<slug>/` + `00-index.md` + per-section files) and `sections[]` registry population.

- [ ] **Step 2: Run the check now → expect FAIL**

`Grep "00-index" reverse-engineer.md import-plan.md` → 0 in both.

- [ ] **Step 3: Read both files** to locate the "write document" / "update design_doc_list.json" steps.

- [ ] **Step 4: Edit `reverse-engineer.md`**

At the step that writes the output document, replace single-file write instructions with a reference to the canonical procedure:
```markdown
**Output: split layout (default).** Follow `create-design-doc.md` Step 6–7 exactly — write `.design-docs/<project-slug>/00-index.md` + `NN-<key>.md` (10 files), then populate `design_doc_list.json` `documents[].sections[]` (schema 2.3.0) with `doc_layout:"split"`, `doc_dir`, and `diagrams.*.file_path` pointing at the section files. Preserve `<!-- sdd-section -->` markers and `## N.`/`### N.x` headings.
```

- [ ] **Step 5: Edit `import-plan.md`** with the same paragraph at its document-writing step.

- [ ] **Step 6: Run the acceptance check → expect PASS**

`Grep "split layout" reverse-engineer.md` → ≥1; `Grep "split layout" import-plan.md` → ≥1; `Grep "sections\[\]" reverse-engineer.md import-plan.md` → ≥1 each.

- [ ] **Step 7: Commit**

```bash
git add plugins/system-design-doc/commands/reverse-engineer.md plugins/system-design-doc/commands/import-plan.md
git commit -m "feat(system-design-doc): reverse-engineer + import-plan emit split layout"
```

---

## Task 5: `create-diagram.md` + `edit-section.md` → per-section file ops

**Files:**
- Modify: `plugins/system-design-doc/commands/create-diagram.md`
- Modify: `plugins/system-design-doc/commands/edit-section.md`

- [ ] **Step 1: Define the acceptance check**

`edit-section.md` resolves the single target file via the registry by key (no whole-file `grep -A 100` over a monolith) and DD table headings are standardized to `### 8.x Table: <name>`. `create-diagram.md` writes only the relevant section file.

- [ ] **Step 2: Run the check now → expect FAIL**

`Grep "sections\[\]" edit-section.md` → 0. `Grep "### Table: payments" edit-section.md` → 1 (the non-numbered heading we must fix).

- [ ] **Step 3: Edit `edit-section.md` Step 1 & Step 3 (file resolution)**

Replace Step 3 "Read the Current Document" block (lines ~66–74) with:
````markdown
### Step 3: Resolve and Read ONLY the Target Section File

```
1. Read .design-docs/design_doc_list.json
2. Find the document; check documents[].doc_layout:
   - "split": find sections[] entry whose key matches the requested section
     (intro→introduction, ER→er-diagram, DD→data-dictionary, …) and read ONLY sections[].file
   - "single" / field absent: read the single file_path (legacy whole-file grep)
```
This avoids loading the whole document — open just `<slug>/NN-<key>.md`. After editing, set that section's `sections[].status` and `updated_at`, and (if the edit changed counts) the index `00-index.md` row.
````
Add to the Step-2 keyword table caption: "section key column" mapping each row to its registry key (introduction, requirements, modules, data-model, dfd, flow-diagrams, er-diagram, data-dictionary, sitemap, permissions).

- [ ] **Step 4: Standardize the DD table heading in `edit-section.md`**

In the "### Section 8: Data Dictionary" example (line ~125), replace:
```markdown
### Table: payments
```
with:
```markdown
### 8.N Table: payments
```
and add a note: "DD table headings MUST be numbered `### 8.x Table: <name>` so the table-count grep `^### 8\.` matches (used by long-running Verification Pipeline Step 2)."

- [ ] **Step 5: Edit `create-diagram.md`**

At its output step, add:
```markdown
**Split layout:** write the diagram into its owning section file only — ER→`<slug>/07-er-diagram.md`, Sitemap→`<slug>/09-sitemap.md`, DFD→`05-dfd.md`, Flow→`06-flow-diagrams.md`, Sequence→`06-flow-diagrams.md` (or the documented section). Then update that `sections[].status`/`updated_at` and the matching `diagrams.*.file_path` in `design_doc_list.json`. Resolve the file via the registry (same as edit-section Step 3).
```

- [ ] **Step 6: Run the acceptance check → expect PASS**

`Grep "sections\[\]" edit-section.md` → ≥1. `Grep "### Table: payments" edit-section.md` → 0. `Grep "8.N Table: payments" edit-section.md` → 1. `Grep "07-er-diagram" create-diagram.md` → ≥1.

- [ ] **Step 7: Commit**

```bash
git add plugins/system-design-doc/commands/create-diagram.md plugins/system-design-doc/commands/edit-section.md
git commit -m "feat(system-design-doc): per-section file ops for create-diagram + edit-section; numbered DD headings"
```

---

## Task 6: New command `/split-design-doc` (single → split migration)

**Files:**
- Create: `plugins/system-design-doc/commands/split-design-doc.md`

- [ ] **Step 1: Define the acceptance check**

The new command exists and documents: parse monolith by `## N.` → write `<slug>/NN-<key>.md` + `00-index.md` → build `sections[]` → flip `doc_layout` → keep `.bak`.

- [ ] **Step 2: Run the check now → expect FAIL**

`Glob plugins/system-design-doc/commands/split-design-doc.md` → 0 files.

- [ ] **Step 3: Write the command file**

```markdown
---
description: Migrate a single-file system design document into the split per-section layout
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*)
---

# Split Design Document Command

Migrate a legacy single-file design document (`doc_layout:"single"`) into the per-section split layout (`doc_layout:"split"`). Non-destructive: the original is kept as `.bak`.

## Input
```
/split-design-doc                       # auto-detect the single-file doc
/split-design-doc system-design-hr.md   # explicit file
```

## Steps

### Step 1: Locate the source document
```bash
cat .design-docs/design_doc_list.json 2>/dev/null
ls -la .design-docs/*.md 2>/dev/null
```
Pick the `documents[]` entry with `doc_layout:"single"` (or absent). If none, tell the user there is nothing to migrate.

### Step 2: Parse into sections
Read the monolith. Split on top-level headings `## N.` (N = 1..10) into the 10 canonical sections. Map heading → key:
1→introduction, 2→requirements, 3→modules, 4→data-model, 5→dfd, 6→flow-diagrams, 7→er-diagram, 8→data-dictionary, 9→sitemap, 10→permissions. The title block + Appendix go into the index.

### Step 3: Write split files
1. `<project-slug>` = kebab-case of project name; create `.design-docs/<project-slug>/`.
2. For each section, write `NN-<key>.md` = marker line + `# Section N — <Title>` + backlink + the parsed section content (preserve `## N.`/`### N.x` headings verbatim).
3. Write `00-index.md` from `templates/index-template.md` (TOC links all 10 files; statuses ✅).

### Step 4: Update design_doc_list.json (schema 2.3.0)
Set the document's `doc_layout:"split"`, `doc_dir`, `file_path` → `<slug>/00-index.md`, build `sections[]` (status `completed` for every parsed section), set `diagrams.*.file_path`, sync `sections_completed`.

### Step 5: Preserve original + report
Rename the monolith to `system-design-<slug>.md.bak` (do not delete). Print a summary and remind the user to `git add .design-docs/<slug>/`.

## ⚠️ Rules
- Preserve section numbering inside files (grep contract).
- DO NOT delete the original — keep `.bak`.
- Round-trip safe: concatenating `01..10` in order reproduces the original section content.

> 💬 **Note**: This command responds in Thai (คำสั่งนี้จะตอบกลับเป็นภาษาไทย)
```

- [ ] **Step 4: Run the acceptance check → expect PASS**

`Glob .../commands/split-design-doc.md` → 1. `Grep "doc_layout" split-design-doc.md` → ≥1. `Grep "\.bak" split-design-doc.md` → ≥1.

- [ ] **Step 5: Commit**

```bash
git add plugins/system-design-doc/commands/split-design-doc.md
git commit -m "feat(system-design-doc): add /split-design-doc migration command"
```

---

## Task 7: `validate-design-doc.md` — cross-file validation

**Files:**
- Modify: `plugins/system-design-doc/commands/validate-design-doc.md`

- [ ] **Step 1: Define the acceptance check**

Validation covers: registry↔disk bidirectional (R37), index links all files (R38), naming/marker contract (R36), ER↔DD across `07`/`08`, numbering continuity within each file. Layout-aware (split vs single).

- [ ] **Step 2: Run the check now → expect FAIL**

`Grep "registry" validate-design-doc.md` → 0 (or `Grep "sections_must_match_disk\|R37" validate-design-doc.md` → 0).

- [ ] **Step 3: Read the file**, then add a "Split-Layout Validation" subsection.

- [ ] **Step 4: Add the validation block**

Insert after the existing validation rules section:
````markdown
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
````

- [ ] **Step 5: Run the acceptance check → expect PASS**

`Grep "R37" validate-design-doc.md` → ≥1. `Grep "Split-Layout Validation" validate-design-doc.md` → 1. `Grep "07-er-diagram" validate-design-doc.md` → ≥1.

- [ ] **Step 6: Commit**

```bash
git add plugins/system-design-doc/commands/validate-design-doc.md
git commit -m "feat(system-design-doc): cross-file validation for split layout (R36-R38)"
```

---

## Task 8: `system-design-doc` SKILL.md + plugin.json → 2.1.0

**Files:**
- Modify: `plugins/system-design-doc/skills/system-design-doc/SKILL.md`
- Modify: `plugins/system-design-doc/.claude-plugin/plugin.json`

- [ ] **Step 1: Define the acceptance check**

SKILL.md: Output Files shows split layout; a "Reading Protocol for Consumers" section exists; CRITICAL RULES include R36–R38; Resources lists the new templates + `/split-design-doc`; version history has a 2.1.0 row. plugin.json version is `2.1.0`.

- [ ] **Step 2: Run the check now → expect FAIL**

`Grep "Reading Protocol for Consumers" SKILL.md` → 0. `Grep "\"version\": \"2.1.0\"" plugin.json` → 0.

- [ ] **Step 3: Replace the "Output Files → Directory Structure" block**

Replace the directory-structure code block (SKILL.md lines ~466–478) with:
```
.design-docs/
├── design_doc_list.json           # section registry (schema 2.3.0) — machine source of truth
├── sitemap.json                   # unchanged
└── <project-slug>/                # split layout (default)
    ├── 00-index.md                # human TOC + status + links
    ├── 01-introduction.md
    ├── 02-requirements.md         # FR/NFR/BR/AC/UC
    ├── 03-modules.md
    ├── 04-data-model.md
    ├── 05-dfd.md
    ├── 06-flow-diagrams.md
    ├── 07-er-diagram.md
    ├── 08-data-dictionary.md
    ├── 09-sitemap.md
    └── 10-permissions.md

# Legacy single-file layout (doc_layout:"single"):
#   .design-docs/system-design-<slug>.md
```
And in the File Naming Convention table, add a row: `| Section file | NN-<section-key>.md | 08-data-dictionary.md |` and `| Index | 00-index.md | - |`.

- [ ] **Step 4: Add "Reading Protocol for Consumers"**

Insert a new section before "## Integration with Other Skills":
````markdown
## Reading Protocol for Consumers (split layout)

Other plugins (long-running, qa-ui-test) MUST locate sections via the registry — never `cat` the whole doc:

```
1. Read .design-docs/design_doc_list.json
2. documents[].doc_layout:
   - "split": sections[] maps key → file. Open ONLY the file you need.
              e.g. schema work → sections[key="data-dictionary"].file
   - "single" / absent: read the single file_path (legacy)
   - no JSON: fallback `find . -name "*design*.md"`
3. Section numbering is preserved inside files, so existing greps
   (`### 8.`, `^AC-\d+:`, `^### Use Case \(UC-\d+\):`) match within the resolved file.
```
````

- [ ] **Step 5: Add CRITICAL RULES R36–R38**

After rule 35 (Sitemap Rules), add:
```markdown
### Split-Layout Rules (v2.1.0 — doc_layout:"split")

36. **Naming & marker contract** — section files MUST be `NN-<section-key>.md`; line-1 marker `<!-- sdd-section: <key> | doc: <slug> | schema: 2.3.0 -->` must agree with filename + doc slug.
37. **Registry ↔ disk bidirectional** — every `sections[].file` exists; every `NN-*.md` on disk is registered. No orphans on either side.
38. **Index completeness** — `00-index.md` links every section file.
```

- [ ] **Step 6: Update Resources table + Version History**

In the Resources table add rows: `| Section Templates | templates/sections/NN-*.md | One template per section (split) |`, `| Index Template | templates/index-template.md | 00-index.md generator |`. In the Commands Overview table add `| /split-design-doc | Migrate single-file doc → split layout |`.
Add a Version History row at the top:
```markdown
| 2.1.0 | 2026-05-29 | Split-doc layout: per-section files under `<slug>/` + `00-index.md`; `design_doc_list.json` schema 2.3.0 section registry (`doc_layout`, `doc_dir`, `sections[]`, meaningful `diagrams.*.file_path`); new `/split-design-doc`; per-section `/edit-section` + `/create-diagram`; cross-file `/validate-design-doc`; CRITICAL RULES 36-38; section + index templates; monolith template marked legacy. Backward compatible with single-file docs. |
```

- [ ] **Step 7: Bump plugin.json**

In `plugins/system-design-doc/.claude-plugin/plugin.json` replace `"version": "2.0.0",` → `"version": "2.1.0",`.

- [ ] **Step 8: Run the acceptance check → expect PASS**

`Grep "Reading Protocol for Consumers" SKILL.md` → 1. `Grep "^37\. " SKILL.md` → 1. `Grep "split-design-doc" SKILL.md` → ≥1. `Grep "2.1.0" SKILL.md` → ≥1. `Grep "\"version\": \"2.1.0\"" plugin.json` → 1.

- [ ] **Step 9: Commit**

```bash
git add plugins/system-design-doc/skills/system-design-doc/SKILL.md plugins/system-design-doc/.claude-plugin/plugin.json
git commit -m "feat(system-design-doc): SKILL split layout + reading protocol + R36-38; plugin 2.1.0"
```

---

## Task 9: long-running `coding-agent-guide.md` — registry resolution

**Files:**
- Modify: `plugins/long-running/skills/long-running/references/coding-agent-guide.md` (Step 0, Step 1)

- [ ] **Step 1: Define the acceptance check**

The guide tells the agent to read `design_doc_list.json`, branch on `doc_layout`, and open ONLY the resolved section file; DD count greps the resolved DD file.

- [ ] **Step 2: Run the check now → expect FAIL**

`Grep "doc_layout" coding-agent-guide.md` → 0.

- [ ] **Step 3: Replace the Step-0 design-doc lookup**

Replace the `# 2. Check System Design Document …` bash block (lines ~37–39) with:
````markdown
```bash
# 2. System Design Document — resolve via the registry (do NOT cat the whole doc)
cat .design-docs/design_doc_list.json 2>/dev/null
# doc_layout:"split" → use documents[].sections[] to open ONLY the needed file:
#   schema work     → sections[key="data-dictionary"].file  (e.g. <slug>/08-data-dictionary.md)
#   relationships   → sections[key="er-diagram"].file
#   business logic  → sections[key="flow-diagrams"].file
#   routes/pages    → sections[key="sitemap"].file
# doc_layout:"single" or field absent → read the single file_path (legacy)
# no design_doc_list.json → fallback:
find . -name "*design*.md" -o -name "*system*.md" 2>/dev/null | head -5
```
````

- [ ] **Step 4: Add a resolution note + DD-count update**

After the "Main Reference Sources" box, add:
```markdown
**🎯 Resolving a design section (split layout):**
`design_doc_list.json` → `documents[].sections[]` maps each section key to its file. Open only that file — never load the whole document. Keys: `introduction, requirements, modules, data-model, dfd, flow-diagrams, er-diagram, data-dictionary, sitemap, permissions`. For `single` layout (or no registry), fall back to reading the one design `.md`.
```

- [ ] **Step 5: Run the acceptance check → expect PASS**

`Grep "doc_layout" coding-agent-guide.md` → ≥2. `Grep "sections\[" coding-agent-guide.md` → ≥1. `Grep "08-data-dictionary" coding-agent-guide.md` → ≥1.

- [ ] **Step 6: Commit**

```bash
git add plugins/long-running/skills/long-running/references/coding-agent-guide.md
git commit -m "feat(long-running): resolve design-doc sections via registry (split-layout aware)"
```

---

## Task 10: long-running `SKILL.md` (Verification Pipeline + integration box) + plugin.json → 2.9.0

**Files:**
- Modify: `plugins/long-running/skills/long-running/SKILL.md` (Verification Pipeline Step 2, system-design-doc integration box, changelog, version banner)
- Modify: `plugins/long-running/.claude-plugin/plugin.json`

- [ ] **Step 1: Define the acceptance check**

Verification Pipeline Step 2 "HOW TO CHECK" resolves the DD file from the registry and greps that file; the system-design-doc integration box notes registry resolution; changelog has a 2.9.0 entry; plugin.json version is `2.9.0`.

- [ ] **Step 2: Run the check now → expect FAIL**

`Grep "doc_layout" SKILL.md` (long-running) → 0. `Grep "\"version\": \"2.9.0\"" plugin.json` → 0.

- [ ] **Step 3: Update Verification Pipeline Step 2 "HOW TO CHECK"**

Replace the DD-count line (SKILL.md long-running ~line 437) `2. Count DD tables: grep "### 8\." .design-docs/*.md | wc -l` with:
```markdown
  2. Resolve the DD file via design_doc_list.json:
     - split layout → documents[].sections[key="data-dictionary"].file, then: grep "^### 8\." <that file> | wc -l
     - single layout / no registry → grep "### 8\." .design-docs/*.md | wc -l
```

- [ ] **Step 4: Annotate the system-design-doc integration box**

In the "📄 With system-design-doc skill" section, replace the `find . -name "*design*.md" …` line (~line 663) with:
```markdown
│  1. Resolve via registry: design_doc_list.json → documents[].sections[] │
│     (doc_layout:"split" → open only the needed section file)            │
│     fallback: find . -name "*design*.md" (single / no registry)         │
```
And under "⚠️ Important rules" of that section add:
```markdown
- If `design_doc_list.json` has `doc_layout:"split"` → resolve sections via `sections[]` and read ONLY the needed file (token-efficient); never `cat` the whole document
```

- [ ] **Step 5: Changelog + version banner**

Add a Changelog row at the top of the long-running changelog table:
```markdown
| 2.9.0 | 2026-05-29 | system-design-doc split-layout awareness: `/continue` (coding-agent-guide) resolves design sections via `design_doc_list.json` `documents[].sections[]` and reads only the needed file; Verification Pipeline Step 2 DD-count is layout-aware (greps the resolved `08-data-dictionary.md`). Requires `design_doc_list.json >= 2.3.0` for split; lower/absent falls back to single-file `find`. |
```
Update the top version banner line `> **Version 2.6.0** - …` is stale vs plugin.json; leave prior banners but add a new top line:
```markdown
> **Version 2.9.0** - system-design-doc split-layout awareness (resolve sections via registry; layout-aware Verification Pipeline Step 2 DD-count)
```

- [ ] **Step 6: Bump plugin.json**

In `plugins/long-running/.claude-plugin/plugin.json` replace `"version": "2.8.0",` → `"version": "2.9.0",`.

- [ ] **Step 7: Run the acceptance check → expect PASS**

`Grep "doc_layout" SKILL.md` (long-running) → ≥2. `Grep "2.9.0" SKILL.md` → ≥1. `Grep "sections\[" SKILL.md` → ≥1. `Grep "\"version\": \"2.9.0\"" plugin.json` → 1.

- [ ] **Step 8: Commit**

```bash
git add plugins/long-running/skills/long-running/SKILL.md plugins/long-running/.claude-plugin/plugin.json
git commit -m "feat(long-running): split-layout aware design-doc reads + Verification Pipeline; plugin 2.9.0"
```

---

## Task 11: Final validation pass (spec §9 scenarios)

**Files:** none (verification only)

- [ ] **Step 1: Schema sanity** — Read `templates/design_doc_list.json`; confirm valid JSON, `schema_version` 2.3.0, `sections[]` has 10 entries with keys matching the enum. If `node` available, `JSON.parse` it.

- [ ] **Step 2: Template completeness** — `Glob templates/sections/*.md` → 10; `Grep "^<!-- sdd-section:" templates/sections` → 10; `Grep -L "← Back to Index" templates/sections/*.md` → none missing the backlink.

- [ ] **Step 3: Grep contract** — In `templates/sections/08-data-dictionary.md`, `Grep "^### 8\."` → ≥1. In `02-requirements.md`, `Grep "^### Use Case \(UC-\d+\):"` → ≥1 and `Grep "^AC-\d+:" -i` matches the inline AC example.

- [ ] **Step 4: Consumer wiring** — `Grep "sections\[" plugins/long-running/skills/long-running/references/coding-agent-guide.md plugins/long-running/skills/long-running/SKILL.md` → ≥1 each.

- [ ] **Step 5: Cross-reference consistency** — confirm the section-key enum is identical in: `design_doc_list.json` (`metadata.section_keys`), SKILL.md (R36 + Reading Protocol), coding-agent-guide.md, split-design-doc.md, validate-design-doc.md. Fix any drift.

- [ ] **Step 6: Versions** — `Grep "\"version\"" plugins/system-design-doc/.claude-plugin/plugin.json` → 2.1.0; same for long-running → 2.9.0.

- [ ] **Step 7: Final commit (docs/marker tidy if any)**

```bash
git add -A
git commit -m "chore(system-design-doc,long-running): final cross-reference + version consistency for split-doc"
```

---

## Self-Review (completed by plan author)

**Spec coverage:** D1 split structure → Tasks 1,2,3,8. D2 single DD file → Task 2 (one `08-data-dictionary.md`). D3 doc_layout + migration → Tasks 1,6, backward-compat in 9,10. Registry §5 → Task 1. system-design-doc commands §6 → Tasks 3-8. long-running §7 → Tasks 9,10. Validation §9 → Task 11. DD-heading risk (§11) → Task 5 Step 4. ✓ no gaps.

**Placeholder scan:** `__PROJECT_NAME__` etc. are template tokens (intentional, replaced by generators), not plan placeholders. `[project-slug]` in JSON examples mirrors the existing template's `[project-name]` convention. No "TBD/TODO/implement later/handle edge cases". ✓

**Type/name consistency:** section keys, file pattern `NN-<key>.md`, marker `<!-- sdd-section: … -->`, registry shape, and `doc_layout` values are identical across all tasks (locked in Shared Contracts). `08-data-dictionary.md` + `^### 8\.` grep used consistently in Tasks 5, 9, 10, 11. ✓
