import { requireRole } from "@/server/queries/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { UsersClient } from "@/features/auth/users-client";
import type { UserRole } from "@/constants/roles";

export default async function UsersPage() {
  await requireRole(["super_admin"]);
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("users")
    .select("id, full_name, email, role, is_active, created_at")
    .order("role")
    .order("full_name");

  const rows = (users ?? []).map((u) => ({
    ...u,
    role: u.role as UserRole,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Users"
        description="Tambah user baru, ubah role, dan kelola status akun"
      />
      <UsersClient users={rows} />
    </div>
  );
}
