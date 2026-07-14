---
title: "OKF v0.1 formal SPEC.md → brain v3.4 Conformance Gap Analysis"
date: 2026-07-14
status: analysis-complete, awaiting decision on G1/G2
based_on:
  - plans/brain-v34-okf-20260710/RESEARCH.md (design mapping — อิงบล็อกอย่างเดียว)
sources:
  - https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md  (**ใหม่** — formal spec, ยังไม่เคยเทียบใน RESEARCH.md)
  - https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing
compared_against:
  - plugins/brain/GRAPH_PROTOCOL.md §8 (OKF Interchange Mapping v3.4)
  - plugins/brain/skills/brain-export/SKILL.md
  - plugins/brain/skills/brain-import/SKILL.md
---

# OKF v0.1 formal SPEC.md → brain v3.4 Conformance Gap Analysis

> **บริบท:** RESEARCH.md (v3.4 design) เทียบ brain กับ *บล็อก* OKF เท่านั้น — บล็อกให้แนวคิด
> แต่ **SPEC.md** ให้กฎ conformance (§6/§7/§9/§11) ที่ละเอียดกว่า การเทียบครั้งนี้ใช้ SPEC.md
> เป็น authority → พบ **2 จุดขัดสเปกจริง (G1, G2)** + 2 gap ด้าน completeness (G3, G4)
> ที่ RESEARCH.md เดิมมองไม่เห็นเพราะไม่มี SPEC.md ในมือ

---

## 1. Method

เทียบทีละข้อกำหนดของ SPEC.md v0.1 (§1–§11) กับสิ่งที่ brain v3.4 ทำจริงใน §8 + 2 skill
สถานะ: ✅ ครบ/เกิน · 🟡 gap เชิง completeness · 🔴 ขัดสเปก (conformance)

---

## 2. Scorecard (SPEC.md formal requirement → brain v3.4)

| SPEC.md requirement | ถ้อยคำสเปก | brain v3.4 | สถานะ |
|---|---|---|---|
| Bundle = directory tree, 1 concept = 1 `.md` | §1–§2 | §8.1 layout 1 note = 1 ไฟล์ | ✅ |
| `type` required, tolerate unknown types | §3 "non-empty `type`" | export derive จาก category/tag; import บังคับมี `type` | ✅ |
| recommended fields title/description/resource/tags/timestamp | §3 | §8.2 map ครบทั้ง 5 | ✅ |
| body conventional `# Schema`/`# Examples`/`# Citations` | §5, §8 | body opaque (ไม่ map/generate) | 🟡 (optional) |
| cross-link: absolute (`/…`) + relative | §5 | export→relative; import→รับทั้งสอง | ✅ |
| relationship อยู่ใน **body link เท่านั้น** ไม่ใช่ frontmatter | §5 | wikilink ↔ markdown link (ไม่มี frontmatter relations) | ✅ |
| **Concept ID = file path (ตัด `.md`)** | §? "Concept ID — path of the file, `.md` removed" | brain identity = **`title`** (§8.1) | 🟡 (semantic diff → G4) |
| `index.md` = progressive disclosure | §6 | MOC → index.md (§8.4) | ✅ |
| **"Index files contain no frontmatter"** (root ยกเว้นเฉพาะ `okf_version`) | §6/§11 | index.md มี `type: Index` / MOC frontmatter | 🔴 **G2** |
| `log.md` = change history, **ห้ามมี frontmatter** | §7 | ไม่ export log.md; import skip log.md ไร้ frontmatter (ถูก) | 🟡 export gap → G3 |
| conformance: consumer ห้าม reject เพราะ field/type/key/link/index ขาด | §9 | import tolerant ครบ (per-file degrade) | ✅ |
| **`okf_version: "0.1"` ใน bundle-root index.md** (optional) | §11 | ไม่ emit, ไม่ read | 🔴 **G1** |
| อ้าง external schema (Avro/Proto/OpenAPI) ไม่ subsume | design | ไม่เกี่ยว | — |

**สรุป coverage:** แนวคิดหลัก OKF brain ครอบคลุม **ครบและเกิน**; แต่กับ SPEC.md เป๊ะ ยังมี
2 จุดขัด (G1, G2) + 2 gap (G3, G4)

---

## 3. Confirmed Gaps

### 🔴 G1 — ไม่มี `okf_version: "0.1"` (conformance marker) — **P1, effort ต่ำ**
- **สเปก (verbatim):** "Bundles MAY declare the OKF version they target by including
  `okf_version: "0.1"` in a bundle-root `index.md` frontmatter block (the only place
  frontmatter is permitted in an `index.md`)."
- **brain:** root index.md มีแค่ header `> Exported: … @ commit …` + `type: Index`/`project` — ไม่มี `okf_version`
- **ผล:** bundle ไม่ประกาศเวอร์ชันสเปกที่ target → consumer/visualizer เดาเอง; เป็น optional
  แต่เป็น best-practice interop ที่ควรมี
- **Fix:** export ใส่ `okf_version: "0.1"` ใน frontmatter ของ **root index.md เท่านั้น**;
  import อ่านค่า → ถ้า major ต่าง (เช่น `1.x`) เตือนใน dry-run

### 🔴 G2 — index.md ไม่ควรมี frontmatter (ยกเว้น root/`okf_version`) — **P1, effort กลาง**
- **สเปก (verbatim):** "Index files contain no frontmatter." + "(the only place frontmatter
  is permitted in an `index.md`)" = เฉพาะ `okf_version` ที่ root
- **brain:** generated index.md มี `type: Index`; MOC-derived index.md พก frontmatter ของ note
  (type/title/…) มาด้วย → **ขัดกฎ "no frontmatter"**
- **ผล:** OKF-strict consumer / static visualizer อาจ mis-parse index; ปัจจุบัน brain พึ่ง
  `type: Index` เพื่อแยก "generated index" ออกจาก "MOC" ตอน re-import (§8.4) → ถ้าลบ frontmatter
  ต้องหา marker อื่น
- **Fix (เสนอ):** index.md เขียนแบบ **body-only** ตาม §6 (`# Section` + `* [Title](path) — desc`);
  ย้าย marker "generated" ไปเป็น **HTML comment** `<!-- okf:generated-index -->` (ไม่ใช่ frontmatter);
  import จำแนกจาก comment + โครงสร้าง แทน `type: Index`; root index.md เก็บได้เฉพาะ `okf_version`
- **หมายเหตุ:** ต้องแก้ทั้ง §8.4 (export write) + import classification (brain-import step 3)

### ✅ G3 — export `log.md` change-history — **DONE (v3.4.2, 2026-07-14)**
- **สเปก:** `log.md` = change history, date-grouped `YYYY-MM-DD`, prefix `**Update**`/`**Creation**`
- **แก้แล้ว (GRAPH_PROTOCOL §8.7 + brain-export SKILL):** export สร้าง root `log.md` frontmatter-free
  (`<!-- okf:changelog -->` + `# Changelog` + date sections newest-first). **Default = ฟรี** ใช้ `createdAt`
  ที่ get-knowledge ดึงมาแล้ว (§8.2 — server expose แค่ `Created:` → ส่วนใหญ่เป็น `**Creation**`);
  flag `--history-detail` เรียก `get-note-history` ทีละ note สำหรับ `**Update**` + reason จริง (เตือน N calls)
- log.md เป็น derived/export-only (ไม่ round-trip); import skip (NoteHistory = internal source of truth)
- **บทเรียน design:** เลือก timestamp-based default (ไม่มี call เพิ่ม) แทน NoteHistory-based เพราะ get-note-history
  ต่อ note = double call count; rich history เป็น opt-in ตาม pattern เตือน cost ของ skill
- **UPDATE v3.4.4 (จาก visualizer test — ดู §6):** flip log.md เป็น **opt-in `--log` (default OFF)** — reference
  visualizer reserve แค่ index.md ไม่ reserve log.md → default-on ทำให้เกิด spurious hub node; default OFF กัน

### ✅ G4 — identity semantics ต่าง (path vs title) — **DONE (v3.4.3, doc §8.1)**
- **สเปก:** "Concept ID = the path of the concept's file within the bundle, `.md` removed"
  → OKF key ด้วย **path**
- **brain:** identity = **`title`** (upsert-by-title, GLOBAL scope — §8.1/§2); slug/path เป็นแค่กัน
  ไฟล์ชน
- **ผล:** round-trip ภายใน brain ไม่มีปัญหา; แต่ **cross-system**: external OKF consumer มอง path
  เป็น stable ID ส่วน brain มอง title → ถ้า title เปลี่ยนแต่ path เดิม (หรือกลับกัน) สองระบบ key ต่างกัน
- **Fix:** doc ใน §8.1 ระบุ semantic diff ให้ชัด (ไม่ต้องแก้ code) — เตือนผู้ใช้ cross-system

### ✅ G5 — conventional body headings (`# Schema`/`# Citations`) — **DONE (v3.4.3, doc §8.2)**
- brain ใส่ provenance เป็นบรรทัด `Source: <pointer>` แทน `# Citations`; ไม่ generate `# Schema`
- optional ทั้งหมด — **แก้เป็น doc:** §8.2 ระบุว่า `Source:` line ทำหน้าที่แทน `# Citations` แต่คงเป็น line (ไม่ใช่ heading)
  เพื่อ round-trip readback; schema คงอยู่ใน body — nothing lost, brain-idiomatic rendering (ไม่เปลี่ยน behavior)

---

## 4. สิ่งที่ brain **เกิน** OKF (value-add ที่สเปกไม่มี)

OKF v0.1 จงใจ minimal — brain วางตัวเป็น "rich backend + OKF เป็น interchange" (pattern pg_dump)
สิ่งที่ brain มีแต่ OKF ไม่มี และ **ต้องรักษาไว้** ไม่ให้ "ไล่ตามสเปก" ทำเสียของ:
- **Write gate** — secret scan (§6.3) + Tag Taxonomy (§1) + dry-run propose-don't-execute (§7.1)
- **Freshness ผูก commit-hash** (OKF มีแค่ `timestamp`)
- **NoteHistory versioning** (OKF พึ่ง git อย่างเดียว)
- **Typed graph traversal + cross-project** (OKF = untyped directed edges, ไม่มี cross-bundle)
- **Provenance dual-write** (`source` param + `Source:` line) — เกิน `resource` field ของ OKF

---

## 5. Recommendation — STATUS (2026-07-14: G1-G5 + visualizer test ปิดครบ 100%)

1. ✅ **G1 + G2 (v3.4.1)** — conformance fix: bundle อ้าง OKF v0.1 ได้จริง (okf_version + frontmatter-free index)
2. ✅ **G3 (v3.4.2 → v3.4.4)** — export log.md change-history; **flip เป็น opt-in `--log`** หลัง visualizer test (§6)
3. ✅ **G4 + G5 (v3.4.3, docs)** — identity-semantics (§8.1) + conventional-heading equivalence (§8.2)
4. ✅ **ทดสอบ Google reference visualizer (v3.4.4, §6)** — รัน `generate_visualization` จริง: G1/G2/G4/concept ผ่าน;
   เจอ reference ไม่ reserve log.md → flip log.md เป็น opt-in
5. ✅ **RESEARCH.md `sources:` อัปเดตแล้ว** (เพิ่ม SPEC.md + pointer มาไฟล์นี้) — กันรุ่นถัดไปพลาดกฎ conformance เพราะอิงบล็อกอย่างเดียว

---

## 6. Reference Visualizer Test (2026-07-14, v3.4.4)

รัน **`reference_agent` `generate_visualization`** ตัวจริงจาก [knowledge-catalog](https://github.com/GoogleCloudPlatform/knowledge-catalog) (บันทึกวิธี: curl `bundle/document.py` + `viewer/generator.py` + assets → ประกอบ minimal package → รันกับ test bundle ตามฟอร์แมต export)

**อ่าน parser (`viewer/generator.py` `_walk_concepts`) + รันจริง — ผล:**
| ฟีเจอร์ | ผล |
|---|---|
| G2 frontmatter-free index.md | ✅ `if md_path.name == "index.md": continue` — skip, content ไม่ถูกแตะ, ไม่ error |
| G1 okf_version | ✅ ignored (index.md skip ทั้งไฟล์); ไม่มีการอ่าน okf_version |
| G4 path-identity | ✅ `concept_id = "/".join(rel.parts)` — key ด้วย path เป๊ะ |
| concept files | ✅ parse lenient, **ไม่เรียก `validate()`** — frontmatter ขาด key ไม่ error; `fm.get("type") or "Unknown"` |
| non-ASCII (Thai) slug | ✅ visualize path ไม่เรียก `_validate_segment` (paths.py) → Thai slug ใช้ได้ (เกินคาด — เดิมกังวลว่าจะ fail) |
| **G3 log.md** | ⚠️ reserve **แค่ index.md ไม่ reserve log.md** → log.md = node ปลอม (id `log`, type `Unknown`, link ทุกโน้ต) |

**การรันจริง (test bundle 2 concept + index + log):** `CONCEPTS walked: 3` (รวม `log` ปลอม), `edges: 4`, viz.html 14289 bytes ไม่ crash → ยืนยัน finding

**การตัดสินใจ:** flip log.md เป็น opt-in `--log` (default OFF) — reference visualizer เป็น consumer จริงตัวเดียวตอนนี้ + log.md optional ใน spec → default OFF interop-first (§8.7)

**Reference-agent gap (จด — อาจ report upstream):** `viewer/generator.py::_walk_concepts` + `bundle/index.py::regenerate_indexes` reserve แค่ `index.md` ไม่ครอบ `log.md` ที่ SPEC.md §7 นิยามเป็น reserved
