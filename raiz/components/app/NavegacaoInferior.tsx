"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { SECOES, secaoAtiva } from "@/lib/navegacao";

/* =============================================================================
   Navegação inferior (celular)

   A barra lateral não vira "hambúrguer": as cinco seções são o app inteiro e
   merecem estar a um toque, na parte da tela que o polegar alcança. O menu
   escondido ficaria a dois toques de tudo.

   `pb-[env(safe-area-inset-bottom)]` mantém os alvos acima da barra de gestos
   do iPhone.
   ========================================================================== */

export function NavegacaoInferior() {
  const caminho = usePathname();

  return (
    <nav
      aria-label="Seções"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {SECOES.map((secao) => {
          const ativa = secaoAtiva(caminho, secao.href);

          return (
            <li key={secao.href}>
              <Link
                href={secao.href}
                aria-current={ativa ? "page" : undefined}
                className={cn(
                  "flex min-h-[3.25rem] flex-col items-center justify-center gap-1 px-1 py-2 text-[0.6875rem] font-medium transition-colors duration-150",
                  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                  ativa ? "text-primary" : "text-muted-foreground active:text-foreground"
                )}
              >
                <secao.icone className="size-[1.125rem]" />
                <span className="truncate">{secao.curto}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
