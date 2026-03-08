# /sync-mockups

ตรวจสอบและ synchronize ข้อมูลระหว่าง `feature_list.json` และ `.mockups/mockup_list.json`

---

## Usage

```
/sync-mockups
```

---

## Purpose

1. **Validate** ว่า mockup references ใน features ชี้ไปยังไฟล์ที่มีอยู่จริง
2. **Update reverse links** ใน mockup_list.json
3. **Sync status** ระหว่าง features และ mockups
4. **Report** orphan mockups และ missing references

---

## Process

### Step 1: อ่านไฟล์ทั้งสอง

```bash
# อ่าน feature_list.json
cat feature_list.json

# อ่าน mockup_list.json
cat .mockups/mockup_list.json

# List mockup files
ls -la .mockups/*.mockup.md
```

### Step 2: Validate Mockup References

ตรวจสอบทุก feature ที่มี `references` ไปยัง `.mockups/`:

```
For each feature with mockup reference:
  1. Check if mockup file exists
  2. If not exists → add to missing_mockups list
  3. If exists → set mockup_validated: true
```

**Output:**
```
Validating mockup references...

✅ Feature #20 "สร้างหน้า Login"
   → .mockups/001-login.mockup.md exists

❌ Feature #21 "สร้างหน้า User List"
   → .mockups/004-user-list.mockup.md NOT FOUND

Summary: 15/17 mockup references valid
```

### Step 3: Update Reverse Links

Update `mockup_list.json` pages with `implemented_by_features`:

```json
{
  "pages": [
    {
      "id": "001",
      "name": "Login",
      "implemented_by_features": [20],  // ← Updated
      "feature_status": "pending"        // ← Updated from feature
    }
  ]
}
```

**Mapping Logic:**
```
For each page in mockup_list.json:
  1. Find features where references contains this page's mockup_file
  2. Add feature IDs to implemented_by_features[]
  3. Set feature_status from the first matching feature's status
```

### Step 4: Sync Status

| Feature Status | Mockup Status |
|----------------|---------------|
| pending | pending |
| in_progress | in_progress |
| blocked | pending |
| review | in_progress |
| passed | completed |

### Step 5: Report Orphan Mockups

ค้นหา mockups ที่ไม่มี feature reference ถึง:

```
Orphan Mockups (no features implemented):
- 003-dashboard.mockup.md (page: Dashboard)
- 007-department-list.mockup.md (page: Department List)

Recommendation:
- Run /generate-features-from-mockups to create missing features
- Or manually add references to existing features
```

### Step 6: Report Features Missing Mockups

UI features ที่ไม่มี mockup reference:

```
Features missing mockup references:
- Feature #25 "สร้างหน้า Settings" (category: feature-frontend)
  → Suggested: .mockups/xxx-settings.mockup.md

Recommendation:
- Create mockup with /ui-mockup skill
- Or add reference to existing mockup
```

---

## Output Format

### Sync Report

```
╔════════════════════════════════════════════════════════════╗
║                    MOCKUP SYNC REPORT                       ║
╠════════════════════════════════════════════════════════════╣
║ Generated: 2025-01-04T10:00:00Z                            ║
╠════════════════════════════════════════════════════════════╣

1. MOCKUP REFERENCE VALIDATION
   ────────────────────────────
   Total features with mockup refs: 17
   Valid references: 15 (88%)
   Missing files: 2

   Missing:
   - Feature #21 → .mockups/004-user-list.mockup.md
   - Feature #22 → .mockups/005-user-form.mockup.md

2. REVERSE LINK UPDATE
   ────────────────────
   Pages updated: 7
   - 001-login: [20]
   - 002-register: [23]
   - 003-dashboard: []  ← orphan
   ...

3. STATUS SYNC
   ───────────
   Synced: 15 pages
   - pending: 10
   - in_progress: 3
   - completed: 2

4. ORPHAN MOCKUPS
   ───────────────
   Mockups without features: 2
   - 003-dashboard.mockup.md
   - 007-department-list.mockup.md

5. FEATURES MISSING MOCKUPS
   ─────────────────────────
   UI features without mockup: 1
   - Feature #25 "สร้างหน้า Settings"

╠════════════════════════════════════════════════════════════╣
║ ACTIONS TAKEN:                                              ║
║ ✅ Updated mockup_list.json                                 ║
║ ✅ Set mockup_validated on 15 features                     ║
║ ✅ Updated last_synced_with_features timestamp             ║
╚════════════════════════════════════════════════════════════╝
```

---

## Files Modified

1. **feature_list.json**
   - Set `mockup_validated: true/false` for each feature with mockup reference

2. **.mockups/mockup_list.json**
   - Update `implemented_by_features[]` for each page
   - Update `feature_status` for each page
   - Update `last_synced_with_features` timestamp

---

## Example

### Before Sync

**feature_list.json:**
```json
{
  "features": [
    {
      "id": 20,
      "description": "สร้างหน้า Login",
      "references": [".mockups/001-login.mockup.md"],
      "mockup_validated": false
    }
  ]
}
```

**mockup_list.json:**
```json
{
  "pages": [
    {
      "id": "001",
      "name": "Login",
      "implemented_by_features": [],
      "feature_status": null
    }
  ],
  "last_synced_with_features": null
}
```

### After Sync

**feature_list.json:**
```json
{
  "features": [
    {
      "id": 20,
      "description": "สร้างหน้า Login",
      "references": [".mockups/001-login.mockup.md"],
      "mockup_validated": true  // ← Updated
    }
  ]
}
```

**mockup_list.json:**
```json
{
  "pages": [
    {
      "id": "001",
      "name": "Login",
      "implemented_by_features": [20],      // ← Updated
      "feature_status": "pending"            // ← Updated
    }
  ],
  "last_synced_with_features": "2025-01-04T10:00:00Z"  // ← Updated
}
```

---

## When to Run

- หลังจาก `/generate-features-from-mockups`
- หลังจากเพิ่ม/แก้ไข features ที่มี mockup reference
- ก่อน `/continue` เพื่อ validate references
- เมื่อต้องการดู coverage report

---

## Notes

- Command นี้เป็น read-heavy, write-light (อ่านเยอะ เขียนน้อย)
- ไม่สร้าง features ใหม่ - ใช้ `/generate-features-from-mockups` แทน
- ไม่สร้าง mockups ใหม่ - ใช้ `/ui-mockup` แทน
- Safe to run multiple times
