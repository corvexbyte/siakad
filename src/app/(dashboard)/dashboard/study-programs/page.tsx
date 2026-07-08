import { requireRole } from "@/server/queries/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/tables/data-table";
import { StudyProgramForm } from "@/features/master/study-program-form";

export default async function StudyProgramsPage() {
  await requireRole(["super_admin", "admin_akademik"]);
  const supabase = await createClient();
  const [{ data: programs }, { data: faculties }] = await Promise.all([
    supabase.from("study_programs").select("*, faculties(name)").order("code"),
    supabase.from("faculties").select("*").order("name"),
  ]);

  const rows =
    programs?.map((p) => ({
      ...p,
      faculty_name: p.faculties?.name ?? "—",
    })) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Program Studi" description="Kelola program studi">
        <StudyProgramForm faculties={faculties ?? []} />
      </PageHeader>
      <DataTable
        columns={[
          { key: "code", label: "Kode" },
          { key: "name", label: "Nama Prodi" },
          { key: "faculty_name", label: "Fakultas" },
          { key: "degree_level", label: "Jenjang" },
        ]}
        data={rows}
      />
    </div>
  );
}
