import "server-only";
import { cache } from "react";
import { erroDeConsulta } from "./erros";
import { exigirContexto } from "./sessao";
import type { Carteira } from "@/lib/tipos";

/* =============================================================================
   Carteiras — leitura

   Uma carteira não guarda saldo: o saldo é a soma dos lançamentos que apontam
   para ela — direto, no caso de entradas e saídas, ou pelo tipo, no caso de
   aportes e resgates. Guardar o número numa coluna criaria duas verdades, e a errada
   seria sempre a que a tela mostra.
   ========================================================================== */

/** PostgREST devolve o embed como objeto ou array conforme a cardinalidade
    que inferiu; a carteira do aporte é a do tipo (modelo) dele. */
function carteiraDoTipo(modelo: unknown): string | null {
  const um = Array.isArray(modelo) ? modelo[0] : modelo;
  return (um as { carteira_id: string | null } | null | undefined)?.carteira_id ?? null;
}

export const listarCarteiras = cache(async (): Promise<Carteira[]> => {
  const { supabase, usuario } = await exigirContexto();

  const { data, error } = await supabase
    .from("carteiras")
    .select("id, nome, ordem")
    .eq("usuario_id", usuario.id)
    .order("ordem", { ascending: true })
    .order("nome", { ascending: true });

  if (error) throw erroDeConsulta("Falha ao carregar carteiras", error);

  return (data ?? []) as Carteira[];
});

/** Entradas somam, saídas e aportes descem, resgates voltam — o dinheiro
    disponível em cada carteira hoje. */
export async function saldoPorCarteira(): Promise<Record<string, number>> {
  const { supabase, usuario } = await exigirContexto();

  const [transacoes, investimentos] = await Promise.all([
    supabase
      .from("transacoes")
      .select("fluxo, valor, carteira_id")
      .eq("usuario_id", usuario.id)
      .not("carteira_id", "is", null),
    // A carteira de um aporte é a do seu tipo. O filtro no embed (!inner) já
    // descarta aportes de tipos sem carteira.
    supabase
      .from("investimentos")
      .select("operacao, valor, modelo:modelos!inner (carteira_id)")
      .eq("usuario_id", usuario.id)
      .not("modelo.carteira_id", "is", null),
  ]);

  if (transacoes.error) throw erroDeConsulta("Falha ao somar carteiras", transacoes.error);
  if (investimentos.error) {
    throw erroDeConsulta("Falha ao somar carteiras", investimentos.error);
  }

  const saldo: Record<string, number> = {};

  for (const linha of transacoes.data ?? []) {
    const id = linha.carteira_id as string;
    const valor = Number(linha.valor);
    saldo[id] = (saldo[id] ?? 0) + (linha.fluxo === "entrada" ? valor : -valor);
  }

  for (const linha of investimentos.data ?? []) {
    const id = carteiraDoTipo(linha.modelo);
    if (!id) continue;
    const valor = Number(linha.valor);
    saldo[id] = (saldo[id] ?? 0) + (linha.operacao === "aporte" ? -valor : valor);
  }

  return saldo;
}

/** Quantos lançamentos cada carteira tem. O gerenciador usa isto para dizer
    o que a exclusão vai atingir antes de perguntar. */
export async function contagemPorCarteira(): Promise<Record<string, number>> {
  const { supabase, usuario } = await exigirContexto();

  const [transacoes, investimentos] = await Promise.all([
    supabase
      .from("transacoes")
      .select("carteira_id")
      .eq("usuario_id", usuario.id)
      .not("carteira_id", "is", null),
    supabase
      .from("investimentos")
      .select("modelo:modelos!inner (carteira_id)")
      .eq("usuario_id", usuario.id)
      .not("modelo.carteira_id", "is", null),
  ]);

  if (transacoes.error) throw erroDeConsulta("Falha ao contar lançamentos", transacoes.error);
  if (investimentos.error) {
    throw erroDeConsulta("Falha ao contar lançamentos", investimentos.error);
  }

  const ids = [
    ...(transacoes.data ?? []).map((linha) => linha.carteira_id as string | null),
    ...(investimentos.data ?? []).map((linha) => carteiraDoTipo(linha.modelo)),
  ];

  const contagem: Record<string, number> = {};
  for (const id of ids) {
    if (id) contagem[id] = (contagem[id] ?? 0) + 1;
  }
  return contagem;
}
