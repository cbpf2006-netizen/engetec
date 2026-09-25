import "server-only";
import { erroDeConsulta } from "./erros";
import { exigirContexto } from "./sessao";
import type {
  Fluxo,
  Investimento,
  InvestimentoComModelo,
  Modelo,
  Transacao,
  TransacaoComModelo,
} from "@/lib/tipos";
import type { MovimentoInvestimento, MovimentoTransacao } from "@/lib/financas";

/* =============================================================================
   Leitura de lançamentos

   Duas formas de ler, de propósito:

   · As LISTAS trazem o lançamento inteiro, com o modelo embutido, e são
     paginadas por um limite — é o que a tela mostra.

   · Os SALDOS (estoques) precisam de todo o histórico até uma data, e para
     isso vêm só três colunas por linha (fluxo, valor, data). Um lançamento
     nessa forma pesa ~40 bytes; mesmo dez anos de uso intenso cabem
     tranquilamente numa resposta, e em troca todo o cálculo financeiro
     continua num único lugar testável (lib/financas.ts) em vez de virar
     SQL espalhado por views.

     Se algum dia o volume justificar, a troca é localizada: uma função RPC
     no Postgres substitui estas duas consultas sem tocar em nenhuma tela.
   ========================================================================== */

const CAMPOS_TRANSACAO = "id, fluxo, modelo_id, valor, data, observacao, criado_em";
const CAMPOS_INVESTIMENTO =
  "id, operacao, modelo_id, valor, data, observacao, criado_em";
const CAMPOS_MODELO = "modelo:modelos (id, fluxo, nome, icone, cor, ordem, arquivado)";

type LinhaComModelo = { valor: number | string; modelo: Modelo | Modelo[] | null };

/** PostgREST devolve o relacionamento como objeto ou array conforme a
    cardinalidade que inferiu. Normalizar aqui evita `Array.isArray` espalhado
    pelos componentes. */
function normalizar<T extends LinhaComModelo>(linha: T) {
  const modelo = Array.isArray(linha.modelo) ? (linha.modelo[0] ?? null) : linha.modelo;
  return { ...linha, valor: Number(linha.valor), modelo };
}

export type FiltroLancamentos = {
  fluxo?: Extract<Fluxo, "entrada" | "saida">;
  de?: string;
  ate?: string;
  modeloId?: string;
  limite?: number;
};

export async function listarTransacoes(
  filtro: FiltroLancamentos = {}
): Promise<TransacaoComModelo[]> {
  const { supabase, usuario } = await exigirContexto();

  let consulta = supabase
    .from("transacoes")
    .select(`${CAMPOS_TRANSACAO}, ${CAMPOS_MODELO}`)
    .eq("usuario_id", usuario.id)
    .order("data", { ascending: false })
    .order("criado_em", { ascending: false });

  if (filtro.fluxo) consulta = consulta.eq("fluxo", filtro.fluxo);
  if (filtro.de) consulta = consulta.gte("data", filtro.de);
  if (filtro.ate) consulta = consulta.lte("data", filtro.ate);
  if (filtro.modeloId) consulta = consulta.eq("modelo_id", filtro.modeloId);
  if (filtro.limite) consulta = consulta.limit(filtro.limite);

  const { data, error } = await consulta;
  if (error) throw erroDeConsulta("Falha ao carregar lançamentos", error);

  return (data ?? []).map((linha) =>
    normalizar(linha as unknown as Transacao & LinhaComModelo)
  ) as TransacaoComModelo[];
}

export async function listarInvestimentos(
  filtro: { de?: string; ate?: string; modeloId?: string; limite?: number } = {}
): Promise<InvestimentoComModelo[]> {
  const { supabase, usuario } = await exigirContexto();

  let consulta = supabase
    .from("investimentos")
    .select(`${CAMPOS_INVESTIMENTO}, ${CAMPOS_MODELO}`)
    .eq("usuario_id", usuario.id)
    .order("data", { ascending: false })
    .order("criado_em", { ascending: false });

  if (filtro.de) consulta = consulta.gte("data", filtro.de);
  if (filtro.ate) consulta = consulta.lte("data", filtro.ate);
  if (filtro.modeloId) consulta = consulta.eq("modelo_id", filtro.modeloId);
  if (filtro.limite) consulta = consulta.limit(filtro.limite);

  const { data, error } = await consulta;
  if (error) throw erroDeConsulta("Falha ao carregar investimentos", error);

  return (data ?? []).map((linha) =>
    normalizar(linha as unknown as Investimento & LinhaComModelo)
  ) as InvestimentoComModelo[];
}

/* =============================================================================
   Histórico enxuto para os estoques
   ========================================================================== */

export type HistoricoAte = {
  transacoes: (MovimentoTransacao & { modelo_id: string | null })[];
  investimentos: (MovimentoInvestimento & { modelo_id: string | null })[];
};

export async function historicoAte(ate: string): Promise<HistoricoAte> {
  const { supabase, usuario } = await exigirContexto();

  const [transacoes, investimentos] = await Promise.all([
    supabase
      .from("transacoes")
      .select("fluxo, valor, data, modelo_id")
      .eq("usuario_id", usuario.id)
      .lte("data", ate),
    supabase
      .from("investimentos")
      .select("operacao, valor, data, modelo_id")
      .eq("usuario_id", usuario.id)
      .lte("data", ate),
  ]);

  if (transacoes.error) throw erroDeConsulta("Falha ao somar lançamentos", transacoes.error);
  if (investimentos.error) {
    throw erroDeConsulta("Falha ao somar investimentos", investimentos.error);
  }

  return {
    transacoes: (transacoes.data ?? []).map((t) => ({
      fluxo: t.fluxo as MovimentoTransacao["fluxo"],
      valor: Number(t.valor),
      data: t.data as string,
      modelo_id: t.modelo_id as string | null,
    })),
    investimentos: (investimentos.data ?? []).map((i) => ({
      operacao: i.operacao as MovimentoInvestimento["operacao"],
      valor: Number(i.valor),
      data: i.data as string,
      modelo_id: i.modelo_id as string | null,
    })),
  };
}

/** Quantos lançamentos cada modelo tem, em toda a história da conta. O
    gerenciador de modelos usa isto para avisar o que exclusão vai atingir —
    "3 lançamentos usam este modelo" é uma informação muito melhor que um
    "tem certeza?". */
export async function contagemPorModelo(fluxo: Fluxo): Promise<Record<string, number>> {
  const { supabase, usuario } = await exigirContexto();

  const consulta =
    fluxo === "investimento"
      ? supabase.from("investimentos").select("modelo_id").eq("usuario_id", usuario.id)
      : supabase
          .from("transacoes")
          .select("modelo_id")
          .eq("usuario_id", usuario.id)
          .eq("fluxo", fluxo);

  const { data, error } = await consulta;
  if (error) throw erroDeConsulta("Falha ao contar lançamentos", error);

  const contagem: Record<string, number> = {};
  for (const linha of data ?? []) {
    const id = linha.modelo_id as string | null;
    if (id) contagem[id] = (contagem[id] ?? 0) + 1;
  }
  return contagem;
}

/** Existe algum lançamento na conta? Decide entre o painel de verdade e o
    estado de primeiro acesso, sem baixar nenhuma linha. */
export async function contaVazia(): Promise<boolean> {
  const { supabase, usuario } = await exigirContexto();

  const [transacoes, investimentos, contas] = await Promise.all([
    supabase
      .from("transacoes")
      .select("id", { count: "exact", head: true })
      .eq("usuario_id", usuario.id),
    supabase
      .from("investimentos")
      .select("id", { count: "exact", head: true })
      .eq("usuario_id", usuario.id),
    supabase
      .from("contas")
      .select("id", { count: "exact", head: true })
      .eq("usuario_id", usuario.id),
  ]);

  return (
    (transacoes.count ?? 0) === 0 &&
    (investimentos.count ?? 0) === 0 &&
    (contas.count ?? 0) === 0
  );
}
