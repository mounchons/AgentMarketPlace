# Long-Running Agent Skill

Harness สำหรับ AI Agent ที่ทำงานข้าม context windows ได้อย่างมีประสิทธิภาพ

อ้างอิงจาก [Anthropic Engineering Blog: Effective Harnesses for Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)

## ✨ Features

- **Feature Tracking** - ติดตามความคืบหน้าด้วย feature_list.json
- **Session Logging** - บันทึกทุก session ใน progress.md
- **Incremental Development** - ทำทีละ feature ไม่ one-shot
- **Test-First Approach** - ต้อง test ก่อน mark pass
- **Git Integration** - Commit แยกต่าง feature

## 📦 Installation

```bash
# Add marketplace (if not already added)
/plugin marketplace add mounchons/agentmarketplace

# Install plugin
/plugin install long-running-agent@agent-marketplace
```

## 🚀 Quick Start

### เริ่มโปรเจคใหม่

```bash
# Initialize agent environment
/init-agent สร้าง Todo API ด้วย ASP.NET Core Web API

# Start working on features
/continue
```

### ใช้กับโปรเจคที่มีอยู่

```bash
# Analyze existing project and create agent environment
/init-agent-existing

# Continue development
/continue
```

### ดูสถานะ

```bash
/agent-status
```

## 📋 Commands

| Command | Description |
|---------|-------------|
| `/init-agent [description]` | Initialize agent environment สำหรับโปรเจคใหม่ |
| `/continue` | ทำงานต่อจาก session ก่อน |
| `/agent-status` | ดูความคืบหน้าของโปรเจค |
| `/init-agent-existing` | เพิ่ม agent environment ให้โปรเจคที่มีอยู่ |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 LONG-RUNNING AGENT SYSTEM                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   INITIALIZER AGENT          CODING AGENT                   │
│   (ครั้งแรกเท่านั้น)            (ทำซ้ำหลายครั้ง)               │
│                                                             │
│         │                          │                        │
│         ▼                          ▼                        │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              SHARED ARTIFACTS                       │   │
│   │  • feature_list.json  (รายการ features)             │   │
│   │  • .agent/progress.md (บันทึกความคืบหน้า)           │   │
│   │  • .agent/config.json (ตั้งค่า agent)               │   │
│   │  • Git History        (ประวัติการเปลี่ยนแปลง)        │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Files Created

```
project-root/
├── .agent/                      # Agent configuration
│   ├── config.json              # Project settings
│   └── progress.md              # Session logs
├── feature_list.json            # Feature tracking
└── ... (project files)
```

## 🔄 Workflow

### Session 1: Initialize

```
/init-agent สร้าง Todo API

Output:
├── feature_list.json (10-15 features, all passes: false)
├── .agent/config.json
├── .agent/progress.md (Session 1 log)
└── Git commit: "chore: Initialize agent environment"
```

### Session 2+: Coding

```
/continue

Workflow:
1. อ่าน progress.md และ git log
2. ตรวจสอบ build status
3. เลือก feature ที่ passes: false
4. Implement feature
5. Test feature
6. Mark pass ใน feature_list.json
7. Git commit
8. Update progress.md
```

## ⚠️ Critical Rules

### Initializer Agent
- ❌ ห้าม implement code
- ✅ สร้างแค่ configuration files
- ✅ Feature list ต้องครบถ้วน

### Coding Agent
- ❌ ห้ามทำหลาย features ใน 1 session
- ❌ ห้าม mark pass โดยไม่ test
- ✅ อ่าน context ก่อนเริ่มงานเสมอ
- ✅ Commit แยกต่าง feature
- ✅ Update progress ก่อนจบ session

## 📚 Reference Files

| File | Description |
|------|-------------|
| `SKILL.md` | Main skill documentation |
| `references/initializer-guide.md` | Initializer Agent guide |
| `references/coding-agent-guide.md` | Coding Agent guide |
| `references/feature-patterns.md` | Feature breakdown patterns |
| `references/troubleshooting.md` | Problem solving guide |
| `templates/feature_list.json` | Feature list template |
| `templates/progress.md` | Progress log template |

## 💡 Tips

### Feature Sizing
- ทำเสร็จใน 15-30 นาที
- มี deliverable ที่ชัดเจน
- Test ได้ง่าย

### When to Split Features
- Steps เกิน 5 ข้อ
- ต้องแก้หลาย files
- Test ซับซ้อน

### Recovery
- ถ้า build fail: แก้ก่อนทำ feature ใหม่
- ถ้า feature ซับซ้อน: บันทึกใน notes, ให้ session ถัดไปทำต่อ

## 🔗 Integration

### กับ dotnet-dev skill
```
1. /init-agent สร้าง ASP.NET Core API
2. Initializer ใช้ dotnet-dev patterns สำหรับ feature breakdown
3. Coding Agent ใช้ dotnet-dev สำหรับ implementation
```

### กับ system-design-doc skill
```
1. ใช้ system-design-doc สร้างเอกสารก่อน
2. แปลง design เป็น feature_list.json
3. ใช้ long-running-agent implement
```

## ➕ การเพิ่ม Feature ใหม่ระหว่างการพัฒนา

เมื่อต้องการเพิ่ม feature ใหม่ระหว่างที่โปรเจคกำลังพัฒนาอยู่

### วิธีที่ 1: เพิ่มด้วยตัวเอง (Manual)

#### Step 1: แก้ไข feature_list.json

```json
{
  "features": [
    // ... features เดิม ...
    
    // เพิ่ม feature ใหม่
    {
      "id": 13,  // ใช้ id ถัดไป
      "category": "feature",
      "description": "Feature ใหม่ที่ต้องการเพิ่ม",
      "priority": "medium",
      "steps": [
        "ขั้นตอนที่ 1",
        "ขั้นตอนที่ 2",
        "ขั้นตอนที่ 3"
      ],
      "dependencies": [5],  // feature ที่ต้องทำก่อน (ถ้ามี)
      "passes": false,
      "tested_at": null,
      "notes": ""
    }
  ],
  "summary": {
    "total": 13,  // อัพเดทจำนวน
    "passed": 8,
    "failed": 5,  // อัพเดทจำนวน
    "last_updated": "2025-01-15T10:00:00Z"
  }
}
```

#### Step 2: บันทึกใน progress.md

```markdown
---

## Session X - ADD FEATURE
**Date**: 2025-01-15 10:00 UTC
**Type**: Feature Addition

### สิ่งที่ทำ:
- ➕ เพิ่ม Feature #13: [description]
  - เหตุผล: [ทำไมต้องเพิ่ม]
  - Priority: medium
  - Dependencies: Feature #5

### สถานะปัจจุบัน:
- Features: 8/13 passed (เพิ่มจาก 12 เป็น 13)

---
```

#### Step 3: Commit

```bash
git add feature_list.json .agent/progress.md
git commit -m "chore: Add Feature #13 - [description]"
```

---

### วิธีที่ 2: ใช้ Claude ช่วย

```bash
# บอก Claude ให้เพิ่ม feature
"เพิ่ม feature ใหม่: [อธิบาย feature ที่ต้องการ]"
```

Claude จะ:
1. วิเคราะห์ feature ที่ต้องการ
2. กำหนด id, priority, steps
3. หา dependencies
4. แก้ไข feature_list.json
5. บันทึกใน progress.md
6. Commit changes

---

### วิธีที่ 3: เพิ่มหลาย Features พร้อมกัน

```bash
"เพิ่ม features สำหรับระบบ authentication:
- Login
- Register  
- Forgot password
- Reset password"
```

Claude จะสร้าง features เรียงตาม dependency:

```json
{
  "features": [
    { "id": 13, "description": "Auth - Register endpoint", "priority": "high" },
    { "id": 14, "description": "Auth - Login endpoint", "dependencies": [13], "priority": "high" },
    { "id": 15, "description": "Auth - Forgot password", "dependencies": [13], "priority": "medium" },
    { "id": 16, "description": "Auth - Reset password", "dependencies": [15], "priority": "medium" }
  ]
}
```

---

### กฎสำคัญเมื่อเพิ่ม Feature

| ✅ ทำได้ | ❌ ห้ามทำ |
|---------|----------|
| เพิ่ม feature ใหม่ | ลบ feature ที่มีอยู่ |
| แก้ไข priority | แก้ไข description ของ feature เดิม |
| เพิ่ม dependencies | เปลี่ยน id ของ feature เดิม |
| แก้ไข steps ของ feature ที่ยังไม่ pass | แก้ไข feature ที่ pass แล้ว |

---

### ตัวอย่าง Scenarios

#### Scenario 1: Client ขอเพิ่ม feature

```
Client: "เพิ่มระบบ export เป็น Excel ด้วย"

คุณ: "เพิ่ม feature ใหม่: Export data เป็น Excel file"

Claude จะ:
1. สร้าง Feature #13: Export to Excel
2. กำหนด priority: medium
3. หา dependencies (ต้องมี data ก่อน)
4. อัพเดท feature_list.json
5. Commit
```

#### Scenario 2: พบว่าต้องแยก feature ใหญ่

```
ระหว่างทำ Feature #5 พบว่าใหญ่เกินไป

คุณ: "แยก Feature #5 เป็น 2 features:
- #5: Basic CRUD (เดิม)
- #13: Advanced filtering (ใหม่)"

Claude จะ:
1. แก้ไข steps ของ Feature #5 ให้เล็กลง
2. เพิ่ม Feature #13 สำหรับส่วนที่แยกออกมา
3. อัพเดท dependencies
```

#### Scenario 3: เพิ่ม feature ด่วน (Hotfix)

```
คุณ: "เพิ่ม feature ด่วน priority high: Fix security vulnerability"

Claude จะ:
1. สร้าง Feature #13 ด้วย priority: high
2. ใส่ไว้เป็น feature ถัดไปที่ต้องทำ
3. /continue จะหยิบ feature นี้ไปทำก่อน
```

---

### Quick Reference: Feature Template

```json
{
  "id": 0,
  "category": "feature|bugfix|enhancement|refactor",
  "description": "Short description",
  "priority": "high|medium|low",
  "steps": ["Step 1", "Step 2", "Step 3"],
  "dependencies": [],
  "estimated_time": "30min",
  "passes": false,
  "tested_at": null,
  "notes": ""
}
```

### Category Guidelines

| Category | ใช้เมื่อ |
|----------|---------|
| `setup` | ตั้งค่า project, infrastructure |
| `feature` | ฟีเจอร์ใหม่ |
| `bugfix` | แก้ bug |
| `enhancement` | ปรับปรุง feature ที่มี |
| `refactor` | ปรับโครงสร้าง code |
| `test` | เพิ่ม tests |
| `docs` | documentation |

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Add your changes
4. Submit a Pull Request
