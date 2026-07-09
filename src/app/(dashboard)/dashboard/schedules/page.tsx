import { requireRole } from "@/server/queries/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/tables/data-table";
import { ScheduleForm } from "@/features/schedules/schedule-form";
import { DAY_LABELS } from "@/types/academic";
import type { DayOfWeek } from "@/types/academic";
import { formatTime } from "@/lib/utils";

export default async function SchedulesPage() {
  await requireRole(["super_admin", "admin_akademik"]);
  const supabase = await createClient();

  const [{ data: schedules }, { data: classes }, { data: rooms }] =
    await Promise.all([
      supabase
        .from("class_schedules")
        .select("*, classes(class_name, courses(course_code)), rooms(name)")
        .order("day_of_week"),
      supabase
        .from("classes")
        .select("id, class_name, courses(course_code)")
        .eq("status", "open"),
      supabase.from("rooms").select("*").order("code"),
    ]);

  const rows =
    schedules?.map((s) => ({
      ...s,
      class_label: `${s.classes?.courses?.course_code} (${s.classes?.class_name})`,
      room_name: s.rooms?.name ?? "—",
      day_label: DAY_LABELS[s.day_of_week as DayOfWeek],
      time_range: `${formatTime(s.start_time)} - ${formatTime(s.end_time)}`,
    })) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Jadwal Kuliah" description="Atur jadwal dan ruangan" />
      <ScheduleForm classes={classes ?? []} rooms={rooms ?? []} />
      <DataTable
        columns={[
          { key: "class_label", label: "Kelas" },
          { key: "day_label", label: "Hari" },
          { key: "time_range", label: "Waktu" },
          { key: "room_name", label: "Ruangan" },
        ]}
        data={rows}
      />
    </div>
  );
}
