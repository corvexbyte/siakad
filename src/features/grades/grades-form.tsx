"use client";

import { useState } from "react";
import {
  saveGrade,
  publishGrades,
  lockGrades,
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
import { createClient } from "@/lib/supabase/client";

interface ClassOption {
  id: string;
  class_name: string;
  courses: { course_code: string; course_name: string } | null;
  lecturers?: { profiles: { full_name: string } | null } | null;
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
    profiles: { full_name: string } | null;
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
    const supabase = createClient();

    const { data: registrationItems } = await supabase
      .from("course_registration_items")
      .select("course_registrations!inner(student_id, status)")
      .eq("class_id", selectedClassId)
      .eq("course_registrations.status", "approved");

    const studentIds =
      registrationItems?.map(
        (i) => i.course_registrations?.student_id,
      ).filter(Boolean) ?? [];

    if (!studentIds.length) {
      setStudents([]);
      return;
    }

    const { data: grades } = await supabase
      .from("grades")
      .select("*, students(student_number, profiles(full_name))")
      .eq("class_id", selectedClassId)
      .in("student_id", studentIds);

    const gradeMap = new Map(grades?.map((g) => [g.student_id, g]) ?? []);

    const { data: studentData } = await supabase
      .from("students")
      .select("id, student_number, profiles(full_name)")
      .in("id", studentIds);

    const merged: StudentGrade[] =
      studentData?.map((s) => {
        const existing = gradeMap.get(s.id);
        return (
          existing ?? {
            id: "",
            student_id: s.id,
            assignment_score: null,
            midterm_score: null,
            final_score: null,
            final_numeric_score: null,
            final_letter_grade: null,
            is_published: false,
            students: s,
          }
        );
      }) ?? [];

    setStudents(merged);
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
              {isAdmin && c.lecturers?.profiles?.full_name
                ? ` (${c.lecturers.profiles.full_name})`
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
          {student.students?.profiles?.full_name} ({student.students?.student_number})
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
