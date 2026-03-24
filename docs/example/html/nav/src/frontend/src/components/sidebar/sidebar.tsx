"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { navigationData, filterNavigationByRole } from "./navigation-data";
import type { NavSection } from "./navigation-data";
import { SidebarIcon } from "./sidebar-icons";

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onToggleSubmenu?: (label: string) => void;
  userRole?: string;
  propertyName?: string;
}

export function Sidebar({ collapsed, mobileOpen, onCloseMobile, userRole, propertyName }: SidebarProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set());

  const filteredNav = useMemo(
    () => filterNavigationByRole(navigationData, userRole),
    [userRole]
  );

  // Auto-open parent menu matching current path
  useEffect(() => {
    const newOpenMenus = new Set<string>();
    for (const section of filteredNav) {
      for (const item of section.items) {
        if (item.children) {
          for (const child of item.children) {
            if (pathname === child.href || pathname.startsWith(child.href + "/")) {
              newOpenMenus.add(item.label);
              break;
            }
          }
        }
      }
    }
    setOpenMenus(newOpenMenus);
  }, [pathname, filteredNav]);

  // Close submenus when sidebar collapses
  useEffect(() => {
    if (collapsed) setOpenMenus(new Set());
  }, [collapsed]);

  const toggleSubmenu = useCallback(
    (label: string) => {
      if (collapsed) return;
      setOpenMenus((prev) => {
        const next = new Set(prev);
        if (next.has(label)) next.delete(label);
        else next.add(label);
        return next;
      });
    },
    [collapsed]
  );

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (pathname === href) return true;
    if (pathname.startsWith(href + "/")) {
      for (const section of filteredNav) {
        for (const item of section.items) {
          if (item.href && item.href !== href && pathname === item.href) return false;
          if (item.children) {
            for (const child of item.children) {
              if (child.href !== href && pathname === child.href) return false;
            }
          }
        }
      }
      return true;
    }
    return false;
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[90] lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-[100] flex flex-col
          bg-sidebar-bg text-[#c7d2fe] overflow-hidden
          transition-[width,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${collapsed ? "w-[var(--sidebar-collapsed-w)]" : "w-[var(--sidebar-w)]"}
          max-lg:-translate-x-full
          ${mobileOpen ? "max-lg:!translate-x-0 max-lg:!w-[var(--sidebar-w)]" : ""}
        `}
      >
        {/* Brand */}
        <div className="h-[var(--navbar-h)] flex items-center px-5 gap-3 border-b border-white/[0.06] shrink-0">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-light rounded-[10px] flex items-center justify-center text-lg font-bold text-white shrink-0 tracking-tighter">
            CR
          </div>
          <span
            className={`text-lg font-bold text-white whitespace-nowrap transition-opacity duration-200 ${
              collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            ConcreteRent
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 sidebar-nav-scroll">
          {filteredNav.map((section) => (
            <div key={section.label}>
              {/* Section Label */}
              <div
                className={`px-5 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#818cf8] whitespace-nowrap transition-opacity duration-200 ${
                  collapsed ? "opacity-0 pointer-events-none h-0 !p-0 !m-0 overflow-hidden" : "opacity-100"
                }`}
              >
                {section.label}
              </div>

              {section.items.map((item) => {
                const hasChildren = !!item.children?.length;
                const isOpen = openMenus.has(item.label);

                if (hasChildren) {
                  return (
                    <NavItemWithSub
                      key={item.label}
                      item={item}
                      isOpen={isOpen}
                      collapsed={collapsed}
                      onToggle={() => toggleSubmenu(item.label)}
                      isActive={isActive}
                      onCloseMobile={onCloseMobile}
                    />
                  );
                }

                return (
                  <div key={item.label}>
                    <Link
                      href={item.href!}
                      onClick={onCloseMobile}
                      className={`
                        flex items-center px-4 h-[42px] gap-3 text-[14px] font-[450]
                        rounded-lg mx-2 whitespace-nowrap cursor-pointer
                        transition-all duration-200
                        ${
                          isActive(item.href!)
                            ? "bg-sidebar-active text-white font-medium"
                            : "text-[#a5b4fc] hover:bg-sidebar-hover hover:text-[#e0e7ff]"
                        }
                      `}
                      style={{ width: "calc(100% - 16px)" }}
                    >
                      <SidebarIcon name={item.icon} className="w-5 h-5" />
                      <span
                        className={`flex-1 transition-opacity duration-200 ${
                          collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
                        }`}
                      >
                        {item.label}
                      </span>
                      {item.badge != null && !collapsed && (
                        <span className="bg-error text-white text-[11px] font-semibold px-[7px] py-px rounded-[10px] leading-[18px]">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/[0.06] shrink-0">
          <div
            className={`flex items-center gap-2.5 px-1 py-2 ${
              collapsed ? "hidden" : ""
            }`}
          >
            <div className="w-2 h-2 bg-success rounded-full shrink-0" />
            <span className="text-xs text-[#a5b4fc] whitespace-nowrap">{propertyName || "เลือกอาคาร"}</span>
            <span className="text-[11px] text-success ml-auto whitespace-nowrap">Online</span>
          </div>
        </div>
      </aside>
    </>
  );
}

// Sub-component for nav items with children (handles flyout positioning)
function NavItemWithSub({
  item,
  isOpen,
  collapsed,
  onToggle,
  isActive,
  onCloseMobile,
}: {
  item: NavSection["items"][0];
  isOpen: boolean;
  collapsed: boolean;
  onToggle: () => void;
  isActive: (href: string) => boolean;
  onCloseMobile: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [flyoutTop, setFlyoutTop] = useState(0);

  const handleMouseEnter = () => {
    if (!collapsed || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setFlyoutTop(rect.top);
  };

  return (
    <div
      ref={ref}
      className="relative group"
      onMouseEnter={handleMouseEnter}
    >
      {/* Parent button */}
      <button
        onClick={onToggle}
        className={`
          flex items-center w-[calc(100%-16px)] px-4 h-[42px] gap-3 text-[14px] font-[450]
          rounded-lg mx-2 text-[#a5b4fc] whitespace-nowrap cursor-pointer
          transition-all duration-200
          hover:bg-sidebar-hover hover:text-[#e0e7ff]
        `}
      >
        <SidebarIcon name={item.icon} className="w-5 h-5" />
        <span
          className={`flex-1 text-left transition-opacity duration-200 ${
            collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          {item.label}
        </span>
        {!collapsed && (
          <span
            className={`w-4 h-4 opacity-50 transition-transform duration-200 [&>span]:w-4 [&>span]:h-4 ${
              isOpen ? "rotate-90" : ""
            }`}
          >
            <SidebarIcon name="chevronRight" className="w-4 h-4 [&>svg]:stroke-2" />
          </span>
        )}
      </button>

      {/* Expanded submenu (normal mode) */}
      {!collapsed && (
        <ul
          className="overflow-hidden transition-[max-height] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ maxHeight: isOpen ? "600px" : "0px" }}
        >
          {item.children!.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                onClick={onCloseMobile}
                className={`
                  flex items-center gap-2.5 pl-11 pr-4 h-9 text-[13px]
                  mx-2 rounded-lg whitespace-nowrap w-[calc(100%-16px)]
                  transition-all duration-200
                  ${
                    isActive(child.href)
                      ? "text-white bg-[rgba(99,102,241,0.15)]"
                      : "text-[#818cf8] hover:text-[#c7d2fe] hover:bg-sidebar-hover"
                  }
                `}
              >
                <SidebarIcon name={child.icon} className="w-4 h-4 [&>svg]:stroke-2" />
                <span className="flex-1">{child.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Flyout submenu (collapsed mode) */}
      {collapsed && (
        <ul
          className="invisible group-hover:visible fixed left-[var(--sidebar-collapsed-w)] w-[220px] bg-sidebar-bg rounded-r-lg shadow-[4px_4px_16px_rgba(0,0,0,0.3)] py-2 z-[200]"
          style={{ top: flyoutTop }}
        >
          {item.children!.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                className={`
                  flex items-center gap-2.5 px-4 h-9 mx-2 text-[13px]
                  rounded-lg whitespace-nowrap w-[calc(100%-16px)]
                  transition-all duration-200
                  ${
                    isActive(child.href)
                      ? "text-white bg-[rgba(99,102,241,0.15)]"
                      : "text-[#818cf8] hover:text-[#c7d2fe] hover:bg-sidebar-hover"
                  }
                `}
              >
                <SidebarIcon name={child.icon} className="w-4 h-4 [&>svg]:stroke-2" />
                <span>{child.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
