import { requireRole } from "@/server/queries/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/tables/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsForms } from "@/features/master/settings-forms";

export default async function SettingsPage() {
  await requireRole(["super_admin", "admin_akademik"]);
  const supabase = await createClient();

  const [{ data: years }, { data: semesters }, { data: rooms }] =
    await Promise.all([
      supabase.from("academic_years").select("*").order("year_label", { ascending: false }),
      supabase.from("semesters").select("*, academic_years(year_label)").order("created_at", { ascending: false }),
      supabase.from("rooms").select("*").order("code"),
    ]);

  const semesterRows =
    semesters?.map((s) => ({
      ...s,
      year_label: s.academic_years?.year_label ?? "—",
    })) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan"
        description="Tahun akademik, semester, dan ruangan"
      />
      <Tabs defaultValue="years">
        <TabsList>
          <TabsTrigger value="years">Tahun Akademik</TabsTrigger>
          <TabsTrigger value="semesters">Semester</TabsTrigger>
          <TabsTrigger value="rooms">Ruangan</TabsTrigger>
        </TabsList>
        <TabsContent value="years" className="space-y-4">
          <SettingsForms type="year" years={years ?? []} />
          <DataTable
            columns={[
              { key: "year_label", label: "Tahun" },
              {
                key: "is_active",
                label: "Status",
                render: (r) => (r.is_active ? "Aktif" : "—"),
              },
            ]}
            data={years ?? []}
          />
        </TabsContent>
        <TabsContent value="semesters" className="space-y-4">
          <SettingsForms type="semester" years={years ?? []} />
          <DataTable
            columns={[
              { key: "name", label: "Semester" },
              { key: "year_label", label: "Tahun Akademik" },
              { key: "semester_number", label: "No." },
              {
                key: "is_active",
                label: "Status",
                render: (r) => (r.is_active ? "Aktif" : "—"),
              },
            ]}
            data={semesterRows}
          />
        </TabsContent>
        <TabsContent value="rooms" className="space-y-4">
          <SettingsForms type="room" />
          <DataTable
            columns={[
              { key: "code", label: "Kode" },
              { key: "name", label: "Nama" },
              { key: "building", label: "Gedung" },
              { key: "capacity", label: "Kapasitas" },
            ]}
            data={rooms ?? []}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
