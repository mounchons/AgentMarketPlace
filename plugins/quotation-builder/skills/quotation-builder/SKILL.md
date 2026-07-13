---
name: quotation-builder
description: >-
  Write a client-ready software quotation (ใบเสนอราคา / ขอบเขตงาน) in the user's own Excel
  house-style, Markdown-first. Given a scope of work — from free-form notes, from a ScenarioForge
  scenarios.json/features.json spine, or dictated module-by-module — it authors a REVIEWABLE
  Markdown draft: a header block (system title, ความต้องการของระบบ / tech stack, ระยะเวลาพัฒนา
  development duration, รับประกันผลงาน warranty), pre-table notes, a scope table with the columns
  No | Module | Description | Comment | Price where the Price cells are deliberately LEFT BLANK for
  the user to fill in, a รวมทั้งหมด (grand total) row, and an "งานนอกขอบเขต (Out of Scope / Optional)"
  section that captures the things a dev quote must exclude — ค่า Hardware, ค่า License, ค่าเช่า
  Cloud/Service, Penetration Testing, and cloud-migration work — framed as Manday line items with a
  "1 Manday = ____" rate. The user reviews and prices the Markdown; then a bundled Python + openpyxl
  script (scripts/export_xlsx.py) renders that same draft into a formatted .xlsx that mirrors the real
  Srikrung / TBSC Supplier Portal / CMI / Expend quotation layout (merged title, bordered table,
  bold module rows, thousands-separated prices, out-of-scope block). It never invents prices — blank
  stays blank until the user fills it.
  Use when: preparing a quotation or price proposal for a client; turning a scope / requirement /
  feature list into a costed table; writing a "ขอบเขตงาน" document; adding an out-of-scope or optional
  section to an existing quote; or exporting a reviewed quotation Markdown to the Excel format the
  user presents to clients.
  Also triggered by "write a quotation", "ทำใบเสนอราคา", "quote this scope", "เขียน quotation",
  "scope of work", "ขอบเขตงาน", "price proposal", "out of scope", "งานนอกขอบเขต", "export the quote
  to Excel", "export xlsx", "Manday", "ประเมินราคางาน".
  Trigger keywords: quotation, quote, ใบเสนอราคา, ขอบเขตงาน, scope of work, sow, pricing, proposal,
  out-of-scope, งานนอกขอบเขต, manday, xlsx export, pre-sales.
  Do NOT use for: capturing requirements as scenarios (that is ScenarioForge scenario-discovery);
  writing invoices / ใบวางบิล / ใบแจ้งหนี้ (this build is quotation-only by the user's choice);
  or actually implementing the quoted work (feature-builder).
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Quotation Builder

Author a **client-ready software quotation** in the user's Excel house-style, **Markdown-first** so it
can be reviewed and priced before it is turned into the `.xlsx` the user actually presents.

The golden rule: **you never invent a module price.** Every module `Price` cell and the grand total are
left BLANK for the user to fill — those are per-project. You lay out the scope, the descriptions, the
scope notes, and the out-of-scope exclusions; the user supplies the module numbers.

Two things are **not** blank — they ship with the user's standing defaults from `references/defaults.md`
(the user can override per quote): the **Manday rate** (`manday_rate: 8000`) and the **standard
out-of-scope Manday values** (Pentest 5, cloud migration 3 / 10 / 20). Module prices stay blank; these
business constants do not.

Respond to the user in **Thai** (their standing preference), but keep the quotation content itself in
whatever language the source scope uses (their real quotes mix Thai module names with English tech terms).

---

## The two-step flow

1. **Draft (`.md`)** — gather the scope, then write `quotation.md` from the canonical template. Prices
   blank. Show the user the draft and stop for review.
2. **Export (`.xlsx`)** — after the user has reviewed and filled prices, run the exporter to render the
   reviewed Markdown into a formatted Excel file matching their house-style.

Never skip step 1. The user explicitly wants to review the Markdown before anything is presented.

---

## Step 1 — Draft the quotation Markdown

### 1a. Get the scope

Accept the scope from whichever source the user has:

- **Free-form notes / a chat description** — the most common case. Group what they describe into modules.
- **A ScenarioForge spine** — if `scenarios.json` or `features.json` exists in the project, offer to seed
  the module list from it (each feature/scenario ≈ a Module or a line item). Read it; do not guess.
- **From scratch** — walk the user module-by-module.

If the scope is thin, ask a few targeted questions (what modules, what tech stack, roughly how long) —
but do not block on price. Price is always the user's to fill.

### 1b. Write `quotation.md`

Instantiate the canonical template in `references/md-template.md`. Read `references/format-spec.md` for
the exact structure the exporter expects — **the frontmatter keys and the two table shapes are a
contract with `scripts/export_xlsx.py`; keep them intact.** In short:

- **Frontmatter** carries the header metadata: `title`, optional `client`/`quote_no`/`date`,
  `tech_stack` (list), `duration`, `warranty`, `currency` (default `THB`), `manday_rate` (blank),
  and `notes` (pre-table hint lines such as *"ไม่รวม Hardware และค่าเช่า Service ต่างๆ"*).
- **Scope table** — `| No | Module | Description | Comment | Price |`. A **module row** has `No` +
  a bold `**Module name**` + (optionally) a `Price`, and the rest blank. Its **line items** are rows
  with the `Module` cell blank, the feature text in `Description`, and any scope caveat in `Comment`.
  End with a **total row** whose `Module` cell is `**รวมทั้งหมด (Total)**`.
- **Out-of-scope table** — `| No | รายการ | หมายเหตุ | Manday |`. Seed it from `references/defaults.md`
  (the standing default set) — always include **ค่า Hardware, ค่า License, ค่าเช่า Cloud/Service**
  (Manday `-`) plus the default optional-work rows (Penetration Testing = 5, cloud migration 3 / 10 / 20).
  Drop an optional row only if it's clearly irrelevant to the project. For any extra optional work not in
  the default set, pull from `references/out-of-scope-catalog.md` and leave its Manday blank.

Leave every **module `Price`** cell and the **grand total** empty. Keep `manday_rate: 8000` and the
default out-of-scope Manday numbers (override only if the user gives different ones).

Write the file to the project (default `quotation.md`, or a name the user gives). Then show the user a
short summary and the path, and tell them: *"กรอกราคาในคอลัมน์ Price (และ Manday rate ถ้าต้องการ) แล้ว
บอกผมเพื่อ export เป็น Excel"*. **Stop and let them review.**

---

## Step 2 — Export to `.xlsx`

When the user has priced the draft and asks to export, run the bundled exporter:

```bash
python "${CLAUDE_PLUGIN_ROOT}/scripts/export_xlsx.py" <path-to-quotation.md> [output.xlsx]
```

- It parses the frontmatter + the two tables and writes a formatted workbook (merged title, tech-stack
  and duration/warranty block, notes, a bordered scope table with bold module rows and
  thousands-separated prices, the total row, and the out-of-scope block with the Manday rate).
- If `output.xlsx` is omitted it writes next to the `.md` with the same basename.
- The script prints the output path and a one-line summary (module count, whether any price is still
  blank). If prices are still blank it warns but still exports — a blank-price quote is a valid draft.

Report the result to the user in Thai: where the file is, and any blank-price warning.

If `openpyxl` is missing, tell the user to `pip install openpyxl` (PyYAML too if absent) — do not try to
hand-roll the workbook.

---

## What NOT to do

- **Do not invent or estimate a module `Price` or the grand total.** Those stay blank for the user.
  (The Manday rate and the standard out-of-scope Manday values are the *defaults* from `defaults.md` —
  ship them, but never invent a *new* per-project number the user hasn't given.)
- **Do not change the frontmatter keys or the table column headers** — they are the exporter's contract.
- **Do not drop the out-of-scope section.** The user specifically wants hardware/license/service
  exclusions — and the default optional-work rows — on every quote.
- **Do not export before the user has reviewed the Markdown.** Draft first, always.
- Do not write invoices — this plugin is quotation-only.

## References

- `references/defaults.md` — the user's standing defaults (Manday rate, standard out-of-scope rows).
  **Seed every draft from here.**
- `references/format-spec.md` — the exact `.md` contract the exporter parses (frontmatter + tables).
- `references/md-template.md` — the fill-in-the-blanks template to instantiate.
- `references/out-of-scope-catalog.md` — the fuller menu of optional work to pull extra rows from.
- `references/examples.md` — condensed real quotations (CMI, Expend, TBSC) as few-shot examples.
