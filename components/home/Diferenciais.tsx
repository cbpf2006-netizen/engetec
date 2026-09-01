import { diferenciais } from "@/lib/empresa";
import { Revelar } from "@/components/ui/Revelar";
import { IconeDiferencial } from "@/components/ui/Icones";

/** Grade hairline: agrupa sem elevar e sem borda por célula. */
export function Diferenciais() {
  return (
    <section className="bg-[var(--color-background-deep)] py-16 md:py-20 lg:py-[120px]">
      <div className="envoltorio">
        <Revelar>
          <p className="rotulo">Por que a Engetec</p>
          <h2 className="titulo-secao mt-6">
            Seis motivos para confiar o serviço à equipe
          </h2>
        </Revelar>

        <ul className="grade-hairline mt-14 [--celula:var(--color-background-deep)] sm:grid-cols-2 lg:grid-cols-3">
          {diferenciais.map((item, indice) => (
            <Revelar
              como="li"
              key={item.titulo}
              atraso={indice * 70}
              className="group p-9 transition-colors duration-[var(--duration-medium)] ease-[var(--ease-out)] hover:bg-[var(--color-surface)]"
            >
              <IconeDiferencial
                nome={item.icone}
                className="h-7 w-7 text-[var(--color-secondary)] transition-transform duration-[var(--duration-medium)] ease-[var(--ease-out)] group-hover:-translate-y-0.5"
              />
              <h3 className="mt-8 text-[length:var(--text-subheading)] font-medium tracking-[var(--tracking-subheading)] text-[var(--color-text-primary)]">
                {item.titulo}
              </h3>
              <span
                className="mt-4 block h-[2px] w-8 origin-left bg-[var(--color-primary)] transition-transform duration-[var(--duration-medium)] ease-[var(--ease-out)] group-hover:scale-x-[2.2]"
                aria-hidden="true"
              />
              <p className="corpo mt-5 text-[length:var(--text-ui)]">{item.texto}</p>
            </Revelar>
          ))}
        </ul>
      </div>
    </section>
  );
}
