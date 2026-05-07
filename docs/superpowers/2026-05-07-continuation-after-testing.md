# Continuation Guide — หลังทดสอบ v2.0 เสร็จ

> **เมื่อไหร่ใช้เอกสารนี้**: หลัง test slash commands บน fresh Claude Code session แล้วกลับมาทำงานต่อ — อาจจะใน session เดิม (continue conversation) หรือ session ใหม่ (resume)
>
> **Spec**: `docs/superpowers/specs/2026-05-07-system-design-doc-vscode-design.md`
> **Plan**: `docs/superpowers/plans/2026-05-07-sitemap-graph-system-design-doc-v2.md`
> **Branch**: `feature/sitemap-graph-vscode`

---

## 1. สถานะ Branch (snapshot ตอน 2026-05-07)

### Commits (18 commits, เรียงใหม่ → เก่า)

```
5655ca6 docs(tools): add dev-link/dev-unlink scripts + local testing guide
877669e test(sitemap): dogfood end-to-end with samples/dummy-shop
ae69446 feat(system-design-doc): bump v1.7 → v2.0 — sitemap.json + 8 commands + R31-R35
2b06e97 feat(validate): integrate R31-R35 sitemap validation
e5c9093 feat(sitemap): add /sitemap-graph, /sitemap-export commands
4a0dc51 feat(sitemap): add /sitemap-scan, /sync-sitemap, /sitemap-validate commands
97d100f feat(sitemap): add /sitemap-init, /sitemap-add-node, /sitemap-link commands
fc4c612 docs(sitemap): add R31-R35 cross-validation rules reference
2ccb804 docs(sitemap): add 8 node types reference
a43f918 feat(template): expand Section 9 with sub-sections 9.4-9.9
9e982ff feat(sitemap): add sitemap-template.json starter
523afab feat(sitemap): add JSON Schema draft-07 for sitemap.json
fa36814 test(sitemap): add valid + invalid fixtures (red phase)
9855ae0 test(sitemap): set up ajv-cli validation harness
a27c51d chore: remove deprecated plugins (flow-monitor, flow-monitor-vscode, ai-ui-test)
68c16f4 docs(plan): system-design-doc v2.0 implementation plan
32317e7 docs(design): self-review fixes — schema consistency
d498b35 docs(design): system-design-doc v2.0 + sitemap.json + VS Code extension data contract
```

### ผลที่ผ่าน automated tests แล้ว

| Check | สถานะ |
|---|---|
| Schema validates valid fixtures | ✅ pass |
| Schema rejects invalid fixtures (missing required) | ✅ pass |
| Dogfood `samples/dummy-shop/sitemap.json` validates | ✅ pass |
| 5 JSON files parse | ✅ pass |
| All 8 sitemap commands exist | ✅ pass |
| plugin.json version = 2.0.0 | ✅ pass |
| Deprecated plugins removed (flow-monitor*, ai-ui-test) | ✅ pass |
| Cross-task consistency (test_cases_count, R31-R35, IDs) | ✅ pass |

### ที่ต้องทดสอบด้วยมือ (manual)

ต้อง test slash commands ทำงานจริงใน fresh Claude Code session — ดู `docs/local-testing-guide.md`

---

## 2. กรอกผลการทดสอบ (template)

> **กรอกตรงนี้หลังทดสอบเสร็จ** — ใช้เป็นบันทึก + reference ให้ Claude session ถัดไป

### Test environment

- **Test folder**: `D:\GitHub\_______________`
- **Test date**: `2026-__-__`
- **Branch checked out**: `feature/sitemap-graph-vscode` ✓
- **dev-link active**: yes / no
- **Plugin loaded จากที่ไหน**: cache junction → `D:\GitHub\AgentMarketPlace\plugins\system-design-doc`

### Test results

| Step | คำสั่ง | ผลที่คาดหวัง | ผลจริง | Status |
|------|--------|----|----|--------|
| 1 | `/help system-design-doc` | เห็น 8 commands ใหม่ | | ☐ pass / ☐ fail |
| 2 | `/sitemap-init` | สร้าง `.design-docs/sitemap.json` | | ☐ pass / ☐ fail |
| 3 | `/sitemap-add-node master name="AdminLayout"` | สร้าง MP-001 | | ☐ pass / ☐ fail |
| 4 | `/sitemap-add-node page name="..." url="/..."` | สร้าง P-001 | | ☐ pass / ☐ fail |
| 5 | `/sitemap-add-node api method=GET path=/api/...` | สร้าง API-001 | | ☐ pass / ☐ fail |
| 6 | `/sitemap-add-node middleware name="JwtAuth" type=auth` | สร้าง MW-001 | | ☐ pass / ☐ fail |
| 7 | `/sitemap-link from=P-001 to=API-001 type=calls` | เพิ่ม edge | | ☐ pass / ☐ fail |
| 8 | `/sitemap-validate` | report 5 rules | | ☐ pass / ☐ fail |
| 9 | `/sitemap-graph` | render Mermaid ใน Section 9.8 | | ☐ pass / ☐ fail |
| 10 | `/sync-sitemap` | sync md ↔ json | | ☐ pass / ☐ fail |

### หมายเหตุ / ข้อสังเกต

```
[เขียนสิ่งที่พบที่ต้องแก้ไขหรือปรับปรุง]


```

---

## 3. Decision Tree — เลือกทางไปต่อ

```
Test ผ่านทุกข้อ? ─yes─→ Path A (Merge / PR)
       │
       no
       ↓
ปัญหาเล็กน้อย แก้ markdown ได้? ─yes─→ Path B (Patch + commit)
       │
       no — เป็นปัญหา design
       ↓
ทำใหม่บางส่วน? ─yes─→ Path C (Reopen plan)
       │
       no — ไม่อยาก merge
       ↓
                       Path D (Keep / Discard)
```

---

## Path A — Test ผ่านหมด → **Merge หรือ PR**

### A1. Merge to main locally (เร็ว, ทีมเดียว)

```bash
cd D:\GitHub\AgentMarketPlace
git checkout main
git pull
git merge feature/sitemap-graph-vscode

# (Optional) update marketplace.json system-design-doc version 1.7.0 → 2.0.0
# Edit .claude-plugin/marketplace.json — find system-design-doc entry, change version field
git add .claude-plugin/marketplace.json
git commit -m "chore(marketplace): bump system-design-doc to 2.0.0"

git push
git branch -d feature/sitemap-graph-vscode

# Cleanup local symlink (if dev-link still active)
tools\dev-unlink.bat system-design-doc
```

### A2. Push + Pull Request (มี reviewer)

```bash
git push -u origin feature/sitemap-graph-vscode

gh pr create --title "feat(system-design-doc): v2.0 — sitemap.json + 8 commands + 4 views" --body "$(cat <<'EOF'
## Summary

Major bump system-design-doc v1.7 → v2.0 introducing machine-readable sitemap.json schema + 8 new slash commands + 5 cross-validation rules + Section 9 expansion. Sub-project B (VS Code extension) deferred to next spec.

- Spec: `docs/superpowers/specs/2026-05-07-system-design-doc-vscode-design.md`
- Plan: `docs/superpowers/plans/2026-05-07-sitemap-graph-system-design-doc-v2.md`

## Major changes

- 8 new node types (Master/Template/Nav/Component + Page/API/Middleware/External)
- `.design-docs/sitemap.json` schema (JSON Schema draft-07)
- 8 new commands: `/sitemap-init`, `/sitemap-add-node`, `/sitemap-link`, `/sitemap-scan`, `/sync-sitemap`, `/sitemap-validate`, `/sitemap-graph`, `/sitemap-export`
- Section 9 markdown template expanded (9.4-9.9)
- 5 new cross-validation rules (R31-R35)
- Removed deprecated plugins: flow-monitor, flow-monitor-vscode, ai-ui-test
- Added `tools/dev-link.bat` + `dev-unlink.bat` for local plugin testing

## Test plan

- [x] Schema validates 3 fixtures (1 valid + 2 invalid)
- [x] Dogfood `samples/dummy-shop/` validates
- [x] Manual run-through 10 commands on test project (fill in result here)
- [ ] Update marketplace.json after merge

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

หลัง PR merged: ทำตาม A1 ตั้งแต่ "update marketplace.json"

---

## Path B — เจอปัญหาเล็กๆ → **Patch + commit เพิ่ม**

### ตัวอย่างปัญหา + วิธีแก้

| ปัญหาที่อาจเจอ | ไฟล์ที่ต้องแก้ | วิธีแก้ |
|---|---|---|
| `/sitemap-init` ไม่อ่าน `design_doc_list.json` ตอนหา `project_name` | `commands/sitemap-init.md` Step 2 | ปรับ wording ให้ Claude อ่านชัดขึ้น (เพิ่มตัวอย่าง JSON path) |
| `/sitemap-add-node page` ลืม set `access_level` | `commands/sitemap-add-node.md` Step 3 | เพิ่ม fallback "User" เป็น default |
| `/sitemap-validate` รายงาน R32 error เพราะ md format ต่างจาก spec | `commands/sitemap-validate.md` Step 3 | ทำให้ regex parse Section 3.3 ยืดหยุ่นขึ้น |
| Mermaid graph จาก `/sitemap-graph` ไม่ render | `commands/sitemap-graph.md` Step 4 | แก้ classDef syntax (Mermaid `class` ใช้ comma-separated) |

### Workflow แก้

```bash
cd D:\GitHub\AgentMarketPlace
# (อาจ dev-link อยู่ก็ได้ — แก้ตรงไฟล์ใน plugins/...)

# แก้ไฟล์ที่จำเป็น
# ทดสอบใน fresh Claude session อีกรอบ

git add plugins/system-design-doc/...
git commit -m "fix(sitemap): <ระบุการแก้>"

# Test ซ้ำจนผ่าน → ไป Path A
```

---

## Path C — ปัญหาใหญ่ → **Reopen plan + redo บางส่วน**

ถ้าเจอ:
- Schema ออกแบบมาผิด (ต้องเพิ่ม/ลบ field)
- คำสั่งทำงานคนละทิศทางกับ workflow ที่ใช้จริง
- Validation rules ทำให้ false positive เยอะเกินไป

วิธีจัดการ:

```bash
# 1. ทำ branch ใหม่ ต่อจากปัจจุบัน (ไม่ลบของเดิม — รักษาไว้ reference)
git checkout -b feature/sitemap-graph-vscode-v2

# 2. แก้ spec ก่อน
#    docs/superpowers/specs/2026-05-07-system-design-doc-vscode-design.md
#    → ระบุชัดว่ามีอะไรเปลี่ยนไปจาก v1, why

# 3. แก้ plan
#    docs/superpowers/plans/2026-05-07-sitemap-graph-system-design-doc-v2.md
#    → เพิ่ม task ที่ต้อง redo

# 4. Resume กับ Claude:
#    เปิด Claude Code, อ่าน docs/superpowers/2026-05-07-continuation-after-testing.md (ไฟล์นี้)
#    บอก Claude: "Resume from continuation guide — entered Path C, redo schema field X"
```

---

## Path D — ไม่ merge → **Keep หรือ Discard**

### D1. Keep branch as-is (กลับมาตัดสินใจทีหลัง)

```bash
# ไม่ทำอะไร — branch อยู่ตามเดิม
git checkout main   # ออกจาก feature branch แต่ไม่ลบ
tools\dev-unlink.bat system-design-doc   # restore plugin cache เดิม
```

ภายหลังกลับมาใช้:
```bash
git checkout feature/sitemap-graph-vscode
tools\dev-link.bat system-design-doc
```

### D2. Discard ทั้งหมด

> ⚠️ **destructive — ลบ commit ทั้ง 18 ตัวบน branch นี้**

```bash
tools\dev-unlink.bat system-design-doc   # restore cache เดิมก่อน

cd D:\GitHub\AgentMarketPlace
git checkout main
git branch -D feature/sitemap-graph-vscode

# Spec/plan ยังอยู่ (commit บน main? — ไม่ใช่ — อยู่บน branch ที่เพิ่งลบ)
# ถ้าต้องการเก็บ spec/plan ไว้ดูทีหลัง — copy ออกก่อนลบ branch
```

---

## 4. Resume Claude Code Session ใหม่

ถ้า Claude session เก่าหมด context หรือคุณเปิดใหม่:

### ขั้นตอน

1. เปิด Claude Code ใน `D:\GitHub\AgentMarketPlace`
2. พิมพ์ prompt นี้ (copy-paste ได้เลย):

```
ฉันมาทำงานต่อโครงการ system-design-doc v2.0
อ่านเอกสาร 3 ตัวนี้ตามลำดับ:

1. docs/superpowers/specs/2026-05-07-system-design-doc-vscode-design.md
   (spec ที่ approved แล้ว)

2. docs/superpowers/plans/2026-05-07-sitemap-graph-system-design-doc-v2.md
   (plan 15 tasks — ทำเสร็จหมดทุก task แล้ว)

3. docs/superpowers/2026-05-07-continuation-after-testing.md
   (สถานะปัจจุบัน + decision tree)

ฉันเพิ่งทำการทดสอบเสร็จ — ผลคือ [Path A / B / C / D]
รายละเอียด: [กรอกผลตามที่กรอกใน continuation doc Section 2]

โปรดทำขั้นตอนถัดไปตาม Path ที่ระบุ
```

3. Claude จะอ่านเอกสารทั้ง 3 → รับช่วงงานต่อตาม path ที่ระบุ

### ข้อควรรู้สำหรับ Claude session ใหม่

- Branch ปัจจุบัน: `feature/sitemap-graph-vscode` (18 commits ahead of main)
- Working tree: clean (ยกเว้น `.claude/settings.local.json` pre-existing)
- Plugin version: 2.0.0 (ใน plugins/system-design-doc/.claude-plugin/plugin.json)
- Marketplace.json version ใน `.claude-plugin/marketplace.json` ยัง = 1.7.0 — **ต้อง bump เป็น 2.0.0** ตอน merge (Path A)
- Spec + plan + dogfood sample ทั้งหมด commit แล้ว
- Sub-project B (VS Code extension) **ยังไม่ทำ** — รอ spec แยก

---

## 5. Quick Reference

### ไฟล์สำคัญ

| ประเภท | Path |
|---|---|
| **Spec** | `docs/superpowers/specs/2026-05-07-system-design-doc-vscode-design.md` |
| **Plan** | `docs/superpowers/plans/2026-05-07-sitemap-graph-system-design-doc-v2.md` |
| **Continuation** | `docs/superpowers/2026-05-07-continuation-after-testing.md` (ไฟล์นี้) |
| **JSON Schema** | `plugins/system-design-doc/skills/system-design-doc/references/sitemap-schema.json` |
| **Template** | `plugins/system-design-doc/skills/system-design-doc/templates/sitemap-template.json` |
| **Markdown template** | `plugins/system-design-doc/skills/system-design-doc/templates/design-doc-template.md` (Sections 9.4-9.9) |
| **Reference: 8 node types** | `plugins/system-design-doc/skills/system-design-doc/references/node-types.md` |
| **Reference: R31-R35** | `plugins/system-design-doc/skills/system-design-doc/references/sitemap-validation-rules.md` |
| **8 commands** | `plugins/system-design-doc/commands/sitemap-*.md` (8 ไฟล์) |
| **Test fixtures** | `tests/sitemap/fixtures/{valid,invalid}/*.json` |
| **Dogfood sample** | `samples/dummy-shop/.design-docs/` |
| **Plugin manifest** | `plugins/system-design-doc/.claude-plugin/plugin.json` (version 2.0.0) |
| **Marketplace manifest** | `.claude-plugin/marketplace.json` (ยัง 1.7.0 — ต้อง bump) |
| **Local testing tools** | `tools/dev-link.bat`, `tools/dev-unlink.bat` |
| **Local testing guide** | `docs/local-testing-guide.md` |

### Key commits

| SHA | Purpose |
|---|---|
| `d498b35` | Initial spec |
| `68c16f4` | Implementation plan |
| `a27c51d` | Plugin cleanup (start of implementation) |
| `523afab` | JSON Schema landed |
| `ae69446` | Plugin v1.7 → v2.0 bump |
| `877669e` | Dogfood sample |
| `5655ca6` | dev-link tools (latest commit) |

### Schema field reference (อย่าจำผิด)

- `linked_artifacts.test_cases_count` (NOT `test_cases`)
- `last_modified_by` enum: `user | claude | extension`
- ID prefixes: `MP-`, `TPL-`, `NAV-`, `CMP-`, `P-`, `API-`, `MW-`, `EXT-`
- ID format: 3-digit zero-padded (e.g., `P-001`, `API-005`)
- Edge types (8): `calls`, `guarded-by`, `calls-external`, `uses-master`, `uses-template`, `uses-component`, `has-nav`, `links-to`

### npm tests

```bash
cd tests/sitemap
npm run validate           # validates fixtures/valid/*.json against schema
```

---

## 6. Sub-project B (สำหรับเฟสถัดไป — ไม่อยู่ใน plan ปัจจุบัน)

**Sub-project B = VS Code extension ใหม่** ที่อ่าน `sitemap.json` + แสดง 4 views (Tree / Graph / Drilldown / Sequence) + AI orchestrator

ตอนเริ่ม phase B ใหม่:

1. เปิด Claude Code ใน `D:\GitHub\AgentMarketPlace`
2. พิมพ์: `ฉันต้องการเริ่ม sub-project B — VS Code extension สำหรับ sitemap.json`
3. ใช้ `superpowers:brainstorming` เพื่อ design VS Code extension architecture
4. spec ใหม่: `docs/superpowers/specs/<date>-sitemap-vscode-extension-design.md`
5. plan ใหม่: `docs/superpowers/plans/<date>-sitemap-vscode-extension.md`

Schema ของ sub-project A (sitemap.json) **รองรับ B แล้ว** — ไม่ต้องแก้ schema ตอน implement extension

`available_actions` field, `stage_status` field, `linked_artifacts` field ทั้งหมดออกแบบไว้รองรับ extension แล้ว

---

## End

ใช้เอกสารนี้เป็น **single source of truth** หลัง testing — กรอก Section 2 → ตัดสินใจ Path → ทำตามขั้นตอน
