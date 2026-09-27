"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Check, Copy, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* =============================================================================
   Link de indicação

   O link aponta para a página de apresentação (/comecar?ref=código), não
   direto para o cadastro: quem recebe o link ainda não sabe o que é o Raiz —
   primeiro vê do que se trata, depois decide criar a conta.

   Mesmo padrão de cópia do Pix copia e cola (ChavePixCopiavel): o campo fica
   visível e selecionável, para funcionar mesmo se o navegador bloquear a
   cópia automática.
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

/** A origem só existe no navegador; sem assinatura porque não muda depois de
    montado — só precisa ser lida uma vez, após a hidratação. */
const semAssinatura = () => () => {};
const lerOrigem = () => window.location.origin;

export function LinkDeIndicacao({ codigo }: { codigo: string }) {
  // No servidor (e na primeira pintura no cliente) cai no caminho relativo,
  // que já funciona para copiar; após hidratar, vira o link absoluto.
  const origem = useSyncExternalStore(semAssinatura, lerOrigem, () => "");
  const link = `${origem}/comecar?ref=${codigo}`;
  const [estado, setEstado] = useState<"parado" | "copiado" | "falhou">("parado");
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    };
  }, []);

  async function aoCopiar() {
    const ok = await copiar(link);
    setEstado(ok ? "copiado" : "falhou");

    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setEstado("parado"), 2500);
  }

  async function aoCompartilhar() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Raiz — organize suas finanças",
          text: "Estou usando o Raiz para organizar minhas finanças. Dá uma olhada:",
          url: link,
        });
        return;
      } catch {
        /* pessoa cancelou o compartilhamento — nada a fazer */
      }
    }
    void aoCopiar();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input readOnly value={link} onFocus={(evento) => evento.currentTarget.select()} />
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1 sm:flex-none" onClick={aoCopiar}>
            {estado === "copiado" ? <Check /> : <Copy />}
            {estado === "copiado" ? "Copiado!" : "Copiar"}
          </Button>
          <Button type="button" className="flex-1 sm:flex-none" onClick={aoCompartilhar}>
            <Share2 />
            Compartilhar
          </Button>
        </div>
      </div>

      {estado === "falhou" && (
        <p className="text-xs text-destructive">
          Não foi possível copiar. Selecione o link acima e copie.
        </p>
      )}
    </div>
  );
}
