"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionPayload } from "@/lib/auth/session";
import type { Json, Profile } from "@/types/database";
import type { UserRole } from "@/constants/roles";

export async function getSession() {
  return getSessionPayload();
}

export async function getProfile(): Promise<Profile | null> {
  const session = await getSessionPayload();
  if (!session) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("id, full_name, email, role, avatar_url, is_active, created_at, updated_at")
    .eq("id", session.userId)
    .single();

  return data;
}

export async function requireProfile(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (!profile.is_active) redirect("/login?error=inactive");
  return profile;
}

export async function requireRole(allowed: UserRole[]): Promise<Profile> {
  const profile = await requireProfile();
  if (!allowed.includes(profile.role as UserRole)) {
    redirect("/dashboard");
  }
  return profile;
}

export async function getStudentByProfile(profileId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("students")
    .select("*, study_programs(*)")
    .eq("profile_id", profileId)
    .single();
  return data;
}

export async function getLecturerByProfile(profileId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lecturers")
    .select("*, study_programs(*)")
    .eq("profile_id", profileId)
    .single();
  return data;
}

export async function getActiveSemester() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("semesters")
    .select("*, academic_years(*)")
    .eq("is_active", true)
    .single();
  return data;
}

export async function logActivity(
  action: string,
  entityType?: string,
  entityId?: string,
  metadata?: Json,
) {
  const profile = await getProfile();
  const supabase = await createClient();
  await supabase.from("activity_logs").insert({
    profile_id: profile?.id ?? null,
    action,
    entity_type: entityType ?? null,
    entity_id: entityId ?? null,
    metadata: metadata ?? null,
  });
}
