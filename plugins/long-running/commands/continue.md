---
description: ทำงานต่อจาก session ก่อน - Coding Agent mode
allowed-tools: Bash(*), Read(*), Write(*), Edit(*)
---

# Continue - Coding Agent Mode

คุณคือ **Coding Agent** ที่จะทำงานต่อจาก session ก่อนหน้า

## ขั้นตอนที่ต้องทำ (เรียงตามลำดับ)

### Step 0: อ่านเอกสารสำคัญก่อนเริ่มงาน (สำคัญมาก!)

**ทุกครั้งที่เริ่ม session ใหม่ ต้องอ่านเอกสารเหล่านี้:**

```bash
# 1. อ่าน CLAUDE.md ที่ root folder (ถ้ามี)
cat CLAUDE.md 2>/dev/null && echo "--- CLAUDE.md found, ทำตามกฎที่ระบุ ---"

# 2. อ่าน .agent/project-rules.md (ถ้ามี - กฎเฉพาะโปรเจค)
cat .agent/project-rules.md 2>/dev/null

# 3. อ่าน README.md เพื่อเข้าใจโปรเจค
cat README.md 2>/dev/null | head -50
```

**เอกสารที่ต้องมองหาและทำตาม:**

| ไฟล์ | ความหมาย |
|------|----------|
| `CLAUDE.md` | กฎหลักสำหรับ Claude - **ต้องทำตามทุกข้อ** |
| `.agent/project-rules.md` | กฎเฉพาะโปรเจค |
| `CONTRIBUTING.md` | แนวทางการพัฒนา |
| `.editorconfig` | coding style |

**สิ่งที่ต้องจดจำจากเอกสาร:**
- ✅ Coding standards และ naming conventions
- ✅ คำสั่งที่ต้องรันก่อนเริ่มงาน
- ✅ กฎพิเศษที่ต้องทำตาม
- ✅ สิ่งที่ห้ามทำ

⚠️ **กฎจาก CLAUDE.md มีความสำคัญสูงสุด ต้องทำตามก่อนกฎอื่นๆ!**

---

### Step 0.5: ตรวจสอบเอกสารออกแบบและ UI Mockups (สำคัญมาก!)

**ก่อนเริ่มพัฒนา feature ต้องตรวจสอบเอกสารอ้างอิงจาก skill อื่นๆ:**

```bash
# 1. ตรวจสอบ System Design Document (จาก system-design-doc skill)
ls -la *.design-doc.md 2>/dev/null || ls -la docs/*.md 2>/dev/null
# หรือค้นหา design document
find . -name "*design*.md" -o -name "*system*.md" 2>/dev/null | head -10

# 2. ตรวจสอบ UI Mockups (จาก ui-mockup skill)
ls -la .mockups/ 2>/dev/null
# ดูรายการ mockups ทั้งหมด
ls -la .mockups/*.mockup.md 2>/dev/null

# 3. ตรวจสอบ mockup_list.json (ถ้ามี)
cat .mockups/mockup_list.json 2>/dev/null
```

**📁 เอกสารอ้างอิงจาก Skills อื่น:**

| Folder/File | Skill ที่สร้าง | ใช้ทำอะไร |
|-------------|---------------|----------|
| `.mockups/` | ui-mockup | **UI Structural Spec** - บอก components, data flow, layout structure (ไม่ใช่ visual blueprint) |
| `.mockups/*.mockup.md` | ui-mockup | Component specs + data requirements (ASCII wireframe เป็นแค่ structural reference) |
| `.mockups/_design-tokens.yaml` | ui-mockup | Design tokens (colors, spacing, typography) |
| `*design-doc.md` | system-design-doc | **System Architecture** - ER Diagram, Flow, DFD |
| `docs/` | system-design-doc | เอกสารออกแบบระบบ |

**🎯 วิธีใช้เอกสารอ้างอิง:**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    REFERENCE DOCUMENT USAGE                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  📐 UI Mockup (.mockups/) — Structural Reference เท่านั้น            │
│  ├── อ่าน component specs → รู้ว่าต้องมี components อะไรบ้าง        │
│  ├── อ่าน data requirements → รู้ว่าต้องแสดง/รับข้อมูลอะไร          │
│  ├── ใช้ design tokens สำหรับ styling                              │
│  └── **frontend-design มีอิสระในการออกแบบ visual!**                │
│                                                                     │
│  📄 System Design Doc                                               │
│  ├── ดู ER Diagram สำหรับ database schema                          │
│  ├── อ่าน Data Dictionary สำหรับ field specifications              │
│  ├── ดู Flow Diagram สำหรับ business logic                         │
│  └── ดู API specs สำหรับ endpoint implementation                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**⚠️ ถ้าพบ `.mockups/` folder:**
1. **ต้อง** อ่าน mockup ของหน้าที่กำลังพัฒนา — เพื่อเข้าใจ structural requirements
2. **ต้อง** implement ครบทุก components ที่ระบุใน component specs
3. **ต้อง** แสดง/รับข้อมูลครบตาม data requirements
4. **ต้อง** ใช้ design tokens ที่กำหนด (colors, spacing, fonts)
5. **อิสระ** ในการออกแบบ visual, layout, animation, UX — ไม่ต้องเหมือน ASCII wireframe
6. ถ้าใช้ `/frontend-design` skill → ให้ skill ออกแบบ visual ได้เต็มที่

**⚠️ ถ้าพบ Design Document:**
1. **ต้อง** อ่าน ER Diagram ก่อนสร้าง database
2. **ต้อง** ใช้ Data Dictionary สำหรับ field types
3. **ต้อง** ทำตาม Flow Diagram สำหรับ business logic

---

### Step 0.5.1: Read Flow Context (v2.0.0)

**ถ้า feature_list.json มี `flows` หรือ `state_contracts`:**

```bash
# อ่าน flows
cat feature_list.json | jq '.flows[] | {id, name, type, steps: [.steps[].label]}'

# อ่าน state contracts
cat feature_list.json | jq '.state_contracts | keys'

# ดู flow progress
cat feature_list.json | jq '.flows[] | {
  name,
  progress: ([.steps[] | select(.feature_id as $fid | $fid)] | length),
  total: (.steps | length)
}'
```

**แสดง Flow Summary:**

```
📊 Flow Progress:
  🛒 [Flow Name] ([type]): X/Y steps ✅
     ├── ✅ [Step 1] (Feature #N)
     ├── 🔲 [Step 2] (Feature #N) ← NEXT
     └── 🔲 [Step 3] (Feature #N)
     State: [StateA] ✅ → [StateB] ❌

  (แสดงทุก flows)
```

**⚠️ กฎ:**
- ต้องอ่าน flows ก่อนเลือก feature — เข้าใจ big picture
- ถ้า feature อยู่ใน flow → อ่าน entry/exit conditions และ error_paths
- ถ้า feature มี state_consumes → ตรวจว่า state ถูก produce แล้ว

---

### Step 0.6: ตรวจสอบ Technology Stack และเรียกใช้ Skill ที่เหมาะสม

**ตรวจสอบว่าโปรเจคใช้ technology อะไร:**

```bash
# ตรวจสอบ Technology Stack
echo "=== Detecting Technology Stack ==="

# .NET Core
ls -la *.csproj *.sln 2>/dev/null && echo "→ .NET Core: ใช้ /dotnet-dev skill"

# Node.js / JavaScript / TypeScript
ls -la package.json 2>/dev/null && echo "→ Node.js detected"

# Python
ls -la requirements.txt pyproject.toml 2>/dev/null && echo "→ Python detected"

# Go
ls -la go.mod 2>/dev/null && echo "→ Go detected"

# Rust
ls -la Cargo.toml 2>/dev/null && echo "→ Rust detected"

# PHP
ls -la composer.json 2>/dev/null && echo "→ PHP detected"

# Java
ls -la pom.xml build.gradle 2>/dev/null && echo "→ Java detected"

# ตรวจสอบ recommended skills จาก config
cat .agent/config.json 2>/dev/null | grep -A 5 "recommended_skills"
```

**🔧 Skills ที่รองรับตาม Technology:**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AVAILABLE SKILLS BY TECHNOLOGY                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Technology        │ Files ที่บ่งบอก      │ Skill ที่ใช้            │
│  ─────────────────────────────────────────────────────────────────  │
│  .NET Core/ASP.NET │ *.csproj, *.sln      │ /dotnet-dev ⭐         │
│  Node.js/React/Vue │ package.json         │ (standard practices)   │
│  Python/FastAPI    │ requirements.txt     │ (standard practices)   │
│  Go                │ go.mod               │ (standard practices)   │
│  Rust              │ Cargo.toml           │ (standard practices)   │
│  PHP/Laravel       │ composer.json        │ (standard practices)   │
│  Java/Spring       │ pom.xml, build.gradle│ (standard practices)   │
│                                                                     │
│  ⭐ = มี specialized skill พร้อมใช้งาน                              │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                    UNIVERSAL SKILLS (ใช้ได้กับทุก Technology)        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  /system-design-doc  │ สร้างเอกสารออกแบบระบบ                        │
│  /ui-mockup          │ สร้าง UI wireframes                          │
│  /code-review        │ Review code ก่อน commit                      │
│  /test-runner        │ รัน tests                                    │
│  /ai-ui-test         │ Test UI automation                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**⚠️ สำหรับ .NET Core Projects:**

ถ้าพบไฟล์ `.csproj` หรือ `.sln` → **ต้องใช้ `/dotnet-dev` skill** เพื่อ:
- ใช้ .NET best practices
- สร้าง code ตาม conventions ที่ถูกต้อง
- ใช้ EF Core patterns ที่เหมาะสม
- จัดการ dependency injection ถูกวิธี
- ใช้ Microsoft Learn MCP สำหรับ documentation

**⚠️ สำหรับภาษาอื่นๆ:**

ถ้าไม่มี specialized skill → ใช้ best practices ของภาษานั้นๆ และ:
- ใช้ `/code-review` สำหรับ review code
- ใช้ `/test-runner` สำหรับรัน tests
- ใช้ `/ai-ui-test` สำหรับ UI testing

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SKILL INTEGRATION FLOW                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ตรวจสอบ Technology Stack                                          │
│      │                                                              │
│      ├── พบ .csproj/.sln?                                          │
│      │       │                                                      │
│      │       ▼                                                      │
│      │   ┌─────────────────┐                                       │
│      │   │  /dotnet-dev    │ ← ใช้ .NET best practices            │
│      │   └─────────────────┘                                       │
│      │                                                              │
│      ├── พบ package.json/go.mod/Cargo.toml/...?                    │
│      │       │                                                      │
│      │       ▼                                                      │
│      │   ┌─────────────────┐                                       │
│      │   │ Standard        │ ← ใช้ best practices ของภาษานั้น     │
│      │   │ Practices       │                                       │
│      │   └─────────────────┘                                       │
│      │                                                              │
│      └── Universal Skills (ใช้ได้เสมอ)                              │
│              │                                                      │
│              ▼                                                      │
│          ┌─────────────────┐                                       │
│          │ /code-review    │ ← review ก่อน commit                  │
│          │ /test-runner    │ ← รัน tests                           │
│          │ /ai-ui-test     │ ← test UI                             │
│          └─────────────────┘                                       │
│                                                                     │
│  พบ .mockups/ folder?                                              │
│      │                                                              │
│      ▼                                                              │
│  ┌─────────────────┐                                               │
│  │ อ่าน mockup.md  │ ← อ่าน structural spec (components, data)    │
│  │ frontend-design │ ← ออกแบบ visual ได้อิสระ                      │
│  │ มีอิสระออกแบบ    │                                               │
│  └─────────────────┘                                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Step 0.7: ตรวจสอบ Schema Version และ Migration (NEW v1.5.0)

```bash
# ตรวจสอบ schema version
cat feature_list.json | grep "schema_version"
```

**ถ้าไม่พบ `schema_version` หรือเป็น version เก่า:**

```
⚠️ Detected old schema (no version or < 1.5.0)
   Current schema: v1.5.0

   แนะนำให้รัน /migrate เพื่อ:
   - เพิ่ม epics grouping
   - เพิ่ม subtasks tracking
   - เพิ่ม acceptance criteria
   - เพิ่ม time tracking
   - เพิ่ม mockup sync fields

   ข้อมูลเดิมจะถูกเก็บรักษาไว้
```

---

### Step 1: Get Context (ต้องทำก่อนเสมอ!)

```bash
# 1. ตรวจสอบว่าอยู่ directory ถูกต้อง
pwd
ls -la

# 2. อ่าน progress log
cat .agent/progress.md

# 3. ดู git history
git log --oneline -10

# 4. ดู feature list summary
cat feature_list.json
```

**ถ้าไม่พบไฟล์เหล่านี้:** แจ้ง user ว่าต้องรัน `/init` ก่อน

### Step 2: Verify Environment

```bash
# ตรวจสอบว่า project ทำงานได้
# สำหรับ .NET:
dotnet build

# สำหรับ Node.js:
npm install && npm run build

# ถ้า build fail: แก้ไขก่อนทำ feature ใหม่
```

### Step 3: Select Feature (Schema v1.5.0)

จาก feature_list.json:
- หา feature ที่ `"status": "pending"` (หรือ `"passes": false` สำหรับ old schema)
- เลือก `"priority": "high"` ก่อน
- ตรวจสอบว่า dependencies ทั้งหมด passed แล้ว
- **ทำทีละ 1 feature เท่านั้น!**

**ก่อนเริ่ม feature:**
```json
// Update status เป็น in_progress
{
  "status": "in_progress",
  "time_tracking": {
    "started_at": "TIMESTAMP"
  }
}
```

**v2.0.0 Validation ก่อนเลือก feature:**

1. **State check**: ถ้า feature มี `state_consumes` → ตรวจว่า features ที่ produce state นั้น `passes: true` แล้ว
   - ถ้ายังไม่ pass → ⚠️ Warning: "[StateName] ยังไม่ถูกสร้าง — ทำ Feature #N ก่อน"

2. **Component check**: ถ้า feature มี `requires_components` → ตรวจว่า components เหล่านั้นถูกสร้างแล้ว
   - ตรวจจาก `component_usage.shared_components` หรือ feature ที่สร้าง component นั้น passes: true
   - ถ้ายังไม่มี → ⚠️ Warning: "[ComponentName] ยังไม่ถูกสร้าง — สร้าง component ก่อน"

3. **Flow order check**: ถ้า feature อยู่ใน wizard flow → ตรวจว่า step ก่อนหน้าเสร็จแล้ว
   - ถ้ายังไม่เสร็จ → ⚠️ Warning: "Flow [name] step [N-1] ยังไม่เสร็จ"

### Step 3.5: Validate Mockup References (NEW v1.5.0)

**ถ้า feature มี mockup references:**

```bash
# ตรวจสอบว่า mockup files exist
for ref in $(cat feature_list.json | jq -r '.features[] | select(.id == X) | .references[]' | grep "mockups"); do
  ls -la "$ref" 2>/dev/null || echo "⚠️ Missing: $ref"
done
```

**ถ้าพบ references:**
1. **ต้อง**อ่าน mockup file ก่อนเริ่มพัฒนา — เพื่อเข้าใจ structural requirements
2. **ต้อง**ตรวจสอบ required_components — implement ครบทุกตัว
3. **ต้อง**ใช้ design tokens
4. **อิสระ**ในการออกแบบ visual — wireframe เป็นแค่ structural spec ไม่ใช่ visual blueprint

### Step 4: Implement Feature with Subtask Commits (v1.6.0 - Default Behavior)

**🆕 v1.6.0: Commit ทุก subtask โดย default**

หลังทำ subtask เสร็จแต่ละ subtask:
1. Update `done: true` และ `committed_at`
2. **Commit ทันที** ด้วย prefix `task:`

```bash
git add .
git commit -m "task(#X.Y): [subtask description]"
```

**Commit Prefixes:**
| Prefix | Usage |
|--------|-------|
| `task:` | Subtask commit (default) |
| `feat:` | Feature complete (final commit) |
| `wip:` | Work in progress (optional) |

**Example:**
```bash
# Subtask 1.1 เสร็จ
git commit -m "task(#1.1): สร้าง project structure"

# Subtask 1.2 เสร็จ
git commit -m "task(#1.2): ตั้งค่า configuration"

# Feature complete
git commit -m "feat: Feature #1 - สร้าง project structure"
```

**Update feature_list.json หลังแต่ละ subtask:**

```json
{
  "subtasks": [
    { "id": "1.1", "description": "สร้าง component", "done": true, "committed_at": "2025-01-05T10:00:00Z" },
    { "id": "1.2", "description": "เพิ่ม styling", "done": false, "committed_at": null }
  ],
  "last_committed_subtask": "1.1"
}
```

**v2.0.0 Flow-Aware Implementation:**

- ถ้ามี `flow_id` → อ่าน `flows[flow_id]` สำหรับ:
  - `entry_conditions` → implement guard/redirect ถ้า state ไม่ครบ
  - `error_paths` ที่ `from_step` ตรงกับ feature นี้ → implement error handling
  - `cancel_path` → implement cancel button/action
- ถ้ามี `state_consumes` → import/read state ก่อนใช้ (ตาม `persistence` type)
- ถ้ามี `state_produces` → implement state creation + save (ตาม `persistence` type)
- ถ้ามี `requires_components` → import และใช้ components ที่ระบุ

**Implementation checklist:**
- [ ] ทำตาม subtasks ตามลำดับ
- [ ] Update subtask.done และ committed_at เมื่อเสร็จแต่ละ subtask
- [ ] **Commit แต่ละ subtask ด้วย `task(#X.Y):`** ← NEW
- [ ] Update last_committed_subtask
- [ ] ตรวจสอบ required_components (ถ้ามี)
- [ ] เขียน code ที่ clean และ readable
- [ ] Handle errors appropriately

### Step 5: Verify Acceptance Criteria (NEW v1.5.0)

**ก่อน mark pass ต้องตรวจสอบ acceptance_criteria:**

```json
// ตัวอย่าง acceptance criteria
{
  "acceptance_criteria": [
    "endpoint ตอบ 200 OK พร้อม array",
    "รองรับ pagination",
    "response format ถูกต้อง"
  ]
}
```

**Verification checklist:**
- [ ] ทุก acceptance criteria ผ่าน
- [ ] Build ผ่าน
- [ ] Manual test ผ่าน (curl, Postman, browser)
- [ ] Edge cases handled
- [ ] UI implement ครบทุก components และ data requirements จาก mockup (visual ไม่ต้องเหมือน wireframe)

### Step 6: Mark as Passed (Schema v1.5.0)

แก้ไข feature_list.json:
```json
{
  "id": X,
  "status": "passed",                    // NEW v1.5.0
  "subtasks": [
    { "id": "X.1", "done": true },
    { "id": "X.2", "done": true },
    { "id": "X.3", "done": true }
  ],
  "time_tracking": {
    "started_at": "START_TIMESTAMP",
    "completed_at": "END_TIMESTAMP",      // NEW v1.5.0
    "actual_time": "25min"                // NEW v1.5.0 - คำนวณจาก started - completed
  },
  "mockup_validated": true,               // NEW v1.5.0 - ถ้ามี mockup ref
  "passes": true,                         // KEEP for backward compat
  "tested_at": "TIMESTAMP",
  "notes": "Test results..."
}
```

อัพเดท epic progress:
```json
{
  "epics": [
    {
      "id": "setup",
      "progress": { "total": 2, "passed": 1, "in_progress": 0 }  // ← Updated
    }
  ]
}
```

อัพเดท summary:
```json
{
  "summary": {
    "total": 12,
    "passed": N+1,
    "in_progress": 0,
    "blocked": 0,
    "pending": M-1,
    "last_updated": "TIMESTAMP"
  }
}
```

### Step 7: Commit Changes

```bash
git add .
git commit -m "feat: Feature #X - description"
```

### Step 8: Update Progress Log

เพิ่ม session ใหม่ใน .agent/progress.md:
```markdown
---

## Session N - CODING
**Date**: TIMESTAMP
**Type**: Coding

### สิ่งที่ทำ:
- ✅ Feature #X: description

### Test Results:
- Test: ✅ Result

### สถานะปัจจุบัน:
- Features passed: X/Y
- Build: ✅

### Feature ถัดไป:
- Feature #Z: description

---
```

## กฎสำคัญ

❌ **ห้าม:**
- ทำหลาย features ใน 1 session
- Mark pass โดยไม่ test
- ลบหรือแก้ไข feature descriptions
- ประกาศว่าเสร็จถ้ายังมี feature ไม่ pass

✅ **ต้องทำ:**
- อ่าน context ก่อนเริ่มงานเสมอ
- Test ก่อน mark pass
- Commit แยกต่าง feature
- Update progress ก่อนจบ session
- ทิ้ง code ในสถานะ build ผ่าน

## Output ที่คาดหวัง

เมื่อเสร็จ 1 feature แจ้ง user:
1. Feature ที่ทำเสร็จ
2. Test results
3. Progress (X/Y features passed)
4. Feature ถัดไป
5. Git commit hash
