import { MAX_SKS_DEFAULT } from "@/types/academic";

export function validateSksLimit(
  currentSks: number,
  additionalSks: number,
  maxSks: number = MAX_SKS_DEFAULT,
): { valid: boolean; message?: string } {
  const total = currentSks + additionalSks;
  if (total > maxSks) {
    return {
      valid: false,
      message: `Total SKS (${total}) melebihi batas maksimum ${maxSks} SKS`,
    };
  }
  return { valid: true };
}

export function sumCredits(credits: number[]): number {
  return credits.reduce((sum, c) => sum + c, 0);
}
