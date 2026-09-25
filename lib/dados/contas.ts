import "server-only";
import { erroDeConsulta } from "./erros";
import { exigirContexto } from "./sessao";
import { situacaoDaConta } from "@/lib/financas";
import { hoje } from "@/lib/periodo";
import type { Conta, ContaComModelo, FiltroContas, Modelo } from "@/lib/tipos";

const CAMPOS =
  "id, nome, modelo_id, valor, vencimento, status, pago_em, transacao_id, observacao, criado_em";
const CAMPOS_MODELO = "modelo:modelos (id, fluxo, nome, icone, cor, ordem, arquivado)";

/** Contas do usuário com a situação já derivada.

    O filtro roda em memória porque "atrasado" não existe como coluna — é
    `pendente` com vencimento no passado. Filtrar isso no PostgREST exigiria
    repetir a regra do calendário na consulta, e aí ela passaria a existir em
    dois lugares. A lista de contas a pagar de uma pessoa é curta; o custo é
    irrelevante e a regra fica só em lib/financas.ts. */
export async function listarContas(filtro: FiltroContas = "todas"): Promise<ContaComModelo[]> {
  const { supabase, usuario } = await exigirContexto();

  const { data, error } = await supabase
    .from("contas")
    .select(`${CAMPOS}, ${CAMPOS_MODELO}`)
    .eq("usuario_id", usuario.id)
    .order("status", { ascending: true })
    .order("vencimento", { ascending: true });

  if (error) throw erroDeConsulta("Falha ao carregar contas", error);

  const agora = hoje();

  const contas = (data ?? []).map((linha) => {
    const bruta = linha as unknown as Conta & { modelo: Modelo | Modelo[] | null };
    const modelo = Array.isArray(bruta.modelo) ? (bruta.modelo[0] ?? null) : bruta.modelo;
    const conta: ContaComModelo = {
      ...bruta,
      valor: Number(bruta.valor),
      modelo,
      situacao: situacaoDaConta(bruta, agora),
    };
    return conta;
  });

  return filtro === "todas" ? contas : contas.filter((c) => c.situacao === filtro);
}

/** Só o necessário para os três cards e para o bloco "próximos pagamentos"
    do painel. */
export async function contasParaResumo(): Promise<
  Pick<Conta, "id" | "nome" | "valor" | "vencimento" | "status">[]
> {
  const { supabase, usuario } = await exigirContexto();

  const { data, error } = await supabase
    .from("contas")
    .select("id, nome, valor, vencimento, status")
    .eq("usuario_id", usuario.id)
    .order("vencimento", { ascending: true });

  if (error) throw erroDeConsulta("Falha ao carregar contas", error);

  return (data ?? []).map((c) => ({
    id: c.id as string,
    nome: c.nome as string,
    valor: Number(c.valor),
    vencimento: c.vencimento as string,
    status: c.status as Conta["status"],
  }));
}
