# /agent-dependencies

สร้าง dependency visualization และวิเคราะห์ critical path ของ features

---

## Usage

```
/agent-dependencies
```

---

## Purpose

1. **Visualize** dependencies ระหว่าง features ด้วย Mermaid diagram
2. **Detect** circular dependencies
3. **Identify** critical path (longest dependency chain)
4. **Find** blocked features
5. **Analyze** parallelization opportunities

---

## Output

### 1. Mermaid Dependency Graph

```mermaid
graph TD
    subgraph Setup
        F1[1: Project structure]
        F2[2: Database setup]
    end

    subgraph Domain
        F3[3: User entity]
        F4[4: DbContext]
    end

    subgraph API
        F5[5: GET /users]
        F6[6: GET /users/id]
        F7[7: POST /users]
        F8[8: PUT /users/id]
        F9[9: DELETE /users/id]
    end

    subgraph UI
        F20[20: Login page]
        F21[21: User List page]
    end

    F1 --> F2
    F1 --> F3
    F2 --> F4
    F3 --> F4
    F4 --> F5
    F5 --> F6
    F5 --> F7
    F6 --> F8
    F6 --> F9
    F5 --> F21

    style F1 fill:#90EE90
    style F2 fill:#90EE90
    style F5 fill:#FFD700
    style F20 fill:#87CEEB
```

### 2. Dependency Analysis Report

```
╔════════════════════════════════════════════════════════════╗
║               DEPENDENCY ANALYSIS REPORT                    ║
╠════════════════════════════════════════════════════════════╣

1. DEPENDENCY STATISTICS
   ──────────────────────
   Total features: 25
   Features with dependencies: 22
   Features without dependencies: 3 (root nodes)
   Total dependency links: 45
   Average dependencies per feature: 1.8

2. ROOT NODES (No Dependencies)
   ────────────────────────────
   - Feature #1: สร้าง project structure
   - Feature #20: สร้างหน้า Login (standalone)
   - Feature #23: API documentation

3. LEAF NODES (No Dependents)
   ──────────────────────────
   - Feature #9: DELETE /api/users/{id}
   - Feature #21: สร้างหน้า User List
   - Feature #25: Settings page

4. CRITICAL PATH (Longest Chain)
   ─────────────────────────────
   Length: 6 features
   Path: F1 → F2 → F4 → F5 → F6 → F8

   ┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌───┐
   │ 1 │ → │ 2 │ → │ 4 │ → │ 5 │ → │ 6 │ → │ 8 │
   └───┘   └───┘   └───┘   └───┘   └───┘   └───┘
   Setup   DB      Context  List    Get     Update

   Estimated time: 1h 55min

5. CIRCULAR DEPENDENCIES
   ──────────────────────
   ✅ No circular dependencies found

   (If found, would show):
   ❌ Circular dependency detected:
      F10 → F12 → F15 → F10

6. BLOCKED FEATURES
   ─────────────────
   Features blocked by unfinished dependencies:

   Feature #5 (GET /users) blocked by:
   - #4 DbContext [pending]
     - #2 Database setup [pending]
     - #3 User entity [pending]

7. PARALLELIZATION OPPORTUNITIES
   ──────────────────────────────
   After completing F1, can run in parallel:
   - F2 (Database setup)
   - F3 (User entity)
   - F20 (Login page - no deps)

   After completing F5, can run in parallel:
   - F6 (GET by ID)
   - F7 (POST)
   - F21 (User List page)

8. EPIC DEPENDENCIES
   ──────────────────
   Epic: setup → domain → api → ui

   ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐
   │ setup  │ → │ domain │ → │  api   │ → │   ui   │
   └────────┘   └────────┘   └────────┘   └────────┘

╚════════════════════════════════════════════════════════════╝
```

---

## Mermaid Export

Command จะสร้างไฟล์ `.agent/dependencies.mmd`:

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#4F46E5'}}}%%
graph TD
    subgraph epic_setup["Setup"]
        F1["#1 Project structure<br/>⏱️ 15min"]
        F2["#2 Database setup<br/>⏱️ 20min"]
    end

    subgraph epic_domain["Domain"]
        F3["#3 User entity<br/>⏱️ 15min"]
        F4["#4 DbContext<br/>⏱️ 20min"]
    end

    subgraph epic_api["API"]
        F5["#5 GET /users<br/>⏱️ 20min"]
        F6["#6 GET /users/{id}<br/>⏱️ 15min"]
        F7["#7 POST /users<br/>⏱️ 20min"]
    end

    F1 --> F2
    F1 --> F3
    F2 --> F4
    F3 --> F4
    F4 --> F5
    F5 --> F6
    F5 --> F7

    %% Status styling
    classDef passed fill:#22C55E,stroke:#15803D,color:#fff
    classDef in_progress fill:#EAB308,stroke:#A16207,color:#000
    classDef pending fill:#94A3B8,stroke:#64748B,color:#000
    classDef blocked fill:#EF4444,stroke:#B91C1C,color:#fff

    class F1,F2 passed
    class F4 in_progress
    class F3,F5,F6,F7 pending
```

---

## Dependency Validation

### Circular Dependency Detection

```
Algorithm: DFS with visited tracking

For each feature:
  1. Start DFS from feature
  2. Track visited nodes in current path
  3. If revisit node in same path → circular!
  4. Report cycle path
```

### Missing Dependency Check

```
For each feature:
  1. Check all dependency IDs exist
  2. Check dependency feature is not itself
  3. Check dependency epic order makes sense

Warnings:
- Feature #X depends on non-existent feature #Y
- Feature #X has self-dependency
- Feature #X (api) depends on #Y (ui) - unusual order
```

---

## Recommended Next Actions

Based on analysis:

```
Current Status:
- Passed: 5 features
- In Progress: 1 feature
- Pending: 19 features

Recommended Next:
1. Complete F4 (DbContext) - unblocks 5 features
2. Then F5 (GET /users) - on critical path
3. Parallel: F6, F7 after F5

Optimization:
- F20 (Login) has no dependencies - can start now
- F21 (User List) only needs F5 - can start after F5
```

---

## Usage Examples

### View Dependencies for Specific Feature

```
/agent-dependencies --feature 5
```

Output:
```
Feature #5: GET /api/users

Depends on:
├── #4 DbContext [pending]
│   ├── #2 Database setup [passed]
│   └── #3 User entity [passed]
└── (all resolved)

Blocks:
├── #6 GET /users/{id}
├── #7 POST /users
└── #21 User List page
```

### View Epic Dependencies

```
/agent-dependencies --epics
```

Output:
```
Epic Dependency Graph:

setup (100% done)
   ↓
domain (50% done)
   ↓
api (0% done)
   ↓
ui (0% done)
```

---

## Notes

- Read-only command
- Mermaid diagram can be viewed in VS Code with Mermaid extension
- Use with `/agent-status` for complete project overview
- Run after adding new features to check for issues
