---
name: brain-moc
description: "Create or refresh a Map of Content (MOC) overview note for a project — one note that [[links]] to every note in the project, grouped by category, with one-line summaries. Agents read the MOC first, then fetch only relevant notes (index-first retrieval, big token saver).
  USE THIS SKILL when the user wants a project knowledge map, overview note, or index of what brain knows about a project.
  Thai triggers: 'สร้าง MOC', 'แผนที่ความรู้', 'overview โปรเจกต์','รวม index โน้ต', 'refresh MOC'"
user_invocable: true
argument-hint: "[project] — default: basename of current working directory"
---

# Brain MOC (Map of Content)

ALL responses MUST be in Thai language.

**Graph Protocol:** Follow `${CLAUDE_PLUGIN_ROOT}/GRAPH_PROTOCOL.md` — §1 Save Rules, §2 Versioning Protocol (MOC updates create changelogs), §3 Search Rules Step 0.

## Why MOC

- **Token saver:** agent อ่าน MOC ใบเดียว (ไม่กี่พัน token) → รู้ว่าโปรเจกต์มีโน้ตอะไรบ้าง → fetch เฉพาะที่เกี่ยว แทน search วนหลายรอบ (pattern `index.md` ของ llm-wiki)
- **Connection fixer:** ทุกโน้ตได้ inbound link จาก MOC อย่างน้อย 1 เส้น — orphan หายทันทีโดยไม่แก้โน้ตเดิม

## Steps

1. **Get catalog**
   - project = argument or basename of cwd
   - Call `mcp__graph-brain__get-project-catalog` project="{name}"
   - If 0 notes → tell user (Thai) and suggest `/brain-scan` first; stop

2. **Check for existing MOC**
   - Call `mcp__graph-brain__search-knowledge` query="{Project} — MOC" limit=3
   - Exists → update path (step 4); not → create path (step 3)

3. **Create MOC note**
   - title: `"{Project} — MOC (Map of Content)"`
   - type: `permanent`, category: `overview`
   - tags: `[{project-name-lowercase}, moc, overview]`
   - folderPath: `/projects/{project-name}/` (root of the project folder)
   - content structure:
     ```markdown
     # {Project} — Map of Content

     > แผนที่ความรู้ของโปรเจกต์ — โน้ตทั้งหมด {N} ใบ (อัปเดต {YYYY-MM-DD})
     > อ่านใบนี้ก่อน แล้วค่อยเปิดโน้ตที่เกี่ยวข้อง

     ## {Category/Folder เช่น Core}
     - [[Note Title]] — one-line summary
     - [[Note Title]] — one-line summary

     ## {Category ถัดไป}
     ...
     ```
   - Group by folder from the catalog (core, workflow, database, ...); one line per note: `[[Title]] — summary` (ใช้ summary จาก catalog; ถ้าไม่มี summary เขียนสั้นๆ จาก title/type)
   - **Do NOT include the MOC itself** in its own list
   - Save via `mcp__graph-brain__save-knowledge` — wikilinks auto-create LINKS_TO to every note

4. **Update existing MOC** (when catalog changed)
   - Follow Versioning Protocol §2 (changelog + Version History) with reason="MOC refresh"
   - Diff quickly: notes added / removed vs current MOC content — mention in changelog

5. **Scale rule (hub-of-hubs)**
   - ถ้าโปรเจกต์มีโน้ต > ~80 ใบ → แตกเป็น MOC ย่อยต่อ category (`"{Project} — MOC: Database"`) แล้วให้ MOC หลัก link ลง MOC ย่อยแทน list ตรง

6. **Report + activity log**
   - Report (Thai): created/updated, N notes linked, folders covered
   - Append `.brain/activity-log.json`: command="brain-moc", details={project, note_count, action}

## Post-scan hook

เมื่อรัน `/brain-scan` จบ (full หรือ incremental ที่มีโน้ตใหม่) → เสนอ user รัน `/brain-moc` เพื่อ refresh แผนที่ กัน MOC drift (lint จะฟ้องถ้า MOC เก่ากว่าโน้ตล่าสุด)
