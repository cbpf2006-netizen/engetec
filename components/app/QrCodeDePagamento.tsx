"use client";

import { QRCodeSVG } from "qrcode.react";
import { QrCode } from "lucide-react";

/* =============================================================================
   QR Code de pagamento

   Sem valor configurado, mostra o espaço reservado — o layout já fica pronto
   e o QR entra quando a variável PAGAMENTO_QR_VALOR for definida. O QR é
   sempre preto sobre branco, mesmo no tema escuro: leitor de QR precisa de
   contraste claro-escuro e falha com o padrão invertido.
   ========================================================================== */

export function QrCodeDePagamento({ valor }: { valor: string }) {
  if (!valor) {
    return (
      <div
        role="img"
        aria-label="Espaço reservado para o QR Code de pagamento"
        className="grid aspect-square w-full max-w-56 place-items-center rounded-2xl border border-dashed border-input bg-muted/40 p-6 text-center"
      >
        <span className="flex flex-col items-center gap-2 text-muted-foreground">
          <QrCode className="size-10" aria-hidden="true" />
          <span className="text-xs leading-relaxed">QR Code de pagamento em breve</span>
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-cartao ring-1 ring-border">
      <QRCodeSVG
        value={valor}
        size={208}
        level="M"
        bgColor="#ffffff"
        fgColor="#000000"
        title="QR Code de pagamento"
      />
    </div>
  );
}
