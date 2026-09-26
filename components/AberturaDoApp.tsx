import { GlifoRaiz } from "@/components/marca/LogoRaiz";

/* Tela de abertura: fundo verde-escuro com a logo à frente. Marcação pura, sem
   JavaScript — a animação e o desaparecimento são CSS (ver app/globals.css,
   "Tela de abertura"). Está no HTML do servidor de propósito: aparece já no
   primeiro quadro, antes de qualquer conteúdo, em vez de piscar o app e só
   depois cobri-lo. */

export function AberturaDoApp() {
  return (
    <div id="abertura" aria-hidden="true">
      <span className="abertura-halo" />
      <div className="abertura-marca">
        <GlifoRaiz className="size-20 text-[#4ade80]" />
        <span className="text-3xl font-semibold tracking-tight">Raiz</span>
      </div>
    </div>
  );
}

/** Roda antes da primeira pintura. Desliga a abertura no computador e quando ela
    já foi mostrada nesta sessão (sessionStorage some ao fechar o app). Mostra
    no celular e no app instalado. */
export const SCRIPT_DA_ABERTURA = "(function(){try{var e=document.documentElement;var instalado=navigator.standalone===true||matchMedia('(display-mode: standalone)').matches;var celular=matchMedia('(max-width: 1023px)').matches;var jaVista=sessionStorage.getItem('raiz:abertura')==='1';if(jaVista||!(instalado||celular)){e.setAttribute('data-sem-abertura','1')}else{sessionStorage.setItem('raiz:abertura','1')}}catch(x){}})();";
