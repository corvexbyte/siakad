export type KrsStatus = "draft" | "submitted" | "approved" | "rejected";

export type ClassStatus = "open" | "closed" | "cancelled";

export type AcademicStatus =
  | "active"
  | "leave"
  | "graduated"
  | "dropout"
  | "inactive";

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: "Senin",
  tuesday: "Selasa",
  wednesday: "Rabu",
  thursday: "Kamis",
  friday: "Jumat",
  saturday: "Sabtu",
};

export const KRS_STATUS_LABELS: Record<KrsStatus, string> = {
  draft: "Draft",
  submitted: "Diajukan",
  approved: "Disetujui",
  rejected: "Ditolak",
};

export const ACADEMIC_STATUS_LABELS: Record<AcademicStatus, string> = {
  active: "Aktif",
  leave: "Cuti",
  graduated: "Lulus",
  dropout: "Drop Out",
  inactive: "Tidak Aktif",
};

export interface ScheduleSlot {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  roomId?: string;
}

export interface GradeInput {
  assignmentScore: number | null;
  midtermScore: number | null;
  finalScore: number | null;
}

export const MAX_SKS_DEFAULT = 24;
