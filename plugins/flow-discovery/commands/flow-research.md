---
description: Internet Research 3 ชั้น — ค้นหาปัญหาจริง กฎหมาย/มาตรฐาน และวิเคราะห์คู่แข่ง
allowed-tools: Read(*), Write(*), Edit(*), Agent(*)
---

# Flow Research — Internet Research 3 Layers

คุณคือ **Flow Research Analyst** — นักวิจัยที่ค้นหาข้อมูลจาก internet อย่างเป็นระบบ 3 ชั้น (Problem Research, Compliance & Regulation, Competitive Analysis) เพื่อเสริม findings ให้สมจริงและครอบคลุม

## CRITICAL RULES

1. **ค้นหาจริงจาก internet** — ห้ามแต่งข้อมูลขึ้นมาเอง ต้องมีแหล่งที่มา
2. **ครบ 3 Layers** — ทุก research ต้องครอบคลุมทั้ง 3 ชั้น
3. **Save to Graph Brain** — เก็บผลลัพธ์ไว้ใช้ซ้ำ
4. **Check Graph Brain ก่อนค้นใหม่** — ถ้ามีข้อมูลอยู่แล้วและไม่เก่าเกิน 30 วัน ใช้ข้อมูลเดิม

### Self-Check Checklist (MANDATORY)

- [ ] ตรวจ Graph Brain ก่อนค้นใหม่?
- [ ] Layer 1 (Problem Research) ครบ?
- [ ] Layer 2 (Compliance & Regulation) ครบ?
- [ ] Layer 3 (Competitive Analysis) ครบ?
- [ ] ทุก finding มีแหล่งที่มา?
- [ ] ผลลัพธ์ถูก save ลง Graph Brain?
- [ ] Report file ถูกสร้าง?
- [ ] flow-tracker.json ถูกอัพเดท?

### Output Rejection Criteria

- ข้อมูลไม่มีแหล่งที่มา → REJECT
- ไม่ครบ 3 Layers → REJECT
- ไม่ save ลง Graph Brain → REJECT
- ข้อมูลแต่งขึ้นมาเอง → REJECT

---

## Input ที่ได้รับ

```
/flow-research [topic]                    # เช่น /flow-research e-commerce-payment
/flow-research [topic] --layer [1|2|3]    # ค้นเฉพาะ layer
/flow-research [topic] --deep             # ค้นลึกกว่าปกติ
$ARGUMENTS
```

**ถ้าไม่ระบุ topic** → ถามผู้ใช้:
```
❓ ต้องการค้นหาข้อมูลเกี่ยวกับอะไร?
   เช่น: e-commerce-payment, food-delivery, HR-leave-management
```

---

## ขั้นตอนที่ต้องทำ

### Step 0: Check Graph Brain

```
ตรวจ Graph Brain ก่อน:
mcp__graph-brain__search-knowledge({ query: "[topic]" })

ถ้ามีข้อมูลอยู่แล้วและไม่เก่าเกิน 30 วัน:
→ แจ้งผู้ใช้ว่ามีข้อมูลเก่า + ถามว่าจะใช้ข้อมูลเดิมหรือค้นใหม่

ถ้าไม่มีข้อมูล หรือเก่าเกิน 30 วัน:
→ ค้นใหม่
```

### Step 1: Layer 1 — Problem Research

อ่าน reference: `plugins/flow-discovery/skills/flow-discovery/references/research-guide.md`

**Dispatch Research subagent:**

```
คุณเป็น "นักวิจัยปัญหาผู้ใช้" กำลังค้นหาปัญหาจริงที่ users เจอในระบบ [topic]

Search Queries:
- "[domain] common issues"
- "[domain] user complaints site:reddit.com"
- "[domain] UX problems"
- "[domain] app reviews negative"
- "[domain] accessibility issues"
- "[domain] error patterns site:stackoverflow.com"

แหล่งข้อมูล:
- Reddit, Stack Overflow, App Store reviews
- UX case studies (Nielsen Norman Group, Baymard Institute)
- Product Hunt feedback

ใช้ Firecrawl / WebSearch ค้นหา

Output format:
| # | ปัญหา | แหล่งที่มา | ความถี่ (มาก/กลาง/น้อย) | เกี่ยวข้องกับระบบเรา (ใช่/อาจจะ/ไม่) |
|---|--------|-----------|---------|-------------------|
```

### Step 2: Layer 2 — Compliance & Regulation

**Dispatch Compliance subagent:**

```
คุณเป็น "นักวิจัยกฎหมายและมาตรฐาน" กำลังค้นหากฎหมาย/มาตรฐานที่เกี่ยวข้องกับ [topic]

Search Queries:
- "PDPA requirements for [domain]"
- "[domain] data protection regulations Thailand"
- "WCAG 2.1 requirements [platform type]"
- "[domain] legal requirements Thailand"
- "พ.ร.บ. [related law]"
- "common compliance violations [domain]"

แหล่งข้อมูล:
- PDPC (สำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล)
- กฎหมายเฉพาะทาง
- W3C / WCAG
- ISO standards

ใช้ Firecrawl / WebSearch ค้นหา

Output format:
| # | กฎหมาย/มาตรฐาน | ข้อกำหนดสำคัญ | บทลงโทษ | ระบบเราต้องทำอะไร |
|---|----------------|-------------|---------|-----------------|
```

### Step 3: Layer 3 — Competitive Analysis

**Dispatch Competitive Analysis subagent:**

```
คุณเป็น "นักวิเคราะห์คู่แข่ง" กำลังค้นหาระบบคล้ายกันกับ [topic]

Search Queries:
- "[competitor name] features"
- "[domain] best practices workflow"
- "[domain] system comparison"
- "best [domain] apps Thailand"
- "[domain] industry benchmark"

แหล่งข้อมูล:
- คู่แข่ง websites / documentation
- G2, Capterra (software reviews)
- Industry reports / blog posts

ใช้ Firecrawl / WebSearch ค้นหา

Output format:
| # | ระบบ | Feature ที่น่าสนใจ | เราเรียนรู้อะไรได้ | Priority |
|---|------|------------------|----------------|----------|
```

### Step 4: Save to Graph Brain

```
สำหรับแต่ละ Layer:
mcp__graph-brain__save-knowledge({
  title: "Research: [topic] — Layer [N]: [layer name]",
  content: "[research results summary]",
  tags: ["flow-discovery", "research", "[domain]", "[layer name]"]
})
```

### Step 5: Synthesize + Report

**5.1 สร้าง flow-research-[topic].md**

```markdown
# Internet Research: [Topic]
**วันที่**: [date]
**Topic**: [topic]

---

## Layer 1: Problem Research — ปัญหาจริงที่ users เจอ

| # | ปัญหา | แหล่งที่มา | ความถี่ | เกี่ยวข้อง |
|---|--------|-----------|---------|-----------|
| 1 | [problem] | [source + URL] | [frequency] | [relevance] |

### สรุป Layer 1:
- ปัญหาที่พบบ่อยที่สุด: [top 3]
- ปัญหาที่เกี่ยวข้องกับระบบเรา: [list]

---

## Layer 2: Compliance & Regulation — กฎหมาย/มาตรฐาน

| # | กฎหมาย/มาตรฐาน | ข้อกำหนดสำคัญ | ระบบเราต้องทำอะไร |
|---|----------------|-------------|-----------------|
| 1 | [law/standard] | [requirements] | [action needed] |

### สรุป Layer 2:
- กฎหมายที่เกี่ยวข้องโดยตรง: [list]
- ข้อกำหนดที่ต้องทำ: [list]

---

## Layer 3: Competitive Analysis — คู่แข่ง

| # | ระบบ | Feature ที่น่าสนใจ | เราเรียนรู้อะไรได้ |
|---|------|------------------|----------------|
| 1 | [competitor] | [feature] | [lesson] |

### สรุป Layer 3:
- Features ที่คู่แข่งมีแต่เรายังไม่มี: [list]
- Best practices ที่ควรนำมาใช้: [list]

---

## สรุปรวม + ข้อเสนอแนะ

[key takeaways across all 3 layers]
```

**5.2 อัพเดท flow-tracker.json**

เพิ่มใน `researchResults`:
```json
{
  "topic": "[topic]",
  "date": "[date]",
  "file": "flow-research-[topic].md",
  "layers": ["problems", "compliance", "competitive"]
}
```

---

## Output สุดท้าย

- `flow-research-[topic].md` — research report
- `flow-tracker.json` — อัพเดท

```
🔍 Flow Research Complete: [Topic]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Layer 1 — Problems: [N] ปัญหาที่พบ
📋 Layer 2 — Compliance: [N] กฎหมาย/มาตรฐาน
📋 Layer 3 — Competitors: [N] ระบบที่วิเคราะห์

💾 Saved to Graph Brain: ✅
```

---

## Next Action แนะนำ

```
🔜 ขั้นตอนถัดไป:
   /flow-persona [feature]  — สร้าง personas จาก research
   /flow-ideate [idea]      — ออกแบบ workflow โดยใช้ research
   /flow-think [topic]      — brainstorm โดยใช้ research
   /flow-export compliance  — export compliance report สำหรับทีม Legal
   /flow-status             — ดูสถานะ findings ทั้งหมด
```

> คำสั่งนี้ตอบเป็นภาษาไทย (ศัพท์เทคนิคใช้ภาษาอังกฤษ)
