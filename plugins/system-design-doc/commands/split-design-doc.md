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
`1→introduction, 2→requirements, 3→modules, 4→data-model, 5→dfd, 6→flow-diagrams, 7→er-diagram, 8→data-dictionary, 9→sitemap, 10→permissions`. The title block + Appendix go into the index.

### Step 3: Write split files

1. `<project-slug>` = kebab-case of project name; create `.design-docs/<project-slug>/`.
2. For each section, write `NN-<key>.md` = marker line + `# Section N — <Title>` + backlink + the parsed section content (preserve `## N.` / `### N.x` headings verbatim).
   - Marker: `<!-- sdd-section: <key> | doc: <project-slug> | schema: 2.3.0 -->`
3. Write `00-index.md` from `templates/index-template.md` (TOC links all 10 files; statuses ✅).

### Step 4: Update design_doc_list.json (schema 2.3.0)

Set the document's `doc_layout:"split"`, `doc_dir`, `file_path` → `<slug>/00-index.md`, build `sections[]` (status `completed` for every parsed section), set `diagrams.*.file_path`, sync `sections_completed` (use hyphenated section keys).

### Step 5: Preserve original + report

Rename the monolith to `system-design-<slug>.md.bak` (do not delete). Print a summary and remind the user to `git add .design-docs/<slug>/`.

## ⚠️ Rules

- Preserve section numbering inside files (grep contract).
- DO NOT delete the original — keep `.bak`.
- Round-trip safe: concatenating `01..10` in order reproduces the original section content.

> 💬 **Note**: This command responds in Thai (คำสั่งนี้จะตอบกลับเป็นภาษาไทย)
