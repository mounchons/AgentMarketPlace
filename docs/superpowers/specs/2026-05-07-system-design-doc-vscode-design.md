# Spec: system-design-doc v2.0 + sitemap.json + VS Code Extension Data Contract

**Date**: 2026-05-07
**Author**: Mounchons (with Claude)
**Status**: Approved (brainstorming → writing-plans)
**Branch**: `feature/sitemap-graph-vscode`

---

## 1. Goal & Context

### 1.1 The problem

ระบบ plugins 5 ตัว (`system-design-doc`, `ui-mockup`, `long-running`, `qa-ui-test`, `qa-ui-test:qa-advanced`) ทำงานเป็น chain: design → mockup → code → qa
แต่ขาด:

1. **Single navigable map** ของระบบ — page/api/middleware/external function อยู่กระจายในเอกสาร markdown หลาย section
2. **Machine-readable schema** ที่ extension หรือ tool อื่น query ได้
3. **Design system layer** — master page, page template, nav template, component ยังไม่ถูก track ใน design doc
4. **Cross-plugin visibility** — Page นี้มี mockup/feature/qa อะไรเชื่อม? Stage ไหน blocked?
5. **VS Code presence** — ทุก artifact อ่านผ่าน file หรือ Claude prompt เท่านั้น

### 1.2 What we're building

**Two sub-projects** (ใน spec เดียว):

| Sub | Scope | Phase |
|---|---|---|
| **A** | ปรับ `system-design-doc` plugin: ขยาย Section 9 + introduce `.design-docs/sitemap.json` schema + 8 commands ใหม่ + 5 validation rules ใหม่ | This spec → implementation plan |
| **B** | สร้าง VS Code extension ใหม่ (ตั้งชื่อภายหลัง) ที่อ่าน `sitemap.json` + cross-link ไป mockup/feature/qa + 4 views (Tree/Graph/Drilldown/Sequence) | Schema + data contract ออกแบบในเฟสนี้, implementation = next plan |

### 1.3 Decisions made during brainstorming

| # | Decision | Rationale |
|---|---|---|
| D1 | Scope = **A เต็ม + B's data contract** | ออกแบบ schema ครั้งเดียวให้ครอบคลุม, implementation B แยก spec ภายหลัง |
| D2 | ลบ plugins: `flow-monitor`, `flow-monitor-vscode`, `ai-ui-test` | flow-monitor* deprecated — สร้าง extension ใหม่จากศูนย์, ai-ui-test = duplicate ของ qa-ui-test |
| D3 | Extension features: ทั้ง 6 (browser, navigation, status, editor, AI orchestrator, real-time sync) | ครบ end-to-end UX |
| D4 | Node taxonomy = **8 types แบ่ง 2 layers** (Design System: Master/Template/Nav/Component + Application: Page/API/Middleware/External) | User work design-system-first |
| D5 | JSON file architecture: **Single `sitemap.json`** | Pragmatic for typical project size (< 50 pages) |
| D6 | Integration approach: **Approach A — file แยก** (`sitemap.json` ใหม่, `system-design-X.md` คงเดิม) | ไม่ break existing schema; sync via `/sync-sitemap` command |
| D7 | View C (Drilldown) + View D (Sequence) — schema ออกแบบในเฟสนี้, implementation อยู่ sub-project B | ออกแบบ contract ให้พร้อม รองรับการ implement view ภายหลังโดยไม่ต้อง schema migration |

---

## 2. Branch Strategy & Cleanup

### 2.1 Branch

```bash
git checkout main
git pull
git checkout -b feature/sitemap-graph-vscode
```

### 2.2 First commit — plugin cleanup

ลบ 3 plugins ที่ deprecated/duplicate:

```bash
git rm -r plugins/flow-monitor
git rm -r plugins/flow-monitor-vscode
git rm -r plugins/ai-ui-test
git commit -m "chore: remove deprecated plugins (flow-monitor, flow-monitor-vscode, ai-ui-test)"
```

**Plugins ที่คงไว้** (13): `bigbrain`, `brain`, `code-review`, `dotnet-dev`, `financial-backtesting`, `flow-discovery`, `gold-trading-ml`, `long-running`, `meta-labeling`, `qa-ui-test`, `system-design-doc`, `test-runner`, `ui-mockup`

---

## 3. Architecture

### 3.1 Three-layer architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ Source Layer                                                     │
│   system-design-X.md  (human-readable, primary)                  │
│   sitemap.json         (machine-readable, derived)               │
│   design_doc_list.json (existing — list of docs)                 │
└────────────────────────┬─────────────────────────────────────────┘
                         │ /sync-sitemap (bidirectional)
                         │ /sitemap-validate (drift detect)
┌────────────────────────▼─────────────────────────────────────────┐
│ Sync & Validation Layer (system-design-doc plugin commands)      │
│   /sitemap-init, /sitemap-add-node, /sitemap-link,               │
│   /sitemap-scan, /sync-sitemap, /sitemap-validate,               │
│   /sitemap-graph, /sitemap-export                                │
└────────────────────────┬─────────────────────────────────────────┘
                         │ sitemap.json read
        ┌────────────────┼────────────────┬────────────────┐
        ▼                ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ ui-mockup    │ │ long-running │ │ qa-ui-test   │ │ VS Code Ext  │
│ Pages →      │ │ APIs +       │ │ AC/UC IDs +  │ │ (sub-proj B) │
│ mockup_list  │ │ Pages →      │ │ scenarios →  │ │ TreeView +   │
│              │ │ feature_list │ │ qa-tracker   │ │ Webview +    │
│              │ │              │ │              │ │ Editor +     │
│              │ │              │ │              │ │ Bridge       │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

**Sources of truth** (per node type):

| Data | Primary | Mirror | Sync direction |
|---|---|---|---|
| Design system (master/template/nav/component) | `sitemap.json` | md Section 9.4 | json → md (render) |
| Pages, APIs, Middleware, External | `system-design-X.md` (Section 3, 9) | `sitemap.json` | md → json (extract) |
| AC/UC IDs | md Section 2.4, 2.5 | `sitemap.json` `linked_artifacts` | md → json |
| Status / progress | downstream plugins (mockup_list, feature_list, qa-tracker) | `sitemap.json` `stage_status` | downstream → json (pull) |

`/sync-sitemap` ทำ 2 ทาง: extract md → update json, then pull downstream stats → update json.

### 3.2 Component breakdown

| Component | Responsibility | Depends on |
|---|---|---|
| `sitemap-schema.json` | JSON Schema definition (draft-07) | — |
| `templates/sitemap-template.json` | Empty starter | sitemap-schema |
| `commands/sitemap-*.md` | 8 slash commands | sitemap-schema, design-doc template |
| `references/node-types.md` | Detailed reference for 8 node types | — |
| `references/sitemap-validation-rules.md` | R31-R35 + existing rules | — |
| `templates/design-doc-template.md` | Updated template (Section 9 expansion) | — |
| `skills/system-design-doc/SKILL.md` | Bump to v2.0.0 + integrate new commands | All above |

### 3.3 What stays the same

- `design_doc_list.json` schema (no breaking change)
- `system-design-X.md` Sections 1-8, 10 (only Section 9 expanded)
- Existing commands (`/create-design-doc`, `/reverse-engineer`, etc.)
- AC/UC ID format and propagation rules from v1.7.0

---

## 4. sitemap.json Schema (v1.0.0)

### 4.1 Top-level structure

```json
{
  "schema_version": "1.0.0",
  "design_doc_ref": "system-design-app.md",
  "project_name": "string",
  "generated_at": "ISO 8601 datetime",
  "last_synced_at": "ISO 8601 datetime",

  "workflow_stages": [...],

  "design_system": {
    "masters":    [...],
    "templates":  [...],
    "navs":       [...],
    "components": [...]
  },

  "application": {
    "pages":              [...],
    "apis":               [...],
    "middlewares":        [...],
    "external_functions": [...]
  },

  "edges": [...],

  "sync_status": {
    "ui_mockup":    { "covered": 0, "gap": 0, "last_sync": "..." },
    "long_running": { "covered": 0, "gap": 0, "last_sync": "..." },
    "qa_tracker":   { "covered_acs": 0, "gap_acs": 0, "last_sync": "..." }
  }
}
```

### 4.2 ID conventions

| Layer | Type | Prefix | Example |
|---|---|---|---|
| Design System | Master Page | `MP-` | `MP-001` |
| Design System | Page Template | `TPL-` | `TPL-001` |
| Design System | Nav Template | `NAV-` | `NAV-001` |
| Design System | Component | `CMP-` | `CMP-001` |
| Application | Page | `P-` | `P-001` |
| Application | API Endpoint | `API-` | `API-001` |
| Application | Middleware | `MW-` | `MW-001` |
| Application | External Function | `EXT-` | `EXT-001` |

ทุก ID ใช้ 3-digit zero-padded format (consistent กับ AC-NNN / UC-NNN).

### 4.3 Node schemas

#### 4.3.1 Master Page (`MP-NNN`)

```json
{
  "id": "MP-001",
  "name": "AdminLayout",
  "description": "Sidebar + topbar + profile dropdown chrome for authenticated admin pages",
  "source_file": ".mockups/html/master-page.js",
  "css_file": ".mockups/html/master-page.css",
  "regions": ["sidebar", "topbar", "main", "profile"],
  "linked_artifacts": {
    "mockups": [".mockups/html/master-page.js"],
    "code_files": ["src/Layouts/AdminLayout.tsx"]
  }
}
```

#### 4.3.2 Page Template (`TPL-NNN`)

```json
{
  "id": "TPL-001",
  "name": "ListPage",
  "description": "Standard list page archetype: filter bar + data table + pagination",
  "uses_master": "MP-001",
  "default_components": ["CMP-001", "CMP-002"],
  "source_file": "src/Templates/ListPage.tsx"
}
```

#### 4.3.3 Nav Template (`NAV-NNN`)

```json
{
  "id": "NAV-001",
  "name": "PrimarySidebar",
  "type": "sidebar",
  "items": [
    { "label": "Dashboard", "url": "/dashboard", "page_ref": "P-010" },
    { "label": "Orders",    "url": "/orders",    "page_ref": "P-001" }
  ],
  "source_file": "src/Components/PrimarySidebar.tsx"
}
```

#### 4.3.4 Component (`CMP-NNN`)

```json
{
  "id": "CMP-001",
  "name": "DataTable",
  "category": "data-display",
  "props_schema": {
    "columns": "ColumnDef[]",
    "data": "T[]",
    "onRowClick": "(row: T) => void"
  },
  "source_file": "src/Components/DataTable.tsx",
  "used_by_pages": ["P-001", "P-002"]
}
```

#### 4.3.5 Page (`P-NNN`)

```json
{
  "id": "P-001",
  "name": "Order List",
  "url": "/orders",
  "access_level": "User",
  "uses_master": "MP-001",
  "uses_template": "TPL-001",
  "uses_components": ["CMP-001", "CMP-005"],
  "calls_apis": ["API-001"],
  "ac_refs": ["AC-001", "AC-002"],
  "uc_refs": ["UC-001"],
  "source_file": "src/Pages/OrderListPage.tsx",
  "linked_artifacts": {
    "mockups":      [".mockups/html/001-order-list.html"],
    "features":     ["feature_list.json#5", "feature_list.json#6"],
    "qa_scenarios": ["qa-tracker.json#OL-001", "qa-tracker.json#OL-002"],
    "test_cases":   12,
    "code_files":   ["src/Pages/OrderListPage.tsx"]
  },
  "stage_status": [
    { "stage": "design",  "status": "done",        "progress": 1.0 },
    { "stage": "mockup",  "status": "done",        "progress": 1.0 },
    { "stage": "code",    "status": "in-progress", "progress": 0.67 },
    { "stage": "qa",      "status": "in-progress", "progress": 0.625, "passed": 5, "total": 8 },
    { "stage": "release", "status": "blocked",     "blocked_by": "qa" }
  ],
  "available_actions": [
    { "label": "Generate QA scenarios", "command": "/qa-create-scenario page=P-001" },
    { "label": "Open mockup",            "command": "/create-html-mockup page=P-001" },
    { "label": "Continue feature",       "command": "/continue feature=5" }
  ]
}
```

#### 4.3.6 API Endpoint (`API-NNN`)

```json
{
  "id": "API-001",
  "method": "GET",
  "path": "/api/orders",
  "controller": "OrdersController.GetAll",
  "auth_required": true,
  "middlewares": ["MW-001", "MW-002"],
  "calls_external": [],
  "called_by_pages": ["P-001"],
  "request_schema": { "query": { "page": "int", "size": "int" } },
  "response_schema": { "data": "Order[]", "total": "int" },
  "source_file": "src/Controllers/OrdersController.cs",
  "linked_artifacts": {
    "features":     ["feature_list.json#5"],
    "qa_scenarios": ["qa-tracker.json#API-OL-001"],
    "code_files":   ["src/Controllers/OrdersController.cs"]
  },
  "stage_status": [
    { "stage": "design", "status": "done",    "progress": 1.0 },
    { "stage": "code",   "status": "done",    "progress": 1.0 },
    { "stage": "qa",     "status": "done",    "progress": 1.0, "passed": 3, "total": 3 },
    { "stage": "release","status": "ready",   "progress": 1.0 }
  ]
}
```

> Note: Stage `mockup` ไม่ apply กับ API/Middleware/External — `stage_status` เก็บเฉพาะ stage ที่เกี่ยวข้อง (omit irrelevant).

#### 4.3.7 Middleware (`MW-NNN`)

```json
{
  "id": "MW-001",
  "name": "JwtAuth",
  "type": "auth",
  "applies_to": "all-api-except-public",
  "order": 1,
  "source_file": "src/Middlewares/JwtAuthMiddleware.cs",
  "linked_artifacts": {
    "features":   ["feature_list.json#2"],
    "code_files": ["src/Middlewares/JwtAuthMiddleware.cs"]
  }
}
```

#### 4.3.8 External Function (`EXT-NNN`)

```json
{
  "id": "EXT-001",
  "name": "Stripe Charge",
  "kind": "3rd-party-api",
  "provider": "Stripe",
  "auth_method": "api-key",
  "called_by_apis": ["API-005"],
  "linked_artifacts": {
    "code_files": ["src/Services/External/StripeClient.cs"]
  }
}
```

`kind` enum: `3rd-party-api` | `webhook-out` | `webhook-in` | `cron` | `queue` | `cloud-function`

### 4.4 workflow_stages (top-level array)

```json
"workflow_stages": [
  { "id": "design",  "name": "System Design", "owner_plugin": "system-design-doc", "order": 1 },
  { "id": "mockup",  "name": "UI Mockup",     "owner_plugin": "ui-mockup",         "order": 2 },
  { "id": "code",    "name": "Implementation","owner_plugin": "long-running",      "order": 3 },
  { "id": "qa",      "name": "QA Testing",    "owner_plugin": "qa-ui-test",        "order": 4 },
  { "id": "release", "name": "Release Gate",  "owner_plugin": "long-running",      "order": 5 }
]
```

`stage_status[].status` enum: `not-started` | `in-progress` | `done` | `blocked` | `ready` | `n/a`

### 4.5 edges (top-level array)

Typed edges สำหรับ graph rendering:

```json
"edges": [
  { "from": "P-001",   "to": "API-001", "type": "calls" },
  { "from": "API-001", "to": "MW-001",  "type": "guarded-by" },
  { "from": "API-005", "to": "EXT-001", "type": "calls-external" },
  { "from": "P-001",   "to": "MP-001",  "type": "uses-master" },
  { "from": "P-001",   "to": "TPL-001", "type": "uses-template" },
  { "from": "P-001",   "to": "CMP-001", "type": "uses-component" },
  { "from": "MP-001",  "to": "NAV-001", "type": "has-nav" },
  { "from": "NAV-001", "to": "P-001",   "type": "links-to" }
]
```

`type` enum: `calls` | `guarded-by` | `calls-external` | `uses-master` | `uses-template` | `uses-component` | `has-nav` | `links-to`

> Edges สามารถ derive จาก node fields ได้บางส่วน — `edges` array เป็น **denormalized cache** สำหรับ render graph เร็ว

---

## 5. Markdown Section 9 Expansion

ขยายจาก 3 sub-sections เป็น **9 sub-sections**:

| § | Title | Status |
|---|---|---|
| 9.1 | Visual Sitemap (Mermaid `flowchart`) | existing |
| 9.2 | Page Inventory (table) | existing |
| 9.3 | Navigation Structure | existing |
| 9.4 | **Design System Inventory** (Masters / Templates / Navs / Components) | **NEW** |
| 9.5 | **API Inventory** (table mirror ของ Section 3.3 สำหรับ machine extract) | **NEW** |
| 9.6 | **Middleware Inventory** | **NEW** |
| 9.7 | **External Functions Inventory** | **NEW** |
| 9.8 | **Node Relationships** (Mermaid graph + edge table) | **NEW** |
| 9.9 | **File Structure Map** (Mermaid tree) | **NEW** |

แต่ละ sub-section ใหม่จะมี table format ที่ extract เป็น JSON ได้ง่าย (consistent column names กับ schema field names)

> Section 3.3 (Module APIs) คงไว้ — Section 9.5 เป็น **flat unified inventory** ที่ครอบคลุมทุก module (สำหรับ machine extraction) ส่วน Section 3.3 ยังเป็น human-grouped by module

---

## 6. New Commands (8 commands)

| Command | Purpose | Output |
|---|---|---|
| `/sitemap-init` | สร้าง `.design-docs/sitemap.json` เปล่าๆ จาก template + ดึง project_name จาก design_doc_list.json | `sitemap.json` |
| `/sitemap-add-node <type> <fields>` | เพิ่ม node ใหม่ (page/api/mw/ext/master/template/nav/component) | updated `sitemap.json` |
| `/sitemap-link <from> <to> <type>` | เพิ่ม edge ระหว่าง 2 nodes | updated `sitemap.json` |
| `/sitemap-scan` | Auto-scan codebase → infer nodes (similar to `/reverse-engineer` แต่ output JSON) | populated `sitemap.json` |
| `/sync-sitemap` | Bidirectional sync md ↔ json + pull downstream stats | updated `sitemap.json`, optionally md |
| `/sitemap-validate` | ตรวจ schema + R31-R35 + drift detection | report (pass/warn/fail) |
| `/sitemap-graph` | Render Mermaid graph จาก edges array | Mermaid markdown chunk |
| `/sitemap-export <format>` | Export เป็น Cytoscape JSON / GraphML / DOT | exported file |

---

## 7. Cross-Validation Rules (R31-R35)

ต่อจาก R1-R30 ใน v1.7.0:

| ID | Rule | Severity |
|---|---|---|
| **R31** | ทุก Page ต้อง declare `uses_master` และ `uses_template` (warn-only ถ้ายังไม่มี Design System defined) | warn / error if DS exists |
| **R32** | ทุก API ใน `sitemap.json` ต้องตรงกับ API ใน Section 3.3 Module Details ของ md (bidirectional) | error |
| **R33** | ทุก node ต้องมี `source_file` field (warn ถ้า file ไม่มีจริงในระบบไฟล์) | warn |
| **R34** | `edges[]` ต้องไม่มี orphan — `from` และ `to` ต้องเป็น ID ที่มีจริงใน `application.*` หรือ `design_system.*` | error |
| **R35** | Page ที่มี `linked_artifacts.mockups[]` path ต้องตรงกับ entry ใน `mockup_list.json` (cross-file integrity) | error |

> R33 มีโหมด `--strict` ที่ upgrade เป็น error สำหรับ release-gate validation

---

## 8. Sub-project B Note (VS Code Extension)

**Implementation อยู่ใน spec ถัดไป** — แต่ schema นี้ออกแบบให้รองรับ:

### 8.1 4 Views ที่จะ implement

| View | Source data | Render lib |
|---|---|---|
| **A. TreeView** (Activity Bar sidebar) | `sitemap.json` grouped by node type + file structure | VS Code TreeView API |
| **B. Graph View** (webview) | `edges[]` + node positions | Cytoscape.js หรือ D3 |
| **C. Drilldown** (webview/panel) | `linked_artifacts` + cross-load `mockup_list/feature_list/qa-tracker` | React + custom |
| **D. Sequence/Pipeline** (webview) | `workflow_stages` + `stage_status[]` | Custom swim-lane component |

### 8.2 Required schema features (ทุกตัวอยู่ในเฟสนี้แล้ว)

- `linked_artifacts` per node → drilldown payload
- `stage_status[]` per node → sequence/pipeline matrix
- `available_actions[]` per node → AI orchestrator quick menu
- `workflow_stages` top-level → stage definition
- `sync_status` top-level → header health summary

### 8.3 Extension features (จาก Q3)

1. Read-only browser (TreeView + Graph)
2. Navigation hub (click → open file from `source_file`)
3. Status dashboard (`stage_status` + `sync_status`)
4. Inline editor (form bound to JSON Schema)
5. AI agent orchestrator (`available_actions` → terminal)
6. Real-time sync (FileSystemWatcher → reload)

### 8.4 Concurrency note

Feature 4 (inline editor) + Feature 6 (real-time sync) มี race condition risk — เพิ่ม:
- `last_modified_by`: `"user" | "claude" | "extension"` ใน root
- Optimistic concurrency: extension เก็บ ETag (file mtime) ใน memory; ก่อน save เช็ค mtime — ถ้า diverge → prompt user

---

## 9. Versioning & Backwards Compatibility

| Artifact | Current | New | Compatibility |
|---|---|---|---|
| `system-design-doc` plugin | v1.7.0 | **v2.0.0** | Major bump (schema additions + new commands), but **md template เพิ่ม section ใหม่** ไม่ break existing docs |
| `sitemap.json` | — | **v1.0.0** | New file, optional (existing projects ไม่มีไฟล์นี้ก็ valid) |
| `design_doc_list.json` schema | v2.2.0 | unchanged | No bump |
| Existing commands (`/create-design-doc`, etc.) | unchanged | unchanged | Pass-through |

**Migration path** สำหรับ existing projects:
1. รัน `/sitemap-init` → สร้าง sitemap.json เปล่า
2. รัน `/sitemap-scan` → infer จาก existing md + codebase
3. รัน `/sitemap-validate` → fix gaps
4. ทุก existing project ยัง valid โดยไม่ทำอะไร (sitemap.json เป็น opt-in)

---

## 10. Testing Strategy

### 10.1 Schema validation tests
- JSON Schema (draft-07) สำหรับ `sitemap.json` — validator พบใน `references/sitemap-schema.json`
- Test: สร้าง valid + invalid samples; assert validator catches errors

### 10.2 Cross-validation tests (R31-R35)
- Fixture: 1 design doc + 1 sitemap.json + downstream files
- Mutate ทีละ rule; assert `/sitemap-validate` flag ถูกต้อง

### 10.3 Sync round-trip tests
- เริ่มจาก md → run `/sync-sitemap` → assert json มี nodes ครบ
- แก้ json → run `/sync-sitemap --to-md` → assert md updated
- Drift test: แก้ md โดยไม่ sync → run `/sitemap-validate` → assert drift report ถูก

### 10.4 Manual acceptance
- เลือก 1 existing project (เช่น dummy e-commerce) → ทำ migration จริง → ใช้งาน drill-down ผ่าน CLI `cat sitemap.json | jq '.application.pages[0].linked_artifacts'` เพื่อ verify shape

---

## 11. Open Questions / Risks

| # | Question / Risk | Mitigation |
|---|---|---|
| Q1 | จะ generate Mermaid graph 9.8 จาก edges เลย หรือให้ user เขียน? | `/sitemap-graph` auto-generate; user แก้ด้วยมือได้ in md หลัง render |
| Q2 | ถ้า project มี > 50 pages — single sitemap.json จะใหญ่แค่ไหน? | Estimate: 50 pages × ~1KB = 50KB → ยังจัดการได้ใน file watcher; ถ้าใหญ่กว่านี้ ค่อย migrate เป็น Approach C (distributed) |
| Q3 | `props_schema` ของ Component — เป็น free-form object หรือ JSON Schema strict? | Free-form ในเฟสแรก; tighten ภายหลังถ้าจำเป็น |
| R1 | sync drift — md กับ json ไม่ตรง | `/sitemap-validate` รันใน CI/pre-commit hook |
| R2 | extension build complexity | sub-project B จะมี spec แยก + writing-plans flow ของตัวเอง |
| R3 | id collision ตอน scan codebase ครั้งแรก | `/sitemap-scan` ใช้ deterministic ID gen (slug + counter) + check existing IDs ก่อนเพิ่ม |

---

## 12. Implementation Order (preview — รายละเอียดอยู่ใน writing-plans phase)

1. Branch + plugin cleanup (D2)
2. JSON Schema + template (`sitemap-schema.json`, `sitemap-template.json`)
3. Update `design-doc-template.md` Section 9 (9.4-9.9)
4. Implement 8 new commands (start with `/sitemap-init`, `/sitemap-add-node`, `/sync-sitemap`)
5. Validation rules R31-R35 + integration into `/validate-design-doc`
6. SKILL.md bump v2.0.0 + workflow diagrams update
7. Migration of 1 sample project (dogfood)
8. Update `qa-v2.5-integration-context.md` + relevant docs
9. **Sub-project B** = ใหม่ spec + plan

---

## Appendix A — File Structure Output (target after implementation)

```
plugins/system-design-doc/
├── .claude-plugin/plugin.json     (version 2.0.0)
├── README.md                      (updated)
├── commands/
│   ├── create-design-doc.md       (existing)
│   ├── reverse-engineer.md        (existing)
│   ├── ...
│   ├── sitemap-init.md            (NEW)
│   ├── sitemap-add-node.md        (NEW)
│   ├── sitemap-link.md            (NEW)
│   ├── sitemap-scan.md            (NEW)
│   ├── sync-sitemap.md            (NEW)
│   ├── sitemap-validate.md        (NEW)
│   ├── sitemap-graph.md           (NEW)
│   └── sitemap-export.md          (NEW)
└── skills/system-design-doc/
    ├── SKILL.md                   (updated to v2.0.0)
    ├── templates/
    │   ├── design-doc-template.md (Section 9 expanded)
    │   ├── sitemap-template.json  (NEW)
    │   └── design_doc_list.json   (existing)
    └── references/
        ├── ...
        ├── sitemap-schema.json    (NEW — JSON Schema draft-07)
        ├── node-types.md          (NEW — 8 node types reference)
        └── sitemap-validation-rules.md (NEW — R31-R35 + existing rules)
```

---

## Appendix B — Brainstorming Decisions Log

| # | Question | Answer |
|---|---|---|
| Q1 | Scope of this spec | A — sub-project A full + sub-project B's data contract |
| Q2 | Plugin cleanup list | Delete: flow-monitor, flow-monitor-vscode, ai-ui-test |
| Q3 | Extension features | All 6 (browser, navigation, status, editor, AI orchestrator, sync) |
| Q4 | Node taxonomy | 8 types — 2 layers (Design System + Application) |
| Q5 | JSON file architecture | A — Single `sitemap.json` file |
| Q6 | Integration approach | A — Separate file (md primary, json mirror) |
| Q7 | Approve initial design? | OK |
| Q8 | Add Drilldown + Sequence views? | OK |

---

**End of spec.**
