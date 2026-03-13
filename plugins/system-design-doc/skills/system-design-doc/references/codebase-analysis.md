# Codebase Analysis Guide

Guide for analyzing a codebase to create system design documents (Reverse Engineering).

## Quick Reference: Files to Analyze

| Target | .NET Core / ASP.NET | Node.js / Express | Python / Django | Laravel |
|--------|---------------------|-------------------|-----------------|---------|
| **ER Diagram** | `Models/*.cs`, `Entities/*.cs` | `models/*.js` | `models.py` | `app/Models/*.php` |
| **Data Dictionary** | `DbContext.cs`, Migrations | Sequelize models | `models.py` | Migrations, Models |
| **Flow Diagram** | `Services/*.cs` | `services/*.js` | `views.py` | `app/Services/*.php` |
| **Sequence Diagram** | `Controllers/*.cs` | `routes/*.js` | `views.py` | `app/Http/Controllers/*.php` |
| **Sitemap** | `Controllers/`, `Views/` | `routes/`, `pages/` | `urls.py` | `routes/web.php` |
| **Tech Stack** | `*.csproj`, `appsettings.json` | `package.json` | `requirements.txt` | `composer.json` |

## Step-by-Step: Analyze Codebase

### Step 1: Scan Project Structure

```bash
# View folder structure
view /path/to/project

# Identify technology from config files
```

**Files that indicate Technology:**
- `.csproj` → .NET
- `package.json` → Node.js
- `requirements.txt` / `pyproject.toml` → Python
- `composer.json` → PHP/Laravel
- `pom.xml` / `build.gradle` → Java

### Step 2: Analyze by Framework

---

## .NET Core / ASP.NET MVC

### For ER Diagram & Data Dictionary

**Files to analyze:**
```
Models/
├── User.cs
├── Order.cs
└── Product.cs

Data/
└── AppDbContext.cs
```

**What to look for:**
```csharp
// Entity class → Table
public class User
{
    public int Id { get; set; }                    // PK
    public string Username { get; set; }           // Column
    [Required] public string Email { get; set; }   // NOT NULL
    public virtual ICollection<Order> Orders { get; set; }  // Relationship
}

// DbContext → Relationships
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Order>()
        .HasOne(o => o.User)
        .WithMany(u => u.Orders);  // 1:N relationship
}
```

**Convert to:**
- Class → Entity (Table)
- Property → Column
- `[Key]` / `Id` → Primary Key
- `[Required]` → NOT NULL
- `[StringLength(50)]` → VARCHAR(50)
- `virtual ICollection<T>` → One-to-Many
- `virtual T` → Many-to-One / One-to-One

### For Flow Diagram & Sequence Diagram

**Files to analyze:**
```
Controllers/
├── UserController.cs
├── OrderController.cs

Services/
├── UserService.cs
├── OrderService.cs
```

**What to look for:**
```csharp
// Controller → Entry points
[HttpPost("api/orders")]
public async Task<IActionResult> CreateOrder(OrderDto dto)
{
    var user = await _userService.GetCurrentUser();
    var order = await _orderService.Create(dto, user);
    await _emailService.SendConfirmation(order);
    return Ok(order);
}
```

**Convert to Sequence:**
```mermaid
sequenceDiagram
    Client->>OrderController: POST /api/orders
    OrderController->>UserService: GetCurrentUser()
    OrderController->>OrderService: Create(dto, user)
    OrderService->>Database: INSERT order
    OrderController->>EmailService: SendConfirmation(order)
    OrderController-->>Client: 200 OK
```

### For Sitemap

**Files to analyze:**
```
Controllers/
├── HomeController.cs      → /
├── AccountController.cs   → /Account/*
├── AdminController.cs     → /Admin/*

Views/
├── Home/
│   └── Index.cshtml
├── Account/
│   ├── Login.cshtml
│   └── Register.cshtml
```

**Convert to Sitemap:**
```mermaid
flowchart TD
    HOME[🏠 Home] --> ACCOUNT[👤 Account]
    HOME --> ADMIN[⚙️ Admin]
    ACCOUNT --> LOGIN[Login]
    ACCOUNT --> REGISTER[Register]
```

---

## Node.js / Express

### For ER Diagram & Data Dictionary

**Files to analyze (Sequelize):**
```javascript
// models/User.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING(50), unique: true, allowNull: false },
    email: { type: DataTypes.STRING(100), unique: true, allowNull: false },
  });

  User.associate = (models) => {
    User.hasMany(models.Order, { foreignKey: 'userId' });
  };

  return User;
};
```

**Files to analyze (Prisma):**
```prisma
model User {
  id       Int      @id @default(autoincrement())
  username String   @unique
  email    String   @unique
  orders   Order[]
}

model Order {
  id     Int   @id @default(autoincrement())
  userId Int
  user   User  @relation(fields: [userId], references: [id])
}
```

### For Flow & Sequence Diagram

**Files to analyze:**
```javascript
// routes/orders.js
router.post('/', authenticate, async (req, res) => {
  const order = await orderService.create(req.body, req.user);
  await emailService.sendConfirmation(order);
  res.status(201).json(order);
});
```

### For Sitemap

**Files to analyze:**
```javascript
// routes/index.js
app.use('/', homeRoutes);
app.use('/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/admin', adminRoutes);
```

---

## Python / Django

### For ER Diagram & Data Dictionary

**Files to analyze:**
```python
# models.py
class User(models.Model):
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    total = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
```

**Convert to:**
- `CharField(max_length=50)` → VARCHAR(50)
- `ForeignKey` → FK relationship
- `related_name='orders'` → Relationship name
- `on_delete=CASCADE` → Cascade delete rule

### For Sitemap

**Files to analyze:**
```python
# urls.py
urlpatterns = [
    path('', views.home, name='home'),
    path('auth/', include('auth.urls')),
    path('orders/', include('orders.urls')),
    path('admin/', admin.site.urls),
]
```

---

## Laravel (PHP)

### For ER Diagram & Data Dictionary

**Files to analyze:**
```php
// app/Models/User.php
class User extends Model
{
    protected $fillable = ['username', 'email', 'password'];

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}

// database/migrations/create_users_table.php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('username', 50)->unique();
    $table->string('email', 100)->unique();
    $table->string('password');
    $table->timestamps();
});
```

### For Sitemap

**Files to analyze:**
```php
// routes/web.php
Route::get('/', [HomeController::class, 'index']);
Route::get('/login', [AuthController::class, 'showLogin']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::resource('orders', OrderController::class);
});

Route::middleware('admin')->prefix('admin')->group(function () {
    Route::resource('users', AdminUserController::class);
});
```

---

## Analyzing Legacy Code (WebForms, Classic ASP)

### ASP.NET WebForms

**Files to examine:**
```
App_Code/
├── DAL/           → Data Access → ER Diagram
├── BLL/           → Business Logic → Flow Diagram
└── Entities/      → Data Model → Data Dictionary

*.aspx             → Pages → Sitemap
*.aspx.cs          → Code-behind → Logic Flow
Web.config         → Configuration → Tech Stack
```

**Analyze Data Access:**
```csharp
// Look at SQL queries to understand the schema
public DataTable GetUsers()
{
    string sql = @"
        SELECT u.Id, u.Username, u.Email, r.RoleName
        FROM Users u
        INNER JOIN Roles r ON u.RoleId = r.Id
        WHERE u.IsActive = 1";
    // ...
}
```

### Classic ASP

**Files to examine:**
```
*.asp              → Pages + Logic
includes/
├── db.asp         → Database connection
├── functions.asp  → Business functions
```

---

## Output Mapping

Once analysis is complete, create the document according to this mapping:

| Data obtained from Code | Document Section |
|------------------------|------------------|
| Project structure, config files | 1.5 High-Level Architecture, 1.6 Technology Stack |
| Controllers, Routes | 3. Module Overview, 9. Sitemap |
| Models/Entities | 4. Data Model, 7. ER Diagram |
| Database schema/migrations | 8. Data Dictionary |
| Service methods, business logic | 6. Flow Diagrams |
| API endpoints, method calls | Sequence Diagrams |
| Auth/Role code | 10. User Roles & Permissions |

---

## Checklist: Before Starting Analysis

- [ ] Framework/Technology identified
- [ ] Models/Entities files found
- [ ] Controllers/Routes files found
- [ ] Config files found (database, settings)
- [ ] Folder structure understood

## Tips

1. **Start from Models** — get the data overview first
2. **Look at Relationships** — `HasMany`, `BelongsTo`, `ForeignKey`
3. **Follow the Request Flow** — Route → Controller → Service → Repository → Database
4. **Observe Patterns** — method names indicate actions (Create, Update, Delete, Get)
5. **Read Comments** — some codebases already have documentation
