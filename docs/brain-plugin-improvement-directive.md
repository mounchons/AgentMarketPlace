---
title: "brain (graph-brain) Plugin — Improvement Directive"
audience: Claude Code / plugin maintainer
author: พี่ปู
date: 2026-07-07
status: draft
based_on: brain audit (2496 nodes / 5866 relationships), 2026-07-07
---

# brain Plugin — Improvement Directive

> คำสั่งปรับปรุง **graph-brain** (Neo4j + Graphiti MCP) เขียนจากผล audit ของจริง
> เอกสารนี้ใช้สั่ง Claude Code / คนดูแล plugin ให้ลงมือแก้ได้เลย

---

## 1. เป้าหมายปลายทาง (goal ก่อน)

> **agent ต้องเจอความรู้ที่ถูกต้อง ด้วย token น้อยที่สุด และได้ connection ที่เกี่ยวข้องครบที่สุด**

ทุก directive ในเอกสารนี้วัดกลับมาที่ประโยคเดียวนี้ ถ้าการเปลี่ยนแปลงไม่ขยับ 1 ใน 3 แกน (ความถูกต้อง / token / connection) → ไม่ทำ

---

## 2. สภาพปัจจุบัน (audit findings — 2026-07-07)

| ตัวชี้วัด | ค่าจริง | อ่านว่า |
|---|---|---|
| Nodes / Relationships | 2,496 / 5,866 | ระบบโตจริง ใช้งานต่อเนื่อง |
| Notes | 611 | ครอบคลุม 21 projects |
| **Tags (unique)** | **1,533** | ⚠️ มากกว่าจำนวนโน้ต 2.5 เท่า |
| LINKS_TO (wikilink) | 717 → **~1.17 / โน้ต** | ⚠️ เบาบางเกินไป |
| TAGGED | 4,157 → ~6.8 / โน้ต | การเชื่อมโยงพึ่ง tag เป็นหลัก |
| RELATED_TO | 79 | semantic edge เบาบาง |
| Folders / IN_FOLDER | 237 / 577 | โครงลำดับชั้นแน่น |
| NoteHistory / HAS_HISTORY | 68 / 68 | versioning ทำงาน ✅ |

### Scorecard

| หมวด | เกรด |
|---|---|
| ความครอบคลุม | A |
| ประหยัด token | A− |
| ค้นเจอง่าย (findability) | A− |
| เชื่อมโยงผ่าน wikilink | **C** |
| สุขอนามัย tag | **D** |
| โครงสร้าง / curation | B+ |
| **รวม** | **~7.5–8 / 10** |

**ยืนยันด้วยการทดสอบจริง:** ยิง query `multi-tenant soft delete global query filter` คืน 6 โน้ตตรงประเด็นทั้งหมด (findability ดี, token ลีน) และ explore รอบ node เดียวได้ 101 nodes / 125 edges (เชื่อมโยงแน่น) — **แต่** การเชื่อมโยงส่วนใหญ่แบกอยู่บน tag ซึ่งดันแตกตัว

---

## 3. สาเหตุราก (domain framing)

มอง brain เป็น domain model:

- **Note** = Aggregate Root — สภาพดี เนื้อหาเป็น synthesis note คุณภาพสูง
- **Tag** = Value Object ที่ควร normalize — **แต่ตอนนี้ไม่ normalize** จึงมี value เดียวกันสะกด 4 แบบ
- **LINKS_TO** = relationship ระหว่าง aggregate — **ใส่ไม่ครบ** (foreign key half-populated)

> **อุปมา (DDD):** brain พี่เหมือน database ที่ row (โน้ต) ดีเยี่ยม + full-text index (search) ทำงานเยี่ยม แต่ **foreign key ใส่ไว้ครึ่งเดียว** และมีคนพิมพ์ค่า lookup เดียวกัน 4 แบบ (`efcore` / `ef-core` / `entity-framework`) → **JOIN บางเส้นพลาดแถวเงียบ ๆ** ทั้งที่ข้อมูลมีอยู่
>
> ซ่อม lookup table (tag vocab) + backfill FK (wikilink) → ข้อมูลชุดเดิมจะเชื่อมกันดีขึ้นทันที **โดยไม่ต้องเพิ่มโน้ตใหม่เลย**

### หลักฐาน tag แตกตัว (จาก tag cloud จริง)

- .NET: `dotnet` / `dotnet-core` / `dotnet-framework` / `dotnet9` / `dotnet-9` / `dotnet8` / `net8` / `net10`
- EF: `ef-core` / `efcore` / `entity-framework` / `entity-framework-core`
- ASP: `aspnet-core` / `asp-net-core` / `aspnetcore` / `aspnet` / `asp-net`
- Project: `buntruk` / `buntrukhub` / `buntrakhub` (พิมพ์ผิด)
- คู่เอกพจน์-พหูพจน์: `role`/`roles`, `permission`/`permissions`, `controller`/`controllers`, `pattern`/`patterns`
- **ปน metadata:** date เป็น tag (`2026-06-03` = 24 ครั้ง), status flag เป็น tag (`gold-news-seen` = 28, `auto-generated` = 8)

---

## 4. คำสั่งปรับปรุง (เรียงตาม impact / effort)

### D1 — Tag Normalization Layer *(impact: สูงสุด / effort: ต่ำ)*

**ปัญหา:** value object `Tag` ไม่ถูก normalize → connection แตก

**ต้องแก้ที่ plugin:**
1. เพิ่ม **canonical tag registry** (ตาราง alias → canonical) — ดู Appendix A เป็นชุดตั้งต้น
2. ใน `save-knowledge`: ก่อนสร้าง Tag node ให้ resolve ผ่าน registry เสมอ (`efcore` → `ef-core`) ถ้าไม่มีใน registry ให้ warn ว่าเป็น tag ใหม่ พร้อมเสนอ tag ใกล้เคียง (edit distance ≤ 2)
3. ใน `search-by-tags` / `search-knowledge`: expand query tag ด้วย alias (ค้น `ef-core` ให้ครอบ `efcore` ด้วย) ระหว่างที่ยังไม่ migrate ข้อมูลเก่า
4. เขียน **one-off migration**: MERGE tag node ที่เป็น alias เข้า canonical แล้วย้าย TAGGED edge ตาม

**Acceptance:** จำนวน unique tag ลดจาก 1,533 → เป้า < 500; ไม่มีคู่ tag ที่ edit distance ≤ 1 เหลือแยกกัน

---

### D2 — แยก metadata ออกจาก knowledge tag *(impact: สูง / effort: ต่ำ)*

**ปัญหา:** date และ status flag ปนใน tag cloud ทำให้ tag ความรู้เจือจาง

**ต้องแก้ที่ plugin:**
1. **date** (`2026-06-03` ฯลฯ) → ย้ายเป็น property `created_at` / `source_date` ของ Note **ไม่ใช่ Tag**
2. **status flag** (`gold-news-seen`, `auto-generated`, `pending`) → แยกเป็น label/property ต่างหาก (เช่น `:Flag` node หรือ property `status`) ออกจาก `:Tag`
3. `save-knowledge`: reject/redirect ถ้ามีคนพยายามใส่ date-string หรือ known flag เข้าช่อง `tags`

**Acceptance:** tag cloud เหลือเฉพาะ "หัวข้อความรู้" ล้วน ไม่มี date / workflow flag

---

### D3 — Wikilink Booster + Lint *(impact: สูง / effort: กลาง)*

**ปัญหา:** LINKS_TO ~1.17/โน้ต บางเกินไป → เชื่อมโยงแบก tag ฝ่ายเดียว

**ต้องแก้ที่ plugin (เพิ่ม tool ใหม่ `brain-lint`):**
1. สแกนหา **orphan note** (LINKS_TO = 0) และคืนรายการ
2. ต่อโน้ต แนะนำ `[[...]]` ที่ควรเพิ่ม โดยดูจากโน้ตที่ share tag/project เดียวกันแต่ยังไม่ลิงก์
3. ตรวจ **stale note** (ไม่ถูก update เกิน N วัน + มี tag เวอร์ชันเก่า) 
4. ตรวจ **duplicate-candidate tag** (edit distance ≤ 2) เสนอ merge
5. ตั้งเป้า wikilink บน permanent/pattern note จาก ~1.2 → **≥ 3 / โน้ต**

> นี่คือแนวคิด **lint ของ llm-wiki** (Karpathy) เอามาใช้กับ graph — จุดที่ markdown wiki บังคับให้ทำ dense link + lint คือ 2 จุดอ่อนของ brain พอดี

**Acceptance:** มี tool `brain-lint` เรียกได้; orphan note < 5%; permanent note เฉลี่ย ≥ 3 wikilink

---

### D4 — Controlled Tag Taxonomy *(impact: กลาง / effort: ต่ำ)*

**ปัญหา:** ไม่มี vocabulary กลาง → agent ประดิษฐ์ tag ใหม่เรื่อย ๆ

**ต้องแก้ที่ plugin:**
1. ทำ taxonomy กลาง 2 ชั้น: `namespace/value` (พี่เริ่มดีแล้วกับ `solution/`, `domain/`, `audience/`, `content/`, `problem/`, `source/`) ขยายให้ **tech-tag และ project-slug เป็น enum ตายตัว**
2. ใส่ list canonical นี้ในคำอธิบาย tool `save-knowledge` ให้ agent เลือกจากของเดิมก่อนสร้างใหม่
3. tech-tag ต้องมาจาก enum เดียว (ดู Appendix B)

**Acceptance:** tag ใหม่ที่สร้างหลัง migration ต้องอยู่ใน taxonomy หรือผ่านการ confirm ว่าเป็นหัวข้อใหม่จริง

---

### D5 — Overview / MOC per Project *(impact: กลาง / effort: กลาง)*

**ปัญหา:** agent ต้องค้นทีละครั้ง ไม่มี "แผนที่" ราคาถูกให้เข้าก่อน

**ต้องแก้ที่ plugin (เพิ่ม tool `brain-generate-moc`):**
1. ต่อ project สร้าง/อัปเดต **overview note** (Map of Content) ที่ `[[...]]` ออกไปหาโน้ตย่อยทั้งหมด
2. agent workflow: อ่าน overview 1 ใบ → ได้แผนที่ → fetch เฉพาะจุด (นี่คือ token-saver ตัวจริง = pattern `index.md` ของ Karpathy)

**Acceptance:** ทั้ง 21 project มี overview note ที่ลิงก์ครบ; retrieval งานข้ามโดเมนใช้ token ลดลงวัดได้

---

### D6 — Provenance / freshness hygiene *(impact: ต่ำ-กลาง / effort: ต่ำ)*

**ปัญหา:** โน้ตบางส่วนอาจ mirror source เล็ก ๆ ที่ไม่ได้ synthesis (จากบทเรียน token ของ llm-wiki — mirror ไม่ช่วยประหยัด token)

**ต้องแก้ที่ plugin:**
1. `brain-lint` เพิ่ม flag โน้ตที่ **สั้นและไม่มี wikilink ออก** (น่าจะเป็น mirror ไม่ใช่ synthesis)
2. เสนอ merge เข้าโน้ต synthesis ที่ใหญ่กว่า

**Acceptance:** ระบุ mirror-note ที่ควบรวมได้; สัดส่วน synthesis note เพิ่มขึ้น

---

## 5. ลำดับลงมือ (rollout)

1. **D2 → D1** ก่อน (metadata ออกก่อน แล้วค่อย normalize tag ที่เหลือ) — quick win, ไม่กระทบ schema ใหญ่
2. **D4** ต่อ (ล็อก vocabulary กันปัญหากลับมา)
3. **D3** สร้าง `brain-lint` (เป็นเครื่องมือถาวรที่ค้ำ D1/D2 ไปยาว)
4. **D5** MOC (ต่อยอดหลัง link แน่นแล้ว)
5. **D6** (ทำเรื่อย ๆ ผ่าน lint)

> รัน `brain-lint` เป็นรอบ (เช่นสัปดาห์ละครั้ง) หลังจากนี้ → กันไม่ให้กลับไปสภาพ tag แตกตัวอีก

---

## Appendix A — Tag Normalization Map (ชุดตั้งต้นจากของจริง)

> จับคู่ alias → canonical สำหรับ D1 migration (ตัวอย่าง high-impact ไม่ใช่ทั้งหมด)

| canonical | aliases ที่ต้อง merge เข้า |
|---|---|
| `dotnet` | dotnet-core, dotnet-core-9 |
| `dotnet-framework` | *(คงแยก — legacy 4.x ต่างจริง)* |
| `net9` / `net10` / `net8` | *(ย้ายเป็น property version แทน tag)* |
| `ef-core` | efcore, entity-framework-core, entity-framework |
| `ef6` | *(คงแยก — legacy)* |
| `aspnet-core` | asp-net-core, aspnetcore, aspnet, asp-net |
| `aspnet-mvc` | mvc *(เมื่อหมายถึง asp.net mvc), aspnet-mvc, mvc-frontend* |
| `webforms` | web-forms |
| `buntrukhub` | buntruk, buntrakhub |
| `compareprice` | compare-price |
| `repository-pattern` | repository |
| `roles` | role |
| `permissions` | permission |
| `controllers` | controller |
| `pattern` | patterns |
| `bugfix` | bug-fix |
| `bug` | bugs |
| `yolo` | yolov8 *(version → content)* |
| `postgresql` | postgres |
| `k8s` | kubernetes *(เลือกอันเดียวเป็นมาตรฐาน)* |

**ลบออกจาก tag (→ ย้ายเป็น metadata/flag):**
`2026-06-01`, `2026-06-02`, `2026-06-03`, `2026-06-04`, `2025` (→ property date)
`gold-news-seen`, `auto-generated`, `pending`, `pending-confirm` (→ status flag)

---

## Appendix B — โครง Controlled Taxonomy ที่แนะนำ

```
tech/          → enum ตายตัว: dotnet, ef-core, postgresql, redis, docker, kafka, neo4j, ...
project/       → 1 slug ต่อ 1 project: buntrukhub, wareo, concreterent, lottohub, scenarioforge, ...
domain/        → domain/booking, domain/fleet, domain/accounting, ... (มีแล้ว — ขยายต่อ)
audience/      → audience/sme, audience/employee, ... (มีแล้ว)
solution/      → solution/ocr, solution/dashboard, ... (มีแล้ว)
pattern/       → pattern/repository, pattern/cqrs, pattern/multi-tenant, ...
content/       → content/youtube, content/blog, ... (มีแล้ว)
```

**กฎ:** tag ที่ไม่มี namespace = หัวข้อความรู้ทั่วไป (จำกัดจำนวน); ทุก tech/project ต้องมี namespace และมาจาก enum

---

## หมายเหตุ

- ปรับที่ **plugin behavior** (save/search/lint) ไม่ใช่แค่ clean ข้อมูลครั้งเดียว — เพื่อกันปัญหา regress
- ทุก migration ให้ snapshot ก่อน (มี NoteHistory อยู่แล้ว ใช้กลไกนี้)
- วัดผลก่อน/หลังด้วย `brain-stats`: unique tag count, avg LINKS_TO/note, orphan ratio
