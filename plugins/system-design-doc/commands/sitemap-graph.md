---
description: Render Mermaid graph from sitemap.json edges
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*)
---

# /sitemap-graph

Generate Mermaid `flowchart` graph from `.design-docs/sitemap.json` `edges[]` and embed/replace into Section 9.8 of the design doc.

## Usage

```
/sitemap-graph                  # render all node types into one graph
/sitemap-graph --types page,api # filter by node types
/sitemap-graph --to-stdout       # print to terminal, do not modify md
```

## Process

### Step 1: Read sitemap.json and design_doc_ref

### Step 2: Build node label map
For each node N in design_system + application:
- label = `{N.id}[{N.id} {N.name}]` (Mermaid node syntax)
- Optionally style by type (color)

### Step 3: Build edge lines
For each edge E in edges[]:
- Render: `{from} -->|{type}| {to}`
- Filter by `--types` if given

### Step 4: Wrap in Mermaid

```mermaid
flowchart LR
    classDef page fill:#3b82f6,color:white
    classDef api fill:#10b981,color:white
    classDef mw fill:#f59e0b,color:white
    classDef ext fill:#ec4899,color:white
    classDef master fill:#7c3aed,color:white
    classDef template fill:#8b5cf6,color:white
    classDef nav fill:#a78bfa,color:white
    classDef component fill:#c4b5fd

    P-001[P-001 Order List]
    API-001[API-001 GET /api/orders]
    P-001 -->|calls| API-001
    ...

    class P-001 page
    class API-001 api
```

### Step 5: Update md (if not --to-stdout)

Locate Section 9.8 in design_doc_ref. Replace existing Mermaid block (between ```mermaid and ```) with new content. Preserve surrounding prose.

### Step 6: Output

```
✅ Section 9.8 graph updated

   38 nodes rendered (12 pages, 18 APIs, ...)
   42 edges rendered

📁 Updated: .design-docs/system-design-app.md (Section 9.8)
```

> 💬 Note: Responds in Thai.
