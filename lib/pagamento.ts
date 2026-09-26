import "server-only";

/* =============================================================================
   Configuração da tela de pagamento

   Duas variáveis de ambiente, lidas só no servidor:

     PAGAMENTO_QR_VALOR   o conteúdo do QR Code (código Pix copia e cola, link
                          de pagamento — o que for). Vazio: a tela mostra o
                          espaço reservado "em breve".
     PAGAMENTO_WHATSAPP   número que recebe o comprovante, só dígitos com DDI e
                          DDD (ex.: 5511912345678). Vazio: o botão aparece
                          desativado.

   Ficam em variável de ambiente, e não no código, para trocar o valor sem
   novo deploy de código nem commit.
   ========================================================================== */

export function configuracaoDePagamento(): { qrValor: string; whatsapp: string } {
  return {
    qrValor: (process.env.PAGAMENTO_QR_VALOR ?? "").trim(),
    whatsapp: (process.env.PAGAMENTO_WHATSAPP ?? "").replace(/\D/g, ""),
  };
}

export function linkDoWhatsapp(numero: string, nome: string | null, email: string): string {
  const quem = nome?.trim() ? `${nome.trim()} (${email})` : email;
  const mensagem = `Olá! Sou ${quem} e estou enviando o comprovante de pagamento do Raiz.`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}
