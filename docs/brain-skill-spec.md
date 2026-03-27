# Brain Skill Specification v2

> Plugin for Graph Brain MCP — project knowledge management with Brain First strategy.
> Skill content in English (reduce tokens). All responses MUST be in Thai.

---

## Plugin Structure

```
.claude/plugins/brain/
├── plugin.json
├── skills/
│   ├── brain/SKILL.md              # /brain — Brain First: ask anything, brain → codebase → save
│   ├── brain-help/SKILL.md         # /brain-help — show all commands
│   ├── brain-howto/SKILL.md        # /brain-howto — Thai tutorial
│   ├── brain-load/SKILL.md         # /brain-load — load knowledge at session start
│   ├── brain-save/SKILL.md         # /brain-save — save new knowledge
│   ├── brain-scan/SKILL.md         # /brain-scan — scan codebase into brain
│   ├── brain-search/SKILL.md       # /brain-search — search brain by keyword
│   ├── brain-update/SKILL.md       # /brain-update — update existing knowledge
│   ├── brain-status/SKILL.md       # /brain-status — check connection + stats
│   └── brain-explain/SKILL.md      # /brain-explain — explain system from brain
│
└── hooks/
    └── hooks.json                  # SessionStart hook — auto-load brain
```

---

## 1. plugin.json

```json
{
  "name": "brain",
  "description": "Graph Brain knowledge management — Brain First strategy: search brain before codebase, auto-save new findings",
  "version": "2.0.0"
}
```

---

## 2. hooks/hooks.json

```json
{
  "SessionStart": [
    {
      "matcher": "startup|resume",
      "hooks": [
        {
          "type": "prompt",
          "prompt": "Graph Brain plugin is active. On session start:\n\n1. Call mcp__graph-brain__brain-stats to check connection\n2. If connected: call mcp__graph-brain__search-knowledge with the current working directory name as query (limit=5) to preload project context. Keep results in conversation context.\n3. If NOT connected: display '⚠️ Graph Brain ไม่สามารถเชื่อมต่อได้ — พิมพ์ /brain-status เพื่อตรวจสอบ หรือทำงานต่อได้เลย' and continue normally.\n4. NEVER block the session. If connection fails, allow user to work from codebase directly.\n\nALL responses from brain skills MUST be in Thai language."
        }
      ]
    }
  ]
}
```

---

## 3. skills/brain/SKILL.md — `/brain` (Brain First Command)

```markdown
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
```

---

## 4. skills/brain-help/SKILL.md — `/brain-help`

```markdown
---
name: brain-help
description: "Show all available brain commands with descriptions"
user_invocable: true
---

# Brain Help — Command Reference

ALL responses MUST be in Thai language.

Display this command reference to the user:

```
🧠 Brain Commands — คำสั่งทั้งหมด

━━━ ใช้บ่อย ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/brain <คำถาม>        ถามอะไรก็ได้ — ค้น brain ก่อน ถ้าไม่ครบอ่านจาก code
/brain-search <คำ>    ค้นหาความรู้จาก brain ด้วย keyword
/brain-explain <หัวข้อ> อธิบายระบบ/feature แบบละเอียด

━━━ จัดการความรู้ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/brain-save [หัวข้อ]   บันทึกความรู้ใหม่ (จากบทสนทนา หรือระบุหัวข้อ)
/brain-scan [folder]  สแกน codebase เก็บเข้า brain (ทั้งหมด หรือเฉพาะ folder)
/brain-update <หัวข้อ>  อัพเดท note ที่มีอยู่ให้ตรงกับโค้ดปัจจุบัน

━━━ ระบบ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/brain-load [project]  โหลดความรู้ก่อนเริ่มงาน (auto ตอน session start)
/brain-status          ตรวจ connection + สถิติจำนวนความรู้
/brain-howto           สอนวิธีใช้งานทีละขั้นตอน (ภาษาไทย)
```

Also display the Brain First data flow:
```
📊 Brain First Strategy:
   Brain (เร็ว) → Codebase (ถ้าไม่ครบ) → Save กลับ (ถ้ามีข้อมูลใหม่)
```
```

---

## 5. skills/brain-howto/SKILL.md — `/brain-howto`

```markdown
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
```

---

## 6. skills/brain-load/SKILL.md — `/brain-load`

```markdown
---
name: brain-load
description: "Load project knowledge from Graph Brain at session start. Auto-runs via hook, but can be called manually."
user_invocable: true
args: "[project-name or keyword] — default: current working directory name"
---

# Brain Load

ALL responses MUST be in Thai language.

## Steps

1. **Check connection**
   - Call `mcp__graph-brain__brain-stats`
   - If failed, ask user (in Thai):
     - [1] Retry connection
     - [2] Skip — work from codebase directly

2. **Search for project knowledge**
   - query = argument or basename of current working directory
   - Call `mcp__graph-brain__search-knowledge` query="{project}" limit=10
   - Call `mcp__graph-brain__search-by-tags` tags=["{project-name-lowercase}"]

3. **Load top notes**
   - Call `mcp__graph-brain__get-knowledge` for top 5 results
   - Priority order: architecture → workflow → data model → integrations → config

4. **Report to user (Thai)**
   - If found: list loaded notes with descriptions
   - If empty: suggest `/brain-scan` to populate

5. **Keep in context**
   - Retain loaded knowledge for use throughout the session
```

---

## 7. skills/brain-save/SKILL.md — `/brain-save`

```markdown
---
name: brain-save
description: "Save new knowledge to Graph Brain from current conversation analysis or specified topic"
user_invocable: true
args: "[topic] — if omitted, auto-detect from recent conversation"
---

# Brain Save

ALL responses MUST be in Thai language.

## Steps

1. **Determine what to save**
   - If argument provided → use as topic, analyze conversation for relevant info
   - If no argument → scan recent conversation for:
     - Code analysis results
     - Architecture discoveries
     - Workflow/business logic findings
     - Integration patterns
     - Database structures

2. **Check for duplicates**
   - Call `mcp__graph-brain__search-knowledge` query="{topic}" limit=3
   - If similar note exists, ask user (Thai):
     - [1] Update existing note
     - [2] Create new separate note
     - [3] Cancel

3. **Format knowledge**
   - title: "{ProjectName} - {Topic}" (short, descriptive)
   - content: Markdown with headers, tables, code blocks
   - Add `[[wiki links]]` to related existing notes
   - type: "permanent" (default)
   - tags: [project-name, topic-keywords...] (lowercase)
   - folderPath: `/projects/{project-name}/{category}/`
   - projectName: from working directory

4. **Save**
   - Call `mcp__graph-brain__save-knowledge`
   - Report result in Thai with title, tags, links

## Folder Categories
- `/projects/{name}/core/` — architecture, solution, infrastructure
- `/projects/{name}/workflow/` — business workflow, roles, states
- `/projects/{name}/database/` — connections, models, data access
- `/projects/{name}/integration/` — external APIs, notifications
- `/projects/{name}/frontend/` — UI, pages, components
```

---

## 8. skills/brain-scan/SKILL.md — `/brain-scan`

```markdown
---
name: brain-scan
description: "Deep codebase scanner — traces cross-layer dependencies (Page→Function→API→Entity), scans documents (.md, .docx), and saves interconnected knowledge to Graph Brain with relationship maps"
user_invocable: true
args: "[folder-path | --docs | --deps | --full] — scan specific folder, docs only, dependencies only, or everything"
---

# Brain Scan — Deep Codebase Scanner with Dependency Tracing

ALL responses MUST be in Thai language.

## Scan Modes

| Argument | Mode | What it does |
|----------|------|-------------|
| (none) | **Smart** (default) | Auto-detect: first scan or incremental |
| `folder-path` | Folder | Scan specific folder only |
| `--full` | Full | All 10 phases, ignore existing (recommended first time) |
| `--deps` | Dependencies | Phase 4 only — trace call chains |
| `--auth` | Authorization | Phase 5 only — permission matrix |
| `--docs` | Documents | Phase 8 only — scan .md, .docx, .txt |
| `--force` | Force Full | Re-scan everything, overwrite all existing notes |

## Smart Scan Strategy (Default Behavior) ⭐

When `/brain-scan` is called without flags, it automatically decides what to do:

### Step 1: Check existing brain state
```
Call mcp__graph-brain__search-knowledge query="{project-name}" limit=20
```

### Step 2: Classify situation

| Situation | How to Detect | Action |
|-----------|--------------|--------|
| **First scan** (brain empty) | 0 notes found for this project | Run full 10-phase scan |
| **Brain has data** (returning user) | 1+ notes found | Run incremental scan (see below) |
| **Different project** (reuse skill) | Notes found but for different project | Run full scan for new project |

### Step 3: Incremental Scan (brain already has data)

When brain already has knowledge for this project:

```
🧠 พบความรู้เดิมใน Brain: {N} ชิ้น สำหรับ {project-name}
   อัพเดทล่าสุด: {latest note date}

กำลังตรวจสอบว่ามีอะไรเปลี่ยนแปลง...
```

#### 3a: Detect changes since last scan
Use git to find what changed:
```bash
# Get files changed since last scan date
git log --since="{last_scan_date}" --name-only --pretty=format: | sort -u

# Get uncommitted changes
git diff --name-only
git diff --staged --name-only

# Get untracked new files
git ls-files --others --exclude-standard
```

If git is not available, fall back to file modification timestamps.

#### 3b: Classify changed files into scan phases
Map each changed file to which phase should re-run:

| Changed File Pattern | Re-run Phase |
|---------------------|-------------|
| *.sln, *.csproj, packages.config | Phase 2 (Architecture) |
| Web.config connection strings, appsettings.json | Phase 3 (Database) |
| *Context*, *.edmx, *Repository* | Phase 3 (Database) |
| *.aspx, *.aspx.vb/cs, *Controller* | Phase 4 (Dependencies) + Phase 5 (Auth) |
| *BasePage*, *MasterPage*, *Login*, *Auth* | Phase 5 (Authorization) |
| *Manager*, *Service* (business logic) | Phase 4 (Dependencies) + Phase 6 (Workflow) |
| *Mail*, *SMS*, *Notify*, *FTP* | Phase 7 (Integration) |
| *.md, *.docx, *.txt | Phase 8 (Documents) |
| Program.cs, Startup.cs, Global.asax | Phase 2 + 3 (Architecture + Config) |
| No changes detected | Skip scan, report "up to date" |

#### 3c: Run only affected phases
```
🧠 Smart Scan — ตรวจพบการเปลี่ยนแปลง:

📝 ไฟล์ที่เปลี่ยน: {N} ไฟล์ (ตั้งแต่ {last_scan_date})
   • SurveyerWeb/Checker/CarChecker.aspx.vb (modified)
   • Surveyer.Api.Report/Controllers/ReportController.cs (new)
   • docs/deployment-guide.md (modified)

🔄 Phases ที่ต้องรีสแกน:
   ✅ Phase 4: Dependencies (CarChecker.aspx changed)
   ✅ Phase 5: Authorization (CarChecker.aspx may have new auth)
   ✅ Phase 7: Integration (ReportController.cs — new API endpoint)
   ✅ Phase 8: Documents (deployment-guide.md changed)
   ⏭️ Phase 2, 3, 6: ข้ามได้ (ไม่มีไฟล์เปลี่ยน)

ดำเนินการ? [1] สแกนเฉพาะที่เปลี่ยน  [2] สแกนใหม่ทั้งหมด  [3] ยกเลิก
```

#### 3d: Update existing notes (not duplicate)
For each affected note:
- Search brain for existing note with same title
- Load existing content
- Re-scan the relevant files
- **Merge**: keep unchanged parts, update changed parts, add new parts
- Save with updated content + updated timestamp in note

#### 3e: Detect deleted/renamed files
```bash
git log --since="{last_scan_date}" --diff-filter=DR --name-only
```
- If a scanned page was deleted → mark the brain note as `[DELETED]` or remove
- If a file was renamed → update note references

### Step 4: Report incremental results
```
🧠 Smart Scan เสร็จสิ้น — {Project}

📊 สรุป:
   Notes อัพเดท:    {N} ชิ้น
   Notes สร้างใหม่:  {M} ชิ้น
   Notes ไม่เปลี่ยน:  {K} ชิ้น (ข้ามแล้ว)
   ไฟล์ที่ตรวจ:     {F} ไฟล์ (จาก {total} ที่เปลี่ยน)

📝 สิ่งที่อัพเดท:
   • [Updated] Surveyer - Dependency Map: Checker Workflow
     └─ CarChecker.aspx: เพิ่ม new upload field
   • [New] Surveyer - Dependency Map: Report API
     └─ ReportController.cs: new endpoint GET /api/report/daily-avg
   • [Updated] Surveyer - Documentation Index
     └─ deployment-guide.md: updated deployment steps
```

## Scan Modes — Detailed Behavior Matrix

| Scenario | Default `/brain-scan` | `--full` | `--force` |
|----------|----------------------|----------|-----------|
| Brain empty (first time) | Full 10-phase scan | Same | Same |
| Brain has data, no code changes | Report "up to date", skip | Full re-scan, skip unchanged | Full re-scan, overwrite all |
| Brain has data, some files changed | Incremental (affected phases only) | Full re-scan, skip unchanged | Full re-scan, overwrite all |
| Brain has data, major restructure | Incremental (may miss things) | Full re-scan (recommended) | Full re-scan, overwrite all |
| Different project (new codebase) | Full 10-phase scan | Same | Same |
| `/brain-scan folder` | Scan folder, update/create notes | Scan folder full | Scan folder, overwrite |

## Cross-Project Support

When using this skill on a **different project** than what's in brain:

1. Detect project name from working directory
2. Search brain → notes found are for different project
3. Treat as "first scan" for the new project
4. Save with new projectName and folderPath
5. **Never overwrite** notes from other projects

```
🧠 Brain มีความรู้ของ project อื่น:
   • Surveyer (17 notes)
   • NewProject (0 notes) ← project ปัจจุบัน

จะสแกน NewProject เป็นครั้งแรก — ไม่กระทบข้อมูล Surveyer
ดำเนินการ? [1] สแกน  [2] ยกเลิก
```

## Execution Phases

### Phase 1: Pre-flight Check
- Call `mcp__graph-brain__brain-stats` to verify connection
- If failed → offer retry or cancel (never block)
- Detect project type from files: .sln (.NET), package.json (Node), *.csproj, etc.
- Run Smart Scan Strategy (check existing brain state + git changes)
- Count files to estimate scan time, confirm with user if large

### Phase 2: Architecture Scan (Agent 1)
**Goal:** Solution structure, project list, technology stack

Scan patterns:
```
*.sln, *.csproj, *.vbproj     → project list, references, target framework
packages.config, *.deps.json   → NuGet packages, versions
package.json, node_modules     → npm packages (if any)
Global.asax, Program.cs        → app startup, DI registration
Startup.cs, WebApiConfig.cs    → middleware, routing config
```

Output note: `{Project} - Solution Structure`
- All projects with type, language, framework
- Inter-project references (which project depends on which)
- Key package versions

### Phase 3: Database & Data Layer Scan (Agent 2)
**Goal:** Connections, models, entities, repositories, views

Scan patterns:
```
Web.config, appsettings.json   → connection strings, DB servers
*Context*.cs, *Context*.vb     → DbContext classes, DbSets
*.edmx                         → EF6 EDMX models (extract entity list)
*Repository*, *UnitOfWork*     → data access patterns, methods
*Migration*                    → DB migration history
```

Output notes:
- `{Project} - Database Connections` — servers, credentials, connection names
- `{Project} - Entity Models` — all entities with key properties, relationships
- `{Project} - Data Access Patterns` — repository methods, query patterns

### Phase 4: Dependency Tracing (Agent 3 + 4) ⭐ KEY FEATURE
**Goal:** Map cross-layer call chains from UI → Business Logic → API → Data → Entity

#### Step 4a: Identify entry points
Scan for UI pages / API endpoints:
```
*.aspx, *.aspx.vb, *.aspx.cs  → Web Forms pages
*.cshtml, *.razor              → MVC/Razor pages
*Controller*.cs                → API controllers
*.master                       → Master pages (role routing)
*.asmx                         → SOAP web services
Route handlers, endpoints      → API routes
```

#### Step 4b: Trace call chains FROM each entry point
For each page/endpoint, trace the call chain:

```
[Page/Endpoint]
  └─→ calls [Function/Method in code-behind]
       └─→ calls [Service/Manager class.Method()]
            └─→ calls [Repository/UnitOfWork.Method()]
                 └─→ accesses [Entity/Table/View/StoredProc]
                      └─→ connects to [Database via ConnectionString]
```

**Tracing technique:**
1. Read the page code-behind (.aspx.vb / .aspx.cs)
2. Find method calls: `manager.XXX()`, `service.XXX()`, `unit.XXX.Method()`
3. Follow to the manager/service class → read that method
4. Find DB calls: `_context.XXX`, `repository.XXX`, SQL queries
5. Identify entities/tables accessed
6. Note which connection string is used

#### Step 4c: Build dependency maps
Create relationship maps per page/feature:

```
Example: JobAssignment.aspx
├── Code-behind: JobAssignment.aspx.vb
│   ├── calls: SurveryerManager.SetAssignmentJob()
│   │   ├── writes: Job (SurveyerID, AssignmentDate, WorkflowID)
│   │   ├── inserts: JobFlow (workflow transition)
│   │   └── calls: SurveyerServerSignal.AssignJob() [SignalR]
│   ├── calls: MailManager.SendPOMail()
│   │   └── sends: Email via mail.skplus.co.th:587
│   ├── calls: SMSManage.Send()
│   │   └── sends: SMS via smartcomm2.net
│   └── reads: vwJob, Employee (filtered by Amphur)
├── Connection: SK_SURVEYER via SurveyerCloud@172.16.0.2
└── Auth: JobBasePage.IsAuthorize() [Admin/CallCenter/Supervisor]
```

#### Step 4d: Cross-reference and group
Group dependencies by:
- **By Feature/Workflow** — all pages in a workflow step
- **By Entity** — which pages read/write each table
- **By Service** — which pages call each manager method
- **By Database** — which features use which DB

Output notes:
- `{Project} - Dependency Map: {Feature}` — per feature/workflow
- `{Project} - Entity Usage Map` — which pages touch which entities
- `{Project} - Service Call Map` — manager/service method → callers

### Phase 5: Authorization & Permission Matrix (Agent 5) ⭐ KEY FEATURE
**Goal:** Build complete permission matrix — every page, every API, every function mapped to roles

This phase answers: "หน้านี้ทำอะไร? ทำไมเข้าใช้งานไม่ได้? ต้องมีสิทธิ์อะไร?"

#### Step 5a: Discover all roles in the system
Scan for role definitions:
```
*Enum*Role*, *RolePermission*  → role enums (Insurance=1, Checker=2, etc.)
*Login*.aspx.vb/cs             → login routing logic (which role → which page)
Web.config <authorization>     → folder-level allow/deny rules
*Membership*, *Identity*       → ASP.NET role provider config
SecurityRole table/entity      → DB-defined roles
*BasePage* role checks         → code-level role validation
```

Output: Complete role list with:
- Role name
- Role ID/enum value
- Login redirect target
- Master page used
- Description of what this role does

#### Step 5b: Scan page-level authorization
For EVERY page (.aspx, .cshtml, controller action), extract:

```
[Page/Endpoint]
├── Auth Method: how is access controlled?
│   ├── BasePage class: JobBasePage / ManagerBasePage / AgentBasePage / CheckerBasePage
│   ├── IsAuthorize() logic: which roles allowed, which redirected
│   ├── Web.config <location> rules: allow/deny per path
│   ├── [Authorize] attribute: role requirements (MVC/API)
│   ├── OWIN/JWT auth: token validation logic
│   └── Custom checks: Session["EmployeeRole"], Roles.GetRolesForUser()
│
├── Allowed Roles: [list of roles that CAN access]
├── Denied Roles: [list of roles that are BLOCKED/REDIRECTED]
├── Redirect On Deny: where unauthorized users go
│
├── Data Filtering by Role:
│   ├── Insurance filter: InsuranceUserList (Agent sees only their companies)
│   ├── Branch filter: BranchIDList (Manager sees only their branches)
│   ├── Employee filter: EmployeeList (filtered by branch)
│   └── Date filter: AuthorizeJobDatePeriod() (non-admin: 3-month limit)
│
└── Special Conditions:
    ├── Must own the resource? (e.g., Checker can only see assigned jobs)
    ├── Workflow state required? (e.g., page only works at AssignmentStep)
    └── Additional permission checks (EmployeeInsurancePermission, etc.)
```

#### Step 5c: Scan API-level authorization
For EVERY API endpoint (.asmx methods, API controllers, web services):

```
[API Endpoint]
├── Auth Type: None / Token / Basic / OAuth / Custom
│   ├── Anonymous: no auth required (public)
│   ├── Token code: hardcoded token validation (e.g., "skpluscoth")
│   ├── Basic Auth: username/password in header
│   ├── OAuth Bearer: OWIN token with role claims
│   ├── JWT Bearer: token with UserId/role claims
│   └── Forms Auth: ASP.NET membership cookie
│
├── Who Can Call:
│   ├── Internal only (same server)
│   ├── External systems (724 API, Srikrung, Lucky)
│   ├── Mobile app (field surveyors)
│   └── Any authenticated user
│
├── Data Access Control:
│   ├── Does it verify ownership? (SurveyerID matches token user?)
│   ├── Does it check workflow state? (WorkflowId must be X?)
│   └── Does it filter by role-based permissions?
│
└── Credentials: where are credentials configured?
```

#### Step 5d: Build Permission Matrix
Create comprehensive matrix:

```
Example output:

📄 {Project} - Permission Matrix: Web Pages

| Page | Path | Allowed Roles | Denied/Redirect | Auth Method | Data Filter |
|------|------|--------------|-----------------|-------------|-------------|
| SurveyerLogin | ~/SurveyerLogin.aspx | Anonymous | - | None | - |
| Default (Dashboard) | ~/Default.aspx | Admin, CallCenter, Supervisor, Accounting | Checker→~/Checker, Insurance→~/Agent, Manager→~/Manager | MasterPage.IsAuthenticated + role check | Dynamic menu by role |
| JobList | ~/JobList.aspx | Admin, CallCenter, Supervisor | Insurance, Checker, Manager → redirected | JobBasePage.IsAuthorize() | InsuranceUserList, 3-month date limit (non-admin) |
| JobAssignment | ~/JobAssignment.aspx | Admin, CallCenter, Supervisor | Insurance, Checker, Manager → redirected | JobBasePage.IsAuthorize() | InsuranceUserList |
| JobChecker | ~/Checker/JobChecker.aspx | Checker, Surveyor | All others → redirected | CheckerMasterPage | Own jobs only (GetDataByChecker) |
| CarChecker | ~/Checker/CarChecker.aspx | Checker, Surveyor | All others → redirected | CheckerMasterPage | Own assigned jobs only |
| AgentJobList | ~/Agent/AgentJobList.aspx | Insurance (Agent) | All others → redirected | AgentMasterPage | InsuranceList filter, 6-month lookback |
| ManagerDefault | ~/Manager/ManagerDefault.aspx | Manager | All others → redirected | ManagerMasterPage | BranchIDList filter |
| ManagerJobInfo | ~/Manager/ManagerJobInfo.aspx | Manager | All others → redirected | ManagerBasePage | BranchIDList + IsJobAccess(branchid) |
| SrikrungJobList | ~/Srikrung/SrikrungJobList.aspx | Anonymous (Monitor) | - | No auth required | AppNo LIKE 'MM%' |
| JSZJobList | ~/724/JSZJobList.aspx | Anonymous (Monitor) | - | Custom auth page | AppNo LIKE '7M%' |
| BillManage | ~/Financial/BillManage.aspx | Admin, Accounting | Others → redirected | JobBasePage.IsAuthorize() | - |

📄 {Project} - Permission Matrix: API Endpoints

| Endpoint | Method | Auth Type | Who Can Call | Ownership Check |
|----------|--------|-----------|-------------|-----------------|
| POST /api/TransferJob | REST | OAuth Bearer (1200-day token) | Lucky Leasing (external) | No |
| POST /api/documents | REST | JWT Bearer (60min) | Field Surveyors (mobile) | Yes (SurveyerID must match) |
| GET /api/report/* | REST | Basic Auth | Internal dashboard | No |
| RegisterLocation | SOAP | Token "skpluscoth" | Mobile app (GPS) | No |
| TransferJobLucky | SOAP | None (Forms Auth) | Lucky Leasing | No |
| SurveyerService.* | SOAP | Forms Auth cookie | SurveyerWeb JS | Session-based |
| SurveyerTransferService.* | SOAP | None (public path in web.config) | External transfer apps | No |

📄 {Project} - Permission Matrix: Role Details

| Role | ID | Login Target | Master Page | Can Access | Cannot Access | Data Scope |
|------|----|-------------|-------------|------------|---------------|------------|
| Administrator | 5 | ~/Default.aspx | MasterPage | Everything | - | All data, no date limit |
| CallCenter | 3 | ~/Default.aspx | MasterPage | JobList, JobAppointment, JobAssignment | Checker pages, Manager pages, Agent pages | InsuranceUserList, 3-month limit |
| Supervisor | - | ~/Default.aspx | MasterPage | Same as CallCenter | Same as CallCenter | Same as CallCenter |
| Accounting | - | ~/Default.aspx | MasterPage | Financial pages, Reports | Checker, Manager, Agent pages | - |
| Insurance | 1 | ~/Agent/AgentJobList.aspx | AgentMasterPage | Agent folder only | All root, Checker, Manager, Financial | Own insurance companies, 6-month lookback |
| Manager | 4 | ~/Manager/ManagerDefault.aspx | ManagerMasterPage | Manager folder only | All root, Checker, Agent, Financial | Own branches only (BranchIDList) |
| Checker | 2 | ~/Checker/JobChecker.aspx | CheckerMasterPage | Checker folder only | All root, Agent, Manager, Financial | Own assigned jobs only |
| Surveyor | 2 | ~/Checker/JobChecker.aspx | CheckerMasterPage | Same as Checker | Same as Checker | Same as Checker |
```

#### Step 5e: Build "Why Can't I Access?" Troubleshooting Map
For each page, document the complete chain of checks a request goes through:

```
Example: Why can't user X access JobAssignment.aspx?

Check 1: Is user authenticated?
  NO → Redirect to ~/SurveyerLogin.aspx
  YES → continue

Check 2: MasterPage.master.vb Page_Load
  Is role = Checker? → Redirect to ~/Checker/CarChecker.aspx
  Is role = Insurance? → Redirect to ~/Agent/AgentJobList.aspx
  Is role = Manager? → Redirect to ~/Manager/ManagerDefault.aspx
  Is role = Admin/CallCenter/Supervisor? → continue

Check 3: JobBasePage.IsAuthorize()
  Is role = Insurance? → Redirect to ~/Agent/AgentJobList.aspx
  Is role = Checker/Surveyor? → Redirect to ~/Checker/JobChecker.aspx
  Is role = Manager? → Redirect to ~/Manager/ManagerDefault.aspx
  Is role = Admin/CallCenter/Supervisor? → ALLOWED

Check 4: Data filtering
  Non-admin? → Only sees jobs from last 3 months
  Has InsurancePermission? → Only sees permitted insurance companies
```

Output notes:
- `{Project} - Permission Matrix: Web Pages` — every page with roles, filters, redirects
- `{Project} - Permission Matrix: API Endpoints` — every API with auth type, callers, checks
- `{Project} - Permission Matrix: Role Details` — every role with full access map
- `{Project} - Access Troubleshooting Map` — per-page auth chain for debugging "why can't I access"
- `{Project} - Data Scope by Role` — what data each role can see (insurance filter, branch filter, date limit)

### Phase 6: Workflow & Business Logic Scan (Agent 6)
**Goal:** State machines, business rules, status transitions

Scan patterns:
```
*Enum*, *Constant*, *Step*     → workflow states, status codes
*Flow*, *Workflow*             → state transitions
*Manager*.vb/cs                → business rule methods
```

Output notes:
- `{Project} - Workflow States` — state machine with transitions
- `{Project} - Business Rules` — key business logic per feature

### Phase 7: Integration & Infrastructure Scan (Agent 7)
**Goal:** External APIs, notifications, file storage, servers

Scan patterns:
```
*Service*.asmx, *Controller*   → API endpoints exposed
HttpClient, WebRequest, REST   → external API calls
*Mail*, *SMS*, *Notify*        → notification systems
*FTP*, *Upload*, *Storage*     → file operations
*Config*, *Setting*            → infrastructure config
```

Output notes:
- `{Project} - API Endpoints` — all internal APIs with routes, auth
- `{Project} - External Integrations` — external API URLs, credentials
- `{Project} - Notification Systems` — email, SMS, Line, SignalR
- `{Project} - File Storage` — paths, naming conventions

### Phase 8: Document Scan (Agent 8)
**Goal:** Extract knowledge from project documentation files

Scan ALL documentation files in project:
```
**/*.md                        → Markdown docs (README, CHANGELOG, guides)
**/*.docx                      → Word documents (specs, requirements, manuals)
**/*.txt                       → Text files (changelogs, notes, logs)
**/*.pdf                       → PDF documents (read with PDF tool)
**/*.xlsx, **/*.csv            → Data files (if they contain schema/mapping info)
**/docs/**, **/documentation/** → Documentation folders
*CLAUDE.md, *AGENTS.md         → AI assistant instructions
*.log, *Log*.txt, *ChangLog*   → Change history, known issues
```

**For each document found:**
1. Read the file content
2. Extract key information:
   - Purpose of the document
   - Business rules or requirements described
   - Technical specifications
   - API documentation
   - Database schema descriptions
   - Deployment instructions
   - Known issues or limitations
3. Determine if it adds knowledge not already captured in code scan
4. Save as brain note if it contains unique information

Output notes:
- `{Project} - Documentation Index` — list of all docs with purposes
- `{Project} - Requirements: {topic}` — per significant requirement doc
- `{Project} - Deployment Guide` — if deployment docs found

## Phase 9: Cross-Reference & Link Building

After all agents complete:

1. **Build master index**
   - Collect all notes created/updated across phases
   - Identify relationships between notes

2. **Add [[wiki links]]**
   - Link entity notes ↔ dependency maps
   - Link workflow notes ↔ page dependency maps
   - Link permission matrix ↔ dependency maps (same pages)
   - Link role details ↔ workflow states (which role does which step)
   - Link API auth ↔ integration notes
   - Link document notes ↔ relevant code notes

3. **Create summary note**
   Save `{Project} - Knowledge Map (Auto-generated)`:
   ```markdown
   ## Knowledge Map
   Generated: {date}
   Total notes: {count}

   ### By Category
   📦 core/ — {N} notes
   📦 database/ — {N} notes
   📦 dependencies/ — {N} notes
   📦 permissions/ — {N} notes ⭐
   📦 workflow/ — {N} notes
   📦 integration/ — {N} notes
   📦 documents/ — {N} notes

   ### Key Highlights
   - {N} pages/endpoints traced with full dependency chains
   - {N} roles mapped with complete permission matrix
   - {N} pages with access control documented
   - {N} API endpoints with auth requirements
   - {N} entities/tables mapped to pages
   - {N} documents indexed

   ### Quick Links
   - [[{Project} - Solution Structure]]
   - [[{Project} - Permission Matrix: Web Pages]]
   - [[{Project} - Permission Matrix: Role Details]]
   - [[{Project} - Access Troubleshooting Map]]
   - [[{Project} - Workflow States]]
   - [[{Project} - Entity Usage Map]]
   - [[{Project} - Documentation Index]]
   ```

## Phase 10: Report Results (Thai)

```
🧠 Brain Scan เสร็จสิ้น — {Project}

⏱️ สแกน: {elapsed time}
📊 สรุป:
   สร้างใหม่: {N} ชิ้น
   อัพเดท:    {M} ชิ้น
   เอกสาร:   {D} ไฟล์ indexed

📦 ความรู้ที่เก็บ:
├── 🏗️ core/ — Solution, Architecture
├── 🗄️ database/ — Connections, Entities, Data Access
├── 🔗 dependencies/ — Page→Function→API→Entity maps
├── 🔒 permissions/ — Role Matrix, Page Auth, API Auth, Troubleshooting ⭐
├── 🔄 workflow/ — States, Business Rules
├── 🌐 integration/ — APIs, Notifications, File Storage
└── 📄 documents/ — .md, .docx, .txt indexed

🔒 Permission Highlights:
   Roles: {N} roles พบ
   Pages: {N} pages mapped กับสิทธิ์
   APIs:  {N} endpoints mapped กับ auth

   ตัวอย่าง:
   • JobAssignment.aspx → [Admin, CallCenter, Supervisor] ✅ | [Checker, Insurance, Manager] ❌
   • POST /api/documents → JWT Bearer, ต้องเป็น Surveyor ที่ได้รับมอบหมาย

🔗 Dependency Highlights:
   {top 5 most connected pages/entities}

💡 ถัดไป:
   /brain ทำไมเข้า JobList ไม่ได้    ← ถาม permission ได้เลย
   /brain checker เข้าหน้าไหนได้บ้าง  ← ดูสิทธิ์ตาม role
   /brain-explain billing             ← อธิบายแบบละเอียด
   /brain-search JobAssignment        ← ค้นหา dependency map
```

## Deduplicate Strategy
Before saving each note:
- Search brain for existing note with same title
- If found → compare content, update if changed, skip if identical
- If not found → create new
- Track: created / updated / skipped counts

## Folder Categories for Saved Notes
```
/projects/{name}/core/          — architecture, solution, infrastructure
/projects/{name}/database/      — connections, entities, models, views
/projects/{name}/dependencies/  — dependency maps, call chains, entity usage
/projects/{name}/permissions/   — ⭐ role matrix, page auth, API auth, troubleshooting
/projects/{name}/workflow/      — states, business rules
/projects/{name}/integration/   — external APIs, notifications, file storage
/projects/{name}/documents/     — indexed documentation files
```

## Scan Pattern Reference

### Code Files
| Pattern | Extracts |
|---------|----------|
| *.sln, *.csproj, *.vbproj | Solution structure, project references |
| Web.config, appsettings.json | Connections, settings, auth |
| *Context*.cs/vb, *.edmx | Database models, DbSets, entities |
| *Controller*, *ApiController* | API endpoints, routes |
| *Service*, *Manager* | Business logic methods |
| *Repository*, *UnitOfWork* | Data access, queries |
| *.aspx, *.aspx.vb/cs | Web pages, code-behind |
| *.master, *MasterPage* | Role-based UI routing |
| *.asmx | SOAP web services |
| *Login*, *Auth*, *Security* | Authentication logic |
| *Flow*, *Workflow*, *Step*, *Enum* | State machines |
| *Mail*, *SMS*, *Notify*, *Signal* | Notification systems |
| *FTP*, *Upload*, *Storage*, *Image* | File operations |
| Program.cs, Startup.cs, Global.asax | App startup, DI |

### Document Files
| Pattern | Type |
|---------|------|
| **/*.md | Markdown documentation |
| **/*.docx | Word documents (specs, requirements) |
| **/*.txt | Text files (changelogs, notes) |
| **/*.pdf | PDF documents |
| **/docs/**, **/documentation/** | Documentation folders |
| *CLAUDE.md, *AGENTS.md | AI assistant instructions |
| *ChangLog*, *Log*.txt | Change history |
| *.xlsx (non-data) | Schema/mapping documentation |
```

---

## 9. skills/brain-search/SKILL.md — `/brain-search`

```markdown
---
name: brain-search
description: "Search Graph Brain by keyword or tags with multi-strategy fallback"
user_invocable: true
args: "<keyword or question>"
---

# Brain Search

ALL responses MUST be in Thai language.

## Steps

1. **Check connection** — if failed, inform user

2. **Multi-strategy search**
   - Primary: `mcp__graph-brain__search-knowledge` query="{keyword}" limit=10
   - If few results: `mcp__graph-brain__search-by-tags` with extracted tags
   - If still few: `mcp__graph-brain__find-similar` from closest match

3. **Load top results**
   - Call `mcp__graph-brain__get-knowledge` for top 3-5 matches

4. **Display results (Thai)**
   - Numbered list with title, description, tags
   - Brief summary of what was found
   - If nothing found → suggest `/brain-scan` or try different keywords
```

---

## 10. skills/brain-update/SKILL.md — `/brain-update`

```markdown
---
name: brain-update
description: "Update existing Graph Brain knowledge to match current codebase state"
user_invocable: true
args: "<note-title or keyword>"
---

# Brain Update

ALL responses MUST be in Thai language.

## Steps

1. **Find note to update**
   - Search with argument keyword
   - Show matches, let user pick (or auto-select if exact match)

2. **Load existing note**
   - `mcp__graph-brain__get-knowledge` noteId="{id}"

3. **Compare with current code**
   - Read related files mentioned in note content
   - Identify: changed parts, outdated info, missing new info

4. **Update**
   - `mcp__graph-brain__save-knowledge` with same title (overwrites)
   - Update content, tags, description as needed

5. **Report changes (Thai)**
   - List what changed, what was added, what was removed
```

---

## 11. skills/brain-status/SKILL.md — `/brain-status`

```markdown
---
name: brain-status
description: "Check Graph Brain connection status and show knowledge statistics"
user_invocable: true
---

# Brain Status

ALL responses MUST be in Thai language.

## Steps

1. **Test connection**
   - Call `mcp__graph-brain__brain-stats`

2. **If connected** — show:
   - Connection status: Connected
   - Total notes count
   - Top tags
   - Notes matching current project
   - Available commands reminder

3. **If failed** — show:
   - Connection status: Failed
   - Possible causes (MCP server not running, network, config)
   - Options: [1] Retry  [2] Skip and work from codebase
   - Hint: `claude mcp list` to check active MCP servers
```

---

## 12. skills/brain-explain/SKILL.md — `/brain-explain`

```markdown
---
name: brain-explain
description: "Deep explanation of a system, feature, or workflow from brain knowledge + codebase if needed"
user_invocable: true
args: "<topic> — e.g., 'checker workflow', 'billing system', 'data import'"
---

# Brain Explain

ALL responses MUST be in Thai language.

## Difference from `/brain`
- `/brain` = quick answer, concise
- `/brain-explain` = deep analysis with diagrams, tables, code references, full context

## Steps

1. **Search brain extensively**
   - `mcp__graph-brain__search-knowledge` query="{topic}" limit=10
   - Load top 5 results with `get-knowledge`
   - Follow ALL `[[wiki links]]` to load connected notes (max 3 hops)
   - Use `mcp__graph-brain__explore-graph` for relationship discovery

2. **Evaluate completeness**
   - Complete → synthesize from brain only
   - Partial → supplement from codebase
   - Empty → full codebase analysis

3. **Read codebase if needed**
   - Use Explore agent for thorough investigation
   - Focus on gaps not covered by brain

4. **Present deep explanation (Thai)**
   Include ALL of these where relevant:
   - Overview summary
   - Flow diagram (text-based)
   - Role/page/action table
   - State machine / workflow transitions
   - Database tables involved
   - Code snippets for key logic
   - Source labels: `[Brain]` vs `[Code]`
   - Related topics to explore further

5. **Offer to save new findings**
   If codebase was read → offer `/brain-save`
```

---

## Design Principles

### Brain First Strategy (core behavior of `/brain`)
```
User asks question
       ↓
┌──────────────────────────┐
│ 1. Search Brain          │  ← Fast, contextual, cross-session memory
│    search-knowledge      │
│    search-by-tags        │
│    get-knowledge (top 5) │
│    follow [[wiki links]] │
└───────────┬──────────────┘
            │ evaluate: complete? partial? empty?
            │
    ┌───────┴───────┐
    │ Complete      │ Partial / Empty
    │ → respond     │     ↓
    └───────────────┘ ┌──────────────────────────┐
                      │ 2. Read Codebase         │  ← Slower, but always up-to-date
                      │    Explore agent          │
                      │    or direct file reads   │
                      │    Focus on GAPS only     │
                      └───────────┬──────────────┘
                                  │ new info found?
                                  │
                          ┌───────┴───────┐
                          │ Yes           │ No
                          │     ↓         │ → respond
                          │ ┌─────────────┴──┐
                          │ │ 3. Offer Save  │  ← For next session
                          │ │    /brain-save │
                          │ └────────────────┘
                          │     ↓
                          └─→ respond
```

### Connection Failure (all commands)
```
Brain unreachable?
  → Inform user immediately (Thai)
  → Offer: [1] Retry  [2] Skip
  → NEVER block session
  → If skip: work from codebase directly
```

### Language Rules
```
Skill content:     English (reduce token usage)
All responses:     Thai (user's language)
Note titles:       "{ProjectName} - {Topic}" (English or Thai, match project convention)
Note content:      Match project's primary language
Tags:              English lowercase
```

### Knowledge Structure
```
Title:      "{ProjectName} - {Topic}"
Tags:       [project-name, topic, subtopic, ...]
FolderPath: /projects/{project-name}/{category}/
Type:       permanent (default)
Content:    Markdown + [[wiki links]]

Categories: core/, workflow/, database/, integration/, frontend/
```

### MCP Tools Reference

| Tool | Used By |
|------|---------|
| `mcp__graph-brain__brain-stats` | brain-status, brain-load, all (connection check) |
| `mcp__graph-brain__search-knowledge` | brain, brain-search, brain-load, brain-save, brain-explain |
| `mcp__graph-brain__search-by-tags` | brain, brain-search (fallback) |
| `mcp__graph-brain__find-similar` | brain-search (deep fallback) |
| `mcp__graph-brain__get-knowledge` | brain, brain-load, brain-search, brain-explain, brain-update |
| `mcp__graph-brain__save-knowledge` | brain-save, brain-scan, brain-update |
| `mcp__graph-brain__list-tags` | brain-status |
| `mcp__graph-brain__explore-graph` | brain-explain (follow relationships) |

---

## Quick Reference Card

```
━━━ ถามข้อมูล (Brain First) ━━━━━━━━━━━━━━━━━━━━━
/brain <คำถาม>          ถามอะไรก็ได้ — brain ก่อน, code ถ้าไม่ครบ
/brain-search <คำ>      ค้นหาจาก brain ด้วย keyword
/brain-explain <หัวข้อ>   อธิบายแบบละเอียดพร้อม diagram

━━━ จัดการความรู้ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/brain-save [หัวข้อ]     บันทึกความรู้ใหม่
/brain-scan              Smart Scan — auto: full (ครั้งแรก) หรือ incremental (มีข้อมูลแล้ว)
/brain-scan --full       สแกน 10 phases ครบ (แนะนำครั้งแรก / เปลี่ยนเยอะ)
/brain-scan --force      สแกนใหม่ทั้งหมด overwrite notes เดิม
/brain-scan --deps       trace เฉพาะ dependency chains
/brain-scan --auth       สแกนเฉพาะ permission matrix (role/page/API)
/brain-scan --docs       สแกนเฉพาะเอกสาร .md .docx .txt
/brain-scan folder       สแกนเฉพาะ folder
/brain-update <หัวข้อ>    อัพเดท note ที่มีอยู่

━━━ ระบบ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/brain-load [project]   โหลดความรู้ (auto ตอน startup)
/brain-status           ตรวจ connection + สถิติ
/brain-help             แสดงคำสั่งทั้งหมด
/brain-howto [command]  สอนวิธีใช้งาน (ภาษาไทย)
```

## Dependency Map Example (from Phase 4 + 5)

`/brain-scan` traces full call chains AND permission checks:

```
Example output saved to brain:

📄 Surveyer - Dependency Map: Job Assignment

JobAssignment.aspx (UI Layer)
│
│ 🔒 ACCESS CONTROL:
│ ├─ Base: JobBasePage.IsAuthorize()
│ ├─ ✅ Allowed: Administrator, CallCenter, Supervisor
│ ├─ ❌ Blocked: Insurance → ~/Agent/AgentJobList.aspx
│ ├─ ❌ Blocked: Checker/Surveyor → ~/Checker/JobChecker.aspx
│ ├─ ❌ Blocked: Manager → ~/Manager/ManagerDefault.aspx
│ ├─ 📊 Data Filter: InsuranceUserList (sees only permitted insurance)
│ ├─ 📊 Date Filter: non-admin = last 3 months only
│ └─ MasterPage: MasterPage.master (dynamic menu by role)
│
├─→ JobAssignment.aspx.vb (Code-Behind)
│   │
│   ├─→ SurveryerManager.SetAssignmentJob() (Business Logic)
│   │   ├─ writes: Job.SurveyerID, Job.SurveyerBranchID, Job.AssignmentDate
│   │   ├─ writes: Job.WorkflowID = AssignmentStep
│   │   ├─ inserts: JobFlow (audit trail)
│   │   └─ calls: SurveyerServerSignal.AssignJob() [SignalR]
│   │
│   ├─→ MailManager.SendPOMail() (Notification)
│   │   └─ sends: SMTP mail.skplus.co.th:587
│   │
│   ├─→ SMSManage.Send() (Notification)
│   │   └─ sends: POST smartcomm2.net/SendMessage
│   │
│   └─→ reads: vwJob, Employee (filtered by AmphurID + BranchID)
│
├─ Database: SK_SURVEYER @ 172.16.0.2
│
└─ Triggers next step:
   → Checker sees job in JobChecker.aspx (WorkflowID=AssignmentStep)
```

```
Example: ถามว่า "ทำไม Manager เข้า JobAssignment ไม่ได้"

🔒 Access Chain สำหรับ JobAssignment.aspx:

  ① MasterPage.master.vb → ตรวจ IsAuthenticated → ✅ ผ่าน
  ② MasterPage.master.vb → role=Manager → ❌ Redirect ไป ~/Manager/ManagerDefault.aspx
     ⛔ หยุดที่ขั้นตอนนี้ — Manager ไม่ถึง JobBasePage.IsAuthorize()

สาเหตุ: MasterPage จะ redirect Manager ไปหน้า Manager โดยตรง
         ก่อนที่ JobBasePage จะได้ตรวจสิทธิ์

ทางแก้:
  • Manager ต้องใช้ ~/Manager/ManagerJobList.aspx แทน
  • หรือต้องเปลี่ยน role เป็น Admin/CallCenter/Supervisor
```
