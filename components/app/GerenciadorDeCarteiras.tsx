"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal, Pencil, Plus, Trash2, Wallet } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bloco } from "./Bloco";
import { DialogoConfirmar } from "./DialogoConfirmar";
import { EstadoVazio } from "./EstadoVazio";
import { Quantia } from "./Quantia";
import { atualizarCarteira, criarCarteira, excluirCarteira } from "@/lib/acoes/carteiras";
import type { Carteira } from "@/lib/tipos";

/* =============================================================================
   Gerenciador de carteiras

   Uma carteira é só um nome — "Mão", "Santander". O saldo ao lado não é um
   campo: é a soma dos lançamentos que apontam para ela, recalculada a cada
   leitura. Por isso não há como editá-lo aqui; corrigir um saldo é corrigir
   o lançamento que o produziu.
   ========================================================================== */

export function GerenciadorDeCarteiras({
  carteiras,
  saldos,
  usoPorCarteira,
}: {
  carteiras: Carteira[];
  saldos: Record<string, number>;
  usoPorCarteira: Record<string, number>;
}) {
  const [criando, setCriando] = useState(false);
  const [emEdicao, setEmEdicao] = useState<Carteira | null>(null);
  const [paraExcluir, setParaExcluir] = useState<Carteira | null>(null);

  return (
    <>
      <Bloco
        titulo="Suas carteiras"
        descricao="Onde o dinheiro de cada movimentação fica."
        acao={
          <Button size="sm" onClick={() => setCriando(true)}>
            <Plus />
            <span className="hidden sm:inline">Nova carteira</span>
            <span className="sm:hidden">Nova</span>
          </Button>
        }
        semPadding
      >
        <div className="border-t border-border">
          {carteiras.length === 0 ? (
            <EstadoVazio
              icone={Wallet}
              titulo="Nenhuma carteira cadastrada"
              descricao="Cadastre onde você guarda dinheiro — a carteira física, a conta do banco — e escolha uma a cada lançamento."
              acao={
                <Button onClick={() => setCriando(true)}>
                  <Plus />
                  Adicionar carteira
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {carteiras.map((carteira) => (
                <Linha
                  key={carteira.id}
                  carteira={carteira}
                  saldo={saldos[carteira.id] ?? 0}
                  usos={usoPorCarteira[carteira.id] ?? 0}
                  aoEditar={() => setEmEdicao(carteira)}
                  aoExcluir={() => setParaExcluir(carteira)}
                />
              ))}
            </ul>
          )}
        </div>
      </Bloco>

      <DialogoDeCarteira aberto={criando} aoMudarAberto={setCriando} />

      <DialogoDeCarteira
        carteira={emEdicao ?? undefined}
        aberto={emEdicao !== null}
        aoMudarAberto={(aberto) => !aberto && setEmEdicao(null)}
      />

      <DialogoConfirmar
        aberto={paraExcluir !== null}
        aoMudarAberto={(aberto) => !aberto && setParaExcluir(null)}
        titulo={`Excluir a carteira "${paraExcluir?.nome ?? ""}"?`}
        descricao={
          paraExcluir ? (
            (usoPorCarteira[paraExcluir.id] ?? 0) > 0 ? (
              <>
                {usoPorCarteira[paraExcluir.id]} lançamento
                {usoPorCarteira[paraExcluir.id] > 1 ? "s usam" : " usa"} esta carteira. Os
                lançamentos continuam existindo e somando no saldo geral, mas passam a aparecer
                sem carteira.
              </>
            ) : (
              "Nenhum lançamento usa esta carteira."
            )
          ) : null
        }
        mensagemDeSucesso="Carteira excluída."
        acao={async () =>
          paraExcluir
            ? excluirCarteira(paraExcluir.id)
            : { ok: false as const, erro: "Nada selecionado." }
        }
      />
    </>
  );
}

function Linha({
  carteira,
  saldo,
  usos,
  aoEditar,
  aoExcluir,
}: {
  carteira: Carteira;
  saldo: number;
  usos: number;
  aoEditar: () => void;
  aoExcluir: () => void;
}) {
  return (
    <li className="group flex items-center gap-3 px-5 py-3.5 transition-colors duration-150 hover:bg-secondary/40">
      <span
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-muted-foreground"
      >
        <Wallet className="size-[1.05rem]" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">{carteira.nome}</span>
        <span className="text-xs text-muted-foreground">
          {usos === 0 ? "Sem lançamentos" : usos === 1 ? "1 lançamento" : `${usos} lançamentos`}
        </span>
      </div>

      <Quantia
        valor={saldo}
        className={cn(
          "shrink-0 text-[0.9375rem] font-semibold",
          saldo < 0 ? "text-saida-texto" : "text-foreground"
        )}
      />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="shrink-0 text-muted-foreground"
              aria-label={`Ações da carteira ${carteira.nome}`}
            />
          }
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={aoEditar}>
            <Pencil />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={aoExcluir}>
            <Trash2 />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}

function DialogoDeCarteira({
  carteira,
  aberto,
  aoMudarAberto,
}: {
  carteira?: Carteira;
  aberto: boolean;
  aoMudarAberto: (aberto: boolean) => void;
}) {
  return (
    <Dialog open={aberto} onOpenChange={aoMudarAberto}>
      <DialogContent className="gap-5 p-5 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{carteira ? "Editar carteira" : "Nova carteira"}</DialogTitle>
          <DialogDescription>
            Só o nome. O saldo vem dos lançamentos que apontam para ela.
          </DialogDescription>
        </DialogHeader>

        {aberto && (
          <Formulario
            key={carteira?.id ?? "nova"}
            carteira={carteira}
            aoConcluir={() => aoMudarAberto(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Formulario({
  carteira,
  aoConcluir,
}: {
  carteira?: Carteira;
  aoConcluir: () => void;
}) {
  const [nome, setNome] = useState(carteira?.nome ?? "");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();

  function enviar() {
    if (!nome.trim()) {
      setErro("Dê um nome à carteira.");
      return;
    }

    iniciar(async () => {
      const resultado = carteira
        ? await atualizarCarteira(carteira.id, { nome })
        : await criarCarteira({ nome });

      if (!resultado.ok) {
        setErro(resultado.erro);
        toast.error(resultado.erro);
        return;
      }

      toast.success(carteira ? "Carteira atualizada." : "Carteira criada.");
      aoConcluir();
    });
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(evento) => {
        evento.preventDefault();
        enviar();
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="carteira-nome">Nome</Label>
        <Input
          id="carteira-nome"
          value={nome}
          onChange={(evento) => {
            setNome(evento.target.value);
            setErro(null);
          }}
          placeholder="Ex.: Mão, Santander, Bradesco"
          maxLength={40}
          autoFocus
          aria-invalid={erro ? true : undefined}
          className="h-11"
        />
        {erro && <p className="text-xs text-destructive">{erro}</p>}
      </div>

      <DialogFooter className="-mx-5 -mb-5 px-5 py-4">
        <Button type="button" variant="outline" size="lg" onClick={aoConcluir} disabled={enviando}>
          Cancelar
        </Button>
        <Button type="submit" size="lg" disabled={!nome.trim() || enviando}>
          {enviando ? "Salvando…" : carteira ? "Salvar alterações" : "Criar carteira"}
        </Button>
      </DialogFooter>
    </form>
  );
}
