---
description: View project progress status
allowed-tools: Bash(*), Read(*)
---

# Agent Status - View Progress

Display project progress status.

## Steps

### 1. Check if agent environment exists

```bash
if [ -f ".agent/config.json" ]; then
  echo "✅ Agent environment found"
else
  echo "❌ No agent environment - run /init first"
  exit 1
fi
```

### 2. Display Project Info

```bash
cat .agent/config.json
```

### 3. Display Feature Summary

```bash
# Total features
cat feature_list.json | jq '.summary'

# Passed features
echo "✅ Passed Features:"
cat feature_list.json | jq '.features[] | select(.passes == true) | {id, description}'

# Remaining features
echo "❌ Remaining Features:"
cat feature_list.json | jq '.features[] | select(.passes == false) | {id, description, priority}'
```

### Model Assignment Overview (v2.1.0)

**If `model_config` exists in feature_list.json:**

```bash
# View model workload
cat feature_list.json | jq '.summary.model_workload'

# View features grouped by model
cat feature_list.json | jq '[.features[] | {id, description, assigned_model, status, is_reference_impl, review_result: .review.result}]'
```

Display:

```
🤖 Model Workload:
  Model     │ Assigned │ Done │ In Progress │ Pending Review
  ──────────┼──────────┼──────┼─────────────┼───────────────
  opus      │    4     │  3   │      1      │     -
  sonnet    │    5     │  2   │      1      │     2
  minimax   │    0     │  0   │      0      │     0
  glm       │    0     │  0   │      0      │     0
  unassigned│    3     │  -   │      -      │     -

📋 Features by Model:
  opus:
    ✅ #1 Create project structure (reference)
    🔄 #5 GET /api/resource
  sonnet:
    ✅ #2 Setup database (reviewed ✅ 85/100)
    ✅ #6 GET by ID (pending review ⏳)
  unassigned:
    🔲 #10 Input validation
```

**Icons:**
- Status: ✅ passed, 🔄 in_progress, 🔲 pending, ⛔ blocked
- Review: ✅ reviewed & passed, ⚠️ pass with suggestions, ❌ failed, ⏳ pending review
- `(reference)` = `is_reference_impl: true`

### Review Status (v2.1.0)

**If `review_status` exists in summary:**

```bash
cat feature_list.json | jq '.summary.review_status'

# Features awaiting review
cat feature_list.json | jq '[.features[] | select(.status == "passed" and .assigned_model != "opus" and .review == null) | {id, description}]'
```

Display:

```
📝 Review Summary: 2 reviewed, 3 pending
  ✅ Passed: 2 | ❌ Failed: 0

⏳ Awaiting Review: #6, #9, #12
  → Run /review to review next feature

✅ Recently Reviewed:
  #2 Setup database — pass (85/100) by opus
  #3 Create Entity — pass_with_suggestions (72/100) by opus
```

---

### Flow Progress (v2.0.0)

**If `flows[]` exists in feature_list.json:**

Display progress of each flow:

```
📊 Flow Progress:

  [icon] [Flow Name] ([type]): X/Y steps [status]
     ├── ✅ [Label] (Feature #N)
     ├── 🔄 [Label] (Feature #N) ← IN PROGRESS
     ├── 🔲 [Label] (Feature #N)
     └── 🔲 [Label] (Feature #N)
     State: [State1] ✅ → [State2] ❌ → [State3] ❌
```

**Icons:**
- Flow types: 🛒 wizard, 📋 crud-group, 📊 parallel
- Step status: ✅ passed, 🔄 in_progress, 🔲 pending, ⛔ blocked

**State Progress:**
- Display state_contracts related to flow
- ✅ = produced_by feature that has passes: true
- ❌ = not yet produced

**If has `state_contracts`:**

```
🔗 State Contracts:
  ✅ AuthState (localStorage) — produced by Feature #1
  ✅ CartState (session) — produced by Feature #3
  ❌ ShippingState (session) — not yet produced
  ❌ PaymentResult (session) — not yet produced
```

**If has `requires_components` that aren't ready:**

```
⚠️ Blocked Features:
  Feature #8 (Payment Page) — requires: StepIndicator ❌, PriceDisplay ❌
  Feature #10 (User List) — requires: AuthGuard ❌
```

### 4. Display Recent Progress

```bash
# View last 50 lines of progress
tail -50 .agent/progress.md
```

### 5. Display Git Status

```bash
git log --oneline -5
git status --short
```

## Output Format

Display in this format:

```markdown
# 📊 Project Status: PROJECT_NAME

## Summary
- Total Features: X
- Passed: Y (Z%)
- Remaining: W

## ✅ Completed Features
1. Feature #1: description
2. Feature #2: description
...

## 📋 Next Features (Priority Order)
1. Feature #X: description [HIGH]
2. Feature #Y: description [MEDIUM]
...

## 📈 Recent Activity
- Session N: Feature #X completed
- Session N-1: Feature #W completed

## 🚀 To Continue
Run `/continue` to work on the next feature
```

> 💬 **หมายเหตุ**: คำสั่งนี้จะตอบกลับเป็นภาษาไทย
