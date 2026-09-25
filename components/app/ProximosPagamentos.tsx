import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { data as formatarData, moeda } from "@/lib/formato";
import type { PagamentoProximo } from "@/lib/dados/painel";

/* =============================================================================
   Próximos pagamentos (painel)

   Ordenado por vencimento, com o atraso em destaque. O prazo é escrito em
   palavras ("vence em 3 dias", "atrasada há 2 dias") porque é assim que a
   informação é usada — ninguém calcula a diferença entre hoje e uma data
   enquanto confere o painel.
   ========================================================================== */

export function ProximosPagamentos({ pagamentos }: { pagamentos: PagamentoProximo[] }) {
  return (
    <div className="flex flex-1 flex-col">
      <ul className="flex flex-1 flex-col divide-y divide-border">
        {pagamentos.map((pagamento) => (
          <li key={pagamento.id} className="flex items-center gap-3 py-2.5">
            <span
              aria-hidden="true"
              className={cn(
                "h-8 w-1 shrink-0 rounded-full",
                pagamento.situacao === "atrasado" ? "bg-saida" : "bg-alerta"
              )}
            />

            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium">{pagamento.nome}</span>
              <span
                className={cn(
                  "text-xs",
                  pagamento.situacao === "atrasado"
                    ? "text-saida-texto"
                    : "text-muted-foreground"
                )}
              >
                {rotuloDoPrazo(pagamento)}
              </span>
            </div>

            <span className="numero shrink-0 text-sm font-semibold">{moeda(pagamento.valor)}</span>
          </li>
        ))}
      </ul>

      <Button
        variant="ghost"
        size="sm"
        className="mt-3 self-start text-muted-foreground hover:text-foreground"
        render={<Link href="/contas" />}
      >
        Ver contas a pagar
        <ArrowRight />
      </Button>
    </div>
  );
}

function rotuloDoPrazo(pagamento: PagamentoProximo): string {
  const dias = pagamento.diasRestantes;

  if (dias < 0) {
    const atraso = Math.abs(dias);
    return atraso === 1 ? "Atrasada há 1 dia" : `Atrasada há ${atraso} dias`;
  }
  if (dias === 0) return "Vence hoje";
  if (dias === 1) return "Vence amanhã";
  if (dias <= 30) return `Vence em ${dias} dias`;
  return `Vence em ${formatarData(pagamento.vencimento)}`;
}
