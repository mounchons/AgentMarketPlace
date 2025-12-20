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

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Add your changes
4. Submit a Pull Request
