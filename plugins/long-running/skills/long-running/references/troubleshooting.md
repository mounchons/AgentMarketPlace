# Troubleshooting Guide

Solutions for common problems when using Long-Running Agent

## 🔴 Common Problems & Solutions

### Problem 1: Context Lost - Agent doesn't know what was already done

**Symptoms:**
```
Agent: "ผมไม่เห็นไฟล์ที่คุณพูดถึงครับ"
Agent: "โปรเจคนี้ต้องทำอะไรบ้างครับ?"
```

**Cause:**
- Did not read progress.md before starting work
- New session has no context

**Solution:**
```bash
# 1. Have the agent read progress first
cat .agent/progress.md

# 2. Have it view git log
git log --oneline -10

# 3. Have it view the feature list
cat feature_list.json
```

**Prevention:**
- Use the `/continue` command which forces reading context

---

### Problem 2: Agent works on multiple features in 1 session

**Symptoms:**
```
Agent: "เสร็จแล้วครับ! ผมทำ Feature #1, #2, #3, #4 ให้เลย"
```

**Cause:**
- Prompt not clear enough
- Agent tries to one-shot

**Solution:**
```
Tell the agent:
"Work on only 1 feature at a time.
After completing it, commit and update progress.
Then stop and wait for the next instruction."
```

**Prevention:**
- Use the `/continue` command which has clear rules
- Set config: `"max_features_per_session": 1`

---

### Problem 3: Feature marked pass without testing

**Symptoms:**
```json
{
  "id": 5,
  "passes": true,
  "notes": ""  // no test notes
}
```

**How to verify:**
```bash
# 1. Find features that passed but have no notes
cat feature_list.json | jq '.features[] | select(.passes == true and .notes == "")'

# 2. Test the feature yourself
curl http://localhost:5000/api/todos
```

**Solution:**
```
Tell the agent:
"Before marking pass you must:
1. Actually test (curl, Postman, or run tests)
2. Write test results in notes
3. Include tested_at timestamp"
```

**Prevention:**
- Add validation to the feature_list.json schema
- Set config: `"require_tests": true`

---

### Problem 4: Build fails after previous session

**Symptoms:**
```bash
$ dotnet build
error CS1002: ; expected
Build FAILED.
```

**Cause:**
- Previous session left work in an incomplete state
- Merge conflict
- Missing dependencies

**Solution:**
```bash
# 1. View the error
dotnet build 2>&1

# 2. If fixable
# Fix code → build → commit fix

# 3. If not fixable
git log --oneline -5  # view previous commits
git checkout HEAD~1   # go back to previous commit

# 4. Or revert only the problematic commit
git revert abc1234
```

---

### Problem 5: feature_list.json modified incorrectly

**Symptoms:**
```json
// Features missing
// or descriptions changed
// or format is wrong
```

**Solution:**
```bash
# 1. View file history
git log --oneline feature_list.json

# 2. See what changed
git diff HEAD~1 feature_list.json

# 3. Restore from previous commit
git checkout HEAD~1 -- feature_list.json

# 4. Re-apply passes status
```

**Prevention:**
- Emphasize to the agent that only `passes` and `notes` can be modified
- Use JSON schema validation

---

### Problem 6: Progress log not updated

**Symptoms:**
```markdown
# .agent/progress.md
## Session 1 - INITIALIZER
...
(no session 2, 3, 4 even though work was done)
```

**Solution:**
```bash
# 1. View git log to reconstruct history
git log --oneline

# 2. Create the missing progress entries
# Use commit messages and feature_list.json changes as reference
```

**Prevention:**
- Include in checklist that progress must be updated before ending session
- Verify progress is updated before committing

---

### Problem 7: Agent declares "done" when it's not finished

**Symptoms:**
```
Agent: "โปรเจคเสร็จสมบูรณ์แล้วครับ!"

But feature_list.json:
- passed: 5/15
```

**Solution:**
```
Tell the agent:
"Check feature_list.json before declaring completion.
All features must have passes == true.
If not complete, state how many features remain."
```

---

### Problem 8: Duplicate Features

**Symptoms:**
```json
{
  "features": [
    { "id": 5, "description": "GET /api/todos" },
    { "id": 6, "description": "GET /api/todos" }  // duplicate!
  ]
}
```

**Solution:**
```bash
# 1. Remove the duplicate feature
# 2. Re-number features if necessary
# 3. Update references
```

**Prevention:**
- Check for uniqueness during initialization
- Use clearly distinct descriptions

---

## 🛠️ Recovery Commands

### Reset to Clean State

```bash
# Option 1: Soft reset (keep changes as unstaged)
git reset HEAD~1

# Option 2: Hard reset (discard changes)
git reset --hard HEAD~1

# Option 3: Revert specific commit
git revert <commit-hash>
```

### Recreate Progress from Git

```bash
# Rebuild progress log from git history
git log --format="## Session
**Date**: %ci
**Commit**: %h

### Message:
%s

%b
---" > .agent/progress-reconstructed.md
```

### Validate feature_list.json

```bash
# Check JSON syntax
python -c "import json; json.load(open('feature_list.json'))"

# Check structure with jq
cat feature_list.json | jq '.features | length'
cat feature_list.json | jq '.features[] | select(.passes == true) | .id'
```

---

## 📋 Diagnostic Checklist

When encountering problems, check the following:

### Environment
- [ ] `pwd` - In the correct project directory?
- [ ] `git status` - Any uncommitted changes?
- [ ] `dotnet build` (or equivalent) - Build passes?

### Files
- [ ] `cat .agent/config.json` - Config correct?
- [ ] `cat .agent/progress.md` - Progress updated?
- [ ] `cat feature_list.json | jq '.summary'` - Summary correct?

### Git
- [ ] `git log --oneline -5` - Commits match progress?
- [ ] `git diff` - Any uncommitted changes?

### Agent State
- [ ] Does the agent know which feature it's working on?
- [ ] Does the agent know which features have passed?
- [ ] Does the agent know what to do next?

---

## 💡 Best Practices to Avoid Problems

### 1. Always Use Commands

```bash
# Use /init instead of initializing manually
# Use /continue instead of telling the agent to continue
# Use /status to check status
```

### 2. Commit Often

```bash
# Commit every time a feature is complete
# Do not wait to commit multiple features at once
```

### 3. Update Progress Before Ending

```markdown
Before ending every session:
1. ✅ Feature completed
2. ✅ Tests passed
3. ✅ Changes committed
4. ✅ Progress updated  <-- don't forget!
```

### 4. Verify Build Before Ending

```bash
# Before ending session
dotnet build  # must pass
dotnet run    # must work (if applicable)
```

### 5. Review Before Marking Pass

```
Before marking a feature as pass:
- ✅ Code compiles
- ✅ Tests pass
- ✅ Manual test works
- ✅ Edge cases handled
```
