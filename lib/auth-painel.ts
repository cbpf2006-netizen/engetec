import "server-only";
import { createHmac, timingSafeEqual, createHash } from "crypto";

/* =============================================================
   PORTA DO PAINEL

   Sem Supabase Auth aqui: é um único administrador, então a senha
   fica numa variável de ambiente (PAINEL_SENHA) e a sessão é um
   cookie assinado com HMAC (PAINEL_SESSION_SECRET) — não guarda
   estado nenhum no banco, só uma data de expiração e uma assinatura
   que prova que veio do servidor.

   A comparação da senha passa por SHA-256 antes do timingSafeEqual
   para as duas strings terem sempre o mesmo tamanho — do contrário
   o comprimento da senha certa vazaria pelo tempo de resposta.
   ============================================================= */

export const COOKIE_SESSAO = "engetec_painel_sessao";
const DURACAO_MS = 1000 * 60 * 60 * 24 * 7; // 7 dias

function segredo(): string {
  const valor = process.env.PAINEL_SESSION_SECRET;
  if (!valor) throw new Error("PAINEL_SESSION_SECRET não configurada em .env.local.");
  return valor;
}

function assinar(expiraEm: number): string {
  return createHmac("sha256", segredo()).update(String(expiraEm)).digest("hex");
}

export function senhaConfere(tentativa: string): boolean {
  const esperada = process.env.PAINEL_SENHA;
  if (!esperada) throw new Error("PAINEL_SENHA não configurada em .env.local.");

  const a = createHash("sha256").update(tentativa).digest();
  const b = createHash("sha256").update(esperada).digest();
  return timingSafeEqual(a, b);
}

export function criarValorSessao(): { valor: string; expiraEm: number } {
  const expiraEm = Date.now() + DURACAO_MS;
  return { valor: `${expiraEm}.${assinar(expiraEm)}`, expiraEm };
}

export function sessaoValida(valor: string | undefined): boolean {
  if (!valor) return false;
  const [expiraTexto, assinatura] = valor.split(".");
  if (!expiraTexto || !assinatura) return false;

  const expiraEm = Number(expiraTexto);
  if (!Number.isFinite(expiraEm) || Date.now() > expiraEm) return false;

  const esperada = Buffer.from(assinar(expiraEm));
  const recebida = Buffer.from(assinatura);
  if (esperada.length !== recebida.length) return false;
  return timingSafeEqual(esperada, recebida);
}
