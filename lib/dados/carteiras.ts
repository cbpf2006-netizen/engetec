import "server-only";
import { cache } from "react";
import { erroDeConsulta } from "./erros";
import { exigirContexto } from "./sessao";
import type { Carteira } from "@/lib/tipos";

/* =============================================================================
   Carteiras — leitura

   Uma carteira não guarda saldo: o saldo é a soma dos lançamentos que apontam
   para ela. Guardar o número numa coluna criaria duas verdades, e a errada
   seria sempre a que a tela mostra.
   ========================================================================== */

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
    supabase
      .from("investimentos")
      .select("operacao, valor, carteira_id")
      .eq("usuario_id", usuario.id)
      .not("carteira_id", "is", null),
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
    const id = linha.carteira_id as string;
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
      .select("carteira_id")
      .eq("usuario_id", usuario.id)
      .not("carteira_id", "is", null),
  ]);

  if (transacoes.error) throw erroDeConsulta("Falha ao contar lançamentos", transacoes.error);
  if (investimentos.error) {
    throw erroDeConsulta("Falha ao contar lançamentos", investimentos.error);
  }

  const contagem: Record<string, number> = {};
  for (const linha of [...(transacoes.data ?? []), ...(investimentos.data ?? [])]) {
    const id = linha.carteira_id as string;
    contagem[id] = (contagem[id] ?? 0) + 1;
  }
  return contagem;
}
