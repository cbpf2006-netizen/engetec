import type { Metadata, Viewport } from "next";
import { Geist, Inter } from "next/font/google";

import { TemaProvedor } from "@/components/TemaProvedor";
import { Toaster } from "@/components/ui/sonner";
import { RegistroServiceWorker } from "@/components/RegistroServiceWorker";
import { AberturaDoApp, SCRIPT_DA_ABERTURA } from "@/components/AberturaDoApp";
import { IMAGENS_DE_ABERTURA } from "@/lib/abertura";
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
  // iOS: abre em tela cheia quando instalado pela Tela de Início. O ícone de
  // toque vem de app/apple-icon.png (convenção do Next).
  appleWebApp: {
    capable: true,
    title: "Raiz",
    statusBarStyle: "default",
    // Tela de abertura do app instalado no iPhone: verde-escuro com a logo.
    startupImage: IMAGENS_DE_ABERTURA,
  },
  // Sem isto o Safari transforma telefones em links azuis no meio do texto.
  formatDetection: { telephone: false },
  // O Next 16 emite só `mobile-web-app-capable`; iOS anteriores à 16.4 ainda
  // dependem do nome com prefixo da Apple para abrir em tela cheia.
  other: { "apple-mobile-web-app-capable": "yes" },
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
  // Faz env(safe-area-inset-*) valer no iPhone (barra inferior, entalhe).
  viewportFit: "cover",
};

export default function LayoutRaiz({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${geist.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_DA_ABERTURA }} />
        <AberturaDoApp />
        <div className="fundo-luzes" aria-hidden="true" />
        <TemaProvedor>
          {children}
          <Toaster position="top-center" offset={16} mobileOffset={12} />
          <RegistroServiceWorker />
        </TemaProvedor>
      </body>
    </html>
  );
}
