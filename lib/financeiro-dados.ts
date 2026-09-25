import "server-only";
import { clienteServidor } from "./supabase-servidor";
import {
  graoAutomatico,
  type Faixa,
  type MovimentacaoFinanceira,
  type PontoDaSerie,
  type ResumoFinanceiro,
} from "./financeiro";

type LinhaBanco = {
  id: string;
  data: string;
  tipo: "receita" | "despesa";
  categoria: string;
  valor: number;
  observacoes: string;
  forma_pagamento: MovimentacaoFinanceira["formaPagamento"];
  status: MovimentacaoFinanceira["status"];
};

function paraDominio(linha: LinhaBanco): MovimentacaoFinanceira {
  return {
    id: linha.id,
    data: linha.data,
    tipo: linha.tipo,
    categoria: linha.categoria,
    valor: Number(linha.valor),
    observacoes: linha.observacoes,
    formaPagamento: linha.forma_pagamento,
    status: linha.status,
  };
}

/** Lista as movimentações cuja data cai dentro da faixa, mais recentes primeiro. */
export async function listarMovimentacoesFinanceiras(
  faixa: Faixa
): Promise<MovimentacaoFinanceira[]> {
  const supabase = clienteServidor();
  const { data, error } = await supabase
    .from("movimentacoes_financeiras")
    .select("id, data, tipo, categoria, valor, observacoes, forma_pagamento, status")
    .gte("data", faixa.de)
    .lte("data", faixa.ate)
    .order("data", { ascending: false })
    .order("criado_em", { ascending: false });

  if (error) throw new Error(`Falha ao listar movimentações: ${error.message}`);
  return (data ?? []).map(paraDominio);
}

/** Saldo é acumulado desde sempre até o fim da faixa — dinheiro em
    caixa não zera na virada do mês. Os outros números são do recorte. */
export async function obterResumoFinanceiro(faixa: Faixa): Promise<ResumoFinanceiro> {
  const supabase = clienteServidor();

  const [{ data: pagoAteFim, error: erro1 }, { data: doPeriodo, error: erro2 }] =
    await Promise.all([
      supabase
        .from("movimentacoes_financeiras")
        .select("tipo, valor")
        .eq("status", "pago")
        .lte("data", faixa.ate),
      supabase
        .from("movimentacoes_financeiras")
        .select("tipo, valor, status")
        .gte("data", faixa.de)
        .lte("data", faixa.ate),
    ]);

  if (erro1) throw new Error(`Falha ao apurar saldo: ${erro1.message}`);
  if (erro2) throw new Error(`Falha ao apurar resumo: ${erro2.message}`);

  const saldo = (pagoAteFim ?? []).reduce(
    (soma, m) => soma + (m.tipo === "receita" ? Number(m.valor) : -Number(m.valor)),
    0
  );

  let receitas = 0;
  let despesas = 0;
  let receitasAbertas = 0;
  let despesasAbertas = 0;
  let emAberto = 0;

  for (const m of doPeriodo ?? []) {
    const valor = Number(m.valor);
    if (m.status === "pago") {
      if (m.tipo === "receita") receitas += valor;
      else despesas += valor;
    } else {
      emAberto += 1;
      if (m.tipo === "receita") receitasAbertas += valor;
      else despesasAbertas += valor;
    }
  }

  return {
    de: faixa.de,
    ate: faixa.ate,
    saldo,
    receitas,
    despesas,
    lucro: receitas - despesas,
    receitasAbertas,
    despesasAbertas,
    emAberto,
    lancamentos: (doPeriodo ?? []).length,
  };
}

/** Série por período (grão automático para a faixa) — entradas, saídas,
    lucro e saldo acumulado, para o gráfico de fluxo de caixa. */
export async function obterSerieFinanceira(faixa: Faixa): Promise<PontoDaSerie[]> {
  const grao = graoAutomatico(faixa);
  const supabase = clienteServidor();

  const { data: antesDaFaixa, error: erro1 } = await supabase
    .from("movimentacoes_financeiras")
    .select("tipo, valor")
    .eq("status", "pago")
    .lt("data", faixa.de);
  if (erro1) throw new Error(`Falha ao apurar saldo inicial: ${erro1.message}`);

  let acumulado = (antesDaFaixa ?? []).reduce(
    (soma, m) => soma + (m.tipo === "receita" ? Number(m.valor) : -Number(m.valor)),
    0
  );

  const { data: doPeriodo, error: erro2 } = await supabase
    .from("movimentacoes_financeiras")
    .select("data, tipo, valor")
    .eq("status", "pago")
    .gte("data", faixa.de)
    .lte("data", faixa.ate)
    .order("data", { ascending: true });
  if (erro2) throw new Error(`Falha ao apurar série: ${erro2.message}`);

  const chaveDoPeriodo = (data: string) => {
    if (grao === "ano") return data.slice(0, 4) + "-01-01";
    if (grao === "mes") return data.slice(0, 7) + "-01";
    if (grao === "semana") {
      const d = new Date(`${data}T00:00:00Z`);
      const diaDaSemana = d.getUTCDay();
      const recuo = diaDaSemana === 0 ? 6 : diaDaSemana - 1;
      d.setUTCDate(d.getUTCDate() - recuo);
      return d.toISOString().slice(0, 10);
    }
    return data;
  };

  const pontosPorChave = new Map<string, { receitas: number; despesas: number }>();
  for (const m of doPeriodo ?? []) {
    const chave = chaveDoPeriodo(m.data);
    const ponto = pontosPorChave.get(chave) ?? { receitas: 0, despesas: 0 };
    if (m.tipo === "receita") ponto.receitas += Number(m.valor);
    else ponto.despesas += Number(m.valor);
    pontosPorChave.set(chave, ponto);
  }

  const chavesOrdenadas = [...pontosPorChave.keys()].sort();
  const serie: PontoDaSerie[] = [];
  for (const chave of chavesOrdenadas) {
    const { receitas, despesas } = pontosPorChave.get(chave)!;
    acumulado += receitas - despesas;
    serie.push({ periodo: chave, receitas, despesas, lucro: receitas - despesas, acumulado });
  }

  return serie;
}

export type NovaMovimentacao = {
  data: string;
  tipo: "receita" | "despesa";
  categoria: string;
  valor: number;
  observacoes: string;
  formaPagamento: MovimentacaoFinanceira["formaPagamento"];
  status: MovimentacaoFinanceira["status"];
};

export async function criarMovimentacaoFinanceira(nova: NovaMovimentacao): Promise<void> {
  const supabase = clienteServidor();
  const { error } = await supabase.from("movimentacoes_financeiras").insert({
    data: nova.data,
    tipo: nova.tipo,
    categoria: nova.categoria,
    valor: nova.valor,
    observacoes: nova.observacoes,
    forma_pagamento: nova.formaPagamento,
    status: nova.status,
  });
  if (error) throw new Error(`Falha ao gravar movimentação: ${error.message}`);
}

export async function excluirMovimentacaoFinanceira(id: string): Promise<void> {
  const supabase = clienteServidor();
  const { error } = await supabase.from("movimentacoes_financeiras").delete().eq("id", id);
  if (error) throw new Error(`Falha ao excluir movimentação: ${error.message}`);
}
