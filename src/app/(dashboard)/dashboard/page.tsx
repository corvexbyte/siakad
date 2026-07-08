import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireProfile } from "@/server/queries/auth";
import { ROLE_LABELS } from "@/constants/roles";
import type { UserRole } from "@/constants/roles";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Award,
  BookOpen,
  BriefcaseBusiness,
  ClipboardList,
  GraduationCap,
  Users,
} from "lucide-react";

export default async function DashboardPage() {
  const profile = await requireProfile();
  const role = profile.role as UserRole;
  const supabase = await createClient();

  const stats = await getStats(supabase, role);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          {ROLE_LABELS[role]} — Ringkasan sistem akademik
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.href && (
                <Link
                  href={stat.href}
                  className="text-xs text-primary hover:underline"
                >
                  Lihat detail →
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Akses Cepat</CardTitle>
          <CardDescription>Navigasi ke modul utama</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {getQuickLinks(role).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md border p-4 transition-colors hover:bg-accent"
              >
                <p className="font-medium">{link.title}</p>
                <p className="text-sm text-muted-foreground">{link.desc}</p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function getStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  role: UserRole,
) {
  if (role === "kaprodi") {
    const base = [
      {
        label: "Mahasiswa",
        value: "0",
        icon: GraduationCap,
        href: "/dashboard/students",
      },
      {
        label: "Dosen",
        value: "0",
        icon: Users,
        href: "/dashboard/lecturers",
      },
      {
        label: "Kelas",
        value: "0",
        icon: BookOpen,
        href: "/dashboard/classes",
      },
      {
        label: "KKN/TA/KP",
        value: "Buka",
        icon: BriefcaseBusiness,
        href: "/dashboard/programs",
      },
    ];

    const { count: studentCount } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true });
    const { count: lecturerCount } = await supabase
      .from("lecturers")
      .select("*", { count: "exact", head: true });
    const { count: classCount } = await supabase
      .from("classes")
      .select("*", { count: "exact", head: true });

    base[0].value = String(studentCount ?? 0);
    base[1].value = String(lecturerCount ?? 0);
    base[2].value = String(classCount ?? 0);

    return base;
  }

  if (["super_admin", "admin_akademik"].includes(role)) {
    const base = [
      {
        label: "Mahasiswa",
        value: "0",
        icon: GraduationCap,
        href: "/dashboard/students",
      },
      {
        label: "Dosen",
        value: "0",
        icon: Users,
        href: "/dashboard/lecturers",
      },
      {
        label: "Mata Kuliah",
        value: "0",
        icon: BookOpen,
        href: "/dashboard/courses",
      },
      {
        label: "KRS Pending",
        value: "0",
        icon: ClipboardList,
        href: "/dashboard/krs",
      },
    ];

    const { count: studentCount } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true });
    const { count: lecturerCount } = await supabase
      .from("lecturers")
      .select("*", { count: "exact", head: true });
    const { count: courseCount } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true });
    const { count: krsCount } = await supabase
      .from("course_registrations")
      .select("*", { count: "exact", head: true })
      .eq("status", "submitted");

    base[0].value = String(studentCount ?? 0);
    base[1].value = String(lecturerCount ?? 0);
    base[2].value = String(courseCount ?? 0);
    base[3].value = String(krsCount ?? 0);

    return base;
  }

  if (role === "dosen") {
    return [
      {
        label: "Validasi KRS",
        value: "Buka",
        icon: ClipboardList,
        href: "/dashboard/advisor/krs",
      },
      {
        label: "Input Nilai",
        value: "Buka",
        icon: Award,
        href: "/dashboard/grades",
      },
      {
        label: "KKN/TA/KP",
        value: "Buka",
        icon: BriefcaseBusiness,
        href: "/dashboard/programs",
      },
    ];
  }

  return [
    {
      label: "KRS",
      value: "Buka",
      icon: ClipboardList,
      href: "/dashboard/krs",
    },
    {
      label: "KHS",
      value: "Buka",
      icon: Award,
      href: "/dashboard/khs",
    },
    {
      label: "KKN/TA/KP",
      value: "Buka",
      icon: BriefcaseBusiness,
      href: "/dashboard/programs",
    },
  ];
}

function getQuickLinks(role: UserRole) {
  const links: Record<UserRole, { title: string; desc: string; href: string }[]> =
    {
      super_admin: [
        { title: "Mahasiswa", desc: "Kelola data mahasiswa", href: "/dashboard/students" },
        { title: "Dosen", desc: "Kelola data dosen", href: "/dashboard/lecturers" },
        { title: "Fakultas", desc: "Data fakultas", href: "/dashboard/faculties" },
        { title: "Pengaturan", desc: "Tahun akademik & semester", href: "/dashboard/settings" },
        { title: "KKN/TA/KP", desc: "Kelola program akademik", href: "/dashboard/programs" },
      ],
      admin_akademik: [
        { title: "Mahasiswa", desc: "Kelola data mahasiswa", href: "/dashboard/students" },
        { title: "Jadwal", desc: "Atur jadwal kuliah", href: "/dashboard/schedules" },
        { title: "KRS", desc: "Validasi KRS", href: "/dashboard/krs" },
        { title: "KKN/TA/KP", desc: "Periode dan pendaftaran", href: "/dashboard/programs" },
      ],
      kaprodi: [
        { title: "Mahasiswa", desc: "Data mahasiswa prodi", href: "/dashboard/students" },
        { title: "Dosen", desc: "Data dosen prodi", href: "/dashboard/lecturers" },
        { title: "Kelas", desc: "Daftar kelas", href: "/dashboard/classes" },
        { title: "KKN/TA/KP", desc: "Pembimbing dan nilai akhir", href: "/dashboard/programs" },
      ],
      dosen: [
        { title: "Input Nilai", desc: "Nilai mahasiswa", href: "/dashboard/grades" },
        { title: "Validasi KRS", desc: "Mahasiswa bimbingan", href: "/dashboard/advisor/krs" },
        { title: "KKN/TA/KP", desc: "Logbook dan penilaian", href: "/dashboard/programs" },
      ],
      mahasiswa: [
        { title: "KRS", desc: "Isi KRS semester ini", href: "/dashboard/krs" },
        { title: "KHS", desc: "Kartu Hasil Studi", href: "/dashboard/khs" },
        { title: "KKN/TA/KP", desc: "Pendaftaran dan logbook", href: "/dashboard/programs" },
      ],
    };
  return links[role] ?? [];
}
