"use client";

import { useState, useTransition } from "react";
import { Check, Plus, Wallet, X } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { criarCarteira } from "@/lib/acoes/carteiras";
import type { Carteira } from "@/lib/tipos";

/* =============================================================================
   Seleção de carteira

   Mesma anatomia do seletor de modelo — fichas em grade, e o botão "Nova"
   abre a criação aqui dentro. Quem percebe no meio do lançamento que o
   dinheiro saiu de uma conta ainda não cadastrada não deveria ter de
   abandonar o formulário para cadastrá-la.
   ========================================================================== */

export function SelecaoDeCarteira({
  carteiras,
  selecionada,
  aoSelecionar,
  erro,
}: {
  carteiras: Carteira[];
  selecionada: string | null;
  aoSelecionar: (id: string) => void;
  erro?: string;
}) {
  const [criando, setCriando] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label>Carteira</Label>

        {!criando && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setCriando(true)}
          >
            <Plus />
            Nova
          </Button>
        )}
      </div>

      {criando ? (
        <CriacaoRapida
          aoCancelar={() => setCriando(false)}
          aoCriar={(carteira) => {
            setCriando(false);
            aoSelecionar(carteira.id);
          }}
        />
      ) : (
        <>
          <div
            role="radiogroup"
            aria-label="Carteira"
            aria-invalid={erro ? true : undefined}
            className="grid grid-cols-2 gap-2 sm:grid-cols-3"
          >
            {carteiras.map((carteira) => {
              const ativa = selecionada === carteira.id;
              return (
                <button
                  key={carteira.id}
                  type="button"
                  role="radio"
                  aria-checked={ativa}
                  onClick={() => aoSelecionar(carteira.id)}
                  className={cn(
                    "group flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition-all duration-150",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    "active:scale-[0.98]",
                    ativa
                      ? "border-transparent bg-accent ring-2 ring-primary"
                      : "border-input hover:border-foreground/20 hover:bg-secondary/60"
                  )}
                >
                  <Wallet
                    className={cn(
                      "size-4 shrink-0",
                      ativa ? "text-primary" : "text-muted-foreground"
                    )}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1 truncate text-[0.8125rem] font-medium">
                    {carteira.nome}
                  </span>
                  {ativa && <Check className="size-3.5 shrink-0 text-primary" aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          {carteiras.length === 0 && (
            <p className="rounded-xl border border-dashed border-input px-3 py-4 text-center text-xs text-muted-foreground">
              Nenhuma carteira ainda. Crie a primeira em &ldquo;Nova&rdquo;.
            </p>
          )}

          {erro && <p className="text-xs text-destructive">{erro}</p>}
        </>
      )}
    </div>
  );
}

function CriacaoRapida({
  aoCriar,
  aoCancelar,
}: {
  aoCriar: (carteira: Carteira) => void;
  aoCancelar: () => void;
}) {
  const [nome, setNome] = useState("");
  const [enviando, iniciar] = useTransition();

  function salvar() {
    iniciar(async () => {
      const resultado = await criarCarteira({ nome });
      if (!resultado.ok) {
        toast.error(resultado.erro);
        return;
      }
      toast.success(`Carteira "${resultado.dados.nome}" criada.`);
      aoCriar(resultado.dados);
    });
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-input bg-secondary/40 p-3">
      <Wallet className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <Input
        value={nome}
        onChange={(evento) => setNome(evento.target.value)}
        placeholder="Ex.: Mão, Santander, Bradesco"
        maxLength={40}
        autoFocus
        className="h-9 flex-1"
        onKeyDown={(evento) => {
          if (evento.key === "Enter" && nome.trim()) {
            evento.preventDefault();
            salvar();
          }
        }}
      />
      <Button type="button" size="sm" disabled={!nome.trim() || enviando} onClick={salvar}>
        {enviando ? "Criando…" : "Criar"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={aoCancelar}
        aria-label="Cancelar criação de carteira"
      >
        <X />
      </Button>
    </div>
  );
}
