---
description: Initialize .design-docs/sitemap.json from template
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*)
---

# /sitemap-init

Create a new `.design-docs/sitemap.json` from `${CLAUDE_PLUGIN_ROOT}/skills/system-design-doc/templates/sitemap-template.json`, substituting placeholders with project metadata.

## Usage

```
/sitemap-init
/sitemap-init --project-name "HR Management"
/sitemap-init --force      # overwrite existing
```

## Process

### Step 1: Pre-flight checks
```bash
# Check if .design-docs exists
test -d .design-docs || { echo "ERROR: .design-docs/ does not exist. Run /create-design-doc first."; exit 1; }

# Check if sitemap.json already exists
if [ -f .design-docs/sitemap.json ] && [ -z "$FORCE" ]; then
  echo "ERROR: .design-docs/sitemap.json already exists. Pass --force to overwrite."
  exit 1
fi
```

### Step 2: Resolve project metadata
1. If `--project-name` not given, read `.design-docs/design_doc_list.json` and use `documents[0].project_name`
2. Compute `project_slug` = lowercase + replace spaces with `-`
3. Compute `iso_timestamp` = current UTC time in ISO 8601
4. Compute `etag` = first 8 hex chars of SHA-256(`project_slug + iso_timestamp`)

### Step 3: Substitute template

Read `${CLAUDE_PLUGIN_ROOT}/skills/system-design-doc/templates/sitemap-template.json`, replace:
- `{PROJECT_SLUG}` → resolved slug
- `{PROJECT_NAME}` → resolved name
- `{ISO_TIMESTAMP}` → resolved timestamp
- `{INITIAL_ETAG}` → resolved etag

Write result to `.design-docs/sitemap.json`.

### Step 4: Validate output

```bash
# Schema validation
npx ajv -s ${CLAUDE_PLUGIN_ROOT}/skills/system-design-doc/references/sitemap-schema.json \
  -d .design-docs/sitemap.json --strict=false
```

Expected: `valid`

### Step 5: Output

```
✅ สร้าง .design-docs/sitemap.json สำเร็จ

📁 File: .design-docs/sitemap.json
📋 Project: {PROJECT_NAME}
🔖 Schema: 1.0.0
🏷️  ETag: {etag}

💡 Next steps:
  /sitemap-scan         → Auto-scan codebase to populate nodes
  /sitemap-add-node     → Add nodes manually
  /sync-sitemap         → Sync with md Section 9
```

> 💬 Note: Responds in Thai.
