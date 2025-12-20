# Mounchons's Claude Code Marketplace

Custom plugin marketplace สำหรับ Claude Code รองรับงานพัฒนาระบบในองค์กรไทย

## 🚀 วิธีติดตั้ง Marketplace

```bash
# ใน Claude Code CLI
/plugin marketplace add mounchons/agentmarketplace
```

หรือติดตั้งจาก local path:
```bash
/plugin marketplace add /path/to/agentmarketplace
```

---

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
/plugin install system-design-doc@agent-marketplace
```

**ตัวอย่างการใช้งาน:**
```
สร้าง System Design Document สำหรับระบบ HR
อ่าน codebase นี้แล้วสร้างเอกสารออกแบบระบบ
สร้าง ER Diagram สำหรับระบบจองห้องประชุม
วิเคราะห์ Entity classes แล้วสร้าง ER Diagram
```

---

### 2. dotnet-dev

Expert .NET Core development skill พร้อม Microsoft Learn MCP integration

**Features:**
- ✅ Clean Architecture patterns และ project structure
- ✅ Entity Framework Core - Code First, migrations, advanced patterns
- ✅ Repository + Unit of Work patterns
- ✅ ASP.NET Core - MVC, Web API, Minimal APIs
- ✅ .NET Aspire - Distributed applications orchestration
- ✅ CQRS with MediatR - Command/Query separation
- ✅ Testing patterns - Unit tests, Integration tests
- ✅ **PostgreSQL** - Full support with JSONB, Full-text search
- ✅ **SQL Server** - Full support with Temporal Tables, Row-Level Security
- ✅ Microsoft Learn MCP - Access latest documentation

**ติดตั้ง:**
```bash
/plugin install dotnet-dev@agent-marketplace
```

**ตัวอย่างการใช้งาน:**
```
# Project Setup
สร้าง ASP.NET Core Web API project ด้วย Clean Architecture

# Entity Framework
สร้าง Entity Configuration สำหรับ Order และ OrderItems
Implement generic repository พร้อม Unit of Work

# Database
สร้าง DbContext สำหรับ SQL Server พร้อม connection resiliency
Configure PostgreSQL with JSONB column

# .NET Aspire
Setup .NET Aspire AppHost สำหรับ microservices

# Documentation
ใช้ Microsoft Learn MCP ค้นหา JWT authentication configuration
```

**MCP Integration:**
Plugin มาพร้อม Microsoft Learn MCP ที่ configure ไว้แล้ว:
```json
{
  "microsoft-learn": {
    "type": "streamable-http",
    "url": "https://learn.microsoft.com/api/mcp"
  }
}
```

**Reference Files:**
| File | Description |
|------|-------------|
| `SKILL.md` | Core patterns, project structure, code templates |
| `ef-core-patterns.md` | Advanced EF Core patterns (PostgreSQL + SQL Server) |
| `aspire-setup.md` | .NET Aspire configuration |
| `testing-patterns.md` | Testing strategies with xUnit, NSubstitute |
| `microsoft-learn-mcp.md` | MCP usage guide |

---

## 📁 โครงสร้าง Marketplace

```
agentmarketplace/
├── .claude-plugin/
│   └── marketplace.json
├── plugins/
│   ├── system-design-doc/
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json
│   │   └── skills/
│   │       └── system-design-doc/
│   │           ├── SKILL.md
│   │           ├── references/
│   │           └── templates/
│   └── dotnet-dev/
│       ├── .claude-plugin/
│       │   └── plugin.json
│       ├── README.md
│       └── skills/
│           └── dotnet-dev/
│               ├── SKILL.md
│               └── references/
│                   ├── ef-core-patterns.md
│                   ├── aspire-setup.md
│                   ├── testing-patterns.md
│                   └── microsoft-learn-mcp.md
└── README.md
```

---

## 🛠️ วิธีเพิ่ม Plugin ใหม่

1. สร้างโฟลเดอร์ใน `plugins/`
2. สร้าง `.claude-plugin/plugin.json`
3. เพิ่ม skills, commands, หรือ agents
4. อัพเดท `marketplace.json`

### plugin.json Template
```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "Plugin description",
  "author": { "name": "Your Name" },
  "skills": ["./skills/my-skill"]
}
```

### SKILL.md Template
```markdown
---
name: my-skill
description: |
  When to use this skill and trigger keywords
---

# Skill Title

Instructions for Claude...
```

---

## 📝 License

MIT License

---

## 🤝 Contributing

1. Fork the repository
2. Create your plugin branch
3. Add your plugin to `plugins/`
4. Update `marketplace.json`
5. Submit a Pull Request
