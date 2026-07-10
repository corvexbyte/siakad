import { requireRole } from "@/server/queries/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AcademicYearManager,
  RoomManager,
  SemesterManager,
} from "@/features/master/settings-managers";

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
          <AcademicYearManager years={years ?? []} />
        </TabsContent>
        <TabsContent value="semesters" className="space-y-4">
          <SemesterManager semesters={semesterRows} years={years ?? []} />
        </TabsContent>
        <TabsContent value="rooms" className="space-y-4">
          <RoomManager rooms={rooms ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
