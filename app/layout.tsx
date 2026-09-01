import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";

import { Cabecalho } from "@/components/layout/Cabecalho";
import { Rodape } from "@/components/layout/Rodape";
import { BotaoWhatsapp } from "@/components/layout/BotaoWhatsapp";
import { empresa } from "@/lib/empresa";

import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(empresa.site),
  title: {
    default: `${empresa.nome} | Instalações elétricas em ${empresa.cidade} e região`,
    template: `%s | ${empresa.nome}`,
  },
  description:
    `Instalações elétricas residenciais e comerciais em ${empresa.cidade} e região: ` +
    "quadros e painéis, energia solar, redes e postes. Mais de 100 clientes atendidos.",
  keywords: [
    "instalações elétricas Araruama",
    "eletricista Araruama",
    "energia solar Araruama",
    "quadro de distribuição",
    "padrão de entrada de energia",
    "Engetec",
  ],
  authors: [{ name: empresa.nomeCompleto }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: empresa.site,
    siteName: empresa.nome,
    title: `${empresa.nome} | Instalações elétricas em ${empresa.cidade} e região`,
    description:
      "Instalações elétricas residenciais e comerciais com foco em qualidade, segurança e inovação.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${empresa.nome} | Instalações elétricas`,
    description:
      "Instalações elétricas residenciais e comerciais em Araruama e região.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#101114",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${plexMono.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[var(--z-modal)] focus:rounded-[var(--raio-sm)] focus:bg-[var(--engetec-vermelho)] focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
        >
          Ir para o conteúdo
        </a>
        <Cabecalho />
        <main id="conteudo" className="flex-1">
          {children}
        </main>
        <Rodape />
        <BotaoWhatsapp />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Electrician",
              name: empresa.nomeCompleto,
              alternateName: empresa.nome,
              url: empresa.site,
              image: `${empresa.site}/img/logo.jpg`,
              telephone: empresa.telefoneLink,
              email: empresa.email,
              areaServed: `${empresa.cidade}, ${empresa.estado}`,
              address: {
                "@type": "PostalAddress",
                streetAddress: empresa.endereco.logradouro,
                addressLocality: empresa.endereco.cidade,
                addressRegion: empresa.endereco.estado,
                addressCountry: "BR",
              },
              sameAs: [empresa.instagram],
            }),
          }}
        />
      </body>
    </html>
  );
}
