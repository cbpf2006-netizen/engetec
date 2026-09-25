import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Perfil } from "@/lib/tipos";

/* =============================================================================
   Sessão

   `getUser()` valida o token no servidor do Supabase; `getSession()` apenas lê
   o cookie, que é dado enviado pelo navegador e portanto não é prova de nada.
   Toda leitura e toda escrita deste app passam por `getUser()`.

   O proxy (proxy.ts) já barra quem não está autenticado, mas a checagem é
   repetida aqui de propósito: uma Server Action é um POST acessível
   diretamente, sem passar pela navegação do app.
   ========================================================================== */

export type Contexto = {
  supabase: SupabaseClient;
  usuario: User;
};

export async function usuarioAtual(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Para páginas: manda para o login quem não estiver autenticado.

    Embrulhado em `cache` do React: uma página do painel faz meia dúzia de
    consultas, e sem isto cada uma pagaria uma ida ao Supabase só para validar
    o mesmo token. O cache vale por requisição — não vaza sessão entre
    usuários. */
export const exigirContexto = cache(async (): Promise<Contexto> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  return { supabase, usuario: user };
});

/** Para Server Actions: devolve null em vez de redirecionar, porque quem
    chamou precisa transformar isso numa mensagem de erro para o usuário. */
export async function contextoOuNulo(): Promise<Contexto | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? { supabase, usuario: user } : null;
}

export async function perfilAtual(): Promise<Perfil | null> {
  const { supabase, usuario } = await exigirContexto();

  const { data } = await supabase
    .from("perfis")
    .select("id, nome")
    .eq("id", usuario.id)
    .maybeSingle();

  return {
    id: usuario.id,
    email: usuario.email ?? "",
    // O perfil é criado por trigger no cadastro; o fallback cobre contas
    // criadas antes da migration rodar.
    nome: data?.nome ?? (usuario.user_metadata?.nome as string | undefined) ?? null,
  };
}
