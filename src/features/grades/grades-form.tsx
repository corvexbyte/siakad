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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  students: {
    student_number: string;
    users: { full_name: string } | null;
  } | null;
}

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

  async function loadStudents(selectedClassId: string) {
    setClassId(selectedClassId);
    const result = await getClassGrades(selectedClassId);
    setStudents((result.students ?? []) as StudentGrade[]);
  }

  async function handleSave(
    studentId: string,
    assignment: string,
    midterm: string,
    final: string,
  ) {
    setLoading(true);
    await saveGrade(
      studentId,
      classId,
      assignment ? Number(assignment) : null,
      midterm ? Number(midterm) : null,
      final ? Number(final) : null,
    );
    await loadStudents(classId);
    setLoading(false);
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => publishGrades(classId)}
          >
            Publikasikan Nilai
          </Button>
          {isAdmin && (
            <Button
              variant="destructive"
              disabled={loading}
              onClick={() => lockGrades(classId)}
            >
              Kunci Nilai
            </Button>
          )}
        </div>
      )}

      {students.map((s) => (
        <GradeRow
          key={s.student_id}
          student={s}
          loading={loading}
          onSave={handleSave}
        />
      ))}
    </div>
  );
}

function GradeRow({
  student,
  loading,
  onSave,
}: {
  student: StudentGrade;
  loading: boolean;
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
            onChange={(e) => setFinal(e.target.value)}
            className="w-20"
          />
        </div>
        <Button
          size="sm"
          disabled={loading}
          onClick={() =>
            onSave(student.student_id, assignment, midterm, final)
          }
        >
          Simpan
        </Button>
      </CardContent>
    </Card>
  );
}
