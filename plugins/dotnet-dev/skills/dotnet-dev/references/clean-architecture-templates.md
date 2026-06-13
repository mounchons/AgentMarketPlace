# Clean Architecture Code Templates (dotnet-dev)

> โค้ด template เต็มสำหรับ Clean Architecture + Repository/Unit of Work + EF Core 10 + dual-DB (PostgreSQL + SQL Server). แยกจาก SKILL.md เพื่อ progressive disclosure — โหลดเฉพาะตอนต้องการ scaffold โปรเจคจริง.
> ทุก pattern ตรวจกับ Microsoft Learn (.NET 10 / EF Core 10 / Aspire 13). ดู `ef-core-patterns.md` สำหรับ query/EF10 patterns, `aspire-setup.md` สำหรับ AppHost.

---

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
