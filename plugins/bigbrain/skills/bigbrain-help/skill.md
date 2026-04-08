---
name: bigbrain-help
description: "Complete command reference for BigBrain Graphiti plugin — all commands, concepts, workflows, and tips"
user_invocable: true
args: "[command-name] — if omitted, show full reference"
---

# BigBrain Help

ALL responses MUST be in Thai language.

## Display

If argument provided → show detailed help for that command only.
If no argument → show full reference below.

```
═══════════════════════════════════════════════════
🧠 BigBrain — Graph RAG Knowledge Management v1.0
═══════════════════════════════════════════════════

📖 Powered by Graphiti Temporal Knowledge Graph
🌐 MCP: http://localhost:2900/mcp/
📦 Backend: Neo4j + Ollama (local)

─────────────────────────────────────────────────
📋 COMMANDS
─────────────────────────────────────────────────

🔍 ค้นหา & สอบถาม:
  /bigbrain <question>         ถาม Brain First (graph → codebase)
  /bigbrain-search <keyword>   ค้นหา entities & facts
  /bigbrain-explore <entity>   เดินตาม graph ดู connections

💾 บันทึก & อัพเดท:
  /bigbrain-save [topic]       บันทึกข้อมูลใหม่เป็น episode
                               Graphiti จะ extract entities/facts อัตโนมัติ
  /bigbrain-update <entity>    อัพเดท entity ที่มีอยู่ (auto-invalidate facts เก่า)

📜 Versioning & History:
  /bigbrain-history <entity>   ดู timeline ของ entity (active + superseded facts)

📝 จัดการ:
  /bigbrain-episodes [N]       ดู episodes ล่าสุด (default: 10)
  /bigbrain-tasks [task_id]    จัดการ async tasks
  /bigbrain-status             ตรวจสอบ connection & stats

📖 ช่วยเหลือ:
  /bigbrain-help [command]     คู่มือนี้

─────────────────────────────────────────────────
🧠 CONCEPTS — Graphiti Data Model
─────────────────────────────────────────────────

📝 Episode = เนื้อหาดิบที่เพิ่มเข้าไป (text, JSON, message)
             ↓ auto entity extraction
🔵 Node    = entity ที่ extract ได้ (คน, ระบบ, concept, technology)
             ↓ auto relationship extraction
🔗 Fact    = ความสัมพันธ์ระหว่าง entities
             (มี temporal metadata — รู้ว่าสร้างเมื่อไหร่, ยังใช้ได้ไหม)

📦 Group ID = "bigbrain" — แยก domain ของข้อมูล

⏱️ Temporal = Facts มี lifecycle:
             Created → Valid → Superseded (by new episode)
             Facts เก่าไม่ถูกลบ — ดูได้ใน /bigbrain-history

ตัวอย่าง:
  Episode: "MyApp ใช้ React สำหรับ frontend และ .NET 8 สำหรับ backend"
  → Nodes: [MyApp], [React], [.NET 8]
  → Facts: MyApp →[uses]→ React, MyApp →[uses]→ .NET 8

  Update: "MyApp previously used React. Now MyApp uses Next.js for frontend."
  → Facts: MyApp →[uses]→ React (SUPERSEDED)
           MyApp →[uses]→ Next.js (NEW, active)

─────────────────────────────────────────────────
🔄 WORKFLOWS
─────────────────────────────────────────────────

🆕 เริ่มต้นใช้งาน:
  1. /bigbrain-status              ตรวจ connection
  2. /bigbrain-save architecture   บันทึก architecture
  3. /bigbrain-search project      ค้นหาดูผลลัพธ์

📚 ค้นหาข้อมูล:
  1. /bigbrain <question>          ถามก่อน (เร็ว)
  2. /bigbrain-search <keyword>    ค้นลึกขึ้น
  3. /bigbrain-explore <entity>    เดินตาม graph

💾 สะสม knowledge:
  1. ทำงานกับ codebase ปกติ
  2. /bigbrain-save                auto-detect จาก conversation
  3. /bigbrain-tasks               ตรวจสอบว่า save สำเร็จ
  4. /bigbrain-search              verify ข้อมูลใน graph

🔄 อัพเดท knowledge:
  1. /bigbrain-history <entity>    ดูสถานะปัจจุบัน
  2. /bigbrain-update <entity>     สร้าง update episode
  3. /bigbrain-history <entity>    verify ว่า facts เปลี่ยนถูกต้อง

─────────────────────────────────────────────────
💡 TIPS
─────────────────────────────────────────────────

• เขียน episode body เป็นประโยค — ยิ่งมี context ดี entity extraction ยิ่งแม่น
• ใช้ group_id "bigbrain" เสมอ (ตั้งเป็น default)
• add_memory เป็น async — ใช้ /bigbrain-tasks ดูสถานะ
• ลบ episode ไม่ได้ลบ entities/facts ที่ extract แล้ว
• center_node_uuid ช่วยค้นหา facts รอบ entity ที่สนใจ
• Update = add episode ที่ระบุ "previously X, now Y" → auto-invalidate
• ข้อมูลเพิ่ม (ไม่ขัดกัน) → /bigbrain-save, ข้อมูลเปลี่ยน → /bigbrain-update
• /bigbrain-history ดู facts ทั้ง active + superseded ตาม timeline

─────────────────────────────────────────────────
🏗️ INFRASTRUCTURE
─────────────────────────────────────────────────

| Service            | Port | URL                         |
|--------------------|------|-----------------------------|
| Graphiti MCP       | 2900 | http://localhost:2900/mcp/  |
| Management Web UI  | 6062 | http://localhost:6062       |
| Manager Backend    | 7072 | http://localhost:7072       |
| Neo4j Browser      | 2474 | http://localhost:2474       |
| Neo4j Bolt         | 2687 | bolt://localhost:2687       |
| Ollama             |11434 | http://localhost:11434      |

Start: cd D:\GitHub\BigBrain\graphiti-mcp-pro && docker compose up -d
Stop:  cd D:\GitHub\BigBrain\graphiti-mcp-pro && docker compose down
```
