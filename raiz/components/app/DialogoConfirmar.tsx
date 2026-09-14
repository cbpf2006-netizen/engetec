"use client";

import { useTransition, type ReactNode } from "react";
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
import type { Resultado } from "@/lib/tipos";

/* =============================================================================
   Confirmação de ação destrutiva

   Só para o que não tem volta. Excluir um lançamento apaga dado que ninguém
   tem como recuperar, então aqui a pergunta se justifica — e ela diz o que
   exatamente vai embora, não um "tem certeza?" genérico.
   ========================================================================== */

export function DialogoConfirmar({
  aberto,
  aoMudarAberto,
  titulo,
  descricao,
  rotuloDoBotao = "Excluir",
  mensagemDeSucesso,
  acao,
}: {
  aberto: boolean;
  aoMudarAberto: (aberto: boolean) => void;
  titulo: string;
  descricao: ReactNode;
  rotuloDoBotao?: string;
  mensagemDeSucesso?: string;
  acao: () => Promise<Resultado>;
}) {
  const [enviando, iniciar] = useTransition();

  function confirmar() {
    iniciar(async () => {
      const resultado = await acao();
      if (!resultado.ok) {
        toast.error(resultado.erro);
        return;
      }
      if (mensagemDeSucesso) toast.success(mensagemDeSucesso);
      aoMudarAberto(false);
    });
  }

  return (
    <Dialog open={aberto} onOpenChange={aoMudarAberto}>
      <DialogContent className="gap-4 p-5" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{descricao}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="-mx-5 -mb-5 px-5 py-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => aoMudarAberto(false)}
            disabled={enviando}
          >
            Cancelar
          </Button>
          <Button
            size="lg"
            onClick={confirmar}
            disabled={enviando}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {enviando ? "Excluindo…" : rotuloDoBotao}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
