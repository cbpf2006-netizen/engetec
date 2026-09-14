import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/* =============================================================================
   Estados de vazio, carregando e erro

   Vazio não é "falta dado": é um lugar onde a próxima ação fica óbvia. Todo
   estado vazio do app diz o que aquela área mostra quando tiver conteúdo e
   oferece o botão que a preenche.
   ========================================================================== */

export function EstadoVazio({
  icone: Icone,
  titulo,
  descricao,
  acao,
  compacto = false,
  className,
}: {
  icone: LucideIcon;
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
  compacto?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-center",
        compacto ? "px-4 py-8" : "px-6 py-14",
        className
      )}
    >
      <span className="grid size-11 place-items-center rounded-2xl bg-secondary text-muted-foreground">
        <Icone className="size-5" aria-hidden="true" />
      </span>

      <div className="flex max-w-sm flex-col gap-1.5">
        <p className="text-sm font-medium text-foreground">{titulo}</p>
        {descricao && (
          <p className="text-sm leading-relaxed text-muted-foreground">{descricao}</p>
        )}
      </div>

      {acao && <div className="mt-1 flex flex-wrap justify-center gap-2">{acao}</div>}
    </div>
  );
}

export function EstadoDeErro({
  titulo = "Não conseguimos carregar esta parte",
  descricao = "Pode ter sido a conexão. Tente recarregar a página.",
  acao,
}: {
  titulo?: string;
  descricao?: string;
  acao?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <div className="flex max-w-sm flex-col gap-1.5">
        <p className="text-sm font-medium text-foreground">{titulo}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{descricao}</p>
      </div>
      {acao}
    </div>
  );
}

/** Esqueleto de lista: mesma altura e mesmo ritmo das linhas reais, para o
    conteúdo não "pular" quando chega. */
export function EsqueletoDeLista({ linhas = 4 }: { linhas?: number }) {
  return (
    <ul className="divide-y divide-border" aria-hidden="true">
      {Array.from({ length: linhas }).map((_, indice) => (
        <li key={indice} className="flex items-center gap-3 px-5 py-3.5">
          <Skeleton className="size-10 rounded-[0.625rem]" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-4 w-20" />
        </li>
      ))}
    </ul>
  );
}

export function EsqueletoDeGrafico({ altura = 240 }: { altura?: number }) {
  return (
    <div className="flex items-end gap-2 px-5 pb-5" style={{ height: altura }} aria-hidden="true">
      {[0.45, 0.75, 0.35, 0.9, 0.6, 0.5, 0.8].map((fracao, indice) => (
        <Skeleton key={indice} className="flex-1 rounded-t-md" style={{ height: `${fracao * 100}%` }} />
      ))}
    </div>
  );
}
