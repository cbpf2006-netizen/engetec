"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  erroDeValidacao,
  esquemaCadastro,
  esquemaEmail,
  esquemaEntrar,
  esquemaSenha,
} from "@/lib/esquemas";

/* =============================================================================
   Conta de acesso

   Estes formulários usam <form action={...}> com useActionState, e não um
   handler de onClick: assim o navegador consegue enviar o formulário antes do
   JavaScript carregar, e o estado de "enviando" sai de graça do próprio React.

   Nenhuma mensagem do Supabase chega crua à tela. "Invalid login
   credentials" não ajuda ninguém, e algumas mensagens diferenciam "usuário
   não existe" de "senha errada" — o que entrega quais e-mails têm conta aqui.
   ========================================================================== */

export type EstadoFormulario = {
  erro?: string;
  campo?: string;
  aviso?: string;
} | null;

function traduzirErro(mensagem: string, codigo?: string): string {
  const texto = mensagem.toLowerCase();

  if (codigo === "invalid_credentials" || texto.includes("invalid login credentials")) {
    return "E-mail ou senha incorretos.";
  }
  if (codigo === "email_not_confirmed" || texto.includes("email not confirmed")) {
    return "Confirme seu e-mail pelo link que enviamos antes de entrar.";
  }
  if (codigo === "user_already_exists" || texto.includes("already registered")) {
    return "Esse e-mail já tem conta. Entre em vez de se cadastrar.";
  }
  if (codigo === "weak_password" || texto.includes("password should be")) {
    return "Escolha uma senha mais forte, com pelo menos 8 caracteres.";
  }
  if (codigo === "over_email_send_rate_limit" || texto.includes("rate limit")) {
    return "Muitas tentativas seguidas. Espere um minuto e tente de novo.";
  }
  if (codigo === "same_password" || texto.includes("should be different")) {
    return "A nova senha precisa ser diferente da anterior.";
  }

  console.error("[raiz] autenticação:", codigo, mensagem);
  return "Não foi possível concluir agora. Tente de novo em instantes.";
}

/** Endereço público do app, para montar o link que volta do e-mail. Em
    produção vem da variável; em desenvolvimento, do próprio cabeçalho da
    requisição. */
async function urlBase(): Promise<string> {
  const configurada = process.env.NEXT_PUBLIC_URL_DO_APP;
  if (configurada) return configurada.replace(/\/$/, "");

  const cabecalhos = await headers();
  const host = cabecalhos.get("x-forwarded-host") ?? cabecalhos.get("host") ?? "localhost:3000";
  const protocolo = host.startsWith("localhost") ? "http" : "https";
  return `${protocolo}://${host}`;
}

/* =============================================================================
   Entrar / cadastrar / sair
   ========================================================================== */

export async function entrar(
  _anterior: EstadoFormulario,
  formulario: FormData
): Promise<EstadoFormulario> {
  const analise = esquemaEntrar.safeParse({
    email: formulario.get("email"),
    senha: formulario.get("senha"),
  });

  if (!analise.success) {
    const resultado = erroDeValidacao(analise.error);
    return { erro: resultado.erro, campo: resultado.campo };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: analise.data.email,
    password: analise.data.senha,
  });

  if (error) return { erro: traduzirErro(error.message, error.code) };

  const destino = String(formulario.get("destino") || "/");
  revalidatePath("/", "layout");
  redirect(destino.startsWith("/") ? destino : "/");
}

export async function cadastrar(
  _anterior: EstadoFormulario,
  formulario: FormData
): Promise<EstadoFormulario> {
  const analise = esquemaCadastro.safeParse({
    nome: formulario.get("nome"),
    email: formulario.get("email"),
    telefone: formulario.get("telefone") ?? "",
    senha: formulario.get("senha"),
    confirmacao: formulario.get("confirmacao") ?? "",
    indicado_por: formulario.get("indicado_por") ?? "",
  });

  if (!analise.success) {
    const resultado = erroDeValidacao(analise.error);
    return { erro: resultado.erro, campo: resultado.campo };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: analise.data.email,
    password: analise.data.senha,
    options: {
      // Lido pelo trigger `ao_criar_usuario` para preencher o perfil. Só nome,
      // telefone e indicação: papel e acesso jamais vêm daqui (o cliente
      // escreve estes metadados, então não podem conceder privilégio).
      data: {
        nome: analise.data.nome,
        telefone: analise.data.telefone,
        indicado_por: analise.data.indicado_por,
      },
      // Quem ainda não pagou cai na tela de pagamento; quem já foi liberado é
      // devolvido ao app por ela.
      emailRedirectTo: `${await urlBase()}/auth/confirmar?destino=/pagamento`,
    },
  });

  if (error) return { erro: traduzirErro(error.message, error.code) };

  // Com a confirmação por e-mail desligada no projeto, signUp já abre a sessão
  // e a pessoa segue para a tela de pagamento. Ligada, ele não abre sessão e
  // resta o aviso do link.
  if (!data.session) {
    return {
      aviso: `Enviamos um link de confirmação para ${analise.data.email}. Abra o e-mail e clique no link — a confirmação é feita só por ele.`,
    };
  }

  revalidatePath("/", "layout");
  // Conta nova nasce pendente: o lugar dela é a tela de pagamento.
  redirect("/pagamento");
}

export async function sair(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

/* =============================================================================
   Recuperação de senha
   ========================================================================== */

export async function pedirRecuperacao(
  _anterior: EstadoFormulario,
  formulario: FormData
): Promise<EstadoFormulario> {
  const analise = esquemaEmail.safeParse(formulario.get("email"));
  if (!analise.success) return { erro: "Informe um e-mail válido.", campo: "email" };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(analise.data, {
    redirectTo: `${await urlBase()}/auth/confirmar?destino=/nova-senha`,
  });

  // Só o limite de envio é reportado. Dizer "esse e-mail não existe" seria
  // contar a estranhos quem tem conta aqui — a resposta é a mesma nos dois
  // casos.
  if (error && error.code === "over_email_send_rate_limit") {
    return { erro: traduzirErro(error.message, error.code) };
  }
  if (error) console.error("[raiz] recuperação:", error.code, error.message);

  return {
    aviso: `Se existir uma conta com ${analise.data}, o link para criar uma nova senha já está no caminho.`,
  };
}

export async function definirNovaSenha(
  _anterior: EstadoFormulario,
  formulario: FormData
): Promise<EstadoFormulario> {
  const senha = esquemaSenha.safeParse(formulario.get("senha"));
  if (!senha.success) {
    const resultado = erroDeValidacao(senha.error);
    return { erro: resultado.erro, campo: "senha" };
  }

  if (formulario.get("senha") !== formulario.get("confirmacao")) {
    return { erro: "As duas senhas não são iguais.", campo: "confirmacao" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      erro: "O link expirou. Peça um novo e-mail de recuperação para continuar.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password: senha.data });
  if (error) return { erro: traduzirErro(error.message, error.code) };

  revalidatePath("/", "layout");
  redirect("/");
}
