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

/** Cabeçalho escuro compartilhado pelas páginas internas. */
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
    <section className="secao-escura relative overflow-hidden bg-[var(--tinta)] text-white">
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
            "linear-gradient(115deg, rgba(16,17,20,0.95) 25%, rgba(16,17,20,0.72) 68%, rgba(16,17,20,0.55) 100%)",
        }}
        aria-hidden="true"
      />
      <div className="malha absolute inset-0" aria-hidden="true" />

      <div className="envoltorio relative pb-16 pt-32 sm:pt-36 md:pb-20 md:pt-44">
        <nav aria-label="Trilha de navegação" className="entrada-hero">
          <ol className="flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[var(--texto-inverso-suave)]">
            <li>
              <Link
                href="/"
                className="transition-colors duration-200 hover:text-[var(--engetec-amarelo)]"
              >
                Início
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-[var(--engetec-amarelo)]">{rotulo}</li>
          </ol>
        </nav>

        <div className="entrada-hero">
          <h1
            className="mt-7 max-w-[19ch] text-[clamp(2.25rem,1.4rem+3.4vw,4rem)] font-extrabold leading-[1] tracking-[-0.04em]"
            style={{ animationDelay: "80ms" }}
          >
            {titulo}
          </h1>
          <p
            className="corpo mt-6 max-w-[56ch] text-[var(--texto-inverso-suave)]"
            style={{ animationDelay: "160ms" }}
          >
            {descricao}
          </p>
          {acoes && (
            <div
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
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
