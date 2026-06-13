# Dependency Injection & Cross-Cutting (.NET 10)

> .NET 10 LTS (support ถึง Nov 2028) + ASP.NET Core 10. ทุก API ด้านล่างตรวจกับ Microsoft Learn (aspnetcore-10.0 / net-10.0) แล้ว — ดู "Verified versions" ท้ายไฟล์.
> โฟกัส: ใช้ built-in feature ของ framework แทน custom abstraction ที่เคยเขียนเอง (IDateTimeService, exception middleware, manual cache coordination).

---

## 1. TimeProvider — เลิกเขียน `IDateTimeService` / `DateTime.UtcNow`

`System.TimeProvider` (abstract class, built-in ตั้งแต่ .NET 8) เป็น abstraction ของเวลา. **เลิก** inject `IDateTimeService`/`IDateTime` ที่เขียนเอง — inject `TimeProvider` แทน แล้วใช้ `GetUtcNow()` (คืน `DateTimeOffset`). ทำให้ logic ที่พึ่งเวลา testable โดยไม่ต้อง abstract เพิ่ม.

```csharp
// Domain/Infrastructure service — inject TimeProvider ตรงๆ
public class OrderService(TimeProvider timeProvider, IUnitOfWork uow)
{
    public async Task<Result> PlaceOrderAsync(PlaceOrderCommand cmd, CancellationToken ct)
    {
        DateTimeOffset now = timeProvider.GetUtcNow();   // แทน DateTime.UtcNow
        var order = Order.Create(cmd.CustomerId, placedAt: now.UtcDateTime);

        if (now.UtcDateTime > cmd.PromoEndsAt)
            return Result.Failure("Promotion expired");

        uow.Orders.Add(order);
        await uow.SaveChangesAsync(ct);
        return Result.Success();
    }
}
```

ลงทะเบียนใน DI — production ใช้ `TimeProvider.System` (singleton):

```csharp
builder.Services.AddSingleton(TimeProvider.System);
```

> `TimeProvider` ให้ความสามารถ: `GetUtcNow()` / `GetLocalNow()` (คืน `DateTimeOffset`), `GetTimestamp()` + `GetElapsedTime(long)` สำหรับวัดเวลาแบบ high-frequency, `CreateTimer(...)`, และ property `LocalTimeZone`.

### 1.1 จับคู่กับ FakeTimeProvider ใน unit test

`FakeTimeProvider` (namespace `Microsoft.Extensions.Time.Testing`, NuGet package **`Microsoft.Extensions.TimeProvider.Testing`**) เป็น implementation ที่ควบคุมเวลาได้ — default เริ่มที่ 2000-01-01 midnight UTC.

```xml
<PackageReference Include="Microsoft.Extensions.TimeProvider.Testing" Version="10.0.0" />
```

```csharp
public class OrderServiceTests
{
    [Fact]
    public async Task PlaceOrder_AfterPromoEnds_ReturnsFailure()
    {
        // Arrange — ตั้งเวลาให้แน่นอน (deterministic)
        var startTime = new DateTimeOffset(2026, 6, 13, 12, 0, 0, TimeSpan.Zero);
        var fakeTime = new FakeTimeProvider(startTime);

        var sut = new OrderService(fakeTime, _uow);
        var cmd = new PlaceOrderCommand(CustomerId: 1)
        {
            PromoEndsAt = startTime.UtcDateTime   // promo หมดพอดี ณ start
        };

        // Act — เลื่อนเวลาไป 1 ชั่วโมง (instant ไม่ต้องรอจริง)
        fakeTime.Advance(TimeSpan.FromHours(1));
        var result = await sut.PlaceOrderAsync(cmd, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        fakeTime.GetUtcNow().Should().Be(startTime.AddHours(1));
    }
}
```

> `FakeTimeProvider` สืบทอดจาก `TimeProvider` → ใช้ `Advance(TimeSpan)` เลื่อนเวลา, `SetLocalTimeZone(TimeZoneInfo)` ตั้ง time zone. เหมาะกับเทส edge case (midnight, สิ้นเดือน, DST, leap year) โดยไม่ flaky. **อย่า** ผสม `TimeProvider.System` กับ `FakeTimeProvider` ใน test เดียวกัน.

### 1.2 TimeProvider กับ async/delay — testable timeout/retry

`Task.Delay` และ `CancellationTokenSource` รับ `TimeProvider` overload — ทำให้ logic timeout/polling เทสได้ด้วย `FakeTimeProvider.Advance()` แทนการรอจริง:

```csharp
public class PollingService(TimeProvider time)
{
    public async Task PollAsync(CancellationToken ct)
    {
        // ใช้ overload ที่รับ TimeProvider → fake ได้
        await Task.Delay(TimeSpan.FromSeconds(30), time, ct);
    }
}

// timeout pattern ที่ deterministic
using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5), time);
```

---

## 2. Keyed Services — เลือก implementation ตาม key (เหมาะกับ dual-DB)

ตั้งแต่ .NET 8 DI container รองรับ keyed services: ลงทะเบียนหลาย implementation ของ interface เดียวกันแล้วเลือกด้วย key. ใช้ `AddKeyedSingleton` / `AddKeyedScoped` / `AddKeyedTransient` แล้ว resolve ด้วย attribute `[FromKeyedServices("key")]` ที่ parameter ของ constructor.

```csharp
// ลงทะเบียน 2 provider — dual-DB scenario (PostgreSQL + SQL Server)
builder.Services.AddKeyedScoped<IReportRepository, PostgresReportRepository>("postgres");
builder.Services.AddKeyedScoped<IReportRepository, SqlServerReportRepository>("sqlserver");

// consume — เลือก repository ตาม backing store
public class ReportService(
    [FromKeyedServices("postgres")] IReportRepository analyticsRepo,   // OLAP บน Postgres
    [FromKeyedServices("sqlserver")] IReportRepository txRepo)         // OLTP บน SQL Server
{
    public Task<AnalyticsDto> GetAnalyticsAsync() => analyticsRepo.QueryAsync();
    public Task<InvoiceDto> GetInvoiceAsync(int id) => txRepo.FindAsync(id);
}
```

key ไม่จำเป็นต้องเป็น `string` — ใช้ `object` อะไรก็ได้ที่ implement `Equals` ถูกต้อง (เช่น enum):

```csharp
builder.Services.AddKeyedSingleton<IMessageWriter, MemoryMessageWriter>("memory");
builder.Services.AddKeyedSingleton<IMessageWriter, QueueMessageWriter>("queue");

// resolve แบบ imperative จาก IServiceProvider
var writer = serviceProvider.GetRequiredKeyedService<IMessageWriter>("queue");
```

resolve ใน Minimal API / controller action:

```csharp
app.MapGet("/cache/{key:int}", (
    [FromKeyedServices("postgres")] IReportRepository repo, int key)
        => repo.GetAsync(key));
```

> ⚠️ **Behavior change (.NET 8.0.9+ / .NET 9+)**: `[FromKeyedServices]` จะ **ไม่** fallback ไป resolve non-keyed service อีกแล้ว — ต้องลงทะเบียนเป็น keyed service จริง (ด้วย `AddKeyedScoped`/`AddKeyedSingleton`/`AddKeyedTransient`) ไม่งั้น throw. (.NET 8.0.9 มี feature switch `Microsoft.Extensions.DependencyInjection.AllowNonKeyedServiceInject=true` ไว้ย้อนพฤติกรรมเก่า แต่ .NET 9+ ไม่มี)
>
> `KeyedService.AnyKey` ใช้เป็น fallback registration ที่ match ทุก key ที่ไม่มี registration เฉพาะ. Blazor inject keyed service ด้วย `[Inject(Key = "...")]`.

---

## 3. Options Pattern (full) — bind + validate + fail-fast

ผูก strongly-typed config + validate ตอน startup (fail-fast) แทนการ inject `IConfiguration` ดิบ. chain: `AddOptions<T>()` → `.BindConfiguration(section)` → `.ValidateDataAnnotations()` → `.ValidateOnStart()`.

```csharp
using System.ComponentModel.DataAnnotations;

public sealed class DatabaseOptions
{
    public const string SectionName = "Database";

    [Required]
    public required string PrimaryConnectionString { get; init; }

    [Range(1, 300)]
    public int CommandTimeoutSeconds { get; init; } = 60;

    [Range(0, 10)]
    public int MaxRetryCount { get; init; } = 3;
}
```

```csharp
// Program.cs
builder.Services
    .AddOptions<DatabaseOptions>()
    .BindConfiguration(DatabaseOptions.SectionName)   // ผูกกับ section "Database" + ลงทะเบียน change-token (รองรับ IOptionsMonitor)
    .ValidateDataAnnotations()                        // ตรวจ [Required]/[Range]/... ตอน resolve
    .Validate(o => o.MaxRetryCount <= 10, "MaxRetryCount must be <= 10")  // กฎซับซ้อนเพิ่ม
    .ValidateOnStart();                               // fail-fast ตอน start แทน lazy ตอน request แรก
```

```jsonc
// appsettings.json
{
  "Database": {
    "PrimaryConnectionString": "Host=...;Database=app;",
    "CommandTimeoutSeconds": 60,
    "MaxRetryCount": 3
  }
}
```

consume — inject `IOptions<T>` (singleton snapshot), `IOptionsSnapshot<T>` (per-request, reloadable), หรือ `IOptionsMonitor<T>` (live reload + change callback):

```csharp
public class ConnectionFactory(IOptions<DatabaseOptions> options)
{
    private readonly DatabaseOptions _opt = options.Value;
    public NpgsqlConnection Create() => new(_opt.PrimaryConnectionString);
}
```

> `BindConfiguration` ดีกว่า `Configure<T>(config.GetSection(...))` ตรงที่ลงทะเบียน change-token source ให้ด้วย → `IOptionsMonitor` ทำงาน (reload ได้). `ValidateDataAnnotations` อยู่ใน package **`Microsoft.Extensions.Options.DataAnnotations`** (web SDK `Microsoft.NET.Sdk.Web` reference มาให้แล้วผ่าน shared framework). ทางเลือก one-liner: `AddOptionsWithValidateOnStart<DatabaseOptions>().BindConfiguration(...).ValidateDataAnnotations()`.
>
> สำหรับ hot path ที่อยากตัด overhead ของ DataAnnotations runtime ให้ใช้ **options validation source generator** (compile-time `IValidateOptions<T>`).

---

## 4. HybridCache — L1 (in-memory) + L2 (Redis) + stampede protection

`HybridCache` (package **`Microsoft.Extensions.Caching.Hybrid`**, introduced .NET 9) รวม `IMemoryCache` (L1) + `IDistributedCache` (L2) เป็น API เดียว. จุดเด่น: **stampede protection** (ผู้เรียกหลาย concurrent ผ่าน factory แค่ครั้งเดียว) + **tag-based invalidation** + serialization (default `System.Text.Json`).

```xml
<PackageReference Include="Microsoft.Extensions.Caching.Hybrid" Version="..." />
```

```csharp
// L2 = Redis ผ่าน IDistributedCache (ถ้าไม่ลง Redis → HybridCache ยังให้ L1 + stampede protection)
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
});

builder.Services.AddHybridCache(options =>
{
    options.MaximumPayloadBytes = 1024 * 1024;   // 1 MB (default)
    options.MaximumKeyLength = 1024;
    options.DefaultEntryOptions = new HybridCacheEntryOptions
    {
        Expiration = TimeSpan.FromMinutes(30),       // อายุใน L2 (distributed)
        LocalCacheExpiration = TimeSpan.FromMinutes(5)  // อายุใน L1 (in-memory)
    };
});
```

### 4.1 GetOrCreateAsync — cache miss handling อัตโนมัติ

```csharp
public class CustomerService(HybridCache cache, ICustomerRepository repo)
{
    public async Task<CustomerDto> GetAsync(int id, CancellationToken ct = default)
    {
        return await cache.GetOrCreateAsync(
            $"customer:{id}",                                   // unique key
            async token => await repo.FindDtoAsync(id, token),  // factory — เรียกแค่ตอน miss
            cancellationToken: ct);
        // concurrent callers ทุกตัวรอผลของ factory เดียวกัน (stampede protection)
        // token ใน factory = combined cancellation ของ "ทุก" caller ไม่ใช่แค่ตัวเดียว
    }
}
```

> high-throughput: ใช้ overload **`GetOrCreateAsync<TState, T>(key, state, factory, ...)`** ที่ส่ง state เข้า factory เพื่อเลี่ยง closure allocation / per-call delegate. signature เต็ม: `GetOrCreateAsync<TState,T>(string key, TState state, Func<TState, CancellationToken, ValueTask<T>> factory, HybridCacheEntryOptions? options = null, IEnumerable<string>? tags = null, CancellationToken cancellationToken = default)`.

### 4.2 Tag-based invalidation

ส่ง `tags` ตอน `GetOrCreateAsync` (positional argument ที่ 4 หรือใช้ named) แล้ว invalidate เป็นกลุ่มด้วย `RemoveByTagAsync`:

```csharp
public async Task<CustomerData> GetCustomerAsync(int customerId, CancellationToken ct)
{
    var tags = new[] { "customer", $"customer:{customerId}" };

    return await cache.GetOrCreateAsync(
        $"customer:{customerId}",
        async token => await _repo.LoadAsync(customerId, token),
        new HybridCacheEntryOptions { Expiration = TimeSpan.FromMinutes(30) },
        tags,
        ct);
}

// invalidate ตอน update — entry ทุกตัวที่ติด tag นี้กลายเป็น cache-miss
await cache.RemoveByTagAsync($"customer:{customerId}");

// invalidate หลาย tag พร้อมกัน
await cache.RemoveByTagAsync(new[] { "customer", "orders" });

// ลบทั้งหมด — "*" เป็น wildcard reserved (ไม่ใช่ glob; "foo*" ใช้ไม่ได้)
await cache.RemoveByTagAsync("*");

// ลบ entry เดี่ยวด้วย key
await cache.RemoveAsync($"customer:{customerId}");
```

> ⚠️ Tag invalidation เป็น **logical operation** — ไม่ได้ลบค่าออกจาก L1/L2 ทันที แต่ทำให้ entry ที่ติด tag ถูกถือเป็น cache-miss ครั้งถัดไป (ค่าหมดอายุตาม lifetime เดิม). หมายเหตุ: invalidate มีผลกับ server ปัจจุบัน + L2 แต่ **L1 in-memory ของ server อื่นไม่ถูกแตะ**.
>
> **Object reuse**: ปกติ `HybridCache` deserialize ใหม่ทุกครั้ง (thread-safe). ถ้า type เป็น immutable ให้ mark `sealed` + `[ImmutableObject(true)]` เพื่อให้ reuse instance ได้ (ลด alloc/CPU).

---

## 5. IExceptionHandler + ProblemDetails — เลิกเขียน exception middleware เอง

ตั้งแต่ .NET 8 `IExceptionHandler` (namespace `Microsoft.AspNetCore.Diagnostics`) ให้ callback กลางสำหรับจัดการ exception แทนการเขียน custom middleware. รวมกับ `AddProblemDetails()` → คืน RFC 7807 `ProblemDetails` payload มาตรฐาน.

interface มี method เดียว — `ValueTask<bool> TryHandleAsync(HttpContext, Exception, CancellationToken)`. คืน `true` = จัดการแล้ว (หยุด pipeline), `false` = ส่งต่อ handler ตัวถัดไป/default.

```csharp
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

public sealed class GlobalExceptionHandler(
    IProblemDetailsService problemDetails,
    ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext, Exception exception, CancellationToken ct)
    {
        logger.LogError(exception, "Unhandled exception: {Message}", exception.Message);

        var (status, title) = exception switch
        {
            ValidationException => (StatusCodes.Status400BadRequest, "Validation failed"),
            NotFoundException   => (StatusCodes.Status404NotFound, "Resource not found"),
            _                   => (StatusCodes.Status500InternalServerError, "Server error")
        };

        httpContext.Response.StatusCode = status;

        // เขียน ProblemDetails ผ่าน IProblemDetailsService (เคารพ Accept header)
        return await problemDetails.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            Exception = exception,
            ProblemDetails = new ProblemDetails
            {
                Status = status,
                Title = title,
                Type = $"https://httpstatuses.io/{status}"
            }
        });
    }
}
```

ลงทะเบียนใน `Program.cs` — `AddExceptionHandler<T>` (lifetime = singleton; ลงหลายตัวได้ เรียกตามลำดับ) + `AddProblemDetails()` + `UseExceptionHandler()`:

```csharp
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
// ลงได้หลายตัว — เรียกตามลำดับจนกว่าจะมีตัวคืน true
// builder.Services.AddExceptionHandler<DbExceptionHandler>();

var app = builder.Build();

app.UseExceptionHandler();   // ไม่ต้องส่ง path ถ้าใช้ IExceptionHandler + ProblemDetails
app.UseStatusCodePages();    // เติม ProblemDetails ให้ status code ที่ยังไม่มี body
```

ถ้าไม่ต้องการ custom handler — แค่ `AddProblemDetails()` + `UseExceptionHandler()` ก็คืน `ProblemDetails` 500 มาตรฐานให้แล้ว:

```jsonc
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.6.1",
  "title": "An error occurred while processing your request.",
  "status": 500,
  "traceId": "00-b644...-00"
}
```

> ⚠️ **.NET 10 behavior change**: ถ้า `TryHandleAsync` คืน `true`, exception handler middleware จะ **ไม่ emit diagnostics** (log `UnhandledException`, metric `error.type`) โดย default — ต่างจาก .NET 8/9 ที่ emit เสมอ. อยากให้ telemetry ยังบันทึก ตั้ง `SuppressDiagnosticsCallback` บน `ExceptionHandlerOptions`:
>
> ```csharp
> app.UseExceptionHandler(new ExceptionHandlerOptions
> {
>     SuppressDiagnosticsCallback = context => false   // คืน false = ไม่ suppress (พฤติกรรมเก่า)
> });
> ```
>
> หมายเหตุ: `DefaultProblemDetailsWriter` รองรับ `Accept`: `application/json`, `application/problem+json`, wildcard (`*/*`); media type อื่น (xml/html) จะ fallback. `IProblemDetailsService` มีทั้ง `TryWriteAsync` (เพิ่มใน .NET 8 — คืน bool) และ `WriteAsync` บน net-10.0; ตัวอย่างนี้ใช้ `TryWriteAsync`.

---

## Verified versions (ตรวจกับ Microsoft Learn 2026-06)

ทุก API ตรวจกับ Microsoft Learn — view `aspnetcore-10.0` / `net-10.0`:

| Topic | API / package | ยืนยัน |
| --- | --- | --- |
| TimeProvider | `System.TimeProvider.GetUtcNow()` / `GetLocalNow()` / `GetTimestamp()` / `CreateTimer` (built-in .NET 8+), `TimeProvider.System` | ✅ net-10.0 |
| FakeTimeProvider | `Microsoft.Extensions.Time.Testing.FakeTimeProvider` + `Advance` / `SetLocalTimeZone`; package `Microsoft.Extensions.TimeProvider.Testing` v10.x | ✅ |
| TimeProvider async | `Task.Delay(TimeSpan, TimeProvider[, CancellationToken])`, `CancellationTokenSource(TimeSpan, TimeProvider)` | ✅ |
| Keyed DI | `AddKeyedSingleton`/`AddKeyedScoped`/`AddKeyedTransient`, `[FromKeyedServices(object key)]`, `GetRequiredKeyedService<T>`, `KeyedService.AnyKey` | ✅ net-11.0-pp API page; aspnetcore-10.0 docs |
| Keyed DI change | `[FromKeyedServices]` ไม่ fallback non-keyed (ตั้งแต่ .NET 8.0.9 / .NET 9) | ✅ compatibility doc |
| Options | `AddOptions<T>()`, `BindConfiguration`, `ValidateDataAnnotations`, `Validate`, `ValidateOnStart`, `AddOptionsWithValidateOnStart<T>` | ✅ net-10.0 / aspnetcore-10.0 |
| HybridCache | `AddHybridCache`, `GetOrCreateAsync<T>` + `<TState,T>` overload, `HybridCacheEntryOptions` (Expiration/LocalCacheExpiration/Flags), `RemoveAsync`, `RemoveByTagAsync` (single + IEnumerable + `"*"`); package `Microsoft.Extensions.Caching.Hybrid` (introduced .NET 9) | ✅ aspnetcore-10.0 / net-10.0 |
| IExceptionHandler | `IExceptionHandler.TryHandleAsync(HttpContext, Exception, CancellationToken) → ValueTask<bool>`, `AddExceptionHandler<T>` (singleton), `AddProblemDetails`, `UseExceptionHandler`, `IProblemDetailsService`, `ExceptionHandlerOptions.SuppressDiagnosticsCallback` (.NET 10) | ✅ aspnetcore-10.0 |

> หมายเหตุ uncertainty: หน้า API reference บางตัว (เช่น `AddKeyedScoped`, `GetOrCreateAsync`) ใน Learn แสดง package เป็น `net-11.0-pp` (preview) — แต่ API surface เหล่านี้ stable มาตั้งแต่ .NET 8/9 และมีใน aspnetcore-10.0 docs จึงใช้งานได้บน .NET 10 LTS แน่นอน. `IProblemDetailsService` มีทั้ง `TryWriteAsync` (since .NET 8) และ `WriteAsync` บน net-10.0 — โค้ดนี้ใช้ `TryWriteAsync`.
