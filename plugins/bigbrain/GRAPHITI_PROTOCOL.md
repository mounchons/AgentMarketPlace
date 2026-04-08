---
name: Graphiti Protocol
description: Shared rules for all bigbrain skills — Episode Rules, Search Strategy, Group ID Convention, Entity/Fact Model, Versioning Protocol
---

# Graphiti Protocol — Graph RAG Rules

ทุก bigbrain skill ที่ save, search, หรือ explore knowledge ต้องทำตามกฎเหล่านี้

## Data Model

Graphiti จัดเก็บข้อมูลเป็น 3 ระดับ:

```
Episodes (raw content)
  ↓ entity extraction
Nodes (entities — คน, ระบบ, concept)
  ↓ relationship extraction
Facts/Edges (ความสัมพันธ์ระหว่าง entities — มี temporal metadata)
```

- **Episode** = เนื้อหาดิบที่ add เข้าไป (text, JSON, message)
- **Node** = entity ที่ extract ได้ (เช่น "Neo4j", "Authentication System", "User")
- **Fact/Edge** = ความสัมพันธ์ (เช่น "Neo4j STORES User data", "Auth System USES JWT tokens")
- **Temporal metadata** = fact มีเวลาสร้าง + สถานะว่ายังใช้ได้หรือ superseded แล้ว

## 1. Group ID Convention

**ใช้ `group_id: "bigbrain"` เสมอ** สำหรับทุก operation:

- `add_memory`: ส่ง `group_id: "bigbrain"`
- `search_memory_facts`: ส่ง `group_ids: ["bigbrain"]`
- `search_memory_nodes`: ส่ง `group_ids: ["bigbrain"]`
- `get_episodes`: ส่ง `group_id: "bigbrain"`

ถ้า user ต้องการแยก domain → ใช้ group_id อื่น เช่น `"bigbrain-{project-name}"`

## 2. Episode Rules (Save)

เมื่อ **ADD MEMORY** ต้องทำทุกข้อ:

1. **name** — ตั้งชื่อ descriptive: `"{Project} — {Topic}"` (เช่น "BigBrain — Architecture Overview")
2. **source** — เลือกให้ถูก:
   - `text`: plain text content (default)
   - `json`: structured data (ต้อง escape JSON string)
   - `message`: conversation-style content
3. **source_description** — อธิบายที่มา: "codebase analysis", "user conversation", "documentation", "scan result"
4. **episode_body** — เนื้อหาต้อง:
   - มี context เพียงพอให้ entity extraction ทำงานได้ดี
   - ระบุ relationships ชัดเจน (เช่น "X uses Y", "A connects to B")
   - ใส่ project name เพื่อให้ extract เป็น entity
   - ห้ามใส่แค่ keyword — ต้องเป็นประโยคหรือ structured content
5. **Duplicate awareness** — search ก่อน save เพื่อตรวจว่ามี knowledge ซ้ำหรือไม่
   - Call `search_memory_nodes` query="{topic}" ก่อน add
   - ถ้าพบ entity ที่ตรงกัน → แจ้ง user ก่อน add (Graphiti จะ merge/update facts อัตโนมัติ)

## 3. Search Strategy (3 ขั้น)

Search ตามลำดับ — หยุดเมื่อได้ผลลัพธ์เพียงพอ:

1. **Search Nodes** (entities): `search_memory_nodes` query="{keyword}" max_nodes=10
   - ได้ entity summaries พร้อม relationships
   - ถ้าพบ >= 3 nodes ที่ตรง → หยุด
2. **Search Facts** (relationships): `search_memory_facts` query="{keyword}" max_facts=10
   - ได้ relationships ระหว่าง entities พร้อม temporal info
   - เสริม context ที่ได้จาก nodes
3. **Get Episodes** (raw content): `get_episodes` last_n=10
   - ดูเนื้อหาดิบล่าสุด — last resort
   - ใช้เมื่อ nodes/facts ไม่พบ แต่ต้องการ context เพิ่ม

### Center Node Search
ถ้ามี node UUID จาก search ก่อนหน้า → ใช้ `center_node_uuid` parameter เพื่อ search รอบ node นั้น:
- `search_memory_facts` query="{related topic}" center_node_uuid="{uuid}"
- `search_memory_nodes` query="{related topic}" center_node_uuid="{uuid}"

## 4. Async Task Rules

`add_memory` เป็น **async operation** — return task_id ทันที แต่ processing ทำ background:

1. **หลัง add_memory** → เก็บ task_id ไว้
2. **ถ้า user ต้องการรอ** → call `wait_for_add_memory_task` task_id="{id}" timeout=120
3. **ถ้า user ไม่ต้องการรอ** → แจ้ง task_id ให้ user ใช้ `/bigbrain-tasks` ตรวจสอบทีหลัง
4. **Batch saves** → add ทีละ episode, collect task_ids, report status รวม
5. **ถ้า task ค้าง** → ใช้ `cancel_add_memory_task` ยกเลิกได้

## 5. Versioning Protocol

Graphiti ใช้ **temporal invalidation** ไม่ใช่ explicit changelog:

### หลักการ
- Fact = ความจริง ณ ช่วงเวลาหนึ่ง (มี `valid_at`, `created_at`, `expired_at`)
- เมื่อ add episode ใหม่ที่ขัดกับ fact เก่า → Graphiti **auto-invalidate** fact เก่า
- Fact เก่า **ไม่ถูกลบ** — ยังอยู่ใน graph เป็น "superseded" fact
- Node summary จะถูก update อัตโนมัติจาก facts ที่ยัง valid

### Update Episode Format
เมื่อต้องการ update knowledge ของ entity → เขียน episode ที่ระบุ change ชัดเจน:

```
[Update] {Entity Name} — {YYYY-MM-DD}

CHANGED: {Entity} previously {old state}. Now {Entity} {new state}.
ADDED: {Entity} now also {new info}.
REMOVED: {Entity} no longer {removed info}.

Context: {reason for change}
Project: {project name}
```

**Key rules:**
1. ใช้คำว่า "previously" + "now" เสมอ → ช่วยให้ Graphiti invalidate fact เก่าได้ถูก
2. ระบุ entity name ทุกประโยค → ให้ extraction เชื่อม fact กับ entity ถูกตัว
3. ใส่ reason/context → fact ใหม่จะมี context ว่าทำไมเปลี่ยน
4. Episode name format: `"{Entity} — Update {YYYY-MM-DD}"`
5. source_description: `"knowledge update — {reason}"`

### Temporal Query
ดู history ของ entity:
1. Search facts ด้วย `center_node_uuid` → ได้ทั้ง valid + invalid facts
2. แยก active (valid) vs superseded (expired/invalid)
3. เรียงตาม `valid_at` → เห็น timeline
4. Match กับ episodes → เห็นว่า episode ไหนทำให้ fact เปลี่ยน

### Fact Lifecycle
```
Created ──► Valid ──► Superseded (by new episode)
                         │
                         └── ยังอยู่ใน graph (viewable via /bigbrain-history)
                             แต่ไม่ปรากฏใน node summary
```

### เมื่อไหร่ควร Update vs Save ใหม่

| สถานการณ์ | ใช้ Command |
|-----------|------------|
| Entity มีอยู่แล้ว + ข้อมูลเปลี่ยน | `/bigbrain-update` |
| Entity มีอยู่แล้ว + เพิ่มข้อมูลใหม่ (ไม่ขัดกัน) | `/bigbrain-save` (Graphiti merge อัตโนมัติ) |
| Entity ใหม่ทั้งหมด | `/bigbrain-save` |
| ต้องการลบ fact ที่ผิดพลาด | `/bigbrain-history --delete UUID` |

## 6. Entity Type Filter

`search_memory_nodes` รองรับ entity filter:
- `entity: "Preference"` — ค้น user preferences
- `entity: "Procedure"` — ค้น procedures/workflows
- ปล่อยว่าง → ค้นทุก entity type

## 6. Display Format

### Node Display:
```
🔵 {Node Name}
   Summary: {node summary}
   UUID: {uuid}
```

### Fact Display:
```
🔗 {Source Entity} →[{relation}]→ {Target Entity}
   Valid: {valid_at} | Created: {created_at}
   Fact: {fact text}
```

### Episode Display:
```
📝 {Episode Name}
   Source: {source} | {source_description}
   Created: {created_at}
   Content: {preview...}
```
