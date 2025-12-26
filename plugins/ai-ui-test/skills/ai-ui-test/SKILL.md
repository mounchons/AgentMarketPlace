---
name: ai-ui-test
description: |
  ทดสอบ UI อัตโนมัติเสมือนผู้ใช้จริง ใช้ browser automation ทดสอบ user flows,
  form submissions, navigation และ responsive design พร้อมสร้าง test reports

  ใช้เมื่อ: (1) ทดสอบ UI เสมือนคนใช้จริง (2) ทดสอบ user flows (3) ทดสอบ forms
  (4) ทดสอบ responsive (5) สร้าง test scenarios (6) regression testing

  Triggers: "ui test", "ทดสอบ UI", "test หน้า", "ทดสอบหน้า", "browser test",
  "e2e test", "end to end", "user flow test", "regression test"
---

# AI UI Test Skill

Skill สำหรับทดสอบ UI อัตโนมัติเสมือนผู้ใช้จริง ใช้ browser automation พร้อมสร้าง test reports

## วัตถุประสงค์

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AI UI TEST WORKFLOW                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐                                                        │
│  │   Test Scenario │  "ทดสอบ Login flow"                                    │
│  │   (Natural Lang)│  "ทดสอบการสมัครสมาชิก"                                  │
│  └────────┬────────┘                                                        │
│           │                                                                  │
│           ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │                      AI UI TEST SKILL                             │       │
│  │                                                                   │       │
│  │  1. Parse scenario → เข้าใจสิ่งที่ต้องทดสอบ                        │       │
│  │  2. Open browser → เปิด browser ไปที่ URL                         │       │
│  │  3. Execute steps → ทำตาม steps (click, type, navigate)          │       │
│  │  4. Verify results → ตรวจสอบผลลัพธ์                               │       │
│  │  5. Take screenshots → บันทึกหลักฐาน                              │       │
│  │  6. Generate report → สร้าง test report                          │       │
│  │                                                                   │       │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │       │
│  │  │   Browser   │  │ Screenshot  │  │    GIF      │               │       │
│  │  │ Automation  │  │   Capture   │  │  Recording  │               │       │
│  │  └─────────────┘  └─────────────┘  └─────────────┘               │       │
│  │                                                                   │       │
│  └──────────────────────────────────────────────────────────────────┘       │
│           │                                                                  │
│           ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │                       TEST REPORT                                 │       │
│  │                                                                   │       │
│  │  ✅ PASSED / ❌ FAILED                                            │       │
│  │  • Steps executed                                                 │       │
│  │  • Screenshots                                                    │       │
│  │  • GIF recording                                                  │       │
│  │  • Error details (if failed)                                      │       │
│  │  • Recommendations                                                │       │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## ตัวอย่างคำสั่งที่ใช้ได้

| สิ่งที่ต้องการ | ตัวอย่างคำสั่ง |
|---------------|---------------|
| **ทดสอบ Login** | `/ui-test ทดสอบ Login ด้วย email test@test.com password 123456` |
| **ทดสอบ Form** | `/ui-test ทดสอบ form สมัครสมาชิก` |
| **ทดสอบ Flow** | `/ui-test ทดสอบ flow การสั่งซื้อสินค้า` |
| **ทดสอบ Responsive** | `/ui-test ทดสอบ responsive หน้า Dashboard` |
| **Regression Test** | `/ui-test-all` |

---

## Commands

### 1. /ui-test - ทดสอบ UI Scenario

```bash
# ทดสอบ scenario เดียว
/ui-test ทดสอบหน้า Login

# ทดสอบพร้อม test data
/ui-test ทดสอบ Login ด้วย email: test@test.com, password: Test@123

# ทดสอบ flow
/ui-test ทดสอบ flow การสั่งซื้อ: เพิ่มสินค้า → ไป cart → checkout → ชำระเงิน

# ทดสอบ responsive
/ui-test ทดสอบ responsive หน้า Home บน mobile, tablet, desktop

# บันทึกเป็น GIF
/ui-test ทดสอบ Login --record-gif
```

### 2. /ui-test-all - Regression Test

```bash
# รัน tests ทั้งหมดจาก test scenarios
/ui-test-all

# รัน tests เฉพาะ category
/ui-test-all --category auth
/ui-test-all --category checkout
```

### 3. /ui-test-create - สร้าง Test Scenario

```bash
# สร้าง test scenario ใหม่
/ui-test-create สร้าง test scenario สำหรับหน้า Login

# สร้างจาก mockup
/ui-test-create จาก .mockups/login.mockup.md
```

---

## Test Scenario Format

### Natural Language (แนะนำ)

```
ทดสอบหน้า Login:
1. ไปที่หน้า /auth/login
2. กรอก email: test@test.com
3. กรอก password: Test@123
4. กดปุ่ม Login
5. ตรวจสอบว่า redirect ไป /dashboard
6. ตรวจสอบว่าแสดงชื่อผู้ใช้ "Test User"
```

### Structured Format

```yaml
name: Login Test
description: ทดสอบการ login ด้วย email/password ที่ถูกต้อง
url: /auth/login
category: auth
priority: high

steps:
  - action: navigate
    url: /auth/login
    wait: 2000

  - action: fill
    selector: input[name="email"]
    value: test@test.com

  - action: fill
    selector: input[name="password"]
    value: Test@123

  - action: click
    selector: button[type="submit"]
    wait: 3000

assertions:
  - type: url
    expected: /dashboard
    message: Should redirect to dashboard

  - type: element
    selector: .user-name
    contains: Test User
    message: Should show user name

  - type: element
    selector: .welcome-message
    visible: true
    message: Welcome message should be visible

screenshots:
  - name: login-form
    step: 1
  - name: dashboard
    step: 5
```

---

## Test Execution

### การทำงานของ AI UI Test

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TEST EXECUTION FLOW                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Step 1: Parse Scenario                                                      │
│  ├── เข้าใจ natural language                                                │
│  ├── แปลงเป็น executable steps                                              │
│  └── ระบุ assertions                                                        │
│                                                                              │
│  Step 2: Setup Browser                                                       │
│  ├── เปิด Chrome (via MCP)                                                  │
│  ├── ตั้งค่า viewport size                                                   │
│  └── Navigate to URL                                                        │
│                                                                              │
│  Step 3: Execute Steps                                                       │
│  ├── ทำแต่ละ step ตามลำดับ                                                   │
│  ├── รอ element พร้อม (wait for selector)                                   │
│  ├── Take screenshot ทุก step (optional)                                    │
│  └── Record GIF (optional)                                                  │
│                                                                              │
│  Step 4: Verify Assertions                                                   │
│  ├── ตรวจสอบ URL                                                            │
│  ├── ตรวจสอบ elements                                                       │
│  ├── ตรวจสอบ text content                                                   │
│  └── ตรวจสอบ visual state                                                   │
│                                                                              │
│  Step 5: Generate Report                                                     │
│  ├── Summary (pass/fail)                                                    │
│  ├── Step-by-step results                                                   │
│  ├── Screenshots                                                            │
│  ├── Error details                                                          │
│  └── Recommendations                                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Test Report Output

### Passed Test

```
┌─────────────────────────────────────────────────────────────────┐
│                    UI TEST REPORT                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Test: Login with valid credentials                              │
│  Status: ✅ PASSED                                               │
│  Duration: 5.2s                                                  │
│                                                                  │
│  Steps Executed:                                                 │
│  ✅ 1. Navigate to /auth/login                                   │
│  ✅ 2. Fill email: test@test.com                                 │
│  ✅ 3. Fill password: ********                                   │
│  ✅ 4. Click Submit button                                       │
│  ✅ 5. Verify redirect to /dashboard                             │
│  ✅ 6. Verify user name displayed                                │
│                                                                  │
│  Screenshots:                                                    │
│  📷 login-form.png                                               │
│  📷 dashboard.png                                                │
│                                                                  │
│  🎬 Recording: login-test.gif                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Failed Test

```
┌─────────────────────────────────────────────────────────────────┐
│                    UI TEST REPORT                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Test: Login with valid credentials                              │
│  Status: ❌ FAILED                                               │
│  Duration: 8.1s                                                  │
│                                                                  │
│  Steps Executed:                                                 │
│  ✅ 1. Navigate to /auth/login                                   │
│  ✅ 2. Fill email: test@test.com                                 │
│  ✅ 3. Fill password: ********                                   │
│  ✅ 4. Click Submit button                                       │
│  ❌ 5. Verify redirect to /dashboard                             │
│                                                                  │
│  Error Details:                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Expected URL: /dashboard                                 │    │
│  │ Actual URL: /auth/login                                  │    │
│  │                                                          │    │
│  │ Error message on page:                                   │    │
│  │ "Invalid email or password"                              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Screenshots:                                                    │
│  📷 error-state.png                                              │
│                                                                  │
│  💡 Possible Causes:                                             │
│  1. Test credentials might be incorrect                          │
│  2. User might not exist in test database                        │
│  3. Password policy might have changed                           │
│                                                                  │
│  💡 Recommendations:                                             │
│  1. Verify test user exists: test@test.com                       │
│  2. Check if password meets requirements                         │
│  3. Review authentication service logs                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Responsive Testing

```bash
/ui-test ทดสอบ responsive หน้า Dashboard

# หรือระบุ breakpoints
/ui-test ทดสอบ responsive หน้า Dashboard --breakpoints mobile,tablet,desktop
```

**Output:**

```
┌─────────────────────────────────────────────────────────────────┐
│                 RESPONSIVE TEST REPORT                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Page: /dashboard                                                │
│                                                                  │
│  Breakpoints Tested:                                             │
│                                                                  │
│  📱 Mobile (375x667)                                             │
│  ├── ✅ Navigation: Hamburger menu visible                       │
│  ├── ✅ Content: Single column layout                            │
│  ├── ✅ Cards: Stack vertically                                  │
│  └── 📷 Screenshot: dashboard-mobile.png                         │
│                                                                  │
│  📱 Tablet (768x1024)                                            │
│  ├── ✅ Navigation: Collapsed sidebar                            │
│  ├── ✅ Content: 2-column layout                                 │
│  ├── ✅ Cards: 2 per row                                         │
│  └── 📷 Screenshot: dashboard-tablet.png                         │
│                                                                  │
│  🖥️ Desktop (1920x1080)                                          │
│  ├── ✅ Navigation: Full sidebar visible                         │
│  ├── ✅ Content: 3-column layout                                 │
│  ├── ✅ Cards: 4 per row                                         │
│  └── 📷 Screenshot: dashboard-desktop.png                        │
│                                                                  │
│  Overall: ✅ ALL BREAKPOINTS PASSED                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Common Test Scenarios

### 1. Authentication Tests

```yaml
scenarios:
  - name: Login Success
    steps:
      - navigate: /auth/login
      - fill: email → valid@email.com
      - fill: password → ValidPass123
      - click: Submit
    expect:
      - redirect: /dashboard
      - visible: .user-menu

  - name: Login Failure
    steps:
      - navigate: /auth/login
      - fill: email → invalid@email.com
      - fill: password → wrong
      - click: Submit
    expect:
      - url: /auth/login
      - visible: .error-message
      - text: "Invalid credentials"

  - name: Logout
    steps:
      - navigate: /dashboard (logged in)
      - click: .user-menu
      - click: Logout
    expect:
      - redirect: /auth/login
      - not-visible: .user-menu
```

### 2. Form Tests

```yaml
scenarios:
  - name: Form Validation
    steps:
      - navigate: /register
      - click: Submit (empty form)
    expect:
      - visible: .error-email
      - visible: .error-password
      - text: "Email is required"

  - name: Form Submit Success
    steps:
      - navigate: /register
      - fill: name → John Doe
      - fill: email → john@test.com
      - fill: password → Test@123
      - click: Submit
    expect:
      - redirect: /dashboard
      - toast: "Registration successful"
```

### 3. CRUD Tests

```yaml
scenarios:
  - name: Create Item
    steps:
      - navigate: /items
      - click: Add New
      - fill: name → New Item
      - fill: description → Description
      - click: Save
    expect:
      - redirect: /items
      - visible: "New Item" in table

  - name: Edit Item
    steps:
      - navigate: /items/1/edit
      - clear: name
      - fill: name → Updated Item
      - click: Save
    expect:
      - redirect: /items
      - visible: "Updated Item"

  - name: Delete Item
    steps:
      - navigate: /items
      - click: Delete on row 1
      - click: Confirm
    expect:
      - not-visible: "Item 1"
      - toast: "Deleted successfully"
```

---

## Integration with Mockups

ใช้ mockups เป็น reference สำหรับสร้าง tests:

```bash
# สร้าง tests จาก mockup
/ui-test-create จาก .mockups/login.mockup.md

# Claude จะ:
# 1. อ่าน mockup file
# 2. ระบุ components และ interactions
# 3. สร้าง test scenarios อัตโนมัติ
```

---

## Test Storage

```
project-root/
└── .ui-tests/
    ├── scenarios/
    │   ├── auth.yaml
    │   ├── dashboard.yaml
    │   └── orders.yaml
    ├── screenshots/
    │   ├── login-form.png
    │   └── dashboard.png
    ├── recordings/
    │   └── login-test.gif
    └── reports/
        ├── latest.html
        └── history/
            └── 2025-01-20.html
```

---

## Commands Reference

| Command | Description |
|---------|-------------|
| `/ui-test [scenario]` | รัน UI test scenario |
| `/ui-test --record-gif` | รัน test พร้อมบันทึก GIF |
| `/ui-test-all` | รัน tests ทั้งหมด (regression) |
| `/ui-test-all --category [cat]` | รัน tests เฉพาะ category |
| `/ui-test-create [page]` | สร้าง test scenario ใหม่ |
| `/ui-test-create จาก [mockup]` | สร้าง tests จาก mockup |

---

## Best Practices

1. **ใช้ test data ที่ consistent** - สร้าง test users/data ที่ใช้ซ้ำได้
2. **ทำ cleanup หลัง test** - ลบ data ที่สร้างระหว่าง test
3. **ใช้ meaningful names** - ตั้งชื่อ test ที่อธิบายสิ่งที่ทดสอบ
4. **บันทึก screenshots** - สำหรับ debug เมื่อ test fail
5. **ทำ responsive testing** - ทดสอบทุก breakpoints
6. **รัน regression tests** - ก่อน deploy ทุกครั้ง

---

## References

| File | Description |
|------|-------------|
| `references/test-patterns.md` | UI test patterns |
| `references/selectors.md` | วิธีเลือก selectors ที่ดี |
| `references/wait-strategies.md` | Wait strategies |
