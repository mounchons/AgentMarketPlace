# Quotation `.md` format — the exporter contract

`scripts/export_xlsx.py` parses a quotation Markdown file with **exactly** this shape. The skill must
keep this structure intact; the user edits values (text, prices), not the structure.

A quotation `.md` has three parts, in order:

1. **YAML frontmatter** — header metadata.
2. **A human-readable body** (rendered from the frontmatter, for review) — the exporter *ignores* this
   prose; it exists only so the `.md` reads like a document.
3. **Two Markdown tables** — the scope table and the out-of-scope table. These are the exporter's real
   input alongside the frontmatter.

---

## 1. Frontmatter

Delimited by `---` on its own line at the very top and again to close. Keys:

| Key | Type | Required | Meaning |
|-----|------|----------|---------|
| `doc_type` | string | yes | must be `quotation` |
| `title` | string | yes | system title, e.g. `ขอบเขตการพัฒนาระบบ TBSC Supplier Portal` |
| `client` | string | no | client name (blank ok) |
| `quote_no` | string | no | quotation number (blank ok) |
| `date` | string | no | quote date as free text (blank ok) |
| `tech_stack` | list of strings | no | one line per requirement, e.g. `Front End : ASP.NET Core` |
| `duration` | string | no | development duration, e.g. `4 เดือน` |
| `warranty` | string | no | warranty, e.g. `3 เดือน หลังจากส่งมอบ` |
| `currency` | string | no | default `THB`; used only as the Price column label |
| `manday_rate` | number or blank | no | baht per Manday for out-of-scope work; **leave blank** for the user |
| `notes` | list of strings | no | pre-table หมายเหตุ lines, e.g. `ไม่รวม Hardware และค่าเช่า Service ต่างๆ` |

`manday_rate` must be left empty (`manday_rate:` with nothing after it) unless the user has given a rate.

---

## 2. Body

Free Markdown that mirrors the frontmatter for human review — headings for `ความต้องการของระบบ`,
the duration/warranty lines, and the notes as a blockquote. **The exporter does not read this.** If the
user changes header facts, change them in the frontmatter (that is what exports), and mirror them here.

---

## 3a. Scope table

Located under a heading that contains the word `ขอบเขต` (e.g. `## ขอบเขตงานและราคา`). The exporter finds
the **first Markdown table whose header row contains both `Module` and `Price`**. Columns, in order:

```
| No | Module | Description | Comment | Price |
```

Row semantics (evaluated left to right):

- **Module row** — the `Module` cell is non-empty. Convention: wrap the module name in `**bold**`.
  - `No` holds the running number (1, 2, 3…).
  - `Price` holds this module's price **or is left blank** for the user.
  - `Description` / `Comment` are usually blank on a module row (a short module-level note may go in
    `Comment`).
- **Line item row** — the `Module` cell is blank and the `Description` cell is non-empty.
  - `Description` = the feature / bullet text.
  - `Comment` = an optional scope caveat (e.g. `*** ระบบแสดงผลอย่างเดียว ไม่รองรับการชำระเงิน`).
  - `No` / `Price` blank.
- **Total row** — the `Module` cell contains `รวมทั้งหมด` or `Total` (case-insensitive). `Price` holds the
  grand total or is blank. The exporter renders it bold; it does **not** auto-sum (the user controls
  every number).

Blank rows / the `|---|` separator are ignored.

### Price cell format

`Price` may be blank, or a number possibly with thousands separators / currency words — e.g.
`` (blank), `300000`, `300,000`, `฿300,000`. The exporter strips `,` `฿` `บาท` and whitespace, then reads
the number. Anything it cannot parse to a number is treated as blank (and counted in the "still blank"
warning).

---

## 3b. Out-of-scope table

Located under a heading that contains `นอกขอบเขต` or `Out of Scope`. The exporter finds the **first
Markdown table whose header row contains `Manday`**. Columns, in order:

```
| No | รายการ | หมายเหตุ | Manday |
```

- `รายการ` = the excluded / optional item (e.g. `ค่า Hardware / Server`, `Penetration Testing`).
- `หมายเหตุ` = note (e.g. `ลูกค้าจัดหาเอง`, `ไม่รวม Penetration Testing ที่ใหม่`).
- `Manday` = estimated mandays for optional work, `-` for a pure exclusion (client procures it; not your
  work), or blank for the user to fill.

Below the table the skill writes a line `**อัตราค่าบริการ:** 1 Manday = ______ บาท`. The exporter reads
the rate from the frontmatter `manday_rate`, not from this line, so the line is just a human mirror.

---

## Minimal valid example

```markdown
---
doc_type: quotation
title: ขอบเขตการพัฒนาระบบ Example
tech_stack:
  - "Front End : ASP.NET Core"
  - "Back End : .NET Core"
duration: 4 เดือน
warranty: 3 เดือน หลังจากส่งมอบ
currency: THB
manday_rate:
notes:
  - "ไม่รวม Hardware และค่าเช่า Service ต่างๆ"
---

# ขอบเขตการพัฒนาระบบ Example
... (body mirror) ...

## ขอบเขตงานและราคา

| No | Module | Description | Comment | Price |
|----|--------|-------------|---------|-------|
| 1 | **User Management** | | | |
|  |  | Login + OTP | ส่ง OTP ทาง Email | |
|  |  | Forgot / Reset password | | |
| 2 | **Report** | | | |
|  |  | Export Excel | | |
|  | **รวมทั้งหมด (Total)** | | | |

## งานนอกขอบเขต (Out of Scope / Optional)

| No | รายการ | หมายเหตุ | Manday |
|----|--------|----------|--------|
| 1 | ค่า Hardware / Server | ลูกค้าจัดหาเอง | - |
| 2 | ค่า License (OS, DB, ฯลฯ) | ลูกค้าจัดหาเอง | - |
| 3 | ค่าเช่า Cloud / Service | คิดตามจริงรายเดือน | - |
| 4 | Penetration Testing | | |

**อัตราค่าบริการ:** 1 Manday = ______ บาท
```
