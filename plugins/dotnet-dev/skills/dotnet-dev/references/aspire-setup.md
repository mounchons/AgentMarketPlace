# .NET Aspire Setup & Configuration (Aspire 13 / .NET 10)

> ✅ ทุก API ในไฟล์นี้ตรวจกับ Microsoft Learn (Aspire 13.1.0 / EF Core 10 / .NET 10) แล้ว
> ⚠️ Aspire เลขเวอร์ชันกระโดด 9.x → **13.0** (ข้าม 10-12) — ตรวจเวอร์ชันล่าสุดด้วย `microsoft_docs_search` ก่อนสร้างโปรเจคจริงเสมอ

## 1. Project Setup (Aspire CLI)

ตั้งแต่ Aspire 13 **ติดตั้งผ่าน Aspire CLI** (ไม่ใช่ `dotnet new aspire-starter` / ไม่ใช่ workload เก่า)

```bash
# 1) ติดตั้ง/อัปเดต Aspire CLI
curl -sSL https://aspire.dev/install.sh | bash       # bash
# PowerShell: Invoke-RestMethod -Uri "https://aspire.dev/install.ps1" | Invoke-Expression

# 2) ติดตั้ง project templates
dotnet new install Aspire.ProjectTemplates

# 3) สร้าง solution ใหม่
aspire new                 # interactive — เลือก template (starter / apphost-only)

# 4) รัน (เปิด dashboard อัตโนมัติ)
aspire run

# 5) อัปเกรดโปรเจคเดิม → 13.0 (แก้ Sdk + packages ให้เอง)
aspire update              # ถ้ามาจาก 8.x: upgrade 8.x → 9.x ก่อน (ลบ legacy workload) แล้วค่อย → 13.0
```

> Container runtime: ต้องมี OCI-compliant runtime (Docker Desktop / Podman) — ดู https://aspire.dev/get-started/prerequisites/

### Solution Structure
```
MyApp/
├── MyApp.AppHost/              # Orchestrator (Sdk=Aspire.AppHost.Sdk/13.0.0)
│   ├── AppHost.cs              # เดิมชื่อ Program.cs — Aspire 13 ใช้ AppHost.cs
│   └── MyApp.AppHost.csproj
├── MyApp.ServiceDefaults/      # Shared: OpenTelemetry, health checks, service discovery, resilience
├── MyApp.Api/                  # Web API
├── MyApp.Web/                  # Blazor/React frontend
└── MyApp.Worker/               # Background worker
```

### AppHost csproj (Aspire 13 — SDK encapsulates Aspire.Hosting.AppHost)
```xml
<!-- MyApp.AppHost/MyApp.AppHost.csproj -->
<Project Sdk="Aspire.AppHost.Sdk/13.0.0">

  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <IsAspireHost>true</IsAspireHost>
  </PropertyGroup>

  <ItemGroup>
    <!-- ไม่ต้อง reference Aspire.Hosting.AppHost — SDK รวมให้แล้ว -->
    <PackageReference Include="Aspire.Hosting.PostgreSQL" Version="13.0.0" />
    <PackageReference Include="Aspire.Hosting.SqlServer" Version="13.0.0" />
    <PackageReference Include="Aspire.Hosting.Redis" Version="13.0.0" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\MyApp.Api\MyApp.Api.csproj" />
  </ItemGroup>
</Project>
```

> v13 key changes (จาก docs): `Sdk="Aspire.AppHost.Sdk/13.0.0"` ใน `<Project>` ตรงๆ, ไม่มี `<Sdk Name="..." />` element, ไม่มี base `Microsoft.NET.Sdk`, target `net10.0`

---

## 2. AppHost Configuration (dual-DB: PostgreSQL + SQL Server)

```csharp
// MyApp.AppHost/AppHost.cs
var builder = DistributedApplication.CreateBuilder(args);

// ===== Parameters (secrets) =====
var dbPassword = builder.AddParameter("db-password", secret: true);

// ===== PostgreSQL =====
// WithLifetime(Persistent): คอนเทนเนอร์อยู่ข้าม run (ไม่ recreate ทุกครั้ง) → dev เร็วขึ้น
// AddPostgres มี built-in health check; WaitFor จะรอจน Postgres service requests ได้
var postgres = builder.AddPostgres("postgres", password: dbPassword)
    .WithLifetime(ContainerLifetime.Persistent)
    .WithDataVolume("postgres-data")
    .WithPgAdmin();
var appdb = postgres.AddDatabase("appdb");

// ===== SQL Server (provider ที่สองของ dual-DB) =====
var sqlServer = builder.AddSqlServer("sql", password: dbPassword)
    .WithLifetime(ContainerLifetime.Persistent)
    .WithDataVolume("sql-data");
var sqldb = sqlServer.AddDatabase("appdb-sql");

// ===== Redis =====
var redis = builder.AddRedis("redis")
    .WithLifetime(ContainerLifetime.Persistent)
    .WithDataVolume("redis-data")
    .WithRedisCommander();

// ===== API =====
// เลือก provider ตาม config (เปลี่ยน .WithReference(appdb) ↔ .WithReference(sqldb) ได้)
// WithHttpHealthCheck: Aspire 13 default เลือก endpoint https ก่อน (WithHttpsHealthCheck obsolete ตั้งแต่ 9.3)
var api = builder.AddProject<Projects.MyApp_Api>("api")
    .WithReference(appdb)
    .WithReference(redis)
    .WithHttpHealthCheck("/health")
    .WaitFor(appdb)
    .WaitFor(redis)
    .WithExternalHttpEndpoints();

// ===== Web frontend =====
builder.AddProject<Projects.MyApp_Web>("web")
    .WithReference(api)
    .WithHttpHealthCheck("/health")
    .WaitFor(api)
    .WithExternalHttpEndpoints();

builder.Build().Run();
```

> ❌ **อย่าใช้** `builder.AddDockerComposeEnvironment("infra", "./docker-compose.yml")` — signature นี้ไม่มีจริง (ไม่รับ path compose file สำหรับ import). ใช้ container resources ตรงๆ (`AddContainer`/`AddPostgres`/...) แทน

### Custom health check (associate กับ resource)
```csharp
builder.Services.AddHealthChecks().AddCheck("warmup", () =>
    DateTime.UtcNow > startTime.AddSeconds(10)
        ? HealthCheckResult.Healthy() : HealthCheckResult.Unhealthy());

var pg = builder.AddPostgres("pg").WithHealthCheck("warmup");
builder.AddProject<Projects.MyApp_Api>("api").WithReference(pg).WaitFor(pg);
```

### Single-file AppHost (prototype/learning — Aspire 13)
```csharp
// apphost.cs — ไม่ต้องมี .csproj (VS Code / CLI เท่านั้น; VS ยังไม่รองรับ)
#:sdk Aspire.AppHost.Sdk@13.0.0
#:package Aspire.Hosting.Redis@13.0.0

var builder = DistributedApplication.CreateBuilder(args);
var cache = builder.AddRedis("cache");
builder.AddProject("apiservice", "../MyApi").WithReference(cache).WaitFor(cache);
builder.Build().Run();
```

---

## 3. Service Defaults

> ServiceDefaults ส่วนใหญ่เหมือนเดิมข้ามเวอร์ชัน — OpenTelemetry + health checks + service discovery + standard resilience handler

```csharp
// MyApp.ServiceDefaults/Extensions.cs
public static class Extensions
{
    public static IHostApplicationBuilder AddServiceDefaults(this IHostApplicationBuilder builder)
    {
        builder.ConfigureOpenTelemetry();
        builder.AddDefaultHealthChecks();
        builder.Services.AddServiceDiscovery();
        builder.Services.ConfigureHttpClientDefaults(http =>
        {
            http.AddStandardResilienceHandler();   // Polly-based resilience (retry/circuit-breaker/timeout)
            http.AddServiceDiscovery();
        });
        return builder;
    }

    public static IHostApplicationBuilder ConfigureOpenTelemetry(this IHostApplicationBuilder builder)
    {
        builder.Logging.AddOpenTelemetry(o => { o.IncludeFormattedMessage = true; o.IncludeScopes = true; });
        builder.Services.AddOpenTelemetry()
            .WithMetrics(m => m.AddAspNetCoreInstrumentation().AddHttpClientInstrumentation().AddRuntimeInstrumentation())
            .WithTracing(t => t.AddAspNetCoreInstrumentation().AddHttpClientInstrumentation().AddEntityFrameworkCoreInstrumentation());
        builder.AddOpenTelemetryExporters();
        return builder;
    }

    private static IHostApplicationBuilder AddOpenTelemetryExporters(this IHostApplicationBuilder builder)
    {
        if (!string.IsNullOrWhiteSpace(builder.Configuration["OTEL_EXPORTER_OTLP_ENDPOINT"]))
            builder.Services.AddOpenTelemetry().UseOtlpExporter();
        return builder;
    }

    public static IHostApplicationBuilder AddDefaultHealthChecks(this IHostApplicationBuilder builder)
    {
        builder.Services.AddHealthChecks().AddCheck("self", () => HealthCheckResult.Healthy(), ["live"]);
        return builder;
    }

    public static WebApplication MapDefaultEndpoints(this WebApplication app)
    {
        app.MapHealthChecks("/health");
        app.MapHealthChecks("/alive", new HealthCheckOptions { Predicate = r => r.Tags.Contains("live") });
        return app;
    }
}
```

---

## 4. API Project Integration — Enrich vs Add (สำคัญสำหรับ Repo/UoW + Clean Architecture)

> ⚠️ **กับดัก double-registration**: ถ้า `AddInfrastructure()` ของคุณ register `DbContext` เองอยู่แล้ว (ตาม Clean Architecture / Repo+UoW) **อย่าใช้** `AddNpgsqlDbContext<T>()` / `AddSqlServerDbContext<T>()` เพราะมัน register `DbContext` ซ้ำ — ใช้ **`Enrich*DbContext<T>()`** แทน เพื่อเสริม retries + health check + logging + telemetry ให้ DbContext ที่ register ไว้แล้ว

```csharp
// MyApp.Api/Program.cs
var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

// 1) Infrastructure ของคุณ register DbContext เอง (provider เลือกตาม config)
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);   // ← register ApplicationDbContext + Repo/UoW

// 2) Enrich DbContext ที่มีอยู่ด้วย Aspire (retries/health/telemetry) — ไม่ register ซ้ำ
//    PostgreSQL:
builder.EnrichNpgsqlDbContext<ApplicationDbContext>(settings =>
{
    settings.DisableRetry = false;       // เปิด retry resilience
    settings.CommandTimeout = 30;
});
//    หรือ SQL Server:
// builder.EnrichSqlServerDbContext<ApplicationDbContext>();

// 3) Components ที่ Aspire register เอง (ไม่ชนกับ Infrastructure)
builder.AddRedisDistributedCache("redis");
builder.AddRedisOutputCache("redis");

// 4) API — built-in OpenAPI (.NET 9+) แทน Swashbuckle
builder.Services.AddControllers();
builder.Services.AddOpenApi();          // Microsoft.AspNetCore.OpenApi

var app = builder.Build();
app.MapDefaultEndpoints();              // /health + /alive

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();                   // /openapi/v1.json
    // UI เสริม (ถ้าต้องการ): app.MapScalarApiReference(); // Scalar.AspNetCore
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
```

> ถ้าให้ **Aspire register DbContext เอง** (ไม่มี Infrastructure แยก) ใช้ `builder.AddNpgsqlDbContext<ApplicationDbContext>("appdb")` / `builder.AddSqlServerDbContext<ApplicationDbContext>("appdb-sql")` — เลือกอย่างใดอย่างหนึ่ง อย่าผสมกับ Enrich
>
> Swashbuckle ถูกถอดจาก templates ตั้งแต่ .NET 9 (built-in OpenAPI แทน). `WithOpenApi()` ของ Minimal API deprecated ใน .NET 10 (ASPDEPR002) → ใช้ `AddOpenApiOperationTransformer` แทน

---

## 5. Worker Service Integration

```csharp
// MyApp.Worker/Program.cs
var builder = Host.CreateApplicationBuilder(args);
builder.AddServiceDefaults();

builder.Services.AddInfrastructure(builder.Configuration);
builder.EnrichNpgsqlDbContext<ApplicationDbContext>();   // หรือ AddNpgsqlDbContext ถ้าไม่มี Infrastructure
builder.AddRabbitMQClient("messaging");

builder.Services.AddHostedService<OrderProcessingWorker>();

var host = builder.Build();
host.Run();
```

---

## 6. Dashboard & Custom Metrics

```bash
aspire run                 # หรือ: dotnet run --project MyApp.AppHost
# Dashboard: https://localhost:17178 (resources / console logs / traces / metrics / structured logs)
```

```csharp
public class OrderService
{
    private readonly Counter<long> _ordersCreated;
    public OrderService(IMeterFactory meterFactory)
    {
        var meter = meterFactory.Create("MyApp.Orders");
        _ordersCreated = meter.CreateCounter<long>("orders.created", "orders", "Number of orders created");
    }

    public async Task<Order> CreateOrderAsync(CreateOrderCommand command, CancellationToken ct)
    {
        // ... process ...
        _ordersCreated.Add(1, new KeyValuePair<string, object?>("status", "success"));
        return order;
    }
}
```

---

## 7. Deployment (Aspire 13)

```bash
# Azure Container Apps (แนะนำ)
azd init        # ครั้งแรก
azd up          # provision + deploy

# หรือ aspire publish → artifacts (docker-compose / k8s ผ่าน publishers)
aspire publish -o ./artifacts
```

```csharp
// AppHost.cs — Azure provisioning
var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddAzurePostgresFlexibleServer("postgres")
    .RunAsContainer()                 // local dev: container; deploy: Azure Flexible Server
    .AddDatabase("appdb");

var api = builder.AddProject<Projects.MyApp_Api>("api")
    .WithReference(postgres)
    .WaitFor(postgres)
    .PublishAsAzureContainerApp((infra, app) =>
    {
        app.Configuration.Ingress = new ContainerAppIngressConfiguration { External = true, TargetPort = 8080 };
    });

builder.Build().Run();
```

> EF migrations ใน production: ใช้ migration bundle (`dotnet ef migrations bundle`) + dedicated migration service pattern — ดู `efcore-patterns` skill (NoTracking, query splitting, dedicated migration service)

---

## 8. Testing with Aspire

```csharp
// Aspire.Hosting.Testing — DistributedApplicationTestingBuilder
[Collection("Aspire")]
public class IntegrationTests
{
    [Fact]
    public async Task FullWorkflow_Success()
    {
        var appHost = await DistributedApplicationTestingBuilder.CreateAsync<Projects.MyApp_AppHost>();
        await using var app = await appHost.BuildAsync();
        await app.StartAsync();

        var http = app.CreateHttpClient("api");
        var res = await http.GetAsync("/health");
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
    }
}
```

> สำหรับ DB integration tests (Testcontainers + Respawn, dual-DB Postgres + SQL Server) ดู `references/testing-patterns.md`

---

## เวอร์ชันที่อ้างอิง (ตรวจ ณ 2026-06-13)

| Component | Version | หมายเหตุ |
|-----------|---------|----------|
| .NET | 10 (LTS) | support ถึง Nov 2028 |
| Aspire.Hosting | 13.1.0 | `Sdk=Aspire.AppHost.Sdk/13.0.0` |
| Aspire.Npgsql.EntityFrameworkCore.PostgreSQL | 13.1.0 | `Enrich`/`AddNpgsqlDbContext` |
| Aspire.Microsoft.EntityFrameworkCore.SqlServer | 13.1.0 | `Enrich`/`AddSqlServerDbContext` |

> ⚠️ Aspire ปล่อยเวอร์ชันบ่อย — รัน `microsoft_docs_search "Aspire current version"` ก่อนสร้างโปรเจคจริงเพื่อ pin เวอร์ชันล่าสุด
