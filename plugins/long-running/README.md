# Long-Running Agent Skill

> **Version 1.10.0** - เพิ่ม Cross-Plugin Integration กับ system-design-doc และ ui-mockup

Harness สำหรับ AI Agent ที่ทำงานข้าม context windows ได้อย่างมีประสิทธิภาพ

อ้างอิงจาก [Anthropic Engineering Blog: Effective Harnesses for Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-runnings)

## ✨ Features

- **Feature Tracking** - ติดตามความคืบหน้าด้วย feature_list.json
- **Session Logging** - บันทึกทุก session ใน progress.md
- **Incremental Development** - ทำทีละ feature ไม่ one-shot
- **Test-First Approach** - ต้อง test ก่อน mark pass
- **Git Integration** - Commit แยกต่าง feature
- **UI Mockup Integration** - อ่าน `.mockups/` folder และสร้าง UI ตาม wireframe
- **Design Doc Integration** - ใช้ ER Diagram, Flow Diagram จาก system-design-doc
- **Technology Detection** - ตรวจจับ technology stack และแนะนำ skills ที่เหมาะสม

### 🆕 New in v1.10.0

- **Cross-Plugin Integration** - เชื่อมต่อกับ system-design-doc และ ui-mockup
  - `integration` section ที่ root level
  - `design_doc_path`, `mockup_list_path` สำหรับ auto-discovery
  - `last_synced_with_*` timestamps
- **Design Doc References** - เชื่อมโยง features กับ design document
  - `design_doc_refs.entity_ref` - อ้างอิง entity จาก design doc
  - `design_doc_refs.api_ref` - อ้างอิง API endpoint
  - `design_doc_refs.section` - design section ที่เกี่ยวข้อง
  - `design_doc_refs.diagram_refs` - diagrams ที่เกี่ยวข้อง
- **Mockup Page References** - เชื่อมโยง features กับ mockup pages
  - `mockup_page_refs` - array ของ page IDs
- **Sync Status Tracking** - ติดตามการ sync
  - `sync_status` field ใน features
  - `sync_status` section ที่ root level
- **Compatibility Metadata** - ระบุ version ที่ต้องการ
  - `metadata.compatible_with`

### v1.9.0 Features

- **Feature Version History** - ติดตามการเปลี่ยนแปลงของ feature ตลอดเวลา
  - `version_history` array เก็บประวัติการแก้ไข
  - บันทึก change reason และ timestamp
  - ดูย้อนหลังได้ว่า feature เปลี่ยนแปลงอย่างไร
- **Interaction/Animation Tracking** - ติดตาม interactive elements
  - `interactions` array เก็บ hover, click, animation states
  - ระบุว่า element ไหน implement แล้ว/ยัง
  - ครอบคลุมทุก interactive elements จาก mockup
- **Component Reuse Tracking** - ติดตามการใช้ซ้ำของ components
  - `component_usage` section ที่ root level
  - `shared_components` - components ที่ใช้หลาย features
  - `reuse_opportunities` - แนะนำ components ที่ควร extract

### v1.8.0 Features

- **Subtask-to-Commit Mapping** - เชื่อมโยง subtask กับ git commit hashes
  - `commits` field ใน subtask เก็บ array ของ commit hashes
  - ติดตามได้ว่า subtask ไหนมี commits อะไรบ้าง
  - Navigate จาก subtask ไปยัง code changes ได้

### v1.7.0 Features

- **Module Decomposition** - แบ่ง features ตาม physical code modules
- **Layer Architecture** - กำหนด layer ให้แต่ละ feature (presentation, application, domain, infrastructure, cross-cutting)
- **Component Library Validation** - ตรวจสอบ required_components กับ component library
- **Mockup Version Tracking** - ติดตาม version ของ mockup ที่ feature อ้างอิง
- **Design Token Validation** - ตรวจสอบ design tokens ที่ใช้
- **Responsive Breakpoints** - ติดตาม implementation ของแต่ละ breakpoint
- **Subtask Dependencies** - กำหนด dependencies ระหว่าง subtasks
- **Subtask File Tracking** - ติดตามไฟล์ที่แก้ไขในแต่ละ subtask
- **Risk Assessment** - ประเมินความเสี่ยงของ feature (low/medium/high)
- **Cross-Cutting Epic** - Epic สำหรับ logging, caching, security, monitoring

### v1.5.0 Features

- **Epic Grouping** - จัดกลุ่ม features ตาม Bounded Context
- **Subtask Tracking** - ติดตาม subtasks ภายใน feature
- **Acceptance Criteria** - กำหนดเกณฑ์ความสำเร็จ
- **Time Tracking** - เปรียบเทียบ estimated vs actual time
- **Auto-generation** - สร้าง features อัตโนมัติจาก mockups/design docs
- **Coverage Validation** - ตรวจสอบความครอบคลุม
- **Dependency Visualization** - Mermaid diagram สำหรับ dependencies
- **Schema Migration** - Migrate จาก schema เก่าอัตโนมัติ

## 📦 Installation

```bash
# Add marketplace (if not already added)
/plugin marketplace add mounchons/agentmarketplace

# Install plugin
/plugin install long-running@agent-marketplace
```

## 🚀 Quick Start

### เริ่มโปรเจคใหม่

```bash
# Initialize agent environment
/init สร้าง Todo API ด้วย ASP.NET Core Web API

# Start working on features
/continue
```

### ใช้กับโปรเจคที่มีอยู่

```bash
# Analyze existing project and create agent environment
/init-existing

# Continue development
/continue
```

### ดูสถานะ

```bash
/status
```

## 📋 Commands

### Core Commands

| Command | Description |
|---------|-------------|
| `/init [description]` | Initialize agent environment สำหรับโปรเจคใหม่ |
| `/continue` | ทำงานต่อจาก session ก่อน |
| `/status` | ดูความคืบหน้าของโปรเจค |
| `/init-existing` | เพิ่ม agent environment ให้โปรเจคที่มีอยู่ |
| `/add-feature` | เพิ่ม feature ใหม่เข้าไปใน feature_list.json |
| `/edit-feature [id] - [changes]` | แก้ไข feature ที่ pass แล้ว (สร้าง feature ใหม่) |

### 🆕 New Commands (v1.5.0)

| Command | Description |
|---------|-------------|
| `/generate-features-from-mockups` | สร้าง features อัตโนมัติจาก mockup_list.json |
| `/generate-features-from-design` | สร้าง features จาก design doc + mockups |
| `/sync-mockups` | Sync status ระหว่าง features และ mockups |
| `/validate-coverage` | ตรวจสอบ coverage ของ mockups, design, criteria |
| `/dependencies` | แสดง dependency graph (Mermaid) |
| `/migrate` | Migrate จาก schema เก่าเป็น v1.5.0 |

## 📎 Feature References (v1.4.0)

Features สามารถมี references ไปยังเอกสารอื่นๆ ได้:

```json
{
  "id": 5,
  "category": "feature",
  "description": "สร้างหน้า Login",
  "references": [
    ".mockups/login.mockup.md",
    "docs/auth-flow.md",
    "sql/create_users.sql"
  ]
}
```

### Reference Types

| Type | Example Path | Usage |
|------|-------------|-------|
| Mockup | `.mockups/login.mockup.md` | UI design reference |
| Design Doc | `docs/system-design.md` | Architecture reference |
| SQL | `sql/create_table.sql` | Database schema |
| Logic Doc | `docs/business-logic.md` | Business rules |
| Wireframe | `.mockups/wireframe.md` | Basic layout reference |

### Using References

เมื่อ Coding Agent ทำ feature ที่มี references:
- ✅ ต้องอ่าน references ก่อนเริ่มงาน
- ✅ ใช้ mockup เป็น design reference
- ✅ ใช้ SQL/design doc เป็น schema reference
- ❌ ห้ามสร้าง UI ที่แตกต่างจาก mockup
- ❌ ห้ามสร้าง schema ที่แตกต่างจาก design doc

---

## 🔄 Editing Passed Features (v1.4.0)

เมื่อต้องการแก้ไข feature ที่ผ่านแล้ว:

```bash
/edit-feature 5 - เพิ่ม OAuth login
```

### สิ่งที่เกิดขึ้น:

1. **Feature #5 ยังคงอยู่** (passes: true) - เก็บ history
2. **สร้าง Feature ใหม่ #13** (passes: false)
3. Feature #13 มี:
   - `supersedes: 5` - อ้างอิงว่าแทนที่ feature ไหน
   - `related_features: [5]` - features ที่เกี่ยวข้อง
4. Summary อัพเดท (total +1, failed +1)

### Feature Evolution Diagram

```
Feature #5 (Login - Basic)
    │ passes: true
    │
    └──── superseded by ────┐
                            │
                            ▼
                    Feature #13
                    (Login - OAuth)
                    passes: false
                    related_features: [5]
                    supersedes: 5
```

### When to Use

| Scenario | Command |
|----------|---------|
| Feature pass แล้ว ต้องการเพิ่ม scope | `/edit-feature` |
| Feature pass แล้ว พบ bug | `/edit-feature` (category: bugfix) |
| Feature ยังไม่ pass | `/continue` |
| ต้องการเพิ่ม feature ใหม่ | `/add-feature` |

---

## 🔗 Integration with Other Skills

### 🆕 Complete Development Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    COMPLETE DEVELOPMENT WORKFLOW                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Phase 1: Design (ก่อนพัฒนา)                                        │
│  ┌─────────────────┐      ┌─────────────────┐                      │
│  │ /system-design  │ ───▶ │   /ui-mockup    │                      │
│  │      -doc       │      │                 │                      │
│  │                 │      │                 │                      │
│  │ Output:         │      │ Output:         │                      │
│  │ • ER Diagram    │      │ • Wireframes    │                      │
│  │ • Flow Diagram  │      │ • Design Tokens │                      │
│  │ • Data Dict     │      │ • Component Specs│                     │
│  └─────────────────┘      └─────────────────┘                      │
│           │                        │                               │
│           └───────────┬────────────┘                               │
│                       ▼                                            │
│  Phase 2: Initialize                                               │
│  ┌─────────────────────────────────────────┐                       │
│  │            /init                   │                       │
│  │                                          │                       │
│  │ • อ่าน design docs และ mockups          │                       │
│  │ • สร้าง feature_list.json               │                       │
│  │ • สร้าง .agent/ folder                  │                       │
│  └─────────────────────────────────────────┘                       │
│                       │                                            │
│                       ▼                                            │
│  Phase 3: Development (ซ้ำหลายครั้ง)                                │
│  ┌─────────────────────────────────────────┐                       │
│  │            /continue                     │                       │
│  │                                          │                       │
│  │ 1. อ่าน .mockups/ → สร้าง UI ตาม design │                       │
│  │ 2. อ่าน design doc → สร้าง DB, API      │                       │
│  │ 3. ใช้ /dotnet-dev → .NET implementation│                       │
│  │ 4. Test → Mark pass → Commit            │                       │
│  └─────────────────────────────────────────┘                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 📐 กับ ui-mockup skill

เมื่อพบ `.mockups/` folder จะ:
- อ่าน wireframe ของหน้าที่กำลังพัฒนา
- สร้าง UI ตาม ASCII wireframe
- ใช้ design tokens (colors, spacing, fonts)
- implement components ตาม component specs

```bash
# ตรวจสอบ mockups
ls -la .mockups/
ls -la .mockups/*.mockup.md
```

### 📄 กับ system-design-doc skill

เมื่อพบ Design Document จะ:
- ใช้ ER Diagram สร้าง database schema
- ใช้ Data Dictionary สำหรับ field types
- ใช้ Flow Diagram สำหรับ business logic

```bash
# ค้นหา design docs
find . -name "*design*.md" -o -name "*system*.md"
```

### 🔧 กับ dotnet-dev skill

สำหรับ .NET Core Projects (พบ `.csproj` หรือ `.sln`):
- ใช้ .NET best practices
- ใช้ EF Core patterns
- ใช้ Dependency Injection
- ใช้ ASP.NET Core conventions

## 🔧 Technology Detection

เมื่อเริ่มพัฒนา จะตรวจจับ technology stack อัตโนมัติ:

| Technology | Files ที่บ่งบอก | Skill ที่ใช้ |
|------------|----------------|-------------|
| .NET Core/ASP.NET | `*.csproj`, `*.sln` | `/dotnet-dev` ⭐ |
| Node.js/React/Vue | `package.json` | (standard practices) |
| Python/FastAPI | `requirements.txt` | (standard practices) |
| Go | `go.mod` | (standard practices) |
| Rust | `Cargo.toml` | (standard practices) |
| PHP/Laravel | `composer.json` | (standard practices) |
| Java/Spring | `pom.xml`, `build.gradle` | (standard practices) |

⭐ = มี specialized skill พร้อมใช้งาน

### Universal Skills (ใช้ได้กับทุก Technology)

| Skill | Description |
|-------|-------------|
| `/system-design-doc` | สร้างเอกสารออกแบบระบบ |
| `/ui-mockup` | สร้าง UI wireframes |
| `/code-review` | Review code ก่อน commit |
| `/test-runner` | รัน tests |
| `/ai-ui-test` | Test UI automation |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 LONG-RUNNING AGENT SYSTEM                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   INITIALIZER AGENT          CODING AGENT                   │
│   (ครั้งแรกเท่านั้น)            (ทำซ้ำหลายครั้ง)               │
│                                                             │
│         │                          │                        │
│         ▼                          ▼                        │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              SHARED ARTIFACTS                       │   │
│   │  • feature_list.json  (รายการ features)             │   │
│   │  • .agent/progress.md (บันทึกความคืบหน้า)           │   │
│   │  • .agent/config.json (ตั้งค่า agent)               │   │
│   │  • Git History        (ประวัติการเปลี่ยนแปลง)        │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              DESIGN REFERENCES (v1.3.0)             │   │
│   │  • .mockups/          (UI Wireframes)               │   │
│   │  • *design-doc.md     (System Design)               │   │
│   │  • Design Tokens      (Colors, Spacing)             │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Files Created

```
project-root/
├── .agent/                      # Agent configuration
│   ├── config.json              # Project settings + recommended skills
│   └── progress.md              # Session logs
├── .mockups/                    # UI Mockups (from ui-mockup skill)
│   ├── mockup_list.json         # List of all mockups
│   ├── _design-tokens.yaml      # Shared design tokens
│   └── *.mockup.md              # Page mockups
├── feature_list.json            # Feature tracking
└── ... (project files)
```

### .agent/config.json (v1.3.0)

```json
{
  "project_name": "ชื่อโปรเจค",
  "technology": ".NET Core",
  "initialized_at": "2025-01-01T00:00:00Z",
  "current_session": 1,
  "design_references": {
    "mockups_folder": ".mockups/",
    "design_doc": "system-design-doc.md",
    "design_tokens": ".mockups/_design-tokens.yaml"
  },
  "recommended_skills": [
    "/dotnet-dev",
    "/code-review",
    "/test-runner"
  ],
  "settings": {
    "auto_commit": true,
    "require_tests": true,
    "max_features_per_session": 1,
    "use_mockups_for_ui": true,
    "use_design_doc_for_db": true
  }
}
```

## 🔄 Workflow

### Session 1: Initialize

```
/init สร้าง Todo API

Output:
├── feature_list.json (10-15 features, all passes: false)
├── .agent/config.json (includes design_references & recommended_skills)
├── .agent/progress.md (Session 1 log)
└── Git commit: "chore: Initialize agent environment"
```

### Session 2+: Coding

```
/continue

Workflow:
1. อ่าน CLAUDE.md และ project rules
2. ตรวจสอบ .mockups/ และ design docs ← NEW!
3. ตรวจสอบ technology stack และ recommended skills ← NEW!
4. อ่าน progress.md และ git log
5. ตรวจสอบ build status
6. เลือก feature ที่ passes: false
7. Implement feature (ตาม mockup/design doc)
8. Test feature
9. Mark pass ใน feature_list.json
10. Git commit
11. Update progress.md
```

## ⚠️ Critical Rules

### Initializer Agent
- ❌ ห้าม implement code
- ✅ สร้างแค่ configuration files
- ✅ Feature list ต้องครบถ้วน
- ✅ ต้องตรวจสอบ .mockups/ และ design docs

### Coding Agent
- ❌ ห้ามทำหลาย features ใน 1 session
- ❌ ห้าม mark pass โดยไม่ test
- ❌ ห้ามสร้าง UI ที่แตกต่างจาก mockup
- ❌ ห้ามสร้าง schema ที่แตกต่างจาก design doc
- ✅ อ่าน context ก่อนเริ่มงานเสมอ
- ✅ ใช้ mockup เป็น reference สำหรับ UI
- ✅ ใช้ design doc เป็น reference สำหรับ DB/API
- ✅ ใช้ recommended skills ตาม technology
- ✅ Commit แยกต่าง feature
- ✅ Update progress ก่อนจบ session

## 📚 Reference Files

| File | Description |
|------|-------------|
| `SKILL.md` | Main skill documentation |
| `references/initializer-guide.md` | Initializer Agent guide |
| `references/coding-agent-guide.md` | Coding Agent guide |
| `references/feature-patterns.md` | Feature breakdown patterns |
| `references/module-decomposition.md` | Module and layer design guide |
| `references/troubleshooting.md` | Problem solving guide |
| `templates/feature_list.json` | Feature list template (v1.7.0) |
| `templates/modules.json` | Module definitions template |
| `templates/component_library.json` | UI Component library template |
| `templates/progress.md` | Progress log template |

## 💡 Tips

### Feature Sizing
- ทำเสร็จใน 15-30 นาที
- มี deliverable ที่ชัดเจน
- Test ได้ง่าย

### When to Split Features
- Steps เกิน 5 ข้อ
- ต้องแก้หลาย files
- Test ซับซ้อน

### Recovery
- ถ้า build fail: แก้ก่อนทำ feature ใหม่
- ถ้า feature ซับซ้อน: บันทึกใน notes, ให้ session ถัดไปทำต่อ

## ➕ การเพิ่ม Feature ใหม่ระหว่างการพัฒนา

เมื่อต้องการเพิ่ม feature ใหม่ระหว่างที่โปรเจคกำลังพัฒนาอยู่

### วิธีที่ 1: ใช้ Command

```bash
/add-feature [description]
```

### วิธีที่ 2: เพิ่มด้วยตัวเอง (Manual)

#### Step 1: แก้ไข feature_list.json

```json
{
  "features": [
    // ... features เดิม ...

    // เพิ่ม feature ใหม่
    {
      "id": 13,  // ใช้ id ถัดไป
      "category": "feature",
      "description": "Feature ใหม่ที่ต้องการเพิ่ม",
      "priority": "medium",
      "steps": [
        "ขั้นตอนที่ 1",
        "ขั้นตอนที่ 2",
        "ขั้นตอนที่ 3"
      ],
      "dependencies": [5],  // feature ที่ต้องทำก่อน (ถ้ามี)
      "passes": false,
      "tested_at": null,
      "notes": ""
    }
  ],
  "summary": {
    "total": 13,  // อัพเดทจำนวน
    "passed": 8,
    "failed": 5,  // อัพเดทจำนวน
    "last_updated": "2025-01-15T10:00:00Z"
  }
}
```

#### Step 2: บันทึกใน progress.md

```markdown
---

## Session X - ADD FEATURE
**Date**: 2025-01-15 10:00 UTC
**Type**: Feature Addition

### สิ่งที่ทำ:
- ➕ เพิ่ม Feature #13: [description]
  - เหตุผล: [ทำไมต้องเพิ่ม]
  - Priority: medium
  - Dependencies: Feature #5

### สถานะปัจจุบัน:
- Features: 8/13 passed (เพิ่มจาก 12 เป็น 13)

---
```

#### Step 3: Commit

```bash
git add feature_list.json .agent/progress.md
git commit -m "chore: Add Feature #13 - [description]"
```

---

### กฎสำคัญเมื่อเพิ่ม Feature

| ✅ ทำได้ | ❌ ห้ามทำ |
|---------|----------|
| เพิ่ม feature ใหม่ | ลบ feature ที่มีอยู่ |
| แก้ไข priority | แก้ไข description ของ feature เดิม |
| เพิ่ม dependencies | เปลี่ยน id ของ feature เดิม |
| แก้ไข steps ของ feature ที่ยังไม่ pass | แก้ไข feature ที่ pass แล้ว |

---

### Quick Reference: Feature Template

```json
{
  "id": 0,
  "category": "feature|bugfix|enhancement|refactor",
  "description": "Short description",
  "priority": "high|medium|low",
  "steps": ["Step 1", "Step 2", "Step 3"],
  "dependencies": [],
  "estimated_time": "30min",
  "passes": false,
  "tested_at": null,
  "notes": ""
}
```

### Category Guidelines

| Category | ใช้เมื่อ |
|----------|---------|
| `setup` | ตั้งค่า project, infrastructure |
| `feature` | ฟีเจอร์ใหม่ |
| `bugfix` | แก้ bug |
| `enhancement` | ปรับปรุง feature ที่มี |
| `refactor` | ปรับโครงสร้าง code |
| `test` | เพิ่ม tests |
| `docs` | documentation |

## 📝 Changelog

### v1.9.0 (2026-01-05)
- ✨ เพิ่ม `version_history` array ใน feature schema
  - เก็บประวัติการเปลี่ยนแปลงของ feature
  - บันทึก change reason, timestamp, changed_by
- ✨ เพิ่ม `interactions` array ใน feature schema
  - ติดตาม interactive elements (hover, click, animation)
  - ระบุ implemented status ของแต่ละ interaction
- ✨ เพิ่ม `component_usage` section ที่ root level
  - `shared_components`: components ที่ใช้หลาย features
  - `component_features_map`: mapping component → features
  - `reuse_opportunities`: แนะนำการ extract components
- 📄 อัพเดท schema version เป็น 1.9.0
- ✅ ทุก recommendations จาก analysis ถูก implement แล้ว

### v1.8.0 (2026-01-05)
- ✨ เพิ่ม `commits` field ใน subtask schema
  - เก็บ array ของ git commit hashes
  - เชื่อมโยง subtask กับ code changes
  - ใช้ร่วมกับ `committed_at` และ `files` fields
- 📄 อัพเดท schema version เป็น 1.8.0

### v1.7.0 (2026-01-05)
- ✨ เพิ่ม `module` field ใน feature schema
  - เชื่อมโยง feature กับ physical code module
  - สร้าง `modules.json` template
- ✨ เพิ่ม `layer` field ใน feature schema
  - 5 layers: presentation, application, domain, infrastructure, cross-cutting
  - กำหนด layer definition ใน feature_list.json
- ✨ เพิ่ม `component_library.json` template
  - กำหนด UI components ที่มีอยู่ในระบบ
  - Validation ของ `required_components` ใน features
  - Design tokens reference
  - Responsive breakpoints configuration
- ✨ เพิ่ม fields ใหม่ใน feature schema:
  - `risk_level`: low/medium/high
  - `mockup_version`: version ของ mockup ที่อ้างอิง
  - `design_tokens_used`: design tokens ที่ใช้
  - `responsive_breakpoints`: status ของแต่ละ breakpoint
- ✨ เพิ่ม subtask fields:
  - `depends_on`: subtask dependencies
  - `files`: ไฟล์ที่แก้ไข
- ✨ เพิ่ม `cross-cutting` epic template
  - Bounded context: SharedKernel
  - สำหรับ logging, caching, security, monitoring
- 📄 อัพเดท schema version เป็น 1.7.0

### v1.4.0 (2025-01-04)
- ✨ เพิ่ม `references` field ใน feature schema
  - อ้างอิง mockup, design doc, SQL, logic doc
  - Coding Agent ต้องอ่าน references ก่อนเริ่มงาน
- ✨ เพิ่ม `/edit-feature` command
  - แก้ไข feature ที่ pass แล้วโดยสร้าง feature ใหม่
  - เก็บ history ด้วย `related_features` และ `supersedes` fields
- 📝 อัพเดต feature schema template
- 📝 อัพเดต documentation

### v1.3.0 (2025-12-29)
- ✨ เพิ่ม Integration กับ ui-mockup skill
  - ตรวจสอบ `.mockups/` folder
  - สร้าง UI ตาม ASCII wireframe
  - ใช้ design tokens
- ✨ เพิ่ม Integration กับ system-design-doc skill
  - ใช้ ER Diagram สำหรับ database
  - ใช้ Flow Diagram สำหรับ business logic
- ✨ เพิ่ม Technology Detection
  - ตรวจจับ 7 technologies
  - แนะนำ skills ที่เหมาะสม
- ✨ เพิ่ม dotnet-dev skill integration
- 📝 อัพเดต config.json template
  - เพิ่ม `design_references`
  - เพิ่ม `recommended_skills`

### v1.2.0
- Initial release with basic features

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Add your changes
4. Submit a Pull Request
