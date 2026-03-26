---
name: flow-discovery
version: 1.0.0
description: |
  วิเคราะห์ระบบ (brownfield + greenfield) เพื่อค้นหา workflow, scenario, edge case ที่ถูกมองข้าม
  ใช้ Multi-Agent Brainstorming (7 personas), Virtual User Simulation, Internet Research,
  Adversarial Review จาก BMAD Method

  รองรับ: สแกน codebase หา flow ที่ขาด, Deep Dive เจาะลึก module, Quick Think จากคำอธิบาย,
  คิด workflow จากไอเดีย (greenfield), สร้าง virtual user personas + journey simulation,
  ค้นหาปัญหาจริง/กฎหมาย/คู่แข่งจาก internet, export เอกสารสำหรับทีม

  USE THIS SKILL when the user mentions: flow analysis, workflow discovery, edge case hunting,
  gap analysis, adversarial review, scenario brainstorming, flow gaps, missing workflows,
  codebase analysis, system review, brownfield analysis, persona simulation, user journey,
  compliance check, competitive analysis, ideation, workflow design

  Thai triggers: "หา flow ที่ขาด", "คิด scenario", "edge case hunt", "วิเคราะห์ระบบ",
  "คิด workflow", "ออกแบบ flow", "หา gap", "adversarial review", "สร้าง persona",
  "จำลองผู้ใช้", "ค้นหาปัญหา", "วิเคราะห์คู่แข่ง", "คิดจากไอเดีย", "flow discovery"
---

# Flow Discovery Skill

AI-powered analysis skill ที่ค้นหา workflow, scenario, edge case ที่ถูกมองข้าม
พร้อม Multi-Agent Brainstorming, Virtual User Personas, Internet Research

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                     FLOW DISCOVERY PLUGIN                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Analysis Modes:                                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐ │
│  │ /flow-scan   │ │ /flow-dive   │ │ /flow-think  │ │/flow-ideate│ │
│  │ Full Scan    │ │ Deep Dive    │ │ Quick Think  │ │ Greenfield │ │
│  │ (brownfield) │ │ (module)     │ │ (no code)    │ │ (idea only)│ │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └─────┬──────┘ │
│         │                │                │                │        │
│         ▼                ▼                ▼                ▼        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              Multi-Agent Brainstorm Engine                    │   │
│  │  7 Subagents: End User, Power User, Hacker, SRE,            │   │
│  │              Business Analyst, QA Engineer, Researcher        │   │
│  │  + Adversarial Rules (BMAD) + Edge Case Checklist            │   │
│  └──────────────────────────┬───────────────────────────────────┘   │
│                             │                                       │
│  Enhancement Modules:       ▼                                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐               │
│  │/flow-persona │ │/flow-research│ │ /flow-export │               │
│  │ Virtual User │ │ Internet     │ │ เอกสารสำหรับ  │               │
│  │ + Journey    │ │ 3 Layers     │ │ ทีม (5 format)│               │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘               │
│         │                │                │                        │
│         ▼                ▼                ▼                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    flow-tracker.json                          │   │
│  │  • Findings list + severity + status                         │   │
│  │  • Research results                                          │   │
│  │  • Persona profiles                                          │   │
│  │  • Handoff tracking                                          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Outputs:                                                            │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐          │
│  │ flow-*-report  │ │ scenarios-*    │ │ flow-export-*  │          │
│  │   .md          │ │   .md          │ │   .md          │          │
│  └────────────────┘ └────────────────┘ └────────────────┘          │
│                                                                      │
│  Handoff (Manual):                                                   │
│  ├──→ qa-ui-test        : scenarios → /qa-create-scenario           │
│  ├──→ system-design-doc : findings  → /edit-section                 │
│  ├──→ ui-mockup         : UX issues → ปรับ mockup                  │
│  └──→ long-running      : features  → /add-feature                 │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

## Available Commands

| Command | คำอธิบาย | ใช้เมื่อ |
|---------|---------|---------|
| `/flow-discovery` | เลือก mode + แนะนำการใช้งาน | **เริ่มต้นใช้คำสั่งนี้** |
| `/flow-scan` | Full Scan ทั้ง project หา flow ที่ขาด | ระบบมีอยู่แล้ว ต้องการหา gap ทั้งหมด |
| `/flow-dive [feature]` | Deep Dive เจาะลึก module/feature | ต้องการวิเคราะห์เฉพาะจุด |
| `/flow-think [topic]` | Quick Think จากคำอธิบาย ไม่ต้องอ่าน code | ต้องการคิดเร็วๆ |
| `/flow-ideate [idea]` | คิด workflow จากไอเดีย (greenfield) | ยังไม่ได้พัฒนา มีแค่ไอเดีย |
| `/flow-persona [feature]` | สร้าง virtual user personas + journey | ต้องการมุมมองผู้ใช้จริง |
| `/flow-research [topic]` | ค้นหา internet (problems, compliance, competitive) | ต้องการข้อมูลจากภายนอก |
| `/flow-export [format]` | สร้างเอกสาร .md สำหรับแชร์ให้ทีม | ต้องการแชร์ผลวิเคราะห์ |
| `/flow-status` | ดูสถานะ/สรุป findings ทั้งหมด | เช็คภาพรวม |
| `/flow-help [command]` | อธิบายวิธีใช้งานแต่ละคำสั่ง | ต้องการคำแนะนำ |

## Multi-Agent Brainstorm Engine

7 Subagent Personas ที่ทำงานพร้อมกัน:

| # | Persona | มุมมองหลัก |
|---|---------|-----------|
| 1 | 👤 End User ทั่วไป | ใช้งานยากตรงไหน? สับสนตรงไหน? |
| 2 | 👨‍💼 Power User / Admin | จัดการ data เยอะๆ ได้ไหม? |
| 3 | 🏴‍☠️ Malicious Actor | injection? bypass auth? data leak? |
| 4 | 🔧 Site Reliability Engineer | scale ได้ไหม? monitor ได้ไหม? |
| 5 | 📊 Business Analyst | ครบทุก business rule ไหม? |
| 6 | 🧪 QA Engineer | test coverage? boundary values? |
| 7 | 🌐 Real-World Researcher | ระบบคล้ายกันเจอปัญหาอะไร? |

## Quick Reference

```bash
# Brownfield (ระบบมีอยู่แล้ว)
/flow-scan                           # สแกนทั้ง project
/flow-scan --module checkout         # สแกนเฉพาะ module
/flow-dive payment                   # เจาะลึก payment flow
/flow-persona checkout               # สร้าง personas สำหรับ checkout

# Greenfield (ยังไม่ได้พัฒนา)
/flow-ideate "ระบบจองห้องประชุม"       # คิด workflow จากไอเดีย
/flow-think "ระบบอนุมัติใบลา"          # คิดเร็วๆ จากคำอธิบาย

# Enhancement
/flow-research "e-commerce checkout"  # ค้นหาจาก internet
/flow-export summary                  # สร้างเอกสารสำหรับทีม
/flow-status                          # ดูสถานะ findings
/flow-help flow-scan                  # วิธีใช้คำสั่ง flow-scan
```

> Skill นี้ตอบเป็นภาษาไทย (ศัพท์เทคนิคใช้ภาษาอังกฤษ)
