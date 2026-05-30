# Reading system-design-doc Sources (registry-first, split-aware, JSON-preferred)

Canonical guide for how any `ui-mockup` command resolves design documents produced by the
`system-design-doc` plugin. Commands link here instead of duplicating this logic.

## 1. Resolution order

1. Read the registry: `.design-docs/design_doc_list.json`. If present, branch on `documents[].doc_layout`:
   - **`"split"` (default, schema ≥ 2.3.0)** → resolve per-section files through `documents[].sections[]`
     (match by `key`); base dir = `documents[].doc_dir`. Index = `<doc_dir>/00-index.md`.
   - **`"single"` / field absent (legacy)** → the whole doc is `documents[].file_path`.
2. Also read `.design-docs/sitemap.json` if present (machine-readable pages/nodes).
3. **Fallback (no registry)** — glob in this priority order:
   `.design-docs/*/00-index.md` → `system-design*.md` → `*sitemap*.md` → `requirements*.md` → `README.md`.

## 2. Golden rule — prefer JSON over markdown

These are machine-readable in `design_doc_list.json`; use them directly and only Read a section `.md`
when you need prose/diagram content:
`entities[]`, `diagrams.sitemap`, `acceptance_criteria[]`, `use_cases[]`, `api_endpoints[]`.

## 3. Canonical section resolver

```bash
# resolve a section file by key (sitemap, er-diagram, data-dictionary, requirements, modules, ...)
jq -r --arg k "sitemap" '.documents[0].sections[]|select(.key==$k)|.file' .design-docs/design_doc_list.json
```

Section keys: `introduction, requirements, modules, data-model, dfd, flow-diagrams, er-diagram,
data-dictionary, sitemap, permissions`. Files: `<doc_dir>/NN-<key>.md` (NN = zero-padded number).

## 4. Anchor contract

Inside a resolved section file, locate sub-content via `sections[].anchors[]` regex, e.g.
AC → `^AC-\d+:` ; UC header → `^### Use Case \(UC-\d+\):` ; section N → `### N.`.

## 5. related_documents path convention

- split → `.design-docs/<slug>/NN-<key>.md`
- single → `system-design.md#<anchor>`

## 6. Compatibility

Split-aware with `design_doc_list.json` schema ≥ `2.3.0`. Older/absent → use the fallback (§1.3).
