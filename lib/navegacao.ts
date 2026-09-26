import {
  ArrowDownLeft,
  ArrowUpRight,
  LayoutDashboard,
  Receipt,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/* =============================================================================
   Seções do app

   Uma lista só, consumida pela barra lateral (desktop) e pela barra inferior
   (celular). Acrescentar uma aba no futuro é acrescentar um item aqui —
   nenhum componente de navegação precisa ser tocado.

   `curto` é o rótulo da barra inferior do celular, onde cada aba tem ~64px.
   ========================================================================== */

export type Secao = {
  href: string;
  rotulo: string;
  curto: string;
  icone: LucideIcon;
};

export const SECOES: Secao[] = [
  { href: "/", rotulo: "Início", curto: "Início", icone: LayoutDashboard },
  { href: "/entradas", rotulo: "Entradas", curto: "Entradas", icone: ArrowUpRight },
  { href: "/saidas", rotulo: "Saídas", curto: "Saídas", icone: ArrowDownLeft },
  { href: "/investimentos", rotulo: "Investimentos", curto: "Investir", icone: TrendingUp },
  { href: "/contas", rotulo: "Contas a pagar", curto: "Contas", icone: Receipt },
  { href: "/carteira", rotulo: "Carteira", curto: "Carteira", icone: Wallet },
];

/** A raiz só está ativa em correspondência exata; as outras seções aceitam
    sub-rotas, para uma futura tela de detalhe manter a aba acesa. */
export function secaoAtiva(caminho: string, href: string): boolean {
  return href === "/" ? caminho === "/" : caminho === href || caminho.startsWith(`${href}/`);
}
