---
name: brain-load
description: "Load project knowledge from Graph Brain at session start. Auto-runs via hook, but can be called manually."
user_invocable: true
argument-hint: "[project-name or keyword] — default: current working directory name"
---

# Brain Load

ALL responses MUST be in Thai language.

## Steps

1. **Check connection**
   - Call `mcp__graph-brain__brain-stats`
   - If failed, ask user (in Thai):
     - [1] Retry connection
     - [2] Skip — work from codebase directly

1.5. **Get project context** (NEW)
   - Call `mcp__graph-brain__get-project` name="{project-name}"
   - If project found → store: tech stack, note count, related projects
   - If not found → continue (project may not exist in brain yet)

2. **Search for project knowledge**
   - query = argument or basename of current working directory
   - Call `mcp__graph-brain__search-knowledge` query="{project}" limit=10
   - Call `mcp__graph-brain__search-by-tags` tags=["{project-name-lowercase}"]

3. **Load top notes**
   - Call `mcp__graph-brain__get-knowledge` for top 5 results
   - Priority order: architecture → workflow → data model → integrations → config

3.5. **Freshness Check (v3.2 — Freshness Protocol §5.2 ใน `${CLAUDE_PLUGIN_ROOT}/GRAPH_PROTOCOL.md`)**
   - เช็คเฉพาะ notes ของ project ปัจจุบัน — parse `Scanned-At-Commit` จาก `## Scan Metadata` (ใช้อันที่ `Scanned-At` ล่าสุด)
   - ไม่มี footer เลย → ข้ามเงียบๆ (notes เก่า/conversation knowledge — backward compatible)
   - ตรวจ hash ก่อน: `git cat-file -e "{hash}^{commit}"` (**ต้อง quote** — PowerShell แตก token) — fail → "ไม่สามารถระบุความสดได้" + ถามชุดด้านล่าง
   - `git rev-parse --short HEAD` ตรง → สด — ไม่เตือน/ไม่ถาม (สถานะไปแสดงเป็นบรรทัดเดียวใน Step 4)
   - ไม่ตรง → `git rev-list "{hash}..HEAD" --count` = N → เตือน + ถาม:
     ```
     ⚠️ ความรู้ใน Brain เก่ากว่าโค้ด {N} commits (scan ล่าสุด: {date} @ {hash})
     [1] Incremental scan ก่อนตอบ (แนะนำ — สแกนเฉพาะไฟล์ที่เปลี่ยน)
     [2] ตอบจากข้อมูลเดิม (อาจไม่ตรงโค้ดปัจจุบัน)
     ```
     (N = 0 ทั้งที่ hash ≠ HEAD = checkout เก่า/คนละ branch → ใช้ข้อความตาม §5.2 ข้อ 6 — ห้าม "เก่ากว่า 0 commits")
   - **จำคำตอบตลอด session** — /brain query ถัดไปไม่ถามซ้ำ (ใช้คำตอบนี้)
   - Edge cases อื่น (non-git → เทียบ `Scanned-At` กับ mtime ของ Source-Files, git/MCP error → ข้าม check) → ตาม §5.2 ข้อ 9-10 (never block session start)

4. **Report to user (Thai)**
   - If found: list loaded notes with descriptions
   - Freshness status (from Step 3.5): "🔖 ความสด: ตรงกับ HEAD ({hash})" หรือ "⚠️ เก่ากว่าโค้ด {N} commits" หรือไม่แสดงถ้าไม่มี footer
   - If project context available (from Step 1.5):
     - Show: "🏗️ Tech Stack: [{technologies}]"
     - Show: "🔗 Connected Projects: [{related project names}]"
   - If empty: suggest `/brain-scan` to populate

5. **Keep in context**
   - Retain loaded knowledge for use throughout the session

6. **Write activity log**
   - Append entry to `.brain/activity-log.json` at project root
   - Create `.brain/` directory and file if they don't exist (start with `[]`)
   - Log entry format:
   ```json
   {
     "timestamp": "<ISO 8601 UTC>",
     "session_id": "<$CLAUDE_SESSION_ID or date-based>",
     "command": "brain-load",
     "args": "<project-name or keyword>",
     "project": "<project-name from cwd>",
     "status": "completed",
     "details": {
       "notes_loaded": "<N>",
       "brain_connected": true/false,
       "project_found_in_brain": true/false,
       "tech_stack": ["<technologies>"]
     }
   }
   ```
   - Never block session for logging failures
