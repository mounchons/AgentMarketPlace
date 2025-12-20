# Microsoft Learn MCP Integration

## Overview

Microsoft Learn MCP Server ให้ access ไปยัง official Microsoft documentation โดยตรง เหมาะสำหรับ:
- ค้นหา syntax และ API ที่ถูกต้อง
- ตรวจสอบ breaking changes ระหว่าง versions
- หา best practices จาก Microsoft
- ค้นหา configuration options

## Configuration

### Claude Code CLI
```bash
# Add Microsoft Learn MCP
claude mcp add microsoft-learn --transport streamable-http \
  --url "https://learn.microsoft.com/api/mcp"
```

### settings.json
```json
{
  "mcpServers": {
    "microsoft-learn": {
      "type": "streamable-http",
      "url": "https://learn.microsoft.com/api/mcp"
    }
  }
}
```

### Plugin Bundle
```json
// .mcp.json
{
  "microsoft-learn": {
    "type": "streamable-http",
    "url": "https://learn.microsoft.com/api/mcp"
  }
}
```

---

## Usage Patterns

### เมื่อไหร่ควรใช้ Microsoft Learn MCP

1. **ไม่แน่ใจเรื่อง Syntax**
   ```
   "ค้นหาวิธีใช้ Entity Framework Core migrations CLI"
   → ใช้ MCP search: "ef core migrations cli commands"
   ```

2. **ตรวจสอบ Breaking Changes**
   ```
   "ดูว่า .NET 8 มี breaking changes อะไรบ้างจาก .NET 7"
   → ใช้ MCP search: ".NET 8 breaking changes migration"
   ```

3. **หา Configuration Options**
   ```
   "ดูว่า PostgreSQL provider มี options อะไรบ้าง"
   → ใช้ MCP search: "npgsql entity framework core configuration options"
   ```

4. **Best Practices**
   ```
   "ดู recommended patterns สำหรับ dependency injection"
   → ใช้ MCP search: "asp.net core dependency injection best practices"
   ```

---

## Common Search Queries

### Entity Framework Core
```bash
# Migrations
"ef core add migration code first"
"ef core migration bundle deployment"
"ef core migration script generate"

# Relationships
"ef core one to many relationship configuration"
"ef core many to many relationship"
"ef core owned entity types"

# Performance
"ef core query performance optimization"
"ef core no tracking queries"
"ef core compiled queries"

# PostgreSQL specific
"npgsql entity framework core jsonb"
"npgsql array type mapping"
"npgsql full text search"
```

### ASP.NET Core
```bash
# Authentication
"asp.net core jwt authentication"
"asp.net core identity configuration"
"asp.net core oauth2 openid connect"

# API
"asp.net core minimal api"
"asp.net core web api versioning"
"asp.net core problem details"

# Performance
"asp.net core response caching"
"asp.net core output caching .net 7"
"asp.net core rate limiting"

# Configuration
"asp.net core options pattern"
"asp.net core configuration providers"
"asp.net core environment variables"
```

### .NET Aspire
```bash
# Setup
"dotnet aspire getting started"
"aspire apphost configuration"
"aspire service defaults"

# Components
"aspire postgresql component"
"aspire redis component"
"aspire rabbitmq component"

# Deployment
"aspire azure container apps deployment"
"aspire kubernetes deployment"
"aspire manifest generation"
```

### C# Language
```bash
# New Features
"c# 12 new features"
"c# primary constructors"
"c# collection expressions"

# Patterns
"c# pattern matching"
"c# records"
"c# nullable reference types"
```

---

## Integration with Skill

### ใช้ใน Development Workflow

```markdown
## เมื่อต้องการข้อมูลจาก Microsoft Learn

1. **ระบุสิ่งที่ต้องการค้นหา**
   - API syntax ที่ถูกต้อง
   - Configuration options
   - Best practices
   - Breaking changes

2. **สร้าง Search Query**
   - ใช้ keywords ที่เฉพาะเจาะจง
   - รวม version number ถ้าต้องการ
   - ใส่ technology name เช่น "ef core", "asp.net core"

3. **เรียกใช้ MCP**
   ```
   Use microsoft-learn MCP to search: "your query here"
   ```

4. **วิเคราะห์ผลลัพธ์**
   - ดู official documentation
   - ตรวจสอบ version compatibility
   - อ่าน examples และ best practices
```

### Example Workflow

**Scenario**: ต้องการ implement JWT authentication ใน ASP.NET Core 8

```
Step 1: Search for current best practices
→ MCP Search: "asp.net core 8 jwt bearer authentication configuration"

Step 2: Check for any breaking changes from previous versions
→ MCP Search: "asp.net core 8 authentication breaking changes"

Step 3: Find specific configuration options
→ MCP Search: "JwtBearerOptions configuration asp.net core"

Step 4: Look for security best practices
→ MCP Search: "asp.net core jwt security best practices"
```

---

## Alternative: mcporter CLI

ถ้าไม่ได้ configure MCP ไว้ ใช้ mcporter แทนได้:

```bash
# Install mcporter
npm install -g mcporter

# Search Microsoft Learn
npx mcporter call --stdio \
  "streamable-http https://learn.microsoft.com/api/mcp" \
  search query:"entity framework core migrations"
```

### ใช้ใน Skill Instructions

```markdown
## ค้นหา Documentation

ถ้าต้องการข้อมูลล่าสุดจาก Microsoft Learn:

Option 1 - MCP Tool (ถ้า configure ไว้):
- ใช้ tool: mcp__microsoft-learn__search
- query: "your search terms"

Option 2 - mcporter CLI:
```bash
npx mcporter call --stdio \
  "streamable-http https://learn.microsoft.com/api/mcp" \
  search query:"your search terms"
```

Option 3 - Direct fetch:
- ไปที่ https://learn.microsoft.com/search/?terms=your+search+terms
```

---

## Caching & Performance

### Context Usage
- Microsoft Learn MCP ใช้ tokens น้อยกว่า MCP อื่นๆ
- แนะนำให้ใช้เมื่อจำเป็นเท่านั้น
- Cache ผลลัพธ์ที่ใช้บ่อยไว้ในหัว (หรือใน conversation)

### Best Practices
1. **Search เฉพาะเมื่อจำเป็น** - ถ้ารู้อยู่แล้วไม่ต้อง search
2. **ใช้ specific keywords** - ลด noise ในผลลัพธ์
3. **Cache common patterns** - จำ patterns ที่ใช้บ่อย
4. **Combine with local knowledge** - ใช้ร่วมกับความรู้ที่มี
