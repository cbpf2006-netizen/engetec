import Image from "next/image";

/* =============================================================================
   QR Code de pagamento (Pix)

   A imagem já vem com fundo branco e margem: leitor de QR precisa de contraste
   claro-escuro e falha com o padrão invertido, então o quadro fica branco
   mesmo no tema escuro.
   ========================================================================== */

export function QrCodeDePagamento() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-cartao ring-1 ring-border">
      <Image
        src="/pix-qrcode.png"
        alt="QR Code Pix para pagamento"
        width={360}
        height={361}
        priority
        className="size-56 sm:size-60"
      />
    </div>
  );
}
