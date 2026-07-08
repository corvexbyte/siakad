import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getStudentByProfile, requireProfile } from "@/server/queries/auth";
import type { UserRole } from "@/constants/roles";
import type { AcademicProgramType } from "@/types/database";
import { PROGRAM_TYPE_LABELS } from "@/types/programs";

type GradeRow = {
  id: string;
  final_numeric_score: number | null;
  final_letter_grade: string | null;
  grade_point: number | null;
  classes: {
    class_name: string;
    courses: {
      course_code: string;
      course_name: string;
      credits: number;
    } | null;
    semesters: { name: string } | null;
    academic_years: { year_label: string } | null;
  } | null;
  students: {
    student_number: string;
    profiles: { full_name: string } | null;
  } | null;
};

type ProgramResultRow = {
  id: string;
  proposal_title: string;
  final_score: number | null;
  final_letter_grade: string | null;
  grade_point: number | null;
  academic_program_periods: {
    program_type: AcademicProgramType;
    name: string;
    courses: {
      course_code: string;
      course_name: string;
      credits: number;
    } | null;
    semesters: { name: string } | null;
    academic_years: { year_label: string } | null;
  } | null;
  students: {
    student_number: string;
    profiles: { full_name: string } | null;
  } | null;
};

export default async function KhsPage() {
  const profile = await requireProfile();
  const role = profile.role as UserRole;
  const supabase = await createClient();
  const student = role === "mahasiswa" ? await getStudentByProfile(profile.id) : null;

  let gradesQuery = supabase
    .from("grades")
    .select(
      "*, classes(class_name, courses(course_code, course_name, credits), semesters(name), academic_years(year_label)), students(student_number, profiles(full_name))",
    )
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  let programsQuery = supabase
    .from("academic_program_registrations")
    .select(
      "*, academic_program_periods(program_type, name, courses(course_code, course_name, credits), semesters(name), academic_years(year_label)), students(student_number, profiles(full_name))",
    )
    .eq("status", "completed")
    .order("finalized_at", { ascending: false });

  if (student) {
    gradesQuery = gradesQuery.eq("student_id", student.id);
    programsQuery = programsQuery.eq("student_id", student.id);
  }

  const [{ data: grades }, { data: programs }] = await Promise.all([
    gradesQuery,
    programsQuery,
  ]);

  const gradeRows = (grades ?? []) as unknown as GradeRow[];
  const programRows = (programs ?? []) as unknown as ProgramResultRow[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="KHS"
        description="Nilai kuliah dan hasil akhir KKN/TA/KP"
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mata Kuliah</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {gradeRows.length === 0 && <EmptyState text="Belum ada nilai kuliah dipublikasikan." />}
          {gradeRows.map((grade) => (
            <ResultRow
              key={grade.id}
              title={`${grade.classes?.courses?.course_code ?? "-"} · ${
                grade.classes?.courses?.course_name ?? "-"
              }`}
              subtitle={`${grade.students?.profiles?.full_name ?? ""} · ${
                grade.classes?.academic_years?.year_label ?? "-"
              } · ${grade.classes?.semesters?.name ?? "-"}`}
              credits={grade.classes?.courses?.credits}
              numeric={grade.final_numeric_score}
              letter={grade.final_letter_grade}
              point={grade.grade_point}
            />
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">KKN/TA/KP</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {programRows.length === 0 && <EmptyState text="Belum ada nilai akhir KKN/TA/KP." />}
          {programRows.map((program) => (
            <ResultRow
              key={program.id}
              title={`${PROGRAM_TYPE_LABELS[
                program.academic_program_periods?.program_type as AcademicProgramType
              ]} · ${program.proposal_title}`}
              subtitle={`${program.students?.profiles?.full_name ?? ""} · ${
                program.academic_program_periods?.academic_years?.year_label ??
                "-"
              } · ${program.academic_program_periods?.semesters?.name ?? "-"}`}
              credits={program.academic_program_periods?.courses?.credits}
              numeric={program.final_score}
              letter={program.final_letter_grade}
              point={program.grade_point}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ResultRow({
  title,
  subtitle,
  credits,
  numeric,
  letter,
  point,
}: {
  title: string;
  subtitle: string;
  credits?: number;
  numeric: number | null;
  letter: string | null;
  point: number | null;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">
          {subtitle}
          {credits ? ` · ${credits} SKS` : ""}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge>{letter ?? "-"}</Badge>
        <span className="text-sm text-muted-foreground">
          {numeric ?? "-"} · mutu {point ?? "-"}
        </span>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
      {text}
    </div>
  );
}
