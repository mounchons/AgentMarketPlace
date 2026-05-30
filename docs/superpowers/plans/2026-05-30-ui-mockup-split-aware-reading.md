# ui-mockup Split-Aware Design-Doc Reading — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ปิด coverage gap ให้ 4 command ของ ui-mockup (`create-html-mockup`, `create-mockups-parallel`, `validate-mockup`, `edit-mockup`) อ่าน system-design-doc split/registry format (schema 2.3.0) ได้ถูกต้อง ผ่าน shared reference เดียว + resolve-then-inject สำหรับ parallel

**Architecture:** สร้าง canonical reference `references/reading-design-docs.md` แล้วให้ 4 command ใหม่ชี้มาที่นี่ (ไม่แตะ 3 command เดิมที่ทำงานดีอยู่แล้ว) สำหรับ `create-mockups-parallel` ใช้ pattern resolve-then-inject: orchestrator resolve path ครั้งเดียว แล้วฝัง absolute path ลง sub-agent prompt เพื่อตัด silent drift ข้าม agent boundary

**Tech Stack:** Markdown command files (instructions-for-agent), `jq` สำหรับ resolve registry, `git` frequent commits. ไม่มี automated test runner → verification = `rg` self-consistency grep + jq resolver smoke test

**Spec:** `docs/superpowers/specs/2026-05-30-ui-mockup-split-aware-reading-design.md`

---

## File Structure

| File | Responsibility | Action |
|---|---|---|
| `plugins/ui-mockup/skills/ui-mockup/references/reading-design-docs.md` | Canonical "how to resolve sdd sources" guide (single source of truth) | Create |
| `plugins/ui-mockup/commands/create-html-mockup.md` | + Step 1b registry-aware source resolution | Modify |
| `plugins/ui-mockup/commands/create-mockups-parallel.md` | + Step 4.5 orchestrator resolve + inject block into 2 prompt templates | Modify |
| `plugins/ui-mockup/commands/validate-mockup.md` | Rewrite Category 7 split-aware + path-exists check | Modify |
| `plugins/ui-mockup/commands/edit-mockup.md` | + Step 3.5 non-blocking design-doc consistency check | Modify |
| `plugins/ui-mockup/commands/help.md` | Document split-aware reading + version | Modify |
| `plugins/ui-mockup/README.md` | Changelog entry | Modify |
| `plugins/ui-mockup/.claude-plugin/plugin.json` | Bump 1.9.0 → 1.10.0 + description | Modify |
| `.claude-plugin/marketplace.json` | Sync ui-mockup 1.9.0 → 1.10.0 + description | Modify |

**Shared identifiers (must stay consistent across all tasks):**
- Reference path (in pointers): `skills/ui-mockup/references/reading-design-docs.md`
- jq resolver: `jq -r --arg k "<key>" '.documents[0].sections[]|select(.key==$k)|.file' .design-docs/design_doc_list.json`
- Injected block heading: `## Design Doc Sources (pre-resolved — DO NOT re-resolve)`

---

## Task 1: Create the canonical reference

**Files:**
- Create: `plugins/ui-mockup/skills/ui-mockup/references/reading-design-docs.md`

- [ ] **Step 1: Create the reference file**

Create `plugins/ui-mockup/skills/ui-mockup/references/reading-design-docs.md` with EXACTLY this content:

````markdown
# Reading system-design-doc Sources (registry-first, split-aware, JSON-preferred)

Canonical guide for how any `ui-mockup` command resolves design documents produced by the
`system-design-doc` plugin. Commands link here instead of duplicating this logic.

## 1. Resolution order

1. Read the registry: `.design-docs/design_doc_list.json`. If present, branch on `documents[].doc_layout`:
   - **`"split"` (default, schema ≥ 2.3.0)** → resolve per-section files through `documents[].sections[]`
     (match by `key`); base dir = `documents[].doc_dir`. Index = `<doc_dir>/00-index.md`.
   - **`"single"` / field absent (legacy)** → the whole doc is `documents[].file_path`.
2. Also read `.design-docs/sitemap.json` if present (machine-readable pages/nodes).
3. **Fallback (no registry)** — glob in this priority order:
   `.design-docs/*/00-index.md` → `system-design*.md` → `*sitemap*.md` → `requirements*.md` → `README.md`.

## 2. Golden rule — prefer JSON over markdown

These are machine-readable in `design_doc_list.json`; use them directly and only Read a section `.md`
when you need prose/diagram content:
`entities[]`, `diagrams.sitemap`, `acceptance_criteria[]`, `use_cases[]`, `api_endpoints[]`.

## 3. Canonical section resolver

```bash
# resolve a section file by key (sitemap, er-diagram, data-dictionary, requirements, modules, ...)
jq -r --arg k "sitemap" '.documents[0].sections[]|select(.key==$k)|.file' .design-docs/design_doc_list.json
```

Section keys: `introduction, requirements, modules, data-model, dfd, flow-diagrams, er-diagram,
data-dictionary, sitemap, permissions`. Files: `<doc_dir>/NN-<key>.md` (NN = zero-padded number).

## 4. Anchor contract

Inside a resolved section file, locate sub-content via `sections[].anchors[]` regex, e.g.
AC → `^AC-\d+:` ; UC header → `^### Use Case \(UC-\d+\):` ; section N → `### N.`.

## 5. related_documents path convention

- split → `.design-docs/<slug>/NN-<key>.md`
- single → `system-design.md#<anchor>`

## 6. Compatibility

Split-aware with `design_doc_list.json` schema ≥ `2.3.0`. Older/absent → use the fallback (§1.3).
````

- [ ] **Step 2: Verify the file has the required sections**

Run: `rg -c "Resolution order|prefer JSON|Canonical section resolver|Anchor contract|related_documents path|Compatibility" plugins/ui-mockup/skills/ui-mockup/references/reading-design-docs.md`
Expected: `6`

- [ ] **Step 3: Commit**

```bash
git add plugins/ui-mockup/skills/ui-mockup/references/reading-design-docs.md
git commit -m "feat(ui-mockup): add canonical reading-design-docs reference (split-aware)"
```

---

## Task 2: create-html-mockup — registry-aware source resolution

**Files:**
- Modify: `plugins/ui-mockup/commands/create-html-mockup.md` (insert after Step 1, before Step 2)

- [ ] **Step 1: Insert Step 1b after the Step 1 block**

Find the end of `### Step 1: Read mockup_list.json` (the paragraph ending with
`...crud_type, complexity, ui_pattern, related_documents.`). Immediately AFTER that paragraph and
BEFORE the next `### Step` heading, insert:

````markdown
### Step 1b: Resolve design doc sources (registry-aware)

> To resolve system-design-doc sources, follow `skills/ui-mockup/references/reading-design-docs.md` (registry-first, split-aware, JSON-preferred).

After reading the page's `related_documents` (Step 1), resolve the actual design-doc files:

```bash
# Prefer the registry — works for BOTH split and single layouts
cat .design-docs/design_doc_list.json 2>/dev/null
```

- **If a `related_documents[].path` is empty/missing OR `design_doc_list.json` exists** → resolve via the registry:
  - branch on `documents[].doc_layout`: `"split"` → resolve section files through `documents[].sections[]` (by `key`); `"single"`/absent → use `documents[].file_path`.
  - **Prefer structured JSON:** read `entities[]` (field mapping) and `diagrams.sitemap` (page metadata) directly from `design_doc_list.json`; only Read a section `.md` when you need prose/diagram content.
- **If no registry exists** → keep following `related_documents[].path` as-is (legacy behavior).

This feeds the `frontend-design` invocation (Step 4) with accurate field/entity data regardless of design-doc layout.
````

- [ ] **Step 2: Verify the insertion**

Run: `rg -c "Step 1b: Resolve design doc sources|reading-design-docs.md" plugins/ui-mockup/commands/create-html-mockup.md`
Expected: `2`

- [ ] **Step 3: Commit**

```bash
git add plugins/ui-mockup/commands/create-html-mockup.md
git commit -m "feat(ui-mockup): create-html-mockup resolves sdd sources via registry (Step 1b)"
```

---

## Task 3: create-mockups-parallel — resolve-then-inject

**Files:**
- Modify: `plugins/ui-mockup/commands/create-mockups-parallel.md`
  - Insert Step 4.5 after the Step 4 split-note (after the `> **Split layout:** ...` blockquote, before `### Step 5: Spawn Sub Agents in Parallel`)
  - Inject the sources block into the inline prompt (after `## UI Mockup Knowledge` / `[Insert knowledge block from Step 2]`)
  - Inject the sources block into the "Sub Agent Prompt Template" (before its `## Task` heading)

- [ ] **Step 1: Insert Step 4.5 (orchestrator resolve)**

After the `> **Split layout:** ...` blockquote at the end of `### Step 4: Parse Page List`, and BEFORE
`### Step 5: Spawn Sub Agents in Parallel`, insert:

````markdown
### Step 4.5: Resolve design doc sources to absolute paths (orchestrator — resolve-then-inject)

> Follow `skills/ui-mockup/references/reading-design-docs.md` (registry-first, split-aware).

The orchestrator (this main session) resolves design-doc sources **once** and injects pre-resolved
**absolute paths** into each sub-agent prompt. Sub-agents MUST NOT re-resolve the registry themselves.

```bash
REG=.design-docs/design_doc_list.json
DOC_DIR=$(jq -r '.documents[0].doc_dir // empty' "$REG" 2>/dev/null)
SITEMAP=$(jq -r '.documents[0].sections[]|select(.key=="sitemap")|.file' "$REG" 2>/dev/null)
ER=$(jq -r '.documents[0].sections[]|select(.key=="er-diagram")|.file' "$REG" 2>/dev/null)
DATADICT=$(jq -r '.documents[0].sections[]|select(.key=="data-dictionary")|.file' "$REG" 2>/dev/null)
# Resolve each non-empty result to an absolute path (prefix the repo's .design-docs/ root) for injection.
```

For each page, build a `## Design Doc Sources (pre-resolved — DO NOT re-resolve)` block (see the
prompt templates below) with the absolute paths + the relevant `entities[]` JSON slice for that page/entity.
If no registry exists, set every value to `n/a` and omit the entities slice.
````

- [ ] **Step 2: Inject the block into the inline sub-agent prompt (Step 5)**

In `### Step 5: Spawn Sub Agents in Parallel`, find the prompt lines:

```
## UI Mockup Knowledge
[Insert knowledge block from Step 2]
```

Immediately AFTER `[Insert knowledge block from Step 2]`, insert:

```
## Design Doc Sources (pre-resolved — DO NOT re-resolve)
- sitemap:         [ABS_SITEMAP or n/a]
- er-diagram:      [ABS_ER or n/a]
- data-dictionary: [ABS_DATADICT or n/a]
- entities:        [inline JSON slice from registry entities[] for this page/entity, or n/a]
```

- [ ] **Step 3: Inject the block into the "Sub Agent Prompt Template"**

In the `## Sub Agent Prompt Template` section, find the `## Task` heading that is immediately followed by
`Create a UI Mockup for the page: **{{PAGE_NAME}}**`. Immediately BEFORE that `## Task` heading, insert:

```
## Design Doc Sources (pre-resolved — DO NOT re-resolve)
- sitemap:         {{ABS_SITEMAP|n/a}}
- er-diagram:      {{ABS_ER|n/a}}
- data-dictionary: {{ABS_DATADICT|n/a}}
- entities:        {{ENTITIES_JSON|n/a}}

These paths are already resolved by the orchestrator. Read them directly if you need design content.
Do NOT open design_doc_list.json yourself.

```

- [ ] **Step 4: Verify all three insertions**

Run: `rg -c "Step 4.5: Resolve design doc sources|Design Doc Sources \(pre-resolved|reading-design-docs.md" plugins/ui-mockup/commands/create-mockups-parallel.md`
Expected: `4` (1 Step-4.5 heading + 2 injected blocks + 1 reference pointer)

- [ ] **Step 5: Commit**

```bash
git add plugins/ui-mockup/commands/create-mockups-parallel.md
git commit -m "feat(ui-mockup): parallel resolve-then-inject pre-resolved sdd paths into sub-agents"
```

---

## Task 4: validate-mockup — Category 7 split-aware

**Files:**
- Modify: `plugins/ui-mockup/commands/validate-mockup.md` (replace the `### Category 7` block)

- [ ] **Step 1: Replace the Category 7 block**

Find the block that starts at `### Category 7: Cross-Reference Validation (NEW)` and ends at
`**Status: WARN if references don't match, FAIL in strict mode**`. Replace that ENTIRE block with:

````markdown
### Category 7: Cross-Reference Validation (split-aware)

> Resolve design-doc sources per `skills/ui-mockup/references/reading-design-docs.md` (registry-first, split-aware). Branch on `documents[].doc_layout`: `"split"` → resolve section files via `documents[].sections[]`; `"single"`/absent → single `documents[].file_path`.

```
Checks (if .design-docs/design_doc_list.json exists):
- [ ] Entities referenced in mockup exist in registry `entities[]` (or the resolved er-diagram file)
- [ ] Pages referenced in mockup exist in `diagrams.sitemap` (or resolved sections[key="sitemap"].file)
- [ ] Field names in forms match the resolved data-dictionary file (sections[key="data-dictionary"].file)
- [ ] API endpoints referenced match registry `api_endpoints[]` (or sequence diagrams)
- [ ] CRUD operations match registry `entities[].crud_operations`
- [ ] Each mockup `related_documents[].path` EXISTS on disk AND matches a registry `sections[].file` (split) or `documents[].file_path` (single)
```

**Resolver example:**
```bash
jq -r --arg k "data-dictionary" '.documents[0].sections[]|select(.key==$k)|.file' .design-docs/design_doc_list.json
```

**Status: WARN if references don't match or a `related_documents` path is missing/stale, FAIL in strict mode**
````

- [ ] **Step 2: Verify the rewrite**

Run: `rg -c "Category 7: Cross-Reference Validation \(split-aware\)|reading-design-docs.md|EXISTS on disk" plugins/ui-mockup/commands/validate-mockup.md`
Expected: `3`

- [ ] **Step 3: Commit**

```bash
git add plugins/ui-mockup/commands/validate-mockup.md
git commit -m "feat(ui-mockup): validate-mockup Category 7 resolves split sections + checks path existence"
```

---

## Task 5: edit-mockup — non-blocking design-doc consistency check

**Files:**
- Modify: `plugins/ui-mockup/commands/edit-mockup.md` (insert Step 3.5 between Step 3 and Step 4)

- [ ] **Step 1: Insert Step 3.5 after Step 3**

Find the end of `### Step 3: Read Current Mockup` (the `**Analyze:**` list ending with
`- Action column position (if List page)`). Immediately AFTER that list and BEFORE
`### Step 4: Analyze Change Request`, insert:

````markdown
### Step 3.5: Design-doc consistency check (non-blocking)

> Resolve design-doc sources per `skills/ui-mockup/references/reading-design-docs.md` (registry-first, split-aware).

If the mockup's `related_documents` (in `.mockups/mockup_list.json`) point to system-design-doc sections,
read the resolved section(s) and compare against the current mockup BEFORE applying edits:

```bash
# locate the page entry + its related_documents
cat .mockups/mockup_list.json | jq '.pages[] | select(.name|test("[page-name]";"i")) | .related_documents'
# resolve a section path from the registry (split layout)
jq -r --arg k "data-dictionary" '.documents[0].sections[]|select(.key==$k)|.file' .design-docs/design_doc_list.json 2>/dev/null
```

Surface drift as a **WARNING only** (do NOT auto-rewrite):

```
⚠️ Design-doc drift detected (informational):
   • Entity "User" now has field "phone_number" (not in mockup form)
   • Page renamed in sitemap: "User List" → "Members List"
   Proceeding with your requested edit. Re-sync via /sync-with-mockups if needed.
```

If the mockup has no `related_documents` OR no `design_doc_list.json` exists → **skip this step silently**
and continue to Step 4.
````

- [ ] **Step 2: Verify the insertion**

Run: `rg -c "Step 3.5: Design-doc consistency check|WARNING only|reading-design-docs.md" plugins/ui-mockup/commands/edit-mockup.md`
Expected: `3`

- [ ] **Step 3: Commit**

```bash
git add plugins/ui-mockup/commands/edit-mockup.md
git commit -m "feat(ui-mockup): edit-mockup non-blocking design-doc drift check (Step 3.5)"
```

---

## Task 6: Documentation (help.md + README.md)

**Files:**
- Modify: `plugins/ui-mockup/commands/help.md`
- Modify: `plugins/ui-mockup/README.md`

- [ ] **Step 1: Bump the help.md header version**

In `plugins/ui-mockup/commands/help.md`, find the line:
`คุณคือ **UI Mockup Help Guide** — ผู้ช่วยอธิบายวิธีใช้งาน ui-mockup plugin (v1.8.0+)`
Replace `(v1.8.0+)` with `(v1.10.0+)`.

- [ ] **Step 2: Add a v1.10.0 what's-new block**

In the `### Mode 7.6: \`--new\`` section, find the closing line `   /help init-mockup              → command details (with Step 3.55)` followed by ` ``` `. Immediately AFTER that closing ` ``` ` (and before the trailing `---`), insert:

````markdown

```
✨ What's new in v1.10.0 (2026-05-30)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⭐ Split-aware design-doc reading (coverage gap closure)

ทุก command ที่อ่าน system-design-doc รองรับ split per-section layout (schema 2.3.0) ครบ:
  • New reference: skills/ui-mockup/references/reading-design-docs.md (canonical resolver)
  • create-html-mockup  → Step 1b resolve sdd sources via registry/sections[]
  • create-mockups-parallel → resolve-then-inject: orchestrator ฝัง absolute path ลง sub-agent prompt
  • validate-mockup     → Category 7 resolve split sections + ตรวจ related_documents path มีจริง
  • edit-mockup         → Step 3.5 non-blocking design-doc drift check (warning เท่านั้น)

🔙 Backward compatible: ไม่มี registry / single-file layout → fallback เดิม

📚 ดูเพิ่ม:
   /help --integration            → upstream sdd connection
```
````

- [ ] **Step 3: Add a README changelog entry**

Read `plugins/ui-mockup/README.md`. Locate its changelog/version-history section (a heading containing
`Changelog`, `What's New`, or `Version`). If found, add this entry at the TOP of that section's list; if
no such section exists, append a new `## Changelog` section at the end of the file with this entry:

```markdown
### 1.10.0 (2026-05-30)
- **Split-aware design-doc reading (coverage gap closure).** All commands that read system-design-doc now support the split per-section layout (schema 2.3.0).
  - New canonical reference `skills/ui-mockup/references/reading-design-docs.md` (registry-first, split-aware, JSON-preferred).
  - `create-html-mockup`: Step 1b resolves sources via the registry / `sections[]`.
  - `create-mockups-parallel`: resolve-then-inject — orchestrator injects pre-resolved absolute paths into sub-agent prompts.
  - `validate-mockup`: Category 7 resolves split section files and verifies `related_documents[].path` exists.
  - `edit-mockup`: new non-blocking design-doc drift check (Step 3.5).
```

- [ ] **Step 4: Verify the doc changes**

Run: `rg -c "v1.10.0|1.10.0" plugins/ui-mockup/commands/help.md plugins/ui-mockup/README.md`
Expected: each file ≥ `1` (help.md ≥ 2, README.md ≥ 1)

- [ ] **Step 5: Commit**

```bash
git add plugins/ui-mockup/commands/help.md plugins/ui-mockup/README.md
git commit -m "docs(ui-mockup): document v1.10.0 split-aware reading in help + README"
```

---

## Task 7: Version sync (plugin.json + marketplace.json)

**Files:**
- Modify: `plugins/ui-mockup/.claude-plugin/plugin.json`
- Modify: `.claude-plugin/marketplace.json`

- [ ] **Step 1: Bump plugin.json version + description**

In `plugins/ui-mockup/.claude-plugin/plugin.json`:
- Change `"version": "1.9.0"` → `"version": "1.10.0"`
- At the END of the existing `description` string value, append (inside the quotes, before the closing `"`):
  ` v1.10.0: split-aware design-doc reading — canonical references/reading-design-docs.md + registry/sections[] resolution across create-html-mockup (Step 1b), create-mockups-parallel (resolve-then-inject), validate-mockup (Category 7 path-exists), edit-mockup (Step 3.5 non-blocking drift check)`

- [ ] **Step 2: Sync marketplace.json**

In `.claude-plugin/marketplace.json`, in the `ui-mockup` plugin object (the one with `"category": "design"`):
- Change its `"version": "1.9.0"` → `"version": "1.10.0"`
- Append the SAME sentence as Step 1 to the end of that object's `description` value.

- [ ] **Step 3: Verify JSON validity + version match**

Run:
```bash
node -e "const p=require('./plugins/ui-mockup/.claude-plugin/plugin.json'); const m=require('./.claude-plugin/marketplace.json'); const mp=m.plugins.find(x=>x.name==='ui-mockup'); console.log('plugin.json:',p.version,'marketplace:',mp.version); if(p.version!=='1.10.0'||mp.version!=='1.10.0'){process.exit(1)} console.log('OK match 1.10.0')"
```
Expected: `plugin.json: 1.10.0 marketplace: 1.10.0` then `OK match 1.10.0` (exit 0)

- [ ] **Step 4: Commit**

```bash
git add plugins/ui-mockup/.claude-plugin/plugin.json .claude-plugin/marketplace.json
git commit -m "chore(ui-mockup): bump 1.10.0 + sync marketplace (split-aware reading)"
```

---

## Task 8: Integration verification (smoke test — no commit)

**Files:** none modified (verification only — uses a throwaway temp fixture)

- [ ] **Step 1: Cross-command consistency sweep**

Run: `rg -l "reading-design-docs.md" plugins/ui-mockup/commands/`
Expected: lists exactly these 4 files — `create-html-mockup.md`, `create-mockups-parallel.md`, `validate-mockup.md`, `edit-mockup.md`

- [ ] **Step 2: jq resolver smoke test against a throwaway fixture**

Run (Bash tool):
```bash
TMP=$(mktemp -d)
mkdir -p "$TMP/.design-docs/demo"
cat > "$TMP/.design-docs/design_doc_list.json" <<'EOF'
{ "documents": [ { "doc_layout": "split", "doc_dir": "demo",
  "sections": [ { "key": "sitemap", "file": "demo/09-sitemap.md" },
                { "key": "data-dictionary", "file": "demo/08-data-dictionary.md" } ] } ] }
EOF
cd "$TMP"
echo "sitemap -> $(jq -r '.documents[0].sections[]|select(.key=="sitemap")|.file' .design-docs/design_doc_list.json)"
echo "datadict -> $(jq -r '.documents[0].sections[]|select(.key=="data-dictionary")|.file' .design-docs/design_doc_list.json)"
cd - >/dev/null && rm -rf "$TMP"
```
Expected:
```
sitemap -> demo/09-sitemap.md
datadict -> demo/08-data-dictionary.md
```

- [ ] **Step 3: Confirm the 3 untouched commands were NOT modified**

Run: `git diff --name-only main -- plugins/ui-mockup/commands/init-mockup.md plugins/ui-mockup/commands/create-mockup.md`
Expected: empty output (these two were intentionally left unchanged)

---

## Self-Review (completed by plan author)

**1. Spec coverage:** Every spec section maps to a task — §4.1 reference → Task 1; §4.2 create-html-mockup → Task 2; §4.3 parallel resolve-then-inject → Task 3; §4.4 validate-mockup → Task 4; §4.5 edit-mockup → Task 5; §5 verification → Tasks 6 (docs), 7 (version sync), 8 (smoke test). No gaps.

**2. Placeholder scan:** No "TBD/TODO/handle appropriately". The `[page-name]` / `{{ABS_SITEMAP|n/a}}` tokens are intentional command-template placeholders that match the existing files' conventions, not plan gaps.

**3. Type/identifier consistency:** Reference path `skills/ui-mockup/references/reading-design-docs.md`, jq pattern `.documents[0].sections[]|select(.key==$k)|.file`, and block heading `## Design Doc Sources (pre-resolved — DO NOT re-resolve)` are identical everywhere they appear. Version `1.10.0` consistent in Tasks 6–7.
