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

━━━ ใช้บ่อย ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/brain <คำถาม>        ถามอะไรก็ได้ — ค้น brain ก่อน ถ้าไม่ครบอ่านจาก code
/brain-search <คำ>    ค้นหาความรู้จาก brain ด้วย keyword
/brain-explain <หัวข้อ> อธิบายระบบ/feature แบบละเอียด

━━━ จัดการความรู้ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/brain-save [หัวข้อ]   บันทึกความรู้ใหม่ (จากบทสนทนา หรือระบุหัวข้อ)
/brain-scan [folder]  สแกน codebase เก็บเข้า brain (ทั้งหมด หรือเฉพาะ folder)
/brain-update <หัวข้อ>  อัพเดท note ที่มีอยู่ให้ตรงกับโค้ดปัจจุบัน

━━━ ระบบ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/brain-load [project]  โหลดความรู้ก่อนเริ่มงาน (auto ตอน session start)
/brain-status          ตรวจ connection + สถิติจำนวนความรู้
/brain-howto           สอนวิธีใช้งานทีละขั้นตอน (ภาษาไทย)
```

Also display the Brain First data flow:
```
📊 Brain First Strategy:
   Brain (เร็ว) → Codebase (ถ้าไม่ครบ) → Save กลับ (ถ้ามีข้อมูลใหม่)
```
