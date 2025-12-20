# .NET Core Development Expert Skill

Expert-level .NET Core development skill สำหรับ Claude Code CLI พร้อม Microsoft Learn MCP integration

## ✨ Features

- **Clean Architecture** patterns และ project structure
- **Entity Framework Core** - Code First, migrations, advanced patterns
- **Repository + Unit of Work** patterns
- **ASP.NET Core** - MVC, Web API, Minimal APIs
- **.NET Aspire** - Distributed applications orchestration
- **CQRS with MediatR** - Command/Query separation
- **Testing patterns** - Unit tests, Integration tests
- **Microsoft Learn MCP** - Access to latest Microsoft documentation

## 📦 Installation

### As Plugin (Recommended)
```bash
# Add to marketplace (if published)
/plugin marketplace add your-username/dotnet-dev-skill

# Or install from local
/plugin add /path/to/dotnet-dev-skill
```

### As Standalone Skill
```bash
# Copy to personal skills
cp -r dotnet-dev-skill/skills/dotnet-dev ~/.claude/skills/
```

## 🔧 MCP Configuration

Plugin จะ configure Microsoft Learn MCP ให้อัตโนมัติ หรือ configure เองได้:

```json
{
  "mcpServers": {
    "microsoft-learn": {
      "type": "streamable-http",
      "url": "https://learn.microsoft.com/api/mcp"
    }
  }
}
```

## 📖 What's Included

### Skill (SKILL.md)
- Core principles และ architecture preferences
- Project structure templates
- Code patterns (Repository, Unit of Work, CQRS)
- Best practices checklist

### References
- `ef-core-patterns.md` - Advanced EF Core patterns
- `aspire-setup.md` - .NET Aspire configuration
- `testing-patterns.md` - Testing strategies
- `microsoft-learn-mcp.md` - MCP usage guide

## 🚀 Usage Examples

```
# สร้าง project ใหม่
"สร้าง ASP.NET Core Web API project ด้วย Clean Architecture"

# Entity Framework
"สร้าง Entity Configuration สำหรับ Order และ OrderItems"

# Repository Pattern
"Implement generic repository พร้อม Unit of Work"

# .NET Aspire
"Setup .NET Aspire AppHost สำหรับ microservices"

# ค้นหา documentation
"ใช้ Microsoft Learn MCP ค้นหา JWT authentication configuration"
```

## 📋 Trigger Keywords

Skill จะถูก activate โดยอัตโนมัติเมื่อพูดถึง:
- .NET, C#, Entity Framework
- ASP.NET, MVC, Web API
- Repository pattern, Unit of Work
- Clean Architecture, CQRS
- Migrations, DbContext
- Dependency Injection
- Aspire, Blazor

## 🏗️ Architecture Preferences

Based on user's development patterns:

1. **Domain-First** - เริ่มจาก domain model ก่อนเสมอ
2. **Clean Architecture** - แยก layers ชัดเจน
3. **Repository + UoW** - Data access layer
4. **PostgreSQL** - Primary database
5. **Redis** - Caching layer
6. **Soft Delete** - ไม่ hard delete

## 📄 License

MIT
