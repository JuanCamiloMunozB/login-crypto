/**
 * layout.tsx — Root layout
 *
 * Wraps every page in the application. Next.js App Router requires exactly
 * one root layout that renders the <html> and <body> tags.
 *
 * Fonts:
 *   Geist Sans  — primary UI font (variable: --font-geist-sans)
 *   Geist Mono  — monospace font available for code elements (variable: --font-geist-mono)
 *   Both are loaded via next/font/google which self-hosts the font files at
 *   build time, avoiding external network requests at runtime.
 *
 * The `antialiased` class enables subpixel antialiasing for crisper text
 * rendering across all pages.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** HTML metadata injected into <head> on every page. */
export const metadata: Metadata = {
  title: "Gestión de Credenciales",
  description: "Sistema de gestión de usuarios y contraseñas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
