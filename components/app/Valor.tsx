import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Quantia } from "./Quantia";
import type { Fluxo } from "@/lib/tipos";

/* =============================================================================
   Valor monetário

   Único componente autorizado a escrever dinheiro na tela. Duas razões:

   1. Tipografia. Todo valor sai em mono com largura tabular, para uma coluna
      de números alinhar dígito com dígito.

   2. Acessibilidade. Verde (entrada) e coral (saída) são justamente o par que
      o daltonismo deutan não separa. Por isso a cor NUNCA vem sozinha: quando
      o fluxo importa, o valor ganha sinal (+/−) e, opcionalmente, uma seta.
      Quem não distingue as cores continua lendo a informação.
   ========================================================================== */

const TAMANHOS = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-2xl",
  xl: "text-[1.75rem] leading-[1.15] sm:text-[2rem]",
} as const;

const CORES: Record<Fluxo | "neutro" | "auto", string> = {
  entrada: "text-entrada-texto",
  saida: "text-saida-texto",
  investimento: "text-investimento-texto",
  neutro: "text-foreground",
  auto: "",
};

export function Valor({
  quantia,
  fluxo = "neutro",
  tamanho = "md",
  sinal = false,
  seta = false,
  className,
}: {
  quantia: number;
  /** "auto" pinta pelo próprio sinal do número (saldo positivo/negativo). */
  fluxo?: Fluxo | "neutro" | "auto";
  tamanho?: keyof typeof TAMANHOS;
  sinal?: boolean;
  seta?: boolean;
  className?: string;
}) {
  const corAutomatica =
    fluxo === "auto" ? (quantia < 0 ? "text-saida-texto" : "text-foreground") : CORES[fluxo];

  const prefixo = sinal ? (fluxo === "saida" ? "−" : "+") : "";
  const Seta = fluxo === "saida" ? ArrowDownLeft : ArrowUpRight;

  return (
    <span
      className={cn(
        "numero inline-flex items-baseline gap-1 font-semibold",
        TAMANHOS[tamanho],
        corAutomatica,
        className
      )}
    >
      {seta && fluxo !== "neutro" && fluxo !== "auto" && (
        <Seta className="size-[0.9em] shrink-0 self-center" aria-hidden="true" />
      )}
      {prefixo}
      <Quantia valor={Math.abs(quantia)} />
    </span>
  );
}
