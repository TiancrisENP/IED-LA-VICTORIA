"use client";

import { useRouter } from "next/navigation";
import { ChevronsUpDown, LogOut } from "lucide-react";

import { InstitutionMark } from "@/components/brand/institution-mark";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { fullName, initials } from "@/lib/format";
import { roleLabel } from "@/components/shared/role-badge";
import { useSession } from "@/providers/session-provider";
import { useTenant } from "@/providers/tenant-provider";

export function AppHeader() {
  const router = useRouter();
  const { currentUser, role, logout } = useSession();
  const { tenant } = useTenant();
  const roleName = roleLabel(role);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-brand-gold/35 bg-background px-3 sm:gap-3 sm:px-5">
      <SidebarTrigger className="shrink-0 text-brand-navy" />
      <Separator orientation="vertical" className="hidden h-6 sm:block" />
      <InstitutionMark size={32} className="hidden shrink-0 sm:inline-block" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-medium tracking-wide text-brand-blue">
          {tenant.shortName}
        </p>
        <p className="truncate text-sm font-semibold text-brand-navy">
          {tenant.moduleName}
        </p>
      </div>
      <div className="hidden items-center gap-2 sm:flex">
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-brand-navy">
          {roleName}
        </span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex max-w-[min(100%,16rem)] shrink-0 items-center gap-2 rounded-lg px-1.5 py-1 text-left hover:bg-muted">
          <Avatar size="sm">
            <AvatarFallback className="bg-brand-navy text-[10px] text-white">
              {initials(currentUser)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-medium">{fullName(currentUser)}</p>
            <p className="truncate text-xs text-muted-foreground">{roleName}</p>
          </div>
          <ChevronsUpDown className="hidden size-4 shrink-0 text-muted-foreground sm:block" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[min(18rem,calc(100vw-2rem))]">
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              <p className="font-medium text-foreground">{fullName(currentUser)}</p>
              <p className="text-xs font-normal text-muted-foreground">
                {currentUser.email}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                void logout().then(() => router.push("/login"));
              }}
            >
              <LogOut />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
