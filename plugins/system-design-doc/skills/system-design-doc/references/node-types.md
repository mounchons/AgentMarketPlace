# sitemap.json — 8 Node Types Reference

> **Schema source**: `references/sitemap-schema.json`
> **Spec**: `docs/superpowers/specs/2026-05-07-system-design-doc-vscode-design.md`

---

## Two Layers

| Layer | Purpose |
|-------|---------|
| **Design System** | Reusable building blocks (Master/Template/Nav/Component) |
| **Application** | Concrete instances (Page/API/Middleware/External Function) |

## ID Prefixes

| Prefix | Type | Layer |
|--------|------|-------|
| `MP-NNN`  | Master Page | Design System |
| `TPL-NNN` | Page Template | Design System |
| `NAV-NNN` | Nav Template | Design System |
| `CMP-NNN` | Component | Design System |
| `P-NNN`   | Page | Application |
| `API-NNN` | API Endpoint | Application |
| `MW-NNN`  | Middleware | Application |
| `EXT-NNN` | External Function | Application |

All IDs use 3-digit zero-padded format (consistent with existing AC-NNN / UC-NNN).

---

## Layer 1 — Design System

### Master Page (MP-NNN)
Overall chrome shared across pages: sidebar + topbar + profile + footer.

```json
{
  "id": "MP-001",
  "name": "AdminLayout",
  "description": "Sidebar + topbar + profile dropdown chrome for authenticated admin pages",
  "source_file": ".mockups/html/master-page.js",
  "css_file": ".mockups/html/master-page.css",
  "regions": ["sidebar", "topbar", "main", "profile"]
}
```

### Page Template (TPL-NNN)
Page archetype that pages instantiate (ListPage, DetailPage, FormPage, DashboardPage).

```json
{
  "id": "TPL-001",
  "name": "ListPage",
  "uses_master": "MP-001",
  "default_components": ["CMP-001", "CMP-002"]
}
```

### Nav Template (NAV-NNN)
Navigation pattern (`type` ∈ sidebar | navbar | breadcrumb | tabs | footer).

```json
{
  "id": "NAV-001",
  "name": "PrimarySidebar",
  "type": "sidebar",
  "items": [
    { "label": "Orders", "url": "/orders", "page_ref": "P-001" }
  ]
}
```

### Component (CMP-NNN)
Reusable UI building block.

```json
{
  "id": "CMP-001",
  "name": "DataTable",
  "category": "data-display",
  "props_schema": { "columns": "ColumnDef[]", "data": "T[]" }
}
```

---

## Layer 2 — Application

### Page (P-NNN)
Concrete page instance — must reference a Master + Template + Components.

Required fields: `id`, `name`, `url`.
Optional cross-refs: `uses_master` (MP-), `uses_template` (TPL-), `uses_components[]` (CMP-),
`calls_apis[]` (API-), `ac_refs[]` (AC-), `uc_refs[]` (UC-).

Drilldown payload (`linked_artifacts`):
- `mockups`: paths to mockup files
- `features`: refs into `feature_list.json`
- `qa_scenarios`: refs into `qa-tracker.json`
- `test_cases_count`: integer count
- `code_files`: paths to source code

Sequence/pipeline payload (`stage_status[]`): one entry per applicable stage from `workflow_stages`.

### API Endpoint (API-NNN)
Internal HTTP/WS endpoint.

Required: `id`, `method` (GET/POST/PUT/PATCH/DELETE/HEAD/OPTIONS/WS), `path`.
Cross-refs: `middlewares[]` (MW-), `calls_external[]` (EXT-), `called_by_pages[]` (P-).

### Middleware (MW-NNN)
Cross-cutting pipeline component.

Required: `id`, `name`, `type` (auth | rate-limit | logging | cors | validation | compression | exception-handler | other).

### External Function (EXT-NNN)
3rd-party / out-of-system function.

Required: `id`, `name`, `kind` (3rd-party-api | webhook-out | webhook-in | cron | queue | cloud-function).

---

## Edge Types

| Type | From → To | Meaning |
|------|-----------|---------|
| `calls` | Page → API | Page invokes API |
| `guarded-by` | API → Middleware | Middleware applied to API |
| `calls-external` | API → External | API calls external service |
| `uses-master` | Page → Master | Page uses chrome |
| `uses-template` | Page → Template | Page is instance of template |
| `uses-component` | Page → Component | Page uses component |
| `has-nav` | Master → Nav | Master contains nav |
| `links-to` | Nav → Page | Nav item links to page |

---

## See Also

- `references/sitemap-schema.json` — full JSON Schema
- `references/sitemap-validation-rules.md` — R31-R35 + integration rules
- `templates/sitemap-template.json` — empty starter
