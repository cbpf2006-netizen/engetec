/* =============================================================================
   Validação — um esquema por operação de escrita

   Os mesmos esquemas valem para o formulário e para a Server Action. Uma
   Server Action é um endpoint POST de verdade: dá para chamá-la sem passar
   pela interface, então validar só no cliente não valida nada.
   ========================================================================== */

import { z } from "zod";
import { paraNumero } from "./formato";
import { ehDataValida } from "./periodo";
import { ICONES, CORES } from "./catalogo";
import { falha, type Falha } from "./tipos";

/** Aceita "1.250,00", "1250.5" ou 1250.5 e devolve centavos exatos. O limite
    superior existe para um dedo escorregando no teclado numérico não gravar
    uma fortuna que depois estoura o numeric(14,2). */
export const valor = z
  .union([z.string(), z.number()])
  .transform((entrada) => paraNumero(entrada))
  .refine((n) => Number.isFinite(n), "Informe um valor.")
  .refine((n) => n > 0, "O valor precisa ser maior que zero.")
  .refine((n) => n <= 999_999_999.99, "Valor acima do limite.")
  .transform((n) => Math.round(n * 100) / 100);

export const dataIso = z
  .string()
  .refine(ehDataValida, "Informe uma data válida.");

export const observacao = z
  .string()
  .trim()
  .max(280, "A observação passou de 280 caracteres.")
  .transform((texto) => texto || null)
  .nullable()
  .catch(null);

export const modeloId = z
  .union([z.string().uuid(), z.literal("")])
  .transform((v) => (v === "" ? null : v));

export const fluxoTransacao = z.enum(["entrada", "saida"]);

/* =============================================================================
   Lançamentos
   ========================================================================== */

/** Obrigatória em toda entrada e saída, e na criação de um tipo de
    investimento (que a repassa aos seus aportes): saber quanto entrou sem
    saber onde o dinheiro ficou deixa o saldo por carteira impossível de
    reconstruir. */
export const carteiraId = z.string().uuid("Escolha a carteira.");

export const esquemaTransacao = z.object({
  fluxo: fluxoTransacao,
  modelo_id: z.string().uuid(),
  carteira_id: carteiraId,
  valor,
  data: dataIso,
  observacao,
});

export const esquemaInvestimento = z.object({
  operacao: z.enum(["aporte", "resgate"]).default("aporte"),
  modelo_id: z.string().uuid(),
  valor,
  data: dataIso,
  observacao,
});

export const esquemaConta = z.object({
  nome: z
    .string()
    .trim()
    .min(1, "Dê um nome para a conta.")
    .max(60, "O nome passou de 60 caracteres."),
  modelo_id: modeloId,
  valor,
  vencimento: z.union([dataIso, z.literal("")]).transform((v) => (v === "" ? null : v)).nullable(),
  observacao,
});

/* =============================================================================
   Carteiras
   ========================================================================== */

export const esquemaCarteira = z.object({
  nome: z
    .string()
    .trim()
    .min(1, "Dê um nome à carteira.")
    .max(40, "O nome passou de 40 caracteres."),
});

/* =============================================================================
   Modelos
   ========================================================================== */

const apelidosDeIcone: readonly string[] = ICONES;
const apelidosDeCor: readonly string[] = CORES.map((c) => c.apelido);

export const esquemaModelo = z.object({
  fluxo: z.enum(["entrada", "saida", "investimento"]),
  nome: z
    .string()
    .trim()
    .min(1, "Dê um nome ao modelo.")
    .max(40, "O nome passou de 40 caracteres."),
  icone: z
    .string()
    .refine((v) => apelidosDeIcone.includes(v), "Ícone inválido.")
    .catch("circulo"),
  cor: z
    .string()
    .refine((v) => apelidosDeCor.includes(v), "Cor inválida.")
    .catch("verde"),
  carteira_id: z.string().uuid().nullable().optional(),
}).refine((modelo) => modelo.fluxo !== "investimento" || Boolean(modelo.carteira_id), {
  message: "Escolha a carteira.",
  path: ["carteira_id"],
});

/* =============================================================================
   Conta de acesso
   ========================================================================== */

export const esquemaEmail = z
  .string()
  .trim()
  .toLowerCase()
  .email("Informe um e-mail válido.");

export const esquemaSenha = z
  .string()
  .min(8, "A senha precisa de pelo menos 8 caracteres.")
  .max(72, "A senha passou de 72 caracteres.");

export const esquemaEntrar = z.object({
  email: esquemaEmail,
  senha: z.string().min(1, "Informe sua senha."),
});

export const esquemaCadastro = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Informe seu nome.")
    .max(60, "O nome passou de 60 caracteres."),
  email: esquemaEmail,
  senha: esquemaSenha,
});

export const esquemaPerfil = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Informe seu nome.")
    .max(60, "O nome passou de 60 caracteres."),
});

/** Telefone: só os dígitos (DDD + número, 10 ou 11). Vazio limpa o campo. A
    máscara "(11) 91234-5678" é da interface; o banco guarda o número puro. */
export const esquemaTelefone = z
  .string()
  .transform((texto) => texto.replace(/\D/g, ""))
  .refine((digitos) => digitos === "" || /^\d{10,11}$/.test(digitos), "Informe o DDD e o número.")
  .transform((digitos) => digitos || null);

/** Troca de senha: a atual é exigida para provar que quem está na tela é o
    dono da conta, não só quem achou o celular desbloqueado. */
export const esquemaTrocaDeSenha = z
  .object({
    atual: z.string().min(1, "Informe sua senha atual."),
    nova: esquemaSenha,
    confirmacao: z.string(),
  })
  .refine((dados) => dados.nova === dados.confirmacao, {
    message: "As duas senhas não são iguais.",
    path: ["confirmacao"],
  })
  .refine((dados) => dados.nova !== dados.atual, {
    message: "A nova senha precisa ser diferente da atual.",
    path: ["nova"],
  });

/** Código numérico do e-mail de confirmação. */
export const esquemaCodigo = z
  .string()
  .trim()
  .regex(/^\d{6,10}$/, "Digite o código de 6 dígitos que chegou no e-mail.");

export const esquemaNovoEmail = z.object({ email: esquemaEmail });

/** Primeira mensagem de erro de um safeParse, já no formato de resposta das
    Server Actions. Uma mensagem por vez: a interface destaca o campo culpado
    em vez de despejar a lista inteira. */
export function erroDeValidacao(erro: z.ZodError): Falha {
  const problema = erro.issues[0];
  return falha(problema.message, problema.path.join(".") || undefined);
}
