---
name: bigbrain-explore
description: "Interactive graph traversal — navigate Graphiti knowledge graph by walking through entities and their facts/relationships"
user_invocable: true
args: "<keyword or entity name> — starting point for exploration"
---

# BigBrain Explore — Interactive Graph Traversal

ALL responses MUST be in Thai language.

## Purpose

เดินตาม Graphiti graph จาก entity หนึ่งไปอีก entity ผ่าน facts/relationships — ค้นหาแบบ "ตามเส้น"

## Steps

1. **Find starting entity**
   - Call `mcp__big-brain__search_memory_nodes` query="{argument}" group_ids=["bigbrain"] max_nodes=5
   - If multiple matches → show numbered list, let user pick
   - If single match → auto-select

2. **Display current entity**
   ```
   🧭 Exploring: [{Entity Name}]
   📍 Path: {breadcrumb if not first hop}
   ─────────────────────────────────────
   📋 Summary: {node summary}
   🆔 UUID: {uuid}
   ─────────────────────────────────────
   ```

3. **Load relationships (facts)**
   - Call `mcp__big-brain__search_memory_facts` query="{entity name}" center_node_uuid="{uuid}" group_ids=["bigbrain"] max_facts=15
   - Parse facts to find connected entities

4. **Display interactive map (Thai)**
   ```
   🔗 Relationships ({N} facts):

   ➡️ Outgoing (active):
     [1] →[{relation}]→ {Target Entity}
         "{fact text}" (since {valid_at})
     [2] →[{relation}]→ {Target Entity}
         "{fact text}" (since {valid_at})

   ⬅️ Incoming (active):
     [3] {Source Entity} →[{relation}]→ [current]
         "{fact text}" (since {valid_at})
     [4] {Source Entity} →[{relation}]→ [current]
         "{fact text}" (since {valid_at})

   🔴 Superseded ({N} expired facts — use /bigbrain-history to view)

   ─────────────────────────────────────
   เลือก:
   [เลข] → explore entity นั้นต่อ
   [B]   ← กลับ entity ก่อนหน้า
   [S]   🔍 search ใหม่
   [F]   📊 ดู facts ทั้งหมดของ entity นี้
   [H]   📜 ดู history (timeline) ของ entity นี้
   [Q]   หยุด explore
   ```

5. **Handle navigation**
   - **Number selected** → search for that entity name, load it (Step 2)
   - **[B] Back** → return to previous entity in breadcrumb stack
   - **[S] Search** → ask for new keyword, go to Step 1
   - **[F] All Facts** → call `search_memory_facts` with center_node_uuid, show all
   - **[H] History** → invoke `/bigbrain-history {current entity name}` to show temporal timeline
   - **[Q] Quit** → end exploration, show summary

6. **Maintain breadcrumb**
   - Track path: `Entity A → Entity B → Entity C`
   - Display breadcrumb at top of each hop
   - Max depth: 10 hops (warn user if approaching limit)

7. **End exploration summary**
   ```
   🧭 Exploration Summary
   ═══════════════════════════════════════
   📍 Path: {A} → {B} → {C}
   📊 Entities visited: {N}
   🔗 Facts discovered: {M}

   💡 ลองต่อ:
     /bigbrain {entity name} — ถามแบบ Brain First
     /bigbrain-save — บันทึกข้อมูลใหม่
   ```

8. **Write activity log**
   - Append entry to `.bigbrain/activity-log.json`
   ```json
   {
     "timestamp": "<ISO 8601 UTC>",
     "session_id": "<$CLAUDE_SESSION_ID or date-based>",
     "command": "bigbrain-explore",
     "args": "<starting keyword>",
     "project": "<project-name from cwd>",
     "status": "completed",
     "details": {
       "start_entity": "<starting entity name>",
       "entities_visited": N,
       "facts_discovered": M,
       "path": ["<entity names in order>"],
       "hops": N
     }
   }
   ```
