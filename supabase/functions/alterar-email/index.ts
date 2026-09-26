import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

/* Troca de e-mail sem confirmação por e-mail.
 *
 * A autenticação é feita AQUI, à mão (verify_jwt desligado porque as chaves
 * "publishable" do projeto não são JWT): o token de sessão do usuário vem no
 * cabeçalho Authorization e é validado por getUser(). Além do token, a função
 * confere a SENHA ATUAL por conta própria — não confia que o app já o fez.
 * Sem confirmação no endereço antigo, o token sozinho não pode bastar: quem
 * achasse uma sessão aberta redirecionaria a conta e pediria a recuperação de
 * senha no endereço novo.
 *
 * A chave de serviço só existe aqui dentro.
 */

const CABECALHOS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function resposta(corpo: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(corpo), { status, headers: CABECALHOS });
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CABECALHOS });
  if (req.method !== "POST") return resposta({ erro: "Método não permitido." }, 405);

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return resposta({ erro: "Sua sessão expirou. Entre novamente." }, 401);

  let corpo: Record<string, unknown>;
  try {
    corpo = await req.json();
  } catch {
    return resposta({ erro: "Requisição inválida." }, 400);
  }

  const novoEmail = String(corpo.email ?? "").trim().toLowerCase();
  const senha = String(corpo.senha ?? "");

  if (!EMAIL.test(novoEmail) || novoEmail.length > 254) {
    return resposta({ erro: "Informe um e-mail válido.", campo: "email" }, 400);
  }
  if (!senha) return resposta({ erro: "Informe sua senha atual.", campo: "senha" }, 400);

  const url = Deno.env.get("SUPABASE_URL")!;
  const opcoes = { auth: { autoRefreshToken: false, persistSession: false } };
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, opcoes);

  // Quem é, segundo o token — validado no servidor de autenticação.
  const { data: sessao, error: erroDoToken } = await admin.auth.getUser(token);
  const usuario = sessao?.user;
  if (erroDoToken || !usuario?.email) {
    return resposta({ erro: "Sua sessão expirou. Entre novamente." }, 401);
  }

  if (novoEmail === usuario.email.toLowerCase()) {
    return resposta({ erro: "Esse já é o seu e-mail atual.", campo: "email" }, 400);
  }

  // Senha atual, conferida com um cliente sem persistência de sessão.
  const anonima = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, opcoes);
  const { error: erroDaSenha } = await anonima.auth.signInWithPassword({
    email: usuario.email,
    password: senha,
  });
  if (erroDaSenha) {
    return resposta({ erro: "A senha atual não confere.", campo: "senha" }, 403);
  }

  const { error } = await admin.auth.admin.updateUserById(usuario.id, {
    email: novoEmail,
    email_confirm: true,
  });

  if (error) {
    if (error.code === "email_exists" || /already|registered|exists/i.test(error.message)) {
      return resposta({ erro: "Esse e-mail já tem uma conta.", campo: "email" }, 409);
    }
    console.error("[alterar-email]", error.code, error.message);
    return resposta({ erro: "Não foi possível alterar o e-mail agora. Tente de novo." }, 500);
  }

  return resposta({ ok: true }, 200);
});
