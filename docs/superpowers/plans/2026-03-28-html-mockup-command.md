# HTML Mockup Command Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Add /create-html-mockup command to ui-mockup plugin that generates browser-viewable HTML mockup pages with a shared master-page Web Component layout sourced from Graph Brain.

**Architecture:** New command queries brain for nav/topbar/profile data, generates a master-page.js Web Component once, then uses frontend-design skill to create individual HTML mockup pages wrapped in the master-page tag. All output goes to .mockups/html/.

**Tech Stack:** Web Components (vanilla JS), Tailwind CDN, Shadow DOM, CSS Custom Properties

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| plugins/ui-mockup/skills/ui-mockup/templates/master-page-template.css | Create | Design tokens and shared styles |
| plugins/ui-mockup/skills/ui-mockup/templates/master-page-template.js | Create | Web Component template |
| plugins/ui-mockup/skills/ui-mockup/templates/html-mockup-template.html | Create | HTML page boilerplate |
| plugins/ui-mockup/skills/ui-mockup/templates/index-template.html | Create | Directory index page |
| plugins/ui-mockup/commands/create-html-mockup.md | Create | Command definition |
| plugins/ui-mockup/.claude-plugin/plugin.json | Modify | Bump version to 1.5.0 |
| plugins/ui-mockup/skills/ui-mockup/SKILL.md | Modify | Add new command to list |

---

### Task 1: Create Master Page CSS Template

**Files:**
- Create: `plugins/ui-mockup/skills/ui-mockup/templates/master-page-template.css`

- [ ] **Step 1: Create the CSS template file**

Create CSS template with custom properties for design tokens. All token values use `{{TOKEN|default}}` placeholder pattern for replacement during generation from brain/CLAUDE.md data.

Token categories to define on :root:
- Primary: `--mp-primary` (#6366f1), `--mp-primary-light` (#818cf8), `--mp-primary-dark` (#4f46e5), `--mp-primary-50` (#eef2ff)
- Feedback: `--mp-success` (#10b981), `--mp-error` (#ef4444), `--mp-warning` (#f59e0b)
- Surfaces: `--mp-bg-page` (#f8fafc), `--mp-bg-card` (#ffffff), `--mp-sidebar-bg` (#1e1b4b), `--mp-sidebar-hover` (#312e81), `--mp-sidebar-active` (#4338ca)
- Text: `--mp-text-primary` (#1e293b), `--mp-text-secondary` (#64748b), `--mp-text-muted` (#94a3b8)
- Border: `--mp-border` (#e2e8f0), `--mp-border-light` (#f1f5f9)
- Layout: `--mp-sidebar-w` (260px), `--mp-sidebar-collapsed-w` (68px), `--mp-topbar-h` (56px)
- Radius: `--mp-radius-sm` (6px), `--mp-radius-md` (8px), `--mp-radius-lg` (12px)
- Font: `--mp-font` ('Inter', 'Noto Sans Thai', system-ui, sans-serif)

Body reset: margin 0, font-family from var, background from var, antialiased text rendering.

- [ ] **Step 2: Verify file**

Run: `ls -la plugins/ui-mockup/skills/ui-mockup/templates/master-page-template.css`

- [ ] **Step 3: Commit**

`git add plugins/ui-mockup/skills/ui-mockup/templates/master-page-template.css && git commit -m "feat(ui-mockup): add master page CSS template with design tokens"`

---

### Task 2: Create Master Page Web Component Template

**Files:**
- Create: `plugins/ui-mockup/skills/ui-mockup/templates/master-page-template.js`

Web Component using Shadow DOM. Template file with placeholders replaced during generation.

- [ ] **Step 1: Create Web Component template**

**Top-level placeholder constants:**
- `NAV_DATA_PLACEHOLDER` - replaced with JSON array of nav sections from brain
- `PROFILE_CONFIG_PLACEHOLDER` - replaced with JSON object of profile config from brain
- `ICON_SVG_MAP_PLACEHOLDER` - replaced with object mapping icon names to SVG strings

**Helper function:** `getIcon(name, cls)` - looks up icon from ICON_SVG map, adds CSS class to SVG element

**Class MasterPage extends HTMLElement:**

Properties: `_sidebarCollapsed`, `_mobileOpen`, `_profileOpen` (all boolean, default false)

`static get observedAttributes()` returns `['active-menu', 'page-title']`

`connectedCallback()` - calls `_render()` then `_setupResizeHandler()`

`disconnectedCallback()` - removes resize listener

`attributeChangedCallback()` - re-renders if shadow has children

`_render()` - builds DOM via template element + content.cloneNode(true):
- Links master-page.css in shadow root
- Inlines shadow styles from `_getShadowStyles()`
- Constructs app-layout div:
  - Mobile overlay div (id: sidebarOverlay)
  - Sidebar aside (id: sidebar): brand area (logo div with `{{PROJECT_INITIALS|AP}}`, title span with `{{PROJECT_NAME|Project}}`), nav from `_renderNav()`, footer with status dot
  - Main wrapper div (id: mainWrapper): topbar header (toggle button, breadcrumb from page-title, spacer, profile area with info + avatar + dropdown), content main with slot element
- Calls `_bindEvents()` after appending

`_renderNav(activeMenu)` - iterates NAV_DATA array:
- For each section: div.nav-section with div.nav-section-label
- For items without children: a.nav-item with icon + label + optional badge, add .active class if label matches activeMenu (case-insensitive)
- For items with children: div.nav-group containing button.nav-item.nav-item-parent (with chevron icon) and div.nav-submenu with a.nav-subitem entries. Add .open class if any child matches activeMenu
- Returns joined HTML string array

`_escapeHtml(str)` - safe escaping via createElement div + textContent

`_bindEvents()` - event listeners:
- sidebarToggle click: toggle collapse (desktop) or mobile open (mobile, breakpoint 1024px)
- sidebarOverlay click: close mobile
- profileToggle click: toggle profile dropdown (stopPropagation)
- shadow root click: close profile dropdown
- All [data-nav-toggle] buttons: toggle .open on parent .nav-group

`_updateMobileState()` - toggle mobile-open on sidebar, visible on overlay
`_updateCollapseState()` - toggle collapsed on sidebar, sidebar-collapsed on main wrapper
`_updateProfileDropdown()` - toggle visible on profile dropdown
`_setupResizeHandler()` - window resize listener: close mobile if width > 1024

`_getShadowStyles()` - returns CSS string covering all shadow DOM styles:

Layout styles:
- `.app-layout` - flex, min-height 100vh
- `.sidebar` - fixed left, width var(--mp-sidebar-w), flex column, bg var(--mp-sidebar-bg), color #c7d2fe, transition width+transform
- `.sidebar.collapsed` - width var(--mp-sidebar-collapsed-w), hide labels/chevrons/badges/submenus
- Mobile: `@media (max-width: 1024px)` sidebar translateX(-100%), `.mobile-open` translateX(0)
- `.sidebar-overlay` - fixed inset, bg black/40, backdrop-filter blur, display none, `.visible` display block
- `.sidebar-brand` - height var(--mp-topbar-h), flex, gap, border-bottom
- `.sidebar-logo` - 36x36, rounded 10px, gradient primary to primary-light, white text centered
- `.sidebar-title` - 17px bold white
- `.sidebar-nav` - flex 1, overflow-y auto, custom scrollbar (4px, white/15%)
- `.nav-section-label` - 11px, uppercase, letter-spacing, color #818cf8
- `.nav-item` - flex, h40, gap 12, font 14px, color #a5b4fc, rounded, hover sidebar-hover color #e0e7ff
- `.nav-item.active` - bg sidebar-active, color white, font 500
- `.nav-badge` - bg error, white, 11px, rounded pill
- `.nav-chevron` - auto margin-left, rotate 90deg when .open
- `.nav-submenu` - max-height 0, overflow hidden, transition; `.open` max-height 600px
- `.nav-subitem` - pl 44px, h36, 13px, color #818cf8, hover #c7d2fe; `.active` white bg rgba(99,102,241,0.15)
- `.sidebar-footer` - flex, gap 10, border-top; dot 8px green circle; text 12px #a5b4fc; status 11px green
- `.main-wrapper` - flex 1, flex column, margin-left var(--mp-sidebar-w), transition; `.sidebar-collapsed` margin-left collapsed-w; mobile margin-left 0
- `.topbar` - height var(--mp-topbar-h), flex, px 24, gap 16, bg card, border-bottom, sticky top 0, z-50, shadow-sm
- `.topbar-toggle` - 36x36, rounded, hover primary-50 primary color
- `.breadcrumb` - 14px, semibold
- `.topbar-spacer` - flex 1
- `.profile-area` - relative, flex, gap 12
- `.profile-info` - flex column, align end; hide on max-width 768px
- `.profile-name` - 13px, 500 weight
- `.profile-role` - 11px, muted
- `.profile-avatar` - 34x34 circle, gradient primary to #a78bfa, white 13px bold
- `.profile-dropdown` - display none, absolute right top+4, w220, bg card, rounded-lg, shadow, border; `.visible` display block
- `.profile-dropdown-header` - p 12 16, border-bottom
- `.profile-dropdown-item` - flex, gap 10, p 8 16, 13px, hover bg-page; `.logout` color error, hover bg #fee2e2
- `.content` - flex 1, p 24; mobile p 16
- Icon classes: `.icon-sm` 20px, `.icon-xs` 16px, `.icon-nav` 20px, `.icon-nav-sm` 16px, `.icon-chevron` 16px
- All SVGs: width/height 100%, fill none, stroke currentColor, stroke-width 2, linecap/linejoin round

Register: `customElements.define('master-page', MasterPage)`

- [ ] **Step 2: Verify file**

Run: `ls -la plugins/ui-mockup/skills/ui-mockup/templates/master-page-template.js`

- [ ] **Step 3: Commit**

`git add plugins/ui-mockup/skills/ui-mockup/templates/master-page-template.js && git commit -m "feat(ui-mockup): add master-page Web Component template"`

---

### Task 3: Create HTML Mockup Page Template

**Files:**
- Create: `plugins/ui-mockup/skills/ui-mockup/templates/html-mockup-template.html`

- [ ] **Step 1: Create HTML page template**

Structure:
- `<!DOCTYPE html>` + `<html lang="{{LANG|th}}">`
- head: charset UTF-8, viewport, title "{{PAGE_NAME}} - HTML Mockup", Tailwind CDN script tag, master-page.css link, master-page.js script (defer)
- body with class using --mp-bg-page variable
- `<master-page active-menu="{{ACTIVE_MENU}}" page-title="{{PAGE_TITLE}}">`
- HTML comments: PAGE_NAME, PAGE_URL, CRUD_GROUP, CRUD_TYPE, DATE
- `{{PAGE_CONTENT}}` placeholder
- Close master-page, body, html

- [ ] **Step 2: Verify file**

Run: `ls -la plugins/ui-mockup/skills/ui-mockup/templates/html-mockup-template.html`

- [ ] **Step 3: Commit**

`git add plugins/ui-mockup/skills/ui-mockup/templates/html-mockup-template.html && git commit -m "feat(ui-mockup): add HTML mockup page template"`

---

### Task 4: Create Index Page Template

**Files:**
- Create: `plugins/ui-mockup/skills/ui-mockup/templates/index-template.html`

- [ ] **Step 1: Create index template**

Standalone HTML page (no master-page tag). Structure:
- Header: project name h1, subtitle, date, total count
- Summary cards grid (2-col mobile, 4-col desktop): Total Pages, Completed (green), Pending (yellow), Entities (indigo)
- Pages table: columns ID, Page Name, URL, CRUD, Status, Link
- `{{PAGE_ROWS}}` placeholder for generated tr elements
- Styled with Tailwind CDN, references master-page.css for token variables

Placeholders: LANG, PROJECT_NAME, DATE, TOTAL_PAGES, COMPLETED_PAGES, PENDING_PAGES, ENTITY_COUNT, PAGE_ROWS

- [ ] **Step 2: Verify file**

Run: `ls -la plugins/ui-mockup/skills/ui-mockup/templates/index-template.html`

- [ ] **Step 3: Commit**

`git add plugins/ui-mockup/skills/ui-mockup/templates/index-template.html && git commit -m "feat(ui-mockup): add index page template for HTML mockup directory"`

---

### Task 5: Create /create-html-mockup Command

**Files:**
- Create: `plugins/ui-mockup/commands/create-html-mockup.md`

- [ ] **Step 1: Create command file**

Frontmatter:
- description: Create an HTML Mockup page using Web Component master page and frontend-design skill
- allowed-tools: Bash(*), Read(*), Write(*), Edit(*), Glob(*), Grep(*), Agent(*), Skill(frontend-design)

**7 Critical Rules:**
1. Query Brain first for nav, topbar, profile dropdown
2. Use frontend-design skill for page content generation
3. Tailwind CDN only (no build step)
4. file:// compatible (no ES modules, classic script)
5. Consistent with ASCII mockups (same IDs, NNN-page-name convention)
6. Read CLAUDE.md for conventions
7. No placeholder content

**8-Step Command Flow:**

Step 0: Read CLAUDE.md - extract alert library (default SweetAlert2), URL convention, param syntax, component lib, CSS framework, primary color, sidebar bg. Store as MOCKUP_CONVENTIONS.

Step 1: Read mockup_list.json - show pending pages table if exists (columns: #, Page Name, URL, Priority, CRUD Group, HTML Status). Suggest /init-mockup if missing.

Step 2: Query Brain - search brain MCP tools for: nav template/navigation/sidebar menu, topbar/navbar, profile dropdown/user menu, design tokens/color theme. Extract navigation as JSON array (sections > items > children), profile as JSON object (displayName, email, initials, roleLabel, menuItems, logoutLabel), icon SVG map, design token values. Fallback: generate nav from mockup_list.json pages grouped by category.

Step 3: Generate Master Page (if not exists) - check .mockups/html/master-page.js. If missing or --regenerate-master: read templates from plugin, replace NAV_DATA_PLACEHOLDER with brain nav JSON, PROFILE_CONFIG_PLACEHOLDER with brain profile JSON, ICON_SVG_MAP_PLACEHOLDER with icon map, all {{TOKEN|default}} patterns with brain/CLAUDE.md values, PROJECT_INITIALS and PROJECT_NAME. Write master-page.js and master-page.css to .mockups/html/. If exists: log reusing.

Step 4: Generate HTML Page Content - invoke frontend-design skill with context: page name, URL, CRUD group/type, complexity, UI pattern, access roles, design requirements (Tailwind CDN, CSS variables, alert library, realistic data, responsive). Different guidance per page type:
- List: action column first, search/filter/pagination, action icons, Add New button
- Form: all entity fields, validation indicators, submit/cancel buttons
- Detail: all fields displayed, Edit/Delete/Back actions
- Dashboard: summary cards, chart placeholders, recent activity
Output ONLY inner HTML content (not full document).

Step 5: Assemble HTML File - read html-mockup-template.html, replace all placeholders (LANG, PAGE_NAME, ACTIVE_MENU, PAGE_TITLE, PAGE_URL, CRUD_GROUP, CRUD_TYPE, DATE, PAGE_CONTENT), write to .mockups/html/NNN-page-name.html.

Step 6: Update Index Page - read index-template.html, scan .mockups/html/ for NNN-*.html files, build table rows from mockup_list.json data, replace summary placeholders, write .mockups/html/index.html.

Step 7: Update mockup_list.json - add html_mockup_file, html_mockup_status (completed), html_mockup_created_at fields to the page entry.

Step 8: Show Result - success message with file path, master page status, index update confirmation, browser open instructions.

**Self-Check Checklist (10 items):**
1. CLAUDE.md read and conventions extracted?
2. Brain queried for nav, topbar, profile?
3. Master page exists or generated?
4. frontend-design skill invoked for content?
5. Content complete with no placeholders?
6. Wrapped in master-page tag with correct active-menu?
7. HTML file written to .mockups/html/?
8. index.html updated?
9. mockup_list.json updated?
10. File opens correctly in browser (no module issues)?

- [ ] **Step 2: Verify file**

Run: `ls -la plugins/ui-mockup/commands/create-html-mockup.md`

- [ ] **Step 3: Commit**

`git add plugins/ui-mockup/commands/create-html-mockup.md && git commit -m "feat(ui-mockup): add /create-html-mockup command definition"`

---

### Task 6: Update plugin.json and SKILL.md

**Files:**
- Modify: `plugins/ui-mockup/.claude-plugin/plugin.json`
- Modify: `plugins/ui-mockup/skills/ui-mockup/SKILL.md`

- [ ] **Step 1: Bump plugin version**

In plugin.json change version "1.4.0" to "1.5.0" and update description to include "HTML mockups with Web Component master page" and "brain skills" in integration list.

- [ ] **Step 2: Add commands to SKILL.md**

In SKILL.md Available Commands table add 3 rows:
- Create HTML Mockup: `/create-html-mockup Dashboard page`
- Create HTML from list: `/create-html-mockup` (shows pending pages)
- Regenerate Master Page: `/create-html-mockup --regenerate-master`

- [ ] **Step 3: Verify**

Run: `grep "1.5.0" plugins/ui-mockup/.claude-plugin/plugin.json` and `grep "create-html-mockup" plugins/ui-mockup/skills/ui-mockup/SKILL.md`

- [ ] **Step 4: Commit**

`git add plugins/ui-mockup/.claude-plugin/plugin.json plugins/ui-mockup/skills/ui-mockup/SKILL.md && git commit -m "feat(ui-mockup): bump to v1.5.0, add /create-html-mockup to available commands"`

---

### Task 7: Final Verification

- [ ] **Step 1: Verify all new files exist**

```bash
ls -la plugins/ui-mockup/skills/ui-mockup/templates/master-page-template.js
ls -la plugins/ui-mockup/skills/ui-mockup/templates/master-page-template.css
ls -la plugins/ui-mockup/skills/ui-mockup/templates/html-mockup-template.html
ls -la plugins/ui-mockup/skills/ui-mockup/templates/index-template.html
ls -la plugins/ui-mockup/commands/create-html-mockup.md
```

- [ ] **Step 2: Verify command count is 7**

Run: `ls plugins/ui-mockup/commands/*.md | wc -l`

- [ ] **Step 3: Review git log**

Run: `git log --oneline -6`
