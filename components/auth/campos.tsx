"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { CircleAlert, CircleCheck, Eye, EyeOff, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* =============================================================================
   Peças dos formulários de acesso

   Rótulo sempre acima do campo, nunca como placeholder: placeholder
   desaparece ao digitar e deixa quem foi interrompido sem saber o que aquele
   campo era.

   O estado de envio vem de `useFormStatus`, lido do <form> pai — nenhum
   `useState` de "carregando" para sair de sincronia.
   ========================================================================== */

export function CampoTexto({
  id,
  rotulo,
  erro,
  dica,
  className,
  ...props
}: ComponentProps<"input"> & { id: string; rotulo: string; erro?: string; dica?: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{rotulo}</Label>
      <Input
        id={id}
        name={id}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? `${id}-erro` : dica ? `${id}-dica` : undefined}
        className={cn("h-11", className)}
        {...props}
      />
      {erro ? (
        <p id={`${id}-erro`} className="text-xs text-destructive">
          {erro}
        </p>
      ) : (
        dica && (
          <p id={`${id}-dica`} className="text-xs text-muted-foreground">
            {dica}
          </p>
        )
      )}
    </div>
  );
}

export function CampoSenha({
  id = "senha",
  rotulo = "Senha",
  erro,
  dica,
  acao,
  ...props
}: ComponentProps<"input"> & {
  id?: string;
  rotulo?: string;
  erro?: string;
  dica?: ReactNode;
  acao?: ReactNode;
}) {
  const [visivel, setVisivel] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id}>{rotulo}</Label>
        {acao}
      </div>

      <div className="relative">
        <Input
          id={id}
          name={id}
          type={visivel ? "text" : "password"}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro ? `${id}-erro` : dica ? `${id}-dica` : undefined}
          className="h-11 pr-11"
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisivel((atual) => !atual)}
          aria-label={visivel ? "Esconder senha" : "Mostrar senha"}
          className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        >
          {visivel ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>

      {erro ? (
        <p id={`${id}-erro`} className="text-xs text-destructive">
          {erro}
        </p>
      ) : (
        dica && (
          <p id={`${id}-dica`} className="text-xs text-muted-foreground">
            {dica}
          </p>
        )
      )}
    </div>
  );
}

/** Aviso do formulário. `role="alert"` faz o leitor de tela anunciar o erro
    no momento em que ele aparece, sem a pessoa ter de sair caçando. */
export function Aviso({ tipo, children }: { tipo: "erro" | "sucesso"; children: ReactNode }) {
  const Icone = tipo === "erro" ? CircleAlert : CircleCheck;

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-sm",
        tipo === "erro"
          ? "bg-saida-suave text-saida-texto"
          : "bg-entrada-suave text-entrada-texto"
      )}
    >
      <Icone className="mt-px size-4 shrink-0" aria-hidden="true" />
      <p className="leading-relaxed">{children}</p>
    </div>
  );
}

export function BotaoEnviar({
  children,
  carregando,
}: {
  children: ReactNode;
  carregando: ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" className="h-11 w-full text-sm" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" />
          {carregando}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
