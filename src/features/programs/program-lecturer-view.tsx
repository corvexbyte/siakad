"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  reviewProgramLogbook,
  saveProgramAssessment,
} from "@/server/actions/programs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/page-header";
import { RegistrationStepper } from "./status-stepper";
import { Pagination } from "@/components/tables/pagination";

const PAGE_SIZE = 10;
import {
  DocumentLinks,
  EmptyState,
  logbookVariant,
  selectClass,
  statusVariant,
} from "./shared";
import {
  ASSIGNMENT_ROLE_LABELS,
  LOGBOOK_STATUS_LABELS,
  PROGRAM_STATUS_LABELS,
} from "@/types/programs";
import type {
  AcademicProgramLogbookStatus,
  AcademicProgramRubric,
} from "@/types/database";
import type { AssignmentRow, LogbookRow, RegistrationRow } from "./types";

export function ProgramLecturerView({
  typeLabel,
  assignments,
  rubrics,
}: {
  typeLabel: string;
  assignments: Array<
    AssignmentRow & { academic_program_registrations: RegistrationRow }
  >;
  rubrics: AcademicProgramRubric[];
}) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(assignments.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageAssignments = assignments.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={typeLabel}
        description="Validasi logbook dan input nilai mahasiswa bimbingan atau pengujian"
      />
      {assignments.length === 0 && (
        <EmptyState text={`Belum ada mahasiswa ${typeLabel} yang ditugaskan ke Anda.`} />
      )}
      {pageAssignments.map((assignment) => {
        const registration = assignment.academic_program_registrations;
        const registrationRubrics = rubrics.filter(
          (rubric) =>
            rubric.period_id === registration.period_id &&
            rubric.assessor_role === assignment.assignment_role,
        );
        return (
          <Card key={assignment.id}>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle className="text-base">
                {registration.students?.users?.full_name}{" "}
                <span className="font-normal text-muted-foreground">
                  ({ASSIGNMENT_ROLE_LABELS[assignment.assignment_role]})
                </span>
              </CardTitle>
              <Badge variant={statusVariant(registration.status)}>
                {PROGRAM_STATUS_LABELS[registration.status]}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-5">
              <RegistrationStepper status={registration.status} />
              <p className="text-sm text-muted-foreground">
                {registration.students?.student_number} ·{" "}
                {registration.students?.study_programs?.name} ·{" "}
                {registration.proposal_title}
              </p>
              <DocumentLinks registration={registration} />

              <LogbookReviewList logbooks={registration.academic_program_logbooks} />

              <AssessmentForms
                registration={registration}
                rubrics={registrationRubrics}
              />
            </CardContent>
          </Card>
        );
      })}
      <Pagination
        page={currentPage}
        totalPages={totalPages}
        totalItems={assignments.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}

function LogbookReviewList({ logbooks }: { logbooks: LogbookRow[] }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Logbook</p>
      {!logbooks?.length && (
        <p className="text-sm text-muted-foreground">Belum ada logbook diisi.</p>
      )}
      {logbooks?.map((logbook) => (
        <LogbookReviewRow key={logbook.id} logbook={logbook} />
      ))}
    </div>
  );
}

function LogbookReviewRow({ logbook }: { logbook: LogbookRow }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<AcademicProgramLogbookStatus>("accepted");
  const [error, setError] = useState<string | null>(null);

  async function handleReview() {
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.set("logbook_id", logbook.id);
    formData.set("status", status);
    formData.set("supervisor_note", note);
    const result = await reviewProgramLogbook(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="rounded-md border p-3 text-sm">
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
      <div className="mt-3 grid gap-2 sm:grid-cols-[160px_1fr_auto]">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as AcademicProgramLogbookStatus)}
          className={selectClass()}
        >
          <option value="accepted">Diterima</option>
          <option value="revision">Revisi</option>
          <option value="rejected">Ditolak</option>
        </select>
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Catatan review"
        />
        <Button type="button" size="sm" disabled={loading} onClick={handleReview}>
          {loading ? "..." : "Review"}
        </Button>
      </div>
      {error && <p className="mt-2 text-destructive">{error}</p>}
    </div>
  );
}

function AssessmentForms({
  registration,
  rubrics,
}: {
  registration: RegistrationRow;
  rubrics: AcademicProgramRubric[];
}) {
  if (!rubrics.length) {
    return <EmptyState text="Rubrik penilaian untuk peran Anda belum tersedia." />;
  }
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Penilaian</p>
      {rubrics.map((rubric) => {
        const existing = registration.academic_program_assessments.find(
          (assessment) => assessment.rubric_id === rubric.id,
        );
        return (
          <AssessmentRow
            key={rubric.id}
            registrationId={registration.id}
            rubric={rubric}
            existingScore={existing?.score}
            existingNote={existing?.note}
          />
        );
      })}
    </div>
  );
}

function AssessmentRow({
  registrationId,
  rubric,
  existingScore,
  existingNote,
}: {
  registrationId: string;
  rubric: AcademicProgramRubric;
  existingScore?: number;
  existingNote?: string | null;
}) {
  const [score, setScore] = useState(existingScore?.toString() ?? "");
  const [note, setNote] = useState(existingNote ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setLoading(true);
    setError(null);
    setSaved(false);
    const formData = new FormData();
    formData.set("registration_id", registrationId);
    formData.set("rubric_id", rubric.id);
    formData.set("score", score);
    formData.set("note", note);
    const result = await saveProgramAssessment(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setSaved(true);
    }
    setLoading(false);
  }

  return (
    <div className="rounded-md border p-3">
      <div className="grid gap-2 sm:grid-cols-[1fr_120px_1fr_auto] sm:items-center">
        <div className="text-sm">
          <p className="font-medium">{rubric.component}</p>
          <p className="text-muted-foreground">
            Bobot {rubric.weight_percent}% · Maks {rubric.max_score}
          </p>
        </div>
        <Input
          type="number"
          step="0.01"
          min={0}
          max={rubric.max_score}
          value={score}
          onChange={(e) => {
            setScore(e.target.value);
            setSaved(false);
          }}
          required
        />
        <Input
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            setSaved(false);
          }}
          placeholder="Catatan"
        />
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" disabled={loading} onClick={handleSave}>
            {loading ? "..." : "Simpan"}
          </Button>
          {saved && (
            <span className="text-xs font-medium text-emerald-600">
              Tersimpan ✓
            </span>
          )}
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
