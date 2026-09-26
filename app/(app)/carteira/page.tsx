import type { Metadata } from "next";
import { Wallet } from "lucide-react";

import { TituloDaPagina } from "@/components/app/Bloco";
import { CartaoIndicador } from "@/components/app/CartaoIndicador";
import { GerenciadorDeCarteiras } from "@/components/app/GerenciadorDeCarteiras";
import {
  contagemPorCarteira,
  listarCarteiras,
  saldoPorCarteira,
} from "@/lib/dados/carteiras";

export const metadata: Metadata = { title: "Carteira" };

/* Esta página não usa a barra de período: o saldo de uma carteira é um
   estoque — o que está lá agora, somando toda a história. Recortar por mês
   daria um número que não corresponde a nada que se possa conferir. */
export default async function PaginaDeCarteiras() {
  const [carteiras, saldos, usoPorCarteira] = await Promise.all([
    listarCarteiras(),
    saldoPorCarteira(),
    contagemPorCarteira(),
  ]);

  const total = Object.values(saldos).reduce((soma, valor) => soma + valor, 0);

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <TituloDaPagina
        titulo="Carteira"
        apoio="Onde o seu dinheiro está. Toda entrada, saída e investimento aponta para uma delas."
      />

      <CartaoIndicador
        rotulo="Total nas carteiras"
        quantia={total}
        icone={Wallet}
        destaque
      />

      <GerenciadorDeCarteiras
        carteiras={carteiras}
        saldos={saldos}
        usoPorCarteira={usoPorCarteira}
      />
    </div>
  );
}
