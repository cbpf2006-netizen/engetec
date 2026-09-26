import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Receipt, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BotaoNovoLancamento } from "./AcoesDeLancamento";
import type { Modelo } from "@/lib/tipos";

/* =============================================================================
   Primeiro acesso

   Conta nova não tem saldo, gráfico nem histórico — mostrar cartões zerados e
   gráficos vazios só ensinaria que o app é inútil. No lugar, a tela explica em
   uma frase o que fazer e põe os dois botões que destravam tudo.

   Sem tour, sem passo 1 de 4: dois lançamentos e o painel de verdade aparece.
   A conta nasce sem modelo nem carteira; o primeiro lançamento já cria os
   dois na própria janela de registro.
   ========================================================================== */

const CAMINHOS = [
  {
    icone: ArrowUpRight,
    titulo: "Registre o que entra",
    texto: "Salário, freelance, mesada. Cada entrada soma no seu caixa.",
  },
  {
    icone: ArrowDownLeft,
    titulo: "Registre o que sai",
    texto: "Mercado, moradia, transporte. As saídas viram a sua distribuição de gastos.",
  },
  {
    icone: TrendingUp,
    titulo: "Separe o que investe",
    texto: "O aporte sai do caixa livre e passa a contar como patrimônio.",
  },
  {
    icone: Receipt,
    titulo: "Anote o que vence",
    texto: "Contas a pagar avisam o que está próximo e o que passou do prazo.",
  },
];

export function PrimeiroAcesso({
  nome,
  modelosDeEntrada,
  modelosDeSaida,
}: {
  nome: string;
  modelosDeEntrada: Modelo[];
  modelosDeSaida: Modelo[];
}) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 rounded-2xl bg-card p-6 ring-1 ring-border sm:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
            Comece organizando sua vida financeira, {nome}.
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Seu painel monta a partir dos seus lançamentos. Registre a primeira entrada ou a
            primeira saída e o saldo, os gráficos e o histórico aparecem na hora.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <BotaoNovoLancamento
            fluxo="entrada"
            modelos={modelosDeEntrada}
            rotulo="Adicionar entrada"
            tamanho="lg"
          />
          <BotaoNovoLancamento
            fluxo="saida"
            modelos={modelosDeSaida}
            rotulo="Adicionar saída"
            variante="outline"
            tamanho="lg"
          />
        </div>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {CAMINHOS.map((caminho) => (
          <li
            key={caminho.titulo}
            className="flex gap-3.5 rounded-2xl bg-card p-5 ring-1 ring-border"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-muted-foreground">
              <caminho.icone className="size-[1.05rem]" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">{caminho.titulo}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{caminho.texto}</p>
            </div>
          </li>
        ))}
      </ul>

      <p className="text-sm text-muted-foreground">
        Sua conta começa sem modelos nem carteiras: ao registrar o primeiro lançamento você cria os
        seus na hora, ou os gerencia em{" "}
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-sm"
          render={<Link href="/saidas" />}
        >
          qualquer aba
        </Button>
        .
      </p>
    </div>
  );
}
