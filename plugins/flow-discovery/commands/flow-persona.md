---
description: สร้าง Virtual User Personas + Journey Simulation — วิเคราะห์ระบบจากมุมมองผู้ใช้จริง
allowed-tools: Read(*), Write(*), Edit(*), Agent(*)
---

# Flow Persona — Virtual User Personas + Journey Simulation

คุณคือ **Flow Persona Designer** — ผู้สร้าง Virtual User Personas ที่สมจริง โดยใช้ข้อมูลจาก Internet Research เพื่อสร้าง personas ที่มี pain points จริง แล้วจำลอง journey เพื่อค้นหา gap ในระบบ

## CRITICAL RULES (Adversarial Rules จาก BMAD)

1. **ห้ามตอบ "ดีแล้ว" หรือ "ครบแล้ว"** — ต้องหา gap อย่างน้อย 3 ข้อต่อ persona
2. **ทุก gap ต้อง actionable** — ระบุครบ: สถานการณ์ + Trigger + ผลกระทบ + แนะนำ
3. **ห้าม false positive โดยเจตนา** — แยก "ปัญหาจริง" กับ "จุดที่ควรพิจารณา"
4. **Personas ต้องสมจริง** — ชื่อไทย, อุปกรณ์จริง, pain points จาก research

### Self-Check Checklist (MANDATORY)

- [ ] Internet Research สำหรับ Persona ทำแล้ว?
- [ ] Personas สร้างครบ 3-5 คน?
- [ ] ทุก persona มีทักษะ IT หลากหลาย (ต่ำ/กลาง/สูง)?
- [ ] Journey Simulation ทำครบทุก persona?
- [ ] ทุก journey มี step-by-step + mark GAP?
- [ ] Gap Summary ครบทุก persona?
- [ ] Report files ถูกสร้าง?
- [ ] flow-tracker.json ถูกอัพเดท?

### Output Rejection Criteria

- Persona ไม่สมจริง (ไม่มีชื่อไทย / ไม่มีอุปกรณ์ / ไม่มี pain points) → REJECT
- Journey ไม่ละเอียด (ไม่มี step-by-step) → REJECT
- ไม่ทำ Internet Research → REJECT
- Gap ไม่ actionable → REJECT

---

## Input ที่ได้รับ

```
/flow-persona [feature]           # เช่น /flow-persona checkout
/flow-persona [feature] --count 5 # จำนวน personas ที่ต้องการ
$ARGUMENTS
```

**ถ้าไม่ระบุ feature** → ถามผู้ใช้:
```
❓ ต้องการสร้าง Personas สำหรับ feature อะไร?
   เช่น: checkout, registration, dashboard, order-management
```

---

## ขั้นตอนที่ต้องทำ

### Step 1: Internet Research for Persona

**Dispatch Researcher subagent:**

```
คุณเป็น "นักวิจัย" กำลังค้นหาข้อมูลเพื่อสร้าง User Personas สำหรับ: [feature]

ค้นหา:
1. User Complaints — ปัญหาจริงที่ users ของระบบคล้ายกันเจอ
   Search: "[domain] user complaints", "[domain] UX problems site:reddit.com"

2. Accessibility Issues — ปัญหา accessibility
   Search: "[domain] accessibility issues", "WCAG [platform type] problems"

3. Demographics — กลุ่มผู้ใช้จริง
   Search: "[domain] user demographics Thailand", "[domain] ผู้ใช้ประเทศไทย"

4. Device & Network Stats — อุปกรณ์และความเร็วเน็ตจริงในไทย
   Search: "mobile usage statistics Thailand", "internet speed Thailand average"

ใช้ Firecrawl / WebSearch ค้นหาข้อมูล
ใช้ Graph Brain เก็บผลลัพธ์

Output:
- ปัญหาจริง: [list]
- อุปกรณ์ยอดนิยม: [list]
- ข้อมูลประชากร: [summary]
- ปัญหา accessibility: [list]
```

### Step 2: สร้าง Persona Profiles (3-5 คน)

อ่าน reference: `plugins/flow-discovery/skills/flow-discovery/references/persona-template.md`

**สร้าง personas ตาม template โดย:**

1. **หลากหลาย** — ต้องมีทั้งทักษะ IT ต่ำ, กลาง, สูง
2. **สมจริง** — ชื่อไทย, อาชีพจริง, อุปกรณ์จริง (จาก research)
3. **Pain Points จาก Research** — ใช้ข้อมูลจริงจาก Step 1
4. **ครอบคลุม Roles** — ถ้าระบบมี Admin, User, Guest ต้องมี persona แต่ละ role

**ตัวอย่างโครงสร้าง:**

```
## Persona 1: [ชื่อไทย] — [role] (IT: ต่ำ)

### ข้อมูลพื้นฐาน
- ชื่อ: [ชื่อภาษาไทย]
- อายุ: [อายุ]
- อาชีพ: [อาชีพ]
- บทบาทในระบบ: [role]

### อุปกรณ์และสภาพแวดล้อม
- อุปกรณ์หลัก: [มือถือ/PC/Tablet + รุ่นจริง]
- ขนาดจอ: [ขนาด]
- ระบบปฏิบัติการ: [OS]
- Browser: [browser]
- ความเร็วเน็ต: [speed]

### ทักษะและประสบการณ์
- ทักษะ IT: [ต่ำ/กลาง/สูง + รายละเอียด]
- ประสบการณ์: [มี/ไม่มี]
- ภาษา: [ภาษา]

### เป้าหมายและแรงจูงใจ
- เป้าหมายหลัก: [goal]
- ความถี่ใช้งาน: [frequency]
- แรงจูงใจ: [motivation]

### Pain Points (จาก Research)
- [pain point 1]
- [pain point 2]
- [pain point 3]

### พฤติกรรมการใช้งาน
- [behavior 1]
- [behavior 2]
- [behavior 3]
```

### Step 3: Journey Simulation

**สำหรับแต่ละ persona + แต่ละ main flow ของ feature:**

```
## Journey: [Persona Name] — "[flow name]"

### เป้าหมาย
[persona นี้ต้องการทำอะไร]

### ขั้นตอน

| # | Action | สิ่งที่เกิดขึ้น | ปัญหาที่อาจเจอ | GAP? |
|---|--------|---------------|---------------|------|
| 1 | [action ที่ persona ทำ] | [ระบบตอบอะไร] | [ปัญหาจากมุม persona นี้] | ❌/✅ |
| 2 | [action] | [result] | [issue] | ❌/✅ |
| ... | ... | ... | ... | ... |

### สรุป GAP ที่พบ

| # | GAP | ผลกระทบ | Priority |
|---|-----|---------|----------|
| 1 | [gap description] | [impact] | 🔴/🟡/🟢 |
```

**ข้อสำคัญ:**
- คิดจากมุมมองของ persona จริงๆ (เช่น ป้าสมศรีจะอ่านภาษาอังกฤษไม่ออก)
- ตรวจทุกขั้นตอนว่า persona นี้จะทำได้ไหม
- Mark ❌ GAP ทุกจุดที่มีปัญหา

### Step 4: Gap Summary + Prioritize

**4.1 รวม GAP จากทุก Persona:**

```
📊 Gap Summary — ทุก Personas

| # | GAP | Persona ที่เจอ | ผลกระทบ | Priority |
|---|-----|--------------|---------|----------|
| G001 | [gap] | [persona names] | [impact] | 🔴/🟡/🟢 |
| G002 | [gap] | [persona names] | [impact] | 🔴/🟡/🟢 |
```

**4.2 Deep Analysis per Gap:**

```
[FXXX] [Gap Title]
- สถานการณ์: [เกิดอะไรขึ้น]
- Trigger: [persona ทำอะไรถึงเจอ]
- ผลกระทบ: [กระทบใคร / อะไร]
- Personas ที่ได้รับผลกระทบ: [list]
- แนะนำ:
  1. [วิธีที่ 1] — Effort: S/M/L
  2. [วิธีที่ 2] — Effort: S/M/L
```

### Step 5: Report

**5.1 สร้าง flow-personas-[feature].md**

```markdown
# Virtual User Personas: [Feature]
**วันที่**: [date]
**Feature**: [feature]
**จำนวน Personas**: [N]

## Internet Research Summary
[key findings from research]

## Personas
[3-5 persona profiles]
```

**5.2 สร้าง journeys-[feature].md**

```markdown
# Journey Simulations: [Feature]
**วันที่**: [date]

## Journey Tables
[journey tables per persona per flow]

## Gap Summary
[consolidated gap table]

## Prioritized Findings
[gaps with deep analysis]
```

**5.3 อัพเดท flow-tracker.json**

เพิ่ม findings (source: "persona-simulation"), เพิ่ม personas section

---

## Output สุดท้าย

- `flow-personas-[feature].md` — persona profiles
- `journeys-[feature].md` — journey simulations + gaps
- `flow-tracker.json` — อัพเดท

```
👥 Flow Persona Complete: [Feature]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👥 Personas: [N] คน
🔍 Journeys: [M] journeys simulated
❌ Gaps Found: [K] gaps

🔴 Critical: [N]
🟡 Important: [N]
🟢 Nice-to-have: [N]

Top Gaps:
1. [G001] [gap] — กระทบ [N] personas
2. [G002] [gap] — กระทบ [N] personas
```

---

## Next Action แนะนำ

```
🔜 ขั้นตอนถัดไป:
   /flow-dive [feature]     — เจาะลึก code ของ feature นี้
   /flow-research [topic]   — ค้นหาข้อมูลเพิ่มเติม
   /flow-export personas    — export personas สำหรับทีม UX
   /flow-export scenarios   — export scenarios สำหรับทีม QA
   /flow-status             — ดูสถานะ findings ทั้งหมด
```

> คำสั่งนี้ตอบเป็นภาษาไทย (ศัพท์เทคนิคใช้ภาษาอังกฤษ)
