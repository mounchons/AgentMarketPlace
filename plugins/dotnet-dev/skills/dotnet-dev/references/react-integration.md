# ASP.NET Core + React Integration (.NET 10 / Aspire 13)

> ✅ ทุก API ในไฟล์นี้ตรวจกับ Microsoft Learn (ASP.NET Core 10 / Aspire 13.1.0 / EF Core 10) แล้ว — ดูตาราง "เวอร์ชันที่อ้างอิง" ท้ายไฟล์
> ⚠️ จุดที่ต้องระวัง verify ก่อนใช้จริง: (1) Aspire `AddViteApp`/`AddNpmApp` ย้าย package, (2) `dotnet openapi` / `<OpenApiReference>` **deprecated ใน .NET 10**, (3) `openapi-typescript` เป็น community tool (ไม่ใช่ของ Microsoft)

ไฟล์นี้ครอบคลุม 6 หัวข้อหลักของการต่อ React (Vite) เข้ากับ ASP.NET Core API — เลือก topology ก่อน (separate origin / SPA proxy / Aspire orchestration) แล้วค่อยตั้ง CORS + auth ตาม topology นั้น

---

## 1. เลือก Topology ก่อน (decision ตั้งต้น)

| Topology | React origin | API origin | ต้อง CORS? | ใช้เมื่อ |
|----------|--------------|------------|-----------|---------|
| **A. SPA proxy** (dev) | `localhost:5173` | proxy ผ่าน Vite → API | ❌ ไม่ต้อง (same-origin จากมุม browser) | dev บน workstation, team เล็ก |
| **B. Aspire orchestration** | Aspire จัดให้ | Aspire จัดให้ + service discovery | ❌ ส่วนใหญ่ไม่ต้อง (inject URL ผ่าน env) | cloud-native, dual-DB, มี Redis/queue |
| **C. Separate origin** | `app.contoso.com` | `api.contoso.com` | ✅ ต้องตั้ง CORS | prod แยก host / แยก deploy / CDN |
| **D. Co-host** (static) | เสิร์ฟจาก wwwroot ของ API | เดียวกัน | ❌ ไม่ต้อง | monolith, deploy ก้อนเดียว |

> หลักการ: **dev** ใช้ A หรือ B (เลี่ยง CORS), **prod** ถ้าแยก host ค่อยใช้ C (ต้องคุม credentials ให้ดี). ดูข้อ 6 ประกอบ

---

## 2. CORS Policy Setup (สำหรับ separate origin + cookies)

`AddCors` + named policy + `UseCors` — ตรวจกับ ASP.NET Core 10

```csharp
// Program.cs (API project)
const string SpaCors = "spa-cors";

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy(SpaCors, policy =>
    {
        policy.WithOrigins(
                  "https://localhost:5173",        // Vite dev
                  "https://app.contoso.com")       // prod SPA origin
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();                 // จำเป็นถ้าใช้ cookie auth
        // ถ้าต้องอ่าน custom header ฝั่ง JS: .WithExposedHeaders("x-total-count")
    });
});

builder.Services.AddControllers();
builder.Services.AddOpenApi();                     // ดูข้อ 5

var app = builder.Build();

app.UseHttpsRedirection();
app.UseRouting();
app.UseCors(SpaCors);                              // ★ ลำดับ: หลัง UseRouting, ก่อน UseAuthentication/UseAuthorization
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
```

> ⚠️ **กับดักที่พบบ่อย**:
> - `AllowAnyOrigin()` + `AllowCredentials()` **ใช้ร่วมกันไม่ได้** — spec ห้าม และ CORS service จะคืน response ที่ invalid. ถ้าใช้ cookie ต้องระบุ origin ด้วย `WithOrigins(...)` แบบ explicit เสมอ (ห้าม `"*"`)
> - ฝั่ง React ต้องส่ง credentials เอง: `fetch(url, { credentials: "include" })` หรือ `axios` ตั้ง `withCredentials: true` — ไม่งั้น cookie ไม่ถูกแนบ
> - **ลำดับ middleware**: `UseCors` ต้องมาก่อน `UseResponseCaching` และก่อน endpoint ที่ใช้ CORS. ถ้าใช้ static files แบบ JS-fetch ข้าม site ต้องเรียก `UseCors` ก่อน `UseStaticFiles`

### CORS แบบ per-endpoint (คุมละเอียดกว่า)

```csharp
// Minimal API — ผูก policy เฉพาะ endpoint
app.MapGet("/api/public", () => Results.Ok())
   .RequireCors(SpaCors);

// Controller — ใช้ attribute (อย่าผสม attribute + default policy ในแอปเดียวกัน)
[EnableCors(SpaCors)]
[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase { /* ... */ }
```

> `[EnableCors("policy")]` ให้การควบคุมที่ละเอียดที่สุด (เปิด CORS เฉพาะ endpoint ที่ต้องการ). หลีกเลี่ยงการผสม `[EnableCors]` กับ middleware default policy ในแอปเดียว — เอกสารแนะนำให้เลือกอย่างใดอย่างหนึ่ง

---

## 3. Vite Dev Proxy vs Aspire Orchestration

### 3.1 Vite dev proxy (Topology A — เลี่ยง CORS ตอน dev)

ตั้ง `server.proxy` ใน `vite.config.ts` ให้ Vite forward request ที่ขึ้นต้นด้วย `/api` ไป backend → browser เห็นเป็น same-origin (`localhost:5173`) จึงไม่ต้องตั้ง CORS

```ts
// vite.config.ts
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // VS template อ่าน port จาก env ของ ASP.NET Core; ปรับให้ตรง launchSettings.json
  const target =
    env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
    env.ASPNETCORE_URLS       ? env.ASPNETCORE_URLS.split(";")[0] :
    "https://localhost:7183";

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        "/api": { target, changeOrigin: true, secure: false },
      },
    },
  };
});
```

ฝั่ง React เรียกแบบ relative path → ไม่ต้องรู้ host ของ API:

```ts
const res = await fetch("/api/orders");   // Vite proxy → backend
```

> ⚠️ port mismatch เป็นปัญหา #1: ค่า `target` ต้องตรงกับ `applicationUrl` (https) ใน `Properties/launchSettings.json` ของ API. ถ้าเห็น `ECONNREFUSED` มักเป็นเพราะ frontend start ก่อน backend หรือ port ไม่ตรง

### 3.2 Aspire orchestration (Topology B — แนะนำสำหรับ cloud-native / dual-DB)

ให้ Aspire AppHost เป็นคนสตาร์ท React + API + Postgres + SQL Server + Redis พร้อมกัน และ inject service-discovery URL เข้า React ผ่าน env (ไม่ต้อง hard-code proxy target). ดูข้อ 4

> เทียบกัน: **Vite proxy** = frontend dev server เป็นคน proxy (config อยู่ฝั่ง JS ทั้งหมด, ASP.NET Core ไม่รู้เรื่อง). **Aspire** = orchestrator inject endpoint URL ให้ทุก resource + ดู logs/traces รวมใน dashboard เดียว เหมาะกับ multi-service

---

## 4. Aspire AddViteApp / AddNpmApp (orchestrate React + WithReference API)

> ⚠️ **สำคัญ — package ย้ายที่ใน Aspire 13**: ใน Aspire 13 `AddViteApp` / `AddNodeApp` / `AddJavaScriptApp` / `WithNpm` / `WithViteConfig` อยู่ใน **`Aspire.Hosting.JavaScript`** (v13.1.0, namespace `Aspire.Hosting`, class `JavaScriptHostingExtensions`). ส่วน `AddNpmApp` รุ่นเดิมอยู่ใน **`Aspire.Hosting.NodeJs`** (v9.x, class `NodeAppHostingExtension`). **ตรวจ package ที่ติดตั้งจริงด้วย `microsoft_docs_search` ก่อน** เพราะ API surface กำลัง consolidate

```csharp
// MyApp.AppHost/AppHost.cs  (Aspire 13)
var builder = DistributedApplication.CreateBuilder(args);

// ===== Backend API + DB (ย่อ — ดู aspire-setup.md สำหรับ dual-DB เต็ม) =====
var appdb = builder.AddPostgres("postgres").AddDatabase("appdb");

var api = builder.AddProject<Projects.MyApp_Api>("api")
    .WithReference(appdb)
    .WithHttpHealthCheck("/health")
    .WaitFor(appdb)
    .WithExternalHttpEndpoints();

// ===== React (Vite) frontend =====
// AddViteApp(name, appDirectory, runScriptName = "dev")  — Aspire.Hosting.JavaScript v13.1.0
// .WithReference(api) inject service-discovery env ("services__api__https__0=https://...")
//   → ฝั่ง Vite อ่านผ่าน import.meta.env / process.env เพื่อรู้ URL ของ api
var frontend = builder.AddViteApp("frontend", "../MyApp.Web")
    .WithReference(api)
    .WaitFor(api)
    .WithNpm()                       // ใช้ npm เป็น package manager + auto npm install ก่อน start
    .WithExternalHttpEndpoints();

builder.Build().Run();
```

### ทางเลือก: `AddNpmApp` (รัน npm script ที่ระบุ)

```csharp
// AddNpmApp(name, workingDirectory, scriptName = "start", args?)
//   - Aspire.Hosting.NodeJs v9.x: default scriptName = "start"
//   - ระบุ scriptName = "dev" ให้ตรงกับ Vite (script เริ่มต้นของ Vite คือ "dev")
var web = builder.AddNpmApp("web", "../MyApp.Web", scriptName: "dev")
    .WithReference(api)
    .WaitFor(api)
    .WithHttpEndpoint(env: "PORT")   // ให้ Aspire กำหนด port ผ่าน env PORT
    .WithExternalHttpEndpoints();
```

> ความต่าง:
> - **`AddViteApp`** = รู้จัก Vite โดยเฉพาะ (default `runScriptName = "dev"`, มี `WithViteConfig(path)` ชี้ไฟล์ config), เหมาะที่สุดสำหรับ React+Vite
> - **`AddNpmApp`** = generic npm script runner (default `"start"`) — ใช้ได้กับ framework อื่น แต่ต้องตั้ง endpoint/port เอง
> - ทั้งคู่: ถ้าไม่มี Dockerfile ในโฟลเดอร์ Aspire จะ generate ให้ตอน publish

> ℹ️ **node availability**: `AddNodeApp`/`AddNpmApp` ต้องมี Node.js บน PATH ของเครื่อง dev/CI. ถ้าโฟลเดอร์มี `package.json` Aspire จะตั้ง npm เป็น default package manager ให้

### อ่าน API endpoint ฝั่ง Vite

`WithReference(api)` จะ inject env var รูปแบบ `services__api__https__0=https://localhost:<port>` (service discovery) — ฝั่ง Vite ใช้ตอน config proxy หรือ build-time base URL ได้ (ผ่าน `loadEnv` / `process.env`)

---

## 5. สร้าง TypeScript Client จาก OpenAPI (built-in `/openapi/v1.json`)

ใช้ OpenAPI document ที่ Feature #7 (`AddOpenApi`) สร้างให้ เป็น source-of-truth สร้าง typed client → ไม่ต้องเขียน fetch wrapper เอง

### 5.1 ฝั่ง API: เปิด OpenAPI (built-in, .NET 9+)

```csharp
// Program.cs
builder.Services.AddOpenApi();          // Microsoft.AspNetCore.OpenApi (v10)

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();                   // เสิร์ฟที่ /openapi/v1.json (default doc name = v1)
}
```

> built-in OpenAPI ของ .NET 10 สร้างเอกสาร **OpenAPI 3.1** เป็น default (เปลี่ยนได้ผ่าน `options.OpenApiVersion`). ต้องการ commit spec ลง repo / สร้างตอน build ให้เพิ่ม package `Microsoft.Extensions.ApiDescription.Server` (build-time generation)

### 5.2 ทางเลือก A — `openapi-typescript` (community npm tool; types-only, น้ำหนักเบา)

> ⚠️ **caveat**: `openapi-typescript` / `openapi-fetch` เป็น **open-source community tools (ไม่ใช่ของ Microsoft)** — ไม่มีในเอกสาร Microsoft Learn. ตรวจ usage/flags ล่าสุดจาก repo ของ tool เองก่อนใช้

```bash
# generate TypeScript types จาก built-in OpenAPI doc
npx openapi-typescript http://localhost:5232/openapi/v1.json -o src/api/schema.d.ts
```

```ts
// ใช้คู่กับ openapi-fetch ได้ typed fetch (community tool)
import createClient from "openapi-fetch";
import type { paths } from "./api/schema";

const api = createClient<paths>({ baseUrl: "/api" });
const { data, error } = await api.GET("/orders/{id}", { params: { path: { id: 1 } } });
```

### 5.3 ทางเลือก B — NSwag (สร้าง full client class; Microsoft-documented)

NSwag generate ได้ทั้ง C# และ TypeScript client. Microsoft Learn มี tutorial (เวอร์ชันเอกสารเป็น 8.0 — ตัว NSwag เป็น community package ของ Rico Suter, ใช้ได้กับ .NET 10)

```bash
# วิธีแนะนำใน .NET 10: เรียก NSwag CLI ตรง ๆ (ดู caveat ข้อถัดไป)
npx nswag openapi2tsclient /input:http://localhost:5232/openapi/v1.json /output:src/api/client.ts
# หรือผ่าน .nswag config file: dotnet tool run nswag run nswag.json
```

> 🚨 **CRITICAL — breaking change .NET 10**: MSBuild item `<OpenApiReference>`, property `OpenApiProjectReference`, CLI `dotnet openapi`, และ package **`Microsoft.Extensions.ApiDescription.Client` ถูก deprecated ใน .NET 10**. **อย่าใช้ `dotnet openapi add ...` หรือ `<OpenApiReference>` ในโปรเจคใหม่.** เอกสารแนะนำให้เรียก generator-specific tooling ตรง ๆ แทน:
> - **NSwag** — `npx nswag` หรือ `dotnet tool run nswag` + ไฟล์ `.nswag`
> - **Kiota** — `dotnet tool install -g Microsoft.OpenApi.Kiota` แล้ว `kiota generate`
> - **openapi-generator** — เรียกผ่าน JAR / Docker
> แล้ว commit generated client หรือใส่ใน custom pre-build step (อย่าพึ่ง package ที่ถูกถอด)

> สรุปการเลือก: **types-only + เบา** → `openapi-typescript` (B5.2). **full client class / มีทั้ง C# + TS** → NSwag หรือ Kiota (B5.3). ใน .NET 10 เรียก tool ตรง ๆ ทุกกรณี

---

## 6. Auth สำหรับ SPA: Cookie vs JWT + BFF Pattern

### 6.1 Cookie vs JWT — trade-offs (อิงคำแนะนำ Microsoft)

| | **Cookie (HttpOnly)** | **JWT bearer (token)** |
|---|---|---|
| เก็บที่ไหน | browser จัดการเอง (HttpOnly → JS อ่านไม่ได้) | ต้องเก็บเอง (memory/localStorage = เสี่ยง XSS) |
| XSS exposure | ต่ำ (HttpOnly) | สูงถ้าเก็บใน localStorage |
| CSRF | ต้องป้องกัน (anti-forgery token) | ไม่ต้อง (token ส่ง explicit ผ่าน header) |
| Cross-domain | ยุ่ง (ต้อง `AllowCredentials` + `SameSite`) | ง่าย (Authorization header) |
| คำแนะนำ MS | ✅ **แนะนำสำหรับ browser-based SPA** | สำหรับ client ที่ใช้ cookie ไม่ได้ (native/mobile) |

> 🔑 **คำแนะนำหลักจาก Microsoft**: สำหรับ **browser-based app แนะนำ cookie** เพราะ browser จัดการให้โดยไม่ exposed ต่อ JavaScript. ถ้าจำเป็นต้องใช้ token-based ในเว็บ คุณต้องรับผิดชอบเก็บ token ให้ปลอดภัยเอง
>
> 🔑 **อย่าสร้าง access token เอง**: ใช้มาตรฐาน **OpenID Connect / OAuth** เสมอ, ใช้ **asymmetric keys**, และ **ห้ามออก access token จาก username/password request** — สร้าง token เองได้เฉพาะ test scenario

### 6.2 ตั้ง auth schemes (cookie + JWT อยู่ด้วยกันได้)

```csharp
// Program.cs
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme,
        options => builder.Configuration.Bind("JwtSettings", options))
    .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme,
        options => builder.Configuration.Bind("CookieSettings", options));
```

### 6.3 Identity API สำหรับ SPA (cookie-first, ง่ายสุด)

ASP.NET Core Identity มี endpoint สำเร็จรูป secure Web API ด้วย cookie สำหรับ Angular/React/Vue:

```csharp
// secure Web API backend สำหรับ SPA ด้วย cookie auth
builder.Services.AddAuthentication().AddIdentityCookies();
// ... AddIdentityApiEndpoints<TUser>() / AddDbContext ... แล้ว map:
app.MapIdentityApi<AppUser>();          // /register /login /refresh ...
```

> - `/login` ตั้ง `?useCookies=true` → ออก cookie (แนะนำสำหรับเว็บ)
> - `/login` (ไม่ตั้ง useCookies) → ออก **custom token** ของ Identity (ไม่ใช่ JWT มาตรฐาน) + refresh token — ใช้สำหรับ client ที่ใช้ cookie ไม่ได้
> - ฝั่ง `fetch` ต้องตั้ง `credentials: "include"` cookie ถึงจะถูกแนบ

### 6.4 BFF (Backend-For-Frontend) pattern

แนวคิด: SPA คุยกับ **BFF (server ฝั่งเดียวกับ origin ของ SPA)** ด้วย **cookie (HttpOnly)** เท่านั้น; BFF เก็บ access/refresh token ไว้ฝั่ง server แล้ว proxy ไป downstream API ด้วย JWT → token ไม่เคยถึง browser (กัน XSS token theft)

```text
[React SPA] --cookie(HttpOnly)--> [BFF (ASP.NET Core)] --JWT bearer--> [Downstream API]
                                       └─ เก็บ token ฝั่ง server, แนบ Authorization ให้
```

Microsoft แนะนำใช้ **YARP (Yet Another Reverse Proxy)** ทำ proxy layer ของ BFF — YARP จัดการ forward request + ใส่ logic ขอ access credential ใหม่ได้ ตัวอย่าง BFF + YARP + Aspire มีในเอกสาร Blazor Web App security (with-yarp-and-aspire)

```csharp
// แนวทาง BFF: cookie ฝั่ง browser + JWT ไป downstream (อิง JWT bearer doc ของ MS)
// "สำหรับ secure web app ต้องมี backend เก็บ access token บน trusted server,
//  แชร์เฉพาะ secure HttpOnly cookie ให้ browser"
builder.Services.AddAuthentication(/* OIDC scheme */)
    .AddCookie()
    .AddOpenIdConnect(/* ... PKCE auth code flow ... */);
// + YARP reverse proxy ส่งต่อไป downstream API พร้อม access token
```

> เมื่อไหร่ใช้ BFF: SPA + microservices/external API, ต้องการความปลอดภัยสูงสุด (token ไม่อยู่ใน browser). ราคาที่จ่าย: เพิ่ม hop + ต้อง deploy/scale BFF. โปรเจคเล็ก same-origin → Identity cookie (6.3) พอแล้ว

---

## 7. Host React: SPA Proxy vs Separate Origin

### 7.1 SPA proxy (dev) — `Microsoft.AspNetCore.SpaProxy`

VS templates (`.esproj` + ASP.NET Core) ใช้รูปแบบใหม่ตั้งแต่ .NET 6: dev server ของ frontend เป็นคน proxy request ไป backend (config อยู่ฝั่ง frontend ทั้งหมด), ส่วน `Microsoft.AspNetCore.SpaProxy` inject logic สตาร์ท frontend dev server ตอน dev

```bash
# รัน server project — จะ auto-start frontend dev server ให้
dotnet run --launch-profile https     # ★ https profile จำเป็นในปัจจุบัน
```

> `SpaProxyingExtensions` (`Microsoft.AspNetCore.SpaServices.Extensions` v10.0.0) — สำหรับ **dev เท่านั้น ห้ามใช้ production**. รูปแบบนี้ fallback routing ผ่าน endpoint routing (ไม่ใช่ SPA middleware เก่า)

### 7.2 Separate origin (prod) — แยก deploy React static + API

```text
[CDN / Static Web App]  app.contoso.com     →  React build (dist/) static files
[API host]              api.contoso.com      →  ASP.NET Core API
```

ต้องมี: (1) **CORS** ที่ API (ข้อ 2, ระบุ origin + `AllowCredentials` ถ้าใช้ cookie), (2) cookie ตั้ง `SameSite=None; Secure` ถ้า cross-site, หรือ (3) ใช้ **BFF** (ข้อ 6.4) เพื่อให้ browser คุยกับ origin เดียว

### 7.3 Co-host (deploy ก้อนเดียว) — เสิร์ฟ React จาก ASP.NET Core

```csharp
// build React ลง wwwroot แล้วเสิร์ฟเป็น static + SPA fallback
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapControllers();
app.MapFallbackToFile("/index.html");   // client-side routing → index.html
```

### สรุปการเลือก host

| สถานการณ์ | เลือก |
|-----------|-------|
| Dev บน workstation | **SPA proxy (7.1)** หรือ **Aspire (ข้อ 4)** — เลี่ยง CORS |
| Prod, แยก scale frontend/backend, CDN | **Separate origin (7.2)** + CORS/BFF |
| Prod, monolith, deploy ง่าย | **Co-host (7.3)** — ไม่ต้อง CORS |
| Cloud-native, multi-service, dual-DB | **Aspire (ข้อ 4)** ทั้ง dev และ publish |

---

## เวอร์ชันที่อ้างอิง (ตรวจ ณ 2026-06-13)

| Component | Version | API ที่ใช้ในไฟล์นี้ | view ในเอกสาร |
|-----------|---------|----------------------|---------------|
| .NET | 10 (LTS) | — | — |
| ASP.NET Core CORS | 10 | `AddCors` / `AddPolicy` / `UseCors` / `AllowCredentials` / `RequireCors` / `[EnableCors]` | aspnetcore-10.0 |
| ASP.NET Core Auth | 10 | `AddAuthentication` / `AddJwtBearer` / `AddCookie` / `AddBearerToken` / `MapIdentityApi` | aspnetcore-10.0 |
| Microsoft.AspNetCore.OpenApi | 10 | `AddOpenApi` / `MapOpenApi` → `/openapi/v1.json` (OpenAPI 3.1 default) | aspnetcore-10.0 |
| Microsoft.AspNetCore.SpaServices.Extensions | 10.0.0 | `SpaProxyingExtensions` (dev only) | aspnetcore-10.0 |
| Aspire.Hosting.JavaScript | 13.1.0 | `AddViteApp` / `AddNodeApp` / `AddJavaScriptApp` / `WithNpm` / `WithViteConfig` | dotnet-aspire-13.0 |
| Aspire.Hosting.NodeJs | 9.x | `AddNpmApp` (default scriptName `"start"`) | dotnet-aspire-9.0 |
| Aspire.Hosting | 13.1.0 | `WithReference` (service discovery env injection) | dotnet-aspire-13.0 |

### ⚠️ ข้อควรระวัง / caveat ที่ verify แล้ว

1. **`dotnet openapi` + `<OpenApiReference>` + `Microsoft.Extensions.ApiDescription.Client` = deprecated ใน .NET 10** (breaking change). ใช้ NSwag CLI / Kiota / openapi-generator เรียกตรง ๆ แทน — อย่าใช้ในโปรเจคใหม่
2. **`AddViteApp`/`AddNpmApp` ข้าม package**: Aspire 13 ย้าย Vite/Node ส่วนใหญ่ไป `Aspire.Hosting.JavaScript` (v13.1.0); `AddNpmApp` ยังอยู่ `Aspire.Hosting.NodeJs` (v9.x). ตรวจ package ที่ติดตั้งจริงด้วย `microsoft_docs_search "Aspire AddViteApp"` ก่อน pin version
3. **`openapi-typescript` / `openapi-fetch` เป็น community tool** (ไม่ใช่ของ Microsoft, ไม่มีใน MS Learn) — flags/usage ตรวจจาก repo ของ tool เอง. NSwag tutorial ใน MS Learn เป็นเวอร์ชันเอกสาร 8.0 (ตัว NSwag เป็น community package ของ Rico Suter)
4. **`AllowAnyOrigin()` + `AllowCredentials()` ใช้ร่วมกันไม่ได้** — ต้องระบุ `WithOrigins(...)` แบบ explicit เมื่อใช้ cookie
5. รัน `microsoft_docs_search` ยืนยัน signature ล่าสุดก่อน generate code จริงเสมอ (Aspire ปล่อยเวอร์ชันบ่อย)
