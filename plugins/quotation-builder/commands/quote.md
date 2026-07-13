---
description: Draft a client quotation as a reviewable Markdown file (prices left blank for you to fill), in your Excel house-style
argument-hint: "[scope description | path to notes | scenarios.json/features.json] [-o quotation.md]"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# /quote — draft a quotation (Markdown-first)

Invoke the **quotation-builder** skill to author a quotation **draft in Markdown** for review. Do NOT
export to Excel here — that's `/quotation-builder:export`, after the user has priced the draft.

Scope source: `$ARGUMENTS` — a free-form description, a path to notes, or empty. If empty, check the
project for `scenarios.json` / `features.json` and offer to seed the module list from the spine; else
walk the user through the modules.

Do this:
1. Gather the scope (modules, line items, tech stack, duration, warranty). Ask a few targeted questions
   if it's thin — but never block on price.
2. Read `references/format-spec.md` + `references/md-template.md` and instantiate the template. Seed the
   out-of-scope section and the Manday rate from `references/defaults.md` — always keep the Hardware /
   License / Cloud-Service exclusions plus the default optional rows (Pentest, cloud migration); pull any
   extra optional work from `references/out-of-scope-catalog.md`.
3. **Leave every module `Price` cell and the grand total blank** — never invent a per-project price.
   Keep the defaults from `defaults.md` (`manday_rate: 8000`, standard out-of-scope Manday values);
   override them only if the user gives different numbers.
4. Write the file (default `quotation.md`, or the `-o` name). Show the user a short summary + the path,
   and tell them (in Thai) to fill the Price column and then ask to export.

Stop after writing — let the user review.
