# Phase A: 56-1 One Report MVP — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a working MVP where Thai listed companies can sign up, enter ESG data, and generate the ESG section of 56-1 One Report as Word/PDF.

**Architecture:** Modular Monolith — ASP.NET Core 9 API (Minimal APIs) + Next.js 15 (App Router) + PostgreSQL 17 (RLS) + Redis 7. Each backend module is a separate class library. Frontend uses shadcn/ui + AG Grid Community + next-intl for i18n.

**Tech Stack:** .NET 9, EF Core 9, PostgreSQL 17, Redis 7, FluentValidation, QuestPDF, DocumentFormat.OpenXml, MailKit, Next.js 15, TypeScript, shadcn/ui, Tailwind CSS, AG Grid Community, next-intl, Recharts

**Skills Required:**
- Backend code: `dotnet-dev` skill
- EF Core: `efcore-patterns` skill
- API design: `api-design` skill
- UI design: `frontend-design` skill
- Next.js code: `vercel-react-best-practices` skill
- Commits: `commit-commands:commit` skill

**Design Doc:** `docs/plans/2026-03-08-thai-esg-hub-design.md`

---

## Task Overview (Build Order)

```
Task 1:  Solution Scaffolding + Docker Compose
Task 2:  SharedKernel — Base Entities + Interfaces
Task 3:  Infrastructure — DbContext + Multi-tenant RLS
Task 4:  Identity Module — JWT Auth + User Management
Task 5:  Tenants Module — Organization + Sites + Periods
Task 6:  ESG Module — Metrics Library + Framework Mappings
Task 7:  ESG Module — Data Points + Review Workflow
Task 8:  ESG Module — Task Management + Email Notifications
Task 9:  Reporting Module — One Report Generator + Export
Task 10: Audit Module — Audit Trail + Evidence Management
Task 11: Frontend Scaffolding — Next.js + i18n + shadcn/ui + AG Grid
Task 12: Frontend — Auth Pages (Login, Register, Forgot Password)
Task 13: Frontend — Onboarding Wizard
Task 14: Frontend — Settings Pages (Org, Sites, Users, Periods)
Task 15: Frontend — ESG Metric Library + Framework Explorer
Task 16: Frontend — Data Entry + Data Review
Task 17: Frontend — Task Management
Task 18: Frontend — One Report Generator + GRI Content Index
Task 19: Frontend — Dashboard
Task 20: Frontend — Audit Trail
Task 21: Landing Page (Public)
Task 22: Docker Compose Production + CI/CD
Task 23: Seed Data — ESG Metrics + Framework Mappings
```

**Dependencies:**
```
Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6 → Task 7 → Task 8 → Task 9 → Task 10
Task 1 → Task 11 → Task 12 → Task 13 → Task 14 → Task 15 → Task 16 → Task 17 → Task 18 → Task 19 → Task 20 → Task 21
Task 3 → Task 23
Task 10 + Task 20 → Task 22
```

---

## Task 1: Solution Scaffolding + Docker Compose (Dev)

**Goal:** Create the .NET solution structure, all project references, and a docker-compose for local development with PostgreSQL 17 + Redis 7.

**Files:**
- Create: `ThaiEsgHub.sln`
- Create: `src/ThaiEsgHub.Api/ThaiEsgHub.Api.csproj`
- Create: `src/ThaiEsgHub.Api/Program.cs`
- Create: `src/ThaiEsgHub.Api/appsettings.json`
- Create: `src/ThaiEsgHub.Api/appsettings.Development.json`
- Create: `src/ThaiEsgHub.SharedKernel/ThaiEsgHub.SharedKernel.csproj`
- Create: `src/ThaiEsgHub.Infrastructure/ThaiEsgHub.Infrastructure.csproj`
- Create: `src/ThaiEsgHub.Modules.Identity/ThaiEsgHub.Modules.Identity.csproj`
- Create: `src/ThaiEsgHub.Modules.Tenants/ThaiEsgHub.Modules.Tenants.csproj`
- Create: `src/ThaiEsgHub.Modules.ESG/ThaiEsgHub.Modules.ESG.csproj`
- Create: `src/ThaiEsgHub.Modules.Reporting/ThaiEsgHub.Modules.Reporting.csproj`
- Create: `tests/ThaiEsgHub.Tests/ThaiEsgHub.Tests.csproj`
- Create: `docker-compose.dev.yml`
- Create: `.gitignore`
- Create: `.editorconfig`

**Step 1: Create solution and all projects**

```bash
# Create solution
dotnet new sln -n ThaiEsgHub

# Create projects
dotnet new classlib -n ThaiEsgHub.SharedKernel -o src/ThaiEsgHub.SharedKernel -f net9.0
dotnet new classlib -n ThaiEsgHub.Infrastructure -o src/ThaiEsgHub.Infrastructure -f net9.0
dotnet new classlib -n ThaiEsgHub.Modules.Identity -o src/ThaiEsgHub.Modules.Identity -f net9.0
dotnet new classlib -n ThaiEsgHub.Modules.Tenants -o src/ThaiEsgHub.Modules.Tenants -f net9.0
dotnet new classlib -n ThaiEsgHub.Modules.ESG -o src/ThaiEsgHub.Modules.ESG -f net9.0
dotnet new classlib -n ThaiEsgHub.Modules.Reporting -o src/ThaiEsgHub.Modules.Reporting -f net9.0
dotnet new webapi -n ThaiEsgHub.Api -o src/ThaiEsgHub.Api -f net9.0 --no-openapi
dotnet new xunit -n ThaiEsgHub.Tests -o tests/ThaiEsgHub.Tests -f net9.0

# Add projects to solution
dotnet sln add src/ThaiEsgHub.SharedKernel
dotnet sln add src/ThaiEsgHub.Infrastructure
dotnet sln add src/ThaiEsgHub.Modules.Identity
dotnet sln add src/ThaiEsgHub.Modules.Tenants
dotnet sln add src/ThaiEsgHub.Modules.ESG
dotnet sln add src/ThaiEsgHub.Modules.Reporting
dotnet sln add src/ThaiEsgHub.Api
dotnet sln add tests/ThaiEsgHub.Tests
```

**Step 2: Add project references**

```bash
# Infrastructure depends on SharedKernel
dotnet add src/ThaiEsgHub.Infrastructure reference src/ThaiEsgHub.SharedKernel

# Each module depends on SharedKernel
dotnet add src/ThaiEsgHub.Modules.Identity reference src/ThaiEsgHub.SharedKernel
dotnet add src/ThaiEsgHub.Modules.Tenants reference src/ThaiEsgHub.SharedKernel
dotnet add src/ThaiEsgHub.Modules.ESG reference src/ThaiEsgHub.SharedKernel
dotnet add src/ThaiEsgHub.Modules.Reporting reference src/ThaiEsgHub.SharedKernel

# Each module depends on Infrastructure (for DbContext, etc.)
dotnet add src/ThaiEsgHub.Modules.Identity reference src/ThaiEsgHub.Infrastructure
dotnet add src/ThaiEsgHub.Modules.Tenants reference src/ThaiEsgHub.Infrastructure
dotnet add src/ThaiEsgHub.Modules.ESG reference src/ThaiEsgHub.Infrastructure
dotnet add src/ThaiEsgHub.Modules.Reporting reference src/ThaiEsgHub.Infrastructure

# Reporting depends on ESG module (needs ESG data for reports)
dotnet add src/ThaiEsgHub.Modules.Reporting reference src/ThaiEsgHub.Modules.ESG

# API depends on all modules + Infrastructure
dotnet add src/ThaiEsgHub.Api reference src/ThaiEsgHub.Infrastructure
dotnet add src/ThaiEsgHub.Api reference src/ThaiEsgHub.Modules.Identity
dotnet add src/ThaiEsgHub.Api reference src/ThaiEsgHub.Modules.Tenants
dotnet add src/ThaiEsgHub.Api reference src/ThaiEsgHub.Modules.ESG
dotnet add src/ThaiEsgHub.Api reference src/ThaiEsgHub.Modules.Reporting

# Tests depend on everything
dotnet add tests/ThaiEsgHub.Tests reference src/ThaiEsgHub.SharedKernel
dotnet add tests/ThaiEsgHub.Tests reference src/ThaiEsgHub.Infrastructure
dotnet add tests/ThaiEsgHub.Tests reference src/ThaiEsgHub.Modules.Identity
dotnet add tests/ThaiEsgHub.Tests reference src/ThaiEsgHub.Modules.Tenants
dotnet add tests/ThaiEsgHub.Tests reference src/ThaiEsgHub.Modules.ESG
dotnet add tests/ThaiEsgHub.Tests reference src/ThaiEsgHub.Modules.Reporting
```

**Step 3: Add NuGet packages**

```bash
# SharedKernel — minimal
# (no external packages — pure domain)

# Infrastructure
dotnet add src/ThaiEsgHub.Infrastructure package Microsoft.EntityFrameworkCore --version 9.*
dotnet add src/ThaiEsgHub.Infrastructure package Npgsql.EntityFrameworkCore.PostgreSQL --version 9.*
dotnet add src/ThaiEsgHub.Infrastructure package Microsoft.EntityFrameworkCore.Design --version 9.*
dotnet add src/ThaiEsgHub.Infrastructure package Microsoft.Extensions.Caching.StackExchangeRedis
dotnet add src/ThaiEsgHub.Infrastructure package MailKit

# Identity module
dotnet add src/ThaiEsgHub.Modules.Identity package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add src/ThaiEsgHub.Modules.Identity package BCrypt.Net-Next
dotnet add src/ThaiEsgHub.Modules.Identity package FluentValidation.DependencyInjectionExtensions

# Other modules — FluentValidation
dotnet add src/ThaiEsgHub.Modules.Tenants package FluentValidation.DependencyInjectionExtensions
dotnet add src/ThaiEsgHub.Modules.ESG package FluentValidation.DependencyInjectionExtensions

# Reporting module
dotnet add src/ThaiEsgHub.Modules.Reporting package QuestPDF
dotnet add src/ThaiEsgHub.Modules.Reporting package DocumentFormat.OpenXml

# API
dotnet add src/ThaiEsgHub.Api package Serilog.AspNetCore
dotnet add src/ThaiEsgHub.Api package Serilog.Sinks.Console
dotnet add src/ThaiEsgHub.Api package Swashbuckle.AspNetCore

# Tests
dotnet add tests/ThaiEsgHub.Tests package Microsoft.EntityFrameworkCore.InMemory --version 9.*
dotnet add tests/ThaiEsgHub.Tests package FluentAssertions
dotnet add tests/ThaiEsgHub.Tests package NSubstitute
```

**Step 4: Create docker-compose.dev.yml**

```yaml
# docker-compose.dev.yml
services:
  postgres:
    image: postgres:17-alpine
    container_name: thaiesghub-postgres
    environment:
      POSTGRES_DB: thaiesghub
      POSTGRES_USER: thaiesghub
      POSTGRES_PASSWORD: dev_password_123
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: thaiesghub-redis
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
```

**Step 5: Create appsettings.Development.json**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=thaiesghub;Username=thaiesghub;Password=dev_password_123",
    "Redis": "localhost:6379"
  },
  "Jwt": {
    "Secret": "dev-secret-key-at-least-32-characters-long-for-hmac-sha256",
    "Issuer": "thaiesghub-dev",
    "Audience": "thaiesghub-dev",
    "ExpirationMinutes": 60,
    "RefreshExpirationDays": 7
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.EntityFrameworkCore": "Warning"
    }
  }
}
```

**Step 6: Create minimal Program.cs**

```csharp
// src/ThaiEsgHub.Api/Program.cs
var builder = WebApplication.CreateBuilder(args);

// Add Swagger for dev
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS for Next.js frontend
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();

app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

app.Run();
```

**Step 7: Create .gitignore and .editorconfig**

`.gitignore` — standard .NET + Node.js gitignore (bin/, obj/, node_modules/, .env, etc.)

`.editorconfig` — standard C# + TypeScript settings (4 spaces indent, UTF-8, etc.)

**Step 8: Verify build and run**

```bash
docker compose -f docker-compose.dev.yml up -d
dotnet build
dotnet run --project src/ThaiEsgHub.Api
# Visit http://localhost:5000/health → { "status": "healthy" }
# Visit http://localhost:5000/swagger → Swagger UI
```

**Step 9: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold solution structure with modular monolith architecture"
```

---

## Task 2: SharedKernel — Base Entities + Interfaces

**Goal:** Create base classes and interfaces that ALL modules will use: base entity with audit fields, tenant interface, pagination, and common result types.

**Files:**
- Create: `src/ThaiEsgHub.SharedKernel/Entities/BaseEntity.cs`
- Create: `src/ThaiEsgHub.SharedKernel/Entities/ITenantEntity.cs`
- Create: `src/ThaiEsgHub.SharedKernel/Entities/IAuditableEntity.cs`
- Create: `src/ThaiEsgHub.SharedKernel/Entities/ISoftDeletable.cs`
- Create: `src/ThaiEsgHub.SharedKernel/Models/Result.cs`
- Create: `src/ThaiEsgHub.SharedKernel/Models/PagedRequest.cs`
- Create: `src/ThaiEsgHub.SharedKernel/Models/PagedResult.cs`
- Create: `src/ThaiEsgHub.SharedKernel/Interfaces/ICurrentUser.cs`
- Create: `src/ThaiEsgHub.SharedKernel/Interfaces/ICurrentTenant.cs`
- Create: `src/ThaiEsgHub.SharedKernel/Enums/UserRole.cs`
- Create: `src/ThaiEsgHub.SharedKernel/Enums/DataPointStatus.cs`
- Create: `src/ThaiEsgHub.SharedKernel/Enums/PeriodStatus.cs`
- Create: `src/ThaiEsgHub.SharedKernel/Enums/TaskStatus.cs`
- Test: `tests/ThaiEsgHub.Tests/SharedKernel/ResultTests.cs`

**Step 1: Write tests for Result type**

```csharp
// tests/ThaiEsgHub.Tests/SharedKernel/ResultTests.cs
public class ResultTests
{
    [Fact]
    public void Success_ShouldCreateSuccessResult()
    {
        var result = Result.Success();
        result.IsSuccess.Should().BeTrue();
        result.Error.Should().BeNull();
    }

    [Fact]
    public void Failure_ShouldCreateFailureResult()
    {
        var result = Result.Failure("Something went wrong");
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be("Something went wrong");
    }

    [Fact]
    public void GenericSuccess_ShouldContainValue()
    {
        var result = Result<int>.Success(42);
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Be(42);
    }
}
```

**Step 2: Run test to verify it fails**

```bash
dotnet test tests/ThaiEsgHub.Tests --filter "ResultTests"
```
Expected: FAIL — Result class doesn't exist

**Step 3: Implement all SharedKernel types**

Create `BaseEntity.cs`:
```csharp
namespace ThaiEsgHub.SharedKernel.Entities;

public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
}

public abstract class BaseEntity<TKey>
{
    public TKey Id { get; set; } = default!;
}
```

Create `ITenantEntity.cs`:
```csharp
namespace ThaiEsgHub.SharedKernel.Entities;

public interface ITenantEntity
{
    Guid TenantId { get; set; }
}
```

Create `IAuditableEntity.cs`:
```csharp
namespace ThaiEsgHub.SharedKernel.Entities;

public interface IAuditableEntity
{
    DateTime CreatedAt { get; set; }
    Guid? CreatedBy { get; set; }
    DateTime? UpdatedAt { get; set; }
    Guid? UpdatedBy { get; set; }
}
```

Create `ISoftDeletable.cs`:
```csharp
namespace ThaiEsgHub.SharedKernel.Entities;

public interface ISoftDeletable
{
    bool IsDeleted { get; set; }
    DateTime? DeletedAt { get; set; }
}
```

Create `Result.cs`:
```csharp
namespace ThaiEsgHub.SharedKernel.Models;

public class Result
{
    public bool IsSuccess { get; }
    public string? Error { get; }

    protected Result(bool isSuccess, string? error)
    {
        IsSuccess = isSuccess;
        Error = error;
    }

    public static Result Success() => new(true, null);
    public static Result Failure(string error) => new(false, error);
}

public class Result<T> : Result
{
    public T? Value { get; }

    private Result(bool isSuccess, T? value, string? error) : base(isSuccess, error)
    {
        Value = value;
    }

    public static Result<T> Success(T value) => new(true, value, null);
    public new static Result<T> Failure(string error) => new(false, default, error);
}
```

Create `PagedRequest.cs`:
```csharp
namespace ThaiEsgHub.SharedKernel.Models;

public class PagedRequest
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 25;
    public string? SortBy { get; set; }
    public string SortDir { get; set; } = "asc";
    public Dictionary<string, string>? Filters { get; set; }
}
```

Create `PagedResult.cs`:
```csharp
namespace ThaiEsgHub.SharedKernel.Models;

public class PagedResult<T>
{
    public List<T> Items { get; set; } = [];
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasNext => Page < TotalPages;
    public bool HasPrevious => Page > 1;
}
```

Create `ICurrentUser.cs`:
```csharp
namespace ThaiEsgHub.SharedKernel.Interfaces;

public interface ICurrentUser
{
    Guid? UserId { get; }
    Guid? TenantId { get; }
    string? Email { get; }
    string? Role { get; }
    bool IsAuthenticated { get; }
}
```

Create `ICurrentTenant.cs`:
```csharp
namespace ThaiEsgHub.SharedKernel.Interfaces;

public interface ICurrentTenant
{
    Guid? TenantId { get; }
}
```

Create all Enums:
```csharp
// Enums/UserRole.cs
namespace ThaiEsgHub.SharedKernel.Enums;
public enum UserRole { Admin, Director, Manager, Collector, Reviewer, Executive, Auditor }

// Enums/DataPointStatus.cs
public enum DataPointStatus { Draft, Submitted, UnderReview, Approved, Rejected }

// Enums/PeriodStatus.cs
public enum PeriodStatus { Draft, InProgress, UnderReview, Approved, Published }

// Enums/TaskStatus.cs — use EsgTaskStatus to avoid conflict with System.Threading.Tasks.TaskStatus
public enum EsgTaskStatus { Pending, InProgress, Completed, Overdue }
```

**Step 4: Run tests to verify they pass**

```bash
dotnet test tests/ThaiEsgHub.Tests --filter "ResultTests"
```
Expected: 3 PASSED

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add SharedKernel with base entities, Result type, pagination, enums"
```

---

## Task 3: Infrastructure — DbContext + Multi-tenant RLS

**Goal:** Create the EF Core DbContext with multi-tenant support (Global Query Filters + PostgreSQL session variable for RLS), automatic audit trail population, and the initial migration.

**Files:**
- Create: `src/ThaiEsgHub.Infrastructure/Data/AppDbContext.cs`
- Create: `src/ThaiEsgHub.Infrastructure/Data/TenantInterceptor.cs`
- Create: `src/ThaiEsgHub.Infrastructure/Data/AuditInterceptor.cs`
- Create: `src/ThaiEsgHub.Infrastructure/Services/CurrentUser.cs`
- Create: `src/ThaiEsgHub.Infrastructure/DependencyInjection.cs`
- Modify: `src/ThaiEsgHub.Api/Program.cs` — register Infrastructure services
- Test: `tests/ThaiEsgHub.Tests/Infrastructure/MultiTenantTests.cs`

**Step 1: Write test for multi-tenant query filter**

```csharp
// tests/ThaiEsgHub.Tests/Infrastructure/MultiTenantTests.cs
public class MultiTenantTests
{
    [Fact]
    public async Task QueryFilter_ShouldOnlyReturnCurrentTenantData()
    {
        // This test verifies that when TenantId is set,
        // only data for that tenant is returned.
        // Implementation uses InMemory provider for unit test.
        // Integration test with PostgreSQL RLS comes later.
    }
}
```

**Step 2: Create AppDbContext with tenant filter**

```csharp
// src/ThaiEsgHub.Infrastructure/Data/AppDbContext.cs
namespace ThaiEsgHub.Infrastructure.Data;

public class AppDbContext : DbContext
{
    private readonly ICurrentTenant _currentTenant;

    public AppDbContext(DbContextOptions<AppDbContext> options, ICurrentTenant currentTenant)
        : base(options)
    {
        _currentTenant = currentTenant;
    }

    // DbSets will be added as each module entity is created
    // (They are registered via OnModelCreating + assembly scanning)

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all entity configurations from all module assemblies
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // Apply global query filter for all ITenantEntity
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(ITenantEntity).IsAssignableFrom(entityType.ClrType))
            {
                modelBuilder.Entity(entityType.ClrType)
                    .AddQueryFilter<ITenantEntity>(e => e.TenantId == _currentTenant.TenantId);
            }

            if (typeof(ISoftDeletable).IsAssignableFrom(entityType.ClrType))
            {
                modelBuilder.Entity(entityType.ClrType)
                    .AddQueryFilter<ISoftDeletable>(e => !e.IsDeleted);
            }
        }
    }
}
```

Note: The `AddQueryFilter` extension method handles combining multiple filters. Implementation detail — use expression visitor to AND-combine filters on the same entity.

**Step 3: Create TenantInterceptor for PostgreSQL RLS session variable**

```csharp
// src/ThaiEsgHub.Infrastructure/Data/TenantInterceptor.cs
// This interceptor sets the PostgreSQL session variable `app.current_tenant`
// before each command, so RLS policies can use it as a second layer of defense.

public class TenantInterceptor : DbConnectionInterceptor
{
    private readonly ICurrentTenant _currentTenant;

    public TenantInterceptor(ICurrentTenant currentTenant)
    {
        _currentTenant = currentTenant;
    }

    public override async ValueTask<InterceptionResult> ConnectionOpeningAsync(
        DbConnection connection, ConnectionEventData eventData, InterceptionResult result,
        CancellationToken cancellationToken = default)
    {
        var baseResult = await base.ConnectionOpeningAsync(connection, eventData, result, cancellationToken);
        return baseResult;
    }

    public override async Task ConnectionOpenedAsync(
        DbConnection connection, ConnectionEndEventData eventData,
        CancellationToken cancellationToken = default)
    {
        if (_currentTenant.TenantId.HasValue)
        {
            await using var cmd = connection.CreateCommand();
            cmd.CommandText = $"SET app.current_tenant = '{_currentTenant.TenantId.Value}'";
            await cmd.ExecuteNonQueryAsync(cancellationToken);
        }
        await base.ConnectionOpenedAsync(connection, eventData, cancellationToken);
    }
}
```

**Step 4: Create AuditInterceptor for automatic audit fields**

```csharp
// src/ThaiEsgHub.Infrastructure/Data/AuditInterceptor.cs
// Automatically sets CreatedAt/CreatedBy/UpdatedAt/UpdatedBy on SaveChanges

public class AuditInterceptor : SaveChangesInterceptor
{
    private readonly ICurrentUser _currentUser;

    public AuditInterceptor(ICurrentUser currentUser)
    {
        _currentUser = currentUser;
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData, InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        var context = eventData.Context;
        if (context is null) return base.SavingChangesAsync(eventData, result, cancellationToken);

        foreach (var entry in context.ChangeTracker.Entries<IAuditableEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = DateTime.UtcNow;
                entry.Entity.CreatedBy = _currentUser.UserId;
            }
            if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = DateTime.UtcNow;
                entry.Entity.UpdatedBy = _currentUser.UserId;
            }
        }

        // Auto-set TenantId for new tenant entities
        foreach (var entry in context.ChangeTracker.Entries<ITenantEntity>())
        {
            if (entry.State == EntityState.Added && entry.Entity.TenantId == Guid.Empty)
            {
                if (_currentUser.TenantId.HasValue)
                    entry.Entity.TenantId = _currentUser.TenantId.Value;
            }
        }

        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }
}
```

**Step 5: Create CurrentUser service**

```csharp
// src/ThaiEsgHub.Infrastructure/Services/CurrentUser.cs
// Reads user info from HttpContext (JWT claims)

public class CurrentUser : ICurrentUser, ICurrentTenant
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUser(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? UserId => GetClaimGuid("sub");
    public Guid? TenantId => GetClaimGuid("tenant_id");
    public string? Email => GetClaim("email");
    public string? Role => GetClaim("role");
    public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;

    private string? GetClaim(string type) =>
        _httpContextAccessor.HttpContext?.User?.FindFirst(type)?.Value;

    private Guid? GetClaimGuid(string type)
    {
        var value = GetClaim(type);
        return Guid.TryParse(value, out var guid) ? guid : null;
    }
}
```

**Step 6: Create DependencyInjection for Infrastructure**

```csharp
// src/ThaiEsgHub.Infrastructure/DependencyInjection.cs
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // DbContext
        services.AddDbContext<AppDbContext>((sp, options) =>
        {
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"));
            options.AddInterceptors(
                sp.GetRequiredService<TenantInterceptor>(),
                sp.GetRequiredService<AuditInterceptor>()
            );
        });

        // Redis
        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = configuration.GetConnectionString("Redis");
            options.InstanceName = "thaiesghub:";
        });

        // Services
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUser, CurrentUser>();
        services.AddScoped<ICurrentTenant>(sp => (ICurrentTenant)sp.GetRequiredService<ICurrentUser>());
        services.AddScoped<TenantInterceptor>();
        services.AddScoped<AuditInterceptor>();

        return services;
    }
}
```

**Step 7: Update Program.cs**

```csharp
// Add to Program.cs
builder.Services.AddInfrastructure(builder.Configuration);
```

**Step 8: Run tests + verify build**

```bash
dotnet build
dotnet test tests/ThaiEsgHub.Tests
```

**Step 9: Commit**

```bash
git add .
git commit -m "feat: add Infrastructure with DbContext, multi-tenant RLS, audit interceptor"
```

---

## Task 4: Identity Module — JWT Auth + User Management

**Goal:** Register/login users, issue JWT tokens, manage users within a tenant. The first user who registers creates the tenant and becomes Admin.

**Files:**
- Create: `src/ThaiEsgHub.Modules.Identity/Entities/User.cs`
- Create: `src/ThaiEsgHub.Modules.Identity/Entities/Tenant.cs`
- Create: `src/ThaiEsgHub.Modules.Identity/Entities/RefreshToken.cs`
- Create: `src/ThaiEsgHub.Modules.Identity/DTOs/AuthDtos.cs`
- Create: `src/ThaiEsgHub.Modules.Identity/DTOs/UserDtos.cs`
- Create: `src/ThaiEsgHub.Modules.Identity/Services/AuthService.cs`
- Create: `src/ThaiEsgHub.Modules.Identity/Services/JwtService.cs`
- Create: `src/ThaiEsgHub.Modules.Identity/Services/UserService.cs`
- Create: `src/ThaiEsgHub.Modules.Identity/Validators/RegisterValidator.cs`
- Create: `src/ThaiEsgHub.Modules.Identity/Endpoints/AuthEndpoints.cs`
- Create: `src/ThaiEsgHub.Modules.Identity/Endpoints/UserEndpoints.cs`
- Create: `src/ThaiEsgHub.Modules.Identity/DependencyInjection.cs`
- Create: `src/ThaiEsgHub.Infrastructure/Data/Configurations/UserConfiguration.cs`
- Create: `src/ThaiEsgHub.Infrastructure/Data/Configurations/TenantConfiguration.cs`
- Test: `tests/ThaiEsgHub.Tests/Identity/AuthServiceTests.cs`
- Test: `tests/ThaiEsgHub.Tests/Identity/JwtServiceTests.cs`

**Key Design Decisions:**
- Registration creates Tenant + first User (Admin) in one transaction
- JWT access token (short-lived, 60 min) + Refresh token (long-lived, 7 days)
- JWT stored in httpOnly cookie (set by API, read by API)
- Passwords hashed with BCrypt
- User entity belongs to a Tenant (ITenantEntity)

**API Endpoints:**

```
POST /api/auth/register     → { companyName, taxId, industryGroup, email, password, fullName }
POST /api/auth/login        → { email, password } → Set JWT cookie
POST /api/auth/refresh      → Refresh token rotation
POST /api/auth/logout       → Clear JWT cookie
GET  /api/auth/me           → Current user info

GET    /api/users           → List users in tenant (AG Grid: paginated, sorted, filtered)
POST   /api/users           → Create user (Admin only)
GET    /api/users/{id}      → Get user detail
PUT    /api/users/{id}      → Update user
DELETE /api/users/{id}      → Soft delete user (Admin only)
```

**Step 1: Write test for AuthService.Register**

Test: Register should create tenant + admin user, return JWT.

**Step 2: Write test for JwtService**

Test: GenerateToken should include correct claims (sub, tenant_id, email, role).

**Step 3: Implement entities (User, Tenant, RefreshToken)**

**Step 4: Implement JwtService**

**Step 5: Implement AuthService (Register, Login, Refresh)**

**Step 6: Implement UserService (CRUD)**

**Step 7: Implement Minimal API endpoints**

**Step 8: Add EF Core configurations + migration**

```bash
dotnet ef migrations add InitialCreate --project src/ThaiEsgHub.Infrastructure --startup-project src/ThaiEsgHub.Api
dotnet ef database update --project src/ThaiEsgHub.Infrastructure --startup-project src/ThaiEsgHub.Api
```

**Step 9: Run tests + manual test via Swagger**

```bash
dotnet test tests/ThaiEsgHub.Tests --filter "Auth"
dotnet run --project src/ThaiEsgHub.Api
# Test: POST /api/auth/register via Swagger
```

**Step 10: Commit**

```bash
git add .
git commit -m "feat: add Identity module with JWT auth, user management, tenant creation"
```

---

## Task 5: Tenants Module — Organization + Sites + Periods

**Goal:** CRUD for organization settings, sites/locations, departments, and reporting periods within a tenant.

**Files:**
- Create: `src/ThaiEsgHub.Modules.Tenants/Entities/Site.cs`
- Create: `src/ThaiEsgHub.Modules.Tenants/Entities/Department.cs`
- Create: `src/ThaiEsgHub.Modules.Tenants/Entities/ReportingPeriod.cs`
- Create: `src/ThaiEsgHub.Modules.Tenants/DTOs/` (SiteDtos, DepartmentDtos, PeriodDtos, OrganizationDtos)
- Create: `src/ThaiEsgHub.Modules.Tenants/Services/` (SiteService, DepartmentService, PeriodService, OrganizationService)
- Create: `src/ThaiEsgHub.Modules.Tenants/Endpoints/` (SiteEndpoints, DepartmentEndpoints, PeriodEndpoints, OrganizationEndpoints)
- Create: `src/ThaiEsgHub.Modules.Tenants/DependencyInjection.cs`
- Test: `tests/ThaiEsgHub.Tests/Tenants/SiteServiceTests.cs`
- Test: `tests/ThaiEsgHub.Tests/Tenants/PeriodServiceTests.cs`

**API Endpoints:**

```
GET/PUT  /api/organization                → Get/update organization settings

GET/POST /api/sites                       → List/create sites (AG Grid pagination)
GET/PUT/DELETE /api/sites/{id}            → CRUD single site

GET/POST /api/sites/{siteId}/departments  → List/create departments
PUT/DELETE /api/departments/{id}          → Update/delete department

GET/POST /api/reporting-periods           → List/create periods
GET/PUT  /api/reporting-periods/{id}      → Get/update period
PUT      /api/reporting-periods/{id}/status → Change period status
```

**Key Business Rules:**
- Site types: office, factory, warehouse, other
- Period statuses follow: Draft → InProgress → UnderReview → Approved → Published
- Only one period can be marked as baseline
- Period cannot be deleted if it has data points

**Steps:** Follow same pattern as Task 4 — tests → entities → services → endpoints → migration → commit.

**Commit message:** `feat: add Tenants module with sites, departments, reporting periods`

---

## Task 6: ESG Module — Metrics Library + Framework Mappings

**Goal:** Built-in ESG metrics library mapped to GRI/SASB/SDG/SET frameworks. Users can browse, search, and select metrics for their reporting set.

**Files:**
- Create: `src/ThaiEsgHub.Modules.ESG/Entities/EsgMetric.cs`
- Create: `src/ThaiEsgHub.Modules.ESG/Entities/FrameworkMapping.cs`
- Create: `src/ThaiEsgHub.Modules.ESG/Entities/TenantMetricSelection.cs`
- Create: `src/ThaiEsgHub.Modules.ESG/DTOs/` (MetricDtos, FrameworkDtos)
- Create: `src/ThaiEsgHub.Modules.ESG/Services/MetricService.cs`
- Create: `src/ThaiEsgHub.Modules.ESG/Services/FrameworkExplorerService.cs`
- Create: `src/ThaiEsgHub.Modules.ESG/Endpoints/MetricEndpoints.cs`
- Create: `src/ThaiEsgHub.Modules.ESG/Endpoints/FrameworkEndpoints.cs`
- Create: `src/ThaiEsgHub.Modules.ESG/DependencyInjection.cs`
- Test: `tests/ThaiEsgHub.Tests/ESG/MetricServiceTests.cs`

**API Endpoints:**

```
GET  /api/esg/metrics                        → List all metrics (AG Grid: paginated, filtered by category/framework/industry)
GET  /api/esg/metrics/{id}                   → Get metric detail with framework mappings
POST /api/esg/metrics                        → Create custom metric (tenant-specific)

GET  /api/esg/frameworks                     → List available frameworks
GET  /api/esg/frameworks/{code}/metrics      → List metrics for specific framework (e.g., GRI, SET)
GET  /api/esg/frameworks/cross-reference     → Cross-reference view (metric → all framework codes)

GET  /api/esg/reporting-set                  → Get tenant's selected metrics
POST /api/esg/reporting-set                  → Save tenant's selected metrics (list of metric IDs)
GET  /api/esg/reporting-set/recommendations  → Get recommended metrics by industry group
```

**Key Design:**
- `esg_metrics` with `is_system=true` are global (no tenant_id filter)
- `esg_metrics` with `is_system=false` are tenant-specific custom metrics
- `framework_mappings` are global reference data
- `tenant_metric_selections` tracks which metrics each tenant has chosen to report
- EF Core query filter for esg_metrics: `WHERE tenant_id = current OR is_system = true`

**Steps:** Tests → entities → services → endpoints → migration → commit.

**Commit message:** `feat: add ESG metrics library with framework mappings and reporting set`

---

## Task 7: ESG Module — Data Points + Review Workflow

**Goal:** CRUD for ESG data points with the full review workflow (Draft → Submitted → Under Review → Approved/Rejected). Data points are linked to metrics, sites, periods.

**Files:**
- Create: `src/ThaiEsgHub.Modules.ESG/Entities/EsgDataPoint.cs`
- Create: `src/ThaiEsgHub.Modules.ESG/DTOs/DataPointDtos.cs`
- Create: `src/ThaiEsgHub.Modules.ESG/Services/DataPointService.cs`
- Create: `src/ThaiEsgHub.Modules.ESG/Services/ReviewService.cs`
- Create: `src/ThaiEsgHub.Modules.ESG/Validators/DataPointValidator.cs`
- Create: `src/ThaiEsgHub.Modules.ESG/Endpoints/DataPointEndpoints.cs`
- Test: `tests/ThaiEsgHub.Tests/ESG/DataPointServiceTests.cs`
- Test: `tests/ThaiEsgHub.Tests/ESG/ReviewServiceTests.cs`

**API Endpoints:**

```
GET    /api/esg/data-points                  → List (AG Grid: filter by period, site, metric, status)
POST   /api/esg/data-points                  → Create data point
POST   /api/esg/data-points/bulk             → Bulk create (from Excel import)
GET    /api/esg/data-points/{id}             → Get with evidence + history
PUT    /api/esg/data-points/{id}             → Update (only if draft/rejected)
DELETE /api/esg/data-points/{id}             → Soft delete (only if draft)

POST   /api/esg/data-points/{id}/submit      → Submit for review (Draft → Submitted)
POST   /api/esg/data-points/{id}/approve     → Approve (Under Review → Approved)
POST   /api/esg/data-points/{id}/reject      → Reject with reason (Under Review → Rejected)

GET    /api/esg/data-points/completeness     → Data completeness summary (% per site × metric)
GET    /api/esg/data-points/gaps             → Gap analysis (missing data points)
```

**Business Rules (from design doc):**
- BR-1: Approved data cannot be edited (must restatement)
- BR-3: Quantitative metric must have numeric_value + unit
- BR-31: Preparer cannot approve their own data
- BR-32: Reviewer must provide reason when rejecting

**Steps:** Tests → entities → services (with validation) → endpoints → migration → commit.

**Commit message:** `feat: add ESG data points with review workflow and completeness tracking`

---

## Task 8: ESG Module — Task Management + Email Notifications

**Goal:** Task assignment system where managers assign data collection tasks to collectors, with email notifications and deadline tracking.

**Files:**
- Create: `src/ThaiEsgHub.Modules.ESG/Entities/EsgTask.cs`
- Create: `src/ThaiEsgHub.Modules.ESG/DTOs/TaskDtos.cs`
- Create: `src/ThaiEsgHub.Modules.ESG/Services/TaskService.cs`
- Create: `src/ThaiEsgHub.Modules.ESG/Endpoints/TaskEndpoints.cs`
- Create: `src/ThaiEsgHub.Infrastructure/Services/EmailService.cs`
- Create: `src/ThaiEsgHub.Infrastructure/Services/IEmailService.cs`
- Create: `src/ThaiEsgHub.Infrastructure/EmailTemplates/` (TaskAssigned.html, TaskReminder.html, TaskOverdue.html)
- Test: `tests/ThaiEsgHub.Tests/ESG/TaskServiceTests.cs`

**API Endpoints:**

```
GET    /api/esg/tasks                    → List tasks (AG Grid: filter by status, assignee, period)
POST   /api/esg/tasks                    → Create task (assign to user)
GET    /api/esg/tasks/{id}               → Get task detail
PUT    /api/esg/tasks/{id}               → Update task
DELETE /api/esg/tasks/{id}               → Delete task
POST   /api/esg/tasks/{id}/complete      → Mark as completed
GET    /api/esg/tasks/summary            → Task status summary (for dashboard)
GET    /api/esg/tasks/my-tasks           → Current user's assigned tasks
```

**Email Triggers:**
- Task assigned → email to assignee
- 7 days, 3 days, 1 day before deadline → reminder email
- Overdue → email to assignee + creator

Note: For MVP, email reminders can be triggered by a simple background service (`IHostedService`) that checks deadlines daily. No need for a full job scheduler yet.

**Steps:** Tests → entities → services → email service → endpoints → migration → commit.

**Commit message:** `feat: add task management with email notifications and deadline tracking`

---

## Task 9: Reporting Module — One Report Generator + Export

**Goal:** Generate the ESG section of 56-1 One Report from approved data, with editable narrative templates, and export to Word (.docx) and PDF.

**Files:**
- Create: `src/ThaiEsgHub.Modules.Reporting/Entities/GeneratedReport.cs`
- Create: `src/ThaiEsgHub.Modules.Reporting/Entities/NarrativeTemplate.cs`
- Create: `src/ThaiEsgHub.Modules.Reporting/DTOs/ReportDtos.cs`
- Create: `src/ThaiEsgHub.Modules.Reporting/Services/OneReportService.cs`
- Create: `src/ThaiEsgHub.Modules.Reporting/Services/ReportDataAggregator.cs`
- Create: `src/ThaiEsgHub.Modules.Reporting/Services/GriContentIndexService.cs`
- Create: `src/ThaiEsgHub.Modules.Reporting/Export/PdfReportGenerator.cs`
- Create: `src/ThaiEsgHub.Modules.Reporting/Export/WordReportGenerator.cs`
- Create: `src/ThaiEsgHub.Modules.Reporting/Templates/` (Thai narrative templates as JSON/resource files)
- Create: `src/ThaiEsgHub.Modules.Reporting/Endpoints/ReportEndpoints.cs`
- Create: `src/ThaiEsgHub.Modules.Reporting/DependencyInjection.cs`
- Test: `tests/ThaiEsgHub.Tests/Reporting/OneReportServiceTests.cs`
- Test: `tests/ThaiEsgHub.Tests/Reporting/ReportDataAggregatorTests.cs`

**API Endpoints:**

```
POST   /api/reports/one-report                       → Generate One Report preview (JSON)
GET    /api/reports/one-report/{id}                   → Get generated report
PUT    /api/reports/one-report/{id}/narratives        → Update narrative sections
POST   /api/reports/one-report/{id}/finalize          → Mark as final
GET    /api/reports/one-report/{id}/export?format=pdf → Export as PDF
GET    /api/reports/one-report/{id}/export?format=docx → Export as Word

GET    /api/reports/gri-content-index?periodId=X      → Generate GRI Content Index
GET    /api/reports/gri-content-index/export?format=xlsx → Export as Excel

GET    /api/reports                                    → List all generated reports
DELETE /api/reports/{id}                               → Delete draft report
```

**Report Generation Logic:**

```
OneReportService.Generate(periodId):
  1. Validate: period must be Approved or Published
  2. Load all approved data points for the period
  3. Group data by report section:
     - Section 3.3: Environmental metrics (energy, water, waste, GHG)
     - Section 3.4: Social metrics (labor, safety, HR, community)
  4. For each section:
     - Calculate aggregates (totals, averages, YoY change %)
     - Load narrative template (Thai)
     - Merge data into template placeholders
  5. Build ESG Performance Summary table (all metrics, current vs previous year)
  6. Save as GeneratedReport with JSON content
  7. Return preview model
```

**Narrative Template Example (stored as resource):**

```json
{
  "section_3_3_energy": {
    "th": "ในปี {year} บริษัทมีการใช้พลังงานรวม {total_energy} {energy_unit} {change_direction} {change_pct}% จากปีก่อนหน้า โดยมีสัดส่วนพลังงานทดแทนคิดเป็น {renewable_pct}% ของการใช้พลังงานทั้งหมด",
    "en": "In {year}, the Company consumed a total of {total_energy} {energy_unit}, representing a {change_pct}% {change_direction} from the previous year. Renewable energy accounted for {renewable_pct}% of total energy consumption."
  }
}
```

**Steps:** Tests → entities → aggregator → narrative templates → OneReportService → export generators → endpoints → migration → commit.

**Commit message:** `feat: add Reporting module with 56-1 One Report generator, GRI index, PDF/Word export`

---

## Task 10: Audit Module — Audit Trail + Evidence Management

**Goal:** Immutable audit trail for all data changes, and evidence file upload/download linked to data points.

**Files:**
- Create: `src/ThaiEsgHub.Infrastructure/Data/Configurations/AuditLogConfiguration.cs`
- Create: `src/ThaiEsgHub.Infrastructure/Services/AuditService.cs`
- Create: `src/ThaiEsgHub.Infrastructure/Services/FileStorageService.cs`
- Create: `src/ThaiEsgHub.Modules.ESG/Entities/Evidence.cs`
- Create: `src/ThaiEsgHub.Modules.ESG/Services/EvidenceService.cs`
- Create: `src/ThaiEsgHub.Modules.ESG/Endpoints/EvidenceEndpoints.cs`
- Create: API endpoints for audit trail browsing
- Test: `tests/ThaiEsgHub.Tests/Infrastructure/AuditServiceTests.cs`

**API Endpoints:**

```
GET    /api/audit-trail                              → List audit logs (AG Grid: filter by entity, action, user, date)
GET    /api/audit-trail/{entityType}/{entityId}       → Audit history for specific entity

POST   /api/evidences/upload                          → Upload evidence file (multipart)
GET    /api/evidences/{id}/download                   → Download evidence file
DELETE /api/evidences/{id}                            → Delete evidence
GET    /api/esg/data-points/{id}/evidences            → List evidences for a data point
```

**Key Design:**
- Audit logs are immutable — no UPDATE/DELETE allowed (EF Core config)
- `AuditInterceptor` (from Task 3) auto-creates audit log entries on SaveChanges
- File upload: validate type (PDF, image, Excel), max 10MB, store on local disk
- File path: `uploads/{tenant_id}/{year}/{filename}`

**Steps:** Tests → audit service → evidence entity/service → file storage → endpoints → migration → commit.

**Commit message:** `feat: add audit trail and evidence management with file upload`

---

## Task 11: Frontend Scaffolding — Next.js + i18n + shadcn/ui + AG Grid

**Goal:** Set up the Next.js 15 project with App Router, next-intl for Thai/English, shadcn/ui components, AG Grid Community, and API client.

**REQUIRED SKILL:** Use `frontend-design` skill for UI layout decisions, `vercel-react-best-practices` skill for Next.js code.

**Files:**
- Create: `frontend/thai-esg-hub/` (entire Next.js project)
- Key files:
  - `src/app/[locale]/layout.tsx` — root layout with i18n
  - `src/app/[locale]/(auth)/layout.tsx` — auth layout (no sidebar)
  - `src/app/[locale]/(app)/layout.tsx` — app layout (with sidebar + header)
  - `src/middleware.ts` — i18n + auth middleware
  - `src/lib/api.ts` — API client (fetch wrapper with JWT cookie)
  - `src/lib/auth.ts` — auth helpers
  - `src/components/ui/` — shadcn/ui components
  - `src/components/data-grid/DataGrid.tsx` — AG Grid wrapper component
  - `src/components/layout/Sidebar.tsx`
  - `src/components/layout/Header.tsx`
  - `src/messages/th.json` — Thai translations
  - `src/messages/en.json` — English translations
  - `src/i18n/request.ts` — next-intl config
  - `next.config.ts`
  - `tailwind.config.ts`

**Step 1: Create Next.js project**

```bash
cd frontend
npx create-next-app@latest thai-esg-hub --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd thai-esg-hub
```

**Step 2: Install dependencies**

```bash
# i18n
npm install next-intl

# UI
npx shadcn@latest init
npx shadcn@latest add button input label card dialog dropdown-menu toast tabs badge separator sheet avatar command popover select textarea

# AG Grid
npm install ag-grid-community ag-grid-react

# Charts
npm install recharts

# Forms
npm install react-hook-form @hookform/resolvers zod

# Icons
npm install lucide-react

# Date
npm install date-fns
```

**Step 3: Configure next-intl**

Set up `src/i18n/request.ts`, `src/middleware.ts`, `src/app/[locale]/layout.tsx` for TH/EN routing.

**Step 4: Create API client**

```typescript
// src/lib/api.ts
// Fetch wrapper that sends JWT cookie, handles errors, supports pagination params
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include', // send JWT cookie
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, error.message || 'Unknown error');
  }
  return res.json();
}
```

**Step 5: Create AG Grid wrapper component**

```typescript
// src/components/data-grid/DataGrid.tsx
// Reusable AG Grid wrapper with:
// - Server-side pagination via API
// - Sort/filter params sent to API
// - Floating header filters
// - Thai/English locale support
// - Loading state
```

**Step 6: Create app layout (sidebar + header)**

Use `frontend-design` skill to design the app shell with:
- Collapsible sidebar with navigation groups (Dashboard, ESG Data, Reports, Settings, Audit)
- Header with user avatar, locale switcher (TH/EN), notifications bell
- Breadcrumbs

**Step 7: Create translation files**

```json
// src/messages/th.json
{
  "common": {
    "save": "บันทึก",
    "cancel": "ยกเลิก",
    "delete": "ลบ",
    "edit": "แก้ไข",
    "search": "ค้นหา",
    "loading": "กำลังโหลด...",
    "confirm": "ยืนยัน",
    "back": "กลับ",
    "next": "ถัดไป",
    "export": "ส่งออก",
    "import": "นำเข้า"
  },
  "nav": {
    "dashboard": "แดชบอร์ด",
    "esgData": "ข้อมูล ESG",
    "metrics": "ตัวชี้วัด",
    "frameworks": "กรอบมาตรฐาน",
    "dataEntry": "กรอกข้อมูล",
    "dataReview": "ตรวจสอบข้อมูล",
    "tasks": "งานที่มอบหมาย",
    "reports": "รายงาน",
    "oneReport": "56-1 One Report",
    "griIndex": "GRI Content Index",
    "settings": "ตั้งค่า",
    "organization": "องค์กร",
    "sites": "สถานที่",
    "users": "ผู้ใช้งาน",
    "periods": "รอบการรายงาน",
    "audit": "Audit Trail"
  }
}
```

**Step 8: Verify dev server runs**

```bash
npm run dev
# Visit http://localhost:3000/th → Thai layout
# Visit http://localhost:3000/en → English layout
```

**Step 9: Commit**

```bash
git add .
git commit -m "feat: scaffold Next.js frontend with i18n, shadcn/ui, AG Grid, app layout"
```

---

## Task 12: Frontend — Auth Pages (Login, Register, Forgot Password)

**REQUIRED SKILL:** `frontend-design` for UI, `vercel-react-best-practices` for code.

**Files:**
- Create: `src/app/[locale]/(auth)/login/page.tsx`
- Create: `src/app/[locale]/(auth)/register/page.tsx`
- Create: `src/app/[locale]/(auth)/forgot-password/page.tsx`
- Create: `src/lib/auth.ts` — auth context/hooks
- Create: `src/components/auth/LoginForm.tsx`
- Create: `src/components/auth/RegisterForm.tsx`

**Pages:**
1. **Login** — email + password form, link to register, link to forgot password
2. **Register** — company name, tax ID, industry group (dropdown: SET 8 groups), email, password, full name
3. **Forgot Password** — email input → send reset link

**Step-by-step:** Design UI → implement forms with react-hook-form + zod → connect to API → handle JWT cookie → redirect to dashboard on success → commit.

**Commit message:** `feat: add auth pages (login, register, forgot password)`

---

## Task 13: Frontend — Onboarding Wizard

**REQUIRED SKILL:** `frontend-design` for UI, `vercel-react-best-practices` for code.

**Files:**
- Create: `src/app/[locale]/(app)/onboarding/page.tsx`
- Create: `src/components/onboarding/` (WizardSteps, StepOrganization, StepFrameworks, StepSites, StepInviteUsers)

**Wizard Steps:**
1. **Organization** — verify/edit company info (pre-filled from registration)
2. **Frameworks** — select which frameworks to report (GRI, SDG, SET ESG Metrics, etc.)
3. **Sites** — add company sites/locations (name, address, type)
4. **Invite Users** — invite team members by email with role assignment

**Commit message:** `feat: add onboarding wizard (4 steps)`

---

## Task 14: Frontend — Settings Pages

**REQUIRED SKILL:** `frontend-design` for UI, `vercel-react-best-practices` for code.

**Files:**
- Create: `src/app/[locale]/(app)/settings/organization/page.tsx`
- Create: `src/app/[locale]/(app)/settings/sites/page.tsx`
- Create: `src/app/[locale]/(app)/settings/users/page.tsx`
- Create: `src/app/[locale]/(app)/settings/periods/page.tsx`
- Create: `src/app/[locale]/(app)/settings/reporting-set/page.tsx`

**Pages:**
1. **Organization** — edit company info, logo upload, industry group
2. **Sites & Departments** — AG Grid list + CRUD modal for sites, nested departments
3. **User Management** — AG Grid list + CRUD modal, role assignment
4. **Reporting Periods** — AG Grid list + CRUD, status management, baseline year toggle
5. **Reporting Set** — select metrics from library (checkbox list grouped by category)

**Commit message:** `feat: add settings pages (org, sites, users, periods, reporting set)`

---

## Task 15: Frontend — ESG Metric Library + Framework Explorer

**REQUIRED SKILL:** `frontend-design` for UI, `vercel-react-best-practices` for code.

**Files:**
- Create: `src/app/[locale]/(app)/esg/metrics/page.tsx`
- Create: `src/app/[locale]/(app)/esg/frameworks/page.tsx`
- Create: `src/components/esg/MetricDetailModal.tsx`
- Create: `src/components/esg/FrameworkExplorer.tsx`

**Pages:**
1. **Metric Library** — AG Grid with all metrics, filter by category (E/S/G), sub-category, framework, search by name (TH/EN). Click row → detail modal showing all framework mappings.
2. **Framework Explorer** — tab navigation (GRI | SASB | SDG | SET | TCFD/ISSB), each tab shows metrics mapped to that framework. Cross-reference: click a metric → see all frameworks it maps to.

**Commit message:** `feat: add ESG metric library and framework explorer pages`

---

## Task 16: Frontend — Data Entry + Data Review

**REQUIRED SKILL:** `frontend-design` for UI, `vercel-react-best-practices` for code.

**Files:**
- Create: `src/app/[locale]/(app)/esg/data-entry/page.tsx`
- Create: `src/app/[locale]/(app)/esg/data-review/page.tsx`
- Create: `src/components/esg/DataEntryForm.tsx`
- Create: `src/components/esg/DataPointReviewCard.tsx`
- Create: `src/components/esg/EvidenceUpload.tsx`

**Pages:**
1. **Data Entry** — select period + site → show metrics to fill → form per metric (numeric input + unit + notes + evidence upload). Support bulk entry view.
2. **Data Review** — AG Grid showing submitted data points, filter by status/site/metric. Approve/Reject buttons with reason modal. Show evidence thumbnails.

**Commit message:** `feat: add data entry and data review pages with evidence upload`

---

## Task 17: Frontend — Task Management

**REQUIRED SKILL:** `frontend-design` for UI, `vercel-react-best-practices` for code.

**Files:**
- Create: `src/app/[locale]/(app)/esg/tasks/page.tsx`
- Create: `src/components/esg/TaskCreateModal.tsx`
- Create: `src/components/esg/TaskCard.tsx`

**Page:** AG Grid list of tasks with filters (status, assignee, deadline). Create task modal: select metric + site + period + assignee + deadline. Kanban-style view option (Pending | In Progress | Completed | Overdue).

**Commit message:** `feat: add task management page with create/assign workflow`

---

## Task 18: Frontend — One Report Generator + GRI Content Index

**REQUIRED SKILL:** `frontend-design` for UI, `vercel-react-best-practices` for code.

**Files:**
- Create: `src/app/[locale]/(app)/reports/one-report/page.tsx`
- Create: `src/app/[locale]/(app)/reports/one-report/[id]/page.tsx`
- Create: `src/app/[locale]/(app)/reports/gri-index/page.tsx`
- Create: `src/components/reports/OneReportPreview.tsx`
- Create: `src/components/reports/NarrativeEditor.tsx`
- Create: `src/components/reports/EsgPerformanceTable.tsx`

**Pages:**
1. **One Report Generator** — select period → click Generate → show preview with:
   - Section 3.1-3.4 with auto-populated data tables
   - Editable narrative text areas (rich text or textarea)
   - ESG Performance Summary table (YoY comparison)
   - Export buttons: Download Word / Download PDF
2. **GRI Content Index** — AG Grid showing: GRI Standard, Disclosure #, Name, Value/Reference, Status (has data / gap). Export to Excel.

**Commit message:** `feat: add One Report generator with preview, narrative editor, and export`

---

## Task 19: Frontend — Dashboard

**REQUIRED SKILL:** `frontend-design` for UI, `vercel-react-best-practices` for code.

**Files:**
- Create: `src/app/[locale]/(app)/dashboard/page.tsx`
- Create: `src/components/dashboard/KpiCard.tsx`
- Create: `src/components/dashboard/DataCompletenessChart.tsx`
- Create: `src/components/dashboard/TaskStatusChart.tsx`
- Create: `src/components/dashboard/EsgSummaryTable.tsx`

**Dashboard Components:**
1. **KPI Cards** — total metrics, data completeness %, tasks completed/total, reports generated
2. **Data Collection Progress** — bar chart (% per site or per category)
3. **Task Status** — donut chart (pending/in-progress/completed/overdue)
4. **ESG Performance Summary** — compact table (key metrics, current vs previous year, trend arrow)
5. **Recent Activity** — last 10 audit log entries

**Commit message:** `feat: add main dashboard with KPI cards, charts, and activity feed`

---

## Task 20: Frontend — Audit Trail

**REQUIRED SKILL:** `frontend-design` for UI, `vercel-react-best-practices` for code.

**Files:**
- Create: `src/app/[locale]/(app)/audit/page.tsx`
- Create: `src/components/audit/AuditDetailModal.tsx`

**Page:** AG Grid showing audit logs — timestamp, user, action (create/update/delete/approve/reject), entity type, entity name. Click row → modal showing old values vs new values (diff view). Filter by date range, user, entity type, action.

**Commit message:** `feat: add audit trail page with diff view`

---

## Task 21: Landing Page (Public)

**REQUIRED SKILL:** `frontend-design` for UI, `vercel-react-best-practices` for code.

**Files:**
- Create: `src/app/[locale]/(public)/page.tsx`
- Create: `src/app/[locale]/(public)/pricing/page.tsx`
- Create: `src/components/landing/` (Hero, Features, Pricing, CTA, Footer)

**Sections:**
1. **Hero** — headline, subheadline, CTA button (ทดลองใช้ฟรี)
2. **Pain Points** — 3-4 problems Thai companies face
3. **Features** — icon grid of key features
4. **Pricing** — 3 tiers (Starter, Professional, Enterprise)
5. **Compliance** — logos of standards supported (GRI, ISSB, SET, SDG)
6. **CTA** — final call to action
7. **Footer** — links, contact

**Commit message:** `feat: add landing page and pricing page`

---

## Task 22: Docker Compose Production + CI/CD

**Goal:** Production Docker Compose with nginx, SSL, and GitHub Actions CI/CD.

**Files:**
- Create: `docker-compose.yml` (production)
- Create: `Dockerfile` (API)
- Create: `frontend/thai-esg-hub/Dockerfile` (Next.js)
- Create: `nginx/conf.d/default.conf`
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/deploy.yml`

**Step 1: Create Dockerfiles**

API Dockerfile (multi-stage build):
```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish src/ThaiEsgHub.Api -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app .
EXPOSE 8080
ENTRYPOINT ["dotnet", "ThaiEsgHub.Api.dll"]
```

Next.js Dockerfile (multi-stage):
```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
```

**Step 2: Create production docker-compose.yml** (as specified in design doc)

**Step 3: Create nginx config** with reverse proxy + SSL

**Step 4: Create GitHub Actions CI** (build + test on PR)

**Step 5: Create GitHub Actions Deploy** (build images + push + SSH deploy on main)

**Step 6: Commit**

```bash
git add .
git commit -m "chore: add Docker production config and GitHub Actions CI/CD"
```

---

## Task 23: Seed Data — ESG Metrics + Framework Mappings

**Goal:** Seed the database with built-in ESG metrics (Environmental, Social, Governance) mapped to GRI, SDG, SET ESG Metrics for all 8 industry groups.

**Files:**
- Create: `src/ThaiEsgHub.Infrastructure/Data/Seeds/EsgMetricSeeder.cs`
- Create: `src/ThaiEsgHub.Infrastructure/Data/Seeds/FrameworkMappingSeeder.cs`
- Create: `src/ThaiEsgHub.Infrastructure/Data/Seeds/SeedData.cs` (orchestrator)
- Modify: `src/ThaiEsgHub.Api/Program.cs` — call seeder on startup

**Seed Data Scope (from requirements doc):**

**Environmental Metrics (~15 metrics):**
- Energy: total consumption, renewable %, intensity (GRI 302-1, 302-3 → SDG 7)
- GHG: Scope 1, 2, 3, intensity (GRI 305-1 to 305-4 → SDG 13)
- Water: total consumption, intensity, recycled (GRI 303-3, 303-5 → SDG 6)
- Waste: total, hazardous, recycle rate, landfill (GRI 306-3 to 306-5 → SDG 12)

**Social Metrics (~10 metrics):**
- Labor: headcount, gender ratio, turnover rate, training hours (GRI 2-7, 401-1, 404-1, 405-1 → SDG 4, 5, 8)
- Safety: LTIR, fatalities, serious accidents (GRI 403-9 → SDG 8)
- Human rights: due diligence (GRI 412-1 → SDG 16)
- Community: complaints, contributions (GRI 413-1, 413-2 → SDG 11)

**Governance Metrics (~5 metrics):**
- Board: independent %, female % (GRI 2-9, 405-1 → SDG 5, 16)
- Anti-corruption: cases, training rate (GRI 205-2, 205-3 → SDG 16)
- Whistleblower: complaints count (GRI 2-26 → SDG 16)

**Framework Mappings:** Each metric → GRI code, SDG goal, SET industry groups (8 groups: which metrics are mandatory/recommended per group)

**Steps:**
1. Create seeder classes with static data
2. Use `context.Database.EnsureCreated()` + conditional seeding (skip if data exists)
3. Call seeder in `Program.cs` after `app.Build()`
4. Run and verify via Swagger: `GET /api/esg/metrics`
5. Commit

**Commit message:** `feat: seed ESG metrics library with GRI, SDG, SET framework mappings`

---

## Review Checkpoints

After each major group of tasks, pause for code review:

| Checkpoint | After Tasks | What to Review |
|-----------|------------|---------------|
| **CP1: Foundation** | Tasks 1-3 | Solution structure, DbContext, RLS, builds cleanly |
| **CP2: Backend Core** | Tasks 4-8 | Auth flow, CRUD operations, business rules, API contracts |
| **CP3: Reports + Audit** | Tasks 9-10 | Report generation, PDF/Word export, audit trail |
| **CP4: Frontend Shell** | Tasks 11-12 | Next.js setup, i18n works, auth flow, layout |
| **CP5: Frontend Features** | Tasks 13-18 | All pages work, AG Grid integration, data flow |
| **CP6: Polish** | Tasks 19-23 | Dashboard, landing page, Docker, seed data |

---

## Quick Reference: File Count Estimate

| Area | Estimated Files |
|------|----------------|
| Backend (.cs) | ~80-100 files |
| Frontend (.tsx/.ts) | ~60-80 files |
| Config/Docker | ~10-15 files |
| Tests | ~15-20 files |
| **Total** | **~170-215 files** |
