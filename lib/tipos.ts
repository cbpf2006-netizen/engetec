/* =============================================================================
   Contratos do domínio

   Espelham as tabelas de supabase/migrations/0001_init.sql. Os valores em
   dinheiro chegam do Postgres como `numeric` (string no driver) e são
   convertidos para number em lib/dados/*.ts — nunca use `any` para atravessar
   essa fronteira.
   ========================================================================== */

/** Os três fluxos do app. Entrada e saída viram linhas em `transacoes`;
    investimento vira linha em `investimentos`. */
export type Fluxo = "entrada" | "saida" | "investimento";

export const ROTULO_FLUXO: Record<Fluxo, string> = {
  entrada: "Entrada",
  saida: "Saída",
  investimento: "Investimento",
};

export const ROTULO_FLUXO_PLURAL: Record<Fluxo, string> = {
  entrada: "Entradas",
  saida: "Saídas",
  investimento: "Investimentos",
};

/** Modelo (categoria) criado pelo usuário. A mesma tabela serve aos três
    fluxos — `fluxo` é o discriminador. */
export type Modelo = {
  id: string;
  fluxo: Fluxo;
  nome: string;
  icone: string;
  cor: string;
  ordem: number;
  arquivado: boolean;
  /** Só tipos de investimento têm carteira: é escolhida uma vez, ao criar o
      tipo, e todo aporte e resgate herda. Nulo nos tipos anteriores às
      carteiras. */
  carteira_id: string | null;
};

/** Onde o dinheiro está: "Mão", "Santander", "Bradesco". Só um nome — o saldo
    de uma carteira é a soma dos lançamentos que apontam para ela. */
export type Carteira = {
  id: string;
  nome: string;
  ordem: number;
};

export type Transacao = {
  id: string;
  fluxo: Extract<Fluxo, "entrada" | "saida">;
  modelo_id: string | null;
  /** Nulo só nos lançamentos anteriores à criação das carteiras: a interface
      exige a carteira em todo lançamento novo. */
  carteira_id: string | null;
  valor: number;
  data: string; // "AAAA-MM-DD"
  observacao: string | null;
  criado_em: string;
};

/** Transação já com o modelo resolvido — o que as listas exibem. */
export type TransacaoComModelo = Transacao & {
  modelo: Modelo | null;
  carteira: Carteira | null;
};

/** Aporte ou resgate. Guardar as duas operações desde a v1 é o que permite
    somar "total investido" sem recalcular o passado quando o resgate existir
    na interface. */
export type OperacaoInvestimento = "aporte" | "resgate";

export type Investimento = {
  id: string;
  operacao: OperacaoInvestimento;
  modelo_id: string | null;
  valor: number;
  data: string;
  observacao: string | null;
  criado_em: string;
};

/** A carteira de um investimento é a do seu tipo (`modelo.carteira_id`). */
export type InvestimentoComModelo = Investimento & {
  modelo: Modelo | null;
};

/** Conta a pagar. `status` no banco só tem dois estados reais: pendente e
    pago. "Atrasado" é derivado (pendente + vencimento no passado) — guardar
    um terceiro estado no banco significaria uma linha ficar mentindo até
    alguém rodar um job de virada de dia. */
export type StatusConta = "pendente" | "pago";
export type SituacaoConta = "pendente" | "pago" | "atrasado";

export type Conta = {
  id: string;
  nome: string;
  modelo_id: string | null;
  valor: number;
  vencimento: string | null;
  status: StatusConta;
  pago_em: string | null;
  transacao_id: string | null;
  observacao: string | null;
  criado_em: string;
};

export type ContaComModelo = Conta & {
  modelo: Modelo | null;
  situacao: SituacaoConta;
};

/** Filtro da aba Contas a pagar. Vive aqui (e não no módulo de dados, que é
    server-only) porque as fichas de filtro são um componente cliente. */
export type FiltroContas = "todas" | SituacaoConta;

export const FILTROS_CONTA: { valor: FiltroContas; rotulo: string }[] = [
  { valor: "todas", rotulo: "Todas" },
  { valor: "pendente", rotulo: "Pendentes" },
  { valor: "atrasado", rotulo: "Atrasadas" },
];

export function ehFiltroConta(valor: string | undefined): valor is FiltroContas {
  return FILTROS_CONTA.some((f) => f.valor === valor);
}

export type Perfil = {
  id: string;
  nome: string | null;
  email: string;
  /** Só os dígitos (DDD + número). A máscara é da interface. */
  telefone: string | null;
  /** URL pública da foto; nula quando a pessoa não enviou (ou removeu) uma. */
  foto_url: string | null;
};

/** Retorno padrão de toda Server Action de escrita. Erros viram mensagem
    pronta para o usuário — a interface nunca mostra texto do Postgres.

    `Falha` é um tipo próprio (e não só um braço da união) para quem produz um
    erro poder devolvê-lo sem que o TypeScript ainda considere o caso de
    sucesso. */
export type Falha = { ok: false; erro: string; campo?: string };

export type Resultado<T = undefined> = { ok: true; dados: T } | Falha;

export function falha(erro: string, campo?: string): Falha {
  return { ok: false, erro, campo };
}

export function sucesso(): Resultado<undefined>;
export function sucesso<T>(dados: T): Resultado<T>;
export function sucesso<T>(dados?: T): Resultado<T | undefined> {
  return { ok: true, dados };
}
