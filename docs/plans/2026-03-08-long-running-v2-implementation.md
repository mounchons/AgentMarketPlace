# Long-Running v2.0.0 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add flows, state contracts, and component requirements to long-running plugin for complex multi-page system support.

**Architecture:** Add 3 new concepts to feature_list.json: `flows[]` (user journey grouping with entry/exit/error paths), `state_contracts{}` (shared state definitions with field-level types), and enhanced `requires_components` enforcement. Update 12 files across commands, references, templates, and docs.

**Tech Stack:** Markdown command definitions, JSON schema templates

**Design Doc:** `docs/plans/2026-03-08-long-running-complex-systems-design.md`

---

### Task 1: Update feature_list.json Template (Schema v2.0.0)

**Files:**
- Modify: `plugins/long-running/skills/long-running/templates/feature_list.json`

**Context:** This is the JSON template that defines the schema for all feature_list.json files. It contains example data showing all possible fields. We need to add `flows[]`, `state_contracts{}`, new feature fields, and bump to v2.0.0.

**Step 1: Add `state_contracts` after `integration` section**

Add this block after line 19 (after `integration` closing brace):

```json
  "state_contracts": {
    "ExampleState": {
      "description": "ตัวอย่าง state contract - ลบออกเมื่อใช้จริง",
      "fields": {
        "id": { "type": "number", "description": "ID ของ resource" },
        "name": { "type": "string", "description": "ชื่อ resource" },
        "items": { "type": "Item[]", "description": "รายการ items" },
        "optional_field": { "type": "string?", "description": "field ที่เป็น optional" }
      },
      "persistence": "session",
      "produced_by": [],
      "consumed_by": []
    }
  },
```

**Step 2: Add `flows` after `epics` section**

Add this block after the `epics` array closing bracket (after line 95):

```json
  "flows": [
    {
      "id": "example-flow",
      "name": "Example Flow",
      "description": "ตัวอย่าง flow - ลบออกเมื่อใช้จริง",
      "type": "wizard",
      "steps": [
        { "order": 1, "feature_id": 5, "label": "Step 1 - List" },
        { "order": 2, "feature_id": 7, "label": "Step 2 - Create" },
        { "order": 3, "feature_id": 6, "label": "Step 3 - Detail" }
      ],
      "entry_conditions": {
        "required_state": ["AuthState"],
        "description": "ต้อง login ก่อนเข้า flow"
      },
      "exit_conditions": {
        "produced_state": ["ExampleState"],
        "description": "สร้าง resource สำเร็จ"
      },
      "error_paths": [
        {
          "from_step": 2,
          "condition": "validation_failed",
          "action": "stay",
          "description": "validation ไม่ผ่าน → แสดง error อยู่หน้าเดิม"
        }
      ],
      "cancel_path": {
        "action": "back_to_list",
        "description": "ยกเลิก → กลับไปหน้า List"
      }
    }
  ],
```

**Step 3: Add new fields to every feature in the template**

Add these 3 fields to each feature object (after `epic` field, before `module`):

```json
      "flow_id": null,
      "state_produces": [],
      "state_consumes": [],
```

Note: `requires_components` already exists in the template — no need to add.

**Step 4: Update schema versions**

- Line 2: `"schema_version": "1.10.0"` → `"schema_version": "2.0.0"`
- In metadata section: `"schema_version": "1.10.0"` → `"schema_version": "2.0.0"`
- In metadata section: `"plugin_version": "1.10.0"` → `"plugin_version": "2.0.0"`
- In metadata: `"design_doc_list_schema": ">=2.0.0"` → `"design_doc_list_schema": ">=2.1.0"`
- In metadata: `"mockup_list_schema": ">=1.6.0"` → `"mockup_list_schema": ">=1.7.0"`

**Step 5: Commit**

```bash
git add plugins/long-running/skills/long-running/templates/feature_list.json
git commit -m "feat(long-running): add flows, state_contracts to feature_list.json template (v2.0.0)"
```

---

### Task 2: Update `/continue` Command

**Files:**
- Modify: `plugins/long-running/commands/continue.md`

**Context:** This is the command that agents run every session to continue development. We need to add Step 0.5 (Read Flow Context) and enhance Step 3 (Select Feature) with state/component validation.

**Step 1: Read the current file**

Read `plugins/long-running/commands/continue.md` to understand current structure.

**Step 2: Add Step 0.5 — Read Flow Context**

After the existing Step 0 (Design References) section, add a new section:

```markdown
### Step 0.5: Read Flow Context (v2.0.0)

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
```

**Step 3: Enhance Step 3 — Select Feature**

In the existing Step 3 (Select Feature) section, add validation checks:

```markdown
**v2.0.0 Validation ก่อนเลือก feature:**

1. **State check**: ถ้า feature มี `state_consumes` → ตรวจว่า features ที่ produce state นั้น `passes: true` แล้ว
   - ถ้ายังไม่ pass → ⚠️ Warning: "[StateName] ยังไม่ถูกสร้าง — ทำ Feature #N ก่อน"

2. **Component check**: ถ้า feature มี `requires_components` → ตรวจว่า components เหล่านั้นถูกสร้างแล้ว
   - ตรวจจาก `component_usage.shared_components` หรือ feature ที่สร้าง component นั้น passes: true
   - ถ้ายังไม่มี → ⚠️ Warning: "[ComponentName] ยังไม่ถูกสร้าง — สร้าง component ก่อน"

3. **Flow order check**: ถ้า feature อยู่ใน wizard flow → ตรวจว่า step ก่อนหน้าเสร็จแล้ว
   - ถ้ายังไม่เสร็จ → ⚠️ Warning: "Flow [name] step [N-1] ยังไม่เสร็จ"
```

**Step 4: Enhance Step 4 — Implement**

In the existing Step 4 (Implement) section, add flow-aware instructions:

```markdown
**v2.0.0 Flow-Aware Implementation:**

- ถ้ามี `flow_id` → อ่าน `flows[flow_id]` สำหรับ:
  - `entry_conditions` → implement guard/redirect ถ้า state ไม่ครบ
  - `error_paths` ที่ `from_step` ตรงกับ feature นี้ → implement error handling
  - `cancel_path` → implement cancel button/action
- ถ้ามี `state_consumes` → import/read state ก่อนใช้ (ตาม `persistence` type)
- ถ้ามี `state_produces` → implement state creation + save (ตาม `persistence` type)
- ถ้ามี `requires_components` → import และใช้ components ที่ระบุ
```

**Step 5: Commit**

```bash
git add plugins/long-running/commands/continue.md
git commit -m "feat(long-running): add flow context and state validation to /continue"
```

---

### Task 3: Update `/init` Command

**Files:**
- Modify: `plugins/long-running/commands/init.md`

**Context:** This is the command for initializing a new project. We need to add Steps 3.5-3.7 for flow detection, state contract definition, and shared component identification.

**Step 1: Read the current file**

Read `plugins/long-running/commands/init.md` to understand current structure.

**Step 2: Add Steps 3.5-3.7 after feature generation**

After the existing feature generation steps, add:

```markdown
### Step 3.5: Detect Flows

**วิเคราะห์ features ที่สร้างแล้ว เพื่อจัดกลุ่มเป็น flows:**

1. **จาก Design Doc** (ถ้ามี):
   - อ่าน Flow Diagrams → สร้าง `wizard` flows
   - อ่าน Sitemap → จัดกลุ่ม CRUD pages เป็น `crud-group` flows

2. **จาก Mockups** (ถ้ามี):
   - ดู `related_pages` ใน mockup_list.json → จัดกลุ่มเป็น flows
   - หน้าที่มี StepIndicator component → `wizard` flow

3. **Auto-detect patterns:**
   - Features ที่มี sequential mockup pages (001 → 002 → 003) → `wizard`
   - Features ที่มี List + Form + Detail สำหรับ entity เดียว → `crud-group`
   - Dashboard features ที่ทำงานอิสระ → `parallel`

4. **ถ้าไม่ชัด → ถาม user:**
   - "Features #5-#8 ดูเหมือนเป็น flow เดียวกัน ใช่ไหม?"
   - "Flow นี้เป็นแบบ wizard (ทำตามลำดับ) หรือ crud-group (เข้าหน้าไหนก็ได้)?"

**สร้าง flow:**
```json
{
  "id": "[auto-generated-from-name]",
  "name": "[Flow Name]",
  "type": "[wizard|crud-group|parallel]",
  "steps": [
    { "order": 1, "feature_id": N, "label": "[Step Label]" }
  ],
  "entry_conditions": {
    "required_state": ["[ถ้าต้อง login → AuthState]"],
    "description": "[เงื่อนไข]"
  },
  "exit_conditions": {
    "produced_state": ["[state ที่สร้าง]"],
    "description": "[ผลลัพธ์]"
  },
  "error_paths": [],
  "cancel_path": null
}
```

### Step 3.6: Define State Contracts

**วิเคราะห์ flows เพื่อหา shared state:**

1. **AuthState** (ถ้ามีหน้า Login):
   - `persistence: "localStorage"`
   - `fields`: user_id, role, token
   - `produced_by`: [login feature id]
   - `consumed_by`: [ทุก feature ที่ต้อง login]

2. **Entity-based state** (จาก design doc entities):
   - ดู Flow Diagrams → state ที่ส่งระหว่าง steps
   - ดู ER Diagram → entity fields → state fields
   - `persistence`: ตาม use case (session สำหรับ wizard, url สำหรับ filters)

3. **กำหนด persistence type:**
   | Use Case | Persistence |
   |----------|-------------|
   | Auth/Login | `localStorage` |
   | Wizard (Cart, Checkout) | `session` |
   | Filters, Search | `url` |
   | Modal state, Form dirty | `memory` |

4. **เพิ่ม `state_produces` / `state_consumes` ให้ features ที่เกี่ยวข้อง**

### Step 3.7: Identify Shared Components

**ตรวจหา components ที่ใช้ซ้ำหลายหน้า:**

1. **จาก Mockups** (ถ้ามี):
   - ดู `components` ใน mockup_list.json pages
   - Components ที่ปรากฏใน 3+ pages → shared component

2. **Common shared components:**
   - `AuthGuard` — ถ้ามีหน้าที่ต้อง login
   - `Layout` (Navbar + Sidebar) — ถ้ามี admin pages
   - `DataTable` — ถ้ามีหลายหน้า list
   - `FormModal` — ถ้ามี modal CRUD (simple entities)
   - `StepIndicator` — ถ้ามี wizard flows

3. **สำหรับแต่ละ shared component:**
   - สร้าง feature แยก (category: "component")
   - เพิ่มใน `component_usage.shared_components`
   - เพิ่ม `requires_components` ให้ features ที่ใช้
```

**Step 3: Commit**

```bash
git add plugins/long-running/commands/init.md
git commit -m "feat(long-running): add flow detection and state contracts to /init"
```

---

### Task 4: Update `/status` Command

**Files:**
- Modify: `plugins/long-running/commands/status.md`

**Step 1: Read the current file**

Read `plugins/long-running/commands/status.md`.

**Step 2: Add Flow Progress section**

Add a new section for flow progress display after the existing feature summary:

```markdown
### Flow Progress (v2.0.0)

**ถ้ามี `flows[]` ใน feature_list.json:**

แสดง progress ของแต่ละ flow:

```
📊 Flow Progress:

  [icon] [Flow Name] ([type]): X/Y steps [status]
     ├── ✅ [Label] (Feature #N)
     ├── 🔄 [Label] (Feature #N) ← IN PROGRESS
     ├── 🔲 [Label] (Feature #N)
     └── 🔲 [Label] (Feature #N)
     State: [State1] ✅ → [State2] ❌ → [State3] ❌
```

**Icons:**
- Flow types: 🛒 wizard, 📋 crud-group, 📊 parallel
- Step status: ✅ passed, 🔄 in_progress, 🔲 pending, ⛔ blocked

**State Progress:**
- แสดง state_contracts ที่เกี่ยวข้องกับ flow
- ✅ = produced_by feature ที่ passes: true
- ❌ = ยังไม่ถูก produce

**ถ้ามี `state_contracts`:**

```
🔗 State Contracts:
  ✅ AuthState (localStorage) — produced by Feature #1
  ✅ CartState (session) — produced by Feature #3
  ❌ ShippingState (session) — not yet produced
  ❌ PaymentResult (session) — not yet produced
```

**ถ้ามี `requires_components` ที่ยังไม่พร้อม:**

```
⚠️ Blocked Features:
  Feature #8 (Payment Page) — requires: StepIndicator ❌, PriceDisplay ❌
  Feature #10 (User List) — requires: AuthGuard ❌
```
```

**Step 3: Commit**

```bash
git add plugins/long-running/commands/status.md
git commit -m "feat(long-running): add flow progress display to /status"
```

---

### Task 5: Update `/validate-coverage` Command

**Files:**
- Modify: `plugins/long-running/commands/validate-coverage.md`

**Step 1: Read the current file**

Read `plugins/long-running/commands/validate-coverage.md`.

**Step 2: Add flow and state validation sections**

Add these validation checks:

```markdown
### Flow Coverage Validation (v2.0.0)

**ตรวจสอบความครบถ้วนของ flows:**

1. **Orphan features**: features ที่มี `flow_id` แต่ไม่อยู่ใน `flows[].steps`
2. **Missing steps**: flows ที่มี `steps[].feature_id` อ้างอิง feature ที่ไม่มีอยู่
3. **State contract integrity**:
   - state ที่ถูก consumed แต่ไม่มี feature ที่ produce → ❌ Error
   - state ที่ถูก produced แต่ไม่มี feature ที่ consume → ⚠️ Warning (unused state)
   - `produced_by` / `consumed_by` ตรงกับ features ที่ประกาศ `state_produces` / `state_consumes`
4. **Component requirements**:
   - features ที่มี `requires_components` → ตรวจว่า component มี feature ที่สร้าง
   - components ใน `shared_components` ที่ไม่มี feature ใดใช้ → ⚠️ Warning
5. **Flow completeness**:
   - wizard flows ต้องมี entry_conditions (อย่างน้อย description)
   - wizard flows ที่มี > 2 steps ควรมี error_paths
   - crud-group flows ควรมีทั้ง list + form features

**Output format:**

```
🔍 Flow & State Validation:

  Flows: 3 total
  ├── ✅ checkout (wizard) — 4 steps, entry/exit defined
  ├── ✅ user-management (crud-group) — 3 steps
  └── ⚠️ dashboard (parallel) — no entry_conditions defined

  State Contracts: 4 total
  ├── ✅ AuthState — produced by #1, consumed by #3,#4,#5,#6
  ├── ✅ CartState — produced by #3, consumed by #4,#5
  ├── ❌ ShippingState — consumed by #5 but no producer!
  └── ⚠️ TempState — produced by #7 but never consumed

  Component Requirements: 5 components
  ├── ✅ AuthGuard — Feature #2 (passed)
  ├── ✅ DataTable — Feature #3 (passed)
  └── ❌ StepIndicator — no feature creates this component
```
```

**Step 3: Commit**

```bash
git add plugins/long-running/commands/validate-coverage.md
git commit -m "feat(long-running): add flow/state validation to /validate-coverage"
```

---

### Task 6: Update `/generate-features-from-design` Command

**Files:**
- Modify: `plugins/long-running/commands/generate-features-from-design.md`

**Step 1: Read the current file**

Read `plugins/long-running/commands/generate-features-from-design.md`.

**Step 2: Add flow detection from Flow Diagrams**

Add a new step after existing entity/API feature generation:

```markdown
### Step 2.5: Detect Flows from Design Doc (v2.0.0)

**อ่าน Flow Diagrams จาก design doc:**

1. **Flow Diagram → wizard flow:**
   - แต่ละ flowchart ที่มี sequential steps → สร้าง flow type `wizard`
   - Decision points → สร้าง `error_paths`
   - End states → สร้าง `exit_conditions`

2. **Sitemap → crud-group flow:**
   - Pages ที่อยู่ใต้ parent เดียวกันและเป็น entity เดียวกัน → `crud-group`
   - เช่น `/admin/users`, `/admin/users/new`, `/admin/users/:id` → "User Management" flow

3. **สร้าง state_contracts จาก entities:**
   - Entity ที่ถูกส่งระหว่าง steps ใน flow → state contract
   - ใช้ Data Dictionary fields → state contract fields
   - กำหนด persistence ตาม context:
     - Form wizard → `session`
     - Filter/Search → `url`
     - Auth → `localStorage`

4. **เพิ่ม flow_id, state_produces, state_consumes ให้ features ที่สร้าง**

5. **สร้าง features สำหรับ shared components:**
   - Components ที่ใช้ใน 3+ pages → สร้าง feature แยก
   - เพิ่ม `requires_components` ให้ features ที่ใช้
```

**Step 3: Commit**

```bash
git add plugins/long-running/commands/generate-features-from-design.md
git commit -m "feat(long-running): add flow detection to /generate-features-from-design"
```

---

### Task 7: Update `/migrate` Command

**Files:**
- Modify: `plugins/long-running/commands/migrate.md`

**Step 1: Read the current file**

Read `plugins/long-running/commands/migrate.md`.

**Step 2: Add v1.10.0 → v2.0.0 migration path**

Add a new migration section:

```markdown
### Migration: v1.10.0 → v2.0.0

**เพิ่ม fields ใหม่ (backward compatible):**

```javascript
// 1. เพิ่ม state_contracts (root level)
if (!data.state_contracts) {
  data.state_contracts = {};
}

// 2. เพิ่ม flows (root level, after epics)
if (!data.flows) {
  data.flows = [];
}

// 3. เพิ่ม fields ใหม่ให้ทุก feature
for (const feature of data.features) {
  if (feature.flow_id === undefined) feature.flow_id = null;
  if (!feature.state_produces) feature.state_produces = [];
  if (!feature.state_consumes) feature.state_consumes = [];
  // requires_components มีอยู่แล้ว — ไม่ต้องเพิ่ม
}

// 4. Bump versions
data.schema_version = "2.0.0";
data.metadata.schema_version = "2.0.0";
data.metadata.plugin_version = "2.0.0";
data.metadata.compatible_with.design_doc_list_schema = ">=2.1.0";
data.metadata.compatible_with.mockup_list_schema = ">=1.7.0";
```

**หมายเหตุ:** Migration นี้เป็น additive — ไม่ลบหรือเปลี่ยน fields เดิม projects ที่ไม่ใช้ flows ทำงานได้ปกติ
```

**Step 3: Commit**

```bash
git add plugins/long-running/commands/migrate.md
git commit -m "feat(long-running): add v1.10.0 → v2.0.0 migration path"
```

---

### Task 8: Update Reference Files

**Files:**
- Modify: `plugins/long-running/skills/long-running/references/feature-patterns.md`
- Modify: `plugins/long-running/skills/long-running/references/coding-agent-guide.md`

**Step 1: Add Flow Patterns to feature-patterns.md**

Read `plugins/long-running/skills/long-running/references/feature-patterns.md`, then add a new section:

```markdown
## Flow Patterns (v2.0.0)

### Wizard Flow Pattern

สำหรับ multi-step forms ที่ต้องทำตามลำดับ:

```
Flow: Checkout
├── Step 1: Cart Review → produces CartState
├── Step 2: Shipping Info → consumes CartState, produces ShippingState
├── Step 3: Payment → consumes CartState + ShippingState, produces PaymentResult
└── Step 4: Confirmation → consumes PaymentResult, produces OrderState
```

**Features ที่สร้าง:**
- 1 feature ต่อ step + shared component features (StepIndicator, PriceDisplay)
- แต่ละ feature มี `flow_id`, `state_produces`, `state_consumes`
- Feature สำหรับ shared components ต้องทำก่อน (เป็น dependency)

### CRUD-Group Flow Pattern

สำหรับ entity management ที่มี List + Form + Detail:

```
Flow: User Management
├── User List → consumes AuthState
├── User Form (Create/Edit) → consumes AuthState
└── User Detail → consumes AuthState
```

**Features ที่สร้าง:**
- List, Form, Detail features ทั้งหมดอยู่ใน flow เดียว
- ไม่ต้องทำตามลำดับ (type: crud-group)
- แชร์ AuthState และ shared components (DataTable, FormModal)

### Parallel Flow Pattern

สำหรับ dashboard หรือหน้าที่มีหลาย widgets ทำงานอิสระ:

```
Flow: Dashboard
├── Stats Widget → consumes AuthState
├── Chart Widget → consumes AuthState
└── Recent Activity → consumes AuthState
```

**Features ที่สร้าง:**
- แต่ละ widget เป็น feature อิสระ
- ทำหน้าไหนก่อนก็ได้
- แชร์ Layout component
```

**Step 2: Add flow context rule to coding-agent-guide.md**

Read `plugins/long-running/skills/long-running/references/coding-agent-guide.md`, then add to Step 0 section:

```markdown
- ถ้าพบ `flows[]` ใน feature_list.json → **ต้อง**อ่าน flow context ก่อนเริ่มงาน

**🔍 Flow Context Check (v2.0.0):**
```bash
# ตรวจสอบว่า feature อยู่ใน flow ไหน
cat feature_list.json | jq --arg fid "FEATURE_ID" '.flows[] | select(.steps[].feature_id == ($fid | tonumber))'
```
- ถ้า feature มี `flow_id` → อ่าน entry/exit conditions, error_paths ก่อน implement
- ถ้า feature มี `state_consumes` → ตรวจว่า state ถูก produce แล้ว
- ถ้า feature มี `state_produces` → implement state creation ตาม `persistence` type ใน state_contracts
- ถ้า feature มี `requires_components` → ตรวจว่า components พร้อมใช้แล้ว
```

**Step 3: Commit**

```bash
git add plugins/long-running/skills/long-running/references/feature-patterns.md plugins/long-running/skills/long-running/references/coding-agent-guide.md
git commit -m "docs(long-running): add flow patterns and flow context rules to references"
```

---

### Task 9: Update SKILL.md, README.md, plugin.json

**Files:**
- Modify: `plugins/long-running/skills/long-running/SKILL.md`
- Modify: `plugins/long-running/README.md`
- Modify: `plugins/long-running/.claude-plugin/plugin.json`

**Step 1: Update SKILL.md**

Read `plugins/long-running/skills/long-running/SKILL.md`, then:

- Update frontmatter: `version: 1.10.0` → `version: 2.0.0`
- Update title: `Version 1.10.0` → `Version 2.0.0`
- Update description to include "flows, state contracts, component requirements"
- Add new section after existing file formats:

```markdown
## 🔄 Flows & State Contracts (v2.0.0)

### Flows
จัดกลุ่ม features เป็น user journeys — wizard, crud-group, หรือ parallel

```json
{
  "flows": [{
    "id": "checkout",
    "type": "wizard",
    "steps": [{ "order": 1, "feature_id": 3, "label": "Cart" }],
    "entry_conditions": { "required_state": ["AuthState"] },
    "exit_conditions": { "produced_state": ["OrderState"] },
    "error_paths": [{ "from_step": 3, "condition": "payment_failed", "action": "retry_or_back" }],
    "cancel_path": { "action": "back_to_cart" }
  }]
}
```

### State Contracts
กำหนด shared state ระหว่างหน้า — agent สร้าง interface ได้เลย

```json
{
  "state_contracts": {
    "CartState": {
      "fields": { "items": { "type": "CartItem[]" }, "total": { "type": "number" } },
      "persistence": "session",
      "produced_by": [3],
      "consumed_by": [4, 5, 6]
    }
  }
}
```

### Feature Fields ใหม่
| Field | Type | Description |
|-------|------|-------------|
| `flow_id` | string \| null | flow ที่ feature อยู่ |
| `state_produces` | string[] | state ที่ feature สร้าง |
| `state_consumes` | string[] | state ที่ feature ต้องใช้ |
| `requires_components` | string[] | components ที่ต้องมีก่อน (enforcement) |
```

**Step 2: Update README.md**

Read `plugins/long-running/README.md`, then:

- Update title version: `Version 1.10.0` → `Version 2.0.0`
- Add v2.0.0 to changelog:

```markdown
### v2.0.0 (2026-03-08)
- ✨ เพิ่ม `flows[]` — จัดกลุ่ม features เป็น user journeys
  - 3 flow types: `wizard`, `crud-group`, `parallel`
  - Entry/exit conditions พร้อม required_state
  - Error paths per step + cancel path
- ✨ เพิ่ม `state_contracts{}` — shared state definitions
  - Field-level type definitions (TypeScript-style)
  - 4 persistence types: `session`, `localStorage`, `url`, `memory`
  - Auto-sync `produced_by` / `consumed_by` จาก features
- ✨ เพิ่ม feature fields: `flow_id`, `state_produces`, `state_consumes`
- ✨ `requires_components` เปลี่ยนจาก tracking เป็น enforcement
- 🔄 `/continue` — เพิ่ม Step 0.5 Read Flow Context + state/component validation
- 🔄 `/init` — เพิ่ม flow detection, state contract definition, shared component identification
- 🔄 `/status` — เพิ่ม Flow Progress display
- 🔄 `/validate-coverage` — เพิ่ม flow/state/component validation
- 🔄 `/generate-features-from-design` — เพิ่ม flow detection จาก Flow Diagrams
- 🔄 `/migrate` — เพิ่ม v1.10.0 → v2.0.0 migration path
- 📄 อัพเดท schema version เป็น 2.0.0
```

**Step 3: Update plugin.json**

Change `"version": "1.10.0"` → `"version": "2.0.0"`

Update description to include "flows, state contracts"

**Step 4: Commit**

```bash
git add plugins/long-running/skills/long-running/SKILL.md plugins/long-running/README.md plugins/long-running/.claude-plugin/plugin.json
git commit -m "feat(long-running): bump to v2.0.0 with flows and state contracts documentation"
```

---

### Task 10: Verify & Final Review

**Step 1: Verify all files are consistent**

Check:
- schema_version "2.0.0" appears in: feature_list.json template, SKILL.md, README.md, plugin.json
- All new fields (flow_id, state_produces, state_consumes) are in the template
- All commands reference the new concepts correctly
- No remaining references to v1.10.0 in modified files

**Step 2: Run a mental test**

Trace through a scenario:
1. User runs `/init` → agent creates features + detects flows + creates state_contracts
2. User runs `/continue` → agent reads flow context → selects feature → checks state/components
3. User runs `/status` → sees flow progress with state status
4. User runs `/validate-coverage` → sees flow/state/component validation

**Step 3: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix(long-running): consistency fixes for v2.0.0"
```
