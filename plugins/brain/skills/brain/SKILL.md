---
name: brain
description: "Brain First — ask any question about the project. Searches brain first, reads codebase if incomplete, offers to save new findings back. This is the PRIMARY command for querying project knowledge.
  USE THIS SKILL when the user asks about project structure, architecture, workflows, dependencies, permissions, or any how-does-X-work question — BEFORE exploring the codebase manually.
  Thai triggers: 'โปรเจกต์นี้ทำอะไร', 'ระบบนี้ทำงานยังไง', 'อธิบายระบบ', 'หา dependency', 'permission ของ role', 'ถาม brain', 'มีความรู้เรื่อง...ไหม'"
user_invocable: true
argument-hint: "<question or topic> — any question about the project in any language"
---

# Brain First — Primary Knowledge Query

ALL responses MUST be in Thai language regardless of input language.

## Execution Flow

### Step 1: Search Brain (fast path)
- Call `mcp__graph-brain__search-knowledge` query="{user's question}" limit=10
- Call `mcp__graph-brain__search-by-tags` with extracted keywords as tags
- For top 3-5 results, call `mcp__graph-brain__get-knowledge` to load full content
- Follow `[[wiki links]]` in loaded notes — load linked notes for complete context (max 3 hops)
- If results < 3 and at least 1 result exists → use `mcp__graph-brain__explore-graph` nodeId="{best-result-id}" depth=2 to find connected knowledge through relationships

### Step 1.5: Freshness Check (v3.2 — Freshness Protocol §5.2 ใน `${CLAUDE_PLUGIN_ROOT}/GRAPH_PROTOCOL.md`)

ก่อนใช้ notes ตอบ — เช็คว่าความรู้ยังตรงกับโค้ดปัจจุบัน:

1. เช็คเฉพาะ notes ของ project ปัจจุบัน (projectName ตรง basename ของ cwd) — notes ข้าม project ข้าม check
2. Parse `Scanned-At-Commit` จาก `## Scan Metadata` ของ notes ที่โหลด — ใช้อันที่ `Scanned-At` ล่าสุด (อันใด hash ตรง HEAD → ถือว่าสดทันที)
3. **ไม่มี footer เลย** (notes เก่า pre-v3.2 หรือจาก brain-save) → ข้าม check เงียบๆ ไป Step 2
4. ตรวจ hash มีจริงก่อน: `git cat-file -e "{hash}^{commit}"` — **ต้อง quote argument** (PowerShell แตก `^{commit}` ถ้าไม่ quote) — fail → ข้อ 7
5. `git rev-parse --short HEAD` ตรงกับ hash → สด → ไป Step 2 (ไม่แสดงอะไร)
6. ไม่ตรง → `git rev-list "{hash}..HEAD" --count` = N — **N > 0** → เตือน + **ถามก่อน**:
   ```
   ⚠️ ความรู้ใน Brain เก่ากว่าโค้ด {N} commits (scan ล่าสุด: {date} @ {hash})
   [1] Incremental scan ก่อนตอบ (แนะนำ — สแกนเฉพาะไฟล์ที่เปลี่ยน)
   [2] ตอบจากข้อมูลเดิม (อาจไม่ตรงโค้ดปัจจุบัน)
   ```
   - เลือก [1] → รัน `/brain-scan` (Smart incremental) → **โหลด notes ที่อัปเดตใหม่ (ทำ Step 1 ซ้ำ)** แล้วค่อยตอบ
   - เลือก [2] → ตอบจาก notes เดิม + กำกับในคำตอบว่า "ข้อมูล ณ {date} — โค้ดเปลี่ยนไปแล้ว {N} commits"
   - **N = 0 ทั้งที่ hash ≠ HEAD** (checkout เก่า/คนละ branch — ความรู้ใหม่กว่าโค้ดที่เปิดอยู่) → เตือน "ความรู้ใน Brain มาจาก commit {hash} ที่ไม่ตรงกับ HEAD ปัจจุบัน (checkout เก่าหรือคนละ branch)" + ถามชุดเดียวกัน — ห้ามใช้ "เก่ากว่า 0 commits"
7. hash ไม่อยู่ใน history (ข้อ 4 fail) → เตือน "ไม่สามารถระบุความสดได้" + ถามชุดเดียวกัน
8. **จำคำตอบตลอด session** — รวมคำตอบที่ user ให้ไว้ตอน `/brain-load` ต้น session: เคยตอบแล้วห้ามถามซ้ำ ใช้คำตอบนั้นเลย
9. Non-git: เทียบ `Scanned-At` กับ mtime ของ `Source-Files` → มีไฟล์ใหม่กว่า → เตือน date-based แล้วถามชุดเดียวกัน
10. git/MCP error อื่นใดนอกเหนือจากข้อ 4 → ข้าม check ไป Step 2 (never block)

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
- Relationship context: if explore-graph was used, show key connections found (e.g., "เชื่อมกับ: [[Note A]], [[Note B]]")

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
