"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  getProfile,
  getLecturerByProfile,
  getStudentByProfile,
  logActivity,
  requireRole,
} from "@/server/queries/auth";
import { validateSksLimit, sumCredits } from "@/lib/validators/sks-limit";
import { hasScheduleConflict } from "@/lib/validators/schedule-conflict";
import type { DayOfWeek, ScheduleSlot } from "@/types/academic";
import { calculateGrade } from "@/lib/academic/grade-converter";
import { calculateIps } from "@/lib/academic/gpa-calculator";

export async function getOrCreateKrs(studentId: string, semesterId: string) {
  const supabase = await createClient();
  const { data: semester } = await supabase
    .from("semesters")
    .select("academic_year_id")
    .eq("id", semesterId)
    .single();

  if (!semester) return null;

  const { data: existing } = await supabase
    .from("course_registrations")
    .select("*")
    .eq("student_id", studentId)
    .eq("semester_id", semesterId)
    .maybeSingle();

  if (existing) return existing;

  const { data: created, error } = await supabase
    .from("course_registrations")
    .insert({
      student_id: studentId,
      academic_year_id: semester.academic_year_id,
      semester_id: semesterId,
      status: "draft",
    })
    .select()
    .single();

  if (error) return null;
  return created;
}

export async function addKrsItem(registrationId: string, classId: string) {
  await requireRole(["mahasiswa"]);
  const profile = await getProfile();
  const student = profile ? await getStudentByProfile(profile.id) : null;
  if (!student) return { error: "Data mahasiswa tidak ditemukan" };

  const supabase = await createClient();

  const { data: registration } = await supabase
    .from("course_registrations")
    .select("*")
    .eq("id", registrationId)
    .single();

  if (!registration || registration.status !== "draft") {
    return { error: "KRS tidak dapat diubah" };
  }
  if (registration.student_id !== student.id) {
    return { error: "KRS tidak dapat diubah" };
  }

  const { data: targetClass } = await supabase
    .from("classes")
    .select("*, courses(*), class_schedules(*)")
    .eq("id", classId)
    .single();

  if (!targetClass || targetClass.status !== "open") {
    return { error: "Kelas tidak tersedia" };
  }

  const { count } = await supabase
    .from("course_registration_items")
    .select("*", { count: "exact", head: true })
    .eq("class_id", classId);

  if (count && count >= targetClass.capacity) {
    return { error: "Kapasitas kelas penuh" };
  }

  const { data: currentItems } = await supabase
    .from("course_registration_items")
    .select("*, classes(*, courses(*), class_schedules(*))")
    .eq("course_registration_id", registrationId);

  const currentCredits =
    currentItems?.map((i) => i.classes?.courses?.credits ?? 0) ?? [];
  const sksCheck = validateSksLimit(
    sumCredits(currentCredits),
    targetClass.courses?.credits ?? 0,
  );
  if (!sksCheck.valid) return { error: sksCheck.message };

  const existingSlots: ScheduleSlot[] = [];
  currentItems?.forEach((item) => {
    item.classes?.class_schedules?.forEach(
      (s: { day_of_week: DayOfWeek; start_time: string; end_time: string }) => {
        existingSlots.push({
          dayOfWeek: s.day_of_week,
          startTime: s.start_time,
          endTime: s.end_time,
        });
      },
    );
  });

  for (const s of targetClass.class_schedules ?? []) {
    const candidate: ScheduleSlot = {
      dayOfWeek: s.day_of_week,
      startTime: s.start_time,
      endTime: s.end_time,
    };
    if (hasScheduleConflict(existingSlots, candidate)) {
      return { error: "Bentrok jadwal kuliah" };
    }
  }

  const duplicateCourse = currentItems?.some(
    (i) => i.classes?.course_id === targetClass.course_id,
  );
  if (duplicateCourse) {
    return { error: "Mata kuliah sudah diambil" };
  }

  const { error } = await supabase.from("course_registration_items").insert({
    course_registration_id: registrationId,
    class_id: classId,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/krs");
  return { success: true };
}

export async function removeKrsItem(itemId: string) {
  await requireRole(["mahasiswa"]);
  const profile = await getProfile();
  const student = profile ? await getStudentByProfile(profile.id) : null;
  if (!student) return { error: "Data mahasiswa tidak ditemukan" };
  const supabase = await createClient();
  const { data: item } = await supabase
    .from("course_registration_items")
    .select("course_registrations(student_id)")
    .eq("id", itemId)
    .single();
  if (item?.course_registrations?.student_id !== student.id) {
    return { error: "KRS tidak dapat diubah" };
  }

  const { error } = await supabase
    .from("course_registration_items")
    .delete()
    .eq("id", itemId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/krs");
  return { success: true };
}

export async function submitKrs(registrationId: string) {
  await requireRole(["mahasiswa"]);
  const profile = await getProfile();
  const student = profile ? await getStudentByProfile(profile.id) : null;
  if (!student) return { error: "Data mahasiswa tidak ditemukan" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("course_registrations")
    .update({ status: "submitted", submitted_at: new Date().toISOString() })
    .eq("id", registrationId)
    .eq("student_id", student.id)
    .eq("status", "draft");
  if (error) return { error: error.message };
  await logActivity("submit_krs", "course_registrations", registrationId);
  revalidatePath("/dashboard/krs");
  return { success: true };
}

export async function approveKrs(registrationId: string) {
  const profile = await requireRole(["super_admin", "admin_akademik", "dosen"]);
  const supabase = await createClient();
  if (profile?.role === "dosen") {
    const lecturer = await getLecturerByProfile(profile.id);
    const { data: registration } = await supabase
      .from("course_registrations")
      .select("student_id")
      .eq("id", registrationId)
      .single();
    const { data: advisor } = await supabase
      .from("student_advisors")
      .select("id")
      .eq("student_id", registration?.student_id ?? "")
      .eq("lecturer_id", lecturer?.id ?? "")
      .maybeSingle();
    if (!advisor) return { error: "Anda bukan dosen wali mahasiswa ini" };
  }

  const { error } = await supabase
    .from("course_registrations")
    .update({
      status: "approved",
      approved_by: profile?.id,
      approved_at: new Date().toISOString(),
    })
    .eq("id", registrationId)
    .eq("status", "submitted");
  if (error) return { error: error.message };
  await logActivity("approve_krs", "course_registrations", registrationId);
  revalidatePath("/dashboard/krs");
  revalidatePath("/dashboard/advisor/krs");
  return { success: true };
}

export async function rejectKrs(registrationId: string, reason: string) {
  const profile = await requireRole(["super_admin", "admin_akademik", "dosen"]);
  const supabase = await createClient();
  if (profile.role === "dosen") {
    const lecturer = await getLecturerByProfile(profile.id);
    const { data: registration } = await supabase
      .from("course_registrations")
      .select("student_id")
      .eq("id", registrationId)
      .single();
    const { data: advisor } = await supabase
      .from("student_advisors")
      .select("id")
      .eq("student_id", registration?.student_id ?? "")
      .eq("lecturer_id", lecturer?.id ?? "")
      .maybeSingle();
    if (!advisor) return { error: "Anda bukan dosen wali mahasiswa ini" };
  }

  const { error } = await supabase
    .from("course_registrations")
    .update({
      status: "rejected",
      rejection_reason: reason,
    })
    .eq("id", registrationId)
    .eq("status", "submitted");
  if (error) return { error: error.message };
  revalidatePath("/dashboard/krs");
  revalidatePath("/dashboard/advisor/krs");
  return { success: true };
}

export async function saveGrade(
  studentId: string,
  classId: string,
  assignment: number | null,
  midterm: number | null,
  final: number | null,
) {
  const profile = await requireRole(["super_admin", "admin_akademik", "dosen"]);
  const supabase = await createClient();
  if (profile.role === "dosen") {
    const lecturer = await getLecturerByProfile(profile.id);
    const { data: targetClass } = await supabase
      .from("classes")
      .select("lecturer_id")
      .eq("id", classId)
      .single();
    if (!lecturer || targetClass?.lecturer_id !== lecturer.id) {
      return { error: "Anda tidak berhak menginput nilai kelas ini" };
    }
  }

  const { data: existing } = await supabase
    .from("grades")
    .select("is_locked")
    .eq("student_id", studentId)
    .eq("class_id", classId)
    .maybeSingle();
  if (existing?.is_locked) {
    return { error: "Nilai sudah dikunci dan tidak dapat diubah" };
  }

  const calculated = calculateGrade(assignment, midterm, final);

  const { error } = await supabase.from("grades").upsert(
    {
      student_id: studentId,
      class_id: classId,
      assignment_score: assignment,
      midterm_score: midterm,
      final_score: final,
      final_numeric_score: calculated?.numeric ?? null,
      final_letter_grade: calculated?.letter ?? null,
      grade_point: calculated?.point ?? null,
    },
    { onConflict: "student_id,class_id" },
  );

  if (error) return { error: error.message };
  revalidatePath("/dashboard/grades");
  return { success: true };
}

export async function publishGrades(classId: string) {
  const profile = await requireRole(["super_admin", "admin_akademik", "dosen"]);
  const supabase = await createClient();
  if (profile.role === "dosen") {
    const lecturer = await getLecturerByProfile(profile.id);
    const { data: targetClass } = await supabase
      .from("classes")
      .select("lecturer_id")
      .eq("id", classId)
      .single();
    if (!lecturer || targetClass?.lecturer_id !== lecturer.id) {
      return { error: "Anda tidak berhak mempublikasikan nilai kelas ini" };
    }
  }

  const { error } = await supabase
    .from("grades")
    .update({ is_published: true })
    .eq("class_id", classId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/grades");
  return { success: true };
}

export async function getClassGrades(classId: string) {
  const profile = await requireRole(["super_admin", "admin_akademik", "dosen"]);
  const supabase = await createClient();

  if (profile.role === "dosen") {
    const lecturer = await getLecturerByProfile(profile.id);
    const { data: targetClass } = await supabase
      .from("classes")
      .select("lecturer_id")
      .eq("id", classId)
      .single();
    if (!lecturer || targetClass?.lecturer_id !== lecturer.id) {
      return { error: "Anda tidak berhak melihat kelas ini", students: [] };
    }
  }

  const { data: registrationItems } = await supabase
    .from("course_registration_items")
    .select("course_registrations!inner(student_id, status)")
    .eq("class_id", classId)
    .eq("course_registrations.status", "approved");

  const studentIds =
    registrationItems
      ?.map((item) => item.course_registrations?.student_id)
      .filter(Boolean) ?? [];

  if (!studentIds.length) return { students: [] };

  const [{ data: grades }, { data: studentData }] = await Promise.all([
    supabase
      .from("grades")
      .select("*, students(student_number, users(full_name))")
      .eq("class_id", classId)
      .in("student_id", studentIds),
    supabase
      .from("students")
      .select("id, student_number, users(full_name)")
      .in("id", studentIds),
  ]);

  const gradeMap = new Map(grades?.map((grade) => [grade.student_id, grade]));
  const students =
    studentData?.map((student) => {
      const existing = gradeMap.get(student.id);
      return (
        existing ?? {
          id: "",
          student_id: student.id,
          assignment_score: null,
          midterm_score: null,
          final_score: null,
          final_numeric_score: null,
          final_letter_grade: null,
          is_published: false,
          is_locked: false,
          students: student,
        }
      );
    }) ?? [];

  return { students };
}

export async function lockGrades(classId: string) {
  await requireRole(["super_admin", "admin_akademik"]);
  const supabase = await createClient();
  const { error } = await supabase
    .from("grades")
    .update({ is_locked: true })
    .eq("class_id", classId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/grades");
  return { success: true };
}

export async function computeAndSaveIps(
  studentId: string,
  semesterId: string,
) {
  const supabase = await createClient();
  const { data: semester } = await supabase
    .from("semesters")
    .select("academic_year_id")
    .eq("id", semesterId)
    .single();

  if (!semester) return;

  const { data: grades } = await supabase
    .from("grades")
    .select("*, classes!inner(*, courses(*), semester_id)")
    .eq("student_id", studentId)
    .eq("classes.semester_id", semesterId)
    .eq("is_published", true);

  if (!grades?.length) return;

  const records = grades.map((g) => ({
    credits: g.classes?.courses?.credits ?? 0,
    gradePoint: g.grade_point ?? 0,
  }));

  const ips = calculateIps(records);
  const totalSks = records.reduce((s, r) => s + r.credits, 0);

  await supabase.from("academic_records").upsert(
    {
      student_id: studentId,
      academic_year_id: semester.academic_year_id,
      semester_id: semesterId,
      ips,
      total_sks: totalSks,
    },
    { onConflict: "student_id,academic_year_id,semester_id" },
  );
}
