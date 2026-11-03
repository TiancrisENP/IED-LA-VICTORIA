"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { InstitutionMark } from "@/components/brand/institution-mark";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { navForRole } from "@/lib/navigation";
import { useSession } from "@/providers/session-provider";
import { useTenant } from "@/providers/tenant-provider";

export function AppSidebar() {
  const pathname = usePathname();
  const { role } = useSession();
  const { tenant } = useTenant();
  const { setOpenMobile, isMobile, state } = useSidebar();
  const items = navForRole(role);
  const iconRail = state === "collapsed" && !isMobile;

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader
        className={cn(
          "border-b border-sidebar-border px-3 py-4",
          iconRail && "items-center px-0 py-3",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3 overflow-hidden",
            iconRail && "justify-center overflow-visible",
          )}
        >
          <InstitutionMark
            size={iconRail ? 32 : 36}
            className={cn(
              "rounded-sm bg-white/95 ring-1 ring-white/30",
              iconRail ? "p-px" : "p-0.5",
            )}
          />
          {iconRail ? null : (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{tenant.shortName}</p>
              <p className="truncate text-[11px] tracking-wide text-brand-gold uppercase">
                {tenant.motto}
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/50">Módulos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={isMobile ? undefined : item.label}
                      render={<Link href={item.href} />}
                      onClick={() => setOpenMobile(false)}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <p className="px-1 text-[11px] leading-4 text-white/55 group-data-[collapsible=icon]:hidden">
          {tenant.footerNote}
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
