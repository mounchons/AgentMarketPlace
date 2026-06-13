---
description: Auto-scan codebase to populate sitemap.json nodes
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*), Task(*)
---

# /sitemap-scan

Auto-discover Pages / APIs / Middlewares / External Functions / Components from codebase and populate `.design-docs/sitemap.json`.

Inherits framework detection logic from `/reverse-engineer` (see `${CLAUDE_PLUGIN_ROOT}/skills/system-design-doc/references/codebase-analysis.md`).

## Usage

```
/sitemap-scan                          # full scan
/sitemap-scan --types page,api          # only specific types
/sitemap-scan --dry-run                 # show what would be added without writing
```

## Process

### Step 1: Pre-flight
- Assert `.design-docs/sitemap.json` exists (if not, suggest `/sitemap-init`)
- Detect framework (`.csproj` → .NET, `package.json` → Node, etc.)

### Step 2: Discover by type

For each requested type, run framework-specific discovery:

| Type | .NET pattern | Node pattern | Python pattern |
|------|--------------|--------------|----------------|
| page | `**/Pages/*.razor`, `**/Views/*.cshtml`, `**/*Page.tsx` | `pages/**/*.tsx`, `app/**/page.tsx` | `templates/**/*.html` |
| api | `**/Controllers/*.cs` (actions) | `routes/**/*.js`, `app/api/**/route.ts` | `**/views.py`, `**/urls.py` |
| middleware | `**/Middlewares/*.cs` | `middlewares/**/*.js` | `**/middleware.py` |
| external | `**/Services/External/*.cs`, IHttpClient | `lib/clients/**/*.ts` | `**/clients/*.py` |
| component | `**/Components/*.tsx`, `*.razor` | `components/**/*.tsx` | n/a |

For each match:
- Generate ID using slug-of-name + counter
- Extract: name (from class/file), path (URL for page/api), source_file
- Construct node object with required fields filled

### Step 3: Detect cross-references (edges)

For pages:
- Grep file content for `fetch('/api/...')`, `axios.get('/api/...')`, `HttpClient.GetAsync(...)` → infer Page → API edges (type=calls)
- Grep for component imports → infer Page → Component edges (type=uses-component)

For APIs:
- Grep for `[Authorize]`, `app.UseMiddleware<X>` → infer API → MW edges (type=guarded-by)
- Grep for HttpClient calls inside controller → infer API → EXT edges (type=calls-external)

### Step 4: Diff against existing sitemap

For each discovered node:
- If ID matches existing → skip (or merge if `--update` flag)
- If new → append to staging list

### Step 5: Show plan (always show before writing)

```
📋 Scan plan:
  Pages:       discovered=12  new=4  existing=8
  APIs:        discovered=18  new=10 existing=8
  Middlewares: discovered=3   new=3  existing=0
  External:    discovered=2   new=2  existing=0
  Components:  discovered=15  new=15 existing=0
  Edges:       inferred=42    new=42

  New page IDs: P-009, P-010, P-011, P-012
  New API IDs:  API-009, API-010, ...
```

### Step 6: Apply (skip if --dry-run)

Write merged sitemap.json. Update metadata. Re-validate.

### Step 7: Output summary

```
✅ Scan complete

   +4 pages, +10 APIs, +3 middlewares, +2 external, +15 components, +42 edges
   Total: 38 nodes, 42 edges

⚠️ Warnings:
   - 2 components have no source_file detected
   - 1 page references API-099 which does not exist (broken edge skipped)

💡 Next: /sitemap-validate
```

> 💬 Note: Responds in Thai.
