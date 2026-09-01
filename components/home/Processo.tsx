import { processo } from "@/lib/empresa";
import { Revelar } from "@/components/ui/Revelar";

export function Processo() {
  return (
    <section className="bg-[var(--papel)] py-20 md:py-28">
      <div className="envoltorio">
        <Revelar className="max-w-[36rem]">
          <p className="rotulo text-[var(--texto-suave)]">Como funciona</p>
          <h2 className="titulo-secao mt-6">Do primeiro contato à execução</h2>
        </Revelar>

        <div className="relative mt-14">
          {/* A trilha vai do centro do primeiro número ao centro do último:
              3 colunas de largura + 3 gaps (2rem) * 0.75 + meio círculo. */}
          <span
            className="absolute left-0 top-[1.375rem] hidden h-px w-[calc(75%+2.875rem)] bg-[var(--linha-clara)] lg:block"
            aria-hidden="true"
          />
          <Revelar
            tipo="traco"
            className="absolute left-0 top-[1.375rem] hidden h-[2px] w-[calc(75%+2.875rem)] bg-[var(--engetec-vermelho)] lg:block"
          >
            <span className="sr-only" />
          </Revelar>

          <ol className="grid gap-10 lg:grid-cols-4 lg:gap-8">
            {processo.map((etapa, indice) => (
              <Revelar
                como="li"
                key={etapa.numero}
                atraso={indice * 110}
                className="relative lg:pr-6"
              >
                <div className="flex items-center gap-4 lg:block">
                  <span className="relative z-10 flex h-11 w-11 flex-none items-center justify-center rounded-full bg-[var(--tinta)] font-mono text-[0.8125rem] font-medium text-[var(--engetec-amarelo)]">
                    {etapa.numero}
                  </span>
                  <h3 className="text-[1.125rem] font-bold tracking-[-0.02em] lg:mt-6">
                    {etapa.titulo}
                  </h3>
                </div>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--texto-suave)]">
                  {etapa.texto}
                </p>
              </Revelar>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
