---
description: Edit a passed feature (create a new feature referencing the original)
allowed-tools: Bash(*), Read(*), Write(*), Edit(*)
---

# Edit Feature - Edit a Passed Feature

You will help the user edit a passed feature by creating a new feature referencing the original.

> **Key principle:** A passed feature will not be modified directly. Instead, a new feature will be created to preserve development history.

## Input Received

Feature ID and changes: $ARGUMENTS

**Input formats:**
- `/edit-feature 5 - add OAuth login`
- `/edit-feature 7 - update endpoint to support pagination`
- `/edit-feature 3 - add new fields per design doc`

## Steps to Follow

### Step 1: Check Environment

```bash
# Check if feature_list.json exists
cat feature_list.json
```

**If feature_list.json not found:** Inform user they need to run `/init` first.

### Step 2: Parse Input and Verify Feature

From user input:
1. Extract the Feature ID to edit
2. Extract change details

```bash
# Read feature_list.json and find the specified feature
cat feature_list.json | jq '.features[] | select(.id == [FEATURE_ID])'
```

**Verify:**
- Feature ID actually exists
- Feature has `passes: true` (already completed)

**If feature not yet passed:** Inform user:
> "Feature #X is not yet complete (passes: false). Use `/continue` to complete it first, or edit the feature directly."

### Step 3: Analyze Changes

From details provided by user:
- Define a clear new description
- Determine category (may be `enhancement` or keep original)
- Determine priority (high, medium, low)
- Break into steps (3-5 steps)
- Specify references if any (mockup, design doc, SQL)

### Step 4: Find Next ID

Read feature_list.json and find the highest existing id, then +1.

### Step 5: Create New Feature

```json
{
  "id": [NEXT_ID],
  "category": "[CATEGORY]",
  "description": "[NEW_DESCRIPTION]",
  "priority": "[PRIORITY]",
  "steps": [
    "step 1",
    "step 2",
    "step 3"
  ],
  "dependencies": [ORIGINAL_FEATURE_DEPENDENCIES],
  "references": [],
  "related_features": [ORIGINAL_FEATURE_ID],
  "supersedes": [ORIGINAL_FEATURE_ID],
  "estimated_time": "[ESTIMATED_TIME]",
  "passes": false,
  "tested_at": null,
  "notes": "Updated from Feature #[ORIGINAL_ID] - [short reason]",
  "created_at": "[TIMESTAMP]"
}
```

**Important fields:**
- `related_features`: Array of related feature IDs
- `supersedes`: Feature ID being replaced/improved
- `notes`: Explain which feature this improves

### Step 6: Add to feature_list.json

- Add new feature to `features` array
- Update `summary.total` (+1)
- Update `summary.failed` (+1)
- Update `summary.last_updated`

**Note:** The original feature remains unchanged.

### Step 7: Update Progress Log

Add to .agent/progress.md:
```markdown
### Feature Edit
- Created Feature #[NEW_ID] from Feature #[OLD_ID]
- Original: [original description]
- Changes: [what changed]
- Old feature preserved (passes: true)
- New feature created (passes: false)
- Created at: [timestamp]
```

### Step 8: Git Commit

```bash
git add feature_list.json .agent/progress.md
git commit -m "feat: Edit Feature #[OLD_ID] → Create Feature #[NEW_ID] - [short description]"
```

## Important Rules

❌ **Forbidden:**
- Modify a passed feature directly (must preserve history)
- Modify a feature that hasn't passed (use `/continue` instead)
- Delete old feature
- Change ID of old feature
- Mark new feature as passes: true
- Implement feature immediately (only add to list)

✅ **Must do:**
- Always create a new feature (no in-place editing)
- Include `related_features` and `supersedes` to track history
- Include `notes` explaining what was improved
- Copy dependencies from original feature (if appropriate)
- Ask user if input is unclear
- Split large features into multiple small features

## Expected Output

When complete, inform user:

```
✅ สร้าง Feature ใหม่สำเร็จ

📋 Feature Details:
- New Feature: #[NEW_ID] - [description]
- Based on: Feature #[OLD_ID]
- Category: [category]
- Priority: [priority]
- Status: passes: false

📊 Summary:
- Total features: X (+1)
- Passed: Y
- Pending: Z (+1)

🔗 Relationship:
- Feature #[NEW_ID] supersedes Feature #[OLD_ID]
- Feature #[OLD_ID] preserved for history

💡 Next Step:
- ใช้ /continue เพื่อเริ่มทำ Feature #[NEW_ID]
```

## Examples

### Example 1: Add OAuth

**Input:** `/edit-feature 5 - add OAuth login`

**Original feature (ID: 5):**
```json
{
  "id": 5,
  "category": "feature",
  "description": "Create Login page with username/password",
  "passes": true,
  "tested_at": "2025-01-10T10:00:00Z"
}
```

**New feature created (ID: 13):**
```json
{
  "id": 13,
  "category": "enhancement",
  "description": "Improve Login page - add OAuth login (Google, Facebook)",
  "priority": "high",
  "steps": [
    "Install OAuth packages",
    "Add OAuth providers configuration",
    "Create OAuth callback endpoints",
    "Update UI to add Sign in with Google/Facebook buttons",
    "Test OAuth flow"
  ],
  "dependencies": [1, 2],
  "references": [".mockups/login.mockup.md"],
  "related_features": [5],
  "supersedes": 5,
  "estimated_time": "30min",
  "passes": false,
  "tested_at": null,
  "notes": "Updated from Feature #5 - add OAuth login support",
  "created_at": "2025-01-15T14:00:00Z"
}
```

### Example 2: Update API endpoint

**Input:** `/edit-feature 7 - add pagination and filtering`

**Original feature (ID: 7):**
```json
{
  "id": 7,
  "category": "api",
  "description": "GET /api/products - List all products",
  "passes": true
}
```

**New feature created (ID: 14):**
```json
{
  "id": 14,
  "category": "enhancement",
  "description": "GET /api/products - add pagination and filtering",
  "priority": "medium",
  "steps": [
    "Add query parameters: page, pageSize, sortBy",
    "Add filter parameters: category, minPrice, maxPrice",
    "Implement pagination logic",
    "Return total count in response header",
    "Test pagination and filtering"
  ],
  "dependencies": [4],
  "references": ["docs/api-spec.md"],
  "related_features": [7],
  "supersedes": 7,
  "estimated_time": "25min",
  "passes": false,
  "tested_at": null,
  "notes": "Updated from Feature #7 - add pagination and filtering support",
  "created_at": "2025-01-15T14:30:00Z"
}
```

## Feature Relationship Diagram

```
Feature #5 (Login - Basic)          Feature #7 (Products - Basic)
    │ passes: true                      │ passes: true
    │                                   │
    └──── superseded by ────┐           └──── superseded by ────┐
                            │                                   │
                            ▼                                   ▼
                    Feature #13                         Feature #14
                    (Login - OAuth)                     (Products - Pagination)
                    passes: false                       passes: false
                    related_features: [5]               related_features: [7]
                    supersedes: 5                       supersedes: 7
```

## When to Use /edit-feature

| Scenario | Use /edit-feature? | Alternative |
|----------|-------------------|-------------|
| Feature passed, want to expand scope | ✅ Yes | - |
| Feature passed, found a bug | ✅ Yes (category: bugfix) | - |
| Feature not yet passed, want to edit | ❌ No | Use /continue |
| Want to add a new feature | ❌ No | Use /add-feature |
| Want to refactor code | ✅ Yes (category: refactor) | - |

> 💬 **หมายเหตุ**: คำสั่งนี้จะตอบกลับเป็นภาษาไทย
