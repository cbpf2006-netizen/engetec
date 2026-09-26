"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { moedaCompacta } from "@/lib/formato";
import { useMoeda, useValoresOcultos } from "@/lib/valores-ocultos";

/* =============================================================================
   Peças comuns dos gráficos

   O tooltip e a legenda são nossos, não os da biblioteca: os padrões do
   Recharts vêm com fundo branco fixo (ilegível no tema escuro), sombra forte
   e a cor da série aplicada ao texto. Texto usa token de tinta; a cor da
   série aparece só no marcador ao lado.
   ========================================================================== */

export const EIXO = {
  stroke: "var(--muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const;

export function eixoDeValor(valor: number): string {
  return moedaCompacta(valor);
}

/** Rótulo do eixo de valor que respeita "ocultar valores": escondidos, o eixo
    fica sem números (as barras continuam mostrando a proporção). */
export function useEixoDeValor(): (valor: number) => string {
  const ocultos = useValoresOcultos();
  return (valor) => (ocultos ? "" : moedaCompacta(valor));
}

export type LinhaDeTooltip = {
  rotulo: string;
  valor: number;
  cor?: string;
  destaque?: boolean;
};

export function CaixaDeTooltip({
  titulo,
  linhas,
  rodape,
}: {
  titulo: ReactNode;
  linhas: LinhaDeTooltip[];
  rodape?: ReactNode;
}) {
  const moeda = useMoeda();

  return (
    <div className="pointer-events-none min-w-44 rounded-xl bg-popover p-3 text-popover-foreground ring-1 ring-border shadow-lg">
      <p className="mb-2 text-xs font-medium text-muted-foreground">{titulo}</p>

      <ul className="flex flex-col gap-1.5">
        {linhas.map((linha) => (
          <li key={linha.rotulo} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-2">
              {linha.cor && (
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 rounded-full"
                  style={{ background: linha.cor }}
                />
              )}
              <span className={cn(linha.destaque ? "font-medium" : "text-muted-foreground")}>
                {linha.rotulo}
              </span>
            </span>
            <span className="numero font-medium">{moeda(linha.valor)}</span>
          </li>
        ))}
      </ul>

      {rodape && (
        <p className="mt-2 border-t border-border pt-2 text-xs text-muted-foreground">{rodape}</p>
      )}
    </div>
  );
}

/** Legenda em texto — presente sempre que houver duas séries ou mais, para a
    identidade nunca depender só da cor. */
export function Legenda({
  itens,
  className,
}: {
  itens: { rotulo: string; cor: string; valor?: string }[];
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", className)}>
      {itens.map((item) => (
        <li key={item.rotulo} className="flex items-center gap-2 text-xs text-muted-foreground">
          <span
            aria-hidden="true"
            className="size-2.5 shrink-0 rounded-[3px]"
            style={{ background: item.cor }}
          />
          <span>{item.rotulo}</span>
          {item.valor && <span className="numero text-foreground">{item.valor}</span>}
        </li>
      ))}
    </ul>
  );
}
