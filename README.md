# Mounchons's Claude Code Marketplace

Custom plugin marketplace สำหรับ Claude Code รองรับงานพัฒนาระบบในองค์กรไทย

## 🚀 วิธีติดตั้ง Marketplace

```bash
# ใน Claude Code CLI
/plugin marketplace add mounchons/agentmarketplace
```

หรือติดตั้งจาก local path:
```bash
/plugin marketplace add /path/to/my-marketplace
```

## 📦 Plugins ที่มี

### 1. system-design-doc
สร้างเอกสารออกแบบระบบมาตรฐาน พร้อม Mermaid diagrams

**Features:**
- ✅ สร้างเอกสารใหม่จาก Requirements
- ✅ Reverse Engineering จาก Codebase
- ✅ รองรับ .NET Core, Node.js, Python, Laravel
- ✅ สร้าง ER Diagram, Flow Diagram, Sequence Diagram, DFD, Sitemap
- ✅ รองรับภาษาไทยและอังกฤษ

**ติดตั้ง:**
```bash
/plugin install system-design-doc@mounchons-marketplace
```

**ตัวอย่างการใช้งาน:**
```
สร้าง System Design Document สำหรับระบบ HR
อ่าน codebase นี้แล้วสร้างเอกสารออกแบบระบบ
สร้าง ER Diagram สำหรับระบบจองห้องประชุม
```

## 📁 โครงสร้าง Marketplace

```
my-marketplace/
├── .claude-plugin/
│   └── marketplace.json          # Marketplace manifest
├── plugins/
│   └── system-design-doc/
│       ├── .claude-plugin/
│       │   └── plugin.json       # Plugin manifest
│       └── skills/
│           └── system-design-doc/
│               ├── SKILL.md
│               ├── references/
│               └── templates/
└── README.md
```

## 🛠️ วิธีเพิ่ม Plugin ใหม่

1. สร้างโฟลเดอร์ใน `plugins/`
2. สร้าง `.claude-plugin/plugin.json`
3. เพิ่ม skills, commands, หรือ agents
4. อัพเดท `marketplace.json`

## 📝 License

MIT License
