"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { PontoDaSerie } from "@/lib/financas";
import { CaixaDeTooltip, EIXO, eixoDeValor } from "./base";

/* =============================================================================
   Evolução do saldo

   Uma série só, contínua no tempo: é o caso da linha. A área abaixo dela
   existe apenas para dar peso visual à curva (14% de opacidade, sem
   gradiente decorativo) — o dado é a linha.

   Série única não leva legenda: o título do bloco já diz o que é.
   A linha do zero aparece quando o saldo cruza para negativo, porque aí ela
   passa a ser uma referência com significado.
   ========================================================================== */

export function LinhaDeSaldo({
  serie,
  altura = 208,
}: {
  serie: PontoDaSerie[];
  altura?: number;
}) {
  const cruzaZero = serie.some((ponto) => ponto.acumulado < 0);

  return (
    <div style={{ height: altura }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={serie} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
          <CartesianGrid vertical={false} stroke="var(--grade)" strokeDasharray="3 3" />

          <XAxis dataKey="rotulo" {...EIXO} interval="preserveStartEnd" minTickGap={12} />
          <YAxis {...EIXO} tickFormatter={eixoDeValor} width={64} />

          {cruzaZero && <ReferenceLine y={0} stroke="var(--border)" strokeWidth={1} />}

          <Tooltip
            cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeDasharray: "3 3" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const ponto = payload[0].payload as PontoDaSerie;
              return (
                <CaixaDeTooltip
                  titulo={ponto.rotulo}
                  linhas={[
                    { rotulo: "Saldo acumulado", valor: ponto.acumulado, cor: "var(--primary)", destaque: true },
                    { rotulo: "Resultado do período", valor: ponto.resultado },
                  ]}
                />
              );
            }}
          />

          <Area
            type="monotone"
            dataKey="acumulado"
            name="Saldo"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="var(--primary)"
            fillOpacity={0.14}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
