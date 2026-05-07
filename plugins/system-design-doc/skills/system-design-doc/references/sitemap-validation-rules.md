# sitemap.json Validation Rules

> Cross-validation rules for `.design-docs/sitemap.json` — extends R1-R30 from `SKILL.md`.

---

## Schema-level (enforced by `references/sitemap-schema.json`)

- Root must include all required top-level fields (schema_version, design_doc_ref, project_name, generated_at, last_synced_at, last_modified_by, etag, workflow_stages, design_system, application, edges, sync_status)
- All node IDs must match prefix pattern: `(MP|TPL|NAV|CMP|P|API|MW|EXT)-\d{3,}`
- All cross-references (uses_master, uses_template, calls_apis, etc.) must match correct prefix pattern
- Edge `type` ∈ {calls, guarded-by, calls-external, uses-master, uses-template, uses-component, has-nav, links-to}
- `last_modified_by` ∈ {user, claude, extension}

---

## Programmatic rules (R31-R35)

Each rule has a severity level and check description. Implement in `/sitemap-validate`.

### R31 — Page must declare design system membership
**Severity**: warn (or error if any Design System nodes exist in sitemap)
**Check**:
```
For each page in application.pages:
  If sitemap.design_system has any masters/templates/navs/components:
    Assert page.uses_master is set → else ERROR
    Assert page.uses_template is set → else WARN
  Else:
    All Page DS fields are optional
```
**Reason**: Once a project adopts a Design System, every Page should declare its membership for consistency.

### R32 — API mirror consistency (sitemap ↔ md Section 3.3)
**Severity**: error
**Check**:
```
Parse Section 3.3 of design_doc_ref → extract list of (method, path) tuples → MD_APIS
For each api in application.apis:
  Assert (api.method, api.path) ∈ MD_APIS → else ERROR (sitemap has API not in md)
For each md_api in MD_APIS:
  Assert ∃ api in application.apis with (api.method, api.path) == md_api → else ERROR (md has API not in sitemap)
```
**Reason**: Section 3.3 is the human-readable source for module-grouped APIs; Section 9.5 / sitemap is the flat machine source. Both must match.

### R33 — source_file existence
**Severity**: warn (default), error (with `--strict`)
**Check**:
```
For each node with source_file field set:
  Assert file exists at workspace_root/source_file → else WARN/ERROR
```
**Reason**: Stale references degrade navigation/extension UX.

### R34 — No orphan edges
**Severity**: error
**Check**:
```
all_node_ids = union of all node.id from design_system.* and application.*
For each edge in edges:
  Assert edge.from ∈ all_node_ids → else ERROR
  Assert edge.to ∈ all_node_ids → else ERROR
```
**Reason**: Orphan edges break graph rendering and indicate stale data.

### R35 — Cross-doc artifact integrity
**Severity**: error
**Check**:
```
For each page in application.pages:
  For each mockup_path in page.linked_artifacts.mockups (if any):
    Parse mockup_list.json (if exists)
    Assert mockup_path ∈ mockup_list entries → else ERROR

  For each feature_ref in page.linked_artifacts.features (if any):
    Parse feature_list.json
    feature_id = feature_ref.split('#')[1]
    Assert feature_id ∈ feature_list IDs → else ERROR

  For each qa_ref in page.linked_artifacts.qa_scenarios (if any):
    Parse qa-tracker.json
    scenario_id = qa_ref.split('#')[1]
    Assert scenario_id ∈ qa-tracker scenarios → else ERROR
```
**Reason**: Cross-doc references must stay valid; broken refs cause drilldown failures.

---

## Integration with `/validate-design-doc`

When running `/validate-design-doc`, R31-R35 are appended to existing R1-R30 checks. Output:

```
Design Doc Validation:
  ✓ R1-R30 ........... 30 passed
  ✓ R31 (DS membership): 12 pages OK
  ✓ R32 (API mirror):    8 APIs match md ↔ sitemap
  ⚠ R33 (source_file):   2 stale references (src/Old.tsx, src/Removed.cs)
  ✓ R34 (orphan edge):   0 orphans
  ✗ R35 (artifact link): 1 broken — P-005.linked_artifacts.qa_scenarios has "qa-tracker.json#OLD-001" not found

Result: FAIL (1 error, 2 warnings)
```
