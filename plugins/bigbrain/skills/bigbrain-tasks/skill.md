---
name: bigbrain-tasks
description: "View and manage async add_memory tasks — check status, wait for completion, cancel stuck tasks"
user_invocable: true
args: "[task_id | --cancel task_id | --wait task_id | --status filter]"
---

# BigBrain Tasks — Async Task Manager

ALL responses MUST be in Thai language.

## Purpose

จัดการ async tasks จาก `add_memory` — เพราะ Graphiti process episodes ใน background

## Steps

### List Tasks (default — no args)

1. Call `mcp__big-brain__list_add_memory_tasks` limit=20
2. Display:
   ```
   ⏱️ BigBrain Tasks:
   ═══════════════════════════════════════

   | # | Task ID | Status      | Group    |
   |---|---------|-------------|----------|
   | 1 | {id}    | ✅ completed | bigbrain |
   | 2 | {id}    | ⏳ processing| bigbrain |
   | 3 | {id}    | 📋 queued   | bigbrain |
   | 4 | {id}    | ❌ failed   | bigbrain |

   📊 สรุป: {completed} สำเร็จ, {processing} กำลังทำ, {queued} รอคิว, {failed} ล้มเหลว
   ```

### Check Specific Task (task_id arg)

1. Call `mcp__big-brain__get_add_memory_task_status` task_id="{id}"
2. Display full task details

### Wait for Task (--wait flag)

1. Call `mcp__big-brain__wait_for_add_memory_task` task_id="{id}" timeout=120
2. Report result when done

### Cancel Task (--cancel flag)

1. Confirm with user:
   ```
   ⚠️ ต้องการยกเลิก task นี้?
   🆔 Task ID: {id}
   [Y] ยกเลิก  [N] ไม่ยกเลิก
   ```
2. If confirmed → call `mcp__big-brain__cancel_add_memory_task` task_id="{id}"
3. Report result

### Filter by Status (--status flag)

1. Call `mcp__big-brain__list_add_memory_tasks` status="{filter}" limit=50
   - Valid filters: queued, processing, completed, failed, cancelled
2. Display filtered results

## Status Icons
- ✅ completed — สำเร็จ
- ⏳ processing — กำลังประมวลผล (entity/fact extraction)
- 📋 queued — รอคิว
- ❌ failed — ล้มเหลว
- 🚫 cancelled — ถูกยกเลิก
