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

      <section className="bg-[var(--papel)] py-20 md:py-28">
        <div className="envoltorio">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Revelar className="lg:col-span-5">
              <p className="rotulo text-[var(--texto-suave)]">Quem somos</p>
              <h2 className="titulo-secao mt-6 max-w-[15ch]">
                Uma equipe especializada em serviço elétrico
              </h2>
            </Revelar>

            <div className="flex flex-col gap-6 lg:col-span-7">
              <Revelar atraso={80}>
                <p className="corpo text-[var(--texto-suave)]">
                  A {empresa.nome} é uma empresa especializada em instalações
                  elétricas, com compromisso firme com a qualidade, a segurança e
                  a inovação. Fundada há {empresa.anosAtuacao} anos, nasceu para
                  transformar o setor de instalações elétricas na região,
                  entregando soluções completas e eficazes.
                </p>
              </Revelar>
              <Revelar atraso={140}>
                <p className="corpo text-[var(--texto-suave)]">
                  Ao longo desse período, a empresa conquistou a confiança de mais
                  de {empresa.clientes} clientes. O trabalho é feito por
                  profissionais capacitados e atualizados nas normas e tecnologias
                  do setor, com atendimento dimensionado para a necessidade real
                  de cada projeto.
                </p>
              </Revelar>

              <Revelar tipo="escala" atraso={200} className="mt-4">
                <div className="cantos relative aspect-[16/9] overflow-hidden rounded-[var(--raio)] bg-[var(--papel-2)]">
                  <Image
                    src="/img/obra-3.jpg"
                    alt="Profissional da Engetec uniformizado durante instalação de poste"
                    fill
                    sizes="(min-width: 1024px) 58vw, 100vw"
                    className="object-cover object-[50%_35%]"
                  />
                </div>
              </Revelar>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--papel-2)] py-20 md:py-28">
        <div className="envoltorio">
          <div className="grid gap-px bg-[var(--linha-clara)] lg:grid-cols-2">
            <Revelar className="bg-[var(--papel-2)] p-8 md:p-12">
              <h2 className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[var(--engetec-vermelho)]">
                Missão
              </h2>
              <p className="mt-6 text-[clamp(1.25rem,1rem+0.9vw,1.75rem)] font-semibold leading-[1.3] tracking-[-0.025em]">
                {missao}
              </p>
            </Revelar>

            <Revelar atraso={110} className="bg-[var(--papel-2)] p-8 md:p-12">
              <h2 className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[var(--engetec-vermelho)]">
                Visão
              </h2>
              <p className="mt-6 text-[clamp(1.25rem,1rem+0.9vw,1.75rem)] font-semibold leading-[1.3] tracking-[-0.025em]">
                {visao}
              </p>
            </Revelar>
          </div>

          <div className="mt-16">
            <Revelar>
              <h2 className="titulo-secao max-w-[14ch]">
                Valores que orientam o trabalho
              </h2>
            </Revelar>

            <ol className="mt-10 grid gap-x-10 gap-y-1 md:grid-cols-2">
              {valores.map((valor, indice) => (
                <Revelar
                  como="li"
                  key={valor}
                  atraso={indice * 70}
                  className="flex items-baseline gap-5 border-b border-[var(--linha-clara)] py-6"
                >
                  <span className="font-mono text-[0.75rem] tracking-[0.16em] text-[var(--texto-suave)]">
                    0{indice + 1}
                  </span>
                  <span className="text-[1.0625rem] font-semibold leading-snug tracking-[-0.02em]">
                    {valor}
                  </span>
                </Revelar>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <Numeros />
      <Diferenciais />
      <CtaOrcamento />
    </>
  );
}
