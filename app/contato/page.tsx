import type { Metadata } from "next";

import { empresa, linkWhatsapp } from "@/lib/empresa";
import { HeroPagina } from "@/components/layout/HeroPagina";
import { CanaisContato } from "@/components/contato/CanaisContato";
import { Formulario } from "@/components/contato/Formulario";
import { Mapa } from "@/components/contato/Mapa";
import { BotaoLink } from "@/components/ui/Botao";
import { Revelar } from "@/components/ui/Revelar";
import { Whatsapp } from "@/components/ui/Icones";

export const metadata: Metadata = {
  title: "Contato e orçamento",
  description: `Fale com a Engetec: WhatsApp ${empresa.telefone}, e-mail ${empresa.email} e atendimento em ${empresa.cidade} e região.`,
  alternates: { canonical: "/contato" },
};

export default function PaginaContato() {
  return (
    <>
      <HeroPagina
        rotulo="Contato"
        titulo="Vamos falar sobre o seu projeto"
        descricao={`Atendemos ${empresa.regiao}. Descreva o serviço e a equipe retorna com a avaliação e o orçamento.`}
        imagem="/img/obra-4.jpg"
        alt="Técnico da Engetec trabalhando em painel elétrico"
        posicao="60% 30%"
        acoes={
          <BotaoLink href={linkWhatsapp()} externo tamanho="lg">
            <Whatsapp className="h-5 w-5" />
            Chamar no WhatsApp
          </BotaoLink>
        }
      />

      <section className="bg-[var(--papel)] py-20 md:py-28">
        <div className="envoltorio">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <Revelar>
                <p className="rotulo text-[var(--texto-suave)]">Canais diretos</p>
                <h2 className="titulo-secao mt-6 max-w-[16ch]">
                  Escolha como prefere falar com a gente
                </h2>
              </Revelar>

              <div className="mt-10">
                <CanaisContato />
              </div>

              <Revelar atraso={140} className="mt-8">
                <Mapa className="h-[22rem]" />
              </Revelar>
            </div>

            <div className="lg:col-span-5">
              <Revelar
                tipo="escala"
                className="rounded-[var(--raio)] border border-[var(--linha-clara)] bg-white p-6 md:p-8"
              >
                <h2 className="text-[1.5rem] font-bold tracking-[-0.03em]">
                  Solicitar orçamento
                </h2>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-[var(--texto-suave)]">
                  Preencha os campos e a mensagem abre pronta no WhatsApp.
                </p>

                <div className="mt-7">
                  <Formulario />
                </div>
              </Revelar>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
