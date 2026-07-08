"use client";

import { useState } from "react";
import { createClassSchedule } from "@/server/actions/academic";
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
import { Plus } from "lucide-react";
import { DAY_LABELS } from "@/types/academic";
import type { Room } from "@/types/database";

interface ClassOption {
  id: string;
  class_name: string;
  courses: { course_code: string } | null;
}

export function ScheduleForm({
  classes,
  rooms,
}: {
  classes: ClassOption[];
  rooms: Room[];
}) {
  const [open, setOpen] = useState(false);
  const [classId, setClassId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [day, setDay] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("class_id", classId);
    fd.set("room_id", roomId);
    fd.set("day_of_week", day);
    const result = await createClassSchedule(fd);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setLoading(false);
    setOpen(false);
    window.location.reload();
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Tambah Jadwal
      </Button>
    );
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader><CardTitle className="text-base">Tambah Jadwal</CardTitle></CardHeader>
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
            <Input id="start_time" name="start_time" type="time" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="end_time">Selesai</Label>
            <Input id="end_time" name="end_time" type="time" required />
          </div>
          {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={loading || !classId || !roomId || !day}>Simpan</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
