import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  AcademicProgramLogbookStatus,
  AcademicProgramRegistrationStatus,
} from "@/types/database";
import type { RegistrationRow } from "./types";

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

export function DocumentLinks({
  registration,
}: {
  registration: RegistrationRow;
}) {
  const docs = [
    ["KRS", registration.document_krs_url],
    ["Transkrip", registration.document_transcript_url],
    ["Proposal", registration.document_proposal_url],
  ].filter(([, href]) => href);
  if (!docs.length) return null;
  return (
    <div className="flex flex-wrap gap-3">
      {docs.map(([label, href]) => (
        <a
          key={label}
          href={href ?? "#"}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-medium text-primary hover:underline"
        >
          {label} ↗
        </a>
      ))}
    </div>
  );
}

export function Field({
  label,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label htmlFor={props.name}>{label}</Label>
      <Input id={props.name} {...props} />
    </div>
  );
}

export function FileField({
  label,
  name,
  className,
  required,
}: {
  label: string;
  name: string;
  className?: string;
  required?: boolean;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        required={required}
      />
    </div>
  );
}

export function SelectField({
  label,
  name,
  children,
  className,
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className={selectClass()}
        required={required}
      >
        {children}
      </select>
    </div>
  );
}

export function TextAreaField({
  label,
  name,
  className,
}: {
  label: string;
  name: string;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label htmlFor={name}>{label}</Label>
      <textarea
        id={name}
        name={name}
        rows={3}
        className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
    </div>
  );
}

export function selectClass() {
  return "h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm";
}

export function statusVariant(status: AcademicProgramRegistrationStatus) {
  if (status === "completed" || status === "active" || status === "approved") {
    return "success" as const;
  }
  if (status === "rejected") return "destructive" as const;
  return "warning" as const;
}

export function logbookVariant(status: AcademicProgramLogbookStatus) {
  if (status === "accepted") return "success" as const;
  if (status === "rejected") return "destructive" as const;
  if (status === "revision") return "warning" as const;
  return "secondary" as const;
}
