import "server-only";

/* =============================================================================
   Chamada às Edge Functions do projeto (`cadastrar`, `alterar-email`)

   Cadastro e troca de e-mail passam por funções que rodam dentro do Supabase
   com a chave de serviço — que só existe lá, nunca neste app nem no navegador.
   É o que permite criar a conta e trocar o e-mail sem mandar e-mail de
   confirmação (e sem o limite de envio do Supabase).

   Devolve sempre um formato só, com a mensagem já pronta para a tela. Nada do
   corpo bruto da resposta vaza para o usuário.
   ========================================================================== */

export type RespostaDaFuncao = { ok: true } | { ok: false; erro: string; campo?: string };

const FALHA_GENERICA = "Não foi possível concluir agora. Tente de novo em instantes.";

export async function chamarFuncao(
  nome: "cadastrar" | "alterar-email",
  corpo: Record<string, unknown>,
  tokenDeSessao?: string
): Promise<RespostaDaFuncao> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !chave) return { ok: false, erro: FALHA_GENERICA };

  try {
    const resposta = await fetch(`${url}/functions/v1/${nome}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: chave,
        ...(tokenDeSessao ? { Authorization: `Bearer ${tokenDeSessao}` } : {}),
      },
      body: JSON.stringify(corpo),
      cache: "no-store",
    });

    if (resposta.ok) return { ok: true };

    const json = (await resposta.json().catch(() => ({}))) as { erro?: unknown; campo?: unknown };
    return {
      ok: false,
      erro: typeof json.erro === "string" ? json.erro : FALHA_GENERICA,
      campo: typeof json.campo === "string" ? json.campo : undefined,
    };
  } catch (erro) {
    console.error(`[raiz] função ${nome}:`, erro);
    return { ok: false, erro: "Não foi possível conectar agora. Tente de novo em instantes." };
  }
}
