import "server-only";
import {
  aportesDoPeriodo,
  distribuirPorModelo,
  patrimonio as calcularPatrimonio,
  resumirContas,
  saldoEmCaixa,
  serieDoPeriodo,
  situacaoDaConta,
  taxaDePoupanca,
  totalDoFluxo,
  totalInvestido,
  variacaoRelativa,
  type FatiaDistribuicao,
  type PontoDaSerie,
  type ResumoContas,
} from "@/lib/financas";
import {
  hoje,
  janelaDoGrafico,
  periodoAnterior,
  somarDias,
  type Periodo,
} from "@/lib/periodo";
import type { Conta, SituacaoConta } from "@/lib/tipos";
import { historicoAte } from "./lancamentos";
import { contasParaResumo } from "./contas";
import { listarModelosPorFluxo } from "./modelos";

/* =============================================================================
   Resumo do painel

   Uma função para montar a tela inteira de Início. A página fica sem
   aritmética: ela recebe números prontos e decide apenas como mostrá-los.

   Todos os valores saem de lib/financas.ts, que é onde o modelo de caixa está
   escrito e testado.
   ========================================================================== */

export type PagamentoProximo = Pick<Conta, "id" | "nome" | "valor"> & {
  /** Não é nullable como em `Conta`: a fila é ordenada por prazo, e conta sem
      vencimento não entra nela. */
  vencimento: string;
  situacao: SituacaoConta;
  diasRestantes: number;
};

export type ResumoDoPainel = {
  /** Estoques, acumulados até o fim do período. */
  saldoEmCaixa: number;
  totalInvestido: number;
  patrimonio: number;

  /** Fluxos do período. */
  entradas: number;
  saidas: number;
  aportes: number;
  resultado: number;
  taxaDePoupanca: number | null;

  /** Variação contra o período anterior de mesmo tamanho. */
  variacaoDeEntradas: number | null;
  variacaoDeSaidas: number | null;
  variacaoDoResultado: number | null;

  serie: PontoDaSerie[];
  janelaAmpliada: boolean;
  distribuicaoDeSaidas: FatiaDistribuicao[];

  contas: ResumoContas;
  proximosPagamentos: PagamentoProximo[];

  quantidadeDeLancamentos: number;
};

const DIAS_DE_AVISO = 7;

export async function montarResumoDoPainel(periodo: Periodo): Promise<ResumoDoPainel> {
  const anterior = periodoAnterior(periodo);
  const janela = janelaDoGrafico(periodo);

  const [historico, contas, modelos] = await Promise.all([
    historicoAte(periodo.ate),
    contasParaResumo(),
    listarModelosPorFluxo(),
  ]);

  const { transacoes, investimentos } = historico;

  const entradas = totalDoFluxo(transacoes, "entrada", periodo.de, periodo.ate);
  const saidas = totalDoFluxo(transacoes, "saida", periodo.de, periodo.ate);
  const aportes = aportesDoPeriodo(investimentos, periodo.de, periodo.ate);
  const resultado = Math.round((entradas - saidas) * 100) / 100;

  const entradasAntes = totalDoFluxo(transacoes, "entrada", anterior.de, anterior.ate);
  const saidasAntes = totalDoFluxo(transacoes, "saida", anterior.de, anterior.ate);

  // A curva de evolução não pode começar do zero: o saldo de antes da janela
  // já existia, e ignorá-lo faria a linha mentir sobre o patamar.
  const saldoAntesDaJanela = saldoEmCaixa(
    transacoes,
    investimentos,
    somarDias(janela.de, -1)
  );

  const agora = hoje();
  const limiteDoAviso = somarDias(agora, DIAS_DE_AVISO);

  const saidasDoPeriodo = transacoes.filter(
    (t) => t.fluxo === "saida" && t.data >= periodo.de && t.data <= periodo.ate
  );

  return {
    saldoEmCaixa: saldoEmCaixa(transacoes, investimentos, periodo.ate),
    totalInvestido: totalInvestido(investimentos, periodo.ate),
    patrimonio: calcularPatrimonio(transacoes, investimentos, periodo.ate),

    entradas,
    saidas,
    aportes,
    resultado,
    taxaDePoupanca: taxaDePoupanca(entradas, saidas),

    variacaoDeEntradas: variacaoRelativa(entradas, entradasAntes),
    variacaoDeSaidas: variacaoRelativa(saidas, saidasAntes),
    variacaoDoResultado: variacaoRelativa(resultado, entradasAntes - saidasAntes),

    serie: serieDoPeriodo(janela.baldes, transacoes, saldoAntesDaJanela),
    janelaAmpliada: janela.ampliada,
    distribuicaoDeSaidas: distribuirPorModelo(saidasDoPeriodo, modelos.saida),

    contas: resumirContas(contas, agora, limiteDoAviso),
    proximosPagamentos: proximosPagamentos(contas, agora),

    quantidadeDeLancamentos:
      transacoes.filter((t) => t.data >= periodo.de && t.data <= periodo.ate).length +
      investimentos.filter((i) => i.data >= periodo.de && i.data <= periodo.ate).length,
  };
}

/** Atrasadas primeiro (são as urgentes), depois as próximas por vencimento. */
function proximosPagamentos(
  contas: Pick<Conta, "id" | "nome" | "valor" | "vencimento" | "status">[],
  agora: string
): PagamentoProximo[] {
  return contas
    // Sem vencimento não há "próximo": a conta não tem lugar numa fila
    // ordenada por prazo.
    .filter((conta) => conta.status === "pendente" && conta.vencimento !== null)
    .map((conta) => ({
      id: conta.id,
      nome: conta.nome,
      valor: conta.valor,
      vencimento: conta.vencimento!,
      situacao: situacaoDaConta(conta, agora),
      diasRestantes: diasEntre(agora, conta.vencimento!),
    }))
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento))
    .slice(0, 5);
}

function diasEntre(de: string, ate: string): number {
  const [a1, m1, d1] = de.split("-").map(Number);
  const [a2, m2, d2] = ate.split("-").map(Number);
  return Math.round(
    (Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)) / 86_400_000
  );
}
