import { requireRole } from "@/server/queries/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/tables/data-table";
import { CourseForm } from "@/features/courses/course-form";
import { Badge } from "@/components/ui/badge";

export default async function CoursesPage() {
  await requireRole(["super_admin", "admin_akademik"]);
  const supabase = await createClient();

  const [{ data: courses }, { data: programs }] = await Promise.all([
    supabase
      .from("courses")
      .select("*, study_programs(name)")
      .order("course_code"),
    supabase.from("study_programs").select("*").order("name"),
  ]);

  const rows =
    courses?.map((c) => ({
      ...c,
      program_name: c.study_programs?.name ?? "—",
    })) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Mata Kuliah" description="Kelola mata kuliah" />
      <CourseForm programs={programs ?? []} />
      <DataTable
        columns={[
          { key: "course_code", label: "Kode" },
          { key: "course_name", label: "Nama" },
          { key: "credits", label: "SKS" },
          { key: "program_name", label: "Prodi" },
          {
            key: "is_active",
            label: "Status",
            render: (r) => (
              <Badge variant={r.is_active ? "success" : "secondary"}>
                {r.is_active ? "Aktif" : "Nonaktif"}
              </Badge>
            ),
          },
        ]}
        data={rows}
      />
    </div>
  );
}
