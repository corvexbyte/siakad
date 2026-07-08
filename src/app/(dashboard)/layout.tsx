import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getMenuForRole } from "@/constants/menus";
import { requireProfile } from "@/server/queries/auth";
import type { UserRole } from "@/constants/roles";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile();
  const menuItems = getMenuForRole(profile.role as UserRole);

  return (
    <div className="flex min-h-screen">
      <Sidebar items={menuItems} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar profile={profile} />
        <MobileNav items={menuItems} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
