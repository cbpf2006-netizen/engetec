import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variante = "primario" | "contorno" | "contorno-claro" | "amarelo";
type Tamanho = "md" | "lg";

const base =
  "group inline-flex items-center justify-center gap-2.5 rounded-[var(--raio-sm)] font-semibold " +
  "transition-[transform,background-color,border-color,color] duration-[160ms] ease-[var(--saida)] " +
  "active:scale-[0.975] whitespace-nowrap";

const variantes: Record<Variante, string> = {
  primario:
    "bg-[var(--engetec-vermelho)] text-white hover:bg-[var(--engetec-vermelho-escuro)]",
  amarelo:
    "bg-[var(--engetec-amarelo)] text-[var(--tinta)] hover:bg-[#e8b200]",
  contorno:
    "border border-[var(--linha-clara)] text-[var(--texto-forte)] hover:border-[var(--engetec-vermelho)] hover:text-[var(--engetec-vermelho)]",
  "contorno-claro":
    "border border-[var(--linha-escura)] text-white hover:border-[var(--engetec-amarelo)] hover:text-[var(--engetec-amarelo)]",
};

const tamanhos: Record<Tamanho, string> = {
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-[3.25rem] px-7 text-base",
};

function classes(variante: Variante, tamanho: Tamanho, extra?: string) {
  return [base, variantes[variante], tamanhos[tamanho], extra]
    .filter(Boolean)
    .join(" ");
}

type BotaoLinkProps = {
  href: string;
  children: ReactNode;
  variante?: Variante;
  tamanho?: Tamanho;
  externo?: boolean;
  className?: string;
  "aria-label"?: string;
};

export function BotaoLink({
  href,
  children,
  variante = "primario",
  tamanho = "md",
  externo = false,
  className,
  ...resto
}: BotaoLinkProps) {
  const cls = classes(variante, tamanho, className);
  const protocolo = /^(tel:|mailto:|#)/.test(href);

  if (externo || protocolo) {
    return (
      <a
        href={href}
        target={externo ? "_blank" : undefined}
        rel={externo ? "noopener noreferrer" : undefined}
        className={cls}
        {...resto}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={cls} {...resto}>
      {children}
    </Link>
  );
}

type BotaoProps = ComponentPropsWithoutRef<"button"> & {
  variante?: Variante;
  tamanho?: Tamanho;
};

export function Botao({
  variante = "primario",
  tamanho = "md",
  className,
  children,
  ...resto
}: BotaoProps) {
  return (
    <button
      className={classes(
        variante,
        tamanho,
        `disabled:cursor-not-allowed disabled:opacity-55 disabled:active:scale-100 ${className ?? ""}`,
      )}
      {...resto}
    >
      {children}
    </button>
  );
}
