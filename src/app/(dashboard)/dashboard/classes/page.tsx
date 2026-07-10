import { requireRole } from "@/server/queries/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { ClassManager } from "@/features/classes/class-manager";

export default async function ClassesPage() {
  await requireRole(["super_admin", "admin_akademik", "kaprodi"]);
  const supabase = await createClient();

  const [{ data: classes }, { data: courses }, { data: lecturers }, { data: years }, { data: semesters }] =
    await Promise.all([
      supabase
        .from("classes")
        .select("*, courses(course_code, course_name), lecturers(users(full_name)), semesters(name)")
        .order("class_name"),
      supabase.from("courses").select("*").eq("is_active", true).order("course_code"),
      supabase.from("lecturers").select("id, users(full_name)").order("lecturer_number"),
      supabase.from("academic_years").select("*").order("year_label", { ascending: false }),
      supabase.from("semesters").select("*").order("created_at", { ascending: false }),
    ]);

  const rows =
    classes?.map((c) => ({
      ...c,
      course_label: `${c.courses?.course_code} — ${c.courses?.course_name}`,
      lecturer_name: c.lecturers?.users?.full_name ?? "—",
      semester_name: c.semesters?.name ?? "—",
    })) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Kelas" description="Kelola kelas perkuliahan" />
      <ClassManager
        classes={rows}
        courses={courses ?? []}
        lecturers={lecturers ?? []}
        years={years ?? []}
        semesters={semesters ?? []}
      />
    </div>
  );
}
