"use server";

import { revalidatePath } from "next/cache";
import { contextoOuNulo } from "@/lib/dados/sessao";
import { chamarFuncao } from "@/lib/supabase/funcoes";
import {
  erroDeValidacao,
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
   E-mail

   A troca vale na hora e não manda e-mail de confirmação: quem a executa é a
   função `alterar-email`, dentro do Supabase, com a chave de serviço.

   O endereço antigo nunca é consultado, e por isso a senha atual é exigida
   (e conferida pela própria função): é ela que impede que uma sessão
   esquecida aberta redirecione a conta.
   ========================================================================== */

export async function pedirTrocaDeEmail(entrada: unknown): Promise<Resultado> {
  const analise = esquemaNovoEmail.safeParse(entrada);
  if (!analise.success) return erroDeValidacao(analise.error);

  const contexto = await contextoOuNulo();
  if (!contexto) return falha(SEM_SESSAO);
  const { supabase } = contexto;

  const { data: sessao } = await supabase.auth.getSession();
  const token = sessao.session?.access_token;
  if (!token) return falha(SEM_SESSAO);

  // A função confere o token E a senha atual por conta própria — não confia em
  // que este app já o fez. É ela que troca o e-mail, sem enviar confirmação.
  const resposta = await chamarFuncao(
    "alterar-email",
    { email: analise.data.email, senha: analise.data.senha },
    token
  );

  if (!resposta.ok) return falha(resposta.erro, resposta.campo);

  // As claims da sessão ainda carregam o e-mail antigo: renova para o novo.
  await supabase.auth.refreshSession();

  revalidarPerfil();
  return sucesso();
}
