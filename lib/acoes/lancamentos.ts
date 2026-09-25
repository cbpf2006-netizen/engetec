"use server";

import { contextoOuNulo } from "@/lib/dados/sessao";
import { erroDeValidacao, esquemaInvestimento, esquemaTransacao } from "@/lib/esquemas";
import { falha, sucesso, type Resultado } from "@/lib/tipos";
import { erroDeBanco, revalidarNumeros, SEM_SESSAO } from "./comum";

/* =============================================================================
   Entradas, saídas e investimentos — escrita

   Toda função valida com Zod antes de tocar no banco e confere a sessão
   depois: uma Server Action é um POST público, então nem a validação nem a
   autorização podem ficar só no formulário.

   A cláusula `.eq("usuario_id", usuario.id)` em update/delete é redundante
   com a RLS de propósito. Se um dia uma policy for afrouxada por engano, a
   aplicação continua não mexendo no dado de ninguém.
   ========================================================================== */

export async function criarTransacao(entrada: unknown): Promise<Resultado> {
  const analise = esquemaTransacao.safeParse(entrada);
  if (!analise.success) return erroDeValidacao(analise.error);

  const contexto = await contextoOuNulo();
  if (!contexto) return falha(SEM_SESSAO);

  const { error } = await contexto.supabase
    .from("transacoes")
    .insert({ ...analise.data, usuario_id: contexto.usuario.id });

  if (error) return erroDeBanco(error, "registrar o lançamento");

  revalidarNumeros();
  return sucesso();
}

export async function atualizarTransacao(id: string, entrada: unknown): Promise<Resultado> {
  const analise = esquemaTransacao.safeParse(entrada);
  if (!analise.success) return erroDeValidacao(analise.error);

  const contexto = await contextoOuNulo();
  if (!contexto) return falha(SEM_SESSAO);

  const { error } = await contexto.supabase
    .from("transacoes")
    .update(analise.data)
    .eq("id", id)
    .eq("usuario_id", contexto.usuario.id);

  if (error) return erroDeBanco(error, "salvar o lançamento");

  revalidarNumeros();
  return sucesso();
}

export async function excluirTransacao(id: string): Promise<Resultado> {
  const contexto = await contextoOuNulo();
  if (!contexto) return falha(SEM_SESSAO);

  const { error } = await contexto.supabase
    .from("transacoes")
    .delete()
    .eq("id", id)
    .eq("usuario_id", contexto.usuario.id);

  if (error) return erroDeBanco(error, "excluir o lançamento");

  revalidarNumeros();
  return sucesso();
}

/* =============================================================================
   Investimentos
   ========================================================================== */

export async function criarInvestimento(entrada: unknown): Promise<Resultado> {
  const analise = esquemaInvestimento.safeParse(entrada);
  if (!analise.success) return erroDeValidacao(analise.error);

  const contexto = await contextoOuNulo();
  if (!contexto) return falha(SEM_SESSAO);

  const { error } = await contexto.supabase
    .from("investimentos")
    .insert({ ...analise.data, usuario_id: contexto.usuario.id });

  if (error) return erroDeBanco(error, "registrar o investimento");

  revalidarNumeros();
  return sucesso();
}

export async function atualizarInvestimento(id: string, entrada: unknown): Promise<Resultado> {
  const analise = esquemaInvestimento.safeParse(entrada);
  if (!analise.success) return erroDeValidacao(analise.error);

  const contexto = await contextoOuNulo();
  if (!contexto) return falha(SEM_SESSAO);

  const { error } = await contexto.supabase
    .from("investimentos")
    .update(analise.data)
    .eq("id", id)
    .eq("usuario_id", contexto.usuario.id);

  if (error) return erroDeBanco(error, "salvar o investimento");

  revalidarNumeros();
  return sucesso();
}

export async function excluirInvestimento(id: string): Promise<Resultado> {
  const contexto = await contextoOuNulo();
  if (!contexto) return falha(SEM_SESSAO);

  const { error } = await contexto.supabase
    .from("investimentos")
    .delete()
    .eq("id", id)
    .eq("usuario_id", contexto.usuario.id);

  if (error) return erroDeBanco(error, "excluir o investimento");

  revalidarNumeros();
  return sucesso();
}
