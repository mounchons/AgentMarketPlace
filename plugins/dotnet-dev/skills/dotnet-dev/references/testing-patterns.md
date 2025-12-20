# Testing Patterns for .NET Core

## 1. Project Structure

```
tests/
├── Domain.UnitTests/
│   ├── Entities/
│   └── ValueObjects/
├── Application.UnitTests/
│   ├── Features/
│   └── Common/
├── Infrastructure.IntegrationTests/
│   ├── Repositories/
│   └── Services/
├── Api.IntegrationTests/
│   ├── Controllers/
│   └── Endpoints/
└── Common/
    ├── Fixtures/
    ├── Builders/
    └── Fakes/
```

---

## 2. Essential Packages

```xml
<ItemGroup>
  <!-- Test Framework -->
  <PackageReference Include="xunit" Version="2.*" />
  <PackageReference Include="xunit.runner.visualstudio" Version="2.*" />
  
  <!-- Assertions -->
  <PackageReference Include="FluentAssertions" Version="6.*" />
  
  <!-- Mocking -->
  <PackageReference Include="NSubstitute" Version="5.*" />
  <PackageReference Include="NSubstitute.Analyzers.CSharp" Version="1.*" />
  
  <!-- Test Data -->
  <PackageReference Include="Bogus" Version="35.*" />
  <PackageReference Include="AutoFixture" Version="4.*" />
  <PackageReference Include="AutoFixture.Xunit2" Version="4.*" />
  
  <!-- Integration Tests -->
  <PackageReference Include="Microsoft.AspNetCore.Mvc.Testing" Version="8.*" />
  <PackageReference Include="Testcontainers" Version="3.*" />
  <PackageReference Include="Testcontainers.PostgreSql" Version="3.*" />
  <PackageReference Include="Respawn" Version="6.*" />
</ItemGroup>
```

---

## 3. Unit Testing Patterns

### Domain Entity Tests
```csharp
public class OrderTests
{
    [Fact]
    public void Create_WithValidCustomer_ReturnsOrder()
    {
        // Arrange
        var customer = CustomerBuilder.CreateValid();

        // Act
        var order = Order.Create(customer);

        // Assert
        order.Should().NotBeNull();
        order.CustomerId.Should().Be(customer.Id);
        order.Status.Should().Be(OrderStatus.Pending);
        order.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<OrderCreatedEvent>();
    }

    [Fact]
    public void AddItem_WhenOrderIsPending_AddsItem()
    {
        // Arrange
        var order = OrderBuilder.CreatePending();
        var product = ProductBuilder.CreateValid();

        // Act
        order.AddItem(product.Id, quantity: 2, price: 100m);

        // Assert
        order.Items.Should().HaveCount(1);
        order.Items.First().Quantity.Should().Be(2);
        order.TotalAmount.Should().Be(200m);
    }

    [Fact]
    public void AddItem_WhenOrderIsCompleted_ThrowsException()
    {
        // Arrange
        var order = OrderBuilder.CreateCompleted();

        // Act
        var act = () => order.AddItem(1, 1, 100m);

        // Assert
        act.Should().Throw<DomainException>()
            .WithMessage("Cannot modify completed order");
    }
}
```

### Handler Tests with NSubstitute
```csharp
public class CreateOrderHandlerTests
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateOrderHandler> _logger;
    private readonly CreateOrderHandler _handler;

    public CreateOrderHandlerTests()
    {
        _unitOfWork = Substitute.For<IUnitOfWork>();
        _logger = Substitute.For<ILogger<CreateOrderHandler>>();
        _handler = new CreateOrderHandler(_unitOfWork, _logger);
    }

    [Fact]
    public async Task Handle_WithValidCommand_CreatesOrder()
    {
        // Arrange
        var customer = CustomerBuilder.CreateValid();
        var command = new CreateOrderCommand(
            CustomerId: customer.Id,
            Items: new List<OrderItemDto>
            {
                new(ProductId: 1, Quantity: 2, Price: 50m)
            });

        _unitOfWork.Customers
            .GetByIdAsync(customer.Id, Arg.Any<CancellationToken>())
            .Returns(customer);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        await _unitOfWork.Orders.Received(1)
            .AddAsync(Arg.Any<Order>(), Arg.Any<CancellationToken>());
        await _unitOfWork.Received(1)
            .SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenCustomerNotFound_ReturnsFailure()
    {
        // Arrange
        var command = new CreateOrderCommand(
            CustomerId: 999,
            Items: new List<OrderItemDto>());

        _unitOfWork.Customers
            .GetByIdAsync(999, Arg.Any<CancellationToken>())
            .Returns((Customer?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be("Customer not found");
        await _unitOfWork.Orders.DidNotReceive()
            .AddAsync(Arg.Any<Order>(), Arg.Any<CancellationToken>());
    }
}
```

### Validator Tests
```csharp
public class CreateOrderCommandValidatorTests
{
    private readonly CreateOrderCommandValidator _validator;

    public CreateOrderCommandValidatorTests()
    {
        _validator = new CreateOrderCommandValidator();
    }

    [Fact]
    public void Validate_WithValidCommand_ReturnsValid()
    {
        // Arrange
        var command = new CreateOrderCommand(
            CustomerId: 1,
            Items: new List<OrderItemDto>
            {
                new(ProductId: 1, Quantity: 1, Price: 10m)
            });

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Validate_WithInvalidCustomerId_ReturnsError(long customerId)
    {
        // Arrange
        var command = new CreateOrderCommand(
            CustomerId: customerId,
            Items: new List<OrderItemDto> { new(1, 1, 10m) });

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => 
            e.PropertyName == nameof(CreateOrderCommand.CustomerId));
    }

    [Fact]
    public void Validate_WithEmptyItems_ReturnsError()
    {
        // Arrange
        var command = new CreateOrderCommand(
            CustomerId: 1,
            Items: new List<OrderItemDto>());

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => 
            e.PropertyName == nameof(CreateOrderCommand.Items));
    }
}
```

---

## 4. Integration Testing with Testcontainers

### Database Fixture
```csharp
public class DatabaseFixture : IAsyncLifetime
{
    private PostgreSqlContainer _postgres = null!;
    public string ConnectionString { get; private set; } = null!;

    public async Task InitializeAsync()
    {
        _postgres = new PostgreSqlBuilder()
            .WithImage("postgres:16-alpine")
            .WithDatabase("testdb")
            .WithUsername("test")
            .WithPassword("test")
            .Build();

        await _postgres.StartAsync();
        
        ConnectionString = _postgres.GetConnectionString();

        // Apply migrations
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseNpgsql(ConnectionString)
            .Options;

        await using var context = new ApplicationDbContext(options);
        await context.Database.MigrateAsync();
    }

    public async Task DisposeAsync()
    {
        await _postgres.DisposeAsync();
    }
}

[CollectionDefinition("Database")]
public class DatabaseCollection : ICollectionFixture<DatabaseFixture>
{
}
```

### Repository Integration Tests
```csharp
[Collection("Database")]
public class CustomerRepositoryTests : IAsyncLifetime
{
    private readonly DatabaseFixture _fixture;
    private ApplicationDbContext _context = null!;
    private CustomerRepository _repository = null!;
    private Respawner _respawner = null!;

    public CustomerRepositoryTests(DatabaseFixture fixture)
    {
        _fixture = fixture;
    }

    public async Task InitializeAsync()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseNpgsql(_fixture.ConnectionString)
            .Options;

        _context = new ApplicationDbContext(options);
        _repository = new CustomerRepository(_context);

        // Setup Respawn for data cleanup
        await using var conn = new NpgsqlConnection(_fixture.ConnectionString);
        await conn.OpenAsync();
        
        _respawner = await Respawner.CreateAsync(conn, new RespawnerOptions
        {
            DbAdapter = DbAdapter.Postgres,
            SchemasToInclude = new[] { "public" }
        });
    }

    public async Task DisposeAsync()
    {
        await using var conn = new NpgsqlConnection(_fixture.ConnectionString);
        await conn.OpenAsync();
        await _respawner.ResetAsync(conn);
        await _context.DisposeAsync();
    }

    [Fact]
    public async Task GetByIdAsync_WhenExists_ReturnsCustomer()
    {
        // Arrange
        var customer = CustomerBuilder.CreateValid();
        await _context.Customers.AddAsync(customer);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetByIdAsync(customer.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Name.Should().Be(customer.Name);
        result.Email.Should().Be(customer.Email);
    }

    [Fact]
    public async Task GetByIdAsync_WhenDeleted_ReturnsNull()
    {
        // Arrange
        var customer = CustomerBuilder.CreateValid();
        customer.IsDeleted = true;
        await _context.Customers.AddAsync(customer);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetByIdAsync(customer.Id);

        // Assert
        result.Should().BeNull();
    }
}
```

---

## 5. API Integration Tests

### WebApplicationFactory Setup
```csharp
public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private PostgreSqlContainer _postgres = null!;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        _postgres = new PostgreSqlBuilder()
            .WithImage("postgres:16-alpine")
            .Build();
        
        _postgres.StartAsync().GetAwaiter().GetResult();

        builder.ConfigureServices(services =>
        {
            // Remove existing DbContext
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
            
            if (descriptor != null)
                services.Remove(descriptor);

            // Add test database
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(_postgres.GetConnectionString()));

            // Replace other services
            services.RemoveAll<IEmailService>();
            services.AddSingleton<IEmailService, FakeEmailService>();

            // Ensure database is created
            var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            db.Database.Migrate();
        });
    }

    protected override void Dispose(bool disposing)
    {
        _postgres.DisposeAsync().GetAwaiter().GetResult();
        base.Dispose(disposing);
    }
}
```

### API Tests
```csharp
public class OrdersControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly CustomWebApplicationFactory _factory;

    public OrdersControllerTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateOrder_WithValidData_Returns201()
    {
        // Arrange
        var customer = await SeedCustomerAsync();
        var request = new CreateOrderRequest
        {
            CustomerId = customer.Id,
            Items = new List<OrderItemDto>
            {
                new(ProductId: 1, Quantity: 2, Price: 50m)
            }
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/orders", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var orderId = await response.Content.ReadFromJsonAsync<long>();
        orderId.Should().BeGreaterThan(0);
        
        response.Headers.Location.Should().NotBeNull();
    }

    [Fact]
    public async Task GetOrder_WhenNotFound_Returns404()
    {
        // Act
        var response = await _client.GetAsync("/api/orders/99999");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    private async Task<Customer> SeedCustomerAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        
        var customer = CustomerBuilder.CreateValid();
        context.Customers.Add(customer);
        await context.SaveChangesAsync();
        
        return customer;
    }
}
```

---

## 6. Test Builders

```csharp
public class CustomerBuilder
{
    private static readonly Faker _faker = new("th");
    
    private long _id = 0;
    private string _name = _faker.Name.FullName();
    private string _email = _faker.Internet.Email();
    private bool _isActive = true;
    private bool _isDeleted = false;

    public static Customer CreateValid() => new CustomerBuilder().Build();
    
    public static CustomerBuilder Default() => new();

    public CustomerBuilder WithId(long id)
    {
        _id = id;
        return this;
    }

    public CustomerBuilder WithName(string name)
    {
        _name = name;
        return this;
    }

    public CustomerBuilder WithEmail(string email)
    {
        _email = email;
        return this;
    }

    public CustomerBuilder AsInactive()
    {
        _isActive = false;
        return this;
    }

    public CustomerBuilder AsDeleted()
    {
        _isDeleted = true;
        return this;
    }

    public Customer Build()
    {
        return new Customer
        {
            Id = _id,
            Name = _name,
            Email = _email,
            IsActive = _isActive,
            IsDeleted = _isDeleted,
            CreatedAt = DateTime.UtcNow
        };
    }

    public static IEnumerable<Customer> CreateMany(int count)
    {
        return Enumerable.Range(0, count)
            .Select(_ => CreateValid());
    }
}

public class OrderBuilder
{
    private static readonly Faker _faker = new();
    
    private long _customerId = 1;
    private OrderStatus _status = OrderStatus.Pending;
    private List<OrderItem> _items = new();

    public static Order CreatePending() => new OrderBuilder().Build();
    
    public static Order CreateCompleted() => 
        new OrderBuilder().WithStatus(OrderStatus.Completed).Build();

    public OrderBuilder WithCustomerId(long customerId)
    {
        _customerId = customerId;
        return this;
    }

    public OrderBuilder WithStatus(OrderStatus status)
    {
        _status = status;
        return this;
    }

    public OrderBuilder WithItems(params OrderItem[] items)
    {
        _items = items.ToList();
        return this;
    }

    public Order Build()
    {
        var order = new Order
        {
            CustomerId = _customerId,
            Status = _status,
            CreatedAt = DateTime.UtcNow
        };

        foreach (var item in _items)
        {
            order.Items.Add(item);
        }

        return order;
    }
}
```

---

## 7. AutoFixture Integration

```csharp
public class AutoNSubstituteDataAttribute : AutoDataAttribute
{
    public AutoNSubstituteDataAttribute()
        : base(() => new Fixture().Customize(new AutoNSubstituteCustomization()))
    {
    }
}

public class DomainCustomization : ICustomization
{
    public void Customize(IFixture fixture)
    {
        fixture.Customize<Customer>(c => c
            .With(x => x.Email, () => new Faker().Internet.Email())
            .With(x => x.IsDeleted, false)
            .Without(x => x.Orders));
            
        fixture.Customize<Order>(c => c
            .With(x => x.Status, OrderStatus.Pending)
            .Without(x => x.Customer)
            .Without(x => x.Items));
    }
}

// Usage
public class CustomerServiceTests
{
    [Theory]
    [AutoNSubstituteData]
    public async Task GetCustomer_ReturnsCustomer(
        [Frozen] IUnitOfWork unitOfWork,
        CustomerService sut,
        Customer customer)
    {
        // Arrange
        unitOfWork.Customers
            .GetByIdAsync(customer.Id, Arg.Any<CancellationToken>())
            .Returns(customer);

        // Act
        var result = await sut.GetByIdAsync(customer.Id);

        // Assert
        result.Should().BeEquivalentTo(customer);
    }
}
```
