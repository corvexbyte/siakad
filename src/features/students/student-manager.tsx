"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createStudent, updateStudent } from "@/server/actions/academic";
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
import { ACADEMIC_STATUS_LABELS } from "@/types/academic";
import type { AcademicStatus } from "@/types/academic";
import type { Profile, StudyProgram } from "@/types/database";

type StudentRow = {
  id: string;
  profile_id: string;
  student_number: string;
  study_program_id: string;
  entry_year: number;
  academic_status: AcademicStatus;
  current_semester: number;
  full_name: string;
  email: string;
  program_name: string;
};

const STATUS_OPTIONS = Object.entries(ACADEMIC_STATUS_LABELS) as Array<
  [AcademicStatus, string]
>;

export function StudentManager({
  students,
  programs,
  profiles,
}: {
  students: StudentRow[];
  programs: StudyProgram[];
  profiles: Profile[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<StudentRow | null>(null);
  const [programId, setProgramId] = useState("");
  const [profileId, setProfileId] = useState("");
  const [status, setStatus] = useState<AcademicStatus>("active");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startCreate() {
    setEditing(null);
    setProgramId("");
    setProfileId("");
    setStatus("active");
    setOpen(true);
    setError(null);
  }

  function startEdit(student: StudentRow) {
    setEditing(student);
    setProgramId(student.study_program_id);
    setProfileId(student.profile_id);
    setStatus(student.academic_status);
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
    fd.set("academic_status", status);
    if (!editing) fd.set("profile_id", profileId);
    const result = editing
      ? await updateStudent(editing.id, fd)
      : await createStudent(fd);
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
          <Plus className="h-4 w-4" /> Tambah Mahasiswa
        </Button>
      ) : (
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-base">
              {editing ? `Ubah Mahasiswa · ${editing.full_name}` : "Tambah Mahasiswa"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-3">
              {!editing && (
                <div className="space-y-1">
                  <Label>Pengguna</Label>
                  <Select value={profileId} onValueChange={setProfileId}>
                    <SelectTrigger><SelectValue placeholder="Pilih akun" /></SelectTrigger>
                    <SelectContent>
                      {profiles.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.full_name} ({p.email})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-1">
                <Label htmlFor="student_number">NIM</Label>
                <Input
                  id="student_number"
                  name="student_number"
                  required
                  defaultValue={editing?.student_number}
                />
              </div>
              <div className="space-y-1">
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
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="entry_year">Angkatan</Label>
                  <Input
                    id="entry_year"
                    name="entry_year"
                    type="number"
                    defaultValue={editing?.entry_year ?? 2024}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="current_semester">Semester Berjalan</Label>
                  <Input
                    id="current_semester"
                    name="current_semester"
                    type="number"
                    min={1}
                    defaultValue={editing?.current_semester ?? 1}
                  />
                </div>
              </div>
              {editing && (
                <div className="space-y-1">
                  <Label>Status Akademik</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as AcademicStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={loading || !programId || (!editing && !profileId)}
                >
                  {loading ? "Menyimpan..." : "Simpan"}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm}>Batal</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <DataTable<StudentRow>
        columns={[
          { key: "student_number", label: "NIM" },
          { key: "full_name", label: "Nama" },
          { key: "program_name", label: "Prodi" },
          { key: "entry_year", label: "Angkatan" },
          {
            key: "academic_status",
            label: "Status",
            render: (r) => (
              <Badge variant={r.academic_status === "active" ? "success" : "outline"}>
                {ACADEMIC_STATUS_LABELS[r.academic_status]}
              </Badge>
            ),
          },
          {
            key: "actions",
            label: "Aksi",
            render: (student) => (
              <Button variant="outline" size="sm" onClick={() => startEdit(student)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            ),
          },
        ]}
        data={students}
        emptyMessage="Belum ada mahasiswa."
      />
    </div>
  );
}
