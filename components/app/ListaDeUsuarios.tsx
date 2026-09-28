"use client";

import { useState, type ReactNode } from "react";
import { BadgeCheck, Phone, ShieldCheck, Trash2, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "./Avatar";
import { DialogoConfirmar } from "./DialogoConfirmar";
import { EstadoVazio } from "./EstadoVazio";
import { removerUsuario } from "@/lib/acoes/admin";
import { mascaraTelefone } from "@/lib/formato";
import type { UsuarioAdmin } from "@/lib/dados/admin";

/* =============================================================================
   Lista de usuários (área Administrar)

   Todo mundo com acesso, uma linha cada, com a ação REMOVER — a própria conta
   e a de qualquer outro administrador não têm o botão (a função no servidor
   também recusa). Remover apaga a conta e os dados dela sem volta, por isso
   pede confirmação e diz o que vai embora.
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
  vazio,
}: {
  usuarios: UsuarioAdmin[];
  meuId: string;
  vazio: { titulo: string; descricao: string };
}) {
  const [paraRemover, setParaRemover] = useState<UsuarioAdmin | null>(null);

  if (usuarios.length === 0) {
    return <EstadoVazio icone={Users} titulo={vazio.titulo} descricao={vazio.descricao} />;
  }

  const nomeDoAlvo = paraRemover?.nome?.trim() || paraRemover?.email || "";

  return (
    <>
      <ul className="divide-y divide-border">
        {usuarios.map((usuario) => (
          <Linha
            key={usuario.id}
            usuario={usuario}
            ehVoce={usuario.id === meuId}
            aoRemover={() => setParaRemover(usuario)}
          />
        ))}
      </ul>

      <DialogoConfirmar
        aberto={paraRemover !== null}
        aoMudarAberto={(aberto) => !aberto && setParaRemover(null)}
        titulo={`Remover ${nomeDoAlvo}?`}
        descricao="A conta e todos os dados dela — lançamentos, carteiras, modelos e foto — serão apagados. Não há como desfazer."
        rotuloDoBotao="Remover"
        mensagemDeSucesso="Usuário removido."
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
  aoRemover,
}: {
  usuario: UsuarioAdmin;
  ehVoce: boolean;
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
            <span>Cadastro em {dataDoCadastro(usuario.criado_em)}</span>
          </span>
        </div>
      </div>

      {!protegido && (
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
