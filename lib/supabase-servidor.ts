import "server-only";
import { createClient } from "@supabase/supabase-js";

/* Cliente admin, só para código de servidor (rotas de API e páginas
   do painel). Usa a service role, que ignora RLS — por isso nunca
   pode ser importado por um componente cliente. O acesso ao painel
   já é controlado antes disso, pelo middleware e pela sessão (ver
   lib/auth-painel.ts); não há usuário do Supabase Auth aqui. */
export function clienteServidor() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !chave) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY não configurada. Pegue em Supabase → Project Settings → API → service_role e adicione ao .env.local (e ao ambiente do deploy)."
    );
  }

  return createClient(url, chave, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
