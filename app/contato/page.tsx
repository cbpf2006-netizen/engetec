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

      <section className="bg-[var(--color-background-deep)] py-16 md:py-20 lg:py-[120px]">
        <div className="envoltorio">
          <Revelar className="max-w-[36rem]">
            <p className="rotulo">Canais diretos</p>
            <h2 className="titulo-secao mt-6">
              Escolha como prefere falar com a gente
            </h2>
          </Revelar>

          <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <CanaisContato celula="var(--color-background-deep)" />
            </div>
            <Revelar atraso={140} className="lg:col-span-5">
              <Mapa className="h-full min-h-[22rem]" />
            </Revelar>
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-background)] py-16 md:py-20 lg:py-[120px]">
        <div className="envoltorio">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Revelar className="lg:col-span-5">
              <p className="rotulo">Orçamento</p>
              <h2 className="titulo-secao mt-6">
                Descreva o serviço e receba o orçamento
              </h2>
              <p className="corpo mt-6">
                Preencha os campos e a mensagem abre pronta no WhatsApp, com tudo
                que a equipe precisa saber para avaliar.
              </p>
            </Revelar>

            <Revelar
              tipo="escala"
              atraso={120}
              className="rounded-[var(--radius-card)] bg-[var(--color-surface)] p-7 md:p-12 lg:col-span-7"
            >
              <Formulario />
            </Revelar>
          </div>
        </div>
      </section>
    </>
  );
}
