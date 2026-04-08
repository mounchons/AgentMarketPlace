---
name: bigbrain-save
description: "Save new knowledge to BigBrain Graphiti graph as episodes — auto entity/fact extraction"
user_invocable: true
args: "[topic] — if omitted, auto-detect from recent conversation"
---

# BigBrain Save

ALL responses MUST be in Thai language.

**Graphiti Protocol:** Follow rules in `GRAPHITI_PROTOCOL.md` for all save operations.

## Steps

1. **Determine what to save**
   - If argument provided → use as topic, analyze conversation for relevant info
   - If no argument → scan recent conversation for:
     - Code analysis results
     - Architecture discoveries
     - Workflow/business logic findings
     - Integration patterns
     - Database structures

2. **Check for existing knowledge**
   - Call `mcp__big-brain__search_memory_nodes` query="{topic}" group_ids=["bigbrain"] max_nodes=5
   - If similar entities exist, ask user (Thai):
     - [1] เพิ่มข้อมูลใหม่ (Graphiti จะ merge/update facts อัตโนมัติ)
     - [2] ใช้ /bigbrain-update แทน — ถ้าข้อมูลเดิม **เปลี่ยน** (invalidate facts เก่า + สร้างใหม่)
     - [3] ยกเลิก — ข้อมูลมีอยู่แล้วเพียงพอ
   - Show existing entities briefly so user can decide
   - **Guideline:** ถ้าข้อมูลใหม่ **ไม่ขัดกับ** ข้อมูลเดิม → [1] save เพิ่ม, ถ้า **ขัดกัน** → [2] update

3. **Format episode content**
   Prepare content that enables good entity extraction:

   - **name**: `"{ProjectName} — {Topic}"` (short, descriptive)
   - **episode_body**: Write as **natural language paragraphs** with:
     - Named entities clearly mentioned (systems, components, people, technologies)
     - Relationships stated explicitly ("X uses Y", "A connects to B", "C depends on D")
     - Project context included (project name, domain)
     - Technical details with specifics (versions, configs, patterns used)
   - **source**: Choose appropriately:
     - `text` — for analysis results, summaries (default)
     - `json` — for structured data (escape properly!)
     - `message` — for conversation excerpts
   - **source_description**: Describe origin — "codebase analysis", "architecture scan", "user conversation", "documentation"
   - **group_id**: `"bigbrain"`

   **Important:** episode_body ต้องเป็นประโยคที่มี context — ห้ามใส่แค่ keywords หรือ bullet points สั้นๆ
   เพราะ Graphiti ต้อง extract entities/relationships จาก text

4. **Save**
   - Call `mcp__big-brain__add_memory` with prepared data
   - Capture the returned `task_id`

5. **Wait & Report**
   - Call `mcp__big-brain__wait_for_add_memory_task` task_id="{id}" timeout=120
   - If completed → report in Thai:
     ```
     ✅ บันทึกสำเร็จ!
     📝 Episode: {name}
     🔖 Source: {source} — {source_description}
     ⏱️ Task ID: {task_id}
     🔵 Entities ที่ extract ได้จะปรากฏใน graph ภายในไม่กี่วินาที
     💡 ใช้ /bigbrain-search {topic} เพื่อดูผลลัพธ์
     ```
   - If timeout/failed → report error and suggest retry

6. **Write activity log**
   - Append entry to `.bigbrain/activity-log.json` at project root
   - Create `.bigbrain/` directory and file if they don't exist (start with `[]`)
   - Add `.bigbrain/` to `.gitignore` if not already there
   - Log entry format:
   ```json
   {
     "timestamp": "<ISO 8601 UTC>",
     "session_id": "<$CLAUDE_SESSION_ID or date-based>",
     "command": "bigbrain-save",
     "args": "<topic argument or 'auto-detect'>",
     "project": "<project-name from cwd>",
     "status": "completed|failed",
     "details": {
       "episode_name": "<name>",
       "source": "<source type>",
       "task_id": "<add_memory task_id>",
       "task_status": "<completed|failed|timeout>",
       "group_id": "bigbrain",
       "existing_entities_found": true/false
     }
   }
   ```

## JSON Source Example
When saving structured data (e.g., from scan results):
```
source: "json"
episode_body: "{\"project\": \"MyApp\", \"architecture\": {\"frontend\": \"React\", \"backend\": \".NET 8\"}, \"database\": {\"type\": \"SQL Server\", \"orm\": \"Entity Framework\"}}"
```
Graphiti will automatically extract entities: MyApp, React, .NET 8, SQL Server, Entity Framework
and create facts: "MyApp uses React for frontend", "MyApp uses .NET 8 for backend", etc.
