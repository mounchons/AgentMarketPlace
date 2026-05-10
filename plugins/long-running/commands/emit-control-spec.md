---
description: สแกน UI files ของ feature → emit/update .agent/ui-controls/feature-<id>.json (manifest ส่งต่อ binding/permission/validation ให้ qa-ui-test)
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Grep(*), Glob(*)
---

# /emit-control-spec — UI Control Manifest Emitter

สแกน source files ของ feature → ตรวจหา form controls (input, select, combobox, radio, checkbox, data-bound) → emit/update manifest ที่ `.agent/ui-controls/feature-<id>.json`

> **เมื่อไหร่ใช้?**
> - `/continue` Step 5.4 เรียก auto (ไม่ต้องรันแยก) — แต่ถ้า manifest หาย/พัง → manual rerun
> - หลัง refactor ใหญ่ที่กระทบ form ทุกครั้ง
> - ก่อน `/qa-create-scenario --from-control-spec` ถ้าไม่แน่ใจว่า manifest ทันสมัย

📖 **Schema reference**: `skills/long-running/references/ui-control-manifest.md`

---

## ⚠️ CRITICAL RULES (MUST FOLLOW)

1. **อ่าน feature_list.json + manifest เดิมก่อนเสมอ** — ห้าม overwrite blind
2. **Emit เฉพาะ feature เดียวต่อ run** — ไม่ batch หลาย feature (ตรงกับ `/continue` 1-feature rule)
3. **Cross-validate กับ mockup ทุกครั้ง** ที่ `mockup_refs[]` ไม่ว่าง
4. **Detection ต้องระบุ confidence** — control ที่ confidence=low ต้อง flag `needs_review: true`
5. **ห้ามลบ controls ที่ acknowledged แล้ว** (`acknowledged_findings`) จาก drift_check

### 🔍 Self-Check Checklist (MANDATORY)

- [ ] อ่าน feature_list.json → confirm feature_id valid?
- [ ] อ่าน manifest เดิม (ถ้ามี) → preserve `acknowledged_findings` + `unit_test_status`?
- [ ] List ไฟล์ UI ทั้งหมดใน `subtasks[].files[]` ของ feature?
- [ ] Detect controls ทุกประเภท (input, select, combobox, radio, checkbox, multi-select, file, ...)?
- [ ] ตรวจ binding source (state vs api vs derived vs static)?
- [ ] ตรวจ validation (zod/yup/joi/HTML attrs/manual)?
- [ ] ตรวจ permission (role checks, useAuth, feature flags)?
- [ ] Cross-validate กับ mockup → drift_findings สรุป?
- [ ] อัพเดต `_index.json`?
- [ ] รายงานสรุป controls + drift ให้ user?

ถ้าข้อใด unchecked → DO NOT submit

### ❌ Output Rejection Criteria

- Overwrite manifest โดยไม่ preserve `acknowledged_findings`
- Skip cross-validation ทั้งที่ mockup_refs ไม่ว่าง
- Detect แค่ `<input>` HTML — ไม่ตรวจ Combobox/Select component (third-party)
- ไม่ระบุ confidence ของแต่ละ control
- Mark control เป็น `binding.source: api` โดยไม่หา endpoint จริงใน code

---

## Usage

```
/emit-control-spec <feature-id>                # default: full re-emit
/emit-control-spec <feature-id> --merge        # preserve manual edits, only add new controls
/emit-control-spec <feature-id> --dry-run      # show what would change, no write
/emit-control-spec <feature-id> --skip-drift   # don't cross-validate with mockup
/emit-control-spec --all-pending               # emit for all features status=in_progress without manifest
```

---

## Process

### Step 1: Read Context

```bash
# 1. Verify feature_list.json
test -f feature_list.json || { echo "❌ ไม่พบ feature_list.json — รัน /init ก่อน"; exit 1; }

# 2. Read feature
FEATURE_ID="$1"
cat feature_list.json | jq ".features[] | select(.id == $FEATURE_ID)"

# 3. Read existing manifest (if any)
MANIFEST=".agent/ui-controls/feature-$FEATURE_ID.json"
test -f "$MANIFEST" && cat "$MANIFEST" || echo "(no existing manifest)"

# 4. Read mockup refs
cat feature_list.json | jq ".features[] | select(.id == $FEATURE_ID) | .references[]"

# 5. List subtask files (UI candidates)
cat feature_list.json | jq -r ".features[] | select(.id == $FEATURE_ID) | .subtasks[].files[]?"
```

**ถ้าไม่มี feature → error**:
```
❌ Feature #<id> not found in feature_list.json
```

---

### Step 2: Filter UI files

จาก `subtasks[].files[]` — เก็บเฉพาะที่น่าจะมี UI control:

**Extension whitelist:**
- `.tsx`, `.jsx`, `.ts`, `.js` (React, Next.js, Vue with TS)
- `.vue` (Vue SFC)
- `.svelte`
- `.razor`, `.cshtml` (.NET Blazor / MVC)
- `.html` (raw HTML)

**Skip:**
- `.css`, `.scss`, `.module.css`
- `.test.tsx`, `.spec.ts`
- `.d.ts`, `.types.ts`
- `__tests__/`, `__mocks__/`

```bash
# Use Glob/Grep to filter
```

ถ้าไม่มีไฟล์ UI เลย → **skip emit + แจ้ง user**:
```
ℹ️  Feature #N has no UI files (only backend/config) — skipping manifest emit
```

---

### Step 3: Detect Controls (per file)

สำหรับแต่ละ UI file → parse และตรวจหา:

#### 3.1 HTML/JSX form elements

| Pattern | type |
|---|---|
| `<input type="text">` | input/text |
| `<input type="email">` | input/email |
| `<input type="password">` | input/password |
| `<input type="number">` | input/number |
| `<input type="checkbox">` | checkbox |
| `<input type="radio">` | radio |
| `<input type="file">` | file |
| `<input type="date">` | date |
| `<textarea>` | textarea |
| `<select>` | select |

#### 3.2 Component library patterns (third-party)

```
React/Next.js:
- @headlessui/react: Combobox, Listbox, RadioGroup, Switch
- @radix-ui/react-*: Select, RadioGroup, Switch, Checkbox
- @mui/material: Autocomplete, Select, RadioGroup, Switch, Checkbox, TextField
- antd: Select, AutoComplete, Radio, Checkbox, Input, DatePicker
- react-hook-form: Controller (need to inspect render prop)
- chakra-ui: Select, Input, Radio, Checkbox

Vue:
- vuetify: VSelect, VCombobox, VTextField, VRadio, VCheckbox
- element-plus: el-select, el-input, el-radio, el-checkbox

Blazor:
- InputText, InputSelect, InputRadio, InputCheckbox (built-in)
- MudBlazor: MudTextField, MudSelect, MudRadioGroup
```

**Detection strategy:**
1. Grep import statements → identify library
2. Match component names per library
3. Inspect props (`name`, `id`, `data-testid`, `value`, `onChange`)

#### 3.3 Identifier extraction

ดึง `id` ของ control โดย precedence:

```
1. data-testid attribute               (best — qa-ui-test ใช้แน่)
2. id attribute
3. name attribute (form field name)
4. variable name from useState/useForm
5. fallback: kebab-case ของ label text + position
```

ถ้า fallback → mark `needs_review: true`

---

### Step 4: Detect Binding Source

```
For each control:

1. Check options/value origin:
   a) hardcoded array → source: static
   b) prop drilled from parent state → source: state
   c) useQuery/useFetch/swr/axios → source: api
      → extract endpoint from queryFn/url
   d) useMemo/computed → source: derived
      → record formula

2. Detect 2-way binding:
   - onChange + value → two_way: true
   - readOnly/disabled prop → two_way: false

3. Detect initial load:
   - useEffect(() => fetchProduct(id), []) → initial_load_endpoint
   - <Form defaultValues={data}> → from prop

4. For api source — extract endpoint:
   - axios.get('/api/...')
   - useQuery({ queryKey: [...], queryFn: () => fetch('/api/...') })
   - swr('/api/...')
   - Apollo: gql query → extract operationName

5. For api with cascade:
   - querystring/path interpolation: /api/suppliers?categoryId=${category}
   → record depends_on: <other-control-id>
```

---

### Step 5: Detect Validation

```
Look for:

1. Schema-based:
   - zod: z.object({ name: z.string().min(2).max(100) })
   - yup: yup.object({ name: yup.string().required() })
   - joi: Joi.object({ ... })
   → extract per-field rules

2. react-hook-form rules:
   - register('name', { required: true, maxLength: 100 })
   - <Controller rules={{...}}>

3. HTML5 attributes:
   - required, minLength, maxLength, pattern, min, max

4. Manual checks (in onSubmit/onBlur):
   - if (!value) setError(...)
   → record as custom_rule_ref

5. Server-side hint:
   - if endpoint has DTO with [Required]/[StringLength] (.NET)
   - if Joi/Zod also applied on backend route
   → server_side: true
```

---

### Step 6: Detect Permission

```
Look for:

1. Role-based render guard:
   - {user.role === 'admin' && <Component />}
   - <RoleGuard roles={['admin']}>
   → visible_to_roles

2. useAuth/useUser hooks:
   - const { user, hasPermission } = useAuth()
   - hasPermission('edit:products') → record check

3. Conditional disable/hide:
   - <Combobox disabled={!isAdmin} />
   - if (role !== 'admin') return null

4. Data scope (in API call):
   - axios.get('/api/categories', { params: { tenantId: user.tenantId }})
   → data_scope: "tenant_id == user.tenant_id"

5. Feature flags:
   - useFeature('new-product-form')
   → record as feature_flag (not permission per se)
```

> **กรณี implicit permission** (ไม่มี role check ใน component): ถือเป็น `permission: null` (= ทุก authenticated user)
> ถ้า code ไม่มี auth check ทั้งระบบ → ใช้ component อยู่ใน guarded route → record `permission: { inherited_from: "<route guard>" }`

---

### Step 7: Cross-validate กับ mockup (Hybrid B)

ถ้า `mockup_refs[]` ไม่ว่าง → อ่าน mockup และ compare:

```bash
for MOCKUP in $(jq -r '.mockup_refs[]' "$MANIFEST"); do
  test -f "$MOCKUP" && cat "$MOCKUP"
done
```

**Compare rules** (ดู `references/ui-control-manifest.md` Section 4):

| Check | Drift Type | Severity |
|---|---|---|
| Mockup มี control id ที่ code ไม่มี | missing-implementation | error |
| Code มี control id ที่ mockup ไม่มี | undocumented-control | warn |
| `type` ต่าง | type-mismatch | error |
| `permission.visible_to_roles` แคบกว่า | permission-narrower | warn |
| `permission.visible_to_roles` กว้างกว่า | permission-wider | **error** |
| `binding.source` ต่าง | binding-source-mismatch | warn |

เก็บ findings ใน `drift_check.drift_findings[]`

---

### Step 8: Merge กับ manifest เดิม (ถ้ามี)

```
For each detected control:
  IF control_id อยู่ใน manifest เดิม:
    - Preserve unit_test_status[<id>] (อย่า reset)
    - Preserve any manual override fields (look for "_manual": true)
  ELSE:
    - Add as new control with unit_test_status = { binding_test: false, validation_test: false }

For each control_id ใน manifest เดิมที่ไม่ detect แล้ว:
  - Mark as "removed: true" + log removal_reason
  - Don't delete entirely — keep for audit (1 cycle)
```

**`--merge` mode:** ใช้ manifest เดิมเป็น base, เพิ่มเฉพาะ control ใหม่
**default (full re-emit):** rewrite ทั้งไฟล์ (preserve เฉพาะ unit_test_status + acknowledged_findings)

---

### Step 9: Update `_index.json`

```json
{
  "schema_version": "1.0.0",
  "features": {
    "7": {
      "manifest_path": ".agent/ui-controls/feature-7.json",
      "pages": ["product-edit"],
      "control_count": 5,
      "last_emitted_at": "2026-05-10T..."
    }
  }
}
```

---

### Step 10: Write & Report

**`--dry-run`:** show diff summary, no write

```
🔍 Manifest Diff for Feature #7
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Page: product-edit (src/features/products/ProductEditPage.tsx)

🆕 New controls (3):
   + product-name-input  [input/text]
       binding: state(product.name) two_way
       validation: required, max:100
   + category-combo      [combobox]
       binding: api(GET /api/categories)
       permission: visible_to_roles=[admin, manager]
   + supplier-select     [select]
       binding: api(GET /api/suppliers?categoryId=...)
       depends_on: category-combo

🔄 Updated (1):
   ~ product-active-radio
       validation: required (was: optional)

🗑️  Removed (0): —

⚠️  Drift findings (1):
   [warn] category-combo: permission-narrower
       mockup_says: [admin, manager, user]
       code_says:   [admin, manager]

🟢 Confidence: high (5), medium (0), low (0)

Apply changes? [y/N]
```

**Apply:** write file + update `_index.json` + report path

```
✅ Manifest updated: .agent/ui-controls/feature-7.json
   5 controls (5 high confidence)
   1 drift warning (review with /sync-mockups or /edit-mockup)

📋 Next steps:
   1. Run /qa-ui-test:qa-create-scenario --from-control-spec 7
      → จะสร้าง E2E scenarios 5 หมวด (~15-25 cases)
   2. Run /qa-ui-test:qa-coverage-check
      → verify ทุก control_id มี scenario
```

---

### Step 11: Update progress log

```markdown
---

## Session N — EMIT CONTROL SPEC
**Date**: TIMESTAMP
**Feature**: #7 (Product Edit form)

### Manifest:
- Path: .agent/ui-controls/feature-7.json
- Controls: 5 (3 new, 1 updated, 0 removed)
- Drift: 1 warn (permission-narrower on category-combo)

### Confidence:
- High: 5 / Medium: 0 / Low: 0

### Next:
- Run /qa-ui-test:qa-create-scenario --from-control-spec 7

---
```

---

## Output Format

```markdown
# 🎛️ UI Control Manifest — Feature #N

## Page: <page-id>
File: <component_path>

| ID | Type | Binding | Validation | Permission | Confidence |
|---|---|---|---|---|---|
| product-name-input | input/text | state | required, max:100 | — | high |
| category-combo | combobox | api(GET /api/categories) | required | admin,manager | high |
| ... | | | | | |

## Drift Summary
- 0 errors / 1 warning / 0 acknowledged

## Manifest Path
`.agent/ui-controls/feature-7.json`

## Next
- /qa-ui-test:qa-create-scenario --from-control-spec 7
```

---

## When to Use vs `/continue` Auto-emit

| Scenario | Use which? |
|---|---|
| ปกติทำงาน flow `/continue` | `/continue` auto-runs Step 5.4 → ไม่ต้องเรียกแยก |
| Manifest หาย/พัง | `/emit-control-spec <id>` |
| Manual refactor ที่กระทบหลาย feature | `/emit-control-spec --all-pending` |
| ต้องการ preview diff ก่อน apply | `/emit-control-spec <id> --dry-run` |
| Mockup เปลี่ยน อยากเช็ค drift ใหม่ | `/emit-control-spec <id>` (auto cross-validate) |

---

## Important Rules

❌ **Forbidden:**
- Emit สำหรับ feature ที่ status="passed" (แล้วเสร็จ — ไม่ retroactive)
- Auto-mark ทุก control ว่า `permission: null` โดยไม่ตรวจ code
- Skip cross-validation ทั้งที่มี mockup_refs

✅ **Must do:**
- Confidence rating ทุก control
- Drift findings เป็น actionable (มี mockup_says vs code_says)
- Preserve manual override fields ตอน re-emit
- รายงานสรุปก่อน write (interactive แม้ไม่ใช่ --dry-run)

> 💬 **หมายเหตุ**: คำสั่งนี้จะตอบกลับเป็นภาษาไทย (ศัพท์เทคนิคใช้ภาษาอังกฤษ)
