"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { LogOut, Monitor, Moon, Settings, Sun } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { iniciais } from "@/lib/formato";
import { sair } from "@/lib/acoes/autenticacao";
import type { Perfil } from "@/lib/tipos";

/* =============================================================================
   Menu do usuário

   Fica no rodapé da barra lateral no desktop e no topo no celular. Reúne o
   que é "sobre você e o app", não sobre dinheiro: identidade, tema, ajustes e
   sair.

   O tema tem três estados (claro, escuro, sistema) em vez de um interruptor:
   "sistema" é o padrão e precisa ser escolhível de volta depois que alguém
   fixou um dos dois.
   ========================================================================== */

export function MenuDoUsuario({
  perfil,
  variante = "lateral",
}: {
  perfil: Perfil;
  variante?: "lateral" | "compacta";
}) {
  const { theme, setTheme } = useTheme();
  const [saindo, iniciar] = useTransition();

  const nome = perfil.nome?.trim() || perfil.email.split("@")[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="Sua conta"
            className={cn(
              "flex items-center gap-3 rounded-xl text-left transition-colors duration-150",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              variante === "lateral"
                ? "w-full px-2 py-2 hover:bg-secondary"
                : "p-0.5 hover:opacity-80"
            )}
          />
        }
      >
        <Avatar perfil={perfil} />

        {variante === "lateral" && (
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium">{nome}</span>
            <span className="truncate text-xs text-muted-foreground">{perfil.email}</span>
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" side="top" className="w-60">
        <DropdownMenuLabel className="flex flex-col gap-0.5 py-2">
          <span className="text-sm font-medium text-foreground">{nome}</span>
          <span className="truncate text-xs font-normal">{perfil.email}</span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem render={<Link href="/ajustes" />}>
          <Settings />
          Ajustes
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>Aparência</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={theme ?? "system"}
          onValueChange={(valor) => setTheme(String(valor))}
        >
          <DropdownMenuRadioItem value="light">
            <Sun />
            Claro
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon />
            Escuro
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Monitor />
            Sistema
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          disabled={saindo}
          onClick={() => iniciar(() => void sair())}
        >
          <LogOut />
          {saindo ? "Saindo…" : "Sair"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Avatar({ perfil }: { perfil: Perfil }) {
  return (
    <span
      aria-hidden="true"
      className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-[0.8125rem] font-semibold text-accent-foreground"
    >
      {iniciais(perfil.nome, perfil.email)}
    </span>
  );
}

/** Versão sem menu, para o cabeçalho das telas de autenticação. */
export function SeletorDeTema() {
  const { theme, setTheme } = useTheme();
  const proximo = theme === "dark" ? "light" : "dark";

  return (
    <Button
      variant="ghost"
      size="icon-lg"
      className="rounded-xl text-muted-foreground"
      onClick={() => setTheme(proximo)}
      aria-label={proximo === "dark" ? "Usar tema escuro" : "Usar tema claro"}
    >
      <Sun className="size-[1.125rem] dark:hidden" />
      <Moon className="hidden size-[1.125rem] dark:block" />
    </Button>
  );
}
