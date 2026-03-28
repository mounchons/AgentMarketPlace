# Long-Running Nav Template Integration Design Spec

> Date: 2026-03-28
> Plugin: long-running v2.3.0
> Author: Mounchons + Claude

## Summary

Update the long-running plugin to be consistent with the nav template system built in ui-mockup plugin. Three areas of change: component_library.json (richer Navbar/Sidebar + 3 new components), init.md (brain-aware Layout feature creation), continue.md (brain query for nav features).

## Goals

1. Make component_library.json reflect the real nav component system (nested menu, profile dropdown, collapsible sidebar, mobile responsive, role-based filtering)
2. Guide init.md to create DashboardShell feature (not just "Layout") with brain integration
3. Guide continue.md to query brain for nav/topbar/profile data when implementing layout features

## Changes

### A) component_library.json

**Modify Navbar component:**
- Add props: onToggleSidebar (function, required), breadcrumb (array), projectName (string), user (object with displayName/email/initials/role), profileMenuItems (array)
- Add variants: with-profile-dropdown, with-breadcrumb
- Update design_tokens: bg-card, border-bottom, shadow-sm, topbar-h-56px
- Update description to mention topbar with breadcrumb, profile dropdown, sidebar toggle

**Modify Sidebar component:**
- Add props: navigationData (array of sections>items>children), mobileOpen (boolean), onCloseMobile (function), userRole (string for role-based filtering), projectName (string), projectInitials (string)
- Update variants to: default, collapsed, overlay, mobile-open
- Update design_tokens: sidebar-bg-1e1b4b, sidebar-hover-312e81, sidebar-active-4338ca, sidebar-w-260px, sidebar-collapsed-w-68px, text-c7d2fe
- Update description to mention nested menu, collapsible, role-based filtering

**Add ProfileDropdown component:**
- Category: navigation
- Props: displayName (string), email (string), initials (string), roleLabel (string), menuItems (array), logoutLabel (string), onLogout (function)
- Variants: default, mobile
- Design tokens: bg-card, shadow-lg, border, radius-lg
- Accessibility: role button (trigger), role menu (dropdown)

**Add DashboardShell component:**
- Category: layout
- Props: children (ReactNode, required), sidebar (ReactNode), navbar (ReactNode)
- Description: Master layout wrapper combining Sidebar + Navbar + content area with responsive behavior
- Design tokens: bg-page, sidebar-w, sidebar-collapsed-w, topbar-h
- Note: This is the primary layout component for admin/dashboard pages

**Add Breadcrumb component:**
- Category: navigation
- Props: items (array of label+href), separator (string, default "/")
- Design tokens: text-secondary, text-primary (active item)

**Update summary counts** accordingly.

### B) init.md - Step 3.7

Replace the current line:
  "Layout (Navbar + Sidebar) -- if admin pages exist"

With expanded guidance:

1. When admin/dashboard pages exist, create DashboardShell feature (not just "Layout")
2. DashboardShell includes: Sidebar (nested nav), Navbar (topbar + breadcrumb), ProfileDropdown
3. Query brain for navigation structure: search "nav template", "navigation", "sidebar menu"
4. Query brain for topbar/profile config: search "topbar", "profile dropdown"
5. If brain has nav data: store in feature notes as reference for implementation
6. If brain has no nav data: generate navigation from mockup_list.json pages grouped by category
7. Reference implementation: docs/example/html/nav/src/frontend/src/components/
8. Add required_components: ["DashboardShell", "Navbar", "Sidebar", "ProfileDropdown", "Breadcrumb"]

### C) continue.md - Step 0.5

Add a new subsection after the existing reference document checks:

**When feature is DashboardShell / Navbar / Sidebar / Layout / ProfileDropdown:**

1. MUST query brain BEFORE implementation:
   - Search: "nav template", "navigation data", "sidebar menu"
   - Search: "topbar", "navbar"
   - Search: "profile dropdown", "user menu"
   - Search: "design tokens", "color theme"

2. Extract from brain:
   - Navigation structure (sections > items > children with labels, hrefs, icons, roles)
   - Profile config (displayName, email, initials, roleLabel, menuItems, logoutLabel)
   - Icon SVG map
   - Design token values (primary color, sidebar-bg, etc.)

3. Reference implementations:
   - docs/example/html/nav/src/frontend/src/components/ (React/Next.js pattern)
   - .mockups/html/master-page.js (if exists, Web Component pattern from ui-mockup)

4. If brain has no nav data:
   - Generate from mockup_list.json pages grouped by category
   - Use default design tokens from component_library.json

## Files to Modify

| File | Change |
|------|--------|
| plugins/long-running/skills/long-running/templates/component_library.json | Update Navbar, Sidebar; add ProfileDropdown, DashboardShell, Breadcrumb |
| plugins/long-running/commands/init.md | Expand Step 3.7 shared components with brain integration |
| plugins/long-running/commands/continue.md | Add brain query step for nav/layout features |

## Integration Points

- Graph Brain: query for nav structure, topbar, profile, design tokens
- ui-mockup plugin: .mockups/html/master-page.js as reference
- docs/example/html/nav/: reference implementation
- mockup_list.json: fallback nav generation from pages/categories
