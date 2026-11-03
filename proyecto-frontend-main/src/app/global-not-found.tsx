import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { MissingRoute } from "@/components/brand/missing-route";
import { defaultTenant } from "@/lib/tenant";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `Página no encontrada — ${defaultTenant.shortName}`,
  description: `La ruta no existe en ${defaultTenant.moduleName}.`,
};

export default function GlobalNotFound() {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <MissingRoute />
      </body>
    </html>
  );
}
