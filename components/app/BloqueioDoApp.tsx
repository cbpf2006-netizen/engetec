"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { Lock, ScanFace } from "lucide-react";

import LogoRaiz from "@/components/marca/LogoRaiz";
import { Button } from "@/components/ui/button";
import { sair } from "@/lib/acoes/autenticacao";
import {
  bloqueioAtivo,
  deveTrancar,
  desativarBloqueio,
  iniciarUso,
  marcarVisto,
  verificarBloqueio,
} from "@/lib/bloqueio";

/* =============================================================================
   Bloqueio do app

   Envolve o app inteiro. Com o bloqueio ligado neste aparelho, mostra a tela de
   desbloqueio em vez do conteúdo quando o app foi FECHADO e aberto de novo
   (sempre), ou quando ficou mais de 1 minuto em segundo plano. Ver
   lib/bloqueio.ts para as regras e para o que este bloqueio é e não é.

   O estado vive fora do React (um módulo) porque quem o muda são eventos do
   navegador — a página ir para segundo plano e voltar —, não interações com a
   árvore. `useSyncExternalStore` liga os dois sem efeitos que disparam
   setState.

   O conteúdo protegido é escondido por CSS (`data-bloqueado` no <html>, posto
   por um script antes da primeira pintura e pelos próprios eventos aqui) e
   também não é desenhado por baixo da tela de bloqueio.
   ========================================================================== */

const escutas = new Set<() => void>();
let trancado: boolean | null = null; // null = ainda não lido neste carregamento

function marcarNoHtml(valor: boolean): void {
  if (valor) document.documentElement.setAttribute("data-bloqueado", "1");
  else document.documentElement.removeAttribute("data-bloqueado");
}

function definir(valor: boolean): void {
  if (trancado === valor) return;
  trancado = valor;
  marcarNoHtml(valor);
  escutas.forEach((escuta) => escuta());
}

function aoMudarVisibilidade(): void {
  if (document.visibilityState === "hidden") {
    // Guarda o instante em que saiu — é dele que se conta os 5 minutos.
    if (trancado !== true) marcarVisto();
    return;
  }

  if (deveTrancar()) definir(true);
  else if (trancado !== true) marcarVisto();
}

function assinar(escuta: () => void): () => void {
  escutas.add(escuta);

  if (escutas.size === 1) {
    document.addEventListener("visibilitychange", aoMudarVisibilidade);
    window.addEventListener("pagehide", aoMudarVisibilidade);
  }

  return () => {
    escutas.delete(escuta);
    if (escutas.size === 0) {
      document.removeEventListener("visibilitychange", aoMudarVisibilidade);
      window.removeEventListener("pagehide", aoMudarVisibilidade);
    }
  };
}

function lerEstado(): boolean {
  if (trancado === null) {
    trancado = deveTrancar();
    marcarNoHtml(trancado);

    // Abriu sem precisar trancar (primeira vez, ou acabou de entrar na conta):
    // registra o uso, para o próximo fechar-e-abrir já cair no bloqueio.
    if (!trancado && bloqueioAtivo()) iniciarUso();
  }
  return trancado;
}

export function BloqueioDoApp({ children }: { children: ReactNode }) {
  const bloqueado = useSyncExternalStore(assinar, lerEstado, () => false);

  if (bloqueado) return <TelaDeBloqueio />;

  return <div data-protegido className="contents">{children}</div>;
}

function TelaDeBloqueio() {
  const [tentando, setTentando] = useState(false);
  const [falhou, setFalhou] = useState(false);

  async function desbloquear() {
    setTentando(true);
    setFalhou(false);

    const passou = await verificarBloqueio();

    setTentando(false);
    if (passou) {
      iniciarUso();
      definir(false);
    } else {
      setFalhou(true);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Raiz bloqueado"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-background px-6 pb-[env(safe-area-inset-bottom)] text-center"
    >
      <LogoRaiz />

      <div className="flex max-w-xs flex-col items-center gap-3">
        <span className="grid size-14 place-items-center rounded-full bg-accent text-primary">
          <Lock className="size-6" aria-hidden="true" />
        </span>
        <h1 className="text-xl font-semibold tracking-tight">Raiz bloqueado</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Confirme com o Face ID, a digital ou a senha do aparelho para continuar.
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-2">
        <Button type="button" size="lg" className="w-full" disabled={tentando} onClick={desbloquear}>
          <ScanFace />
          {tentando ? "Confirmando…" : "Desbloquear"}
        </Button>

        {falhou && (
          <p role="alert" className="text-xs text-destructive">
            Não foi possível confirmar. Tente de novo.
          </p>
        )}

        {/* Saída de emergência: se a credencial do aparelho se perdeu (passkey
            apagada, aparelho restaurado), a pessoa não pode ficar presa aqui.
            Sair da conta desliga o bloqueio deste aparelho e leva ao login. */}
        <form
          action={sair}
          onSubmit={() => {
            desativarBloqueio();
            marcarNoHtml(false);
          }}
        >
          <Button type="submit" variant="ghost" className="w-full text-muted-foreground">
            Sair da conta
          </Button>
        </form>
      </div>
    </div>
  );
}
