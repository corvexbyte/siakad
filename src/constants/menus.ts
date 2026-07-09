import type { UserRole } from "@/constants/roles";
import {
  BookOpen,
  Calendar,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Users,
  Building2,
  School,
  FileText,
  Scroll,
  Award,
  BriefcaseBusiness,
  UserCog,
} from "lucide-react";

export interface MenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

export const MENU_ITEMS: MenuItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["super_admin", "admin_akademik", "kaprodi", "dosen", "mahasiswa"],
  },
  {
    title: "Fakultas",
    href: "/dashboard/faculties",
    icon: Building2,
    roles: ["super_admin"],
  },
  {
    title: "Program Studi",
    href: "/dashboard/study-programs",
    icon: School,
    roles: ["super_admin", "admin_akademik"],
  },
  {
    title: "Mahasiswa",
    href: "/dashboard/students",
    icon: GraduationCap,
    roles: ["super_admin", "admin_akademik", "kaprodi"],
  },
  {
    title: "Dosen",
    href: "/dashboard/lecturers",
    icon: Users,
    roles: ["super_admin", "admin_akademik", "kaprodi"],
  },
  {
    title: "Mata Kuliah",
    href: "/dashboard/courses",
    icon: BookOpen,
    roles: ["super_admin", "admin_akademik"],
  },
  {
    title: "Kelas",
    href: "/dashboard/classes",
    icon: School,
    roles: ["super_admin", "admin_akademik", "kaprodi"],
  },
  {
    title: "Jadwal",
    href: "/dashboard/schedules",
    icon: Calendar,
    roles: ["super_admin", "admin_akademik"],
  },
  {
    title: "KRS",
    href: "/dashboard/krs",
    icon: ClipboardList,
    roles: ["super_admin", "admin_akademik", "mahasiswa"],
  },
  {
    title: "KKN/TA/KP",
    href: "/dashboard/programs",
    icon: BriefcaseBusiness,
    roles: ["super_admin", "admin_akademik", "kaprodi", "dosen", "mahasiswa"],
  },
  {
    title: "Validasi KRS",
    href: "/dashboard/advisor/krs",
    icon: ClipboardList,
    roles: ["dosen"],
  },
  {
    title: "Nilai",
    href: "/dashboard/grades",
    icon: Award,
    roles: ["super_admin", "admin_akademik", "dosen"],
  },
  {
    title: "KHS",
    href: "/dashboard/khs",
    icon: FileText,
    roles: ["super_admin", "admin_akademik", "mahasiswa"],
  },
  {
    title: "Transkrip",
    href: "/dashboard/transcript",
    icon: Scroll,
    roles: ["super_admin", "admin_akademik", "mahasiswa"],
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: UserCog,
    roles: ["super_admin"],
  },
  {
    title: "Pengaturan",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["super_admin", "admin_akademik"],
  },
];

export function getMenuForRole(role: UserRole): MenuItem[] {
  return MENU_ITEMS.filter((item) => item.roles.includes(role));
}
