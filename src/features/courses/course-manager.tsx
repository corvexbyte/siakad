"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCourse, updateCourse } from "@/server/actions/academic";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil } from "lucide-react";
import type { Course, StudyProgram } from "@/types/database";

export function CourseManager({
  courses,
  programs,
}: {
  courses: Array<Course & { program_name: string }>;
  programs: StudyProgram[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [programId, setProgramId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startCreate() {
    setEditing(null);
    setProgramId("");
    setIsActive(true);
    setOpen(true);
    setError(null);
  }

  function startEdit(course: Course) {
    setEditing(course);
    setProgramId(course.study_program_id);
    setIsActive(course.is_active);
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
    fd.set("study_program_id", programId);
    if (isActive) fd.set("is_active", "on");
    const result = editing
      ? await updateCourse(editing.id, fd)
      : await createCourse(fd);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    closeForm();
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {!open ? (
        <Button onClick={startCreate}>
          <Plus className="h-4 w-4" /> Tambah Mata Kuliah
        </Button>
      ) : (
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-base">
              {editing ? `Ubah Mata Kuliah · ${editing.course_code}` : "Tambah Mata Kuliah"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="course_code">Kode</Label>
                <Input id="course_code" name="course_code" required defaultValue={editing?.course_code} />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="course_name">Nama</Label>
                <Input id="course_name" name="course_name" required defaultValue={editing?.course_name} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="credits">SKS</Label>
                <Input id="credits" name="credits" type="number" min={1} required defaultValue={editing?.credits} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="semester_recommended">Semester</Label>
                <Input
                  id="semester_recommended"
                  name="semester_recommended"
                  type="number"
                  defaultValue={editing?.semester_recommended ?? 1}
                />
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
              {editing && (
                <label className="flex items-center gap-2 text-sm sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  Mata kuliah aktif
                </label>
              )}
              {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" disabled={loading || !programId}>
                  {loading ? "Menyimpan..." : "Simpan"}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm}>Batal</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <DataTable<Course & { program_name: string }>
        columns={[
          { key: "course_code", label: "Kode" },
          { key: "course_name", label: "Nama" },
          { key: "program_name", label: "Prodi" },
          { key: "credits", label: "SKS" },
          {
            key: "is_active",
            label: "Status",
            render: (c) => (
              <Badge variant={c.is_active ? "success" : "secondary"}>
                {c.is_active ? "Aktif" : "Nonaktif"}
              </Badge>
            ),
          },
          {
            key: "actions",
            label: "Aksi",
            render: (course) => (
              <Button variant="outline" size="sm" onClick={() => startEdit(course)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            ),
          },
        ]}
        data={courses}
        emptyMessage="Belum ada mata kuliah."
      />
    </div>
  );
}
