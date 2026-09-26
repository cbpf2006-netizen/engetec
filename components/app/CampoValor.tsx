"use client";

import { useId } from "react";

import { cn } from "@/lib/utils";
import { mascaraMoeda } from "@/lib/formato";
import { Label } from "@/components/ui/label";

/* =============================================================================
   Campo de valor

   O campo mais usado do app, e por isso o maior: tipografia grande e
   tabular, com "R$" fixo à esquerda como adorno (não como texto digitável).

   A máscara trabalha em centavos: digitar "125000" mostra "1.250,00". Isso
   elimina a dúvida de onde vai a vírgula no teclado do celular, que é onde a
   maioria dos lançamentos acontece.
   ========================================================================== */

export function CampoValor({
  valor,
  aoMudar,
  erro,
  rotulo = "Valor",
  autoFoco = false,
}: {
  valor: string;
  aoMudar: (valor: string) => void;
  erro?: string;
  rotulo?: string;
  autoFoco?: boolean;
}) {
  const id = useId();
  const idDoErro = `${id}-erro`;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{rotulo}</Label>

      <div
        className={cn(
          "flex items-center gap-2.5 rounded-xl border bg-card px-4 py-3.5 shadow-cartao transition-[border-color,box-shadow] duration-150",
          "hover:border-foreground/25 focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/15",
          erro ? "border-destructive ring-4 ring-destructive/15" : "border-input"
        )}
      >
        <span aria-hidden="true" className="numero text-base font-medium text-muted-foreground">
          R$
        </span>
        <input
          id={id}
          name="valor"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          autoFocus={autoFoco}
          placeholder="0,00"
          value={valor}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro ? idDoErro : undefined}
          onChange={(evento) => aoMudar(mascaraMoeda(evento.target.value))}
          className="numero w-full bg-transparent text-[1.75rem] leading-none font-semibold tracking-tight outline-none placeholder:text-muted-foreground/50"
        />
      </div>

      {erro && (
        <p id={idDoErro} className="text-xs text-destructive">
          {erro}
        </p>
      )}
    </div>
  );
}
