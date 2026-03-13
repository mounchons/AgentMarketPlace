# /generate-features-from-mockups

Automatically generate features from mockup_list.json to cover all designed UI pages.

---

## Usage

```
/generate-features-from-mockups
```

---

## Prerequisites

- `.mockups/mockup_list.json` must exist in the project
- Should run `/init-mockup` or `/ui-mockup` first

---

## Process

### Step 1: Read mockup_list.json

```bash
# Check if mockup_list.json exists
ls -la .mockups/mockup_list.json

# Read contents
cat .mockups/mockup_list.json
```

### Step 2: Parse pages and create features

For each page in `mockup_list.json`:

| Page Category | Feature Template | Epic |
|---------------|------------------|------|
| `auth` | "Create [name] page" | ui-auth |
| `main` | "Create [name] page" | ui-main |
| `list` | "Create [name] List page" | ui-[crud_group] |
| `form` | "Create [name] Form page" | ui-[crud_group] |
| `detail` | "Create [name] Detail page" | ui-[crud_group] |

### Step 3: Create Feature Structure

```json
{
  "id": [next_id],
  "epic": "ui-[category_or_crud_group]",
  "category": "feature-frontend",
  "description": "สร้างหน้า [page.name_th or page.name]",
  "priority": "[page.priority]",
  "complexity": "[page.complexity or 'medium']",
  "status": "pending",
  "blocked_reason": null,
  "subtasks": [
    { "id": "[id].1", "description": "Create layout per mockup", "done": false },
    { "id": "[id].2", "description": "Create components per specs", "done": false },
    { "id": "[id].3", "description": "Connect to API", "done": false },
    { "id": "[id].4", "description": "Test UI", "done": false }
  ],
  "acceptance_criteria": [
    "UI matches wireframe in mockup",
    "Components are complete per specs",
    "Responsive design works correctly",
    "API integration is complete"
  ],
  "time_tracking": {
    "estimated_time": "[based on complexity]",
    "actual_time": null,
    "started_at": null,
    "completed_at": null
  },
  "dependencies": [api_feature_ids],
  "references": [
    ".mockups/[page.id]-[page.name.toLowerCase()].mockup.md",
    ".mockups/_design-tokens.yaml"
  ],
  "mockup_validated": false,
  "required_components": "[page.components]",
  "passes": false,
  "steps_legacy": [],
  "tested_at": null,
  "notes": "Auto-generated from mockup_list.json"
}
```

### Step 4: Create Epic for UI

```json
{
  "id": "ui-pages",
  "name": "UI Pages",
  "description": "All UI pages from mockups",
  "bounded_context": "Presentation",
  "features": [generated_feature_ids],
  "progress": { "total": X, "passed": 0, "in_progress": 0 }
}
```

### Step 5: Update mockup_list.json

Add reverse link:

```json
{
  "pages": [
    {
      "id": "001",
      "implemented_by_features": [generated_feature_id],
      "feature_status": "pending"
    }
  ],
  "last_synced_with_features": "[ISO_DATE]"
}
```

---

## Complexity to Time Mapping

| Complexity | Estimated Time |
|------------|----------------|
| simple | 20min |
| medium | 35min |
| complex | 60min |
| null (default) | 30min |

---

## Dependency Rules

1. **List page** depends on **GET list API**
2. **Form page** depends on **POST/PUT API**
3. **Detail page** depends on **GET by ID API**
4. **Auth pages** have no dependencies (do first)
5. **Dashboard** depends on **all entities** (do last)

---

## Example Output

### Input: mockup_list.json
```json
{
  "pages": [
    { "id": "001", "name": "Login", "category": "auth", "priority": "high", "complexity": "medium", "components": ["Card", "Input", "Button"] },
    { "id": "004", "name": "User List", "category": "list", "crud_group": "User", "priority": "medium", "complexity": "complex", "components": ["Table", "Pagination"] }
  ]
}
```

### Output: Features Added
```json
{
  "features": [
    {
      "id": 20,
      "epic": "ui-auth",
      "description": "สร้างหน้า Login",
      "priority": "high",
      "complexity": "medium",
      "references": [".mockups/001-login.mockup.md"],
      "required_components": ["Card", "Input", "Button"]
    },
    {
      "id": 21,
      "epic": "ui-user",
      "description": "สร้างหน้า User List",
      "priority": "medium",
      "complexity": "complex",
      "dependencies": [5],
      "references": [".mockups/004-user-list.mockup.md"],
      "required_components": ["Table", "Pagination"]
    }
  ]
}
```

---

## Post-Generation Actions

1. **Review generated features** — verify that features are correct
2. **Adjust dependencies** — add any missing dependencies
3. **Run /validate-coverage** — check coverage
4. **Run /sync-mockups** — sync status between files

---

## Notes

- Generated features will have `notes: "Auto-generated from mockup_list.json"`
- Will not create duplicate features if a feature already references the same mockup
- Should be run after `/init` is complete

> 💬 **หมายเหตุ**: คำสั่งนี้จะตอบกลับเป็นภาษาไทย
