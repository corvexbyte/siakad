import { requireRole } from "@/server/queries/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { FacultyManager } from "@/features/master/faculty-manager";

export default async function FacultiesPage() {
  const profile = await requireRole(["super_admin"]);
  const supabase = await createClient();
  const { data: faculties } = await supabase
    .from("faculties")
    .select("*")
    .order("code");

  return (
    <div className="space-y-6">
      <PageHeader title="Fakultas" description="Kelola data fakultas" />
      <FacultyManager
        faculties={faculties ?? []}
        canDelete={profile.role === "super_admin"}
      />
    </div>
  );
}
