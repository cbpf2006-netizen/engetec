import { useSyncExternalStore } from "react";

import { moeda } from "@/lib/formato";
import { CHAVE_VALORES_OCULTOS } from "@/lib/valores-ocultos-script";

/* =============================================================================
   Ocultar valores

   Preferência por aparelho (localStorage): quem esconde os valores na tela
   Início quer o mesmo em todas as telas — o app inteiro passa a mostrar
   "R$ ••••" no lugar de cada quantia em reais. Percentuais e quantidades não
   são dinheiro e continuam à vista.

   O estado vive num módulo, e não num contexto do React, porque é lido por
   dezenas de componentes espalhados (cartões, listas, gráficos) e pelo próprio
   script que roda antes da primeira pintura. `useSyncExternalStore` liga tudo
   sem provider e sem efeitos que disparam setState.

   localStorage pode lançar (janela privada, dados bloqueados): toda leitura e
   escrita é protegida, e falhar aqui só significa não lembrar a escolha.
   ========================================================================== */

const CHAVE = CHAVE_VALORES_OCULTOS;

/** O que aparece no lugar de uma quantia escondida. */
export const MASCARA = "R$ ••••";

const escutas = new Set<() => void>();

function ler(): boolean {
  try {
    return window.localStorage.getItem(CHAVE) === "1";
  } catch {
    return false;
  }
}

function marcarNoHtml(ocultos: boolean): void {
  if (ocultos) document.documentElement.setAttribute("data-ocultar", "1");
  else document.documentElement.removeAttribute("data-ocultar");
}

export function definirValoresOcultos(ocultos: boolean): void {
  try {
    if (ocultos) window.localStorage.setItem(CHAVE, "1");
    else window.localStorage.removeItem(CHAVE);
  } catch {
    /* sem armazenamento: vale só até recarregar */
  }

  marcarNoHtml(ocultos);
  escutas.forEach((escuta) => escuta());
}

function assinar(escuta: () => void): () => void {
  escutas.add(escuta);

  // Outra aba do mesmo aparelho mudou a escolha.
  const aoMudarEmOutraAba = (evento: StorageEvent) => {
    if (evento.key === CHAVE) {
      marcarNoHtml(ler());
      escuta();
    }
  };
  window.addEventListener("storage", aoMudarEmOutraAba);

  return () => {
    escutas.delete(escuta);
    window.removeEventListener("storage", aoMudarEmOutraAba);
  };
}

/** true = os valores estão escondidos. No servidor é sempre false: o HTML sai
    com os valores, e o script de pré-pintura (abaixo) os esconde por CSS até o
    React assumir. */
export function useValoresOcultos(): boolean {
  return useSyncExternalStore(assinar, ler, () => false);
}

/** Formatador de reais que respeita a escolha — para texto (tooltips de
    gráfico), onde não dá para usar o componente <Quantia>. */
export function useMoeda(): (valor: number) => string {
  const ocultos = useValoresOcultos();
  return (valor) => (ocultos ? MASCARA : moeda(valor));
}
