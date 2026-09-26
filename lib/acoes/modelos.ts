"use server";

import { contextoOuNulo } from "@/lib/dados/sessao";
import { erroDeValidacao, esquemaModelo } from "@/lib/esquemas";
import { proximaCorLivre } from "@/lib/catalogo";
import { falha, sucesso, type Modelo, type Resultado } from "@/lib/tipos";
import { erroDeBanco, revalidarNumeros, SEM_SESSAO } from "./comum";

/* =============================================================================
   Modelos — escrita

   Criar devolve o modelo criado, e não só "ok": o diálogo de novo lançamento
   permite criar um modelo no meio do fluxo e precisa já selecioná-lo, sem
   fechar o formulário nem esperar a página inteira revalidar.
   ========================================================================== */

export async function criarModelo(entrada: unknown): Promise<Resultado<Modelo>> {
  const analise = esquemaModelo.safeParse(entrada);
  if (!analise.success) return erroDeValidacao(analise.error);

  const contexto = await contextoOuNulo();
  if (!contexto) return falha(SEM_SESSAO);

  const { supabase, usuario } = contexto;
  const { fluxo, nome, icone } = analise.data;
  const carteira_id = fluxo === "investimento" ? (analise.data.carteira_id ?? null) : null;

  // Sem cor explícita, segue a ordem validada da paleta em vez de sortear.
  const { data: existentes } = await supabase
    .from("modelos")
    .select("cor, ordem")
    .eq("usuario_id", usuario.id)
    .eq("fluxo", fluxo);

  const cor =
    (entrada as { cor?: string })?.cor ??
    proximaCorLivre((existentes ?? []).map((m) => m.cor as string), fluxo);

  const ordem = Math.max(0, ...(existentes ?? []).map((m) => Number(m.ordem))) + 1;

  const { data, error } = await supabase
    .from("modelos")
    .insert({ usuario_id: usuario.id, fluxo, nome, icone, cor, ordem, carteira_id })
    .select("id, fluxo, nome, icone, cor, ordem, arquivado, carteira_id")
    .single();

  if (error) return erroDeBanco(error, "criar o modelo");

  revalidarNumeros();
  return sucesso(data as Modelo);
}

export async function atualizarModelo(id: string, entrada: unknown): Promise<Resultado> {
  const analise = esquemaModelo.safeParse(entrada);
  if (!analise.success) return erroDeValidacao(analise.error);

  const contexto = await contextoOuNulo();
  if (!contexto) return falha(SEM_SESSAO);

  const { fluxo, nome, icone, cor } = analise.data;
  // Só tipos de investimento têm carteira; nos demais a coluna nunca é tocada.
  const carteira = fluxo === "investimento" ? { carteira_id: analise.data.carteira_id ?? null } : {};

  const { error } = await contexto.supabase
    .from("modelos")
    .update({ nome, icone, cor, ...carteira })
    .eq("id", id)
    .eq("usuario_id", contexto.usuario.id);

  if (error) return erroDeBanco(error, "salvar o modelo");

  revalidarNumeros();
  return sucesso();
}

/** Excluir um modelo NÃO apaga o histórico: a FK do banco anula só a coluna
    `modelo_id`, e os lançamentos antigos passam a aparecer como "Sem modelo".
    Quem quiser preservar o rótulo deve arquivar em vez de excluir. */
export async function excluirModelo(id: string): Promise<Resultado> {
  const contexto = await contextoOuNulo();
  if (!contexto) return falha(SEM_SESSAO);

  const { error } = await contexto.supabase
    .from("modelos")
    .delete()
    .eq("id", id)
    .eq("usuario_id", contexto.usuario.id);

  if (error) return erroDeBanco(error, "excluir o modelo");

  revalidarNumeros();
  return sucesso();
}

/** Arquivar tira o modelo dos seletores mantendo o nome nos lançamentos
    antigos — o caminho certo para "não uso mais isso". */
export async function alternarArquivoDoModelo(
  id: string,
  arquivado: boolean
): Promise<Resultado> {
  const contexto = await contextoOuNulo();
  if (!contexto) return falha(SEM_SESSAO);

  const { error } = await contexto.supabase
    .from("modelos")
    .update({ arquivado })
    .eq("id", id)
    .eq("usuario_id", contexto.usuario.id);

  if (error) return erroDeBanco(error, arquivado ? "arquivar o modelo" : "reativar o modelo");

  revalidarNumeros();
  return sucesso();
}
