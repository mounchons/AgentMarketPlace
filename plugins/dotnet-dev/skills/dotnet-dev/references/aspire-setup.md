# .NET Aspire Setup & Configuration

## 1. Project Setup

### Create Aspire Solution
```bash
# Create new Aspire starter
dotnet new aspire-starter -n MyApp

# Or add Aspire to existing solution
dotnet new aspire-apphost -n MyApp.AppHost
dotnet new aspire-servicedefaults -n MyApp.ServiceDefaults
```

### Solution Structure
```
MyApp/
├── MyApp.AppHost/              # Orchestrator
│   ├── Program.cs
│   └── MyApp.AppHost.csproj
├── MyApp.ServiceDefaults/      # Shared configurations
│   ├── Extensions.cs
│   └── MyApp.ServiceDefaults.csproj
├── MyApp.Api/                  # Web API
├── MyApp.Web/                  # Blazor/Frontend
└── MyApp.Worker/               # Background worker
```

---

## 2. AppHost Configuration

### Basic Setup
```csharp
// MyApp.AppHost/Program.cs
var builder = DistributedApplication.CreateBuilder(args);

// ===== Infrastructure =====

// PostgreSQL with persistent volume
var postgres = builder.AddPostgres("postgres")
    .WithDataVolume("postgres-data")
    .WithPgAdmin()
    .AddDatabase("appdb");

// Redis with persistence
var redis = builder.AddRedis("redis")
    .WithDataVolume("redis-data")
    .WithRedisCommander();

// RabbitMQ
var rabbitmq = builder.AddRabbitMQ("messaging")
    .WithManagementPlugin()
    .WithDataVolume("rabbitmq-data");

// Elasticsearch
var elasticsearch = builder.AddElasticsearch("elasticsearch")
    .WithDataVolume("elasticsearch-data");

// ===== Applications =====

// API with all dependencies
var api = builder.AddProject<Projects.MyApp_Api>("api")
    .WithReference(postgres)
    .WithReference(redis)
    .WithReference(rabbitmq)
    .WithReference(elasticsearch)
    .WithExternalHttpEndpoints();

// Worker service
var worker = builder.AddProject<Projects.MyApp_Worker>("worker")
    .WithReference(postgres)
    .WithReference(rabbitmq);

// Web frontend
builder.AddProject<Projects.MyApp_Web>("web")
    .WithReference(api)
    .WithExternalHttpEndpoints();

builder.Build().Run();
```

### With Custom Parameters
```csharp
// Add parameters
var adminPassword = builder.AddParameter("admin-password", secret: true);

var postgres = builder.AddPostgres("postgres", password: adminPassword)
    .WithDataVolume()
    .AddDatabase("appdb");

// Environment-specific configuration
var api = builder.AddProject<Projects.MyApp_Api>("api")
    .WithReference(postgres)
    .WithEnvironment("ASPNETCORE_ENVIRONMENT", 
        builder.Environment.IsDevelopment() ? "Development" : "Production")
    .WithEnvironment("FeatureFlags__NewUI", "true");
```

### Docker Compose Integration
```csharp
// Use existing Docker containers
var kafka = builder.AddContainer("kafka", "confluentinc/cp-kafka", "7.5.0")
    .WithEndpoint(port: 9092, targetPort: 9092, name: "kafka")
    .WithEnvironment("KAFKA_BROKER_ID", "1")
    .WithEnvironment("KAFKA_ZOOKEEPER_CONNECT", "zookeeper:2181");

// Or use Docker Compose
var compose = builder.AddDockerComposeEnvironment("infra", "./docker-compose.yml");
```

---

## 3. Service Defaults

### Extensions.cs
```csharp
// MyApp.ServiceDefaults/Extensions.cs
public static class Extensions
{
    public static IHostApplicationBuilder AddServiceDefaults(
        this IHostApplicationBuilder builder)
    {
        // OpenTelemetry
        builder.ConfigureOpenTelemetry();

        // Health checks
        builder.AddDefaultHealthChecks();

        // Service discovery
        builder.Services.AddServiceDiscovery();
        
        // HTTP client defaults
        builder.Services.ConfigureHttpClientDefaults(http =>
        {
            http.AddStandardResilienceHandler();
            http.AddServiceDiscovery();
        });

        return builder;
    }

    public static IHostApplicationBuilder ConfigureOpenTelemetry(
        this IHostApplicationBuilder builder)
    {
        builder.Logging.AddOpenTelemetry(logging =>
        {
            logging.IncludeFormattedMessage = true;
            logging.IncludeScopes = true;
        });

        builder.Services.AddOpenTelemetry()
            .WithMetrics(metrics =>
            {
                metrics.AddAspNetCoreInstrumentation()
                    .AddHttpClientInstrumentation()
                    .AddRuntimeInstrumentation();
            })
            .WithTracing(tracing =>
            {
                tracing.AddAspNetCoreInstrumentation()
                    .AddHttpClientInstrumentation()
                    .AddEntityFrameworkCoreInstrumentation();
            });

        builder.AddOpenTelemetryExporters();

        return builder;
    }

    private static IHostApplicationBuilder AddOpenTelemetryExporters(
        this IHostApplicationBuilder builder)
    {
        var useOtlp = !string.IsNullOrWhiteSpace(
            builder.Configuration["OTEL_EXPORTER_OTLP_ENDPOINT"]);

        if (useOtlp)
        {
            builder.Services.AddOpenTelemetry()
                .UseOtlpExporter();
        }

        return builder;
    }

    public static IHostApplicationBuilder AddDefaultHealthChecks(
        this IHostApplicationBuilder builder)
    {
        builder.Services.AddHealthChecks()
            .AddCheck("self", () => HealthCheckResult.Healthy(), ["live"]);

        return builder;
    }

    public static WebApplication MapDefaultEndpoints(this WebApplication app)
    {
        // Health check endpoints
        app.MapHealthChecks("/health");
        app.MapHealthChecks("/alive", new HealthCheckOptions
        {
            Predicate = r => r.Tags.Contains("live")
        });

        return app;
    }
}
```

---

## 4. API Project Integration

### Program.cs
```csharp
// MyApp.Api/Program.cs
var builder = WebApplication.CreateBuilder(args);

// Add service defaults (telemetry, health checks, etc.)
builder.AddServiceDefaults();

// Add Aspire components
builder.AddNpgsqlDbContext<ApplicationDbContext>("appdb");
builder.AddRedisDistributedCache("redis");
builder.AddRabbitMQClient("messaging");

// Add application services
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// Add API
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Map default endpoints (health checks)
app.MapDefaultEndpoints();

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

### Using Aspire Components
```csharp
// appsettings.json - No connection strings needed!
// Aspire handles service discovery automatically

// DbContext with Aspire
builder.AddNpgsqlDbContext<ApplicationDbContext>("appdb", settings =>
{
    settings.DisableRetry = false;
    settings.CommandTimeout = 30;
});

// Redis with Aspire
builder.AddRedisDistributedCache("redis");
builder.AddRedisOutputCache("redis");

// RabbitMQ with Aspire
builder.AddRabbitMQClient("messaging", configureConnectionFactory: factory =>
{
    factory.DispatchConsumersAsync = true;
});

// Elasticsearch with Aspire
builder.AddElasticsearchClient("elasticsearch");
```

---

## 5. Worker Service Integration

```csharp
// MyApp.Worker/Program.cs
var builder = Host.CreateApplicationBuilder(args);

builder.AddServiceDefaults();

// Add Aspire components
builder.AddNpgsqlDbContext<ApplicationDbContext>("appdb");
builder.AddRabbitMQClient("messaging");

// Add hosted services
builder.Services.AddHostedService<OrderProcessingWorker>();
builder.Services.AddHostedService<NotificationWorker>();

var host = builder.Build();
host.Run();
```

### Background Worker Example
```csharp
public class OrderProcessingWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IConnection _rabbitConnection;
    private readonly ILogger<OrderProcessingWorker> _logger;

    public OrderProcessingWorker(
        IServiceProvider serviceProvider,
        IConnection rabbitConnection,
        ILogger<OrderProcessingWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _rabbitConnection = rabbitConnection;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var channel = await _rabbitConnection.CreateChannelAsync();
        
        await channel.QueueDeclareAsync(
            queue: "orders",
            durable: true,
            exclusive: false,
            autoDelete: false);

        var consumer = new AsyncEventingBasicConsumer(channel);
        consumer.ReceivedAsync += async (model, ea) =>
        {
            try
            {
                var body = ea.Body.ToArray();
                var message = JsonSerializer.Deserialize<OrderMessage>(body);

                using var scope = _serviceProvider.CreateScope();
                var handler = scope.ServiceProvider
                    .GetRequiredService<IOrderHandler>();
                    
                await handler.ProcessAsync(message!, stoppingToken);

                await channel.BasicAckAsync(ea.DeliveryTag, false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing order");
                await channel.BasicNackAsync(ea.DeliveryTag, false, true);
            }
        };

        await channel.BasicConsumeAsync("orders", false, consumer);

        await Task.Delay(Timeout.Infinite, stoppingToken);
    }
}
```

---

## 6. Dashboard & Monitoring

### Access Dashboard
```bash
# Run AppHost
dotnet run --project MyApp.AppHost

# Dashboard available at:
# https://localhost:17178 (or configured port)
```

### Dashboard Features
- **Resources**: View all running services
- **Console Logs**: Real-time logs from all services
- **Traces**: Distributed tracing with OpenTelemetry
- **Metrics**: Performance metrics
- **Structured Logs**: Searchable structured logs

### Custom Metrics
```csharp
public class OrderService
{
    private readonly Counter<long> _ordersCreated;
    private readonly Histogram<double> _orderProcessingTime;

    public OrderService(IMeterFactory meterFactory)
    {
        var meter = meterFactory.Create("MyApp.Orders");
        
        _ordersCreated = meter.CreateCounter<long>(
            "orders.created",
            unit: "orders",
            description: "Number of orders created");
            
        _orderProcessingTime = meter.CreateHistogram<double>(
            "orders.processing_time",
            unit: "ms",
            description: "Order processing time");
    }

    public async Task<Order> CreateOrderAsync(CreateOrderCommand command)
    {
        var stopwatch = Stopwatch.StartNew();
        
        // Process order...
        
        stopwatch.Stop();
        _ordersCreated.Add(1, new KeyValuePair<string, object?>("status", "success"));
        _orderProcessingTime.Record(stopwatch.ElapsedMilliseconds);
        
        return order;
    }
}
```

---

## 7. Deployment

### Azure Container Apps
```csharp
// Add Azure provisioning
var builder = DistributedApplication.CreateBuilder(args);

builder.AddAzureProvisioning();

var postgres = builder.AddAzurePostgresFlexibleServer("postgres")
    .AddDatabase("appdb");

var redis = builder.AddAzureRedis("redis");

var api = builder.AddProject<Projects.MyApp_Api>("api")
    .WithReference(postgres)
    .WithReference(redis)
    .PublishAsAzureContainerApp((infra, app) =>
    {
        app.Configuration.Ingress = new ContainerAppIngressConfiguration
        {
            External = true,
            TargetPort = 8080
        };
    });
```

### Generate Manifests
```bash
# Generate deployment manifests
dotnet run --project MyApp.AppHost -- --publisher manifest --output-path ./manifests

# Deploy to Kubernetes
kubectl apply -f ./manifests/
```

---

## 8. Testing with Aspire

```csharp
public class ApiIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public ApiIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Replace services for testing
                services.RemoveAll<IDistributedCache>();
                services.AddDistributedMemoryCache();
            });
        });
    }

    [Fact]
    public async Task GetOrders_ReturnsSuccess()
    {
        var client = _factory.CreateClient();
        
        var response = await client.GetAsync("/api/orders");
        
        response.EnsureSuccessStatusCode();
    }
}
```

### Using Aspire Testing Framework
```csharp
[Collection("Aspire")]
public class IntegrationTests
{
    [Fact]
    public async Task FullWorkflow_Success()
    {
        var appHost = await DistributedApplicationTestingBuilder
            .CreateAsync<Projects.MyApp_AppHost>();
            
        await using var app = await appHost.BuildAsync();
        await app.StartAsync();

        var httpClient = app.CreateHttpClient("api");
        
        // Test API
        var response = await httpClient.GetAsync("/health");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
```
