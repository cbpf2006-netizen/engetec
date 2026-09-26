import { cn } from "@/lib/utils";
import { partesDaMoeda } from "@/lib/formato";

/* =============================================================================
   Quantia — o desenho de um valor em reais

   Mesmo texto que `moeda()`, com hierarquia: o inteiro carrega o peso, e o
   símbolo e os centavos recuam. Em "R$ 1.250,00" o olho procura o "1.250";
   "R$" e ",00" só precisam estar lá. O texto acessível continua sendo o valor
   inteiro, lido de uma vez.
   ========================================================================== */

export function Quantia({
  valor,
  className,
}: {
  valor: number;
  className?: string;
}) {
  const { negativo, simbolo, inteiro, centavos } = partesDaMoeda(valor);

  return (
    <span className={cn("numero whitespace-nowrap", className)}>
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
