"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { contextoOuNulo } from "@/lib/dados/sessao";
import { falha, sucesso, type Resultado } from "@/lib/tipos";
import { chamarFuncao } from "@/lib/supabase/funcoes";
import { SEM_SESSAO } from "./comum";

/* =============================================================================
   Administração — escrita
   ========================================================================== */

/** Remove a conta e tudo o que é dela (lançamentos, carteiras, modelos, foto),
    sem volta — a pessoa pode se cadastrar de novo depois. Quem executa é a
    função `remover-usuario` do Supabase, que confere por conta própria que
    quem pede é administrador, e que recusa remover a si mesmo ou outro
    administrador. */
export async function removerUsuario(usuarioId: string): Promise<Resultado> {
  const id = z.string().uuid().safeParse(usuarioId);
  if (!id.success) return falha("Usuário inválido.");

  const contexto = await contextoOuNulo();
  if (!contexto) return falha(SEM_SESSAO);

  const { data: sessao } = await contexto.supabase.auth.getSession();
  const token = sessao.session?.access_token;
  if (!token) return falha(SEM_SESSAO);

  const resposta = await chamarFuncao("remover-usuario", { usuario_id: id.data }, token);
  if (!resposta.ok) return falha(resposta.erro);

  revalidatePath("/administrar");
  return sucesso();
}
