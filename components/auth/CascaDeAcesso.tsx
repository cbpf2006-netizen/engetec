import type { ReactNode } from "react";
import { ArrowDownLeft, ArrowUpRight, ShieldCheck, TrendingUp } from "lucide-react";

import LogoRaiz from "@/components/marca/LogoRaiz";
import { SeletorDeTema } from "@/components/app/MenuDoUsuario";

/* =============================================================================
   Casca das telas de acesso

   Duas colunas no desktop: o formulário à esquerda, onde a leitura começa, e
   um painel à direita explicando em três linhas o que o app faz. No celular
   só o formulário — a coluna de apoio viraria rolagem antes do campo de
   e-mail, que é o que a pessoa veio fazer.
   ========================================================================== */

export function CascaDeAcesso({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-5 py-6 sm:px-8 lg:px-14">
        <header className="flex items-center justify-between">
          <LogoRaiz />
          <SeletorDeTema />
        </header>

        <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <div className="mb-7 flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">{descricao}</p>
          </div>

          {children}
        </main>

        <footer className="text-xs text-muted-foreground">
          Seus dados ficam visíveis só para você.
        </footer>
      </div>

      <PainelDeApoio />
    </div>
  );
}

const PONTOS = [
  {
    icone: ArrowUpRight,
    titulo: "Entradas e saídas no mesmo lugar",
    texto: "Lance em segundos e veja o saldo mudar na hora.",
  },
  {
    icone: TrendingUp,
    titulo: "Investimento separado do caixa",
    texto: "O que você aporta sai do disponível e vira patrimônio.",
  },
  {
    icone: ArrowDownLeft,
    titulo: "Contas a pagar sem susto",
    texto: "O que vence, o que atrasou e o quanto falta.",
  },
];

function PainelDeApoio() {
  return (
    <aside className="hidden flex-col justify-center gap-10 border-l border-border bg-card px-14 py-12 lg:flex">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-primary">Organização financeira pessoal</p>
        <p className="max-w-md text-2xl leading-snug font-semibold tracking-tight">
          Saber para onde o dinheiro vai é o que faz sobrar dinheiro.
        </p>
      </div>

      <ul className="flex max-w-md flex-col gap-6">
        {PONTOS.map((ponto) => (
          <li key={ponto.titulo} className="flex gap-3.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
              <ponto.icone className="size-[1.05rem]" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">{ponto.titulo}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{ponto.texto}</p>
            </div>
          </li>
        ))}
      </ul>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
        Cada conta enxerga apenas os próprios lançamentos, com isolamento garantido no banco.
      </p>
    </aside>
  );
}
