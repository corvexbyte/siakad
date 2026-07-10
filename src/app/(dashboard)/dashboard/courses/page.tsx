import { requireRole } from "@/server/queries/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { CourseManager } from "@/features/courses/course-manager";

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
      <CourseManager courses={rows} programs={programs ?? []} />
    </div>
  );
}
