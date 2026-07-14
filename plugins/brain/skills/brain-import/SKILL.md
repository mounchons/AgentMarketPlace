---
name: brain-import
description: "Import an Open Knowledge Format (OKF v0.1) bundle into Graph Brain — parse markdown + YAML frontmatter into notes + LINKS_TO, every tag passes the Tag Taxonomy write gate, dry-run report is the default with explicit user confirmation before any write. Accepts bundles from brain-export, other teams, or external enrichment agents.
  USE THIS SKILL when the user wants to import a knowledge bundle, ingest OKF files into brain, restore an exported bundle, or merge external knowledge into the graph.
  Thai triggers: 'import ความรู้', 'import brain', 'นำเข้า bundle', 'รับ OKF เข้า brain', 'เอาความรู้เข้า brain', 'restore bundle'"
user_invocable: true
argument-hint: "[bundle-dir] [--project <name>] [--no-overwrite] — default bundle: .brain-export/{basename of cwd}/"
---

# Brain Import (OKF Bundle)

ALL responses MUST be in Thai language.

**Graph Protocol:** Follow `${CLAUDE_PLUGIN_ROOT}/GRAPH_PROTOCOL.md` — **§8 OKF Interchange Mapping (the core rules of this skill — reverse mapping §8.2, link import §8.3, MOC import §8.4, write gate §8.5)**, §1 Save Rules (Tag Taxonomy), §2 upsert semantics, §6.3 secret check, §7.1 propose-don't-execute

## Why a Write Gate (the heart of this skill)

Import is the risky side of interchange — the bundle comes from outside (another team / enrichment agent / old files) and then **writes into the graph**:

- a secret leaked into the graph **cannot be permanently deleted** (version history keeps everything — §6) → must scan before writing
- tags distorted from an external bundle spread into the shared central taxonomy used by every project → every tag passes the Tag Taxonomy (§1)
- **dry-run is always the default, with no flag to skip it** — summarize everything that will happen first, then the user confirms before writing (propose-don't-execute §7.1)

## Mode Detection

| Input | Mode |
|---|---|
| (no args) | bundle = `.brain-export/{basename of cwd}/` (match the subdirectory name **case-insensitively** — the project name in the graph may differ in casing from cwd); not found but `.brain-export/` has a single subdirectory → offer it; none → ask the user to specify a path |
| `{dir}` | import the bundle from the specified directory |
| `--project <name>` | target project override (default: `project` field in the bundle → basename of cwd) |
| `--no-overwrite` | title collides with an existing note → **skip** that note (default = upsert per §2) |

## Steps

### Phase A — Parse (read-only, does not touch the graph yet)

1. **Resolve bundle + target project**
   - validate the bundle: the directory exists + has at least 1 `.md` file — otherwise → notify the user and stop
   - source project = frontmatter `project` of `index.md` (fallback: the first file that has this field; none at all = bundle from another system)
   - target project = `--project` > source project > basename of cwd — **source ≠ target → always ask the user to confirm first** (guard against pouring knowledge into the wrong project)
   - MCP down/unresponsive → notify the user and stop; do not retry in a loop (never block)

2. **Walk + parse every `.md` file** (recursive)
   - **reserved files (`index.md`/`log.md`) do not go through the "must have `type`" rule** (SPEC.md §9 — only non-reserved files require frontmatter) → route them to step 3 (index.md) or the log.md handling below; do not count them as a parse fail for lacking `type`
   - concept file (any other `.md`): frontmatter must have at least `type` (minimum OKF) — all other fields optional
   - **title (identity — §8.1):** frontmatter `title` → if missing use the first H1 in the body → if still missing convert the filename slug back (`-`→space, capitalize words) — the latter two cases must be flagged in the dry-run report as a guessed identity
   - per-file parse fail (broken frontmatter / no `type` / tags is a YAML block list the parser cannot read — **must not swallow tags silently**, count it as a parse fail) → skip that file + list it in the report (per-file degrade — must not fail the whole import over one file)
   - `log.md` **without frontmatter `title`** (OKF optional change history) → skip, do not import as a note — brain already has NoteHistory + list it in the report; a `log.md` with a full frontmatter title = a real note whose slug happens to be log (older export) → import normally
   - **> 100 files → warn about token/call cost** (must `save-knowledge` one by one) then ask the user first; offer an alternative: import only some directories

3. **Classify `index.md` per §8.4 (Import rules — v3.4.1 comment-based)**
   - **root `index.md` — read `okf_version` first (§8.6):** no field → pre-declaration bundle (import may continue + note it in the report); major `0` (`0.1`) → normal; major ≠ `0` (`1.x`) → **warn in the dry-run** that the bundle targets a spec newer than brain v3.4.1 (mapping §8 may drop fields) and have the user confirm
   - body first line `<!-- okf:moc -->` **or** (legacy v3.4.0) frontmatter `title` matching the MOC pattern (`"{Project} — MOC (Map of Content)"` / `"{Project} — MOC: {Category}"`) → create/update a **MOC note**: title = frontmatter `title` if present, otherwise reconstruct from target + position (root → `"{target} — MOC (Map of Content)"`; `{category}/` → `"{target} — MOC: {TitleCase(category)}"`); source ≠ target ({Project} in title/reconstruct does not match target) → **ask the user**: [1] rename to `{target} — MOC...` [2] import under the original name [3] skip
   - body first line `<!-- okf:generated-index -->` **or** (legacy v3.4.0) frontmatter `type: Index` → **skip** — do not fabricate a MOC that never existed in the source graph; suggest the user run `/brain-moc` after import instead
   - none of the above (bundle from another system — frontmatter-free, no okf marker) = OKF navigation per SPEC.md §6 (not a concept) → **skip** as a concept + report it as a `/brain-moc` candidate; **except** if it has frontmatter `type` other than `Index`/MOC (some producers put real content there) → import as a normal note

4. **Build title table + convert links (§8.3 Import)**
   - from every file that parsed: `relative path → title` (title per the identity rule in step 2 — including the H1/filename fallback) — used to resolve every link
   - **titles duplicated within the bundle** (different files with the same title — especially risky when the title comes from the H1 fallback) → the server will silently upsert them over each other on write; **must not leave both as create**: list it as an intra-bundle duplicate conflict in the dry-run → the user chooses skip-the-later-one / cancel
   - `.md` links in the body, both **relative** and **root-absolute** (`[x](/dir/file.md)` — resolve from bundle root per the OKF example format) → `[[Title]]` of the target file
   - a link pointing to a file not in the bundle / non-`.md` / an external URL → **keep as-is** + count in the report
   - `[[wikilink]]` already present in a file → keep as-is

5. **Reverse mapping per note (§8.2 — must not redefine the table, use the protocol's)**
   - `type` → if kebab-case matches the `category` enum of `save-knowledge` (pattern/overview/howto/...) → send as param `category`; if not → tag `content/{kebab-case(type)}`; `Note`/`Index` → add nothing; tags already have `content/*` → use those tags, do not derive again (§8.2)
   - `note_type` present and in the enum (`note`/`fleeting`/`literature`/`permanent`) → use as-is; missing or out-of-enum → default `literature` + note it in the report (must not send an out-of-enum value — save will fail schema validation for the whole note)
   - **body:** trim leading/trailing whitespace before building the payload — prevents re-importing the same bundle from creating a new NoteHistory version over whitespace alone (version churn)
   - `resource` → send as the `source` param of `save-knowledge` + a `Source: <URL>` line in content **only when content does not already have that line** (a bundle from brain-export already has `Source:` in the body — must not write it twice); the full convention is in GRAPH_PROTOCOL §1 item 7 (dual-write)
   - `timestamp` → **does not round-trip** — the server sets createdAt/updatedAt itself (note in the report that the source timestamp is in the bundle)
   - `tags` → **use the whole set from frontmatter as-is (lossless-first — must not "improve" the bundle's tags)**; add only when below the minimum of Save Rules §1: no `{target-project-lowercase}` → add it; still < 2 tags after that → add a domain tag inferred from the directory (map plural→singular, reversing §8.1 rule 3, e.g. `dependencies/`→`dependency`); still not enough → import as-is + report in the dry-run — every added tag must be shown in the dry-run report
   - **folderPath from the directory tree:** `{bundle}/{dir}/note.md` → `/projects/{target-project}/{dir}/` (preserve the nested path as-is); a file at the bundle root → `/projects/{target-project}/`; a directory that does not match the category convention §1 → import as-is + flag in the report

### Phase B — Gate (decide what will be written)

6. **Conflict detection (catalog-first — §3 Step 0)**
   - `mcp__graph-brain__get-project-catalog` project="{target}" → compare every note's title: no collision = **create**, collision = **upsert** (default) or **skip** (`--no-overwrite`)
   - **a note being upserted → always keep the original folderPath from the catalog** (§8.2 — must not move the folder as a side effect; the real graph has mixed casing); bundle dir differs from the original folder → just report it in the dry-run
   - **a note being created → also check for a title collision outside the target** with `search-knowledge` query="{title}" — **the server's upsert-by-title is GLOBAL, not scoped per project (proven 2026-07-11 — §2)**: a title colliding with a note in another project will not create but **overwrite that other project's note entirely** → default = **skip that note** + state in the dry-run which project's note it collides with, letting the user allow it only per-note
   - catalog tool missing (server older than v1.1.0) → fallback `search-knowledge` query="{title}" one at a time (slower — warn the user when there are many notes)

7. **Tag gate preview (client-side, best-effort)**
   - check every note's tags against blocklist §1: date-string (`2026-06-03`), version tag (`net9`, `v1.2`), status flag (`pending`, `auto-generated`, `wip`) → expected to be **dropped**; known aliases (e.g. `efcore`→`ef-core`) expected to be **normalized** — compare against the canonical list in the `save-knowledge` description if present; **the real server may not embed the list** (checked 2026-07-11: only guidance, no list) → use `list-tags` instead, or skip the alias preview and rely on the real normalize result in step 10
   - the real result is decided at the server on save (§1) — the preview exists to tell the user in advance in the dry-run report, not to decide

8. **Secret check (§6.3 — MANDATORY before every write)**
   - scan the **final payload to be sent to `save-knowledge`** with the full pattern set §6.3 (key=value/key:value + URL/signature + token literals) — that is content **after** link conversion + adding the `Source:` line **and every field to be sent**: `source` (from `resource` — a proven bypass point 2026-07-11: a credential embedded in the resource URL can slip past the gate if you scan only the body before assembling), title, description
   - **a masked value (`***`/`<masked>`) is not a hit** — masking is correct per §6.2 item 5 → report as info; the policy below applies only to literal values
   - **a literal value found → that note is immediately dropped from the write** + report the file/line — a secret that has entered the graph cannot be permanently deleted (§6), so it must not be imported even if the user asks; have the user fix the file in the bundle and rerun

### Phase C — Confirm + Write

9. **Dry-run report (default — always, no exception)**
   - show (in Thai): **the bundle's `okf_version`** (`0.1` / not declared / warn on major mismatch — from step 3) / create N / upsert M (state the colliding titles — the old content will be overwritten, recoverable from NoteHistory) / skip K (--no-overwrite / secret / parse fail / log.md / generated index / foreign index navigation / intra-bundle duplicate) / MOC action / tags expected to normalize+drop / **self-added tags** (with the §1 minimum reason — from step 5) / links converted X kept Y / folders not matching the convention / **upserted notes whose bundle dir differs from the original folder** (from step 6) / guessed titles / titles colliding with a note outside the target project
   - ask the user: **[1] write everything per the report [2] select some notes to import [3] cancel** — no answer = no write

10. **Write phase (only after the user confirms)**
    - one note at a time: `mcp__graph-brain__save-knowledge` — title/content(after link conversion)/tags(after additions)/folderPath/projectName={target}/type={note_type}/source={resource if any}; an upserted note → send `reason="brain-import: OKF bundle {bundle-path} ({YYYY-MM-DD})"` (the server keeps the old version in NoteHistory automatically — §2 upsert semantics; bulk import does not create a changelog note per note)
    - read `Tag normalization:` in every response → accumulate **only the normalize lines (alias→canonical) and drop lines (blocked)**; the `... is a NEW tag` line is a server-side registry report with a known quirk (it reports NEW repeatedly for a tag that already exists — round-trip test 2026-07-11), must not use it to decide the gate; normalize/drop differing from the step 7 preview → report to the user at the end
    - **old server without Tag Taxonomy (pre-v3.3):** if the step 7 preview expected drop/normalize but the first few responses have no `Tag normalization:` line at all → **stop before writing the next note**, tell the user the server does not normalize (the whole blocked-tag set will enter the graph), then ask: [1] strip blocked tags client-side per the preview and continue [2] continue as-is [3] cancel the rest
    - per-note save fail → skip + list in the report, then do the next note (must not fail the whole import over one note)
    - MOC note (from step 3) → write it last (after every note actually exists — the wikilinks in the MOC will resolve to LINKS_TO fully)
    - **Create-heavy bundle (§8.3):** the server creates LINKS_TO only at save time, no backfill — a note created earlier with a wikilink pointing to a note created later → after writing all, **re-save a second pass** for just those notes (same content, reason="brain-import: link resolve pass") to complete the edges; a pure-upsert set (all titles already exist) does not need this

11. **Post-import validation**
    - `get-project-catalog` for the target again → the note count increases exactly by the create count (upsert does not increase the count)
    - suggest running `/brain-lint {target}` — check broken wikilinks + tag hygiene after import (especially for a bundle from another system)

12. **Report + activity log**
    - report (in Thai): created/upserted/skipped per folder, real tag changes from the server, links kept as `[[...]]` that did not resolve, next-step suggestions (`/brain-lint`, `/brain-moc` if the generated index was skipped)
    - Append `.brain/activity-log.json`: command="brain-import", details={bundle, target_project, created, upserted, skipped, tag_changes}

## Round-trip expectation (paired with brain-export)

a bundle exported with `/brain-export` then imported back to the same project → **lossless within the scope of §8**: note count (excluding the generated `index.md`), wikilinks, canonical tags, note_type, content identical (after normalizing leading/trailing whitespace — step 5) — what does not round-trip: `timestamp` (the server sets it), `description` (re-derivable from content)

## Degrade Behavior

- MCP down → notify the user, do not import, do not block other work
- per-file parse fail / save fail → skip that note + list in the report (per-note degrade)
- catalog tool missing → fallback search-knowledge per title + warn about slowness
