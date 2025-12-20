---
name: dotnet-dev
description: |
  Expert .NET Core development skill for ASP.NET Core MVC, Entity Framework Core, Clean Architecture, 
  Repository/Unit of Work patterns, and .NET Aspire. Use when: creating .NET projects, writing C# code, 
  designing Entity Framework models, implementing APIs, setting up dependency injection, database migrations,
  or any .NET Core development task. Triggers: ".NET", "C#", "Entity Framework", "ASP.NET", "EF Core", 
  "migration", "repository pattern", "unit of work", "Clean Architecture", "Aspire", "Web API", "MVC",
  "dependency injection", "DbContext", "LINQ", "Blazor"
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
- PostgreSQL เป็น Primary Database
- Redis สำหรับ Caching
- ASP.NET Core MVC / Web API / Minimal APIs

---

## 📚 เมื่อต้องการข้อมูลล่าสุดจาก Microsoft Learn

ใช้ MCP Server `microsoft-learn` เพื่อค้นหา documentation ล่าสุด:

```bash
# ค้นหา documentation
npx mcporter call --stdio "streamable-http https://learn.microsoft.com/api/mcp" \
  search query:"Entity Framework Core migrations"

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

public interface IRepository<T, TKey> : IRepository<T> where T : BaseEntity<TKey>
{
    Task<T?> GetByIdAsync(TKey id, CancellationToken ct = default);
}
```

### 3. Unit of Work
```csharp
public interface IUnitOfWork : IDisposable
{
    // Repositories
    IRepository<Customer> Customers { get; }
    IRepository<Order> Orders { get; }
    // Add more as needed...
    
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

### 5. DbContext with Audit Trail
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

### 6. Entity Configuration
```csharp
public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable("Customers");
        
        builder.HasKey(c => c.Id);
        
        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(200);
            
        builder.Property(c => c.Email)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.HasIndex(c => c.Email)
            .IsUnique();
            
        // Relationships
        builder.HasMany(c => c.Orders)
            .WithOne(o => o.Customer)
            .HasForeignKey(o => o.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
```

### 7. CQRS Command Example
```csharp
// Command
public record CreateOrderCommand(
    long CustomerId,
    List<OrderItemDto> Items
) : IRequest<Result<long>>;

// Handler
public class CreateOrderHandler : IRequestHandler<CreateOrderCommand, Result<long>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateOrderHandler> _logger;

    public CreateOrderHandler(IUnitOfWork unitOfWork, ILogger<CreateOrderHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<long>> Handle(
        CreateOrderCommand request, 
        CancellationToken ct)
    {
        try
        {
            await _unitOfWork.BeginTransactionAsync(ct);
            
            var customer = await _unitOfWork.Customers
                .GetByIdAsync(request.CustomerId, ct);
                
            if (customer is null)
                return Result<long>.Failure("Customer not found");

            var order = Order.Create(customer);
            
            foreach (var item in request.Items)
            {
                order.AddItem(item.ProductId, item.Quantity, item.Price);
            }

            await _unitOfWork.Orders.AddAsync(order, ct);
            await _unitOfWork.SaveChangesAsync(ct);
            await _unitOfWork.CommitAsync(ct);

            _logger.LogInformation("Order {OrderId} created for customer {CustomerId}", 
                order.Id, request.CustomerId);
                
            return Result<long>.Success(order.Id);
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackAsync(ct);
            _logger.LogError(ex, "Failed to create order");
            return Result<long>.Failure(ex.Message);
        }
    }
}
```

### 8. Controller Pattern
```csharp
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public OrdersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Create a new order
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(long), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create(
        [FromBody] CreateOrderCommand command,
        CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        
        if (!result.IsSuccess)
            return BadRequest(new ProblemDetails 
            { 
                Title = "Failed to create order",
                Detail = result.Error 
            });
            
        return CreatedAtAction(
            nameof(GetById), 
            new { id = result.Value }, 
            result.Value);
    }

    [HttpGet("{id:long}")]
    [ProducesResponseType(typeof(OrderDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(long id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetOrderByIdQuery(id), ct);
        
        if (result is null)
            return NotFound();
            
        return Ok(result);
    }
}
```

### 9. Dependency Injection Setup
```csharp
// Infrastructure/DependencyInjection.cs
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Database
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

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

// Application/DependencyInjection.cs
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg => 
            cfg.RegisterServicesFromAssembly(typeof(DependencyInjection).Assembly));
        
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
        
        services.AddAutoMapper(typeof(DependencyInjection).Assembly);

        // Pipeline behaviors
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));

        return services;
    }
}
```

### 10. .NET Aspire AppHost
```csharp
// AppHost/Program.cs
var builder = DistributedApplication.CreateBuilder(args);

// Infrastructure
var postgres = builder.AddPostgres("postgres")
    .WithPgAdmin()
    .AddDatabase("appdb");

var redis = builder.AddRedis("redis")
    .WithRedisCommander();

var rabbitmq = builder.AddRabbitMQ("rabbitmq")
    .WithManagementPlugin();

// API Project
var api = builder.AddProject<Projects.WebApi>("api")
    .WithReference(postgres)
    .WithReference(redis)
    .WithReference(rabbitmq)
    .WithExternalHttpEndpoints();

// Web Frontend (if Blazor)
builder.AddProject<Projects.Web>("web")
    .WithReference(api)
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

### NuGet Packages (Essential)
```xml
<!-- Domain/Application -->
<PackageReference Include="MediatR" Version="12.*" />
<PackageReference Include="FluentValidation" Version="11.*" />
<PackageReference Include="AutoMapper" Version="13.*" />

<!-- Infrastructure -->
<PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.*" />
<PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="8.*" />
<PackageReference Include="Microsoft.Extensions.Caching.StackExchangeRedis" Version="8.*" />

<!-- WebApi -->
<PackageReference Include="Swashbuckle.AspNetCore" Version="6.*" />
<PackageReference Include="Serilog.AspNetCore" Version="8.*" />

<!-- Aspire -->
<PackageReference Include="Aspire.Hosting.AppHost" Version="8.*" />
<PackageReference Include="Aspire.Npgsql.EntityFrameworkCore.PostgreSQL" Version="8.*" />
<PackageReference Include="Aspire.StackExchange.Redis" Version="8.*" />
```

---

## 📖 Reference Files

ดูไฟล์เพิ่มเติมใน:
- `references/ef-core-patterns.md` - EF Core advanced patterns
- `references/aspire-setup.md` - .NET Aspire configuration
- `references/testing-patterns.md` - Testing strategies
- `templates/` - Ready-to-use code templates

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
