"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  getLecturerByProfile,
  getProfile,
  getStudentByProfile,
  logActivity,
  requireRole,
} from "@/server/queries/auth";
import { numericToLetterGrade } from "@/lib/academic/grade-converter";
import {
  PROGRAM_DOCUMENT_BUCKET,
  sanitizeProgramDocumentName,
} from "@/lib/program-documents";
import type {
  AcademicProgramAssignmentRole,
  AcademicProgramLogbookStatus,
  AcademicProgramRegistrationStatus,
  AcademicProgramType,
} from "@/types/database";

const PROGRAMS_PATH = "/dashboard/programs";
type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function requireProgramManager() {
  return requireRole(["super_admin", "admin_akademik", "kaprodi"]);
}

function optionalString(value: FormDataEntryValue | null) {
  const text = value?.toString().trim();
  return text ? text : null;
}

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return typeof File !== "undefined" && value instanceof File && value.size > 0;
}

async function uploadProgramDocument(
  supabase: SupabaseServerClient,
  profileId: string,
  periodId: string,
  kind: string,
  value: FormDataEntryValue | null,
) {
  if (!isUploadedFile(value)) return { path: null, error: null };

  const safeName = sanitizeProgramDocumentName(value.name);
  const path = `${profileId}/${periodId}/${kind}-${crypto.randomUUID()}-${safeName}`;
  const { data, error } = await supabase.storage
    .from(PROGRAM_DOCUMENT_BUCKET)
    .upload(path, value, {
      contentType: value.type || undefined,
      upsert: false,
    });

  return {
    path: data?.path ?? null,
    error: error?.message ?? null,
  };
}

async function calculateStudentPrerequisites(studentId: string) {
  const supabase = await createClient();
  const { data: grades } = await supabase
    .from("grades")
    .select("grade_point, classes(courses(credits))")
    .eq("student_id", studentId)
    .eq("is_published", true);

  const completed = grades ?? [];
  const totalCredits = completed.reduce(
    (sum, grade) => sum + (grade.classes?.courses?.credits ?? 0),
    0,
  );
  const weightedPoints = completed.reduce((sum, grade) => {
    const credits = grade.classes?.courses?.credits ?? 0;
    return sum + (grade.grade_point ?? 0) * credits;
  }, 0);
  const gpa = totalCredits > 0 ? weightedPoints / totalCredits : 0;

  return {
    credits: totalCredits,
    gpa: Math.round(gpa * 100) / 100,
  };
}

async function getRegistrationWithPeriod(registrationId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("academic_program_registrations")
    .select("*, academic_program_periods(*)")
    .eq("id", registrationId)
    .single();

  return data;
}

export async function createProgramPeriod(formData: FormData) {
  await requireProgramManager();
  const supabase = await createClient();
  const { error } = await supabase.from("academic_program_periods").insert({
    program_type: formData.get("program_type") as AcademicProgramType,
    academic_year_id: formData.get("academic_year_id") as string,
    semester_id: formData.get("semester_id") as string,
    study_program_id: optionalString(formData.get("study_program_id")),
    transcript_course_id: optionalString(formData.get("transcript_course_id")),
    name: formData.get("name") as string,
    registration_start: formData.get("registration_start") as string,
    registration_end: formData.get("registration_end") as string,
    activity_start: optionalString(formData.get("activity_start")),
    activity_end: optionalString(formData.get("activity_end")),
    min_credits: Number(formData.get("min_credits") || 0),
    min_gpa: Number(formData.get("min_gpa") || 0),
    supervisor_quota_default: Number(
      formData.get("supervisor_quota_default") || 8,
    ),
    is_active: formData.get("is_active") !== "off",
  });

  if (error) return { error: error.message };
  await logActivity("create_academic_program_period");
  revalidatePath(PROGRAMS_PATH);
  return { success: true };
}

export async function submitProgramRegistration(formData: FormData) {
  await requireRole(["mahasiswa"]);
  const profile = await getProfile();
  const student = profile ? await getStudentByProfile(profile.id) : null;
  if (!profile || !student) return { error: "Data mahasiswa tidak ditemukan" };

  const supabase = await createClient();
  const periodId = formData.get("period_id") as string;
  const { data: period } = await supabase
    .from("academic_program_periods")
    .select("*")
    .eq("id", periodId)
    .single();

  if (!period?.is_active) return { error: "Periode tidak aktif" };

  const today = new Date().toISOString().slice(0, 10);
  if (today < period.registration_start || today > period.registration_end) {
    return { error: "Periode pendaftaran belum dibuka atau sudah ditutup" };
  }

  if (
    period.study_program_id &&
    period.study_program_id !== student.study_program_id
  ) {
    return { error: "Periode tidak tersedia untuk program studi Anda" };
  }

  const prerequisites = await calculateStudentPrerequisites(student.id);
  const passed =
    prerequisites.credits >= period.min_credits &&
    prerequisites.gpa >= period.min_gpa;

  const rejectionReason = passed
    ? null
    : `Prasyarat belum terpenuhi: ${prerequisites.credits}/${period.min_credits} SKS, IPK ${prerequisites.gpa}/${period.min_gpa}`;

  const [krsDocument, transcriptDocument, proposalDocument] = await Promise.all([
    uploadProgramDocument(
      supabase,
      profile.id,
      period.id,
      "krs",
      formData.get("document_krs"),
    ),
    uploadProgramDocument(
      supabase,
      profile.id,
      period.id,
      "transcript",
      formData.get("document_transcript"),
    ),
    uploadProgramDocument(
      supabase,
      profile.id,
      period.id,
      "proposal",
      formData.get("document_proposal"),
    ),
  ]);

  const documentError =
    krsDocument.error || transcriptDocument.error || proposalDocument.error;
  if (documentError) return { error: documentError };

  if (!krsDocument.path || !transcriptDocument.path || !proposalDocument.path) {
    return { error: "Dokumen KRS, transkrip, dan proposal wajib diunggah" };
  }

  const { error } = await supabase
    .from("academic_program_registrations")
    .upsert(
      {
        period_id: period.id,
        student_id: student.id,
        proposal_title: formData.get("proposal_title") as string,
        proposal_summary: optionalString(formData.get("proposal_summary")),
        document_krs_url: krsDocument.path,
        document_transcript_url: transcriptDocument.path,
        document_proposal_url: proposalDocument.path,
        status: passed ? "pending" : "rejected",
        prerequisite_credits: prerequisites.credits,
        prerequisite_gpa: prerequisites.gpa,
        prerequisite_passed: passed,
        rejection_reason: rejectionReason,
        submitted_at: new Date().toISOString(),
      },
      { onConflict: "period_id,student_id" },
    );

  if (error) return { error: error.message };
  await logActivity("submit_academic_program_registration");
  revalidatePath(PROGRAMS_PATH);
  return { success: true };
}

export async function updateProgramRegistrationStatus(formData: FormData) {
  await requireProgramManager();
  const profile = await getProfile();
  const supabase = await createClient();
  const registrationId = formData.get("registration_id") as string;
  const status = formData.get("status") as AcademicProgramRegistrationStatus;
  const reason = optionalString(formData.get("rejection_reason"));

  const payload: {
    status: AcademicProgramRegistrationStatus;
    rejection_reason: string | null;
    approved_by?: string | null;
    approved_at?: string | null;
  } = {
    status,
    rejection_reason: status === "rejected" ? reason : null,
  };

  if (status === "approved" || status === "active") {
    payload.approved_by = profile?.id ?? null;
    payload.approved_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("academic_program_registrations")
    .update(payload)
    .eq("id", registrationId);

  if (error) return { error: error.message };
  await logActivity("update_academic_program_registration_status");
  revalidatePath(PROGRAMS_PATH);
  return { success: true };
}

export async function assignProgramLecturer(formData: FormData) {
  await requireProgramManager();
  const profile = await getProfile();
  const supabase = await createClient();
  const registrationId = formData.get("registration_id") as string;
  const lecturerId = formData.get("lecturer_id") as string;
  const assignmentRole = formData.get(
    "assignment_role",
  ) as AcademicProgramAssignmentRole;

  const registration = await getRegistrationWithPeriod(registrationId);
  if (!registration?.academic_program_periods) {
    return { error: "Pendaftaran tidak ditemukan" };
  }

  if (assignmentRole === "supervisor") {
    const { count } = await supabase
      .from("academic_program_assignments")
      .select("academic_program_registrations!inner(period_id)", {
        count: "exact",
        head: true,
      })
      .eq("lecturer_id", lecturerId)
      .eq("assignment_role", "supervisor")
      .eq(
        "academic_program_registrations.period_id",
        registration.academic_program_periods.id,
      );

    if (
      count != null &&
      count >= registration.academic_program_periods.supervisor_quota_default
    ) {
      return { error: "Kuota pembimbing dosen sudah penuh" };
    }
  }

  const { error } = await supabase.from("academic_program_assignments").upsert(
    {
      registration_id: registrationId,
      lecturer_id: lecturerId,
      assignment_role: assignmentRole,
      assigned_by: profile?.id ?? null,
    },
    { onConflict: "registration_id,lecturer_id,assignment_role" },
  );

  if (error) return { error: error.message };
  await logActivity("assign_academic_program_lecturer");
  revalidatePath(PROGRAMS_PATH);
  return { success: true };
}

export async function createProgramLogbook(formData: FormData) {
  await requireRole(["mahasiswa"]);
  const profile = await getProfile();
  const student = profile ? await getStudentByProfile(profile.id) : null;
  if (!student) return { error: "Data mahasiswa tidak ditemukan" };

  const registrationId = formData.get("registration_id") as string;
  const registration = await getRegistrationWithPeriod(registrationId);
  if (!registration || registration.student_id !== student.id) {
    return { error: "Pendaftaran tidak valid" };
  }

  if (!["active", "approved"].includes(registration.status)) {
    return { error: "Logbook hanya dapat diisi untuk pendaftaran aktif" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("academic_program_logbooks").insert({
    registration_id: registrationId,
    student_id: student.id,
    entry_date: formData.get("entry_date") as string,
    week_number: Number(formData.get("week_number") || 1),
    activity: formData.get("activity") as string,
    progress_note: optionalString(formData.get("progress_note")),
    attachment_url: optionalString(formData.get("attachment_url")),
  });

  if (error) return { error: error.message };
  await logActivity("create_academic_program_logbook");
  revalidatePath(PROGRAMS_PATH);
  return { success: true };
}

export async function reviewProgramLogbook(formData: FormData) {
  await requireRole(["super_admin", "admin_akademik", "kaprodi", "dosen"]);
  const profile = await getProfile();
  const lecturer = profile ? await getLecturerByProfile(profile.id) : null;
  const status = formData.get("status") as AcademicProgramLogbookStatus;
  const supabase = await createClient();

  const { error } = await supabase
    .from("academic_program_logbooks")
    .update({
      status,
      supervisor_note: optionalString(formData.get("supervisor_note")),
      reviewed_by: lecturer?.id ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", formData.get("logbook_id") as string);

  if (error) return { error: error.message };
  await logActivity("review_academic_program_logbook");
  revalidatePath(PROGRAMS_PATH);
  return { success: true };
}

export async function createProgramRubric(formData: FormData) {
  await requireProgramManager();
  const supabase = await createClient();
  const { error } = await supabase.from("academic_program_rubrics").insert({
    period_id: formData.get("period_id") as string,
    component: formData.get("component") as string,
    assessor_role: formData.get(
      "assessor_role",
    ) as AcademicProgramAssignmentRole,
    max_score: Number(formData.get("max_score") || 100),
    weight_percent: Number(formData.get("weight_percent") || 0),
    display_order: Number(formData.get("display_order") || 1),
  });

  if (error) return { error: error.message };
  await logActivity("create_academic_program_rubric");
  revalidatePath(PROGRAMS_PATH);
  return { success: true };
}

export async function saveProgramAssessment(formData: FormData) {
  await requireRole(["super_admin", "admin_akademik", "kaprodi", "dosen"]);
  const profile = await getProfile();
  const lecturer = profile ? await getLecturerByProfile(profile.id) : null;
  const supabase = await createClient();
  const registrationId = formData.get("registration_id") as string;
  const rubricId = formData.get("rubric_id") as string;
  const score = Number(formData.get("score") || 0);

  if (!lecturer) return { error: "Data dosen tidak ditemukan" };

  const { data: rubric } = await supabase
    .from("academic_program_rubrics")
    .select("assessor_role, max_score")
    .eq("id", rubricId)
    .single();

  const { data: assignment } = await supabase
    .from("academic_program_assignments")
    .select("id")
    .eq("registration_id", registrationId)
    .eq("lecturer_id", lecturer.id)
    .eq("assignment_role", rubric?.assessor_role ?? "supervisor")
    .maybeSingle();

  const profileRole = profile?.role;
  if (!assignment && !["super_admin", "admin_akademik", "kaprodi"].includes(profileRole ?? "")) {
    return { error: "Anda bukan penilai yang ditugaskan" };
  }

  if (rubric && score > Number(rubric.max_score)) {
    return { error: "Skor melebihi nilai maksimum rubrik" };
  }

  const { error } = await supabase.from("academic_program_assessments").upsert(
    {
      registration_id: registrationId,
      rubric_id: rubricId,
      assessor_id: lecturer.id,
      score,
      note: optionalString(formData.get("note")),
    },
    { onConflict: "registration_id,rubric_id,assessor_id" },
  );

  if (error) return { error: error.message };
  await logActivity("save_academic_program_assessment");
  revalidatePath(PROGRAMS_PATH);
  return { success: true };
}

export async function finalizeProgramGrade(formData: FormData) {
  await requireProgramManager();
  const profile = await getProfile();
  const supabase = await createClient();
  const registrationId = formData.get("registration_id") as string;
  const registration = await getRegistrationWithPeriod(registrationId);
  if (!registration?.academic_program_periods) {
    return { error: "Pendaftaran tidak ditemukan" };
  }

  const { data: rubrics } = await supabase
    .from("academic_program_rubrics")
    .select("*")
    .eq("period_id", registration.academic_program_periods.id);
  const { data: assessments } = await supabase
    .from("academic_program_assessments")
    .select("*")
    .eq("registration_id", registrationId);

  if (!rubrics?.length) return { error: "Rubrik belum tersedia" };

  const score = rubrics.reduce((total, rubric) => {
    const rubricScores =
      assessments
        ?.filter((assessment) => assessment.rubric_id === rubric.id)
        .map((assessment) => Number(assessment.score)) ?? [];
    if (!rubricScores.length) return total;
    const average =
      rubricScores.reduce((sum, current) => sum + current, 0) /
      rubricScores.length;
    return (
      total +
      (average / Number(rubric.max_score || 100)) *
        Number(rubric.weight_percent || 0)
    );
  }, 0);

  const finalScore = Math.round(score * 100) / 100;
  const converted = numericToLetterGrade(finalScore);
  const { error } = await supabase
    .from("academic_program_registrations")
    .update({
      status: "completed",
      final_score: finalScore,
      final_letter_grade: converted.letter,
      grade_point: converted.point,
      finalized_by: profile?.id ?? null,
      finalized_at: new Date().toISOString(),
    })
    .eq("id", registrationId);

  if (error) return { error: error.message };
  await logActivity("finalize_academic_program_grade");
  revalidatePath(PROGRAMS_PATH);
  revalidatePath("/dashboard/khs");
  return { success: true };
}
