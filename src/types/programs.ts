import type {
  AcademicProgramAssignmentRole,
  AcademicProgramLogbookStatus,
  AcademicProgramRegistrationStatus,
  AcademicProgramType,
} from "@/types/database";

export const PROGRAM_TYPE_LABELS: Record<AcademicProgramType, string> = {
  kkn: "KKN",
  ta: "Tugas Akhir",
  kp: "Kerja Praktek",
};

export const PROGRAM_STATUS_LABELS: Record<
  AcademicProgramRegistrationStatus,
  string
> = {
  pending: "Pending",
  approved: "Disetujui",
  rejected: "Ditolak",
  active: "Aktif",
  completed: "Selesai",
};

export const ASSIGNMENT_ROLE_LABELS: Record<
  AcademicProgramAssignmentRole,
  string
> = {
  supervisor: "Pembimbing",
  examiner: "Penguji",
};

export const LOGBOOK_STATUS_LABELS: Record<AcademicProgramLogbookStatus, string> =
  {
    pending: "Menunggu",
    accepted: "Diterima",
    revision: "Revisi",
    rejected: "Ditolak",
  };
