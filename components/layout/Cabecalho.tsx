"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { empresa, linkWhatsapp, navegacao } from "@/lib/empresa";
import { Fechar, Menu, Whatsapp } from "@/components/ui/Icones";

/**
 * Barra fixa. 88px no topo, 68px após rolagem.
 * No topo é transparente sobre o canvas escuro. Após 16px de rolagem ganha
 * fundo a 92% com blur, que é a única ocorrência de backdrop-filter permitida.
 */
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
      className="fixed inset-x-0 top-0 z-[var(--z-sticky)] transition-[background-color,border-color,backdrop-filter] duration-300 ease-[var(--ease-out)]"
      style={{
        backgroundColor: rolou ? "rgba(23,20,19,0.92)" : "transparent",
        borderBottom: `1px solid ${rolou ? "var(--color-border)" : "transparent"}`,
        backdropFilter: rolou ? "saturate(1.3) blur(14px)" : "none",
      }}
    >
      <div className="envoltorio">
        <div
          className="flex items-center justify-between transition-[height] duration-300 ease-[var(--ease-out)]"
          style={{ height: rolou ? "68px" : "88px" }}
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
              className="h-9 w-auto rounded-[var(--radius-small)] sm:h-11"
            />
          </Link>

          <nav
            aria-label="Navegação principal"
            className="hidden items-center gap-6 lg:flex"
          >
            {navegacao.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={ativo(item.href) ? "page" : undefined}
                className="group relative py-2 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[var(--tracking-label)] transition-colors duration-200"
                style={{
                  color: ativo(item.href)
                    ? "var(--color-text-primary)"
                    : "var(--color-text-secondary)",
                }}
              >
                {item.rotulo}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 -bottom-0.5 h-[2px] origin-left bg-[var(--color-secondary)] transition-transform duration-[var(--duration-medium)] ease-[var(--ease-out)] group-hover:scale-x-100"
                  style={{ transform: ativo(item.href) ? "scaleX(1)" : "scaleX(0)" }}
                />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={linkWhatsapp()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-11 items-center gap-2.5 rounded-[var(--radius-small)] bg-[var(--color-primary)] px-5 text-[length:var(--text-ui)] font-medium text-[var(--color-text-primary)] transition-[background-color,transform] duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-[var(--color-primary-dark)] active:scale-[0.975] sm:inline-flex"
            >
              <Whatsapp className="h-[18px] w-[18px]" />
              Solicitar orçamento
            </a>

            <button
              type="button"
              onClick={() => setAberto(true)}
              aria-label="Abrir menu de navegação"
              aria-expanded={aberto}
              className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-small)] border border-[var(--color-border-strong)] text-[var(--color-text-primary)] transition-colors duration-200 hover:border-[var(--color-secondary)] lg:hidden"
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
      className="fixed inset-0 z-[var(--z-menu)] flex flex-col bg-[var(--color-background-deep)] lg:hidden"
      style={{ animation: "escala-suave 240ms var(--ease-out)" }}
      role="dialog"
      aria-modal="true"
      aria-label="Menu de navegação"
    >
      <div className="envoltorio">
        <div className="flex h-[88px] items-center justify-between">
          <Image
            src="/img/logo.jpg"
            alt={`${empresa.nome} ${empresa.tagline}`}
            width={990}
            height={285}
            className="h-9 w-auto rounded-[var(--radius-small)]"
          />
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar menu de navegação"
            className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-small)] border border-[var(--color-border-strong)] text-[var(--color-text-primary)]"
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
            className="flex items-baseline gap-5 border-b border-[var(--color-border-hairline)] py-5 text-[length:var(--fluid-h3)] font-medium tracking-[var(--tracking-heading)] transition-colors duration-200 hover:text-[var(--color-secondary)]"
            style={{
              animation: `surgir 420ms var(--ease-out) ${60 + indice * 55}ms backwards`,
              color: ativo(item.href)
                ? "var(--color-secondary)"
                : "var(--color-text-primary)",
            }}
          >
            <span className="font-mono text-[length:var(--text-label)] font-medium tracking-[var(--tracking-label)] text-[var(--color-text-secondary)]">
              0{indice + 1}
            </span>
            {item.rotulo}
          </Link>
        ))}

        <a
          href={linkWhatsapp()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex h-[52px] items-center justify-center gap-2.5 rounded-[var(--radius-small)] bg-[var(--color-primary)] px-7 text-[length:var(--text-ui)] font-medium text-[var(--color-text-primary)]"
          style={{ animation: "surgir 420ms var(--ease-out) 300ms backwards" }}
        >
          <Whatsapp className="h-5 w-5" />
          Solicitar orçamento
        </a>

        <a
          href={`tel:${empresa.telefoneLink}`}
          className="mt-5 text-center font-mono text-[length:var(--text-meta)] uppercase tracking-[var(--tracking-meta)] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
          style={{ animation: "surgir 420ms var(--ease-out) 340ms backwards" }}
        >
          {empresa.telefone}
        </a>
      </nav>
    </div>
  );
}
