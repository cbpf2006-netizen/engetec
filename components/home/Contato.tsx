import { empresa } from "@/lib/empresa";
import { CanaisContato } from "@/components/contato/CanaisContato";
import { Mapa } from "@/components/contato/Mapa";
import { Revelar } from "@/components/ui/Revelar";

export function Contato() {
  return (
    <section
      id="contato"
      className="scroll-mt-24 bg-[var(--papel-2)] py-20 md:py-28"
    >
      <div className="envoltorio">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <Revelar>
              <p className="rotulo text-[var(--texto-suave)]">Contato</p>
              <h2 className="titulo-secao mt-6 max-w-[14ch]">
                Fale com a {empresa.nome}
              </h2>
              <p className="corpo mt-5 text-[var(--texto-suave)]">
                Atendemos {empresa.regiao}. Escolha o canal que preferir, o
                WhatsApp costuma ser o mais rápido.
              </p>
            </Revelar>

            <Revelar atraso={120} className="mt-9">
              <Mapa className="h-[18rem]" />
            </Revelar>
          </div>

          <div className="lg:col-span-7">
            <CanaisContato />
          </div>
        </div>
      </div>
    </section>
  );
}
