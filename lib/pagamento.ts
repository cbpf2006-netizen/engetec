/* =============================================================================
   Dados de pagamento

   Nada aqui é segredo: o QR Code e a chave copia e cola são exatamente o que a
   pessoa precisa ver para pagar. Ficam no código (e não em variável de
   ambiente) para o pagamento funcionar sem nenhuma configuração extra.

   O QR Code (public/pix-qrcode.png) e a chave abaixo são o mesmo Pix — a
   imagem foi conferida decodificando-a e comparando com esta string. Se um
   mudar, o outro precisa mudar junto.
   ========================================================================== */

/** Pix copia e cola. */
export const PIX_COPIA_E_COLA =
  "00020101021126330014br.gov.bcb.pix0111198914627905204000053039865802BR5917CAUA B P DE FARIA6008ARARUAMA62070503***630472C3";

/** WhatsApp que recebe o comprovante: DDI 55 (Brasil) + DDD 22 + número. */
export const WHATSAPP_DO_COMPROVANTE = "5522988311361";

export function linkDoWhatsapp(nome: string | null, email: string): string {
  const quem = nome?.trim() ? `${nome.trim()} (${email})` : email;
  const mensagem = `Olá! Sou ${quem} e estou enviando o comprovante de pagamento do Raiz.`;
  return `https://wa.me/${WHATSAPP_DO_COMPROVANTE}?text=${encodeURIComponent(mensagem)}`;
}
