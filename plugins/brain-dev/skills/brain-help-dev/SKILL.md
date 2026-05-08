---
name: brain-help-dev
description: "Show all available brain commands with descriptions"
user_invocable: true
---

# Brain Help — Command Reference

ALL responses MUST be in Thai language.

Display this command reference to the user:

```
🧠 Brain Commands — คำสั่งทั้งหมด

━━━ ใช้บ่อย ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/brain-dev <คำถาม>          ถามอะไรก็ได้ — ค้น brain ก่อน ถ้าไม่ครบอ่านจาก code
                        ตัวอย่าง: /brain-dev checker ทำอะไรบ้าง
                        ตัวอย่าง: /brain-dev workflow ตั้งแต่รับงานถึงส่งประกัน

/brain-search-dev <คำ>      ค้นหาความรู้จาก brain ด้วย keyword/tags
                        ตัวอย่าง: /brain-search-dev JobAssignment
                        ตัวอย่าง: /brain-search-dev database connection

/brain-explain-dev <หัวข้อ>   อธิบายระบบ/feature แบบละเอียด (diagrams, tables, code)
                        ตัวอย่าง: /brain-explain-dev billing system
                        ตัวอย่าง: /brain-explain-dev checker workflow

/brain-explore-dev <หัวข้อ>   เดินตาม graph — ดู connections ทีละ node
                        ตัวอย่าง: /brain-explore-dev authentication
                        ตัวอย่าง: /brain-explore-dev --links UserService

━━━ จัดการความรู้ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/brain-save-dev [หัวข้อ]     บันทึกความรู้ใหม่ (จากบทสนทนา หรือระบุหัวข้อ)
                        ไม่มี argument = auto-detect จากบทสนทนาล่าสุด
                        ตัวอย่าง: /brain-save-dev architecture overview
                        ตัวอย่าง: /brain-save-dev database schema

/brain-scan-dev [folder]    สแกน codebase เก็บเข้า brain (10 phases)
                        ตัวอย่าง: /brain-scan-dev
                        ตัวอย่าง: /brain-scan-dev src/services
   Options:
   --full               สแกนทั้งหมด 10 phases (แนะนำครั้งแรก)
   --deps               สแกนเฉพาะ Phase 4 — trace call chains
   --auth               สแกนเฉพาะ Phase 5 — permission matrix
   --docs               สแกนเฉพาะ Phase 8 — เอกสาร .md, .docx, .txt
   --force              สแกนใหม่ทั้งหมด ทับของเดิม

/brain-update-dev <หัวข้อ>   อัพเดท note ที่มีอยู่ให้ตรงกับโค้ดปัจจุบัน
                        ตัวอย่าง: /brain-update-dev entity models
                        ตัวอย่าง: /brain-update-dev permission matrix

/brain-history-dev <หัวข้อ>   ดูประวัติเปลี่ยนแปลงของ note (changelogs)
                        ตัวอย่าง: /brain-history-dev Auth Flow
                        ตัวอย่าง: /brain-history-dev entity models

━━━ ระบบ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/brain-load-dev [project]   โหลดความรู้ก่อนเริ่มงาน (auto ตอน session start)
                        ไม่มี argument = ใช้ชื่อ folder ปัจจุบัน
                        ตัวอย่าง: /brain-load-dev my-project

/brain-status-dev           ตรวจ connection + สถิติจำนวนความรู้ + tags + projects

/brain-projects-dev [name]  ดู projects ทั้งหมด, tech stacks, เปรียบเทียบ
                        ตัวอย่าง: /brain-projects-dev
                        ตัวอย่าง: /brain-projects-dev --tech
                        ตัวอย่าง: /brain-projects-dev --compare

/brain-log-dev [filter]     ดูประวัติการใช้งาน brain ข้ามทุก session
                        ตัวอย่าง: /brain-log-dev today
                        ตัวอย่าง: /brain-log-dev --command scan
                        ตัวอย่าง: /brain-log-dev week --command save

/brain-howto-dev [command]  สอนวิธีใช้งานทีละขั้นตอน (ภาษาไทย)
                        ไม่มี argument = สอนทั้งหมด
                        ตัวอย่าง: /brain-howto-dev save
                        ตัวอย่าง: /brain-howto-dev scan

/brain-help-dev             แสดงคำสั่งทั้งหมด (คำสั่งนี้)
```

Also display the Brain First data flow:
```
📐 Graph Protocol (v3.0.0):
   Save    → ต้องมี projectName, tags ≥2, folderPath, wiki links
   Update  → สร้าง changelog อัตโนมัติ (Versioning Protocol)
   Search  → 4 ขั้น: text → tags → graph traversal → similar
   Links   → [[wiki links]] สร้าง relationships อัตโนมัติ

📊 Brain First Strategy:
   Brain (เร็ว) → Codebase (ถ้าไม่ครบ) → Save กลับ (ถ้ามีข้อมูลใหม่)

📌 แนะนำจุดเริ่มต้น:
   ใช้ครั้งแรก?        → /brain-scan-dev --full
   มี brain แล้ว?     → /brain-dev <คำถาม>
   code เปลี่ยน?      → /brain-scan-dev (auto incremental)
   ไม่แน่ใจ?          → /brain-howto-dev
```

Also display the brain-log usage reference:
```
📋 /brain-log-dev — ดูประวัติการใช้งาน brain ข้ามทุก session

ตัวกรองเวลา:
  /brain-log-dev                  20 entries ล่าสุด (default)
  /brain-log-dev today            เฉพาะวันนี้
  /brain-log-dev week             7 วันย้อนหลัง
  /brain-log-dev --last 5         5 entries ล่าสุด
  /brain-log-dev --all            ทั้งหมด

ตัวกรองคำสั่ง:
  /brain-log-dev --command scan   เฉพาะ brain-scan
  /brain-log-dev --command save   เฉพาะ brain-save
  /brain-log-dev --command update เฉพาะ brain-update
  /brain-log-dev --command history  เฉพาะ brain-history
  /brain-log-dev --command explore  เฉพาะ brain-explore
  /brain-log-dev --command projects เฉพาะ brain-projects
  /brain-log-dev --command load   เฉพาะ brain-load

ตัวกรอง session:
  /brain-log-dev --session <id>   เฉพาะ session ที่ระบุ

รวมกันได้:
  /brain-log-dev today --command scan   scan ของวันนี้
  /brain-log-dev week --command save    save ใน 7 วัน

📁 Log file: .brain/activity-log.json (สร้างอัตโนมัติ ไม่เข้า git)
```
