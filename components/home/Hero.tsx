import Image from "next/image";

import { empresa, linkWhatsapp } from "@/lib/empresa";
import { BotaoLink } from "@/components/ui/Botao";
import { Seta, Whatsapp } from "@/components/ui/Icones";

const fatos = [
  { valor: "+100", rotulo: "clientes atendidos" },
  { valor: "5 anos", rotulo: "de atuação" },
  { valor: "Residencial e comercial", rotulo: "projetos executados" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-background)]">
      <div className="malha absolute inset-0" aria-hidden="true" />

      <div className="envoltorio relative">
        <div className="grid items-center gap-12 pb-20 pt-[136px] lg:grid-cols-12 lg:gap-10 lg:pb-[120px] lg:pt-[176px]">
          <div className="entrada-hero lg:col-span-7">
            <p className="rotulo" style={{ animationDelay: "60ms" }}>
              Instalações elétricas / {empresa.cidade} · {empresa.estado}
            </p>

            <h1 className="titulo-hero mt-6" style={{ animationDelay: "140ms" }}>
              Instalação elétrica feita com norma, não com improviso.
            </h1>

            <p className="corpo mt-7" style={{ animationDelay: "220ms" }}>
              Projetos residenciais e comerciais em {empresa.regiao}. Mais de{" "}
              {empresa.clientes} clientes atendidos em {empresa.anosAtuacao} anos
              de atuação.
            </p>

            <div
              className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
              style={{ animationDelay: "300ms" }}
            >
              <BotaoLink href={linkWhatsapp()} externo tamanho="lg">
                <Whatsapp className="h-5 w-5" />
                Solicitar orçamento
              </BotaoLink>

              <BotaoLink href="/servicos" tamanho="lg" variante="secundario">
                Ver serviços
                <Seta className="h-[18px] w-[18px] transition-transform duration-[var(--duration-medium)] ease-[var(--ease-out)] group-hover:translate-x-1" />
              </BotaoLink>
            </div>
          </div>

          <div
            className="cantos relative lg:col-span-5"
            style={{ animation: "escala-suave 900ms var(--ease-out) 200ms backwards" }}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-surface)] sm:aspect-[16/10] lg:aspect-[4/5]">
              <Image
                src="/img/obra-3.jpg"
                alt="Equipe da Engetec instalando um poste de energia elétrica"
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover object-[52%_38%]"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(200deg, rgba(16,13,12,0) 48%, rgba(16,13,12,0.55) 100%)",
                }}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-1 border-t border-[var(--color-border-hairline)] sm:grid-cols-3">
          {fatos.map((fato, indice) => (
            <div
              key={fato.rotulo}
              className="border-b border-[var(--color-border-hairline)] py-7 sm:border-b-0 sm:py-9 sm:[&:not(:first-child)]:border-l sm:[&:not(:first-child)]:border-l-[var(--color-border-hairline)] sm:[&:not(:first-child)]:pl-8"
              style={{
                animation: `surgir 640ms var(--ease-out) ${420 + indice * 90}ms backwards`,
              }}
            >
              <dt className="sr-only">{fato.rotulo}</dt>
              <dd>
                <span className="block text-[length:var(--text-subheading)] font-medium leading-none tracking-[var(--tracking-subheading)] text-[var(--color-text-primary)]">
                  {fato.valor}
                </span>
                <span className="estatistica-rotulo mt-2 block">
                  {fato.rotulo}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
