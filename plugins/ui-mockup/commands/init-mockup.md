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
│       │   ├── system-design-doc (Sitemap, Screen Specs)           │
│       │   ├── README.md                                           │
│       │   ├── requirements.md                                     │
│       │   └── อื่นๆ                                               │
│       │                                                            │
│       └── สร้าง .mockups/mockup_list.json                         │
│                     │                                              │
│                     ▼                                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  {                                                          │   │
│  │    "pages": [                                               │   │
│  │      { "id": 1, "name": "Login", "status": "pending" },    │   │
│  │      { "id": 2, "name": "Dashboard", "status": "pending" } │   │
│  │    ]                                                        │   │
│  │  }                                                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                     │                                              │
│                     ▼                                              │
│       ┌─────────────────────────────────────────────┐              │
│       │  /create-mockup      (ใช้ json เลือกหน้า)   │              │
│       │  /create-mockups-parallel (ใช้ json)        │              │
│       │  /edit-mockup        (อัพเดท status)        │              │
│       └─────────────────────────────────────────────┘              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Input ที่ได้รับ

```
/init-mockup
/init-mockup จาก system-design.md
/init-mockup จาก requirements/
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

**Extract เป็น:**
```json
[
  { "id": "P001", "name": "หน้าแรก", "url": "/", "access": "Public" },
  { "id": "P002", "name": "เข้าสู่ระบบ", "url": "/auth/login", "access": "Public" },
  { "id": "P003", "name": "Dashboard", "url": "/dashboard", "access": "User" },
  { "id": "P004", "name": "รายการผู้ใช้", "url": "/admin/users", "access": "Admin" }
]
```

### Step 3: สร้างโฟลเดอร์ .mockups

```bash
mkdir -p .mockups
```

### Step 4: สร้าง mockup_list.json

**Format:**

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
  "pages": [
    {
      "id": "P001",
      "name": "Login",
      "name_th": "เข้าสู่ระบบ",
      "url": "/auth/login",
      "access": "Public",
      "category": "auth",
      "priority": "high",
      "description": "หน้า login สำหรับเข้าสู่ระบบ",
      "components": [],
      "status": "pending",
      "mockup_file": null,
      "created_at": null,
      "notes": ""
    },
    {
      "id": "P002",
      "name": "Dashboard",
      "name_th": "แดชบอร์ด",
      "url": "/dashboard",
      "access": "User",
      "category": "main",
      "priority": "high",
      "description": "หน้าหลักแสดงภาพรวม",
      "components": ["Navbar", "Sidebar", "Cards", "Chart", "Table"],
      "status": "pending",
      "mockup_file": null,
      "created_at": null,
      "notes": ""
    }
  ],
  "categories": {
    "auth": "Authentication pages",
    "main": "Main application pages",
    "admin": "Admin pages",
    "settings": "Settings pages",
    "reports": "Report pages"
  },
  "summary": {
    "total": 10,
    "pending": 10,
    "in_progress": 0,
    "completed": 0,
    "approved": 0
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
| `low` | Secondary pages (Settings, Reports) |

### Step 6: บันทึก mockup_list.json

```bash
# สร้างไฟล์
cat > .mockups/mockup_list.json << 'EOF'
{
  "project": "...",
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
   • Total pages: 12
   • Categories: 5 (auth, main, list, form, admin)
   • Priority: 3 high, 6 medium, 3 low

📋 Pages found:
   ┌─────┬────────────────────┬─────────────────┬──────────┬──────────┐
   │ ID  │ Page Name          │ URL             │ Priority │ Status   │
   ├─────┼────────────────────┼─────────────────┼──────────┼──────────┤
   │ P01 │ Login              │ /auth/login     │ high     │ pending  │
   │ P02 │ Register           │ /auth/register  │ high     │ pending  │
   │ P03 │ Dashboard          │ /dashboard      │ high     │ pending  │
   │ P04 │ User List          │ /admin/users    │ medium   │ pending  │
   │ P05 │ User Form          │ /admin/users/new│ medium   │ pending  │
   │ ... │ ...                │ ...             │ ...      │ ...      │
   └─────┴────────────────────┴─────────────────┴──────────┴──────────┘

💡 Next steps:
   • /create-mockup                    → สร้าง mockup ทีละหน้า (เลือกจาก list)
   • /create-mockups-parallel          → สร้างหลายหน้าพร้อมกัน
   • /create-mockups-parallel --all    → สร้างทุกหน้าที่ pending
```

---

## ถ้าไม่พบเอกสาร Source

```
⚠️ ไม่พบเอกสารที่สามารถ extract pages ได้

📝 กรุณาระบุ pages manually:

/init-mockup --pages "Login, Dashboard, User List, User Form"

หรือสร้าง system-design-doc ก่อน:
/system-design-doc สร้างเอกสารสำหรับระบบ [ชื่อระบบ]
```

---

## Manual Mode

ถ้าต้องการระบุ pages เอง:

```
/init-mockup --pages "Login, Dashboard, User List, User Form, Settings"
```

จะสร้าง mockup_list.json พร้อม pages ที่ระบุ โดยใช้ default values

---

## Integration with Other Commands

### /create-mockup จะอ่าน mockup_list.json

```
/create-mockup

📋 Pending pages (from mockup_list.json):
   1. Login        (high priority)
   2. Dashboard    (high priority)
   3. User List    (medium priority)
   4. User Form    (medium priority)

เลือกหน้าที่ต้องการสร้าง (1-4) หรือพิมพ์ชื่อ: 1

🎯 Creating mockup for: Login
...
```

### /create-mockups-parallel จะใช้ mockup_list.json

```
/create-mockups-parallel --all

📋 Creating mockups for all pending pages (12 pages)...
   Spawning 12 sub-agents in parallel...
```

```
/create-mockups-parallel --priority high

📋 Creating mockups for high priority pages (3 pages)...
   • Login
   • Register
   • Dashboard
```

### เมื่อ mockup เสร็จ จะอัพเดท mockup_list.json

```json
{
  "id": "P001",
  "name": "Login",
  "status": "completed",          // เปลี่ยนจาก pending
  "mockup_file": "login.mockup.md",
  "created_at": "2025-01-20T14:30:00Z",
  "notes": "Created with 8 components"
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

  pages: Page[];

  categories: Record<string, string>;

  summary: {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    approved: number;
  };
}

interface Page {
  id: string;              // P001, P002, ...
  name: string;            // English name
  name_th?: string;        // Thai name (optional)
  url: string;             // /path/to/page
  access: string;          // Public, User, Admin
  category: string;        // auth, main, list, form, admin
  priority: "high" | "medium" | "low";
  description: string;
  components: string[];    // Expected components

  // Status tracking
  status: "pending" | "in_progress" | "completed" | "approved";
  mockup_file: string | null;
  created_at: string | null;
  updated_at?: string | null;
  approved_at?: string | null;
  notes: string;
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
