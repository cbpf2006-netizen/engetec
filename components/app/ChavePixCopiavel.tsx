"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";

/* =============================================================================
   Pix copia e cola

   Mostra a chave e um botão que a copia. O campo de texto fica visível (e
   selecionável) de propósito: se a cópia automática for bloqueada pelo
   navegador, a pessoa ainda consegue selecionar e copiar à mão.

   `navigator.clipboard` só existe em contexto seguro (HTTPS ou localhost).
   Fora dele — por exemplo, abrindo o app pelo IP da rede local no celular —
   o botão cai num método antigo (textarea + execCommand) em vez de falhar.
   ========================================================================== */

async function copiar(texto: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(texto);
      return true;
    }
  } catch {
    /* segue para o método antigo */
  }

  try {
    const area = document.createElement("textarea");
    area.value = texto;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

export function ChavePixCopiavel({ chave }: { chave: string }) {
  const [estado, setEstado] = useState<"parado" | "copiado" | "falhou">("parado");
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    };
  }, []);

  async function aoCopiar() {
    const ok = await copiar(chave);
    setEstado(ok ? "copiado" : "falhou");

    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setEstado("parado"), 2500);
  }

  return (
    <div className="flex w-full flex-col gap-2 text-left">
      <label htmlFor="pix-chave" className="text-xs font-medium text-muted-foreground">
        Pix copia e cola
      </label>

      <textarea
        id="pix-chave"
        readOnly
        value={chave}
        rows={3}
        onFocus={(evento) => evento.currentTarget.select()}
        className="w-full resize-none rounded-xl border border-input bg-muted/40 px-3.5 py-2.5 text-xs leading-relaxed break-all text-foreground outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15"
      />

      <Button
        type="button"
        variant={estado === "copiado" ? "secondary" : "outline"}
        size="lg"
        className="w-full"
        onClick={aoCopiar}
      >
        {estado === "copiado" ? <Check /> : <Copy />}
        {estado === "copiado" ? "Chave copiada!" : "Copiar chave Pix"}
      </Button>

      <p role="status" aria-live="polite" className="min-h-4 text-xs text-muted-foreground">
        {estado === "copiado" && "Cole no app do seu banco, na opção Pix copia e cola."}
        {estado === "falhou" && "Não foi possível copiar. Selecione o texto acima e copie."}
      </p>
    </div>
  );
}
