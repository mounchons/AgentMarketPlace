---
name: dotnet-dev
description: |
  Expert .NET Core development skill for ASP.NET Core MVC, Entity Framework Core, Clean Architecture, 
  Repository/Unit of Work patterns, and .NET Aspire. Supports both PostgreSQL and SQL Server.
  Use when: creating .NET projects, writing C# code, designing Entity Framework models, implementing APIs, 
  setting up dependency injection, database migrations, or any .NET Core development task. 
  Triggers: ".NET", "C#", "Entity Framework", "ASP.NET", "EF Core", "migration", "repository pattern", 
  "unit of work", "Clean Architecture", "Aspire", "Web API", "MVC", "dependency injection", "DbContext", 
  "LINQ", "Blazor", "SQL Server", "PostgreSQL"
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
- .NET 8+ (Latest LTS)
- Entity Framework Core (Code First)
- **PostgreSQL** หรือ **SQL Server** เป็น Primary Database
- Redis สำหรับ Caching
- ASP.NET Core MVC / Web API / Minimal APIs

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

## 📚 เมื่อต้องการข้อมูลล่าสุดจาก Microsoft Learn

ใช้ MCP Server `microsoft-learn` เพื่อค้นหา documentation ล่าสุด:

```bash
# ค้นหา documentation
npx mcporter call --stdio "streamable-http https://learn.microsoft.com/api/mcp" \
  search query:"Entity Framework Core SQL Server"

# หรือใช้ผ่าน mcp tool โดยตรงถ้า configure ไว้แล้ว
# mcp__microsoft-learn__search query:"ASP.NET Core authentication"
```

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
public abstract class BaseEntity
{
    public long Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; } = false;
}

public abstract class BaseEntity<TKey> : BaseEntity
{
    public new TKey Id { get; set; } = default!;
}
```

### 2. Repository Interface
```csharp
public interface IRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(long id, CancellationToken ct = default);
    Task<IEnumerable<T>> GetAllAsync(CancellationToken ct = default);
    Task<T> AddAsync(T entity, CancellationToken ct = default);
    void Update(T entity);
    void Delete(T entity);
    Task<bool> ExistsAsync(long id, CancellationToken ct = default);
    IQueryable<T> Query();
}
```

### 3. Unit of Work
```csharp
public interface IUnitOfWork : IDisposable
{
    // Repositories
    IRepository<Customer> Customers { get; }
    IRepository<Order> Orders { get; }
    
    // Transaction management
    Task<int> SaveChangesAsync(CancellationToken ct = default);
    Task BeginTransactionAsync(CancellationToken ct = default);
    Task CommitAsync(CancellationToken ct = default);
    Task RollbackAsync(CancellationToken ct = default);
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

    public virtual async Task<T?> GetByIdAsync(long id, CancellationToken ct = default)
        => await _dbSet.FirstOrDefaultAsync(e => e.Id == id && !e.IsDeleted, ct);

    public virtual async Task<IEnumerable<T>> GetAllAsync(CancellationToken ct = default)
        => await _dbSet.Where(e => !e.IsDeleted).ToListAsync(ct);

    public virtual async Task<T> AddAsync(T entity, CancellationToken ct = default)
    {
        await _dbSet.AddAsync(entity, ct);
        return entity;
    }

    public virtual void Update(T entity)
    {
        entity.UpdatedAt = DateTime.UtcNow;
        _dbSet.Update(entity);
    }

    public virtual void Delete(T entity)
    {
        entity.IsDeleted = true;
        entity.UpdatedAt = DateTime.UtcNow;
        Update(entity);
    }

    public virtual async Task<bool> ExistsAsync(long id, CancellationToken ct = default)
        => await _dbSet.AnyAsync(e => e.Id == id && !e.IsDeleted, ct);

    public virtual IQueryable<T> Query()
        => _dbSet.Where(e => !e.IsDeleted).AsQueryable();
}
```

### 5. DbContext - Multi-Database Support
```csharp
public class ApplicationDbContext : DbContext
{
    private readonly ICurrentUserService _currentUser;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        ICurrentUserService currentUser) : base(options)
    {
        _currentUser = currentUser;
    }

    // DbSets
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Order> Orders => Set<Order>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Apply all configurations from assembly
        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(ApplicationDbContext).Assembly);
        
        // Global query filter for soft delete
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

    public override async Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    entry.Entity.CreatedBy = _currentUser.UserId;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    entry.Entity.UpdatedBy = _currentUser.UserId;
                    break;
            }
        }
        return await base.SaveChangesAsync(ct);
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
        
        services.AddDbContext<ApplicationDbContext>(options =>
        {
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

        // Caching
        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = configuration.GetConnectionString("Redis");
            options.InstanceName = "App_";
        });

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
        .WithPgAdmin()
        .AddDatabase("appdb");
    database = postgres;
}
else
{
    var sqlserver = builder.AddSqlServer("sqlserver")
        .AddDatabase("appdb");
    database = sqlserver;
}

var redis = builder.AddRedis("redis")
    .WithRedisCommander();

// API Project
var api = builder.AddProject<Projects.WebApi>("api")
    .WithReference(database)
    .WithReference(redis)
    .WithExternalHttpEndpoints();

builder.Build().Run();
```

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

#### Common Packages
```xml
<!-- Domain/Application -->
<PackageReference Include="MediatR" Version="12.*" />
<PackageReference Include="FluentValidation" Version="11.*" />
<PackageReference Include="AutoMapper" Version="13.*" />

<!-- Infrastructure - Core -->
<PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.*" />
<PackageReference Include="Microsoft.Extensions.Caching.StackExchangeRedis" Version="8.*" />

<!-- WebApi -->
<PackageReference Include="Swashbuckle.AspNetCore" Version="6.*" />
<PackageReference Include="Serilog.AspNetCore" Version="8.*" />
```

#### PostgreSQL Packages
```xml
<PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="8.*" />

<!-- Aspire -->
<PackageReference Include="Aspire.Npgsql.EntityFrameworkCore.PostgreSQL" Version="8.*" />
```

#### SQL Server Packages
```xml
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.*" />

<!-- Aspire -->
<PackageReference Include="Aspire.Microsoft.EntityFrameworkCore.SqlServer" Version="8.*" />
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
5. **Handle exceptions** - Global exception handler + Result pattern
6. **Write tests** - Unit tests for business logic, Integration tests for APIs
7. **Use DTOs** - ไม่ expose Entities ตรงๆ
8. **Soft delete** - ใช้ IsDeleted flag แทน hard delete
9. **Audit trail** - CreatedAt, UpdatedAt, CreatedBy, UpdatedBy
10. **Use transactions** - สำหรับ operations ที่ต้อง atomic
11. **Enable retry on failure** - สำหรับ database connections
12. **Use connection resiliency** - ทั้ง PostgreSQL และ SQL Server
