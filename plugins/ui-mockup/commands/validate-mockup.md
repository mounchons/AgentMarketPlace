---
description: Validate UI Mockup files for completeness and compliance
allowed-tools: Bash(*), Read(*), Glob(*), Grep(*)
---

# Validate Mockup Command

Validate UI Mockup files for completeness, compliance, and consistency across 10 validation categories.

## Usage

```
/validate-mockup                    # validate all mockup files
/validate-mockup [filename]         # validate specific file
/validate-mockup --strict           # strict mode (warnings become errors)
```

## ⚠️ CRITICAL RULES (MUST FOLLOW)

1. **Check ALL 10 categories** — never skip any validation category
2. **Read actual file content** — do not guess or assume, read every file before validating
3. **Report honestly** — do not inflate pass rates, report actual issues found
4. **Update mockup_list.json** — set status to needs_revision or validated based on results

### 🔍 Self-Check Checklist

- [ ] All 10 categories checked?
- [ ] Every mockup file actually read?
- [ ] Issues reported with specific line references?
- [ ] mockup_list.json updated with validation results?

---

## Step 0: Identify Files to Validate

```bash
# List all mockup files
ls -la .mockups/*.mockup.md 2>/dev/null

# Read mockup_list.json for context
cat .mockups/mockup_list.json 2>/dev/null
```

**If specific filename provided:** validate only that file
**If no filename:** validate all `.mockup.md` files in `.mockups/`
**If --strict flag:** treat warnings as errors

---

## Step 1: Read SKILL.md for Reference

```bash
# Read the skill definition for design tokens, component library, etc.
# This is needed for categories 2, 3, and 9
```

Read the ui-mockup SKILL.md to get:
- Design token definitions (colors, typography, spacing)
- Component library symbols
- Layout grid specifications
- CRUD pattern rules

---

## Step 2: Run 10 Validation Categories

For EACH mockup file, check all 10 categories:

### Category 1: Breakpoint Completeness (CRITICAL)

**Check that Desktop/Tablet/Mobile wireframes exist with actual ASCII content.**

```
Checks:
- [ ] "## Layout Grid" section exists
- [ ] "### Desktop (12 columns)" subsection exists with ASCII art (not "[wireframe here]")
- [ ] "### Tablet (8 columns)" subsection exists with ASCII art
- [ ] "### Mobile (4 columns)" subsection exists with ASCII art
- [ ] "## Wireframe" section exists
- [ ] "### Desktop View" subsection exists with ASCII art
- [ ] "### Mobile View" subsection exists with ASCII art
- [ ] ASCII art contains actual box-drawing characters (┌ ┐ └ ┘ │ ─)
```

**Status: FAIL if any breakpoint wireframe is missing or placeholder-only**

### Category 2: Design Token References

**Check that "Design Tokens Used" section exists and references valid tokens.**

```
Checks:
- [ ] "## Design Tokens Used" section exists
- [ ] Colors subsection references tokens (primary-500, neutral-50, etc.)
- [ ] Typography subsection references font sizes/weights
- [ ] Spacing subsection references spacing values
- [ ] Token names match SKILL.md definitions
```

**Status: WARN if section missing, FAIL in strict mode**

### Category 3: Component Library Compliance

**Check that "Components Used" table exists and symbols match SKILL.md.**

```
Checks:
- [ ] "## Components Used" section exists
- [ ] Table has columns: Component, Location, Props/Variants
- [ ] Component names match SKILL.md Component Library
- [ ] All components visible in wireframe are listed in table
```

**Status: WARN if section missing, FAIL in strict mode**

### Category 4: Layout Grid Completeness

**Check 12/8/4 column layouts with labeled column allocations.**

```
Checks:
- [ ] Desktop layout specifies 12 columns with allocations (e.g., "NAV 3col, MAIN 9col")
- [ ] Tablet layout specifies 8 columns with allocations
- [ ] Mobile layout specifies 4 columns with allocations
- [ ] Column allocations sum correctly (12, 8, 4)
```

**Status: WARN if column allocations not labeled**

### Category 5: CRUD Pattern Validation

**Check complexity ↔ pattern match, action column position, SweetAlert2 usage.**

```
Checks (for pages with CRUD Group):
- [ ] Page Info has "Complexity" field
- [ ] Page Info has "UI Pattern" field
- [ ] If complexity == "simple" → UI Pattern should be "modal"
- [ ] If complexity == "complex" → UI Pattern should be "page"
- [ ] Action column is first (leftmost) in data tables
- [ ] SweetAlert2 section exists for delete operations (or CLAUDE.md override library)
- [ ] Alert Library is SweetAlert2 (default) or explicitly overridden by CLAUDE.md (v1.1.0)
- [ ] NOT using browser native popups (alert/confirm/prompt) (v1.1.0)
- [ ] Only enabled CRUD actions have action icons
- [ ] Field Mapping table present (for form/list pages) (v1.1.0)
```

**Status: FAIL if complexity/pattern mismatch or action column not first**

### Category 6: Required Sections Presence

**Check all mandatory sections are present.**

```
Required sections:
- [ ] ## Page Info
- [ ] ## Description
- [ ] ## Layout Grid
- [ ] ## Wireframe
- [ ] ## Components Used
- [ ] ## Interactions
- [ ] ## Design Tokens Used
- [ ] ## Responsive Behavior
- [ ] ## Version History
```

**Status: FAIL if any required section missing**

### Category 7: Cross-Reference Validation (NEW)

**Check that mockup references match design_doc_list.json.**

```
Checks (if design_doc_list.json exists):
- [ ] Entities referenced in mockup exist in design doc
- [ ] Pages referenced in mockup exist in sitemap
- [ ] API endpoints referenced match design doc's sequence diagrams
- [ ] Field names in forms match Data Dictionary columns
- [ ] CRUD operations match design doc entity configurations
```

**Status: WARN if references don't match, FAIL in strict mode**

### Category 8: Accessibility Check (NEW)

**Check accessibility-related specifications.**

```
Checks:
- [ ] Font size tokens >= minimum (text-sm = 14px minimum for body text)
- [ ] Color tokens suggest sufficient contrast (primary on white, etc.)
- [ ] Mobile wireframe has touch target sizes >= 44px
- [ ] Keyboard navigation noted in Interactions section (Tab order, Enter to submit)
- [ ] Form fields have labels (not just placeholder text)
```

**Status: WARN if accessibility concerns found**

### Category 9: Consistency Check (NEW)

**Check cross-mockup consistency.**

```
Checks (across all mockup files):
- [ ] Same components use same ASCII symbols across files
- [ ] Same design tokens referenced across files
- [ ] Navigation pattern consistent (sidebar items, header layout)
- [ ] Same entity uses same column order in different pages
- [ ] Modal patterns consistent (same structure for create/edit)
```

**Status: WARN if inconsistencies found**

### Category 10: Content Completeness (NEW)

**Check for remaining placeholder/incomplete content.**

```
Checks:
- [ ] No "[TBD]", "[TODO]", "[placeholder]" text remaining
- [ ] No "[wireframe here]" or "[content here]" placeholders
- [ ] All form fields have labels
- [ ] All buttons have action text (not "[Button]")
- [ ] All table columns are defined with headers
- [ ] All interactions have Trigger, Action, and Result defined
```

**Status: FAIL if placeholder text found**

---

## Step 3: Generate Validation Report

**Display results in table format:**

```
📋 Validation Report: [filename]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────┬──────────────────────────────┬────────┬─────────┐
│  #  │ Category                     │ Status │ Issues  │
├─────┼──────────────────────────────┼────────┼─────────┤
│  1  │ Breakpoint Completeness      │ ✅ PASS│    0    │
│  2  │ Design Token References      │ ⚠ WARN │    2    │
│  3  │ Component Library Compliance │ ✅ PASS│    0    │
│  4  │ Layout Grid Completeness     │ ✅ PASS│    0    │
│  5  │ CRUD Pattern Validation      │ ✅ PASS│    0    │
│  6  │ Required Sections Presence   │ ✅ PASS│    0    │
│  7  │ Cross-Reference Validation   │ ⚠ WARN │    1    │
│  8  │ Accessibility Check          │ ⚠ WARN │    3    │
│  9  │ Consistency Check            │ ✅ PASS│    0    │
│ 10  │ Content Completeness         │ ✅ PASS│    0    │
└─────┴──────────────────────────────┴────────┴─────────┘

Overall: ✅ PASS (6 issues, 0 critical)

📝 Issues:
   [WARN] #2.1: Design Tokens Used section missing "Shadows" subsection
         → Fix: Add shadows tokens reference
   [WARN] #2.2: Typography tokens not referencing font-weight
         → Fix: Add fontWeight references
   [WARN] #7.1: Entity "Payment" in mockup not found in design_doc_list.json
         → Fix: Add Payment entity to design doc or remove from mockup
   [WARN] #8.1: Mobile touch targets not specified
         → Fix: Add touch target sizes (min 44px) to mobile wireframe
   [WARN] #8.2: Keyboard navigation not documented
         → Fix: Add keyboard nav to Interactions section
   [WARN] #8.3: Form uses placeholder-only labels (no visible labels)
         → Fix: Add visible labels above input fields
```

**For --strict mode:** WARN becomes FAIL, overall fails if any warnings exist.

---

## Step 4: Multi-File Summary (when validating all files)

```
📋 Validation Summary: All Mockups
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌────────────────────────────────┬────────┬───────┬───────┬───────┐
│ File                           │ Status │ Pass  │ Warn  │ Fail  │
├────────────────────────────────┼────────┼───────┼───────┼───────┤
│ 001-login.mockup.md            │ ✅ PASS│  8    │  2    │  0    │
│ 002-dashboard.mockup.md        │ ✅ PASS│  9    │  1    │  0    │
│ 003-user-list.mockup.md        │ ❌ FAIL│  7    │  1    │  2    │
│ 004-user-form.mockup.md        │ ⚠ WARN │  8    │  2    │  0    │
│ 010-department-list.mockup.md  │ ✅ PASS│ 10    │  0    │  0    │
└────────────────────────────────┴────────┴───────┴───────┴───────┘

Overall: ⚠ WARN (3/5 pass, 1 warn, 1 fail)

❌ Critical Issues (must fix):
   • 003-user-list.mockup.md: Missing Tablet wireframe
   • 003-user-list.mockup.md: Action column not first in table

⚠ Warnings (should fix):
   • 004-user-form.mockup.md: Design Tokens Used section incomplete
   • 001-login.mockup.md: Accessibility - no keyboard navigation documented
```

---

## Step 5: Update mockup_list.json

**After validation, update status in mockup_list.json:**

```json
// For files that PASS
{
  "id": "001",
  "name": "Login",
  "status": "validated",
  "validation": {
    "validated_at": "TIMESTAMP",
    "result": "pass",
    "pass_count": 8,
    "warn_count": 2,
    "fail_count": 0
  }
}

// For files that FAIL
{
  "id": "003",
  "name": "User List",
  "status": "needs_revision",
  "validation": {
    "validated_at": "TIMESTAMP",
    "result": "fail",
    "pass_count": 7,
    "warn_count": 1,
    "fail_count": 2,
    "issues": [
      "Missing Tablet wireframe",
      "Action column not first in table"
    ]
  }
}
```

---

## Output

```
✅ Validation complete!

📊 Results:
   • Files validated: [count]
   • Passed: [count]
   • Warnings: [count]
   • Failed: [count]

💡 Next steps:
   • Fix issues listed above
   • Re-run /validate-mockup to verify fixes
   • /validate-mockup --strict for stricter validation
```

> 💬 **Note**: This command responds in Thai (คำสั่งนี้จะตอบกลับเป็นภาษาไทย)
