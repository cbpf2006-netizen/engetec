import type { Metadata } from "next";
import Image from "next/image";

import { empresa, linkWhatsapp, missao, valores, visao } from "@/lib/empresa";
import { HeroPagina } from "@/components/layout/HeroPagina";
import { Numeros } from "@/components/home/Numeros";
import { Diferenciais } from "@/components/home/Diferenciais";
import { CtaOrcamento } from "@/components/home/CtaOrcamento";
import { BotaoLink } from "@/components/ui/Botao";
import { Revelar } from "@/components/ui/Revelar";
import { Whatsapp } from "@/components/ui/Icones";

export const metadata: Metadata = {
  title: "Sobre a empresa",
  description:
    "A Engetec é especializada em instalações elétricas em Araruama e região. Conheça a história, a missão, a visão e os valores da empresa.",
  alternates: { canonical: "/sobre" },
};

export default function PaginaSobre() {
  return (
    <>
      <HeroPagina
        rotulo="Sobre"
        titulo="Instalação elétrica com qualidade, segurança e inovação"
        descricao={`Fundada há ${empresa.anosAtuacao} anos, a ${empresa.nome} já conquistou a confiança de mais de ${empresa.clientes} clientes em projetos residenciais e comerciais.`}
        imagem="/img/obra-2.jpg"
        alt="Equipe da Engetec instalando painéis solares"
        posicao="50% 45%"
        acoes={
          <BotaoLink href={linkWhatsapp()} externo tamanho="lg">
            <Whatsapp className="h-5 w-5" />
            Falar com a equipe
          </BotaoLink>
        }
      />

      <section className="bg-[var(--color-background-deep)] py-16 md:py-20 lg:py-[120px]">
        <div className="envoltorio">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Revelar className="lg:col-span-5">
              <p className="rotulo">Quem somos</p>
              <h2 className="titulo-secao mt-6">
                Uma equipe especializada em serviço elétrico
              </h2>
            </Revelar>

            <div className="flex flex-col gap-7 lg:col-span-7">
              <Revelar atraso={80}>
                <p className="corpo">
                  A {empresa.nome} é uma empresa especializada em instalações
                  elétricas, com compromisso firme com a qualidade, a segurança e
                  a inovação. Fundada há {empresa.anosAtuacao} anos, nasceu para
                  transformar o setor de instalações elétricas na região,
                  entregando soluções completas e eficazes.
                </p>
              </Revelar>
              <Revelar atraso={140}>
                <p className="corpo">
                  Ao longo desse período, a empresa conquistou a confiança de mais
                  de {empresa.clientes} clientes. O trabalho é feito por
                  profissionais capacitados e atualizados nas normas e tecnologias
                  do setor, com atendimento dimensionado para a necessidade real
                  de cada projeto.
                </p>
              </Revelar>

              <Revelar tipo="escala" atraso={200} className="mt-3">
                <div className="cantos relative">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-surface)]">
                    <Image
                      src="/img/obra-3.jpg"
                      alt="Profissional da Engetec uniformizado durante instalação de poste"
                      fill
                      sizes="(min-width: 1024px) 58vw, 100vw"
                      className="object-cover object-[50%_35%]"
                    />
                  </div>
                </div>
              </Revelar>
            </div>
          </div>

          <div className="mt-20 grid gap-px bg-[var(--color-border-hairline)] lg:grid-cols-2">
            <Revelar className="bg-[var(--color-background-deep)] p-9 md:p-12">
              <h2 className="font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[var(--tracking-label)] text-[var(--color-primary-light)]">
                Missão
              </h2>
              <p className="mt-7 text-[length:var(--fluid-h3)] font-medium leading-[1.3] tracking-[var(--tracking-subheading)] text-[var(--color-text-primary)]">
                {missao}
              </p>
            </Revelar>

            <Revelar
              atraso={110}
              className="bg-[var(--color-background-deep)] p-9 md:p-12"
            >
              <h2 className="font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[var(--tracking-label)] text-[var(--color-primary-light)]">
                Visão
              </h2>
              <p className="mt-7 text-[length:var(--fluid-h3)] font-medium leading-[1.3] tracking-[var(--tracking-subheading)] text-[var(--color-text-primary)]">
                {visao}
              </p>
            </Revelar>
          </div>

          <div className="mt-20">
            <Revelar>
              <h2 className="titulo-secao">Valores que orientam o trabalho</h2>
            </Revelar>

            <ol className="mt-10 grid gap-x-16 md:grid-cols-2">
              {valores.map((valor, indice) => (
                <Revelar
                  como="li"
                  key={valor}
                  atraso={indice * 70}
                  className="flex items-baseline gap-6 border-b border-[var(--color-border)] py-7"
                >
                  <span className="font-mono text-[length:var(--text-label)] font-medium tracking-[var(--tracking-label)] text-[var(--color-text-secondary)]">
                    0{indice + 1}
                  </span>
                  <span className="text-[length:var(--text-subheading)] font-medium leading-snug tracking-[var(--tracking-subheading)] text-[var(--color-text-primary)]">
                    {valor}
                  </span>
                </Revelar>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <Numeros superficie="base" />
      <Diferenciais />
      <CtaOrcamento />
    </>
  );
}
