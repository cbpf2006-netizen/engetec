import Image from "next/image";

import { empresa, missao, valores, visao } from "@/lib/empresa";
import { BotaoLink } from "@/components/ui/Botao";
import { Revelar } from "@/components/ui/Revelar";
import { Check, Seta } from "@/components/ui/Icones";

export function Sobre() {
  return (
    <section
      id="sobre"
      className="scroll-mt-24 bg-[var(--color-background)] py-16 md:py-20 lg:py-[120px]"
    >
      <div className="envoltorio">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Revelar tipo="escala" className="lg:col-span-5">
            <div className="cantos relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-surface)]">
                <Image
                  src="/img/obra-2.jpg"
                  alt="Técnico da Engetec instalando módulos fotovoltaicos em telhado"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover object-[60%_center]"
                />
              </div>
            </div>
          </Revelar>

          <div className="lg:col-span-7">
            <Revelar>
              <p className="rotulo">Sobre a {empresa.nome}</p>
              <h2 className="titulo-secao mt-6">
                Cinco anos executando instalação elétrica no padrão certo
              </h2>
            </Revelar>

            <Revelar atraso={100}>
              <p className="corpo mt-7">
                A {empresa.nome} atende projetos residenciais e comerciais em{" "}
                {empresa.regiao}. Ao longo desses {empresa.anosAtuacao} anos,
                conquistou a confiança de mais de {empresa.clientes} clientes,
                com equipe capacitada e atualizada nas normas e tecnologias do
                setor.
              </p>
            </Revelar>

            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              <Revelar
                atraso={140}
                className="border-t border-[var(--color-border)] pt-7"
              >
                <h3 className="font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[var(--tracking-label)] text-[var(--color-primary-light)]">
                  Missão
                </h3>
                <p className="corpo mt-4 text-[length:var(--text-ui)]">{missao}</p>
              </Revelar>

              <Revelar
                atraso={200}
                className="border-t border-[var(--color-border)] pt-7"
              >
                <h3 className="font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[var(--tracking-label)] text-[var(--color-primary-light)]">
                  Visão
                </h3>
                <p className="corpo mt-4 text-[length:var(--text-ui)]">{visao}</p>
              </Revelar>
            </div>

            <Revelar atraso={240} className="mt-10">
              <h3 className="font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[var(--tracking-label)] text-[var(--color-text-emphasis)]">
                Valores
              </h3>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {valores.map((valor) => (
                  <li key={valor} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-[18px] w-[18px] flex-none text-[var(--color-primary-light)]" />
                    <span className="text-[length:var(--text-ui)] leading-snug text-[var(--color-text-secondary)]">
                      {valor}
                    </span>
                  </li>
                ))}
              </ul>
            </Revelar>

            <Revelar atraso={280} className="mt-10">
              <BotaoLink href="/sobre" variante="secundario">
                Conhecer a empresa
                <Seta className="h-[18px] w-[18px] transition-transform duration-[var(--duration-medium)] ease-[var(--ease-out)] group-hover:translate-x-1" />
              </BotaoLink>
            </Revelar>
          </div>
        </div>
      </div>
    </section>
  );
}
