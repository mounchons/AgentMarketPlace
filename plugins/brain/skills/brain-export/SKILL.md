---
name: brain-export
description: "Export project knowledge from Graph Brain to an Open Knowledge Format (OKF v0.1) bundle — portable markdown files + YAML frontmatter that work with git, other agents, and the OKF static visualizer, no MCP server required. Read-only on the graph.
  USE THIS SKILL when the user wants to export brain knowledge, create a knowledge bundle, share project knowledge outside brain, or back up notes as files.
  Thai triggers: 'export ความรู้', 'export brain', 'ส่งออกโน้ต', 'แชร์ความรู้เป็นไฟล์', 'สร้าง OKF bundle', 'backup brain เป็นไฟล์'"
user_invocable: true
argument-hint: "[project] [--all-projects] [--output <dir>] — default: basename of cwd → .brain-export/{project}/"
---

# Brain Export (OKF Bundle)

ALL responses MUST be in Thai language.

**Graph Protocol:** Follow `${CLAUDE_PLUGIN_ROOT}/GRAPH_PROTOCOL.md` — **§8 OKF Interchange Mapping (กฎหลักของ skill นี้)**, §6.3 pre-save sanity check (ใช้เป็น pre-write check), §3 Step 0 catalog-first

## Why Export

- **Portability:** ความรู้ใน Neo4j เข้าถึงได้เฉพาะผ่าน MCP — bundle เป็น markdown ธรรมดา เปิดได้ทุกที่ ลง git ได้ แชร์ให้ agent/ทีมที่ไม่มี graph-brain ได้
- **Visualizer:** bundle ตามสเปก OKF เปิดด้วย static HTML visualizer ของ OKF ได้ (ไม่ต้องมี backend)
- **ไม่ใช่ backup แทน server:** graph ยังเป็น source of truth — bundle คือ snapshot (ดู §8.5)

## Mode Detection

| Input | Mode |
|---|---|
| (no args) | export project = basename of cwd |
| `{project}` | export project ที่ระบุ |
| `--all-projects` | วน export ทุก project จาก `list-projects` — **เตือน user ก่อน**: ความรู้ข้าม project (อาจเป็นงานลูกค้า/repo อื่น) จะถูกเขียนลง working tree ของ repo ปัจจุบัน |
| `--output <dir>` | เปลี่ยน **parent directory** (default = `.brain-export`) — ไฟล์ลง `{output}/{project}/` เสมอ ทั้ง single และ --all-projects |

## Steps

1. **Resolve scope**
   - project จาก argument หรือ basename ของ cwd; `--all-projects` → `mcp__graph-brain__list-projects` แล้ววนทีละ project (ทำ step 2-8 ต่อ project)
   - MCP ล่ม/ไม่ตอบ → แจ้ง user แล้วจบ อย่า retry วน (never block)

2. **Get catalog**
   - `mcp__graph-brain__get-project-catalog` project="{name}" → ได้ทุก note: title + summary + folder + `{note_type}/{category}` (category ใช้เป็นแหล่งแรกของ OKF `type` ตาม §8.2 — เช่น `permanent/pattern` → `type: Pattern`)
   - tool ไม่มี (server เก่ากว่า v1.1.0) → fallback: `search-by-tags` tags=["{project-lowercase}"] + `search-knowledge` เพื่อรวบรวมรายชื่อ note ให้ครบที่สุด แล้วแจ้ง user ว่า catalog ไม่มี อาจตกหล่น; folder ของแต่ละ note ใช้ **fallback chain §8.1** (explore-graph → tag inference) + รายงานเมื่อเป็นการเดา
   - 0 notes → แจ้ง user + แนะนำ `/brain-scan` ก่อน; จบ
   - **> 100 notes → เตือน token cost** (ต้อง `get-knowledge` ทีละใบ) แล้วถาม user ก่อนดำเนินการ; เสนอทางเลือก: export เฉพาะบาง category

3. **Build link table** (ก่อนเขียนไฟล์ใดๆ)
   - จาก catalog: `title → (category, slug)` ตามกฎ slug ใน §8.1 — ตารางนี้ใช้ resolve wikilink ทุกไฟล์
   - slug ชนกันใน category เดียว → ต่อท้าย `-2`, `-3` ตามลำดับที่เจอ

4. **Fetch + convert ทีละ note**
   - `mcp__graph-brain__get-knowledge` noteId → full content, tags, type, timestamps
   - สร้างไฟล์ตาม §8.2 (frontmatter + **strip MCP display metadata** หัว/ท้าย output ของ get-knowledge) + §8.3 (แปลง `[[wikilink]]` → relative link ด้วยตารางจาก step 3; resolve ไม่ได้ → คง `[[...]]` + เก็บเข้า unresolved list)
   - MOC note → `index.md` ตาม §8.4 (ห้าม export ซ้ำเป็นไฟล์ปกติ); ไม่มี MOC → generate index.md จาก catalog + แนะนำ user รัน `/brain-moc` เพื่อได้ index ที่ curate แล้ว

5. **Pre-write secret check (MANDATORY — §8.5)**
   - scan เนื้อหาทุกไฟล์ที่จะเขียนด้วย **pattern ชุดเต็มใน §6.3** (key=value/key:value + URL/signature + token literals: AWS/GitHub/Slack/JWT/Bearer/PEM) — สำคัญเป็นพิเศษกับ notes เก่าที่ save ก่อนมี masking rules
   - **เจอ → หยุดทั้ง export** รายงาน note ที่มีปัญหา ให้ user แก้ note ใน brain ก่อน (bundle ไป git/แชร์ต่อ — อันตรายกว่า note ใน server)

6. **Write bundle**
   - เขียนลง `{output}/{project}/` ตาม layout §8.1 (+ path safety: project/category segments ผ่านกฎ slug)
   - **Overwrite policy:** directory เป้าหมายมีไฟล์อยู่ →
     - ดูเหมือน bundle เดิม (มี `index.md` ที่มี header `Exported:`) → ถาม user ยืนยันก่อนล้างแล้วเขียนใหม่
     - **ไม่ใช่ bundle เดิม → abort** แจ้ง user ให้เปลี่ยน `--output` (ห้ามเสนอล้าง directory ที่ไม่ใช่ของ exporter — เสี่ยงลบไฟล์ user)
     - user ปฏิเสธการล้าง → **abort** (ไม่ merge-write — จะทับ index.md/slug ชนกันเงียบๆ)
   - `index.md` ใส่ header ความสด: `> Exported: {YYYY-MM-DD} @ commit {hash} — snapshot; source of truth คือ graph` (hash จาก `git rev-parse --short HEAD` ของ repo ปัจจุบัน; non-git → ละ commit)

7. **Structural validation (ก่อนรายงานสำเร็จ)**
   - ทุกไฟล์ `.md` มี frontmatter ที่มี `type` อย่างน้อย
   - ทุก relative link ชี้ไฟล์ที่มีจริงใน bundle
   - `index.md` ครอบทุกไฟล์ (ยกเว้น index เอง)
   - ข้อใด fail → แก้ก่อนรายงาน อย่ารายงานสำเร็จทั้งที่ validation แดง

8. **Report + activity log**
   - รายงาน (ไทย): จำนวน notes ต่อ category, path ของ bundle, unresolved wikilinks (ถ้ามี — ระบุว่าโยง broken-link check ของ `/brain-lint`), คำแนะนำถัดไป (ลง git / เปิด visualizer / `/brain-import` ฝั่งรับ)
   - **ก่อนแนะนำ "ลง git":** เช็ค `git check-ignore <bundle-path>` — ถ้าถูก ignore (หลาย repo gitignore `.brain-export/` ไว้เพราะเป็น derived artifact) ให้บอก user ตรงๆ พร้อมทางเลือก: `--output` ไปที่ที่ track ได้ หรือ `git add -f` เมื่อตั้งใจ commit
   - Append `.brain/activity-log.json`: command="brain-export", details={project, note_count, output, unresolved_links}

## Cross-check กับ skills อื่น

- **ก่อน export:** ถ้า lint ยังไม่เคยรัน แนะนำ `/brain-lint` — bundle ที่ export จาก graph ที่สะอาด (ไม่มี broken link/orphan) จะ validate ผ่านง่ายกว่า
- **MOC drift:** ถ้า MOC เก่ากว่าโน้ตล่าสุด (lint check) → แนะนำ `/brain-moc` ก่อน export

## Degrade Behavior

- MCP ล่ม → แจ้ง user, ไม่ export, ไม่ block งานอื่น
- `get-knowledge` fail รายใบ → ข้ามใบนั้น + ลิสต์ไว้ใน report (ห้ามทั้ง export ล้มเพราะใบเดียว)
