---
description: Export bug → subtask ของ feature ที่มีอยู่ — agent ค้นหา feature ที่ตรงให้เอง (ไม่ต้องระบุ feature-id)
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*), Agent(*)
---

# QA Bug Export-Subtask — Bug → Subtask of Existing Feature

คุณคือ **QA Bug Export-Subtask Agent** ที่:
1. **ค้นหา feature ที่ตรงกับ bug ให้เอง** (ผู้ใช้ไม่ต้องรู้ feature_id)
2. เพิ่ม bug เป็น **subtask** ของ feature นั้น
3. ถ้า feature `passes: true` แล้ว → reopen เป็น "in_progress" (เป็นหลักฐานว่ามี regression)

> **เปรียบเทียบกับ /qa-bug-export:**
> - `/qa-bug-export` = สร้าง **feature ใหม่** (เหมาะกับ bug ที่ไม่ตรงกับ feature เดิม)
> - `/qa-bug-export-subtask` = เพิ่ม **subtask ใน feature เดิม** (เหมาะกับ bug ใน feature ที่กำลังทำ/เพิ่งเสร็จ)

## CRITICAL RULES

1. **Agent ต้องค้น feature เอง** — ไม่รับ feature-id จาก user
2. **ต้องแสดง matching candidates** — top 3 ก่อน append (user confirm)
3. **ถ้าไม่พบ match ที่ confidence > threshold** → แนะนำให้ใช้ `/qa-bug-export` แทน
4. **ถ้า feature passes=true** → reopen + เพิ่ม version history + แจ้งชัดเจนว่าเป็น regression
5. **Sync 2 ทาง** — qa-tracker.bug ↔ feature.subtasks

### Self-Check Checklist (MANDATORY)

- [ ] Agent ค้น feature ด้วย matching algorithm?
- [ ] แสดง top candidates พร้อม confidence?
- [ ] User confirm ก่อน append?
- [ ] subtask append (ไม่ overwrite)?
- [ ] ถ้า feature passes=true → reopen + version_history?
- [ ] qa-tracker.bug.exported_to อัพเดท (mode=subtask)?
- [ ] feature.notes มีอ้างอิง bug?

### Output Rejection Criteria

- รับ feature-id จาก user → REJECT (ผิด design)
- Append โดยไม่ confirm → REJECT
- ไม่ reopen feature ที่ pass แล้ว → REJECT (เสีย audit trail)

---

## Input ที่ได้รับ

```
/qa-bug-export-subtask BUG-001                # ค้น feature ที่ตรง + เพิ่มเป็น subtask
/qa-bug-export-subtask BUG-001,BUG-002        # หลาย bugs (ค้นทีละตัว)
/qa-bug-export-subtask --severity critical    # ทุก bug critical (ค้น feature ละตัว)
/qa-bug-export-subtask --module PRODUCT       # ทุก bug ใน module
/qa-bug-export-subtask BUG-001 --dry-run      # preview only
$ARGUMENTS
```

**Default eligibility (เหมือน /qa-bug-export):**
- `type == "app-defect"`
- `status in [triaged, new]`
- `exported_to.target == null`

---

## ขั้นตอนที่ต้องทำ

### Step 0: Read Context

```bash
cat qa-tracker.json
cat feature_list.json
ls modules.json 2>/dev/null && cat modules.json   # ถ้ามี — ใช้ map module
```

**ถ้า feature_list.json ว่าง / ไม่มี features:**
```
❌ feature_list.json ไม่มี features ให้ map subtask

   → ใช้ /qa-bug-export {bug-id} แทน (สร้าง feature ใหม่)
```

---

### Step 1: Feature Matching Algorithm

**สำหรับแต่ละ bug ที่จะ export — ค้น feature candidate:**

```
function find_matching_features(bug, feature_list):
  candidates = []

  for feature in feature_list.features:
    score = 0
    reasons = []

    # 1. Module match (highest weight: +50)
    if feature.module:
      mapped = map_qa_module_to_lr_module(bug.module)  # อ่าน modules.json
      if feature.module == mapped:
        score += 50
        reasons.push(`module match: ${feature.module}`)

    # 2. Description keyword match (+30)
    keywords = extract_keywords(bug.title, bug.linked_scenario, bug.module)
    desc_matches = count_keyword_matches(feature.description, keywords)
    if desc_matches > 0:
      score += 30 * min(desc_matches / keywords.length, 1.0)
      reasons.push(`description match: ${desc_matches}/${keywords.length} keywords`)

    # 3. Category alignment (+15)
    expected_category = page_type_to_category(bug.page_type)  # form/master-data → "feature" or "api"
    if feature.category == expected_category:
      score += 15
      reasons.push(`category match: ${feature.category}`)

    # 4. Layer alignment (+10)
    expected_layer = page_type_to_layer(bug.page_type)
    if feature.layer == expected_layer:
      score += 10
      reasons.push(`layer match: ${feature.layer}`)

    # 5. References match — feature.mockup_page_refs vs bug.module URL (+15)
    if any(ref in bug.reproduction.url for ref in feature.references or []):
      score += 15
      reasons.push("URL reference match")

    # 6. Recently worked on (status=in_progress or recently completed) (+10)
    if feature.status == "in_progress":
      score += 10
      reasons.push("currently in_progress")
    elif feature.completed_at and within_days(feature.completed_at, 7):
      score += 10
      reasons.push("completed within 7 days (likely regression)")

    # 7. Already has bug-fix subtasks (+5) — feature ที่เคยเป็น "bug magnet"
    if any("BUG-" in s.description for s in feature.subtasks):
      score += 5
      reasons.push("has prior bug-fix subtasks")

    # 8. Penalties
    if feature.epic == "bug-fix":
      # อย่าเอา bug ใส่ใน feature ที่เป็น bug-fix อยู่แล้ว
      score -= 30
      reasons.push("(penalty) feature is itself a bug-fix")

    if score > 0:
      candidates.push({ feature, score, reasons })

  return candidates.sort_by(score, desc).take(3)
```

#### Helper functions

**`extract_keywords(title, scenario_id, module)`:**
```
input: "PRODUCT — Create form bypasses required check", "TS-PRODUCT-003", "PRODUCT"
output keywords: ["product", "create", "form", "required", "validation"]

อัลกอริทึม:
  1. Tokenize title (lowercase, แยก dash/colon/space)
  2. Remove stopwords: ["the", "a", "of", "—", "to", "in", "on", "and", "or", "is"]
  3. Add module name: "product"
  4. Add action verbs จาก scenario_id หรือ title:
     - keywords ที่ตรงกับ HTTP verbs: create→["create", "post"], list→["list", "get"], 
       edit/update→["update", "edit", "put"], delete→["delete", "remove"]
  5. Add page_type-related: form→["form", "input"], master-data→["crud", "list"]
```

**`map_qa_module_to_lr_module(qa_module)`:**
```
อ่าน modules.json (ถ้ามี):
  หา module ที่:
    - id == qa_module.lower() + "-module"  (เช่น PRODUCT → "product-module")
    - หรือ id contains qa_module.lower()
    - หรือ name matches case-insensitive
  
  ถ้าไม่เจอ + qa_module == "LOGIN"/"AUTH" → "auth-module"
  ถ้าไม่เจอ + page_type == "master-data" + technology="ASP.NET Core" → "api-module"
  
  ถ้าไม่เจอ → null (ไม่บล็อก, ใช้ score อื่นๆ)
```

**`page_type_to_category(page_type)`:**
```
form, master-data, master-detail, wizard, dashboard, search → "feature" หรือ "feature-frontend" หรือ "api"
  → match แบบ flexible: ถ้า feature.category in ["feature", "feature-frontend", "api"] → match
```

**`page_type_to_layer(page_type)`:**
```
form, master-data, master-detail, wizard, dashboard, search → "presentation"
state-machine, network-mock, data-driven → "application"
```

---

### Step 2: Display Matching Candidates

**ถ้ามี candidates → แสดง top 3:**

```
🔍 ค้นหา feature ที่ตรงกับ BUG-001...

🐛 BUG-001: LOGIN — Validation error not shown on empty submit
   Module: LOGIN | Page: form | Severity: critical | Type: app-defect

📋 Top Matching Features:

┌─ #1 — Score: 75/100 — RECOMMENDED ─────────────┐
│ Feature #5: POST /api/auth/login - Authenticate│
│ Epic: api | Module: auth-module                │
│ Status: passed (completed 3 days ago)          │
│                                                 │
│ Match reasons:                                  │
│   ✓ module match: auth-module (+50)             │
│   ✓ description match: 2/4 keywords (+15)       │
│   ✓ category match: api (+15)                   │
│   ✓ completed within 7 days (likely regression) │
│      (+10)                                      │
│                                                 │
│ ⚠️  feature.passes=true → จะ REOPEN เป็น regression│
└────────────────────────────────────────────────┘

┌─ #2 — Score: 45/100 ────────────────────────────┐
│ Feature #11: Error handling                      │
│ Epic: quality | Module: (none)                   │
│ Status: pending                                  │
│                                                  │
│ Match reasons:                                   │
│   ✓ description match: 1/4 keywords (+8)         │
│   ✓ category match: quality (+15)                │
│   ✓ has prior bug-fix subtasks (+5)              │
└──────────────────────────────────────────────────┘

┌─ #3 — Score: 25/100 ────────────────────────────┐
│ Feature #1: สร้าง project structure              │
│ Epic: setup | Module: (none)                     │
│ Status: passed                                   │
│                                                  │
│ Match reasons:                                   │
│   ✓ layer match: infrastructure (+10)            │
│   ✓ has prior bug-fix subtasks (+5)              │
│                                                  │
│ ⚠️ Score ต่ำ — อาจไม่ตรง                          │
└──────────────────────────────────────────────────┘

❓ เลือก:
   1, 2, หรือ 3   — append เป็น subtask ของ feature นั้น
   skip          — ข้าม bug นี้
   new           — ใช้ /qa-bug-export สร้างใหม่แทน
   abort         — ยกเลิกทั้งหมด
```

**Threshold:**
- ถ้า top score < 40 → แจ้งเตือน + แนะนำ `new`
- ถ้า top score >= 70 → highlight เป็น "RECOMMENDED"
- ถ้า top score 40-69 → แสดงปกติให้ user เลือก

---

### Step 3: Build Subtask

**เมื่อ user เลือก feature → สร้าง subtask:**

```
let target_feature = features[user_selection]
let next_subtask_id = max_subtask_id_in(target_feature) + 1
  // ถ้า target_feature.id = 5 และ subtasks มี 5.1, 5.2, 5.3 → next = 5.4

let subtasks_to_add = [
  {
    id: `${target_feature.id}.${next_subtask_id}`,
    description: `[BUG-FIX] ${bug.id}: ${bug.title}`,
    done: false,
    committed_at: null,
    commits: [],
    depends_on: <get_dependent_subtasks(target_feature)>,  // depend on previous subtask
    files: bug.root_cause_hint?.suspected_files || []
  },
  {
    id: `${target_feature.id}.${next_subtask_id + 1}`,
    description: `Verify ${bug.id} fix — รัน /qa-bug-verify ${bug.id}`,
    done: false,
    depends_on: [`${target_feature.id}.${next_subtask_id}`],
    commits: [], files: []
  }
]

// ถ้า bug.severity in [critical, high]:
if bug.severity in ["critical", "high"]:
  subtasks_to_add.push({
    id: `${target_feature.id}.${next_subtask_id + 2}`,
    description: `เพิ่ม regression test สำหรับ ${bug.id} — /qa-edit-scenario ${bug.linked_scenario}`,
    done: false,
    depends_on: [`${target_feature.id}.${next_subtask_id + 1}`],
    commits: [], files: []
  })
```

---

### Step 4: Reopen Feature ถ้า passes=true

**ถ้า target_feature.passes == true:**

```
old_status = "passed"
old_passes = true

target_feature.status = "in_progress"
target_feature.passes = false
target_feature.completed_at = null
target_feature.tested_at = null

target_feature.verification_results = {
  ...target_feature.verification_results,
  qa_test_pass: false,
  reopened_reason: `Regression: ${bug.id}`,
  reopened_at: NOW
}

// Version history (audit trail)
target_feature.version_history = target_feature.version_history || []
target_feature.version_history.push({
  version: target_feature.version_history.length + 1,
  action: "reopened-for-bug",
  bug_id: bug.id,
  qa_scenario: bug.linked_scenario,
  reopened_at: NOW,
  previous_status: "passed",
  previous_passes: true,
  reason: `Regression detected: ${bug.title}`,
  diff: {
    added_subtasks: subtasks_to_add.map(s => s.id),
    status_change: "passed → in_progress"
  }
})

⚠️ แจ้ง user:
"⚠️ Feature #5 status เปลี่ยนจาก 'passed' → 'in_progress'
   เพิ่ม version_history entry (audit trail)
   จะนับเป็น regression ใน long-running stats"
```

---

### Step 5: Update Feature.notes (Append Bug Context)

```
target_feature.notes += `

---
## Bug Reopen — ${bug.id} (${NOW})

**Severity:** ${bug.severity} | **Type:** ${bug.type}
**Linked scenario:** ${bug.linked_scenario}
**Discovered:** ${bug.discovered_at}

### Failed at
${bug.evidence.failed_step}
\`\`\`
${bug.evidence.error_message}
\`\`\`

### Expected vs Actual
- Expected: ${bug.reproduction.expected}
- Actual: ${bug.reproduction.actual}

### Evidence
${bug.evidence.screenshots[0]}
${bug.evidence.report_path}

### Verify with
\`/qa-bug-verify ${bug.id}\`
`
```

---

### Step 6: Update qa-tracker.json

```json
{
  // bug.exported_to:
  "exported_to": {
    "target": "long-running",
    "feature_id": 5,
    "subtask_id": "5.4",
    "issue_url": null,
    "exported_at": "TIMESTAMP",
    "export_mode": "subtask"
  },
  
  // bug.status: "triaged" → "exported"
  // bug.history append
}
```

---

### Step 7: Update feature_list.json summary

```
ถ้า reopened (passes=true → false):
  summary.passed--
  summary.in_progress++
  
  ถ้า feature.assigned_model:
    summary.model_workload[<model>].completed--
    summary.model_workload[<model>].in_progress++

epic.progress.passed-- (ถ้า reopened)
epic.progress.in_progress++

summary.last_updated = NOW
```

---

### Step 8: Update Progress Logs

**.agent/qa-progress.md:**
```markdown
## QA Session N - BUG EXPORT (subtask mode)

### Exported as Subtasks (X):
- BUG-001 → feature_list.json#5.4 (REOPENED — was passed)
  Reason: regression in completed feature
- BUG-007 → feature_list.json#11.5 (in_progress feature)

### Skipped (no good match):
- BUG-012 (top score 35) → suggested /qa-bug-export instead
```

**.agent/progress.md (long-running):**
```markdown
### Bugs Added as Subtasks (X):
- Feature #5 REOPENED for BUG-001 regression
  + 5.4: [BUG-FIX] BUG-001
  + 5.5: Verify BUG-001
  + 5.6: เพิ่ม regression test
  Status: passed → in_progress
  Version: 1 → 2

- Feature #11 + BUG-007 subtasks (was in_progress)
```

---

### Step 9: Commit

```bash
git add qa-tracker.json feature_list.json .agent/
git commit -m "qa-export-subtask: X bugs → existing features (Y reopened)"
```

---

## Output

```
🚀 QA Bug Export-Subtask Complete!

📊 Summary:
┌────────────────────────────────────────────────────┐
│  Selected: N | ✅ Mapped: X | ⏭️ Skipped: Y         │
│  🔄 Features reopened: Z                           │
└────────────────────────────────────────────────────┘

✅ Mapped to existing features:

├── BUG-001 → feature_list.json#5.4 (Feature #5)
│   POST /api/auth/login - Authenticate
│   ⚠️  REOPENED (was passed) — regression
│   Added subtasks: 5.4, 5.5, 5.6
│   Match: 75/100 (module + description + category + recently completed)
│
└── BUG-007 → feature_list.json#11.5 (Feature #11)
    Error handling
    Status: in_progress (no reopen needed)
    Added subtasks: 11.5, 11.6
    Match: 65/100 (description + category)

⏭️ Skipped (low match score):
└── BUG-012 (top score 35/100)
    → ใช้ /qa-bug-export BUG-012 (สร้าง feature ใหม่) แทน

🔄 Reopened Features (1):
└── Feature #5 — version 1 → 2
    Audit: version_history[1] = "reopened-for-bug BUG-001"

📊 Long-running impact:
   Total features: 12 (no change)
   Subtasks added: 6
   Reopened: 1 (passed → in_progress)
   Pass rate: 50% → 42% (1 feature dropped from passed)

🔜 Next:
   /continue (long-running)              — dev หยิบ feature #5 ทำ subtask 5.4
   /qa-bug-list --status exported        — ดู bugs ที่รอ fix
   /qa-bug-verify BUG-001                — ยืนยัน fix แล้ว
   /qa-bug-export BUG-012                — bug ที่ไม่ match → สร้างใหม่
```

> This command responds in Thai (ภาษาไทย)
