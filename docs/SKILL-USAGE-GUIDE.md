# Agent Marketplace - Skills Usage Guide

> คู่มือการใช้งาน Skills สำหรับการพัฒนาระบบแบบครบวงจร (Full Stack Development)

---

## สารบัญ

1. [ภาพรวมระบบ Skills](#1-ภาพรวมระบบ-skills)
2. [Skills Reference](#2-skills-reference)
3. [Use Cases และตัวอย่างการใช้งาน](#3-use-cases-และตัวอย่างการใช้งาน)
4. [Cross-Plugin Integration](#4-cross-plugin-integration)
5. [Continuous Workflow](#5-continuous-workflow)
6. [Command Reference](#6-command-reference)
7. [Appendix](#7-appendix)

---

## 1. ภาพรวมระบบ Skills

### 1.1 Skills Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AGENT MARKETPLACE SKILLS                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │                     DESIGN PHASE                                    │     │
│  │  ┌──────────────────┐         ┌──────────────────┐                 │     │
│  │  │ system-design-doc│────────▸│    ui-mockup     │                 │     │
│  │  │                  │         │                  │                 │     │
│  │  │ • ER Diagram     │         │ • Wireframes     │                 │     │
│  │  │ • Flow Diagram   │         │ • Components     │                 │     │
│  │  │ • Data Dictionary│         │ • Design Tokens  │                 │     │
│  │  │ • Sitemap        │         │ • Responsive     │                 │     │
│  │  └────────┬─────────┘         └────────┬─────────┘                 │     │
│  └───────────┼─────────────────────────────┼──────────────────────────┘     │
│              │                             │                                 │
│              ▼                             ▼                                 │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │                    DEVELOPMENT PHASE                                │     │
│  │  ┌──────────────────────────────────────────────────────────────┐  │     │
│  │  │                   long-running                          │  │     │
│  │  │                                                               │  │     │
│  │  │   /init  ──▸  /continue  ──▸  Feature Complete         │  │     │
│  │  │                      (loop)                                   │  │     │
│  │  │                                                               │  │     │
│  │  │   ┌─────────────────────────────────────────────────────┐    │  │     │
│  │  │   │ Technology-Specific Skills (auto-detected)          │    │  │     │
│  │  │   │  • dotnet-dev (.NET Core, EF Core, Clean Architecture) │    │  │     │
│  │  │   │  • Standard practices (Node.js, Python, Go, etc.)   │    │  │     │
│  │  │   └─────────────────────────────────────────────────────┘    │  │     │
│  │  └──────────────────────────────────────────────────────────────┘  │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│              │                                                               │
│              ▼                                                               │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │                      QUALITY PHASE                                  │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │     │
│  │  │ code-review  │  │ test-runner  │  │  ai-ui-test  │              │     │
│  │  │              │  │              │  │              │              │     │
│  │  │ • Security   │  │ • Unit Tests │  │ • UI Testing │              │     │
│  │  │ • Performance│  │ • Coverage   │  │ • Regression │              │     │
│  │  │ • PR Review  │  │ • Generate   │  │ • Record GIF │              │     │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Skills Summary

| Skill | หน้าที่หลัก | Commands | Phase |
|-------|------------|----------|-------|
| **system-design-doc** | สร้างเอกสารออกแบบระบบ | 9 commands | Design |
| **ui-mockup** | สร้าง UI Mockup/Wireframe | 5 commands | Design |
| **long-running** | จัดการโปรเจคข้าม sessions | 13 commands | Development |
| **dotnet-dev** | พัฒนา .NET Core | skill reference | Implementation |
| **code-review** | ตรวจสอบคุณภาพ code | 4 commands | Quality |
| **test-runner** | รัน tests และ coverage | 5 commands | Quality |
| **ai-ui-test** | ทดสอบ UI เสมือนผู้ใช้จริง | 4 commands | Quality |

### 1.3 Cross-Plugin Integration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     3-WAY INTEGRATION ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                    ┌─────────────────────┐                                  │
│                    │  design_doc_list    │  ← Source of Truth              │
│                    │  (v2.0.0)           │    Entities, APIs, Diagrams     │
│                    └──────────┬──────────┘                                  │
│                               │                                              │
│              /sync-with-mockups    /sync-with-features                      │
│                               │                                              │
│                    ┌──────────┴──────────┐                                  │
│                    │                     │                                  │
│                    ▼                     ▼                                  │
│          ┌─────────────────┐   ┌─────────────────┐                         │
│          │  mockup_list    │   │  feature_list   │                         │
│          │  (v1.6.0)       │   │  (v1.10.0)      │                         │
│          │                 │   │                 │                         │
│          │ • Pages         │   │ • Features      │                         │
│          │ • Components    │◀──│ • Subtasks      │                         │
│          │ • Entities      │   │ • Dependencies  │                         │
│          └─────────────────┘   └─────────────────┘                         │
│                    │                     │                                  │
│                    └────────┬────────────┘                                  │
│                             │                                               │
│                      /sync-mockups                                          │
│                      /validate-integration                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.4 Version Compatibility

| File | Version | Compatible With |
|------|---------|-----------------|
| `design_doc_list.json` | 2.0.0 | mockup ≥1.6.0, feature ≥1.10.0 |
| `mockup_list.json` | 1.6.0 | design ≥2.0.0, feature ≥1.10.0 |
| `feature_list.json` | 1.10.0 | design ≥2.0.0, mockup ≥1.6.0 |

---

## 2. Skills Reference

### 2.1 system-design-doc

> สร้างเอกสารออกแบบระบบมาตรฐาน รองรับ Reverse Engineering จาก codebase

**Commands:**

| Command | Description |
|---------|-------------|
| `/system-design-doc` | คำสั่งทั่วไป (รองรับทุก mode) |
| `/create-design-doc` | สร้างเอกสารจาก requirements |
| `/reverse-engineer` | สร้างเอกสารจาก codebase ที่มีอยู่ |
| `/create-diagram` | สร้าง diagram เฉพาะประเภท |
| `/edit-section` | แก้ไขส่วนใดส่วนหนึ่งของเอกสาร |
| `/validate-design-doc` | ตรวจสอบความครบถ้วน |
| `/sync-with-mockups` | Sync กับ ui-mockup |
| `/sync-with-features` | Sync กับ long-running |
| `/validate-integration` | ตรวจสอบ cross-references |

**Files Created:**
- `.design-docs/design_doc_list.json` - Tracking file
- `system-design-[project].md` - Main document
- Diagrams: ER, Flow, DFD, Sequence, Sitemap, State, Class, Architecture

**Integration Points:**
- → ui-mockup: Sitemap → pages, Entities → form fields
- → long-running: Modules → features, APIs → endpoints

---

### 2.2 ui-mockup

> สร้าง UI Mockup/Wireframe ด้วย ASCII art และ component specifications

**Commands:**

| Command | Description |
|---------|-------------|
| `/init-mockup` | Initialize mockup environment |
| `/create-mockup [page]` | สร้าง mockup หน้าใหม่ |
| `/create-mockups-parallel` | สร้างหลาย mockups พร้อมกัน |
| `/edit-mockup [page] - [changes]` | แก้ไข mockup ที่มีอยู่ |
| `/list-mockups` | ดูรายการ mockups ทั้งหมด |

**Files Created:**
- `.mockups/mockup_list.json` - Tracking file
- `.mockups/_design-tokens.yaml` - Design tokens
- `.mockups/[NNN]-[page-name].mockup.md` - Individual mockups

**Output Structure:**
```
.mockups/
├── mockup_list.json
├── _design-tokens.yaml
├── 001-login.mockup.md
├── 002-register.mockup.md
├── 003-dashboard.mockup.md
└── ...
```

**Integration Points:**
- ← system-design-doc: Takes Sitemap and entity specs
- → long-running: Provides UI specs for features
- → frontend-design: Supplies specs for HTML/CSS/React generation

---

### 2.3 long-running

> Harness สำหรับ AI Agent ที่ทำงานข้าม context windows

**Commands:**

| Command | Description |
|---------|-------------|
| `/init-project` | สร้าง CLAUDE.md และ project config |
| `/init` | Initialize agent สำหรับโปรเจคใหม่ |
| `/init-existing` | Initialize agent สำหรับโปรเจคที่มีอยู่ |
| `/continue` | ทำงานต่อจาก session ก่อน (Coding Agent) |
| `/status` | ดูสถานะความคืบหน้า |
| `/add-feature` | เพิ่ม feature ใหม่ |
| `/edit-feature` | แก้ไข feature ที่มีอยู่ |
| `/generate-features-from-design` | สร้าง features จาก design doc |
| `/generate-features-from-mockups` | สร้าง features จาก mockups |
| `/validate-coverage` | ตรวจสอบ coverage ครบหรือไม่ |
| `/sync-mockups` | Sync features กับ mockups |
| `/dependencies` | ดู dependencies ระหว่าง features |
| `/migrate` | Migrate schema version |

**Files Created:**
- `feature_list.json` - Feature tracking
- `.agent/config.json` - Agent configuration
- `.agent/progress.md` - Session logs

**Agent Types:**
1. **Initializer Agent** - Run once to set up project
2. **Coding Agent** - Run multiple times via `/continue`

**Feature Schema (v1.10.0):**
```json
{
  "schema_version": "1.10.0",
  "integration": {
    "design_doc_path": "design_doc_list.json",
    "mockup_list_path": ".mockups/mockup_list.json"
  },
  "epics": [...],
  "features": [{
    "id": 1,
    "epic": "setup",
    "category": "setup|domain|api|quality",
    "status": "pending|in_progress|blocked|passed",
    "subtasks": [...],
    "design_doc_refs": {
      "entity_ref": "ENT-001",
      "api_ref": "API-001",
      "section": "api-endpoints"
    },
    "mockup_page_refs": ["004", "005"]
  }]
}
```

---

### 2.4 dotnet-dev

> Expert .NET Core development with Clean Architecture patterns

**Key Capabilities:**
- Domain-first approach with Rich Domain Models
- Clean Architecture (Domain → Application → Infrastructure → WebApi)
- Repository Pattern + Unit of Work
- CQRS with MediatR
- EF Core with PostgreSQL/SQL Server
- .NET Aspire support

**Project Structure:**
```
Solution/
├── src/
│   ├── Domain/              (Entities, ValueObjects, Events)
│   ├── Application/         (Use cases, DTOs, MediatR Handlers)
│   ├── Infrastructure/      (DbContext, Repositories, Services)
│   └── WebApi/              (Controllers, Middleware, Program.cs)
├── tests/
│   ├── Domain.Tests/
│   ├── Application.Tests/
│   └── Integration.Tests/
└── [AppName].AppHost/       (.NET Aspire)
```

**Usage:** Auto-detected when project contains `*.csproj` or `*.sln` files

---

### 2.5 code-review

> ตรวจสอบคุณภาพ code, security, และ best practices

**Commands:**

| Command | Description |
|---------|-------------|
| `/code-review [path]` | Review code ที่ path ระบุ |
| `/code-review --security` | เฉพาะ security issues |
| `/code-review --performance` | เฉพาะ performance issues |
| `/review-pr [number]` | Review Pull Request |

**Review Categories:**
- Security vulnerabilities (OWASP Top 10)
- Performance issues
- Code quality and best practices
- Architecture consistency

---

### 2.6 test-runner

> รัน tests, สร้าง test cases, และ coverage analysis

**Commands:**

| Command | Description |
|---------|-------------|
| `/test` | รัน tests ทั้งหมด |
| `/test [name]` | รัน tests เฉพาะที่ match |
| `/test --failed` | รัน tests ที่ fail ครั้งก่อน |
| `/test-coverage` | แสดง coverage report |
| `/generate-tests [file]` | สร้าง test cases อัตโนมัติ |
| `/test-gaps` | หา tests ที่ขาด |

---

### 2.7 ai-ui-test

> ทดสอบ UI เสมือนผู้ใช้จริง ด้วย browser automation

**Commands:**

| Command | Description |
|---------|-------------|
| `/ui-test [scenario]` | ทดสอบ UI scenario |
| `/ui-test --record-gif` | ทดสอบพร้อมบันทึก GIF |
| `/ui-test-all` | รัน tests ทั้งหมด (regression) |
| `/ui-test-create [page]` | สร้าง test scenario จาก mockup |

**Example:**
```
/ui-test ทดสอบหน้า Login - กรอก email test@test.com password 123456
```

---

## 3. Use Cases และตัวอย่างการใช้งาน

### Use Case 1: Full Stack Development (New Project)

**Scenario:** เริ่มต้นโปรเจคใหม่ทั้งหมด จาก requirements ไปจนถึง deployment

**Workflow:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 1: Plan Mode                                                            │
│ พิมพ์ "plan" หรือกด Shift+Tab                                                │
│ → Claude วิเคราะห์ requirements และเสนอแผน                                   │
│ → User approve                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 2: /init-project                                                        │
│ สร้าง CLAUDE.md และ project configuration                                   │
│                                                                              │
│ Output:                                                                      │
│   ✅ CLAUDE.md created                                                       │
│   💡 Next: /system-design-doc                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 3: /system-design-doc สร้างเอกสารสำหรับระบบ HR Management               │
│                                                                              │
│ Output:                                                                      │
│   ✅ system-design-hr.md created                                            │
│   📊 10 sections, 7 diagrams, 12 entities                                   │
│   💡 Next: /init-mockup                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 4: /init-mockup                                                         │
│         /create-mockups-parallel                                            │
│                                                                              │
│ Output:                                                                      │
│   ✅ mockup_list.json created (15 pages)                                    │
│   ✅ 15 mockup files created                                                │
│   💡 Next: /sync-with-mockups                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 5: /sync-with-mockups                                                   │
│         /sync-with-features (optional)                                       │
│                                                                              │
│ Output:                                                                      │
│   ✅ Synced design doc ↔ mockups                                            │
│   📊 15/15 pages mapped, 8/8 entities mapped                                │
│   💡 Next: /init                                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 6: /init สร้าง HR API ด้วย .NET Core, EF Core                     │
│                                                                              │
│ Output:                                                                      │
│   ✅ feature_list.json created (25 features)                                │
│   ✅ .agent/ folder created                                                 │
│   📊 Features: setup(3), domain(5), api(10), quality(7)                     │
│   💡 Next: /continue                                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 7: /continue (Development Loop)                                         │
│                                                                              │
│ ┌───────────────────────────────────────────────────────────────────────┐   │
│ │  Session 1: Feature #1 - Setup project structure                      │   │
│ │  Session 2: Feature #2 - Database configuration                       │   │
│ │  Session 3: Feature #3 - Employee entity                              │   │
│ │  ...                                                                  │   │
│ │  Session N: Feature #25 - API documentation                           │   │
│ └───────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│ Each session:                                                                │
│   1. Read context (progress.md, git log)                                    │
│   2. Select next feature (passes=false)                                     │
│   3. Implement with dotnet-dev patterns                                     │
│   4. Test and mark passed                                                   │
│   5. Commit and update progress                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 8: Quality Phase                                                        │
│                                                                              │
│ /code-review src/                    → Fix security/performance issues      │
│ /test-coverage                       → Ensure coverage > 80%                │
│ /ui-test-all                         → Regression testing                   │
│ /validate-integration                → Check all refs valid                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Use Case 2: เพิ่ม Agent ให้โปรเจคที่มีอยู่

**Scenario:** มีโปรเจคที่พัฒนาไปแล้วบางส่วน ต้องการเพิ่ม long-running agent

**Commands:**
```bash
# Step 1: Analyze existing project
/init-existing

# Output:
# ✅ Agent Environment Added!
# 📊 Project Analysis:
#    • Technology: .NET Core 8
#    • Files analyzed: 45 files
#    • Git commits: 127 commits
# 📋 Features Identified:
#    • Completed: 8 features (marked as passed)
#    • Remaining: 5 features (TODO found in code)

# Step 2: Review and continue
/status

# Step 3: Continue development
/continue
```

---

### Use Case 3: Design-First Workflow

**Scenario:** เริ่มจากออกแบบเอกสารก่อน แล้วค่อยสร้าง features

**Commands:**
```bash
# Step 1: Create design document
/system-design-doc สร้างเอกสารสำหรับระบบ E-commerce

# Step 2: Generate features from design
/generate-features-from-design

# Step 3: Sync references
/sync-with-features

# Step 4: Initialize agent
/init

# Step 5: Start development
/continue
```

---

### Use Case 4: UI-First Workflow

**Scenario:** เริ่มจากออกแบบ UI ก่อน แล้วค่อยสร้าง features

**Commands:**
```bash
# Step 1: Initialize mockup environment
/init-mockup

# Step 2: Create all mockups in parallel
/create-mockups-parallel

# Step 3: Generate features from mockups
/generate-features-from-mockups

# Step 4: Sync mockups with features
/sync-mockups

# Step 5: Initialize agent and develop
/init
/continue
```

---

### Use Case 5: .NET Backend Development

**Scenario:** พัฒนา .NET Core API ด้วย Clean Architecture

**Commands:**
```bash
# Step 1: Initialize with .NET description
/init สร้าง Todo API ด้วย .NET Core 8, EF Core, PostgreSQL, Clean Architecture

# Output:
# ✅ Initialize Long-Running Agent สำเร็จ!
# 🔧 Technology detected: .NET Core
# 📦 Skills activated: dotnet-dev
# 📊 Features: 12 features identified
#    • setup: 2 (project structure, database)
#    • domain: 2 (entities, DbContext)
#    • api: 5 (CRUD endpoints)
#    • quality: 3 (validation, error handling, docs)

# Step 2: Continue (uses dotnet-dev patterns automatically)
/continue
```

**dotnet-dev จะ apply:**
- Clean Architecture folder structure
- Repository Pattern + Unit of Work
- EF Core configurations
- Dependency Injection setup
- MediatR handlers (if CQRS)

---

### Use Case 6: Code Review Before Commit

**Scenario:** Review code ก่อน commit เพื่อหา issues

**Commands:**
```bash
# After implementing feature
/code-review src/

# Output:
# 📋 Code Review Results:
#
# Security Issues (High):
# ❌ SQL Injection vulnerability in UserRepository.cs:45
#    → Use parameterized queries
#
# Performance Issues (Medium):
# ⚠️ N+1 query in OrderService.cs:78
#    → Use Include() for eager loading
#
# Code Quality:
# ⚠️ Missing null checks in PaymentController.cs

# Fix issues then continue
/continue

# Commit
git commit -m "feat: Add payment processing"
```

---

### Use Case 7: AI UI Testing

**Scenario:** ทดสอบ UI เสมือนผู้ใช้จริง

**Commands:**
```bash
# Step 1: Create test scenarios from mockups
/ui-test-create จาก .mockups/001-login.mockup.md

# Output:
# ✅ Test scenarios created:
#    • test_login_valid_credentials
#    • test_login_invalid_email
#    • test_login_wrong_password
#    • test_login_empty_fields

# Step 2: Run specific test
/ui-test ทดสอบหน้า Login - กรอก email test@test.com password Test@123

# Output:
# 🧪 Testing Login Page...
# 1. Navigate to /auth/login ✅
# 2. Fill email: test@test.com ✅
# 3. Fill password: Test@123 ✅
# 4. Click Submit button ✅
# 5. Wait for redirect... ✅
# 6. Verify Dashboard loaded ✅
#
# ✅ Test PASSED!

# Step 3: Run all UI tests (regression)
/ui-test-all
```

---

### Use Case 8: Validate & Sync Before Release

**Scenario:** ตรวจสอบความครบถ้วนก่อน release

**Commands:**
```bash
# Step 1: Validate design document
/validate-design-doc

# Step 2: Sync all references
/sync-with-mockups
/sync-with-features
/sync-mockups

# Step 3: Validate integration
/validate-integration

# Output:
# ╔════════════════════════════════════════════════════════════════════╗
# ║                 CROSS-PLUGIN INTEGRATION REPORT                     ║
# ╠════════════════════════════════════════════════════════════════════╣
# ║                                                                      ║
# ║ OVERALL INTEGRATION SCORE: 92% (Excellent)                          ║
# ║                                                                      ║
# ║ Entity Coverage: 100% (8/8 entities mapped)                         ║
# ║ API Coverage: 95% (19/20 APIs mapped)                               ║
# ║ Page Coverage: 87% (13/15 pages have features)                      ║
# ║ Sync Freshness: 100%                                                ║
# ║                                                                      ║
# ║ Recommendations:                                                     ║
# ║ - [ ] Add features for pages: Settings, Profile                     ║
# ║ - [ ] Map API-020 to a feature                                      ║
# ╚════════════════════════════════════════════════════════════════════╝

# Step 4: Validate feature coverage
/validate-coverage

# Step 5: Check test coverage
/test-coverage

# Step 6: Run all UI tests
/ui-test-all
```

---

## 4. Cross-Plugin Integration

### 4.1 Integration Architecture

ทั้ง 3 plugins ทำงานร่วมกันผ่าน JSON tracking files:

| Plugin | Tracking File | Version |
|--------|--------------|---------|
| system-design-doc | `design_doc_list.json` | 2.0.0 |
| ui-mockup | `mockup_list.json` | 1.6.0 |
| long-running | `feature_list.json` | 1.10.0 |

### 4.2 Sync Commands

| Command | Direction | What Syncs |
|---------|-----------|------------|
| `/sync-with-mockups` | Design ↔ Mockup | Entities, Pages, Sections |
| `/sync-with-features` | Design ↔ Feature | APIs, Entities, Diagrams |
| `/sync-mockups` | Feature ↔ Mockup | Mockup validation, Status |
| `/validate-integration` | All 3 | Comprehensive validation |

### 4.3 Reference Fields

**design_doc_list.json:**
```json
{
  "integration": {
    "mockup_list_path": ".mockups/mockup_list.json",
    "feature_list_path": "feature_list.json"
  },
  "entities": [{
    "id": "ENT-001",
    "mockup_entity_ref": "User",
    "feature_ids": [3, 5, 6, 7]
  }],
  "api_endpoints": [{
    "id": "API-001",
    "feature_id": 5,
    "page_refs": ["004"]
  }]
}
```

**mockup_list.json:**
```json
{
  "integration": {
    "design_doc_path": "design_doc_list.json",
    "feature_list_path": "feature_list.json"
  },
  "entities": [{
    "name": "User",
    "design_doc_entity_ref": "ENT-001"
  }],
  "pages": [{
    "id": "004",
    "design_doc_section": "user-management",
    "design_doc_api_refs": ["API-001"],
    "implemented_by_features": [5]
  }]
}
```

**feature_list.json:**
```json
{
  "integration": {
    "design_doc_path": "design_doc_list.json",
    "mockup_list_path": ".mockups/mockup_list.json"
  },
  "features": [{
    "id": 5,
    "design_doc_refs": {
      "entity_ref": "ENT-001",
      "api_ref": "API-001"
    },
    "mockup_page_refs": ["004"]
  }]
}
```

### 4.4 Troubleshooting Integration Issues

**Orphan Detection:**
```bash
/validate-integration
```

**Common Issues:**

| Issue | Solution |
|-------|----------|
| Entity without mockup | Create mockup entity or run `/sync-with-mockups` |
| API without feature | Run `/generate-features-from-design` |
| Page without feature | Run `/generate-features-from-mockups` |
| Stale sync timestamps | Run sync commands again |
| Version mismatch | Run `/migrate` for feature_list |

---

## 5. Continuous Workflow

### 5.1 Session-Based Development

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SESSION-BASED DEVELOPMENT                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Session 1            Session 2            Session 3            Session N   │
│  ┌─────────┐          ┌─────────┐          ┌─────────┐          ┌─────────┐│
│  │/continue│          │/continue│          │/continue│          │/continue││
│  │         │          │         │          │         │          │         ││
│  │Feature 1│   ──▸    │Feature 2│   ──▸    │Feature 3│   ──▸    │Feature N││
│  │         │          │         │          │         │          │         ││
│  │ ✅ Pass │          │ ✅ Pass │          │ ✅ Pass │          │ ✅ Pass ││
│  └─────────┘          └─────────┘          └─────────┘          └─────────┘│
│       │                    │                    │                    │      │
│       ▼                    ▼                    ▼                    ▼      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     .agent/progress.md                               │   │
│  │  Session logs, commits, feature status                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 What Happens in `/continue`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         /continue WORKFLOW                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. READ CONTEXT                                                            │
│     ├── CLAUDE.md (project rules)                                           │
│     ├── .agent/progress.md (previous sessions)                              │
│     ├── feature_list.json (features & status)                               │
│     ├── git log (recent commits)                                            │
│     └── .mockups/ (if exists, for UI features)                              │
│                                                                              │
│  2. VERIFY ENVIRONMENT                                                       │
│     ├── Build passes                                                        │
│     ├── Tests pass                                                          │
│     └── No blocking issues                                                  │
│                                                                              │
│  3. SELECT FEATURE                                                           │
│     └── Next feature where passes=false, by priority                        │
│                                                                              │
│  4. IMPLEMENT                                                                │
│     ├── Read mockup (if UI feature)                                         │
│     ├── Read design doc (for specs)                                         │
│     ├── Implement subtasks one by one                                       │
│     └── Commit each subtask: task(#X.Y): description                        │
│                                                                              │
│  5. TEST                                                                     │
│     ├── Build test                                                          │
│     ├── Unit tests                                                          │
│     └── Manual verification                                                 │
│                                                                              │
│  6. MARK PASSED                                                              │
│     └── Update feature_list.json: passes=true                               │
│                                                                              │
│  7. FINAL COMMIT                                                             │
│     └── feat: [feature description]                                         │
│                                                                              │
│  8. UPDATE PROGRESS                                                          │
│     └── .agent/progress.md with session summary                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Git Commit Patterns

| Phase | Commit Prefix | Example |
|-------|---------------|---------|
| Subtask | `task(#X.Y):` | `task(#5.1): Create Employee entity` |
| Feature complete | `feat:` | `feat: Implement Employee CRUD API` |
| Bug fix | `fix:` | `fix: Handle null employee in GetById` |
| Docs | `docs:` | `docs: Add API documentation` |

### 5.4 Progress Tracking

**feature_list.json states:**

| Status | Meaning |
|--------|---------|
| `pending` | Not started |
| `in_progress` | Currently working |
| `blocked` | Waiting for dependency |
| `review` | Needs review |
| `passed` | Completed and tested |

**progress.md template:**
```markdown
# Session 5 - 2025-01-05

## Context
- Previous: Session 4 completed Feature #4
- Current: Feature #5 - GET /api/employees

## Work Done
- [x] Created EmployeeController
- [x] Implemented GetAll endpoint
- [x] Implemented GetById endpoint
- [x] Added pagination support
- [x] Tests pass

## Commits
- abc123: task(#5.1): Create EmployeeController
- def456: task(#5.2): Implement GetAll endpoint
- ghi789: feat: Implement Employee list API

## Next
- Feature #6: POST /api/employees
```

---

## 6. Command Reference

### 6.1 Design Phase Commands

| Command | Skill | Description |
|---------|-------|-------------|
| `/system-design-doc` | system-design-doc | สร้างเอกสารออกแบบ (general) |
| `/create-design-doc` | system-design-doc | สร้างจาก requirements |
| `/reverse-engineer` | system-design-doc | สร้างจาก codebase |
| `/create-diagram [type]` | system-design-doc | สร้าง diagram เฉพาะ |
| `/edit-section [section]` | system-design-doc | แก้ไข section |
| `/validate-design-doc` | system-design-doc | ตรวจสอบความครบถ้วน |
| `/init-mockup` | ui-mockup | Initialize mockup tracking |
| `/create-mockup [page]` | ui-mockup | สร้าง mockup หน้าเดียว |
| `/create-mockups-parallel` | ui-mockup | สร้างหลายหน้าพร้อมกัน |
| `/edit-mockup [page] - [changes]` | ui-mockup | แก้ไข mockup |
| `/list-mockups` | ui-mockup | ดูรายการ mockups |

### 6.2 Sync Phase Commands

| Command | Direction | Purpose |
|---------|-----------|---------|
| `/sync-with-mockups` | Design ↔ Mockup | Sync entities และ pages |
| `/sync-with-features` | Design ↔ Feature | Sync APIs และ entities |
| `/sync-mockups` | Feature ↔ Mockup | Validate mockup refs |
| `/validate-integration` | All 3 | ตรวจสอบ cross-references ทั้งหมด |

### 6.3 Development Phase Commands

| Command | Description |
|---------|-------------|
| `/init-project` | สร้าง CLAUDE.md และ project config |
| `/init [description]` | Initialize agent สำหรับโปรเจคใหม่ |
| `/init-existing` | Initialize agent สำหรับโปรเจคที่มีอยู่ |
| `/continue` | ทำงานต่อจาก session ก่อน (Coding Agent) |
| `/status` | ดูสถานะความคืบหน้า |
| `/add-feature [description]` | เพิ่ม feature ใหม่ |
| `/edit-feature [id]` | แก้ไข feature ที่มีอยู่ |
| `/generate-features-from-design` | สร้าง features จาก design doc |
| `/generate-features-from-mockups` | สร้าง features จาก mockups |
| `/validate-coverage` | ตรวจสอบ coverage ครบหรือไม่ |
| `/dependencies` | ดู dependencies ระหว่าง features |
| `/migrate` | Migrate schema version |

### 6.4 Quality Phase Commands

| Command | Description |
|---------|-------------|
| `/code-review [path]` | Review code ที่ path |
| `/code-review --security` | Review เฉพาะ security |
| `/code-review --performance` | Review เฉพาะ performance |
| `/review-pr [number]` | Review Pull Request |
| `/test` | รัน tests ทั้งหมด |
| `/test [name]` | รัน tests เฉพาะที่ match |
| `/test --failed` | รัน tests ที่ fail ครั้งก่อน |
| `/test-coverage` | แสดง coverage report |
| `/generate-tests [file]` | สร้าง test cases อัตโนมัติ |
| `/test-gaps` | หา tests ที่ขาด |
| `/ui-test [scenario]` | ทดสอบ UI scenario |
| `/ui-test --record-gif` | ทดสอบพร้อมบันทึก GIF |
| `/ui-test-all` | รัน UI tests ทั้งหมด |
| `/ui-test-create [page]` | สร้าง test scenario |

### 6.5 Quick Reference Cheatsheet

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        QUICK REFERENCE CHEATSHEET                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  🆕 โปรเจคใหม่ (Full Workflow):                                               │
│     /init-project → /system-design-doc → /init-mockup →                     │
│     /create-mockups-parallel → /sync-with-mockups → /init →           │
│     /continue (loop) → /code-review → /test                                 │
│                                                                              │
│  📂 โปรเจคที่มีอยู่:                                                          │
│     /init-existing → /status → /continue                        │
│                                                                              │
│  ▶️ ทำต่อจากครั้งก่อน:                                                        │
│     /continue                                                               │
│                                                                              │
│  📊 ดูความคืบหน้า:                                                           │
│     /status                                                           │
│                                                                              │
│  ➕ เพิ่ม Feature:                                                           │
│     /add-feature [description]                                              │
│                                                                              │
│  🔄 Sync ก่อน Release:                                                       │
│     /sync-with-mockups → /sync-with-features →                              │
│     /sync-mockups → /validate-integration                                   │
│                                                                              │
│  🔍 Code Review:                                                             │
│     /code-review src/ หรือ /review-pr [number]                              │
│                                                                              │
│  🧪 Testing:                                                                 │
│     /test → /test-coverage → /ui-test-all                                   │
│                                                                              │
│  🎨 สร้าง UI Mockup:                                                         │
│     /init-mockup → /create-mockup [page]                                    │
│                                                                              │
│  📝 สร้างเอกสาร:                                                             │
│     /system-design-doc [description]                                        │
│                                                                              │
│  🔧 Fix Bug:                                                                 │
│     บอก Claude: "มี bug ที่..."                                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Appendix

### 7.1 Files Structure

```
project-root/
├── CLAUDE.md                       # Project rules for Claude
│
├── .design-docs/                   # System Design Documents
│   ├── design_doc_list.json        # Tracking file (v2.0.0)
│   └── system-design-[project].md  # Main document
│
├── .mockups/                       # UI Mockups
│   ├── mockup_list.json            # Tracking file (v1.6.0)
│   ├── _design-tokens.yaml         # Design tokens
│   └── [NNN]-[page].mockup.md      # Individual mockups
│
├── .agent/                         # Long-Running Agent
│   ├── config.json                 # Agent configuration
│   └── progress.md                 # Session logs
│
├── feature_list.json               # Feature tracking (v1.10.0)
│
└── ... (project source files)
```

### 7.2 Technology Detection

| Technology | Detection Files | Primary Skill |
|------------|-----------------|---------------|
| .NET Core | `*.csproj`, `*.sln` | dotnet-dev |
| Node.js | `package.json` | Standard practices |
| Python | `requirements.txt`, `pyproject.toml` | Standard practices |
| Go | `go.mod` | Standard practices |
| Java/Spring | `pom.xml`, `build.gradle` | Standard practices |
| PHP/Laravel | `composer.json` | Standard practices |

### 7.3 Troubleshooting

| Problem | Solution |
|---------|----------|
| Feature not progressing | Check dependencies in feature_list.json |
| Mockup not validated | Run `/sync-mockups` |
| Integration score low | Run `/validate-integration` and fix orphans |
| Build fails | Check error messages, fix before `/continue` |
| Tests failing | Fix tests before marking feature as passed |
| Context lost | Read `.agent/progress.md` for last session |

### 7.4 Best Practices

1. **Always start with Plan Mode** - พิมพ์ "plan" หรือ Shift+Tab
2. **Create CLAUDE.md first** - กำหนด project rules ก่อนเริ่ม
3. **Design before code** - สร้างเอกสารและ mockups ก่อน
4. **Sync regularly** - Run sync commands หลังมีการเปลี่ยนแปลง
5. **Test before pass** - ทดสอบก่อน mark feature ว่า passed
6. **Commit often** - ใช้ subtask commits
7. **Review before release** - ใช้ code-review และ validation commands

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2025-01 | Cross-plugin integration, 8 use cases, all skills coverage |
| 1.0.0 | 2024-12 | Initial version |

---

*เอกสารนี้ครอบคลุมการใช้งาน Skills ทั้งหมดใน Agent Marketplace*
*รองรับ Full Stack Development ตั้งแต่ Design จนถึง Testing*
