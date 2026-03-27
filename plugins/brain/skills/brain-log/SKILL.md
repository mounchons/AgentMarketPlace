---
name: brain-log
description: "View brain activity logs — track scan, save, update operations across sessions with filtering by date, command, and session"
user_invocable: true
args: "[today | week | --command scan|save|update | --session <id> | --last N] — filter log entries"
---

# Brain Log — Activity History Viewer

ALL responses MUST be in Thai language.

## Purpose

แสดงประวัติการใช้งาน brain commands ข้าม sessions ทั้งหมด — ช่วยตอบคำถาม:
- "scan ไปแล้วหรือยัง?"
- "save อะไรไปบ้างวันนี้?"
- "session ก่อนหน้าทำอะไรไป?"

## Log File Location

`.brain/activity-log.json` at project root — JSON array of log entries.

## Steps

1. **Read log file**
   - Read `.brain/activity-log.json`
   - If file doesn't exist → show "ยังไม่มีประวัติ — ลอง /brain-scan หรือ /brain-save ก่อน"

2. **Apply filters based on arguments**

   | Argument | Filter |
   |----------|--------|
   | (none) | Show last 20 entries |
   | `today` | Entries from today only |
   | `week` | Entries from last 7 days |
   | `--command scan` | Only brain-scan entries |
   | `--command save` | Only brain-save entries |
   | `--command update` | Only brain-update entries |
   | `--session <id>` | Only entries from specific session |
   | `--last N` | Show last N entries |
   | `--all` | Show everything (no limit) |

   Filters can be combined: `/brain-log today --command scan`

3. **Display results in Thai**

   Format as a clear table:
   ```
   📋 Brain Activity Log — {project-name}
   ═══════════════════════════════════════

   🕐 2026-03-27 14:30 UTC │ Session: abc123
      📡 brain-scan --full │ ✅ completed
      └─ สร้างใหม่ 12 ชิ้น, อัพเดท 3 ชิ้น (4m 32s)

   🕐 2026-03-27 15:10 UTC │ Session: abc123
      💾 brain-save "Permission Matrix" │ ✅ completed
      └─ /projects/myapp/permissions/ │ tags: [myapp, permission, role]

   🕐 2026-03-26 09:00 UTC │ Session: def456
      📡 brain-scan │ ✅ completed
      └─ Smart scan: Phase 4,6 only │ อัพเดท 2 ชิ้น (1m 15s)

   ═══════════════════════════════════════
   📊 สรุป: 3 entries │ 2 sessions │ ล่าสุด: 2026-03-27
   ```

4. **Show summary stats**
   - จำนวน entries ทั้งหมด (หรือที่ filter แล้ว)
   - จำนวน sessions ที่แตกต่างกัน
   - คำสั่งที่ใช้บ่อยที่สุด
   - วันที่ scan/save ล่าสุด

5. **Suggest next actions**
   - ถ้าไม่เคย scan → แนะนำ `/brain-scan`
   - ถ้า scan นานแล้ว (>7 days) → แนะนำ `/brain-scan` (incremental)
   - ถ้ามีแต่ scan ไม่มี save → แนะนำ `/brain-save`
