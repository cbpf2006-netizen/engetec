import { processo } from "@/lib/empresa";
import { Revelar } from "@/components/ui/Revelar";

/**
 * O trilho horizontal é uma das ocorrências permitidas do gradiente assinatura:
 * fio de 2px que se desenha da esquerda para a direita ao entrar na viewport.
 */
export function Processo() {
  return (
    <section className="bg-[var(--color-background-deep)] py-16 md:py-20 lg:py-[120px]">
      <div className="envoltorio">
        <Revelar>
          <p className="rotulo">Como funciona</p>
          <h2 className="titulo-secao mt-6">Do primeiro contato à execução</h2>
        </Revelar>

        <div className="relative mt-14">
          <span
            className="absolute left-0 top-[22px] hidden h-px w-[calc(75%+2.875rem)] bg-[var(--color-border)] lg:block"
            aria-hidden="true"
          />
          <Revelar
            tipo="traco"
            className="absolute left-0 top-[22px] hidden h-[2px] w-[calc(75%+2.875rem)] bg-[image:var(--gradient-corrente)] lg:block"
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
                  <span className="relative z-10 flex h-11 w-11 flex-none items-center justify-center rounded-[var(--radius-small)] bg-[var(--color-surface)] font-mono text-[length:var(--text-meta)] font-medium tracking-[var(--tracking-meta)] text-[var(--color-secondary)]">
                    {etapa.numero}
                  </span>
                  <h3 className="text-[length:var(--text-subheading)] font-medium tracking-[var(--tracking-subheading)] text-[var(--color-text-primary)] lg:mt-7">
                    {etapa.titulo}
                  </h3>
                </div>
                <p className="corpo mt-4 text-[length:var(--text-ui)]">
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
