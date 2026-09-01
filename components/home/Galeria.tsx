"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { galeria } from "@/lib/empresa";
import { Revelar } from "@/components/ui/Revelar";
import { Fechar, Seta } from "@/components/ui/Icones";

/** Composição assimétrica: uma foto alta à esquerda e três em torno dela. */
const posicoes = [
  "aspect-[3/4] lg:aspect-auto lg:col-span-4 lg:row-span-2",
  "aspect-[16/10] lg:aspect-auto lg:col-span-8",
  "aspect-[4/3] lg:aspect-auto lg:col-span-4",
  "aspect-[4/3] lg:aspect-auto lg:col-span-4",
];

export function Galeria() {
  const [aberta, setAberta] = useState<number | null>(null);
  const dialogo = useRef<HTMLDialogElement>(null);

  const fechar = useCallback(() => {
    dialogo.current?.close();
    setAberta(null);
  }, []);

  const navegar = useCallback((passo: number) => {
    setAberta((atual) => {
      if (atual === null) return atual;
      return (atual + passo + galeria.length) % galeria.length;
    });
  }, []);

  useEffect(() => {
    if (aberta === null) return;
    const elemento = dialogo.current;
    if (elemento && !elemento.open) elemento.showModal();

    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "ArrowRight") navegar(1);
      if (evento.key === "ArrowLeft") navegar(-1);
    };

    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aberta, navegar]);

  const foto = aberta === null ? null : galeria[aberta];

  return (
    <section className="bg-[var(--color-background)] py-16 md:py-20 lg:py-[120px]">
      <div className="envoltorio">
        <Revelar>
          <p className="rotulo">Trabalhos executados</p>
          <h2 className="titulo-secao mt-6">Obras registradas em campo</h2>
          <p className="corpo mt-6">
            Fotografias de serviços realizados pela equipe da Engetec.
          </p>
        </Revelar>

        <ul className="mt-12 grid gap-4 lg:auto-rows-[17rem] lg:grid-cols-12">
          {galeria.map((item, indice) => (
            <Revelar
              como="li"
              key={item.src}
              tipo="escala"
              atraso={indice * 80}
              className={posicoes[indice]}
            >
              <button
                type="button"
                onClick={() => setAberta(indice)}
                className="group relative block h-full w-full overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-surface)] text-left"
                aria-label={`Ampliar foto: ${item.legenda}`}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover transition-transform duration-[var(--duration-image)] ease-[var(--ease-out)] group-hover:scale-[1.04]"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(16,13,12,0.92) 0%, rgba(16,13,12,0.15) 52%, rgba(16,13,12,0) 100%)",
                  }}
                  aria-hidden="true"
                />
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
                  <span className="text-[length:var(--text-ui)] font-medium leading-snug text-[var(--color-text-primary)]">
                    {item.legenda}
                  </span>
                  <span
                    className="mb-0.5 hidden h-8 w-8 flex-none items-center justify-center rounded-[var(--radius-small)] bg-[rgba(224,27,34,0.14)] text-[var(--color-text-primary)] transition-colors duration-[var(--duration-medium)] group-hover:bg-[var(--color-primary)] sm:flex"
                    aria-hidden="true"
                  >
                    <MaisIcone />
                  </span>
                </span>
              </button>
            </Revelar>
          ))}
        </ul>
      </div>

      <dialog
        ref={dialogo}
        onClose={() => setAberta(null)}
        onClick={(evento) => {
          if (evento.target === dialogo.current) fechar();
        }}
        className="m-auto max-h-[92dvh] w-[min(94vw,68rem)] bg-transparent p-0 backdrop:bg-[rgba(16,13,12,0.92)]"
        aria-label="Foto ampliada"
      >
        {foto && (
          <div className="relative">
            <div className="relative mx-auto flex max-h-[78dvh] items-center justify-center">
              <Image
                src={foto.src}
                alt={foto.alt}
                width={1400}
                height={1400}
                sizes="94vw"
                className="max-h-[78dvh] w-auto rounded-[var(--radius-card)] object-contain"
              />
            </div>

            <div className="mt-5 flex items-center justify-between gap-4">
              <p className="text-[length:var(--text-ui)] text-[var(--color-text-primary)]">
                {foto.legenda}
              </p>
              <div className="flex items-center gap-2">
                <BotaoDialogo rotulo="Foto anterior" aoClicar={() => navegar(-1)}>
                  <Seta className="h-5 w-5 rotate-180" />
                </BotaoDialogo>
                <BotaoDialogo rotulo="Próxima foto" aoClicar={() => navegar(1)}>
                  <Seta className="h-5 w-5" />
                </BotaoDialogo>
                <BotaoDialogo rotulo="Fechar" aoClicar={fechar}>
                  <Fechar className="h-5 w-5" />
                </BotaoDialogo>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}

function BotaoDialogo({
  children,
  rotulo,
  aoClicar,
}: {
  children: React.ReactNode;
  rotulo: string;
  aoClicar: () => void;
}) {
  return (
    <button
      type="button"
      onClick={aoClicar}
      aria-label={rotulo}
      className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-small)] border border-[var(--color-border-strong)] text-[var(--color-text-primary)] transition-[background-color,border-color,transform] duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)] active:scale-[0.95]"
    >
      {children}
    </button>
  );
}

function MaisIcone() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 6v12M6 12h12" />
    </svg>
  );
}
