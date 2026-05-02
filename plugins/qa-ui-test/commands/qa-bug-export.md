---
description: Export bug → long-running feature_list.json เป็น new feature (epic="bug-fix") — ให้ /continue หยิบไป fix ได้เลย
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*), Agent(*)
---

# QA Bug Export — Bug → New Feature in long-running

คุณคือ **QA Bug Export Agent** ที่นำ bug จาก qa-tracker.json ไปสร้างเป็น **feature ใหม่** ใน long-running's `feature_list.json` ให้ developer ใช้ `/continue` หยิบไป fix ได้เหมือน feature ปกติ

## CRITICAL RULES

1. **ห้าม overwrite features เดิม** — append เท่านั้น
2. **ต้องตรวจ feature_list.json มีจริงก่อน** — ถ้าไม่มีให้แจ้ง user รัน `/init` ของ long-running
3. **ห้าม export bug ที่ status == "exported"/"in_progress"/"fixed"** ซ้ำ — เว้นแต่ user ระบุ `--force`
4. **ต้อง sync 2 ทาง** — qa-tracker.bug.exported_to ↔ feature_list.feature.linked_bug
5. **แสดง preview ก่อน append** — ถาม user confirm

### Self-Check Checklist (MANDATORY)

- [ ] qa-tracker.json อ่านแล้ว?
- [ ] feature_list.json มีอยู่ + อ่านแล้ว?
- [ ] Bug ID ที่ระบุ (หรือ filter) ถูกต้อง?
- [ ] ไม่มี duplicate export?
- [ ] Preview แสดงให้ user confirm?
- [ ] feature_list.json append (ไม่ overwrite)?
- [ ] qa-tracker.bug.exported_to อัพเดท?
- [ ] feature.linked_bug ตั้ง?
- [ ] summary ของ feature_list อัพเดท?

### Output Rejection Criteria

- Export โดยไม่ confirm → REJECT
- Overwrite feature เดิม → REJECT
- ไม่อัพเดท exported_to ใน qa-tracker → REJECT
- ไม่ตั้ง linked_bug ใน feature_list → REJECT

---

## Input ที่ได้รับ

```
/qa-bug-export BUG-001                    # export bug เดียว
/qa-bug-export BUG-001,BUG-002,BUG-003    # export หลาย bugs
/qa-bug-export --severity critical        # export ทุก bug ที่ critical
/qa-bug-export --severity critical,high   # multiple severities
/qa-bug-export --module PRODUCT           # ทุก bug ของ module
/qa-bug-export --not-exported             # ทุก bug ที่ยังไม่ export (default ของ --all)
/qa-bug-export --all                      # ทั้งหมดที่เข้าเงื่อนไข
/qa-bug-export BUG-001 --force            # force export แม้จะ exported แล้ว
/qa-bug-export BUG-001 --dry-run          # preview only
$ARGUMENTS
```

**Default eligibility:**
- `type == "app-defect"` (test-issue/flaky/environment ไม่ export — แจ้ง user แยก)
- `status in [triaged, new]` (exclude in_progress/fixed/verified/closed/wont_fix unless --force)
- `exported_to.target == null` (ไม่เคย export)

---

## ขั้นตอนที่ต้องทำ

### Step 0: Read Context

```bash
# 1. Read qa-tracker.json
cat qa-tracker.json

# 2. Verify feature_list.json exists
ls feature_list.json 2>/dev/null

# 3. Read feature_list.json
cat feature_list.json
```

**ถ้าไม่มี feature_list.json:**
```
❌ ไม่พบ feature_list.json (long-running plugin ยังไม่ได้ init)

   วิธีแก้:
   1. รัน /init (long-running) เพื่อสร้าง feature_list.json
   2. หรือถ้ามี long-running schema เดิมแล้ว ตรวจ path

   หรือเลือก export แบบอื่น:
   /qa-bug-export-subtask {bug-id}    # ถ้ามี feature เดิมที่ตรง
```

**ถ้าไม่มี qa-tracker.json:**
```
❌ ไม่พบ qa-tracker.json → /qa-create-scenario ก่อน
```

---

### Step 1: Select Bugs

**Parse arguments → filter bugs[]:**

```
สำหรับ filter ที่ใช้ → คัดเฉพาะ bugs ที่:
  ✓ status NOT IN [exported, in_progress, fixed, verified, closed, wont_fix] (เว้นแต่ --force)
  ✓ exported_to.target == null (เว้นแต่ --force)
  ✓ type == "app-defect" (เว้นแต่ --force)

ถ้า bug ที่เลือกมีบางตัวไม่ผ่าน eligibility:
  แสดง warning + skip (แต่ดำเนินต่อกับตัวอื่น)
  
  ⚠️  Skipped:
  - BUG-005: type=test-issue (ไม่ใช่ app-defect — แก้ใน QA team)
    → /qa-edit-scenario TS-PROFILE-005
  - BUG-008: status=exported (มีใน feature_list.json#42 แล้ว)
    → ใช้ --force เพื่อ export ซ้ำ หรือ /qa-bug-list BUG-008 ดูสถานะ
```

---

### Step 2: Build Feature Entry — สำหรับแต่ละ bug

**Schema mapping (qa bug → long-running feature):**

```
let next_id = max(features[].id) + 1
let feature = {
  id: next_id,
  epic: "bug-fix",
  flow_id: null,
  state_produces: [],
  state_consumes: [],
  module: <map_module(bug.module)>,
  layer: <derive_layer(bug.page_type)>,
  category: "bug-fix",
  description: `[BUG-FIX] ${bug.title}`,
  priority: <severity_to_priority(bug.severity)>,
  complexity: <severity_to_complexity(bug.severity)>,
  risk_level: <severity_to_risk(bug.severity)>,
  status: "pending",
  blocked_reason: null,

  subtasks: <generate_subtasks(bug)>,

  acceptance_criteria: <generate_acceptance(bug)>,

  time_tracking: {
    estimated_time: <severity_to_time(bug.severity)>,
    actual_time: null,
    started_at: null,
    completed_at: null
  },

  dependencies: [],
  references: [
    bug.evidence.report_path,
    bug.evidence.trace_path,
    `qa-tracker.json#bugs.${bug.id}`,
    `test-scenarios/${bug.linked_scenario}.md`,
    ...bug.evidence.screenshots
  ],

  design_doc_refs: { entity_ref: null, api_ref: null, section: "bug-fix", diagram_refs: [] },
  mockup_validated: false,
  mockup_version: null,
  mockup_page_refs: [],
  required_components: [],

  passes: false,
  verification_results: {
    build_check: null,
    qa_test_pass: null,    // จะ set true เมื่อ /qa-bug-verify ผ่าน
    test_coverage: { unit: 0, integration: 0, e2e: 1 },  // มี e2e จาก qa
    verified_at: null
  },

  steps_legacy: <reproduction_to_steps(bug.reproduction)>,
  tested_at: null,
  assigned_model: <severity_to_model(bug.severity)>,
  is_reference_impl: false,
  review: null,

  // Bug-fix specific fields (extension)
  linked_bug: {
    qa_bug_id: bug.id,
    severity: bug.severity,
    type: bug.type,
    linked_scenario: bug.linked_scenario,
    discovered_at: bug.discovered_at,
    qa_tracker_path: "qa-tracker.json"
  },

  notes: <generate_notes(bug)>
}
```

---

### Step 3: Mapping Functions (Implementation)

#### `severity_to_priority(severity)`
```
critical → "high"
high     → "high"
medium   → "medium"
low      → "low"
```

#### `severity_to_complexity(severity)`
```
critical → "complex"  // ต้องระวัง, อาจกระทบหลายจุด
high     → "medium"
medium   → "medium"
low      → "simple"
```

#### `severity_to_risk(severity)`
```
critical → "high"
high     → "medium"
medium   → "low"
low      → "low"
```

#### `severity_to_time(severity)`
```
critical → "60min"
high     → "45min"
medium   → "30min"
low      → "20min"
```

#### `severity_to_model(severity)`
```
critical → "opus"      // architectural fix อาจซับซ้อน
high     → "opus"
medium   → "sonnet"
low      → "sonnet"
```

#### `map_module(qa_module)`
```
อ่าน modules.json (long-running) ถ้ามี:
  หา module ที่:
    - id matches lower-case(qa_module) + "-module"
    - หรือ name matches qa_module case-insensitive
  
  ถ้าไม่เจอ + page_type == "form" และ qa_module == "LOGIN" → "auth-module" (ถ้ามี)
  ถ้าไม่เจอ + page_type == "master-data" → "api-module"
  ถ้าไม่เจอเลย → null (ปล่อยว่าง — long-running จะใส่ทีหลัง)
```

#### `derive_layer(page_type)`
```
form, master-data, master-detail, wizard, dashboard, search → "presentation"
state-machine, network-mock, data-driven                    → "application"
```

#### `generate_subtasks(bug)` — หัวใจของการ fix workflow

```
subtasks = []

// 1. Reproduce
subtasks.push({
  id: `${next_id}.1`,
  description: `Reproduce ${bug.id} locally — follow reproduction steps`,
  done: false,
  committed_at: null, commits: [], depends_on: [], files: []
})

// 2. Investigate (ถ้ามี root_cause_hint ใส่ไว้ด้วย)
let investigate_desc = "Investigate root cause"
if bug.root_cause_hint:
  investigate_desc += ` — เริ่มดูที่ ${bug.root_cause_hint.suspected_files.join(', ')} (${bug.root_cause_hint.confidence*100}% confidence)`
subtasks.push({
  id: `${next_id}.2`,
  description: investigate_desc,
  done: false, depends_on: [`${next_id}.1`], commits: [], files: bug.root_cause_hint?.suspected_files || []
})

// 3. Fix
subtasks.push({
  id: `${next_id}.3`,
  description: `Implement fix — ensure expected behavior: "${bug.reproduction.expected}"`,
  done: false, depends_on: [`${next_id}.2`], commits: [], files: []
})

// 4. Verify with QA test (สำคัญ — link กลับ qa-bug-verify)
subtasks.push({
  id: `${next_id}.4`,
  description: `Run /qa-bug-verify ${bug.id} เพื่อยืนยัน fix และปิด bug`,
  done: false, depends_on: [`${next_id}.3`], commits: [], files: []
})

// 5. Add regression test (ถ้า severity >= high)
if bug.severity in ["critical", "high"]:
  subtasks.push({
    id: `${next_id}.5`,
    description: `เพิ่ม regression test (boundary/negative case) — /qa-edit-scenario ${bug.linked_scenario} "ป้องกัน regression ของ ${bug.id}"`,
    done: false, depends_on: [`${next_id}.4`], commits: [], files: []
  })

return subtasks
```

#### `generate_acceptance(bug)`
```
return [
  `${bug.linked_scenario} ผ่าน (status=passed) ใน /qa-bug-verify ${bug.id}`,
  `Expected behavior: ${bug.reproduction.expected}`,
  `${bug.id} status เปลี่ยนเป็น "verified" ใน qa-tracker.json`,
  ...(bug.severity in ["critical", "high"] ? ["มี regression test ที่ครอบคลุม edge case"] : [])
]
```

#### `reproduction_to_steps(reproduction)` (legacy field)
```
return [
  `Setup: ${reproduction.preconditions.join(', ')}`,
  `Navigate: ${reproduction.url}`,
  ...reproduction.steps,
  `Expected: ${reproduction.expected}`,
  `Current actual: ${reproduction.actual}`
]
```

#### `generate_notes(bug)`
```
return `
## Bug Context

**Source:** ${bug.id} (qa-ui-test)
**Severity:** ${bug.severity} | **Type:** ${bug.type}
**Discovered:** ${bug.discovered_at}
**Linked scenario:** ${bug.linked_scenario}
**Failed runs:** ${bug.linked_runs.join(', ')}

### Failed Step
${bug.evidence.failed_step}

### Error
\`\`\`
${bug.evidence.error_message}
\`\`\`

### Expected vs Actual
- **Expected:** ${bug.reproduction.expected}
- **Actual:** ${bug.reproduction.actual}

### Evidence
- Screenshot: ${bug.evidence.screenshots[0] || 'N/A'}
- Trace: ${bug.evidence.trace_path}
- Full report: ${bug.evidence.report_path}

${bug.root_cause_hint ? `
### Root Cause Hint (${(bug.root_cause_hint.confidence * 100).toFixed(0)}% confidence)
**Suspected files:** ${bug.root_cause_hint.suspected_files.join(', ')}
**Hypothesis:** ${bug.root_cause_hint.hypothesis}
${bug.root_cause_hint.suggested_fix ? `**Suggested fix:** \`${bug.root_cause_hint.suggested_fix}\`` : ''}
` : ''}

### Verification
รัน \`/qa-bug-verify ${bug.id}\` เพื่อยืนยัน fix
`.trim()
```

---

### Step 4: Show Preview & Confirm

**สำหรับแต่ละ bug ที่จะ export — แสดง preview:**

```
🚀 Bug Export Preview

🐛 BUG-001: LOGIN — Validation error not shown on empty submit
   Severity: 🔴 critical | Type: 🐞 app-defect

⏬ จะสร้าง feature ใหม่ใน feature_list.json:

┌─ Feature #45 ────────────────────────────────────┐
│ Epic:        bug-fix                              │
│ Module:      auth-module  (mapped from LOGIN)     │
│ Layer:       presentation                         │
│ Category:    bug-fix                              │
│ Priority:    high  ← from severity                │
│ Complexity:  complex  ← from severity             │
│ Risk:        high                                 │
│ Est. time:   60min                                │
│ Model:       opus  ← critical → opus              │
│                                                   │
│ Description:                                      │
│   [BUG-FIX] LOGIN — Validation error not shown   │
│                                                   │
│ Subtasks (5):                                     │
│   45.1 Reproduce BUG-001 locally                 │
│   45.2 Investigate root cause —                  │
│        เริ่มดูที่ src/Controllers/AuthController│
│        .cs:42 (75% confidence)                   │
│   45.3 Implement fix — ensure: "Email is         │
│        required" alert displayed                  │
│   45.4 Run /qa-bug-verify BUG-001                │
│   45.5 เพิ่ม regression test                      │
│                                                   │
│ Acceptance criteria:                              │
│   ✓ TS-LOGIN-003 ผ่าน                             │
│   ✓ Expected: alert displayed                    │
│   ✓ BUG-001 status = verified                    │
│   ✓ มี regression test                           │
│                                                   │
│ References:                                       │
│   - test-results/TS-LOGIN-003/run-002/...        │
│   - test-scenarios/TS-LOGIN-003.md               │
│   - qa-tracker.json#bugs.BUG-001                 │
└──────────────────────────────────────────────────┘

❓ Confirm export? (y/n หรือ "all" สำหรับ confirm ทุก bugs ในรอบนี้)
```

**ถ้า user ตอบ y / all:**
- Append feature → features[]
- Update bug.exported_to
- Update epics[] (เพิ่ม bug-fix epic ถ้ายังไม่มี)
- Update summary

**ถ้า dry-run:**
- แสดง preview ไม่บันทึก

---

### Step 5: Ensure "bug-fix" Epic Exists

**ตรวจ feature_list.epics[]:**

```
ถ้าไม่มี epic id="bug-fix":
  เพิ่ม:
  {
    "id": "bug-fix",
    "name": "Bug Fixes",
    "description": "Bugs ที่พบจาก QA UI test และต้องแก้ไข",
    "bounded_context": "QA",
    "features": [],
    "progress": { "total": 0, "passed": 0, "in_progress": 0 }
  }

หลังเพิ่ม feature:
  epic.features.push(new_feature_id)
  epic.progress.total++
```

---

### Step 6: Update qa-tracker.json

```json
// bug.exported_to:
{
  "target": "long-running",
  "feature_id": 45,
  "subtask_id": null,
  "issue_url": null,
  "exported_at": "TIMESTAMP",
  "export_mode": "new-feature"
}

// bug.status: "triaged" → "exported"
// bug.history: append { action: "exported", to_status: "exported", details: "→ feature_list.json#45" }

// bug_summary recalculate:
//   by_status.exported++
//   exported_bugs++
```

---

### Step 7: Update feature_list.json summary

```json
{
  "summary": {
    "total": "+1",
    "pending": "+1",
    "last_updated": "TIMESTAMP",
    "model_workload": {
      "<assigned_model>": { "assigned": "+1" }
    }
  }
}
```

---

### Step 8: Update Progress Logs

**.agent/qa-progress.md:**
```markdown
## QA Session N - BUG EXPORT
**Date**: TIMESTAMP

### Exported Bugs (X):
- BUG-001 → feature_list.json#45 (new feature, opus, complex)
- BUG-004 → feature_list.json#46 (new feature, sonnet, medium)

### Skipped:
- BUG-005 (type=test-issue)
- BUG-008 (already exported)

### Next:
- /continue (long-running) → developer หยิบ feature #45 ไป fix
- /qa-bug-verify BUG-001 → ยืนยันหลัง dev fix
```

**.agent/progress.md (long-running):**
```markdown
### Bug-fix Features Imported (X):
- Feature #45: BUG-001 LOGIN validation (critical)
- Feature #46: BUG-004 AUTH cookie (high)

Source: qa-tracker.json (qa-ui-test plugin)
```

---

### Step 9: Commit

```bash
git add qa-tracker.json feature_list.json .agent/
git commit -m "qa-export: X bugs → long-running features (BUG-001..BUG-00X)"
```

---

## Output

```
🚀 QA Bug Export Complete!

📊 Export Summary:
┌─────────────────────────────────────────────────────┐
│  Selected: N | ✅ Exported: X | ⏭️ Skipped: Y       │
└─────────────────────────────────────────────────────┘

✅ Exported to long-running:
├── BUG-001 → feature_list.json#45
│   [BUG-FIX] LOGIN — Validation error not shown
│   Priority: high | Complexity: complex | Model: opus
│   Subtasks: 5 | Est: 60min
│
└── BUG-004 → feature_list.json#46
    [BUG-FIX] AUTH — Session cookie expires too early
    Priority: high | Complexity: medium | Model: opus
    Subtasks: 5 | Est: 45min

⏭️ Skipped:
├── BUG-005 (test-issue) — แก้ที่ QA team
│   → /qa-edit-scenario TS-PROFILE-005
└── BUG-008 (already exported to #42)
    → ใช้ --force หาก ต้องการ export ซ้ำ

📊 Long-running status:
   Total features: 12 → 14
   Bug-fix epic: 0 → 2 features
   Workload: opus +2

🔜 Next:
   /continue (long-running)            — dev เริ่ม fix feature #45
   /qa-bug-list --status exported       — ดู bugs ที่รอ fix
   /qa-bug-verify BUG-001               — ยืนยันหลัง dev แจ้ง fix แล้ว
   /qa-status --bugs                    — ภาพรวม bugs

💡 Developer workflow:
   1. cd <project>
   2. /continue                         — long-running หยิบ feature #45
   3. ทำ subtask 45.1 → 45.5 ตาม plan
   4. รัน /qa-bug-verify BUG-001        — ยืนยัน fix ผ่าน
   5. Bug ปิดอัตโนมัติ + feature.passes=true
```

> This command responds in Thai (ภาษาไทย)
