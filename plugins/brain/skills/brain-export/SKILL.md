---
name: brain-export
description: "Export project knowledge from Graph Brain to an Open Knowledge Format (OKF v0.1) bundle — portable markdown files + YAML frontmatter that work with git, other agents, and the OKF static visualizer, no MCP server required. Read-only on the graph.
  USE THIS SKILL when the user wants to export brain knowledge, create a knowledge bundle, share project knowledge outside brain, or back up notes as files.
  Thai triggers: 'export ความรู้', 'export brain', 'ส่งออกโน้ต', 'แชร์ความรู้เป็นไฟล์', 'สร้าง OKF bundle', 'backup brain เป็นไฟล์'"
user_invocable: true
argument-hint: "[project] [--all-projects] [--output <dir>] — default: basename of cwd → .brain-export/{project}/"
---

# Brain Export (OKF Bundle)

ALL responses MUST be in Thai language.

**Graph Protocol:** Follow `${CLAUDE_PLUGIN_ROOT}/GRAPH_PROTOCOL.md` — **§8 OKF Interchange Mapping (the core rules of this skill)**, §6.3 pre-save sanity check (used as a pre-write check), §3 Step 0 catalog-first

## Why Export

- **Portability:** knowledge in Neo4j is reachable only through MCP — a bundle is plain markdown, openable anywhere, committable to git, shareable with agents/teams that do not have graph-brain
- **Visualizer:** a bundle following the OKF v0.1 spec → openable with the OKF static HTML visualizer per spec (no backend required — not yet tested against the real visualizer; the structural validation in step 7 confirms only the bundle format)
- **Not a backup that replaces the server:** the graph is still the source of truth — the bundle is a snapshot (see §8.5)

## Mode Detection

| Input | Mode |
|---|---|
| (no args) | export project = basename of cwd |
| `{project}` | export the specified project |
| `--all-projects` | loop-export every project from `list-projects` — **warn the user first**: cross-project knowledge (which may be client work / another repo) will be written into the working tree of the current repo |
| `--output <dir>` | change the **parent directory** (default = `.brain-export`) — files always go to `{output}/{project}/`, for both single and --all-projects |
| `--history-detail` | enrich the root `log.md` with real per-version `**Update**` entries via `get-note-history` (§8.7) — **costs N extra MCP calls**, warn before running; default log.md uses only the timestamps already fetched |

## Steps

1. **Resolve scope**
   - project from the argument or basename of cwd; `--all-projects` → `mcp__graph-brain__list-projects` then loop per project (do steps 2-8 per project)
   - MCP down/unresponsive → notify the user and stop; do not retry in a loop (never block)

2. **Get catalog**
   - `mcp__graph-brain__get-project-catalog` project="{name}" → returns every note: title + summary + folder + `{note_type}/{category}` (category is the first source of OKF `type` per §8.2 — e.g. `permanent/pattern` → `type: Pattern`)
   - tool missing (server older than v1.1.0) → fallback: `search-by-tags` tags=["{project-lowercase}"] + `search-knowledge` to gather as complete a note list as possible, then tell the user the catalog is missing and notes may be dropped; each note's folder uses the **fallback chain §8.1** (explore-graph → tag inference) + report when it is a guess
   - 0 notes → notify the user + suggest `/brain-scan` first; stop
   - **> 100 notes → warn about token cost** (must `get-knowledge` one by one) then ask the user before proceeding; offer an alternative: export only some categories

3. **Build link table** (before writing any file)
   - from the catalog: `title → (category, slug)` per the slug rules in §8.1 — this table resolves wikilinks in every file
   - slugs colliding within one category → append `-2`, `-3` in the order encountered

4. **Fetch + convert one note at a time**
   - `mcp__graph-brain__get-knowledge` noteId → full content, tags, type, timestamps
   - build the file per §8.2 (frontmatter + **strip MCP display metadata** from the head/tail of get-knowledge output) + §8.3 (convert `[[wikilink]]` → relative link using the table from step 3; unresolvable → keep `[[...]]` + collect into the unresolved list)
   - MOC note → `index.md` per §8.4 (must not export it again as a normal file); no MOC → generate index.md from the catalog + suggest the user run `/brain-moc` for a curated index
   - **`index.md` is frontmatter-free (§8.4/SPEC.md §6)** — write body-only, first line an HTML comment `<!-- okf:moc -->` (from a MOC) or `<!-- okf:generated-index -->` (generated); **must not** put frontmatter `type: Index`/`title`/`project` in index.md (the marker has moved to the comment)

5. **Pre-write secret check (MANDATORY — §8.5)**
   - scan the content of every file to be written with the **full pattern set in §6.3** (key=value/key:value + URL/signature + token literals: AWS/GitHub/Slack/JWT/Bearer/PEM) — especially important for old notes saved before masking rules existed
   - **found → stop the whole export**, report the offending note, have the user fix the note in brain first (a bundle goes to git / is shared onward — more dangerous than a note in the server)

6. **Write bundle**
   - write to `{output}/{project}/` per layout §8.1 (+ path safety: project/category segments pass the slug rules)
   - **Overwrite policy:** target directory already has files →
     - looks like a previous bundle (has an `index.md` with an `Exported:` header) → ask the user to confirm before clearing and rewriting
     - **not a previous bundle → abort**, tell the user to change `--output` (must not offer to clear a directory that is not the exporter's — risks deleting user files)
     - user declines clearing → **abort** (do not merge-write — it would silently overwrite index.md / collide slugs)
   - **root `index.md`** gets frontmatter `okf_version: "0.1"` (§8.6 — the only place in the bundle where an index has frontmatter); a sub-index (`{category}/index.md`) has no frontmatter at all
   - `index.md` gets the freshness header **in the body** (after the `<!-- okf:… -->` comment): `> Exported: {YYYY-MM-DD} @ commit {hash} — snapshot; source of truth is the graph` (hash from `git rev-parse --short HEAD` of the current repo; non-git → omit commit) — the header is a blockquote in the body, not frontmatter
   - **root `log.md`** (change history, §8.7) — write frontmatter-free: first line `<!-- okf:changelog -->`, then `# Changelog`, then `YYYY-MM-DD` sections newest-first with `- **Creation** [Title](relative-path)` (dated by each note's `createdAt`, already fetched in step 4) and `- **Update** [Title](relative-path)` when `updatedAt` is later than `createdAt`; sort entries within a date by title. With `--history-detail`: also call `mcp__graph-brain__get-note-history` per note for real `**Update**` reasons — **warn about the N extra calls before running** (ask first when > 100 notes)

7. **Structural validation (before reporting success)**
   - every concept file (`.md` that is **not** `index.md`/`log.md` — reserved) has frontmatter with at least `type`
   - **every `index.md` is frontmatter-free (§8.4/§8.6)** — root may have only `okf_version: "0.1"`; a sub-index has no frontmatter at all; an index.md with any other frontmatter key (`type`/`title`/`project`) → **fail** (violates SPEC.md §6 — move the marker into the `<!-- okf:… -->` comment)
   - every index.md has an HTML comment on its first line (`<!-- okf:moc -->` or `<!-- okf:generated-index -->`)
   - **`log.md` is frontmatter-free (§8.7)**, starts with `<!-- okf:changelog -->`, and its links resolve to existing files
   - every relative link points to a file that actually exists in the bundle
   - `index.md` covers every file (except the index and `log.md` themselves)
   - any failure → fix before reporting; do not report success while validation is red

8. **Report + activity log**
   - report (in Thai): note count per category, bundle path, `log.md` generated (entry count + whether `--history-detail` was used), unresolved wikilinks (if any — note that they tie into the broken-link check of `/brain-lint`), next-step suggestions (commit to git / open the visualizer / `/brain-import` on the receiving side)
   - **before suggesting "commit to git":** check `git check-ignore <bundle-path>` — if ignored (many repos gitignore `.brain-export/` because it is a derived artifact) tell the user directly, with options: `--output` to a trackable location, or `git add -f` when intentionally committing
   - Append `.brain/activity-log.json`: command="brain-export", details={project, note_count, output, unresolved_links, log_entries, history_detail}

## Cross-check with other skills

- **before export:** if lint has never run, suggest `/brain-lint` — a bundle exported from a clean graph (no broken links/orphans) validates more easily
- **MOC drift:** if the MOC is older than the latest note (lint check) → suggest `/brain-moc` before export

## Degrade Behavior

- MCP down → notify the user, do not export, do not block other work
- `get-knowledge` fails for one note → skip that note + list it in the report (must not fail the whole export over one note)
- `--history-detail`: `get-note-history` fails for one note → fall back to that note's timestamp-based `log.md` entry (`**Creation**`/`**Update**`) + list it in the report (must not fail the whole export; `log.md` degrades gracefully, never blocks)
