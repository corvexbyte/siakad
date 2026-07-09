import {
  requireProfile,
  requireRole,
  getStudentByProfile,
  getActiveSemester,
} from "@/server/queries/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { KrsStudentView } from "@/features/krs/krs-student-view";
import { KrsAdminView } from "@/features/krs/krs-admin-view";
import { getOrCreateKrs } from "@/server/actions/krs-grades";

export default async function KrsPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const semester = await getActiveSemester();

  if (profile.role === "mahasiswa") {
    const student = await getStudentByProfile(profile.id);
    if (!student || !semester) {
      return (
        <PageHeader
          title="KRS"
          description="Semester aktif belum dikonfigurasi atau data mahasiswa belum lengkap"
        />
      );
    }

    const registration = await getOrCreateKrs(student.id, semester.id);

    const [{ data: items }, { data: availableClasses }] = await Promise.all([
      supabase
        .from("course_registration_items")
        .select("*, classes(*, courses(*), class_schedules(*, rooms(name)))")
        .eq("course_registration_id", registration?.id ?? ""),
      supabase
        .from("classes")
        .select("*, courses(*), class_schedules(*, rooms(name)), lecturers(users(full_name))")
        .eq("semester_id", semester.id)
        .eq("status", "open"),
    ]);

    return (
      <div className="space-y-6">
        <PageHeader
          title="Kartu Rencana Studi"
          description={`${semester.name} — Status: ${registration?.status ?? "draft"}`}
        />
        <KrsStudentView
          registration={registration!}
          items={items ?? []}
          availableClasses={availableClasses ?? []}
        />
      </div>
    );
  }

  await requireRole(["super_admin", "admin_akademik"]);
  const { data: registrations } = await supabase
    .from("course_registrations")
    .select("*, students(student_number, users(full_name)), semesters(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <PageHeader title="Validasi KRS" description="Daftar KRS mahasiswa" />
      <KrsAdminView registrations={registrations ?? []} />
    </div>
  );
}
