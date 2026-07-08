export const PROGRAM_DOCUMENT_BUCKET = "academic-program-documents";

export function sanitizeProgramDocumentName(name: string) {
  const cleaned = name
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  return cleaned || "document";
}
