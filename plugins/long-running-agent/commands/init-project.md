---
description: สร้าง CLAUDE.md และ project configuration เริ่มต้น
allowed-tools: Bash(*), Read(*), Write(*), Edit(*)
---

# Init Project Command

สร้าง CLAUDE.md และ configuration เริ่มต้นสำหรับโปรเจค

## วัตถุประสงค์

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INIT PROJECT WORKFLOW                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  /init-project                                                              │
│       │                                                                      │
│       ├── สร้าง CLAUDE.md (Project Rules)                                   │
│       ├── สร้าง .claude/settings.json (Optional)                            │
│       └── Git init (ถ้ายังไม่มี)                                            │
│                                                                              │
│  Output:                                                                     │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │ CLAUDE.md                                                          │     │
│  │ ├── Project Description                                            │     │
│  │ ├── Technology Stack                                               │     │
│  │ ├── Coding Conventions                                             │     │
│  │ ├── Commands & Scripts                                             │     │
│  │ └── Rules for Claude                                               │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Input ที่ได้รับ

```
/init-project
/init-project สร้างระบบ HR ด้วย .NET Core
$ARGUMENTS
```

## ขั้นตอนที่ต้องทำ

### Step 1: รวบรวมข้อมูลโปรเจค

ถาม user เกี่ยวกับ:
1. **ชื่อโปรเจค** - ชื่อที่ใช้เรียก
2. **คำอธิบาย** - โปรเจคนี้ทำอะไร
3. **Technology Stack** - ใช้ technology อะไร
4. **Coding Conventions** - มี conventions พิเศษหรือไม่

หรือวิเคราะห์จาก $ARGUMENTS ถ้ามี

### Step 2: ตรวจสอบโปรเจคที่มีอยู่

```bash
# ตรวจสอบว่ามีไฟล์อะไรบ้าง
ls -la

# ตรวจสอบ git
git status 2>/dev/null || echo "Not a git repo"

# ตรวจสอบ technology
ls *.csproj 2>/dev/null && echo "=== .NET Project ==="
ls package.json 2>/dev/null && echo "=== Node.js Project ==="
ls requirements.txt 2>/dev/null && echo "=== Python Project ==="
```

### Step 3: สร้าง CLAUDE.md

**Template:**

```markdown
# [Project Name]

> [Short description]

## Project Overview

[Detailed description of the project]

## Technology Stack

- **Framework**: [e.g., .NET Core 8, React 18]
- **Database**: [e.g., PostgreSQL, SQL Server]
- **ORM**: [e.g., Entity Framework Core]
- **Authentication**: [e.g., JWT, Identity]
- **Other**: [Additional technologies]

## Project Structure

```
[Project structure here]
```

## Coding Conventions

### Naming Conventions
- **Classes**: PascalCase (e.g., `UserService`)
- **Methods**: PascalCase (e.g., `GetUserById`)
- **Variables**: camelCase (e.g., `userName`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- **Interfaces**: IPascalCase (e.g., `IUserRepository`)

### File Organization
- One class per file
- File name matches class name
- Group related files in folders

### Code Style
- Use `var` for obvious types
- Prefer async/await over Task.Result
- Use dependency injection
- Write unit tests for business logic

## Commands

| Command | Description |
|---------|-------------|
| `dotnet build` | Build the project |
| `dotnet test` | Run tests |
| `dotnet run --project WebApi` | Run the API |
| `dotnet ef migrations add [Name]` | Add migration |
| `dotnet ef database update` | Apply migrations |

## Rules for Claude

### Do
- Follow the coding conventions above
- Write clean, readable code
- Add appropriate error handling
- Use dependency injection
- Write unit tests for new features

### Don't
- Don't use deprecated APIs
- Don't hardcode secrets or connection strings
- Don't skip error handling
- Don't commit directly to main branch
- Don't ignore existing patterns in the codebase

### Before Starting Work
1. Read this CLAUDE.md file
2. Check .agent/progress.md for context
3. Run `dotnet build` to verify the project works
4. Review recent git commits

### After Completing Work
1. Run tests: `dotnet test`
2. Update .agent/progress.md
3. Commit with descriptive message
4. Update feature_list.json if applicable

## Related Documents

- [System Design Document](./system-design-[name].md)
- [Feature List](./feature_list.json)
- [Progress Log](./.agent/progress.md)
```

### Step 4: สร้างโฟลเดอร์ .claude (Optional)

```bash
mkdir -p .claude
```

**สร้าง .claude/settings.json:**

```json
{
  "projectType": "development",
  "preferredLanguage": "th",
  "autoCommit": false,
  "requireTests": true
}
```

### Step 5: Git Init (ถ้ายังไม่มี)

```bash
git init 2>/dev/null || echo "Git already initialized"
```

### Step 6: Initial Commit

```bash
git add CLAUDE.md
git commit -m "chore: Add CLAUDE.md project configuration"
```

## Output

```
✅ Init Project สำเร็จ!

📁 Files created:
   • CLAUDE.md

📋 CLAUDE.md contains:
   • Project description
   • Technology stack
   • Coding conventions
   • Commands reference
   • Rules for Claude

💡 Next steps:
   1. Review and customize CLAUDE.md
   2. Run /system-design-doc to create design documents
   3. Run /init-mockup to create UI mockups
   4. Run /init-agent to start development
```

## CLAUDE.md Purpose

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         WHY CLAUDE.md?                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  CLAUDE.md เป็นไฟล์ที่ Claude Code จะอ่านโดยอัตโนมัติเมื่อเริ่ม session      │
│                                                                              │
│  ประโยชน์:                                                                   │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │ 1. Context - Claude รู้ว่าโปรเจคนี้เกี่ยวกับอะไร                    │     │
│  │ 2. Conventions - Claude ใช้ coding style ที่ถูกต้อง                │     │
│  │ 3. Commands - Claude รู้ว่าต้องใช้ commands อะไร                    │     │
│  │ 4. Rules - Claude ทำตามกฎที่กำหนด                                   │     │
│  │ 5. Consistency - ทุก session ใช้กฎเดียวกัน                         │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                              │
│  Claude จะอ่าน CLAUDE.md:                                                    │
│  • เมื่อเริ่ม session ใหม่                                                   │
│  • เมื่อใช้ /init-agent หรือ /init-agent-existing                          │
│  • เมื่อใช้ /continue                                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```
