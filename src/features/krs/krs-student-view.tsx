"use client";

import {
  addKrsItem,
  removeKrsItem,
  submitKrs,
} from "@/server/actions/krs-grades";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KRS_STATUS_LABELS, DAY_LABELS } from "@/types/academic";
import type { KrsStatus, DayOfWeek } from "@/types/academic";
import type { CourseRegistration } from "@/types/database";
import { formatTime } from "@/lib/utils";
import { sumCredits } from "@/lib/validators/sks-limit";
import { useState } from "react";

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
  lecturers: { profiles: { full_name: string } | null } | null;
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
    if (result?.error) setError(result.error);
    else window.location.reload();
    setLoading(null);
  }

  async function handleRemove(itemId: string) {
    setLoading(itemId);
    await removeKrsItem(itemId);
    window.location.reload();
  }

  async function handleSubmit() {
    setLoading("submit");
    await submitKrs(registration.id);
    window.location.reload();
  }

  return (
    <div className="space-y-6">
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
                  onClick={() => handleRemove(item.id)}
                >
                  Hapus
                </Button>
              )}
            </div>
          ))}
          {isDraft && items.length > 0 && (
            <Button onClick={handleSubmit} disabled={loading === "submit"}>
              Ajukan KRS
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
                      {cls.class_name} · {cls.courses?.credits} SKS · {cls.lecturers?.profiles?.full_name}
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
