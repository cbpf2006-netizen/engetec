import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

/* Remoção de usuário pelo administrador.
 *
 * Serve tanto para remover uma conta com acesso quanto para RECUSAR uma pendente:
 * nos dois casos a conta some, com todos os dados dela (as tabelas apontam para
 * auth.users com ON DELETE CASCADE) e com a foto de perfil.
 *
 * verify_jwt está desligado porque as chaves "publishable" do projeto não são
 * JWT; a autenticação é feita aqui, à mão: o token de sessão é validado por
 * getUser() e o perfil de quem chama precisa ser administrador com acesso
 * liberado. A chave de serviço só existe aqui dentro.
 *
 * Travas: ninguém remove a si mesmo (o administrador ficaria sem conta) e
 * nenhum administrador é removido por aqui.
 */

const CABECALHOS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function resposta(corpo: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(corpo), { status, headers: CABECALHOS });
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

  const alvoId = String(corpo.usuario_id ?? "");
  if (!UUID.test(alvoId)) return resposta({ erro: "Usuário inválido." }, 400);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  // Quem chama, segundo o token.
  const { data: sessao, error: erroDoToken } = await admin.auth.getUser(token);
  const quemChama = sessao?.user;
  if (erroDoToken || !quemChama) {
    return resposta({ erro: "Sua sessão expirou. Entre novamente." }, 401);
  }

  // ...e se é administrador de verdade (lido do banco, não dos metadados).
  const { data: perfilDeQuemChama } = await admin
    .from("perfis")
    .select("papel, acesso")
    .eq("id", quemChama.id)
    .maybeSingle();

  if (perfilDeQuemChama?.papel !== "admin" || perfilDeQuemChama?.acesso !== "liberado") {
    return resposta({ erro: "Você não tem permissão para remover usuários." }, 403);
  }

  if (alvoId === quemChama.id) {
    return resposta({ erro: "Você não pode remover a própria conta." }, 400);
  }

  const { data: alvo } = await admin
    .from("perfis")
    .select("papel")
    .eq("id", alvoId)
    .maybeSingle();

  if (!alvo) return resposta({ erro: "Esse usuário não existe mais." }, 404);
  if (alvo.papel === "admin") {
    return resposta({ erro: "Um administrador não pode ser removido." }, 403);
  }

  // Foto de perfil: apaga os arquivos da pasta do usuário. Falhar aqui não
  // impede a remoção — sobra no máximo um arquivo solto de ~40 KB.
  try {
    const { data: arquivos } = await admin.storage.from("avatars").list(alvoId);
    if (arquivos && arquivos.length > 0) {
      await admin.storage.from("avatars").remove(arquivos.map((a) => `${alvoId}/${a.name}`));
    }
  } catch (erro) {
    console.error("[remover-usuario] fotos:", erro);
  }

  const { error } = await admin.auth.admin.deleteUser(alvoId);
  if (error) {
    console.error("[remover-usuario]", error.code, error.message);
    return resposta({ erro: "Não foi possível remover o usuário agora. Tente de novo." }, 500);
  }

  return resposta({ ok: true }, 200);
});
