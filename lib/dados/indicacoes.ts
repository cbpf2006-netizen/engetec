import "server-only";
import { erroDeConsulta } from "./erros";
import { exigirContexto } from "./sessao";
import type { Indicado } from "@/lib/tipos";

/* =============================================================================
   Indicações — leitura

   Quem cada pessoa indicou. A função `minhas_indicacoes()` do Postgres já
   filtra por `indicado_por_id = auth.uid()` e devolve só nome, acesso e data
   — nada de e-mail nem telefone de quem foi indicado.
   ========================================================================== */

export async function minhasIndicacoes(): Promise<Indicado[]> {
  const { supabase } = await exigirContexto();

  const { data, error } = await supabase.rpc("minhas_indicacoes");
  if (error) throw erroDeConsulta("Falha ao carregar indicações", error);

  return (data ?? []) as Indicado[];
}
