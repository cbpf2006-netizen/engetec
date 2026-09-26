import type { Metadata } from "next";
import { ArrowDownLeft, ArrowUpRight, Receipt, TrendingUp, Wallet } from "lucide-react";

import { BarraDePeriodo } from "@/components/app/BarraDePeriodo";
import { Bloco, TituloDaPagina } from "@/components/app/Bloco";
import { CartaoIndicador } from "@/components/app/CartaoIndicador";
import { EstadoVazio } from "@/components/app/EstadoVazio";
import { PrimeiroAcesso } from "@/components/app/PrimeiroAcesso";
import { ProximosPagamentos } from "@/components/app/ProximosPagamentos";
import { BarrasDeFluxo } from "@/components/graficos/BarrasDeFluxo";
import { RoscaDeDistribuicao } from "@/components/graficos/RoscaDeDistribuicao";
import { contaVazia } from "@/lib/dados/lancamentos";
import { listarModelosPorFluxo } from "@/lib/dados/modelos";
import { montarResumoDoPainel } from "@/lib/dados/painel";
import { perfilAtual } from "@/lib/dados/sessao";
import { data as formatarData, moeda, saudacao } from "@/lib/formato";
import { resolverPeriodo } from "@/lib/periodo";

export const metadata: Metadata = { title: "Início" };

type Parametros = Promise<Record<string, string | string[] | undefined>>;

export default async function PaginaInicio({ searchParams }: { searchParams: Parametros }) {
  const periodo = resolverPeriodo(await searchParams);

  const [perfil, modelos, vazia] = await Promise.all([
    perfilAtual(),
    listarModelosPorFluxo(),
    contaVazia(),
  ]);

  const primeiroNome = perfil?.nome?.trim().split(" ")[0] ?? "por aqui";

  if (vazia) {
    return (
      <PrimeiroAcesso
        nome={primeiroNome}
        modelosDeEntrada={modelos.entrada}
        modelosDeSaida={modelos.saida}
      />
    );
  }

  const resumo = await montarResumoDoPainel(periodo);

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <TituloDaPagina
        titulo={`${saudacao()}, ${primeiroNome}.`}
        apoio="Seu caixa, o que entrou, o que saiu e o que virou patrimônio."
      />

      <BarraDePeriodo periodo={periodo} />

      {/* ------------------------------------------------------------------
          Indicadores. Saldo é estoque (acumulado até o fim do período);
          entradas, saídas e aportes são fluxos do período — a diferença está
          escrita no rodapé de cada cartão para o número não parecer errado.
          ------------------------------------------------------------------ */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CartaoIndicador
          rotulo="Saldo em caixa"
          quantia={resumo.saldoEmCaixa}
          icone={Wallet}
          destaque
          contexto={
            <>
              Acumulado até {formatarData(periodo.ate)}, já descontando aportes.
            </>
          }
        />

        <CartaoIndicador
          rotulo="Entradas no período"
          quantia={resumo.entradas}
          icone={ArrowUpRight}
          tom="entrada"
          comparacao={{
            fracao: resumo.variacaoDeEntradas,
            rotulo: "vs. período anterior",
            melhorSubindo: true,
          }}
        />

        <CartaoIndicador
          rotulo="Saídas no período"
          quantia={resumo.saidas}
          icone={ArrowDownLeft}
          tom="saida"
          comparacao={{
            fracao: resumo.variacaoDeSaidas,
            rotulo: "vs. período anterior",
            melhorSubindo: false,
          }}
        />

        <CartaoIndicador
          rotulo="Total investido"
          quantia={resumo.totalInvestido}
          icone={TrendingUp}
          tom="investimento"
          contexto={
            resumo.aportes === 0 ? (
              "Nenhum aporte neste período."
            ) : (
              <>
                {resumo.aportes > 0 ? "Aportou" : "Resgatou"}{" "}
                <strong className="numero font-semibold text-foreground">
                  {moeda(Math.abs(resumo.aportes))}
                </strong>{" "}
                no período.
              </>
            )
          }
        />
      </div>

      {/* ------------------------------------------------------------------
          Visualizações
          ------------------------------------------------------------------ */}
      <div className="grid gap-5 xl:grid-cols-3">
        <Bloco
          className="xl:col-span-2"
          titulo="Entradas e saídas"
          descricao={
            resumo.janelaAmpliada
              ? "Últimos 7 dias — um único dia não mostra evolução."
              : `Por ${rotuloDoGrao(resumo.serie.length, periodo.preset)} dentro do período.`
          }
        >
          <BarrasDeFluxo serie={resumo.serie} />
        </Bloco>

        <Bloco titulo="Para onde foi" descricao="Distribuição das saídas do período.">
          {resumo.distribuicaoDeSaidas.length > 0 ? (
            <RoscaDeDistribuicao
              fatias={resumo.distribuicaoDeSaidas}
              total={resumo.saidas}
              rotuloDoCentro="Saídas"
            />
          ) : (
            <EstadoVazio
              icone={ArrowDownLeft}
              titulo="Nenhuma saída no período"
              descricao="Quando houver saídas, a divisão por modelo aparece aqui."
              compacto
            />
          )}
        </Bloco>
      </div>

      <Bloco titulo="Próximos pagamentos" descricao="Contas pendentes, do mais urgente ao menos.">
        {resumo.proximosPagamentos.length > 0 ? (
          <ProximosPagamentos pagamentos={resumo.proximosPagamentos} />
        ) : (
          <EstadoVazio
            icone={Receipt}
            titulo="Nada pendente"
            descricao="Nenhuma conta a pagar em aberto."
            compacto
          />
        )}
      </Bloco>
    </div>
  );
}

function rotuloDoGrao(quantidadeDeBaldes: number, preset: string): string {
  if (preset === "ano") return "mês";
  if (quantidadeDeBaldes > 10) return "semana";
  return "dia";
}
