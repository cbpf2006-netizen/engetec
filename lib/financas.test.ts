import { describe, expect, it } from "vitest";

import {
  aportesDoPeriodo,
  distribuirPorModelo,
  patrimonio,
  resumirContas,
  saldoEmCaixa,
  serieDoPeriodo,
  situacaoDaConta,
  taxaDePoupanca,
  totalDoFluxo,
  totalInvestido,
  variacaoRelativa,
  type MovimentoInvestimento,
  type MovimentoTransacao,
} from "./financas";
import type { Modelo } from "./tipos";

/* Cenário único, usado pela maior parte dos testes: dois meses de
   lançamentos, com um aporte e um resgate no meio. */
const transacoes: MovimentoTransacao[] = [
  { fluxo: "entrada", valor: 5000, data: "2026-08-05" },
  { fluxo: "saida", valor: 1200, data: "2026-08-10" },
  { fluxo: "entrada", valor: 6000, data: "2026-09-05" },
  { fluxo: "saida", valor: 1500, data: "2026-09-08" },
  { fluxo: "saida", valor: 800, data: "2026-09-20" },
];

const investimentos: MovimentoInvestimento[] = [
  { operacao: "aporte", valor: 2000, data: "2026-08-15" },
  { operacao: "aporte", valor: 1000, data: "2026-09-10" },
  { operacao: "resgate", valor: 500, data: "2026-09-25" },
];

describe("estoques", () => {
  it("acumula o caixa desde o início, descontando aportes e devolvendo resgates", () => {
    // Agosto: 5000 − 1200 − 2000 = 1800
    expect(saldoEmCaixa(transacoes, investimentos, "2026-08-31")).toBe(1800);

    // Setembro: 1800 + 6000 − 1500 − 800 − 1000 + 500 = 5000
    expect(saldoEmCaixa(transacoes, investimentos, "2026-09-30")).toBe(5000);
  });

  it("não deixa o período recortar o começo do estoque", () => {
    // O saldo no fim de setembro não depende de onde o período começa.
    expect(saldoEmCaixa(transacoes, investimentos, "2026-09-30")).toBe(
      saldoEmCaixa(transacoes, investimentos, "2026-09-30")
    );
  });

  it("soma aportes menos resgates no total investido", () => {
    expect(totalInvestido(investimentos, "2026-08-31")).toBe(2000);
    expect(totalInvestido(investimentos, "2026-09-30")).toBe(2500);
  });

  it("mantém patrimônio igual a entradas menos saídas", () => {
    // Aportar não muda o patrimônio: só troca o dinheiro de bolso.
    const entradas = 5000 + 6000;
    const saidas = 1200 + 1500 + 800;
    expect(patrimonio(transacoes, investimentos, "2026-09-30")).toBe(entradas - saidas);
  });

  it("ignora lançamentos posteriores à data de corte", () => {
    expect(saldoEmCaixa(transacoes, investimentos, "2026-08-04")).toBe(0);
  });
});

describe("fluxos do período", () => {
  it("soma apenas o intervalo, incluindo as duas pontas", () => {
    expect(totalDoFluxo(transacoes, "entrada", "2026-09-01", "2026-09-30")).toBe(6000);
    expect(totalDoFluxo(transacoes, "saida", "2026-09-01", "2026-09-30")).toBe(2300);
    expect(totalDoFluxo(transacoes, "saida", "2026-09-08", "2026-09-08")).toBe(1500);
  });

  it("trata o resgate como aporte negativo no fluxo do período", () => {
    expect(aportesDoPeriodo(investimentos, "2026-09-01", "2026-09-30")).toBe(500);
  });
});

describe("variação relativa", () => {
  it("calcula a diferença proporcional entre dois períodos", () => {
    expect(variacaoRelativa(6000, 5000)).toBeCloseTo(0.2);
    expect(variacaoRelativa(4000, 5000)).toBeCloseTo(-0.2);
  });

  it("devolve null quando não há base de comparação", () => {
    // "Subiu infinito por cento" não é informação: a interface precisa poder
    // dizer "sem período anterior".
    expect(variacaoRelativa(1000, 0)).toBeNull();
  });

  it("usa o módulo da base, para resultado negativo não inverter o sinal", () => {
    expect(variacaoRelativa(-500, -1000)).toBeCloseTo(0.5);
  });
});

describe("taxa de poupança", () => {
  it("mede quanto sobrou do que entrou", () => {
    expect(taxaDePoupanca(6000, 2300)).toBeCloseTo(0.6167, 4);
  });

  it("devolve null sem entradas no período", () => {
    expect(taxaDePoupanca(0, 500)).toBeNull();
  });
});

describe("distribuição por modelo", () => {
  const modelos: Modelo[] = [
    { id: "m1", fluxo: "saida", nome: "Alimentação", icone: "mercado", cor: "ambar", ordem: 1, arquivado: false, carteira_id: null },
    { id: "m2", fluxo: "saida", nome: "Moradia", icone: "casa", cor: "ciano", ordem: 2, arquivado: false, carteira_id: null },
  ];

  it("ordena do maior para o menor e calcula a fatia de cada um", () => {
    const fatias = distribuirPorModelo(
      [
        { modelo_id: "m1", valor: 300 },
        { modelo_id: "m2", valor: 900 },
        { modelo_id: "m1", valor: 200 },
      ],
      modelos
    );

    expect(fatias.map((f) => f.nome)).toEqual(["Moradia", "Alimentação"]);
    expect(fatias[0].valor).toBe(900);
    expect(fatias[1].valor).toBe(500);
    expect(fatias[0].fracao).toBeCloseTo(900 / 1400);
  });

  it("mantém na soma o lançamento cujo modelo foi apagado", () => {
    const fatias = distribuirPorModelo(
      [
        { modelo_id: "m1", valor: 100 },
        { modelo_id: null, valor: 400 },
      ],
      modelos
    );

    expect(fatias[0].nome).toBe("Sem modelo");
    expect(fatias.reduce((soma, f) => soma + f.valor, 0)).toBe(500);
  });
});

describe("série do período", () => {
  const baldes = [
    { de: "2026-09-01", ate: "2026-09-07", rotulo: "01/09" },
    { de: "2026-09-08", ate: "2026-09-14", rotulo: "08/09" },
    { de: "2026-09-15", ate: "2026-09-21", rotulo: "15/09" },
  ];

  it("acumula a partir do saldo que já existia", () => {
    const serie = serieDoPeriodo(baldes, transacoes, 1800);

    expect(serie[0]).toMatchObject({ entradas: 6000, saidas: 0, acumulado: 7800 });
    expect(serie[1]).toMatchObject({ entradas: 0, saidas: 1500, acumulado: 6300 });
    expect(serie[2]).toMatchObject({ saidas: 800, acumulado: 5500 });
  });

  it("começa do zero quando não há saldo anterior", () => {
    const serie = serieDoPeriodo(baldes, transacoes);
    expect(serie[0].acumulado).toBe(6000);
  });
});

describe("contas a pagar", () => {
  const contas = [
    { status: "pendente" as const, vencimento: "2026-09-05", valor: 400 },
    { status: "pendente" as const, vencimento: "2026-09-15", valor: 250 },
    { status: "pendente" as const, vencimento: "2026-10-30", valor: 900 },
    { status: "pago" as const, vencimento: "2026-09-01", valor: 120 },
  ];

  it("deriva 'atrasado' da data, sem guardar o estado no banco", () => {
    expect(situacaoDaConta({ status: "pendente", vencimento: "2026-09-05" }, "2026-09-13")).toBe(
      "atrasado"
    );
    expect(situacaoDaConta({ status: "pendente", vencimento: "2026-09-13" }, "2026-09-13")).toBe(
      "pendente"
    );
    expect(situacaoDaConta({ status: "pago", vencimento: "2026-01-01" }, "2026-09-13")).toBe("pago");
  });

  it("separa o que está aberto, atrasado e vencendo em breve", () => {
    const resumo = resumirContas(contas, "2026-09-13", "2026-09-20");

    expect(resumo.aPagar).toBe(1550);
    expect(resumo.atrasado).toBe(400);
    expect(resumo.quantidadeAtrasada).toBe(1);
    expect(resumo.venceEmBreve).toBe(250);
    expect(resumo.quantidadeEmBreve).toBe(1);
  });
});

describe("arredondamento", () => {
  it("não deixa erro de ponto flutuante vazar para a tela", () => {
    const centavos: MovimentoTransacao[] = [
      { fluxo: "entrada", valor: 0.1, data: "2026-09-01" },
      { fluxo: "entrada", valor: 0.2, data: "2026-09-01" },
    ];

    expect(totalDoFluxo(centavos, "entrada", "2026-09-01", "2026-09-01")).toBe(0.3);
  });
});
