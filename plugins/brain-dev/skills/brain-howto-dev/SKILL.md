---
name: brain-howto-dev
description: "Interactive Thai tutorial — teaches how to use brain commands step-by-step with real examples"
user_invocable: true
args: "[topic] — optional: specific command to learn about"
---

# Brain How-To — Thai Tutorial

ALL responses MUST be in Thai language. This is an educational tutorial.

## If no argument provided, show the full tutorial:

### Section 1: Getting Started
Explain in Thai:
- What is Graph Brain (knowledge database for the project)
- Why use it (faster than reading code every session, remembers analysis across sessions)
- The Brain First concept (always search brain before reading codebase)

### Section 2: First Time Setup
Step-by-step Thai guide:
1. `/brain-status-dev` — check if Graph Brain is connected
2. `/brain-scan-dev` — scan the entire codebase for the first time (takes a few minutes)
3. Done! Brain is now populated with project knowledge

### Section 3: Daily Usage (most common workflow)
Step-by-step Thai guide:
1. Open new session → brain auto-loads via hook
2. Ask questions: `/brain-dev checker ทำอะไรบ้าง`
3. After analyzing new code: `/brain-save-dev` to save findings
4. If code changed significantly: `/brain-update-dev <topic>` to refresh

### Section 4: Command-by-Command Examples
For each command, provide:
- Thai explanation of when to use
- Real example with expected output
- Common mistakes to avoid

Commands to cover:
- `/brain-dev <question>` — most important, Brain First query
- `/brain-search-dev <keyword>` — targeted search
- `/brain-explain-dev <topic>` — detailed explanation
- `/brain-save-dev [topic]` — save knowledge
- `/brain-scan-dev [folder]` — scan codebase
- `/brain-update-dev <topic>` — update existing
- `/brain-load-dev` — manual reload
- `/brain-status-dev` — check connection
- `/brain-explore-dev <topic>` — navigate graph interactively
- `/brain-history-dev <topic>` — view version history
- `/brain-projects-dev [name]` — cross-project management

### Section 5: Tips & Tricks
- Use `/brain-dev` for quick questions, `/brain-explain-dev` for deep analysis
- After long analysis sessions, always `/brain-save-dev` before ending
- `/brain-scan-dev` specific folders when only part of code changed
- If brain seems outdated, use `/brain-update-dev`

### Section 6: Troubleshooting
- Brain not connected → `/brain-status-dev` to diagnose
- Knowledge seems wrong → `/brain-update-dev` to refresh from current code
- Too many results → use more specific keywords

### Section 7: Graph Features (v3.0.0)
Step-by-step Thai guide:

**Exploring the Knowledge Graph:**
1. `/brain-explore-dev authentication` — เริ่มจาก node authentication
2. เลือกเลขเพื่อเดินตาม connection → ดู related knowledge
3. กด [B] กลับ, [S] search ใหม่, [Q] หยุด

**Version History:**
1. Update note ด้วย `/brain-update-dev auth flow`
2. ระบบสร้าง changelog อัตโนมัติ
3. ดูประวัติ: `/brain-history-dev auth flow`
4. เปรียบเทียบ versions หรือ restore version เก่าได้

**Cross-Project Intelligence:**
1. `/brain-projects-dev` — ดู projects ทั้งหมด
2. เลือก project ดู tech stack, notes, connections
3. `/brain-projects-dev --compare` — เปรียบเทียบ 2 projects
4. `/brain-projects-dev --tech` — ดู technologies ทั้งหมด

## If argument provided (e.g., `/brain-howto-dev save`):
Show only the relevant section for that specific command with detailed Thai examples.
