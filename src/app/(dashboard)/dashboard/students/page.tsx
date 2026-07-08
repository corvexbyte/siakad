import { requireRole } from "@/server/queries/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/tables/data-table";
import { StudentForm } from "@/features/students/student-form";
import { Badge } from "@/components/ui/badge";
import { ACADEMIC_STATUS_LABELS } from "@/types/academic";
import type { AcademicStatus } from "@/types/academic";

export default async function StudentsPage() {
  await requireRole(["super_admin", "admin_akademik", "kaprodi"]);
  const supabase = await createClient();

  const [{ data: students }, { data: programs }, { data: profiles }] =
    await Promise.all([
      supabase
        .from("students")
        .select("*, profiles(full_name, email), study_programs(name)")
        .order("student_number"),
      supabase.from("study_programs").select("*").order("name"),
      supabase
        .from("profiles")
        .select("*")
        .eq("role", "mahasiswa")
        .eq("is_active", true),
    ]);

  const linkedProfileIds = new Set(students?.map((s) => s.profile_id) ?? []);
  const unlinkedProfiles =
    profiles?.filter((p) => !linkedProfileIds.has(p.id)) ?? [];

  const rows =
    students?.map((s) => ({
      ...s,
      full_name: s.profiles?.full_name ?? "—",
      email: s.profiles?.email ?? "—",
      program_name: s.study_programs?.name ?? "—",
    })) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Mahasiswa" description="Kelola data mahasiswa">
        <StudentForm
          programs={programs ?? []}
          profiles={unlinkedProfiles}
        />
      </PageHeader>
      <DataTable
        columns={[
          { key: "student_number", label: "NIM" },
          { key: "full_name", label: "Nama" },
          { key: "program_name", label: "Prodi" },
          { key: "entry_year", label: "Angkatan" },
          {
            key: "academic_status",
            label: "Status",
            render: (r) => (
              <Badge variant="outline">
                {ACADEMIC_STATUS_LABELS[r.academic_status as AcademicStatus]}
              </Badge>
            ),
          },
        ]}
        data={rows}
      />
    </div>
  );
}
