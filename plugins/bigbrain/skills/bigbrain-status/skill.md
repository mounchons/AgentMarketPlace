---
name: bigbrain-status
description: "Check BigBrain Graphiti connection status, show graph statistics, recent tasks, and service health"
user_invocable: true
---

# BigBrain Status

ALL responses MUST be in Thai language.

## Steps

1. **Test connection**
   - Call `mcp__big-brain__search_memory_nodes` query="test" group_ids=["bigbrain"] max_nodes=1
   - If succeeds → connected
   - If fails → not connected

2. **If connected** — show:

   **Connection info:**
   ```
   ✅ BigBrain Graphiti — Connected
   🌐 MCP: http://localhost:2900/mcp/
   🗄️ Neo4j: http://localhost:2474
   🖥️ Web UI: http://localhost:6062
   ```

   **Graph statistics:**
   - Call `mcp__big-brain__search_memory_nodes` query="" group_ids=["bigbrain"] max_nodes=1 → check if data exists
   - Call `mcp__big-brain__get_episodes` group_id="bigbrain" last_n=1 → check episode count
   - Display:
     ```
     📊 Graph Stats:
     • Episodes: {count or "มีข้อมูล" if can't count exact}
     • Group ID: bigbrain
     ```

   **Recent tasks:**
   - Call `mcp__big-brain__list_add_memory_tasks` group_id="bigbrain" limit=5
   - Display:
     ```
     ⏱️ Recent Tasks:
     | # | Task ID | Status | Name |
     |---|---------|--------|------|
     | 1 | {id}    | {status} | {name} |
     ```

   **Available commands:**
   ```
   📋 Commands:
   /bigbrain <question>     — ถาม Brain First
   /bigbrain-search <keyword> — ค้นหา entities & facts
   /bigbrain-save [topic]   — บันทึกข้อมูลใหม่
   /bigbrain-explore <entity> — เดินตาม graph
   /bigbrain-episodes [N]   — ดู episodes ล่าสุด
   /bigbrain-tasks          — จัดการ async tasks
   /bigbrain-help           — คู่มือทั้งหมด
   ```

3. **If failed** — show:
   ```
   ❌ BigBrain Graphiti — ไม่สามารถเชื่อมต่อได้

   🔍 สาเหตุที่เป็นไปได้:
   • Docker containers ไม่ได้รัน
   • MCP server ยังไม่พร้อม (กำลัง start)
   • Network / port ถูก block

   💡 แก้ไข:
   1. cd D:\GitHub\BigBrain\graphiti-mcp-pro
   2. docker compose up -d
   3. รอ 30 วินาทีให้ Neo4j + MCP พร้อม
   4. ลอง /bigbrain-status อีกครั้ง

   🔧 Debug:
   • docker compose ps — ดูสถานะ containers
   • docker compose logs -f mcp-with-manager — ดู logs
   • netstat -ano | findstr "2900" — ตรวจ port
   ```
