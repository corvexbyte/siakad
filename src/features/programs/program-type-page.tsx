import { PROGRAM_DOCUMENT_BUCKET } from "@/lib/program-documents";
import { createClient } from "@/lib/supabase/server";
import {
  getLecturerByProfile,
  getStudentByProfile,
  requireProfile,
} from "@/server/queries/auth";
import type { UserRole } from "@/constants/roles";
import type { AcademicProgramRubric, AcademicProgramType } from "@/types/database";
import { PROGRAM_TYPE_LABELS } from "@/types/programs";
import { ProgramAdminView } from "./program-admin-view";
import { ProgramLecturerView } from "./program-lecturer-view";
import { ProgramStudentView } from "./program-student-view";
import type {
  AcademicYear,
  AssignmentRow,
  Course,
  LecturerOption,
  PeriodRow,
  RegistrationRow,
  Semester,
  StudyProgram,
} from "./types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function signDocumentUrl(
  supabase: SupabaseServerClient,
  path: string | null,
) {
  if (!path || path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const { data } = await supabase.storage
    .from(PROGRAM_DOCUMENT_BUCKET)
    .createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}

async function signRegistrationDocuments(
  supabase: SupabaseServerClient,
  registrations: RegistrationRow[],
) {
  return Promise.all(
    registrations.map(async (registration) => ({
      ...registration,
      document_krs_url: await signDocumentUrl(
        supabase,
        registration.document_krs_url,
      ),
      document_transcript_url: await signDocumentUrl(
        supabase,
        registration.document_transcript_url,
      ),
      document_proposal_url: await signDocumentUrl(
        supabase,
        registration.document_proposal_url,
      ),
    })),
  );
}

async function signAssignmentRegistrations(
  supabase: SupabaseServerClient,
  assignments: Array<
    AssignmentRow & { academic_program_registrations: RegistrationRow }
  >,
) {
  return Promise.all(
    assignments.map(async (assignment) => {
      const [registration] = await signRegistrationDocuments(supabase, [
        assignment.academic_program_registrations,
      ]);
      return {
        ...assignment,
        academic_program_registrations: registration,
      };
    }),
  );
}

export default async function ProgramTypePage({
  programType,
}: {
  programType: AcademicProgramType;
}) {
  const typeLabel = PROGRAM_TYPE_LABELS[programType];
  const profile = await requireProfile();
  const role = profile.role as UserRole;
  const supabase = await createClient();

  const { data: periods } = await supabase
    .from("academic_program_periods")
    .select(
      "*, academic_years(year_label), semesters(name), study_programs(name), courses(course_code, course_name)",
    )
    .eq("program_type", programType)
    .order("registration_start", { ascending: false });

  const periodRows = (periods ?? []) as unknown as PeriodRow[];
  const periodIds = periodRows.map((period) => period.id);

  if (role === "mahasiswa") {
    const student = await getStudentByProfile(profile.id);
    const { data: registrations } =
      student && periodIds.length > 0
        ? await supabase
            .from("academic_program_registrations")
            .select(
              "*, academic_program_periods(*, academic_years(year_label), semesters(name), study_programs(name), courses(course_code, course_name)), academic_program_assignments(*, lecturers(id, lecturer_number, users(full_name))), academic_program_logbooks(*), academic_program_assessments(*)",
            )
            .eq("student_id", student.id)
            .in("period_id", periodIds)
            .order("submitted_at", { ascending: false })
        : { data: [] };

    const signedRegistrations = await signRegistrationDocuments(
      supabase,
      (registrations ?? []) as unknown as RegistrationRow[],
    );

    return (
      <ProgramStudentView
        typeLabel={typeLabel}
        periods={periodRows}
        registrations={signedRegistrations}
      />
    );
  }

  if (role === "dosen") {
    const lecturer = await getLecturerByProfile(profile.id);
    const { data: assignments } = lecturer
      ? await supabase
          .from("academic_program_assignments")
          .select(
            "*, academic_program_registrations(*, academic_program_periods(*, academic_years(year_label), semesters(name), study_programs(name), courses(course_code, course_name)), students(student_number, users(full_name), study_programs(name)), academic_program_logbooks(*), academic_program_assessments(*))",
          )
          .eq("lecturer_id", lecturer.id)
          .order("assigned_at", { ascending: false })
      : { data: [] };
    const { data: rubrics } =
      periodIds.length > 0
        ? await supabase
            .from("academic_program_rubrics")
            .select("*")
            .in("period_id", periodIds)
            .order("display_order")
        : { data: [] };

    const assignmentRows = (
      (assignments ?? []) as unknown as Array<
        AssignmentRow & { academic_program_registrations: RegistrationRow }
      >
    ).filter(
      (assignment) =>
        assignment.academic_program_registrations?.academic_program_periods
          ?.program_type === programType,
    );
    const signedAssignments = await signAssignmentRegistrations(
      supabase,
      assignmentRows,
    );

    return (
      <ProgramLecturerView
        typeLabel={typeLabel}
        assignments={signedAssignments}
        rubrics={(rubrics ?? []) as AcademicProgramRubric[]}
      />
    );
  }

  const [
    { data: registrations },
    { data: lecturers },
    { data: years },
    { data: semesters },
    { data: studyPrograms },
    { data: courses },
    { data: rubrics },
  ] = await Promise.all([
    periodIds.length > 0
      ? supabase
          .from("academic_program_registrations")
          .select(
            "*, academic_program_periods(*, academic_years(year_label), semesters(name), study_programs(name), courses(course_code, course_name)), students(student_number, users(full_name), study_programs(name)), academic_program_assignments(*, lecturers(id, lecturer_number, users(full_name), study_programs(name))), academic_program_logbooks(*), academic_program_assessments(*)",
          )
          .in("period_id", periodIds)
          .order("submitted_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    supabase
      .from("lecturers")
      .select("id, lecturer_number, users(full_name), study_programs(name)")
      .order("lecturer_number"),
    supabase
      .from("academic_years")
      .select("*")
      .order("year_label", { ascending: false }),
    supabase
      .from("semesters")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("study_programs").select("*").order("name"),
    supabase.from("courses").select("*").order("course_code"),
    periodIds.length > 0
      ? supabase
          .from("academic_program_rubrics")
          .select("*")
          .in("period_id", periodIds)
          .order("display_order")
      : Promise.resolve({ data: [] }),
  ]);

  const signedRegistrations = await signRegistrationDocuments(
    supabase,
    (registrations ?? []) as unknown as RegistrationRow[],
  );

  return (
    <ProgramAdminView
      typeLabel={typeLabel}
      programType={programType}
      periods={periodRows}
      registrations={signedRegistrations}
      lecturers={(lecturers ?? []) as unknown as LecturerOption[]}
      years={(years ?? []) as AcademicYear[]}
      semesters={(semesters ?? []) as Semester[]}
      studyPrograms={(studyPrograms ?? []) as StudyProgram[]}
      courses={(courses ?? []) as Course[]}
      rubrics={(rubrics ?? []) as AcademicProgramRubric[]}
    />
  );
}
