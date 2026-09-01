"use client";

import { useEffect, useState } from "react";

import { linkWhatsapp } from "@/lib/empresa";
import { Whatsapp } from "@/components/ui/Icones";

/**
 * Atalho permanente para o WhatsApp. Aparece depois da primeira dobra para não
 * competir com os CTAs do hero. Raio --radius-small: o sistema não tem pill.
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
      className="group fixed right-5 z-[var(--z-floating)] inline-flex h-14 items-center gap-3 rounded-[var(--radius-small)] bg-[var(--color-primary)] px-[18px] text-[var(--color-text-primary)] transition-[opacity,transform,background-color] duration-[var(--duration-medium)] ease-[var(--ease-out)] hover:bg-[var(--color-primary-dark)] active:scale-[0.96] sm:right-8"
      style={{
        bottom: "calc(20px + env(safe-area-inset-bottom))",
        opacity: visivel ? 1 : 0,
        transform: visivel ? "translateY(0)" : "translateY(12px)",
        pointerEvents: visivel ? "auto" : "none",
      }}
    >
      <Whatsapp className="h-6 w-6 flex-none" />
      <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-[length:var(--text-ui)] font-medium transition-[max-width,padding] duration-[320ms] ease-[var(--ease-out)] group-hover:max-w-[13rem] group-hover:pr-1 lg:inline">
        Solicitar orçamento
      </span>
    </a>
  );
}
