---
name: bigbrain
description: "BigBrain First — ask any question. Searches Graphiti knowledge graph first (nodes + facts), reads codebase if incomplete, offers to save new findings. PRIMARY command for querying."
user_invocable: true
args: "<question or topic> — any question about the project in any language"
---

# BigBrain First — Primary Knowledge Query

ALL responses MUST be in Thai language regardless of input language.

**Graphiti Protocol:** Follow rules in `GRAPHITI_PROTOCOL.md` for all operations.

## Execution Flow

### Step 1: Search Graph (fast path)

Run both searches in parallel:
- Call `mcp__big-brain__search_memory_nodes` query="{user's question}" group_ids=["bigbrain"] max_nodes=10
- Call `mcp__big-brain__search_memory_facts` query="{user's question}" group_ids=["bigbrain"] max_facts=10

If nodes found with UUIDs → do center-node search for deeper context:
- Pick the most relevant node UUID
- Call `mcp__big-brain__search_memory_facts` query="{related aspect}" center_node_uuid="{uuid}" max_facts=5

### Step 2: Evaluate Completeness
Rate the graph results against the user's question:
- **Complete** (graph answers the question fully) → go to Step 4
- **Partial** (some nodes/facts found but gaps exist) → go to Step 3
- **Empty** (nothing found) → go to Step 3

### Step 3: Read Codebase (slow path — only if needed)
Display to user:
```
🧠 BigBrain: พบ {N} entities, {M} facts {complete|บางส่วน|ไม่พบ}
📂 กำลังอ่านเพิ่มจาก codebase...
```
- Use Explore agent or direct file reads to find missing information
- Focus only on the GAP — do not re-read what graph already provided
- After reading, combine graph knowledge + codebase findings

### Step 4: Respond in Thai
Present the answer with:
- Clear structure (headers, tables, flow diagrams as appropriate)
- Source labels: `[Graph]` for graph-sourced info, `[Code]` for codebase-sourced info
- Entity context: show key nodes and their relationships discovered
- Fact context: show relevant facts with temporal info if available

Format entities and facts per GRAPHITI_PROTOCOL.md Display Format.

### Step 5: Offer to Save (only if Step 3 was executed)
If new information was found from codebase:
```
💡 พบข้อมูลใหม่จาก codebase ที่ยังไม่มีใน BigBrain
ต้องการบันทึกไหม? พิมพ์ /bigbrain-save เพื่อเก็บ
```

## Connection Failure
If Big Brain is unreachable:
```
⚠️ BigBrain เชื่อมต่อไม่ได้ — อ่านจาก codebase โดยตรง
💡 ตรวจสอบ: docker compose up -d (ที่ D:\GitHub\BigBrain\graphiti-mcp-pro)
```
Then read from codebase and answer normally. Do NOT block.

## Examples
```
/bigbrain architecture ของ project นี้
/bigbrain ระบบ authentication ทำงานยังไง
/bigbrain database schema มีอะไรบ้าง
/bigbrain relationship ระหว่าง User กับ Order
```
