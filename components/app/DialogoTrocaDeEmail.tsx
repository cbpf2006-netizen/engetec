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
import { CampoSenha } from "@/components/auth/campos";
import { pedirTrocaDeEmail } from "@/lib/acoes/conta";

/* =============================================================================
   Troca de e-mail

   Um passo só: novo endereço e senha atual. A troca vale na hora, sem e-mail
   de confirmação.

   A senha atual entra aqui porque, sem confirmação no endereço antigo, ela é
   o que separa o dono da conta de quem só achou uma sessão aberta.
   ========================================================================== */

export function DialogoTrocaDeEmail({
  aberto,
  aoMudarAberto,
}: {
  aberto: boolean;
  aoMudarAberto: (aberto: boolean) => void;
}) {
  return (
    <Dialog open={aberto} onOpenChange={aoMudarAberto}>
      <DialogContent className="gap-5 p-5 sm:max-w-md">
        {aberto && <Formulario aoConcluir={() => aoMudarAberto(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function Formulario({ aoConcluir }: { aoConcluir: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erros, setErros] = useState<{ email?: string; senha?: string; geral?: string }>({});
  const [enviando, iniciar] = useTransition();

  function enviar() {
    setErros({});

    iniciar(async () => {
      const resultado = await pedirTrocaDeEmail({ email, senha });

      if (!resultado.ok) {
        if (resultado.campo === "email") setErros({ email: resultado.erro });
        else if (resultado.campo === "senha") setErros({ senha: resultado.erro });
        else setErros({ geral: resultado.erro });
        return;
      }

      toast.success("E-mail alterado.");
      router.refresh();
      aoConcluir();
    });
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Alterar e-mail</DialogTitle>
        <DialogDescription>
          Informe o novo endereço e sua senha atual.
        </DialogDescription>
      </DialogHeader>

      <form
        className="flex flex-col gap-4"
        onSubmit={(evento) => {
          evento.preventDefault();
          enviar();
        }}
      >
        {erros.geral && (
          <p role="alert" className="rounded-xl bg-saida-suave px-3.5 py-3 text-sm text-saida-texto">
            {erros.geral}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="troca-email">Novo e-mail</Label>
          <Input
            id="troca-email"
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(evento) => {
              setEmail(evento.target.value);
              setErros((atual) => ({ ...atual, email: undefined }));
            }}
            placeholder="voce@exemplo.com"
            aria-invalid={erros.email ? true : undefined}
          />
          {erros.email && <p className="text-xs text-destructive">{erros.email}</p>}
        </div>

        <CampoSenha
          id="troca-senha"
          rotulo="Sua senha atual"
          autoComplete="current-password"
          value={senha}
          onChange={(evento) => {
            setSenha(evento.target.value);
            setErros((atual) => ({ ...atual, senha: undefined }));
          }}
          dica="Pedimos a senha para confirmar que é você."
          erro={erros.senha}
        />

        <DialogFooter className="-mx-5 -mb-5 px-5 py-4">
          <Button type="button" variant="outline" size="lg" onClick={aoConcluir} disabled={enviando}>
            Cancelar
          </Button>
          <Button type="submit" size="lg" disabled={enviando || !email.trim() || !senha}>
            {enviando ? "Alterando…" : "Alterar e-mail"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
