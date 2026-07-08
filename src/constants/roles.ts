export const ROLES = [
  "super_admin",
  "admin_akademik",
  "kaprodi",
  "dosen",
  "mahasiswa",
] as const;

export type UserRole = (typeof ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin_akademik: "Admin Akademik",
  kaprodi: "Ketua Program Studi",
  dosen: "Dosen",
  mahasiswa: "Mahasiswa",
};

export const DEFAULT_ROLE_REDIRECT: Record<UserRole, string> = {
  super_admin: "/dashboard",
  admin_akademik: "/dashboard/students",
  kaprodi: "/dashboard/students",
  dosen: "/dashboard/advisor/krs",
  mahasiswa: "/dashboard/krs",
};
