import { requireRole, getLecturerByProfile, requireProfile } from "@/server/queries/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { GradesForm } from "@/features/grades/grades-form";

export default async function GradesPage() {
  const profile = await requireProfile();

  if (profile.role === "dosen") {
    const lecturer = await getLecturerByProfile(profile.id);
    if (!lecturer) {
      return <PageHeader title="Input Nilai" description="Data dosen tidak ditemukan" />;
    }

    const supabase = await createClient();
    const { data: classes } = await supabase
      .from("classes")
      .select("*, courses(course_code, course_name)")
      .eq("lecturer_id", lecturer.id)
      .order("class_name");

    return (
      <div className="space-y-6">
        <PageHeader title="Input Nilai" description="Input nilai mahasiswa per kelas" />
        <GradesForm classes={classes ?? []} />
      </div>
    );
  }

  await requireRole(["super_admin", "admin_akademik"]);
  const supabase = await createClient();
  const { data: classes } = await supabase
    .from("classes")
    .select("*, courses(course_code, course_name), lecturers(users(full_name))")
    .order("class_name");

  return (
    <div className="space-y-6">
      <PageHeader title="Nilai" description="Kelola nilai mahasiswa" />
      <GradesForm classes={classes ?? []} isAdmin />
    </div>
  );
}
