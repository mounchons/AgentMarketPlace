---
name: bigbrain-episodes
description: "View recent episodes (raw content) added to BigBrain Graphiti graph — browse and manage memory entries"
user_invocable: true
args: "[last N | --delete UUID] — default: show last 10 episodes"
---

# BigBrain Episodes — Episode Viewer

ALL responses MUST be in Thai language.

## Steps

### View Episodes (default)

1. **Get recent episodes**
   - Parse argument for count (default: 10)
   - Call `mcp__big-brain__get_episodes` group_id="bigbrain" last_n={N}

2. **Display episodes (Thai)**
   ```
   📝 Episodes ล่าสุด ({N} รายการ):
   ═══════════════════════════════════════

   [1] 📝 {Episode Name}
       📅 Created: {created_at}
       📦 Source: {source} — {source_description}
       📄 Preview: {first 100 chars of content}...
       🆔 UUID: {uuid}

   [2] 📝 {Episode Name}
       📅 Created: {created_at}
       📦 Source: {source} — {source_description}
       📄 Preview: {first 100 chars of content}...
       🆔 UUID: {uuid}

   ─────────────────────────────────────
   เลือก:
   [เลข]           → ดูเนื้อหาเต็ม
   [D เลข]         → ลบ episode นั้น
   /bigbrain-save  → เพิ่ม episode ใหม่
   ```

3. **View full episode** (when user selects number)
   - Display full episode_body content
   - Show all metadata

### Delete Episode (--delete flag)

1. **Confirm with user**
   ```
   ⚠️ ต้องการลบ episode นี้?
   📝 {Episode Name}
   🆔 UUID: {uuid}
   [Y] ลบ  [N] ยกเลิก
   ```

2. **If confirmed**
   - Call `mcp__big-brain__delete_episode` uuid="{uuid}"
   - Report result
   - Note: ลบ episode ไม่ได้ลบ entities/facts ที่ extract ไว้แล้ว

3. **Write activity log**
   - Log to `.bigbrain/activity-log.json`
