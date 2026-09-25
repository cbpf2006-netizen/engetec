import { describe, expect, it } from "vitest";

import {
  deslocar,
  diferencaEmDias,
  ehDataValida,
  fimDoMes,
  inicioDaSemana,
  janelaDoGrafico,
  paramsDoPeriodo,
  periodoAnterior,
  resolverPeriodo,
  somarDias,
  somarMeses,
  trocarPreset,
} from "./periodo";

describe("aritmética de calendário", () => {
  it("soma dias atravessando o fim do mês", () => {
    expect(somarDias("2026-09-30", 1)).toBe("2026-10-01");
    expect(somarDias("2026-01-01", -1)).toBe("2025-12-31");
  });

  it("preserva o fim de mês ao somar meses", () => {
    // O Date puro daria 2026-03-03 aqui.
    expect(somarMeses("2026-01-31", 1)).toBe("2026-02-28");
    expect(somarMeses("2024-01-31", 1)).toBe("2024-02-29");
    expect(somarMeses("2026-03-15", -1)).toBe("2026-02-15");
  });

  it("começa a semana na segunda-feira", () => {
    // 13/09/2026 é um domingo: a semana começou na segunda, dia 07.
    expect(inicioDaSemana("2026-09-13")).toBe("2026-09-07");
    expect(inicioDaSemana("2026-09-07")).toBe("2026-09-07");
    expect(inicioDaSemana("2026-09-14")).toBe("2026-09-14");
  });

  it("encontra o último dia do mês", () => {
    expect(fimDoMes("2026-02-10")).toBe("2026-02-28");
    expect(fimDoMes("2026-09-01")).toBe("2026-09-30");
  });

  it("conta a diferença entre datas em dias", () => {
    expect(diferencaEmDias("2026-09-01", "2026-09-30")).toBe(29);
    expect(diferencaEmDias("2026-09-30", "2026-09-30")).toBe(0);
  });

  it("recusa data inexistente", () => {
    expect(ehDataValida("2026-02-30")).toBe(false);
    expect(ehDataValida("2026-13-01")).toBe(false);
    expect(ehDataValida("13/09/2026")).toBe(false);
    expect(ehDataValida("2026-09-13")).toBe(true);
  });
});

describe("resolução do período", () => {
  it("monta o mês inteiro a partir de uma âncora qualquer", () => {
    const periodo = resolverPeriodo({ p: "mes", d: "2026-09-13" });

    expect(periodo).toMatchObject({ de: "2026-09-01", ate: "2026-09-30", preset: "mes" });
    expect(periodo.rotulo).toBe("Setembro de 2026");
  });

  it("monta a semana de segunda a domingo", () => {
    const periodo = resolverPeriodo({ p: "semana", d: "2026-09-10" });
    expect(periodo).toMatchObject({ de: "2026-09-07", ate: "2026-09-13" });
  });

  it("monta o ano inteiro", () => {
    const periodo = resolverPeriodo({ p: "ano", d: "2026-05-02" });
    expect(periodo).toMatchObject({ de: "2026-01-01", ate: "2026-12-31", rotulo: "Ano de 2026" });
  });

  it("aceita intervalo personalizado e corrige a ordem invertida", () => {
    const periodo = resolverPeriodo({ p: "personalizado", de: "2026-09-20", ate: "2026-09-01" });
    expect(periodo).toMatchObject({ de: "2026-09-01", ate: "2026-09-20" });
  });

  it("cai no mês corrente diante de parâmetro inválido", () => {
    // A URL é editável por qualquer pessoa: lixo não pode quebrar a página.
    expect(resolverPeriodo({ p: "trimestre" }).preset).toBe("mes");
    expect(resolverPeriodo({ p: "mes", d: "ontem" }).preset).toBe("mes");
  });

  it("devolve os parâmetros que reproduzem o recorte", () => {
    const mes = resolverPeriodo({ p: "mes", d: "2026-09-13" });
    expect(paramsDoPeriodo(mes)).toEqual({ p: "mes", d: "2026-09-01" });

    const custom = resolverPeriodo({ p: "personalizado", de: "2026-09-01", ate: "2026-09-20" });
    expect(paramsDoPeriodo(custom)).toEqual({
      p: "personalizado",
      de: "2026-09-01",
      ate: "2026-09-20",
    });
  });
});

describe("navegação entre períodos", () => {
  it("anda mês a mês atravessando a virada de ano", () => {
    const dezembro = resolverPeriodo({ p: "mes", d: "2026-12-10" });
    const janeiro = deslocar(dezembro, 1);

    expect(janeiro).toMatchObject({ de: "2027-01-01", ate: "2027-01-31" });
    expect(deslocar(janeiro, -1)).toMatchObject({ de: "2026-12-01", ate: "2026-12-31" });
  });

  it("anda semana a semana", () => {
    const semana = resolverPeriodo({ p: "semana", d: "2026-09-10" });
    expect(deslocar(semana, -1)).toMatchObject({ de: "2026-08-31", ate: "2026-09-06" });
  });

  it("desloca o intervalo personalizado pelo próprio tamanho", () => {
    const custom = resolverPeriodo({ p: "personalizado", de: "2026-09-01", ate: "2026-09-10" });
    expect(deslocar(custom, -1)).toMatchObject({ de: "2026-08-22", ate: "2026-08-31" });
  });

  it("mantém a pessoa no mesmo trecho do calendário ao trocar o preset", () => {
    const setembro = resolverPeriodo({ p: "mes", d: "2026-09-13" });
    const semana = trocarPreset(setembro, "semana");

    // Sai de "setembro" para uma semana de setembro, não para a semana de hoje.
    expect(semana.de.startsWith("2026-09")).toBe(true);
  });

  it("calcula o período anterior de mesmo tamanho", () => {
    const setembro = resolverPeriodo({ p: "mes", d: "2026-09-13" });
    expect(periodoAnterior(setembro)).toEqual({ de: "2026-08-01", ate: "2026-08-31" });
  });
});

describe("janela do gráfico", () => {
  it("divide o mês em semanas", () => {
    const janela = janelaDoGrafico(resolverPeriodo({ p: "mes", d: "2026-09-13" }));

    expect(janela.grao).toBe("semana");
    expect(janela.ampliada).toBe(false);
    expect(janela.baldes[0].de).toBe("2026-09-01");
    expect(janela.baldes.at(-1)?.ate).toBe("2026-09-30");
  });

  it("divide a semana em dias", () => {
    const janela = janelaDoGrafico(resolverPeriodo({ p: "semana", d: "2026-09-10" }));
    expect(janela.grao).toBe("dia");
    expect(janela.baldes).toHaveLength(7);
  });

  it("divide o ano em meses", () => {
    const janela = janelaDoGrafico(resolverPeriodo({ p: "ano", d: "2026-05-02" }));
    expect(janela.grao).toBe("mes");
    expect(janela.baldes).toHaveLength(12);
  });

  it("amplia para 7 dias quando o período é um único dia", () => {
    // Uma barra sozinha não mostra evolução nenhuma.
    const janela = janelaDoGrafico(resolverPeriodo({ p: "dia", d: "2026-09-13" }));

    expect(janela.ampliada).toBe(true);
    expect(janela.de).toBe("2026-09-07");
    expect(janela.ate).toBe("2026-09-13");
    expect(janela.baldes).toHaveLength(7);
  });

  it("nunca deixa um balde passar do fim do período", () => {
    const janela = janelaDoGrafico(
      resolverPeriodo({ p: "personalizado", de: "2026-09-03", ate: "2026-10-08" })
    );

    expect(janela.baldes[0].de).toBe("2026-09-03");
    expect(janela.baldes.at(-1)?.ate).toBe("2026-10-08");
  });
});
