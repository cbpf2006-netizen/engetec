import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

import { BarraDePeriodo } from "./BarraDePeriodo";
import { Bloco, TituloDaPagina } from "./Bloco";
import { CartaoIndicador } from "./CartaoIndicador";
import { Distribuicao } from "./Distribuicao";
import { EstadoVazio } from "./EstadoVazio";
import { GerenciadorDeModelos } from "./GerenciadorDeModelos";
import { ListaDeLancamentos } from "./ListaDeLancamentos";
import { BotaoNovoLancamento } from "./AcoesDeLancamento";
import { RoscaDeDistribuicao } from "@/components/graficos/RoscaDeDistribuicao";
import { contagemPorModelo, listarTransacoes } from "@/lib/dados/lancamentos";
import { listarModelos } from "@/lib/dados/modelos";
import { distribuirPorModelo, somar, variacaoRelativa } from "@/lib/financas";
import { periodoAnterior, type Periodo } from "@/lib/periodo";
import { ROTULO_FLUXO_PLURAL, type Fluxo } from "@/lib/tipos";

/* =============================================================================
   Página de fluxo — Entradas e Saídas

   As duas abas têm a mesma anatomia: card do período, distribuição por modelo
   (lista + rosca), lista de lançamentos e gerenciador de modelos. Uma página
   parametrizada em vez de duas quase iguais: a próxima mudança de layout vale
   para as duas de uma vez.

   A ordem não é acidental. Primeiro o total (quanto), depois a divisão
   (em quê), depois os lançamentos (quais) — do resumo ao detalhe. Os modelos
   ficam no fim porque são manutenção, não leitura do dia a dia.
   ========================================================================== */

const TEXTOS: Record<
  "entrada" | "saida",
  {
    titulo: string;
    apoio: string;
    cardRotulo: string;
    distribuicaoTitulo: string;
    listaTitulo: string;
    vazioTitulo: string;
    vazioDescricao: string;
    melhorSubindo: boolean;
  }
> = {
  entrada: {
    titulo: "Entradas",
    apoio: "Todo o dinheiro que entrou no seu caixa.",
    cardRotulo: "Entradas no período",
    distribuicaoTitulo: "Distribuição das entradas",
    listaTitulo: "Entradas",
    vazioTitulo: "Nenhuma entrada neste período",
    vazioDescricao:
      "Registre salário, freelance ou qualquer dinheiro que entrou. O saldo e os gráficos atualizam na hora.",
    melhorSubindo: true,
  },
  saida: {
    titulo: "Saídas",
    apoio: "Todo o dinheiro que saiu do seu caixa.",
    cardRotulo: "Saídas no período",
    distribuicaoTitulo: "Distribuição das saídas",
    listaTitulo: "Saídas",
    vazioTitulo: "Nenhuma saída neste período",
    vazioDescricao:
      "Registre mercado, moradia, transporte. É a distribuição das saídas que mostra para onde o dinheiro está indo.",
    melhorSubindo: false,
  },
};

export async function PaginaDeFluxo({
  fluxo,
  periodo,
}: {
  fluxo: Extract<Fluxo, "entrada" | "saida">;
  periodo: Periodo;
}) {
  const textos = TEXTOS[fluxo];
  const anterior = periodoAnterior(periodo);

  const [modelos, lancamentos, lancamentosAnteriores, usoPorModelo] = await Promise.all([
    listarModelos(fluxo, true),
    listarTransacoes({ fluxo, de: periodo.de, ate: periodo.ate }),
    listarTransacoes({ fluxo, de: anterior.de, ate: anterior.ate }),
    contagemPorModelo(fluxo),
  ]);

  const modelosAtivos = modelos.filter((modelo) => !modelo.arquivado);
  const total = somar(lancamentos);
  const totalAnterior = somar(lancamentosAnteriores);
  const distribuicao = distribuirPorModelo(lancamentos, modelos);

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <TituloDaPagina
        titulo={textos.titulo}
        apoio={textos.apoio}
        acao={
          <BotaoNovoLancamento
            fluxo={fluxo}
            modelos={modelosAtivos}
            tamanho="lg"
            className="hidden sm:inline-flex"
          />
        }
      />

      <BarraDePeriodo periodo={periodo} />

      <CartaoIndicador
        rotulo={textos.cardRotulo}
        quantia={total}
        icone={fluxo === "entrada" ? ArrowUpRight : ArrowDownLeft}
        tom={fluxo}
        destaque
        // Na aba de entradas o cartão mostra só o valor.
        comparacao={
          fluxo === "entrada"
            ? undefined
            : {
                fracao: variacaoRelativa(total, totalAnterior),
                rotulo: "vs. período anterior",
                melhorSubindo: textos.melhorSubindo,
              }
        }
      />

      {distribuicao.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-5">
          <Bloco
            className="lg:col-span-3"
            titulo={textos.distribuicaoTitulo}
          >
            <Distribuicao fatias={distribuicao} />
          </Bloco>

          <Bloco
            className="lg:col-span-2"
            titulo="Visão geral"
          >
            <RoscaDeDistribuicao
              fatias={distribuicao}
              total={total}
              rotuloDoCentro={ROTULO_FLUXO_PLURAL[fluxo]}
            />
          </Bloco>
        </div>
      )}

      <Bloco
        titulo={textos.listaTitulo}
        descricao={`${periodo.rotulo} · mais recentes primeiro`}
        acao={
          <BotaoNovoLancamento
            fluxo={fluxo}
            modelos={modelosAtivos}
            tamanho="sm"
            rotulo={fluxo === "entrada" ? "Nova entrada" : "Nova saída"}
          />
        }
        semPadding
      >
        <div className="border-t border-border">
          <ListaDeLancamentos
            fluxo={fluxo}
            modelos={modelosAtivos}
            itens={lancamentos.map((lancamento) => ({
              id: lancamento.id,
              modelo: lancamento.modelo,
              carteira: lancamento.carteira,
              valor: lancamento.valor,
              data: lancamento.data,
              observacao: lancamento.observacao,
            }))}
            vazio={
              <EstadoVazio
                icone={fluxo === "entrada" ? ArrowUpRight : ArrowDownLeft}
                titulo={textos.vazioTitulo}
                descricao={textos.vazioDescricao}
                acao={
                  <BotaoNovoLancamento
                    fluxo={fluxo}
                    modelos={modelosAtivos}
                    rotulo={fluxo === "entrada" ? "Registrar entrada" : "Registrar saída"}
                  />
                }
              />
            }
          />
        </div>
      </Bloco>

      <GerenciadorDeModelos fluxo={fluxo} modelos={modelos} usoPorModelo={usoPorModelo} />
    </div>
  );
}
