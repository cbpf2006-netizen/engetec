import { empresa } from "@/lib/empresa";
import { Revelar } from "@/components/ui/Revelar";
import { Raio } from "@/components/ui/Icones";

export function Introducao() {
  return (
    <section className="bg-[var(--papel)] py-20 md:py-28">
      <div className="envoltorio">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <Revelar className="lg:col-span-6">
            <p className="rotulo text-[var(--texto-suave)]">Quem atende você</p>
            <h2 className="titulo-secao mt-6 max-w-[18ch]">
              Uma empresa de instalações elétricas, não um serviço improvisado.
            </h2>
          </Revelar>

          <Revelar
            atraso={120}
            className="flex flex-col justify-end gap-6 lg:col-span-6"
          >
            <p className="corpo text-[var(--texto-suave)]">
              A {empresa.nome} é especializada em instalações elétricas, com
              compromisso firme com qualidade, segurança e inovação. Fundada há{" "}
              {empresa.anosAtuacao} anos, atende projetos residenciais e
              comerciais em {empresa.regiao}.
            </p>
            <p className="corpo text-[var(--texto-suave)]">
              Cada serviço é dimensionado para a necessidade real do cliente, com
              equipe capacitada e materiais de qualidade, do primeiro contato à
              entrega.
            </p>

            <div className="mt-2 flex items-center gap-3 border-t border-[var(--linha-clara)] pt-6">
              <Raio className="h-5 w-5 flex-none text-[var(--engetec-vermelho)]" />
              <p className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-[var(--texto-forte)]">
                {empresa.tagline}
              </p>
            </div>
          </Revelar>
        </div>
      </div>
    </section>
  );
}
