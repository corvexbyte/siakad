"use client";

import { useState } from "react";
import {
  createAcademicYear,
  createRoom,
  createSemester,
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
import type { Database } from "@/types/database";

type AcademicYear = Database["public"]["Tables"]["academic_years"]["Row"];

interface SettingsFormsProps {
  type: "year" | "semester" | "room";
  years?: AcademicYear[];
}

export function SettingsForms({ type, years = [] }: SettingsFormsProps) {
  const [yearId, setYearId] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleYear(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await createAcademicYear(new FormData(e.currentTarget));
    setLoading(false);
    window.location.reload();
  }

  async function handleSemester(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    fd.set("academic_year_id", yearId);
    await createSemester(fd);
    setLoading(false);
    window.location.reload();
  }

  async function handleRoom(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await createRoom(new FormData(e.currentTarget));
    setLoading(false);
    window.location.reload();
  }

  if (type === "year") {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Tambah Tahun Akademik</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleYear} className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label htmlFor="year_label">Label</Label>
              <Input id="year_label" name="year_label" placeholder="2025/2026" required />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_active" /> Aktif
            </label>
            <Button type="submit" disabled={loading}>Simpan</Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (type === "semester") {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Tambah Semester</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSemester} className="flex flex-wrap items-end gap-3">
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
              <Input id="name" name="name" placeholder="Ganjil 2025/2026" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="semester_number">No.</Label>
              <Input id="semester_number" name="semester_number" type="number" min={1} max={3} defaultValue={1} required />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_active" /> Aktif
            </label>
            <Button type="submit" disabled={loading || !yearId}>Simpan</Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Tambah Ruangan</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleRoom} className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="code">Kode</Label>
            <Input id="code" name="code" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="name">Nama</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="building">Gedung</Label>
            <Input id="building" name="building" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="capacity">Kapasitas</Label>
            <Input id="capacity" name="capacity" type="number" defaultValue={40} />
          </div>
          <Button type="submit" disabled={loading}>Simpan</Button>
        </form>
      </CardContent>
    </Card>
  );
}
