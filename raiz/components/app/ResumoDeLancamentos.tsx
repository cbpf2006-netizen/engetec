import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SeloModelo } from "@/components/Icone";
import { Valor } from "./Valor";
import { dataCurta } from "@/lib/formato";
import type { Fluxo } from "@/lib/tipos";

/* =============================================================================
   Lista compacta de lançamentos (painel)

   Somente leitura: no painel a pessoa está conferindo, não editando. Editar e
   excluir ficam na aba do fluxo, onde a lista completa vive — assim cada linha
   aqui pode ser mais baixa e caber mais informação na primeira tela.
   ========================================================================== */

export type ItemResumido = {
  id: string;
  nome: string;
  icone: string;
  cor: string;
  valor: number;
  data: string;
  observacao: string | null;
};

export function ResumoDeLancamentos({
  itens,
  fluxo,
  href,
}: {
  itens: ItemResumido[];
  fluxo: Fluxo;
  href: string;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <ul className="flex flex-1 flex-col divide-y divide-border">
        {itens.map((item) => (
          <li key={item.id} className="flex items-center gap-3 py-2.5">
            <SeloModelo icone={item.icone} cor={item.cor} tamanho="sm" />

            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium">{item.nome}</span>
              <span className="truncate text-xs text-muted-foreground">
                {item.observacao || dataCurta(item.data)}
              </span>
            </div>

            <Valor quantia={item.valor} fluxo={fluxo} sinal className="shrink-0 text-sm" />
          </li>
        ))}
      </ul>

      <Button
        variant="ghost"
        size="sm"
        className="mt-3 self-start text-muted-foreground hover:text-foreground"
        render={<Link href={href} />}
      >
        Ver todas
        <ArrowRight />
      </Button>
    </div>
  );
}
