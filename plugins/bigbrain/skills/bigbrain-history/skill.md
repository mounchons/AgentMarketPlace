---
name: bigbrain-history
description: "View temporal evolution of entity knowledge — timeline of facts (valid/invalid/superseded), track changes over time"
user_invocable: true
args: "<entity name or keyword> — entity to view history"
---

# BigBrain History — Temporal Knowledge Timeline

ALL responses MUST be in Thai language.

## Purpose

แสดง **timeline ของการเปลี่ยนแปลง** ของ entity — facts ที่ยังใช้ได้, facts ที่ถูก supersede, และลำดับเวลา

Graphiti เก็บ temporal metadata บนทุก fact:
- `created_at` — เวลาที่สร้าง fact
- `valid_at` — เวลาที่ fact เริ่มมีผล
- `expired_at` / invalid flag — เวลาที่ fact ถูก supersede (ถ้ามี)

## Steps

1. **Find target entity**
   - Call `mcp__big-brain__search_memory_nodes` query="{argument}" group_ids=["bigbrain"] max_nodes=5
   - If multiple matches → show numbered list, let user pick
   - If not found → suggest `/bigbrain-search`

2. **Load all facts (current + historical)**
   - Call `mcp__big-brain__search_memory_facts` query="{entity name}" center_node_uuid="{uuid}" group_ids=["bigbrain"] max_facts=50
   - Separate into:
     - **Active facts** — currently valid (no expired_at / not invalidated)
     - **Superseded facts** — invalidated (has expired_at / invalid flag)

3. **Load related episodes**
   - Call `mcp__big-brain__get_episodes` group_id="bigbrain" last_n=20
   - Filter episodes that mention this entity name
   - These represent the "source events" that created/updated facts

4. **Display timeline (Thai)**

   ```
   📜 History: [{Entity Name}]
   ═══════════════════════════════════════════════════

   🔵 Entity Summary (current):
   {current node summary}

   ─────────────────────────────────────────────────
   ✅ Active Facts ({N}):
   ─────────────────────────────────────────────────
   • {Source} →[{relation}]→ {Target}
     📅 Valid since: {valid_at}
     📝 "{fact text}"

   • {Source} →[{relation}]→ {Target}
     📅 Valid since: {valid_at}
     📝 "{fact text}"

   ─────────────────────────────────────────────────
   🔴 Superseded Facts ({M}):
   ─────────────────────────────────────────────────
   • ~~{Source} →[{relation}]→ {Target}~~
     📅 Valid: {valid_at} → Expired: {expired_at}
     📝 "{fact text}"
     🔄 Superseded by: {new fact if identifiable}

   • ~~{Source} →[{relation}]→ {Target}~~
     📅 Valid: {valid_at} → Expired: {expired_at}
     📝 "{fact text}"

   ─────────────────────────────────────────────────
   📝 Related Episodes (sources of change):
   ─────────────────────────────────────────────────
   | # | Date       | Episode Name              | Source      |
   |---|------------|---------------------------|-------------|
   | 1 | {date}     | {name}                    | {source}    |
   | 2 | {date}     | {name}                    | {source}    |

   ─────────────────────────────────────────────────
   📊 Summary:
   • Total facts ever: {N + M}
   • Active: {N} | Superseded: {M}
   • First recorded: {earliest valid_at}
   • Last updated: {latest valid_at of active facts}
   • Update episodes: {count}
   ```

5. **Offer actions**
   ```
   💡 ลองต่อ:
   [เลข]                        → ดู episode เต็ม
   /bigbrain-update {entity}    → อัพเดทข้อมูล entity นี้
   /bigbrain-explore {entity}   → เดินตาม graph ดู connections
   [D UUID]                     → ลบ fact/edge ที่ไม่ถูกต้อง
   ```

6. **Handle fact deletion** (if user selects [D UUID])
   - Confirm with user
   - Call `mcp__big-brain__delete_entity_edge` uuid="{uuid}"
   - Report result

7. **Write activity log**
   - Append entry to `.bigbrain/activity-log.json`
   ```json
   {
     "timestamp": "<ISO 8601 UTC>",
     "session_id": "<$CLAUDE_SESSION_ID or date-based>",
     "command": "bigbrain-history",
     "args": "<entity name>",
     "project": "<project-name from cwd>",
     "status": "completed",
     "details": {
       "entity_name": "<target entity>",
       "entity_uuid": "<uuid>",
       "active_facts": N,
       "superseded_facts": M,
       "related_episodes": K,
       "facts_deleted": 0
     }
   }
   ```

## Options

| Flag | Effect |
|------|--------|
| `--active` | Show only currently valid facts |
| `--superseded` | Show only invalidated/expired facts |
| `--episodes` | Show only related episodes timeline |
| `--delete UUID` | Delete a specific fact/edge by UUID |

## Examples
```
/bigbrain-history Authentication    → ดู timeline ของ Auth entity
/bigbrain-history Neo4j --superseded → ดูเฉพาะ facts ที่ถูก supersede
/bigbrain-history MyApp --episodes   → ดูเฉพาะ episodes ที่เกี่ยวกับ MyApp
```
