<!-- sdd-section: permissions | doc: __PROJECT_SLUG__ | schema: 2.3.0 -->
# Section 10 — User Roles & Permissions

> [← Back to Index](00-index.md) · __PROJECT_NAME__ System Design Document

## 10. User Roles & Permissions

### 10.1 Roles Definition

| Role ID | Role Name | Description | Level |
|---------|-----------|-------------|-------|
| 1 | Super Admin | Highest system administrator | 1 |
| 2 | Admin | System administrator | 2 |
| 3 | Manager | Manager | 3 |
| 4 | User | General user | 4 |
| 5 | Guest | Visitor | 5 |

### 10.2 Permission Matrix

| Permission | Super Admin | Admin | Manager | User | Guest |
|------------|:-----------:|:-----:|:-------:|:----:|:-----:|
| **Dashboard** |
| View Dashboard | ✅ | ✅ | ✅ | ✅ | ❌ |
| **User Management** |
| View Users | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create User | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit User | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete User | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Orders** |
| View All Orders | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Own Orders | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create Order | ✅ | ✅ | ✅ | ✅ | ❌ |
| Cancel Order | ✅ | ✅ | ✅ | 🔸 | ❌ |
| **Reports** |
| View Reports | ✅ | ✅ | ✅ | ❌ | ❌ |
| Export Reports | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Settings** |
| System Config | ✅ | ❌ | ❌ | ❌ | ❌ |
| User Profile | ✅ | ✅ | ✅ | ✅ | ❌ |

**Legend**: ✅ = Full Access, 🔸 = Limited (own data only), ❌ = No Access

### 10.3 Access Control Rules

#### Rule 1: Data Ownership
- Users can only view and edit their own data
- Manager and above can view team data
- Admin and above can view all data

#### Rule 2: Hierarchical Access
- Lower level roles have more privileges
- Super Admin (Level 1) has full access to everything

#### Rule 3: Action Restrictions
- Deleting data requires Admin level or above
- Deleting users requires Super Admin only
