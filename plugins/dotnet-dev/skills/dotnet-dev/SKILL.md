---
name: dotnet-dev
description: Expert .NET Core development skill for ASP.NET Core MVC, Entity Framework Core, Clean Architecture,
  Repository/Unit of Work patterns, and .NET Aspire. Supports both PostgreSQL and SQL Server.
  Use when creating .NET projects, writing C# code, designing Entity Framework models, implementing APIs,
  setting up dependency injection, database migrations, or any .NET Core development task.
  Triggers - .NET, C#, Entity Framework, ASP.NET, EF Core, migration, repository pattern,
  unit of work, Clean Architecture, Aspire, Web API, MVC, dependency injection, DbContext,
  LINQ, Blazor, SQL Server, PostgreSQL.
  Thai triggers - "สร้างโปรเจกต์ .NET", "เขียน C#", "ออกแบบ entity", "ทำ migration",
  "ต่อฐานข้อมูล", "สร้าง API", "ทำ Web API", "วาง architecture"
---

# .NET Core Development Expert Skill

คุณเป็น .NET Core Development Expert ที่เชี่ยวชาญในการพัฒนาระบบ Enterprise-grade ด้วย Microsoft Stack

## 🎯 Core Principles (จาก User Preferences)

### 1. Domain-First Approach
- **เริ่มจาก Domain Model เสมอ** - คิดจาก Business Requirements ก่อน
- ออกแบบ Entities และ Relationships ก่อนเขียน Code
- ใช้ Rich Domain Models แทน Anemic Models

### 2. Architecture Preferences
- **Clean Architecture** เป็นหลัก
- **Repository Pattern + Unit of Work** สำหรับ Data Access
- **CQRS with MediatR** สำหรับ Complex Applications
- Dependency Injection ทุกที่

### 3. Technology Stack
- .NET 10 (LTS ปัจจุบัน — support ถึง Nov 2028; .NET 8 จะหมด support Nov 2026)
- Entity Framework Core 10 (Code First)
- **PostgreSQL** หรือ **SQL Server** เป็น Primary Database
- Redis สำหรับ Caching (ผ่าน HybridCache — L1 in-memory + L2 Redis)
- ASP.NET Core MVC / Web API / Minimal APIs

> **กันล้าสมัย:** ก่อนเริ่มโปรเจกต์ใหม่ ให้ตรวจ LTS version ล่าสุดด้วย `microsoft_docs_search`
> query: "dotnet releases and support" — ใช้ LTS ล่าสุดเสมอ

---

## 🗄️ Database Provider Selection

### เมื่อไหร่ใช้ PostgreSQL
- Open source, ไม่มีค่า license
- ต้องการ JSONB columns
- Full-text search ภาษาไทย
- Array data types
- Linux/Container deployment

### เมื่อไหร่ใช้ SQL Server
- Enterprise environment ที่มี license อยู่แล้ว
- ต้องการ Temporal Tables (System-Versioned)
- Row-Level Security (RLS)
- Always Encrypted
- Integration กับ Azure services
- Legacy systems ที่ใช้ SQL Server อยู่

---

## 🧭 Minimal APIs vs MVC Controllers

| เลือก | เมื่อ |
|-------|------|
| **MVC Controllers** (default ของทีมนี้) | Enterprise app, ต้องการ filters/model binding ขั้นสูง, OData, ทีมถนัด MVC |
| **Minimal APIs** | Microservice เล็ก, endpoint ไม่กี่ตัว — Microsoft แนะนำเป็น default สำหรับ project ใหม่ |

> ทั้งคู่ supported เต็มที่ใน .NET 10 — ทีมนี้ default = **Controllers** ตามความถนัด
> แต่ service ใหม่ขนาดเล็กควรพิจารณา Minimal APIs + route groups + endpoint filters

---

## 📚 เมื่อต้องการข้อมูลล่าสุดจาก Microsoft Learn

Plugin นี้ bundle MCP server `microsoft-learn` มาให้แล้ว — เรียก tools ได้โดยตรง (ไม่ต้องใช้ CLI อื่น):

| Tool | ใช้เมื่อ |
|------|---------|
| `microsoft_docs_search` | ค้นหา docs — ได้ chunks สั้นๆ สูงสุด 10 รายการ (เริ่มจากตัวนี้ก่อน) |
| `microsoft_code_sample_search` | หาตัวอย่างโค้ดจริงจาก Microsoft Learn (กรองด้วย `language` ได้) |
| `microsoft_docs_fetch` | ดึงทั้งหน้าเป็น markdown เมื่อต้องการ tutorial/รายละเอียดเต็ม |

> ชื่อเต็มเมื่อติดตั้งผ่าน plugin: `mcp__plugin_dotnet-dev_microsoft-learn__microsoft_docs_search` ฯลฯ
> ถ้า tools ยังไม่โหลด ให้ใช้ ToolSearch ค้น "microsoft docs" ก่อน

**เมื่อไหร่ควรใช้ Microsoft Learn MCP:**
- ต้องการ syntax หรือ API ล่าสุด
- ไม่แน่ใจเกี่ยวกับ breaking changes ใน version ใหม่
- ต้องการ best practices จาก Microsoft
- ค้นหา configuration options ที่ถูกต้อง

---

## 🏗️ Project Structure (Clean Architecture)

```
Solution/
├── src/
│   ├── Domain/                    # Core business logic
│   │   ├── Entities/
│   │   ├── ValueObjects/
│   │   ├── Enums/
│   │   ├── Events/
│   │   └── Exceptions/
│   │
│   ├── Application/               # Use cases & business rules
│   │   ├── Common/
│   │   │   ├── Interfaces/
│   │   │   ├── Behaviors/
│   │   │   └── Mappings/
│   │   ├── Features/
│   │   │   └── [Feature]/
│   │   │       ├── Commands/
│   │   │       └── Queries/
│   │   └── DTOs/
│   │
│   ├── Infrastructure/            # External concerns
│   │   ├── Data/
│   │   │   ├── Configurations/
│   │   │   ├── Repositories/
│   │   │   ├── Migrations/
│   │   │   └── ApplicationDbContext.cs
│   │   ├── Services/
│   │   └── DependencyInjection.cs
│   │
│   └── WebApi/                    # Presentation layer
│       ├── Controllers/
│       ├── Middleware/
│       ├── Filters/
│       └── Program.cs
│
├── tests/
│   ├── Domain.Tests/
│   ├── Application.Tests/
│   └── Integration.Tests/
│
└── [AppName].AppHost/             # .NET Aspire (optional)
    └── Program.cs
```

---

## 📋 Code Patterns & Templates

โค้ด template เต็ม (BaseEntity, Repository, Unit of Work, Generic Repository, DbContext multi-DB, DI provider switch, appsettings, Aspire AppHost) ย้ายไป `${CLAUDE_PLUGIN_ROOT}/skills/dotnet-dev/references/clean-architecture-templates.md` (progressive disclosure — โหลดเฉพาะตอนต้องการ scaffold)

**Pattern สรุป** (โค้ดเต็มดู reference):
1. `BaseEntity<TKey>` generic เป็นตัวหลัก (ห้าม property hiding) — audit stamp ผ่าน interceptor ที่เดียว
2. Per-aggregate `IRepository<T>` (ไม่ leak `IQueryable` — return `IReadOnlyList`/paged) + Unit of Work
3. UoW transaction wrap ด้วย `CreateExecutionStrategy().ExecuteAsync(...)` (กันชน `EnableRetryOnFailure`)
4. DbContext multi-DB + provider switch ใน DI (Postgres/SQL Server เลือกตาม config)
5. Aspire AppHost dual-DB → ดู `references/aspire-setup.md` (Enrich*DbContext แก้ double-register)

---

## 🔧 Common Tasks

### Migration Commands
```bash
# Add migration
dotnet ef migrations add InitialCreate -p Infrastructure -s WebApi

# Update database
dotnet ef database update -p Infrastructure -s WebApi

# Generate SQL script
dotnet ef migrations script -p Infrastructure -s WebApi -o ./migrations.sql

# Remove last migration
dotnet ef migrations remove -p Infrastructure -s WebApi
```

### NuGet Packages

> **Licensing note (ตัดสินใจเอง):** MediatR v13+, AutoMapper v15+ และ FluentAssertions v8+
> เปลี่ยนเป็น commercial license แล้ว — version ที่ pin ด้านล่างยังเป็น OSS ใช้ฟรี แต่จะไม่ได้
> feature ใหม่ ทางเลือกฟรี: **Mapperly** (source-gen) แทน AutoMapper, manual mapping ใน projection,
> custom mediator/Wolverine แทน MediatR

#### Common Packages
```xml
<!-- Domain/Application -->
<PackageReference Include="MediatR" Version="12.*" />          <!-- v13+ commercial — 12.x ฟรี -->
<PackageReference Include="FluentValidation" Version="12.*" />
<PackageReference Include="AutoMapper" Version="13.*" />       <!-- v15+ commercial — พิจารณา Mapperly -->

<!-- Infrastructure - Core -->
<PackageReference Include="Microsoft.EntityFrameworkCore" Version="10.*" />
<PackageReference Include="Microsoft.Extensions.Caching.StackExchangeRedis" Version="10.*" />
<PackageReference Include="Microsoft.Extensions.Caching.Hybrid" Version="10.*" />

<!-- WebApi — .NET 9+ ใช้ built-in OpenAPI แทน Swashbuckle (ถูกถอดจาก templates แล้ว) -->
<PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="10.*" />
<PackageReference Include="Serilog.AspNetCore" Version="9.*" />
```

```csharp
// Program.cs — built-in OpenAPI (.NET 9+)
builder.Services.AddOpenApi();
// ...
app.MapOpenApi(); // /openapi/v1.json
// UI (optional): Scalar.AspNetCore → app.MapScalarApiReference();
// ⚠️ .WithOpenApi() ต่อ endpoint ถูก deprecate ใน .NET 10 (ASPDEPR002) — ใช้ AddOpenApiOperationTransformer แทน
```

#### PostgreSQL Packages
```xml
<PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="10.*" />

<!-- Aspire client integration (Aspire 13.x) -->
<PackageReference Include="Aspire.Npgsql.EntityFrameworkCore.PostgreSQL" Version="13.*" />
```

#### SQL Server Packages
```xml
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="10.*" />

<!-- Aspire client integration (Aspire 13.x) -->
<PackageReference Include="Aspire.Microsoft.EntityFrameworkCore.SqlServer" Version="13.*" />
```

---

## 📖 Reference Files

ดูไฟล์เพิ่มเติมใน (paths relative to `${CLAUDE_PLUGIN_ROOT}/skills/dotnet-dev/`):
- `references/clean-architecture-templates.md` - โค้ด template เต็ม (BaseEntity, Repository/UoW, DbContext, DI, Aspire AppHost)
- `references/ef-core-patterns.md` - EF Core advanced patterns + EF Core 10 (PostgreSQL + SQL Server)
- `references/aspire-setup.md` - .NET Aspire 13 configuration
- `references/dependency-injection.md` - TimeProvider, keyed services, options, HybridCache, IExceptionHandler
- `references/auth-security.md` - JWT bearer, ASP.NET Core Identity API endpoints, authorization policies (.NET 10)
- `references/react-integration.md` - CORS, Vite proxy, Aspire AddViteApp, openapi-typescript client, BFF
- `references/testing-patterns.md` - Testing strategies (xunit.v3, Testcontainers 4.x dual-DB, Respawn, FakeTimeProvider)
- `references/deployment.md` - aspire publish / azd up, migration bundles + dedicated migration service
- `references/microsoft-learn-mcp.md` - MCP usage guide

---

## ⚠️ Best Practices

1. **Always use async/await** - ไม่ block threads
2. **Use CancellationToken** - ทุก async method
3. **Validate inputs** - FluentValidation ก่อน process
4. **Log appropriately** - Structured logging with Serilog
5. **Handle exceptions** - `IExceptionHandler` + ProblemDetails (.NET 8+) แทน custom middleware
6. **Write tests** - Unit tests for business logic, Integration tests (Testcontainers) for data access + APIs
7. **Use DTOs** - ไม่ expose Entities ตรงๆ
8. **Soft delete** - IsDeleted flag + global query filter เป็น authority เดียว (ห้าม filter ซ้ำใน repository)
9. **Audit trail** - CreatedAt/UpdatedAt/CreatedBy/UpdatedBy stamp ผ่าน interceptor ที่เดียว
10. **Use TimeProvider** - แทน DateTime.UtcNow ตรงๆ — test ได้ด้วย FakeTimeProvider
11. **Transactions + retry** - เมื่อเปิด EnableRetryOnFailure ต้อง wrap transaction ด้วย execution strategy (ดู pattern #3)
12. **Use connection resiliency** - EnableRetryOnFailure ทั้ง PostgreSQL และ SQL Server
