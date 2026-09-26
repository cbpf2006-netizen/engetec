import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

/* Exclusão da PRÓPRIA conta, feita pelo dono.
 *
 * Apaga a conta e tudo o que é dela (as tabelas apontam para auth.users com ON
 * DELETE CASCADE), mais a foto de perfil. O e-mail volta a ficar livre: a pessoa
 * pode se cadastrar de novo e começar do zero, como pendente.
 *
 * verify_jwt está desligado porque as chaves "publishable" do projeto não são
 * JWT; a autenticação é feita aqui, à mão. O token de sessão é validado por
 * getUser() E a senha atual é conferida por conta própria — excluir a conta não
 * tem volta, e uma sessão esquecida aberta não pode bastar para isso.
 *
 * Trava: o administrador não exclui a própria conta (o app ficaria sem
 * administrador e ninguém mais liberaria acessos).
 */

const CABECALHOS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function resposta(corpo: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(corpo), { status, headers: CABECALHOS });
}

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

  const senha = String(corpo.senha ?? "");
  if (!senha) return resposta({ erro: "Informe sua senha para confirmar.", campo: "senha" }, 400);

  const url = Deno.env.get("SUPABASE_URL")!;
  const opcoes = { auth: { autoRefreshToken: false, persistSession: false } };
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, opcoes);

  const { data: sessao, error: erroDoToken } = await admin.auth.getUser(token);
  const usuario = sessao?.user;
  if (erroDoToken || !usuario?.email) {
    return resposta({ erro: "Sua sessão expirou. Entre novamente." }, 401);
  }

  const { data: perfil } = await admin
    .from("perfis")
    .select("papel")
    .eq("id", usuario.id)
    .maybeSingle();

  if (perfil?.papel === "admin") {
    return resposta({ erro: "O administrador não pode excluir a própria conta." }, 403);
  }

  const anonima = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, opcoes);
  const { error: erroDaSenha } = await anonima.auth.signInWithPassword({
    email: usuario.email,
    password: senha,
  });
  if (erroDaSenha) {
    return resposta({ erro: "A senha não confere.", campo: "senha" }, 403);
  }

  // Foto de perfil. Falhar aqui não impede a exclusão.
  try {
    const { data: arquivos } = await admin.storage.from("avatars").list(usuario.id);
    if (arquivos && arquivos.length > 0) {
      await admin.storage.from("avatars").remove(arquivos.map((a) => `${usuario.id}/${a.name}`));
    }
  } catch (erro) {
    console.error("[excluir-conta] fotos:", erro);
  }

  const { error } = await admin.auth.admin.deleteUser(usuario.id);
  if (error) {
    console.error("[excluir-conta]", error.code, error.message);
    return resposta({ erro: "Não foi possível excluir a conta agora. Tente de novo." }, 500);
  }

  return resposta({ ok: true }, 200);
});
