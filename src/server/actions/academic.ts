"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity, requireRole } from "@/server/queries/auth";
import type { DayOfWeek } from "@/types/database";

async function guardAdmin() {
  return requireRole(["super_admin", "admin_akademik"]);
}

export async function createFaculty(formData: FormData) {
  await guardAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("faculties").insert({
    code: formData.get("code") as string,
    name: formData.get("name") as string,
  });
  if (error) return { error: error.message };
  await logActivity("create_faculty");
  revalidatePath("/dashboard/faculties");
  return { success: true };
}

export async function updateFaculty(id: string, formData: FormData) {
  await guardAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("faculties")
    .update({
      code: formData.get("code") as string,
      name: formData.get("name") as string,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/faculties");
  return { success: true };
}

export async function deleteFaculty(id: string) {
  await requireRole(["super_admin"]);
  const supabase = await createClient();
  const { error } = await supabase.from("faculties").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/faculties");
  return { success: true };
}

export async function createStudyProgram(formData: FormData) {
  await guardAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("study_programs").insert({
    faculty_id: formData.get("faculty_id") as string,
    code: formData.get("code") as string,
    name: formData.get("name") as string,
    degree_level: (formData.get("degree_level") as string) || "S1",
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/study-programs");
  return { success: true };
}

export async function createAcademicYear(formData: FormData) {
  await guardAdmin();
  const supabase = await createClient();
  const isActive = formData.get("is_active") === "on";
  if (isActive) {
    await supabase
      .from("academic_years")
      .update({ is_active: false })
      .neq("id", "00000000-0000-0000-0000-000000000000");
  }
  const { error } = await supabase.from("academic_years").insert({
    year_label: formData.get("year_label") as string,
    is_active: isActive,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function createSemester(formData: FormData) {
  await guardAdmin();
  const supabase = await createClient();
  const isActive = formData.get("is_active") === "on";
  if (isActive) {
    await supabase
      .from("semesters")
      .update({ is_active: false })
      .neq("id", "00000000-0000-0000-0000-000000000000");
  }
  const { error } = await supabase.from("semesters").insert({
    academic_year_id: formData.get("academic_year_id") as string,
    name: formData.get("name") as string,
    semester_number: Number(formData.get("semester_number")),
    is_active: isActive,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function createRoom(formData: FormData) {
  await guardAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("rooms").insert({
    code: formData.get("code") as string,
    name: formData.get("name") as string,
    capacity: Number(formData.get("capacity") || 40),
    building: (formData.get("building") as string) || null,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function createCourse(formData: FormData) {
  await guardAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("courses").insert({
    course_code: formData.get("course_code") as string,
    course_name: formData.get("course_name") as string,
    credits: Number(formData.get("credits")),
    semester_recommended: Number(formData.get("semester_recommended") || 1),
    study_program_id: formData.get("study_program_id") as string,
    curriculum_id: (formData.get("curriculum_id") as string) || null,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/courses");
  return { success: true };
}

export async function updateCourse(id: string, formData: FormData) {
  await guardAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("courses")
    .update({
      course_code: formData.get("course_code") as string,
      course_name: formData.get("course_name") as string,
      credits: Number(formData.get("credits")),
      semester_recommended: Number(formData.get("semester_recommended")),
      study_program_id: formData.get("study_program_id") as string,
      is_active: formData.get("is_active") === "on",
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/courses");
  return { success: true };
}

export async function createStudent(formData: FormData) {
  await guardAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("students").insert({
    profile_id: formData.get("profile_id") as string,
    student_number: formData.get("student_number") as string,
    study_program_id: formData.get("study_program_id") as string,
    entry_year: Number(formData.get("entry_year")),
    academic_status:
      (formData.get("academic_status") as "active") || "active",
    current_semester: Number(formData.get("current_semester") || 1),
  });
  if (error) return { error: error.message };
  await logActivity("create_student");
  revalidatePath("/dashboard/students");
  return { success: true };
}

export async function updateStudent(id: string, formData: FormData) {
  await guardAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("students")
    .update({
      student_number: formData.get("student_number") as string,
      study_program_id: formData.get("study_program_id") as string,
      entry_year: Number(formData.get("entry_year")),
      academic_status: formData.get("academic_status") as "active",
      current_semester: Number(formData.get("current_semester")),
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/students");
  return { success: true };
}

export async function createLecturer(formData: FormData) {
  await guardAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("lecturers").insert({
    profile_id: formData.get("profile_id") as string,
    lecturer_number: formData.get("lecturer_number") as string,
    study_program_id: (formData.get("study_program_id") as string) || null,
    expertise: (formData.get("expertise") as string) || null,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/lecturers");
  return { success: true };
}

export async function createClass(formData: FormData) {
  await guardAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("classes").insert({
    course_id: formData.get("course_id") as string,
    lecturer_id: formData.get("lecturer_id") as string,
    academic_year_id: formData.get("academic_year_id") as string,
    semester_id: formData.get("semester_id") as string,
    class_name: formData.get("class_name") as string,
    capacity: Number(formData.get("capacity") || 40),
    status: "open",
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/classes");
  return { success: true };
}

export async function createClassSchedule(formData: FormData) {
  await guardAdmin();
  const supabase = await createClient();

  const classId = formData.get("class_id") as string;
  const roomId = formData.get("room_id") as string;
  const dayOfWeek = formData.get("day_of_week") as DayOfWeek;
  const startTime = formData.get("start_time") as string;
  const endTime = formData.get("end_time") as string;

  const { data: existing } = await supabase
    .from("class_schedules")
    .select("*")
    .eq("room_id", roomId)
    .eq("day_of_week", dayOfWeek);

  if (existing?.length) {
    for (const s of existing) {
      if (s.start_time < endTime && startTime < s.end_time) {
        return { error: "Bentrok jadwal ruangan" };
      }
    }
  }

  const { error } = await supabase.from("class_schedules").insert({
    class_id: classId,
    room_id: roomId,
    day_of_week: dayOfWeek,
    start_time: startTime,
    end_time: endTime,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/schedules");
  return { success: true };
}

export async function assignStudentAdvisor(formData: FormData) {
  await guardAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("student_advisors").insert({
    student_id: formData.get("student_id") as string,
    lecturer_id: formData.get("lecturer_id") as string,
    academic_year_id: formData.get("academic_year_id") as string,
  });
  if (error) return { error: error.message };
  return { success: true };
}
