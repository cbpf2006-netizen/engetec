/* =============================================================================
   Período — a barra superior de Início, Entradas, Saídas e Investimentos

   O recorte vive na URL (`?p=mes&d=2026-09-13`), não em estado de React:
   assim o botão voltar funciona, o link pode ser compartilhado e o Server
   Component consegue buscar já o intervalo certo no banco, sem uma segunda
   ida ao servidor depois da hidratação.

   Duas peças definem o recorte:
     p  → preset (dia, semana, mes, ano, personalizado)
     d  → âncora: uma data qualquer dentro do período desejado

   Navegar para o período anterior/seguinte é mover a âncora, não recalcular
   o intervalo — o que mantém "mês seguinte" correto na virada de ano e em
   meses de tamanhos diferentes.

   Toda aritmética é feita em UTC sobre "AAAA-MM-DD". Data aqui é um rótulo
   de calendário, não um instante: somar um mês a 31/01 tem que dar 28/02,
   e o fuso do navegador não pode ter opinião sobre isso.
   ========================================================================== */

import { MESES, MESES_CURTOS, capitalizar, data as formatarData } from "./formato";

export type Preset = "dia" | "semana" | "mes" | "ano" | "personalizado";

export const PRESETS: { valor: Preset; rotulo: string; curto: string }[] = [
  { valor: "dia", rotulo: "Dia", curto: "D" },
  { valor: "semana", rotulo: "Semana", curto: "S" },
  { valor: "mes", rotulo: "Mês", curto: "M" },
  { valor: "ano", rotulo: "Ano", curto: "A" },
  { valor: "personalizado", rotulo: "Período", curto: "P" },
];

export type Periodo = {
  preset: Preset;
  /** Data de referência dentro do período. Irrelevante no preset
      personalizado, onde o intervalo é literal. */
  ancora: string;
  de: string;
  ate: string;
  rotulo: string;
  rotuloCurto: string;
};

export type Grao = "dia" | "semana" | "mes" | "ano";

export type Balde = { de: string; ate: string; rotulo: string };

export type JanelaGrafico = {
  de: string;
  ate: string;
  grao: Grao;
  baldes: Balde[];
  /** Verdadeiro quando a janela é maior que o período escolhido — acontece
      no preset "dia", onde uma única barra não conta história nenhuma. */
  ampliada: boolean;
};

const FUSO = "America/Sao_Paulo";
const DIA_MS = 86_400_000;

/** Hoje no fuso de quem usa o app, como "AAAA-MM-DD". O formato "sv-SE" é
    justamente ISO, o que evita montar a string na mão. */
export function hoje(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: FUSO });
}

function paraData(iso: string): Date {
  const [ano, mes, dia] = iso.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(ano, mes - 1, dia));
}

function paraIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function ehDataValida(texto: string | undefined | null): texto is string {
  if (!texto || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const d = paraData(texto);
  return !Number.isNaN(d.getTime()) && paraIso(d) === texto;
}

export function somarDias(iso: string, dias: number): string {
  const d = paraData(iso);
  d.setUTCDate(d.getUTCDate() + dias);
  return paraIso(d);
}

/** Soma meses preservando o fim de mês: 31/01 + 1 mês = 28/02 (ou 29 em
    ano bissexto), nunca 03/03 como faria o Date puro. */
export function somarMeses(iso: string, meses: number): string {
  const d = paraData(iso);
  const dia = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + meses);
  const ultimo = ultimoDiaDoMes(d.getUTCFullYear(), d.getUTCMonth());
  d.setUTCDate(Math.min(dia, ultimo));
  return paraIso(d);
}

function ultimoDiaDoMes(ano: number, mes: number): number {
  return new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate();
}

export function diferencaEmDias(de: string, ate: string): number {
  return Math.round((paraData(ate).getTime() - paraData(de).getTime()) / DIA_MS);
}

/** Segunda-feira da semana de `iso` (padrão ISO 8601, usado no Brasil). */
export function inicioDaSemana(iso: string): string {
  const d = paraData(iso);
  const recuo = (d.getUTCDay() + 6) % 7;
  return somarDias(iso, -recuo);
}

export function inicioDoMes(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

export function fimDoMes(iso: string): string {
  const d = paraData(iso);
  return paraIso(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)));
}

/* =============================================================================
   Resolução
   ========================================================================== */

type ParamsBrutos = Record<string, string | string[] | undefined>;

function texto(params: ParamsBrutos, chave: string): string | undefined {
  const valor = params[chave];
  return Array.isArray(valor) ? valor[0] : valor;
}

function ehPreset(valor: string | undefined): valor is Preset {
  return PRESETS.some((p) => p.valor === valor);
}

/** Lê o período dos searchParams da página. Qualquer coisa inválida cai no
    padrão (mês corrente) em vez de quebrar a página — a URL é editável por
    qualquer pessoa. */
export function resolverPeriodo(params: ParamsBrutos = {}): Periodo {
  const preset = ehPreset(texto(params, "p")) ? (texto(params, "p") as Preset) : "mes";
  const agora = hoje();

  if (preset === "personalizado") {
    const deBruto = texto(params, "de");
    const ateBruto = texto(params, "ate");
    const de = ehDataValida(deBruto) ? deBruto : inicioDoMes(agora);
    const ate = ehDataValida(ateBruto) ? ateBruto : agora;
    const [inicio, fim] = de <= ate ? [de, ate] : [ate, de];

    return {
      preset,
      ancora: inicio,
      de: inicio,
      ate: fim,
      rotulo: `${formatarData(inicio)} a ${formatarData(fim)}`,
      rotuloCurto: `${inicio.slice(8)}/${inicio.slice(5, 7)} – ${fim.slice(8)}/${fim.slice(5, 7)}`,
    };
  }

  const ancoraBruta = texto(params, "d");
  const ancora = ehDataValida(ancoraBruta) ? ancoraBruta : agora;

  return montar(preset, ancora, agora);
}

function montar(preset: Exclude<Preset, "personalizado">, ancora: string, agora: string): Periodo {
  const [ano, mes] = ancora.split("-");

  if (preset === "dia") {
    const rotulo =
      ancora === agora
        ? "Hoje"
        : ancora === somarDias(agora, -1)
          ? "Ontem"
          : `${Number(ancora.slice(8))} de ${MESES[Number(mes) - 1]} de ${ano}`;

    return {
      preset,
      ancora,
      de: ancora,
      ate: ancora,
      rotulo,
      rotuloCurto: `${ancora.slice(8)}/${mes}`,
    };
  }

  if (preset === "semana") {
    const de = inicioDaSemana(ancora);
    const ate = somarDias(de, 6);
    const mesmoMes = de.slice(0, 7) === ate.slice(0, 7);

    return {
      preset,
      ancora: de,
      de,
      ate,
      rotulo: mesmoMes
        ? `${Number(de.slice(8))} a ${Number(ate.slice(8))} de ${MESES[Number(de.slice(5, 7)) - 1]} de ${de.slice(0, 4)}`
        : `${Number(de.slice(8))} de ${MESES_CURTOS[Number(de.slice(5, 7)) - 1]} a ${Number(ate.slice(8))} de ${MESES_CURTOS[Number(ate.slice(5, 7)) - 1]} de ${ate.slice(0, 4)}`,
      rotuloCurto: `${de.slice(8)}/${de.slice(5, 7)} – ${ate.slice(8)}/${ate.slice(5, 7)}`,
    };
  }

  if (preset === "mes") {
    const de = inicioDoMes(ancora);

    return {
      preset,
      ancora: de,
      de,
      ate: fimDoMes(ancora),
      rotulo: `${capitalizar(MESES[Number(mes) - 1])} de ${ano}`,
      rotuloCurto: `${MESES_CURTOS[Number(mes) - 1]}/${ano.slice(2)}`,
    };
  }

  return {
    preset: "ano",
    ancora: `${ano}-01-01`,
    de: `${ano}-01-01`,
    ate: `${ano}-12-31`,
    rotulo: `Ano de ${ano}`,
    rotuloCurto: ano,
  };
}

/** Parâmetros de URL que reproduzem o período — o que o seletor empurra
    para o router. */
export function paramsDoPeriodo(periodo: Periodo): Record<string, string> {
  if (periodo.preset === "personalizado") {
    return { p: "personalizado", de: periodo.de, ate: periodo.ate };
  }
  return { p: periodo.preset, d: periodo.ancora };
}

/** Período anterior ou seguinte, mantendo o preset. No personalizado, desloca
    o intervalo inteiro pelo seu próprio tamanho. */
export function deslocar(periodo: Periodo, passos: number): Periodo {
  const agora = hoje();

  switch (periodo.preset) {
    case "dia":
      return montar("dia", somarDias(periodo.ancora, passos), agora);
    case "semana":
      return montar("semana", somarDias(periodo.ancora, passos * 7), agora);
    case "mes":
      return montar("mes", somarMeses(periodo.ancora, passos), agora);
    case "ano":
      return montar("ano", somarMeses(periodo.ancora, passos * 12), agora);
    case "personalizado": {
      const tamanho = diferencaEmDias(periodo.de, periodo.ate) + 1;
      const de = somarDias(periodo.de, passos * tamanho);
      const ate = somarDias(periodo.ate, passos * tamanho);
      return resolverPeriodo({ p: "personalizado", de, ate });
    }
  }
}

/** Troca o preset mantendo o usuário "onde estava": a âncora atual continua
    valendo, então sair de "setembro" para "semana" cai numa semana de
    setembro, não na semana de hoje. */
export function trocarPreset(periodo: Periodo, preset: Preset): Periodo {
  const agora = hoje();
  if (preset === "personalizado") {
    return resolverPeriodo({ p: "personalizado", de: periodo.de, ate: periodo.ate });
  }
  const ancora = periodo.de <= agora && agora <= periodo.ate ? agora : periodo.ancora;
  return montar(preset, ancora, agora);
}

/** O período imediatamente anterior, do mesmo tamanho — base do indicador
    "+12,4% no período". */
export function periodoAnterior(periodo: Periodo): { de: string; ate: string } {
  const anterior = deslocar(periodo, -1);
  return { de: anterior.de, ate: anterior.ate };
}

export function contemHoje(periodo: Periodo): boolean {
  const agora = hoje();
  return periodo.de <= agora && agora <= periodo.ate;
}

/* =============================================================================
   Janela do gráfico de evolução
   ========================================================================== */

function escolherGrao(dias: number): Grao {
  if (dias <= 16) return "dia";
  if (dias <= 92) return "semana";
  if (dias <= 800) return "mes";
  return "ano";
}

/** Divide o período em baldes para o gráfico de barras. Um único dia vira
    uma janela de 7 dias: uma barra sozinha não mostra evolução nenhuma, e é
    mais honesto ampliar (e dizer que ampliou) do que desenhar um gráfico
    inútil. */
export function janelaDoGrafico(periodo: Periodo): JanelaGrafico {
  const dias = diferencaEmDias(periodo.de, periodo.ate) + 1;
  const ampliada = dias <= 2;
  const ate = periodo.ate;
  const de = ampliada ? somarDias(ate, -6) : periodo.de;
  const grao = escolherGrao(diferencaEmDias(de, ate) + 1);

  return { de, ate, grao, ampliada, baldes: montarBaldes(de, ate, grao) };
}

function montarBaldes(de: string, ate: string, grao: Grao): Balde[] {
  const baldes: Balde[] = [];
  let cursor = inicioDoBalde(de, grao);

  while (cursor <= ate) {
    const fim = fimDoBalde(cursor, grao);
    baldes.push({
      de: cursor < de ? de : cursor,
      ate: fim > ate ? ate : fim,
      rotulo: rotuloDoBalde(cursor, grao),
    });
    cursor = somarDias(fim, 1);
  }

  return baldes;
}

function inicioDoBalde(iso: string, grao: Grao): string {
  if (grao === "dia") return iso;
  if (grao === "semana") return inicioDaSemana(iso);
  if (grao === "mes") return inicioDoMes(iso);
  return `${iso.slice(0, 4)}-01-01`;
}

function fimDoBalde(inicio: string, grao: Grao): string {
  if (grao === "dia") return inicio;
  if (grao === "semana") return somarDias(inicio, 6);
  if (grao === "mes") return fimDoMes(inicio);
  return `${inicio.slice(0, 4)}-12-31`;
}

function rotuloDoBalde(inicio: string, grao: Grao): string {
  const [ano, mes, dia] = inicio.split("-");
  if (grao === "dia") return `${dia}/${mes}`;
  if (grao === "semana") return `${dia}/${mes}`;
  if (grao === "mes") return MESES_CURTOS[Number(mes) - 1];
  return ano;
}
