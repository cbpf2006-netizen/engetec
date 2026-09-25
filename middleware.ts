import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESSAO, sessaoValida } from "@/lib/auth-painel";

const ROTA_LOGIN = "/painel/login";

/* auth-painel.ts usa crypto do Node (createHmac/timingSafeEqual), que
   o runtime Edge padrão do middleware não tem — força runtime Node. */
export const runtime = "nodejs";

export function middleware(request: NextRequest) {
  const caminho = request.nextUrl.pathname;
  const logado = sessaoValida(request.cookies.get(COOKIE_SESSAO)?.value);
  const noLogin = caminho === ROTA_LOGIN;

  if (!logado && !noLogin) {
    const destino = request.nextUrl.clone();
    destino.pathname = ROTA_LOGIN;
    destino.searchParams.set("destino", caminho);
    return NextResponse.redirect(destino);
  }

  if (logado && noLogin) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/painel";
    destino.search = "";
    return NextResponse.redirect(destino);
  }

  return NextResponse.next();
}

/* Só o painel passa por aqui — o site institucional não paga o custo
   desta checagem em cada requisição. */
export const config = {
  matcher: ["/painel/:path*"],
};
