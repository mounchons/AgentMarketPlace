# Out-of-scope & optional-work catalog

A reusable menu for the **งานนอกขอบเขต (Out of Scope / Optional)** section. Two kinds of rows:

- **Pure exclusions** — things the *client procures*, not work you do. Manday = `-`. Their purpose is to
  protect the quoted price ("this number does not include X").
- **Optional work** — extra work you *could* do if asked, priced by Manday. Manday = blank for the user
  to fill (or a number if the user dictates one).

Never write a baht amount here — only Manday counts, and only when the user gives them. The
`1 Manday = ____` rate lives in the frontmatter `manday_rate` and stays blank until the user fills it.

---

## Always include (the user's standing exclusions)

| รายการ | หมายเหตุ | Manday |
|--------|----------|--------|
| ค่า Hardware / Server | ลูกค้าจัดหาเอง | - |
| ค่า License (OS, Database, Software เชิงพาณิชย์, SSL ฯลฯ) | ลูกค้าจัดหาเอง | - |
| ค่าเช่า Cloud / Service รายเดือน (เช่น AWS, Azure) | คิดตามการใช้งานจริง | - |

## Common optional work (include when relevant)

| รายการ | หมายเหตุ | Manday |
|--------|----------|--------|
| Penetration Testing | ทดสอบเจาะระบบก่อน go-live | _ (เช่น 5 Manday) |
| ย้าย Cloud — เจ้าเดิม เปลี่ยน Account | ค่าติดตั้งใหม่ ไม่รวม Pentest ที่ใหม่ | _ (เช่น 3 Manday) |
| ย้าย Cloud — เจ้าใหม่ (ใช้ OAuth เดิม) | ค่าย้าย+ติดตั้ง ไม่รวม Pentest | _ (เช่น 10 Manday) |
| ย้าย Cloud — เจ้าใหม่ (เปลี่ยน OAuth) | ค่าย้าย+ติดตั้ง ไม่รวม Pentest | _ (เช่น 20 Manday) |
| VPN Site-to-Site | ลูกค้า config ฝั่งตนเอง | - |
| Data Migration จากระบบเดิม | ต้องดูปริมาณ/รูปแบบข้อมูลก่อน | _ |
| เชื่อม API ภายนอก (ต่อระบบ third-party) | ขึ้นกับ spec ที่ปลายทางให้ | _ |
| UAT / อบรมการใช้งานเพิ่มเติม | นอกเหนือรอบที่กำหนด | _ |
| งานแก้ไขหลังหมดประกัน | คิดเป็นรายครั้ง | _ |
| Support / Maintenance รายปี (SLA) | สัญญาแยกต่างหาก | _ |

## Guidance

- Put the three "always include" rows at the top of every quote.
- Add optional-work rows only when the scope makes them plausible (e.g. add cloud-migration rows when the
  system is deployed on cloud; add "เชื่อม API ภายนอก" when integration is in scope).
- The `_ (เช่น N Manday)` values above are **illustrative anchors from the user's past quotes**, not
  quotes themselves — leave the actual Manday cell blank in the draft unless the user gives a number.
- Reference points from past quotes (do not auto-apply): `1 Manday = 8,000 บาท`; Pentest ≈ 5 Manday;
  cloud move (same provider, new account) ≈ 3 Manday; new provider ≈ 10–20 Manday.
