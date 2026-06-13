# Authentication & Authorization (.NET 10)

> .NET 10 LTS (support ถึง Nov 2028) + ASP.NET Core 10. ทุก API/pattern ตรวจกับ Microsoft Learn (`?view=aspnetcore-10.0`) แล้ว 2026-06.
> Package version ที่อ้างถึงในไฟล์นี้คือ `v10.0.0` ทั้งหมด (`Microsoft.AspNetCore.Authentication.JwtBearer`, `Microsoft.AspNetCore.Authorization`, `Microsoft.AspNetCore.Identity.*`).

แยกคำให้ชัดก่อน: **Authentication (authn)** = "คุณคือใคร" (verify token/cookie → สร้าง `ClaimsPrincipal`), **Authorization (authz)** = "คุณทำสิ่งนี้ได้ไหม" (policy/role/claim/resource check). ลำดับ middleware ต้องเป็น `UseAuthentication()` → `UseAuthorization()` เสมอ.

---

## 1. JWT Bearer Authentication

ใช้กับ API ที่รับ access token จาก secure token service (STS) ภายนอก เช่น Microsoft Entra ID, Auth0, Keycloak — หรือ token ที่ออกเอง. token ส่งมาใน header `Authorization: Bearer <token>`. package: `Microsoft.AspNetCore.Authentication.JwtBearer`.

### 1.1 แบบ Authority/Audience (แนะนำเมื่อมี STS จริง)

ตั้งแค่ `Authority` (issuer) + `Audience` ก็พอ — JwtBearer ดึง signing key จาก STS metadata (`.well-known/openid-configuration`) อัตโนมัติ + validate signature/issuer/audience/expiry ให้:

```csharp
using Microsoft.AspNetCore.Authentication.JwtBearer;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(jwtOptions =>
    {
        jwtOptions.Authority = "https://{--your-authority--}";   // ดึง signing keys + issuer จากตรงนี้
        jwtOptions.Audience  = "https://{--your-audience--}";
        jwtOptions.MapInboundClaims = false;   // เก็บ claim type เดิม (sub, aud) ไม่ map เป็น legacy URI
    });

var app = builder.Build();
app.UseAuthentication();   // ต้องมาก่อน UseAuthorization
app.UseAuthorization();
```

> `MapInboundClaims = false` ทำให้ `sub`, `aud` ไม่ถูก map เป็น ClaimTypes URI ยาวๆ — แนะนำเปิดสำหรับ API ใหม่. `AddJwtBearer()` มี overload ระบุ scheme name ได้ (`AddJwtBearer("Bearer")`, `AddJwtBearer("LocalAuthIssuer")`) สำหรับ multi-issuer API.

### 1.2 TokenValidationParameters — token ที่ออกเอง (symmetric key)

ถ้าออก JWT เองด้วย shared secret (ไม่มี STS) ต้องตั้ง `IssuerSigningKey` + flag validate เอง. `TokenValidationParameters` มาจาก namespace `Microsoft.IdentityModel.Tokens`:

```csharp
using Microsoft.IdentityModel.Tokens;
using System.Text;

var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SigningKey"]!); // จาก user-secrets/key vault — section 6

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey         = new SymmetricSecurityKey(key),
            ValidateIssuer           = true,
            ValidIssuer              = builder.Configuration["Jwt:Issuer"],
            ValidateAudience         = true,
            ValidAudience            = builder.Configuration["Jwt:Audience"],
            ValidateLifetime         = true,
            ClockSkew                = TimeSpan.Zero   // default 5 นาที — set 0 ถ้าต้องการ expiry เป๊ะ
        };
    });
```

> ❌ **ห้าม** hardcode signing key ใน source. ดึงจาก configuration (user-secrets ตอน dev, key vault ตอน prod — section 6). production ที่มี IdP จริงควรใช้ asymmetric (RSA/ECDsa) ผ่าน `Authority` (1.1) แทน symmetric key. multi-audience/multi-issuer ใช้ `ValidAudiences`/`ValidIssuers` (พหูพจน์ รับ array).
>
> ⚠️ JWT bearer **ไม่** redirect ไป login เมื่อ fail — return 401 (signature/issuer/audience/expiry ผิด) หรือ 403 (authenticated แต่ไม่มีสิทธิ์) พร้อม `WWW-Authenticate: Bearer` header เสมอ (เป็น behavior ของ scheme นี้มาแต่ไหนแต่ไร — ต่างจาก cookie ที่เพิ่งเปลี่ยนใน .NET 10, ดู section 3).

---

## 2. ASP.NET Core Identity + Identity API Endpoints (`MapIdentityApi<T>`)

สำหรับ **SPA (React/Angular/Vue)** หรือ Blazor WASM ที่ต้องการ user store เต็มรูปแบบ (register/login/2FA/email confirm) โดยไม่ต้องตั้ง IdP แยก. `MapIdentityApi<TUser>` (มาตั้งแต่ .NET 8) เพิ่ม JSON endpoint ชุดหนึ่งแทน Razor Pages UI เดิม. packages: `Microsoft.AspNetCore.Identity.EntityFrameworkCore` + EF Core provider (`Microsoft.EntityFrameworkCore.SqlServer` / `Npgsql.EntityFrameworkCore.PostgreSQL`).

### 2.1 IdentityDbContext + setup

```csharp
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<IdentityUser>(options);   // ใช้ IdentityUser หรือ custom : IdentityUser
```

```csharp
// dual-DB: เลือก provider ตาม config
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var cs = builder.Configuration.GetConnectionString("Default")!;
    if (builder.Configuration["Database:Provider"] == "PostgreSQL")
        options.UseNpgsql(cs);
    else
        options.UseSqlServer(cs);
});

builder.Services.AddAuthorization();

// ลงทะเบียน Identity services + bearer token & cookie scheme
builder.Services.AddIdentityApiEndpoints<IdentityUser>()
    .AddEntityFrameworkStores<ApplicationDbContext>();
```

> `AddIdentityApiEndpoints<TUser>()` (namespace `Microsoft.Extensions.DependencyInjection`) "Adds a set of common identity services to support `MapIdentityApi<TUser>` and configures authentication to support identity bearer tokens and cookies." — รวม authentication scheme ให้แล้ว ไม่ต้องเรียก `AddAuthentication` เอง. ถ้าต้องการแยกชิ้นใช้ `AddIdentityCore<TUser>().AddEntityFrameworkStores<...>().AddApiEndpoints()`.

### 2.2 Map endpoints

```csharp
var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

app.MapIdentityApi<IdentityUser>();   // เพิ่ม endpoint ชุดด้านล่าง

app.MapGet("/weather", () => "secret data")
   .RequireAuthorization();           // ป้องกัน endpoint นี้ (section 5)

app.Run();
```

`MapIdentityApi<TUser>` เพิ่ม endpoint เหล่านี้ (verified vs MS Learn):

| Endpoint | ใช้ทำอะไร |
| --- | --- |
| `POST /register` | สมัคร (body: `{ "email", "password" }`) |
| `POST /login` | login → ออก cookie หรือ token |
| `POST /refresh` | (token mode) ขอ access token ใหม่จาก refresh token |
| `GET /confirmEmail`, `POST /resendConfirmationEmail` | ยืนยันอีเมล |
| `POST /forgotPassword`, `POST /resetPassword` | reset รหัสผ่าน |
| `POST /manage/2fa`, `GET|POST /manage/info` | จัดการ 2FA / ข้อมูล user (ต้อง authorize) |

### 2.3 Cookie vs Token — เลือกตาม client

`/login` รองรับ 2 โหมดผ่าน query string `useCookies`:

```jsonc
// Cookie mode (แนะนำสำหรับ browser SPA): POST /login?useCookies=true
// → server เซ็ต auth cookie, browser แนบให้อัตโนมัติ. fetch ต้องตั้ง credentials:'include'

// Token mode: POST /login  (useCookies ไม่ใส่ หรือ false)
// → response มี accessToken (อายุสั้น) + refreshToken (อายุยาว)
{ "tokenType": "Bearer", "accessToken": "...", "expiresIn": 3600, "refreshToken": "..." }
// client แนบ header: Authorization: Bearer <accessToken> แล้วเรียก /refresh เมื่อใกล้หมดอายุ
```

> ⚠️ token ของ `MapIdentityApi` **ไม่ใช่ standard JWT** — เป็น proprietary token ของ Identity (ตั้งใจให้ใช้กับ simple scenario, ไม่ใช่ token server เต็มรูปแบบ). browser-based app **Microsoft แนะนำ cookie** เพราะ browser จัดการให้เอง ไม่ต้องเก็บ token ใน JS (กัน XSS ขโมย token). ตั้งอายุ token ด้วย `BearerTokenOptions.BearerTokenExpiration` / `RefreshTokenExpiration`.

---

## 3. ⚠️ .NET 10 Behavior Change — API endpoints return 401/403 แทน redirect ไป login

**verified vs MS Learn** ([breaking-changes/10/cookie-authentication-api-endpoints](https://learn.microsoft.com/aspnet/core/breaking-changes/10/cookie-authentication-api-endpoints)) — introduced ใน .NET 10 Preview 7.

**เดิม (≤ .NET 9):** cookie authentication handler redirect request ที่ unauthenticated/unauthorized ไปยัง login URI / access-denied URI โดย default สำหรับ request ทั้งหมด **ยกเว้น** XMLHttpRequest (XHR).

**ใหม่ (.NET 10):** request ที่ไป "known API endpoint" และ fail auth → return **401** (unauthenticated) / **403** (forbidden) แทนการ redirect. XHR ยังคง return 401/403 เหมือนเดิม.

ASP.NET Core ระบุ "known API endpoint" ผ่าน interface ใหม่ `IApiEndpointMetadata` ซึ่งถูกแนบให้อัตโนมัติกับ:

1. `[ApiController]` controllers
2. Minimal API endpoints ที่อ่าน JSON request body หรือเขียน JSON response
3. Endpoints ที่ return `TypedResults`
4. SignalR endpoints

```csharp
// .NET 10: endpoint นี้ (ApiController/JSON) → fail = 401/403, ไม่ redirect — ถูกต้องสำหรับ API
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase { /* ... */ }
```

ทำไมเปลี่ยน: redirect ไป HTML login page ไม่สมเหตุสมผลสำหรับ API ที่ client เป็น code (SPA/mobile) — ควรสื่อ auth failure ด้วย status code ไม่ใช่ HTML.

**Opt-out** (บังคับ redirect เหมือนเดิมแม้เป็น API endpoint) — override cookie events:

```csharp
builder.Services.AddAuthentication()
    .AddCookie(options =>
    {
        options.Events.OnRedirectToLogin = context =>
        {
            context.Response.Redirect(context.RedirectUri);
            return Task.CompletedTask;
        };
        options.Events.OnRedirectToAccessDenied = context =>
        {
            context.Response.Redirect(context.RedirectUri);
            return Task.CompletedTask;
        };
    });
```

> ⚠️ ขอบเขต: change นี้กระทบ **cookie authentication** เท่านั้น. **JWT bearer ไม่เกี่ยว** — return 401/403 อยู่แล้วโดยธรรมชาติ (section 1.2). app แบบ mixed (มีทั้ง Razor Pages + API) จะได้พฤติกรรมถูกทั้งคู่อัตโนมัติ: web page → redirect, API endpoint → status code.
>
> ✅ ผลกระทบกับโปรเจกต์ Clean Architecture ที่ backend เป็น Web API + React frontend: **เลิก** workaround เดิมที่เคยเขียน `OnRedirectToLogin` คืน 401 เอง — .NET 10 ทำให้อัตโนมัติแล้ว.

---

## 4. Authorization Policies

policy คือชุด requirement ที่ตั้งชื่อไว้ แล้วอ้างด้วยชื่อ. แนะนำ `AddAuthorizationBuilder()` (fluent, ตั้งแต่ .NET 7) แทน `AddAuthorization(options => ...)` แบบเดิม.

### 4.1 AddAuthorizationBuilder + RequireRole / RequireClaim

```csharp
builder.Services.AddAuthorizationBuilder()
    // role เดียว
    .AddPolicy("RequireAdminRole", policy => policy.RequireRole("Admin"))

    // หลาย role แบบ OR (อยู่ role ใด role หนึ่งก็ผ่าน)
    .AddPolicy("ElevatedRights", policy =>
        policy.RequireRole("Admin", "SuperUser"))

    // หลาย role แบบ AND (ต้องอยู่ทุก role) — chain
    .AddPolicy("FullAdmin", policy =>
        policy.RequireRole("Admin").RequireRole("Auditor"))

    // claim ต้องมี type นี้ (ค่าอะไรก็ได้)
    .AddPolicy("EmployeesOnly", policy =>
        policy.RequireClaim("EmployeeNumber"))

    // claim ต้องมี type นี้ + ค่าอยู่ในรายการที่อนุญาต
    .AddPolicy("HrOrFinance", policy =>
        policy.RequireClaim("Department", "HR", "Finance"));
```

> `RequireRole(params string[])` = OR (อย่างน้อยหนึ่ง role). ต้องการ AND ให้ chain `.RequireRole(a).RequireRole(b)`. `RequireClaim(type)` = แค่มี claim type นั้น, `RequireClaim(type, values...)` = ค่าต้อง match อย่างน้อยหนึ่งใน values. policy name lookup เป็น case-insensitive.

### 4.2 Custom requirement (policy-based) — เมื่อ role/claim ไม่พอ

```csharp
// 1) requirement (เก็บ parameter)
public class MinimumAgeRequirement(int minimumAge) : IAuthorizationRequirement
{
    public int MinimumAge { get; } = minimumAge;
}

// 2) handler (logic เช็ค)
public class MinimumAgeHandler : AuthorizationHandler<MinimumAgeRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context, MinimumAgeRequirement requirement)
    {
        var dobClaim = context.User.FindFirst(c => c.Type == "DateOfBirth");
        if (dobClaim is not null &&
            DateTime.TryParse(dobClaim.Value, out var dob) &&
            DateTime.Today.AddYears(-requirement.MinimumAge) >= dob)
        {
            context.Succeed(requirement);   // ผ่าน
        }
        return Task.CompletedTask;          // ไม่เรียก Succeed = ไม่ผ่าน
    }
}

// 3) register
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("AtLeast21", policy =>
        policy.Requirements.Add(new MinimumAgeRequirement(21)));
builder.Services.AddSingleton<IAuthorizationHandler, MinimumAgeHandler>();
```

### 4.3 Resource-based authorization — ต้องรู้ทั้ง user และ "ของชิ้นนั้น"

เมื่อสิทธิ์ขึ้นกับตัว resource (เช่น "แก้ได้เฉพาะเอกสารที่ตัวเองเป็นเจ้าของ") — เช็คไม่ได้ตอน attribute เพราะยังไม่ได้โหลด resource. ใช้ `IAuthorizationService.AuthorizeAsync` แบบ imperative ใน handler/service:

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Infrastructure;

// CRUD operation requirements — เขียน handler เดียวจบ
public static class Operations
{
    public static readonly OperationAuthorizationRequirement Read   = new() { Name = nameof(Read) };
    public static readonly OperationAuthorizationRequirement Update = new() { Name = nameof(Update) };
    public static readonly OperationAuthorizationRequirement Delete = new() { Name = nameof(Delete) };
}

public class DocumentAuthorizationHandler
    : AuthorizationHandler<OperationAuthorizationRequirement, Document>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        OperationAuthorizationRequirement requirement,
        Document resource)
    {
        if (context.User.Identity?.Name == resource.OwnerName)
            context.Succeed(requirement);   // เจ้าของทำได้ทุก operation
        else if (requirement.Name == Operations.Read.Name &&
                 context.User.IsInRole("Admin"))
            context.Succeed(requirement);   // admin อ่านได้

        return Task.CompletedTask;
    }
}
```

```csharp
// ใช้ใน controller/minimal API (inject IAuthorizationService)
public class DocumentController(IAuthorizationService authz) : ControllerBase
{
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromServices] IDocumentRepository repo)
    {
        var doc = await repo.FindAsync(id);
        if (doc is null) return NotFound();

        // AuthorizeAsync(user, resource, requirement) — verified overload
        var result = await authz.AuthorizeAsync(User, doc, Operations.Update);
        if (!result.Succeeded)
            return User.Identity?.IsAuthenticated ?? false
                ? Forbid()      // authenticated แต่ไม่มีสิทธิ์ → 403
                : Challenge();  // ยังไม่ login → 401/redirect ตาม scheme

        // ... update doc
        return NoContent();
    }
}
```

> `IAuthorizationService` ลงทะเบียนโดย framework อัตโนมัติ — inject ได้เลย. มี 2 overload หลัก: `AuthorizeAsync(user, resource, policyName)` และ `AuthorizeAsync(user, resource, IEnumerable<IAuthorizationRequirement>)` (รวมถึง single requirement). `OperationAuthorizationRequirement` อยู่ namespace `Microsoft.AspNetCore.Authorization.Infrastructure`. policy-based (4.1/4.2) ใช้กับ attribute ได้ แต่ resource-based ต้องเรียก imperative เพราะต้องส่ง resource เข้าไป.

---

## 5. บังคับใช้ — `[Authorize]` (controller) + `RequireAuthorization` (minimal API)

### 5.1 Controllers / actions

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]                                  // ทั้ง controller ต้อง authenticated
public class SalaryController : ControllerBase
{
    [HttpGet]
    public IActionResult Index() => Ok();     // แค่ login ก็พอ

    [HttpGet("payslip")]
    [Authorize(Policy = "EmployeesOnly")]     // ต้องผ่าน policy "EmployeesOnly" ด้วย
    public IActionResult Payslip() => Ok();

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]              // shortcut ระบุ role ตรงๆ
    public IActionResult Update(int id) => NoContent();

    [HttpGet("public")]
    [AllowAnonymous]                          // ยกเว้น — ไม่ต้อง auth
    public IActionResult Public() => Ok();
}
```

> ถ้ามี `[Authorize(Policy=...)]` ทั้งระดับ controller และ action → **ต้องผ่านทุก policy** (AND). `[Authorize(Roles="Admin,Manager")]` = OR (อยู่ role ใดก็ได้).

### 5.2 Minimal API + route groups (`MapGroup`)

```csharp
// endpoint เดี่ยว
app.MapGet("/profile", () => "private")
   .RequireAuthorization();                       // แค่ authenticated

app.MapGet("/admin", () => "admin only")
   .RequireAuthorization("RequireAdminRole");     // ระบุ policy name

// route group — ตั้ง prefix + ผูก authorization ครั้งเดียวให้ทั้งกลุ่ม
var admin = app.MapGroup("/api/admin")
               .RequireAuthorization("RequireAdminRole");

admin.MapGet("/users", GetUsers);          // ทุก endpoint ในกลุ่มได้ policy นี้
admin.MapPost("/users", CreateUser);
admin.MapDelete("/users/{id}", DeleteUser);

// ยกเว้นบาง endpoint ในกลุ่ม
var api = app.MapGroup("/api");
api.MapGet("/health", () => "ok").AllowAnonymous();   // public
api.MapGet("/me", GetMe).RequireAuthorization();       // protected
```

> `MapGroup(prefix)` (ตั้งแต่ .NET 7) คืน `RouteGroupBuilder` — เรียก `.RequireAuthorization(...)` / `.RequireAuthorization(policyName)` ได้ และ apply ให้ทุก endpoint ในกลุ่ม ลดโค้ดซ้ำ. รองรับ nested group. `RequireAuthorization` ยังใช้ป้องกัน Swagger/OpenAPI ได้: `app.MapSwagger().RequireAuthorization()`.

---

## 6. Secrets — user-secrets (dev) + Key Vault (prod)

❌ **ห้าม** เก็บ connection string / signing key / client secret ใน source หรือ `appsettings.json` ที่ commit. แยก secret ของ dev/staging/prod คนละชุด.

### 6.1 Development — Secret Manager (`dotnet user-secrets`)

เก็บ secret เป็นไฟล์ JSON ใน user profile (นอก repo). package: `Microsoft.Extensions.Configuration.UserSecrets`.

```xml
<!-- .csproj — ต้องมี UserSecretsId (GUID อะไรก็ได้ขอให้ unique) -->
<PropertyGroup>
  <UserSecretsId>aspnet-MyApi-1a2b3c4d-...</UserSecretsId>
</PropertyGroup>
```

```bash
# รันที่ content root ของ project — ค่าจะถูกเก็บนอก source tree
dotnet user-secrets init
dotnet user-secrets set "Jwt:SigningKey" "dev_super_secret_value"
dotnet user-secrets set "ConnectionStrings:Default" "Host=localhost;Database=app;..."

# ใช้ ':' คั่น section (เหมือน hierarchy ใน appsettings)
```

> `CreateBuilder()`/`WebApplication.CreateBuilder` โหลด user-secrets ให้อัตโนมัติเมื่อ environment เป็น `Development` — อ่านผ่าน `builder.Configuration["Jwt:SigningKey"]` ได้เลย ไม่ต้องเรียก `AddUserSecrets` เอง. user-secrets **ไม่ได้ encrypt** — กัน "หลุดเข้า git" เท่านั้น ไม่ใช่ vault.

### 6.2 Production — Azure Key Vault configuration provider

```csharp
using Azure.Identity;   // package: Azure.Extensions.AspNetCore.Configuration.Secrets + Azure.Identity

if (builder.Environment.IsProduction())
{
    builder.Configuration.AddAzureKeyVault(
        new Uri($"https://{builder.Configuration["KeyVault:Name"]}.vault.azure.net/"),
        new DefaultAzureCredential());   // ใช้ managed identity — ไม่ต้องเก็บ credential เอง
}

// อ่านเหมือน config ปกติ — key vault override provider อื่น (ลงทะเบียนเป็นตัวสุดท้าย)
var signingKey = builder.Configuration["Jwt:SigningKey"];
```

> production secret ควรเข้าผ่าน controlled means เช่น Key Vault (encrypt at-rest/in-transit + audit access). `DefaultAzureCredential` ใช้ **managed identity** = passwordless ไม่ต้องเก็บ credential ในแอป (Microsoft แนะนำสุด). hierarchical key ใน Key Vault ใช้ `--` คั่นแทน `:` (เช่น `Jwt--SigningKey`). ลงทะเบียน Key Vault เป็น provider **ตัวสุดท้าย** เพื่อให้ override ค่าจาก provider อื่น. **อย่า** เก็บ config ทั่วไป (IP, feature flag) ใน Key Vault — ใช้ Azure App Configuration; Key Vault เน้น cryptographic secret.

---

## Verified versions

ทุก API/pattern ในไฟล์นี้ตรวจกับ Microsoft Learn (`?view=aspnetcore-10.0`) เมื่อ 2026-06:

- **JWT Bearer**: `AddAuthentication().AddJwtBearer(...)`, `JwtBearerDefaults.AuthenticationScheme`, `JwtBearerOptions.TokenValidationParameters`, `SymmetricSecurityKey`, `ValidateIssuer/ValidateAudience/ValidateIssuerSigningKey/ValidateLifetime/ClockSkew` — package `Microsoft.AspNetCore.Authentication.JwtBearer` v10.0.0; `TokenValidationParameters` จาก `Microsoft.IdentityModel.Tokens`.
- **Identity API**: `AddIdentityApiEndpoints<TUser>()` + `AddEntityFrameworkStores<TContext>()`, `MapIdentityApi<TUser>()` (10 endpoints: register/login/refresh/confirmEmail/resendConfirmationEmail/forgotPassword/resetPassword/manage/2fa/manage/info), `IdentityDbContext<TUser>`, cookie vs token mode (`?useCookies=true`), `AddIdentityCore().AddApiEndpoints()` — `Microsoft.Extensions.Identity.Core` / `Microsoft.AspNetCore.Identity.*` v10.0.0.
- **.NET 10 behavior change**: cookie auth ที่ known API endpoint → 401/403 แทน redirect; `IApiEndpointMetadata` (auto บน `[ApiController]` / JSON minimal API / `TypedResults` / SignalR); opt-out ผ่าน `OnRedirectToLogin`/`OnRedirectToAccessDenied`. ([breaking-changes/10/cookie-authentication-api-endpoints](https://learn.microsoft.com/aspnet/core/breaking-changes/10/cookie-authentication-api-endpoints), introduced .NET 10 Preview 7).
- **Authorization**: `AddAuthorizationBuilder().AddPolicy(...)`, `RequireRole(params string[])`/`RequireClaim(type, values)`, `IAuthorizationRequirement` + `AuthorizationHandler<T>`/`AuthorizationHandler<TReq,TResource>`, `OperationAuthorizationRequirement` (`Microsoft.AspNetCore.Authorization.Infrastructure`), `IAuthorizationService.AuthorizeAsync(user, resource, requirement|policyName)` — `Microsoft.AspNetCore.Authorization` v10.0.0.
- **Enforcement**: `[Authorize(Policy=/Roles=)]`, `[AllowAnonymous]`, `RequireAuthorization()`/`RequireAuthorization(policyName)`, `MapGroup(prefix).RequireAuthorization(...)`.
- **Secrets**: `dotnet user-secrets` (`Microsoft.Extensions.Configuration.UserSecrets`, `<UserSecretsId>`), `AddAzureKeyVault(uri, DefaultAzureCredential)` (`Azure.Extensions.AspNetCore.Configuration.Secrets` + `Azure.Identity`).
