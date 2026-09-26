"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CampoSenha } from "@/components/auth/campos";
import { excluirMinhaConta } from "@/lib/acoes/conta";

/* =============================================================================
   Excluir a própria conta

   Fica só na página Perfil, ou seja, só para quem já tem acesso. Quem está
   pendente vê apenas a tela de pagamento, sem essa opção.

   Apaga a conta e todos os dados, sem volta. Por isso o diálogo diz o que vai
   embora e pede a senha: uma sessão esquecida aberta não basta para isso. Ao
   concluir, a própria ação do servidor redireciona para o cadastro; esta tela
   só cuida de mostrar o erro quando algo falha.
   ========================================================================== */

export function BotaoExcluirConta({
  rotulo = "Excluir minha conta",
  variante = "destructive",
  className,
}: {
  rotulo?: string;
  variante?: "destructive" | "ghost";
  className?: string;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <Button type="button" variant={variante} className={className} onClick={() => setAberto(true)}>
        <Trash2 />
        {rotulo}
      </Button>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="gap-5 p-5 sm:max-w-md">
          {aberto && <Confirmacao aoCancelar={() => setAberto(false)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Confirmacao({ aoCancelar }: { aoCancelar: () => void }) {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | undefined>();
  const [enviando, iniciar] = useTransition();

  function excluir() {
    setErro(undefined);

    iniciar(async () => {
      // Em caso de sucesso a ação redireciona e este await nunca devolve.
      const resultado = await excluirMinhaConta({ senha });
      if (resultado && !resultado.ok) setErro(resultado.erro);
    });
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Excluir sua conta?</DialogTitle>
        <DialogDescription>
          Sua conta e todos os seus dados — lançamentos, carteiras, modelos e foto — serão apagados
          e não há como desfazer. Se quiser voltar depois, será preciso se cadastrar de novo.
        </DialogDescription>
      </DialogHeader>

      <form
        className="flex flex-col gap-4"
        onSubmit={(evento) => {
          evento.preventDefault();
          excluir();
        }}
      >
        <CampoSenha
          id="excluir-senha"
          rotulo="Sua senha"
          autoComplete="current-password"
          autoFocus
          value={senha}
          onChange={(evento) => {
            setSenha(evento.target.value);
            setErro(undefined);
          }}
          dica="Digite a senha para confirmar que é você."
          erro={erro}
        />

        <DialogFooter className="-mx-5 -mb-5 px-5 py-4">
          <Button type="button" variant="outline" size="lg" disabled={enviando} onClick={aoCancelar}>
            Cancelar
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={enviando || !senha}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {enviando ? "Excluindo…" : "Excluir minha conta"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
