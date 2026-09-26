import { corDoModelo } from "@/lib/catalogo";
import { porcentagem } from "@/lib/formato";
import { Quantia } from "./Quantia";
import type { FatiaDistribuicao } from "@/lib/financas";
import { SeloModelo } from "@/components/Icone";

/* =============================================================================
   Distribuição por modelo

   Lista ordenada do maior para o menor, com uma barra proporcional ao total.
   É a mesma informação da rosca em forma de tabela — e é ela que cumpre a
   regra de acessibilidade: quem não distingue as cores do gráfico lê os
   números exatos aqui.

   A barra é normalizada pelo MAIOR valor, não pelo total: com uma fatia de
   80% todas as outras virariam fios invisíveis. A proporção real fica no
   número ao lado.
   ========================================================================== */

export function Distribuicao({ fatias }: { fatias: FatiaDistribuicao[] }) {
  const maior = Math.max(...fatias.map((f) => f.valor), 0);

  return (
    <ol className="flex flex-col">
      {fatias.map((fatia, indice) => {
        const cor = corDoModelo(fatia.cor);
        const largura = maior > 0 ? Math.max((fatia.valor / maior) * 100, 2) : 0;

        return (
          <li
            key={fatia.modeloId ?? "sem-modelo"}
            className="flex items-center gap-3 border-b border-border py-3 last:border-b-0"
          >
            <SeloModelo icone={fatia.icone} cor={fatia.cor} tamanho="sm" />

            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-sm font-medium">{fatia.nome}</span>
                <Quantia valor={fatia.valor} className="shrink-0 text-sm font-semibold" />
              </div>

              <div className="flex items-center gap-2.5">
                <div
                  className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary"
                  role="presentation"
                >
                  <div
                    className="h-full rounded-full transition-[width] duration-500 ease-out"
                    style={{ width: `${largura}%`, background: cor }}
                  />
                </div>
                <span className="numero w-12 shrink-0 text-right text-xs text-muted-foreground">
                  {porcentagem(fatia.fracao)}
                </span>
              </div>
            </div>

            {indice === 0 && fatias.length > 1 && (
              <span className="sr-only">Maior valor do período</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
