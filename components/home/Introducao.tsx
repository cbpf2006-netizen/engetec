import { empresa } from "@/lib/empresa";
import { Revelar } from "@/components/ui/Revelar";
import { Raio } from "@/components/ui/Icones";

export function Introducao() {
  return (
    <section className="bg-[var(--color-background-deep)] py-16 md:py-20 lg:py-[120px]">
      <div className="envoltorio">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <Revelar className="lg:col-span-6">
            <p className="rotulo">Quem atende você</p>
            <h2 className="titulo-secao mt-6">
              Uma empresa de instalações elétricas, não um serviço improvisado.
            </h2>
          </Revelar>

          <Revelar
            atraso={120}
            className="flex flex-col justify-end gap-7 lg:col-span-6"
          >
            <p className="corpo">
              A {empresa.nome} é especializada em instalações elétricas, com
              compromisso firme com qualidade, segurança e inovação. Fundada há{" "}
              {empresa.anosAtuacao} anos, atende projetos residenciais e
              comerciais em {empresa.regiao}.
            </p>
            <p className="corpo">
              Cada serviço é dimensionado para a necessidade real do cliente, com
              equipe capacitada e materiais de qualidade, do primeiro contato à
              entrega.
            </p>

            <div className="flex items-center gap-3 border-t border-[var(--color-border)] pt-7">
              <Raio className="h-5 w-5 flex-none text-[var(--color-primary-light)]" />
              <p className="font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[var(--tracking-label)] text-[var(--color-text-emphasis)]">
                {empresa.tagline}
              </p>
            </div>
          </Revelar>
        </div>
      </div>
    </section>
  );
}
