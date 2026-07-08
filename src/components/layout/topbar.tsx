import { signOut } from "@/server/actions/auth";
import { ROLE_LABELS } from "@/constants/roles";
import type { Profile } from "@/types/database";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface TopbarProps {
  profile: Profile;
}

export function Topbar({ profile }: TopbarProps) {
  return (
    <header className="flex h-16 items-center justify-between gap-3 border-b bg-card px-4 sm:px-6">
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">Selamat datang,</p>
        <p className="truncate font-semibold">{profile.full_name}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <span className="hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary sm:inline-flex">
          {ROLE_LABELS[profile.role]}
        </span>
        <form action={signOut}>
          <Button variant="outline" size="sm" type="submit">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Keluar</span>
          </Button>
        </form>
      </div>
    </header>
  );
}
