import { type NextRequest } from "next/server";
import { atualizarSessao } from "@/lib/supabase/proxy";

/* No Next.js 16 o antigo `middleware.ts` passou a se chamar `proxy.ts`.
   A lógica vive em lib/supabase/proxy.ts. */
export async function proxy(request: NextRequest) {
  return atualizarSessao(request);
}

export const config = {
  matcher: [
    /* Tudo menos arquivos estáticos e imagens: nenhum deles precisa de
       sessão, e checar token em cada ícone custaria uma ida ao Supabase. */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico|woff2?)$).*)",
  ],
};
