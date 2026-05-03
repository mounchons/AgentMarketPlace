# Test Template Catalog + Auto-Detection Rules

> Single source of truth สำหรับ `/qa-create-scenario --auto`
> บอกว่า: เจอ pattern แบบไหน → ใช้ template ไหน → สร้างกี่ scenarios

---

## How auto-detection works

`/qa-create-scenario --auto` ใช้ subagent อ่าน codebase แล้ว classify แต่ละหน้าเป็น **page type**
จากนั้น page type → mapped to **template** → สร้าง scenarios อัตโนมัติ

**Detection priority (high → low):**
1. Multi-step Wizard (มี stepper/wizard component)
2. Master-Detail Grid (มี parent-child grid)
3. Master Data CRUD (มี table + CRUD buttons)
4. Login Form (มี email + password + submit)
5. Form (generic form + submit)
6. Dashboard (charts + metrics)
7. Custom (fallback)

**Cross-cutting templates** (สร้างเพิ่มจาก page type หลัก):
- **Role-based** — per (role × page × action) ถ้ามี roles
- **Cascade** — per master→detail relationship ถ้ามี FK
- **Serial Group / Lifecycle** — per entity ที่มี Create/Edit/Delete chain

---

## Template 1: Login Form

**ID prefix:** `TS-LOGIN-{NNN}`
**Scenarios count:** 5-8
**Page type:** `login`

### Detection rules (must match ALL)

```
File patterns:
  ✓ Path contains: /login, /signin, /auth, Login.cshtml, login.tsx, login.vue
  ✓ Or controller: LoginController, AuthController, AccountController.Login

Component features:
  ✓ Has 1 password input (input[type="password"])
  ✓ Has 1 email/username input
  ✓ Has 1 submit button (Login/Sign in/เข้าสู่ระบบ)

Code signals:
  ✓ Calls SignInManager.PasswordSignInAsync (.NET)
  ✓ Calls signIn() / authenticate() (Node)
  ✓ Sets cookie/JWT after submit
```

### Standard scenarios

```
TS-LOGIN-001: Login ด้วย credentials ถูกต้อง → redirect dashboard
TS-LOGIN-002: Email ผิด format → แสดง error
TS-LOGIN-003: Password ผิด → แสดง error "Invalid credentials"
TS-LOGIN-004: Email ไม่มีในระบบ → แสดง error
TS-LOGIN-005: Empty form submit → required field errors
TS-LOGIN-006: SQL injection in email → sanitized/rejected
TS-LOGIN-007: Brute force (5 ครั้งติด) → rate limit/lockout (ถ้ามี)
TS-LOGIN-008: Remember me checkbox → cookie persist (ถ้ามี)
```

---

## Template 2: Form (Generic)

**ID prefix:** `TS-FORM-{NNN}` หรือ `TS-{MODULE}-{NNN}`
**Scenarios count:** 9 (mandatory) + extras จาก fields
**Page type:** `form`

### Detection rules

```
Component features:
  ✓ มี <form> หรือ form-like container
  ✓ มี input/select/textarea fields ≥ 1
  ✓ มี submit button
  ✗ ไม่มี table list (ถ้ามี → master-data แทน)
  ✗ ไม่มี stepper/wizard (ถ้ามี → wizard แทน)

Examples:
  - Contact form
  - Subscribe newsletter
  - Settings page
  - Single-page registration
```

### Mandatory scenarios (9 base)

```
TS-{MODULE}-001: Happy path — กรอกถูกต้อง, submit สำเร็จ
TS-{MODULE}-002: Required fields empty → all validation errors
TS-{MODULE}-003: Each field invalid (1 ที่ละ field)
TS-{MODULE}-004: All fields invalid → multiple errors
TS-{MODULE}-005: Boundary min — 1 char, 0 amount
TS-{MODULE}-006: Boundary max — 255 chars, max amount
TS-{MODULE}-007: Special chars — Thai, emoji, <script>, SQL
TS-{MODULE}-008: Duplicate submission (double-click)
TS-{MODULE}-009: Browser back during flow
```

### Auto-extend per field type

```
ถ้ามี field type=email     → +1 invalid email format scenario
ถ้ามี field type=number    → +1 negative number scenario
ถ้ามี field type=date      → +1 past date / future date scenario
ถ้ามี field type=file      → +2 wrong format / too large scenarios
ถ้ามี field type=url       → +1 invalid URL scenario
ถ้ามี field with unique   → +1 duplicate value scenario
```

---

## Template 3: Master Data CRUD

**ID prefix:** `TS-{MODULE}-{NNN}`
**Scenarios count:** 13
**Page type:** `master-data`

### Detection rules

```
Component features:
  ✓ มี <table> หรือ data grid (DataGrid/AgGrid/MUI Table/Antd Table)
  ✓ มี Add/Create/เพิ่ม button
  ✓ Each row มี Edit + Delete actions
  ✓ มี search/filter input (optional but common)

Code signals:
  ✓ Controller: GetAll/Index + Create + Update + Delete actions
  ✓ EF: DbSet<Entity> + repository pattern
  ✓ Hooks: useGetXxx + useCreateXxx + useUpdateXxx + useDeleteXxx
```

### Standard scenarios

```
TS-{MODULE}-001: List view — ตาราง, pagination, จำนวนรายการ
TS-{MODULE}-002: Create happy path — กรอกถูก, submit, ตรวจในตาราง
TS-{MODULE}-003: Create negative — validation errors
TS-{MODULE}-004: Create boundary — min/max, ภาษาไทย, special chars
TS-{MODULE}-005: Edit happy path — โหลดข้อมูลเดิม, แก้, save
TS-{MODULE}-006: Edit negative — validation errors ขณะแก้
TS-{MODULE}-007: Delete confirm — ยืนยันลบ, หายจากตาราง
TS-{MODULE}-008: Delete cancel — ยกเลิกลบ, ยังอยู่
TS-{MODULE}-009: Search/Filter — ค้นหาตาม columns
TS-{MODULE}-010: Sort — เรียงตาม columns
TS-{MODULE}-011: Pagination — เปลี่ยนหน้า, page size
TS-{MODULE}-012: Empty state — ไม่มีข้อมูล
TS-{MODULE}-013: Duplicate — สร้างซ้ำ (ถ้ามี unique constraint)
```

---

## Template 4: Master-Detail Grid

**ID prefix:** `TS-{MODULE}-{NNN}`
**Scenarios count:** 15
**Page type:** `master-detail`

### Detection rules

```
Component features:
  ✓ มี master table (เหมือน Template 3)
  ✓ Row expandable (click → expand)
  ✓ Detail grid ซ้อนใน expanded row
  ✓ Detail grid มี inline editing (dblclick / edit mode)
  ✓ Master row มี total/count column ที่อ้างอิง detail

Examples:
  - Order ↔ OrderItems
  - Invoice ↔ InvoiceLines
  - PurchaseRequisition ↔ PRItems

Code signals:
  ✓ Entity มี navigation collection: order.Items
  ✓ Frontend: ExpandableRow + nested Table
  ✓ Master schema มี computed total: Sum(Items.Amount)
```

### Standard scenarios

```
TS-{MODULE}-001: Master list view              TS-{MODULE}-009: Edit detail row inline
TS-{MODULE}-002: Master search/filter          TS-{MODULE}-010: Edit detail — negative
TS-{MODULE}-003: Master pagination             TS-{MODULE}-011: Delete detail (confirm)
TS-{MODULE}-004: Create new master record      TS-{MODULE}-012: Delete detail (cancel)
TS-{MODULE}-005: Expand detail grid            TS-{MODULE}-013: Master-detail sync (totals)
TS-{MODULE}-006: View detail rows              TS-{MODULE}-014: Collapse detail grid
TS-{MODULE}-007: Add detail row inline         TS-{MODULE}-015: Multiple rows expand/collapse
TS-{MODULE}-008: Add detail — negative
```

---

## Template 5: Multi-step Wizard

**ID prefix:** `TS-{MODULE}-WIZARD-{NNN}`
**Scenarios count:** N+5 (โดย N = จำนวน steps)
**Page type:** `wizard`

### Detection rules

```
Component features:
  ✓ มี stepper/wizard component:
    - <Stepper>, <Steps>, <Wizard>, <FormWizard>
    - role="tablist" ที่มี role="tab" หลายตัว
    - Class names: .step, .wizard-step, .multi-step
  ✓ มีปุ่ม Next/Back หรือ Continue/Previous
  ✓ Form fields กระจายข้ามหลาย panel/section
  ✓ Optional: progress bar / step indicator

OR
  ✓ Multiple URLs ในลำดับเดียวกัน:
    /checkout/cart → /checkout/shipping → /checkout/payment

Examples:
  - Checkout (cart → shipping → payment → confirm)
  - Multi-page registration
  - Onboarding flow
  - Application form (personal → education → work → review)
```

### Standard scenarios

```
For each step (N total):
  TS-{MODULE}-WIZARD-{step}: Happy path through step N
  
Cross-cutting:
  TS-{MODULE}-WIZARD-FULL: Complete all steps end-to-end (1 test, test.step() pattern)
  TS-{MODULE}-WIZARD-BACK: Navigate back from step N → state preserved
  TS-{MODULE}-WIZARD-CANCEL: Cancel mid-flow → confirmation dialog
  TS-{MODULE}-WIZARD-SKIP: Try jumping to step 3 without completing 1, 2 → blocked
  TS-{MODULE}-WIZARD-RESUME: Refresh page mid-flow → resume from current step (ถ้ามี)
```

### Playwright pattern

ใช้ **single test + test.step()** สำหรับ FULL flow:

```typescript
test('TS-CHECKOUT-WIZARD-FULL: complete 3-step checkout', async ({ page }) => {
  await test.step('Stage 1: Cart', async () => {
    await page.goto('/checkout/cart');
    await page.getByRole('button', { name: /proceed/i }).click();
  });

  await test.step('Stage 2: Shipping', async () => {
    await page.waitForURL('**/shipping**');
    await page.getByLabel(/name/i).fill('ทดสอบ สกุล');
    await page.getByRole('button', { name: /next/i }).click();
  });

  await test.step('Stage 3: Payment', async () => {
    await page.waitForURL('**/payment**');
    await page.getByLabel(/card/i).fill('4111111111111111');
    await page.getByRole('button', { name: /pay/i }).click();
    await expect(page.getByText(/success/i)).toBeVisible();
  });
});
```

---

## Template 6: Dashboard

**ID prefix:** `TS-{MODULE}-DASH-{NNN}`
**Scenarios count:** 3-5
**Page type:** `dashboard`

### Detection rules

```
Component features:
  ✓ มี chart/graph components:
    - <Chart>, <LineChart>, <BarChart>, <Recharts>, <ApexCharts>, <Chartjs>
  ✓ มี metric cards / KPI tiles
  ✓ มี date range picker หรือ filter
  ✗ ไม่มี Edit/Delete actions (read-only)

Code signals:
  ✓ Controller: aggregation queries (GroupBy, Sum, Count)
  ✓ Frontend: useDashboard / useMetrics hooks
```

### Standard scenarios

```
TS-{MODULE}-DASH-001: Initial load — charts/metrics แสดง
TS-{MODULE}-DASH-002: Empty state — ไม่มีข้อมูล
TS-{MODULE}-DASH-003: Filter by date range → charts update
TS-{MODULE}-DASH-004: Refresh → ข้อมูลใหม่
TS-{MODULE}-DASH-005: Export (CSV/PDF) ถ้ามี
```

---

## Template 7: Cascade Testing (Cross-cutting)

**ID prefix:** `TS-CASCADE-{MASTER}-{DEPENDENT}-{NNN}`
**Scenarios count:** 5-7 ต่อ relationship
**Trigger:** เมื่อมี FK relationship ระหว่าง master ↔ detail

### Detection rules

```
Database/Code signals:
  ✓ Foreign key relationship ใน schema/migration
  ✓ Navigation property ใน Entity (Product.Category, Product.CategoryId)
  ✓ Frontend dropdown ที่ดึงข้อมูลจาก master
  ✓ List filter ที่อ้างอิง master
  ✓ OnDelete behavior: Restrict / Cascade / SetNull
```

### Standard scenarios per relationship

```
TS-CASCADE-{MASTER}-{DEPENDENT}-UPDATE:
  แก้ master → dependent แสดงข้อมูลใหม่ทุกที่

TS-CASCADE-{MASTER}-{DEPENDENT}-DELETE-RESTRICT:
  ลบ master ที่มี dependents → error msg

TS-CASCADE-{MASTER}-{DEPENDENT}-DELETE-EMPTY:
  ลบ master ที่ไม่มี dependents → สำเร็จ

TS-CASCADE-{MASTER}-{DEPENDENT}-DROPDOWN:
  เพิ่ม/แก้/ลบ master → dropdown ใน dependent อัพเดท

TS-CASCADE-{MASTER}-{DEPENDENT}-DISABLE:
  Disable master → dependent ยังทำงาน?

TS-CASCADE-{MASTER}-{DEPENDENT}-INDIRECT (A→B→C):
  แก้ Category → ดู Product → ดู Order ยังถูก?
```

### qa-tracker.json entry

```json
{
  "cascade_dependencies": [
    {
      "master_module": "CATEGORY",
      "master_page": "/admin/categories",
      "dependent_modules": [
        {
          "module": "PRODUCT",
          "page": "/admin/products",
          "relationship": "Product.CategoryId → Category.Id",
          "on_delete": "Restrict",
          "affected_elements": [
            "Category column in Product list",
            "Category dropdown in Product form"
          ]
        }
      ]
    }
  ]
}
```

---

## Template 8: Serial Group / Lifecycle (Cross-cutting) ⭐ NEW

**ID prefix:** `TS-{MODULE}-LIFECYCLE-{NNN}`
**Scenarios count:** 3-5 chained
**Trigger:** เมื่อ entity มี full CRUD lifecycle ที่ทดสอบทีละขั้นได้

### Detection rules

```
Code signals:
  ✓ Controller มี actions ครบ: Create + Read + Update + Delete
  ✓ Entity มี state field (status, state, isActive) — บอก lifecycle
  ✓ มี business workflow:
    Order: Draft → Submitted → Paid → Shipped → Delivered → Cancelled
    Approval: Pending → Approved/Rejected
  ✓ User journey: ต้องมีข้อมูลก่อนถึงทำขั้นต่อไปได้

Difference from Master Data CRUD (Template 3):
  - Template 3: ทดสอบแยกแต่ละ action (Create แยก, Edit แยก)
  - Template 8: ทดสอบเป็น chain (Create → Edit → Delete) โดย Edit/Delete ใช้ id จาก Create
```

### Standard scenarios (chained)

```
TS-{MODULE}-LIFECYCLE-001: Create record → save id
  serial_group: "{MODULE}-LIFECYCLE"
  serial_order: 1

TS-{MODULE}-LIFECYCLE-002: Read created record
  serial_group: "{MODULE}-LIFECYCLE"
  serial_order: 2
  depends_on_data: { from: "TS-{MODULE}-LIFECYCLE-001", field: "created_id" }

TS-{MODULE}-LIFECYCLE-003: Update record
  serial_group: "{MODULE}-LIFECYCLE"
  serial_order: 3
  depends_on_data: { from: "TS-{MODULE}-LIFECYCLE-001", field: "created_id" }

TS-{MODULE}-LIFECYCLE-004: State transition (if has state field)
  serial_group: "{MODULE}-LIFECYCLE"
  serial_order: 4
  depends_on_data: { from: "TS-{MODULE}-LIFECYCLE-001", field: "created_id" }

TS-{MODULE}-LIFECYCLE-005: Delete record (cleanup)
  serial_group: "{MODULE}-LIFECYCLE"
  serial_order: 5
  depends_on_data: { from: "TS-{MODULE}-LIFECYCLE-001", field: "created_id" }
```

### qa-tracker.json entry

```json
{
  "id": "TS-ORDER-LIFECYCLE-002",
  "title": "Edit order created in 001",
  "module": "ORDER",
  "type": "lifecycle",
  "advanced": {
    "serial_group": "ORDER-LIFECYCLE",
    "serial_order": 2,
    "depends_on_data": {
      "from": "TS-ORDER-LIFECYCLE-001",
      "field": "created_order_id"
    }
  },
  "status": "pending"
}
```

---

## Template 9: Approval Workflow ⭐ MUST-HAVE

**ID prefix:** `TS-{MODULE}-APPROVAL-{NNN}`
**Scenarios count:** 8-15 (ขึ้นอยู่กับ states + actors)
**Trigger:** Multi-actor + state transitions + role transitions
**Distinct from Template 8 Lifecycle:** Lifecycle = 1 user ทำทั้ง flow, Approval = หลาย role ส่งงานกัน

### Detection rules

```
Code signals:
  ✓ Entity มี approval-related state field:
    - status: pending → approved/rejected
    - status: draft → submitted → reviewed → approved → completed
  ✓ Different roles ทำคนละ action ใน entity เดียวกัน:
    - Requester: Create/Submit
    - Reviewer/Manager: Review/Approve/Reject
    - Admin: Final approve / Override
  ✓ Action buttons เปลี่ยนตาม state + role:
    - Draft state: Edit, Submit (requester only)
    - Submitted state: Approve, Reject, Send back (manager only)
    - Approved state: Mark complete (admin only)
  ✓ Notification/email triggers on state change
  ✓ Audit log / approval history table

Examples:
  - Leave request (employee → manager → HR)
  - Purchase requisition (staff → supervisor → finance → CEO)
  - Document approval (author → reviewer → publisher)
  - Expense claim (user → manager → finance)
  - Permit application (citizen → reviewer → director)
```

### Required scenarios (8 base, +variants)

```
HAPPY PATH (ทาง normal):
  TS-{MODULE}-APPROVAL-001: Requester creates request (status: draft)
  TS-{MODULE}-APPROVAL-002: Requester submits → status: submitted, notification ไป manager
  TS-{MODULE}-APPROVAL-003: Manager reviews + approves → status: approved
  TS-{MODULE}-APPROVAL-004: Admin final approve → status: completed

REJECTION PATH:
  TS-{MODULE}-APPROVAL-005: Manager rejects with reason → status: rejected
  TS-{MODULE}-APPROVAL-006: Manager sends back for revision → status: draft (with comment)

VISIBILITY/PERMISSION:
  TS-{MODULE}-APPROVAL-007: Requester เห็นปุ่ม Submit (draft state) แต่ไม่เห็น Approve
  TS-{MODULE}-APPROVAL-008: Manager เห็นปุ่ม Approve/Reject (submitted state) แต่ไม่เห็น Edit
  TS-{MODULE}-APPROVAL-009: Other users เห็นแค่ View ไม่มีปุ่ม action
  TS-{MODULE}-APPROVAL-010: Approved request → ทุก role ไม่สามารถแก้ไขได้

EDGE CASES:
  TS-{MODULE}-APPROVAL-011: Manager พยายาม approve request ของตัวเอง (self-approval) → blocked
  TS-{MODULE}-APPROVAL-012: 2 managers approve พร้อมกัน (concurrent) → ตัวที่ 2 ได้ error
  TS-{MODULE}-APPROVAL-013: Cancel request ระหว่างรอ approval (requester) → status: cancelled
  TS-{MODULE}-APPROVAL-014: Audit log แสดง history ครบ (created/submitted/approved/timestamp)
  TS-{MODULE}-APPROVAL-015: Notification ส่งไปยัง role ถัดไปทุก state change
```

### State transition matrix

ใน decision report ต้องแสดง matrix:

```
│ From / To  │ draft │ submitted │ approved │ rejected │ completed │ cancelled │
│ draft      │   -   │ requester │    -     │    -     │     -     │ requester │
│ submitted  │ mgr*  │     -     │ manager  │ manager  │     -     │ requester │
│ approved   │   -   │     -     │    -     │    -     │   admin   │     -     │
│ rejected   │   -   │     -     │    -     │    -     │     -     │     -     │
│ completed  │   -   │     -     │    -     │    -     │     -     │     -     │

* mgr can send back (submitted → draft with comment)
```

### Multi-actor pattern (เทสที่ต้อง switch user)

ใช้ **multi-context** pattern ใน Playwright:

```typescript
test('TS-LEAVE-APPROVAL-FULL: end-to-end approval flow', async ({ browser }) => {
  // Actor 1: Employee (requester)
  const employeeCtx = await browser.newContext({ storageState: 'auth/employee.json' });
  const employeePage = await employeeCtx.newPage();
  
  let leaveId: string;
  await test.step('Employee creates and submits request', async () => {
    await employeePage.goto('/leave/new');
    await employeePage.getByLabel(/start date/i).fill('2026-06-01');
    await employeePage.getByLabel(/days/i).fill('3');
    await employeePage.getByRole('button', { name: /submit/i }).click();
    leaveId = await employeePage.locator('[data-testid="leave-id"]').textContent() || '';
  });

  // Actor 2: Manager (approver)
  const managerCtx = await browser.newContext({ storageState: 'auth/manager.json' });
  const managerPage = await managerCtx.newPage();
  
  await test.step('Manager approves request', async () => {
    await managerPage.goto(`/leave/${leaveId}`);
    await expect(managerPage.getByRole('button', { name: /approve/i })).toBeVisible();
    await managerPage.getByRole('button', { name: /approve/i }).click();
    await managerPage.getByLabel(/comment/i).fill('Approved');
    await managerPage.getByRole('button', { name: /confirm/i }).click();
  });

  // Verify from Employee side
  await test.step('Employee sees status updated', async () => {
    await employeePage.reload();
    await expect(employeePage.getByText(/approved/i)).toBeVisible();
  });

  await employeeCtx.close();
  await managerCtx.close();
});
```

### qa-tracker.json entry

```json
{
  "id": "TS-LEAVE-APPROVAL-003",
  "title": "Manager approves leave request",
  "module": "LEAVE",
  "type": "approval-workflow",
  "approval": {
    "actor_role": "manager",
    "from_state": "submitted",
    "to_state": "approved",
    "permissions_required": ["leave.approve"],
    "depends_on_data": {
      "from": "TS-LEAVE-APPROVAL-002",
      "field": "leave_id"
    },
    "actors_involved": ["employee", "manager"]
  },
  "status": "pending"
}
```

### qa-tracker.json — approval_workflows registry

```json
{
  "approval_workflows": [
    {
      "module": "LEAVE",
      "states": ["draft", "submitted", "approved", "rejected", "completed", "cancelled"],
      "transitions": [
        { "from": "draft",     "to": "submitted",  "actor": "requester" },
        { "from": "submitted", "to": "approved",   "actor": "manager"   },
        { "from": "submitted", "to": "rejected",   "actor": "manager"   },
        { "from": "submitted", "to": "draft",      "actor": "manager", "with": "comment" },
        { "from": "approved",  "to": "completed",  "actor": "admin"     },
        { "from": "draft",     "to": "cancelled",  "actor": "requester" }
      ],
      "actors": ["requester", "manager", "admin"]
    }
  ]
}
```

---

## Template 10: Role-based (Cross-cutting)

**ID prefix:** `TS-ROLE-{MODULE}-{ROLE}-{NNN}`
**Scenarios count:** N (roles) × M (pages) × K (actions per page)
**Trigger:** เมื่อ project มี multiple roles

### Detection rules

```
Code signals:
  ✓ [Authorize(Roles="...")] attributes (.NET)
  ✓ requireAuth({ roles: [...] }) middleware (Node)
  ✓ {user.role === '...' && ...} conditional rendering (React/Vue)
  ✓ Seed data มี users ในหลาย roles
  ✓ Identity tables มี Roles + UserRoles
```

### Scenario count formula

```
For each (role, page, action) combination:
  - access-granted: 1 scenario
  - access-denied: 1 scenario (per redirect/403/error path)
  - action-allowed: 1 scenario per action (view/create/edit/delete)
  - action-denied: 1 scenario per action (hidden/disabled/server-reject)

Total ≈ N × M × (K+2)
```

### Example calculation

```
3 roles (admin, manager, viewer)
× 4 pages (products, orders, users, settings)
× 4 actions (view, create, edit, delete)
= 48 scenarios
+ access denied per role-page = 3 × 2 = 6 scenarios
≈ 54 role-based scenarios
```

---

## Decision Matrix — How auto picks templates

```
┌──────────────────────────────────────────────────────────────────┐
│                  TEMPLATE DECISION TREE                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Page detected from code                                          │
│         │                                                         │
│         ▼                                                         │
│  Has stepper/wizard component?                                    │
│         │ YES → Template 5 (Multi-step Wizard)                    │
│         │ NO ↓                                                    │
│         ▼                                                         │
│  Has expandable rows + nested grid?                               │
│         │ YES → Template 4 (Master-Detail Grid, 15 scenarios)     │
│         │ NO ↓                                                    │
│         ▼                                                         │
│  Has table + Add/Edit/Delete buttons?                             │
│         │ YES → Template 3 (Master Data CRUD, 13 scenarios)       │
│         │       + Check if entity has lifecycle → Template 8     │
│         │ NO ↓                                                    │
│         ▼                                                         │
│  Has password input + submit?                                     │
│         │ YES → Template 1 (Login Form, 5-8 scenarios)            │
│         │ NO ↓                                                    │
│         ▼                                                         │
│  Has form + submit (no table)?                                    │
│         │ YES → Template 2 (Form, 9 scenarios + per-field)        │
│         │ NO ↓                                                    │
│         ▼                                                         │
│  Has charts/metrics (read-only)?                                  │
│         │ YES → Template 6 (Dashboard, 3-5 scenarios)             │
│         │ NO ↓                                                    │
│         ▼                                                         │
│  Default: Template 2 (Form) + warn user                           │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  CROSS-CUTTING (MUST evaluate ทุก project — สร้างเพิ่ม):         │
│                                                                   │
│  ⭐ MUST-HAVE #1: Cross-page Master Data Reference                │
│  IF entity has FK to another entity (Category→Product→Order):     │
│       ADD Template 7 (Cascade) per relationship                   │
│       — ทดสอบว่าแก้ master → dependent updates                    │
│       — ทดสอบ A→B→C indirect impact                                │
│                                                                   │
│  ⭐ MUST-HAVE #2: Approval Workflow (multi-actor)                 │
│  IF entity has approval state machine + multi-role transitions:   │
│       ADD Template 9 (Approval Workflow)                          │
│       — ทดสอบ requester → manager → admin chain                   │
│       — ทดสอบ rejection / send-back paths                          │
│       — ทดสอบ visibility per role per state                       │
│                                                                   │
│  IF project has multiple roles (general):                         │
│       ADD Template 10 (Role-based) for each page                  │
│                                                                   │
│  IF entity has full CRUD + state field (single actor):            │
│       ADD Template 8 (Serial Group / Lifecycle)                   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Cross-cutting precedence (เมื่อ entity เข้าได้หลายแบบ)

```
Entity has FK + state field + multi-actor approval?
  → Apply ALL THREE (most comprehensive coverage)
     - Cascade tests (FK integrity)
     - Approval Workflow tests (state transitions across roles)
     - Lifecycle tests (single-actor CRUD chain)

Entity has FK + state field + single actor?
  → Apply Cascade + Lifecycle (skip Approval)

Entity has FK only (no state)?
  → Apply Cascade only

Entity has multi-actor state transitions (no FK)?
  → Apply Approval Workflow only
```

### Distinction Lifecycle vs Approval (สำคัญ)

| Aspect | Template 8 Lifecycle | Template 9 Approval Workflow |
|---|---|---|
| Actors | 1 user ทำทั้ง flow | หลาย role ส่งงานต่อกัน |
| Example | Order: user create → user edit → user pay | Leave: employee submit → manager approve → admin complete |
| Test pattern | Serial Group (data ส่งต่อ) | Multi-context (สลับ user) |
| State transitions | Linear/optional | State machine + role gates |
| Notifications | ไม่จำเป็น | บังคับมี (alert next actor) |

---

## Decision Report Format

After scanning, agent ต้องแสดง decision report ให้ user เห็นเหตุผล:

```
🤖 Template Auto-Selection Report

┌─────────────────────────────────────────────────────────────────┐
│ Page                    │ Template Selected      │ Why            │
├─────────────────────────────────────────────────────────────────┤
│ /admin/products         │ Master Data CRUD (13)  │ table + Add/Edit/Delete buttons
│ /admin/orders           │ Master-Detail (15)     │ expandable rows + OrderItems grid
│ /admin/categories       │ Master Data CRUD (13)  │ table + CRUD
│ /checkout/cart          │ Multi-step Wizard      │ Stepper component, /cart→/shipping→/payment
│ /admin/dashboard        │ Dashboard (5)          │ Recharts components, no edit actions
│ /login                  │ Login Form (8)         │ password input + SignInManager call
│ /contact                │ Form (9)               │ <form> + submit, no table
└─────────────────────────────────────────────────────────────────┘

CROSS-CUTTING:

⭐ MUST-HAVE #1 — Cross-page Master Data (Cascade): 3 relationships → 18 scenarios
   - CATEGORY → PRODUCT (FK, OnDelete=Restrict)
     UPDATE/DELETE-RESTRICT/DELETE-EMPTY/DROPDOWN/INDIRECT
   - PRODUCT → ORDER_ITEM (FK, OnDelete=Restrict)
     UPDATE/DELETE-RESTRICT/DROPDOWN
   - USER → ORDER (FK, OnDelete=Restrict)
     UPDATE/DELETE-RESTRICT/DROPDOWN
   ✓ Indirect chain: CATEGORY → PRODUCT → ORDER (1 INDIRECT scenario)

⭐ MUST-HAVE #2 — Approval Workflow: 1 workflow detected → 12 scenarios
   - LEAVE (employee → manager → admin)
     States: draft → submitted → approved/rejected → completed
     Happy path: 4 scenarios
     Rejection/send-back: 2 scenarios
     Visibility per role: 4 scenarios
     Edge cases (self-approval, concurrent, audit): 2 scenarios

✓ Role-based:    3 roles × 5 pages = 60 scenarios (admin/manager/viewer)
✓ Lifecycle:     1 entity (single-actor CRUD chain)
                 - PRODUCT lifecycle → 5 scenarios

Total scenarios: 75 (functional) + 60 (role) + 18 (cascade ⭐) + 12 (approval ⭐) + 5 (lifecycle) = 170

ต้องการ override template ของหน้าใดหรือไม่?
หรือพิมพ์ "ok" เพื่อสร้างทั้งหมด
```

---

## Override mechanism

User สามารถ override template ที่ agent เลือกได้:

```
/qa-create-scenario --auto --override "/admin/products=master-detail"
/qa-create-scenario --auto --explain-templates    # แสดง decision report เท่านั้น ไม่สร้าง
```

หรือแก้ใน `qa-tracker.json` field `page_type` แล้วรัน `/qa-edit-scenario --module XXX`

---

## Adding custom templates

ถ้ามี page pattern เฉพาะ project:

1. เพิ่ม template ใหม่ใน reference นี้
2. เพิ่ม detection rules
3. ใส่ใน Decision Tree
4. เพิ่มใน Auto Step 2 ของ `qa-create-scenario.md`

ตัวอย่าง custom: **File Upload Page**
- Detection: `<input type="file">` + progress bar + file list
- Scenarios: valid format, too large, multiple files, drag-drop, cancel upload, etc.
