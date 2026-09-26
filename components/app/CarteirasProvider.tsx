"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Carteira } from "@/lib/tipos";

/* =============================================================================
   Carteiras no cliente

   As carteiras são carregadas uma vez na casca do app e descem por contexto,
   não por props. Todo diálogo de lançamento precisa delas, e eles são abertos
   de sete lugares diferentes — passar a lista de mão em mão obrigaria cada
   página intermediária a conhecer um dado que ela mesma não usa.
   ========================================================================== */

const Contexto = createContext<Carteira[]>([]);

export function CarteirasProvider({
  carteiras,
  children,
}: {
  carteiras: Carteira[];
  children: ReactNode;
}) {
  return <Contexto.Provider value={carteiras}>{children}</Contexto.Provider>;
}

export function useCarteiras(): Carteira[] {
  return useContext(Contexto);
}
