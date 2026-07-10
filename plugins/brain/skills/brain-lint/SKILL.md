---
name: brain-lint
description: "Run graph hygiene checks on Graph Brain — duplicate tags, metadata-in-tags, orphan notes, low link density, mirror notes, broken wikilinks, link suggestions, stale notes — then propose fixes and apply only what the user confirms.
  USE THIS SKILL when the user wants to check brain health, clean up tags, find orphan notes, or improve knowledge connections.
  Thai triggers: 'ตรวจสุขภาพ brain', 'lint brain', 'ล้าง tag', 'tag ซ้ำ', 'โน้ตกำพร้า', 'จัดระเบียบ brain'"
user_invocable: true
argument-hint: "[project] — scope note checks to one project; omit for global"
---

# Brain Lint

ALL responses MUST be in Thai language.

**Graph Protocol:** Follow `${CLAUDE_PLUGIN_ROOT}/GRAPH_PROTOCOL.md` — especially **§7 Lint Protocol (propose-don't-auto-execute)** and §2 Versioning Protocol for any note edit.

## Steps

1. **Run lint**
   - Call `mcp__graph-brain__brain-lint` (project="{argument}" if provided)
   - For a focused pass, pass `checks` subset — e.g. tag cleanup only: `["duplicate-tags", "metadata-tags"]`

2. **Present report (Thai)**
   - Group by severity: ⚠ warning → → suggestion → ℹ info
   - Per check: count + top findings + what fixing it would improve (ความถูกต้อง / connection / token)
   - duplicate-tags: separate "ชัดเจน" (e.g. `bugs`→`bug`) from "ต้องดูเอง" (e.g. `sonnet`↔`dotnet` — false positive)

3. **Propose fixes, ask user per Lint Protocol §7.2**
   - NEVER apply anything without explicit confirmation
   - Offer choices (Thai):
     - [1] Merge duplicate tags ที่เลือก (ระบุคู่)
     - [2] เพิ่ม wikilinks ตาม link-suggestions ที่เลือก
     - [3] จัดการ mirror notes (merge เข้าโน้ต synthesis)
     - [4] ดูรายละเอียด finding เพิ่ม
     - [5] ไม่ทำอะไร — รายงานอย่างเดียว

4. **Apply confirmed fixes**
   - Tag merges: `mcp__graph-brain__merge-tags` from/to per confirmed pair — report edges moved
   - Wikilinks: `mcp__graph-brain__get-knowledge` → append `[[Target Title]]` in a natural place (e.g. Related section) → `mcp__graph-brain__update-knowledge` with reason="brain-lint: add wikilink" (Versioning Protocol applies)
   - Mirror notes: fetch both notes → merge content into the synthesis note (update with reason) → tell user the mirror note can be archived (deletion/archive is manual — no MCP tool)
   - metadata-tags: point user to `POST /api/tags/migrate` on the server (handles the whole registry + preserves values on notes)

5. **Write activity log**
   - Append to `.brain/activity-log.json`: command="brain-lint", details={findings per check, fixes applied}
   - NEVER skip — lint history shows whether hygiene is improving between runs

## Reading the results

- **Targets (from improvement directive):** orphan notes < 5% of all notes; permanent notes average ≥ 3 outbound wikilinks; no tag pairs within edit distance ≤ 1
- Compare counts with the previous lint entry in activity log when available — report trend (ดีขึ้น/แย่ลง)
