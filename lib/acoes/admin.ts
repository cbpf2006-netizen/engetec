"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { contextoOuNulo } from "@/lib/dados/sessao";
import { falha, sucesso, type Resultado } from "@/lib/tipos";
import { SEM_SESSAO } from "./comum";

/* =============================================================================
   Administração — escrita

   Liberar acesso é uma decisão humana, tomada depois de conferir o pagamento.
   Quem impõe que só o administrador pode fazê-lo é o Postgres: a função
   `admin_liberar_acesso` confere `e_admin()` por conta própria. Esta action só
   a chama — não há como um usuário comum liberar a si mesmo por aqui nem por
   chamada direta à API.
   ========================================================================== */

export async function liberarAcesso(usuarioId: string): Promise<Resultado> {
  const id = z.string().uuid().safeParse(usuarioId);
  if (!id.success) return falha("Usuário inválido.");

  const contexto = await contextoOuNulo();
  if (!contexto) return falha(SEM_SESSAO);

  const { error } = await contexto.supabase.rpc("admin_liberar_acesso", { p_usuario: id.data });

  if (error) {
    if (error.code === "42501") return falha("Você não tem permissão para liberar acessos.");
    if (error.code === "P0002") return falha("Esse usuário já foi liberado ou não existe mais.");
    console.error("[raiz] liberar acesso:", error.code, error.message);
    return falha("Não foi possível liberar o acesso. Tente de novo.");
  }

  revalidatePath("/administrar");
  return sucesso();
}
