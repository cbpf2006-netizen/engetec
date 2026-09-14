import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/* =============================================================================
   Renovação de sessão + porteiro das rotas

   Roda antes de cada navegação: renova o token do Supabase (gravando os
   cookies novos na resposta) e decide quem entra onde.

   Isto é uma checagem OTIMISTA de rota, não a autorização do app. Quem
   garante que ninguém lê o dado de outra pessoa é a RLS no Postgres; o proxy
   só evita que uma pessoa deslogada veja o esqueleto da tela antes de ser
   mandada ao login.
   ========================================================================== */

/** Rotas que existem para quem ainda não entrou. Quem já está autenticado é
    devolvido ao app se tentar acessá-las. */
const ROTAS_PUBLICAS = ["/login", "/cadastro", "/recuperar"];

/** Troca de código por sessão (link de e-mail): precisa passar sem sessão. */
const ROTAS_LIVRES = ["/auth"];

function combina(caminho: string, rotas: string[]): boolean {
  return rotas.some((rota) => caminho === rota || caminho.startsWith(`${rota}/`));
}

export async function atualizarSessao(request: NextRequest) {
  let resposta = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesParaGravar) => {
          cookiesParaGravar.forEach(({ name, value }) => request.cookies.set(name, value));
          resposta = NextResponse.next({ request });
          cookiesParaGravar.forEach(({ name, value, options }) =>
            resposta.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const caminho = request.nextUrl.pathname;

  if (combina(caminho, ROTAS_LIVRES)) return resposta;

  // getUser() valida o token no servidor do Supabase. getSession() só leria o
  // cookie, que é dado vindo do navegador e não prova nada.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const publica = combina(caminho, ROTAS_PUBLICAS);

  if (!user && !publica) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/login";
    destino.search = "";
    // Guarda onde a pessoa queria chegar para levá-la lá depois do login.
    if (caminho !== "/") destino.searchParams.set("destino", caminho);
    return NextResponse.redirect(destino);
  }

  if (user && publica) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/";
    destino.search = "";
    return NextResponse.redirect(destino);
  }

  return resposta;
}
