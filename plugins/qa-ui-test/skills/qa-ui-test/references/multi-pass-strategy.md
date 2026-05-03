# Multi-Pass / Re-run Strategy

> วิธีรัน `/qa-create-scenario` และ `/qa-create-advanced` ซ้ำได้อย่างปลอดภัย
> รองรับการให้หลาย agent/model ช่วยเพิ่ม coverage ทีละรอบ (pass)

---

## Concept

**Pass** = 1 รอบของการสแกนและสร้าง scenarios จาก agent หนึ่งตัว

```
Pass 1 (sonnet, fast):
  → สแกน code → ได้ baseline coverage 156 scenarios
  
Pass 2 (opus, deep):
  → สแกนซ้ำ → หา edge cases ที่ pass 1 ตกหล่น
  → เพิ่ม 12 scenarios ใหม่ (concurrency, security, boundary)

Pass 3 (multi-agent brainstorm):
  → 5 personas (end user, security, accessibility, etc.) คิดมุมที่ต่างกัน
  → เพิ่ม 24 scenarios (UX issues, a11y violations, business rules)

Total: 192 scenarios จาก 3 passes — comprehensive coverage
```

**Key principle:** ทุก pass **ADD-ONLY** ไม่ลบ ไม่แก้ scenarios ของ pass เก่า
(เว้นแต่ user เลือก `--force-update`)

---

## Detection: รู้ได้อย่างไรว่าเคยรันแล้ว

```
Step 0 ของ qa-create-scenario / qa-create-advanced:

1. Read qa-tracker.json
2. ตรวจ:
   - exists?
   - มี scenarios[] ไม่ว่าง?
   - มี passes_history[]?
3. ถ้าเข้าเงื่อนไข → entered "Re-run mode"
4. แสดง status report + ถาม user
```

---

## User Prompts (Re-run mode)

### Prompt 1: Action choice

```
🔍 ตรวจพบ qa-tracker.json — มี scenarios อยู่แล้ว

📊 สถานะปัจจุบัน:
   Total scenarios:     156
   Passes done:         1 (sonnet, 2026-05-03)
   Modules:             6 (LOGIN, PRODUCT, ORDER, CATEGORY, USER, DASHBOARD)
   ⭐ Cascade:           18 scenarios (3 relationships)
   ⭐ Approval Workflow: 12 scenarios (1 workflow)
   Functional:          75 scenarios
   Role-based:          51 scenarios

❓ ต้องการดำเนินการอะไร?
   1) ➕ Add pass — เพิ่มเคสจาก agent ใหม่ (recommended)
   2) 🔄 Re-scan all — ลบเก่าทิ้ง สแกนใหม่หมด (destructive)
   3) 📝 Module-specific — เพิ่มเคสเฉพาะ module ที่เลือก
   4) 📊 Show diff only — preview ว่าจะเพิ่มอะไร (dry-run)
   5) ❌ Cancel

[1/2/3/4/5]:
```

### Prompt 2: Agent/Model selection (ถ้าเลือก 1 หรือ 3)

```
❓ ใช้ agent/model ใดสำหรับ pass นี้?

   1) opus-deep
      • subagent_type: general-purpose
      • model: opus
      • เน้น: edge cases, security, complex business flows
      • เหมาะกับ: pass 2 หลัง sonnet

   2) sonnet-fast
      • subagent_type: Explore
      • model: sonnet
      • เน้น: quick coverage, page detection
      • เหมาะกับ: pass 1 (initial scan)

   3) multi-agent-brainstorm
      • dispatch 5 personas parallel
      • personas: end-user, security, bug-hunter, business, accessibility
      • เน้น: comprehensive multi-perspective
      • เหมาะกับ: pass 3+ (after baseline established)

   4) opus-cascade-focus
      • subagent_type: general-purpose
      • model: opus
      • เน้น: เฉพาะ cascade + approval workflow (MUST-HAVE)
      • เหมาะกับ: ตรวจซ้ำว่า MUST-HAVE patterns ครบ

   5) custom
      • ระบุ subagent_type + model + focus เอง

[1/2/3/4/5]:
```

### Prompt 3: Module scope (ถ้าเลือก 3 - module specific)

```
❓ ทดสอบ module ใด?

Available modules (จาก qa-tracker.json):
   1) LOGIN       (8 scenarios)
   2) PRODUCT     (13 scenarios)
   3) ORDER       (15 scenarios)
   4) CATEGORY    (13 scenarios)
   5) USER        (13 scenarios)
   6) DASHBOARD   (5 scenarios)
   
Special:
   a) all — ทุก module
   b) new-only — เฉพาะ module ที่ scan ใหม่เจอ (ถ้า code มี module ใหม่)
   c) failed-only — เฉพาะ module ที่มี failed scenarios (จาก runs)
   d) cascade-only — ตรวจ cross-page master data
   e) approval-only — ตรวจ approval workflow

ระบุ (เลขข้อ, comma-separated, หรือ keyword):
> 2,3 หรือ all หรือ cascade-only
```

### Prompt 4: Confirm before write

```
🔍 Diff Preview (Pass 2 - opus, modules: PRODUCT, ORDER):

Module: PRODUCT
   ✓ Existing: 13 scenarios (from Pass 1)
   + New: 5 scenarios
     - TS-PRODUCT-014: Boundary - SKU 255 chars Unicode
     - TS-PRODUCT-015: Concurrent edit conflict (2 users)
     - TS-PRODUCT-016: Partial update — only price field
     - TS-PRODUCT-017: Soft delete verification
     - TS-PRODUCT-018: Bulk operations rollback on partial failure
   ≈ Modified: 0
   - Removed: 0

Module: ORDER (master-detail)
   ✓ Existing: 15 scenarios
   + New: 3 scenarios
     - TS-ORDER-016: Detail row reorder (drag-drop) — pass 1 missed
     - TS-ORDER-017: Master total recalc on currency change
     - TS-ORDER-018: Audit log for inline edits

⭐ Cascade additions:
   + INDIRECT chain: USER → ORDER → ORDER_ITEM (3 scenarios — was missed)

⭐ Approval Workflow additions:
   + LEAVE: timeout auto-rejection (10 days no action) — 1 scenario
   + LEAVE: bulk approval (manager approves multiple at once) — 1 scenario

Total: +12 new scenarios from Pass 2

✅ Confirm to add? (yes/no/edit)
```

---

## Diff Algorithm

### Scenario Signature (สำหรับเช็ค duplicate)

แต่ละ scenario มี **signature** = hash ของ (module + page_type + scenario_intent + key_fields)

```typescript
function scenarioSignature(s: Scenario): string {
  return `${s.module}:${s.page_type}:${s.type}:${normalizeTitle(s.title)}`;
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}
```

ตัวอย่าง:
```
TS-PRODUCT-002 "Create happy path" 
  → signature: "PRODUCT:master-data:happy-path:create-happy-path"

TS-PRODUCT-014 "Create with SKU 255 chars" 
  → signature: "PRODUCT:master-data:boundary:create-with-sku-255-chars"
```

### Merge Logic

```
For each new scenario from Pass N:
  1. Compute signature
  2. Check if signature exists in qa-tracker.json:
     - EXISTS → SKIP (mark as duplicate of existing)
     - NOT EXIST → ADD with:
       * Auto-assign new ID (next number per module)
       * Set created_in_pass = N
       * Set created_by_model = current pass model
       * Set status = "pending"
  3. Track in pass summary: added/skipped counts
```

### Conflict resolution

ถ้า new scenario มี **same intent แต่ different details** (เช่น Pass 2 เจอ field validation ใหม่):
- Default: SKIP (ไม่แก้ของเก่า)
- ถ้า `--force-update`: ASK user รายตัว
- Always: log ใน `passes_history.conflicts[]`

---

## qa-tracker.json Schema Extensions

### passes_history (top-level)

```json
{
  "passes_history": [
    {
      "pass": 1,
      "started_at": "2026-05-03T10:00:00Z",
      "completed_at": "2026-05-03T10:08:00Z",
      "model": "sonnet",
      "agent_type": "Explore",
      "command": "/qa-create-scenario --auto",
      "modules_scanned": ["LOGIN", "PRODUCT", "ORDER", "CATEGORY", "USER", "DASHBOARD"],
      "added": 156,
      "skipped": 0,
      "conflicts": [],
      "duration_seconds": 480
    },
    {
      "pass": 2,
      "started_at": "2026-05-04T14:00:00Z",
      "completed_at": "2026-05-04T14:12:00Z",
      "model": "opus",
      "agent_type": "general-purpose",
      "command": "/qa-create-scenario --auto --pass-mode opus-deep --modules PRODUCT,ORDER",
      "modules_scanned": ["PRODUCT", "ORDER"],
      "added": 12,
      "skipped": 28,
      "conflicts": [
        {
          "new_scenario": "TS-PRODUCT-014-NEW",
          "existing_scenario": "TS-PRODUCT-014",
          "reason": "title similar but field details differ",
          "resolution": "skipped"
        }
      ],
      "duration_seconds": 720
    }
  ]
}
```

### scenario fields (per scenario)

```json
{
  "id": "TS-PRODUCT-014",
  "title": "Boundary - SKU 255 chars Unicode",
  "module": "PRODUCT",
  "type": "boundary",
  "page_type": "master-data",
  "status": "pending",
  
  // NEW: pass tracking
  "created_in_pass": 2,
  "created_by_model": "opus",
  "created_at": "2026-05-04T14:05:00Z",
  "signature": "PRODUCT:master-data:boundary:create-with-sku-255-chars-unicode",
  
  // ... existing fields
}
```

---

## Pass Strategy Recommendations

### 2-Pass Strategy (Common)

```
Pass 1: sonnet + Explore agent (fast)
  → Goal: baseline coverage ครบทุก page
  → Output: ~80-90% coverage
  
Pass 2: opus + general-purpose agent (deep)
  → Goal: edge cases ที่ sonnet ตกหล่น
  → Focus: concurrency, security, boundary, MUST-HAVE patterns
  → Output: +5-15% additional coverage
```

### 3-Pass Strategy (Comprehensive)

```
Pass 1: sonnet + Explore (fast baseline)
Pass 2: opus + general-purpose (deep technical)
Pass 3: multi-agent brainstorm (5 personas)
  → personas: end-user, security, bug-hunter, business, accessibility
  → Output: +UX, a11y, business rules ที่ technical agent ไม่จับ
```

### Specialized Pass

```
Pass N: opus-cascade-focus
  → Focus: เฉพาะ ⭐ Cascade + Approval Workflow
  → ใช้เมื่อ: code มีการเพิ่ม FK relationships ใหม่ หรือ approval state machines
  → Verify: MUST-HAVE patterns ครบ
```

---

## Anti-patterns (ห้ามทำ)

❌ **Overwrite without asking**
- ห้ามเขียนทับ qa-tracker.json โดยไม่แสดง diff + ขอ confirm

❌ **Modifying scenarios from previous passes**
- Pass 2 ห้ามแก้ scenarios ของ Pass 1
- ถ้าต้องการแก้ → user ต้องใช้ /qa-edit-scenario แทน

❌ **Auto-deleting "outdated" scenarios**
- ห้าม heuristic ว่า scenario เก่า "ไม่จำเป็น" แล้วลบทิ้ง
- ถ้า scenario obsolete → mark `status: "deprecated"` แทน

❌ **Skipping signature check**
- ห้ามเพิ่ม scenario โดยไม่เช็ค duplicate
- ป้องกัน duplicate explosion (Pass 3 มี 200 scenarios แต่ 100 ซ้ำ)

❌ **Re-running same pass without flag**
- ถ้า user รัน `--auto` 2 ครั้งโดยไม่เปลี่ยน model → ต้องเตือน
- "คุณรัน Pass 1 (sonnet) ไปแล้ว — รันอีกครั้งจะได้ผลใกล้เคียงเดิม ต้องการ Pass 2 (opus) แทนไหม?"

---

## Force flags (override prompts)

```bash
# ใช้ในการ automate / CI
/qa-create-scenario --auto --pass-mode opus-deep --modules PRODUCT,ORDER --yes

# Force re-scan (destructive)
/qa-create-scenario --auto --reset --yes

# Dry-run only (preview, no write)
/qa-create-scenario --auto --pass-mode opus-deep --dry-run
```

---

## Module discovery (new-only mode)

ถ้า user เลือก `--modules new-only`:

```
1. Read qa-tracker.json → existing modules: [LOGIN, PRODUCT, ORDER, ...]
2. Run subagent → scan codebase for ALL pages
3. Detect new modules (not in qa-tracker.json):
   - หา controllers/pages ใหม่
   - หา routes ที่ยังไม่มี scenarios
4. Show:
   "พบ module ใหม่: REPORT, NOTIFICATION
    เก่า: 6 modules → ใหม่: 8 modules
    ดำเนินการ Pass สำหรับ REPORT, NOTIFICATION?"
```
