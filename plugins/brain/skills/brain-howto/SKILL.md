---
name: brain-howto
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
1. `/brain-status` — check if Graph Brain is connected
2. `/brain-scan` — scan the entire codebase for the first time (takes a few minutes)
3. Done! Brain is now populated with project knowledge

### Section 3: Daily Usage (most common workflow)
Step-by-step Thai guide:
1. Open new session → brain auto-loads via hook
2. Ask questions: `/brain checker ทำอะไรบ้าง`
3. After analyzing new code: `/brain-save` to save findings
4. If code changed significantly: `/brain-update <topic>` to refresh

### Section 4: Command-by-Command Examples
For each command, provide:
- Thai explanation of when to use
- Real example with expected output
- Common mistakes to avoid

Commands to cover:
- `/brain <question>` — most important, Brain First query
- `/brain-search <keyword>` — targeted search
- `/brain-explain <topic>` — detailed explanation
- `/brain-save [topic]` — save knowledge
- `/brain-scan [folder]` — scan codebase
- `/brain-update <topic>` — update existing
- `/brain-load` — manual reload
- `/brain-status` — check connection

### Section 5: Tips & Tricks
- Use `/brain` for quick questions, `/brain-explain` for deep analysis
- After long analysis sessions, always `/brain-save` before ending
- `/brain-scan` specific folders when only part of code changed
- If brain seems outdated, use `/brain-update`

### Section 6: Troubleshooting
- Brain not connected → `/brain-status` to diagnose
- Knowledge seems wrong → `/brain-update` to refresh from current code
- Too many results → use more specific keywords

## If argument provided (e.g., `/brain-howto save`):
Show only the relevant section for that specific command with detailed Thai examples.
