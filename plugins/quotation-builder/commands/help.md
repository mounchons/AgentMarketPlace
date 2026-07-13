---
description: Show the quotation-builder commands and the draft → review → export flow
allowed-tools: Read
---

# /help — quotation-builder guide

Explain this plugin to the user in **Thai** (their preference), concisely. Cover:

**What this plugin is:** a pre-sales helper that writes a **software quotation (ใบเสนอราคา / ขอบเขตงาน)**
in the user's own Excel house-style, **Markdown-first**. It drafts a reviewable `.md` — header block
(system title, tech stack, ระยะเวลาพัฒนา, รับประกันผลงาน), a `No | Module | Description | Comment | Price`
scope table with **prices left blank for the user to fill**, a total row, and an **"งานนอกขอบเขต
(Out of Scope)"** section (Hardware / License / Cloud-Service exclusions + optional work as Manday). After
the user prices the draft, a bundled Python exporter renders it into a formatted `.xlsx`.

**The flow:**
1. `/quotation-builder:quote [scope]` — draft `quotation.md` (prices blank). Review it.
2. Fill the `Price` column (and the `1 Manday = ___` rate) in the `.md`.
3. `/quotation-builder:export [quotation.md]` — render to `.xlsx`.

**Commands:**
- `/quotation-builder:quote` — draft the quotation Markdown.
- `/quotation-builder:export` — export the priced Markdown to Excel.
- `/quotation-builder:help` — this guide.

**Key rules to mention:**
- It **never invents prices** — blank stays blank until the user fills it.
- Scope only (this build does **not** do invoices or timelines).
- Can seed modules from a ScenarioForge `scenarios.json` / `features.json` if present.

Point the user to `USER-GUIDE.md` for the full walkthrough and the `.md` format contract.
