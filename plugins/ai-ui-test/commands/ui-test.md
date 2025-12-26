---
description: ทดสอบ UI อัตโนมัติเสมือนผู้ใช้จริง
allowed-tools: Bash(*), Read(*), Write(*), mcp__claude-in-chrome__*
---

# UI Test Command

ทดสอบ UI ด้วย browser automation

## Input ที่ได้รับ

```
/ui-test [scenario in natural language]
/ui-test ทดสอบหน้า Login
/ui-test ทดสอบ form สมัครสมาชิก
/ui-test --record-gif [scenario]
$ARGUMENTS
```

## ขั้นตอนที่ต้องทำ

### Step 1: Parse Scenario

วิเคราะห์ natural language เพื่อเข้าใจ:
1. หน้าที่ต้องทดสอบ (URL)
2. Actions ที่ต้องทำ (click, fill, navigate)
3. Expected results (ผลลัพธ์ที่คาดหวัง)

### Step 2: Setup Browser

```javascript
// ใช้ MCP claude-in-chrome
// 1. Get tab context
mcp__claude-in-chrome__tabs_context_mcp

// 2. Create new tab (if needed)
mcp__claude-in-chrome__tabs_create_mcp

// 3. Navigate to URL
mcp__claude-in-chrome__navigate url: "[URL]"
```

### Step 3: Execute Steps

ทำแต่ละ step ตามลำดับ:

```javascript
// Navigate
mcp__claude-in-chrome__navigate url: "/auth/login"

// Wait for page load
mcp__claude-in-chrome__computer action: "wait" duration: 2

// Take screenshot
mcp__claude-in-chrome__computer action: "screenshot"

// Find element
mcp__claude-in-chrome__find query: "email input"

// Fill form
mcp__claude-in-chrome__form_input ref: "ref_X" value: "test@test.com"

// Click button
mcp__claude-in-chrome__computer action: "left_click" ref: "ref_X"

// Verify result
mcp__claude-in-chrome__read_page tabId: X
```

### Step 4: Verify Assertions

1. ตรวจสอบ URL ปัจจุบัน
2. ตรวจสอบ elements ที่ต้องแสดง
3. ตรวจสอบ text content

### Step 5: Generate Report

```markdown
# UI Test Report

## Test: [scenario]
## Status: ✅ PASSED / ❌ FAILED
## Duration: Xs

## Steps Executed:
✅ 1. Navigate to /auth/login
✅ 2. Fill email
✅ 3. Fill password
✅ 4. Click Submit
❌ 5. Verify redirect (if failed)

## Error Details (if failed):
[error details]

## Screenshots:
📷 [screenshots]

## Recommendations:
[recommendations]
```

## GIF Recording Mode

ถ้าใช้ --record-gif:

```javascript
// Start recording
mcp__claude-in-chrome__gif_creator action: "start_recording"

// Execute steps with screenshots...

// Stop and export
mcp__claude-in-chrome__gif_creator action: "stop_recording"
mcp__claude-in-chrome__gif_creator action: "export" download: true
```

## Output

แสดง test report พร้อม:
1. Status (pass/fail)
2. Steps executed
3. Screenshots
4. GIF recording (if enabled)
5. Error details และ recommendations (if failed)
