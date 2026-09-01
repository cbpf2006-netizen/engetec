import type { Metadata } from "next";
import Image from "next/image";

import { empresa, linkWhatsapp, servicos } from "@/lib/empresa";
import { HeroPagina } from "@/components/layout/HeroPagina";
import { CtaOrcamento } from "@/components/home/CtaOrcamento";
import { Processo } from "@/components/home/Processo";
import { BotaoLink } from "@/components/ui/Botao";
import { Revelar } from "@/components/ui/Revelar";
import { Check, IconeServico, Whatsapp } from "@/components/ui/Icones";

export const metadata: Metadata = {
  title: "Serviços elétricos",
  description:
    "Instalações elétricas residenciais e comerciais, quadros e painéis, energia solar fotovoltaica, redes elétricas e padrão de entrada em Araruama e região.",
  alternates: { canonical: "/servicos" },
};

export default function PaginaServicos() {
  return (
    <>
      <HeroPagina
        rotulo="Serviços"
        titulo="O que a Engetec executa em campo"
        descricao={`Quatro frentes de serviço elétrico para projetos residenciais e comerciais em ${empresa.regiao}.`}
        imagem="/img/obra-1.jpg"
        alt="Eletricista da Engetec trabalhando em rede elétrica aérea"
        posicao="50% 32%"
        acoes={
          <BotaoLink href={linkWhatsapp()} externo tamanho="lg">
            <Whatsapp className="h-5 w-5" />
            Solicitar orçamento
          </BotaoLink>
        }
      />

      <div className="bg-[var(--papel)]">
        {servicos.map((servico, indice) => {
          const invertido = indice % 2 === 1;

          return (
            <section
              key={servico.id}
              id={servico.id}
              className="scroll-mt-28 border-b border-[var(--linha-clara)] py-16 last:border-b-0 md:py-24"
              style={{
                backgroundColor: invertido ? "var(--papel-2)" : "var(--papel)",
              }}
            >
              <div className="envoltorio">
                <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
                  <Revelar
                    tipo="escala"
                    className={`lg:col-span-6 ${invertido ? "lg:order-2" : ""}`}
                  >
                    <div className="cantos relative aspect-[4/3] overflow-hidden rounded-[var(--raio)] bg-[var(--papel-2)]">
                      <Image
                        src={servico.imagem}
                        alt={servico.alt}
                        fill
                        sizes="(min-width: 1024px) 48vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  </Revelar>

                  <div className={`lg:col-span-6 ${invertido ? "lg:order-1" : ""}`}>
                    <Revelar>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[0.6875rem] tracking-[0.2em] text-[var(--engetec-vermelho)]">
                          {servico.numero}
                        </span>
                        <span className="h-px w-8 bg-[var(--engetec-vermelho)]" />
                        <IconeServico
                          nome={servico.id}
                          className="h-5 w-5 text-[var(--engetec-vermelho)]"
                        />
                      </div>

                      <h2 className="mt-5 max-w-[18ch] text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] font-bold leading-[1.05] tracking-[-0.035em]">
                        {servico.nome}
                      </h2>

                      <p className="corpo mt-5 text-[var(--texto-suave)]">
                        {servico.descricao}
                      </p>
                    </Revelar>

                    <Revelar atraso={120}>
                      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                        {servico.itens.map((item) => (
                          <li key={item} className="flex items-start gap-3">
                            <Check className="mt-0.5 h-[18px] w-[18px] flex-none text-[var(--engetec-vermelho)]" />
                            <span className="text-[0.9375rem] leading-snug text-[var(--texto-suave)]">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </Revelar>

                    <Revelar atraso={180} className="mt-9">
                      <BotaoLink
                        href={linkWhatsapp(
                          `Olá! Gostaria de solicitar um orçamento com a Engetec para: ${servico.nome}.`,
                        )}
                        externo
                        variante="primario"
                      >
                        <Whatsapp className="h-[18px] w-[18px]" />
                        Orçamento deste serviço
                      </BotaoLink>
                    </Revelar>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <Processo />
      <CtaOrcamento />
    </>
  );
}
