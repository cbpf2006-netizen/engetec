import type { Metadata, Viewport } from "next";
import { Geist, Inter } from "next/font/google";

import { TemaProvedor } from "@/components/TemaProvedor";
import { Toaster } from "@/components/ui/sonner";
import { RegistroServiceWorker } from "@/components/RegistroServiceWorker";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/* Fonte dos números: todo valor monetário é composto em Geist com algarismos
   tabulares. Uma coluna de números precisa alinhar dígito com dígito — e Geist
   entrega isso com formas mais limpas e contemporâneas que uma monoespaçada. */
const geist = Geist({
  variable: "--font-numeros",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Raiz — organização financeira pessoal",
    template: "%s · Raiz",
  },
  description:
    "Acompanhe entradas, saídas, investimentos e contas a pagar em um só lugar, com o saldo sempre em dia.",
  applicationName: "Raiz",
  manifest: "/manifest.json",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f7f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1412" },
  ],
  colorScheme: "light dark",
  // O app tem campos de valor: impedir o zoom prejudicaria quem precisa dele.
  initialScale: 1,
  width: "device-width",
};

export default function LayoutRaiz({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${geist.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <TemaProvedor>
          {children}
          <Toaster position="top-center" offset={16} mobileOffset={12} />
          <RegistroServiceWorker />
        </TemaProvedor>
      </body>
    </html>
  );
}
