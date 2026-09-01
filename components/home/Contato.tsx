import { empresa } from "@/lib/empresa";
import { CanaisContato } from "@/components/contato/CanaisContato";
import { Mapa } from "@/components/contato/Mapa";
import { Revelar } from "@/components/ui/Revelar";

export function Contato() {
  return (
    <section
      id="contato"
      className="scroll-mt-24 bg-[var(--color-background-deep)] py-16 md:py-20 lg:py-[120px]"
    >
      <div className="envoltorio">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Revelar>
              <p className="rotulo">Contato</p>
              <h2 className="titulo-secao mt-6">Fale com a {empresa.nome}</h2>
              <p className="corpo mt-6">
                Atendemos {empresa.regiao}. Escolha o canal que preferir, o
                WhatsApp costuma ser o mais rápido.
              </p>
            </Revelar>

            <Revelar atraso={120} className="mt-10">
              <Mapa className="h-[18rem]" />
            </Revelar>
          </div>

          <div className="lg:col-span-7">
            <CanaisContato celula="var(--color-background-deep)" />
          </div>
        </div>
      </div>
    </section>
  );
}
