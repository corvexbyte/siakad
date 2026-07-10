"use client";

import { useState } from "react";
import {
  saveGrade,
  publishGrades,
  lockGrades,
  getClassGrades,
} from "@/server/actions/krs-grades";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusStepper } from "@/components/status-stepper";
import { Pagination } from "@/components/tables/pagination";

const PAGE_SIZE = 10;

interface ClassOption {
  id: string;
  class_name: string;
  courses: { course_code: string; course_name: string } | null;
  lecturers?: { users: { full_name: string } | null } | null;
}

interface StudentGrade {
  id: string;
  student_id: string;
  assignment_score: number | null;
  midterm_score: number | null;
  final_score: number | null;
  final_numeric_score: number | null;
  final_letter_grade: string | null;
  is_published: boolean;
  is_locked: boolean;
  students: {
    student_number: string;
    users: { full_name: string } | null;
  } | null;
}

const GRADE_STEPS = ["Draft", "Dipublikasi", "Terkunci"];

export function GradesForm({
  classes,
  isAdmin = false,
}: {
  classes: ClassOption[];
  isAdmin?: boolean;
}) {
  const [classId, setClassId] = useState("");
  const [students, setStudents] = useState<StudentGrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const isPublished = students.some((s) => s.is_published);
  const isLocked = students.some((s) => s.is_locked);
  const stepIndex = isLocked ? 2 : isPublished ? 1 : 0;
  const totalPages = Math.max(1, Math.ceil(students.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStudents = students.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  async function loadStudents(selectedClassId: string) {
    setClassId(selectedClassId);
    setError(null);
    setNotice(null);
    setPage(1);
    const result = await getClassGrades(selectedClassId);
    if ("error" in result && result.error) {
      setError(result.error);
    }
    setStudents((result.students ?? []) as StudentGrade[]);
  }

  async function handleSave(
    studentId: string,
    assignment: string,
    midterm: string,
    final: string,
  ) {
    setLoading(true);
    setError(null);
    setNotice(null);
    const result = await saveGrade(
      studentId,
      classId,
      assignment ? Number(assignment) : null,
      midterm ? Number(midterm) : null,
      final ? Number(final) : null,
    );
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    await loadStudents(classId);
    setLoading(false);
  }

  async function handlePublish() {
    if (!window.confirm("Publikasikan nilai kelas ini? Mahasiswa akan bisa melihat nilainya.")) return;
    setActionLoading("publish");
    setError(null);
    setNotice(null);
    const result = await publishGrades(classId);
    setActionLoading(null);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setNotice("Nilai berhasil dipublikasikan.");
    await loadStudents(classId);
  }

  async function handleLock() {
    if (!window.confirm("Kunci nilai kelas ini? Nilai tidak dapat diubah lagi setelah dikunci.")) return;
    setActionLoading("lock");
    setError(null);
    setNotice(null);
    const result = await lockGrades(classId);
    setActionLoading(null);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setNotice("Nilai berhasil dikunci.");
    await loadStudents(classId);
  }

  return (
    <div className="space-y-4">
      <Select value={classId} onValueChange={loadStudents}>
        <SelectTrigger className="max-w-md">
          <SelectValue placeholder="Pilih kelas" />
        </SelectTrigger>
        <SelectContent>
          {classes.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.courses?.course_code} — {c.class_name}
              {isAdmin && c.lecturers?.users?.full_name
                ? ` (${c.lecturers.users.full_name})`
                : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {classId && (
        <div className="space-y-3 rounded-lg border p-4">
          <StatusStepper steps={GRADE_STEPS} currentIndex={stepIndex} />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              disabled={actionLoading !== null || isPublished}
              onClick={handlePublish}
            >
              {actionLoading === "publish" ? "Memublikasikan..." : "Publikasikan Nilai"}
            </Button>
            {isAdmin && (
              <Button
                variant="destructive"
                disabled={actionLoading !== null || isLocked}
                onClick={handleLock}
              >
                {actionLoading === "lock" ? "Mengunci..." : "Kunci Nilai"}
              </Button>
            )}
            {isLocked && (
              <Badge variant="secondary">Nilai terkunci, tidak dapat diubah</Badge>
            )}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {notice && <p className="text-sm text-emerald-600">{notice}</p>}
        </div>
      )}

      {pageStudents.map((s) => (
        <GradeRow
          key={s.student_id}
          student={s}
          loading={loading}
          locked={isLocked}
          onSave={handleSave}
        />
      ))}
      <Pagination
        page={currentPage}
        totalPages={totalPages}
        totalItems={students.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}

function GradeRow({
  student,
  loading,
  locked,
  onSave,
}: {
  student: StudentGrade;
  loading: boolean;
  locked: boolean;
  onSave: (
    studentId: string,
    a: string,
    m: string,
    f: string,
  ) => Promise<void>;
}) {
  const [assignment, setAssignment] = useState(
    String(student.assignment_score ?? ""),
  );
  const [midterm, setMidterm] = useState(String(student.midterm_score ?? ""));
  const [final, setFinal] = useState(String(student.final_score ?? ""));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {student.students?.users?.full_name} ({student.students?.student_number})
          {student.final_letter_grade && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              → {student.final_numeric_score} ({student.final_letter_grade})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs text-muted-foreground">Tugas</label>
          <Input
            type="number"
            min={0}
            max={100}
            value={assignment}
            disabled={locked}
            onChange={(e) => setAssignment(e.target.value)}
            className="w-20"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">UTS</label>
          <Input
            type="number"
            min={0}
            max={100}
            value={midterm}
            disabled={locked}
            onChange={(e) => setMidterm(e.target.value)}
            className="w-20"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">UAS</label>
          <Input
            type="number"
            min={0}
            max={100}
            value={final}
            disabled={locked}
            onChange={(e) => setFinal(e.target.value)}
            className="w-20"
          />
        </div>
        <Button
          size="sm"
          disabled={loading || locked}
          onClick={() =>
            onSave(student.student_id, assignment, midterm, final)
          }
        >
          {loading ? "..." : "Simpan"}
        </Button>
      </CardContent>
    </Card>
  );
}
