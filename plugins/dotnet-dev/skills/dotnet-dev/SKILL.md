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

### 1. Base Entity
```csharp
// Generic เป็นตัวหลัก — ห้ามใช้ `new TKey Id` ซ่อน property ฐาน (property hiding ทำให้ EF map ผิด)
public abstract class BaseEntity<TKey>
{
    public TKey Id { get; set; } = default!;
    // Audit fields ถูก stamp โดย AuditableEntityInterceptor — อย่า set ค่าใน entity เอง
    public DateTime CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; }
}

public abstract class BaseEntity : BaseEntity<long>
{
}
```

### 2. Repository Interface

> **Trade-off ที่ต้องรู้ (ตรงไปตรงมา):** Microsoft ระบุว่า `DbContext` เป็น Repository + Unit of Work
> ในตัวอยู่แล้ว และ repository "ไม่ใช่ข้อบังคับ" — ทีมนี้เลือกใช้เพราะถนัด, ทำ contract ชัด, และ mock ง่าย
> **ข้อควรระวัง:** `Query()` ที่ return `IQueryable` ทำให้ mock repository ไม่ได้จริง (EF testing docs)
> ถ้าจะใช้ ให้ยอมรับว่า test ของ query นั้นต้องเป็น integration test (Testcontainers)
> ทางที่ดีกว่า: ทำ **per-aggregate repository** (`ICustomerRepository : IRepository<Customer>`)
> ใส่ query เฉพาะทางที่ return ผลลัพธ์จริง (`IReadOnlyList<T>` / DTO / paged result)

```csharp
public interface IRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(long id, CancellationToken ct = default);
    Task<IReadOnlyList<T>> GetAllAsync(CancellationToken ct = default);
    T Add(T entity);
    void Update(T entity);
    void Delete(T entity);
    Task<bool> ExistsAsync(long id, CancellationToken ct = default);
    IQueryable<T> Query(); // ใช้เท่าที่จำเป็น — ดู trade-off ด้านบน
}

// ตัวอย่าง per-aggregate repository — query เฉพาะทางอยู่ที่นี่ ไม่ leak IQueryable ออกนอก Infrastructure
public interface ICustomerRepository : IRepository<Customer>
{
    Task<IReadOnlyList<Customer>> GetActiveWithOrdersAsync(CancellationToken ct = default);
}
```

### 3. Unit of Work

> **Bug ที่เจอบ่อย:** เมื่อเปิด `EnableRetryOnFailure` (pattern #6) การเรียก `BeginTransactionAsync` ตรงๆ
> จะ throw `InvalidOperationException` — retrying execution strategy ไม่รองรับ user-initiated transaction
> ต้อง wrap ด้วย `CreateExecutionStrategy().ExecuteAsync(...)` เสมอ
> **Note:** `SaveChangesAsync` ครั้งเดียวเป็น atomic อยู่แล้ว — เปิด transaction เพิ่มเฉพาะเมื่อมี
> หลาย SaveChanges หรือ operation นอก EF ที่ต้อง atomic ด้วยกัน

```csharp
public interface IUnitOfWork : IDisposable
{
    // Repositories
    IRepository<Customer> Customers { get; }
    IRepository<Order> Orders { get; }

    Task<int> SaveChangesAsync(CancellationToken ct = default);

    // Execution-strategy-safe transaction (ใช้ได้กับ EnableRetryOnFailure)
    Task ExecuteInTransactionAsync(
        Func<CancellationToken, Task> operation,
        CancellationToken ct = default);
}

// Implementation (ส่วน transaction)
public async Task ExecuteInTransactionAsync(
    Func<CancellationToken, Task> operation,
    CancellationToken ct = default)
{
    var strategy = _context.Database.CreateExecutionStrategy();
    await strategy.ExecuteAsync(async () =>
    {
        await using var tx = await _context.Database.BeginTransactionAsync(ct);
        await operation(ct);
        await _context.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
    });
}
```

### 4. Generic Repository Implementation
```csharp
public class Repository<T> : IRepository<T> where T : BaseEntity
{
    protected readonly ApplicationDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public Repository(ApplicationDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    // Soft delete ถูกกรองโดย global query filter ใน DbContext แล้ว (pattern #5)
    // — ห้าม filter !IsDeleted ซ้ำที่นี่ (ซ้ำซ้อน + สับสนว่ากลไกไหนเป็น authority)
    // ถ้าต้องการเห็นแถวที่ถูกลบ (admin/report) ใช้ _dbSet.IgnoreQueryFilters()

    public virtual async Task<T?> GetByIdAsync(long id, CancellationToken ct = default)
        => await _dbSet.FirstOrDefaultAsync(e => e.Id == id, ct);

    public virtual async Task<IReadOnlyList<T>> GetAllAsync(CancellationToken ct = default)
        => await _dbSet.AsNoTracking().ToListAsync(ct);

    public virtual T Add(T entity)
    {
        _dbSet.Add(entity); // AddAsync จำเป็นเฉพาะ HiLo value generator — กรณีทั่วไปใช้ Add ปกติ
        return entity;
    }

    public virtual void Update(T entity)
        => _dbSet.Update(entity); // audit fields ถูก stamp โดย interceptor ตอน SaveChanges

    public virtual void Delete(T entity)
    {
        entity.IsDeleted = true; // soft delete
        _dbSet.Update(entity);
    }

    public virtual async Task<bool> ExistsAsync(long id, CancellationToken ct = default)
        => await _dbSet.AnyAsync(e => e.Id == id, ct);

    public virtual IQueryable<T> Query()
        => _dbSet; // global query filter ใช้กับ IQueryable นี้อัตโนมัติ
}
```

### 5. DbContext - Multi-Database Support
```csharp
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    // DbSets
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Order> Orders => Set<Order>();

    // Audit stamping (CreatedAt/CreatedBy/UpdatedAt/UpdatedBy) ทำใน AuditableEntityInterceptor
    // (โค้ดเต็ม: references/ef-core-patterns.md, register ใน DI — pattern #6)
    // ⚠️ เลือกกลไกเดียว — ห้าม override SaveChangesAsync stamp ซ้ำ ไม่งั้น timestamp ถูกเขียนสองชั้น

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all configurations from assembly
        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(ApplicationDbContext).Assembly);

        // Global query filter for soft delete — เป็น authority เดียว
        // (repository ห้าม filter !IsDeleted ซ้ำ; ปิดชั่วคราวด้วย IgnoreQueryFilters())
        // EF Core 10: แนะนำ named filter — HasQueryFilter("SoftDelete", e => !e.IsDeleted)
        // แล้วปิดเฉพาะตัวด้วย IgnoreQueryFilters(["SoftDelete"]) — จำเป็นเมื่อใช้ร่วมกับ tenant filter
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
            {
                modelBuilder.Entity(entityType.ClrType)
                    .HasQueryFilter(
                        GenerateSoftDeleteFilter(entityType.ClrType));
            }
        }
    }

    private static LambdaExpression GenerateSoftDeleteFilter(Type type)
    {
        var parameter = Expression.Parameter(type, "e");
        var property = Expression.Property(parameter, nameof(BaseEntity.IsDeleted));
        var condition = Expression.Equal(property, Expression.Constant(false));
        return Expression.Lambda(condition, parameter);
    }
}
```

### 6. Dependency Injection - Database Provider
```csharp
// Infrastructure/DependencyInjection.cs
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var dbProvider = configuration.GetValue<string>("DatabaseProvider") ?? "PostgreSQL";

        // Audit interceptor — กลไกเดียวสำหรับ stamp audit fields (โค้ด: references/ef-core-patterns.md)
        services.AddScoped<AuditableEntityInterceptor>();

        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            options.AddInterceptors(sp.GetRequiredService<AuditableEntityInterceptor>());

            switch (dbProvider)
            {
                case "SqlServer":
                    options.UseSqlServer(
                        configuration.GetConnectionString("DefaultConnection"),
                        sqlOptions =>
                        {
                            sqlOptions.MigrationsAssembly(
                                typeof(ApplicationDbContext).Assembly.FullName);
                            sqlOptions.EnableRetryOnFailure(
                                maxRetryCount: 3,
                                maxRetryDelay: TimeSpan.FromSeconds(30),
                                errorNumbersToAdd: null);
                        });
                    break;
                    
                case "PostgreSQL":
                default:
                    options.UseNpgsql(
                        configuration.GetConnectionString("DefaultConnection"),
                        npgsqlOptions =>
                        {
                            npgsqlOptions.MigrationsAssembly(
                                typeof(ApplicationDbContext).Assembly.FullName);
                            npgsqlOptions.EnableRetryOnFailure(
                                maxRetryCount: 3,
                                maxRetryDelay: TimeSpan.FromSeconds(30),
                                errorCodesToAdd: null);
                        });
                    break;
            }
        });

        // Repositories
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Caching — HybridCache (L1 in-memory + stampede protection) ใช้ Redis เป็น L2 อัตโนมัติ
        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = configuration.GetConnectionString("Redis");
            options.InstanceName = "App_";
        });
        services.AddHybridCache(); // inject HybridCache แทน IDistributedCache ตรงๆ

        // เวลา — ใช้ TimeProvider แทน DateTime.UtcNow ตรงๆ (test ได้ด้วย FakeTimeProvider)
        services.AddSingleton(TimeProvider.System);

        return services;
    }
}
```

### 7. appsettings.json - Database Configuration
```json
{
  "DatabaseProvider": "SqlServer",
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=MyApp;User Id=sa;Password=YourPassword;TrustServerCertificate=True;",
    "Redis": "localhost:6379"
  }
}
```

```json
{
  "DatabaseProvider": "PostgreSQL",
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=myapp;Username=postgres;Password=YourPassword;",
    "Redis": "localhost:6379"
  }
}
```

### 8. .NET Aspire AppHost - Multi-Database
```csharp
// AppHost/Program.cs
var builder = DistributedApplication.CreateBuilder(args);

// Choose database provider
var usePostgres = builder.Configuration.GetValue<bool>("UsePostgres", true);

IResourceBuilder<IResourceWithConnectionString> database;

if (usePostgres)
{
    var postgres = builder.AddPostgres("postgres")
        .WithLifetime(ContainerLifetime.Persistent) // container ไม่ถูก recreate ทุกครั้งที่ F5
        .WithPgAdmin()
        .AddDatabase("appdb");
    database = postgres;
}
else
{
    var sqlserver = builder.AddSqlServer("sqlserver")
        .WithLifetime(ContainerLifetime.Persistent)
        .AddDatabase("appdb");
    database = sqlserver;
}

var redis = builder.AddRedis("redis")
    .WithRedisCommander();

// API Project — WaitFor: ไม่ start จนกว่า database/redis พร้อมรับ request
var api = builder.AddProject<Projects.WebApi>("api")
    .WithReference(database).WaitFor(database)
    .WithReference(redis).WaitFor(redis)
    .WithExternalHttpEndpoints();

builder.Build().Run();
```

> 📖 ดู `references/aspire-setup.md` (Aspire 13 / .NET 10 — verified vs Microsoft Learn):
> Aspire CLI (`aspire new`/`run`/`update`), AppHost `Sdk="Aspire.AppHost.Sdk/13.0.0"`,
> `Enrich*DbContext` แก้ double-register, `WaitFor`/`WithLifetime(ContainerLifetime.Persistent)`/`WithHttpHealthCheck`
> — Aspire ปล่อยเวอร์ชันบ่อย ตรวจ version ล่าสุดด้วย `microsoft_docs_search` ก่อนสร้างโปรเจคจริง

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

ดูไฟล์เพิ่มเติมใน:
- `references/ef-core-patterns.md` - EF Core advanced patterns (PostgreSQL + SQL Server)
- `references/aspire-setup.md` - .NET Aspire configuration
- `references/testing-patterns.md` - Testing strategies
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
