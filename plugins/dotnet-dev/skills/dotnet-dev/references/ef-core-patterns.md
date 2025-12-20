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
    options.UseNpgsql(connectionString)
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

public class CustomerWithOrdersSpecification : Specification<Customer>
{
    private readonly int _minOrders;
    
    public CustomerWithOrdersSpecification(int minOrders)
    {
        _minOrders = minOrders;
    }
    
    public override Expression<Func<Customer, bool>> ToExpression()
        => customer => customer.Orders.Count >= _minOrders;
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
    
    // Or use RowVersion
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

public class Address
{
    public string Street { get; private set; } = null!;
    public string City { get; private set; } = null!;
    public string PostalCode { get; private set; } = null!;
    public string Country { get; private set; } = null!;
    
    private Address() { }
    
    public Address(string street, string city, string postalCode, string country)
    {
        Street = street;
        City = city;
        PostalCode = postalCode;
        Country = country;
    }
}

// Entity with Value Objects
public class Order : BaseEntity
{
    public Money TotalAmount { get; private set; } = null!;
    public Address ShippingAddress { get; private set; } = null!;
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
        
        builder.OwnsOne(o => o.ShippingAddress, address =>
        {
            address.Property(a => a.Street)
                .HasColumnName("ShippingStreet")
                .HasMaxLength(200);
            address.Property(a => a.City)
                .HasColumnName("ShippingCity")
                .HasMaxLength(100);
            address.Property(a => a.PostalCode)
                .HasColumnName("ShippingPostalCode")
                .HasMaxLength(20);
            address.Property(a => a.Country)
                .HasColumnName("ShippingCountry")
                .HasMaxLength(100);
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

public class Order : AggregateRoot
{
    public static Order Create(Customer customer)
    {
        var order = new Order
        {
            CustomerId = customer.Id,
            Status = OrderStatus.Pending
        };
        
        order.AddDomainEvent(new OrderCreatedEvent(order.Id, customer.Id));
        
        return order;
    }
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
    
    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        UpdateEntities(eventData.Context);
        return base.SavingChanges(eventData, result);
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
    options.UseNpgsql(connectionString)
           .AddInterceptors(sp.GetRequiredService<AuditableEntityInterceptor>());
});
```

---

## 8. Raw SQL & Stored Procedures

```csharp
// Raw SQL query
var products = await _context.Products
    .FromSqlRaw("SELECT * FROM Products WHERE Price > {0}", minPrice)
    .ToListAsync();

// Interpolated (safe from SQL injection)
var products = await _context.Products
    .FromSqlInterpolated($"SELECT * FROM Products WHERE CategoryId = {categoryId}")
    .ToListAsync();

// Stored Procedure
var result = await _context.Database
    .ExecuteSqlRawAsync("CALL ProcessOrders({0})", batchSize);

// Stored Procedure with output
var outputParam = new NpgsqlParameter("@TotalProcessed", NpgsqlDbType.Integer)
{
    Direction = ParameterDirection.Output
};

await _context.Database.ExecuteSqlRawAsync(
    "CALL ProcessOrders(@BatchSize, @TotalProcessed)",
    new NpgsqlParameter("@BatchSize", batchSize),
    outputParam);
    
var totalProcessed = (int)outputParam.Value;
```

---

## 9. Compiled Queries

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

## 10. PostgreSQL Specific Features

```csharp
// Full-text search
var products = await _context.Products
    .Where(p => EF.Functions.ToTsVector("english", p.Name + " " + p.Description)
        .Matches(EF.Functions.PlainToTsQuery("english", searchTerm)))
    .ToListAsync();

// JSONB column
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

// Array columns
public class Tag
{
    public string[] Values { get; set; } = Array.Empty<string>();
}

var items = await _context.Items
    .Where(i => i.Tags.Contains("featured"))
    .ToListAsync();
```
