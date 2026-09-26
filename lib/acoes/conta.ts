"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { contextoOuNulo } from "@/lib/dados/sessao";
import {
  erroDeValidacao,
  esquemaCodigo,
  esquemaNovoEmail,
  esquemaTelefone,
  esquemaTrocaDeSenha,
} from "@/lib/esquemas";
import { falha, sucesso, type Resultado } from "@/lib/tipos";
import { erroDeBanco, SEM_SESSAO } from "./comum";

/* =============================================================================
   Conta — foto, telefone, senha e e-mail

   Tudo o que é "sobre você", não sobre dinheiro. Cada ação confere a sessão de
   novo: uma Server Action é um POST acessível sem passar pela tela.

   Os textos de erro nunca repassam a mensagem do Supabase. "Invalid login
   credentials" não ajuda ninguém e algumas mensagens revelam demais.
   ========================================================================== */

const LIMITE_DA_FOTO = 512 * 1024;
const TIPOS_DE_FOTO: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function revalidarPerfil(): void {
  // A foto e o nome aparecem no menu de toda tela, que vive no layout.
  revalidatePath("/", "layout");
}

async function urlBase(): Promise<string> {
  const configurada = process.env.NEXT_PUBLIC_URL_DO_APP;
  if (configurada) return configurada.replace(/\/$/, "");

  const cabecalhos = await headers();
  const host = cabecalhos.get("x-forwarded-host") ?? cabecalhos.get("host") ?? "localhost:3000";
  const protocolo = host.startsWith("localhost") ? "http" : "https";
  return `${protocolo}://${host}`;
}

/* =============================================================================
   Foto de perfil
   ========================================================================== */

export async function enviarFoto(formulario: FormData): Promise<Resultado> {
  const arquivo = formulario.get("foto");
  if (!(arquivo instanceof File) || arquivo.size === 0) return falha("Escolha uma imagem.");

  const extensao = TIPOS_DE_FOTO[arquivo.type];
  if (!extensao) return falha("Use uma imagem JPG, PNG ou WebP.");
  if (arquivo.size > LIMITE_DA_FOTO) return falha("A imagem passou de 512 KB.");

  const contexto = await contextoOuNulo();
  if (!contexto) return falha(SEM_SESSAO);
  const { supabase, usuario } = contexto;

  const { data: atual } = await supabase
    .from("perfis")
    .select("foto_path")
    .eq("id", usuario.id)
    .maybeSingle();

  // Nome novo a cada envio: a URL muda junto e nenhum cache serve a foto velha.
  const caminho = `${usuario.id}/${Date.now()}.${extensao}`;

  const envio = await supabase.storage
    .from("avatars")
    .upload(caminho, arquivo, { contentType: arquivo.type, upsert: false });

  if (envio.error) {
    console.error("[raiz] enviar foto:", envio.error.message);
    return falha("Não foi possível enviar a foto. Tente de novo.");
  }

  const { error } = await supabase
    .from("perfis")
    .update({ foto_path: caminho })
    .eq("id", usuario.id);

  if (error) {
    await supabase.storage.from("avatars").remove([caminho]);
    return erroDeBanco(error, "salvar a foto");
  }

  const anterior = atual?.foto_path as string | null | undefined;
  if (anterior) await supabase.storage.from("avatars").remove([anterior]);

  revalidarPerfil();
  return sucesso();
}

export async function removerFoto(): Promise<Resultado> {
  const contexto = await contextoOuNulo();
  if (!contexto) return falha(SEM_SESSAO);
  const { supabase, usuario } = contexto;

  const { data: atual } = await supabase
    .from("perfis")
    .select("foto_path")
    .eq("id", usuario.id)
    .maybeSingle();

  const { error } = await supabase
    .from("perfis")
    .update({ foto_path: null })
    .eq("id", usuario.id);

  if (error) return erroDeBanco(error, "remover a foto");

  const anterior = atual?.foto_path as string | null | undefined;
  if (anterior) await supabase.storage.from("avatars").remove([anterior]);

  revalidarPerfil();
  return sucesso();
}

/* =============================================================================
   Telefone — não pede nenhuma confirmação
   ========================================================================== */

export async function atualizarTelefone(telefone: string): Promise<Resultado> {
  const analise = esquemaTelefone.safeParse(telefone);
  if (!analise.success) return erroDeValidacao(analise.error);

  const contexto = await contextoOuNulo();
  if (!contexto) return falha(SEM_SESSAO);

  const { error } = await contexto.supabase
    .from("perfis")
    .update({ telefone: analise.data })
    .eq("id", contexto.usuario.id);

  if (error) return erroDeBanco(error, "salvar o telefone");

  revalidarPerfil();
  return sucesso();
}

/* =============================================================================
   Senha — exige a atual
   ========================================================================== */

export async function alterarSenha(entrada: unknown): Promise<Resultado> {
  const analise = esquemaTrocaDeSenha.safeParse(entrada);
  if (!analise.success) return erroDeValidacao(analise.error);

  const contexto = await contextoOuNulo();
  if (!contexto) return falha(SEM_SESSAO);
  const { supabase, usuario } = contexto;

  if (!usuario.email) return falha("Sua conta não tem um e-mail para validar a senha.");

  // Prova de que quem está na tela sabe a senha atual. Entrar de novo com ela
  // é o jeito de conferir sem depender de nenhuma API especial.
  const conferencia = await supabase.auth.signInWithPassword({
    email: usuario.email,
    password: analise.data.atual,
  });

  if (conferencia.error) {
    if (conferencia.error.code === "over_request_rate_limit") {
      return falha("Muitas tentativas seguidas. Espere um minuto e tente de novo.");
    }
    return falha("A senha atual não confere.", "atual");
  }

  const { error } = await supabase.auth.updateUser({ password: analise.data.nova });

  if (error) {
    if (error.code === "same_password") {
      return falha("A nova senha precisa ser diferente da atual.", "nova");
    }
    if (error.code === "weak_password") {
      return falha("Escolha uma senha mais forte, com pelo menos 8 caracteres.", "nova");
    }
    console.error("[raiz] alterar senha:", error.code, error.message);
    return falha("Não foi possível alterar a senha. Tente de novo.");
  }

  return sucesso();
}

/* =============================================================================
   E-mail — código no endereço antigo e depois no novo

   Usa o "secure email change" do Supabase: o pedido dispara um código para o
   e-mail atual e outro para o novo, e a troca só vale depois que os dois
   forem confirmados. A tela pede um de cada vez, na ordem: antigo, novo.

   Requer que o modelo do e-mail "Change Email Address" mostre `{{ .Token }}`
   (ver a mensagem de entrega desta funcionalidade).
   ========================================================================== */

function traduzirErroDeEmail(erro: { code?: string; message: string }): string {
  if (erro.code === "email_exists") return "Esse e-mail já tem uma conta.";
  if (erro.code === "over_email_send_rate_limit" || erro.message.toLowerCase().includes("rate limit")) {
    return "Muitos e-mails enviados seguidos. Espere alguns minutos e tente de novo.";
  }
  if (erro.code === "otp_expired" || erro.message.toLowerCase().includes("expired")) {
    return "O código expirou. Volte e peça um novo.";
  }
  if (erro.code === "validation_failed" || erro.message.toLowerCase().includes("invalid")) {
    return "Código incorreto.";
  }
  console.error("[raiz] troca de e-mail:", erro.code, erro.message);
  return "Não foi possível concluir agora. Tente de novo em instantes.";
}

export async function pedirTrocaDeEmail(entrada: unknown): Promise<Resultado> {
  const analise = esquemaNovoEmail.safeParse(entrada);
  if (!analise.success) return erroDeValidacao(analise.error);

  const contexto = await contextoOuNulo();
  if (!contexto) return falha(SEM_SESSAO);
  const { supabase, usuario } = contexto;

  if (analise.data.email === usuario.email?.toLowerCase()) {
    return falha("Esse já é o seu e-mail atual.", "email");
  }

  const { error } = await supabase.auth.updateUser(
    { email: analise.data.email },
    { emailRedirectTo: `${await urlBase()}/auth/confirmar?destino=/perfil` }
  );

  if (error) return falha(traduzirErroDeEmail(error), "email");
  return sucesso();
}

/** Passo 1: código que chegou no e-mail ANTIGO. */
export async function confirmarCodigoDoEmailAntigo(codigo: string): Promise<Resultado> {
  const analise = esquemaCodigo.safeParse(codigo);
  if (!analise.success) return erroDeValidacao(analise.error);

  const contexto = await contextoOuNulo();
  if (!contexto) return falha(SEM_SESSAO);
  const { supabase, usuario } = contexto;

  if (!usuario.email) return falha("Sua conta não tem um e-mail atual.");

  const { error } = await supabase.auth.verifyOtp({
    email: usuario.email,
    token: analise.data,
    type: "email_change",
  });

  if (error) return falha(traduzirErroDeEmail(error), "codigo");
  return sucesso();
}

/** Passo 2: código que chegou no e-mail NOVO. Conclui a troca. */
export async function confirmarCodigoDoEmailNovo(
  novoEmail: string,
  codigo: string
): Promise<Resultado> {
  const email = esquemaNovoEmail.safeParse({ email: novoEmail });
  if (!email.success) return erroDeValidacao(email.error);
  const analise = esquemaCodigo.safeParse(codigo);
  if (!analise.success) return erroDeValidacao(analise.error);

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    email: email.data.email,
    token: analise.data,
    type: "email_change",
  });

  if (error) return falha(traduzirErroDeEmail(error), "codigo");

  revalidarPerfil();
  return sucesso();
}
