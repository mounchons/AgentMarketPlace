---
name: test-runner
description: |
  รัน tests อัตโนมัติ สร้าง test cases, วิเคราะห์ coverage และแนะนำ tests ที่ขาด
  รองรับ unit test, integration test และ E2E test

  ใช้เมื่อ: (1) รัน tests (2) ดู coverage (3) สร้าง test cases ใหม่
  (4) หา tests ที่ขาด (5) debug failing tests

  Triggers: "run tests", "test", "coverage", "unit test", "integration test",
  "ทดสอบ", "รัน test", "สร้าง test", "test coverage"
---

# Test Runner Skill

Skill สำหรับรันและจัดการ tests อัตโนมัติ พร้อมสร้าง test cases และวิเคราะห์ coverage

## วัตถุประสงค์

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TEST RUNNER WORKFLOW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │                        TEST RUNNER SKILL                          │       │
│  │                                                                   │       │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │       │
│  │  │  Run Tests  │  │  Generate   │  │  Coverage   │               │       │
│  │  │             │  │   Tests     │  │  Analysis   │               │       │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘               │       │
│  │         │                │                │                       │       │
│  │         ▼                ▼                ▼                       │       │
│  │  ┌─────────────────────────────────────────────────────────┐     │       │
│  │  │                    TEST REPORT                           │     │       │
│  │  │  • Passed/Failed tests                                   │     │       │
│  │  │  • Coverage percentage                                   │     │       │
│  │  │  • Missing tests suggestions                             │     │       │
│  │  │  • Failed test analysis                                  │     │       │
│  │  └─────────────────────────────────────────────────────────┘     │       │
│  │                                                                   │       │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│  Test Types Supported:                                                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │   Unit     │  │Integration │  │    E2E     │  │   API      │             │
│  │   Tests    │  │   Tests    │  │   Tests    │  │   Tests    │             │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## ตัวอย่างคำสั่งที่ใช้ได้

| สิ่งที่ต้องการ | ตัวอย่างคำสั่ง |
|---------------|---------------|
| **รัน tests ทั้งหมด** | `/test` |
| **รัน tests เฉพาะไฟล์** | `/test UserServiceTests` |
| **ดู coverage** | `/test-coverage` |
| **สร้าง tests** | `/generate-tests src/Services/OrderService.cs` |
| **หา missing tests** | `/test-gaps` |
| **รัน failed tests ซ้ำ** | `/test --failed` |

---

## Commands

### 1. /test - รัน Tests

```bash
# รัน tests ทั้งหมด
/test

# รัน tests เฉพาะ project
/test --project Domain.Tests

# รัน tests เฉพาะ category
/test --filter Category=Unit
/test --filter Category=Integration

# รัน tests ที่ fail ครั้งก่อน
/test --failed

# รัน tests พร้อม verbose output
/test --verbose
```

**Output:**

```
🧪 Running Tests...

┌─────────────────────────────────────────────────────────────────┐
│                      TEST RESULTS                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Total Tests: 156                                                │
│  ✅ Passed: 152                                                  │
│  ❌ Failed: 3                                                    │
│  ⏭️ Skipped: 1                                                   │
│                                                                  │
│  Duration: 12.5s                                                 │
│  Coverage: 78.5%                                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

❌ Failed Tests:

1. UserServiceTests.CreateUser_WhenEmailExists_ShouldThrow
   File: tests/Unit/UserServiceTests.cs:45
   Error: Expected exception of type DuplicateEmailException

   Stack Trace:
   at UserServiceTests.CreateUser_WhenEmailExists_ShouldThrow()

   💡 Suggested Fix:
   Check if the email validation logic is properly implemented
   in UserService.CreateUser()

2. OrderControllerTests.PostOrder_WhenValid_Returns201
   File: tests/Integration/OrderControllerTests.cs:78
   Error: Expected 201, got 400

   💡 Suggested Fix:
   The request body might be missing required fields.
   Check OrderDto validation rules.

3. ...
```

---

### 2. /test-coverage - Coverage Analysis

```bash
/test-coverage

# เฉพาะ project
/test-coverage --project Application

# ตั้ง threshold
/test-coverage --threshold 80
```

**Output:**

```
📊 Coverage Report

┌─────────────────────────────────────────────────────────────────┐
│                    COVERAGE SUMMARY                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Overall Coverage: 78.5% ████████████████████░░░░░              │
│                                                                  │
│  By Project:                                                     │
│  ├── Domain:        92.3% ███████████████████████░░             │
│  ├── Application:   85.1% █████████████████████░░░░             │
│  ├── Infrastructure: 65.4% ████████████████░░░░░░░░             │
│  └── WebApi:        71.2% ██████████████████░░░░░░░             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

⚠️ Files Below Threshold (80%):

| File | Coverage | Missing Lines |
|------|----------|---------------|
| OrderRepository.cs | 45.2% | 23-45, 67-89 |
| PaymentService.cs | 52.1% | 15-30, 55-70 |
| EmailService.cs | 38.9% | 10-50 |

💡 Recommendations:
1. Add tests for OrderRepository.GetOrdersByUser()
2. Add tests for PaymentService.ProcessRefund()
3. Add tests for EmailService.SendAsync()
```

---

### 3. /generate-tests - สร้าง Test Cases

```bash
# สร้าง tests สำหรับไฟล์
/generate-tests src/Services/OrderService.cs

# สร้าง tests สำหรับ class เฉพาะ
/generate-tests OrderService --class

# สร้าง tests สำหรับ method เฉพาะ
/generate-tests OrderService.CreateOrder --method
```

**Output:**

```
🔧 Generating Tests for OrderService.cs

Analyzing class: OrderService
- Found 8 public methods
- Dependencies: IOrderRepository, IProductRepository, IEmailService

Generated Test File: tests/Unit/OrderServiceTests.cs

```csharp
using Xunit;
using Moq;
using FluentAssertions;

namespace Application.Tests.Services;

public class OrderServiceTests
{
    private readonly Mock<IOrderRepository> _orderRepoMock;
    private readonly Mock<IProductRepository> _productRepoMock;
    private readonly Mock<IEmailService> _emailServiceMock;
    private readonly OrderService _sut;

    public OrderServiceTests()
    {
        _orderRepoMock = new Mock<IOrderRepository>();
        _productRepoMock = new Mock<IProductRepository>();
        _emailServiceMock = new Mock<IEmailService>();

        _sut = new OrderService(
            _orderRepoMock.Object,
            _productRepoMock.Object,
            _emailServiceMock.Object);
    }

    #region CreateOrder Tests

    [Fact]
    public async Task CreateOrder_WhenValid_ShouldReturnOrderId()
    {
        // Arrange
        var request = new CreateOrderRequest
        {
            CustomerId = 1,
            Items = new[] { new OrderItem { ProductId = 1, Quantity = 2 } }
        };

        _productRepoMock
            .Setup(x => x.GetByIdAsync(1, default))
            .ReturnsAsync(new Product { Id = 1, Price = 100 });

        // Act
        var result = await _sut.CreateOrderAsync(request);

        // Assert
        result.Should().BeGreaterThan(0);
        _orderRepoMock.Verify(x => x.AddAsync(It.IsAny<Order>(), default), Times.Once);
    }

    [Fact]
    public async Task CreateOrder_WhenProductNotFound_ShouldThrow()
    {
        // Arrange
        var request = new CreateOrderRequest
        {
            CustomerId = 1,
            Items = new[] { new OrderItem { ProductId = 999, Quantity = 2 } }
        };

        _productRepoMock
            .Setup(x => x.GetByIdAsync(999, default))
            .ReturnsAsync((Product?)null);

        // Act
        var act = () => _sut.CreateOrderAsync(request);

        // Assert
        await act.Should().ThrowAsync<ProductNotFoundException>();
    }

    // ... more tests

    #endregion
}
```

✅ Generated 12 test cases for OrderService
💡 Run /test to verify the new tests pass
```

---

### 4. /test-gaps - หา Missing Tests

```bash
/test-gaps

# เฉพาะ project
/test-gaps --project Application
```

**Output:**

```
🔍 Analyzing Test Coverage Gaps

┌─────────────────────────────────────────────────────────────────┐
│                    MISSING TESTS ANALYSIS                        │
├─────────────────────────────────────────────────────────────────┤

## Classes Without Tests (5)

| Class | Methods | Priority |
|-------|---------|----------|
| PaymentGateway | 6 | 🔴 High |
| ReportGenerator | 4 | 🟡 Medium |
| CacheService | 3 | 🟡 Medium |
| LoggingMiddleware | 2 | 🟢 Low |
| HealthCheckService | 2 | 🟢 Low |

## Methods Without Tests (12)

### PaymentGateway (Critical - handles money)
- [ ] ProcessPayment(PaymentRequest)
- [ ] RefundPayment(string transactionId)
- [ ] ValidateCard(CardInfo)

### OrderService (Partial coverage)
- [ ] CancelOrder(long orderId)
- [ ] UpdateOrderStatus(long orderId, OrderStatus status)

### UserService (Partial coverage)
- [ ] ResetPassword(string email)
- [ ] VerifyEmail(string token)

## Edge Cases Not Tested

| Method | Missing Edge Case |
|--------|-------------------|
| CreateOrder | Empty items list |
| CreateOrder | Negative quantity |
| UpdateUser | Invalid email format |
| DeleteUser | User with active orders |

## Recommendations

1. **High Priority**: Add tests for PaymentGateway (handles money)
2. **Medium Priority**: Add tests for order cancellation flow
3. **Low Priority**: Add edge case tests for validation

💡 Run /generate-tests PaymentGateway to auto-generate tests
```

---

## Test Types

### Unit Tests

```csharp
[Fact]
public void CalculateTotal_WithDiscount_ReturnsCorrectAmount()
{
    // Arrange - ตั้งค่า
    var order = new Order { Items = new[] { new Item { Price = 100 } } };
    var discount = 0.1m; // 10%

    // Act - ทำ
    var total = _calculator.CalculateTotal(order, discount);

    // Assert - ตรวจสอบ
    total.Should().Be(90);
}
```

### Integration Tests

```csharp
[Fact]
public async Task CreateOrder_IntegrationTest()
{
    // Arrange
    await using var app = new WebApplicationFactory<Program>();
    var client = app.CreateClient();

    var request = new CreateOrderRequest { ... };

    // Act
    var response = await client.PostAsJsonAsync("/api/orders", request);

    // Assert
    response.StatusCode.Should().Be(HttpStatusCode.Created);
    var order = await response.Content.ReadFromJsonAsync<Order>();
    order.Should().NotBeNull();
}
```

### E2E Tests (ใช้ร่วมกับ ai-ui-test)

```
/ai-ui-test "ทดสอบ flow การสั่งซื้อสินค้าทั้งหมด"
```

---

## Integration with long-running

เมื่อ test fail สามารถเพิ่มเป็น feature ใน feature_list.json:

```bash
# หลังจาก test fail
"เพิ่ม failing tests เป็น features ที่ต้องแก้ไข"

# Claude จะ:
# 1. วิเคราะห์ failing tests
# 2. สร้าง features สำหรับแก้ไขแต่ละ test
# 3. เพิ่มลง feature_list.json
```

---

## Test Frameworks Supported

| Framework | Language | Command |
|-----------|----------|---------|
| **xUnit** | C# | `dotnet test` |
| **NUnit** | C# | `dotnet test` |
| **MSTest** | C# | `dotnet test` |
| **Jest** | JavaScript/TypeScript | `npm test` |
| **Vitest** | JavaScript/TypeScript | `npm test` |
| **pytest** | Python | `pytest` |
| **JUnit** | Java | `mvn test` |

---

## Configuration

### appsettings.test.json

```json
{
  "TestSettings": {
    "DefaultTimeout": 30000,
    "ParallelTests": true,
    "CoverageThreshold": 80,
    "FailOnLowCoverage": false
  }
}
```

---

## Commands Reference

| Command | Description |
|---------|-------------|
| `/test` | รัน tests ทั้งหมด |
| `/test [name]` | รัน tests เฉพาะที่ match name |
| `/test --failed` | รัน tests ที่ fail ครั้งก่อน |
| `/test --filter [expr]` | รัน tests ที่ match filter |
| `/test-coverage` | แสดง coverage report |
| `/test-coverage --threshold [n]` | ตั้ง coverage threshold |
| `/generate-tests [file]` | สร้าง test cases อัตโนมัติ |
| `/test-gaps` | หา tests ที่ขาด |
| `/test --watch` | รัน tests เมื่อไฟล์เปลี่ยน |

---

## References

| File | Description |
|------|-------------|
| `references/testing-patterns.md` | Test patterns และ best practices |
| `references/mocking-guide.md` | วิธีใช้ mocks และ stubs |
| `references/test-naming.md` | Test naming conventions |
