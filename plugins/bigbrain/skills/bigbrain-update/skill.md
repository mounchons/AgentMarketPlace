---
name: bigbrain-update
description: "Update existing entity knowledge — add new episode stating changes, Graphiti auto-invalidates superseded facts and creates new ones"
user_invocable: true
args: "<entity name or keyword> — entity to update"
---

# BigBrain Update — Versioned Knowledge Update

ALL responses MUST be in Thai language.

**Graphiti Protocol:** Follow Versioning Protocol in `GRAPHITI_PROTOCOL.md`.

## How Versioning Works in Graphiti

Graphiti ไม่ได้ "แก้ไข" facts — มันใช้ **temporal invalidation**:
- เมื่อ add episode ใหม่ที่ขัดกับ fact เก่า → Graphiti **auto-invalidate** fact เก่า
- Fact เก่ายังอยู่ใน graph แต่มี `expired_at` / `invalid` flag
- Fact ใหม่จะถูกสร้างแทน — ทำให้ดู **timeline ของความเปลี่ยนแปลง** ได้

ดังนั้น "update" = **add episode ใหม่ที่ระบุชัดเจนว่าอะไรเปลี่ยน**

## Steps

1. **Find target entity**
   - Call `mcp__big-brain__search_memory_nodes` query="{argument}" group_ids=["bigbrain"] max_nodes=5
   - If multiple matches → show numbered list, let user pick
   - If not found → suggest `/bigbrain-save` instead

2. **Show current state**
   - Display entity summary from node data
   - Call `mcp__big-brain__search_memory_facts` query="{entity name}" center_node_uuid="{uuid}" group_ids=["bigbrain"] max_facts=15
   - Display current valid facts:
     ```
     🔵 Entity: {Entity Name}
     📋 Summary: {current summary}

     🔗 Current Facts ({N}):
     • {Source} →[{relation}]→ {Target} (since {valid_at})
     • {Source} →[{relation}]→ {Target} (since {valid_at})
     ```

3. **Read codebase for changes** (if needed)
   - If user specified what changed → use that directly
   - If user wants auto-detect → read relevant code files, compare with current facts
   - Identify: what's NEW, what CHANGED, what's REMOVED

4. **Compose update episode**
   Format episode_body as **explicit change description** for optimal fact invalidation:

   ```
   [Update] {Entity Name} — {date}

   CHANGED: {Entity Name} previously {old fact}. Now {Entity Name} {new fact}.
   ADDED: {Entity Name} now also {new relationship or attribute}.
   REMOVED: {Entity Name} no longer {removed relationship}.

   Context: {why the change happened — migration, refactor, new feature, etc.}
   Project: {project name}
   ```

   **Key principles:**
   - ระบุ "previously" + "now" เพื่อให้ Graphiti invalidate fact เก่าอัตโนมัติ
   - ระบุ entity names ชัดเจน ทุกครั้ง
   - ใส่ reason/context เพื่อให้ fact ใหม่มี context

   Episode metadata:
   - **name**: `"{Entity Name} — Update {YYYY-MM-DD}"`
   - **source**: `"text"`
   - **source_description**: `"knowledge update — {reason}"`
   - **group_id**: `"bigbrain"`

5. **Confirm with user before saving**
   ```
   📝 Update Episode Preview:
   ─────────────────────────────────────
   {show episode_body}
   ─────────────────────────────────────

   ⚠️ Graphiti จะ:
   • Invalidate facts ที่ขัดกับข้อมูลใหม่
   • สร้าง facts ใหม่จาก update content
   • เก็บ facts เก่าไว้ใน history (ไม่ลบ)

   [Y] บันทึก  [N] แก้ไขก่อน  [C] ยกเลิก
   ```

6. **Save update episode**
   - Call `mcp__big-brain__add_memory` with prepared data
   - Call `mcp__big-brain__wait_for_add_memory_task` task_id="{id}" timeout=120

7. **Verify changes**
   - Call `mcp__big-brain__search_memory_facts` center_node_uuid="{uuid}" max_facts=15
   - Compare before/after facts
   - Report:
     ```
     ✅ Update สำเร็จ!
     📊 ผลลัพธ์:
     • Facts invalidated: {N} (ยังดูได้ใน /bigbrain-history)
     • Facts created: {M}
     • Entity summary: updated

     💡 ใช้ /bigbrain-history {entity} เพื่อดู timeline ทั้งหมด
     ```

8. **Write activity log**
   - Append entry to `.bigbrain/activity-log.json`
   ```json
   {
     "timestamp": "<ISO 8601 UTC>",
     "session_id": "<$CLAUDE_SESSION_ID or date-based>",
     "command": "bigbrain-update",
     "args": "<entity name>",
     "project": "<project-name from cwd>",
     "status": "completed",
     "details": {
       "entity_name": "<target entity>",
       "entity_uuid": "<uuid>",
       "episode_name": "<update episode name>",
       "task_id": "<add_memory task_id>",
       "changes": {
         "added": ["<new facts>"],
         "changed": ["<modified facts>"],
         "removed": ["<invalidated facts>"]
       },
       "reason": "<why updated>"
     }
   }
   ```

## Examples
```
/bigbrain-update Authentication     → ดูและ update facts เกี่ยวกับ Auth
/bigbrain-update Neo4j              → update version/config ของ Neo4j
/bigbrain-update MyApp architecture → update architecture facts ของ project
```
