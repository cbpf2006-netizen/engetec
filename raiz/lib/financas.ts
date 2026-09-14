/* =============================================================================
   REGRAS FINANCEIRAS — fonte única da verdade

   Todo número exibido no app sai daqui. Nenhuma tela soma valores por conta
   própria; se um cálculo aparece em duas páginas, ele mora nesta função.

   ---------------------------------------------------------------------------
   O modelo de caixa adotado
   ---------------------------------------------------------------------------

   Investimento é SAÍDA DE CAIXA que vira patrimônio. Quando você aporta
   R$ 1.000, o dinheiro deixa o caixa livre e reaparece em "investido" — o
   patrimônio total não muda, só mudou de bolso. É o modelo que responde à
   pergunta que um app pessoal precisa responder ("quanto eu ainda posso
   gastar?") sem fingir que o dinheiro aportado continua disponível.

     Caixa(t)       = Σ entradas − Σ saídas − Σ aportes + Σ resgates, até t
     Investido(t)   = Σ aportes − Σ resgates, até t
     Patrimônio(t)  = Caixa(t) + Investido(t)
                    = Σ entradas − Σ saídas, até t

   Caixa e Investido são ESTOQUES: acumulam desde o primeiro lançamento até o
   fim do período escolhido. Trocar o período move o "até t", não recorta o
   começo — um saldo que zera ao trocar de mês seria um saldo errado.

   Entradas, saídas e aportes do período são FLUXOS: só o que aconteceu
   dentro do recorte.

     Resultado do período = entradas − saídas   (o quanto sobrou)
     Sobra livre          = entradas − saídas − aportes + resgates
     Taxa de poupança     = resultado ÷ entradas

   ---------------------------------------------------------------------------
   Contas a pagar
   ---------------------------------------------------------------------------

   Uma conta a pagar é um COMPROMISSO, não uma movimentação: enquanto está
   pendente não entra em saída nenhuma, porque o dinheiro ainda não saiu.
   Ao marcar como paga, o app cria a saída correspondente em `transacoes` e
   guarda o vínculo (`contas.transacao_id`); ao desmarcar, apaga essa saída.
   Assim o valor entra no caixa exatamente uma vez, na data do pagamento, e
   nunca duas (o que aconteceria se a pessoa lançasse a saída à mão também).
   ========================================================================== */

import type {
  Conta,
  Fluxo,
  Investimento,
  Modelo,
  SituacaoConta,
  Transacao,
} from "./tipos";
import type { Balde } from "./periodo";

/** Dinheiro em ponto flutuante acumula erro: 0,1 + 0,2 = 0,30000000000000004.
    Toda saída de cálculo passa por aqui para virar centavos exatos. */
export function arredondar(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

export function somar(valores: { valor: number }[]): number {
  return arredondar(valores.reduce((total, item) => total + item.valor, 0));
}

function noPeriodo<T extends { data: string }>(itens: T[], de: string, ate: string): T[] {
  return itens.filter((item) => item.data >= de && item.data <= ate);
}

/* =============================================================================
   Estoques
   ========================================================================== */

export type MovimentoInvestimento = Pick<Investimento, "operacao" | "valor" | "data">;
export type MovimentoTransacao = Pick<Transacao, "fluxo" | "valor" | "data">;

/** Σ aportes − Σ resgates até `ate`. Sem cotação de mercado: é o valor
    aportado líquido, não o valor de mercado da carteira. */
export function totalInvestido(movimentos: MovimentoInvestimento[], ate: string): number {
  return arredondar(
    movimentos
      .filter((m) => m.data <= ate)
      .reduce((total, m) => total + (m.operacao === "aporte" ? m.valor : -m.valor), 0)
  );
}

export function saldoEmCaixa(
  transacoes: MovimentoTransacao[],
  investimentos: MovimentoInvestimento[],
  ate: string
): number {
  const operacional = transacoes
    .filter((t) => t.data <= ate)
    .reduce((total, t) => total + (t.fluxo === "entrada" ? t.valor : -t.valor), 0);

  return arredondar(operacional - totalInvestido(investimentos, ate));
}

export function patrimonio(
  transacoes: MovimentoTransacao[],
  investimentos: MovimentoInvestimento[],
  ate: string
): number {
  return arredondar(
    saldoEmCaixa(transacoes, investimentos, ate) + totalInvestido(investimentos, ate)
  );
}

/* =============================================================================
   Fluxos do período
   ========================================================================== */

export function totalDoFluxo(
  transacoes: MovimentoTransacao[],
  fluxo: Extract<Fluxo, "entrada" | "saida">,
  de: string,
  ate: string
): number {
  return somar(noPeriodo(transacoes, de, ate).filter((t) => t.fluxo === fluxo));
}

export function aportesDoPeriodo(
  investimentos: MovimentoInvestimento[],
  de: string,
  ate: string
): number {
  return arredondar(
    noPeriodo(investimentos, de, ate).reduce(
      (total, m) => total + (m.operacao === "aporte" ? m.valor : -m.valor),
      0
    )
  );
}

/** Variação relativa entre dois períodos. Devolve null quando a base é zero:
    "subiu infinito%" não é informação, o certo é a interface dizer
    "sem base de comparação". */
export function variacaoRelativa(atual: number, anterior: number): number | null {
  if (anterior === 0) return null;
  return (atual - anterior) / Math.abs(anterior);
}

/** Resultado ÷ entradas. Null quando não houve entrada no período. */
export function taxaDePoupanca(entradas: number, saidas: number): number | null {
  if (entradas <= 0) return null;
  return (entradas - saidas) / entradas;
}

/* =============================================================================
   Distribuição por modelo
   ========================================================================== */

export type FatiaDistribuicao = {
  modeloId: string | null;
  nome: string;
  icone: string;
  cor: string;
  valor: number;
  fracao: number;
};

/** Agrupa lançamentos por modelo, do maior para o menor. Lançamentos sem
    modelo (modelo apagado depois do lançamento) caem em "Sem modelo" em vez
    de sumirem da soma — o total da lista sempre bate com o card. */
export function distribuirPorModelo(
  lancamentos: { modelo_id: string | null; valor: number }[],
  modelos: Modelo[]
): FatiaDistribuicao[] {
  const porId = new Map(modelos.map((m) => [m.id, m]));
  const acumulado = new Map<string | null, number>();

  for (const lancamento of lancamentos) {
    const chave = lancamento.modelo_id;
    acumulado.set(chave, (acumulado.get(chave) ?? 0) + lancamento.valor);
  }

  const total = arredondar([...acumulado.values()].reduce((a, b) => a + b, 0));

  return [...acumulado.entries()]
    .map(([modeloId, valor]) => {
      const modelo = modeloId ? porId.get(modeloId) : undefined;
      return {
        modeloId,
        nome: modelo?.nome ?? "Sem modelo",
        icone: modelo?.icone ?? "circulo",
        cor: modelo?.cor ?? "cinza",
        valor: arredondar(valor),
        fracao: total > 0 ? valor / total : 0,
      };
    })
    .sort((a, b) => b.valor - a.valor);
}

/* =============================================================================
   Série temporal
   ========================================================================== */

export type PontoDaSerie = {
  rotulo: string;
  de: string;
  ate: string;
  entradas: number;
  saidas: number;
  resultado: number;
  acumulado: number;
};

/** Uma linha por balde do gráfico. `acumulado` parte do saldo que já existia
    antes do primeiro balde, para a curva de evolução não começar do zero
    fingindo que a vida financeira começou no início do recorte. */
export function serieDoPeriodo(
  baldes: Balde[],
  transacoes: MovimentoTransacao[],
  saldoInicial = 0
): PontoDaSerie[] {
  let acumulado = saldoInicial;

  return baldes.map((balde) => {
    const doBalde = noPeriodo(transacoes, balde.de, balde.ate);
    const entradas = somar(doBalde.filter((t) => t.fluxo === "entrada"));
    const saidas = somar(doBalde.filter((t) => t.fluxo === "saida"));
    const resultado = arredondar(entradas - saidas);
    acumulado = arredondar(acumulado + resultado);

    return { rotulo: balde.rotulo, de: balde.de, ate: balde.ate, entradas, saidas, resultado, acumulado };
  });
}

/* =============================================================================
   Contas a pagar
   ========================================================================== */

/** "Atrasado" é derivado, nunca gravado: uma conta pendente vira atrasada
    sozinha quando o dia vira, sem depender de job nenhum. */
export function situacaoDaConta(conta: Pick<Conta, "status" | "vencimento">, hoje: string): SituacaoConta {
  if (conta.status === "pago") return "pago";
  return conta.vencimento < hoje ? "atrasado" : "pendente";
}

export type ResumoContas = {
  aPagar: number;
  atrasado: number;
  venceEmBreve: number;
  quantidadeAtrasada: number;
  quantidadeEmBreve: number;
};

/** `diasDeAviso` define a janela de "vencendo em breve" a partir de hoje. */
export function resumirContas(
  contas: Pick<Conta, "status" | "vencimento" | "valor">[],
  hoje: string,
  limiteDoAviso: string
): ResumoContas {
  const pendentes = contas.filter((c) => c.status === "pendente");
  const atrasadas = pendentes.filter((c) => c.vencimento < hoje);
  const emBreve = pendentes.filter((c) => c.vencimento >= hoje && c.vencimento <= limiteDoAviso);

  return {
    aPagar: somar(pendentes),
    atrasado: somar(atrasadas),
    venceEmBreve: somar(emBreve),
    quantidadeAtrasada: atrasadas.length,
    quantidadeEmBreve: emBreve.length,
  };
}
