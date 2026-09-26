"use client";

import { useState, type ReactNode } from "react";
import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DialogoLancamento } from "./DialogoLancamento";
import { ROTULO_FLUXO, type Fluxo, type Modelo } from "@/lib/tipos";

/* =============================================================================
   Gatilhos de lançamento

   `BotaoNovoLancamento` é o botão comum (cabeçalho de bloco, estado vazio).
   `BotoesFlutuantes` são os dois atalhos fixos na tela.

   Os dois abrem o mesmo diálogo. O botão não sabe nada de formulário: só
   controla o `aberto`.
   ========================================================================== */

export function BotaoNovoLancamento({
  fluxo,
  modelos,
  rotulo,
  variante = "default",
  tamanho = "default",
  comIcone = true,
  className,
}: {
  fluxo: Fluxo;
  modelos: Modelo[];
  rotulo?: ReactNode;
  variante?: "default" | "outline" | "secondary" | "ghost";
  tamanho?: "default" | "sm" | "lg";
  comIcone?: boolean;
  className?: string;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <Button variant={variante} size={tamanho} className={className} onClick={() => setAberto(true)}>
        {comIcone && <Plus />}
        {rotulo ?? `Nova ${ROTULO_FLUXO[fluxo].toLowerCase()}`}
      </Button>

      <DialogoLancamento
        fluxo={fluxo}
        modelos={modelos}
        aberto={aberto}
        aoMudarAberto={setAberto}
      />
    </>
  );
}

/* =============================================================================
   Botões flutuantes

   Ficam acima da barra de navegação do celular (nunca cobrindo um alvo de
   toque) e no canto inferior direito no desktop. Entrada é a ação primária,
   em verde cheio; saída vem em coral, com ícone de menos — sinal, cor e
   rótulo, para o par não depender de distinguir verde de coral.
   ========================================================================== */

export function BotoesFlutuantes({
  modelosDeEntrada,
  modelosDeSaida,
}: {
  modelosDeEntrada: Modelo[];
  modelosDeSaida: Modelo[];
}) {
  const [aberto, setAberto] = useState<Fluxo | null>(null);

  return (
    <>
      <div
        className={cn(
          "fixed right-4 z-30 flex flex-col items-end gap-2.5 lg:right-6 lg:bottom-6",
          "bottom-[calc(3.75rem+env(safe-area-inset-bottom))]"
        )}
      >
        <button
          type="button"
          onClick={() => setAberto("saida")}
          className={cn(
            "flex h-11 items-center gap-2 rounded-full bg-card pr-4 pl-3 text-sm font-semibold text-saida-texto ring-1 ring-border",
            "shadow-flutuante transition-transform duration-150",
            "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          )}
        >
          <Minus className="size-4" />
          Saída
        </button>

        <button
          type="button"
          onClick={() => setAberto("entrada")}
          className={cn(
            "flex h-12 items-center gap-2 rounded-full bg-primary pr-5 pl-4 text-sm font-semibold text-primary-foreground",
            "shadow-[0_6px_20px_-4px_color-mix(in_oklab,var(--primary)_45%,transparent)] transition-transform duration-150",
            "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          )}
        >
          <Plus className="size-[1.125rem]" />
          Entrada
        </button>
      </div>

      <DialogoLancamento
        fluxo="entrada"
        modelos={modelosDeEntrada}
        aberto={aberto === "entrada"}
        aoMudarAberto={(estaAberto) => setAberto(estaAberto ? "entrada" : null)}
      />
      <DialogoLancamento
        fluxo="saida"
        modelos={modelosDeSaida}
        aberto={aberto === "saida"}
        aoMudarAberto={(estaAberto) => setAberto(estaAberto ? "saida" : null)}
      />
    </>
  );
}
