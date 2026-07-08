"use client";

import { useState } from "react";
import { createClass } from "@/server/actions/academic";
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
import type { Course, Database } from "@/types/database";

type AcademicYear = Database["public"]["Tables"]["academic_years"]["Row"];
type Semester = Database["public"]["Tables"]["semesters"]["Row"];

interface LecturerOption {
  id: string;
  profiles: { full_name: string } | null;
}

export function ClassForm({
  courses,
  lecturers,
  years,
  semesters,
}: {
  courses: Course[];
  lecturers: LecturerOption[];
  years: AcademicYear[];
  semesters: Semester[];
}) {
  const [open, setOpen] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [lecturerId, setLecturerId] = useState("");
  const [yearId, setYearId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    fd.set("course_id", courseId);
    fd.set("lecturer_id", lecturerId);
    fd.set("academic_year_id", yearId);
    fd.set("semester_id", semesterId);
    await createClass(fd);
    setLoading(false);
    setOpen(false);
    window.location.reload();
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Tambah Kelas
      </Button>
    );
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader><CardTitle className="text-base">Tambah Kelas</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
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
          <div className="space-y-1 sm:col-span-2">
            <Label>Dosen</Label>
            <Select value={lecturerId} onValueChange={setLecturerId}>
              <SelectTrigger><SelectValue placeholder="Pilih dosen" /></SelectTrigger>
              <SelectContent>
                {lecturers.map((l) => (
                  <SelectItem key={l.id} value={l.id}>{l.profiles?.full_name}</SelectItem>
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
          <div className="space-y-1">
            <Label htmlFor="capacity">Kapasitas</Label>
            <Input id="capacity" name="capacity" type="number" defaultValue={40} />
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={loading || !courseId || !lecturerId || !yearId || !semesterId}>
              Simpan
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
