import { redirect } from "next/navigation";
import { getSession } from "@/server/queries/auth";
import { DEFAULT_ROLE_REDIRECT, type UserRole } from "@/constants/roles";

export default async function HomePage() {
  const user = await getSession();
  if (user) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    redirect(
      DEFAULT_ROLE_REDIRECT[(profile?.role as UserRole) ?? "mahasiswa"] ??
        "/dashboard",
    );
  }
  redirect("/login");
}
