"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getMenuForRole } from "@/constants/menus";
import type { UserRole } from "@/constants/roles";
import { GraduationCap } from "lucide-react";

interface SidebarProps {
  role: UserRole;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const items = getMenuForRole(role);

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-white shadow-sm md:flex md:flex-col">
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-foreground">SIAKAD</span>
      </div>
      <nav className="flex-1 overflow-y-auto space-y-0.5 p-3">
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
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                active
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-600 hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
