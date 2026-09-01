"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { empresa, linkWhatsapp, navegacao } from "@/lib/empresa";
import { Fechar, Menu, Whatsapp } from "@/components/ui/Icones";

export function Cabecalho() {
  const caminho = usePathname();
  const [rolou, setRolou] = useState(false);
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 16);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  useEffect(() => {
    if (!aberto) return;

    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setAberto(false);
    };

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", aoTeclar);

    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  const ativo = (href: string) =>
    href === "/" ? caminho === "/" : caminho.startsWith(href);

  return (
    <header
      className="fixed inset-x-0 top-0 z-[var(--z-sticky)] transition-[background-color,border-color,backdrop-filter] duration-300 ease-[var(--saida)]"
      style={{
        backgroundColor: rolou ? "rgba(250,248,248,0.92)" : "transparent",
        borderBottom: `1px solid ${rolou ? "var(--linha-clara)" : "transparent"}`,
        backdropFilter: rolou ? "saturate(1.4) blur(14px)" : "none",
      }}
    >
      <div className="envoltorio">
        <div
          className="flex items-center justify-between transition-[height] duration-300 ease-[var(--saida)]"
          style={{ height: rolou ? "4.25rem" : "5.5rem" }}
        >
          <Link
            href="/"
            className="flex items-center"
            aria-label={`${empresa.nome}, ir para a página inicial`}
          >
            <Image
              src="/img/logo.jpg"
              alt={`${empresa.nome} ${empresa.tagline}`}
              width={990}
              height={285}
              priority
              className="h-9 w-auto rounded-[2px] sm:h-11"
            />
          </Link>

          <nav
            aria-label="Navegação principal"
            className="hidden items-center gap-9 lg:flex"
          >
            {navegacao.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={ativo(item.href) ? "page" : undefined}
                className="group relative py-2 text-[0.9375rem] font-medium transition-colors duration-200"
                style={{
                  color: rolou
                    ? ativo(item.href)
                      ? "var(--engetec-vermelho)"
                      : "var(--texto-forte)"
                    : ativo(item.href)
                      ? "var(--engetec-amarelo)"
                      : "rgba(255,255,255,0.86)",
                }}
              >
                {item.rotulo}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 -bottom-0.5 h-[2px] origin-left scale-x-0 transition-transform duration-[260ms] ease-[var(--saida)] group-hover:scale-x-100"
                  style={{
                    background: rolou
                      ? "var(--engetec-vermelho)"
                      : "var(--engetec-amarelo)",
                    transform: ativo(item.href) ? "scaleX(1)" : undefined,
                  }}
                />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={linkWhatsapp()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-11 items-center gap-2.5 rounded-[var(--raio-sm)] bg-[var(--engetec-vermelho)] px-5 text-[0.9375rem] font-semibold text-white transition-[background-color,transform] duration-[160ms] ease-[var(--saida)] hover:bg-[var(--engetec-vermelho-escuro)] active:scale-[0.975] sm:inline-flex"
            >
              <Whatsapp className="h-[18px] w-[18px]" />
              Solicitar orçamento
            </a>

            <button
              type="button"
              onClick={() => setAberto(true)}
              aria-label="Abrir menu de navegação"
              aria-expanded={aberto}
              className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--raio-sm)] border transition-colors duration-200 lg:hidden"
              style={{
                borderColor: rolou ? "var(--linha-clara)" : "rgba(255,255,255,0.28)",
                color: rolou ? "var(--texto-forte)" : "#ffffff",
              }}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {aberto && <PainelMobile aoFechar={() => setAberto(false)} ativo={ativo} />}
    </header>
  );
}

function PainelMobile({
  aoFechar,
  ativo,
}: {
  aoFechar: () => void;
  ativo: (href: string) => boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-[var(--z-menu)] flex flex-col bg-[var(--tinta)] lg:hidden"
      style={{ animation: "escala-suave 240ms var(--saida)" }}
      role="dialog"
      aria-modal="true"
      aria-label="Menu de navegação"
    >
      <div className="envoltorio">
        <div className="flex h-[5.5rem] items-center justify-between">
          <Image
            src="/img/logo.jpg"
            alt={`${empresa.nome} ${empresa.tagline}`}
            width={990}
            height={285}
            className="h-9 w-auto rounded-[2px]"
          />
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar menu de navegação"
            className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--raio-sm)] border border-[var(--linha-escura)] text-white"
          >
            <Fechar className="h-6 w-6" />
          </button>
        </div>
      </div>

      <nav
        aria-label="Navegação principal"
        className="envoltorio flex flex-1 flex-col justify-center gap-1 pb-16"
      >
        {navegacao.map((item, indice) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={aoFechar}
            aria-current={ativo(item.href) ? "page" : undefined}
            className="flex items-baseline gap-4 border-b border-[var(--linha-escura-fraca)] py-5 text-[2rem] font-semibold tracking-[-0.035em] text-white transition-colors duration-200 hover:text-[var(--engetec-amarelo)]"
            style={{
              animation: `surgir 420ms var(--saida) ${60 + indice * 55}ms backwards`,
              color: ativo(item.href) ? "var(--engetec-amarelo)" : undefined,
            }}
          >
            <span className="font-mono text-xs font-medium tracking-[0.16em] text-[var(--texto-inverso-suave)]">
              0{indice + 1}
            </span>
            {item.rotulo}
          </Link>
        ))}

        <a
          href={linkWhatsapp()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-9 inline-flex h-14 items-center justify-center gap-2.5 rounded-[var(--raio-sm)] bg-[var(--engetec-vermelho)] px-6 font-semibold text-white"
          style={{ animation: "surgir 420ms var(--saida) 300ms backwards" }}
        >
          <Whatsapp className="h-5 w-5" />
          Solicitar orçamento
        </a>

        <a
          href={`tel:${empresa.telefoneLink}`}
          className="mt-4 text-center font-mono text-sm tracking-[0.08em] text-[var(--texto-inverso-suave)] transition-colors hover:text-white"
          style={{ animation: "surgir 420ms var(--saida) 340ms backwards" }}
        >
          {empresa.telefone}
        </a>
      </nav>
    </div>
  );
}
