import "server-only";
import { cache } from "react";
import { erroDeConsulta } from "./erros";
import { exigirContexto } from "./sessao";
import type { Fluxo, Modelo } from "@/lib/tipos";

/* Modelos ativos de um fluxo, na ordem que o usuário definiu. Arquivados
   ficam fora dos seletores mas continuam existindo para os lançamentos
   antigos não perderem o nome. */
export async function listarModelos(fluxo: Fluxo, incluirArquivados = false): Promise<Modelo[]> {
  const { supabase, usuario } = await exigirContexto();

  let consulta = supabase
    .from("modelos")
    .select("id, fluxo, nome, icone, cor, ordem, arquivado, carteira_id")
    .eq("usuario_id", usuario.id)
    .eq("fluxo", fluxo)
    .order("ordem", { ascending: true })
    .order("nome", { ascending: true });

  if (!incluirArquivados) consulta = consulta.eq("arquivado", false);

  const { data, error } = await consulta;
  if (error) throw erroDeConsulta("Falha ao carregar modelos", error);

  return (data ?? []) as Modelo[];
}

/** Os três fluxos numa ida só — é o que a casca do app passa para os
    diálogos de lançamento. Arquivados ficam de fora: quem não usa mais um
    modelo não quer vê-lo ao lançar. */
export const listarModelosPorFluxo = cache(async (): Promise<Record<Fluxo, Modelo[]>> => {
  const { supabase, usuario } = await exigirContexto();

  const { data, error } = await supabase
    .from("modelos")
    .select("id, fluxo, nome, icone, cor, ordem, arquivado, carteira_id")
    .eq("usuario_id", usuario.id)
    .eq("arquivado", false)
    .order("ordem", { ascending: true });

  if (error) throw erroDeConsulta("Falha ao carregar modelos", error);

  const vazio: Record<Fluxo, Modelo[]> = { entrada: [], saida: [], investimento: [] };
  for (const modelo of (data ?? []) as Modelo[]) vazio[modelo.fluxo].push(modelo);
  return vazio;
});
