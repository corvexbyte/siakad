"use client";

import { useState } from "react";
import { createCourse } from "@/server/actions/academic";
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
import type { StudyProgram } from "@/types/database";

export function CourseForm({ programs }: { programs: StudyProgram[] }) {
  const [open, setOpen] = useState(false);
  const [programId, setProgramId] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    fd.set("study_program_id", programId);
    await createCourse(fd);
    setLoading(false);
    setOpen(false);
    window.location.reload();
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Tambah Mata Kuliah
      </Button>
    );
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader><CardTitle className="text-base">Tambah Mata Kuliah</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="course_code">Kode</Label>
            <Input id="course_code" name="course_code" required />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="course_name">Nama</Label>
            <Input id="course_name" name="course_name" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="credits">SKS</Label>
            <Input id="credits" name="credits" type="number" min={1} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="semester_recommended">Semester</Label>
            <Input id="semester_recommended" name="semester_recommended" type="number" defaultValue={1} />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label>Program Studi</Label>
            <Select value={programId} onValueChange={setProgramId}>
              <SelectTrigger><SelectValue placeholder="Pilih prodi" /></SelectTrigger>
              <SelectContent>
                {programs.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={loading || !programId}>Simpan</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
