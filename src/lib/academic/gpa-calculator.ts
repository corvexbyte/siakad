export interface GradeRecord {
  credits: number;
  gradePoint: number;
}

export function calculateGpa(grades: GradeRecord[]): number {
  if (grades.length === 0) return 0;
  const totalPoints = grades.reduce(
    (sum, g) => sum + g.credits * g.gradePoint,
    0,
  );
  const totalCredits = grades.reduce((sum, g) => sum + g.credits, 0);
  if (totalCredits === 0) return 0;
  return Math.round((totalPoints / totalCredits) * 100) / 100;
}

export function calculateIps(grades: GradeRecord[]): number {
  return calculateGpa(grades);
}

export function pickBestGrades<
  T extends GradeRecord & { courseId: string; numeric: number },
>(records: T[]): T[] {
  const bestByCourse = new Map<string, T>();
  for (const record of records) {
    const existing = bestByCourse.get(record.courseId);
    if (!existing || record.gradePoint > existing.gradePoint) {
      bestByCourse.set(record.courseId, record);
    } else if (
      record.gradePoint === existing.gradePoint &&
      record.numeric > existing.numeric
    ) {
      bestByCourse.set(record.courseId, record);
    }
  }
  return Array.from(bestByCourse.values());
}
