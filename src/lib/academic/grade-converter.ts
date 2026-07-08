export interface GradeScale {
  min: number;
  max: number;
  letter: string;
  point: number;
}

export const GRADE_SCALE: GradeScale[] = [
  { min: 85, max: 100, letter: "A", point: 4.0 },
  { min: 80, max: 84.99, letter: "A-", point: 3.7 },
  { min: 75, max: 79.99, letter: "B+", point: 3.3 },
  { min: 70, max: 74.99, letter: "B", point: 3.0 },
  { min: 65, max: 69.99, letter: "B-", point: 2.7 },
  { min: 60, max: 64.99, letter: "C+", point: 2.3 },
  { min: 55, max: 59.99, letter: "C", point: 2.0 },
  { min: 50, max: 54.99, letter: "D", point: 1.0 },
  { min: 0, max: 49.99, letter: "E", point: 0.0 },
];

export function calculateFinalNumeric(
  assignment: number | null,
  midterm: number | null,
  final: number | null,
): number | null {
  if (assignment == null || midterm == null || final == null) return null;
  return Math.round(assignment * 0.2 + midterm * 0.3 + final * 0.5);
}

export function numericToLetterGrade(numeric: number): {
  letter: string;
  point: number;
} {
  const grade = GRADE_SCALE.find((g) => numeric >= g.min && numeric <= g.max);
  return grade
    ? { letter: grade.letter, point: grade.point }
    : { letter: "E", point: 0 };
}

export function calculateGrade(
  assignment: number | null,
  midterm: number | null,
  final: number | null,
) {
  const numeric = calculateFinalNumeric(assignment, midterm, final);
  if (numeric == null) return null;
  const { letter, point } = numericToLetterGrade(numeric);
  return { numeric, letter, point };
}
