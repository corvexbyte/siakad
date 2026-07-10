import { requireRole } from "@/server/queries/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { StudentManager } from "@/features/students/student-manager";

export default async function StudentsPage() {
  await requireRole(["super_admin", "admin_akademik", "kaprodi"]);
  const supabase = await createClient();

  const [{ data: students }, { data: programs }, { data: profiles }] =
    await Promise.all([
      supabase
        .from("students")
        .select("*, users(full_name, email), study_programs(name)")
        .order("student_number"),
      supabase.from("study_programs").select("*").order("name"),
      supabase
        .from("users")
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
      full_name: s.users?.full_name ?? "—",
      email: s.users?.email ?? "—",
      program_name: s.study_programs?.name ?? "—",
    })) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Mahasiswa" description="Kelola data mahasiswa" />
      <StudentManager
        students={rows}
        programs={programs ?? []}
        profiles={unlinkedProfiles}
      />
    </div>
  );
}
