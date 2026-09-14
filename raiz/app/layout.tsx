import type { Metadata, Viewport } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";

import { TemaProvedor } from "@/components/TemaProvedor";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/* Fonte-assinatura: todo valor monetário do app é composto em mono com
   tabular-nums. Uma coluna de números precisa alinhar dígito com dígito, como
   num livro-caixa — é o detalhe que separa "planilha" de "produto
   financeiro". */
const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
  // Dados financeiros pessoais não têm nada a fazer em buscador.
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
    <html lang="pt-BR" className={`${inter.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <TemaProvedor>
          {children}
          <Toaster position="top-center" offset={16} mobileOffset={12} />
        </TemaProvedor>
      </body>
    </html>
  );
}
