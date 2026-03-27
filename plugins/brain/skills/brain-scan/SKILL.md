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

## Smart Scan Strategy (Default Behavior)

When `/brain-scan` is called without flags, it automatically decides what to do:

### Step 1: Check existing brain state
```
Call mcp__graph-brain__search-knowledge query="{project-name}" limit=20
```

### Step 2: Classify situation

| Situation | How to Detect | Action |
|-----------|--------------|--------|
| **First scan** (brain empty) | 0 notes found for this project | Run full 10-phase scan |
| **Brain has data** (returning user) | 1+ notes found | Run incremental scan |
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
git log --since="{last_scan_date}" --name-only --pretty=format: | sort -u
git diff --name-only
git diff --staged --name-only
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

🔄 Phases ที่ต้องรีสแกน:
   ✅ Phase 4: Dependencies (changed files)
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

## Activity Logging

Every brain-scan MUST write activity logs to `.brain/activity-log.json` at project root.

### Log file setup
- If `.brain/` directory doesn't exist → create it
- If `.brain/activity-log.json` doesn't exist → create with empty array `[]`
- Add `.brain/` to `.gitignore` if not already there

### Log entries to write

**On scan START** (after Phase 1 pre-flight):
```json
{
  "timestamp": "<ISO 8601 UTC>",
  "session_id": "<use $CLAUDE_SESSION_ID or generate date-based ID>",
  "command": "brain-scan",
  "args": "<raw args: --full, --docs, folder-path, etc.>",
  "project": "<project-name from cwd>",
  "status": "started",
  "details": {
    "scan_mode": "smart|full|incremental|folder|docs|deps|auth|force",
    "phases_planned": [1,2,3],
    "existing_notes": "<N notes found in pre-flight>",
    "files_changed": "<N files from git diff, or null if first scan>"
  }
}
```

**On scan COMPLETE** (after Phase 10 report):
```json
{
  "timestamp": "<ISO 8601 UTC>",
  "session_id": "<same session_id>",
  "command": "brain-scan",
  "args": "<same args>",
  "project": "<project-name>",
  "status": "completed",
  "details": {
    "scan_mode": "smart|full|incremental|folder|docs|deps|auth|force",
    "phases_run": [1,2,3,4,5,6,7,8,9,10],
    "notes_created": "<N>",
    "notes_updated": "<M>",
    "notes_skipped": "<K identical>",
    "elapsed": "<human readable e.g. 4m 32s>"
  }
}
```

**On scan FAILED/CANCELLED**:
```json
{
  "timestamp": "<ISO 8601 UTC>",
  "session_id": "<same>",
  "command": "brain-scan",
  "project": "<project-name>",
  "status": "failed|cancelled",
  "details": {
    "reason": "<error message or 'user cancelled'>",
    "phase_reached": "<last completed phase number>"
  }
}
```

### How to write log entries
Use Bash to append to the JSON array:
```bash
# Read existing log, append new entry, write back
# If file is empty or missing, start with []
```
Or use the Write/Edit tool to append the entry to the array.

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

### Phase 3: Database & Data Layer Scan (Agent 2)
**Goal:** Connections, models, entities, repositories, views

Scan patterns:
```
Web.config, appsettings.json   → connection strings, DB servers
*Context*.cs, *Context*.vb     → DbContext classes, DbSets
*.edmx                         → EF6 EDMX models
*Repository*, *UnitOfWork*     → data access patterns
*Migration*                    → DB migration history
```

Output notes:
- `{Project} - Database Connections`
- `{Project} - Entity Models`
- `{Project} - Data Access Patterns`

### Phase 4: Dependency Tracing (Agent 3 + 4)
**Goal:** Map cross-layer call chains from UI → Business Logic → API → Data → Entity

#### Step 4a: Identify entry points
```
*.aspx, *.aspx.vb, *.aspx.cs  → Web Forms pages
*.cshtml, *.razor              → MVC/Razor pages
*Controller*.cs                → API controllers
*.master                       → Master pages
*.asmx                         → SOAP web services
```

#### Step 4b: Trace call chains FROM each entry point
```
[Page/Endpoint]
  └─→ calls [Function/Method in code-behind]
       └─→ calls [Service/Manager class.Method()]
            └─→ calls [Repository/UnitOfWork.Method()]
                 └─→ accesses [Entity/Table/View/StoredProc]
                      └─→ connects to [Database via ConnectionString]
```

#### Step 4c: Build dependency maps per page/feature

#### Step 4d: Cross-reference and group by Feature, Entity, Service, Database

Output notes:
- `{Project} - Dependency Map: {Feature}`
- `{Project} - Entity Usage Map`
- `{Project} - Service Call Map`

### Phase 5: Authorization & Permission Matrix (Agent 5)
**Goal:** Build complete permission matrix — every page, every API, every function mapped to roles

#### Step 5a: Discover all roles in the system
#### Step 5b: Scan page-level authorization
#### Step 5c: Scan API-level authorization
#### Step 5d: Build Permission Matrix (Web Pages + API Endpoints + Role Details)
#### Step 5e: Build "Why Can't I Access?" Troubleshooting Map

Output notes:
- `{Project} - Permission Matrix: Web Pages`
- `{Project} - Permission Matrix: API Endpoints`
- `{Project} - Permission Matrix: Role Details`
- `{Project} - Access Troubleshooting Map`
- `{Project} - Data Scope by Role`

### Phase 6: Workflow & Business Logic Scan (Agent 6)
**Goal:** State machines, business rules, status transitions

Output notes:
- `{Project} - Workflow States`
- `{Project} - Business Rules`

### Phase 7: Integration & Infrastructure Scan (Agent 7)
**Goal:** External APIs, notifications, file storage, servers

Output notes:
- `{Project} - API Endpoints`
- `{Project} - External Integrations`
- `{Project} - Notification Systems`
- `{Project} - File Storage`

### Phase 8: Document Scan (Agent 8)
**Goal:** Extract knowledge from project documentation files

Scan ALL documentation files:
```
**/*.md, **/*.docx, **/*.txt, **/*.pdf
**/docs/**, **/documentation/**
*CLAUDE.md, *AGENTS.md
```

Output notes:
- `{Project} - Documentation Index`
- `{Project} - Requirements: {topic}`
- `{Project} - Deployment Guide`

### Phase 9: Cross-Reference & Link Building
- Build master index
- Add `[[wiki links]]` between related notes
- Create `{Project} - Knowledge Map (Auto-generated)` summary

### Phase 10: Report Results (Thai)
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
├── 🔒 permissions/ — Role Matrix, Page Auth, API Auth ⭐
├── 🔄 workflow/ — States, Business Rules
├── 🌐 integration/ — APIs, Notifications, File Storage
└── 📄 documents/ — .md, .docx, .txt indexed

💡 ถัดไป:
   /brain ทำไมเข้า JobList ไม่ได้    ← ถาม permission ได้เลย
   /brain-explain billing             ← อธิบายแบบละเอียด
   /brain-search JobAssignment        ← ค้นหา dependency map
```

### IMPORTANT: Write activity log
After Phase 10 report, ALWAYS write the "completed" log entry to `.brain/activity-log.json`.
If scan was cancelled or failed at any point, write the "failed/cancelled" entry instead.
Never skip logging — this is how users track what was scanned across sessions.

## Deduplicate Strategy
Before saving each note:
- Search brain for existing note with same title
- If found → compare content, update if changed, skip if identical
- If not found → create new

## Folder Categories for Saved Notes
```
/projects/{name}/core/          — architecture, solution, infrastructure
/projects/{name}/database/      — connections, entities, models, views
/projects/{name}/dependencies/  — dependency maps, call chains, entity usage
/projects/{name}/permissions/   — role matrix, page auth, API auth, troubleshooting
/projects/{name}/workflow/      — states, business rules
/projects/{name}/integration/   — external APIs, notifications, file storage
/projects/{name}/documents/     — indexed documentation files
```
