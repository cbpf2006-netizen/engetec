import "server-only";
import { erroDeConsulta } from "./erros";
import { exigirContexto } from "./sessao";

/* =============================================================================
   Administração — leitura

   Lista todas as contas com o e-mail e a data de cadastro, que vivem em
   `auth.users` e não são legíveis pela API. Quem entrega isso é a função
   `admin_listar_usuarios` do Postgres, que recusa quem não é administrador
   (`e_admin()`). A checagem da página é só conforto: a que vale é a do banco.
   ========================================================================== */

export type UsuarioAdmin = {
  id: string;
  nome: string | null;
  email: string;
  telefone: string | null;
  indicado_por: string | null;
  papel: "admin" | "usuario";
  acesso: "pendente" | "liberado";
  email_confirmado: boolean;
  criado_em: string;
  liberado_em: string | null;
};

export async function listarUsuarios(): Promise<UsuarioAdmin[]> {
  const { supabase } = await exigirContexto();

  const { data, error } = await supabase.rpc("admin_listar_usuarios");
  if (error) throw erroDeConsulta("Falha ao carregar usuários", error);

  return (data ?? []) as UsuarioAdmin[];
}
