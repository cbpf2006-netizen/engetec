/* =============================================================================
   Tela de abertura do app instalado no iPhone

   Ao abrir o app da Tela de Início, o iOS mostra uma imagem estática enquanto o
   site carrega — escolhida pelo tamanho exato da tela. Sem ela, aparece um
   fundo branco. As imagens (public/abertura/) são o verde-escuro com a logo,
   iguais à tela de abertura em CSS que entra logo depois (app/globals.css), para
   a passagem de uma para a outra não ser notada.

   Uma linha por modelo de iPhone: largura x altura em pontos e a densidade.
   Modelos com a mesma tela dividem a imagem.
   ========================================================================== */

const MODELOS = [
  { w: 440, h: 956, d: 3, arquivo: "iphone-1320x2868.png" }, // 16 Pro Max
  { w: 402, h: 874, d: 3, arquivo: "iphone-1206x2622.png" }, // 16 Pro
  { w: 430, h: 932, d: 3, arquivo: "iphone-1290x2796.png" }, // 14/15 Pro Max, 15/16 Plus
  { w: 393, h: 852, d: 3, arquivo: "iphone-1179x2556.png" }, // 14 Pro, 15, 15 Pro, 16
  { w: 428, h: 926, d: 3, arquivo: "iphone-1284x2778.png" }, // 12/13 Pro Max, 14 Plus
  { w: 390, h: 844, d: 3, arquivo: "iphone-1170x2532.png" }, // 12, 13, 14, 12/13 Pro
  { w: 375, h: 812, d: 3, arquivo: "iphone-1125x2436.png" }, // X, XS, 11 Pro, 12/13 mini
  { w: 414, h: 896, d: 3, arquivo: "iphone-1242x2688.png" }, // XS Max, 11 Pro Max
  { w: 414, h: 896, d: 2, arquivo: "iphone-828x1792.png" }, // XR, 11
  { w: 414, h: 736, d: 3, arquivo: "iphone-1242x2208.png" }, // 6/7/8 Plus
  { w: 375, h: 667, d: 2, arquivo: "iphone-750x1334.png" }, // SE, 6/7/8
] as const;

export const IMAGENS_DE_ABERTURA = MODELOS.map((m) => ({
  url: `/abertura/${m.arquivo}`,
  media: `(device-width: ${m.w}px) and (device-height: ${m.h}px) and (-webkit-device-pixel-ratio: ${m.d}) and (orientation: portrait)`,
}));
