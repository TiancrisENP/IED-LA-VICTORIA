"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { DataProvider } from "@/providers/data-provider";
import { SessionProvider } from "@/providers/session-provider";
import { TenantProvider } from "@/providers/tenant-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light">
      <TooltipProvider delay={400}>
        <TenantProvider>
          <SessionProvider>
            <DataProvider>
              {children}
              <Toaster position="top-center" richColors />
            </DataProvider>
          </SessionProvider>
        </TenantProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
