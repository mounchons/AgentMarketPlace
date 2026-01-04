---
description: Initialize UI Mockup environment และสร้าง mockup_list.json จากเอกสารในโปรเจค
allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*)
---

# Init Mockup Command

สร้าง mockup tracking system โดยวิเคราะห์เอกสารในโปรเจคและสร้าง `mockup_list.json`

## วัตถุประสงค์

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MOCKUP TRACKING SYSTEM                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  /init-mockup                                                      │
│       │                                                            │
│       ├── วิเคราะห์เอกสารในโปรเจค                                   │
│       │   ├── system-design-doc (Sitemap, Screen Specs, ER)       │
│       │   ├── README.md                                           │
│       │   ├── requirements.md                                     │
│       │   └── API specs                                           │
│       │                                                            │
│       ├── ระบุ Entities สำหรับ CRUD                                │
│       │   ├── Extract จาก ER Diagram                              │
│       │   ├── Extract จาก API Endpoints                           │
│       │   └── กำหนด complexity (simple/complex)                   │
│       │                                                            │
│       └── สร้าง .mockups/mockup_list.json                         │
│                     │                                              │
│                     ▼                                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  {                                                          │   │
│  │    "entities": [...],                                       │   │
│  │    "pages": [                                               │   │
│  │      { "id": "001", "name": "Login", "crud_group": null },  │   │
│  │      { "id": "004", "name": "User List", "crud_group": "User" }│   │
│  │    ]                                                        │   │
│  │  }                                                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Input ที่ได้รับ

```
/init-mockup
/init-mockup จาก system-design.md
/init-mockup จาก requirements/
/init-mockup --entities "User, Product, Order"
/init-mockup --auto-crud
```

## ขั้นตอนที่ต้องทำ

### Step 1: ค้นหาเอกสาร Source

```bash
# ค้นหา system-design-doc
ls -la *.md 2>/dev/null | head -20

# ค้นหา Sitemap
grep -l -i "sitemap\|screen\|page" *.md 2>/dev/null

# ค้นหาใน subdirectories
find . -name "*.md" -type f 2>/dev/null | head -30
```

**Priority ในการค้นหา:**
1. `system-design*.md` - เอกสารออกแบบระบบ
2. `*sitemap*.md` - Sitemap เฉพาะ
3. `requirements*.md` - Requirements doc
4. `README.md` - Project description
5. `docs/*.md` - Documentation folder

### Step 2: วิเคราะห์เอกสารเพื่อหา Pages

**สิ่งที่ต้องค้นหา:**

| Source | Pattern to Find |
|--------|-----------------|
| **Sitemap section** | `## Sitemap`, `## 9. Sitemap`, Page Inventory table |
| **Screen Specs** | `SCR-XXX`, `Page ID`, Screen Specification |
| **Navigation** | `Navigation Structure`, Menu items |
| **User Flows** | `Flow Diagram`, User journey steps |
| **URLs** | `/path/to/page`, Route definitions |

**ตัวอย่างการ extract pages จาก Sitemap:**

```markdown
## 9. Sitemap

### 9.2 Page Inventory

| Page ID | ชื่อหน้า | URL | Access Level |
|---------|---------|-----|--------------|
| P001 | หน้าแรก | / | Public |
| P002 | เข้าสู่ระบบ | /auth/login | Public |
| P003 | Dashboard | /dashboard | User |
| P004 | รายการผู้ใช้ | /admin/users | Admin |
```

**Extract เป็น (format ใหม่):**
```json
[
  { "id": "001", "name": "หน้าแรก", "url": "/", "access": "Public" },
  { "id": "002", "name": "เข้าสู่ระบบ", "url": "/auth/login", "access": "Public" },
  { "id": "003", "name": "Dashboard", "url": "/dashboard", "access": "User" },
  { "id": "004", "name": "รายการผู้ใช้", "url": "/admin/users", "access": "Admin" }
]
```

### Step 2.5: ค้นหา Entities สำหรับ CRUD Pages

**สิ่งที่ต้องค้นหา:**

| Source | Pattern to Find |
|--------|-----------------|
| **ER Diagram** | Entity names, relationships |
| **Data Dictionary** | Table names, fields count |
| **API Endpoints** | CRUD endpoints (/users, /products) |
| **Screen Specs** | List pages, Form pages, Detail pages |

**ตัวอย่างการ extract entities จาก ER Diagram:**

```markdown
## ER Diagram

User ─────── Order
  │            │
  └── Address  └── OrderItem ─── Product
```

**Analyze entities:**

| Entity | Fields Count | Relations | Complexity | UI Pattern |
|--------|-------------|-----------|------------|------------|
| User | 15+ | Address, Order | complex | page |
| Order | 10+ | User, OrderItem | complex | page |
| Product | 12+ | OrderItem | complex | page |
| Address | 5 | User | simple | modal |
| Department | 3 | User | simple | modal |
| Status | 2 | - | simple | modal |

**Complexity Rules:**
- **simple**: fields < 10, no complex relations → UI Pattern: **modal**
- **complex**: fields >= 10 หรือ มี relations ซับซ้อน → UI Pattern: **page**

### Step 3: สร้างโฟลเดอร์ .mockups

```bash
mkdir -p .mockups
```

### Step 3.5: Auto-generate CRUD Pages

**สำหรับแต่ละ Entity ให้สร้าง pages ตาม complexity:**

#### Complex Entities (3 pages: List + Form + Detail)

| Entity | List Page | Form Page | Detail Page |
|--------|-----------|-----------|-------------|
| User | User List | User Form | User Detail |
| Product | Product List | Product Form | Product Detail |
| Order | Order List | Order Form | Order Detail |

**Template สำหรับ Complex Entity (3 pages):**

```json
// List Page
{
  "id": "[NNN]",
  "name": "[Entity] List",
  "name_th": "รายการ[Entity_TH]",
  "url": "/admin/[entity-plural]",
  "access": "Admin",
  "category": "list",
  "priority": "medium",
  "description": "หน้าแสดงรายการ[Entity_TH]ทั้งหมด",
  "components": ["Navbar", "Sidebar", "SearchBar", "Table", "Pagination", "ActionButtons"],
  "crud_group": "[Entity]",
  "crud_type": "list",
  "complexity": "complex",
  "ui_pattern": "page",
  "action_column_position": "first",
  "related_documents": [],
  "related_pages": ["[form_id]", "[detail_id]"],
  "status": "pending",
  "mockup_file": null
}

// Form Page
{
  "id": "[NNN+1]",
  "name": "[Entity] Form",
  "name_th": "ฟอร์ม[Entity_TH]",
  "url": "/admin/[entity-plural]/new",
  "access": "Admin",
  "category": "form",
  "priority": "medium",
  "description": "หน้าสร้าง/แก้ไข[Entity_TH]",
  "components": ["Navbar", "Card", "Input", "Select", "Button"],
  "crud_group": "[Entity]",
  "crud_type": "form",
  "complexity": "complex",
  "ui_pattern": "page",
  "action_column_position": null,
  "related_documents": [],
  "related_pages": ["[list_id]", "[detail_id]"],
  "status": "pending",
  "mockup_file": null
}

// Detail Page
{
  "id": "[NNN+2]",
  "name": "[Entity] Detail",
  "name_th": "รายละเอียด[Entity_TH]",
  "url": "/admin/[entity-plural]/:id",
  "access": "Admin",
  "category": "detail",
  "priority": "medium",
  "description": "หน้าแสดงรายละเอียด[Entity_TH]",
  "components": ["Navbar", "Card", "Avatar", "DataDisplay", "ActionButtons"],
  "crud_group": "[Entity]",
  "crud_type": "detail",
  "complexity": "complex",
  "ui_pattern": "page",
  "action_column_position": null,
  "related_documents": [],
  "related_pages": ["[list_id]", "[form_id]"],
  "status": "pending",
  "mockup_file": null
}
```

#### Simple Entities (1 page: List with Modal)

| Entity | List Page | View | Create | Edit | Delete |
|--------|-----------|------|--------|------|--------|
| Department | Department List | Modal | Modal | Modal | SweetAlert2 |
| Status | Status List | Modal | Modal | Modal | SweetAlert2 |
| Category | Category List | Modal | Modal | Modal | SweetAlert2 |

**Template สำหรับ Simple Entity (1 page with modals):**

```json
{
  "id": "[NNN]",
  "name": "[Entity] List",
  "name_th": "รายการ[Entity_TH]",
  "url": "/admin/[entity-plural]",
  "access": "Admin",
  "category": "list",
  "priority": "low",
  "description": "หน้าจัดการ[Entity_TH] (Master Data)",
  "components": ["Navbar", "Sidebar", "SearchBar", "Table", "Pagination", "ActionButtons", "Modal", "SweetAlert2"],
  "crud_group": "[Entity]",
  "crud_type": "list",
  "complexity": "simple",
  "ui_pattern": "modal",
  "action_column_position": "first",
  "related_documents": [],
  "related_pages": [],
  "status": "pending",
  "mockup_file": null,
  "notes": "Simple entity - uses modal for View/Create/Edit, SweetAlert2 for Delete"
}
```

### Step 3.6: กำหนด Related Documents อัตโนมัติ

**สำหรับแต่ละ page ให้ค้นหา related documents:**

1. **จาก System Design Doc:**
   - ค้นหา section ที่มีชื่อ entity
   - Link ไปยัง Sitemap, Screen Specs, ER Diagram

2. **จาก API Specs (ถ้ามี):**
   - ค้นหา endpoints ที่เกี่ยวข้อง
   - List page → GET /api/[entity]
   - Form page → POST/PUT /api/[entity]
   - Detail page → GET /api/[entity]/:id

3. **จาก Requirements (ถ้ามี):**
   - ค้นหา functional requirements ที่เกี่ยวข้อง

**Auto-link pattern:**

```json
{
  "related_documents": [
    {"type": "system-design", "path": "[source_doc]#[entity-section]"},
    {"type": "api", "path": "docs/api/[entity].md"},
    {"type": "erd", "path": "[source_doc]#er-diagram"}
  ]
}
```

### Step 4: สร้าง mockup_list.json

**Format ใหม่ (พร้อม entities และ CRUD support):**

```json
{
  "project": "ชื่อโปรเจค",
  "description": "คำอธิบายโปรเจค",
  "source_documents": [
    "system-design.md",
    "requirements.md"
  ],
  "initialized_at": "2025-01-20T10:00:00Z",
  "last_updated": "2025-01-20T10:00:00Z",

  "entities": [
    {
      "name": "User",
      "name_th": "ผู้ใช้",
      "complexity": "complex",
      "ui_pattern": "page",
      "pages": ["004", "005", "006"],
      "related_documents": [
        {"type": "system-design", "path": "system-design.md#user-management"},
        {"type": "api", "path": "docs/api/users.md"}
      ],
      "crud_actions": {
        "list": "page",
        "view": "page",
        "create": "page",
        "edit": "page",
        "delete": "sweetalert2"
      }
    },
    {
      "name": "Department",
      "name_th": "แผนก",
      "complexity": "simple",
      "ui_pattern": "modal",
      "pages": ["010"],
      "related_documents": [
        {"type": "system-design", "path": "system-design.md#master-data"}
      ],
      "crud_actions": {
        "list": "page",
        "view": "modal",
        "create": "modal",
        "edit": "modal",
        "delete": "sweetalert2"
      }
    }
  ],

  "pages": [
    {
      "id": "001",
      "name": "Login",
      "name_th": "เข้าสู่ระบบ",
      "url": "/auth/login",
      "access": "Public",
      "category": "auth",
      "priority": "high",
      "description": "หน้า login สำหรับเข้าสู่ระบบ",
      "components": ["Logo", "Card", "Input", "Button"],
      "crud_group": null,
      "crud_type": null,
      "complexity": null,
      "ui_pattern": null,
      "action_column_position": null,
      "related_documents": [
        {"type": "system-design", "path": "system-design.md#authentication"}
      ],
      "related_pages": ["002"],
      "status": "pending",
      "mockup_file": null,
      "created_at": null,
      "updated_at": null,
      "notes": ""
    },
    {
      "id": "004",
      "name": "User List",
      "name_th": "รายการผู้ใช้",
      "url": "/admin/users",
      "access": "Admin",
      "category": "list",
      "priority": "medium",
      "description": "หน้าแสดงรายการผู้ใช้ทั้งหมด",
      "components": ["Navbar", "Sidebar", "SearchBar", "Table", "Pagination", "ActionButtons"],
      "crud_group": "User",
      "crud_type": "list",
      "complexity": "complex",
      "ui_pattern": "page",
      "action_column_position": "first",
      "related_documents": [
        {"type": "system-design", "path": "system-design.md#user-management"},
        {"type": "api", "path": "docs/api/users.md#list"}
      ],
      "related_pages": ["005", "006"],
      "status": "pending",
      "mockup_file": null,
      "created_at": null,
      "updated_at": null,
      "notes": ""
    }
  ],

  "categories": {
    "auth": "Authentication pages (Login, Register, etc.)",
    "main": "Main application pages (Dashboard, Home)",
    "list": "List/Table pages (User List, Product List)",
    "form": "Form pages (Create, Edit)",
    "detail": "Detail/View pages",
    "admin": "Admin/Settings pages",
    "reports": "Report/Analytics pages"
  },

  "document_types": {
    "system-design": "System Design Document",
    "api": "API Specification",
    "requirements": "Requirements Document",
    "figma": "Figma Design",
    "erd": "ER Diagram",
    "flow": "Flow Diagram",
    "data-dict": "Data Dictionary"
  },

  "ui_patterns": {
    "modal": {
      "description": "ใช้สำหรับ simple entities (Master Data) - View/Create/Edit/Delete ผ่าน Modal",
      "use_when": ["fields น้อยกว่า 10", "ไม่มี relations ซับซ้อน", "Master data"],
      "components": ["Modal", "Form", "SweetAlert2"]
    },
    "page": {
      "description": "ใช้สำหรับ complex entities - View/Create/Edit ผ่านหน้าแยก",
      "use_when": ["fields มากกว่า 10", "มี relations ซับซ้อน", "ต้องการ wizard/steps"],
      "components": ["Form Page", "Detail Page", "SweetAlert2"]
    }
  },

  "alert_config": {
    "library": "sweetalert2",
    "templates": {
      "delete": {
        "icon": "warning",
        "title": "Are you sure?",
        "text": "You won't be able to revert this!",
        "confirmButtonText": "Yes, delete it!",
        "cancelButtonText": "Cancel",
        "confirmButtonColor": "#d33",
        "cancelButtonColor": "#3085d6"
      },
      "success": {
        "icon": "success",
        "title": "Success!",
        "confirmButtonText": "OK"
      },
      "error": {
        "icon": "error",
        "title": "Error!",
        "confirmButtonText": "OK"
      }
    }
  },

  "table_config": {
    "action_column_position": "first",
    "action_icons": {
      "view": "👁",
      "edit": "✏️",
      "delete": "🗑"
    },
    "default_columns": ["action", "id", "name", "status", "created_at"]
  },

  "summary": {
    "total": 12,
    "pending": 12,
    "in_progress": 0,
    "completed": 0,
    "approved": 0,
    "entities": {
      "total": 3,
      "simple": 1,
      "complex": 2
    }
  }
}
```

### Step 5: กำหนด Categories และ Priority

**Categories:**

| Category | Description | Examples |
|----------|-------------|----------|
| `auth` | Authentication | Login, Register, Forgot Password |
| `main` | Main pages | Dashboard, Home |
| `list` | List/Table pages | User List, Product List |
| `form` | Form pages | Create User, Edit Product |
| `detail` | Detail pages | User Detail, Order Detail |
| `admin` | Admin pages | Settings, System Config |
| `reports` | Report pages | Sales Report, Analytics |

**Priority:**

| Priority | Description |
|----------|-------------|
| `high` | Core pages ที่ต้องมี (Login, Dashboard) |
| `medium` | Feature pages หลัก (CRUD pages) |
| `low` | Secondary pages (Settings, Master Data) |

### Step 6: บันทึก mockup_list.json

```bash
# สร้างไฟล์
cat > .mockups/mockup_list.json << 'EOF'
{
  "project": "...",
  "entities": [...],
  "pages": [...]
}
EOF
```

### Step 7: สร้าง _design-tokens.json (Optional)

```json
{
  "colors": {
    "primary": "#0ea5e9",
    "secondary": "#6366f1",
    "success": "#22c55e",
    "warning": "#f59e0b",
    "error": "#ef4444",
    "neutral": {
      "50": "#fafafa",
      "100": "#f5f5f5",
      "200": "#e5e5e5",
      "500": "#737373",
      "700": "#404040",
      "900": "#171717"
    }
  },
  "typography": {
    "fontFamily": "Inter, sans-serif",
    "sizes": {
      "xs": "12px",
      "sm": "14px",
      "base": "16px",
      "lg": "18px",
      "xl": "20px",
      "2xl": "24px"
    }
  },
  "spacing": {
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "6": "24px",
    "8": "32px"
  },
  "borderRadius": {
    "sm": "4px",
    "md": "8px",
    "lg": "12px",
    "full": "9999px"
  }
}
```

---

## Output

**Success:**

```
✅ Initialize Mockup Environment สำเร็จ!

📁 Files created:
   • .mockups/mockup_list.json
   • .mockups/_design-tokens.json

📊 Summary:
   • Total pages: 15
   • CRUD Entities: 3 (User, Product, Department)
   • Non-CRUD pages: 6 (Login, Register, Dashboard, etc.)

📋 CRUD Entities:
   ┌─────────────┬─────────────┬────────────────────────────────────────────────────────┐
   │ Entity      │ Complexity  │ Pages                                                  │
   ├─────────────┼─────────────┼────────────────────────────────────────────────────────┤
   │ User        │ complex     │ 004-user-list, 005-user-form, 006-user-detail         │
   │ Product     │ complex     │ 007-product-list, 008-product-form, 009-product-detail│
   │ Department  │ simple      │ 010-department-list (with modals)                      │
   └─────────────┴─────────────┴────────────────────────────────────────────────────────┘

📋 Pages found:
   ┌─────┬────────────────────┬─────────────────┬──────────┬──────────────┬────────────┐
   │ ID  │ Page Name          │ URL             │ Priority │ CRUD Group   │ UI Pattern │
   ├─────┼────────────────────┼─────────────────┼──────────┼──────────────┼────────────┤
   │ 001 │ Login              │ /auth/login     │ high     │ -            │ -          │
   │ 002 │ Register           │ /auth/register  │ high     │ -            │ -          │
   │ 003 │ Dashboard          │ /dashboard      │ high     │ -            │ -          │
   │ 004 │ User List          │ /admin/users    │ medium   │ User (list)  │ page       │
   │ 005 │ User Form          │ /admin/users/new│ medium   │ User (form)  │ page       │
   │ 006 │ User Detail        │ /admin/users/:id│ medium   │ User (detail)│ page       │
   │ 010 │ Department List    │ /admin/depts    │ low      │ Department   │ modal      │
   │ ... │ ...                │ ...             │ ...      │ ...          │ ...        │
   └─────┴────────────────────┴─────────────────┴──────────┴──────────────┴────────────┘

⚙️ UI Patterns:
   • Complex entities (User, Product): View/Create/Edit via separate pages
   • Simple entities (Department): View/Create/Edit via modal popups
   • Delete confirmation: SweetAlert2 for all entities
   • Action column: First (leftmost) in all tables

💡 Next steps:
   • /create-mockup                        → สร้าง mockup ทีละหน้า
   • /create-mockups-parallel --entity User → สร้าง CRUD pages ของ entity
   • /create-mockups-parallel --all        → สร้างทุกหน้าที่ pending
```

---

## ถ้าไม่พบเอกสาร Source

```
⚠️ ไม่พบเอกสารที่สามารถ extract pages ได้

📝 กรุณาระบุ pages manually:

/init-mockup --pages "Login, Dashboard, User List, User Form"

หรือระบุ entities:

/init-mockup --entities "User, Product, Department"

หรือสร้าง system-design-doc ก่อน:
/system-design-doc สร้างเอกสารสำหรับระบบ [ชื่อระบบ]
```

---

## Manual Mode

### ระบุ pages เอง:

```
/init-mockup --pages "Login, Dashboard, User List, User Form, Settings"
```

### ระบุ entities เอง:

```
/init-mockup --entities "User, Product, Order" --complexity "complex, complex, complex"
```

หรือ mixed:

```
/init-mockup --entities "User, Department, Status" --complexity "complex, simple, simple"
```

### Auto CRUD:

```
/init-mockup --auto-crud
```

จะค้นหา entities จาก source documents และสร้าง CRUD pages อัตโนมัติ

---

## Integration with Other Commands

### /create-mockup จะอ่าน mockup_list.json

```
/create-mockup

📋 Pending pages (from mockup_list.json):
   1. Login        (high priority)
   2. Dashboard    (high priority)
   3. User List    (medium priority, CRUD: User)
   4. User Form    (medium priority, CRUD: User)

เลือกหน้าที่ต้องการสร้าง (1-4) หรือพิมพ์ชื่อ: 3

🎯 Creating mockup for: User List
   Entity: User (complex)
   UI Pattern: page
   Action Column: first
...
```

### /create-mockups-parallel --entity

```
/create-mockups-parallel --entity User

📋 Creating CRUD pages for entity: User
   Complexity: complex
   UI Pattern: page

   Spawning 3 sub-agents:
   • 004-user-list.mockup.md
   • 005-user-form.mockup.md
   • 006-user-detail.mockup.md
```

### /create-mockups-parallel --all

```
/create-mockups-parallel --all

📋 Creating mockups for all pending pages (15 pages)...
   Spawning 15 sub-agents in parallel...
```

### เมื่อ mockup เสร็จ จะอัพเดท mockup_list.json

```json
{
  "id": "004",
  "name": "User List",
  "status": "completed",
  "mockup_file": "004-user-list.mockup.md",
  "created_at": "2025-01-20T14:30:00Z",
  "notes": "Created with 8 components, action column first, SweetAlert2 for delete"
}
```

---

## mockup_list.json Schema

```typescript
interface MockupList {
  project: string;
  description: string;
  source_documents: string[];
  initialized_at: string;
  last_updated: string;

  entities: Entity[];
  pages: Page[];

  categories: Record<string, string>;
  document_types: Record<string, string>;
  ui_patterns: Record<string, UIPattern>;
  alert_config: AlertConfig;
  table_config: TableConfig;

  summary: {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    approved: number;
    entities: {
      total: number;
      simple: number;
      complex: number;
    };
  };
}

interface Entity {
  name: string;
  name_th: string;
  complexity: "simple" | "complex";
  ui_pattern: "modal" | "page";
  pages: string[];
  related_documents: RelatedDocument[];
  crud_actions: {
    list: "page";
    view: "modal" | "page";
    create: "modal" | "page";
    edit: "modal" | "page";
    delete: "sweetalert2";
  };
}

interface Page {
  id: string;                    // 001, 002, ... (3 digits)
  name: string;                  // English name
  name_th?: string;              // Thai name (optional)
  url: string;                   // /path/to/page
  access: string;                // Public, User, Admin
  category: string;              // auth, main, list, form, admin
  priority: "high" | "medium" | "low";
  description: string;
  components: string[];          // Expected components

  // CRUD fields
  crud_group: string | null;     // Entity name or null
  crud_type: "list" | "form" | "detail" | null;
  complexity: "simple" | "complex" | null;
  ui_pattern: "modal" | "page" | null;
  action_column_position: "first" | "last" | null;
  related_documents: RelatedDocument[];
  related_pages: string[];       // IDs of related pages

  // Status tracking
  status: "pending" | "in_progress" | "completed" | "approved";
  mockup_file: string | null;    // e.g., "004-user-list.mockup.md"
  created_at: string | null;
  updated_at: string | null;
  approved_at?: string | null;
  notes: string;
}

interface RelatedDocument {
  type: string;                  // system-design, api, requirements, etc.
  path: string;                  // file path with optional section
}

interface UIPattern {
  description: string;
  use_when: string[];
  components: string[];
}

interface AlertConfig {
  library: "sweetalert2";
  templates: {
    delete: SwalTemplate;
    success: SwalTemplate;
    error: SwalTemplate;
  };
}

interface TableConfig {
  action_column_position: "first" | "last";
  action_icons: {
    view: string;
    edit: string;
    delete: string;
  };
  default_columns: string[];
}
```

---

## Status Flow

```
pending → in_progress → completed → approved
   │           │            │           │
   │           │            │           └── ผ่านการ review
   │           │            └── สร้าง mockup เสร็จแล้ว
   │           └── กำลังสร้าง mockup
   └── ยังไม่ได้เริ่ม
```

---

## File Naming Convention

**Format:** `[NNN]-[page-name].mockup.md`

- NNN = 3 digits from page ID (e.g., 001, 002, 015)
- page-name = kebab-case (e.g., login, user-list, user-form)

**Examples:**
| Page ID | Page Name | Filename |
|---------|-----------|----------|
| 001 | Login | 001-login.mockup.md |
| 004 | User List | 004-user-list.mockup.md |
| 005 | User Form | 005-user-form.mockup.md |
| 010 | Department List | 010-department-list.mockup.md |
