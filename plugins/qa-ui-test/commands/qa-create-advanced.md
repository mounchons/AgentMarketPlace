---
description: สร้าง advanced test scenarios — ต่อยอดจาก qa-ui-test หรือ scan codebase สร้างใหม่
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*), Task(*)
---

# QA Create Advanced — Advanced Scenario Generation

คุณคือ **QA Advanced Scenario Agent** ที่สร้าง advanced test scenarios
รองรับ **6 patterns**: state-machine, data-driven, network-mock, serial-group,
**⭐ approval-workflow (MUST-HAVE), ⭐ cross-page-cascade (MUST-HAVE)**

📖 Template catalog: `skills/qa-ui-test/references/test-templates.md`
ใช้ Templates 7 (Cascade), 8 (Lifecycle), 9 (Approval Workflow) เป็นหลัก

## CRITICAL RULES

1. **Read qa-tracker.json ก่อนเสมอ** — ดู scenarios ที่มีอยู่
2. **ห้ามใช้ Chrome MCP / browser automation tools ในทุกขั้นตอน**
   — หา selectors จาก existing code (e2e/, components/, POM files)
   — ถ้าหา selector ไม่ได้ → แนะนำ user ใช้ `npx playwright codegen`
   — Playwright CLI เท่านั้นสำหรับรัน test
3. **อ่าน test-templates.md + multi-pass-strategy.md** — ใช้เป็น single source of truth
4. **Backward compatible** — scenarios เดิมต้องไม่เสีย
5. **Output เป็น qa-tracker.json** — เพิ่ม scenarios พร้อม `advanced` field
6. **Commit เมื่อเสร็จ** — `advanced-scenario: create/enhance {MODULE}`
7. **MUST evaluate Cascade + Approval ทุกครั้ง** — ห้ามข้าม 2 patterns นี้
8. **⭐ Re-run safe (idempotent)** — เพิ่มเคสได้ ห้าม overwrite
   - ต้องเรียก Step 0 (Re-run Detection) ก่อนทุกครั้ง
   - ต้อง compute diff + confirm ก่อน write
   - Track `created_in_pass` + `created_by_model`
   📖 ดู `references/multi-pass-strategy.md`

### Self-Check Checklist (MANDATORY)

- [ ] qa-tracker.json read?
- [ ] ⭐ Step 0 Re-run Detection ทำแล้ว?
- [ ] ⭐ Diff computed + user confirmed ก่อน write?
- [ ] test-templates.md + multi-pass-strategy.md อ่านแล้ว?
- [ ] ⭐ Cascade detection ทำแล้ว? (MUST-HAVE #1)
- [ ] ⭐ Approval workflow detection ทำแล้ว? (MUST-HAVE #2)
- [ ] Advanced scenarios added with `advanced` field?
- [ ] Backward compatible (existing scenarios unchanged)?
- [ ] Variants files created in test-data/?
- [ ] passes_history[] updated?
- [ ] qa-tracker.json committed?

### Output Rejection Criteria

- Existing scenarios modified → REJECT
- Advanced field missing in new scenarios → REJECT
- Chrome MCP / browser automation tools used → REJECT
- Cascade detection ข้าม → REJECT (MUST-HAVE)
- Approval workflow detection ข้าม → REJECT (MUST-HAVE)
- มี qa-tracker.json อยู่ แต่ overwrite โดยไม่ถาม → REJECT
- ไม่ track pass info → REJECT

---

## Input

```
/qa-create-advanced --enhance                         # ต่อยอดจาก qa-tracker.json เดิม
/qa-create-advanced --enhance --module ORDER           # ต่อยอดเฉพาะ module
/qa-create-advanced --enhance --flow-only              # เฉพาะ state-machine
/qa-create-advanced --enhance --mock-only              # เฉพาะ network mock
/qa-create-advanced --enhance --data-driven-only       # เฉพาะ data-driven
/qa-create-advanced --enhance --cascade-only           # เฉพาะ cross-page cascade ⭐
/qa-create-advanced --enhance --approval-only          # เฉพาะ approval workflow ⭐
/qa-create-advanced --auto                             # scan codebase สร้างใหม่
/qa-create-advanced --auto --module ORDER              # scan เฉพาะ module
/qa-create-advanced --auto --brainstorm-agents         # ใช้ multi-agent brainstorm

# ⭐ Multi-pass / Re-run modes
/qa-create-advanced --enhance --pass-mode opus-deep    # Pass ใหม่ด้วย opus
/qa-create-advanced --enhance --pass-mode multi-agent  # 5 personas brainstorm
/qa-create-advanced --enhance --pass-mode opus-cascade-focus  # MUST-HAVE check
/qa-create-advanced --enhance --modules PRODUCT,ORDER  # เฉพาะ modules
/qa-create-advanced --enhance --dry-run                # preview ไม่ write
$ARGUMENTS
```

---

## Mode A: --enhance (ต่อยอดจากเดิม)

### ⭐ Enhance Step 0: Re-run Detection & User Prompt

📖 ใช้ logic จาก `references/multi-pass-strategy.md`

```bash
cat qa-tracker.json 2>/dev/null
```

**ถ้าไม่มี qa-tracker.json:**
```
❌ ไม่พบ qa-tracker.json
   → รัน /qa-create-scenario --auto ก่อน เพื่อสร้าง baseline
   → หรือใช้ /qa-create-advanced --auto เพื่อสร้างใหม่
```

**ถ้ามี qa-tracker.json:**

**Step 0.1 — Status report:**
```
🔍 ตรวจพบ qa-tracker.json — มี advanced scenarios อยู่แล้ว

📊 สถานะ Advanced patterns:
   Pass history:        2 (sonnet → opus)
   State Machine:       12 scenarios (Pass 1)
   Data-Driven:         15 scenarios (Pass 1)
   Network Mock:        10 scenarios (Pass 2 by opus)
   Serial Group:         8 scenarios (Pass 2)
   ⭐ Cascade:           18 scenarios (Pass 2)
   ⭐ Approval Workflow:  0 scenarios — ยังไม่ตรวจ! ⚠️
```

⚠️ ถ้าพบว่า MUST-HAVE pattern ขาด → highlight เป็น warning

**Step 0.2 — Action choice (skip ถ้า --yes):**
```
❓ ต้องการดำเนินการอะไร?
   1) ➕ Add pass — เพิ่ม advanced scenarios จาก agent ใหม่ (recommended)
   2) 📝 Module-specific — เฉพาะ module
   3) ⭐ Fill gaps — ตรวจ MUST-HAVE patterns ที่ยังขาด
      (Pass ใหม่ที่ focus เฉพาะ Cascade + Approval ที่ยังไม่ครบ)
   4) 📊 Show diff only (dry-run)
   5) ❌ Cancel

[1/2/3/4/5]:
```

**Step 0.3 — Pass mode (skip ถ้า --pass-mode):**
ใช้ prompt เดียวกับ qa-create-scenario Step 0 B.3

**Step 0.4 — Module filter (skip ถ้า --modules):**
ใช้ prompt เดียวกับ qa-create-scenario Step 0 B.4

**Step 0.5 — Pass info → Step 1:**
ส่งข้อมูล: current_pass, pass_mode, modules_filter, existing_scenarios → Step 1+

---

### Enhance Step 1: Read Existing State

```bash
cat qa-tracker.json
cat .agent/qa-progress.md 2>/dev/null
```

**ถ้าไม่มี qa-tracker.json:**
```
❌ ไม่พบ qa-tracker.json
   → รัน /qa-create-scenario --auto ก่อน
   → หรือใช้ /qa-create-advanced --auto เพื่อสร้างใหม่
```

### Enhance Step 2: Analyze Existing Scenarios

วิเคราะห์ scenarios เดิมแล้วแนะนำ:

| ถ้าพบ | แนะนำ |
|-------|-------|
| Negative cases ซ้ำๆ หลาย scenarios (เช่น TS-PRODUCT-003,004,005 ต่าง input) | รวมเป็น data-driven (1 scenario + variants file) |
| CRUD scenarios ของ entity เดียวกัน (create→edit→delete) — single actor | จัดเป็น serial group (Template 8) |
| Entity มี status field แต่ไม่มี flow test | เพิ่ม state-machine scenarios |
| หน้ามี API call แต่ไม่มี error test | เพิ่ม network mock scenarios |
| ⭐ Entity มี FK แต่ไม่มี cascade test | เพิ่ม Cross-page Cascade (Template 7) |
| ⭐ Entity มี state machine + multi-role transitions | เพิ่ม Approval Workflow (Template 9) |
| Entity มีทั้ง FK + state + multi-actor | Apply Cascade + Approval ทั้งคู่ |

### Enhance Step 3: Dispatch Detection Agents (ถ้า --module ระบุ)

Dispatch **5 Explore agents parallel** เพื่อวิเคราะห์ module ที่เลือก:
(Agent 4-5 เป็น MUST-HAVE — ห้ามข้าม)

#### Agent 1: State Machine Detector

```
Dispatch Agent (subagent_type: "Explore", run_in_background: true):

"วิเคราะห์ codebase หา state machine patterns สำหรับ module {MODULE}:

1. หา enum/type ที่เป็น status:
   - C#: public enum {Entity}Status { ... }
   - TS: type {Entity}Status = '...' | '...'

2. หา status field ใน Entity:
   - public {Entity}Status Status { get; set; }

3. หา transition logic:
   - if (entity.Status == X) { entity.Status = Y; }
   - switch (entity.Status) { case X: ... }

4. หา guard conditions:
   - if (condition) throw new Exception("cannot transition");

5. หา UI status indicators:
   - <span class='badge'>@Model.Status</span>
   - StatusBadge component

Return JSON format:
{
  'state_machines': [{
    'entity': 'Order',
    'states': ['Draft', 'Pending', ...],
    'transitions_found': [{ 'from': '...', 'to': '...', 'trigger': '...', 'source': 'file:line' }],
    'invalid_transitions_found': [{ 'from': '...', 'to': '...', 'error': '...' }],
    'guard_conditions': [{ 'transition': '...', 'condition': '...', 'source': 'file:line' }],
    'is_approval_workflow': true|false,    ← flag ถ้าเข้าข่าย approval
    'approval_signals': [
      'transitions มี role-gated check ([Authorize] / role guard)',
      'Actions ใน UI เปลี่ยนตาม role + state',
      'มี notification trigger on state change',
      'มี audit log table'
    ]
  }]
}

หมายเหตุ: ถ้า is_approval_workflow=true → Agent 5 จะ deep-dive ต่อ"
```

#### Agent 2: API Endpoint Detector

```
Dispatch Agent (subagent_type: "Explore", run_in_background: true):

"วิเคราะห์ codebase หา API endpoints สำหรับ module {MODULE}:

1. Backend API endpoints:
   - C#: [HttpPost('api/...')] / [HttpPut] / [HttpDelete]
   - Express: router.post('/api/...', ...)
   - Next.js: app/api/.../route.ts

2. Frontend API calls:
   - fetch('/api/...', { method: 'POST' })
   - axios.post('/api/...', data)

3. Response patterns:
   - return Ok(result)     → 200
   - return BadRequest()   → 400
   - return NotFound()     → 404
   - StatusCode(500)       → 500

4. Error handling ใน frontend:
   - try/catch patterns
   - .catch(error => ...)
   - interceptors

5. Request/Response types:
   - DTO classes, interfaces

Return JSON format:
{
  'api_endpoints': [{
    'url': '/api/orders',
    'method': 'POST',
    'backend_source': 'file:line',
    'frontend_callers': ['file:line'],
    'request_fields': [{ 'name': '...', 'type': '...', 'required': true }],
    'response_codes': [200, 400, 500],
    'has_retry_logic': false,
    'has_timeout_handling': false
  }]
}"
```

#### Agent 3: Validation & Business Logic Detector

```
Dispatch Agent (subagent_type: "Explore", run_in_background: true):

"วิเคราะห์ codebase หา validation + business logic สำหรับ module {MODULE}:

1. Validation rules:
   - [Required], [MaxLength], [Range] attributes
   - FluentValidation rules
   - Service-level validation (throw if invalid)
   - Frontend validation (required, pattern, maxlength)

2. Computed fields:
   - Total = sum(items) * (1 + vat)
   - Discount calculations

3. Business branching:
   - if (total > 10000) { requireApproval(); }
   - if (user.level === 'gold') { applyDiscount(); }

4. Cross-field validation:
   - if (startDate > endDate) throw ...
   - if (discountPercent > 0 && discountAmount > 0) ...

5. Unique constraints:
   - .HasIndex(x => x.SKU).IsUnique()

Return JSON format:
{
  'business_logic': [{
    'entity': 'Product',
    'rules': [{
      'type': 'validation|calculation|conditional|cross-field|unique',
      'description': '...',
      'source': 'file:line',
      'testable_variants': [{ 'name': '...', 'input': {...}, 'expected': {...} }]
    }]
  }]
}"
```

#### Agent 4: ⭐ Cross-page Cascade Detector (MUST-HAVE)

```
Dispatch Agent (subagent_type: "Explore", run_in_background: true):

"วิเคราะห์ codebase หา cross-page master data references สำหรับ module {MODULE}:

1. หา Foreign Key relationships:
   - EF: navigation properties (Product.Category, Product.CategoryId)
   - Migration: ForeignKey constraints ใน CreateTable
   - SQL: REFERENCES clause
   - Output: relationship + OnDelete behavior (Restrict/Cascade/SetNull)

2. หา UI elements ที่อ้างอิง master data:
   - Dropdown/Select ที่ดึง master data
     <Select asyncOptions={fetchCategories} />
   - Filter ที่ใช้ master ID
   - Display column ที่แสดงชื่อ master
   - Auto-complete ที่ search master

3. หา indirect chains (A→B→C):
   - Category referenced by Product
   - Product referenced by OrderItem
   - → INDIRECT chain: Category → Product → OrderItem
   ต้อง trace ทั้ง chain ไม่ใช่แค่ direct

4. หา on_delete handler:
   - Backend: try { delete } catch { return error 'has dependents' }
   - DB constraint: ON DELETE RESTRICT/CASCADE/SET NULL

Return JSON format:
{
  'cascade_relationships': [{
    'master_module': 'CATEGORY',
    'master_page': '/admin/categories',
    'master_entity_file': 'Models/Category.cs',
    'dependent_modules': [{
      'module': 'PRODUCT',
      'page': '/admin/products',
      'relationship': 'Product.CategoryId → Category.Id',
      'on_delete': 'Restrict|Cascade|SetNull',
      'on_delete_source': 'file:line',
      'affected_ui_elements': [
        'Category dropdown in Product create form',
        'Category column in Product list',
        'Category filter in Product list'
      ]
    }],
    'indirect_chains': [
      ['CATEGORY', 'PRODUCT', 'ORDER_ITEM']
    ]
  }]
}

หมายเหตุ: ถ้าไม่พบ cascade relationships → return cascade_relationships: []
แต่ห้ามข้าม Agent นี้"
```

#### Agent 5: ⭐ Approval Workflow Detector (MUST-HAVE)

```
Dispatch Agent (subagent_type: "Explore", run_in_background: true):

"วิเคราะห์ codebase หา approval workflow patterns สำหรับ module {MODULE}:

ข้อแตกต่างจาก Agent 1 (State Machine):
- State Machine = single-actor state transitions (1 user เปลี่ยน state เอง)
- Approval Workflow = multi-actor + role-gated transitions
  (role A submit → role B approve → role C complete)

1. หา multi-role state transitions:
   - if (status==='draft' && user.role==='requester') { allow Submit }
   - if (status==='submitted' && user.role==='manager') { allow Approve/Reject }
   - if (status==='approved' && user.role==='admin') { allow Complete }

2. หา approval-specific UI patterns:
   - Buttons เปลี่ยนตาม state + role
   - <If condition={isManager && status==='submitted'}>
       <ApproveButton /> <RejectButton />
     </If>

3. หา notification triggers:
   - emailService.send(nextActor.email, ...)
   - notificationHub.notify(role: 'manager', ...)
   - SignalR/WebSocket push notification on state change

4. หา audit log:
   - ApprovalHistory table / AuditLog table
   - INSERT INTO approval_history(entity_id, old_state, new_state, actor, timestamp)
   - service.LogTransition(entity, from, to, currentUser)

5. หา approval policy:
   - PolicyAuthorization: AddPolicy('CanApprove', ...)
   - business rules: 'manager can't approve own request' (self-approval check)
   - 'requires N approvers' (multi-step approval)

Return JSON format:
{
  'approval_workflows': [{
    'module': 'LEAVE',
    'entity_page': '/leave/{id}',
    'entity_file': 'Models/LeaveRequest.cs',
    'states': ['draft', 'submitted', 'approved', 'rejected', 'completed', 'cancelled'],
    'actors': ['requester', 'manager', 'admin'],
    'transitions': [
      { 'from': 'draft', 'to': 'submitted', 'actor': 'requester',
        'trigger': 'Submit button', 'source': 'file:line' },
      { 'from': 'submitted', 'to': 'approved', 'actor': 'manager',
        'trigger': 'Approve button', 'source': 'file:line', 'requires_comment': false },
      { 'from': 'submitted', 'to': 'rejected', 'actor': 'manager',
        'trigger': 'Reject button', 'source': 'file:line', 'requires_comment': true },
      { 'from': 'submitted', 'to': 'draft', 'actor': 'manager',
        'trigger': 'Send back', 'source': 'file:line', 'requires_comment': true },
      { 'from': 'approved', 'to': 'completed', 'actor': 'admin',
        'trigger': 'Complete button', 'source': 'file:line' },
      { 'from': 'draft', 'to': 'cancelled', 'actor': 'requester',
        'trigger': 'Cancel button', 'source': 'file:line' }
    ],
    'policies': [
      { 'rule': 'self-approval-blocked', 'source': 'file:line' },
      { 'rule': 'requires-N-approvers', 'count': 1 }
    ],
    'notifications': ['email', 'in-app'],
    'notification_triggers': ['file:line', 'file:line'],
    'audit_log_table': 'ApprovalHistory',
    'audit_log_source': 'file:line'
  }]
}

หมายเหตุ: ถ้าไม่พบ approval workflows → return approval_workflows: []
แต่ห้ามข้าม Agent นี้"
```

### Enhance Step 4: Pattern Matching → Build Recommendations

```
รวมผล 5 agents → สร้าง recommendations:

state_machines found (single-actor)?
  → สร้าง State Machine scenarios (Template 8 — Lifecycle):
    - 1 scenario per happy path (all transitions)
    - 1 scenario per invalid transition
    - 1 scenario per guard condition

api_endpoints found with multiple response_codes?
  → สร้าง Network Mock scenarios:
    - 1 test per response code
    - 1 test for timeout (ถ้า has_timeout_handling == false)
    - 1 test for retry (ถ้า has_retry_logic == true)
    - request validation ทุก endpoint

business_logic.testable_variants found?
  → สร้าง Data-Driven scenarios:
    - 1 scenario per entity with variants from detected rules

CRUD scenarios ของ entity เดียวกัน?
  → สร้าง Serial Group:
    - serial_group = "{ENTITY}-LIFECYCLE"
    - serial_order = create(1) → edit(2) → delete(3)

⭐ cascade_relationships found? (MUST-HAVE)
  → สร้าง Cascade scenarios (Template 7) per relationship:
    - CASCADE-UPDATE: แก้ master → dependent shows new data
    - CASCADE-DELETE-RESTRICT: ลบ master ที่มี dependents → error
    - CASCADE-DELETE-EMPTY: ลบ master ว่าง → success
    - CASCADE-DROPDOWN: dropdown ใน dependent อัพเดท
    - CASCADE-DISABLE: disable master → dependent ยังทำงาน?
  → สร้าง INDIRECT chains:
    - For each indirect_chains [A, B, C]:
      CASCADE-INDIRECT: แก้ A → ตรวจ B → ตรวจ C ยังถูก

⭐ approval_workflows found? (MUST-HAVE)
  → สร้าง Approval Workflow scenarios (Template 9):
    Happy path:
      - 1 scenario per transition (requester submit, manager approve, admin complete)
    Rejection paths:
      - 1 scenario per rejection transition (reject, send-back)
    Visibility per role × state:
      - 1 scenario: requester เห็น Submit ใน draft แต่ไม่เห็น Approve
      - 1 scenario: manager เห็น Approve/Reject ใน submitted
      - 1 scenario: other users เห็นแค่ View
      - 1 scenario: approved request → ทุก role ไม่แก้ได้
    Edge cases (จาก policies):
      - self-approval-blocked → 1 scenario
      - concurrent approval (2 managers พร้อมกัน) → 1 scenario
      - audit log ครบทุก transition → 1 scenario
      - notification ส่งไปยัง next actor → 1 scenario

Precedence (เมื่อ entity เข้าได้หลายแบบ):
  Has FK + state + multi-actor → Cascade + Approval (skip Lifecycle)
  Has FK + state + single actor → Cascade + Lifecycle
  Has FK only → Cascade
  Has state + multi-actor only → Approval
  Has state + single actor only → Lifecycle
```

### Enhance Step 5: Show Recommendations

```
📋 Enhance Recommendations:

│ # │ Pattern              │ Module  │ Description                      │ Scenarios   │
├──────────────────────────────────────────────────────────────────────────────────│
│ 1 │ 🔄 State Machine      │ ORDER   │ Order lifecycle: draft→shipped   │ +4 new      │
│ 2 │ 📊 Data-Driven        │ PRODUCT │ Validation 8 variants            │ +2 (merge 6)│
│ 3 │ 🌐 Network Mock       │ CART    │ Payment API: 200,400,500,timeout │ +3 new      │
│ 4 │ 🔗 Serial Group       │ ORDER   │ Create→Edit→Delete lifecycle     │ regroup 3   │
│ 5 │ ⭐ Cross-page Cascade │ CATEGORY│ FK to PRODUCT, ORDER (INDIRECT)  │ +12 new     │
│ 6 │ ⭐ Approval Workflow  │ LEAVE   │ employee→manager→admin           │ +12 new     │

⭐ MUST-HAVE patterns (5, 6) ถูกแนะนำเสมอเมื่อตรวจพบ — ห้าม skip

เลือกทำข้อไหน? (all / เลขข้อ / skip)
```

### ⭐ Enhance Step 5.5: Diff & Merge (Re-run mode)

📖 ใช้ logic จาก `references/multi-pass-strategy.md`

#### 5.5.1 — Compute signatures
```
For each new advanced scenario:
  signature = `${module}:${flow_type || cascade_type || approval}:${normalize(title)}`
  
  ตัวอย่าง:
  - "ORDER:state-machine:order-lifecycle-draft-to-shipped"
  - "CATEGORY:cascade-INDIRECT:category-product-order-chain"
  - "LEAVE:approval-workflow:manager-approves-leave-request"
```

#### 5.5.2 — Compare with existing
```
existing_signatures = qa-tracker.json.scenarios
                       .filter(s => s.advanced)
                       .map(s => s.signature)

For each new scenario:
  if signature in existing_signatures:
    → SKIP, log "duplicate of TS-XXX from Pass {N}"
  else:
    → ADD with:
      - new ID
      - created_in_pass = current_pass
      - created_by_model = pass_mode model
      - signature = computed
```

#### 5.5.3 — Diff Preview + Confirm
```
🔍 Diff Preview (Pass 3 - opus, --pass-mode opus-cascade-focus):

State Machine (ORDER):
   ✓ Existing: 4 scenarios (Pass 1, sonnet)
   + New: 2 scenarios (Pass 3, opus)
     - Concurrent transition (2 users approve)
     - Race condition: state change during edit
   ≈ Skipped: 2 (duplicate)

⭐ Cross-page Cascade (PRODUCT, CATEGORY):
   ✓ Existing: 6 scenarios (Pass 2, opus)
   + New: 5 scenarios (Pass 3, opus-cascade-focus)
     - INDIRECT: USER → ORDER → ORDER_ITEM (was missed)
     - DROPDOWN: 3 ระดับ cascade dropdown
     - DELETE-SETNULL on USER → ORDER (existing OnDelete=SetNull)
     - DISABLE: inactive Category → Product list
     - INDIRECT: 4-level chain (Org→Dept→User→Order)

⭐ Approval Workflow (LEAVE):
   ✓ Existing: 12 scenarios (Pass 2)
   + New: 4 scenarios (Pass 3, opus-cascade-focus)
     - Multi-level approval (manager → director → CEO)
     - Delegation: manager out → backup approves
     - Auto-escalation after 5 days no action
     - Audit log integrity check (immutable history)

📊 Summary:
   Pass 1 (sonnet): 8 advanced scenarios
   Pass 2 (opus):   +30 scenarios
   Pass 3 (opus-cascade-focus): +11 new, 5 skipped
   ────────────────────────────────────────
   Total advanced: 49 scenarios

✅ Confirm to merge? (yes/no/edit)
```

ถ้า `--dry-run` → STOP

---

### Enhance Step 6: Create Scenarios + Variants Files

สำหรับแต่ละ recommendation ที่เลือก:

1. **State Machine** → เพิ่ม scenario ใน qa-tracker.json พร้อม `advanced.flow_type: "state-machine"`
2. **Data-Driven** → เพิ่ม scenario + สร้าง `test-data/TS-{MODULE}-DDT-{NNN}.json` ตาม schema `qa-variants-v1`
   - ต้องมี `"$schema": "qa-variants-v1"`, `"description"`, `"setup"`, `"variants[]"`
   - ทุก variant: `name` (kebab-case), `input`, `expected.result`
   - ดู schema: `references/qa-variants-schema.json`
3. **Network Mock** → เพิ่ม scenario พร้อม `advanced.mocks[]`
4. **Serial Group** → แก้ existing scenarios เพิ่ม `advanced.serial_group` + `serial_order`
5. **⭐ Cross-page Cascade** → เพิ่ม scenarios + เพิ่ม `cascade_dependencies[]` ใน qa-tracker.json
   - ID prefix: `TS-CASCADE-{MASTER}-{DEPENDENT}-{TYPE}`
   - `advanced.cascade_type`: UPDATE / DELETE-RESTRICT / DELETE-EMPTY / DROPDOWN / DISABLE / INDIRECT
   - For INDIRECT: `advanced.cascade_chain: ["A", "B", "C"]`
6. **⭐ Approval Workflow** → เพิ่ม scenarios + เพิ่ม `approval_workflows[]` ใน qa-tracker.json
   - ID prefix: `TS-{MODULE}-APPROVAL-{NNN}`
   - `advanced.flow_type: "approval-workflow"`
   - `advanced.approval`: { actor_role, from_state, to_state, depends_on_data, actors_involved }
   - Multi-context test pattern (browser.newContext per actor) — ดู test-templates.md Template 9
7. **Merged scenarios** → เดิมตั้ง `status: "deprecated"`, สร้างใหม่แทน

#### Scenario entry examples

**Cascade scenario:**
```json
{
  "id": "TS-CASCADE-CATEGORY-PRODUCT-INDIRECT",
  "title": "แก้ Category → ตรวจ Product → ตรวจ Order ยังถูก (A→B→C)",
  "module": "CATEGORY",
  "type": "cascade",
  "advanced": {
    "cascade_type": "INDIRECT",
    "cascade_chain": ["CATEGORY", "PRODUCT", "ORDER_ITEM"],
    "master_field": "name",
    "expected_propagation": "all dependent pages show new value"
  },
  "status": "pending"
}
```

**Approval Workflow scenario:**
```json
{
  "id": "TS-LEAVE-APPROVAL-003",
  "title": "Manager approves leave request",
  "module": "LEAVE",
  "type": "approval-workflow",
  "advanced": {
    "flow_type": "approval-workflow",
    "approval": {
      "actor_role": "manager",
      "from_state": "submitted",
      "to_state": "approved",
      "permissions_required": ["leave.approve"],
      "depends_on_data": {
        "from": "TS-LEAVE-APPROVAL-002",
        "field": "leave_id"
      },
      "actors_involved": ["employee", "manager"],
      "expected_notifications": ["email to employee", "in-app to admin"],
      "expected_audit_log": "ApprovalHistory entry: submitted→approved"
    }
  },
  "status": "pending"
}
```

### Enhance Step 7: Show Summary + Commit

```
✅ Advanced Enhance สำเร็จ!

📊 Module: {MODULE}
   State Machine:        +4 scenarios
   Data-Driven:          +2 scenarios (merged 6 → 2)
   Network Mock:         +3 scenarios
   Serial Group:         regrouped 3 scenarios
   ⭐ Cross-page Cascade: +12 scenarios (3 relationships, 1 INDIRECT chain)
   ⭐ Approval Workflow:  +12 scenarios (LEAVE: employee→manager→admin)

📁 Files:
   qa-tracker.json (updated)
     + cascade_dependencies[]  (3 entries)
     + approval_workflows[]    (1 entry)
   test-data/TS-ORDER-FLOW-001.json (new)
   test-data/TS-PRODUCT-DDT-001.json (new)
   test-data/TS-LEAVE-APPROVAL-FIXTURES.json (new — multi-actor test data)

🔜 Next:
   /qa-continue-advanced --module ORDER     — generate scripts + run
   /qa-continue --cascade CATEGORY          — ทดสอบ MUST-HAVE #1
   /qa-continue --approval LEAVE            — ทดสอบ MUST-HAVE #2 (multi-actor)
```

```bash
git add qa-tracker.json test-data/
git commit -m "advanced-scenario: enhance ORDER with state-machine, cascade, approval-workflow"
```

---

## Mode B: --auto (Scan Codebase)

### ⭐ Auto Step 0: Re-run Detection

ทำเหมือน Enhance Step 0 — ตรวจ qa-tracker.json + ถาม user
ถ้ามี advanced scenarios อยู่แล้ว → ไป multi-pass flow

### Auto Step 1: Dispatch Detection Agents

เหมือน Enhance Step 3 แต่ scan ทั้ง codebase (ไม่จำกัด module)

### Auto Step 2: Pattern Matching

เหมือน Enhance Step 4

### Auto Step 2.5: Diff & Merge

ทำเหมือน Enhance Step 5.5 — compute signatures + diff + confirm

### Auto Step 3: Build qa-tracker.json

ถ้ามี qa-tracker.json อยู่แล้ว → เพิ่ม advanced scenarios (ไม่แก้เดิม)
ถ้าไม่มี → สร้างใหม่พร้อม advanced scenarios

ทุก scenario ต้องมี:
- `created_in_pass`
- `created_by_model`
- `signature`
- `created_at`

อัปเดต `passes_history[]` ใน qa-tracker.json

### Auto Step 4: Show Summary + Confirm

```
✅ Auto-generate สำเร็จ!

📊 สแกนพบ:
   State Machines:           3 (Order, Task, Invoice — single-actor)
   API Endpoints:           12 (with mock-able responses)
   Business Rules:           8 (with testable variants)
   ⭐ Cascade Relationships:  3 (CATEGORY→PRODUCT, PRODUCT→ORDER, USER→ORDER)
       └─ INDIRECT chain:    1 (CATEGORY → PRODUCT → ORDER)
   ⭐ Approval Workflows:     2 (LEAVE, PURCHASE_REQ)

📋 Advanced Scenarios: 75 total
   ├── State Machine:          12 scenarios
   ├── Data-Driven:            15 scenarios
   ├── Network Mock:           10 scenarios
   ├── Serial Group:            8 scenarios (4 groups)
   ├── ⭐ Cross-page Cascade:   18 scenarios (5 + 3 + 3 per relationship + 7 INDIRECT)
   └── ⭐ Approval Workflow:    12 scenarios per workflow × 2 = 24 scenarios

🔜 Next:
   /qa-continue-advanced            — generate scripts + run ทุก patterns
   /qa-continue --cascade CATEGORY  — ทดสอบ MUST-HAVE #1
   /qa-continue --approval LEAVE    — ทดสอบ MUST-HAVE #2 (multi-context)
```

### Auto Step 5: Commit

```bash
git add qa-tracker.json test-data/ .agent/qa-progress.md
git commit -m "advanced-scenario: auto-generate N advanced scenarios from codebase"
```

---

## Output

ทุก mode ต้อง output:
1. Updated qa-tracker.json
2. Variants files ใน test-data/ (ถ้ามี data-driven)
3. Progress log ใน .agent/qa-progress.md
4. Git commit

> This command responds in Thai (ภาษาไทย)
