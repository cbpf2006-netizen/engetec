import Image from "next/image";

import { empresa, missao, valores, visao } from "@/lib/empresa";
import { BotaoLink } from "@/components/ui/Botao";
import { Revelar } from "@/components/ui/Revelar";
import { Check, Seta } from "@/components/ui/Icones";

export function Sobre() {
  return (
    <section id="sobre" className="scroll-mt-24 bg-[var(--papel)] py-20 md:py-28">
      <div className="envoltorio">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Revelar tipo="escala" className="lg:col-span-5">
            <div className="relative">
              <span
                className="absolute -bottom-4 -left-4 h-32 w-32 border-b-[3px] border-l-[3px] border-[var(--engetec-vermelho)] md:-bottom-6 md:-left-6 md:h-44 md:w-44"
                aria-hidden="true"
              />
              <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--raio)] bg-[var(--papel-2)]">
                <Image
                  src="/img/obra-2.jpg"
                  alt="Técnico da Engetec instalando módulos fotovoltaicos em telhado"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover object-[60%_center]"
                />
              </div>
              <span
                className="absolute -right-3 -top-3 h-20 w-20 border-r-[3px] border-t-[3px] border-[var(--engetec-amarelo)] md:-right-5 md:-top-5 md:h-28 md:w-28"
                aria-hidden="true"
              />
            </div>
          </Revelar>

          <div className="lg:col-span-7">
            <Revelar>
              <p className="rotulo text-[var(--texto-suave)]">
                Sobre a {empresa.nome}
              </p>
              <h2 className="titulo-secao mt-6 max-w-[19ch]">
                Cinco anos executando instalação elétrica no padrão certo
              </h2>
            </Revelar>

            <Revelar atraso={100}>
              <p className="corpo mt-7 text-[var(--texto-suave)]">
                A {empresa.nome} atende projetos residenciais e comerciais em{" "}
                {empresa.regiao}. Ao longo desses {empresa.anosAtuacao} anos,
                conquistou a confiança de mais de {empresa.clientes} clientes,
                com equipe capacitada e atualizada nas normas e tecnologias do
                setor.
              </p>
            </Revelar>

            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              <Revelar atraso={140} className="border-t border-[var(--linha-clara)] pt-6">
                <h3 className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[var(--engetec-vermelho)]">
                  Missão
                </h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--texto-suave)]">
                  {missao}
                </p>
              </Revelar>

              <Revelar atraso={200} className="border-t border-[var(--linha-clara)] pt-6">
                <h3 className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[var(--engetec-vermelho)]">
                  Visão
                </h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--texto-suave)]">
                  {visao}
                </p>
              </Revelar>
            </div>

            <Revelar atraso={240} className="mt-10">
              <h3 className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[var(--texto-forte)]">
                Valores
              </h3>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {valores.map((valor) => (
                  <li key={valor} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-[18px] w-[18px] flex-none text-[var(--engetec-vermelho)]" />
                    <span className="text-[0.9375rem] leading-snug text-[var(--texto-suave)]">
                      {valor}
                    </span>
                  </li>
                ))}
              </ul>
            </Revelar>

            <Revelar atraso={280} className="mt-10">
              <BotaoLink href="/sobre" variante="contorno">
                Conhecer a empresa
                <Seta className="h-[18px] w-[18px] transition-transform duration-[220ms] ease-[var(--saida)] group-hover:translate-x-1" />
              </BotaoLink>
            </Revelar>
          </div>
        </div>
      </div>
    </section>
  );
}
