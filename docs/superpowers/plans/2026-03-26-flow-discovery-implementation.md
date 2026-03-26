# Flow Discovery Plugin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** สร้าง flow-discovery plugin ที่วิเคราะห์ระบบ (ทั้ง brownfield และ greenfield) เพื่อค้นหา workflow, scenario, edge case ที่ถูกมองข้าม พร้อม virtual user personas, internet research, และ multi-agent brainstorming

**Architecture:** Plugin ใหม่ใน AgentMarketPlace ตาม pattern เดียวกับ qa-ui-test — มี SKILL.md (skill definition), commands/ (10 command files), references/ (edge-case-checklist, research-guide, persona-template), templates/ (flow-tracker.json, report template) และลงทะเบียนใน marketplace.json

**Tech Stack:** Claude Code Plugin System, Markdown commands, JSON tracking, Firecrawl (internet research), Graph Brain MCP (knowledge store), Agent tool (multi-agent brainstorm)

**Spec:** `docs/superpowers/specs/2026-03-26-flow-discovery-plugin-design.md`

---

## File Structure

```
plugins/flow-discovery/
├── .claude-plugin/
│   └── plugin.json                          # Plugin manifest
├── commands/
│   ├── flow-discovery.md                    # เลือก mode + แนะนำ
│   ├── flow-scan.md                         # Full Scan ทั้ง project
│   ├── flow-dive.md                         # Deep Dive เจาะลึก module
│   ├── flow-think.md                        # Quick Think จากคำอธิบาย
│   ├── flow-ideate.md                       # คิด workflow จากไอเดีย
│   ├── flow-persona.md                      # Virtual User Personas + Journey
│   ├── flow-research.md                     # Internet Research
│   ├── flow-export.md                       # สร้างเอกสารสำหรับทีม
│   ├── flow-status.md                       # ดูสถานะ findings
│   └── flow-help.md                         # อธิบายวิธีใช้งาน
├── skills/
│   └── flow-discovery/
│       ├── SKILL.md                         # Skill definition + architecture
│       ├── references/
│       │   ├── edge-case-checklist.md       # Edge Case Checklist มาตรฐาน
│       │   ├── adversarial-rules.md         # Adversarial Review Rules
│       │   ├── tech-stack-patterns.md       # Auto-detect patterns per framework
│       │   ├── persona-template.md          # Persona profile + journey template
│       │   └── research-guide.md            # Internet research guide (3 layers)
│       └── templates/
│           ├── flow-tracker.json            # Tracking file schema
│           └── report-template.md           # Report output template
└── README.md                                # Plugin documentation
```

---

## Task 1: สร้าง Plugin Scaffold + plugin.json

**Files:**
- Create: `plugins/flow-discovery/.claude-plugin/plugin.json`
- Create: `plugins/flow-discovery/README.md`

- [ ] **Step 1: สร้าง directory structure**

```bash
mkdir -p plugins/flow-discovery/.claude-plugin
mkdir -p plugins/flow-discovery/commands
mkdir -p plugins/flow-discovery/skills/flow-discovery/references
mkdir -p plugins/flow-discovery/skills/flow-discovery/templates
```

- [ ] **Step 2: สร้าง plugin.json**

```json
{
  "name": "flow-discovery",
  "version": "1.0.0",
  "description": "วิเคราะห์ระบบ (brownfield + greenfield) เพื่อค้นหา workflow, scenario, edge case ที่ถูกมองข้าม — ใช้ Multi-Agent Brainstorming (7 personas), Virtual User Simulation, Internet Research (problems, compliance, competitive), Adversarial Review จาก BMAD Method รองรับ auto-detect tech stack และ manual handoff ไปยัง qa-ui-test, system-design-doc, ui-mockup, long-running",
  "author": {
    "name": "Mounchons"
  }
}
```

- [ ] **Step 3: สร้าง README.md**

```markdown
# Flow Discovery Plugin

วิเคราะห์ระบบเพื่อค้นหา workflow, scenario, edge case ที่ถูกมองข้าม

## จุดยืน

**"คิด"** — เป็นตัวเชื่อมระหว่าง code/idea กับ scenarios/gaps ที่ยังไม่ถูกค้นพบ

## Commands

| Command | หน้าที่ | ต้องมี code? |
|---------|---------|:-----------:|
| `/flow-discovery` | เลือก mode + แนะนำการใช้งาน | - |
| `/flow-scan` | Full Scan ทั้ง project | ✅ |
| `/flow-dive [feature]` | Deep Dive เจาะลึก module | ✅ |
| `/flow-think [topic]` | Quick Think จากคำอธิบาย | ❌ |
| `/flow-ideate [idea]` | คิด workflow จากไอเดีย | ❌ |
| `/flow-persona [feature]` | สร้าง personas + journey | ❌ |
| `/flow-research [topic]` | ค้นหา internet | ❌ |
| `/flow-export [format]` | สร้างเอกสารสำหรับทีม | ❌ |
| `/flow-status` | ดูสถานะ findings | ❌ |
| `/flow-help` | อธิบายวิธีใช้งาน | ❌ |

## Integration

```
flow-discovery (คิด)
├──→ qa-ui-test        : scenarios → /qa-create-scenario
├──→ system-design-doc : findings  → /edit-section, /brainstorm-design
├──→ ui-mockup         : UX issues → ปรับ mockup
└──→ long-running      : features  → /add-feature
```

## วิธีใช้งาน

```bash
# ระบบที่มีอยู่แล้ว — สแกนหา gaps
/flow-scan

# ระบบที่มีอยู่แล้ว — เจาะลึกเฉพาะ feature
/flow-dive checkout

# ยังไม่ได้พัฒนา — คิด workflow จากไอเดีย
/flow-ideate "ระบบจองห้องประชุมออนไลน์"

# คิดเร็วๆ จากคำอธิบาย
/flow-think "ระบบอนุมัติใบลา"
```
```

- [ ] **Step 4: Commit**

```bash
git add plugins/flow-discovery/
git commit -m "feat(flow-discovery): scaffold plugin structure with plugin.json and README"
```

---

## Task 2: สร้าง SKILL.md — Skill Definition

**Files:**
- Create: `plugins/flow-discovery/skills/flow-discovery/SKILL.md`

- [ ] **Step 1: สร้าง SKILL.md ตาม pattern ของ qa-ui-test**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add plugins/flow-discovery/skills/flow-discovery/SKILL.md
git commit -m "feat(flow-discovery): add SKILL.md with architecture and command reference"
```

---

## Task 3: สร้าง Reference Files

**Files:**
- Create: `plugins/flow-discovery/skills/flow-discovery/references/edge-case-checklist.md`
- Create: `plugins/flow-discovery/skills/flow-discovery/references/adversarial-rules.md`
- Create: `plugins/flow-discovery/skills/flow-discovery/references/tech-stack-patterns.md`
- Create: `plugins/flow-discovery/skills/flow-discovery/references/persona-template.md`
- Create: `plugins/flow-discovery/skills/flow-discovery/references/research-guide.md`

- [ ] **Step 1: สร้าง edge-case-checklist.md**

เนื้อหาจาก spec Section 6 — Edge Case Checklist ทั้ง 5 หมวด (Data, State, Concurrency, Business Logic, Integration) พร้อม checkbox format

- [ ] **Step 2: สร้าง adversarial-rules.md**

เนื้อหาจาก spec Section 3 — Adversarial Review Rules ทั้ง 4 กฎ พร้อมตัวอย่างการใช้งานในแต่ละ mode

- [ ] **Step 3: สร้าง tech-stack-patterns.md**

เนื้อหาจาก spec Section 7 — ตาราง tech stack detection (8 stacks + generic) พร้อม detection flow และจุดที่ต้องสแกนสำหรับแต่ละ framework

- [ ] **Step 4: สร้าง persona-template.md**

Template สำหรับสร้าง persona profiles ประกอบด้วย:
- Persona profile fields (ชื่อ, อายุ, อาชีพ, อุปกรณ์, ทักษะ IT, เป้าหมาย, pain points, พฤติกรรม)
- Journey simulation format (step-by-step + GAP markers)
- Gap summary format per persona
- ตัวอย่าง 2 personas (ป้าสมศรี, บอส ธนพล) จาก spec

- [ ] **Step 5: สร้าง research-guide.md**

Internet Research Guide ประกอบด้วย:
- 3 Layers (Problem Research, Compliance, Competitive Analysis)
- Search query templates สำหรับแต่ละ layer
- เครื่องมือ: Firecrawl (หลัก), Graph Brain (เสริม)
- Research report format (3 ตาราง)
- ตัวอย่าง queries สำหรับ domains ต่างๆ (e-commerce, healthcare, finance, HR)

- [ ] **Step 6: Commit**

```bash
git add plugins/flow-discovery/skills/flow-discovery/references/
git commit -m "feat(flow-discovery): add reference files — edge cases, adversarial rules, tech stack, personas, research"
```

---

## Task 4: สร้าง Template Files

**Files:**
- Create: `plugins/flow-discovery/skills/flow-discovery/templates/flow-tracker.json`
- Create: `plugins/flow-discovery/skills/flow-discovery/templates/report-template.md`

- [ ] **Step 1: สร้าง flow-tracker.json**

```json
{
  "schema_version": "1.0.0",
  "project": "",
  "lastScan": "",
  "techStack": "",
  "scope": "",
  "summary": {
    "totalFindings": 0,
    "critical": 0,
    "important": 0,
    "niceToHave": 0
  },
  "findings": [
    {
      "id": "F001",
      "title": "",
      "description": "",
      "severity": "critical|important|nice-to-have",
      "source": "full-scan|deep-dive|quick-think|ideate|persona-simulation|research",
      "persona": "",
      "module": "",
      "codeRef": "",
      "rootCause": "",
      "impact": "",
      "solutions": [],
      "effort": "S|M|L",
      "status": "open|in-progress|resolved|wont-fix",
      "handoffTo": "qa-ui-test|system-design-doc|ui-mockup|long-running|null",
      "handoffCommand": ""
    }
  ],
  "researchResults": [
    {
      "topic": "",
      "date": "",
      "file": "",
      "layers": ["problems", "compliance", "competitive"]
    }
  ],
  "personas": [
    {
      "name": "",
      "feature": "",
      "file": "",
      "gapsFound": 0
    }
  ]
}
```

- [ ] **Step 2: สร้าง report-template.md**

```markdown
# 📋 Flow Discovery Report: [Project Name]
**วันที่**: [date]
**Scope**: [Full Scan / Deep Dive: feature / Ideate: idea]
**Tech Stack**: [detected stack]

---

## สรุปภาพรวม
- Flow ที่พบในระบบ: X flows
- Gap ที่ค้นพบ: Y gaps
- Edge Case ที่ค้นพบ: Z cases

## 🔴 Critical Findings

### [F001] [Finding Title]
- **สถานการณ์**: [เกิดอะไรขึ้น]
- **Trigger**: [อะไรทำให้เกิด]
- **ผลกระทบ**: [กระทบอะไร]
- **Code ที่เกี่ยวข้อง**: [file:line] (ถ้ามี)
- **Root Cause**: [สาเหตุ]
- **แนะนำ**: [วิธีแก้/ป้องกัน 2-3 ทาง]
- **ระดับความยาก**: [S/M/L]

## 🟡 Important Findings
...

## 🟢 Nice-to-have
...

## Flow ที่ยังไม่มีแต่ควรพิจารณา

| Flow | เหตุผลที่ควรมี | Priority |
|------|---------------|----------|
| ... | ... | ... |

## Scenarios สำหรับ QA

| ID | Scenario (Given-When-Then) | Type | Priority |
|----|---------------------------|------|----------|
| S001 | Given... When... Then... | Edge Case | 🔴 |

---

## 📋 แนะนำขั้นตอนถัดไป

1. สร้าง test scenarios จาก findings → `/qa-create-scenario`
2. อัพเดทเอกสารออกแบบ → `/edit-section` หรือ `/brainstorm-design`
3. ปรับปรุง UI/UX → เปิด ui-mockup
4. เพิ่ม feature ที่ขาดหาย → `/add-feature`
5. ค้นหาข้อมูลเพิ่ม → `/flow-research [topic]`
6. สร้างเอกสารสำหรับแชร์ → `/flow-export [format]`
```

- [ ] **Step 3: Commit**

```bash
git add plugins/flow-discovery/skills/flow-discovery/templates/
git commit -m "feat(flow-discovery): add templates — flow-tracker.json and report-template"
```

---

## Task 5: สร้าง Command — `/flow-discovery` (Main Menu)

**Files:**
- Create: `plugins/flow-discovery/commands/flow-discovery.md`

- [ ] **Step 1: สร้าง flow-discovery.md**

Command file ที่แสดง menu เลือก mode พร้อมคำอธิบายแต่ละคำสั่ง:
- YAML frontmatter: description, allowed-tools
- แสดงตาราง 10 commands พร้อมคำอธิบายภาษาไทย
- ถามผู้ใช้ว่าต้องการใช้ mode ไหน
- แนะนำ: ถ้ามี code แล้ว → `/flow-scan`, ถ้ายังไม่มี → `/flow-ideate`
- ตอบเป็นภาษาไทย

- [ ] **Step 2: Commit**

```bash
git add plugins/flow-discovery/commands/flow-discovery.md
git commit -m "feat(flow-discovery): add /flow-discovery main menu command"
```

---

## Task 6: สร้าง Command — `/flow-scan` (Full Scan)

**Files:**
- Create: `plugins/flow-discovery/commands/flow-scan.md`

- [ ] **Step 1: สร้าง flow-scan.md**

Command file ที่มี:
- YAML frontmatter: description, allowed-tools (Bash, Read, Write, Edit, Glob, Grep, Agent)
- CRITICAL RULES: (1) ห้ามตอบ "ดีแล้ว" (2) ทุก finding ต้อง actionable (3) ห้าม false positive (4) Multi-perspective
- Self-Check Checklist (7 items)
- Output Rejection Criteria
- Input format: `/flow-scan`, `/flow-scan --module [name]`
- 6 Steps ตาม spec:
  - Step 1: Codebase Reconnaissance — auto-detect tech stack, สแกน directory, หา entry points (อ้างอิง `references/tech-stack-patterns.md`)
  - Step 2: Flow Extraction — อ่าน controllers/services, middleware, event handlers, scheduled tasks
  - Step 3: Multi-Agent Brainstorm — dispatch 7 subagents พร้อมกัน ด้วย Agent tool (run_in_background: true) แต่ละตัวมี prompt เฉพาะ persona + อ้างอิง `references/edge-case-checklist.md` + `references/adversarial-rules.md`
  - Step 4: Deep Analysis — merge findings, ลบ duplicate, Root Cause, Impact Chain, Solutions, Effort
  - Step 5: Prioritize — 🔴/🟡/🟢
  - Step 6: Report + Next Action — สร้าง `flow-discovery-report.md` ตาม `templates/report-template.md`, อัพเดท `flow-tracker.json`, แสดง Next Action box
- Subagent prompts สำหรับ 7 personas (detailed role-specific prompts ภาษาไทย)
- ตอบเป็นภาษาไทย

- [ ] **Step 2: Commit**

```bash
git add plugins/flow-discovery/commands/flow-scan.md
git commit -m "feat(flow-discovery): add /flow-scan command with 7-agent brainstorm"
```

---

## Task 7: สร้าง Command — `/flow-dive` (Deep Dive)

**Files:**
- Create: `plugins/flow-discovery/commands/flow-dive.md`

- [ ] **Step 1: สร้าง flow-dive.md**

Command file ที่มี:
- YAML frontmatter: description, allowed-tools
- CRITICAL RULES + Self-Check + Output Rejection
- Input: `/flow-dive [feature]`
- 5 Steps:
  - Step 1: Scope Lock — ระบุ module, หาไฟล์ที่เกี่ยวข้อง, สรุป boundary
  - Step 2: Trace Every Path — อ่าน code ทีละ function, วาด decision tree, ถามทุก branch
  - Step 3: Scenario Generation — Given-When-Then (Happy/Alternative/Error/Edge/Security)
  - Step 4: Multi-Agent Adversarial Deep Dive — 7 subagents วิเคราะห์เฉพาะ feature
  - Step 5: Deep Analysis + Prioritize + Report
- Output: `flow-dive-[feature].md`, `scenarios-[feature].md`, อัพเดท `flow-tracker.json`
- Next Action แนะนำ
- ตอบเป็นภาษาไทย

- [ ] **Step 2: Commit**

```bash
git add plugins/flow-discovery/commands/flow-dive.md
git commit -m "feat(flow-discovery): add /flow-dive deep dive command"
```

---

## Task 8: สร้าง Command — `/flow-think` (Quick Think)

**Files:**
- Create: `plugins/flow-discovery/commands/flow-think.md`

- [ ] **Step 1: สร้าง flow-think.md**

Command file ที่มี:
- YAML frontmatter: description, allowed-tools
- CRITICAL RULES + Self-Check
- Input: `/flow-think [topic]`
- 3 Steps:
  - Step 1: รับ context จากผู้ใช้ (ถามทีละคำถาม 3-5 ข้อ)
  - Step 2: Multi-Agent Brainstorm + SCAMPER + Reverse Brainstorming
  - Step 3: Deep Analysis + Prioritize + Report
- Output: `flow-think-[topic].md`, อัพเดท `flow-tracker.json`
- Next Action แนะนำ
- ตอบเป็นภาษาไทย

- [ ] **Step 2: Commit**

```bash
git add plugins/flow-discovery/commands/flow-think.md
git commit -m "feat(flow-discovery): add /flow-think quick think command"
```

---

## Task 9: สร้าง Command — `/flow-ideate` (Greenfield Workflow Design)

**Files:**
- Create: `plugins/flow-discovery/commands/flow-ideate.md`

- [ ] **Step 1: สร้าง flow-ideate.md**

Command file ที่มี:
- YAML frontmatter: description, allowed-tools (รวม Firecrawl MCP tools)
- CRITICAL RULES + Self-Check
- Input: `/flow-ideate [idea]`
- 6 Steps:
  - Step 1: รับ context จากผู้ใช้ (ถามทีละคำถาม)
  - Step 2: Internet Research — 3 layers (อ้างอิง `references/research-guide.md`)
  - Step 3: Workflow Design — user roles, happy path flows, flow diagram, entities, integrations
  - Step 4: สร้าง Virtual User Personas (อ้างอิง `references/persona-template.md`)
  - Step 5: Multi-Agent Adversarial Review — 7 subagents วิเคราะห์ workflow
  - Step 6: Prioritize + Report + Next Action
- Output: `flow-ideate-[idea].md`, `flow-personas-[idea].md`, `flow-research-[idea].md`, อัพเดท `flow-tracker.json`
- Next Action แนะนำ (เน้น `/create-design-doc`, ui-mockup, `/add-feature`)
- ตอบเป็นภาษาไทย

- [ ] **Step 2: Commit**

```bash
git add plugins/flow-discovery/commands/flow-ideate.md
git commit -m "feat(flow-discovery): add /flow-ideate greenfield workflow design command"
```

---

## Task 10: สร้าง Command — `/flow-persona` (Virtual Users)

**Files:**
- Create: `plugins/flow-discovery/commands/flow-persona.md`

- [ ] **Step 1: สร้าง flow-persona.md**

Command file ที่มี:
- YAML frontmatter: description, allowed-tools (รวม Firecrawl MCP tools)
- CRITICAL RULES + Self-Check
- Input: `/flow-persona [feature]`
- 4 Steps:
  - Step 1: Internet Research สำหรับ Persona — ค้นหา user complaints, accessibility issues, demographics
  - Step 2: สร้าง Persona Profiles (3-5 คน) — ตาม `references/persona-template.md`
  - Step 3: Journey Simulation — จำลอง flow ทั้งเส้นของแต่ละ persona, ระบุ GAP
  - Step 4: Gap Summary per Persona + Prioritize
- Output: `flow-personas-[feature].md`, `journeys-[feature].md`, อัพเดท `flow-tracker.json`
- Next Action แนะนำ
- ตอบเป็นภาษาไทย

- [ ] **Step 2: Commit**

```bash
git add plugins/flow-discovery/commands/flow-persona.md
git commit -m "feat(flow-discovery): add /flow-persona virtual user personas command"
```

---

## Task 11: สร้าง Command — `/flow-research` (Internet Research)

**Files:**
- Create: `plugins/flow-discovery/commands/flow-research.md`

- [ ] **Step 1: สร้าง flow-research.md**

Command file ที่มี:
- YAML frontmatter: description, allowed-tools (รวม Firecrawl MCP tools, Graph Brain MCP tools)
- CRITICAL RULES + Self-Check
- Input: `/flow-research [topic]`
- 3 Layers ตาม spec:
  - Layer 1: Problem Research — search queries, sources, output format
  - Layer 2: Compliance & Regulation — กฎหมาย/มาตรฐาน, checklist format
  - Layer 3: Competitive Analysis — คู่แข่ง/best practices, comparison format
- อ้างอิง `references/research-guide.md`
- Save to Graph Brain สำหรับใช้ซ้ำ
- Output: `flow-research-[topic].md`, อัพเดท `flow-tracker.json`
- Research report format (3 ตาราง)
- Next Action แนะนำ
- ตอบเป็นภาษาไทย

- [ ] **Step 2: Commit**

```bash
git add plugins/flow-discovery/commands/flow-research.md
git commit -m "feat(flow-discovery): add /flow-research internet research command"
```

---

## Task 12: สร้าง Command — `/flow-export` (Export เอกสาร)

**Files:**
- Create: `plugins/flow-discovery/commands/flow-export.md`

- [ ] **Step 1: สร้าง flow-export.md**

Command file ที่มี:
- YAML frontmatter: description, allowed-tools
- Input: `/flow-export [format]` — format: summary (default), full, scenarios, personas, compliance
- ขั้นตอน:
  - Step 1: อ่าน flow-tracker.json + report files ที่มีอยู่
  - Step 2: สร้างเอกสารตาม format ที่เลือก
  - Step 3: Save เป็น `flow-export-[format]-[project]-[date].md`
- คุณสมบัติ: ภาษาไทย, ไม่มีศัพท์ AI/Agent, มีหมายเลขอ้างอิง F001
- ตัวอย่าง output สำหรับแต่ละ format
- Next Action แนะนำ
- ตอบเป็นภาษาไทย

- [ ] **Step 2: Commit**

```bash
git add plugins/flow-discovery/commands/flow-export.md
git commit -m "feat(flow-discovery): add /flow-export document export command"
```

---

## Task 13: สร้าง Command — `/flow-status` + `/flow-help`

**Files:**
- Create: `plugins/flow-discovery/commands/flow-status.md`
- Create: `plugins/flow-discovery/commands/flow-help.md`

- [ ] **Step 1: สร้าง flow-status.md**

Command file ที่มี:
- YAML frontmatter: description, allowed-tools
- Input: `/flow-status`
- ขั้นตอน:
  - Step 1: อ่าน flow-tracker.json
  - Step 2: แสดงภาพรวม — จำนวน findings แบ่งตาม severity (ASCII table)
  - Step 3: แสดง findings ที่ยัง open
  - Step 4: แสดง research results
  - Step 5: แสดง personas
  - Step 6: แนะนำ next action ตาม findings ที่ค้าง
- ตอบเป็นภาษาไทย

- [ ] **Step 2: สร้าง flow-help.md**

Command file ที่มี:
- YAML frontmatter: description, allowed-tools
- Input: `/flow-help`, `/flow-help [command]`
- ไม่ระบุ command → แสดง:
  - ตาราง 10 commands พร้อมคำอธิบายภาษาไทย
  - ตัวอย่างการใช้งานแต่ละคำสั่ง
  - แนะนำ: เริ่มจากไหนดี (brownfield vs greenfield)
- ระบุ command → แสดง:
  - คำอธิบายละเอียดของคำสั่งนั้น
  - Options ที่ใช้ได้
  - ตัวอย่างการใช้งาน 2-3 ตัวอย่าง
  - Output ที่ได้
  - Next Action ที่แนะนำหลังทำเสร็จ
- ตอบเป็นภาษาไทย

- [ ] **Step 3: Commit**

```bash
git add plugins/flow-discovery/commands/flow-status.md plugins/flow-discovery/commands/flow-help.md
git commit -m "feat(flow-discovery): add /flow-status and /flow-help commands"
```

---

## Task 14: ลงทะเบียนใน Marketplace

**Files:**
- Modify: `.claude-plugin/marketplace.json`

- [ ] **Step 1: เพิ่ม flow-discovery ใน marketplace.json**

เพิ่ม entry ใหม่ใน `plugins` array:

```json
{
  "name": "flow-discovery",
  "source": "./plugins/flow-discovery",
  "description": "วิเคราะห์ระบบ (brownfield + greenfield) ค้นหา workflow, scenario, edge case ที่ถูกมองข้าม — Multi-Agent Brainstorming (7 personas), Virtual User Simulation, Internet Research (problems, compliance, competitive), Adversarial Review จาก BMAD Method, auto-detect tech stack, export เอกสารสำหรับทีม",
  "version": "1.0.0",
  "category": "analysis",
  "tags": [
    "flow-discovery",
    "workflow-analysis",
    "edge-case",
    "adversarial-review",
    "persona",
    "user-journey",
    "gap-analysis",
    "brownfield",
    "greenfield",
    "bmad",
    "multi-agent",
    "internet-research",
    "compliance",
    "competitive-analysis"
  ],
  "author": {
    "name": "Mounchons"
  }
}
```

- [ ] **Step 2: อัพเดท marketplace version**

เปลี่ยน version ใน marketplace.json จาก `"1.2.0"` เป็น `"1.3.0"`

- [ ] **Step 3: Commit**

```bash
git add .claude-plugin/marketplace.json
git commit -m "feat(marketplace): register flow-discovery plugin v1.0.0"
```

---

## Task 15: Final Review + Integration Test

- [ ] **Step 1: ตรวจสอบ file structure ครบ**

```bash
find plugins/flow-discovery -type f | sort
```

Expected output:
```
plugins/flow-discovery/.claude-plugin/plugin.json
plugins/flow-discovery/commands/flow-discovery.md
plugins/flow-discovery/commands/flow-dive.md
plugins/flow-discovery/commands/flow-export.md
plugins/flow-discovery/commands/flow-help.md
plugins/flow-discovery/commands/flow-ideate.md
plugins/flow-discovery/commands/flow-persona.md
plugins/flow-discovery/commands/flow-research.md
plugins/flow-discovery/commands/flow-scan.md
plugins/flow-discovery/commands/flow-status.md
plugins/flow-discovery/commands/flow-think.md
plugins/flow-discovery/README.md
plugins/flow-discovery/skills/flow-discovery/references/adversarial-rules.md
plugins/flow-discovery/skills/flow-discovery/references/edge-case-checklist.md
plugins/flow-discovery/skills/flow-discovery/references/persona-template.md
plugins/flow-discovery/skills/flow-discovery/references/research-guide.md
plugins/flow-discovery/skills/flow-discovery/references/tech-stack-patterns.md
plugins/flow-discovery/skills/flow-discovery/SKILL.md
plugins/flow-discovery/skills/flow-discovery/templates/flow-tracker.json
plugins/flow-discovery/skills/flow-discovery/templates/report-template.md
```

- [ ] **Step 2: ตรวจสอบ marketplace.json มี flow-discovery**

```bash
grep -c "flow-discovery" .claude-plugin/marketplace.json
```

Expected: >= 2 (name + source)

- [ ] **Step 3: ตรวจสอบ plugin.json valid JSON**

```bash
cat plugins/flow-discovery/.claude-plugin/plugin.json | python -m json.tool > /dev/null && echo "VALID" || echo "INVALID"
```

Expected: VALID

- [ ] **Step 4: ตรวจสอบ flow-tracker.json template valid JSON**

```bash
cat plugins/flow-discovery/skills/flow-discovery/templates/flow-tracker.json | python -m json.tool > /dev/null && echo "VALID" || echo "INVALID"
```

Expected: VALID

- [ ] **Step 5: ตรวจสอบว่า command files ทุกไฟล์มี YAML frontmatter**

```bash
for f in plugins/flow-discovery/commands/*.md; do
  head -1 "$f" | grep -q "^---" && echo "OK: $f" || echo "MISSING FRONTMATTER: $f"
done
```

Expected: ทุกไฟล์ OK

- [ ] **Step 6: Final commit (ถ้ามีแก้ไข)**

```bash
git add -A plugins/flow-discovery/ .claude-plugin/marketplace.json
git commit -m "feat(flow-discovery): complete plugin v1.0.0 — 10 commands, 5 references, 2 templates, marketplace registered"
```
