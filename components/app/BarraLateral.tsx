import Link from "next/link";

import LogoRaiz from "@/components/marca/LogoRaiz";
import { NavegacaoLateral } from "./NavegacaoLateral";
import { MenuDoUsuario } from "./MenuDoUsuario";
import type { Perfil } from "@/lib/tipos";

/* =============================================================================
   Barra lateral (desktop)

   Fixa e com altura de tela cheia: a navegação não rola junto com o conteúdo.
   O rodapé traz quem está logado e o caminho para sair — o canto onde todo
   app coloca isso, e mexer nessa convenção só gastaria a paciência de quem
   usa.
   ========================================================================== */

export function BarraLateral({ perfil }: { perfil: Perfil }) {
  return (
    <aside className="sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-card px-4 py-5 lg:flex">
      <Link
        href="/"
        className="mb-7 flex items-center rounded-lg px-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <LogoRaiz />
      </Link>

      <NavegacaoLateral />

      <div className="mt-auto flex flex-col gap-3 pt-6">
        <div className="h-px bg-border" />
        <MenuDoUsuario perfil={perfil} />
      </div>
    </aside>
  );
}

/* =============================================================================
   Cabeçalho do celular

   Fica grudado no topo porque é ele que dá o contexto ("estou no Raiz, logado
   como X") enquanto a lista rola. A navegação em si está na barra inferior,
   ao alcance do polegar.
   ========================================================================== */

export function CabecalhoMobile({ perfil }: { perfil: Perfil }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/70 px-4 py-2.5 backdrop-blur-md lg:hidden">
      <Link
        href="/"
        className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <LogoRaiz tamanho="lg" />
      </Link>

      <MenuDoUsuario perfil={perfil} variante="compacta" />
    </header>
  );
}
