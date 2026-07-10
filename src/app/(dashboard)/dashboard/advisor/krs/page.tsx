import { requireRole, getLecturerByProfile, requireProfile } from "@/server/queries/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { KrsAdminView } from "@/features/krs/krs-admin-view";

export default async function AdvisorKrsPage() {
  await requireRole(["dosen"]);
  const profile = await requireProfile();
  const lecturer = await getLecturerByProfile(profile.id);
  const supabase = await createClient();

  if (!lecturer) {
    return <PageHeader title="Validasi KRS" description="Data dosen tidak ditemukan" />;
  }

  const { data: advisees } = await supabase
    .from("student_advisors")
    .select("student_id")
    .eq("lecturer_id", lecturer.id);

  const studentIds = advisees?.map((a) => a.student_id) ?? [];

  const { data: registrations } = await supabase
    .from("course_registrations")
    .select(
      "*, students(student_number, users(full_name)), semesters(name), course_registration_items(id, classes(courses(course_code, course_name, credits)))",
    )
    .in("student_id", studentIds.length ? studentIds : ["00000000-0000-0000-0000-000000000000"])
    .eq("status", "submitted")
    .order("submitted_at", { ascending: false });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Validasi KRS Mahasiswa Bimbingan"
        description="Setujui atau tolak KRS mahasiswa bimbingan Anda"
      />
      <KrsAdminView registrations={registrations ?? []} />
    </div>
  );
}
