---
description: Read qa-tracker NFR results และ update features[].nfr_compliance — block release ถ้า security/perf/reliability/maintainability fail gate
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*)
---

# /nfr-check

Sync NFR (Non-Functional Requirements) compliance from `qa-tracker.json` → `feature_list.json` for release gating.

> **Source of truth**: `qa-tracker.nfr_results` (populated by `/qa-ui-test:qa-nfr-assess`)
>
> **Effect**: Updates `features[].nfr_compliance` and flags features that block release

---

## Usage

```
/nfr-check                       # All features
/nfr-check --module CHECKOUT     # Module-scoped
/nfr-check --feature 5           # Single feature
/nfr-check --strict              # Treat all NFR types as blocks_release
/nfr-check --report-only         # Don't write — just show report
```

---

## Purpose

1. **Pull NFR results** from qa-tracker into feature_list
2. **Compute per-feature NFR compliance** based on the module the feature touches
3. **Flag release blockers** — features with any NFR type where `blocks_release && score < required`
4. **Report critical_failures** (e.g., security floor triggered: secrets exposed, plain-text passwords)

---

## ⚠️ CRITICAL RULES

1. **Read-only on qa-tracker** — this command never modifies qa-tracker.json
2. **Module-aware** — feature inherits NFR from its `module` (or all-module average if module=null)
3. **Default required thresholds** — if user hasn't customized, use:
   - `performance >= 85`, `security >= 75`, `reliability >= 85`, `maintainability >= 70`
4. **`blocks_release=true` defaults** — `security` always blocks; others advisory unless `--strict`
5. **Persist `last_nfr_check` timestamp** in `integration.last_nfr_check`

---

## Process

### Step 1: Read Files

```bash
# Read feature_list.json
cat feature_list.json

# Read qa-tracker.json (path from integration.qa_tracker_path)
cat qa-tracker.json
```

If qa-tracker.json missing:
```
⚠️ qa-tracker.json not found
   → Run /qa-ui-test:qa-nfr-assess first
   → Or update integration.qa_tracker_path
   → Skipping NFR check (no changes written)
```

If `qa-tracker.nfr_results` is `null`:
```
⚠️ NFR not assessed yet
   → Run /qa-ui-test:qa-nfr-assess
   → Skipping
```

### Step 2: Validate Schema

```
qa-tracker.json: schema_version >= 1.7.0 (required for nfr_results)
feature_list.json: schema_version >= 2.4.0 (required for nfr_compliance field)
```

If schemas older → **fail** with upgrade hint (do not silently skip).

### Step 3: Map qa-tracker.nfr_results → feature.nfr_compliance

For each `feature` in scope:

```
1. Determine NFR scope for this feature:
   - If feature.module is set: use qa-tracker.nfr_results.by_module[feature.module]
   - Else: use qa-tracker.nfr_results.overall.by_category (project-wide)

2. Build feature.nfr_compliance:
   {
     "performance":     { "score": 88, "required": 85, "blocks_release": false },
     "security":        { "score": 75, "required": 75, "blocks_release": true },
     "reliability":     { "score": 92, "required": 85, "blocks_release": false },
     "maintainability": { "score": 73, "required": 70, "blocks_release": false }
   }

3. Compute release_blocker:
   - For each type where blocks_release && score < required → add to blockers[]
   - If --strict, treat ALL types as blocks_release
```

### Step 4: Update integration.last_nfr_check + sync_status.qa_tracker

```json
{
  "integration": {
    "last_nfr_check": "ISO8601"
  },
  "sync_status": {
    "qa_tracker": {
      "features_failing_nfr": 3,
      "release_blocked_features": 2,
      "last_sync": "ISO8601"
    }
  }
}
```

### Step 5: Report critical_failures

If `qa-tracker.nfr_results.critical_failures[]` is non-empty:

```
🚨 CRITICAL FAILURES (override all gates — release blocked regardless of score):

- AWS access keys detected in DOM (admin/users page)
- Plain-text password in localStorage
- Database connection string in client-side bundle

→ Affected features: 3, 7, 12
→ ALL release gates BLOCKED until these are remediated
```

---

## Output Format

```
╔════════════════════════════════════════════════════════════╗
║                  NFR COMPLIANCE REPORT                      ║
╠════════════════════════════════════════════════════════════╣
║ Generated: 2026-05-05T10:00:00Z                            ║
║ Source:    qa-tracker.json (assessed 2026-05-04)           ║
║ Mode:      light | deep | full                              ║
╠════════════════════════════════════════════════════════════╣

1. OVERALL NFR SCORES (project-wide)
   ─────────────────────────────────
   Performance:     88 / 85  PASS  ✅
   Security:        70 / 75  FAIL  ❌ (release blocker)
   Reliability:     92 / 85  PASS  ✅
   Maintainability: 73 / 70  PASS  ✅

   Overall gate: FAIL (security below threshold)

2. PER-FEATURE COMPLIANCE
   ────────────────────────
   ┌─────┬───────────────────┬───────┬──────┬──────┬──────┬──────────┐
   │ ID  │ Title             │ Perf  │ Sec  │ Rel  │ Maint│ Status   │
   ├─────┼───────────────────┼───────┼──────┼──────┼──────┼──────────┤
   │ #5  │ List API          │ 88 ✅ │ 75 ✅│ 92 ✅│ 73 ✅│ READY    │
   │ #7  │ Create API        │ 85 ✅ │ 60 ❌│ 90 ✅│ 70 ✅│ BLOCKED  │
   │ #12 │ Auth flow         │ 92 ✅ │ 65 ❌│ 95 ✅│ 75 ✅│ BLOCKED  │
   │ #15 │ Dashboard UI      │ 70 ❌ │ 80 ✅│ 88 ✅│ 68 ⚠️│ BLOCKED* │
   └─────┴───────────────────┴───────┴──────┴──────┴──────┴──────────┘

   *Performance fails but blocks_release=false (advisory only)
   *Maintainability 68 < 70 — flagged for review (advisory)

3. RELEASE BLOCKERS
   ─────────────────
   Features blocked from passes=true:
   - Feature #7  "Create API"     → security 60 < 75
   - Feature #12 "Auth flow"      → security 65 < 75

   To unblock:
   - Run /qa-ui-test:qa-nfr-assess --module AUTH after security fixes
   - Re-run /nfr-check after qa-tracker updates

4. CRITICAL FAILURES (security floor)
   ────────────────────────────────────
   None ✅
   (or: list any from qa-tracker.nfr_results.critical_failures[])

5. RECOMMENDATIONS (top 3 by impact)
   ───────────────────────────────────
   - [HIGH] Add Content-Security-Policy header on /checkout (+5 sec score, 30min)
   - [MED]  Reduce LCP on dashboard (+3 perf score, 1h)
   - [LOW]  Extract POM helpers in checkout tests (+2 maint score, 2h)

╠════════════════════════════════════════════════════════════╣
║ FILES UPDATED:                                              ║
║ ✅ feature_list.json — features[].nfr_compliance (12 feats) ║
║ ✅ integration.last_nfr_check                               ║
║ ✅ sync_status.qa_tracker                                   ║
║                                                              ║
║ NEXT: 2 features release-blocked. Fix security or override  ║
║       with /continue --force (logged in audit trail).       ║
╚════════════════════════════════════════════════════════════╝
```

---

## Files Modified

1. **feature_list.json**
   - `features[].nfr_compliance` (per feature in scope)
   - `integration.last_nfr_check`
   - `sync_status.qa_tracker.{features_failing_nfr, release_blocked_features, last_sync}`

**Never modifies** `qa-tracker.json` (read-only consumer).

---

## Default Required Thresholds

| NFR Type        | Default `required` | Default `blocks_release` |
|-----------------|--------------------|--------------------------|
| performance     | 85                 | false (advisory)         |
| security        | 75                 | **true**                 |
| reliability     | 85                 | false (advisory)         |
| maintainability | 70                 | false (advisory)         |

Override per-feature: edit `feature.nfr_compliance.<type>.required` or `.blocks_release` directly.

Override globally: pass `--strict` (sets `blocks_release=true` for all types) or `--threshold security=80`.

---

## Integration with /continue

`/continue` reads `feature.nfr_compliance` and refuses to mark `passes=true` when:

```
ANY type where:
  blocks_release == true
  AND score < required
```

To override: `/continue --force-nfr` (logged in `feature.notes`).

---

## When to Run

- After `/qa-ui-test:qa-nfr-assess` completes
- Before `/continue` for the next feature
- Before sprint demo / release sign-off
- After fixing security/perf issues — to refresh compliance

---

## Notes

- Read-only on qa-tracker (never writes)
- Idempotent — safe to re-run
- Does not create features (use `/add-feature`)
- For NFR assessment itself, use `/qa-ui-test:qa-nfr-assess`

> 💬 **Note**: This command responds in Thai (คำสั่งนี้จะตอบกลับเป็นภาษาไทย)
