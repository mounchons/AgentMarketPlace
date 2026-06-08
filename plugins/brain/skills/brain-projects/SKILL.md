---
name: brain-projects
description: "View all projects in Brain — tech stacks, cross-project connections, and technology overview"
user_invocable: true
args: "[project-name | --tech | --compare] — view specific project, tech overview, or compare projects"
---

# Brain Projects — Project Management & Cross-Project View

ALL responses MUST be in Thai language.

## Steps

1. **List all projects**
   - Call `mcp__graph-brain__list-projects`
   - If no projects found → suggest `/brain-scan` to populate

2. **Display projects table**
   ```
   🏗️ Projects ทั้งหมดใน Brain ({N} projects)
   ═══════════════════════════════════════

   | # | Project | Notes | Tasks | Tech Stack |
   |---|---------|-------|-------|------------|
   | 1 | {name}  | {N}   | {T}   | {techs}    |
   | 2 | {name}  | {N}   | {T}   | {techs}    |

   ═══════════════════════════════════════
   เลือก:
   [เลข]    ดูรายละเอียด project
   [A]      tech-overview — ดู technologies ทั้งหมด
   [B]      compare — เปรียบเทียบ 2 projects
   ```

3. **View specific project** (number selected or argument provided)
   - Call `mcp__graph-brain__get-project` name="{project-name}"
   - Display:
     ```
     🏗️ {Project Name}
     ─────────────────────────────────────
     🔧 Tech Stack: {technologies}
     📄 Notes: {N} ชิ้น
     ✅ Tasks: {T} รายการ

     📂 Notes จัดกลุ่มตาม folder:
     ├── core/ ({N} notes)
     ├── database/ ({N} notes)
     ├── workflow/ ({N} notes)
     └── ...

     🔗 Cross-Project Links:
     → Notes ที่ link ไป project อื่น:
       [{Note Title}] →[LINKS_TO]→ [{Other Project Note}]
     ```

4. **Tech overview** ([A] selected or `--tech` argument)
   - Call `mcp__graph-brain__tech-overview`
   - Display:
     ```
     🔧 Technology Overview
     ═══════════════════════════════════════

     | Technology | Projects ที่ใช้ |
     |------------|----------------|
     | react      | MyWebApp, AdminPanel |
     | dotnet     | MyWebApp, ApiService |
     | claude-code | AgentMarketPlace |

     📊 สรุป: {N} technologies, {M} projects
     ```

   - With filter: `mcp__graph-brain__tech-overview` filterTech="{tech-name}"
     ```
     🔧 Projects ที่ใช้ {tech-name}:
     - {Project 1} — {description}
     - {Project 2} — {description}
     ```

5. **Compare projects** ([B] selected or `--compare` argument)
   - Ask user to select 2 projects (by number)
   - Call `mcp__graph-brain__get-project` for both
   - Display:
     ```
     🔄 เปรียบเทียบ: {Project A} ↔ {Project B}
     ═══════════════════════════════════════

     Shared Tech: {common technologies}
     Only in {A}: {unique to A}
     Only in {B}: {unique to B}

     Shared Tags: {common tags}

     Cross-linked Notes:
       [{A Note}] →→ [{B Note}]

     💡 Knowledge ที่ reuse ได้:
       {suggestions based on shared tech/tags}
     ```

6. **Write activity log**
   - Append entry to `.brain/activity-log.json`
   ```json
   {
     "timestamp": "<ISO 8601 UTC>",
     "session_id": "<$CLAUDE_SESSION_ID or date-based>",
     "command": "brain-projects",
     "args": "<project-name or flag>",
     "project": "<project-name from cwd>",
     "status": "completed",
     "details": {
       "total_projects": N,
       "action": "listed|viewed|tech-overview|compared",
       "projects_viewed": ["<project names>"]
     }
   }
   ```
