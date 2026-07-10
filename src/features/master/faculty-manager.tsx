"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFaculty, deleteFaculty, updateFaculty } from "@/server/actions/academic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/tables/data-table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Faculty } from "@/types/database";

export function FacultyManager({
  faculties,
  canDelete,
}: {
  faculties: Faculty[];
  canDelete: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Faculty | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rowLoading, setRowLoading] = useState<string | null>(null);

  function startEdit(faculty: Faculty) {
    setEditing(faculty);
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
    const result = editing
      ? await updateFaculty(editing.id, formData)
      : await createFaculty(formData);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    closeForm();
    router.refresh();
  }

  async function handleDelete(faculty: Faculty) {
    if (!window.confirm(`Hapus fakultas "${faculty.name}"?`)) return;
    setRowLoading(faculty.id);
    const result = await deleteFaculty(faculty.id);
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
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Tambah Fakultas
        </Button>
      ) : (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-base">
              {editing ? `Ubah Fakultas · ${editing.name}` : "Tambah Fakultas"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="code">Kode</Label>
                <Input
                  id="code"
                  name="code"
                  required
                  placeholder="FTI"
                  defaultValue={editing?.code}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="name">Nama</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Fakultas TI"
                  defaultValue={editing?.name}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
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

      <DataTable<Faculty>
        columns={[
          { key: "code", label: "Kode" },
          { key: "name", label: "Nama Fakultas" },
          {
            key: "actions",
            label: "Aksi",
            render: (faculty) => (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => startEdit(faculty)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                {canDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={rowLoading === faculty.id}
                    onClick={() => handleDelete(faculty)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                )}
              </div>
            ),
          },
        ]}
        data={faculties}
        emptyMessage="Belum ada fakultas."
      />
    </div>
  );
}
