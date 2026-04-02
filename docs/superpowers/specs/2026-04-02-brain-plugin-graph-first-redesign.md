# Brain Plugin v3.0.0 — Graph-First Redesign

**Date:** 2026-04-02
**Author:** Mounchons
**Status:** Draft
**Current Version:** 2.1.0 → **Target Version:** 3.0.0

## 1. Overview

Redesign brain plugin ให้เป็น **graph-first** (Relationship-centric + Traversal-first) โดยคง commands เดิมทั้ง 11 ตัว + เพิ่ม 3 commands ใหม่ รวม 14 commands

### Approach: Skill-by-Skill Redesign

- กำหนด **Graph Protocol** เป็น shared rules ที่ทุก skill ต้องทำตาม
- Redesign ทีละ skill ให้ใช้ graph capabilities ของ MCP server เต็มที่
- **หลักการ/rules/flow ของ skill เดิมคงอยู่ 100%** — เพิ่ม graph layer เข้าไปในจุดที่เหมาะสม

### Context

- Brain plugin ใช้กับ **หลายโปรเจค** — AgentMarketPlace เป็นแหล่ง plugin, นำไปใช้กับ projects อื่น
- ปัญหาหลัก: ค้นข้ามโปรเจคยาก, ไม่มี overview, relationships ไม่ชัด
- MCP tools ที่ยังไม่ได้ใช้: `list-tags`, `list-projects`, `get-project`, `save-bookmark`, `tech-overview`

## 2. Graph Protocol (กฎกลาง)

ไฟล์: `plugins/brain/GRAPH_PROTOCOL.md` — ทุก skill reference จากที่นี่

### 2.1 Save Rules

เมื่อ **SAVE note ใหม่**:
- ต้องมี `projectName` (จาก cwd basename หรือ user ระบุ)
- ต้องมี `tags` อย่างน้อย 2 ตัว: `[project-name, domain-tag]`
- ต้องมี `folderPath` ตาม convention: `/projects/{name}/{category}/`
- ต้อง `search-knowledge` ก่อน save เพื่อเช็ค duplicate
- ต้องเพิ่ม `[[wiki links]]` ไปยัง related notes ที่พบ
- `type` ต้องเลือกให้ถูก: `permanent` (refined), `fleeting` (quick), `literature` (external)

เมื่อ **UPDATE note เดิม**:
- ทำตาม Versioning Protocol (section 2.2)
- ห้าม overwrite โดยไม่สร้าง changelog

### 2.2 Versioning Protocol

เมื่อ update note เดิม (brain-save, brain-update, brain-scan):

1. **GET** note เดิม → เก็บ snapshot ของ content ปัจจุบัน
2. **SAVE changelog note**:
   - title: `"{Original Title} — Changelog #{N} ({date})"`
   - content: diff summary (อะไรเพิ่ม/ลบ/เปลี่ยน + เหตุผล)
   - tags: `[changelog, {project-name}, {original-tags}]`
   - folderPath: `/projects/{name}/changelog/`
   - เพิ่ม `[[wiki link]]` กลับไปหา original note
3. **UPDATE original note**:
   - เพิ่ม `[[wiki link]]` ไปหา changelog note ล่าสุด
   - เพิ่ม version metadata ท้าย note:
     ```
     ## Version History
     - v{N} ({date}): {summary} → [[Changelog #{N}]]
     ```

### 2.3 Search Rules

Search Strategy (4 ขั้น):
1. `search-knowledge` (text match) → ถ้าพบ >= 3 results → done
2. `search-by-tags` (tag match) → ถ้าพบ → done
3. `explore-graph` จาก best result (depth 2) → traverse relationships
4. `find-similar` (last resort)

Cross-Project Search:
- ถ้า query มีชื่อ project อื่น → search ด้วย projectName tag
- ถ้าไม่ระบุ project → search ทุก project แล้วจัดกลุ่มผลลัพธ์

### 2.4 Relationship Rules

เมื่อสร้าง/แก้ note:
- auto-search related notes → เพิ่ม `[[wiki links]]` (สร้าง LINKS_TO)
- ใส่ tags ที่ตรงกับ domain (สร้าง TAGGED)
- ระบุ projectName (สร้าง association กับ Project node)

เมื่อ read note:
- เสมอ follow `[[wiki links]]` อย่างน้อย 1 hop เพื่อแสดง context
- ใช้ `explore-graph` เมื่อต้องการ deep context (2-3 hops)

## 3. Skills Redesign — เพิ่ม Graph Capabilities

### หลักการ

```
Skill เดิม = Foundation (ห้ามเปลี่ยน rules, flow, หลักการ)
Graph Protocol = Add-on layer ที่เพิ่มเข้าไปในจุดที่เหมาะสม
```

### 3.1 Major Enhancement

#### `brain-status` — คงเดิม + เพิ่ม graph overview

คงเดิม:
- `brain-stats` → แสดง nodes/relationships

เพิ่ม:
- `get-project` → tech stack, linked notes ของ project ปัจจุบัน
- `list-projects` → รายชื่อ projects ทั้งหมด
- `list-tags` → top tags จัดกลุ่มเป็น domains
- สรุปภาพรวม cross-project connections

#### `brain-search` — คง 3-strategy fallback เดิม + เพิ่ม step 3

คงเดิม:
1. `search-knowledge` (text)
2. `search-by-tags` (tags)
4. `find-similar` (last resort)

เพิ่ม:
- step 3 (แทรก): `explore-graph` จาก best result (depth 2)
- ผลลัพธ์เพิ่ม: relationships count, project, version info

#### `brain-save` — คง duplicate check + Brain First เดิม + เพิ่ม versioning

คงเดิม:
- search duplicate ก่อน save
- Brain First strategy
- ถามก่อน save เสมอ
- Thai language enforcement

เพิ่ม:
- ถ้าพบ duplicate → ถาม `[Update existing]` หรือ `[Create new]`
- Update → Versioning Protocol (changelog + link)
- auto-search related notes → เพิ่ม `[[wiki links]]`
- URL detection → แนะนำ `save-bookmark`

#### `brain-scan` — คง 10 phases เดิมครบ + เพิ่ม phase

คงเดิม:
- Phase 1-8: ครบถ้วนไม่เปลี่ยน
- Phase 9: Cross-Reference + Knowledge Map
- Incremental scan logic
- Model assignment rules
- Thai reporting format

เพิ่ม:
- Phase 0 (ใหม่ ก่อน phase 1): `get-project` ตรวจสอบ project ใน brain
- Phase 9 เสริม: ใช้ `explore-graph` verify links
- Phase 10 (ใหม่ หลัง phase 9): Versioning — เปรียบเทียบ notes เดิม สร้าง changelogs
- ทุก save ผ่าน Save Rules จาก Graph Protocol

#### `brain-update` — คง flow เดิม + เพิ่ม versioning

คงเดิม:
- `get-knowledge` → compare with codebase → update content
- Incremental update logic
- Activity logging

เพิ่ม:
- snapshot content ก่อน update
- สร้าง changelog note ตาม Versioning Protocol
- `explore-graph` verify relationships หลัง update

### 3.2 Medium Enhancement

#### `brain-load` — คง flow เดิม + เพิ่ม project context

คงเดิม:
1. `brain-stats` check connection
2. `search-knowledge` + `search-by-tags`
3. `get-knowledge` top 5 ตาม priority
4. Report in Thai
5. Activity logging

เพิ่ม:
- step 1.5 (แทรก): `get-project` → ดึง project info
- รายงานเพิ่ม: tech stack, cross-project connections

#### `brain-explain` — คง deep explanation flow + เพิ่ม relationship depth

คงเดิม:
- search → get → explore-graph → อธิบาย
- Follow `[[wiki links]]` max 3 hops
- Diagrams, tables, examples format

เพิ่ม:
- แสดง relationship map ชัดเจน (A →[LINKS_TO]→ B)
- แสดง version history จาก changelogs
- cross-project context

### 3.3 Minor Enhancement

#### `brain` (query หลัก)

คงเดิม: Brain First strategy ทั้งหมด
เพิ่ม: `explore-graph` fallback, แสดง relationships

#### `brain-log`

คงเดิม: ทั้งหมด
เพิ่ม: log changelog events

#### `brain-help` / `brain-howto`

คงเดิม: format, structure ทั้งหมด
เพิ่ม: commands ใหม่, Graph Protocol summary

## 4. Skills ใหม่

### 4.1 `brain-explore` — Interactive Graph Traversal

**วัตถุประสงค์:** เดินตาม graph จาก node หนึ่งไปอีก node ผ่าน relationships

Flow:
1. User ระบุ starting point (keyword, note title, หรือ tag)
2. `search-knowledge` หา node เริ่มต้น
3. `explore-graph` depth=1 → แสดง connected nodes + relationship types
4. แสดงแบบ interactive:
   ```
   จาก [UserService - Auth Flow] เชื่อมกับ:
    [1] →[LINKS_TO]→ OAuth2 Provider Setup
    [2] →[LINKS_TO]→ Session Management
    [3] →[TAGGED]→ #authentication
    [4] →[TAGGED]→ #security
    [5] <-- กลับ / [6] search ใหม่
    
    เลือก node เพื่อ explore ต่อ หรือ /stop
   ```
5. User เลือก node → `explore-graph` ต่อจาก node นั้น
6. ทุก hop แสดง: node content สรุปสั้นๆ + connections ต่อไป
7. สะสม path ที่เดินมา: A → B → C (breadcrumb)

Options:
- `depth`: 1-3 hops (default 1 — ทีละ step)
- `filter`: เฉพาะ relationship type (LINKS_TO, TAGGED, etc.)
- `project`: filter เฉพาะ project

Activity log: บันทึก nodes ที่ explore + path

### 4.2 `brain-projects` — Project Management & Cross-Project View

**วัตถุประสงค์:** ดูภาพรวมทุก projects, tech stacks, ความเชื่อมโยงข้ามโปรเจค

Flow:
1. `list-projects` → แสดงทุก projects
2. แสดงตาราง:
   ```
   Projects ทั้งหมดใน Brain:
    | # | Project | Notes | Tech Stack | Connected Projects |
    |---|---------|-------|------------|--------------------|
    | 1 | AgentMarketPlace | 8 | claude-code, plugin | MyWebApp, ... |
    | 2 | MyWebApp | 12 | react, dotnet | AgentMarketPlace |
    
    เลือก project เพื่อดูรายละเอียด หรือ:
    [A] tech-overview — ดู tech stacks ทั้งหมด
    [B] compare — เปรียบเทียบ 2 projects
   ```
3. เลือก project → `get-project` → แสดง tech stack, linked notes, tasks, cross-project relationships
4. เลือก tech-overview → `tech-overview` → แสดง technologies ที่ใช้ทุก project
5. เลือก compare → `get-project` ทั้ง 2 → แสดง shared tech, shared tags, cross-linked notes

Activity log: บันทึก projects ที่ดู

### 4.3 `brain-history` — Knowledge Version History

**วัตถุประสงค์:** ดูประวัติการเปลี่ยนแปลงของ note — changelogs ทั้งหมด

Flow:
1. User ระบุ note (keyword หรือ title)
2. `search-knowledge` → หา note
3. `get-knowledge` → โหลด note
4. `search-by-tags` tags=`["changelog", "{note-related-tag}"]` → หา changelogs ที่เกี่ยวข้อง
5. หรือ follow `[[wiki links]]` จาก Version History section ใน note
6. แสดง timeline:
   ```
   {Note Title} — Version History:
    
    v3 (2026-04-02) — current
      เพิ่ม MFA verification step
      → [[Changelog #3]]
      
    v2 (2026-03-28)
      เพิ่ม OAuth2 providers (Google, GitHub)
      → [[Changelog #2]]
      
    v1 (2026-03-15) — initial
      Password-based auth only
      → [[Changelog #1]]
    
    [1] ดู changelog เฉพาะ version
    [2] เปรียบเทียบ 2 versions
    [3] restore version เก่า (สร้าง changelog ใหม่)
   ```
7. เลือก compare → แสดง diff ระหว่าง 2 changelogs
8. เลือก restore → สร้าง changelog ใหม่ที่ระบุว่า "restored from v{N}"

Activity log: บันทึก notes ที่ดู history

## 5. MCP Tools Coverage

### ก่อน Redesign (7/12 tools)

| Tool | ใช้ |
|------|:---:|
| `brain-stats` | Yes |
| `search-knowledge` | Yes |
| `search-by-tags` | Yes |
| `get-knowledge` | Yes |
| `find-similar` | Yes |
| `explore-graph` | Yes |
| `save-knowledge` | Yes |
| `list-tags` | No |
| `list-projects` | No |
| `get-project` | No |
| `save-bookmark` | No |
| `tech-overview` | No |

### หลัง Redesign (12/12 tools)

| Tool | ใช้ใน |
|------|-------|
| `brain-stats` | brain-status, brain-load, brain-scan, hook |
| `search-knowledge` | brain, brain-search, brain-save, brain-scan, brain-load, brain-explain, brain-explore, brain-history |
| `search-by-tags` | brain, brain-search, brain-load, brain-history |
| `get-knowledge` | brain, brain-search, brain-explain, brain-load, brain-update, brain-explore, brain-history |
| `find-similar` | brain-search |
| `explore-graph` | brain, brain-search, brain-explain, brain-explore, brain-update |
| `save-knowledge` | brain-save, brain-scan, brain-update |
| `list-tags` | brain-status |
| `list-projects` | brain-status, brain-projects |
| `get-project` | brain-status, brain-load, brain-scan, brain-projects |
| `save-bookmark` | brain-save |
| `tech-overview` | brain-projects |

## 6. Implementation Plan

### Phase 1: Foundation
- `GRAPH_PROTOCOL.md` (สร้างกฎกลาง)
- `plugin.json` → version 3.0.0
- Model: **opus**

### Phase 2: Core Write Skills
- `brain-save` (versioning + relationship auto-detect)
- `brain-update` (versioning + verify relationships)
- Model: **opus**
- Dependencies: Phase 1

### Phase 3: Scan + History
- `brain-scan` (Phase 0, 10 + Save Rules)
- `brain-history` (ใหม่)
- Model: **opus**
- Dependencies: Phase 2

### Phase 4: Query + Navigation
- `brain-search` (explore-graph step)
- `brain-explore` (ใหม่)
- `brain-explain` (relationship depth)
- `brain` (explore-graph fallback)
- Model: **sonnet**
- Dependencies: Phase 2

### Phase 5: Session + Overview + Docs
- `brain-status` (graph overview)
- `brain-load` (project entry point)
- `brain-projects` (ใหม่)
- `brain-log` (changelog events)
- `brain-help` (update commands)
- `brain-howto` (update tutorial)
- `README.md`
- Model: **sonnet**
- Dependencies: Phase 3 + Phase 4

### Phase Dependencies

```
Phase 1 ──→ Phase 2 ──→ Phase 3
                │
                └──→ Phase 4
                         │
Phase 3 + Phase 4 ──→ Phase 5
```

## 7. File Summary

| Action | Files | Count |
|--------|-------|:-----:|
| สร้างใหม่ | GRAPH_PROTOCOL.md, brain-explore/SKILL.md, brain-projects/SKILL.md, brain-history/SKILL.md | 4 |
| แก้ Major | brain-save, brain-search, brain-scan, brain-update, brain-status | 5 |
| แก้ Medium | brain-load, brain-explain | 2 |
| แก้ Minor | brain, brain-log, brain-help, brain-howto | 4 |
| แก้ Config/Docs | plugin.json, README.md | 2 |
| **รวม** | | **17** |

## 8. Commands Summary

| # | Command | สถานะ | กลุ่ม |
|---|---------|-------|-------|
| 1 | `brain` | คงเดิม + เพิ่ม | Query |
| 2 | `brain-search` | คงเดิม + เพิ่ม | Query |
| 3 | `brain-explain` | คงเดิม + เพิ่ม | Query |
| 4 | `brain-explore` | **ใหม่** | Query |
| 5 | `brain-save` | คงเดิม + เพิ่ม | Write |
| 6 | `brain-scan` | คงเดิม + เพิ่ม | Write |
| 7 | `brain-update` | คงเดิม + เพิ่ม | Write |
| 8 | `brain-load` | คงเดิม + เพิ่ม | Session |
| 9 | `brain-status` | คงเดิม + เพิ่ม | Session |
| 10 | `brain-log` | คงเดิม + เพิ่ม | Session |
| 11 | `brain-projects` | **ใหม่** | Overview |
| 12 | `brain-history` | **ใหม่** | Versioning |
| 13 | `brain-help` | คงเดิม + เพิ่ม | Help |
| 14 | `brain-howto` | คงเดิม + เพิ่ม | Help |
