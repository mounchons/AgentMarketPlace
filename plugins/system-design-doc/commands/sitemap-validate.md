---
description: Validate sitemap.json schema + R31-R35 cross-validation rules
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*)
---

# /sitemap-validate

Run schema validation + R31-R35 programmatic checks against `.design-docs/sitemap.json`.

## Usage

```
/sitemap-validate                # default — warn on R33
/sitemap-validate --strict       # upgrade R33 (source_file missing) to error
```

## Process

### Step 1: Schema validation (ajv)

```bash
npx ajv -s ${CLAUDE_PLUGIN_ROOT}/skills/system-design-doc/references/sitemap-schema.json \
  -d .design-docs/sitemap.json --strict=false --all-errors
```

If schema validation fails → STOP, print errors, exit 1.

### Step 2: R31 — Page DS membership

```
DS_exists = sitemap.design_system.{masters|templates|navs|components} non-empty
For each page in pages:
  if DS_exists and !page.uses_master → ERROR "P-NNN missing uses_master (R31)"
  if DS_exists and !page.uses_template → WARN "P-NNN missing uses_template (R31)"
```

### Step 3: R32 — API mirror md ↔ sitemap

Parse Section 3.3 of design_doc_ref. Extract `(method, path)` from each `| METHOD | path | ... |` row. Build set MD_APIS.
```
sitemap_apis = set of (api.method, api.path)
For (m, p) in MD_APIS - sitemap_apis: ERROR "API in md not in sitemap: {m} {p} (R32)"
For (m, p) in sitemap_apis - MD_APIS: ERROR "API in sitemap not in md: {m} {p} (R32)"
```

### Step 4: R33 — source_file existence

```
For each node n with source_file:
  if !file_exists(workspace_root/n.source_file):
    if --strict: ERROR
    else:        WARN "Stale source_file in {n.id}: {n.source_file} (R33)"
```

### Step 5: R34 — Orphan edges

```
all_ids = union of node.id from design_system.* + application.*
For edge in edges:
  if edge.from not in all_ids: ERROR "Orphan edge.from {edge.from} (R34)"
  if edge.to   not in all_ids: ERROR "Orphan edge.to   {edge.to}   (R34)"
```

### Step 6: R35 — Cross-doc artifact integrity

For each `page.linked_artifacts`:
- For each `mockup_path` → look up in `.mockups/mockup_list.json` (if exists). Report ERROR if not found.
- For each `feature_ref = "feature_list.json#N"` → parse N → look up in `feature_list.json`. ERROR if not found.
- For each `qa_ref = "qa-tracker.json#scenario_id"` → look up. ERROR if not found.

Skip silently if downstream file is absent (project may not use that plugin yet).

### Step 7: Output report

```
🔍 sitemap.json Validation Report
─────────────────────────────────────
Schema:                    ✓ valid
R31 (DS membership):       ✓ 12 pages OK
R32 (API mirror):          ✓ 8 APIs match md ↔ sitemap
R33 (source_file):         ⚠ 2 stale (src/Old.tsx, src/Removed.cs)
R34 (orphan edge):         ✓ 0 orphans (42 edges)
R35 (cross-doc artifact):  ✗ 1 broken — P-005 → qa-tracker.json#OLD-001 not found

Summary: 3 ERROR · 2 WARN · 38 nodes · 42 edges
─────────────────────────────────────
Result: FAIL
```

Exit code: `0` if all pass, `1` if any ERROR.

> 💬 Note: Responds in Thai.
