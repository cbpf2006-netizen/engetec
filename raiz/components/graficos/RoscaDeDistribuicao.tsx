"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { moeda, porcentagem } from "@/lib/formato";
import { corDoModelo } from "@/lib/catalogo";
import type { FatiaDistribuicao } from "@/lib/financas";
import { CaixaDeTooltip, Legenda } from "./base";

/* =============================================================================
   Rosca de distribuição

   Responde "de onde vem / para onde vai", que é identidade por categoria —
   o caso em que a rosca funciona. Três decisões de leitura:

   · No máximo 8 fatias. A 9ª em diante vira "Outros", em cinza. Cor
     categórica não se cicla: duas fatias da mesma cor mentiriam sobre serem
     a mesma coisa.

   · 2px de respiro entre fatias, na cor da superfície. Sem isso, duas fatias
     vizinhas de matiz próxima viram um bloco só.

   · Legenda sempre presente, com valor ao lado. A rosca dá a proporção; quem
     precisa do número exato lê na legenda ou na lista acima, sem depender de
     passar o mouse (e sem depender de distinguir as cores).
   ========================================================================== */

const MAXIMO_DE_FATIAS = 8;

type FatiaDoGrafico = { nome: string; valor: number; fracao: number; cor: string };

function prepararFatias(fatias: FatiaDistribuicao[]): FatiaDoGrafico[] {
  const visiveis = fatias.slice(0, MAXIMO_DE_FATIAS).map((fatia) => ({
    nome: fatia.nome,
    valor: fatia.valor,
    fracao: fatia.fracao,
    cor: corDoModelo(fatia.cor),
  }));

  const resto = fatias.slice(MAXIMO_DE_FATIAS);
  if (resto.length === 0) return visiveis;

  return [
    ...visiveis,
    {
      nome: `Outros (${resto.length})`,
      valor: resto.reduce((soma, f) => soma + f.valor, 0),
      fracao: resto.reduce((soma, f) => soma + f.fracao, 0),
      cor: "var(--muted-foreground)",
    },
  ];
}

export function RoscaDeDistribuicao({
  fatias,
  total,
  rotuloDoCentro,
  altura = 216,
}: {
  fatias: FatiaDistribuicao[];
  total: number;
  rotuloDoCentro: string;
  altura?: number;
}) {
  const dados = prepararFatias(fatias);

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <div className="relative mx-auto w-full max-w-[15rem] shrink-0 sm:mx-0" style={{ height: altura }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dados}
              dataKey="valor"
              nameKey="nome"
              innerRadius="64%"
              outerRadius="94%"
              paddingAngle={dados.length > 1 ? 2 : 0}
              startAngle={90}
              endAngle={-270}
              strokeWidth={2}
              stroke="var(--card)"
              isAnimationActive={false}
            >
              {dados.map((fatia) => (
                <Cell key={fatia.nome} fill={fatia.cor} />
              ))}
            </Pie>

            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const fatia = payload[0].payload as FatiaDoGrafico;
                return (
                  <CaixaDeTooltip
                    titulo={fatia.nome}
                    linhas={[{ rotulo: porcentagem(fatia.fracao), valor: fatia.valor, cor: fatia.cor, destaque: true }]}
                  />
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Número no miolo: a rosca dá a proporção, o centro dá o total. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5 text-center">
          <span className="text-[0.6875rem] font-medium tracking-wide text-muted-foreground uppercase">
            {rotuloDoCentro}
          </span>
          <span className="numero text-base font-semibold">{moeda(total)}</span>
        </div>
      </div>

      <Legenda
        className="flex-1 sm:flex-col sm:items-start sm:gap-2.5"
        itens={dados.map((fatia) => ({
          rotulo: fatia.nome,
          cor: fatia.cor,
          valor: porcentagem(fatia.fracao),
        }))}
      />
    </div>
  );
}
