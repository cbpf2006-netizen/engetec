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
    sufixo: "",
    rotulo: "anos de atuação",
    nota: "no mercado de instalações elétricas",
  },
  {
    valor: 4,
    rotulo: "frentes de serviço",
    nota: "prediais, painéis, solar e redes",
  },
];

export function Numeros() {
  return (
    <section
      className="secao-escura relative overflow-hidden bg-[var(--engetec-vermelho)] text-white"
      aria-label="Números da Engetec"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 46px)",
        }}
        aria-hidden="true"
      />

      <div className="envoltorio relative">
        <dl className="grid grid-cols-1 divide-y divide-white/20 md:grid-cols-3 md:divide-x md:divide-y-0">
          {indicadores.map((indicador, indice) => (
            <Revelar
              key={indicador.rotulo}
              atraso={indice * 110}
              className="py-10 md:py-14 md:[&:not(:first-child)]:pl-10"
            >
              <dt className="sr-only">{indicador.rotulo}</dt>
              <dd>
                <Contador
                  valor={indicador.valor}
                  prefixo={indicador.prefixo}
                  sufixo={indicador.sufixo}
                  className="block text-[3.25rem] font-extrabold leading-none tracking-[-0.045em] md:text-[4.25rem]"
                />
                <span className="mt-4 block text-lg font-semibold tracking-[-0.02em]">
                  {indicador.rotulo}
                </span>
                <span className="mt-1.5 block font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-white/75">
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
