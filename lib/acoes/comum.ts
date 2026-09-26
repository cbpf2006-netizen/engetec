import "server-only";
import { revalidatePath } from "next/cache";
import type { PostgrestError } from "@supabase/supabase-js";
import { falha, type Resultado } from "@/lib/tipos";

/* =============================================================================
   Infra comum das Server Actions

   Toda escrita termina revalidando as rotas que mostram o número alterado.
   Um lançamento de saída muda o card de saídas, o saldo do painel, o gráfico
   e a lista — invalidar só a página atual deixaria as outras mentindo até o
   próximo recarregamento.
   ========================================================================== */

export const ROTAS_COM_NUMEROS = [
  "/",
  "/entradas",
  "/saidas",
  "/investimentos",
  "/contas",
  "/carteira",
] as const;

export function revalidarNumeros(): void {
  for (const rota of ROTAS_COM_NUMEROS) revalidatePath(rota);
}

export const SEM_SESSAO = "Sua sessão expirou. Entre novamente para continuar.";

/** Traduz o erro do Postgres em algo que faça sentido para quem está usando o
    app. O texto original nunca chega à tela: além de ser inglês técnico, pode
    revelar nomes de coluna e detalhes de constraint. */
export function erroDeBanco(erro: PostgrestError, acao: string): Resultado<never> {
  // 23505: violação de unicidade — no nosso schema, sempre nome repetido.
  if (erro.code === "23505") return falha("Já existe um modelo com esse nome.");
  // 23503/23514: referência ou regra do banco recusada.
  if (erro.code === "23503") return falha("O modelo escolhido não existe mais.");
  if (erro.code === "23514") return falha("Algum valor informado está fora do permitido.");
  // 42501: RLS recusou — tentativa de mexer em dado de outra conta.
  if (erro.code === "42501") return falha("Você não tem acesso a esse registro.");

  console.error(`[raiz] ${acao}:`, erro.code, erro.message);
  return falha(`Não foi possível ${acao}. Tente de novo.`);
}
