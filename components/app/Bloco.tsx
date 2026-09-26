import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/* =============================================================================
   Bloco — a superfície de conteúdo do app

   Um cartão com cabeçalho opcional. Usado para listas, gráficos e grupos de
   formulário. Não aninha: um Bloco dentro de outro cria duas molduras
   competindo pela mesma informação, então quando precisar separar algo lá
   dentro, use divisória ou espaço.
   ========================================================================== */

export function Bloco({
  titulo,
  descricao,
  acao,
  semPadding = false,
  className,
  children,
}: {
  titulo?: ReactNode;
  descricao?: ReactNode;
  acao?: ReactNode;
  /** Para listas e gráficos, que encostam nas bordas. */
  semPadding?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl bg-card shadow-cartao ring-1 ring-border",
        className
      )}
    >
      {(titulo || acao) && (
        <header className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 pb-4">
          <div className="flex min-w-0 flex-col gap-1">
            {titulo && (
              <h2 className="text-base leading-snug font-semibold tracking-tight">
                {titulo}
              </h2>
            )}
            {descricao && (
              <p className="text-xs leading-relaxed text-muted-foreground">{descricao}</p>
            )}
          </div>
          {acao && <div className="flex shrink-0 items-center gap-2">{acao}</div>}
        </header>
      )}

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col",
          // Sem cabeçalho, o conteúdo precisa do respiro de cima que o
          // cabeçalho daria.
          !semPadding && "px-5 pb-5",
          !semPadding && !titulo && !acao && "pt-5"
        )}
      >
        {children}
      </div>
    </section>
  );
}

/** Cabeçalho de página: título grande + linha de apoio. */
export function TituloDaPagina({
  titulo,
  apoio,
  acao,
  acaoNoCanto = false,
}: {
  titulo: string;
  apoio?: ReactNode;
  acao?: ReactNode;
  /** Prende a ação no canto superior direito, mesmo no celular. Sem isto, a
      ação quebra para uma linha própria quando o título é longo. */
  acaoNoCanto?: boolean;
}) {
  return (
    <header
      className={
        acaoNoCanto
          ? "flex items-start justify-between gap-4"
          : "flex flex-wrap items-end justify-between gap-4"
      }
    >
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-[1.375rem] font-semibold tracking-tight sm:text-[1.75rem]">{titulo}</h1>
        {apoio && <p className="text-sm text-muted-foreground">{apoio}</p>}
      </div>
      {acao && <div className="flex shrink-0 items-center gap-2">{acao}</div>}
    </header>
  );
}
