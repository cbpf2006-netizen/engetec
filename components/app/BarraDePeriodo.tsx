"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  PRESETS,
  contemHoje,
  deslocar,
  hoje,
  paramsDoPeriodo,
  trocarPreset,
  type Periodo,
} from "@/lib/periodo";

/* =============================================================================
   Barra de período

   O recorte vive na URL, então navegar é empurrar novos parâmetros e deixar o
   Server Component buscar os dados do intervalo novo. Nada de estado paralelo
   no cliente: o botão voltar do navegador funciona e o link pode ser
   compartilhado.

   `useTransition` dá o estado de espera. Durante a troca a barra continua
   clicável (dá para pular dois meses seguidos) e só o conteúdo abaixo esmaece
   — travar a barra a cada clique deixaria a navegação lenta de propósito.
   ========================================================================== */

export function BarraDePeriodo({ periodo }: { periodo: Periodo }) {
  const router = useRouter();
  const caminho = usePathname();
  const busca = useSearchParams();
  const [pendente, iniciarTransicao] = useTransition();

  function irPara(novo: Periodo) {
    const parametros = new URLSearchParams(busca.toString());
    // Um preset novo não pode herdar os parâmetros do anterior.
    for (const chave of ["p", "d", "de", "ate"]) parametros.delete(chave);
    for (const [chave, valor] of Object.entries(paramsDoPeriodo(novo))) {
      parametros.set(chave, valor);
    }

    iniciarTransicao(() => {
      router.push(`${caminho}?${parametros.toString()}`, { scroll: false });
    });
  }

  // No intervalo personalizado o atalho não faz sentido: voltar "para hoje"
  // exigiria inventar um tamanho de intervalo que a pessoa não pediu.
  const mostrarAtalhoDeHoje = periodo.preset !== "personalizado" && !contemHoje(periodo);

  return (
    <div
      data-pendente={pendente || undefined}
      className="flex flex-col gap-3 rounded-2xl bg-card p-2.5 ring-1 ring-border sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-3"
    >
      {/* Navegação entre períodos */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-lg"
          className="rounded-xl"
          onClick={() => irPara(deslocar(periodo, -1))}
          aria-label="Período anterior"
        >
          <ChevronLeft />
        </Button>

        <p
          className={cn(
            "min-w-0 flex-1 px-1 text-center text-sm font-semibold tracking-tight transition-opacity duration-200 sm:min-w-[11rem]",
            pendente && "opacity-50"
          )}
          aria-live="polite"
        >
          {periodo.rotulo}
        </p>

        <Button
          variant="ghost"
          size="icon-lg"
          className="rounded-xl"
          onClick={() => irPara(deslocar(periodo, 1))}
          aria-label="Período seguinte"
        >
          <ChevronRight />
        </Button>

        {mostrarAtalhoDeHoje && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-1 rounded-lg text-muted-foreground hover:text-foreground"
            onClick={() => irPara(trocarPreset({ ...periodo, ancora: hoje() }, periodo.preset))}
          >
            Hoje
          </Button>
        )}
      </div>

      {/* Presets */}
      <div className="flex items-center gap-2">
        <div
          role="tablist"
          aria-label="Tamanho do período"
          className="rolagem-fina flex flex-1 items-center gap-0.5 overflow-x-auto rounded-xl bg-secondary p-0.5"
        >
          {PRESETS.filter((p) => p.valor !== "personalizado").map((preset) => (
            <button
              key={preset.valor}
              type="button"
              role="tab"
              aria-selected={periodo.preset === preset.valor}
              onClick={() => irPara(trocarPreset(periodo, preset.valor))}
              className={cn(
                "min-w-fit rounded-[0.625rem] px-3 py-1.5 text-[0.8125rem] font-medium whitespace-nowrap transition-all duration-150",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                periodo.preset === preset.valor
                  ? "bg-card text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.06)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {preset.rotulo}
            </button>
          ))}

          <SeletorPersonalizado periodo={periodo} aoEscolher={irPara} />
        </div>
      </div>
    </div>
  );
}

function SeletorPersonalizado({
  periodo,
  aoEscolher,
}: {
  periodo: Periodo;
  aoEscolher: (novo: Periodo) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [de, setDe] = useState(periodo.de);
  const [ate, setAte] = useState(periodo.ate);
  const ativo = periodo.preset === "personalizado";
  const invalido = de > ate;

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger
        role="tab"
        aria-selected={ativo}
        className={cn(
          "flex items-center gap-1.5 rounded-[0.625rem] px-3 py-1.5 text-[0.8125rem] font-medium whitespace-nowrap transition-all duration-150",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          ativo
            ? "bg-card text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.06)]"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <CalendarDays className="size-3.5" />
        Período
      </PopoverTrigger>

      <PopoverContent align="end" className="w-72 gap-3 p-4">
        <p className="text-sm font-medium">Escolher um intervalo</p>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="periodo-de" className="text-xs text-muted-foreground">
              De
            </Label>
            <Input
              id="periodo-de"
              type="date"
              value={de}
              max={ate}
              onChange={(evento) => setDe(evento.target.value)}
              className="h-9"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="periodo-ate" className="text-xs text-muted-foreground">
              Até
            </Label>
            <Input
              id="periodo-ate"
              type="date"
              value={ate}
              min={de}
              onChange={(evento) => setAte(evento.target.value)}
              className="h-9"
            />
          </div>
        </div>

        <Button
          size="lg"
          className="w-full"
          disabled={invalido}
          onClick={() => {
            setAberto(false);
            aoEscolher({
              ...periodo,
              preset: "personalizado",
              de,
              ate,
              ancora: de,
            });
          }}
        >
          Aplicar
        </Button>
      </PopoverContent>
    </Popover>
  );
}
