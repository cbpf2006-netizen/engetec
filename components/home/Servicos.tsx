import Image from "next/image";
import Link from "next/link";

import { servicos } from "@/lib/empresa";
import { Revelar } from "@/components/ui/Revelar";
import { IconeServico, Seta, SetaCanto } from "@/components/ui/Icones";

export function Servicos() {
  const [destaque, ...demais] = servicos;

  return (
    <section
      id="servicos"
      className="malha-clara scroll-mt-24 bg-[var(--papel-2)] py-20 md:py-28"
    >
      <div className="envoltorio">
        <Revelar className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="rotulo text-[var(--texto-suave)]">O que executamos</p>
            <h2 className="titulo-secao mt-6 max-w-[16ch]">
              Serviços elétricos do projeto à entrega
            </h2>
          </div>
          <Link
            href="/servicos"
            className="group inline-flex items-center gap-2.5 self-start border-b border-[var(--linha-clara)] pb-2 text-[0.9375rem] font-semibold transition-colors duration-200 hover:border-[var(--engetec-vermelho)] hover:text-[var(--engetec-vermelho)] md:self-auto"
          >
            Ver todos os serviços
            <Seta className="h-[18px] w-[18px] transition-transform duration-[220ms] ease-[var(--saida)] group-hover:translate-x-1" />
          </Link>
        </Revelar>

        <div className="mt-12 grid gap-5 lg:grid-cols-12 lg:gap-6">
          <Revelar tipo="escala" className="lg:col-span-7">
            <Link
              href={`/servicos#${destaque.id}`}
              className="group relative block h-full min-h-[22rem] overflow-hidden rounded-[var(--raio)] bg-[var(--tinta)] lg:min-h-[32rem]"
            >
              <Image
                src={destaque.imagem}
                alt={destaque.alt}
                fill
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover object-center transition-transform duration-[700ms] ease-[var(--saida)] group-hover:scale-[1.04]"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(16,17,20,0.92) 0%, rgba(16,17,20,0.62) 38%, rgba(16,17,20,0.12) 72%)",
                }}
                aria-hidden="true"
              />

              <div className="relative flex h-full flex-col justify-end p-6 text-white md:p-9">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[0.6875rem] tracking-[0.2em] text-[var(--engetec-amarelo)]">
                    {destaque.numero}
                  </span>
                  <span className="h-px w-8 bg-[var(--engetec-amarelo)]" />
                  <IconeServico
                    nome={destaque.id}
                    className="h-5 w-5 text-[var(--engetec-amarelo)]"
                  />
                </div>

                <h3 className="mt-4 max-w-[16ch] text-[1.625rem] font-bold leading-[1.1] tracking-[-0.03em] md:text-[2rem]">
                  {destaque.nome}
                </h3>
                <p className="mt-3 max-w-[46ch] text-[0.9375rem] leading-relaxed text-[var(--texto-inverso-suave)]">
                  {destaque.resumo}
                </p>

                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white">
                  Ver detalhes
                  <SetaCanto className="h-[18px] w-[18px] transition-transform duration-[220ms] ease-[var(--saida)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </Link>
          </Revelar>

          <ul className="flex flex-col gap-5 lg:col-span-5 lg:gap-6">
            {demais.map((servico, indice) => (
              <Revelar
                como="li"
                key={servico.id}
                atraso={100 + indice * 90}
                className="flex-1"
              >
                <Link
                  href={`/servicos#${servico.id}`}
                  className="group flex h-full items-stretch gap-4 overflow-hidden rounded-[var(--raio)] border border-[var(--linha-clara)] bg-white transition-[border-color,transform] duration-[260ms] ease-[var(--saida)] hover:border-[var(--engetec-vermelho)] sm:gap-5"
                >
                  <div className="relative w-24 flex-none overflow-hidden sm:w-32">
                    <Image
                      src={servico.imagem}
                      alt={servico.alt}
                      fill
                      sizes="128px"
                      className="object-cover transition-transform duration-[700ms] ease-[var(--saida)] group-hover:scale-[1.07]"
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-center py-5 pr-5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[0.6875rem] tracking-[0.2em] text-[var(--engetec-vermelho)]">
                        {servico.numero}
                      </span>
                      <IconeServico
                        nome={servico.id}
                        className="h-[18px] w-[18px] text-[var(--texto-suave)] transition-colors duration-200 group-hover:text-[var(--engetec-vermelho)]"
                      />
                    </div>

                    <h3 className="mt-2 text-[1.0625rem] font-bold leading-tight tracking-[-0.02em]">
                      {servico.nome}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[var(--texto-suave)]">
                      {servico.resumo}
                    </p>
                  </div>

                  <span
                    className="mr-5 hidden shrink-0 items-center self-center text-[var(--texto-suave)] transition-[color,transform] duration-[220ms] ease-[var(--saida)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--engetec-vermelho)] sm:flex"
                    aria-hidden="true"
                  >
                    <SetaCanto className="h-5 w-5" />
                  </span>
                </Link>
              </Revelar>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
