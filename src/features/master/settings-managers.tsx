"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createAcademicYear,
  createRoom,
  createSemester,
  deleteRoom,
  updateAcademicYear,
  updateRoom,
  updateSemester,
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
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Database } from "@/types/database";

type AcademicYear = Database["public"]["Tables"]["academic_years"]["Row"];
type Semester = Database["public"]["Tables"]["semesters"]["Row"];
type Room = Database["public"]["Tables"]["rooms"]["Row"];
type SemesterRow = Semester & { year_label: string };

export function AcademicYearManager({ years }: { years: AcademicYear[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AcademicYear | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startCreate() {
    setEditing(null);
    setIsActive(false);
    setOpen(true);
    setError(null);
  }

  function startEdit(year: AcademicYear) {
    setEditing(year);
    setIsActive(year.is_active);
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
    if (isActive) fd.set("is_active", "on");
    const result = editing
      ? await updateAcademicYear(editing.id, fd)
      : await createAcademicYear(fd);
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
          <Plus className="h-4 w-4" /> Tambah Tahun Akademik
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editing ? `Ubah Tahun · ${editing.year_label}` : "Tambah Tahun Akademik"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <Label htmlFor="year_label">Label</Label>
                <Input
                  id="year_label"
                  name="year_label"
                  placeholder="2025/2026"
                  required
                  defaultValue={editing?.year_label}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                Aktif
              </label>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
              <Button type="button" variant="outline" onClick={closeForm}>Batal</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <DataTable<AcademicYear>
        columns={[
          { key: "year_label", label: "Tahun" },
          {
            key: "is_active",
            label: "Status",
            render: (r) => (
              <Badge variant={r.is_active ? "success" : "secondary"}>
                {r.is_active ? "Aktif" : "Nonaktif"}
              </Badge>
            ),
          },
          {
            key: "actions",
            label: "Aksi",
            render: (year) => (
              <Button variant="outline" size="sm" onClick={() => startEdit(year)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            ),
          },
        ]}
        data={years}
        emptyMessage="Belum ada tahun akademik."
      />
    </div>
  );
}

export function SemesterManager({
  semesters,
  years,
}: {
  semesters: SemesterRow[];
  years: AcademicYear[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SemesterRow | null>(null);
  const [yearId, setYearId] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startCreate() {
    setEditing(null);
    setYearId("");
    setIsActive(false);
    setOpen(true);
    setError(null);
  }

  function startEdit(semester: SemesterRow) {
    setEditing(semester);
    setYearId(semester.academic_year_id);
    setIsActive(semester.is_active);
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
    fd.set("academic_year_id", yearId);
    if (isActive) fd.set("is_active", "on");
    const result = editing
      ? await updateSemester(editing.id, fd)
      : await createSemester(fd);
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
          <Plus className="h-4 w-4" /> Tambah Semester
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editing ? `Ubah Semester · ${editing.name}` : "Tambah Semester"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <Label>Tahun Akademik</Label>
                <Select value={yearId} onValueChange={setYearId}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Pilih" /></SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y.id} value={y.id}>{y.year_label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="name">Nama</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ganjil 2025/2026"
                  required
                  defaultValue={editing?.name}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="semester_number">No.</Label>
                <Input
                  id="semester_number"
                  name="semester_number"
                  type="number"
                  min={1}
                  max={3}
                  defaultValue={editing?.semester_number ?? 1}
                  required
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                Aktif
              </label>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={loading || !yearId}>
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
              <Button type="button" variant="outline" onClick={closeForm}>Batal</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <DataTable<SemesterRow>
        columns={[
          { key: "name", label: "Semester" },
          { key: "year_label", label: "Tahun Akademik" },
          { key: "semester_number", label: "No." },
          {
            key: "is_active",
            label: "Status",
            render: (r) => (
              <Badge variant={r.is_active ? "success" : "secondary"}>
                {r.is_active ? "Aktif" : "Nonaktif"}
              </Badge>
            ),
          },
          {
            key: "actions",
            label: "Aksi",
            render: (semester) => (
              <Button variant="outline" size="sm" onClick={() => startEdit(semester)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            ),
          },
        ]}
        data={semesters}
        emptyMessage="Belum ada semester."
      />
    </div>
  );
}

export function RoomManager({ rooms }: { rooms: Room[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rowLoading, setRowLoading] = useState<string | null>(null);

  function startCreate() {
    setEditing(null);
    setOpen(true);
    setError(null);
  }

  function startEdit(room: Room) {
    setEditing(room);
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
    const result = editing ? await updateRoom(editing.id, fd) : await createRoom(fd);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    closeForm();
    router.refresh();
  }

  async function handleDelete(room: Room) {
    if (!window.confirm(`Hapus ruangan "${room.name}"?`)) return;
    setRowLoading(room.id);
    const result = await deleteRoom(room.id);
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
          <Plus className="h-4 w-4" /> Tambah Ruangan
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editing ? `Ubah Ruangan · ${editing.name}` : "Tambah Ruangan"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <Label htmlFor="code">Kode</Label>
                <Input id="code" name="code" required defaultValue={editing?.code} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="name">Nama</Label>
                <Input id="name" name="name" required defaultValue={editing?.name} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="building">Gedung</Label>
                <Input id="building" name="building" defaultValue={editing?.building ?? ""} />
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
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
              <Button type="button" variant="outline" onClick={closeForm}>Batal</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <DataTable<Room>
        columns={[
          { key: "code", label: "Kode" },
          { key: "name", label: "Nama" },
          { key: "building", label: "Gedung" },
          { key: "capacity", label: "Kapasitas" },
          {
            key: "actions",
            label: "Aksi",
            render: (room) => (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => startEdit(room)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={rowLoading === room.id}
                  onClick={() => handleDelete(room)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            ),
          },
        ]}
        data={rooms}
        emptyMessage="Belum ada ruangan."
      />
    </div>
  );
}
