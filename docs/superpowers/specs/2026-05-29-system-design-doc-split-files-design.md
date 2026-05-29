# System Design Doc — Split Into Per-Section Files (Design Spec)

**Date**: 2026-05-29
**Author**: Claude (brainstormed with Mounchons)
**Status**: Draft → awaiting user review
**Affected plugins**: `system-design-doc` (v2.0.0 → 2.1.0), `long-running` (v2.8.0 → 2.9.0)

---

## 1. Problem Statement

`system-design-doc` produces a **single monolithic** `.design-docs/system-design-[project].md` containing all 10 sections. The empty template alone is ~800 lines; a real project (e.g. Wareo WMS) runs into thousands of lines.

Consequences:
- **Token waste**: any consumer that needs *one* section (e.g. `long-running` reading only the Data Dictionary for the entity it is implementing) must load the entire file.
- **No section→file map**: `design_doc_list.json` `documents[].file_path` points to one file; `sections_completed/pending[]` are bare strings — there is no way to open just the part you need.
- **Brittle consumer lookup**: `long-running` `/continue` uses `find . -name "*design*.md"` + `cat` whole-file + `grep "### 8\."` across `*.md`.

## 2. Goals / Non-Goals

**Goals**
- Split design-doc output into per-section files so consumers read only what they need.
- Make `design_doc_list.json` a **section registry** (section → file path + status) — the machine source of truth.
- Update `long-running` to resolve section files via the registry instead of `find`+cat-all.
- Preserve backward compatibility with existing single-file docs.

**Non-Goals**
- No change to the *content* of the 10 sections (FR/NFR/AC/UC, ER, DD, etc. stay identical in meaning).
- No per-table or per-module Data Dictionary split (user chose single DD file). Schema must not *preclude* it later, but we do not build it now (YAGNI).
- No separate `.mmd` diagram files — Mermaid stays inline in its section file (reading the section gives the needed context).
- `sitemap.json` is unchanged (already machine-readable).

## 3. Decisions (confirmed with user)

| # | Decision | Choice |
|---|----------|--------|
| D1 | Split granularity & location | **Per-section + index**, one file per section inside a per-project subfolder `<project-slug>/`, plus `00-index.md` |
| D2 | Data Dictionary granularity | **One file** `08-data-dictionary.md` (whole DD) |
| D3 | Legacy single-file docs | **Support both** via `doc_layout` field; new docs default to `split`; opt-in `/split-design-doc` migration |

## 4. Architecture

### 4.1 Directory Layout

```
.design-docs/
├─ design_doc_list.json          # section registry (machine source of truth)
├─ sitemap.json                  # unchanged
└─ <project-slug>/               # e.g. hr-management/  (kebab-case of project name)
   ├─ 00-index.md                # human TOC + status + links to every section
   ├─ 01-introduction.md
   ├─ 02-requirements.md         # FR / NFR / BR / AC / UC (kept together)
   ├─ 03-modules.md
   ├─ 04-data-model.md
   ├─ 05-dfd.md
   ├─ 06-flow-diagrams.md
   ├─ 07-er-diagram.md
   ├─ 08-data-dictionary.md
   ├─ 09-sitemap.md
   └─ 10-permissions.md
```

Multiple design docs per repo → multiple `documents[]` entries, each with its own `doc_dir`.

### 4.2 Naming Contract (FIXED — tools depend on it)

- File pattern: `NN-<section-key>.md`, `NN` = zero-padded section number.
- Canonical `section-key` enum (order fixed):
  `introduction(01), requirements(02), modules(03), data-model(04), dfd(05), flow-diagrams(06), er-diagram(07), data-dictionary(08), sitemap(09), permissions(10)`.
  Index file is `00-index.md` (key `index`).
- `<project-slug>` = kebab-case of `project_name`.

### 4.3 Section File Format

Every section file:
1. Machine marker (HTML comment) on line 1 — lets a tool verify identity without parsing:
   `<!-- sdd-section: data-dictionary | doc: hr-management | schema: 2.3.0 -->`
2. H1 with the section number + title, then a "← Index" backlink:
   ```markdown
   <!-- sdd-section: data-dictionary | doc: hr-management | schema: 2.3.0 -->
   # 8. Data Dictionary

   > [← Index](00-index.md) · System Design Document — HR Management

   ## 8. Data Dictionary
   ### 8.1 Table: users
   ...
   ```
3. **Section numbering is preserved inside the file** (`## 8.`, `### 8.1`). This is the key backward-compat lever: every existing regex (`### 8.`, `^### Use Case \(UC-\d+\):`, `^AC-\d+:`) still matches **within the resolved file** — only the *which file* changes, never the *content contract*.

> Because AC + UC live in section 02, `qa-trace`'s AC/UC greps must target `02-requirements.md` (resolved via registry), not the whole doc.

### 4.4 Index File (`00-index.md`)

Human-facing entry point, generated from the registry:
- Project metadata table (name, version, date, status, `doc_layout`).
- "Reading protocol" note for AI agents: *open only the section file you need; the machine map is `design_doc_list.json` → `documents[].sections[]`.*
- TOC table: section # · title · file link · status (✅/🔲) · key counts (e.g. DD → N tables).

## 5. `design_doc_list.json` — Section Registry (schema 2.2.0 → **2.3.0**)

### 5.1 `documents[]` entry additions

```json
{
  "id": "DOC-001",
  "name": "HR Management System",
  "doc_layout": "split",                         // NEW: "single" | "split" (new docs default "split")
  "doc_dir": "hr-management",                    // NEW: folder for split; null for single
  "file_path": "hr-management/00-index.md",      // split → index; single → the one .md (back-compat)
  "sections": [                                   // NEW: the registry
    {
      "key": "er-diagram",
      "number": 7,
      "title": "ER Diagram",
      "file": "hr-management/07-er-diagram.md",
      "status": "completed",                      // draft | in-progress | completed
      "anchors": ["### 7."],                      // optional grep hints for sub-items
      "updated_at": "2026-05-29T10:00:00Z"
    },
    {
      "key": "data-dictionary",
      "number": 8,
      "title": "Data Dictionary",
      "file": "hr-management/08-data-dictionary.md",
      "status": "completed",
      "anchors": ["### 8."],
      "updated_at": "2026-05-29T10:00:00Z"
    }
    // ... all 10 sections
  ],
  "sections_completed": [...],                    // KEPT, derived from sections[].status (back-compat)
  "sections_pending": [...],                      // KEPT, derived
  "...": "(existing fields: acceptance_criteria[], use_cases[], statistics, etc. unchanged)"
}
```

### 5.2 `diagrams.*.file_path` become meaningful

These were always `null`. Now they point into the split section files:
- `diagrams.er_diagram.file_path` → `"hr-management/07-er-diagram.md"`
- `diagrams.sitemap.file_path` → `"hr-management/09-sitemap.md"`
- `diagrams.dfd.level_0.file_path` → `"hr-management/05-dfd.md"`
- `diagrams.flow_diagrams[].file_path` / `sequence_diagrams[].file_path` → `"hr-management/06-flow-diagrams.md"` (or the relevant file)

### 5.3 Top-level / metadata

- `schema_version`: `"2.2.0"` → `"2.3.0"`
- `metadata.schema_version`: `"2.3.0"`; `metadata.plugin_version`: `"2.1.0"`
- `metadata.doc_layout_default`: `"split"` (NEW)
- `metadata.section_keys`: array enumerating the canonical keys + file-pattern note (NEW)
- `validation_rules`: add `sections_must_match_disk: true` (NEW)

## 6. `system-design-doc` Changes

### 6.1 Commands that WRITE docs

| Command | Change |
|---------|--------|
| `create-design-doc.md` | Step 6/7 rewritten: emit per-section files + `00-index.md`; populate `sections[]`; set `doc_layout:"split"`, `doc_dir`. **Also fix the stale Step-7 JSON example** (it predates schema 2.2.0). |
| `reverse-engineer.md` | Same split output + registry. |
| `import-plan.md` | Same split output + registry. |
| `create-diagram.md` | Write/update only the relevant section file (ER→07, Sitemap→09, …); update that `sections[]` entry + `diagrams.*.file_path`. |
| `edit-section.md` | Resolve the **single** section file via registry by key; read/edit only that file (replaces `grep -A 100 "## 7."` over the monolith). Cross-section consistency reminders now name sibling files. |

### 6.2 `validate-design-doc.md` — cross-FILE validation

- **Registry ↔ disk** (bidirectional): every `sections[].file` exists; every `NN-*.md` in `doc_dir` appears in `sections[]`.
- **Index completeness**: `00-index.md` links every section file.
- **ER ↔ DD** bidirectional now reads `07-er-diagram.md` + `08-data-dictionary.md` (two files).
- **Numbering continuity** now checked *within* each file (e.g. DD `### 8.x` sequential).
- **Marker check**: each file's `sdd-section` marker matches its filename/registry key.

### 6.3 New command `split-design-doc.md`

Opt-in migration `single` → `split`:
1. Read `documents[]` entry (or detect the monolith via `find`).
2. Parse the monolith by top-level `## N.` headings into the 10 sections.
3. Write `<project-slug>/NN-<key>.md` (add marker + backlink) + generate `00-index.md`.
4. Build `sections[]`, set `doc_layout:"split"`, `doc_dir`, repoint `file_path` to the index, fill `diagrams.*.file_path`.
5. Keep the original as `system-design-[project].md.bak` (do not delete).
6. Print a summary + reminder to `git add` the new folder.

### 6.4 `SKILL.md`

- "Output Files" section → new split layout diagram + naming contract.
- Add **"Reading Protocol for Consumers"** documenting `sections[]` as the contract.
- New CRITICAL RULES:
  - **R36** — section files must follow the `NN-<section-key>.md` naming contract.
  - **R37** — `sections[]` must match files on disk (bidirectional); no orphan registry entry or unregistered file.
  - **R38** — `00-index.md` must link every section file.
- Adjust grep-based rules to be per-file (numbering continuity *within* a file).
- Version history → 2.1.0 entry.

### 6.5 Templates

- New `templates/sections/NN-<key>.md` (10 section templates, carved from the current `design-doc-template.md`, each with marker + backlink).
- New `templates/index-template.md`.
- Keep `templates/design-doc-template.md` as the **legacy single-file** template (used only when `doc_layout:"single"`); add a header note marking it legacy.

## 7. `long-running` Changes (the "reference split files correctly" requirement)

### 7.1 `references/coding-agent-guide.md`

- **Step 0 / Step 1** design-doc lookup rewritten:
  ```
  1. Read .design-docs/design_doc_list.json
  2. For the relevant document, read documents[].doc_layout:
     - "split": resolve the needed section from sections[] (by key) → read ONLY that file
               e.g. need schema → open sections[key="data-dictionary"].file
     - "single" or field absent: legacy — read the one .md
  3. No JSON at all: fallback to `find . -name "*design*.md"` (legacy)
  ```
- DD table count: split → `grep "^### 8\." <doc_dir>/08-data-dictionary.md`; single → existing whole-file grep.

### 7.2 `SKILL.md` — Verification Pipeline Step 2 (Design Doc Compliance)

- "HOW TO CHECK" updated to be layout-aware: resolve the DD file from the registry, then grep that file (instead of `grep "### 8\." .design-docs/*.md`).
- Integration ASCII box (ER Diagram → Database Schema …) gains a note: *files resolved via `design_doc_list.json` `sections[]`; read only the needed section file.*

### 7.3 Version

- `plugin.json` 2.8.0 → **2.9.0**; add SKILL.md changelog entry "split-doc awareness; resolve sections via registry; layout-aware DD grep". Compat note: `design_doc_list.json >= 2.3.0` enables split; lower → single fallback.

## 8. Backward Compatibility & Detection

| Situation | Behavior |
|-----------|----------|
| JSON has `doc_layout:"split"` | Use registry, read per-section files |
| JSON has `doc_layout:"single"` | Read the single `file_path` |
| JSON present, `doc_layout` absent (pre-2.3.0) | Treat as `single` |
| No `design_doc_list.json` | Fallback `find *design*.md` (current behavior) |

Because section numbering is preserved inside files, all existing regexes keep matching once the correct file is opened — migration is non-destructive.

## 9. Validation Scenarios (acceptance — this is MD/JSON, no build)

1. **Schema**: updated `design_doc_list.json` template validates against schema 2.3.0 notes (ajv).
2. **Generate**: `/create-design-doc` on a sample → `00-index.md` + 10 section files + `sections[]` populated + `doc_layout:"split"`.
3. **Round-trip**: a sample single-file doc → `/split-design-doc` → 10 files + `00-index.md` + registry; concatenating sections in order reproduces the original content.
4. **Consumer sim**: given the registry, resolving `key="er-diagram"` returns the correct file path for both `split` and `single` layouts.
5. **Grep contract**: `### 8.` matches inside `08-data-dictionary.md`; `^### Use Case \(UC-\d+\):` and `^AC-\d+:` match inside `02-requirements.md`.
6. **Cross-file validation**: an ER entity absent from the DD is flagged across `07`/`08`; an unregistered `NN-*.md` file is flagged (R37).
7. **Backward compat**: a pre-2.3.0 JSON (no `doc_layout`) is read as single by `long-running` without error.

## 10. File-by-File Change Inventory (scope)

**system-design-doc**
- `commands/create-design-doc.md` · `reverse-engineer.md` · `import-plan.md` · `create-diagram.md` · `edit-section.md` · `validate-design-doc.md`
- `commands/split-design-doc.md` (NEW)
- `skills/system-design-doc/SKILL.md`
- `skills/system-design-doc/templates/design_doc_list.json` (schema 2.3.0)
- `skills/system-design-doc/templates/sections/01..10-*.md` (NEW) · `templates/index-template.md` (NEW) · `templates/design-doc-template.md` (mark legacy)
- `.claude-plugin/plugin.json` (2.1.0)
- (check) `commands/help.md`, `references/document-sections.md` — add file-mapping note

**long-running**
- `skills/long-running/references/coding-agent-guide.md`
- `skills/long-running/SKILL.md` (Verification Pipeline Step 2 + integration box + changelog)
- `.claude-plugin/plugin.json` (2.9.0)

## 11. Risks / Open Questions

- **Other commands** (`sync-with-mockups`, `sync-with-features`, `sync-with-qa-tracker`, `validate-integration`, the `sitemap-*` family) read the design doc indirectly — audit each during planning for whole-file assumptions.
- **Pre-existing version drift**: long-running SKILL.md frontmatter says 2.6.0 while plugin.json says 2.8.0. Out of scope to fully reconcile; we only add our changelog entry.
- **`<project-slug>` collisions** for multiple docs — slug must be unique within `.design-docs/`; `create-design-doc` should append a numeric suffix on collision.
- **DD heading format must be consistent for the table-count grep**: the table-count contract relies on `### 8.x Table: <name>` headings, but `edit-section.md`'s current DD example uses `### Table: payments` (no `8.x` number) which would **not** match `### 8.`. Planning must standardize DD table headings to the numbered form so `grep "^### 8\."` counts correctly in both layouts.
