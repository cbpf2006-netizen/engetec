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

      {servicos.map((servico, indice) => {
        const invertido = indice % 2 === 1;

        return (
          <section
            key={servico.id}
            id={servico.id}
            className="scroll-mt-28 py-16 md:py-20 lg:py-[120px]"
            style={{
              backgroundColor: invertido
                ? "var(--color-background)"
                : "var(--color-background-deep)",
            }}
          >
            <div className="envoltorio">
              <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
                <Revelar
                  tipo="escala"
                  className={`lg:col-span-6 ${invertido ? "lg:order-2" : ""}`}
                >
                  <div className="cantos relative">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-surface)]">
                      <Image
                        src={servico.imagem}
                        alt={servico.alt}
                        fill
                        sizes="(min-width: 1024px) 48vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  </div>
                </Revelar>

                <div className={`lg:col-span-6 ${invertido ? "lg:order-1" : ""}`}>
                  <Revelar>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[length:var(--text-label)] font-medium tracking-[var(--tracking-label)] text-[var(--color-primary-light)]">
                        {servico.numero}
                      </span>
                      <span className="h-px w-8 bg-[var(--color-primary)]" />
                      <IconeServico
                        nome={servico.id}
                        className="h-5 w-5 text-[var(--color-secondary)]"
                      />
                    </div>

                    <h2 className="titulo-secao mt-6">{servico.nome}</h2>

                    <p className="corpo mt-6">{servico.descricao}</p>
                  </Revelar>

                  <Revelar atraso={120}>
                    <ul className="mt-9 grid gap-4 sm:grid-cols-2">
                      {servico.itens.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <Check className="mt-0.5 h-[18px] w-[18px] flex-none text-[var(--color-primary-light)]" />
                          <span className="text-[length:var(--text-ui)] leading-snug text-[var(--color-text-secondary)]">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </Revelar>

                  <Revelar atraso={180} className="mt-10">
                    <BotaoLink
                      href={linkWhatsapp(
                        `Olá! Gostaria de solicitar um orçamento com a Engetec para: ${servico.nome}.`,
                      )}
                      externo
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

      <Processo />
      <CtaOrcamento />
    </>
  );
}
