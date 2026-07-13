---
description: Export a reviewed, priced quotation Markdown into a formatted .xlsx that mirrors your Excel house-style
argument-hint: "[quotation.md] [output.xlsx]"
allowed-tools: Read, Bash, Glob
---

# /export — render the quotation Markdown to Excel

Invoke the **quotation-builder** skill's export step. This turns a reviewed quotation `.md` into the
formatted `.xlsx` the user presents to clients.

Input: `$ARGUMENTS` — the `.md` path (and optional output `.xlsx`). If no path is given, look for
`quotation.md` in the project root; if several `*.md` quotations exist, ask which one.

Do this:
1. Confirm the file exists and looks like a quotation (`doc_type: quotation` frontmatter + a scope table).
2. Run the bundled exporter:
   ```bash
   python "${CLAUDE_PLUGIN_ROOT}/scripts/export_xlsx.py" <quotation.md> [output.xlsx]
   ```
3. Relay the result to the user in Thai: the output path, module/line-item counts, and any
   "still blank" price warning the script prints. A blank-price export is a valid draft — just surface
   the warning so the user knows to fill prices before sending it to a client.

If the script reports a missing dependency, tell the user to `pip install openpyxl pyyaml`. Do not try
to build the workbook by hand.
