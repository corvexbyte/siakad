"use client";

import {
  addKrsItem,
  removeKrsItem,
  submitKrs,
} from "@/server/actions/krs-grades";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusStepper } from "@/components/status-stepper";
import { KRS_STATUS_LABELS, DAY_LABELS } from "@/types/academic";
import type { KrsStatus, DayOfWeek } from "@/types/academic";
import type { CourseRegistration } from "@/types/database";
import { formatTime } from "@/lib/utils";
import { sumCredits } from "@/lib/validators/sks-limit";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
    id: string;
    class_name: string;
    courses: { course_code: string; course_name: string; credits: number } | null;
    class_schedules: Array<{
      day_of_week: DayOfWeek;
      start_time: string;
      end_time: string;
      rooms: { name: string } | null;
    }>;
  } | null;
}

interface AvailableClass {
  id: string;
  class_name: string;
  courses: { course_code: string; course_name: string; credits: number } | null;
  class_schedules: Array<{
    day_of_week: DayOfWeek;
    start_time: string;
    end_time: string;
    rooms: { name: string } | null;
  }>;
  lecturers: { users: { full_name: string } | null } | null;
}

export function KrsStudentView({
  registration,
  items,
  availableClasses,
}: {
  registration: CourseRegistration;
  items: KrsItem[];
  availableClasses: AvailableClass[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isDraft = registration.status === "draft";
  const selectedClassIds = new Set(items.map((i) => i.classes?.id));
  const totalSks = sumCredits(
    items.map((i) => i.classes?.courses?.credits ?? 0),
  );

  async function handleAdd(classId: string) {
    setLoading(classId);
    setError(null);
    const result = await addKrsItem(registration.id, classId);
    if (result?.error) {
      setError(result.error);
      setLoading(null);
      return;
    }
    router.refresh();
    setLoading(null);
  }

  async function handleRemove(itemId: string, label: string) {
    if (!window.confirm(`Hapus "${label}" dari KRS?`)) return;
    setLoading(itemId);
    setError(null);
    const result = await removeKrsItem(itemId);
    if (result?.error) {
      setError(result.error);
      setLoading(null);
      return;
    }
    router.refresh();
    setLoading(null);
  }

  async function handleSubmit() {
    if (!window.confirm("Ajukan KRS ini untuk divalidasi dosen wali?")) return;
    setLoading("submit");
    setError(null);
    const result = await submitKrs(registration.id);
    if (result?.error) {
      setError(result.error);
      setLoading(null);
      return;
    }
    router.refresh();
    setLoading(null);
  }

  return (
    <div className="space-y-6">
      <StatusStepper
        steps={KRS_STEPS}
        currentIndex={KRS_STEP_INDEX[registration.status as KrsStatus]}
        failed={registration.status === "rejected"}
        failedLabel="KRS ditolak"
      />

      <div className="flex items-center gap-3">
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
          {KRS_STATUS_LABELS[registration.status as KrsStatus]}
        </Badge>
        <span className="text-sm text-muted-foreground">
          Total SKS: {totalSks} / 24
        </span>
      </div>

      {registration.rejection_reason && (
        <p className="rounded-md bg-destructive/5 px-3 py-2 text-sm text-destructive">
          Alasan penolakan: {registration.rejection_reason}
        </p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mata Kuliah Dipilih</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">Belum ada mata kuliah dipilih</p>
          )}
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between rounded-md border p-3"
            >
              <div>
                <p className="font-medium">
                  {item.classes?.courses?.course_code} — {item.classes?.courses?.course_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {item.classes?.class_name} · {item.classes?.courses?.credits} SKS
                </p>
                {item.classes?.class_schedules?.map((s, i) => (
                  <p key={i} className="text-xs text-muted-foreground">
                    {DAY_LABELS[s.day_of_week]} {formatTime(s.start_time)}-{formatTime(s.end_time)} · {s.rooms?.name}
                  </p>
                ))}
              </div>
              {isDraft && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading === item.id}
                  onClick={() =>
                    handleRemove(
                      item.id,
                      `${item.classes?.courses?.course_code} — ${item.classes?.courses?.course_name}`,
                    )
                  }
                >
                  {loading === item.id ? "..." : "Hapus"}
                </Button>
              )}
            </div>
          ))}
          {isDraft && items.length > 0 && (
            <Button onClick={handleSubmit} disabled={loading === "submit"}>
              {loading === "submit" ? "Mengajukan..." : "Ajukan KRS"}
            </Button>
          )}
        </CardContent>
      </Card>

      {isDraft && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Kelas Tersedia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {availableClasses
              .filter((c) => !selectedClassIds.has(c.id))
              .map((cls) => (
                <div
                  key={cls.id}
                  className="flex items-start justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium">
                      {cls.courses?.course_code} — {cls.courses?.course_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {cls.class_name} · {cls.courses?.credits} SKS · {cls.lecturers?.users?.full_name}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    disabled={loading === cls.id}
                    onClick={() => handleAdd(cls.id)}
                  >
                    Pilih
                  </Button>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
