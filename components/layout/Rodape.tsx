import Image from "next/image";
import Link from "next/link";

import { empresa, linkWhatsapp, navegacao, servicos } from "@/lib/empresa";
import {
  Envelope,
  Instagram,
  Pino,
  Telefone,
  Whatsapp,
} from "@/components/ui/Icones";

/** Poço recuado: superfície mais profunda da interface, padding vertical 120px. */
export function Rodape() {
  const ano = new Date().getFullYear();

  return (
    <footer className="bg-[var(--color-background-deep)]">
      <div className="envoltorio">
        <div className="grid gap-12 border-b border-[var(--color-border-hairline)] py-20 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-10 lg:py-[120px]">
          <div>
            <Image
              src="/img/logo.jpg"
              alt={`${empresa.nome} ${empresa.tagline}`}
              width={990}
              height={285}
              className="h-11 w-auto rounded-[var(--radius-small)]"
            />
            <p className="mt-7 max-w-[38ch] text-[length:var(--text-body)] leading-[var(--leading-body)] text-[var(--color-text-secondary)]">
              Instalações elétricas residenciais e comerciais em {empresa.cidade} e
              região, com foco em qualidade, segurança e inovação.
            </p>
            <a
              href={empresa.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2.5 text-[length:var(--text-ui)] text-[var(--color-text-secondary)] transition-colors duration-200 hover:text-[var(--color-secondary)]"
            >
              <Instagram className="h-5 w-5" />
              {empresa.instagramHandle}
            </a>
          </div>

          <nav aria-label="Páginas">
            <h2 className="font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[var(--tracking-label)] text-[var(--color-text-primary)]">
              Navegação
            </h2>
            <ul className="mt-6 space-y-3">
              {navegacao.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[length:var(--text-ui)] text-[var(--color-text-secondary)] transition-colors duration-200 hover:text-[var(--color-secondary)]"
                  >
                    {item.rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Serviços">
            <h2 className="font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[var(--tracking-label)] text-[var(--color-text-primary)]">
              Serviços
            </h2>
            <ul className="mt-6 space-y-3">
              {servicos.map((servico) => (
                <li key={servico.id}>
                  <Link
                    href={`/servicos#${servico.id}`}
                    className="text-[length:var(--text-ui)] leading-snug text-[var(--color-text-secondary)] transition-colors duration-200 hover:text-[var(--color-secondary)]"
                  >
                    {servico.nome}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[var(--tracking-label)] text-[var(--color-text-primary)]">
              Contato
            </h2>
            <ul className="mt-6 space-y-4 text-[length:var(--text-ui)] text-[var(--color-text-secondary)]">
              <li>
                <a
                  href={linkWhatsapp()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 transition-colors duration-200 hover:text-[var(--color-secondary)]"
                >
                  <Whatsapp className="mt-0.5 h-[18px] w-[18px] flex-none" />
                  WhatsApp {empresa.telefone}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${empresa.telefoneLink}`}
                  className="flex items-start gap-3 transition-colors duration-200 hover:text-[var(--color-secondary)]"
                >
                  <Telefone className="mt-0.5 h-[18px] w-[18px] flex-none" />
                  {empresa.telefone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${empresa.email}`}
                  className="flex items-start gap-3 transition-colors duration-200 hover:text-[var(--color-secondary)] [overflow-wrap:anywhere]"
                >
                  <Envelope className="mt-0.5 h-[18px] w-[18px] flex-none" />
                  {empresa.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Pino className="mt-0.5 h-[18px] w-[18px] flex-none" />
                <address className="not-italic leading-relaxed">
                  {empresa.endereco.logradouro}
                  <br />
                  {empresa.endereco.bairro}, {empresa.endereco.cidade} /{" "}
                  {empresa.endereco.estado}
                </address>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 py-8 text-[length:var(--text-ui)] text-[var(--color-text-secondary)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {ano} {empresa.nome}. Todos os direitos reservados.
          </p>
          <p className="font-mono uppercase tracking-[var(--tracking-meta)]">
            {empresa.cidade} / {empresa.estado}
          </p>
        </div>
      </div>
    </footer>
  );
}
