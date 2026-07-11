---
name: brain-import
description: "Import an Open Knowledge Format (OKF v0.1) bundle into Graph Brain — parse markdown + YAML frontmatter into notes + LINKS_TO, every tag passes the Tag Taxonomy write gate, dry-run report is the default with explicit user confirmation before any write. Accepts bundles from brain-export, other teams, or external enrichment agents.
  USE THIS SKILL when the user wants to import a knowledge bundle, ingest OKF files into brain, restore an exported bundle, or merge external knowledge into the graph.
  Thai triggers: 'import ความรู้', 'import brain', 'นำเข้า bundle', 'รับ OKF เข้า brain', 'เอาความรู้เข้า brain', 'restore bundle'"
user_invocable: true
argument-hint: "[bundle-dir] [--project <name>] [--no-overwrite] — default bundle: .brain-export/{basename of cwd}/"
---

# Brain Import (OKF Bundle)

ALL responses MUST be in Thai language.

**Graph Protocol:** Follow `${CLAUDE_PLUGIN_ROOT}/GRAPH_PROTOCOL.md` — **§8 OKF Interchange Mapping (กฎหลักของ skill นี้ — reverse mapping §8.2, link import §8.3, MOC import §8.4, write gate §8.5)**, §1 Save Rules (Tag Taxonomy), §2 upsert semantics, §6.3 secret check, §7.1 propose-don't-execute

## Why a Write Gate (หัวใจของ skill นี้)

Import คือด้านเสี่ยงของ interchange — bundle มาจากภายนอก (ทีมอื่น / enrichment agent / ไฟล์เก่า) แล้ว**เขียนเข้า graph**:

- secret ที่หลุดเข้า graph **ลบถาวรไม่ได้** (version history เก็บทุกอย่าง — §6) → ต้อง scan ก่อนเขียน
- tag เพี้ยนจาก bundle ภายนอกกระจายเข้า taxonomy กลางที่ใช้ร่วมทุก project → ทุก tag ผ่าน Tag Taxonomy (§1)
- **dry-run เป็น default เสมอ ไม่มี flag ข้าม** — สรุปทุกอย่างที่จะเกิดก่อน แล้ว user ยืนยันจึงเขียน (propose-don't-execute §7.1)

## Mode Detection

| Input | Mode |
|---|---|
| (no args) | bundle = `.brain-export/{basename of cwd}/` (match ชื่อ subdirectory แบบ **case-insensitive** — ชื่อ project ใน graph อาจ casing ต่างจาก cwd); ไม่เจอแต่ `.brain-export/` มี subdirectory เดียว → เสนอตัวนั้น; ไม่มี → ถาม user ระบุ path |
| `{dir}` | import bundle จาก directory ที่ระบุ |
| `--project <name>` | target project override (default: `project` field ใน bundle → basename of cwd) |
| `--no-overwrite` | title ชน note เดิม → **ข้าม** note นั้น (default = upsert ตาม §2) |

## Steps

### Phase A — Parse (read-only, ยังไม่แตะ graph)

1. **Resolve bundle + target project**
   - validate bundle: directory มีจริง + มีไฟล์ `.md` อย่างน้อย 1 — ไม่ผ่าน → แจ้ง user แล้วจบ
   - source project = frontmatter `project` ของ `index.md` (fallback: ไฟล์แรกที่มี field นี้; ไม่มีเลย = bundle จากระบบอื่น)
   - target project = `--project` > source project > basename of cwd — **source ≠ target → ถาม user ยืนยันก่อนเสมอ** (กันเทความรู้เข้าผิด project)
   - MCP ล่ม/ไม่ตอบ → แจ้ง user แล้วจบ อย่า retry วน (never block)

2. **Walk + parse ทุกไฟล์ `.md`** (recursive)
   - frontmatter ต้องมี `type` อย่างน้อย (minimum OKF) — field อื่น optional ทั้งหมด
   - **title (identity — §8.1):** frontmatter `title` → ไม่มีใช้ H1 แรกใน body → ไม่มีอีกใช้ filename slug แปลงกลับ (`-`→space, capitalize คำ) — 2 กรณีหลังต้องระบุใน dry-run report ว่า identity เป็นการเดา
   - parse fail รายไฟล์ (frontmatter พัง / ไม่มี `type` / tags เป็น YAML block list ที่ parser อ่านไม่ได้ — **ห้ามกิน tags เงียบๆ** ให้นับเป็น parse fail) → ข้ามไฟล์นั้น + list ใน report (per-file degrade — ห้ามทั้ง import ล้มเพราะไฟล์เดียว)
   - `log.md` **ที่ไม่มี frontmatter `title`** (OKF optional change history) → ข้าม ไม่ import เป็น note — brain มี NoteHistory อยู่แล้ว + list ใน report; `log.md` ที่มี frontmatter title ครบ = note จริงที่ slug บังเอิญเป็น log (export รุ่นเก่า) → import ปกติ
   - **> 100 ไฟล์ → เตือน token/call cost** (ต้อง `save-knowledge` ทีละใบ) แล้วถาม user ก่อน; เสนอทางเลือก: import เฉพาะบาง directory

3. **จำแนก `index.md` ตาม §8.4 (Import rules)**
   - title ตรง MOC pattern (`"{Project} — MOC (Map of Content)"` / `"{Project} — MOC: {Category}"`) → จะสร้าง/อัปเดต **MOC note**; ถ้า source ≠ target project ({Project} ใน title ไม่ตรง target) → **ถาม user**: [1] rename เป็น `{target} — MOC...` [2] import ชื่อเดิม [3] ข้าม — กัน MOC ชื่อผิด project ซ้อนกับที่ `/brain-moc` จะสร้าง
   - frontmatter `type: Index` (generated index จาก brain-export) → **ข้าม** — ไม่ fabricate MOC ที่ไม่เคยมีใน graph ต้นทาง; แนะนำ user รัน `/brain-moc` หลัง import แทน
   - ไม่เข้าทั้งสองเงื่อนไข (bundle จากระบบอื่น — `index.md` เป็นเนื้อหาจริงตาม OKF progressive disclosure) → import เป็น note ปกติ

4. **Build title table + แปลง links (§8.3 Import)**
   - จากทุกไฟล์ที่ผ่าน parse: `relative path → title` (title ตามกฎ identity ข้อ 2 — รวม fallback H1/filename) — ใช้ resolve ทุก link
   - **title ซ้ำกันเองใน bundle** (คนละไฟล์ title เดียวกัน — เสี่ยงพิเศษเมื่อ title มาจาก H1 fallback) → server จะ upsert ทับกันเงียบๆ ตอนเขียน **ห้ามปล่อยเป็น create ทั้งคู่**: list เป็น conflict ชนิด intra-bundle duplicate ใน dry-run → user เลือก ข้ามใบหลัง / ยกเลิก
   - `.md` link ใน body ทั้ง **relative** และ **root-absolute** (`[x](/dir/file.md)` — resolve จาก bundle root ตามรูปแบบตัวอย่าง OKF) → `[[Title]]` ของไฟล์เป้าหมาย
   - link ชี้ไฟล์ที่ไม่อยู่ใน bundle / non-`.md` / URL ภายนอก → **คงไว้ตามเดิม** + นับใน report
   - `[[wikilink]]` ที่อยู่ในไฟล์อยู่แล้ว → เก็บตามเดิม

5. **Reverse mapping ต่อ note (§8.2 — ห้าม define ตารางซ้ำ ใช้ของ protocol)**
   - `type` → kebab-case ตรง enum `category` ของ `save-knowledge` (pattern/overview/howto/...) → ส่งเป็น param `category`; ไม่ตรง → tag `content/{kebab-case(type)}`; `Note`/`Index` → ไม่เพิ่ม; tags มี `content/*` อยู่แล้ว → ใช้ของ tags ไม่ derive ซ้ำ (§8.2)
   - `note_type` มีและอยู่ใน enum (`note`/`fleeting`/`literature`/`permanent`) → ใช้ตรงตัว; ไม่มีหรือค่านอก enum → default `literature` + จดใน report (ห้ามส่งค่านอก enum — save จะ fail ที่ schema validation ทั้งใบ)
   - **body:** trim leading/trailing whitespace ก่อนสร้าง payload — กัน re-import bundle เดิมสร้าง NoteHistory version ใหม่จาก whitespace ต่างกันอย่างเดียว (version churn)
   - `resource` → ส่งเป็น `source` param ของ `save-knowledge` + บรรทัด `Source: <URL>` ใน content **เฉพาะเมื่อ content ยังไม่มีบรรทัดนั้น** (bundle จาก brain-export มี `Source:` ใน body อยู่แล้ว — ห้ามเขียนซ้ำ); convention เต็มรูปแบบอยู่ที่ GRAPH_PROTOCOL §1 ข้อ 7 (dual-write)
   - `timestamp` → **ไม่ round-trip** — server กำหนด createdAt/updatedAt เอง (จดใน report ว่า timestamp ต้นทางอยู่ใน bundle)
   - `tags` → **ใช้ทั้งชุดจาก frontmatter ตามเดิม (lossless-first — ห้าม "ปรับปรุง" tags ของ bundle)** เติมเฉพาะเมื่อขาด minimum ของ Save Rules §1: ไม่มี `{target-project-lowercase}` → เพิ่ม; เติมแล้วยัง < 2 tags → เพิ่ม domain tag inferred จาก directory (map พหูพจน์→เอกพจน์ ย้อนกฎ §8.1 ข้อ 3 เช่น `dependencies/`→`dependency`); ยังไม่ครบ → import ตามที่มี + รายงานใน dry-run — ทุก tag ที่เติมต้องแสดงใน dry-run report
   - **folderPath จาก directory tree:** `{bundle}/{dir}/note.md` → `/projects/{target-project}/{dir}/` (คง nested path ตามจริง); ไฟล์ที่ root ของ bundle → `/projects/{target-project}/`; directory ที่ไม่ตรง category convention §1 → import ตามจริง + flag ใน report

### Phase B — Gate (ตัดสินว่าอะไรจะถูกเขียน)

6. **Conflict detection (catalog-first — §3 Step 0)**
   - `mcp__graph-brain__get-project-catalog` project="{target}" → เทียบ title ทุก note: ไม่ชน = **create**, ชน = **upsert** (default) หรือ **skip** (`--no-overwrite`)
   - **note ที่ upsert → คง folderPath เดิมจาก catalog เสมอ** (§8.2 — ห้ามย้าย folder เป็น side effect; graph จริงมี casing ปน); bundle dir ต่างจาก folder เดิม → แจ้งใน dry-run report เฉยๆ
   - **note ที่จะ create → เช็ค title ชนนอก target ด้วย** `search-knowledge` query="{title}" — **upsert-by-title ของ server เป็น GLOBAL ไม่ scope ต่อ project (พิสูจน์ 2026-07-11 — §2)**: title ที่ชน note ใน project อื่นจะไม่ create แต่**ทับ note ของ project อื่นทั้งใบ** → default = **ข้าม note นั้น** + ระบุใน dry-run ว่าชนกับ note ของ project ไหน ให้ user อนุญาตเป็นรายใบเท่านั้น
   - catalog tool ไม่มี (server เก่ากว่า v1.1.0) → fallback `search-knowledge` query="{title}" ทีละใบ (ช้ากว่า — เตือน user เมื่อ note เยอะ)

7. **Tag gate preview (client-side, best-effort)**
   - ตรวจ tags ทุก note กับ blocklist §1: date-string (`2026-06-03`), version tag (`net9`, `v1.2`), status flag (`pending`, `auto-generated`, `wip`) → คาดว่าจะถูก **drop**; alias ที่รู้จัก (เช่น `efcore`→`ef-core`) คาดว่าจะถูก **normalize** — เทียบกับ canonical list ใน description ของ `save-knowledge` ถ้ามี; **server จริงอาจไม่ embed list** (ตรวจ 2026-07-11: มีแค่คำแนะนำ ไม่มี list) → ใช้ `list-tags` แทน หรือข้าม alias preview แล้วพึ่งผล normalize จริงใน step 10
   - ผลจริงตัดสินที่ server ตอน save (§1) — preview มีไว้ให้ dry-run report บอก user ล่วงหน้า ไม่ใช่ตัวตัดสิน

8. **Secret check (§6.3 — MANDATORY ก่อนเขียนทุกครั้ง)**
   - scan **payload สุดท้ายที่จะส่ง `save-knowledge`** ด้วย pattern ชุดเต็ม §6.3 (key=value/key:value + URL/signature + token literals) — คือ content **หลัง**แปลง link + เติมบรรทัด `Source:` แล้ว **และทุก field ที่จะส่ง**: `source` (จาก `resource` — จุด bypass ที่พิสูจน์แล้ว 2026-07-11: credential ฝังใน resource URL หลุด gate ได้ถ้า scan แค่ body ก่อนประกอบ), title, description
   - **Masked value (`***`/`<masked>`) ไม่ใช่ hit** — mask ถูกต้องตาม §6.2 ข้อ 5 → รายงานเป็น info; นโยบายด้านล่างใช้กับค่า literal เท่านั้น
   - **เจอค่า literal → note นั้นถูกตัดออกจาก write ทันที** + รายงานไฟล์/บรรทัด — secret ที่เข้า graph แล้วลบถาวรไม่ได้ (§6) จึงห้าม import แม้ user ขอ; ให้ user แก้ไฟล์ใน bundle แล้วรันใหม่

### Phase C — Confirm + Write

9. **Dry-run report (default — ทุกครั้ง ไม่มีข้อยกเว้น)**
   - แสดง (ไทย): create N ใบ / upsert M ใบ (ระบุ title ที่ชน — content เดิมจะถูกทับ กู้ได้จาก NoteHistory) / skip K ใบ (--no-overwrite / secret / parse fail / log.md / generated index / intra-bundle duplicate) / MOC action / tags ที่คาดว่าจะ normalize+drop / **tags ที่เติมเอง** (พร้อมเหตุผล §1 minimum — จากข้อ 5) / link แปลงได้ X คงเดิม Y / folder ที่ไม่ตรง convention / **note upsert ที่ bundle dir ต่างจาก folder เดิม** (จากข้อ 6) / title ที่เป็นการเดา / title ที่ชน note นอก target project
   - ถาม user: **[1] เขียนทั้งหมดตามรายงาน [2] เลือก import บาง note [3] ยกเลิก** — ไม่ตอบ = ไม่เขียน

10. **Write phase (หลัง user ยืนยันเท่านั้น)**
    - ทีละ note: `mcp__graph-brain__save-knowledge` — title/content(หลังแปลง link)/tags(หลังเติม)/folderPath/projectName={target}/type={note_type}/source={resource ถ้ามี}; note ที่ upsert → ส่ง `reason="brain-import: OKF bundle {bundle-path} ({YYYY-MM-DD})"` (server เก็บ version เดิมใน NoteHistory อัตโนมัติ — §2 upsert semantics; bulk import ไม่สร้าง changelog note ต่อใบ)
    - อ่าน `Tag normalization:` ใน response ทุกใบ → สะสม**เฉพาะบรรทัด normalize (alias→canonical) กับ drop (blocked)**; บรรทัด `... is a NEW tag` เป็นรายงาน registry ฝั่ง server ที่มี known quirk (รายงาน NEW ซ้ำสำหรับ tag ที่มีอยู่แล้ว — round-trip test 2026-07-11) ห้ามใช้ตัดสิน gate; normalize/drop ที่ต่างจาก preview ข้อ 7 → รายงาน user ตอนจบ
    - **Server เก่าไม่มี Tag Taxonomy (pre-v3.3):** ถ้า preview ข้อ 7 คาดว่าต้องมี drop/normalize แต่ response ใบแรกๆ ไม่มีบรรทัด `Tag normalization:` เลย → **หยุดก่อนเขียนใบต่อไป** แจ้ง user ว่า server ไม่ normalize (blocked tag จะเข้า graph ทั้งชุด) แล้วถาม: [1] ตัด blocked tag ฝั่ง client ตาม preview แล้วเขียนต่อ [2] เขียนต่อตามเดิม [3] ยกเลิกที่เหลือ
    - save fail รายใบ → ข้าม + list ใน report แล้วทำใบต่อไป (ห้ามทั้ง import ล้มเพราะใบเดียว)
    - MOC note (จากข้อ 3) → เขียนเป็นใบสุดท้าย (หลังทุก note มีจริง — wikilink ใน MOC จะ resolve เป็น LINKS_TO ครบ)
    - **Create-heavy bundle (§8.3):** server สร้าง LINKS_TO เฉพาะ ณ เวลา save ไม่ backfill — note ที่ถูก create ก่อนแล้วมี wikilink ชี้ note ที่ create ทีหลัง → หลังเขียนครบ **re-save รอบสอง**เฉพาะใบเหล่านั้น (content เดิม, reason="brain-import: link resolve pass") เพื่อให้ edge ครบ; upsert ล้วน (title มีครบอยู่แล้ว) ไม่ต้องทำ

11. **Post-import validation**
    - `get-project-catalog` target อีกครั้ง → จำนวน note เพิ่มตรงตาม create count (upsert ไม่เพิ่มจำนวน)
    - เสนอรัน `/brain-lint {target}` — ตรวจ broken wikilinks + tag hygiene หลัง import (โดยเฉพาะ bundle จากระบบอื่น)

12. **Report + activity log**
    - รายงาน (ไทย): created/upserted/skipped ต่อ folder, tag changes จริงจาก server, link ที่คงเป็น `[[...]]` ไม่ resolve, คำแนะนำถัดไป (`/brain-lint`, `/brain-moc` ถ้า generated index ถูกข้าม)
    - Append `.brain/activity-log.json`: command="brain-import", details={bundle, target_project, created, upserted, skipped, tag_changes}

## Round-trip expectation (คู่กับ brain-export)

bundle ที่ export ด้วย `/brain-export` แล้ว import กลับ project เดิม → **lossless ในขอบเขต §8**: note count (ไม่รวม generated `index.md`), wikilinks, canonical tags, note_type, content ตรงเดิม (หลัง normalize leading/trailing whitespace — ข้อ 5) — สิ่งที่ไม่ round-trip: `timestamp` (server กำหนดเอง), `description` (derive ใหม่จาก content ได้)

## Degrade Behavior

- MCP ล่ม → แจ้ง user, ไม่ import, ไม่ block งานอื่น
- parse fail / save fail รายใบ → ข้ามใบนั้น + list ใน report (per-note degrade)
- catalog tool ไม่มี → fallback search-knowledge ต่อ title + เตือนเรื่องความช้า
