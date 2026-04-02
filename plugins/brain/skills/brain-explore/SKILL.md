---
name: brain-explore
description: "Interactive graph traversal — navigate knowledge by walking through relationships node by node"
user_invocable: true
args: "<keyword, note title, or tag> — starting point for exploration"
---

# Brain Explore — Interactive Graph Traversal

ALL responses MUST be in Thai language.

## Purpose

เดินตาม graph จาก node หนึ่งไปอีก node ผ่าน relationships — ค้นหาแบบ "ตามเส้น" ไม่ใช่แบบ keyword

## Steps

1. **Find starting node**
   - Call `mcp__graph-brain__search-knowledge` query="{argument}" limit=5
   - If multiple matches → show numbered list, let user pick
   - If exact match → auto-select

2. **Load starting node**
   - Call `mcp__graph-brain__get-knowledge` noteId="{id}"
   - Display brief summary of node content (max 5 lines)

3. **Explore connections**
   - Call `mcp__graph-brain__explore-graph` nodeId="{id}" depth=1
   - Parse response to extract connected nodes and relationship types

4. **Display interactive map (Thai)**
   ```
   🧭 Exploring: [{Note Title}]
   📍 Path: {breadcrumb if not first hop}
   ─────────────────────────────────────
   {Brief content summary — max 5 lines}
   ─────────────────────────────────────

   🔗 Connections ({N} total):

   📄 Notes (LINKS_TO):
     [1] → {Connected Note Title 1}
     [2] → {Connected Note Title 2}

   🏷️ Tags (TAGGED):
     [3] → #{tag-1}
     [4] → #{tag-2}

   📁 Folder:
     [5] → /{folder-path}/

   🏗️ Project:
     [6] → {Project Name}

   ─────────────────────────────────────
   เลือก:
   [เลข] → explore node นั้นต่อ
   [B]   ← กลับ node ก่อนหน้า
   [S]   🔍 search ใหม่
   [Q]   หยุด explore
   ```

5. **Handle navigation**
   - **Number selected** → load that node (Step 2), explore connections (Step 3), display (Step 4)
   - **[B] Back** → return to previous node in breadcrumb stack
   - **[S] Search** → ask for new keyword, go to Step 1
   - **[Q] Quit** → end exploration, show summary

6. **Maintain breadcrumb**
   - Track path: `Node A → Node B → Node C`
   - Display breadcrumb at top of each hop
   - Max depth: 10 hops (warn user if approaching limit)

7. **End exploration summary**
   ```
   🧭 Exploration Summary
   ═══════════════════════════════════════
   📍 Path taken: {A} → {B} → {C} → {D}
   📊 Nodes visited: {N}
   🔗 Unique relationships seen: {M}

   💡 ลองต่อ:
     /brain-explain {most interesting node} — อธิบายแบบละเอียด
     /brain-history {node with versions} — ดูประวัติเปลี่ยนแปลง
   ```

8. **Write activity log**
   - Append entry to `.brain/activity-log.json`
   ```json
   {
     "timestamp": "<ISO 8601 UTC>",
     "session_id": "<$CLAUDE_SESSION_ID or date-based>",
     "command": "brain-explore",
     "args": "<starting keyword>",
     "project": "<project-name from cwd>",
     "status": "completed",
     "details": {
       "start_node": "<starting note title>",
       "nodes_visited": N,
       "path": ["<node titles in order>"],
       "hops": N
     }
   }
   ```

## Options (via argument flags)

| Flag | Effect |
|------|--------|
| `--depth N` | Show connections up to N hops at once (default: 1) |
| `--links` | Filter: show only LINKS_TO connections |
| `--tags` | Filter: show only TAGGED connections |
| `--project {name}` | Filter: show only nodes in specified project |
