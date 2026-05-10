# UI Control Manifest — Schema & Lifecycle

> **Purpose**: Pin "dev intent" ของ form controls (input/select/combobox/radio/checkbox/data-bound) ที่ถูกเพิ่ม/แก้ไขใน UI ลงไฟล์ JSON เพื่อให้ qa-ui-test ใช้สร้าง scenarios ได้ครอบคลุม binding / permission / validation โดยไม่ต้องเดาจาก code

> **Hybrid A+B**: Manifest เป็น primary source of truth. ถ้า `.mockups/<page>.mockup.md` ระบุ control attributes → cross-validate และเตือน drift

---

## 1. File Location

```
.agent/ui-controls/
  ├── feature-7.json          # per feature
  ├── feature-12.json
  ├── feature-15.json
  └── _index.json             # auto-managed: featureId ↔ pages map
```

**Naming**: `feature-<id>.json` (1 manifest = 1 feature)

**Why per-feature?** ตรงกับ schema ของ `/continue` (1 feature/session) และ traceability score คำนวณตาม feature → จัด scope ตรงกัน

> หาก feature เดียวกระทบหลายหน้า → 1 manifest มี `pages[]` หลาย entry ได้

---

## 2. Schema — `feature-<id>.json`

```json
{
  "schema_version": "1.0.0",
  "feature_id": 7,
  "feature_description": "Product create/edit form",
  "emitted_at": "2026-05-10T14:30:00Z",
  "emitted_by": "long-running:/continue Step 5.4",
  "last_updated_at": "2026-05-10T14:30:00Z",
  "mockup_refs": [
    ".mockups/030-product-edit.mockup.md"
  ],
  "pages": [
    {
      "page_id": "product-edit",
      "url_pattern": "/admin/products/edit/:id",
      "component_path": "src/features/products/ProductEditPage.tsx",
      "controls": [
        {
          "id": "product-name-input",
          "type": "input",
          "subtype": "text",
          "selector": "[data-testid='product-name']",
          "label": "Product Name",
          "binding": {
            "source": "state",
            "field": "product.name",
            "two_way": true,
            "initial_load_endpoint": "GET /api/products/:id"
          },
          "validation": {
            "required": true,
            "max_length": 100,
            "min_length": 2,
            "pattern": null,
            "server_side": true,
            "client_side": true
          },
          "permission": null,
          "depends_on": null
        },
        {
          "id": "category-combo",
          "type": "combobox",
          "subtype": "single-select",
          "selector": "[data-testid='product-category']",
          "label": "Category",
          "binding": {
            "source": "api",
            "options_endpoint": "GET /api/categories",
            "value_field": "id",
            "display_field": "name",
            "search_param": "q",
            "auth_required": true,
            "cache_strategy": "session"
          },
          "validation": {
            "required": true,
            "server_side": true
          },
          "permission": {
            "visible_to_roles": ["admin", "manager"],
            "data_scope": "tenant_id == user.tenant_id",
            "fallback_when_unauthorized": "hide"
          },
          "depends_on": null
        },
        {
          "id": "supplier-select",
          "type": "select",
          "subtype": "single-select",
          "selector": "[data-testid='product-supplier']",
          "label": "Supplier",
          "binding": {
            "source": "api",
            "options_endpoint": "GET /api/suppliers?categoryId={category-combo.value}",
            "value_field": "id",
            "display_field": "name"
          },
          "validation": { "required": false },
          "permission": null,
          "depends_on": "category-combo",
          "depends_behavior": "reset-on-parent-change"
        },
        {
          "id": "active-radio",
          "type": "radio",
          "selector": "[data-testid='product-active']",
          "label": "Active",
          "binding": {
            "source": "state",
            "field": "product.isActive",
            "two_way": true
          },
          "options": [
            { "value": "true", "label": "Active" },
            { "value": "false", "label": "Inactive" }
          ],
          "validation": { "required": true },
          "permission": null
        },
        {
          "id": "tags-checkbox-group",
          "type": "checkbox-group",
          "selector": "[data-testid='product-tags']",
          "binding": {
            "source": "api",
            "options_endpoint": "GET /api/tags",
            "value_field": "id",
            "display_field": "label",
            "value_target_field": "product.tagIds"
          },
          "validation": {
            "min_selected": 0,
            "max_selected": 5
          }
        }
      ],
      "test_directives": {
        "must_test_roles": ["admin", "manager", "user", "guest"],
        "must_test_loading": true,
        "must_test_errors": ["401", "403", "500", "network"],
        "must_test_cascade": ["category-combo → supplier-select"],
        "submit_endpoint": "POST /api/products  |  PUT /api/products/:id",
        "expected_unauthorized_behavior": "redirect /login (guest), 403 toast (user role)"
      },
      "unit_test_status": {
        "category-combo": { "binding_test": true, "validation_test": true, "test_file": "src/features/products/__tests__/CategoryCombo.test.tsx" },
        "supplier-select": { "binding_test": false, "validation_test": false, "test_file": null }
      }
    }
  ],
  "drift_check": {
    "last_run_at": "2026-05-10T14:30:00Z",
    "mockup_match": true,
    "drift_findings": []
  }
}
```

---

## 3. Field Reference

### `controls[].type` (enum)

| type | ใช้กับ |
|---|---|
| `input` | text/email/password/number/url/tel (ระบุใน subtype) |
| `textarea` | multi-line text |
| `select` | native `<select>` (single) |
| `combobox` | searchable dropdown (Headless UI, Radix, MUI Autocomplete) |
| `radio` | radio group (mutually exclusive) |
| `checkbox` | single checkbox (boolean) |
| `checkbox-group` | multi-select checkboxes |
| `toggle` | switch/toggle |
| `date` | date picker |
| `datetime` | date+time |
| `time` | time only |
| `file` | file upload |
| `slider` | range/slider |
| `multi-select` | tag/chip multi |
| `rich-text` | WYSIWYG editor |

### `controls[].binding.source` (enum)

| source | ความหมาย |
|---|---|
| `state` | bind ตรงกับ component state / form state (no API) |
| `api` | bind จาก API endpoint (options หรือ initial value) |
| `derived` | computed field (จาก control อื่น) |
| `static` | hardcoded list/options |

### `controls[].permission`

```json
{
  "visible_to_roles": ["admin", "manager"],
  "data_scope": "<filter expression>",
  "fallback_when_unauthorized": "hide" | "disable" | "redirect"
}
```

> ถ้า `permission == null` → ทุก authenticated user เห็นและใช้ได้

### `controls[].validation`

```json
{
  "required": true,
  "min_length": 2,
  "max_length": 100,
  "min": 0,
  "max": 999,
  "pattern": "^[A-Za-z0-9]+$",
  "min_selected": 1,
  "max_selected": 5,
  "client_side": true,
  "server_side": true,
  "custom_rule_ref": "ProductValidator.cs#L45"
}
```

> ระบุเฉพาะที่ใช้จริง — fields ที่ไม่ใช้ไม่ต้องใส่

### `unit_test_status`

อัพเดตโดย `/continue` Step 5.5 หลังเขียน unit test สำเร็จ — ใช้ตอน gate ตรวจ

```json
{
  "<control-id>": {
    "binding_test": true,           // มี test ตรวจว่า control bind ฟิลด์ถูก
    "validation_test": true,        // มี test ตรวจ validation rule
    "test_file": "<relative path>"
  }
}
```

---

## 4. Cross-validation กับ mockup (Hybrid B)

ถ้า `mockup_refs[]` ชี้ไปที่ `.mockups/<page>.mockup.md` ที่ **มี** structured component spec
(ตัวอย่าง pattern ของ ui-mockup plugin):

```yaml
# inside .mockups/030-product-edit.mockup.md
components:
  - id: category-combo
    type: combobox
    binding: api(/api/categories)
    permission: admin|manager
```

→ `/continue` Step 5.4.5 หรือ `/emit-control-spec` ต้อง compare:

| ตรวจ | ผล |
|---|---|
| Control `id` มีใน mockup แต่ไม่มีใน manifest | drift: missing-implementation |
| Control `id` มีใน manifest แต่ไม่มีใน mockup | drift: undocumented-control (suggest update mockup) |
| `type` ไม่ตรง | drift: type-mismatch |
| `permission.visible_to_roles` ไม่ครบตาม mockup | drift: permission-narrower / wider |
| `binding.source` ไม่ตรง | drift: binding-source-mismatch |

Drift findings เก็บใน `drift_check.drift_findings[]`:

```json
{
  "control_id": "category-combo",
  "type": "permission-narrower",
  "mockup_says": ["admin", "manager", "user"],
  "code_says": ["admin", "manager"],
  "severity": "warn"
}
```

**Severity policy:**

| drift type | severity | block /continue? |
|---|---|---|
| missing-implementation | error | ✅ block |
| type-mismatch | error | ✅ block |
| permission-narrower | warn | ❌ |
| permission-wider | error | ✅ block (security risk) |
| binding-source-mismatch | warn | ❌ (ใส่ comment ใน manifest) |
| undocumented-control | warn | ❌ (suggest /edit-mockup) |

> **Rationale**: permission ที่กว้างกว่า mockup = อาจเปิดสิทธิ์เกิน → block. permission แคบกว่า = restriction มากกว่าที่ออกแบบ → warn เฉย ๆ

---

## 5. Detection Algorithm — `/continue` Step 5.4

ระหว่าง implementation, dev จะแก้ไฟล์ใน `subtasks[].files[]`. หลัง subtask สุดท้ายเสร็จ:

```
For each .tsx/.jsx/.vue/.razor/.cshtml file in subtasks.files[]:
  1. Parse AST (or regex if AST unavailable)
  2. Detect form-control elements:
     - <input>, <select>, <textarea>, <Combobox>, <RadioGroup>, etc.
     - data-testid attributes
     - useState/useForm/Controller registrations
  3. Detect API hooks:
     - useQuery / useFetch / axios.get → endpoint
     - swr / react-query
  4. Detect validation:
     - zod/yup/joi schemas
     - HTML attributes (required, maxLength, pattern)
     - manual checks in handlers
  5. Detect permission:
     - useAuth hook results
     - role checks (user.role === ...)
     - feature flags
  6. Aggregate per control → emit ControlSpec
```

**Heuristic confidence levels:**

| Detection | Confidence |
|---|---|
| `data-testid` ตรงกับ pattern (kebab-case + descriptive) | high |
| Has explicit `name` attribute + form library | high |
| Inferred from variable name only | medium |
| No identifier — fallback to position | low (ใส่ flag `needs_review: true`) |

---

## 6. Lifecycle

```
┌──────────────────────────────────────────────────────────────┐
│  1. /continue picks Feature #N (UI feature)                 │
│       ↓                                                      │
│  2. Implements subtasks → modifies UI files                 │
│       ↓                                                      │
│  3. Step 5.4: Detect controls → emit/update                 │
│     .agent/ui-controls/feature-N.json                       │
│       ↓                                                      │
│  4. Step 5.4.5: Cross-validate with mockup (if exists)      │
│     - error drift → block, fix code/mockup                  │
│     - warn drift → log to manifest, continue                │
│       ↓                                                      │
│  5. Step 5.5: For each control → require unit test          │
│     - update unit_test_status[<id>]                         │
│     - if any control missing unit_test → block passes=true  │
│       ↓                                                      │
│  6. Step 5.6 Gate 4: Check qa-tracker has scenarios         │
│     covering each control_id                                │
│     - missing → block release (set blocked_reason)          │
│       ↓                                                      │
│  7. /qa-create-scenario --from-control-spec N               │
│     reads manifest → generates 5 scenario categories        │
│       ↓                                                      │
│  8. /qa-coverage-check verifies control coverage            │
│     updates feature.qa_trace_coverage.control_coverage      │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. Required `feature_list.json` schema additions

```json
{
  "id": 7,
  "qa_trace_coverage": {
    "covered_acs": [...],
    "gap_acs": [...],
    "fail_acs": [...],
    "control_coverage": {
      "manifest_path": ".agent/ui-controls/feature-7.json",
      "total_controls": 5,
      "covered_control_ids": ["product-name-input", "category-combo"],
      "gap_control_ids": ["supplier-select", "active-radio", "tags-checkbox-group"],
      "fail_control_ids": [],
      "last_checked_at": "ISO8601"
    }
  }
}
```

`feature_list.schema_version` bumps to **2.8.0** (was 2.4.0/2.6.0)

---

## 8. Required `qa-tracker.json` schema additions

```json
{
  "scenarios": [
    {
      "id": "TS-PRODUCT-EDIT-002",
      "title": "Category combo loads options from API",
      "control_refs": ["category-combo"],          // ← NEW
      "control_test_category": "api-binding",      // ← NEW: render-binding|api-binding|permission|validation|cascade-loading-error
      "feature_id": 7,
      "...": "..."
    }
  ]
}
```

Categories enum:
- `render-binding` — control แสดงและ bind state ถูกต้อง
- `api-binding` — option/value โหลดจาก API ถูก
- `permission` — visibility + data scope ตาม role
- `validation` — required/min/max/pattern
- `cascade-loading-error` — dependency, loading, error states

---

## 9. ตัวอย่างจริง — feature ที่ tag `epic="ui-fix"`

ถ้า `/continue` เลือก feature ที่ตั้งใจปรับ UI tweak (ไม่มี control เพิ่ม/แก้) → Step 5.4 ตรวจ diff
ไม่พบ control แตกต่าง → **skip emit** (ไม่บังคับ manifest)

ถ้า diff พบ `<select>` ใหม่ → **emit + บังคับเดินครบ pipeline**

---

## 10. Recovery patterns

| สถานการณ์ | Recovery |
|---|---|
| Manifest หาย / ลบไป | `/emit-control-spec <feature-id>` regenerate |
| Detection พลาด (false negative) | Manual edit manifest → re-run `/qa-coverage-check` |
| Detection false positive (control ที่ไม่ใช่ form) | Add `"_ignored": true` field → emitter skip |
| Drift กับ mockup ที่ user ตั้งใจ override | Add `"drift_check.acknowledged_findings": [...]` |

---

## 11. Backward Compatibility

- Feature ที่ไม่มี `subtasks[].files[]` UI files → no manifest needed (skip)
- Feature เก่า (passed ก่อน v2.8.0) → no retroactive enforcement (legacy)
- ใหม่หลัง v2.8.0 ที่แตะ UI → enforce ทุก feature

> Bypass mechanism: `/continue --skip-control-manifest` (logged ใน feature.notes + audit) — ใช้กรณี hot-fix เร่งด่วน
