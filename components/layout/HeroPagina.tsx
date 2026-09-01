import Image from "next/image";
import Link from "next/link";

import type { ReactNode } from "react";

type Props = {
  rotulo: string;
  titulo: string;
  descricao: string;
  imagem: string;
  alt: string;
  posicao?: string;
  acoes?: ReactNode;
};

/** Cabeçalho compartilhado pelas páginas internas. */
export function HeroPagina({
  rotulo,
  titulo,
  descricao,
  imagem,
  alt,
  posicao = "center",
  acoes,
}: Props) {
  return (
    <section className="relative overflow-hidden bg-[var(--color-background)]">
      <Image
        src={imagem}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-30"
        style={{ objectPosition: posicao }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg, rgba(23,20,19,0.96) 26%, rgba(23,20,19,0.76) 68%, rgba(23,20,19,0.58) 100%)",
        }}
        aria-hidden="true"
      />
      <div className="malha absolute inset-0" aria-hidden="true" />

      <div className="envoltorio relative pb-16 pt-[136px] md:pb-20 lg:pb-[120px] lg:pt-[184px]">
        <nav aria-label="Trilha de navegação" className="entrada-hero">
          <ol className="flex items-center gap-2 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[var(--tracking-label)] text-[var(--color-text-secondary)]">
            <li>
              <Link
                href="/"
                className="transition-colors duration-200 hover:text-[var(--color-secondary)]"
              >
                Início
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-[var(--color-text-primary)]">{rotulo}</li>
          </ol>
        </nav>

        <div className="entrada-hero">
          <h1
            className="titulo-hero mt-7"
            style={{ animationDelay: "80ms" }}
          >
            {titulo}
          </h1>
          <p className="corpo mt-7" style={{ animationDelay: "160ms" }}>
            {descricao}
          </p>
          {acoes && (
            <div
              className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
              style={{ animationDelay: "240ms" }}
            >
              {acoes}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
