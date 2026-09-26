"use client";

import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { definirValoresOcultos, useValoresOcultos } from "@/lib/valores-ocultos";

/* =============================================================================
   Mostrar / ocultar valores

   Dois botões lado a lado — olho aberto (mostrar) e olho fechado (ocultar) — em
   vez de um interruptor de um botão só: o estado atual fica escrito no próprio
   controle (o botão do estado ativo aparece "apertado"), e não depende de a
   pessoa adivinhar o que o ícone único significa naquele momento.

   A escolha vale para o app inteiro e fica salva neste aparelho. Ver
   lib/valores-ocultos.ts.
   ========================================================================== */

export function AlternarValores() {
  const ocultos = useValoresOcultos();

  return (
    <div
      role="group"
      aria-label="Valores na tela"
      className="inline-flex items-center gap-0.5 rounded-xl bg-secondary p-1"
    >
      <Botao
        rotulo="Mostrar valores"
        ativo={!ocultos}
        aoClicar={() => definirValoresOcultos(false)}
        icone={<Eye className="size-[1.125rem]" />}
      />
      <Botao
        rotulo="Ocultar valores"
        ativo={ocultos}
        aoClicar={() => definirValoresOcultos(true)}
        icone={<EyeOff className="size-[1.125rem]" />}
      />
    </div>
  );
}

function Botao({
  rotulo,
  ativo,
  aoClicar,
  icone,
}: {
  rotulo: string;
  ativo: boolean;
  aoClicar: () => void;
  icone: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      aria-label={rotulo}
      title={rotulo}
      onClick={aoClicar}
      className={cn(
        "grid size-9 place-items-center rounded-lg transition-all duration-150 active:scale-95",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        ativo
          ? "bg-card text-foreground shadow-cartao ring-1 ring-border"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {icone}
    </button>
  );
}
