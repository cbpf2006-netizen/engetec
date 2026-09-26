/* =============================================================================
   Bloqueio do app com a tela do aparelho (Face ID, digital ou senha)

   Depois de LIMITE_MS fora do app, ao voltar pede a confirmação do aparelho.
   Usa WebAuthn com autenticador da plataforma e `userVerification: "required"`:
   é o que faz o iPhone abrir o Face ID / Touch ID e cair na senha do aparelho
   quando a biometria não está disponível ou falha.

   O que isto é — e o que não é. É um bloqueio de TELA, de privacidade, como o
   de apps de banco: impede quem pegou o celular desbloqueado e abriu o Raiz.
   Não é autenticação no servidor: a sessão do Supabase continua a mesma, e a
   verificação não confere a assinatura no servidor (não há servidor nessa
   conversa). Quem controla o navegador do aparelho pode contorná-lo; quem
   controla só o aparelho trancado, não.

   Tudo fica no aparelho (localStorage), nada vai para o banco: o bloqueio é
   ligado por aparelho, não por conta. localStorage pode lançar (janela
   privada, dados bloqueados) e toda leitura é protegida — falhar aqui nunca
   pode trancar ninguém fora do app.
   ========================================================================== */

export const LIMITE_MS = 5 * 60 * 1000;

const CH_CREDENCIAL = "raiz:bloqueio-credencial";
const CH_VISTO = "raiz:bloqueio-visto";

function ler(chave: string): string | null {
  try {
    return window.localStorage.getItem(chave);
  } catch {
    return null;
  }
}

function gravar(chave: string, valor: string | null): void {
  try {
    if (valor === null) window.localStorage.removeItem(chave);
    else window.localStorage.setItem(chave, valor);
  } catch {
    /* sem armazenamento: o bloqueio simplesmente não liga */
  }
}

/* ------------------------------------------------------------------ estado */

export function bloqueioAtivo(): boolean {
  return ler(CH_CREDENCIAL) !== null;
}

/** Marca "agora" como o último momento em que o app esteve à vista. */
export function marcarVisto(): void {
  gravar(CH_VISTO, String(Date.now()));
}

/** Esquece o último uso. Chamado ao sair da conta: sem isso, quem entra de novo
    horas depois cairia direto na tela de bloqueio, logo após digitar a senha. */
export function esquecerUltimoUso(): void {
  gravar(CH_VISTO, null);
}

/** Passou tempo demais fora do app? Sem registro (primeira vez) não bloqueia. */
export function passouDoLimite(): boolean {
  const visto = Number(ler(CH_VISTO));
  return Number.isFinite(visto) && visto > 0 && Date.now() - visto >= LIMITE_MS;
}

/** Deve abrir trancado? Só se o bloqueio estiver ligado E o limite estourado. */
export function deveTrancar(): boolean {
  return bloqueioAtivo() && passouDoLimite();
}

/* ---------------------------------------------------------------- WebAuthn */

function bytesAleatorios(tamanho: number): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(new ArrayBuffer(tamanho));
  crypto.getRandomValues(bytes);
  return bytes;
}

function paraBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let texto = "";
  for (const byte of bytes) texto += String.fromCharCode(byte);
  return btoa(texto).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function deBase64Url(texto: string): Uint8Array<ArrayBuffer> {
  const base64 = texto.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (texto.length % 4)) % 4);
  const binario = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(binario.length));
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return bytes;
}

/** O aparelho tem Face ID / digital / senha utilizáveis para isto? */
export async function bloqueioSuportado(): Promise<boolean> {
  try {
    if (typeof window === "undefined" || !window.PublicKeyCredential) return false;
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

/** Liga o bloqueio: cria uma credencial do aparelho (aqui o Face ID/digital já
    é pedido uma vez). Devolve false se a pessoa cancelar ou o aparelho recusar. */
export async function ativarBloqueio(usuario: {
  id: string;
  email: string;
  nome: string;
}): Promise<boolean> {
  try {
    const credencial = (await navigator.credentials.create({
      publicKey: {
        rp: { name: "Raiz" },
        user: {
          id: new TextEncoder().encode(usuario.id),
          name: usuario.email,
          displayName: usuario.nome || usuario.email,
        },
        challenge: bytesAleatorios(32),
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 },
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "discouraged",
        },
        attestation: "none",
        timeout: 60_000,
      },
    })) as PublicKeyCredential | null;

    if (!credencial) return false;

    gravar(CH_CREDENCIAL, paraBase64Url(credencial.rawId));
    marcarVisto();
    return true;
  } catch {
    return false;
  }
}

export function desativarBloqueio(): void {
  gravar(CH_CREDENCIAL, null);
  gravar(CH_VISTO, null);
}

/** Pede a confirmação do aparelho. true = a pessoa passou. */
export async function verificarBloqueio(): Promise<boolean> {
  const salva = ler(CH_CREDENCIAL);
  if (!salva) return true;

  try {
    const resposta = await navigator.credentials.get({
      publicKey: {
        challenge: bytesAleatorios(32),
        allowCredentials: [{ id: deBase64Url(salva), type: "public-key", transports: ["internal"] }],
        userVerification: "required",
        timeout: 60_000,
      },
    });
    return resposta !== null;
  } catch {
    return false;
  }
}

/** Script que roda ANTES da primeira pintura e marca o <html> quando o app deve
    abrir trancado, para o conteúdo não aparecer por um instante antes de o
    React assumir. Mantém as mesmas chaves e o mesmo limite deste módulo. */
export const SCRIPT_DE_PRE_BLOQUEIO = `(function(){try{var c=localStorage.getItem(${JSON.stringify(
  CH_CREDENCIAL
)});var v=Number(localStorage.getItem(${JSON.stringify(
  CH_VISTO
)}));if(c&&v>0&&Date.now()-v>=${LIMITE_MS}){document.documentElement.setAttribute('data-bloqueado','1')}}catch(e){}})();`;
