"use server";

import { contextoOuNulo } from "@/lib/dados/sessao";
import { erroDeValidacao, esquemaPerfil } from "@/lib/esquemas";
import { falha, sucesso, type Resultado } from "@/lib/tipos";
import { erroDeBanco, SEM_SESSAO } from "./comum";
import { revalidatePath } from "next/cache";

export async function atualizarPerfil(entrada: unknown): Promise<Resultado> {
  const analise = esquemaPerfil.safeParse(entrada);
  if (!analise.success) return erroDeValidacao(analise.error);

  const contexto = await contextoOuNulo();
  if (!contexto) return falha(SEM_SESSAO);

  const { error } = await contexto.supabase
    .from("perfis")
    .update({ nome: analise.data.nome })
    .eq("id", contexto.usuario.id);

  if (error) return erroDeBanco(error, "salvar seu nome");

  // O nome aparece no rodapé da barra lateral, que é layout — revalidar só a
  // página deixaria o nome antigo na tela.
  revalidatePath("/", "layout");
  return sucesso();
}
