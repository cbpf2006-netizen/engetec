import { empresa, linkWhatsapp } from "@/lib/empresa";
import { Revelar } from "@/components/ui/Revelar";
import {
  Envelope,
  Instagram,
  Pino,
  SetaCanto,
  Telefone,
  Whatsapp,
} from "@/components/ui/Icones";

const canais = [
  {
    icone: Whatsapp,
    rotulo: "WhatsApp",
    valor: empresa.telefone,
    detalhe: "Canal mais rápido para orçamento",
    href: linkWhatsapp(),
    externo: true,
    destaque: true,
  },
  {
    icone: Telefone,
    rotulo: "Telefone",
    valor: empresa.telefone,
    detalhe: "Ligue e fale com a equipe",
    href: `tel:${empresa.telefoneLink}`,
    externo: false,
    destaque: false,
  },
  {
    icone: Envelope,
    rotulo: "E-mail",
    valor: empresa.email,
    detalhe: "Para propostas e documentos",
    href: `mailto:${empresa.email}`,
    externo: false,
    destaque: false,
    compacto: true,
  },
  {
    icone: Instagram,
    rotulo: "Instagram",
    valor: empresa.instagramHandle,
    detalhe: "Acompanhe os trabalhos",
    href: empresa.instagram,
    externo: true,
    destaque: false,
  },
];

export function CanaisContato() {
  return (
    <ul className="grid gap-px overflow-hidden rounded-[var(--raio)] border border-[var(--linha-clara)] bg-[var(--linha-clara)] sm:grid-cols-2">
      {canais.map((canal, indice) => {
        const Icone = canal.icone;
        return (
          <Revelar
            como="li"
            key={canal.rotulo}
            atraso={indice * 70}
            className="bg-white"
          >
            <a
              href={canal.href}
              target={canal.externo ? "_blank" : undefined}
              rel={canal.externo ? "noopener noreferrer" : undefined}
              className="group flex h-full items-start gap-4 p-6 transition-colors duration-[240ms] ease-[var(--saida)] hover:bg-[var(--papel-2)]"
            >
              <span
                className="mt-0.5 flex h-10 w-10 flex-none items-center justify-center rounded-[var(--raio-sm)] transition-colors duration-[240ms]"
                style={{
                  backgroundColor: canal.destaque
                    ? "var(--engetec-vermelho)"
                    : "var(--papel-2)",
                  color: canal.destaque ? "#ffffff" : "var(--texto-forte)",
                }}
              >
                <Icone className="h-5 w-5" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[var(--texto-suave)]">
                  {canal.rotulo}
                </span>
                <span
                  className={`mt-1.5 block font-semibold tracking-[-0.02em] [overflow-wrap:anywhere] ${
                    "compacto" in canal && canal.compacto
                      ? "text-[0.9375rem]"
                      : "text-[1.0625rem]"
                  }`}
                >
                  {canal.valor}
                </span>
                <span className="mt-1 block text-sm text-[var(--texto-suave)]">
                  {canal.detalhe}
                </span>
              </span>

              <SetaCanto
                className="mt-1 h-5 w-5 flex-none text-[var(--texto-suave)] transition-[color,transform] duration-[220ms] ease-[var(--saida)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--engetec-vermelho)]"
                aria-hidden="true"
              />
            </a>
          </Revelar>
        );
      })}

      <Revelar como="li" atraso={280} className="bg-white sm:col-span-2">
        <div className="flex items-start gap-4 p-6">
          <span className="mt-0.5 flex h-10 w-10 flex-none items-center justify-center rounded-[var(--raio-sm)] bg-[var(--papel-2)]">
            <Pino className="h-5 w-5" />
          </span>
          <div>
            <span className="block font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[var(--texto-suave)]">
              Endereço
            </span>
            <address className="mt-1.5 not-italic text-[1.0625rem] font-semibold leading-snug tracking-[-0.02em]">
              {empresa.endereco.logradouro}
              <br />
              {empresa.endereco.bairro}, {empresa.endereco.cidade} /{" "}
              {empresa.endereco.estado}
            </address>
          </div>
        </div>
      </Revelar>
    </ul>
  );
}
