import { redirect } from "next/navigation";
import { getProfile } from "@/server/queries/auth";
import { DEFAULT_ROLE_REDIRECT, type UserRole } from "@/constants/roles";

export default async function HomePage() {
  const profile = await getProfile();
  if (profile) {
    redirect(
      DEFAULT_ROLE_REDIRECT[(profile?.role as UserRole) ?? "mahasiswa"] ??
        "/dashboard",
    );
  }
  redirect("/login");
}
