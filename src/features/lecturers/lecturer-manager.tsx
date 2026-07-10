"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createLecturer,
  deleteLecturer,
  updateLecturer,
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
import type { Profile, StudyProgram } from "@/types/database";

type LecturerRow = {
  id: string;
  profile_id: string;
  lecturer_number: string;
  study_program_id: string | null;
  expertise: string | null;
  full_name: string;
  program_name: string;
};

export function LecturerManager({
  lecturers,
  programs,
  profiles,
  canDelete,
}: {
  lecturers: LecturerRow[];
  programs: StudyProgram[];
  profiles: Profile[];
  canDelete: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LecturerRow | null>(null);
  const [programId, setProgramId] = useState("");
  const [profileId, setProfileId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rowLoading, setRowLoading] = useState<string | null>(null);

  function startCreate() {
    setEditing(null);
    setProgramId("");
    setProfileId("");
    setOpen(true);
    setError(null);
  }

  function startEdit(lecturer: LecturerRow) {
    setEditing(lecturer);
    setProgramId(lecturer.study_program_id ?? "");
    setProfileId(lecturer.profile_id);
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
    if (!editing) fd.set("profile_id", profileId);
    const result = editing
      ? await updateLecturer(editing.id, fd)
      : await createLecturer(fd);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    closeForm();
    router.refresh();
  }

  async function handleDelete(lecturer: LecturerRow) {
    if (!window.confirm(`Hapus dosen "${lecturer.full_name}"?`)) return;
    setRowLoading(lecturer.id);
    const result = await deleteLecturer(lecturer.id);
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
          <Plus className="h-4 w-4" /> Tambah Dosen
        </Button>
      ) : (
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-base">
              {editing ? `Ubah Dosen · ${editing.full_name}` : "Tambah Dosen"}
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
                        <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-1">
                <Label htmlFor="lecturer_number">NIDN</Label>
                <Input
                  id="lecturer_number"
                  name="lecturer_number"
                  required
                  defaultValue={editing?.lecturer_number}
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
              <div className="space-y-1">
                <Label htmlFor="expertise">Keahlian</Label>
                <Input id="expertise" name="expertise" defaultValue={editing?.expertise ?? ""} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading || (!editing && !profileId)}>
                  {loading ? "Menyimpan..." : "Simpan"}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm}>Batal</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <DataTable<LecturerRow>
        columns={[
          { key: "lecturer_number", label: "NIDN" },
          { key: "full_name", label: "Nama" },
          { key: "program_name", label: "Prodi" },
          { key: "expertise", label: "Keahlian" },
          {
            key: "actions",
            label: "Aksi",
            render: (lecturer) => (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => startEdit(lecturer)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                {canDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={rowLoading === lecturer.id}
                    onClick={() => handleDelete(lecturer)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                )}
              </div>
            ),
          },
        ]}
        data={lecturers}
        emptyMessage="Belum ada dosen."
      />
    </div>
  );
}
