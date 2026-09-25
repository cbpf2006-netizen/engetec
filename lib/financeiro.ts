/* =============================================================
   FINANCEIRO — contrato

   Caixa da Engetec: o que entrou e o que saiu. Toda movimentação é
   lançada à mão — não há loja/e-commerce alimentando isto sozinho.
   ============================================================= */

export type TipoMovimentacao = "receita" | "despesa";

export const ROTULO_TIPO: Record<TipoMovimentacao, string> = {
  receita: "Receita",
  despesa: "Despesa",
};

export type FormaPagamentoFinanceira =
  | "dinheiro"
  | "pix"
  | "debito"
  | "credito"
  | "boleto"
  | "transferencia";

export type StatusMovimentacao = "pendente" | "pago" | "atrasado";

export const FORMAS: { valor: FormaPagamentoFinanceira; rotulo: string }[] = [
  { valor: "dinheiro", rotulo: "Dinheiro" },
  { valor: "pix", rotulo: "PIX" },
  { valor: "debito", rotulo: "Cartão de débito" },
  { valor: "credito", rotulo: "Cartão de crédito" },
  { valor: "boleto", rotulo: "Boleto" },
  { valor: "transferencia", rotulo: "Transferência" },
];

export const ROTULO_FORMA: Record<FormaPagamentoFinanceira, string> =
  Object.fromEntries(FORMAS.map((f) => [f.valor, f.rotulo])) as Record<
    FormaPagamentoFinanceira,
    string
  >;

export const SITUACOES: { valor: StatusMovimentacao; rotulo: string }[] = [
  { valor: "pendente", rotulo: "Pendente" },
  { valor: "pago", rotulo: "Pago" },
  { valor: "atrasado", rotulo: "Atrasado" },
];

export const ROTULO_STATUS: Record<StatusMovimentacao, string> =
  Object.fromEntries(SITUACOES.map((s) => [s.valor, s.rotulo])) as Record<
    StatusMovimentacao,
    string
  >;

/* Só o boleto e a transferência têm situação a escolher: dinheiro,
   PIX e cartão são liquidados no ato. */
export function temSituacao(forma: FormaPagamentoFinanceira): boolean {
  return forma === "boleto" || forma === "transferencia";
}

export type MovimentacaoFinanceira = {
  id: string;
  data: string;
  tipo: TipoMovimentacao;
  categoria: string;
  valor: number;
  observacoes: string;
  formaPagamento: FormaPagamentoFinanceira;
  status: StatusMovimentacao;
};

/* Só o que está pago entra em saldo/receitas/despesas/lucro — um
   boleto pendente é dinheiro que ainda não saiu. O que ficou de fora
   vira receitasAbertas/despesasAbertas, para o número não mentir por
   omissão. */
export type ResumoFinanceiro = {
  de: string;
  ate: string;
  saldo: number;
  receitas: number;
  despesas: number;
  lucro: number;
  receitasAbertas: number;
  despesasAbertas: number;
  emAberto: number;
  lancamentos: number;
};

export type PontoDaSerie = {
  periodo: string;
  receitas: number;
  despesas: number;
  lucro: number;
  acumulado: number;
};

export const CATEGORIAS_DESPESA = [
  "Material Elétrico",
  "Ferramentas e Equipamentos",
  "Mão de Obra",
  "Transporte e Combustível",
  "Energia Solar (módulos/estrutura)",
  "Administrativo",
];

export const CATEGORIAS_RECEITA = ["Serviço prestado", "Orçamento fechado"];

/** Valor sentinela do seletor: ao escolhê-lo, o campo de texto assume
    e é o que vai para o banco. */
export const CATEGORIA_PERSONALIZADA = "Personalizada";

/* =============================================================
   RECORTE DE PERÍODO
   ============================================================= */

export type Preset = "hoje" | "semana" | "mes" | "ano" | "custom";

export type Faixa = { de: string; ate: string; rotulo: string; preset: Preset };

export const PRESETS: { valor: Preset; rotulo: string }[] = [
  { valor: "hoje", rotulo: "Hoje" },
  { valor: "semana", rotulo: "Semana" },
  { valor: "mes", rotulo: "Mês" },
  { valor: "ano", rotulo: "Ano" },
  { valor: "custom", rotulo: "Período" },
];

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

/** Hoje no fuso de Araruama/RJ (America/Sao_Paulo), como "AAAA-MM-DD". */
export function hojeNoFuso(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
}

function emUTC(data: string): Date {
  const [ano, mes, dia] = data.split("-").map(Number);
  return new Date(Date.UTC(ano, mes - 1, dia));
}

function paraTexto(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function resolverFaixa(
  preset: string | undefined,
  de: string | undefined,
  ate: string | undefined
): Faixa {
  const hoje = hojeNoFuso();
  const d = emUTC(hoje);

  if (preset === "custom" || (!preset && de && ate)) {
    const inicio = de ?? hoje;
    const fim = ate ?? hoje;
    return {
      de: inicio,
      ate: fim,
      rotulo: `${formatarCurto(inicio)} a ${formatarCurto(fim)}`,
      preset: "custom",
    };
  }

  if (preset === "hoje") {
    return { de: hoje, ate: hoje, rotulo: "Hoje", preset: "hoje" };
  }

  if (preset === "semana") {
    const diaDaSemana = d.getUTCDay();
    const recuo = diaDaSemana === 0 ? 6 : diaDaSemana - 1;
    const inicio = new Date(d);
    inicio.setUTCDate(d.getUTCDate() - recuo);
    return { de: paraTexto(inicio), ate: hoje, rotulo: "Esta semana", preset: "semana" };
  }

  if (preset === "ano") {
    return {
      de: `${d.getUTCFullYear()}-01-01`,
      ate: hoje,
      rotulo: `Ano de ${d.getUTCFullYear()}`,
      preset: "ano",
    };
  }

  const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
  return {
    de: `${d.getUTCFullYear()}-${mes}-01`,
    ate: hoje,
    rotulo: `${MESES[d.getUTCMonth()]} de ${d.getUTCFullYear()}`,
    preset: "mes",
  };
}

export function formatarCurto(data: string): string {
  const [ano, mes, dia] = data.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano.slice(2)}`;
}

export type Grao = "dia" | "semana" | "mes" | "ano";

/** Grão que cabe na faixa sem virar uma parede de barras. */
export function graoAutomatico(faixa: Faixa): Grao {
  const dias =
    (emUTC(faixa.ate).getTime() - emUTC(faixa.de).getTime()) / 86_400_000 + 1;

  if (dias <= 45) return "dia";
  if (dias <= 200) return "semana";
  if (dias <= 1200) return "mes";
  return "ano";
}

export function rotuloDoPonto(periodo: string, grao: Grao): string {
  const [ano, mes, dia] = periodo.slice(0, 10).split("-");

  if (grao === "ano") return ano;
  if (grao === "mes") return `${MESES[Number(mes) - 1].slice(0, 3)}/${ano.slice(2)}`;
  return `${dia}/${mes}`;
}
