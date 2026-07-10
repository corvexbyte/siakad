"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  assignProgramLecturer,
  createProgramPeriod,
  createProgramRubric,
  finalizeProgramGrade,
  updateProgramRegistrationStatus,
} from "@/server/actions/programs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/tables/data-table";
import { RegistrationStepper } from "./status-stepper";
import {
  DocumentLinks,
  EmptyState,
  Field,
  SelectField,
  selectClass,
  statusVariant,
} from "./shared";
import {
  ASSIGNMENT_ROLE_LABELS,
  PROGRAM_STATUS_LABELS,
} from "@/types/programs";
import type {
  AcademicProgramRegistrationStatus,
  AcademicProgramRubric,
  AcademicProgramType,
} from "@/types/database";
import type {
  AcademicYear,
  Course,
  LecturerOption,
  PeriodRow,
  RegistrationRow,
  Semester,
  StudyProgram,
} from "./types";

export function ProgramAdminView({
  typeLabel,
  programType,
  periods,
  registrations,
  lecturers,
  years,
  semesters,
  studyPrograms,
  courses,
  rubrics,
}: {
  typeLabel: string;
  programType: AcademicProgramType;
  periods: PeriodRow[];
  registrations: RegistrationRow[];
  lecturers: LecturerOption[];
  years: AcademicYear[];
  semesters: Semester[];
  studyPrograms: StudyProgram[];
  courses: Course[];
  rubrics: AcademicProgramRubric[];
}) {
  const pendingCount = registrations.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={typeLabel}
        description="Kelola periode, rubrik penilaian, dan pendaftaran mahasiswa"
      />

      <Tabs defaultValue="periode">
        <TabsList>
          <TabsTrigger value="periode">Periode &amp; Rubrik</TabsTrigger>
          <TabsTrigger value="pendaftaran">
            Pendaftaran Mahasiswa
            {pendingCount > 0 && (
              <Badge variant="warning" className="ml-2">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="periode" className="space-y-6 pt-4">
          <div className="grid gap-4 xl:grid-cols-2">
            <PeriodFormCard
              programType={programType}
              years={years}
              semesters={semesters}
              studyPrograms={studyPrograms}
              courses={courses}
            />
            <RubricFormCard periods={periods} />
          </div>
          <PeriodTable periods={periods} rubrics={rubrics} />
        </TabsContent>

        <TabsContent value="pendaftaran" className="space-y-4 pt-4">
          {registrations.length === 0 && (
            <EmptyState text="Belum ada pendaftaran masuk." />
          )}
          {registrations.map((registration) => (
            <RegistrationAdminCard
              key={registration.id}
              registration={registration}
              lecturers={lecturers}
              rubrics={rubrics.filter(
                (rubric) => rubric.period_id === registration.period_id,
              )}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PeriodFormCard({
  programType,
  years,
  semesters,
  studyPrograms,
  courses,
}: {
  programType: AcademicProgramType;
  years: AcademicYear[];
  semesters: Semester[];
  studyPrograms: StudyProgram[];
  courses: Course[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await createProgramPeriod(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.refresh();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Buka Periode Baru</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="program_type" value={programType} />
          <Field label="Nama Periode" name="name" required className="sm:col-span-2" />
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
          <SelectField label="Status Periode" name="is_active" defaultValue="on">
            <option value="on">Aktif</option>
            <option value="off">Nonaktif</option>
          </SelectField>
          {error && (
            <p className="text-sm text-destructive sm:col-span-2">{error}</p>
          )}
          <Button type="submit" disabled={loading} className="sm:col-span-2">
            {loading ? "Menyimpan..." : "Simpan Periode"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function RubricFormCard({ periods }: { periods: PeriodRow[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await createProgramRubric(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.refresh();
    }
  }

  if (periods.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rubrik Penilaian</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState text="Buka periode terlebih dahulu sebelum menambah rubrik." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Rubrik Penilaian</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
          <SelectField label="Periode" name="period_id" required className="sm:col-span-2">
            {periods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.name}
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
          {error && (
            <p className="text-sm text-destructive sm:col-span-2">{error}</p>
          )}
          <Button type="submit" disabled={loading} className="sm:col-span-2">
            {loading ? "Menyimpan..." : "Simpan Rubrik"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PeriodTable({
  periods,
  rubrics,
}: {
  periods: PeriodRow[];
  rubrics: AcademicProgramRubric[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Daftar Periode</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable<PeriodRow>
          emptyMessage="Belum ada periode dibuka."
          columns={[
            {
              key: "name",
              label: "Periode",
              render: (period) => (
                <div>
                  <p className="font-medium">{period.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {period.academic_years?.year_label} ·{" "}
                    {period.semesters?.name}
                  </p>
                </div>
              ),
            },
            {
              key: "study_programs",
              label: "Prodi",
              render: (period) => period.study_programs?.name ?? "Semua prodi",
            },
            {
              key: "jadwal",
              label: "Jadwal Pendaftaran",
              render: (period) => (
                <span className="text-xs">
                  {period.registration_start} s.d. {period.registration_end}
                </span>
              ),
            },
            {
              key: "syarat",
              label: "Syarat",
              render: (period) => (
                <span className="text-xs">
                  Min. {period.min_credits} SKS · IPK {period.min_gpa}
                </span>
              ),
            },
            {
              key: "kuota",
              label: "Kuota Pembimbing",
              render: (period) => period.supervisor_quota_default,
            },
            {
              key: "rubrik",
              label: "Rubrik",
              render: (period) => {
                const periodRubrics = rubrics.filter(
                  (rubric) => rubric.period_id === period.id,
                );
                const totalWeight = periodRubrics.reduce(
                  (sum, rubric) => sum + Number(rubric.weight_percent || 0),
                  0,
                );
                if (periodRubrics.length === 0) {
                  return (
                    <span className="text-xs text-muted-foreground">
                      Belum ada
                    </span>
                  );
                }
                return (
                  <div className="flex items-center gap-2">
                    <span className="text-xs">
                      {periodRubrics.length} komponen
                    </span>
                    <Badge
                      variant={totalWeight === 100 ? "success" : "warning"}
                      className="text-[10px]"
                    >
                      {totalWeight}%
                    </Badge>
                  </div>
                );
              },
            },
            {
              key: "status",
              label: "Status",
              render: (period) => (
                <Badge variant={period.is_active ? "success" : "secondary"}>
                  {period.is_active ? "Aktif" : "Nonaktif"}
                </Badge>
              ),
            },
          ]}
          data={periods}
        />
      </CardContent>
    </Card>
  );
}

function RegistrationAdminCard({
  registration,
  lecturers,
  rubrics,
}: {
  registration: RegistrationRow;
  lecturers: LecturerOption[];
  rubrics: AcademicProgramRubric[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  async function handleStatus(status: AcademicProgramRegistrationStatus) {
    setLoading(status);
    setError(null);
    const formData = new FormData();
    formData.set("registration_id", registration.id);
    formData.set("status", status);
    if (status === "rejected") formData.set("rejection_reason", rejectReason);
    const result = await updateProgramRegistrationStatus(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(null);
    } else {
      router.refresh();
    }
  }

  async function handleAssign(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading("assign");
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("registration_id", registration.id);
    const result = await assignProgramLecturer(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(null);
    } else {
      router.refresh();
    }
  }

  async function handleFinalize() {
    setLoading("finalize");
    setError(null);
    const formData = new FormData();
    formData.set("registration_id", registration.id);
    const result = await finalizeProgramGrade(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(null);
    } else {
      router.refresh();
    }
  }

  const assessedCount = rubrics.filter((rubric) =>
    registration.academic_program_assessments.some(
      (assessment) => assessment.rubric_id === rubric.id,
    ),
  ).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-base">
            {registration.students?.users?.full_name}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {registration.proposal_title}
          </p>
        </div>
        <Badge variant={statusVariant(registration.status)}>
          {PROGRAM_STATUS_LABELS[registration.status]}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-5">
        <RegistrationStepper status={registration.status} />

        <div className="grid gap-1 text-sm text-muted-foreground">
          <span>
            {registration.students?.student_number} ·{" "}
            {registration.students?.study_programs?.name}
          </span>
          <span>
            {registration.academic_program_periods?.name} · SKS{" "}
            {registration.prerequisite_credits} · IPK{" "}
            {registration.prerequisite_gpa}
          </span>
        </div>

        {registration.rejection_reason && (
          <p className="rounded-md bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {registration.rejection_reason}
          </p>
        )}
        {registration.final_score != null && (
          <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            Nilai akhir {registration.final_score} ·{" "}
            {registration.final_letter_grade} · mutu{" "}
            {registration.grade_point}
          </p>
        )}

        <DocumentLinks registration={registration} />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-lg border p-3">
            <p className="mb-2 text-sm font-medium">Status Pendaftaran</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={loading !== null}
                onClick={() => handleStatus("approved")}
              >
                {loading === "approved" ? "..." : "Setujui"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={loading !== null}
                onClick={() => handleStatus("active")}
              >
                {loading === "active" ? "..." : "Aktifkan"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={loading !== null}
                onClick={() => handleStatus("completed")}
              >
                {loading === "completed" ? "..." : "Selesaikan"}
              </Button>
            </div>
            <div className="mt-3 flex gap-2">
              <Input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Alasan penolakan"
                className="h-9"
              />
              <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={loading !== null}
                onClick={() => handleStatus("rejected")}
              >
                {loading === "rejected" ? "..." : "Tolak"}
              </Button>
            </div>
          </div>

          <div className="rounded-lg border p-3">
            <p className="mb-2 text-sm font-medium">Penugasan Dosen</p>
            <form onSubmit={handleAssign} className="grid gap-2 sm:grid-cols-[1fr_140px_auto]">
              <select name="lecturer_id" className={selectClass()} required>
                {lecturers.map((lecturer) => (
                  <option key={lecturer.id} value={lecturer.id}>
                    {lecturer.users?.full_name} · {lecturer.lecturer_number}
                  </option>
                ))}
              </select>
              <select name="assignment_role" className={selectClass()}>
                <option value="supervisor">Pembimbing</option>
                <option value="examiner">Penguji</option>
              </select>
              <Button type="submit" size="sm" disabled={loading !== null}>
                {loading === "assign" ? "..." : "Tugaskan"}
              </Button>
            </form>
            <div className="mt-3 flex flex-wrap gap-2">
              {registration.academic_program_assignments.length === 0 ? (
                <span className="text-xs text-muted-foreground">
                  Belum ada dosen ditugaskan.
                </span>
              ) : (
                registration.academic_program_assignments.map((assignment) => (
                  <Badge key={assignment.id} variant="secondary">
                    {ASSIGNMENT_ROLE_LABELS[assignment.assignment_role]} ·{" "}
                    {assignment.lecturers?.users?.full_name}
                  </Badge>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <p className="text-sm text-muted-foreground">
            Penilaian {assessedCount}/{rubrics.length || 0} komponen terisi
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={loading !== null || rubrics.length === 0}
            onClick={handleFinalize}
          >
            {loading === "finalize" ? "..." : "Finalisasi Nilai"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
