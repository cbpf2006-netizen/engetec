/* =============================================================================
   Bloqueio do app com a tela do aparelho (Face ID, digital ou senha)

   Duas regras, as duas pedem a confirmação do aparelho:

     1. App FECHADO e aberto de novo (a aba/janela foi encerrada): bloqueia
        sempre, na hora, por menos que tenha sido o intervalo.
     2. App só em segundo plano (a pessoa foi para outro app e voltou, sem
        fechar): bloqueia se passou LIMITE_MS fora — 1 minuto.

   Como distinguir "fechou" de "só saiu": sessionStorage. Ele sobrevive a ir para
   segundo plano e voltar, e some quando a aba/janela é encerrada. Sem a marca
   dele na abertura, o app foi fechado no meio.
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

export const LIMITE_MS = 60 * 1000;

const CH_CREDENCIAL = "raiz:bloqueio-credencial";
const CH_VISTO = "raiz:bloqueio-visto";
const CH_SESSAO = "raiz:bloqueio-sessao";

function lerSessao(): boolean {
  try {
    return window.sessionStorage.getItem(CH_SESSAO) === "1";
  } catch {
    return false;
  }
}

function gravarSessao(valor: boolean): void {
  try {
    if (valor) window.sessionStorage.setItem(CH_SESSAO, "1");
    else window.sessionStorage.removeItem(CH_SESSAO);
  } catch {
    /* sem sessionStorage: cada abertura conta como app fechado */
  }
}

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

/** Começa (ou renova) o uso desbloqueado: marca esta aba como já aberta e o
    instante de agora. Chamado ao ligar o bloqueio, ao desbloquear e na primeira
    abertura sem histórico (logo depois de entrar na conta). */
export function iniciarUso(): void {
  gravarSessao(true);
  marcarVisto();
}

/** Deve abrir/voltar trancado?
    Precisa haver um uso anterior registrado (`visto`): sem ele — primeira vez,
    ou logo depois de entrar na conta — não há o que proteger e não trava
    ninguém na cara de quem acabou de digitar a senha. Havendo, tranca se a
    aba foi fechada (sem a marca da sessão) OU se passou do limite fora. */
export function deveTrancar(): boolean {
  if (!bloqueioAtivo()) return false;

  const visto = Number(ler(CH_VISTO));
  if (!Number.isFinite(visto) || visto <= 0) return false;

  return !lerSessao() || passouDoLimite();
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
    iniciarUso();
    return true;
  } catch {
    return false;
  }
}

export function desativarBloqueio(): void {
  gravar(CH_CREDENCIAL, null);
  gravar(CH_VISTO, null);
  gravarSessao(false);
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
)}));var s=sessionStorage.getItem(${JSON.stringify(
  CH_SESSAO
)})==='1';if(c&&v>0&&(!s||Date.now()-v>=${LIMITE_MS})){document.documentElement.setAttribute('data-bloqueado','1')}}catch(e){}})();`;
