import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PROGRAM_DOCUMENT_BUCKET } from "@/lib/program-documents";
import { createClient } from "@/lib/supabase/server";
import {
  assignProgramLecturer,
  createProgramLogbook,
  createProgramPeriod,
  createProgramRubric,
  finalizeProgramGrade,
  reviewProgramLogbook,
  saveProgramAssessment,
  submitProgramRegistration,
  updateProgramRegistrationStatus,
} from "@/server/actions/programs";
import {
  getLecturerByProfile,
  getStudentByProfile,
  requireProfile,
} from "@/server/queries/auth";
import type { UserRole } from "@/constants/roles";
import type {
  AcademicProgramAssignment,
  AcademicProgramLogbook,
  AcademicProgramLogbookStatus,
  AcademicProgramPeriod,
  AcademicProgramRegistration,
  AcademicProgramRegistrationStatus,
  AcademicProgramRubric,
  AcademicProgramType,
  Database,
} from "@/types/database";
import {
  ASSIGNMENT_ROLE_LABELS,
  LOGBOOK_STATUS_LABELS,
  PROGRAM_STATUS_LABELS,
  PROGRAM_TYPE_LABELS,
} from "@/types/programs";

type FormAction = (formData: FormData) => Promise<void>;

const createProgramPeriodForm = createProgramPeriod as unknown as FormAction;
const createProgramRubricForm = createProgramRubric as unknown as FormAction;
const submitProgramRegistrationForm =
  submitProgramRegistration as unknown as FormAction;
const updateProgramRegistrationStatusForm =
  updateProgramRegistrationStatus as unknown as FormAction;
const assignProgramLecturerForm =
  assignProgramLecturer as unknown as FormAction;
const finalizeProgramGradeForm = finalizeProgramGrade as unknown as FormAction;
const createProgramLogbookForm = createProgramLogbook as unknown as FormAction;
const reviewProgramLogbookForm = reviewProgramLogbook as unknown as FormAction;
const saveProgramAssessmentForm =
  saveProgramAssessment as unknown as FormAction;

type AcademicYear = Database["public"]["Tables"]["academic_years"]["Row"];
type Semester = Database["public"]["Tables"]["semesters"]["Row"];
type StudyProgram = Database["public"]["Tables"]["study_programs"]["Row"];
type Course = Database["public"]["Tables"]["courses"]["Row"];
type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type PeriodRow = AcademicProgramPeriod & {
  academic_years: { year_label: string } | null;
  semesters: { name: string } | null;
  study_programs: { name: string } | null;
  courses: { course_code: string; course_name: string } | null;
};

type LecturerOption = {
  id: string;
  lecturer_number: string;
  profiles: { full_name: string } | null;
  study_programs?: { name: string } | null;
};

type AssignmentRow = AcademicProgramAssignment & {
  lecturers: LecturerOption | null;
};

type LogbookRow = AcademicProgramLogbook & {
  reviewed_by?: string | null;
};

type AssessmentRow = {
  id: string;
  registration_id: string;
  rubric_id: string;
  assessor_id: string;
  score: number;
  note: string | null;
};

type RegistrationRow = AcademicProgramRegistration & {
  academic_program_periods: PeriodRow | null;
  students: {
    student_number: string;
    profiles: { full_name: string } | null;
    study_programs: { name: string } | null;
  } | null;
  academic_program_assignments: AssignmentRow[];
  academic_program_logbooks: LogbookRow[];
  academic_program_assessments: AssessmentRow[];
};

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

export default async function ProgramsPage() {
  const profile = await requireProfile();
  const role = profile.role as UserRole;
  const supabase = await createClient();

  const { data: periods } = await supabase
    .from("academic_program_periods")
    .select(
      "*, academic_years(year_label), semesters(name), study_programs(name), courses(course_code, course_name)",
    )
    .order("registration_start", { ascending: false });

  const periodRows = (periods ?? []) as unknown as PeriodRow[];

  if (role === "mahasiswa") {
    const student = await getStudentByProfile(profile.id);
    const { data: registrations } = student
      ? await supabase
          .from("academic_program_registrations")
          .select(
            "*, academic_program_periods(*, academic_years(year_label), semesters(name), study_programs(name), courses(course_code, course_name)), academic_program_assignments(*, lecturers(id, lecturer_number, profiles(full_name))), academic_program_logbooks(*), academic_program_assessments(*)",
          )
          .eq("student_id", student.id)
          .order("submitted_at", { ascending: false })
      : { data: [] };

    const signedRegistrations = await signRegistrationDocuments(
      supabase,
      (registrations ?? []) as unknown as RegistrationRow[],
    );

    return (
      <StudentProgramsView
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
            "*, academic_program_registrations(*, academic_program_periods(*, academic_years(year_label), semesters(name), study_programs(name), courses(course_code, course_name)), students(student_number, profiles(full_name), study_programs(name)), academic_program_logbooks(*), academic_program_assessments(*))",
          )
          .eq("lecturer_id", lecturer.id)
          .order("assigned_at", { ascending: false })
      : { data: [] };
    const { data: rubrics } = await supabase
      .from("academic_program_rubrics")
      .select("*")
      .order("display_order");

    const assignmentRows = (assignments ?? []) as unknown as Array<
      AssignmentRow & { academic_program_registrations: RegistrationRow }
    >;
    const signedAssignments = await signAssignmentRegistrations(
      supabase,
      assignmentRows,
    );

    return (
      <LecturerProgramsView
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
    supabase
      .from("academic_program_registrations")
      .select(
        "*, academic_program_periods(*, academic_years(year_label), semesters(name), study_programs(name), courses(course_code, course_name)), students(student_number, profiles(full_name), study_programs(name)), academic_program_assignments(*, lecturers(id, lecturer_number, profiles(full_name), study_programs(name))), academic_program_logbooks(*), academic_program_assessments(*)",
      )
      .order("submitted_at", { ascending: false }),
    supabase
      .from("lecturers")
      .select("id, lecturer_number, profiles(full_name), study_programs(name)")
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
    supabase.from("academic_program_rubrics").select("*").order("display_order"),
  ]);

  const signedRegistrations = await signRegistrationDocuments(
    supabase,
    (registrations ?? []) as unknown as RegistrationRow[],
  );

  return (
    <AdminProgramsView
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

function AdminProgramsView({
  periods,
  registrations,
  lecturers,
  years,
  semesters,
  studyPrograms,
  courses,
  rubrics,
}: {
  periods: PeriodRow[];
  registrations: RegistrationRow[];
  lecturers: LecturerOption[];
  years: AcademicYear[];
  semesters: Semester[];
  studyPrograms: StudyProgram[];
  courses: Course[];
  rubrics: AcademicProgramRubric[];
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="KKN/TA/KP"
        description="Periode, pendaftaran, pembimbing, logbook, dan nilai akhir"
      />
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <PeriodForm
          years={years}
          semesters={semesters}
          studyPrograms={studyPrograms}
          courses={courses}
        />
        <RubricForm periods={periods} />
      </div>
      <PeriodList periods={periods} rubrics={rubrics} />
      <RegistrationAdminList
        registrations={registrations}
        lecturers={lecturers}
        rubrics={rubrics}
      />
    </div>
  );
}

function StudentProgramsView({
  periods,
  registrations,
}: {
  periods: PeriodRow[];
  registrations: RegistrationRow[];
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="KKN/TA/KP"
        description="Pendaftaran program, status berkas, logbook, dan nilai akhir"
      />
      <StudentRegistrationForm periods={periods.filter((p) => p.is_active)} />
      <StudentRegistrationList registrations={registrations} />
    </div>
  );
}

function LecturerProgramsView({
  assignments,
  rubrics,
}: {
  assignments: Array<
    AssignmentRow & { academic_program_registrations: RegistrationRow }
  >;
  rubrics: AcademicProgramRubric[];
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="KKN/TA/KP"
        description="Validasi logbook dan input nilai mahasiswa bimbingan atau pengujian"
      />
      {assignments.length === 0 && (
        <EmptyState text="Belum ada mahasiswa KKN/TA/KP yang ditugaskan." />
      )}
      {assignments.map((assignment) => {
        const registration = assignment.academic_program_registrations;
        const registrationRubrics = rubrics.filter(
          (rubric) =>
            rubric.period_id === registration.period_id &&
            rubric.assessor_role === assignment.assignment_role,
        );
        return (
          <Card key={assignment.id}>
            <CardHeader>
              <CardTitle className="text-base">
                {registration.students?.profiles?.full_name} ·{" "}
                {PROGRAM_TYPE_LABELS[
                  registration.academic_program_periods
                    ?.program_type as AcademicProgramType
                ]}{" "}
                <span className="font-normal text-muted-foreground">
                  ({ASSIGNMENT_ROLE_LABELS[assignment.assignment_role]})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <RegistrationSummary registration={registration} />
              <LogbookReviewList logbooks={registration.academic_program_logbooks} />
              <AssessmentForms
                registration={registration}
                rubrics={registrationRubrics}
                assessments={registration.academic_program_assessments}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function PeriodForm({
  years,
  semesters,
  studyPrograms,
  courses,
}: {
  years: AcademicYear[];
  semesters: Semester[];
  studyPrograms: StudyProgram[];
  courses: Course[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Periode Baru</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={createProgramPeriodForm} className="grid gap-3 sm:grid-cols-2">
          <Field label="Nama Periode" name="name" required className="sm:col-span-2" />
          <SelectField label="Jenis" name="program_type" required>
            <option value="kkn">KKN</option>
            <option value="ta">Tugas Akhir</option>
            <option value="kp">Kerja Praktek</option>
          </SelectField>
          <SelectField label="Tahun Akademik" name="academic_year_id" required>
            {years.map((year) => (
              <option key={year.id} value={year.id}>
                {year.year_label}
              </option>
            ))}
          </SelectField>
          <SelectField label="Semester" name="semester_id" required>
            {semesters.map((semester) => (
              <option key={semester.id} value={semester.id}>
                {semester.name}
              </option>
            ))}
          </SelectField>
          <SelectField label="Program Studi" name="study_program_id">
            <option value="">Semua prodi</option>
            {studyPrograms.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </SelectField>
          <SelectField label="Mata Kuliah Transkrip" name="transcript_course_id">
            <option value="">Belum ditautkan</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.course_code} · {course.course_name}
              </option>
            ))}
          </SelectField>
          <Field label="Buka Pendaftaran" name="registration_start" type="date" required />
          <Field label="Tutup Pendaftaran" name="registration_end" type="date" required />
          <Field label="Mulai Kegiatan" name="activity_start" type="date" />
          <Field label="Selesai Kegiatan" name="activity_end" type="date" />
          <Field label="Minimal SKS" name="min_credits" type="number" defaultValue="100" />
          <Field label="Minimal IPK" name="min_gpa" type="number" step="0.01" defaultValue="2.00" />
          <Field label="Kuota Pembimbing" name="supervisor_quota_default" type="number" defaultValue="8" />
          <SelectField label="Status Periode" name="is_active">
            <option value="on">Aktif</option>
            <option value="off">Nonaktif</option>
          </SelectField>
          <Button type="submit" className="sm:col-span-2">
            Simpan Periode
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function RubricForm({ periods }: { periods: PeriodRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Rubrik Penilaian</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={createProgramRubricForm} className="grid gap-3 sm:grid-cols-2">
          <SelectField label="Periode" name="period_id" required className="sm:col-span-2">
            {periods.map((period) => (
              <option key={period.id} value={period.id}>
                {PROGRAM_TYPE_LABELS[period.program_type]} · {period.name}
              </option>
            ))}
          </SelectField>
          <Field label="Komponen" name="component" required />
          <SelectField label="Penilai" name="assessor_role">
            <option value="supervisor">Pembimbing</option>
            <option value="examiner">Penguji</option>
          </SelectField>
          <Field label="Skor Maks" name="max_score" type="number" defaultValue="100" />
          <Field label="Bobot %" name="weight_percent" type="number" step="0.01" required />
          <Field label="Urutan" name="display_order" type="number" defaultValue="1" />
          <Button type="submit" className="sm:col-span-2">
            Simpan Rubrik
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PeriodList({
  periods,
  rubrics,
}: {
  periods: PeriodRow[];
  rubrics: AcademicProgramRubric[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Periode Aktif</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 lg:grid-cols-2">
        {periods.length === 0 && <EmptyState text="Belum ada periode." />}
        {periods.map((period) => {
          const periodRubrics = rubrics.filter(
            (rubric) => rubric.period_id === period.id,
          );
          return (
            <div key={period.id} className="rounded-md border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{PROGRAM_TYPE_LABELS[period.program_type]}</Badge>
                <Badge variant={period.is_active ? "success" : "secondary"}>
                  {period.is_active ? "Aktif" : "Nonaktif"}
                </Badge>
              </div>
              <p className="mt-2 font-medium">{period.name}</p>
              <p className="text-sm text-muted-foreground">
                {period.academic_years?.year_label} · {period.semesters?.name} ·{" "}
                {period.study_programs?.name ?? "Semua prodi"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Daftar {period.registration_start} s.d. {period.registration_end}
              </p>
              <p className="text-sm text-muted-foreground">
                Minimal {period.min_credits} SKS · IPK {period.min_gpa} · Kuota{" "}
                {period.supervisor_quota_default}
              </p>
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                {periodRubrics.map((rubric) => (
                  <p key={rubric.id}>
                    {rubric.display_order}. {rubric.component} ·{" "}
                    {ASSIGNMENT_ROLE_LABELS[rubric.assessor_role]} ·{" "}
                    {rubric.weight_percent}%
                  </p>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function RegistrationAdminList({
  registrations,
  lecturers,
  rubrics,
}: {
  registrations: RegistrationRow[];
  lecturers: LecturerOption[];
  rubrics: AcademicProgramRubric[];
}) {
  return (
    <div className="space-y-4">
      {registrations.length === 0 && <EmptyState text="Belum ada pendaftaran." />}
      {registrations.map((registration) => (
        <Card key={registration.id}>
          <CardHeader>
            <CardTitle className="text-base">
              {registration.students?.profiles?.full_name} ·{" "}
              {registration.proposal_title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RegistrationSummary registration={registration} />
            <div className="grid gap-3 lg:grid-cols-2">
              <StatusActionForms registration={registration} />
              <AssignLecturerForm registration={registration} lecturers={lecturers} />
            </div>
            <AssignmentList assignments={registration.academic_program_assignments} />
            <AssessmentStatus
              registration={registration}
              rubrics={rubrics.filter(
                (rubric) => rubric.period_id === registration.period_id,
              )}
            />
            <form action={finalizeProgramGradeForm}>
              <input type="hidden" name="registration_id" value={registration.id} />
              <Button type="submit" size="sm" variant="outline">
                Finalisasi Nilai
              </Button>
            </form>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StudentRegistrationForm({ periods }: { periods: PeriodRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ajukan Pendaftaran</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          action={submitProgramRegistrationForm}
          encType="multipart/form-data"
          className="grid gap-3 md:grid-cols-2"
        >
          <SelectField label="Periode" name="period_id" required className="md:col-span-2">
            {periods.map((period) => (
              <option key={period.id} value={period.id}>
                {PROGRAM_TYPE_LABELS[period.program_type]} · {period.name}
              </option>
            ))}
          </SelectField>
          <Field label="Judul Proposal" name="proposal_title" required className="md:col-span-2" />
          <TextAreaField label="Ringkasan Proposal" name="proposal_summary" className="md:col-span-2" />
          <FileField label="Unggah KRS" name="document_krs" required />
          <FileField label="Unggah Transkrip" name="document_transcript" required />
          <FileField
            label="Unggah Draft Proposal"
            name="document_proposal"
            required
            className="md:col-span-2"
          />
          <Button type="submit" className="md:col-span-2">
            Kirim Pendaftaran
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function StudentRegistrationList({
  registrations,
}: {
  registrations: RegistrationRow[];
}) {
  return (
    <div className="space-y-4">
      {registrations.length === 0 && <EmptyState text="Belum ada pendaftaran." />}
      {registrations.map((registration) => (
        <Card key={registration.id}>
          <CardHeader>
            <CardTitle className="text-base">
              {PROGRAM_TYPE_LABELS[
                registration.academic_program_periods
                  ?.program_type as AcademicProgramType
              ]}{" "}
              · {registration.proposal_title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RegistrationSummary registration={registration} />
            <AssignmentList assignments={registration.academic_program_assignments} />
            {["approved", "active"].includes(registration.status) && (
              <LogbookForm registration={registration} />
            )}
            <LogbookList logbooks={registration.academic_program_logbooks} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RegistrationSummary({
  registration,
}: {
  registration: RegistrationRow;
}) {
  return (
    <div className="space-y-2 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={statusVariant(registration.status)}>
          {PROGRAM_STATUS_LABELS[registration.status]}
        </Badge>
        <span className="text-muted-foreground">
          {registration.students?.student_number} ·{" "}
          {registration.students?.study_programs?.name}
        </span>
      </div>
      <p className="text-muted-foreground">
        {registration.academic_program_periods?.name} · SKS{" "}
        {registration.prerequisite_credits} · IPK {registration.prerequisite_gpa}
      </p>
      {registration.rejection_reason && (
        <p className="text-destructive">{registration.rejection_reason}</p>
      )}
      {registration.final_score != null && (
        <p className="font-medium">
          Nilai akhir {registration.final_score} ·{" "}
          {registration.final_letter_grade} · mutu {registration.grade_point}
        </p>
      )}
      <DocumentLinks registration={registration} />
    </div>
  );
}

function StatusActionForms({ registration }: { registration: RegistrationRow }) {
  return (
    <div className="rounded-md border p-3">
      <p className="mb-2 text-sm font-medium">Status</p>
      <div className="flex flex-wrap gap-2">
        <StatusButton registration={registration} status="approved" label="Setujui" />
        <StatusButton registration={registration} status="active" label="Aktifkan" />
        <StatusButton registration={registration} status="completed" label="Selesaikan" />
      </div>
      <form action={updateProgramRegistrationStatusForm} className="mt-3 flex gap-2">
        <input type="hidden" name="registration_id" value={registration.id} />
        <input type="hidden" name="status" value="rejected" />
        <Input
          name="rejection_reason"
          placeholder="Alasan penolakan"
          className="h-9"
        />
        <Button type="submit" size="sm" variant="destructive">
          Tolak
        </Button>
      </form>
    </div>
  );
}

function StatusButton({
  registration,
  status,
  label,
}: {
  registration: RegistrationRow;
  status: AcademicProgramRegistrationStatus;
  label: string;
}) {
  return (
    <form action={updateProgramRegistrationStatusForm}>
      <input type="hidden" name="registration_id" value={registration.id} />
      <input type="hidden" name="status" value={status} />
      <Button type="submit" size="sm" variant="outline">
        {label}
      </Button>
    </form>
  );
}

function AssignLecturerForm({
  registration,
  lecturers,
}: {
  registration: RegistrationRow;
  lecturers: LecturerOption[];
}) {
  return (
    <form action={assignProgramLecturerForm} className="rounded-md border p-3">
      <p className="mb-2 text-sm font-medium">Penugasan Dosen</p>
      <input type="hidden" name="registration_id" value={registration.id} />
      <div className="grid gap-2 sm:grid-cols-[1fr_140px_auto]">
        <select name="lecturer_id" className={selectClass()} required>
          {lecturers.map((lecturer) => (
            <option key={lecturer.id} value={lecturer.id}>
              {lecturer.profiles?.full_name} · {lecturer.lecturer_number}
            </option>
          ))}
        </select>
        <select name="assignment_role" className={selectClass()}>
          <option value="supervisor">Pembimbing</option>
          <option value="examiner">Penguji</option>
        </select>
        <Button type="submit" size="sm">
          Tugaskan
        </Button>
      </div>
    </form>
  );
}

function AssignmentList({ assignments }: { assignments: AssignmentRow[] }) {
  if (!assignments?.length) return <EmptyState text="Belum ada dosen ditugaskan." />;
  return (
    <div className="flex flex-wrap gap-2">
      {assignments.map((assignment) => (
        <Badge key={assignment.id} variant="secondary">
          {ASSIGNMENT_ROLE_LABELS[assignment.assignment_role]} ·{" "}
          {assignment.lecturers?.profiles?.full_name}
        </Badge>
      ))}
    </div>
  );
}

function LogbookForm({ registration }: { registration: RegistrationRow }) {
  return (
    <form action={createProgramLogbookForm} className="rounded-md border p-3">
      <p className="mb-3 text-sm font-medium">Tambah Logbook</p>
      <input type="hidden" name="registration_id" value={registration.id} />
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Tanggal" name="entry_date" type="date" required />
        <Field label="Minggu Ke" name="week_number" type="number" defaultValue="1" />
        <Field label="Aktivitas" name="activity" required className="md:col-span-2" />
        <TextAreaField label="Catatan Progress" name="progress_note" className="md:col-span-2" />
        <Field label="URL Lampiran" name="attachment_url" type="url" className="md:col-span-2" />
        <Button type="submit" className="md:col-span-2">
          Simpan Logbook
        </Button>
      </div>
    </form>
  );
}

function LogbookList({ logbooks }: { logbooks: LogbookRow[] }) {
  if (!logbooks?.length) return <EmptyState text="Belum ada logbook." />;
  return (
    <div className="space-y-2">
      {logbooks.map((logbook) => (
        <div key={logbook.id} className="rounded-md border p-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={logbookVariant(logbook.status)}>
              {LOGBOOK_STATUS_LABELS[logbook.status]}
            </Badge>
            <span className="font-medium">
              Minggu {logbook.week_number} · {logbook.entry_date}
            </span>
          </div>
          <p className="mt-2">{logbook.activity}</p>
          {logbook.progress_note && (
            <p className="text-muted-foreground">{logbook.progress_note}</p>
          )}
          {logbook.supervisor_note && (
            <p className="mt-1 text-muted-foreground">
              Catatan pembimbing: {logbook.supervisor_note}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function LogbookReviewList({ logbooks }: { logbooks: LogbookRow[] }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Logbook</p>
      <LogbookList logbooks={logbooks} />
      {logbooks?.map((logbook) => (
        <form
          key={`review-${logbook.id}`}
          action={reviewProgramLogbookForm}
          className="grid gap-2 rounded-md border p-3 sm:grid-cols-[160px_1fr_auto]"
        >
          <input type="hidden" name="logbook_id" value={logbook.id} />
          <select name="status" className={selectClass()}>
            <option value="accepted">Diterima</option>
            <option value="revision">Revisi</option>
            <option value="rejected">Ditolak</option>
          </select>
          <Input name="supervisor_note" placeholder="Catatan review" />
          <Button type="submit" size="sm">
            Review
          </Button>
        </form>
      ))}
    </div>
  );
}

function AssessmentForms({
  registration,
  rubrics,
  assessments,
}: {
  registration: RegistrationRow;
  rubrics: AcademicProgramRubric[];
  assessments: AssessmentRow[];
}) {
  if (!rubrics.length) return <EmptyState text="Rubrik penilaian belum tersedia." />;
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Penilaian</p>
      {rubrics.map((rubric) => {
        const existing = assessments.find(
          (assessment) => assessment.rubric_id === rubric.id,
        );
        return (
          <form
            key={rubric.id}
            action={saveProgramAssessmentForm}
            className="grid gap-2 rounded-md border p-3 sm:grid-cols-[1fr_120px_1fr_auto]"
          >
            <input type="hidden" name="registration_id" value={registration.id} />
            <input type="hidden" name="rubric_id" value={rubric.id} />
            <div className="text-sm">
              <p className="font-medium">{rubric.component}</p>
              <p className="text-muted-foreground">
                Bobot {rubric.weight_percent}% · Maks {rubric.max_score}
              </p>
            </div>
            <Input
              name="score"
              type="number"
              step="0.01"
              min={0}
              max={rubric.max_score}
              defaultValue={existing?.score ?? ""}
              required
            />
            <Input name="note" placeholder="Catatan" defaultValue={existing?.note ?? ""} />
            <Button type="submit" size="sm">
              Simpan
            </Button>
          </form>
        );
      })}
    </div>
  );
}

function AssessmentStatus({
  registration,
  rubrics,
}: {
  registration: RegistrationRow;
  rubrics: AcademicProgramRubric[];
}) {
  return (
    <div className="rounded-md border p-3 text-sm">
      <p className="font-medium">Status Penilaian</p>
      <div className="mt-2 grid gap-1">
        {rubrics.map((rubric) => {
          const filled = registration.academic_program_assessments.some(
            (assessment) => assessment.rubric_id === rubric.id,
          );
          return (
            <p key={rubric.id} className="text-muted-foreground">
              {rubric.component} · {ASSIGNMENT_ROLE_LABELS[rubric.assessor_role]} ·{" "}
              {filled ? "terisi" : "belum terisi"}
            </p>
          );
        })}
      </div>
    </div>
  );
}

function DocumentLinks({ registration }: { registration: RegistrationRow }) {
  const docs = [
    ["KRS", registration.document_krs_url],
    ["Transkrip", registration.document_transcript_url],
    ["Proposal", registration.document_proposal_url],
  ].filter(([, href]) => href);
  if (!docs.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {docs.map(([label, href]) => (
        <a
          key={label}
          href={href ?? "#"}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-primary hover:underline"
        >
          {label}
        </a>
      ))}
    </div>
  );
}

function Field({
  label,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
}) {
  return (
    <div className={`space-y-1 ${className ?? ""}`}>
      <Label htmlFor={props.name}>{label}</Label>
      <Input id={props.name} {...props} />
    </div>
  );
}

function FileField({
  label,
  name,
  className,
  required,
}: {
  label: string;
  name: string;
  className?: string;
  required?: boolean;
}) {
  return (
    <div className={`space-y-1 ${className ?? ""}`}>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        required={required}
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  children,
  className,
  required,
}: {
  label: string;
  name: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}) {
  return (
    <div className={`space-y-1 ${className ?? ""}`}>
      <Label htmlFor={name}>{label}</Label>
      <select id={name} name={name} className={selectClass()} required={required}>
        {children}
      </select>
    </div>
  );
}

function TextAreaField({
  label,
  name,
  className,
}: {
  label: string;
  name: string;
  className?: string;
}) {
  return (
    <div className={`space-y-1 ${className ?? ""}`}>
      <Label htmlFor={name}>{label}</Label>
      <textarea
        id={name}
        name={name}
        rows={3}
        className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
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

function selectClass() {
  return "h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
}

function statusVariant(status: AcademicProgramRegistrationStatus) {
  if (status === "completed" || status === "active" || status === "approved") {
    return "success";
  }
  if (status === "rejected") return "destructive";
  return "warning";
}

function logbookVariant(status: AcademicProgramLogbookStatus) {
  if (status === "accepted") return "success";
  if (status === "rejected") return "destructive";
  if (status === "revision") return "warning";
  return "secondary";
}
