import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/* =============================================================================
   Volta dos links de e-mail (confirmação de conta e recuperação de senha)

   O Supabase manda a pessoa para cá com um `code` (fluxo PKCE) ou com um
   `token_hash` + `type` (links legados e templates customizados). Os dois
   terminam igual: sessão criada nos cookies e redirecionamento para dentro
   do app.

   `destino` é validado antes de virar redirecionamento — aceitar uma URL
   qualquer transformaria esta rota em um redirecionador aberto, pronto para
   phishing.
   ========================================================================== */

function destinoSeguro(bruto: string | null): string {
  if (!bruto || !bruto.startsWith("/") || bruto.startsWith("//")) return "/";
  return bruto;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const destino = destinoSeguro(searchParams.get("destino"));
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const tipo = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(destino, origin));
  } else if (tokenHash && tipo) {
    const { error } = await supabase.auth.verifyOtp({ type: tipo, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(new URL(destino, origin));
  }

  const login = new URL("/login", origin);
  login.searchParams.set("erro", "link-invalido");
  return NextResponse.redirect(login);
}
