/* Parte de "ocultar valores" que o servidor precisa importar: a chave e o script
   que roda antes da primeira pintura. Fica num arquivo à parte, sem React,
   porque o módulo principal (lib/valores-ocultos.ts) usa hooks e não pode ser
   importado por um Server Component como o layout. */

export const CHAVE_VALORES_OCULTOS = "raiz:valores-ocultos";

/** Roda antes da primeira pintura: marca o <html> quando os valores devem
    abrir escondidos, e o CSS os oculta até o React hidratar. Sem isso, os
    valores apareceriam por um instante a cada abertura. */
export const SCRIPT_VALORES_OCULTOS = `(function(){try{if(localStorage.getItem(${JSON.stringify(
  CHAVE_VALORES_OCULTOS
)})==='1')document.documentElement.setAttribute('data-ocultar','1')}catch(e){}})();`;
