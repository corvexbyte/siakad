"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getMenuForRole } from "@/constants/menus";
import type { UserRole } from "@/constants/roles";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  role: UserRole;
}

export function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname();
  const items = getMenuForRole(role);

  return (
    <nav className="border-b bg-white shadow-sm md:hidden">
      <div className="flex gap-1.5 overflow-x-auto px-4 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-all duration-150",
                active
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-600 hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
