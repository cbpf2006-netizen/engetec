import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Clock, MailCheck, MessageCircle } from "lucide-react";

import LogoRaiz from "@/components/marca/LogoRaiz";
import { SeletorDeTema } from "@/components/app/MenuDoUsuario";
import { BotaoExcluirConta } from "@/components/app/ExcluirConta";
import { ChavePixCopiavel } from "@/components/app/ChavePixCopiavel";
import { QrCodeDePagamento } from "@/components/app/QrCodeDePagamento";
import { Button } from "@/components/ui/button";
import { sair } from "@/lib/acoes/autenticacao";
import { perfilAtual } from "@/lib/dados/sessao";
import { Quantia } from "@/components/app/Quantia";
import { PIX_COPIA_E_COLA, VALOR_DO_ACESSO, linkDoWhatsapp } from "@/lib/pagamento";

export const metadata: Metadata = { title: "Falta só o pagamento" };

/* =============================================================================
   Tela de acesso pendente

   Aonde a pessoa chega logo depois de criar a conta. A conta existe, mas o
   acesso só é liberado quando o administrador confirmar o pagamento — e ele libera à mão. Por isso a tela não tem "botão de
   continuar": o único caminho para dentro é a liberação.

   Quem já foi liberado é devolvido ao app: esta rota não deve virar um beco
   para quem paga e volta a abri-la.
   ========================================================================== */

export default async function PaginaDePagamento() {
  const perfil = await perfilAtual();
  if (!perfil) redirect("/login");
  if (perfil.acesso === "liberado") redirect("/");

  const link = linkDoWhatsapp(perfil.nome, perfil.email);

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
            Conta criada
          </span>

          <div className="flex flex-col gap-2">
            <h1 className="text-[1.375rem] font-semibold tracking-tight sm:text-2xl">
              Falta só o pagamento
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Seu acesso será liberado após a confirmação do pagamento. Pague pelo QR
              Code ou pela chave Pix e envie o comprovante pelo WhatsApp.
            </p>
          </div>

          <div className="flex flex-col items-center gap-1 rounded-xl bg-accent px-6 py-3 text-accent-foreground">
            <span className="text-xs font-medium">Valor do acesso</span>
            <Quantia valor={VALOR_DO_ACESSO} className="text-3xl font-semibold" />
            <span className="text-xs opacity-80">Informe este valor ao fazer o Pix.</span>
          </div>

          <QrCodeDePagamento />

          <ChavePixCopiavel chave={PIX_COPIA_E_COLA} />

          <Button
            size="lg"
            className="w-full"
            nativeButton={false}
            render={<a href={link} target="_blank" rel="noopener noreferrer" />}
          >
            <MessageCircle />
            Enviar comprovante no WhatsApp
          </Button>

          <p className="flex items-center gap-2 rounded-xl bg-alerta-suave px-3.5 py-2.5 text-xs text-alerta-texto">
            <Clock className="size-3.5 shrink-0" aria-hidden="true" />
            Status: pendente — aguardando a liberação pelo administrador.
          </p>

          <div className="flex w-full flex-col border-t border-border pt-4">
            <form action={sair}>
              <Button type="submit" variant="ghost" className="w-full text-muted-foreground">
                Sair da conta
              </Button>
            </form>

            <BotaoExcluirConta
              rotulo="Excluir minha conta"
              variante="ghost"
              className="w-full text-destructive hover:text-destructive"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
