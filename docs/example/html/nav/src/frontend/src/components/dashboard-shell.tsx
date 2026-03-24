"use client";

import { useState, useCallback, useEffect } from "react";
import { Sidebar } from "@/components/sidebar/sidebar";
import { Navbar } from "@/components/navbar/navbar";
import { useCurrentUser } from "@/lib/use-current-user";
import { useProperty, PropertyProvider } from "@/lib/use-property";

function DashboardShellInner({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useCurrentUser();
  const { property } = useProperty();

  // Close mobile on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = useCallback(() => {
    if (window.innerWidth <= 1024) {
      setMobileOpen((v) => !v);
    } else {
      setCollapsed((v) => !v);
    }
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={closeMobile}
        userRole={user?.role}
        propertyName={property?.name}
      />

      {/* Main wrapper */}
      <div
        className={`
          flex-1 flex flex-col min-h-screen
          transition-[margin-left] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${collapsed ? "lg:ml-[var(--sidebar-collapsed-w)]" : "lg:ml-[var(--sidebar-w)]"}
          max-lg:ml-0
        `}
      >
        <Navbar onToggleSidebar={toggleSidebar} />

        <main className="flex-1 p-6 max-lg:p-4">
          {children}
        </main>
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <PropertyProvider>
      <DashboardShellInner>{children}</DashboardShellInner>
    </PropertyProvider>
  );
}
