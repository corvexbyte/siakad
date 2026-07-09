"use client";

import { approveKrs, rejectKrs } from "@/server/actions/krs-grades";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/tables/data-table";
import { KRS_STATUS_LABELS } from "@/types/academic";
import type { KrsStatus } from "@/types/academic";
import { useState } from "react";

interface RegistrationRow {
  id: string;
  status: KrsStatus;
  students: {
    student_number: string;
    users: { full_name: string } | null;
  } | null;
  semesters: { name: string } | null;
}

export function KrsAdminView({
  registrations,
}: {
  registrations: RegistrationRow[];
}) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleApprove(id: string) {
    setLoading(id);
    await approveKrs(id);
    window.location.reload();
  }

  async function handleReject(id: string) {
    const reason = prompt("Alasan penolakan:");
    if (!reason) return;
    setLoading(id);
    await rejectKrs(id, reason);
    window.location.reload();
  }

  return (
    <DataTable<RegistrationRow>
      columns={[
        {
          key: "student",
          label: "Mahasiswa",
          render: (r) =>
            `${r.students?.users?.full_name ?? "—"} (${r.students?.student_number ?? "—"})`,
        },
        {
          key: "semester",
          label: "Semester",
          render: (r) => r.semesters?.name ?? "—",
        },
        {
          key: "status",
          label: "Status",
          render: (r) => (
            <Badge
              variant={
                r.status === "approved"
                  ? "success"
                  : r.status === "rejected"
                    ? "destructive"
                    : r.status === "submitted"
                      ? "warning"
                      : "secondary"
              }
            >
              {KRS_STATUS_LABELS[r.status]}
            </Badge>
          ),
        },
        {
          key: "actions",
          label: "Aksi",
          render: (r) =>
            r.status === "submitted" ? (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={loading === r.id}
                  onClick={() => handleApprove(r.id)}
                >
                  Setujui
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={loading === r.id}
                  onClick={() => handleReject(r.id)}
                >
                  Tolak
                </Button>
              </div>
            ) : (
              "—"
            ),
        },
      ]}
      data={registrations}
    />
  );
}
