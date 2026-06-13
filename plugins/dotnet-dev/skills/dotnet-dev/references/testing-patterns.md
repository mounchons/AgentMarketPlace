# Testing Patterns for .NET Core

> .NET 10 LTS · EF Core 10 · .NET Aspire 13 · xunit.v3 · Testcontainers 4.x · dual-DB (PostgreSQL + SQL Server)
> โครงสร้างตาม Clean Architecture + Repository/Unit of Work — แยก Unit / Integration / API tests ชัดเจน
> ทุก code ที่เป็น Microsoft API (`FakeTimeProvider`, `WebApplicationFactory`, `Aspire.Hosting.Testing`, EF Core 10) verify กับ MS Learn แล้ว (ดู "Verified versions" ท้ายไฟล์)

## 1. Project Structure

```
tests/
├── Domain.UnitTests/
│   ├── Entities/
│   └── ValueObjects/
├── Application.UnitTests/
│   ├── Features/
│   └── Common/
├── Infrastructure.IntegrationTests/      # dual-DB: Postgres + SQL Server fixtures
│   ├── Repositories/
│   └── Services/
├── Api.IntegrationTests/
│   ├── Controllers/
│   └── Endpoints/
├── AppHost.Tests/                        # Aspire DistributedApplicationTestingBuilder
└── Common/
    ├── Fixtures/                          # PostgreSqlFixture / MsSqlFixture
    ├── Builders/
    └── Fakes/
```

---

## 2. Essential Packages

> **สำคัญ (มิ.ย. 2026):** xunit ขยับเป็น **xunit.v3** — package และ namespace ใหม่ ไม่ใช่ `xunit` 2.x เดิม.
> เรื่อง license ของ FluentAssertions / MediatR / AutoMapper ดู §10.

```xml
<ItemGroup>
  <!-- Test Framework: xunit.v3 (ไม่ใช่ xunit 2.x) -->
  <PackageReference Include="xunit.v3" Version="2.*" />
  <PackageReference Include="xunit.runner.visualstudio" Version="3.*" />
  <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.*" />

  <!-- Assertions: AwesomeAssertions = fork ของ FluentAssertions 7 (ยังฟรี) หรือ Shouldly -->
  <PackageReference Include="AwesomeAssertions" Version="9.*" />
  <!-- ถ้าทีม pin FluentAssertions 6.x ไว้แล้ว ยังใช้ได้ฟรี (ดู §10) -->

  <!-- Mocking -->
  <PackageReference Include="NSubstitute" Version="5.*" />
  <PackageReference Include="NSubstitute.Analyzers.CSharp" Version="1.*" />

  <!-- Test Data -->
  <PackageReference Include="Bogus" Version="35.*" />

  <!-- Time control -->
  <PackageReference Include="Microsoft.Extensions.TimeProvider.Testing" Version="10.*" />

  <!-- Integration Tests -->
  <PackageReference Include="Microsoft.AspNetCore.Mvc.Testing" Version="10.*" />
  <PackageReference Include="Testcontainers" Version="4.*" />
  <PackageReference Include="Testcontainers.PostgreSql" Version="4.*" />
  <PackageReference Include="Testcontainers.MsSql" Version="4.*" />
  <PackageReference Include="Respawn" Version="6.*" />

  <!-- EF Core 10 providers -->
  <PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="10.*" />
  <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="10.*" />

  <!-- Aspire integration tests -->
  <PackageReference Include="Aspire.Hosting.Testing" Version="13.*" />
</ItemGroup>
```

> **xunit.v3 ที่ต้องรู้:**
> - namespace ยังเป็น `Xunit` (เหมือนเดิม) — `[Fact]`, `[Theory]`, `[InlineData]` ใช้งานเหมือนเดิม
> - `IAsyncLifetime.InitializeAsync` คืน **`ValueTask`** (เดิม v2 คืน `Task`) และ teardown ใช้ `IAsyncDisposable.DisposeAsync()` (เดิม v2 มี `DisposeAsync` ของตัวเอง) — ดู §4
> - `[Collection]` / `ICollectionFixture<T>` / `IClassFixture<T>` ใช้เหมือนเดิม
> - xunit.v3 build เป็น executable ในตัว และ integrate กับ Microsoft.Testing.Platform

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

> หมายเหตุ: `.Should()` syntax ข้างบนใช้ได้ทั้ง FluentAssertions (pin 6.x) และ AwesomeAssertions (fork ที่ API เหมือนกัน). ถ้าเลือก **Shouldly** จะเป็น `order.Status.ShouldBe(OrderStatus.Pending)` แทน — ดู §10.

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
            Items: [new(ProductId: 1, Quantity: 2, Price: 50m)]);

        _unitOfWork.Customers
            .GetByIdAsync(customer.Id, Arg.Any<CancellationToken>())
            .Returns(customer);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _unitOfWork.Orders.Received(1).Add(Arg.Any<Order>());
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenCustomerNotFound_ReturnsFailure()
    {
        // Arrange
        var command = new CreateOrderCommand(CustomerId: 999, Items: []);

        _unitOfWork.Customers
            .GetByIdAsync(999, Arg.Any<CancellationToken>())
            .Returns((Customer?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be("Customer not found");
        _unitOfWork.Orders.DidNotReceive().Add(Arg.Any<Order>());
    }
}
```

### Validator Tests
```csharp
public class CreateOrderCommandValidatorTests
{
    private readonly CreateOrderCommandValidator _validator = new();

    [Fact]
    public void Validate_WithValidCommand_ReturnsValid()
    {
        var command = new CreateOrderCommand(
            CustomerId: 1,
            Items: [new(ProductId: 1, Quantity: 1, Price: 10m)]);

        var result = _validator.Validate(command);

        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Validate_WithInvalidCustomerId_ReturnsError(long customerId)
    {
        var command = new CreateOrderCommand(
            CustomerId: customerId,
            Items: [new(1, 1, 10m)]);

        var result = _validator.Validate(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e =>
            e.PropertyName == nameof(CreateOrderCommand.CustomerId));
    }

    [Fact]
    public void Validate_WithEmptyItems_ReturnsError()
    {
        var command = new CreateOrderCommand(CustomerId: 1, Items: []);

        var result = _validator.Validate(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e =>
            e.PropertyName == nameof(CreateOrderCommand.Items));
    }
}
```

---

## 4. xunit.v3 Lifecycle — IAsyncLifetime (เลิก sync-over-async)

> **อย่าใช้** `StartAsync().GetAwaiter().GetResult()` ใน constructor อีกต่อไป — มันเสี่ยง deadlock และ block thread. ใช้ `IAsyncLifetime` ให้ xunit เรียก async setup/teardown ให้.

ใน xunit.v3 `IAsyncLifetime` เปลี่ยน signature:

```csharp
namespace Xunit;

public interface IAsyncLifetime : IAsyncDisposable
{
    // v3: คืน ValueTask (v2 คืน Task)
    ValueTask InitializeAsync();
    // teardown มาจาก IAsyncDisposable.DisposeAsync()  (v2 เคยมี Task DisposeAsync() ของตัวเอง)
}
```

Pattern พื้นฐาน — fixture ที่ start container แบบ async ที่ถูกต้อง:

```csharp
public sealed class PostgreSqlFixture : IAsyncLifetime
{
    private readonly PostgreSqlContainer _db = new PostgreSqlBuilder()
        .WithImage("postgres:17-alpine")
        .WithDatabase("testdb")
        .WithUsername("test")
        .WithPassword("test")
        .Build();

    public string ConnectionString => _db.GetConnectionString();

    // ✅ async setup — xunit เรียกให้, ไม่มี .GetAwaiter().GetResult()
    public async ValueTask InitializeAsync()
    {
        await _db.StartAsync();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseNpgsql(ConnectionString)
            .Options;

        await using var context = new ApplicationDbContext(options);
        await context.Database.MigrateAsync();
    }

    // ✅ teardown ผ่าน IAsyncDisposable
    public async ValueTask DisposeAsync() => await _db.DisposeAsync();
}
```

---

## 5. Integration Testing with Testcontainers 4.x (dual-DB)

> Testcontainers 4.x: namespace `Testcontainers.PostgreSql` (`PostgreSqlBuilder`/`PostgreSqlContainer`) และ `Testcontainers.MsSql` (`MsSqlBuilder`/`MsSqlContainer`). API builder รูปแบบเดิม (`.WithImage().Build()`) + `StartAsync()`/`GetConnectionString()`.
> Skill นี้ขายเรื่อง dual-DB จึงต้อง test **ทั้ง** Postgres และ SQL Server.

### 5.1 PostgreSQL Fixture + Collection
```csharp
[CollectionDefinition(PostgreSqlCollection.Name)]
public sealed class PostgreSqlCollection : ICollectionFixture<PostgreSqlFixture>
{
    public const string Name = "PostgreSql";
}
```
(`PostgreSqlFixture` = ตัวอย่างใน §4)

### 5.2 SQL Server Fixture (MsSqlContainer)
```csharp
public sealed class MsSqlFixture : IAsyncLifetime
{
    private readonly MsSqlContainer _db = new MsSqlBuilder()
        // image ทางการของ SQL Server 2022; MsSqlBuilder ตั้ง password/EULA ให้ default
        .WithImage("mcr.microsoft.com/mssql/server:2022-latest")
        .Build();

    public string ConnectionString => _db.GetConnectionString();

    public async ValueTask InitializeAsync()
    {
        await _db.StartAsync();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlServer(ConnectionString)
            .Options;

        await using var context = new ApplicationDbContext(options);
        await context.Database.MigrateAsync();   // ใช้ migration set ของ SQL Server (ดู §9)
    }

    public async ValueTask DisposeAsync() => await _db.DisposeAsync();
}

[CollectionDefinition(MsSqlCollection.Name)]
public sealed class MsSqlCollection : ICollectionFixture<MsSqlFixture>
{
    public const string Name = "MsSql";
}
```

### 5.3 Repository Integration Tests — Postgres (Respawn DbAdapter.Postgres)
```csharp
[Collection(PostgreSqlCollection.Name)]
public sealed class CustomerRepositoryPostgresTests : IAsyncLifetime
{
    private readonly PostgreSqlFixture _fixture;
    private ApplicationDbContext _context = null!;
    private CustomerRepository _repository = null!;
    private Respawner _respawner = null!;
    private NpgsqlConnection _conn = null!;

    public CustomerRepositoryPostgresTests(PostgreSqlFixture fixture) => _fixture = fixture;

    public async ValueTask InitializeAsync()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseNpgsql(_fixture.ConnectionString)
            .Options;

        _context = new ApplicationDbContext(options);
        _repository = new CustomerRepository(_context);

        _conn = new NpgsqlConnection(_fixture.ConnectionString);
        await _conn.OpenAsync();

        _respawner = await Respawner.CreateAsync(_conn, new RespawnerOptions
        {
            DbAdapter = DbAdapter.Postgres,
            SchemasToInclude = ["public"]
        });
    }

    public async ValueTask DisposeAsync()
    {
        await _respawner.ResetAsync(_conn);   // ล้างข้อมูลคืนสภาพระหว่างเทส
        await _conn.DisposeAsync();
        await _context.DisposeAsync();
    }

    [Fact]
    public async Task GetByIdAsync_WhenExists_ReturnsCustomer()
    {
        var customer = CustomerBuilder.CreateValid();
        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();

        var result = await _repository.GetByIdAsync(customer.Id);

        result.Should().NotBeNull();
        result!.Email.Should().Be(customer.Email);
    }

    [Fact]
    public async Task GetByIdAsync_WhenSoftDeleted_ReturnsNull()
    {
        var customer = CustomerBuilder.Default().AsDeleted().Build();
        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();

        var result = await _repository.GetByIdAsync(customer.Id);

        result.Should().BeNull();
    }
}
```

### 5.4 Repository Integration Tests — SQL Server (Respawn SqlAdapter.SqlServer)
```csharp
[Collection(MsSqlCollection.Name)]
public sealed class CustomerRepositorySqlServerTests : IAsyncLifetime
{
    private readonly MsSqlFixture _fixture;
    private ApplicationDbContext _context = null!;
    private CustomerRepository _repository = null!;
    private Respawner _respawner = null!;
    private SqlConnection _conn = null!;   // Microsoft.Data.SqlClient

    public CustomerRepositorySqlServerTests(MsSqlFixture fixture) => _fixture = fixture;

    public async ValueTask InitializeAsync()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlServer(_fixture.ConnectionString)
            .Options;

        _context = new ApplicationDbContext(options);
        _repository = new CustomerRepository(_context);

        _conn = new SqlConnection(_fixture.ConnectionString);
        await _conn.OpenAsync();

        // ⬇ ความต่างเดียวจาก Postgres: ใช้ SqlAdapter.SqlServer + ระบุ schema "dbo"
        _respawner = await Respawner.CreateAsync(_conn, new RespawnerOptions
        {
            DbAdapter = DbAdapter.SqlServer,
            SchemasToInclude = ["dbo"]
        });
    }

    public async ValueTask DisposeAsync()
    {
        await _respawner.ResetAsync(_conn);
        await _conn.DisposeAsync();
        await _context.DisposeAsync();
    }

    [Fact]
    public async Task GetByIdAsync_WhenExists_ReturnsCustomer()
    {
        var customer = CustomerBuilder.CreateValid();
        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();

        var result = await _repository.GetByIdAsync(customer.Id);

        result.Should().NotBeNull();
        result!.Email.Should().Be(customer.Email);
    }
}
```

> **Respawn adapter mapping:** Postgres → `DbAdapter.Postgres` + connection `Npgsql`. SQL Server → `DbAdapter.SqlServer` + connection `Microsoft.Data.SqlClient`. ค่า `DbAdapter.SqlServer` คือ instance ที่บางเวอร์ชันเข้าถึงผ่าน `SqlAdapter.SqlServer` (ตามที่ระบุในโจทย์) — Respawn re-export ทั้งสอง alias ให้ค่าเดียวกัน. ตรวจ enum/static ที่ติดตั้งจริงด้วย IntelliSense.

---

## 6. API Integration Tests — WebApplicationFactory (Mvc.Testing 10.*)

> เลิก sync-over-async ใน factory — ใช้ `IAsyncLifetime` ครอบ factory แทนการ start container ใน `ConfigureWebHost`.

### 6.1 Factory ที่ inject Testcontainer + ของปลอม
```csharp
public sealed class ApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _db = new PostgreSqlBuilder()
        .WithImage("postgres:17-alpine")
        .Build();

    // start container แบบ async ก่อน factory ถูกใช้
    public async ValueTask InitializeAsync() => await _db.StartAsync();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // เปลี่ยน DbContext มาใช้ test container
            services.RemoveAll<DbContextOptions<ApplicationDbContext>>();
            services.AddDbContext<ApplicationDbContext>(o =>
                o.UseNpgsql(_db.GetConnectionString()));

            // แทน service ภายนอกด้วยของปลอม
            services.RemoveAll<IEmailService>();
            services.AddSingleton<IEmailService, FakeEmailService>();

            // ตรึงเวลาให้ test เป็น deterministic (ดู §7)
            services.RemoveAll<TimeProvider>();
            services.AddSingleton<TimeProvider>(
                new FakeTimeProvider(new DateTimeOffset(2026, 6, 13, 0, 0, 0, TimeSpan.Zero)));

            using var scope = services.BuildServiceProvider().CreateScope();
            scope.ServiceProvider.GetRequiredService<ApplicationDbContext>()
                .Database.Migrate();
        });
    }

    // teardown: dispose container แล้วค่อย dispose host ของ WebApplicationFactory
    public override async ValueTask DisposeAsync()
    {
        await _db.DisposeAsync();
        await base.DisposeAsync();
    }
}
```

### 6.2 API Tests
```csharp
public sealed class OrdersControllerTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;
    private readonly HttpClient _client;

    public OrdersControllerTests(ApiFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();   // สร้าง TestServer + HttpClient
    }

    [Fact]
    public async Task CreateOrder_WithValidData_Returns201()
    {
        var customer = await SeedCustomerAsync();
        var request = new CreateOrderRequest
        {
            CustomerId = customer.Id,
            Items = [new(ProductId: 1, Quantity: 2, Price: 50m)]
        };

        var response = await _client.PostAsJsonAsync("/api/orders", request);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        response.Headers.Location.Should().NotBeNull();

        var orderId = await response.Content.ReadFromJsonAsync<long>();
        orderId.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task GetOrder_WhenNotFound_Returns404()
    {
        var response = await _client.GetAsync("/api/orders/99999");
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

> Tip: ปรับ client ราย test ด้วย `factory.WithWebHostBuilder(b => b.ConfigureServices(...))` เพื่อ swap mock เฉพาะเคส.
> Tip: ตั้ง `WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost") }` เพื่อเลี่ยง warning จาก HTTPS Redirection.

---

## 7. ควบคุมเวลาใน test ด้วย FakeTimeProvider

> Package: `Microsoft.Extensions.TimeProvider.Testing` · namespace `Microsoft.Extensions.Time.Testing` · class `FakeTimeProvider : TimeProvider`.
> หลักการ: production code ต้อง **inject `TimeProvider`** แทนการเรียก `DateTime.UtcNow` ตรง ๆ จึงจะตรึงเวลาใน test ได้.

API ที่ใช้บ่อย:
- `new FakeTimeProvider()` → เริ่มที่ midnight 1 ม.ค. 2000 UTC, ไม่เดินเองอัตโนมัติ
- `new FakeTimeProvider(DateTimeOffset start)` → กำหนดจุดเริ่ม
- `SetUtcNow(DateTimeOffset)` → ตั้งเวลาตรง ๆ
- `Advance(TimeSpan)` → เลื่อนเวลาไปข้างหน้า (กระตุ้น timer/`Task.Delay` ที่ผูกกับ provider นี้)
- `GetUtcNow()` → อ่านเวลาปัจจุบันของ provider

```csharp
public sealed class Subscription(TimeProvider time)
{
    private DateTimeOffset _activatedAt;
    public void Activate() => _activatedAt = time.GetUtcNow();
    public bool IsActive => time.GetUtcNow() < _activatedAt.AddYears(1);
}

public class SubscriptionTests
{
    [Fact]
    public void Subscription_ExpiresAfterOneYear()
    {
        // Arrange — ตรึงเวลาเริ่มต้น
        var fakeTime = new FakeTimeProvider();
        fakeTime.SetUtcNow(new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero));

        var sub = new Subscription(fakeTime);
        sub.Activate();
        sub.IsActive.Should().BeTrue();

        // Act — เลื่อนไป 11 เดือน ยังไม่หมดอายุ
        fakeTime.Advance(TimeSpan.FromDays(30 * 11));
        sub.IsActive.Should().BeTrue();

        // เลื่อนเลย 1 ปี → หมดอายุ
        fakeTime.Advance(TimeSpan.FromDays(60));
        sub.IsActive.Should().BeFalse();
    }
}
```

ทดสอบงานหน่วงเวลา/timer โดยไม่ต้องรอจริง (`Task.Delay` รับ `TimeProvider` overload):

```csharp
public sealed class DelayedOperation(TimeProvider time)
{
    public Task ExecuteAsync(TimeSpan delay) => Task.Delay(delay, time);
}

[Fact]
public async Task DelayedOperation_CompletesAfterDelay()
{
    var fakeTime = new FakeTimeProvider();
    var op = new DelayedOperation(fakeTime);

    var task = op.ExecuteAsync(TimeSpan.FromMinutes(5));
    task.IsCompleted.Should().BeFalse();   // ยังไม่ครบเวลา

    fakeTime.Advance(TimeSpan.FromMinutes(5));   // กระโดดข้ามเวลา
    await task;
    task.IsCompleted.Should().BeTrue();
}
```

Inject ผ่าน DI ใน integration test (เช่นทดสอบ cache/expiry):

```csharp
var fakeTime = new FakeTimeProvider();
services.AddSingleton<TimeProvider>(fakeTime);   // production อ่าน TimeProvider.System
// ...
fakeTime.Advance(TimeSpan.FromMinutes(11));      // ดัน cache ให้หมดอายุ
```

> Best practice (จาก MS Learn): ทำงานด้วย UTC ในตรรกะธุรกิจ, dispose timer ที่สร้างด้วย `CreateTimer`, อย่าผสม `TimeProvider.System` กับ `FakeTimeProvider` ใน test เดียวกัน.

---

## 8. Aspire Integration Tests — DistributedApplicationTestingBuilder

> Package: `Aspire.Hosting.Testing` (v13.*). ใช้ทดสอบทั้ง AppHost จริง — สั่ง spin ทุก resource (DB/cache/projects) แล้วยิง HTTP เข้า endpoint ที่ Aspire ตั้งให้.

API หลักที่ verify แล้ว:
- `DistributedApplicationTestingBuilder.CreateAsync<TEntryPoint>(ct)` → `IDistributedApplicationTestingBuilder` (มี overload รับ `Type`, `string[] args`, และ `Action<DistributedApplicationOptions, HostApplicationBuilderSettings>`)
- `builder.BuildAsync(ct)` → `DistributedApplication` (เรียกได้ครั้งเดียว)
- `app.ResourceNotifications.WaitForResourceHealthyAsync("name")` / `WaitForResourceAsync("name", KnownResourceStates.Running)`
- `app.CreateHttpClient("resourceName")` (extension จาก `DistributedApplicationHostingTestingExtensions`) หรือ `app.GetEndpoint("resourceName")`
- `appHost.CreateResourceBuilder<ContainerResource>("name")` → แก้ resource ที่ AppHost ประกาศไว้ ก่อน build (เช่น mock ให้ down)

```csharp
public class AppHostTests
{
    [Fact]
    public async Task ApiResource_ReturnsOk_WhenAppHostStarts()
    {
        // Arrange — TEntryPoint = Program ของโปรเจกต์ AppHost (Projects.MyApp_AppHost)
        var appHost = await DistributedApplicationTestingBuilder
            .CreateAsync<Projects.MyApp_AppHost>();

        appHost.Services.ConfigureHttpClientDefaults(http => http.AddStandardResilienceHandler());

        await using var app = await appHost.BuildAsync();
        await app.StartAsync();

        // รอให้ Postgres + API พร้อมก่อนยิง request
        await app.ResourceNotifications.WaitForResourceHealthyAsync("postgres");
        await app.ResourceNotifications.WaitForResourceAsync("api", KnownResourceStates.Running);

        var client = app.CreateHttpClient("api");

        // Act
        var response = await client.GetAsync("/health");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Health_ReturnsUnhealthy_WhenCacheUnavailable()
    {
        var appHost = await DistributedApplicationTestingBuilder
            .CreateAsync<Projects.MyApp_AppHost>();

        // แก้ resource "cache" ให้ไม่ทำงาน เพื่อทดสอบ health degradation
        var cache = appHost.CreateResourceBuilder<ContainerResource>("cache");
        cache.WithEntrypoint("sleep 1d");

        await using var app = await appHost.BuildAsync();
        await app.StartAsync();

        var client = app.CreateHttpClient("api");
        var response = await client.GetAsync("/health");

        response.StatusCode.Should().Be(HttpStatusCode.ServiceUnavailable);
    }
}
```

> `Projects.MyApp_AppHost` เป็น generated type ของ Aspire (ได้มาเมื่อ test project อ้างถึง AppHost project). seed ฐานข้อมูลหลัง resource healthy ได้ผ่าน `app.Services.CreateScope()` (ดู §EF migration).

---

## 9. Dual-DB Migrations ใน test

EF Core 10 scaffold migration ให้ "active provider" เท่านั้น — dual-DB จึงต้องเก็บ **migration set แยกต่อ provider**:

```bash
# Postgres
dotnet ef migrations add Init --context AppDbContextNpgsql \
  --output-dir Migrations/Postgres -- --provider Postgres

# SQL Server
dotnet ef migrations add Init --context AppDbContextSqlServer \
  --output-dir Migrations/SqlServer -- --provider SqlServer
```

- ใน fixture แต่ละตัว (§5) เลือก provider ให้ตรงกับ DbContext/connection แล้วค่อย `MigrateAsync()`
- ถ้าใช้ DbContext ตัวเดียวแบบ runtime-switch ให้แยก migrations เป็น assembly/`--output-dir` ตาม provider, แล้วชี้ `MigrationsAssembly`/`--provider` ตอน build (ดู MS Learn "Migrations with Multiple Providers")

---

## 10. Licensing — FluentAssertions / MediatR / AutoMapper (เปลี่ยนเป็นเชิงพาณิชย์)

> **บริบท มิ.ย. 2026:** library ยอดนิยมหลายตัวเปลี่ยน license:
> - **FluentAssertions 8+** → ต้องซื้อ license สำหรับใช้เชิงพาณิชย์
> - **MediatR 13+** → commercial license
> - **AutoMapper 15+** → commercial license
>
> ⚠️ ตัวเลขเวอร์ชันที่เริ่มคิดเงินด้านบนอาจคลาดเคลื่อน — ก่อน pin ให้ตรวจ release notes/หน้า pricing ของแต่ละ project ให้แน่ใจ (ดู uncertainties).

**ทางเลือกสำหรับทีม:**

1. **ตรึงเวอร์ชันเก่าที่ยังฟรี (frozen)**
   เวอร์ชันก่อนเปลี่ยน license (เช่น FluentAssertions 6.x/7.x, MediatR 12.x, AutoMapper 14.x) ยังใช้ฟรีได้ตามเงื่อนไขเดิม — pin ไว้แล้วไม่ขยับ. ข้อเสีย: ไม่ได้ feature/บั๊กฟิกซ์ใหม่ และไม่รองรับ TFM ใหม่ ๆ ในระยะยาว.

2. **ย้ายไป free alternative:**

   | เดิม (commercial) | ทางเลือกฟรี | trade-off |
   |---|---|---|
   | FluentAssertions 8+ | **AwesomeAssertions** (fork จาก FA7, API เกือบเหมือนกัน — `.Should().Be(...)`) | drop-in มากที่สุด แต่เป็น community fork |
   | FluentAssertions 8+ | **Shouldly** (`value.ShouldBe(...)`) | syntax ต่าง ต้องแก้ assertion ทั้งหมด, error message ดี |
   | AutoMapper 15+ | **Mapperly** (source generator, compile-time) | เร็ว/ไม่มี reflection, แต่ mapping ต้องประกาศชัด ปรับ mindset |
   | AutoMapper 15+ | mapping ด้วยมือ / extension method | ไม่มี dependency, verbose แต่ debug ง่าย |
   | MediatR 13+ | **custom mediator** เล็ก ๆ + DI, หรือ library ฟรีอื่น | คุม pipeline เอง, ต้องเขียน behavior/dispatch เอง |

```csharp
// Shouldly แทน FluentAssertions
result.IsSuccess.ShouldBeTrue();
order.Status.ShouldBe(OrderStatus.Pending);
Should.Throw<DomainException>(() => order.AddItem(1, 1, 100m));

// Mapperly แทน AutoMapper (compile-time, ไม่มี runtime config)
[Mapper]
public partial class CustomerMapper
{
    public partial CustomerDto ToDto(Customer entity);
}
```

> หลักการเลือก: ถ้าอยากแก้น้อยสุด → AwesomeAssertions + pin เวอร์ชันเก่า; ถ้าอยากตัด commercial risk ระยะยาว → Shouldly + Mapperly + custom mediator. ทุกกรณีควรเช็คนโยบาย license ขององค์กรก่อน commit.

---

## 11. Test Builders

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

    public CustomerBuilder WithId(long id) { _id = id; return this; }
    public CustomerBuilder WithName(string name) { _name = name; return this; }
    public CustomerBuilder WithEmail(string email) { _email = email; return this; }
    public CustomerBuilder AsInactive() { _isActive = false; return this; }
    public CustomerBuilder AsDeleted() { _isDeleted = true; return this; }

    public Customer Build() => new()
    {
        Id = _id,
        Name = _name,
        Email = _email,
        IsActive = _isActive,
        IsDeleted = _isDeleted,
        CreatedAt = DateTime.UtcNow
    };

    public static IEnumerable<Customer> CreateMany(int count) =>
        Enumerable.Range(0, count).Select(_ => CreateValid());
}

public class OrderBuilder
{
    private long _customerId = 1;
    private OrderStatus _status = OrderStatus.Pending;
    private List<OrderItem> _items = [];

    public static Order CreatePending() => new OrderBuilder().Build();
    public static Order CreateCompleted() =>
        new OrderBuilder().WithStatus(OrderStatus.Completed).Build();

    public OrderBuilder WithCustomerId(long id) { _customerId = id; return this; }
    public OrderBuilder WithStatus(OrderStatus status) { _status = status; return this; }
    public OrderBuilder WithItems(params OrderItem[] items) { _items = [.. items]; return this; }

    public Order Build()
    {
        var order = new Order
        {
            CustomerId = _customerId,
            Status = _status,
            CreatedAt = DateTime.UtcNow
        };
        foreach (var item in _items) order.Items.Add(item);
        return order;
    }
}
```

> หมายเหตุ: ตัวอย่างเดิมใช้ `AutoFixture` — มิ. y. 2026 AutoFixture ยังใช้ได้ แต่ถ้าทีมต้องการลด dependency แนะนำใช้ test builder + Bogus (`Faker`) ตามด้านบน ซึ่งคุม data ได้ชัดและไม่มีประเด็น license. ถ้ายังใช้ AutoFixture ให้ pin เวอร์ชัน 4.x.

---

## Verified versions (มิ.ย. 2026)

ตรวจกับ Microsoft Learn (Microsoft-owned APIs):

- **FakeTimeProvider** — package `Microsoft.Extensions.TimeProvider.Testing` v10.x, namespace `Microsoft.Extensions.Time.Testing`, `FakeTimeProvider : TimeProvider`; ctor default = 1 ม.ค. 2000 UTC, `SetUtcNow`, `Advance(TimeSpan)`, `GetUtcNow()`, `CreateTimer`, และ `Task.Delay(delay, timeProvider)` — ยืนยันแล้ว
- **WebApplicationFactory<TEntryPoint>** / `Microsoft.AspNetCore.Mvc.Testing` (aspnetcore-10.0) — `ConfigureWebHost`, `CreateClient()`, `WithWebHostBuilder`, `WebApplicationFactoryClientOptions` — ยืนยันแล้ว
- **Aspire.Hosting.Testing v13.1.0** — `DistributedApplicationTestingBuilder.CreateAsync<TEntryPoint>(ct)`, `IDistributedApplicationTestingBuilder.BuildAsync(ct)`, `app.GetEndpoint`, `app.CreateHttpClient`, `app.ResourceNotifications.WaitForResourceHealthyAsync` / `WaitForResourceAsync(name, KnownResourceStates.Running)`, `CreateResourceBuilder<ContainerResource>(name)` — ยืนยันแล้ว
- **EF Core 10** — `Microsoft.EntityFrameworkCore.SqlServer v10.0.0` (`UseSqlServer`), `Npgsql.EntityFrameworkCore.PostgreSQL` (`UseNpgsql`, third-party), multiple-provider migrations ด้วย `--context` / `--output-dir` / `-- --provider` — ยืนยันแล้ว

ไม่ได้อยู่บน MS Learn (third-party — อิงเอกสาร/แนวปฏิบัติของ project นั้น ๆ, ควร verify เวอร์ชันก่อน pin):

- **xunit.v3** (`xunit.v3` package, `xunit.runner.visualstudio` 3.x) — `IAsyncLifetime.InitializeAsync` คืน `ValueTask` + teardown ผ่าน `IAsyncDisposable.DisposeAsync()` (ต่างจาก v2)
- **Testcontainers 4.x** — `Testcontainers.PostgreSql` (`PostgreSqlBuilder`), `Testcontainers.MsSql` (`MsSqlBuilder`)
- **Respawn** — `DbAdapter.Postgres` / `DbAdapter.SqlServer` (alias `SqlAdapter.SqlServer`), `RespawnerOptions`, `Respawner.CreateAsync`, `ResetAsync`
- **Licensing (FluentAssertions 8+, MediatR 13+, AutoMapper 15+ = commercial)** — เลขเวอร์ชันที่เริ่มคิดเงินอาจคลาดเคลื่อน, ตรวจ pricing/release notes ทางการก่อนตัดสินใจ
- **Free alternatives** — AwesomeAssertions, Shouldly, Mapperly, Bogus
