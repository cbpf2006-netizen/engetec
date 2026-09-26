import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

/* Cadastro sem confirmação por e-mail.
 *
 * Cria a conta já com o e-mail marcado como confirmado (email_confirm: true),
 * usando a chave de serviço, que só existe aqui dentro — nunca chega ao
 * navegador nem ao app. Nenhum e-mail é enviado, então o limite de envio do
 * Supabase não entra na conta.
 *
 * verify_jwt está desligado porque o cadastro é anônimo por natureza (e as
 * chaves "publishable" do projeto não são JWT). Quem protege o que importa é o
 * banco: a conta nasce com acesso PENDENTE e sem papel de administrador, e só o
 * administrador libera. Aqui são aceitos apenas nome, telefone e indicação —
 * papel e acesso jamais vêm do corpo da requisição.
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

  let corpo: Record<string, unknown>;
  try {
    corpo = await req.json();
  } catch {
    return resposta({ erro: "Requisição inválida." }, 400);
  }

  const nome = String(corpo.nome ?? "").trim();
  const email = String(corpo.email ?? "").trim().toLowerCase();
  const senha = String(corpo.senha ?? "");
  const telefone = String(corpo.telefone ?? "").replace(/\D/g, "");
  const indicadoPor = String(corpo.indicado_por ?? "").trim();

  if (nome.length < 2 || nome.length > 60) {
    return resposta({ erro: "Informe seu nome.", campo: "nome" }, 400);
  }
  if (!EMAIL.test(email) || email.length > 254) {
    return resposta({ erro: "Informe um e-mail válido.", campo: "email" }, 400);
  }
  if (!/^\d{10,11}$/.test(telefone)) {
    return resposta({ erro: "Informe o telefone com DDD.", campo: "telefone" }, 400);
  }
  if (senha.length < 8 || senha.length > 72) {
    return resposta({ erro: "A senha precisa de pelo menos 8 caracteres.", campo: "senha" }, 400);
  }
  if (indicadoPor.length > 80) {
    return resposta({ erro: "Quem indicou passou de 80 caracteres.", campo: "indicado_por" }, 400);
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { error } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    // Lido pelo trigger ao_criar_usuario. Só estes três campos.
    user_metadata: { nome, telefone, indicado_por: indicadoPor || null },
  });

  if (error) {
    if (error.code === "email_exists" || /already|registered|exists/i.test(error.message)) {
      return resposta({ erro: "Esse e-mail já tem conta. Entre em vez de se cadastrar.", campo: "email" }, 409);
    }
    if (error.code === "weak_password") {
      return resposta({ erro: "Escolha uma senha mais forte.", campo: "senha" }, 400);
    }
    console.error("[cadastrar]", error.code, error.message);
    return resposta({ erro: "Não foi possível criar a conta agora. Tente de novo." }, 500);
  }

  return resposta({ ok: true }, 201);
});
