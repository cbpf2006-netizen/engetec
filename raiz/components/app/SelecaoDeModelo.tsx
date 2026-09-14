"use client";

import { useState, useTransition } from "react";
import { Check, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icone, SeloModelo } from "@/components/Icone";
import { CORES, ICONES, corDoModelo } from "@/lib/catalogo";
import { criarModelo } from "@/lib/acoes/modelos";
import { ROTULO_FLUXO, type Fluxo, type Modelo } from "@/lib/tipos";

/* =============================================================================
   Seleção de modelo

   Grade de fichas em vez de um <select>: o ícone e a cor são parte da
   identidade do modelo, e um menu suspenso os esconde justamente no momento
   de escolher. Em toque, ficha grande também é alvo mais fácil que uma linha
   de lista.

   O botão "Novo" abre a criação AQUI DENTRO, sem empilhar diálogo sobre
   diálogo: quem percebe no meio do lançamento que falta uma categoria não
   deveria ter de abandonar o formulário para criá-la.
   ========================================================================== */

export function SelecaoDeModelo({
  fluxo,
  modelos,
  selecionado,
  aoSelecionar,
  erro,
}: {
  fluxo: Fluxo;
  modelos: Modelo[];
  selecionado: string | null;
  aoSelecionar: (id: string) => void;
  erro?: string;
}) {
  const [criando, setCriando] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label>{fluxo === "investimento" ? "Tipo de investimento" : "Modelo"}</Label>

        {!criando && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setCriando(true)}
          >
            <Plus />
            Novo
          </Button>
        )}
      </div>

      {criando ? (
        <CriacaoRapida
          fluxo={fluxo}
          aoCancelar={() => setCriando(false)}
          aoCriar={(modelo) => {
            setCriando(false);
            aoSelecionar(modelo.id);
          }}
        />
      ) : (
        <>
          <div
            role="radiogroup"
            aria-label={fluxo === "investimento" ? "Tipo de investimento" : "Modelo"}
            aria-invalid={erro ? true : undefined}
            className="grid grid-cols-2 gap-2 sm:grid-cols-3"
          >
            {modelos.map((modelo) => {
              const ativo = selecionado === modelo.id;
              return (
                <button
                  key={modelo.id}
                  type="button"
                  role="radio"
                  aria-checked={ativo}
                  onClick={() => aoSelecionar(modelo.id)}
                  className={cn(
                    "group flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition-all duration-150",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    "active:scale-[0.98]",
                    ativo
                      ? "border-transparent ring-2 ring-primary"
                      : "border-input hover:border-foreground/20 hover:bg-secondary/60"
                  )}
                  style={ativo ? { background: `color-mix(in oklab, ${corDoModelo(modelo.cor)} 10%, transparent)` } : undefined}
                >
                  <SeloModelo icone={modelo.icone} cor={modelo.cor} tamanho="sm" />
                  <span className="min-w-0 flex-1 truncate text-[0.8125rem] font-medium">
                    {modelo.nome}
                  </span>
                  {ativo && <Check className="size-3.5 shrink-0 text-primary" aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          {modelos.length === 0 && (
            <p className="rounded-xl border border-dashed border-input px-3 py-4 text-center text-xs text-muted-foreground">
              Nenhum modelo de {ROTULO_FLUXO[fluxo].toLowerCase()} ainda. Crie o primeiro em
              &ldquo;Novo&rdquo;.
            </p>
          )}

          {erro && <p className="text-xs text-destructive">{erro}</p>}
        </>
      )}
    </div>
  );
}

/* =============================================================================
   Criação rápida, dentro do próprio formulário
   ========================================================================== */

function CriacaoRapida({
  fluxo,
  aoCriar,
  aoCancelar,
}: {
  fluxo: Fluxo;
  aoCriar: (modelo: Modelo) => void;
  aoCancelar: () => void;
}) {
  const [nome, setNome] = useState("");
  const [icone, setIcone] = useState<string>("circulo");
  const [cor, setCor] = useState<string>("verde");
  const [enviando, iniciar] = useTransition();

  function salvar() {
    iniciar(async () => {
      const resultado = await criarModelo({ fluxo, nome, icone, cor });
      if (!resultado.ok) {
        toast.error(resultado.erro);
        return;
      }
      toast.success(`Modelo "${resultado.dados.nome}" criado.`);
      aoCriar(resultado.dados);
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-input bg-secondary/40 p-3">
      <div className="flex items-center gap-2">
        <SeloModelo icone={icone} cor={cor} tamanho="sm" />
        <Input
          value={nome}
          onChange={(evento) => setNome(evento.target.value)}
          placeholder="Nome do modelo"
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
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={aoCancelar}
          aria-label="Cancelar criação de modelo"
        >
          <X />
        </Button>
      </div>

      <EscolhaDeIcone valor={icone} aoMudar={setIcone} />
      <EscolhaDeCor valor={cor} aoMudar={setCor} />

      <Button type="button" size="lg" disabled={!nome.trim() || enviando} onClick={salvar}>
        {enviando ? "Criando…" : "Criar e usar"}
      </Button>
    </div>
  );
}

export function EscolhaDeIcone({
  valor,
  aoMudar,
}: {
  valor: string;
  aoMudar: (icone: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">Ícone</span>
      <div className="rolagem-fina flex max-h-24 flex-wrap gap-1 overflow-y-auto">
        {ICONES.map((apelido) => (
          <button
            key={apelido}
            type="button"
            aria-label={apelido}
            aria-pressed={valor === apelido}
            onClick={() => aoMudar(apelido)}
            className={cn(
              "grid size-8 place-items-center rounded-lg transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              valor === apelido
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Icone apelido={apelido} className="size-4" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function EscolhaDeCor({
  valor,
  aoMudar,
}: {
  valor: string;
  aoMudar: (cor: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">Cor</span>
      <div className="flex flex-wrap gap-1.5">
        {CORES.map((cor) => (
          <button
            key={cor.apelido}
            type="button"
            aria-label={cor.rotulo}
            aria-pressed={valor === cor.apelido}
            onClick={() => aoMudar(cor.apelido)}
            className={cn(
              "grid size-7 place-items-center rounded-full transition-transform duration-150",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              valor === cor.apelido ? "scale-110" : "hover:scale-105"
            )}
          >
            <span
              className={cn(
                "grid size-5 place-items-center rounded-full",
                valor === cor.apelido && "ring-2 ring-offset-2 ring-offset-card"
              )}
              style={{
                background: `var(${cor.variavel})`,
                boxShadow: valor === cor.apelido ? `0 0 0 2px var(${cor.variavel})` : undefined,
              }}
            >
              {valor === cor.apelido && <Check className="size-3 text-white" aria-hidden="true" />}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
