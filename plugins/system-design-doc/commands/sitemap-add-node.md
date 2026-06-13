---
description: Add a new node (page/api/middleware/external/master/template/nav/component) to sitemap.json
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*)
---

# /sitemap-add-node

Add a new node to `.design-docs/sitemap.json` and assign next-available ID.

## Usage

```
/sitemap-add-node page name="Order List" url="/orders" access_level="User"
/sitemap-add-node api  method="GET" path="/api/orders" controller="OrdersController.GetAll"
/sitemap-add-node middleware name="JwtAuth" type="auth" applies_to="all-api"
/sitemap-add-node external name="Stripe Charge" kind="3rd-party-api" provider="Stripe"
/sitemap-add-node master name="AdminLayout" source_file=".mockups/html/master-page.js"
/sitemap-add-node template name="ListPage" uses_master="MP-001"
/sitemap-add-node nav name="PrimarySidebar" type="sidebar"
/sitemap-add-node component name="DataTable" category="data-display"
```

## Process

### Step 1: Parse arguments
- First positional arg = node type ∈ {page, api, middleware, external, master, template, nav, component}
- Remaining = `key=value` pairs → field assignments

### Step 2: Resolve next ID
Map node type → ID prefix:

| Type | Prefix | Array path |
|------|--------|-----------|
| page | P- | `application.pages` |
| api | API- | `application.apis` |
| middleware | MW- | `application.middlewares` |
| external | EXT- | `application.external_functions` |
| master | MP- | `design_system.masters` |
| template | TPL- | `design_system.templates` |
| nav | NAV- | `design_system.navs` |
| component | CMP- | `design_system.components` |

```
existing_ids = all id values in target array
next_num = max(parse last 3 digits) + 1 (or 001 if empty)
new_id = "{PREFIX}-{next_num zero-padded to 3 digits}"
```

### Step 3: Construct node object
- Set `id` = resolved ID
- Set required fields from args
- Validate against `${CLAUDE_PLUGIN_ROOT}/skills/system-design-doc/references/sitemap-schema.json` definition (`#/definitions/<type>`)

If validation fails → print error + exit (do not write file).

### Step 4: Append + update metadata
- Append node to target array
- Update `last_synced_at` = now
- Update `last_modified_by` = "claude"
- Recompute `etag`

### Step 5: Write + re-validate full file

```bash
npx ajv -s ${CLAUDE_PLUGIN_ROOT}/skills/system-design-doc/references/sitemap-schema.json \
  -d .design-docs/sitemap.json --strict=false
```

### Step 6: Output

```
✅ Added P-005 "Customer Detail" → application.pages

📊 Sitemap stats:
   Pages: 5 · APIs: 8 · Middlewares: 3 · External: 2
   Design System: 1M / 2T / 1N / 5C

💡 Next: /sitemap-link from=P-005 to=API-008 type=calls
```

> 💬 Note: Responds in Thai.
