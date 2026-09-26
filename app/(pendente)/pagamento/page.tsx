import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock, MailCheck, MessageCircle } from "lucide-react";

import LogoRaiz from "@/components/marca/LogoRaiz";
import { SeletorDeTema } from "@/components/app/MenuDoUsuario";
import { QrCodeDePagamento } from "@/components/app/QrCodeDePagamento";
import { Button } from "@/components/ui/button";
import { sair } from "@/lib/acoes/autenticacao";
import { perfilAtual } from "@/lib/dados/sessao";
import { configuracaoDePagamento, linkDoWhatsapp } from "@/lib/pagamento";

export const metadata: Metadata = { title: "Falta só o pagamento" };

/* =============================================================================
   Tela de acesso pendente

   Aonde a pessoa chega depois de confirmar o e-mail. A conta existe e o e-mail
   está provado, mas o acesso só é liberado quando o administrador confirmar o
   pagamento — e ele libera à mão. Por isso a tela não tem "botão de
   continuar": o único caminho para dentro é a liberação.

   Quem já foi liberado é devolvido ao app: esta rota não deve virar um beco
   para quem paga e volta a abri-la.
   ========================================================================== */

export default async function PaginaDePagamento() {
  const perfil = await perfilAtual();
  if (!perfil) redirect("/login");
  if (perfil.acesso === "liberado") redirect("/");

  const { qrValor, whatsapp } = configuracaoDePagamento();
  const link = whatsapp ? linkDoWhatsapp(whatsapp, perfil.nome, perfil.email) : null;

  return (
    <div className="flex min-h-dvh flex-col px-5 py-6 sm:px-8">
      <header className="flex items-center justify-between">
        <LogoRaiz />
        <SeletorDeTema />
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
        <div className="flex flex-col items-center gap-6 rounded-2xl bg-card p-6 text-center shadow-cartao ring-1 ring-border sm:p-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-entrada-suave px-3 py-1 text-xs font-medium text-entrada-texto">
            <MailCheck className="size-3.5" aria-hidden="true" />
            E-mail confirmado
          </span>

          <div className="flex flex-col gap-2">
            <h1 className="text-[1.375rem] font-semibold tracking-tight sm:text-2xl">
              Falta só o pagamento
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Seu acesso será liberado após a confirmação do pagamento. Faça o pagamento pelo QR
              Code e envie o comprovante pelo WhatsApp.
            </p>
          </div>

          <QrCodeDePagamento valor={qrValor} />

          {link ? (
            <Button
              size="lg"
              className="w-full"
              nativeButton={false}
              render={<a href={link} target="_blank" rel="noopener noreferrer" />}
            >
              <MessageCircle />
              Enviar comprovante no WhatsApp
            </Button>
          ) : (
            <div className="flex w-full flex-col gap-2">
              <Button size="lg" className="w-full" disabled>
                <MessageCircle />
                Enviar comprovante no WhatsApp
              </Button>
              <p className="text-xs text-muted-foreground">
                O contato de WhatsApp ainda não foi configurado.
              </p>
            </div>
          )}

          <p className="flex items-center gap-2 rounded-xl bg-alerta-suave px-3.5 py-2.5 text-xs text-alerta-texto">
            <Clock className="size-3.5 shrink-0" aria-hidden="true" />
            Status: pendente — aguardando a liberação pelo administrador.
          </p>

          <div className="flex w-full flex-col gap-1 border-t border-border pt-4">
            <Button
              variant="ghost"
              nativeButton={false}
              render={<Link href="/" prefetch={false} />}
            >
              Já paguei — verificar liberação
            </Button>

            <form action={sair}>
              <Button type="submit" variant="ghost" className="w-full text-muted-foreground">
                Sair da conta
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
