---
description: Add a new feature to feature_list.json
allowed-tools: Bash(*), Read(*), Write(*), Edit(*)
---

# Add Feature - Add a New Feature

You will help the user add a new feature to the project.

## Input Received

Feature to add: $ARGUMENTS

## Steps to Follow

### Step 1: Check Environment

```bash
# Check if feature_list.json exists
cat feature_list.json
```

**If feature_list.json not found:** Inform user they need to run `/init` first.

### Step 2: Analyze New Feature

From user input:
- Define a clear description
- Determine category (setup, domain, functional, quality, enhancement, etc.)
- Determine priority (high, medium, low)
- Break into steps (3-5 steps)

### Step 3: Find Next ID

Read feature_list.json and find the highest existing id, then +1.

### Step 4: Create New Feature Entry

```json
{
  "id": [NEXT_ID],
  "category": "[CATEGORY]",
  "description": "[DESCRIPTION]",
  "priority": "[PRIORITY]",
  "steps": [
    "step 1",
    "step 2",
    "step 3"
  ],
  "dependencies": [],
  "references": [],
  "estimated_time": "[ESTIMATED_TIME]",
  "passes": false,
  "tested_at": null,
  "notes": "",
  "added_at": "[TIMESTAMP]"
}
```

**Note:**
- `references`: array of paths to related documents, e.g., `.mockups/page.mockup.md`, `docs/logic.md`, `sql/create_table.sql`

### Step 5: Add to feature_list.json

- Add new feature to `features` array
- Update `summary.total` (+1)
- Update `summary.failed` (+1)
- Update `summary.last_updated`

### Step 6: Update Progress Log

Add to .agent/progress.md:
```markdown
### Feature Added
- Feature #[ID]: [description]
- Category: [category]
- Priority: [priority]
- Added at: [timestamp]
```

### Step 7: Git Commit (if user wants)

```bash
git add feature_list.json .agent/progress.md
git commit -m "feat: Add feature #[ID] - [short description]"
```

## Important Rules

❌ **Forbidden:**
- Modify existing features
- Mark new feature as passes: true
- Implement feature immediately (only add to list)
- Create features that are too large (should be completable in 1 session)

✅ **Must do:**
- Ask user if input is unclear
- Split large features into multiple small features
- Specify clear steps
- Record timestamp of when it was added

## Expected Output

When complete, inform user:
1. Newly created Feature ID
2. Feature details
3. Total features after adding (X total, Y passed, Z pending)
4. Recommend using `/continue` to start working on new feature

## Examples

**Input:** Add a feature for searching todos by title

**Output that should be created:**
```json
{
  "id": 11,
  "category": "functional",
  "description": "GET /api/todos/search - search todos by title",
  "priority": "medium",
  "steps": [
    "Add new endpoint in TodosController",
    "Accept query parameter 'q' or 'title'",
    "Use LIKE query with SQLite",
    "Return empty array if not found",
    "Test search with various keywords"
  ],
  "dependencies": [5],
  "references": ["docs/api-spec.md"],
  "estimated_time": "20min",
  "passes": false,
  "tested_at": null,
  "notes": "",
  "added_at": "2025-01-15T10:30:00Z"
}
```

### Example 2: Feature with references

**Input:** Add a feature for User Profile page

**Output that should be created:**
```json
{
  "id": 12,
  "category": "feature",
  "description": "Create User Profile page",
  "priority": "medium",
  "steps": [
    "Create ProfileController",
    "Create Profile view per mockup",
    "Display user data from database",
    "Test UI and data binding"
  ],
  "dependencies": [3, 5],
  "references": [
    ".mockups/profile.mockup.md",
    "docs/user-entity.md"
  ],
  "estimated_time": "25min",
  "passes": false,
  "tested_at": null,
  "notes": "",
  "added_at": "2025-01-15T11:00:00Z"
}
```

> 💬 **หมายเหตุ**: คำสั่งนี้จะตอบกลับเป็นภาษาไทย
