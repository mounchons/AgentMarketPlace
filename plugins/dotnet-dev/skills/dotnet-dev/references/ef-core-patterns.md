# Entity Framework Core Patterns & Best Practices

## 1. Query Optimization

### Eager Loading vs Lazy Loading
```csharp
// ✅ Eager loading - explicit includes
var orders = await _context.Orders
    .Include(o => o.Customer)
    .Include(o => o.Items)
        .ThenInclude(i => i.Product)
    .Where(o => o.Status == OrderStatus.Pending)
    .ToListAsync();

// ✅ Projection - only load what you need
var orderDtos = await _context.Orders
    .Where(o => o.Status == OrderStatus.Pending)
    .Select(o => new OrderDto
    {
        Id = o.Id,
        CustomerName = o.Customer.Name,
        TotalAmount = o.Items.Sum(i => i.Quantity * i.Price),
        ItemCount = o.Items.Count
    })
    .ToListAsync();

// ❌ Avoid N+1 problem
foreach (var order in orders)
{
    // This causes N+1 queries!
    var items = order.Items.ToList();
}
```

### Split Queries for Large Includes
```csharp
var orders = await _context.Orders
    .Include(o => o.Items)
    .Include(o => o.Payments)
    .AsSplitQuery()  // Splits into multiple queries
    .ToListAsync();
```

### No-Tracking Queries
```csharp
// For read-only scenarios
var products = await _context.Products
    .AsNoTracking()
    .Where(p => p.IsActive)
    .ToListAsync();

// Set globally for read-heavy contexts
services.AddDbContext<ReadOnlyDbContext>(options =>
    options.UseNpgsql(connectionString) // or UseSqlServer
           .UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking));
```

---

## 2. Specification Pattern

```csharp
// Base Specification
public abstract class Specification<T> where T : class
{
    public abstract Expression<Func<T, bool>> ToExpression();
    
    public bool IsSatisfiedBy(T entity)
    {
        var predicate = ToExpression().Compile();
        return predicate(entity);
    }
    
    public Specification<T> And(Specification<T> other)
        => new AndSpecification<T>(this, other);
        
    public Specification<T> Or(Specification<T> other)
        => new OrSpecification<T>(this, other);
        
    public Specification<T> Not()
        => new NotSpecification<T>(this);
}

// Example Specification
public class ActiveCustomerSpecification : Specification<Customer>
{
    public override Expression<Func<Customer, bool>> ToExpression()
        => customer => customer.IsActive && !customer.IsDeleted;
}

// Usage
var spec = new ActiveCustomerSpecification()
    .And(new CustomerWithOrdersSpecification(5));
    
var customers = await _context.Customers
    .Where(spec.ToExpression())
    .ToListAsync();
```

---

## 3. Bulk Operations

```csharp
// Using EF Core 7+ ExecuteUpdate/ExecuteDelete
await _context.Products
    .Where(p => p.CategoryId == categoryId)
    .ExecuteUpdateAsync(s => s
        .SetProperty(p => p.IsActive, false)
        .SetProperty(p => p.UpdatedAt, DateTime.UtcNow));

await _context.AuditLogs
    .Where(l => l.CreatedAt < DateTime.UtcNow.AddYears(-1))
    .ExecuteDeleteAsync();

// Bulk insert with EFCore.BulkExtensions
await _context.BulkInsertAsync(products);
await _context.BulkUpdateAsync(products);
await _context.BulkDeleteAsync(products);
```

---

## 4. Concurrency Handling

```csharp
public class Product : BaseEntity
{
    public string Name { get; set; } = null!;
    public decimal Price { get; set; }
    
    [ConcurrencyCheck]
    public int Version { get; set; }
    
    // Or use RowVersion (SQL Server preferred)
    [Timestamp]
    public byte[] RowVersion { get; set; } = null!;
}

// Handle concurrency in service
public async Task<Result> UpdateProductAsync(UpdateProductCommand command)
{
    var product = await _context.Products.FindAsync(command.Id);
    
    if (product is null)
        return Result.Failure("Product not found");
    
    product.Name = command.Name;
    product.Price = command.Price;
    
    try
    {
        await _context.SaveChangesAsync();
        return Result.Success();
    }
    catch (DbUpdateConcurrencyException)
    {
        return Result.Failure("Product was modified by another user");
    }
}
```

---

## 5. Value Objects

```csharp
// Value Object
public class Money
{
    public decimal Amount { get; private set; }
    public string Currency { get; private set; }
    
    private Money() { }
    
    public Money(decimal amount, string currency)
    {
        Amount = amount;
        Currency = currency;
    }
    
    public static Money Create(decimal amount, string currency = "THB")
        => new(amount, currency);
}

// Configuration
public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.OwnsOne(o => o.TotalAmount, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("TotalAmount")
                .HasPrecision(18, 2);
            money.Property(m => m.Currency)
                .HasColumnName("Currency")
                .HasMaxLength(3);
        });
    }
}
```

---

## 6. Domain Events

```csharp
// Domain Event
public abstract class DomainEvent
{
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}

public class OrderCreatedEvent : DomainEvent
{
    public long OrderId { get; }
    public long CustomerId { get; }
    
    public OrderCreatedEvent(long orderId, long customerId)
    {
        OrderId = orderId;
        CustomerId = customerId;
    }
}

// Entity with Domain Events
public abstract class AggregateRoot : BaseEntity
{
    private readonly List<DomainEvent> _domainEvents = new();
    
    public IReadOnlyCollection<DomainEvent> DomainEvents 
        => _domainEvents.AsReadOnly();
    
    protected void AddDomainEvent(DomainEvent domainEvent)
        => _domainEvents.Add(domainEvent);
    
    public void ClearDomainEvents()
        => _domainEvents.Clear();
}

// Dispatch events in SaveChanges
public override async Task<int> SaveChangesAsync(CancellationToken ct = default)
{
    var entities = ChangeTracker
        .Entries<AggregateRoot>()
        .Where(e => e.Entity.DomainEvents.Any())
        .ToList();
    
    var domainEvents = entities
        .SelectMany(e => e.Entity.DomainEvents)
        .ToList();
    
    entities.ForEach(e => e.Entity.ClearDomainEvents());
    
    var result = await base.SaveChangesAsync(ct);
    
    foreach (var domainEvent in domainEvents)
    {
        await _mediator.Publish(domainEvent, ct);
    }
    
    return result;
}
```

---

## 7. Interceptors

```csharp
// Audit Interceptor
public class AuditableEntityInterceptor : SaveChangesInterceptor
{
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeService _dateTime;
    
    public AuditableEntityInterceptor(
        ICurrentUserService currentUser,
        IDateTimeService dateTime)
    {
        _currentUser = currentUser;
        _dateTime = dateTime;
    }
    
    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken ct = default)
    {
        UpdateEntities(eventData.Context);
        return base.SavingChangesAsync(eventData, result, ct);
    }
    
    private void UpdateEntities(DbContext? context)
    {
        if (context is null) return;
        
        foreach (var entry in context.ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedBy = _currentUser.UserId;
                entry.Entity.CreatedAt = _dateTime.Now;
            }
            
            if (entry.State is EntityState.Added or EntityState.Modified)
            {
                entry.Entity.UpdatedBy = _currentUser.UserId;
                entry.Entity.UpdatedAt = _dateTime.Now;
            }
        }
    }
}

// Register interceptor
services.AddDbContext<ApplicationDbContext>((sp, options) =>
{
    options.UseSqlServer(connectionString) // or UseNpgsql
           .AddInterceptors(sp.GetRequiredService<AuditableEntityInterceptor>());
});
```

---

## 8. Compiled Queries

```csharp
public static class CompiledQueries
{
    public static readonly Func<ApplicationDbContext, long, Task<Customer?>> 
        GetCustomerById = EF.CompileAsyncQuery(
            (ApplicationDbContext context, long id) =>
                context.Customers
                    .Include(c => c.Orders)
                    .FirstOrDefault(c => c.Id == id));
    
    public static readonly Func<ApplicationDbContext, string, IAsyncEnumerable<Customer>>
        GetCustomersByEmail = EF.CompileAsyncQuery(
            (ApplicationDbContext context, string emailDomain) =>
                context.Customers
                    .Where(c => c.Email.EndsWith(emailDomain)));
}

// Usage
var customer = await CompiledQueries.GetCustomerById(_context, customerId);

await foreach (var customer in CompiledQueries.GetCustomersByEmail(_context, "@company.com"))
{
    // Process customer
}
```

---

## 9. PostgreSQL Specific Features

### Full-text Search
```csharp
var products = await _context.Products
    .Where(p => EF.Functions.ToTsVector("english", p.Name + " " + p.Description)
        .Matches(EF.Functions.PlainToTsQuery("english", searchTerm)))
    .ToListAsync();
```

### JSONB Column
```csharp
public class Product : BaseEntity
{
    public string Name { get; set; } = null!;
    public Dictionary<string, object> Metadata { get; set; } = new();
}

// Configuration
builder.Property(p => p.Metadata)
    .HasColumnType("jsonb");

// Query JSONB
var products = await _context.Products
    .Where(p => EF.Functions.JsonContains(
        p.Metadata, 
        JsonSerializer.Serialize(new { brand = "Nike" })))
    .ToListAsync();
```

### Array Columns
```csharp
public class Item : BaseEntity
{
    public string[] Tags { get; set; } = Array.Empty<string>();
}

var items = await _context.Items
    .Where(i => i.Tags.Contains("featured"))
    .ToListAsync();
```

### Configuration
```csharp
// Connection with retry
services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorCodesToAdd: null);
        npgsqlOptions.CommandTimeout(60);
    }));
```

---

## 10. SQL Server Specific Features

### Temporal Tables (System-Versioned)
```csharp
// Entity
public class Product : BaseEntity
{
    public string Name { get; set; } = null!;
    public decimal Price { get; set; }
}

// Configuration
public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products", b => b.IsTemporal(t =>
        {
            t.HasPeriodStart("ValidFrom");
            t.HasPeriodEnd("ValidTo");
            t.UseHistoryTable("ProductsHistory");
        }));
    }
}

// Query historical data
var productHistory = await _context.Products
    .TemporalAll()
    .Where(p => p.Id == productId)
    .OrderBy(p => EF.Property<DateTime>(p, "ValidFrom"))
    .Select(p => new
    {
        p.Id,
        p.Name,
        p.Price,
        ValidFrom = EF.Property<DateTime>(p, "ValidFrom"),
        ValidTo = EF.Property<DateTime>(p, "ValidTo")
    })
    .ToListAsync();

// Query at specific point in time
var productsAtDate = await _context.Products
    .TemporalAsOf(specificDateTime)
    .ToListAsync();

// Query between dates
var productChanges = await _context.Products
    .TemporalBetween(startDate, endDate)
    .ToListAsync();
```

### Row-Level Security (RLS)
```csharp
// Configure in SQL Server
// CREATE SECURITY POLICY TenantFilter
// ADD FILTER PREDICATE dbo.fn_TenantFilter(TenantId)
// ON dbo.Products WITH (STATE = ON);

// In EF Core - use global query filter
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Product>()
        .HasQueryFilter(p => p.TenantId == _currentTenant.TenantId);
}
```

### HierarchyId for Tree Structures
```csharp
public class Employee : BaseEntity
{
    public string Name { get; set; } = null!;
    public HierarchyId Path { get; set; } = null!;
}

// Configuration
builder.Property(e => e.Path)
    .HasColumnType("hierarchyid");

// Query descendants
var manager = await _context.Employees
    .FirstAsync(e => e.Id == managerId);

var directReports = await _context.Employees
    .Where(e => e.Path.GetAncestor(1) == manager.Path)
    .ToListAsync();
```

### Full-Text Search
```csharp
// Configuration in SQL Server
// CREATE FULLTEXT INDEX ON Products(Name, Description)

// Query
var products = await _context.Products
    .Where(p => EF.Functions.Contains(p.Name, searchTerm))
    .ToListAsync();

// FreeText search
var products = await _context.Products
    .Where(p => EF.Functions.FreeText(p.Description, searchTerm))
    .ToListAsync();
```

### Always Encrypted
```csharp
// Connection string
"Server=...;Database=...;Column Encryption Setting=Enabled;"

// Entity with encrypted column
public class Customer : BaseEntity
{
    public string Name { get; set; } = null!;
    
    // This column is encrypted in database
    public string SSN { get; set; } = null!;
}

// Configuration - no special EF config needed
// Encryption is handled by SQL Server driver
```

### Stored Procedures with Output
```csharp
// Stored Procedure
var outputParam = new SqlParameter("@TotalProcessed", SqlDbType.Int)
{
    Direction = ParameterDirection.Output
};

var returnValue = new SqlParameter("@ReturnValue", SqlDbType.Int)
{
    Direction = ParameterDirection.ReturnValue
};

await _context.Database.ExecuteSqlRawAsync(
    "EXEC @ReturnValue = ProcessOrders @BatchSize, @TotalProcessed OUT",
    returnValue,
    new SqlParameter("@BatchSize", batchSize),
    outputParam);
    
var totalProcessed = (int)outputParam.Value;
var result = (int)returnValue.Value;
```

### Connection Resiliency
```csharp
services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString, sqlOptions =>
    {
        sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorNumbersToAdd: new List<int> { 4060, 40197, 40501, 40613 });
        sqlOptions.CommandTimeout(60);
        sqlOptions.MinBatchSize(1);
        sqlOptions.MaxBatchSize(100);
    }));
```

### Memory-Optimized Tables
```csharp
// Configuration
public class SessionConfiguration : IEntityTypeConfiguration<Session>
{
    public void Configure(EntityTypeBuilder<Session> builder)
    {
        builder.ToTable("Sessions", t => t.IsMemoryOptimized());
    }
}
```

---

## 11. Database-Agnostic Patterns

### Conditional Configuration
```csharp
public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    private readonly string _databaseProvider;
    
    public ProductConfiguration(string databaseProvider)
    {
        _databaseProvider = databaseProvider;
    }
    
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products");
        builder.HasKey(p => p.Id);
        
        // Database-specific configurations
        if (_databaseProvider == "SqlServer")
        {
            builder.Property(p => p.Price)
                .HasColumnType("decimal(18,2)");
                
            // Temporal table
            builder.ToTable("Products", b => b.IsTemporal());
        }
        else if (_databaseProvider == "PostgreSQL")
        {
            builder.Property(p => p.Price)
                .HasPrecision(18, 2);
                
            // JSONB for metadata
            builder.Property(p => p.Metadata)
                .HasColumnType("jsonb");
        }
    }
}
```

### Apply Configurations
```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    var provider = Database.ProviderName switch
    {
        "Microsoft.EntityFrameworkCore.SqlServer" => "SqlServer",
        "Npgsql.EntityFrameworkCore.PostgreSQL" => "PostgreSQL",
        _ => "Unknown"
    };
    
    modelBuilder.ApplyConfiguration(new ProductConfiguration(provider));
}
```

---

## 12. Performance Tips

### For Both Databases
1. **Use indexes wisely** - Create composite indexes for frequently queried columns
2. **Avoid SELECT *** - Use projections
3. **Use pagination** - Don't load entire tables
4. **Batch operations** - Use ExecuteUpdate/ExecuteDelete for bulk ops
5. **Connection pooling** - Configure appropriate pool size

### SQL Server Specific
1. **Use NOLOCK hint carefully** - For read-heavy workloads
2. **Consider columnstore indexes** - For analytical queries
3. **Use Query Store** - For query performance insights
4. **Optimize TempDB** - For heavy temp table usage

### PostgreSQL Specific
1. **Use EXPLAIN ANALYZE** - To understand query plans
2. **Configure work_mem** - For complex sorts/joins
3. **Use partial indexes** - For filtered queries
4. **Consider partitioning** - For large tables
