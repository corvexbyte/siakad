"use client";

import { useState } from "react";
import { createStudyProgram } from "@/server/actions/academic";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import type { Faculty } from "@/types/database";

export function StudyProgramForm({ faculties }: { faculties: Faculty[] }) {
  const [open, setOpen] = useState(false);
  const [facultyId, setFacultyId] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("faculty_id", facultyId);
    await createStudyProgram(formData);
    setLoading(false);
    setOpen(false);
    window.location.reload();
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Tambah Prodi
      </Button>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-base">Tambah Program Studi</CardTitle>
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
            <Input id="code" name="code" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="name">Nama</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="degree_level">Jenjang</Label>
            <Input id="degree_level" name="degree_level" defaultValue="S1" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading || !facultyId}>
              Simpan
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
