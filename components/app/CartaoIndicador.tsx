import type { ReactNode } from "react";
import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { moeda, variacao } from "@/lib/formato";
import { Skeleton } from "@/components/ui/skeleton";

/* =============================================================================
   Cartão de indicador

   O cartão padrão do app: rótulo, valor grande, um indicador secundário e um
   ícone. Todos os números de topo de página usam este componente — é o que
   mantém os quatro cartões do painel visualmente idênticos em vez de "quase
   iguais".

   `tom` muda só o ícone e o realce, nunca o fundo inteiro: quatro cartões
   coloridos lado a lado competem entre si e nenhum vira hierarquia.
   ========================================================================== */

export type TomDoCartao = "neutro" | "entrada" | "saida" | "investimento" | "alerta";

const TONS: Record<TomDoCartao, { selo: string; valor: string; fundo: string }> = {
  neutro: {
    selo: "bg-secondary text-muted-foreground",
    valor: "text-foreground",
    fundo: "bg-secondary",
  },
  entrada: {
    selo: "bg-entrada-suave text-entrada-texto",
    valor: "text-entrada-texto",
    fundo: "bg-entrada-suave",
  },
  saida: {
    selo: "bg-saida-suave text-saida-texto",
    valor: "text-saida-texto",
    fundo: "bg-saida-suave",
  },
  investimento: {
    selo: "bg-investimento-suave text-investimento-texto",
    valor: "text-investimento-texto",
    fundo: "bg-investimento-suave",
  },
  alerta: {
    selo: "bg-alerta-suave text-alerta-texto",
    valor: "text-alerta-texto",
    fundo: "bg-alerta-suave",
  },
};

export function CartaoIndicador({
  rotulo,
  quantia,
  icone: Icone,
  tom = "neutro",
  comparacao,
  contexto,
  destaque = false,
  fundoSuave = false,
  className,
  children,
}: {
  rotulo: string;
  quantia: number;
  icone: LucideIcon;
  tom?: TomDoCartao;
  /** Variação em relação ao período anterior. `null` = sem base de
      comparação (não existe "+∞%"). */
  comparacao?: { fracao: number | null; rotulo: string; melhorSubindo?: boolean };
  contexto?: ReactNode;
  /** Cartão-herói: valor maior. Um por tela, no máximo. */
  destaque?: boolean;
  /** Superfície tingida com o tom, para diferenciar dois cartões irmãos sem
      mudar o layout (é o caso de "no período" x "total" em Investimentos). */
  fundoSuave?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const estilo = TONS[tom];

  return (
    <article
      className={cn(
        "group relative flex flex-col gap-4 rounded-2xl p-5 ring-1 ring-border transition-shadow duration-200 hover:ring-foreground/15",
        fundoSuave ? estilo.fundo : "bg-card",
        className
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <h3
          className={cn(
            "text-sm font-medium",
            fundoSuave ? "text-foreground/70" : "text-muted-foreground"
          )}
        >
          {rotulo}
        </h3>
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-xl",
            fundoSuave ? "bg-card/70 text-current" : estilo.selo,
            fundoSuave && estilo.valor
          )}
        >
          <Icone className="size-[1.05rem]" aria-hidden="true" />
        </span>
      </header>

      <div className="flex flex-col gap-2">
        <p
          className={cn(
            "numero font-semibold tracking-tight",
            destaque ? "text-[1.875rem] leading-[1.1] sm:text-[2.125rem]" : "text-2xl leading-tight",
            estilo.valor
          )}
        >
          {moeda(quantia)}
        </p>

        {comparacao && <Comparacao {...comparacao} />}
        {contexto && <p className="text-xs leading-relaxed text-muted-foreground">{contexto}</p>}
      </div>

      {children}
    </article>
  );
}

function Comparacao({
  fracao,
  rotulo,
  melhorSubindo = true,
}: {
  fracao: number | null;
  rotulo: string;
  melhorSubindo?: boolean;
}) {
  if (fracao === null) {
    return null;
  }

  const subiu = fracao > 0;
  const bom = subiu === melhorSubindo;
  const Seta = subiu ? TrendingUp : TrendingDown;

  return (
    <p className="flex items-center gap-1.5 text-xs">
      <span
        className={cn(
          "inline-flex items-center gap-1 font-medium",
          fracao === 0
            ? "text-muted-foreground"
            : bom
              ? "text-entrada-texto"
              : "text-saida-texto"
        )}
      >
        {fracao !== 0 && <Seta className="size-3.5" aria-hidden="true" />}
        <span className="numero">{variacao(fracao)}</span>
      </span>
      <span className="text-muted-foreground">{rotulo}</span>
    </p>
  );
}

export function CartaoIndicadorEsqueleto() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 ring-1 ring-border">
      <div className="flex items-start justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-9 rounded-xl" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  );
}
