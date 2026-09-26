"use client";

import { useState, useTransition, type ReactNode } from "react";
import { BadgeCheck, Phone, ShieldCheck, Trash2, UserRoundCheck, UserRoundX, Users } from "lucide-react";
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
import { DialogoConfirmar } from "./DialogoConfirmar";
import { EstadoVazio } from "./EstadoVazio";
import { liberarAcesso, removerUsuario } from "@/lib/acoes/admin";
import { mascaraTelefone } from "@/lib/formato";
import type { UsuarioAdmin } from "@/lib/dados/admin";

/* =============================================================================
   Lista de usuários (área Administrar)

   Duas listas com ações diferentes:
     · Usuários — quem já tem acesso. A ação é REMOVER.
     · Pendentes — quem espera o pagamento. As ações são LIBERAR e RECUSAR.

   Linhas em vez de tabela: no celular uma tabela de sete colunas viraria
   rolagem lateral.

   Remover e recusar apagam a conta e os dados dela, sem volta — por isso as
   duas pedem confirmação e dizem o que vai embora. A própria conta e a de
   qualquer administrador não têm o botão (a função no servidor também recusa).
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
  meuId,
  modo,
  vazio,
}: {
  usuarios: UsuarioAdmin[];
  meuId: string;
  modo: "usuarios" | "pendentes";
  vazio: { titulo: string; descricao: string };
}) {
  const [paraLiberar, setParaLiberar] = useState<UsuarioAdmin | null>(null);
  const [paraRemover, setParaRemover] = useState<UsuarioAdmin | null>(null);

  if (usuarios.length === 0) {
    return <EstadoVazio icone={Users} titulo={vazio.titulo} descricao={vazio.descricao} />;
  }

  const recusando = modo === "pendentes";
  const nomeDoAlvo = paraRemover?.nome?.trim() || paraRemover?.email || "";

  return (
    <>
      <ul className="divide-y divide-border">
        {usuarios.map((usuario) => (
          <Linha
            key={usuario.id}
            usuario={usuario}
            ehVoce={usuario.id === meuId}
            modo={modo}
            aoLiberar={() => setParaLiberar(usuario)}
            aoRemover={() => setParaRemover(usuario)}
          />
        ))}
      </ul>

      <DialogoDeLiberacao usuario={paraLiberar} aoFechar={() => setParaLiberar(null)} />

      <DialogoConfirmar
        aberto={paraRemover !== null}
        aoMudarAberto={(aberto) => !aberto && setParaRemover(null)}
        titulo={recusando ? `Recusar ${nomeDoAlvo}?` : `Remover ${nomeDoAlvo}?`}
        descricao={
          recusando
            ? "A conta é removida e a pessoa não terá acesso. Se ela pagar depois, precisará se cadastrar de novo."
            : "A conta e todos os dados dela — lançamentos, carteiras, modelos e foto — serão apagados. Não há como desfazer."
        }
        rotuloDoBotao={recusando ? "Recusar" : "Remover"}
        mensagemDeSucesso={recusando ? "Cadastro recusado." : "Usuário removido."}
        acao={async () =>
          paraRemover
            ? removerUsuario(paraRemover.id)
            : { ok: false as const, erro: "Nada selecionado." }
        }
      />
    </>
  );
}

function Linha({
  usuario,
  ehVoce,
  modo,
  aoLiberar,
  aoRemover,
}: {
  usuario: UsuarioAdmin;
  ehVoce: boolean;
  modo: "usuarios" | "pendentes";
  aoLiberar: () => void;
  aoRemover: () => void;
}) {
  const nome = usuario.nome?.trim() || usuario.email.split("@")[0];
  const protegido = ehVoce || usuario.papel === "admin";

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
            {ehVoce && <Selo tom="entrada">Você</Selo>}
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
            {modo === "usuarios" && usuario.liberado_em && (
              <span>Liberado em {dataDoCadastro(usuario.liberado_em)}</span>
            )}
          </span>
        </div>
      </div>

      {modo === "pendentes" ? (
        <div className="flex gap-2 sm:shrink-0">
          <Button type="button" variant="outline" size="sm" onClick={aoRemover}>
            <UserRoundX />
            Recusar
          </Button>
          <Button type="button" size="sm" onClick={aoLiberar}>
            <UserRoundCheck />
            Liberar acesso
          </Button>
        </div>
      ) : (
        !protegido && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive sm:shrink-0"
            onClick={aoRemover}
          >
            <Trash2 />
            Remover
          </Button>
        )
      )}
    </li>
  );
}

const TONS = {
  entrada: "bg-entrada-suave text-entrada-texto",
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
