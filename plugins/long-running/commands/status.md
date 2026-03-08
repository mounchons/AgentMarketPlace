---
description: ดูสถานะความคืบหน้าของโปรเจค
allowed-tools: Bash(*), Read(*)
---

# Agent Status - ดูความคืบหน้า

แสดงสถานะความคืบหน้าของโปรเจค

## ขั้นตอน

### 1. ตรวจสอบว่ามี agent environment

```bash
if [ -f ".agent/config.json" ]; then
  echo "✅ Agent environment found"
else
  echo "❌ No agent environment - run /init first"
  exit 1
fi
```

### 2. แสดงข้อมูล Project

```bash
cat .agent/config.json
```

### 3. แสดง Feature Summary

```bash
# Total features
cat feature_list.json | jq '.summary'

# Features ที่ pass แล้ว
echo "✅ Passed Features:"
cat feature_list.json | jq '.features[] | select(.passes == true) | {id, description}'

# Features ที่ยังไม่ pass
echo "❌ Remaining Features:"
cat feature_list.json | jq '.features[] | select(.passes == false) | {id, description, priority}'
```

### 4. แสดง Recent Progress

```bash
# ดู 20 บรรทัดล่าสุดของ progress
tail -50 .agent/progress.md
```

### 5. แสดง Git Status

```bash
git log --oneline -5
git status --short
```

## Output Format

แสดงผลในรูปแบบ:

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
