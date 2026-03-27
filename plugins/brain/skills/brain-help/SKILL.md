---
name: brain-help
description: "Show all available brain commands with descriptions"
user_invocable: true
---

# Brain Help — Command Reference

ALL responses MUST be in Thai language.

Display this command reference to the user:

```
🧠 Brain Commands — คำสั่งทั้งหมด

━━━ ใช้บ่อย ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/brain <คำถาม>          ถามอะไรก็ได้ — ค้น brain ก่อน ถ้าไม่ครบอ่านจาก code
                        ตัวอย่าง: /brain checker ทำอะไรบ้าง
                        ตัวอย่าง: /brain workflow ตั้งแต่รับงานถึงส่งประกัน

/brain-search <คำ>      ค้นหาความรู้จาก brain ด้วย keyword/tags
                        ตัวอย่าง: /brain-search JobAssignment
                        ตัวอย่าง: /brain-search database connection

/brain-explain <หัวข้อ>   อธิบายระบบ/feature แบบละเอียด (diagrams, tables, code)
                        ตัวอย่าง: /brain-explain billing system
                        ตัวอย่าง: /brain-explain checker workflow

━━━ จัดการความรู้ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/brain-save [หัวข้อ]     บันทึกความรู้ใหม่ (จากบทสนทนา หรือระบุหัวข้อ)
                        ไม่มี argument = auto-detect จากบทสนทนาล่าสุด
                        ตัวอย่าง: /brain-save architecture overview
                        ตัวอย่าง: /brain-save database schema

/brain-scan [folder]    สแกน codebase เก็บเข้า brain (10 phases)
                        ตัวอย่าง: /brain-scan
                        ตัวอย่าง: /brain-scan src/services
   Options:
   --full               สแกนทั้งหมด 10 phases (แนะนำครั้งแรก)
   --deps               สแกนเฉพาะ Phase 4 — trace call chains
   --auth               สแกนเฉพาะ Phase 5 — permission matrix
   --docs               สแกนเฉพาะ Phase 8 — เอกสาร .md, .docx, .txt
   --force              สแกนใหม่ทั้งหมด ทับของเดิม

/brain-update <หัวข้อ>   อัพเดท note ที่มีอยู่ให้ตรงกับโค้ดปัจจุบัน
                        ตัวอย่าง: /brain-update entity models
                        ตัวอย่าง: /brain-update permission matrix

━━━ ระบบ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/brain-load [project]   โหลดความรู้ก่อนเริ่มงาน (auto ตอน session start)
                        ไม่มี argument = ใช้ชื่อ folder ปัจจุบัน
                        ตัวอย่าง: /brain-load my-project

/brain-status           ตรวจ connection + สถิติจำนวนความรู้ + tags

/brain-log [filter]     ดูประวัติการใช้งาน brain ข้ามทุก session
                        ตัวอย่าง: /brain-log today
                        ตัวอย่าง: /brain-log --command scan
                        ตัวอย่าง: /brain-log week --command save

/brain-howto [command]  สอนวิธีใช้งานทีละขั้นตอน (ภาษาไทย)
                        ไม่มี argument = สอนทั้งหมด
                        ตัวอย่าง: /brain-howto save
                        ตัวอย่าง: /brain-howto scan

/brain-help             แสดงคำสั่งทั้งหมด (คำสั่งนี้)
```

Also display the Brain First data flow:
```
📊 Brain First Strategy:
   Brain (เร็ว) → Codebase (ถ้าไม่ครบ) → Save กลับ (ถ้ามีข้อมูลใหม่)

📌 แนะนำจุดเริ่มต้น:
   ใช้ครั้งแรก?        → /brain-scan --full
   มี brain แล้ว?     → /brain <คำถาม>
   code เปลี่ยน?      → /brain-scan (auto incremental)
   ไม่แน่ใจ?          → /brain-howto
```

Also display the brain-log usage reference:
```
📋 /brain-log — ดูประวัติการใช้งาน brain ข้ามทุก session

ตัวกรองเวลา:
  /brain-log                  20 entries ล่าสุด (default)
  /brain-log today            เฉพาะวันนี้
  /brain-log week             7 วันย้อนหลัง
  /brain-log --last 5         5 entries ล่าสุด
  /brain-log --all            ทั้งหมด

ตัวกรองคำสั่ง:
  /brain-log --command scan   เฉพาะ brain-scan
  /brain-log --command save   เฉพาะ brain-save
  /brain-log --command update เฉพาะ brain-update
  /brain-log --command load   เฉพาะ brain-load

ตัวกรอง session:
  /brain-log --session <id>   เฉพาะ session ที่ระบุ

รวมกันได้:
  /brain-log today --command scan   scan ของวันนี้
  /brain-log week --command save    save ใน 7 วัน

📁 Log file: .brain/activity-log.json (สร้างอัตโนมัติ ไม่เข้า git)
```
