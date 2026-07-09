"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createSession, deleteSession } from "@/lib/auth/session";
import {
  logActivity,
  requireRole,
} from "@/server/queries/auth";
import { DEFAULT_ROLE_REDIRECT, ROLES, type UserRole } from "@/constants/roles";
import * as bcrypt from 'bcryptjs';


export async function signIn(email: string, password: string) {
  let user;
  try {
    const supabase = await createClient();

    // Instead of RPC, fetch user and compare bcrypt hash manually
    const { data, error } = await supabase
      .from("users")
      .select("id, password_hash, role, is_active")
      .eq("email", email)
      .maybeSingle();

    if (error || !data || !data.password_hash) {
      return { error: "Email atau password salah." };
    }

    user = data;

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return { error: "Email atau password salah." };
    }

    if (!user.is_active) {
      return { error: "Akun tidak aktif. Hubungi administrator." };
    }

    await createSession(user.id);
    await logActivity("login");
  } catch (err) {
    console.error("Login Server Error:", err);
    return { error: "Terjadi kesalahan internal. Periksa konfigurasi server (env vars)." };
  }

  redirect(DEFAULT_ROLE_REDIRECT[user.role as UserRole] ?? "/dashboard");
}

export async function signOut() {
  await logActivity("logout");
  await deleteSession();
  redirect("/login");
}

export async function createUser(formData: FormData) {
  await requireRole(["super_admin"]);

  const full_name = (formData.get("full_name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const role = formData.get("role") as UserRole;

  if (!full_name || !email || !password || !role) {
    return { error: "Semua field wajib diisi." };
  }

  if (!ROLES.includes(role)) {
    return { error: "Role tidak valid." };
  }

  if (password.length < 8) {
    return { error: "Password minimal 8 karakter." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const supabase = await createClient();

  // Periksa apakah email sudah ada
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    return { error: "Email sudah digunakan: " + email };
  }

  const { data, error } = await supabase
    .from("users")
    .insert({
      id: crypto.randomUUID(),
      full_name,
      email,
      password_hash: passwordHash,
      role,
      is_active: true,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  await logActivity("create_user", "users", data?.id, { role });
  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function updateProfileRole(profileId: string, role: UserRole) {
  await requireRole(["super_admin"]);
  const supabase = await createClient();
  const { error } = await supabase
    .from("users")
    .update({ role })
    .eq("id", profileId);

  if (error) return { error: error.message };
  await logActivity("update_profile_role", "profiles", profileId, { role });
  revalidatePath("/dashboard/users");
  revalidatePath("/dashboard/students");
  revalidatePath("/dashboard/lecturers");
  return { success: true };
}

export async function toggleProfileActive(profileId: string, isActive: boolean) {
  await requireRole(["super_admin"]);
  const supabase = await createClient();
  const { error } = await supabase
    .from("users")
    .update({ is_active: isActive })
    .eq("id", profileId);

  if (error) return { error: error.message };
  await logActivity("toggle_profile_active", "profiles", profileId, {
    isActive,
  });
  revalidatePath("/dashboard/users");
  revalidatePath("/dashboard/students");
  revalidatePath("/dashboard/lecturers");
  return { success: true };
}
