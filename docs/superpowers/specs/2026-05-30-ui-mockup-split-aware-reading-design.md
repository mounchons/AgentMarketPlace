# ui-mockup — Split-Aware Design-Doc Reading (Coverage Gap Closure)

- **Date:** 2026-05-30
- **Status:** Approved design → ready for implementation plan
- **Plugin:** `ui-mockup` (target bump `1.9.0 → 1.10.0`)
- **Approach:** C — Hybrid (shared reference for the 4 gap commands + resolve-then-inject for parallel)

---

## 1. Context & Problem

`system-design-doc` (sdd) ออกเอกสารแบบใหม่เป็น **split per-section layout** (registry schema `2.3.0`):

- `.design-docs/design_doc_list.json` (registry) — `documents[].doc_layout: "split"` + `documents[].sections[]`
  (machine-map: `key` / `number` / `title` / `file` / `anchors`), base dir = `documents[].doc_dir`
- ไฟล์ section แยก: `.design-docs/<slug>/NN-<key>.md` (`01-introduction` … `10-permissions`) + `00-index.md`
- ข้อมูล structured พร้อมใช้ใน JSON: `entities[]`, `diagrams.sitemap`, `acceptance_criteria[]`, `use_cases[]`, `api_endpoints[]`

ฝั่ง `ui-mockup` อ่าน format ใหม่ได้แล้วบางส่วน (จาก commit ชุด split-aware ล่าสุด) แต่ยังมี **coverage gap**:

| Command | สถานะเดิม | ปัญหา |
|---|---|---|
| `init-mockup` | ✅ เต็ม | — (ไม่แตะ) |
| `create-mockup` | ✅ | — (ไม่แตะ) |
| `help` / `SKILL` | ✅ | — (ไม่แตะ) |
| `create-html-mockup` | ❌ | อ่าน `mockup_list.json` + ตาม `related_documents[].path` เท่านั้น — ไม่รู้จัก registry |
| `create-mockups-parallel` | ◐ | orchestrator มี split note แต่ **sub-agent prompt** ไม่ได้บอกวิธีอ่าน split → silent drift ข้าม agent |
| `validate-mockup` | ◐ | Category 7 อ่าน `design_doc_list.json` แต่ไม่ resolve ไฟล์ section ผ่าน `sections[]` |
| `edit-mockup` | ❌ | ไม่อ่าน design doc เลย |

**ความเสี่ยงเพิ่มเติม:** ถ้าแก้ด้วยการแปะ block ตรงๆ logic จะ duplicate 7 ที่ → drift หนักเวลา sdd เปลี่ยน schema

## 2. Goal & Scope

**Goal:** ปิด coverage gap ให้ 4 command อ่าน sdd split/registry format ได้ถูกต้อง โดยงานใหม่ไม่สร้าง duplication เพิ่ม

**In scope (4 commands):** `create-html-mockup`, `create-mockups-parallel`, `validate-mockup`, `edit-mockup` (พฤติกรรมใหม่)

**Out of scope:**
- ไม่แตะ 3 command ที่ทำงานดีอยู่แล้ว (`init-mockup`, `create-mockup`, `help`/`SKILL`) — migrate มาใช้ shared reference ทีหลังได้
- ไม่เปลี่ยน schema ของ `mockup_list.json`
- ไม่ทำ auto-rewrite design drift (edit-mockup เป็น warning เท่านั้น)

## 3. Chosen Approach — C (Hybrid)

สร้าง **shared reference เดียว** → ชี้เฉพาะ 4 command ใหม่มาที่นี่ + จัดการ parallel แบบ **resolve-then-inject**
(orchestrator resolve path ครั้งเดียว แล้วฝัง absolute path ลง sub-agent prompt → sub-agent ไม่ต้องรู้จัก registry)

เหตุผล: ปิด gap ครบโดย blast radius เล็ก (ไม่แตะของเดิมที่ยังไม่พัง), งานใหม่ไม่ duplicate, วาง canonical reference ไว้ให้อนาคต migrate

---

## 4. Detailed Design

### 4.1 ไฟล์ใหม่: `plugins/ui-mockup/skills/ui-mockup/references/reading-design-docs.md`

Canonical guide — "ui-mockup command resolve เอกสารจาก system-design-doc อย่างไร" เนื้อหา:

1. **Resolution order**
   1. อ่าน `.design-docs/design_doc_list.json` (registry) → ถ้ามี branch ตาม `documents[].doc_layout`:
      - `"split"` (default) → resolve ไฟล์ section ผ่าน `documents[].sections[]` โดย `key`, base = `documents[].doc_dir`
      - `"single"` / field absent → ใช้ `documents[].file_path` (legacy monolith)
   2. เช็ค `.design-docs/sitemap.json` เพิ่มถ้ามี (machine-readable pages/nodes)
   3. **Fallback (ไม่มี registry):** glob ตามลำดับ `.design-docs/*/00-index.md` → `system-design*.md` → `*sitemap*.md` → `requirements*.md` → `README.md`
2. **กฎทอง: prefer JSON over markdown** — ดึง `entities[]`, `diagrams.sitemap`, `acceptance_criteria[]`, `use_cases[]`, `api_endpoints[]` จาก registry ตรงๆ; Read ไฟล์ `.md` เฉพาะตอนต้องการ prose/diagram content
3. **Canonical resolver snippet (jq):**
   ```bash
   # resolve a section file by key
   jq -r --arg k "sitemap" '.documents[0].sections[]|select(.key==$k)|.file' .design-docs/design_doc_list.json
   ```
   (section keys: `introduction, requirements, modules, data-model, dfd, flow-diagrams, er-diagram, data-dictionary, sitemap, permissions`)
4. **Anchor contract** — หา sub-content ในไฟล์ section ผ่าน `sections[].anchors[]` regex (เช่น AC `^AC-\d+:`, UC `^### Use Case \(UC-\d+\):`)
5. **`related_documents[].path` convention** — split → `.design-docs/<slug>/NN-<key>.md`; single → `system-design.md#<anchor>`
6. **Compatibility** — split-aware กับ `design_doc_list.json` schema ≥ `2.3.0`; เก่ากว่า/ไม่มี → ใช้ fallback

> command ที่ใช้ reference นี้จะใส่ pointer สั้น: *"To resolve system-design-doc sources, follow `references/reading-design-docs.md` (registry-first, split-aware, JSON-preferred)."*

### 4.2 `create-html-mockup.md` — เพิ่ม registry fallback

- เพิ่ม **Step 1b: Resolve design doc sources (registry-aware)** หลัง Step 1 (Read `mockup_list.json`):
  - เมื่อตาม `related_documents[].path` แล้ว path ว่าง/หาย **หรือ** มี `design_doc_list.json` → resolve ผ่าน `sections[]` (ตาม reference)
  - prefer `entities[]` / `diagrams.sitemap` จาก registry แทนการ parse markdown
- คงไว้ไม่แตะ: brain-first สำหรับ nav/design tokens (Step 0/Step ที่ query brain), การอ่าน `mockup_list.json`, การ invoke `frontend-design`

### 4.3 `create-mockups-parallel.md` — resolve-then-inject

- **Orchestrator step (ก่อน spawn sub-agents):**
  - resolve ไฟล์ section ที่จำเป็น → **absolute path** (ตาม reference) + ดึง `entities[]` จาก registry ครั้งเดียว
- **Sub-agent prompt template** (บริเวณบรรทัด ~240 และ ~364): เพิ่ม block
  ```markdown
  ## Design Doc Sources (pre-resolved — DO NOT re-resolve)
  - sitemap:   <abs path or "n/a">
  - er-diagram:<abs path or "n/a">
  - data-dict: <abs path or "n/a">
  - entities:  <inline JSON from registry entities[] relevant to this page/entity>
  ```
  → sub-agent รับ path สำเร็จรูป ไม่ต้องอ่าน registry เอง (ตัด silent drift + ประหยัด Read ต่อ agent)
- บรรทัด 232 (split note ฝั่ง orchestrator) ปรับให้ชี้มาที่ reference แทนคำอธิบาย inline

### 4.4 `validate-mockup.md` — Category 7 split-aware

- เขียน **Category 7: Cross-Reference Validation** ใหม่:
  - ก่อนเช็คลึก resolve ไฟล์ section ผ่าน `sections[]`: page→`sitemap` file, field→`data-dictionary` file, entity→`er-diagram` file / registry `entities[]`
  - เพิ่ม check ใหม่: `related_documents[].path` ใน mockup **exists จริงบน disk** + ตรงกับ `sections[].file` ใน registry (จับ path drift)
- ใส่ pointer ไป reference

### 4.5 `edit-mockup.md` — พฤติกรรมใหม่ (re-sync check, non-blocking)

- เพิ่ม **Step: Design-doc consistency check** (หลังจากระบุ mockup ที่จะแก้ ก่อนลงมือแก้):
  - ถ้า mockup มี `related_documents` ชี้ section → Read section (ผ่าน reference) เทียบกับเนื้อหา mockup
  - surface drift เป็น **WARNING** (เช่น field เปลี่ยน, page เปลี่ยนชื่อ, entity หาย) — แจ้งผู้ใช้ ไม่ auto-rewrite
  - ถ้าไม่มี `related_documents` / ไม่มี registry → ข้าม step เงียบๆ (ไม่ block การแก้)

---

## 5. Verification

Plugin = ไฟล์ markdown (instructions-for-agent) ไม่มี automated test runner — verification:

1. **Self-consistency grep:** ทั้ง 4 command อ้าง `reading-design-docs.md` และมี resolution marker (`doc_layout` / `sections[` / `design_doc_list`)
2. **(optional) Fixture dry-run:** สร้าง `.design-docs/` split เล็กๆ (registry + 2-3 section files) แล้วเดินตาม step ของแต่ละ command ตรวจว่า resolve path ได้ถูกไฟล์
3. **Docs + version sync:**
   - bump `plugins/ui-mockup/.claude-plugin/plugin.json` `1.9.0 → 1.10.0` + อัปเดต description
   - อัปเดต `commands/help.md` (เพิ่ม reference + พฤติกรรมใหม่ของ 4 command) และ `README.md`
   - sync `.claude-plugin/marketplace.json` ui-mockup `1.9.0 → 1.10.0` + description
4. **Brain note:** update coverage/version ของ ui-mockup

## 6. Files Touched (สรุป)

| ไฟล์ | การเปลี่ยน |
|---|---|
| `skills/ui-mockup/references/reading-design-docs.md` | **ใหม่** — canonical reading guide |
| `commands/create-html-mockup.md` | + Step 1b registry fallback + pointer |
| `commands/create-mockups-parallel.md` | resolve-then-inject + sub-agent prompt block + pointer |
| `commands/validate-mockup.md` | Category 7 split-aware + path-exists check + pointer |
| `commands/edit-mockup.md` | + design-doc consistency check (non-blocking) + pointer |
| `commands/help.md`, `README.md` | document พฤติกรรมใหม่ |
| `.claude-plugin/plugin.json` | bump 1.10.0 + description |
| `.claude-plugin/marketplace.json` | sync ui-mockup 1.10.0 |

## 7. Resolved Decisions

- เป้าหมาย: ปิด coverage gap (ไม่ใช่ refactor เต็มรูปแบบ)
- Scope: 4 commands รวม `edit-mockup` (พฤติกรรมใหม่)
- โครงสร้าง: Hybrid (shared reference เฉพาะ 4 ตัวใหม่) + resolve-then-inject สำหรับ parallel
- `edit-mockup` = warning อย่างเดียว ไม่ auto-rewrite
