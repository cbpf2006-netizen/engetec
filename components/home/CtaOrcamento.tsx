import Image from "next/image";

import { empresa, linkWhatsapp } from "@/lib/empresa";
import { BotaoLink } from "@/components/ui/Botao";
import { Revelar } from "@/components/ui/Revelar";
import { Telefone, Whatsapp } from "@/components/ui/Icones";

/**
 * Seção de conversão. Carrega a regra de 3px com o gradiente assinatura, que é
 * permitida uma vez por página.
 */
export function CtaOrcamento() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-background)]">
      <span className="regra-corrente absolute inset-x-0 top-0" aria-hidden="true" />

      <Image
        src="/img/obra-4.jpg"
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="object-cover object-[62%_30%] opacity-25"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, rgba(23,20,19,0.96) 24%, rgba(23,20,19,0.74) 62%, rgba(23,20,19,0.55) 100%)",
        }}
        aria-hidden="true"
      />

      <div className="envoltorio relative py-16 md:py-20 lg:py-[120px]">
        <Revelar className="max-w-[46rem]">
          <p className="rotulo">Orçamento</p>
          <h2 className="titulo-secao mt-6">
            Seu projeto elétrico merece ser feito direito.
          </h2>
          <p className="corpo mt-7">
            Conte o que você precisa pelo WhatsApp. A equipe avalia o serviço e
            retorna com o orçamento.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <BotaoLink href={linkWhatsapp()} externo tamanho="lg">
              <Whatsapp className="h-5 w-5" />
              Solicitar orçamento pelo WhatsApp
            </BotaoLink>

            <BotaoLink
              href={`tel:${empresa.telefoneLink}`}
              tamanho="lg"
              variante="secundario"
            >
              <Telefone className="h-[18px] w-[18px]" />
              {empresa.telefone}
            </BotaoLink>
          </div>
        </Revelar>
      </div>
    </section>
  );
}
