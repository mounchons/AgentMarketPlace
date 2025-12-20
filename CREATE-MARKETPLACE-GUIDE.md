# 🏪 วิธีสร้าง Claude Code Plugin Marketplace ของคุณเอง

## Overview

Marketplace คือ Git repository ที่รวม plugins หลายตัวไว้ในที่เดียว ทำให้ทีมสามารถติดตั้ง plugins ได้ง่ายด้วยคำสั่งเดียว

## 📁 โครงสร้างที่จำเป็น

```
your-marketplace/
├── .claude-plugin/
│   └── marketplace.json          # ⭐ Required: Marketplace manifest
├── plugins/
│   ├── plugin-1/
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json       # Plugin manifest
│   │   ├── skills/               # Skills (optional)
│   │   ├── commands/             # Slash commands (optional)
│   │   ├── agents/               # Sub-agents (optional)
│   │   └── hooks/                # Hooks (optional)
│   └── plugin-2/
│       └── ...
└── README.md
```

---

## Step 1: สร้าง GitHub Repository

```bash
# สร้าง repo ใหม่
mkdir my-marketplace
cd my-marketplace
git init

# สร้างโครงสร้าง
mkdir -p .claude-plugin
mkdir -p plugins
```

---

## Step 2: สร้าง marketplace.json

ไฟล์ `.claude-plugin/marketplace.json`:

```json
{
  "name": "my-marketplace",
  "metadata": {
    "description": "My custom plugin marketplace",
    "version": "1.0.0",
    "homepage": "https://github.com/username/my-marketplace"
  },
  "owner": {
    "name": "Your Name",
    "email": "your-email@example.com"
  },
  "plugins": [
    {
      "name": "plugin-name",
      "source": "./plugins/plugin-name",
      "description": "What this plugin does",
      "version": "1.0.0",
      "category": "documentation",
      "tags": ["tag1", "tag2"],
      "author": {
        "name": "Your Name"
      }
    }
  ]
}
```

### Plugin Source Types

```json
// Local path (ภายใน marketplace repo)
"source": "./plugins/my-plugin"

// GitHub repository
"source": {
  "source": "github",
  "repo": "username/repo-name"
}

// Git URL
"source": {
  "source": "git",
  "url": "https://gitlab.com/user/repo.git"
}

// NPM package
"source": {
  "source": "npm",
  "package": "@scope/package-name"
}
```

---

## Step 3: สร้าง Plugin

### 3.1 Plugin Manifest (`.claude-plugin/plugin.json`)

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "Plugin description",
  "author": {
    "name": "Your Name"
  },
  "skills": [
    "skills/my-skill"
  ],
  "commands": [
    "commands"
  ],
  "agents": [
    "agents"
  ]
}
```

### 3.2 เพิ่ม Skill

```
plugins/my-plugin/
└── skills/
    └── my-skill/
        ├── SKILL.md
        ├── references/
        └── templates/
```

**SKILL.md format:**
```markdown
---
name: my-skill
description: When to use this skill and what it does
---

# My Skill

Instructions for Claude...
```

### 3.3 เพิ่ม Slash Command

```
plugins/my-plugin/
└── commands/
    └── my-command.md
```

**my-command.md format:**
```markdown
---
description: What this command does
allowed-tools: Bash(*), Read(*), Write(*)
---

# My Command

Instructions when user runs /my-command
```

### 3.4 เพิ่ม Sub-Agent

```
plugins/my-plugin/
└── agents/
    └── my-agent.md
```

**my-agent.md format:**
```markdown
---
name: my-agent
description: When Claude should delegate to this agent
model: sonnet
allowed-tools: Bash(*), Read(*)
---

# My Agent

System prompt for the sub-agent...
```

---

## Step 4: Push to GitHub

```bash
git add .
git commit -m "Initial marketplace setup"
git branch -M main
git remote add origin https://github.com/username/my-marketplace.git
git push -u origin main
```

---

## Step 5: ติดตั้งและใช้งาน

```bash
# ใน Claude Code CLI

# เพิ่ม marketplace
/plugin marketplace add username/my-marketplace

# ดู plugins ที่มี
/plugin marketplace list

# ติดตั้ง plugin
/plugin install plugin-name@my-marketplace

# หรือติดตั้งจาก local path (สำหรับ development)
/plugin marketplace add /path/to/my-marketplace
```

---

## 📋 ตัวอย่าง marketplace.json แบบเต็ม

```json
{
  "name": "thai-dev-marketplace",
  "metadata": {
    "description": "Thai Enterprise Development Plugins",
    "version": "1.0.0"
  },
  "owner": {
    "name": "Thai Dev Team",
    "email": "dev@company.com"
  },
  "plugins": [
    {
      "name": "system-design-doc",
      "source": "./plugins/system-design-doc",
      "description": "สร้างเอกสารออกแบบระบบ พร้อม Mermaid diagrams",
      "version": "1.0.0",
      "category": "documentation",
      "tags": ["thai", "documentation", "mermaid"]
    },
    {
      "name": "dotnet-helper",
      "source": "./plugins/dotnet-helper",
      "description": ".NET Core development tools and patterns",
      "version": "1.0.0",
      "category": "development",
      "tags": ["dotnet", "csharp", "aspnet"]
    },
    {
      "name": "db-migration",
      "source": {
        "source": "github",
        "repo": "company/db-migration-plugin"
      },
      "description": "Database migration automation",
      "version": "2.0.0",
      "category": "database"
    }
  ]
}
```

---

## 🔧 Tips

### Private Marketplace
- ใช้ private GitHub repo
- ทีมต้องมีสิทธิ์เข้าถึง repo

### Auto-Update
- Claude Code จะ auto-update plugins จาก marketplace
- ใช้ version numbers เพื่อ track changes

### Testing Locally
```bash
# ทดสอบก่อน push
/plugin marketplace add ./my-marketplace
/plugin install my-plugin@my-marketplace
```

### Validate JSON
```bash
# ตรวจสอบ JSON syntax
python -c "import json; json.load(open('.claude-plugin/marketplace.json'))"
```

---

## 📚 Resources

- [Official Docs](https://code.claude.com/docs/en/plugin-marketplaces)
- [Anthropic Skills Repo](https://github.com/anthropics/skills)
- [Plugin Template](https://github.com/ivan-magda/claude-code-plugin-template)

---

## 🎯 Quick Start Checklist

- [ ] สร้าง GitHub repository
- [ ] สร้าง `.claude-plugin/marketplace.json`
- [ ] สร้าง plugin ใน `plugins/` folder
- [ ] สร้าง `plugin.json` สำหรับแต่ละ plugin
- [ ] เพิ่ม skills/commands/agents ตามต้องการ
- [ ] Push to GitHub
- [ ] ทดสอบด้วย `/plugin marketplace add`
