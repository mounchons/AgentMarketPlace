---
description: สร้าง test cases อัตโนมัติสำหรับ class/method ที่ระบุ
allowed-tools: Bash(*), Read(*), Write(*), Glob(*), Grep(*)
---

# Generate Tests Command

สร้าง test cases อัตโนมัติ

## Input ที่ได้รับ

```
/generate-tests [file]
/generate-tests [ClassName]
/generate-tests [ClassName.MethodName]
$ARGUMENTS
```

## ขั้นตอนที่ต้องทำ

### Step 1: อ่าน Source Code

```bash
cat [file]
```

### Step 2: วิเคราะห์ Code Structure

1. ระบุ class name
2. หา public methods
3. ระบุ dependencies (constructor params)
4. หา input/output types

### Step 3: สร้าง Test File

**.NET (xUnit + Moq):**

```csharp
using Xunit;
using Moq;
using FluentAssertions;

namespace [Namespace].Tests;

public class [ClassName]Tests
{
    private readonly Mock<IDependency> _mockDep;
    private readonly [ClassName] _sut;

    public [ClassName]Tests()
    {
        _mockDep = new Mock<IDependency>();
        _sut = new [ClassName](_mockDep.Object);
    }

    [Fact]
    public async Task [MethodName]_When[Condition]_Should[Result]()
    {
        // Arrange

        // Act

        // Assert
    }
}
```

### Step 4: บันทึก Test File

```bash
# สร้างไฟล์ใน tests folder
```

## Output

1. แสดง test file ที่สร้าง
2. แสดงจำนวน test cases
3. แนะนำให้รัน /test เพื่อ verify
