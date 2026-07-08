import { requireRole } from "@/server/queries/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/tables/data-table";
import { LecturerForm } from "@/features/lecturers/lecturer-form";

export default async function LecturersPage() {
  await requireRole(["super_admin", "admin_akademik", "kaprodi"]);
  const supabase = await createClient();

  const [{ data: lecturers }, { data: programs }, { data: profiles }] =
    await Promise.all([
      supabase
        .from("lecturers")
        .select("*, profiles(full_name, email), study_programs(name)")
        .order("lecturer_number"),
      supabase.from("study_programs").select("*").order("name"),
      supabase
        .from("profiles")
        .select("*")
        .eq("role", "dosen")
        .eq("is_active", true),
    ]);

  const linked = new Set(lecturers?.map((l) => l.profile_id) ?? []);
  const unlinked = profiles?.filter((p) => !linked.has(p.id)) ?? [];

  const rows =
    lecturers?.map((l) => ({
      ...l,
      full_name: l.profiles?.full_name ?? "—",
      program_name: l.study_programs?.name ?? "—",
      expertise: l.expertise ?? "—",
    })) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Dosen" description="Kelola data dosen">
        <LecturerForm programs={programs ?? []} profiles={unlinked} />
      </PageHeader>
      <DataTable
        columns={[
          { key: "lecturer_number", label: "NIDN" },
          { key: "full_name", label: "Nama" },
          { key: "program_name", label: "Prodi" },
          { key: "expertise", label: "Keahlian" },
        ]}
        data={rows}
      />
    </div>
  );
}
