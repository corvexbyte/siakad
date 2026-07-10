import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth/login-form";
import { getProfile } from "@/server/queries/auth";
import { DEFAULT_ROLE_REDIRECT, type UserRole } from "@/constants/roles";

export default async function LoginPage() {
  const profile = await getProfile();
  if (profile) {
    redirect(DEFAULT_ROLE_REDIRECT[profile.role as UserRole] ?? "/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 p-4">
      <LoginForm />
    </div>
  );
}
