"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Direção do movimento de entrada. */
  tipo?: "baixo" | "lado" | "escala" | "traco";
  /** Atraso em milissegundos, usado para escalonar listas. */
  atraso?: number;
  /** Elemento renderizado. Permite revelar um <li>, <article> etc. */
  como?: ElementType;
  className?: string;
};

/**
 * Revela o conteúdo quando ele entra na viewport.
 * O estado inicial e a transição vivem no CSS (`[data-revelar]`), então quem
 * usa `prefers-reduced-motion: reduce` vê o conteúdo já posicionado.
 */
export function Revelar({
  children,
  tipo = "baixo",
  atraso = 0,
  como: Como = "div",
  className,
}: Props) {
  const referencia = useRef<HTMLElement>(null);

  useEffect(() => {
    const elemento = referencia.current;
    if (!elemento) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elemento.dataset.visivel = "true";
      return;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          (entrada.target as HTMLElement).dataset.visivel = "true";
          observador.unobserve(entrada.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  return (
    <Como
      ref={referencia}
      data-revelar={tipo}
      style={atraso ? ({ "--atraso": `${atraso}ms` } as React.CSSProperties) : undefined}
      className={className}
    >
      {children}
    </Como>
  );
}
