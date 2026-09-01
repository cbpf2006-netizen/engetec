import Image from "next/image";
import Link from "next/link";

import { servicos } from "@/lib/empresa";
import { Revelar } from "@/components/ui/Revelar";
import { BotaoSeta } from "@/components/ui/Botao";
import { IconeServico, Seta, SetaCanto } from "@/components/ui/Icones";

/**
 * Seção assimétrica 7/5: lista de Feature Row Cards à esquerda, Photo Frame à
 * direita. Linhas com hairline em vez de grade de cards idênticos.
 */
export function Servicos() {
  return (
    <section
      id="servicos"
      className="scroll-mt-24 bg-[var(--color-background)] py-16 md:py-20 lg:py-[120px]"
    >
      <div className="envoltorio">
        <Revelar className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="rotulo">O que executamos</p>
            <h2 className="titulo-secao mt-6">
              Serviços elétricos do projeto à entrega
            </h2>
          </div>
          <Link
            href="/servicos"
            className="group inline-flex items-center gap-2.5 self-start pb-2 text-[length:var(--text-ui)] text-[var(--color-text-secondary)] transition-colors duration-200 hover:text-[var(--color-text-primary)] md:self-auto"
          >
            <span className="relative">
              Ver todos os serviços
              <span
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-1 h-[2px] origin-left scale-x-0 bg-[var(--color-primary)] transition-transform duration-[var(--duration-medium)] ease-[var(--ease-out)] group-hover:scale-x-100"
              />
            </span>
            <Seta className="h-[18px] w-[18px] transition-transform duration-[var(--duration-medium)] ease-[var(--ease-out)] group-hover:translate-x-1" />
          </Link>
        </Revelar>

        <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <ul className="lg:col-span-7">
            {servicos.map((servico, indice) => (
              <Revelar
                como="li"
                key={servico.id}
                atraso={indice * 70}
                className="border-b border-[var(--color-border)] last:border-b-0"
              >
                <Link
                  href={`/servicos#${servico.id}`}
                  className="group flex items-start gap-6 py-9 transition-colors duration-[var(--duration-medium)] md:py-12"
                >
                  <span className="flex w-8 flex-none flex-col items-start gap-4 pt-1">
                    <span className="font-mono text-[length:var(--text-label)] font-medium tracking-[var(--tracking-label)] text-[var(--color-primary-light)]">
                      {servico.numero}
                    </span>
                    <IconeServico
                      nome={servico.id}
                      className="h-5 w-5 text-[var(--color-text-muted)] transition-colors duration-[var(--duration-medium)] group-hover:text-[var(--color-secondary)]"
                    />
                  </span>

                  <div className="min-w-0 flex-1">
                    <h3 className="titulo-card text-[var(--color-text-primary)] transition-colors duration-[var(--duration-medium)] group-hover:text-[var(--color-secondary)]">
                      {servico.nome}
                    </h3>
                    <p className="corpo mt-4">{servico.resumo}</p>
                  </div>

                  <BotaoSeta className="mt-1">
                    <SetaCanto className="h-4 w-4" />
                  </BotaoSeta>
                </Link>
              </Revelar>
            ))}
          </ul>

          <Revelar tipo="escala" atraso={140} className="lg:col-span-5">
            <div className="cantos relative lg:sticky lg:top-28">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-surface)] lg:aspect-[4/5]">
                <Image
                  src="/img/obra-4.jpg"
                  alt="Técnico da Engetec conectando cabos de potência em painel elétrico"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover object-[58%_32%]"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(16,13,12,0.72) 0%, rgba(16,13,12,0.1) 55%, rgba(16,13,12,0) 100%)",
                  }}
                  aria-hidden="true"
                />
                <p className="absolute inset-x-0 bottom-0 p-6 text-[length:var(--text-ui)] font-medium text-[var(--color-text-primary)]">
                  Painel de baixa tensão em obra comercial
                </p>
              </div>
            </div>
          </Revelar>
        </div>
      </div>
    </section>
  );
}
