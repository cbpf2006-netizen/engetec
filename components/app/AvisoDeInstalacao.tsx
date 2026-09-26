"use client";

import { useState, useSyncExternalStore } from "react";
import { Share, X } from "lucide-react";

import { Button } from "@/components/ui/button";

/* =============================================================================
   Aviso de instalação no iPhone

   O iOS não tem o botão "instalar" do Android: a pessoa precisa saber que o
   caminho é Compartilhar → Adicionar à Tela de Início. Este aviso ensina isso,
   uma vez, e só a quem pode usá-lo: iPhone/iPad no Safari, ainda fora do modo
   instalado. Quem já instalou (ou usa outro navegador/aparelho) nunca o vê.

   Dispensar grava no aparelho e não volta — insistir num aviso de instalação é
   o jeito mais rápido de ser ignorado por completo.
   ========================================================================== */

const CHAVE = "raiz:aviso-instalar-dispensado";

function lerDispensado(): boolean {
  try {
    return window.localStorage.getItem(CHAVE) === "1";
  } catch {
    return false;
  }
}

function elegivel(): boolean {
  const ua = navigator.userAgent;

  const ehIos =
    /iPad|iPhone|iPod/.test(ua) ||
    // iPadOS se apresenta como Mac; o que o entrega é a tela de toque.
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  // Só o Safari: nos outros navegadores do iOS o caminho da instalação é outro.
  const ehSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|GSA|Instagram|FBAN|FBAV/.test(ua);

  const instalado =
    (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches;

  return ehIos && ehSafari && !instalado && !lerDispensado();
}

// O ambiente do aparelho não muda durante a visita: nada a assinar.
const semAssinatura = () => () => {};

export function AvisoDeInstalacao() {
  const podeMostrar = useSyncExternalStore(semAssinatura, elegivel, () => false);
  const [fechado, setFechado] = useState(false);

  if (!podeMostrar || fechado) return null;

  function dispensar() {
    try {
      window.localStorage.setItem(CHAVE, "1");
    } catch {
      /* sem armazenamento: o aviso só volta na próxima visita */
    }
    setFechado(true);
  }

  return (
    <aside
      aria-label="Instalar o Raiz no iPhone"
      className="mb-5 flex items-start gap-3 rounded-2xl bg-accent px-4 py-3.5 text-accent-foreground ring-1 ring-border sm:mb-6"
    >
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-card text-primary">
        <Share className="size-4" aria-hidden="true" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-sm font-semibold">Instale o Raiz no seu iPhone</p>
        <p className="text-xs leading-relaxed opacity-90">
          Toque em <strong className="font-semibold">Compartilhar</strong> (o quadrado com a seta,
          na barra do Safari) e depois em{" "}
          <strong className="font-semibold">Adicionar à Tela de Início</strong>. O Raiz passa a
          abrir em tela cheia, como um app.
        </p>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="shrink-0"
        onClick={dispensar}
        aria-label="Dispensar aviso de instalação"
      >
        <X />
      </Button>
    </aside>
  );
}
