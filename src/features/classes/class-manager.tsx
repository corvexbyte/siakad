"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClass, updateClass } from "@/server/actions/academic";
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
import type { ClassStatus, Course, Database } from "@/types/database";

type AcademicYear = Database["public"]["Tables"]["academic_years"]["Row"];
type Semester = Database["public"]["Tables"]["semesters"]["Row"];
type ClassRow = Database["public"]["Tables"]["classes"]["Row"] & {
  course_label: string;
  lecturer_name: string;
  semester_name: string;
};

interface LecturerOption {
  id: string;
  users: { full_name: string } | null;
}

const STATUS_LABELS: Record<ClassStatus, string> = {
  open: "Dibuka",
  closed: "Ditutup",
  cancelled: "Dibatalkan",
};

export function ClassManager({
  classes,
  courses,
  lecturers,
  years,
  semesters,
}: {
  classes: ClassRow[];
  courses: Course[];
  lecturers: LecturerOption[];
  years: AcademicYear[];
  semesters: Semester[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClassRow | null>(null);
  const [courseId, setCourseId] = useState("");
  const [lecturerId, setLecturerId] = useState("");
  const [yearId, setYearId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [status, setStatus] = useState<ClassStatus>("open");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startCreate() {
    setEditing(null);
    setCourseId("");
    setLecturerId("");
    setYearId("");
    setSemesterId("");
    setStatus("open");
    setOpen(true);
    setError(null);
  }

  function startEdit(cls: ClassRow) {
    setEditing(cls);
    setLecturerId(cls.lecturer_id);
    setStatus(cls.status);
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
    let result;
    if (editing) {
      fd.set("lecturer_id", lecturerId);
      fd.set("status", status);
      result = await updateClass(editing.id, fd);
    } else {
      fd.set("course_id", courseId);
      fd.set("lecturer_id", lecturerId);
      fd.set("academic_year_id", yearId);
      fd.set("semester_id", semesterId);
      result = await createClass(fd);
    }
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
          <Plus className="h-4 w-4" /> Tambah Kelas
        </Button>
      ) : (
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-base">
              {editing ? `Ubah Kelas · ${editing.class_name}` : "Tambah Kelas"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
              {!editing && (
                <>
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="class_name">Nama Kelas</Label>
                    <Input id="class_name" name="class_name" placeholder="TI101-A" required />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label>Mata Kuliah</Label>
                    <Select value={courseId} onValueChange={setCourseId}>
                      <SelectTrigger><SelectValue placeholder="Pilih mata kuliah" /></SelectTrigger>
                      <SelectContent>
                        {courses.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.course_code} — {c.course_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Tahun Akademik</Label>
                    <Select value={yearId} onValueChange={setYearId}>
                      <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                      <SelectContent>
                        {years.map((y) => (
                          <SelectItem key={y.id} value={y.id}>{y.year_label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Semester</Label>
                    <Select value={semesterId} onValueChange={setSemesterId}>
                      <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                      <SelectContent>
                        {semesters.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <div className="space-y-1 sm:col-span-2">
                <Label>Dosen</Label>
                <Select value={lecturerId} onValueChange={setLecturerId}>
                  <SelectTrigger><SelectValue placeholder="Pilih dosen" /></SelectTrigger>
                  <SelectContent>
                    {lecturers.map((l) => (
                      <SelectItem key={l.id} value={l.id}>{l.users?.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="capacity">Kapasitas</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  defaultValue={editing?.capacity ?? 40}
                />
              </div>
              {editing && (
                <div className="space-y-1">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as ClassStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
              <div className="flex gap-2 sm:col-span-2">
                <Button
                  type="submit"
                  disabled={
                    loading ||
                    !lecturerId ||
                    (!editing && (!courseId || !yearId || !semesterId))
                  }
                >
                  {loading ? "Menyimpan..." : "Simpan"}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm}>Batal</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <DataTable<ClassRow>
        columns={[
          { key: "class_name", label: "Kelas" },
          { key: "course_label", label: "Mata Kuliah" },
          { key: "lecturer_name", label: "Dosen" },
          { key: "semester_name", label: "Semester" },
          { key: "capacity", label: "Kapasitas" },
          {
            key: "status",
            label: "Status",
            render: (r) => (
              <Badge variant={r.status === "open" ? "success" : "secondary"}>
                {STATUS_LABELS[r.status]}
              </Badge>
            ),
          },
          {
            key: "actions",
            label: "Aksi",
            render: (cls) => (
              <Button variant="outline" size="sm" onClick={() => startEdit(cls)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            ),
          },
        ]}
        data={classes}
        emptyMessage="Belum ada kelas."
      />
    </div>
  );
}
