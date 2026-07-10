"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createStudyProgram,
  deleteStudyProgram,
  updateStudyProgram,
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
import type { Faculty, StudyProgram } from "@/types/database";

type ProgramRow = StudyProgram & { faculty_name: string };

export function StudyProgramManager({
  programs,
  faculties,
}: {
  programs: ProgramRow[];
  faculties: Faculty[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProgramRow | null>(null);
  const [facultyId, setFacultyId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rowLoading, setRowLoading] = useState<string | null>(null);

  function startCreate() {
    setEditing(null);
    setFacultyId("");
    setOpen(true);
    setError(null);
  }

  function startEdit(program: ProgramRow) {
    setEditing(program);
    setFacultyId(program.faculty_id);
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
    const formData = new FormData(e.currentTarget);
    formData.set("faculty_id", facultyId);
    const result = editing
      ? await updateStudyProgram(editing.id, formData)
      : await createStudyProgram(formData);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    closeForm();
    router.refresh();
  }

  async function handleDelete(program: ProgramRow) {
    if (!window.confirm(`Hapus program studi "${program.name}"?`)) return;
    setRowLoading(program.id);
    const result = await deleteStudyProgram(program.id);
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
          <Plus className="h-4 w-4" />
          Tambah Prodi
        </Button>
      ) : (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-base">
              {editing ? `Ubah Prodi · ${editing.name}` : "Tambah Program Studi"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label>Fakultas</Label>
                <Select value={facultyId} onValueChange={setFacultyId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih fakultas" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="code">Kode</Label>
                <Input id="code" name="code" required defaultValue={editing?.code} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="name">Nama</Label>
                <Input id="name" name="name" required defaultValue={editing?.name} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="degree_level">Jenjang</Label>
                <Input
                  id="degree_level"
                  name="degree_level"
                  defaultValue={editing?.degree_level ?? "S1"}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading || !facultyId}>
                  {loading ? "Menyimpan..." : "Simpan"}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm}>
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <DataTable<ProgramRow>
        columns={[
          { key: "code", label: "Kode" },
          { key: "name", label: "Nama Prodi" },
          { key: "faculty_name", label: "Fakultas" },
          { key: "degree_level", label: "Jenjang" },
          {
            key: "actions",
            label: "Aksi",
            render: (program) => (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => startEdit(program)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={rowLoading === program.id}
                  onClick={() => handleDelete(program)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            ),
          },
        ]}
        data={programs}
        emptyMessage="Belum ada program studi."
      />
    </div>
  );
}
