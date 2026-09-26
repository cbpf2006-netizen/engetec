/* =============================================================================
   Catálogo visual dos modelos

   O banco guarda APELIDOS ("verde", "carrinho"), nunca hex nem nome de
   componente. Duas razões: o mesmo modelo precisa ter um verde no tema claro
   e outro no escuro (cada apelido aponta para uma variável CSS que troca
   sozinha), e trocar a biblioteca de ícones não pode exigir migração de
   dados.

   A ordem das cores é a ordem validada para daltonismo em app/globals.css —
   `--serie-1` a `--serie-8`. Modelos novos recebem a próxima cor livre nessa
   ordem, nunca uma cor sorteada.
   ========================================================================== */

export type ApelidoCor =
  | "verde"
  | "ciano"
  | "violeta"
  | "ambar"
  | "turquesa"
  | "rosa"
  | "indigo"
  | "oliva"
  | "cinza";

export const CORES: { apelido: ApelidoCor; rotulo: string; variavel: string }[] = [
  { apelido: "verde", rotulo: "Verde", variavel: "--serie-1" },
  { apelido: "ciano", rotulo: "Ciano", variavel: "--serie-2" },
  { apelido: "violeta", rotulo: "Violeta", variavel: "--serie-3" },
  { apelido: "ambar", rotulo: "Âmbar", variavel: "--serie-4" },
  { apelido: "turquesa", rotulo: "Turquesa", variavel: "--serie-5" },
  { apelido: "rosa", rotulo: "Rosa", variavel: "--serie-6" },
  { apelido: "indigo", rotulo: "Índigo", variavel: "--serie-7" },
  { apelido: "oliva", rotulo: "Oliva", variavel: "--serie-8" },
  { apelido: "cinza", rotulo: "Cinza", variavel: "--muted-foreground" },
];

/** Cores oferecidas ao criar um modelo. A aba de investimentos é toda em verde,
    e um tipo roxo nela destoaria — então esses dois tons não são oferecidos ali.
    Modelos de entrada e saída seguem com a paleta completa. */
const SEM_ROXO: readonly ApelidoCor[] = ["violeta", "indigo"];

export function coresDoFluxo(fluxo: "entrada" | "saida" | "investimento") {
  return fluxo === "investimento" ? CORES.filter((c) => !SEM_ROXO.includes(c.apelido)) : CORES;
}

const POR_APELIDO = new Map(CORES.map((c) => [c.apelido, c]));

/** Devolve `var(--serie-N)`, pronto para style ou para o `fill` do Recharts. */
export function corDoModelo(apelido: string): string {
  return `var(${(POR_APELIDO.get(apelido as ApelidoCor) ?? POR_APELIDO.get("cinza")!).variavel})`;
}

/** Próxima cor da sequência que ainda não está em uso entre os modelos do
    mesmo fluxo. Quando todas estiverem ocupadas, recomeça o rodízio. */
export function proximaCorLivre(
  usadas: string[],
  fluxo?: "entrada" | "saida" | "investimento"
): ApelidoCor {
  const candidatas = (fluxo ? coresDoFluxo(fluxo) : CORES).filter((c) => c.apelido !== "cinza");
  const livre = candidatas.find((c) => !usadas.includes(c.apelido));
  return (livre ?? candidatas[usadas.length % candidatas.length]).apelido;
}

/* =============================================================================
   Ícones

   Lista fechada: o usuário escolhe entre estes, e components/Icone.tsx é o
   único lugar que conhece os componentes do lucide-react.
   ========================================================================== */

export const ICONES = [
  "salario",
  "carteira",
  "presente",
  "notebook",
  "grafico",
  "cofre",
  "banco",
  "cartao",
  "moeda",
  "mercado",
  "restaurante",
  "casa",
  "carro",
  "onibus",
  "combustivel",
  "saude",
  "educacao",
  "lazer",
  "viagem",
  "assinatura",
  "celular",
  "luz",
  "agua",
  "internet",
  "roupa",
  "pet",
  "academia",
  "ferramenta",
  "documento",
  "circulo",
] as const;

export const ICONES_POR_FLUXO = {
  entrada: ["salario", "presente", "notebook", "moeda", "banco"] as const,
  saida: ["mercado", "casa", "saude", "educacao", "lazer", "combustivel", "restaurante", "roupa", "internet", "cartao"] as const,
  investimento: ["grafico", "banco", "cofre", "moeda", "cartao"] as const,
} as const;

export type ApelidoIcone = (typeof ICONES)[number];

export function ehIcone(valor: string): valor is ApelidoIcone {
  return (ICONES as readonly string[]).includes(valor);
}

export function ehCor(valor: string): valor is ApelidoCor {
  return POR_APELIDO.has(valor as ApelidoCor);
}
