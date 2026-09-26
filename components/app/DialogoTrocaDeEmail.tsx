"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  confirmarCodigoDoEmailAntigo,
  confirmarCodigoDoEmailNovo,
  pedirTrocaDeEmail,
} from "@/lib/acoes/conta";

/* =============================================================================
   Troca de e-mail em três passos

   1. Novo endereço — o pedido dispara um código para o e-mail ANTIGO e outro
      para o NOVO.
   2. Código do e-mail antigo — prova que quem está trocando ainda tem acesso
      à conta atual (protege contra alguém que só achou o celular aberto).
   3. Código do e-mail novo — prova que o endereço novo é de quem pediu, e só
      aí a troca vale.

   Os dois códigos saem juntos, mas a tela pede um de cada vez, na ordem.
   ========================================================================== */

type Passo = "novo" | "antigo" | "confirmar";

export function DialogoTrocaDeEmail({
  emailAtual,
  aberto,
  aoMudarAberto,
}: {
  emailAtual: string;
  aberto: boolean;
  aoMudarAberto: (aberto: boolean) => void;
}) {
  return (
    <Dialog open={aberto} onOpenChange={aoMudarAberto}>
      <DialogContent className="gap-5 p-5 sm:max-w-md">
        {aberto && (
          <Passos emailAtual={emailAtual} aoConcluir={() => aoMudarAberto(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Passos({ emailAtual, aoConcluir }: { emailAtual: string; aoConcluir: () => void }) {
  const router = useRouter();
  const [passo, setPasso] = useState<Passo>("novo");
  const [novoEmail, setNovoEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState<string | undefined>();
  const [enviando, iniciar] = useTransition();

  function falhou(mensagem: string) {
    setErro(mensagem);
  }

  function pedir() {
    setErro(undefined);
    iniciar(async () => {
      const resultado = await pedirTrocaDeEmail({ email: novoEmail });
      if (!resultado.ok) return falhou(resultado.erro);
      setCodigo("");
      setPasso("antigo");
    });
  }

  function confirmarAntigo() {
    setErro(undefined);
    iniciar(async () => {
      const resultado = await confirmarCodigoDoEmailAntigo(codigo);
      if (!resultado.ok) return falhou(resultado.erro);
      setCodigo("");
      setPasso("confirmar");
    });
  }

  function confirmarNovo() {
    setErro(undefined);
    iniciar(async () => {
      const resultado = await confirmarCodigoDoEmailNovo(novoEmail, codigo);
      if (!resultado.ok) return falhou(resultado.erro);
      toast.success("E-mail alterado.");
      router.refresh();
      aoConcluir();
    });
  }

  const emailDoPasso = passo === "antigo" ? emailAtual : novoEmail.trim().toLowerCase();

  return (
    <>
      <DialogHeader>
        <DialogTitle>Alterar e-mail</DialogTitle>
        <DialogDescription>
          {passo === "novo" && "Informe o novo e-mail. Vamos enviar um código para o atual e outro para o novo."}
          {passo === "antigo" && (
            <>
              Passo 1 de 2. Digite o código que enviamos para o e-mail{" "}
              <strong className="font-medium text-foreground">atual</strong>, {emailAtual}.
            </>
          )}
          {passo === "confirmar" && (
            <>
              Passo 2 de 2. Agora digite o código que enviamos para o e-mail{" "}
              <strong className="font-medium text-foreground">novo</strong>, {emailDoPasso}.
            </>
          )}
        </DialogDescription>
      </DialogHeader>

      <form
        className="flex flex-col gap-5"
        onSubmit={(evento) => {
          evento.preventDefault();
          if (passo === "novo") pedir();
          else if (passo === "antigo") confirmarAntigo();
          else confirmarNovo();
        }}
      >
        {passo === "novo" ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="troca-email">Novo e-mail</Label>
            <Input
              id="troca-email"
              type="email"
              autoComplete="email"
              autoFocus
              value={novoEmail}
              onChange={(evento) => {
                setNovoEmail(evento.target.value);
                setErro(undefined);
              }}
              placeholder="voce@exemplo.com"
              aria-invalid={erro ? true : undefined}
            />
            {erro && <p className="text-xs text-destructive">{erro}</p>}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Label htmlFor="troca-codigo">Código</Label>
            <Input
              id="troca-codigo"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              value={codigo}
              maxLength={10}
              onChange={(evento) => {
                setCodigo(evento.target.value.replace(/\D/g, ""));
                setErro(undefined);
              }}
              placeholder="000000"
              className="numero tracking-[0.3em]"
              aria-invalid={erro ? true : undefined}
            />
            {erro && <p className="text-xs text-destructive">{erro}</p>}

            {passo === "antigo" && (
              <button
                type="button"
                disabled={enviando}
                onClick={pedir}
                className="w-fit rounded text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
              >
                Não chegou? Enviar de novo
              </button>
            )}
          </div>
        )}

        <DialogFooter className="-mx-5 -mb-5 px-5 py-4">
          <Button type="button" variant="outline" size="lg" onClick={aoConcluir} disabled={enviando}>
            Cancelar
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={enviando || (passo === "novo" ? !novoEmail.trim() : codigo.length < 6)}
          >
            {enviando
              ? "Aguarde…"
              : passo === "novo"
                ? "Enviar códigos"
                : passo === "antigo"
                  ? "Continuar"
                  : "Confirmar troca"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
