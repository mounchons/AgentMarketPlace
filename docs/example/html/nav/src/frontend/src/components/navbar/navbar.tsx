"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SidebarIcon } from "@/components/sidebar/sidebar-icons";
import { navigationData } from "@/components/sidebar/navigation-data";
import { useCurrentUser } from "@/lib/use-current-user";
import { useProperty } from "@/lib/use-property";

interface NavbarProps {
  onToggleSidebar: () => void;
}

// Build breadcrumb from pathname
function useBreadcrumb(pathname: string) {
  for (const section of navigationData) {
    for (const item of section.items) {
      if (item.href && (pathname === item.href || pathname.startsWith(item.href + "/"))) {
        return [{ label: item.label }];
      }
      if (item.children) {
        for (const child of item.children) {
          if (pathname === child.href || pathname.startsWith(child.href + "/")) {
            return [{ label: item.label }, { label: child.label }];
          }
        }
      }
    }
  }
  return [{ label: "แดชบอร์ด" }];
}

function getInitials(firstName: string, lastName: string): string {
  const f = firstName.charAt(0);
  const l = lastName.charAt(0);
  if (f && l) return f + l;
  if (f) return f;
  return "U";
}

function getDisplayName(firstName: string, lastName: string): string {
  return [firstName, lastName].filter(Boolean).join(" ") || "User";
}

const ROLE_LABELS: Record<string, string> = {
  Owner: "ผู้ดูแล (Owner)",
  Manager: "ผู้จัดการ",
  Accountant: "บัญชี",
  Maintenance: "ช่างซ่อม",
  Viewer: "ผู้ดูอย่างเดียว",
};

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const breadcrumb = useBreadcrumb(pathname);
  const user = useCurrentUser();
  const { property } = useProperty();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen]);

  const initials = user ? getInitials(user.firstName, user.lastName) : "..";
  const displayName = user ? getDisplayName(user.firstName, user.lastName) : "กำลังโหลด...";
  const roleLabel = user ? (ROLE_LABELS[user.role] || user.role) : "";

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <header className="h-[var(--navbar-h)] bg-bg-card border-b border-border flex items-center px-6 gap-4 sticky top-0 z-50 shadow-sm">
      {/* Toggle button */}
      <button
        onClick={onToggleSidebar}
        className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-md)] text-text-secondary transition-all duration-200 hover:bg-primary-50 hover:text-primary"
      >
        <SidebarIcon name="menu" className="w-5 h-5 [&>svg]:stroke-2" />
      </button>

      {/* Property name */}
      {property && (
        <span className="text-sm font-medium text-text-secondary hidden sm:block">
          {property.name}
        </span>
      )}

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        {breadcrumb.map((item, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-text-muted text-xs">/</span>}
            <span
              className={
                i === breadcrumb.length - 1
                  ? "text-text-primary font-semibold"
                  : "text-text-secondary"
              }
            >
              {item.label}
            </span>
          </span>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side: user name + role + logout */}
      <div className="flex items-center gap-3">
        {/* User display (always visible) */}
        <div className="hidden md:flex items-center gap-2 text-sm">
          <span className="text-text-primary font-medium">{displayName}</span>
          {roleLabel && (
            <span className="text-text-muted">({roleLabel})</span>
          )}
        </div>

        {/* Logout link */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="text-sm text-text-muted hover:text-error transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {loggingOut ? "กำลังออก..." : "ออกจากระบบ"}
        </button>

        {/* Divider + Profile dropdown (mobile) */}
        <div className="w-px h-7 bg-border mx-1 md:hidden" />

        {/* Mobile avatar with dropdown */}
        <div className="relative md:hidden" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 py-1 px-1 rounded-[var(--radius-lg)] cursor-pointer transition-colors duration-200 hover:bg-bg-page"
          >
            <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-primary to-[#a78bfa] flex items-center justify-center text-white text-[13px] font-semibold">
              {initials}
            </div>
          </button>

          {/* Mobile Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-bg-card rounded-[var(--radius-lg)] shadow-lg border border-border py-1 z-[60]">
              {/* User Info */}
              <div className="px-3 py-2.5 border-b border-border-light">
                <div className="text-[13px] font-semibold text-text-primary">{displayName}</div>
                <div className="text-[11px] text-text-muted">{user?.email}</div>
                {roleLabel && (
                  <div className="text-[11px] text-text-secondary mt-0.5">{roleLabel}</div>
                )}
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    router.push("/profile");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-text-secondary hover:bg-bg-page hover:text-text-primary transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                  โปรไฟล์ของฉัน
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-border-light pt-1">
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-error hover:bg-error-light transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                  </svg>
                  {loggingOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
