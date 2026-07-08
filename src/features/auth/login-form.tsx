"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { DEFAULT_ROLE_REDIRECT } from "@/constants/roles";
import type { UserRole } from "@/constants/roles";

const DEMO_PASSWORD = "password123";

const DEMO_ACCOUNTS = [
  { email: "admin@siakad.demo", label: "Super Admin" },
  { email: "akademik@siakad.demo", label: "Admin Akademik" },
  { email: "kaprodi@siakad.demo", label: "Kaprodi" },
  { email: "dosen@siakad.demo", label: "Dosen" },
  { email: "mahasiswa@siakad.demo", label: "Mahasiswa" },
] as const;

function getLoginErrorMessage(error: unknown) {
  if (typeof error === "string") {
    const message = error.trim();
    return message && message !== "{}"
      ? message
      : "Login gagal. Periksa email dan password.";
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = String(error.message ?? "").trim();
    return message && message !== "{}" && message !== "[object Object]"
      ? message
      : "Login gagal. Periksa email dan password.";
  }

  return "Login gagal. Periksa email dan password.";
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function selectDemoAccount(selectedEmail: string) {
    setEmail(selectedEmail);
    setPassword(DEMO_PASSWORD);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(getLoginErrorMessage(authError));
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Login gagal. Periksa email dan password.");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_active")
        .eq("id", user.id)
        .single();

      if (!profile) {
        await supabase.auth.signOut();
        setError("Profil pengguna tidak ditemukan. Hubungi administrator.");
        return;
      }

      if (!profile.is_active) {
        await supabase.auth.signOut();
        setError("Akun tidak aktif. Hubungi administrator.");
        return;
      }

      router.push(DEFAULT_ROLE_REDIRECT[profile.role as UserRole]);
      router.refresh();
    } catch {
      setError("Login gagal. Periksa koneksi dan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <GraduationCap className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>SIAKAD</CardTitle>
        <CardDescription>Sistem Informasi Akademik Universitas</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="demo-account">Akun Demo</Label>
            <Select onValueChange={selectDemoAccount}>
              <SelectTrigger id="demo-account">
                <SelectValue placeholder="Pilih akun demo" />
              </SelectTrigger>
              <SelectContent>
                {DEMO_ACCOUNTS.map((account) => (
                  <SelectItem key={account.email} value={account.email}>
                    {account.label} - {account.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Password demo: {DEMO_PASSWORD}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@universitas.ac.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Masuk..." : "Masuk"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
