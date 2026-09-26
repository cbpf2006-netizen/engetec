/* =============================================================================
   Formatação — pt-BR em todo lugar

   Datas circulam sempre como "AAAA-MM-DD" (sem fuso, sem hora). Formatar com
   `new Date("2026-09-13")` traria o bug clássico: a string é lida como UTC e,
   em São Paulo (UTC−3), vira 12/09. Por isso a formatação aqui é feita por
   fatiamento de string, não por Date.
   ========================================================================== */

const MOEDA = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const MOEDA_COMPACTA = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

const PORCENTAGEM = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** R$ 1.250,00 */
export function moeda(valor: number): string {
  return MOEDA.format(valor);
}

export const formatBRL = moeda;

/** R$ 1,3 mil — só para eixos de gráfico, onde o rótulo longo não cabe. */
export function moedaCompacta(valor: number): string {
  return MOEDA_COMPACTA.format(valor);
}

/** +12,4% / −5,2% — o sinal é explícito porque a cor sozinha não basta. */
export function variacao(fracao: number): string {
  const texto = PORCENTAGEM.format(Math.abs(fracao));
  if (fracao > 0) return `+${texto}`;
  if (fracao < 0) return `−${texto}`;
  return texto;
}

export function porcentagem(fracao: number): string {
  return PORCENTAGEM.format(fracao);
}

/** 13/09/2026 */
export function data(iso: string): string {
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}

/** 13/09 */
export function dataCurta(iso: string): string {
  const [, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}`;
}

export const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export const MESES_CURTOS = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

const DIAS_SEMANA = [
  "domingo",
  "segunda",
  "terça",
  "quarta",
  "quinta",
  "sexta",
  "sábado",
];

/** "13 de setembro de 2026" */
export function dataPorExtenso(iso: string): string {
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  return `${Number(dia)} de ${MESES[Number(mes) - 1]} de ${ano}`;
}

export function diaDaSemana(iso: string): string {
  const [ano, mes, dia] = iso.slice(0, 10).split("-").map(Number);
  return DIAS_SEMANA[new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay()];
}

/** "Bom dia" / "Boa tarde" / "Boa noite" no fuso de quem usa o app — não no
    do servidor, que em produção roda em UTC e daria "boa noite" às 21h de
    Brasília virando "madrugada" às 0h UTC. */
export function saudacao(): string {
  const hora = Number(
    new Date().toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      hour12: false,
    })
  );

  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

/** Maiúscula só na primeira letra — "Setembro de 2026", não "SETEMBRO". */
export function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/* =============================================================================
   Entrada de valores

   O campo de dinheiro é digitado como texto livre ("1.250,00", "1250,5",
   "R$ 80"). Normalizar no cliente E no servidor: o schema Zod usa esta mesma
   função, então as duas pontas concordam sobre o que "1.250,00" significa.
   ========================================================================== */

export function paraNumero(entrada: string | number): number {
  if (typeof entrada === "number") return entrada;

  const limpo = entrada
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}\b)/g, "") // separador de milhar
    .replace(",", ".");

  const numero = Number(limpo);
  return Number.isFinite(numero) ? numero : NaN;
}

/** Máscara progressiva enquanto digita: "125000" vira "1.250,00". Trabalha
    em centavos para nunca perder precisão no caminho. */
export function mascaraMoeda(bruto: string): string {
  const digitos = bruto.replace(/\D/g, "").slice(0, 12);
  if (!digitos) return "";

  const centavos = Number(digitos);
  return (centavos / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Iniciais para o avatar: primeiro nome e sobrenome — "Ana Paula Souza" → "AS".
    Nome de uma palavra só dá uma letra. Sem nome, cai no e-mail. */
export function iniciais(nome: string | null, email: string): string {
  const partesDoNome = nome?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (partesDoNome.length > 0) {
    const primeira = partesDoNome[0][0];
    const ultima = partesDoNome.length > 1 ? partesDoNome[partesDoNome.length - 1][0] : "";
    return (primeira + ultima).toUpperCase();
  }

  const partes = email.split(/[@.]+/).filter(Boolean);
  return (partes[0]?.[0] ?? "?").concat(partes[1]?.[0] ?? "").toUpperCase();
}

/** Só os dígitos, no máximo 11 (DDD + celular). */
export function soDigitos(texto: string): string {
  return texto.replace(/\D/g, "").slice(0, 11);
}

/** "11912345678" → "(11) 91234-5678". Aceita entrada parcial, para a máscara
    acompanhar a digitação sem pular. */
export function mascaraTelefone(texto: string): string {
  const d = soDigitos(texto);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** O mesmo texto de `moeda`, separado em símbolo, inteiro e centavos — para a
    interface poder dar peso ao que importa (o inteiro) e recuar o resto.
    `moeda(-1250.5)` e `partesDaMoeda(-1250.5)` descrevem a mesma string. */
export function partesDaMoeda(valor: number): {
  negativo: boolean;
  simbolo: string;
  inteiro: string;
  centavos: string;
} {
  let negativo = false;
  let simbolo = "R$";
  let inteiro = "";
  let centavos = "";

  for (const parte of MOEDA.formatToParts(valor)) {
    if (parte.type === "minusSign") negativo = true;
    else if (parte.type === "currency") simbolo = parte.value;
    else if (parte.type === "integer" || parte.type === "group") inteiro += parte.value;
    else if (parte.type === "decimal" || parte.type === "fraction") centavos += parte.value;
  }

  return { negativo, simbolo, inteiro, centavos };
}
