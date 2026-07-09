import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getStudentByProfile, requireProfile } from "@/server/queries/auth";
import type { UserRole } from "@/constants/roles";

type GradeRow = {
  id: string;
  final_numeric_score: number | null;
  final_letter_grade: string | null;
  grade_point: number | null;
  is_published: boolean;
  classes: {
    class_name: string;
    courses: {
      course_code: string;
      course_name: string;
      credits: number;
    } | null;
    semesters: { name: string; semester_number: number } | null;
    academic_years: { year_label: string } | null;
  } | null;
  students: {
    student_number: string;
    users: { full_name: string } | null;
    study_programs: { name: string } | null;
  } | null;
};

function gradeToLetter(score: number): string {
  if (score >= 85) return "A";
  if (score >= 75) return "B+";
  if (score >= 70) return "B";
  if (score >= 65) return "C+";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "E";
}

function gradeToPoint(letter: string): number {
  const map: Record<string, number> = {
    A: 4.0,
    "B+": 3.5,
    B: 3.0,
    "C+": 2.5,
    C: 2.0,
    D: 1.0,
    E: 0.0,
  };
  return map[letter] ?? 0;
}

export default async function TranscriptPage() {
  const profile = await requireProfile();
  const role = profile.role as UserRole;
  const supabase = await createClient();
  const student =
    role === "mahasiswa" ? await getStudentByProfile(profile.id) : null;

  let gradesQuery = supabase
    .from("grades")
    .select(
      "*, classes(class_name, courses(course_code, course_name, credits), semesters(name, semester_number), academic_years(year_label)), students(student_number, users(full_name), study_programs(name))",
    )
    .eq("is_published", true)
    .order("created_at", { ascending: true });

  if (student) {
    gradesQuery = gradesQuery.eq("student_id", student.id);
  }

  const { data: grades } = await gradesQuery;
  const gradeRows = (grades ?? []) as unknown as GradeRow[];

  // Group by semester
  type SemesterGroup = {
    semesterName: string;
    yearLabel: string;
    semesterNumber: number;
    rows: GradeRow[];
  };

  const semesterMap = new Map<string, SemesterGroup>();
  for (const g of gradeRows) {
    const key = `${g.classes?.academic_years?.year_label ?? "—"} · ${g.classes?.semesters?.name ?? "—"}`;
    if (!semesterMap.has(key)) {
      semesterMap.set(key, {
        semesterName: g.classes?.semesters?.name ?? "—",
        yearLabel: g.classes?.academic_years?.year_label ?? "—",
        semesterNumber: g.classes?.semesters?.semester_number ?? 99,
        rows: [],
      });
    }
    semesterMap.get(key)!.rows.push(g);
  }

  const semesterGroups = Array.from(semesterMap.values()).sort(
    (a, b) => a.semesterNumber - b.semesterNumber,
  );

  // Calculate IPK: sum(grade_point * credits) / sum(credits) — best grade per course
  const bestPerCourse = new Map<
    string,
    { credits: number; gradePoint: number }
  >();
  for (const g of gradeRows) {
    const code = g.classes?.courses?.course_code ?? g.id;
    const credits = g.classes?.courses?.credits ?? 0;
    const letter =
      g.final_letter_grade ?? gradeToLetter(g.final_numeric_score ?? 0);
    const gp = g.grade_point ?? gradeToPoint(letter);
    const prev = bestPerCourse.get(code);
    if (!prev || gp > prev.gradePoint) {
      bestPerCourse.set(code, { credits, gradePoint: gp });
    }
  }

  const totalCredits = Array.from(bestPerCourse.values()).reduce(
    (acc, v) => acc + v.credits,
    0,
  );
  const totalWeighted = Array.from(bestPerCourse.values()).reduce(
    (acc, v) => acc + v.credits * v.gradePoint,
    0,
  );
  const ipk =
    totalCredits > 0
      ? (totalWeighted / totalCredits).toFixed(2)
      : "0.00";

  const studentName =
    gradeRows[0]?.students?.users?.full_name ??
    profile.full_name ??
    "—";
  const studentNumber =
    gradeRows[0]?.students?.student_number ?? student?.student_number ?? "—";
  const studyProgramName =
    gradeRows[0]?.students?.study_programs?.name ??
    student?.study_programs?.name ??
    "—";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transkrip Akademik"
        description="Riwayat seluruh mata kuliah yang telah ditempuh"
      />

      {/* Summary card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ringkasan</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-xs text-muted-foreground">Nama</dt>
              <dd className="font-medium">{studentName}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">NIM</dt>
              <dd className="font-medium">{studentNumber}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Program Studi</dt>
              <dd className="font-medium">{studyProgramName}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">
                Total SKS Lulus
              </dt>
              <dd className="font-medium">{totalCredits} SKS</dd>
            </div>
          </dl>
          <div className="mt-4 rounded-md bg-primary/5 px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Indeks Prestasi Kumulatif (IPK)
            </p>
            <p className="text-3xl font-bold text-primary">{ipk}</p>
          </div>
        </CardContent>
      </Card>

      {/* Per-semester breakdown */}
      {semesterGroups.length === 0 && (
        <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          Belum ada nilai yang dipublikasikan.
        </div>
      )}

      {semesterGroups.map((group) => {
        const semSKS = group.rows.reduce(
          (acc, g) => acc + (g.classes?.courses?.credits ?? 0),
          0,
        );
        const semWeighted = group.rows.reduce((acc, g) => {
          const credits = g.classes?.courses?.credits ?? 0;
          const letter =
            g.final_letter_grade ??
            gradeToLetter(g.final_numeric_score ?? 0);
          const gp = g.grade_point ?? gradeToPoint(letter);
          return acc + credits * gp;
        }, 0);
        const ips =
          semSKS > 0 ? (semWeighted / semSKS).toFixed(2) : "0.00";

        return (
          <Card key={group.semesterName + group.yearLabel}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold">
                {group.yearLabel} — {group.semesterName}
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                IPS {ips} · {semSKS} SKS
              </span>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-100">
                      <th className="pb-2 pr-3 pt-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Kode</th>
                      <th className="pb-2 pr-3 pt-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Mata Kuliah</th>
                      <th className="pb-2 pr-3 pt-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">SKS</th>
                      <th className="pb-2 pr-3 pt-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">Nilai</th>
                      <th className="pb-2 pr-3 pt-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">Huruf</th>
                      <th className="pb-2 pt-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">Mutu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {group.rows.map((g) => {
                      const letter =
                        g.final_letter_grade ??
                        gradeToLetter(g.final_numeric_score ?? 0);
                      const gp = (
                        g.grade_point ?? gradeToPoint(letter)
                      ).toFixed(1);
                      return (
                        <tr key={g.id} className="hover:bg-accent/30">
                          <td className="py-2 pr-3 font-mono text-xs text-slate-500">
                            {g.classes?.courses?.course_code ?? "—"}
                          </td>
                          <td className="py-2 pr-3">
                            {g.classes?.courses?.course_name ?? "—"}
                          </td>
                          <td className="py-2 pr-3 text-center">
                            {g.classes?.courses?.credits ?? "—"}
                          </td>
                          <td className="py-2 pr-3 text-center">
                            {g.final_numeric_score ?? "—"}
                          </td>
                          <td className="py-2 pr-3 text-center">
                            <Badge variant="outline">{letter}</Badge>
                          </td>
                          <td className="py-2 text-center">{gp}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
