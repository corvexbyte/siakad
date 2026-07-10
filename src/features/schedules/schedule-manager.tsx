"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createClassSchedule,
  deleteClassSchedule,
  updateClassSchedule,
} from "@/server/actions/academic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/tables/data-table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DAY_LABELS } from "@/types/academic";
import type { DayOfWeek } from "@/types/academic";
import type { Room } from "@/types/database";

type ScheduleRow = {
  id: string;
  class_id: string;
  room_id: string;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  class_label: string;
  room_name: string;
  day_label: string;
  time_range: string;
};

interface ClassOption {
  id: string;
  class_name: string;
  courses: { course_code: string } | null;
}

export function ScheduleManager({
  schedules,
  classes,
  rooms,
}: {
  schedules: ScheduleRow[];
  classes: ClassOption[];
  rooms: Room[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ScheduleRow | null>(null);
  const [classId, setClassId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [day, setDay] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rowLoading, setRowLoading] = useState<string | null>(null);

  function startCreate() {
    setEditing(null);
    setClassId("");
    setRoomId("");
    setDay("");
    setOpen(true);
    setError(null);
  }

  function startEdit(schedule: ScheduleRow) {
    setEditing(schedule);
    setClassId(schedule.class_id);
    setRoomId(schedule.room_id);
    setDay(schedule.day_of_week);
    setOpen(true);
    setError(null);
  }

  function closeForm() {
    setOpen(false);
    setEditing(null);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("class_id", classId);
    fd.set("room_id", roomId);
    fd.set("day_of_week", day);
    const result = editing
      ? await updateClassSchedule(editing.id, fd)
      : await createClassSchedule(fd);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setLoading(false);
    closeForm();
    router.refresh();
  }

  async function handleDelete(schedule: ScheduleRow) {
    if (!window.confirm(`Hapus jadwal "${schedule.class_label}" (${schedule.day_label})?`)) return;
    setRowLoading(schedule.id);
    const result = await deleteClassSchedule(schedule.id);
    setRowLoading(null);
    if (result?.error) {
      window.alert(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {!open ? (
        <Button onClick={startCreate}>
          <Plus className="h-4 w-4" /> Tambah Jadwal
        </Button>
      ) : (
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-base">
              {editing ? `Ubah Jadwal · ${editing.class_label}` : "Tambah Jadwal"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <Label>Kelas</Label>
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger><SelectValue placeholder="Pilih kelas" /></SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.courses?.course_code} — {c.class_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Hari</Label>
                <Select value={day} onValueChange={setDay}>
                  <SelectTrigger><SelectValue placeholder="Pilih hari" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(DAY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Ruangan</Label>
                <Select value={roomId} onValueChange={setRoomId}>
                  <SelectTrigger><SelectValue placeholder="Pilih ruang" /></SelectTrigger>
                  <SelectContent>
                    {rooms.map((r) => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="start_time">Mulai</Label>
                <Input
                  id="start_time"
                  name="start_time"
                  type="time"
                  required
                  defaultValue={editing?.start_time}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="end_time">Selesai</Label>
                <Input
                  id="end_time"
                  name="end_time"
                  type="time"
                  required
                  defaultValue={editing?.end_time}
                />
              </div>
              {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" disabled={loading || !classId || !roomId || !day}>
                  {loading ? "Menyimpan..." : "Simpan"}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm}>Batal</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <DataTable<ScheduleRow>
        columns={[
          { key: "class_label", label: "Kelas" },
          { key: "day_label", label: "Hari" },
          { key: "time_range", label: "Waktu" },
          { key: "room_name", label: "Ruangan" },
          {
            key: "actions",
            label: "Aksi",
            render: (schedule) => (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => startEdit(schedule)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={rowLoading === schedule.id}
                  onClick={() => handleDelete(schedule)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            ),
          },
        ]}
        data={schedules}
        emptyMessage="Belum ada jadwal."
      />
    </div>
  );
}
