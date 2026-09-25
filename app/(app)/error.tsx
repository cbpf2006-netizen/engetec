"use client";

import { useEffect } from "react";
import { RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

/* Fronteira de erro das telas do app. Mostra uma saída (tentar de novo) em vez
   de uma tela branca, e não expõe a mensagem original: texto de erro de banco
   ou de rede não ajuda quem está usando e pode revelar detalhes internos. */
export default function Erro({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("[raiz] erro na tela:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
      <div className="flex max-w-md flex-col gap-2">
        <h1 className="text-xl font-semibold tracking-tight">Não conseguimos carregar esta tela</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Pode ter sido a conexão ou uma falha momentânea do servidor. Seus lançamentos estão
          salvos.
        </p>
      </div>

      <Button size="lg" onClick={reset}>
        <RefreshCcw />
        Tentar de novo
      </Button>
    </div>
  );
}
