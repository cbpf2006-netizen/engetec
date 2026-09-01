import Image from "next/image";
import Link from "next/link";

import {
  empresa,
  linkWhatsapp,
  navegacao,
  servicos,
} from "@/lib/empresa";
import { Envelope, Instagram, Pino, Telefone, Whatsapp } from "@/components/ui/Icones";

export function Rodape() {
  const ano = new Date().getFullYear();

  return (
    <footer className="secao-escura bg-[var(--tinta)] text-[var(--texto-inverso-suave)]">
      <div className="envoltorio">
        <div className="grid gap-12 border-b border-[var(--linha-escura-fraca)] py-16 md:grid-cols-2 md:py-20 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-10">
          <div>
            <Image
              src="/img/logo.jpg"
              alt={`${empresa.nome} ${empresa.tagline}`}
              width={990}
              height={285}
              className="h-11 w-auto rounded-[2px]"
            />
            <p className="corpo mt-6 max-w-[38ch] text-[0.9375rem]">
              Instalações elétricas residenciais e comerciais em {empresa.cidade} e
              região, com foco em qualidade, segurança e inovação.
            </p>
            <a
              href={empresa.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-2.5 text-sm text-[var(--texto-inverso-suave)] transition-colors duration-200 hover:text-[var(--engetec-amarelo)]"
            >
              <Instagram className="h-5 w-5" />
              {empresa.instagramHandle}
            </a>
          </div>

          <nav aria-label="Páginas">
            <h2 className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-white">
              Navegação
            </h2>
            <ul className="mt-5 space-y-3">
              {navegacao.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[0.9375rem] transition-colors duration-200 hover:text-[var(--engetec-amarelo)]"
                  >
                    {item.rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Serviços">
            <h2 className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-white">
              Serviços
            </h2>
            <ul className="mt-5 space-y-3">
              {servicos.map((servico) => (
                <li key={servico.id}>
                  <Link
                    href={`/servicos#${servico.id}`}
                    className="text-[0.9375rem] leading-snug transition-colors duration-200 hover:text-[var(--engetec-amarelo)]"
                  >
                    {servico.nome}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-white">
              Contato
            </h2>
            <ul className="mt-5 space-y-4 text-[0.9375rem]">
              <li>
                <a
                  href={linkWhatsapp()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 transition-colors duration-200 hover:text-[var(--engetec-amarelo)]"
                >
                  <Whatsapp className="mt-0.5 h-[18px] w-[18px] flex-none" />
                  WhatsApp {empresa.telefone}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${empresa.telefoneLink}`}
                  className="flex items-start gap-3 transition-colors duration-200 hover:text-[var(--engetec-amarelo)]"
                >
                  <Telefone className="mt-0.5 h-[18px] w-[18px] flex-none" />
                  {empresa.telefone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${empresa.email}`}
                  className="flex items-start gap-3 break-all transition-colors duration-200 hover:text-[var(--engetec-amarelo)]"
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

        <div className="flex flex-col gap-3 py-7 text-[0.8125rem] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {ano} {empresa.nome}. Todos os direitos reservados.
          </p>
          <p className="font-mono tracking-[0.08em]">
            {empresa.cidade} / {empresa.estado}
          </p>
        </div>
      </div>
    </footer>
  );
}
