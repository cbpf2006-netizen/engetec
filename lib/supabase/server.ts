import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/* Cliente de servidor: lê/grava cookies de sessão do Supabase Auth.
   Usa a chave anon — RLS (auth.uid()) é quem garante que cada pessoa
   só vê os próprios dados, nunca uma service role aqui. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesParaGravar) => {
          try {
            cookiesParaGravar.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            /* Chamado de um Server Component (sem permissão de escrever
               cookie) — o middleware já cuida de renovar a sessão. */
          }
        },
      },
    }
  );
}
