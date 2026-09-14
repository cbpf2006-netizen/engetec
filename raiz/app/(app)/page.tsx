import type { Metadata } from "next";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Layers,
  PiggyBank,
  Receipt,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { BarraDePeriodo } from "@/components/app/BarraDePeriodo";
import { Bloco, TituloDaPagina } from "@/components/app/Bloco";
import { CartaoIndicador } from "@/components/app/CartaoIndicador";
import { Distribuicao } from "@/components/app/Distribuicao";
import { EstadoVazio } from "@/components/app/EstadoVazio";
import { PrimeiroAcesso } from "@/components/app/PrimeiroAcesso";
import { ProximosPagamentos } from "@/components/app/ProximosPagamentos";
import { ResumoDeLancamentos } from "@/components/app/ResumoDeLancamentos";
import { Valor } from "@/components/app/Valor";
import { BarrasDeFluxo } from "@/components/graficos/BarrasDeFluxo";
import { LinhaDeSaldo } from "@/components/graficos/LinhaDeSaldo";
import { RoscaDeDistribuicao } from "@/components/graficos/RoscaDeDistribuicao";
import { contaVazia, listarTransacoes } from "@/lib/dados/lancamentos";
import { listarModelosPorFluxo } from "@/lib/dados/modelos";
import { montarResumoDoPainel } from "@/lib/dados/painel";
import { perfilAtual } from "@/lib/dados/sessao";
import { data as formatarData, moeda, porcentagem, saudacao } from "@/lib/formato";
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

  const [resumo, ultimasEntradas, ultimasSaidas] = await Promise.all([
    montarResumoDoPainel(periodo),
    listarTransacoes({ fluxo: "entrada", de: periodo.de, ate: periodo.ate, limite: 4 }),
    listarTransacoes({ fluxo: "saida", de: periodo.de, ate: periodo.ate, limite: 4 }),
  ]);

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

      <FaixaSecundaria resumo={resumo} />

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

      <div className="grid gap-5 xl:grid-cols-3">
        <Bloco
          className="xl:col-span-2"
          titulo="Evolução do saldo"
          descricao="Saldo acumulado ao longo do período, partindo do que já existia antes."
        >
          <LinhaDeSaldo serie={resumo.serie} />
        </Bloco>

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

      {/* ------------------------------------------------------------------
          Últimos lançamentos do período
          ------------------------------------------------------------------ */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Bloco titulo="Últimas entradas" descricao="No período selecionado.">
          {ultimasEntradas.length > 0 ? (
            <ResumoDeLancamentos
              fluxo="entrada"
              href="/entradas"
              itens={ultimasEntradas.map((item) => ({
                id: item.id,
                nome: item.modelo?.nome ?? "Sem modelo",
                icone: item.modelo?.icone ?? "circulo",
                cor: item.modelo?.cor ?? "cinza",
                valor: item.valor,
                data: item.data,
                observacao: item.observacao,
              }))}
            />
          ) : (
            <EstadoVazio
              icone={ArrowUpRight}
              titulo="Nenhuma entrada neste período"
              descricao="Use o botão Entrada para registrar a primeira."
              compacto
            />
          )}
        </Bloco>

        <Bloco titulo="Últimas saídas" descricao="No período selecionado.">
          {ultimasSaidas.length > 0 ? (
            <ResumoDeLancamentos
              fluxo="saida"
              href="/saidas"
              itens={ultimasSaidas.map((item) => ({
                id: item.id,
                nome: item.modelo?.nome ?? "Sem modelo",
                icone: item.modelo?.icone ?? "circulo",
                cor: item.modelo?.cor ?? "cinza",
                valor: item.valor,
                data: item.data,
                observacao: item.observacao,
              }))}
            />
          ) : (
            <EstadoVazio
              icone={ArrowDownLeft}
              titulo="Nenhuma saída neste período"
              descricao="Use o botão Saída para registrar a primeira."
              compacto
            />
          )}
        </Bloco>
      </div>

      {resumo.distribuicaoDeSaidas.length > 0 && (
        <Bloco
          titulo="Maiores gastos do período"
          descricao="Do maior para o menor, com a fatia que cada modelo representa."
        >
          <Distribuicao fatias={resumo.distribuicaoDeSaidas.slice(0, 5)} />
        </Bloco>
      )}
    </div>
  );
}

/* =============================================================================
   Faixa secundária

   Três números que dão contexto aos cartões de cima, mas que não merecem o
   mesmo peso visual. Ficam num bloco único, não em três cartões: quatro
   cartões grandes já competem pela atenção — sete acabariam com a hierarquia.
   ========================================================================== */

function FaixaSecundaria({
  resumo,
}: {
  resumo: Awaited<ReturnType<typeof montarResumoDoPainel>>;
}) {
  return (
    <div className="grid gap-px overflow-hidden rounded-2xl bg-border ring-1 ring-border sm:grid-cols-3">
      <ItemDaFaixa
        icone={Layers}
        rotulo="Patrimônio"
        valor={<Valor quantia={resumo.patrimonio} tamanho="lg" fluxo="auto" />}
        apoio="Caixa + total investido"
      />

      <ItemDaFaixa
        icone={Target}
        rotulo="Taxa de poupança"
        valor={
          <span className="numero text-2xl leading-tight font-semibold">
            {resumo.taxaDePoupanca === null ? "—" : porcentagem(resumo.taxaDePoupanca)}
          </span>
        }
        apoio={
          resumo.taxaDePoupanca === null
            ? "Sem entradas no período"
            : "Do que entrou, o quanto sobrou"
        }
      />

      <ItemDaFaixa
        icone={PiggyBank}
        rotulo="Contas a pagar"
        valor={<Valor quantia={resumo.contas.aPagar} tamanho="lg" />}
        apoio={
          resumo.contas.quantidadeAtrasada > 0 ? (
            <span className="font-medium text-saida-texto">
              {resumo.contas.quantidadeAtrasada === 1
                ? "1 conta atrasada"
                : `${resumo.contas.quantidadeAtrasada} contas atrasadas`}
            </span>
          ) : resumo.contas.quantidadeEmBreve > 0 ? (
            `${resumo.contas.quantidadeEmBreve} vence${resumo.contas.quantidadeEmBreve > 1 ? "m" : ""} em até 7 dias`
          ) : (
            "Nada em aberto"
          )
        }
      />
    </div>
  );
}

function ItemDaFaixa({
  icone: Icone,
  rotulo,
  valor,
  apoio,
}: {
  icone: typeof Layers;
  rotulo: string;
  valor: React.ReactNode;
  apoio: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 bg-card p-5">
      <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icone className="size-4" aria-hidden="true" />
        {rotulo}
      </p>
      {valor}
      <p className="text-xs text-muted-foreground">{apoio}</p>
    </div>
  );
}

function rotuloDoGrao(quantidadeDeBaldes: number, preset: string): string {
  if (preset === "ano") return "mês";
  if (quantidadeDeBaldes > 10) return "semana";
  return "dia";
}
