---
title: "Server-side Analysis — แบ่งงาน D1–D6 ระหว่าง MCP server กับ brain plugin"
date: 2026-07-10
status: analysis-complete
parent: RESEARCH.md (อ่านก่อน — llm-wiki principles + directive mapping)
supersedes: RESEARCH.md §5 Open Decision #1 (tag merge ระดับ server "ทำไม่ได้" → ทำได้แล้ว)
---

# Server-side Analysis — รองรับทั้ง MCP server และ brain plugin

> วิเคราะห์เพิ่มเติมหลังยืนยันว่า**แก้ฝั่ง server ได้** — แบ่งงาน D1–D6 เป็น 2 ชั้น:
> enforcement ที่ server (ของจริง บังคับทุก client) + guidance ที่ plugin (workflow สำหรับ agent)

---

## 1. สถาปัตยกรรมจริงที่ค้นพบ (สำคัญ — อ่านก่อนลงมือ)

ระบบ graph บนเครื่องนี้มี **2 stack แยกกัน คนละ data model**:

| | **SecondBrain** (`D:\GitHub\SecondBrain`) | **BigBrain** (`D:\GitHub\BigBrain`) |
|---|---|---|
| ชื่อ MCP | `graph-brain` | `big-brain` |
| Backend | GraphBrain.Api (ASP.NET Core 8 + Neo4j.Driver, Cypher ตรง) @ `192.168.50.155:7100` | graphiti-mcp-pro (Python/Graphiti) @ `localhost:2900` + Ollama |
| MCP layer | `SecondBrain/mcp-server/index.js` (Node, 15 tools, thin wrapper ครอบ REST API) | Graphiti MCP (add_memory / search_memory_facts / search_nodes, group_id `bigbrain`) |
| Data model | `:Note` `:Tag` `:Folder` `:Project` + LINKS_TO/TAGGED/IN_FOLDER + NoteHistory | Episodic/Entity graph (LLM auto-extraction) |
| Plugin ที่ใช้ | **brain** (v3.2) | bigbrain (v1.1) |

**ข้อยืนยัน:** ตัวเลข audit ใน directive (611 notes, 1,533 tags, LINKS_TO 717, NoteHistory 68) ตรงกับ schema ของ **SecondBrain** เท่านั้น (Graphiti ไม่มี Tag/Folder/NoteHistory) → **งาน server-side ของ D1–D6 ลงที่ SecondBrain** ไม่ใช่ BigBrain

**บทบาท BigBrain ต่อ directive นี้:** ไม่มี by default — ถ้าต้องการ apply บทเรียน llm-wiki กับ BigBrain ด้วย (เช่น taxonomy กลางสำหรับ entity labels) เป็น epic แยกต่างหาก; หรือถ้าตั้งใจจะ migrate brain plugin ไปใช้ BigBrain เป็น backend นั่นคือ migration project คนละเรื่องกับ D1–D6 — ต้อง confirm กับ user ก่อน

### ของที่ server มีอยู่แล้ว (ตรวจจากโค้ดจริง 2026-07-10)

- `GraphController` — มี **orphans + tag-cloud + stats + clusters** endpoints แล้ว (ครึ่งทางของ lint!)
- `NoteHistory` + upsert versioning — ทำงานจริง
- Neo4j เปิด **APOC** ใน docker-compose → ใช้ `apoc.text.levenshteinDistance` ตรวจ duplicate tag ได้ใน Cypher เลย
- `Note.summary` field (AI-generated) มีใน schema → ใช้สร้าง MOC catalog ราคาถูกได้
- MCP tools 15 ตัว: save/update-knowledge, get-note-history, restore-note-version, search-knowledge, get-knowledge, find-similar, search-by-tags, list-tags, brain-stats, save-bookmark, list-projects, tech-overview, get-project, explore-graph

---

## 2. หลักการแบ่งชั้น (ทำไมต้องทั้งสองฝั่ง)

> **กฎที่อยู่ใน prompt เป็นแค่คำแนะนำ — กฎที่อยู่ใน service layer เป็นของจริง**

- Plugin (SKILL.md + GRAPH_PROTOCOL.md) = advisory: agent ตัวไหนไม่โหลด protocol (client อื่น, Claude Desktop, forgot) ก็เขียน tag เละได้เหมือนเดิม → นี่คือสาเหตุที่ tag แตก 1,533 ทั้งที่ Save Rules เขียนไว้แล้ว
- Server (GraphBrain.Api) = enforcement: normalize/reject ที่ `NoteService`/`TagRepository` → **ทุก client โดนบังคับเท่ากัน** ตรงกับ DDD framing ของ directive — Tag เป็น Value Object ต้อง normalize ที่ domain layer ไม่ใช่ที่ UI
- Plugin ยังจำเป็น: workflow ที่ต้องใช้ LLM (เขียน MOC summary, เสนอ wikilink จาก semantic, ถาม user ก่อน merge) ทำที่ server ไม่ได้

---

## 3. ตารางแบ่งงาน D1–D6 (ฉบับ revised — server ทำได้แล้ว)

| Directive | Server (SecondBrain: API + Cypher + MCP) | Plugin (AgentMarketPlace: brain) |
|---|---|---|
| **D1** Tag Normalization | ✅ หัวใจย้ายมาที่นี่: `TagNormalizationService` + registry + `POST /api/tags/merge` + alias expansion ใน search | เหลือ: อ้าง taxonomy ใน protocol, เตือน user เมื่อ server ตอบว่า tag ถูก normalize |
| **D2** Metadata แยกจาก tag | ✅ validation ที่ API: reject date/status-flag → 400 พร้อมเหตุผล | แสดงคำอธิบาย + redirect ให้ user (date → content, status → folder) |
| **D3** brain-lint | ✅ ข้อมูล: `/api/lint/*` endpoints (Cypher ล้วน — deterministic, เร็ว, ไม่กิน token) + MCP tool `brain-lint` | ✅ workflow: skill `brain-lint` เรียก tool → present → ถาม user → apply fix (propose-don't-auto-execute) |
| **D4** Controlled Taxonomy | ✅ single source of truth: `config/tag-taxonomy.json` ใน repo + `GET /api/tags/taxonomy` + ฝัง canonical list ใน tool description ของ `save-knowledge` (MCP โหลดตอน start) | GRAPH_PROTOCOL อ้าง endpoint แทน hardcode ตาราง (กัน 2 sources drift) |
| **D5** MOC per project | ช่วยได้: `GET /api/projects/{name}/catalog` (title + summary + folder ต่อ note — จัดกลุ่มให้แล้ว) | ✅ หัวใจอยู่นี่: skill `brain-moc` ใช้ catalog → LLM เขียน MOC note + index-first retrieval ใน Search Rules |
| **D6** Mirror-note hygiene | ✅ lint check: content สั้น + outbound LINKS_TO = 0 (Cypher) | เสนอ merge เข้า synthesis note (ต้องใช้ LLM ตัดสิน) |

**สรุป shift จาก RESEARCH.md เดิม:** D1/D2/D4 ย้าย enforcement ลง server เกือบหมด (plugin เหลือชั้นบาง), D3 แบ่งครึ่ง (data ที่ server / workflow ที่ plugin), D5/D6 อยู่ที่ plugin เป็นหลักเหมือนเดิม

---

## 4. รายละเอียดฝั่ง server (SecondBrain)

### 4.1 Tag Taxonomy Registry — `config/tag-taxonomy.json` (ไฟล์ใหม่)

```json
{
  "version": 1,
  "canonical": {
    "ef-core":    { "aliases": ["efcore", "entity-framework", "entity-framework-core"] },
    "aspnet-core":{ "aliases": ["asp-net-core", "aspnetcore", "aspnet", "asp-net"] },
    "dotnet":     { "aliases": ["dotnet-core", "dotnet-core-9"] },
    "kubernetes": { "aliases": ["k8s"] },
    "buntrukhub": { "aliases": ["buntruk", "buntrakhub"] }
  },
  "namespaces": ["tech", "project", "domain", "audience", "solution", "pattern", "content", "problem", "source"],
  "blocked": {
    "datePattern": "^\\d{4}([-/]\\d{2}){0,2}$",
    "statusFlags": ["gold-news-seen", "auto-generated", "pending", "pending-confirm"]
  }
}
```
(ชุดเต็มตาม Appendix A/B ของ directive — ด้านบนคือตัวอย่างโครง)

### 4.2 API changes (GraphBrain.Api)

| Endpoint | ทำอะไร | ใช้กับ |
|---|---|---|
| `GET /api/tags/taxonomy` | คืน registry ทั้งชุด (version + canonical + blocked) | D4 — plugin/MCP อ่าน source เดียว |
| `POST /api/tags/merge` `{from, to}` | Cypher: ย้าย TAGGED edges จาก alias → canonical แล้วลบ alias node (ใน transaction) | D1 migration + lint fix |
| `POST /api/tags/normalize-preview` `{tags[]}` | คืน `{original, resolved, isNew, nearest[]}` ต่อ tag — nearest ใช้ `apoc.text.levenshteinDistance ≤ 2` | D1.2 — save flow เตือนก่อนสร้าง tag ใหม่ |
| **แก้** `NoteService.SaveAsync` / `AddTags` | resolve alias → canonical เสมอ; **reject** date-pattern + status flags (400 + message บอกว่าให้ไปไว้ไหนแทน) | D1.1, D2 — enforcement จุดเดียวครอบทุก client |
| **แก้** `SearchController` `/api/search/by-tag` | expand query tags ด้วย aliases จาก registry | D1.3 — ครอบข้อมูลเก่าระหว่างยังไม่ migrate |
| `GET /api/lint/report` | รวม checks (§4.3) เป็น report เดียว พร้อม severity | D3 |
| `GET /api/projects/{name}/catalog` | notes ของ project: `{title, summary, folderPath, updatedAt, outboundLinks}` จัดกลุ่มตาม folder | D5 — วัตถุดิบ MOC |
| `POST /api/admin/migrate-tags` | รัน merge ทั้ง registry รอบเดียว (idempotent, คืนสรุป before/after) | D1.4 one-off migration |

### 4.3 Lint checks — Cypher ฝั่ง server (deterministic ทั้งหมด)

| Check | วิธี | สถานะ endpoint |
|---|---|---|
| Orphan notes (LINKS_TO = 0 ทั้งสองทาง) | มีแล้ว — `GET /api/graph/orphans` | ✅ reuse |
| Duplicate-candidate tags | `apoc.text.levenshteinDistance(t1.name, t2.name) <= 2` บนคู่ Tag | 🆕 |
| Metadata-in-tags | match `blocked.datePattern` + `statusFlags` กับ tag-cloud | 🆕 |
| Link density ต่ำ | Note type=permanent AND outbound LINKS_TO < 3 | 🆕 |
| Mirror notes | `size(content) < 600` AND outbound LINKS_TO = 0 AND type <> 'fleeting' | 🆕 (D6) |
| Broken wikilinks | parse `[[...]]` ใน content ที่ไม่ match Note.title ใดๆ | 🆕 |
| Link suggestions | notes ที่ share ≥ 2 tags + project เดียวกัน แต่ไม่มี LINKS_TO | 🆕 |
| Stale (non-code notes) | updatedAt เก่าสุด N อันดับ | 🆕 (code-derived ใช้ Freshness Protocol ฝั่ง plugin อยู่แล้ว) |
| MOC drift | MOC note ของ project เก่ากว่า note ล่าสุด | 🆕 (หลัง D5) |

### 4.4 MCP server changes (`mcp-server/index.js`)

1. Tool ใหม่ `brain-lint` → `GET /api/lint/report` (params: `checks[]`, `project`)
2. Tool ใหม่ `merge-tags` → `POST /api/tags/merge` (ให้ plugin apply fix หลัง user confirm)
3. Tool ใหม่ `get-project-catalog` → catalog endpoint (สำหรับ brain-moc)
4. **แก้ description ของ `save-knowledge`**: โหลด taxonomy ตอน startup แล้วฝัง canonical namespaces + กฎ "เลือกจาก tag เดิมก่อนสร้างใหม่" ใน description — ตาม D4.2 (agent เห็นกติกาตรงจุด call ไม่ต้องพึ่ง protocol โหลดครบ)
5. Response ของ `save-knowledge` แสดงผล normalization: `tags: efcore→ef-core (normalized), 2026-06-03 (rejected: date → ใส่ใน content แทน)` — agent/user เห็นและเรียนรู้

---

## 5. ฝั่ง plugin (AgentMarketPlace) — ฉบับปรับหลังมี server

เบากว่าแผนเดิมใน RESEARCH.md §3:

1. **GRAPH_PROTOCOL.md** — §1 Save Rules ชี้ taxonomy ที่ server (`get /api/tags/taxonomy` ผ่าน description ของ tool) แทน TAG_TAXONOMY.md ฉบับเต็ม; เพิ่มคำอธิบาย normalize/reject behavior ให้ agent เข้าใจ response ใหม่
   → **ไม่ต้องสร้าง TAG_TAXONOMY.md ใน plugin แล้ว** (single source of truth ที่ server — กัน drift)
2. **skills/brain-lint/SKILL.md** (ใหม่) — เรียก tool `brain-lint` → จัดกลุ่มผล → เสนอ fix → user confirm → apply ผ่าน `merge-tags` / re-save notes / เพิ่ม wikilink — คงกติกา propose-don't-auto-execute
3. **skills/brain-moc/SKILL.md** (ใหม่) — เรียก `get-project-catalog` → LLM เขียน MOC → save เป็น note; Search Rules Step 0 (index-first); brain-scan refresh MOC ท้าย run
4. **brain-save/brain-scan/brain-update** — ปรับให้อ่าน normalization result จาก response แล้วรายงาน user

---

## 6. Revised Epic — cross-repo 2 workstreams

ลำดับ: **server ก่อน plugin** (plugin v3.3 ต้องมี tools ใหม่ให้เรียก)

| # | Feature | Repo | ครอบ | หมายเหตุ |
|---|---|---|---|---|
| 1 | Tag taxonomy + normalization + validation ที่ API | SecondBrain | D1, D2, D4 | registry + NoteService + endpoints + tests |
| 2 | Lint + catalog endpoints + MCP tools ใหม่ | SecondBrain | D3 (data), D5 (data), D6 | reuse orphans/tag-cloud เดิม |
| 3 | Tag migration รันจริง + วัดผล | SecondBrain | D1 acceptance | `/api/admin/migrate-tags` + brain-stats before/after (เป้า < 500 unique, ไม่เหลือคู่ distance ≤ 1) |
| 4 | brain plugin v3.3.0 — protocol + brain-lint + brain-moc skills | AgentMarketPlace | D3 (workflow), D5, D6 | หลัง 1–2 deploy แล้ว |

- Workstream AgentMarketPlace: track ใน `feature_list.json` (epic `brain-v33-llmwiki`, opus + adversarial ตาม force_opus_all)
- Workstream SecondBrain: track ใน repo นั้น (มี long-running setup ของตัวเองหรือทำเป็น plan doc) — **อย่า track งาน SecondBrain เป็น feature ของ AgentMarketPlace** (ข้าม repo, /continue จะหาไฟล์ไม่เจอ)
- Compatibility: plugin v3.2 เดิมใช้กับ server ใหม่ได้ (normalize เงียบๆ ฝั่ง server, reject ตอบ 400 ที่ MCP แปลงเป็น error message อ่านรู้เรื่อง) — deploy server ก่อนไม่พัง plugin เก่า

---

## 7. Open Decisions (อัปเดตจาก RESEARCH.md §5)

1. ~~Tag merge ระดับ server ทำไม่ได้~~ → **แก้แล้ว: `POST /api/tags/merge` + `/api/admin/migrate-tags`** — acceptance วัด raw unique tag count ตรงตาม directive ได้เลย (< 500)
2. `kubernetes` vs `k8s` → ยืนยันเสนอ `kubernetes` (canonical ชื่อเต็ม)
3. เอกพจน์/พหูพจน์ → ตาม Appendix A ตรงตัว
4. MOC scale → hub-of-hubs เมื่อ notes > ~80
5. 🆕 **Reject vs auto-normalize ที่ API**: date/status flag ใน tags — ตอบ 400 (agent ต้องแก้เอง เรียนรู้กติกา) หรือ auto-strip เงียบๆ (สะดวกแต่ agent ไม่รู้ตัว)? → **แนะนำ: 400 พร้อม message ชี้ทางแก้** สำหรับ blocked, แต่ alias → canonical ทำเงียบ + รายงานใน response (ไม่ใช่ error — เจตนาถูกแล้ว)
6. 🆕 **BigBrain**: ยังไม่แตะใน epic นี้ — ถ้า user ต้องการ apply taxonomy/lint แนวเดียวกันกับ Graphiti stack หรือจะรวมสอง brain เป็นตัวเดียว ให้เปิด plan แยก (ต้อง confirm เจตนาก่อน)
