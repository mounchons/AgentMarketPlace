---
description: สแกน code changes/commits ที่ทำนอก long-running flow (orphan) → เสนอ /add-feature หรือ /edit-feature เพื่อปิด traceability gap
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Grep(*), Glob(*)
---

# /scan-changes — Detect Out-of-Workflow Code Changes

ค้นหา code changes ที่เกิดขึ้นโดยไม่ผ่าน `/continue`, `/add-feature`, หรือ `/edit-feature`
แล้วเสนอ command ที่เหมาะสมเพื่อปิด traceability gap ใน `feature_list.json`

> **ทำไมต้องมี?** Long-running v2.6.0 มี enforcement ทาง downstream (Verification Pipeline + 3 Release Gates ใน `/continue` Step 5.5/5.6) แต่ไม่มีการตรวจ **upstream** — ถ้า user แก้ code โดยตรง (manual edit, hot-fix, UI tweak) `feature_list.json` จะ out-of-sync กับ codebase

## ⚠️ CRITICAL RULES (MUST FOLLOW)

1. **Read-only on git** — ไม่แตะ git history (no rebase, no reset, no amend)
2. **No auto-commit** — เสนออย่างเดียว ให้ user เลือก action เอง
3. **อ่านทั้งหมดก่อนตัดสิน** — ต้อง read feature_list.json + git status + git log + ตัวไฟล์ที่เปลี่ยน ก่อน classify
4. **ใช้ AskUserQuestion** — ไม่ตัดสินแทน user
5. **Reverse-map ครบทุก path** — ตรวจทั้ง `subtasks[].files[]` และ `references[]` ก่อนสรุปว่า "orphan"

### 🔍 Self-Check Checklist (MANDATORY before submitting output)

- [ ] อ่าน feature_list.json ทั้งไฟล์?
- [ ] รัน git status + git log ครบ scope ที่ user ขอ?
- [ ] Reverse-map ทุกไฟล์ที่เปลี่ยนกับ subtasks[].files[]?
- [ ] Classify ครบ 4 หมวด (uncommitted / orphan-commit / mapped / pending-design)?
- [ ] เสนอ action ที่เหมาะสมสำหรับแต่ละหมวด?
- [ ] ถาม user ผ่าน AskUserQuestion?

ถ้าข้อใด unchecked → DO NOT submit

### ❌ Output Rejection Criteria

- Skip การ reverse-map (สรุปว่า orphan โดยไม่ตรวจ subtasks.files)
- ลบ/แก้ git history
- Auto-create feature ทั้งที่ user ยังไม่ตอบ
- Mark feature เป็น passes=true จากการแก้ code นอก workflow (ต้องผ่าน `/continue` Step 5.5/5.6 เท่านั้น)

---

## Usage

```
/scan-changes                          # scan ครบทุกหมวด (default)
/scan-changes --uncommitted-only       # เฉพาะ working tree
/scan-changes --since=HEAD~10          # เฉพาะ 10 commits ล่าสุด
/scan-changes --since=2026-05-01       # ตั้งแต่วันที่นี้
/scan-changes --feature 5              # เฉพาะที่กระทบ feature #5
/scan-changes --report-only            # ไม่ถาม user, แค่รายงาน
/scan-changes --auto-suggest           # auto-pick action ที่ confidence สูงสุด (ยังต้อง confirm)
/scan-changes --no-ignore              # (v2.7.1) ปิด default + custom ignore
/scan-changes --include=<pattern>      # (v2.7.1) override ignore สำหรับ pattern เฉพาะ
/scan-changes --include-legacy         # (v2.7.1) include commits ก่อน feature_list.created_at
```

---

## Input ที่ได้รับ

```
$ARGUMENTS
```

**Parse arguments:**
- `--uncommitted-only` → scope = working tree เท่านั้น
- `--since=<ref>` → scope = commits ตั้งแต่ ref นั้น
- `--feature <id>` → filter เฉพาะ feature นั้น
- `--report-only` → ไม่ถาม user
- `--auto-suggest` → ใช้ rule-based picker หา action ที่ confidence สูงสุด (ยังต้อง confirm)

---

## ขั้นตอนที่ต้องทำ

### Step 1: ตรวจ environment

```bash
# 1. Verify long-running ถูก init
test -f feature_list.json && echo "FEATURE_LIST_OK" || { echo "❌ ไม่พบ feature_list.json — รัน /init ก่อน"; exit 1; }

# 2. Verify อยู่ใน git repo
git rev-parse --git-dir > /dev/null 2>&1 || { echo "❌ ไม่ใช่ git repository"; exit 1; }

# 3. Read feature_list summary
cat feature_list.json | jq '.summary'
```

**ถ้าไม่พบ feature_list.json:** แจ้ง user ให้รัน `/init` ก่อน

---

### Step 2: รวบรวม changes (ตาม scope)

#### 2.1 Uncommitted changes (working tree)

```bash
# Modified + new files
git status --porcelain | head -100

# Diff stat
git diff --stat HEAD
git diff --stat --staged
```

แยกประเภท:
- `M ` = modified
- `A ` หรือ `??` = added/untracked
- `D ` = deleted
- `R ` = renamed

#### 2.2 Recent commits (จาก scope)

```bash
# ดู commits ตั้งแต่ since (default = HEAD~20)
SINCE="${1:-HEAD~20}"
git log --oneline --no-merges "$SINCE..HEAD" | head -50

# ดู files ต่อ commit + timestamp (สำคัญสำหรับ legacy cutoff)
git log --name-only --pretty=format:"COMMIT:%H|%cI|%s" "$SINCE..HEAD"
```

**🆕 v2.7.1 — Legacy Commit Cutoff**

Commits ที่เกิดก่อน `feature_list.json.created_at` = **legacy** (ไม่ใช่ orphan)
เหตุผล: ก่อน long-running ถูก init ใน repo นี้ commits ทุกตัวเป็น historical baseline — flag ทุกตัวเป็น orphan = noise

```bash
# ดึง cutoff timestamp
CUTOFF=$(cat feature_list.json | jq -r '.created_at')
echo "Legacy cutoff: $CUTOFF"

# Classify commit by timestamp
# commit_time < CUTOFF → legacy
# commit_time >= CUTOFF → eligible for tracked/orphan check
```

**Algorithm (per commit):**

```python
def classify_commit_age(commit_time_iso, cutoff_iso, include_legacy=False):
    if commit_time_iso < cutoff_iso:
        if include_legacy:
            return "legacy_included"  # treat as eligible
        else:
            return "legacy_skipped"   # informational only
    return "in_scope"
```

**Default:** legacy commits ไม่ถูก count ใน traceability score และไม่แนะนำ action
**Override:** `/scan-changes --include-legacy` → treat ทุก commit ว่าอยู่ใน scope (แล้วเช็ค prefix ปกติ)

#### 2.3 Pending design updates (จาก feature_list)

```bash
# ดู feature ที่มี pending_updates ค้างอยู่
cat feature_list.json | jq '
  .features[] |
  select(.design_doc_refs.pending_updates != null and (.design_doc_refs.pending_updates | length) > 0) |
  {id, description, pending: .design_doc_refs.pending_updates}
'
```

#### 2.4 Apply ignore patterns (v2.7.1) ⭐

หลังจากรวบรวม changes ทั้งหมด → filter ทิ้งไฟล์/folders ที่ไม่ควรถูก track

**Default ignore list** (apply ก่อน user-defined):

```
# Claude Code tooling
.claude/
.claude.json

# Editor configs
.vscode/
.idea/
*.swp
*.swo

# Build artifacts
node_modules/
dist/
build/
out/
target/
bin/
obj/
.next/
.nuxt/

# Package manager locks (เปลี่ยนบ่อยแต่ไม่ใช่ feature work)
*.lock
package-lock.json
yarn.lock
pnpm-lock.yaml

# Long-running internal
.agent/
feature_list.json

# OS junk
.DS_Store
Thumbs.db
desktop.ini

# Logs
*.log
logs/

# Env / secrets (ห้าม commit อยู่แล้ว แต่ skip เผื่อ)
.env
.env.local
*.pem
```

> **Note:** `.agent/` และ `feature_list.json` ถูก ignore เพราะเป็น metadata — แม้จะถูก track ผ่าน Feature #1 subtask 1.4 แต่การแก้ทุกครั้งหลังจากนั้นไม่ควรนับเป็น orphan/mapped (มันเป็น tooling เอง)

**Custom ignore via `.agent/scan-ignore`** (optional):

```bash
# ตรวจ custom ignore
test -f .agent/scan-ignore && echo "FOUND_CUSTOM_IGNORE" || echo "USE_DEFAULT_ONLY"

# ตัวอย่างเนื้อหา .agent/scan-ignore
# (ใช้ gitignore syntax)
docs/temp/
**/*.generated.cs
scripts/local-only.sh
!scripts/important.sh    # negation: ไม่ ignore
```

**Algorithm:**

```python
def is_ignored(path, default_patterns, custom_patterns):
    # 1. Apply default patterns first
    for pat in default_patterns:
        if matches_glob(path, pat):
            return True
    # 2. Apply custom patterns (support negation)
    ignored = False
    for pat in custom_patterns:
        if pat.startswith('!'):
            if matches_glob(path, pat[1:]):
                ignored = False  # negation un-ignores
        else:
            if matches_glob(path, pat):
                ignored = True
    return ignored
```

**Override flag:**
- `/scan-changes --no-ignore` → ปิด default + custom (รายงานทุกอย่าง)
- `/scan-changes --include=<pattern>` → เพิ่ม override เฉพาะ pattern (e.g., `--include=.claude/`)

**Output ของ Step 2.4:**

```
🚫 Ignored: 12 paths
   .claude/settings.local.json (default: .claude/)
   .agent/progress.md (default: .agent/)
   feature_list.json (default)
   node_modules/foo (default)
   ...
```

ส่ง paths ที่เหลือ (post-filter) ไปยัง Step 3 reverse-map

---

### Step 3: Reverse-map ไฟล์ → feature

สำหรับแต่ละไฟล์ที่เปลี่ยน (ทั้ง uncommitted + commits) → หาว่าเคยผูกกับ feature ไหน

```bash
# Build file → feature index จาก feature_list.json
cat feature_list.json | jq -r '
  .features[] |
  . as $f |
  (.subtasks[]? | .files[]?) as $file |
  "\($file)|\($f.id)|\($f.description)|\($f.passes)|\($f.status)"
' > /tmp/file-to-feature.tsv

# Index จาก references[] ด้วย
cat feature_list.json | jq -r '
  .features[] |
  . as $f |
  .references[]? as $ref |
  "\($ref)|\($f.id)|\($f.description)|\($f.passes)|\($f.status)"
' >> /tmp/file-to-feature.tsv
```

**Matching rule:**
1. **Exact path match** — `subtasks.files[]` มี path ตรงกับไฟล์ที่เปลี่ยน → high confidence
2. **Prefix match** — path prefix ตรง (เช่น `src/components/Login.tsx` กับ `src/components/Login*`) → medium confidence
3. **Glob match** — references[] เช่น `.mockups/login.mockup.md` → low confidence (ใช้เป็น hint)
4. **No match** → orphan

---

### Step 4: Classify ทุก change

แต่ละ change → ใส่หมวดใดหมวดหนึ่ง:

| หมวด | เงื่อนไข | Suggested Action |
|------|---------|------------------|
| **🟢 Tracked** | commit prefix `task(#X.Y):`/`feat: Feature #X`/`review-fix(#X):` ตรงกับ feature ใน list | ไม่ต้องทำอะไร |
| **🟦 Legacy (v2.7.1)** | commit timestamp < feature_list.created_at | informational only (ไม่ count score, ไม่ suggest action) |
| **🟡 Mapped (passed)** | ไฟล์ map ได้ → feature ที่ `passes=true` | `/edit-feature [id] - [change summary]` |
| **🟡 Mapped (in-progress)** | ไฟล์ map ได้ → feature ที่ `status=in_progress` | `/continue [id]` (commit ตามปกติ) |
| **🔴 Orphan (uncommitted)** | working tree change ที่ไม่ map กับ feature ใด | `/add-feature [description]` หรือ map manual |
| **🔴 Orphan (commit)** | commit ที่ไม่มี marker prefix และไฟล์ไม่ map (และ **ไม่ใช่ legacy**) | สร้าง retroactive feature → `/add-feature` (notes: "retroactive — commit abc123") |
| **⚠️ Pending design** | feature.design_doc_refs.pending_updates[] ยังไม่ resolve | `/edit-section` (system-design-doc) แล้วค่อย `/sync-with-features` |

**Commit prefix detection:**
```bash
# Patterns ที่ถือว่า "tracked"
TRACKED_PATTERNS=(
  '^task\(#[0-9]+(\.[0-9]+)?\):'      # task(#5.1): ...
  '^feat: Feature #[0-9]+'            # feat: Feature #5 - ...
  '^review-fix\(#[0-9]+(\.[0-9]+)?\)' # review-fix(#5): ...
  '^wip(\(#[0-9]+\))?:'                # wip: ... (optional)
)
```

**ถ้า commit message ไม่ match pattern ใด → orphan-commit**

---

### Step 5: แสดงรายงาน

```
🔍 Scan Changes Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Scope: [working tree + commits HEAD~20..HEAD]
📅 Generated: [timestamp]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟢 Tracked (no action needed): N changes
   ✓ commit abc1234 "task(#5.2): ...", file foo.cs → Feature #5
   ✓ commit def5678 "feat: Feature #6 - ...", 3 files → Feature #6

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟡 Mapped to existing features: N changes

   [Feature #5 — passes=true] "GET /api/users"
   ▸ Modified: src/UsersController.cs (uncommitted)
     → Suggest: /edit-feature 5 - [describe change]

   [Feature #7 — status=in_progress] "Login page"
   ▸ Modified: src/components/Login.tsx (uncommitted)
     → Suggest: /continue 7 (commit normally as task(#7.X))

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟦 Legacy commits (v2.7.1): N commits (informational, ไม่ count score)
   ▸ commit abc1234 (2026-04-15) "feat(auth): ..."
   ▸ commit def5678 (2026-04-20) "fix: ..."
   → ก่อน feature_list.created_at — ใช้ --include-legacy เพื่อ flag retroactive

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 Orphan changes (no feature link): N changes

   [Uncommitted]
   ▸ src/styles/global.css (modified) — UI tweak?
   ▸ src/utils/helpers.ts (added)

   [Orphan commits — no marker prefix]
   ▸ commit ghi9012 "fix typo" — 1 file
   ▸ commit jkl3456 "WIP refactor" — 5 files

   → Suggest: /add-feature [description]
     หรือ retroactively map: /add-feature [desc] --retroactive=ghi9012

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ Pending design doc syncs: N items

   Feature #12 has 2 pending_updates:
   - add-api: "POST /api/users/avatar"
   - update-sequence-diagram: "SEQ-001"
   → Suggest: /edit-section api-endpoints  (system-design-doc)
              /sync-with-features (after edit)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Summary:
   Total changes scanned: N
   Tracked: X (Y%)
   Mapped (need /edit-feature or /continue): A
   Orphan (need /add-feature): B
   Pending design syncs: C
   Legacy commits (excluded): L
   Ignored (default + custom): I

   Traceability score: [X+(A*0.5)] / [X+A+B] = NN%
   (legacy + ignored ไม่ถูก count ใน denominator)
```

---

### Step 6: ถาม user (skip ถ้า `--report-only`)

ใช้ `AskUserQuestion` เสนอ action ทีละหมวด:

**Question 1 — สำหรับ Mapped changes:**
```
พบ N changes ที่ผูกกับ feature ที่ passes=true แล้ว — ทำอย่างไร?
[1] รัน /edit-feature ตามรายการที่เสนอ (สร้าง edit feature ใหม่ supersedes ของเก่า)
[2] Skip — รับทราบแต่ไม่ทำอะไร
[3] เลือกทีละ feature
```

**Question 2 — สำหรับ Orphan changes:**
```
พบ N changes ที่ไม่ผูกกับ feature ใด — ทำอย่างไร?
[1] รัน /add-feature ทีละรายการ (สร้าง feature ใหม่ + map ไฟล์)
[2] Bulk: สร้าง feature เดียวรวม changes ที่เกี่ยวข้อง
[3] Skip — รับทราบ
[4] Retroactive map: ระบุ feature.id เดิมที่ควรเป็นเจ้าของ
```

**Question 3 — สำหรับ Pending design:**
```
พบ N pending design syncs — ทำอย่างไร?
[1] รัน /edit-section + /sync-with-features ตามที่ระบุ
[2] Skip — เก็บ pending ไว้ก่อน
```

---

### Step 7: ดำเนินการตามคำตอบ

#### ถ้า user เลือก "/edit-feature" → ส่ง suggestion ให้ user รัน

```
✅ ผม suggest แล้ว — กรุณารัน command ต่อไปนี้:

   /edit-feature 5 - update validation logic per src/UsersController.cs (uncommitted)
   /edit-feature 7 - refactor login form per src/components/Login.tsx

   หลังจากรันเสร็จ → /scan-changes ใหม่เพื่อ verify
```

> **หมายเหตุ:** ไม่เรียก /edit-feature อัตโนมัติ — เพราะ /edit-feature มี logic AskUserQuestion ของตัวเอง (design doc impact check) — ต้องให้ user เป็นผู้ trigger

#### ถ้า user เลือก "/add-feature" → ส่ง suggestion

```
✅ Suggest /add-feature commands:

   /add-feature UI tweak - global.css (orphan: src/styles/global.css)
   /add-feature retroactive feat - commit ghi9012 fix typo
```

#### ถ้า user เลือก "Bulk add"

ใช้ AskUserQuestion ขอ:
- Description รวม
- Priority (high/medium/low)
- Category

แล้ว suggest single `/add-feature` พร้อม description รวมและ note `references` ระบุไฟล์ทั้งหมด

#### ถ้าต้อง update design doc

```
✅ Suggest:
   /edit-section api-endpoints   → เพิ่ม POST /api/users/avatar
   /edit-section sequence         → อัพเดต SEQ-001
   /sync-with-features            → sync กลับเข้า feature_list
```

---

### Step 8: Update progress log

เพิ่มลง `.agent/progress.md`:

```markdown
---

## Session N - SCAN CHANGES
**Date**: TIMESTAMP
**Type**: Scan / Audit

### Scope:
- [working tree + commits HEAD~20..HEAD]

### Findings:
- 🟢 Tracked: X changes
- 🟡 Mapped: A (suggested /edit-feature for #5, #7)
- 🔴 Orphan: B (suggested /add-feature x N)
- ⚠️ Pending design: C

### Actions taken:
- Listed suggestions for user
- User accepted: [list of accepted suggestions]
- User skipped: [list of skipped]

### Traceability score:
- Before: X%
- After (estimated): Y% (assuming user runs all suggested commands)

---
```

---

## Output Format (สรุป)

```markdown
# 🔍 Scan Changes Report

## Summary
- Total changes: N
- Tracked: X (no action)
- Mapped: A (need /edit-feature or /continue)
- Orphan: B (need /add-feature)
- Pending design: C
- Traceability score: NN%

## Suggested Actions

### Mapped (passed features)
1. /edit-feature 5 - [auto-generated change summary]
2. /edit-feature 7 - [auto-generated change summary]

### Mapped (in-progress)
1. /continue 8 (commit task(#8.X))

### Orphan
1. /add-feature [description from change] — files: [list]
2. /add-feature [description] --retroactive=[commit-hash]

### Pending design
1. /edit-section api-endpoints
2. /sync-with-features

## Next Steps
- รัน suggested commands ทีละตัว
- รัน /scan-changes ใหม่เพื่อ verify traceability score เพิ่มขึ้น
```

---

## ตัวอย่างการใช้งาน

### Example 1: หลังจากแก้ UI ตรงๆ

**สถานการณ์:** User แก้ `src/components/Header.tsx` โดยตรงเพราะเห็น margin ผิด

```bash
$ /scan-changes
```

**Output:**
```
🟡 Mapped to existing features: 1

  [Feature #4 — passes=true] "Create header component"
  ▸ Modified: src/components/Header.tsx (uncommitted)
    → Suggest: /edit-feature 4 - fix header margin (UI fix)
```

**User accepts → รัน `/edit-feature 4 - fix header margin (UI fix)`**

→ สร้าง Feature #N+1 ที่ supersedes #4 พร้อม category="ui-fix"
→ commit ผ่าน `/continue` ตามปกติ → traceability ครบ

---

### Example 2: Hot-fix ที่ commit ไปแล้วโดยไม่มี prefix

**สถานการณ์:** Production hot-fix `commit ghi9012 "fix login bug"` ไม่มี prefix

```bash
$ /scan-changes --since=HEAD~5
```

**Output:**
```
🔴 Orphan commits: 1

  ▸ commit ghi9012 "fix login bug" — 2 files
    src/auth/login.ts
    src/auth/validators.ts

  Reverse-map: src/auth/login.ts → Feature #7 (passes=true) "Login page"

  → Hybrid suggestion:
    [a] /edit-feature 7 - hot-fix from commit ghi9012
        (สร้าง edit-feature retroactive)
    [b] /add-feature hot-fix login bug --retroactive=ghi9012
        (สร้าง feature ใหม่ + link commit)
```

**User เลือก [a] → /edit-feature 7 - hot-fix from commit ghi9012**

→ Feature ใหม่อ้างอิง commit + supersedes #7

---

### Example 3: Refactor หลายไฟล์โดยไม่มี feature

**สถานการณ์:** User refactor `src/utils/*` 8 ไฟล์ ยังไม่ commit

```bash
$ /scan-changes --uncommitted-only
```

**Output:**
```
🔴 Orphan (uncommitted): 8 files

  ▸ src/utils/format.ts
  ▸ src/utils/validators.ts
  ▸ src/utils/api.ts
  ▸ ... (5 more)

  No feature mapping found.

  → Suggestions:
    [bulk] /add-feature refactor utils module — 8 files
    [individual] /add-feature ทีละไฟล์
```

**User เลือก [bulk] → /add-feature refactor utils module**

→ 1 feature ครอบ 8 ไฟล์, references list ครบ

---

## When to Use /scan-changes

| Scenario | ใช้ /scan-changes? |
|----------|-------------------|
| ก่อน start session ใหม่ (resume) | ✅ Yes — ตรวจว่า last session ทิ้ง orphan ไว้ไหม |
| หลัง git pull จาก teammate | ✅ Yes — ดูว่ามี changes ที่ยังไม่ map |
| ก่อน /review | ✅ Yes — verify traceability ก่อน review |
| ก่อน release / merge to main | ✅ Yes — ตรวจ release blocker |
| Hot-fix workflow | ✅ Yes — retroactive map fix commits |
| ระหว่าง /continue | ❌ No — /continue track เองอยู่ |
| First-time setup | ❌ No — ยังไม่มี changes |

---

## Integration with Other Commands

```
┌────────────────────────────────────────────────────────────┐
│  /scan-changes — Upstream traceability enforcer            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Detects: orphan changes, untracked commits, mapped changes│
│       │                                                    │
│       ├──► Suggests /add-feature  (new orphan)             │
│       │       │                                            │
│       │       └──► /continue (implement properly)          │
│       │                                                    │
│       ├──► Suggests /edit-feature (modify passed feature)  │
│       │       │                                            │
│       │       └──► /continue (commit edit feature)         │
│       │                                                    │
│       └──► Suggests /edit-section (system-design-doc)      │
│               │                                            │
│               └──► /sync-with-features                     │
│                                                            │
│  Complements: /validate-coverage (top-down)                │
│               /scan-changes (bottom-up)                    │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

`/scan-changes` เป็น **bottom-up** counterpart ของ `/validate-coverage` (top-down)

---

## Important Rules

❌ **Forbidden:**
- แก้ git history (rebase, reset, amend)
- Auto-commit หรือ auto-create feature โดยไม่ถาม user
- Mark feature เป็น passes=true จากการแก้ code นอก workflow
- Skip การ reverse-map (สรุปว่า orphan โดยไม่ตรวจ subtasks.files)

✅ **Must do:**
- อ่าน feature_list.json ทั้งไฟล์ก่อน classify
- Reverse-map ทุกไฟล์ที่เปลี่ยน
- ใช้ AskUserQuestion เสนอทางเลือก
- Update progress.md หลังจบ scan
- ระบุ traceability score เพื่อ user เห็นแนวโน้ม

> 💬 **หมายเหตุ**: คำสั่งนี้จะตอบกลับเป็นภาษาไทย (ศัพท์เทคนิคใช้ภาษาอังกฤษ)
