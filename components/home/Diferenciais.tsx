import { diferenciais } from "@/lib/empresa";
import { Revelar } from "@/components/ui/Revelar";
import { IconeDiferencial } from "@/components/ui/Icones";

export function Diferenciais() {
  return (
    <section className="secao-escura bg-[var(--tinta)] py-20 text-white md:py-28">
      <div className="envoltorio">
        <Revelar className="max-w-[36rem]">
          <p className="rotulo rotulo-amarelo text-[var(--texto-inverso-suave)]">
            Por que a Engetec
          </p>
          <h2 className="titulo-secao mt-6 text-white">
            Seis motivos para confiar o serviço à equipe
          </h2>
        </Revelar>

        <ul className="mt-14 grid gap-px bg-[var(--linha-escura-fraca)] sm:grid-cols-2 lg:grid-cols-3">
          {diferenciais.map((item, indice) => (
            <Revelar
              como="li"
              key={item.titulo}
              atraso={indice * 70}
              className="group bg-[var(--tinta)] p-7 transition-colors duration-[280ms] ease-[var(--saida)] hover:bg-[var(--tinta-2)] md:p-9"
            >
              <IconeDiferencial
                nome={item.icone}
                className="h-7 w-7 text-[var(--engetec-amarelo)] transition-transform duration-[320ms] ease-[var(--saida)] group-hover:-translate-y-0.5"
              />
              <h3 className="mt-6 text-[1.125rem] font-bold tracking-[-0.02em] text-white">
                {item.titulo}
              </h3>
              <span
                className="mt-3 block h-[2px] w-8 origin-left bg-[var(--engetec-vermelho)] transition-transform duration-[320ms] ease-[var(--saida)] group-hover:scale-x-[2.2]"
                aria-hidden="true"
              />
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-[var(--texto-inverso-suave)]">
                {item.texto}
              </p>
            </Revelar>
          ))}
        </ul>
      </div>
    </section>
  );
}
