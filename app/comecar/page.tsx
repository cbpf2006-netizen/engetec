import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Download,
  Eye,
  EyeOff,
  Lock,
  Receipt,
  ScanFace,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { GlifoRaiz } from "@/components/marca/LogoRaiz";
import { Button } from "@/components/ui/button";
import { WHATSAPP_DO_COMPROVANTE } from "@/lib/pagamento";

export const metadata: Metadata = {
  title: "Raiz — Organize suas finanças",
  description:
    "Entradas, saídas, investimentos, carteiras e contas a pagar em um só lugar. Instale no seu iPhone em segundos.",
  robots: { index: false, follow: false },
};

/* =============================================================================
   Página de apresentação (/comecar)

   Existe só para o anúncio: quem clica no link do anúncio cai aqui, não na
   tela de login crua. Ninguém chega nesta página entrando pelo app — a raiz
   ("/") continua indo direto para o login/painel, como sempre foi.

   Tema fixo, escuro, independente do claro/escuro do sistema: aqui o objetivo
   é a primeira impressão, não a leitura prolongada de números — por isso as
   cores são valores diretos, não os tokens que trocam com o tema do app.

   As telas do celular abaixo são recriações do desenho real do app (mesmas
   cores, mesma tipografia, mesmos ícones) para ilustrar sem depender de uma
   captura de tela literal.
   ========================================================================== */

const LINK_WHATSAPP = `https://wa.me/${WHATSAPP_DO_COMPROVANTE}?text=${encodeURIComponent(
  "Olá! Vi o anúncio do Raiz e quero saber mais."
)}`;

const RECURSOS = [
  {
    icone: ArrowUpRight,
    titulo: "Entradas e saídas",
    texto: "Lance em segundos e veja o saldo mudar na hora, com gráficos do período.",
  },
  {
    icone: TrendingUp,
    titulo: "Investimentos à parte",
    texto: "Aportes e resgates separados do caixa — patrimônio nunca se mistura com o dia a dia.",
  },
  {
    icone: Wallet,
    titulo: "Carteiras",
    texto: "Dinheiro na mão, conta do banco, cartão: cada uma com o próprio saldo.",
  },
  {
    icone: Receipt,
    titulo: "Contas a pagar",
    texto: "Cadastre o que vence todo mês e saiba o que está atrasado antes que vire problema.",
  },
  {
    icone: EyeOff,
    titulo: "Ocultar valores",
    texto: "Um toque e todo número vira ••••, para abrir o app perto de qualquer pessoa.",
  },
  {
    icone: ScanFace,
    titulo: "Bloqueio com Face ID",
    texto: "O app tranca sozinho e só reabre com o rosto, a digital ou a senha do aparelho.",
  },
] as const;

const PASSOS = [
  { numero: "1", titulo: "Crie sua conta", texto: "Nome, e-mail, telefone e senha. Leva menos de um minuto." },
  { numero: "2", titulo: "Pague o acesso", texto: "R$ 10 por Pix, com QR Code ou chave copia e cola." },
  { numero: "3", titulo: "Comece a organizar", texto: "Confirmamos o pagamento e seu acesso é liberado." },
] as const;

export default function PaginaDeApresentacao() {
  return (
    <div className="min-h-dvh bg-[#081f13] text-[#f4fbf6]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 size-[42rem] rounded-full bg-[radial-gradient(closest-side,rgb(34_197_94/0.16),transparent)]" />
        <div className="absolute -bottom-48 -left-32 size-[38rem] rounded-full bg-[radial-gradient(closest-side,rgb(16_185_129/0.12),transparent)]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-5xl flex-col px-5 sm:px-8">
        {/* ---------------------------------------------------------------- */}
        <header className="flex items-center justify-between py-6">
          <span className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight">
            <GlifoRaiz className="size-6 text-[#4ade80]" />
            Raiz
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="text-[#cdeada] hover:bg-white/10 hover:text-white"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            Já tenho conta
          </Button>
        </header>

        {/* ---------------------------------------------------------------- Hero */}
        <section className="grid items-center gap-12 py-10 sm:py-16 lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col items-start gap-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1 text-xs font-medium text-[#a7f3d0] ring-1 ring-white/10">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Organização financeira pessoal
            </span>

            <h1 className="text-[2.25rem] leading-[1.1] font-semibold tracking-tight sm:text-[2.75rem]">
              Seu dinheiro,
              <br />
              organizado.
            </h1>

            <p className="max-w-md text-base leading-relaxed text-[#cdeada]">
              Entradas, saídas, investimentos, carteiras e contas a pagar em um só lugar — com o
              saldo sempre em dia. Instala no seu iPhone como um app, sem loja nenhuma.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="bg-[#22c55e] text-[#06210f] shadow-[0_10px_30px_-10px_rgb(34_197_94/0.55)] hover:bg-[#22c55e]/90"
                nativeButton={false}
                render={<Link href="/cadastro" />}
              >
                Criar minha conta
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                nativeButton={false}
                render={
                  <a href={LINK_WHATSAPP} target="_blank" rel="noopener noreferrer" />
                }
              >
                Falar no WhatsApp
              </Button>
            </div>

            <p className="text-xs text-[#8fc9ab]">
              Acesso por <strong className="numero font-semibold text-[#f4fbf6]">R$ 10</strong> — sem
              mensalidade escondida.
            </p>
          </div>

          <div className="relative flex justify-center py-6 lg:justify-end">
            <TelaDeBloqueio className="absolute top-6 -left-2 hidden rotate-[-9deg] sm:block" />
            <TelaDoPainel className="relative z-10" />
          </div>
        </section>

        {/* ---------------------------------------------------------------- Recursos */}
        <section className="py-14 sm:py-20">
          <div className="mb-10 flex flex-col gap-2 text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Tudo o que você precisa, nada que sobra
            </h2>
            <p className="text-sm text-[#a9d6bd]">Seis recursos, um app só.</p>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {RECURSOS.map((recurso) => (
              <li
                key={recurso.titulo}
                className="flex flex-col gap-3 rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10 transition-colors duration-200 hover:bg-white/[0.07]"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-[#22c55e]/15 text-[#4ade80]">
                  <recurso.icone className="size-5" aria-hidden="true" />
                </span>
                <p className="font-medium text-white">{recurso.titulo}</p>
                <p className="text-sm leading-relaxed text-[#a9d6bd]">{recurso.texto}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------------------------------------------------------------- Como funciona */}
        <section className="py-14 sm:py-20">
          <div className="mb-10 flex flex-col gap-2 text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Como funciona</h2>
            <p className="text-sm text-[#a9d6bd]">Três passos, sem burocracia.</p>
          </div>

          <ol className="grid gap-6 sm:grid-cols-3">
            {PASSOS.map((passo) => (
              <li key={passo.numero} className="flex flex-col gap-3">
                <span className="numero grid size-10 place-items-center rounded-full bg-[#22c55e] text-sm font-semibold text-[#06210f]">
                  {passo.numero}
                </span>
                <p className="font-medium text-white">{passo.titulo}</p>
                <p className="text-sm leading-relaxed text-[#a9d6bd]">{passo.texto}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------------------------------------------------------------- Preço + CTA final */}
        <section className="py-14 sm:py-20">
          <div className="flex flex-col items-center gap-6 rounded-[1.75rem] bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-8 text-center ring-1 ring-white/10 sm:p-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1 text-xs font-medium text-[#a7f3d0] ring-1 ring-white/10">
              <Download className="size-3.5" aria-hidden="true" />
              Web app — instala direto do navegador
            </span>

            <p className="numero text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              R$ 10
            </p>
            <p className="max-w-sm text-sm leading-relaxed text-[#a9d6bd]">
              Um pagamento único dá acesso ao Raiz. Sem cartão de crédito, sem assinatura, sem
              pegadinha.
            </p>

            <Button
              size="lg"
              className="bg-[#22c55e] text-[#06210f] shadow-[0_10px_30px_-10px_rgb(34_197_94/0.55)] hover:bg-[#22c55e]/90"
              nativeButton={false}
              render={<Link href="/cadastro" />}
            >
              Criar minha conta agora
            </Button>

            <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-[#8fc9ab]">
              {["Sem downloads em loja", "Funciona no Android e no iPhone", "Seus dados, só seus"].map(
                (item) => (
                  <li key={item} className="inline-flex items-center gap-1.5">
                    <Check className="size-3.5 text-[#4ade80]" aria-hidden="true" />
                    {item}
                  </li>
                )
              )}
            </ul>
          </div>
        </section>

        <footer className="flex flex-col items-center gap-2 py-10 text-center text-xs text-[#5f9276]">
          <span className="inline-flex items-center gap-1.5 font-medium text-[#8fc9ab]">
            <GlifoRaiz className="size-3.5 text-[#4ade80]" />
            Raiz
          </span>
          <p>
            Dúvidas?{" "}
            <a href={LINK_WHATSAPP} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">
              Fale no WhatsApp
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

/* =============================================================================
   Mockups das telas — recriação do desenho real do app (mesmas cores e
   componentes visuais), não uma captura de tela.
   ========================================================================== */

function ArmacaoDoTelefone({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        "w-[19rem] rounded-[2.5rem] bg-[#0e1a13] p-2.5 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.6)] ring-1 ring-white/10 " +
        (className ?? "")
      }
    >
      <div className="relative overflow-hidden rounded-[2rem] bg-[#0b140f] ring-1 ring-black/40">
        <span
          aria-hidden="true"
          className="absolute top-0 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-[#0e1a13]"
        />
        {children}
      </div>
    </div>
  );
}

function TelaDoPainel({ className }: { className?: string }) {
  const barras = [40, 65, 30, 80, 55, 70];

  return (
    <ArmacaoDoTelefone className={className}>
      <div className="flex flex-col gap-4 px-4 pt-9 pb-6">
        <div className="flex items-center justify-between">
          <span className="text-[0.8125rem] font-medium text-[#cdeada]">Boa tarde, Cauã.</span>
          <span className="grid size-6 place-items-center rounded-full bg-white/10 text-[#a7f3d0]">
            <Eye className="size-3.5" aria-hidden="true" />
          </span>
        </div>

        <div className="flex flex-col gap-1 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10">
          <span className="text-xs text-[#a9d6bd]">Saldo total</span>
          <span className="numero text-[1.75rem] leading-none font-semibold text-white">
            R$ 12.480<span className="text-base opacity-60">,50</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex flex-col gap-1 rounded-xl bg-[#16351f] p-3 ring-1 ring-white/5">
            <span className="inline-flex items-center gap-1 text-[0.6875rem] text-[#86efac]">
              <ArrowUpRight className="size-3" aria-hidden="true" />
              Entradas
            </span>
            <span className="numero text-sm font-semibold text-white">R$ 3.200</span>
          </div>
          <div className="flex flex-col gap-1 rounded-xl bg-[#3a2016] p-3 ring-1 ring-white/5">
            <span className="inline-flex items-center gap-1 text-[0.6875rem] text-[#fdba8c]">
              <ArrowDownLeft className="size-3" aria-hidden="true" />
              Saídas
            </span>
            <span className="numero text-sm font-semibold text-white">R$ 1.150</span>
          </div>
        </div>

        <div className="flex h-20 items-end gap-2 rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/10">
          {barras.map((altura, indice) => (
            <span
              key={indice}
              className="flex-1 rounded-t-sm bg-[#22c55e]"
              style={{ height: `${altura}%`, opacity: 0.45 + indice * 0.08 }}
            />
          ))}
        </div>

        <div className="flex flex-col gap-2 rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/10">
          <span className="px-1 text-[0.6875rem] font-medium text-[#a9d6bd]">Carteiras</span>
          {[
            { nome: "Nubank", valor: "R$ 4.320,10" },
            { nome: "Dinheiro", valor: "R$ 180,00" },
          ].map((carteira) => (
            <div key={carteira.nome} className="flex items-center gap-2.5 rounded-xl px-2 py-1.5">
              <span className="grid size-7 place-items-center rounded-lg bg-white/10 text-[#a7f3d0]">
                <Wallet className="size-3.5" aria-hidden="true" />
              </span>
              <span className="flex-1 text-[0.8125rem] text-white">{carteira.nome}</span>
              <span className="numero text-[0.8125rem] font-medium text-[#cdeada]">
                {carteira.valor}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ArmacaoDoTelefone>
  );
}

function TelaDeBloqueio({ className }: { className?: string }) {
  return (
    <ArmacaoDoTelefone className={"w-64 opacity-90 " + (className ?? "")}>
      <div className="flex flex-col items-center gap-5 px-5 pt-16 pb-10 text-center">
        <span className="grid size-11 place-items-center rounded-full bg-white/10 text-[#a7f3d0]">
          <Lock className="size-5" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-white">Raiz bloqueado</p>
          <p className="text-[0.6875rem] leading-relaxed text-[#a9d6bd]">
            Confirme com o Face ID para continuar.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-xl bg-[#22c55e] px-4 py-2 text-xs font-semibold text-[#06210f]">
          <ScanFace className="size-3.5" aria-hidden="true" />
          Desbloquear
        </span>
      </div>
    </ArmacaoDoTelefone>
  );
}
