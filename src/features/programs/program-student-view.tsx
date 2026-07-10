"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createProgramLogbook,
  submitProgramRegistration,
} from "@/server/actions/programs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { RegistrationStepper } from "./status-stepper";
import {
  DocumentLinks,
  EmptyState,
  Field,
  FileField,
  SelectField,
  TextAreaField,
  logbookVariant,
  statusVariant,
} from "./shared";
import {
  ASSIGNMENT_ROLE_LABELS,
  LOGBOOK_STATUS_LABELS,
  PROGRAM_STATUS_LABELS,
} from "@/types/programs";
import type { AcademicProgramRegistrationStatus } from "@/types/database";
import type { PeriodRow, RegistrationRow } from "./types";

const NEXT_STEP_HINT: Record<AcademicProgramRegistrationStatus, string> = {
  pending: "Menunggu verifikasi berkas oleh admin akademik.",
  approved: "Berkas disetujui — menunggu penugasan dosen pembimbing.",
  active: "Program aktif. Isi logbook mingguan Anda secara berkala.",
  completed: "Program selesai. Nilai akhir sudah terbit.",
  rejected: "Perbaiki berkas sesuai catatan lalu ajukan kembali pada periode berikutnya.",
};

export function ProgramStudentView({
  typeLabel,
  periods,
  registrations,
}: {
  typeLabel: string;
  periods: PeriodRow[];
  registrations: RegistrationRow[];
}) {
  const openPeriods = periods.filter((period) => period.is_active);
  const registeredPeriodIds = new Set(
    registrations.map((registration) => registration.period_id),
  );
  const availablePeriods = openPeriods.filter(
    (period) => !registeredPeriodIds.has(period.id),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={typeLabel}
        description="Pendaftaran, status berkas, logbook, dan nilai akhir"
      />

      {availablePeriods.length > 0 && (
        <RegistrationFormCard periods={availablePeriods} />
      )}

      {registrations.length === 0 ? (
        <EmptyState
          text={
            availablePeriods.length > 0
              ? `Anda belum mendaftar ${typeLabel}. Lengkapi form di atas untuk memulai.`
              : `Belum ada periode ${typeLabel} yang dibuka saat ini.`
          }
        />
      ) : (
        <div className="space-y-4">
          {registrations.map((registration) => (
            <RegistrationCard key={registration.id} registration={registration} />
          ))}
        </div>
      )}
    </div>
  );
}

function RegistrationFormCard({ periods }: { periods: PeriodRow[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await submitProgramRegistration(formData);
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
        <CardTitle className="text-base">Ajukan Pendaftaran</CardTitle>
        <p className="text-sm text-muted-foreground">
          Siapkan KRS, transkrip, dan draft proposal sebelum mengisi form ini.
        </p>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="grid gap-3 md:grid-cols-2"
        >
          <SelectField label="Periode" name="period_id" required className="md:col-span-2">
            {periods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.name}
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
          {error && (
            <p className="text-sm text-destructive md:col-span-2">{error}</p>
          )}
          <Button type="submit" disabled={loading} className="md:col-span-2">
            {loading ? "Mengirim..." : "Kirim Pendaftaran"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function RegistrationCard({ registration }: { registration: RegistrationRow }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-base">{registration.proposal_title}</CardTitle>
        <Badge variant={statusVariant(registration.status)}>
          {PROGRAM_STATUS_LABELS[registration.status]}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-5">
        <RegistrationStepper status={registration.status} />
        <p className="text-sm text-muted-foreground">
          {NEXT_STEP_HINT[registration.status]}
        </p>

        <p className="text-sm text-muted-foreground">
          {registration.academic_program_periods?.name} · SKS{" "}
          {registration.prerequisite_credits} · IPK {registration.prerequisite_gpa}
        </p>

        {registration.rejection_reason && (
          <p className="rounded-md bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {registration.rejection_reason}
          </p>
        )}
        {registration.final_score != null && (
          <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            Nilai akhir {registration.final_score} ·{" "}
            {registration.final_letter_grade} · mutu {registration.grade_point}
          </p>
        )}

        <DocumentLinks registration={registration} />

        <div>
          <p className="mb-2 text-sm font-medium">Dosen Pembimbing/Penguji</p>
          {registration.academic_program_assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada dosen ditugaskan.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {registration.academic_program_assignments.map((assignment) => (
                <Badge key={assignment.id} variant="secondary">
                  {ASSIGNMENT_ROLE_LABELS[assignment.assignment_role]} ·{" "}
                  {assignment.lecturers?.users?.full_name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {["approved", "active"].includes(registration.status) && (
          <LogbookForm registration={registration} />
        )}

        <LogbookList logbooks={registration.academic_program_logbooks} />
      </CardContent>
    </Card>
  );
}

function LogbookForm({ registration }: { registration: RegistrationRow }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("registration_id", registration.id);
    const result = await createProgramLogbook(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.refresh();
    }
  }

  if (!open) {
    return (
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
        + Tambah Logbook
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border p-3">
      <p className="mb-3 text-sm font-medium">Tambah Logbook</p>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Tanggal" name="entry_date" type="date" required />
        <Field label="Minggu Ke" name="week_number" type="number" defaultValue="1" />
        <Field label="Aktivitas" name="activity" required className="md:col-span-2" />
        <TextAreaField label="Catatan Progress" name="progress_note" className="md:col-span-2" />
        <Field label="URL Lampiran" name="attachment_url" type="url" className="md:col-span-2" />
        {error && (
          <p className="text-sm text-destructive md:col-span-2">{error}</p>
        )}
        <div className="flex gap-2 md:col-span-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Logbook"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
        </div>
      </div>
    </form>
  );
}

function LogbookList({ logbooks }: { logbooks: RegistrationRow["academic_program_logbooks"] }) {
  if (!logbooks?.length) {
    return (
      <p className="text-sm text-muted-foreground">Belum ada logbook diisi.</p>
    );
  }
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Riwayat Logbook</p>
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
