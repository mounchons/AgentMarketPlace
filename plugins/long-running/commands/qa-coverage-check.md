---
description: Read qa-tracker traceability matrix และ update features[].qa_trace_coverage — flag features with GAP ACs as release blockers
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*)
---

# /qa-coverage-check

Sync AC traceability coverage from `qa-tracker.json` → `feature_list.json` to gate release readiness.

> **Source of truth**: `qa-tracker.traceability` (populated by `/qa-ui-test:qa-trace`)
>
> **Effect**: Updates `features[].qa_trace_coverage` and flags features whose ACs have GAPs

---

## Usage

```
/qa-coverage-check                       # All features with acceptance_criteria_id[]
/qa-coverage-check --module CHECKOUT     # Module-scoped
/qa-coverage-check --feature 5           # Single feature
/qa-coverage-check --gaps-only           # Only show features with gap_acs
/qa-coverage-check --report-only         # Don't write — show report
```

---

## Purpose

1. **Pull AC coverage** from qa-tracker.traceability → feature_list
2. **Compute per-feature coverage** based on `feature.acceptance_criteria_id[]`
3. **Flag release blockers** — features where any AC has gate `GAP` or `FAIL`
4. **Report orphans** — ACs in qa-tracker not linked to any feature, features with empty `acceptance_criteria_id[]`

---

## ⚠️ CRITICAL RULES

1. **Read-only on qa-tracker** — never modifies qa-tracker.json
2. **Match by AC ID, not heuristic** — feature must have `acceptance_criteria_id[]` populated (manual or via design-doc sync)
3. **GAP = release blocker** — features with any AC at gate `GAP` block `/continue` from `passes=true`
4. **FAIL = release blocker** — same enforcement; user must fix the failing scenario first
5. **Bidirectional consistency** — if `feature.acceptance_criteria_id` lists AC-001, `qa-tracker.traceability.ac_inventory[AC-001].linked_scenarios[]` should be non-empty

---

## Process

### Step 1: Read Files

```bash
cat feature_list.json
cat qa-tracker.json
```

If qa-tracker missing or `traceability == null`:
```
⚠️ Traceability not run yet
   → Run /qa-ui-test:qa-trace first
   → Skipping coverage check (no changes written)
```

### Step 2: Validate Schemas

```
qa-tracker.json:    schema_version >= 1.7.0 (traceability field)
feature_list.json:  schema_version >= 2.4.0 (qa_trace_coverage field)
```

### Step 3: Build per-feature coverage

For each feature with `acceptance_criteria_id[]` non-empty:

```
Initialize:
  covered_acs = []
  gap_acs     = []
  fail_acs    = []
  pending_acs = []

For each ac_id in feature.acceptance_criteria_id:
  Look up qa-tracker.traceability.ac_inventory[ac_id]:
    - Not found        → flag as orphan (AC missing in qa-tracker)
    - gate == "PASS"   → covered_acs.push(ac_id)
    - gate == "GAP"    → gap_acs.push(ac_id)
    - gate == "FAIL"   → fail_acs.push(ac_id)
    - gate == "CONCERNS" → pending_acs.push(ac_id) (not blocker, but warning)

Update feature.qa_trace_coverage:
  {
    "covered_acs": [...],
    "gap_acs":     [...],
    "fail_acs":    [...],
    "pending_acs": [...],
    "last_checked_at": "ISO8601"
  }
```

### Step 4: Detect orphan features

```
For each feature with empty acceptance_criteria_id[]:
  - If feature.epic == "bug-fix" with linked_bug → OK (bug-fix features may not have ACs)
  - Else → warn: "Feature #N has no AC links. Run /sync-with-features in design-doc plugin or manually populate acceptance_criteria_id[]"
```

### Step 5: Detect orphan ACs

```
For each ac_id in qa-tracker.traceability.ac_inventory:
  - If no feature.acceptance_criteria_id includes this ac_id:
    - And ac.gate != "GAP" (covered by scenarios but not by feature):
      → warn: "AC-NNN has scenarios but no feature implements it"
```

### Step 6: Update integration timestamps

```json
{
  "integration": { "last_qa_coverage_check": "ISO8601" },
  "sync_status": {
    "qa_tracker": {
      "total_features_with_acs": 8,
      "features_with_gap_acs": 2,
      "release_blocked_features": 2,
      "last_sync": "ISO8601"
    }
  }
}
```

---

## Output Format

```
╔════════════════════════════════════════════════════════════╗
║              QA COVERAGE CHECK REPORT                       ║
╠════════════════════════════════════════════════════════════╣
║ Generated: 2026-05-05T10:00:00Z                            ║
║ Source:    qa-tracker.json (traced 2026-05-04)             ║
╠════════════════════════════════════════════════════════════╣

1. AC COVERAGE PER FEATURE
   ────────────────────────
   ┌─────┬───────────────────┬──────────────────┬──────────────┬─────────┐
   │ ID  │ Title             │ ACs              │ Coverage     │ Status  │
   ├─────┼───────────────────┼──────────────────┼──────────────┼─────────┤
   │ #5  │ List API          │ AC-001, AC-002   │ 2/2 (100%)   │ READY ✅│
   │ #7  │ Create API        │ AC-003, AC-004   │ 1/2 (50%)    │ FAIL  ❌│
   │ #12 │ Auth flow         │ AC-007, AC-008   │ 0/2 (0%)     │ GAP   ❌│
   │ #15 │ Dashboard         │ AC-010           │ 1/1 (100%)   │ READY ✅│
   │ #20 │ Cancel order      │ (no AC links)    │ —            │ ORPHAN ⚠️│
   └─────┴───────────────────┴──────────────────┴──────────────┴─────────┘

2. RELEASE BLOCKERS
   ─────────────────
   Features blocked from passes=true:

   - Feature #7  "Create API"
     - GAP ACs: (none)
     - FAIL ACs: AC-004 "Validation rejects negative qty"
       → Linked scenario TS-CHECKOUT-005 currently FAILING (BUG-002)

   - Feature #12 "Auth flow"
     - GAP ACs: AC-007, AC-008
       → No scenarios — run /qa-ui-test:qa-create-scenario --module AUTH

3. ORPHAN ANALYSIS
   ────────────────
   Features without AC links:
   - #20 "Cancel order"  — likely needs acceptance_criteria_id[] populated
   - #25 "Settings"      — likely no AC needed (UI-only); leave empty

   ACs without feature links (covered by scenarios but no feature):
   - AC-011 "Reorder feature" → no implementing feature; create one?

4. COVERAGE SUMMARY
   ─────────────────
   Total features with ACs:     8 of 12
   Fully covered (PASS):        5
   Partial (some FAIL):         1
   GAP (release blocker):       2
   Pending review (CONCERNS):   0

   Release-ready features:      5 / 12 (42%)

╠════════════════════════════════════════════════════════════╣
║ FILES UPDATED:                                              ║
║ ✅ feature_list.json — features[].qa_trace_coverage         ║
║ ✅ integration.last_qa_coverage_check                       ║
║ ✅ sync_status.qa_tracker                                   ║
║                                                              ║
║ NEXT:                                                        ║
║ - 2 features release-blocked by GAP/FAIL ACs                 ║
║ - Run /qa-ui-test:qa-create-scenario for AC-007, AC-008      ║
║ - Fix BUG-002 to unblock AC-004                              ║
╚════════════════════════════════════════════════════════════╝
```

---

## Files Modified

1. **feature_list.json**
   - `features[].qa_trace_coverage` (per feature with acceptance_criteria_id[])
   - `integration.last_qa_coverage_check`
   - `sync_status.qa_tracker.{total_features_with_acs, features_with_gap_acs, release_blocked_features, last_sync}`

**Never modifies** `qa-tracker.json` (read-only consumer).

---

## Integration with /continue

`/continue` reads `feature.qa_trace_coverage` and refuses to mark `passes=true` when:

```
gap_acs[] is non-empty   OR   fail_acs[] is non-empty
```

To override: `/continue --force-coverage` (logged in `feature.notes`).

`pending_acs[]` (CONCERNS gate) does NOT block but emits warning.

---

## When to Run

- After `/qa-ui-test:qa-trace` (which builds the traceability matrix)
- After `/qa-ui-test:qa-run` (re-trace then re-coverage)
- Before `/continue` for the next feature
- Before release sign-off
- Periodically during a sprint to catch GAPs early

---

## Behavior Flags

| Flag | Effect |
|------|--------|
| `--gaps-only` | Only show features with gap_acs or fail_acs |
| `--report-only` | Don't write feature_list.json — show report only |
| `--strict-orphans` | Fail (exit non-zero) if any feature has empty acceptance_criteria_id[] |

---

## Notes

- Read-only on qa-tracker (never writes)
- Idempotent — safe to re-run
- Does not create scenarios (use `/qa-ui-test:qa-create-scenario`)
- Does not create features (use `/add-feature`)
- Combine with `/nfr-check` for full release-gate verification

> 💬 **Note**: This command responds in Thai (คำสั่งนี้จะตอบกลับเป็นภาษาไทย)
