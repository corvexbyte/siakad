"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getProfile,
  logActivity,
  requireRole,
} from "@/server/queries/auth";
import { DEFAULT_ROLE_REDIRECT, type UserRole } from "@/constants/roles";

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  const profile = await getProfile();
  if (!profile?.is_active) {
    await supabase.auth.signOut();
    return { error: "Akun tidak aktif. Hubungi administrator." };
  }

  await logActivity("login");
  redirect(DEFAULT_ROLE_REDIRECT[profile!.role as UserRole] ?? "/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await logActivity("logout");
  await supabase.auth.signOut();
  redirect("/login");
}

export async function updateProfileRole(profileId: string, role: UserRole) {
  await requireRole(["super_admin"]);
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", profileId);

  if (error) return { error: error.message };
  await logActivity("update_profile_role", "profiles", profileId, { role });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/students");
  revalidatePath("/dashboard/lecturers");
  return { success: true };
}

export async function toggleProfileActive(profileId: string, isActive: boolean) {
  await requireRole(["super_admin"]);
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", profileId);

  if (error) return { error: error.message };
  await logActivity("toggle_profile_active", "profiles", profileId, {
    isActive,
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/students");
  revalidatePath("/dashboard/lecturers");
  return { success: true };
}
