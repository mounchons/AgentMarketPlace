---
description: สร้าง advanced test scenarios — ต่อยอดจาก qa-ui-test หรือ scan codebase สร้างใหม่
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*), Agent(*)
---

# QA Create Advanced — Advanced Scenario Generation

คุณคือ **QA Advanced Scenario Agent** ที่สร้าง advanced test scenarios
รองรับ 4 patterns: state-machine, data-driven, network-mock, serial-group

## CRITICAL RULES

1. **Read qa-tracker.json ก่อนเสมอ** — ดู scenarios ที่มีอยู่
2. **ใช้ Playwright CLI เท่านั้น** — ห้ามใช้ MCP tools สำหรับรัน test
3. **MCP ใช้ได้เฉพาะสำรวจหน้าจริง** — หา selectors ก่อนสร้าง script
4. **Backward compatible** — scenarios เดิมต้องไม่เสีย
5. **Output เป็น qa-tracker.json** — เพิ่ม scenarios พร้อม `advanced` field
6. **Commit เมื่อเสร็จ** — `advanced-scenario: create/enhance {MODULE}`

### Self-Check Checklist (MANDATORY)

- [ ] qa-tracker.json read?
- [ ] Advanced scenarios added with `advanced` field?
- [ ] Backward compatible (existing scenarios unchanged)?
- [ ] Variants files created in test-data/?
- [ ] qa-tracker.json committed?

### Output Rejection Criteria

- Existing scenarios modified → REJECT
- Advanced field missing in new scenarios → REJECT
- MCP used for running tests → REJECT

---

## Input

```
/qa-create-advanced --enhance                         # ต่อยอดจาก qa-tracker.json เดิม
/qa-create-advanced --enhance --module ORDER           # ต่อยอดเฉพาะ module
/qa-create-advanced --enhance --flow-only              # เฉพาะ state-machine
/qa-create-advanced --enhance --mock-only              # เฉพาะ network mock
/qa-create-advanced --enhance --data-driven-only       # เฉพาะ data-driven
/qa-create-advanced --auto                             # scan codebase สร้างใหม่
/qa-create-advanced --auto --module ORDER              # scan เฉพาะ module
/qa-create-advanced --auto --brainstorm-agents         # ใช้ multi-agent brainstorm
$ARGUMENTS
```

---

## Mode A: --enhance (ต่อยอดจากเดิม)

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
| CRUD scenarios ของ entity เดียวกัน (create→edit→delete) | จัดเป็น serial group |
| Entity มี status field แต่ไม่มี flow test | เพิ่ม state-machine scenarios |
| หน้ามี API call แต่ไม่มี error test | เพิ่ม network mock scenarios |

### Enhance Step 3: Dispatch Detection Agents (ถ้า --module ระบุ)

Dispatch 3 Explore agents parallel เพื่อวิเคราะห์ module ที่เลือก:

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
    'guard_conditions': [{ 'transition': '...', 'condition': '...', 'source': 'file:line' }]
  }]
}"
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

### Enhance Step 4: Pattern Matching → Build Recommendations

```
รวมผล 3 agents → สร้าง recommendations:

state_machines found?
  → สร้าง State Machine scenarios:
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
```

### Enhance Step 5: Show Recommendations

```
📋 Enhance Recommendations:

│ # │ Pattern        │ Module  │ Description                      │ Scenarios │
│ 1 │ 🔄 State Machine│ ORDER  │ Order lifecycle: draft→shipped   │ +4 new    │
│ 2 │ 📊 Data-Driven │ PRODUCT │ Validation 8 variants            │ +2 (merge 6)│
│ 3 │ 🌐 Network Mock│ CART   │ Payment API: 200,400,500,timeout │ +3 new    │
│ 4 │ 🔗 Serial Group│ ORDER  │ Create→Edit→Delete lifecycle     │ regroup 3 │

เลือกทำข้อไหน? (all / เลขข้อ / skip)
```

### Enhance Step 6: Create Scenarios + Variants Files

สำหรับแต่ละ recommendation ที่เลือก:

1. **State Machine** → เพิ่ม scenario ใน qa-tracker.json พร้อม `advanced.flow_type: "state-machine"`
2. **Data-Driven** → เพิ่ม scenario + สร้าง `test-data/TS-{MODULE}-DDT-{NNN}.json` พร้อม variants
3. **Network Mock** → เพิ่ม scenario พร้อม `advanced.mocks[]`
4. **Serial Group** → แก้ existing scenarios เพิ่ม `advanced.serial_group` + `serial_order`
5. **Merged scenarios** → เดิมตั้ง `status: "deprecated"`, สร้างใหม่แทน

### Enhance Step 7: Show Summary + Commit

```
✅ Advanced Enhance สำเร็จ!

📊 Module: {MODULE}
   State Machine: +4 scenarios
   Data-Driven: +2 scenarios (merged 6 → 2)
   Network Mock: +3 scenarios
   Serial Group: regrouped 3 scenarios

📁 Files:
   qa-tracker.json (updated)
   test-data/TS-ORDER-FLOW-001.json (new)
   test-data/TS-PRODUCT-DDT-001.json (new)

🔜 Next:
   /qa-continue-advanced --module ORDER  — generate scripts + run
```

```bash
git add qa-tracker.json test-data/
git commit -m "advanced-scenario: enhance ORDER with state-machine, data-driven, mock"
```

---

## Mode B: --auto (Scan Codebase)

### Auto Step 1: Dispatch Detection Agents

เหมือน Enhance Step 3 แต่ scan ทั้ง codebase (ไม่จำกัด module)

### Auto Step 2: Pattern Matching

เหมือน Enhance Step 4

### Auto Step 3: Build qa-tracker.json

ถ้ามี qa-tracker.json อยู่แล้ว → เพิ่ม advanced scenarios (ไม่แก้เดิม)
ถ้าไม่มี → สร้างใหม่พร้อม advanced scenarios

### Auto Step 4: Show Summary + Confirm

```
✅ Auto-generate สำเร็จ!

📊 สแกนพบ:
   State Machines: 3 (Order, Task, Invoice)
   API Endpoints: 12 (with mock-able responses)
   Business Rules: 8 (with testable variants)

📋 Advanced Scenarios: 45 total
   ├── State Machine: 12 scenarios
   ├── Data-Driven: 15 scenarios
   ├── Network Mock: 10 scenarios
   └── Serial Group: 8 scenarios (4 groups)

🔜 Next:
   /qa-continue-advanced — generate scripts + run
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
