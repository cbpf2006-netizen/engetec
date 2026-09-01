import { empresa, linkWhatsapp } from "@/lib/empresa";
import { Revelar } from "@/components/ui/Revelar";
import { BotaoSeta } from "@/components/ui/Botao";
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
    compacto: false,
  },
  {
    icone: Telefone,
    rotulo: "Telefone",
    valor: empresa.telefone,
    detalhe: "Ligue e fale com a equipe",
    href: `tel:${empresa.telefoneLink}`,
    externo: false,
    destaque: false,
    compacto: false,
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
    compacto: false,
  },
];

/**
 * Grade hairline de canais. `celula` informa a superfície da seção que
 * hospeda o componente, para que as células não virem cards por engano.
 */
export function CanaisContato({
  celula = "var(--color-background)",
}: {
  celula?: string;
}) {
  return (
    <ul
      className="grade-hairline sm:grid-cols-2"
      style={{ "--celula": celula } as React.CSSProperties}
    >
      {canais.map((canal, indice) => {
        const Icone = canal.icone;
        return (
          <Revelar como="li" key={canal.rotulo} atraso={indice * 70}>
            <a
              href={canal.href}
              target={canal.externo ? "_blank" : undefined}
              rel={canal.externo ? "noopener noreferrer" : undefined}
              className="group flex h-full items-start gap-5 p-7 transition-colors duration-[var(--duration-medium)] ease-[var(--ease-out)] hover:bg-[var(--color-surface)]"
            >
              <span
                className="mt-0.5 flex h-10 w-10 flex-none items-center justify-center rounded-[var(--radius-small)] transition-colors duration-[var(--duration-medium)]"
                style={{
                  backgroundColor: canal.destaque
                    ? "var(--color-primary)"
                    : "rgba(255,255,255,0.06)",
                  color: "var(--color-text-primary)",
                }}
              >
                <Icone className="h-5 w-5" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[var(--tracking-label)] text-[var(--color-text-secondary)]">
                  {canal.rotulo}
                </span>
                <span
                  className={`mt-2 block font-medium text-[var(--color-text-primary)] [overflow-wrap:anywhere] ${
                    canal.compacto
                      ? "text-[length:var(--text-ui)]"
                      : "text-[length:var(--text-subheading)] tracking-[var(--tracking-subheading)]"
                  }`}
                >
                  {canal.valor}
                </span>
                <span className="mt-2 block text-[length:var(--text-ui)] text-[var(--color-text-secondary)]">
                  {canal.detalhe}
                </span>
              </span>

              <BotaoSeta className="mt-1">
                <SetaCanto className="h-4 w-4" />
              </BotaoSeta>
            </a>
          </Revelar>
        );
      })}

      <Revelar como="li" atraso={280} className="sm:col-span-2">
        <div className="flex items-start gap-5 p-7">
          <span className="mt-0.5 flex h-10 w-10 flex-none items-center justify-center rounded-[var(--radius-small)] bg-[rgba(255,255,255,0.06)] text-[var(--color-text-primary)]">
            <Pino className="h-5 w-5" />
          </span>
          <div>
            <span className="block font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[var(--tracking-label)] text-[var(--color-text-secondary)]">
              Endereço
            </span>
            <address className="mt-2 not-italic text-[length:var(--text-subheading)] font-medium leading-snug tracking-[var(--tracking-subheading)] text-[var(--color-text-primary)]">
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
