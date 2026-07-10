"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveKrs, rejectKrs } from "@/server/actions/krs-grades";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusStepper } from "@/components/status-stepper";
import { Pagination } from "@/components/tables/pagination";
import { KRS_STATUS_LABELS } from "@/types/academic";
import type { KrsStatus } from "@/types/academic";

const PAGE_SIZE = 10;
const KRS_STEPS = ["Draft", "Diajukan", "Disetujui"];
const KRS_STEP_INDEX: Record<KrsStatus, number> = {
  draft: 0,
  submitted: 1,
  approved: 2,
  rejected: 1,
};

interface KrsItem {
  id: string;
  classes: {
    courses: { course_code: string; course_name: string; credits: number } | null;
  } | null;
}

interface RegistrationRow {
  id: string;
  status: KrsStatus;
  rejection_reason?: string | null;
  students: {
    student_number: string;
    users: { full_name: string } | null;
  } | null;
  semesters: { name: string } | null;
  course_registration_items?: KrsItem[];
}

export function KrsAdminView({
  registrations,
}: {
  registrations: RegistrationRow[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  async function handleApprove(registration: RegistrationRow) {
    const label = registration.students?.users?.full_name ?? "mahasiswa ini";
    if (!window.confirm(`Setujui KRS ${label}?`)) return;
    setLoading(registration.id);
    setError(null);
    const result = await approveKrs(registration.id);
    setLoading(null);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleReject(registration: RegistrationRow) {
    const reason = (reasons[registration.id] ?? "").trim();
    if (!reason) {
      setError("Alasan penolakan wajib diisi");
      return;
    }
    const label = registration.students?.users?.full_name ?? "mahasiswa ini";
    if (!window.confirm(`Tolak KRS ${label}?`)) return;
    setLoading(registration.id);
    setError(null);
    const result = await rejectKrs(registration.id, reason);
    setLoading(null);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  if (registrations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Belum ada KRS untuk divalidasi.
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(registrations.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRegistrations = registrations.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      {pageRegistrations.map((registration) => {
        const items = registration.course_registration_items ?? [];
        const totalSks = items.reduce(
          (sum, item) => sum + (item.classes?.courses?.credits ?? 0),
          0,
        );
        return (
          <Card key={registration.id}>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle className="text-base">
                {registration.students?.users?.full_name}{" "}
                <span className="font-normal text-muted-foreground">
                  ({registration.students?.student_number})
                </span>
              </CardTitle>
              <Badge
                variant={
                  registration.status === "approved"
                    ? "success"
                    : registration.status === "rejected"
                      ? "destructive"
                      : registration.status === "submitted"
                        ? "warning"
                        : "secondary"
                }
              >
                {KRS_STATUS_LABELS[registration.status]}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <StatusStepper
                steps={KRS_STEPS}
                currentIndex={KRS_STEP_INDEX[registration.status]}
                failed={registration.status === "rejected"}
                failedLabel="KRS ditolak"
              />
              <p className="text-sm text-muted-foreground">
                {registration.semesters?.name} · Total {totalSks} SKS
              </p>

              {registration.rejection_reason && (
                <p className="rounded-md bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  Alasan penolakan: {registration.rejection_reason}
                </p>
              )}

              <div className="space-y-1">
                {items.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Belum ada mata kuliah dipilih.
                  </p>
                )}
                {items.map((item) => (
                  <p key={item.id} className="text-sm">
                    {item.classes?.courses?.course_code} —{" "}
                    {item.classes?.courses?.course_name}{" "}
                    <span className="text-muted-foreground">
                      ({item.classes?.courses?.credits} SKS)
                    </span>
                  </p>
                ))}
              </div>

              {registration.status === "submitted" && (
                <div className="flex flex-wrap items-center gap-2 rounded-md border p-3">
                  <Button
                    size="sm"
                    disabled={loading === registration.id}
                    onClick={() => handleApprove(registration)}
                  >
                    {loading === registration.id ? "..." : "Setujui"}
                  </Button>
                  <Input
                    placeholder="Alasan penolakan"
                    className="h-9 max-w-xs"
                    value={reasons[registration.id] ?? ""}
                    onChange={(e) =>
                      setReasons((prev) => ({
                        ...prev,
                        [registration.id]: e.target.value,
                      }))
                    }
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={loading === registration.id}
                    onClick={() => handleReject(registration)}
                  >
                    {loading === registration.id ? "..." : "Tolak"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
      <Pagination
        page={currentPage}
        totalPages={totalPages}
        totalItems={registrations.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}
