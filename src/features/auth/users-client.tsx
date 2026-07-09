"use client";

import { useState, useTransition } from "react";
import { createUser, updateProfileRole, toggleProfileActive } from "@/server/actions/auth";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, ROLES } from "@/constants/roles";
import type { UserRole } from "@/constants/roles";
import { Plus, UserCheck, UserX } from "lucide-react";

type UserRow = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
};

interface UsersClientProps {
  users: UserRow[];
}

export function UsersClient({ users }: UsersClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createUser(fd);
      if (result?.error) {
        setFormError(result.error);
      } else {
        setFormSuccess(true);
        setShowForm(false);
        e.currentTarget?.reset();
      }
    });
  }

  async function handleRoleChange(userId: string, role: UserRole) {
    startTransition(async () => {
      await updateProfileRole(userId, role);
    });
  }

  async function handleToggleActive(userId: string, currentActive: boolean) {
    startTransition(async () => {
      await toggleProfileActive(userId, !currentActive);
    });
  }

  const roleCounts = users.reduce<Record<string, number>>((acc, u) => {
    const label = ROLE_LABELS[u.role] ?? u.role;
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex flex-wrap items-center gap-2">
        {Object.entries(roleCounts).map(([role, count]) => (
          <Badge key={role} variant="secondary" className="text-xs">
            {role}: {count}
          </Badge>
        ))}
        <Badge variant="outline" className="text-xs">
          Total: {users.length} users
        </Badge>
      </div>

      {/* Create User Form */}
      {showForm ? (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle className="text-base">Tambah User Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-3">
              <div className="space-y-1">
                <Label htmlFor="full_name">Nama Lengkap</Label>
                <Input id="full_name" name="full_name" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Minimal 8 karakter"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="role">Role</Label>
                <Select name="role" defaultValue="mahasiswa" required>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}
              <div className="flex gap-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Menyimpan..." : "Simpan"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowForm(false); setFormError(null); }}
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="flex items-center gap-3">
          <Button onClick={() => { setShowForm(true); setFormSuccess(false); }}>
            <Plus className="h-4 w-4" />
            Tambah User
          </Button>
          {formSuccess && (
            <p className="text-sm text-green-600">User berhasil dibuat.</p>
          )}
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto rounded-lg border bg-card shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-100">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Nama</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Terdaftar</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Belum ada user.
                </td>
              </tr>
            )}
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b last:border-0 transition-colors hover:bg-accent/40"
              >
                <td className="px-4 py-3 font-medium">{user.full_name}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {user.email}
                </td>
                <td className="px-4 py-3">
                  <Select
                    defaultValue={user.role}
                    onValueChange={(v) =>
                      handleRoleChange(user.id, v as UserRole)
                    }
                    disabled={isPending}
                  >
                    <SelectTrigger className="h-8 w-[140px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r} className="text-xs">
                          {ROLE_LABELS[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3">
                  {user.is_active ? (
                    <Badge variant="success">Aktif</Badge>
                  ) : (
                    <Badge variant="destructive">Nonaktif</Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isPending}
                    onClick={() =>
                      handleToggleActive(user.id, user.is_active)
                    }
                    title={user.is_active ? "Nonaktifkan" : "Aktifkan"}
                  >
                    {user.is_active ? (
                      <UserX className="h-4 w-4 text-destructive" />
                    ) : (
                      <UserCheck className="h-4 w-4 text-green-600" />
                    )}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
