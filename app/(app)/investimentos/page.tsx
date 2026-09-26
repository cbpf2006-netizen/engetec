import type { Metadata } from "next";
import { Layers, TrendingUp } from "lucide-react";

import { BotaoNovoLancamento } from "@/components/app/AcoesDeLancamento";
import { BarraDePeriodo } from "@/components/app/BarraDePeriodo";
import { Bloco, TituloDaPagina } from "@/components/app/Bloco";
import { CartaoIndicador } from "@/components/app/CartaoIndicador";
import { Distribuicao } from "@/components/app/Distribuicao";
import { EstadoVazio } from "@/components/app/EstadoVazio";
import { GerenciadorDeModelos } from "@/components/app/GerenciadorDeModelos";
import { ListaDeLancamentos } from "@/components/app/ListaDeLancamentos";
import { RoscaDeDistribuicao } from "@/components/graficos/RoscaDeDistribuicao";
import { contagemPorModelo, listarInvestimentos } from "@/lib/dados/lancamentos";
import { listarModelos } from "@/lib/dados/modelos";
import {
  aportesDoPeriodo,
  distribuirPorModelo,
  totalInvestido,
  variacaoRelativa,
} from "@/lib/financas";
import { moeda } from "@/lib/formato";
import { periodoAnterior, resolverPeriodo } from "@/lib/periodo";

export const metadata: Metadata = { title: "Investimentos" };

export default async function PaginaDeInvestimentos({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const periodo = resolverPeriodo(await searchParams);
  const anterior = periodoAnterior(periodo);

  /* Uma consulta só, com tudo até o fim do período: "total investido" é um
     estoque (soma toda a história) e "investido no período" é um fluxo
     (recorta o intervalo). Buscar as duas coisas separadamente seria duas
     idas ao banco para somar as mesmas linhas. */
  const [modelos, historico, usoPorModelo] = await Promise.all([
    listarModelos("investimento", true),
    listarInvestimentos({ ate: periodo.ate }),
    contagemPorModelo("investimento"),
  ]);

  const modelosAtivos = modelos.filter((modelo) => !modelo.arquivado);

  const doPeriodo = historico.filter(
    (item) => item.data >= periodo.de && item.data <= periodo.ate
  );

  const total = totalInvestido(historico, periodo.ate);
  const noPeriodo = aportesDoPeriodo(historico, periodo.de, periodo.ate);
  const noPeriodoAnterior = aportesDoPeriodo(historico, anterior.de, anterior.ate);

  /* A carteira é aporte menos resgate por tipo. Um tipo com resgate maior que
     o aporte fica negativo — ele aparece na lista (onde o número negativo se
     explica) e fica fora da rosca, porque fatia negativa não existe. */
  const carteira = distribuirPorModelo(
    historico.map((item) => ({
      modelo_id: item.modelo_id,
      valor: item.operacao === "aporte" ? item.valor : -item.valor,
    })),
    modelos
  );
  const carteiraPositiva = carteira.filter((fatia) => fatia.valor > 0);

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <TituloDaPagina
        titulo="Investimentos"
        apoio="O que saiu do caixa e virou patrimônio."
        acao={
          <BotaoNovoLancamento
            fluxo="investimento"
            modelos={modelosAtivos}
            rotulo="Novo investimento"
            tamanho="lg"
            className="hidden sm:inline-flex"
          />
        }
      />

      <BarraDePeriodo periodo={periodo} />

      {/* Dois cartões irmãos: mesmo layout, superfícies diferentes. O da
          direita é o estoque (não muda de tamanho com o período), e é isso
          que a diferença de fundo comunica. */}
      <div className="grid gap-4 sm:grid-cols-2">
        <CartaoIndicador
          rotulo="Investido no período"
          quantia={noPeriodo}
          icone={TrendingUp}
          tom="investimento"
          destaque
          comparacao={{
            fracao: variacaoRelativa(noPeriodo, noPeriodoAnterior),
            rotulo: "vs. período anterior",
            melhorSubindo: true,
          }}
        />

        <CartaoIndicador
          rotulo="Total investido"
          quantia={total}
          icone={Layers}
          tom="investimento"
          fundoSuave
          destaque
        />
      </div>

      {carteiraPositiva.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-5">
          <Bloco
            className="lg:col-span-3"
            titulo="Carteira por tipo"
            descricao="Aportes menos resgates acumulados em cada tipo."
          >
            <Distribuicao fatias={carteira} />
          </Bloco>

          <Bloco
            className="lg:col-span-2"
            titulo="Composição"
          >
            <RoscaDeDistribuicao
              fatias={carteiraPositiva}
              total={total}
              rotuloDoCentro="Investido"
            />
          </Bloco>
        </div>
      )}

      <Bloco
        titulo="Movimentações"
        descricao={`${periodo.rotulo} · aportes e resgates, mais recentes primeiro`}
        acao={
          <BotaoNovoLancamento
            fluxo="investimento"
            modelos={modelosAtivos}
            rotulo="Novo aporte"
            tamanho="sm"
          />
        }
        semPadding
      >
        <div className="border-t border-border">
          <ListaDeLancamentos
            fluxo="investimento"
            modelos={modelosAtivos}
            itens={doPeriodo.map((item) => ({
              id: item.id,
              modelo: item.modelo,
              valor: item.valor,
              data: item.data,
              observacao: item.observacao,
              operacao: item.operacao,
            }))}
            vazio={
              <EstadoVazio
                icone={TrendingUp}
                titulo="Nenhuma movimentação neste período"
                descricao={
                  total > 0
                    ? `Sua carteira soma ${moeda(total)} de períodos anteriores. Registre um aporte para movimentá-la.`
                    : "Registre o primeiro aporte. Ele sai do caixa livre e passa a contar como patrimônio."
                }
                acao={
                  <BotaoNovoLancamento
                    fluxo="investimento"
                    modelos={modelosAtivos}
                    rotulo="Registrar aporte"
                  />
                }
              />
            }
          />
        </div>
      </Bloco>

      <GerenciadorDeModelos
        fluxo="investimento"
        modelos={modelos}
        usoPorModelo={usoPorModelo}
      />
    </div>
  );
}
