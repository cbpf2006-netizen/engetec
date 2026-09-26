"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { LogOut, Monitor, Moon, ShieldCheck, Sun, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar } from "./Avatar";
import { esquecerEmail, salvarEmail } from "@/lib/login-salvo";
import { sair } from "@/lib/acoes/autenticacao";
import type { Perfil } from "@/lib/tipos";

/* =============================================================================
   Menu do usuário

   Fica no rodapé da barra lateral no desktop e no topo no celular. Reúne o
   que é "sobre você e o app", não sobre dinheiro: perfil, tema e
   sair.

   Sair pergunta antes se o e-mail deve ficar salvo neste aparelho para o
   próximo login. A pergunta é do momento de sair, e não de uma configuração,
   porque é quando a pessoa sabe se o aparelho é dela ou emprestado.

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
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);

  function sairDaConta(lembrar: boolean) {
    if (lembrar) salvarEmail(perfil.email);
    else esquecerEmail();
    iniciar(() => void sair());
  }

  const nome = perfil.nome?.trim() || perfil.email.split("@")[0];

  return (
    <>
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
        {/* O rótulo do Base UI só existe dentro de um grupo: fora dele, abrir o
            menu lança "MenuGroupContext is missing". */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5 py-2">
            <span className="text-sm font-medium text-foreground">{nome}</span>
            <span className="truncate text-xs font-normal">{perfil.email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem render={<Link href="/perfil" />}>
          <UserRound />
          Perfil
        </DropdownMenuItem>

        {/* Só o administrador vê esta opção. A área em si também recusa os
            demais (404 na página, erro de permissão no banco). */}
        {perfil.papel === "admin" && (
          <DropdownMenuItem render={<Link href="/administrar" />}>
            <ShieldCheck />
            Administrar
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuRadioGroup
          value={theme ?? "system"}
          onValueChange={(valor) => setTheme(String(valor))}
        >
          <DropdownMenuLabel>Aparência</DropdownMenuLabel>
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
          onClick={() => setConfirmandoSaida(true)}
        >
          <LogOut />
          {saindo ? "Saindo…" : "Sair da conta"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <Dialog open={confirmandoSaida} onOpenChange={(aberto) => !saindo && setConfirmandoSaida(aberto)}>
      <DialogContent className="gap-5 p-5 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sair da conta</DialogTitle>
          <DialogDescription>
            Quer salvar seus dados de login neste aparelho? Guardamos só o e-mail{" "}
            <strong className="font-medium text-foreground">{perfil.email}</strong> para
            preencher o login da próxima vez. A senha continua com o gerenciador de senhas do
            seu navegador — o Raiz nunca a guarda.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="-mx-5 -mb-5 flex-col-reverse gap-2 px-5 py-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            disabled={saindo}
            onClick={() => setConfirmandoSaida(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={saindo}
            onClick={() => sairDaConta(false)}
          >
            Sair sem salvar
          </Button>
          <Button type="button" size="lg" disabled={saindo} onClick={() => sairDaConta(true)}>
            {saindo ? "Saindo…" : "Salvar e sair"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
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
