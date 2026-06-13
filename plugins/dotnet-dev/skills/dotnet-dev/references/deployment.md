# Deployment (Aspire 13 / .NET 10)

> ✅ ทุก API/คำสั่งในไฟล์นี้ตรวจกับ Microsoft Learn (Aspire 13.1.0 / EF Core 10 / .NET 10) แล้ว
> ภาพรวม: dev ใช้ `aspire run`, deploy ใช้ **(A)** `azd up` → Azure Container Apps (ตรงสุด) หรือ **(B)** `aspire publish -o <dir>` → artifacts (docker-compose / k8s) แล้ว deploy เอง
> ⚠️ EF migrations ใน production: **อย่า** เรียก `MigrateAsync()` ตอน app startup แบบ multi-instance — ใช้ migration bundle หรือ **dedicated migration service** (ดู section 5) ให้สอดคล้องกับ `efcore-patterns` skill

## 1. `aspire publish` → Artifacts

`aspire publish` เป็น CLI command ที่ประมวลผล resource ทุกตัวใน AppHost ที่มี publish behavior แล้วเขียน artifacts (Dockerfile, compose, manifests, bundle, ฯลฯ) ลง output directory — ใช้เมื่อ deploy เองด้วย tool อื่น (CI/CD, GitOps) ไม่ผ่าน `azd`

```bash
# สร้าง artifacts ทั้งหมดลง ./artifacts (ใช้ default publisher; ตั้งแต่ Aspire 9.3 ไม่ต้องเลือก publisher แล้ว)
aspire publish -o ./artifacts
```

> Aspire 9.2 มี `AddDockerComposePublisher` / `AddKubernetesPublisher` / `AddAzurePublisher` — ถูก **ถอด** ใน 9.3 (ยังถอดอยู่ใน 13) แทนด้วย **environment resources** (section 3–4). default publisher จะ process resource ที่มี publish annotation ทั้งหมดเอง

### เลือก target ของ `aspire publish` ใน AppHost
```csharp
// AppHost.cs — ประกาศ compute environment ที่จะให้ aspire publish gen artifacts ให้
var builder = DistributedApplication.CreateBuilder(args);

builder.AddDockerComposeEnvironment("docker-compose");  // → docker-compose.yaml + .env
builder.AddKubernetesEnvironment("k8s");                // → k8s manifests + Helm chart
builder.AddAzureEnvironment("azure");                   // auto-added เมื่อมี Azure resource ใดๆ

builder.Build().Run();
```

> ทั้ง 3 method เป็น API ปัจจุบัน (Aspire 13.1.0; `Aspire.Hosting.Docker` / `Aspire.Hosting.Kubernetes`). เลือกใส่เท่าที่ใช้ — ถ้า deploy ACA ผ่าน `azd` ไม่ต้องประกาศ `AddAzureEnvironment` เอง (azd ใช้ manifest ตรงๆ)

---

## 2. `azd up` → Azure Container Apps (แนะนำสำหรับ Azure)

`azd` (Azure Developer CLI) มี integration เฉพาะกับ Aspire: มันรัน AppHost ในโหมด manifest, gen Bicep ในหน่วยความจำ, build container images ด้วย .NET SDK container support, push เข้า ACR แล้ว deploy

```bash
# 0) ติดตั้ง azd (Windows). macOS: brew tap azure/azd && brew install azd
winget install microsoft.azd

# 1) init (ครั้งแรก ในโฟลเดอร์ solution) — gen ./azure.yaml + ./next-steps.md
azd init
#    เลือก "Use code in the current directory"
#    → "Confirm and continue initializing my app" (azd detect AppHost project)
#    → ตั้งชื่อ environment เช่น "dev" / "prod"

# 2) login
azd auth login

# 3) provision + deploy (prompt เลือก subscription + location ครั้งแรก)
azd up
```

ไฟล์ที่ `azd init` สร้าง:

```yml
# azure.yaml — map Aspire AppHost → Azure resources
name: MyApp
services:
  app:
    language: dotnet
    project: ./MyApp.AppHost/MyApp.AppHost.csproj
    host: containerapp
```

`azd up` ทำให้: สร้าง resource group + ACR + Container Apps Environment, build/containerize ทุก project, push images, deploy เป็น Container Apps พร้อม managed Aspire Dashboard. ปลายทาง print endpoint URLs

> `azd init` gen `azure.yaml` + โฟลเดอร์ `.azure/` ที่มักไม่ commit — ใน CI ให้รัน `azd init --from-code --no-prompt` ก่อน provision. **secret parameters** (`AddParameter(..., secret: true)` ที่ไม่มี default) → `azd` จะ prompt ค่าตอน deploy และเก็บใน environment (`azd env set-secret`) — ดู section 6

### Azure provisioning ใน AppHost (RunAsContainer สำหรับ local)
```csharp
// dev: container ในเครื่อง / deploy: Azure managed resource
var postgres = builder.AddAzurePostgresFlexibleServer("postgres")
    .RunAsContainer();                 // local เป็น container, publish เป็น Flexible Server
var appdb = postgres.AddDatabase("appdb");

builder.AddProject<Projects.MyApp_Api>("api")
    .WithReference(appdb)
    .WaitFor(appdb)
    .WithExternalHttpEndpoints();
```

---

## 3. Docker — SDK container publish / Dockerfile / docker-compose

### 3.1 ทางลัด: .NET SDK container publish (ไม่ต้องเขียน Dockerfile)

ตั้งแต่ .NET SDK 8.0.200 container support มาในตัว (ไม่ต้อง NuGet เพิ่ม). gen image โดยไม่มี Dockerfile, ใช้ base image ที่ Microsoft optimize, default non-root user `app`

```bash
# build เป็น container image ลง local Docker daemon
dotnet publish -c Release -t:PublishContainer

# กำหนด RID + push เข้า registry (เช่น GitHub Container Registry)
dotnet publish -c Release --os linux --arch x64 \
    -t:PublishContainer \
    -p ContainerRegistry=ghcr.io

# หรือใช้ publish profile
dotnet publish -c Release -p:PublishProfile=DefaultContainer
```

```xml
<!-- MyApp.Api.csproj — ตั้งชื่อ image/registry/tag ผ่าน MSBuild properties -->
<PropertyGroup>
  <ContainerRegistry>registry.mycorp.com:5000</ContainerRegistry>
  <ContainerRepository>myapp/api</ContainerRepository>
  <ContainerImageTags>1.0.0;latest</ContainerImageTags>
  <!-- console/worker ต้องเปิด explicit: <EnableSdkContainerSupport>true</EnableSdkContainerSupport> -->
</PropertyGroup>
```

> รองรับทุก registry ที่ทำ Docker Registry HTTP API V2 (ACR, ECR, Google Artifact Registry, Docker Hub). registry ที่ต้อง auth ใช้ `docker login` ปกติ. จะ gen เป็น `.tar.gz` แทน push ได้ด้วย `-p ContainerArchiveOutputPath=./images/api.tar.gz` (เหมาะกับ scan image ก่อน push)

### 3.2 Dockerfile (multi-stage) สำหรับ API — เมื่อต้องการคุมเอง

```dockerfile
# ---- build stage ----
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
# copy .csproj ก่อน → cache layer ของ restore (เร็วขึ้นเมื่อ source เปลี่ยนแต่ deps ไม่เปลี่ยน)
COPY ["MyApp.Api/MyApp.Api.csproj", "MyApp.Api/"]
COPY ["MyApp.Infrastructure/MyApp.Infrastructure.csproj", "MyApp.Infrastructure/"]
RUN dotnet restore "MyApp.Api/MyApp.Api.csproj"
COPY . .
RUN dotnet publish "MyApp.Api/MyApp.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ---- runtime stage (ASP.NET Core 10) ----
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
# ASP.NET Core images listen ที่ port 8080 (default ตั้งแต่ .NET 8 — ไม่ใช่ 80) และรันด้วย non-root user 'app'
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080
ENTRYPOINT ["dotnet", "MyApp.Api.dll"]
```

> security/ขนาด: ใช้ **chiseled** images (`mcr.microsoft.com/dotnet/aspnet:10.0-noble-chiseled`) — เล็กกว่า ~100 MB, CVE น้อยกว่า, ไม่มี shell/package manager, non-root user `app` เปิดอยู่แล้ว. ปักหมุด digest (`@sha256:...`) ได้ใน production. คุม port ผ่าน `ASPNETCORE_HTTP_PORTS` / `ASPNETCORE_URLS`

### 3.3 ให้ Aspire ใช้ Dockerfile ที่เขียนเอง + publish เป็น compose service

```csharp
// AppHost.cs — สร้าง container resource จาก Dockerfile ของเรา
// AddDockerfile(name, contextPath, dockerfilePath = "Dockerfile", stage = null)
var worker = builder.AddDockerfile("legacy-worker", "../LegacyWorker");

// customize docker-compose service ที่ aspire publish gen ให้
builder.AddContainer("redis", "redis:alpine")
    .PublishAsDockerComposeService((resource, service) =>
    {
        service.Name = "redis";
        service.Restart = "unless-stopped";
    });

// gen artifacts:  aspire publish -o ./artifacts  →  docker-compose.yaml
```

> `AddDockerfile` และ `PublishAsDockerComposeService<T>` เป็น API ปัจจุบัน (Aspire 13.1.0, `Aspire.Hosting.Docker`). `contextPath` relative กับ AppHost dir, `dockerfilePath` relative กับ context (default `Dockerfile`)

---

## 4. Kubernetes — generate manifests

Aspire gen Kubernetes manifests (Deployment/Service/ConfigMap/Secret + Helm chart) จาก dependency graph ของ AppHost อัตโนมัติ — ไม่ต้องเขียน YAML เอง

```csharp
// AppHost.cs
var k8s = builder.AddKubernetesEnvironment("k8s")
    .WithProperties(env => env.HelmChartName = "myapp");   // customize (optional)

builder.AddProject<Projects.MyApp_Api>("api");
```

```bash
# gen manifests ลง ./k8s-manifests (Deployments/StatefulSets, Services, ConfigMaps/Secrets, Helm chart, PV/PVC)
aspire publish -o ./k8s-manifests

# deploy
kubectl apply -f ./k8s-manifests
# หรือถ้ามี Helm chart:
helm install myapp ./k8s-manifests/charts/myapp
```

> ต้องมี package `Aspire.Hosting.Kubernetes` ใน AppHost (`dotnet add package Aspire.Hosting.Kubernetes`). manifests sync env vars / ports / connection strings ให้ตาม references อัตโนมัติ

---

## 5. EF Core Migrations ใน Production ⭐

> 🎯 หลักการ (สอดคล้อง `efcore-patterns` skill): **อย่า apply migrations ตอน app startup ใน production แบบ multi-instance** — MS Learn ระบุชัดว่าไม่เหมาะ เพราะ (1) หลาย instance รัน migrate พร้อมกัน → corrupt, (2) app เข้าถึง DB ตอน schema เปลี่ยนกลางคัน, (3) app ต้องมีสิทธิ์ DDL ตลอด (ควรจำกัด), (4) rollback ยาก
> EF Core 9+ เพิ่ม **migration locking** (lock DB-wide ก่อน apply) กัน corrupt จาก concurrent migrate — แต่ก็ยัง **แนะนำให้ apply ตอน deploy ไม่ใช่ตอน startup**

มี 2 กลยุทธ์หลัก (เลือกตาม pipeline):

### 5.1 Migration Bundle — self-contained executable (เหมาะกับ CI/CD ทั่วไป)

`dotnet ef migrations bundle` สร้าง executable ตัวเดียว (`efbundle` / `efbundle.exe`) ที่บรรจุ migrations + โค้ด apply ในตัว — รันได้โดย **ไม่ต้องมี .NET SDK / EF tool / source code** บนเครื่อง production (ถ้า `--self-contained` ไม่ต้องมี .NET runtime ด้วย)

```bash
# สร้าง bundle (default runtime = เครื่องปัจจุบัน)
dotnet ef migrations bundle --project ../MyApp.Infrastructure --startup-project .

# self-contained สำหรับ Linux x64 (ไม่ต้องมี .NET runtime บน target)
dotnet ef migrations bundle --self-contained -r linux-x64 -o ./efbundle --force

# ── ใน deploy step: apply migrations (idempotent — รันซ้ำปลอดภัย) ──
# ใช้ connection string จาก appsettings.json ข้างๆ bundle...
./efbundle
# ...หรือชี้ production DB ตรงๆ
./efbundle --connection "Host=prod-pg;Database=appdb;Username=migrator;Password=$DB_PW"
```

ตัวเลือกที่ใช้บ่อย: `--self-contained`, `-r|--target-runtime <RID>`, `-o|--output <FILE>`, `--context <DbContext>` (มีหลาย context), `-f|--force` (เขียนทับ bundle เดิม), `--connection`

> ⚠️ bundle ที่ **ไม่ self-contained** ต้องมี `appsettings.json` วางข้างๆ ตอนรัน (ใช้อ่าน connection string). bundle เป็น **idempotent**: apply เฉพาะ migration ที่ยังไม่เคยลง (เทียบกับ migrations history table) — รันซ้ำไม่ทำอะไรถ้า up-to-date
> 🔁 ทางเลือก SQL script: `dotnet ef migrations script --idempotent -o migrate.sql` แล้วให้ DBA รัน — เหมาะกับองค์กรที่ต้องให้คนตรวจ SQL ก่อน

### 5.2 Dedicated Migration Service — one-shot worker ที่รันก่อน app (เหมาะกับ Aspire/container)

แยก migration ออกเป็น **Worker Service** ต่างหาก ที่ apply migrations แล้ว **หยุดตัวเอง** — AppHost บังคับให้ API **รอจน migration เสร็จก่อน** ค่อย start (กัน app แตะ DB ก่อน schema พร้อม + ไม่ต้องให้ทุก instance ของ API มีสิทธิ์ DDL)

```csharp
// MyApp.MigrationService/Program.cs
var builder = Host.CreateApplicationBuilder(args);
builder.AddServiceDefaults();
builder.Services.AddHostedService<MigrationWorker>();
builder.AddNpgsqlDbContext<ApplicationDbContext>("appdb");   // หรือ AddSqlServerDbContext<T>("appdb-sql")
builder.Build().Run();
```

```csharp
// MyApp.MigrationService/MigrationWorker.cs
public class MigrationWorker(
    IServiceProvider services,
    IHostApplicationLifetime lifetime) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // ใช้ execution strategy กัน transient error (อย่า wrap MigrateAsync ใน explicit transaction —
        // EF Core 9+ ห้าม เพราะกันไม่ให้ acquire migration lock; จะ throw MigrationsUserTransactionWarning)
        var strategy = db.Database.CreateExecutionStrategy();
        await strategy.ExecuteAsync(async () =>
            await db.Database.MigrateAsync(ct));

        lifetime.StopApplication();   // ← one-shot: เสร็จแล้วหยุด
    }
}
```

```csharp
// AppHost.cs — migration service รันก่อน แล้ว API รอจน "เสร็จสมบูรณ์"
var pg = builder.AddPostgres("postgres").AddDatabase("appdb");

var migrations = builder.AddProject<Projects.MyApp_MigrationService>("migrations")
    .WithReference(pg)
    .WaitFor(pg);

builder.AddProject<Projects.MyApp_Api>("api")
    .WithReference(pg)
    .WaitForCompletion(migrations);   // ← API ไม่ start จน migrations state = Finished
```

> ✅ pattern นี้คือที่ Aspire docs แนะนำ (`BackgroundService` + `CreateExecutionStrategy` + `MigrateAsync` + `IHostApplicationLifetime.StopApplication` + `WaitForCompletion`). seeding data ทำใน worker นี้ได้เลย (ใน execution strategy แยก + explicit transaction สำหรับ seed)
> dual-DB / หลาย DbContext: register ทุก context ใน worker เดียวแล้ว `MigrateAsync` ทีละตัว **หรือ** แยก migration service ต่อ DB (แนะนำ — isolation ดีกว่า)

### 5.3 Aspire `AddEFMigrations` — first-class API (ทางเลือกใหม่)

Aspire มี AppHost API `AddEFMigrations` (package `Aspire.Hosting.EntityFrameworkCore`) ที่ผูก migration เข้า orchestration + publish pipeline โดยไม่ต้องเขียน worker เอง

```csharp
// AppHost.cs
var db = builder.AddPostgres("pg").AddDatabase("appdb");
var api = builder.AddProject<Projects.Api>("api").WithReference(db);

var apiMigrations = api.AddEFMigrations("api-migrations")
    .WithMigrationsProject<Projects.Data>()    // ถ้า migrations อยู่คนละ project
    .RunDatabaseUpdateOnStart();               // local run: apply อัตโนมัติ (ไม่มีผลตอน publish/deploy)
api.WaitForCompletion(apiMigrations);

// publish: gen artifacts ลง efmigrations/ ; bundle wrap เป็น container ได้
// .PublishAsMigrationScript()                          // → idempotent SQL script
// .PublishAsMigrationBundle(publishContainer: true)    // → bundle เป็น container image (run-once)
//   .PublishAsAzureContainerAppJob();                  // ACA: รัน Job ครั้งเดียวแล้วหยุด
//   // Docker Compose: .PublishAsDockerComposeService((_, s) => s.Restart = "no");
```

> ⚠️ caveat: `AddEFMigrations` / `PublishAsMigrationBundle` / `PublishAsAzureContainerAppJob` ปรากฏใน aspire.dev docs (package `Aspire.Hosting.EntityFrameworkCore`) แต่ผมยัง pin เลข version ของ package นี้ไม่ได้ชัด — ถ้าจะใช้จริง รัน `microsoft_docs_search "Aspire AddEFMigrations"` ตรวจ signature + package version ปัจจุบันก่อน. ถ้าต้องการความนิ่ง ใช้ dedicated migration service (5.2) ซึ่งเป็น pattern stable ที่ docs แนะนำเป็นหลัก

---

## 6. Connection Strings / Secrets ใน Production

### 6.1 ลำดับชั้น: dev → deploy

| Context | เก็บ secret ที่ไหน | API |
|---------|--------------------|-----|
| Local dev | User Secrets (`secrets.json`) ของ AppHost | `builder.AddParameter("db-password", secret: true)` |
| Deploy (azd) | azd prompt + เก็บใน environment | `azd env set-secret <NAME>` |
| Production | **Azure Key Vault** / env vars ของ platform | `builder.AddAzureKeyVault("vault")` |

```csharp
// AppHost.cs — parameter เป็น secret: dev อ่านจาก user-secrets, azd prompt ตอน deploy
var dbPassword = builder.AddParameter("db-password", secret: true);
var pg = builder.AddPostgres("postgres", password: dbPassword).AddDatabase("appdb");
```

```jsonc
// AppHost user-secrets (dev เท่านั้น — `dotnet user-secrets set "Parameters:db-password" "..."`)
{ "Parameters": { "db-password": "dev-only-password" } }
```

### 6.2 Azure Key Vault (production)

```csharp
// AppHost.cs — provision Key Vault + เก็บ secret/connection string ลง vault
var vault = builder.AddAzureKeyVault("vault");

var secret = builder.AddParameter("db-password", secret: true);
vault.AddSecret("db-password", secret);                 // เก็บ parameter ลง vault

var api = builder.AddProject<Projects.MyApp_Api>("api")
    .WithReference(vault);                               // grant access (default: KeyVaultAdministrator role)
```

```csharp
// MyApp.Api/Program.cs — โหลด secrets จาก Key Vault เข้า IConfiguration
builder.AddServiceDefaults();
// connectionName "vault" map กับ ConnectionStrings:vault (VaultUri) — Aspire inject ให้ตอน deploy
builder.Configuration.AddAzureKeyVaultSecrets("vault");
// หรือ inject SecretClient (มี retry/health/telemetry):  builder.AddAzureKeyVaultClient("vault");
```

> `AddAzureKeyVault` (Aspire.Hosting.Azure.KeyVault 13.1.0), `AddAzureKeyVaultSecrets` / `AddAzureKeyVaultClient` (Aspire.Azure.Security.KeyVault 13.1.0), `vault.AddSecret(name, parameter|referenceExpression)` / `vault.GetSecret(name)` — ตรวจกับ MS Learn แล้ว
> ✅ best practice (MS Learn): register Key Vault เป็น configuration provider **ตัวสุดท้าย** (override provider อื่น). prod ใช้ **Managed Identity** ไม่ใช่ client secret. Key Vault เก็บเฉพาะ secret (connection string, password, key) — config ทั่วไป (IP, feature flag) ไปไว้ที่ App Configuration

### 6.3 ACA: reference secret จาก Key Vault ตรงๆ (เมื่อไม่ผ่าน Aspire model)

```bash
# Container App อ้าง secret ใน Key Vault ด้วย managed identity (user-assigned ต้องมีสิทธิ์อ่าน vault)
az containerapp create --name api --resource-group rg --environment env \
  --image myacr.azurecr.io/api:1.0.0 \
  --user-assigned "<UAMI_ID>" \
  --secrets "db-cs=keyvaultref:https://myvault.vault.azure.net/secrets/db-cs,identityref:<UAMI_ID>"
```

> migration service / efbundle ก็ดึง connection string จาก env var / Key Vault แบบเดียวกัน — ใช้ account ที่มีสิทธิ์ **DDL** สำหรับ migrate เท่านั้น ส่วน app runtime ใช้ account สิทธิ์จำกัด (least privilege)

---

## เวอร์ชันที่อ้างอิง (ตรวจ ณ 2026-06-13)

| Component | Version | หมายเหตุ |
|-----------|---------|----------|
| .NET | 10 (LTS) | runtime image `mcr.microsoft.com/dotnet/aspnet:10.0`, port 8080, non-root `app` |
| .NET SDK container | in-box ตั้งแต่ 8.0.200 | `-t:PublishContainer`, `PublishProfile=DefaultContainer` |
| Aspire.Hosting.Docker / Kubernetes | 13.1.0 | `AddDockerComposeEnvironment` / `AddKubernetesEnvironment` / `AddDockerfile` |
| Aspire.Hosting.Azure.KeyVault | 13.1.0 | `AddAzureKeyVault`, `AddSecret`, `GetSecret` |
| Aspire.Azure.Security.KeyVault | 13.1.0 | `AddAzureKeyVaultSecrets`, `AddAzureKeyVaultClient` |
| EF Core | 10 | `dotnet ef migrations bundle` (`--self-contained`, `-r`, `--connection`); migration locking (EF9+) |
| azd | 1.5.1+ | `azd init` / `azd auth login` / `azd up` |

> ⚠️ Aspire ปล่อยเวอร์ชันบ่อย + publisher API เคยเปลี่ยน (9.2→9.3) — รัน `microsoft_docs_search` ตรวจ command/signature ล่าสุดก่อน deploy จริงเสมอ. `AddEFMigrations` family (section 5.3) ยัง pin version ไม่ได้ชัด → ตรวจซ้ำก่อนใช้
