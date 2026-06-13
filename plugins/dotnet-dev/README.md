# .NET Core Development Expert Skill

**Version: 1.3.0**

Expert-level .NET Core development skill สำหรับ Claude Code พร้อม Microsoft Learn MCP integration

## ✨ Features

- **Clean Architecture** patterns และ project structure (.NET 10 LTS baseline)
- **Entity Framework Core 10** - Code First, migrations, advanced patterns
- **Repository + Unit of Work** patterns (พร้อม trade-offs ตรงไปตรงมา + per-aggregate repository)
- **ASP.NET Core** - MVC, Web API, Minimal APIs (มี decision table ให้เลือก)
- **.NET Aspire** - Distributed applications orchestration
- **CQRS with MediatR** - Command/Query separation
- **Dual Database** - PostgreSQL และ SQL Server พร้อมเกณฑ์การเลือก
- **Testing patterns** - xUnit, Testcontainers, Integration tests
- **Microsoft Learn MCP** - ตรวจ documentation ล่าสุดจาก Microsoft ได้โดยตรง

## 📦 Installation

```bash
# ผ่าน marketplace (แนะนำ)
/plugin marketplace add mounchons/AgentMarketPlace
/plugin install dotnet-dev@agent-marketplace
```

```bash
# หรือ copy skill ไปใช้ standalone
cp -r plugins/dotnet-dev/skills/dotnet-dev ~/.claude/skills/
```

## 🔧 MCP Configuration

Plugin bundle Microsoft Learn MCP มาให้แล้ว (HTTP transport ตรง — ไม่ต้องพึ่ง Node/npx):

```json
{
  "mcpServers": {
    "microsoft-learn": {
      "type": "http",
      "url": "https://learn.microsoft.com/api/mcp"
    }
  }
}
```

Tools ที่ได้: `microsoft_docs_search`, `microsoft_code_sample_search`, `microsoft_docs_fetch`

## 📖 What's Included

### Skill (SKILL.md)
- Core principles และ architecture preferences
- Database provider selection (PostgreSQL vs SQL Server)
- Minimal APIs vs MVC Controllers decision table
- Code patterns (Repository, Unit of Work, DbContext, Aspire AppHost)
- Best practices checklist

### References
- `ef-core-patterns.md` - Advanced EF Core patterns (PostgreSQL + SQL Server)
- `aspire-setup.md` - .NET Aspire configuration (⚠️ ยังเป็น 8.x — รอ update เป็น Aspire 13)
- `testing-patterns.md` - Testing strategies (xUnit + Testcontainers + Respawn)
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
- ภาษาไทย: "สร้างโปรเจกต์ .NET", "เขียน C#", "ทำ migration", "สร้าง API"

## 🏗️ Architecture Preferences

Based on user's development patterns:

1. **Domain-First** - เริ่มจาก domain model ก่อนเสมอ
2. **Clean Architecture** - แยก layers ชัดเจน
3. **Repository + UoW** - Data access layer (พร้อม execution-strategy-safe transactions)
4. **PostgreSQL / SQL Server** - dual database พร้อมเกณฑ์การเลือก
5. **Redis + HybridCache** - Caching layer
6. **Soft Delete** - global query filter เป็น authority เดียว
7. **MVC Controllers** - default ของทีม (Minimal APIs สำหรับ service เล็ก)

## 📝 Changelog

### v1.3.0 (2026-06-12)
- ⬆️ Baseline เป็น **.NET 10 LTS + EF Core 10** (package pins 8.* → 10.*)
- 🔧 แก้ MCP docs ให้ใช้ชื่อ tool จริง (`microsoft_docs_search` / `microsoft_code_sample_search` / `microsoft_docs_fetch`) — ตัด mcporter และ `mcp__microsoft-learn__search` ที่ไม่มีอยู่จริง
- 🔧 plugin.json เปลี่ยน MCP transport เป็น HTTP ตรง (ตัด npx/mcp-remote dependency)
- 🐛 แก้ template bugs: `BaseEntity<TKey>` property hiding (`new Id`), soft-delete filter ซ้ำสองชั้น, `AddAsync` → `Add`, audit stamping ซ้ำ (เหลือ interceptor ทางเดียว)
- 🐛 เพิ่ม `ExecuteInTransactionAsync` (execution strategy) — แก้ UoW transaction ชน `EnableRetryOnFailure` ที่ throw runtime
- ✨ Swashbuckle → built-in OpenAPI (`AddOpenApi`/`MapOpenApi`), เพิ่ม HybridCache, TimeProvider
- ✨ เพิ่ม Minimal APIs vs Controllers decision table + Repository/UoW trade-off ตรงไปตรงมา + per-aggregate repository
- ✨ Aspire AppHost เพิ่ม `WaitFor` + `ContainerLifetime.Persistent` + licensing notes (MediatR/AutoMapper commercial)
- 📝 Restore trigger keywords (EN+TH) ใน SKILL.md frontmatter + แก้ README install ให้ถูกต้อง

### v1.2.0
- แก้ path/metadata, sync marketplace

### v1.1.0
- เพิ่ม SQL Server support (dual database)

### v1.0.0
- Initial release (PostgreSQL + Clean Architecture + Aspire)

## 📄 License

MIT
