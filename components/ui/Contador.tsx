"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  valor: number;
  prefixo?: string;
  sufixo?: string;
  duracao?: number;
  className?: string;
};

/** Conta de 0 até `valor` quando o número entra na viewport. */
export function Contador({
  valor,
  prefixo = "",
  sufixo = "",
  duracao = 1400,
  className,
}: Props) {
  const referencia = useRef<HTMLSpanElement>(null);
  const [atual, setAtual] = useState(0);

  useEffect(() => {
    const elemento = referencia.current;
    if (!elemento) return;

    let quadro = 0;

    const observador = new IntersectionObserver(
      (entradas) => {
        if (!entradas[0]?.isIntersecting) return;
        observador.disconnect();

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setAtual(valor);
          return;
        }

        const inicio = performance.now();
        const animar = (agora: number) => {
          const progresso = Math.min((agora - inicio) / duracao, 1);
          // easeOutExpo: rápido no começo, assenta no fim
          const suavizado =
            progresso === 1 ? 1 : 1 - Math.pow(2, -10 * progresso);
          setAtual(Math.round(suavizado * valor));
          if (progresso < 1) quadro = requestAnimationFrame(animar);
        };
        quadro = requestAnimationFrame(animar);
      },
      { threshold: 0.4 },
    );

    observador.observe(elemento);
    return () => {
      observador.disconnect();
      cancelAnimationFrame(quadro);
    };
  }, [valor, duracao]);

  return (
    <span ref={referencia} className={className}>
      {prefixo}
      {atual}
      {sufixo}
    </span>
  );
}
