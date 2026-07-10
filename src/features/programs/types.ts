import type {
  AcademicProgramAssignment,
  AcademicProgramLogbook,
  AcademicProgramPeriod,
  AcademicProgramRegistration,
  Database,
} from "@/types/database";

export type AcademicYear = Database["public"]["Tables"]["academic_years"]["Row"];
export type Semester = Database["public"]["Tables"]["semesters"]["Row"];
export type StudyProgram =
  Database["public"]["Tables"]["study_programs"]["Row"];
export type Course = Database["public"]["Tables"]["courses"]["Row"];

export type PeriodRow = AcademicProgramPeriod & {
  academic_years: { year_label: string } | null;
  semesters: { name: string } | null;
  study_programs: { name: string } | null;
  courses: { course_code: string; course_name: string } | null;
};

export type LecturerOption = {
  id: string;
  lecturer_number: string;
  users: { full_name: string } | null;
  study_programs?: { name: string } | null;
};

export type AssignmentRow = AcademicProgramAssignment & {
  lecturers: LecturerOption | null;
};

export type LogbookRow = AcademicProgramLogbook & {
  reviewed_by?: string | null;
};

export type AssessmentRow = {
  id: string;
  registration_id: string;
  rubric_id: string;
  assessor_id: string;
  score: number;
  note: string | null;
};

export type RegistrationRow = AcademicProgramRegistration & {
  academic_program_periods: PeriodRow | null;
  students: {
    student_number: string;
    users: { full_name: string } | null;
    study_programs: { name: string } | null;
  } | null;
  academic_program_assignments: AssignmentRow[];
  academic_program_logbooks: LogbookRow[];
  academic_program_assessments: AssessmentRow[];
};
