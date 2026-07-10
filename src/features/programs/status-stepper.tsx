import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AcademicProgramRegistrationStatus } from "@/types/database";

const STEPS: { key: AcademicProgramRegistrationStatus; label: string }[] = [
  { key: "pending", label: "Diajukan" },
  { key: "approved", label: "Disetujui" },
  { key: "active", label: "Bimbingan Aktif" },
  { key: "completed", label: "Selesai" },
];

export function RegistrationStepper({
  status,
}: {
  status: AcademicProgramRegistrationStatus;
}) {
  if (status === "rejected") {
    return (
      <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
        <X className="h-4 w-4 shrink-0" />
        <span className="font-medium">Pendaftaran ditolak</span>
      </div>
    );
  }

  const currentIndex = Math.max(
    0,
    STEPS.findIndex((step) => step.key === status),
  );

  return (
    <div className="flex items-start">
      {STEPS.map((step, i) => {
        const done = i < currentIndex;
        const current = i === currentIndex;
        return (
          <div
            key={step.key}
            className="flex flex-1 items-start last:flex-none"
          >
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                  done && "border-emerald-600 bg-emerald-600 text-white",
                  current &&
                    "border-primary bg-primary text-primary-foreground",
                  !done &&
                    !current &&
                    "border-border bg-muted text-muted-foreground",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span
                className={cn(
                  "w-16 text-center text-[11px] leading-tight",
                  current
                    ? "font-medium text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-1 mt-3 h-px flex-1",
                  done ? "bg-emerald-600" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
