---
description: Bidirectional sync between system-design-X.md (Section 9) and sitemap.json + pull downstream stats
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*)
---

# /sync-sitemap

Two-phase sync:
1. **md ↔ sitemap.json** — keep Section 9 tables and sitemap.json node arrays consistent
2. **Downstream pull** — refresh `linked_artifacts` and `stage_status` from `mockup_list.json`, `feature_list.json`, `qa-tracker.json`

## Usage

```
/sync-sitemap                       # full bidirectional sync
/sync-sitemap --to-md               # only sitemap → md
/sync-sitemap --from-md             # only md → sitemap
/sync-sitemap --pull-downstream     # only refresh stats
```

## Process

### Step 1: Determine direction

Compute timestamps:
- `md_mtime` = file mtime of design_doc_ref
- `json_modified` = sitemap.json `last_synced_at`

| md_mtime vs json_modified | Default action |
|--------------------------|-----------------|
| md newer | `--from-md` |
| json newer | `--to-md` |
| equal | both directions (idempotent) |

User flags override.

### Step 2: md → json (extract)

Parse design_doc_ref Section 9.4-9.7 tables:
- Section 9.4.1 Master Pages → upsert `design_system.masters`
- Section 9.4.2 Page Templates → upsert `design_system.templates`
- Section 9.4.3 Nav Templates → upsert `design_system.navs`
- Section 9.4.4 Components → upsert `design_system.components`
- Section 9.5 API Inventory → upsert `application.apis`
- Section 9.6 Middleware Inventory → upsert `application.middlewares`
- Section 9.7 External Functions → upsert `application.external_functions`
- Section 9.2 Page Inventory + 9.8 Edge Table → upsert `application.pages` + `edges`

Upsert rule: match by ID; if ID present in md but not json → add; if json but not md → preserve (warn); if both → md wins.

### Step 3: json → md (render)

Re-render Section 9.4-9.9 tables and Mermaid graph using sitemap.json data. Preserve user-authored prose between table headers.

### Step 4: Pull downstream stats

Read these files (skip if absent):
- `.mockups/mockup_list.json` → for each page in sitemap, look up mockup entry by URL or page_ref → write `linked_artifacts.mockups[]`
- `feature_list.json` → for each feature with `page_ref` matching a sitemap page → write into `linked_artifacts.features[]`
- `qa-tracker.json` → for each scenario with `page_id` → write into `linked_artifacts.qa_scenarios[]`

For each page, recompute `stage_status[]`:
- `design.status` = "done" (if page exists in sitemap)
- `mockup.status` = "done" if mockups[] non-empty, else "not-started"
- `code.status` = derived from feature_list[].status (done if all done, in-progress if any in-progress, etc.)
- `qa.status` = derived from qa-tracker[].status + pass rate
- `release.status` = "ready" if all upstream stages done, else "blocked" with `blocked_by`

Update `sync_status` block:
- `ui_mockup.covered` = pages with mockups, `gap` = pages without
- `long_running.covered` = pages/apis with features, `gap` = without
- `qa_tracker.covered_acs` = ACs with linked scenarios, `gap_acs` = without

### Step 5: Update metadata + write + validate

### Step 6: Output

```
✅ Sync complete

📤 md → json:  +2 APIs, +1 middleware
📥 json → md:  Section 9.5 table updated
📊 Downstream:
   ui_mockup:    12 covered, 3 gap
   long_running:  8 covered, 5 gap
   qa_tracker:   25/30 ACs covered

⚠️ Drift detected (resolved): API-007 was in md but missing from sitemap → added
```

> 💬 Note: Responds in Thai.
