"use client";

import { useState } from "react";
import { createStudent } from "@/server/actions/academic";
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
import type { Profile, StudyProgram } from "@/types/database";

export function StudentForm({
  programs,
  profiles,
}: {
  programs: StudyProgram[];
  profiles: Profile[];
}) {
  const [open, setOpen] = useState(false);
  const [programId, setProgramId] = useState("");
  const [profileId, setProfileId] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    fd.set("study_program_id", programId);
    fd.set("profile_id", profileId);
    await createStudent(fd);
    setLoading(false);
    setOpen(false);
    window.location.reload();
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Tambah Mahasiswa
      </Button>
    );
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader><CardTitle className="text-base">Tambah Mahasiswa</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-3">
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
          <div className="space-y-1">
            <Label htmlFor="student_number">NIM</Label>
            <Input id="student_number" name="student_number" required />
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
            <Label htmlFor="entry_year">Angkatan</Label>
            <Input id="entry_year" name="entry_year" type="number" defaultValue={2024} required />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading || !programId || !profileId}>Simpan</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
