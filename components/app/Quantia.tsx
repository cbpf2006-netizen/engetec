"use client";

import { cn } from "@/lib/utils";
import { partesDaMoeda } from "@/lib/formato";
import { MASCARA, useValoresOcultos } from "@/lib/valores-ocultos";

/* =============================================================================
   Quantia — o desenho de um valor em reais

   Mesmo texto que `moeda()`, com hierarquia: o inteiro carrega o peso, e o
   símbolo e os centavos recuam. Em "R$ 1.250,00" o olho procura o "1.250";
   "R$" e ",00" só precisam estar lá. O texto acessível continua sendo o valor
   inteiro, lido de uma vez.

   Com "ocultar valores" ligado, mostra "R$ ••••" no lugar — e o leitor de tela
   ouve "valor oculto", não o número. O atributo `data-valor` existe só na
   versão visível: é ele que o CSS de pré-pintura usa para esconder os valores
   antes de o React hidratar (ver lib/valores-ocultos.ts).
   ========================================================================== */

export function Quantia({
  valor,
  className,
}: {
  valor: number;
  className?: string;
}) {
  const ocultos = useValoresOcultos();

  if (ocultos) {
    return (
      <span className={cn("numero whitespace-nowrap", className)}>
        <span aria-hidden="true">{MASCARA}</span>
        <span className="sr-only">valor oculto</span>
      </span>
    );
  }

  const { negativo, simbolo, inteiro, centavos } = partesDaMoeda(valor);

  return (
    <span data-valor className={cn("numero whitespace-nowrap", className)}>
      {negativo && <span aria-hidden="true">−</span>}
      <span aria-hidden="true" className="mr-[0.2em] text-[0.62em] font-medium opacity-60">
        {simbolo}
      </span>
      <span aria-hidden="true">{inteiro}</span>
      <span aria-hidden="true" className="text-[0.62em] font-medium opacity-60">
        {centavos}
      </span>
      <span className="sr-only">
        {negativo ? "menos " : ""}
        {inteiro}
        {centavos} reais
      </span>
    </span>
  );
}
