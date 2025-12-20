# Changes from v1.0.0 to v1.1.0

## marketplace.json
- Updated version to 1.1.0
- Added `sql-server` tag to dotnet-dev plugin
- Updated description to mention SQL Server support

## README.md
- Added complete documentation for dotnet-dev plugin
- Added SQL Server as supported database
- Added reference files table
- Added contributing section

## plugins/dotnet-dev/.claude-plugin/plugin.json
- Updated version to 1.1.0
- Updated description to include SQL Server

## plugins/dotnet-dev/skills/dotnet-dev/SKILL.md
- Added "SQL Server" and "PostgreSQL" to triggers
- Added "Database Provider Selection" section
- Added multi-database DI configuration example
- Added SQL Server connection string examples
- Added .NET Aspire multi-database example
- Added SQL Server NuGet packages
- Added connection resiliency tips

## plugins/dotnet-dev/skills/dotnet-dev/references/ef-core-patterns.md
- Added Section 10: SQL Server Specific Features
  - Temporal Tables (System-Versioned)
  - Row-Level Security (RLS)
  - HierarchyId for Tree Structures
  - Full-Text Search (SQL Server syntax)
  - Always Encrypted
  - Stored Procedures with Output
  - Connection Resiliency
  - Memory-Optimized Tables
- Added Section 11: Database-Agnostic Patterns
  - Conditional Configuration based on provider
- Added Section 12: Performance Tips
  - Tips for both databases
  - SQL Server specific tips
  - PostgreSQL specific tips
