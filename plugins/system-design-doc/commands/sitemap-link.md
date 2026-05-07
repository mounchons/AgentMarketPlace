---
description: Add an edge between two nodes in sitemap.json
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*)
---

# /sitemap-link

Add an edge to `edges[]` array in `.design-docs/sitemap.json`.

## Usage

```
/sitemap-link from=P-001 to=API-001 type=calls
/sitemap-link from=API-001 to=MW-001 type=guarded-by
/sitemap-link from=API-005 to=EXT-001 type=calls-external
/sitemap-link from=P-001 to=MP-001 type=uses-master
```

## Edge type validation

`type` must be one of:
| type | from prefix | to prefix |
|------|-------------|-----------|
| `calls` | P- | API- |
| `guarded-by` | API- | MW- |
| `calls-external` | API- | EXT- |
| `uses-master` | P-, TPL- | MP- |
| `uses-template` | P- | TPL- |
| `uses-component` | P-, TPL- | CMP- |
| `has-nav` | MP- | NAV- |
| `links-to` | NAV- | P- |

## Process

### Step 1: Parse arguments
Extract `from`, `to`, `type` from `key=value` args.

### Step 2: Validate prefix combination
Check from/to prefixes against type table above. Reject if invalid.

### Step 3: Validate node existence
Read sitemap.json. Confirm both `from` and `to` exist in `design_system.*` or `application.*`. Reject if not found.

### Step 4: Check duplicate
Reject if `{from, to, type}` already exists in `edges[]`.

### Step 5: Append + sync cross-ref fields (best-effort)
For convenience, also update relevant cross-ref fields on the source node:
- `type=calls` → push `to` into `pages[].calls_apis`
- `type=guarded-by` → push `to` into `apis[].middlewares`
- `type=calls-external` → push `to` into `apis[].calls_external`
- `type=uses-master` → set `pages[].uses_master = to`
- `type=uses-template` → set `pages[].uses_template = to`
- `type=uses-component` → push `to` into `pages[].uses_components`

### Step 6: Update metadata + write + validate

### Step 7: Output

```
✅ Edge added: P-001 --calls--> API-001

📊 Edges: 12 total (4 calls, 3 guarded-by, 2 uses-master, ...)
```

> 💬 Note: Responds in Thai.
