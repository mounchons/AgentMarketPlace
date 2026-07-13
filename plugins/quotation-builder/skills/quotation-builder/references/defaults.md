# Standing defaults

The user's standard values, baked into every new quotation draft. **Edit this file to change them
globally** — the template and the skill seed from here.

> Scope of "default": these apply to the **Manday rate** and the **out-of-scope section** only.
> The **module Price column and the grand total are NOT defaulted** — they are per-project and always
> ship blank for the user to fill.

## Manday rate

```
manday_rate: 8000     # บาท / Manday
```

Put this straight into the frontmatter of every draft (`manday_rate: 8000`). The user can override per
quote. The `1 Manday = ____` line in the body then renders as `1 Manday = 8,000 บาท`.

## Standard out-of-scope section (default rows)

Every draft ships with these rows. Rows 1–3 are pure exclusions (client procures → Manday `-`).
Rows 4–7 are optional work priced by Manday, pre-filled with the user's typical estimates (override per
project if the real effort differs).

| No | รายการ | หมายเหตุ | Manday |
|----|--------|----------|--------|
| 1 | ค่า Hardware / Server | ลูกค้าจัดหาเอง | - |
| 2 | ค่า License (OS, Database, Software เชิงพาณิชย์, SSL) | ลูกค้าจัดหาเอง | - |
| 3 | ค่าเช่า Cloud / Service รายเดือน (AWS/Azure ฯลฯ) | คิดตามการใช้งานจริง | - |
| 4 | Penetration Testing | ทดสอบเจาะระบบก่อน go-live | 5 |
| 5 | ย้าย Cloud — เจ้าเดิม เปลี่ยน Account | ค่าติดตั้งใหม่ ไม่รวม Pentest ที่ใหม่ | 3 |
| 6 | ย้าย Cloud — เจ้าใหม่ (ใช้ OAuth เดิม) | ค่าย้าย+ติดตั้ง ไม่รวม Pentest | 10 |
| 7 | ย้าย Cloud — เจ้าใหม่ (เปลี่ยน OAuth) | ค่าย้าย+ติดตั้ง ไม่รวม Pentest | 20 |

### How the skill uses this

- **Always** emit rows 1–3 (Hardware / License / Cloud-Service exclusions).
- **Emit rows 4–7 by default**; drop or adjust one only if it is clearly irrelevant to the project
  (e.g. no cloud deployment → the "ย้าย Cloud" rows may be trimmed) or the user says so.
- These Manday numbers are **defaults, not locked** — if the user gives a different effort for a specific
  quote, use theirs.

### Optional extras (add when relevant — not in the default set)

Pull these from `out-of-scope-catalog.md` when the scope calls for them: VPN Site-to-Site, Data Migration,
external-API integration, extra UAT/training, post-warranty fixes, yearly Support/Maintenance (SLA).
