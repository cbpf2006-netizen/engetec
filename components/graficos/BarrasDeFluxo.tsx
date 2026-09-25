"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { moeda } from "@/lib/formato";
import type { PontoDaSerie } from "@/lib/financas";
import { CaixaDeTooltip, EIXO, Legenda, eixoDeValor } from "./base";

/* =============================================================================
   Entradas x saídas ao longo do período

   Barras agrupadas, um par por balde. Magnitude comparada lado a lado é
   exatamente o que barra faz melhor.

   · Um único eixo de valor. Dois eixos com escalas diferentes é o erro mais
     comum em gráfico financeiro: faz duas séries incomparáveis parecerem
     comparáveis.
   · Cantos arredondados só no topo (4px), ancorados na linha de base.
   · Grade apenas horizontal e discreta — ela ajuda a ler a altura, não
     compete com os dados.
   · Verde e coral não se distinguem em deutanopia: a legenda nomeia as duas
     séries e o tooltip repete os rótulos, então a leitura nunca depende da
     cor.
   ========================================================================== */

export function BarrasDeFluxo({
  serie,
  altura = 232,
}: {
  serie: PontoDaSerie[];
  altura?: number;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Legenda
        itens={[
          { rotulo: "Entradas", cor: "var(--entrada)" },
          { rotulo: "Saídas", cor: "var(--saida)" },
        ]}
      />

      <div style={{ height: altura }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={serie} margin={{ top: 4, right: 4, bottom: 0, left: -12 }} barGap={2}>
            <CartesianGrid vertical={false} stroke="var(--grade)" strokeDasharray="3 3" />

            <XAxis dataKey="rotulo" {...EIXO} interval="preserveStartEnd" minTickGap={12} />
            <YAxis {...EIXO} tickFormatter={eixoDeValor} width={64} />

            <Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.6 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const ponto = payload[0].payload as PontoDaSerie;
                return (
                  <CaixaDeTooltip
                    titulo={ponto.rotulo}
                    linhas={[
                      { rotulo: "Entradas", valor: ponto.entradas, cor: "var(--entrada)" },
                      { rotulo: "Saídas", valor: ponto.saidas, cor: "var(--saida)" },
                    ]}
                    rodape={`Resultado ${ponto.resultado < 0 ? "−" : "+"}${moeda(Math.abs(ponto.resultado))}`}
                  />
                );
              }}
            />

            <Bar dataKey="entradas" name="Entradas" fill="var(--entrada)" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="saidas" name="Saídas" fill="var(--saida)" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
