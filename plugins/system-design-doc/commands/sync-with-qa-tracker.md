---
description: Sync acceptance criteria + use cases between design_doc_list.json และ qa-tracker.json (bidirectional)
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*)
---

# /sync-with-qa-tracker

Synchronize **Acceptance Criteria (AC)** และ **Use Cases (UC)** ระหว่าง `design_doc_list.json` (source of truth) และ `qa-tracker.json` (consumer)

> **Direction**: AC IDs propagate **one-way** (design-doc → qa-tracker). Coverage info flows **back** (qa-tracker → design-doc).

---

## Usage

```
/sync-with-qa-tracker
/sync-with-qa-tracker --gaps-only
/sync-with-qa-tracker --auto-link
```

---

## Purpose

1. **Propagate AC IDs** — push design-doc `acceptance_criteria[]` IDs to qa-tracker scenarios
2. **Pull coverage** — read qa-tracker traceability and update `acceptance_criteria[].linked_scenarios`
3. **Update sync timestamps** — both files
4. **Flag GAPs** — ACs with zero linked scenarios (release blockers)

---

## Process

### Step 1: Read Files

```bash
# Read design_doc_list.json (registry อยู่ที่ .design-docs/ — root path เป็น legacy fallback)
cat .design-docs/design_doc_list.json 2>/dev/null || cat design_doc_list.json

# Read qa-tracker.json (path from integration.qa_tracker_path)
cat qa-tracker.json
```

If `qa-tracker.json` doesn't exist:
```
⚠️ qa-tracker.json not found at <path>
   → Create it via /qa-ui-test:qa-help
   → Or update integration.qa_tracker_path in design_doc_list.json
```

### Step 2: Validate Schema Compatibility

```
design_doc_list.json: schema_version >= 2.2.0 (required)
qa-tracker.json:      schema_version >= 1.7.0 (required for AC fields)
```

If either is older:
- Report version mismatch
- Suggest: `/system-design-doc:validate-design-doc` to upgrade design doc
- Suggest: bump qa-tracker manually OR run `/qa-ui-test:qa-help --upgrade`

### Step 3: Discover ACs in design doc markdown (auto-discovery)

If `documents[].acceptance_criteria[]` is empty but the markdown file has AC lines, auto-populate:

```bash
# AC/UC live in section 2 (requirements). Resolve that file via design_doc_list.json:
#   split  → documents[].sections[key="requirements"].file  (e.g. .design-docs/<doc_dir>/02-requirements.md)
#   single / no registry → glob .design-docs/*.md (legacy)
grep -nE '^AC-[0-9]+:' .design-docs/<doc_dir>/02-requirements.md      # split
grep -nE '\| AC-[0-9]+ \|' .design-docs/<doc_dir>/02-requirements.md  # split (table rows)
# legacy single-file fallback: grep -nE '^AC-[0-9]+:' .design-docs/*.md
```

For each match:
1. Extract `AC-NNN` and criterion text
2. Add to `documents[].acceptance_criteria[]` with `sync_status: "auto-discovered"`
3. Leave `module`, `fr_ref`, `uc_ref` blank (user fills in)

### Step 4: Discover UCs in design doc markdown

```bash
# split → .design-docs/<doc_dir>/02-requirements.md ; single / no registry → .design-docs/*.md
grep -nE '^### Use Case \(UC-[0-9]+\):' .design-docs/<doc_dir>/02-requirements.md
```

For each match:
1. Extract `UC-NNN` and title
2. Add to `documents[].use_cases[]` with `sync_status: "auto-discovered"`

### Step 5: Push AC IDs to qa-tracker scenarios

For each scenario in `qa-tracker.scenarios[]`:

1. Look at `scenario.acceptance_criteria_id[]` — if empty, attempt auto-link:
   - Match by `module` (scenario.module === ac.module)
   - Match by keyword (scenario.title contains AC criterion keywords)
   - Auto-link only when `--auto-link` flag is passed; otherwise just **report candidates**
2. Update `scenario.acceptance_criteria_id[]` for matched ACs
3. Set `scenario.use_case_id` if UC matches scenario module + flow type

**Output**:
```
Pushing AC links to qa-tracker scenarios...

✅ TS-CHECKOUT-001 ↔ AC-001, AC-002 (manual)
🔄 TS-CHECKOUT-002 ↔ AC-003 (auto-linked, confidence 0.85)
⚠️ TS-CHECKOUT-003 ↔ ? (no AC match — candidate: AC-004)
```

### Step 6: Pull coverage back to design doc

For each AC in `documents[].acceptance_criteria[]`:

1. Find scenarios in `qa-tracker.scenarios[]` where `acceptance_criteria_id[]` includes this AC ID
2. Update `ac.linked_scenarios[]` with their IDs
3. Set `ac.sync_status`:
   - `synced` — at least one scenario linked AND latest run = passed
   - `partially-covered` — scenarios linked but some failed/pending
   - `gap` — zero scenarios linked (release blocker)

### Step 7: Update sync_status.qa_tracker

```json
{
  "sync_status": {
    "qa_tracker": {
      "total_acs": 12,
      "covered_acs": 9,
      "gap_acs": 3,
      "total_ucs": 4,
      "covered_ucs": 3,
      "last_sync": "ISO8601"
    }
  },
  "integration": {
    "last_synced_with_qa_tracker": "ISO8601"
  }
}
```

---

## Output Format

```
╔════════════════════════════════════════════════════════════╗
║          DESIGN DOC ↔ QA TRACKER SYNC REPORT               ║
╠════════════════════════════════════════════════════════════╣
║ Generated: 2026-05-05T10:00:00Z                            ║
╠════════════════════════════════════════════════════════════╣

1. ACCEPTANCE CRITERIA INVENTORY
   ─────────────────────────────
   Total ACs in design doc:   12
   Covered by scenarios:       9 (75%)
   GAP (no scenarios):         3
   Auto-discovered this run:   2

   AC Coverage:
   - AC-001 ✅ TS-CHECKOUT-001, TS-CHECKOUT-002 (PASS)
   - AC-002 ✅ TS-CHECKOUT-001 (PASS)
   - AC-003 ⚠️ TS-CHECKOUT-002 (FAIL — bug BUG-001)
   - AC-004 ❌ GAP — no scenarios
   - AC-005 ❌ GAP — no scenarios
   - AC-006 ❌ GAP — no scenarios

2. USE CASE INVENTORY
   ───────────────────
   Total UCs:                  4
   With scenarios:             3 (75%)

   - UC-001 "Place Order"   → 5 scenarios
   - UC-002 "Cancel Order"  → 2 scenarios
   - UC-003 "Refund"        → 0 scenarios ⚠️
   - UC-004 "Reorder"       → 1 scenario

3. AUTO-LINK CANDIDATES (review before --auto-link)
   ─────────────────────────────────────────────────
   - TS-CHECKOUT-003 → AC-004 (confidence 0.78, keyword match: "VAT")
   - TS-AUTH-005     → AC-007 (confidence 0.92, keyword match: "logout")

4. SYNC ACTIONS APPLIED
   ─────────────────────
   ✅ Pushed 5 AC links to qa-tracker scenarios
   ✅ Pulled coverage for 12 ACs back to design_doc_list
   ✅ Auto-discovered 2 ACs from .design-docs/system-design-checkout.md
   ✅ Updated sync_status.qa_tracker timestamp

5. GAPS & NEXT ACTIONS
   ────────────────────
   HIGH (release blockers):
   - [ ] AC-004, AC-005, AC-006 → run /qa-ui-test:qa-create-scenario
   - [ ] UC-003 → no scenarios; create wizard test for refund flow

   MEDIUM:
   - [ ] AC-003 has FAIL run → /qa-ui-test:qa-bug-list

╠════════════════════════════════════════════════════════════╣
║ COVERAGE SCORE: 75% (Needs Improvement)                    ║
║ Release Ready: NO (3 GAPs require scenarios)               ║
╚════════════════════════════════════════════════════════════╝
```

---

## Files Modified

1. **design_doc_list.json**
   - Update `documents[].acceptance_criteria[].linked_scenarios`
   - Update `documents[].acceptance_criteria[].sync_status`
   - Update `documents[].use_cases[].linked_scenarios`
   - Update `sync_status.qa_tracker`
   - Update `integration.last_synced_with_qa_tracker`
   - Append new auto-discovered ACs/UCs (if any)

2. **qa-tracker.json**
   - Update `scenarios[].acceptance_criteria_id[]` (AC IDs from design doc)
   - Update `scenarios[].use_case_id` (UC ID from design doc, optional)

---

## Matching Logic

### AC ↔ Scenario Matching (auto-link)

```
Score = weighted sum of:
- module match     (scenario.module == ac.module)              +50
- keyword overlap  (scenario.title contains AC criterion words) +30
- type alignment   (scenario.type aligns with ac.type)          +10
- module page hit  (scenario.url matches ac.module pages)       +10

Threshold for auto-link:    >= 70 (with --auto-link flag)
Threshold for suggestion:   >= 50 (always reported as candidate)
```

### UC ↔ Scenario Matching

```
- scenario.module == uc.module                       (required)
- scenario.page_type in ['wizard', 'state-machine']  → strong hint
- scenario.title contains UC title keyword           → +20
```

---

## Behavior Flags

| Flag | Effect |
|------|--------|
| `--gaps-only` | Only report ACs with zero scenarios (skip rest) |
| `--auto-link` | Apply auto-link suggestions with score ≥ 70 (default: report only, no write) |
| `--dry-run` | Show what would change without writing files |

---

## Backward Compatibility

- If design doc lacks Section 2.4 (AC) or 2.5 (UC) → command **warns and continues** (does not fail)
- If `documents[].acceptance_criteria[]` is empty → run auto-discovery from markdown (Step 3)
- If `qa-tracker.json` is older than 1.7.0 → fall back to scenario-only sync, skip AC fields, warn user

---

## When to Run

- After editing Section 2.4 (AC) or 2.5 (UC) in design doc
- After `/qa-ui-test:qa-create-scenario` adds new scenarios
- After `/qa-ui-test:qa-trace` runs (to refresh coverage)
- Before release sign-off (combined with `/validate-integration`)

---

## Notes

- Safe to run multiple times (idempotent for sync, additive for auto-discovery)
- Does **not** create scenarios — use `/qa-ui-test:qa-create-scenario` for that
- Does **not** modify scenario test scripts — only `acceptance_criteria_id[]` field
- Source of truth for AC/UC = design doc; qa-tracker mirrors

> 💬 **Note**: This command responds in Thai (คำสั่งนี้จะตอบกลับเป็นภาษาไทย)
