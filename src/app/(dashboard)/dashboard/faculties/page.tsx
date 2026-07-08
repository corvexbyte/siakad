import { requireRole } from "@/server/queries/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/tables/data-table";
import { FacultyForm } from "@/features/master/faculty-form";

export default async function FacultiesPage() {
  await requireRole(["super_admin"]);
  const supabase = await createClient();
  const { data: faculties } = await supabase
    .from("faculties")
    .select("*")
    .order("code");

  return (
    <div className="space-y-6">
      <PageHeader title="Fakultas" description="Kelola data fakultas">
        <FacultyForm />
      </PageHeader>
      <DataTable
        columns={[
          { key: "code", label: "Kode" },
          { key: "name", label: "Nama Fakultas" },
        ]}
        data={faculties ?? []}
      />
    </div>
  );
}
