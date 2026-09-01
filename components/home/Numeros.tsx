import { empresa } from "@/lib/empresa";
import { Contador } from "@/components/ui/Contador";
import { Revelar } from "@/components/ui/Revelar";

const indicadores = [
  {
    valor: empresa.clientes,
    prefixo: "+",
    rotulo: "clientes atendidos",
    nota: "em projetos e instalações",
  },
  {
    valor: empresa.anosAtuacao,
    rotulo: "anos de atuação",
    nota: "no mercado de instalações elétricas",
  },
  {
    valor: 4,
    rotulo: "frentes de serviço",
    nota: "prediais, painéis, solar e redes",
  },
];

/**
 * Statistic Counter: único lugar do sistema onde o amarelo aparece em escala.
 * Três colunas divididas por hairline, contagem ao entrar na viewport.
 */
export function Numeros({
  superficie = "profunda",
}: {
  superficie?: "base" | "profunda";
}) {
  return (
    <section
      className="py-16 md:py-20 lg:py-[120px]"
      style={{
        backgroundColor:
          superficie === "profunda"
            ? "var(--color-background-deep)"
            : "var(--color-background)",
      }}
      aria-label="Números da Engetec"
    >
      <div className="envoltorio">
        <dl className="grid grid-cols-1 divide-y divide-[var(--color-border)] md:grid-cols-3 md:divide-x md:divide-y-0">
          {indicadores.map((indicador, indice) => (
            <Revelar
              key={indicador.rotulo}
              atraso={indice * 110}
              className="py-10 md:py-0 md:[&:not(:first-child)]:pl-10"
            >
              <dt className="sr-only">{indicador.rotulo}</dt>
              <dd>
                <Contador
                  valor={indicador.valor}
                  prefixo={indicador.prefixo}
                  className="estatistica block"
                />
                <span className="mt-5 block text-[length:var(--text-subheading)] font-medium tracking-[var(--tracking-subheading)] text-[var(--color-text-primary)]">
                  {indicador.rotulo}
                </span>
                <span className="estatistica-rotulo mt-2 block">
                  {indicador.nota}
                </span>
              </dd>
            </Revelar>
          ))}
        </dl>
      </div>
    </section>
  );
}
