"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { SECOES, secaoAtiva } from "@/lib/navegacao";

/* =============================================================================
   Navegação da barra lateral (desktop)

   O item ativo é marcado por fundo, peso e uma barra vertical à esquerda —
   três sinais, porque só o fundo esverdeado se perde em telas de baixo
   contraste. `aria-current="page"` faz o mesmo trabalho para leitores de
   tela.
   ========================================================================== */

export function NavegacaoLateral({ aoNavegar }: { aoNavegar?: () => void }) {
  const caminho = usePathname();

  return (
    <nav aria-label="Seções" className="flex flex-col gap-1">
      {SECOES.map((secao) => {
        const ativa = secaoAtiva(caminho, secao.href);

        return (
          <Link
            key={secao.href}
            href={secao.href}
            onClick={aoNavegar}
            aria-current={ativa ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-150",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              ativa
                ? "bg-accent font-semibold text-accent-foreground"
                : "font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary transition-transform duration-200",
                ativa ? "scale-y-100" : "scale-y-0"
              )}
            />
            <secao.icone className={cn("size-[1.125rem] shrink-0", ativa && "text-primary")} />
            {secao.rotulo}
          </Link>
        );
      })}
    </nav>
  );
}
