---
name: brain
description: "Brain First — ask any question about the project. Searches brain first, reads codebase if incomplete, offers to save new findings back. This is the PRIMARY command for querying project knowledge."
user_invocable: true
args: "<question or topic> — any question about the project in any language"
---

# Brain First — Primary Knowledge Query

ALL responses MUST be in Thai language regardless of input language.

## Execution Flow

### Step 1: Search Brain (fast path)
- Call `mcp__graph-brain__search-knowledge` query="{user's question}" limit=10
- Call `mcp__graph-brain__search-by-tags` with extracted keywords as tags
- For top 3-5 results, call `mcp__graph-brain__get-knowledge` to load full content
- Follow `[[wiki links]]` in loaded notes — load linked notes for complete context (max 3 hops)

### Step 2: Evaluate Completeness
Rate the brain results against the user's question:
- **Complete** (brain answers the question fully) → go to Step 4
- **Partial** (some info found but gaps exist) → go to Step 3
- **Empty** (nothing found) → go to Step 3

### Step 3: Read Codebase (slow path — only if needed)
Display to user:
```
🧠 Brain: พบข้อมูล {N} ชิ้น {complete|บางส่วน|ไม่พบ}
📂 กำลังอ่านเพิ่มจาก codebase...
```
- Use Explore agent or direct file reads to find missing information
- Focus only on the GAP — do not re-read what brain already provided
- After reading, combine brain knowledge + codebase findings

### Step 4: Respond in Thai
Present the answer with:
- Clear structure (headers, tables, flow diagrams as appropriate)
- Source labels: `[Brain]` for brain-sourced info, `[Code]` for codebase-sourced info
- Relevant file paths if referencing specific code

### Step 5: Offer to Save (only if Step 3 was executed)
If new information was found from codebase:
```
💡 พบข้อมูลใหม่จาก codebase ที่ยังไม่มีใน Brain
ต้องการบันทึกไหม? พิมพ์ /brain-save เพื่อเก็บ
```

## Connection Failure
If Graph Brain is unreachable:
```
⚠️ Graph Brain เชื่อมต่อไม่ได้ — อ่านจาก codebase โดยตรง
```
Then read from codebase and answer normally. Do NOT block.

## Examples
```
/brain checker ทำอะไรบ้าง
/brain วิธีนำเข้าข้อมูลจาก Excel
/brain workflow ตั้งแต่รับงานถึงส่งประกัน
/brain database connection ใช้อะไรบ้าง
/brain Lucky job ต่างจากงานปกติอย่างไร
```
