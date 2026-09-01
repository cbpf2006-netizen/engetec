import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

/**
 * Hierarquia de ação do sistema Engetec.
 * `primario` é sólido e único por dobra. `secundario` acompanha o primário.
 * `fantasma` é ação de baixa prioridade. Raio sempre --radius-small, nunca pill.
 */
type Variante = "primario" | "secundario" | "fantasma";
type Tamanho = "md" | "lg";

const base =
  "group inline-flex items-center justify-center gap-2.5 font-medium " +
  "transition-[transform,background-color,border-color,color] duration-[var(--duration-fast)] " +
  "ease-[var(--ease-out)] active:scale-[0.975] whitespace-nowrap";

const variantes: Record<Variante, string> = {
  primario:
    "rounded-[var(--radius-small)] bg-[var(--color-primary)] text-[var(--color-text-primary)] " +
    "hover:bg-[var(--color-primary-dark)]",
  secundario:
    "rounded-[var(--radius-small)] border border-[var(--color-border-strong)] " +
    "text-[var(--color-text-primary)] hover:border-[var(--color-secondary)] " +
    "hover:text-[var(--color-secondary)]",
  fantasma:
    "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
};

const tamanhos: Record<Tamanho, string> = {
  md: "h-11 px-5 text-[length:var(--text-ui)]",
  lg: "h-[52px] px-7 text-[length:var(--text-ui)]",
};

function classes(variante: Variante, tamanho: Tamanho, extra?: string) {
  const dimensao = variante === "fantasma" ? "" : tamanhos[tamanho];
  return [base, variantes[variante], dimensao, extra].filter(Boolean).join(" ");
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

/**
 * Gatilho "ir para" que acompanha títulos de card.
 * 32x32, --radius-small, preenchimento vermelho translúcido.
 */
export function BotaoSeta({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={
        "inline-flex h-8 w-8 flex-none items-center justify-center rounded-[var(--radius-small)] " +
        "bg-[rgba(224,27,34,0.14)] text-[var(--color-text-primary)] " +
        "transition-[background-color,transform] duration-[var(--duration-medium)] " +
        "ease-[var(--ease-out)] group-hover:bg-[var(--color-primary)] " +
        "group-hover:translate-x-0.5 group-hover:-translate-y-0.5 " +
        (className ?? "")
      }
    >
      {children}
    </span>
  );
}
