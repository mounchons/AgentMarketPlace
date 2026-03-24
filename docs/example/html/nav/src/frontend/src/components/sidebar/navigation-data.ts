export interface NavSubItem {
  label: string;
  href: string;
  icon: string;
  roles?: string[];
}

export interface NavItem {
  label: string;
  href?: string;
  icon: string;
  badge?: number;       // notification count
  roles?: string[];
  children?: NavSubItem[];
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const navigationData: NavSection[] = [
  {
    label: "หลัก",
    items: [
      {
        label: "แดชบอร์ด",
        href: "/",
        icon: "dashboard",
      },
    ],
  },
  {
    label: "จัดการอสังหาฯ",
    items: [
      {
        label: "อาคาร/โครงการ",
        icon: "building",
        roles: ["Owner", "Manager"],
        children: [
          { label: "รายการอาคาร", href: "/properties", icon: "building" },
          { label: "สร้างอาคารใหม่", href: "/properties/new", icon: "edit" },
        ],
      },
      {
        label: "ผู้เช่า",
        icon: "vendors",
        roles: ["Owner", "Manager"],
        children: [
          { label: "รายการผู้เช่า", href: "/residents", icon: "vendor" },
          { label: "เพิ่มผู้เช่าใหม่", href: "/residents/new", icon: "walkin" },
        ],
      },
      {
        label: "สัญญาเช่า",
        icon: "contract",
        roles: ["Owner", "Manager", "Accountant"],
        children: [
          { label: "รายการสัญญา", href: "/leases", icon: "contract" },
          { label: "สร้างสัญญาใหม่", href: "/leases/new", icon: "edit" },
        ],
      },
    ],
  },
  {
    label: "การเงิน",
    items: [
      {
        label: "มิเตอร์",
        href: "/meters",
        icon: "meter",
        roles: ["Owner", "Manager", "Accountant"],
      },
      {
        label: "จดมิเตอร์",
        href: "/meter-readings",
        icon: "meter",
        roles: ["Owner", "Manager", "Accountant"],
      },
      {
        label: "ใบแจ้งหนี้",
        href: "/invoices",
        icon: "invoice",
        roles: ["Owner", "Manager", "Accountant"],
      },
      {
        label: "การชำระเงิน",
        href: "/payments/cash",
        icon: "cash",
        roles: ["Owner", "Manager", "Accountant"],
      },
    ],
  },
  {
    label: "ระบบ",
    items: [
      {
        label: "ผู้ใช้งาน",
        href: "/users",
        icon: "userPlus",
        roles: ["Owner"],
      },
      {
        label: "ตั้งค่า",
        href: "/settings",
        icon: "settings",
        roles: ["Owner"],
      },
    ],
  },
];

/**
 * Filter navigation data based on user role.
 * Items without `roles` are visible to all roles.
 * Empty sections are removed.
 */
export function filterNavigationByRole(data: NavSection[], role: string | undefined): NavSection[] {
  if (!role) return data;

  return data
    .map((section) => {
      const filteredItems = section.items
        .filter((item) => !item.roles || item.roles.includes(role))
        .map((item) => {
          if (!item.children) return item;
          const filteredChildren = item.children.filter(
            (child) => !child.roles || child.roles.includes(role)
          );
          if (filteredChildren.length === 0) return null;
          return { ...item, children: filteredChildren };
        })
        .filter((item): item is NavItem => item !== null);

      if (filteredItems.length === 0) return null;
      return { ...section, items: filteredItems };
    })
    .filter((section): section is NavSection => section !== null);
}
