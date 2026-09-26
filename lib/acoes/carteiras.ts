"use server";

import { contextoOuNulo } from "@/lib/dados/sessao";
import { erroDeValidacao, esquemaCarteira } from "@/lib/esquemas";
import { falha, sucesso, type Carteira, type Resultado } from "@/lib/tipos";
import { erroDeBanco, revalidarNumeros, SEM_SESSAO } from "./comum";

/* =============================================================================
   Carteiras — escrita

   Criar devolve a carteira criada, e não só "ok": o diálogo de lançamento
   permite cadastrar uma carteira no meio do fluxo e precisa já selecioná-la.
   ========================================================================== */

const NOME_REPETIDO = "Já existe uma carteira com esse nome.";

export async function criarCarteira(entrada: unknown): Promise<Resultado<Carteira>> {
  const analise = esquemaCarteira.safeParse(entrada);
  if (!analise.success) return erroDeValidacao(analise.error);

  const contexto = await contextoOuNulo();
  if (!contexto) return falha(SEM_SESSAO);

  const { supabase, usuario } = contexto;

  const { data: existentes } = await supabase
    .from("carteiras")
    .select("ordem")
    .eq("usuario_id", usuario.id);

  const ordem = Math.max(0, ...(existentes ?? []).map((c) => Number(c.ordem))) + 1;

  const { data, error } = await supabase
    .from("carteiras")
    .insert({ usuario_id: usuario.id, nome: analise.data.nome, ordem })
    .select("id, nome, ordem")
    .single();

  if (error) {
    if (error.code === "23505") return falha(NOME_REPETIDO, "nome");
    return erroDeBanco(error, "criar a carteira");
  }

  revalidarNumeros();
  return sucesso(data as Carteira);
}

export async function atualizarCarteira(id: string, entrada: unknown): Promise<Resultado> {
  const analise = esquemaCarteira.safeParse(entrada);
  if (!analise.success) return erroDeValidacao(analise.error);

  const contexto = await contextoOuNulo();
  if (!contexto) return falha(SEM_SESSAO);

  const { error } = await contexto.supabase
    .from("carteiras")
    .update({ nome: analise.data.nome })
    .eq("id", id)
    .eq("usuario_id", contexto.usuario.id);

  if (error) {
    if (error.code === "23505") return falha(NOME_REPETIDO, "nome");
    return erroDeBanco(error, "salvar a carteira");
  }

  revalidarNumeros();
  return sucesso();
}

/** Excluir uma carteira NÃO apaga o histórico: a FK do banco anula só a
    coluna `carteira_id`, e os lançamentos antigos passam a aparecer como
    "Sem carteira" — continuam somando no saldo geral. */
export async function excluirCarteira(id: string): Promise<Resultado> {
  const contexto = await contextoOuNulo();
  if (!contexto) return falha(SEM_SESSAO);

  const { error } = await contexto.supabase
    .from("carteiras")
    .delete()
    .eq("id", id)
    .eq("usuario_id", contexto.usuario.id);

  if (error) return erroDeBanco(error, "excluir a carteira");

  revalidarNumeros();
  return sucesso();
}
