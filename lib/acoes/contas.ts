"use server";

import { contextoOuNulo } from "@/lib/dados/sessao";
import { erroDeValidacao, esquemaConta } from "@/lib/esquemas";
import { ehDataValida, hoje } from "@/lib/periodo";
import { falha, sucesso, type Resultado } from "@/lib/tipos";
import { erroDeBanco, revalidarNumeros, SEM_SESSAO } from "./comum";

/* =============================================================================
   Contas a pagar — escrita

   Pagar e estornar não são updates simples: cada um mexe em duas tabelas e
   precisa ser tudo-ou-nada. Quem faz isso é a função `pagar_conta` /
   `estornar_conta` no Postgres (ver a migration) — aqui só chamamos.
   ========================================================================== */

export async function criarConta(entrada: unknown): Promise<Resultado> {
  const analise = esquemaConta.safeParse(entrada);
  if (!analise.success) return erroDeValidacao(analise.error);

  const contexto = await contextoOuNulo();
  if (!contexto) return falha(SEM_SESSAO);

  const { error } = await contexto.supabase
    .from("contas")
    .insert({ ...analise.data, usuario_id: contexto.usuario.id });

  if (error) return erroDeBanco(error, "criar a conta");

  revalidarNumeros();
  return sucesso();
}

export async function atualizarConta(id: string, entrada: unknown): Promise<Resultado> {
  const analise = esquemaConta.safeParse(entrada);
  if (!analise.success) return erroDeValidacao(analise.error);

  const contexto = await contextoOuNulo();
  if (!contexto) return falha(SEM_SESSAO);

  const { error } = await contexto.supabase
    .from("contas")
    .update(analise.data)
    .eq("id", id)
    .eq("usuario_id", contexto.usuario.id);

  if (error) return erroDeBanco(error, "salvar a conta");

  revalidarNumeros();
  return sucesso();
}

export async function excluirConta(id: string): Promise<Resultado> {
  const contexto = await contextoOuNulo();
  if (!contexto) return falha(SEM_SESSAO);

  const { error } = await contexto.supabase
    .from("contas")
    .delete()
    .eq("id", id)
    .eq("usuario_id", contexto.usuario.id);

  if (error) return erroDeBanco(error, "excluir a conta");

  revalidarNumeros();
  return sucesso();
}

/** Marcar como paga: cria a saída no caixa, na data do pagamento, e amarra as
    duas linhas. Desmarcar apaga essa saída. A data vem daqui porque o
    Postgres roda em UTC e viraria o dia três horas antes do Brasil. */
export async function alternarPagamento(
  id: string,
  pago: boolean,
  dataDoPagamento?: string
): Promise<Resultado> {
  const contexto = await contextoOuNulo();
  if (!contexto) return falha(SEM_SESSAO);

  if (!pago) {
    const { error } = await contexto.supabase.rpc("estornar_conta", { p_conta: id });
    if (error) return erroDeBanco(error, "desfazer o pagamento");

    revalidarNumeros();
    return sucesso();
  }

  const data = ehDataValida(dataDoPagamento) ? dataDoPagamento : hoje();
  const { error } = await contexto.supabase.rpc("pagar_conta", { p_conta: id, p_data: data });
  if (error) return erroDeBanco(error, "marcar a conta como paga");

  revalidarNumeros();
  return sucesso();
}
