"use client";

import { useState, useTransition, type ReactNode } from "react";
import { BadgeCheck, MailWarning, Phone, ShieldCheck, UserRoundCheck, Users } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar } from "./Avatar";
import { EstadoVazio } from "./EstadoVazio";
import { liberarAcesso } from "@/lib/acoes/admin";
import { mascaraTelefone } from "@/lib/formato";
import type { UsuarioAdmin } from "@/lib/dados/admin";

/* =============================================================================
   Lista de usuários (área Administrar)

   Linhas em vez de tabela: no celular uma tabela de sete colunas viraria
   rolagem lateral. Cada linha traz o que o administrador precisa para decidir
   — quem é, como falar com a pessoa, quem indicou e se o e-mail foi
   confirmado — e, nos pendentes, a ação de liberar.

   Liberar pede confirmação porque é o passo que dá acesso ao produto: a
   pergunta lembra de conferir o pagamento antes.
   ========================================================================== */

function dataDoCadastro(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });
}

export function ListaDeUsuarios({
  usuarios,
  vazio,
}: {
  usuarios: UsuarioAdmin[];
  vazio: { titulo: string; descricao: string };
}) {
  const [paraLiberar, setParaLiberar] = useState<UsuarioAdmin | null>(null);

  if (usuarios.length === 0) {
    return <EstadoVazio icone={Users} titulo={vazio.titulo} descricao={vazio.descricao} />;
  }

  return (
    <>
      <ul className="divide-y divide-border">
        {usuarios.map((usuario) => (
          <Linha key={usuario.id} usuario={usuario} aoLiberar={() => setParaLiberar(usuario)} />
        ))}
      </ul>

      <DialogoDeLiberacao usuario={paraLiberar} aoFechar={() => setParaLiberar(null)} />
    </>
  );
}

function Linha({ usuario, aoLiberar }: { usuario: UsuarioAdmin; aoLiberar: () => void }) {
  const pendente = usuario.acesso === "pendente";
  const nome = usuario.nome?.trim() || usuario.email.split("@")[0];

  return (
    <li className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <Avatar perfil={{ nome: usuario.nome, email: usuario.email, foto_url: null }} />

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="truncate text-sm font-medium">{nome}</span>

            {usuario.papel === "admin" && (
              <Selo tom="acento" icone={ShieldCheck}>
                Administrador
              </Selo>
            )}
            {pendente ? (
              <Selo tom="alerta">Pendente</Selo>
            ) : (
              <Selo tom="entrada" icone={BadgeCheck}>
                Liberado
              </Selo>
            )}
            {!usuario.email_confirmado && (
              <Selo tom="saida" icone={MailWarning}>
                E-mail não confirmado
              </Selo>
            )}
          </span>

          <span className="truncate text-xs text-muted-foreground">{usuario.email}</span>

          <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            {usuario.telefone && (
              <span className="inline-flex items-center gap-1">
                <Phone className="size-3" aria-hidden="true" />
                {mascaraTelefone(usuario.telefone)}
              </span>
            )}
            {usuario.indicado_por && <span>Indicado por {usuario.indicado_por}</span>}
            <span>Cadastro em {dataDoCadastro(usuario.criado_em)}</span>
            {!pendente && usuario.liberado_em && (
              <span>Liberado em {dataDoCadastro(usuario.liberado_em)}</span>
            )}
          </span>
        </div>
      </div>

      {pendente && (
        <Button type="button" size="sm" className="sm:shrink-0" onClick={aoLiberar}>
          <UserRoundCheck />
          Liberar acesso
        </Button>
      )}
    </li>
  );
}

const TONS = {
  alerta: "bg-alerta-suave text-alerta-texto",
  entrada: "bg-entrada-suave text-entrada-texto",
  saida: "bg-saida-suave text-saida-texto",
  acento: "bg-accent text-accent-foreground",
} as const;

function Selo({
  tom,
  icone: Icone,
  children,
}: {
  tom: keyof typeof TONS;
  icone?: typeof BadgeCheck;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[0.6875rem] font-medium",
        TONS[tom]
      )}
    >
      {Icone && <Icone className="size-3" aria-hidden="true" />}
      {children}
    </span>
  );
}

function DialogoDeLiberacao({
  usuario,
  aoFechar,
}: {
  usuario: UsuarioAdmin | null;
  aoFechar: () => void;
}) {
  const [enviando, iniciar] = useTransition();

  function confirmar() {
    if (!usuario) return;

    iniciar(async () => {
      const resultado = await liberarAcesso(usuario.id);
      if (!resultado.ok) {
        toast.error(resultado.erro);
        return;
      }
      toast.success("Acesso liberado.");
      aoFechar();
    });
  }

  return (
    <Dialog open={usuario !== null} onOpenChange={(aberto) => !aberto && !enviando && aoFechar()}>
      <DialogContent className="gap-5 p-5 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Liberar acesso?</DialogTitle>
          <DialogDescription>
            {usuario?.nome?.trim() || usuario?.email} passa a usar o Raiz assim que você confirmar.
            Só libere depois de conferir o pagamento.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="-mx-5 -mb-5 px-5 py-4">
          <Button type="button" variant="outline" size="lg" disabled={enviando} onClick={aoFechar}>
            Cancelar
          </Button>
          <Button type="button" size="lg" disabled={enviando} onClick={confirmar}>
            {enviando ? "Liberando…" : "Confirmar e liberar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
