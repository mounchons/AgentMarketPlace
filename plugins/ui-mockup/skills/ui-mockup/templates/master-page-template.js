/**
 * master-page-template.js
 *
 * Web Component <master-page> — shared layout shell for all HTML mockup pages.
 * Provides sidebar, topbar, profile dropdown, and a <slot> for page content.
 *
 * This is a TEMPLATE file.  The placeholders below are replaced at generation
 * time by the /create-html-mockup command before writing the output file.
 *
 * Placeholders replaced at generation time:
 *   NAV_DATA_PLACEHOLDER         -> JSON array of NavSection objects
 *   PROFILE_CONFIG_PLACEHOLDER   -> JSON object { name, role, email, initials }
 *   ICON_SVG_MAP_PLACEHOLDER     -> JSON object { iconName: "<svg .../>" }
 *   {{PROJECT_INITIALS|AP}}      -> Two-letter project logo text
 *   {{PROJECT_NAME|Project}}     -> Project display name
 *
 * Works with file:// protocol - no ES modules, classic script only.
 *
 * Security note: innerHTML is used intentionally here for template-building.
 * - User-provided text is always passed through _escapeHtml() before insertion.
 * - ICON_SVG values are trusted SVG strings supplied by the plugin at build time.
 * - NAV_DATA / PROFILE_CONFIG come from plugin-controlled JSON, not user input.
 */

/* ── Placeholder constants (replaced at generation time) ─────────────────── */
const NAV_DATA = NAV_DATA_PLACEHOLDER;
const PROFILE_CONFIG = PROFILE_CONFIG_PLACEHOLDER;
const ICON_SVG = ICON_SVG_MAP_PLACEHOLDER;

/* ── Helper: inject CSS class into an SVG string ─────────────────────────── */
/**
 * Look up an icon by name from ICON_SVG and add a CSS class to the <svg> tag.
 * @param {string} name  Icon key in the ICON_SVG map.
 * @param {string} cls   CSS class(es) to add to the svg element.
 * @returns {string}     SVG markup string, or empty string if not found.
 */
function getIcon(name, cls) {
  var svg = ICON_SVG[name];
  if (!svg) return '';
  if (cls) {
    svg = svg.replace(/^<svg /, '<svg class="' + cls + '" ');
  }
  return svg;
}

/* ── Web Component ───────────────────────────────────────────────────────── */
class MasterPage extends HTMLElement {
  static get observedAttributes() {
    return ['active-menu', 'page-title'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    /* Internal state */
    this._sidebarCollapsed = false;
    this._mobileOpen = false;
    this._profileOpen = false;
  }

  /* ── Lifecycle ────────────────────────────────────────────────────────── */
  connectedCallback() {
    this._render();
    this._bindEvents();
  }

  attributeChangedCallback() {
    if (this.shadowRoot && this.shadowRoot.childNodes.length) {
      this._render();
      this._bindEvents();
    }
  }

  /* ── Render ───────────────────────────────────────────────────────────── */
  _render() {
    var activeMenu = this.getAttribute('active-menu') || '';
    var pageTitle  = this.getAttribute('page-title')  || 'Dashboard';

    var profile = PROFILE_CONFIG || {};
    var profileName     = this._escapeHtml(profile.name     || 'Admin User');
    var profileRole     = this._escapeHtml(profile.role     || 'Administrator');
    var profileEmail    = this._escapeHtml(profile.email    || 'admin@example.com');
    var profileInitials = this._escapeHtml(profile.initials || 'AU');

    var tpl = document.createElement('template');

    // All dynamic values are escaped via _escapeHtml before insertion.
    // SVG icon strings come from the plugin-controlled ICON_SVG map (trusted).
    tpl.innerHTML = [
      '<link rel="stylesheet" href="master-page.css">',
      '<style>', this._getShadowStyles(), '</style>',
      '<div class="app-layout">',

        /* ── Mobile overlay ── */
        '<div class="sidebar-overlay" id="sidebarOverlay"></div>',

        /* ── Sidebar ── */
        '<aside class="sidebar" id="sidebar">',

          /* Brand */
          '<div class="sidebar-brand">',
            '<div class="sidebar-logo">{{PROJECT_INITIALS|AP}}</div>',
            '<span class="sidebar-title">{{PROJECT_NAME|Project}}</span>',
          '</div>',

          /* Nav */
          '<nav class="sidebar-nav" id="sidebarNav">',
            this._renderNav(activeMenu),
          '</nav>',

          /* Footer */
          '<div class="sidebar-footer">',
            '<div class="sidebar-footer-dot"></div>',
            '<span class="sidebar-footer-text">System</span>',
            '<span class="sidebar-footer-status">Online</span>',
          '</div>',

        '</aside>',

        /* ── Main wrapper ── */
        '<div class="main-wrapper" id="mainWrapper">',

          /* Topbar */
          '<header class="topbar">',
            '<button class="topbar-toggle" id="sidebarToggle" aria-label="Toggle sidebar">',
              getIcon('menu', 'icon-sm'),
            '</button>',
            '<span class="breadcrumb">', this._escapeHtml(pageTitle), '</span>',
            '<div class="topbar-spacer"></div>',

            /* Profile area */
            '<div class="profile-area">',
              '<div class="profile-info">',
                '<span class="profile-name">', profileName, '</span>',
                '<span class="profile-role">', profileRole, '</span>',
              '</div>',
              '<button class="profile-avatar" id="profileAvatar" aria-haspopup="true" aria-expanded="false">',
                profileInitials,
              '</button>',

              /* Profile dropdown */
              '<div class="profile-dropdown" id="profileDropdown" role="menu">',
                '<div class="profile-dropdown-header">',
                  '<div class="profile-dropdown-name">', profileName, '</div>',
                  '<div class="profile-dropdown-email">', profileEmail, '</div>',
                  '<div class="profile-dropdown-role">', profileRole, '</div>',
                '</div>',
                '<div class="profile-dropdown-item">',
                  getIcon('user', 'icon-xs'),
                  '<span>Profile</span>',
                '</div>',
                '<div class="profile-dropdown-item">',
                  getIcon('settings', 'icon-xs'),
                  '<span>Settings</span>',
                '</div>',
                '<div class="profile-dropdown-item logout">',
                  getIcon('logout', 'icon-xs'),
                  '<span>Logout</span>',
                '</div>',
              '</div>',
            '</div>',
          '</header>',

          /* Page content */
          '<main class="content">',
            '<slot></slot>',
          '</main>',

        '</div>', /* end main-wrapper */

      '</div>' /* end app-layout */
    ].join('');

    /* Wipe shadow root and stamp the template */
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));
  }

  /* ── Nav builder ──────────────────────────────────────────────────────── */
  _renderNav(activeMenu) {
    if (!Array.isArray(NAV_DATA)) return '';
    var html = [];

    NAV_DATA.forEach(function(section) {
      html.push('<div class="nav-section">');
      html.push('<div class="nav-section-label">' + this._escapeHtml(section.label) + '</div>');

      (section.items || []).forEach(function(item) {
        var hasChildren = Array.isArray(item.children) && item.children.length > 0;

        /* Check if this group contains the active item */
        var groupActive = false;
        if (hasChildren) {
          item.children.forEach(function(child) {
            if (child.label === activeMenu || child.href === activeMenu) groupActive = true;
          });
        }

        if (!hasChildren) {
          /* ── Leaf item -> anchor ── */
          var isActive = (item.label === activeMenu || item.href === activeMenu);
          html.push(
            '<a href="' + this._escapeHtml(item.href || '#') + '" ' +
               'class="nav-item' + (isActive ? ' active' : '') + '">',
              getIcon(item.icon, 'icon-nav'),
              '<span class="nav-item-label">' + this._escapeHtml(item.label) + '</span>',
              (item.badge != null
                ? '<span class="nav-badge">' + this._escapeHtml(String(item.badge)) + '</span>'
                : ''),
            '</a>'
          );
        } else {
          /* ── Parent item with submenu ── */
          html.push(
            '<div class="nav-group' + (groupActive ? ' open' : '') + '">',
              '<button class="nav-item" data-nav-toggle>',
                getIcon(item.icon, 'icon-nav'),
                '<span class="nav-item-label">' + this._escapeHtml(item.label) + '</span>',
                '<span class="nav-chevron">' + getIcon('chevronRight', 'icon-chevron') + '</span>',
              '</button>',
              '<div class="nav-submenu">'
          );

          item.children.forEach(function(child) {
            var childActive = (child.label === activeMenu || child.href === activeMenu);
            html.push(
              '<a href="' + this._escapeHtml(child.href || '#') + '" ' +
                 'class="nav-subitem' + (childActive ? ' active' : '') + '">',
                getIcon(child.icon, 'icon-nav-sm'),
                '<span>' + this._escapeHtml(child.label) + '</span>',
              '</a>'
            );
          }, this);

          html.push('</div>', '</div>');
        }
      }, this);

      html.push('</div>');
    }, this);

    return html.join('');
  }

  /* ── Events ───────────────────────────────────────────────────────────── */
  _bindEvents() {
    var self   = this;
    var root   = this.shadowRoot;
    var toggle = root.getElementById('sidebarToggle');
    var sidebar = root.getElementById('sidebar');
    var mainWrapper = root.getElementById('mainWrapper');
    var overlay = root.getElementById('sidebarOverlay');
    var avatar  = root.getElementById('profileAvatar');
    var dropdown = root.getElementById('profileDropdown');

    /* ── Sidebar toggle ── */
    if (toggle) {
      toggle.addEventListener('click', function() {
        if (window.innerWidth > 1024) {
          /* Desktop: collapse/expand */
          self._sidebarCollapsed = !self._sidebarCollapsed;
          if (self._sidebarCollapsed) {
            sidebar.classList.add('collapsed');
            mainWrapper.classList.add('sidebar-collapsed');
          } else {
            sidebar.classList.remove('collapsed');
            mainWrapper.classList.remove('sidebar-collapsed');
          }
        } else {
          /* Mobile: slide in/out */
          self._mobileOpen = !self._mobileOpen;
          if (self._mobileOpen) {
            sidebar.classList.add('mobile-open');
            overlay.classList.add('visible');
          } else {
            sidebar.classList.remove('mobile-open');
            overlay.classList.remove('visible');
          }
        }
      });
    }

    /* ── Overlay click: close mobile sidebar ── */
    if (overlay) {
      overlay.addEventListener('click', function() {
        self._mobileOpen = false;
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('visible');
      });
    }

    /* ── Profile dropdown toggle ── */
    if (avatar) {
      avatar.addEventListener('click', function(e) {
        e.stopPropagation();
        self._profileOpen = !self._profileOpen;
        if (self._profileOpen) {
          dropdown.classList.add('visible');
          avatar.setAttribute('aria-expanded', 'true');
        } else {
          dropdown.classList.remove('visible');
          avatar.setAttribute('aria-expanded', 'false');
        }
      });
    }

    /* ── Shadow root click: close dropdown ── */
    root.addEventListener('click', function() {
      if (self._profileOpen) {
        self._profileOpen = false;
        dropdown.classList.remove('visible');
        if (avatar) avatar.setAttribute('aria-expanded', 'false');
      }
    });

    /* ── Nav group toggles ── */
    var navToggles = root.querySelectorAll('[data-nav-toggle]');
    navToggles.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var group = btn.closest('.nav-group');
        if (group) group.classList.toggle('open');
      });
    });
  }

  /* ── HTML escape ──────────────────────────────────────────────────────── */
  _escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  /* ── Shadow styles ────────────────────────────────────────────────────── */
  _getShadowStyles() {
    return [
      /* ── Reset / host ── */
      ':host { display: block; }',
      '*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }',
      'a { text-decoration: none; color: inherit; }',
      'button { font-family: inherit; cursor: pointer; }',

      /* ── App layout ── */
      '.app-layout {',
      '  display: flex;',
      '  min-height: 100vh;',
      '}',

      /* ============================================================ */
      /* SIDEBAR                                                       */
      /* ============================================================ */
      '.sidebar {',
      '  position: fixed;',
      '  top: 0; left: 0; bottom: 0;',
      '  width: var(--mp-sidebar-w, 260px);',
      '  display: flex;',
      '  flex-direction: column;',
      '  background: var(--mp-sidebar-bg, #1e1b4b);',
      '  color: #c7d2fe;',
      '  z-index: 100;',
      '  overflow: hidden;',
      '  transition: width 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.3s cubic-bezier(0.4,0,0.2,1);',
      '}',

      /* Collapsed (desktop) */
      '.sidebar.collapsed {',
      '  width: var(--mp-sidebar-collapsed-w, 68px);',
      '}',
      '.sidebar.collapsed .nav-item-label,',
      '.sidebar.collapsed .nav-chevron,',
      '.sidebar.collapsed .nav-badge,',
      '.sidebar.collapsed .nav-submenu,',
      '.sidebar.collapsed .sidebar-title,',
      '.sidebar.collapsed .nav-section-label {',
      '  display: none;',
      '}',

      /* Mobile */
      '@media (max-width: 1024px) {',
      '  .sidebar {',
      '    transform: translateX(-100%);',
      '  }',
      '  .sidebar.mobile-open {',
      '    transform: translateX(0);',
      '    width: var(--mp-sidebar-w, 260px);',
      '  }',
      '}',

      /* Overlay */
      '.sidebar-overlay {',
      '  display: none;',
      '  position: fixed;',
      '  inset: 0;',
      '  background: rgba(0,0,0,0.4);',
      '  backdrop-filter: blur(2px);',
      '  z-index: 90;',
      '}',
      '.sidebar-overlay.visible { display: block; }',

      /* Brand */
      '.sidebar-brand {',
      '  height: var(--mp-topbar-h, 56px);',
      '  display: flex;',
      '  align-items: center;',
      '  padding: 0 16px;',
      '  gap: 12px;',
      '  border-bottom: 1px solid rgba(255,255,255,0.06);',
      '  flex-shrink: 0;',
      '}',
      '.sidebar-logo {',
      '  width: 36px; height: 36px;',
      '  border-radius: 10px;',
      '  background: linear-gradient(135deg, var(--mp-primary, #6366f1), var(--mp-primary-light, #818cf8));',
      '  color: #fff;',
      '  font-size: 14px;',
      '  font-weight: 700;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  flex-shrink: 0;',
      '  letter-spacing: -0.5px;',
      '}',
      '.sidebar-title {',
      '  font-size: 17px;',
      '  font-weight: 700;',
      '  color: #fff;',
      '  white-space: nowrap;',
      '}',

      /* Nav scroll area */
      '.sidebar-nav {',
      '  flex: 1;',
      '  overflow-y: auto;',
      '  overflow-x: hidden;',
      '  padding: 12px 0;',
      '}',
      '.sidebar-nav::-webkit-scrollbar { width: 4px; }',
      '.sidebar-nav::-webkit-scrollbar-track { background: transparent; }',
      '.sidebar-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }',

      /* Section label */
      '.nav-section-label {',
      '  font-size: 11px;',
      '  font-weight: 600;',
      '  text-transform: uppercase;',
      '  letter-spacing: 0.05em;',
      '  color: #818cf8;',
      '  padding: 16px 20px 8px;',
      '  white-space: nowrap;',
      '}',

      /* Nav items */
      '.nav-item {',
      '  display: flex;',
      '  align-items: center;',
      '  height: 40px;',
      '  gap: 12px;',
      '  font-size: 14px;',
      '  font-weight: 450;',
      '  color: #a5b4fc;',
      '  border-radius: var(--mp-radius-md, 8px);',
      '  margin: 1px 8px;',
      '  padding: 0 12px;',
      '  transition: background 0.15s, color 0.15s;',
      '  white-space: nowrap;',
      '  width: calc(100% - 16px);',
      '  border: none;',
      '  background: none;',
      '  text-align: left;',
      '}',
      '.nav-item:hover {',
      '  background: var(--mp-sidebar-hover, #312e81);',
      '  color: #e0e7ff;',
      '}',
      '.nav-item.active {',
      '  background: var(--mp-sidebar-active, #4338ca);',
      '  color: #fff;',
      '  font-weight: 500;',
      '}',

      /* Badge */
      '.nav-badge {',
      '  background: var(--mp-error, #ef4444);',
      '  color: #fff;',
      '  font-size: 11px;',
      '  font-weight: 600;',
      '  padding: 1px 7px;',
      '  border-radius: 10px;',
      '  line-height: 18px;',
      '}',

      /* Chevron */
      '.nav-chevron {',
      '  margin-left: auto;',
      '  opacity: 0.5;',
      '  display: flex;',
      '  align-items: center;',
      '  transition: transform 0.2s;',
      '}',
      '.nav-group.open > .nav-item .nav-chevron {',
      '  transform: rotate(90deg);',
      '}',

      /* Submenu */
      '.nav-submenu {',
      '  max-height: 0;',
      '  overflow: hidden;',
      '  transition: max-height 0.3s cubic-bezier(0.4,0,0.2,1);',
      '}',
      '.nav-group.open > .nav-submenu {',
      '  max-height: 600px;',
      '}',

      /* Subitem */
      '.nav-subitem {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 8px;',
      '  padding-left: 44px;',
      '  padding-right: 12px;',
      '  height: 36px;',
      '  font-size: 13px;',
      '  color: #818cf8;',
      '  border-radius: var(--mp-radius-md, 8px);',
      '  margin: 1px 8px;',
      '  width: calc(100% - 16px);',
      '  transition: background 0.15s, color 0.15s;',
      '  white-space: nowrap;',
      '}',
      '.nav-subitem:hover {',
      '  color: #c7d2fe;',
      '  background: var(--mp-sidebar-hover, #312e81);',
      '}',
      '.nav-subitem.active {',
      '  color: #fff;',
      '  background: rgba(99,102,241,0.15);',
      '}',

      /* Sidebar footer */
      '.sidebar-footer {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 10px;',
      '  padding: 12px 16px;',
      '  border-top: 1px solid rgba(255,255,255,0.06);',
      '  flex-shrink: 0;',
      '}',
      '.sidebar-footer-dot {',
      '  width: 8px; height: 8px;',
      '  border-radius: 50%;',
      '  background: var(--mp-success, #10b981);',
      '  flex-shrink: 0;',
      '}',
      '.sidebar-footer-text {',
      '  font-size: 12px;',
      '  color: #a5b4fc;',
      '  white-space: nowrap;',
      '}',
      '.sidebar-footer-status {',
      '  font-size: 11px;',
      '  color: var(--mp-success, #10b981);',
      '  margin-left: auto;',
      '  white-space: nowrap;',
      '}',

      /* ============================================================ */
      /* MAIN WRAPPER                                                  */
      /* ============================================================ */
      '.main-wrapper {',
      '  flex: 1;',
      '  display: flex;',
      '  flex-direction: column;',
      '  min-height: 100vh;',
      '  margin-left: var(--mp-sidebar-w, 260px);',
      '  transition: margin-left 0.3s cubic-bezier(0.4,0,0.2,1);',
      '}',
      '.main-wrapper.sidebar-collapsed {',
      '  margin-left: var(--mp-sidebar-collapsed-w, 68px);',
      '}',
      '@media (max-width: 1024px) {',
      '  .main-wrapper { margin-left: 0; }',
      '}',

      /* Topbar */
      '.topbar {',
      '  height: var(--mp-topbar-h, 56px);',
      '  display: flex;',
      '  align-items: center;',
      '  padding: 0 24px;',
      '  gap: 16px;',
      '  background: var(--mp-bg-card, #ffffff);',
      '  border-bottom: 1px solid var(--mp-border, #e2e8f0);',
      '  position: sticky;',
      '  top: 0;',
      '  z-index: 50;',
      '  box-shadow: 0 1px 2px rgba(0,0,0,0.04);',
      '  flex-shrink: 0;',
      '}',

      /* Toggle button */
      '.topbar-toggle {',
      '  width: 36px; height: 36px;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  border-radius: var(--mp-radius-md, 8px);',
      '  border: none;',
      '  background: none;',
      '  color: var(--mp-text-secondary, #64748b);',
      '  transition: background 0.15s, color 0.15s;',
      '  flex-shrink: 0;',
      '}',
      '.topbar-toggle:hover {',
      '  background: var(--mp-primary-50, #eef2ff);',
      '  color: var(--mp-primary, #6366f1);',
      '}',

      /* Breadcrumb */
      '.breadcrumb {',
      '  font-size: 14px;',
      '  font-weight: 600;',
      '  color: var(--mp-text-primary, #1e293b);',
      '}',

      /* Spacer */
      '.topbar-spacer { flex: 1; }',

      /* Profile area */
      '.profile-area {',
      '  position: relative;',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 12px;',
      '}',
      '.profile-info {',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: flex-end;',
      '}',
      '@media (max-width: 768px) {',
      '  .profile-info { display: none; }',
      '}',
      '.profile-name {',
      '  font-size: 13px;',
      '  font-weight: 500;',
      '  color: var(--mp-text-primary, #1e293b);',
      '}',
      '.profile-role {',
      '  font-size: 11px;',
      '  color: var(--mp-text-muted, #94a3b8);',
      '}',

      /* Avatar */
      '.profile-avatar {',
      '  width: 34px; height: 34px;',
      '  border-radius: 50%;',
      '  border: none;',
      '  background: linear-gradient(135deg, var(--mp-primary, #6366f1), #a78bfa);',
      '  color: #fff;',
      '  font-size: 13px;',
      '  font-weight: 600;',
      '  cursor: pointer;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  flex-shrink: 0;',
      '}',

      /* Dropdown */
      '.profile-dropdown {',
      '  display: none;',
      '  position: absolute;',
      '  right: 0;',
      '  top: 100%;',
      '  margin-top: 4px;',
      '  width: 220px;',
      '  background: var(--mp-bg-card, #ffffff);',
      '  border-radius: var(--mp-radius-lg, 12px);',
      '  box-shadow: 0 8px 24px rgba(0,0,0,0.12);',
      '  border: 1px solid var(--mp-border, #e2e8f0);',
      '  z-index: 60;',
      '  overflow: hidden;',
      '}',
      '.profile-dropdown.visible { display: block; }',

      '.profile-dropdown-header {',
      '  padding: 12px 16px;',
      '  border-bottom: 1px solid var(--mp-border-light, #f1f5f9);',
      '}',
      '.profile-dropdown-name {',
      '  font-size: 13px;',
      '  font-weight: 600;',
      '  color: var(--mp-text-primary, #1e293b);',
      '}',
      '.profile-dropdown-email {',
      '  font-size: 11px;',
      '  color: var(--mp-text-muted, #94a3b8);',
      '}',
      '.profile-dropdown-role {',
      '  font-size: 11px;',
      '  color: var(--mp-text-secondary, #64748b);',
      '  margin-top: 2px;',
      '}',

      '.profile-dropdown-item {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 10px;',
      '  padding: 8px 16px;',
      '  font-size: 13px;',
      '  color: var(--mp-text-secondary, #64748b);',
      '  cursor: pointer;',
      '  transition: background 0.15s, color 0.15s;',
      '}',
      '.profile-dropdown-item:hover {',
      '  background: var(--mp-bg-page, #f8fafc);',
      '  color: var(--mp-text-primary, #1e293b);',
      '}',
      '.profile-dropdown-item.logout { color: var(--mp-error, #ef4444); }',
      '.profile-dropdown-item.logout:hover { background: #fee2e2; }',

      /* Content */
      '.content {',
      '  flex: 1;',
      '  padding: 24px;',
      '}',
      '@media (max-width: 1024px) {',
      '  .content { padding: 16px; }',
      '}',

      /* ============================================================ */
      /* ICON SIZE HELPERS                                             */
      /* ============================================================ */
      '.icon-sm     { width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; }',
      '.icon-xs     { width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; }',
      '.icon-nav    { width: 20px; height: 20px; flex-shrink: 0; display: inline-flex; }',
      '.icon-nav-sm { width: 16px; height: 16px; flex-shrink: 0; display: inline-flex; }',
      '.icon-chevron{ width: 16px; height: 16px; display: inline-flex; }',

      /* SVG defaults for all icon classes */
      '.icon-sm svg, .icon-xs svg, .icon-nav svg, .icon-nav-sm svg, .icon-chevron svg {',
      '  width: 100%; height: 100%;',
      '  fill: none;',
      '  stroke: currentColor;',
      '  stroke-width: 2;',
      '  stroke-linecap: round;',
      '  stroke-linejoin: round;',
      '}',
    ].join('\n');
  }
}

/* ── Register ────────────────────────────────────────────────────────────── */
customElements.define('master-page', MasterPage);
