import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESSAO, criarValorSessao, senhaConfere } from "@/lib/auth-painel";

export async function POST(request: NextRequest) {
  const { senha } = await request.json().catch(() => ({ senha: "" }));

  if (typeof senha !== "string" || !senhaConfere(senha)) {
    return NextResponse.json({ erro: "Senha incorreta." }, { status: 401 });
  }

  const { valor, expiraEm } = criarValorSessao();
  const resposta = NextResponse.json({ ok: true });
  resposta.cookies.set(COOKIE_SESSAO, valor, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiraEm),
  });
  return resposta;
}
