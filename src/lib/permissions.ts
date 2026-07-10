import type { UserRole } from "@/constants/roles";

export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  "/dashboard": ["super_admin", "admin_akademik", "kaprodi", "dosen", "mahasiswa"],
  "/dashboard/faculties": ["super_admin"],
  "/dashboard/study-programs": ["super_admin", "admin_akademik"],
  "/dashboard/students": ["super_admin", "admin_akademik", "kaprodi"],
  "/dashboard/lecturers": ["super_admin", "admin_akademik", "kaprodi"],
  "/dashboard/courses": ["super_admin", "admin_akademik"],
  "/dashboard/classes": ["super_admin", "admin_akademik", "kaprodi"],
  "/dashboard/schedules": ["super_admin", "admin_akademik"],
  "/dashboard/krs": ["super_admin", "admin_akademik", "mahasiswa"],
  "/dashboard/kkn": ["super_admin", "admin_akademik", "kaprodi", "dosen", "mahasiswa"],
  "/dashboard/ta": ["super_admin", "admin_akademik", "kaprodi", "dosen", "mahasiswa"],
  "/dashboard/kp": ["super_admin", "admin_akademik", "kaprodi", "dosen", "mahasiswa"],
  "/dashboard/advisor/krs": ["dosen"],
  "/dashboard/grades": ["super_admin", "admin_akademik", "dosen"],
  "/dashboard/khs": ["super_admin", "admin_akademik", "mahasiswa"],
  "/dashboard/settings": ["super_admin", "admin_akademik"],
};

export function canAccessRoute(role: UserRole, pathname: string): boolean {
  const match = Object.keys(ROUTE_PERMISSIONS)
    .sort((a, b) => b.length - a.length)
    .find((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (!match) return true;
  return ROUTE_PERMISSIONS[match]?.includes(role) ?? false;
}

export function hasRole(role: UserRole, allowed: UserRole[]): boolean {
  return allowed.includes(role);
}

export function isAdminRole(role: UserRole): boolean {
  return role === "super_admin" || role === "admin_akademik";
}
