# QA v2.5 Integration Context — for New Session

> **Purpose:** session ใหม่อ่านไฟล์นี้แล้วทำงานต่อได้ทันที — ปรับปรุง 3 plugins (system-design-doc, ui-mockup, long-running) ให้ integrate กับ qa-ui-test v2.5.0
> **Created:** 2026-05-05
> **Last qa-ui-test commit:** `da549a3` (feat: bump v2.3 → v2.5)

---

## 1. qa-ui-test v2.5 — Features Summary

**Plugin path:** `plugins/qa-ui-test/`
**SKILL version:** 2.5.0 | **qa-tracker schema:** 1.7.0

### What's New (v2.3 → v2.5)

| Version | Feature | Key fields/commands |
|---|---|---|
| **v2.3** | Risk-based priority + 3-tier model | `scenario.risk{priority(P0-P3),score,probability,impact}`, `complexity_factors[]` (8 factors), `assigned_model` (opus/sonnet/haiku), `assigned_model_reason` |
| **v2.3** | Auto-recompute on logic change | `/qa-edit-scenario` reads change keywords → infers factor changes → diff preview |
| **v2.3** | Bug-scenario link via snapshot | `bug.scenario_risk_snapshot{priority, factors, scenario_assigned_model}` (frozen at fail-time) |
| **v2.3** | Risk-aware bug-export-subtask matching | Adds 30 risk-aware points: factor overlap (+15), risk-priority alignment (+10), model-tier match (+5); max 115; STRONGLY RECOMMENDED ≥90 |
| **v2.4** | NFR Assessment (new qa-nfr skill) | `/qa-nfr-assess` — 4 categories × 100; gate PASS≥85, CONCERNS 65-84, FAIL<65; security<75 = hard floor; nfr_results in qa-tracker |
| **v2.5** | Traceability matrix | `/qa-trace` — AC ↔ scenarios, GAP detection; `scenario.acceptance_criteria_id[]` field; per-AC gate (PASS/CONCERNS/FAIL/GAP) |
| **v2.5** | Numeric review score 0-100 | `/qa-retest --review` — 4 dimensions × 25 (coverage/determinism/assertion_quality/maintainability) |

### 8 Complexity Factors (qa-tracker.complexity_factor_catalog)

```
state-machine        — flow มี status transitions
cascade-deep         — cascade depth ≥ 2 (A→B→C)
multi-step           — wizard ≥ 3 steps
concurrent           — race / optimistic lock
security-flow        — auth, CSRF, XSS, money
network-mock         — API mock + retry
master-detail-sync   — inline edit + master totals
cross-browser        — engine diff testing
```

### Schema Anchors (qa-tracker.json 1.7)

```
scenarios[].risk.priority        : "P0|P1|P2|P3"
scenarios[].complexity_factors   : array of 8 factor strings
scenarios[].assigned_model       : "opus|sonnet|haiku"
scenarios[].acceptance_criteria_id : ["AC-1.1", ...]   ← new v2.5
bugs[].scenario_risk_snapshot    : { priority, factors, scenario_assigned_model }
nfr_results                      : per-category scores + gate (v2.4)
traceability                     : AC inventory + matrix (v2.5)
```

---

## 2. system-design-doc — Integration Gaps

**Plugin path:** `plugins/system-design-doc/`
**Current schema:** design_doc_list.json v2.1.0
**Severity:** 🔴 HIGH (blocks /qa-trace auto-link)

### Critical Gaps

| Gap | Current | Needed | Why |
|---|---|---|---|
| No AC ID pattern | Uses `FR-001`, `BR-001` (prose only) | Add `AC-X.Y` machine-readable section | `/qa-trace` greps `^AC-\d+(\.\d+)?:` and `^### Use Case (UC-\d+):` |
| No AC inventory in manifest | design_doc_list.json has entities + api_endpoints only | Add `acceptance_criteria[]` array | qa-trace needs structured list to match scenarios |
| No qa-tracker linkage | integration section maps mockup + feature only | Add `qa_tracker_path` + `last_synced_with_qa_tracker` | bidirectional AC sync |
| qa-ui-test missing from validate-integration | Only validates 3 plugins | Expand to 4 plugins | release-readiness check |
| No /sync-with-qa-tracker command | Has /sync-with-mockups, /sync-with-features | Mirror pattern → /sync-with-qa-tracker | propagate AC IDs to scenario.acceptance_criteria_id[] |

### Files to Modify

```
plugins/system-design-doc/skills/system-design-doc/templates/design-doc-template.md
   → Add Section 2.4: Acceptance Criteria table (AC-ID, Criterion, Module, FR Ref)

plugins/system-design-doc/skills/system-design-doc/templates/design_doc_list.json
   → Add: documents[].acceptance_criteria[] (id, title, source, module, type)
   → Add: integration.qa_tracker_path
   → Add: integration.last_synced_with_qa_tracker

plugins/system-design-doc/commands/sync-with-qa-tracker.md  ← NEW
   → Mirror sync-with-features.md logic
   → Map AC-X.Y ↔ scenario.acceptance_criteria_id[]

plugins/system-design-doc/commands/validate-integration.md
   → Expand scope to 4 plugins (add qa-ui-test)

plugins/system-design-doc/skills/system-design-doc/SKILL.md
   → Add qa-ui-test to integration section
   → Document AC pattern: AC-X.Y format, UC-N for use cases
```

### Acceptance Criteria Pattern (proposed)

```markdown
### 2.4 Acceptance Criteria

| AC ID  | Criterion                          | Module   | FR Ref  | Type       |
|--------|------------------------------------|----------|---------|------------|
| AC-1.1 | User can place order with valid pay| CHECKOUT | FR-001  | functional |
| AC-1.2 | User can cancel order within 10min | CHECKOUT | FR-002  | functional |
| AC-1.3 | VAT calculation correct            | CHECKOUT | BR-005  | business-rule |
```

---

## 3. ui-mockup — Integration Gaps

**Plugin path:** `plugins/ui-mockup/`
**Current schema:** mockup_list.json v1.7.0
**Severity:** 🟡 MEDIUM (improves /qa-create-scenario accuracy)

### Critical Gaps

| Gap | Current | Needed | Why |
|---|---|---|---|
| No complexity_factors[] | Has crud_type + complexity (simple/complex) only | Add `complexity_factors[]` per page (8 factors) | qa-create-scenario auto-infers factors instead of re-scanning code |
| No acceptance_criteria_id[] | design_doc_section linkage but not AC-level | Add `acceptance_criteria_ids[]` per page | propagate to scenario.acceptance_criteria_id[] |
| No risk baseline | No risk metadata at all | Add `risk_baseline{probability,impact,priority}` per page | qa-create-scenario seeds risk score |
| No cascade chain explicit | components list mentions Dropdowns | Add `cascade_chain[]` (e.g., ["Category","Product","OrderItem"]) | maps to cascade-deep factor |
| No wizard step count | Components mention "Stepper" loosely | Add `wizard_steps: N` | maps to multi-step factor (if N ≥ 3) |
| No qa-ui-test in SKILL.md | Zero mentions of qa-tracker | Document QA integration | discoverability |

### Mockup Signal → QA Factor Mapping (heuristics)

```
ui_pattern == "page" + 3+ pages in CRUD group  → multi-step (likely wizard)
components.includes("Wizard"|"Stepper")        → multi-step
components.includes("Grid") + expandable row    → master-detail-sync
crud_type == "detail" + has_related_grid       → master-detail-sync
cascading dropdowns in components              → cascade-deep
category == "auth"                              → security-flow
crud_actions.delete + sensitive data            → security-flow
related_pages with status flow                  → state-machine
```

### Files to Modify

```
plugins/ui-mockup/skills/ui-mockup/templates/mockup_list.json
   → Add: pages[].complexity_factors[]
   → Add: pages[].acceptance_criteria_ids[]
   → Add: pages[].risk_baseline{probability, impact, priority}
   → Add: pages[].cascade_chain[]
   → Add: pages[].wizard_steps

plugins/ui-mockup/skills/ui-mockup/SKILL.md
   → Add "QA Integration" section
   → Document factor inference heuristics

plugins/ui-mockup/commands/init-mockup.md
   → Auto-derive complexity_factors[] when scanning pages
   → Cross-link to system-design-doc AC IDs (when available)
```

---

## 4. long-running — Integration Gaps

**Plugin path:** `plugins/long-running/`
**Current schema:** feature_list.json
**Severity:** 🔴 HIGH (release-gate logic depends on this)

### Critical Gaps

| Gap | Current | Needed | Why |
|---|---|---|---|
| No NFR consumption | Doesn't read nfr_results | Add `nfr_compliance{[type]:{score,required,blocks_release}}` | block feature release if NFR fails |
| No qa-trace coverage check | Doesn't verify AC coverage | Add `qa_trace_coverage{covered, gaps[]}` | refuse "passed" if AC has GAP |
| Missing acceptance_criteria_id[] | feature has acceptance_criteria[] (prose) | Add structured `acceptance_criteria_id[]` linking to scenario AC IDs | bidirectional traceability |
| Missing complexity_tags[] | Has complexity (simple/medium/complex) | Add `complexity_tags[]` (uses qa's 8 factors) | qa-bug-export-subtask matching uses this for factor overlap (+15 points) |
| linked_bug field undefined | qa-bug-export creates feature with linked_bug but field not in template | Add to feature_list template + document | bug-fix tracking complete |
| /continue doesn't check qa | Self-reported "passed" by dev | Add qa verification gate in /continue | prevent untested code being marked passed |

### Files to Modify

```
plugins/long-running/skills/long-running/templates/feature_list.json
   → Add to features[]:
     • acceptance_criteria_id[] (structured AC links)
     • complexity_tags[] (qa's 8 factors)
     • linked_bug{ qa_bug_id, scenario_risk{priority,factors}, ... } (was implicit in qa-bug-export)
     • nfr_compliance{ [nfr_type]: { score, required, blocks_release } }
     • qa_trace_coverage{ covered_acs[], gap_acs[], last_checked_at }

plugins/long-running/skills/long-running/SKILL.md
   → Document feature.passes precondition: nfr_compliance ALL pass + qa_trace_coverage.gap_acs == []

plugins/long-running/commands/continue.md
   → Before marking subtask "Verify BUG-XXX" done=true:
     - Check qa-tracker.bugs[BUG-XXX].status == verified
   → Before marking feature.passes=true:
     - Check feature.acceptance_criteria_id all have qa-tracker scenarios passed
     - Check NFR compliance for relevant module

plugins/long-running/commands/nfr-check.md  ← NEW
   → Read qa-tracker.nfr_results
   → Update feature.nfr_compliance
   → Block features that fail NFR gate

plugins/long-running/commands/qa-coverage-check.md  ← NEW
   → Read qa-tracker.traceability
   → Update feature.qa_trace_coverage
   → Flag features with GAP ACs
```

### feature_list.json Schema Additions

```json
{
  "features": [{
    "acceptance_criteria_id": ["AC-1.1", "AC-1.2"],
    "complexity_tags": ["state-machine", "cascade-deep"],
    "linked_bug": {
      "qa_bug_id": "BUG-001",
      "scenario_risk": {
        "priority": "P0",
        "score": 9,
        "factors": ["security-flow"],
        "scenario_assigned_model": "opus"
      },
      "linked_scenario": "TS-LOGIN-003"
    },
    "nfr_compliance": {
      "performance": { "score": 88, "required": 85, "blocks_release": false },
      "security":    { "score": 70, "required": 75, "blocks_release": true },
      "reliability": { "score": 92, "required": 85, "blocks_release": false },
      "maintainability": { "score": 73, "required": 70, "blocks_release": false }
    },
    "qa_trace_coverage": {
      "covered_acs": ["AC-1.1", "AC-1.2"],
      "gap_acs": [],
      "last_checked_at": "ISO8601"
    }
  }]
}
```

---

## 5. Recommended Implementation Order

### Phase 1 — Foundation (system-design-doc) 🔴
**Why first:** ทุก plugin อื่นต้องใช้ AC IDs จากนี่

1. Add Section 2.4 Acceptance Criteria to design-doc-template.md
2. Add `acceptance_criteria[]` to design_doc_list.json schema
3. Create `/sync-with-qa-tracker` command
4. Update `/validate-integration` (3 → 4 plugins)
5. Bump system-design-doc to v1.7.0

### Phase 2 — Long-running NFR + Coverage Gates 🔴
**Why second:** release-gate logic ต้องทำงานก่อนปล่อย feature

1. Extend feature_list.json schema (4 new fields)
2. Add `/nfr-check` command
3. Add `/qa-coverage-check` command
4. Update `/continue` to enforce qa+nfr gates before passes=true
5. Bump long-running to v2.4.0

### Phase 3 — UI Mockup Auto-Inference 🟡
**Why last:** nice-to-have ที่ทำให้ qa-create-scenario แม่นขึ้น แต่ไม่ block release

1. Extend mockup_list.json (5 new fields per page)
2. Add factor inference heuristics in `/init-mockup`
3. Update SKILL.md with QA integration section
4. Bump ui-mockup to v1.8.0

### Phase 4 — Marketplace + Commit
1. Update `.claude-plugin/marketplace.json` for all 3 plugins
2. Commit + push (one PR per phase หรือ all-in-one)
3. Update memory: `project_agentmarketplace.md`

---

## 6. Quick Start for New Session

```
อ่านไฟล์นี้แล้วเริ่มงาน:
   docs/qa-v2.5-integration-context.md

ตรวจสอบสถานะปัจจุบัน:
   git log -5 --oneline
   cat plugins/qa-ui-test/skills/qa-ui-test/SKILL.md | head -10
   cat plugins/qa-ui-test/skills/qa-ui-test/templates/qa-tracker.json | head -30

เริ่ม Phase 1 (system-design-doc):
   /system-design-doc:edit-section
   หรือแก้โดยตรง — section 2.4 AC table + design_doc_list.json schema

เริ่ม Phase 2 (long-running) ทีหลัง:
   แก้ templates/feature_list.json ก่อน
   จากนั้นสร้าง /nfr-check + /qa-coverage-check

เริ่ม Phase 3 (ui-mockup) สุดท้าย:
   แก้ templates/mockup_list.json
   จากนั้นปรับ /init-mockup ให้ auto-infer factors

ทุก phase จบ:
   - bump version ใน plugin.json + marketplace.json
   - commit + push
   - update memory project_agentmarketplace.md
```

---

## 7. Cross-Plugin Data Flow (target state)

```
         ┌──────────────────────┐
         │  system-design-doc   │
         │  AC-1.1, AC-1.2, ...│
         └──────────┬───────────┘
                    │ AC IDs propagate
        ┌───────────┼───────────┐
        ▼           ▼           ▼
  ┌──────────┐ ┌──────────┐ ┌──────────┐
  │ui-mockup │ │qa-ui-test│ │long-     │
  │          │ │          │ │ running  │
  │mockup    │ │scenarios │ │features  │
  │.AC_IDs[] │ │.AC_IDs[] │ │.AC_IDs[] │
  └────┬─────┘ └────┬─────┘ └────┬─────┘
       │            │            │
       │  factor    │  bugs +    │ NFR gate
       │  hints     │  factors   │ + coverage
       └────────────┼────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │  Release Gate        │
         │  ✓ AC coverage 100%  │
         │  ✓ NFR PASS          │
         │  ✓ P0 scenarios pass │
         │  ✓ Review score ≥ 80 │
         └──────────────────────┘
```

### Key invariants to maintain

- **AC ID propagation is one-way:** system-design-doc is source of truth → others reference
- **Risk + factors flow scenario → bug → feature** (frozen snapshot at each step)
- **NFR + Coverage gates are advisory** — long-running enforces, but `--force` override allowed
- **Backward compat:** existing plugins without new fields keep working (use sensible defaults)

---

## 8. Reference: qa-ui-test Files Already Implemented

✅ Schema (qa-tracker.json 1.7) — `plugins/qa-ui-test/skills/qa-ui-test/templates/qa-tracker.json`
✅ qa-nfr skill — `plugins/qa-ui-test/skills/qa-nfr/`
✅ /qa-trace — `plugins/qa-ui-test/commands/qa-trace.md`
✅ /qa-nfr-assess — `plugins/qa-ui-test/commands/qa-nfr-assess.md`
✅ /qa-retest --review numeric — `plugins/qa-ui-test/commands/qa-retest.md` (Step 6)
✅ /qa-edit-scenario auto-recompute — `plugins/qa-ui-test/commands/qa-edit-scenario.md` (Step 1.5)
✅ Bug snapshot — `plugins/qa-ui-test/commands/qa-bug-triage.md` (Step 1)
✅ /qa-help 12 modes (incl --troubleshoot) — `plugins/qa-ui-test/commands/qa-help.md`

**These do NOT need changes for integration work** — they're the producer/consumer of fields the other plugins need to add.
