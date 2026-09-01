"use client";

import { useEffect, useState } from "react";

import { linkWhatsapp } from "@/lib/empresa";
import { Whatsapp } from "@/components/ui/Icones";

/**
 * Atalho permanente para o WhatsApp. Aparece depois que o usuário passa da
 * primeira dobra, para não competir com os CTAs do hero.
 */
export function BotaoWhatsapp() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const aoRolar = () => setVisivel(window.scrollY > 520);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  return (
    <a
      href={linkWhatsapp()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a Engetec no WhatsApp"
      className="group fixed right-5 z-[var(--z-flutuante)] inline-flex items-center gap-3 rounded-full bg-[var(--engetec-vermelho)] px-4 py-4 text-white shadow-[0_10px_30px_-8px_rgba(216,30,36,0.55)] transition-[opacity,transform,background-color] duration-[280ms] ease-[var(--saida)] hover:bg-[var(--engetec-vermelho-escuro)] active:scale-[0.96] sm:right-8"
      style={{
        bottom: "calc(1.25rem + env(safe-area-inset-bottom))",
        opacity: visivel ? 1 : 0,
        transform: visivel ? "translateY(0) scale(1)" : "translateY(12px) scale(0.9)",
        pointerEvents: visivel ? "auto" : "none",
      }}
    >
      <Whatsapp className="h-6 w-6 flex-none" />
      <span className="hidden max-w-0 overflow-hidden whitespace-nowrap pr-0 text-[0.9375rem] font-semibold transition-[max-width,padding] duration-[320ms] ease-[var(--saida)] group-hover:max-w-[12rem] group-hover:pr-1.5 lg:inline">
        Solicitar orçamento
      </span>
    </a>
  );
}
