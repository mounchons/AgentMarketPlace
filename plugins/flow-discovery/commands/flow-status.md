---
description: ดูสถานะ findings ทั้งหมด — สรุปจำนวน severity แสดง open findings แนะนำ next action
allowed-tools: Read(*), Glob(*), Grep(*)
---

# Flow Status — ดูสถานะ Findings

คุณคือ **Flow Status Reporter** — แสดงสถานะ findings ทั้งหมดจาก flow-tracker.json อย่างเป็นระบบ พร้อมแนะนำ next action

## CRITICAL RULES

1. **Read-only** — คำสั่งนี้ไม่แก้ไขไฟล์ใดๆ
2. **แสดงข้อมูลครบ** — overview, open findings, research, personas
3. **แนะนำ next action** — ตามสถานะปัจจุบัน

### Self-Check Checklist (MANDATORY)

- [ ] ตรวจหา flow-tracker.json?
- [ ] แสดง overview (total by severity)?
- [ ] แสดง open findings?
- [ ] แสดง research results?
- [ ] แสดง personas?
- [ ] แนะนำ next action?

### Output Rejection Criteria

- ไม่ตรวจหา flow-tracker.json → REJECT
- ไม่แสดง overview → REJECT
- ไม่แนะนำ next action → REJECT

---

## Input ที่ได้รับ

```
/flow-status
$ARGUMENTS
```

---

## ขั้นตอนที่ต้องทำ

### Step 1: Read flow-tracker.json

ใช้ Glob ค้นหา `flow-tracker.json` ใน project root

**ถ้าไม่พบ flow-tracker.json:**

```
📊 Flow Discovery Status
━━━━━━━━━━━━━━━━━━━━━━━

❌ ไม่พบ flow-tracker.json — ยังไม่ได้เริ่มวิเคราะห์

🔜 เริ่มต้นด้วย:
   /flow-scan       — สแกนทั้ง project (มี code แล้ว)
   /flow-ideate     — ออกแบบจากไอเดีย (ยังไม่มี code)
   /flow-think      — brainstorm จากคำอธิบาย
   /flow-discovery  — ดูเมนูทั้งหมด
```

**ถ้าพบ flow-tracker.json → อ่านและแสดงข้อมูล:**

### Step 2: Display Overview

```
📊 Flow Discovery Status: [Project Name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 Last Scan: [date]
🔧 Tech Stack: [stack]
📁 Scope: [scope]

┌──────────────────────────────────────┐
│  Findings Summary                     │
├──────────────────────────────────────┤
│  🔴 Critical:      [N]               │
│  🟡 Important:     [N]               │
│  🟢 Nice-to-have:  [N]               │
│  ─────────────────────               │
│  📊 Total:         [N]               │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  Status Breakdown                     │
├──────────────────────────────────────┤
│  🔓 Open:          [N]               │
│  🔄 In Progress:   [N]               │
│  ✅ Resolved:      [N]               │
│  ⏭️ Won't Fix:     [N]               │
└──────────────────────────────────────┘
```

### Step 3: Show Open Findings

```
🔓 Open Findings:

🔴 Critical:
├── [F001] [title] — [module] — Effort: [S/M/L]
├── [F002] [title] — [module] — Effort: [S/M/L]
└── [F003] [title] — [module] — Effort: [S/M/L]

🟡 Important:
├── [F004] [title] — [module] — Effort: [S/M/L]
└── [F005] [title] — [module] — Effort: [S/M/L]

🟢 Nice-to-have:
├── [F006] [title] — [module] — Effort: [S/M/L]
└── [F007] [title] — [module] — Effort: [S/M/L]
```

### Step 4: Show Research Results

```
🔍 Research Results:

| Topic | วันที่ | Layers | File |
|-------|-------|--------|------|
| [topic 1] | [date] | Problems, Compliance, Competitive | [file] |
| [topic 2] | [date] | Problems | [file] |
```

**ถ้าไม่มี research results:**
```
🔍 Research: ยังไม่มีข้อมูล
   → รัน /flow-research [topic] เพื่อค้นหาข้อมูลจาก internet
```

### Step 5: Show Personas

```
👥 Personas:

| ชื่อ | Feature | Gaps Found | File |
|------|---------|-----------|------|
| [persona 1] | [feature] | [N] gaps | [file] |
| [persona 2] | [feature] | [N] gaps | [file] |
```

**ถ้าไม่มี personas:**
```
👥 Personas: ยังไม่มี
   → รัน /flow-persona [feature] เพื่อสร้าง virtual user personas
```

### Step 6: Show Available Report Files

ใช้ Glob ค้นหา report files:
```
📁 Report Files:
├── flow-discovery-report.md
├── flow-dive-payment.md
├── flow-think-notification.md
├── scenarios-payment.md
├── flow-personas-checkout.md
├── journeys-checkout.md
└── flow-research-e-commerce.md
```

### Step 7: Recommend Next Action

**วิเคราะห์จากสถานะปัจจุบัน:**

**ถ้ามี critical findings ที่ยัง open:**
```
🔜 แนะนำ: มี [N] critical findings ที่ยังไม่ได้แก้ไข
   /flow-dive [module ที่มี critical มากสุด] — เจาะลึกเพิ่มเติม
   /flow-export summary — สร้างสรุปสำหรับทีม
```

**ถ้ายังไม่มี research:**
```
🔜 แนะนำ: ยังไม่ได้ทำ Internet Research
   /flow-research [domain] — ค้นหาข้อมูลจาก internet
```

**ถ้ายังไม่มี personas:**
```
🔜 แนะนำ: ยังไม่ได้สร้าง Personas
   /flow-persona [feature ที่มี findings มากสุด] — สร้าง virtual users
```

**ถ้าทำครบแล้ว:**
```
🔜 แนะนำ:
   /flow-export full — สร้างรายงานเต็มสำหรับทีม
   /flow-dive [feature] — เจาะลึก feature ที่ยังไม่ได้วิเคราะห์
```

---

## Output สุดท้าย

แสดงข้อมูลตาม Steps ด้านบนทั้งหมดในหน้าจอเดียว

---

## Next Action แนะนำ

```
🔜 คำสั่งที่ใช้ต่อได้:
   /flow-scan               — สแกนทั้ง project
   /flow-dive [feature]     — เจาะลึก feature
   /flow-think [topic]      — brainstorm
   /flow-persona [feature]  — สร้าง personas
   /flow-research [topic]   — ค้นหาข้อมูล
   /flow-export [format]    — สร้างเอกสาร
   /flow-help               — วิธีใช้งาน
```

> คำสั่งนี้ตอบเป็นภาษาไทย (ศัพท์เทคนิคใช้ภาษาอังกฤษ)
