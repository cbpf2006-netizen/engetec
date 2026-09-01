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
    <section className="secao-escura relative overflow-hidden bg-[var(--tinta)] text-white">
      <div className="malha absolute inset-0" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -left-48 top-8 h-[34rem] w-[34rem] rounded-full opacity-[0.1] blur-[130px]"
        style={{ background: "var(--engetec-vermelho)" }}
        aria-hidden="true"
      />

      <div className="envoltorio relative">
        <div className="grid items-center gap-12 pb-16 pt-32 sm:pt-36 lg:grid-cols-12 lg:gap-14 lg:pb-24 lg:pt-40">
          <div className="entrada-hero lg:col-span-7">
            <p
              className="rotulo text-[var(--texto-inverso-suave)]"
              style={{ animationDelay: "60ms" }}
            >
              Instalações elétricas / {empresa.cidade} · {empresa.estado}
            </p>

            <h1
              className="titulo-hero mt-7 max-w-[17ch] text-white"
              style={{ animationDelay: "140ms" }}
            >
              Instalação elétrica feita com norma, não com improviso.
            </h1>

            <p
              className="corpo mt-7 max-w-[52ch] text-[var(--texto-inverso-suave)]"
              style={{ animationDelay: "220ms" }}
            >
              Projetos residenciais e comerciais em {empresa.regiao}. Mais de{" "}
              {empresa.clientes} clientes atendidos em {empresa.anosAtuacao} anos
              de atuação.
            </p>

            <div
              className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
              style={{ animationDelay: "300ms" }}
            >
              <BotaoLink
                href={linkWhatsapp()}
                externo
                tamanho="lg"
                variante="primario"
              >
                <Whatsapp className="h-5 w-5" />
                Solicitar orçamento
              </BotaoLink>

              <BotaoLink href="/servicos" tamanho="lg" variante="contorno-claro">
                Ver serviços
                <Seta className="h-[18px] w-[18px] transition-transform duration-[220ms] ease-[var(--saida)] group-hover:translate-x-1" />
              </BotaoLink>
            </div>
          </div>

          <div
            className="cantos relative lg:col-span-5"
            style={{ animation: "escala-suave 900ms var(--saida) 200ms backwards" }}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--grafite)] sm:aspect-[16/10] lg:aspect-[4/5]">
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
                    "linear-gradient(200deg, rgba(16,17,20,0) 45%, rgba(16,17,20,0.55) 100%)",
                }}
                aria-hidden="true"
              />
            </div>
            <span
              className="absolute -left-px bottom-0 top-0 w-[3px] bg-[var(--engetec-vermelho)]"
              aria-hidden="true"
            />
          </div>
        </div>

        <dl className="grid grid-cols-1 border-t border-[var(--linha-escura-fraca)] sm:grid-cols-3">
          {fatos.map((fato, indice) => (
            <div
              key={fato.rotulo}
              className="border-b border-[var(--linha-escura-fraca)] py-6 sm:border-b-0 sm:py-8 sm:[&:not(:first-child)]:border-l sm:[&:not(:first-child)]:border-l-[var(--linha-escura-fraca)] sm:[&:not(:first-child)]:pl-8"
              style={{
                animation: `surgir 640ms var(--saida) ${420 + indice * 90}ms backwards`,
              }}
            >
              <dt className="sr-only">{fato.rotulo}</dt>
              <dd>
                <span className="block text-2xl font-bold tracking-[-0.03em] text-[var(--engetec-amarelo)] sm:text-[1.75rem]">
                  {fato.valor}
                </span>
                <span className="mt-1 block font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[var(--texto-inverso-suave)]">
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
